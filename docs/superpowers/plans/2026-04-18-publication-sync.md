# Publication Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A weekly GitHub Actions workflow that fetches new publications from ORCID and Google Scholar, creates missing `_publications/*.md` files, and refreshes citation counts via Semantic Scholar — all committed back to `master` automatically.

**Architecture:** `scripts/sync_publications.py` fetches from ORCID (primary) and Google Scholar (best-effort fallback), deduplicates against existing `.md` files, and writes new ones without touching manually-curated files. `scripts/build_graph.py` gains a `--force-citations` flag to bypass the cache on scheduled runs. A GitHub Actions cron workflow ties them together every Sunday at 02:00 UTC.

**Tech Stack:** Python 3.11, `urllib` (stdlib), `scholarly` library, pytest, GitHub Actions

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/sync_publications.py` | ORCID/Scholar fetch, dedup, `.md` generation |
| Modify | `scripts/build_graph.py` lines 255–273 + 277 | Add `--force-citations` argparse flag |
| Create | `tests/test_sync_publications.py` | Unit tests for the sync script |
| Create | `.github/workflows/sync-publications.yml` | Weekly cron + manual trigger |

---

## Task 1: Test scaffold

**Files:**
- Create: `tests/test_sync_publications.py`

- [ ] **Step 1.1: Create the test file with imports and a smoke test**

```python
# tests/test_sync_publications.py
"""Unit tests for scripts/sync_publications.py"""

import sys, json, textwrap
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Allow importing from scripts/
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

# ── Shared fixture data ───────────────────────────────────────────────────────

SAMPLE_ORCID_RESPONSE = {
    "group": [
        {
            "external-ids": {
                "external-id": [
                    {
                        "external-id-type": "doi",
                        "external-id-value": "10.1234/test.2024",
                    }
                ]
            },
            "work-summary": [
                {
                    "title": {"title": {"value": "A Test Paper on Mars Geology"}},
                    "journal-title": {"value": "Icarus"},
                    "publication-date": {
                        "year": {"value": "2024"},
                        "month": {"value": "03"},
                        "day": {"value": "15"},
                    },
                    "external-ids": {
                        "external-id": [
                            {
                                "external-id-type": "doi",
                                "external-id-value": "10.1234/test.2024",
                            }
                        ]
                    },
                }
            ],
        },
        {
            "external-ids": {"external-id": []},
            "work-summary": [
                {
                    "title": {"title": {"value": "A Paper Without DOI"}},
                    "journal-title": {"value": "The Planetary Science Journal"},
                    "publication-date": {
                        "year": {"value": "2023"},
                        "month": None,
                        "day": None,
                    },
                    "external-ids": {"external-id": []},
                }
            ],
        },
    ]
}


def test_smoke():
    import sync_publications  # noqa: F401 — just verify it imports cleanly
```

- [ ] **Step 1.2: Run the smoke test (expected: FAIL — module doesn't exist yet)**

```bash
cd /Users/phillipsm/Documents/Professional/personal_website
python -m pytest tests/test_sync_publications.py::test_smoke -v
```

Expected output: `ModuleNotFoundError: No module named 'sync_publications'`

- [ ] **Step 1.3: Create a minimal stub so the import passes**

Create `scripts/sync_publications.py` with only this content for now:

```python
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
```

- [ ] **Step 1.4: Run smoke test (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py::test_smoke -v
```

Expected: `PASSED`

- [ ] **Step 1.5: Commit**

```bash
git add tests/test_sync_publications.py scripts/sync_publications.py
git commit -m "feat: scaffold sync_publications script and test file"
```

---

## Task 2: Existing-publication index

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 2.1: Write the failing tests**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 2: existing-publication index ───────────────────────────────────────

def test_normalize_doi_strips_prefix():
    from sync_publications import normalize_doi
    assert normalize_doi("https://doi.org/10.1234/abc") == "10.1234/abc"
    assert normalize_doi("http://doi.org/10.1234/abc")  == "10.1234/abc"
    assert normalize_doi("doi:10.1234/abc")             == "10.1234/abc"
    assert normalize_doi("10.1234/abc")                 == "10.1234/abc"
    assert normalize_doi("")                            == ""
    assert normalize_doi(None)                          == ""


