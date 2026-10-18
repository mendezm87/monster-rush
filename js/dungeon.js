// Floors (a grid of rooms joined by doors, Isaac-style) and the state of a run.

const RUN_FLOORS = 6;                                    // floors in a normal run; the last one has the final boss
const FLOOR_STAGES = ['meadow', 'crater', 'summit', 'grotto', 'ruins', 'spire'];   // one per floor; endless mode loops through them
// Each floor theme's song (Sfx.music.SONGS); boss rooms and the shop have their own.
const STAGE_SONGS = { meadow: 'rush', crater: 'magma', summit: 'summit', grotto: 'deep', ruins: 'deep', spire: 'spire' };
// 'FLOOR 2/6' in a normal run, 'ENDLESS FLOOR 9' in endless
const floorLabel = run => run.endless ? `ENDLESS FLOOR ${run.floorN}` : `FLOOR ${run.floorN}/${RUN_FLOORS}`;
// the big banner when a floor starts, with the area's name under it
const floorBanner = run => [run.floor.last ? 'FINAL FLOOR' : floorLabel(run), STAGES[run.floor.stage].name.toUpperCase()];
const floorSong = run => STAGE_SONGS[run.floor.stage] || 'rush';
const roomSong = (run, room) => room.type === 'boss' && !room.cleared ? 'boss' : room.type === 'shop' ? 'shop' : floorSong(run);
const STARTERS = ['smugshi', 'cinderox', 'tidalisk'];
const ROOM_SIZES = { s: [576, 324], wide: [864, 324], tall: [576, 486], big: [864, 486], boss: [864, 540] };
const REVIVE_HP = 0.3;                                   // fainted party members come back at 30% on a new floor

// Leveling: XP for each wild monster beaten. The monster that's out gets it all, the
// rest of the party (not fainted) gets half. Level n -> n+1 needs XP_NEED(n).
const XP_WILD = 10, XP_TOUGH = 20, XP_BOSS = 50, XP_BENCH = 0.5;
const XP_NEED = n => 18 + 11 * n;
const LV_HP = 0.035, LV_STAT = 0.02, LV_HEAL = 0.05;     // per level: +3.5% HP, +2% atk/def; leveling heals 5%
const LEARN_EVERY = 2;   // a new move to learn at every 2nd level (2, 4, 6, ...)

// Wild monsters are weaker than arena monsters (there can be three of them) and get
// tougher each floor; a boss is close to full arena strength.
const WILD_AI = {
  wild: { think: 0.3, dodge: 0.3, aggro: 0.45, react: 0.45, aimErr: 0.18, lead: false },
  boss: { think: 0.22, dodge: 0.55, aggro: 0.7, react: 0.3, aimErr: 0.1, lead: false },
};
function wildSpec(id, floorN, kind) {
  const f = floorN - 1;   // the climb is spread over the 6 floors of a run (endless keeps climbing)
  // the final boss: an evolved starter, bigger and tougher than any other boss
  if (kind === 'final') return { id, hpMul: 1.6 + 0.5 * f, atkMul: 0.75 + 0.13 * f, scale: 1.45, boss: true, final: true, ai: 'boss' };
  if (kind === 'boss') return { id, hpMul: 1.3 + 0.45 * f, atkMul: 0.7 + 0.12 * f, scale: 1.35, boss: true, ai: 'boss' };
  if (kind === 'tough') return { id, hpMul: 0.65 + 0.25 * f, atkMul: 0.5 + 0.12 * f, scale: 1.15, ai: 'wild' };
  return { id, hpMul: 0.3 + 0.15 * f, atkMul: 0.36 + 0.11 * f, ai: 'wild' };
}

