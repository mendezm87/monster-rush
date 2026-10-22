// Hand-made bosses (r143). The owner: no boss on every floor, a boss at the end of each act of three
// floors (dungeon.js ACT_FLOORS; the other floors end with a gatekeeper), designed from the research in
// docs/boss-research.md. Rush only; loaded after dungeon.js.
//
// A hand-made boss is an entry in BOSSES. In a fight its brain (BossBrain, set as m.ai) runs its phases:
//   phases   [{ at, form, banner, patterns, update }]: `at` is the share of HP where the phase starts, `form`
//            the Coreature it looks like (a boss may change form between phases), `patterns` the names of its
//            hand-made attacks (or a function of the brain), `update` anything the phase does every frame
//   patterns { name: { cd, w, run(B, b, m) } }: an attack with a warning first, built from hazards (below)
// Between its patterns the boss fights with the form's own moves, like any wild Coreature (AI).
//
// Hazards (b.hazards) are warned attacks: a dashed outline grows for `delay` seconds, then it lands and hits
// whoever is inside. Shapes: circle (x, y, r), ring (x, y, r0, r1: safe in the middle and outside), rect
// (x0, y0, x1, y1), line (x, y, a, len, w). A lingering one stays (frost patches, data tears) and acts on
// whoever stands in it every `every` seconds. What you see is exactly what hits: circles and rings are
// squashed like the floor (0.7), and the hit tests use the same shapes.
//
// Glitched bosses (BOSS_GLITCH, the owner: "a glitch modifier to supe them up, beyond normal glitch"): an act
// boss or the final boss is sometimes Glitched. On top of a party Coreature's Glitch (Glitch type, more
// attack, the torn look) it has more HP and attack, its warned attacks replay a second later (its corrupted
// data echoes them), it attacks more often, and it tears the floor at each phase change (data tears: standing
// in one corrupts your Coreature). It drops two Corrupted Shards and a chest.

const BOSS_GLITCH = { hp: 1.3, atk: 1.15, echo: 1.1, cadence: 0.82, tears: 3, corrupt: 4 };
const BOSS_STILL = { x: 0, y: 0 };
const BOSS_MOVE_MUL = 0.5;   // its ordinary moves (between patterns) hit this hard; the warned attacks are the real danger
const SQUASH = 0.7;   // circles on the floor are drawn (and hit) this much flatter than wide
const ECHO_COL = '#ff3ad8', TEAR_COLS = ['#ff3ad8', '#3af0ff'];

// the moves its hand-made attacks hit with (damage goes through Battle.hit, so types and defence count)
const BOSS_MV = {   // (each gets boss: true below, so BOSS_MOVE_MUL leaves them alone)
  flop:    { id: 'bossFlop', name: 'Belly Flop', type: 'beast', style: 'normal', kind: 'zone', power: 170 },
  yawn:    { id: 'bossYawn', name: 'Big Yawn', type: 'beast', style: 'psychic', kind: 'zone', power: 130 },
  icicle:  { id: 'bossIcicle', name: 'Icicle Rain', type: 'ice', style: 'ice', kind: 'zone', power: 115, frost: 1 },
  frost:   { id: 'bossFrost', name: 'Frost Patch', type: 'ice', style: 'ice', kind: 'zone', power: 18 },
  glacier: { id: 'bossGlacier', name: 'Glacier Slam', type: 'ice', style: 'ice', kind: 'zone', power: 180, frost: 2 },
  spear:   { id: 'bossSpear', name: 'Bamboo Volley', type: 'plant', style: 'grass', kind: 'zone', power: 105 },
  quake:   { id: 'bossQuake', name: 'Fault Line', type: 'earth', style: 'ground', kind: 'zone', power: 190 },
  rock:    { id: 'bossRock', name: 'Rockfall', type: 'earth', style: 'rock', kind: 'zone', power: 120 },
  tear:    { id: 'bossTear', name: 'Data Tear', type: 'glitch', style: 'poison', kind: 'zone', power: 26 },
  crash:   { id: 'bossCrash', name: 'Hibernation Crash', type: 'beast', style: 'normal', kind: 'zone', power: 0 },
};
for (const mv of Object.values(BOSS_MV)) mv.boss = true;

