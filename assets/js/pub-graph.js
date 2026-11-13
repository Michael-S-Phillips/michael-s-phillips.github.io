/* =============================================================
   Publication Graph — D3 v7
   Two layouts of the same papers:
     • Network: papers linked by text similarity, with theme names
       (communities detected by scripts/build_graph.py).
     • Timeline: papers placed by year in lanes for the current
       color grouping (planetary body or research theme).
   Entry points (called from _pages/publications.md):
     initPubGraph(data), setPubColorMode(mode), setPubLayout(mode)
   ============================================================= */

(function () {
  "use strict";

  // ── Palette and labels ─────────────────────────────────────────────────────

  const PLANET_COLOR = {
    mars:    "#e07b39",
    mercury: "#7fa8cc",
    earth:   "#5aaa78",
    multi:   "#d4a843",
  };
  const TOPIC_COLOR = {
    mineralogy:     "#d4883a",
    astrobiology:   "#5aaa78",
    remote_sensing: "#4a9bbe",
    ai_ml:          "#a87ac0",
    other:          "#6b7a96",
  };
  const PLANET_LABEL = {
    mars:    "Mars",
    mercury: "Mercury",
    earth:   "Earth / Analog",
    multi:   "Multi-body",
  };
  const TOPIC_LABEL = {
    mineralogy:     "Mineralogy & Crust",
    astrobiology:   "Astrobiology",
    remote_sensing: "Remote Sensing",
    ai_ml:          "AI / ML & Software",
    other:          "Other",
  };
  const PLANET_ORDER = ["mars", "mercury", "earth", "multi"];
  const TOPIC_ORDER  = ["mineralogy", "astrobiology", "remote_sensing", "ai_ml", "other"];

  // Output kinds: one shape each, and one filter chip each.
  const KIND = {
    journal: "journal", chapter: "journal",
    conference: "conference",
    software: "code", dataset: "code",
    report: "other", thesis: "other", preprint: "other",
  };
  const KIND_ORDER = ["journal", "conference", "code", "other"];
  const KIND_LABEL = {
    journal:    "Journal articles",
    conference: "Conference abstracts",
    code:       "Software & data",
    other:      "Theses, reports & preprints",
  };

  const INK      = "#e4ddd4";
  const MUTED    = "#6b7a96";
  const CANVAS   = "#0a0c12";
  const DURATION = 850;

  // ── State ──────────────────────────────────────────────────────────────────

  const S = {
    colorMode: "planet",     // "planet" | "topic"
    layout:    "network",    // "network" | "timeline"
    hidden:    new Set(),    // hidden output kinds
    query:     "",
    matches:   null,         // Set of ids matching the search, or null
    selected:  null,         // id of the paper shown in the panel
    hovered:   null,         // id under the pointer
    themeHover:  null,       // cluster id under the pointer
    themePinned: null,       // cluster id clicked
    k: 1,                    // current zoom scale
  };

  let nodes = [], links = [], byId = new Map(), neighbors = new Map();
  let clusters = [], clusterById = new Map(), featured = new Set();
  let W = 900, H = 600, compact = false, canHover = true, initialized = false;
  let container, svg, root, gLanes, gLinks, gThemes, gNodes, gLabels, zoom, sim;
  let nodeSel, linkSel, labelSel, themeSel;
  let tip, panel, hint, timelineGeom = null;

  // ── Public entry points ────────────────────────────────────────────────────

  window.initPubGraph = function (data) {
    if (initialized || !data || !data.nodes) return;
    initialized = true;
    build(data);
  };

  window.setPubColorMode = function (mode) {
    S.colorMode = mode;
    document.querySelectorAll(".graph-color-btn[data-mode]").forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    if (!initialized) return;
    nodeSel.select(".shape").call(styleShape);
    nodeSel.select(".ring").attr("stroke", colorOf);
    renderLegend();
    renderPanel();
    if (S.layout === "timeline") {
      computeTimeline();
      drawLanes();
      animateTo(n => [n.tlX, n.tlY]);
    }
    applyHighlight();
  };

  window.setPubLayout = function (mode) {
    document.querySelectorAll(".graph-layout-btn").forEach(b => {
      const on = b.dataset.layout === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    if (!initialized || mode === S.layout) return;
    S.layout = mode;
    container.classList.toggle("layout-timeline", mode === "timeline");
    sim.stop();
    if (mode === "timeline") {
      computeTimeline();
      drawLanes();
      animateTo(n => [n.tlX, n.tlY]);
    } else {
      animateTo(n => [n.netX, n.netY]);
    }
    fit(DURATION);
    updateHint();
    applyHighlight();
  };

  // ── Small helpers ──────────────────────────────────────────────────────────

  const kindOf   = d => KIND[d.pub_type] || "other";
  const groupOf  = d => (S.colorMode === "planet" ? d.planet : d.topic);
  const visible  = d => !S.hidden.has(d.kind);
  const isLink   = u => /^https?:\/\//.test(u || "");

  function colorOf(d) {
    return S.colorMode === "planet"
      ? (PLANET_COLOR[d.planet] || MUTED)
      : (TOPIC_COLOR[d.topic] || MUTED);
  }

  function groupLabel(key) {
    return (S.colorMode === "planet" ? PLANET_LABEL[key] : TOPIC_LABEL[key]) || key;
  }

  // Citation count sets the size: 0 → 5.5, 4 → 7.8, 20 → 10.6.
  function radius(d) {
    return 5.5 + Math.sqrt(d.citations || 0) * 1.15;
  }

  function shapePath(d) {
    const r = radius(d);
    if (d.kind === "code")  return d3.symbol(d3.symbolDiamond, Math.PI * r * r * 0.95)();
    if (d.kind === "other") return d3.symbol(d3.symbolSquare, (r * 1.65) * (r * 1.65))();
    return d3.symbol(d3.symbolCircle, Math.PI * r * r)();
  }

  function styleShape(sel) {
    sel
      .attr("d", shapePath)
      .attr("fill", d => (d.kind === "journal" || d.kind === "code") ? colorOf(d) : CANVAS)
      .attr("stroke", colorOf)
      .attr("stroke-width", d => (d.kind === "conference" ? 1.8 : d.kind === "other" ? 1.6 : 1.1))
      .attr("stroke-dasharray", d => (d.kind === "conference" ? "3,2.4" : null));
  }

  function shortTitle(t) {
    t = String(t || "");
    const colon = t.indexOf(":");
    if (colon >= 8 && colon <= 48) t = t.slice(0, colon);
    if (t.length > 46) t = t.slice(0, 44).replace(/\s+\S*$/, "") + "…";
    return t;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Stable pseudo-random number in [0, 1) from a string, for jitter.
  function hash(str, salt) {
    let h = 2166136261 ^ (salt || 0);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  }

  function openLabel(d) {
    if (d.pub_type === "software") return "Get the code";
    if (d.pub_type === "dataset")  return "Get the data";
    if (d.kind === "conference")   return "Open abstract";
    return "Open paper";
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  function prepare(data) {
    nodes = data.nodes.map(n => Object.assign({}, n));
    byId = new Map(nodes.map(n => [n.id, n]));
    const idOf = v => (typeof v === "object" ? v.id : v);
    links = data.links
      .filter(l => byId.has(idOf(l.source)) && byId.has(idOf(l.target)))
      .map(l => ({ source: byId.get(idOf(l.source)), target: byId.get(idOf(l.target)), weight: l.weight }));

    neighbors = new Map(nodes.map(n => [n.id, []]));
    links.forEach(l => {
      neighbors.get(l.source.id).push({ node: l.target, weight: l.weight });
      neighbors.get(l.target.id).push({ node: l.source, weight: l.weight });
    });
    neighbors.forEach(list => list.sort((a, b) => b.weight - a.weight));

    clusters = (data.clusters || []).filter(c => c && c.label);
    clusterById = new Map(clusters.map(c => [c.id, c]));

    featured = new Set(
      nodes.slice()
        .filter(n => (n.citations || 0) >= 4)
        .sort((a, b) => (b.citations || 0) - (a.citations || 0))
        .slice(0, 8)
        .map(n => n.id)
    );

    nodes.forEach(n => {
      n.kind = kindOf(n);
      n.short = shortTitle(n.title);
      const theme = clusterById.get(n.cluster);
      n.search = [
        n.title, n.venue, n.year, n.excerpt, n.pub_type,
        theme ? theme.label : "", PLANET_LABEL[n.planet], TOPIC_LABEL[n.topic],
      ].join(" ").toLowerCase();
    });
  }

  // ── Layouts ────────────────────────────────────────────────────────────────

  function computeNetwork() {
    // Phase 1: free layout from the similarity links alone.
    sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .distance(l => 72 - l.weight * 32)
        .strength(l => 0.25 + l.weight * 0.5))
      .force("charge", d3.forceManyBody().strength(-125).distanceMax(420))
      .force("x", d3.forceX(W / 2).strength(compact ? 0.1 : 0.045))
      .force("y", d3.forceY(H / 2).strength(compact ? 0.03 : 0.07))
      .force("collide", d3.forceCollide(d => radius(d) + 5))
      .stop();
    for (let i = 0; i < 180; i++) sim.tick();

    // Phase 2: give each theme an anchor on an ellipse, keeping the order in
    // which the themes already sit around the center, and pull its papers
    // toward it. Themes then read as separate groups with room for a name.
    const named = clusters.filter(c => nodes.some(n => n.cluster === c.id));
    if (named.length > 1) {
      const cx = d3.mean(nodes, n => n.x), cy = d3.mean(nodes, n => n.y);
      named.forEach(c => {
        const m = nodes.filter(n => n.cluster === c.id);
        c.angle = Math.atan2(d3.mean(m, n => n.y) - cy, d3.mean(m, n => n.x) - cx);
      });
      const rx = W * (compact ? 0.24 : 0.31), ry = H * (compact ? 0.33 : 0.3);
      named.slice().sort((a, b) => a.angle - b.angle).forEach((c, i) => {
        const a = -Math.PI / 2 + (i / named.length) * Math.PI * 2;
        c.ax = W / 2 + rx * Math.cos(a);
        c.ay = H / 2 + ry * Math.sin(a);
      });
      const anchor = new Map(named.map(c => [c.id, c]));
      sim
        .force("x", d3.forceX(n => (anchor.get(n.cluster) || { ax: W / 2 }).ax)
          .strength(n => (anchor.has(n.cluster) ? 0.16 : 0.04)))
        .force("y", d3.forceY(n => (anchor.get(n.cluster) || { ay: H / 2 }).ay)
          .strength(n => (anchor.has(n.cluster) ? 0.16 : 0.04)))
        .force("link", d3.forceLink(links)
          .distance(l => 60 - l.weight * 28)
          .strength(l => (l.source.cluster === l.target.cluster ? 0.3 + l.weight * 0.5 : 0.02)))
        .force("charge", d3.forceManyBody().strength(-90).distanceMax(260))
        .alpha(1);
    }
    for (let i = 0; i < 360; i++) sim.tick();
    nodes.forEach(n => { n.netX = n.x; n.netY = n.y; });
    sim.on("tick", () => {
      if (S.layout !== "network") return;
      nodes.forEach(n => { n.netX = n.x; n.netY = n.y; });
      render();
    });
  }

  function laneKeys() {
    const order = S.colorMode === "planet" ? PLANET_ORDER : TOPIC_ORDER;
    const present = new Set(nodes.map(groupOf));
    return order.filter(k => present.has(k)).concat([...present].filter(k => !order.includes(k)));
  }

  function computeTimeline() {
    const keys   = laneKeys();
    const top    = compact ? 40 : 44;
    const bottom = 34;
    const left   = compact ? 24 : 40;
    const right  = 22;
    const laneH  = (H - top - bottom) / keys.length;
    const years  = d3.extent(nodes, n => n.year);
    const x      = d3.scaleLinear().domain([years[0] - 0.5, years[1] + 0.5]).range([left, W - right]);
    const lane   = new Map(keys.map((k, i) => [k, i]));

    const proxies = nodes.map(n => {
      const li = lane.get(groupOf(n));
      const tx = x(n.year);
      const ty = top + laneH * (li + 0.5) + 8;
      return {
        n, li, tx, ty,
        x: tx + (hash(n.id, 1) - 0.5) * 24,
        y: ty + (hash(n.id, 2) - 0.5) * laneH * 0.5,
      };
    });
    const tsim = d3.forceSimulation(proxies)
      .force("x", d3.forceX(p => p.tx).strength(0.5))
      .force("y", d3.forceY(p => p.ty).strength(0.1))
      .force("collide", d3.forceCollide(p => radius(p.n) + 2.5).iterations(3))
      .stop();
    for (let i = 0; i < 320; i++) tsim.tick();

    proxies.forEach(p => {
      const r  = radius(p.n);
      const y0 = top + laneH * p.li;
      const half = (x(1) - x(0)) / 2;
      p.n.tlX = Math.max(p.tx - half + r, Math.min(p.tx + half - r, p.x));
      p.n.tlY = Math.max(y0 + r + 20, Math.min(y0 + laneH - r - 3, p.y));
    });

    timelineGeom = { keys, top, bottom, left, right, laneH, x, years };
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  function build(data) {
    container = document.getElementById("pub-graph-container");
    if (!container || typeof d3 === "undefined") return;
    prepare(data);

    W = Math.max(320, container.clientWidth || 900);
    compact = W < 640;
    canHover = window.matchMedia ? window.matchMedia("(hover: hover)").matches : true;
    H = compact ? 480 : Math.round(Math.min(Math.max(W * 0.62, 500), 680));
    container.style.height = H + "px";
    container.classList.toggle("is-compact", compact);

    svg = d3.select(container).append("svg")
      .attr("width", "100%")
      .attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "Graph of publications; use the search box or the list view for keyboard access");

    const defs = svg.append("defs");
    defs.append("pattern")
      .attr("id", "grid-dots").attr("width", 28).attr("height", 28)
      .attr("patternUnits", "userSpaceOnUse")
      .append("circle").attr("cx", 1).attr("cy", 1).attr("r", 0.7)
      .attr("fill", "rgba(255,255,255,0.05)");
    svg.append("rect").attr("class", "graph-bg")
      .attr("width", "100%").attr("height", "100%").attr("fill", "url(#grid-dots)");

    root    = svg.append("g").attr("class", "graph-root");
    gLanes  = root.append("g").attr("class", "graph-lanes");
    gLinks  = root.append("g").attr("class", "graph-links");
    gThemes = root.append("g").attr("class", "graph-themes");
    gNodes  = root.append("g").attr("class", "graph-nodes");
    gLabels = root.append("g").attr("class", "graph-labels");

    zoom = d3.zoom()
      .scaleExtent([0.3, 6])
      .on("zoom", e => {
        root.attr("transform", e.transform);
        S.k = e.transform.k;
        scaleText();
        updateLabels();
        placeLabels();
      });
    svg.call(zoom).on("dblclick.zoom", null);
    svg.on("click", e => {
      if (e.target.closest && e.target.closest(".graph-node, .graph-theme")) return;
      S.themePinned = null;
      select(null);
    });

    computeNetwork();

    // Links
    linkSel = gLinks.selectAll("line").data(links).join("line")
      .attr("class", "graph-link")
      .attr("stroke-width", l => Math.max(0.6, l.weight * 3.5));

    // Nodes
    nodeSel = gNodes.selectAll("g").data(nodes, d => d.id).join("g")
      .attr("class", d => "graph-node kind-" + d.kind)
      .on("click", (e, d) => {
        e.stopPropagation();
        select(S.selected === d.id ? null : d, { pan: "auto" });
      })
      .call(d3.drag()
        .filter(e => S.layout === "network" && !e.button)
        .on("start", (e, d) => {
          if (!e.active) sim.alphaTarget(0.22).restart();
          d.fx = d.x; d.fy = d.y;
          hideTip();
        })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => {
          if (!e.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    if (canHover) {
      nodeSel
        .on("mouseenter", (e, d) => { S.hovered = d.id; applyHighlight(); showTip(e, d); })
        .on("mousemove", moveTip)
        .on("mouseleave", () => { S.hovered = null; applyHighlight(); hideTip(); });
    }

    nodeSel.append("circle").attr("class", "ring")
      .attr("r", d => radius(d) + 5)
      .attr("fill", "none")
      .attr("stroke", colorOf);
    nodeSel.append("path").attr("class", "shape").call(styleShape);

    // Labels
    labelSel = gLabels.selectAll("text").data(nodes, d => d.id).join("text")
      .attr("class", "graph-label")
      .attr("dy", "0.34em")
      .text(d => d.short);

    // Theme names
    themeSel = gThemes.selectAll("text").data(clusters, c => c.id).join("text")
      .attr("class", "graph-theme")
      .attr("text-anchor", "middle")
      .text(c => c.label)
      .on("mouseenter", (e, c) => { S.themeHover = c.id; applyHighlight(); })
      .on("mouseleave", () => { S.themeHover = null; applyHighlight(); })
      .on("click", (e, c) => {
        e.stopPropagation();
        pinTheme(S.themePinned === c.id ? null : c.id);
      });

    buildChrome();
    renderLegend();
    render();
    fit(0);
    scaleText();
    applyHighlight();
    intro();

    document.addEventListener("keydown", e => {
      if (e.key !== "Escape" || !container.offsetParent) return;
      if (S.selected || S.themePinned != null) {
        S.themePinned = null;
        select(null);
      }
    });
  }

  // Papers appear in the order they were written.
  function intro() {
    const [y0, y1] = d3.extent(nodes, n => n.year);
    const span = Math.max(1, y1 - y0);
    nodeSel.select(".shape")
      .attr("transform", "scale(0)")
      .transition().delay(d => 120 + ((d.year - y0) / span) * 900 + hash(d.id, 3) * 120)
      .duration(420).ease(d3.easeBackOut.overshoot(1.6))
      .attr("transform", "scale(1)");
    gLinks.style("opacity", 0).transition().delay(700).duration(700).style("opacity", 1);
    gThemes.style("opacity", 0).transition().delay(1100).duration(700).style("opacity", 1);
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  function render() {
    nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
    linkSel
      .attr("x1", l => l.source.x).attr("y1", l => l.source.y)
      .attr("x2", l => l.target.x).attr("y2", l => l.target.y);
    placeLabels();
    placeThemes();
  }

  // Place shown labels right of their node, or left if that side is taken or
  // runs off the frame; hide a label only when both sides collide.
  function placeLabels() {
    if (!labelSel) return;
    const t = d3.zoomTransform(svg.node());
    const panelOpen = panel && panel.classList.contains("is-open");
    const xMax = panelOpen && !compact ? W - 330 : W - 6;
    const yMax = panelOpen && compact ? H * 0.36 : H - 4;
    const boxes = [];
    const hits = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const shown = labelSel.filter(".is-shown").data()
      .sort((a, b) => priority(b) - priority(a));
    const placed = new Map();
    shown.forEach(d => {
      const sx = t.applyX(d.x), sy = t.applyY(d.y), r = radius(d) * t.k;
      const w = d.short.length * 5.7 + 6, h = 13;
      const right = { x0: sx + r + 3, x1: sx + r + 3 + w, y0: sy - h / 2, y1: sy + h / 2 };
      const left  = { x0: sx - r - 3 - w, x1: sx - r - 3, y0: sy - h / 2, y1: sy + h / 2 };
      const okR = right.x1 <= xMax && sy <= yMax && !hits(right);
      const okL = left.x0 >= 4 && sy <= yMax && !hits(left);
      // On phones the open panel already shows the selected title.
      const must = (d.id === S.selected && !compact) || d.id === S.hovered;
      const side = okR ? "right" : okL ? "left" : must ? (right.x1 <= xMax ? "right" : "left") : null;
      if (side) boxes.push(side === "right" ? right : left);
      placed.set(d.id, side);
    });
    labelSel
      .classed("is-collide", d => placed.has(d.id) && placed.get(d.id) === null)
      .attr("text-anchor", d => (placed.get(d.id) === "left" ? "end" : "start"))
      .attr("x", d => d.x + (placed.get(d.id) === "left" ? -1 : 1) * (radius(d) + 3 / t.k))
      .attr("y", d => d.y);
  }

  function priority(d) {
    if (d.id === S.selected) return 1e6;
    if (d.id === S.hovered) return 1e5;
    return (d.citations || 0) * 10 + (d.kind === "journal" ? 5 : 0) + d.year / 1e4;
  }

  function placeThemes() {
    if (!themeSel) return;
    const k = S.k || 1;
    const boxes = [];
    themeSel.each(function (c) {
      const members = nodes.filter(n => n.cluster === c.id && visible(n));
      if (members.length < 2) { c.px = null; return; }
      const xs = members.map(n => n.x);
      c.px = d3.mean(xs);
      c.py = d3.min(members, n => n.y - radius(n)) - 12 / Math.max(k, 0.6);
      c.w  = (c.label.length * (compact ? 5.6 : 6.4)) / k;
      boxes.push(c);
    });
    // Nudge labels that would overlap a label placed above them.
    boxes.sort((a, b) => a.py - b.py);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = boxes[j], b = boxes[i];
        if (Math.abs(a.px - b.px) < (a.w + b.w) / 2 && Math.abs(a.py - b.py) < 16 / k) {
          b.py = a.py + 16 / k;
        }
      }
    }
    themeSel
      .attr("x", c => (c.px == null ? -9999 : c.px))
      .attr("y", c => (c.px == null ? -9999 : c.py))
      .classed("is-empty", c => c.px == null);
  }

  // Text keeps a constant on-screen size while the graph zooms.
  function scaleText() {
    const k = S.k || 1;
    labelSel.style("font-size", (10.5 / k) + "px").style("stroke-width", (3 / k) + "px");
    themeSel.style("font-size", ((compact ? 10 : 11.5) / k) + "px").style("stroke-width", (4 / k) + "px");
    gLanes.selectAll(".graph-lane-label").style("font-size", ((compact ? 9 : 10.5) / k) + "px");
    gLanes.selectAll(".graph-year").style("font-size", (10 / k) + "px");
    placeThemes();
  }

  function animateTo(target, done) {
    const from = nodes.map(n => [n.x, n.y]);
    const to   = nodes.map(target);
    svg.transition("layout").duration(DURATION).ease(d3.easeCubicInOut)
      .tween("layout", () => t => {
        nodes.forEach((n, i) => {
          n.x = from[i][0] + (to[i][0] - from[i][0]) * t;
          n.y = from[i][1] + (to[i][1] - from[i][1]) * t;
        });
        render();
      })
      .on("end", () => { if (done) done(); });
  }

  // Zoom so every visible paper (and its theme name) fits in the frame,
  // or, given a subset, frame just those papers.
  function fit(duration, subset) {
    let t;
    if (S.layout === "timeline" && !subset) {
      t = d3.zoomIdentity;
    } else {
      const vis = (subset || nodes).filter(visible);
      if (!vis.length) return;
      const px = n => (S.layout === "timeline" ? n.tlX : n.netX);
      const py = n => (S.layout === "timeline" ? n.tlY : n.netY);
      const pad = compact ? 22 : 34;
      const top = 36;   // the Fit button and hint sit along the top edge
      const x0 = d3.min(vis, n => px(n) - radius(n)) - pad;
      const x1 = d3.max(vis, n => px(n) + radius(n)) + pad;
      const y0 = d3.min(vis, n => py(n) - radius(n)) - pad - 22;
      const y1 = d3.max(vis, n => py(n) + radius(n)) + pad;
      const k  = Math.min(subset ? 2.2 : 1.6, W / (x1 - x0), (H - top) / (y1 - y0));
      t = d3.zoomIdentity
        .translate(W / 2 - k * (x0 + x1) / 2, top + (H - top) / 2 - k * (y0 + y1) / 2)
        .scale(k);
    }
    if (duration) svg.transition("zoom").duration(duration).ease(d3.easeCubicInOut).call(zoom.transform, t);
    else svg.call(zoom.transform, t);
  }

  // Bring a paper into view, leaving room for the details panel.
  function panTo(d) {
    const cur = d3.zoomTransform(svg.node());
    const k = Math.max(cur.k, 1);
    const tx = compact ? W / 2 : (W - 330) / 2;
    const ty = compact ? H * 0.18 : H / 2;
    const t = d3.zoomIdentity.translate(tx - k * d.x, ty - k * d.y).scale(k);
    svg.transition("zoom").duration(650).ease(d3.easeCubicInOut).call(zoom.transform, t);
  }

  // ── Timeline lanes and year axis ───────────────────────────────────────────

  function drawLanes() {
    const g = timelineGeom;
    if (!g) return;
    const color = k => (S.colorMode === "planet" ? PLANET_COLOR[k] : TOPIC_COLOR[k]) || MUTED;
    const count = k => nodes.filter(n => groupOf(n) === k).length;

    gLanes.selectAll("*").remove();

    const lanes = gLanes.selectAll(".graph-lane").data(g.keys).join("g").attr("class", "graph-lane");
    lanes.append("rect")
      .attr("x", 0).attr("width", W)
      .attr("y", (k, i) => g.top + i * g.laneH).attr("height", g.laneH)
      .attr("fill", (k, i) => (i % 2 ? "rgba(255,255,255,0.018)" : "rgba(255,255,255,0)"));
    lanes.append("line")
      .attr("x1", 0).attr("x2", W)
      .attr("y1", (k, i) => g.top + (i + 1) * g.laneH).attr("y2", (k, i) => g.top + (i + 1) * g.laneH)
      .attr("stroke", "rgba(255,255,255,0.05)");
    const lab = lanes.append("text")
      .attr("class", "graph-lane-label")
      .attr("x", 10)
      .attr("y", (k, i) => g.top + i * g.laneH + 14)
      .attr("fill", color);
    lab.append("tspan").text(k => groupLabel(k));
    lab.append("tspan").attr("class", "graph-lane-count").attr("dx", 6).text(k => count(k));

    const years = d3.range(g.years[0], g.years[1] + 1);
    const every = compact && years.length > 7 ? 2 : 1;
    const axis = gLanes.append("g").attr("class", "graph-axis");
    axis.selectAll("line").data(years).join("line")
      .attr("x1", y => g.x(y - 0.5)).attr("x2", y => g.x(y - 0.5))
      .attr("y1", g.top).attr("y2", H - g.bottom + 4)
      .attr("stroke", "rgba(255,255,255,0.04)");
    axis.selectAll("text").data(years.filter((y, i) => i % every === 0)).join("text")
      .attr("class", "graph-year")
      .attr("x", y => g.x(y)).attr("y", H - g.bottom + 20)
      .attr("text-anchor", "middle")
      .text(y => (compact ? "’" + String(y).slice(2) : y));
    scaleText();
  }

  // ── Highlighting ───────────────────────────────────────────────────────────

  function focus() {
    const id = S.hovered || S.selected;
    if (id) {
      const set = new Set([id]);
      neighbors.get(id).forEach(nb => set.add(nb.node.id));
      return { set, center: id };
    }
    const theme = S.themeHover != null ? S.themeHover : S.themePinned;
    if (theme != null) {
      return { set: new Set(nodes.filter(n => n.cluster === theme).map(n => n.id)), center: null, theme };
    }
    if (S.matches) return { set: S.matches, center: null };
    return null;
  }

  function applyHighlight() {
    if (!nodeSel) return;
    const f = focus();
    const center = f && f.center ? byId.get(f.center) : null;

    nodeSel
      .classed("is-hidden", d => !visible(d))
      .classed("is-dim", d => !!f && !f.set.has(d.id))
      .classed("is-center", d => !!center && d.id === center.id)
      .classed("is-selected", d => d.id === S.selected);

    linkSel
      .classed("is-hidden", l => !visible(l.source) || !visible(l.target))
      .classed("is-hot", l => !!center && (l.source === center || l.target === center))
      .classed("is-dim", l => !!f && (center
        ? !(l.source === center || l.target === center)
        : !(f.set.has(l.source.id) && f.set.has(l.target.id))))
      .style("stroke", l => (center && (l.source === center || l.target === center)) ? colorOf(center) : null);

    themeSel
      .classed("is-active", c => !!f && f.theme === c.id)
      .classed("is-dim", c => !!f && f.theme !== c.id);

    updateLabels(f);
    placeLabels();
    placeThemes();
  }

  function updateLabels(f) {
    if (!labelSel) return;
    if (f === undefined) f = focus();
    const zoomed = S.k >= 1.7;
    labelSel.classed("is-shown", d => {
      if (!visible(d)) return false;
      if (d.id === S.hovered || d.id === S.selected) return true;
      const star = featured.has(d.id) && !compact;
      if (f) return f.set.has(d.id) && (f.set.size <= (compact ? 8 : 14) || zoomed || star);
      return zoomed || star;
    });
  }

  // ── Selection and details panel ────────────────────────────────────────────

  function pinTheme(id) {
    S.themePinned = id;
    if (id != null && S.layout === "timeline") setPubLayout("network");
    select(null);
    if (id != null) fit(700, nodes.filter(n => n.cluster === id));
  }

  function select(d, opts) {
    S.selected = d ? d.id : null;
    if (d && S.hidden.has(d.kind)) {
      S.hidden.delete(d.kind);
      renderChips();
    }
    renderPanel();
    applyHighlight();
    if (d && opts && opts.pan) {
      const t = d3.zoomTransform(svg.node());
      const sx = t.applyX(d.x), sy = t.applyY(d.y);
      const hidden = compact ? sy > H * 0.34 : sx > W - 340;
      if (opts.pan !== "auto" || hidden) panTo(d);
    }
  }

  function renderPanel() {
    if (!panel) return;
    const d = S.selected ? byId.get(S.selected) : null;
    if (!d) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      placeLabels();
      return;
    }
    const color = colorOf(d);
    const theme = clusterById.get(d.cluster);
    const related = neighbors.get(d.id).slice(0, 6);
    const maxW = related.length ? related[0].weight : 1;
    const typeName = d.pub_type === "conference" ? "abstract" : d.pub_type;

    panel.innerHTML =
      '<button type="button" class="gp-close" aria-label="Close details">×</button>' +
      '<div class="gp-group" style="color:' + color + '">' +
        '<span class="gp-dot" style="background:' + color + '"></span>' + esc(groupLabel(groupOf(d))) +
      "</div>" +
      '<h3 class="gp-title">' + esc(d.title) + "</h3>" +
      '<div class="gp-meta"><span class="gp-venue">' + esc(d.venue) + "</span></div>" +
      '<div class="gp-stats"><span class="gp-type kind-' + d.kind + '">' + esc(typeName) + "</span>" +
        esc(d.year) + (d.citations ? " · " + esc(d.citations) + (d.citations === 1 ? " citation" : " citations") : "") +
      "</div>" +
      (d.excerpt ? '<p class="gp-excerpt">' + esc(d.excerpt) + "</p>" : "") +
      (theme ? '<button type="button" class="gp-theme" data-theme="' + theme.id + '">Theme: ' + esc(theme.label) + "</button>" : "") +
      (isLink(d.url) ? '<a class="gp-open" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(openLabel(d)) + " ↗</a>" : "") +
      (related.length
        ? '<div class="gp-related-head">Most similar work</div><ol class="gp-related">' +
          related.map(r =>
            '<li><button type="button" data-id="' + esc(r.node.id) + '">' +
              '<span class="gp-r-dot" style="background:' + colorOf(r.node) + '"></span>' +
              '<span class="gp-r-title">' + esc(r.node.title) + "</span>" +
              '<span class="gp-r-year">' + esc(r.node.year) + "</span>" +
              '<span class="gp-r-bar" style="width:' + Math.round((r.weight / maxW) * 100) + '%"></span>' +
            "</button></li>").join("") +
          "</ol>"
        : "");

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.scrollTop = 0;
    placeLabels();
  }

  // ── Chrome: panel, tooltip, fit button, hint, chips, search ────────────────

  function buildChrome() {
    panel = document.createElement("aside");
    panel.className = "graph-panel";
    panel.setAttribute("aria-live", "polite");
    panel.setAttribute("aria-hidden", "true");
    panel.addEventListener("click", e => {
      e.stopPropagation();
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.classList.contains("gp-close")) { select(null); return; }
      if (btn.dataset.id) { select(byId.get(btn.dataset.id), { pan: true }); return; }
      if (btn.dataset.theme != null) pinTheme(Number(btn.dataset.theme));
    });
    container.appendChild(panel);

    const fitBtn = document.createElement("button");
    fitBtn.type = "button";
    fitBtn.className = "graph-fit-btn";
    fitBtn.title = "Fit all papers in view";
    fitBtn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i> Fit';
    fitBtn.addEventListener("click", e => { e.stopPropagation(); fit(600); });
    container.appendChild(fitBtn);

    hint = document.createElement("div");
    hint.className = "graph-hint";
    container.appendChild(hint);
    updateHint();

    if (canHover) {
      tip = document.createElement("div");
      tip.className = "graph-tip";
      document.body.appendChild(tip);
    }

    renderChips();

    const search = document.getElementById("pub-graph-search");
    if (search) {
      search.addEventListener("input", () => runSearch(search.value));
      search.addEventListener("keydown", e => {
        if (e.key === "Enter" && S.matches && S.matches.size) {
          e.preventDefault();
          const best = [...S.matches].map(id => byId.get(id))
            .sort((a, b) => (b.citations || 0) - (a.citations || 0) || b.year - a.year)[0];
          select(best, { pan: true });
        } else if (e.key === "Escape") {
          search.value = "";
          runSearch("");
        }
      });
    }
  }

  function updateHint() {
    if (!hint) return;
    const tap = canHover ? "click" : "tap";
    hint.textContent = compact
      ? "Pinch to zoom · tap a paper"
      : S.layout === "network"
        ? (canHover ? "Scroll to zoom · drag to pan · " : "Pinch to zoom · ") +
          tap + " a paper for details · " + tap + " a theme name to highlight it"
        : (canHover ? "Scroll to zoom · " : "") + tap + " a paper for details";
  }

  function runSearch(value) {
    S.query = value.trim().toLowerCase();
    const count = document.getElementById("pub-graph-count");
    if (S.query.length < 2) {
      S.matches = null;
      if (count) count.textContent = "";
    } else {
      const terms = S.query.split(/\s+/);
      S.matches = new Set(nodes.filter(n => visible(n) && terms.every(t => n.search.includes(t))).map(n => n.id));
      if (count) {
        count.textContent = S.matches.size
          ? S.matches.size + (S.matches.size === 1 ? " match" : " matches") + " · Enter to open"
          : "No matches";
      }
    }
    S.themePinned = null;
    if (S.selected && S.matches && !S.matches.has(S.selected)) select(null);
    else applyHighlight();
  }

  function chipIcon(kind) {
    const s = 12, c = s / 2;
    let shape;
    if (kind === "journal")         shape = '<circle cx="' + c + '" cy="' + c + '" r="4.2" fill="currentColor"/>';
    else if (kind === "conference") shape = '<circle cx="' + c + '" cy="' + c + '" r="4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.4,1.8"/>';
    else if (kind === "code")       shape = '<path d="M6 1.2 L10.8 6 L6 10.8 L1.2 6 Z" fill="currentColor"/>';
    else                            shape = '<rect x="2.2" y="2.2" width="7.6" height="7.6" fill="none" stroke="currentColor" stroke-width="1.3"/>';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + " " + s + '" aria-hidden="true">' + shape + "</svg>";
  }

  function renderChips() {
    const el = document.getElementById("pub-graph-filters");
    if (!el) return;
    const counts = d3.rollup(nodes, v => v.length, n => n.kind);
    el.innerHTML = '<span class="graph-toolbar-label">Show</span>' + KIND_ORDER
      .filter(k => counts.get(k))
      .map(k => {
        const on = !S.hidden.has(k);
        return '<button type="button" class="graph-chip' + (on ? " active" : "") + '" data-kind="' + k +
          '" aria-pressed="' + on + '">' + chipIcon(k) + "<span>" + esc(KIND_LABEL[k]) + "</span>" +
          '<span class="graph-chip-count">' + counts.get(k) + "</span></button>";
      }).join("");
    el.querySelectorAll(".graph-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.kind;
        if (S.hidden.has(k)) {
          S.hidden.delete(k);
        } else {
          const remaining = nodes.filter(n => n.kind !== k && !S.hidden.has(n.kind)).length;
          if (!remaining) return;
          S.hidden.add(k);
        }
        renderChips();
        if (S.selected && S.hidden.has(byId.get(S.selected).kind)) S.selected = null;
        renderPanel();
        if (S.query) runSearch(S.query);
        else applyHighlight();
      });
    });
  }

  // ── Tooltip (pointer devices only) ─────────────────────────────────────────

  function showTip(e, d) {
    if (!tip) return;
    const color = colorOf(d);
    const theme = clusterById.get(d.cluster);
    tip.innerHTML =
      '<div class="gt-title">' + esc(d.title) + "</div>" +
      '<div class="gt-meta">' + esc(d.venue) + "</div>" +
      '<div class="gt-stats">' + esc(d.year) +
        (d.citations ? " · " + esc(d.citations) + (d.citations === 1 ? " citation" : " citations") : "") + "</div>" +
      '<div class="gt-foot"><span class="gp-dot" style="background:' + color + '"></span>' +
        '<span style="color:' + color + '">' + esc(theme ? theme.label : groupLabel(groupOf(d))) + "</span>" +
        '<span class="gt-cta">click for details</span></div>';
    tip.style.display = "block";
    moveTip(e);
  }

  function moveTip(e) {
    if (!tip || tip.style.display !== "block") return;
    const x = e.clientX + 16, y = e.clientY + 12;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = (x + w > window.innerWidth - 8 ? e.clientX - w - 16 : x) + "px";
    tip.style.top  = (y + h > window.innerHeight - 8 ? e.clientY - h - 12 : y) + "px";
  }

  function hideTip() {
    if (tip) tip.style.display = "none";
  }

  // ── Legend ─────────────────────────────────────────────────────────────────

  function renderLegend() {
    const el = document.getElementById("pub-graph-legend");
    if (!el) return;
    const map   = S.colorMode === "planet" ? PLANET_COLOR : TOPIC_COLOR;
    const order = S.colorMode === "planet" ? PLANET_ORDER : TOPIC_ORDER;
    const counts = d3.rollup(nodes, v => v.length, groupOf);
    el.innerHTML = order.filter(k => counts.get(k)).map(k =>
      '<span class="graph-legend-item">' +
        '<span class="graph-legend-dot" style="background:' + map[k] + ";box-shadow:0 0 6px " + map[k] + '55"></span>' +
        "<span>" + esc(groupLabel(k)) + '</span><span class="graph-legend-count">' + counts.get(k) + "</span>" +
      "</span>").join("") +
      '<span class="graph-legend-item graph-legend-size">' +
        '<svg width="34" height="14" aria-hidden="true"><circle cx="5" cy="7" r="3.5" fill="none" stroke="currentColor"/>' +
        '<circle cx="23" cy="7" r="6.5" fill="none" stroke="currentColor"/></svg>' +
        "<span>Larger = more citations</span></span>";
  }

})();
