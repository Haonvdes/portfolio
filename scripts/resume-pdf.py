#!/usr/bin/env python3
"""
resume-pdf.py — render the PM resume to a real (text-selectable) PDF.

    python3 scripts/resume-pdf.py              # renders Stephano-Ng-Resume-PM.html
    python3 scripts/resume-pdf.py some.html    # renders another copy (the pre-commit
                                               # hook passes the staged version)

The pre-commit hook in .githooks/ runs this automatically whenever the resume HTML
is part of a commit and stages the new PDF, so there is nothing to remember.

Refuses to write the PDF unless DM Sans actually loaded: in a sandbox that blocks
Google Fonts the page falls back to another face, and that PDF must never ship.
"""
import pathlib
import re
import sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "Stephano-Ng-Resume-PM.html"
OUT = ROOT / "Stephano-Ng-Resume-PM.pdf"

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
    page.pdf(path=str(OUT), prefer_css_page_size=True, print_background=True)
    browser.close()

pages = len(re.findall(rb"/Type\s*/Page[^s]", OUT.read_bytes()))
print(f"resume-pdf: wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB, {pages} pages)")
if pages != 2:
    sys.exit(f"resume-pdf: expected 2 A4 pages, got {pages} — content overflowed")