// ---------------------------------------------------------------- the bosses
// SLUMBEAR, THE JUMBLED KING (act 1, floor 3). His data is a jumble of every bear on record, and as the fight
// goes on it sorts itself out, then falls apart. Phase 1, Sleepwalker: belly flops onto where you stand,
// a yawn whose shockwave is safe right next to him or far away, and a midnight snack you can interrupt by
// hitting him hard while he eats (he's dizzy and takes more damage). Phase 2, his data sorts into POLAROAR:
// icicles rain and leave frost patches, a glacier slams down on the half of the room you're in, and every
// icy hit adds Frostbite (5 = frozen solid; swapping thaws the one that goes back in the Arcbracer). Phase 3,
// the data won't settle: every 8 s he glitches into a different bear (Polaroar's icicles, Pandawn's bamboo
// volleys, Grizzquake's fault lines and rockfall), and near the end he curls up for a Big Sleep: hit him
// hard enough before he wakes or his Hibernation Crash hits the whole room.
const BOSSES = {
  slumbear: {
    act: 1, title: 'THE JUMBLED KING', forms: ['slumbear', 'polarest', 'bambooze', 'grizzleep'],
    phases: [
      { at: 1, form: 'slumbear', patterns: ['bellyFlop', 'yawn', 'snack'] },
      { at: 0.65, form: 'polarest', banner: ['HIS DATA IS SORTING...', 'Slumbear is becoming POLAROAR'], patterns: ['icicleRain', 'glacierSlam', 'bellyFlop'], frost: true },
      { at: 0.3, form: 'grizzleep', banner: ['ERROR: FORM UNSTABLE', 'His data won\'t settle: watch which bear he becomes'], frost: true,
        patterns: B => ({ polarest: ['icicleRain', 'glacierSlam'], bambooze: ['bambooVolley', 'bellyFlop'], grizzleep: ['faultLine', 'rockfall'] })[B.m.id] || ['bellyFlop'],
        update(B, b, dt) {
          const m = B.m;
          if (!B.slept && m.hp / m.maxHp <= 0.15 && !B.shifting) { B.slept = true; BOSS_PATTERNS.bigSleep.run(B, b, m); return; }
          if ((B.cycleT -= dt) > 0 || B.busy > 0 || B.special) return;
          B.cycleT = 8;
          const next = pickRand(['polarest', 'bambooze', 'grizzleep'].filter(f => f !== m.id));
          B.shiftTo(b, next);
        } },
    ],
  },
};