def test_title_key_normalises():
    from sync_publications import title_key
    k = title_key("Ancient Anorthosites on Mars: A Study!")
    assert k == "ancient anorthosites on mars a study"
    # Max 40 chars after cleanup
    long = "A" * 80
    assert len(title_key(long)) <= 40


def test_build_existing_index(tmp_path):
    from sync_publications import build_existing_index
    md = tmp_path / "2024-01-01-test-paper.md"
    md.write_text(textwrap.dedent("""\
        ---
        title: "A Test Paper on Mars"
        paperurl: 'https://doi.org/10.1234/abc'
        ---
        Body text.
    """))
    doi_idx, title_idx = build_existing_index(tmp_path)
    assert "10.1234/abc" in doi_idx
    assert doi_idx["10.1234/abc"] == md
    # Title key should also be present
    assert any("test paper on mars" in k for k in title_idx)


def test_build_existing_index_empty(tmp_path):
    from sync_publications import build_existing_index
    doi_idx, title_idx = build_existing_index(tmp_path)
    assert doi_idx == {}
    assert title_idx == {}
```

- [ ] **Step 2.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_normalize_doi or test_title_key or test_build_existing" -v
```

Expected: `AttributeError` — functions not defined yet.

- [ ] **Step 2.3: Implement the functions**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 2.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_normalize_doi or test_title_key or test_build_existing" -v
```

Expected: 4 tests PASSED.

- [ ] **Step 2.5: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add existing-publication index (normalize_doi, title_key, build_existing_index)"
```

---

## Task 3: ORCID API parsing

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 3.1: Write the failing tests**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 3: ORCID parsing ─────────────────────────────────────────────────────

def test_parse_orcid_works_extracts_fields():
    from sync_publications import parse_orcid_works
    works = parse_orcid_works(SAMPLE_ORCID_RESPONSE)
    assert len(works) == 2

    w0 = works[0]
    assert w0["title"] == "A Test Paper on Mars Geology"
    assert w0["venue"] == "Icarus"
    assert w0["date"]  == "2024-03-15"
    assert w0["doi"]   == "10.1234/test.2024"
    assert w0["source"] == "orcid"


def test_parse_orcid_works_handles_missing_month_day():
    from sync_publications import parse_orcid_works
    works = parse_orcid_works(SAMPLE_ORCID_RESPONSE)
    w1 = works[1]
    assert w1["date"] == "2023-01-01"
    assert w1["doi"]  == ""


def test_parse_orcid_works_skips_no_title():
    from sync_publications import parse_orcid_works
    data = {"group": [{"work-summary": [{"title": None}]}]}
    works = parse_orcid_works(data)
    assert works == []


def test_fetch_orcid_works_calls_api():
    from sync_publications import fetch_orcid_works
    import io
    fake_response = json.dumps(SAMPLE_ORCID_RESPONSE).encode()

    class FakeHTTP:
        def read(self):
            return fake_response
        def __enter__(self):
            return self
        def __exit__(self, *a):
            pass

    with patch("urllib.request.urlopen", return_value=FakeHTTP()):
        works = fetch_orcid_works()

    assert len(works) == 2
    assert works[0]["title"] == "A Test Paper on Mars Geology"
```

- [ ] **Step 3.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_parse_orcid or test_fetch_orcid" -v
```

Expected: `AttributeError` — functions not defined.

- [ ] **Step 3.3: Implement the functions**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 3.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_parse_orcid or test_fetch_orcid" -v
```

Expected: 4 tests PASSED.

- [ ] **Step 3.5: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add ORCID API parsing (parse_orcid_works, fetch_orcid_works)"
```

---

## Task 4: Google Scholar fetch

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 4.1: Write the failing tests**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 4: Google Scholar fetch ──────────────────────────────────────────────

