// Drawing: sprite tints and item icons, and Battle's effects (shake, particles,
// numbers, weather) and rendering of a room. See battle.js.

// an Arc-core (Archive Core): an ancient data crystal, the recruit room's sign (a Coreature waiting to be taken in)
const ARC_CORE_IMG = gridFromMap([
  '..k..',
  '.kck.',
  'kcwck',
  'kccck',
  'kcdck',
  '.kdk.',
  '..k..',
], { k: OUTLINE, c: '#5ad8ff', w: '#e6fbff', d: '#2a8ab8' }).toCanvas();
// One reused scratch canvas for Coreatures assembling out of data (never a new canvas per frame).
const _assemble = document.createElement('canvas'); _assemble.width = _assemble.height = 96;
const _assembleCtx = _assemble.getContext('2d');
// Draw `pic` with only some of its pixels there yet (k 0 -> 1), plus a bright scan line at the edge.
function drawAssembling(ctx, pic, dx, dy, pw, ph, k, color) {
  const w = pic.width, h = pic.height;
  _assembleCtx.clearRect(0, 0, w + 2, h + 2);
  _assembleCtx.drawImage(pic, 0, 0);
  const scan = Math.round(h * (1 - k));   // it builds from the feet up, scattered pixels ahead of the line
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    if (y < scan - 2 - (n % 7) || (y < scan + 2 && (n % 100) / 100 > k)) _assembleCtx.clearRect(x, y, 1, 1);
  }
  ctx.drawImage(_assemble, 0, 0, w, h, dx, dy, pw, ph);
  ctx.globalAlpha = 0.85; ctx.fillStyle = color;
  ctx.fillRect(dx, dy + ph * (scan / h), pw, Math.max(1, ph / h));
  ctx.globalAlpha = 1;
}

const COIN_IMG = gridFromMap([
  '.kkk.',
  'kyyhk',
  'kyowk',
  'kyowk',
  'kooyk',
  '.kkk.',
], { k: OUTLINE, y: '#ffd23f', o: '#d8902a', h: '#fff6c8', w: '#fff6c8' }).toCanvas();

const BERRY_IMG = gridFromMap([
  '..gg..',
  '.kgk..',
  'krrhrk',
  'krrrhk',
  'krrrrk',
  '.kddk.',
  '..kk..',
], { k: OUTLINE, g: '#4fae2e', r: '#e8435a', h: '#ffb0c0', d: '#a82a40' }).toCanvas();

// The 2x canvas a lit scene is drawn into (Battle.render), made once.
let _scene = null;
function sceneBuffer() {
  if (!_scene) { _scene = document.createElement('canvas'); _scene.width = W * 2; _scene.height = H * 2; }
  return _scene.getContext('2d');
}

// Room rewards (see ROOM_REWARDS): an Arc-core Shard (XP), a move disc, a treasure chest; a skull marks the boss's door.
const SHARD_IMG = gridFromMap([   // an Arc-core Shard (XP): a tall sliver of a broken Archive Core, cyan with leftover data (r149: was gold, too like a coin)
  '...k...',
  '..kwk..',
  '..kwak.',
  '.kwaAk.',
  '.kwaAk.',
  'kwaaAAk',
  'kaaaAAk',
  '.kaaAk.',
  '.kaAAk.',
  '..kAk..',
  '...k...',
], { k: OUTLINE, a: '#5ae8ff', A: '#2a8ad0', w: '#eafcff' }).toCanvas();
const GLITCH_SHARD_IMG = gridFromMap([   // a Corrupted Shard: a shard torn into magenta and cyan
  '..k...',
  '.kwk..',
  'kmmCk.',
  '.kmCck',
  'kmmCk.',
  'kmCCk.',
  '.kCk..',
  '..k...',
], { k: OUTLINE, m: '#ff3ad8', C: '#9a2088', c: '#3af0ff', w: '#ffd0f4' }).toCanvas();
const DISC_IMG = gridFromMap([
  '..kkk..',
  '.kbbbk.',
  'kbbwbbk',
  'kbwkwbk',
  'kbbwbbk',
  '.kbbbk.',
  '..kkk..',
], { k: OUTLINE, b: '#7ac8ff', w: '#e0f4ff' }).toCanvas();
const CHEST_IMG = gridFromMap([
  '.kkkkkkk.',
  'koooooook',
  'kkkkykkkk',
  'kdddydddk',
  'kdddddddk',
  'kkkkkkkkk',
], { k: OUTLINE, o: '#d08a3e', d: '#9a5a2a', y: '#ffd23f' }).toCanvas();
const SKULL_IMG = gridFromMap([
  '.kkkkk.',
  'kwwwwwk',
  'kwkwkwk',
  'kwwwwwk',
  '.kwkwk.',
  '..kkk..',
], { k: OUTLINE, w: '#f6f2ee' }).toCanvas();
const ALTAR_IMG = gridFromMap([
  '...k...',
  '..kpk..',
  '.kpwpk.',
  '.kpwpk.',
  'kpwwwpk',
  '.kpppk.',
  'kkkkkkk',
  'ksssssk',
  'kkkkkkk',
], { k: OUTLINE, p: '#b05aff', w: '#f0d0ff', s: '#7a6a8a' }).toCanvas();
// A small badge per type: a pictogram on the type's colour (over wild Coreatures' bars, in tags).
const TYPE_ICON_ART = {
  fire:     ['..1..', '.11..', '.111.', '11111', '.111.'],
  water:    ['..1..', '.111.', '11111', '11111', '.111.'],
  electric: ['..11.', '.11..', '1111.', '..11.', '.11..'],
  plant:    ['...11', '..111', '.111.', '111..', '1....'],
  earth:    ['.....', '.111.', '11111', '11111', '.....'],
  ice:      ['1.1.1', '.111.', '11111', '.111.', '1.1.1'],
  wind:     ['1111.', '....1', '.111.', '1....', '.1111'],
  metal:    ['.1.1.', '11111', '11.11', '11111', '.1.1.'],
  glitch:   ['111..', '1.1.1', '..111', '11.1.', '.1.11'],
  arcane:   ['..1..', '..1..', '11111', '..1..', '..1..'],
  shade:    ['.111.', '11...', '1....', '11...', '.111.'],
  phantom:  ['.111.', '11111', '1.1.1', '11111', '1.1.1'],
  beast:    ['1.1.1', '.....', '.111.', '11111', '.111.'],
  brawl:    ['1111.', '11111', '11111', '.1111', '..11.'],
  dragonkin: ['1...1', '11.11', '.111.', '.111.', '..1..'],   // a dragon's horned head
};
const _typeIcons = {}, _typeIconURLs = {};
function typeIcon(t) {
  if (_typeIcons[t]) return _typeIcons[t];
  const art = TYPE_ICON_ART[t] || TYPE_ICON_ART.beast;
  const rows = ['.........', '.ccccccc.', ...art.map(r => '.c' + r.replace(/1/g, 'w').replace(/\./g, 'c') + 'c.'), '.ccccccc.', '.........'];
  const g = gridFromMap(rows, { c: TYPES[t].color, w: '#ffffff' });
  g.outline(OUTLINE);
  return (_typeIcons[t] = g.toCanvas());
}
function typeIconURL(t) { return _typeIconURLs[t] || (_typeIconURLs[t] = typeIcon(t).toDataURL()); }

