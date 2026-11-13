---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: false
banner:
  image: /assets/images/banners/field-eltatio-channels.jpg
  eyebrow: "Research output"
  subtitle: "Journal articles, conference abstracts, and open-source software"
  position: "center 50%"
  caption: "Hot-spring outflow channels, El Tatio geyser field, Chile · drone, 61 m"
---

<style>
/* ── View toggle ──────────────────────────────────────────────── */

.pub-view-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 1.4em 0 2em;
  background: var(--global-code-background-color, #10131a);
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 4px;
  width: fit-content;
  overflow: hidden;
}

.pub-toggle-btn {
  background: transparent;
  border: none;
  color: var(--global-text-color-light, #6b7a96);
  font-family: 'Jost', sans-serif;
  font-size: 0.75em;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.55em 1.3em;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.45em;
}

.pub-toggle-btn:hover {
  color: var(--parchment, #e4ddd4);
  background: rgba(255,255,255,0.04);
}

.pub-toggle-btn.active {
  background: rgba(224,123,57,0.12);
  color: var(--mars-ochre, #e07b39);
}

.pub-toggle-btn + .pub-toggle-btn {
  border-left: 1px solid var(--global-border-color, #1e2330);
}

/* ── Graph view ───────────────────────────────────────────────── */

#view-graph {
  margin-top: 0.5em;
}

.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 0.9em 1.6em;
  margin-bottom: 0.8em;
  flex-wrap: wrap;
}

.graph-toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.7em;
}

.graph-toolbar-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--global-text-color-light, #6b7a96);
}

.graph-color-btns {
  display: flex;
  gap: 0;
  background: var(--global-code-background-color, #10131a);
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 3px;
  overflow: hidden;
}

.graph-color-btn {
  background: transparent;
  border: none;
  color: var(--global-text-color-light, #6b7a96);
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  font-weight: 400;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 0.4em 1em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.graph-color-btn + .graph-color-btn {
  border-left: 1px solid var(--global-border-color, #1e2330);
}

.graph-color-btn:hover {
  color: var(--parchment, #e4ddd4);
}

.graph-color-btn.active {
  background: rgba(224,123,57,0.1);
  color: var(--mars-ochre, #e07b39);
}

.graph-search-group {
  flex: 1 1 15em;
  justify-content: flex-end;
}

#pub-graph-search {
  width: 100%;
  max-width: 19em;
  background: var(--global-code-background-color, #10131a);
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 3px;
  color: var(--parchment, #e4ddd4);
  font-family: 'Jost', sans-serif;
  font-size: 0.78em;
  padding: 0.45em 0.8em;
  margin: 0;
  box-shadow: none;
}

#pub-graph-search:focus {
  outline: none;
  border-color: rgba(224,123,57,0.55);
}

#pub-graph-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66em;
  color: var(--global-text-color-light, #6b7a96);
  white-space: nowrap;
  min-width: 0;
}

.graph-filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-bottom: 0.9em;
}

.graph-filter-row .graph-toolbar-label {
  margin-right: 0.2em;
}

.graph-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  background: transparent;
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 999px;
  color: var(--global-text-color-light, #6b7a96);
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  letter-spacing: 0.03em;
  padding: 0.28em 0.8em;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.2s ease;
}

.graph-chip.active {
  color: var(--parchment, #e4ddd4);
  border-color: rgba(228,221,212,0.25);
  opacity: 1;
}

.graph-chip:hover { opacity: 1; }

.graph-chip-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  color: var(--global-text-color-light, #6b7a96);
}

#pub-graph-container {
  width: 100%;
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 3px;
  background: rgba(7, 9, 14, 0.6);
  overflow: hidden;
  position: relative;
}

#pub-graph-container svg {
  display: block;
  cursor: grab;
}

#pub-graph-container svg:active { cursor: grabbing; }

/* Graph marks */

#pub-graph-container .graph-link {
  stroke: rgba(255,255,255,0.09);
  transition: opacity 0.25s ease, stroke-opacity 0.25s ease;
}
#pub-graph-container .graph-link.is-dim    { opacity: 0.25; }
#pub-graph-container .graph-link.is-hot    { stroke-opacity: 0.85; opacity: 1; }
#pub-graph-container .graph-link.is-hidden { opacity: 0; }
#pub-graph-container.layout-timeline .graph-link:not(.is-hot) { opacity: 0; }

#pub-graph-container .graph-node {
  cursor: pointer;
  transition: opacity 0.25s ease;
}
#pub-graph-container.layout-timeline .graph-node { cursor: pointer; }
#pub-graph-container .graph-node.is-dim    { opacity: 0.17; }
#pub-graph-container .graph-node.is-hidden { opacity: 0.04; pointer-events: none; }
#pub-graph-container .graph-node .ring {
  stroke-width: 1.5;
  opacity: 0;
  transition: opacity 0.2s ease;
}
#pub-graph-container .graph-node.is-center .ring,
#pub-graph-container .graph-node.is-selected .ring { opacity: 0.75; }

#pub-graph-container .graph-label {
  font-family: 'Jost', sans-serif;
  font-weight: 400;
  fill: var(--parchment, #e4ddd4);
  stroke: rgba(10,12,18,0.92);
  paint-order: stroke;
  stroke-linejoin: round;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}
#pub-graph-container .graph-label.is-shown { opacity: 0.92; }
#pub-graph-container .graph-label.is-shown.is-collide { opacity: 0; }

#pub-graph-container .graph-theme {
  font-family: 'Crimson Pro', Georgia, serif;
  font-style: italic;
  fill: rgba(228,221,212,0.62);
  stroke: rgba(10,12,18,0.85);
  paint-order: stroke;
  stroke-linejoin: round;
  cursor: pointer;
  transition: opacity 0.25s ease, fill 0.2s ease;
}
#pub-graph-container .graph-theme:hover,
#pub-graph-container .graph-theme.is-active { fill: var(--mars-ochre, #e07b39); }
#pub-graph-container .graph-theme.is-dim    { opacity: 0.35; }
#pub-graph-container .graph-theme.is-empty  { display: none; }