// Relics last for the whole run and help the whole party. bonus multiplies stats.
const RELICS = {
  leechLens:   { name: 'LEECH LENS', desc: 'Beams also drain: your monster heals 15% of the damage its beams deal.' },
  emberTracks: { name: 'EMBER TRACKS', desc: 'Dashes leave a trail of fire behind them.' },
  muscleCharm: { name: 'MUSCLE CHARM', desc: '+15% attack for your whole party.', bonus: { atk: 1.15 } },
  ironShell:   { name: 'IRON SHELL', desc: '+15% defence for your whole party.', bonus: { def: 1.15 } },
  swiftBoots:  { name: 'SWIFT BOOTS', desc: '+12% speed for your whole party.', bonus: { spd: 1.12 } },
  hourglass:   { name: 'HOURGLASS', desc: 'Moves recharge 15% faster.', bonus: { cd: 0.85 } },
  luckyCoin:   { name: 'LUCKY COIN', desc: 'Wild monsters drop 50% more coins.' },
  berryBasket: { name: 'BERRY BASKET', desc: 'Berries drop more often and heal 40% instead of 25%.' },
  splitShot:   { name: 'SPLIT SHOT', desc: 'Shots fire one extra projectile.' },
  staticCharm: { name: 'STATIC CHARM', desc: 'Every hit has a 10% chance to paralyze.' },
  blastCore:   { name: 'BLAST CORE', desc: 'Blasts and strikes from above are 25% bigger.' },
};
// Shop goods that are used up straight away.
const GOODS = {
  bigBerry: { name: 'BIG BERRY', desc: 'Heals your active monster by 50%.', price: 5 },
  picnic:   { name: 'PICNIC BASKET', desc: 'Heals your whole party by 40%.', price: 10 },
  revive:   { name: 'REVIVE SEED', desc: 'Fainted party members get back up with 40% HP.', price: 12 },
};
const itemDef = id => RELICS[id] || GOODS[id];
const relicPrice = floorN => 18 + 7 * (floorN - 1);

const pickRand = a => a[(Math.random() * a.length) | 0];
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Each area's own monsters: most wild monsters, recruits and bosses on a floor come from
// here (AREA_ODDS), the rest from anywhere, so every area feels different but can surprise.
const AREA_MONS = {
  meadow: { natives: ['sparkit', 'thornback', 'slumbear', 'pixibelle', 'galewing', 'scarablade', 'lumawool', 'smugshi', 'bellpaca'], bosses: ['slumbear', 'thornback', 'galewing'] },
  crater: { natives: ['cinderox', 'boulderon', 'drakorn', 'brawlix', 'venomire', 'thornback', 'gearhulk', 'coilizard', 'smouldox'], bosses: ['boulderon', 'drakorn', 'cinderox'] },
  summit: { natives: ['frostling', 'galewing', 'boulderon', 'brawlix', 'slumbear', 'drakorn', 'lumawool', 'coilizard', 'bellpaca'], bosses: ['frostling', 'slumbear', 'boulderon'] },
  grotto: { natives: ['mindra', 'wispurr', 'shadefang', 'pixibelle', 'lumawool', 'venomire', 'gearhulk', 'voltergeist', 'garrishell'], bosses: ['gearhulk', 'mindra', 'wispurr'] },
  ruins:  { natives: ['tidalisk', 'venomire', 'scarablade', 'wispurr', 'shadefang', 'mondaze', 'gearhulk', 'mindra', 'smouldox', 'garrishell'], bosses: ['tidalisk', 'shadefang', 'mondaze', 'garrishell'] },
  spire:  { natives: ['drakorn', 'mindra', 'shadefang', 'pixibelle', 'galewing', 'gearhulk', 'wispurr', 'brawlix', 'voltergeist'], bosses: ['drakorn', 'gearhulk', 'slumbear'] },
};
const AREA_ODDS = 0.75;
// n different wild monster ids for an area
function wildIds(stage, n, skip = []) {
  const nat = shuffle(AREA_MONS[stage].natives.filter(id => !skip.includes(id)));
  const all = shuffle(ROSTER.map(m => m.id).filter(id => !skip.includes(id)));
  const out = [];
  while (out.length < n) {
    const id = (Math.random() < AREA_ODDS && nat.find(i => !out.includes(i))) || all.find(i => !out.includes(i));
    if (!id) break;
    out.push(id);
  }
  return out;
}