const PICKUP_IMG = { coin: COIN_IMG, berry: BERRY_IMG, shard: SHARD_IMG, glitchShard: GLITCH_SHARD_IMG, disc: DISC_IMG, chest: CHEST_IMG };
// the sign over a doorway: what's in the room behind it
const REWARD_IMG = { coins: COIN_IMG, berries: BERRY_IMG, xp: SHARD_IMG, move: DISC_IMG, chest: CHEST_IMG, glitch: GLITCH_SHARD_IMG };
function doorSign(room) {
  if (room.type === 'fight') return room.cleared ? null : { img: REWARD_IMG[room.reward], c: '#e8e0f0' };
  if (room.type === 'boss') return room.cleared ? null : { img: SKULL_IMG, c: room.bossKind === 'gate' ? '#e8943a' : '#e8433a' };   // a gatekeeper's door is orange
  if (room.type === 'shop') return { img: COIN_IMG, c: '#ffd23f' };
  if (room.type === 'treasure') return room.taken ? null : { img: CHEST_IMG, c: '#ffffff' };
  if (room.type === 'altar') return room.used ? null : { img: ALTAR_IMG, c: '#c87aff' };
  if (room.type === 'recruit') return room.recruited ? null : { img: ARC_CORE_IMG, c: '#5ad8ff' };
  return null;
}

// 14px icons for relics and shop goods.
const ICON_ART = {
  tideCharm(g) { g.ellipse(7, 7, 5.5, 5.5, P('#4a90e8', '#2a5ab0', '#a8d8ff')); g.poly([[3, 8], [6, 5], [8, 7], [11, 4], [11, 8], [8, 10], [5, 9]], '#e6f6ff'); },
  grandma(g) { g.rect(1, 8, 12, 5, '#c8303a'); g.rect(1, 8, 12, 1, '#e86060'); g.rect(6, 6, 2, 3, '#c8303a'); g.ellipse(4.5, 6, 2.2, 1.2, '#c8303a'); g.ellipse(9.5, 6, 2.2, 1.2, '#c8303a'); g.poly([[7, 0.5], [11, 6], [3, 6]], P('#fbf8f0', '#d8d0c0', '#ffffff')); g.rect(5, 4, 4, 2, '#24402e'); },   // a rice ball on a bento wrapped in a red cloth
  rainBell(g) { g.poly([[5, 3], [9, 3], [11, 10], [3, 10]], P('#e0b040', '#a07a20', '#fff0a0')); g.rect(2, 10, 10, 2, '#a07a20'); g.rect(6, 12, 2, 2, '#6a4a10'); g.px(4, 1, '#7ad0f0').px(10, 1, '#7ad0f0').px(12, 4, '#7ad0f0'); },
  stormCoil(g) { for (let y = 3; y < 13; y += 2) { g.rect(4, y, 6, 1, '#d87a3a'); g.rect(4, y + 1, 6, 1, '#8a4a1a'); } g.rect(6, 0, 2, 3, '#e8e8f0'); g.px(3, 1, '#7af0ff').px(11, 0, '#7af0ff').px(12, 2, '#d0faff'); },
  leechLens(g) { g.ellipse(6.5, 6.5, 5.5, 5.5, P('#c8d6ff', '#8a9ad0', '#ffffff')); g.ellipse(6.5, 6.5, 3, 3, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[10, 10], [13, 13], [12, 14], [9, 11]], '#8a6a4a'); },
  emberTracks(g) { g.poly([[2, 5], [6, 5], [6, 9], [12, 9], [12, 13], [2, 13]], P('#8a5a3a', '#5a3a22', '#b07a52')); g.poly([[9, 0], [13, 5], [11, 8], [8, 6]], P('#ff7a1c', '#e2401a', '#ffd34a')); },
  muscleCharm(g) { g.ellipse(7, 7, 5.5, 5, P('#d9a066', '#a8703e', '#f2c896')); g.rect(3, 5, 8, 1, '#a8703e'); g.rect(3, 8, 8, 1, '#a8703e'); g.rect(2, 11, 10, 2, '#d23a3a'); },
  ironShell(g) { g.poly([[1, 1], [13, 1], [13, 7], [7, 13], [1, 7]], P('#a8b0c4', '#6e7690', '#dfe4f0')); g.rect(7, 2, 1, 9, '#6e7690'); g.rect(2, 5, 11, 1, '#6e7690'); },
  swiftBoots(g) { g.poly([[3, 5], [7, 5], [7, 9], [13, 9], [13, 13], [3, 13]], P('#5aa0ff', '#2a6ad0', '#a8d0ff')); g.poly([[0, 3], [5, 0], [6, 5], [1, 6]], P('#ffffff', '#c8d6ff', '#ffffff')); },
  hourglass(g) { g.rect(2, 0, 10, 2, '#8a6a4a'); g.rect(2, 12, 10, 2, '#8a6a4a'); g.poly([[3, 2], [11, 2], [7, 7]], P('#c8f0ff', '#8ac8e8', '#ffffff')); g.poly([[3, 12], [11, 12], [7, 7]], P('#c8f0ff', '#8ac8e8', '#ffffff')); g.poly([[4, 12], [10, 12], [7, 9]], '#ffd23f'); },
  luckyCoin(g) { g.ellipse(7, 7, 6, 6, P('#ffd23f', '#d8902a', '#fff6c8')); g.ellipse(5.5, 6, 1.6, 1.6, '#4fae2e'); g.ellipse(8.5, 6, 1.6, 1.6, '#4fae2e'); g.ellipse(7, 8.6, 1.6, 1.6, '#4fae2e'); },
  berryBasket(g) { g.ellipse(4, 5, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.ellipse(7.5, 4, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.ellipse(11, 5, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[1, 7], [14, 7], [12, 13], [3, 13]], P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(3, 9, 9, 1, '#8a6a3a'); },
  splitShot(g) { g.ellipse(4, 10, 3, 3, P('#7af0e0', '#3ab8b0', '#e0fffa')); g.ellipse(10, 4, 3, 3, P('#7af0e0', '#3ab8b0', '#e0fffa')); g.rect(1, 3, 4, 1, '#3ab8b0'); g.rect(7, 11, 4, 1, '#3ab8b0'); },
  staticCharm(g) { g.poly([[8, 0], [2, 8], [6, 8], [4, 14], [12, 5], [8, 5], [10, 0]], P('#ffd84a', '#e0a722', '#fff3a0')); },
  blastCore(g) {
    const pts = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 3 : 6.5; pts.push([7 + Math.cos(a) * r, 7 + Math.sin(a) * r]); }
    g.poly(pts, P('#ff5a2a', '#c8301a', '#ffb06a')); g.ellipse(7, 7, 2.2, 2.2, '#ffe066');
  },
  bigBerry(g) { g.ellipse(7, 8, 5.5, 5, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[6, 3], [9, 0], [11, 2], [8, 4]], '#4fae2e'); g.px(5, 6, '#ffffff'); },
  picnic(g) { g.poly([[1, 6], [13, 6], [12, 13], [2, 13]], P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(1, 5, 12, 2, '#e8435a'); for (let x = 2; x < 13; x += 3) g.rect(x, 5, 1, 2, '#ffffff'); g.rect(4, 1, 1, 4, '#8a6a3a'); g.rect(9, 1, 1, 4, '#8a6a3a'); g.rect(4, 1, 6, 1, '#8a6a3a'); },
  revive(g) { g.ellipse(7, 10, 4.5, 3.5, P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(7, 3, 1, 5, '#4fae2e'); g.ellipse(4.5, 4, 2.5, 1.5, '#8be04e'); g.ellipse(10, 3, 2.5, 1.5, '#8be04e'); },
};
const _icons = {};
function itemIcon(id) {
  if (_icons[id]) return _icons[id];
  const g = new PixGrid(16, 16), inner = new PixGrid(14, 14);
  ICON_ART[id](inner);
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { const c = inner.get(x, y); if (c) g.set(x + 1, y + 1, c); }
  g.outline();
  return (_icons[id] = g.toCanvas());
}

// Relic auras: little pixel effects around a Coreature (Y = its feet). Drawn in whole sprite pixels
// (SPR_SCALE) so they match the art. Cheap: a handful of squares a frame.
const auraPx = (ctx, x, y, col, n = 1) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x / SPR_SCALE) * SPR_SCALE, Math.round(y / SPR_SCALE) * SPR_SCALE, SPR_SCALE * n, SPR_SCALE * n); };
const RELIC_AURA = {
  // Static Charm: short zigzag sparks crackling over its body, jumping to new spots every few frames
  static(ctx, b, m, X, Y) {
    const step = Math.floor(b.time / 0.07), seed = (step * 9301 + (m.uid || (m.uid = _uid++)) * 49297) % 233280;
    let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const cy = Y - m.h * 0.45, rx = Math.max(m.r + 4, m.h * 0.42), ry = m.h * 0.5;
    for (let k = 0; k < 6; k++) {   // jagged sparks hugging its outline
      if (rnd() < 0.25) continue;
      const a = rnd() * TAU; let x = X + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      const dx = -Math.sin(a), dy = Math.cos(a);   // run along the outline, zigzagging in and out
      for (let s = 0; s < 6; s++) {
        auraPx(ctx, x, y, s % 3 === 1 ? '#ffffff' : s % 2 ? '#7af0ff' : '#fff59a');
        const j = (s % 2 ? 1 : -1) * SPR_SCALE * 1.4;
        x += dx * 3 + Math.cos(a) * j; y += dy * 3 + Math.sin(a) * j;
      }
    }
    if (rnd() < 0.5) {   // now and then a bolt arcs over the top
      let x = X - m.r * 0.7, y = cy - ry * 0.9;
      for (let s = 0; s < 8; s++) { auraPx(ctx, x, y, s % 2 ? '#7af0ff' : '#fff59a'); x += m.r * 0.2; y += (s < 4 ? -1 : 1) * SPR_SCALE * (rnd() < 0.5 ? 1 : 0.5); }
    }
  },
  // Ember Tracks: embers drifting up off its feet (more while it runs)
  embers(ctx, b, m, X, Y, moving) {
    const n = moving ? 10 : 5;
    for (let i = 0; i < n; i++) {
      const ph = (b.time * 0.9 + i / n + (m.x0 || 0)) % 1, sx = Math.sin(i * 2.7 + Math.floor(b.time * 0.9 + i / n) * 1.9);
      auraPx(ctx, X + sx * m.r * 0.9, Y - 2 - ph * 16, ph < 0.4 ? '#ffd34a' : ph < 0.75 ? '#ff7a1c' : '#c8401a');
    }
  },
  // Berry Basket: three berries circling it
  berries(ctx, b, m, X, Y) {
    for (let i = 0; i < 3; i++) {
      const a = b.time * 1.6 + i * TAU / 3, x = X + Math.cos(a) * Math.max(m.r + 6, m.h * 0.45), y = Y - m.h * 0.45 + Math.sin(a) * 5;
      auraPx(ctx, x, y, Math.sin(a) < 0 ? '#a01a3a' : '#e83a5a', 2); auraPx(ctx, x + SPR_SCALE, y - SPR_SCALE, '#4ab04a');
    }
  },
  // Tide Charm: a ring of water swirling round its feet
  tide(ctx, b, m, X, Y) {
    for (let i = 0; i < 12; i++) {
      const a = b.time * 1.8 + i * TAU / 12;
      auraPx(ctx, X + Math.cos(a) * Math.max(m.r + 4, m.h * 0.38), Y + Math.sin(a) * (m.r * 0.4 + 2), i % 3 ? '#4a9ae8' : '#e6f6ff');
    }
    const ph = (b.time * 1.2) % 1;
    auraPx(ctx, X + m.r * 0.6, Y - 3 - ph * 10, '#a8d8ff');
  },
};

