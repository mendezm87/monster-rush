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
const RIGGED = { smugshi: 'quad', brawlix: 'biped', wispurr: 'floater', sparkit: 'biped', cinderox: 'quad', tidalisk: 'slither', thornback: 'quad', slumbear: 'biped', frostling: 'quad', boulderon: 'biped', mindra: 'biped', shadefang: 'quad', lumawool: 'quad', drakorn: 'flier', galewing: 'flier', pixibelle: 'flier', venomire: 'slither', scarablade: 'biped', gearhulk: 'biped', mondaze: 'biped', smugshogun: 'quad', infernox: 'quad', maelstrisk: 'slither', voltergeist: 'floater', coilizard: 'quad', bellpaca: 'quad', smouldox: 'quad', garrishell: 'biped' };
const FLYERS = { galewing: { hover: 8, flap: 4 }, pixibelle: { hover: 7, flap: 6 }, drakorn: { hover: 6, flap: 3 }, wispurr: { hover: 6, flap: 0 } };

const MONSTER_ART = {
  // ---- evolved starters (44px, their own designs) ----

  // Toshi all grown up: the same red Shiba with the cream mask, white socks, eyebrow
  // spots and smug half-shut eyes, now with a ruff, a samurai headband and a red cape.
  smugshogun(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v), side = v === 'side';
    const tails = part(g, (side ? Q.head[0] : 0) + Q.tail[0], Q.head[1] + Q.tail[1]);   // the headband's tails trail behind (the cape swings with the tail, t)
    if (side) {
      t.ellipse(8, 22, 6, 6, O, { edge: true });                                                // curled tail
      t.ellipse(7.5, 21.5, 3, 3, C); t.px(7, 21, O.s);
      t.poly([[15, 22], [27, 22], [24, 40], [3, 38]], R, { edge: true });                       // cape streaming back
      t.rect(4, 37, 20, 1, Gd);
      legB.ellipse(13, 40, 3, 2, C, { edge: true });
      b.ellipse(19, 31, 11, 8, O, { edge: true });                                              // body
      b.ellipse(27, 33, 4.5, 6, C);                                                             // cream chest
      legA.ellipse(26, 40, 3, 2, C, { edge: true });
      b.ellipse(26, 24, 6, 4, C, { edge: true });                                               // neck ruff
      earB.poly([[20, 11], [19, 2], [24, 8]], O);                                               // far ear
      h.ellipse(27, 16, 9.5, 8, O, { edge: true });                                             // head
      earA.poly([[25, 10], [28, 0], [31, 9]], O, { edge: true });                               // near ear
      earA.poly([[27, 8.5], [28, 3], [30, 8]], C.b);
      h.ellipse(35, 20, 5.5, 3.6, C);                                                           // muzzle
      h.ellipse(29, 20, 3, 2, C);
      h.rect(18, 9, 17, 2, Wb.b); h.rect(18, 10, 17, 1, Wb.s);                                   // headband
      tails.poly([[19, 9], [9, 6], [11, 13]], Wb, { edge: true });                               // its tails, flying back
      h.ellipse(32, 10, 1.5, 1.1, '#c8303a');
      h.px(29, 12, C.b); h.px(30, 12, C.b);                                                     // eyebrow spot
      rigEye(h, Q, 29, 14, () => { h.rect(29, 14, 5, 1, OUTLINE); h.rect(30, 15, 3, 1, DARK_EYE); }, 5);   // smug lid
      h.rect(39, 18, 3, 2, OUTLINE);                                                            // nose
      rigMouth(h, Q, 35, 22, 4, () => h.px(35, 23, OUTLINE).px(36, 23, OUTLINE).px(37, 23, OUTLINE).px(38, 22, OUTLINE));   // smirk
      return;
    }
    if (v === 'back') {
      legA.ellipse(15, 40, 3.5, 2.2, C, { edge: true }); legB.ellipse(29, 40, 3.5, 2.2, C, { edge: true });
      b.ellipse(22, 31, 10, 8.5, O, { edge: true });
      t.poly([[12, 23], [32, 23], [36, 40], [8, 40]], R, { edge: true });                       // the cape
      t.rect(9, 39, 26, 1, Gd);
      b.ellipse(12, 23, 3, 2, C); b.ellipse(32, 23, 3, 2, C);                                   // ruff peeking out
      earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
      h.ellipse(22, 15, 11, 8.5, O, { edge: true });
      h.rect(11, 9, 22, 2, Wb.b); h.rect(11, 10, 22, 1, Wb.s);
      h.rect(20, 9, 4, 3, Wb.l);                                                                // headband knot
      tails.poly([[21, 11], [17, 21], [20, 20]], Wb, { edge: true }); tails.poly([[23, 11], [27, 21], [24, 20]], Wb, { edge: true });
      t.ellipse(22, 30, 6, 5.5, O, { edge: true });                                             // the famous curled tail
      t.ellipse(22, 29.5, 3.2, 2.8, C); t.px(22, 29, O.s); t.px(23, 29, O.s);
      return;
    }
    t.ellipse(36, 25, 6.5, 6.5, O, { edge: true });                                             // tail
    t.ellipse(36.5, 24.5, 3.5, 3.5, C); t.px(36, 24, O.s);
    t.poly([[11, 23], [33, 23], [38, 40], [6, 40]], R, { edge: true });                         // cape behind
    t.rect(6, 39, 4, 1, Gd); t.rect(34, 39, 4, 1, Gd);
    legA.ellipse(15, 40, 3.5, 2.2, C, { edge: true }); legB.ellipse(29, 40, 3.5, 2.2, C, { edge: true });   // white socks
    b.ellipse(22, 31, 10, 8.5, O, { edge: true });
    b.ellipse(22, 33, 6, 6.5, C);                                                               // cream chest
    b.ellipse(22, 24, 10, 4, C, { edge: true });                                                // neck ruff
    b.ellipse(22, 24.5, 2, 2, Gd); b.px(22, 24, '#a87a1a');                                     // gold clasp
    earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
    earA.poly([[13.5, 10], [12.5, 4], [17, 8]], C.b); earB.poly([[30.5, 10], [31.5, 4], [27, 8]], C.b);
    h.ellipse(22, 15, 11, 8.5, O, { edge: true });
    h.ellipse(22, 19.5, 7, 4.5, C);                                                             // muzzle
    h.ellipseM(13, 18, 2.2, 1.8, C);
    h.rect(11, 9, 22, 2, Wb.b); h.rect(11, 10, 22, 1, Wb.s);                                     // headband
    h.ellipse(22, 9.5, 1.8, 1.4, '#c8303a');
    tails.poly([[32, 9], [41, 5], [40, 12]], Wb, { edge: true });
    h.pxM(15, 12, C.b); h.pxM(16, 12, C.b);                                                     // eyebrow spots
    rigEyes(h, Q, 44, 14, 14, 5, () => { h.rectM(14, 14, 5, 1, OUTLINE); h.rectM(15, 15, 3, 1, DARK_EYE); });   // smug lids
    h.rect(21, 17, 3, 2, OUTLINE);                                                              // nose
    rigMouth(h, Q, 20, 21, 4, () => h.px(20, 22, OUTLINE).px(21, 22, OUTLINE).px(22, 22, OUTLINE).px(23, 21, OUTLINE));   // smirk
  },

  // Cinderox grown into a magma bull: a blazing mane, curved horns, lava-cracked rock
  // armour on the shoulders and a gold nose ring.
  infernox(g, v = 'front') {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) { b.px(x, y, L); b.px(x + 1, y + 1, Gl); } };
    if (v === 'side') {
      t.poly([[7, 30], [1, 25], [3, 32]], B); t.ellipse(2, 24, 2, 2.4, F);                       // tail, flame tip
      legA.ellipse(12, 39, 3.5, 3, Rk, { edge: true }); legB.ellipse(25, 39, 3.5, 3, Rk, { edge: true });
      h.poly([[7, 26], [9, 11], [14, 22]], F); h.poly([[12, 21], [16, 5], [20, 18]], F); h.poly([[18, 17], [23, 3], [26, 16]], F);
      h.poly([[11, 22], [16, 12], [22, 15], [17, 24]], Gl);
      b.ellipse(19, 30, 14, 8.5, B, { edge: true });                                            // body
      b.ellipse(22, 34, 9, 4, C);
      legB.ellipse(15, 40, 3.5, 3, Rk, { edge: true }); legA.ellipse(29, 40, 3.5, 3, Rk, { edge: true });
      legB.px(14, 42, L); legA.px(29, 42, L);                                                   // glowing hooves
      cracks([[10, 28], [15, 25], [20, 29]]);
      b.ellipse(27, 25, 6, 5, Rk, { edge: true }); cracks([[25, 24], [28, 26]]);                // shoulder armour
      h.poly([[28, 14], [32, 6], [33, 13]], P('#b8a68a', '#8a7a62', '#d8ccb0'));                 // far horn
      h.ellipse(32, 19, 8, 7, B, { edge: true });                                               // head
      h.poly([[30, 15], [38, 5], [41, 7], [35, 16]], H, { edge: true });                        // horn
      h.ellipse(38, 22, 4.5, 3.2, C);                                                           // muzzle
      h.px(41, 21, OUTLINE);
      rigMouth(h, Q, 37, 23, 3);
      h.ellipse(40, 25, 1.6, 1.3, '#ffd23f');                                                   // nose ring
      h.rect(33, 16, 5, 1, OUTLINE);
      rigEye(h, Q, 34, 17, () => { h.rect(34, 17, 3, 2, Gl); h.px(36, 17, '#ffffff'); }, 3);     // glowing eye
      return;
    }
    if (v === 'back') {
      legA.ellipse(13, 39, 4, 3, Rk, { edge: true }); legB.ellipse(31, 39, 4, 3, Rk, { edge: true });
      b.ellipse(22, 30, 13, 9, B, { edge: true });
      cracks([[14, 30], [28, 28], [18, 34], [26, 34]]);
      b.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[8, 24], [35, 25]]);
      h.ellipse(22, 18, 9, 7.5, B, { edge: true });
      h.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });       // horns
      h.poly([[8, 20], [10, 4], [16, 14]], F); h.poly([[14, 13], [18, 1], [22, 11]], F);        // blazing mane
      h.poly([[22, 11], [26, 1], [30, 13]], F); h.poly([[28, 14], [34, 4], [36, 20]], F);
      h.poly([[15, 13], [22, 6], [29, 13], [22, 17]], Gl);
      b.poly([[18, 34], [22, 21], [26, 34]], F); b.poly([[20, 32], [22, 25], [24, 32]], Gl);    // flames down the spine
      t.rect(21, 37, 2, 4, '#16224a'); t.ellipse(22, 41, 1.8, 1.8, F);                          // tail
      return;
    }
    h.poly([[8, 20], [10, 4], [16, 14]], F); h.poly([[14, 13], [18, 1], [22, 11]], F);          // blazing mane
    h.poly([[22, 11], [26, 1], [30, 13]], F); h.poly([[28, 14], [34, 4], [36, 20]], F);
    h.poly([[15, 12], [22, 5], [29, 12], [22, 16]], Gl);
    legA.ellipse(13, 39, 4, 3, Rk, { edge: true }); legB.ellipse(31, 39, 4, 3, Rk, { edge: true });   // hooves
    legA.px(12, 41, L).px(14, 41, L); legB.px(31, 41, L).px(29, 41, L);
    b.ellipse(22, 30, 13, 9, B, { edge: true });                                                // body
    b.ellipse(22, 33, 8, 5.5, C);                                                               // belly
    cracks([[11, 32], [31, 31], [13, 35]]);
    b.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[7, 24], [35, 24], [9, 27]]);          // shoulder armour
    h.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });         // horns
    h.ellipse(22, 18, 10, 8, B, { edge: true });                                                // head
    h.ellipse(22, 23, 7, 3.5, C, { edge: true });                                               // broad muzzle
    h.rect(19, 23, 2, 1, OUTLINE); h.rect(24, 23, 2, 1, OUTLINE);                               // nostrils
    rigMouth(h, Q, 20, 25, 4);
    h.ellipse(22, 27, 2.2, 1.4, '#ffd23f'); h.px(22, 26, '#a87a1a');                            // nose ring
    h.rectM(14, 15, 6, 1, OUTLINE);                                                             // heavy brows
    rigEyes(h, Q, 44, 15, 16, 4, () => { h.rectM(15, 16, 4, 2, Gl); h.rectM(17, 16, 2, 2, '#ffffff'); });   // glowing eyes
  },

  // Tidalisk grown into a sea dragon: a coiled body, teal fin-wings, gold horns,
  // long whiskers and a belly of cream scales.
  maelstrisk(g, v = 'front') {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                  // tail fin
      g.ellipse(20, 37, 18, 6, B, { edge: true });                                              // coil
      for (const x of [10, 16, 22, 28]) g.rect(x, 39, 3, 1, '#1a3a8a');
      b.poly([[19, 18], [13, 25], [19, 33]], Fn, { edge: true });                               // dorsal fin
      b.ellipse(24, 27, 6.5, 10, B, { edge: true });                                            // neck
      b.ellipse(28, 29, 3, 8, C);
      for (const y of [24, 28, 32]) b.rect(27, y, 3, 1, '#cdbb88');
      h.poly([[22, 8], [20, 0], [27, 6]], Fn);                                                  // crest
      h.ellipse(28, 13, 8.5, 6.5, B, { edge: true });                                           // head
      earA.poly([[27, 8], [31, 0], [32, 7]], H, { edge: true });                                // horn
      h.ellipse(35, 16, 5, 3, C);                                                               // snout
      h.poly([[35, 18], [43, 23], [42, 24], [34, 19]], Wh);                                     // whisker
      rigEye(h, Q, 30, 11, () => { h.rect(30, 11, 2, 3, DARK_EYE); h.px(30, 11, '#ffffff'); });
      h.px(29, 9, OUTLINE); h.px(30, 9, OUTLINE); h.px(31, 10, OUTLINE);
      rigMouth(h, Q, 36, 17, 3, () => h.px(39, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      t.poly([[38, 36], [43, 29], [43, 43]], Fn, { edge: true });
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      b.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                       // fin-wings
      b.ellipse(22, 27, 7.5, 10, B, { edge: true });
      h.ellipse(22, 13, 9, 7, B, { edge: true });
      h.polyM([[16, 16], [7, 20], [8, 21], [17, 17]], Wh);                                      // whiskers from behind
      earA.poly([[15, 8], [10, 0], [17, 5]], H, { edge: true }); earB.poly([[29, 8], [34, 0], [27, 5]], H, { edge: true });
      h.poly([[19, 7], [22, 0], [25, 7]], Fn);
      for (const y of [19, 24, 29, 34]) b.poly([[20, y], [22, y - 4], [24, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(22, 37, 18, 6, B, { edge: true });                                                // coil
    for (const x of [8, 14, 27, 33]) g.rect(x, 39, 3, 1, '#1a3a8a');
    b.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                         // fin-wings
    b.ellipse(22, 27, 7.5, 10, B, { edge: true });                                              // neck
    b.ellipse(22, 29, 4, 8, C);                                                                 // belly scales
    for (const y of [23, 26, 29, 32, 35]) b.rect(19, y, 6, 1, '#cdbb88');
    h.poly([[19, 7], [22, 0], [25, 7]], Fn);                                                    // crest
    earA.poly([[15, 8], [10, 0], [17, 5]], H, { edge: true }); earB.poly([[29, 8], [34, 0], [27, 5]], H, { edge: true });   // gold horns
    h.ellipse(22, 13, 9, 7, B, { edge: true });                                                 // head
    h.ellipse(22, 17, 5.5, 3.5, C);                                                             // snout
    h.polyM([[17, 17], [8, 21], [9, 22], [18, 18]], Wh);                                        // whiskers
    rigEyes(h, Q, 44, 16, 11, 2, () => h.eyes(16, 11, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 20, 17, 4, () => { h.px(20, 17, OUTLINE); h.px(23, 17, OUTLINE); });
  },

  // Sparkit, redrawn (r48) from the owner's pick: a scrappy teal ferret ("kit" = a baby ferret) in a
  // fighting stance, fists up, cream belly, a dark bandit mask over sharp violet eyes, a scar, a spiky
  // white static crest, and a long tail rising to a crackling copper plug.
  sparkit(g, v = 'front') {
    const T = P('#3fb8a8', '#25857a', '#7ae0d0'), C = P('#f4ecd6', '#d6c8a4', '#ffffff'), W = P('#f4fbff', '#b8d0d4', '#ffffff');
    const Cu = P('#e08a3a', '#a85a1e', '#ffc07a'), MASK = '#1e4a46', EYE = '#c8b0ff', SCAR = '#f0d0c8', PINK = '#f0a0a8';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const plug = (x, y) => { t.rect(x, y, 5, 4, Cu.b); t.rect(x, y + 3, 5, 1, Cu.s); t.rect(x, y - 3, 1, 3, '#ffd08a'); t.rect(x + 3, y - 3, 1, 3, '#ffd08a'); t.px(x + 1, y - 4, '#bff6ff'); t.px(x + 4, y - 5, '#bff6ff'); };
    if (v === 'side') {
      t.ellipse(8, 23, 2, 2, T, { edge: true }); t.ellipse(6.5, 19, 1.8, 2.4, T, { edge: true }); t.ellipse(6, 14.5, 1.6, 2.2, T, { edge: true });   // tail curving up behind
      plug(4, 9);
      legB.ellipse(13, 27.5, 2.2, 2.6, T.s); legB.ellipse(13.5, 30, 2.4, 1.2, T.s);
      b.ellipse(15, 21, 5, 6.5, T, { edge: true });
      b.ellipse(17.5, 22, 2.4, 4.6, C);                                                          // cream belly
      legA.ellipse(17, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(18, 30, 2.6, 1.2, T, { edge: true });
      armB.ellipse(19, 16.5, 1.7, 1.9, T.s);
      earA.ellipse(14.5, 7, 1.8, 2, T, { edge: true }); earA.px(14, 7, PINK);
      h.ellipse(18, 11, 5.5, 4.5, T, { edge: true });
      h.ellipse(23, 12.5, 3, 2, T, { edge: true }); h.ellipse(23.5, 13.5, 2.3, 1.2, C);          // long snout
      h.poly([[17, 9], [25, 10], [25, 12], [17, 12]], MASK);                                       // bandit mask
      h.poly([[12, 8], [12, 2], [14, 5], [15, 0], [17, 5], [19, 2], [20, 8]], W, { edge: true }); // spiky static crest
      rigEye(h, Q, 20, 10, () => { h.rect(20, 10, 2, 2, EYE); h.px(21, 11, DARK_EYE); h.px(20, 10, '#ffffff'); });
      h.px(19, 9, OUTLINE).px(20, 9, OUTLINE).px(21, 9, OUTLINE);                                 // fierce brow
      h.rect(26, 12, 1, 1, OUTLINE);                                                             // nose
      rigMouth(h, Q, 22, 14, 2, () => h.px(23, 14, OUTLINE).px(24, 14, OUTLINE));
      armA.ellipse(21, 17.5, 2, 2.2, T, { edge: true });                                         // fist up
      return;
    }
    if (v === 'back') {
      legA.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legB.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
      legA.ellipse(12.5, 30, 2.4, 1.2, T.s); legB.ellipse(19.5, 30, 2.4, 1.2, T.s);
      b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });
      armA.ellipse(10.5, 18.5, 2, 2.2, T, { edge: true }); armB.ellipse(21.5, 18.5, 2, 2.2, T, { edge: true });
      earA.ellipse(10.5, 6.5, 2, 2, T, { edge: true }); earB.ellipse(21.5, 6.5, 2, 2, T, { edge: true });
      h.ellipse(16, 11, 6.5, 5, T, { edge: true });
      h.poly([[10, 8], [11, 1], [13, 5], [16, 0], [19, 5], [21, 1], [22, 8]], W, { edge: true });
      t.ellipse(12, 25, 2, 2, T, { edge: true }); t.ellipse(8.5, 22.5, 2, 2.2, T, { edge: true }); t.ellipse(6.5, 18.5, 1.8, 2.2, T, { edge: true }); t.ellipse(6, 14.5, 1.6, 2, T, { edge: true });   // tail curling up to one side
      plug(3, 8);
      return;
    }
    t.ellipse(21, 25, 2, 2, T, { edge: true }); t.ellipse(24, 22, 2, 2.2, T, { edge: true }); t.ellipse(25.5, 18, 1.8, 2.2, T, { edge: true }); t.ellipse(26, 14, 1.6, 2, T, { edge: true });   // tail behind
    plug(23, 8);                                                                                 // the crackling plug
    legA.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legB.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
    legA.ellipse(12, 30, 2.6, 1.2, T, { edge: true }); legB.ellipse(20, 30, 2.6, 1.2, T, { edge: true });   // feet
    b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });                                              // body
    b.ellipse(16, 22.5, 3.4, 5, C);                                                              // cream belly
    armA.ellipse(11, 18.5, 2, 2.2, T, { edge: true }); armB.ellipse(21, 18.5, 2, 2.2, T, { edge: true });   // fists up
    earA.ellipse(10.5, 6.5, 2, 2, T, { edge: true }); earB.ellipse(21.5, 6.5, 2, 2, T, { edge: true });
    earA.px(10, 6, PINK); earB.px(21, 6, PINK);
    h.ellipse(16, 11, 6.5, 5, T, { edge: true });                                                // head
    h.ellipse(16, 14, 2.8, 1.8, C);                                                              // muzzle
    h.polyM([[9, 9], [15, 10], [15, 13], [10, 13]], MASK);                                       // bandit mask
    h.poly([[10, 8], [11, 1], [13, 5], [16, 0], [19, 5], [21, 1], [22, 8]], W, { edge: true });  // spiky static crest
    rigEyes(h, Q, 32, 12, 10, 2, () => { h.rectM(12, 10, 2, 2, EYE); h.pxM(13, 11, DARK_EYE); h.pxM(12, 10, '#ffffff'); });
    h.pxM(11, 9, OUTLINE).pxM(12, 9, OUTLINE).pxM(13, 10, OUTLINE);                              // fierce brows
    h.px(19, 9, SCAR).px(20, 10, SCAR).px(19, 11, SCAR);                                         // scar
    h.px(15, 13, OUTLINE).px(16, 13, OUTLINE);                                                   // nose
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
  },

  cinderox(g, v = 'front') {
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[7, 20], [1, 17], [7, 24]], F);
      h.poly([[12, 14], [13, 3], [17, 11]], F); h.poly([[16, 11], [19, 0], [22, 11]], F); h.poly([[21, 12], [25, 3], [25, 15]], F);
      h.poly([[15, 8], [19, 3], [23, 8], [19, 11]], '#ffd34a');
      b.ellipse(14, 21, 10, 7, B, { edge: true });
      b.ellipse(16, 24.5, 6, 4, C);
      legB.ellipse(9, 28, 3, 2, C, { edge: true }); legA.ellipse(19, 28, 3, 2, C, { edge: true });
      h.ellipse(20, 14, 7, 6, B, { edge: true });
      h.ellipse(24, 16.5, 3.5, 2.5, C);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 3, 1, OUTLINE); h.px(23, 14, '#ff5a2a'); }, 3);
      rigMouth(h, Q, 24, 16, 2, () => h.px(26, 16, OUTLINE));
      return;
    }
    if (v === 'back') {
      t.poly([[6, 20], [2, 18], [6, 23]], F); t.poly([[26, 20], [30, 18], [26, 23]], F);
      b.ellipse(16, 21, 10, 7, B, { edge: true });
      legA.ellipse(10, 28, 3, 2, B, { edge: true }); legB.ellipse(22, 28, 3, 2, B, { edge: true });
      h.ellipse(16, 14, 7, 6, B, { edge: true });
      h.poly([[7, 15], [9, 2], [14, 11]], F); h.poly([[12, 11], [16, 0], [20, 11]], F); h.poly([[18, 11], [23, 2], [25, 15]], F);
      h.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
      t.rect(15, 22, 2, 5, '#1f3054'); t.ellipse(16, 27.5, 1.6, 1.6, '#ff7a1c');
      return;
    }
    h.poly([[7, 15], [9, 2], [14, 11]], F); h.poly([[12, 11], [16, 0], [20, 11]], F); h.poly([[18, 11], [23, 2], [25, 15]], F);
    h.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
    b.ellipse(16, 21, 10, 7, B, { edge: true });
    b.ellipse(16, 24, 7, 5, C);
    h.ellipse(16, 14, 7, 6, B, { edge: true });
    h.ellipse(16, 17, 4, 2.5, C);
    legA.ellipse(10, 28, 3, 2, C, { edge: true }); legB.ellipse(22, 28, 3, 2, C, { edge: true });
    rigEyes(h, Q, 32, 10, 13, 3, () => { h.rectM(10, 13, 3, 1, OUTLINE); h.pxM(12, 14, '#ff5a2a'); });   // narrow eyes
    rigMouth(h, Q, 15, 16, 2, () => h.px(15, 16, OUTLINE).px(16, 16, OUTLINE));
    t.poly([[6, 20], [2, 18], [6, 23]], F); t.poly([[26, 20], [30, 18], [26, 23]], F);          // flank flames
  },

  tidalisk(g, v = 'front') {
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[5, 25], [0, 20], [1, 29]], Fn);
      g.ellipse(15, 26, 12, 4.5, B, { edge: true });
      earB.poly([[14, 10], [6, 5], [11, 14]], Fn);
      b.ellipse(17, 19, 5.5, 8, B, { edge: true });
      b.ellipse(19.5, 21, 2.5, 6, C);
      h.poly([[15, 7], [13, 0], [19, 5]], Fn);
      h.ellipse(20, 10, 7, 5.5, B, { edge: true });
      h.ellipse(25, 12, 3, 2, C);
      rigEye(h, Q, 21, 8, () => { h.rect(21, 8, 2, 3, DARK_EYE); h.px(21, 8, '#ffffff'); });
      rigMouth(h, Q, 24, 12, 2);
      g.px(10, 26, '#7ab4ff'); g.px(7, 25, '#7ab4ff');
      return;
    }
    if (v === 'back') {
      t.poly([[26, 25], [31, 20], [30, 29]], Fn);
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      b.ellipse(16, 19, 6, 8, B, { edge: true });
      h.ellipse(16, 10, 7, 5.5, B, { edge: true });
      earA.poly([[10, 9], [2, 4], [8, 13]], Fn); earB.poly([[22, 9], [30, 4], [24, 13]], Fn);
      h.poly([[14, 6], [16, 0], [19, 6]], Fn);
      for (const y of [13, 16, 19, 22]) b.rect(15, y, 2, 2, '#7ab4ff');
      return;
    }
    h.poly([[14, 6], [16, 0], [19, 6]], Fn);
    earA.poly([[10, 9], [2, 4], [8, 13]], Fn); earB.poly([[22, 9], [30, 4], [24, 13]], Fn);
    g.ellipse(16, 26, 12, 4.5, B, { edge: true });
    b.ellipse(16, 19, 6, 8, B, { edge: true });
    b.ellipse(16, 21, 3.5, 6, C);
    h.ellipse(16, 10, 7, 5.5, B, { edge: true });
    h.ellipse(16, 13, 4, 2, C);
    rigEyes(h, Q, 32, 12, 9, 2, () => h.eyes(12, 9, DARK_EYE));
    rigMouth(h, Q, 15, 13, 2);
    g.pxM(9, 26, '#7ab4ff'); g.pxM(6, 25, '#7ab4ff');
  },

  thornback(g, v = 'front') {
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const plates = pts => { for (const [x, y] of pts) { b.px(x, y, '#2a6b2a'); b.px(x + 1, y, '#2a6b2a'); b.px(x, y + 1, '#2a6b2a'); } };
    if (v === 'side') {
      t.poly([[4, 22], [0, 24], [4, 26]], T);
      earB.poly([[9, 13], [4, 4], [12, 11]], L); earA.poly([[13, 11], [13, 1], [18, 10]], L);
      legB.ellipse(9, 28, 3, 2.5, T, { edge: true }); legA.ellipse(20, 28, 3, 2.5, T, { edge: true });
      b.ellipse(15, 19, 12, 9, S, { edge: true });
      plates([[9, 16], [15, 13], [20, 16], [11, 21], [17, 21]]);
      h.ellipse(26, 23, 4.5, 4, T, { edge: true });
      rigEye(h, Q, 27, 21, () => { h.rect(27, 21, 1, 2, DARK_EYE); h.px(27, 21, '#ffffff'); }, 1);
      rigMouth(h, Q, 28, 24, 2, () => h.px(29, 24, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 13], [6, 3], [14, 10]], L); earB.poly([[22, 13], [26, 3], [18, 10]], L);
      b.poly([[13, 11], [16, 1], [19, 11]], L);
      legA.ellipse(8, 28, 3, 2.5, T, { edge: true }); legB.ellipse(24, 28, 3, 2.5, T, { edge: true });
      b.ellipse(16, 19, 12, 9, S, { edge: true });
      plates([[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]);
      t.poly([[15, 26], [16, 30], [17, 26]], T);
      return;
    }
    earA.poly([[10, 13], [6, 3], [14, 10]], L); earB.poly([[22, 13], [26, 3], [18, 10]], L);   // leaves
    b.poly([[13, 11], [16, 1], [19, 11]], L);
    legA.ellipse(8, 28, 3, 2.5, T, { edge: true }); legB.ellipse(24, 28, 3, 2.5, T, { edge: true });
    b.ellipse(16, 19, 12, 9, S, { edge: true });
    plates([[11, 15], [16, 13], [21, 15], [13, 20], [19, 20]]);                                 // shell plates
    h.ellipse(16, 23, 5.5, 4.5, T, { edge: true });
    rigEyes(h, Q, 32, 13, 22, 1, () => { h.rectM(13, 22, 1, 2, DARK_EYE); h.pxM(13, 22, '#ffffff'); });
    rigMouth(h, Q, 15, 25, 2, () => h.px(15, 25, OUTLINE).px(16, 25, OUTLINE));
  },

  slumbear(g, v = 'front') { // 44x44
    const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {
      t.ellipse(5, 30, 2.5, 2.5, B);
      earA.ellipse(21, 8, 3.5, 3.5, B);
      legB.ellipse(14, 41, 5, 2.5, C, { edge: true });
      b.ellipse(21, 27, 16, 14, B, { edge: true });
      b.ellipse(26, 31, 9, 9, C);
      legA.ellipse(28, 41, 5, 2.5, C, { edge: true });
      h.ellipse(26, 14, 10, 8.5, B, { edge: true });
      h.ellipse(33, 17, 4.5, 3.5, C);
      armA.ellipse(28, 27, 3.5, 6, B, { edge: true });
      h.rect(35, 15, 2, 2, OUTLINE);
      rigEye(h, Q, 28, 13, () => h.rect(28, 13, 4, 1, OUTLINE), 4);
      rigMouth(h, Q, 33, 20, 2, () => h.px(33, 20, OUTLINE).px(34, 20, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.ellipse(11, 8, 3.5, 3.5, B); earB.ellipse(33, 8, 3.5, 3.5, B);
      b.ellipse(22, 27, 17, 14, B, { edge: true });
      armA.ellipse(6, 27, 3.5, 6, B, { edge: true }); armB.ellipse(38, 27, 3.5, 6, B, { edge: true });
      h.ellipse(22, 14, 11, 8.5, B, { edge: true });
      const D = P('#2a4c55', '#1f3a42', '#3f6f78');
      legA.ellipse(12, 41, 5, 2.5, D, { edge: true }); legB.ellipse(32, 41, 5, 2.5, D, { edge: true });
      t.ellipse(22, 36, 3, 3, C, { edge: true });
      return;
    }
    earA.ellipse(11, 8, 3.5, 3.5, B); earB.ellipse(33, 8, 3.5, 3.5, B);
    b.ellipse(22, 27, 17, 14, B, { edge: true });
    b.ellipse(22, 31, 12, 10, C);
    armA.ellipse(6, 27, 3.5, 6, B, { edge: true }); armB.ellipse(38, 27, 3.5, 6, B, { edge: true });
    h.ellipse(22, 14, 11, 8.5, B, { edge: true });
    h.ellipse(22, 16.5, 8, 5.5, C);
    rigEyes(h, Q, 44, 16, 14, 4, () => h.rectM(16, 14, 4, 1, OUTLINE));                        // sleepy eyes
    rigMouth(h, Q, 20, 19, 4, () => { h.rect(20, 19, 4, 1, OUTLINE); h.px(19, 18, OUTLINE); h.px(24, 18, OUTLINE); });   // smile
    legA.ellipse(12, 41, 5, 2.5, C, { edge: true }); legB.ellipse(32, 41, 5, 2.5, C, { edge: true });
    legA.px(10, 41, OUTLINE).px(12, 41, OUTLINE).px(14, 41, OUTLINE); legB.px(33, 41, OUTLINE).px(31, 41, OUTLINE).px(29, 41, OUTLINE);
    earA.px(11, 7, '#2a4c55'); earB.px(32, 7, '#2a4c55');
  },

  frostling(g, v = 'front') {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.ellipse(6, 19, 5, 7.5, Cr);
      earB.poly([[13, 10], [11, 2], [16, 8]], B);
      b.ellipse(15, 23, 6.5, 6, B, { edge: true });
      legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18, 29, 2.5, 1.5, '#5ea8cc');
      earA.poly([[17, 10], [18, 1], [22, 9]], B, { edge: true });
      h.ellipse(18, 14, 7.5, 6, B, { edge: true });
      h.poly([[22, 13], [28, 16], [22, 18]], B, { edge: true });
      h.poly([[16, 9], [19, 2], [20, 9]], Cr, { edge: true });
      h.poly([[19, 17], [15, 21], [21, 20]], Cr);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#1a3a5a'); h.px(21, 13, '#ffffff'); });
      rigMouth(h, Q, 25, 16, 2, () => h.px(27, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      legA.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legB.ellipse(20, 29, 2.5, 1.5, '#5ea8cc');
      h.ellipse(16, 14, 7.5, 6, B, { edge: true });
      h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
      t.ellipse(16, 21, 5, 7.5, Cr, { edge: true });
      return;
    }
    t.ellipse(25, 19, 5, 7.5, Cr);                                                              // fluffy tail
    earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
    b.ellipse(16, 23, 6.5, 6, B, { edge: true });
    h.ellipse(16, 14, 7.5, 6, B, { edge: true });
    h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
    h.polyM([[9, 17], [5, 20], [10, 20]], Cr);                                                  // cheek frost
    legA.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legB.ellipse(20, 29, 2.5, 1.5, '#5ea8cc');
    rigEyes(h, Q, 32, 12, 13, 2, () => h.eyes(12, 13, '#1a3a5a'));
    rigMouth(h, Q, 15, 17, 2, () => h.px(15, 17, OUTLINE).px(16, 17, OUTLINE));
  },

  drakorn(g, v = 'front') {
    const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const spine = x => { for (const y of [8, 11, 17]) (y < 15 ? h : b).rect(x, y, 2, 1, '#c45e1e'); };
    if (v === 'side') {
      wingPoly(b, [[12, 18], [2, 5], [4, 19]], W);
      t.poly([[10, 26], [1, 30], [8, 22]], O);
      earA.poly([[17, 9], [13, 1], [19, 6]], C, { edge: true });
      b.ellipse(15, 23, 8, 7.5, O, { edge: true });
      b.ellipse(19, 25, 3.5, 5.5, C);
      legB.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); legA.ellipse(19, 30, 2.5, 1.5, '#c45e1e');
      h.ellipse(19, 12, 7, 6, O, { edge: true });
      h.ellipse(24, 14, 3.5, 2.5, C);
      rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
      h.px(20, 8, OUTLINE); h.px(21, 8, OUTLINE); h.px(22, 9, OUTLINE);
      rigMouth(h, Q, 24, 13, 2, () => h.px(26, 13, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[13, 9], [9, 1], [15, 6]], C, { edge: true }); earB.poly([[19, 9], [23, 1], [17, 6]], C, { edge: true });
      b.ellipse(16, 23, 8, 7.5, O, { edge: true });
      legA.ellipse(11, 30, 2.5, 1.5, '#c45e1e'); legB.ellipse(21, 30, 2.5, 1.5, '#c45e1e');
      h.ellipse(16, 12, 7, 6, O, { edge: true });
      t.poly([[14, 27], [18, 27], [16, 32]], O, { edge: true });
      spine(15);
      wingPolyM(b, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });
      return;
    }
    wingPolyM(b, [[10, 17], [0, 5], [2, 19]], W);
    t.poly([[21, 26], [31, 30], [24, 22]], O);
    earA.poly([[13, 9], [9, 1], [15, 6]], C, { edge: true }); earB.poly([[19, 9], [23, 1], [17, 6]], C, { edge: true });
    b.ellipse(16, 23, 8, 7.5, O, { edge: true });
    b.ellipse(16, 25, 5, 5.5, C);
    h.ellipse(16, 12, 7, 6, O, { edge: true });
    h.ellipse(16, 15, 4, 2.2, C);
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
    legA.ellipse(11, 30, 2.5, 1.5, '#c45e1e'); legB.ellipse(21, 30, 2.5, 1.5, '#c45e1e');
  },

  boulderon(g, v = 'front') { // 44x44
    const R = P('#8f8170', '#625747', '#b8aa96');
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) b.px(x, y, '#4e4436'); };
    if (v === 'side') {
      earB.poly([[9, 18], [11, 6], [16, 15]], R, { edge: true });
      h.poly([[15, 13], [19, 2], [23, 13]], R, { edge: true });
      earA.poly([[22, 14], [28, 5], [30, 17]], R, { edge: true });
      legB.ellipse(14, 40, 4.5, 2.5, R, { edge: true });
      b.ellipse(21, 26, 15, 14, R, { edge: true });
      legA.ellipse(28, 40, 4.5, 2.5, R, { edge: true });
      armA.ellipse(26, 28, 5, 6, R, { edge: true });
      rigEye(h, Q, 30, 22, () => { h.rect(30, 22, 2, 3, '#ffb02a'); h.px(30, 22, '#ffffff'); h.px(29, 20, OUTLINE); h.px(30, 20, OUTLINE); h.px(31, 21, OUTLINE); });
      rigMouth(h, Q, 31, 31, 4, () => h.rect(31, 31, 4, 1, OUTLINE));
      cracks([[10, 30], [11, 31], [11, 32], [16, 18], [17, 19], [19, 34]]);
      return;
    }
    if (v === 'back') {
      earA.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
      h.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
      earB.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
      b.ellipse(22, 26, 15, 14, R, { edge: true });
      armA.ellipse(6, 28, 5, 6, R, { edge: true }); armB.ellipse(38, 28, 5, 6, R, { edge: true });
      legA.ellipse(14, 40, 4.5, 2.5, R, { edge: true }); legB.ellipse(30, 40, 4.5, 2.5, R, { edge: true });
      b.poly([[18, 26], [22, 18], [26, 26]], R, { edge: true });
      b.poly([[19, 34], [22, 28], [25, 34]], R, { edge: true });
      cracks([[12, 22], [13, 23], [31, 30], [30, 31], [16, 33], [28, 20]]);
      return;
    }
    earA.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
    h.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
    earB.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
    b.ellipse(22, 26, 15, 14, R, { edge: true });
    armA.ellipse(6, 28, 5, 6, R, { edge: true }); armB.ellipse(38, 28, 5, 6, R, { edge: true });
    legA.ellipse(14, 40, 4.5, 2.5, R, { edge: true }); legB.ellipse(30, 40, 4.5, 2.5, R, { edge: true });
    rigEyes(h, Q, 44, 16, 22, 2, () => h.eyes(16, 22, '#ffb02a', { brow: true }));
    rigMouth(h, Q, 19, 30, 7, () => { h.rect(19, 30, 7, 1, OUTLINE); h.px(18, 29, OUTLINE); h.px(26, 29, OUTLINE); });
    cracks([[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [29, 33], [30, 34]]);
  },

  mindra(g, v = 'front') {
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);
      earB.poly([[13, 8], [10, 0], [16, 5]], B);
      b.ellipse(15, 23, 5, 6.5, B, { edge: true });
      legB.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legA.ellipse(18, 29.5, 2, 1.2, '#9058b8');
      earA.poly([[17, 7], [19, 0], [22, 6]], B, { edge: true });
      h.ellipse(18, 12, 8, 7, B, { edge: true });
      h.ellipse(22, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(21, 8, '#ffd0dc');
      rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 4, '#5a1a8a'); h.px(21, 11, '#ffffff'); });
      rigMouth(h, Q, 23, 16, 2, () => h.px(25, 16, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 8], [5, 0], [13, 5]], B); earB.poly([[22, 8], [27, 0], [19, 5]], B);
      b.ellipse(16, 23, 5, 6.5, B, { edge: true });
      legA.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legB.ellipse(19, 29.5, 2, 1.2, '#9058b8');
      h.ellipse(16, 12, 8, 7, B, { edge: true });
      t.poly([[15, 27], [23, 22], [20, 15], [25, 11], [18, 19], [21, 23], [14, 25]], B, { edge: true });
      return;
    }
    t.poly([[19, 24], [30, 17], [27, 23], [31, 27], [21, 28]], B);
    earA.poly([[10, 8], [5, 0], [13, 5]], B); earB.poly([[22, 8], [27, 0], [19, 5]], B);
    b.ellipse(16, 23, 5, 6.5, B, { edge: true });
    h.ellipse(16, 12, 8, 7, B, { edge: true });
    h.ellipse(16, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(15, 8, '#ffd0dc');
    rigEyes(h, Q, 32, 11, 11, 2, () => h.eyes(11, 11, '#5a1a8a', { h: 4 }));
    rigMouth(h, Q, 15, 16, 2, () => h.px(16, 16, OUTLINE));
    legA.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legB.ellipse(19, 29.5, 2, 1.2, '#9058b8');
  },

  shadefang(g, v = 'front') {
    const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);
      earB.poly([[14, 10], [12, 1], [17, 7]], B);
      b.ellipse(15, 22, 8, 6.5, B, { edge: true });
      legB.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legA.ellipse(19, 28.5, 2.5, 1.5, '#24203a');
      b.ellipse(18, 18, 4, 2, '#d2384a');
      earA.poly([[17, 9], [19, 1], [21, 8]], B, { edge: true }); earA.px(19, 4, '#d2384a'); earA.px(19, 5, '#d2384a');
      h.ellipse(19, 13, 6.5, 5.5, B, { edge: true });
      h.poly([[22, 12], [28, 15], [22, 17]], B, { edge: true });
      h.ellipse(24, 16, 3, 1.5, G);
      rigEye(h, Q, 21, 12, () => { h.rect(21, 12, 2, 3, '#ff3a3a'); h.px(21, 12, '#ffffff'); });
      h.px(20, 10, OUTLINE); h.px(21, 10, OUTLINE); h.px(22, 11, OUTLINE);
      rigMouth(h, Q, 25, 15, 2, () => h.px(28, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[11, 10], [9, 1], [15, 7]], B); earB.poly([[21, 10], [23, 1], [17, 7]], B);
      earA.px(10, 4, '#d2384a').px(10, 5, '#d2384a'); earB.px(21, 4, '#d2384a').px(21, 5, '#d2384a');
      b.ellipse(16, 22, 8, 6.5, B, { edge: true });
      b.ellipse(16, 18, 6, 2, '#d2384a');
      h.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
      legA.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legB.ellipse(21, 28.5, 2.5, 1.5, '#24203a');
      t.poly([[14, 25], [19, 15], [22, 12], [19, 24]], B, { edge: true });
      return;
    }
    t.poly([[21, 22], [31, 13], [28, 22], [24, 26]], B);
    earA.poly([[11, 10], [9, 1], [15, 7]], B); earB.poly([[21, 10], [23, 1], [17, 7]], B);
    earA.px(10, 4, '#d2384a').px(10, 5, '#d2384a'); earB.px(21, 4, '#d2384a').px(21, 5, '#d2384a');
    b.ellipse(16, 22, 8, 6.5, B, { edge: true });
    b.ellipse(16, 18, 6, 2, '#d2384a');                                                         // collar
    h.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
    h.ellipse(16, 16, 3, 2, G);
    rigEyes(h, Q, 32, 12, 12, 2, () => h.eyes(12, 12, '#ff3a3a', { brow: true }));
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
    legA.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legB.ellipse(21, 28.5, 2.5, 1.5, '#24203a');
  },

  // Lumawool, redrawn (r48) from the owner's pick: a storm ram. Its wool is a dark living
  // thundercloud with lightning flickering inside, heavy curled iron horns, a long dark face and
  // glowing eyes; sparks crackle off it.
  lumawool(g, v = 'front') {
    const W = P('#3e4458', '#2a2e3e', '#5a627a'), Fc = P('#4a4c58', '#30323c', '#6a6c78'), H = P('#7a7e8a', '#4a4e5a', '#a8acb8');
    const LEG = '#2a2a34', HOOF = '#141418', BOLT = '#ffe066', GLOW = '#fff2a0';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 2, 5, LEG); p.rect(x, 29, 2, 1, HOOF); };
    const horn = (p, cx, cy) => { p.ellipse(cx, cy, 3, 3, H, { edge: true }); p.ellipse(cx, cy, 1.4, 1.4, H.s); p.px(cx, cy - 2, H.l); };
    const bolts = pts => { for (const [x, y] of pts) b.px(x, y, BOLT).px(x + 1, y - 1, BOLT).px(x + 2, y, BOLT); };
    const sparks = () => { t.px(3, 15, BOLT).px(4, 14, BOLT).px(4, 16, '#bfe8ff'); t.px(28, 22, BOLT).px(29, 21, BOLT).px(28, 23, '#bfe8ff'); };   // sparks that sway like a tail
    if (v === 'side') {
      leg(legA, 9); leg(legB, 18);
      for (const [x, y, r] of [[14, 19, 8], [8, 17, 4], [18, 14, 5], [12, 13, 4]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });   // thundercloud wool
      bolts([[8, 19], [15, 21], [17, 15]]);
      leg(legB, 11); leg(legA, 20);
      h.poly([[19, 11], [25, 13], [27, 17], [25, 19], [20, 17]], Fc, { edge: true });            // long dark face
      horn(earA, 20, 11);
      rigEye(h, Q, 22, 13, () => h.rect(22, 13, 2, 1, GLOW));
      h.px(21, 12, OUTLINE).px(22, 12, OUTLINE);
      h.px(26, 16, OUTLINE);
      rigMouth(h, Q, 24, 18, 2);
      sparks();
      return;
    }
    if (v === 'back') {
      leg(legA, 11); leg(legB, 19);
      for (const [x, y, r] of [[16, 20, 9.5], [9, 17, 4.5], [23, 17, 4.5], [11, 13, 4], [21, 13, 4], [16, 12, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });
      bolts([[9, 19], [20, 22], [14, 14]]);
      horn(earA, 9.5, 11); horn(earB, 22.5, 11);
      sparks();
      return;
    }
    leg(legA, 11); leg(legB, 19);                                                                // legs and hooves
    for (const [x, y, r] of [[16, 21, 9], [9, 18, 4.5], [23, 18, 4.5], [11, 13, 4], [21, 13, 4], [16, 11, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });   // thundercloud wool
    bolts([[8, 19], [21, 20], [15, 24]]);                                                        // lightning inside it
    horn(earA, 9.5, 11); horn(earB, 22.5, 11);                                                   // curled iron horns
    h.poly([[13, 11], [19, 11], [18.5, 19], [16, 21], [13.5, 19]], Fc, { edge: true });         // long dark face
    h.ellipse(16, 19, 2, 1.2, Fc.l);
    rigEyes(h, Q, 32, 13, 14, 2, () => h.rectM(13, 14, 2, 1, GLOW));                            // glowing eyes
    h.pxM(13, 13, OUTLINE).pxM(14, 13, OUTLINE);                                                 // heavy brows
    h.px(15, 18, OUTLINE).px(17, 18, OUTLINE);                                                   // nostrils
    rigMouth(h, Q, 15, 20, 2);
    sparks();
  },

  brawlix(g, v = 'front') {
    const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a'), Q = rig(), TONGUE = '#e8607a';
    const side = v === 'side', fwd = side ? Q.head[0] : 0;
    const b = part(g, 0, Q.body), h = part(g, fwd, Q.head[1]), tails = part(g, fwd + Q.tail[0], Q.head[1] + Q.tail[1]);
    const leg = i => part(g, side && Q.legs[i] ? 1 : 0, -Q.legs[i]), legA = leg(0), legB = leg(1);
    const arm = i => part(g, side ? Q.arms[i] : 0, Q.body - (side ? 0 : Q.arms[i])), armA = arm(0), armB = arm(1);
    const mouth = (x, y) => { if (Q.mouth === 'roar') { h.rect(x - 1, y, 4, 2, OUTLINE); h.px(x, y + 1, TONGUE); } else if (Q.mouth === 'open') h.rect(x, y, 2, 2, OUTLINE); else h.rect(x, y, 2, 1, OUTLINE); };
    if (side) {
      tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');
      legB.ellipse(12, 29, 2.2, 2, T, { edge: true }); legA.ellipse(19, 29, 2.2, 2, T, { edge: true });
      armB.ellipse(11, 20, 3.2, 3.2, R, { edge: true });
      b.ellipse(16, 21, 6, 6, T, { edge: true });
      b.ellipse(16, 26, 5.5, 2.6, '#3a5ab8', { edge: true });
      h.ellipse(17, 11, 6, 5.5, T, { edge: true });
      h.rect(11, 8, 12, 2, '#d23a3a');
      armA.ellipse(19, 18, 2.5, 3.5, T, { edge: true });
      armA.ellipse(23, 20, 3.5, 3.5, R, { edge: true });
      rigEye(h, Q, 20, 11, () => { h.rect(20, 11, 2, 2, DARK_EYE); h.px(20, 11, '#ffffff'); });
      h.px(19, 10, OUTLINE); h.px(20, 10, OUTLINE); h.px(21, 10, OUTLINE);
      if (Q.mouth) mouth(21, 14); else h.px(22, 14, OUTLINE);
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 29, 2.2, 2, T, { edge: true }); legB.ellipse(20, 29, 2.2, 2, T, { edge: true });
      b.ellipse(16, 21, 6.5, 6, T, { edge: true });
      b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      armA.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armB.ellipse(22, 18, 2.5, 3.5, T, { edge: true });
      armA.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armB.ellipse(25.5, 21, 3.5, 3.5, R, { edge: true });
      h.ellipse(16, 11, 6, 5.5, T, { edge: true });
      h.rect(10, 8, 12, 2, '#d23a3a');
      h.rect(15, 8, 2, 3, '#9a2222');
      tails.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); tails.poly([[17, 10], [20, 16], [17, 15]], '#d23a3a');
      b.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    tails.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');                                         // headband tails
    legA.ellipse(12, 29, 2.2, 2, T, { edge: true }); legB.ellipse(20, 29, 2.2, 2, T, { edge: true });
    b.ellipse(16, 21, 6.5, 6, T, { edge: true });
    b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    armA.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armB.ellipse(22, 18, 2.5, 3.5, T, { edge: true });
    armA.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armB.ellipse(25.5, 21, 3.5, 3.5, R, { edge: true });
    h.ellipse(16, 11, 6, 5.5, T, { edge: true });
    h.rect(10, 8, 12, 2, '#d23a3a');
    for (const x of [13, 17]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 2, DARK_EYE); h.px(x, 11, '#ffffff'); });
    h.px(12, 9, OUTLINE).px(13, 9, OUTLINE).px(14, 10, OUTLINE).px(15, 10, OUTLINE);            // angry brows
    h.px(19, 9, OUTLINE).px(18, 9, OUTLINE).px(17, 10, OUTLINE).px(16, 10, OUTLINE);
    mouth(15, 14);
    b.rect(14, 19, 4, 1, '#a8703e');
  },

  galewing(g, v = 'front') {
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[12, 23], [1, 29], [5, 21]], B);
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      b.ellipse(19.5, 22, 3.5, 5, '#f4f0e6');
      h.poly([[16, 7], [13, 0], [18, 4], [20, 1], [20, 7]], B);
      h.ellipse(19, 11, 6.5, 6, B, { edge: true });
      h.poly([[24, 10], [30, 12], [24, 14]], Y);
      rigEye(h, Q, 20, 9, () => { h.rect(20, 9, 2, 3, DARK_EYE); h.px(20, 9, '#ffffff'); });
      h.px(19, 7, OUTLINE); h.px(20, 7, OUTLINE); h.px(21, 8, OUTLINE);
      rigMouth(h, Q, 24, 12, 2);
      wingPoly(b, [[9, 16], [21, 18], [17, 25], [7, 24]], Wg, { edge: true }, { root: [19, 18], swing: -0.6 });
      FLAP || b.px(11, 21, '#a8b4e0'); FLAP || b.px(14, 20, '#a8b4e0');
      legB.rect(14, 28, 2, 2, Y); legA.rect(19, 28, 2, 2, Y);
      return;
    }
    if (v === 'back') {
      h.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      h.ellipse(16, 11, 6.5, 6, B, { edge: true });
      legA.rect(12, 28, 2, 2, Y); legB.rect(18, 28, 2, 2, Y);
      t.poly([[13, 25], [16, 31], [19, 25]], B, { edge: true });
      wingPolyM(b, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });
      FLAP || b.pxM(3, 13, '#a8b4e0'); FLAP || b.pxM(5, 18, '#a8b4e0'); FLAP || b.pxM(8, 16, '#a8b4e0');
      return;
    }
    t.poly([[20, 23], [31, 29], [27, 21]], B);                                                  // tail feathers
    wingPolyM(b, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });           // spread wings
    FLAP || b.pxM(3, 13, '#a8b4e0'); FLAP || b.pxM(4, 18, '#a8b4e0');
    h.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);                                   // crest
    b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });                                             // body
    b.ellipse(16, 22, 4.5, 5, '#f4f0e6');                                                       // belly
    h.ellipse(16, 11, 6.5, 6, B, { edge: true });                                               // head
    h.poly([[14, 13], [19, 13], [16, 17]], Y);                                                  // beak
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 15, 15, 2);
    legA.rect(12, 28, 2, 2, Y); legB.rect(18, 28, 2, 2, Y);                                     // feet
  },

  venomire(g, v = 'front') {
    const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    // spots on the body move with it, spots on the slimy base stay put
    const spots = (pts, cx) => { for (const [x, y] of pts) { const p = ((x + 0.5 - cx) / 8) ** 2 + ((y + 0.5 - 17) / 9) ** 2 <= 1 ? b : g; p.px(x, y, S); p.px(x + 1, y, S); } };
    if (v === 'side') {
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      earB.poly([[13, 10], [10, 2], [16, 8]], B);
      b.ellipse(17, 17, 8, 9, B, { edge: true });
      earA.poly([[18, 9], [20, 1], [22, 8]], B, { edge: true }); earA.px(20, 1, S); earA.px(20, 2, S);
      b.ellipse(21.5, 21, 3, 4.5, '#e4b8f4');
      spots([[6, 25], [22, 27], [12, 20], [11, 13], [26, 24]], 17);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#3a0a4a'); h.px(21, 13, '#ffffff'); });
      rigMouth(h, Q, 22, 17, 3, () => { h.rect(22, 17, 3, 1, OUTLINE); h.px(23, 18, '#ffffff'); });
      return;
    }
    if (v === 'back') {
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      earA.poly([[11, 10], [7, 2], [14, 8]], B); earB.poly([[21, 10], [25, 2], [18, 8]], B);
      earA.px(7, 2, S).px(8, 3, S); earB.px(24, 2, S).px(23, 3, S);
      b.ellipse(16, 17, 8, 9, B, { edge: true });
      spots([[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]], 16);
      return;
    }
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                              // slimy base
    earA.poly([[11, 10], [7, 2], [14, 8]], B); earB.poly([[21, 10], [25, 2], [18, 8]], B);      // horns
    earA.px(7, 2, S).px(8, 3, S); earB.px(24, 2, S).px(23, 3, S);
    b.ellipse(16, 17, 8, 9, B, { edge: true });                                                 // body
    b.ellipse(16, 21, 4.5, 4.5, '#e4b8f4');                                                     // belly
    spots([[8, 25], [22, 27], [25, 23], [5, 24], [17, 9], [11, 20]], 16);
    rigEyes(h, Q, 32, 12, 13, 2, () => h.eyes(12, 13, '#3a0a4a'));
    rigMouth(h, Q, 14, 17, 4, () => { h.rect(14, 17, 4, 1, OUTLINE); h.px(15, 18, '#ffffff'); h.px(17, 18, '#ffffff'); });   // fanged grin
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },

  scarablade(g, v = 'front') {
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    const tails = part(g, (side ? Q.head[0] : 0) + Q.tail[0], Q.head[1] + Q.tail[1]);   // the headband's tails trail behind the head
    if (side) {
      tails.poly([[17, 8], [10, 5], [11, 10]], '#d23a3a');
      legB.ellipse(10, 28, 3, 2, Bd, { edge: true }); legA.ellipse(19, 28, 3, 2, Bd, { edge: true });
      h.ellipse(21, 12, 5.5, 4.5, Bd, { edge: true });
      h.poly([[22, 9], [25, 3], [29, 0], [27, 4], [26, 9]], Hn, { edge: true });
      h.rect(17, 8, 9, 2, '#d23a3a');
      b.ellipse(14, 20, 10, 8.5, Sh, { edge: true });
      b.rect(6, 17, 16, 1, '#3a5208');
      b.px(9, 15, '#c4e04a'); b.px(10, 14, '#c4e04a'); b.px(13, 14, '#c4e04a');
      armA.ellipse(23, 21, 3, 3.2, Bd, { edge: true });
      rigEye(h, Q, 24, 11, () => h.rect(24, 11, 2, 2, '#ffde3a'));
      h.px(23, 10, OUTLINE); h.px(24, 10, OUTLINE);
      rigMouth(h, Q, 24, 14, 2);
      return;
    }
    if (v === 'back') {
      h.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });
      legA.ellipse(9, 28, 3, 2, Bd, { edge: true }); legB.ellipse(23, 28, 3, 2, Bd, { edge: true });
      armA.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armB.ellipse(26.5, 19, 3, 3.2, Bd, { edge: true });
      h.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });
      h.rect(10, 8, 12, 2, '#d23a3a');
      b.ellipse(16, 20, 10, 8.5, Sh, { edge: true });
      b.rect(16, 12, 1, 17, '#3a5208');
      b.pxM(10, 16, '#c4e04a'); b.pxM(11, 15, '#c4e04a'); b.pxM(12, 21, '#c4e04a');
      return;
    }
    h.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });      // great horn
    h.poly([[16, 4], [21, 1], [19, 5], [17, 6]], Hn);                                           // horn fork
    legA.ellipse(9, 28, 3, 2, Bd, { edge: true }); legB.ellipse(23, 28, 3, 2, Bd, { edge: true });   // legs
    armA.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armB.ellipse(26.5, 19, 3, 3.2, Bd, { edge: true });   // fists
    b.ellipse(16, 20, 10, 8.5, Sh, { edge: true });                                             // shell
    b.rect(16, 13, 1, 15, '#3a5208');                                                           // shell seam
    b.pxM(11, 18, '#c4e04a'); b.pxM(12, 17, '#c4e04a');
    h.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });                                            // head
    h.rect(10, 8, 12, 2, '#d23a3a');                                                            // headband
    tails.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');
    rigEyes(h, Q, 32, 12, 11, 2, () => h.eyes(12, 11, '#ffde3a', { brow: true, h: 2 }));
    rigMouth(h, Q, 15, 14, 2);
  },

  wispurr(g, v = 'front') {
    const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa'), Q = rig(), TONGUE = '#e8607a';
    const side = v === 'side', fwd = side ? Q.head[0] : 0;
    const b = part(g, 0, Q.body), t = part(g, Q.tail[0], Q.body + Q.tail[1]), h = part(g, fwd, Q.head[1]);
    const ear = i => part(g, fwd - (side && Q.ears[i] > 1 ? 1 : 0), Q.head[1] + Q.ears[i]), earA = ear(0), earB = ear(1);
    const mouth = (x, y) => { if (Q.mouth === 'roar') { h.rect(x - 1, y, 5, 3, OUTLINE); h.px(x + 1, y + 2, TONGUE); } else { h.rect(x, y, 3, 2, OUTLINE); h.px(x + 1, y + 1, TONGUE); } };
    if (side) {
      t.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);
      t.ellipse(3, 16, 2.5, 3.5, F);
      earB.poly([[13, 9], [10, 1], [16, 6]], B);
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      earA.poly([[17, 8], [19, 0], [22, 6]], B, { edge: true }); earA.px(19, 3, '#3ab8b0');
      h.ellipse(19, 12, 7.5, 6.5, B, { edge: true });
      rigEye(h, Q, 22, 11, () => { h.rect(22, 11, 2, 3, '#2ad8c0'); h.px(22, 11, '#ffffff'); });
      if (Q.mouth) mouth(23, 15); else h.px(25, 15, OUTLINE);
      h.px(26, 14, '#bcaaf0').px(27, 13, '#bcaaf0');
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earB.poly([[22, 9], [25, 1], [18, 6]], B, { edge: true });
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      h.ellipse(16, 12, 7.5, 6.5, B, { edge: true });
      t.poly([[15, 25], [20, 17], [17, 11], [24, 13], [19, 23]], B, { edge: true });
      t.ellipse(22, 10, 2.5, 3.5, F);
      return;
    }
    t.poly([[18, 23], [27, 29], [25, 23], [30, 18], [22, 19]], B);                              // wispy tail
    t.ellipse(29, 16, 2.5, 3.5, F);                                                             // tail wisp-flame
    earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earB.poly([[22, 9], [25, 1], [18, 6]], B, { edge: true });   // ears
    earA.px(8, 3, '#3ab8b0').px(9, 5, '#3ab8b0'); earB.px(23, 3, '#3ab8b0').px(22, 5, '#3ab8b0');
    b.ellipse(16, 21, 7, 6, B, { edge: true });                                                 // body
    b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
    h.ellipse(16, 12, 7.5, 6.5, B, { edge: true });                                             // head
    for (const x of [11, 19]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 3, '#2ad8c0'); h.px(x, 11, '#ffffff'); });
    if (Q.mouth) mouth(15, 15); else h.px(15, 15, OUTLINE).px(17, 15, OUTLINE).px(16, 16, OUTLINE);   // cat mouth
    h.pxM(6, 14, '#bcaaf0'); h.pxM(5, 15, '#bcaaf0');                                           // whiskers
  },

  gearhulk(g, v = 'front') { // 44x44
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    const rivets = pts => { for (const [x, y] of pts) b.px(x, y, '#3a4054'); };
    if (v === 'side') {
      legB.ellipse(15, 40, 5, 2.5, D, { edge: true }); legA.ellipse(28, 40, 5, 2.5, D, { edge: true });
      armB.ellipse(15, 25, 4.5, 8, D, { edge: true });
      b.poly([[10, 14], [32, 14], [34, 37], [8, 37]], M, { edge: true });
      b.rect(14, 20, 12, 3, '#6e7690'); b.rect(14, 26, 12, 3, '#6e7690');
      rivets([[12, 17], [30, 17], [11, 34], [31, 34]]);
      armA.ellipse(25, 25, 4.5, 8, D, { edge: true });
      armA.ellipse(26, 34, 5, 4, M, { edge: true });
      earA.rect(19, 1, 2, 4, '#6e7690'); earA.ellipse(20, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[13, 5], [29, 5], [30, 15], [12, 15]], M, { edge: true });
      h.rect(23, 8, 7, 4, '#1c2a3a');
      rigEye(h, Q, 27, 9, () => h.rect(27, 9, 2, 2, '#5affff'));
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 40, 5, 2.5, D, { edge: true }); legB.ellipse(33, 40, 5, 2.5, D, { edge: true });
      armA.ellipse(5, 25, 4.5, 8, D, { edge: true }); armB.ellipse(39, 25, 4.5, 8, D, { edge: true });
      armA.ellipse(5, 34, 5, 4, M, { edge: true }); armB.ellipse(39, 34, 5, 4, M, { edge: true });
      b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      b.rect(15, 18, 14, 14, '#6e7690');
      for (let y = 20; y < 31; y += 3) b.rect(17, y, 10, 1, '#3a4054');
      rivets([[11, 17], [32, 17], [10, 34], [33, 34]]);
      earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      h.rect(17, 9, 10, 2, '#6e7690');
      return;
    }
    legA.ellipse(11, 40, 5, 2.5, D, { edge: true }); legB.ellipse(33, 40, 5, 2.5, D, { edge: true });   // feet
    armA.ellipse(5, 25, 4.5, 8, D, { edge: true }); armB.ellipse(39, 25, 4.5, 8, D, { edge: true });     // arms
    armA.ellipse(5, 34, 5, 4, M, { edge: true }); armB.ellipse(39, 34, 5, 4, M, { edge: true });         // fists
    b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });                          // torso
    b.ellipse(22, 26, 6, 6, G);                                                                 // chest gear
    b.rect(21, 18, 2, 2, G); b.rect(21, 32, 2, 2, G); b.rect(14, 25, 2, 2, G); b.rect(28, 25, 2, 2, G);
    b.ellipse(22, 26, 2.2, 2.2, '#7a5418');
    rivets([[11, 17], [32, 17], [10, 34], [33, 34]]);                                           // rivets
    earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');              // antenna
    h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });                          // head
    h.rect(16, 8, 12, 4, '#1c2a3a');                                                            // visor
    rigEye(h, Q, 18, 9, () => h.rect(18, 9, 2, 2, '#5affff')); rigEye(h, Q, 24, 9, () => h.rect(24, 9, 2, 2, '#5affff'));
  },

  // Toshi, the owner's real-life Shiba Inu (drawn from photos): a soft ginger coat; a big
  // white bib, belly and legs; white cheeks up to his eyes; pale eyebrow spots; upright
  // ears with pale insides; a big black nose; a ring of white ruff round the neck; and his smug half-shut stare.
  // The curled tail is ginger on top with lots of white fluff.
  smugshi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Ei = TOSHI.ear, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig(), side = v === 'side';
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]);
    const hx = side ? R.head[0] : 0, h = part(g, hx, R.head[1]);
    const ear = i => part(g, hx - (side && R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]);   // ears drop (and fold back) when pinned
    const earA = ear(0), earB = ear(1);
    const legA = part(g, side && R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, side && R.legs[1] ? 1 : 0, -R.legs[1]);
    if (side) {
      t.ellipse(8, 15, 4.5, 4.5, O, { edge: true });                                             // curled tail, very fluffy
      t.ellipse(7.5, 14.5, 3.3, 3.3, C); t.px(7, 14, O.l); t.px(8, 15, O.s);
      legA.ellipse(10, 27, 1.8, 3, P(C.s, '#cbbba4', C.b)); legB.ellipse(19, 27, 1.8, 3, P(C.s, '#cbbba4', C.b));   // far legs
      b.ellipse(14, 22, 8.5, 5.5, O, { edge: true });                                            // body
      b.ellipse(14, 25.5, 7, 2, C);                                                              // white belly
      b.ellipse(9, 25, 2.2, 2.6, C);                                                             // white back of the thigh
      b.ellipse(20, 22, 3.5, 4.5, C);                                                            // white chest
      legB.ellipse(11, 27.5, 1.9, 3, C, { edge: true }); legA.ellipse(21, 27.5, 1.9, 3, C, { edge: true });   // white legs
      b.poly([[13, 15], [16, 13.5], [19, 17], [22, 22], [18, 23], [15.5, 18.5]], C);             // white sash from the chest up over the neck
      earB.poly([[14, 8], [13, 1], [17, 5]], O);                                                 // far ear
      h.ellipse(19, 12, 6.5, 5.5, O, { edge: true });                                            // head
      b.px(13, 15, C.b); b.px(13, 16, C.b); b.px(14, 17, C.b);                                   // the ruff showing behind the head
      earA.poly([[17, 7], [19, 0], [22, 6]], O, { edge: true });                                 // near ear
      earA.poly([[18.5, 6], [19.3, 2.5], [21, 5.5]], PINK);
      h.poly([[21, 12], [28, 13.5], [27.5, 16.5], [20, 17.5]], C, { edge: true });               // white muzzle
      h.ellipse(19.5, 15.5, 3, 2, C);                                                            // white cheek
      h.px(21, 9, C.b); h.px(22, 9, C.b);                                                        // eyebrow spot
      rigEye(h, R, 21, 11, () => { h.rect(21, 11, 3, 1, OUTLINE); h.px(22, 12, DARK_EYE); h.px(23, 12, DARK_EYE); }, 3);   // smug half-shut eye
      h.rect(27, 13, 2, 2, OUTLINE);                                                             // nose
      if (R.mouth === 'roar') { h.rect(22, 15, 5, 3, OUTLINE); h.px(23, 17, TONGUE).px(24, 17, TONGUE); }
      else if (R.mouth === 'open') { h.rect(23, 16, 4, 2, OUTLINE); h.px(24, 17, TONGUE); h.px(25, 17, TONGUE); }
      else h.px(24, 17, OUTLINE).px(25, 17, OUTLINE).px(26, 16, OUTLINE);                       // flat little mouth
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(20, 27.5, 2.2, 3, C, { edge: true });   // white hind legs
      b.ellipse(16, 22, 7.5, 6, O, { edge: true });
      b.ellipse(16, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears
      b.ellipse(16, 18.2, 7, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(16, 12, 8, 6.2, O, { edge: true });
      h.ellipseM(9, 15, 1.6, 1.6, C);                                                            // cheek fluff peeking out
      t.ellipse(16, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(16, 18.5, 3, 2.6, C); t.px(16, 18, O.s); t.px(17, 18, O.s);
      return;
    }
    t.ellipse(25.5, 17.5, 4.5, 4.5, O, { edge: true });                                          // curled tail behind him
    t.ellipse(26, 17, 3.2, 3.2, C); t.px(25, 17, O.l); t.px(26, 17, O.s);                        // lots of cream fluff in the curl
    legA.ellipse(12, 27, 2.4, 3.4, C, { edge: true }); legB.ellipse(20, 27, 2.4, 3.4, C, { edge: true });   // white front legs
    legA.px(11, 30, C.s).px(13, 30, C.s); legB.px(20, 30, C.s).px(18, 30, C.s);                  // toes
    b.ellipse(16, 22, 7.5, 6, O, { edge: true });                                                // body
    b.ellipse(16, 23, 5.2, 6, C);                                                                // white chest
    earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears, set wide
    earA.poly([[8.3, 8], [7.8, 2.5], [11.8, 5.8]], PINK); earB.poly([[23.7, 8], [24.2, 2.5], [20.2, 5.8]], PINK);   // pink insides
    earA.px(9, 4, C.b).px(10, 6, C.b); earB.px(22, 4, C.b).px(21, 6, C.b);                       // white fur at the inner edge
    h.ellipse(16, 12, 8.5, 6.5, O, { edge: true });                                              // head
    h.ellipseM(10.5, 14.6, 2.8, 2.6, C);                                                         // white cheeks, up under the eyes
    h.ellipse(16, 15.6, 4.6, 3, C);                                                              // white muzzle
    h.rect(13, 17, 6, 3, C.b); h.rect(12, 18, 8, 2, C.b);                                        // white throat running into the chest (no chin line)
    h.rectM(11, 9, 2, 1, C.b);                                                                   // pale eyebrow spots
    for (const x of [10, 18]) rigEye(h, R, x + (R.eyes ? 1 : 0), 11, () => { h.rect(x, 11, 4, 1, OUTLINE); h.rect(x + 1, 12, 2, 1, DARK_EYE); });   // smug half-shut lids
    h.rect(15, 13, 2, 2, OUTLINE); h.px(15, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'roar') { h.rect(13, 16, 6, 3, OUTLINE); h.px(15, 18, TONGUE).px(16, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(14, 16, 4, 2, OUTLINE); h.px(15, 17, TONGUE).px(16, 17, TONGUE); }
    else { h.px(14, 17, OUTLINE).px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(17, 17, OUTLINE); h.px(18, 16, OUTLINE); }   // flat, unimpressed mouth with a smug corner
  },

  // An exhausted sloth clinging to its coffee: dark eye bands that double as
  // tired bags, droopy half-shut eyes, a frown and messy bed hair.
  mondaze(g, v = 'front') {
    const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const fur = pts => { for (const [x, y] of pts) { const p = y < 16 ? h : b; p.px(x, y, '#6e6052'); p.px(x + 1, y + 1, '#6e6052'); } };
    if (v === 'side') {
      legB.ellipse(12, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 3, 1.6, F, { edge: true });
      b.ellipse(15, 22, 9, 7.5, F, { edge: true });
      b.ellipse(18, 24, 4, 4.5, '#b0a090');
      h.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
      h.ellipse(18, 11, 8.5, 7, F, { edge: true });
      h.ellipse(21, 12, 5.5, 5, C);
      h.poly([[18, 10], [24, 10], [24, 14], [20, 14]], '#4a3a30');
      rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 1, '#1a1222'); h.rect(21, 12, 2, 1, '#7a6a8a'); });
      h.rect(25, 13, 2, 1, OUTLINE);
      rigMouth(h, Q, 23, 16, 3, () => h.px(23, 17, OUTLINE).px(24, 16, OUTLINE).px(25, 17, OUTLINE));
      armA.ellipse(20, 21, 2.5, 4, F, { edge: true });
      b.poly([[22, 20], [27, 20], [27, 26], [22, 26]], M, { edge: true });
      b.rect(28, 21, 1, 3, '#24766f'); b.rect(23, 20, 3, 1, '#5a3a22');
      b.px(23, 18, '#eef2f6').px(24, 17, '#eef2f6').px(26, 18, '#eef2f6');
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 29, 3, 1.6, F, { edge: true }); legB.ellipse(21, 29, 3, 1.6, F, { edge: true });
      b.ellipse(16, 22, 9, 7.5, F, { edge: true });
      armA.ellipse(8, 21, 2.5, 4, F, { edge: true }); armB.ellipse(24, 21, 2.5, 4, F, { edge: true });
      h.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);
      h.ellipse(16, 11, 8.5, 7, F, { edge: true });
      fur([[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]);
      return;
    }
    legA.ellipse(11, 29, 3, 1.6, F, { edge: true }); legB.ellipse(21, 29, 3, 1.6, F, { edge: true });   // feet
    b.ellipse(16, 22, 9, 7.5, F, { edge: true });                                               // slumped body
    b.ellipse(16, 24, 5, 4.5, '#b0a090');                                                       // belly
    h.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);                 // bed hair
    h.ellipse(16, 11, 8.5, 7, F, { edge: true });                                               // head
    h.ellipse(16, 12, 6.5, 5, C);                                                               // face
    h.polyM([[8, 10], [14, 10], [14, 14], [10, 14]], '#4a3a30');                                 // droopy eye bands
    rigEyes(h, Q, 32, 11, 11, 2, () => { h.rectM(11, 11, 2, 1, '#1a1222'); h.rectM(11, 12, 2, 1, '#7a6a8a'); });   // half-shut eyes, eye bags
    h.rect(15, 14, 2, 1, OUTLINE);                                                              // nose
    rigMouth(h, Q, 14, 16, 4, () => h.px(14, 17, OUTLINE).px(15, 16, OUTLINE).px(16, 16, OUTLINE).px(17, 17, OUTLINE));   // frown
    armA.ellipse(9, 21, 2.5, 4, F, { edge: true }); armB.ellipse(23, 21, 2.5, 4, F, { edge: true });   // arms
    b.poly([[13, 21], [19, 21], [19, 27], [13, 27]], M, { edge: true });                        // coffee mug
    b.rect(20, 22, 1, 3, '#24766f'); b.px(19, 22, '#24766f'); b.px(19, 24, '#24766f');          // handle
    b.rect(14, 21, 4, 1, '#5a3a22');                                                            // coffee
    armA.px(12, 24, '#e8dcc6'); armB.px(19, 24, '#e8dcc6');                                     // claws round the mug
    b.px(14, 19, '#eef2f6').px(15, 18, '#eef2f6').px(17, 19, '#eef2f6').px(18, 18, '#eef2f6');  // steam
  },

  pixibelle(g, v = 'front') {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const skirt = () => b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
    if (v === 'side') {
      wingEllipse(b, 9, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 10, 22, 4, 3.5, Wn, { edge: true });
      wingEllipse(b, 8, 12, 1.8, 1.5, '#ffb4dc');
      earA.rect(19, 2, 1, 4, OUTLINE); earA.px(19, 1, '#ffe066'); earA.px(20, 1, '#ffe066'); earA.px(19, 0, '#ffe066');
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt();
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[9, 6], [13, 9], [9, 12]], Pk); h.px(12, 9, '#c83a7a');
      rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
      h.ellipse(22, 16, 1.5, 1, '#ff8ab8');
      rigMouth(h, Q, 22, 17, 2, () => h.px(23, 17, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.rect(12, 2, 1, 4, OUTLINE); earB.rect(19, 2, 1, 4, OUTLINE);
      earA.px(12, 1, '#ffe066').px(11, 1, '#ffe066').px(12, 0, '#ffe066'); earB.px(19, 1, '#ffe066').px(20, 1, '#ffe066').px(19, 0, '#ffe066');
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt();
      h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk); h.px(16, 8, '#c83a7a');
      wingEllipseM(b, 7.5, 14, 5.5, 5, Wn, { edge: true });
      wingEllipseM(b, 9, 22, 4, 3.5, Wn, { edge: true });
      wingEllipseM(b, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    wingEllipseM(b, 6.5, 13, 5.5, 5, Wn, { edge: true });                                       // upper wings
    wingEllipseM(b, 8, 22, 4, 3.5, Wn, { edge: true });                                         // lower wings
    wingEllipseM(b, 5.5, 12, 1.8, 1.5, '#ffb4dc');                                              // wing spots
    earA.rect(12, 2, 1, 4, OUTLINE); earB.rect(19, 2, 1, 4, OUTLINE);                           // antennae
    earA.px(12, 1, '#ffe066').px(11, 1, '#ffe066').px(12, 0, '#ffe066'); earB.px(19, 1, '#ffe066').px(20, 1, '#ffe066').px(19, 0, '#ffe066');
    b.ellipse(16, 23, 5, 5.5, B, { edge: true });                                               // body
    skirt();                                                                                    // skirt
    h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });                                             // head
    h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk);         // bow
    h.px(16, 8, '#c83a7a');
    rigEyes(h, Q, 32, 12, 12, 2, () => h.eyes(12, 12, '#6a2a5a'));
    h.ellipseM(10, 16, 1.5, 1, '#ff8ab8');                                                      // cheeks
    rigMouth(h, Q, 15, 17, 2, () => h.px(16, 17, OUTLINE));
  },
  // Voltergeist (r48, from the owner's pick): a crackling ball of black-violet static fur, two cold
  // glowing slit eyes, a jagged crack of light for a mouth (kept off a toothy grin on purpose), an
  // antenna with a glowing bulb, stubby feet, purple arcs flickering round it.
  voltergeist(g, v = 'front') {
    const F = P('#3a2a6a', '#24184a', '#5a46a0'), GLOW = '#e8f4ff', ARC = '#c8a8ff', CRACK = '#bfefff', FT = P('#24184a', '#160e30', '#3a2a6a');
    const { Q, b, h, t, earA } = rigParts(g, v);
    const ball = cx => {   // a spiky ball of static fur
      const pts = [];
      for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 9.5 : 12.2 + ((i * 7) % 3) * 0.4; pts.push([cx + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.92]); }
      b.poly(pts, F, { edge: true });
      b.ellipse(cx - 2, 14.5, 6, 4, F.l);                                                         // a sheen on the fur
      b.px(cx - 7, 20, ARC).px(cx - 6, 19, ARC).px(cx - 5, 20, ARC); b.px(cx + 5, 24, ARC).px(cx + 6, 23, ARC);   // static in the fur
    };
    const feet = (a, c) => { b.ellipse(a, 29.5, 2.6, 1.4, FT, { edge: true }); b.ellipse(c, 29.5, 2.6, 1.4, FT, { edge: true }); };
    const antenna = x => { earA.rect(x, 2, 1, 5, OUTLINE); earA.ellipse(x + 0.5, 1.8, 1.8, 1.8, P('#fff6c0', '#e0c060', '#ffffff')); };
    const sparks = () => { t.px(3, 12, ARC).px(4, 11, ARC).px(4, 13, ARC); t.px(28, 21, ARC).px(29, 20, ARC).px(28, 22, ARC); };   // arcs that sway like a tail
    if (v === 'side') {
      feet(13, 19); antenna(16); ball(15); sparks();
      rigEye(h, Q, 20, 15, () => h.poly([[19, 15], [25, 16], [24, 17], [19, 16]], GLOW), 4);
      rigMouth(h, Q, 20, 20, 3, () => h.px(20, 21, CRACK).px(21, 20, CRACK).px(22, 21, CRACK).px(23, 20, CRACK).px(24, 21, CRACK));
      return;
    }
    if (v === 'back') { feet(12, 20); antenna(16); ball(16); sparks(); return; }
    feet(12, 20);
    antenna(17);
    ball(16);
    sparks();
    rigEyes(h, Q, 32, 9, 14, 5, () => h.polyM([[9, 14], [15, 16], [14, 17], [9, 15]], GLOW));     // cold glowing slits
    rigMouth(h, Q, 12, 20, 8, () => { for (let x = 11; x <= 21; x++) h.px(x, x % 2 ? 21 : 20, CRACK); });   // a jagged crack of light
  },
  // Coilizard (r48, from the owner's pick): a lime-green gecko crouched low like a predator, a wedge
  // head with big golden slit eyes on the sides, copper zigzag stripes, splayed sticky toes, and a
  // tail coiled like a metal spring with a glowing blue core.
  coilizard(g, v = 'front') {
    const G = P('#9ad84a', '#64a02a', '#cff48a'), BL = '#e8f4c0', Cu = '#c8702a', M = P('#c8d0dc', '#8a94a8', '#f0f4fa'), BAND = '#5a6478', CORE = '#7ae8ff', EYE = '#ffc020';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const coil = (cx, cy) => { t.ellipse(cx, cy, 5, 5, M, { edge: true }); t.ellipse(cx, cy, 3.2, 3.2, BAND); t.ellipse(cx, cy, 2.2, 2.2, M); t.ellipse(cx, cy, 1.2, 1.2, CORE); t.px(cx - 4, cy - 1, BAND).px(cx + 3, cy - 4, BAND).px(cx + 4, cy + 2, BAND); };
    const zig = (p, x0, y, n) => { for (let i = 0; i < n; i++) p.px(x0 + i, y + (i % 2), Cu); };
    if (v === 'side') {
      t.ellipse(6, 20, 1.8, 3, M, { edge: true });                                               // tail rising into the coil
      coil(6, 13);
      legA.ellipse(8, 26, 2, 1.4, G.s); legB.ellipse(18, 26, 2, 1.4, G.s);                       // far legs
      b.ellipse(14, 22.5, 9, 3.6, G, { edge: true });                                            // long, low body
      b.ellipse(15, 24.5, 6, 1.4, BL);
      zig(b, 8, 19, 12);                                                                         // copper stripe down the back
      legB.ellipse(10.5, 27, 2.4, 1.6, G, { edge: true }); legA.ellipse(20.5, 27, 2.4, 1.6, G, { edge: true });   // near legs
      legB.px(9, 28, BL).px(12, 28, BL); legA.px(19, 28, BL).px(22, 28, BL);                     // sticky toe pads
      h.poly([[20, 18], [23, 15], [28, 16], [30, 19], [25, 22], [20, 22]], G, { edge: true });  // wedge head
      h.ellipse(26, 21, 3, 1, BL);
      rigEye(h, Q, 23, 16, () => { h.ellipse(24, 17, 2, 2, EYE, { edge: true }); h.rect(24, 16, 1, 3, DARK_EYE); h.px(23, 16, '#ffffff'); }, 3);
      rigMouth(h, Q, 25, 20, 4, () => h.rect(25, 20, 5, 1, OUTLINE));
      return;
    }
    if (v === 'back') {
      legA.ellipse(8, 26, 3, 2, G, { edge: true }); legB.ellipse(24, 26, 3, 2, G, { edge: true });
      b.ellipse(16, 22, 7, 5, G, { edge: true });
      for (let y = 18; y < 26; y += 2) b.px(15, y, Cu).px(16, y + 1, Cu).px(17, y, Cu);         // zigzag down the spine
      h.ellipse(16, 15.5, 5, 3.5, G, { edge: true });
      h.ellipseM(11.5, 15, 1.4, 1.6, EYE);                                                        // eyes peeking out at the sides
      coil(16, 8);
      return;
    }
    t.ellipse(21, 18, 2, 2, M, { edge: true });                                                  // tail rising behind into the coil
    coil(24, 12);
    legA.ellipse(8, 26, 3, 2, G, { edge: true }); legB.ellipse(24, 26, 3, 2, G, { edge: true });   // splayed front legs
    legA.px(6, 27, BL).px(9, 27, BL); legB.px(22, 27, BL).px(25, 27, BL);                         // sticky toe pads
    b.ellipse(16, 23, 7, 4.5, G, { edge: true });                                                // low body
    b.ellipse(16, 24.5, 4, 2.4, BL);
    zig(b, 11, 20, 3); zig(b, 19, 20, 3);
    h.poly([[8, 18], [11, 13], [16, 10], [21, 13], [24, 18], [16, 21]], G, { edge: true });     // a wedge of a head
    h.ellipse(16, 19, 4, 1.5, BL);
    zig(h, 14, 12, 5);                                                                           // copper crest
    rigEyes(h, Q, 32, 7, 15, 4, () => { h.ellipseM(9, 16, 2.4, 2.4, EYE, { edge: true }); h.rectM(9, 15, 1, 3, DARK_EYE); h.pxM(8, 15, '#ffffff'); });   // big golden slit eyes, low on the sides
    rigMouth(h, Q, 13, 18, 6, () => h.rect(12, 18, 8, 1, OUTLINE));
  },
  // Bellpaca (r48, from the owner's pick): a tall, calm alpaca of thick cream wool, a woolly tuft
  // over its half-lidded eyes, and a brass bell on a red collar glowing electric blue, lighting its
  // chest. A quiet guardian.
  bellpaca(g, v = 'front') {
    const W = P('#f4ead2', '#d6c6a0', '#ffffff'), MZ = '#ece0c4', HOOF = '#5a4a3a', COL = '#a83030', BELL = P('#e0b048', '#a07828', '#fff0a0'), GLOW = '#9af0ff';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 3, 5, W.s); p.rect(x, 29, 3, 1, HOOF); };
    const bell = (x, y) => { b.ellipse(x, y - 1, 3, 2, '#d8fcff'); b.ellipse(x, y + 0.5, 1.6, 1.8, BELL, { edge: true }); b.px(x, y + 2, GLOW); };
    if (v === 'side') {
      leg(legA, 8); leg(legB, 17);
      t.ellipse(6, 19, 1.6, 1.6, W, { edge: true });                                             // tail tuft
      b.ellipse(13, 21, 8, 5.5, W, { edge: true });
      b.ellipse(19, 13, 2.8, 6.5, W, { edge: true });                                            // long neck
      b.rect(17, 15, 5, 1, COL);
      bell(20, 17);
      leg(legB, 10); leg(legA, 19);
      earA.poly([[19, 3], [19, -1], [21, 2]], W, { edge: true });
      h.ellipse(21, 6, 3.5, 3, W, { edge: true }); h.ellipse(24, 7.5, 2, 1.5, MZ, { edge: true });   // head, snout
      h.ellipse(20, 3.5, 3, 1.6, W.l, { edge: true });                                           // woolly tuft
      rigEye(h, Q, 21, 5, () => { h.rect(21, 5, 2, 1, OUTLINE); h.px(22, 6, '#3a2a1a'); });    // half-lidded stare
      rigMouth(h, Q, 24, 9, 2, () => h.px(25, 9, OUTLINE));
      return;
    }
    if (v === 'back') {
      leg(legA, 10); leg(legB, 19);
      b.ellipse(16, 21, 8, 5.5, W, { edge: true }); b.ellipse(9, 20, 2.5, 2.5, W); b.ellipse(23, 20, 2.5, 2.5, W);
      b.ellipse(16, 13, 3.5, 6, W, { edge: true });
      earA.poly([[11, 4], [11, 0], [13, 3]], W, { edge: true }); earB.poly([[21, 4], [21, 0], [19, 3]], W, { edge: true });
      h.ellipse(16, 6, 4, 3.5, W, { edge: true }); h.ellipse(16, 3, 3.5, 2, W.l, { edge: true });
      t.ellipse(16, 23, 1.6, 1.6, W, { edge: true });
      return;
    }
    leg(legA, 10); leg(legB, 19);                                                                // legs
    t.ellipse(24, 20, 1.5, 1.5, W, { edge: true });                                              // tail tuft
    b.ellipse(16, 21, 8, 5.5, W, { edge: true }); b.ellipse(9, 20, 2.5, 2.5, W); b.ellipse(23, 20, 2.5, 2.5, W);   // thick fluffy body
    b.ellipse(16, 13, 3.5, 6, W, { edge: true });                                                // long neck
    b.rect(13, 15, 6, 1, COL);                                                                   // red collar
    bell(16, 17);                                                                                // brass bell, glowing blue
    earA.poly([[11, 4], [11, 0], [13, 3]], W, { edge: true }); earB.poly([[21, 4], [21, 0], [19, 3]], W, { edge: true });
    h.ellipse(16, 6, 4, 3.5, W, { edge: true });                                                 // head
    h.ellipse(16, 3, 3.5, 2, W.l, { edge: true });                                               // woolly tuft
    rigEyes(h, Q, 32, 13, 6, 2, () => { h.rectM(13, 6, 2, 1, OUTLINE); h.pxM(13, 7, '#3a2a1a'); });   // calm, half-lidded eyes
    h.ellipse(16, 8.5, 1.8, 1.2, MZ);
    rigMouth(h, Q, 15, 9, 2, () => h.px(16, 9, OUTLINE));
  },
  // Smouldox (r48, from the owner's pick): a hulking charcoal calf with a heap of glowing coals on
  // its back, an ember glow from its belly, small horns, eyes like embers, head held low, smoke
  // curling off it.
  smouldox(g, v = 'front') {
    const K = P('#3a3236', '#221c20', '#5a5056'), CO = P('#2a2226', '#140e12', '#4a3e44'), MZ = P('#6a5a5a', '#4a3e3e', '#8a7a78'), HN = '#9a9098';
    const EMB = '#ff7a1c', HOT = '#ffd34a', EYE = '#ff9a3a', HOOF = '#141012', SMOKE = '#8a8088';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const coals = pts => { for (const [x, y] of pts) { b.ellipse(x, y, 2, 1.6, CO, { edge: true }); b.px(x, y, EMB); b.px(x - 1, y + 1, HOT); } };
    const smoke = pts => { for (const [x, y] of pts) t.px(x, y, SMOKE); };
    const leg = (p, x) => { p.ellipse(x, 27.5, 2.4, 2.6, K, { edge: true }); p.ellipse(x, 30, 2.4, 1, HOOF); };
    if (v === 'side') {
      t.rect(4, 18, 1, 4, K.s); t.ellipse(4, 23, 1.5, 1.5, K, { edge: true });                  // thin tail with a tuft
      leg(legA, 8); leg(legB, 18);
      b.ellipse(14, 21, 10, 6, K, { edge: true });
      b.ellipse(15, 26, 6, 1.4, EMB);                                                            // ember glow underneath
      coals([[8, 15], [12, 14], [16, 14.5], [19, 16]]);
      leg(legB, 10.5); leg(legA, 20.5);
      earA.ellipse(21, 16, 2, 1.2, K, { edge: true });
      h.ellipse(24, 19, 4.5, 4, K, { edge: true });                                              // head held low
      h.poly([[22, 15], [23, 12], [24, 15]], HN);                                                // horn
      h.ellipse(27.5, 21, 2.4, 1.8, MZ, { edge: true });
      rigEye(h, Q, 24, 18, () => h.rect(24, 18, 2, 1, EYE));
      h.px(23, 17, OUTLINE).px(24, 17, OUTLINE);
      h.px(28, 21, OUTLINE);
      rigMouth(h, Q, 26, 23, 2);
      smoke([[12, 10], [13, 8], [12, 6], [16, 9], [17, 7]]);
      return;
    }
    if (v === 'back') {
      leg(legA, 10.5); leg(legB, 21.5);
      b.ellipse(16, 21, 10, 6.5, K, { edge: true });
      coals([[10, 16], [14, 15], [18, 15], [22, 16], [12, 19], [20, 19], [16, 18]]);
      earA.ellipse(9.5, 13, 2, 1.2, K, { edge: true }); earB.ellipse(22.5, 13, 2, 1.2, K, { edge: true });
      h.ellipse(16, 13, 4, 2.5, K, { edge: true });
      h.poly([[12, 12], [11, 9], [13, 11]], HN); h.poly([[20, 12], [21, 9], [19, 11]], HN);
      t.rect(16, 23, 1, 4, K.s); t.ellipse(16.5, 27.5, 1.5, 1.5, K, { edge: true });
      return;
    }
    leg(legA, 10.5); leg(legB, 21.5);                                                            // sturdy legs, dark hooves
    b.ellipse(16, 21, 10, 6.5, K, { edge: true });                                               // hulking body
    b.ellipse(16, 25.5, 6, 1.6, EMB);                                                            // ember glow from the belly
    coals([[9, 15], [12.5, 13.5], [19.5, 13.5], [23, 15]]);                                      // the heap of coals on its back
    earA.ellipse(9.5, 14, 2, 1.2, K, { edge: true }); earB.ellipse(22.5, 14, 2, 1.2, K, { edge: true });
    h.poly([[11, 12], [10, 9], [12, 11]], HN); h.poly([[21, 12], [22, 9], [20, 11]], HN);       // small horns
    h.ellipse(16, 15.5, 5, 4.5, K, { edge: true });                                              // head held low
    h.ellipse(16, 19, 3, 2, MZ, { edge: true });                                                 // muzzle
    h.px(15, 19, OUTLINE).px(17, 19, OUTLINE);                                                   // nostrils
    rigEyes(h, Q, 32, 12, 15, 2, () => h.rectM(12, 15, 2, 1, EYE));                              // eyes like embers
    h.pxM(12, 14, OUTLINE).pxM(13, 14, OUTLINE);                                                 // a hard brow
    rigMouth(h, Q, 15, 21, 2);
  },
  // The siege turtle (the owner's pick, "A3 · visor helm"): a hulking green turtle with a gunmetal
  // fortress-turret shell (battlements, rivets, gold trim), a castle-gate helm with one glowing eye
  // behind the visor and a portcullis grille, and a water cannon for each forearm.
  garrishell(g, v = 'front') { // 44x44
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (p, x, y, w = 5, hh = 6) => p.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    // From behind (the owner's reference): a domed shell of gold-trimmed plates, a round turret on
    // top with battlements and a hatch, and a tail with an iron cuff.
    const backShell = cx => {
      b.ellipse(cx, 25, 15, 13, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                  // gold rim
      b.ellipse(cx, 25.5, 13.5, 11.5, M);                                                          // the dome
      b.rect(cx - 6, 16, 1, 20, GOLD); b.rect(cx + 6, 16, 1, 20, GOLD);                            // plate seams
      b.rect(cx - 13, 26, 27, 1, GOLD); b.rect(cx - 6, 20, 13, 1, GOLD); b.rect(cx - 6, 32, 13, 1, GOLD);
      for (const [x, y] of [[-10, 21], [-10, 30], [10, 21], [10, 30], [0, 17], [0, 35], [-6, 23], [6, 23], [-6, 29], [6, 29]]) b.px(cx + x, y, D.s);   // rivets
      b.px(cx - 3, 23, M.l).px(cx - 2, 22, M.l).px(cx + 2, 29, M.l).px(cx + 3, 28, M.l);           // shine
      b.px(cx - 10, 24, D.s).px(cx - 9, 23, D.s).px(cx + 9, 33, D.s).px(cx + 10, 32, D.s);         // battle scratches
      merlon(b, cx - 9, 2, 3, 4); merlon(b, cx - 2, 1, 4, 4); merlon(b, cx + 6, 2, 3, 4);          // back battlements
      b.poly([[cx - 10, 5], [cx + 10, 5], [cx + 10, 14], [cx - 10, 14]], M, { edge: true });       // the round tower
      b.ellipse(cx, 6, 9.5, 3.2, P(M.l, M.b, '#d4d8e0'));                                          // its round top
      b.ellipse(cx, 6, 4, 2, D, { edge: true }); b.rect(cx - 1, 6, 2, 1, D.l);                     // round hatch
      for (const x of [-9, 9]) b.rect(cx + x - (x > 0 ? 1 : 0), 8, 2, 6, M.s);                    // shading round the sides
      merlon(b, cx - 11, 4, 3, 5); merlon(b, cx + 8, 4, 3, 5);                                     // battlements at the sides
      b.rect(cx - 10, 13, 21, 1, GOLD);
      b.px(cx - 7, 10, D.s).px(cx, 10, D.s).px(cx + 7, 10, D.s);
    };
    const backTail = x => {
      t.poly([[x + 4, 33], [x + 8, 36], [x - 1, 42], [x - 5, 43]], S, { edge: true });           // tail, out from under the shell
      t.poly([[x + 2, 36], [x + 5, 37.5], [x + 3, 40], [x, 39]], D, { edge: true });             // iron cuff
    };
    if (v === 'side') {
      t.poly([[8, 33], [1, 38], [10, 37]], S, { edge: true });                                   // stubby tail
      legB.ellipse(20, 37, 4.5, 4.5, S, { edge: true }); legB.ellipse(21, 41, 5, 2.2, S, { edge: true });
      b.ellipse(14, 23, 13, 12, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                // domed shell, gold rim
      b.ellipse(14, 23.5, 11.5, 10.5, M);
      b.rect(9, 14, 1, 19, GOLD); b.rect(19, 14, 1, 19, GOLD); b.rect(3, 24, 23, 1, GOLD);         // plate seams
      for (const [x, y] of [[5, 19], [5, 29], [14, 18], [14, 30], [23, 19], [23, 29]]) b.px(x, y, D.s);
      b.px(12, 21, M.l).px(13, 20, M.l).px(6, 27, D.s).px(7, 26, D.s);
      merlon(b, 4, 3, 3, 5); merlon(b, 10, 2, 3, 4); merlon(b, 16, 2, 3, 4); merlon(b, 21, 3, 3, 5);   // the round turret's battlements
      b.poly([[5, 6], [23, 6], [23, 13], [5, 13]], M, { edge: true });                             // the turret
      b.ellipse(14, 6, 8.5, 2, P(M.l, M.b, '#d4d8e0'));
      b.rect(5, 12, 19, 1, GOLD); b.px(9, 9, D.s).px(14, 9, D.s).px(19, 9, D.s);
      armB.poly([[28, 19], [39, 19], [39, 24], [28, 24]], D, { edge: true });                   // far cannon
      b.ellipse(27, 26, 8, 9, S, { edge: true });                                                // body
      b.ellipse(31, 27, 3, 7, C);                                                                // plastron
      b.rect(29, 24, 4, 1, C.s); b.rect(29, 29, 4, 1, C.s);
      legA.ellipse(26, 37, 5, 5, S, { edge: true }); legA.ellipse(28, 41, 6, 2.4, S, { edge: true });   // near leg
      legA.px(32, 41, C.l).px(34, 41, C.l);                                                      // claws
      h.poly([[22, 7], [29, 3], [35, 6], [37, 10], [37, 17], [24, 18], [21, 13]], M, { edge: true });   // helm
      h.rect(28, 3, 1, 7, M.l);                                                                  // crest ridge
      h.rect(30, 9, 7, 3, BORE);                                                                 // visor slit
      h.px(30, 10, S.s);
      rigEye(h, Q, 33, 9, () => { h.rect(33, 9, 3, 2, EYE); h.px(34, 9, HOT); }, 3);            // the glowing eye
      for (const x of [30, 32, 34, 36]) h.rect(x, 13, 1, 4, BORE);                               // portcullis grille
      h.px(24, 9, D.s).px(24, 15, D.s);
      armA.ellipse(26, 22, 4.5, 4.5, S, { edge: true });                                         // shoulder
      armA.poly([[25, 24], [39, 24], [39, 31], [25, 31]], D, { edge: true });                   // near cannon
      armA.rect(30, 24, 1, 7, GOLD); armA.rect(35, 24, 1, 7, GOLD);
      armA.ellipse(40, 27.5, 2, 4.2, M, { edge: true });                                         // muzzle
      armA.ellipse(40.5, 27.5, 1, 2.4, BORE); armA.px(41, 27, WET);
      return;
    }
    if (v === 'back') {
      armA.ellipse(5, 21, 4.5, 4.5, S, { edge: true }); armB.ellipse(39, 21, 4.5, 4.5, S, { edge: true });
      armA.poly([[1, 22], [9, 22], [9, 34], [1, 34]], D, { edge: true }); armB.poly([[35, 22], [43, 22], [43, 34], [35, 34]], D, { edge: true });
      armA.rect(1, 25, 8, 1, GOLD); armB.rect(35, 25, 8, 1, GOLD);
      armA.ellipse(5, 35, 4.5, 2.2, M, { edge: true }); armB.ellipse(39, 35, 4.5, 2.2, M, { edge: true });
      legA.ellipse(14, 38, 5, 4.5, S, { edge: true }); legB.ellipse(30, 38, 5, 4.5, S, { edge: true });
      legA.ellipse(14, 41, 5.5, 2.2, S, { edge: true }); legB.ellipse(30, 41, 5.5, 2.2, S, { edge: true });
      backShell(22);
      backTail(11);
      return;
    }
    merlon(b, 3, 4, 4); merlon(b, 9, 5, 4, 5); merlon(b, 31, 5, 4, 5); merlon(b, 37, 4, 4);       // battlements over the shoulders
    b.poly([[5, 14], [8, 9], [36, 9], [39, 14], [39, 30], [5, 30]], M, { edge: true });          // turret shell behind
    b.rect(5, 13, 34, 1, GOLD);
    b.pxM(7, 18, D.s); b.pxM(7, 25, D.s);
    legA.ellipse(14, 37, 5, 4.5, S, { edge: true }); legB.ellipse(30, 37, 5, 4.5, S, { edge: true });   // legs
    legA.ellipse(13, 41, 6, 2.4, S, { edge: true }); legB.ellipse(31, 41, 6, 2.4, S, { edge: true });   // feet
    legA.px(9, 42, C.l).px(12, 42, C.l).px(15, 42, C.l); legB.px(28, 42, C.l).px(31, 42, C.l).px(34, 42, C.l);   // claws
    b.ellipse(22, 26, 11, 9.5, S, { edge: true });                                               // body
    b.ellipse(22, 27, 7, 7.5, C);                                                                // plastron
    b.rect(16, 24, 12, 1, C.s); b.rect(16, 29, 12, 1, C.s); b.rect(21, 20, 1, 14, C.s);
    armA.ellipse(9, 21, 5, 5, S, { edge: true }); armB.ellipse(35, 21, 5, 5, S, { edge: true });     // shoulders
    armA.poly([[2, 23], [11, 23], [11, 34], [2, 34]], D, { edge: true });                       // the arm cannons
    armB.poly([[33, 23], [42, 23], [42, 34], [33, 34]], D, { edge: true });
    armA.rect(2, 26, 9, 1, GOLD); armB.rect(33, 26, 9, 1, GOLD);
    armA.ellipse(6.5, 35, 5, 3, M, { edge: true }); armB.ellipse(37.5, 35, 5, 3, M, { edge: true });   // muzzles, pointed at you
    armA.ellipse(6.5, 35, 3, 1.6, BORE); armB.ellipse(37.5, 35, 3, 1.6, BORE);
    armA.px(5, 35, WET); armB.px(37, 35, WET);
    h.poly([[15, 8], [18, 4], [26, 4], [29, 8], [30, 18], [14, 18]], M, { edge: true });         // castle-gate helm
    h.rect(21, 3, 2, 6, M.l);                                                                    // crest ridge
    h.rect(16, 10, 12, 3, BORE);                                                                 // visor slit
    h.rect(17, 11, 3, 1, S.s);                                                                   // skin in the shadow
    rigEye(h, Q, 23, 10, () => { h.rect(23, 10, 4, 2, EYE); h.px(24, 10, HOT); h.px(25, 10, HOT); }, 4);   // one huge glowing eye
    for (const x of [17, 19, 21, 23, 25, 27]) h.rect(x, 14, 1, 3, BORE);                         // portcullis grille
    h.px(16, 8, D.s).px(28, 8, D.s).px(15, 16, D.s).px(29, 16, D.s);                             // rivets
  },
};

// Diagonal views, facing right like 'side' (flipped by face for left):
// 'fside' = three-quarter front (heading down-right), 'bside' = three-quarter back
// (heading up-right). A monster without an entry here turns in 4 directions only.
const MONSTER_ART_DIAG = {
  smugshi(g, v) {
    const O = TOSHI.coat, C = TOSHI.white, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig();
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]), h = part(g, R.head[0], R.head[1]);
    const ear = i => part(g, R.head[0] - (R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]), earA = ear(0), earB = ear(1);
    const legA = part(g, R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, R.legs[1] ? 1 : 0, -R.legs[1]);
    if (v === 'bside') {
      legA.ellipse(11, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(19, 28, 2, 2.8, C, { edge: true });   // white hind legs
      b.ellipse(15, 22, 7.5, 6, O, { edge: true });
      b.ellipse(13, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[10, 9], [10, 0], [16, 5]], O, { edge: true });                                 // big upright ears
      earB.poly([[19, 6], [23, 0], [25, 7]], O, { edge: true });
      b.ellipse(17, 18, 6.5, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(18, 11.5, 8, 6.2, O, { edge: true });
      h.ellipse(24.5, 14, 1.8, 1.8, C); h.ellipse(25.5, 12.5, 1.4, 1.4, C);                      // cheek and muzzle peeking out
      t.ellipse(13, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(13, 18.5, 3, 2.6, C); t.px(13, 18, O.s); t.px(14, 18, O.s);
      return;
    }
    t.ellipse(8, 17, 4.5, 4.5, O, { edge: true });                                               // curled tail behind him
    t.ellipse(7.5, 16.5, 3.2, 3.2, C); t.px(7, 16, O.l); t.px(8, 17, O.s);
    legB.ellipse(9, 26.5, 1.8, 2.8, P(C.s, '#cbbba4', C.b));                                     // hind leg
    b.ellipse(14, 22, 8, 6, O, { edge: true });                                                  // body
    b.ellipse(18.5, 23, 4.5, 5.5, C);                                                            // white chest
    legB.ellipse(15, 27.5, 2.2, 3.2, C, { edge: true }); legA.ellipse(21, 27.5, 2.2, 3.2, C, { edge: true });   // white front legs
    legB.px(14, 30, C.s); legA.px(20, 30, C.s);
    earA.poly([[9, 10], [9, 0], [15, 5]], O, { edge: true });                                    // near ear
    earA.poly([[10.3, 8], [10.3, 2.5], [13.5, 5.3]], PINK); earA.px(11, 4, C.b);
    earB.poly([[20, 7], [24, 0], [26, 7]], O, { edge: true });                                   // far ear
    earB.poly([[21.5, 6], [23.6, 2.5], [24.6, 6]], PINK);
    h.ellipse(17.5, 12, 8, 6.5, O, { edge: true });                                              // head
    h.ellipse(12.5, 14.8, 2.6, 2.4, C); h.ellipse(23, 14.5, 1.6, 2, C);                          // white cheeks
    h.ellipse(20, 15.6, 4.4, 3, C);                                                              // white muzzle, turned his way
    h.rect(16, 17, 7, 3, C.b); h.rect(15, 18, 8, 2, C.b);                                        // white throat into the chest
    h.rect(13, 9, 2, 1, C.b); h.rect(21, 9, 2, 1, C.b);                                          // pale eyebrow spots
    rigEye(h, R, 13, 11, () => { h.rect(12, 11, 4, 1, OUTLINE); h.rect(13, 12, 2, 1, DARK_EYE); });   // smug lids
    rigEye(h, R, 21, 11, () => { h.rect(20, 11, 3, 1, OUTLINE); h.rect(21, 12, 2, 1, DARK_EYE); });
    h.rect(21, 13, 2, 2, OUTLINE); h.px(21, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'roar') { h.rect(18, 16, 6, 3, OUTLINE); h.px(20, 18, TONGUE).px(21, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(19, 16, 4, 2, OUTLINE); h.px(20, 17, TONGUE).px(21, 17, TONGUE); }
    else h.px(19, 17, OUTLINE).px(20, 17, OUTLINE).px(21, 17, OUTLINE).px(22, 17, OUTLINE).px(23, 16, OUTLINE);   // flat mouth, smug corner
  },

  cinderox(g, v) {
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const mane = () => {
      h.poly([[9, 15], [11, 2], [16, 11]], F); h.poly([[14, 11], [18, 0], [22, 11]], F); h.poly([[20, 11], [25, 2], [26, 15]], F);
      h.poly([[13, 8], [18, 3], [23, 8], [18, 11]], '#ffd34a');
    };
    if (v === 'bside') {
      t.poly([[6, 20], [2, 18], [6, 23]], F);                                                    // flank flame
      b.ellipse(15, 21, 10, 7, B, { edge: true });
      legB.ellipse(10, 28, 3, 2, B, { edge: true }); legA.ellipse(20, 28.5, 3, 2, B, { edge: true });
      h.ellipse(18, 14, 7, 6, B, { edge: true });
      h.ellipse(24.5, 16.5, 1.6, 1.4, C);                                                        // muzzle peeking out
      mane();
      t.rect(12, 22, 2, 5, '#1f3054'); t.ellipse(12.5, 27.5, 1.6, 1.6, '#ff7a1c');               // tail
      return;
    }
    mane();
    t.poly([[6, 20], [1, 18], [6, 23]], F);                                                      // flank flame
    b.ellipse(14, 21, 10, 7, B, { edge: true });
    b.ellipse(17, 24, 6.5, 4.5, C);                                                              // belly
    h.ellipse(18, 14, 7, 6, B, { edge: true });
    h.ellipse(20.5, 17, 4, 2.5, C);                                                              // muzzle, turned his way
    legB.ellipse(11, 28, 3, 2, C, { edge: true }); legA.ellipse(20, 28.5, 3, 2, C, { edge: true });
    rigEye(h, Q, 13, 13, () => { h.rect(13, 13, 3, 1, OUTLINE); h.px(15, 14, '#ff5a2a'); }, 3);  // narrow eyes
    rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 1, OUTLINE); h.px(22, 14, '#ff5a2a'); });
    rigMouth(h, Q, 20, 16, 3, () => h.px(20, 16, OUTLINE).px(22, 16, OUTLINE));
  },

  tidalisk(g, v) {
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'bside') {
      t.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                   // tail fin
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      b.ellipse(17, 19, 6, 8, B, { edge: true });
      h.ellipse(18, 10, 7, 5.5, B, { edge: true });
      h.ellipse(24, 12, 1.6, 1.4, C);                                                            // snout peeking out
      earB.poly([[12, 9], [4, 4], [10, 13]], Fn); earA.poly([[23, 8], [30, 3], [25, 12]], Fn);   // head fins
      h.poly([[16, 6], [18, 0], [21, 6]], Fn);
      for (const y of [13, 16, 19, 22]) b.rect(16, y, 2, 2, '#7ab4ff');                          // spine spots
      return;
    }
    t.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                     // tail fin
    h.poly([[16, 6], [18, 0], [21, 6]], Fn);                                                     // crest
    earB.poly([[11, 9], [3, 4], [8, 13]], Fn); earA.poly([[23, 8], [29, 4], [25, 12]], Fn);     // head fins
    g.ellipse(15, 26, 12, 4.5, B, { edge: true });                                               // coil
    b.ellipse(17, 19, 6, 8, B, { edge: true });                                                  // neck
    b.ellipse(18.5, 21, 3, 6, C);                                                                // belly
    h.ellipse(18, 10, 7, 5.5, B, { edge: true });                                                // head
    h.ellipse(20.5, 13, 4, 2, C);                                                                // snout, turned its way
    rigEye(h, Q, 14, 9, () => { h.rect(14, 9, 2, 3, DARK_EYE); h.px(14, 9, '#ffffff'); });
    rigEye(h, Q, 21, 9, () => { h.rect(21, 9, 2, 3, DARK_EYE); h.px(21, 9, '#ffffff'); });
    rigMouth(h, Q, 19, 13, 3);
    g.px(9, 26, '#7ab4ff'); g.px(6, 25, '#7ab4ff');
  },

  smugshogun(g, v) {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    if (v === 'bside') {
      legB.ellipse(16, 40, 3.5, 2.2, C, { edge: true }); legA.ellipse(28, 40, 3, 2, C, { edge: true });
      b.ellipse(21, 31, 10, 8.5, O, { edge: true });
      t.poly([[11, 23], [31, 23], [35, 40], [7, 40]], R, { edge: true });                       // the cape
      t.rect(8, 39, 26, 1, Gd);
      b.ellipse(12, 23, 3, 2, C); b.ellipse(32, 23.5, 2, 1.6, C);                                // ruff peeking out
      earB.poly([[13, 12], [12, 1], [20, 8]], O, { edge: true }); earA.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true });
      h.ellipse(23, 15, 11, 8.5, O, { edge: true });
      h.ellipse(33.5, 18.5, 1.8, 2, C);                                                          // muzzle peeking out
      h.rect(12, 9, 22, 2, Wb.b); h.rect(12, 10, 22, 1, Wb.s);
      h.rect(17, 9, 4, 3, Wb.l);                                                                 // headband knot
      tails.poly([[18, 11], [14, 21], [17, 20]], Wb, { edge: true }); tails.poly([[20, 11], [24, 21], [21, 20]], Wb, { edge: true });
      t.ellipse(20, 30, 6, 5.5, O, { edge: true });                                              // curled tail
      t.ellipse(20, 29.5, 3.2, 2.8, C); t.px(20, 29, O.s); t.px(21, 29, O.s);
      return;
    }
    t.ellipse(8, 25, 6.5, 6.5, O, { edge: true });                                               // tail
    t.ellipse(7.5, 24.5, 3.5, 3.5, C); t.px(8, 24, O.s);
    t.poly([[9, 23], [31, 23], [34, 40], [4, 40]], R, { edge: true });                           // cape behind
    t.rect(4, 39, 4, 1, Gd); t.rect(30, 39, 4, 1, Gd);
    legB.ellipse(17, 40, 3.5, 2.2, C, { edge: true }); legA.ellipse(29, 40, 3, 2, C, { edge: true });  // white socks
    b.ellipse(21, 31, 10, 8.5, O, { edge: true });
    b.ellipse(24, 33, 6, 6.5, C);                                                                // cream chest
    b.ellipse(23, 24, 9.5, 4, C, { edge: true });                                                // neck ruff
    b.ellipse(25, 24.5, 2, 2, Gd); b.px(25, 24, '#a87a1a');                                      // gold clasp
    earB.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[13.5, 10], [12.5, 4], [17, 8]], C.b);
    earA.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true }); earA.poly([[28.5, 8.5], [31.5, 3.5], [32.5, 9]], C.b);
    h.ellipse(23, 15, 11, 8.5, O, { edge: true });
    h.ellipse(26, 19.5, 7, 4.5, C);                                                              // muzzle, turned his way
    h.ellipse(15, 18, 2.2, 1.8, C); h.ellipse(32.5, 18, 1.5, 1.5, C);
    h.rect(12, 9, 22, 2, Wb.b); h.rect(12, 10, 22, 1, Wb.s);                                     // headband
    h.ellipse(26, 9.5, 1.8, 1.4, '#c8303a');
    tails.poly([[13, 9], [3, 6], [5, 13]], Wb, { edge: true });                                  // its tails, flying back
    h.px(17, 12, C.b); h.px(18, 12, C.b); h.px(28, 12, C.b); h.px(29, 12, C.b);                  // eyebrow spots
    rigEye(h, Q, 16, 14, () => { h.rect(16, 14, 5, 1, OUTLINE); h.rect(17, 15, 3, 1, DARK_EYE); }, 5);   // smug lids
    rigEye(h, Q, 27, 14, () => { h.rect(27, 14, 4, 1, OUTLINE); h.rect(28, 15, 2, 1, DARK_EYE); }, 4);
    h.rect(26, 17, 3, 2, OUTLINE);                                                               // nose
    rigMouth(h, Q, 25, 21, 4, () => h.px(25, 22, OUTLINE).px(26, 22, OUTLINE).px(27, 22, OUTLINE).px(28, 21, OUTLINE));   // smirk
  },

  infernox(g, v) {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) { b.px(x, y, L); b.px(x + 1, y + 1, Gl); } };
    const horns = () => {
      h.poly([[17, 16], [8, 13], [4, 5], [7, 4], [10, 10], [18, 12]], H, { edge: true });
      h.poly([[31, 16], [38, 13], [41, 5], [38, 4], [36, 10], [30, 12]], H, { edge: true });
    };
    const mane = () => {
      h.poly([[10, 20], [12, 4], [18, 14]], F); h.poly([[16, 13], [20, 1], [24, 11]], F);
      h.poly([[24, 11], [28, 1], [32, 13]], F); h.poly([[30, 14], [36, 4], [38, 20]], F);
    };
    if (v === 'bside') {
      legB.ellipse(13, 39, 4, 3, Rk, { edge: true }); legA.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });
      b.ellipse(21, 30, 13, 9, B, { edge: true });
      cracks([[13, 30], [27, 28], [17, 34], [25, 34]]);
      b.ellipse(9, 25, 6, 5, Rk, { edge: true }); b.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); cracks([[8, 24], [34, 25]]);
      h.ellipse(24, 18, 9, 7.5, B, { edge: true });
      h.ellipse(33, 22, 2, 2, C);                                                                // muzzle peeking out
      horns();
      mane(); h.poly([[17, 13], [24, 6], [31, 13], [24, 17]], Gl);                               // blazing mane
      b.poly([[17, 34], [21, 21], [25, 34]], F); b.poly([[19, 32], [21, 25], [23, 32]], Gl);    // flames down the spine
      t.rect(15, 37, 2, 4, '#16224a'); t.ellipse(15, 41, 1.8, 1.8, F);                           // tail
      return;
    }
    mane(); h.poly([[17, 12], [24, 5], [31, 12], [24, 16]], Gl);                                 // blazing mane
    t.poly([[7, 30], [1, 25], [3, 32]], B); t.ellipse(2, 24, 2, 2.4, F);                         // tail, flame tip
    legB.ellipse(13, 39, 4, 3, Rk, { edge: true }); legA.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });   // hooves
    legB.px(12, 41, L); legB.px(14, 41, L); legA.px(30, 41, L);
    b.ellipse(21, 30, 13, 9, B, { edge: true });                                                 // body
    b.ellipse(24, 33, 8, 5.5, C);                                                                // belly
    cracks([[10, 32], [30, 31], [12, 35]]);
    b.ellipse(9, 25, 6, 5, Rk, { edge: true }); b.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); // shoulder armour
    cracks([[7, 24], [34, 24], [9, 27]]);
    horns();
    h.ellipse(24, 18, 10, 8, B, { edge: true });                                                 // head
    h.ellipse(26, 23, 7, 3.5, C, { edge: true });                                                // broad muzzle, turned his way
    h.rect(23, 23, 2, 1, OUTLINE); h.rect(28, 23, 2, 1, OUTLINE);                                // nostrils
    rigMouth(h, Q, 24, 25, 4);
    h.ellipse(26, 27, 2.2, 1.4, '#ffd23f'); h.px(26, 26, '#a87a1a');                             // nose ring
    h.rect(16, 15, 6, 1, OUTLINE); h.rect(27, 15, 5, 1, OUTLINE);                                // heavy brows
    rigEye(h, Q, 17, 16, () => { h.rect(17, 16, 4, 2, Gl); h.rect(19, 16, 2, 2, '#ffffff'); }, 4);   // glowing eyes
    rigEye(h, Q, 28, 16, () => { h.rect(28, 16, 3, 2, Gl); h.rect(28, 16, 2, 2, '#ffffff'); }, 3);
  },

  maelstrisk(g, v) {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const horns = () => { earB.poly([[17, 8], [12, 0], [19, 5]], H, { edge: true }); earA.poly([[28, 7], [32, 0], [30, 6]], H, { edge: true }); };
    t.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                     // tail fin
    if (v === 'bside') {
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      b.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                        // fin-wings
      b.poly([[31, 21], [41, 14], [39, 24], [33, 28]], Fn, { edge: true });
      b.ellipse(23, 27, 7.5, 10, B, { edge: true });
      h.ellipse(24, 13, 9, 7, B, { edge: true });
      h.ellipse(32.5, 15, 2, 2, C);                                                              // snout peeking out
      h.poly([[18, 16], [9, 20], [10, 21], [19, 17]], Wh); h.poly([[31, 16], [39, 19], [38, 20], [30, 17]], Wh);
      horns();
      h.poly([[21, 7], [24, 0], [27, 7]], Fn);
      for (const y of [19, 24, 29, 34]) b.poly([[21, y], [23, y - 4], [25, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(21, 37, 18, 6, B, { edge: true });                                                 // coil
    for (const x of [9, 15, 28, 34]) g.rect(x, 39, 3, 1, '#1a3a8a');
    b.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                          // fin-wings
    b.poly([[30, 21], [39, 14], [38, 23], [33, 27]], Fn, { edge: true });
    b.ellipse(23, 27, 7.5, 10, B, { edge: true });                                               // neck
    b.ellipse(25, 29, 4, 8, C);                                                                  // belly scales
    for (const y of [23, 26, 29, 32, 35]) b.rect(22, y, 6, 1, '#cdbb88');
    h.poly([[21, 7], [24, 0], [27, 7]], Fn);                                                     // crest
    horns();
    h.ellipse(24, 13, 9, 7, B, { edge: true });                                                  // head
    h.ellipse(26.5, 17, 5.5, 3.5, C);                                                            // snout, turned its way
    h.poly([[21, 17], [12, 21], [13, 22], [22, 18]], Wh); h.poly([[31, 17], [38, 20], [37, 21], [30, 18]], Wh);   // whiskers
    rigEye(h, Q, 19, 11, () => { h.rect(19, 11, 2, 3, DARK_EYE); h.px(19, 11, '#ffffff'); });
    h.px(18, 9, OUTLINE).px(19, 9, OUTLINE).px(20, 10, OUTLINE).px(21, 10, OUTLINE);
    rigEye(h, Q, 28, 11, () => { h.rect(28, 11, 2, 3, DARK_EYE); h.px(28, 11, '#ffffff'); });
    h.px(30, 9, OUTLINE).px(29, 9, OUTLINE).px(28, 10, OUTLINE).px(27, 10, OUTLINE);
    rigMouth(h, Q, 25, 17, 4, () => { h.px(25, 17, OUTLINE); h.px(28, 17, OUTLINE); });
  },

  sparkit(g, v) {
    const T = P('#3fb8a8', '#25857a', '#7ae0d0'), C = P('#f4ecd6', '#d6c8a4', '#ffffff'), W = P('#f4fbff', '#b8d0d4', '#ffffff');
    const Cu = P('#e08a3a', '#a85a1e', '#ffc07a'), MASK = '#1e4a46', EYE = '#c8b0ff', SCAR = '#f0d0c8', PINK = '#f0a0a8';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const plug = (x, y) => { t.rect(x, y, 5, 4, Cu.b); t.rect(x, y + 3, 5, 1, Cu.s); t.rect(x, y - 3, 1, 3, '#ffd08a'); t.rect(x + 3, y - 3, 1, 3, '#ffd08a'); t.px(x + 1, y - 4, '#bff6ff'); t.px(x + 4, y - 5, '#bff6ff'); };
    const crest = () => h.poly([[11, 8], [12, 1], [14, 5], [17, 0], [20, 5], [22, 1], [23, 8]], W, { edge: true });
    if (v === 'bside') {
      legB.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(19.5, 27.5, 2, 2.4, T, { edge: true });
      legB.ellipse(12.5, 30, 2.4, 1.2, T.s); legA.ellipse(19.5, 30, 2.2, 1.1, T.s);
      b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });
      armB.ellipse(10.5, 18.5, 2, 2.2, T, { edge: true }); armA.ellipse(22, 18, 1.8, 2, T, { edge: true });
      earB.ellipse(11.5, 6.5, 2, 2, T, { edge: true }); earA.ellipse(22.5, 6.5, 1.8, 2, T, { edge: true });
      h.ellipse(17, 11, 6.5, 5, T, { edge: true });
      h.ellipse(23.5, 12.5, 1.4, 1.4, T, { edge: true });                                       // snout peeking out
      crest();
      t.ellipse(11, 25, 2, 2, T, { edge: true }); t.ellipse(7.5, 22, 2, 2.2, T, { edge: true }); t.ellipse(5.5, 18, 1.8, 2.2, T, { edge: true }); t.ellipse(5, 14, 1.6, 2, T, { edge: true });
      plug(2, 8);
      return;
    }
    t.ellipse(10, 24, 2, 2, T, { edge: true }); t.ellipse(7.5, 20.5, 1.8, 2.4, T, { edge: true }); t.ellipse(6.5, 16, 1.6, 2.2, T, { edge: true });   // tail behind, on the left
    plug(4, 9);
    legB.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
    legB.ellipse(12, 30, 2.4, 1.2, T, { edge: true }); legA.ellipse(20.5, 30, 2.6, 1.2, T, { edge: true });
    b.ellipse(15.5, 21, 5.5, 6.5, T, { edge: true });
    b.ellipse(17, 22.5, 3.2, 5, C);
    armB.ellipse(11, 18.5, 1.8, 2, T, { edge: true }); armA.ellipse(21.5, 18, 2, 2.2, T, { edge: true });
    earB.ellipse(11.5, 6.5, 1.8, 2, T, { edge: true }); earA.ellipse(22.5, 6.5, 2, 2, T, { edge: true });
    earB.px(11, 6, PINK); earA.px(22, 6, PINK);
    h.ellipse(17, 11, 6.5, 5, T, { edge: true });
    h.ellipse(19.5, 14, 2.8, 1.8, C);                                                            // muzzle, turned its way
    h.poly([[10, 9], [25, 10], [25, 13], [11, 13]], MASK);
    crest();
    rigEye(h, Q, 13, 10, () => { h.rect(13, 10, 2, 2, EYE); h.px(14, 11, DARK_EYE); h.px(13, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 2, EYE); h.px(22, 11, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(12, 9, OUTLINE).px(13, 9, OUTLINE).px(14, 10, OUTLINE); h.px(23, 9, OUTLINE).px(22, 9, OUTLINE).px(21, 10, OUTLINE);   // fierce brows
    h.px(23, 10, SCAR).px(24, 11, SCAR).px(23, 12, SCAR);                                        // scar
    h.px(20, 13, OUTLINE).px(21, 13, OUTLINE);
    rigMouth(h, Q, 19, 15, 2, () => h.px(19, 15, OUTLINE).px(20, 15, OUTLINE));
  },

  thornback(g, v) {
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const plates = pts => { for (const [x, y] of pts) { b.px(x, y, '#2a6b2a'); b.px(x + 1, y, '#2a6b2a'); b.px(x, y + 1, '#2a6b2a'); } };
    const leaves = () => { earB.poly([[9, 13], [5, 3], [13, 10]], L); b.poly([[14, 11], [17, 1], [20, 11]], L); earA.poly([[20, 12], [23, 3], [26, 11]], L); };
    if (v === 'bside') {
      leaves();
      legB.ellipse(8, 28, 3, 2.5, T, { edge: true }); legA.ellipse(22, 28.5, 3, 2.5, T, { edge: true });
      h.ellipse(26, 23, 3.5, 3.2, T, { edge: true });                                            // head, mostly hidden
      b.ellipse(16, 19, 12, 9, S, { edge: true });
      plates([[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]);
      t.poly([[9, 25], [6, 30], [11, 27]], T);                                                   // tail
      return;
    }
    t.poly([[4, 22], [0, 24], [4, 26]], T);                                                      // tail
    leaves();
    legB.ellipse(8, 28, 3, 2.5, T, { edge: true }); legA.ellipse(21, 28.5, 3, 2.5, T, { edge: true });
    b.ellipse(15, 19, 12, 9, S, { edge: true });
    plates([[9, 15], [15, 13], [20, 15], [11, 20], [17, 20]]);
    h.ellipse(20, 23.5, 5, 4.2, T, { edge: true });                                              // head, turned its way
    rigEye(h, Q, 18, 22, () => { h.rect(18, 22, 1, 2, DARK_EYE); h.px(18, 22, '#ffffff'); }, 1);
    rigEye(h, Q, 22, 22, () => { h.rect(22, 22, 1, 2, DARK_EYE); h.px(22, 22, '#ffffff'); }, 1);
    rigMouth(h, Q, 20, 25, 2, () => h.px(20, 25, OUTLINE).px(21, 25, OUTLINE));
  },

  slumbear(g, v) { // 44x44
    const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    earB.ellipse(13, 8, 3.5, 3.5, B); earA.ellipse(30, 7.5, 3, 3, B);                            // ears
    if (v === 'bside') {
      b.ellipse(22, 27, 17, 14, B, { edge: true });
      armB.ellipse(6, 27, 3.5, 6, B, { edge: true }); armA.ellipse(38, 27, 3, 5.5, B, { edge: true });
      h.ellipse(23, 14, 11, 8.5, B, { edge: true });
      h.ellipse(33.5, 16.5, 1.8, 2, C);                                                          // muzzle peeking out
      const D = P('#2a4c55', '#1f3a42', '#3f6f78');
      legB.ellipse(13, 41, 5, 2.5, D, { edge: true }); legA.ellipse(31, 41, 4.5, 2.3, D, { edge: true });
      t.ellipse(19, 36, 3, 3, C, { edge: true });                                                // stubby tail
      return;
    }
    b.ellipse(21, 27, 16.5, 14, B, { edge: true });
    b.ellipse(24, 31, 11, 10, C);                                                                // belly
    armB.ellipse(6, 27, 3.5, 6, B, { edge: true }); armA.ellipse(37, 27, 2.8, 5.5, B, { edge: true }); // arms
    h.ellipse(23, 14, 11, 8.5, B, { edge: true });
    h.ellipse(26, 16.5, 7, 5.5, C);                                                              // muzzle, turned its way
    rigEye(h, Q, 19, 14, () => h.rect(19, 14, 3, 1, OUTLINE), 3);                                // sleepy eyes
    rigEye(h, Q, 28, 14, () => h.rect(28, 14, 3, 1, OUTLINE), 3);
    rigMouth(h, Q, 24, 19, 4, () => { h.rect(24, 19, 4, 1, OUTLINE); h.px(23, 18, OUTLINE); h.px(28, 18, OUTLINE); });   // smile
    legB.ellipse(13, 41, 5, 2.5, C, { edge: true }); legA.ellipse(31, 41, 4.5, 2.3, C, { edge: true });
    legB.px(11, 41, OUTLINE).px(13, 41, OUTLINE).px(15, 41, OUTLINE); legA.px(30, 41, OUTLINE).px(32, 41, OUTLINE);
    earB.px(12, 7, '#2a4c55');
  },

  frostling(g, v) {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const ears = () => { earB.poly([[10, 10], [7, 1], [14, 8]], B); earA.poly([[19, 9], [23, 1], [24, 8]], B); };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
      h.ellipse(17, 14, 7.5, 6, B, { edge: true });
      h.poly([[23, 14], [26, 16], [23, 17]], B, { edge: true });                                 // snout peeking out
      h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
      t.ellipse(12, 21, 5, 7.5, Cr, { edge: true });                                             // fluffy tail
      return;
    }
    t.ellipse(7, 19, 5, 7.5, Cr);                                                                // fluffy tail
    ears();
    b.ellipse(15, 23, 6.5, 6, B, { edge: true });
    h.ellipse(17, 14, 7.5, 6, B, { edge: true });
    h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
    h.poly([[10, 17], [6, 20], [11, 20]], Cr);                                                   // cheek frost
    legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 3, '#1a3a5a'); h.px(14, 13, '#ffffff'); });
    rigEye(h, Q, 20, 13, () => { h.rect(20, 13, 2, 3, '#1a3a5a'); h.px(20, 13, '#ffffff'); });
    rigMouth(h, Q, 18, 17, 2, () => h.px(18, 17, OUTLINE).px(19, 17, OUTLINE));
  },

  drakorn(g, v) {
    const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const horns = () => { earB.poly([[12, 9], [8, 1], [14, 6]], C, { edge: true }); earA.poly([[20, 8], [23, 1], [24, 7]], C, { edge: true }); };
    const feet = () => { legB.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); legA.ellipse(19.5, 30, 2.3, 1.4, '#c45e1e'); };
    if (v === 'bside') {
      horns();
      b.ellipse(16, 23, 8, 7.5, O, { edge: true });
      feet();
      h.ellipse(17.5, 12, 7, 6, O, { edge: true });
      h.ellipse(24, 14, 1.6, 1.4, C);                                                            // snout peeking out
      t.poly([[13, 27], [17, 27], [11, 32]], O, { edge: true });                                 // tail
      for (const y of [8, 11, 17]) (y < 15 ? h : b).rect(16, y, 2, 1, '#c45e1e');
      wingPoly(b, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });                     // wings
      wingPoly(b, [[21, 18], [30, 6], [29, 19], [22, 23]], W, { edge: true });
      return;
    }
    wingPoly(b, [[9, 17], [0, 5], [2, 19]], W); wingPoly(b, [[21, 15], [29, 4], [27, 17]], W);   // wings
    t.poly([[10, 26], [1, 30], [8, 22]], O);                                                     // tail
    horns();
    b.ellipse(15, 23, 8, 7.5, O, { edge: true });
    b.ellipse(17.5, 25, 4.5, 5.5, C);
    h.ellipse(17.5, 12, 7, 6, O, { edge: true });
    h.ellipse(20, 15, 4, 2.2, C);                                                                // snout, turned its way
    rigEye(h, Q, 14, 10, () => { h.rect(14, 10, 2, 3, DARK_EYE); h.px(14, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);               // brows
    h.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    rigMouth(h, Q, 20, 15, 2, () => h.px(20, 15, OUTLINE).px(21, 15, OUTLINE));
    feet();
  },

  boulderon(g, v) { // 44x44
    const R = P('#8f8170', '#625747', '#b8aa96');
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) b.px(x, y, '#4e4436'); };
    earB.poly([[9, 17], [12, 5], [17, 14]], R, { edge: true });                                  // rocky spikes
    h.poly([[17, 13], [21, 2], [25, 13]], R, { edge: true });
    earA.poly([[24, 14], [30, 5], [32, 17]], R, { edge: true });
    if (v === 'bside') {
      b.ellipse(22, 26, 15, 14, R, { edge: true });
      armB.ellipse(6, 28, 5, 6, R, { edge: true }); armA.ellipse(37, 28, 4, 5.5, R, { edge: true });
      legB.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); legA.ellipse(29, 40, 4, 2.3, R, { edge: true });
      b.poly([[17, 26], [21, 18], [25, 26]], R, { edge: true }); b.poly([[18, 34], [21, 28], [24, 34]], R, { edge: true });
      cracks([[12, 22], [13, 23], [31, 30], [30, 31], [15, 33], [28, 20]]);
      return;
    }
    b.ellipse(21, 26, 15, 14, R, { edge: true });
    armB.ellipse(6, 28, 5, 6, R, { edge: true }); armA.ellipse(36, 28, 4, 5.5, R, { edge: true });   // arms
    legB.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); legA.ellipse(29, 40, 4, 2.3, R, { edge: true });
    rigEye(h, Q, 18, 22, () => { h.rect(18, 22, 2, 3, '#ffb02a'); h.px(18, 22, '#ffffff'); h.px(17, 20, OUTLINE).px(18, 20, OUTLINE).px(19, 21, OUTLINE).px(20, 21, OUTLINE); });
    rigEye(h, Q, 27, 22, () => { h.rect(27, 22, 2, 3, '#ffb02a'); h.px(27, 22, '#ffffff'); h.px(29, 20, OUTLINE).px(28, 20, OUTLINE).px(27, 21, OUTLINE).px(26, 21, OUTLINE); });
    rigMouth(h, Q, 22, 30, 6, () => { h.rect(22, 30, 6, 1, OUTLINE); h.px(21, 29, OUTLINE); h.px(28, 29, OUTLINE); });   // scowl
    cracks([[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [28, 33], [29, 34]]);
  },

  mindra(g, v) {
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const feet = () => { legB.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legA.ellipse(18.5, 29.5, 1.8, 1.1, '#9058b8'); };
    if (v === 'bside') {
      earB.poly([[10, 8], [5, 0], [13, 5]], B); earA.poly([[19, 7], [23, 0], [24, 6]], B);
      b.ellipse(16, 23, 5, 6.5, B, { edge: true });
      feet();
      h.ellipse(17, 12, 8, 7, B, { edge: true });
      t.poly([[12, 27], [20, 22], [17, 15], [22, 11], [15, 19], [18, 23], [11, 25]], B, { edge: true });   // tail
      return;
    }
    t.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);                                  // tail
    earB.poly([[10, 8], [5, 0], [13, 5]], B); earA.poly([[19, 7], [23, 0], [24, 6]], B);        // ears
    b.ellipse(15, 23, 5, 6.5, B, { edge: true });
    h.ellipse(17, 12, 8, 7, B, { edge: true });
    h.ellipse(18.5, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(18, 8, '#ffd0dc');                           // forehead gem
    rigEye(h, Q, 13, 11, () => { h.rect(13, 11, 2, 4, '#5a1a8a'); h.px(13, 11, '#ffffff'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 4, '#5a1a8a'); h.px(21, 11, '#ffffff'); });
    rigMouth(h, Q, 18, 16, 2, () => h.px(19, 16, OUTLINE));
    feet();
  },

  shadefang(g, v) {
    const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8'), RED = '#d2384a';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const ears = () => {
      earB.poly([[11, 10], [9, 1], [15, 7]], B); earB.px(10, 4, RED); earB.px(10, 5, RED);
      earA.poly([[19, 9], [22, 1], [24, 8]], B, { edge: true }); earA.px(22, 4, RED);
    };
    const feet = () => { legB.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legA.ellipse(19, 28.5, 2.3, 1.4, '#24203a'); };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 22, 8, 6.5, B, { edge: true });
      b.ellipse(17, 18, 6, 2, RED);
      h.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
      h.poly([[23, 13], [27, 15], [23, 17]], B, { edge: true });                                 // snout peeking out
      feet();
      t.poly([[11, 25], [16, 15], [19, 12], [16, 24]], B, { edge: true });                       // tail
      return;
    }
    t.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);                                            // tail
    ears();
    b.ellipse(15, 22, 8, 6.5, B, { edge: true });
    b.ellipse(17, 18, 6, 2, RED);                                                                // collar
    h.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
    h.ellipse(20, 16, 3.2, 2, G);                                                                // muzzle, turned its way
    rigEye(h, Q, 15, 12, () => { h.rect(15, 12, 2, 3, '#ff3a3a'); h.px(15, 12, '#ffffff'); });
    rigEye(h, Q, 21, 12, () => { h.rect(21, 12, 2, 3, '#ff3a3a'); h.px(21, 12, '#ffffff'); });
    h.px(14, 10, OUTLINE).px(15, 10, OUTLINE).px(16, 11, OUTLINE).px(17, 11, OUTLINE);           // angry brows
    h.px(23, 10, OUTLINE).px(22, 10, OUTLINE).px(21, 11, OUTLINE).px(20, 11, OUTLINE);
    rigMouth(h, Q, 20, 15, 2, () => h.px(20, 15, OUTLINE).px(21, 15, OUTLINE));
    feet();
  },

  lumawool(g, v) {
    const W = P('#3e4458', '#2a2e3e', '#5a627a'), Fc = P('#4a4c58', '#30323c', '#6a6c78'), H = P('#7a7e8a', '#4a4e5a', '#a8acb8');
    const LEG = '#2a2a34', HOOF = '#141418', BOLT = '#ffe066', GLOW = '#fff2a0';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 2, 5, LEG); p.rect(x, 29, 2, 1, HOOF); };
    const horn = (p, cx, cy) => { p.ellipse(cx, cy, 3, 3, H, { edge: true }); p.ellipse(cx, cy, 1.4, 1.4, H.s); p.px(cx, cy - 2, H.l); };
    const bolts = pts => { for (const [x, y] of pts) b.px(x, y, BOLT).px(x + 1, y - 1, BOLT).px(x + 2, y, BOLT); };
    leg(legB, 10); leg(legA, 20);
    for (const [x, y, r] of [[15.5, 21, 9], [8.5, 18, 4.5], [22.5, 18, 4], [11, 13, 4], [21, 13, 4], [16, 11, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });
    bolts([[8, 19], [20, 21], [14, 24]]);
    t.px(3, 15, BOLT).px(4, 14, BOLT).px(4, 16, '#bfe8ff'); t.px(28, 22, BOLT).px(29, 21, BOLT).px(28, 23, '#bfe8ff');
    horn(earB, 10, 11); horn(earA, 23, 11);
    if (v === 'bside') return;
    h.poly([[15, 11], [21, 11], [21, 19], [18.5, 21], [16, 19]], Fc, { edge: true });           // face, turned its way
    h.ellipse(18.5, 19, 2, 1.2, Fc.l);
    rigEye(h, Q, 15, 14, () => h.rect(15, 14, 2, 1, GLOW));
    rigEye(h, Q, 19, 14, () => h.rect(19, 14, 2, 1, GLOW));
    h.px(15, 13, OUTLINE).px(16, 13, OUTLINE); h.px(19, 13, OUTLINE).px(20, 13, OUTLINE);
    h.px(18, 18, OUTLINE).px(20, 18, OUTLINE);
    rigMouth(h, Q, 17, 20, 2);
  },

  brawlix(g, v) {
    const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a'), Q = rig(), TONGUE = '#e8607a';
    const b = part(g, 0, Q.body), h = part(g, Q.head[0], Q.head[1]), tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    const leg = i => part(g, Q.legs[i] ? 1 : 0, -Q.legs[i]), legA = leg(0), legB = leg(1);
    const arm = i => part(g, Q.arms[i], Q.body), armA = arm(0), armB = arm(1);
    const legs = () => { legB.ellipse(12, 29, 2.2, 2, T, { edge: true }); legA.ellipse(19.5, 29, 2, 1.9, T, { edge: true }); };
    if (v === 'bside') {
      legs();
      b.ellipse(16, 21, 6.5, 6, T, { edge: true });
      b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      armB.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armA.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
      armB.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armA.ellipse(25.5, 21, 3.2, 3.2, R, { edge: true });
      h.ellipse(17, 11, 6, 5.5, T, { edge: true });
      h.rect(11, 8, 12, 2, '#d23a3a');
      h.rect(15, 8, 2, 3, '#9a2222');                                                            // headband knot
      tails.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); tails.poly([[17, 10], [19, 16], [17, 15]], '#d23a3a');
      b.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                           // headband tails
    legs();
    b.ellipse(16, 21, 6.5, 6, T, { edge: true });
    b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    armB.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armA.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
    armB.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armA.ellipse(25, 20.5, 3.2, 3.2, R, { edge: true });   // gloves up
    h.ellipse(17, 11, 6, 5.5, T, { edge: true });
    h.rect(11, 8, 12, 2, '#d23a3a');
    for (const x of [14, 20]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 2, DARK_EYE); h.px(x, 11, '#ffffff'); });
    h.px(13, 9, OUTLINE).px(14, 9, OUTLINE).px(15, 10, OUTLINE).px(16, 10, OUTLINE);
    h.px(22, 9, OUTLINE).px(21, 9, OUTLINE).px(20, 10, OUTLINE).px(19, 10, OUTLINE);
    if (Q.mouth === 'roar') { h.rect(16, 14, 4, 2, OUTLINE); h.px(17, 15, TONGUE); } else if (Q.mouth === 'open') h.rect(17, 14, 2, 2, OUTLINE); else h.rect(17, 14, 2, 1, OUTLINE);
    b.rect(15, 19, 4, 1, '#a8703e');
  },

  galewing(g, v) {
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const crest = () => h.poly([[16, 7], [14, 0], [18, 4], [21, 0], [20, 7]], B);
    const feet = () => { legB.rect(13, 28, 2, 2, Y); legA.rect(19, 28, 2, 2, Y); };
    if (v === 'bside') {
      crest();
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      h.ellipse(18, 11, 6.5, 6, B, { edge: true });
      h.poly([[24, 11], [27, 12], [24, 14]], Y);                                                 // beak peeking out
      feet();
      t.poly([[11, 25], [13, 31], [16, 25]], B, { edge: true });                                 // tail
      wingPoly(b, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });          // wings
      wingPoly(b, [[20, 17], [31, 9], [30, 17], [22, 23]], Wg, { edge: true });
      FLAP || b.px(3, 13, '#a8b4e0'); FLAP || b.px(5, 18, '#a8b4e0'); FLAP || b.px(8, 16, '#a8b4e0'); FLAP || b.px(27, 14, '#a8b4e0');
      return;
    }
    t.poly([[12, 23], [1, 29], [5, 21]], B);                                                     // tail feathers
    wingPoly(b, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });             // spread wings
    wingPoly(b, [[22, 16], [30, 9], [29, 17], [24, 23]], Wg, { edge: true });
    FLAP || b.px(3, 13, '#a8b4e0'); FLAP || b.px(4, 18, '#a8b4e0');
    crest();
    b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
    b.ellipse(18, 22, 4.5, 5, '#f4f0e6');
    h.ellipse(18, 11, 6.5, 6, B, { edge: true });
    h.poly([[18, 13], [23, 13], [21, 17]], Y);                                                   // beak, turned its way
    rigEye(h, Q, 14, 10, () => { h.rect(14, 10, 2, 3, DARK_EYE); h.px(14, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);               // brows
    h.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    rigMouth(h, Q, 20, 14, 2);
    feet();
  },

  venomire(g, v) {
    const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const spots = pts => { for (const [x, y] of pts) { const p = ((x + 0.5 - 17) / 8) ** 2 + ((y + 0.5 - 17) / 9) ** 2 <= 1 ? b : g; p.px(x, y, S); p.px(x + 1, y, S); } };
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                               // slimy base
    earB.poly([[11, 10], [7, 2], [14, 8]], B); earB.px(7, 2, S); earB.px(8, 3, S);               // horns
    earA.poly([[20, 9], [24, 2], [23, 8]], B); earA.px(24, 2, S); earA.px(23, 3, S);
    b.ellipse(17, 17, 8, 9, B, { edge: true });
    if (v === 'bside') {
      spots([[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]]);
      return;
    }
    b.ellipse(19, 21, 4, 4.5, '#e4b8f4');                                                        // belly
    spots([[6, 25], [22, 27], [25, 23], [11, 20], [13, 10]]);
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 3, '#3a0a4a'); h.px(14, 13, '#ffffff'); });
    rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#3a0a4a'); h.px(21, 13, '#ffffff'); });
    rigMouth(h, Q, 17, 17, 4, () => { h.rect(17, 17, 4, 1, OUTLINE); h.px(18, 18, '#ffffff'); h.px(20, 18, '#ffffff'); });   // fanged grin
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },

  scarablade(g, v) {
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    h.poly([[17, 10], [17, 4], [16, 0], [20, 2], [21, 5], [21, 10]], Hn, { edge: true });        // great horn
    if (v === 'bside') {
      legB.ellipse(9, 28, 3, 2, Bd, { edge: true }); legA.ellipse(21, 28, 2.8, 2, Bd, { edge: true });
      armB.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armA.ellipse(26.5, 19, 2.6, 3, Bd, { edge: true });
      h.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });
      h.rect(12, 8, 12, 2, '#d23a3a');
      b.ellipse(15, 20, 10, 8.5, Sh, { edge: true });
      b.rect(15, 12, 1, 17, '#3a5208');                                                          // shell seam
      b.px(10, 16, '#c4e04a'); b.px(11, 15, '#c4e04a'); b.px(12, 21, '#c4e04a'); b.px(20, 16, '#c4e04a');
      return;
    }
    h.poly([[20, 4], [25, 1], [23, 5], [21, 6]], Hn);                                            // horn fork
    tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                           // headband tails
    legB.ellipse(9, 28, 3, 2, Bd, { edge: true }); legA.ellipse(21, 28, 2.8, 2, Bd, { edge: true });   // legs
    armB.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armA.ellipse(26, 19, 2.6, 3, Bd, { edge: true });   // fists
    b.ellipse(15, 20, 10, 8.5, Sh, { edge: true });                                              // shell
    b.rect(14, 13, 1, 15, '#3a5208');
    b.px(10, 18, '#c4e04a'); b.px(11, 17, '#c4e04a'); b.px(19, 17, '#c4e04a');
    h.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });                                             // head
    h.rect(12, 8, 12, 2, '#d23a3a');                                                             // headband
    rigEye(h, Q, 15, 11, () => { h.rect(15, 11, 2, 2, '#ffde3a'); h.px(15, 11, '#ffffff'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 2, '#ffde3a'); h.px(21, 11, '#ffffff'); });
    h.px(14, 9, OUTLINE).px(15, 9, OUTLINE).px(16, 10, OUTLINE).px(17, 10, OUTLINE);             // brows
    h.px(23, 9, OUTLINE).px(22, 9, OUTLINE).px(21, 10, OUTLINE).px(20, 10, OUTLINE);
    rigMouth(h, Q, 18, 14, 2);
  },

  wispurr(g, v) {
    const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa'), Q = rig(), TONGUE = '#e8607a';
    const b = part(g, 0, Q.body), t = part(g, Q.tail[0], Q.body + Q.tail[1]), h = part(g, Q.head[0], Q.head[1]);
    const ear = i => part(g, Q.head[0] - (Q.ears[i] > 1 ? 1 : 0), Q.head[1] + Q.ears[i]), earA = ear(0), earB = ear(1);
    const ears = () => {
      earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earA.px(8, 3, '#3ab8b0'); earA.px(9, 5, '#3ab8b0');
      earB.poly([[19, 8], [23, 1], [24, 7]], B, { edge: true }); earB.px(22, 3, '#3ab8b0');
    };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
      h.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
      h.px(25, 14, '#bcaaf0'); h.px(26, 13, '#bcaaf0');                                          // a whisker
      t.poly([[11, 25], [16, 17], [13, 11], [20, 13], [15, 23]], B, { edge: true });             // wispy tail
      t.ellipse(19, 10, 2.5, 3.5, F);
      return;
    }
    t.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);                                  // wispy tail
    t.ellipse(3, 16, 2.5, 3.5, F);
    ears();
    b.ellipse(15, 21, 7, 6, B, { edge: true });
    b.poly([[8, 21], [9, 29], [12, 25], [15, 30], [18, 25], [21, 29], [22, 21]], B);
    h.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
    for (const x of [13, 20]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 3, '#2ad8c0'); h.px(x, 11, '#ffffff'); });
    if (Q.mouth === 'roar') { h.rect(16, 15, 5, 3, OUTLINE); h.px(18, 17, TONGUE); }
    else if (Q.mouth === 'open') { h.rect(17, 15, 3, 2, OUTLINE); h.px(18, 16, TONGUE); }
    else h.px(17, 15, OUTLINE).px(19, 15, OUTLINE).px(18, 16, OUTLINE);                          // cat mouth
    h.px(8, 14, '#bcaaf0'); h.px(7, 15, '#bcaaf0'); h.px(25, 14, '#bcaaf0');                     // whiskers
  },

  gearhulk(g, v) { // 44x44
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    const rivets = pts => { for (const [x, y] of pts) b.px(x, y, '#3a4054'); };
    legB.ellipse(13, 40, 5, 2.5, D, { edge: true }); legA.ellipse(29, 40, 4.5, 2.3, D, { edge: true }); // feet
    if (v === 'bside') {
      armB.ellipse(5, 25, 4.5, 8, D, { edge: true }); armA.ellipse(38, 25, 3.5, 7, D, { edge: true });
      armB.ellipse(5, 34, 5, 4, M, { edge: true }); armA.ellipse(38, 34, 4, 3.5, M, { edge: true });
      b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      b.rect(14, 18, 14, 14, '#6e7690');                                                         // back panel
      for (let y = 20; y < 31; y += 3) b.rect(16, y, 10, 1, '#3a4054');
      b.rect(32, 16, 3, 20, '#6e7690');                                                          // side of the torso
      rivets([[11, 17], [30, 17], [10, 34], [31, 34]]);
      earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      h.rect(16, 9, 10, 2, '#6e7690');
      h.rect(29, 8, 2, 4, '#1c2a3a');                                                            // edge of the visor
      return;
    }
    armB.ellipse(5, 25, 4.5, 8, D, { edge: true }); armA.ellipse(37, 25, 3.5, 7, D, { edge: true });   // arms
    armB.ellipse(5, 34, 5, 4, M, { edge: true }); armA.ellipse(37, 34, 4, 3.5, M, { edge: true });     // fists
    b.poly([[9, 14], [34, 14], [35, 37], [8, 37]], M, { edge: true });                           // torso
    b.rect(9, 16, 3, 20, '#6e7690');                                                             // its left side, turned to us
    b.ellipse(24, 26, 6, 6, G);                                                                  // chest gear
    b.rect(23, 18, 2, 2, G); b.rect(23, 32, 2, 2, G); b.rect(16, 25, 2, 2, G); b.rect(30, 25, 2, 2, G);
    b.ellipse(24, 26, 2.2, 2.2, '#7a5418');
    rivets([[13, 17], [32, 17], [13, 34], [33, 34]]);                                            // rivets
    earA.rect(23, 1, 2, 4, '#6e7690'); earA.ellipse(24, 1.5, 1.6, 1.6, '#ff4a3a');               // antenna
    h.poly([[15, 5], [31, 5], [32, 15], [14, 15]], M, { edge: true });                           // head
    h.rect(15, 6, 2, 8, '#6e7690');
    h.rect(18, 8, 12, 4, '#1c2a3a');                                                             // visor
    rigEye(h, Q, 20, 9, () => h.rect(20, 9, 2, 2, '#5affff')); rigEye(h, Q, 26, 9, () => h.rect(26, 9, 2, 2, '#5affff'));
  },

  mondaze(g, v) {
    const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const hair = () => h.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
    if (v === 'bside') {
      legB.ellipse(11, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 2.8, 1.5, F, { edge: true });
      b.ellipse(16, 22, 9, 7.5, F, { edge: true });
      armB.ellipse(8, 21, 2.5, 4, F, { edge: true }); armA.ellipse(24.5, 21, 2.2, 3.6, F, { edge: true });
      hair();
      h.ellipse(17, 11, 8.5, 7, F, { edge: true });
      h.ellipse(24, 13, 1.6, 2.5, C);                                                            // face peeking out
      for (const [x, y] of [[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]) { const p = y < 16 ? h : b; p.px(x, y, '#6e6052'); p.px(x + 1, y + 1, '#6e6052'); }
      return;
    }
    legB.ellipse(12, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 2.8, 1.5, F, { edge: true }); // feet
    b.ellipse(16, 22, 9, 7.5, F, { edge: true });                                                // slumped body
    b.ellipse(18, 24, 5, 4.5, '#b0a090');
    hair();
    h.ellipse(17, 11, 8.5, 7, F, { edge: true });
    h.ellipse(19, 12, 6.5, 5, C);                                                                // face, turned its way
    h.poly([[11, 10], [17, 10], [17, 14], [13, 14]], '#4a3a30'); h.poly([[20, 10], [25, 10], [24, 14], [20, 14]], '#4a3a30');   // droopy eye bands
    rigEye(h, Q, 14, 11, () => { h.rect(14, 11, 2, 1, '#1a1222'); h.rect(14, 12, 2, 1, '#7a6a8a'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 1, '#1a1222'); h.rect(21, 12, 2, 1, '#7a6a8a'); });
    h.rect(18, 14, 2, 1, OUTLINE);
    rigMouth(h, Q, 17, 16, 4, () => h.px(17, 17, OUTLINE).px(18, 16, OUTLINE).px(19, 16, OUTLINE).px(20, 17, OUTLINE));   // frown
    armB.ellipse(11, 21, 2.5, 4, F, { edge: true }); armA.ellipse(24, 21, 2.2, 3.6, F, { edge: true }); // arms
    b.poly([[16, 21], [22, 21], [22, 27], [16, 27]], M, { edge: true });                         // coffee mug
    b.rect(23, 22, 1, 3, '#24766f'); b.px(22, 22, '#24766f'); b.px(22, 24, '#24766f');
    b.rect(17, 21, 4, 1, '#5a3a22');
    armB.px(15, 24, '#e8dcc6'); armA.px(23, 25, '#e8dcc6');                                      // claws round the mug
    b.px(17, 19, '#eef2f6').px(18, 18, '#eef2f6').px(20, 19, '#eef2f6').px(21, 18, '#eef2f6');  // steam
  },

  pixibelle(g, v) {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const antennae = () => {
      earB.rect(13, 2, 1, 4, OUTLINE); earB.px(13, 1, '#ffe066'); earB.px(12, 1, '#ffe066'); earB.px(13, 0, '#ffe066');
      earA.rect(20, 2, 1, 4, OUTLINE); earA.px(20, 1, '#ffe066'); earA.px(21, 1, '#ffe066'); earA.px(20, 0, '#ffe066');
    };
    const body = () => {
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); // skirt
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
    };
    if (v === 'bside') {
      antennae();
      body();
      h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[22, 5], [17, 8], [22, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
      wingEllipse(b, 7.5, 14, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 9, 22, 4, 3.5, Wn, { edge: true });   // wings
      wingEllipse(b, 25.5, 13, 4.5, 4.5, Wn, { edge: true }); wingEllipse(b, 23.5, 21, 3.2, 3, Wn, { edge: true });
      wingEllipse(b, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    wingEllipse(b, 6.5, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 8, 22, 4, 3.5, Wn, { edge: true }); // wings
    wingEllipse(b, 25, 12, 4, 4.5, Wn, { edge: true }); wingEllipse(b, 24, 21, 3, 3, Wn, { edge: true });
    wingEllipse(b, 5.5, 12, 1.8, 1.5, '#ffb4dc');
    antennae();
    body();
    h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[21, 6], [17, 8], [21, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
    rigEye(h, Q, 13, 12, () => { h.rect(13, 12, 2, 3, '#6a2a5a'); h.px(13, 12, '#ffffff'); });
    rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
    h.ellipse(11.5, 16, 1.5, 1, '#ff8ab8'); h.ellipse(23, 16, 1.2, 1, '#ff8ab8');               // cheeks
    rigMouth(h, Q, 17, 17, 2, () => h.px(18, 17, OUTLINE));
  },
  voltergeist(g, v) {
    const F = P('#3a2a6a', '#24184a', '#5a46a0'), GLOW = '#e8f4ff', ARC = '#c8a8ff', CRACK = '#bfefff', FT = P('#24184a', '#160e30', '#3a2a6a');
    const { Q, b, h, t, earA } = rigParts(g, v);
    const pts = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 9.5 : 12.2 + ((i * 7) % 3) * 0.4; pts.push([16.5 + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.92]); }
    b.ellipse(12.5, 29.5, 2.6, 1.4, FT, { edge: true }); b.ellipse(20, 29.5, 2.4, 1.3, FT, { edge: true });
    earA.rect(18, 2, 1, 5, OUTLINE); earA.ellipse(18.5, 1.8, 1.8, 1.8, P('#fff6c0', '#e0c060', '#ffffff'));
    b.poly(pts, F, { edge: true });
    b.ellipse(14.5, 14.5, 6, 4, F.l);
    b.px(9, 20, ARC).px(10, 19, ARC).px(11, 20, ARC); b.px(22, 24, ARC).px(23, 23, ARC);
    t.px(3, 12, ARC).px(4, 11, ARC).px(4, 13, ARC); t.px(29, 21, ARC).px(30, 20, ARC).px(29, 22, ARC);
    if (v === 'bside') return;
    rigEye(h, Q, 11, 14, () => h.poly([[11, 14], [16, 16], [15, 17], [11, 15]], GLOW), 4);
    rigEye(h, Q, 19, 14, () => h.poly([[25, 14], [20, 16], [21, 17], [25, 15]], GLOW), 4);
    rigMouth(h, Q, 14, 20, 8, () => { for (let x = 13; x <= 23; x++) h.px(x, x % 2 ? 21 : 20, CRACK); });
  },
  coilizard(g, v) {
    const G = P('#9ad84a', '#64a02a', '#cff48a'), BL = '#e8f4c0', Cu = '#c8702a', M = P('#c8d0dc', '#8a94a8', '#f0f4fa'), BAND = '#5a6478', CORE = '#7ae8ff', EYE = '#ffc020';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const coil = (cx, cy) => { t.ellipse(cx, cy, 5, 5, M, { edge: true }); t.ellipse(cx, cy, 3.2, 3.2, BAND); t.ellipse(cx, cy, 2.2, 2.2, M); t.ellipse(cx, cy, 1.2, 1.2, CORE); t.px(cx - 4, cy - 1, BAND).px(cx + 3, cy - 4, BAND).px(cx + 4, cy + 2, BAND); };
    if (v === 'bside') {
      legB.ellipse(8, 26, 3, 2, G, { edge: true }); legA.ellipse(23, 26.5, 2.6, 1.8, G, { edge: true });
      b.ellipse(15, 22, 7.5, 5, G, { edge: true });
      for (let y = 18; y < 26; y += 2) b.px(14, y, Cu).px(15, y + 1, Cu).px(16, y, Cu);
      h.ellipse(18, 15.5, 5, 3.5, G, { edge: true });
      h.ellipse(23, 15, 1.4, 1.6, EYE);                                                           // an eye peeking out
      t.ellipse(11, 18, 2, 2, M, { edge: true });
      coil(9, 10);
      return;
    }
    t.ellipse(10, 18, 2, 2, M, { edge: true });
    coil(7, 12);                                                                                 // the coil behind, on the left
    legB.ellipse(8, 26, 2.6, 1.8, G, { edge: true }); legA.ellipse(24, 26.5, 3, 2, G, { edge: true });
    legB.px(7, 27, BL); legA.px(22, 27, BL).px(25, 27, BL);
    b.ellipse(16, 23, 7.5, 4.5, G, { edge: true });
    b.ellipse(17.5, 24.5, 4.5, 2.4, BL);
    for (let i = 0; i < 4; i++) b.px(11 + i, 20 + (i % 2), Cu);
    h.poly([[9, 17], [11, 12], [18, 10], [25, 12], [27, 17], [18, 20]], G, { edge: true });     // wedge head, turned its way
    h.ellipse(19, 18, 4, 1.5, BL);
    for (let i = 0; i < 5; i++) h.px(16 + i, 11 + (i % 2), Cu);
    rigEye(h, Q, 11, 13, () => { h.ellipse(12, 14, 2.2, 2.4, EYE, { edge: true }); h.rect(12, 13, 1, 3, DARK_EYE); h.px(11, 13, '#ffffff'); }, 3);
    rigEye(h, Q, 22, 13, () => { h.ellipse(23, 14, 2.6, 2.6, EYE, { edge: true }); h.rect(23, 13, 1, 3, DARK_EYE); h.px(22, 13, '#ffffff'); }, 3);
    rigMouth(h, Q, 16, 17, 6, () => h.rect(15, 17, 8, 1, OUTLINE));
  },
  bellpaca(g, v) {
    const W = P('#f4ead2', '#d6c6a0', '#ffffff'), MZ = '#ece0c4', HOOF = '#5a4a3a', COL = '#a83030', BELL = P('#e0b048', '#a07828', '#fff0a0'), GLOW = '#9af0ff';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 3, 5, W.s); p.rect(x, 29, 3, 1, HOOF); };
    if (v === 'bside') {
      leg(legB, 10); leg(legA, 19);
      b.ellipse(15, 21, 8, 5.5, W, { edge: true }); b.ellipse(8, 20, 2.5, 2.5, W);
      b.ellipse(17, 13, 3.5, 6, W, { edge: true });
      earB.poly([[12, 4], [12, 0], [14, 3]], W, { edge: true }); earA.poly([[22, 4], [22, 0], [20, 3]], W, { edge: true });
      h.ellipse(17, 6, 4, 3.5, W, { edge: true }); h.ellipse(17, 3, 3.5, 2, W.l, { edge: true });
      t.ellipse(12, 23, 1.6, 1.6, W, { edge: true });
      return;
    }
    leg(legB, 10); leg(legA, 19);
    t.ellipse(8, 20, 1.5, 1.5, W, { edge: true });
    b.ellipse(15, 21, 8, 5.5, W, { edge: true }); b.ellipse(22, 20, 2.5, 2.5, W);
    b.ellipse(17, 13, 3.5, 6, W, { edge: true });
    b.rect(14, 15, 6, 1, COL);
    b.ellipse(17.5, 16, 3, 2, '#d8fcff'); b.ellipse(17.5, 17.5, 1.6, 1.8, BELL, { edge: true }); b.px(17, 19, GLOW);
    earB.poly([[12, 4], [12, 0], [14, 3]], W, { edge: true }); earA.poly([[22, 4], [22, 0], [20, 3]], W, { edge: true });
    h.ellipse(17, 6, 4, 3.5, W, { edge: true }); h.ellipse(17, 3, 3.5, 2, W.l, { edge: true });
    rigEye(h, Q, 14, 6, () => { h.rect(14, 6, 2, 1, OUTLINE); h.px(15, 7, '#3a2a1a'); });
    rigEye(h, Q, 19, 6, () => { h.rect(19, 6, 2, 1, OUTLINE); h.px(19, 7, '#3a2a1a'); });
    h.ellipse(18, 8.5, 1.8, 1.2, MZ);
    rigMouth(h, Q, 17, 9, 2, () => h.px(18, 9, OUTLINE));
  },
  smouldox(g, v) {
    const K = P('#3a3236', '#221c20', '#5a5056'), CO = P('#2a2226', '#140e12', '#4a3e44'), MZ = P('#6a5a5a', '#4a3e3e', '#8a7a78'), HN = '#9a9098';
    const EMB = '#ff7a1c', HOT = '#ffd34a', EYE = '#ff9a3a', HOOF = '#141012', SMOKE = '#8a8088';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const coals = pts => { for (const [x, y] of pts) { b.ellipse(x, y, 2, 1.6, CO, { edge: true }); b.px(x, y, EMB); b.px(x - 1, y + 1, HOT); } };
    const leg = (p, x) => { p.ellipse(x, 27.5, 2.4, 2.6, K, { edge: true }); p.ellipse(x, 30, 2.4, 1, HOOF); };
    if (v === 'bside') {
      leg(legB, 10); leg(legA, 21);
      b.ellipse(15.5, 21, 10, 6.5, K, { edge: true });
      coals([[9, 16], [13, 15], [17, 15], [21, 16], [11, 19], [19, 19], [15, 18]]);
      earB.ellipse(11, 13, 2, 1.2, K, { edge: true }); earA.ellipse(23.5, 13, 2, 1.2, K, { edge: true });
      h.ellipse(18, 13, 4, 2.5, K, { edge: true });
      h.poly([[14, 12], [13, 9], [15, 11]], HN); h.poly([[22, 12], [23, 9], [21, 11]], HN);
      t.rect(11, 23, 1, 4, K.s); t.ellipse(11.5, 27.5, 1.5, 1.5, K, { edge: true });
      t.px(8, 11, SMOKE).px(9, 9, SMOKE).px(8, 7, SMOKE);
      return;
    }
    t.rect(5, 19, 1, 4, K.s); t.ellipse(5, 24, 1.5, 1.5, K, { edge: true });
    leg(legB, 10); leg(legA, 21);
    b.ellipse(15, 21, 10, 6.5, K, { edge: true });
    b.ellipse(16, 25.5, 6, 1.6, EMB);
    coals([[8, 15], [11.5, 13.5], [16, 13], [20, 14.5]]);
    earB.ellipse(11.5, 14, 2, 1.2, K, { edge: true }); earA.ellipse(24.5, 14, 2, 1.2, K, { edge: true });
    h.poly([[13, 12], [12, 9], [14, 11]], HN); h.poly([[23, 12], [24, 9], [22, 11]], HN);
    h.ellipse(18, 15.5, 5, 4.5, K, { edge: true });
    h.ellipse(19.5, 19, 3, 2, MZ, { edge: true });
    h.px(18, 19, OUTLINE).px(21, 19, OUTLINE);
    rigEye(h, Q, 14, 15, () => h.rect(14, 15, 2, 1, EYE));
    rigEye(h, Q, 20, 15, () => h.rect(20, 15, 2, 1, EYE));
    h.px(14, 14, OUTLINE).px(15, 14, OUTLINE); h.px(21, 14, OUTLINE).px(20, 14, OUTLINE);
    rigMouth(h, Q, 18, 21, 2);
  },
  garrishell(g, v) { // 44x44
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (p, x, y, w = 5, hh = 6) => p.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    // From behind (the owner's reference): a domed shell of gold-trimmed plates, a round turret on
    // top with battlements and a hatch, and a tail with an iron cuff.
    const backShell = cx => {
      b.ellipse(cx, 25, 15, 13, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                  // gold rim
      b.ellipse(cx, 25.5, 13.5, 11.5, M);                                                          // the dome
      b.rect(cx - 6, 16, 1, 20, GOLD); b.rect(cx + 6, 16, 1, 20, GOLD);                            // plate seams
      b.rect(cx - 13, 26, 27, 1, GOLD); b.rect(cx - 6, 20, 13, 1, GOLD); b.rect(cx - 6, 32, 13, 1, GOLD);
      for (const [x, y] of [[-10, 21], [-10, 30], [10, 21], [10, 30], [0, 17], [0, 35], [-6, 23], [6, 23], [-6, 29], [6, 29]]) b.px(cx + x, y, D.s);   // rivets
      b.px(cx - 3, 23, M.l).px(cx - 2, 22, M.l).px(cx + 2, 29, M.l).px(cx + 3, 28, M.l);           // shine
      b.px(cx - 10, 24, D.s).px(cx - 9, 23, D.s).px(cx + 9, 33, D.s).px(cx + 10, 32, D.s);         // battle scratches
      merlon(b, cx - 9, 2, 3, 4); merlon(b, cx - 2, 1, 4, 4); merlon(b, cx + 6, 2, 3, 4);          // back battlements
      b.poly([[cx - 10, 5], [cx + 10, 5], [cx + 10, 14], [cx - 10, 14]], M, { edge: true });       // the round tower
      b.ellipse(cx, 6, 9.5, 3.2, P(M.l, M.b, '#d4d8e0'));                                          // its round top
      b.ellipse(cx, 6, 4, 2, D, { edge: true }); b.rect(cx - 1, 6, 2, 1, D.l);                     // round hatch
      for (const x of [-9, 9]) b.rect(cx + x - (x > 0 ? 1 : 0), 8, 2, 6, M.s);                    // shading round the sides
      merlon(b, cx - 11, 4, 3, 5); merlon(b, cx + 8, 4, 3, 5);                                     // battlements at the sides
      b.rect(cx - 10, 13, 21, 1, GOLD);
      b.px(cx - 7, 10, D.s).px(cx, 10, D.s).px(cx + 7, 10, D.s);
    };
    const backTail = x => {
      t.poly([[x + 4, 33], [x + 8, 36], [x - 1, 42], [x - 5, 43]], S, { edge: true });           // tail, out from under the shell
      t.poly([[x + 2, 36], [x + 5, 37.5], [x + 3, 40], [x, 39]], D, { edge: true });             // iron cuff
    };
    if (v === 'bside') {
      armB.ellipse(5, 21, 4.5, 4.5, S, { edge: true });
      armB.poly([[1, 22], [9, 22], [9, 34], [1, 34]], D, { edge: true }); armB.rect(1, 25, 8, 1, GOLD);
      armB.ellipse(5, 35, 4.5, 2.2, M, { edge: true });
      h.poly([[27, 6], [31, 2], [37, 3], [40, 7], [40, 15], [30, 15]], M, { edge: true });       // helm, turned right, peeking past the turret
      h.rect(35, 1, 1, 5, M.l);
      h.rect(37, 8, 3, 3, BORE); rigEye(h, Q, 38, 8, () => h.px(39, 9, EYE), 1);                 // the visor at its edge, eye glinting
      for (const y of [12, 14]) h.rect(37, y, 3, 1, BORE);
      armA.ellipse(36, 21, 4.5, 4.5, S, { edge: true });                                         // near arm and cannon, pointed ahead
      armA.poly([[33, 22], [42, 22], [42, 30], [33, 30]], D, { edge: true }); armA.rect(38, 22, 1, 8, GOLD);
      armA.ellipse(42, 26, 1.8, 3.6, M, { edge: true }); armA.px(43, 26, WET);
      legB.ellipse(13, 38, 5, 4.5, S, { edge: true }); legB.ellipse(13, 41, 5.5, 2.2, S, { edge: true });
      legA.ellipse(29, 38, 4.5, 4.5, S, { edge: true }); legA.ellipse(30, 41, 5, 2.2, S, { edge: true });
      backShell(20);
      backTail(9);
      return;
    }
    merlon(b, 2, 4, 4); merlon(b, 8, 5, 4, 5); merlon(b, 32, 5, 4, 5); merlon(b, 37, 5, 3, 5);   // battlements
    b.poly([[4, 14], [7, 9], [35, 9], [38, 14], [38, 30], [4, 30]], M, { edge: true });          // shell behind
    b.rect(4, 13, 34, 1, GOLD);
    b.px(6, 18, D.s).px(6, 25, D.s).px(36, 18, D.s);
    t.poly([[8, 33], [1, 37], [9, 37]], S, { edge: true });                                      // tail, out to the left
    legB.ellipse(15, 37, 4.5, 4.5, S, { edge: true }); legA.ellipse(30, 37, 5, 4.5, S, { edge: true });
    legB.ellipse(14, 41, 5.5, 2.2, S, { edge: true }); legA.ellipse(32, 41, 6, 2.4, S, { edge: true });
    legB.px(10, 42, C.l).px(13, 42, C.l); legA.px(29, 42, C.l).px(32, 42, C.l).px(35, 42, C.l);
    b.ellipse(23, 26, 10.5, 9.5, S, { edge: true });                                             // body
    b.ellipse(25, 27, 6.5, 7.5, C);                                                              // plastron, turned our way
    b.rect(19, 24, 12, 1, C.s); b.rect(19, 29, 12, 1, C.s); b.rect(24, 20, 1, 14, C.s);
    armB.ellipse(10, 21, 4, 4, S, { edge: true });                                               // far shoulder and cannon
    armB.poly([[4, 23], [11, 23], [11, 33], [4, 33]], D, { edge: true }); armB.rect(4, 26, 7, 1, GOLD);
    armB.ellipse(7.5, 34, 4, 2.4, M, { edge: true }); armB.ellipse(7.5, 34, 2.2, 1.2, BORE);
    armA.ellipse(36, 21, 5, 5, S, { edge: true });                                               // near shoulder and cannon
    armA.poly([[33, 23], [42, 23], [42, 34], [33, 34]], D, { edge: true }); armA.rect(33, 26, 9, 1, GOLD);
    armA.ellipse(37.5, 35, 5, 3, M, { edge: true }); armA.ellipse(38, 35, 3, 1.6, BORE); armA.px(37, 35, WET);
    h.poly([[17, 8], [20, 4], [28, 4], [31, 8], [32, 18], [16, 18]], M, { edge: true });         // helm, turned right
    h.rect(17, 7, 2, 10, M.s);                                                                   // its side, turned to us
    h.rect(24, 3, 2, 6, M.l);
    h.rect(20, 10, 11, 3, BORE);                                                                 // visor slit
    h.rect(21, 11, 2, 1, S.s);
    rigEye(h, Q, 26, 10, () => { h.rect(26, 10, 4, 2, EYE); h.px(27, 10, HOT); h.px(28, 10, HOT); }, 4);
    for (const x of [21, 23, 25, 27, 29]) h.rect(x, 14, 1, 3, BORE);                             // grille
    h.px(30, 8, D.s).px(31, 16, D.s);
  },
};

const SPRITES = {};

// Build every monster's views once: front (img), side (facing right), back, and the
// diagonals (fside, bside) for monsters that have them (sp.diag).
const VIEWS = ['front', 'side', 'back'];
// A set of views remembers its wings-down twin (hidden, so it isn't listed as a view).
const flapped = (views, twin) => Object.defineProperty(views, 'flapped', { value: twin });
function buildSprites() {
  for (const mon of ALL_MONS()) {
    const size = mon.size === 'L' ? 44 : 32;
    const diag = !!MONSTER_ART_DIAG[mon.id];
    const draw = () => {
      const out = {};
      for (const v of diag ? [...VIEWS, 'fside', 'bside'] : VIEWS) {
        const g = new PixGrid(size, size);
        (v === 'fside' || v === 'bside' ? MONSTER_ART_DIAG : MONSTER_ART)[mon.id](g, v);
        g.outline();
        out[v] = g.toCanvas();
      }
      return out;
    };
    const views = draw(), fly = FLYERS[mon.id] || null;
    let flap = null;
    if (fly && fly.flap) { FLAP = 1; flap = draw(); FLAP = 0; }   // the wings-down frame
    let frames = null;
    if (RIGGED[mon.id]) {   // its animation frames, each a full set of views
      const at = f => { RIG = { ...REST, ...f }; const out = draw(); RIG = null; return out; };
      frames = {};
      for (const [k, f] of Object.entries({ ...RIG_COMMON, ...RIG_FRAMES[RIGGED[mon.id]] })) frames[k] = Array.isArray(f) ? f.map(at) : at(f);
      for (const v of Object.keys(frames.faint)) frames.faint[v] = lying(frames.faint[v]);   // laid on its side
      if (fly && fly.flap) {   // a flier's frames, wings down (drawMon swaps them in as it flaps)
        FLAP = 1;
        for (const [k, f] of Object.entries({ ...RIG_COMMON, ...RIG_FRAMES[RIGGED[mon.id]] })) {
          if (k === 'faint') continue;
          if (Array.isArray(f)) f.forEach((ff, i) => flapped(frames[k][i], at(ff))); else flapped(frames[k], at(f));
        }
        FLAP = 0;
      }
    }
    if (flap) flapped(views, flap);
    SPRITES[mon.id] = { img: views.front, views, size, diag, fly, flap, frames };
  }
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
function monAnim(m, phase, flying) {
  const sp = SPRITES[m.id], F = sp.frames, a = m.action, clock = animClock();
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
