# Cat Toggle & Wander Behavior Design
*2026-04-18*

## Goal

Add an on/off toggle button near the profile picture that shows/hides the oneko cats with preference persisted via `localStorage`. Simultaneously replace the cats' direct-pursuit movement with a waypoint-based wander system that feels more cat-like — indirect paths, occasional distractions, gradual drift toward the true target.

---

## Files Changed

| Action | File |
|---|---|
| Modify | `assets/js/oneko.js` |
| Modify | `_includes/scripts.html` |
| Modify | `_includes/author-profile.html` |

---

## Behavior Changes

### Waypoint Wander System (`oneko.js`)

Each cat instance maintains an internal waypoint `(wpX, wpY)` and a `waypointTimer` countdown. The cat chases its waypoint instead of `targetFn()` directly.

**Speed:** `CAT_SPEED` reduced from `11` to `5`.

**Waypoint update** — triggered when `waypointTimer` reaches 0 or the cat arrives within 24px of the waypoint:

- Reset timer to a random value between 30 and 80 ticks (3–8 seconds at 100 ms/tick).
- **20% chance (distraction):** new waypoint = random point anywhere on screen (`Math.random() * window.innerWidth`, `Math.random() * window.innerHeight`).
- **80% chance (drift):** compute a point 35% of the way from the cat's current position toward `targetFn()`, then add `(Math.random() - 0.5) * 400` to both x and y (±200px spread). Clamp result to screen bounds (0–innerWidth, 0–innerHeight).

**Final approach override:** when the cat is within **60px of `targetFn()`**, ignore the waypoint entirely and chase the true target directly (same movement code as before). This allows cats to actually reach the mouse / the orange cat.

**Idle behaviour** is unchanged: triggers when within 24px of the waypoint (or true target during final approach).

**Waypoint initialisation:** on `createCat`, set `wpX = spawnX`, `wpY = spawnY`, `waypointTimer = 1` (so a waypoint is picked on the very first tick).

### `destroy()` Return Value (`oneko.js`)

`createCat` currently returns `{ position }`. It also returns `destroy()`:

```js
var timer = setInterval(tick, 100);
return {
  position: function () { return { x: catX, y: catY }; },
  destroy:  function () {
    clearInterval(timer);
    if (el.parentNode) { el.parentNode.removeChild(el); }
  }
};
```

---

## Toggle System (`scripts.html`)

Replace the existing self-executing IIFE with named functions and a global toggle:

```js
var _cats = null;

function _releaseCats() {
  if (_cats || ('ontouchstart' in window)) { return; }
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
  _cats = [orange, black];
}

function _sendCatsHome() {
  if (!_cats) { return; }
  _cats.forEach(function (c) { c.destroy(); });
  _cats = null;
}

window.toggleCats = function () {
  if (_cats) {
    _sendCatsHome();
    localStorage.setItem('oneko-cats', 'off');
  } else {
    _releaseCats();
    localStorage.setItem('oneko-cats', 'on');
  }
  _updateCatBtn();
};

window._updateCatBtn = function () {
  var btn = document.getElementById('cat-toggle-btn');
  if (!btn) { return; }
  var on = !!_cats;
  btn.setAttribute('aria-pressed', String(on));
  btn.style.opacity = on ? '1' : '0.4';
  btn.title = on ? 'Send cats home' : 'Release the cats';
};

/* Initialise on page load */
var mouseX = window.innerWidth  / 2;
var mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });

if (localStorage.getItem('oneko-cats') !== 'off') {
  _releaseCats();
}
_updateCatBtn();
```

Both cat references are stored in `_cats` so `_sendCatsHome` can destroy both. The black cat variable must be declared before `createCat` is called for it so the reference is available for the array literal on the next line.

**`localStorage` key:** `'oneko-cats'`  
**Values:** `'on'` / `'off'`  
**Default (key absent):** cats on

Touch devices (`'ontouchstart' in window`): `_releaseCats` returns early, no cats created, no button rendered.

---

## Toggle Button (`author-profile.html`)

Add immediately after the closing `</div>` of `.author__avatar`, before `.author__content`:

```html
{% unless site.data.ui-text[site.locale].cats_disabled %}
<div class="author__cat-toggle">
  <button id="cat-toggle-btn"
          class="cat-toggle-btn"
          onclick="toggleCats()"
          aria-pressed="true"
          title="Send cats home">
    🐾 Cats
  </button>
</div>
{% endunless %}
```

**Styling** (inline `<style>` block added to `author-profile.html`, or added to the site's SCSS):

```css
.author__cat-toggle {
  text-align: center;
  margin: 0.4em 0 0.6em;
}

.cat-toggle-btn {
  background: transparent;
  border: 1px solid rgba(224, 123, 57, 0.35);
  border-radius: 3px;
  color: var(--mars-ochre, #e07b39);
  cursor: pointer;
  font-family: 'Jost', sans-serif;
  font-size: 0.7em;
  font-weight: 400;
  letter-spacing: 0.08em;
  padding: 0.3em 0.9em;
  text-transform: uppercase;
  transition: opacity 0.2s, border-color 0.2s;
}

.cat-toggle-btn:hover {
  border-color: rgba(224, 123, 57, 0.7);
}
```

Opacity is controlled dynamically via `_updateCatBtn()`: `1.0` when cats are on, `0.4` when off. The button is not rendered on touch devices (handled by the Liquid `unless` guard checking for a flag, or simply always rendered but the JS never spawns cats — see implementation note below).

**Implementation note on touch:** The simplest approach is to always render the button HTML but have `_releaseCats()` / `toggleCats()` no-op on touch devices. The button will appear but do nothing on touch — acceptable since there are no cats anyway.

---

## Error Handling

| Situation | Behaviour |
|---|---|
| `localStorage` unavailable | `getItem` returns `null` (default on), `setItem` throws silently — cats appear, toggle works for session only |
| `toggleCats()` called before DOM ready | `_updateCatBtn` finds no `#cat-toggle-btn`, returns silently |
| `destroy()` called twice | Second call: `el.parentNode` is null, guard prevents error |
| CV page (no sidebar) | No `author-profile.html` include → no button → no issue |

---

## What This Does Not Do

- Does not add a toggle to the CV page (no sidebar there)
- Does not animate cats "walking home" before disappearing — they vanish immediately on dismiss
- Does not change the black cat's true target (still orange cat's position)
- Does not expose `CAT_SPEED` as a runtime setting — speed can be tuned by editing the constant in `oneko.js`
