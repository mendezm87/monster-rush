// Game data: types, type chart, moves, items and the monster roster.

const TYPES = {
  normal:   { name: 'NORMAL',   color: '#a8a77a', fx: ['#ff8a2a', '#ffd36b', '#fffbe6'] },
  fire:     { name: 'FIRE',     color: '#ee8130', fx: ['#ff4a1c', '#ffa424', '#fff3b0'] },
  water:    { name: 'WATER',    color: '#6390f0', fx: ['#2f6bff', '#6fb6ff', '#e6f6ff'] },
  grass:    { name: 'GRASS',    color: '#7ac74c', fx: ['#2f9e3a', '#8be04e', '#eaffc8'] },
  electric: { name: 'ELECTRIC', color: '#e8c020', fx: ['#ffc21f', '#fff27a', '#ffffff'] },
  ice:      { name: 'ICE',      color: '#7cc8d8', fx: ['#5ab8e8', '#aeeaff', '#ffffff'] },
  ground:   { name: 'GROUND',   color: '#d4a84e', fx: ['#8a5a2b', '#d6a356', '#f7e2b0'] },
  rock:     { name: 'ROCK',     color: '#b6a136', fx: ['#6e5a3a', '#b59a62', '#efe0b8'] },
  dragon:   { name: 'DRAGON',   color: '#6f35fc', fx: ['#5a2bd6', '#a77bff', '#f1e6ff'] },
  psychic:  { name: 'PSYCHIC',  color: '#f95587', fx: ['#d62f8a', '#ff8ad0', '#ffe6f6'] },
  dark:     { name: 'DARK',     color: '#705746', fx: ['#2a1a3a', '#7a4aa8', '#e2d0ff'] },
  fighting: { name: 'FIGHTING', color: '#c22e28', fx: ['#b0281e', '#ff6a3a', '#ffe0c8'] },
  flying:   { name: 'FLYING',   color: '#a98ff3', fx: ['#7a8ae8', '#c8d4ff', '#ffffff'] },
  poison:   { name: 'POISON',   color: '#a33ea1', fx: ['#7a2a9a', '#c86ae0', '#f0d0ff'] },
  bug:      { name: 'BUG',      color: '#a6b91a', fx: ['#6a8a12', '#c8e03a', '#f4ffc0'] },
  ghost:    { name: 'GHOST',    color: '#735797', fx: ['#3a2a6a', '#8a6ad8', '#e0d4ff'] },
  steel:    { name: 'STEEL',    color: '#b7b7ce', fx: ['#7a8498', '#c8d0e0', '#ffffff'] },
  fairy:    { name: 'FAIRY',    color: '#d685ad', fx: ['#e86aa8', '#ffb4dc', '#fff0fa'] },
};