// What clearing a fight room gives (weights). It shows over the room's doors, so you can choose
// your way through a floor, like Hades' doors. Wild monsters drop less to make up for it, so the
// total loot is about what it was; the doors decide what kind you get.
const ROOM_REWARDS = { coins: 30, berries: 25, xp: 15, move: 15, chest: 3 };
function pickReward() {
  let r = Math.random() * Object.values(ROOM_REWARDS).reduce((a, b) => a + b, 0);
  for (const [k, w] of Object.entries(ROOM_REWARDS)) if ((r -= w) < 0) return k;
  return 'coins';
}

// Champions (like Isaac's): now and then a wild monster has a trait, shown by a coloured ring
// and a label. Swift: faster, quicker recharges. Giant: bigger, more HP, hard to push. Spiky:
// touching it hurts. Splitting: becomes two small copies when it faints. Shiny: rare, golden,
// drops lots of coins and a treasure chest. w = how often, of the champions.
const CHAMPIONS = {
  swift: { name: 'SWIFT', color: '#5ae0ff', w: 30 },
  giant: { name: 'GIANT', color: '#ff9a3a', w: 25 },
  spiky: { name: 'SPIKY', color: '#d8d8e8', w: 20 },
  split: { name: 'SPLITTING', color: '#8be04e', w: 20 },
  shiny: { name: 'SHINY', color: '#ffe066', w: 5 },
};
const championOdds = floorN => Math.min(0.3, 0.06 + 0.035 * floorN);
function makeChampion(spec, floorN) {
  if (Math.random() >= championOdds(floorN)) return spec;
  let r = Math.random() * Object.values(CHAMPIONS).reduce((a, c) => a + c.w, 0);
  spec.champ = Object.keys(CHAMPIONS).find(k => (r -= CHAMPIONS[k].w) < 0) || 'swift';
  if (spec.champ === 'giant') { spec.hpMul *= 1.8; spec.scale = 1.3; }
  return spec;
}

// Who lives in a fight room: 1-3 wild monsters, or sometimes one tougher one.
function makeWave(floorN, sizeKey, stage) {
  if (Math.random() < (floorN > 3 ? 0.25 : 0.18)) return [wildSpec(wildIds(stage, 1)[0], floorN, 'tough')];
  const roomy = sizeKey === 'big' || sizeKey === 'wide' || sizeKey === 'tall';
  const table = floorN === 1 ? [1, 2, 2, 3] : floorN <= 3 ? [2, 2, 3, 3] : [2, 3, 3, 3];
  let n = pickRand(table);
  if (roomy && n < 3 && Math.random() < 0.5) n++;
  return wildIds(stage, n).map(id => makeChampion(wildSpec(id, floorN, 'wild'), floorN));
}

// last: the last floor of a normal run (its boss is the final boss)
function genFloor(floorN, partyIds, relics = [], last = false) {
  for (let tries = 0; tries < 2000; tries++) {
    const f = tryFloor(floorN, partyIds, relics, last);
    if (f) return f;
  }
  throw new Error('could not build a floor');
}