// The hand-made attacks. B is the brain, b the battle, m the boss.
const BOSS_PATTERNS = {
  // he crouches, leaps and comes down where you were standing
  bellyFlop: { cd: 7, w: 3, run(B, b, m) {
    const F = b.F, P = b.P, x = clamp(P.x, F.x0 + 34, F.x1 - 34), y = clamp(P.y, F.y0 + 30, F.y1 - 12), sx = m.x, sy = m.y;
    B.act(m, 1.55, 'windup'); b.ui.callout('enemy', 'Belly Flop', 'beast');
    B.hazard(b, { shape: 'circle', x, y, r: 46, delay: 1.3, mv: BOSS_MV.flop, force: 230,
      onLand(b, h) { if (!h.echo) { m.x = x; m.y = y; m.jump = 0; } b.addShake(9); b.burst(x, y - 1, DUST, 26, 110, -20, 4); b.decalAt(x, y, 30); Sfx.play('bigHit'); } });
    B.during(0.35, 0.95, k => { m.x = sx + (x - sx) * k; m.y = sy + (y - sy) * k; m.jump = Math.sin(k * Math.PI) * 70; });
  } },
  // a yawn so big its shockwave rolls across the room: safe right next to him, or far away
  yawn: { cd: 9, w: 2, run(B, b, m) {
    B.act(m, 1.7, 'roar'); b.ui.callout('enemy', 'Big Yawn', 'beast');
    B.hazard(b, { shape: 'ring', x: m.x, y: m.y, r0: 44, r1: 165, delay: 1.45, mv: BOSS_MV.yawn, force: 180,
      onLand(b, h) { for (let i = 0; i < 3; i++) b.particles.push({ kind: 'wave', x: h.x, y: h.y - 2, r0: h.r0, r1: h.r1 * (1 - i * 0.12), life: 0.4 + i * 0.1, max: 0.4, color: i % 2 ? '#c8b8ff' : '#ffffff', w: 4 }); b.addShake(6); } });
  } },
  // he sits down for a snack: hit him hard enough while he eats and he chokes on it
  snack: { cd: 18, w: 2, when: (B, m) => m.hp / m.maxHp < 0.92, run(B, b, m) {
    b.ui.callout('enemy', 'Midnight Snack', 'beast');
    B.special = { kind: 'snack', t: 0, dur: 4.5, need: m.maxHp * 0.07, got: 0, tick: 0.5 };
    m.action = { kind: 'cast', t: 0, dur: 4.5, lock: true, pose: 'heal' }; m.healPose = 'chew';
    b.text(m.x, m.y - m.h - 18, 'HIT HIM TO INTERRUPT!', '#ffe066', m.y);
  } },
  // icicles fall all over the room (some right on you); each leaves a patch of frost
  icicleRain: { cd: 8, w: 3, run(B, b, m) {
    B.act(m, 0.9, 'roar'); b.ui.callout('enemy', 'Icicle Rain', 'ice');
    const F = b.F, P = b.P, spots = [];
    for (let i = 0; i < 3; i++) spots.push([P.x + rand(-38, 38), P.y + rand(-26, 26)]);
    for (let i = 0; i < 5; i++) spots.push([rand(F.x0 + 30, F.x1 - 30), rand(F.y0 + 30, F.y1 - 20)]);
    spots.forEach(([x, y], i) => {
      x = clamp(x, F.x0 + 20, F.x1 - 20); y = clamp(y, F.y0 + 20, F.y1 - 10);
      B.hazard(b, { shape: 'circle', x, y, r: 23, delay: 1.0 + i * 0.13, mv: BOSS_MV.icicle,
        onLand(b, h) { b.fxBlast(h.x, h.y, 26, BOSS_MV.icicle); b.addShake(2.5);
          if (!h.echo) B.hazard(b, { shape: 'circle', x: h.x, y: h.y, r: 21, delay: 0, linger: 5, every: 1.1, kind: 'frost', noEcho: true,
            onTick(b, h2, P) { P.slowT = Math.max(P.slowT, 0.6); B.frost(b, P, 1); } }); } });
    });
  } },
  // a wall of ice slams down on the half of the room you're standing in
  glacierSlam: { cd: 11, w: 2, run(B, b, m) {
    B.act(m, 1.8, 'windup'); b.ui.callout('enemy', 'Glacier Slam', 'ice');
    const F = b.F, P = b.P, cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2, wide = Math.random() < 0.65;
    const R = wide ? (P.x < cx ? [F.x0, F.y0, cx, F.y1] : [cx, F.y0, F.x1, F.y1]) : (P.y < cy ? [F.x0, F.y0, F.x1, cy] : [F.x0, cy, F.x1, F.y1]);
    B.hazard(b, { shape: 'rect', x0: R[0], y0: R[1], x1: R[2], y1: R[3], delay: 1.6, mv: BOSS_MV.glacier, force: 200,
      onLand(b, h) { for (let i = 0; i < 9; i++) b.fxBlast(rand(h.x0 + 20, h.x1 - 20), rand(h.y0 + 20, h.y1 - 10), 24, BOSS_MV.glacier); b.addShake(10); Sfx.play('bigHit'); } });
  } },
  // Pandawn: a fan of bamboo spears, then a second volley aimed at where you went
  bambooVolley: { cd: 6, w: 3, run(B, b, m) {
    B.act(m, 2.4, 'windup'); b.ui.callout('enemy', 'Bamboo Volley', 'plant');
    const volley = (n, spread, delay) => {
      const P = b.P, a0 = Math.atan2(P.y - m.y, P.x - m.x);
      for (let i = 0; i < n; i++) {
        const a = a0 + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0);
        B.hazard(b, { shape: 'line', x: m.x, y: m.y, a, len: rayLen(b.F, m.x, m.y, a), w: 16, delay, mv: BOSS_MV.spear,
          onLand(b, h) { for (let k = 0; k < 6; k++) { const d = h.len * k / 6; b.particles.push({ kind: 'streak', x: h.x + Math.cos(h.a) * d, y: h.y - 8 + Math.sin(h.a) * d, sx: Math.cos(h.a) * 600, sy: Math.sin(h.a) * 600, color: '#a8dc78', life: 0.2, max: 0.2 }); }
            b.burst(h.x + Math.cos(h.a) * h.len, h.y + Math.sin(h.a) * h.len, ['#7ab84a', '#a8dc78', '#4a8a2e'], 6, 60); } });
      }
    };
    volley(5, 1.0, 1.0);
    B.after(1.25, () => { if (m.alive) volley(3, 0.5, 0.85); });
  } },
  // Grizzquake: he stamps and the floor splits in a cross through him
  faultLine: { cd: 8, w: 3, run(B, b, m) {
    B.act(m, 1.6, 'windup'); b.ui.callout('enemy', 'Fault Line', 'earth');
    const F = b.F, x = m.x, y = m.y;
    const land = (b, h) => { const n = 8; for (let i = 0; i < n; i++) b.fxDebris(h.x0 + (h.x1 - h.x0) * (i + 0.5) / n, h.y0 + (h.y1 - h.y0) * (i + 0.5) / n, BOSS_MV.rock, 3, 90); b.addShake(9); Sfx.play('bigHit'); };
    B.hazard(b, { shape: 'rect', x0: F.x0, y0: y - 24, x1: F.x1, y1: y + 18, delay: 1.35, mv: BOSS_MV.quake, force: 240, onLand: land });
    B.hazard(b, { shape: 'rect', x0: x - 26, y0: F.y0, x1: x + 26, y1: F.y1, delay: 1.35, mv: BOSS_MV.quake, force: 240, onLand: land, noFx: true });
  } },
  // Grizzquake: rocks crash down from the ceiling
  rockfall: { cd: 7, w: 2, run(B, b, m) {
    B.act(m, 0.8, 'roar'); b.ui.callout('enemy', 'Rockfall', 'earth');
    const F = b.F, P = b.P;
    for (let i = 0; i < 6; i++) {
      const near = i < 2, x = clamp(near ? P.x + rand(-20, 20) : rand(F.x0 + 30, F.x1 - 30), F.x0 + 20, F.x1 - 20), y = clamp(near ? P.y + rand(-16, 16) : rand(F.y0 + 30, F.y1 - 20), F.y0 + 20, F.y1 - 10);
      B.hazard(b, { shape: 'circle', x, y, r: 21, delay: 1.1 + i * 0.16, mv: BOSS_MV.rock, force: 200, onLand(b, h) { b.fxBlast(h.x, h.y, 24, BOSS_MV.rock); b.decalAt(h.x, h.y, 12); b.addShake(3); } });
    }
  } },
  // the stagger check: he curls up to sleep; hit him hard enough before he wakes, or the whole room shakes
  bigSleep: { cd: 999, w: 0, run(B, b, m) {
    b.ui.banner('BIG SLEEP!', 'Hit him hard before he wakes up!');
    B.special = { kind: 'stagger', t: 0, dur: 6, need: m.maxHp * 0.1, got: 0 };
    m.action = { kind: 'cast', t: 0, dur: 6, lock: true, pose: 'heal' }; m.healPose = 'sleep';
    b.hazards = b.hazards.filter(h => h.linger);
    Sfx.beamCharge(6);
  } },
};

