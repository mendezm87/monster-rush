// Attack art: everything an attack draws (shots, beams, blasts, zone hits, vortexes, buff
// and heal effects, hit sparks). It all goes into a small pixel layer where one pixel is a
// sprite pixel (1.5 world units), gets a dark ink outline like the monsters, has its soft
// edges snapped to hard pixels, and is scaled up without smoothing. So attacks are chunky,
// crisp pixel art at any screen size, drawn after the lighting so they stay bright.
// Each look ("style") has its own art: bolts, flames, leaves, bubbles, shards, rings and so on. A
// move's style is `mv.style`, or its type when it has none (a game whose types are the looks); the
// type decides the damage, the style only what it looks and sounds like (a stinger stays a stinger).

const FX_PX = 1.5;   // world units per effect pixel (the size of a sprite pixel)
const INK = OUTLINE;
// the palette of each style
const FX_STYLES = {
  normal: ['#ff8a2a', '#ffd36b', '#fffbe6'],
  fire: ['#ff4a1c', '#ffa424', '#fff3b0'],
  water: ['#2f6bff', '#6fb6ff', '#e6f6ff'],
  grass: ['#2f9e3a', '#8be04e', '#eaffc8'],
  electric: ['#ffc21f', '#fff27a', '#ffffff'],
  ice: ['#5ab8e8', '#aeeaff', '#ffffff'],
  ground: ['#8a5a2b', '#d6a356', '#f7e2b0'],
  rock: ['#6e5a3a', '#b59a62', '#efe0b8'],
  dragon: ['#5a2bd6', '#a77bff', '#f1e6ff'],
  psychic: ['#d62f8a', '#ff8ad0', '#ffe6f6'],
  dark: ['#2a1a3a', '#7a4aa8', '#e2d0ff'],
  fighting: ['#b0281e', '#ff6a3a', '#ffe0c8'],
  flying: ['#7a8ae8', '#c8d4ff', '#ffffff'],
  poison: ['#7a2a9a', '#c86ae0', '#f0d0ff'],
  bug: ['#6a8a12', '#c8e03a', '#f4ffc0'],
  ghost: ['#3a2a6a', '#8a6ad8', '#e0d4ff'],
  steel: ['#7a8498', '#c8d0e0', '#ffffff'],
  fairy: ['#e86aa8', '#ffb4dc', '#fff0fa'],
};
const styleOf = mv => mv.style || mv.type;
// a move's colours: its own palette if it has one (Mud Shot), else its style's, else its type's
const fxOf = mv => mv.palette || FX_STYLES[styleOf(mv)] || TYPES[mv.type].fx;
// a move's debris: its own if its look needs it (bubbles, mud), else its style's
const debrisOf = mv => (mv.fx === 'bubble' ? 'bubble' : mv.fx === 'mud' ? 'mud' : FX_DEBRIS[styleOf(mv)] || 'star');

const FXLayer = (() => {
  const w = Math.ceil(W / FX_PX) + 2, h = Math.ceil(H / FX_PX) + 2;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d', { willReadFrequently: true });
  return {
    // start a frame; draw in world coordinates, with the same camera as the room
    begin(camX, camY) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
      c.setTransform(1 / FX_PX, 0, 0, 1 / FX_PX, -camX / FX_PX, -camY / FX_PX);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.globalAlpha = 1; c.imageSmoothingEnabled = false;   // sheet frames stay crisp pixels
      return c;
    },
    // hard pixel edges (no half-see-through fringes), then onto the screen
    end(ctx) {
      const img = c.getImageData(0, 0, w, h), d = img.data;
      for (let i = 3; i < d.length; i += 4) if (d[i]) d[i] = d[i] < 100 ? 0 : 255;
      c.putImageData(img, 0, 0);
      ctx.save(); ctx.setTransform(RES * FX_PX, 0, 0, RES * FX_PX, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cv, 0, 0); ctx.restore();
    },
  };
})();

// ---------- drawing helpers (world units; outlines come out one pixel wide) ----------
const FXD = {
  // build a path, ink round it, then fill it
  ink(c, path, fill, w = 3) {
    c.beginPath(); path();
    c.strokeStyle = INK; c.lineWidth = w; c.stroke();
    if (fill) { c.fillStyle = fill; c.fill(); }
  },
  circle(c, x, y, r, fill, w) { this.ink(c, () => c.arc(x, y, Math.max(0.5, r), 0, TAU), fill, w); },
  dot(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, Math.max(0.5, r), 0, TAU); c.fillStyle = fill; c.fill(); },
  star(c, x, y, ro, ri, n, rot, fill, w) {
    this.ink(c, () => {
      for (let i = 0; i < n * 2; i++) {
        const r = i % 2 ? ri : ro, a = rot + i * Math.PI / n;
        i ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      c.closePath();
    }, fill, w);
  },
  line(c, pts, lw, col) {
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = col; c.lineWidth = lw; c.stroke();
  },
  // a jagged lightning bolt from (x1, y1) to (x2, y2), with a few side forks
  bolt(c, x1, y1, x2, y2, seed, w = 3.5, col = '#ffe066', amp = 7, forks = true) {
    const rnd = mulberry(seed | 0), d = Math.hypot(x2 - x1, y2 - y1) || 1;
    const n = Math.max(2, Math.round(d / 10)), nx = -(y2 - y1) / d, ny = (x2 - x1) / d, pts = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, o = i === 0 || i === n ? 0 : (rnd() - 0.5) * 2 * amp;
      pts.push([x1 + (x2 - x1) * k + nx * o, y1 + (y2 - y1) * k + ny * o]);
    }
    const br = [];
    if (forks) for (let i = 1; i < n; i++) {
      if (rnd() > 0.35) continue;
      const [bx, by] = pts[i], a = Math.atan2(y2 - y1, x2 - x1) + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.7), L = 7 + rnd() * 11;
      br.push([[bx, by], [bx + Math.cos(a) * L * 0.5 + (rnd() - 0.5) * 4, by + Math.sin(a) * L * 0.5 + (rnd() - 0.5) * 4], [bx + Math.cos(a) * L, by + Math.sin(a) * L]]);
    }
    for (const b of br) this.line(c, b, w * 0.6 + 3, INK);
    this.line(c, pts, w + 3, INK);
    for (const b of br) this.line(c, b, w * 0.6, col);
    this.line(c, pts, w, col);
    this.line(c, pts, Math.max(1.2, w * 0.35), '#ffffff');
  },
  leaf(c, x, y, ang, s, fill = '#8be04e', vein = '#2f9e3a') {
    c.save(); c.translate(x, y); c.rotate(ang);
    this.ink(c, () => { c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.75, s, 0); c.quadraticCurveTo(0, s * 0.75, -s, 0); }, fill);
    this.line(c, [[-s * 0.75, 0], [s * 0.7, 0]], 1.2, vein);
    c.restore();
  },
  // a flame / comet pointing along +x, its tail flickering behind
  flame(c, x, y, ang, r, cols, t) {
    c.save(); c.translate(x, y); c.rotate(ang);
    const shape = k => () => {
      const wob = Math.sin(t * 32) * r * 0.35 * k;
      c.moveTo(0, -r * k); c.arc(0, 0, r * k, -Math.PI / 2, Math.PI / 2);
      c.quadraticCurveTo(-r * 1.3 * k, r * 0.85 * k, -r * 2.9 * k, wob);
      c.quadraticCurveTo(-r * 1.3 * k, -r * 0.85 * k, 0, -r * k);
    };
    this.ink(c, shape(1), cols[0]);
    c.beginPath(); shape(0.7)(); c.fillStyle = cols[1]; c.fill();
    this.dot(c, r * 0.15, 0, r * 0.42, cols[2]);
    c.restore();
  },
  // a long crystal shard pointing along +x
  shard(c, x, y, ang, s, cols) {
    c.save(); c.translate(x, y); c.rotate(ang);
    this.ink(c, () => { c.moveTo(s * 1.7, 0); c.lineTo(0, -s * 0.6); c.lineTo(-s * 1.1, 0); c.lineTo(0, s * 0.6); c.closePath(); }, cols[1]);
    c.beginPath(); c.moveTo(s * 1.5, 0); c.lineTo(0, -s * 0.45); c.lineTo(-s * 0.7, 0); c.closePath(); c.fillStyle = cols[2]; c.fill();
    c.restore();
  },
  // a chunky rock
  rock(c, x, y, rot, s, cols, seed) {
    const rnd = mulberry((seed * 9973) | 0), pts = [];
    for (let i = 0; i < 7; i++) { const a = rot + i * TAU / 7, r = s * (0.75 + rnd() * 0.35); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    this.ink(c, () => { pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); }, cols[1]);
    c.beginPath(); c.moveTo(pts[3][0], pts[3][1]); c.lineTo(pts[4][0], pts[4][1]); c.lineTo(pts[5][0], pts[5][1]); c.lineTo(x, y); c.closePath();
    c.fillStyle = cols[2]; c.fill();
    this.dot(c, x + s * 0.2, y + s * 0.25, s * 0.18, cols[0]);
  },
  ring(c, x, y, r, col, w = 2.5, squash = 0.7) {
    if (r <= 0.5) return;
    c.beginPath(); c.ellipse(x, y, r, r * squash, 0, 0, TAU);
    c.strokeStyle = INK; c.lineWidth = w + 3; c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.stroke();
  },
  // a curved wind blade
  crescent(c, x, y, ang, s, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    this.ink(c, () => { c.arc(0, 0, s, -1.2, 1.2); c.arc(-s * 0.45, 0, s * 0.85, 1.15, -1.15, true); c.closePath(); }, col);
    c.restore();
  },
  // a wobbly blob (sludge, water)
  blob(c, x, y, r, t, fill, seed = 0) {
    this.ink(c, () => {
      for (let i = 0; i <= 10; i++) {
        const a = i / 10 * TAU, rr = r * (1 + 0.14 * Math.sin(t * 11 + i * 1.9 + seed));
        i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      c.closePath();
    }, fill);
  },
  hexShield(c, x, y, r, col) {
    const hex = (hx, hy, s) => { c.moveTo(hx + s, hy); for (let i = 1; i <= 6; i++) c.lineTo(hx + Math.cos(i * Math.PI / 3) * s, hy + Math.sin(i * Math.PI / 3) * s); };
    const s = r / 3.2;
    c.beginPath();
    for (let q = -3; q <= 3; q++) for (let rr = -3; rr <= 3; rr++) {
      const hx = x + q * s * 1.5, hy = y + (rr + q / 2) * s * Math.sqrt(3);
      if (Math.hypot(hx - x, (hy - y) * 1.15) < r - s * 0.4) hex(hx, hy, s);
    }
    c.strokeStyle = INK; c.lineWidth = 3.2; c.stroke();
    c.strokeStyle = col; c.lineWidth = 1.4; c.stroke();
  },
};

// The debris an attack's type throws out, used by hits, blasts and zone landings.
const FX_DEBRIS = {
  electric: 'bolt', fire: 'flame', water: 'drop', grass: 'leaf', ice: 'shard', rock: 'rock', ground: 'rock',
  poison: 'bubble', psychic: 'ring', dark: 'ring', ghost: 'flame', dragon: 'flame', fairy: 'star', normal: 'star',
  fighting: 'star', steel: 'star', flying: 'feather', bug: 'leaf',
};

