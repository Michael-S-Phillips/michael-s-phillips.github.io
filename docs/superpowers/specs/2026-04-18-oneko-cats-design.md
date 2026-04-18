# Oneko Cats Design

**Date:** 2026-04-18  
**Status:** Approved

## Overview

Add two pixel-art "oneko" cats to every page of the site. An orange cat chases the mouse cursor; a black cat chases the orange cat, forming a chain. Both cats run the classic oneko animation loop (8-directional running, idle, sleeping, scratch). Hidden on touch devices where there is no cursor.

## Out of Scope

- Cat-to-cat collision avoidance
- Click interactions
- Sound

---

## File Structure

| File | Change |
|---|---|
| `assets/js/oneko.js` | New — factory function + animation loop |
| `assets/images/oneko-orange.gif` | New — orange cat sprite sheet (from adryd325/oneko.js repo or color fork) |
| `assets/images/oneko-black.gif` | New — black cat sprite sheet (same source) |
| `_includes/scripts.html` | Add script tag + inline init block |

No SCSS changes. No layout changes.

---

## Section 1: Sprite Assets

Download two 32×32-per-frame sprite sheets from the [adryd325/oneko.js](https://github.com/adryd325/oneko.js) repository or a known color fork:

- **`oneko-orange.gif`** — orange tabby variant
- **`oneko-black.gif`** — black cat variant

Each sprite sheet is a grid of 32×32px cells arranged in 8 columns × 4 rows (256×128px total). The `background-position` offset to show frame at (col, row) is `(col * 32)px (row * 32)px`. Columns and rows are zero-indexed from the top-left; the pseudo-code uses negative indices counting from col 0 (i.e., col -3 = col 5 from right, adjust to actual pixel offsets when implementing).

Place both files in `assets/images/`.

---

## Section 2: `createCat` API

`assets/js/oneko.js` defines a single top-level `createCat(options)` function (no IIFE wrapper, no module export — it becomes a global so the inline init script in `scripts.html` can call it directly).

```js
// options shape:
// {
//   spriteUrl: string,      — path to the sprite sheet gif
//   targetFn:  () => {x, y} — called each tick to get chase target coords
//   spawnX:    number,      — initial catX (page coords)
//   spawnY:    number,      — initial catY (page coords)
// }
//
// returns: { position: () => {x, y} }
//   so other cats can use it as a targetFn source
```

Internally, `createCat`:

1. Creates a `<div>` with:
   - `width: 32px; height: 32px`
   - `position: fixed` (stays on screen regardless of scroll)
   - `background-image: url(spriteUrl)`
   - `image-rendering: pixelated`
   - `pointer-events: none`
   - `z-index: 9999`
2. Appends the div to `document.body`
3. Runs `setInterval(tick, 100)`
4. Returns `{ position: () => ({ x: catX, y: catY }) }`

The returned `position()` accessor gives the cat's current page coordinates so a following cat can use it as its target.

---

## Section 3: Animation Logic

Follows the pseudo-code exactly. Reproduced here for completeness.

### State (per cat instance, closed over in the factory function)

```
catX, catY       — current position (page coords, centered on the 32px div)
frameCount = 0   — increments each tick, drives run-frame alternation
idleTime   = 0   — ticks spent idle
idleAnimation    — null | "sleeping" | "scratch"
idleFrame  = 0   — frame counter for idle animations
CAT_SPEED  = 11  — pixels moved per tick
```

### Sprite positions

Taken directly from adryd325/oneko.js. Each entry is `[col, row]`; `background-position` = `col * 32` px, `row * 32` px. Values are negative, so `-3 * 32 = -96px`.

```js
const spriteSets = {
  idle:        [[-3, -3]],
  alert:       [[-7, -3]],
  tired:       [[-3, -2]],
  sleeping:    [[-2,  0], [-2, -1]],
  scratchSelf: [[-5,  0], [-6,  0], [-7,  0]],
  N:           [[-1, -2], [-1, -3]],
  NE:          [[ 0, -2], [ 0, -3]],
  E:           [[-3,  0], [-3, -1]],
  SE:          [[-5, -1], [-5, -2]],
  S:           [[-6, -3], [-7, -2]],
  SW:          [[-5, -3], [-6, -1]],
  W:           [[-4, -2], [-4, -3]],
  NW:          [[-1,  0], [-1, -1]],
};

// Usage: element.style.backgroundPosition = `${frame[0] * 32}px ${frame[1] * 32}px`
```

### `tick()` — runs every 100ms

```
diffX    = catX - target.x
diffY    = catY - target.y
distance = sqrt(diffX² + diffY²)

if distance < CAT_SPEED or distance < 24:
  idle()
  return

idleAnimation = null
idleFrame     = 0

if idleTime > 1:
  showSprite("alert")
  idleTime = max(idleTime - 1, 7)
  return

frameCount++

direction = ""
if diffY / distance > 0.5:  direction += "N"
if diffY / distance < -0.5: direction += "S"
if diffX / distance > 0.5:  direction += "W"
if diffX / distance < -0.5: direction += "E"

showSprite(direction, frameCount % 2)

catX -= (diffX / distance) * CAT_SPEED
catY -= (diffY / distance) * CAT_SPEED

div.style.left = (catX - 16) + "px"
div.style.top  = (catY - 16) + "px"
```

### `idle()` — called when cat has reached its target

```
idleTime++

if idleTime > 10 and random(200) == 0 and idleAnimation == null:
  idleAnimation = random pick from ["sleeping", "scratch"]

switch idleAnimation:
  "sleeping":
    if idleFrame < 8:  showSprite("tired")
    else:              showSprite("sleeping", floor(idleFrame / 4) % 2)
    if idleFrame > 192: resetIdle()

  "scratch":
    showSprite("scratch", idleFrame % 3)
    if idleFrame > 9: resetIdle()

  default:
    showSprite("idle")

idleFrame++
```

---

## Section 4: Wiring in `_includes/scripts.html`

```html
<script src="{{ base_path }}/assets/js/oneko.js"></script>
<script>
(function () {
  if ('ontouchstart' in window) return;
  var mouseX = window.innerWidth  / 2;
  var mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  var orange = createCat({
    spriteUrl: '{{ base_path }}/assets/images/oneko-orange.gif',
    targetFn:  function () { return { x: mouseX, y: mouseY }; },
    spawnX: 80,
    spawnY: window.innerHeight - 80
  });
  createCat({
    spriteUrl: '{{ base_path }}/assets/images/oneko-black.gif',
    targetFn:  function () { return orange.position(); },
    spawnX: 20,
    spawnY: window.innerHeight - 40
  });
}());
</script>
```

**Notes:**
- The init block is an IIFE to avoid polluting global scope
- `mouseX/mouseY` are initialised to viewport center so the orange cat starts moving immediately toward wherever the cursor first appears
- `clientX/clientY` (not `pageX/pageY`) are used because the cats use `position: fixed`
- The inline `<script>` uses no `//` line comments (Jekyll compress layout collapses all whitespace, which breaks `//` comments in inline scripts). The init block above has none; `oneko.js` itself is a standalone file and may use `//` comments freely
- `{{ base_path }}` is a Jekyll Liquid variable — valid inside `_includes/scripts.html`

---

## Summary

Two cats, one JS file, two sprite assets, one `_includes` edit. No new pages, no SCSS, no layout changes.
