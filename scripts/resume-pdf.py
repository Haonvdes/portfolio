#!/usr/bin/env python3
"""
resume-pdf.py — render a resume to a real (text-selectable) PDF named after the HTML.

    python3 scripts/resume-pdf.py              # renders Stephano-Ng-Resume-PM.html
    python3 scripts/resume-pdf.py Stephano-Ng-Resume-PD.html
                                               # writes Stephano-Ng-Resume-PD.pdf
    python3 scripts/resume-pdf.py some.html    # renders another copy (the pre-commit
                                               # hook passes the staged version)
    python3 scripts/resume-pdf.py --company chotot
                                               # one-off copy for one application, written to
                                               # ~/Downloads/resume-chotot/ and never into the repo
    python3 scripts/resume-pdf.py --no-cover   # drops the cover-letter sheet: a 2-page resume,
                                               # written to ~/Downloads/<stem>-no-cover.pdf so the
                                               # 3-page PDFs the site links to are never touched

Every stpnguyen.com link inside the PDF gets UTM tags, so a visit that starts from the
PDF shows up in GA4 and Clarity by source: `resume` for the public PDF, the company
name for a --company copy. The HTML itself stays untagged — tagging it would overwrite
the source of a visitor who reached the web resume from somewhere else.

The pre-commit hook in .githooks/ runs this automatically whenever the resume HTML
is part of a commit and stages the new PDF, so there is nothing to remember.

Refuses to write the PDF unless DM Sans actually loaded: in a sandbox that blocks
Google Fonts the page falls back to another face, and that PDF must never ship.
"""
import argparse
import pathlib
import re
import sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("html", nargs="?", default=str(ROOT / "Stephano-Ng-Resume-PM.html"))
ap.add_argument("--company", help="tag links with this company as utm_source and write a separate copy")
ap.add_argument("--no-cover", action="store_true",
                help="render without the cover-letter sheet (2 pages, written outside the repo)")
ap.add_argument("--out", help="PDF path (default: repo PDF, or ~/Downloads/resume-<company>/ with --company)")
args = ap.parse_args()

SRC = pathlib.Path(args.html).resolve()
company = re.sub(r"[^a-z0-9]+", "-", args.company.lower()).strip("-") if args.company else None
suffix = "-no-cover" if args.no_cover else ""
# A no-cover render never writes over the repo PDF: the site's Download button and the
# pre-commit hook both expect the 3-sheet document.
if args.out:
    OUT = pathlib.Path(args.out).expanduser().resolve()
elif company:
    OUT = pathlib.Path.home() / "Downloads" / f"resume-{company}" / f"{SRC.stem}{suffix}.pdf"
elif args.no_cover:
    OUT = pathlib.Path.home() / "Downloads" / f"{SRC.stem}-no-cover.pdf"
else:
    OUT = ROOT / f"{SRC.stem}.pdf"
EXPECTED_PAGES = 2 if args.no_cover else 3
OUT.parent.mkdir(parents=True, exist_ok=True)
UTM = {"utm_source": company or "resume", "utm_medium": "resume_pdf"}

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(SRC.as_uri(), wait_until="networkidle")
    page.emulate_media(media="print")
    fonts_ok = page.evaluate(
        # fonts.check() alone is not enough: it returns true when no DM Sans face
        # is registered at all, which is exactly the blocked-stylesheet case.
        "document.fonts.ready.then(() => [...document.fonts].some("
        "f => f.family.replace(/[\"']/g, '') === 'DM Sans' && f.status === 'loaded'))"
    )
    if not fonts_ok:
        browser.close()
        sys.exit("resume-pdf: DM Sans did not load (offline or fonts blocked) — PDF not written")
    if args.no_cover:
        dropped = page.evaluate(
            "[...document.querySelectorAll('.cv-page')]"
            ".filter(el => el.querySelector('.cv-letter'))"
            ".map(el => (el.remove(), 1)).length"
        )
        if dropped != 1:
            browser.close()
            sys.exit(f"resume-pdf: expected exactly 1 cover-letter sheet, found {dropped}")
    tagged = page.evaluate(
        """utm => {
          let n = 0;
          document.querySelectorAll('a[href*="stpnguyen.com"]').forEach(a => {
            const url = new URL(a.href);
            if (!/(^|\\.)stpnguyen\\.com$/.test(url.hostname)) return;
            Object.entries(utm).forEach(([k, v]) => url.searchParams.set(k, v));
            a.href = url.toString();
            n++;
          });
          return n;
        }""",
        UTM,
    )
    page.pdf(path=str(OUT), prefer_css_page_size=True, print_background=True)
    browser.close()

pages = len(re.findall(rb"/Type\s*/Page[^s]", OUT.read_bytes()))
shown = OUT.relative_to(ROOT) if OUT.is_relative_to(ROOT) else OUT
print(f"resume-pdf: wrote {shown} ({OUT.stat().st_size // 1024} KB, {pages} pages, "
      f"{tagged} links tagged utm_source={UTM['utm_source']})")
if pages != EXPECTED_PAGES:
    what = "2 resume pages" if args.no_cover else "cover letter + 2 resume pages"
    sys.exit(f"resume-pdf: expected {EXPECTED_PAGES} A4 pages ({what}), got {pages} "
             "— content overflowed")
