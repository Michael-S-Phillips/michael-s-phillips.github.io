/* =============================================================
   Publication Graph — D3 v7 force-directed visualization
   Initialised by showPubGraph() called from publications page.
   ============================================================= */

(function () {
  "use strict";

  // ── Palette ──────────────────────────────────────────────────────────────

  const PLANET_COLOR = {
    mars:    "#e07b39",
    mercury: "#7fa8cc",
    earth:   "#5aaa78",
    multi:   "#d4a843",
  };

  const TOPIC_COLOR = {
    mineralogy:    "#d4883a",
    astrobiology:  "#5aaa78",
    remote_sensing:"#4a9bbe",
    ai_ml:         "#a87ac0",
    other:         "#6b7a96",
  };

  const PLANET_LABEL = {
    mars:    "Mars",
    mercury: "Mercury",
    earth:   "Earth / Analog",
    multi:   "Multi-body",
  };

  const TOPIC_LABEL = {
    mineralogy:    "Mineralogy & Crust",
    astrobiology:  "Astrobiology",
    remote_sensing:"Remote Sensing",
    ai_ml:         "AI / ML & Software",
    other:         "Other",
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let colorMode = "planet";  // "planet" | "topic"
  let simulation = null;
  let svgSel = null;
  let nodeSel = null;
  let linkSel = null;
  let initialized = false;
  let isTouch = false;

  // ── Public entry point ────────────────────────────────────────────────────

  window.initPubGraph = function (data) {
    if (initialized) return;
    initialized = true;
    build(data);
  };

  window.setPubColorMode = function (mode) {
    colorMode = mode;
    if (!nodeSel) return;
    nodeSel.select(".node-circle")
      .transition().duration(400)
      .attr("fill", d => d.pub_type === "journal" ? nodeColor(d) : "none")
      .attr("stroke", d => nodeColor(d));
    nodeSel.select(".node-glow-ring")
      .attr("stroke", d => nodeColor(d));
    renderLegend();
    // update active button styling
    document.querySelectorAll(".graph-color-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  function nodeColor(d) {
    return colorMode === "planet"
      ? (PLANET_COLOR[d.planet] || "#6b7a96")
      : (TOPIC_COLOR[d.topic]   || "#6b7a96");
  }

  function nodeRadius(d) {
    const base = 7;
    const c = d.citations || 0;
    // sqrt scale: 0→7, 5→9, 16→10.2, 19→10.5 — differentiated but not overwhelming
    return base + Math.sqrt(c) * 0.8;
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  function build(data) {
    const container = document.getElementById("pub-graph-container");
    if (!container) return;

    const W = container.clientWidth  || 900;
    isTouch = ("ontouchstart" in window);
    const H = isTouch
      ? Math.min(Math.max(W * 0.9, 320), 420)
      : Math.min(Math.max(W * 0.65, 480), 680);
    container.style.height = H + "px";

    // ── SVG ----------------------------------------------------------------
    svgSel = d3.select("#pub-graph-container")
      .append("svg")
      .attr("width",  "100%")
      .attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Subtle background grid dots
    const defs = svgSel.append("defs");
    const pattern = defs.append("pattern")
      .attr("id", "grid-dots")
      .attr("width", 28).attr("height", 28)
      .attr("patternUnits", "userSpaceOnUse");
    pattern.append("circle")
      .attr("cx", 1).attr("cy", 1).attr("r", 0.7)
      .attr("fill", "rgba(255,255,255,0.05)");

    svgSel.append("rect")
      .attr("width", "100%").attr("height", "100%")
      .attr("fill", "url(#grid-dots)");

    // Glow filter
    const filter = defs.append("filter").attr("id", "node-glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3").attr("result", "coloredBlur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "coloredBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // ── Zoom ---------------------------------------------------------------
    const g = svgSel.append("g").attr("class", "graph-g");
    svgSel.call(
      d3.zoom()
        .scaleExtent([0.25, 5])
        .on("zoom", e => g.attr("transform", e.transform))
    );

    // ── Links --------------------------------------------------------------
    linkSel = g.append("g").attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.07)")
      .attr("stroke-width", d => Math.max(0.5, d.weight * 4));

    // ── Nodes --------------------------------------------------------------
    nodeSel = g.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", d => d.url ? "pointer" : "default")
      .on("click",    (e, d) => { if (d.url) window.open(d.url, "_blank"); })
      .on("mouseover", onHover)
      .on("mouseout",  onUnhover)
      .on("touchstart", function (e, d) { e.stopPropagation(); showPanel(d); })
      .call(
        d3.drag()
          .on("start", dragStart)
          .on("drag",  dragged)
          .on("end",   dragEnd)
      );

    // Outer glow ring (hidden by default, shown on hover)
    nodeSel.append("circle")
      .attr("class", "node-glow-ring")
      .attr("r", d => nodeRadius(d) + 5)
      .attr("fill", "none")
      .attr("stroke", d => nodeColor(d))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0);

    // Main circle — solid fill for journals, dashed ring for conferences
    nodeSel.append("circle")
      .attr("class", "node-circle")
      .attr("r", d => nodeRadius(d))
      .attr("fill", d => d.pub_type === "journal" ? nodeColor(d) : "none")
      .attr("stroke", d => nodeColor(d))
      .attr("stroke-width", d => d.pub_type === "journal" ? 1.2 : 2.2)
      .attr("stroke-dasharray", d => d.pub_type === "conference" ? "4,3" : null);

    // Year label (last two digits, inside circle)
    nodeSel.append("text")
      .attr("class", "node-year")
      .text(d => String(d.year).slice(2))
      .attr("text-anchor", "middle")
      .attr("dy", "0.36em")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "6.5px")
      .style("fill", "rgba(0,0,0,0.55)")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // ── Force simulation ---------------------------------------------------
    simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links)
        .id(d => d.id)
        .distance(d => 90 - d.weight * 35)
        .strength(d => d.weight * 0.45)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide(d => nodeRadius(d) + 10))
      .alphaDecay(0.025);

    simulation.on("tick", () => {
      linkSel
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // ── Tooltip -----------------------------------------------------------
    buildTooltip();
    buildMobilePanel();

    // ── Legend ------------------------------------------------------------
    renderLegend();

    // ── Hint text ---------------------------------------------------------
    const hintText = isTouch
      ? "pinch to zoom \u00b7 drag to pan \u00b7 tap node to preview"
      : "scroll to zoom \u00b7 drag to pan \u00b7 click node to open paper";
    svgSel.append("text")
      .attr("x", 12).attr("y", H - 10)
      .style("font-family", "'Jost', sans-serif")
      .style("font-size", "10px")
      .style("fill", "rgba(255,255,255,0.2)")
      .style("pointer-events", "none")
      .text(hintText);
  }

  // ── Mobile panel ─────────────────────────────────────────────────────────

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildMobilePanel() {
    if (document.getElementById("pub-graph-mobile-panel")) return;
    const container = document.getElementById("pub-graph-container");
    if (!container) return;

    const backdrop = document.createElement("div");
    backdrop.id = "pub-graph-mobile-backdrop";
    backdrop.style.cssText = [
      "position:absolute", "inset:0",
      "background:rgba(0,0,0,0.45)",
      "display:none", "z-index:10",
      "pointer-events:none"
    ].join(";");
    backdrop.addEventListener("touchstart", function (e) {
      e.preventDefault();
      hidePanel();
    });

    const panel = document.createElement("div");
    panel.id = "pub-graph-mobile-panel";
    panel.style.cssText = [
      "position:absolute", "bottom:0", "left:0", "right:0",
      "background:rgba(10,12,18,0.97)",
      "border-top:1px solid rgba(224,123,57,0.3)",
      "padding:14px 16px 18px",
      "z-index:11",
      "transform:translateY(100%)", "opacity:0",
      "transition:transform 0.22s ease,opacity 0.18s ease",
      "font-family:'Jost',sans-serif"
    ].join(";");

    container.appendChild(backdrop);
    container.appendChild(panel);
  }

  function showPanel(d) {
    const panel    = document.getElementById("pub-graph-mobile-panel");
    const backdrop = document.getElementById("pub-graph-mobile-backdrop");
    if (!panel) return;

    const color  = nodeColor(d);
    const tLabel = (colorMode === "planet" ? PLANET_LABEL[d.planet] : TOPIC_LABEL[d.topic]) || d.planet;
    const typeStyle = d.pub_type === "journal"
      ? "color:rgba(224,123,57,0.7);border-style:solid"
      : "color:rgba(107,122,150,0.8);border-style:dashed";

    panel.innerHTML =
      "<div style=\"font-family:'Crimson Pro',serif;font-size:1.05em;color:#e4ddd4;" +
        "line-height:1.35;margin-bottom:6px\">" + esc(d.title) + "</div>" +
      "<div style=\"display:flex;align-items:center;gap:6px;margin-bottom:4px\">" +
        "<span style=\"font-size:0.72em;letter-spacing:0.06em;text-transform:uppercase;" +
          "color:#4a9bbe\">" + esc(d.venue) + "</span>" +
        "<span style=\"font-size:0.65em;letter-spacing:0.07em;text-transform:uppercase;" +
          typeStyle + ";border-width:1px;padding:0 4px;border-radius:2px\">" + esc(d.pub_type) + "</span>" +
      "</div>" +
      "<div style=\"font-size:0.7em;font-family:'JetBrains Mono',monospace;" +
        "color:#6b7a96;margin-bottom:8px\">" +
        esc(d.year) + (d.citations ? " \u00b7 " + esc(d.citations) + " citations" : "") +
      "</div>" +
      "<div style=\"font-size:0.72em;color:#6b7a96;line-height:1.55;margin-bottom:10px\">" +
        esc(d.excerpt) +
      "</div>" +
      "<div style=\"display:flex;align-items:center;gap:6px;margin-bottom:10px\">" +
        "<span style=\"width:8px;height:8px;border-radius:50%;background:" + color + ";" +
          "display:inline-block;flex-shrink:0\"></span>" +
        "<span style=\"font-size:0.68em;letter-spacing:0.05em;text-transform:uppercase;" +
          "color:" + color + "\">" + esc(tLabel) + "</span>" +
      "</div>" +
      (d.url && /^https?:\/\//.test(d.url)
        ? "<a href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\" " +
            "style=\"display:inline-block;font-size:0.72em;letter-spacing:0.07em;" +
            "text-transform:uppercase;color:#e07b39;border:1px solid rgba(224,123,57,0.4);" +
            "padding:5px 12px;border-radius:2px;text-decoration:none\">\u2197 Open paper</a>"
        : "");

    if (backdrop) {
      backdrop.style.display = "block";
      backdrop.style.pointerEvents = "auto";
    }
    panel.style.transform = "translateY(0)";
    panel.style.opacity   = "1";
  }

  function hidePanel() {
    const panel    = document.getElementById("pub-graph-mobile-panel");
    const backdrop = document.getElementById("pub-graph-mobile-backdrop");
    if (panel) {
      panel.style.transform = "translateY(100%)";
      panel.style.opacity   = "0";
    }
    if (backdrop) {
      backdrop.style.display      = "none";
      backdrop.style.pointerEvents = "none";
    }
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────

  function buildTooltip() {
    // Create tooltip div if not already present
    if (document.getElementById("pub-graph-tooltip")) return;
    const tip = document.createElement("div");
    tip.id = "pub-graph-tooltip";
    tip.style.cssText = `
      position: fixed;
      display: none;
      max-width: 300px;
      padding: 12px 14px;
      background: rgba(10, 12, 18, 0.96);
      border: 1px solid rgba(224,123,57,0.25);
      border-radius: 3px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.6);
      pointer-events: none;
      z-index: 9999;
      font-family: 'Jost', sans-serif;
    `;
    document.body.appendChild(tip);
  }

  function showTip(e, d) {
    const tip = document.getElementById("pub-graph-tooltip");
    if (!tip) return;

    const pColor  = PLANET_COLOR[d.planet] || "#6b7a96";
    const tLabel  = (colorMode === "planet" ? PLANET_LABEL[d.planet] : TOPIC_LABEL[d.topic]) || d.planet;
    const color   = nodeColor(d);

    tip.innerHTML = `
      <div style="font-family:'Crimson Pro',serif;font-size:1.05em;font-weight:400;
                  color:#e4ddd4;line-height:1.3;margin-bottom:6px">${d.title}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-size:0.72em;letter-spacing:0.06em;text-transform:uppercase;
                     color:#4a9bbe">${d.venue}</span>
        <span style="font-size:0.65em;letter-spacing:0.07em;text-transform:uppercase;
                     color:${d.pub_type==='journal'?'rgba(224,123,57,0.7)':'rgba(107,122,150,0.8)'};
                     border:1px ${d.pub_type==='journal'?'solid':'dashed'} currentColor;
                     padding:0 4px;border-radius:2px">${d.pub_type}</span>
      </div>
      <div style="font-size:0.7em;font-family:'JetBrains Mono',monospace;
                  color:#6b7a96;margin-bottom:8px">${d.year}${d.citations ? ` &nbsp;·&nbsp; ${d.citations} citations` : ''}</div>
      <div style="font-size:0.72em;color:#6b7a96;line-height:1.55;margin-bottom:8px">${d.excerpt}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};
                     display:inline-block;flex-shrink:0"></span>
        <span style="font-size:0.68em;letter-spacing:0.05em;text-transform:uppercase;
                     color:${color}">${tLabel}</span>
        ${d.url ? `<span style="margin-left:auto;font-size:0.68em;color:rgba(224,123,57,0.7)">↗ open</span>` : ""}
      </div>
    `;
    tip.style.display = "block";
    moveTip(e);
  }

  function moveTip(e) {
    const tip = document.getElementById("pub-graph-tooltip");
    if (!tip) return;
    const x = e.clientX + 14;
    const y = e.clientY - 10;
    const overflowX = x + 310 > window.innerWidth;
    tip.style.left = (overflowX ? e.clientX - 320 : x) + "px";
    tip.style.top  = y + "px";
  }

  function hideTip() {
    const tip = document.getElementById("pub-graph-tooltip");
    if (tip) tip.style.display = "none";
  }

  // ── Hover interactions ───────────────────────────────────────────────────

  function onHover(event, d) {
    // Glow ring
    d3.select(this).select(".node-glow-ring")
      .transition().duration(200)
      .attr("opacity", 0.6);

    // Highlight connected edges + neighbours, dim others
    const connectedIds = new Set();
    linkSel.each(function(l) {
      const srcId = l.source.id || l.source;
      const tgtId = l.target.id || l.target;
      if (srcId === d.id || tgtId === d.id) {
        connectedIds.add(srcId);
        connectedIds.add(tgtId);
      }
    });

    linkSel
      .transition().duration(200)
      .attr("stroke", l => {
        const s = l.source.id || l.source;
        const t = l.target.id || l.target;
        return (s === d.id || t === d.id)
          ? nodeColor(d)
          : "rgba(255,255,255,0.03)";
      })
      .attr("stroke-width", l => {
        const s = l.source.id || l.source;
        const t = l.target.id || l.target;
        return (s === d.id || t === d.id) ? Math.max(1, l.weight * 5) : 0.4;
      })
      .attr("stroke-opacity", l => {
        const s = l.source.id || l.source;
        const t = l.target.id || l.target;
        return (s === d.id || t === d.id) ? 0.7 : 0.15;
      });

    nodeSel.select(".node-circle")
      .transition().duration(200)
      .attr("opacity", nd => connectedIds.has(nd.id) ? 1.0 : 0.2);

    showTip(event, d);
    event.target.addEventListener("mousemove", moveTip);
  }

  function onUnhover(event, d) {
    d3.select(this).select(".node-glow-ring")
      .transition().duration(300)
      .attr("opacity", 0);

    linkSel
      .transition().duration(300)
      .attr("stroke", "rgba(255,255,255,0.07)")
      .attr("stroke-width", l => Math.max(0.5, l.weight * 4))
      .attr("stroke-opacity", 1);

    nodeSel.select(".node-circle")
      .transition().duration(300)
      .attr("opacity", 1);

    hideTip();
    event.target.removeEventListener("mousemove", moveTip);
  }

  // ── Drag handlers ────────────────────────────────────────────────────────

  function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // ── Legend ───────────────────────────────────────────────────────────────

  function renderLegend() {
    const el = document.getElementById("pub-graph-legend");
    if (!el) return;
    const map    = colorMode === "planet" ? PLANET_COLOR : TOPIC_COLOR;
    const labels = colorMode === "planet" ? PLANET_LABEL  : TOPIC_LABEL;
    el.innerHTML = Object.entries(map).map(([k, c]) => `
      <span class="graph-legend-item">
        <span style="width:10px;height:10px;border-radius:50%;background:${c};
                     display:inline-block;flex-shrink:0;box-shadow:0 0 6px ${c}55"></span>
        <span>${labels[k] || k}</span>
      </span>
    `).join("");
  }

})();
