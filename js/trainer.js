// The trainer's poses (Monster Rush). The trainer is drawn in pixel.js (trainerMap: one shared
// body, 8 looks); a pose leaves the arms off the body and redraws them at any angle from the shoulder,
// lets the body crouch (the legs fold), turns or drops the head, and can open the mouth. So one
// small rig gives the bracer deploy, pointing, bracing, wincing, cheering and the rest in every view
// for every look.

// The poses. armL / armR: degrees from hanging down (90 = straight out, 180 = straight up);
// left out, an arm stays as drawn. head: [dx, dy]. body: how far it crouches. mouth: 'open'.
const TRAINER_POSES = {
  idle: {},
  lookL: { head: [-1, 0] },
  lookR: { head: [1, 0] },
  point: { armR: 95 },
  deploy1: { armR: 130, armL: 20 },              // the bracer arm comes up...
  deploy2: { armR: 88, armL: 15, head: [1, 0] },   // ...and thrusts out to beam the monster in
  brace: { armL: 40, armR: 40, body: 1 },
  wince: { armL: 15, armR: 15, head: [0, 1] },
  cheer1: { armR: 175, mouth: 'open' },
  cheer2: { armR: 150, mouth: 'open' },
  victory: { armL: 160, armR: 160, mouth: 'open' },
  crouch: { armL: 45, armR: 45, body: 2, head: [0, 1] },
  slump: { armL: 4, armR: 4, body: 1, head: [0, 1] },
};
// What the trainer acts out: frames [pose, seconds, hop] (the last frame holds unless loop).
const TRAINER_ACTS = {
  deploy:  { frames: [['deploy1', 0.12], ['deploy2', 0.45]] },
  point:   { frames: [['point', 0.7]] },
  brace:   { frames: [['brace', 0.9]] },
  wince:   { frames: [['wince', 0.4]] },
  cheer:   { frames: [['cheer1', 0.18, 2], ['cheer2', 0.18], ['cheer1', 0.18, 2], ['cheer2', 0.3]] },
  victory: { frames: [['victory', 0.25, 3], ['victory', 0.25], ['victory', 0.25, 3], ['victory', 0.25], ['victory', 0.6]] },
  crouch:  { frames: [['crouch', 1.4]] },
  slump:   { frames: [['slump', 99]] },
  look:    { frames: [['lookL', 0.7], ['idle', 0.4], ['lookR', 0.7]] },
};
const TP_X = 4, TP_Y = 10, TP_W = TW + 2 * TP_X, TP_H = TH + TP_Y;   // the posed picture: the map with room for raised arms

// One pose of one look in one view, as a picture (cached). Bottom-centred like the plain trainer, but bigger.
const _tposes = {};
function trainerPose(look, view, poseName) {
  const key = look + view + poseName;
  if (_tposes[key]) return _tposes[key];
  const P = TRAINER_POSES[poseName] || {}, arms = TRAINER_ARMS[view] || TRAINER_ARMS.front;
  const moving = k => arms[k] && P['arm' + k] !== undefined;
  const map = trainerMap(look, view, ['L', 'R'].filter(moving).join(''));   // the moving arms left off
  const grid = Array.from({ length: TP_H }, () => Array(TP_W).fill('.'));
  const put = (x, y, ch) => { if (ch !== '.' && x >= 0 && y >= 0 && x < TP_W && y < TP_H) grid[y][x] = ch; };
  const c = P.body || 0, [hx, hy] = P.head || [0, 0];
  // legs, folded by the crouch: their top c rows are dropped, the feet stay put
  const legs = map.slice(TR_LEGS + c);
  legs.forEach((row, i) => [...row].forEach((ch, x) => put(x + TP_X, TP_Y + TH - legs.length + i, ch)));
  for (let y = TR_BODY; y < TR_LEGS; y++) [...map[y]].forEach((ch, x) => put(x + TP_X, TP_Y + y + c, ch));   // body, sunk by the crouch
  for (let y = 0; y < TR_BODY; y++) [...map[y]].forEach((ch, x) => put(x + TP_X + hx, TP_Y + y + c + hy, P.mouth === 'open' && ch === 'K' ? 'k' : ch));   // head
  // the moving arms, drawn from the shoulder out, then inked round
  const armPx = [];
  for (const k of ['L', 'R']) {
    if (!moving(k)) continue;
    for (const [x, y, ch] of trainerArmPx(arms[k], P['arm' + k], trainerArmCols(look, k), TP_X, TP_Y + c)) { put(x, y, ch); armPx.push([x, y]); }
  }
  for (const [x, y] of armPx) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + ox, ny = y + oy;
    if (nx >= 0 && ny >= 0 && nx < TP_W && ny < TP_H && grid[ny][nx] === '.') grid[ny][nx] = 'k';
  }
  return (_tposes[key] = gridFromMap(grid.map(r => r.join('')), trainerPal(look)).toCanvas());
}
// The pose and hop for an act that started `t` seconds ago (null when it's over).
function trainerActFrame(act, t) {
  const A = TRAINER_ACTS[act];
  if (!A) return null;
  let at = 0;
  for (const [pose, dur, hop = 0] of A.frames) { if (t < at + dur) return { pose, hop }; at += dur; }
  return null;
}
