// Pixel-art toolkit: a colour grid with shaded primitives, auto-outlining,
// a tiny bitmap digit font and helpers to turn grids into canvases.

const OUTLINE = '#1c1428';

class PixGrid {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.c = new Array(w * h).fill(null);
  }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.inb(x, y) ? this.c[y * this.w + x] : null; }
  set(x, y, col) { if (this.inb(x, y)) this.c[y * this.w + x] = col; }

  // Fill every pixel whose centre passes `test`. `pal` is a flat colour or
  // {b: base, s: shade, l: light} for simple top-left lighting.
  // opt.edge draws an outline where this shape overlaps earlier shapes.
  shape(test, x0, y0, x1, y1, pal, opt = {}) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const rx = Math.max(1, (x1 - x0) / 2), ry = Math.max(1, (y1 - y0) / 2);
    const mask = [];
    const inMask = new Set();
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        if (this.inb(x, y) && test(x + 0.5, y + 0.5)) { mask.push(x, y); inMask.add(y * this.w + x); }
      }
    }
    const edgePx = [];
    if (opt.edge) {
      for (let i = 0; i < mask.length; i += 2) {
        const x = mask[i], y = mask[i + 1];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (!this.inb(nx, ny) || inMask.has(ny * this.w + nx)) continue;
          const nc = this.get(nx, ny);
          if (nc && nc !== OUTLINE) { edgePx.push(x, y); break; }
        }
      }
    }
    const shadeK = opt.shade ?? 0.45;
    for (let i = 0; i < mask.length; i += 2) {
      const x = mask[i], y = mask[i + 1];
      let col;
      if (typeof pal === 'string') col = pal;
      else {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
        const sv = nx * 0.4 + ny * 0.9;
        if (sv > shadeK) col = pal.s;
        else if (pal.l && sv < -0.62) col = pal.l;
        else col = pal.b;
      }
      this.set(x, y, col);
    }
    for (let i = 0; i < edgePx.length; i += 2) this.set(edgePx[i], edgePx[i + 1], OUTLINE);
    return this;
  }

  ellipse(cx, cy, rx, ry, pal, opt) {
    return this.shape((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
      cx - rx, cy - ry, cx + rx, cy + ry, pal, opt);
  }
  // mirrored pair around the vertical centre line
  ellipseM(cx, cy, rx, ry, pal, opt) {
    this.ellipse(cx, cy, rx, ry, pal, opt);
    return this.ellipse(this.w - cx, cy, rx, ry, pal, opt);
  }

  poly(pts, pal, opt) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const test = (px, py) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };
    return this.shape(test, x0, y0, x1, y1, pal, opt);
  }
  polyM(pts, pal, opt) {
    this.poly(pts, pal, opt);
    return this.poly(pts.map(([x, y]) => [this.w - x, y]), pal, opt);
  }

  rect(x, y, w, h, col) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col);
    return this;
  }
  rectM(x, y, w, h, col) { this.rect(x, y, w, h, col); return this.rect(this.w - x - w, y, w, h, col); }
  px(x, y, col) { this.set(x, y, col); return this; }
  pxM(x, y, col) { this.set(x, y, col); this.set(this.w - 1 - x, y, col); return this; }

  // Standard cartoon eye pair: 2x3 dark with a white catch-light.
  eyes(x, y, dark = '#1a1222', opt = {}) {
    const h = opt.h ?? 3, w = opt.w ?? 2;
    this.rectM(x, y, w, h, dark);
    this.px(x, y, '#ffffff');
    this.px(this.w - x - w, y, '#ffffff');
    if (opt.brow) { // angry brows slanting toward the centre
      this.px(x - 1, y - 2, OUTLINE); this.px(x, y - 2, OUTLINE); this.px(x + 1, y - 1, OUTLINE); this.px(x + 2, y - 1, OUTLINE);
      const mx = this.w - x - w;
      this.px(mx + w, y - 2, OUTLINE); this.px(mx + w - 1, y - 2, OUTLINE); this.px(mx, y - 1, OUTLINE); this.px(mx - 1, y - 1, OUTLINE);
    }
    return this;
  }

  outline(col = OUTLINE) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1)) add.push(x, y);
    }
    for (let i = 0; i < add.length; i += 2) this.set(add[i], add[i + 1], col);
    return this;
  }

  toCanvas(override) {
    const cv = document.createElement('canvas');
    cv.width = this.w; cv.height = this.h;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(this.w, this.h);
    for (let i = 0; i < this.c.length; i++) {
      const col = this.c[i];
      if (!col) continue;
      const [r, g, b] = hexRgb(override || col);
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
}

// Give a canvas's memory back right away (phones count it against a cap until it's collected).
function freeCanvas(c) { if (c && c.width !== undefined) { c.width = 0; c.height = 0; } }
const _rgbCache = {};
function hexRgb(hex) {
  if (_rgbCache[hex]) return _rgbCache[hex];
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => parseInt(c + c, 16)) : [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
  return (_rgbCache[hex] = v);
}

// Build a grid from a string map + palette ('.' = empty).
function gridFromMap(rows, pal) {
  const g = new PixGrid(rows[0].length, rows.length);
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && pal[ch]) g.set(x, y, pal[ch]); }));
  return g;
}

