// Attack art: everything an attack draws (shots, beams, blasts, zone hits, vortexes, buff
// and heal effects, hit sparks). It all goes into a small pixel layer where one pixel is a
// sprite pixel (1.5 world units), gets a dark ink outline like the monsters, has its soft
// edges snapped to hard pixels, and is scaled up without smoothing. So attacks are chunky,
// crisp pixel art at any screen size, drawn after the lighting so they stay bright.
// Each type has its own look: bolts, flames, leaves, bubbles, shards, rings and so on.

const FX_PX = 1.5;   // world units per effect pixel (the size of a sprite pixel)
const INK = OUTLINE;

const FXLayer = (() => {
  const w = Math.ceil(W / FX_PX) + 2, h = Math.ceil(H / FX_PX) + 2;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d', { willReadFrequently: true });
  return {
    // start a frame; draw in world coordinates, with the same camera as the room
    begin(camX, camY) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
      c.setTransform(1 / FX_PX, 0, 0, 1 / FX_PX, -camX / FX_PX, -camY / FX_PX);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.globalAlpha = 1;
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
      case 'ring': FXD.ring(c, p.x, p.y, s * (2 - k), fx[1], 1.4, 0.7); break;
      case 'bolt': FXD.bolt(c, p.x, p.y, p.x + Math.cos(a) * s * 2.6, p.y + Math.sin(a) * s * 2.6, p.seed, 2, fx[1], 3, false); break;
      case 'feather': FXD.crescent(c, p.x, p.y, a, s * 1.1, fx[2]); break;
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
  // a speed streak behind a dashing monster
  streak(c, p, k) {
    const pts = [[p.x, p.y], [p.x - p.sx * 0.07 * k, p.y - p.sy * 0.07 * k]];
    FXD.line(c, pts, 3.4, INK); FXD.line(c, pts, 1.5, p.color);
  },
};

mixInto(Battle, class {
  // ---------------------------------------------------------- spawning effects
  // Debris of the move's type flying out of (x, y).
  fxDebris(x, y, type, n, speed, size = 3, ground = 19) {
    const fx = TYPES[type].fx, shape = FX_DEBRIS[type] || 'star';
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(0.35, 1) * speed;
      this.particles.push({ kind: 'deb', shape, fx, x, y, g: y + ground, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.75, drag: 3.2,
        life: rand(0.3, 0.55), max: 0.55, size: size * rand(0.8, 1.25), rot: rand(0, TAU), seed: Math.random() * 1e6 });
    }
  }

  // Where a hit lands: a "pow" star, debris of the move's type, and white sparks.
  fxImpact(tgt, mv, dmg, eff, mult) {
    const fx = TYPES[mv.type].fx, big = mult >= 1;
    if (!big && Math.random() > 0.35) return;   // beam and vortex ticks: only now and then
    const size = big ? clamp(9 + dmg / 25, 11, 24) * (eff >= 2 ? 1.25 : 1) : 7;
    this.particles.push({ kind: 'impact', x: tgt.x + rand(-4, 4), y: tgt.cy + rand(-4, 4), size, rot: rand(0, TAU),
      color: eff >= 2 ? '#ffe066' : fx[1], life: 0.24, max: 0.24 });
    this.fxDebris(tgt.x, tgt.cy, mv.type, big ? Math.min(9, 3 + dmg / 60) : 1, big ? 140 : 70, big ? 4 : 3);
  }

  // A blast going off at (x, y) with radius r: shockwaves, debris, and a type flourish.
  fxBlast(x, y, r, mv) {
    const fx = TYPES[mv.type].fx;
    this.particles.push({ kind: 'wave', x, y: y - 2, r0: 4, r1: r, life: 0.32, max: 0.32, color: fx[2], w: 4 });
    this.particles.push({ kind: 'wave', x, y: y - 2, r0: 2, r1: r * 0.7, life: 0.42, max: 0.42, color: fx[1], w: 3 });
    this.fxDebris(x, y - 4, mv.type, Math.round(10 + r / 6), r * 2.4, 4.2, 4);
    // a crown of the type's debris thrown up all round the edge
    const shape = FX_DEBRIS[mv.type] || 'star', n = Math.round(8 + r / 10), up = ['flame', 'drop', 'leaf', 'bubble', 'feather'].includes(shape);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rand(-0.15, 0.15), px = x + Math.cos(a) * r * 0.7, py = y + Math.sin(a) * r * 0.5;
      this.particles.push({ kind: 'deb', shape, fx, x: px, y: py, vx: Math.cos(a) * 70, vy: Math.sin(a) * 40 - (up ? 110 : 30), drag: 2.5,
        life: rand(0.4, 0.55), max: 0.55, size: rand(5, 7), rot: a, seed: Math.random() * 1e6 });
    }
    // waves that ripple out one after another (sound, psychic, dark and the like)
    if (shape === 'ring' || shape === 'star') {
      for (let i = 1; i <= 2; i++) this.particles.push({ kind: 'wave', x, y: y - 2, r0: 4, r1: r * (1 - i * 0.12), life: 0.32 + i * 0.1, max: 0.32, color: i % 2 ? fx[1] : fx[2], w: 4 });
    }
    if (mv.type === 'electric') {   // lightning cracking outwards
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU + rand(-0.3, 0.3);
        this.particles.push({ kind: 'strike', x: x + Math.cos(a) * r * 0.95, y: y + Math.sin(a) * r * 0.65, x2: x, y2: y - 4, seed: Math.random() * 1e6, color: fx[1], life: 0.22, max: 0.22 });
      }
    }
  }

  // Buffs and heals: a shield for defence, chevrons for attack and speed, + signs for healing.
  fxBuff(m, mv) {
    const fx = TYPES[mv.type].fx, b = mv.buff || {};
    if (b.def) this.particles.push({ kind: 'shield', x: m.x, y: m.cy, r: m.r + 12, color: fx[2], life: 0.9, max: 0.9 });
    if (b.atk || b.spd) for (let i = 0; i < 6; i++) {
      this.particles.push({ kind: 'chevron', x: m.x + rand(-14, 14), y: m.cy + rand(-6, 12), vx: 0, vy: -rand(35, 60), size: rand(3, 4.5),
        color: b.atk ? '#ff7a5a' : '#7ad0ff', life: rand(0.5, 0.8), max: 0.8 });
    }
  }
  fxHeal(m) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({ kind: 'plus', x: m.x + rand(-16, 16), y: m.cy + rand(-4, 14), vx: rand(-6, 6), vy: -rand(30, 55), size: rand(2.5, 4),
        color: i % 3 ? '#8be04e' : '#eaffc8', life: rand(0.55, 0.9), max: 0.9 });
    }
  }

  // ---------------------------------------------------------- drawing (into the effect layer)
  // Everything attack-shaped for this frame. c is the effect layer, in world coordinates.
  drawAttacks(c) {
    for (const m of this.mons) if (m.visible && m.action) {
      if (m.action.kind === 'beam') this.drawBeam(c, m, m.action);
      if (m.action.kind === 'vortex') this.drawVortex(c, m, m.action);
      if (m.action.kind === 'burst' && !m.action.done) this.drawCharge(c, m, m.action);
    }
    for (const p of this.projectiles) this.drawProjectile(c, p);
    this.drawZoneFalls(c);
    this.drawParticles(c);
  }

  // a blast winding up: energy gathering at the user's feet
  drawCharge(c, m, a) {
    const fx = TYPES[a.mv.type].fx, k = clamp(a.t / a.mv.delay, 0, 1);
    for (let i = 0; i < 6; i++) {
      const ang = i / 6 * TAU + this.time * 5, rr = (1 - k) * 22 + 6;
      FXD.dot(c, m.x + Math.cos(ang) * rr, m.y - 2 + Math.sin(ang) * rr * 0.6, 1.8, i % 2 ? fx[1] : fx[2]);
    }
  }

  drawProjectile(c, p) {
    const t = p.mv.type, fx = TYPES[t].fx, R = p.r * 2.2, a = Math.atan2(p.vy, p.vx), T = this.time, x = p.x, y = p.y;
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
      case 'fire': case 'dragon': case 'ghost':
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

  drawBeam(c, m, a) {
    const mv = a.mv, fx = TYPES[mv.type].fx, T = this.time;
    const ox = m.x + Math.cos(a.dir) * 6, oy = m.cy + Math.sin(a.dir) * 6;
    if (a.phase === 'charge') {   // a ball of energy growing at the muzzle
      const k = a.t / mv.charge, r = 2.5 + k * mv.width * 0.55;
      FXD.circle(c, ox, oy, r, fx[0]); FXD.dot(c, ox, oy, r * 0.65, fx[1]); FXD.dot(c, ox, oy, r * 0.3, '#ffffff');
      if (mv.type === 'electric') FXD.bolt(c, ox, oy, ox + Math.cos(T * 30) * r * 2.2, oy + Math.sin(T * 30) * r * 2.2, (T * 30) | 0, 1.5, fx[1], 2, false);
      return;
    }
    const grow = Math.min(1, a.t / 0.08), fade = Math.min(1, (mv.dur - a.t) / 0.15);
    const len = mv.len * grow, w = mv.width * Math.max(0.25, fade) * 1.6;
    c.save(); c.translate(ox, oy); c.rotate(a.dir);
    if (mv.type === 'electric') {   // twisting lightning instead of a solid beam
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
      if (mv.type === 'fire') {
        for (let x = (T * 300) % 22; x < len - 6; x += 22) for (const s of [-1, 1]) FXD.flame(c, x, s * w * 0.45, Math.PI + s * 0.5, w * 0.22, fx, T + x);
      } else if (mv.type === 'grass' || mv.type === 'bug') {
        for (let x = (T * 240) % 18; x < len; x += 18) FXD.leaf(c, x, Math.sin(x * 0.15 + T * 20) * w * 0.55, x * 0.3 + T * 12, w * 0.24, fx[1], fx[0]);
      } else if (mv.type === 'psychic' || mv.type === 'dark' || mv.type === 'ghost') {
        for (let x = (T * 280) % 20; x < len; x += 20) FXD.ring(c, x, 0, w * 0.3, fx[2], 1.3, 3);
      } else if (mv.type === 'ice') {
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
    const mv = a.mv, fx = TYPES[mv.type].fx, T = this.time;
    const fade = clamp(Math.min(a.t / 0.15, (mv.dur - a.t) / 0.2), 0, 1), R = mv.r * fade;
    if (R < 2) return;
    if (mv.type === 'flying') {   // a funnel of wind with a dark cloud on top
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
      const left = z.delay - z.t, fx = TYPES[z.mv.type].fx, zx = z.x, zy = z.y;
      if (z.mv.fx === 'meteor' && left < 0.45) {
        const k = 1 - left / 0.45;
        FXD.flame(c, zx - 70 * (1 - k), zy - 170 * (1 - k), Math.atan2(170, 70), 7, fx, this.time);
      } else if (z.mv.fx === 'rock' && left < 0.35) {
        const k = 1 - left / 0.35;
        FXD.rock(c, zx, zy - 150 * (1 - k * k) - 6, z.id, 8, TYPES.rock.fx, z.id);
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
