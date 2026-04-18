#!/usr/bin/env python3
"""
Build publications graph data for the website.

Reads all _publications/*.md files, computes pairwise TF-IDF cosine
similarity, classifies each paper by planetary body and research topic,
and writes _data/publications_graph.json for D3 visualization.

Run from the site root:
    python scripts/build_graph.py
"""

import os, re, json
from pathlib import Path
from math import log, sqrt
from collections import Counter

PUB_DIR  = Path("_publications")
OUT_FILE = Path("_data/publications_graph.json")
THRESHOLD = 0.07   # min similarity to include an edge
MAX_EDGES_PER_NODE = 6  # keeps the graph readable

JOURNAL_VENUES = {
    "Nature Astronomy", "Nature Communications Earth & Environment",
    "Geology", "The Planetary Science Journal", "Icarus",
    "Frontiers in Astronomy and Space Sciences",
    "Earth Surface Processes and Landforms",
    "Science of the Total Environment", "Remote Sensing",
    "Bulletin of the American Astronomical Society", "Astrobiology",
}

# ── Category keyword maps ───────────────────────────────────────────────────

PLANET_KEYWORDS = {
    "mars": [
        "mars", "martian", "crism", "mawrth", "hellas", "isidis", "noachian",
        "hesperian", "amazonian", "tharsis", "vallis", "pre-noachian",
        "crater basin", "mars analog"
    ],
    "mercury": [
        "mercury", "messenger", "hollows", "volatile"
    ],
    "earth": [
        "earth", "analog", "analogue", "chile", "peru", "iceland", "salar",
        "pajonales", "pasco", "terrestrial", "andean", "andes", "cerro"
    ],
}

TOPIC_KEYWORDS = {
    "mineralogy": [
        "feldspathic", "plagioclase", "anorthosite", "feldspar", "crust",
        "mantle", "composition", "mineralogy", "mineral", "differentiation",
        "basalt", "igneous", "petrology", "lithology", "rock", "spectra",
        "spectroscopy", "spectral"
    ],
    "astrobiology": [
        "astrobiology", "biosignature", "life", "habita", "microbial", "microb",
        "biotic", "organism", "biosignature", "prebiotic", "ecology", "salt",
        "brine", "gypsum", "paleo-lake", "lake basin"
    ],
    "remote_sensing": [
        "crism", "hyperspectral", "multispectral", "remote sensing", "orbital",
        "mapping", "imagery", "radiometric", "reflectance", "processing",
        "mosaick", "pipeline", "calibration", "image cube", "orbit"
    ],
    "ai_ml": [
        "artificial intelligence", "machine learning", "deep learning", "neural",
        "automated", "python", "toolbox", "software", "algorithm", "detection",
        "classification", "ai", "ml", "tool"
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
    "provide","provides","providing","including","shows","show","present"
}

# ── Parsing ─────────────────────────────────────────────────────────────────

def parse_frontmatter(filepath):
    """Parse YAML front matter without requiring PyYAML."""
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
            # Strip HTML entities and tags
            v = re.sub(r'&[a-z]+;', ' ', v)
            v = re.sub(r'<[^>]+>', '', v)
            fm[k] = v
    return fm

# ── Categorisation ───────────────────────────────────────────────────────────

def categorize(text):
    low = text.lower()

    planet = "multi"
    for p, kws in PLANET_KEYWORDS.items():
        if any(kw in low for kw in kws):
            planet = p
            break

    scores = {t: sum(1 for kw in kws if kw in low)
              for t, kws in TOPIC_KEYWORDS.items()}
    best = max(scores, key=lambda k: scores[k])
    topic = best if scores[best] > 0 else "other"

    return planet, topic

# ── TF-IDF cosine similarity ─────────────────────────────────────────────────

def tokenize(text):
    tokens = re.findall(r'[a-z]+', text.lower())
    return [t for t in tokens if len(t) > 2 and t not in STOPWORDS]

def tfidf_vectors(docs):
    tokenized = [tokenize(d) for d in docs]
    N = len(docs)
    df = Counter()
    for tokens in tokenized:
        for t in set(tokens):
            df[t] += 1
    vectors = []
    for tokens in tokenized:
        tf = Counter(tokens)
        total = max(len(tokens), 1)
        vec = {t: (c / total) * log((N + 1) / (df[t] + 1) + 1)
               for t, c in tf.items()}
        vectors.append(vec)
    return vectors

def cosine(a, b):
    shared = set(a) & set(b)
    if not shared:
        return 0.0
    dot    = sum(a[t] * b[t] for t in shared)
    norm_a = sqrt(sum(v * v for v in a.values()))
    norm_b = sqrt(sum(v * v for v in b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    pub_files = sorted(PUB_DIR.glob("*.md"))
    nodes, docs = [], []

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

        text           = f"{title} {excerpt}"
        planet, topic  = categorize(text)
        pub_type       = "journal" if venue in JOURNAL_VENUES else "conference"

        nodes.append({
            "id":       f.stem,
            "title":    title,
            "year":     year,
            "venue":    venue,
            "url":      url,
            "planet":   planet,
            "topic":    topic,
            "pub_type": pub_type,
            "excerpt":  excerpt[:220]
        })
        docs.append(text)

    # Similarity matrix
    vectors = tfidf_vectors(docs)
    raw_links = []
    for i in range(len(docs)):
        for j in range(i + 1, len(docs)):
            w = cosine(vectors[i], vectors[j])
            if w >= THRESHOLD:
                raw_links.append((i, j, round(w, 3)))

    # Limit edges per node
    edge_count = Counter()
    links = []
    for i, j, w in sorted(raw_links, key=lambda x: -x[2]):
        if edge_count[i] < MAX_EDGES_PER_NODE and edge_count[j] < MAX_EDGES_PER_NODE:
            links.append({
                "source": nodes[i]["id"],
                "target": nodes[j]["id"],
                "weight": w
            })
            edge_count[i] += 1
            edge_count[j] += 1

    print(f"  {len(nodes)} nodes, {len(links)} edges")
    for p in ("mars","mercury","earth","multi"):
        n = sum(1 for nd in nodes if nd["planet"] == p)
        print(f"  {p}: {n}")

    OUT_FILE.parent.mkdir(exist_ok=True)
    with open(OUT_FILE, "w") as fh:
        json.dump({"nodes": nodes, "links": links}, fh, indent=2)
    print(f"  Written → {OUT_FILE}")

if __name__ == "__main__":
    main()
