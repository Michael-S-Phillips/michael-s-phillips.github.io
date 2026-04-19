# Mobile Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three independent mobile issues: cats disabled on touch devices, cat toggle button hidden under masthead, and hamburger nav not appearing on mobile.

**Architecture:** Three small, isolated JS/CSS edits in existing files. No new files. Each task is independent and can be committed separately. The site is a Jekyll static site — "testing" means starting a local server and verifying in Chrome DevTools mobile emulation at 375px width.

**Tech Stack:** Jekyll, vanilla JS, jQuery (greedy nav only), SCSS compiled via Jekyll

---

## File Map

| File | What changes |
|------|-------------|
| `_includes/scripts.html` | Replace touch guard with conditional touchmove/mousemove listener |
| `assets/js/plugins/jquery.greedy-navigation.js` | (1) Always set sidebar padding-top; (2) add `window.load` call to `updateNav()` |
| `assets/css/custom.scss` | Add `z-index` to `.hidden-links` and re-trigger hamburger fix |

---

## Task 1: Enable cats on touch devices

**Context:** `_includes/scripts.html` contains the cat bootstrap code. Currently `var _touch = 'ontouchstart' in window` is set and `_releaseCats()` bails early when `_touch` is true, so cats never spawn on mobile. The fix replaces this with a conditional listener — `touchmove` on touch devices, `mousemove` on desktop — and removes the bail-out guard.

**Files:**
- Modify: `_includes/scripts.html`

- [ ] **Step 1: Read the current file**

```bash
cat _includes/scripts.html
```

Confirm you see `var _touch = 'ontouchstart' in window;` on line 4 and `if (_cats || _touch) { return; }` in `_releaseCats`.

- [ ] **Step 2: Replace the file contents**

Replace the entire `<script>…</script>` block (lines 2–61) with the following. Keep the `<script src="…oneko.js">` line and the `{% include analytics.html %}` line unchanged.

```html
<script src="{{ base_path }}/assets/js/oneko.js"></script>
<script>
(function () {
  var mouseX = window.innerWidth  / 2;
  var mouseY = window.innerHeight / 2;

  if ('ontouchstart' in window) {
    document.addEventListener('touchmove', function (e) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }, { passive: true });
  } else {
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
  }

  var _cats = null;

  function _releaseCats() {
    if (_cats) { return; }
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

- [ ] **Step 3: Start the Jekyll server and verify in mobile emulation**

```bash
cd /Users/phillipsm/Documents/Professional/personal_website
bundle exec jekyll serve -l -H localhost --detach
```

Open `http://localhost:4000` in Chrome, open DevTools, switch to mobile emulation (iPhone SE, 375×667). Touch-drag on the screen — both cats should follow the touch point. Lift finger — cats should wander autonomously. The cat toggle button should still work.

Stop the server when done:
```bash
pkill -f "jekyll serve" 2>/dev/null; true
```

- [ ] **Step 4: Commit**

```bash
git add _includes/scripts.html
git commit -m "feat: enable cats on mobile via touchmove listener"
```

---

## Task 2: Fix sidebar overlap with masthead on mobile

**Context:** `assets/js/plugins/jquery.greedy-navigation.js` lines 64–68 contain:

```js
if ($(".author__urls-wrapper button").is(":visible")) {
  $(".sidebar").css("padding-top", "");
} else {
  $(".sidebar").css("padding-top", mastheadHeight + "px");
}
```

The `.author__urls-wrapper button` is the "Follow" toggle that is **visible on mobile** and **hidden on desktop**. So on mobile the condition is true and padding is cleared, causing the sidebar (in normal flow on mobile) to sit under the fixed masthead, hiding the cat toggle button.

**Files:**
- Modify: `assets/js/plugins/jquery.greedy-navigation.js`

- [ ] **Step 1: Locate the lines to change**

```bash
grep -n "author__urls-wrapper" assets/js/plugins/jquery.greedy-navigation.js
```

Expected output: two lines near 64–67 showing the if/else block.

- [ ] **Step 2: Replace the conditional with an unconditional set**

In `assets/js/plugins/jquery.greedy-navigation.js`, find:

```js
  if ($(".author__urls-wrapper button").is(":visible")) {
    $(".sidebar").css("padding-top", "");
  } else {
    $(".sidebar").css("padding-top", mastheadHeight + "px");
  }
```

Replace with:

```js
  $(".sidebar").css("padding-top", mastheadHeight + "px");
```

The surrounding context (inside `updateNav()`, after `$('body').css('padding-top', mastheadHeight + 'px')`) should now look like:

```js
  // update masthead height and the body/sidebar top padding
  var mastheadHeight = $('.masthead').height();
  $('body').css('padding-top', mastheadHeight + 'px');
  $(".sidebar").css("padding-top", mastheadHeight + "px");
```

