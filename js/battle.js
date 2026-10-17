// Real-time room simulation + rendering: your active monster against 0-3 wild monsters.

const TAU = Math.PI * 2;
const SPR_SCALE = 1.5;   // world units per sprite pixel (3 canvas px at 2x)
const DMG_SCALE = 0.8;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let _uid = 1;
const BERRY_HEAL = 0.25;   // a berry heals a quarter of your active monster's HP
// The Ember Tracks relic's fire pools.
const EMBER_MV = { id: 'emberTrail', name: 'Ember Trail', type: 'fire', kind: 'zone', power: 60, linger: 1.4, tick: 0.35, status: ['brn', 0.1] };

const BALL_IMG = gridFromMap([
  '.kkkk.',
  'krrrrk',
  'kkwwkk',
  'kwwwwk',
  '.kkkk.',
], { k: OUTLINE, r: '#e8433a', w: '#f6f2ee' }).toCanvas();

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

// 14px icons for relics and shop goods.
const ICON_ART = {
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

// ------------------------------------------------------------------ Monster
// opts (wild monsters): hpMul / atkMul scale the arena stats, scale draws it bigger, boss marks a boss.
class Mon {
  constructor(def, side, opts = {}) {
    this.side = side;
    this.atkMul = opts.atkMul || 1;
    this.hpMul = opts.hpMul || 1;
    this.scale = opts.scale || 1;
    this.boss = !!opts.boss;
    this.aiKind = opts.ai || null;
    this.level = 1; this.xp = 0;
    this.bonus = { atk: 1, def: 1, spd: 1, cd: 1 };   // from relics (player side)
    this.setDef(def);
    this.hp = this.maxHp;
    this.fainted = false;
    this.dmgDealt = 0;
    this.status = null; this.statusT = 0; this.statusTick = 0;
    this.reset();
  }
  reset() {
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.kx = 0; this.ky = 0;
    this.face = 1; this.walkT = 0; this.view = 'front';
    this.cd = [0, 0, 0, 0]; this.gcd = 0;
    this.slowT = 0;          // status (PAR/BRN/FRZ) deliberately survives a swap
    this.buffs = []; this.action = null; this.stunT = 0;
    this.flash = 0; this.invuln = 0; this.visible = false; this.ghosts = []; this.ghostT = 0;
    this.fadeT = 0; this.spawnT = 0;
  }
  // Species-dependent bits (also used when evolving; HP keeps its share of the max).
  setDef(def) {
    const share = this.maxHp ? this.hp / this.maxHp : 1;
    this.def = def; this.id = def.id;
    this.item = ITEMS[def.item] || {};
    this.maxHp = this.calcMaxHp(); this.hp = Math.round(this.maxHp * share);
    this.r = (def.size === 'L' ? 17 : 12) * this.scale;
    this.h = SPRITES[def.id].size * SPR_SCALE * this.scale;
    this.moves = def.moves.map(k => MOVES[k]);
    const melee = this.moves.filter(m => m.kind === 'dash' || m.kind === 'burst' || m.kind === 'vortex').length;
    const ranged = this.moves.filter(m => ['projectile', 'beam', 'zone'].includes(m.kind)).length;
    this.prefRange = melee > ranged ? 45 : melee === ranged ? 85 : 125;
  }
  get canEvolve() { return !this.fainted && this.def.evolve && this.level >= this.def.evolve.level; }
  get cy() { return this.y - this.h * 0.4; }
  get alive() { return this.visible && !this.fainted; }
  buffMul(stat) { return this.buffs.reduce((m, b) => (b.stat === stat ? m * b.mul : m), 1); }
  // each level adds LV_HP to HP and LV_STAT to attack and defence
  lvMul(per) { return 1 + per * (this.level - 1); }
  calcMaxHp() { return Math.round(this.def.hp * this.hpMul * this.lvMul(LV_HP)); }
  atk() { return this.def.atk * this.atkMul * this.lvMul(LV_STAT) * this.bonus.atk * (this.item.atk || 1) * this.buffMul('atk') * (this.status === 'brn' ? 0.75 : 1); }
  defense() { return this.def.def * this.lvMul(LV_STAT) * this.bonus.def * (this.item.def || 1) * this.buffMul('def'); }
  cdMul() { return (this.item.cd || 1) * this.bonus.cd; }
  // Gain levels; HP grows with the level (and the new HP comes filled in).
  setLevel(n) {
    const old = this.maxHp;
    this.level = n;
    this.maxHp = this.calcMaxHp();
    if (!this.fainted) this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - old));
  }
  speed() {
    return this.def.spd * (this.item.spd || 1) * this.bonus.spd * this.buffMul('spd') *
      (this.status === 'par' ? 0.55 : 1) * (this.slowT > 0 ? 0.55 : 1);
  }
  canAct() { return this.visible && !this.fainted && !this.action && this.stunT <= 0 && this.status !== 'frz'; }
  // Turn to look along (dx, dy): the back when heading up the screen, the front when
  // heading down, the side (flipped by face) otherwise. A little hysteresis stops flicker.
  look(dx, dy) {
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 0.001 && ay < 0.001) return;
    const k = this.view === 'side' ? 1.6 : 0.8;
    if (ay > ax * k) this.view = dy < 0 ? 'back' : 'front';
    else { this.view = 'side'; if (ax > 0.001) this.face = Math.sign(dx); }
  }
}

// ------------------------------------------------------------------ CPU brain
// Drives one monster (each wild monster has its own; tests can drive the player with one).
class AI {
  constructor(diff) { this.d = diff; this.reset(); }
  reset() { this.dir = { x: 0, y: 0 }; this.want = -1; this.delay = 0; this.think = rand(0.2, 0.6); this.strafe = Math.random() < 0.5 ? 1 : -1; }

  update(dt, me, b) {
    const foe = b.foe(me);
    if (!foe) { this.dir = { x: 0, y: 0 }; this.want = -1; return this.dir; }
    this.think -= dt;
    if (this.think <= 0) {
      this.think = this.d.think * rand(0.7, 1.3);
      this.decide(me, foe, b);
    }
    if (this.want >= 0) {
      this.delay -= dt;
      if (this.delay <= 0) {
        if (b.tryMove(me, this.want) || me.cd[this.want] > 0) this.want = -1;
      }
    }
    return this.dir;
  }

  decide(me, foe, b) {
    const dx = foe.x - me.x, dy = foe.y - me.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    let mx, my;
    const threat = this.threat(me, b);
    if (threat && Math.random() < this.d.dodge) {
      mx = threat.x; my = threat.y;
    } else {
      if (Math.random() < 0.07) this.strafe *= -1;
      const radial = d > me.prefRange + 18 ? 1 : d < me.prefRange - 18 ? -0.8 : 0;
      mx = ux * radial - uy * this.strafe * 0.75;
      my = uy * radial + ux * this.strafe * 0.75;
    }
    // wild monsters spread out instead of piling onto one spot
    for (const o of b.e) {
      if (o === me || !o.alive || me.side !== 'enemy') continue;
      const ox = me.x - o.x, oy = me.y - o.y, od = Math.hypot(ox, oy);
      if (od < 60 && od > 0.1) { mx += ox / od * 0.7; my += oy / od * 0.7; }
    }
    // keep away from walls
    const m = 30, F = b.F;
    if (me.x < F.x0 + m) mx += 0.8; if (me.x > F.x1 - m) mx -= 0.8;
    if (me.y < F.y0 + m) my += 0.8; if (me.y > F.y1 - m) my -= 0.8;
    if ((me.x < F.x0 + m || me.x > F.x1 - m) && Math.random() < 0.3) this.strafe *= -1;
    const mm = Math.hypot(mx, my);
    this.dir = mm > 0.05 ? { x: mx / mm, y: my / mm } : { x: 0, y: 0 };

    // wild monsters take turns, so three of them don't all fire on the same frame
    const waiting = me.side === 'enemy' && b.enemyAtkT > 0;
    if (this.want < 0 && !waiting && me.canAct() && Math.random() < this.d.aggro) {
      const i = this.pick(me, foe, d);
      if (i >= 0) { this.want = i; this.delay = this.d.react * Math.random(); }
    }
  }

  pick(me, foe, d) {
    const c = [];
    me.moves.forEach((mv, i) => {
      if (me.cd[i] > 0) return;
      let ok = false, w = mv.power || 0;
      switch (mv.kind) {
        case 'projectile': ok = d < (mv.boomerang ? mv.range + 30 : 280); break;
        case 'vortex': ok = d < mv.r - 6; w *= 1.3; break;
        case 'beam': ok = d < mv.len - 20; w *= 1.1; break;
        case 'dash': ok = d < mv.speed * mv.dur + me.r + foe.r; w *= 1.2; break;
        case 'burst': ok = d < mv.r + foe.r * 0.5 - 4; w *= 1.4; break;
        case 'zone': ok = d < 300; break;
        case 'heal': ok = me.hp / me.maxHp < 0.5; w = 420; break;
        case 'buff': ok = me.buffs.length === 0 && d > 70; w = 140; break;
      }
      if (ok) c.push([i, Math.max(20, w * typeEffect(mv.type, foe.def.types))]);
    });
    if (!c.length) return -1;
    let total = c.reduce((s, x) => s + x[1], 0), r = Math.random() * total;
    for (const [i, w] of c) { if ((r -= w) <= 0) return i; }
    return c[0][0];
  }

