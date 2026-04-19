---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
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

/* ── Graph container ──────────────────────────────────────────── */

#view-graph {
  margin-top: 0.5em;
}

.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 1.2em;
  margin-bottom: 1em;
  flex-wrap: wrap;
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
}

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

.graph-note {
  font-family: 'Jost', sans-serif;
  font-size: 0.75em;
  font-weight: 300;
  color: var(--global-text-color-light, #6b7a96);
  margin-top: 0.6em;
  line-height: 1.6;
}
</style>

My research spans Mars geology, astrobiology, hyperspectral remote sensing, and the application of artificial intelligence to planetary exploration. I have published peer-reviewed articles in leading planetary science journals, developed open-source software tools for the community, and presented findings at major conferences.

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

{% assign conf_keywords = "Lunar and Planetary Science,AbSciCon,Copernicus,AGU,LPI,AAS,ARPHA,European Planetary Science,Differentiation,Planetary Data Workshop,Conference on Mars" | split: "," %}

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

---

<h2>Peer-Reviewed Journal Articles</h2>

{% for post in site.publications reversed %}
  {% if post.venue == '' or post.venue == nil %}{% continue %}{% endif %}
  {% assign is_conf = false %}
  {% for keyword in conf_keywords %}
    {% if post.venue contains keyword %}
      {% assign is_conf = true %}
    {% endif %}
  {% endfor %}
  {% unless is_conf %}
    {% unless post.venue contains "Preprint" or post.venue contains "Research Square" %}
      {% include archive-single.html %}
    {% endunless %}
  {% endunless %}
{% endfor %}

---

<h2>Conference Proceedings &amp; Abstracts</h2>

{% for post in site.publications reversed %}
  {% assign is_conf = false %}
  {% for keyword in conf_keywords %}
    {% if post.venue contains keyword %}
      {% assign is_conf = true %}
    {% endif %}
  {% endfor %}
  {% if is_conf %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

</div><!-- #view-list -->

<!-- ── Graph View ────────────────────────────────────────────────────── -->

<div id="view-graph" style="display:none">

  <div class="graph-toolbar">
    <span class="graph-toolbar-label">Color by</span>
    <div class="graph-color-btns">
      <button class="graph-color-btn active" data-mode="planet" onclick="setPubColorMode('planet')">Planetary Body</button>
      <button class="graph-color-btn" data-mode="topic" onclick="setPubColorMode('topic')">Research Theme</button>
    </div>
  </div>

  <div id="pub-graph-container"></div>
  <div id="pub-graph-legend"></div>
  <p class="graph-note">
    Nodes connected by text similarity (TF-IDF) between titles and abstracts — closer nodes share more concepts.
    <strong style="color:var(--parchment)">Filled circles</strong> = peer-reviewed journals &nbsp;·&nbsp;
    <strong style="color:var(--parchment)">Dashed rings</strong> = conference proceedings.
    Node size scales with citation count (via Semantic Scholar). Hover to preview; click to open the paper.
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
  } else {
    listEl.style.display  = 'block';
    graphEl.style.display = 'none';
    btnList.classList.add('active');
    btnGraph.classList.remove('active');
  }
}
</script>

<!-- D3 v7 -->
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="{{ base_path }}/assets/js/pub-graph.js"></script>
