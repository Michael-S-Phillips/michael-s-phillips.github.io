# Publications Mobile UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the publications page usable on mobile — stacked image layout in list view, and a tap-to-show info panel replacing the hover tooltip in graph view.

**Architecture:** Two independent changes: (1) a CSS media query that collapses the side-by-side featured-publication layout below 600px; (2) JS additions to `pub-graph.js` that build a slide-up info panel inside the graph container and wire it to touch events on nodes. Desktop experience is untouched.

**Tech Stack:** SCSS (Jekyll/Dart Sass), vanilla JS (D3 v7 already loaded), no test framework — verification is manual via browser dev tools and a real mobile device or emulator.

---

## File Map

| File | Role |
|---|---|
| `_sass/layout/_archive.scss` | Add one `@media` block for mobile list layout |
| `assets/js/pub-graph.js` | Add isTouch state, adaptive height/hint, panel element, touch handlers |

`pub-graph.js` is served directly by Jekyll — no build step needed after editing it. (`npm run build:js` only rebuilds `main.min.js` for unrelated plugins.)

---

### Task 1: CSS — Stack featured publications on mobile

**Files:**
- Modify: `_sass/layout/_archive.scss` (after line 135, end of the flex rules block)

- [ ] **Step 1: Add the mobile media query block**

Open `_sass/layout/_archive.scss`. Find this closing brace (end of the `.list__item` block with the flex/teaser rules, around line 135):

```scss
  .archive__item-content {
    flex: 1;
    min-width: 0;
  }

  h2 {
    margin-top: 0;
  }

  p {
    margin-bottom: 0.5em;
  }
}
```

Immediately after that closing `}`, add:

```scss
@media (max-width: 599px) {
  .list__item .archive__item:has(.archive__item-teaser) {
    flex-direction: column;
  }

  .list__item .archive__item-teaser {
    flex: 0 0 auto;
    max-width: 100%;
    width: 100%;
    margin-bottom: 1em;
  }
}
```

- [ ] **Step 2: Verify in browser at mobile width**

Start the Jekyll server if not already running:
```bash
bundle exec jekyll serve -l -H localhost
```

Open `http://localhost:4000/publications/` in Chrome. Open DevTools → toggle device toolbar → set width to 375px.

Expected: featured publications show teaser image full-width above the title and excerpt, no horizontal overflow.

At 768px or wider: layout unchanged — image still sits beside text.

- [ ] **Step 3: Commit**

```bash
git add _sass/layout/_archive.scss
git commit -m "Fix featured publication layout overflow on mobile"
```

---

### Task 2: JS — Add isTouch state, adaptive height, adaptive hint text

**Files:**
- Modify: `assets/js/pub-graph.js`

- [ ] **Step 1: Add `isTouch` to the state block**

Find the `// ── State` section (around line 42):

```js
  let colorMode = "planet";  // "planet" | "topic"
  let simulation = null;
  let svgSel = null;
  let nodeSel = null;
  let linkSel = null;
  let initialized = false;
```

Replace with:

```js
  let colorMode = "planet";  // "planet" | "topic"
  let simulation = null;
  let svgSel = null;
  let nodeSel = null;
  let linkSel = null;
  let initialized = false;
  let isTouch = false;
```

- [ ] **Step 2: Set isTouch and update height formula in `build()`**

Find these two lines at the start of `build(data)` (around line 95):

```js
    const W = container.clientWidth  || 900;
    const H = Math.min(Math.max(W * 0.65, 480), 680);
```

Replace with:

```js
    const W = container.clientWidth  || 900;
    isTouch = ("ontouchstart" in window);
    const H = isTouch
      ? Math.min(Math.max(W * 0.9, 320), 420)
      : Math.min(Math.max(W * 0.65, 480), 680);
```

- [ ] **Step 3: Update hint text to adapt to touch devices**

Find the hint text block (around line 219):

```js
    // ── Hint text ---------------------------------------------------------
    svgSel.append("text")
      .attr("x", 12).attr("y", H - 10)
      .style("font-family", "'Jost', sans-serif")
      .style("font-size", "10px")
      .style("fill", "rgba(255,255,255,0.2)")
      .style("pointer-events", "none")
      .text("scroll to zoom · drag to pan · click node to open paper");
```

Replace with:

```js
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
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:4000/publications/` in Chrome DevTools with device emulation on (375px).

Switch to the Graph tab. Expected:
- Graph canvas is shorter (~340px, not 480px)
- Hint text reads "pinch to zoom · drag to pan · tap node to preview"

Switch device emulation off. Expected:
- Canvas is taller again
- Hint text reads "scroll to zoom · drag to pan · click node to open paper"

- [ ] **Step 5: Commit**

