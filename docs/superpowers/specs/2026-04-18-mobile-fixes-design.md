# Mobile Fixes Design

**Date:** 2026-04-18

## Overview

Three independent mobile issues to fix on the personal academic Jekyll site:

1. **Cats disabled on mobile** — touch devices are completely blocked
2. **Sidebar overlap** — cat toggle button hidden under fixed masthead on mobile
3. **Hamburger nav unresponsive** — three-bar icon doesn't work on mobile

---

## Fix 1: Mobile cat support (touchmove)

### Problem

`_includes/scripts.html` sets `var _touch = 'ontouchstart' in window` and then:
- Skips the event listener setup entirely on touch devices
- Guards `_releaseCats()` with `if (_cats || _touch) { return; }` — cats never spawn on mobile

### Solution

Replace the `_touch`-based guard with conditional listener registration. Remove `_touch` variable entirely.

**Event listener setup:**
```js
var mouseX = window.innerWidth / 2;
var mouseY = window.innerHeight / 2;

if ('ontouchstart' in window) {
  document.addEventListener('touchmove', function (e) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });
} else {
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
}
```

**`_releaseCats` guard** — remove `|| _touch`:
```js
function _releaseCats() {
  if (_cats) { return; }
  // ... rest unchanged
}
```

### Behavior

- On mobile: orange cat chases wherever the user touches/drags. Black cat chases orange (same chain as desktop).
- When finger lifts, `mouseX`/`mouseY` stay at last touch position. The waypoint system in `oneko.js` naturally kicks in — the cat is either already within 60px of that position (idle) or wanders via waypoints. No additional code needed.
- On desktop: unchanged.

### File

`_includes/scripts.html` — minimal diff, ~4 lines changed.

---

## Fix 2: Sidebar padding on mobile

### Problem

`assets/js/plugins/jquery.greedy-navigation.js` (lines 64–68):

```js
if ($(".author__urls-wrapper button").is(":visible")) {
  $(".sidebar").css("padding-top", "");        // mobile path — clears padding
} else {
  $(".sidebar").css("padding-top", mastheadHeight + "px");  // desktop path
}
```

The `.author__urls-wrapper button` is the "Follow" toggle button — it is **visible on mobile** (collapsed link list) and **hidden on desktop** (links always shown). So the condition is inverted from what we need: mobile clears padding, desktop sets it.

On desktop the sidebar is `position: fixed`, and `_sidebar.scss` gives it `padding-top: $masthead-height` at the wide breakpoint. On mobile the sidebar is in normal flow; without JS-set padding it sits directly under the fixed masthead, hiding the cat toggle button.

### Solution

Remove the conditional. Always set sidebar padding-top to the live masthead height:

```js
$(".sidebar").css("padding-top", mastheadHeight + "px");
```

This is safe on desktop too — the JS inline style was already overriding the SCSS variable on desktop, so behavior there is unchanged.

### File

`assets/js/plugins/jquery.greedy-navigation.js` — 3-line conditional collapsed to 1 line.

---

## Fix 3: Hamburger nav unresponsive on mobile

### Problem

The greedy nav button (`#site-nav button`, rendered as three bars) uses `hidden` CSS class to show/hide. On mobile all nav items overflow to `$hlinks` so the button should become visible. Possible failure modes:

1. **Z-index / stacking context** — `.masthead` has `backdrop-filter: blur(14px)` which creates a stacking context. The button may render behind it or have its click area blocked.
2. **`hidden` class not being removed** — if `updateNav()` fires before layout is computed (e.g., before fonts load and masthead height settles), the width comparison may not trigger properly.
3. **Button hit area** — the button's `background: transparent` override in `custom.scss` combined with no explicit size may produce a near-zero clickable area.

### Solution

Investigate first (verify in DevTools which failure mode applies), then apply the appropriate fix:

- **If z-index:** Add `position: relative; z-index: 20` to `.greedy-nav__toggle` in `custom.scss`.
- **If timing:** Re-call `updateNav()` on `window.load` (after fonts/images settle) in addition to the existing call.
- **If hit area:** Add `min-width` / `min-height` or `padding` to `.greedy-nav__toggle` in `custom.scss`.

The implementation task includes a check step: open the site on mobile viewport in DevTools, inspect the button, and confirm which path applies before coding.

### File

`assets/css/custom.scss` (likely) — small addition to `.greedy-nav__toggle` block.

---

## Files Changed

| File | Change |
|------|--------|
| `_includes/scripts.html` | Replace `_touch` guard with touchmove listener |
| `assets/js/plugins/jquery.greedy-navigation.js` | Always set sidebar padding-top |
| `assets/css/custom.scss` | Fix hamburger button (z-index / size / timing) |

---

## Testing

- **Mobile cats:** Open site on iPhone/Android (or Chrome DevTools mobile emulation). Tap/drag — orange cat should follow. Lift finger — cats should wander. Tap cat toggle button — cats should stop/restart.
- **Sidebar overlap:** On mobile viewport, confirm cat toggle button is fully visible below the masthead bar (not clipped).
- **Hamburger:** On mobile viewport, tap three-bar icon — hidden nav links dropdown should appear. Tap again — dropdown closes.
- **Desktop regression:** Confirm cats still follow mouse, sidebar still has correct top clearance, greedy nav still works at all widths.
