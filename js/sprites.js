// Original monster designs, drawn procedurally with the PixGrid primitives.
// Each draw function receives an empty grid and paints back-to-front.

const P = (b, s, l) => ({ b, s, l });
const DARK_EYE = '#1a1222';
// Toshi's colours (from photos of the real dog), shared by Smugshi and Smugshogun
const TOSHI = { coat: P('#d08548', '#a85e2c', '#e8a868'), white: P('#f7f1e6', '#e2d4bf', '#ffffff'), ear: '#f1dcc4' };

// Wings: flying monsters draw their wings through these, so buildSprites can make a second
// "flap" frame (FLAP = 1): polygons swing down from the shoulder (their first point, or w.root;
// w.swing overrides the angle), ellipses (butterfly wings) fold in toward the body.
let FLAP = 0;
function flapPts(pts, w = {}) {
  if (!FLAP) return pts;
  const [rx, ry] = w.root || pts[0];
  const cx = pts.reduce((t, p) => t + p[0], 0) / pts.length;
  const a = FLAP * (w.swing ?? 0.85 * Math.sign(cx - rx)), c = Math.cos(a), sn = Math.sin(a);
  return pts.map(([x, y]) => { const dx = (x - rx) * 0.85, dy = (y - ry) * 0.85; return [rx + dx * c - dy * sn, ry + dx * sn + dy * c]; });
}
const wingPoly = (g, pts, pal, opt, w) => g.poly(flapPts(pts, w), pal, opt);
const wingPolyM = (g, pts, pal, opt, w) => g.polyM(flapPts(pts, w), pal, opt);
const flapEll = (cx, rx) => (FLAP ? [16 + (cx - 16) * 0.72, rx * 0.55] : [cx, rx]);
const wingEllipse = (g, cx, cy, rx, ry, pal, opt) => { const [x, r] = flapEll(cx, rx); return g.ellipse(x, cy, r, ry, pal, opt); };
const wingEllipseM = (g, cx, cy, rx, ry, pal, opt) => { const [x, r] = flapEll(cx, rx); return g.ellipseM(x, cy, r, ry, pal, opt); };

