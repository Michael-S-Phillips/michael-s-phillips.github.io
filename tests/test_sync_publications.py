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
