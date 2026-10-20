// Game data: types, type chart, moves, items and the Coreature roster.

// The 14 types (owner-approved 2026-10-20, replacing the 18 copied from Pokémon): plain names for the
// elements, our own for the six that are only ours (Glitch, Arcane, Shade, Phantom, Beast, Brawl).
// fx = the palette effects use when a move has no `style` of its own (see MOVES).
const TYPES = {
  fire:     { name: 'FIRE', color: '#f0642a', fx: ['#ff4a1c', '#ffa424', '#fff3b0'] },
  water:    { name: 'WATER', color: '#3a8ef0', fx: ['#2f6bff', '#6fb6ff', '#e6f6ff'] },
  electric: { name: 'ELECTRIC', color: '#f4c430', fx: ['#ffc21f', '#fff27a', '#ffffff'] },
  plant:    { name: 'PLANT', color: '#4caf50', fx: ['#2f9e3a', '#8be04e', '#eaffc8'] },
  earth:    { name: 'EARTH', color: '#a07850', fx: ['#8a5a2b', '#d6a356', '#f7e2b0'] },
  ice:      { name: 'ICE', color: '#7ad8f0', fx: ['#5ab8e8', '#aeeaff', '#ffffff'] },
  wind:     { name: 'WIND', color: '#9ab8e8', fx: ['#7a8ae8', '#c8d4ff', '#ffffff'] },
  metal:    { name: 'METAL', color: '#8a96a8', fx: ['#7a8498', '#c8d0e0', '#ffffff'] },
  glitch:   { name: 'GLITCH', color: '#d040c8', fx: ['#7a2a9a', '#c86ae0', '#f0d0ff'] },
  arcane:   { name: 'ARCANE', color: '#8a5ae8', fx: ['#5a2bd6', '#a77bff', '#f1e6ff'] },
  shade:    { name: 'SHADE', color: '#4a3a6a', fx: ['#2a1a3a', '#7a4aa8', '#e2d0ff'] },
  phantom:  { name: 'PHANTOM', color: '#7a8acf', fx: ['#3a2a6a', '#8a6ad8', '#e0d4ff'] },
  beast:    { name: 'BEAST', color: '#c89a6a', fx: ['#ff8a2a', '#ffd36b', '#fffbe6'] },
  brawl:    { name: 'BRAWL', color: '#d8504a', fx: ['#b0281e', '#ff6a3a', '#ffe0c8'] },
};

// Why each type hits hard (2x) or barely hurts (1/2): every matchup has a reason a player could guess,
// and the game shows it the first few times a matchup comes up. attacker -> target -> reason.
const TYPE_WHY = {
  fire:     {"plant": "burns plants", "ice": "melts ice", "shade": "its light chases away the dark"},
  water:    {"fire": "puts fire out", "earth": "wears rock away", "metal": "rusts metal"},
  electric: {"water": "water carries the shock", "metal": "metal carries the shock", "wind": "lightning strikes fliers"},
  plant:    {"water": "plants drink water up", "earth": "roots crack rock"},
  earth:    {"fire": "smothers fire", "electric": "grounds lightning", "ice": "shatters ice", "wind": "rocks knock fliers down"},
  ice:      {"water": "freezes water", "plant": "frost kills plants", "wind": "ices up wings"},
  wind:     {"plant": "blows leaves and bugs away", "beast": "strikes from the sky, out of reach", "brawl": "strikes from the sky, out of reach"},
  metal:    {"earth": "drills and picks break rock", "ice": "smashes ice"},
  glitch:   {"metal": "corrupts machines", "electric": "scrambles power", "arcane": "corrupts the old world's code"},
  arcane:   {"shade": "light drives out darkness", "glitch": "the old code repairs corruption", "phantom": "light banishes spirits"},
  shade:    {"arcane": "darkness swallows light", "beast": "animals fear the dark"},
  phantom:  {"phantom": "it takes a ghost to catch a ghost", "brawl": "a fighter can't block what it can't touch"},
  beast:    {"plant": "tears through plants", "glitch": "raw instinct can't be hacked"},
  brawl:    {"earth": "punches through rock", "beast": "skill beats raw instinct"},
};
const TYPE_WHY_HALF = {
  fire:     {"water": "water puts it out", "earth": "rock doesn't burn", "fire": "fire on fire"},
  water:    {"plant": "plants soak it up", "water": "water on water"},
  electric: {"earth": "rock is grounded", "electric": "lightning on lightning"},
  plant:    {"fire": "plants burn up", "metal": "can't cut metal", "wind": "vines can't reach the sky", "plant": "plant on plant"},
  earth:    {"metal": "metal is harder", "beast": "tough hides shrug off rocks", "phantom": "rocks pass right through"},
  ice:      {"fire": "ice melts", "ice": "ice on ice"},
  wind:     {"earth": "rock doesn't budge", "ice": "cold wind only chills it", "electric": "storms ride the wind"},
  metal:    {"fire": "metal just heats up", "metal": "metal on metal"},
  glitch:   {"plant": "living things don't run on code", "beast": "living things don't run on code", "brawl": "living things don't run on code", "glitch": "bug on bug"},
  arcane:   {"arcane": "mind on mind"},
  shade:    {"glitch": "data feels no fear", "shade": "dark on dark"},
  phantom:  {"metal": "machines can't be haunted", "glitch": "data can't be haunted"},
  beast:    {"metal": "claws can't scratch metal", "shade": "you can't bite a shadow", "phantom": "claws pass right through", "brawl": "trained fighters dodge wild swings"},
  brawl:    {"phantom": "fists pass right through", "wind": "hard to hit a flier", "arcane": "muscle can't touch the mind"},
};
// attacker -> defender -> multiplier (missing = 1); no immunities: the weakest hit is 1/2
const CHART = Object.fromEntries(Object.keys(TYPES).map(a => [a, {
  ...Object.fromEntries(Object.keys(TYPE_WHY_HALF[a]).map(d => [d, 0.5])),
  ...Object.fromEntries(Object.keys(TYPE_WHY[a]).map(d => [d, 2])),
}]));

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
 Not every Coreature needs a beam; some types have none.
