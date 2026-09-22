#!/usr/bin/env python3
"""
scan.py: find em dashes (and `--`) in the copy a visitor can see on stpnguyen.com.

    python3 scan.py                      # every public page + the JS they load
    python3 scan.py about.html js/x.js   # only these files
    python3 scan.py --json               # machine-readable, one object per hit

What counts as visible copy:
  HTML  text nodes, except inside <script>, <style>, <title>, <code>, <pre>, <template>
        and HTML comments; plus attribute values a person reads or hears (alt,
        aria-label, title, placeholder, data-* copy, meta description / og / twitter).
  JS    string literals only. Comments are skipped; the tokenizer understands
        '', "", ``, // and /* */ and skips regex literals.

Each hit carries a `hint` so the reviewer starts from a guess, never from a verdict:
  glyph        the node is only the dash (an empty-value placeholder in a table or stat)
  attribution  starts with the dash, like "— Jane, Head of Product" under a quote
  label?       short fragments on both sides, no sentence punctuation: likely a separator
  prose        everything else: treat as a sentence
"""
import argparse
import json
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[4]

EM = "—"
# `--` as punctuation, not a CSS custom property (`--rd-ink`) or an arrow/rule (`---`).
DOUBLE = re.compile(r"(?<![-\w(!<])--(?![-\w>])")
DASH = re.compile(r"\u2014|(?<![-\w(!<])--(?![-\w>])")
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
RAW_EM = re.compile(r"—|&mdash;|&#8212;|&#x2014;", re.I)

SKIP_TAGS = {"script", "style", "title", "code", "pre", "template", "svg"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr", "path", "circle", "rect", "line", "polyline", "use"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote", "td",
         "th", "dd", "dt", "caption", "summary", "label", "button", "a", "div", "section",
         "article", "header", "footer", "span", "strong", "em"}
COPY_ATTRS = {"alt", "aria-label", "aria-description", "title", "placeholder", "content"}
META_COPY = re.compile(r"description|og:title|twitter:title", re.I)

VENDOR = re.compile(r"^bootstrap|\.min\.js$|\.map$")


def has_dash(s):
    return EM in s or bool(DOUBLE.search(s))


def squash(s):
    return re.sub(r"\s+", " ", s).strip()


def hint_for(context):
    t = squash(context)
    if t in (EM, "--"):
        return "glyph"
    if t.startswith(EM) or t.startswith("--"):
        return "attribution"
    parts = re.split(r"\s*(?:—|--)\s*", t)
    short = all(len(p.split()) <= 5 for p in parts if p)
    if short and len(t.split()) <= 12 and not re.search(r"[.?!;]", t):
        return "label?"
    return "prose"


class Page(HTMLParser):
    def __init__(self, rel):
        super().__init__(convert_charrefs=True)
        self.rel = rel
        self.stack = []
        self.hits = []

    def _where(self):
        for e in reversed(self.stack):
            if e["tag"] in BLOCK:
                return e
        return self.stack[-1] if self.stack else None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]
        raw = self.get_starttag_text() or ""
        is_meta_copy = tag == "meta" and META_COPY.search(a.get("name", "") + a.get("property", ""))
        for k, v in attrs:
            if not v or not has_dash(v):
                continue
            if k == "content" and not is_meta_copy:
                continue
            if k not in COPY_ATTRS and not k.startswith("data-"):
                continue
            if any(t in SKIP_TAGS for t in (e["tag"] for e in self.stack)) and tag != "meta":
                continue
            m = RAW_EM.search(raw) or DOUBLE.search(raw)
            off = raw[: m.start()].count("\n") if m else 0
            self.hits.append({"file": self.rel, "line": line + off, "kind": f"attr {k}",
                              "where": f"<{tag}{_sel(a)}>", "text": squash(v),
                              "hint": hint_for(v)})
        if tag not in VOID:
            self.stack.append({"tag": tag, "sel": _sel(a), "text": []})

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if any(e["tag"] in SKIP_TAGS for e in self.stack):
            return
        for e in self.stack:
            e["text"].append(data)
        if not has_dash(data):
            return
        line = self.getpos()[0]
        box = self._where()
        idx = [m.start() for m in DASH.finditer(data)]
        for i in idx:
            self.hits.append({"file": self.rel, "line": line + data[:i].count("\n"),
                              "kind": "text", "where": f"<{box['tag']}{box['sel']}>" if box else "",
                              "_box": box, "_node": data})

    def finish(self):
        for h in self.hits:
            if "_box" in h:
                box, node = h.pop("_box"), h.pop("_node")
                ctx = "".join(box["text"]) if box else node
                h["text"] = squash(ctx)
                h["hint"] = hint_for(node if squash(node) in (EM, "--") else ctx)
        return self.hits


def _sel(a):
    s = ""
    if a.get("id"):
        s += "#" + a["id"]
    if a.get("class"):
        s += "." + ".".join(a["class"].split()[:2])
    return s


def scan_html(path):
    p = Page(str(path.relative_to(ROOT)))
    p.feed(path.read_text(encoding="utf-8"))
    p.close()
    return p.finish()