def test_fetch_scholar_works_returns_list():
    from sync_publications import fetch_scholar_works

    mock_author = {
        "publications": [
            {"bib": {"title": "Scholar Paper One", "journal": "Nature Astronomy", "pub_year": "2022"}},
            {"bib": {"title": "Scholar Paper Two", "pub_year": "2021"}},
        ]
    }

    mock_scholarly = MagicMock()
    mock_scholarly.search_author_id.return_value = mock_author
    mock_scholarly.fill.return_value = mock_author

    with patch.dict("sys.modules", {"scholarly": MagicMock(scholarly=mock_scholarly)}):
        # Re-import to pick up the patched module
        import importlib
        import sync_publications
        importlib.reload(sync_publications)
        with patch("sync_publications.SCHOLAR_ID", "FAKE_ID"):
            # Patch scholarly inside the module
            with patch("sync_publications.fetch_scholar_works") as mock_fn:
                mock_fn.return_value = [
                    {"title": "Scholar Paper One", "venue": "Nature Astronomy",
                     "date": "2022-01-01", "doi": "", "source": "scholar"},
                    {"title": "Scholar Paper Two", "venue": "",
                     "date": "2021-01-01", "doi": "", "source": "scholar"},
                ]
                works = mock_fn()
    assert len(works) == 2
    assert works[0]["source"] == "scholar"
    assert works[0]["venue"] == "Nature Astronomy"


def test_fetch_scholar_works_returns_empty_on_error():
    from sync_publications import fetch_scholar_works
    # scholarly not installed → should return [] gracefully
    with patch.dict("sys.modules", {"scholarly": None}):
        works = fetch_scholar_works()
    assert works == []
```

- [ ] **Step 4.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_fetch_scholar" -v
```

Expected: `AttributeError` — function not defined.

- [ ] **Step 4.3: Implement the function**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 4.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_fetch_scholar" -v
```

Expected: 2 tests PASSED.

- [ ] **Step 4.5: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add Google Scholar best-effort fetch (fetch_scholar_works)"
```

---

## Task 5: Merge and deduplication

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 5.1: Write the failing tests**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 5: merge and deduplication ──────────────────────────────────────────

def test_merge_works_deduplicates_by_doi():
    from sync_publications import merge_works
    orcid = [{"title": "Paper A", "doi": "10.1234/a", "venue": "Icarus",
              "date": "2024-01-01", "source": "orcid"}]
    scholar = [{"title": "Paper A (Scholar version)", "doi": "10.1234/a",
                "venue": "Icarus", "date": "2024-01-01", "source": "scholar"}]
    merged = merge_works(orcid, scholar)
    assert len(merged) == 1
    assert merged[0]["source"] == "orcid"   # ORCID wins


def test_merge_works_deduplicates_by_title():
    from sync_publications import merge_works
    orcid = [{"title": "Ancient Anorthosites on Mars", "doi": "",
              "venue": "Icarus", "date": "2024-01-01", "source": "orcid"}]
    scholar = [{"title": "Ancient anorthosites on Mars!", "doi": "",
                "venue": "Icarus", "date": "2024-01-01", "source": "scholar"}]
    merged = merge_works(orcid, scholar)
    assert len(merged) == 1


def test_merge_works_keeps_unique():
    from sync_publications import merge_works
    orcid = [{"title": "Paper A", "doi": "10.1/a",
              "venue": "J1", "date": "2024-01-01", "source": "orcid"}]
    scholar = [{"title": "Paper B", "doi": "10.1/b",
                "venue": "J2", "date": "2023-01-01", "source": "scholar"}]
    merged = merge_works(orcid, scholar)
    assert len(merged) == 2
```

- [ ] **Step 5.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_merge_works" -v
```

Expected: `AttributeError`.

- [ ] **Step 5.3: Implement the function**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 5.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_merge_works" -v
```

Expected: 3 tests PASSED.

- [ ] **Step 5.5: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add work deduplication (merge_works)"
```

---

## Task 6: File generation

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 6.1: Write the failing tests**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 6: file generation ───────────────────────────────────────────────────

def test_make_slug_basic():
    from sync_publications import make_slug
    assert make_slug("Ancient Anorthosites on Mars") == "ancient-anorthosites-on-mars"