// how far a line from (x, y) at angle a reaches before the room's wall
function rayLen(F, x, y, a) {
  const c = Math.cos(a), s = Math.sin(a), ts = [];
  if (c > 0.001) ts.push((F.x1 - x) / c); if (c < -0.001) ts.push((F.x0 - x) / c);
  if (s > 0.001) ts.push((F.y1 - y) / s); if (s < -0.001) ts.push((F.y0 - y) / s);
  return Math.max(20, Math.min(...ts));
}

// ---------------------------------------------------------------- the brain
class BossBrain {
  constructor(m, id) {
    this.m = m; this.id = id; this.S = BOSSES[id];
    // between its patterns it fights with its own moves, but less eagerly than a plain boss: the
    // hand-made attacks (warned, dodgeable) should be the main danger, not hits you can't see coming
    this.ai = new AI({ ...WILD_AI.boss, aggro: 0.3, think: 0.35 }); this.d = this.ai.d;   // (Battle.aim reads m.ai.d)
    this.phase = 0; this.patT = 2.6; this.busy = 0; this.timers = []; this.used = {};
    this.trans = null; this.special = null; this.cycleT = 4; this.roared = false; this.frostT = 0;
  }
  get ph() { return this.S.phases[this.phase]; }
  after(t, fn) { this.timers.push({ t, fn }); }
  during(start, dur, fn) { this.timers.push({ t: start, dur, fn, each: true }); }
  act(m, dur, pose) { m.action = { kind: 'cast', t: 0, dur, lock: true, pose }; this.busy = dur; }
  hazard(b, h) {
    const H = { t: 0, done: false, tick: 0, owner: this.m, ...h };
    b.hazards.push(H);
    return H;
  }

  update(dt, me, b) {
    // timers: one-offs and per-frame tweens
    for (const t of this.timers) {
      if (t.each) { t.t -= dt; if (t.t <= 0) { const k = clamp(-t.t / t.dur, 0, 1); t.fn(k); if (k >= 1) t.gone = true; } }
      else if ((t.t -= dt) <= 0 && !t.gone) { t.gone = true; t.fn(); }
    }
    this.timers = this.timers.filter(t => !t.gone);
    if (this.lastP && this.lastP !== b.P && this.lastP.frost) this.lastP.frost = 0;   // back in the Arcbracer, it thaws
    this.lastP = b.P;
    if (me.exposedT > 0) me.exposedT -= dt;
    // its heals are its snack (an interruptible pattern), and its warned attacks are its big moves: no heals or beams in between
    for (let i = 0; i < 4; i++) if (me.moves[i] && (me.moves[i].kind === 'heal' || me.moves[i].kind === 'beam')) me.cd[i] = Math.max(me.cd[i], 1);
    if (!this.roared) { this.roared = true; this.act(me, 1.1, 'roar'); b.addShake(6); Sfx.play('bigHit'); return BOSS_STILL; }
    if (this.trans) { this.updateTrans(dt, me, b); return BOSS_STILL; }
    const next = this.S.phases[this.phase + 1];
    if (next && me.hp / me.maxHp <= next.at && !this.special) { this.startTrans(b, me, this.phase + 1); return BOSS_STILL; }
    if (this.special) { this.updateSpecial(dt, me, b); return BOSS_STILL; }
    if (this.shifting) return BOSS_STILL;
    if (this.busy > 0) { this.busy -= dt; return BOSS_STILL; }
    if (this.ph.update) { this.ph.update(this, b, dt); if (this.special || this.shifting || this.busy > 0) return BOSS_STILL; }
    this.patT -= dt / (me.bossGlitch ? BOSS_GLITCH.cadence : 1);
    if (this.patT <= 0 && me.canAct() && b.P.alive && !b.deploys.length) {
      const name = this.pick(b, me);
      if (name) { const p = BOSS_PATTERNS[name]; this.used[name] = b.time; this.patT = rand(2.2, 3.4); p.run(this, b, me); return BOSS_STILL; }
    }
    return this.ai.update(dt, me, b);
  }
  pick(b, me) {
    const list = typeof this.ph.patterns === 'function' ? this.ph.patterns(this) : this.ph.patterns;
    const ok = list.filter(n => { const p = BOSS_PATTERNS[n]; return b.time - (this.used[n] ?? -99) >= p.cd && (!p.when || p.when(this, me)); });
    if (!ok.length) return null;
    let r = Math.random() * ok.reduce((s, n) => s + BOSS_PATTERNS[n].w, 0);
    for (const n of ok) if ((r -= BOSS_PATTERNS[n].w) <= 0) return n;
    return ok[0];
  }

