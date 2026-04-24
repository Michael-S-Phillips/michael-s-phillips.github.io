#!/usr/bin/env python3
"""
Build publications graph data for the website.

Reads all _publications/*.md files, computes pairwise TF-IDF cosine
similarity, classifies each paper by planetary body and research topic,
fetches citation counts from Semantic Scholar, and writes
_data/publications_graph.json for D3 visualization.

Run from the site root:
    python scripts/build_graph.py

Citation counts are cached in _data/citations_cache.json so subsequent
runs only fetch counts for new papers.
"""

import re, json, time, html, argparse
import urllib.request, urllib.parse
from pathlib import Path
from math import log, sqrt
from collections import Counter

PUB_DIR        = Path("_publications")
OUT_FILE       = Path("_data/publications_graph.json")
CACHE_FILE     = Path("_data/citations_cache.json")
SCHOLAR_ID     = "1DCuzasAAAAJ"
THRESHOLD      = 0.07
MAX_EDGES_PER  = 6
API_DELAY      = 4.0   # seconds between Semantic Scholar requests (public API is strict)

# ── Journal venue list ────────────────────────────────────────────────────────
# Matched case-insensitively after whitespace normalisation.

JOURNAL_VENUES = {
    "Nature", "Nature Astronomy", "Nature Geoscience", "Nature Communications",
    "Nature Communications Earth & Environment", "Nature Communications Earth and Environment",
    "Science", "Science Advances",
    "Proceedings of the National Academy of Sciences", "PNAS",
    "Geology",
    "Geophysical Research Letters",
    "Journal of Geophysical Research", "Journal of Geophysical Research: Planets",
    "JGR: Planets", "JGR Planets",
    "The Planetary Science Journal", "Planetary Science Journal",
    "Icarus",
    "Planetary and Space Science",
    "Earth and Planetary Science Letters",
    "American Mineralogist",
    "Frontiers in Astronomy and Space Sciences",
    "Earth Surface Processes and Landforms",
    "Science of the Total Environment",
    "Remote Sensing",
    "Bulletin of the American Astronomical Society",
    "Astrobiology",
    "ARPHA Conference Abstracts",   # journal-like proceedings
}

# Substring signals identifying a venue as a conference / workshop / abstracts.
# Checked only AFTER the journal whitelist, so e.g. "ARPHA Conference Abstracts"
# (explicit journal) wins over the generic "conference" substring.
CONFERENCE_SIGNALS = (
    "conference",
    "congress",
    "workshop",
    "symposium",
    "meeting abstracts",
    "meeting",            # covers "AGU Fall Meeting", "Copernicus Meetings"
    "proceedings",
    "abstracts",
    "lpi contributions",  # LPI Contributions = LPSC/other abstract volumes
    "absicon",            # AbSciCon
    "lpsc",
)

# Preprint signals — treat as journal-track (pre-peer-review drafts of journal papers).
PREPRINT_VENUE_SIGNALS = (
    "preprint",
    "research square",
    "arxiv",
    "essoar",
    "biorxiv",
    "medrxiv",
)

PREPRINT_URL_SIGNALS = (
    "arxiv.org",
    "essoar",
    "researchsquare.com",
    "biorxiv",
    "medrxiv",
)

# ── Planet keyword SCORES (higher = stronger signal) ──────────────────────────
# Earth/analog is checked with a scoring approach so that papers about
# "Mars analog" environments classify as Earth, not Mars.

EARTH_KEYWORDS = {
    # Strong geographic indicators — clear Earth fieldwork
    "chile": 4, "peru": 4, "iceland": 4, "pajonales": 4, "pasco": 4,
    "atacama": 4, "cerro": 3, "andes": 3, "andean": 3,
    # Analog language
    "mars analog": 3, "mars-analog": 3, "earth analog": 3,
    "terrestrial analog": 3, "terrestrial analogue": 3,
    "mars analogue": 3,
    # Earth surface/volcanic features
    "tumuli": 3, "tumulus": 3, "lava tube": 3, "volcanic field": 2,
    "salar": 3, "salt flat": 2,
    # Weaker signals
    "analog": 1, "analogue": 1, "earth": 1,
}

MARS_KEYWORDS = {
    # Specific Mars places — very strong signal
    "mawrth": 5, "hellas": 4, "isidis": 4, "tharsis": 4,
    "noachian": 4, "hesperian": 4, "amazonian": 4, "pre-noachian": 4,
    # Mars instruments / data products
    "crism": 4, "mola": 3, "hirise": 3, "ctx": 3,
    # General Mars terms
    "martian": 3, "mars": 2,
}