#pub-graph-container .graph-lanes { opacity: 0; transition: opacity 0.5s ease; pointer-events: none; }
#pub-graph-container.layout-timeline .graph-lanes { opacity: 1; }
#pub-graph-container.layout-timeline .graph-themes { opacity: 0 !important; pointer-events: none; }

#pub-graph-container .graph-lane-label {
  font-family: 'Jost', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
#pub-graph-container .graph-lane-count {
  font-family: 'JetBrains Mono', monospace;
  fill: var(--global-text-color-light, #6b7a96);
}
#pub-graph-container .graph-year {
  font-family: 'JetBrains Mono', monospace;
  fill: var(--global-text-color-light, #6b7a96);
}

/* Fit button and hint */

.graph-fit-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  background: rgba(10,12,18,0.85);
  border: 1px solid var(--global-border-color, #1e2330);
  border-radius: 3px;
  color: var(--global-text-color-light, #6b7a96);
  font-family: 'Jost', sans-serif;
  font-size: 0.68em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.35em 0.75em;
  cursor: pointer;
}
.graph-fit-btn:hover { color: var(--parchment, #e4ddd4); }

.graph-hint {
  position: absolute;
  left: 70px;
  top: 15px;
  z-index: 2;
  font-family: 'Jost', sans-serif;
  font-size: 0.66em;
  color: rgba(255,255,255,0.28);
  pointer-events: none;
}

/* Details panel */

.graph-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 10px;
  width: 310px;
  z-index: 4;
  overflow-y: auto;
  padding: 16px 18px 18px;
  background: rgba(10,12,18,0.96);
  border: 1px solid rgba(224,123,57,0.22);
  border-radius: 3px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.55);
  font-family: 'Jost', sans-serif;
  opacity: 0;
  transform: translateX(16px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.25s ease;
}
.graph-panel.is-open {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.is-compact .graph-panel {
  top: auto;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  max-height: 64%;
  border-width: 1px 0 0;
  transform: translateY(24px);
}
.is-compact .graph-panel.is-open { transform: none; }

.graph-panel .gp-close {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  color: var(--global-text-color-light, #6b7a96);
  font-size: 1.3em;
  line-height: 1;
  cursor: pointer;
  padding: 4px 6px;
}
.graph-panel .gp-close:hover { color: var(--parchment, #e4ddd4); }

.graph-panel .gp-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.66em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.gp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.graph-panel .gp-title {
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.12em;
  font-weight: 400;
  line-height: 1.3;
  color: var(--parchment, #e4ddd4);
  margin: 0 0 8px;
  padding-right: 14px;
}

.graph-panel .gp-meta {
  font-size: 0.7em;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #4a9bbe;
  margin-bottom: 4px;
}

.graph-panel .gp-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68em;
  color: var(--global-text-color-light, #6b7a96);
  margin-bottom: 10px;
}

.graph-panel .gp-type {
  font-family: 'Jost', sans-serif;
  font-size: 0.95em;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border: 1px solid currentColor;
  border-radius: 2px;
  padding: 0 5px;
}
.graph-panel .gp-type.kind-journal    { color: rgba(224,123,57,0.8); }
.graph-panel .gp-type.kind-conference { border-style: dashed; }
.graph-panel .gp-type.kind-code       { color: #4a9bbe; }

.graph-panel .gp-excerpt {
  font-size: 0.74em;
  line-height: 1.55;
  color: #8d98ad;
  margin: 0 0 10px;
}

.graph-panel .gp-theme {
  display: block;
  background: none;
  border: none;
  padding: 0;
  margin: 0 0 12px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-style: italic;
  font-size: 0.86em;
  color: rgba(228,221,212,0.7);
  cursor: pointer;
  text-align: left;
}
.graph-panel .gp-theme:hover { color: var(--mars-ochre, #e07b39); }

.graph-panel .gp-open {
  display: inline-block;
  font-size: 0.7em;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--mars-ochre, #e07b39) !important;
  border: 1px solid rgba(224,123,57,0.4);
  padding: 5px 12px;
  border-radius: 2px;
  text-decoration: none;
  margin-bottom: 14px;
}
.graph-panel .gp-open:hover { background: rgba(224,123,57,0.1); }

.graph-panel .gp-related-head {
  font-size: 0.64em;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--global-text-color-light, #6b7a96);
  border-top: 1px solid var(--global-border-color, #1e2330);
  padding-top: 10px;
  margin-bottom: 4px;
}

.graph-panel .gp-related {
  list-style: none;
  margin: 0;
  padding: 0;
}

.graph-panel .gp-related li { margin: 0; }

.graph-panel .gp-related button {
  position: relative;
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  padding: 6px 0 8px;
  text-align: left;
  cursor: pointer;
  color: #aeb6c6;
  font-family: 'Jost', sans-serif;
  font-size: 0.74em;
  line-height: 1.35;
}
.graph-panel .gp-related button:hover { color: var(--parchment, #e4ddd4); }
.graph-panel .gp-r-dot { width: 7px; height: 7px; border-radius: 50%; }
.graph-panel .gp-r-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.graph-panel .gp-r-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  color: var(--global-text-color-light, #6b7a96);
}
.graph-panel .gp-r-bar {
  position: absolute;
  left: 16px;
  bottom: 2px;
  height: 2px;
  max-width: calc(100% - 16px);
  background: rgba(224,123,57,0.35);
  border-radius: 1px;
}

/* Tooltip */

.graph-tip {
  position: fixed;
  display: none;
  max-width: 290px;
  padding: 11px 13px;
  background: rgba(10,12,18,0.96);
  border: 1px solid rgba(224,123,57,0.25);
  border-radius: 3px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.6);
  pointer-events: none;
  z-index: 9999;
  font-family: 'Jost', sans-serif;
}
.graph-tip .gt-title {
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.02em;
  color: #e4ddd4;
  line-height: 1.3;
  margin-bottom: 5px;
}
.graph-tip .gt-meta {
  font-size: 0.7em;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #4a9bbe;
  margin-bottom: 3px;
}
.graph-tip .gt-stats {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68em;
  color: #6b7a96;
  margin-bottom: 7px;
}
.graph-tip .gt-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68em;
}
.graph-tip .gt-cta {
  margin-left: auto;
  padding-left: 10px;
  color: rgba(224,123,57,0.75);
  white-space: nowrap;
}

/* Legend and note */

#pub-graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8em 1.4em;
  margin-top: 0.9em;
  padding: 0.7em 0;
  border-top: 1px solid var(--global-border-color, #1e2330);
}

.graph-legend-item {
  display: flex;
  align-items: center;
  gap: 0.45em;
  font-family: 'Jost', sans-serif;
  font-size: 0.72em;
  font-weight: 300;
  letter-spacing: 0.04em;
  color: var(--global-text-color-light, #6b7a96);
}

.graph-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.graph-legend-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  opacity: 0.7;
}

.graph-legend-size { margin-left: auto; }

.graph-note {
  font-family: 'Jost', sans-serif;
  font-size: 0.75em;
  font-weight: 300;
  color: var(--global-text-color-light, #6b7a96);
  margin-top: 0.6em;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .graph-search-group { justify-content: flex-start; }
  #pub-graph-search { max-width: none; }
  .graph-legend-size { margin-left: 0; }
}
</style>

My research spans Mars geology, astrobiology, hyperspectral remote sensing, and the application of artificial intelligence to planetary exploration. Author lists below are verified against NASA ADS and publisher records; my name is shown in bold.

For citation metrics and full publication list, see my [Google Scholar](https://scholar.google.com/citations?user=1DCuzasAAAAJ&hl=en) profile.

<!-- ── View Toggle ─────────────────────────────────────────────────────── -->

<div class="pub-view-toggle">
  <button class="pub-toggle-btn active" id="btn-list" onclick="pubSwitchView('list')">
    <i class="fas fa-list-ul" style="font-size:0.9em"></i> List
  </button>
  <button class="pub-toggle-btn" id="btn-graph" onclick="pubSwitchView('graph')">
    <i class="fas fa-circle-nodes" style="font-size:0.9em"></i> Graph
  </button>
</div>

<!-- ── List View ──────────────────────────────────────────────────────── -->

<div id="view-list">

{% comment %}
  Entries are grouped by the verified `pubtype` front-matter field
  (journal, chapter, conference, thesis, report, software, dataset, preprint).
  Unverified or excluded entries carry `published: false` and never render.
{% endcomment %}

<h2>Featured Publications</h2>

{% assign featured_papers = "2023-04-01-orbit-to-ground-biosignature-framework-2023,2022-10-01-feldspathic-crust-hellas-geology-2022,2021-09-01-mercury-hollows-lifecycle-2021,2023-02-01-salt-constructs-astrobiology-targets-2023,2025-11-22-ancient-anorthosites-mars-2025" | split: "," %}

{% for paper_id in featured_papers %}
  {% for post in site.publications %}
    {% assign post_filename = post.path | split: "/" | last | remove: ".md" %}
    {% if post_filename == paper_id %}
      {% include archive-single.html %}
    {% endif %}
  {% endfor %}
{% endfor %}

<h2>Peer-Reviewed Articles &amp; Book Chapters</h2>

{% for post in site.publications reversed %}
  {% if post.pubtype == 'journal' or post.pubtype == 'chapter' %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

<h2>Conference Abstracts &amp; Presentations</h2>

{% for post in site.publications reversed %}
  {% if post.pubtype == 'conference' %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

<h2 id="software-data">Software &amp; Data</h2>

<p>Code and datasets archived on Zenodo and other repositories. Each DOI link resolves to the latest version of the record.</p>

{% for post in site.publications reversed %}
  {% if post.pubtype == 'software' or post.pubtype == 'dataset' %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

<h2>Theses, Reports &amp; Preprints</h2>

{% for post in site.publications reversed %}
  {% unless post.pubtype == 'journal' or post.pubtype == 'chapter' or post.pubtype == 'conference' or post.pubtype == 'software' or post.pubtype == 'dataset' %}
    {% include archive-single.html %}
  {% endunless %}
{% endfor %}

</div><!-- #view-list -->

<!-- ── Graph View ────────────────────────────────────────────────────── -->

<div id="view-graph" style="display:none">

  <div class="graph-toolbar">
    <div class="graph-toolbar-group">
      <span class="graph-toolbar-label">Layout</span>
      <div class="graph-color-btns" role="group" aria-label="Graph layout">
        <button type="button" class="graph-color-btn graph-layout-btn active" data-layout="network" aria-pressed="true" onclick="setPubLayout('network')">Network</button>
        <button type="button" class="graph-color-btn graph-layout-btn" data-layout="timeline" aria-pressed="false" onclick="setPubLayout('timeline')">Timeline</button>
      </div>
    </div>
    <div class="graph-toolbar-group">
      <span class="graph-toolbar-label">Color by</span>
      <div class="graph-color-btns" role="group" aria-label="Color papers by">
        <button type="button" class="graph-color-btn active" data-mode="planet" aria-pressed="true" onclick="setPubColorMode('planet')">Planetary Body</button>
        <button type="button" class="graph-color-btn" data-mode="topic" aria-pressed="false" onclick="setPubColorMode('topic')">Research Theme</button>
      </div>
    </div>
    <div class="graph-toolbar-group graph-search-group">
      <input id="pub-graph-search" type="search" placeholder="Find a paper, place, or year" aria-label="Search the publication graph" autocomplete="off">
      <span id="pub-graph-count" aria-live="polite"></span>
    </div>
  </div>

  <div class="graph-filter-row" id="pub-graph-filters"></div>

  <div id="pub-graph-container"></div>
  <div id="pub-graph-legend"></div>
  <p class="graph-note">
    In the network layout, each paper is linked to the papers whose titles and abstracts share the most distinctive vocabulary (TF-IDF cosine similarity).
    The italic theme names label communities of closely linked papers, and each name lists the words that most distinguish that community from the rest of my work.
    The timeline layout places each paper by year in a lane for its planetary body or research theme.
    Shapes mark the kind of output, and node size scales with citation count from Google Scholar and Semantic Scholar.
    Click a paper to see its details and the papers most similar to it.
  </p>

</div><!-- #view-graph -->

<!-- ── Scripts ───────────────────────────────────────────────────────── -->

<script>
/* Inject graph data from Jekyll data file */
var PUB_GRAPH_DATA = {{ site.data.publications_graph | jsonify }};

function pubSwitchView(view) {
  var listEl  = document.getElementById('view-list');
  var graphEl = document.getElementById('view-graph');
  var btnList  = document.getElementById('btn-list');
  var btnGraph = document.getElementById('btn-graph');

  if (view === 'graph') {
    listEl.style.display  = 'none';
    graphEl.style.display = 'block';
    btnList.classList.remove('active');
    btnGraph.classList.add('active');
    /* Lazy-init the graph on first show */
    if (typeof window.initPubGraph === 'function') {
      window.initPubGraph(PUB_GRAPH_DATA);
    }
    if (location.hash !== '#graph') history.replaceState(null, '', '#graph');
  } else {
    listEl.style.display  = 'block';
    graphEl.style.display = 'none';
    btnList.classList.add('active');
    btnGraph.classList.remove('active');
    if (location.hash === '#graph') history.replaceState(null, '', location.pathname);
  }
}
</script>

<!-- D3 v7 -->
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="{{ base_path }}/assets/js/pub-graph.js"></script>
<script>if (location.hash === '#graph') pubSwitchView('graph');</script>