  // A phase change: he stops, can't be hurt, flickers between his old and new form and takes the new one.
  startTrans(b, m, i) {
    this.phase = i; this.special = null; this.shifting = false; this.timers = []; this.busy = 0;
    m.action = null; m.jump = 0; m.invuln = 3; m.healPose = null;
    b.hazards = b.hazards.filter(h => h.kind === 'tear');
    this.trans = { t: 0, dur: 2.4, from: m.id, to: this.ph.form, flip: 0 };
    if (this.ph.banner) b.ui.banner(...this.ph.banner);
    b.addShake(6); Sfx.play('recall');
    for (let k = 0; k < 2; k++) b.particles.push({ x: m.x, y: m.y - 2, r0: 6 + k * 10, r1: 70 + k * 16, life: 0.6, max: 0.6, color: k ? '#3af0ff' : '#ffffff', kind: 'ring', w: 3 });
    if (m.bossGlitch) bossTears(b, BOSS_GLITCH.tears + i);
  }
  updateTrans(dt, m, b) {
    const T = this.trans;
    T.t += dt;
    m.invuln = Math.max(m.invuln, 0.2);
    if (T.t < T.dur - 0.5 && T.from !== T.to && (T.flip -= dt) <= 0) {   // the data flickering between the two
      T.flip = 0.11; this.setForm(m, m.id === T.from ? T.to : T.from);
      for (let k = 0; k < 6; k++) b.particles.push({ kind: 'sq', x: m.x + rand(-m.r, m.r), y: m.cy + rand(-m.h / 2, m.h / 2), vx: rand(-40, 40), vy: rand(-60, -10), life: 0.4, max: 0.4, size: 2, color: pickRand(['#ffffff', '#3af0ff', '#ff3ad8', TYPES[m.def.types[0]].color]) });
    }
    if (T.t >= T.dur - 0.5 && m.id !== T.to) { this.setForm(m, T.to); m.flash = 0.5; this.act(m, 0.9, 'roar'); b.addShake(7); Sfx.play('evolve'); b.burst(m.x, m.cy, ['#ffffff', ...TYPES[m.def.types[0]].fx], 40, 130, -30); }
    if (T.t >= T.dur) { this.trans = null; m.invuln = 0; this.patT = 0.6; this.cycleT = 7; }
  }
  setForm(m, id) { if (m.id !== id) m.setDef(ROSTER_BY_ID[id]); }
  // phase 3: a warned flicker, then he's a different bear and opens with its signature attack
  shiftTo(b, id) {
    const m = this.m;
    this.shifting = true;
    b.text(m.x, m.y - m.h - 18, `DATA SHIFTING: ${ROSTER_BY_ID[id].name}`, TYPES[ROSTER_BY_ID[id].types[1]].color, m.y);
    const from = m.id;
    for (let k = 0; k < 6; k++) this.after(k * 0.13, () => this.setForm(m, k % 2 ? from : id));
    this.after(0.85, () => {
      this.shifting = false; this.setForm(m, id); m.flash = 0.4;
      b.burst(m.x, m.cy, ['#ffffff', ...TYPES[m.def.types[1]].fx], 30, 110, -30); Sfx.play('evolve');
      const sig = this.ph.patterns(this)[0]; this.used[sig] = b.time; BOSS_PATTERNS[sig].run(this, b, m);
    });
  }

  // the interrupt (Midnight Snack) and the stagger check (Big Sleep)
  updateSpecial(dt, m, b) {
    const s = this.special;
    s.t += dt;
    if (s.kind === 'snack' && (s.tick -= dt) <= 0) {
      s.tick = 0.5;
      const heal = Math.round(Math.min(m.maxHp * 0.014, m.maxHp - m.hp));
      if (heal > 0) { m.hp += heal; b.number(m, heal, 'snack', '#b6ff9a', '#4fae2e', '+'); }
    }
    if (s.got >= s.need) {   // interrupted / staggered
      this.special = null; m.action = null; m.healPose = null;
      const t = s.kind === 'snack' ? 2.6 : 4.5;
      m.stunT = t; m.exposedT = t;
      b.text(m.x, m.y - m.h - 18, s.kind === 'snack' ? 'INTERRUPTED! HE\'S DIZZY' : 'STAGGERED!', '#ffe066', m.y);
      b.addShake(7); Sfx.play('bigHit'); b.sparks(m.x, m.cy - 10, 16, '#ffe066');
      b.trainerAct('cheer', m);
      this.patT = t + 0.8;
      return;
    }
    if (s.t >= s.dur) {
      this.special = null; m.action = null; m.healPose = null;
      if (s.kind === 'snack') {   // he finished it: well fed and angrier
        m.buffs.push({ stat: 'atk', mul: 1.25, t: 9 });
        b.text(m.x, m.y - m.h - 18, 'WELL FED! ATTACK UP', '#ff8a5a', m.y);
        Sfx.play('buff');
      } else {   // he wakes up: the whole room
        const F = b.F;
        b.ui.banner('HIBERNATION CRASH!');
        this.act(m, 1.2, 'roar');
        this.hazard(b, { shape: 'rect', x0: F.x0 - 40, y0: F.y0 - 40, x1: F.x1 + 40, y1: F.y1 + 40, delay: 0.5, pct: 0.45, noEcho: true, mv: BOSS_MV.crash,
          onLand(b) { b.addShake(14); Sfx.play('bigHit'); for (let i = 0; i < 12; i++) b.fxBlast(rand(F.x0, F.x1), rand(F.y0, F.y1), 30, BOSS_MV.quake); } });
      }
      this.patT = 2;
    }
  }
  hurt(b, dmg) { if (this.special) this.special.got += dmg; }
  // his icy hits give Frostbite
  landed(b, tgt, mv, mult) {
    if (mult < 1 || !this.ph.frost || this.m.id !== 'polarest' && mv.type !== 'ice') return;
    this.frost(b, tgt, mv.frost || 1);
  }
  frost(b, P, n) {
    if (!this.ph.frost || P.fainted || b.time < this.frostT) return;
    this.frostT = b.time + 0.4;
    P.frost = (P.frost || 0) + n;
    if (P.frost >= 5) {
      P.frost = 0;
      if (!P.def.types.includes('ice')) {
        P.status = 'frz'; P.statusT = 2.4; P.statusTick = 1; P.action = null; P.vx = P.vy = 0;
        b.text(P.x, P.y - P.h - 8, 'FROZEN SOLID!', '#bff0ff', P.y);
        Sfx.play('status');
      }
    } else if (P.frost >= 3) b.text(P.x, P.y - P.h - 8, 'FROSTBITE! SWAP TO THAW', '#bff0ff', P.y);
  }
}

