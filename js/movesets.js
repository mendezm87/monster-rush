// Custom move sets: each monster can swap its moves for others it could plausibly learn.
//
// The pool for a monster is its own 4 moves plus every move another monster knows whose type is
// one of its own types or one of their themed "coverage" types (COVERAGE, a bit like learnsets:
// fire can also learn earth, arcane and beast moves), except signature moves, which stay with
// their owner (Smugshi is the owner's dog Toshi; Mondaze has its own personality moves), and
// moves only an evolved form knows (they're what evolving brings). A set is 4 different moves
// with at least one that does damage.
// Shared by both games (keep the file identical): Monster Battle Stadium uses MoveSets for its
// team screen (sets kept per player in this browser; the CPU uses the defaults); Deep Archive
// uses movePool for the moves monsters learn as they level up during a run.

const SIGNATURE = new Set(['smugshi', 'mondaze', 'smugshogun'].filter(id => ROSTER_BY_ID[id]).flatMap(id => ROSTER_BY_ID[id].moves));
const DAMAGING = k => !['buff', 'heal'].includes(MOVES[k].kind);
const COVERAGE = {
  beast: ['brawl', 'earth'], brawl: ['earth', 'beast', 'metal'], fire: ['earth', 'arcane', 'beast'], water: ['ice', 'arcane', 'beast'],
  plant: ['earth', 'glitch'], electric: ['metal', 'beast'], ice: ['water', 'wind'], earth: ['fire', 'metal', 'brawl'],
  wind: ['beast', 'arcane'], metal: ['earth', 'electric'], glitch: ['shade', 'plant'], arcane: ['phantom', 'plant', 'beast'],
  shade: ['phantom', 'glitch', 'brawl'], phantom: ['shade', 'arcane', 'glitch'], dragonkin: ['fire', 'wind', 'earth'],
};

const _pools = {};
function movePool(id) {
  if (_pools[id]) return _pools[id];
  const def = ROSTER_BY_ID[id], pool = [...def.moves];
  const types = new Set(def.types.flatMap(t => [t, ...(COVERAGE[t] || [])]));
  for (const m of ALL_MONS()) {
    if (m.id === id || m.from) continue;   // evolved forms' moves stay with them
    for (const k of m.moves) {
      if (pool.includes(k) || SIGNATURE.has(k)) continue;
      if (types.has(MOVES[k].type)) pool.push(k);
    }
  }
  return (_pools[id] = pool);
}

// a set that's allowed for this monster, or null
function validSet(id, moves) {
  if (!Array.isArray(moves) || moves.length !== 4 || new Set(moves).size !== 4) return null;
  const pool = movePool(id);
  if (!moves.every(k => pool.includes(k)) || !moves.some(DAMAGING)) return null;
  return moves.slice();
}

// Coreatures whose code names changed (r158, the owner: no old names left in the code to confuse anyone): saves
// made before then still say the old ones, so everything loaded from storage goes through renameIds first.
const ID_RENAMES = { boulderon: 'slabominable', drakorn: 'nyxdrake', scarablade: 'bugilist', polarest: 'polaroar', bambooze: 'pandawn', grizzleep: 'grizzquake' };
const renameIds = json => (typeof json === 'string' ? json.replace(new RegExp(`"(${Object.keys(ID_RENAMES).join('|')})"`, 'g'), (m, id) => `"${ID_RENAMES[id]}"`) : json);

const MoveSets = {
  KEY: 'mbs.movesets.v1',
  sets: [{}, {}],   // per player (player 2 only in local 2-player): monster id -> 4 move ids
  load() {
    try {
      const d = JSON.parse(renameIds(localStorage.getItem(this.KEY)));
      if (d && Array.isArray(d.sets)) this.sets = d.sets.map(s => Object.fromEntries(Object.entries(s || {}).filter(([id, mv]) => ROSTER_BY_ID[id] && validSet(id, mv))));
      while (this.sets.length < 2) this.sets.push({});
    } catch (e) { /* storage blocked or broken: defaults */ }
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify({ sets: this.sets })); } catch (e) { /* ignore */ } },
  get(p, id) { return this.sets[p][id] || ROSTER_BY_ID[id].moves.slice(); },
  isDefault(p, id) { return !this.sets[p][id]; },
  // put move `k` in slot `slot`; if it's already elsewhere in the set, the two trade places
  set(p, id, slot, k) {
    const cur = this.get(p, id), at = cur.indexOf(k);
    if (at >= 0) cur[at] = cur[slot];
    cur[slot] = k;
    if (!validSet(id, cur)) return false;
    if (cur.every((x, i) => x === ROSTER_BY_ID[id].moves[i])) delete this.sets[p][id]; else this.sets[p][id] = cur;
    this.save();
    return true;
  },
  reset(p, id) { delete this.sets[p][id]; this.save(); },
  // a team as it goes into a battle (and over the network): [{ id, moves }]
  team(p, ids) { return ids.map(id => ({ id, moves: this.get(p, id) })); },
};
MoveSets.load();
