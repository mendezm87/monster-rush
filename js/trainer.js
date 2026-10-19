// The trainer's poses (Monster Rush). The trainer is drawn from the hand-made pixel maps in
// pixel.js; a pose takes the arms off the body and redraws them at any angle from the shoulder,
// lets the body crouch (the legs fold), turns or drops the head, and can open the mouth. So one
// small rig gives throws, pointing, bracing, wincing, cheering and the rest in every view, and
// the same rig carries over to a redesigned trainer (new maps, new arm spots).

// Per view, the arms a pose can move: the columns and rows they cover in the map (taken out when
// posed: replaced by outline at `edge`, or by jacket colour `fill` when the arm lies over the
// body), and the shoulder they swing from. `side` is which way is "outward" for that arm.
const ARM_FRONT = {
  L: { x0: 0, x1: 2, y0: 12, y1: 17, edge: 2, sx: 1, sy: 12, side: -1 },
  R: { x0: 13, x1: 15, y0: 12, y1: 17, edge: 13, sx: 14, sy: 12, side: 1 },
};
const TRAINER_ARMS = {
  front: ARM_FRONT, back: ARM_FRONT, bside: ARM_FRONT,
  fside: { L: ARM_FRONT.L, R: { x0: 12, x1: 13, y0: 12, y1: 17, edge: 12, sx: 12, sy: 12, side: 1 } },
  side: { R: { x0: 5, x1: 7, y0: 12, y1: 17, fill: 'j', sx: 6, sy: 12, side: 1 } },   // the near arm, over the body
};
// The poses. armL / armR: degrees from hanging down (90 = straight out, 180 = straight up);
// left out, an arm stays as drawn. head: [dx, dy]. body: how far it crouches. mouth: 'open'.
const TRAINER_POSES = {
  idle: {},
  lookL: { head: [-1, 0] },
  lookR: { head: [1, 0] },
  point: { armR: 95 },
  throw1: { armR: 165, armL: 25 },             // wind-up, arm back over the shoulder
  throw2: { armR: 65, armL: 20, head: [1, 0] },  // the release
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
  throw:   { frames: [['throw1', 0.16], ['throw2', 0.34]] },
  point:   { frames: [['point', 0.7]] },
  brace:   { frames: [['brace', 0.9]] },
  wince:   { frames: [['wince', 0.4]] },
  cheer:   { frames: [['cheer1', 0.18, 2], ['cheer2', 0.18], ['cheer1', 0.18, 2], ['cheer2', 0.3]] },
  victory: { frames: [['victory', 0.25, 3], ['victory', 0.25], ['victory', 0.25, 3], ['victory', 0.25], ['victory', 0.6]] },
  crouch:  { frames: [['crouch', 1.4]] },
  slump:   { frames: [['slump', 99]] },
  look:    { frames: [['lookL', 0.7], ['idle', 0.4], ['lookR', 0.7]] },
};
const TP_W = 22, TP_H = 32, TP_X = 3, TP_Y = 8;   // the posed picture: the 16x24 map with room for raised arms
const ARM_COLS = ['w', 'w', 's', 's', 's', 'W', 'g'];   // shoulder to fist: sleeve, sleeve, skin, wristband, glove

// One pose in one view, as a picture (cached). Bottom-centred like the plain trainer, but bigger.
const _tposes = {};
function trainerPose(outfit, view, poseName) {
  const key = outfit + view + poseName;
  if (_tposes[key]) return _tposes[key];
  const P = TRAINER_POSES[poseName] || {}, arms = TRAINER_ARMS[view] || {};
  const map = (TRAINER_MAPS[view] || TRAINER_FRONT).map(r => [...r]);
  const grid = Array.from({ length: TP_H }, () => Array(TP_W).fill('.'));
  const put = (x, y, ch) => { if (ch !== '.' && x >= 0 && y >= 0 && x < TP_W && y < TP_H) grid[y][x] = ch; };
  const moving = k => arms[k] && P['arm' + k] !== undefined;
  // take the arms that move out of the body
  for (const k of ['L', 'R']) {
    if (!moving(k)) continue;
    const a = arms[k];
    for (let y = a.y0; y <= a.y1; y++) for (let x = a.x0; x <= a.x1; x++)
      map[y][x] = a.fill ? (map[y][x] === 'k' || map[y][x] === '.' ? map[y][x] : a.fill) : x === a.edge ? 'k' : '.';
  }
  if (P.mouth === 'open') for (const row of [9]) map[row] = map[row].map(ch => (ch === 'K' ? 'k' : ch));
  const c = P.body || 0, [hx, hy] = P.head || [0, 0];
  // legs (rows 18-23), folded by the crouch: their top c rows are dropped, the feet stay put
  const legs = []; for (let y = 18 + c; y < 24; y++) legs.push(map[y]);
  legs.forEach((row, i) => row.forEach((ch, x) => put(x + TP_X, TP_Y + 24 - legs.length + i, ch)));
  for (let y = 10; y < 18; y++) map[y].forEach((ch, x) => put(x + TP_X, TP_Y + y + c, ch));             // body, sunk by the crouch
  for (let y = 0; y < 10; y++) map[y].forEach((ch, x) => put(x + TP_X + hx, TP_Y + y + c + hy, ch));     // head
  // the moving arms, drawn from the shoulder out, then inked round
  const armPx = [];
  for (const k of ['L', 'R']) {
    if (!moving(k)) continue;
    const a = arms[k], ang = P['arm' + k] * Math.PI / 180;
    const dx = Math.sin(ang) * a.side, dy = Math.cos(ang), sx = a.sx + TP_X, sy = a.sy + TP_Y + c;
    ARM_COLS.forEach((ch, t) => {
      const x = Math.round(sx + dx * t), y = Math.round(sy + dy * t);
      put(x, y, ch); armPx.push([x, y]);
      if (t < 2) { const ix = x - a.side * Math.round(Math.abs(dy)), iy = y + Math.round(Math.abs(dx)); put(ix, iy, ch); armPx.push([ix, iy]); }   // the sleeve is 2 wide (on the body side)
      if (t === ARM_COLS.length - 1) for (const [ex, ey] of [[dx, dy], [-a.side * Math.abs(dy), Math.abs(dx)], [dx - a.side * Math.abs(dy), dy + Math.abs(dx)]]) {   // a chunky fist
        const fx = Math.round(x + ex), fy = Math.round(y + ey); put(fx, fy, 'g'); armPx.push([fx, fy]);
      }
    });
  }
  for (const [x, y] of armPx) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + ox, ny = y + oy;
    if (nx >= 0 && ny >= 0 && nx < TP_W && ny < TP_H && grid[ny][nx] === '.') grid[ny][nx] = 'k';
  }
  const pal = { ...TRAINER_BASE, ...(TRAINER_OUTFITS[outfit] || TRAINER_OUTFITS[TRAINER_OUTFIT]) };
  return (_tposes[key] = gridFromMap(grid.map(r => r.join('')), pal).toCanvas());
}
// The pose and hop for an act that started `t` seconds ago (null when it's over).
function trainerActFrame(act, t) {
  const A = TRAINER_ACTS[act];
  if (!A) return null;
  let at = 0;
  for (const [pose, dur, hop = 0] of A.frames) { if (t < at + dur) return { pose, hop }; at += dur; }
  return null;
}