function tryFloor(floorN, partyIds, relics, last) {
  const stage = FLOOR_STAGES[(floorN - 1) % FLOOR_STAGES.length];
  const G = 9, target = 10 + Math.min(floorN, 4) + ((Math.random() * 2) | 0);
  const grid = new Map(), key = (x, y) => x + ',' + y;
  const rooms = [];
  const add = (gx, gy) => { const r = { gx, gy, doors: {} }; grid.set(key(gx, gy), r); rooms.push(r); return r; };
  const nCount = (x, y) => Object.values(DOOR_DIRS).filter(([dx, dy]) => grid.has(key(x + dx, y + dy))).length;
  const start = add(4, 4);
  // grow outwards from the start; a new room may only touch one existing room so the floor branches
  const queue = [start];
  for (let guard = 0; rooms.length < target; guard++) {
    if (!queue.length || guard > 300) return null;
    const c = queue.shift();
    for (const [dx, dy] of shuffle(Object.values(DOOR_DIRS).slice())) {
      const x = c.gx + dx, y = c.gy + dy;
      if (rooms.length >= target || x < 0 || y < 0 || x >= G || y >= G || grid.has(key(x, y))) continue;
      if (Math.random() < 0.5 || nCount(x, y) > 1) continue;
      queue.push(add(x, y));
    }
    if (!queue.includes(c) && rooms.length < target && Math.random() < 0.5) queue.push(c);
  }
  for (const r of rooms) {
    for (const [dir, [dx, dy]] of Object.entries(DOOR_DIRS)) {
      const o = grid.get(key(r.gx + dx, r.gy + dy));
      if (o) r.doors[dir] = o;
    }
  }
  // distance from the start, to put the boss as far away as possible
  const dist = new Map([[start, 0]]), bfs = [start];
  while (bfs.length) {
    const r = bfs.shift();
    for (const o of Object.values(r.doors)) if (!dist.has(o)) { dist.set(o, dist.get(r) + 1); bfs.push(o); }
  }
  const ends = rooms.filter(r => r !== start && Object.keys(r.doors).length === 1).sort((a, b) => dist.get(b) - dist.get(a));
  // dead ends hold the special rooms: the farthest is the boss
  if (ends.length < 4 || dist.get(ends[0]) < 3) return null;
  const [boss, ...rest] = ends;
  shuffle(rest);
  const [recruit, shop, treasure] = rest;

  const ids = ROSTER.map(m => m.id);
  for (const r of rooms) {
    r.type = r === start ? 'start' : r === boss ? 'boss' : r === recruit ? 'recruit' : r === shop ? 'shop' : r === treasure ? 'treasure' : 'fight';
    const sizeKey = r.type === 'boss' ? 'boss' : r.type === 'fight' ? pickRand(['s', 's', 'wide', 'tall', 'big']) : 's';
    [r.w, r.h] = ROOM_SIZES[sizeKey];
    r.seed = (Math.random() * 1e9) | 0;
    r.cleared = r.type !== 'fight' && r.type !== 'boss';
    r.visited = false;
    r.pickups = [];
    r.enemies = r.type === 'fight' ? makeWave(floorN, sizeKey, stage) : [];
    if (r.type === 'fight') r.reward = pickReward();
    if (r.type === 'boss') {
      // usually one of the area's bosses, now and then anyone
      r.enemies = [wildSpec(Math.random() < 0.8 ? pickRand(AREA_MONS[stage].bosses) : pickRand(ids), floorN, 'boss')];
      // the final boss is an evolved starter you didn't start with
      const rivals = EVOLVED.filter(e => !partyIds.includes(e.from));
      if (last) r.enemies = [wildSpec(pickRand(rivals.length ? rivals : EVOLVED).id, floorN, 'final')];
    }
    if (r.type === 'recruit') {   // two of the area's monsters and one from anywhere
      const local = shuffle(AREA_MONS[stage].natives.filter(id => !partyIds.includes(id))).slice(0, 2);
      r.offer = [...local, ...shuffle(ids.filter(id => !partyIds.includes(id) && !local.includes(id)))].slice(0, 3);
    }
  }
  // a relic in the treasure room, two more (and two goods) in the shop
  const free = shuffle(Object.keys(RELICS).filter(id => !relics.includes(id)));
  treasure.relic = free[0] || 'picnic';   // once every relic is owned, treasure is a free picnic
  const goods = shuffle(['picnic', 'revive']);
  shop.stock = [
    { id: 'bigBerry', price: GOODS.bigBerry.price },
    ...goods.slice(0, 1).map(id => ({ id, price: GOODS[id].price })),
    ...free.slice(1, 3).map(id => ({ id, price: relicPrice(floorN), relic: true })),
  ];
  while (shop.stock.length < 4 && goods.length > 1) { const id = goods.pop(); shop.stock.push({ id, price: GOODS[id].price }); }
  return { n: floorN, last, rooms, start, boss, stage };
}