- [ ] **Step 3: Verify mobile sidebar is no longer hidden**

```bash
bundle exec jekyll serve -l -H localhost --detach
```

Open `http://localhost:4000` in Chrome DevTools mobile emulation (375px). Scroll to the top. The cat toggle button and author name should be fully visible below the masthead, not clipped under it.

Verify desktop still works: switch to full-width (1200px+) in DevTools — the sidebar should still align correctly.

```bash
pkill -f "jekyll serve" 2>/dev/null; true
```

- [ ] **Step 4: Commit**

```bash
git add assets/js/plugins/jquery.greedy-navigation.js
git commit -m "fix: always set sidebar padding-top so mobile cat button clears masthead"
```

---

## Task 3: Fix hamburger nav on mobile

**Context:** The greedy nav's `updateNav()` fires synchronously when the JS is parsed, before the browser has computed element widths (especially before web fonts like Jost/Crimson Pro load). On mobile at 375px, when `updateNav()` first runs:

- `$nav.width()` may be 0 or a pre-layout value
- `$vlinks.width()` may be 0
- The condition `0 > -30` evaluates true, enters the while loop, but `$vlinks.children(":not(.persist)").length` may also be 0
- Falls through to `breaks.length < 1` → `$btn.addClass('hidden')` → button is hidden

The button never reappears because no `resize` event fires after fonts load. Fix: add a `window.load` listener that re-runs `updateNav()`.

Additionally, the `.hidden-links` dropdown (which holds the nav links on mobile) has no explicit `z-index`. With `backdrop-filter` on `.masthead` creating a new stacking context and the sidebar potentially overlapping, adding `z-index` ensures the dropdown appears above everything. This is applied in `custom.scss`.

**Files:**
- Modify: `assets/js/plugins/jquery.greedy-navigation.js`
- Modify: `assets/css/custom.scss`

- [ ] **Step 1: Add `window.load` re-trigger in greedy nav JS**

In `assets/js/plugins/jquery.greedy-navigation.js`, find the `// Window listeners` section:

```js
// Window listeners

$(window).on('resize', function () {
  updateNav();
});
screen.orientation.addEventListener("change", function () {
  updateNav();
});
```

Replace with:

```js
// Window listeners

$(window).on('resize', function () {
  updateNav();
});
$(window).on('load', function () {
  updateNav();
});
screen.orientation.addEventListener("change", function () {
  updateNav();
});
```

- [ ] **Step 2: Add z-index to `.hidden-links` in custom.scss**

In `assets/css/custom.scss`, find the `.hidden-links` block (around line 219):

```scss
.hidden-links {
  background: rgba(13, 15, 20, 0.97) !important;
  border: 1px solid var(--global-border-color) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
```

Replace with:

```scss
.hidden-links {
  background: rgba(13, 15, 20, 0.97) !important;
  border: 1px solid var(--global-border-color) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  z-index: 200 !important;
```

- [ ] **Step 3: Verify hamburger works on mobile**

```bash
bundle exec jekyll serve -l -H localhost --detach
```

Open `http://localhost:4000` in Chrome DevTools mobile emulation (375px). The three-bar hamburger button should appear at the right of the masthead. Tapping it should reveal the nav links dropdown (Publications, Talks, etc.). Tapping it again should hide the dropdown.

Also verify desktop: at 1200px+ the hamburger should not appear (nav links are visible in the bar). If any nav links overflow at intermediate widths, the hamburger should appear.

```bash
pkill -f "jekyll serve" 2>/dev/null; true
```

- [ ] **Step 4: Commit**

```bash
git add assets/js/plugins/jquery.greedy-navigation.js assets/css/custom.scss
git commit -m "fix: hamburger nav on mobile — re-trigger updateNav on window.load, add z-index to dropdown"
```

---

## Final verification

After all three tasks are complete, do one combined mobile check:

```bash
bundle exec jekyll serve -l -H localhost --detach
```

Open `http://localhost:4000` at 375px mobile emulation:
1. Masthead visible at top — hamburger button visible at right edge
2. Sidebar content (cat button, author name) fully visible below masthead, not clipped
3. Touch-drag on page — cats follow finger
4. Lift finger — cats wander
5. Tap hamburger — nav dropdown appears with correct dark theme styling
6. Tap cat toggle — cats stop
7. Tap cat toggle again — cats restart

Switch to 1200px:
8. No hamburger visible — nav links in bar
9. Sidebar fixed on left — correct top clearance
10. Mouse movement — cats follow cursor

```bash
pkill -f "jekyll serve" 2>/dev/null; true
```