// ---------- bitmap font for damage numbers (3x5 digits) ----------
const DIGITS = {
  '0': ['111', '101', '101', '101', '111'], '1': ['110', '010', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
  '+': ['000', '010', '111', '010', '000'],
};

// Renders a number as chunky outlined pixels: fill colour with a darker bottom row.
// Number pictures are cached: phones (iPhone Safari above all) free thrown-away canvases late and
// cap the memory all canvases may use, so a new picture every frame (the coin counter, price tags)
// eventually makes new pictures come out blank. Kept to the 400 most recently used.
const _numbers = new Map();
function numberCanvas(text, fill = '#fff6c8', shade = '#e0b040') {
  const key = text + '|' + fill + '|' + shade;
  let cv = _numbers.get(key);
  if (cv) { _numbers.delete(key); _numbers.set(key, cv); return cv; }
  cv = drawNumber(text, fill, shade);
  _numbers.set(key, cv);
  if (_numbers.size > 400) _numbers.delete(_numbers.keys().next().value);
  return cv;
}
function drawNumber(text, fill, shade) {
  const chars = String(text).split('').filter(c => DIGITS[c]);
  const w = chars.length * 4 + 1, h = 7;
  const g = new PixGrid(w + 2, h + 2);
  chars.forEach((c, i) => {
    DIGITS[c].forEach((row, y) => [...row].forEach((b, x) => {
      if (b === '1') g.set(2 + i * 4 + x, 2 + y, y >= 3 ? shade : fill);
    }));
  });
  // thick outline (2 passes) for readability
  g.outline(OUTLINE);
  return g.toCanvas();
}

// ---------- the trainers ----------
// The four trainers (dungeon.js TRAINERS), each as him ('m') and her ('f'): 8 looks, original
// designs from the owner's concept pictures (docs/concept-prompts.md T1-T4, T1F-T4F). They're
// drawn in code on a 20x30 map of keys, all on one shared body (head rows 0-12, body 13-21, legs
// 22-29, arms 2 pixels wide from the shoulders), then inked round and shaded on the right like the
// monsters. So every look walks (trainerStep) and poses (trainer.js) the same way. Everyone wears
// the Arcbracer (B band, Q screen) on the arm the rig calls R.
// A look is 'trainer-m' or 'trainer-f' (trainerLook). Views: front, back, side (facing right) and
// the two diagonals fside / bside (also facing right).
// Keys: k ink, h/H hair (H = a streak or highlight), s/S skin, r eye, K mouth, j/J jacket, coat or
// hoodie, t/T shirt, a/A accent (scarf, band, stripe), p/P trousers, L leggings, c/C hat or hood,
// f shoe, F sole, b leather, n light leather or rope, m/M metal, y glass or glow, w/W cream,
// o patch, g glove, B/Q the bracer.
const TW = 20, TH = 30;
const TR_BODY = 13, TR_LEGS = 22, TR_FEET = 27, TR_SPLIT = 10;
const TRAINER_VIEWS = ['front', 'side', 'back', 'fside', 'bside'];
// the arms: outer column sx at shoulder row sy, `side` = outward; `over` = drawn over the body (inked)
const TRAINER_ARMS = {
  front: { L: { sx: 3, sy: 13, side: -1 }, R: { sx: 16, sy: 13, side: 1 } },
  side: { R: { sx: 10, sy: 13, side: 1, over: true } },
};
TRAINER_ARMS.back = TRAINER_ARMS.fside = TRAINER_ARMS.bside = TRAINER_ARMS.front;
const TR_FACE = {
  front: { eyes: [7, 12], mouth: [9, 10], brows: [[6, 7], [12, 13]] },
  fside: { eyes: [9, 13], mouth: [11, 12], brows: [[8, 9], [13, 14]] },
  side: { eyes: [12], mouth: [13], brows: [[12, 13]] },
};
const TR_HEAD = [[1, 6, 13], [2, 5, 14], [3, 4, 15], [4, 4, 15], [5, 4, 15], [6, 4, 15], [7, 4, 15], [8, 4, 15], [9, 4, 15], [10, 4, 15], [11, 5, 14], [12, 7, 12]];
const TR_HEAD_SIDE = [[1, 5, 10], [2, 4, 12], [3, 3, 13], [4, 3, 14], [5, 3, 14], [6, 3, 14], [7, 3, 14], [8, 3, 14], [9, 3, 15], [10, 3, 14], [11, 5, 14], [12, 8, 13]];
const TR_SHADE = { s: 'S', j: 'J', t: 'T', a: 'A', p: 'P', c: 'C', m: 'M', w: 'W', n: 'b' };
const TRAINER_SKIN = { k: OUTLINE, s: '#f2c49a', S: '#d4a07a', r: '#1a1222', K: '#8a4a3a', B: '#3a3e52', Q: '#5ae8ff' };

function trPainter(w = TW, h = TH) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const P = {
    g,
    at: (x, y) => (g[y] && g[y][x]) || '.',
    px(x, y, ch) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = ch; },
    row(y, x0, x1, ch) { for (let x = x0; x <= x1; x++) P.px(x, y, ch); },
    rect(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) P.row(y, x0, x1, ch); },
    pts(list, ch, dx = 0) { for (const [x, y] of list) P.px(x + dx, y, ch); },
    // repaint only what's already drawn, or only what's empty
    over(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (P.at(x, y) !== '.') P.px(x, y, ch); },
    under(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (P.at(x, y) === '.') P.px(x, y, ch); },
  };
  return P;
}
// Ink round everything (empty pixels touching the figure), then shade the right edges.
function trInk(P) {
  const { g } = P, add = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (g[y][x] !== '.') continue;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = P.at(x + ox, y + oy); if (c !== '.' && c !== 'k') { add.push([x, y]); break; } }
  }
  for (const [x, y] of add) g[y][x] = 'k';
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) { const sh = TR_SHADE[g[y][x]]; if (sh && P.at(x + 1, y) === 'k') g[y][x] = sh; }
}
// An arm as pixels [x, y, key]: from the shoulder out at `deg` (0 = hanging, 90 = straight out,
// 180 = straight up), 2 wide; cols = [outer, inner] keys from the shoulder to the hand, then a fist.
function trainerArmPx(a, deg, cols, ox = 0, oy = 0) {
  const ang = deg * Math.PI / 180, dx = Math.sin(ang) * a.side, dy = Math.cos(ang);
  const nx = -a.side * Math.round(Math.abs(dy)), ny = Math.round(Math.abs(dx));   // the inner pixel, toward the body
  const out = [];
  let x = 0, y = 0;
  cols.forEach(([o, i], t) => {
    x = Math.round(a.sx + ox + dx * t); y = Math.round(a.sy + oy + dy * t);
    out.push([x + nx, y + ny, i], [x, y, o]);
  });
  const [h] = cols[cols.length - 1], fx = Math.round(x + dx), fy = Math.round(y + dy);
  out.push([fx, fy, h], [fx + nx, fy + ny, h]);
  return out;
}
function trArm(P, a, deg, cols) {
  const px = trainerArmPx(a, deg, cols);
  for (const [x, y, ch] of px) P.px(x, y, ch);
  if (!a.over) return;
  const own = new Set(px.map(([x, y]) => x + ',' + y));   // over the body: ink its sides
  for (const [x, y] of px) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1]]) {
    const nx = x + ox, ny = y + oy;
    if (!own.has(nx + ',' + ny) && ny > a.sy && P.at(nx, ny) !== '.') P.px(nx, ny, 'k');
  }
}
function trCtx(v) {
  const side = v === 'side', back = v === 'back' || v === 'bside';
  return { side, back, front: !side && !back, hx: v === 'fside' || v === 'bside' ? 1 : 0, fs: v === 'fside' ? 1 : 0, face: TR_FACE[v] };
}
// eyes, brows and mouth (trainers that redraw the face call it again)
function trFeatures(P, v, f) {
  const F = TR_FACE[v];
  if (!F) return;
  for (const x of F.eyes) P.pts([[x, 8], [x, 9]], 'r');
  for (const [a, b] of F.brows) P.pts([[a, 7], [b, 7]], 'h');
  for (const x of F.mouth) P.px(x, 11, 'K');
  if (f) {   // lashes
    if (v === 'side') P.px(F.eyes[0] + 1, 8, 'r');
    else P.pts([[F.eyes[0] - 1, 8], [F.eyes[1] + 1, 8]], 'r');
  }
}
// The shared body: hair all over the head, the face, a jacket, trousers and shoes.
function trBase(P, v, f) {
  const { side, back, hx, fs } = trCtx(v);
  for (const [y, x0, x1] of side ? TR_HEAD_SIDE : TR_HEAD) P.row(y, x0 + hx, x1 + hx, 'h');
  if (side) { P.over(8, 6, 15, 12, 's'); P.pts([[9, 8], [9, 9]], 'S'); }
  else if (back) { P.row(12, 7 + hx, 12 + hx, 'S'); if (hx) P.pts([[16, 8], [16, 9], [16, 10]], 's'); }
  else P.over(5 + 2 * hx, 6, 14 + hx, 12, 's');
  trFeatures(P, v, f);
  if (side) {
    P.row(13, 7, 12, 'j'); P.rect(6, 14, 12, 21, 'j'); P.rect(6, 22, 12, 23, 'p');
    P.rect(6, 24, 8, 26, 'p'); P.rect(10, 24, 12, 26, 'p');
    P.rect(5, 27, 8, 28, 'f'); P.rect(10, 27, 13, 28, 'f'); P.row(29, 5, 8, 'F'); P.row(29, 10, 13, 'F');
  } else {
    P.row(13, 5, 14, 'j'); P.rect(6, 14, 13, 21, 'j'); P.rect(6, 22, 13, 23, 'p');
    P.rect(6, 24, 8, 26, 'p'); P.rect(11, 24, 13, 26, 'p');
    P.rect(5 + fs, 27, 8 + fs, 28, 'f'); P.rect(11, 27, 14 + fs, 28, 'f'); P.row(29, 5 + fs, 8 + fs, 'F'); P.row(29, 11, 14 + fs, 'F');
  }
}
const trSleeves = (sleeve, cuff, hand, k, n = 5) => [...Array(n).fill([sleeve, sleeve]), ...(k === 'R' ? [['Q', 'B'], ['B', 'B']] : [[cuff, cuff], [hand, hand]]).slice(0, 7 - n), [hand, hand]];

