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


# ── Parse existing publications ────────────────────────────────────────────────

def parse_frontmatter(path):
    """Return dict of frontmatter key→value from a Jekyll .md file."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    end = text.find("---", 3)
    if end == -1:
        return {}
    fm = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            fm[key.strip()] = html.unescape(val.strip().strip("'\""))
    return fm


def normalize_doi(raw):
    """Lowercase DOI, strip https://doi.org/ prefix."""
    if not raw:
        return ""
    d = raw.lower().strip()
    for prefix in ("https://doi.org/", "http://doi.org/", "doi:"):
        if d.startswith(prefix):
            return d[len(prefix):]
    return d


def title_key(title):
    """First 40 chars of title, lowercased, only alphanumeric + spaces."""
    clean = re.sub(r"[^a-z0-9 ]", "", title.lower())[:40].strip()
    return re.sub(r"\s+", " ", clean)


def build_existing_index(pub_dir):
    """Return (doi_index, title_index) dicts mapping to Path.

    doi_index:   {normalized_doi: Path}
    title_index: {title_key:      Path}
    """
    doi_idx   = {}
    title_idx = {}
    for f in pub_dir.glob("*.md"):
        fm  = parse_frontmatter(f)
        doi = normalize_doi(fm.get("paperurl", ""))
        tk  = title_key(fm.get("title", ""))
        if doi:
            doi_idx[doi] = f
        if tk:
            title_idx[tk] = f
    return doi_idx, title_idx