*/
const MOVES = {
  // electric
  voltRush:     { name: 'Volt Rush', type: 'electric', kind: 'dash', power: 300, cd: 5, speed: 330, dur: 0.4, recoil: 0.2, status: ['par', 0.3] },
  thunderbolt:  { name: 'Thunderbolt', type: 'electric', kind: 'projectile', power: 150, cd: 2.2, speed: 250, r: 5, status: ['par', 0.15] },
  thunder:      { name: 'Thunder', type: 'electric', kind: 'zone', power: 270, cd: 6, r: 24, delay: 0.85, status: ['par', 0.3], fx: 'bolt' },
  woolTackle:   { name: 'Wool Tackle', type: 'beast', style: 'normal', kind: 'dash', power: 170, cd: 2.6, speed: 320, dur: 0.38, fx: 'wool' },
  staticSiphon: { name: 'Static Siphon', type: 'electric', kind: 'projectile', power: 105, cd: 3.5, speed: 240, r: 6, drain: 0.5 },
  discharge:    { name: 'Discharge', type: 'electric', kind: 'burst', power: 220, cd: 5, r: 62, delay: 0.45, status: ['par', 0.3] },
  voltCannon:   { name: 'Volt Cannon', type: 'electric', kind: 'beam', power: 260, cd: 6, charge: 0.55, dur: 0.5, width: 10, len: 280, status: ['par', 0.4] },
  // normal
  megaBeam:     { name: 'Mega Beam', type: 'beast', style: 'normal', kind: 'beam', power: 480, cd: 9, charge: 0.75, dur: 0.9, width: 16, len: 330, recharge: 1.3 },
  bodySlam:     { name: 'Body Slam', type: 'beast', style: 'normal', kind: 'dash', power: 210, cd: 3.6, speed: 250, dur: 0.45, status: ['par', 0.3] },
  snack:        { name: 'Snack Time', type: 'beast', style: 'normal', kind: 'heal', amount: 0.35, cd: 16 },
  // fire
  flameWheel:   { name: 'Flame Wheel', type: 'fire', kind: 'dash', power: 220, cd: 3.5, speed: 300, dur: 0.42, status: ['brn', 0.25], fx: 'wheel' },
  flamethrower: { name: 'Flamethrower', type: 'fire', kind: 'beam', power: 290, cd: 6, charge: 0.45, dur: 0.7, width: 11, len: 240, status: ['brn', 0.25] },
  fireBlast:    { name: 'Fire Blast', type: 'fire', kind: 'projectile', power: 330, cd: 7, speed: 165, r: 8, explode: 32, status: ['brn', 0.3] },
  eruption:     { name: 'Eruption', type: 'fire', kind: 'burst', power: 300, cd: 7, r: 74, delay: 0.42, status: ['brn', 0.25] },
  // water
  hydroCannon:  { name: 'Hydro Cannon', type: 'water', kind: 'beam', power: 320, cd: 6.5, charge: 0.5, dur: 0.7, width: 12, len: 270 },
  bubbleBeam:   { name: 'Bubble Spray', type: 'water', kind: 'projectile', power: 55, cd: 2, speed: 170, r: 4, count: 5, spread: 0.5, slow: 1.5, fx: 'bubble' },
  aquaJet:      { name: 'Aqua Jet', type: 'water', kind: 'dash', power: 115, cd: 2.2, speed: 410, dur: 0.25 },
  spoutShot:    { name: 'Spout Shot', type: 'water', kind: 'projectile', power: 100, cd: 1.6, speed: 260, r: 4 },
  cuffCannon:   { name: 'Cuff Cannon', type: 'water', kind: 'projectile', power: 150, cd: 2, speed: 270, r: 5 },
  // the turtle line's legendary 4th stages (evolution altar)
  geyserVent:   { name: 'Geyser Vent', type: 'water', kind: 'burst', power: 260, cd: 4.5, r: 72, delay: 0.4, status: ['brn', 0.2] },
  steamEruption: { name: 'Steam Eruption', type: 'fire', kind: 'zone', power: 200, cd: 6.5, r: 28, delay: 0.85, count: 3, scatter: 50, linger: 2.4, tick: 0.25, status: ['brn', 0.3] },
  magmaWave:    { name: 'Magma Wave', type: 'fire', kind: 'burst', power: 300, cd: 6.5, r: 120, delay: 0.5, cone: 0.6, blow: 0.5, status: ['brn', 0.3] },
  railShot:     { name: 'Rail Shot', type: 'electric', kind: 'beam', power: 360, cd: 5, charge: 0.4, dur: 0.3, width: 7, len: 380, status: ['par', 0.25] },
  lanceCharge:  { name: 'Lance Charge', type: 'electric', kind: 'dash', power: 230, cd: 3, speed: 470, dur: 0.32, status: ['par', 0.2] },
  towerShield:  { name: 'Tower Shield', type: 'metal', style: 'steel', kind: 'buff', buff: { def: 1.8 }, dur: 6, cd: 13 },
  droneSwarm:   { name: 'Drone Swarm', type: 'metal', style: 'steel', kind: 'projectile', power: 85, cd: 2.4, speed: 200, r: 4, count: 4, spread: 1.4, homing: 3 },
  twinCannon:   { name: 'Twin Cannon', type: 'water', kind: 'projectile', power: 95, cd: 2.2, speed: 270, r: 5, count: 2, spread: 0.14 },
  whirlpool:    { name: 'Whirlpool', type: 'water', kind: 'vortex', power: 350, cd: 6, r: 100, dur: 1.4, pull: 115 },
  // grass
  razorLeaf:    { name: 'Razor Leaf', type: 'plant', style: 'grass', kind: 'projectile', power: 90, cd: 1.8, speed: 255, r: 4, count: 2, spread: 0.15 },
  solarBeam:    { name: 'Solar Beam', type: 'plant', style: 'grass', kind: 'beam', power: 420, cd: 9, charge: 1.0, dur: 0.8, width: 16, len: 320 },
  seedBomb:     { name: 'Seed Bomb', type: 'plant', style: 'grass', kind: 'zone', power: 150, cd: 4.5, r: 22, delay: 0.75, count: 3, scatter: 30 },
  photosynth:   { name: 'Photosynth', type: 'plant', style: 'grass', kind: 'heal', amount: 0.3, cd: 14 },
  cottonGuard:  { name: 'Cotton Guard', type: 'plant', style: 'grass', kind: 'buff', buff: { def: 1.8 }, dur: 7, cd: 15 },
  // ground
  heavyStomp:   { name: 'Heavy Stomp', type: 'earth', style: 'ground', kind: 'burst', power: 210, cd: 5, r: 52, delay: 0.5 },
  quicksand:    { name: 'Quicksand', type: 'earth', style: 'ground', kind: 'zone', power: 110, cd: 6, r: 36, delay: 0.8, linger: 3, tick: 0.3, slow: 1.2 },
  quake:        { name: 'Quake', type: 'earth', style: 'ground', kind: 'burst', power: 300, cd: 8, r: 92, delay: 0.8 },
  mudShot:      { name: 'Mud Shot', type: 'earth', style: 'ground', kind: 'projectile', power: 110, cd: 2, speed: 210, r: 5, slow: 2, fx: 'mud', palette: ['#3e2612', '#6b4423', '#9a6a3a'] },
  // ice
  iceShard:     { name: 'Ice Shard', type: 'ice', kind: 'projectile', power: 85, cd: 1.3, speed: 330, r: 3 },
  frostRay:     { name: 'Frost Ray', type: 'ice', kind: 'beam', power: 240, cd: 5.5, charge: 0.4, dur: 0.6, width: 9, len: 270, status: ['frz', 0.2] },
  blizzard:     { name: 'Blizzard', type: 'ice', kind: 'burst', power: 230, cd: 7, r: 130, delay: 0.35, cone: 0.55, blow: 0.6, status: ['frz', 0.25] },
  frostArmor:   { name: 'Frost Armor', type: 'ice', kind: 'buff', buff: { def: 1.5 }, dur: 8, cd: 15 },
  // dragon
  dragonPulse:  { name: 'Dragon Pulse', type: 'arcane', style: 'dragon', kind: 'beam', power: 270, cd: 5, charge: 0.45, dur: 0.55, width: 12, len: 290 },
  dragonClaw:   { name: 'Dragon Claw', type: 'arcane', style: 'dragon', kind: 'dash', power: 165, cd: 2.4, speed: 340, dur: 0.3, fx: 'claw' },
  starfall:     { name: 'Starfall', type: 'arcane', style: 'dragon', kind: 'zone', power: 200, cd: 9, r: 26, delay: 1.0, count: 4, scatter: 50, fx: 'meteor' },
  dragonDance:  { name: 'Dragon Dance', type: 'arcane', style: 'dragon', kind: 'buff', buff: { atk: 1.3, spd: 1.3 }, dur: 8, cd: 15 },
  // rock
  rockSlide:    { name: 'Rock Slide', type: 'earth', style: 'rock', kind: 'zone', power: 145, cd: 4, r: 20, delay: 0.7, count: 4, scatter: 40, fx: 'rock' },
  rollout:      { name: 'Rollout', type: 'earth', style: 'rock', kind: 'dash', power: 185, cd: 3.2, speed: 280, dur: 0.55, fx: 'roll' },
  // psychic
  psybeam:      { name: 'Psybeam', type: 'arcane', style: 'psychic', kind: 'beam', power: 210, cd: 4, charge: 0.35, dur: 0.5, width: 9, len: 270, slow: 2 },
  mindOrbs:     { name: 'Mind Orbs', type: 'arcane', style: 'psychic', kind: 'projectile', power: 120, cd: 2.4, speed: 165, r: 5, count: 2, spread: 0.7, homing: 2.6 },
  foresight:    { name: 'Foresight', type: 'arcane', style: 'psychic', kind: 'zone', power: 300, cd: 8, r: 30, delay: 1.6 },
  calmMind:     { name: 'Calm Mind', type: 'arcane', style: 'psychic', kind: 'buff', buff: { atk: 1.3, def: 1.3 }, dur: 8, cd: 15 },
  // dark
  nightSlash:   { name: 'Night Slash', type: 'shade', style: 'dark', kind: 'dash', power: 175, cd: 2.2, speed: 370, dur: 0.25, crit: 0.3, fx: 'slash' },
  darkWave:     { name: 'Dark Wave', type: 'shade', style: 'dark', kind: 'burst', power: 195, cd: 4.5, r: 56, delay: 0.4 },
  gloomOrb:     { name: 'Gloom Orb', type: 'shade', style: 'dark', kind: 'projectile', power: 180, cd: 3, speed: 185, r: 7 },
  darkPulse:    { name: 'Dark Pulse', type: 'shade', style: 'dark', kind: 'burst', power: 250, cd: 5, r: 120, delay: 0.3, ripple: 0.55 },
  // fighting
  closeCombat:  { name: 'Close Combat', type: 'brawl', style: 'fighting', kind: 'dash', power: 65, cd: 5.5, speed: 320, dur: 0.38, hits: 6, hitGap: 0.06, selfDebuff: { def: 0.75 }, fx: 'flurry' },
  jab:          { name: 'Rapid Jab', type: 'brawl', style: 'fighting', kind: 'dash', power: 90, cd: 1.4, speed: 420, dur: 0.18 },
  auraSphere:   { name: 'Aura Sphere', type: 'brawl', style: 'fighting', kind: 'projectile', power: 170, cd: 2.8, speed: 200, r: 6, homing: 3.5 },
  auraCannon:   { name: 'Aura Cannon', type: 'brawl', style: 'fighting', kind: 'beam', power: 300, cd: 6.5, charge: 0.6, dur: 0.5, width: 14, len: 260 },
  bulkUp:       { name: 'Bulk Up', type: 'brawl', style: 'fighting', kind: 'buff', buff: { atk: 1.3, def: 1.3 }, dur: 8, cd: 15 },
  // flying
  airSlash:     { name: 'Air Slash', type: 'wind', style: 'flying', kind: 'projectile', power: 75, cd: 1.7, speed: 300, r: 4, count: 3, spread: 0.35 },
  razorGale:    { name: 'Razor Gale', type: 'wind', style: 'flying', kind: 'projectile', power: 100, cd: 3.5, speed: 290, r: 6, boomerang: true, range: 170 },
  braveDive:    { name: 'Brave Dive', type: 'wind', style: 'flying', kind: 'dash', power: 260, cd: 4.5, speed: 380, dur: 0.35, recoil: 0.15 },
  tailwind:     { name: 'Tailwind', type: 'wind', style: 'flying', kind: 'buff', buff: { spd: 1.35, atk: 1.15 }, dur: 8, cd: 15 },
  gust:         { name: 'Gust', type: 'wind', style: 'flying', kind: 'burst', power: 150, cd: 3.5, r: 100, delay: 0.2, cone: 0.6, blow: 0.3, push: 230, sfx: 'whoosh' },
  tornado:      { name: 'Tornado', type: 'wind', style: 'flying', kind: 'zone', power: 95, cd: 7, r: 30, delay: 0.6, linger: 2.4, tick: 0.3, pull: 70, fx: 'tornado' },
  // poison
  sludgeBomb:   { name: 'Sludge Bomb', type: 'glitch', style: 'poison', kind: 'projectile', power: 200, cd: 3.5, speed: 185, r: 7, explode: 28, status: ['psn', 0.3] },
  toxicPool:    { name: 'Toxic Pool', type: 'glitch', style: 'poison', kind: 'zone', power: 120, cd: 6, r: 32, delay: 0.9, slow: 1.2, linger: 3, tick: 0.25, status: ['psn', 0.35] },
  acidSpray:    { name: 'Acid Spray', type: 'glitch', style: 'poison', kind: 'projectile', power: 55, cd: 1.9, speed: 210, r: 4, count: 4, spread: 0.5, status: ['psn', 0.1] },
  venomJet:     { name: 'Venom Jet', type: 'glitch', style: 'poison', kind: 'beam', power: 220, cd: 5, charge: 0.4, dur: 0.6, width: 10, len: 250, status: ['psn', 0.4] },
  // bug
  megahorn:     { name: 'Megahorn', type: 'plant', style: 'bug', kind: 'dash', power: 290, cd: 5, speed: 310, dur: 0.4 },
  beetleBarrage:{ name: 'Beetle Barrage', type: 'plant', style: 'bug', kind: 'dash', power: 58, cd: 5, speed: 360, dur: 0.35, hits: 4 },
  pinMissile:   { name: 'Pin Missile', type: 'plant', style: 'bug', kind: 'projectile', power: 40, cd: 1.8, speed: 340, r: 3, count: 5, spread: 0.3, fx: 'pin' },
  // ghost
  shadowBall:   { name: 'Shadow Ball', type: 'phantom', style: 'ghost', kind: 'projectile', power: 175, cd: 2.8, speed: 190, r: 7, homing: 2 },
  phantomStrike:{ name: 'Phantom Strike', type: 'phantom', style: 'ghost', kind: 'dash', power: 190, cd: 3, speed: 400, dur: 0.28, crit: 0.3 },
  spiritFlames: { name: 'Spirit Flames', type: 'phantom', style: 'ghost', kind: 'zone', power: 110, cd: 5, r: 18, delay: 0.8, count: 3, scatter: 34, status: ['brn', 0.4] },
  spectralRay:  { name: 'Spectral Ray', type: 'phantom', style: 'ghost', kind: 'beam', power: 250, cd: 5, charge: 0.45, dur: 0.6, width: 10, len: 290 },
  // steel
  flashCannon:  { name: 'Flash Cannon', type: 'metal', style: 'steel', kind: 'beam', power: 330, cd: 7, charge: 0.6, dur: 0.7, width: 14, len: 300 },
  ironSlam:     { name: 'Iron Slam', type: 'metal', style: 'steel', kind: 'dash', power: 260, cd: 4, speed: 260, dur: 0.45 },
  magnetStorm:  { name: 'Magnet Storm', type: 'metal', style: 'steel', kind: 'zone', power: 160, cd: 6, r: 22, delay: 0.9, count: 3, scatter: 40, status: ['par', 0.15] },
  ironDefense:  { name: 'Iron Defense', type: 'metal', style: 'steel', kind: 'buff', buff: { def: 1.6 }, dur: 8, cd: 15 },
  // fairy
  moonblast:    { name: 'Moonblast', type: 'arcane', style: 'fairy', kind: 'projectile', power: 210, cd: 3.2, speed: 200, r: 7 },
  dazzleBeam:   { name: 'Dazzle Beam', type: 'arcane', style: 'fairy', kind: 'beam', power: 240, cd: 5, charge: 0.4, dur: 0.6, width: 12, len: 270 },
  fairyWind:    { name: 'Fairy Wind', type: 'arcane', style: 'fairy', kind: 'projectile', power: 50, cd: 2, speed: 240, r: 4, count: 5, spread: 0.7, fx: 'breeze' },
  wish:         { name: 'Wish', type: 'arcane', style: 'fairy', kind: 'heal', amount: 0.35, cd: 16 },
  // Toshi (Smugshi): the owner's Shiba Inu
  zoomies:      { name: 'Zoomies', type: 'beast', style: 'normal', kind: 'dash', power: 170, cd: 2, speed: 430, dur: 0.35 },
  shibaScream:  { name: 'Shiba Scream', type: 'beast', style: 'normal', kind: 'burst', power: 230, cd: 5, r: 60, delay: 0.35, status: ['par', 0.3], sfx: 'shibaScream' },
  smugBeam:     { name: 'Smug Beam', type: 'arcane', style: 'fairy', kind: 'beam', power: 250, cd: 5, charge: 0.45, dur: 0.6, width: 11, len: 280 },
  blanketNap:   { name: 'Blanket Nap', type: 'beast', style: 'normal', kind: 'heal', amount: 0.35, cd: 15 },
  // Mondaze: a burnt-out sloth running on coffee
  deadlineDash: { name: 'Deadline Dash', type: 'shade', style: 'dark', kind: 'dash', power: 260, cd: 3.5, speed: 320, dur: 0.45 },
  heavySigh:    { name: 'Heavy Sigh', type: 'beast', style: 'normal', kind: 'burst', power: 210, cd: 5, r: 70, delay: 0.5, slow: 2.5 },
  blankStare:   { name: 'Blank Stare', type: 'shade', style: 'dark', kind: 'beam', power: 300, cd: 5.5, charge: 0.6, dur: 0.6, width: 10, len: 290, slow: 1.8, fx: 'stare' },
  coffeeBreak:  { name: 'Coffee Break', type: 'beast', style: 'normal', kind: 'buff', buff: { spd: 1.6, atk: 1.3 }, dur: 8, cd: 14 },
  // evolved starters' upgraded moves
  zoomiesMax:   { name: 'Zoomies Max', type: 'beast', style: 'normal', kind: 'dash', power: 110, cd: 2.6, speed: 440, dur: 0.38, hits: 3 },
  shibaRoar:    { name: 'Shiba Roar', type: 'beast', style: 'normal', kind: 'burst', power: 300, cd: 5, r: 78, delay: 0.35, status: ['par', 0.35], sfx: 'shibaScream' },
  supremeSmug:  { name: 'Supreme Smug Beam', type: 'arcane', style: 'fairy', kind: 'beam', power: 350, cd: 5.5, charge: 0.45, dur: 0.7, width: 15, len: 310 },
  blazeRush:    { name: 'Blaze Rush', type: 'fire', kind: 'dash', power: 290, cd: 3.5, speed: 330, dur: 0.45, status: ['brn', 0.35], fx: 'aura' },
  infernoBeam:  { name: 'Inferno Beam', type: 'fire', kind: 'beam', power: 370, cd: 6, charge: 0.45, dur: 0.75, width: 14, len: 260, status: ['brn', 0.3] },
  magmaQuake:   { name: 'Magma Quake', type: 'earth', style: 'ground', kind: 'burst', power: 330, cd: 7, r: 80, delay: 0.55, slow: 1.5 },
  tidalCannon:  { name: 'Tidal Cannon', type: 'water', kind: 'beam', power: 410, cd: 6.5, charge: 0.55, dur: 0.75, width: 15, len: 310 },
  maelstrom:    { name: 'Maelstrom', type: 'water', kind: 'vortex', power: 460, cd: 6, r: 120, dur: 1.6, pull: 140 },
};