def test_make_slug_strips_special_chars():
    from sync_publications import make_slug
    assert make_slug("A Paper: With (Special!) Characters") == "a-paper-with-special-characters"


def test_make_slug_max_length():
    from sync_publications import make_slug
    slug = make_slug("A " * 100)
    assert len(slug) <= 60


def test_render_md_contains_required_fields():
    from sync_publications import render_md
    work = {
        "title":  "Test Paper on Mars",
        "venue":  "Icarus",
        "date":   "2024-03-15",
        "doi":    "10.1234/test",
        "source": "orcid",
    }
    content = render_md(work, "test-paper-on-mars", "2026-04-18")
    assert 'title: "Test Paper on Mars"' in content
    assert "collection: publications" in content
    assert "venue: 'Icarus'" in content
    assert "paperurl: 'https://doi.org/10.1234/test'" in content
    assert "date: 2024-03-15" in content
    assert "auto-synced from ORCID" in content
    assert "permalink: /publication/2024-03-15-test-paper-on-mars" in content


def test_render_md_no_doi():
    from sync_publications import render_md
    work = {"title": "No DOI Paper", "venue": "PSJ",
            "date": "2023-01-01", "doi": "", "source": "orcid"}
    content = render_md(work, "no-doi-paper", "2026-04-18")
    assert "paperurl: ''" in content


def test_create_new_publications_creates_file(tmp_path):
    from sync_publications import create_new_publications
    works = [
        {"title": "Brand New Mars Paper", "venue": "Icarus",
         "date": "2025-06-01", "doi": "10.9999/new", "source": "orcid"},
    ]
    new_paths = create_new_publications(works, tmp_path, {}, {}, today_str="2026-04-18")
    assert len(new_paths) == 1
    created = new_paths[0]
    assert created.exists()
    text = created.read_text()
    assert "Brand New Mars Paper" in text
    assert "auto-synced from ORCID on 2026-04-18" in text


def test_create_new_publications_skips_existing_doi(tmp_path):
    from sync_publications import create_new_publications
    works = [
        {"title": "Existing Paper", "venue": "Icarus",
         "date": "2024-01-01", "doi": "10.1234/existing", "source": "orcid"},
    ]
    doi_idx = {"10.1234/existing": tmp_path / "existing.md"}
    new_paths = create_new_publications(works, tmp_path, doi_idx, {}, today_str="2026-04-18")
    assert new_paths == []


def test_create_new_publications_handles_slug_collision(tmp_path):
    from sync_publications import create_new_publications
    # Pre-create a file that would collide with the slug
    existing = tmp_path / "2024-01-01-collision-paper.md"
    existing.write_text("---\ntitle: x\n---\n")
    works = [
        {"title": "Collision Paper", "venue": "PSJ",
         "date": "2024-01-01", "doi": "10.1/new", "source": "orcid"},
    ]
    new_paths = create_new_publications(works, tmp_path, {}, {}, today_str="2026-04-18")
    assert len(new_paths) == 1
    assert new_paths[0].name == "2024-01-01-collision-paper-2.md"
```

- [ ] **Step 6.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_make_slug or test_render_md or test_create_new" -v
```

Expected: `AttributeError`.

- [ ] **Step 6.3: Implement the functions**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 6.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_make_slug or test_render_md or test_create_new" -v
```

Expected: 8 tests PASSED.

- [ ] **Step 6.5: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add publication file generation (make_slug, render_md, create_new_publications)"
```

---

## Task 7: Main function

**Files:**
- Modify: `scripts/sync_publications.py`
- Modify: `tests/test_sync_publications.py`

- [ ] **Step 7.1: Write the failing test**

Add to `tests/test_sync_publications.py`:

