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

// Relics last for the whole run and help the whole party. Each relic is one self-contained entry:
//   tag    its element (RELIC_TAGS), for the evolution altar's recipes
//   gear   where the party wears it (head, eyes, neck, feet; the piece is GEAR_ART[id] in gear.js), or
//   aura   an effect around the monster instead, for relics that aren't a thing you'd wear (RELIC_AURA in render.js)
//   bonus  stat multipliers for the whole party (atk, def, spd, cd)
//   mods   numbers the game asks for by name (Battle.mod): names ending in Mul multiply, the rest add up
//   on     things it does when something happens (Battle.emit): hit(b, src, tgt, mv, mult) after a hit
//          lands, dash(b, m, action, dt) every frame of a dash, clear(b, m) when a room is cleared
//   fused  what it becomes when it's offered at the evolution altar: fused into that one monster for
//          good (its own name, desc, bonus, mods, on), usually a stronger or mutated version
// A new relic is an entry here, an icon (ICON_ART in render.js) and its gear (GEAR_ART) or aura (RELIC_AURA);
// test.html checks every relic has them, and that every mod and event is one the game really uses.
const STORM_MV = { id: 'stormArc', name: 'Storm Coil', type: 'electric', kind: 'projectile', power: 70, chained: true };
// a bolt jumps from the monster just hit to the nearest other one (Storm Coil)
function chainBolt(b, src, tgt, mult) {
  const o = b.foes(src).filter(f => f !== tgt && f.visible && !f.fainted).sort((p, q) => Math.hypot(p.x - tgt.x, p.y - tgt.y) - Math.hypot(q.x - tgt.x, q.y - tgt.y))[0];
  if (!o || Math.hypot(o.x - tgt.x, o.y - tgt.y) > 180) return;
  b.particles.push({ kind: 'strike', x: o.x, y: o.cy, x2: tgt.x, y2: tgt.cy, seed: Math.random(), life: 0.22, max: 0.22, color: '#7af0ff' });
  b.hit(src, o, STORM_MV, mult);
}
const healBy = (b, m, k) => {
  if (!m || m.fainted) return;
  const heal = Math.round(Math.min(m.maxHp * k, m.maxHp - m.hp));
  if (heal <= 0) return;
  m.hp += heal;
  if (m === b.P) b.number(m, heal, null, '#b6ff9a', '#4fae2e', '+');
};
const RELICS = {
  leechLens:   { name: 'LEECH LENS', desc: 'Beams also drain: your Coreature heals 15% of the damage its beams deal.', tag: 'life', gear: 'eyes', mods: { beamDrain: 0.15 },
    fused: { name: 'LEECH SIGHT', desc: 'All its attacks drain 12% of their damage, and its beams 30%.', mods: { drainAll: 0.12, beamDrain: 0.3 } } },
  emberTracks: { name: 'EMBER TRACKS', desc: 'Dashes leave a trail of fire behind them.', tag: 'fire', aura: 'embers',
    on: { dash(b, m, a, dt) { if ((a.trailT = (a.trailT || 0) - dt) <= 0) { a.trailT = 0.07; b.zones.push({ x: m.x, y: m.y, r: 13, t: 0, delay: 0, mv: EMBER_MV, owner: m, done: true, tick: 0.15, id: _uid++ }); } } },
    fused: { name: 'MAGMA TRAILS', desc: 'Its dashes leave a wider trail of magma that burns harder.',
      on: { dash(b, m, a, dt) { if ((a.magmaT = (a.magmaT || 0) - dt) <= 0) { a.magmaT = 0.05; b.zones.push({ x: m.x, y: m.y, r: 19, t: 0, delay: 0, mv: EMBER_MV, owner: m, done: true, tick: 0.3, id: _uid++ }); } } } } },
  muscleCharm: { name: 'MUSCLE CHARM', desc: '+15% attack for your whole party.', tag: 'iron', gear: 'head', bonus: { atk: 1.15 },
    fused: { name: 'IRON MUSCLE', desc: '+35% attack for this Coreature.', bonus: { atk: 1.35 } } },
  ironShell:   { name: 'IRON SHELL', desc: '+15% defence for your whole party.', tag: 'iron', gear: 'head', bonus: { def: 1.15 },
    fused: { name: 'IRON HIDE', desc: '+35% defence for this Coreature.', bonus: { def: 1.35 } } },
  swiftBoots:  { name: 'SWIFT BOOTS', desc: '+12% speed for your whole party.', tag: 'wind', gear: 'feet', bonus: { spd: 1.12 },
    fused: { name: 'GALE STEP', desc: '+28% speed for this Coreature.', bonus: { spd: 1.28 } } },
  hourglass:   { name: 'HOURGLASS', desc: 'Moves recharge 15% faster.', tag: 'wind', gear: 'neck', bonus: { cd: 0.85 },
    fused: { name: 'TIME SHARD', desc: "This Coreature's moves recharge 30% faster.", bonus: { cd: 0.7 } } },
  luckyCoin:   { name: 'LUCKY COIN', desc: 'Wild Coreatures drop 50% more coins.', tag: 'luck', gear: 'neck', mods: { coinMul: 1.5 },
    fused: { name: 'MIDAS TOUCH', desc: 'Its hits sometimes knock a coin out of wild Coreatures.',
      on: { hit(b, src, tgt, mv, mult) { if (mult >= 1 && !mv.chained && Math.random() < 0.15) b.spawnPickup('coin', tgt.x, tgt.y); } } } },
  berryBasket: { name: 'BERRY BASKET', desc: 'Berries drop more often and heal 40% instead of 25%.', tag: 'life', aura: 'berries', mods: { berryOddsMul: 25 / 12, berryHealMul: 1.6, roomBerries: 1 },
    fused: { name: 'BERRY HEART', desc: 'It heals 15% of its HP whenever a room is cleared.', on: { clear(b, m) { healBy(b, m, 0.15); } } } },
  splitShot:   { name: 'SPLIT SHOT', desc: 'Shots fire one extra projectile.', tag: 'wind', gear: 'eyes', mods: { extraShots: 1 },
    fused: { name: 'SCATTER SHOT', desc: 'Its shots fire two extra projectiles.', mods: { extraShots: 2 } } },
  staticCharm: { name: 'STATIC CHARM', desc: 'Every hit has a 10% chance to paralyze.', tag: 'storm', aura: 'static',
    on: { hit(b, src, tgt, mv, mult) { if (mult >= 1 && Math.random() < 0.1) b.applyStatus(tgt, 'par'); } },
    fused: { name: 'LIVING STATIC', desc: 'Its hits paralyze 25% of the time.', on: { hit(b, src, tgt, mv, mult) { if (mult >= 1 && Math.random() < 0.25) b.applyStatus(tgt, 'par'); } } } },
  blastCore:   { name: 'BLAST CORE', desc: 'Blasts and strikes from above are 25% bigger.', tag: 'fire', gear: 'neck', mods: { blastMul: 1.25 },
    fused: { name: 'NOVA CORE', desc: 'Its blasts and strikes from above are 50% bigger.', mods: { blastMul: 1.5 } } },
  tideCharm:   { name: 'TIDE CHARM', desc: 'Water moves hit 20% harder.', tag: 'water', aura: 'tide', mods: { waterMul: 1.2 },
    fused: { name: 'RIPTIDE', desc: "This Coreature's water moves hit 45% harder.", mods: { waterMul: 1.45 } } },
  rainBell:    { name: 'RAIN BELL', desc: 'Clearing a room heals your whole party a little (8%).', tag: 'water', gear: 'neck',
    on: { clear(b) { for (const m of b.run.party) healBy(b, m, 0.08); } },
    fused: { name: 'STORM BELL', desc: 'It heals 20% of its HP whenever a room is cleared.', on: { clear(b, m) { healBy(b, m, 0.2); } } } },
  stormCoil:   { name: 'STORM COIL', desc: 'Hits have a 15% chance to arc lightning to another wild Coreature.', tag: 'storm', gear: 'head',
    on: { hit(b, src, tgt, mv, mult) { if (mult >= 1 && !mv.chained && Math.random() < 0.15) chainBolt(b, src, tgt, 0.6); } },
    fused: { name: 'TESLA HEART', desc: 'Its hits arc lightning to another wild Coreature 35% of the time, harder.',
      on: { hit(b, src, tgt, mv, mult) { if (mult >= 1 && !mv.chained && Math.random() < 0.35) chainBolt(b, src, tgt, 1); } } } },
};
const RELIC_TAGS = ['fire', 'water', 'storm', 'iron', 'life', 'wind', 'luck'];
// Shop goods that are used up straight away.
const GOODS = {
  bigBerry: { name: 'BIG BERRY', desc: 'Heals your active Coreature by 50%.', price: 5 },
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
  meadow: { natives: ['sparkit', 'thornback', 'slumbear', 'pixibelle', 'galewing', 'scarablade', 'lumawool', 'smugshi', 'bellpaca', 'shellmet'], bosses: ['slumbear', 'thornback', 'galewing'] },
  crater: { natives: ['cinderox', 'boulderon', 'drakorn', 'brawlix', 'venomire', 'thornback', 'gearhulk', 'coilizard', 'smouldox'], bosses: ['boulderon', 'drakorn', 'cinderox'] },
  summit: { natives: ['frostling', 'galewing', 'boulderon', 'brawlix', 'slumbear', 'drakorn', 'lumawool', 'coilizard', 'bellpaca', 'shellmet', 'bulwarden'], bosses: ['frostling', 'slumbear', 'boulderon'] },
  grotto: { natives: ['mindra', 'wispurr', 'shadefang', 'pixibelle', 'lumawool', 'venomire', 'gearhulk', 'voltergeist', 'garrishell', 'bulwarden'], bosses: ['gearhulk', 'mindra', 'wispurr'] },
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
function genFloor(floorN, partyIds, relics = [], last = false, offers = 3) {
  for (let tries = 0; tries < 2000; tries++) {
    const f = tryFloor(floorN, partyIds, relics, last, offers);
    if (f) return f;
  }
  throw new Error('could not build a floor');
}

function tryFloor(floorN, partyIds, relics, last, offers = 3) {
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
  // the evolution altar: from floor 3, when there's a spare dead end (relics are offered there to evolve a monster at its last stage)
  const altar = floorN >= 3 && rest[3] && Math.random() < 0.65 ? rest[3] : null;

  const ids = ROSTER.map(m => m.id);
  for (const r of rooms) {
    r.type = r === start ? 'start' : r === boss ? 'boss' : r === recruit ? 'recruit' : r === shop ? 'shop' : r === treasure ? 'treasure' : r === altar ? 'altar' : 'fight';
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
      r.offer = [...local, ...shuffle(ids.filter(id => !partyIds.includes(id) && !local.includes(id)))].slice(0, offers);
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
const SAVE_KEY = 'monsterRush.save.v1';
const RUN_KEY = 'monsterRush.run';   // the run in progress (Save.saveRun); RUN_SAVE_VERSION is bumped when its shape changes
const RUN_SAVE_VERSION = 1;   // the storage key stays the same; the version lives inside
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
  data: { version: SAVE_VERSION, starters: [...STARTERS], runs: 0, wins: 0, bestFloor: 0, bestEndless: 0, recruited: [], found: [], trainers: ['scarf'], settings: { ...DEFAULT_SETTINGS } },
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
  // altar evolutions you've made (named on the altar; the rest show as ???)
  unlockTrainer(id) {
    const have = this.data.trainers = this.data.trainers || ['scarf'];
    if (!TRAINERS[id] || have.includes(id)) return false;
    have.push(id); this.write(); return true;
  },
  hasTrainer(id) { return id === 'scarf' || (this.data.trainers || []).includes(id); },
  hasFound(id) { return (this.data.found || []).includes(id); },
  noteFound(id) { if (!this.hasFound(id)) { (this.data.found = this.data.found || []).push(id); this.write(); } },
  // The run in progress, so a refresh (or closing the app) can carry on where you were. Kept under
  // its own key; RunState.toSave / fromSave turn a run into plain data and back.
  saveRun(d) { try { localStorage.setItem(RUN_KEY, JSON.stringify(d)); } catch (e) { /* storage full or blocked: no continue */ } },
  loadRun() { try { const d = JSON.parse(localStorage.getItem(RUN_KEY)); return d && d.v === RUN_SAVE_VERSION ? d : null; } catch (e) { return null; } },
  clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* ignore */ } },
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
// The trainers, chosen before the starter. Every trainer wears the bracer that holds monsters as
// data; each brings a starting power, and the stronger powers come with a drawback (like Isaac's
// characters). look: 'm' or 'f' (him or her; pixel.js TRAINER_LOOKS draws each). perk works like a relic that can't be lost (bonus,
// mods, on); the rest are read by RunState. unlock: how it's earned (trainerUnlocks in main.js).
const TRAINERS = {
  scarf: { name: 'SCARF TAMER', power: 'Tag Team',
    desc: 'Swapping recharges twice as fast, and a Coreature you swap in hits 25% harder for 4 seconds.', drawback: null, unlock: null,
    perk: { mods: { swapCdMul: 0.5 }, on: { swapIn(b, m) { m.buffs.push({ stat: 'atk', mul: 1.25, t: 4 }); } } } },
  researcher: { name: 'FIELD RESEARCHER', power: 'Field Notes',
    desc: 'Your party earns 30% more XP, and recruit rooms offer 4 Coreatures instead of 3.', drawback: 'Your Coreatures deal 10% less damage.',
    unlock: 'Recruit 10 different Coreatures.', perk: { bonus: { atk: 0.9 } }, xpMul: 1.3, offers: 4 },
  diver: { name: 'DUNGEON DIVER', power: 'Delver',
    desc: 'Starts with a random relic, and the lantern shows the whole map of every floor.', drawback: 'An old salvaged Arcbracer: only 4 Arc-core slots.',
    unlock: 'Reach floor 4.', partyMax: 4, reveal: true, startRelic: true },
  shiba: { name: 'SHIBA TRAINER', power: 'Pack Leader',
    desc: 'Toshi (Smugshi) joins your run as a free extra Coreature.', drawback: 'Wild Coreatures drop 30% fewer coins.',
    unlock: 'Win a run with Smugshi in your party.', perk: { mods: { coinMul: 0.7 } }, companion: 'smugshi' },
};
class RunState {
  // endless: floors never stop (the boss always opens stairs); the run ends when the party faints
  constructor(starterId, endless = false, trainer = 'scarf', look = 'm') {
    this.endless = endless;
    this.trainer = TRAINERS[trainer] ? trainer : 'scarf'; this.look = look;
    this.party = [new Mon(ROSTER_BY_ID[starterId], 'player')];
    if (this.T.companion) this.party.push(new Mon(ROSTER_BY_ID[this.T.companion], 'player'));   // the Shiba trainer's Toshi
    this.pi = 0;
    this.coins = 0;
    this.swapCd = 0;
    this.relics = [];
    this.learnQueue = [];   // new moves waiting to be offered between fights: [{ mon, id }]
    this.stats = { rooms: 0, kos: 0, time: 0, floors: 0 };
    this.newFloor(1);
    if (this.T.startRelic) { const free = Object.keys(RELICS); this.addRelic(free[(Math.random() * free.length) | 0]); }
    this.applyRelics();
  }
  get T() { return TRAINERS[this.trainer] || TRAINERS.scarf; }
  get perk() { return this.T.perk || null; }
  get partyMax() { return this.T.partyMax || 6; }   // the bracer's slots
  get reveal() { return !!this.T.reveal; }
  newFloor(n) {
    // the old floor's room pictures and scorch marks: freed now (phones cap canvas memory)
    if (this.floor) for (const r of this.floor.rooms) { freeCanvas(r.canvas); freeCanvas(r.decal); delete r.canvas; delete r.decal; }
    this.floorN = n;
    this.floor = genFloor(n, this.party.map(m => m.def.from || m.id), this.relics, !this.endless && n === RUN_FLOORS, this.T.offers || 3);
    this.warm();
    // fainted monsters get back up at 30% for the new floor
    for (const m of this.party) if (m.fainted) { m.fainted = false; m.hp = Math.round(m.maxHp * REVIVE_HP); m.status = null; }
    if (this.party[this.pi].fainted) this.pi = this.party.findIndex(m => !m.fainted);
    this.room = this.floor.start;
  }
  get stageKey() { return this.floor.stage; }
  // The whole run as plain data (Save.saveRun): the party, relics, coins, stats, and the floor with
  // every room's state; rooms point to each other by index. Room pictures are redrawn from their seed.
  toSave() {
    const rooms = this.floor.rooms, at = r => rooms.indexOf(r);
    const SKIP = new Set(['doors', 'canvas', 'torches', 'decal']);
    return {
      v: RUN_SAVE_VERSION, endless: this.endless, trainer: this.trainer, look: this.look, pi: this.pi, coins: this.coins, relics: this.relics, stats: this.stats, floorN: this.floorN,
      room: at(this.room),
      party: this.party.map(m => ({ id: m.id, level: m.level, xp: m.xp, hp: Math.round(m.hp), fainted: m.fainted,
        moves: m.moves.map(x => x.id), known: m.known, newMoves: m.newMoves || [], fused: m.fused || [] })),
      learnQueue: this.learnQueue.map(q => ({ mon: this.party.indexOf(q.mon), id: q.id })).filter(q => q.mon >= 0),
      floor: { n: this.floor.n, last: this.floor.last, stage: this.floor.stage, start: at(this.floor.start), boss: at(this.floor.boss),
        rooms: rooms.map(r => {
          const o = {};
          for (const [k, val] of Object.entries(r)) if (!SKIP.has(k)) o[k] = val;
          o.doors = Object.fromEntries(Object.entries(r.doors).map(([dir, to]) => [dir, at(to)]));
          return o;
        }) },
    };
  }
  static fromSave(d) {
    const run = Object.create(RunState.prototype);
    Object.assign(run, { endless: d.endless, trainer: d.trainer || 'scarf', look: d.look || 'm', pi: d.pi, coins: d.coins, relics: d.relics, stats: d.stats, floorN: d.floorN, swapCd: 0 });
    run.party = d.party.map(o => {
      const m = new Mon(ROSTER_BY_ID[o.id], 'player');
      m.setLevel(o.level); m.xp = o.xp;
      m.known = o.known; m.setMoves(o.moves); m.newMoves = o.newMoves; m.fused = o.fused;
      m.hp = Math.min(m.maxHp, o.hp); m.fainted = o.fainted;
      return m;
    });
    run.learnQueue = d.learnQueue.map(q => ({ mon: run.party[q.mon], id: q.id }));
    const rooms = d.floor.rooms.map(o => ({ ...o, doors: {} }));
    d.floor.rooms.forEach((o, i) => { for (const [dir, j] of Object.entries(o.doors)) rooms[i].doors[dir] = rooms[j]; });
    run.floor = { n: d.floor.n, last: d.floor.last, stage: d.floor.stage, rooms, start: rooms[d.floor.start], boss: rooms[d.floor.boss] };
    run.room = rooms[d.room];
    run.applyRelics();
    run.warm();
    return run;
  }
  // draw this floor's monsters (and what the party evolves into) in the background, a little at a time
  warm() {
    const ids = [];
    for (const m of this.party) { ids.push(m.id); if (m.def.evolve) ids.push(m.def.evolve.to); ids.push(...Object.keys(m.def.branches || {})); }   // and what it can become
    for (const r of this.floor.rooms) { for (const e of r.enemies) ids.push(e.id); if (r.offer) ids.push(...r.offer); }
    forgetSprites(new Set(ids));   // everyone else's pictures go (drawn again if they turn up)
    warmSprites(ids);
  }
  addRelic(id) { if (!this.relics.includes(id)) this.relics.push(id); this.applyRelics(); }
  // stat relics multiply into every party member's bonus
  applyRelics() {
    const b = { atk: 1, def: 1, spd: 1, cd: 1 };
    for (const id of this.relics) for (const [k, v] of Object.entries(RELICS[id].bonus || {})) b[k] *= v;
    for (const [k, v] of Object.entries((this.perk && this.perk.bonus) || {})) b[k] *= v;   // the trainer's power
    for (const m of this.party) {
      m.bonus = { ...b };
      for (const id of m.fused || []) for (const [k, v] of Object.entries(RELICS[id].fused.bonus || {})) m.bonus[k] *= v;   // relics fused into it at the altar
    }
    this.dress();
  }
  // everyone in the party wears the relics' gear (js/gear.js); drawn now, while things are calm
  dress() {
    const gear = typeof gearFor === 'function' ? gearFor(this.relics) : [];
    for (const m of this.party) { m.gear = m.fused && m.fused.length ? gearFor([...this.relics, ...m.fused]) : gear; monSprite(m); }
    if (typeof forgetGear === 'function') forgetGear(new Set(this.party.filter(m => m.gear && m.gear.length).map(m => m.id + '|' + m.gear.join(','))));
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
      m.xp += Math.round(amount * (i === this.pi ? 1 : XP_BENCH) * (this.T.xpMul || 1));
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
    this.dress();
    if (m.def.evolve) warmSprites([m.def.evolve.to]);
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