for (const k in MOVES) MOVES[k].id = k;   // lets moves be referenced by name over the network

const ITEMS = {
  voltCharm:   { name: 'VOLT CHARM', boostType: 'electric', mul: 1.2 },
  emberStone:  { name: 'EMBER STONE', boostType: 'fire', mul: 1.2 },
  mysticDrop:  { name: 'MYSTIC DROP', boostType: 'water', mul: 1.2 },
  toxicVial:   { name: 'TOXIC VIAL', boostType: 'glitch', mul: 1.2 },
  pixieDust:   { name: 'PIXIE DUST', boostType: 'arcane', mul: 1.2 },
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
  { id: 'thornback', name: 'THORNBACK', types: ['plant', 'earth'], hp: 1260, atk: 0.98, def: 1.25, spd: 70, size: 'M', item: 'ironPlate',
    moves: ['razorLeaf', 'solarBeam', 'seedBomb', 'photosynth'] },
  { id: 'slumbear',  name: 'SLUMBEAR',  types: ['beast'],   hp: 1950, atk: 1.15, def: 1.15, spd: 55,  size: 'L', item: 'snackPouch',
    moves: ['megaBeam', 'bodySlam', 'heavyStomp', 'snack'] },
  { id: 'frostling', name: 'FROSTLING', types: ['ice'],      hp: 960,  atk: 1.1,  def: 0.92, spd: 96,  size: 'M', item: 'quickCharm',
    moves: ['iceShard', 'frostRay', 'blizzard', 'frostArmor'] },
  { id: 'drakorn',   name: 'DRAKORN',   types: ['arcane'],   hp: 1200, atk: 1.2,  def: 1.0,  spd: 88,  size: 'M', item: 'powerBand',
    moves: ['dragonPulse', 'dragonClaw', 'starfall', 'dragonDance'] },
  { id: 'boulderon', name: 'BOULDERON', types: ['earth'], hp: 1420, atk: 1.15, def: 1.38, spd: 55, size: 'L', item: 'ironPlate',
    moves: ['rockSlide', 'quicksand', 'rollout', 'quake'] },
  { id: 'mindra',    name: 'MINDRA',    types: ['arcane'],  hp: 900,  atk: 1.22, def: 0.86, spd: 92,  size: 'M', item: 'quickCharm',
    moves: ['psybeam', 'mindOrbs', 'foresight', 'calmMind'] },
  { id: 'shadefang', name: 'SHADEFANG', types: ['shade'],     hp: 980,  atk: 1.2,  def: 0.9,  spd: 108, size: 'M', item: 'swiftFeather',
    moves: ['nightSlash', 'darkWave', 'gloomOrb', 'darkPulse'] },
  { id: 'lumawool',  name: 'LUMAWOOL',  types: ['electric'], hp: 1010, atk: 1.04, def: 1.08, spd: 76,  size: 'M', item: 'voltCharm',
    moves: ['thunderbolt', 'discharge', 'woolTackle', 'cottonGuard'] },
  { id: 'brawlix',   name: 'BRAWLIX',   types: ['brawl'], hp: 1100, atk: 1.25, def: 1.0,  spd: 95,  size: 'M', item: 'powerBand',
    moves: ['closeCombat', 'jab', 'auraSphere', 'auraCannon'] },
  { id: 'galewing',  name: 'GALEWING',  types: ['wind'],   hp: 820,  atk: 1.08, def: 0.92, spd: 115, size: 'M', item: 'swiftFeather',
    moves: ['airSlash', 'gust', 'razorGale', 'tornado'] },
  { id: 'venomire',  name: 'VENOMIRE',  types: ['glitch'],   hp: 1020, atk: 1.02, def: 1.08, spd: 78,  size: 'M', item: 'toxicVial',
    moves: ['sludgeBomb', 'toxicPool', 'acidSpray', 'venomJet'] },
  { id: 'scarablade',name: 'SCARABLADE',types: ['plant', 'brawl'], hp: 950, atk: 1.1, def: 1.05, spd: 82, size: 'M', item: 'powerBand',
    moves: ['megahorn', 'pinMissile', 'beetleBarrage', 'bulkUp'] },
  { id: 'wispurr',   name: 'WISPURR',   types: ['phantom'],    hp: 950,  atk: 1.25, def: 0.88, spd: 104, size: 'M', item: 'quickCharm',
    moves: ['shadowBall', 'phantomStrike', 'spiritFlames', 'spectralRay'] },
  { id: 'gearhulk',  name: 'GEARHULK',  types: ['metal'],    hp: 1450, atk: 1.05, def: 1.35, spd: 52,  size: 'L', item: 'ironPlate',
    moves: ['flashCannon', 'ironSlam', 'magnetStorm', 'ironDefense'] },
  { id: 'pixibelle', name: 'PIXIBELLE', types: ['arcane'],    hp: 940,  atk: 1.08, def: 0.96,  spd: 94,  size: 'M', item: 'pixieDust',
    moves: ['moonblast', 'dazzleBeam', 'fairyWind', 'wish'] },
  // Toshi, the owner's real Shiba Inu: fast, smug, loves a blanket
  { id: 'smugshi',   name: 'SMUGSHI',   types: ['beast', 'arcane'], hp: 1080, atk: 1.18, def: 1.0, spd: 110, size: 'M', item: 'snackPouch',
    moves: ['zoomies', 'shibaScream', 'smugBeam', 'blanketNap'] },
  { id: 'mondaze',   name: 'MONDAZE',   types: ['beast', 'shade'], hp: 1220, atk: 1.2, def: 1.15, spd: 70, size: 'M', item: 'powerBand',
    moves: ['deadlineDash', 'heavySigh', 'blankStare', 'coffeeBreak'] },
  // r48, designed from the owner's picks: a crackling ball of static fur (fragile, hits hard) and a
  // spring-tailed cliff gecko (sturdy; Rollout is it springing off its coiled tail)
  { id: 'voltergeist', name: 'VOLTERGEIST', types: ['electric', 'phantom'], hp: 900, atk: 1.22, def: 0.88, spd: 98, size: 'M', item: 'quickCharm',
    moves: ['discharge', 'shadowBall', 'thunder', 'staticSiphon'] },
  { id: 'coilizard', name: 'COILIZARD', types: ['electric', 'earth'], hp: 1080, atk: 1.12, def: 1.12, spd: 92, size: 'M', item: 'ironPlate',
    moves: ['rollout', 'thunderbolt', 'rockSlide', 'thunder'] },
  // a calm lantern-belled alpaca (a sturdy guardian that heals) and a smouldering coal calf (a tank)
  { id: 'bellpaca', name: 'BELLPACA', types: ['electric', 'beast'], hp: 1150, atk: 1.0, def: 1.12, spd: 80, size: 'M', item: 'snackPouch',
    moves: ['bodySlam', 'staticSiphon', 'voltCannon', 'wish'] },
  { id: 'smouldox', name: 'SMOULDOX', types: ['fire', 'earth'], hp: 1300, atk: 1.12, def: 1.2, spd: 64, size: 'M', item: 'emberStone',
    moves: ['flameWheel', 'rockSlide', 'fireBlast', 'heavyStomp'] },
  { id: 'shellmet', name: 'SHELLMET', types: ['water', 'metal'], hp: 950, atk: 0.95, def: 1.15, spd: 78, size: 'M', item: 'mysticDrop',
    moves: ['spoutShot', 'aquaJet', 'ironSlam', 'ironDefense'], evolve: { to: 'bulwarden' } },
  { id: 'bulwarden', name: 'BULWARDEN', types: ['water', 'metal'], hp: 1200, atk: 1.02, def: 1.22, spd: 68, size: 'M', item: 'mysticDrop',
    moves: ['cuffCannon', 'hydroCannon', 'ironSlam', 'ironDefense'], evolve: { to: 'garrishell' } },
  { id: 'garrishell', name: 'GARRISHELL', types: ['water', 'metal'], hp: 1500, atk: 1.1, def: 1.3, spd: 58, size: 'L', item: 'mysticDrop',
    moves: ['twinCannon', 'hydroCannon', 'ironSlam', 'ironDefense'] },
];

