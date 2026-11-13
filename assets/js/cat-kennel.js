/* =============================================================
   Cat kennel — a draggable pixel cat house for the oneko cats.
   Click it to let the cats out or call them home; drag it (or
   use the arrow keys) to move it. The cats leave from its door
   and walk back into it.

   Needs createCat() from oneko.js and window.ONEKO_SPRITES =
   { orange: url, black: url } (set in _includes/scripts.html).
   Exposes window.toggleCats() for the sidebar "Cats" button.
   ============================================================= */

(function () {
  "use strict";

  if (typeof createCat !== "function" || !window.ONEKO_SPRITES) { return; }

  var STORE_CATS = "oneko-cats";        // "on" | "off"
  var STORE_POS  = "oneko-kennel-pos";  // kennel center as fractions of the viewport
  var STORE_SEEN = "oneko-kennel-seen"; // first-visit hint shown

  var W = 60, H = 51;                   // kennel size in px (20 x 17 grid, 3 px cells)
  var MARGIN = 8;

  // ── Storage (private browsing can throw) ─────────────────────────────────

  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  // ── Where the orange cat is heading ──────────────────────────────────────

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  document.addEventListener("mousemove", function (e) { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener("touchmove", function (e) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });

  // ── Pixel art ────────────────────────────────────────────────────────────
  // R roof, r eave, W wall, w plank seam, D doorway, B floor.

  var ART = [
    ".........RR.........",
    "........RRRR........",
    ".......RRRRRR.......",
    "......RRRRRRRR......",
    ".....RRRRRRRRRR.....",
    "....RRRRRRRRRRRR....",
    "...RRRRRRRRRRRRRR...",
    "..RRRRRRRRRRRRRRRR..",
    ".RRRRRRRRRRRRRRRRRR.",
    "rrrrrrrrrrrrrrrrrrrr",
    "..WWWWWWWWWWWWWWWW..",
    "..WWWWWWDDDDWWWWWW..",
    "..WWWWWDDDDDDWWWWW..",
    "..wwwwDDDDDDDDwwww..",
    "..WWWWDDDDDDDDWWWW..",
    "..WWWWDDDDDDDDWWWW..",
    "BBBBBBBBBBBBBBBBBBBB"
  ];
  var COLORS = { R: "#e07b39", r: "#9c4f22", W: "#c9a77c", w: "#a8875f", D: "#07090e", B: "#6b4a2f" };

  function svgMarkup() {
    var rects = [];
    ART.forEach(function (row, y) {
      // Merge runs of the same color into one rect.
      var x = 0;
      while (x < row.length) {
        var c = row[x], run = 1;
        while (x + run < row.length && row[x + run] === c) { run++; }
        if (COLORS[c]) {
          rects.push('<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' + COLORS[c] + '"/>');
        }
        x += run;
      }
    });
    // Eyes in the doorway, shown while the cats are home: amber for the
    // orange cat, green for the black cat.
    var eyes =
      '<g class="cat-kennel__eyes">' +
        '<rect x="7" y="14" width="1" height="1" fill="#f2b33d"/>' +
        '<rect x="9" y="14" width="1" height="1" fill="#f2b33d"/>' +
      "</g>" +
      '<g class="cat-kennel__eyes cat-kennel__eyes--b">' +
        '<rect x="10" y="13" width="1" height="1" fill="#b8e04a"/>' +
        '<rect x="12" y="13" width="1" height="1" fill="#b8e04a"/>' +
      "</g>";
    return '<svg viewBox="0 0 20 17" width="' + W + '" height="' + H + '" aria-hidden="true" focusable="false">' +
      rects.join("") + eyes + "</svg>";
  }

  // ── Kennel element ───────────────────────────────────────────────────────

  var kennel = document.createElement("button");
  kennel.type = "button";
  kennel.className = "cat-kennel";
  kennel.innerHTML = svgMarkup() +
    '<span class="cat-kennel__tip" aria-hidden="true"><strong></strong><small>Drag to move the house</small></span>';
  document.body.appendChild(kennel);
  var tipTitle = kennel.querySelector(".cat-kennel__tip strong");

  // ── Position ─────────────────────────────────────────────────────────────

  var pos = { x: 0, y: 0 };

  function clamp(x, y) {
    return {
      x: Math.max(W / 2 + MARGIN, Math.min(window.innerWidth  - W / 2 - MARGIN, x)),
      y: Math.max(H / 2 + MARGIN, Math.min(window.innerHeight - H / 2 - MARGIN, y))
    };
  }

  function setPos(x, y) {
    pos = clamp(x, y);
    kennel.style.left = Math.round(pos.x - W / 2) + "px";
    kennel.style.top  = Math.round(pos.y - H / 2) + "px";
    // Keep the hint bubble on screen.
    kennel.classList.toggle("tip-below", pos.y < 110);
    kennel.classList.toggle("tip-left",  pos.x < 120);
    kennel.classList.toggle("tip-right", pos.x > window.innerWidth - 120);
  }

  function savedPos() {
    var raw = load(STORE_POS);
    if (raw) {
      try {
        var f = JSON.parse(raw);
        if (typeof f.x === "number" && typeof f.y === "number") {
          return { x: f.x * window.innerWidth, y: f.y * window.innerHeight };
        }
      } catch (e) { /* fall through */ }
    }
    return { x: W / 2 + 18, y: window.innerHeight - H / 2 - 18 };
  }

  function savePos() {
    save(STORE_POS, JSON.stringify({
      x: +(pos.x / window.innerWidth).toFixed(4),
      y: +(pos.y / window.innerHeight).toFixed(4)
    }));
  }

  function door() {
    return { x: pos.x, y: pos.y + H / 2 - 8 };
  }

  var start = savedPos();
  setPos(start.x, start.y);
  window.addEventListener("resize", function () {
    var p = savedPos();
    setPos(p.x, p.y);
  });

  // ── Cats ─────────────────────────────────────────────────────────────────

  var cats = null;      // [orange, black] while out
  var calling = false;  // walking home

  function letOut() {
    var d = door();
    var orange = createCat({
      spriteUrl: window.ONEKO_SPRITES.orange,
      targetFn:  function () { return { x: mouseX, y: mouseY }; },
      spawnX: d.x - 5,
      spawnY: d.y
    });
    var black = createCat({
      spriteUrl: window.ONEKO_SPRITES.black,
      targetFn:  function () { return orange.position(); },
      spawnX: d.x + 6,
      spawnY: d.y + 1
    });
    cats = [orange, black];
    calling = false;
  }

  function callHome() {
    calling = true;
    var waiting = cats.length;
    cats.forEach(function (cat) {
      cat.goHome(door, function () {
        waiting--;
        if (waiting === 0 && calling) {
          cats = null;
          calling = false;
          update();
          kennel.classList.remove("is-arrival");
          void kennel.offsetWidth;          // restart the animation
          kennel.classList.add("is-arrival");
        }
      });
    });
  }

  function stayOut() {
    cats.forEach(function (cat) { cat.stayOut(); });
    calling = false;
  }

  function toggle() {
    if (cats && !calling) {
      callHome();
      save(STORE_CATS, "off");
    } else if (cats && calling) {
      stayOut();
      save(STORE_CATS, "on");
    } else {
      letOut();
      save(STORE_CATS, "on");
    }
    update();
  }

  function update() {
    var out = !!cats && !calling;
    var label = !cats ? "Let the cats out" : calling ? "Let them stay out" : "Call the cats home";
    kennel.classList.toggle("is-home", !cats);
    kennel.classList.toggle("is-calling", calling);
    kennel.setAttribute("aria-pressed", String(out));
    kennel.setAttribute("aria-label", label + " (cat house; drag or use the arrow keys to move it)");
    tipTitle.textContent = label;

    // Other cat buttons on the site (the sidebar "Cats" button).
    var others = document.querySelectorAll("#cat-toggle-btn, [data-cat-toggle]");
    Array.prototype.forEach.call(others, function (btn) {
      btn.setAttribute("aria-pressed", String(out));
      btn.style.opacity = out ? "1" : "0.4";
      btn.title = out ? "Send cats home" : "Release the cats";
    });
  }

  window.toggleCats = toggle;

  // ── Drag, click, keyboard ────────────────────────────────────────────────

  var drag = null;
  var suppressClick = false;
  var touched = false;   // the visitor has already found the kennel

  kennel.addEventListener("pointerdown", function (e) {
    touched = true;
    if (e.button !== 0) { return; }
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: pos.x - e.clientX, dy: pos.y - e.clientY, moved: false };
    try { kennel.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });

  kennel.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) { return; }
    if (!drag.moved && Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 5) {
      drag.moved = true;
      kennel.classList.add("is-dragging");
      kennel.classList.remove("show-tip");
    }
    if (drag.moved) { setPos(e.clientX + drag.dx, e.clientY + drag.dy); }
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) { return; }
    if (drag.moved) {
      savePos();
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
    }
    kennel.classList.remove("is-dragging");
    drag = null;
  }
  kennel.addEventListener("pointerup", endDrag);
  kennel.addEventListener("pointercancel", endDrag);

  kennel.addEventListener("click", function (e) {
    if (suppressClick) { e.preventDefault(); return; }
    kennel.classList.remove("show-tip");
    toggle();
  });

  kennel.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 48 : 16;
    var moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    var m = moves[e.key];
    if (!m) { return; }
    e.preventDefault();
    setPos(pos.x + m[0], pos.y + m[1]);
    savePos();
  });

  // ── Start ────────────────────────────────────────────────────────────────

  if (load(STORE_CATS) !== "off") { letOut(); }
  update();

  // First visit: point out the kennel once.
  if (!load(STORE_SEEN)) {
    save(STORE_SEEN, "1");
    setTimeout(function () {
      if (touched) { return; }
      kennel.classList.add("show-tip", "is-wiggle");
      setTimeout(function () { kennel.classList.remove("show-tip", "is-wiggle"); }, 5000);
    }, 1800);
  }
}());