// ---------------------------------------------------------------- Glitched bosses
function bossGlitch(m) {
  m.bossGlitch = true; m.glitched = true;
  m.hpMul *= BOSS_GLITCH.hp; m.atkMul *= BOSS_GLITCH.atk;
  m.setDef(m.def); m.hp = m.maxHp; m.gear = ['glitch'];
}
// tears in the floor: standing in one corrupts your Coreature (and stings)
function bossTears(b, n) {
  const F = b.F, P = b.P;
  for (let i = 0, tries = 0; i < n && tries < 60; tries++) {
    const w = rand(30, 44), h = rand(22, 30), x = rand(F.x0 + 10, F.x1 - w - 10), y = rand(F.y0 + 10, F.y1 - h - 4);
    if (Math.hypot(x + w / 2 - P.x, y + h / 2 - P.y) < 80) continue;
    i++;
    b.hazards.push({ shape: 'rect', x0: x, y0: y, x1: x + w, y1: y + h, t: 0, delay: 0.9, linger: Infinity, every: 0.5, tick: 0, kind: 'tear', noEcho: true, owner: b.boss || b.e[0], done: false,
      onTick(b, h2, P) {
        b.hit(h2.owner, P, BOSS_MV.tear, 1, { force: 30 });
        if (!P.glitched && !P.fainted) { b.run.corruptMon(P, BOSS_GLITCH.corrupt); if ((h2.said = (h2.said || 0) + 1) % 3 === 1) b.text(P.x, P.y - P.h - 10, `+${BOSS_GLITCH.corrupt}% CORRUPTED`, '#ff3ad8', P.y); }
      } });
  }
  b.burst((F.x0 + F.x1) / 2, (F.y0 + F.y1) / 2, TEAR_COLS, 30, 200);
}

// The banner as the fight starts, and the name on the boss bar.
function bossIntro(b, m) {
  const g = m.bossGlitch ? 'GLITCHED ' : '';
  if (m.final) b.ui.banner(g + 'FINAL BOSS!', m.def.name);
  else if (m.brain) b.ui.banner(m.brain.S.title, `${g}ACT ${m.brain.S.act} BOSS · ${m.def.name}`);
  else if (m.gate) b.ui.banner('GATEKEEPER!', m.def.name);
  else b.ui.banner(g + 'BOSS!', m.def.name);
  if (m.bossGlitch) setTimeout(() => { if (b.state === 'fight') b.ui.banner('CORRUPTED DATA!', 'Its attacks echo, and its data tears the floor'); }, 2600);
}
function bossLabel(m) {
  const g = m.bossGlitch ? 'GLITCHED · ' : '';
  if (m.final) return g + 'FINAL BOSS · ' + m.def.name;
  if (m.gate) return 'GATEKEEPER · ' + m.def.name;
  if (m.brain) return g + m.def.name + ' · ' + m.brain.S.title;
  return g + m.def.name;
}

// ---------------------------------------------------------------- hazards in the battle
function inHazard(h, m, pad = 0) {
  const x = m.x, y = m.y, e = m.r * 0.4 + pad;
  switch (h.shape) {
    case 'circle': { const r = h.r + e; return ((x - h.x) / r) ** 2 + ((y - h.y) / (r * SQUASH)) ** 2 < 1; }
    case 'ring': { const d = Math.hypot(x - h.x, (y - h.y) / SQUASH); return d < h.r1 + e && d > h.r0 - e; }
    case 'rect': return x > h.x0 - e && x < h.x1 + e && y > h.y0 - e && y < h.y1 + e;
    case 'line': {
      const c = Math.cos(h.a), s = Math.sin(h.a), t = clamp((x - h.x) * c + (y - h.y) * s, 0, h.len);
      return Math.hypot(x - (h.x + c * t), y - (h.y + s * t)) < h.w / 2 + e;
    }
  }
  return false;
}

