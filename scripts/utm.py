#!/usr/bin/env python3
"""
utm.py — tagged links for one job application.

    python3 scripts/utm.py chotot                # medium defaults to "email"
    python3 scripts/utm.py chotot --medium form  # pasted into an application form
    python3 scripts/utm.py "VNG Corp" --medium linkedin

utm_source is the company, so GA4 (Acquisition > Traffic acquisition, "Session source")
and Clarity (filter by the utm_source tag) show which company opened which page.
Use the same company spelling every time; it is lower-cased and hyphenated here.

For the resume PDF sent to the same company:
    python3 scripts/resume-pdf.py --company chotot
"""
import argparse
import re
from urllib.parse import urlencode

BASE = "https://stpnguyen.com"
PAGES = [
    ("Home", "/"),
    ("Resume", "/Stephano-Ng-Resume-PM.html"),
    ("Case studies", "/work.html"),
    ("Customer Engagement", "/case-studies/customer-engagement.html"),
    ("Healthcare", "/case-studies/healthcare.html"),
    ("Web3", "/case-studies/web-3.html"),
    ("Lending", "/case-studies/lending.html"),
]

ap = argparse.ArgumentParser()
ap.add_argument("company")
ap.add_argument("--medium", default="email", help="email, form, linkedin, cv ... (default: email)")
args = ap.parse_args()

company = re.sub(r"[^a-z0-9]+", "-", args.company.lower()).strip("-")
query = urlencode({"utm_source": company, "utm_medium": args.medium})
width = max(len(name) for name, _ in PAGES)
for name, path in PAGES:
    print(f"{name:<{width}}  {BASE}{path}?{query}")
