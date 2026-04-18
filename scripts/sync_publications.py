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


# ── ORCID API ──────────────────────────────────────────────────────────────────

def parse_orcid_works(data):
    """Parse ORCID /works JSON into a flat list of work dicts."""
    works = []
    for group in data.get("group", []):
        summaries = group.get("work-summary", [])
        if not summaries:
            continue
        s = summaries[0]

        # Title (required — skip if absent)
        try:
            title = s["title"]["title"]["value"]
            if not title:
                continue
        except (KeyError, TypeError):
            continue

        # Journal / venue
        jt    = s.get("journal-title")
        venue = jt["value"] if jt and jt.get("value") else ""

        # Publication date — fill missing month/day with "01"
        pd    = s.get("publication-date") or {}
        year  = (pd.get("year")  or {}).get("value") or "2020"
        month = (pd.get("month") or {}).get("value") or "01"
        day   = (pd.get("day")   or {}).get("value") or "01"
        pub_date = f"{year}-{str(month).zfill(2)}-{str(day).zfill(2)}"

        # DOI — check work-summary external-ids first, then group-level
        doi = ""
        for id_source in [
            (s.get("external-ids")     or {}).get("external-id", []),
            (group.get("external-ids") or {}).get("external-id", []),
        ]:
            for eid in id_source:
                if eid.get("external-id-type") == "doi":
                    doi = eid.get("external-id-value", "")
                    break
            if doi:
                break

        works.append({
            "title":  title,
            "venue":  venue,
            "date":   pub_date,
            "doi":    doi,
            "source": "orcid",
        })
    return works


def fetch_orcid_works():
    """Fetch work summaries from ORCID public API. Returns list of work dicts."""
    req = urllib.request.Request(
        ORCID_API,
        headers={
            "Accept":     "application/json",
            "User-Agent": "personal-site-sync/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    return parse_orcid_works(data)


# ── Google Scholar ─────────────────────────────────────────────────────────────

def fetch_scholar_works():
    """Fetch publications from Google Scholar via scholarly. Best-effort.

    Returns an empty list (with a warning) if scholarly is unavailable,
    rate-limited, or throws any other exception.
    """
    try:
        from scholarly import scholarly as _scholarly
        author = _scholarly.search_author_id(SCHOLAR_ID)
        author = _scholarly.fill(author, sections=["publications"])
        works = []
        for pub in author.get("publications", []):
            bib   = pub.get("bib", {})
            title = bib.get("title", "").strip()
            if not title:
                continue
            year = str(bib.get("pub_year", "2020"))
            works.append({
                "title":  title,
                "venue":  bib.get("journal", bib.get("venue", "")),
                "date":   f"{year}-01-01",
                "doi":    "",
                "source": "scholar",
            })
        return works
    except Exception as e:
        print(f"[WARN] Google Scholar fetch failed ({type(e).__name__}: {e}); skipping.")
        return []


# ── Merge & deduplicate ────────────────────────────────────────────────────────

def merge_works(orcid_works, scholar_works):
    """Merge two work lists, deduplicating by DOI then title key.

    ORCID entries take precedence (appear first in the combined list).
    Scholar entries are added only if not already represented.
    """
    seen_doi   = set()
    seen_title = set()
    merged = []
    for w in orcid_works + scholar_works:
        ndoi = normalize_doi(w.get("doi", ""))
        tk   = title_key(w.get("title", ""))
        if ndoi and ndoi in seen_doi:
            continue
        if tk and tk in seen_title:
            continue
        if ndoi:
            seen_doi.add(ndoi)
        if tk:
            seen_title.add(tk)
        merged.append(w)
    return merged