mixInto(Battle, class {
  updateHazards(dt) {
    const P = this.P;
    for (const h of this.hazards) {
      h.t += dt;
      if (!h.done && h.t >= h.delay) {
        h.done = true;
        if (h.mv && !h.noFx && !h.pct) Sfx.move(h.mv, 'land');
        if (h.onLand) h.onLand(this, h);
        if ((h.mv || h.pct) && P.alive && !h.linger && inHazard(h, P)) {
          if (h.pct) {   // a share of its max HP, whatever its type
            const d = Math.round(P.maxHp * h.pct);
            P.hp = Math.max(0, P.hp - d); P.flash = 0.3; animMark(P, 'hurt');
            this.number(P, d, null, '#ff9a8a', '#c04a3a');
            if (P.hp <= 0) this.faint(P);
          } else {   // knocked away from the middle of what hit it
            const cx = h.x ?? (h.x0 + h.x1) / 2, cy = h.y ?? (h.y0 + h.y1) / 2;
            this.hit(h.owner, P, h.mv, 1, { kb: Math.atan2(P.y - cy, P.x - cx), force: h.force });
          }
          if (this.state === 'faint') return;
        }
        // a Glitched boss's corrupted data replays the attack a moment later
        if (h.owner.bossGlitch && !h.echo && !h.noEcho && !h.linger) this.hazards.push({ ...h, t: 0, delay: BOSS_GLITCH.echo, done: false, echo: true });
      } else if (h.done && h.linger && (h.tick -= dt) <= 0) {
        h.tick = h.every || 0.5;
        if (P.alive && h.onTick && inHazard(h, P)) h.onTick(this, h, P);
        if (this.state === 'faint') return;
      }
    }
    this.hazards = this.hazards.filter(h => !h.done || (h.linger && h.t < h.delay + h.linger));
    // a Glitched boss without a hand-made script tears the floor once, at half health
    for (const m of this.e) if (m.bossGlitch && !m.brain && m.alive && !m.tore && m.hp < m.maxHp * 0.5) { m.tore = true; bossTears(this, 4); this.text(m.x, m.y - m.h - 12, 'DATA TEAR!', ECHO_COL, m.y); }
  }
  // for the bots (AI.threat): which way to step out of a warned attack
  hazardThreat(me) {
    if (me.side !== 'player') return null;
    for (const h of this.hazards) {
      if (h.done && !h.linger) continue;
      if (!inHazard(h, me, 10)) continue;
      switch (h.shape) {
        case 'circle': { const d = Math.hypot(me.x - h.x, me.y - h.y) || 1; return { x: (me.x - h.x) / d, y: (me.y - h.y) / d }; }
        case 'ring': { const dx = me.x - h.x, dy = me.y - h.y, d = Math.hypot(dx, dy / SQUASH) || 1, out = d > (h.r0 + h.r1) / 2 ? 1 : -1; return { x: dx / d * out, y: dy / d * out }; }
        case 'rect': {
          const F = this.F, opts = [[me.x - h.x0, -1, 0, h.x0 > F.x0 + 10], [h.x1 - me.x, 1, 0, h.x1 < F.x1 - 10], [me.y - h.y0, 0, -1, h.y0 > F.y0 + 10], [h.y1 - me.y, 0, 1, h.y1 < F.y1 - 10]].filter(o => o[3]);
          if (!opts.length) return null;
          const o = opts.sort((p, q) => p[0] - q[0])[0]; return { x: o[1], y: o[2] };
        }
        case 'line': { const side = Math.sign((me.x - h.x) * Math.sin(h.a) - (me.y - h.y) * Math.cos(h.a)) || 1; return { x: Math.sin(h.a) * side, y: -Math.cos(h.a) * side }; }
      }
    }
    return null;
  }

  // the warnings: a shape filling in under a dashed outline (magenta for a Glitched echo), then
  // lingering frost patches and flickering data tears
  drawHazards(ctx, outlines) {
    const pulse = 0.55 + Math.sin(this.time * 14) * 0.2;
    const path = (h, k = 1) => {
      ctx.beginPath();
      if (h.shape === 'circle') ctx.ellipse(h.x, h.y, h.r * k, h.r * SQUASH * k, 0, 0, TAU);
      else if (h.shape === 'ring') { ctx.ellipse(h.x, h.y, h.r1, h.r1 * SQUASH, 0, 0, TAU); ctx.moveTo(h.x + h.r0, h.y); ctx.ellipse(h.x, h.y, h.r0, h.r0 * SQUASH, 0, TAU, 0, true); }
      else if (h.shape === 'rect') { const cx = (h.x0 + h.x1) / 2, cy = (h.y0 + h.y1) / 2, w = (h.x1 - h.x0) * k, hh = (h.y1 - h.y0) * k; ctx.rect(cx - w / 2, cy - hh / 2, w, hh); }
      else if (h.shape === 'line') {
        const c = Math.cos(h.a), s = Math.sin(h.a), L = h.len * k, w = h.w / 2;
        ctx.moveTo(h.x - s * w, h.y + c * w); ctx.lineTo(h.x + c * L - s * w, h.y + s * L + c * w); ctx.lineTo(h.x + c * L + s * w, h.y + s * L - c * w); ctx.lineTo(h.x + s * w, h.y - c * w); ctx.closePath();
      }
    };
    ctx.lineWidth = 1.5;
    for (const h of this.hazards) {
      if (h.done) {
        if (!h.linger) continue;
        const age = h.t - h.delay, fade = clamp(Math.min(age / 0.2, h.linger === Infinity ? 1 : (h.linger - age) / 0.5), 0, 1);
        if (h.kind === 'tear') {   // a tear in the floor: flickering magenta and cyan blocks
          ctx.globalAlpha = 0.5 * fade; ctx.fillStyle = '#15111f'; path(h); if (!outlines) ctx.fill();
          const n = 7, seed = Math.floor(this.time * 9);
          for (let i = 0; i < n; i++) {
            const r1 = Math.abs(Math.sin(seed * 12.9 + i * 78.2 + h.x0)) % 1, r2 = Math.abs(Math.sin(seed * 39.3 + i * 11.7 + h.y0)) % 1;
            ctx.globalAlpha = 0.85 * fade; ctx.fillStyle = TEAR_COLS[i % 2];
            ctx.fillRect(Math.round(h.x0 + r1 * (h.x1 - h.x0 - 6)), Math.round(h.y0 + r2 * (h.y1 - h.y0 - 3)), 6, 2);
          }
          ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = TEAR_COLS[seed % 2]; path(h); ctx.stroke();
        } else {   // a frost patch
          ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = '#bfe8f8'; path(h); if (!outlines) ctx.fill();
          ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = '#eefcff'; path(h); ctx.stroke();
          for (let i = 0; i < 3; i++) { const ph = (this.time * 0.8 + i * 0.33 + h.x * 0.01) % 1, a = i * 2.1 + h.y; ctx.globalAlpha = (1 - ph) * fade; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(h.x + Math.cos(a) * h.r * 0.5), Math.round(h.y + Math.sin(a) * h.r * 0.3), 1, 1); }
        }
        continue;
      }
      const k = clamp(h.t / Math.max(0.01, h.delay), 0, 1);
      const col = h.echo ? ECHO_COL : h.pct ? '#ff4a3a' : h.mv ? fxOf(h.mv)[0] : '#ffffff';
      ctx.globalAlpha = 0.2 + k * 0.28; ctx.fillStyle = col;
      if (h.shape === 'ring') { path(h); if (!outlines) ctx.fill('evenodd'); }
      else { path(h, h.shape === 'rect' || h.shape === 'line' ? 1 : k); if (!outlines) ctx.fill(); }
      if (h.shape === 'rect' || h.shape === 'line') { ctx.globalAlpha = 0.25 * k; path(h, Math.max(0.05, k)); if (!outlines) ctx.fill(); }
      ctx.globalAlpha = 0.55; ctx.strokeStyle = '#15111f'; ctx.lineWidth = 3; path(h); ctx.stroke(); ctx.lineWidth = 1.5;   // a dark edge, so it reads on snow too
      ctx.globalAlpha = pulse + 0.2; ctx.strokeStyle = h.echo ? ECHO_COL : '#ffffff';
      ctx.setLineDash([4, 3]); path(h); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }

  // crisp bits over the boss and you: the interrupt or stagger bar, DIZZY, and your Frostbite
  drawBossBits(ctx) {
    const label = (str, x, y, col) => {
      ctx.font = 'italic 900 8px "Lilita One", "Arial Black", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#15111f'; ctx.strokeText(str, x, y); ctx.fillStyle = col; ctx.fillText(str, x, y);
    };
    for (const m of this.e) {
      if (!m.alive || !m.brain) continue;
      const s = m.brain.special, x = Math.round(m.x), y = Math.round(m.y - m.h - 10 - (m.hover || 0));
      if (s) {
        const w = 56, k = clamp(s.got / s.need, 0, 1), left = clamp(1 - s.t / s.dur, 0, 1);
        ctx.fillStyle = OUTLINE; ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 7);
        ctx.fillStyle = '#2a2638'; ctx.fillRect(x - w / 2, y, w, 5);
        ctx.fillStyle = s.kind === 'snack' ? '#ffd23f' : '#ffffff'; ctx.fillRect(x - w / 2, y, Math.round(w * k), 5);
        ctx.fillStyle = '#e8433a'; ctx.fillRect(x - w / 2, y + 6, Math.round(w * left), 1);   // time left
        label(s.kind === 'snack' ? 'INTERRUPT!' : 'STAGGER HIM!', x, y - 3, s.kind === 'snack' ? '#ffe066' : '#ffffff');
      } else if (m.exposedT > 0) {
        for (let i = 0; i < 3; i++) { const a = this.time * 6 + i * TAU / 3; ctx.fillStyle = '#ffe066'; ctx.fillRect(Math.round(x + Math.cos(a) * 12) - 1, Math.round(y + 2 + Math.sin(a) * 4) - 1, 3, 3); }
        label('DIZZY! x1.5 DAMAGE', x, y - 4, '#ffe066');
      }
    }
    const P = this.P;
    if (P.alive && P.frost > 0 && this.state === 'fight') {
      const x = Math.round(P.x), y = Math.round(P.y - P.h - 16);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = OUTLINE; ctx.fillRect(x - 13 + i * 5, y - 1, 5, 5);
        ctx.fillStyle = i < P.frost ? '#bff0ff' : '#2a2638'; ctx.fillRect(x - 12 + i * 5, y, 3, 3);
      }
      if (P.frost >= 3) label('SWAP TO THAW', x, y - 3, '#bff0ff');
    }
  }
});
