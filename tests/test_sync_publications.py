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
