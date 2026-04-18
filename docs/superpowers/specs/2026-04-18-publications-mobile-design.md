# Publications Page — Mobile UX Design

**Date:** 2026-04-18  
**Status:** Approved

## Problem

The publications page has two mobile UX failures:

1. **List view** — featured publications use a fixed 350px-wide teaser image in a flex row with no mobile breakpoint. On narrow screens the image overflows or squishes the text.
2. **Graph view** — the hover tooltip (`mouseover`/`mouseout`) does not fire on touch devices. The hint text references desktop gestures ("scroll to zoom · drag to pan · click node to open paper") which are wrong on mobile.

## Goals

- Stack image above text on mobile (< 600px) — no layout change above that breakpoint
- Replace hover tooltip with a tap-triggered info panel that slides up from the bottom of the graph canvas
- Shorten the graph canvas on narrow screens so it doesn't dominate the viewport
- Adapt hint text to touch gestures on touch devices
- Zero impact on the desktop experience

## Out of Scope

- Increasing node hit-target size on mobile (good idea, deferred)
- Adjusting force-simulation repulsion for narrow canvases (deferred)
- Swipe-to-dismiss gesture for the info panel (tap-outside is sufficient)

---

## Section 1 — List View CSS

**File:** `_sass/layout/_archive.scss`

Add one `@media (max-width: 599px)` block after the existing `.list__item .archive__item:has(.archive__item-teaser)` rules:

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

**Result:** below 600px, the teaser image becomes full-width and sits above the title and excerpt. Above 600px, the existing side-by-side layout is unchanged.

---

## Section 2 — Graph Touch Panel

**File:** `assets/js/pub-graph.js`

### Panel element

Create one `div#pub-graph-mobile-panel` inside `#pub-graph-container` (built once in `buildTooltip()`). It is `position: absolute; bottom: 0; left: 0; right: 0` — overlays the bottom of the graph canvas without pushing page content.

Panel anatomy:
- Paper title (serif, `#e4ddd4`)
- Venue + pub-type badge (colour-coded)
- Year · citation count (monospace, muted)
- Excerpt (2–3 lines)
- "↗ Open paper" button (links to `d.url`, opens in new tab)

A semi-transparent backdrop `div` (`position: absolute; inset: 0; background: rgba(0,0,0,0.45)`) sits between the SVG and the panel to signal selection. Both elements are hidden by default.

### Touch event handling

Attach `touchstart` to each node `<g>` in addition to the existing `click`/`mouseover`/`mouseout` handlers:

```
touchstart on node → stopPropagation, populate panel, show backdrop + panel
touchstart on SVG background → hide backdrop + panel
```

Touch events on desktop do not fire, so existing hover behaviour is fully preserved.

### Slide-up animation

The panel uses a CSS transition on `transform`:
- Hidden: `transform: translateY(100%); opacity: 0`
- Shown: `transform: translateY(0); opacity: 1; transition: transform 0.22s ease, opacity 0.18s ease`

Applied via a `.visible` class toggled in JS.

---

## Section 3 — Graph Mobile Polish

**File:** `assets/js/pub-graph.js`

### Adaptive canvas height

Current formula: `Math.min(Math.max(W * 0.65, 480), 680)`

On touch devices (detected once via `'ontouchstart' in window`), use:
`Math.min(Math.max(W * 0.9, 320), 420)`

A 375px phone gets ~340px canvas — usable without dominating the viewport.

### Adaptive hint text

At graph-build time, detect touch support:

```js
var isTouch = ('ontouchstart' in window);
var hintText = isTouch
  ? "pinch to zoom · drag to pan · tap node to preview"
  : "scroll to zoom · drag to pan · click node to open paper";
```

Render `hintText` into the existing bottom-left hint `<text>` element.

### Toolbar

The `.graph-toolbar` already has `flex-wrap: wrap`. No changes needed.

---

## File Change Summary

| File | Change |
|---|---|
| `_sass/layout/_archive.scss` | Add `@media (max-width: 599px)` block for stacked list layout |
| `assets/js/pub-graph.js` | Touch events, slide-up panel, adaptive height, adaptive hint text |

No new files. No changes to `_pages/publications.md`, `_includes/archive-single.html`, or any layout files.

**Build step:** after editing `pub-graph.js`, run `npm run build:js` to regenerate the minified asset served by the site.
