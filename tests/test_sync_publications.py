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
