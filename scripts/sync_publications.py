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


# ── File generation ────────────────────────────────────────────────────────────

def make_slug(title):
    """Convert a title to a filesystem-safe hyphenated slug, max 60 chars."""
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:60].rstrip("-")


def render_md(work, slug, today_str):
    """Return the full text content for a new _publications/*.md file."""
    title    = work["title"].replace('"', "&quot;").replace("'", "&apos;")
    venue    = (work.get("venue") or "").replace("&", "&amp;")
    doi      = work.get("doi", "")
    doi_url  = f"https://doi.org/{doi}" if doi else ""
    date_str = work.get("date", "2020-01-01")[:10]
    year     = date_str[:4]

    paper_url_line = f"paperurl: '{doi_url}'"
    if venue:
        citation = (
            f"citation: 'Phillips, M.S., et al. ({year}). "
            f"&quot;{title}.&quot; <i>{venue}</i>.'"
        )
    else:
        citation = f"citation: 'Phillips, M.S., et al. ({year}). &quot;{title}.&quot;'"

    body_link = f"[{work['title']}]({doi_url})" if doi_url else work["title"]

    return (
        f'---\n'
        f'title: "{title}"\n'
        f'collection: publications\n'
        f'permalink: /publication/{date_str}-{slug}\n'
        f"excerpt: ''\n"
        f'date: {date_str}\n'
        f"venue: '{venue}'\n"
        f'{paper_url_line}\n'
        f'{citation}\n'
        f'---\n'
        f'<!-- auto-synced from ORCID on {today_str} —'
        f' please fill in excerpt and verify citation -->\n\n'
        f'{body_link}\n\n'
        f'Recommended citation: Phillips, M.S., et al. ({year}). '
        f'"{work["title"]}." <i>{venue}</i>.\n'
    )


def unique_path(pub_dir, date_str, slug):
    """Return a Path that does not exist, appending -2/-3 as needed."""
    base = pub_dir / f"{date_str}-{slug}.md"
    if not base.exists():
        return base
    for n in range(2, 20):
        candidate = pub_dir / f"{date_str}-{slug}-{n}.md"
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"Cannot find unique path for slug '{slug}'")


def create_new_publications(works, pub_dir, doi_idx, title_idx, today_str=None):
    """Write .md files for works not already in doi_idx or title_idx.

    Returns list of Path objects for every file created.
    Existing files are never modified.
    """
    today_str = today_str or str(date.today())
    new_paths = []
    for work in works:
        ndoi = normalize_doi(work.get("doi", ""))
        tk   = title_key(work.get("title", ""))

        if ndoi and ndoi in doi_idx:
            continue
        if tk and tk in title_idx:
            continue

        date_str = work.get("date", "2020-01-01")[:10]
        slug     = make_slug(work["title"])
        path     = unique_path(pub_dir, date_str, slug)
        content  = render_md(work, slug, today_str)
        path.write_text(content, encoding="utf-8")
        print(f"[NEW] {path.name}  ← {work['title'][:65]}")
        new_paths.append(path)
    return new_paths


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("── Syncing publications ──────────────────────────────────────")
    print(f"ORCID: {ORCID_ID}  |  Scholar: {SCHOLAR_ID}")
    print()

    print("Fetching ORCID works...")
    orcid_works = fetch_orcid_works()
    print(f"  → {len(orcid_works)} works found")

    print("Fetching Google Scholar publications (best-effort)...")
    scholar_works = fetch_scholar_works()
    print(f"  → {len(scholar_works)} works found")

    all_works = merge_works(orcid_works, scholar_works)
    print(f"  → {len(all_works)} unique after merge")
    print()

    doi_idx, title_idx = build_existing_index(PUB_DIR)
    print(f"Existing publications: {len(doi_idx)} indexed by DOI, "
          f"{len(title_idx)} by title")
    print()

    new_paths = create_new_publications(all_works, PUB_DIR, doi_idx, title_idx)

    if new_paths:
        print(f"\n✓ Created {len(new_paths)} new publication file(s).")
    else:
        print("✓ No new publications found.")

    print()
    print("Next step: python scripts/build_graph.py --force-citations")


if __name__ == "__main__":
    main()
