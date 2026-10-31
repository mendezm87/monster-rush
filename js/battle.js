// One room of a run: your active Coreature against 0-3 wild Coreatures.
// The Battle class is spread over a few files, all plain scripts loaded in this order:
//   mon.js     shared helpers and Mon (one Coreature)
//   ai.js      AI, the CPU brain for wild Coreatures (and the test bots)
//   battle.js  Battle: room flow, exploring, doors, loot, XP, the update loop, movement
//   combat.js  Battle's moves: using them, hits, statuses, actions, projectiles, zones
//   render.js  Battle's effects and drawing, plus sprite tints and item icons

// Copies a class body's methods onto another class, so one big class can live in
// several files: mixInto(Battle, class { ...methods... }).
function mixInto(target, src) {
  for (const k of Object.getOwnPropertyNames(src.prototype)) {
    if (k !== 'constructor') Object.defineProperty(target.prototype, k, Object.getOwnPropertyDescriptor(src.prototype, k));
  }
}

// ------------------------------------------------------------------ Room
// One room of a floor. The player's party lives on the run; wild Coreatures are made
// when an uncleared room is entered. hooks: exit(dir), stairs(), recruit(pedestal), end(result).
// The Restore moment's timeline in seconds (see Battle.startRestore): glowing, swirling apart,
// building the new form, and when it ends.
const RESTORE_T = { glow: 0.6, swirl: 1.3, build: 2.0, end: 3.5 };
// The Coreature's own pixels, as glowing data that swirls away and back (one per sprite pixel).
function restorePixels(m) {
  const sp = monSprite(m), img = sp.views[viewKey(sp.views, m.view, m.face)] || sp.views.front, S = sp.size * SPR_SCALE * m.scale, k = S / sp.size;
  const w = img.width, h = img.height, data = img.getContext('2d').getImageData(0, 0, w, h).data, out = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = (y * w + x) * 4;
    if (data[a + 3] < 128) continue;
    const wx = m.x + (x - w / 2) * k * (isSideView(m.view) && m.face < 0 ? -1 : 1), wy = m.y + 3 - (h - y) * k;
    const dx = wx - m.x, dy = wy - m.cy;
    out.push({ x0: wx, y0: wy, ang: Math.atan2(dy, dx), r0: Math.hypot(dx, dy), spin: rand(2.5, 4.5) * (Math.random() < 0.5 ? -1 : 1),
      lift: rand(18, 42), out: rand(16, 46), size: k, t: 0,
      color: `rgb(${data[a]},${data[a + 1]},${data[a + 2]})` });
  }
  return out;
}

// The colours of the dust Coreatures kick up (Battle.dust, and the thud when one faints).
const DUST = ['#d8ccb0', '#b8a888', '#ece4d0'];

// The dodge (r290): how long the dart lasts, how fast it goes (about 70 units), how long nothing can hit, the recharge,
// and how long a press made mid-attack is kept.
const DODGE = { dur: 0.17, speed: 420, safe: 0.24, cd: 0.7, queue: 0.4 };

