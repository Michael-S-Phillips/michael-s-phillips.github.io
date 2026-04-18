#!/usr/bin/env python3
"""
Sync publications from ORCID and Google Scholar.

Fetches the researcher's public works from ORCID API and (best-effort)
Google Scholar, creates new _publications/*.md files for any works not
already present, then exits. Run citation refresh separately:

    python scripts/build_graph.py --force-citations

Run from the site root:
    python scripts/sync_publications.py
"""

import re, json, html, sys, time
import urllib.request, urllib.parse
from pathlib import Path
from datetime import date

ORCID_ID   = "0000-0001-8873-2238"
SCHOLAR_ID = "1DCuzasAAAAJ"
PUB_DIR    = Path("_publications")
ORCID_API  = f"https://pub.orcid.org/v3.0/{ORCID_ID}/works"