// attacker -> defender -> multiplier (missing = 1). The full 18-type chart; immunities
// are softened to 0.25 because a real-time fight with a zero-damage matchup is just frustrating.
const CHART = {
  normal:   { rock: 0.5, ghost: 0.25, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0.25, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0.25, bug: 0.5, rock: 2, steel: 2 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0.25 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0.25, steel: 0.5 },
  dark:     { psychic: 2, ghost: 2, dark: 0.5, fighting: 0.5, fairy: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0.25 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0.25 },
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  ghost:    { psychic: 2, ghost: 2, dark: 0.5, normal: 0.25 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
};

function typeEffect(moveType, defTypes) {
  let m = 1;
  for (const t of defTypes) {
    const row = CHART[moveType];
    if (row && row[t] !== undefined) m *= row[t];
  }
  return m;
}

/*
 Move kinds:
  projectile  - fires `count` shots (spread in radians), optional homing / explode radius / slow
  beam        - charges, then a sustained beam that ticks damage; optional recharge stun
  dash        - user rushes toward the target and hits on contact; optional recoil
  burst       - shockwave around the user after a short telegraph
  zone        - marked circles land on/near the target after a delay
  buff        - temporary stat multiplier
  heal        - restores a fraction of max HP
  vortex      - the user stands still and pulls the opponent in (`pull` px/s) inside `r`, grinding it for `dur`
 Modifiers that work on any damaging kind:
  drain: f      - the attacker heals f x the damage dealt
  boomerang     - (projectile) flies out `range`, then returns to the thrower, hitting on both passes
  hits: n       - (dash) on contact, stays on the target and lands n hits of `power` each
  linger: s     - (zone) leaves a pool for s seconds that hits for `tick` x power every 0.5 s
  pull: n       - (lingering zone) drags opponents toward its middle at n px/s (Tornado)
  hitGap: s     - (combo dash) seconds between hits (0.13 by default)
  cone: a       - (burst) blows out in front instead of all round: a cone of half-angle a radians,
                  reaching `r`, lasting `blow` seconds and hitting 3 times (Blizzard, Gust); push = knockback
  ripple: s     - (burst) a ring that travels out to `r` over s seconds, hitting as it passes (Dark Pulse)
  fx: name      - a look of its own, drawn in fx.js (wheel, aura, roll, claw, slash, flurry, wool,
                  bubble, mud, stare, tornado)
 status: [kind, chance]  (par / brn / frz / psn)
 Not every monster needs a beam; some types have none.
*/
const MOVES = {
  // electric
  voltRush:     { name: 'Volt Rush', type: 'electric', kind: 'dash', power: 300, cd: 5, speed: 330, dur: 0.4, recoil: 0.2, status: ['par', 0.3] },
  thunderbolt:  { name: 'Thunderbolt', type: 'electric', kind: 'projectile', power: 150, cd: 2.2, speed: 250, r: 5, status: ['par', 0.15] },
  thunder:      { name: 'Thunder', type: 'electric', kind: 'zone', power: 270, cd: 6, r: 24, delay: 0.85, status: ['par', 0.3], fx: 'bolt' },
  woolTackle:   { name: 'Wool Tackle', type: 'normal', kind: 'dash', power: 170, cd: 2.6, speed: 320, dur: 0.38, fx: 'wool' },
  staticSiphon: { name: 'Static Siphon', type: 'electric', kind: 'projectile', power: 105, cd: 3.5, speed: 240, r: 6, drain: 0.5 },
  discharge:    { name: 'Discharge', type: 'electric', kind: 'burst', power: 220, cd: 5, r: 62, delay: 0.45, status: ['par', 0.3] },
  voltCannon:   { name: 'Volt Cannon', type: 'electric', kind: 'beam', power: 260, cd: 6, charge: 0.55, dur: 0.5, width: 10, len: 280, status: ['par', 0.4] },
  // normal
  megaBeam:     { name: 'Mega Beam', type: 'normal', kind: 'beam', power: 480, cd: 9, charge: 0.75, dur: 0.9, width: 16, len: 330, recharge: 1.3 },
  bodySlam:     { name: 'Body Slam', type: 'normal', kind: 'dash', power: 210, cd: 3.6, speed: 250, dur: 0.45, status: ['par', 0.3] },
  snack:        { name: 'Snack Time', type: 'normal', kind: 'heal', amount: 0.35, cd: 16 },
  // fire
  flameWheel:   { name: 'Flame Wheel', type: 'fire', kind: 'dash', power: 220, cd: 3.5, speed: 300, dur: 0.42, status: ['brn', 0.25], fx: 'wheel' },
  flamethrower: { name: 'Flamethrower', type: 'fire', kind: 'beam', power: 290, cd: 6, charge: 0.45, dur: 0.7, width: 11, len: 240, status: ['brn', 0.25] },
  fireBlast:    { name: 'Fire Blast', type: 'fire', kind: 'projectile', power: 330, cd: 7, speed: 165, r: 8, explode: 32, status: ['brn', 0.3] },
  eruption:     { name: 'Eruption', type: 'fire', kind: 'burst', power: 300, cd: 7, r: 74, delay: 0.42, status: ['brn', 0.25] },
  // water
  hydroCannon:  { name: 'Hydro Cannon', type: 'water', kind: 'beam', power: 320, cd: 6.5, charge: 0.5, dur: 0.7, width: 12, len: 270 },
  bubbleBeam:   { name: 'Bubble Spray', type: 'water', kind: 'projectile', power: 55, cd: 2, speed: 170, r: 4, count: 5, spread: 0.5, slow: 1.5, fx: 'bubble' },
  aquaJet:      { name: 'Aqua Jet', type: 'water', kind: 'dash', power: 115, cd: 2.2, speed: 410, dur: 0.25 },
  whirlpool:    { name: 'Whirlpool', type: 'water', kind: 'vortex', power: 350, cd: 6, r: 100, dur: 1.4, pull: 115 },
  // grass
  razorLeaf:    { name: 'Razor Leaf', type: 'grass', kind: 'projectile', power: 90, cd: 1.8, speed: 255, r: 4, count: 2, spread: 0.15 },
  solarBeam:    { name: 'Solar Beam', type: 'grass', kind: 'beam', power: 420, cd: 9, charge: 1.0, dur: 0.8, width: 16, len: 320 },
  seedBomb:     { name: 'Seed Bomb', type: 'grass', kind: 'zone', power: 150, cd: 4.5, r: 22, delay: 0.75, count: 3, scatter: 30 },
  photosynth:   { name: 'Photosynth', type: 'grass', kind: 'heal', amount: 0.3, cd: 14 },
  cottonGuard:  { name: 'Cotton Guard', type: 'grass', kind: 'buff', buff: { def: 1.8 }, dur: 7, cd: 15 },
  // ground
  heavyStomp:   { name: 'Heavy Stomp', type: 'ground', kind: 'burst', power: 210, cd: 5, r: 52, delay: 0.5 },
  quicksand:    { name: 'Quicksand', type: 'ground', kind: 'zone', power: 110, cd: 6, r: 36, delay: 0.8, linger: 3, tick: 0.3, slow: 1.2 },
  quake:        { name: 'Quake', type: 'ground', kind: 'burst', power: 300, cd: 8, r: 92, delay: 0.8 },
  mudShot:      { name: 'Mud Shot', type: 'ground', kind: 'projectile', power: 110, cd: 2, speed: 210, r: 5, slow: 2, fx: 'mud', palette: ['#3e2612', '#6b4423', '#9a6a3a'] },
  // ice
  iceShard:     { name: 'Ice Shard', type: 'ice', kind: 'projectile', power: 85, cd: 1.3, speed: 330, r: 3 },
  frostRay:     { name: 'Frost Ray', type: 'ice', kind: 'beam', power: 240, cd: 5.5, charge: 0.4, dur: 0.6, width: 9, len: 270, status: ['frz', 0.2] },
  blizzard:     { name: 'Blizzard', type: 'ice', kind: 'burst', power: 230, cd: 7, r: 130, delay: 0.35, cone: 0.55, blow: 0.6, status: ['frz', 0.25] },
  frostArmor:   { name: 'Frost Armor', type: 'ice', kind: 'buff', buff: { def: 1.5 }, dur: 8, cd: 15 },
  // dragon
  dragonPulse:  { name: 'Dragon Pulse', type: 'dragon', kind: 'beam', power: 270, cd: 5, charge: 0.45, dur: 0.55, width: 12, len: 290 },
  dragonClaw:   { name: 'Dragon Claw', type: 'dragon', kind: 'dash', power: 165, cd: 2.4, speed: 340, dur: 0.3, fx: 'claw' },
  starfall:     { name: 'Starfall', type: 'dragon', kind: 'zone', power: 200, cd: 9, r: 26, delay: 1.0, count: 4, scatter: 50, fx: 'meteor' },
  dragonDance:  { name: 'Dragon Dance', type: 'dragon', kind: 'buff', buff: { atk: 1.3, spd: 1.3 }, dur: 8, cd: 15 },
  // rock
  rockSlide:    { name: 'Rock Slide', type: 'rock', kind: 'zone', power: 145, cd: 4, r: 20, delay: 0.7, count: 4, scatter: 40, fx: 'rock' },
  rollout:      { name: 'Rollout', type: 'rock', kind: 'dash', power: 185, cd: 3.2, speed: 280, dur: 0.55, fx: 'roll' },
  // psychic
  psybeam:      { name: 'Psybeam', type: 'psychic', kind: 'beam', power: 210, cd: 4, charge: 0.35, dur: 0.5, width: 9, len: 270, slow: 2 },
  mindOrbs:     { name: 'Mind Orbs', type: 'psychic', kind: 'projectile', power: 120, cd: 2.4, speed: 165, r: 5, count: 2, spread: 0.7, homing: 2.6 },
  foresight:    { name: 'Foresight', type: 'psychic', kind: 'zone', power: 300, cd: 8, r: 30, delay: 1.6 },
  calmMind:     { name: 'Calm Mind', type: 'psychic', kind: 'buff', buff: { atk: 1.3, def: 1.3 }, dur: 8, cd: 15 },
  // dark
  nightSlash:   { name: 'Night Slash', type: 'dark', kind: 'dash', power: 175, cd: 2.2, speed: 370, dur: 0.25, crit: 0.3, fx: 'slash' },
  darkWave:     { name: 'Dark Wave', type: 'dark', kind: 'burst', power: 195, cd: 4.5, r: 56, delay: 0.4 },
  gloomOrb:     { name: 'Gloom Orb', type: 'dark', kind: 'projectile', power: 180, cd: 3, speed: 185, r: 7 },
  darkPulse:    { name: 'Dark Pulse', type: 'dark', kind: 'burst', power: 250, cd: 5, r: 120, delay: 0.3, ripple: 0.55 },
  // fighting
  closeCombat:  { name: 'Close Combat', type: 'fighting', kind: 'dash', power: 65, cd: 5.5, speed: 320, dur: 0.38, hits: 6, hitGap: 0.06, selfDebuff: { def: 0.75 }, fx: 'flurry' },
  jab:          { name: 'Rapid Jab', type: 'fighting', kind: 'dash', power: 90, cd: 1.4, speed: 420, dur: 0.18 },
  auraSphere:   { name: 'Aura Sphere', type: 'fighting', kind: 'projectile', power: 170, cd: 2.8, speed: 200, r: 6, homing: 3.5 },
  auraCannon:   { name: 'Aura Cannon', type: 'fighting', kind: 'beam', power: 300, cd: 6.5, charge: 0.6, dur: 0.5, width: 14, len: 260 },
  bulkUp:       { name: 'Bulk Up', type: 'fighting', kind: 'buff', buff: { atk: 1.3, def: 1.3 }, dur: 8, cd: 15 },
  // flying
  airSlash:     { name: 'Air Slash', type: 'flying', kind: 'projectile', power: 75, cd: 1.7, speed: 300, r: 4, count: 3, spread: 0.35 },
  razorGale:    { name: 'Razor Gale', type: 'flying', kind: 'projectile', power: 100, cd: 3.5, speed: 290, r: 6, boomerang: true, range: 170 },
  braveDive:    { name: 'Brave Dive', type: 'flying', kind: 'dash', power: 260, cd: 4.5, speed: 380, dur: 0.35, recoil: 0.15 },
  tailwind:     { name: 'Tailwind', type: 'flying', kind: 'buff', buff: { spd: 1.35, atk: 1.15 }, dur: 8, cd: 15 },
  gust:         { name: 'Gust', type: 'flying', kind: 'burst', power: 150, cd: 3.5, r: 100, delay: 0.2, cone: 0.6, blow: 0.3, push: 230, sfx: 'whoosh' },
  tornado:      { name: 'Tornado', type: 'flying', kind: 'zone', power: 95, cd: 7, r: 30, delay: 0.6, linger: 2.4, tick: 0.3, pull: 70, fx: 'tornado' },
  // poison
  sludgeBomb:   { name: 'Sludge Bomb', type: 'poison', kind: 'projectile', power: 200, cd: 3.5, speed: 185, r: 7, explode: 28, status: ['psn', 0.3] },
  toxicPool:    { name: 'Toxic Pool', type: 'poison', kind: 'zone', power: 120, cd: 6, r: 32, delay: 0.9, slow: 1.2, linger: 3, tick: 0.25, status: ['psn', 0.35] },
  acidSpray:    { name: 'Acid Spray', type: 'poison', kind: 'projectile', power: 55, cd: 1.9, speed: 210, r: 4, count: 4, spread: 0.5, status: ['psn', 0.1] },
  venomJet:     { name: 'Venom Jet', type: 'poison', kind: 'beam', power: 220, cd: 5, charge: 0.4, dur: 0.6, width: 10, len: 250, status: ['psn', 0.4] },
  // bug
  megahorn:     { name: 'Megahorn', type: 'bug', kind: 'dash', power: 290, cd: 5, speed: 310, dur: 0.4 },
  beetleBarrage:{ name: 'Beetle Barrage', type: 'bug', kind: 'dash', power: 58, cd: 5, speed: 360, dur: 0.35, hits: 4 },
  pinMissile:   { name: 'Pin Missile', type: 'bug', kind: 'projectile', power: 40, cd: 1.8, speed: 340, r: 3, count: 5, spread: 0.3, fx: 'pin' },
  // ghost
  shadowBall:   { name: 'Shadow Ball', type: 'ghost', kind: 'projectile', power: 175, cd: 2.8, speed: 190, r: 7, homing: 2 },
  phantomStrike:{ name: 'Phantom Strike', type: 'ghost', kind: 'dash', power: 190, cd: 3, speed: 400, dur: 0.28, crit: 0.3 },
  spiritFlames: { name: 'Spirit Flames', type: 'ghost', kind: 'zone', power: 110, cd: 5, r: 18, delay: 0.8, count: 3, scatter: 34, status: ['brn', 0.4] },
  spectralRay:  { name: 'Spectral Ray', type: 'ghost', kind: 'beam', power: 250, cd: 5, charge: 0.45, dur: 0.6, width: 10, len: 290 },
  // steel
  flashCannon:  { name: 'Flash Cannon', type: 'steel', kind: 'beam', power: 330, cd: 7, charge: 0.6, dur: 0.7, width: 14, len: 300 },
  ironSlam:     { name: 'Iron Slam', type: 'steel', kind: 'dash', power: 260, cd: 4, speed: 260, dur: 0.45 },
  magnetStorm:  { name: 'Magnet Storm', type: 'steel', kind: 'zone', power: 160, cd: 6, r: 22, delay: 0.9, count: 3, scatter: 40, status: ['par', 0.15] },
  ironDefense:  { name: 'Iron Defense', type: 'steel', kind: 'buff', buff: { def: 1.6 }, dur: 8, cd: 15 },
  // fairy
  moonblast:    { name: 'Moonblast', type: 'fairy', kind: 'projectile', power: 210, cd: 3.2, speed: 200, r: 7 },
  dazzleBeam:   { name: 'Dazzle Beam', type: 'fairy', kind: 'beam', power: 240, cd: 5, charge: 0.4, dur: 0.6, width: 12, len: 270 },
  fairyWind:    { name: 'Fairy Wind', type: 'fairy', kind: 'projectile', power: 50, cd: 2, speed: 240, r: 4, count: 5, spread: 0.7, fx: 'breeze' },
  wish:         { name: 'Wish', type: 'fairy', kind: 'heal', amount: 0.35, cd: 16 },
  // Toshi (Smugshi): the owner's Shiba Inu
  zoomies:      { name: 'Zoomies', type: 'normal', kind: 'dash', power: 170, cd: 2, speed: 430, dur: 0.35 },
  shibaScream:  { name: 'Shiba Scream', type: 'normal', kind: 'burst', power: 230, cd: 5, r: 60, delay: 0.35, status: ['par', 0.3], sfx: 'shibaScream' },
  smugBeam:     { name: 'Smug Beam', type: 'fairy', kind: 'beam', power: 250, cd: 5, charge: 0.45, dur: 0.6, width: 11, len: 280 },
  blanketNap:   { name: 'Blanket Nap', type: 'normal', kind: 'heal', amount: 0.35, cd: 15 },
  // Mondaze: a burnt-out sloth running on coffee
  deadlineDash: { name: 'Deadline Dash', type: 'dark', kind: 'dash', power: 260, cd: 3.5, speed: 320, dur: 0.45 },
  heavySigh:    { name: 'Heavy Sigh', type: 'normal', kind: 'burst', power: 210, cd: 5, r: 70, delay: 0.5, slow: 2.5 },
  blankStare:   { name: 'Blank Stare', type: 'dark', kind: 'beam', power: 300, cd: 5.5, charge: 0.6, dur: 0.6, width: 10, len: 290, slow: 1.8, fx: 'stare' },
  coffeeBreak:  { name: 'Coffee Break', type: 'normal', kind: 'buff', buff: { spd: 1.6, atk: 1.3 }, dur: 8, cd: 14 },
  // evolved starters' upgraded moves
  zoomiesMax:   { name: 'Zoomies Max', type: 'normal', kind: 'dash', power: 110, cd: 2.6, speed: 440, dur: 0.38, hits: 3 },
  shibaRoar:    { name: 'Shiba Roar', type: 'normal', kind: 'burst', power: 300, cd: 5, r: 78, delay: 0.35, status: ['par', 0.35], sfx: 'shibaScream' },
  supremeSmug:  { name: 'Supreme Smug Beam', type: 'fairy', kind: 'beam', power: 350, cd: 5.5, charge: 0.45, dur: 0.7, width: 15, len: 310 },
  blazeRush:    { name: 'Blaze Rush', type: 'fire', kind: 'dash', power: 290, cd: 3.5, speed: 330, dur: 0.45, status: ['brn', 0.35], fx: 'aura' },
  infernoBeam:  { name: 'Inferno Beam', type: 'fire', kind: 'beam', power: 370, cd: 6, charge: 0.45, dur: 0.75, width: 14, len: 260, status: ['brn', 0.3] },
  magmaQuake:   { name: 'Magma Quake', type: 'ground', kind: 'burst', power: 330, cd: 7, r: 80, delay: 0.55, slow: 1.5 },
  tidalCannon:  { name: 'Tidal Cannon', type: 'water', kind: 'beam', power: 410, cd: 6.5, charge: 0.55, dur: 0.75, width: 15, len: 310 },
  maelstrom:    { name: 'Maelstrom', type: 'water', kind: 'vortex', power: 460, cd: 6, r: 120, dur: 1.6, pull: 140 },
};

for (const k in MOVES) MOVES[k].id = k;   // lets moves be referenced by name over the network

const ITEMS = {
  voltCharm:   { name: 'VOLT CHARM', boostType: 'electric', mul: 1.2 },
  emberStone:  { name: 'EMBER STONE', boostType: 'fire', mul: 1.2 },
  mysticDrop:  { name: 'MYSTIC DROP', boostType: 'water', mul: 1.2 },
  toxicVial:   { name: 'TOXIC VIAL', boostType: 'poison', mul: 1.2 },
  pixieDust:   { name: 'PIXIE DUST', boostType: 'fairy', mul: 1.2 },
  snackPouch:  { name: 'SNACK POUCH', regen: 0.012 },
  swiftFeather:{ name: 'SWIFT FEATHER', spd: 1.12 },
  ironPlate:   { name: 'IRON PLATE', def: 1.12 },
  quickCharm:  { name: 'QUICK CHARM', cd: 0.88 },
  powerBand:   { name: 'POWER BAND', atk: 1.12 },
};

// size: M (32px sprite) or L (44px sprite). spd is movement in px/sec.
const ROSTER = [
  { id: 'sparkit',   name: 'SPARKIT',   types: ['electric'], hp: 820,  atk: 1.2,  def: 0.85, spd: 105, size: 'M', item: 'voltCharm',
    moves: ['voltRush', 'thunderbolt', 'thunder', 'voltCannon'] },
  { id: 'cinderox',  name: 'CINDEROX',  types: ['fire'],     hp: 1200, atk: 1.15, def: 1.1,  spd: 90,  size: 'M', item: 'emberStone',
    moves: ['flameWheel', 'flamethrower', 'fireBlast', 'eruption'] },
  { id: 'tidalisk',  name: 'TIDALISK',  types: ['water'],    hp: 1240, atk: 1.04, def: 1.1,  spd: 86,  size: 'M', item: 'mysticDrop',
    moves: ['hydroCannon', 'bubbleBeam', 'aquaJet', 'whirlpool'] },
  { id: 'thornback', name: 'THORNBACK', types: ['grass', 'ground'], hp: 1260, atk: 0.98, def: 1.25, spd: 70, size: 'M', item: 'ironPlate',
    moves: ['razorLeaf', 'solarBeam', 'seedBomb', 'photosynth'] },
  { id: 'slumbear',  name: 'SLUMBEAR',  types: ['normal'],   hp: 1950, atk: 1.15, def: 1.15, spd: 55,  size: 'L', item: 'snackPouch',
    moves: ['megaBeam', 'bodySlam', 'heavyStomp', 'snack'] },
  { id: 'frostling', name: 'FROSTLING', types: ['ice'],      hp: 960,  atk: 1.1,  def: 0.92, spd: 96,  size: 'M', item: 'quickCharm',
    moves: ['iceShard', 'frostRay', 'blizzard', 'frostArmor'] },
  { id: 'drakorn',   name: 'DRAKORN',   types: ['dragon'],   hp: 1200, atk: 1.2,  def: 1.0,  spd: 88,  size: 'M', item: 'powerBand',
    moves: ['dragonPulse', 'dragonClaw', 'starfall', 'dragonDance'] },
  { id: 'boulderon', name: 'BOULDERON', types: ['rock', 'ground'], hp: 1420, atk: 1.15, def: 1.38, spd: 55, size: 'L', item: 'ironPlate',
    moves: ['rockSlide', 'quicksand', 'rollout', 'quake'] },
  { id: 'mindra',    name: 'MINDRA',    types: ['psychic'],  hp: 900,  atk: 1.22, def: 0.86, spd: 92,  size: 'M', item: 'quickCharm',
    moves: ['psybeam', 'mindOrbs', 'foresight', 'calmMind'] },
  { id: 'shadefang', name: 'SHADEFANG', types: ['dark'],     hp: 980,  atk: 1.2,  def: 0.9,  spd: 108, size: 'M', item: 'swiftFeather',
    moves: ['nightSlash', 'darkWave', 'gloomOrb', 'darkPulse'] },
  { id: 'lumawool',  name: 'LUMAWOOL',  types: ['electric'], hp: 1010, atk: 1.04, def: 1.08, spd: 76,  size: 'M', item: 'voltCharm',
    moves: ['thunderbolt', 'discharge', 'woolTackle', 'cottonGuard'] },
  { id: 'brawlix',   name: 'BRAWLIX',   types: ['fighting'], hp: 1100, atk: 1.25, def: 1.0,  spd: 95,  size: 'M', item: 'powerBand',
    moves: ['closeCombat', 'jab', 'auraSphere', 'auraCannon'] },
  { id: 'galewing',  name: 'GALEWING',  types: ['flying'],   hp: 820,  atk: 1.08, def: 0.92, spd: 115, size: 'M', item: 'swiftFeather',
    moves: ['airSlash', 'gust', 'razorGale', 'tornado'] },
  { id: 'venomire',  name: 'VENOMIRE',  types: ['poison'],   hp: 1020, atk: 1.02, def: 1.08, spd: 78,  size: 'M', item: 'toxicVial',
    moves: ['sludgeBomb', 'toxicPool', 'acidSpray', 'venomJet'] },
  { id: 'scarablade',name: 'SCARABLADE',types: ['bug', 'fighting'], hp: 950, atk: 1.1, def: 1.05, spd: 82, size: 'M', item: 'powerBand',
    moves: ['megahorn', 'pinMissile', 'beetleBarrage', 'bulkUp'] },
  { id: 'wispurr',   name: 'WISPURR',   types: ['ghost'],    hp: 950,  atk: 1.25, def: 0.88, spd: 104, size: 'M', item: 'quickCharm',
    moves: ['shadowBall', 'phantomStrike', 'spiritFlames', 'spectralRay'] },
  { id: 'gearhulk',  name: 'GEARHULK',  types: ['steel'],    hp: 1450, atk: 1.05, def: 1.35, spd: 52,  size: 'L', item: 'ironPlate',
    moves: ['flashCannon', 'ironSlam', 'magnetStorm', 'ironDefense'] },
  { id: 'pixibelle', name: 'PIXIBELLE', types: ['fairy'],    hp: 940,  atk: 1.08, def: 0.96,  spd: 94,  size: 'M', item: 'pixieDust',
    moves: ['moonblast', 'dazzleBeam', 'fairyWind', 'wish'] },
  // Toshi, the owner's real Shiba Inu: fast, smug, loves a blanket
  { id: 'smugshi',   name: 'SMUGSHI',   types: ['normal', 'fairy'], hp: 1080, atk: 1.18, def: 1.0, spd: 110, size: 'M', item: 'snackPouch',
    moves: ['zoomies', 'shibaScream', 'smugBeam', 'blanketNap'] },
  { id: 'mondaze',   name: 'MONDAZE',   types: ['normal', 'dark'], hp: 1220, atk: 1.2, def: 1.15, spd: 70, size: 'M', item: 'powerBand',
    moves: ['deadlineDash', 'heavySigh', 'blankStare', 'coffeeBreak'] },
];

// Evolved forms: a starter becomes one of these at `evolve.level` (see `evolve` on the base
// monster). They aren't part of the wild / recruit pool.
const EVOLVED = [
  { id: 'smugshogun', name: 'SMUGSHOGUN', types: ['normal', 'fairy'], hp: 1360, atk: 1.32, def: 1.1, spd: 114, size: 'L', item: 'snackPouch',
    moves: ['zoomiesMax', 'shibaRoar', 'supremeSmug', 'blanketNap'], from: 'smugshi' },
  { id: 'infernox', name: 'INFERNOX', types: ['fire', 'ground'], hp: 1400, atk: 1.26, def: 1.15, spd: 90, size: 'L', item: 'emberStone',
    moves: ['blazeRush', 'infernoBeam', 'fireBlast', 'magmaQuake'], from: 'cinderox' },
  { id: 'maelstrisk', name: 'MAELSTRISK', types: ['water', 'dragon'], hp: 1560, atk: 1.16, def: 1.22, spd: 88, size: 'L', item: 'mysticDrop',
    moves: ['tidalCannon', 'bubbleBeam', 'dragonPulse', 'maelstrom'], from: 'tidalisk' },
];
const EVOLVE_LEVEL = 6;
for (const e of EVOLVED) ROSTER.find(m => m.id === e.from).evolve = { to: e.id, level: EVOLVE_LEVEL };
const ALL_MONS = () => [...ROSTER, ...EVOLVED];
const ROSTER_BY_ID = Object.fromEntries(ALL_MONS().map(m => [m.id, m]));

const DIFFICULTY = {
  easy:   { think: 0.38, dodge: 0.25, aggro: 0.45, react: 0.55, aimErr: 0.28, lead: false, swap: 0 },
  normal: { think: 0.22, dodge: 0.55, aggro: 0.7,  react: 0.3,  aimErr: 0.1,  lead: false, swap: 1 },
  hard:   { think: 0.12, dodge: 0.85, aggro: 0.92, react: 0.12, aimErr: 0.0,  lead: true, swap: 1.5 },
};