const TRAINER_LOOKS = {
  // T1: messy dark hair with red streaks (her: a ponytail), goggles, a long red scarf, a patched
  // cropped bomber over a grey tee, cargo shorts over leggings, boots
  scarf: {
    name: 'Scarf Tamer',
    pal: { h: '#3a3248', H: '#d8343a', e: '#5a5070', j: '#8e5a34', J: '#6a4024', t: '#8e8c98', T: '#6c6a78', a: '#e03a3e', A: '#a01e2a',
      p: '#b8a272', P: '#958056', L: '#2a2832', f: '#7a4a28', F: '#3e2414', m: '#3a3644', M: '#55505e', y: '#8ae0ff', o: '#6a7a42', g: '#2e2a34', b: '#4a3424' },
    arm: (k) => trSleeves('j', 'J', 'g', k),
    draw(P, v, f, { side, back, hx, face }) {
      if (side) {
        if (!f) P.pts([[3, 2], [2, 3], [2, 4], [1, 5], [2, 6], [2, 7]], 'h');
        P.pts([[6, 2], [7, 2], [5, 3]], 'H'); P.pts([[4, 6], [5, 8], [6, 5]], 'e');
        P.row(4, 3, 14, 'm'); P.rect(13, 3, 14, 4, 'y');
        P.pts([[11, 6], [13, 6], [14, 6], [15, 5]], 'h');
        if (f) { P.pts([[2, 2], [1, 3], [2, 3], [1, 4], [2, 4], [1, 5], [1, 6], [1, 7], [2, 8]], 'h'); P.pts([[1, 5], [1, 6]], 'H'); P.px(3, 3, 'a'); }
        P.rect(12, 14, 12, 18, 't'); P.row(19, 6, 11, 'J'); P.row(20, 6, 12, 't'); P.row(21, 6, 12, 'b');
        P.row(13, 7, 12, 'a'); P.under(7, 12, 7, 12, 'a');
        P.rect(3, 13, 6, 14, 'a'); P.pts([[2, 14], [2, 15], [1, 15], [1, 16]], 'a'); P.pts([[3, 14], [1, 16]], 'A');
      } else {
        P.pts([[7, 1], [11, 1]], '.', hx); P.pts([[5, 1], [14, 1], [3, 4], [16, 4]], 'h', hx);
        P.pts([[7, 2], [8, 2], [12, 2]], 'H', hx); P.pts([[10, 2], [11, 3], [6, 3], [5, 5], [14, 5]], 'e', hx);
        if (back) P.pts([[6, 7], [7, 8], [12, 7], [13, 9], [9, 6], [10, 9]], 'e', hx);
        P.row(4, 4 + hx, 15 + hx, 'm');
        if (back) P.pts([[9, 4], [10, 4]], 'M', hx);
        else { const [e0, e1] = face.eyes; P.rect(e0 - 1, 3, e0, 4, 'y'); P.rect(e1, 3, e1 + 1, 4, 'y');
          P.pts([[5, 6], [6, 6], [8, 6], [11, 6], [13, 6], [14, 6]], 'h', hx); P.px(13 + hx, 6, 'H'); }
        if (f && !back) { P.pts([[5, 11], [14, 11]], 'h', hx);
          P.pts([[3, 3], [2, 4], [3, 4], [1, 5], [2, 5], [1, 6], [2, 6], [1, 7], [1, 8]], 'h', hx); P.px(2 + hx, 5, 'H'); P.px(3 + hx, 4, 'a'); }
        // the jacket: open over the tee, cropped, a patch
        const tx = back ? -1 : 9 + hx;
        if (tx > 0) P.rect(tx, 14, tx + 1, 20, 't');
        for (let x = 6; x <= 13; x++) if (x !== tx && x !== tx + 1) P.px(x, 19, 'J');
        P.row(20, 6, 13, 't'); P.row(21, 6, 13, 'b'); P.pts([[9, 21], [10, 21]], 'm');
        P.rect(back ? 8 : 11 + hx, 15, back ? 9 : 12 + hx, 16, 'o');
        // the scarf: wrapped round the neck, one end down the chest (down the back from behind)
        P.row(13, 6, 13, 'a'); P.under(6, 12, 13, 12, 'a'); if (back) P.row(12, 6, 13, 'a');
        const sx = back ? 11 : 7 + hx;
        P.rect(sx, 14, sx + 1, 19, 'a'); P.rect(sx + 1, 15, sx + 1, 19, 'A'); P.px(sx, 20, 'a');
        if (f && back) { P.rect(9 + hx, 5, 10 + hx, 14, 'h'); P.pts([[9, 7], [10, 9], [9, 11], [10, 13]], 'e', hx); P.pts([[9, 5], [10, 5]], 'a', hx); P.px(9 + hx, 15, 'h'); }
        P.pts([[6, 23], [13, 23]], 'P');
      }
      for (let x = 0; x < TW; x++) { if (P.at(x, 25) === 'p') P.px(x, 25, 'L'); if (P.at(x, 26) === 'p') P.px(x, 26, 'f'); }
    },
  },
  // T2: a khaki bucket hat with a red band, round glasses, a long khaki coat, a red neckerchief,
  // a satchel, rolled trousers, boots (her: a bob)
  researcher: {
    name: 'Field Researcher',
    pal: { h: '#5a3a24', H: '#7a5236', c: '#cdb27a', C: '#a68a56', a: '#cc3a34', A: '#962a26', j: '#bc9c64', J: '#94784a',
      t: '#ece6d4', T: '#c4bca8', p: '#6e6448', P: '#544a34', w: '#d8c8a0', W: '#b8a882', b: '#6a4226', n: '#9a6436',
      m: '#3a3036', M: '#2a2228', y: '#d4f0f6', f: '#5a3a22', F: '#2e1e12' },
    palF: { h: '#8a3a22', H: '#b85a34' },
    arm: (k) => trSleeves('j', 'J', 's', k),
    draw(P, v, f, { side, back, hx, face }) {
      // the hat: crown, band, brim (the brim shades the face)
      const span = side ? TR_HEAD_SIDE : TR_HEAD;
      for (const [y, x0, x1] of span) if (y <= 4) P.row(y, x0 + hx, x1 + hx, 'c');
      if (side) { P.row(4, 3, 13, 'a'); P.row(5, 1, 16, 'c'); P.row(5, 1, 3, 'C'); }
      else { P.row(4, 5 + hx, 14 + hx, 'a'); P.row(5, 3 + hx, 16 + hx, 'c'); P.pts([[3, 5], [16, 5]], 'C', hx); }
      for (let x = 0; x < TW; x++) if (P.at(x, 6) === 's') P.px(x, 6, 'S');
      // hair
      if (side) {
        if (f) { P.rect(3, 6, 8, 11, 'h'); P.pts([[2, 7], [2, 8], [2, 9], [2, 10], [2, 11]], 'h'); P.pts([[10, 6], [11, 6]], 'h'); P.pts([[4, 8], [5, 10]], 'H'); }
        else { P.rect(3, 9, 5, 11, '.'); P.pts([[6, 9], [6, 10]], 'h'); }
      } else if (back) {
        if (f) { P.rect(4 + hx, 6, 15 + hx, 11, 'h'); P.pts([[3, 7], [3, 8], [3, 9], [3, 10], [3, 11], [16, 7], [16, 8], [16, 9], [16, 10], [16, 11]], 'h', hx); P.pts([[6, 8], [12, 10]], 'H', hx); if (hx) P.pts([[17, 8], [17, 9]], 'h'); }
        else { P.row(11, 0, TW - 1, '.'); P.rect(8 + hx, 11, 11 + hx, 12, 'S'); P.pts([[6, 8], [13, 9], [9, 7]], 'H', hx); }
      } else if (f) {
        P.rect(3 + hx, 6, 4 + hx, 11, 'h'); P.rect(15 + hx, 6, 16 + hx, 11, 'h'); P.row(6, 5 + hx, 14 + hx, 'h'); P.pts([[7, 6], [12, 6]], 'H', hx);
      } else P.pts([[4, 9], [4, 10], [15, 9], [15, 10]], '.', hx);
      // round glasses
      if (side) { P.pts([[13, 8], [13, 9]], 'y'); P.row(8, 10, 11, 'm'); }
      else if (!back) {
        const [e0, e1] = face.eyes;
        P.pts([[e0 - 1, 8], [e0 - 1, 9], [e1 + 1, 8], [e1 + 1, 9]], 'y'); P.row(8, e0 + 1, e1 - 1, 'm'); P.pts([[e0 - 2, 8], [e1 + 2, 8]], 'm');
      }
      // the coat, neckerchief and satchel
      if (side) {
        P.pts([[11, 13], [12, 13], [12, 14], [13, 14]], 'a'); P.px(12, 15, 't');
        P.rect(4, 22, 8, 23, 'j'); P.px(12, 22, 'j');
        P.rect(3, 19, 6, 22, 'n'); P.row(19, 3, 6, 'b'); P.px(5, 20, 'm');
      } else if (back) {
        P.rect(9, 17, 9, 23, 'J'); P.rect(5, 22, 14, 23, 'j'); P.rect(9, 22, 10, 23, 'J');
        P.pts([[7, 14], [8, 15], [9, 16], [10, 17], [11, 18], [12, 19]], 'b'); P.rect(11, 19, 14, 22, 'n'); P.row(19, 11, 14, 'b');
        P.pts([[6, 13], [13, 13]], 'a');
      } else {
        P.pts([[7, 13], [12, 13]], 't'); P.row(13, 8, 11, 'a'); P.pts([[9, 14], [10, 14]], 'a');
        P.rect(9, 15, 10, 18, 't'); P.rect(5, 22, 8, 23, 'j'); P.rect(11, 22, 14, 23, 'j');
        P.pts([[12, 14], [11, 15], [10, 16], [9, 17], [8, 18], [7, 19]], 'b');
        P.rect(5, 19, 8, 22, 'n'); P.row(19, 5, 8, 'b'); P.px(7, 20, 'm');
      }
      for (let x = 0; x < TW; x++) if (P.at(x, 26) === 'p') P.px(x, 26, 'w');
    },
  },
  // T3: a crimson hood and a long torn coat, a steel chest plate, a coil of rope, a metal
  // gauntlet, a lantern at the belt, tall boots (her: a braid)
  diver: {
    name: 'Dungeon Diver',
    pal: { h: '#1e1a22', H: '#3a3440', c: '#b42c36', C: '#7e1e28', j: '#7a2430', J: '#561820', t: '#2e2a36', T: '#201e28',
      m: '#b0b8c4', M: '#78808e', b: '#5a3a26', n: '#c8a46a', y: '#ffd76a', p: '#3a3442', P: '#2a2632', f: '#3a2a22', F: '#1e1612' },
    palF: { h: '#3a2420', H: '#6a4232' },
    arm: (k) => k === 'R' ? trSleeves('j', 'J', 'b', k) : [['j', 'j'], ['j', 'j'], ['j', 'j'], ['j', 'j'], ['m', 'M'], ['m', 'M'], ['m', 'M'], ['m', 'M']],
    draw(P, v, f, { side, back, hx }) {
      const span = side ? TR_HEAD_SIDE : TR_HEAD;
      for (const [y, x0, x1] of span) if (y <= 11) P.row(y, x0 + hx, x1 + hx, 'c');
      if (side) {
        P.over(9, 6, 15, 12, 's'); P.rect(8, 6, 8, 11, 'C'); P.row(6, 9, 14, 'S'); P.pts([[10, 6], [11, 6], [13, 6]], 'h');
        trFeatures(P, v, f); P.pts([[3, 11], [4, 11], [4, 12], [5, 12], [2, 3]], 'c');
        P.row(13, 6, 12, 'c'); P.row(14, 6, 12, 'C'); P.rect(11, 15, 12, 18, 'm'); P.row(18, 11, 12, 'M');
        P.rect(4, 22, 7, 25, 'j'); P.pts([[4, 26], [6, 26]], 'j');
        P.pts([[12, 21], [13, 21], [12, 24], [13, 24]], 'm'); P.rect(12, 22, 13, 23, 'y');
        if (f) { for (let y = 11; y <= 18; y++) P.pts([[3, y], [4, y]], y % 2 ? 'h' : 'H'); P.px(3, 19, 'n'); }
      } else if (back) {
        P.row(12, 6 + hx, 13 + hx, 'c'); P.row(13, 5, 14, 'c'); P.row(14, 6, 13, 'C'); P.rect(9 + hx, 2, 9 + hx, 10, 'C');
        P.rect(9, 15, 10, 20, 'J'); P.row(21, 6, 13, 'b');
        P.rect(5, 22, 14, 25, 'j'); P.rect(9, 22, 10, 25, 'J'); P.pts([[5, 26], [7, 26], [9, 26], [12, 26], [14, 26]], 'j');
        if (f) { for (let y = 12; y <= 19; y++) P.pts([[9, y], [10, y]], y % 2 ? 'h' : 'H', hx); P.pts([[9, 20], [10, 20]], 'n', hx); }
      } else {
        const o0 = 6 + 2 * hx, o1 = 13 + hx;   // the face, framed by the hood
        P.over(o0, 6, o1, 12, 's'); P.rect(o0 - 1, 6, o0 - 1, 11, 'C'); P.rect(o1 + 1, 6, o1 + 1, 11, 'C');
        P.row(6, o0, o1, 'S'); P.pts([[o0, 6], [o0 + 1, 6], [o0 + 3, 6], [o1 - 1, 6], [o1, 6]], 'h');
        trFeatures(P, v, f);
        P.under(6, 12, 13, 12, 'c'); P.row(13, 5, 14, 'c'); P.row(14, 6, 13, 'C');
        P.rect(8, 15, 11, 18, 'm'); P.row(18, 8, 11, 'M'); P.px(9, 15, 'y'); P.rect(8, 19, 11, 20, 't');
        P.row(21, 6, 13, 'b'); P.pts([[9, 21], [10, 21]], 'm');
        P.pts([[12, 13], [13, 14], [12, 15], [13, 16]], 'n');
        P.rect(5, 22, 7, 25, 'j'); P.rect(12, 22, 14, 25, 'j'); P.pts([[5, 25], [7, 25], [12, 25]], '.'); P.pts([[6, 26], [13, 26]], 'j');
        P.pts([[13, 21], [14, 21], [13, 24], [14, 24]], 'm'); P.rect(13, 22, 14, 23, 'y');
        P.rect(4, 19, 6, 21, 'n'); P.px(5, 20, 'b');
        if (f) { for (let y = 11; y <= 18; y++) P.pts([[6, y], [7, y]], y % 2 ? 'h' : 'H', hx); P.pts([[6, 19], [7, 19]], 'n', hx); }
      }
      for (let y = 24; y <= 26; y++) for (let x = 0; x < TW; x++) if (P.at(x, y) === 'p') P.px(x, y, 'f');
      for (let x = 0; x < TW; x++) if (P.at(x, 24) === 'f') P.px(x, 24, 'b');
    },
  },
  // T4: a ginger-and-cream hoodie with a shiba-eared hood (a curly tail on the back), black track
  // pants with a red stripe, white sneakers, a bum bag (her: ginger pigtails)
  shiba: {
    name: 'Shiba Trainer',
    pal: { h: '#3a2a24', H: '#5a4234', j: '#e48a3c', J: '#b8642a', w: '#f8ead0', W: '#dcc8a4', a: '#d8343a', A: '#a01e2a',
      p: '#2a2730', P: '#1a1820', f: '#f6f4f0', F: '#bcb8b2', b: '#3a3644', m: '#8a8e9a' },
    palF: { h: '#d4702c', H: '#f0a050' },
    arm: (k) => trSleeves('j', 'J', 's', k),
    draw(P, v, f, { side, back, hx }) {
      const span = side ? TR_HEAD_SIDE : TR_HEAD;
      P.row(1, 0, TW - 1, '.'); P.row(2, 0, TW - 1, '.');
      for (const [y, x0, x1] of span) if (y >= 3 && y <= 11) P.row(y, x0 + hx, x1 + hx, 'j');
      if (side) {
        P.px(3, 3, '.'); P.pts([[10, 1], [9, 2], [10, 2], [11, 3], [6, 1], [5, 2], [6, 2]], 'j'); P.px(10, 2, 'w');
        P.over(10, 6, 15, 12, 's'); P.rect(9, 5, 9, 11, 'w'); P.row(5, 10, 14, 'w'); P.row(6, 10, 14, 'h'); P.px(10, 7, 'h');
        trFeatures(P, v, f); P.px(9, 12, 'j');
        if (f) { P.pts([[2, 8], [1, 9], [2, 9], [1, 10], [2, 10], [2, 11]], 'h'); P.px(1, 9, 'H'); }
        P.pts([[12, 14], [12, 15]], 'w'); P.rect(11, 17, 12, 19, 'w'); P.row(20, 6, 12, 'J'); P.row(21, 6, 12, 'b');
        P.rect(11, 20, 13, 22, 'b'); P.px(12, 21, 'a');
        P.pts([[5, 15], [4, 15], [4, 16], [5, 16], [4, 14]], 'w');
        P.rect(7, 22, 7, 26, 'a'); P.rect(11, 22, 11, 26, 'a');
      } else {
        P.pts([[4, 3], [15, 3]], '.', hx);
        P.pts([[5, 1], [5, 2], [6, 2], [14, 1], [13, 2], [14, 2]], 'j', hx);
        if (back) {
          P.row(12, 6 + hx, 13 + hx, 'j');
          P.rect(8, 14, 11, 17, 'w'); P.pts([[8, 14], [11, 17]], 'j'); P.pts([[9, 15], [10, 16]], 'W');
        } else {
          P.pts([[6, 2], [13, 2]], 'w', hx);
          const o0 = 6 + 2 * hx, o1 = 13 + hx;
          P.over(o0, 6, o1, 12, 's'); P.rect(o0 - 1, 5, o0 - 1, 11, 'w'); P.rect(o1 + 1, 5, o1 + 1, 11, 'w'); P.row(5, o0, o1, 'w');
          P.row(6, o0, o1, 'h'); P.px(o0 + 3, 6, 's'); P.px(o0 + 2, 7, 'h');
          trFeatures(P, v, f);
          P.pts([[8, 14], [8, 15], [11, 14], [11, 15]], 'w'); P.rect(8, 16, 11, 19, 'w'); P.row(17, 8, 11, 'W');
        }
        if (f) { P.pts([[3, 8], [2, 9], [3, 9], [2, 10], [3, 10], [3, 11], [16, 8], [16, 9], [17, 9], [16, 10], [17, 10], [16, 11]], 'h', hx); P.pts([[2, 9], [17, 10]], 'H', hx); }
        P.row(20, 6, 13, 'J'); P.row(21, 6, 13, 'b');
        if (!back) { P.rect(10, 20, 13, 22, 'b'); P.pts([[11, 21], [12, 21]], 'a'); }
        P.rect(6, 22, 6, 26, 'a'); P.rect(13, 22, 13, 26, 'a');
        P.pts([[7, 28], [12, 28]], 'a');
      }
    },
  },
};
// A look's key, its palette, and its map (cached; `noArm` = 'L' / 'R' / 'LR' leaves arms off for posing)
const trainerLook = (id, look) => (TRAINER_LOOKS[id] ? id : 'scarf') + '-' + (look === 'f' ? 'f' : 'm');
function trainerPal(look) {
  const [id, sex] = look.split('-'), T = TRAINER_LOOKS[id] || TRAINER_LOOKS.scarf;
  return { ...TRAINER_SKIN, ...T.pal, ...(sex === 'f' ? T.palF : null) };
}
function trainerArmCols(look, k) {
  const [id] = look.split('-');
  return (TRAINER_LOOKS[id] || TRAINER_LOOKS.scarf).arm(k);
}
const _trmaps = {};
function trainerMap(look, view, noArm = '') {
  const key = look + view + noArm;
  if (_trmaps[key]) return _trmaps[key];
  const [id, sex] = look.split('-'), T = TRAINER_LOOKS[id] || TRAINER_LOOKS.scarf, f = sex === 'f';
  const v = TRAINER_VIEWS.includes(view) ? view : 'front', P = trPainter();
  trBase(P, v, f);
  T.draw(P, v, f, trCtx(v));
  const arms = TRAINER_ARMS[v];
  for (const k of ['L', 'R']) if (arms[k] && !noArm.includes(k)) trArm(P, arms[k], 0, T.arm(k, f));
  trInk(P);
  return (_trmaps[key] = P.g.map(r => r.join('')));
}
// every look, for the gallery and review pages: { 'scarf-m': { name }, ... }
const TRAINER_OUTFITS = {};
for (const id of Object.keys(TRAINER_LOOKS)) for (const s of ['m', 'f']) TRAINER_OUTFITS[id + '-' + s] = { name: TRAINER_LOOKS[id].name + (s === 'f' ? ' (her)' : ' (him)') };
const TRAINER_OUTFIT = 'scarf-m';    // the default look