  // Returns a unit vector to dodge along, or null.
  threat(me, b) {
    let best = null, bestT = Infinity;
    for (const p of b.projectiles) {
      if (p.owner.side === me.side) continue;
      const rx = me.x - p.x, ry = me.cy - p.y;
      const vv = p.vx * p.vx + p.vy * p.vy;
      const t = (rx * p.vx + ry * p.vy) / vv;
      if (t < 0 || t > 0.9) continue;
      const cx = rx - p.vx * t, cy = ry - p.vy * t;
      const s = Math.hypot(cx, cy);
      if (s < me.r + p.r + 10 && t < bestT) {
        bestT = t;
        const sp = Math.sqrt(vv);
        best = s > 0.5 ? { x: cx / s, y: cy / s } : { x: -p.vy / sp, y: p.vx / sp };
      }
    }
    if (best) return best;
    for (const z of b.zones) {
      // incoming strikes, and lingering pools that are still active
      if (z.owner.side === me.side || (z.done && !z.mv.linger)) continue;
      const dd = Math.hypot(me.x - z.x, me.y - z.y);
      if (dd < z.r + me.r + 8) return dd > 0.5 ? { x: (me.x - z.x) / dd, y: (me.y - z.y) / dd } : { x: 1, y: 0 };
    }
    for (const foe of b.foes(me)) {
      const a = foe.action;
      if (!a) continue;
      if (a.kind === 'beam' || a.kind === 'dash') {
        const cx = Math.cos(a.dir), cy = Math.sin(a.dir);
        const along = (me.x - foe.x) * cx + (me.cy - foe.cy) * cy;
        if (along < -10) continue;   // it's aimed away from me
        const side = Math.sign((me.x - foe.x) * cy - (me.cy - foe.cy) * cx) || 1;
        return { x: cy * side, y: -cx * side };
      }
      if (a.kind === 'burst' || a.kind === 'vortex') {   // get out of the blast or the pull
        const dd = dist(me, foe) || 1;
        if (dd < a.mv.r + (a.kind === 'vortex' ? 30 : 18)) return { x: (me.x - foe.x) / dd, y: (me.y - foe.y) / dd };
      }
    }
    return null;
  }
}

// ------------------------------------------------------------------ Room
// One room of a floor. The player's party lives on the run; wild monsters are made
// when an uncleared room is entered. hooks: exit(dir), stairs(), recruit(pedestal), end(result).
class Battle {
  constructor({ run, room, entry = null, ui, hooks = {} }) {
    this.run = run; this.room = room; this.ui = ui; this.hooks = hooks;
    this.F = roomField(room);
    const built = roomCanvas(room, run.stageKey);
    this.ground = built.canvas; this.stage = built.stage;
    if (!room.decal) { room.decal = document.createElement('canvas'); room.decal.width = room.w; room.decal.height = room.h; }
    this.decal = room.decal; this.dctx = this.decal.getContext('2d');
    this.trainerImg = { front: trainerCanvas('player', false), back: trainerCanvas('player', true), side: trainerCanvas('player', 'side') };
    this.projectiles = []; this.zones = []; this.particles = []; this.floats = []; this.texts = []; this.balls = [];
    this.pickups = room.pickups;
    this.weather = Array.from({ length: 70 }, () => this.newFlake(true));
    this.state = 'explore'; this.stateT = 0; this.time = 0;
    this.shake = 0; this.hitstop = 0; this.enemyAtkT = 0; this.winT = 0;
    this.e = [];
    this.pedestals = [];
    this.stairs = null;
    room.visited = true;

    // walk in through the doorway we came from (or stand in the middle of the start room)
    const P = this.P;
    P.reset(); P.visible = true;
    const F = this.F;
    let px = (F.x0 + F.x1) / 2, py = (F.y0 + F.y1) / 2 + 20, tx = px, ty = py + 30;
    if (entry) {
      const d = doorPos(room, entry), [dx, dy] = DOOR_DIRS[entry];
      px = d.x - dx * 26; py = d.y - dy * 26 + (dy === 0 ? 10 : 0) + (entry === 'n' ? P.r : 0);
      tx = d.x - dx * 4; ty = d.y - dy * 4 + (dy === 0 ? 10 : 0) + (entry === 'n' ? P.r : 0);
      P.face = dx !== 0 ? -dx : 1;
      P.look(-dx, -dy);
    }
    P.x = px; P.y = py;
    this.trainer = { x: tx, y: ty, view: entry === 's' ? 'back' : entry === 'w' || entry === 'e' ? 'side' : 'front', face: entry === 'e' ? -1 : 1, walkT: 0, moving: false };
    this.cam = { x: 0, y: 0 };
    this.updateCamera(1);

    if (!room.cleared && room.enemies.length) this.startFight();
    this.makePedestals();
    if (room.type === 'boss' && room.cleared) this.placeStairs();
  }

  get p() { return this.run.party; }
  get pi() { return this.run.pi; }
  set pi(v) { this.run.pi = v; }
  get P() { return this.p[this.pi]; }
  get mons() { return [this.P, ...this.e]; }
  get fighting() { return this.state === 'fight'; }
  get swapCd() { return { player: this.run.swapCd }; }
  get boss() { return this.e.find(m => m.boss) || null; }
  // does this monster's side have the relic? (relics only help your party)
  relic(m, id) { return m.side === 'player' && this.run.relics.includes(id); }

