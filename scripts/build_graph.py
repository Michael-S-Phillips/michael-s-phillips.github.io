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
THRESHOLD      = 0.07
MAX_EDGES_PER  = 6
API_DELAY      = 1.2   # seconds between Semantic Scholar requests (1 RPS limit)

# ── Journal venue list ────────────────────────────────────────────────────────

JOURNAL_VENUES = {
    "Nature Astronomy",
    "Nature Communications Earth & Environment",
    "Geology",
    "The Planetary Science Journal",
    "Icarus",
    "Frontiers in Astronomy and Space Sciences",
    "Earth Surface Processes and Landforms",
    "Science of the Total Environment",
    "Remote Sensing",
    "Bulletin of the American Astronomical Society",
    "Astrobiology",
    "ARPHA Conference Abstracts",   # journal-like proceedings
}

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

def fetch_citations_by_doi(doi):
    # Keep DOI slashes intact — Semantic Scholar requires unencoded path separators
    encoded = urllib.parse.quote(doi, safe="/")
    url = f"https://api.semanticscholar.org/graph/v1/paper/DOI:{encoded}?fields=citationCount"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "personal-site-graph/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            return data.get("citationCount")
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print(f"    rate limited, waiting 10s...")
            time.sleep(10)
            return fetch_citations_by_doi(doi)  # one retry
        return None
    except Exception:
        return None

def fetch_citations_by_title(title):
    query = urllib.parse.quote(title)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&fields=citationCount,title&limit=3"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "personal-site-graph/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read())
            papers = data.get("data", [])
            if not papers:
                return None
            # Verify the title roughly matches
            title_low = title.lower()
            for p in papers:
                s2_title = p.get("title", "").lower()
                # Require first 30 chars to match
                if title_low[:30] in s2_title or s2_title[:30] in title_low:
                    return p.get("citationCount")
            return None
    except Exception:
        return None

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

def get_citation_count(title, doi_url, cache, force=False):
    doi = extract_doi(doi_url)
    cache_key = doi or title

    if not force and cache_key in cache:
        return cache[cache_key]

    count = None
    if doi:
        count = fetch_citations_by_doi(doi)
        time.sleep(API_DELAY)
    if count is None:
        count = fetch_citations_by_title(title)
        time.sleep(API_DELAY)

    count = count or 0
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
        pub_type      = "journal" if venue in JOURNAL_VENUES else "conference"

        print(f"  {'[cite]':7} {planet:8} {pub_type:10} {title[:55]}")
        citations = get_citation_count(title, url, cache, force=args.force_citations)
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
