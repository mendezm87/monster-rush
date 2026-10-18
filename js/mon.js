// Shared helpers for the room code, and Mon: one monster in a room (yours or wild).

const TAU = Math.PI * 2;
const SPR_SCALE = 1.5;   // world units per sprite pixel (3 canvas px at 2x)
const DMG_SCALE = 0.8;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let _uid = 1;
const BERRY_HEAL = 0.25;   // a berry heals a quarter of your active monster's HP
// The Ember Tracks relic's fire pools.
// a spiky champion's spines (it hurts to touch one)
const SPIKE_MV = { id: 'spikes', name: 'Spikes', type: 'normal', kind: 'dash', power: 70 };
const EMBER_MV = { id: 'emberTrail', name: 'Ember Trail', type: 'fire', kind: 'zone', power: 60, linger: 1.4, tick: 0.35, status: ['brn', 0.1] };

// opts (wild monsters): hpMul / atkMul scale the arena stats, scale draws it bigger, boss marks a boss.
class Mon {
  constructor(def, side, opts = {}) {
    this.side = side;
    this.atkMul = opts.atkMul || 1;
    this.hpMul = opts.hpMul || 1;
    this.scale = opts.scale || 1;
    this.boss = !!opts.boss;
    this.final = !!opts.final;   // the run's final boss
    this.champ = opts.champ || null;   // a champion's trait (CHAMPIONS)
    this.small = !!opts.small;   // a splitting champion's copy
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
    const share = this.maxHp ? this.hp / this.maxHp : 1, old = this.def, prev = this.moves && this.moves.map(m => m.id);
    this.def = def; this.id = def.id;
    this.item = ITEMS[def.item] || {};
    this.maxHp = this.calcMaxHp(); this.hp = Math.round(this.maxHp * share);
    this.r = (def.size === 'L' ? 17 : 12) * this.scale;
    this.h = SPRITES[def.id].size * SPR_SCALE * this.scale;
    // Moves: `moves` are the 4 in use (slot order = left click, right click, Shift + left,
    // Shift + right); `known` is every move it has learned, to swap in (movesets.js, RunState).
    // Evolving upgrades each of the old form's own moves in place, so custom choices stay.
    let ids = def.moves.slice();
    if (prev && old) {
      ids = prev.map(k => (old.moves.includes(k) ? def.moves[old.moves.indexOf(k)] : k));
      if (new Set(ids).size < 4) ids = [...new Set([...ids, ...def.moves])].slice(0, 4);
    }
    this.known = [...new Set([...(this.known || []), ...(prev || []), ...def.moves])];
    this.setMoves(ids);
  }
  setMoves(ids) {
    this.moves = ids.map(k => MOVES[k]);
    const melee = this.moves.filter(m => m.kind === 'dash' || m.kind === 'burst' || m.kind === 'vortex').length;
    const ranged = this.moves.filter(m => ['projectile', 'beam', 'zone'].includes(m.kind)).length;
    this.prefRange = melee > ranged ? 45 : melee === ranged ? 85 : 125;
  }
  // Put a known move in a slot. If it's already in another slot, the two trade places
  // (that's also how moves are moved to a different click). Cooldowns move with their move.
  equip(slot, id) {
    const ids = this.moves.map(m => m.id), at = ids.indexOf(id);
    if (!this.known.includes(id)) return false;
    if (at >= 0) [ids[at], ids[slot]] = [ids[slot], ids[at]]; else ids[slot] = id;
    if (!ids.some(k => !['buff', 'heal'].includes(MOVES[k].kind))) return false;   // keep at least one attack
    if (at >= 0) [this.cd[at], this.cd[slot]] = [this.cd[slot], this.cd[at]]; else this.cd[slot] = 0;
    this.setMoves(ids);
    return true;
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
  cdMul() { return (this.item.cd || 1) * this.bonus.cd * (this.champ === 'swift' ? 0.75 : 1); }
  // Gain levels; HP grows with the level (and the new HP comes filled in).
  setLevel(n) {
    const old = this.maxHp;
    this.level = n;
    this.maxHp = this.calcMaxHp();
    if (!this.fainted) this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - old));
  }
  speed() {
    return this.def.spd * (this.item.spd || 1) * this.bonus.spd * this.buffMul('spd') * (this.champ === 'swift' ? 1.4 : 1) *
      (this.status === 'par' ? 0.55 : 1) * (this.slowT > 0 ? 0.55 : 1);
  }
  canAct() { return this.visible && !this.fainted && !this.action && this.stunT <= 0 && this.status !== 'frz'; }
  // Turn to look along (dx, dy): the back when heading up the screen, the front when
  // heading down, the side or a diagonal (flipped by face) otherwise. See viewFor.
  look(dx, dy) {
    const v = viewFor(dx, dy, this.view, SPRITES[this.id].diag);
    if (!v) return;
    this.view = v;
    if (isSideView(v) && Math.abs(dx) > 0.001) this.face = Math.sign(dx);
  }
}