```bash
git add assets/js/pub-graph.js
git commit -m "Adapt graph height and hint text for touch devices"
```

---

### Task 3: JS — Mobile info panel and touch handlers

**Files:**
- Modify: `assets/js/pub-graph.js`

- [ ] **Step 1: Add `buildMobilePanel()` function**

Find the `// ── Tooltip` section (around line 229) — just after the closing `}` of `build(data)`. After the opening comment, add a new function `buildMobilePanel` before `buildTooltip`:

```js
  // ── Mobile panel ─────────────────────────────────────────────────────────

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
```

- [ ] **Step 2: Add `showPanel()` and `hidePanel()` functions**

Immediately after `buildMobilePanel`, add:

```js
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
        "line-height:1.35;margin-bottom:6px\">" + d.title + "</div>" +
      "<div style=\"display:flex;align-items:center;gap:6px;margin-bottom:4px\">" +
        "<span style=\"font-size:0.72em;letter-spacing:0.06em;text-transform:uppercase;" +
          "color:#4a9bbe\">" + d.venue + "</span>" +
        "<span style=\"font-size:0.65em;letter-spacing:0.07em;text-transform:uppercase;" +
          typeStyle + ";border-width:1px;padding:0 4px;border-radius:2px\">" + d.pub_type + "</span>" +
      "</div>" +
      "<div style=\"font-size:0.7em;font-family:'JetBrains Mono',monospace;" +
        "color:#6b7a96;margin-bottom:8px\">" +
        d.year + (d.citations ? " \u00b7 " + d.citations + " citations" : "") +
      "</div>" +
      "<div style=\"font-size:0.72em;color:#6b7a96;line-height:1.55;margin-bottom:10px\">" +
        d.excerpt +
      "</div>" +
      "<div style=\"display:flex;align-items:center;gap:6px;margin-bottom:10px\">" +
        "<span style=\"width:8px;height:8px;border-radius:50%;background:" + color + ";" +
          "display:inline-block;flex-shrink:0\"></span>" +
        "<span style=\"font-size:0.68em;letter-spacing:0.05em;text-transform:uppercase;" +
          "color:" + color + "\">" + tLabel + "</span>" +
      "</div>" +
      (d.url
        ? "<a href=\"" + d.url + "\" target=\"_blank\" rel=\"noopener\" " +
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
```

- [ ] **Step 3: Call `buildMobilePanel()` from `build()`**

Find the tooltip/legend calls inside `build(data)` (around line 213):

```js
    // ── Tooltip -----------------------------------------------------------
    buildTooltip();

    // ── Legend ------------------------------------------------------------
    renderLegend();
```

Replace with:

```js
    // ── Tooltip -----------------------------------------------------------
    buildTooltip();
    buildMobilePanel();

    // ── Legend ------------------------------------------------------------
    renderLegend();
```

- [ ] **Step 4: Add `touchstart` handler to node groups**

Find the node event handlers (around line 152):

```js
      .on("click",    (e, d) => { if (d.url) window.open(d.url, "_blank"); })
      .on("mouseover", onHover)
      .on("mouseout",  onUnhover)
```

Replace with:

```js
      .on("click",    (e, d) => { if (d.url) window.open(d.url, "_blank"); })
      .on("mouseover", onHover)
      .on("mouseout",  onUnhover)
      .on("touchstart", function (e, d) { e.stopPropagation(); showPanel(d); })
```

- [ ] **Step 5: Verify touch panel in browser**

Open `http://localhost:4000/publications/` in Chrome DevTools with device emulation (375px, touch enabled). Switch to Graph view.

Expected sequence:
1. Tap a node → backdrop dims graph, info panel slides up from bottom showing title, venue, year, excerpt, and "↗ Open paper" link
2. Tap the dimmed backdrop area → panel slides back down, backdrop hides
3. "↗ Open paper" link is tappable and opens the paper URL in a new tab
4. On desktop (no device emulation): hover still shows the floating tooltip as before; no panel appears

- [ ] **Step 7: Commit**

```bash
git add assets/js/pub-graph.js
git commit -m "Add tap-to-preview info panel for graph view on mobile"
```

---

### Task 4: Final check and push

- [ ] **Step 1: Check both views at multiple widths**

In Chrome DevTools, test at:
- 375px (iPhone SE) — list view stacked, graph panel works
- 768px (iPad portrait) — list view stacked (just below $medium), graph standard height
- 1024px (desktop) — list view side-by-side, graph hover tooltip works, panel absent

Confirm no horizontal scroll at any width.

- [ ] **Step 2: Push to master**

```bash
git push origin claude/wizardly-carson-fe4548
```

Then open a PR against `master`, or merge directly if working on master.