// Progress kept between runs (in this browser). Beating a boss unlocks its species as a starter.
// The save carries a version number. When its shape changes, bump SAVE_VERSION and add a
// step to SAVE_UPGRADES that turns version n into n + 1, so older saves keep working after an
// update. Before upgrading, the old save is copied to a backup key.
const SAVE_KEY = 'monsterRush.save.v1';   // the storage key stays the same; the version lives inside
const SAVE_VERSION = 2;
const SAVE_UPGRADES = {
  // 1 -> 2: settings get their own section (the lighting switch moves into it)
  1(d) {
    d.settings = { lighting: d.lighting !== false };
    delete d.lighting;
  },
};
const DEFAULT_SETTINGS = { lighting: true, music: 0.8, sfx: 0.8, keys: {} };   // keys: action -> key code (see Input)
const Save = {
  data: { version: SAVE_VERSION, starters: [...STARTERS], runs: 0, wins: 0, bestFloor: 0, bestEndless: 0, recruited: [], settings: { ...DEFAULT_SETTINGS } },
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { /* storage blocked or broken: play without it */ }
    if (d && typeof d === 'object') {
      const from = d.version || 1;
      if (from < SAVE_VERSION) {
        try { localStorage.setItem(`${SAVE_KEY}.backup-v${from}`, JSON.stringify(d)); } catch (e) { /* ignore */ }
        for (let v = from; v < SAVE_VERSION; v++) if (SAVE_UPGRADES[v]) SAVE_UPGRADES[v](d);
        d.version = SAVE_VERSION;
      }
      // a save from a newer build (e.g. a stale cached page): use what we understand, keep its version
      Object.assign(this.data, d);
      this.data.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
      if (from < SAVE_VERSION) this.write();
    }
    for (const id of STARTERS) if (!this.data.starters.includes(id)) this.data.starters.push(id);
    this.data.starters = this.data.starters.filter(id => ROSTER.some(m => m.id === id));
  },
  write() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
  get settings() { return this.data.settings; },
  setSetting(key, value) { this.data.settings[key] = value; this.write(); },
  unlockStarter(id) {
    if (this.data.starters.includes(id) || !ROSTER.some(m => m.id === id)) return false;
    this.data.starters.push(id); this.write(); return true;
  },
  noteRecruit(id) { if (!this.data.recruited.includes(id)) { this.data.recruited.push(id); this.write(); } },
  // returns true if it's a new endless record
  endRun(floorN, win, endless) {
    this.data.runs++; if (win) this.data.wins++;
    const record = endless && floorN > (this.data.bestEndless || 0);
    if (endless) this.data.bestEndless = Math.max(this.data.bestEndless || 0, floorN);
    else this.data.bestFloor = Math.max(this.data.bestFloor, floorN);
    this.write();
    return record;
  },
};
Save.load();