// ---------- rigs: real frame animation drawn from the same art ----------
// A rigged monster draws each part of itself through part(g, dx, dy), so the parts can move
// separately: RIG (set while its animation frames are built, null for the plain drawing) says
// where. body: the torso's y; head: [x, y] for the head and everything on it (x is "forward",
// used in side views); tail: [x, y] (also anything that trails, like a headband's tails);
// legs: [a, b] how far each leg (or diagonal pair of legs) is lifted; arms: [a, b] how far each
// arm swings forward; ears: [a, b] how far each ear drops (2 = pinned back); eyes: null, 'blink',
// 'hurt', 'sleep' or 'faint'; mouth: null, 'open' or 'roar'. With no pose set it draws exactly
// as before. Which frames exist comes from the monster's body type (RIG_FRAMES), picked in RIGGED.
let RIG = null;
const REST = { body: 0, head: [0, 0], tail: [0, 0], legs: [0, 0], arms: [0, 0], ears: [0, 0], eyes: null, mouth: null };
const rig = () => RIG || REST;
function part(g, dx = 0, dy = 0) {
  if (!dx && !dy) return g;
  const W = g.w, p = {};
  const sh = pts => pts.map(([x, y]) => [x + dx, y + dy]), mir = pts => pts.map(([x, y]) => [W - x, y]);
  p.ellipse = (cx, cy, rx, ry, pal, opt) => (g.ellipse(cx + dx, cy + dy, rx, ry, pal, opt), p);
  p.ellipseM = (cx, cy, rx, ry, pal, opt) => (g.ellipse(cx + dx, cy + dy, rx, ry, pal, opt), g.ellipse(W - cx + dx, cy + dy, rx, ry, pal, opt), p);
  p.poly = (pts, pal, opt) => (g.poly(sh(pts), pal, opt), p);
  p.polyM = (pts, pal, opt) => (g.poly(sh(pts), pal, opt), g.poly(sh(mir(pts)), pal, opt), p);
  p.rect = (x, y, w, h, col) => (g.rect(x + dx, y + dy, w, h, col), p);
  p.rectM = (x, y, w, h, col) => (g.rect(x + dx, y + dy, w, h, col), g.rect(W - x - w + dx, y + dy, w, h, col), p);
  p.px = (x, y, col) => (g.px(x + dx, y + dy, col), p);
  p.pxM = (x, y, col) => (g.px(x + dx, y + dy, col), g.px(W - 1 - x + dx, y + dy, col), p);
  p.eyes = (x, y, dark = '#1a1222', opt = {}) => {   // PixGrid.eyes, shifted
    const hh = opt.h ?? 3, w = opt.w ?? 2, mx = W - x - w;
    p.rectM(x, y, w, hh, dark); p.px(x, y, '#ffffff'); p.px(mx, y, '#ffffff');
    if (opt.brow) { p.px(x - 1, y - 2, OUTLINE); p.px(x, y - 2, OUTLINE); p.px(x + 1, y - 1, OUTLINE); p.px(x + 2, y - 1, OUTLINE);
      p.px(mx + w, y - 2, OUTLINE); p.px(mx + w - 1, y - 2, OUTLINE); p.px(mx, y - 1, OUTLINE); p.px(mx - 1, y - 1, OUTLINE); }
    return p;
  };
  return p;
}
// Every part a rigged monster's art needs, for view v: b (body), h (head), t (tail), earA / earB,
// legA / legB (lifted legs also step forward in side views), armA / armB (swing forward: sideways
// in side views, up when facing you), plus Q, the pose itself.
function rigParts(g, v) {
  const Q = rig(), side = v !== 'front' && v !== 'back', fwd = side ? Q.head[0] : 0;
  const ear = i => part(g, fwd - (side && Q.ears[i] > 1 ? 1 : 0), Q.head[1] + Q.ears[i]);
  const leg = i => part(g, side && Q.legs[i] ? 1 : 0, -Q.legs[i]);
  const arm = i => part(g, side ? Q.arms[i] : 0, Q.body - (side ? 0 : Q.arms[i]));
  return { Q, b: part(g, 0, Q.body), h: part(g, fwd, Q.head[1]), t: part(g, Q.tail[0], Q.body + Q.tail[1]),
    earA: ear(0), earB: ear(1), legA: leg(0), legB: leg(1), armA: arm(0), armB: arm(1) };
}
// A walk where the head and tail follow the body a frame late (follow-through); swing = the tail's sideways swing.
const lagged = frames => frames.map((f, i, a) => {
  const prev = a[(i + a.length - 1) % a.length].body || 0;
  return { ...f, head: [f.head ? f.head[0] : 0, prev + (f.head ? f.head[1] : 0)], tail: [f.swing || 0, prev] };
});
// Frames every body type has: blink, an ear flick, chewing (Snack Time).
const RIG_COMMON = { blink: { eyes: 'blink' }, flick: { ears: [2, 0] }, chew: [{ mouth: 'open' }, { head: [0, 1] }] };
// The animation frames for each body type. walk and idle loop; run is a dash; roar fires a
// beam; throw is a shot or a strike from above; proud is a buff (and some heals); sleep is
// Blanket Nap; faint is drawn and then laid on its side (lying()).
const RIG_FRAMES = {
  quad: {   // four legs, stepping in diagonal pairs (Toshi)
    walk: lagged([{ body: 0, swing: 1 }, { body: -1, legs: [2, 0] }, { body: 0, swing: -1 }, { body: -1, legs: [0, 2] }]),
    idle: [{}, { tail: [1, 0] }, { head: [0, -1] }, { head: [0, -1], tail: [-1, 0] }],
    windup: { body: 1, head: [-1, 1], tail: [0, 1], ears: [1, 1] },
    attack: { head: [1, 0], tail: [0, -1], mouth: 'open' },
    hurt: { head: [-1, -1], eyes: 'hurt', mouth: 'open', ears: [2, 2] },
    run: [{ body: -1, head: [1, -1], legs: [2, 0], ears: [2, 2], tail: [-1, -1] }, { head: [1, 0], legs: [0, 2], ears: [2, 2], tail: [-1, 0] }],
    roar: { head: [1, -1], mouth: 'roar', ears: [1, 1], tail: [0, -1] },
    throw: { head: [1, -1], mouth: 'open', tail: [0, -1] },
    proud: { body: -1, head: [0, -2], eyes: 'blink', tail: [0, -1] },
    sleep: { body: 1, head: [0, 2], eyes: 'sleep', ears: [1, 1], tail: [0, 1] },
    faint: { eyes: 'faint', mouth: 'open', ears: [2, 2] },
  },
  biped: {  // two legs and swinging arms (Brawlix; later Slumbear, Mondaze, Gearhulk, the trainer)
    walk: lagged([{ body: 0 }, { body: -1, legs: [2, 0], arms: [-1, 1] }, { body: 0 }, { body: -1, legs: [0, 2], arms: [1, -1] }]),
    idle: [{}, {}, { head: [0, -1] }, { head: [0, -1], tail: [1, 0] }],
    windup: { body: 1, head: [-1, 1], arms: [-2, -2] },
    attack: { head: [1, 0], arms: [2, 2], mouth: 'open', tail: [-1, 0] },
    hurt: { head: [-1, -1], arms: [-1, -1], eyes: 'hurt', mouth: 'open' },
    run: [{ body: -1, head: [1, -1], legs: [2, 0], arms: [-2, 2], tail: [-1, -1] }, { head: [1, 0], legs: [0, 2], arms: [2, -2], tail: [-1, 0] }],
    roar: { head: [0, -1], arms: [-1, -1], mouth: 'roar' },
    throw: { head: [1, 0], arms: [2, -1], mouth: 'open' },
    proud: { body: -1, head: [0, -1], arms: [2, 2], eyes: 'blink' },
    sleep: { body: 1, head: [0, 2], arms: [-1, -1], eyes: 'sleep' },
    faint: { eyes: 'faint', mouth: 'open' },
  },
  floater: {   // no legs: it drifts and its tail sways (Wispurr; later Mindra)
    walk: lagged([{ body: 0, swing: 1 }, { body: -1 }, { body: -1, swing: -1 }, { body: 0 }]),
    idle: [{}, { tail: [1, 0] }, { tail: [0, -1] }, { tail: [-1, 0] }],
    windup: { body: 1, head: [-1, 1], ears: [1, 1] },
    attack: { head: [1, 0], mouth: 'open', tail: [-1, 0] },
    hurt: { head: [-1, -1], eyes: 'hurt', mouth: 'open', ears: [2, 2] },
    run: [{ body: -1, head: [1, 0], tail: [-2, 0], ears: [2, 2] }, { head: [1, 0], tail: [-2, 1], ears: [2, 2] }],
    roar: { head: [1, -1], mouth: 'roar', ears: [1, 1] },
    throw: { head: [1, -1], mouth: 'open' },
    proud: { body: -1, head: [0, -1], eyes: 'blink' },
    sleep: { body: 1, head: [0, 1], eyes: 'sleep', ears: [1, 1] },
    faint: { eyes: 'faint', mouth: 'open' },
  },
};
RIG_FRAMES.flier = { ...RIG_FRAMES.floater, idle: [{}, { tail: [1, 0] }, { body: -1, tail: [0, -1] }, { body: -1, tail: [-1, 0] }] };   // hovers; buildSprites also draws each frame wings-down
RIG_FRAMES.slither = { ...RIG_FRAMES.floater,   // a serpent's coil stays put while the body sways and the tail swishes
  walk: lagged([{ body: 0, swing: 2 }, { body: -1, swing: 1 }, { body: 0, swing: -2 }, { body: -1, swing: -1 }]),
  idle: [{}, { tail: [1, 0] }, { head: [0, -1], tail: [2, 0] }, { head: [0, -1], tail: [1, 0] }] };
