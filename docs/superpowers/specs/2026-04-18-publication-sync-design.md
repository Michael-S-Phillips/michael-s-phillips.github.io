# Publication Auto-Sync Design
*2026-04-18*

## Goal

A weekly automated pipeline that keeps `_publications/*.md` in sync with the
researcher's public ORCID record, refreshes citation counts via Semantic
Scholar, and commits any changes back to `master` — all without touching
manually-curated files.

---

## Architecture

```
ORCID Public API  ──┐
                    ├──► sync_publications.py ──► _publications/*.md  (new only)
Google Scholar      │
(scholarly, best-  ─┘
 effort fallback)
                         build_graph.py ──────► _data/citations_cache.json
                         --force-citations      _data/publications_graph.json

                    Both scripts called sequentially by:
                    GitHub Actions cron (weekly) → commit + push
```

Two scripts, one workflow:

| File | Purpose |
|---|---|
| `scripts/sync_publications.py` | Fetch new works from ORCID/Scholar, create missing `.md` files, refresh citation cache |
| `scripts/build_graph.py` | Existing — extended with `--force-citations` flag |
| `.github/workflows/sync-publications.yml` | Weekly cron: run sync → run build_graph → commit |

---

## Data Sources

### ORCID Public API (primary)
- Endpoint: `GET https://pub.orcid.org/v3.0/0000-0001-8873-2238/works`
- No authentication required for public profiles
- Returns work summaries with: title, journal title, publication date, DOI (external ID), put-code
- Reliable, structured, researcher-curated

### Google Scholar via `scholarly` (supplementary, best-effort)
- `scholarly.search_author_id("1DCuzasAAAAJ")` → fills publication list
- Provides: title, journal, year, citation count
- Unreliable in CI (CAPTCHAs, rate limits) → wrapped in `try/except`; if it fails, log a warning and continue
- Used only to catch papers not yet on ORCID; citations come from Semantic Scholar regardless

### Semantic Scholar API (citation counts)
- Already implemented in `build_graph.py`
- Extended with `--force-citations` flag that ignores the existing cache and re-fetches all counts
- 1 RPS rate limit respected (1.2 s delay already in place)

---

## `sync_publications.py` Behaviour

### Step 1 — Build existing-publication index
Scan `_publications/*.md`, parse frontmatter, extract DOI and title for each.
Build a lookup dict: `{normalized_doi: filepath}` and `{title_key: filepath}`.
`normalized_doi` = DOI string lowercased, with `https://doi.org/` prefix stripped.
`title_key` = first 40 chars of title, lowercased, punctuation removed.

### Step 2 — Fetch ORCID works
Request `https://pub.orcid.org/v3.0/0000-0001-8873-2238/works` with
`Accept: application/json`. Parse the `group` array; for each group take the
first `work-summary`. Extract: title, journal title, pub date (year/month/day),
DOI from `external-ids`, put-code.

### Step 3 — Fetch Google Scholar works (best-effort)
Call `scholarly.search_author_id` + `scholarly.fill`. Catch all exceptions.
Merge results with ORCID list; deduplicate by DOI then title key.

### Step 4 — Create missing `.md` files
For each work not matched in Step 1:
- Generate slug from title (lowercase, spaces→hyphens, strip non-alphanumeric)
- Filename: `YYYY-MM-DD-<slug>.md`
- Write frontmatter (see schema below)
- Write minimal markdown body
- Print `[NEW] <title>` to stdout

Existing `.md` files are **never overwritten** — manual curation is preserved.

### Step 5 — Exit; let the workflow handle the rest
`sync_publications.py` exits after creating new `.md` files. The GitHub Actions
workflow then calls `build_graph.py --force-citations` as a separate step,
which re-fetches all citation counts from Semantic Scholar (ignoring cache)
and rebuilds `_data/publications_graph.json`.

---

## New `.md` File Schema

```yaml
---
title: "<title from ORCID>"
collection: publications
permalink: /publication/YYYY-MM-DD-<slug>
excerpt: ''
date: YYYY-MM-DD
venue: '<journal title from ORCID>'
paperurl: 'https://doi.org/<doi>'
citation: '<Author list> (YYYY). "<Title>." <i>Journal</i>.'
---
<!-- auto-synced from ORCID on YYYY-MM-DD — fill in excerpt and citation details -->

[<title>](<doi url>)
```

Fields that require manual polish (`excerpt`, formatted `citation`) are left
minimal with a comment. The `teaser` field is omitted (images are always
added manually).

---

## `build_graph.py` Extension

Add `--force-citations` CLI flag:

```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--force-citations", action="store_true",
                    help="Ignore citation cache and re-fetch all counts")
args = parser.parse_args()

# In get_citation_count():
if not args.force_citations and cache_key in cache:
    return cache[cache_key]
```

---

## GitHub Actions Workflow

File: `.github/workflows/sync-publications.yml`

```yaml
name: Sync Publications

on:
  schedule:
    - cron: '0 2 * * 0'   # Sunday 02:00 UTC
  workflow_dispatch:        # manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Install deps
        run: pip install requests scholarly
      - name: Sync publications
        run: python scripts/sync_publications.py
      - name: Rebuild graph (with citation refresh)
        run: python scripts/build_graph.py --force-citations
      - name: Commit changes
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add _publications/ _data/
          git diff --cached --quiet || git commit -m "chore: weekly publication sync $(date +%Y-%m-%d)"
          git push
```

---

## Error Handling

| Failure | Behaviour |
|---|---|
| ORCID API unreachable | Script exits with error; workflow fails; no changes committed |
| Google Scholar blocked | Warning printed; Scholar results skipped; ORCID results still processed |
| Semantic Scholar rate-limited (429) | Existing retry logic in `build_graph.py` handles it |
| Duplicate slug collision | Append `-2`, `-3`, etc. to filename |
| Malformed ORCID record | Skip that work, print warning, continue |

---

## What This Does NOT Do

- Does not modify existing `.md` files (manual curation preserved)
- Does not update `venue`, `title`, or `paperurl` in existing files (even if ORCID has corrections)
- Does not fetch full abstracts (ORCID API doesn't reliably provide them)
- Does not push to GitHub Pages separately — the existing Pages deploy-from-master config handles that

---

## File Changes Summary

| Action | File |
|---|---|
| Create | `scripts/sync_publications.py` |
| Modify | `scripts/build_graph.py` (add `--force-citations` flag) |
| Create | `.github/workflows/sync-publications.yml` |
| Possibly create | `_publications/*.md` (new papers discovered) |
| Update | `_data/citations_cache.json` |
| Update | `_data/publications_graph.json` |