// Everything that lasts for one run.
class RunState {
  // endless: floors never stop (the boss always opens stairs); the run ends when the party faints
  constructor(starterId, endless = false) {
    this.endless = endless;
    this.party = [new Mon(ROSTER_BY_ID[starterId], 'player')];
    this.pi = 0;
    this.coins = 0;
    this.swapCd = 0;
    this.relics = [];
    this.learnQueue = [];   // new moves waiting to be offered between fights: [{ mon, id }]
    this.stats = { rooms: 0, kos: 0, time: 0, floors: 0 };
    this.newFloor(1);
  }
  newFloor(n) {
    this.floorN = n;
    this.floor = genFloor(n, this.party.map(m => m.def.from || m.id), this.relics, !this.endless && n === RUN_FLOORS);
    // fainted monsters get back up at 30% for the new floor
    for (const m of this.party) if (m.fainted) { m.fainted = false; m.hp = Math.round(m.maxHp * REVIVE_HP); m.status = null; }
    if (this.party[this.pi].fainted) this.pi = this.party.findIndex(m => !m.fainted);
    this.room = this.floor.start;
  }
  get stageKey() { return this.floor.stage; }
  addRelic(id) { if (!this.relics.includes(id)) this.relics.push(id); this.applyRelics(); }
  // stat relics multiply into every party member's bonus
  applyRelics() {
    const b = { atk: 1, def: 1, spd: 1, cd: 1 };
    for (const id of this.relics) for (const [k, v] of Object.entries(RELICS[id].bonus || {})) b[k] *= v;
    for (const m of this.party) m.bonus = { ...b };
  }
  // Use a shop good; returns false if it would do nothing.
  useGood(id, dry = false) {
    const alive = this.party.filter(m => !m.fainted), down = this.party.filter(m => m.fainted);
    const P = this.party[this.pi];
    if (id === 'bigBerry') { if (P.hp >= P.maxHp) return false; if (!dry) P.hp = Math.min(P.maxHp, P.hp + Math.round(P.maxHp * 0.5)); }
    if (id === 'picnic') { if (alive.every(m => m.hp >= m.maxHp)) return false; if (!dry) for (const m of alive) m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.4)); }
    if (id === 'revive') { if (!down.length) return false; if (!dry) for (const m of down) { m.fainted = false; m.hp = Math.round(m.maxHp * 0.4); m.status = null; } }
    return true;
  }
  // Returns the level-ups: [{ mon, level, learned }] (learned: a new move id, at every even level)
  giveXp(amount) {
    const ups = [];
    this.party.forEach((m, i) => {
      if (m.fainted) return;
      m.xp += Math.round(amount * (i === this.pi ? 1 : XP_BENCH));
      while (m.xp >= XP_NEED(m.level)) {
        m.xp -= XP_NEED(m.level);
        m.setLevel(m.level + 1);
        const learned = m.level % LEARN_EVERY === 0 ? this.learnMove(m) : null;
        if (learned) this.learnQueue.push({ mon: m, id: learned });
        ups.push({ mon: m, level: m.level, learned });
      }
    });
    return ups;
  }
  // Teach a monster a new move it can learn (movesets.js); returns its id, or null if it knows them all.
  learnMove(m) {
    const can = movePool(m.id).filter(k => !m.known.includes(k));
    if (!can.length) return null;
    const k = can[(Math.random() * can.length) | 0];
    m.known.push(k);
    return k;
  }
  // new recruits join a level behind the party's average, at full HP
  joinLevel() {
    const avg = this.party.reduce((s, m) => s + m.level, 0) / this.party.length;
    return Math.max(1, Math.round(avg) - 1);
  }
  recruit(id, releaseIdx = -1) {
    const m = new Mon(ROSTER_BY_ID[id], 'player');
    m.setLevel(this.joinLevel()); m.hp = m.maxHp;
    for (let lv = LEARN_EVERY; lv <= m.level; lv += LEARN_EVERY) this.learnMove(m);   // the moves it learned on the way (in its moves menu)
    m.bonus = { ...this.party[0].bonus };
    if (releaseIdx >= 0) this.release(releaseIdx, m);
    else this.party.push(m);
    return m;
  }
  // Remove a party member (optionally putting a new one in its slot).
  release(idx, replacement = null) {
    const active = this.party[this.pi];
    if (replacement) this.party[idx] = replacement;
    else this.party.splice(idx, 1);
    let pi = this.party.indexOf(active);
    if (pi < 0 || this.party[pi].fainted) pi = this.party.findIndex(m => !m.fainted);
    this.pi = Math.max(0, pi);
  }
}
