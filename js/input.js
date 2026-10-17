// Keyboard, touch and gamepad input for up to two players.
// Movement is a normalised vector; moves are "held" flags. Player 0 is the
// bottom trainer, player 1 the top one (only human-driven in 2-player mode).

const Input = (() => {
  const keys = {};
  const mk = () => ({ stick: { x: 0, y: 0, id: null, cx: 0, cy: 0 }, btnHeld: [false, false, false, false], held: [false, false, false, false] });
  const pl = [mk(), mk()];

  // Solo play keeps the original layout; 2-player splits the keyboard in half.
  const LAYOUT = {
    solo: [{
      up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
      // the mouse is the main way to attack (see the mouse section below); these keys still work too
      moves: [['KeyJ', 'Digit1', 'Space'], ['KeyK', 'Digit2'], ['KeyL', 'Digit3'], ['Semicolon', 'Digit4', 'KeyI']],
      swap: ['KeyQ', 'Tab'], labels: ['CLICK', 'R-CLICK', '⇧ CLICK', '⇧ R-CLICK'], swapLabel: 'Q',
    }],
    duo: [{
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
      moves: [['KeyR'], ['KeyT'], ['KeyF'], ['KeyG']],
      swap: ['KeyQ'], labels: ['R', 'T', 'F', 'G'], swapLabel: 'Q',
    }, {
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      moves: [['KeyI', 'Numpad1'], ['KeyO', 'Numpad2'], ['KeyK', 'Numpad3'], ['KeyL', 'Numpad4']],
      swap: ['KeyP', 'Numpad0', 'Enter'], labels: ['I', 'O', 'K', 'L'], swapLabel: 'P',
    }],
  };
  let mode = 'solo';
  let onPause = null, onMute = null, onSwap = null;
  const anyKey = list => list.some(k => keys[k]);

  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    keys[e.code] = true;
    // in 2-player mode P is player 2's swap key, so only Esc pauses
    if ((e.code === 'Escape' || (mode === 'solo' && e.code === 'KeyP')) && onPause) onPause();
    if (e.code === 'KeyM' && onMute) onMute();
    LAYOUT[mode].forEach((L, p) => {
      if (L.swap.includes(e.code) && onSwap) { e.preventDefault(); onSwap(p); }
    });
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    document.body.classList.add('no-touch');
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseHeld.fill(false); mouseSlot.fill(-1); });

  // ---------- mouse attacks (solo layout, during a battle) ----------
  // Left click = move 1, right click = move 2, Shift + left = move 3, Shift + right = move 4.
  // Shift is read when the button goes down, so letting go of Shift mid-hold changes nothing.
  // Uses the buttons bitmask so pressing both buttons at once works too.
  const mouseHeld = [false, false, false, false];
  const mouseSlot = [-1, -1, -1];   // which move each mouse button (left, middle, right) is holding
  let mouseOn = false, physical = 0;  // physical: the buttons down at the last event
  const BUTTON_BITS = [[0, 1], [2, 2]];   // [button index, bit in e.buttons]: left = 1, right = 2
  const gameEl = document.getElementById('game');
  function onMouse(e) {
    if (e.pointerType !== 'mouse') return;
    // a fresh press over the arena attacks; presses on buttons and menus are theirs.
    // A release ends the attack wherever the pointer is.
    const t = e.target, now = e.buttons;
    const blocked = !mouseOn || !gameEl.contains(t) || !!(t.closest && t.closest('button, .mbtn, .swap-chip, .screen:not(.hidden), input'));
    for (const [btn, bit] of BUTTON_BITS) {
      const was = physical & bit, is = now & bit;
      if (is && !was && !blocked) {
        const slot = (btn === 0 ? 0 : 1) + (e.shiftKey ? 2 : 0);
        mouseSlot[btn] = slot; mouseHeld[slot] = true;
      } else if (!is && mouseSlot[btn] >= 0) {
        mouseHeld[mouseSlot[btn]] = false; mouseSlot[btn] = -1;
      }
    }
    physical = now;
  }
  for (const ev of ['pointerdown', 'pointerup', 'pointermove', 'pointercancel']) window.addEventListener(ev, onMouse);
  // keep the browser's right-click menu out of the way during a battle
  gameEl.addEventListener('contextmenu', e => { if (mouseOn) e.preventDefault(); });
  function clearMouse() { mouseHeld.fill(false); mouseSlot.fill(-1); }

  // Touch devices get the virtual stick; desktop gets a keyboard move bar.
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isTouch) document.body.classList.add('no-touch');

  // `flip` is for a control panel rotated 180° (player 2 across the table): the
  // knob moves in the panel's own coordinates, but the movement vector stays in
  // screen space, which is the arena's space.
  function bindStick(zone, base, knob, p = 0, flip = false) {
    const stick = pl[p].stick;
    const sgn = flip ? -1 : 1;
    const radius = () => base.getBoundingClientRect().width / 2;
    zone.addEventListener('pointerdown', e => {
      if (stick.id !== null) return;
      stick.id = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      const zr = zone.getBoundingClientRect();
      const r = radius();
      // move the stick base to where the thumb landed
      const lx = flip ? zr.right - e.clientX : e.clientX - zr.left;
      const ly = flip ? zr.bottom - e.clientY : e.clientY - zr.top;
      base.style.left = (lx - r) + 'px';
      base.style.top = (ly - r) + 'px';
      base.style.bottom = 'auto';
      stick.cx = e.clientX; stick.cy = e.clientY;
      update(e);
    });
    const update = e => {
      const r = radius();
      let dx = e.clientX - stick.cx, dy = e.clientY - stick.cy;
      const d = Math.hypot(dx, dy);
      if (d > r) { dx *= r / d; dy *= r / d; }
      knob.style.transform = `translate(${dx * sgn}px, ${dy * sgn}px)`;
      const m = Math.hypot(dx, dy) / r;
      stick.x = m > 0.18 ? dx / r : 0;
      stick.y = m > 0.18 ? dy / r : 0;
    };
    zone.addEventListener('pointermove', e => { if (e.pointerId === stick.id) update(e); });
    const end = e => {
      if (e.pointerId !== stick.id) return;
      stick.id = null; stick.x = stick.y = 0;
      knob.style.transform = '';
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
  }

  function bindMoveButton(el, i, p = 0) {
    const held = pl[p].btnHeld;
    const down = e => { e.preventDefault(); held[i] = true; el.classList.add('pressed'); };
    const up = () => { held[i] = false; el.classList.remove('pressed'); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  // ---------- gamepads: connected pads are handed to players in order ----------
  // A B X Y = moves 1-4, either bumper = swap, Start = pause.
  const padPrev = [{}, {}];
  function pad(p) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    if (mode === 'solo') return p === 0 ? pads[0] || null : null;
    return pads[p] || null;
  }
  const pressed = (g, i) => !!(g && g.buttons[i] && g.buttons[i].pressed);
  function poll() {
    for (let p = 0; p < 2; p++) {
      const g = pad(p), prev = padPrev[p];
      const now = { swap: pressed(g, 4) || pressed(g, 5), pause: pressed(g, 9) };
      if (now.swap && !prev.swap && onSwap) onSwap(p);
      if (now.pause && !prev.pause && onPause) onPause();
      padPrev[p] = now;
    }
  }

  return {
    bindStick, bindMoveButton, poll, isTouch,
    set onPause(f) { onPause = f; }, set onMute(f) { onMute = f; }, set onSwap(f) { onSwap = f; },
    setMode(m) { mode = m; this.reset(); },
    // mouse attacks are on only during a 1-player or online battle (main.js switches this)
    set mouse(on) { mouseOn = on; if (!on) clearMouse(); },
    get mode() { return mode; },
    labels(p = 0) { return LAYOUT[mode][p] ? LAYOUT[mode][p].labels : LAYOUT.solo[0].labels; },
    dir(p = 0) {
      const L = LAYOUT[mode][p];
      let x = pl[p].stick.x, y = pl[p].stick.y;
      if (L) {
        if (anyKey(L.left)) x -= 1;
        if (anyKey(L.right)) x += 1;
        if (anyKey(L.up)) y -= 1;
        if (anyKey(L.down)) y += 1;
      }
      const g = pad(p);
      if (g) {
        const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
        if (Math.hypot(ax, ay) > 0.25) { x += ax; y += ay; }
        if (pressed(g, 14)) x -= 1; if (pressed(g, 15)) x += 1;
        if (pressed(g, 12)) y -= 1; if (pressed(g, 13)) y += 1;
      }
      const m = Math.hypot(x, y);
      return m > 1 ? { x: x / m, y: y / m } : { x, y };
    },
    moves(p = 0) {
      const L = LAYOUT[mode][p], P = pl[p], g = pad(p);
      const mouse = p === 0 && mode === 'solo' ? mouseHeld : null;
      for (let i = 0; i < 4; i++) P.held[i] = P.btnHeld[i] || (L ? anyKey(L.moves[i]) : false) || pressed(g, i) || !!(mouse && mouse[i]);
      return P.held;
    },
    reset() {
      clearMouse();
      for (const k in keys) keys[k] = false;
      for (const P of pl) { P.btnHeld.fill(false); P.stick.x = P.stick.y = 0; }
    },
  };
})();