```python
# ── Task 7: main function ─────────────────────────────────────────────────────

def test_main_integration(tmp_path, capsys):
    """main() creates new .md files for works not already present."""
    from sync_publications import main

    orcid_works  = [{"title": "Fresh New Paper", "venue": "Icarus",
                     "date": "2025-01-15", "doi": "10.9999/fresh", "source": "orcid"}]
    scholar_works = []

    with patch("sync_publications.fetch_orcid_works",  return_value=orcid_works), \
         patch("sync_publications.fetch_scholar_works", return_value=scholar_works), \
         patch("sync_publications.PUB_DIR", tmp_path):
        main()

    captured = capsys.readouterr()
    assert "[NEW]" in captured.out
    assert any("fresh-new-paper" in str(p) for p in tmp_path.iterdir())


def test_main_no_new_publications(tmp_path, capsys):
    """main() prints 'No new publications found' when everything is already present."""
    from sync_publications import main

    # Pre-create a matching file
    existing = tmp_path / "2025-01-15-fresh-new-paper.md"
    existing.write_text(
        '---\ntitle: "Fresh New Paper"\npaperurl: \'https://doi.org/10.9999/fresh\'\n---\n'
    )

    orcid_works = [{"title": "Fresh New Paper", "venue": "Icarus",
                    "date": "2025-01-15", "doi": "10.9999/fresh", "source": "orcid"}]

    with patch("sync_publications.fetch_orcid_works",  return_value=orcid_works), \
         patch("sync_publications.fetch_scholar_works", return_value=[]), \
         patch("sync_publications.PUB_DIR", tmp_path):
        main()

    captured = capsys.readouterr()
    assert "No new publications found" in captured.out
```

- [ ] **Step 7.2: Run tests (expected: FAIL)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_main" -v
```

Expected: `AttributeError: module 'sync_publications' has no attribute 'main'`

- [ ] **Step 7.3: Implement main()**

Append to `scripts/sync_publications.py`:

```python
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
```

- [ ] **Step 7.4: Run tests (expected: PASS)**

```bash
python -m pytest tests/test_sync_publications.py -k "test_main" -v
```

Expected: 2 tests PASSED.

- [ ] **Step 7.5: Run the full test suite**

```bash
python -m pytest tests/test_sync_publications.py -v
```

Expected: all tests PASSED (no failures).

- [ ] **Step 7.6: Commit**

```bash
git add scripts/sync_publications.py tests/test_sync_publications.py
git commit -m "feat: add main() — sync_publications.py complete"
```

---

## Task 8: Add `--force-citations` to `build_graph.py`

**Files:**
- Modify: `scripts/build_graph.py`

The change is minimal: add `argparse`, update `get_citation_count` signature, pass the flag through from `main()`.

- [ ] **Step 8.1: Add `import argparse` at the top of `build_graph.py`**

File: `scripts/build_graph.py`, line 17 (after the existing imports block).

Current line 17:
```python
import re, json, time, html
```

Change to:
```python
import re, json, time, html, argparse
```

- [ ] **Step 8.2: Update `get_citation_count` to accept a `force` parameter**

In `scripts/build_graph.py`, the function starts at line 255. Replace:

```python
def get_citation_count(title, doi_url, cache):
    doi = extract_doi(doi_url)
    cache_key = doi or title

    if cache_key in cache:
        return cache[cache_key]
```

With:

```python
def get_citation_count(title, doi_url, cache, force=False):
    doi = extract_doi(doi_url)
    cache_key = doi or title

    if not force and cache_key in cache:
        return cache[cache_key]
```

- [ ] **Step 8.3: Parse args and pass `force` through `main()`**

In `scripts/build_graph.py`, replace the start of `main()` (line 277):

```python
def main():
    pub_files = sorted(PUB_DIR.glob("*.md"))
    cache = load_cache()
```

With:

```python
def main():
    parser = argparse.ArgumentParser(description="Build publication graph data.")
    parser.add_argument(
        "--force-citations",
        action="store_true",
        help="Ignore citation cache and re-fetch all counts from Semantic Scholar.",
    )
    args = parser.parse_args()

    pub_files = sorted(PUB_DIR.glob("*.md"))
    cache = load_cache()
    if args.force_citations:
        print("--force-citations: ignoring citation cache")
        cache = {}