def js_strings(src):
    """Yield (line, literal) for every string literal, skipping comments and regexes."""
    i, n, line = 0, len(src), 1
    prev = ""  # last significant code character, to tell a regex from a division
    while i < n:
        c = src[i]
        if c == "\n":
            line += 1
            i += 1
            continue
        if src.startswith("//", i):
            j = src.find("\n", i)
            i = n if j < 0 else j
            continue
        if src.startswith("/*", i):
            j = src.find("*/", i + 2)
            j = n if j < 0 else j + 2
            line += src.count("\n", i, j)
            i = j
            continue
        if c in "'\"`":
            start_line, j, depth = line, i + 1, 0
            while j < n:
                d = src[j]
                if d == "\\":
                    j += 2
                    continue
                if d == "\n":
                    line += 1
                if c == "`" and src.startswith("${", j):
                    depth += 1
                elif c == "`" and d == "}" and depth:
                    depth -= 1
                elif d == c and not depth:
                    break
                j += 1
            yield start_line, src[i + 1:j]
            i, prev = j + 1, c
            continue
        if c == "/" and (prev == "" or prev in "(,=:[!&|?{};+-*%<>~^"):
            j, in_class = i + 1, False
            while j < n and src[j] != "\n":
                d = src[j]
                if d == "\\":
                    j += 2
                    continue
                if d == "[":
                    in_class = True
                elif d == "]":
                    in_class = False
                elif d == "/" and not in_class:
                    break
                j += 1
            i, prev = j + 1, "/"
            continue
        if not c.isspace():
            prev = c
        i += 1


def scan_js(path):
    rel = str(path.relative_to(ROOT))
    out = []
    for line, lit in js_strings(path.read_text(encoding="utf-8")):
        if not has_dash(lit):
            continue
        # A literal can be a whole HTML fragment; report each dash's own line.
        for m in re.finditer(r"—|(?<![-\w(])--(?![-\w])", lit):
            text = re.sub(r"<[^>]+>", " ", lit)
            out.append({"file": rel, "line": line + lit[:m.start()].count("\n"),
                        "kind": "js string", "where": "", "text": squash(text)[:400],
                        "hint": hint_for(text)})
    return out


def default_targets():
    pages = [ROOT / "index.html", ROOT / "about.html", ROOT / "work.html"]
    pages += sorted(p for p in (ROOT / "case-studies").glob("*.html") if not p.name.startswith("_"))
    pages += sorted((ROOT / "templates").glob("*.html"))
    pages = [p for p in pages if p.exists()]

    js_all = sorted(p for p in (ROOT / "js").glob("*.js") if not VENDOR.search(p.name))
    used, unused = [], []
    for p in js_all:
        # Referenced by a page or by another script (dynamic import, fetch, injection).
        (used if _referenced_elsewhere(p, pages, js_all) else unused).append(p)
    return pages, used, unused


def _referenced_elsewhere(p, pages, js_all):
    for q in pages + js_all:
        if q != p and p.name in q.read_text(encoding="utf-8"):
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--root", help="repo root (default: the portfolio repo this skill lives in)")
    a = ap.parse_args()

    global ROOT
    if a.root:
        ROOT = pathlib.Path(a.root).resolve()

    unused = []
    if a.files:
        paths = [(ROOT / f).resolve() if not pathlib.Path(f).is_absolute() else pathlib.Path(f)
                 for f in a.files]
        pages = [p for p in paths if p.suffix == ".html"]
        js = [p for p in paths if p.suffix == ".js"]
    else:
        pages, js, unused = default_targets()

    raw = []
    for p in pages:
        raw += scan_html(p)
    for p in js:
        raw += scan_js(p)
    # One entry per sentence/attribute, however many dashes it holds.
    hits, seen = [], {}
    for h in raw:
        key = (h["file"], h["kind"], h["where"], h["text"])
        if key in seen:
            seen[key]["dashes"] += 1
            continue
        h["dashes"] = 1
        seen[key] = h
        hits.append(h)

    if a.json:
        json.dump({"hits": hits, "skipped_unreferenced_js": [str(p.relative_to(ROOT)) for p in unused]},
                  sys.stdout, ensure_ascii=False, indent=1)
        print()
        return

    by_hint = {}
    for h in hits:
        by_hint[h["hint"]] = by_hint.get(h["hint"], 0) + 1
    cur = None
    for n, h in enumerate(hits, 1):
        if h["file"] != cur:
            cur = h["file"]
            print(f"\n## {cur}")
        x = f" x{h['dashes']}" if h["dashes"] > 1 else ""
        print(f"  D{n:<3} L{h['line']:<5} [{h['hint']}]{x} {h['kind']} {h['where']}")
        print(f"        {h['text'][:300]}")
    print(f"\n{len(hits)} hits in {len(pages)} pages + {len(js)} scripts  "
          + "  ".join(f"{k}:{v}" for k, v in sorted(by_hint.items())))
    if unused:
        print("skipped (not referenced by any page or script): "
              + ", ".join(p.name for p in unused))


if __name__ == "__main__":
    main()
