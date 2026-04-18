# Oneko Cats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two pixel-art oneko cats to every page — an orange cat that chases the mouse cursor and a black cat that chases the orange cat.

**Architecture:** A single `createCat(options)` global factory function in `assets/js/oneko.js` handles all animation logic. Each cat is an independent instance with its own state, driven by a `targetFn` callback that returns `{x, y}`. The orange cat's target is the mouse; the black cat's target is `orange.position()`. Both cats are instantiated by an inline init block in `_includes/scripts.html`, which is included in every page via `_layouts/default.html`. Hidden on touch devices.

**Tech Stack:** Vanilla JS, Jekyll Liquid (for asset paths in the inline init block). No build step — `oneko.js` is served directly like `pub-graph.js`. No test framework — verification is manual via browser.

---

## File Map

| File | Change |
|---|---|
| `assets/images/oneko-orange.gif` | New — orange cat sprite sheet |
| `assets/images/oneko-black.gif` | New — black cat sprite sheet |
| `assets/js/oneko.js` | New — `createCat` factory + animation loop |
| `_includes/scripts.html` | Modify — add script tag + inline init block |

---

### Task 1: Acquire sprite sheets

**Files:**
- Create: `assets/images/oneko-orange.gif`
- Create: `assets/images/oneko-black.gif`

- [ ] **Step 1: Download the orange cat sprite**

The sprite sheets are 256×128px grids of 32×32px frames (8 columns × 4 rows). Download an orange tabby variant from one of these sources — pick whichever is available:

- https://raw.githubusercontent.com/adryd325/oneko.js/14bab15a755d0e35cd4ae19c931d96d306f5a4ea/oneko.gif (original gray — use to test layout first if colored variants are hard to find)
- Search https://github.com/adryd325/oneko.js/network/members for forks with colored sprites (look for "orange", "tabby", or "shiba" variants)
- The `yunyu/oneko.js` fork and `thedivtagguy/oneko` are known to have multiple color options

Save the orange cat sprite to:
```
assets/images/oneko-orange.gif
```

- [ ] **Step 2: Download the black cat sprite**

Using the same source repo/fork, download a black cat variant. Save to:
```
assets/images/oneko-black.gif
```

If no colored forks are readily found, use the original gray sprite for both temporarily — the animation logic can be verified before swapping sprites.

- [ ] **Step 3: Verify sprite dimensions**

```bash
file assets/images/oneko-orange.gif assets/images/oneko-black.gif
```

Expected output should confirm both are GIF files. Optionally open them in an image viewer to confirm they look like sprite sheets with small cat frames arranged in a grid.

- [ ] **Step 4: Commit**

```bash
git add assets/images/oneko-orange.gif assets/images/oneko-black.gif
git commit -m "Add orange and black oneko cat sprite sheets"
```

---

### Task 2: Write `assets/js/oneko.js`

**Files:**
- Create: `assets/js/oneko.js`

This file defines a single top-level `createCat` function (no IIFE, no module — it becomes a global so the init script in `scripts.html` can call it directly). No `//` line comments are needed inside this file (it's a standalone JS file served directly, not an inline script, so `//` comments are safe — but we avoid them anyway for consistency with the project style and use `/* */` instead if comments are needed).

- [ ] **Step 1: Create the file with the full implementation**

Create `assets/js/oneko.js` with this exact content:

```js
/* Oneko pixel cat — factory function.
   Creates a cat div that chases whatever targetFn() returns.
   Returns { position: () => {x, y} } so other cats can follow it. */
function createCat(options) {
  var CAT_SPEED = 11;
  var catX = options.spawnX;
  var catY = options.spawnY;
  var frameCount = 0;
  var idleTime = 0;
  var idleAnimation = null;
  var idleFrame = 0;

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

  function tick() {
    var target = options.targetFn();
    var diffX = catX - target.x;
    var diffY = catY - target.y;
    var distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance < CAT_SPEED || distance < 24) {
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

    var direction = '';
    if (diffY / distance > 0.5)  { direction += 'N'; }
    if (diffY / distance < -0.5) { direction += 'S'; }
    if (diffX / distance > 0.5)  { direction += 'W'; }
    if (diffX / distance < -0.5) { direction += 'E'; }

    setSprite(direction || 'idle', frameCount % 2);

    catX -= (diffX / distance) * CAT_SPEED;
    catY -= (diffY / distance) * CAT_SPEED;

    el.style.left = (catX - 16) + 'px';
    el.style.top  = (catY - 16) + 'px';
  }

  setInterval(tick, 100);

  return {
    position: function () { return { x: catX, y: catY }; }
  };
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

```bash
node --check assets/js/oneko.js
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add assets/js/oneko.js
git commit -m "Add oneko cat factory function"
```

---

### Task 3: Wire up in `_includes/scripts.html`

**Files:**
- Modify: `_includes/scripts.html`

**Critical constraint:** This file is processed by Jekyll's `compress` layout, which collapses all HTML to a single line. Any `//` line comments in the inline `<script>` block will consume everything after them on that collapsed line, causing a JavaScript syntax error. The init block below has zero `//` comments — do not add any.

- [ ] **Step 1: Replace the contents of `_includes/scripts.html`**

The current file contains:

```html
<script type="module" src="{{ base_path }}/assets/js/main.min.js"></script>

{% include analytics.html %}
```

Replace it with:

```html
<script type="module" src="{{ base_path }}/assets/js/main.min.js"></script>
<script src="{{ base_path }}/assets/js/oneko.js"></script>
<script>
(function () {
  if ('ontouchstart' in window) { return; }
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

{% include analytics.html %}
```

- [ ] **Step 2: Start the Jekyll server and verify in browser**

```bash
bundle exec jekyll serve -l -H localhost
```

Open `http://localhost:4000` in a browser. Move the mouse around. Expected:

1. Two small pixel cats appear near the bottom-left corner of the viewport
2. The orange cat runs toward the cursor from wherever it started
3. The black cat runs toward the orange cat, trailing behind it
4. Moving the cursor fast makes both cats run; stopping lets them settle and eventually play idle animations (sitting, sleeping, scratching)
5. Cats stay fixed on screen as you scroll (they use `position: fixed`)
6. Opening DevTools → toggling mobile emulation (touch device) → reloading: no cats appear

Navigate to `/publications/`, `/cv/`, `/talks/` — cats should appear on all pages.

- [ ] **Step 3: Commit**

```bash
git add _includes/scripts.html
git commit -m "Add oneko cats to every page"
```

---

### Task 4: Push and open PR

- [ ] **Step 1: Push the branch**

```bash
git push origin claude/wizardly-carson-fe4548
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "Add oneko orange and black pixel cats" --body "$(cat <<'EOF'
## Summary

- Adds two pixel-art oneko cats that appear on every page
- Orange cat chases the mouse cursor
- Black cat chases the orange cat (chain behavior)
- Hidden on touch devices (no cursor)
- Single \`createCat(options)\` factory in \`assets/js/oneko.js\`; two sprite assets in \`assets/images/\`

## Test plan

- [ ] Move mouse on home page — both cats appear and run correctly
- [ ] Stop mouse — cats idle, eventually sleep or scratch
- [ ] Navigate to /publications/, /cv/, /talks/ — cats present on all pages
- [ ] Open in Chrome DevTools with touch emulation — no cats

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