// Auras some Coreatures always have, drawn the same way as relic auras (RELIC_AURA below).
// Nyxdrake (id drakorn): Arcane light rising off the nebula on its chest.
const SPECIES_AURA = { drakorn: 'nebula', railwarden: 'coils' };
// Railwarden: lightning crackling between the tips of its three coil spires, jumping every few frames.
RELIC_AURA.coils = (ctx, b, m, X, Y) => {
  const step = Math.floor(b.time / 0.08), seed = (step * 9301 + (m.uid || (m.uid = _uid++)) * 49297) % 233280;
  let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const side = m.view === 'side' || m.view === 'fside' || m.view === 'bside', back = m.view === 'side' ? -m.face : 0;
  const top = Y - m.h * 0.97, w = side ? m.h * 0.09 : m.h * 0.2, cx = X + back * m.h * 0.24;
  const tips = [[cx - w, top + 2], [cx, top], [cx + w, top + 2]];
  for (let k = 0; k < 2; k++) {
    if (rnd() < 0.35) continue;
    const i = Math.floor(rnd() * 2), [x0, y0] = tips[i], [x1, y1] = tips[i + 1];
    for (let s = 0; s <= 6; s++) { const f = s / 6; auraPx(ctx, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f - Math.sin(f * Math.PI) * 4 + (rnd() - 0.5) * 5, s % 2 ? '#7af0ff' : '#e6fbff'); }
  }
  if (rnd() < 0.3) { const [x, y] = tips[Math.floor(rnd() * 3)]; for (let s = 0; s < 4; s++) auraPx(ctx, x + (rnd() - 0.5) * 6, y - s * 2, '#7af0ff'); }   // a spark leaping off a tip
};
RELIC_AURA.nebula = (ctx, b, m, X, Y) => {
  const cy = Y - m.h * 0.42, cols = ['#f2aaff', '#5af0e8', '#d062e0', '#a88ae8'];
  // a pulse of Arcane light rippling out from its chest every 1.4 s
  const pulse = (b.time / 1.4) % 1;
  if (pulse < 0.6) {
    const r = 3 + pulse * 22, n = 12;
    for (let i = 0; i < n; i++) { const a = i * TAU / n + b.time * 0.5; auraPx(ctx, X + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, i % 2 ? cols[0] : cols[1]); }
  }
  // motes of pink, violet and teal light drifting up and out from it, some bigger
  for (let i = 0; i < 12; i++) {
    const ph = (b.time * 0.6 + i / 12) % 1, side = Math.sin(i * 2.3 + Math.floor(b.time * 0.6 + i / 12) * 1.7);
    auraPx(ctx, X + side * (3 + ph * m.r * 1.1), cy - ph * 22, ph < 0.15 ? '#ffffff' : cols[i % 4], i % 3 === 0 && ph < 0.6 ? 2 : 1);
  }
  if (Math.sin(b.time * 3) > 0.5) auraPx(ctx, X + Math.sin(b.time * 11) * 3, cy, '#ffffff', 2);   // a twinkle at its heart
};

// Lazily tinted sprite variants (freeze / burn / paralysis / buff glow).
const _tint = {};
function tinted(id, color, view = 'front') {
  const key = id + color + view;
  if (_tint[key]) return _tint[key];
  const src = SPRITES[id].views[view];
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
  return (_tint[key] = cv);
}

// ------------------------------------------------------------------ Coreature