// Heals that show a pose of their own for as long as their effect plays (Blanket Nap sleeps).
const HEAL_POSE = { blanketNap: ['sleep', 1.6], snack: ['chew', 0.95], photosynth: ['proud', 1.1], wish: ['proud', 1.2] };
// A fainted monster lies on its side: the faint frame turned a quarter (exact, so the pixels
// stay crisp) and trimmed to what's drawn, so it rests on the ground.
function lying(src) {
  const w = src.width, h = src.height, r = document.createElement('canvas');
  r.width = h; r.height = w;
  const c = r.getContext('2d');
  c.translate(0, w); c.rotate(-Math.PI / 2); c.drawImage(src, 0, 0);
  const d = c.getImageData(0, 0, r.width, r.height).data;
  let x0 = r.width, y0 = r.height, x1 = -1, y1 = -1;
  for (let y = 0; y < r.height; y++) for (let x = 0; x < r.width; x++) if (d[(y * r.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return src;
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, out = document.createElement('canvas');
  out.width = cw + (cw % 2); out.height = ch + 1;
  out.getContext('2d').drawImage(r, x0, y0, cw, ch, 0, 0, cw, ch);
  return out;
}
// Faces shared by rigged monsters: draws a pair of eyes (or one, in a side view) in the pose's
// state. at(x, y) for each eye's top-left; normal() draws the usual open eye.
// A mirrored pair of eyes (left one at x, the other mirrored in a grid W wide): the usual ones, or the pose's.
function rigEyes(h, R, W, x, y, w, normal) { if (!R.eyes) return normal(); for (const ex of [x, W - x - w]) rigEye(h, R, ex, y, () => {}, w); }
// A mouth: the usual one, or open (w wide, 2 tall) or roaring (w + 2 wide, 3 tall) with a tongue, at x, y.
function rigMouth(h, R, x, y, w, normal = () => {}) {
  if (R.mouth === 'roar') { h.rect(x - 1, y, w + 2, 3, OUTLINE); h.rect(x, y + 2, w, 1, '#e8607a'); }
  else if (R.mouth === 'open') { h.rect(x, y, w, 2, OUTLINE); if (w > 2) h.rect(x + 1, y + 1, w - 2, 1, '#e8607a'); }
  else normal();
}
function rigEye(h, R, x, y, normal, w = 2) {
  if (R.eyes === 'blink' || R.eyes === 'sleep') { h.rect(x, y + 1, w, 1, OUTLINE); if (R.eyes === 'sleep') { h.px(x - 1, y, OUTLINE); h.px(x + w, y, OUTLINE); } }
  else if (R.eyes === 'hurt') { h.px(x, y, OUTLINE); h.px(x + 1, y + 1, OUTLINE); h.px(x, y + 2, OUTLINE); }
  else if (R.eyes === 'faint') { h.px(x - 1, y, OUTLINE); h.px(x + 1, y, OUTLINE); h.px(x, y + 1, OUTLINE); h.px(x - 1, y + 2, OUTLINE); h.px(x + 1, y + 2, OUTLINE); }
  else normal();
}

// Flying monsters: how high they hover and how fast they flap (beats a second; 0 = they just
// float). drawMon lifts them off their shadow and swaps in the flap frame (SPRITES[id].flap).
// Monsters whose art is rigged (draws its parts through part() and reads rig()), and their body type (RIG_FRAMES).
const RIGGED = {};   // filled in by each monster's file in js/monsters/
const FLYERS = { galewing: { hover: 8, flap: 4 }, pixibelle: { hover: 7, flap: 6 }, drakorn: { hover: 6, flap: 3 }, wispurr: { hover: 6, flap: 0 } };

const MONSTER_ART = {};        // each monster's front / side / back art, from its file in js/monsters/

// Diagonal views, facing right like 'side' (flipped by face for left):
// 'fside' = three-quarter front (heading down-right), 'bside' = three-quarter back
// (heading up-right). A monster without an entry here turns in 4 directions only.
const MONSTER_ART_DIAG = {};   // its fside / bside art, from the same file

// Monsters are drawn when they're first needed, not all at start-up (with every pose of
// every monster that took seconds, and grows with each new monster). SPRITES[id] still works
// everywhere: the first look draws that monster on the spot. warmSprites(ids) draws monsters
// that will be needed soon a little at a time in the background (a floor's monsters while you
// walk to the first fight), so play doesn't stutter.
const SPRITE_STORE = {}, _building = {};
const _monDef = id => ALL_MONS().find(m => m.id === id);
function _finishSprite(id) {
  const def = _monDef(id);
  if (!def || !MONSTER_ART[id]) return undefined;
  const gen = _building[id] || spriteSteps(def);
  let r;
  while (!(r = gen.next()).done);
  delete _building[id];
  return (SPRITE_STORE[id] = r.value);
}
const SPRITES = new Proxy(SPRITE_STORE, {
  get: (t, id) => typeof id !== 'string' ? undefined : t[id] || (MONSTER_ART[id] ? _finishSprite(id) : undefined),
  has: (t, id) => !!(t[id] || (typeof id === 'string' && MONSTER_ART[id] && _monDef(id))),
  ownKeys: () => ALL_MONS().filter(m => MONSTER_ART[m.id]).map(m => m.id),
  getOwnPropertyDescriptor: (t, id) => (MONSTER_ART[id] && _monDef(id) ? { value: SPRITES[id], writable: true, enumerable: true, configurable: true } : undefined),
});
const _warm = [];
let _warmT = 0;
function warmSprites(ids) {
  for (const id of ids) if (id && !SPRITE_STORE[id] && !_warm.includes(id) && MONSTER_ART[id] && _monDef(id)) _warm.push(id);
  if (_warm.length && !_warmT) _warmT = setTimeout(_warmTick, 0);
}
function _warmTick() {   // about 4 ms of drawing at a time, between the game's frames
  _warmT = 0;
  const t0 = performance.now();
  while (_warm.length && performance.now() - t0 < 4) {
    const id = _warm[0];
    if (SPRITE_STORE[id]) { _warm.shift(); continue; }
    const gen = _building[id] || (_building[id] = spriteSteps(_monDef(id)));
    const r = gen.next();
    if (r.done) { SPRITE_STORE[id] = r.value; delete _building[id]; _warm.shift(); }
  }
  if (_warm.length) _warmT = setTimeout(_warmTick, 16);
}
// Let monsters' pictures go (Deep Archive, on a new floor: everyone not in the party or on the
// floor). Their canvases are freed now; SPRITES[id] draws them again if they're needed later.
function forgetSprites(keep) {
  const views = vs => { if (!vs) return; for (const k of Object.keys(vs)) freeCanvas(vs[k]); views(vs.flapped); };
  for (const id of Object.keys(SPRITE_STORE)) {
    if (keep.has(id)) continue;
    const sp = SPRITE_STORE[id];
    views(sp.views); views(sp.flap);
    for (const f of Object.values(sp.frames || {})) [].concat(f).forEach(views);
    delete SPRITE_STORE[id];
  }
}
// Kept for the pages that call it: monsters now draw themselves on first use.
function buildSprites() {}

// front (img), side (facing right), back, and the diagonals (fside, bside) for monsters that have them (sp.diag).
const VIEWS = ['front', 'side', 'back'];
// A set of views remembers its wings-down twin (hidden, so it isn't listed as a view).
const flapped = (views, twin) => Object.defineProperty(views, 'flapped', { value: twin });
// One monster's sprite set: its views, flap frame and animation frames.
function buildMonSprites(mon) {
  const gen = spriteSteps(mon);
  let r;
  while (!(r = gen.next()).done);
  return r.value;
}
// The same, one set of views per step (so warmSprites can spread the work out). The rig pose
// and flap are set and cleared inside each step, so nothing leaks between steps.
function* spriteSteps(mon) {
  const size = mon.size === 'L' ? 44 : 32;
  const diag = !!MONSTER_ART_DIAG[mon.id];
  const draw = (pose = null, flap = 0) => {
    RIG = pose && { ...REST, ...pose }; FLAP = flap;
    const out = {};
    for (const v of diag ? [...VIEWS, 'fside', 'bside'] : VIEWS) {
      const g = new PixGrid(size, size);
      (v === 'fside' || v === 'bside' ? MONSTER_ART_DIAG : MONSTER_ART)[mon.id](g, v);
      g.outline();
      out[v] = g.toCanvas();
    }
    RIG = null; FLAP = 0;
    return out;
  };
  const views = draw(), fly = FLYERS[mon.id] || null;
  yield;
  let flap = null;
  if (fly && fly.flap) { flap = draw(null, 1); yield; }   // the wings-down frame
  let frames = null;
  if (RIGGED[mon.id]) {   // its animation frames, each a full set of views
    const poses = { ...RIG_COMMON, ...RIG_FRAMES[RIGGED[mon.id]] };
    frames = {};
    for (const [k, f] of Object.entries(poses)) {
      if (Array.isArray(f)) { frames[k] = []; for (const ff of f) { frames[k].push(draw(ff)); yield; } }
      else { frames[k] = draw(f); yield; }
    }
    for (const v of Object.keys(frames.faint)) frames.faint[v] = lying(frames.faint[v]);   // laid on its side
    if (fly && fly.flap) {   // a flier's frames, wings down (drawMon swaps them in as it flaps)
      for (const [k, f] of Object.entries(poses)) {
        if (k === 'faint') continue;
        if (Array.isArray(f)) { for (let i = 0; i < f.length; i++) { flapped(frames[k][i], draw(f[i], 1)); yield; } }
        else { flapped(frames[k], draw(f, 1)); yield; }
      }
    }
  }
  if (flap) flapped(views, flap);
  return { img: views.front, views, size, diag, fly, flap, frames };
}

// Which view to show when heading along (dx, dy); null if not moving. With diagonal art
// it picks from 8 directions (front, fside, side, bside, back, mirrored by face), else 4.
// Each view holds on a little past its sector so it doesn't flicker at the edges.
const VIEW_ANGLE = { front: 0, fside: 45, side: 90, bside: 135, back: 180 };
function viewFor(dx, dy, cur, diag) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 0.001 && ay < 0.001) return null;
  if (!diag) {
    const k = cur === 'side' ? 1.6 : 0.8;
    return ay > ax * k ? (dy < 0 ? 'back' : 'front') : 'side';
  }
  const deg = Math.atan2(ax, dy) * 180 / Math.PI;   // 0 = heading down, 180 = heading up
  if (cur in VIEW_ANGLE && Math.abs(deg - VIEW_ANGLE[cur]) < 30) return cur;
  return ['front', 'fside', 'side', 'bside', 'back'][Math.round(deg / 45)];
}
const isSideView = v => v === 'side' || v === 'fside' || v === 'bside';

// Draw a monster into an arbitrary canvas, scaled to fit with integer pixels where possible.
function drawPortrait(canvas, monId, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sp = SPRITES[monId];
  const s = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / sp.size * (opts.zoom || 1)));
  const w = sp.size * s;
  const x = Math.round((canvas.width - w) / 2);
  const y = opts.crop ? Math.round(canvas.height * 0.08) : Math.round((canvas.height - w) / 2);
  if (opts.fainted) ctx.filter = 'grayscale(1) brightness(.6)';
  ctx.drawImage(sp.img, x, y, w, w);
  ctx.filter = 'none';
}

