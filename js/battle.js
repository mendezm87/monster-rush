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
    this.projectiles = []; this.zones = []; this.particles = []; this.floats = []; this.texts = []; this.deploys = [];
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
      } while (tries++ < 40 && (Math.hypot(x - P.x, y - P.y) < 170 || this.e.some(o => Math.hypot(o.x - x, o.y - y) < 60)));
      m.x = x; m.y = y; m.face = x < P.x ? 1 : -1;
      m.spawnT = 0.7 + i * 0.35;
      return m;
    });
    this.state = 'fight'; this.stateT = 0;
    this.doorFx('close');
    if (this.boss) this.ui.banner(this.boss.final ? 'FINAL BOSS!' : 'BOSS!', this.boss.final ? this.boss.def.name : '');
  }

  clearRoom() {
    this.room.cleared = true;
    this.run.stats.rooms++;
    this.trainerAct(this.boss ? 'victory' : 'cheer', this.P);
    this.emit('clear', null);   // e.g. Rain Bell
    for (const m of this.run.party) if (m.fused && m.fused.length) this.emit('clear', m, true);
    this.evolveReady();
    if (this.boss && this.hooks.bossBeaten) this.hooks.bossBeaten(this.boss.id);
    this.state = 'explore'; this.stateT = 0;
    this.projectiles = this.projectiles.filter(p => p.owner.side === 'player');
    this.zones = this.zones.filter(z => z.owner.side === 'player');
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

  // Things to walk up to: recruits, shop goods, a treasure relic.
  makePedestals() {
    const room = this.room, F = this.F, cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2;
    this.pedestals = [];
    if (room.type === 'recruit' && !room.recruited)
      this.pedestals = room.offer.map((id, i) => ({ kind: 'mon', id, x: cx + (i - (room.offer.length - 1) / 2) * (room.offer.length > 3 ? 100 : 120), y: cy - 6, cool: 0 }));
    if (room.type === 'shop')
      room.stock.forEach((it, i) => { if (!it.sold) this.pedestals.push({ kind: 'shop', item: it, id: it.id, x: cx + (i - 1.5) * 100, y: cy - 6, cool: 0 }); });
    if (room.type === 'altar' && !room.used)
      this.pedestals = [{ kind: 'altar', id: 'altar', x: cx, y: cy - 6, cool: 0 }];
    if (room.type === 'treasure' && !room.taken)
      this.pedestals = [{ kind: 'relic', id: room.relic, x: cx, y: cy - 6, cool: 0 }];
  }

  placeStairs() {
    const F = this.F;
    this.stairs = { x: (F.x0 + F.x1) / 2, y: (F.y0 + F.y1) / 2 };
  }

  // Coreatures that reached their level transform (between fights, so moves don't change mid-combo).
  // In the world's story they're living data from a fallen civilization: leveling up recovers more of
  // their lost data, until they're whole enough to take back a stronger form.
  evolveReady() {
    for (const m of this.p) {
      if (!m.canEvolve) continue;
      const from = m.def.name, to = ROSTER_BY_ID[m.def.evolve.to];
      m.setDef(to);
      m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.25));
      this.ui.banner(`${from} TRANSFORMED!`, `Its lost data came back: it's ${to.name} again`);
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
    this.emit('swapIn', inc);   // e.g. the Scarf Tamer's Tag Team
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
      this.dropLoot(m);
      this.giveXp(m.boss ? XP_BOSS : m.scale > 1 ? XP_TOUGH : XP_WILD);
      if (m.champ === 'split') this.splitChampion(m);
      return;
    }
    this.ui.banner(`${m.def.name} FAINTED!`);
    this.trainerAct('crouch', m);
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
    this.trainerAct(result === 'win' ? 'victory' : 'slump');
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
        this.text(t.x, t.y - 50, `${m.def.name} LV ${m.level}`, '#ffe9a0');
      }
      if (ev.learned) this.text(m === this.P ? m.x : this.trainer.x, (m === this.P ? m.y - m.h : this.trainer.y - 50) - 24, `LEARNED ${MOVES[ev.learned].name.toUpperCase()}!`, TYPES[MOVES[ev.learned].type].fx[1]);
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
      if (m.champ === 'shiny' && Math.random() < dt * 8) this.sparks(m.x + rand(-m.r, m.r), m.cy + rand(-m.h / 2, m.h / 2), 1, '#ffe066');
      if (m.champ === 'spiky' && P.alive && P.spikeT <= 0 && Math.hypot(P.x - m.x, P.y - m.y) < P.r + m.r + 3) {
        P.spikeT = 0.7;
        this.hit(m, P, SPIKE_MV, 1, { force: 140 });
      }
    }
  }

  // ---------------------------------------------------------- loot
  dropLoot(m) {
    let coins = m.boss ? 8 + this.run.floorN * 2 : m.scale > 1 ? 2 : (Math.random() < 0.5 ? 1 : 0);   // rooms give the rest (spawnReward)
    const cm = this.mod(null, 'coinMul');
    if (cm !== 1) coins = Math.round(coins * cm + Math.random() * 0.5);
    for (let i = 0; i < coins; i++) this.spawnPickup('coin', m.x, m.y);
    if (m.boss || Math.random() < 0.12 * this.mod(null, 'berryOddsMul')) this.spawnPickup('berry', m.x, m.y);
    if (m.champ === 'shiny') { for (let i = 0; i < 10; i++) this.spawnPickup('coin', m.x, m.y); this.spawnPickup('chest', m.x, m.y); }
  }

  // the room's reward (shown over its doors) pops out in the middle once it's cleared
  spawnReward(kind) {
    const F = this.F, x = (F.x0 + F.x1) / 2, y = (F.y0 + F.y1) / 2;
    if (kind === 'coins') for (let i = 0; i < 5 + this.run.floorN; i++) this.spawnPickup('coin', x, y);
    if (kind === 'berries') for (let i = 0; i < 2 + this.mod(null, 'roomBerries'); i++) this.spawnPickup('berry', x, y);
    if (kind === 'xp') this.spawnPickup('shard', x, y);
    if (kind === 'move') this.spawnPickup('disc', x, y);
    if (kind === 'chest') this.spawnPickup('chest', x, y);
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
    } else if (k.kind === 'shard') {   // XP for the party (the Coreature that's out gets it all)
      this.ui.banner('ARC-CORE SHARD!', 'Scraps of old data: XP for the party');
      Sfx.play('levelUp');
      this.giveXp(15 + 3 * this.run.floorN);
    } else if (k.kind === 'disc') {    // the Coreature that's out learns a new move
      const id = this.run.learnMove(P);
      if (id) { this.run.learnQueue.push({ mon: P, id }); this.ui.banner('MOVE DISC!'); }
      else { this.run.coins += 10; this.ui.banner('+10 COINS'); }
      Sfx.play('select');
    } else if (k.kind === 'chest') {   // a relic (or a picnic once you have them all)
      const free = Object.keys(RELICS).filter(id => !this.run.relics.includes(id));
      if (free.length) { const id = pickRand(free); this.run.addRelic(id); this.ui.banner(`GOT ${RELICS[id].name}!`); }
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
        if (this.state === 'fight') this.updateChampions(dt);
        this.updateProjectiles(dt);
        this.updateZones(dt);
        if (this.state === 'faint') break;
        this.updatePickups(dt);
        if (this.state === 'fight' && this.e.length && this.e.every(m => m.fainted) && this.deploys.length === 0) this.clearRoom();
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
    m.visible = true; m.flash = 0.35; m.invuln = 0.4; animMark(m, 'pop');
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
      Sfx.play('blip');
      return;
    }
    if (ped.kind === 'shop') ped.item.sold = true;
    if (ped.kind === 'relic') this.room.taken = true;
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
      m.flash = Math.max(0, m.flash - dt);
    }
  }

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
}
