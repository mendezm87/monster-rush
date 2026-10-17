// Real-time battle simulation + rendering.

const TAU = Math.PI * 2;
const SPR_SCALE = 1.5;   // world units per sprite pixel (3 canvas px at 2x)
const MIRROR_Y = FIELD.y0 + FIELD.y1;  // a flipped view mirrors y about the field's centre line
const DMG_SCALE = 0.8;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let _uid = 1;

const BALL_IMG = gridFromMap([
  '.kkkk.',
  'krrrrk',
  'kkwwkk',
  'kwwwwk',
  '.kkkk.',
], { k: OUTLINE, r: '#e8433a', w: '#f6f2ee' }).toCanvas();

// Lazily tinted sprite variants (freeze / burn / paralysis / buff glow).
const _tint = {};
function tinted(id, color) {
  const key = id + color;
  if (_tint[key]) return _tint[key];
  const src = SPRITES[id].img;
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
  return (_tint[key] = cv);
}

// ------------------------------------------------------------------ Monster
class Mon {
  constructor(def, side) {
    this.def = def; this.id = def.id; this.side = side;
    this.item = ITEMS[def.item] || {};
    this.maxHp = def.hp; this.hp = def.hp;
    this.r = def.size === 'L' ? 17 : 12;
    this.h = SPRITES[def.id].size * SPR_SCALE;
    this.moves = def.moves.map(k => MOVES[k]);
    const melee = this.moves.filter(m => m.kind === 'dash' || m.kind === 'burst' || m.kind === 'vortex').length;
    const ranged = this.moves.filter(m => ['projectile', 'beam', 'zone'].includes(m.kind)).length;
    this.prefRange = melee > ranged ? 45 : melee === ranged ? 85 : 125;
    this.fainted = false;
    this.dmgDealt = 0;
    this.status = null; this.statusT = 0; this.statusTick = 0;
    this.reset();
  }
  reset() {
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.kx = 0; this.ky = 0;
    this.face = 1; this.walkT = 0;
    this.cd = [0, 0, 0, 0]; this.gcd = 0;
    this.slowT = 0;          // status (PAR/BRN/FRZ) deliberately survives a swap
    this.buffs = []; this.action = null; this.stunT = 0;
    this.flash = 0; this.invuln = 0; this.visible = false; this.ghosts = []; this.ghostT = 0;
    this.fadeT = 0;
  }
  get cy() { return this.y - this.h * 0.4; }
  buffMul(stat) { return this.buffs.reduce((m, b) => (b.stat === stat ? m * b.mul : m), 1); }
  atk() { return this.def.atk * (this.item.atk || 1) * this.buffMul('atk') * (this.status === 'brn' ? 0.75 : 1); }
  defense() { return this.def.def * (this.item.def || 1) * this.buffMul('def'); }
  speed() {
    return this.def.spd * (this.item.spd || 1) * this.buffMul('spd') *
      (this.status === 'par' ? 0.55 : 1) * (this.slowT > 0 ? 0.55 : 1);
  }
  canAct() { return this.visible && !this.fainted && !this.action && this.stunT <= 0 && this.status !== 'frz'; }
}

// ------------------------------------------------------------------ CPU trainer
class AI {
  constructor(diff) { this.d = diff; this.reset(); }
  reset() { this.dir = { x: 0, y: 0 }; this.want = -1; this.delay = 0; this.think = 0.4; this.strafe = Math.random() < 0.5 ? 1 : -1; }

