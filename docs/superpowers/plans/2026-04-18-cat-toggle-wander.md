# Cat Toggle & Wander Behavior Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 🐾 Cats toggle button to the sidebar profile that shows/hides the oneko cats (persisted via localStorage), and replace their direct-pursuit movement with a waypoint-based wander system that feels more cat-like.

**Architecture:** Three files change. `oneko.js` gains a waypoint wander system and a `destroy()` return value. `scripts.html` replaces its IIFE with named lifecycle functions (`_releaseCats`, `_sendCatsHome`) and a global `toggleCats()` that saves to localStorage. `author-profile.html` adds a styled button that calls `toggleCats()`.

**Tech Stack:** Vanilla JS, Jekyll Liquid (for asset paths in inline scripts). No build step. No test framework — JS syntax is verified with `node --check`; behavior is verified manually in a browser.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `assets/js/oneko.js` | Waypoint wander logic + `destroy()` |
| Modify | `_includes/scripts.html` | Cat lifecycle management + localStorage + `window.toggleCats` |
| Modify | `_includes/author-profile.html` | Toggle button HTML + CSS |

---

### Task 1: Rewrite `assets/js/oneko.js` with waypoint wander and `destroy()`

**Files:**
- Modify: `assets/js/oneko.js`

**Context:** The current file defines `createCat(options)` which creates a cat div that chases `options.targetFn()` directly at speed 11. We're replacing it with a waypoint wander system (speed 5, indirect paths, occasional distractions, final-approach direct chase within 60px) and adding `destroy()` to the return value.

- [ ] **Step 1: Replace `assets/js/oneko.js` with the new implementation**

Replace the entire file with:

```js
/* Oneko pixel cat — factory function.
   Creates a cat div that wanders toward whatever targetFn() returns.
   Returns { position, destroy } so other cats can follow it and it can be removed. */
function createCat(options) {
  var CAT_SPEED = 5;
  var catX = options.spawnX;
  var catY = options.spawnY;
  var frameCount = 0;
  var idleTime = 0;
  var idleAnimation = null;
  var idleFrame = 0;

  /* Waypoint wander state */
  var wpX = options.spawnX;
  var wpY = options.spawnY;
  var wpTimer = 1; /* pick first waypoint on first tick */

  var spriteSets = {
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
    NW:          [[-1,  0], [-1, -1]]
  };

  var el = document.createElement('div');
  el.style.cssText = 'width:32px;height:32px;position:fixed;' +
    'background-image:url(' + options.spriteUrl + ');' +
    'image-rendering:pixelated;pointer-events:none;z-index:9999;' +
    'left:' + (catX - 16) + 'px;top:' + (catY - 16) + 'px';
  document.body.appendChild(el);

  function setSprite(name, frame) {
    var s = spriteSets[name];
    var f = s[frame % s.length];
    el.style.backgroundPosition = (f[0] * 32) + 'px ' + (f[1] * 32) + 'px';
  }

  function resetIdle() {
    idleAnimation = null;
    idleFrame = 0;
  }

  function idle() {
    idleTime++;
    if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
      idleAnimation = Math.random() < 0.5 ? 'sleeping' : 'scratchSelf';
    }
    if (idleAnimation === 'sleeping') {
      if (idleFrame < 8) {
        setSprite('tired', 0);
      } else {
        setSprite('sleeping', Math.floor(idleFrame / 4) % 2);
      }
      if (idleFrame > 192) { resetIdle(); }
    } else if (idleAnimation === 'scratchSelf') {
      setSprite('scratchSelf', idleFrame % 3);
      if (idleFrame > 9) { resetIdle(); }
    } else {
      setSprite('idle', 0);
    }
    idleFrame++;
  }

  function pickWaypoint(target) {
    if (Math.random() < 0.2) {
      wpX = Math.random() * window.innerWidth;
      wpY = Math.random() * window.innerHeight;
    } else {
      wpX = catX + (target.x - catX) * 0.35 + (Math.random() - 0.5) * 400;
      wpY = catY + (target.y - catY) * 0.35 + (Math.random() - 0.5) * 400;
      wpX = Math.max(0, Math.min(window.innerWidth,  wpX));
      wpY = Math.max(0, Math.min(window.innerHeight, wpY));
    }
    wpTimer = 30 + Math.floor(Math.random() * 50);
  }

  function tick() {
    var target = options.targetFn();

    var tdx = catX - target.x;
    var tdy = catY - target.y;
    var trueDist = Math.sqrt(tdx * tdx + tdy * tdy);

    var chaseX, chaseY, chaseDist;
    if (trueDist < 60) {
      chaseX = target.x;
      chaseY = target.y;
      chaseDist = trueDist;
    } else {
      wpTimer--;
      var wdx = catX - wpX;
      var wdy = catY - wpY;
      var wpDist = Math.sqrt(wdx * wdx + wdy * wdy);
      if (wpTimer <= 0 || wpDist < 24) {
        pickWaypoint(target);
      }
      chaseX = wpX;
      chaseY = wpY;
      wdx = catX - wpX;
      wdy = catY - wpY;
      chaseDist = Math.sqrt(wdx * wdx + wdy * wdy);
    }

    if (chaseDist < 24) {
      idle();
      return;
    }

    idleAnimation = null;
    idleFrame = 0;

    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.max(idleTime - 1, 0);
      if (idleTime > 7) { idleTime = 7; }
      return;
    }
    idleTime = 0;

    frameCount++;

    var diffX = catX - chaseX;
    var diffY = catY - chaseY;
    var direction = '';
    if (diffY / chaseDist > 0.5)  { direction += 'N'; }
    if (diffY / chaseDist < -0.5) { direction += 'S'; }
    if (diffX / chaseDist > 0.5)  { direction += 'W'; }
    if (diffX / chaseDist < -0.5) { direction += 'E'; }

    setSprite(direction || 'idle', frameCount % 2);

    catX -= (diffX / chaseDist) * CAT_SPEED;
    catY -= (diffY / chaseDist) * CAT_SPEED;

    el.style.left = (catX - 16) + 'px';
    el.style.top  = (catY - 16) + 'px';
  }

  var timer = setInterval(tick, 100);

  return {
    position: function () { return { x: catX, y: catY }; },
    destroy:  function () {
      clearInterval(timer);
      if (el.parentNode) { el.parentNode.removeChild(el); }
    }
  };
}
```

