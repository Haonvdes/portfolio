#!/usr/bin/env python3
"""
shot.py — render any portfolio page headlessly and save screenshots.

    python3 scripts/shot.py case-studies/healthcare.html
    python3 scripts/shot.py index.html --widths 390 1440
    python3 scripts/shot.py case-studies/lending.html --out /tmp/shots

Written for the Linux sandbox, where getting a browser to run at all takes
three workarounds. Each is load-bearing; none is obvious from the error it
produces.

1. libXdamage.so.1 is missing and apt is 403 through the proxy, so it cannot be
   installed. build_stub() compiles four no-op symbols instead — Chromium links
   them but never calls them headless. Without it: "Host system is missing
   dependencies", which reads like a Playwright problem and is not.

2. `playwright install chromium` downloads the full browser but stalls on the
   headless shell, so p.chromium.launch() fails even though the binary is on
   disk. Pass executable_path explicitly.

3. The page MUST be served over HTTP, and the server must live in this same
   process. js/script.js fetches templates/nav.html and footer.html; under
   file:// those are CORS-blocked and the nav and footer render empty, which
   looks exactly like a CSS bug and is not one. Backgrounded servers from a
   previous shell call are already dead by the time this runs.

Known limits of a sandbox render, so you don't chase ghosts:
  - Google Fonts and the CDNs are proxy-blocked. DM Sans falls back to a wider
    face, so line breaks and ragged-right edges differ from a real browser.
    Geometry (left edges, overflow, whether a block rendered at all) is
    trustworthy. Typographic judgement is not.
  - Swiper and AOS come from a CDN, so anything depending on them is inert.
  - 404s for assets that are not staged locally are noise, not findings.
"""

import argparse
import os
import subprocess
import sys
import tempfile
import threading
import functools
import http.server
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUB_DIR = "/tmp/stublib"
STUB_SRC = r"""
int XDamageQueryExtension(void *d, int *a, int *b) { (void)d;(void)a;(void)b; return 0; }
unsigned long XDamageCreate(void *d, unsigned long dr, int l) { (void)d;(void)dr;(void)l; return 0; }
void XDamageDestroy(void *d, unsigned long dm) { (void)d;(void)dm; }
void XDamageSubtract(void *d, unsigned long dm, unsigned long r, unsigned long p) { (void)d;(void)dm;(void)r;(void)p; }
"""


def build_stub():
    """Compile the libXdamage stand-in if it isn't already there."""
    lib = os.path.join(STUB_DIR, "libXdamage.so.1")
    if os.path.exists(lib):
        return lib
    os.makedirs(STUB_DIR, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".c", delete=False) as f:
        f.write(STUB_SRC)
        src = f.name
    subprocess.run(["gcc", "-shared", "-fPIC", "-o", lib, src], check=True)
    return lib


def find_chrome():
    """Locate the downloaded Chromium. Prefer the full browser over the
    headless shell, whose download tends to stall at 0%."""
    base = os.path.expanduser("~/.cache/ms-playwright")
    for d in sorted(os.listdir(base), reverse=True):
        if d.startswith("chromium-"):
            p = os.path.join(base, d, "chrome-linux", "chrome")
            if os.path.exists(p):
                return p
    raise SystemExit("No Chromium found. Run: python3 -m playwright install chromium")


def serve(port):
    """Static server on a daemon thread, alive for this process only."""
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)

    class Quiet(socketserver.TCPServer):
        allow_reuse_address = True

    httpd = Quiet(("127.0.0.1", port), handler)
    httpd.RequestHandlerClass.log_message = lambda *a, **k: None
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page", help="path relative to portfolio/, e.g. case-studies/healthcare.html")
    ap.add_argument("--widths", nargs="+", type=int, default=[1440, 768, 390])
    ap.add_argument("--out", default="/tmp/shots")
    ap.add_argument("--port", type=int, default=8899)
    ap.add_argument("--full", action="store_true", help="full-page instead of viewport")
    args = ap.parse_args()

    os.environ["LD_LIBRARY_PATH"] = STUB_DIR + ":" + os.environ.get("LD_LIBRARY_PATH", "")
    os.environ["PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS"] = "1"
    build_stub()

    from playwright.sync_api import sync_playwright

    os.makedirs(args.out, exist_ok=True)
    serve(args.port)
    url = f"http://127.0.0.1:{args.port}/{args.page.lstrip('/')}"
    slug = os.path.basename(args.page).replace(".html", "")
    written = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=find_chrome(),
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        )
        for w in args.widths:
            page = browser.new_page(viewport={"width": w, "height": 1000})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(url, wait_until="networkidle", timeout=45000)
            page.wait_for_timeout(1200)
            path = os.path.join(args.out, f"{slug}_{w}.png")
            page.screenshot(path=path, full_page=args.full)
            height = page.evaluate("document.documentElement.scrollHeight")
            overflow = page.evaluate(
                "document.documentElement.scrollWidth > window.innerWidth + 1"
            )
            written.append(path)
            flag = "  ⚠ H-SCROLL" if overflow else ""
            print(f"{w:>5}px  h={height:<6} {path}{flag}")
            for e in errors[:3]:
                print(f"         JS ERROR: {e[:110]}")
            page.close()
        browser.close()

    print("\n".join(["", "Wrote:"] + [f"  {p}" for p in written]))


if __name__ == "__main__":
    main()