MERCURY_KEYWORDS = {
    "mercury": 5, "messenger": 4, "hollows": 3,
}

TOPIC_KEYWORDS = {
    "mineralogy": [
        "feldspathic", "plagioclase", "anorthosite", "feldspar", "crust",
        "mantle", "composition", "mineralogy", "mineral", "differentiation",
        "basalt", "igneous", "petrology", "lithology", "rock", "spectra",
        "spectroscopy", "spectral",
    ],
    "astrobiology": [
        "astrobiology", "biosignature", "life", "habita", "microbial", "microb",
        "biotic", "organism", "prebiotic", "ecology", "salt", "brine",
        "gypsum", "paleo-lake", "lake basin",
    ],
    "remote_sensing": [
        "crism", "hyperspectral", "multispectral", "remote sensing", "orbital",
        "mapping", "imagery", "radiometric", "reflectance", "processing",
        "mosaick", "pipeline", "calibration", "image cube", "orbit",
    ],
    "ai_ml": [
        "artificial intelligence", "machine learning", "deep learning", "neural",
        "automated", "python", "toolbox", "software", "algorithm", "detection",
        "classification", "ai", "ml", "tool",
    ],
}

STOPWORDS = {
    "a","an","the","and","or","of","to","in","for","on","with","by","at",
    "from","as","is","are","was","were","be","been","being","have","has","had",
    "do","does","did","this","that","these","those","it","its","we","our",
    "their","through","about","which","using","into","via","between","across",
    "during","after","before","under","over","than","more","also","not","no",
    "new","large","study","analysis","results","data","based","approach",
    "method","methods","novel","first","paper","article","research","work",
    "provide","provides","providing","including","shows","show","present",
}

# ── Frontmatter parser ────────────────────────────────────────────────────────

def parse_frontmatter(filepath):
    text = filepath.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    fm = {}
    for line in parts[1].splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            v = html.unescape(v)          # &amp; → &, &lt; → <, etc.
            v = re.sub(r'<[^>]+>', '', v) # strip any remaining HTML tags
            fm[k] = v
    return fm

# ── Categorisation ────────────────────────────────────────────────────────────

def _norm_venue(v):
    """Lowercase, collapse whitespace, strip leading/trailing spaces."""
    return re.sub(r"\s+", " ", (v or "").strip().lower())

_JOURNAL_VENUES_NORM = {_norm_venue(v) for v in JOURNAL_VENUES}

def classify_pub_type(venue, url=""):
    """Classify a publication into 'journal' or 'conference'.

    Priority:
      1. Preprint signals (venue or URL) → 'journal' (preprints are journal-track).
      2. Explicit journal whitelist match → 'journal'.
      3. Conference/abstract/workshop signals → 'conference'.
      4. Fallback: 'conference' (conservative default for missing venue).
    """
    v = _norm_venue(venue)
    u = (url or "").lower()

    # 1. Preprints (pre-peer-review journal drafts)
    if any(sig in v for sig in PREPRINT_VENUE_SIGNALS):
        return "journal"
    if any(sig in u for sig in PREPRINT_URL_SIGNALS):
        return "journal"

    # 2. Known journals (case-insensitive, whitespace-normalised)
    if v and v in _JOURNAL_VENUES_NORM:
        return "journal"

    # 3. Conference signals
    if v and any(sig in v for sig in CONFERENCE_SIGNALS):
        return "conference"

    # 4. Default
    return "conference"

def score_dict(text, kw_dict):
    """Sum scores for all matching keywords in text."""
    low = text.lower()
    return sum(score for kw, score in kw_dict.items() if kw in low)

def categorize(text):
    earth_score   = score_dict(text, EARTH_KEYWORDS)
    mars_score    = score_dict(text, MARS_KEYWORDS)
    mercury_score = score_dict(text, MERCURY_KEYWORDS)

    # Planet: highest score wins; tie → multi
    scores = {"earth": earth_score, "mars": mars_score, "mercury": mercury_score}
    top_score = max(scores.values())
    if top_score == 0:
        planet = "multi"
    else:
        winners = [p for p, s in scores.items() if s == top_score]
        planet = winners[0] if len(winners) == 1 else "multi"

    # Topic: most keyword hits wins
    topic_scores = {t: sum(1 for kw in kws if kw in text.lower())
                    for t, kws in TOPIC_KEYWORDS.items()}
    best = max(topic_scores, key=lambda k: topic_scores[k])
    topic = best if topic_scores[best] > 0 else "other"

    return planet, topic

# ── TF-IDF cosine similarity ──────────────────────────────────────────────────