- [ ] **Step 2: Verify JS syntax**

Run:
```bash
node --check assets/js/oneko.js
```

Expected: no output (exit code 0). If there are errors, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add assets/js/oneko.js
git commit -m "feat: waypoint wander system and destroy() for oneko cats"
```

---

### Task 2: Rewrite `_includes/scripts.html` with lifecycle management

**Files:**
- Modify: `_includes/scripts.html`

**Context:** The current file has a self-executing IIFE that creates both cats immediately (with an early return for touch devices). We're replacing it with named functions, a `window.toggleCats` global, and localStorage-based persistence. The early return is changed to a flag so `window.toggleCats` is always defined (avoids onclick errors on touch devices where no cats exist).

**Important:** This file is a Jekyll include. It uses Liquid tags `{{ base_path }}` for asset URLs. Do NOT change those. The inline `<script>` block must NOT use `//` line comments — Jekyll's compress layout strips newlines, which breaks `//` comments. Use `/* */` block comments only.

- [ ] **Step 1: Replace `_includes/scripts.html` with the new implementation**

Replace the entire file with:

```html
<script src="{{ base_path }}/assets/js/oneko.js"></script>
<script>
(function () {
  var _touch = 'ontouchstart' in window;
  var mouseX = window.innerWidth  / 2;
  var mouseY = window.innerHeight / 2;
  if (!_touch) {
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
  }

  var _cats = null;

  function _releaseCats() {
    if (_cats || _touch) { return; }
    var orange = createCat({
      spriteUrl: '{{ base_path }}/assets/images/oneko-orange.gif',
      targetFn:  function () { return { x: mouseX, y: mouseY }; },
      spawnX: 80,
      spawnY: window.innerHeight - 80
    });
    var black = createCat({
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

  function _updateCatBtn() {
    var btn = document.getElementById('cat-toggle-btn');
    if (!btn) { return; }
    var on = !!_cats;
    btn.setAttribute('aria-pressed', String(on));
    btn.style.opacity = on ? '1' : '0.4';
    btn.title = on ? 'Send cats home' : 'Release the cats';
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

  if (localStorage.getItem('oneko-cats') !== 'off') {
    _releaseCats();
  }
  _updateCatBtn();
}());
</script>

{% include analytics.html %}
```