  // Who a monster attacks: wild monsters go for you, your moves aim at the nearest wild monster.
  foe(m) {
    if (m.side === 'enemy') return this.P;
    let best = null, bd = Infinity;
    for (const e of this.e) {
      if (!e.alive) continue;
      const d = dist(m, e);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  // Everything a monster's attacks can hit.
  foes(m) { return m.side === 'enemy' ? (this.P.alive ? [this.P] : []) : this.e.filter(e => e.alive); }

  // ---------------------------------------------------------- flow
  startFight() {
    const F = this.F, P = this.P;
    this.e = this.room.enemies.map((spec, i) => {
      const m = new Mon(ROSTER_BY_ID[spec.id], 'enemy', spec);
      m.ai = new AI(WILD_AI[spec.ai || 'wild']);
      // appear somewhere away from the player (bosses at the far side of the room)
      let x, y, tries = 0;
      do {
        x = rand(F.x0 + 50, F.x1 - 50); y = rand(F.y0 + 40, F.y1 - 30);
        if (spec.boss) { x = (F.x0 + F.x1) / 2 + rand(-40, 40); y = P.y > (F.y0 + F.y1) / 2 ? F.y0 + 90 : F.y1 - 70; }
      } while (tries++ < 40 && (Math.hypot(x - P.x, y - P.y) < 170 || this.e.some(o => Math.hypot(o.x - x, o.y - y) < 60)));
      m.x = x; m.y = y; m.face = x < P.x ? 1 : -1;
      m.spawnT = 0.7 + i * 0.35;
      return m;
    });
    this.state = 'fight'; this.stateT = 0;
    this.doorFx('close');
    if (this.boss) this.ui.banner('BOSS!');
  }

  clearRoom() {
    this.room.cleared = true;
    this.run.stats.rooms++;
    this.evolveReady();
    if (this.boss && this.hooks.bossBeaten) this.hooks.bossBeaten(this.boss.id);
    this.state = 'explore'; this.stateT = 0;
    this.projectiles = this.projectiles.filter(p => p.owner.side === 'player');
    this.zones = this.zones.filter(z => z.owner.side === 'player');
    this.doorFx('open');
    if (this.room.type === 'boss') {
      if (this.run.floorN >= RUN_FLOORS) {
        this.ui.banner('RUN CLEARED!');
        this.winT = 2.6;   // a moment to enjoy it before the results
      } else {
        this.ui.banner('FLOOR CLEARED!');
        this.placeStairs();
      }
    } else this.ui.banner('ROOM CLEAR!');
  }

  // Things to walk up to: recruits, shop goods, a treasure relic.
  makePedestals() {
    const room = this.room, F = this.F, cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2;
    this.pedestals = [];
    if (room.type === 'recruit' && !room.recruited)
      this.pedestals = room.offer.map((id, i) => ({ kind: 'mon', id, x: cx + (i - 1) * 120, y: cy - 6, cool: 0 }));
    if (room.type === 'shop')
      room.stock.forEach((it, i) => { if (!it.sold) this.pedestals.push({ kind: 'shop', item: it, id: it.id, x: cx + (i - 1.5) * 100, y: cy - 6, cool: 0 }); });
    if (room.type === 'treasure' && !room.taken)
      this.pedestals = [{ kind: 'relic', id: room.relic, x: cx, y: cy - 6, cool: 0 }];
  }

  placeStairs() {
    const F = this.F;
    this.stairs = { x: (F.x0 + F.x1) / 2, y: (F.y0 + F.y1) / 2 };
  }

  // Starters that reached their level transform (between fights, so moves don't change mid-combo).
  evolveReady() {
    for (const m of this.p) {
      if (!m.canEvolve) continue;
      const from = m.def.name, to = ROSTER_BY_ID[m.def.evolve.to];
      m.setDef(to);
      m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.25));
      this.ui.banner(`${from} EVOLVED!`);
      this.run.stats.evolved = (this.run.stats.evolved || 0) + 1;
      Sfx.play('evolve');
      if (m === this.P) {
        m.flash = 1.2;
        this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: 46, life: 0.6, max: 0.6, color: '#ffffff', kind: 'ring', w: 3 });
        this.burst(m.x, m.cy, ['#ffffff', '#ffe066', '#a8d0ff'], 40, 110, -40);
        this.ui.onSendOut('player', m);
      }
    }
  }

  doorFx(kind) {
    Sfx.play(kind === 'close' ? 'doorShut' : 'doorOpen');
    for (const dir of Object.keys(this.room.doors)) {
      const d = doorPos(this.room, dir);
      this.burst(d.x, d.y, [this.stage.wall[2], this.stage.wall[3], '#ffffff'], 12, 60, 0, 4);
    }
    if (kind === 'close') this.addShake(3);
  }

  // Throw the active monster out of the ball (after a faint), next to the trainer.
  sendOut(at) {
    const m = this.P;
    m.reset();
    const t = this.trainer, F = this.F;
    const pos = at || { x: t.x + (t.x < (F.x0 + F.x1) / 2 ? 24 : -24), y: t.y + (t.y < (F.y0 + F.y1) / 2 ? 18 : -18) };
    m.x = clamp(pos.x, F.x0 + m.r, F.x1 - m.r); m.y = clamp(pos.y, F.y0 + m.r, F.y1 - 2);
    m.face = 1;
    this.balls.push({ from: { x: t.x, y: t.y - 14 }, to: { x: m.x, y: m.y - 6 }, t: 0, dur: 0.55 });
    this.ui.onSendOut('player', m);
    Sfx.play('ball');
  }

  // Mid-fight swap: the fight keeps running while the new monster is thrown in,
  // so you are briefly open to attack.
  canSwap(side, idx) {
    return (this.state === 'fight' || this.state === 'explore') && this.run.swapCd <= 0 && idx !== this.pi &&
      this.p[idx] && !this.p[idx].fainted && !this.balls.length && this.P.visible;
  }

  swap(side, idx) {
    if (!this.canSwap(side, idx)) return false;
    const out = this.P;
    const at = { x: out.x, y: out.y };
    out.action = null; out.visible = false; out.ghosts = [];
    const tp = this.trainer;
    this.particles.push({ x: tp.x, y: tp.y - 14, g: tp.y, x2: out.x, y2: out.cy, k2: out.y - out.cy, life: 0.3, max: 0.3, color: '#ff5a4a', kind: 'line' });
    this.particles.push({ x: out.x, y: out.y - 4, r0: 22, r1: 2, life: 0.3, max: 0.3, color: '#ffffff', kind: 'ring', w: 3 });
    this.burst(out.x, out.cy, ['#ff5a4a', '#ffffff'], 14, 60);
    this.pi = idx;
    // out of a fight, swapping is free
    this.run.swapCd = this.state === 'fight' ? 8 : 0.5;
    const inc = this.P;
    this.ui.callout('player', `Go, ${inc.def.name}`, inc.def.types[0]);
    this.sendOut(at);
    return true;
  }

  // The active monster was changed from a menu (recruit swap-in, release): put the new one where the old one stood.
  replaceActive(at) {
    const m = this.P;
    m.reset(); m.visible = true;
    m.x = at.x; m.y = at.y;
    this.burst(m.x, m.cy, ['#ffffff', '#ffe9a0'], 18, 80);
    this.ui.onSendOut('player', m);
  }

  faint(m) {
    if (m.fainted) return;
    m.fainted = true; m.hp = 0; m.action = null; m.fadeT = 0;
    Sfx.play('faint');
    this.burst(m.x, m.cy, ['#ffffff', '#cfd6e6'], 26, 90);
    if (m.side === 'enemy') {
      this.run.stats.kos++;
      this.dropLoot(m);
      this.giveXp(m.boss ? XP_BOSS : m.scale > 1 ? XP_TOUGH : XP_WILD);
      return;
    }
    this.ui.banner(`${m.def.name} FAINTED!`);
    for (const e of this.e) e.action = null;
    this.projectiles = []; this.zones = [];
    this.state = 'faint'; this.stateT = 0;
  }

  resolveFaint() {
    if (!this.p.some(m => !m.fainted)) { this.end('lose'); return; }
    this.state = 'pick';
    this.ui.pickNext(this.p, idx => {
      this.pi = idx;
      this.state = this.e.some(m => !m.fainted) ? 'fight' : 'explore';
      this.stateT = 0;
      this.sendOut();
    });
  }

  end(result) {
    if (this.state === 'over') return;
    this.state = 'over';
    Sfx.music.stop(0.6);
    setTimeout(() => Sfx.play(result === 'win' ? 'win' : 'lose'), 500);
    if (this.hooks.end) this.hooks.end(result);
  }

  // ---------------------------------------------------------- xp
  giveXp(amount) {
    for (const ev of this.run.giveXp(amount)) {
      const m = ev.mon, heal = Math.round(m.maxHp * LV_HEAL);
      m.hp = Math.min(m.maxHp, m.hp + heal);
      if (m === this.P) {
        this.text(m.x, m.y - m.h - 14, `LEVEL ${m.level}!`, '#ffe066');
        this.burst(m.x, m.cy, ['#ffe066', '#ffffff', '#ffd23f'], 20, 60, -50);
        this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: 30, life: 0.4, max: 0.4, color: '#ffe066', kind: 'ring', w: 2 });
      } else {
        const t = this.trainer;
        this.text(t.x, t.y - 34, `${m.def.name} LV ${m.level}`, '#ffe9a0');
      }
      Sfx.play('levelUp');
    }
    if (this.state === 'explore') this.evolveReady();
  }

  // ---------------------------------------------------------- loot
  dropLoot(m) {
    let coins = m.boss ? 8 + this.run.floorN * 2 : m.scale > 1 ? 3 : 1 + (Math.random() < 0.5 ? 1 : 0);
    if (this.run.relics.includes('luckyCoin')) coins = Math.round(coins * 1.5 + Math.random() * 0.5);
    for (let i = 0; i < coins; i++) this.spawnPickup('coin', m.x, m.y);
    const basket = this.run.relics.includes('berryBasket');
    if (m.boss || Math.random() < (basket ? 0.45 : 0.3)) this.spawnPickup('berry', m.x, m.y);
  }

  spawnPickup(kind, x, y) {
    const a = rand(0, TAU), s = rand(30, 90);
    this.pickups.push({ kind, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, z: 4, vz: rand(90, 150), t: 0 });
  }

  updatePickups(dt) {
    const P = this.P, F = this.F;
    for (const k of this.pickups) {
      k.t += dt;
      if (k.z > 0 || k.vz > 0) {   // bouncing out of the fainted monster
        k.vz -= 420 * dt; k.z += k.vz * dt;
        if (k.z <= 0) { k.z = 0; k.vz = k.vz < -60 ? -k.vz * 0.4 : 0; k.vx *= 0.6; k.vy *= 0.6; }
      } else { k.vx *= Math.exp(-dt * 6); k.vy *= Math.exp(-dt * 6); }
      // it drifts to you when you walk close
      const d = Math.hypot(P.x - k.x, P.y - k.y);
      if (P.alive && k.t > 0.5 && d < 56) {
        const pull = 260 * (1 - d / 70);
        k.vx += (P.x - k.x) / (d || 1) * pull * dt * 8; k.vy += (P.y - k.y) / (d || 1) * pull * dt * 8;
      }
      k.x = clamp(k.x + k.vx * dt, F.x0 + 4, F.x1 - 4); k.y = clamp(k.y + k.vy * dt, F.y0 + 4, F.y1 - 2);
      if (P.alive && k.t > 0.5 && d < 12 + P.r * 0.4) this.collect(k);
    }
    this.pickups.splice(0, this.pickups.length, ...this.pickups.filter(k => !k.got));
  }

  collect(k) {
    k.got = true;
    const P = this.P;
    if (k.kind === 'coin') {
      this.run.coins++;
      this.sparks(k.x, k.y - 4, 4, '#ffe066');
      Sfx.play('coin');
    } else {
      const heal = Math.round(Math.min(P.maxHp * (this.run.relics.includes('berryBasket') ? 0.4 : BERRY_HEAL), P.maxHp - P.hp));
      P.hp += heal;
      this.number(P, heal, null, '#b6ff9a', '#4fae2e', '+');
      this.burst(P.x, P.cy, ['#4fae2e', '#b6ff9a', '#ffffff'], 14, 50, -50);
      Sfx.play('heal');
    }
  }

  // ---------------------------------------------------------- moves
  tryMove(m, i) {
    if (this.state !== 'fight' || !m.canAct() || m.cd[i] > 0 || m.gcd > 0 || !this.foe(m)) return false;
    this.execute(m, i);
    return true;
  }

  aim(m, foe, mv) {
    let tx = foe.x, ty = foe.cy;
    const d = m.ai && m.side === 'enemy' ? m.ai.d : null;
    if (d && d.lead && mv.speed && mv.kind === 'projectile') {
      const t = Math.hypot(tx - m.x, ty - m.cy) / mv.speed;
      tx += foe.vx * t * 0.8; ty += foe.vy * t * 0.8;
    }
    let a = Math.atan2(ty - m.cy, tx - m.x);
    if (d) a += (Math.random() - 0.5) * 2 * d.aimErr;
    return a;
  }

  execute(m, i) {
    const mv = m.moves[i], foe = this.foe(m), F = this.F;
    m.cd[i] = mv.cd * m.cdMul();
    m.gcd = 0.35;
    if (m.side === 'enemy') {
      const alive = this.e.filter(e => e.alive).length;
      this.enemyAtkT = alive > 1 ? rand(0.5, 0.8) + 0.2 * (alive - 2) : 0;
    }
    this.ui.callout(m.side, mv.name, mv.type);
    const dir = this.aim(m, foe, mv);
    if (Math.abs(Math.cos(dir)) > 0.2) m.face = Math.cos(dir) > 0 ? 1 : -1;
    m.look(Math.cos(dir), Math.sin(dir));
    const fx = TYPES[mv.type].fx;

    switch (mv.kind) {
      case 'projectile': {
        const split = this.relic(m, 'splitShot') && !mv.boomerang;
        const n = (mv.count || 1) + (split ? 1 : 0), sp = split ? Math.max(mv.spread || 0, 0.22) : mv.spread || 0;
        for (let k = 0; k < n; k++) {
          const a = dir + (n > 1 ? (k / (n - 1) - 0.5) * sp : 0);
          this.projectiles.push({
            x: m.x + Math.cos(a) * m.r, y: m.cy + Math.sin(a) * m.r,
            vx: Math.cos(a) * mv.speed, vy: Math.sin(a) * mv.speed,
            r: mv.r || 4, mv, owner: m, life: 2.6, spin: rand(0, TAU), k: m.y - m.cy,
            // boomerangs fly out `range`, then home back to the thrower
            out: mv.boomerang ? mv.range / mv.speed : 0, back: false, hitCd: 0, hitIds: null,
          });
        }
        m.action = { kind: 'cast', t: 0, dur: 0.18, lock: true };
        Sfx.play(mv.boomerang ? 'whoosh' : 'shoot');
        break;
      }
      case 'beam':
        m.action = { kind: 'beam', t: 0, mv, dir, lock: true, phase: 'charge', tick: 0, id: _uid++ };
        Sfx.beamCharge(mv.charge);
        break;
      case 'dash':
        m.action = { kind: 'dash', t: 0, mv, dir, lock: true, hit: false, tgt: foe, id: _uid++ };
        Sfx.play('dash');
        break;
      case 'vortex':
        m.action = { kind: 'vortex', t: 0, mv, dir, lock: true, tick: 0, id: _uid++ };
        Sfx.play('vortex');
        break;
      case 'burst':
        m.action = { kind: 'burst', t: 0, mv, dir, lock: true, done: false, r: mv.r * (this.relic(m, 'blastCore') ? 1.25 : 1) };
        Sfx.play(mv.sfx || 'charge');   // a move can bring its own wind-up sound
        break;
      case 'zone': {
        const n = mv.count || 1;
        for (let k = 0; k < n; k++) {
          const off = k === 0 ? 0 : (mv.scatter || 30);
          const a = rand(0, TAU), rr = rand(0.4, 1) * off;
          this.zones.push({
            x: clamp(foe.x + Math.cos(a) * rr, F.x0 + 8, F.x1 - 8),
            y: clamp(foe.y + Math.sin(a) * rr, F.y0 + 8, F.y1 - 8),
            r: mv.r * (this.relic(m, 'blastCore') ? 1.25 : 1), t: 0, delay: mv.delay + k * 0.18, mv, owner: m, done: false, tick: 0, id: _uid++,
          });
        }
        m.action = { kind: 'cast', t: 0, dur: 0.25, lock: true };
        Sfx.play('shoot');
        break;
      }
      case 'buff': {
        for (const [stat, mul] of Object.entries(mv.buff)) {
          m.buffs = m.buffs.filter(b => b.stat !== stat);
          m.buffs.push({ stat, mul, t: mv.dur });
        }
        const label = Object.keys(mv.buff).map(s => s.toUpperCase()).join(' & ') + ' UP!';
        this.text(m.x, m.y - m.h - 6, label, fx[1], m.y);
        this.burst(m.x, m.cy, fx, 18, 60, -40);
        m.action = { kind: 'cast', t: 0, dur: 0.35, lock: true };
        Sfx.play('buff');
        break;
      }
      case 'heal': {
        const amt = Math.round(m.maxHp * mv.amount);
        const real = Math.round(Math.min(amt, m.maxHp - m.hp));
        m.hp = Math.min(m.maxHp, m.hp + real);
        this.number(m, real, null, '#b6ff9a', '#4fae2e', '+');
        this.burst(m.x, m.cy, ['#4fae2e', '#b6ff9a', '#ffffff'], 22, 50, -50);
        m.action = { kind: 'cast', t: 0, dur: 0.45, lock: true };
        Sfx.play('heal');
        break;
      }
    }
  }

  // Apply damage. mult scales power (beam ticks), opts.merge groups numbers,
  // opts.kb sets the knockback direction and opts.force overrides its strength.
  hit(src, tgt, mv, mult = 1, opts = {}) {
    if (!tgt.visible || tgt.fainted || tgt.invuln > 0) return 0;
    const eff = typeEffect(mv.type, tgt.def.types);
    const stab = src.def.types.includes(mv.type) ? 1.3 : 1;
    const itemMul = src.item.boostType === mv.type ? src.item.mul : 1;
    const crit = mult >= 1 && Math.random() < (mv.crit || 0.06);
    let dmg = DMG_SCALE * mv.power * mult * (src.atk() / tgt.defense()) * stab * eff * itemMul * (crit ? 1.5 : 1) * rand(0.9, 1.05);
    dmg = Math.max(1, Math.round(dmg));
    tgt.hp = Math.max(0, tgt.hp - dmg);
    src.dmgDealt += dmg;
    tgt.flash = 0.12;

    const merge = opts.merge ? opts.merge + ':' + (tgt.uid || (tgt.uid = _uid++)) : null;
    const fresh = this.number(tgt, dmg, merge);
    const kb = opts.kb ?? Math.atan2(tgt.cy - src.cy, tgt.x - src.x);
    // bosses barely budge
    const force = (opts.force ?? (mult < 1 ? 22 : Math.min(260, 60 + dmg * 0.45))) * (tgt.boss ? 0.35 : 1);
    tgt.kx += Math.cos(kb) * force; tgt.ky += Math.sin(kb) * force;

    const fx = TYPES[mv.type].fx;
    this.burst(tgt.x, tgt.cy, fx, mult < 1 ? 4 : Math.min(30, 8 + dmg / 15), 110);
    if (mult >= 1 || fresh) this.sparks(tgt.x, tgt.cy, mult < 1 ? 3 : 8);
    if (fresh) {
      if (eff >= 2) this.text(tgt.x, tgt.y - tgt.h - 12, 'SUPER EFFECTIVE!', '#ffe066', tgt.y);
      else if (eff < 1) this.text(tgt.x, tgt.y - tgt.h - 12, eff <= 0.25 ? 'BARELY AFFECTS...' : 'NOT VERY EFFECTIVE', '#c8c8d8', tgt.y);
      if (crit) this.text(tgt.x, tgt.y - tgt.h - 22, 'CRITICAL HIT!', '#ff7a5a', tgt.y);
    }
    Sfx.play(dmg > 200 ? 'bigHit' : 'hit');
    this.addShake(mult < 1 ? 1.2 : Math.min(6, 1 + dmg / 80));
    if (mult >= 1 && dmg > 150) this.hitstop = Math.min(0.09, 0.03 + dmg / 6000);

    if (mv.status && Math.random() < mv.status[1] * Math.min(1, mult * 3)) this.applyStatus(tgt, mv.status[0]);
    if (mult >= 1 && this.relic(src, 'staticCharm') && Math.random() < 0.1) this.applyStatus(tgt, 'par');
    if (mv.slow) tgt.slowT = Math.max(tgt.slowT, mv.slow);
    // drain: the attacker heals for part of the damage it dealt
    const drain = (mv.drain || 0) + (mv.kind === 'beam' && this.relic(src, 'leechLens') ? 0.15 : 0);
    if (drain && !src.fainted && src.hp > 0) {
      const heal = Math.round(Math.min(dmg * drain, src.maxHp - src.hp));
      if (heal > 0) {
        src.hp += heal;
        this.number(src, heal, opts.merge ? 'drain' + opts.merge : null, '#b6ff9a', '#4fae2e', '+');
        this.particles.push({ x: tgt.x, y: tgt.cy, x2: src.x, y2: src.cy, k2: src.y - src.cy, life: 0.25, max: 0.25, color: '#b6ff9a', kind: 'line' });
        this.burst(src.x, src.cy, ['#4fae2e', '#b6ff9a'], 8, 40, -40);
        Sfx.play('drain');
      }
    }
    if (tgt.hp <= 0) this.faint(tgt);
    return dmg;
  }

  applyStatus(m, s) {
    if (m.status || m.fainted) return;
    const immune = { par: ['electric'], brn: ['fire'], frz: ['ice'], psn: ['poison', 'steel'] }[s];
    if (m.def.types.some(t => immune.includes(t))) return;
    m.status = s;
    m.statusT = { par: 8, brn: 6, frz: 1.6, psn: 8 }[s];
    m.statusTick = 1;
    const label = { par: 'IS PARALYZED!', brn: 'WAS BURNED!', frz: 'IS FROZEN!', psn: 'WAS POISONED!' }[s];
    const col = { par: '#ffe066', brn: '#ff8a4a', frz: '#bff0ff', psn: '#e0a0ff' }[s];
    this.text(m.x, m.y - m.h - 2, label, col, m.y);
    if (s === 'frz') { m.action = null; m.vx = m.vy = 0; }
    Sfx.play('status');
  }

  // ---------------------------------------------------------- update
  update(dt) {
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    this.time += dt; this.stateT += dt;
    this.shake *= Math.exp(-dt * 9);
    this.updateWeather(dt);
    this.updateParticles(dt);
    this.updateBalls(dt);

    switch (this.state) {
      case 'explore':
      case 'fight': {
        this.run.stats.time += dt;
        this.run.swapCd -= dt; this.enemyAtkT -= dt;
        const P = this.P;
        this.updateMon(P, dt, Input.dir(0));
        if (this.state === 'fight') {
          const held = Input.moves(0);
          for (let i = 0; i < 4; i++) if (held[i]) this.tryMove(P, i);
        }
        for (const m of this.e) {
          if (this.state === 'faint') break;
          if (m.spawnT > 0) { this.updateSpawn(m, dt); continue; }
          if (!m.alive) continue;
          const dir = m.ai.update(dt, m, this);
          if (this.state !== 'faint') this.updateMon(m, dt, dir);
        }
        if (this.state === 'faint') break;
        const ms = this.mons.filter(m => m.alive);
        for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) this.separate(ms[i], ms[j]);
        this.updateProjectiles(dt);
        this.updateZones(dt);
        if (this.state === 'faint') break;
        this.updatePickups(dt);
        if (this.state === 'fight' && this.e.length && this.e.every(m => m.fainted) && this.balls.length === 0) this.clearRoom();
        if (this.state === 'explore') this.checkExplore(dt);
        if (this.winT > 0 && (this.winT -= dt) <= 0) this.end('win');
        break;
      }
      case 'faint':
        this.idle(dt);
        if (this.stateT > 1.8) this.resolveFaint();
        break;
    }
    for (const m of this.mons) {
      if (m.fainted) m.fadeT += dt;
      m.ghosts.forEach(g => (g.t -= dt));
      m.ghosts = m.ghosts.filter(g => g.t > 0);
    }
    this.updateTrainer(dt);
    this.updateCamera(dt);
  }

  updateSpawn(m, dt) {
    m.spawnT -= dt;
    if (m.spawnT > 0) return;
    m.visible = true; m.flash = 0.35; m.invuln = 0.4;
    this.particles.push({ x: m.x, y: m.y, r0: 2, r1: 30, life: 0.35, max: 0.35, color: '#ffffff', kind: 'ring', w: 3 });
    this.burst(m.x, m.cy, ['#ffffff', '#d8d0e8', '#8a809a'], 22, 90);
    Sfx.play('pop');
  }

  // Out of a fight: doorways, the recruit pedestals and the stairs.
  checkExplore(dt) {
    const P = this.P, F = this.F;
    if (!P.alive) return;
    const exit = P.y < F.y0 - 14 ? 'n' : P.y > F.y1 + 16 ? 's' : P.x < F.x0 - 14 ? 'w' : P.x > F.x1 + 14 ? 'e' : null;
    if (exit && this.room.doors[exit] && this.hooks.exit) { this.state = 'leaving'; this.hooks.exit(exit); return; }
    for (const ped of this.pedestals) {
      ped.cool -= dt;
      const d = Math.hypot(P.x - ped.x, P.y - ped.y);
      if (d < 18 + P.r) {   // solid: push the player back out
        const ux = (P.x - ped.x) / (d || 1), uy = (P.y - ped.y) / (d || 1);
        P.x = ped.x + ux * (18 + P.r); P.y = ped.y + uy * (18 + P.r);
        if (ped.cool <= 0 && this.hooks.offer) {
          ped.cool = 1.2;
          this.state = 'pick'; Input.reset();
          this.hooks.offer(ped);
          return;
        }
      }
    }
    if (this.stairs && Math.hypot(P.x - this.stairs.x, P.y - this.stairs.y) < 16 && this.hooks.stairs) {
      this.state = 'leaving';
      Sfx.play('stairs');
      this.hooks.stairs();
    }
  }

  // Called once an offer menu closes. took: true if the player recruited / bought / took it.
  offerDone(ped, took) {
    this.state = 'explore';
    if (!took) return;
    if (ped.kind === 'mon') {
      this.room.recruited = true;
      for (const o of this.pedestals) this.burst(o.x, o.y - 20, o === ped ? ['#ffe066', '#ffffff'] : ['#ffffff', '#cfd6e6'], 20, 80);
      this.pedestals = [];
      Sfx.play('ball');
      return;
    }
    if (ped.kind === 'shop') ped.item.sold = true;
    if (ped.kind === 'relic') this.room.taken = true;
    this.burst(ped.x, ped.y - 16, ['#ffe066', '#ffffff', '#ffd23f'], 20, 80);
    this.pedestals = this.pedestals.filter(o => o !== ped);
    Sfx.play(ped.kind === 'shop' ? 'coin' : 'buff');
  }

  // The trainer follows a step behind your monster.
  updateTrainer(dt) {
    const t = this.trainer, P = this.P, F = this.F;
    const dx = P.x - t.x, dy = P.y - t.y, d = Math.hypot(dx, dy);
    const gap = 34;
    t.moving = false;
    if (d > gap && this.state !== 'pick') {
      const step = Math.min(d - gap, Math.max(70, (d - gap) * 5) * dt);
      t.x += dx / d * step; t.y += dy / d * step;
      t.walkT += step; t.moving = step > 0.2;
      const ax = Math.abs(dx), ay = Math.abs(dy), k = t.view === 'side' ? 1.6 : 0.8;
      if (ay > ax * k) t.view = dy < 0 ? 'back' : 'front';
      else { t.view = 'side'; t.face = Math.sign(dx) || 1; }
    }
    t.x = clamp(t.x, F.x0 - 30, F.x1 + 30); t.y = clamp(t.y, F.y0 - 20, F.y1 + 30);
  }

  updateCamera(dt) {
    const P = this.P, room = this.room;
    const tx = clamp(P.x - W / 2, 0, room.w - W), ty = clamp(P.cy - H / 2 - 10, 0, room.h - H);
    const k = dt >= 1 ? 1 : Math.min(1, dt * 8);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
  }

  // keep monsters settling (knockback decay) while the fight is paused by a transition
  idle(dt) {
    for (const m of this.mons) {
      if (!m.visible) continue;
      const B = this.bounds(m);
      m.vx *= Math.exp(-dt * 10); m.vy *= Math.exp(-dt * 10);
      m.kx *= Math.exp(-dt * 7); m.ky *= Math.exp(-dt * 7);
      m.x = clamp(m.x + (m.vx + m.kx) * dt, B.x0, B.x1);
      m.y = clamp(m.y + (m.vy + m.ky) * dt, B.y0, B.y1);
      m.flash = Math.max(0, m.flash - dt);
    }
  }

  // Where a monster's feet may go: the room floor, plus open doorways for the player.
  bounds(m) {
    const F = this.F;
    const B = { x0: F.x0 + m.r, x1: F.x1 - m.r, y0: F.y0 + m.r, y1: F.y1 - 2 };
    if (m.side !== 'player' || this.state !== 'explore') return B;
    const span = DOOR_W / 2 - m.r * 0.5 - 2;
    for (const dir of Object.keys(this.room.doors)) {
      const d = doorPos(this.room, dir);
      if (dir === 'n' && Math.abs(m.x - d.x) < span) { B.y0 = F.y0 - 40; if (m.y < F.y0 + m.r) { B.x0 = d.x - span; B.x1 = d.x + span; } }
      if (dir === 's' && Math.abs(m.x - d.x) < span) { B.y1 = F.y1 + 40; if (m.y > F.y1 - 2) { B.x0 = d.x - span; B.x1 = d.x + span; } }
      const yspan = DOOR_W / 2 - 4, my = m.y - 8;   // side doors: the feet sit a bit below the doorway's middle
      if (dir === 'w' && Math.abs(my - d.y) < yspan) { B.x0 = F.x0 - 40; if (m.x < F.x0 + m.r) { B.y0 = d.y - yspan + 8; B.y1 = d.y + yspan + 8; } }
      if (dir === 'e' && Math.abs(my - d.y) < yspan) { B.x1 = F.x1 + 40; if (m.x > F.x1 - m.r) { B.y0 = d.y - yspan + 8; B.y1 = d.y + yspan + 8; } }
    }
    return B;
  }

  updateMon(m, dt, ctrl) {
    if (!m.visible || m.fainted) return;
    m.flash = Math.max(0, m.flash - dt);
    m.invuln -= dt; m.gcd -= dt; m.stunT -= dt; m.slowT -= dt;
    for (let i = 0; i < 4; i++) m.cd[i] = Math.max(0, m.cd[i] - dt);
    m.buffs.forEach(b => (b.t -= dt));
    m.buffs = m.buffs.filter(b => b.t > 0);
    if (m.item.regen && m.hp > 0 && this.state === 'fight') m.hp = Math.min(m.maxHp, m.hp + m.maxHp * m.item.regen * dt);

    // status effects tick only during fights
    if (m.status && this.state === 'fight') {
      m.statusT -= dt; m.statusTick -= dt;
      if (m.status === 'par' && m.statusTick <= 0) {
        m.statusTick = 1.1;
        if (Math.random() < 0.22 && !m.action) {
          m.stunT = Math.max(m.stunT, 0.7);
          this.text(m.x, m.y - m.h - 2, 'IS PARALYZED!', '#ffe066', m.y);
          this.sparks(m.x, m.cy, 6, '#fff27a');
          Sfx.play('zap');
        }
      }
      if (m.status === 'brn' && m.statusTick <= 0) {
        m.statusTick = 1;
        const d = Math.round(m.maxHp * 0.03);
        m.hp = Math.max(0, m.hp - d);
        this.number(m, d, null, '#ffb080', '#c84a1a');
        this.burst(m.x, m.cy, TYPES.fire.fx, 6, 30, -40);
        if (m.hp <= 0) { this.faint(m); return; }
      }
      if (m.status === 'psn' && m.statusTick <= 0) {
        m.statusTick = 1;
        const d = Math.round(m.maxHp * 0.025);
        m.hp = Math.max(0, m.hp - d);
        this.number(m, d, null, '#e8b8ff', '#8a3ab0');
        this.burst(m.x, m.cy, TYPES.poison.fx, 6, 30, -30);
        if (m.hp <= 0) { this.faint(m); return; }
      }
      if (m.statusT <= 0) {
        if (m.status === 'frz') this.text(m.x, m.y - m.h - 2, 'THAWED OUT!', '#bff0ff', m.y);
        m.status = null;
      }
    } else if (m.status === 'frz') m.status = null;   // never stay frozen between fights

    if (m.action) this.updateAction(m, dt);
    if (m.fainted || (this.state !== 'fight' && this.state !== 'explore')) return;

    const lock = (m.action && m.action.lock) || m.stunT > 0 || m.status === 'frz';
    const a = m.action;
    if (a && a.kind === 'dash' && a.t > 0.1 && a.phase !== 'combo') {
      m.vx = Math.cos(a.dir) * a.mv.speed; m.vy = Math.sin(a.dir) * a.mv.speed;
    } else {
      const spd = m.speed();
      const tx = lock ? 0 : ctrl.x * spd, ty = lock ? 0 : ctrl.y * spd;
      const k = Math.min(1, dt * 14);
      m.vx += (tx - m.vx) * k; m.vy += (ty - m.vy) * k;
    }
    m.kx *= Math.exp(-dt * 7); m.ky *= Math.exp(-dt * 7);
    const B = this.bounds(m);
    m.x = clamp(m.x + (m.vx + m.kx) * dt, B.x0, B.x1);
    m.y = clamp(m.y + (m.vy + m.ky) * dt, B.y0, B.y1);
    const sp = Math.hypot(m.vx, m.vy);
    m.walkT += sp * dt;
    if (a && a.dir !== undefined && a.kind !== 'cast') m.look(Math.cos(a.dir), Math.sin(a.dir));
    else if (!lock) {
      const foe = this.foe(m);
      if (sp > 12) m.look(m.vx, m.vy);
      else if (foe && this.state === 'fight' && dist(foe, m) > 6) m.look(foe.x - m.x, foe.y - m.y);
    }
  }

  updateAction(m, dt) {
    const a = m.action;
    a.t += dt;
    const fx = a.mv ? TYPES[a.mv.type].fx : null;
    switch (a.kind) {
      case 'cast':
        if (a.t >= a.dur) m.action = null;
        break;

      case 'beam': {
        const mv = a.mv;
        if (a.phase === 'charge') {
          const foe = this.foe(m);
          if (foe && a.t < mv.charge * 0.7) a.dir = this.aim(m, foe, mv);
          if (Math.random() < 0.8) {
            const ang = rand(0, TAU), rr = rand(14, 26);
            const ox = m.x + Math.cos(a.dir) * 8, oy = m.cy + Math.sin(a.dir) * 8;
            this.particles.push({ x: ox + Math.cos(ang) * rr, y: oy + Math.sin(ang) * rr, vx: -Math.cos(ang) * rr * 3, vy: -Math.sin(ang) * rr * 3, life: 0.3, max: 0.3, size: 2, color: fx[Math.random() < 0.5 ? 1 : 2], kind: 'sq' });
          }
          if (a.t >= mv.charge) { a.phase = 'fire'; a.t = 0; Sfx.beamFire(mv.dur, mv.type); this.addShake(5); }
        } else {
          a.tick -= dt;
          if (a.tick <= 0) {
            a.tick = 0.1;
            // a beam hits everything in its line
            for (const foe of this.foes(m)) {
              if (this.beamHits(m, a, foe)) this.hit(m, foe, mv, 0.1 / mv.dur * 1.15, { merge: a.id, kb: a.dir });
              if (m.fainted || !m.action || this.state === 'faint') return;
            }
          }
          this.addShake(1.2);
          const L = mv.len * Math.random();
          const bx = m.x + Math.cos(a.dir) * L, by = m.cy + Math.sin(a.dir) * L;
          this.particles.push({ x: bx, y: by, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.35, max: 0.35, size: rand(1, 3), color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
          if (a.t >= mv.dur) {
            m.action = null;
            if (mv.recharge) { m.stunT = mv.recharge; this.text(m.x, m.y - m.h - 2, 'MUST RECHARGE', '#d8d8e8', m.y); }
          }
        }
        break;
      }

      case 'dash': {
        const mv = a.mv;
        // combo: after connecting, stay on the target and land the rest of the hits
        if (a.phase === 'combo') {
          const foe = a.tgt;
          const d = Math.hypot(foe.x - m.x, foe.y - m.y) || 1;
          if (d > m.r + foe.r) { m.x += (foe.x - m.x) / d * 90 * dt; m.y += (foe.y - m.y) / d * 90 * dt; }
          a.tick -= dt;
          if (a.tick <= 0) {
            if (a.left <= 0 || d > m.r + foe.r + 16 || !foe.alive) { m.action = null; break; }
            a.left--;
            const last = a.left === 0;
            // light jabs keep the target close; the last hit knocks it away
            this.hit(m, foe, mv, 1, { kb: Math.atan2(foe.y - m.y, foe.x - m.x), merge: a.id, force: last ? undefined : 35 });
            if (m.fainted || !m.action || this.state === 'faint') return;
            a.tick = 0.13;
            if (last) { m.action = null; this.decalAt(foe.x, foe.y, 8); }
          }
          break;
        }
        if (a.t <= 0.1) {
          if (a.t < 0.03) { const f = this.foe(m); if (f) { a.tgt = f; a.dir = this.aim(m, f, mv); } }
          break;
        }
        if (this.relic(m, 'emberTracks') && (a.trailT = (a.trailT || 0) - dt) <= 0) {
          a.trailT = 0.07;   // a pool of fire left along the dash
          this.zones.push({ x: m.x, y: m.y, r: 13, t: 0, delay: 0, mv: EMBER_MV, owner: m, done: true, tick: 0.15, id: _uid++ });
        }
        m.ghostT -= dt;
        if (m.ghostT <= 0) { m.ghostT = 0.03; m.ghosts.push({ x: m.x, y: m.y, face: m.face, view: m.view, t: 0.22, color: fx[1] }); }
        if (Math.random() < 0.7) this.particles.push({ x: m.x + rand(-6, 6), y: m.cy + rand(-6, 6), vx: -m.vx * 0.2, vy: -m.vy * 0.2, life: 0.3, max: 0.3, size: 2, color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
        const foe = !a.hit && this.foes(m).find(f => Math.hypot(m.x - f.x, m.cy - f.cy) < m.r + f.r + 4);
        if (foe) {
          a.hit = true; a.tgt = foe;
          if (mv.hits > 1) {   // a combo: stop here and start hitting
            a.phase = 'combo'; a.left = mv.hits; a.tick = 0;
            m.vx = m.vy = 0;
            break;
          }
          const dealt = this.hit(m, foe, mv, 1, { kb: a.dir });
          if (this.state === 'faint') return;
          if (mv.recoil && dealt && !m.fainted) {
            const rc = Math.round(dealt * mv.recoil);
            m.hp = Math.max(0, m.hp - rc);
            this.number(m, rc, null, '#ffd0d0', '#c05050');
            if (m.hp <= 0) { this.faint(m); return; }
          }
          if (mv.selfDebuff) for (const [stat, mul] of Object.entries(mv.selfDebuff)) m.buffs.push({ stat, mul, t: 5 });
          m.action = null;
          m.vx *= -0.25; m.vy *= -0.25;
          this.decalAt(foe.x, foe.y, 8);
          break;
        }
        if (a.t >= 0.1 + mv.dur) { m.action = null; m.vx *= 0.3; m.vy *= 0.3; }
        break;
      }

      case 'burst': {
        const mv = a.mv;
        if (!a.done && a.t >= mv.delay) {
          a.done = true;
          this.particles.push({ x: m.x, y: m.y - 2, r0: 6, r1: a.r, life: 0.35, max: 0.35, color: fx[2], kind: 'ring', w: 3 });
          this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: a.r * 0.8, life: 0.45, max: 0.45, color: fx[1], kind: 'ring', w: 2 });
          this.burst(m.x, m.y - 4, fx, 30, a.r * 2.6, 0, 4);
          this.decalAt(m.x, m.y, a.r * 0.6);
          this.addShake(6);
          Sfx.play('boom');
          for (const foe of this.foes(m)) {
            if (Math.hypot(foe.x - m.x, foe.y - m.y) < a.r + foe.r * 0.6) this.hit(m, foe, mv, 1);
            if (m.fainted || this.state === 'faint') return;
          }
        }
        if (a.t >= mv.delay + 0.15) m.action = null;
        break;
      }

      // vortex: the user stands still and drags opponents in, grinding them while they're caught
      case 'vortex': {
        const mv = a.mv;
        if (Math.random() < 0.9) {   // debris spiralling inward
          const ang = rand(0, TAU), rr = rand(0.5, 1) * mv.r;
          const px = m.x + Math.cos(ang) * rr, py = m.y + Math.sin(ang) * rr * 0.7;
          this.particles.push({ x: px, y: py - 3, g: py, vx: (m.x - px) * 1.6 - Math.sin(ang) * 70, vy: (m.y - py) * 1.6 + Math.cos(ang) * 50,
            life: 0.45, max: 0.45, size: rand(1, 2.5), color: fx[rand() < 0.5 ? 1 : 2], kind: 'sq' });
        }
        a.tick -= dt;
        const tick = a.tick <= 0;
        if (tick) a.tick = 0.25;
        for (const foe of this.foes(m)) {
          const dx = m.x - foe.x, dy = m.y - foe.y, d = Math.hypot(dx, dy) || 1;
          if (d >= mv.r + foe.r) continue;
          if (d > m.r + foe.r) {
            const B = this.bounds(foe), pull = mv.pull * (foe.boss ? 0.4 : 1);
            foe.x = clamp(foe.x + dx / d * pull * dt, B.x0, B.x1);
            foe.y = clamp(foe.y + dy / d * pull * dt, B.y0, B.y1);
          }
          if (tick) {
            this.hit(m, foe, mv, 0.25 / mv.dur, { merge: a.id, kb: Math.atan2(dy, dx), force: 0 });
            if (m.fainted || !m.action || this.state === 'faint') return;
          }
        }
        if (a.t >= mv.dur) m.action = null;
        break;
      }
    }
  }

  beamHits(m, a, foe) {
    const ox = m.x, oy = m.cy;
    const dx = Math.cos(a.dir), dy = Math.sin(a.dir);
    const px = foe.x - ox, py = foe.cy - oy;
    const t = clamp(px * dx + py * dy, 0, a.mv.len);
    const cx = ox + dx * t, cy = oy + dy * t;
    return Math.hypot(foe.x - cx, foe.cy - cy) <= a.mv.width / 2 + foe.r * 0.85;
  }

  separate(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
    const min = (a.r + b.r) * 0.85;
    if (d < min) {
      // a boss doesn't get shoved around
      const wa = a.boss ? 0.1 : b.boss ? 0.9 : 0.5, push = min - d;
      a.x -= dx / d * push * wa; a.y -= dy / d * push * wa;
      b.x += dx / d * push * (1 - wa); b.y += dy / d * push * (1 - wa);
    }
  }

  updateProjectiles(dt) {
    const F = this.F;
    for (const p of this.projectiles) {
      p.life -= dt; p.spin += dt * 12;
      if (p.mv.homing) {
        const foe = this.foe(p.owner);
        if (foe && foe.visible) {
          const cur = Math.atan2(p.vy, p.vx), want = Math.atan2(foe.cy - p.y, foe.x - p.x);
          let diff = ((want - cur + Math.PI * 3) % TAU) - Math.PI;
          const turn = clamp(diff, -p.mv.homing * dt, p.mv.homing * dt);
          const sp = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(cur + turn) * sp; p.vy = Math.sin(cur + turn) * sp;
        }
      }
      if (p.mv.boomerang) {
        p.hitCd -= dt;
        if (!p.back && (p.out -= dt) <= 0) p.back = true;
        if (p.back) {   // home in on the thrower; caught when it gets back
          const o = p.owner, sp = Math.hypot(p.vx, p.vy), a = Math.atan2(o.cy - p.y, o.x - p.x);
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
          if (!o.visible || o.fainted || Math.hypot(o.x - p.x, o.cy - p.y) < o.r + p.r) { p.life = -1; p.dead = true; }
        }
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      const fx = TYPES[p.mv.type].fx;
      if (Math.random() < 0.9) this.particles.push({ x: p.x + rand(-1, 1) * p.r * 0.5, y: p.y + rand(-1, 1) * p.r * 0.5, vx: -p.vx * 0.1, vy: -p.vy * 0.1, life: 0.25, max: 0.25, size: Math.max(1, p.r * 0.6), color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
      const foe = p.life > 0 && !(p.hitCd > 0) && this.foes(p.owner).find(f => Math.hypot(p.x - f.x, p.y - f.cy) < p.r + f.r);
      if (foe) {
        // a boomerang cuts through and can hit again on the way back
        if (p.mv.boomerang) p.hitCd = 0.35; else p.life = -1;
        if (p.mv.explode) {
          this.particles.push({ x: p.x, y: p.y, g: p.y + p.k, r0: 4, r1: p.mv.explode, life: 0.3, max: 0.3, color: fx[2], kind: 'ring', w: 3 });
          this.burst(p.x, p.y, fx, 26, 140);
          this.decalAt(foe.x, foe.y, p.mv.explode * 0.6);
          Sfx.play('boom');
        }
        this.hit(p.owner, foe, p.mv, 1, { kb: Math.atan2(p.vy, p.vx) });
        if (this.state === 'faint') return;
      }
      // the walls stop shots (the top wall a bit higher up, since shots fly at body height)
      if (p.x < F.x0 - 6 || p.x > F.x1 + 6 || p.y < F.y0 - 34 || p.y > F.y1 + 4) p.life = -1;
      if (p.life <= 0 && !p.dead) { p.dead = true; this.burst(p.x, p.y, fx, 4, 40); }
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  updateZones(dt) {
    for (const z of this.zones) {
      z.t += dt;
      if (!z.done && z.t >= z.delay) {
        z.done = true; z.tick = 0.5;   // a pool's first tick comes after the landing hit
        const fx = TYPES[z.mv.type].fx;
        if (z.mv.fx === 'bolt') { this.particles.push({ x: z.x, y: z.y, life: 0.25, max: 0.25, kind: 'bolt', color: fx[1], seed: Math.random() }); Sfx.play('zap'); }
        else Sfx.play('boom');
        this.particles.push({ x: z.x, y: z.y, r0: 3, r1: z.r * 1.2, life: 0.3, max: 0.3, color: fx[2], kind: 'ring', w: 3 });
        this.burst(z.x, z.y - 4, fx, 22, z.r * 4, 0, 4);
        this.decalAt(z.x, z.y, z.r * 0.7);
        this.addShake(4);
        for (const foe of this.foes(z.owner)) {
          if (Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) this.hit(z.owner, foe, z.mv, 1, { kb: Math.atan2(foe.y - z.y, foe.x - z.x) });
          if (this.state === 'faint') return;
        }
      } else if (z.done && z.mv.linger) {
        // a lingering pool keeps hurting whoever stands in it
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick = 0.5;
          for (const foe of this.foes(z.owner)) {
            if (Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) this.hit(z.owner, foe, z.mv, z.mv.tick, { merge: z.id, force: 0 });
            if (this.state === 'faint') return;
          }
        }
      }
    }
    this.zones = this.zones.filter(z => z.t < z.delay + (z.mv.linger || 0) + 0.05);
  }

  updateBalls(dt) {
    for (const b of this.balls) {
      b.t += dt;
      if (b.t >= b.dur && !b.done) {
        b.done = true;
        const m = this.P;
        m.visible = true; m.flash = 0.35; m.invuln = 0.4;
        this.particles.push({ x: b.to.x, y: b.to.y, r0: 2, r1: 26, life: 0.35, max: 0.35, color: '#ffffff', kind: 'ring', w: 3 });
        this.burst(b.to.x, b.to.y, ['#ffffff', '#ffe9a0', '#ffffff'], 20, 90);
        Sfx.play('pop');
      }
    }
    this.balls = this.balls.filter(b => !b.done);
  }

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
  number(m, val, key, fill, shade, prefix = '') {
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
    this.floats.push({ key, val, x: m.x + ox, y: m.y - m.h - 2, t: 0, fill, shade, prefix, img: numberCanvas(prefix + val, fill, shade) });
    return true;
  }

  text(x, y, str, color) { this.texts.push({ x, y, str, color, t: 0 }); }

  newFlake(anywhere) {
    const kind = this.stage.weather;
    const y = anywhere ? rand(0, H) : -4;
    if (kind === 'ash') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-6, 6), vy: rand(-26, -10), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#ff8a3a' : '#5a4a48' };
    if (kind === 'petals') return { x: anywhere ? rand(0, W) : rand(-40, W), y, vx: rand(10, 24), vy: rand(10, 22), s: 2, c: rand() < 0.5 ? '#ffd0e0' : '#ffffff' };
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
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const shx = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    const shy = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    ctx.fillStyle = this.stage.bg; ctx.fillRect(0, 0, W, H);
    ctx.translate(-Math.round(this.cam.x) + shx, -Math.round(this.cam.y) + shy);
    ctx.drawImage(this.ground, 0, 0);
    ctx.drawImage(this.decal, 0, 0);
    this.drawDoors(ctx);
    if (this.stairs) this.drawStairs(ctx);
    this.drawPickups(ctx);
    this.drawTelegraphs(ctx);

    // trainer, monsters and pedestals, depth sorted by where they stand
    const actors = [{ y: this.trainer.y, draw: () => this.drawTrainer(ctx) }];
    for (const m of this.mons) if (m.visible) actors.push({ y: m.y, draw: () => this.drawMon(ctx, m) });
    for (const ped of this.pedestals) actors.push({ y: ped.y, draw: () => this.drawPedestal(ctx, ped) });
    actors.sort((a, b) => a.y - b.y).forEach(a => a.draw());

    for (const m of this.mons) if (m.action && m.action.kind === 'beam' && m.visible) this.drawBeam(ctx, m, m.action);
    for (const p of this.projectiles) this.drawProjectile(ctx, p);
    this.drawZoneFalls(ctx);
    this.drawParticles(ctx);
    for (const b of this.balls) {
      const k = Math.min(1, b.t / b.dur);
      const x = b.from.x + (b.to.x - b.from.x) * k;
      const y = b.from.y + (b.to.y - b.from.y) * k - Math.sin(Math.PI * k) * 46;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(k * 10);
      ctx.drawImage(BALL_IMG, -4.5, -3.75, 9, 7.5); ctx.restore();
    }
    this.drawBars(ctx);
    this.drawFloats(ctx);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    this.drawWeather(ctx);
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
      const img = k.kind === 'coin' ? COIN_IMG : BERRY_IMG;
      const X = Math.round(k.x), Y = Math.round(k.y);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(X, Y, 4, 1.6, 0, 0, TAU); ctx.fill();
      const bob = k.z > 0 ? k.z : Math.sin(this.time * 4 + k.x) > 0.5 ? 1 : 0;
      // coins spin by squashing sideways
      const sq = k.kind === 'coin' ? Math.max(0.3, Math.abs(Math.cos(this.time * 5 + k.x * 0.3))) : 1;
      const w = img.width * 1.5 * sq, h = img.height * 1.5;
      ctx.drawImage(img, Math.round(X - w / 2), Math.round(Y - h - bob), Math.max(1, Math.round(w)), h);
    }
  }

  drawPedestal(ctx, ped) {
    const X = Math.round(ped.x), Y = Math.round(ped.y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(X, Y + 4, 22, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = OUTLINE; ctx.fillRect(X - 19, Y - 7, 38, 13);
    ctx.fillStyle = ped.kind === 'relic' ? '#e0c060' : '#b8b0c8'; ctx.fillRect(X - 18, Y - 6, 36, 5);
    ctx.fillStyle = ped.kind === 'relic' ? '#a8862a' : '#7a7090'; ctx.fillRect(X - 18, Y - 1, 36, 6);
    let name;
    if (ped.kind === 'mon') {
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

  // Each wild monster carries a small HP bar (the boss gets the big one in the HUD).
  drawBars(ctx) {
    const STATUS_COL = { par: '#d6b21e', brn: '#e0582a', frz: '#4fb6d8', psn: '#9a3ab8' };
    for (const m of this.e) {
      if (!m.alive || m.boss) continue;
      const w = 26, x = Math.round(m.x - w / 2), y = Math.round(m.y - m.h - 6);
      const pct = m.hp / m.maxHp;
      ctx.fillStyle = OUTLINE; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = '#2a2638'; ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = pct > 0.5 ? '#3ccf4e' : pct > 0.2 ? '#f2c12e' : '#e8433a';
      ctx.fillRect(x, y, Math.max(1, Math.round(w * pct)), 3);
      if (m.status) { ctx.fillStyle = STATUS_COL[m.status]; ctx.fillRect(x + w + 2, y - 1, 4, 5); }
    }
  }

  drawTrainer(ctx) {
    const t = this.trainer, img = this.trainerImg[t.view];
    const px = Math.round(t.x), py = Math.round(t.y);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(px, py, 9, 3.5, 0, 0, TAU); ctx.fill();
    const bob = t.moving ? -Math.round(Math.abs(Math.sin(t.walkT / 6 * Math.PI))) : (Math.sin(this.time * 2) > 0.7 ? -1 : 0);
    const w = img.width * SPR_SCALE, h = img.height * SPR_SCALE;
    ctx.save(); ctx.translate(px, 0); if (t.view === 'side' && t.face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, Math.round(-w / 2), Math.round(py - h + 1 + bob), w, h);
    ctx.restore();
  }

  drawMon(ctx, m) {
    const sp = SPRITES[m.id], S = sp.size * SPR_SCALE * m.scale;
    let alpha = 1, sink = 0;
    if (m.fainted) { alpha = Math.max(0, 1 - m.fadeT / 1.1); sink = m.fadeT * 6; }
    if (alpha <= 0) return;
    const moving = Math.hypot(m.vx, m.vy) > 12;
    let bob = moving ? -Math.round(Math.abs(Math.sin(m.walkT / 7 * Math.PI)) * 2) : (Math.sin(this.time * 3 + m.x) > 0.6 ? -1 : 0);
    if (m.status === 'frz' || m.stunT > 0 || m.fainted) bob = 0;
    const X = Math.round(m.x), Y = Math.round(m.y);
    const mine = m.side === 'player';

    // ground marker + shadow
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 2, m.r * 0.42, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = mine ? 'rgba(90,160,255,0.75)' : m.boss ? 'rgba(255,200,60,0.8)' : 'rgba(255,90,80,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 4, m.r * 0.5 + 1, 0, 0, TAU); ctx.stroke();

    // dash afterimages
    for (const g of m.ghosts) {
      ctx.globalAlpha = (g.t / 0.22) * 0.5 * alpha;
      ctx.save(); ctx.translate(Math.round(g.x), Math.round(g.y)); if (g.face < 0) ctx.scale(-1, 1);
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
    ctx.translate(X, Math.round(Y + bob + sink));
    if (m.face < 0) ctx.scale(-1, 1);
    const dx = -S / 2, dy = -S + 3;
    ctx.drawImage(sp.views[m.view], dx, dy, S, S);
    let tint = null, ta = 0;
    if (m.flash > 0) { tint = '#ffffff'; ta = Math.min(1, m.flash * 8); }
    else if (m.fainted) { tint = '#ffffff'; ta = Math.min(0.8, m.fadeT); }
    else if (m.status === 'frz') { tint = '#9fe6ff'; ta = 0.55; }
    else if (m.status === 'par' && Math.sin(this.time * 18) > 0.6) { tint = '#ffe24a'; ta = 0.45; }
    else if (m.status === 'brn' && Math.sin(this.time * 10) > 0.5) { tint = '#ff5a2a'; ta = 0.35; }
    else if (m.status === 'psn' && Math.sin(this.time * 7) > 0.4) { tint = '#b04ae0'; ta = 0.4; }
    else if (m.stunT > 0 && Math.sin(this.time * 20) > 0) { tint = '#ffffff'; ta = 0.25; }
    if (tint) { ctx.globalAlpha = ta * alpha; ctx.drawImage(tinted(m.id, tint, m.view), dx, dy, S, S); }
    ctx.restore();
    ctx.globalAlpha = 1;

    if (m.status === 'frz' && !m.fainted) {
      ctx.strokeStyle = 'rgba(220,250,255,0.9)'; ctx.fillStyle = 'rgba(160,230,255,0.25)';
      ctx.fillRect(Math.round(X - S / 2), Math.round(Y - S + 3), S, S - 3);
      ctx.strokeRect(Math.round(X - S / 2) + 0.5, Math.round(Y - S + 3) + 0.5, S - 1, S - 4);
    }
  }

  drawTelegraphs(ctx) {
    const pulse = 0.55 + Math.sin(this.time * 14) * 0.2;
    ctx.lineWidth = 1.5;
    // a wild monster about to appear: a shadow growing on the ground
    for (const m of this.e) {
      if (m.spawnT <= 0) continue;
      const k = clamp(1 - m.spawnT / 0.7, 0, 1);
      ctx.globalAlpha = 0.2 + k * 0.3; ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, (m.r + 2) * k, (m.r * 0.45) * k, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = pulse; ctx.strokeStyle = m.boss ? '#ffd23f' : '#ff6a5a';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.ellipse(m.x, m.y, m.r + 6, m.r * 0.5 + 3, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const z of this.zones) {
      if (z.done) {
        if (!z.mv.linger) continue;
        // lingering pool: fades in and out, with bubbles popping across it
        const age = z.t - z.delay, left = z.mv.linger - age;
        const fade = clamp(Math.min(age / 0.15, left / 0.4), 0, 1);
        const zx = z.x, zy = z.y, fx = TYPES[z.mv.type].fx;
        ctx.globalAlpha = 0.38 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); ctx.fill();
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
      ctx.fillStyle = TYPES[z.mv.type].fx[0];
      ctx.globalAlpha = 0.18 + k * 0.2;
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r * k, z.r * k * 0.7, 0, 0, TAU); ctx.fill();
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
      if (a.kind === 'burst' && !a.done) {
        const k = clamp(a.t / a.mv.delay, 0, 1);
        ctx.fillStyle = TYPES[a.mv.type].fx[0];
        ctx.globalAlpha = 0.15 + k * 0.2;
        ctx.beginPath(); ctx.ellipse(X, Y, a.r * k, a.r * k * 0.7, 0, 0, TAU); ctx.fill();
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
        const fx = TYPES[a.mv.type].fx, fade = clamp(Math.min(a.t / 0.12, (a.mv.dur - a.t) / 0.2), 0, 1);
        ctx.globalAlpha = 0.16 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r, a.mv.r * 0.7, 0, 0, TAU); ctx.fill();
        ctx.lineWidth = 1.5;
        for (const [sc, spd, col] of [[1, 1, fx[2]], [0.66, -1.6, fx[1]], [0.33, 2.4, fx[2]]]) {
          ctx.globalAlpha = 0.75 * fade; ctx.strokeStyle = col;
          ctx.setLineDash([7, 5]); ctx.lineDashOffset = this.time * 40 * spd;
          ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r * sc, a.mv.r * sc * 0.7, 0, 0, TAU); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      if (a.kind === 'dash' && a.t <= 0.1) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = TYPES[a.mv.type].fx[2];
        ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.lineTo(X + Math.cos(dir) * 40, Y + Math.sin(dir) * 40); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawZoneFalls(ctx) {
    for (const z of this.zones) {
      if (z.done) continue;
      const left = z.delay - z.t;
      const fx = TYPES[z.mv.type].fx;
      const zx = z.x, zy = z.y;
      if (z.mv.fx === 'meteor' && left < 0.45) {
        const k = 1 - left / 0.45;
        const x = zx - 70 * (1 - k), y = zy - 170 * (1 - k);
        ctx.globalAlpha = 0.5; ctx.strokeStyle = fx[1]; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 20, y - 48); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = fx[0]; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = fx[2]; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
      } else if (z.mv.fx === 'rock' && left < 0.35) {
        const k = 1 - left / 0.35;
        const y = zy - 150 * (1 - k * k);
        ctx.fillStyle = '#8f8170'; ctx.fillRect(Math.round(zx - 6), Math.round(y - 10), 12, 10);
        ctx.fillStyle = '#b8aa96'; ctx.fillRect(Math.round(zx - 5), Math.round(y - 9), 6, 3);
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.strokeRect(Math.round(zx - 6) + 0.5, Math.round(y - 10) + 0.5, 11, 9);
      }
    }
  }

  drawBeam(ctx, m, a) {
    const mv = a.mv, fx = TYPES[mv.type].fx;
    // the muzzle sits at body height, 6 units out along the aim
    const ox = m.x + Math.cos(a.dir) * 6, oy = m.cy + Math.sin(a.dir) * 6;
    if (a.phase === 'charge') {
      const k = a.t / mv.charge;
      ctx.globalAlpha = 0.5; ctx.fillStyle = fx[0];
      ctx.beginPath(); ctx.arc(ox, oy, 3 + k * mv.width * 0.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = fx[2];
      ctx.beginPath(); ctx.arc(ox, oy, 1 + k * mv.width * 0.25, 0, TAU); ctx.fill();
      return;
    }
    const grow = Math.min(1, a.t / 0.08);
    const fade = Math.min(1, (mv.dur - a.t) / 0.15);
    const len = mv.len * grow, w = mv.width * Math.max(0.2, fade);
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(a.dir);
    const layers = [[fx[0], 0.35, 1.7], [fx[0], 0.9, 1.15], [fx[1], 1, 0.8], [fx[2], 1, 0.38]];
    for (const [col, al, sc] of layers) {
      ctx.globalAlpha = al; ctx.fillStyle = col;
      ctx.beginPath();
      const steps = Math.max(2, Math.ceil(len / 5));
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * len;
        const hw = (w / 2) * sc * (1 + 0.16 * Math.sin(x * 0.18 - this.time * 40)) * Math.min(1, 0.4 + x / 20);
        i === 0 ? ctx.moveTo(x, -hw) : ctx.lineTo(x, -hw);
      }
      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * len;
        const hw = (w / 2) * sc * (1 + 0.16 * Math.sin(x * 0.18 - this.time * 40 + 1.5)) * Math.min(1, 0.4 + x / 20);
        ctx.lineTo(x, hw);
      }
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(len, 0, (w / 2) * sc, 0, TAU); ctx.fill();
    }
    // spiral rings travelling down the beam
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = fx[2]; ctx.lineWidth = 1.3;
    for (let x = (this.time * 260) % 24; x < len; x += 24) {
      ctx.beginPath(); ctx.ellipse(x, 0, 2.5, w * 0.95, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = fx[2];
    ctx.beginPath(); ctx.arc(0, 0, w * 0.7, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawProjectile(ctx, p) {
    const fx = TYPES[p.mv.type].fx, t = p.mv.type;
    const px = p.x, py = p.y;
    if (p.mv.boomerang) {   // a spinning crescent blade
      ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin * 1.7);
      ctx.fillStyle = fx[1];
      ctx.beginPath(); ctx.arc(0, 0, p.r * 1.7, 0, Math.PI * 1.25); ctx.arc(p.r * 0.6, -p.r * 0.2, p.r * 1.1, Math.PI * 1.25, 0, true);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = fx[2]; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      return;
    }
    if (t === 'grass') {
      ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
      ctx.fillStyle = fx[1]; ctx.beginPath(); ctx.moveTo(-p.r * 1.4, 0); ctx.lineTo(0, -p.r * 0.7); ctx.lineTo(p.r * 1.4, 0); ctx.lineTo(0, p.r * 0.7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
      return;
    }
    if (t === 'rock' || t === 'ground') {
      ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.rotate(p.spin * 0.3);
      ctx.fillStyle = fx[1]; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.fillStyle = fx[2]; ctx.fillRect(-p.r, -p.r, p.r, p.r * 0.7);
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.strokeRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
      return;
    }
    if (t === 'ice' || t === 'bug' || t === 'flying') {
      const a = Math.atan2(p.vy, p.vx);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.fillStyle = fx[1]; ctx.beginPath(); ctx.moveTo(p.r * 3, 0); ctx.lineTo(-p.r * 2, -p.r); ctx.lineTo(-p.r * 2, p.r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = fx[2]; ctx.fillRect(-p.r, -0.5, p.r * 3, 1);
      ctx.restore();
      return;
    }
    ctx.globalAlpha = 0.35; ctx.fillStyle = fx[0];
    ctx.beginPath(); ctx.arc(px, py, p.r * 2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = fx[1];
    ctx.beginPath(); ctx.arc(px, py, p.r * 1.2, 0, TAU); ctx.fill();
    ctx.fillStyle = fx[2];
    ctx.beginPath(); ctx.arc(px, py, p.r * 0.6, 0, TAU); ctx.fill();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const k = clamp(p.life / p.max, 0, 1);
      const X = p.x, Y = p.y;
      ctx.globalAlpha = k;
      switch (p.kind) {
        case 'sq': {
          const s = Math.max(1, Math.round(p.size * (0.5 + k * 0.5)));
          ctx.fillStyle = p.color; ctx.fillRect(Math.round(X - s / 2), Math.round(Y - s / 2), s, s);
          break;
        }
        case 'spark':
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - p.vx * 0.06, Y - p.vy * 0.06); ctx.stroke();
          break;
        case 'ring': {
          const r = p.r1 + (p.r0 - p.r1) * k;
          ctx.strokeStyle = p.color; ctx.lineWidth = p.w * k + 0.5;
          ctx.beginPath(); ctx.ellipse(X, Y, r, r * 0.7, 0, 0, TAU); ctx.stroke();
          break;
        }
        case 'line':
          ctx.strokeStyle = p.color; ctx.lineWidth = 3 * k + 0.5;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(p.x2, p.y2); ctx.stroke();
          break;
        case 'bolt': {
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
          const r2 = mulberry((p.seed * 1e6) | 0);
          ctx.beginPath(); let x = X + (r2() - 0.5) * 30, y = Y - 220; ctx.moveTo(x, y);
          while (y < Y) { y += 14; x += (r2() - 0.5) * 18; if (y >= Y) { x = X; y = Y; } ctx.lineTo(x, y); }
          ctx.stroke(); ctx.strokeStyle = p.color; ctx.lineWidth = 1.2; ctx.stroke();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawFloats(ctx) {
    for (const f of this.floats) {
      const pop = f.t < 0.1 ? 3 - f.t * 10 : 2;
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
    const seen = r => r.visited || Object.values(r.doors).some(o => o.visited);
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
  }
}
