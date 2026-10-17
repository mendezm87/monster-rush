// Floors (a grid of rooms joined by doors, Isaac-style) and the state of a run.

const RUN_FLOORS = 3;                                    // floors in a normal run (endless mode comes later)
const FLOOR_STAGES = ['meadow', 'crater', 'summit'];
const STARTERS = ['smugshi', 'cinderox', 'tidalisk'];
const ROOM_SIZES = { s: [576, 324], wide: [864, 324], tall: [576, 486], big: [864, 486], boss: [864, 540] };
const REVIVE_HP = 0.3;                                   // fainted party members come back at 30% on a new floor

// Wild monsters are weaker than arena monsters (there can be three of them) and get
// tougher each floor; a boss is close to full arena strength.
const WILD_AI = {
  wild: { think: 0.3, dodge: 0.3, aggro: 0.45, react: 0.45, aimErr: 0.18, lead: false },
  boss: { think: 0.22, dodge: 0.55, aggro: 0.7, react: 0.3, aimErr: 0.1, lead: false },
};
function wildSpec(id, floorN, kind) {
  const f = floorN - 1;
  if (kind === 'boss') return { id, hpMul: 1.3 + 0.3 * f, atkMul: 0.7 + 0.08 * f, scale: 1.35, boss: true, ai: 'boss' };
  if (kind === 'tough') return { id, hpMul: 0.65 + 0.15 * f, atkMul: 0.5 + 0.07 * f, scale: 1.15, ai: 'wild' };
  return { id, hpMul: 0.3 + 0.08 * f, atkMul: 0.36 + 0.07 * f, ai: 'wild' };
}

const pickRand = a => a[(Math.random() * a.length) | 0];
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Who lives in a fight room: 1-3 wild monsters, or sometimes one tougher one.
function makeWave(floorN, sizeKey) {
  const ids = ROSTER.map(m => m.id);
  if (Math.random() < 0.18) return [wildSpec(pickRand(ids), floorN, 'tough')];
  const roomy = sizeKey === 'big' || sizeKey === 'wide' || sizeKey === 'tall';
  const table = floorN === 1 ? [1, 2, 2, 3] : [2, 2, 3, 3];
  let n = pickRand(table);
  if (roomy && n < 3 && Math.random() < 0.5) n++;
  return shuffle(ids.slice()).slice(0, n).map(id => wildSpec(id, floorN, 'wild'));
}

function genFloor(floorN, partyIds) {
  for (let tries = 0; tries < 500; tries++) {
    const f = tryFloor(floorN, partyIds);
    if (f) return f;
  }
  throw new Error('could not build a floor');
}

function tryFloor(floorN, partyIds) {
  const G = 9, target = 8 + Math.min(floorN, 4) + ((Math.random() * 2) | 0);
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
  if (ends.length < 2 || dist.get(ends[0]) < 3) return null;
  const boss = ends[0], recruit = pickRand(ends.slice(1));

  const ids = ROSTER.map(m => m.id);
  for (const r of rooms) {
    r.type = r === start ? 'start' : r === boss ? 'boss' : r === recruit ? 'recruit' : 'fight';
    const sizeKey = r.type === 'boss' ? 'boss' : r.type === 'fight' ? pickRand(['s', 's', 'wide', 'tall', 'big']) : 's';
    [r.w, r.h] = ROOM_SIZES[sizeKey];
    r.seed = (Math.random() * 1e9) | 0;
    r.cleared = r.type !== 'fight' && r.type !== 'boss';
    r.visited = false;
    r.pickups = [];
    r.enemies = r.type === 'fight' ? makeWave(floorN, sizeKey) : [];
    if (r.type === 'boss') {
      const big = ROSTER.filter(m => m.size === 'L').map(m => m.id);
      r.enemies = [wildSpec(pickRand(Math.random() < 0.6 ? big : ids), floorN, 'boss')];
    }
    if (r.type === 'recruit') r.offer = shuffle(ids.filter(id => !partyIds.includes(id))).slice(0, 3);
  }
  return { n: floorN, rooms, start, boss, stage: FLOOR_STAGES[(floorN - 1) % FLOOR_STAGES.length] };
}

// Everything that lasts for one run.
class RunState {
  constructor(starterId) {
    this.party = [new Mon(ROSTER_BY_ID[starterId], 'player')];
    this.pi = 0;
    this.coins = 0;
    this.swapCd = 0;
    this.stats = { rooms: 0, kos: 0, time: 0, floors: 0 };
    this.newFloor(1);
  }
  newFloor(n) {
    this.floorN = n;
    this.floor = genFloor(n, this.party.map(m => m.id));
    // fainted monsters get back up at 30% for the new floor
    for (const m of this.party) if (m.fainted) { m.fainted = false; m.hp = Math.round(m.maxHp * REVIVE_HP); m.status = null; }
    if (this.party[this.pi].fainted) this.pi = this.party.findIndex(m => !m.fainted);
    this.room = this.floor.start;
  }
  get stageKey() { return this.floor.stage; }
  recruit(id, releaseIdx = -1) {
    const m = new Mon(ROSTER_BY_ID[id], 'player');
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