// The trainer's walk: 4 frames (both feet down, the left leg lifted, both down, the right leg
// lifted). A lifted leg is its half of the shoe rows (split at column TR_SPLIT) moved up a pixel.
function trainerStep(map, leg) {
  return map.map((row, y) => {
    if (y < TR_FEET) return row;
    const up = (map[y + 1] || '').padEnd(row.length, '.');
    return leg === 0 ? up.slice(0, TR_SPLIT) + row.slice(TR_SPLIT) : row.slice(0, TR_SPLIT) + up.slice(TR_SPLIT);
  });
}
// trainer pictures are made once per look and view
const _trainer = {};
function trainerWalk(look = TRAINER_OUTFIT, view = 'front') {
  const key = 'w' + look + view;
  if (_trainer[key]) return _trainer[key];
  const map = trainerMap(look, view), pal = trainerPal(look), still = trainerCanvas(look, view);
  return (_trainer[key] = [still, gridFromMap(trainerStep(map, 0), pal).toCanvas(), still, gridFromMap(trainerStep(map, 1), pal).toCanvas()]);
}
function trainerCanvas(look = TRAINER_OUTFIT, view = 'front') {
  const key = 'c' + look + view;
  if (_trainer[key]) return _trainer[key];
  return (_trainer[key] = gridFromMap(trainerMap(look, view), trainerPal(look)).toCanvas());
}