class Battle {
  constructor({ run, room, entry = null, ui, hooks = {} }) {
    this.run = run; this.room = room; this.ui = ui; this.hooks = hooks;
    this.F = roomField(room);
    const built = roomCanvas(room, run.stageKey);
    this.ground = built.canvas; this.stage = built.stage;
    if (!room.decal) { room.decal = document.createElement('canvas'); room.decal.width = room.w; room.decal.height = room.h; }
    this.decal = room.decal; this.dctx = this.decal.getContext('2d');
    this.look = trainerLook(run.trainer, run.look);   // pixel.js: which of the 8 trainer looks
    this.trainerImg = Object.fromEntries(TRAINER_VIEWS.map(v => [v, trainerCanvas(this.look, v)]));
    this.trainerWalk = Object.fromEntries(TRAINER_VIEWS.map(v => [v, trainerWalk(this.look, v)]));
    this.projectiles = []; this.zones = []; this.hazards = []; this.particles = []; this.floats = []; this.texts = []; this.deploys = [];
    this.pickups = room.pickups;
    this.weather = Array.from({ length: 70 }, () => this.newFlake(true));
    this.state = 'explore'; this.stateT = 0; this.time = 0;
    this.shake = 0; this.hitstop = 0; this.enemyAtkT = 0; this.winT = 0;
    this.e = [];
    this.pedestals = [];
    this.stairs = null; this.stairsAlt = null;   // the way down: one staircase, or a pair with an area each (r295)
    room.visited = true;

    // walk in through the doorway we came from (or stand in the middle of the start room)
    const P = this.P;
    P.reset(); P.visible = true;
    const F = this.F;
    let px = (F.x0 + F.x1) / 2, py = (F.y0 + F.y1) / 2 + 20, tx = px - 46, ty = py - 8;   // the trainer stands beside and a little behind
    if (entry) {
      const d = doorPos(room, entry), [dx, dy] = DOOR_DIRS[entry];
      px = d.x - dx * 46; py = d.y - dy * 46 + (dy === 0 ? 10 : 0) + (entry === 'n' ? P.r : 0);
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
    if (room.type === 'secret' && !room.looted) {   // a secret room's stash (r281)
      room.looted = true;
      const F = this.F, x = (F.x0 + F.x1) / 2, y = (F.y0 + F.y1) / 2;
      for (let i = 0; i < 8 + this.run.floorN * 2; i++) this.spawnPickup('coin', x, y);
      this.spawnPickup('chest', x, y);
      this.ui.banner('SECRET ROOM!', 'Something was hidden here');
    }
    this.secretT = 0;
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
  // does this Coreature's side have the relic? (relics only help your party)
  relic(m, id) { return m.side === 'player' && this.run.relics.includes(id); }
  // a number from the relics you hold (RELICS[id].mods): ...Mul names multiply, others add; m = null for the party as a whole
  // (plus, for a Coreature, the relics fused into it at the altar)
  mod(m, key, base = key.endsWith('Mul') ? 1 : 0) {
    if (m && m.side !== 'player') return base;
    let v = base;
    const add = mods => { const x = mods && mods[key]; if (x !== undefined) v = key.endsWith('Mul') ? v * x : v + x; };
    for (const id of this.run.relics) add(RELICS[id].mods);
    if (this.run.perk) add(this.run.perk.mods);   // the trainer's power
    if (m) for (const id of m.fused || []) add(RELICS[id].fused.mods);
    return v;
  }
  // tell the relics something happened (RELICS[id].on[event]); only your side's relics act
  emit(event, m, ...args) {
    if (m && m.side !== 'player') return;
    if (event !== 'clear' || !m) {
      for (const id of this.run.relics) { const f = RELICS[id].on && RELICS[id].on[event]; if (f) f(this, m, ...args); }
      const tp = this.run.perk && this.run.perk.on && this.run.perk.on[event]; if (tp) tp(this, m, ...args);   // the trainer's power
    }
    if (m) for (const id of m.fused || []) { const f = RELICS[id].fused.on && RELICS[id].fused.on[event]; if (f) f(this, m, ...args); }
  }

  // Who a Coreature attacks: wild Coreatures go for you, your moves aim at the nearest wild Coreature.
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
  // Everything a Coreature's attacks can hit.
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
      } while (tries++ < 40 && (Math.hypot(x - P.x, y - P.y) < 170 || this.e.some(o => Math.hypot(o.x - x, o.y - y) < 60) || this.unblock({ x, y }, 18)));
      if (spec.champ === 'glitch') { m.glitched = true; m.setDef(m.def); m.hp = m.maxHp; m.gear = ['glitch']; }   // already corrupted
      m.baseId = spec.id; m.gate = !!spec.gate;   // what it was when the fight started (a boss may change form); a gatekeeper
      if (spec.glitch && typeof bossGlitch === 'function') bossGlitch(m);   // a Glitched boss (bosses.js)
      if (spec.script && typeof BossBrain === 'function') m.ai = m.brain = new BossBrain(m, spec.script);   // a hand-made boss drives itself
      m.x = x; m.y = y; m.face = x < P.x ? 1 : -1;
      m.spawnT = 0.7 + i * 0.35;
      return m;
    });
    this.state = 'fight'; this.stateT = 0;
    if (typeof codexNote === 'function') codexNote('seen', ...this.e.map(m => m.id));   // the codex (codex.js, r283)
    this.emit('fightStart', P);   // e.g. Gambler's Die picks this room's lucky move
    this.doorFx('close');
    if (this.boss) {
      if (typeof bossIntro === 'function') bossIntro(this, this.boss);   // bosses.js: its banner, by kind
      else this.ui.banner(this.boss.final ? 'FINAL BOSS!' : 'BOSS!', this.boss.final ? this.boss.def.name : '');
    }
  }

  clearRoom() {
    this.room.cleared = true;
    this.run.stats.rooms++;
    this.trainerAct(this.boss ? 'victory' : 'cheer', this.P);
    this.emit('clear', null);   // e.g. Rain Bell
    for (const m of this.run.party) if (m.fused && m.fused.length) this.emit('clear', m, true);
    this.evolveReady();
    this.glitchReady();
    if (this.boss && this.hooks.bossBeaten) this.hooks.bossBeaten(this.boss.baseId || this.boss.id, this.boss.brain && this.boss.brain.id);
    this.state = 'explore'; this.stateT = 0;
    this.projectiles = this.projectiles.filter(p => p.owner.side === 'player');
    this.zones = this.zones.filter(z => z.owner.side === 'player');
    this.hazards = [];
    this.doorFx('open');
    if (this.room.type === 'boss') {
      if (!this.run.endless && this.run.floorN >= RUN_FLOORS) {
        this.ui.banner('RUN CLEARED!');
        this.winT = 2.6;   // a moment to enjoy it before the results
      } else {
        this.ui.banner('FLOOR CLEARED!');
        this.placeStairs();
        Sfx.music.play(floorSong(this.run));
      }
    } else {
      this.ui.banner('ROOM CLEAR!');
      if (this.room.reward) this.spawnReward(this.room.reward);
    }
  }

  // A challenge room's next wave (r281): the doors stay shut until the last one falls.
  nextWave() {
    const room = this.room, n = room.waveN - room.waves.length + 1;
    room.enemies = room.waves.shift();
    this.startFight();
    this.ui.banner(`WAVE ${n}/${room.waveN}`, n === room.waveN ? 'The last one!' : '');
  }

  // A secret room's door opens when you press against the cracked wall in front of it (r281).
  revealSecret() {
    const room = this.room, S = room.secret, other = this.run.floor.rooms[S.i];
    if (!other) return;
    room.doors[S.dir] = other; other.hiddenRoom = false; delete room.secret;
    freeCanvas(room.canvas); freeCanvas(room.decor); delete room.canvas; delete room.decor; delete room.torches;
    const built = roomCanvas(room, this.run.stageKey); this.ground = built.canvas;
    const d = doorPos(room, S.dir);
    this.burst(d.x, d.y, ['#c8b8a0', '#8a7a68', '#ffffff'], 30, 140); this.addShake(6);
    Sfx.play('doorOpen'); this.ui.banner('A HIDDEN DOOR!', 'There was a room behind the crack');
  }

  // Things to walk up to: recruits, shop goods, a treasure relic.
  makePedestals() {
    const room = this.room, F = this.F, cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2;
    this.pedestals = [];
    if (room.type === 'recruit' && !room.recruited)
      this.pedestals = room.offer.map((id, i) => ({ kind: 'mon', id, x: cx + (i - (room.offer.length - 1) / 2) * (room.offer.length > 3 ? 100 : 120), y: cy - 6, cool: 0 }));
    if (room.type === 'shop')
      // (r273) not a relic you already have: a chest on the floor can offer one the shop sells too, and buying it again took your coins for nothing
      room.stock.forEach((it, i) => { if (!it.sold && !(RELICS[it.id] && this.run.relics.includes(it.id))) this.pedestals.push({ kind: 'shop', item: it, id: it.id, x: cx + (i - 1.5) * 100, y: cy - 6, cool: 0 }); });
    if (room.type === 'altar' && !room.used)
      this.pedestals = [{ kind: 'altar', id: 'altar', x: cx, y: cy - 6, cool: 0 }];
    if (room.type === 'rest') this.pedestals = [{ kind: 'rest', id: 'rest', used: !!room.rested, x: cx, y: cy - 6, cool: 0 }];   // (r281)
    if (room.type === 'tutor' && !room.taught) this.pedestals = [{ kind: 'tutor', id: 'tutor', price: room.price, x: cx, y: cy - 6, cool: 0 }];
    if (room.type === 'treasure' && !room.taken && room.relic && !room.relicChoice)   // a picnic (every relic owned), or a run saved before r159
      this.pedestals = [{ kind: 'relic', id: room.relic, x: cx, y: cy - 6, cool: 0 }];
    // a choice of relics (the treasure room, or a chest that was opened here): take one and the others vanish
    const ch = room.relicChoice;
    if (ch && !ch.taken) {
      const n = ch.ids.length, x0 = clamp(ch.x ?? cx, F.x0 + 40 + (n - 1) * 40, F.x1 - 40 - (n - 1) * 40), y0 = clamp(ch.y ?? cy - 6, F.y0 + 40, F.y1 - 30);
      ch.ids.forEach((id, i) => this.pedestals.push({ kind: 'relic', id, choice: true, x: x0 + (i - (n - 1) / 2) * 80, y: y0, cool: 0.6 }));
    }
  }

  // The stairs down (r295): a pair, one for each of the next floor's act's areas (actAreas), signed with the area's name,
  // so the player picks the route; one staircase when the act has one area.
  placeStairs() {
    const F = this.F, cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2, areas = typeof actAreas === 'function' ? actAreas(this.run.floorN + 1) : [null];
    if (areas.length > 1) { this.stairs = { x: cx - 60, y: cy, stage: areas[0] }; this.stairsAlt = { x: cx + 60, y: cy, stage: areas[1] }; }
    else { this.stairs = { x: cx, y: cy, stage: areas[0] }; this.stairsAlt = null; }
  }

  // Coreatures whose bar is full Restore into their next form (between fights, so moves don't change
  // mid-combo). In the world's story they're living data from a fallen civilization: every bit of data
  // they recover brings back more of their old selves, until they're whole enough to take back a
  // stronger form.
  evolveReady() {
    for (const m of this.p) {
      if (!m.canEvolve || this.restoring) continue;
      if (m === this.P && m.visible) { this.startRestore(m); continue; }   // the one that's out gets the full moment
      const from = m.def.name, to = evolveTarget(m.def, this.run);   // a benched one Restores quietly
      m.setDef(to); m.restorePending = false; m.mastery = 0;
      m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.25));
      this.ui.banner(`${from} RESTORED!`, `Its lost data came back: it's ${to.name} again`);
      this.run.stats.evolved = (this.run.stats.evolved || 0) + 1;
      Sfx.play('evolve');
    }
  }

  // The Restore moment (about 3.4 s, everything else waits): the room dims to a spotlight while the
  // Coreature glows and charges (RESTORE_T.glow); it breaks into its own pixels, which swirl up
  // around it as glowing data (.swirl); they swirl back in while the new form assembles from the
  // feet up (.build); then a flash, a burst in its type's colours and its new name, big
  // (.card), and the room fades back in. Drawn by drawRestore (render.js).
  startRestore(m) {
    m.restorePending = false;
    this.restoring = { m, t: 0, from: m.def, to: evolveTarget(m.def, this.run), pixels: [], broke: false, built: false };
    this.trainerAct('brace', m);
    Sfx.beamCharge(RESTORE_T.glow);
  }
  updateRestore(dt) {
    const R = this.restoring, m = R.m;
    R.t += dt;
    if (!R.broke && R.t >= RESTORE_T.glow) {   // it breaks apart into its own pixels
      R.broke = true;
      R.pixels = restorePixels(m);
      m.setDef(R.to); m.mastery = 0;
      m.restoreHide = true;
      this.addShake(2.5);
      Sfx.play('recall');
    }
    if (R.broke && !R.building && R.t >= RESTORE_T.swirl) {   // the new form starts to assemble
      R.building = true; m.restoreHide = false; m.assembleT = 0;
      Sfx.play('deploy');
    }
    if (R.broke && !R.built && R.t >= RESTORE_T.swirl) m.assembleT = Math.min(1, (R.t - RESTORE_T.swirl) / (RESTORE_T.build - RESTORE_T.swirl));
    if (!R.built && R.t >= RESTORE_T.build) {   // the payoff
      R.built = true; m.assembleT = undefined; m.flash = 0.6;
      m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.25));
      const col = TYPES[m.def.types[0]].color, fx = TYPES[m.def.types[0]].fx;
      this.particles.push({ x: m.x, y: m.y - 2, r0: 6, r1: 70, life: 0.7, max: 0.7, color: '#ffffff', kind: 'ring', w: 4 });
      this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: 52, life: 0.55, max: 0.55, color: col, kind: 'ring', w: 3 });
      this.burst(m.x, m.cy, ['#ffffff', ...fx], 60, 150, -50);
      this.addShake(7);
      this.run.stats.evolved = (this.run.stats.evolved || 0) + 1;
      Sfx.play('evolve');
      this.trainerAct('victory');
      this.ui.onSendOut('player', m);
    }
    for (const p of R.pixels) p.t += dt;
    if (R.t >= RESTORE_T.end) { this.restoring = null; this.evolveReady(); }
  }

  // Fully corrupted Coreatures turn Glitched once a room is cleared: Glitch type, the Glitched look,
  // more attack, less HP, and Fatal Error to put in a slot (glitchDef, GLITCH in dungeon.js).
  glitchReady() {
    for (const m of this.p) {
      if (!m.glitchPending || m.glitched) continue;
      m.glitchPending = false; m.glitched = true;
      m.setDef(m.def);
      if (!m.known.includes(GLITCH.move)) { m.known.push(GLITCH.move); this.run.learnQueue.push({ mon: m, id: GLITCH.move }); }
      this.run.dress();
      this.ui.banner(`${m.def.name} GLITCHED!`, 'Corrupted data: Glitch type, +20% attack, -15% HP, and Fatal Error');
      Sfx.play('recall');
      if (m === this.P && m.visible) {
        m.flash = 0.8;
        for (let k = 0; k < 2; k++) this.particles.push({ x: m.x, y: m.y - 2, r0: 4 + k * 10, r1: 56 + k * 12, life: 0.6, max: 0.6, color: k ? '#3af0ff' : '#ff3ad8', kind: 'ring', w: 3 });
        this.burst(m.x, m.cy, ['#ff3ad8', '#3af0ff', '#ffffff', '#15111f'], 50, 130, -30);
        this.addShake(5);
        this.ui.onSendOut('player', m);
      }
      this.ui.hudCache = {};
    }
  }
  // The altar can wash the corruption out: back to its own types and stats, Fatal Error forgotten.
  cleanse(m) {
    m.glitched = false; m.glitchPending = false; m.corrupt = 0;
    m.setDef(ROSTER_BY_ID[m.id]);
    m.known = m.known.filter(k => k !== GLITCH.move);
    if (m.moves.some(x => x.id === GLITCH.move)) {
      const ids = m.moves.map(x => x.id), spare = m.known.find(k => !ids.includes(k));
      m.setMoves(ids.map(k => (k === GLITCH.move ? spare : k)).filter(Boolean));
    }
    this.run.learnQueue = this.run.learnQueue.filter(q => !(q.mon === m && q.id === GLITCH.move));
    this.run.dress();
    this.ui.banner(`${m.def.name} CLEANSED!`, 'Its corrupted data is gone');
    Sfx.play('evolve');
    if (m === this.P) {
      m.flash = 1.2;
      this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: 60, life: 0.7, max: 0.7, color: '#ffffff', kind: 'ring', w: 3 });
      this.burst(m.x, m.cy, ['#ffffff', '#c87aff', '#a8f0ff'], 40, 110, -40);
      this.ui.onSendOut('player', m);
    }
  }

  // The evolution altar: the offered relics are gone for good, and the Coreature becomes the legend
  // its element picked (LEGENDS in data.js). Its moves change slot by slot, like any evolution.
  altarEvolve(m, def, relics) {
    this.run.relics = this.run.relics.filter(id => !relics.includes(id));
    m.fused = [...(m.fused || []), ...relics];   // they live on inside it, stronger
    const from = m.def.name;
    m.setDef(def); m.hp = m.maxHp;
    this.run.applyRelics();   // stat bonuses and gear, without what was offered
    this.ui.banner(`${from} BECAME ${def.name}!`);
    this.run.stats.evolved = (this.run.stats.evolved || 0) + 1;
    Sfx.play('evolve');
    if (m === this.P) {
      m.flash = 1.6;
      for (let k = 0; k < 3; k++) this.particles.push({ x: m.x, y: m.y - 2, r0: 4 + k * 8, r1: 60 + k * 14, life: 0.7 + k * 0.15, max: 0.7 + k * 0.15, color: k ? '#c87aff' : '#ffffff', kind: 'ring', w: 3 });
      this.burst(m.x, m.cy, ['#ffffff', '#c87aff', '#ffe066'], 60, 140, -40);
      this.addShake(6);
      this.ui.onSendOut('player', m);
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

  // Beam the active Coreature out of the trainer's Arcbracer (on arrival, after a faint, on a swap), next to the trainer.
  sendOut(at) {
    const m = this.P;
    m.reset();
    const t = this.trainer, F = this.F;
    const pos = at || { x: t.x + (t.x < (F.x0 + F.x1) / 2 ? 24 : -24), y: t.y + (t.y < (F.y0 + F.y1) / 2 ? 18 : -18) };
    m.x = clamp(pos.x, F.x0 + m.r, F.x1 - m.r); m.y = clamp(pos.y, F.y0 + m.r, F.y1 - 2);
    this.unblock(m, m.r);
    m.face = 1;
    // a deploy: the beam reaches the ground (`beam` s), then the Coreature assembles pixel by pixel (see updateDeploys)
    this.deploys.push({ from: { x: t.x, y: t.y - 24 }, to: { x: m.x, y: m.y - 2 }, t: 0, beam: 0.16, color: TYPES[m.def.types[0]].color });
    this.trainerAct('deploy', m);
    this.ui.onSendOut('player', m);
    Sfx.play('deploy');
  }

  // Mid-fight swap: the fight keeps running while the new Coreature is deployed,
  // so you are briefly open to attack.
  canSwap(side, idx) {
    return (this.state === 'fight' || this.state === 'explore') && this.run.swapCd <= 0 && idx !== this.pi &&
      this.p[idx] && !this.p[idx].fainted && !this.deploys.length && this.P.visible;
  }

  swap(side, idx) {
    if (!this.canSwap(side, idx)) return false;
    const out = this.P;
    const at = { x: out.x, y: out.y };
    out.action = null; out.visible = false; out.ghosts = [];
    this.recall(out);
    this.pi = idx;
    // out of a fight, swapping is free
    this.run.swapCd = (this.state === 'fight' ? 8 : 0.5) * this.mod(null, 'swapCdMul');
    const inc = this.P;
    this.ui.callout('player', `Go, ${inc.def.name}`, inc.def.types[0]);
    this.sendOut(at);
    this.emit('swapIn', inc);   // e.g. the Relay Runner's Tag Team
    return true;
  }

  // A Coreature turns back into data and streams into the trainer's Arcbracer.
  recall(m) {
    const tp = this.trainer, col = TYPES[m.def.types[0]].color, bx = tp.x, by = tp.y - 14;
    this.particles.push({ x: bx, y: by, g: tp.y, x2: m.x, y2: m.cy, k2: m.y - m.cy, life: 0.3, max: 0.3, color: col, kind: 'line' });
    for (let i = 0; i < 22; i++) {
      const x = m.x + rand(-m.r, m.r), y = m.cy + rand(-m.h * 0.45, m.h * 0.45), k = rand(2.4, 3.4);
      this.particles.push({ kind: 'sq', x, y, vx: (bx - x) * k, vy: (by - y) * k, life: 0.32, max: 0.32, size: 2, color: i % 3 ? col : '#ffffff' });
    }
    Sfx.play('recall');
  }

  // The active Coreature was changed from a menu (recruit swap-in, release): put the new one where the old one stood.
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
    // it comes apart into its data: pixels lifting off
    const fc = TYPES[m.def.types[0]].color;
    for (let i = 0; i < 18; i++) this.particles.push({ kind: 'sq', x: m.x + rand(-m.r, m.r), y: m.cy + rand(-m.h * 0.4, m.h * 0.4), vx: rand(-12, 12), vy: rand(-60, -25), life: 0.8, max: 0.8, size: 2, color: i % 3 ? fc : '#ffffff' });
    this.burst(m.x, m.cy, ['#ffffff', '#cfd6e6'], 26, 90);
    if (m.side === 'enemy') {
      this.run.stats.kos++;
      this.emit('ko', this.P, m);   // e.g. Data Leech
      this.dropLoot(m);
      this.giveData(Math.round((m.boss ? DATA_BOSS : m.scale > 1 ? DATA_TOUGH : DATA_WILD) * (m.champ && this.run.floor.twist === 'cursed' ? 1.5 : 1)));   // (a cursed floor's champions are worth more, r282)
      if (m.champ === 'split') this.splitChampion(m);
      return;
    }
    this.ui.banner(`${m.def.name} FAINTED!`);
    this.trainerAct('crouch', m);
    for (const e of this.e) e.action = null;
    this.projectiles = []; this.zones = []; this.hazards = [];
    this.state = 'faint'; this.stateT = 0;
  }

  resolveFaint() {
    if (!this.p.some(m => !m.fainted)) { this.end('lose'); return; }
    this.state = 'pick';
    this.ui.pickNext(this.p, idx => {
      this.pi = idx;
      // back to the fight; also when the last wild Coreature fell in the same moment (the room then clears the usual way,
      // with its reward and stairs: r296, it used to go straight to exploring with the boss room never cleared, a stuck run)
      this.state = this.e.some(m => !m.fainted) || (this.e.length && !this.room.cleared) ? 'fight' : 'explore';
      this.stateT = 0;
      this.sendOut();
    });
  }

  end(result) {
    if (this.state === 'over') return;
    this.state = 'over';
    Sfx.music.stop(0.6);
    this.trainerAct(result === 'win' ? 'victory' : 'slump');
    setTimeout(() => Sfx.play(result === 'win' ? 'win' : 'lose'), 500);
    if (this.hooks.end) this.hooks.end(result);
  }

  // ---------------------------------------------------------- data (restoring)
  giveData(amount) {
    for (const ev of this.run.giveData(amount)) {
      const m = ev.mon, heal = Math.round(m.maxHp * RS_HEAL);
      m.hp = Math.min(m.maxHp, m.hp + heal);
      const what = m.def.evolve ? 'DATA COMPLETE!' : 'FULLY RESTORED!';
      if (m === this.P) {
        this.text(m.x, m.y - m.h - 14, what, '#ffe066');
        this.burst(m.x, m.cy, ['#ffe066', '#ffffff', '#5ae8ff'], 20, 60, -50);
        this.particles.push({ x: m.x, y: m.y - 2, r0: 4, r1: 30, life: 0.4, max: 0.4, color: '#5ae8ff', kind: 'ring', w: 2 });
      } else {
        const t = this.trainer;
        this.text(t.x, t.y - 50, `${m.def.name}: ${what}`, '#ffe9a0');
      }
      Sfx.play('levelUp');
    }
    if (this.state === 'explore') this.evolveReady();
  }

  // A splitting champion breaks into two small copies of itself.
  splitChampion(m) {
    const F = this.F;
    for (const s of [-1, 1]) {
      const c = new Mon(m.def, 'enemy', { hpMul: m.hpMul * 0.4, atkMul: m.atkMul * 0.7, scale: 0.75, small: true, ai: 'wild' });
      c.ai = new AI(WILD_AI.wild);
      c.x = clamp(m.x + s * 22, F.x0 + 12, F.x1 - 12); c.y = clamp(m.y + rand(-8, 8), F.y0 + 12, F.y1 - 8);
      c.face = s; c.spawnT = 0.25;
      this.e.push(c);
    }
    this.text(m.x, m.y - m.h - 10, 'SPLIT!', CHAMPIONS.split.color);
  }

  // Spiky champions hurt to touch; shiny ones glitter.
  updateChampions(dt) {
    const P = this.P;
    P.spikeT = Math.max(0, (P.spikeT || 0) - dt);
    for (const m of this.e) {
      if (!m.alive || !m.champ) continue;
      if (m.champ === 'glitch' && Math.random() < dt * 6) this.sparks(m.x + rand(-m.r, m.r), m.cy + rand(-m.h / 2, m.h / 2), 1, Math.random() < 0.5 ? '#ff3ad8' : '#3af0ff');
      if (m.champ === 'shiny' && Math.random() < dt * 8) this.sparks(m.x + rand(-m.r, m.r), m.cy + rand(-m.h / 2, m.h / 2), 1, '#ffe066');
      if (m.champ === 'spiky' && P.alive && P.spikeT <= 0 && Math.hypot(P.x - m.x, P.y - m.y) < P.r + m.r + 3) {
        P.spikeT = 0.7;
        this.hit(m, P, SPIKE_MV, 1, { force: 140 });
      }
    }
  }

  // ---------------------------------------------------------- loot
  dropLoot(m) {
    let coins = m.boss ? 8 + this.run.floorN * 2 : m.scale > 1 ? 2 : (this.run.floorN === 1 || Math.random() < 0.5 ? 1 : 0);   // rooms give the rest (spawnReward); floor 1 always a coin (r292)
    if (this.run.floor.twist === 'stampede' && !m.boss) coins++;   // a stampede's spoils (r282)
    const cm = this.mod(null, 'coinMul');
    if (cm !== 1) coins = Math.round(coins * cm + Math.random() * 0.5);
    for (let i = 0; i < coins; i++) this.spawnPickup('coin', m.x, m.y);
    if (m.boss || Math.random() < 0.12 * this.mod(null, 'berryOddsMul')) this.spawnPickup('berry', m.x, m.y);
    if (m.champ === 'shiny') { for (let i = 0; i < 10; i++) this.spawnPickup('coin', m.x, m.y); this.spawnPickup('chest', m.x, m.y); }
    if (m.champ === 'glitch') this.spawnPickup('glitchShard', m.x, m.y);
    if (m.bossGlitch) { for (let i = 0; i < 2; i++) this.spawnPickup('glitchShard', m.x, m.y); this.spawnPickup('chest', m.x, m.y); }   // a Glitched boss's spoils
  }

  // the room's reward (shown over its doors) pops out in the middle once it's cleared
  spawnReward(kind) {
    const F = this.F, x = (F.x0 + F.x1) / 2, y = (F.y0 + F.y1) / 2;
    if (kind === 'coins') for (let i = 0; i < 5 + this.run.floorN; i++) this.spawnPickup('coin', x, y);
    if (kind === 'berries') for (let i = 0; i < 2 + this.mod(null, 'roomBerries'); i++) this.spawnPickup('berry', x, y);
    if (kind === 'xp') this.spawnPickup('shard', x, y);
    if (kind === 'move') this.spawnPickup('disc', x, y);
    if (kind === 'chest') this.spawnPickup('chest', x, y);
    if (kind === 'glitch') this.spawnPickup('glitchShard', x, y);
  }

  spawnPickup(kind, x, y) {
    const a = rand(0, TAU), s = rand(30, 90);
    this.pickups.push({ kind, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, z: 4, vz: rand(90, 150), t: 0 });
  }

  updatePickups(dt) {
    const P = this.P, F = this.F;
    for (const k of this.pickups) {
      k.t += dt;
      if (k.z > 0 || k.vz > 0) {   // bouncing out of the fainted Coreature
        k.vz -= 420 * dt; k.z += k.vz * dt;
        if (k.z <= 0) { k.z = 0; k.vz = k.vz < -60 ? -k.vz * 0.4 : 0; k.vx *= 0.6; k.vy *= 0.6; }
      } else { k.vx *= Math.exp(-dt * 6); k.vy *= Math.exp(-dt * 6); }
      // it drifts to you when you walk close
      const d = Math.hypot(P.x - k.x, P.y - k.y), reach = 56 * this.mod(P, 'magnetMul');   // (Magnet Core pulls from across the room)
      if (P.alive && k.t > 0.5 && d < reach && k.kind !== 'glitchShard') {   // a Corrupted Shard never comes to you: taking it is a choice
        const pull = 260 * Math.max(0.25, 1 - d / (reach * 1.25));
        k.vx += (P.x - k.x) / (d || 1) * pull * dt * 8; k.vy += (P.y - k.y) / (d || 1) * pull * dt * 8;
      }
      k.x = clamp(k.x + k.vx * dt, F.x0 + 4, F.x1 - 4); k.y = clamp(k.y + k.vy * dt, F.y0 + 4, F.y1 - 2);
      this.unblock(k, 12);   // pickups settle a little way off obstacles, never tucked into a corner
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
    } else if (k.kind === 'shard') {   // data for the party (the Coreature that's out gets it all)
      this.ui.banner('ARC-CORE SHARD!', 'Scraps of old data for the party');
      Sfx.play('levelUp');
      this.giveData(15 + 3 * this.run.floorN);
    } else if (k.kind === 'glitchShard') {   // lots of data, but it corrupts the one that takes it
      this.giveData(Math.round((15 + 3 * this.run.floorN) * GLITCH.data));
      if (P.glitched) this.ui.banner('CORRUPTED SHARD!', `${P.def.name} is already Glitched: just the data`);
      else {
        this.run.corruptMon(P, GLITCH.shard);
        this.ui.banner('CORRUPTED SHARD!', P.glitchPending ? `${P.def.name} is fully corrupted: it will turn Glitched` : `Lots of data, but ${P.def.name} is ${P.corrupt}% corrupted`);
        this.text(P.x, P.y - P.h - 12, `+${GLITCH.shard}% CORRUPTED`, '#ff3ad8', P.y);
      }
      this.burst(k.x, k.y - 4, ['#ff3ad8', '#3af0ff', '#ffffff'], 14, 70, -20);
      Sfx.play('recall');
    } else if (k.kind === 'disc') {    // the Coreature that's out learns a new move
      const id = this.run.learnMove(P);
      if (id) { this.run.learnQueue.push({ mon: P, id }); this.ui.banner('MOVE DISC!'); }
      else { this.run.coins += 10; this.ui.banner('+10 COINS'); }
      Sfx.play('select');
    } else if (k.kind === 'chest') {   // a relic (or a picnic once you have them all)
      const free = Object.keys(RELICS).filter(id => !this.run.relics.includes(id));
      const open = this.room.relicChoice && !this.room.relicChoice.taken;
      if (free.length > 1 && !open) {   // a choice of relics, laid out where the chest was (r159)
        const F = this.F, up = k.y - 50 > F.y0 + 40;   // a little way from where you're standing, so you choose by walking up to one
        this.room.relicChoice = { ids: shuffle(free).slice(0, 3), x: k.x, y: up ? k.y - 50 : k.y + 50 };
        this.makePedestals();
        this.ui.banner('A CHEST OF RELICS!', 'Walk up to one and take it: the others vanish');
      } else if (free.length) { const id = pickRand(free); this.run.addRelic(id); this.ui.banner(`GOT ${RELICS[id].name}!`); }
      else { this.run.useGood('picnic'); this.ui.banner('PICNIC!'); }
      this.sparks(k.x, k.y - 4, 10, '#ffe066');
      Sfx.play('levelUp');
    } else {
      const heal = Math.round(Math.min(P.maxHp * BERRY_HEAL * this.mod(null, 'berryHealMul'), P.maxHp - P.hp));
      P.hp = Math.min(P.maxHp, P.hp + heal);
      this.number(P, heal, null, '#b6ff9a', '#4fae2e', '+');
      this.burst(P.x, P.cy, ['#4fae2e', '#b6ff9a', '#ffffff'], 14, 50, -50);
      Sfx.play('heal');
    }
  }

  // ---------------------------------------------------------- update
  update(dt) {
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    this.time += dt; this.stateT += dt;
    this.shake *= Math.exp(-dt * 9);
    this.updateWeather(dt);
    this.updateParticles(dt);
    this.updateDeploys(dt);
    if (this.restoring) { this.updateRestore(dt); return; }   // the Restore moment: everything else waits

    switch (this.state) {
      case 'explore':
      case 'fight': {
        this.run.stats.time += dt;
        this.run.swapCd -= dt; this.enemyAtkT -= dt;
        const P = this.P;
        if (this.dodgeQ > this.time) this.dodge(P);   // a dodge pressed mid-attack goes as soon as it can
        this.updateMon(P, dt, Input.dir(0));
        if (this.state === 'fight') {
          const held = Input.moves(0);
          for (let i = 0; i < 4; i++) if (held[i]) this.tryMove(P, i);
          this.emit('tick', P, dt);   // e.g. Thorn Collar
          if (P.echoMove != null && !this.foe(P)) P.echoMove = null;   // nothing left to aim at
          if (P.echoMove != null && P.alive && !P.action && P.gcd <= 0 && P.canAct()) {   // Echo Chamber: the move fires again
            const i = P.echoMove, cd = P.cd[i]; P.echoMove = null;
            if (P.moves[i]) { P.echoing = true; this.execute(P, i); P.echoing = false; P.cd[i] = cd; this.text(P.x, P.y - P.h - 14, 'ECHO!', '#c8e8ff', P.y); }
          }
        }
        if (this.relicFx && this.relicFx.length) this.relicFx = this.relicFx.filter(f => f.update(this, dt) !== false);   // relic effects that live a while (Phantom Step, Seedling)
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
        if (this.state === 'fight') this.updateChampions(dt);
        this.updateProjectiles(dt);
        this.updateZones(dt);
        if (this.state === 'fight' && this.updateHazards) this.updateHazards(dt);   // bosses.js
        if (this.state === 'faint') break;
        this.updatePickups(dt);
        if (this.state === 'fight' && this.e.length && this.e.every(m => m.fainted) && this.deploys.length === 0) { if (this.room.waves && this.room.waves.length) this.nextWave(); else this.clearRoom(); }
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
      if (m.fainted) {   // it topples; a thud of dust when it hits the ground
        const was = m.fadeT; m.fadeT += dt;
        if (was < 0.15 && m.fadeT >= 0.15 && m.visible !== false) { this.burst(m.x, m.y - 1, DUST, 10, 50, -12, 4); this.addShake(1.5); }
      } else this.dust(m, dt);
      m.ghosts.forEach(g => (g.t -= dt));
      m.ghosts = m.ghosts.filter(g => g.t > 0);
    }
    this.updateTrainer(dt);
    this.updateCamera(dt);
  }

  // The dodge (r290, the owner: "a way to dodge attacks like in Hades"): your Coreature darts a short way in the
  // direction you're pushing (or the way it faces) and nothing can hit it for a moment (DODGE.safe). It cuts a
  // quick cast or a dash attack short, but not a beam or a charged blast: pressed during one of those, it goes as soon as it
  // ends (within DODGE.queue). Wild Coreatures don't dodge.
  dodge(m) {
    if (m !== this.P || (this.state !== 'fight' && this.state !== 'explore') || this.restoring) return false;
    const now = this.time;
    if (m.action && (m.action.kind === 'cast' || m.action.kind === 'dash') && (m.dodgeCd || 0) <= 0 && !(m.dodgeT > 0) && m.stunT <= 0 && m.status !== 'frz') {
      m.action = null; animMark(m, 'done');   // a quick cast or a dash attack is cut short, like Hades (beams and charged blasts aren't)
    }
    if (!m.canAct() || (m.dodgeCd || 0) > 0 || m.dodgeT > 0) {   // not yet: keep it for a moment
      if (!(this.dodgeQ > now)) this.dodgeQ = now + DODGE.queue;
      return false;
    }
    this.dodgeQ = 0;
    const c = Input.dir(0);
    let dx = c.x, dy = c.y;
    if (Math.hypot(dx, dy) < 0.2) {   // standing still: the way it faces
      const f = m.face || 1, v = m.view;
      [dx, dy] = v === 'back' ? [0, -1] : v === 'side' ? [f, 0] : v === 'fside' ? [f, 0.7] : v === 'bside' ? [f, -0.7] : [0, 1];
    }
    m.dodgeDir = Math.atan2(dy, dx); m.dodgeT = DODGE.dur; m.dodgeCd = DODGE.cd;
    m.invuln = Math.max(m.invuln, DODGE.safe); m.ghostT = 0;
    m.look(dx, dy);
    this.burst(m.x, m.y - 1, DUST, 5, 40, -10, 3);
    Sfx.play('whoosh');
    return true;
  }

  // Dust kicked up by a Coreature on the ground: puffs behind it as it dashes or runs flat out (r110).
  dust(m, dt) {
    if (!m.visible || m.hover > 0 || (FLYERS[m.id] && m.status !== 'frz')) return;
    const dashing = m.action && m.action.kind === 'dash', sp = Math.hypot(m.vx, m.vy);
    if (!dashing && sp < m.speed() * 0.9) return;
    m.dustT = (m.dustT || 0) - dt;
    if (m.dustT > 0) return;
    m.dustT = dashing ? 0.05 : 0.3;                                  // a steady trail when dashing, a puff now and then when running
    this.burst(m.x - m.vx / (sp || 1) * m.r * 0.6, m.y - 1, DUST, dashing ? 2 : 1, 18, -14, 2);
  }

  updateSpawn(m, dt) {
    m.spawnT -= dt;
    if (m.spawnT > 0) return;
    m.visible = true; m.flash = 0.35; m.invuln = 0.4; animMark(m, 'pop');
    this.particles.push({ x: m.x, y: m.y, r0: 2, r1: 30, life: 0.35, max: 0.35, color: '#ffffff', kind: 'ring', w: 3 });
    this.burst(m.x, m.cy, ['#ffffff', '#d8d0e8', '#8a809a'], 22, 90);
    Sfx.play('pop');
  }

  // Out of a fight: doorways, the recruit pedestals and the stairs.
  checkExplore(dt) {
    const P = this.P, F = this.F;
    if (!P.alive) return;
    if (this.room.secret) {   // pressing against the cracked wall opens the secret room behind it (r281)
      const d = doorPos(this.room, this.room.secret.dir);
      this.secretT = Math.hypot(P.x - d.x, P.y - d.y) < 44 ? (this.secretT || 0) + dt : 0;
      if (this.secretT > 0.7) { this.secretT = 0; this.revealSecret(); }
    }
    const exit = P.y < F.y0 - 14 ? 'n' : P.y > F.y1 + 16 ? 's' : P.x < F.x0 - 14 ? 'w' : P.x > F.x1 + 14 ? 'e' : null;
    if (exit && this.room.doors[exit] && this.hooks.exit) { this.state = 'leaving'; this.hooks.exit(exit); return; }
    for (const ped of this.pedestals) {
      ped.cool -= dt;
      const d = Math.hypot(P.x - ped.x, P.y - ped.y);
      if (d < 18 + P.r) {   // solid: push the player back out
        const ux = (P.x - ped.x) / (d || 1), uy = (P.y - ped.y) / (d || 1);
        P.x = ped.x + ux * (18 + P.r); P.y = ped.y + uy * (18 + P.r);
        if (ped.cool <= 0 && (ped.kind === 'rest' || ped.kind === 'tutor')) { ped.cool = 1.5; this.useStation(ped); return; }   // (r281) no menu
        if (ped.cool <= 0 && this.hooks.offer) {
          ped.cool = 1.2;
          this.state = 'pick'; Input.reset();
          this.hooks.offer(ped);
          return;
        }
      }
    }
    for (const s of [this.stairs, this.stairsAlt]) if (s && Math.hypot(P.x - s.x, P.y - s.y) < 16 && this.hooks.stairs) {
      this.state = 'leaving';
      Sfx.play('stairs');
      this.hooks.stairs(s.stage);
    }
  }

  // The campfire (heals the party once) and the move tutor (coins for a move for the Coreature that's out).
  useStation(ped) {
    const P = this.P, run = this.run;
    if (ped.kind === 'rest') {
      if (ped.used) { this.text(ped.x, ped.y - 30, 'THE FIRE IS OUT', '#cfc8d8', ped.y); return; }
      ped.used = this.room.rested = true;
      for (const m of run.party) {
        if (m.fainted) { m.fainted = false; m.hp = Math.round(m.maxHp * 0.25); m.status = null; }
        else m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.4));
      }
      this.ui.banner('A GOOD REST', 'The party heals 40% (fainted ones get back up)');
      this.burst(ped.x, ped.y - 16, ['#ffd23f', '#ff8a3a', '#ffffff'], 24, 70, -40);
      this.trainerAct('cheer', ped); Sfx.play('heal');
      return;
    }
    if (run.coins < ped.price) { this.text(ped.x, ped.y - 30, `NEEDS ${ped.price} COINS`, '#ff9a8a', ped.y); Sfx.play('back'); return; }
    const id = run.learnMove(P);
    if (!id) { this.text(ped.x, ped.y - 30, `${P.def.name} KNOWS IT ALL`, '#cfc8d8', ped.y); return; }
    run.coins -= ped.price; this.room.taught = true;
    run.learnQueue.push({ mon: P, id });
    this.ui.banner('MOVE TUTOR', `${P.def.name} can learn a new move`);
    this.burst(ped.x, ped.y - 16, ['#5ae8ff', '#ffffff'], 20, 70);
    this.pedestals = this.pedestals.filter(o => o !== ped);
    Sfx.play('coin');
  }

  // Called once an offer menu closes. took: true if the player recruited / bought / took it.
  offerDone(ped, took) {
    this.state = 'explore';
    if (!took) return;
    if (ped.kind === 'mon') {
      this.room.recruited = true;
      for (const o of this.pedestals) this.burst(o.x, o.y - 20, o === ped ? ['#ffe066', '#ffffff'] : ['#ffffff', '#cfd6e6'], 20, 80);
      this.pedestals = [];
      Sfx.play('blip');
      return;
    }
    if (ped.kind === 'shop') ped.item.sold = true;
    if (ped.kind === 'relic' && ped.choice) {   // the other relics on offer vanish
      this.room.relicChoice.taken = true;
      if (this.room.type === 'treasure') this.room.taken = true;
      for (const o of this.pedestals) if (o.choice && o !== ped) this.burst(o.x, o.y - 16, ['#ffffff', '#cfd6e6'], 16, 70);
      this.pedestals = this.pedestals.filter(o => !o.choice);
    } else if (ped.kind === 'relic') this.room.taken = true;
    if (ped.kind === 'altar') this.room.used = true;
    this.burst(ped.x, ped.y - 16, ['#ffe066', '#ffffff', '#ffd23f'], 20, 80);
    this.pedestals = this.pedestals.filter(o => o !== ped);
    Sfx.play(ped.kind === 'shop' ? 'coin' : 'buff');
  }

  // The trainer acts something out (trainer.js TRAINER_ACTS), turned toward `at` (a Coreature or point).
  // A stronger reaction isn't cut short by a weaker one (a faint isn't replaced by a point).
  trainerAct(name, at = null) {
    const PRI = { look: 0, point: 1, brace: 2, wince: 2, deploy: 3, cheer: 3, crouch: 4, victory: 5, slump: 5 };
    const t = this.trainer, cur = t.act && trainerActFrame(t.act, this.time - t.actT) ? t.act : null;
    if (cur && PRI[cur] > PRI[name]) return;
    t.act = name; t.actT = this.time;
    if (at) {
      const dx = at.x - t.x, dy = at.y - t.y;
      if (Math.hypot(dx, dy) > 4) { t.view = viewFor(dx, dy, null, true) || t.view; if (Math.abs(dx) > 1) t.face = Math.sign(dx); }
    }
  }
  // The trainer follows a step behind your Coreature.
  updateTrainer(dt) {
    const t = this.trainer, P = this.P, F = this.F;
    const dx = P.x - t.x, dy = P.y - t.y, d = Math.hypot(dx, dy);
    // how far behind: more when the Coreature is above the trainer on screen, since the trainer
    // (about as tall as a big Coreature) is drawn in front of it then
    const gap = 46 + (dy < 0 ? 22 * -dy / (d || 1) : 0);
    t.moving = false;
    if (d > gap && this.state !== 'pick') {
      const step = Math.min(d - gap, Math.max(70, (d - gap) * 5) * dt);
      t.x += dx / d * step; t.y += dy / d * step;
      t.walkT += step; t.moving = step > 0.2;
      t.view = viewFor(dx, dy, t.view, true) || t.view;
      if (isSideView(t.view)) t.face = Math.sign(dx) || t.face;
    }
    t.x = clamp(t.x, F.x0 - 30, F.x1 + 30); t.y = clamp(t.y, F.y0 - 20, F.y1 + 30);
    if (d < 130) this.unblock(t, 8);   // round obstacles; far behind, it catches up straight through
    if (t.moving) { t.stillT = 0; if (t.act === 'look') t.act = null; }
    else if ((t.stillT = (t.stillT || 0) + dt) > 4 && !t.act && this.state === 'explore' && Math.random() < dt * 0.25) this.trainerAct('look');
    if (t.act && !trainerActFrame(t.act, this.time - t.actT)) t.act = null;
  }

  updateCamera(dt) {
    const P = this.P, room = this.room;
    const tx = clamp(P.x - W / 2, 0, room.w - W), ty = clamp(P.cy - H / 2 - 10, 0, room.h - H);
    const k = dt >= 1 ? 1 : Math.min(1, dt * 8);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
  }

  // keep Coreatures settling (knockback decay) while the fight is paused by a transition
  idle(dt) {
    for (const m of this.mons) {
      if (!m.visible) continue;
      const B = this.bounds(m);
      m.vx *= Math.exp(-dt * 10); m.vy *= Math.exp(-dt * 10);
      m.kx *= Math.exp(-dt * 7); m.ky *= Math.exp(-dt * 7);
      m.x = clamp(m.x + (m.vx + m.kx) * dt, B.x0, B.x1);
      m.y = clamp(m.y + (m.vy + m.ky) * dt, B.y0, B.y1);
      this.unblock(m, m.r);
      m.flash = Math.max(0, m.flash - dt);
    }
  }

  // obstacles: none unless obstacles.js is loaded (it replaces these)
  get obstacles() { return []; }
  unblock() { return false; }
  floorHazard() { return null; }
  beamReach(m, dir, mv) { return mv.len; }

  // Where a Coreature's feet may go: the room floor, plus open doorways for the player.
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
    m.invuln -= dt; m.gcd -= dt; m.stunT -= dt; m.slowT -= dt; if (m.dodgeCd > 0) m.dodgeCd -= dt;
    for (let i = 0; i < 4; i++) m.cd[i] = Math.max(0, m.cd[i] - dt);
    m.buffs.forEach(b => (b.t -= dt));
    m.buffs = m.buffs.filter(b => b.t > 0);
    if (m.item.regen && !m.brain && m.hp > 0 && this.state === 'fight') m.hp = Math.min(m.maxHp, m.hp + m.maxHp * m.item.regen * dt);   // (not a hand-made boss: its only heals are its warned ones, r280)

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
        this.burst(m.x, m.cy, FX_STYLES.fire, 6, 30, -40);
        if (m.hp <= 0) { this.faint(m); return; }
      }
      if (m.status === 'psn' && m.statusTick <= 0) {
        m.statusTick = 1;
        const d = Math.round(m.maxHp * 0.025);
        m.hp = Math.max(0, m.hp - d);
        this.number(m, d, null, '#e8b8ff', '#8a3ab0');
        this.burst(m.x, m.cy, FX_STYLES.poison, 6, 30, -30);
        if (m.hp <= 0) { this.faint(m); return; }
      }
      if (m.statusT <= 0) {
        if (m.status === 'frz') this.text(m.x, m.y - m.h - 2, 'THAWED OUT!', '#bff0ff', m.y);
        m.status = null;
      }
    } else if (m.status === 'frz') m.status = null;   // never stay frozen between fights
    else if (m.status) {   // out of a fight a status still wears off with time, without its damage or stuns (r291: a
      m.statusT -= dt;     // paralysed Coreature used to crawl through the whole floor, and a burn kept its time for the next fight)
      if (m.statusT <= 0) m.status = null;
    }

    if (m.action) this.updateAction(m, dt);
    if (m.fainted || (this.state !== 'fight' && this.state !== 'explore')) return;

    const hz = m.dodgeT > 0 ? null : this.floorHazard(m, dt);   // the floor under it (obstacles.js): mud, ice, lava... (skipped over mid-dodge)
    if (m.fainted) return;
    const lock = (m.action && m.action.lock) || m.stunT > 0 || m.status === 'frz';
    const a = m.action;
    if (m.dodgeT > 0) {   // mid-dodge (Battle.dodge): a quick dart, leaving afterimages
      m.dodgeT -= dt;
      m.vx = Math.cos(m.dodgeDir) * DODGE.speed; m.vy = Math.sin(m.dodgeDir) * DODGE.speed;
      if ((m.ghostT -= dt) <= 0) { m.ghostT = 0.04; m.ghosts.push({ x: m.x, y: m.y, face: m.face, view: m.view, t: 0.18, color: '#dff6ff' }); }
      if (m.dodgeT <= 0) { m.vx *= 0.35; m.vy *= 0.35; }
    } else if (a && a.kind === 'dash' && a.t > 0.1 + (a.mv.windup || 0) && a.phase !== 'combo') {
      m.vx = Math.cos(a.dir) * a.mv.speed; m.vy = Math.sin(a.dir) * a.mv.speed;
    } else {
      const spd = m.speed() * (hz && hz.slow ? 1 - hz.slow : 1);
      const tx = lock ? 0 : ctrl.x * spd, ty = lock ? 0 : ctrl.y * spd;
      const k = Math.min(1, dt * (hz && hz.slip ? 2.2 : 14));   // on ice it barely grips
      m.vx += (tx - m.vx) * k; m.vy += (ty - m.vy) * k;
    }
    m.kx *= Math.exp(-dt * 7); m.ky *= Math.exp(-dt * 7);
    const B = this.bounds(m);
    m.x = clamp(m.x + (m.vx + m.kx) * dt, B.x0, B.x1);
    m.y = clamp(m.y + (m.vy + m.ky) * dt, B.y0, B.y1);
    this.unblock(m, m.r);   // obstacles (obstacles.js)
    const sp = Math.hypot(m.vx, m.vy);
    m.walkT += sp * dt;
    if (a && a.dir !== undefined && a.kind !== 'cast') m.look(Math.cos(a.dir), Math.sin(a.dir));
    else if (!lock) {
      const foe = this.foe(m);
      if (sp > 12) m.look(m.vx, m.vy);
      else if (foe && this.state === 'fight' && dist(foe, m) > 6) m.look(foe.x - m.x, foe.y - m.y);
    }
  }
}