mixInto(Battle, class {
  // ---------------------------------------------------------- fx helpers
  addShake(v) { this.shake = Math.max(this.shake, v); }

  // k: how far above the ground the burst happens (body height by default)
  burst(x, y, cols, n, speed, vy0 = 0, k = 19) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(0.2, 1) * speed;
      this.particles.push({ x, y, g: y + k, vx: Math.cos(a) * s, vy: Math.sin(a) * s + vy0, life: rand(0.25, 0.6), max: 0.6, size: rand(1, 3.5), color: cols[(Math.random() * cols.length) | 0], kind: 'sq', drag: 3 });
    }
  }

  sparks(x, y, n, color = '#ffffff') {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(120, 260);
      this.particles.push({ x, y, g: y + 19, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.18, max: 0.18, color, kind: 'spark', drag: 4 });
    }
  }

  decalAt(x, y, r) {
    const c = this.dctx, col = this.stage.decal;
    for (let i = 0; i < r * 3; i++) {
      const a = rand(0, TAU), rr = Math.sqrt(Math.random()) * r;
      const s = 1 + ((Math.random() * 3) | 0);
      c.fillStyle = col + rand(0.15, 0.45).toFixed(2) + ')';
      c.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * 0.6), s, s);
    }
  }

  // Floating damage number; merges repeated ticks with the same key.
  number(m, val, key, fill, shade, prefix = '', scale = 1) {
    // the pixel font has no decimal point, so 245.6 would read as "2456"
    val = Math.round(val);
    if (key) {
      const f = this.floats.find(f => f.key === key && f.t < 0.5);
      if (f) {
        f.val += val; f.t = 0.05; f.x = m.x; f.y = m.y - m.h - 2;
        f.img = numberCanvas(prefix + f.val, fill, shade);
        return false;
      }
    }
    const ox = rand(-8, 8);
    this.floats.push({ key, val, x: m.x + ox, y: m.y - m.h - 2, t: 0, fill, shade, prefix, scale, img: numberCanvas(prefix + val, fill, shade) });
    return true;
  }

  text(x, y, str, color) { this.texts.push({ x, y, str, color, t: 0 }); }

  newFlake(anywhere) {
    const kind = this.stage.weather;
    const y = anywhere ? rand(0, H) : -4;
    if (kind === 'ash') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-6, 6), vy: rand(-26, -10), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#ff8a3a' : '#5a4a48' };
    if (kind === 'petals') return { x: anywhere ? rand(0, W) : rand(-40, W), y, vx: rand(10, 24), vy: rand(10, 22), s: 2, c: rand() < 0.5 ? '#ffd0e0' : '#ffffff' };
    if (kind === 'motes') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-4, 4), vy: rand(-14, -5), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#7af0e0' : '#c8a8ff' };
    if (kind === 'stars') return { x: anywhere ? rand(0, W) : rand(0, W + 60), y, vx: rand(-14, -6), vy: rand(8, 18), s: rand() < 0.25 ? 2 : 1, c: rand() < 0.45 ? '#ffe28a' : rand() < 0.6 ? '#ffffff' : '#a8b8ff' };
    if (kind === 'sand') return { x: anywhere ? rand(0, W) : -4, y: rand(0, H), vx: rand(40, 70), vy: rand(-4, 6), s: 1, c: rand() < 0.5 ? '#e8d8a8' : '#cdbc88' };
    return { x: rand(0, W), y, vx: rand(-8, 4), vy: rand(14, 34), s: rand() < 0.25 ? 2 : 1, c: '#ffffff' };
  }

  updateWeather(dt) {
    for (let i = 0; i < this.weather.length; i++) {
      const f = this.weather[i];
      f.x += (f.vx + Math.sin(this.time * 1.5 + i) * 6) * dt; f.y += f.vy * dt;
      if (f.y > H + 6 || f.y < -6 || f.x < -50 || f.x > W + 6) this.weather[i] = this.newFlake(false);
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.vx !== undefined) {
        if (p.drag) { p.vx *= Math.exp(-p.drag * dt); p.vy *= Math.exp(-p.drag * dt); }
        if (p.grav) p.vy += p.grav * dt;   // bits that fall (or rise, if negative)
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.particles.length > 900) this.particles.splice(0, this.particles.length - 900);
    for (const f of this.floats) { f.t += dt; f.y -= 14 * dt; }
    this.floats = this.floats.filter(f => f.t < 0.95);
    for (const t of this.texts) { t.t += dt; t.y -= 10 * dt; }
    this.texts = this.texts.filter(t => t.t < 1.2);
  }

  // ---------------------------------------------------------- render
  render(ctx) {
    // With lighting on, the room and everyone in it are drawn and lit in a 2x buffer (the art's
    // own scale: sprite pixels stay whole, nothing is lost) and stretched onto the canvas in one
    // crisp step, so the lighting's full-screen passes cost the same at 4K as at 720p. Attacks,
    // numbers and the HUD still draw at full resolution on top.
    const screen = ctx, fullRES = RES, lit = Lighting.on && RES > 2;
    if (lit) { ctx = sceneBuffer(); RES = 2; }
    const shx = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    const shy = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    try {
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = this.stage.bg; ctx.fillRect(0, 0, W, H);
    ctx.translate(-Math.round(this.cam.x) + shx, -Math.round(this.cam.y) + shy);
    ctx.drawImage(this.ground, 0, 0);
    ctx.drawImage(this.decal, 0, 0);
    Lighting.drawTorches(ctx, this.room, this.time);
    this.drawDoors(ctx);
    if (this.stairs) this.drawStairs(ctx);
    this.drawPickups(ctx);
    this.drawTelegraphs(ctx);

    // trainer, Coreatures and pedestals, depth sorted by where they stand
    const actors = [{ y: this.trainer.y, draw: () => this.drawTrainer(ctx) }];
    for (const m of this.mons) if (m.visible) actors.push({ y: m.y, draw: () => this.drawMon(ctx, m) });
    for (const ped of this.pedestals) actors.push({ y: ped.y, draw: () => this.drawPedestal(ctx, ped) });
    actors.sort((a, b) => a.y - b.y).forEach(a => a.draw());
    // the room and everyone in it get lit; attacks and effects below stay crisp and unlit
    Lighting.apply(ctx, this);
    } finally { RES = fullRES; }
    if (lit) {   // the lit 2x scene onto the real canvas, then carry on in world space there
      screen.setTransform(1, 0, 0, 1, 0, 0); screen.imageSmoothingEnabled = false;
      screen.drawImage(ctx.canvas, 0, 0, W * RES, H * RES);
      ctx = screen;
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      ctx.translate(-Math.round(this.cam.x) + shx, -Math.round(this.cam.y) + shy);
    }
    if (Lighting.on) this.drawTelegraphs(ctx, true);

    // attacks and effects: chunky pixel art in their own layer (see fx.js)
    this.drawAttacks(FXLayer.begin(Math.round(this.cam.x) - shx, Math.round(this.cam.y) - shy));
    FXLayer.end(ctx);
    if (this.restoring) this.drawRestore(ctx);
    // the Arcbracer's deploy beam: it shoots to the ground, then fades while the Coreature assembles
    for (const b of this.deploys) {
      const reach = Math.min(1, b.t / b.beam), fade = b.landed ? Math.max(0, 1 - (b.t - b.beam) / 0.25) : 1;
      if (fade <= 0) continue;
      const ex = b.from.x + (b.to.x - b.from.x) * reach, ey = b.from.y + (b.to.y - b.from.y) * reach;
      const n = Math.max(1, Math.round(Math.hypot(ex - b.from.x, ey - b.from.y) / SPR_SCALE));
      ctx.globalAlpha = fade;
      for (let i = 0; i <= n; i++) {
        const x = Math.round((b.from.x + (ex - b.from.x) * i / n) / SPR_SCALE) * SPR_SCALE, y = Math.round((b.from.y + (ey - b.from.y) * i / n) / SPR_SCALE) * SPR_SCALE;
        ctx.fillStyle = b.color; ctx.fillRect(x - SPR_SCALE, y - SPR_SCALE, SPR_SCALE * 2, SPR_SCALE * 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - SPR_SCALE / 2, y - SPR_SCALE / 2, SPR_SCALE, SPR_SCALE);
      }
      if (b.landed) {   // a glowing pad on the ground where it's building
        ctx.strokeStyle = b.color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(Math.round(b.to.x), Math.round(b.to.y + 2), 14, 5, 0, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    this.drawDoorSigns(ctx);
    this.drawBars(ctx);
    this.drawFloats(ctx);
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    this.drawWeather(ctx);
    Lighting.overlay(ctx, this);
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    this.drawMinimap(ctx);
  }

  // Locked doors get bars across the doorway.
  drawDoors(ctx) {
    if (this.state !== 'fight' && !(this.state === 'faint' && this.e.some(m => !m.fainted))) return;
    const F = this.F, hw = DOOR_W / 2;
    for (const dir of Object.keys(this.room.doors)) {
      const d = doorPos(this.room, dir);
      ctx.fillStyle = '#2a2230';
      if (dir === 'n') ctx.fillRect(d.x - hw, F.y0 - 14, DOOR_W, 14);
      if (dir === 's') ctx.fillRect(d.x - hw, F.y1, DOOR_W, 10);
      if (dir === 'w') ctx.fillRect(F.x0 - 10, d.y - hw, 10, DOOR_W);
      if (dir === 'e') ctx.fillRect(F.x1, d.y - hw, 10, DOOR_W);
      ctx.fillStyle = '#9a8a7a';
      for (let i = 0; i < 5; i++) {
        const o = -hw + 4 + i * (DOOR_W - 8) / 4;
        if (dir === 'n') ctx.fillRect(d.x + o - 1, F.y0 - 26, 3, 26);
        if (dir === 's') ctx.fillRect(d.x + o - 1, F.y1, 3, 20);
        if (dir === 'w') ctx.fillRect(F.x0 - 20, d.y + o - 1, 20, 3);
        if (dir === 'e') ctx.fillRect(F.x1, d.y + o - 1, 20, 3);
      }
    }
  }

  // A little sign inside each doorway showing what the room behind it holds (crisp, after the lighting).
  drawDoorSigns(ctx) {
    if (this.state !== 'explore' && this.state !== 'fight') return;
    const F = this.F;
    for (const [dir, next] of Object.entries(this.room.doors)) {
      const sign = doorSign(next);
      if (!sign || !sign.img) continue;
      const d = doorPos(this.room, dir), bob = Math.round(Math.sin(this.time * 3 + d.x) * 1.5);
      const x = Math.round(dir === 'w' ? F.x0 + 24 : dir === 'e' ? F.x1 - 24 : d.x);
      const y = Math.round(dir === 'n' ? F.y0 + 22 : dir === 's' ? F.y1 - 26 : d.y - 22) + bob;
      const w = sign.img.width * 3, h = sign.img.height * 3, bw = Math.max(w, h) + 8;
      ctx.globalAlpha = this.state === 'fight' ? 0.45 : 0.95;
      ctx.fillStyle = OUTLINE; ctx.fillRect(x - bw / 2 - 1, y - bw / 2 - 1, bw + 2, bw + 2);
      ctx.fillStyle = sign.c; ctx.fillRect(x - bw / 2, y - bw / 2, bw, bw);
      ctx.fillStyle = '#2a2438'; ctx.fillRect(x - bw / 2 + 1, y - bw / 2 + 1, bw - 2, bw - 2);
      ctx.drawImage(sign.img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
      ctx.globalAlpha = 1;
    }
  }

  drawStairs(ctx) {
    const s = this.stairs, x = Math.round(s.x), y = Math.round(s.y);
    ctx.fillStyle = OUTLINE; ctx.fillRect(x - 18, y - 13, 36, 26);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ['#6a6070', '#544a5c', '#3e3648', '#2a2432'][i];
      ctx.fillRect(x - 16, y - 11 + i * 6, 32, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x - 16, y - 11 + i * 6, 32, 1);
    }
    const glow = 0.25 + Math.sin(this.time * 4) * 0.15;
    ctx.globalAlpha = glow; ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
    ctx.strokeRect(x - 19, y - 14, 38, 28); ctx.globalAlpha = 1;
  }

  drawPickups(ctx) {
    for (const k of this.pickups) {
      const img = PICKUP_IMG[k.kind];
      const X = Math.round(k.x), Y = Math.round(k.y);
      Lighting.shadow(ctx, X, Y, 4, 1.6, 1.1);
      const bob = k.z > 0 ? k.z : Math.sin(this.time * 4 + k.x) > 0.5 ? 1 : 0;
      // coins spin by squashing sideways
      const sq = k.kind === 'coin' ? Math.max(0.3, Math.abs(Math.cos(this.time * 5 + k.x * 0.3))) : 1;
      const w = img.width * 1.5 * sq, h = img.height * 1.5;
      ctx.drawImage(img, Math.round(X - w / 2), Math.round(Y - h - bob), Math.max(1, Math.round(w)), h);
      if (k.kind === 'shard' && (this.time * 1.3 + k.x * 0.07) % 1 < 0.35) {   // a data shard twinkles now and then
        const sx = Math.round(X + w / 2 - 1), sy = Math.round(Y - h - bob + 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 2, sy, 5, 1); ctx.fillRect(sx, sy - 2, 1, 5);
      }
    }
  }

  drawPedestal(ctx, ped) {
    const X = Math.round(ped.x), Y = Math.round(ped.y);
    Lighting.shadow(ctx, X, Y + 4, 22, 7, 1.1);
    ctx.fillStyle = OUTLINE; ctx.fillRect(X - 19, Y - 7, 38, 13);
    ctx.fillStyle = ped.kind === 'relic' ? '#e0c060' : ped.kind === 'altar' ? '#6a5a7a' : '#b8b0c8'; ctx.fillRect(X - 18, Y - 6, 36, 5);
    ctx.fillStyle = ped.kind === 'relic' ? '#a8862a' : ped.kind === 'altar' ? '#44384e' : '#7a7090'; ctx.fillRect(X - 18, Y - 1, 36, 6);
    let name;
    if (ped.kind === 'altar') {   // a purple flame over dark stone
      const bob = Math.round(Math.sin(this.time * 2.5) * 2), S = ALTAR_IMG.width * 2.5;
      ctx.globalAlpha = 0.3 + Math.sin(this.time * 4) * 0.12; ctx.fillStyle = '#c87aff';
      ctx.beginPath(); ctx.arc(X, Y - 22 + bob, 18, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.drawImage(ALTAR_IMG, Math.round(X - S / 2), Math.round(Y - 12 - ALTAR_IMG.height * 2.5 + bob), S, ALTAR_IMG.height * 2.5);
      name = 'EVOLUTION ALTAR';
    } else if (ped.kind === 'mon') {
      const def = ROSTER_BY_ID[ped.id], sp = SPRITES[ped.id], S = sp.size * SPR_SCALE;
      const bob = Math.sin(this.time * 3 + ped.x) > 0.6 ? -1 : 0;
      ctx.save(); ctx.translate(X, Y - 6 + bob); if (ped.x > this.P.x) ctx.scale(-1, 1);
      ctx.drawImage(sp.img, -S / 2, -S + 3, S, S); ctx.restore();
      name = def.name;
    } else {
      const img = itemIcon(ped.id), S = img.width * 1.5, bob = Math.round(Math.sin(this.time * 2.5 + ped.x) * 2);
      if (ped.kind === 'relic') {   // a soft glow under treasure
        ctx.globalAlpha = 0.25 + Math.sin(this.time * 4) * 0.1; ctx.fillStyle = '#ffe066';
        ctx.beginPath(); ctx.arc(X, Y - 20 + bob, 15, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.drawImage(img, Math.round(X - S / 2), Math.round(Y - 12 - S + bob), S, S);
      name = itemDef(ped.id).name;
    }
    ctx.font = 'italic 900 8px "Lilita One", "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = 3; ctx.strokeStyle = '#2a1405'; ctx.strokeText(name, X, Y + 16);
    ctx.fillStyle = '#ffe066'; ctx.fillText(name, X, Y + 16);
    if (ped.kind === 'shop') {   // price tag
      const img = numberCanvas(ped.item.price, this.run.coins >= ped.item.price ? '#fff6c8' : '#ff9a8a', this.run.coins >= ped.item.price ? '#e0b040' : '#c04a3a');
      const w = img.width * 1.5 + 11;
      ctx.drawImage(COIN_IMG, Math.round(X - w / 2), Y + 20, COIN_IMG.width * 1.5, COIN_IMG.height * 1.5);
      ctx.drawImage(img, Math.round(X - w / 2 + 10), Y + 20, img.width * 1.5, img.height * 1.5);
    }
  }

  // Each wild Coreature carries a small HP bar (the boss gets the big one in the HUD).
  drawBars(ctx) {
    const STATUS_COL = { par: '#d6b21e', brn: '#e0582a', frz: '#4fb6d8', psn: '#9a3ab8' };
    for (const m of this.e) {
      if (!m.alive || m.boss) continue;
      const w = 26, x = Math.round(m.x - w / 2), y = Math.round(m.y - m.h - 6 - (m.hover || 0));
      const pct = m.hp / m.maxHp;
      ctx.fillStyle = OUTLINE; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = '#2a2638'; ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = pct > 0.5 ? '#3ccf4e' : pct > 0.2 ? '#f2c12e' : '#e8433a';
      ctx.fillRect(x, y, Math.max(1, Math.round(w * pct)), 3);
      if (m.status) { ctx.fillStyle = STATUS_COL[m.status]; ctx.fillRect(x + w + 2, y - 1, 4, 5); }
      m.def.types.forEach((t, i) => ctx.drawImage(typeIcon(t), x - 10 - i * 9, y - 3));   // its types, read before the first hit
      if (m.champ) {   // the champion's trait over its bar
        const c = CHAMPIONS[m.champ];
        ctx.font = 'italic 900 7px "Lilita One", "Arial Black", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#15111f'; ctx.strokeText(c.name, m.x, y - 3); ctx.fillStyle = c.color; ctx.fillText(c.name, m.x, y - 3);
      }
    }
    if (this.drawBossBits) this.drawBossBits(ctx);   // bosses.js: interrupt and stagger bars, frostbite
  }

  // The Restore moment (Battle.startRestore): a spotlight, the swirling data, the new name.
  drawRestore(ctx) {
    const R = this.restoring, m = R.m, t = R.t, T = RESTORE_T;
    const dim = Math.min(1, t / 0.35) * (t > T.end - 1.1 ? Math.max(0, (T.end - t) / 1.1) : 1);
    // the room dims to a spotlight on the Coreature (a cheap gradient, only while this plays)
    const cx = m.x, cy = m.cy, g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 120);
    g.addColorStop(0, 'rgba(6,4,14,0)'); g.addColorStop(0.35, `rgba(6,4,14,${0.45 * dim})`); g.addColorStop(1, `rgba(6,4,14,${0.88 * dim})`);
    ctx.fillStyle = g; ctx.fillRect(this.cam.x - 4, this.cam.y - 4, W + 8, H + 8);
    // its pixels: out and up in a swirl, then back in as the new form builds
    if (R.broke && t < T.build + 0.1) {
      for (const p of R.pixels) {
        const out = clamp((t - T.glow) / (T.swirl - T.glow), 0, 1), back = clamp((t - T.swirl) / (T.build - T.swirl), 0, 1);
        const e = out * (1 - back), ease = e * e * (3 - 2 * e);
        const ang = p.ang + p.spin * (t - T.glow), r = p.r0 + p.out * ease;
        const x = (cx + Math.cos(ang) * r) * ease + p.x0 * (1 - ease), y = (cy + Math.sin(ang) * r - p.lift * ease) * ease + p.y0 * (1 - ease);
        ctx.globalAlpha = back > 0 ? 1 - back * 0.8 : 1;
        ctx.fillStyle = (Math.floor(t * 20 + p.r0) % 5 === 0) ? '#ffffff' : p.color;
        ctx.fillRect(Math.round(x - p.size * 0.25), Math.round(y - p.size * 0.25), p.size * 1.5, p.size * 1.5);
      }
      ctx.globalAlpha = 1;
    }
    // the payoff: its new name, big, over "RESTORED · STAGE II"
    if (R.built) {
      const k = clamp((t - T.build) / 0.25, 0, 1), fade = t > T.end - 0.5 ? Math.max(0, (T.end - t) / 0.5) : 1;
      const x = this.cam.x + W / 2, y = this.cam.y + H * 0.28, col = TYPES[m.def.types[0]].color;
      ctx.save(); ctx.globalAlpha = fade; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.font = `italic 900 ${Math.round(30 * (1.6 - 0.6 * k))}px "Lilita One", "Arial Black", Arial, sans-serif`;
      ctx.lineWidth = 6; ctx.strokeStyle = '#15111f'; ctx.strokeText(m.def.name, x, y); ctx.fillStyle = '#ffe066'; ctx.fillText(m.def.name, x, y);
      ctx.font = 'italic 900 11px "Lilita One", "Arial Black", Arial, sans-serif';
      const sub = `RESTORED · STAGE ${STAGE_NUM[formStage(m.def)]}`;
      ctx.lineWidth = 4; ctx.strokeText(sub, x, y + 16); ctx.fillStyle = col; ctx.fillText(sub, x, y + 16);
      ctx.restore();
    }
  }

  drawTrainer(ctx) {
    const t = this.trainer, img = this.trainerImg[t.view];
    const px = Math.round(t.x), py = Math.round(t.y);
    Lighting.shadow(ctx, px, py, 11, 4, 0.9);
    // walking: a 4-frame step (pixel.js trainerWalk), a frame every 10 world units, up a pixel as a leg lifts
    const f = Math.floor(t.walkT / 10) % 4;
    // standing: acting something out (trainer.js) or just standing
    const act = !t.moving && t.act ? trainerActFrame(t.act, this.time - t.actT) : null;
    const pic = t.moving ? this.trainerWalk[t.view][f] : act ? trainerPose(this.look, t.view, act.pose) : img;
    const bob = t.moving && f % 2 ? -1 : act && act.hop ? -act.hop : 0;
    const w = pic.width * SPR_SCALE, h = pic.height * SPR_SCALE;
    ctx.save(); ctx.translate(px, 0); if (isSideView(t.view) && t.face < 0) ctx.scale(-1, 1);
    ctx.drawImage(pic, Math.round(-w / 2), Math.round(py - h + 1 + bob), w, h);
    ctx.restore();
  }

  drawMon(ctx, m) {
    const sp = monSprite(m), S = sp.size * SPR_SCALE * m.scale;
    let alpha = 1, sink = 0;
    if (m.fainted) { alpha = Math.max(0, 1 - m.fadeT / 1.1); sink = m.fadeT * 6; }
    if (alpha <= 0) return;
    const moving = Math.hypot(m.vx, m.vy) > 12;
    const X = Math.round(m.x), Y = Math.round(m.y);
    // flying Coreatures hover above their shadow with a slow bob and flap their wings (they drop
    // to the ground when frozen or fainted)
    const fly = sp.fly, grounded = m.status === 'frz' || m.fainted, phase = (m.x0 ?? (m.x0 = Math.random() * 10));
    const hover = (fly && !grounded ? Math.round(fly.hover + Math.sin(this.time * 2.4 + phase) * 1.5) : 0) + Math.round(m.fainted ? 0 : m.jump || 0);   // jump: a boss leaping (bosses.js)
    m.hover = hover;
    // how it looks right now (sprites.js monAnim): a rigged Coreature's animation frame, or a hop / dip
    const still = m.status === 'frz' || m.stunT > 0 || m.lift > 0.01;
    const pose = still && !m.fainted ? { views: sp.views, sq: 0, sh: 0, dy: 0 } : monAnim(m, phase, !!fly && !grounded);
    const bob = -pose.dy;
    // wings in four steps (r110): up, half-way, down, half-way
    const beat = fly && sp.flap && !grounded && m.stunT <= 0 && !pose.noFlap ? Math.floor(((this.time * fly.flap * (moving ? 1.3 : 1) + phase) % 1) * 4) : 0;
    const wings = beat === 2 ? pose.views.flapped : beat % 2 ? pose.views.half || pose.views.flapped : null;
    const set = wings || pose.views, img = set[viewKey(set, m.view, m.face)];
    const mine = m.side === 'player';

    // ground marker + shadow
    ctx.globalAlpha = alpha;
    Lighting.shadow(ctx, X, Y, (m.r + 2) * (hover ? 0.8 : 1), m.r * 0.42 * (hover ? 0.8 : 1));
    ctx.strokeStyle = mine ? 'rgba(90,160,255,0.75)' : m.boss ? 'rgba(255,200,60,0.8)' : m.champ ? CHAMPIONS[m.champ].color : 'rgba(255,90,80,0.6)';
    ctx.lineWidth = m.champ ? 2 : 1;
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 4, m.r * 0.5 + 1, 0, 0, TAU); ctx.stroke();
    // a champion glows in its colour
    if (m.champ && !m.fainted) { ctx.globalAlpha = alpha * (0.18 + 0.08 * Math.sin(this.time * 5)); ctx.fillStyle = CHAMPIONS[m.champ].color; ctx.beginPath(); ctx.ellipse(X, Y - m.h / 2, m.r + 6, m.h / 2 + 4, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = alpha; }

    // dash afterimages
    for (const g of m.ghosts) {
      ctx.globalAlpha = (g.t / 0.22) * 0.3 * alpha;
      ctx.save(); ctx.translate(Math.round(g.x), Math.round(g.y)); if (isSideView(g.view) && g.face < 0) ctx.scale(-1, 1);
      ctx.drawImage(tinted(m.id, g.color, g.view), -S / 2, -S + 3, S, S); ctx.restore();
    }
    ctx.globalAlpha = alpha;

    // buff aura
    if (m.buffs.length && !m.fainted) {
      ctx.globalAlpha = 0.25 + Math.sin(this.time * 8) * 0.1;
      ctx.fillStyle = TYPES[m.def.types[0]].fx[1];
      ctx.beginPath(); ctx.ellipse(X, Y - 1, m.r + 5, m.r * 0.6 + 2, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = alpha;
    }

    ctx.save();
    ctx.translate(X, Math.round(Y + bob + sink - hover));
    // only side-on views are mirrored for facing left: front and back views stay as drawn, so a Coreature
    // whose two sides differ (Slumbear, Daimochi's katana) keeps each colour and thing on its own side (r128)
    if (isSideView(m.view) && m.face < 0) ctx.scale(-1, 1);
    const roll = m.action && m.action.kind === 'dash' && m.action.mv.fx === 'roll' && m.action.t > 0.1;
    if (roll) { ctx.translate(0, -S / 2 + 3); ctx.rotate((m.action.t - 0.1) * 22); ctx.translate(0, S / 2 - 3); }   // Rollout: tumble along
    if (m.lift > 0.01) {   // caught in a tornado: carried up and spun round
      const L = m.lift * m.lift;
      ctx.translate(Math.sin(this.time * 9) * 5 * L, -L * (30 + Math.sin(this.time * 5) * 4) - S / 2 + 3);
      ctx.rotate(this.time * 9 * L);
      ctx.translate(0, S / 2 - 3);
    }
    if (m.restoreHide) { ctx.restore(); return; }   // broken apart into data during the Restore moment
    const pic = posed(img, pose.sq, pose.sh), k = S / sp.size, pw = pic.width * k, ph = pic.height * k;
    // Glitched: now and then it skips sideways for a moment, like a bad signal
    const skip = m.glitched && (this.time * 0.7 + (m.side === 'enemy' ? 0.5 : 0)) % 1 < 0.05 ? (Math.sin(this.time * 70) > 0 ? 2 : -2) * k : 0;
    const dx = -pw / 2 + skip, dy = 3 - ph;
    if (m.assembleT !== undefined && m.assembleT < 1) drawAssembling(ctx, pic, dx, dy, pw, ph, m.assembleT, TYPES[m.def.types[0]].color);   // beamed in from the Arcbracer
    else ctx.drawImage(pic, dx, dy, pw, ph);
    let tint = null, ta = 0;
    if (m.flash > 0) { tint = '#ffffff'; ta = Math.min(0.45, m.flash * 3.5); }   // a hit flash you can still see the Coreature through (r147)
    else if (m.fainted) { tint = '#ffffff'; ta = Math.min(0.8, m.fadeT); }
    else if (m.status === 'frz') { tint = '#9fe6ff'; ta = 0.55; }
    else if (m.status === 'par' && Math.sin(this.time * 18) > 0.6) { tint = '#ffe24a'; ta = 0.45; }
    else if (m.status === 'brn' && Math.sin(this.time * 10) > 0.5) { tint = '#ff5a2a'; ta = 0.35; }
    else if (m.status === 'psn' && Math.sin(this.time * 7) > 0.4) { tint = '#b04ae0'; ta = 0.4; }
    else if (m.stunT > 0 && Math.sin(this.time * 20) > 0) { tint = '#ffffff'; ta = 0.25; }
    if (this.restoring && this.restoring.m === m && !this.restoring.broke) {   // glowing brighter as it charges
      const k2 = this.restoring.t / RESTORE_T.glow; tint = '#ffffff'; ta = Math.min(0.9, 0.2 + k2 * 0.7 * (0.75 + 0.25 * Math.sin(this.time * 30)));
    }
    if (tint) { ctx.globalAlpha = ta * alpha; ctx.drawImage(tintOf(pic, tint), dx, dy, pw, ph); }
    ctx.restore();
    ctx.globalAlpha = 1;

    // relic auras (relics that are an effect rather than something worn), from the party's and its own fused relics
    if (m.side === 'player' && !m.fainted && this.run) {
      const kinds = new Set();
      for (const id of [...this.run.relics, ...(m.fused || [])]) if (RELICS[id] && RELICS[id].aura) kinds.add(RELICS[id].aura);
      for (const k of kinds) RELIC_AURA[k](ctx, this, m, X, Math.round(Y + sink - hover), moving);
    }
    if (SPECIES_AURA[m.id] && !m.fainted && !m.restoreHide) RELIC_AURA[SPECIES_AURA[m.id]](ctx, this, m, X, Math.round(Y + sink - hover), moving);

    if (m.status === 'frz' && !m.fainted) {
      ctx.strokeStyle = 'rgba(220,250,255,0.9)'; ctx.fillStyle = 'rgba(160,230,255,0.25)';
      ctx.fillRect(Math.round(X - S / 2), Math.round(Y - S + 3), S, S - 3);
      ctx.strokeRect(Math.round(X - S / 2) + 0.5, Math.round(Y - S + 3) + 0.5, S - 1, S - 4);
    }
  }

  // outlines: true redraws only the outlines (after the room lighting, so warnings stay bright)
  drawTelegraphs(ctx, outlines = false) {
    const fill = () => { if (!outlines) ctx.fill(); };
    const pulse = 0.55 + Math.sin(this.time * 14) * 0.2;
    ctx.lineWidth = 1.5;
    // a wild Coreature about to appear: a shadow growing on the ground
    for (const m of this.e) {
      if (m.spawnT <= 0) continue;
      const k = clamp(1 - m.spawnT / 0.7, 0, 1);
      ctx.globalAlpha = 0.2 + k * 0.3; ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, (m.r + 2) * k, (m.r * 0.45) * k, 0, 0, TAU); fill();
      ctx.globalAlpha = pulse; ctx.strokeStyle = m.boss ? '#ffd23f' : '#ff6a5a';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.ellipse(m.x, m.y, m.r + 6, m.r * 0.5 + 3, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const z of this.zones) {
      if (z.done) {
        if (!z.mv.linger || z.mv.fx === 'tornado') continue;   // a tornado draws its own base (fx.js)
        // lingering pool: fades in and out, with bubbles popping across it
        const age = z.t - z.delay, left = z.mv.linger - age;
        const fade = clamp(Math.min(age / 0.15, left / 0.4), 0, 1);
        const zx = z.x, zy = z.y, fx = fxOf(z.mv);
        ctx.globalAlpha = 0.38 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); fill();
        ctx.globalAlpha = 0.7 * fade; ctx.strokeStyle = fx[1]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(zx, zy, z.r * (0.95 + Math.sin(this.time * 6) * 0.03), z.r * 0.68, 0, 0, TAU); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const ph = (this.time * 1.3 + i * 0.37 + z.id * 0.11) % 1;
          const a = i * 2.4 + z.id, rr = z.r * 0.6 * ((i * 0.37 + z.id * 0.07) % 1);
          ctx.globalAlpha = (1 - ph) * fade; ctx.strokeStyle = fx[2]; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(zx + Math.cos(a) * rr, zy + Math.sin(a) * rr * 0.7, 1 + ph * 3, 0, TAU); ctx.stroke();
        }
        continue;
      }
      const k = clamp(z.t / z.delay, 0, 1), zx = z.x, zy = z.y;
      ctx.fillStyle = fxOf(z.mv)[0];
      ctx.globalAlpha = 0.18 + k * 0.2;
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r * k, z.r * k * 0.7, 0, 0, TAU); fill();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const m of this.mons) {
      const a = m.action;
      if (!a || !m.visible) continue;
      const X = m.x, Y = m.y, dir = a.dir;
      if (a.kind === 'burst' && !a.done && a.mv.cone) {   // a cone: a wedge in front
        const k = clamp(a.t / a.mv.delay, 0, 1), c0 = dir - a.mv.cone, c1 = dir + a.mv.cone;
        const wedge = r => { ctx.beginPath(); ctx.moveTo(X, Y); ctx.ellipse(X, Y, r, r * 0.7, 0, c0, c1); ctx.closePath(); };
        ctx.fillStyle = fxOf(a.mv)[0]; ctx.globalAlpha = 0.15 + k * 0.2; wedge(a.r * k); fill();
        ctx.globalAlpha = pulse; ctx.strokeStyle = '#ffffff'; ctx.setLineDash([4, 3]); wedge(a.r); ctx.stroke(); ctx.setLineDash([]);
      } else if (a.kind === 'burst' && !a.done) {
        const k = clamp(a.t / a.mv.delay, 0, 1);
        ctx.fillStyle = fxOf(a.mv)[0];
        ctx.globalAlpha = 0.15 + k * 0.2;
        ctx.beginPath(); ctx.ellipse(X, Y, a.r * k, a.r * k * 0.7, 0, 0, TAU); fill();
        ctx.globalAlpha = pulse; ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.ellipse(X, Y, a.r, a.r * 0.7, 0, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (a.kind === 'beam' && a.phase === 'charge') {
        const cy = m.cy;
        ctx.globalAlpha = 0.3 + (a.t / a.mv.charge) * 0.4;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(X, cy);
        ctx.lineTo(X + Math.cos(dir) * a.mv.len, cy + Math.sin(dir) * a.mv.len); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1.5;
      }
      if (a.kind === 'vortex') {
        // swirling dashed rings marking the pull radius
        const fx = fxOf(a.mv), fade = clamp(Math.min(a.t / 0.12, (a.mv.dur - a.t) / 0.2), 0, 1);
        ctx.globalAlpha = 0.16 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r, a.mv.r * 0.7, 0, 0, TAU); fill();
        ctx.lineWidth = 1.5;
        for (const [sc, spd, col] of [[1, 1, fx[2]], [0.66, -1.6, fx[1]], [0.33, 2.4, fx[2]]]) {
          ctx.globalAlpha = 0.75 * fade; ctx.strokeStyle = col;
          ctx.setLineDash([7, 5]); ctx.lineDashOffset = this.time * 40 * spd;
          ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r * sc, a.mv.r * sc * 0.7, 0, 0, TAU); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      if (a.kind === 'dash' && a.t <= 0.1) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = fxOf(a.mv)[2];
        ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.lineTo(X + Math.cos(dir) * 40, Y + Math.sin(dir) * 40); ctx.stroke();
      }
    }
    if (this.drawHazards) this.drawHazards(ctx, outlines);   // a boss's warned attacks (bosses.js)
    ctx.globalAlpha = 1;
  }

  drawFloats(ctx) {
    for (const f of this.floats) {
      const pop = (f.t < 0.1 ? 3 - f.t * 10 : 2) * (f.scale || 1);
      ctx.globalAlpha = f.t > 0.7 ? 1 - (f.t - 0.7) / 0.25 : 1;
      const w = f.img.width * pop, h = f.img.height * pop;
      ctx.drawImage(f.img, Math.round(f.x - w / 2), Math.round(f.y - h), w, h);
    }
    ctx.globalAlpha = 1;
    ctx.font = 'italic 900 10px "Lilita One", "Arial Black", "Segoe UI Black", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const t of this.texts) {
      ctx.globalAlpha = t.t > 0.9 ? 1 - (t.t - 0.9) / 0.3 : 1;
      const x = clamp(t.x, this.cam.x + 50, this.cam.x + W - 50), y = t.y;
      ctx.lineWidth = 3; ctx.strokeStyle = '#2a1405'; ctx.strokeText(t.str, x, y);
      ctx.fillStyle = t.color; ctx.fillText(t.str, x, y);
    }
    ctx.globalAlpha = 1;
  }

  drawWeather(ctx) {
    for (const f of this.weather) { ctx.fillStyle = f.c; ctx.globalAlpha = 0.85; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s); }
    ctx.globalAlpha = 1;
  }

  // Top-right: the rooms you've seen on this floor, and your coins.
  drawMinimap(ctx) {
    const rooms = this.run.floor.rooms;
    const seen = r => this.run.reveal || r.visited || Object.values(r.doors).some(o => o.visited);   // the Dungeon Diver's lantern shows it all
    const shown = rooms.filter(seen);
    const cw = 13, ch = 9, gap = 2;
    const gxs = shown.map(r => r.gx), gys = shown.map(r => r.gy);
    const minX = Math.min(...gxs), maxX = Math.max(...gxs), minY = Math.min(...gys), maxY = Math.max(...gys);
    const mw = (maxX - minX + 1) * (cw + gap) + 3, mh = (maxY - minY + 1) * (ch + gap) + 3;
    const x0 = W - mw - 6, y0 = 6;
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#0e0b18'; ctx.fillRect(x0 - 2, y0 - 2, mw + 4, mh + 4); ctx.globalAlpha = 1;
    for (const r of shown) {
      const x = x0 + 2 + (r.gx - minX) * (cw + gap), y = y0 + 2 + (r.gy - minY) * (ch + gap);
      ctx.fillStyle = r === this.room ? '#ffffff' : r.visited ? '#8a84a0' : '#3a3450';
      ctx.fillRect(x, y, cw, ch);
      const icon = r.type === 'boss' ? '#e8433a' : r.type === 'recruit' && !r.recruited ? '#5aa0ff'
        : r.type === 'shop' ? '#ffd23f' : r.type === 'treasure' && !r.taken ? '#ffffff' : null;
      if (icon) { ctx.fillStyle = icon; ctx.fillRect(x + 4, y + 3, 5, 3); }
    }
    // coins
    const img = numberCanvas(this.run.coins, '#fff6c8', '#e0b040');
    const cy = y0 + mh + 6;
    ctx.drawImage(COIN_IMG, W - 8 - img.width * 2 - 12, cy + 1, COIN_IMG.width * 2, COIN_IMG.height * 2);
    ctx.drawImage(img, W - 6 - img.width * 2, cy, img.width * 2, img.height * 2);
    ctx.font = 'italic 900 9px "Lilita One", "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'right'; ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#15111f';
    const label = floorLabel(this.run);
    ctx.strokeText(label, W - 6, cy + 26); ctx.fillStyle = '#ffffff'; ctx.fillText(label, W - 6, cy + 26);
  }
});