// Evolved forms: a starter Restores into one of these when its bar fills (see `evolve` on the base
// Coreature). They aren't part of the wild / recruit pool.
const EVOLVED = [
  { id: 'smugshogun', name: 'SMUGSHOGUN', types: ['beast', 'arcane'], hp: 1360, atk: 1.32, def: 1.1, spd: 114, size: 'L', item: 'snackPouch',
    moves: ['zoomiesMax', 'shibaRoar', 'supremeSmug', 'blanketNap'], from: 'smugshi' },
  { id: 'infernox', name: 'INFERNOX', types: ['fire', 'earth'], hp: 1400, atk: 1.26, def: 1.15, spd: 90, size: 'L', item: 'emberStone',
    moves: ['blazeRush', 'infernoBeam', 'fireBlast', 'magmaQuake'], from: 'cinderox' },
  { id: 'maelstrisk', name: 'MAELSTRISK', types: ['water', 'arcane'], hp: 1560, atk: 1.16, def: 1.22, spd: 88, size: 'L', item: 'mysticDrop',
    moves: ['tidalCannon', 'bubbleBeam', 'dragonPulse', 'maelstrom'], from: 'tidalisk' },
];
// Legendary 4th stages: made at an evolution altar from a Coreature at its last stage by offering two
// relics, one of each element in its `recipe` (RELIC_TAGS); any relic of those elements works, and
// each one fuses into the Coreature as a stronger version (RELICS[id].fused). Not in the wild or recruit pool.
// A Coreature's branches come from here (def.branches = { id: recipe }).
const LEGENDS = [
  { id: 'magmabastion', name: 'MAGMA BASTION', types: ['water', 'fire'], hp: 2300, atk: 1.32, def: 1.5, spd: 46, size: 'L', item: 'emberStone',
    moves: ['geyserVent', 'steamEruption', 'magmaWave', 'ironDefense'], from: 'garrishell', recipe: ['fire', 'water'] },
  { id: 'railwarden', name: 'RAILWARDEN', types: ['water', 'electric'], hp: 1550, atk: 1.42, def: 1.1, spd: 108, size: 'L', item: 'quickCharm',
    moves: ['railShot', 'hydroCannon', 'lanceCharge', 'towerShield'], from: 'garrishell', recipe: ['electric', 'metal'] },
  { id: 'citadrone', name: 'CITADRONE', types: ['water', 'metal'], hp: 1900, atk: 1.28, def: 1.42, spd: 72, size: 'L', item: 'ironPlate',
    moves: ['droneSwarm', 'hydroCannon', 'magnetStorm', 'ironDefense'], from: 'garrishell', recipe: ['metal', 'wind'] },
];
for (const l of LEGENDS) { const base = ROSTER.find(m => m.id === l.from); (base.branches = base.branches || {})[l.id] = l.recipe; }
for (const e of EVOLVED) ROSTER.find(m => m.id === e.from).evolve = { to: e.id };   // it Restores into this form when its bar fills
const ALL_MONS = () => [...ROSTER, ...EVOLVED, ...LEGENDS];
const ROSTER_BY_ID = Object.fromEntries(ALL_MONS().map(m => [m.id, m]));

const DIFFICULTY = {
  easy:   { think: 0.38, dodge: 0.25, aggro: 0.45, react: 0.55, aimErr: 0.28, lead: false, swap: 0 },
  normal: { think: 0.22, dodge: 0.55, aggro: 0.7,  react: 0.3,  aimErr: 0.1,  lead: false, swap: 1 },
  hard:   { think: 0.12, dodge: 0.85, aggro: 0.92, react: 0.12, aimErr: 0.0,  lead: true, swap: 1.5 },
};
