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

  /* Emote state */
  var emoteCooldown = 0;
  var _wasIdling = false;

  var spriteSets = {
    idle:        [[-3, -3]],
    alert:       [[-7, -3]],
    tired:       [[-3, -2]],
    sleeping:    [[-2,  0], [-2, -1]],
    scratchSelf: [[-5,  0], [-6,  0], [-7,  0]],
    wash:        [[-4,  0], [-4, -1]],
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
    'background-image:url("' + options.spriteUrl + '");' +
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

  function emote(symbol) {
    if (emoteCooldown > 0) { return; }
    var div = document.createElement('div');
    div.className = 'cat-emote';
    div.textContent = symbol;
    div.style.left = (catX - 4) + 'px';
    div.style.top  = (catY - 44) + 'px';
    document.body.appendChild(div);
    setTimeout(function () {
      if (div.parentNode) { div.parentNode.removeChild(div); }
    }, 1500);
    emoteCooldown = 15;
  }

  function idle() {
    idleTime++;
    if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
      var r = Math.random();
      if (r < 0.33) {
        idleAnimation = 'sleeping';
        emote('\uD83D\uDCA4'); /* 💤 */
      } else if (r < 0.67) {
        idleAnimation = 'scratchSelf';
      } else {
        idleAnimation = 'wash';
      }
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
    } else if (idleAnimation === 'wash') {
      setSprite('wash', Math.floor(idleFrame / 3) % 2);
      if (idleFrame > 12) { resetIdle(); }
    } else {
      setSprite('idle', 0);
    }
    if (emoteCooldown <= 0 && Math.random() < 0.005) { emote('\u2661'); } /* ♡ */
    idleFrame++;
  }

  function pickWaypoint(target) {
    if (Math.random() < 0.2) {
      wpX = Math.random() * window.innerWidth;
      wpY = Math.random() * window.innerHeight;
      emote('~');
    } else {
      wpX = catX + (target.x - catX) * 0.35 + (Math.random() - 0.5) * 400;
      wpY = catY + (target.y - catY) * 0.35 + (Math.random() - 0.5) * 400;
      wpX = Math.max(0, Math.min(window.innerWidth,  wpX));
      wpY = Math.max(0, Math.min(window.innerHeight, wpY));
    }
    wpTimer = 30 + Math.floor(Math.random() * 50);
  }

  function tick() {
    if (emoteCooldown > 0) { emoteCooldown--; }

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
      if (wpTimer <= 0 || Math.sqrt(wdx * wdx + wdy * wdy) < 24) {
        pickWaypoint(target);
      }
      chaseX = wpX;
      chaseY = wpY;
      wdx = catX - wpX;
      wdy = catY - wpY;
      chaseDist = Math.sqrt(wdx * wdx + wdy * wdy);
    }

    if (chaseDist < 24) {
      _wasIdling = true;
      idle();
      return;
    }

    /* Cat noticed the target moved — fire alert emote */
    if (_wasIdling) {
      emote('\u2757'); /* ❗ */
      _wasIdling = false;
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
