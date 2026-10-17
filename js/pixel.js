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
function numberCanvas(text, fill = '#fff6c8', shade = '#e0b040') {
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

// ---------- trainers ----------
const TRAINER_FRONT = [
  '...kkkkkk...',
  '..khhhhhhk..',
  '.khhhwwhhhk.',
  '.khhhhhhhhk.',
  'kkHHHHHHHHkk',
  '.krsssssssk.',
  '.krsksskssk.',
  '..kssssssk..',
  '..kjjwwjjk..',
  '.kjjjwwjjjk.',
  'kjjjjwwjjjjk',
  'ksjjjwwjjjsk',
  'kskjjjjjjksk',
  '.kkppppppkk.',
  '..kppkkppk..',
  '..kpk..kpk..',
  '..kbk..kbk..',
  '..kkk..kkk..',
];
const TRAINER_BACK = [
  '...kkkkkk...',
  '..khhhhhhk..',
  '.khhhhhhhhk.',
  '.khhhhhhhhk.',
  '.kHHHHHHHHk.',
  '.krrrrrrrrk.',
  '.krrrrrrrrk.',
  '..krrrrrrk..',
  '..kjjjjjjk..',
  '.kjjjjjjjjk.',
  'kjjjJJJJjjjk',
  'ksjjjJJjjjsk',
  'kskjjjjjjksk',
  '.kkppppppkk.',
  '..kppkkppk..',
  '..kpk..kpk..',
  '..kbk..kbk..',
  '..kkk..kkk..',
];

const TRAINER_PALS = {
  player: { k: OUTLINE, h: '#e2363c', H: '#a01f2a', w: '#ffffff', s: '#f6c79a', r: '#3a2418', j: '#2f62c8', J: '#244c9c', p: '#2a2a3a', b: '#5a3a2a' },
  rival:  { k: OUTLINE, h: '#f2c12e', H: '#2a2a3a', w: '#2a2a3a', s: '#f6c79a', r: '#1c1c2a', j: '#d8402e', J: '#a8301e', p: '#e6dcc6', b: '#c0402e' },
};

function trainerCanvas(side, back) {
  return gridFromMap(back ? TRAINER_BACK : TRAINER_FRONT, TRAINER_PALS[side]).toCanvas();
}