// ---------- animation poses (shared by both games' drawMon) ----------
// Pixel-true poses: a sprite bent at its own resolution, so whole rows and columns move and
// pixels stay square and crisp. sq > 0 squashes: sq rows come out of the body (55-85% of the
// height, below the eyes) and the body gets wider (the middle column repeated). sq < 0
// stretches: those rows are doubled instead. sh leans it: the top row shifts sh pixels
// forward (sprite space faces right), less further down. Anchored bottom-centre; cached.
const _poses = new WeakMap();
function posed(src, sq = 0, sh = 0) {
  if (!sq && !sh) return src;
  let cache = _poses.get(src);
  if (!cache) _poses.set(src, cache = {});
  const key = sq + ',' + sh;
  if (cache[key]) return cache[key];
  const w = src.width, h = src.height, b0 = Math.round(h * 0.55), b1 = Math.round(h * 0.85), L = b1 - b0;
  const k = Math.abs(sq), marks = new Set();
  for (let i = 0; i < k; i++) marks.add(b0 + Math.min(L - 1, Math.floor((i + 0.5) * L / k)));
  const rows = [];   // the source row for each output row, top to bottom
  for (let y = 0; y < h; y++) {
    if (sq > 0 && marks.has(y)) continue;
    rows.push(y);
    if (sq < 0 && marks.has(y)) rows.push(y);
  }
  const dw = sq > 0 ? Math.ceil(sq / 2) : 0, pad = Math.abs(sh), H = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w + 2 * dw + 2 * pad; cv.height = H;
  const c = cv.getContext('2d'), cx = w >> 1;
  rows.forEach((r, y) => {
    const off = pad + Math.round(sh * (H - 1 - y) / Math.max(1, H - 1));
    if (dw && r >= b0) {   // the body widens: the middle column is repeated
      c.drawImage(src, 0, r, cx, 1, off, y, cx, 1);
      for (let i = 0; i <= 2 * dw; i++) c.drawImage(src, cx, r, 1, 1, off + cx + i, y, 1, 1);
      c.drawImage(src, cx + 1, r, w - cx - 1, 1, off + cx + 2 * dw + 1, y, w - cx - 1, 1);
    } else c.drawImage(src, 0, r, w, 1, off + dw, y, w, 1);
  });
  return (cache[key] = cv);
}
// A canvas filled with one colour where it isn't transparent (hit flash, status tints), cached.
const _tints = new WeakMap();
function tintOf(src, color) {
  let cache = _tints.get(src);
  if (!cache) _tints.set(src, cache = {});
  if (cache[color]) return cache[color];
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
  return (cache[color] = cv);
}
// What a monster looks like right now: { views } (a rigged monster's animation frame, or its
// plain views), plus { sq, sh } for posed() and dy = extra lift (world units). Rigged monsters
// animate with real frames (walk cycle, idle with a tail wag, blinks, wind-up, attack, hurt);
// the rest just hop when walking and dip or rise a pixel when attacking. Walking means really
// covering ground (a monster the game has paused keeps its speed but mustn't keep stepping), and
// idle, blinks and the walk's hold run on the real clock, so nothing freezes mid-pose.
// Moments monAnim reacts to are time stamps on the real clock, not countdowns, so they can't get
// stuck when some part of the game stops updating a monster: animMark(m, 'hurt') on a real hit,
// animMark(m, 'pop') when it's sent out.
let ANIM_CLOCK = null;   // a page can run its own clock instead (anim.html: slow motion, pause)
const animClock = () => (ANIM_CLOCK ? ANIM_CLOCK() : performance.now() / 1000);
function animMark(m, what) { m[what + 'At'] = animClock(); }
const animSince = (m, what) => animClock() - (m[what + 'At'] ?? -99);
// The sprite set to draw a monster with: its own, or (Deep Archive) one with its relic gear on (js/gear.js).
function monSprite(m) {
  if (m.gear && m.gear.length && typeof gearSprites === 'function') return gearSprites(m.id, m.gear);
  return SPRITES[m.id];
}
function monAnim(m, phase, flying) {
  const sp = monSprite(m), F = sp.frames, a = m.action, clock = animClock();
  const side = m.view === 'side' || m.view === 'fside' || m.view === 'bside';
  const out = (views, sq = 0, sh = 0, dy = 0) => ({ views: views || sp.views, sq, sh, dy });
  if (m.walkT !== m._walkT) { m._walkT = m.walkT; m.walkSeen = clock; }
  const walking = m.walkSeen !== undefined && clock - m.walkSeen < 0.15;
  if (m.fainted) {
    if (F) return out(m.fadeT < 0.15 ? F.hurt : F.faint);   // flinch, then topple onto its side
    const k = Math.min(1, m.fadeT / 0.5);
    return out(null, Math.round(2 * k), side ? -Math.round(2 * k) : 0);
  }
  const pop = animSince(m, 'pop');
  if (pop < 0.3) return out(F && F.windup, F ? 0 : pop < 0.12 ? -1 : 1, 0, pop < 0.12 ? 2 : 0);   // sent out: up, then landing
  if (animSince(m, 'hurt') < 0.2) return F ? out(F.hurt) : out(null, 1, side ? -1 : 0);
  const healPose = () => {   // Blanket Nap sleeps, Snack Time chews, sunny and wishful heals look proud
    const k = m.healPose || (a && a.mv && HEAL_POSE[a.mv.id] ? HEAL_POSE[a.mv.id][0] : 'proud');
    return out(k === 'chew' ? F.chew[Math.floor(clock * 7) % 2] : F[k]);
  };
  if (a) {
    if (F) {   // a pose for the kind of move
      if (a.kind === 'dash') return out(F.run[Math.floor(clock * 12) % 2]);
      if (a.kind === 'beam') return out(a.phase === 'charge' ? F.windup : F.roar);
      if (a.kind === 'vortex') return out(F.roar);
      if (a.kind === 'burst') return out(a.done ? F.attack : F.windup);
      if (a.pose === 'proud') return out(F.proud);
      if (a.pose === 'heal') return healPose();
      return out(a.t < a.dur * 0.45 ? F.windup : F.throw);
    }
    const wind = a.kind === 'cast' ? a.t < a.dur * 0.45 : a.kind === 'burst' ? !a.done : a.kind === 'beam' ? a.phase === 'charge' : false;
    return out(null, wind ? 1 : 0, 0, wind ? 0 : 1);
  }
  if (walking) {
    if (F) return out(F.walk[Math.floor(m.walkT / 9) % 4]);   // a frame every 9 world units walked
    if (flying) return out(null);
    const f = Math.floor((m.walkT / 30 % 1) * 3);
    return out(null, 0, 0, f === 1 ? 2 : f === 2 ? 1 : 0);    // a simple 3-frame hop
  }
  if (F) {
    if (animSince(m, 'heal') < (m.healDur || 0)) return healPose();
    if ((clock + phase) % 3.7 < 0.14) return out(F.blink);
    if ((clock + phase * 1.7) % 5.3 < 0.22) return out(F.flick);   // an ear twitch now and then
    return out(F.idle[Math.floor(clock * 2.5 + phase) % 4]);
  }
  return out(null);
}
// A heal starts its pose (HEAL_POSE), which outlasts the move itself (Blanket Nap's blanket).
function animHeal(m, mv) {
  const hp = HEAL_POSE[mv.id] || ['proud', 0.45];
  m.healPose = hp[0]; m.healDur = hp[1]; animMark(m, 'heal');
}