  update(dt, me, foe, b) {
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
    const threat = this.threat(me, foe, b);
    if (threat && Math.random() < this.d.dodge) {
      mx = threat.x; my = threat.y;
    } else {
      if (Math.random() < 0.07) this.strafe *= -1;
      const radial = d > me.prefRange + 18 ? 1 : d < me.prefRange - 18 ? -0.8 : 0;
      mx = ux * radial - uy * this.strafe * 0.75;
      my = uy * radial + ux * this.strafe * 0.75;
    }
    // keep away from walls
    const m = 30;
    if (me.x < FIELD.x0 + m) mx += 0.8; if (me.x > FIELD.x1 - m) mx -= 0.8;
    if (me.y < FIELD.y0 + m) my += 0.8; if (me.y > FIELD.y1 - m) my -= 0.8;
    if ((me.x < FIELD.x0 + m || me.x > FIELD.x1 - m) && Math.random() < 0.3) this.strafe *= -1;
    const mm = Math.hypot(mx, my);
    this.dir = mm > 0.05 ? { x: mx / mm, y: my / mm } : { x: 0, y: 0 };

    if (this.d.swap && me.visible && b.swapCd.enemy <= 0 && Math.random() < this.d.swap * 0.04) {
      const theirBest = Math.max(...foe.moves.map(mv => mv.power ? typeEffect(mv.type, me.def.types) : 0));
      const myBest = Math.max(...me.moves.map(mv => mv.power ? typeEffect(mv.type, foe.def.types) : 0));
      if (me.hp / me.maxHp < 0.25 || (theirBest >= 2 && myBest <= 1)) {
        const next = b.chooseEnemyNext(b.ei);
        if (next >= 0 && b.swap('enemy', next)) { this.reset(); return; }
      }
    }
    if (this.want < 0 && me.canAct() && Math.random() < this.d.aggro) {
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
  threat(me, foe, b) {
    let best = null, bestT = Infinity;
    for (const p of b.projectiles) {
      if (p.owner === me) continue;
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
      if (z.owner === me || (z.done && !z.mv.linger)) continue;
      const dd = Math.hypot(me.x - z.x, me.y - z.y);
      if (dd < z.r + me.r + 8) return dd > 0.5 ? { x: (me.x - z.x) / dd, y: (me.y - z.y) / dd } : { x: 1, y: 0 };
    }
    const a = foe.action;
    if (a) {
      if (a.kind === 'beam' || a.kind === 'dash') {
        const cx = Math.cos(a.dir), cy = Math.sin(a.dir);
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

// ------------------------------------------------------------------ Battle
class Battle {
  // twoP: the top ('enemy') side is a second human. p2Input: where that human's
  // input comes from (local keys/touch by default, the network when hosting online).
  // flip: draw the arena turned 180° so the enemy side is at the bottom (the online guest's view).
  // puppet: never simulate; state arrives from the host (see net.js).
  constructor({ playerTeam, enemyTeam, difficulty, stage, ui, twoP = false, overheadBars = false,
    seed = (Math.random() * 1e9) | 0, p2Input = null, flip = false, puppet = false, online = false }) {
    this.ui = ui;
    this.p = playerTeam.map(id => new Mon(ROSTER_BY_ID[id], 'player'));
    this.e = enemyTeam.map(id => new Mon(ROSTER_BY_ID[id], 'enemy'));
    this.pi = 0; this.ei = 0;
    this.diff = DIFFICULTY[difficulty];
    this.twoP = twoP; this.overheadBars = overheadBars;
    this.ai = twoP ? null : new AI(this.diff);
    this.p2Input = p2Input || { dir: () => Input.dir(1), moves: () => Input.moves(1) };
    this.flip = flip; this.puppet = puppet; this.online = online;
    this.seed = seed;
    const built = buildStage(stage, seed);
    this.ground = built.canvas; this.stage = built.stage;
    this.decal = document.createElement('canvas'); this.decal.width = W; this.decal.height = H;
    this.dctx = this.decal.getContext('2d');
    // the bottom trainer is seen from behind, the top one from the front
    this.trainers = flip
      ? { player: trainerCanvas('player', false), enemy: trainerCanvas('rival', true) }
      : { player: trainerCanvas('player', true), enemy: trainerCanvas('rival', false) };
    this.projectiles = []; this.zones = []; this.particles = []; this.floats = []; this.texts = []; this.balls = [];
    this.weather = Array.from({ length: 70 }, () => this.newFlake(true));
    this.state = 'intro'; this.stateT = 0; this.time = 0; this.clock = 0;
    this.shake = 0; this.hitstop = 0;
    this.kos = { player: 0, enemy: 0 };
    this.swapCd = { player: 0, enemy: 0 };
    ui.banner('BATTLE!');
    Sfx.play('ball');
  }

  get P() { return this.p[this.pi]; }
  get E() { return this.e[this.ei]; }
  foe(m) { return m.side === 'player' ? this.E : this.P; }

  // ---------------------------------------------------------- view (perspective)
  // When flipped, the arena is turned 180° about the field centre but sprites and
  // text stay upright. A point drawn k units above its ground spot (x, y + k) lands
  // at the mirrored ground spot, still k above it: screen y = MIRROR_Y - y - 2k.
  sx(x) { return this.flip ? W - x : x; }
  sy(y, k = 0) { return this.flip ? MIRROR_Y - y - 2 * k : y; }
  sa(a) { return this.flip ? a + Math.PI : a; }
  // particles, numbers and texts carry `g`, the ground y they are anchored to;
  // their own drift (rising, spreading) is kept as-is on screen
  gy(o) { return this.flip ? o.y + MIRROR_Y - 2 * (o.g ?? (o.kind === 'ring' || o.kind === 'bolt' ? o.y : o.y + 19)) : o.y; }

  // ---------------------------------------------------------- flow
  sendOut(side, at) {
    const m = side === 'player' ? this.P : this.E;
    m.reset();
    const pos = at || SPAWN_POS[side];
    m.x = clamp(pos.x, FIELD.x0 + m.r, FIELD.x1 - m.r); m.y = clamp(pos.y, FIELD.y0 + m.r, FIELD.y1 - 2);
    m.face = side === 'player' ? 1 : -1;
    if (side === 'enemy' && this.ai) this.ai.reset();
    this.balls.push({ side, from: TRAINER_POS[side], to: { x: m.x, y: m.y - 6 }, t: 0, dur: 0.55 });
    this.ui.onSendOut(side, m);
    Sfx.play('ball');
  }

  startSendouts(pl, en) {
    this.state = 'sendout'; this.stateT = 0;
    if (pl) this.sendOut('player');
    if (en) this.sendOut('enemy');
  }

  // Mid-fight swap: the fight keeps running while the new monster is thrown in,
  // so the swapping side is briefly open to attack.
  canSwap(side, idx) {
    const team = side === 'player' ? this.p : this.e;
    const cur = side === 'player' ? this.pi : this.ei;
    return this.state === 'fight' && this.swapCd[side] <= 0 && idx !== cur && team[idx] && !team[idx].fainted &&
      !this.balls.some(b => b.side === side);
  }

  swap(side, idx) {
    if (!this.canSwap(side, idx)) return false;
    const out = side === 'player' ? this.P : this.E;
    const at = { x: out.x, y: out.y };
    out.action = null; out.visible = false; out.ghosts = [];
    const tp = TRAINER_POS[side];
    this.particles.push({ x: tp.x, y: tp.y - 14, g: tp.y, x2: out.x, y2: out.cy, k2: out.y - out.cy, life: 0.3, max: 0.3, color: '#ff5a4a', kind: 'line' });
    this.particles.push({ x: out.x, y: out.y - 4, r0: 22, r1: 2, life: 0.3, max: 0.3, color: '#ffffff', kind: 'ring', w: 3 });
    this.burst(out.x, out.cy, ['#ff5a4a', '#ffffff'], 14, 60);
    if (side === 'player') this.pi = idx; else this.ei = idx;
    this.swapCd[side] = 8;
    const inc = side === 'player' ? this.P : this.E;
    this.ui.callout(side, `Go, ${inc.def.name}`, inc.def.types[0]);
    this.sendOut(side, at);
    return true;
  }

  faint(m) {
    if (m.fainted) return;
    m.fainted = true; m.hp = 0; m.action = null; m.fadeT = 0;
    this.kos[m.side === 'player' ? 'enemy' : 'player']++;
    this.ui.banner(`${m.def.name} FAINTED!`);
    Sfx.play('faint');
    this.burst(m.x, m.cy, ['#ffffff', '#cfd6e6'], 26, 90);
    const other = this.foe(m);
    if (other) other.action = null;
    this.projectiles = []; this.zones = [];
    this.state = 'faint'; this.stateT = 0;
  }

  resolveFaint() {
    const pAlive = this.p.some(m => !m.fainted), eAlive = this.e.some(m => !m.fainted);
    if (!pAlive || !eAlive) {
      this.end(pAlive ? 'win' : eAlive ? 'lose' : 'draw');
      return;
    }
    const needE = this.E.fainted, needP = this.P.fainted;
    if (needE && this.ai) this.ei = this.chooseEnemyNext(-1);
    // humans pick their own replacement, player 1 first
    const queue = [];
    if (needP) queue.push('player');
    if (needE && !this.ai) queue.push('enemy');
    const next = () => {
      const side = queue.shift();
      if (!side) { this.startSendouts(needP, needE); return; }
      this.state = 'pick';
      this.ui.pickNext(side === 'player' ? this.p : this.e, idx => {
        if (side === 'player') this.pi = idx; else this.ei = idx;
        next();
      }, this.twoP ? side : null);
    };
    next();
  }

  chooseEnemyNext(exclude) {
    const foe = this.P;
    let best = -1, bestScore = -Infinity;
    this.e.forEach((m, i) => {
      if (m.fainted || i === exclude) return;
      const off = Math.max(...m.moves.map(mv => mv.power ? typeEffect(mv.type, foe.def.types) : 0));
      const def = Math.max(...foe.moves.map(mv => mv.power ? typeEffect(mv.type, m.def.types) : 0));
      const s = off - def * 0.6 + Math.random() * 0.5;
      if (s > bestScore) { bestScore = s; best = i; }
    });
    return best;
  }

  end(result) {
    this.state = 'over';
    Sfx.music.stop(0.6);
    setTimeout(() => Sfx.play(result === 'win' || (this.twoP && !this.online && result !== 'draw') ? 'win' : 'lose'), 500);
    const dealt = this.p.reduce((s, m) => s + m.dmgDealt, 0);
    const dealtE = this.e.reduce((s, m) => s + m.dmgDealt, 0);
    this.ui.onEnd({ result, time: this.clock, kos: this.kos.player, lost: this.kos.enemy, dealt, dealtE, twoP: this.twoP });
  }

  // ---------------------------------------------------------- moves
  tryMove(m, i) {
    if (this.state !== 'fight' || !m.canAct() || m.cd[i] > 0 || m.gcd > 0) return false;
    this.execute(m, i);
    return true;
  }

  aim(m, foe, mv) {
    let tx = foe.x, ty = foe.cy;
    if (m.side === 'enemy' && this.ai && this.diff.lead && mv.speed && mv.kind === 'projectile') {
      const t = Math.hypot(tx - m.x, ty - m.cy) / mv.speed;
      tx += foe.vx * t * 0.8; ty += foe.vy * t * 0.8;
    }
    let a = Math.atan2(ty - m.cy, tx - m.x);
    if (m.side === 'enemy' && this.ai) a += (Math.random() - 0.5) * 2 * this.diff.aimErr;
    return a;
  }

  execute(m, i) {
    const mv = m.moves[i], foe = this.foe(m);
    m.cd[i] = mv.cd * (m.item.cd || 1);
    m.gcd = 0.35;
    this.ui.callout(m.side, mv.name, mv.type);
    const dir = this.aim(m, foe, mv);
    if (Math.abs(Math.cos(dir)) > 0.2) m.face = Math.cos(dir) > 0 ? 1 : -1;
    const fx = TYPES[mv.type].fx;

    switch (mv.kind) {
      case 'projectile': {
        const n = mv.count || 1, sp = mv.spread || 0;
        for (let k = 0; k < n; k++) {
          const a = dir + (n > 1 ? (k / (n - 1) - 0.5) * sp : 0);
          this.projectiles.push({
            x: m.x + Math.cos(a) * m.r, y: m.cy + Math.sin(a) * m.r,
            vx: Math.cos(a) * mv.speed, vy: Math.sin(a) * mv.speed,
            r: mv.r || 4, mv, owner: m, life: 2.6, spin: rand(0, TAU), k: m.y - m.cy,
            // boomerangs fly out `range`, then home back to the thrower
            out: mv.boomerang ? mv.range / mv.speed : 0, back: false, hitCd: 0,
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
        m.action = { kind: 'dash', t: 0, mv, dir, lock: true, hit: false, id: _uid++ };
        Sfx.play('dash');
        break;
      case 'vortex':
        m.action = { kind: 'vortex', t: 0, mv, dir, lock: true, tick: 0, id: _uid++ };
        Sfx.play('vortex');
        break;
      case 'burst':
        m.action = { kind: 'burst', t: 0, mv, dir, lock: true, done: false };
        Sfx.play(mv.sfx || 'charge');   // a move can bring its own wind-up sound
        break;
      case 'zone': {
        const n = mv.count || 1;
        for (let k = 0; k < n; k++) {
          const off = k === 0 ? 0 : (mv.scatter || 30);
          const a = rand(0, TAU), rr = rand(0.4, 1) * off;
          this.zones.push({
            x: clamp(foe.x + Math.cos(a) * rr, FIELD.x0 + 8, FIELD.x1 - 8),
            y: clamp(foe.y + Math.sin(a) * rr, FIELD.y0 + 8, FIELD.y1 - 8),
            r: mv.r, t: 0, delay: mv.delay + k * 0.18, mv, owner: m, done: false, tick: 0, id: _uid++,
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

    const fresh = this.number(tgt, dmg, opts.merge);
    const kb = opts.kb ?? Math.atan2(tgt.cy - src.cy, tgt.x - src.x);
    const force = opts.force ?? (mult < 1 ? 22 : Math.min(260, 60 + dmg * 0.45));
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
    if (mv.slow) tgt.slowT = Math.max(tgt.slowT, mv.slow);
    // drain: the attacker heals for part of the damage it dealt
    if (mv.drain && !src.fainted && src.hp > 0) {
      const heal = Math.round(Math.min(dmg * mv.drain, src.maxHp - src.hp));
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
      case 'intro':
        if (this.stateT > 0.8) this.startSendouts(true, true);
        break;
      case 'sendout':
        if (this.balls.length === 0 && this.stateT > 1.0) { this.state = 'fight'; this.stateT = 0; }
        this.idle(dt);
        break;
      case 'fight': {
        this.clock += dt;
        this.swapCd.player -= dt; this.swapCd.enemy -= dt;
        const P = this.P, E = this.E;
        const eDir = this.ai ? this.ai.update(dt, E, P, this) : this.p2Input.dir();
        this.updateMon(P, dt, E, Input.dir(0));
        const held = Input.moves(0);
        for (let i = 0; i < 4; i++) if (held[i]) this.tryMove(P, i);
        if (!this.ai) { const h2 = this.p2Input.moves(); for (let i = 0; i < 4; i++) if (h2[i]) this.tryMove(E, i); }
        if (this.state === 'fight') this.updateMon(E, dt, P, eDir);
        if (this.state === 'fight') this.separate(P, E);
        this.updateProjectiles(dt);
        this.updateZones(dt);
        break;
      }
      case 'faint':
        for (const m of [this.P, this.E]) if (m.fainted) m.fadeT += dt;
        this.idle(dt);
        if (this.stateT > 1.8) this.resolveFaint();
        break;
    }
    for (const m of [this.P, this.E]) {
      m.ghosts.forEach(g => (g.t -= dt));
      m.ghosts = m.ghosts.filter(g => g.t > 0);
    }
  }

  // keep monsters settling (knockback decay) while the fight is paused by a transition
  idle(dt) {
    for (const m of [this.P, this.E]) {
      m.vx *= Math.exp(-dt * 10); m.vy *= Math.exp(-dt * 10);
      m.kx *= Math.exp(-dt * 7); m.ky *= Math.exp(-dt * 7);
      m.x = clamp(m.x + (m.vx + m.kx) * dt, FIELD.x0 + m.r, FIELD.x1 - m.r);
      m.y = clamp(m.y + (m.vy + m.ky) * dt, FIELD.y0 + m.r, FIELD.y1 - 2);
      m.flash = Math.max(0, m.flash - dt);
    }
  }

  updateMon(m, dt, foe, ctrl) {
    if (!m.visible || m.fainted) return;
    m.flash = Math.max(0, m.flash - dt);
    m.invuln -= dt; m.gcd -= dt; m.stunT -= dt; m.slowT -= dt;
    for (let i = 0; i < 4; i++) m.cd[i] = Math.max(0, m.cd[i] - dt);
    m.buffs.forEach(b => (b.t -= dt));
    m.buffs = m.buffs.filter(b => b.t > 0);
    if (m.item.regen && m.hp > 0) m.hp = Math.min(m.maxHp, m.hp + m.maxHp * m.item.regen * dt);

    // status effects
    if (m.status) {
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
    }

    if (m.action) this.updateAction(m, dt, foe);
    if (m.fainted || this.state !== 'fight') return;

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
    m.x = clamp(m.x + (m.vx + m.kx) * dt, FIELD.x0 + m.r, FIELD.x1 - m.r);
    m.y = clamp(m.y + (m.vy + m.ky) * dt, FIELD.y0 + m.r, FIELD.y1 - 2);
    const sp = Math.hypot(m.vx, m.vy);
    m.walkT += sp * dt;
    if (!lock) {
      if (Math.abs(m.vx) > 12) m.face = Math.sign(m.vx);
      else if (sp < 12 && Math.abs(foe.x - m.x) > 4) m.face = Math.sign(foe.x - m.x);
    }
  }

  updateAction(m, dt, foe) {
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
          if (a.t < mv.charge * 0.7) a.dir = this.aim(m, foe, mv);
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
            if (this.beamHits(m, a, foe)) this.hit(m, foe, mv, 0.1 / mv.dur * 1.15, { merge: a.id, kb: a.dir });
            if (m.fainted || !m.action) return;
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
          const d = Math.hypot(foe.x - m.x, foe.y - m.y) || 1;
          if (d > m.r + foe.r) { m.x += (foe.x - m.x) / d * 90 * dt; m.y += (foe.y - m.y) / d * 90 * dt; }
          a.tick -= dt;
          if (a.tick <= 0) {
            if (a.left <= 0 || d > m.r + foe.r + 16 || !foe.visible || foe.fainted) { m.action = null; break; }
            a.left--;
            const last = a.left === 0;
            // light jabs keep the target close; the last hit knocks it away
            this.hit(m, foe, mv, 1, { kb: Math.atan2(foe.y - m.y, foe.x - m.x), merge: a.id, force: last ? undefined : 35 });
            if (m.fainted || !m.action) return;
            a.tick = 0.13;
            if (last) { m.action = null; this.decalAt(foe.x, foe.y, 8); }
          }
          break;
        }
        if (a.t <= 0.1) { if (a.t < 0.03) a.dir = this.aim(m, foe, mv); break; }
        m.ghostT -= dt;
        if (m.ghostT <= 0) { m.ghostT = 0.03; m.ghosts.push({ x: m.x, y: m.y, face: m.face, t: 0.22, color: fx[1] }); }
        if (Math.random() < 0.7) this.particles.push({ x: m.x + rand(-6, 6), y: m.cy + rand(-6, 6), vx: -m.vx * 0.2, vy: -m.vy * 0.2, life: 0.3, max: 0.3, size: 2, color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
        if (!a.hit && Math.hypot(m.x - foe.x, m.cy - foe.cy) < m.r + foe.r + 4) {
          a.hit = true;
          if (mv.hits > 1) {   // a combo: stop here and start hitting
            a.phase = 'combo'; a.left = mv.hits; a.tick = 0;
            m.vx = m.vy = 0;
            break;
          }
          const dealt = this.hit(m, foe, mv, 1, { kb: a.dir });
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
          this.particles.push({ x: m.x, y: m.y - 2, r0: 6, r1: mv.r, life: 0.35, max: 0.35, color: fx[2], kind: 'ring', w: 3 });
          this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: mv.r * 0.8, life: 0.45, max: 0.45, color: fx[1], kind: 'ring', w: 2 });
          this.burst(m.x, m.y - 4, fx, 30, mv.r * 2.6, 0, 4);
          this.decalAt(m.x, m.y, mv.r * 0.6);
          this.addShake(6);
          Sfx.play('boom');
          if (Math.hypot(foe.x - m.x, foe.y - m.y) < mv.r + foe.r * 0.6) this.hit(m, foe, mv, 1);
          if (m.fainted) return;
        }
        if (a.t >= mv.delay + 0.15) m.action = null;
        break;
      }

      // vortex: the user stands still and drags the opponent in, grinding it while it's caught
      case 'vortex': {
        const mv = a.mv;
        if (Math.random() < 0.9) {   // debris spiralling inward
          const ang = rand(0, TAU), rr = rand(0.5, 1) * mv.r;
          const px = m.x + Math.cos(ang) * rr, py = m.y + Math.sin(ang) * rr * 0.7;
          this.particles.push({ x: px, y: py - 3, g: py, vx: (m.x - px) * 1.6 - Math.sin(ang) * 70, vy: (m.y - py) * 1.6 + Math.cos(ang) * 50,
            life: 0.45, max: 0.45, size: rand(1, 2.5), color: fx[rand() < 0.5 ? 1 : 2], kind: 'sq' });
        }
        const dx = m.x - foe.x, dy = m.y - foe.y, d = Math.hypot(dx, dy) || 1;
        if (foe.visible && !foe.fainted && d < mv.r + foe.r) {
          if (d > m.r + foe.r) {
            foe.x = clamp(foe.x + dx / d * mv.pull * dt, FIELD.x0 + foe.r, FIELD.x1 - foe.r);
            foe.y = clamp(foe.y + dy / d * mv.pull * dt, FIELD.y0 + foe.r, FIELD.y1 - 2);
          }
          a.tick -= dt;
          if (a.tick <= 0) {
            a.tick = 0.25;
            this.hit(m, foe, mv, 0.25 / mv.dur, { merge: a.id, kb: Math.atan2(dy, dx), force: 0 });
            if (m.fainted || !m.action) return;
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
    if (!a.visible || !b.visible || a.fainted || b.fainted) return;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
    const min = (a.r + b.r) * 0.85;
    if (d < min) {
      const push = (min - d) / 2;
      a.x -= dx / d * push; a.y -= dy / d * push;
      b.x += dx / d * push; b.y += dy / d * push;
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      p.life -= dt; p.spin += dt * 12;
      const foe = this.foe(p.owner);
      if (p.mv.homing && foe && foe.visible) {
        const cur = Math.atan2(p.vy, p.vx), want = Math.atan2(foe.cy - p.y, foe.x - p.x);
        let diff = ((want - cur + Math.PI * 3) % TAU) - Math.PI;
        const turn = clamp(diff, -p.mv.homing * dt, p.mv.homing * dt);
        const sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(cur + turn) * sp; p.vy = Math.sin(cur + turn) * sp;
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
      if (p.life > 0 && !(p.hitCd > 0) && foe && foe.visible && !foe.fainted && Math.hypot(p.x - foe.x, p.y - foe.cy) < p.r + foe.r) {
        // a boomerang cuts through and can hit again on the way back
        if (p.mv.boomerang) p.hitCd = 0.35; else p.life = -1;
        if (p.mv.explode) {
          this.particles.push({ x: p.x, y: p.y, g: p.y + p.k, r0: 4, r1: p.mv.explode, life: 0.3, max: 0.3, color: fx[2], kind: 'ring', w: 3 });
          this.burst(p.x, p.y, fx, 26, 140);
          this.decalAt(foe.x, foe.y, p.mv.explode * 0.6);
          Sfx.play('boom');
        }
        this.hit(p.owner, foe, p.mv, 1, { kb: Math.atan2(p.vy, p.vx) });
        if (this.state !== 'fight') return;
      }
      if (p.x < -10 || p.x > W + 10 || p.y < FIELD.y0 - 30 || p.y > FIELD.y1 + 30) p.life = -1;
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
        const foe = this.foe(z.owner);
        if (foe && foe.visible && !foe.fainted && Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) {
          this.hit(z.owner, foe, z.mv, 1, { kb: Math.atan2(foe.y - z.y, foe.x - z.x) });
          if (this.state !== 'fight') return;
        }
      } else if (z.done && z.mv.linger) {
        // a lingering pool keeps hurting whoever stands in it
        z.tick -= dt;
        const foe = this.foe(z.owner);
        if (z.tick <= 0 && foe && foe.visible && !foe.fainted && Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) {
          z.tick = 0.5;
          this.hit(z.owner, foe, z.mv, z.mv.tick, { merge: z.id, force: 0 });
          if (this.state !== 'fight') return;
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
        const m = b.side === 'player' ? this.P : this.E;
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
        f.val += val; f.t = 0.05; f.x = m.x; f.y = m.y - m.h - 2; f.g = m.y;
        f.img = numberCanvas(prefix + f.val, fill, shade);
        return false;
      }
    }
    const ox = rand(-8, 8);
    this.floats.push({ key, val, x: m.x + ox, y: m.y - m.h - 2, g: m.y, t: 0, fill, shade, prefix, img: numberCanvas(prefix + val, fill, shade) });
    return true;
  }

  text(x, y, str, color, g = y + 40) { this.texts.push({ x, y, g, str, color, t: 0 }); }

  newFlake(anywhere) {
    const kind = this.stage.weather;
    const y = anywhere ? rand(0, H) : -4;
    if (kind === 'ash') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-6, 6), vy: rand(-26, -10), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#ff8a3a' : '#5a4a48' };
    if (kind === 'petals') return { x: rand(0, W), y, vx: rand(10, 24), vy: rand(10, 22), s: 2, c: rand() < 0.5 ? '#ffd0e0' : '#ffffff' };
    return { x: rand(0, W), y, vx: rand(-8, 4), vy: rand(14, 34), s: rand() < 0.25 ? 2 : 1, c: '#ffffff' };
  }

  updateWeather(dt) {
    for (let i = 0; i < this.weather.length; i++) {
      const f = this.weather[i];
      f.x += (f.vx + Math.sin(this.time * 1.5 + i) * 6) * dt; f.y += f.vy * dt;
      if (f.y > H + 6 || f.y < -6 || f.x < -6 || f.x > W + 6) this.weather[i] = this.newFlake(false);
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
    ctx.translate(shx, shy);
    // ground and scorch marks live in world space: turn the whole layer when flipped
    ctx.save();
    if (this.flip) { ctx.translate(W, MIRROR_Y); ctx.scale(-1, -1); }
    ctx.drawImage(this.ground, 0, 0);
    ctx.drawImage(this.decal, 0, 0);
    ctx.restore();

    this.drawTelegraphs(ctx);

    // trainers + monsters, depth sorted by where they stand on screen
    const actors = [];
    for (const side of ['enemy', 'player']) actors.push({ y: this.sy(TRAINER_POS[side].y), draw: () => this.drawTrainer(ctx, side) });
    for (const m of [this.P, this.E]) if (m.visible) actors.push({ y: this.sy(m.y), draw: () => this.drawMon(ctx, m) });
    actors.sort((a, b) => a.y - b.y).forEach(a => a.draw());

    for (const m of [this.P, this.E]) if (m.action && m.action.kind === 'beam' && m.visible) this.drawBeam(ctx, m, m.action);
    for (const p of this.projectiles) this.drawProjectile(ctx, p);
    this.drawZoneFalls(ctx);
    this.drawParticles(ctx);
    for (const b of this.balls) {
      const k = Math.min(1, b.t / b.dur);
      const fx = this.sx(b.from.x), fy = this.sy(b.from.y), tx = this.sx(b.to.x), ty = this.sy(b.to.y, 6);
      const x = fx + (tx - fx) * k;
      const y = fy + (ty - fy) * k - Math.sin(Math.PI * k) * 46;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(k * 10);
      ctx.drawImage(BALL_IMG, -4.5, -3.75, 9, 7.5); ctx.restore();
    }
    if (this.overheadBars) this.drawBars(ctx);
    this.drawFloats(ctx);
    this.drawWeather(ctx);
  }

  // Tabletop 2-player hides the HUD under player 2's controls, so each monster
  // carries a small HP bar, its status colour and a row of team pips instead.
  drawBars(ctx) {
    const STATUS_COL = { par: '#d6b21e', brn: '#e0582a', frz: '#4fb6d8', psn: '#9a3ab8' };
    for (const m of [this.P, this.E]) {
      if (!m.visible || m.fainted) continue;
      const w = 26, x = Math.round(this.sx(m.x) - w / 2), y = Math.round(this.sy(m.y) - m.h - 6);
      const pct = m.hp / m.maxHp;
      ctx.fillStyle = OUTLINE; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = '#2a2638'; ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = pct > 0.5 ? '#3ccf4e' : pct > 0.2 ? '#f2c12e' : '#e8433a';
      ctx.fillRect(x, y, Math.max(1, Math.round(w * pct)), 3);
      if (m.status) { ctx.fillStyle = STATUS_COL[m.status]; ctx.fillRect(x + w + 2, y - 1, 4, 5); }
      const team = m.side === 'player' ? this.p : this.e;
      team.forEach((t, i) => {
        ctx.fillStyle = t.fainted ? '#3a3646' : t === m ? '#ffd23f' : '#f6f2ee';
        ctx.fillRect(x + i * 4, y + 5, 3, 2);
      });
    }
  }

  drawTrainer(ctx, side) {
    const img = this.trainers[side], pos = TRAINER_POS[side];
    const px = this.sx(pos.x), py = this.sy(pos.y);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(px, py, 11, 4, 0, 0, TAU); ctx.fill();
    const bob = Math.sin(this.time * 2 + (side === 'player' ? 0 : 1)) > 0.7 ? -1 : 0;
    const w = img.width * SPR_SCALE, h = img.height * SPR_SCALE;
    ctx.drawImage(img, Math.round(px - w / 2), Math.round(py - h + 1 + bob), w, h);
  }

  drawMon(ctx, m) {
    const sp = SPRITES[m.id], S = sp.size * SPR_SCALE;
    let alpha = 1, sink = 0;
    if (m.fainted) { alpha = Math.max(0, 1 - m.fadeT / 1.1); sink = m.fadeT * 6; }
    if (alpha <= 0) return;
    const moving = Math.hypot(m.vx, m.vy) > 12;
    let bob = moving ? -Math.round(Math.abs(Math.sin(m.walkT / 7 * Math.PI)) * 2) : (Math.sin(this.time * 3 + m.x) > 0.6 ? -1 : 0);
    if (m.status === 'frz' || m.stunT > 0 || m.fainted) bob = 0;
    const X = Math.round(this.sx(m.x)), Y = Math.round(this.sy(m.y));
    const face = this.flip ? -m.face : m.face;
    // your own monster gets the blue ring
    const mine = m.side === (this.flip ? 'enemy' : 'player');

    // ground marker + shadow
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 2, m.r * 0.42, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = mine ? 'rgba(90,160,255,0.75)' : 'rgba(255,90,80,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 4, m.r * 0.5 + 1, 0, 0, TAU); ctx.stroke();

    // dash afterimages
    for (const g of m.ghosts) {
      ctx.globalAlpha = (g.t / 0.22) * 0.5 * alpha;
      ctx.save(); ctx.translate(Math.round(this.sx(g.x)), Math.round(this.sy(g.y))); if ((this.flip ? -g.face : g.face) < 0) ctx.scale(-1, 1);
      ctx.drawImage(tinted(m.id, g.color), -S / 2, -S + 3, S, S); ctx.restore();
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
    if (face < 0) ctx.scale(-1, 1);
    const dx = -S / 2, dy = -S + 3;
    ctx.drawImage(sp.img, dx, dy, S, S);
    let tint = null, ta = 0;
    if (m.flash > 0) { tint = '#ffffff'; ta = Math.min(1, m.flash * 8); }
    else if (m.fainted) { tint = '#ffffff'; ta = Math.min(0.8, m.fadeT); }
    else if (m.status === 'frz') { tint = '#9fe6ff'; ta = 0.55; }
    else if (m.status === 'par' && Math.sin(this.time * 18) > 0.6) { tint = '#ffe24a'; ta = 0.45; }
    else if (m.status === 'brn' && Math.sin(this.time * 10) > 0.5) { tint = '#ff5a2a'; ta = 0.35; }
    else if (m.status === 'psn' && Math.sin(this.time * 7) > 0.4) { tint = '#b04ae0'; ta = 0.4; }
    else if (m.stunT > 0 && Math.sin(this.time * 20) > 0) { tint = '#ffffff'; ta = 0.25; }
    if (tint) { ctx.globalAlpha = ta * alpha; ctx.drawImage(tinted(m.id, tint), dx, dy, S, S); }
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
    for (const z of this.zones) {
      if (z.done) {
        if (!z.mv.linger) continue;
        // lingering pool: fades in and out, with bubbles popping across it
        const age = z.t - z.delay, left = z.mv.linger - age;
        const fade = clamp(Math.min(age / 0.15, left / 0.4), 0, 1);
        const zx = this.sx(z.x), zy = this.sy(z.y), fx = TYPES[z.mv.type].fx;
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
      const k = clamp(z.t / z.delay, 0, 1), zx = this.sx(z.x), zy = this.sy(z.y);
      ctx.fillStyle = TYPES[z.mv.type].fx[0];
      ctx.globalAlpha = 0.18 + k * 0.2;
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r * k, z.r * k * 0.7, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const m of [this.P, this.E]) {
      const a = m.action;
      if (!a || !m.visible) continue;
      const X = this.sx(m.x), Y = this.sy(m.y), dir = this.sa(a.dir);
      if (a.kind === 'burst' && !a.done) {
        const k = clamp(a.t / a.mv.delay, 0, 1);
        ctx.fillStyle = TYPES[a.mv.type].fx[0];
        ctx.globalAlpha = 0.15 + k * 0.2;
        ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r * k, a.mv.r * k * 0.7, 0, 0, TAU); ctx.fill();
        ctx.globalAlpha = pulse; ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r, a.mv.r * 0.7, 0, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (a.kind === 'beam' && a.phase === 'charge') {
        const cy = this.sy(m.cy, m.y - m.cy);
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
      const zx = this.sx(z.x), zy = this.sy(z.y);   // things still fall down the screen
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
    const ox = this.sx(m.x + Math.cos(a.dir) * 6), oy = this.sy(m.cy + Math.sin(a.dir) * 6, m.y - m.cy);
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
    ctx.translate(ox, oy); ctx.rotate(this.sa(a.dir));
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
    const px = this.sx(p.x), py = this.sy(p.y, p.k ?? 19);
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
      const a = this.sa(Math.atan2(p.vy, p.vx));
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
    const dxs = this.flip ? -1 : 1;
    for (const p of this.particles) {
      const k = clamp(p.life / p.max, 0, 1);
      const X = this.sx(p.x), Y = this.gy(p);
      ctx.globalAlpha = k;
      switch (p.kind) {
        case 'sq': {
          const s = Math.max(1, Math.round(p.size * (0.5 + k * 0.5)));
          ctx.fillStyle = p.color; ctx.fillRect(Math.round(X - s / 2), Math.round(Y - s / 2), s, s);
          break;
        }
        case 'spark':
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - dxs * p.vx * 0.06, Y - p.vy * 0.06); ctx.stroke();
          break;
        case 'ring': {
          const r = p.r1 + (p.r0 - p.r1) * k;
          ctx.strokeStyle = p.color; ctx.lineWidth = p.w * k + 0.5;
          ctx.beginPath(); ctx.ellipse(X, Y, r, r * 0.7, 0, 0, TAU); ctx.stroke();
          break;
        }
        case 'line':
          ctx.strokeStyle = p.color; ctx.lineWidth = 3 * k + 0.5;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(this.sx(p.x2), this.sy(p.y2, p.k2 ?? 19)); ctx.stroke();
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
      ctx.drawImage(f.img, Math.round(this.sx(f.x) - w / 2), Math.round(this.gy(f) - h), w, h);
    }
    ctx.globalAlpha = 1;
    ctx.font = 'italic 900 10px "Lilita One", "Arial Black", "Segoe UI Black", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const t of this.texts) {
      ctx.globalAlpha = t.t > 0.9 ? 1 - (t.t - 0.9) / 0.3 : 1;
      const x = clamp(this.sx(t.x), 50, W - 50), y = this.gy(t);
      ctx.lineWidth = 3; ctx.strokeStyle = '#2a1405'; ctx.strokeText(t.str, x, y);
      ctx.fillStyle = t.color; ctx.fillText(t.str, x, y);
    }
    ctx.globalAlpha = 1;
  }

  drawWeather(ctx) {
    for (const f of this.weather) { ctx.fillStyle = f.c; ctx.globalAlpha = 0.85; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s); }
    ctx.globalAlpha = 1;
  }
}
