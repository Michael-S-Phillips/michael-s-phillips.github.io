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

    if (distance < 24) {
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