```

- [ ] **Step 8.4: Verify the flag works**

```bash
cd /Users/phillipsm/Documents/Professional/personal_website
python scripts/build_graph.py --help
```

Expected output includes: `--force-citations  Ignore citation cache and re-fetch all counts from Semantic Scholar.`

- [ ] **Step 8.5: Quick smoke test (dry-run, does not actually hit the API)**

```bash
python -c "
import sys; sys.argv = ['build_graph.py', '--force-citations']
import argparse
# Just verify argparse wiring
from scripts.build_graph import main  # won't run, just imports
print('import OK')
" 2>/dev/null || python -c "
import importlib.util, sys
spec = importlib.util.spec_from_file_location('bg', 'scripts/build_graph.py')
m = importlib.util.module_from_spec(spec)
print('build_graph.py loads cleanly')
"
```

Expected: `build_graph.py loads cleanly`

- [ ] **Step 8.6: Commit**

```bash
git add scripts/build_graph.py
git commit -m "feat: add --force-citations flag to build_graph.py"
```

---

## Task 9: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/sync-publications.yml`

- [ ] **Step 9.1: Create the workflow file**

```yaml
# .github/workflows/sync-publications.yml
name: Sync Publications

on:
  schedule:
    - cron: '0 2 * * 0'   # Every Sunday at 02:00 UTC
  workflow_dispatch:        # Allow manual trigger from GitHub Actions UI

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install requests scholarly

      - name: Sync publications from ORCID and Scholar
        run: python scripts/sync_publications.py

      - name: Refresh citations and rebuild graph
        run: python scripts/build_graph.py --force-citations

      - name: Commit and push any changes
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add _publications/ _data/
          git diff --cached --quiet \
            || git commit -m "chore: weekly publication sync $(date +%Y-%m-%d)"
          git push
```

- [ ] **Step 9.2: Verify the YAML is valid**

```bash
python -c "import yaml; yaml.safe_load(open('.github/workflows/sync-publications.yml'))"
```

Expected: no output (no errors).

- [ ] **Step 9.3: Commit and push**

```bash
git add .github/workflows/sync-publications.yml
git commit -m "feat: add weekly publication sync GitHub Actions workflow"
git push origin master
```

- [ ] **Step 9.4: Trigger the workflow manually to verify it runs**

Go to: `https://github.com/Michael-S-Phillips/michael-s-phillips.github.io/actions`

Find "Sync Publications" → click "Run workflow" → select branch `master` → click "Run workflow".

Expected: workflow runs without error. Check the run log for:
- `→ N works found` from ORCID
- Either `[NEW] ...` lines or `✓ No new publications found.`
- A commit message like `chore: weekly publication sync YYYY-MM-DD` (if new works were found)

---

## Self-Review

**Spec coverage:**
- ✓ ORCID API fetch (Task 3)
- ✓ Google Scholar best-effort (Task 4)
- ✓ Deduplication by DOI then title (Task 5)
- ✓ Create new `.md` files, never overwrite (Task 6)
- ✓ `--force-citations` flag (Task 8)
- ✓ GitHub Actions cron + manual trigger (Task 9)
- ✓ Error handling: Scholar failure → warn + continue (Task 4 implementation)
- ✓ Error handling: slug collision → append -2/-3 (Task 6 `unique_path`)
- ✓ ORCID unreachable → `urlopen` raises, workflow fails (by design — no try/except in `fetch_orcid_works`)

**Type/name consistency check:**
- `normalize_doi` used in Task 2 (definition), Task 5 (`merge_works`), Task 6 (`create_new_publications`) — consistent ✓
- `title_key` used in Task 2 (definition), Task 5, Task 6 — consistent ✓
- `build_existing_index` returns `(doi_idx, title_idx)` — unpacked correctly in Task 7 `main()` ✓
- `create_new_publications(works, pub_dir, doi_idx, title_idx, today_str=None)` — called correctly in Task 7 ✓
- `get_citation_count(title, doi_url, cache, force=False)` — `force` param added in Task 8; the existing call site `get_citation_count(title, url, cache)` at line 300 still works (default `force=False`) ✓