// Particle kinds drawn by the effect layer (see drawParticles). k = life left, 1 -> 0.
const FX_PARTS = {
  // the comic "pow" star where a hit lands
  impact(c, p, k) {
    const age = 1 - k, sc = age < 0.25 ? 0.5 + age / 0.25 * 0.5 : 1 - (age - 0.25) / 0.75 * 0.75;
    FXD.star(c, p.x, p.y, p.size * sc, p.size * sc * 0.45, 8, p.rot, p.color);
    FXD.star(c, p.x, p.y, p.size * sc * 0.55, p.size * sc * 0.25, 8, p.rot + 0.2, '#ffffff', 0);
  },
  // a shockwave ring, growing
  wave(c, p, k) { FXD.ring(c, p.x, p.y, p.r1 + (p.r0 - p.r1) * k, p.color, Math.max(1, p.w * k + 0.6)); },
  // one shaped piece of debris
  deb(c, p, k) {
    const s = p.size * (0.45 + 0.55 * k), a = Math.atan2(p.vy, p.vx), fx = p.fx;
    switch (p.shape) {
      case 'leaf': FXD.leaf(c, p.x, p.y, p.rot + p.life * 9, s * 1.3, fx[1], fx[0]); break;
      case 'flame': FXD.flame(c, p.x, p.y, a, s * 0.8, fx, p.life * 7); break;
      case 'shard': FXD.shard(c, p.x, p.y, a, s * 0.9, fx); break;
      case 'rock': FXD.rock(c, p.x, p.y, p.rot, s, fx, p.seed); break;
      case 'drop': FXD.ink(c, () => { c.save(); c.translate(p.x, p.y); c.rotate(a); c.arc(0, 0, s * 0.7, -Math.PI / 2, Math.PI / 2); c.lineTo(-s * 1.8, 0); c.closePath(); c.restore(); }, fx[1]); FXD.dot(c, p.x, p.y - s * 0.2, s * 0.25, fx[2]); break;
      case 'bubble': FXD.ring(c, p.x, p.y, s * 0.8, fx[1], 1.2, 1); break;
      case 'mud': FXD.blob(c, p.x, p.y, s * 0.75, p.life * 10, fx[1], p.seed); FXD.dot(c, p.x - s * 0.2, p.y - s * 0.25, s * 0.2, fx[2]); break;
      case 'ring': FXD.ring(c, p.x, p.y, s * (2 - k), fx[1], 1.4, 0.7); break;
      case 'bolt': FXD.bolt(c, p.x, p.y, p.x + Math.cos(a) * s * 2.6, p.y + Math.sin(a) * s * 2.6, p.seed, 2, fx[1], 3, false); break;
      case 'feather': FXD.crescent(c, p.x, p.y, a, s * 1.1, fx[2]); break;
      case 'paper': c.save(); c.translate(p.x, p.y); c.rotate(p.rot + p.life * 12); FXD.ink(c, () => c.rect(-s * 0.8, -s * 0.6, s * 1.6, s * 1.2), '#ffffff'); FXD.line(c, [[-s * 0.5, -s * 0.15], [s * 0.5, -s * 0.15]], 0.8, '#8a8aa0'); c.restore(); break;
      case 'puff': FXD.circle(c, p.x, p.y, s * (1.3 - 0.5 * k), k > 0.5 ? fx[2] : fx[1]); break;
      case 'spark': FXD.line(c, [[p.x, p.y], [p.x - p.vx * 0.05, p.y - p.vy * 0.05]], 3.4, INK); FXD.line(c, [[p.x, p.y], [p.x - p.vx * 0.05, p.y - p.vy * 0.05]], 1.6, k > 0.5 ? fx[2] : fx[1]); break;
      default: FXD.star(c, p.x, p.y, s, s * 0.45, 4, p.rot + p.life * 6, fx[1]);
    }
  },
  // a lightning strike from the sky (Thunder) or an outward crack of lightning (Discharge)
  strike(c, p, k) { FXD.bolt(c, p.x2, p.y2, p.x, p.y, p.seed + ((1 - k) * 3 | 0), 4.5 * k + 1.5, p.color, 9); },
  // rising + signs (healing)
  plus(c, p, k) {
    const s = p.size;
    FXD.ink(c, () => { c.rect(p.x - s, p.y - s * 0.35, s * 2, s * 0.7); c.rect(p.x - s * 0.35, p.y - s, s * 0.7, s * 2); }, p.color);
    c.fillStyle = p.color; c.fillRect(p.x - s + 0.8, p.y - s * 0.35 + 0.8, s * 2 - 1.6, s * 0.7 - 1.6); c.fillRect(p.x - s * 0.35 + 0.8, p.y - s + 0.8, s * 0.7 - 1.6, s * 2 - 1.6);
  },
  // a hexagon shield dome (defence up)
  shield(c, p, k) { const age = 1 - k; FXD.hexShield(c, p.x, p.y, p.r * Math.min(1, age * 5), p.color); },
  // rising chevrons (attack / speed up)
  chevron(c, p, k) {
    const s = p.size;
    FXD.ink(c, () => { c.moveTo(p.x - s, p.y + s * 0.5); c.lineTo(p.x, p.y - s * 0.5); c.lineTo(p.x + s, p.y + s * 0.5); c.lineTo(p.x + s, p.y + s * 1.1); c.lineTo(p.x, p.y + s * 0.1); c.lineTo(p.x - s, p.y + s * 1.1); c.closePath(); }, p.color);
  },
  // a snowflake (Blizzard)
  flake(c, p, k) {
    const s = p.size;
    for (let i = 0; i < 3; i++) {
      const a = p.rot + i * Math.PI / 3, dx = Math.cos(a) * s, dy = Math.sin(a) * s;
      FXD.line(c, [[p.x - dx, p.y - dy], [p.x + dx, p.y + dy]], 3, INK);
    }
    for (let i = 0; i < 3; i++) {
      const a = p.rot + i * Math.PI / 3, dx = Math.cos(a) * s, dy = Math.sin(a) * s;
      FXD.line(c, [[p.x - dx, p.y - dy], [p.x + dx, p.y + dy]], 1.6, '#ffffff');
    }
  },
  // a gust line (wind): a short curl
  gust(c, p, k) {
    const a = Math.atan2(p.vy, p.vx), L = p.size * 3, pts = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([p.x - Math.cos(a) * L * t + Math.sin(a) * Math.sin(t * 5 + p.rot) * 2.5, p.y - Math.sin(a) * L * t - Math.cos(a) * Math.sin(t * 5 + p.rot) * 2.5]); }
    FXD.line(c, pts, 3.6, INK); FXD.line(c, pts, 2, p.color);
  },
  // three claw marks raking across (Dragon Claw), or one big crescent slash (Night Slash)
  claw(c, p, k) {
    const grow = Math.min(1, (1 - k) * 4), L = p.size * grow;
    for (let i = -1; i <= 1; i++) {
      const ox = Math.cos(p.rot + Math.PI / 2) * i * 6, oy = Math.sin(p.rot + Math.PI / 2) * i * 6, pts = [];
      for (let t = -0.5; t <= 0.51; t += 0.1) pts.push([p.x + ox + Math.cos(p.rot) * L * t + Math.sin(p.rot) * (t * t - 0.25) * 10, p.y + oy + Math.sin(p.rot) * L * t - Math.cos(p.rot) * (t * t - 0.25) * 10]);
      FXD.line(c, pts, 4.6 * k + 2, INK); FXD.line(c, pts, 2.6 * k + 0.8, i ? p.color : '#ffffff');
    }
  },
  slash(c, p, k) {
    const grow = Math.min(1, (1 - k) * 5), R = p.size;
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
    FXD.ink(c, () => { c.arc(0, 0, R, -1.4 * grow, 1.4 * grow); c.arc(-R * 0.35, 0, R * 0.8, 1.3 * grow, -1.3 * grow, true); c.closePath(); }, p.color);
    c.beginPath(); c.arc(0, 0, R - 1.5, -1.2 * grow, 1.2 * grow); c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.stroke();
    c.restore();
  },
  // a floating letter: "z", "?", "!" (Blank Stare and friends)
  glyph(c, p, k) {
    c.font = `bold ${p.size}px monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 3; c.strokeStyle = INK; c.strokeText(p.str, p.x, p.y);
    c.fillStyle = p.color; c.fillText(p.str, p.x, p.y);
  },
  // ---- heals ----
  // Snack Time: a cookie, eaten in three bites, crumbs falling, "nom!"
  snack(c, p, k) {
    const m = p.mon, age = (1 - k) * p.max, f = m.face || 1, x = m.x + f * 13, y = m.y - m.h * 0.5;
    const bites = age < 0.25 ? 0 : age < 0.45 ? 1 : age < 0.65 ? 2 : 3;
    if (bites < 3) {
      FXD.circle(c, x, y, 6.5, '#d89a58');
      FXD.dot(c, x - 2.5, y - 1.5, 1.1, '#5a3a22'); FXD.dot(c, x + 2, y + 2, 1.1, '#5a3a22'); FXD.dot(c, x + 2.5, y - 2.5, 1, '#5a3a22');
      c.save(); c.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < bites; i++) { c.beginPath(); c.arc(x - f * 9 + f * i * 2.5, y - 4 + i * 5, 5, 0, TAU); c.fill(); }
      c.restore();
    }
    for (let i = 0; i < 6; i++) {   // crumbs
      const t = (age * 1.6 + i * 0.17) % 1;
      if (age > 0.25) FXD.dot(c, x - f * 4 + (i - 3) * 2, y + 4 + t * 18, 1, i % 2 ? '#d89a58' : '#a86a38');
    }
    if (bites > 0 && (age % 0.2) < 0.13) FX_PARTS.glyph(c, { str: 'nom', x: m.x - f * 4, y: m.y - m.h - 6 - (age % 0.2) * 20, size: 8, color: '#fff3d6' });
  },
  // Photosynth: the sun comes out and pours light down onto the user
  sunbeam(c, p, k) {
    const m = p.mon, age = 1 - k, sx = m.x + 26, sy = m.y - m.h - 46, grow = Math.min(1, age * 5) * Math.min(1, k * 4);
    for (let i = -1; i <= 1; i++) {   // the rays
      const tx = m.x + i * 9, ty = m.y - 2, w = (3.5 - Math.abs(i)) * grow;
      if (w <= 0.3) continue;
      const a = Math.atan2(ty - sy, tx - sx), nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
      FXD.ink(c, () => { c.moveTo(sx + nx * 0.4, sy + ny * 0.4); c.lineTo(tx + nx, ty + ny); c.lineTo(tx - nx, ty - ny); c.lineTo(sx - nx * 0.4, sy - ny * 0.4); c.closePath(); }, '#fff27a');
    }
    FXD.star(c, sx, sy, 11 * grow + 1, 7 * grow + 1, 10, age * 3, '#ffd23f');   // the sun
    FXD.circle(c, sx, sy, 6.5 * grow + 0.5, '#ffe866');
    for (let i = 0; i < 5; i++) {   // leaves glinting in the light
      const ang = i * 1.3 + age * 6, r = m.r + 3;
      if ((i + ((age * 12) | 0)) % 2) FXD.star(c, m.x + Math.cos(ang) * r, m.cy + Math.sin(ang) * r * 0.7, 3, 1, 4, 0, '#d4ff9a', 2.4);
    }
  },
  // Blanket Nap: a cosy patchwork blanket settles over the user, and the Z's float up
  blanket(c, p, k) {
    const m = p.mon, age = (1 - k) * p.max, drop = Math.min(1, age / 0.22), lift = k < 0.12 ? (0.12 - k) / 0.12 : 0;
    const w = m.r * 1.35, top = m.y - m.h * 0.42 - (1 - drop) * 30 - lift * 30, bot = m.y + 1 - lift * 30;
    if (drop > 0) {
      const path = () => { c.moveTo(m.x - w, top + 3); c.quadraticCurveTo(m.x, top - 5, m.x + w, top + 3); for (let i = 0; i <= 6; i++) c.lineTo(m.x + w - i * (w * 2 / 6), bot + (i % 2) * 2.5); c.closePath(); };
      FXD.ink(c, path, '#d8434a');
      c.save(); c.beginPath(); path(); c.clip();
      for (let gx = -3; gx <= 3; gx++) for (let gy = 0; gy < 5; gy++) if ((gx + gy) % 2 === 0) { c.fillStyle = '#f2e6c8'; c.fillRect(m.x + gx * 6 - 3, top - 4 + gy * 6, 6, 6); }
      c.restore();
    }
    for (let i = 0; i < 3; i++) {   // Z's drifting up from the nap
      const t = (age * 0.9 + i / 3) % 1;
      if (age > 0.3) FX_PARTS.glyph(c, { str: 'Z', x: m.x + 8 + t * 12 + Math.sin(t * 6) * 2, y: m.y - m.h - 2 - t * 24, size: 7 + t * 6, color: '#cfe0ff' });
    }
  },
  // Wish: a star appears high above, twinkles, then falls onto the user in a burst of sparkle
  wishStar(c, p, k) {
    const m = p.mon, age = (1 - k) * p.max, hx = m.x, hy = m.y - m.h - 48;
    if (age < 0.55) {   // twinkling up above
      const g = Math.min(1, age / 0.2), tw = 1 + 0.18 * Math.sin(age * 40);
      FXD.star(c, hx, hy, 8 * g * tw, 3.6 * g, 5, -Math.PI / 2 + age * 2, '#ffe066');
      FXD.dot(c, hx, hy, 1.6 * g, '#ffffff');
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + age * 5, r = 13 * g; if (Math.sin(age * 30 + i * 2) > 0) FXD.star(c, hx + Math.cos(a) * r, hy + Math.sin(a) * r, 3, 0.9, 4, 0, '#fff6c8', 2.4); }
    } else if (age < 0.85) {   // falling, with a trail of little stars
      const t = (age - 0.55) / 0.3, y = hy + (m.cy - hy) * t * t;
      for (let i = 1; i <= 4; i++) FXD.star(c, hx, y - i * 7, 3 - i * 0.5, 1.2, 4, i, '#fff6c8', 2.4);
      FXD.star(c, hx, y, 8, 3.6, 5, -Math.PI / 2 + age * 8, '#ffe066');
    } else {   // a ring of sparkles bursting from the user
      const t = (age - 0.85) / 0.4, r = 6 + t * 26;
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + t; FXD.star(c, m.x + Math.cos(a) * r, m.cy + Math.sin(a) * r * 0.7, 4 * (1 - t) + 1, 1.5, 4, a, i % 2 ? '#ffe066' : '#ffffff', 2.4); }
    }
  },
  // a sheet's frames played in order (sheetPart)
  sheet(c, p, k) { drawSheet(c, p.id, p.frames[Math.min(p.frames.length - 1, Math.floor((1 - k) * p.frames.length))], p.x, p.y, p.o); },
  // a hit landing: its look's own impact (IMPACT_ART)
  hit(c, p, k) {
    const age = 1 - k;
    if (p.big) FXD.ring(c, p.x, p.y, p.size * (0.35 + age * 1.05), p.fx[2], 2.6 * k + 0.6, 0.8);   // a shock ring rolling out
    (IMPACT_ART[p.art] || IMPACT_ART.normal)(c, p.x, p.y, age, p.size, p.rot, p.fx, p.seed);
    if (age < 0.1) { const f = 1 - age / 0.1; FXD.star(c, p.x, p.y, p.size * 0.5 * f + 1, p.size * 0.12 * f + 0.4, 4, p.rot + Math.PI / 4, '#ffffff'); }   // the flash as it lands
  },
  // a speed streak behind a dashing monster
  streak(c, p, k) {
    const pts = [[p.x, p.y], [p.x - p.sx * 0.07 * k, p.y - p.sy * 0.07 * k]];
    FXD.line(c, pts, 3.4, INK); FXD.line(c, pts, 1.5, p.color);
  },
};

// ---------- hit impacts, one per look (r147, from the owner's reference sheet docs/refs/i1-impacts.webp) ----------
// Drawn where a hit lands, on the side the hit came from, so the target stays visible. age 0 -> 1, s the
// size (bigger for harder hits), rot a random turn, fx the move's colours, seed for its own shape.
const IMPACT_ART = {
  fire(c, x, y, age, s, rot, fx) {   // tongues of flame bursting up
    const g = Math.min(1, age / 0.25), h = 1 - Math.max(0, age - 0.45) / 0.55;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.62, d = s * (0.3 + 0.25 * g);
      FXD.flame(c, x + Math.cos(a) * d, y + Math.sin(a) * d, a, s * (i === 2 ? 0.24 : 0.18) * g * h + 0.5, fx, age * 9 + i);
    }
  },
  water(c, x, y, age, s, rot, fx) {   // a crown of water splashing up and out
    const g = Math.min(1, age / 0.3), r = s * (0.45 + 0.55 * g);
    FXD.ring(c, x, y + s * 0.25, r * 0.85, fx[1], 2.2 * (1 - age) + 0.6, 0.38);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI, rise = Math.sin(Math.min(1, age * 1.6) * Math.PI) * s * 0.55;
      const px = x + Math.cos(a) * r, py = y + s * 0.2 + Math.sin(a) * r * 0.5 - rise * (0.6 + 0.4 * Math.sin(i * 2.1));
      FXD.ink(c, () => { c.save(); c.translate(px, py); c.rotate(a); c.arc(0, 0, s * 0.11 + 0.6, -Math.PI / 2, Math.PI / 2); c.lineTo(-s * 0.3, 0); c.closePath(); c.restore(); }, i % 2 ? fx[1] : fx[2]);
    }
  },
  electric(c, x, y, age, s, rot, fx, seed) {   // a zigzag spark star, bolts snapping out
    const g = age < 0.2 ? age / 0.2 : 1 - (age - 0.2) / 0.8;
    FXD.star(c, x, y, s * 0.75 * g + 1, s * 0.28 * g + 0.5, 8, rot, fx[1]);
    FXD.star(c, x, y, s * 0.38 * g + 0.5, s * 0.15 * g, 8, rot + 0.2, '#ffffff', 0);
    if (age > 0.12) for (let i = 0; i < 4; i++) {
      const a = rot + i * Math.PI / 2 + 0.4, r0 = s * 0.45, r1 = s * (0.75 + age * 0.5);
      FXD.bolt(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, seed + i + ((age * 12) | 0), 2, fx[0], 3, false);
    }
  },
  ice(c, x, y, age, s, rot, fx) {   // crystal shards bursting out
    const g = Math.min(1, age / 0.22), fly = Math.max(0, age - 0.35) * s * 1.2;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.55 + rot * 0.1, d = s * 0.15 + fly;
      FXD.shard(c, x + Math.cos(a) * d, y + Math.sin(a) * d, a, s * (i === 2 ? 0.34 : 0.24) * g * (1 - age * 0.5) + 0.4, fx);
    }
  },
  grass(c, x, y, age, s, rot, fx) {   // a burst of leaves
    const r = s * (0.2 + age * 0.9);
    for (let i = 0; i < 7; i++) {
      const a = rot + i * TAU / 7;
      FXD.leaf(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, a + age * 4, s * 0.3 * (1 - age * 0.5) + 0.8, i % 2 ? '#d8ff9a' : '#a8f060', fx[0]);
    }
  },
  rock(c, x, y, age, s, rot, fx, seed) {   // chips of rock and a puff of dust
    const r = s * (0.15 + age * 0.85);
    if (age < 0.6) FXD.circle(c, x, y + s * 0.15, s * 0.32 * (1 - age), '#c8b898');
    for (let i = 0; i < 6; i++) {
      const a = rot + i * TAU / 6, up = Math.sin(age * Math.PI) * s * 0.3;
      FXD.rock(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7 - up, rot + i + age * 6, s * 0.13 * (1 - age * 0.4) + 0.5, fx, seed + i);
    }
  },
  flying(c, x, y, age, s, rot, fx) {   // curved gusts whirling round
    for (let i = 0; i < 3; i++) {
      const a = rot + i * TAU / 3 + age * 5, r = s * (0.2 + age * 0.45);
      FXD.crescent(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, a + Math.PI / 2, s * 0.3 * (1 - age * 0.5) + 0.5, i ? fx[2] : fx[1]);
    }
  },
  steel(c, x, y, age, s, rot, fx) {   // a white clang star and sparks
    const g = age < 0.18 ? age / 0.18 : 1 - (age - 0.18) / 0.82;
    FXD.star(c, x, y, s * 0.8 * g + 1, s * 0.2 * g + 0.4, 8, rot, '#ffffff');
    FXD.star(c, x, y, s * 0.4 * g + 0.5, s * 0.12 * g, 4, rot + 0.4, fx[1], 0);
    for (let i = 0; i < 5; i++) {
      const a = rot + i * 1.3, r = s * (0.4 + age * 0.9);
      FXD.line(c, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3) + 1]], 1.4, '#ffd23f');
    }
  },
  psychic(c, x, y, age, s, rot, fx) {   // a pink starburst with sparkles
    const g = age < 0.25 ? age / 0.25 : 1 - (age - 0.25) / 0.75;
    FXD.star(c, x, y, s * 0.85 * g + 1, s * 0.2 * g + 0.4, 4, Math.PI / 4, fx[1]);
    FXD.star(c, x, y, s * 0.42 * g + 0.5, s * 0.12 * g, 4, 0, '#ffffff', 0);
    for (let i = 0; i < 4; i++) {
      const a = rot + i * TAU / 4 + 0.4, r = s * (0.5 + age * 0.4);
      if ((i + ((age * 10) | 0)) % 2) FXD.star(c, x + Math.cos(a) * r, y + Math.sin(a) * r, s * 0.14 + 0.8, 0.5, 4, 0, fx[2], 2.2);
    }
  },
  dark(c, x, y, age, s, rot, fx, seed) {   // a jagged burst of darkness
    const g = Math.min(1, age / 0.2) * (1 - Math.max(0, age - 0.5) * 1.6), rnd = mulberry(seed | 0);
    FXD.ink(c, () => {
      for (let i = 0; i < 18; i++) {
        const a = rot + i * TAU / 18, r = (i % 2 ? s * 0.3 : s * (0.6 + rnd() * 0.45)) * g + 0.5;
        i ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85);
      }
      c.closePath();
    }, fx[0]);
    FXD.star(c, x, y, s * 0.3 * g + 0.5, s * 0.12 * g, 6, rot, fx[1], 0);
  },
  ghost(c, x, y, age, s, rot, fx) {   // wisps of violet smoke curling up
    for (let i = 0; i < 4; i++) {
      const a = rot + i * TAU / 4, r = s * (0.15 + age * 0.4), rise = age * s * 0.5;
      FXD.circle(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6 - rise * (i % 2 ? 1 : 0.6), s * 0.2 * (1 - age * 0.7) + 0.5, i % 2 ? fx[1] : fx[2]);
    }
    const sw = [];
    for (let i = 0; i < 14; i++) { const a = rot + age * 6 + i * 0.45, r = i * s * 0.035; sw.push([x + Math.cos(a) * r, y - age * s * 0.3 + Math.sin(a) * r]); }
    FXD.line(c, sw, 3.4, INK); FXD.line(c, sw, 1.5, fx[2]);
  },
  normal(c, x, y, age, s, rot, fx) {   // a bold comic star with motion lines
    const g = age < 0.2 ? 0.5 + age / 0.2 * 0.5 : 1 - (age - 0.2) / 0.8 * 0.8;
    FXD.star(c, x, y, s * 0.75 * g, s * 0.34 * g, 5, rot, fx[1]);
    FXD.star(c, x, y, s * 0.4 * g, s * 0.18 * g, 5, rot, fx[2], 0);
    for (let i = 0; i < 6; i++) {
      const a = rot + i * TAU / 6 + 0.3, r0 = s * (0.8 + age * 0.3), r1 = r0 + s * 0.25 * (1 - age);
      FXD.line(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 3.2, INK);
      FXD.line(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 1.4, fx[2]);
    }
  },
  fighting(c, x, y, age, s, rot, fx) {   // a punch's shock ring, and a star where it landed
    FXD.ring(c, x, y, s * (0.25 + age * 0.75), fx[1], 3 * (1 - age) + 0.8, 1);
    if (age < 0.5) FXD.star(c, x, y, s * 0.45 * (1 - age * 2) + 1, s * 0.18 * (1 - age * 2) + 0.4, 8, rot, '#ffffff');
  },
  dragon(c, x, y, age, s, rot, fx) {   // a violet burst throwing off silver scales
    const g = age < 0.2 ? age / 0.2 : 1 - (age - 0.2) / 0.8;
    FXD.star(c, x, y, s * 0.7 * g + 1, s * 0.25 * g + 0.4, 6, rot, fx[1]);
    FXD.star(c, x, y, s * 0.32 * g + 0.5, s * 0.12 * g, 6, rot + 0.5, '#ffffff', 0);
    for (let i = 0; i < 5; i++) {
      const a = rot + i * TAU / 5 + 0.2, r = s * (0.3 + age * 0.9);
      FXD.shard(c, x + Math.cos(a) * r, y + Math.sin(a) * r, a, s * 0.12 + 0.5, ['#7a8498', '#c8d0e0', '#ffffff']);
    }
  },
  glitch(c, x, y, age, s, rot, fx, seed) {   // broken blocks of corrupted data
    const rnd = mulberry((seed + ((age * 14) | 0)) | 0), spread = s * (0.3 + age * 0.8);
    for (let i = 0; i < 8; i++) {
      const bx = x + (rnd() - 0.5) * 2 * spread, by = y + (rnd() - 0.5) * 1.4 * spread, w = 2 + rnd() * s * 0.35 * (1 - age * 0.6), h = 1.5 + rnd() * 2.5;
      c.fillStyle = INK; c.fillRect(bx - w / 2 - 1, by - h / 2 - 1, w + 2, h + 2);
      c.fillStyle = ['#ff3ad8', '#3af0ff', '#c86ae0', '#ffffff'][i % 4]; c.fillRect(bx - w / 2, by - h / 2, w, h);
    }
  },
};
// which impact a move uses: its look's, with shared looks folded together (Glitch moves break into blocks)
const impactArtOf = mv => (mv.type === 'glitch' ? 'glitch' : { bug: 'grass', ground: 'rock', fairy: 'psychic', poison: 'glitch' }[styleOf(mv)] || (IMPACT_ART[styleOf(mv)] ? styleOf(mv) : 'normal'));

// ---------- dashes (r147, from the owner's references D1-D10 in docs/refs) ----------
// Drawn round the dashing Coreature in its own frame: 0,0 is its middle, +x the way it's dashing, R its
// size, T the clock, fx the move's colours. Each is called twice: `back` for what trails behind and around
// it (the Coreature's own picture is then cut out of it, so the trail wraps round the body instead of
// covering it) and `front` for what leads (an edge of force, a lance, a spearhead). Afterimages of the
// Coreature itself are drawn by drawMon, spaced out so they read as copies, not a smear.
const DASH_ART = {
  // a crackling electric charge: bolts streaming back, a bright edge hugging its front
  voltRush(c, R, T, fx, back) {
    if (back) {
      for (let i = 0; i < 5; i++) {
        const y = (i - 2) * R * 0.36, L = R * 1.6 + 22 + ((i * 7 + ((T * 30) | 0)) % 3) * 8;
        FXD.bolt(c, R * 0.3, y, R * 0.3 - L, y + (i % 2 ? 8 : -8), ((T * 24) | 0) * 5 + i, 4.2, i % 2 ? fx[0] : fx[1], 7, i % 2 === 0);
      }
      return;
    }
    DASH_ART._edge(c, R, fx[0], '#ffffff', 2.6);
    DASH_ART._edge(c, R * 1.25, fx[1], '#ffffff', 1);
    if (Math.sin(T * 50) > 0) FXD.star(c, R * 0.9, -R * 0.75, 2.8, 0.8, 4, 0, '#ffffff', 2.2);
  },
  // a torpedo of water: two streams sweeping back round the body, a white foam spearhead at the front
  aquaJet(c, R, T, fx, back) {
    if (back) {
      for (const s of [-1, 1]) {
        const pts = [];
        for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([R * 0.9 - t * (R * 2.8 + 30), s * (R * 0.45 + Math.sin(t * Math.PI) * R * 0.55 + Math.sin(T * 30 + t * 6) * 1.5)]); }
        FXD.line(c, pts, 11, INK); FXD.line(c, pts, 8, fx[0]); FXD.line(c, pts, 5, fx[1]); FXD.line(c, pts.slice(0, 7), 2.2, fx[2]);
      }
      for (let i = 0; i < 3; i++) FXD.dot(c, -R - 8 - ((T * 120 + i * 9) % 22), ((i * 37) % 3 - 1) * R * 0.6, 1.2, fx[2]);
      return;
    }
    FXD.ink(c, () => { c.moveTo(R + 16, 0); c.lineTo(R - 3, -R * 0.75); c.lineTo(R + 2, 0); c.lineTo(R - 3, R * 0.75); c.closePath(); }, '#e6f6ff');
    FXD.ink(c, () => { c.moveTo(R + 10, 0); c.lineTo(R - 1, -R * 0.4); c.lineTo(R + 3, 0); c.lineTo(R - 1, R * 0.4); c.closePath(); }, '#ffffff', 0);
  },
  // a glowing green horn lance thrust forward, leaf-shaped streaks and torn leaves behind
  megahorn(c, R, T, fx, back) {
    if (back) {
      for (const s of [-1, 1]) {
        const pts = [];
        for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([R * 0.6 - t * (R * 2.6 + 26), s * (R * 0.4 + t * R * 0.6)]); }
        FXD.line(c, pts, 8.5, INK); FXD.line(c, pts, 5.6, fx[0]); FXD.line(c, pts, 3.4, fx[1]); FXD.line(c, pts.slice(0, 4), 1.6, fx[2]);
      }
      for (let i = 0; i < 3; i++) { const x = -R - ((T * 90 + i * 14) % 30), y = (i - 1) * R * 0.8; FXD.leaf(c, x, y, T * 8 + i, 3, fx[1], fx[0]); }
      return;
    }
    FXD.ink(c, () => { c.moveTo(R * 0.6, -6.5); c.lineTo(R + 32, 0); c.lineTo(R * 0.6, 6.5); c.closePath(); }, fx[0]);
    FXD.ink(c, () => { c.moveTo(R * 0.7, -3.5); c.lineTo(R + 26, 0); c.lineTo(R * 0.7, 3.5); c.closePath(); }, fx[1], 0);
    FXD.line(c, [[R * 0.8, 0], [R + 22, 0]], 1.8, '#ffffff');
  },
  // riveted steel plates closing into a wedge at its front, sparks scraping off behind
  ironSlam(c, R, T, fx, back) {
    if (back) {
      for (let i = 0; i < 5; i++) {
        const x = -R * 0.3 - ((T * 160 + i * 11) % 34), y = R * 0.55 + (i % 2) * 3;
        FXD.line(c, [[x, y], [x - 5, y + 1.5]], 1.8, i % 2 ? '#ffd23f' : '#fff3b0');
      }
      for (let i = 0; i < 3; i++) { const x = -R * 0.2 - ((T * 140 + i * 9) % 26), y = (i - 1) * R * 0.5; FXD.line(c, [[x, y], [x - 12, y]], 3.4, INK); FXD.line(c, [[x, y], [x - 12, y]], 1.5, '#c8d0e0'); }
      return;
    }
    const plate = s => {
      FXD.ink(c, () => { c.moveTo(R + 12, 0); c.lineTo(R * 0.55, s * (R * 0.75)); c.lineTo(R * 0.25, s * (R * 0.7)); c.lineTo(R * 0.75, s * 1.5); c.closePath(); }, '#c8d0e0');
      c.beginPath(); c.moveTo(R + 12, 0); c.lineTo(R * 0.55, s * (R * 0.75)); c.lineTo(R * 0.65, s * (R * 0.55)); c.lineTo(R + 7, 0); c.closePath(); c.fillStyle = '#7a8498'; c.fill();
      FXD.dot(c, R * 0.6, s * R * 0.4, 0.9, '#4a5262');
    };
    plate(-1); plate(1);
    FXD.star(c, R + 11, -1, 4, 1, 4, T * 6, '#ffffff', 2.2);
  },
  // a white-blue arrowhead of wind, air currents swept back like a comet's tail
  braveDive(c, R, T, fx, back) {
    if (back) {
      for (const s of [-1, 1]) {
        const pts = [];
        for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([R + 8 - t * (R * 3 + 26), s * (t * R * 1.15 + Math.sin(t * 7 - T * 25) * 2 * t)]); }
        FXD.line(c, pts, 9.5, INK); FXD.line(c, pts, 6.4, fx[0]); FXD.line(c, pts, 3.8, fx[1]); FXD.line(c, pts.slice(0, 5), 1.8, '#ffffff');
      }
      return;
    }
    FXD.ink(c, () => { c.moveTo(R + 20, 0); c.lineTo(R, -9); c.lineTo(R + 6, 0); c.lineTo(R, 9); c.closePath(); }, fx[1]);
    FXD.ink(c, () => { c.moveTo(R + 16, 0); c.lineTo(R + 3, -4.5); c.lineTo(R + 7, 0); c.lineTo(R + 3, 4.5); c.closePath(); }, '#ffffff', 0);
  },
  // a lance of blue-white light thrust forward, coils of current round the body
  lanceCharge(c, R, T, fx, back) {
    if (back) {
      for (let i = 0; i < 3; i++) {
        const x = -R * 0.6 + i * R * 0.5 + ((T * 40) % (R * 0.5));
        c.beginPath(); c.ellipse(x, 0, 3, R + 5, 0, 0, TAU); c.strokeStyle = INK; c.lineWidth = 5.6; c.stroke(); c.strokeStyle = i === 1 ? '#ffffff' : '#7ac8ff'; c.lineWidth = 2.8; c.stroke();
      }
      if (Math.sin(T * 40) > 0.2) FXD.bolt(c, -R, -R * 0.6, -R - 14, -R * 0.2, (T * 30) | 0, 1.4, '#c8ecff', 3, false);
      return;
    }
    FXD.ink(c, () => { c.moveTo(R * 0.6, -5); c.lineTo(R + 30, -2); c.lineTo(R + 42, 0); c.lineTo(R + 30, 2); c.lineTo(R * 0.6, 5); c.closePath(); }, '#4a9eff');
    FXD.ink(c, () => { c.moveTo(R * 0.6, -2.6); c.lineTo(R + 36, 0); c.lineTo(R * 0.6, 2.6); c.closePath(); }, '#9fd8ff', 0);
    FXD.line(c, [[R * 0.7, 0], [R + 34, 0]], 1.6, '#ffffff');
    if (Math.sin(T * 60) > 0) FXD.star(c, R + 42, 0, 5, 1.2, 4, 0, '#ffffff', 2.2);
  },
  // a ghostly lunge: spirit flames streaming back, a violet crescent at its front
  phantomStrike(c, R, T, fx, back) {
    if (back) { for (let i = 0; i < 4; i++) FXD.flame(c, -R * 0.85, (i - 1.5) * R * 0.45, 0, R * 0.46 + (i % 2) * 2, fx, T * 1.3 + i); return; }   // heads at its back, tails streaming away
    DASH_ART._edge(c, R, fx[1], fx[2], 2.4);
  },
  // Mondaze racing a deadline: sheets of paper, clock faces and coffee flying off behind
  deadlineDash(c, R, T, fx, back) {
    if (!back) { DASH_ART._edge(c, R, '#e8dcc0', '#ffffff'); return; }
    for (let i = 0; i < 4; i++) { const x = -R * 0.2 - ((T * 140 + i * 9) % 30), y = (i - 1.5) * R * 0.5; FXD.line(c, [[x, y], [x - 10, y]], 3.2, INK); FXD.line(c, [[x, y], [x - 10, y]], 1.4, '#e8dcc0'); }
    for (let i = 0; i < 3; i++) {   // papers tumbling
      const x = -R - ((T * 70 + i * 13) % 34), y = (i - 1) * R * 0.75 + Math.sin(T * 9 + i) * 3, a = T * (5 + i);
      c.save(); c.translate(x, y); c.rotate(a); FXD.ink(c, () => c.rect(-3, -2.2, 6, 4.4), '#ffffff'); FXD.line(c, [[-2, -0.6], [2, -0.6]], 0.8, '#8a8aa0'); c.restore();
    }
    const cx = -R * 0.9 - ((T * 60) % 26), cy = -R * 0.9;   // a clock face
    FXD.circle(c, cx, cy, 3.6, '#fff8e8'); FXD.line(c, [[cx, cy], [cx, cy - 2.4]], 0.9, INK); FXD.line(c, [[cx, cy], [cx + Math.cos(T * 8) * 2, cy + Math.sin(T * 8) * 2]], 0.9, INK);
    for (let i = 0; i < 2; i++) FXD.blob(c, -R * 0.6 - ((T * 110 + i * 15) % 26), R * 0.8 - i * 4, 1.8, T, '#5a3a22', i);   // coffee splashes
  },
  // a heavy body charging: big dust clouds kicked up behind, a crescent of force at the front
  bodySlam(c, R, T, fx, back) {
    if (back) { for (let i = 0; i < 4; i++) { const t = (T * 2.6 + i * 0.25) % 1, x = -R * 0.6 - t * 26; FXD.circle(c, x, R * 0.7 - t * 6, 4 + t * 6, i % 2 ? '#d8ccb0' : '#c8b898'); } return; }
    DASH_ART._edge(c, R, '#e8d4a8', '#fffbe6', 2.4);
  },
  // a puffy cloud of storm-grey wool with sparks crackling in it (all round, so drawn in front)
  woolTackle(c, R, T, fx, back) {
    if (back) {   // a ring of wool round it (cut out where the body is), puffs trailing off
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + T * 4; FXD.circle(c, Math.cos(a) * (R + 2), Math.sin(a) * (R + 1), 4.6 + Math.sin(T * 12 + i) * 0.8, i % 2 ? '#c8ccd8' : '#e8ebf2'); }
      for (let i = 0; i < 3; i++) { const t = (T * 2 + i / 3) % 1; FXD.circle(c, -R - 4 - t * 18, (i - 1) * 5, 3 * (1 - t) + 1, '#aeb4c4'); }
      if (Math.sin(T * 40) > 0.1) FXD.bolt(c, -R * 1.2, -R * 0.9, -R * 0.2, -R * 1.2, (T * 30) | 0, 1.4, '#fff27a', 3, false);
      return;
    }
    for (let i = 0; i < 3; i++) { const a = -0.8 + i * 0.8 + Math.sin(T * 6) * 0.1; FXD.circle(c, Math.cos(a) * (R + 2), Math.sin(a) * (R + 1), 4.2, i % 2 ? '#c8ccd8' : '#e8ebf2'); }   // the wool leading in front
  },
  // Smugshi's zoomies: golden swooshes looping round it and puffs of dust from its paws
  zoomies(c, R, T, fx, back) {
    if (!back) return;
    for (let i = 0; i < 2; i++) {
      const pts = [];
      for (let j = 0; j <= 12; j++) { const a = T * 14 + i * Math.PI + j * 0.32; pts.push([Math.cos(a) * (R + 5) - j * 1.6, Math.sin(a) * (R + 3) * 0.7]); }
      FXD.line(c, pts, 8, INK); FXD.line(c, pts, 5, i ? '#ffd36b' : '#ffa424'); FXD.line(c, pts.slice(0, 5), 2, '#fffbe6');
    }
    for (let i = 0; i < 3; i++) {   // paw-print puffs
      const t = (T * 2.4 + i / 3) % 1, x = -R - t * 22, y = (i - 1) * R * 0.55;
      FXD.circle(c, x, y, 2.6, '#e8d4b0');
      for (let k = 0; k < 3; k++) FXD.dot(c, x + 2.4, y + (k - 1) * 1.8, 0.8, '#c8a878');
    }
  },
  // any other dash: speed lines in its colours and an edge of force at its front
  _default(c, R, T, fx, back) {
    if (back) { for (let i = 0; i < 4; i++) { const x = -R * 0.3 - ((T * 150 + i * 10) % 30), y = (i - 1.5) * R * 0.45; FXD.line(c, [[x, y], [x - 12, y]], 3.4, INK); FXD.line(c, [[x, y], [x - 12, y]], 1.5, i % 2 ? fx[1] : fx[2]); } return; }
    DASH_ART._edge(c, R, fx[1], fx[2], 2);
  },
  // the bright edge of force hugging the front of a dashing Coreature (a thin crescent just ahead of it)
  _edge(c, R, col, hi, k = 1) {
    FXD.ink(c, () => { c.arc(R * 0.15, 0, R + 3 + 2 * k, -1.0, 1.0); c.arc(R * 0.45, 0, R + 1, 0.85, -0.85, true); c.closePath(); }, col);
    c.beginPath(); c.arc(R * 0.15, 0, R + 2 + k, -0.7, 0.7); c.strokeStyle = hi; c.lineWidth = 1 + k * 0.4; c.stroke();
  },
};
DASH_ART.zoomiesMax = DASH_ART.zoomies;
// Bits flying off a dash as it goes (fxDashTrail): debris shape, colours (else the move's), sizes, how many a second.
const DASH_TRAIL = {
  voltRush: { shape: 'bolt', rate: 34, size: [3, 5] },
  aquaJet: { shape: 'drop', rate: 34, size: [2.6, 4] },
  megahorn: { shape: 'leaf', rate: 22, size: [2.6, 3.6] },
  ironSlam: { shape: 'spark', rate: 40, size: [2, 3], fx: ['#a86a1a', '#ffd23f', '#fff3b0'] },
  braveDive: { shape: 'feather', rate: 22, size: [3, 4.4] },
  lanceCharge: { shape: 'bolt', rate: 26, size: [2.4, 3.6], fx: ['#2a6ad8', '#9fd8ff', '#ffffff'] },
  phantomStrike: { shape: 'flame', rate: 26, size: [3, 4.6], rise: true },
  deadlineDash: { shape: 'paper', rate: 16, size: [3, 4] },
  bodySlam: { shape: 'puff', rate: 18, size: [3.4, 5.4], fx: ['#a8987a', '#d8ccb0', '#f2ead8'] },
  woolTackle: { shape: 'puff', rate: 20, size: [3, 4.6], fx: ['#8a90a0', '#c8ccd8', '#ffffff'] },
  zoomies: { shape: 'star', rate: 18, size: [2.6, 3.6], fx: ['#ffa424', '#ffd36b', '#fffbe6'] },
  zoomiesMax: { shape: 'star', rate: 24, size: [2.6, 3.8], fx: ['#ffa424', '#ffd36b', '#fffbe6'] },
};

// ---------- attacks played from the owner's sheets (r152) ----------
// The owner: "these don't really look like the sprite sheets I gave you". Drawing their references again in code
// lost what made them good, so now the sheets themselves are the art: tools/fx-sheets.py cuts each reference in
// docs/refs into frames at one pixel per sprite pixel (js/fx-sheets.js, FX_SHEET_DATA), and these play them.
const FXS = {};
for (const [id, d] of Object.entries(typeof FX_SHEET_DATA !== 'undefined' ? FX_SHEET_DATA : {})) {
  const img = new Image(); img.src = d.src;
  FXS[id] = { img, frames: d.frames };
}
// Draw frame i of sheet id at (x, y) in world units on the effect layer. o: sc (size, 1 = one pixel per sprite
// pixel), ax/ay (the anchor, 0..1 of the frame), dir (turn it to point that way; a sheet drawn going right is
// mirrored rather than turned upside down when it points left), flip (mirror it), sx/sy (stretch).
function drawSheet(c, id, i, x, y, o = {}) {
  const S = FXS[id];
  if (!S || !S.img.complete || !S.img.naturalWidth) return;
  const f = S.frames[clamp(i | 0, 0, S.frames.length - 1)], sc = o.sc || 1;
  const w = f[2] * FX_PX * sc * (o.sx || 1), h = f[3] * FX_PX * sc * (o.sy || 1);
  c.save(); c.translate(x, y);
  if (o.dir !== undefined) {
    const cs = Math.cos(o.dir), sn = Math.sin(o.dir);
    if (cs < 0) { c.scale(-1, 1); c.rotate(Math.atan2(sn, -cs)); } else c.rotate(o.dir);
  }
  if (o.tilt) c.rotate(o.tilt);   // a sheet drawn pointing some other way than right (its own angle, undone)
  if (o.flip) c.scale(-1, 1);
  c.drawImage(S.img, f[0], f[1], f[2], f[3], -w * (o.ax ?? 0.5), -h * (o.ay ?? 0.5), w, h);
  c.restore();
}
const sheetFrames = id => (FXS[id] ? FXS[id].frames.length : 0);
const sheetSize = (id, i) => (FXS[id] ? FXS[id].frames[i] : [0, 0, 1, 1]);
// a frame's world size at sc 1
const sheetW = (id, i) => sheetSize(id, i)[2] * FX_PX, sheetH = (id, i) => sheetSize(id, i)[3] * FX_PX;
// the hit impacts sheet (I1): one row of 5 frames per look, in this order
const IMPACT_ROWS = ['fire', 'water', 'electric', 'ice', 'grass', 'rock', 'flying', 'steel', 'psychic', 'dark', 'ghost', 'normal', 'fighting', 'dragon', 'glitch'];

// How each move plays its sheet. Frames are numbered as on the sheet, left to right, row by row.
const SHEET_MOVES = {
  // dashes: frames round the dasher (the hole in them sized to its body); `pre` while it winds up, `go` looping while
  // it travels, `hit` played at the target when it connects. upright: not turned (a pillar of fire stays upright).
  flameWheel: { dash: true, pre: [0], go: [1, 2], hit: [3, 4], hole: 0.36 },
  blazeRush:  { dash: true, pre: [0, 1], preUpright: true, go: [2], hit: [3, 4], hole: 0.42, tilt: -0.62, ax: 0.7, ay: 0.68 },   // its comet is drawn heading down-right
  // batch 1 (r156, the owner's D1-D10): wind-up, travel (looping), impact; fit = its height as a share of the
  // dasher's; tilt undoes the angle a sheet was drawn at (measured by its frames' long axis)
  voltRush:      { dash: true, pre: [0], go: [1, 2], hit: [3, 4], hitSheet: 'voltRushB', fit: 1.5 },   // the owner: D1's travel, D1b's impact
  aquaJet:       { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5 },
  megahorn:      { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5 },
  ironSlam:      { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.6, tilt: 60 * Math.PI / 180 },
  braveDive:     { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.6, tilt: 56 * Math.PI / 180 },
  lanceCharge:   { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.7, tilt: 54 * Math.PI / 180 },
  phantomStrike: { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5 },
  deadlineDash:  { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5 },
  bodySlam:      { dash: true, sheet: 'slamWool', pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5 },
  woolTackle:    { dash: true, sheet: 'slamWool', pre: [5], go: [6, 7], hit: [8, 9], fit: 1.5 },
  zoomies:       { dash: true, pre: [0], go: [1, 2], hit: [3, 4], fit: 1.5, tilt: 48 * Math.PI / 180 },
  // water shots: their sheet's splash where they land (W3, W4)
  spoutShot:  { sheet: 'waterShot', hit: [5, 6, 7] },
  cuffCannon: { sheet: 'waterShot', hit: [5, 6, 7] },
  twinCannon: { sheet: 'waterShot', hit: [5, 6, 7] },
  bubbleBeam: { sheet: 'bubbleSpray', hit: [5, 6, 7] },
};
// Where Magma Wave's waves stand: along the arc of its cone at distance d (squashed like the floor, as its
// warning wedge is), enough of them side by side to fill it, the far ones first so the near ones overlap them.
function magmaFront(a, mv, d, sc) {
  const segW = sheetW('magmaWave', 2) * sc * 0.62, span = 2 * Math.sin(mv.cone) * d, n = Math.max(2, Math.ceil(span / segW) + 1), out = [];
  for (let i = 0; i < n; i++) {
    const ang = a.dir + (i / (n - 1) * 2 - 1) * mv.cone * 0.92;
    out.push({ i, x: Math.cos(ang) * d, y: Math.sin(ang) * d * 0.7, sc });
  }
  return out.sort((p, q) => p.y - q.y);
}
// Beams played from a sheet: the frame while it charges, the one as it starts, the ones looped at full power, and the
// one it fades out on. The stream is stretched to the beam's length.
const SHEET_BEAMS = {
  flamethrower: { charge: 0, start: 1, full: [2, 3], end: 4 },
  infernoBeam:  { charge: 0, start: 1, full: [1, 2], end: 3 },
  hydroCannon:  { charge: 0, start: 1, full: [2, 3, 4], end: 6, tail: 7 },   // W1 (r161)
  tidalCannon:  { charge: 0, start: 1, full: [2, 3, 4, 5], end: 7, tail: 8 },   // W2
};
// Shots played from a sheet (W3, W4): frames looped while it flies, the size of its looped frames in world units
const SHEET_SHOTS = {
  spoutShot:  { sheet: 'waterShot', fly: [1, 2, 3, 4], len: 32 },
  cuffCannon: { sheet: 'waterShot', fly: [1, 2, 3, 4], len: 38 },
  twinCannon: { sheet: 'waterShot', fly: [1, 2, 3, 4], len: 32 },
  bubbleBeam: { sheet: 'bubbleSpray', fly: [1, 2, 3, 4], len: 17, spin: true },
};
// a frame sequence played as a particle (an explosion, a geyser)
function sheetPart(b, id, frames, x, y, life, o = {}) {
  b.particles.push({ kind: 'sheet', id, frames, x, y, life, max: life, o });
}

mixInto(Battle, class {
  // ---------------------------------------------------------- spawning effects
  // Debris of the move's type flying out of (x, y).
  fxDebris(x, y, mv, n, speed, size = 3, ground = 19) {
    const fx = fxOf(mv), shape = debrisOf(mv);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(0.35, 1) * speed;
      this.particles.push({ kind: 'deb', shape, fx, x, y, g: y + ground, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.75, drag: 3.2,
        life: rand(0.3, 0.55), max: 0.55, size: size * rand(0.8, 1.25), rot: rand(0, TAU), seed: Math.random() * 1e6 });
    }
  }

  // A dash under way (r148): a burst as it launches, then bits of its look flying off behind (DASH_TRAIL).
  fxDashTrail(m, a, dt) {
    const tr = DASH_TRAIL[a.mv.id];
    if (!tr) return;
    const fx = tr.fx || fxOf(a.mv), back = a.dir + Math.PI;
    if (!a.launched && SHEET_MOVES[a.mv.id]) { a.launched = true; this.addShake(2); }   // a sheet dash has its own wind-up
    if (!a.launched) {   // the launch: a ring and a spray of bits backwards
      a.launched = true;
      this.particles.push({ kind: 'ring', x: m.x, y: m.y - 2, r0: 4, r1: m.r + 26, life: 0.22, max: 0.22, color: fx[2], w: 2.2 });
      this.particles.push({ kind: 'ring', x: m.x, y: m.y - 2, r0: 2, r1: m.r + 16, life: 0.3, max: 0.3, color: fx[1], w: 1.8 });
      for (let i = 0; i < 10; i++) {
        const ang = back + rand(-0.9, 0.9), sp = rand(90, 200);
        this.particles.push({ kind: 'deb', shape: tr.shape, fx, x: m.x, y: m.cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.75, drag: 3.4, grav: tr.rise ? -60 : 120,
          life: rand(0.3, 0.5), max: 0.5, size: rand(...tr.size) * 1.2, rot: rand(0, TAU), seed: Math.random() * 1e6 });
      }
      this.addShake(2);
    }
    if (SHEET_MOVES[a.mv.id]) return;   // its sheet has its own sparks and splashes
    a.trailT = (a.trailT || 0) - dt;
    while (a.trailT <= 0) {
      a.trailT += 1 / tr.rate;
      const side = rand(-1, 1) * m.r * 0.8, nx = -Math.sin(back), ny = Math.cos(back);
      const ang = back + rand(-0.45, 0.45), sp = rand(40, 130);
      this.particles.push({ kind: 'deb', shape: tr.shape, fx, x: m.x + Math.cos(back) * m.r * 0.6 + nx * side, y: m.cy + Math.sin(back) * m.r * 0.6 + ny * side * 0.7,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.75, drag: 3, grav: tr.rise ? -50 : 90,
        life: rand(0.25, 0.45), max: 0.45, size: rand(...tr.size), rot: rand(0, TAU), seed: Math.random() * 1e6 });
    }
  }

  // Where a hit lands: a "pow" star, debris of the move's type, and white sparks.
  fxImpact(tgt, mv, dmg, eff, mult, src) {
    const fx = fxOf(mv), big = mult >= 1;
    if (!big && Math.random() > 0.35) return;   // beam and vortex ticks: only now and then
    const size = big ? clamp(16 + dmg / 14, 18, 38) * (eff >= 2 ? 1.25 : 1) : 10;
    // its look's own impact, on the side the hit came from, so the target stays visible (IMPACT_ART, r147)
    const from = src ? Math.atan2(src.cy - tgt.cy, src.x - tgt.x) : rand(0, TAU), off = tgt.r * 0.55;
    const hx = tgt.x + Math.cos(from) * off + rand(-3, 3), hy = tgt.cy + Math.sin(from) * off * 0.7 + rand(-3, 3), row = IMPACT_ROWS.indexOf(impactArtOf(mv));
    if (FXS.impacts && row >= 0) {   // the owner's impact sheet (I1, r156): its look's row of five frames
      sheetPart(this, 'impacts', [0, 1, 2, 3, 4].map(i => row * 5 + i), hx, hy, big ? 0.36 : 0.22, { sc: size / 30 });
    } else this.particles.push({ kind: 'hit', art: impactArtOf(mv), x: hx, y: hy, size, rot: rand(0, TAU),
      fx, seed: (Math.random() * 1e6) | 0, big, life: big ? 0.38 : 0.22, max: big ? 0.38 : 0.22 });
    if (!(FXS.impacts && row >= 0)) this.fxDebris(tgt.x, tgt.cy, mv, big ? Math.min(5, 2 + dmg / 90) : 0, big ? 120 : 70, 3);   // (the impact sheet has its own debris)
    // signature hits
    const toward = src ? Math.atan2(tgt.cy - src.cy, tgt.x - src.x) : 0;
    const SM = SHEET_MOVES[mv.id];
    if (big && SM && SM.hit) { const hs = SM.hitSheet || SM.sheet || mv.id; sheetPart(this, hs, SM.hit, tgt.x, tgt.cy, 0.5, { sc: tgt.r * 3 / sheetW(hs, SM.hit[0]) }); }   // its sheet's impact
    if (mv.fx === 'claw') this.particles.push({ kind: 'claw', x: tgt.x, y: tgt.cy, size: 34, rot: toward + Math.PI / 2 + rand(-0.3, 0.3), color: fx[1], life: 0.3, max: 0.3 });
    if (mv.fx === 'slash') this.particles.push({ kind: 'slash', x: tgt.x, y: tgt.cy, size: 22, rot: toward + rand(-0.4, 0.4), color: fx[1], life: 0.28, max: 0.28 });
    if (mv.fx === 'flurry') {   // fists everywhere at once
      for (let i = 0; i < 3; i++) this.particles.push({ kind: 'impact', x: tgt.x + rand(-14, 14), y: tgt.cy + rand(-14, 10), size: rand(7, 11), rot: rand(0, TAU), color: i ? fx[1] : '#ffffff', life: 0.14, max: 0.14 });
    }
    if (mv.fx === 'stare') {   // the target is left baffled
      for (const [str, dx] of [['?', -8], ['z', 6], ['?', 14]]) this.particles.push({ kind: 'glyph', str, x: tgt.x + dx + rand(-3, 3), y: tgt.y - tgt.h - 4, vx: rand(-6, 6), vy: -rand(18, 30), size: rand(9, 12), color: '#e8e0ff', life: 0.9, max: 0.9 });
    }
  }

  // Blowing a cone (Blizzard, Gust): snow or wind pouring out in front of the user.
  fxCone(m, a) {
    const mv = a.mv, fx = fxOf(mv), speed = a.r / 0.35, snow = styleOf(mv) === 'ice';
    if (mv.id === 'magmaWave') {   // the wave is the sheet (drawSheetMagma); when it's spent, a pool of lava stays a moment
      if (!a.pooled && a.blowT + 1 / 30 >= mv.blow) {
        a.pooled = true;
        const flip = Math.cos(a.dir) < 0;
        for (const w of magmaFront(a, mv, a.r * 0.92, 0.85)) sheetPart(this, 'magmaWave', [7], m.x + w.x, m.y + w.y, 0.7, { sc: w.sc, ay: 1, flip });
      }
      return;
    }
    for (let i = 0; i < (snow ? 4 : 3); i++) {
      const ang = a.dir + rand(-mv.cone, mv.cone) * 0.95, s = speed * rand(0.7, 1.15), ox = m.x + Math.cos(a.dir) * 8, oy = m.cy + Math.sin(a.dir) * 8;
      const life = a.r / s;
      if (snow && i < 2) this.particles.push({ kind: 'flake', x: ox, y: oy, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, size: rand(3.6, 5.4), rot: rand(0, 1), life, max: life });
      else this.particles.push({ kind: 'gust', x: ox, y: oy, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, size: rand(4, 7), rot: rand(0, 6), color: snow ? fx[1] : '#ffffff', life, max: life });
    }
    if (snow && Math.random() < 0.5) {   // chunks of ice in the storm
      const ang = a.dir + rand(-mv.cone, mv.cone) * 0.7, s = speed * rand(0.8, 1);
      this.particles.push({ kind: 'deb', shape: 'shard', fx, x: m.x, y: m.cy, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, size: rand(3, 4.5), rot: 0, seed: 1, life: a.r / s, max: a.r / s });
    }
  }

  // A blast going off at (x, y) with radius r: shockwaves, debris, and a type flourish.
  fxBlast(x, y, r, mv) {
    const fx = fxOf(mv);
    // played from the owner's sheets (r152)
    if (mv.id === 'fireBlast') { sheetPart(this, 'fireBlast', [2, 3, 3, 4], x, y - 4, 0.75, { sc: r * 2.4 / sheetW('fireBlast', 3) }); this.addShake(5); return; }
    if (mv.id === 'eruption') { const sc = r * 1.25 / sheetW('eruption', 0); sheetPart(this, 'eruption', [1, 2, 2, 3, 4], x, y + sheetH('eruption', 0) * sc / 2, 1.1, { sc, ay: 1 }); this.addShake(8); return; }
    if (mv.id === 'geyserVent' && FXS.geyserVent) { const sc = r * 1.7 / sheetW('geyserVent', 0); sheetPart(this, 'geyserVent', [2, 3, 4, 5, 6, 7, 8], x, y + 4 + sheetH('geyserVent', 0) * sc / 2, 1.1, { sc, ay: 1 }); this.addShake(6); return; }
    if (mv.id === 'steamEruption') { const sc = r * 1.4 / sheetW('steamEruption', 0); sheetPart(this, 'steamEruption', [1, 2, 2, 3, 4], x, y + sheetH('steamEruption', 0) * sc / 2, 1.1, { sc, ay: 1 }); return; }
    this.particles.push({ kind: 'wave', x, y: y - 2, r0: 4, r1: r, life: 0.32, max: 0.32, color: fx[2], w: 4 });
    this.particles.push({ kind: 'wave', x, y: y - 2, r0: 2, r1: r * 0.7, life: 0.42, max: 0.42, color: fx[1], w: 3 });
    this.fxDebris(x, y - 4, mv, Math.round(10 + r / 6), r * 2.4, 4.2, 4);
    // a crown of the type's debris thrown up all round the edge
    const shape = debrisOf(mv), n = Math.round(8 + r / 10), up = ['flame', 'drop', 'leaf', 'bubble', 'feather'].includes(shape);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rand(-0.15, 0.15), px = x + Math.cos(a) * r * 0.7, py = y + Math.sin(a) * r * 0.5;
      this.particles.push({ kind: 'deb', shape, fx, x: px, y: py, vx: Math.cos(a) * 70, vy: Math.sin(a) * 40 - (up ? 110 : 30), drag: 2.5,
        life: rand(0.4, 0.55), max: 0.55, size: rand(5, 7), rot: a, seed: Math.random() * 1e6 });
    }
    // waves that ripple out one after another (sound, psychic, dark and the like)
    if (shape === 'ring' || shape === 'star') {
      for (let i = 1; i <= 2; i++) this.particles.push({ kind: 'wave', x, y: y - 2, r0: 4, r1: r * (1 - i * 0.12), life: 0.32 + i * 0.1, max: 0.32, color: i % 2 ? fx[1] : fx[2], w: 4 });
    }
    if (styleOf(mv) === 'electric') {   // lightning cracking outwards
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU + rand(-0.3, 0.3);
        this.particles.push({ kind: 'strike', x: x + Math.cos(a) * r * 0.95, y: y + Math.sin(a) * r * 0.65, x2: x, y2: y - 4, seed: Math.random() * 1e6, color: fx[1], life: 0.22, max: 0.22 });
      }
    }
  }

  // Buffs and heals: a shield for defence, chevrons for attack and speed, + signs for healing.
  fxBuff(m, mv) {
    const fx = fxOf(mv), b = mv.buff || {};
    if (b.def) this.particles.push({ kind: 'shield', x: m.x, y: m.cy, r: m.r + 12, color: fx[2], life: 0.9, max: 0.9 });
    if (b.atk || b.spd) for (let i = 0; i < 6; i++) {
      this.particles.push({ kind: 'chevron', x: m.x + rand(-14, 14), y: m.cy + rand(-6, 12), vx: 0, vy: -rand(35, 60), size: rand(3, 4.5),
        color: b.atk ? '#ff7a5a' : '#7ad0ff', life: rand(0.5, 0.8), max: 0.8 });
    }
  }
  // Heals act out their names (snack, sunbeams, blanket, wishing star), then + signs rise.
  fxHeal(m, mv) {
    const show = { snack: ['snack', 0.95], photosynth: ['sunbeam', 1.1], blanketNap: ['blanket', 1.7], wish: ['wishStar', 1.25] }[mv.id];
    if (show) this.particles.push({ kind: show[0], mon: m, x: m.x, y: m.y, life: show[1], max: show[1], face: m.face });
    if (mv.id === 'wish') m.look(0, -1);   // look up at the star
    for (let i = 0; i < (show ? 4 : 7); i++) {
      this.particles.push({ kind: 'plus', x: m.x + rand(-16, 16), y: m.cy + rand(-4, 14), vx: rand(-6, 6), vy: -rand(30, 55), size: rand(2.5, 4),
        color: i % 3 ? '#8be04e' : '#eaffc8', life: rand(0.55, 0.9) + (show ? show[1] * 0.5 : 0), max: 0.9 });
    }
  }

  // ---------------------------------------------------------- drawing (into the effect layer)
  // Everything attack-shaped for this frame. c is the effect layer, in world coordinates.
  drawAttacks(c) {
    for (const z of this.zones) if (z.mv.fx === 'tornado') this.drawTornado(c, z);
    for (const m of this.mons) if (m.visible && m.action) {
      const a = m.action;
      if (a.kind === 'beam') this.drawBeam(c, m, a);
      if (a.kind === 'vortex') this.drawVortex(c, m, a);
      if (a.kind === 'burst' && !a.done) this.drawCharge(c, m, a);
      if (a.kind === 'burst' && a.done && a.mv.ripple) this.drawRipple(c, m, a);
      if (a.kind === 'dash' && (a.t > 0.1 || a.phase === 'combo' || a.mv.windup || SHEET_MOVES[a.mv.id])) this.drawDashFx(c, m, a);
      if (a.kind === 'burst' && a.done && a.mv.id === 'magmaWave') this.drawSheetMagma(c, m, a);
    }
    for (const p of this.projectiles) this.drawProjectile(c, p);
    this.drawZoneFalls(c);
    this.drawParticles(c);
  }

  // Dashes with a look of their own, drawn round the moving monster.
  // A dash played from its sheet: the frames round the dasher, the hole in them sized to its body.
  drawSheetDash(c, m, a, SM) {
    const id = SM.sheet || a.mv.id, pre = 0.1 + (a.mv.windup || 0), T = this.time;
    // its size: the hole in the frames fits its body (hole), or the frames are fit times its height
    const size = fr => (SM.hole ? m.r * 2.2 / (sheetW(id, fr) * SM.hole) : m.h * SM.fit / sheetH(id, SM.go[0]));
    if (a.t <= pre) {
      const fr = SM.pre[Math.min(SM.pre.length - 1, Math.floor(a.t / pre * SM.pre.length))];
      if (SM.preUpright) drawSheet(c, id, fr, m.x, m.y + 3, { sc: size(fr), ay: 1 });
      else drawSheet(c, id, fr, m.x, m.cy, { sc: size(fr), dir: a.dir, tilt: SM.tilt });
      return;
    }
    const fr = SM.go[Math.floor(T / 0.07) % SM.go.length];
    drawSheet(c, id, fr, m.x, m.cy, { sc: size(fr), dir: a.dir, tilt: SM.tilt, ax: SM.ax ?? 0.5, ay: SM.ay ?? 0.5 });
  }

  drawDashFx(c, m, a) {
    const mv = a.mv, fx = fxOf(mv), T = this.time, cx = m.x, cy = m.cy, R = m.r + 7;
    if (SHEET_MOVES[mv.id] && SHEET_MOVES[mv.id].dash && a.phase !== 'combo') { this.drawSheetDash(c, m, a, SHEET_MOVES[mv.id]); return; }
    // its own art (DASH_ART), drawn in its frame; the ones with an older look of their own (fx) keep it
    const art = DASH_ART[mv.id] || (!mv.fx || mv.fx === 'claw' || mv.fx === 'slash' ? DASH_ART._default : null);
    if (art && a.phase !== 'combo') {
      const pre = 0.1 + (mv.windup || 0);   // a dash with a wind-up (Blaze Rush catches fire first) draws it too
      const draw = back => { c.save(); c.translate(cx, cy); c.rotate(a.dir); art(c, m.r + 1, T, fx, back, a, pre); c.restore(); };
      draw(true);
      // cut the Coreature's own picture out of the trail, so it wraps round the body instead of covering it
      const sp = SPRITES[m.id], img = sp && sp.views[viewKey(sp.views, m.view, m.face)];
      if (img) {
        const S = sp.size * SPR_SCALE * m.scale;
        c.save(); c.globalCompositeOperation = 'destination-out'; c.translate(m.x, m.y - (m.hover || 0));
        if (isSideView(m.view) && m.face < 0) c.scale(-1, 1);
        c.drawImage(img, -S / 2, -S + 3, S, S); c.restore();
      }
      draw(false);
      return;
    }
    switch (mv.fx) {
      case 'wheel': {   // a ring of flames spinning round the user
        const spin = T * 16 * (Math.cos(a.dir) >= 0 ? 1 : -1);
        FXD.ring(c, cx, cy, R, fx[1], 3, 1);
        for (let i = 0; i < 10; i++) {
          const ang = spin + i * TAU / 10;
          FXD.flame(c, cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, ang + Math.PI / 2 * Math.sign(spin), 3.6, fx, T + i);
        }
        break;
      }
      case 'aura':   // flames rising all round the body
        for (let i = 0; i < 9; i++) {
          const ang = i / 9 * TAU, fl = 3.4 + Math.sin(T * 25 + i * 2) * 1.2;
          FXD.flame(c, cx + Math.cos(ang) * (m.r + 1), cy + Math.sin(ang) * (m.r * 0.9) + 2, -Math.PI / 2, fl, fx, T * 1.3 + i);
        }
        break;
      case 'wool':   // a cloud of fluffy wool with sparks in it
        for (let i = 0; i < 7; i++) {
          const ang = i / 7 * TAU + T * 4;
          FXD.circle(c, cx + Math.cos(ang) * (m.r - 1), cy + Math.sin(ang) * (m.r - 2), 4.2 + Math.sin(T * 12 + i) * 0.8, '#fff3d6');
        }
        if (Math.sin(T * 40) > 0.3) FXD.bolt(c, cx - 10, cy - 8, cx + 10, cy + 6, (T * 30) | 0, 1.4, '#fff27a', 3, false);
        break;
      case 'roll':   // motion arcs round the rolling body
        for (const off of [0, Math.PI]) {
          c.beginPath(); c.arc(cx, cy, R, T * 14 + off, T * 14 + off + 1.6);
          c.strokeStyle = INK; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = fx[2]; c.lineWidth = 2; c.stroke();
        }
        break;
      case 'flurry':   // a blur of punches: speed lines aimed at the target
        for (let i = 0; i < 5; i++) {
          const ang = a.dir + rand(-0.9, 0.9), d0 = rand(4, 10);
          const pts = [[cx + Math.cos(ang) * d0, cy + Math.sin(ang) * d0], [cx + Math.cos(ang) * (d0 + 16), cy + Math.sin(ang) * (d0 + 16)]];
          FXD.line(c, pts, 3.4, INK); FXD.line(c, pts, 1.5, i % 2 ? fx[1] : '#ffffff');
        }
        break;
    }
  }

  // Dark Pulse: jagged dark rings rolling outwards.
  drawRipple(c, m, a) {
    const fx = fxOf(a.mv), T = this.time, R = a.r * Math.min(1, a.ripT / a.mv.ripple);
    for (const [sc, col] of [[1, fx[1]], [0.72, fx[2]], [0.45, fx[1]]]) {
      const r = R * sc; if (r < 4) continue;
      const path = () => {
        for (let i = 0; i <= 40; i++) {
          const ang = i / 40 * TAU, rr = r * (1 + 0.06 * Math.sin(ang * 9 + T * 14));
          i ? c.lineTo(m.x + Math.cos(ang) * rr, m.y - 2 + Math.sin(ang) * rr * 0.62) : c.moveTo(m.x + Math.cos(ang) * rr, m.y - 2 + Math.sin(ang) * rr * 0.62);
        }
      };
      c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = 7; c.stroke();
      c.beginPath(); path(); c.strokeStyle = fx[0]; c.lineWidth = 4.5; c.stroke();
      c.beginPath(); path(); c.strokeStyle = col; c.lineWidth = 1.8; c.stroke();
    }
  }

  // Tornado: a funnel of wind that grows where it lands, spins for a while, then thins out.
  // Tornado: a storm cloud gathers over the spot, a funnel of spiralling wind drops out of
  // it to the ground, kicks up a ring of dust and whirls debris round, with lightning
  // flickering in the cloud. When it ends the funnel draws back up and the cloud thins out.
  // (Anyone caught is lifted and spun inside it: see `lift` in drawMon.)
  drawTornado(c, z) {
    const T = this.time + z.id * 1.7, mv = z.mv;
    const ground = z.y, Hh = 112, cloudY = ground - Hh, r1 = z.r * 1.55, r0 = 5;
    // how far the funnel reaches down (0 = still in the cloud, 1 = touching the ground), and the cloud's size
    let reach, cloudK;
    if (!z.done) { const k = clamp(z.t / z.delay, 0, 1); cloudK = 0.35 + 0.65 * k; reach = k * k; }
    else {
      const left = z.delay + mv.linger - z.t;
      reach = clamp(left / 0.45, 0, 1); cloudK = clamp(left / 0.35, 0, 1);
    }
    if (cloudK <= 0.02) return;
    const tb = 1 - reach;   // the funnel's lowest point, as a fraction of the way up
    const rAt = t => r0 + (r1 - r0) * Math.pow(t, 1.6);
    const cxAt = t => z.x + Math.sin(T * 4 - t * 3) * 6 * (1 - t);

    // dust storm round the base, and a scuffed ring on the ground
    if (reach > 0.9) {
      FXD.ring(c, z.x, ground, z.r * 1.15, '#d8ccb0', 1.6, 0.35);
      for (let i = 0; i < 8; i++) {
        const ang = -T * 7 + i * TAU / 8, rr = 11 + (i % 3) * 4;
        if (Math.sin(ang) < 0) FXD.circle(c, cxAt(0) + Math.cos(ang) * rr, ground - 3 + Math.sin(ang) * rr * 0.32, 4 + (i % 2) * 1.5, '#a8987a');
      }
    }
    // the funnel: wind strands spiralling up, the far side dimmer than the near side
    const strands = 12, segs = [];
    for (let j = 0; j < strands; j++) {
      let prev = null;
      for (let t = tb; t <= 1.0001; t += 0.05) {
        const ang = -T * 11 + j * TAU / strands + t * 5.5, r = rAt(t);
        const pt = [cxAt(t) + Math.cos(ang) * r, ground - t * Hh + Math.sin(ang) * r * 0.26];
        if (prev && (j + Math.floor(t * 20 + T * 9)) % 4 !== 0) segs.push([prev, pt, Math.sin(ang) >= 0]);   // gaps make it look like streaks
        prev = pt;
      }
    }
    for (const [a, b, near] of segs) if (!near) FXD.line(c, [a, b], 3, INK);
    for (const [a, b, near] of segs) if (!near) FXD.line(c, [a, b], 1.3, '#9fb0dc');
    for (const [a, b, near] of segs) if (near) FXD.line(c, [a, b], 4, INK);
    for (const [a, b, near] of segs) if (near) FXD.line(c, [a, b], 2, '#ffffff');
    // the near half of the dust
    if (reach > 0.9) for (let i = 0; i < 8; i++) {
      const ang = -T * 7 + i * TAU / 8, rr = 11 + (i % 3) * 4;
      if (Math.sin(ang) >= 0) FXD.circle(c, cxAt(0) + Math.cos(ang) * rr, ground - 3 + Math.sin(ang) * rr * 0.32, 4.5 + (i % 2) * 1.5, '#c8b898');
    }
    // rocks and leaves caught in the wind
    for (let i = 0; i < 6; i++) {
      const t = tb + ((i * 0.19 + T * 0.35) % 1) * (1 - tb), ang = -T * 9 + i * 2.3, r = rAt(t) + 4;
      const x = cxAt(t) + Math.cos(ang) * r, y = ground - t * Hh + Math.sin(ang) * r * 0.26;
      if (i % 2) FXD.leaf(c, x, y, ang * 2, 3.2, '#8be04e', '#2f9e3a'); else FXD.rock(c, x, y, ang, 2.4, FX_STYLES.rock, i + 1);
    }
    // the storm cloud: a flat, lumpy disc, dark underneath, with a slow swirl on top
    const crx = r1 * 1.45 * cloudK, cry = 12 * cloudK, lumpy = (y, ry) => () => {
      for (let i = 0; i <= 28; i++) {
        const ang = i / 28 * TAU, bump = 1 + 0.09 * Math.sin(ang * 7 + T * 1.5) + 0.05 * Math.sin(ang * 13 - T);
        const x = z.x + Math.cos(ang) * crx * bump, yy = y + Math.sin(ang) * ry * bump;
        i ? c.lineTo(x, yy) : c.moveTo(x, yy);
      }
      c.closePath();
    };
    FXD.ink(c, lumpy(cloudY + 6 * cloudK, cry), '#2e2c40');          // the dark underside
    FXD.ink(c, lumpy(cloudY, cry * 0.92), '#55536e');               // the body
    c.beginPath(); lumpy(cloudY - 3 * cloudK, cry * 0.62)(); c.fillStyle = '#6c6a88'; c.fill();   // the lit top
    const sw = [];                                                   // the swirl, turning with the wind
    for (let i = 0; i < 46; i++) { const ang = -T * 2.2 + i * 0.32, r = i / 46; sw.push([z.x + Math.cos(ang) * crx * 0.85 * r, cloudY - 3 * cloudK + Math.sin(ang) * cry * 0.55 * r]); }
    FXD.line(c, sw, 1.4, '#8e8ca8');
    // now and then, lightning flickers out of the cloud
    if (Math.sin(T * 7.3) > 0.9 && cloudK > 0.6) {
      const bx = z.x + Math.sin(T * 13) * crx * 0.6;
      FXD.bolt(c, bx, cloudY + 6, bx + Math.sin(T * 5) * 8, cloudY + 30, (T * 10) | 0, 1.8, '#fff27a', 4, false);
    }
  }

  // Blank Stare: Mondaze stops, says "...", stares with huge empty eyes, and two droopy
  // stare-beams wobble out at the target, trailing sleepy z's into a hypnotic swirl.
  drawStare(c, m, a) {
    const mv = a.mv, T = this.time, ey = m.y - m.h * 0.66, k = a.phase === 'charge' ? a.t / mv.charge : 1;
    const eyes = [m.x - 4, m.x + 4];
    // the speech bubble
    const bx = m.x + 16, by = m.y - m.h - 12;
    FXD.ink(c, () => { c.ellipse(bx, by, 11, 7, 0, 0, TAU); c.moveTo(bx - 6, by + 5); c.lineTo(bx - 10, by + 11); c.lineTo(bx - 1, by + 6); }, '#ffffff');
    for (let i = 0; i < Math.min(3, Math.ceil(k * 3 + 0.01)); i++) FXD.dot(c, bx - 5 + i * 5, by + 1, 1.4, INK);
    // the beams
    if (a.phase !== 'charge') {
      const fade = Math.min(1, (mv.dur - a.t) / 0.15), len = mv.len * Math.min(1, a.t / 0.15);
      const cos = Math.cos(a.dir), sin = Math.sin(a.dir);
      for (const ex of eyes) {
        const pts = [];
        for (let x = 0; x <= len; x += 4) {
          const t = x / mv.len, wob = Math.sin(x * 0.09 - T * 9 + ex) * 2.2;
          pts.push([ex + cos * x - sin * wob, ey + sin * x + cos * wob + t * (1 - t) * 26]);   // the gaze droops in the middle
        }
        FXD.line(c, pts, 7.5 * fade + 1, INK); FXD.line(c, pts, 4.5 * fade, '#b8acd4'); FXD.line(c, pts, 1.6, '#f4f0ff');
        for (let j = 0; j < pts.length; j += 3) if ((j + ((T * 20) | 0)) % 6 < 3) FXD.dot(c, pts[j][0], pts[j][1], 1, '#7a6a9a');
      }
      // sleepy z's drifting along, and a slowly turning swirl where the stare lands
      for (let j = 0; j < 4; j++) {
        const x = (T * 70 + j * len / 4) % Math.max(1, len), t = x / mv.len;
        FX_PARTS.glyph(c, { str: j % 2 ? 'z' : 'Z', x: m.x + cos * x, y: ey + sin * x + t * (1 - t) * 26 - 9 - Math.sin(T * 6 + j) * 3, size: 8 + j % 2 * 2, color: '#e8e0ff' });
      }
      const sx = m.x + cos * len, sy = ey + sin * len, sw = [];
      for (let i = 0; i < 30; i++) { const ang = -T * 7 + i * 0.5, r = i * 0.55; sw.push([sx + Math.cos(ang) * r, sy + Math.sin(ang) * r * 0.8]); }
      FXD.line(c, sw, 4.5, INK); FXD.line(c, sw, 2, '#d8d0f0');
    }
    // the huge blank eyes, opening up as it charges
    const er = 2.5 + k * 3;
    for (const ex of eyes) { FXD.circle(c, ex, ey, er, '#ffffff'); FXD.dot(c, ex + Math.cos(a.dir) * 0.6, ey + 0.4, 0.8, INK); }
  }

  // a blast winding up: energy gathering at the user's feet
  drawCharge(c, m, a) {
    const fx = fxOf(a.mv), k = clamp(a.t / a.mv.delay, 0, 1);
    if (a.mv.id === 'eruption') {   // the ground cracks round it, lava glowing through (sheet frame 0)
      const sc = a.r * 1.25 / sheetW('eruption', 0) * (0.6 + 0.4 * k);
      drawSheet(c, 'eruption', 0, m.x, m.y, { sc });
      return;
    }
    if (a.mv.id === 'geyserVent' && FXS.geyserVent) {   // the ground bubbling, then cracking (W5 frames 0-1)
      drawSheet(c, 'geyserVent', k < 0.5 ? 0 : 1, m.x, m.y + 4, { sc: a.r * 1.7 / sheetW('geyserVent', 0) });
      return;
    }
    if (a.mv.id === 'magmaWave') {   // the lava rising in front of it (sheet frame 0)
      drawSheet(c, 'magmaWave', 0, m.x + Math.cos(a.dir) * 18, m.y + Math.sin(a.dir) * 12 + 2, { sc: 0.5 + k * 0.5, ay: 1, flip: Math.cos(a.dir) < 0 });
      return;
    }
    for (let i = 0; i < 6; i++) {
      const ang = i / 6 * TAU + this.time * 5, rr = (1 - k) * 22 + 6;
      FXD.dot(c, m.x + Math.cos(ang) * rr, m.y - 2 + Math.sin(ang) * rr * 0.6, 1.8, i % 2 ? fx[1] : fx[2]);
    }
  }

  // Magma Wave: a front of waves rolls out across its whole cone (the wedge you see before it goes off), each
  // wave rising, curling over and crashing (sheet frames 1-6, then the pool, 7), side by side along the arc and growing as they go
  // (r153, the owner: it looked small and didn't fill the cone).
  drawSheetMagma(c, m, a) {
    const mv = a.mv, k = Math.min(1, a.blowT / mv.blow);
    for (const w of magmaFront(a, mv, a.r * (0.3 + 0.62 * k), 0.75 + 0.45 * k)) {
      const fr = 1 + Math.min(5, Math.floor(k * 6 + w.i % 2 * 0.35));   // frames 1-6: rising, curling, breaking, crashing
      drawSheet(c, 'magmaWave', fr, m.x + w.x, m.y + w.y, { sc: w.sc, ay: 1, flip: Math.cos(a.dir) < 0 });
    }
  }

  drawProjectile(c, p) {
    const SS = SHEET_SHOTS[p.mv.id];
    if (SS && FXS[SS.sheet]) {   // played from the owner's sheet, pointing the way it flies
      const age = 2.6 - p.life, fr = SS.fly[Math.floor(age / 0.07 + (SS.spin ? p.spin : 0)) % SS.fly.length];
      drawSheet(c, SS.sheet, fr, p.x, p.y, { dir: SS.spin ? undefined : Math.atan2(p.vy, p.vx), ax: SS.spin ? 0.5 : 0.65, sc: SS.len / sheetW(SS.sheet, SS.fly[0]) });
      return;
    }
    const t = styleOf(p.mv), fx = fxOf(p.mv), R = p.r * 2.2, a = Math.atan2(p.vy, p.vx), T = this.time, x = p.x, y = p.y;
    if (p.mv.fx === 'bubble') {   // a wobbly see-through bubble with a shine
      const r = R * (0.85 + 0.08 * Math.sin(T * 14 + p.spin));
      FXD.ring(c, x, y, r, '#cfeeff', 1.4, 0.92);
      FXD.dot(c, x - r * 0.4, y - r * 0.4, r * 0.24, '#ffffff'); FXD.dot(c, x + r * 0.3, y + r * 0.35, 0.8, '#ffffff');
      return;
    }
    if (p.mv.fx === 'pin') {   // a little needle-missile: sharp tip, fins, a puff of exhaust
      c.save(); c.translate(x, y); c.rotate(a);
      FXD.circle(c, -R * 2.2 + Math.sin(T * 50 + p.spin) * 0.8, 0, R * 0.55, '#fff3b0');
      FXD.ink(c, () => { c.moveTo(-R * 1.6, -R * 0.9); c.lineTo(-R * 0.9, 0); c.lineTo(-R * 1.6, R * 0.9); c.closePath(); }, fx[0]);
      FXD.ink(c, () => { c.moveTo(R * 2.4, 0); c.lineTo(R * 0.9, -R * 0.45); c.lineTo(-R * 1.7, -R * 0.4); c.lineTo(-R * 1.7, R * 0.4); c.lineTo(R * 0.9, R * 0.45); c.closePath(); }, '#e8ecf4');
      c.beginPath(); c.moveTo(R * 2.4, 0); c.lineTo(R * 1.2, -R * 0.35); c.lineTo(R * 1.2, R * 0.35); c.closePath(); c.fillStyle = fx[1]; c.fill();
      FXD.line(c, [[-R * 1.2, -R * 0.15], [R * 0.8, -R * 0.15]], 0.9, '#ffffff');
      c.restore();
      return;
    }
    if (p.mv.fx === 'breeze') {   // a curl of fairy wind with a sparkle riding it
      c.save(); c.translate(x, y); c.rotate(a);
      const pts = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14, ang = t * 4.2 + T * 6 + p.spin, r = R * (1.6 - t * 1.1); pts.push([-t * R * 3.2 + Math.cos(ang) * r * 0.5, Math.sin(ang) * r]); }
      FXD.line(c, pts, 4.4, INK); FXD.line(c, pts, 2.4, fx[1]); FXD.line(c, pts.slice(0, 7), 1.1, '#ffffff');
      c.restore();
      if (Math.sin(T * 20 + p.spin) > -0.2) FXD.star(c, x + Math.cos(T * 9 + p.spin) * R, y + Math.sin(T * 9 + p.spin) * R, 2.6, 0.8, 4, 0, '#ffffff', 2.4);
      return;
    }
    if (p.mv.fx === 'mud') {   // a wet clump of mud, dripping
      FXD.blob(c, x, y, R * 1.05, T, fx[1], p.spin);
      FXD.dot(c, x - R * 0.35, y - R * 0.35, R * 0.3, fx[2]); FXD.dot(c, x + R * 0.3, y + R * 0.1, R * 0.22, fx[0]);
      for (let i = 1; i <= 2; i++) FXD.circle(c, x - Math.cos(a) * R * 1.3 * i, y - Math.sin(a) * R * 1.3 * i + i * 1.5, R * (0.45 - i * 0.12), fx[1]);
      return;
    }
    if (p.mv.boomerang) {   // a spinning blade
      c.save(); c.translate(x, y); c.rotate(p.spin * 1.7);
      FXD.ink(c, () => { c.arc(0, 0, R * 1.3, 0, Math.PI * 1.3); c.arc(R * 0.45, -R * 0.15, R * 0.85, Math.PI * 1.3, 0, true); c.closePath(); }, fx[1]);
      c.restore();
      return;
    }
    switch (t) {
      case 'electric':
        // a zigzag bolt trailing behind a crackling head
        FXD.bolt(c, x - Math.cos(a) * R * 5, y - Math.sin(a) * R * 5, x, y, ((T * 20) | 0) * 3 + (p.seed || (p.seed = (Math.random() * 1e6) | 0)), 3.2, fx[1], R * 0.9, false);
        for (let i = 0; i < 3; i++) {
          const ang = T * 18 + i * 2.1;
          FXD.bolt(c, x, y, x + Math.cos(ang) * R * 2.1, y + Math.sin(ang) * R * 2.1, ((T * 25) | 0) * 7 + i, 1.8, fx[1], 2.5, false);
        }
        FXD.circle(c, x, y, R, fx[0]); FXD.dot(c, x, y, R * 0.62, fx[1]); FXD.dot(c, x - R * 0.2, y - R * 0.2, R * 0.3, '#ffffff');
        break;
      case 'fire':   // a fireball, from the owner's sheet (F4): its head at the shot
        drawSheet(c, 'fireBlast', 1, x, y, { dir: a, ax: 0.78, sc: p.r / 8 });
        break;
      case 'dragon': case 'ghost':
        FXD.flame(c, x, y, a, R * 1.05, fx, T);
        if (t === 'ghost') { FXD.dot(c, x - R * 0.1, y - R * 0.3, 0.9, INK); FXD.dot(c, x - R * 0.1, y + R * 0.3, 0.9, INK); }
        break;
      case 'water':
        FXD.ink(c, () => { c.save(); c.translate(x, y); c.rotate(a); c.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-R * 1.4, R * 0.8, -R * 2.4, 0); c.quadraticCurveTo(-R * 1.4, -R * 0.8, 0, -R); c.restore(); }, fx[1]);
        FXD.dot(c, x - Math.cos(a) * R * 0.2, y - Math.sin(a) * R * 0.2, R * 0.55, fx[0]);
        FXD.dot(c, x + Math.cos(a - 0.8) * R * 0.45, y + Math.sin(a - 0.8) * R * 0.45, R * 0.28, '#ffffff');
        break;
      case 'grass': case 'bug':
        if (t === 'bug' && !p.mv.count) {   // a stinger
          c.save(); c.translate(x, y); c.rotate(a);
          FXD.ink(c, () => { c.moveTo(R * 2.4, 0); c.lineTo(-R * 1.2, -R * 0.6); c.lineTo(-R * 0.6, 0); c.lineTo(-R * 1.2, R * 0.6); c.closePath(); }, fx[1]);
          c.restore(); break;
        }
        for (let i = 0; i < 3; i++) {
          const ang = p.spin + i * 2.1;
          FXD.leaf(c, x + Math.cos(ang) * R * 0.7, y + Math.sin(ang) * R * 0.7, ang + 1.2, R * 0.95, fx[1], fx[0]);
        }
        break;
      case 'ice':
        FXD.shard(c, x - Math.cos(a) * R * 1.4 + Math.sin(a) * R * 0.7, y - Math.sin(a) * R * 1.4 - Math.cos(a) * R * 0.7, a, R * 0.9, fx);
        FXD.shard(c, x, y, a, R * 1.5, fx);
        break;
      case 'poison':
        FXD.blob(c, x, y, R * 1.05, T, fx[1], p.spin);
        FXD.dot(c, x - R * 0.3, y - R * 0.3, R * 0.35, fx[2]); FXD.dot(c, x + R * 0.35, y + R * 0.2, R * 0.2, fx[0]);
        break;
      case 'psychic':
        for (const [rot, sc] of [[T * 6, 1], [-T * 5 + 1, 0.8]]) {
          c.save(); c.translate(x, y); c.rotate(rot);
          FXD.ring(c, 0, 0, R * 1.7 * sc, fx[2], 1.6, 0.42); c.restore();
        }
        FXD.circle(c, x, y, R * 0.85, fx[0]); FXD.dot(c, x, y, R * 0.5, fx[1]); FXD.dot(c, x, y, R * 0.22, '#ffffff');
        break;
      case 'dark':
        for (let i = 1; i <= 3; i++) FXD.circle(c, x - Math.cos(a) * R * 1.1 * i, y - Math.sin(a) * R * 1.1 * i + Math.sin(T * 20 + i) * 1.5, R * (0.75 - i * 0.15), fx[0]);
        FXD.circle(c, x, y, R * 1.05, fx[0]); FXD.ring(c, x, y, R * 0.62, fx[1], 1.4, 1); FXD.dot(c, x - R * 0.3, y - R * 0.3, R * 0.2, fx[2]);
        break;
      case 'fairy':
        FXD.star(c, x, y, R * 1.6, R * 0.5, 4, T * 5, fx[1]);
        FXD.star(c, x, y, R * 0.8, R * 0.28, 4, T * 5 + Math.PI / 4, fx[2], 0);
        break;
      case 'fighting':
        FXD.star(c, x, y, R * 1.55, R * 1.05, 10, T * 8, fx[1]);
        FXD.circle(c, x, y, R * 0.8, fx[0]); FXD.dot(c, x, y, R * 0.45, fx[2]);
        break;
      case 'rock': case 'ground': FXD.rock(c, x, y, p.spin * 0.4, R * 1.15, fx, p.seed || (p.seed = Math.random() * 1e6)); break;
      case 'flying':
        FXD.crescent(c, x, y, a, R * 1.5, fx[2]);
        FXD.crescent(c, x - Math.cos(a) * R * 1.2, y - Math.sin(a) * R * 1.2, a, R * 1.1, fx[1]);
        break;
      case 'steel':
        FXD.star(c, x, y, R * 1.4, R * 0.75, 6, p.spin, fx[1]); FXD.circle(c, x, y, R * 0.5, fx[0]); break;
      default:
        FXD.star(c, x, y, R * 1.45, R * 0.6, 5, p.spin * 0.5, fx[1]); FXD.dot(c, x, y, R * 0.45, fx[2]);
    }
  }

  // Flamethrower and Inferno Beam from their sheets: a spark or orb while it charges, then the stream stretched to
  // the beam's length (flickering between its two full frames), then the fading frame.
  drawSheetBeam(c, m, a, ox, oy) {
    const mv = a.mv, id = mv.id, T = this.time, B = SHEET_BEAMS[id];
    if (a.phase === 'charge') { drawSheet(c, id, B.charge, ox, oy, { sc: 0.4 + a.t / mv.charge * 0.6 }); return; }
    const left = mv.dur - a.t, fr = a.t < 0.08 ? B.start : left < 0.08 && B.tail !== undefined ? B.tail : left < 0.18 ? B.end : B.full[Math.floor(T / 0.07) % B.full.length];
    const sx = mv.len / sheetW(id, fr);
    drawSheet(c, id, fr, ox, oy, { dir: a.dir, ax: 0, ay: 0.5, sx, sy: Math.min(sx, 1.25) });
  }

  drawBeam(c, m, a) {
    if (a.mv.fx === 'stare') { this.drawStare(c, m, a); return; }
    const mv = a.mv, fx = fxOf(mv), T = this.time;
    const ox = m.x + Math.cos(a.dir) * 6, oy = m.cy + Math.sin(a.dir) * 6;
    if (SHEET_BEAMS[mv.id] && FXS[mv.id]) { this.drawSheetBeam(c, m, a, ox, oy); return; }   // from the owner's sheets
    if (a.phase === 'charge') {   // a ball of energy growing at the muzzle
      const k = a.t / mv.charge, r = 2.5 + k * mv.width * 0.55;
      FXD.circle(c, ox, oy, r, fx[0]); FXD.dot(c, ox, oy, r * 0.65, fx[1]); FXD.dot(c, ox, oy, r * 0.3, '#ffffff');
      if (styleOf(mv) === 'electric') FXD.bolt(c, ox, oy, ox + Math.cos(T * 30) * r * 2.2, oy + Math.sin(T * 30) * r * 2.2, (T * 30) | 0, 1.5, fx[1], 2, false);
      return;
    }
    const grow = Math.min(1, a.t / 0.08), fade = Math.min(1, (mv.dur - a.t) / 0.15);
    const len = mv.len * grow, w = mv.width * Math.max(0.25, fade) * 1.6;
    c.save(); c.translate(ox, oy); c.rotate(a.dir);
    if (styleOf(mv) === 'electric') {   // twisting lightning instead of a solid beam
      const seed = ((T * 22) | 0) * 31;
      for (let i = 0; i < 3; i++) FXD.bolt(c, 0, 0, len, 0, seed + i * 7, w * (i ? 0.35 : 0.5), i ? fx[0] : fx[1], w * 0.9, i === 0);
    } else {
      // the beam's body: wobbly edges, inked, three colour bands
      const edge = (sc, ph) => x => (w / 2) * sc * (1 + 0.14 * Math.sin(x * 0.2 - T * 42 + ph)) * Math.min(1, 0.45 + x / 18);
      const body = (sc, col, inked) => {
        const top = edge(sc, 0), bot = edge(sc, 1.7), steps = Math.max(2, Math.ceil(len / 4));
        const path = () => {
          for (let i = 0; i <= steps; i++) { const x = i / steps * len; i ? c.lineTo(x, -top(x)) : c.moveTo(x, -top(x)); }
          c.arc(len, 0, (w / 2) * sc, -Math.PI / 2, Math.PI / 2);
          for (let i = steps; i >= 0; i--) { const x = i / steps * len; c.lineTo(x, bot(x)); }
          c.closePath();
        };
        if (inked) FXD.ink(c, path, col); else { c.beginPath(); path(); c.fillStyle = col; c.fill(); }
      };
      body(1, fx[0], true); body(0.68, fx[1], false); body(0.32, fx[2], false);
      // the type's flourish along the beam
      if (styleOf(mv) === 'fire') {
        for (let x = (T * 300) % 22; x < len - 6; x += 22) for (const s of [-1, 1]) FXD.flame(c, x, s * w * 0.45, Math.PI + s * 0.5, w * 0.22, fx, T + x);
      } else if (styleOf(mv) === 'grass' || styleOf(mv) === 'bug') {
        for (let x = (T * 240) % 18; x < len; x += 18) FXD.leaf(c, x, Math.sin(x * 0.15 + T * 20) * w * 0.55, x * 0.3 + T * 12, w * 0.24, fx[1], fx[0]);
      } else if (styleOf(mv) === 'psychic' || styleOf(mv) === 'dark' || styleOf(mv) === 'ghost') {
        for (let x = (T * 280) % 20; x < len; x += 20) FXD.ring(c, x, 0, w * 0.3, fx[2], 1.3, 3);
      } else if (styleOf(mv) === 'ice') {
        for (let x = 10 + (T * 200) % 26; x < len; x += 26) FXD.shard(c, x, (x % 52 < 26 ? -1 : 1) * w * 0.5, (x % 52 < 26 ? -1 : 1) * 1.2, w * 0.2, fx);
      } else {   // twin strands spiralling down the beam (water and the rest)
        for (const ph of [0, Math.PI]) {
          const pts = [];
          for (let x = 0; x <= len; x += 3) pts.push([x, Math.sin(x * 0.09 - T * 30 + ph) * w * 0.38]);
          FXD.line(c, pts, 3.4, INK); FXD.line(c, pts, 1.6, '#ffffff');
        }
      }
    }
    // the far end splashes
    FXD.star(c, len, 0, w * 1.05, w * 0.5, 8, T * 12, fx[1]);
    FXD.star(c, len, 0, w * 0.55, w * 0.25, 8, T * 12 + 0.3, '#ffffff', 0);
    c.restore();
  }

  // A vortex: a tornado for flying, a whirlpool for water, a spiral of the type's colour otherwise.
  drawVortex(c, m, a) {
    const mv = a.mv, fx = fxOf(mv), T = this.time;
    if (FXS[mv.id] && (mv.id === 'whirlpool' || mv.id === 'maelstrom')) {   // the owner's sheets (W6, W7): forming, spinning (looped), breaking up
      const left = mv.dur - a.t, fr = a.t < 0.24 ? Math.floor(a.t / 0.08) : left < 0.24 ? 6 + (left < 0.12 ? 1 : 0) : (mv.id === 'whirlpool' ? [3, 5] : [3, 4, 5])[Math.floor(T / 0.08) % (mv.id === 'whirlpool' ? 2 : 3)];   // (Whirlpool's frame 4 has a dark funnel that would hide its user)
      drawSheet(c, mv.id, fr, m.x, m.y + 2, { sc: mv.r * 2 / sheetW(mv.id, 4) });
      return;
    }
    const fade = clamp(Math.min(a.t / 0.15, (mv.dur - a.t) / 0.2), 0, 1), R = mv.r * fade;
    if (R < 2) return;
    if (styleOf(mv) === 'flying') {   // a funnel of wind with a dark cloud on top
      for (let i = 0; i < 7; i++) {
        const k = i / 6, yy = m.y - k * 70, rr = (8 + k * R * 0.45);
        c.save(); c.translate(m.x + Math.sin(T * 8 + k * 3) * 4 * k, yy);
        FXD.ring(c, 0, 0, rr, i % 2 ? fx[2] : fx[1], 2, 0.32);
        c.restore();
      }
      for (let i = 0; i < 5; i++) FXD.circle(c, m.x + (i - 2) * R * 0.18, m.y - 74 + Math.sin(i * 1.7) * 4, R * 0.16 + 4, '#6a6880');
      return;
    }
    // spiral arms turning round the user
    for (let arm = 0; arm < 3; arm++) {
      const pts = [];
      for (let k = 0; k <= 1.001; k += 0.05) {
        const ang = arm * TAU / 3 + T * 7 + k * 4.2, rr = R * (0.15 + k * 0.85);
        pts.push([m.x + Math.cos(ang) * rr, m.y + Math.sin(ang) * rr * 0.6]);
      }
      FXD.line(c, pts, 6, INK); FXD.line(c, pts, 3.2, arm ? fx[1] : fx[2]);
    }
    FXD.ring(c, m.x, m.y, R, fx[1], 2.2);
  }

  drawZoneFalls(c) {
    for (const z of this.zones) {
      if (z.done) continue;
      const left = z.delay - z.t, fx = fxOf(z.mv), zx = z.x, zy = z.y;
      if (z.mv.fx === 'meteor' && left < 0.45) {
        const k = 1 - left / 0.45;
        FXD.flame(c, zx - 70 * (1 - k), zy - 170 * (1 - k), Math.atan2(170, 70), 7, fx, this.time);
      } else if (z.mv.fx === 'rock' && left < 0.35) {
        const k = 1 - left / 0.35;
        FXD.rock(c, zx, zy - 150 * (1 - k * k) - 6, z.id, 8, FX_STYLES.rock, z.id);
      } else if (z.mv.id === 'steamEruption') {   // the ground bubbling and cracking before the geyser (sheet frame 0)
        drawSheet(c, 'steamEruption', 0, zx, zy, { sc: z.r * 1.4 / sheetW('steamEruption', 0) * (0.5 + 0.5 * (1 - left / z.delay)) });
      } else if (z.mv.fx === 'bolt' && left < 0.25) {   // a crackle in the clouds before it strikes
        FXD.bolt(c, zx + 10, zy - 200, zx - 6, zy - 150, ((this.time * 25) | 0) + z.id, 2, fx[1], 6, false);
      }
    }
  }

  drawParticles(c) {
    for (const p of this.particles) {
      if (p.life > p.max) continue;   // still waiting to start (a delayed wave)
      const k = clamp(p.life / p.max, 0, 1), X = p.x, Y = p.y;
      if (FX_PARTS[p.kind]) { FX_PARTS[p.kind](c, p, k); continue; }
      switch (p.kind) {
        case 'sq': {
          const s = Math.max(1.5, Math.round(p.size * (0.5 + k * 0.5)));
          c.fillStyle = p.color; c.fillRect(X - s / 2, Y - s / 2, s, s);
          break;
        }
        case 'spark':
          FXD.line(c, [[X, Y], [X - p.vx * 0.06, Y - p.vy * 0.06]], 1.6, p.color);
          break;
        case 'ring': FXD.ring(c, X, Y, p.r1 + (p.r0 - p.r1) * k, p.color, p.w * k + 0.8); break;
        case 'line':
          FXD.line(c, [[X, Y], [p.x2, p.y2]], 3 * k + 3, INK); FXD.line(c, [[X, Y], [p.x2, p.y2]], 3 * k + 1, p.color);
          break;
        case 'bolt':   // Thunder: a big bolt from the sky
          FXD.bolt(c, X + (mulberry((p.seed * 1e6) | 0)() - 0.5) * 30, Y - 220, X, Y, (p.seed * 1e6 + ((1 - k) * 3 | 0)) | 0, 5 * k + 2, p.color, 12);
          break;
      }
    }
  }
});