def tokenize(text):
    tokens = re.findall(r'[a-z]+', text.lower())
    return [t for t in tokens if len(t) > 2 and t not in STOPWORDS]

def tfidf_vectors(docs):
    tokenized = [tokenize(d) for d in docs]
    N = len(docs)
    df = Counter(t for tokens in tokenized for t in set(tokens))
    vectors = []
    for tokens in tokenized:
        tf = Counter(tokens)
        total = max(len(tokens), 1)
        vectors.append({
            t: (c / total) * log((N + 1) / (df[t] + 1) + 1)
            for t, c in tf.items()
        })
    return vectors

def cosine(a, b):
    shared = set(a) & set(b)
    if not shared:
        return 0.0
    dot    = sum(a[t] * b[t] for t in shared)
    norm_a = sqrt(sum(v * v for v in a.values()))
    norm_b = sqrt(sum(v * v for v in b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0

# ── Semantic Scholar citation counts ─────────────────────────────────────────

def extract_doi(url):
    if not url:
        return None
    if "doi.org/" in url:
        return url.split("doi.org/")[-1].strip()
    if url.startswith("10."):
        return url.strip()
    return None

def _title_key(s):
    """Normalize a title for fuzzy comparison and as a cache key."""
    s = re.sub(r"[^a-z0-9 ]+", " ", (s or "").lower())
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _titles_match(a, b, min_prefix=30):
    """True if two titles plausibly refer to the same paper."""
    na, nb = _title_key(a), _title_key(b)
    if not na or not nb:
        return False
    # Strong signal: one starts with the other
    if na.startswith(nb) or nb.startswith(na):
        return True
    # Or a long common prefix (at least 30 normalized chars)
    n = min(len(na), len(nb))
    if n >= min_prefix and na[:n] == nb[:n]:
        return True
    return False

def fetch_citations_by_doi(doi, retries=2):
    """Returns int citation count if paper is found in Semantic Scholar,
    0 if S2 definitively does not have this DOI (404),
    or None on transient errors (caller should not cache)."""
    encoded = urllib.parse.quote(doi, safe="/")
    url = f"https://api.semanticscholar.org/graph/v1/paper/DOI:{encoded}?fields=citationCount"
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "personal-site-graph/1.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
                c = data.get("citationCount")
                return int(c) if c is not None else 0
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None  # unknown to S2 — let title/scholar try
            if e.code == 429 and attempt < retries:
                wait = 10 * (attempt + 1)
                print(f"    [S2/doi] 429, waiting {wait}s...")
                time.sleep(wait)
                continue
            return None
        except Exception:
            return None
    return None

def fetch_citations_by_title(title, retries=2):
    """Returns int citation count for a confident title match, or None."""
    query = urllib.parse.quote(title)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&fields=citationCount,title&limit=5"
    data = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "personal-site-graph/1.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
            break
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries:
                wait = 10 * (attempt + 1)
                print(f"    [S2/title] 429, waiting {wait}s...")
                time.sleep(wait)
                continue
            return None
        except Exception:
            return None
    if data is None:
        return None
    papers = data.get("data", []) or []
    if not papers:
        return None
    for p in papers:
        if _titles_match(title, p.get("title", "")):
            c = p.get("citationCount")
            return int(c) if c is not None else 0
    return None

def fetch_scholar_citation_map():
    """Fetch {normalized_title: citation_count} from Google Scholar for SCHOLAR_ID.

    One bulk fetch per run, used as a fallback when Semantic Scholar can't resolve
    a paper. Returns {} on any failure (scholarly missing, captcha, rate limit).
    """
    try:
        from scholarly import scholarly as _scholarly
    except ImportError:
        print("[WARN] scholarly not installed — skipping Google Scholar fallback")
        return {}
    try:
        print("Fetching Google Scholar citation counts (bulk)...")
        author = _scholarly.search_author_id(SCHOLAR_ID)
        author = _scholarly.fill(author, sections=["publications"])
        out = {}
        for pub in author.get("publications", []):
            bib = pub.get("bib", {}) or {}
            t = bib.get("title", "").strip()
            if not t:
                continue
            out[_title_key(t)] = int(pub.get("num_citations", 0) or 0)
        print(f"  → {len(out)} Scholar entries")
        return out
    except Exception as e:
        print(f"[WARN] Google Scholar fetch failed ({type(e).__name__}: {e})")
        return {}

def load_cache():
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text())
        except Exception:
            pass
    return {}

def save_cache(cache):
    CACHE_FILE.parent.mkdir(exist_ok=True)
    CACHE_FILE.write_text(json.dumps(cache, indent=2))

def _scholar_lookup(scholar_map, title):
    """Return Scholar citation count for a title, matching normalised prefixes."""
    if not scholar_map:
        return None
    key = _title_key(title)
    if key in scholar_map:
        return scholar_map[key]
    # Fuzzy prefix match (Scholar titles sometimes truncate or differ slightly)
    for sk, sv in scholar_map.items():
        if _titles_match(key, sk):
            return sv
    return None

def get_citation_count(title, doi_url, cache, scholar_map=None, force=False):
    """Best-effort citation count. Caches only confirmed values so transient
    API failures don't get frozen as 0.

    Resolution order:
      1. Google Scholar bulk map (fetched once upfront — no rate limit concern).
      2. Semantic Scholar by DOI (if DOI present and Scholar missed).
      3. Semantic Scholar by title (only if nothing else resolved).
    The max of any resolved values is used. S2 title search is the last resort
    because it's rate-limited and error-prone.
    """
    doi = extract_doi(doi_url)
    cache_key = doi or f"title:{_title_key(title)}"

    if not force and cache_key in cache:
        val = cache[cache_key]
        if isinstance(val, int):
            return val
        # Non-int cache entry (legacy / corrupted) — ignore and refetch.

    resolved = []

    # 1. Scholar (free, already fetched in bulk)
    c = _scholar_lookup(scholar_map, title)
    if c is not None:
        resolved.append(c)

    # 2. Semantic Scholar by DOI
    if doi:
        c = fetch_citations_by_doi(doi)
        time.sleep(API_DELAY)
        if c is not None:
            resolved.append(c)

    # 3. Semantic Scholar by title (only if still unresolved — it's slow and flaky)
    if not resolved:
        c = fetch_citations_by_title(title)
        time.sleep(API_DELAY)
        if c is not None:
            resolved.append(c)

    if not resolved:
        # Unknown — do NOT cache 0. Next run will try again.
        return 0

    count = max(resolved)
    cache[cache_key] = count
    save_cache(cache)
    return count

# ── Main ──────────────────────────────────────────────────────────────────────

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
    scholar_map = fetch_scholar_citation_map()
    nodes, docs = [], []

    print(f"Processing {len(pub_files)} publications...")
    for f in pub_files:
        fm = parse_frontmatter(f)
        if not fm.get("title"):
            continue

        title   = fm.get("title", "")
        excerpt = fm.get("excerpt", "")
        date    = str(fm.get("date", "2020-01-01"))
        year    = int(date[:4]) if date[:4].isdigit() else 2020
        venue   = fm.get("venue", "")
        url     = fm.get("paperurl", "")

        text          = f"{title} {excerpt}"
        planet, topic = categorize(text)
        pub_type      = classify_pub_type(venue, url)

        print(f"  {'[cite]':7} {planet:8} {pub_type:10} {title[:55]}")
        citations = get_citation_count(
            title, url, cache,
            scholar_map=scholar_map,
            force=args.force_citations,
        )
        print(f"  {str(citations)+' cites':7} {planet:8} {pub_type:10} {title[:55]}")

        nodes.append({
            "id":        f.stem,
            "title":     title,
            "year":      year,
            "venue":     venue,
            "url":       url,
            "planet":    planet,
            "topic":     topic,
            "pub_type":  pub_type,
            "citations": citations,
            "excerpt":   excerpt[:220],
        })
        docs.append(text)

    # Similarity + edge filtering
    vectors = tfidf_vectors(docs)
    raw_links = [
        (i, j, round(cosine(vectors[i], vectors[j]), 3))
        for i in range(len(docs))
        for j in range(i + 1, len(docs))
        if cosine(vectors[i], vectors[j]) >= THRESHOLD
    ]
    edge_count = Counter()
    links = []
    for i, j, w in sorted(raw_links, key=lambda x: -x[2]):
        if edge_count[i] < MAX_EDGES_PER and edge_count[j] < MAX_EDGES_PER:
            links.append({"source": nodes[i]["id"], "target": nodes[j]["id"], "weight": w})
            edge_count[i] += 1
            edge_count[j] += 1

    print(f"\nSummary: {len(nodes)} nodes, {len(links)} edges")
    for p in ("mars", "earth", "mercury", "multi"):
        print(f"  {p}: {sum(1 for n in nodes if n['planet'] == p)}")
    for t in ("journal", "conference"):
        print(f"  {t}: {sum(1 for n in nodes if n['pub_type'] == t)}")

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(json.dumps({"nodes": nodes, "links": links}, indent=2))
    print(f"\nWritten → {OUT_FILE}")

if __name__ == "__main__":
    main()