- [ ] **Step 2: Verify there are no `//` line comments in the inline script block**

Run:
```bash
grep -n '//' _includes/scripts.html
```

Expected: no matches (or only matches inside the Liquid `{% include analytics.html %}` line, which is fine). If `//` comments are present in the `<script>` block, convert them to `/* */`.

- [ ] **Step 3: Commit**

```bash
git add _includes/scripts.html
git commit -m "feat: cat lifecycle management with localStorage toggle"
```

---

### Task 3: Add toggle button to `_includes/author-profile.html`

**Files:**
- Modify: `_includes/author-profile.html`

**Context:** `author-profile.html` renders the sidebar profile section present on most pages (not the CV page). The button goes between the avatar `</div>` and the `.author__content` div. It calls `window.toggleCats()` which is defined by `scripts.html`. The `<style>` block is added inside this include — it will be rendered in the page body but browsers handle that gracefully and it keeps the styling co-located with the HTML.

The current file structure around the insertion point (lines 14–17):
```html
    {% endif %}
  </div>

  <div class="author__content">
```

- [ ] **Step 1: Insert the button and styles after the avatar `</div>` (after line 15)**

The file currently has this block:

```html
  <div class="author__avatar">
    {% if author.avatar contains "://" %}
    	<img src="{{ author.avatar }}" alt="{{ author.name }}">
    {% else %}
    	<img src="{{ author.avatar | prepend: "/images/" | prepend: base_path }}" class="author__avatar" alt="{{ author.name }}">
    {% endif %}
  </div>

  <div class="author__content">
```

Replace it with:

```html
  <div class="author__avatar">
    {% if author.avatar contains "://" %}
    	<img src="{{ author.avatar }}" alt="{{ author.name }}">
    {% else %}
    	<img src="{{ author.avatar | prepend: "/images/" | prepend: base_path }}" class="author__avatar" alt="{{ author.name }}">
    {% endif %}
  </div>

  <div class="author__cat-toggle">
    <button id="cat-toggle-btn"
            class="cat-toggle-btn"
            onclick="toggleCats()"
            aria-pressed="true"
            title="Send cats home">&#x1F43E; Cats</button>
  </div>

  <style>
  .author__cat-toggle { text-align: center; margin: 0.4em 0 0.6em; }
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
  .cat-toggle-btn:hover { border-color: rgba(224, 123, 57, 0.7); }
  </style>

  <div class="author__content">
```

- [ ] **Step 2: Manual browser verification**

Start the Jekyll dev server:
```bash
cd /Users/phillipsm/Documents/Professional/personal_website
bundle exec jekyll serve -l -H localhost
```

Open `http://localhost:4000` and verify:

1. ✅ A small `🐾 CATS` button appears below the profile picture, styled in Mars ochre
2. ✅ Both cats are visible and wandering (not beelining directly to the mouse)
3. ✅ Cats occasionally change direction and get "distracted"
4. ✅ Clicking the button makes the cats disappear; button opacity drops to 0.4
5. ✅ Clicking the button again releases the cats; button opacity returns to 1.0
6. ✅ Navigate to another page — cats respect the saved preference (if off, stay off; if on, appear)
7. ✅ In DevTools: `localStorage.getItem('oneko-cats')` returns `'off'` after dismissing, `'on'` after releasing, `null` if never touched
8. ✅ Deleting the localStorage key and reloading: cats appear (default on)

- [ ] **Step 3: Commit and push**

```bash
git add _includes/author-profile.html
git commit -m "feat: add cat toggle button to sidebar profile"
git push origin master
```
