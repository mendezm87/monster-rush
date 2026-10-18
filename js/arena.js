// Room drawing: pixel-noise floors, walls and doorways for dungeon rooms.

const W = 576, H = 324;   // the view in world units (the canvas is RES x this); rooms can be bigger and scroll
// Canvas pixels per world unit. Always even, so a sprite pixel (1.5 world units) is a whole
// number of canvas pixels: 2 on small screens, 4 at 1080p, 6 at 4K. main.js picks it to
// match the screen (fitScreen) and the browser smoothly shrinks that to the exact size.
let RES = 2;
const WALL = { top: 44, side: 26, bottom: 26 };
const DOOR_W = 52;        // doorway width
const DOOR_DIRS = { n: [0, -1, 's'], s: [0, 1, 'n'], w: [-1, 0, 'e'], e: [1, 0, 'w'] };

// One palette per floor: ground shades, wall bricks, scorch-mark colour, weather.
const STAGES = {
  meadow: {
    name: 'Verdant Meadow',
    ground: ['#3f7a3a', '#4b8a40', '#5a9a48', '#6aaa52', '#7fbb60'],
    wall: ['#4a4a3e', '#5e5e50', '#76766a', '#8a8a7a'], wallTop: '#2c4a26',
    weather: 'petals', decal: 'rgba(40,30,15,', bg: '#1c2e1a',
    light: { amb: 'rgb(185,180,190)', torch: [255, 200, 120], tint: 'rgba(255,220,170,0.06)' },
  },
  crater: {
    name: 'Ember Crater',
    ground: ['#3a2a2a', '#4a3430', '#5a3e36', '#6c4a3c', '#80583f'],
    wall: ['#2a1c1a', '#3a2a28', '#5a4640', '#7e6458'], wallTop: '#ff7a3a',
    weather: 'ash', decal: 'rgba(15,8,8,', bg: '#140c0c',
    light: { amb: 'rgb(130,95,90)', torch: [255, 140, 60], tint: 'rgba(255,120,40,0.08)' },
  },
  summit: {
    name: 'Snowy Summit',
    ground: ['#7f8796', '#959dab', '#a9b0bd', '#bfc5cf', '#d4d8df'],
    wall: ['#4a4e58', '#5e626c', '#8a8e98', '#c4c8d0'], wallTop: '#e8ecf2',
    weather: 'snow', decal: 'rgba(40,30,30,', bg: '#2a2e38',
    light: { amb: 'rgb(160,170,195)', torch: [200, 220, 255], tint: 'rgba(180,200,255,0.06)' },
  },
  // deeper floors (4-6, and endless mode)
  grotto: {
    name: 'Crystal Grotto',
    ground: ['#2a2444', '#342c54', '#3e3462', '#4a3e72', '#584a86'],
    wall: ['#1c1830', '#2c2648', '#463c6a', '#6a5a9a'], wallTop: '#7af0e0',
    weather: 'motes', decal: 'rgba(10,8,20,', bg: '#120e20',
    light: { amb: 'rgb(105,100,150)', torch: [120, 240, 230], tint: 'rgba(120,200,255,0.06)' },
  },
  ruins: {
    name: 'Sunken Ruins',
    ground: ['#8a7a52', '#9a8a5e', '#ab9a6a', '#bcab78', '#cdbc88'],
    wall: ['#5a4e36', '#6e6044', '#8a7a58', '#b0a07a'], wallTop: '#e8d8a8',
    weather: 'sand', decal: 'rgba(50,35,15,', bg: '#3a3222',
    light: { amb: 'rgb(175,155,125)', torch: [255, 190, 110], tint: 'rgba(255,200,130,0.07)' },
  },
  // the last floor of a run: the top of a tower at night, gold trim, falling stars
  spire: {
    name: 'Starlit Spire',
    ground: ['#262a48', '#2e3356', '#373d64', '#424a74', '#505a88'],
    wall: ['#14162c', '#1e2140', '#2e3258', '#4a5080'], wallTop: '#ffd36a',
    weather: 'stars', decal: 'rgba(8,8,20,', bg: '#0a0a1c',
    light: { amb: 'rgb(120,125,175)', torch: [255, 210, 120], tint: 'rgba(150,160,255,0.07)' },
  },
};

// The walkable floor of a room (monsters' feet stay inside it).
function roomField(room) {
  return { x0: WALL.side, y0: WALL.top, x1: room.w - WALL.side, y1: room.h - WALL.bottom };
}

// Where a doorway sits: its centre on the wall line, in room coordinates.
function doorPos(room, dir) {
  const F = roomField(room), my = Math.round((F.y0 + F.y1) / 2);
  return { n: { x: room.w / 2, y: F.y0 }, s: { x: room.w / 2, y: F.y1 }, w: { x: F.x0, y: my }, e: { x: F.x1, y: my } }[dir];
}

// Seeded RNG so a room looks the same every time you come back.
function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function valueNoise(rand, w, h, cell) {
  const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
  const grid = Array.from({ length: gw * gh }, rand);
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const gx = x / cell, gy = y / cell;
    const ix = Math.floor(gx), iy = Math.floor(gy);
    const fx = sm(gx - ix), fy = sm(gy - iy);
    const a = grid[iy * gw + ix], b = grid[iy * gw + ix + 1];
    const c = grid[(iy + 1) * gw + ix], d = grid[(iy + 1) * gw + ix + 1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
}

// A noisy pixel ground covering w x h.
function paintGround(ctx, st, rand, w, h) {
  const img = ctx.createImageData(w, h);
  const n1 = valueNoise(rand, w, h, 40), n2 = valueNoise(rand, w, h, 14), n3 = valueNoise(rand, w, h, 5);
  const cols = st.ground.map(hexRgb);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = n1(x, y) * 0.55 + n2(x, y) * 0.3 + n3(x, y) * 0.15;
    v += (rand() - 0.5) * 0.06;                                   // dithering grain
    const idx = Math.max(0, Math.min(cols.length - 1, Math.floor(v * cols.length * 1.15 - 0.4)));
    const [r, g, b] = cols[idx];
    const i = (y * w + x) * 4;
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  for (let i = 0; i < w * h / 1800; i++) {   // tufts / pebbles
    const x = Math.floor(rand() * w), y = Math.floor(rand() * h);
    ctx.fillStyle = st.ground[0];
    ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 2, y - 1, 1, 3); ctx.fillRect(x + 4, y, 1, 2);
  }
}

// Brick wall band: rows of offset bricks with a light top edge.
function paintBricks(ctx, st, rand, x, y, w, h) {
  const [dark, mid, light, hi] = st.wall;
  ctx.fillStyle = dark; ctx.fillRect(x, y, w, h);
  const bh = 7, bw = 16;
  for (let r = 0; r * bh < h; r++) {
    const off = (r % 2) * (bw / 2);
    for (let c = -1; c * bw < w + bw; c++) {
      const bx = x + c * bw + off, by = y + r * bh;
      const cx0 = Math.max(x, bx + 1), cx1 = Math.min(x + w, bx + bw - 1);
      if (cx1 <= cx0) continue;
      ctx.fillStyle = rand() < 0.2 ? light : mid;
      ctx.fillRect(cx0, by + 1, cx1 - cx0, Math.min(bh - 2, y + h - by - 1));
      ctx.fillStyle = hi; ctx.globalAlpha = 0.35;
      ctx.fillRect(cx0, by + 1, cx1 - cx0, 1);
      ctx.globalAlpha = 1;
    }
  }
}

// Builds (and caches on the room) the room's floor + walls + doorways.
function roomCanvas(room, stageKey) {
  if (room.canvas) return { canvas: room.canvas, stage: STAGES[stageKey] };
  const st = STAGES[stageKey];
  const rand = mulberry(room.seed);
  const cv = document.createElement('canvas');
  cv.width = room.w; cv.height = room.h;
  const ctx = cv.getContext('2d');
  paintGround(ctx, st, rand, room.w, room.h);
  const F = roomField(room);

  // a soft shadow along the walls' foot
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(F.x0, F.y0, F.x1 - F.x0, 6);
  ctx.fillRect(F.x0, F.y0, 4, F.y1 - F.y0);
  ctx.fillRect(F.x1 - 4, F.y0, 4, F.y1 - F.y0);

  // walls: the top one shows its face, the others are seen from above
  paintBricks(ctx, st, rand, 0, 0, room.w, F.y0);
  paintBricks(ctx, st, rand, 0, F.y1, room.w, room.h - F.y1);
  paintBricks(ctx, st, rand, 0, 0, F.x0, room.h);
  paintBricks(ctx, st, rand, F.x1, 0, room.w - F.x1, room.h);
  ctx.fillStyle = st.wallTop;
  ctx.fillRect(0, 0, room.w, 3); ctx.fillRect(0, room.h - 3, room.w, 3);
  ctx.fillRect(0, 0, 3, room.h); ctx.fillRect(room.w - 3, 0, 3, room.h);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(F.x0 - 1, F.y0 - 1, F.x1 - F.x0 + 2, 1);
  ctx.fillRect(F.x0 - 1, F.y1, F.x1 - F.x0 + 2, 1);
  ctx.fillRect(F.x0 - 1, F.y0, 1, F.y1 - F.y0);
  ctx.fillRect(F.x1, F.y0, 1, F.y1 - F.y0);

  // doorways: a dark passage cut through the wall
  for (const dir of Object.keys(room.doors)) {
    const d = doorPos(room, dir), hw = DOOR_W / 2;
    ctx.fillStyle = '#120e18';
    if (dir === 'n') ctx.fillRect(d.x - hw, 0, DOOR_W, F.y0);
    if (dir === 's') ctx.fillRect(d.x - hw, F.y1, DOOR_W, room.h - F.y1);
    if (dir === 'w') ctx.fillRect(0, d.y - hw, F.x0, DOOR_W);
    if (dir === 'e') ctx.fillRect(F.x1, d.y - hw, room.w - F.x1, DOOR_W);
    ctx.fillStyle = st.wall[3];
    if (dir === 'n' || dir === 's') {
      const y0 = dir === 'n' ? 0 : F.y1, h = dir === 'n' ? F.y0 : room.h - F.y1;
      ctx.fillRect(d.x - hw - 3, y0, 3, h); ctx.fillRect(d.x + hw, y0, 3, h);
    } else {
      const x0 = dir === 'w' ? 0 : F.x1, w = dir === 'w' ? F.x0 : room.w - F.x1;
      ctx.fillRect(x0, d.y - hw - 3, w, 3); ctx.fillRect(x0, d.y + hw, w, 3);
    }
  }
  room.canvas = cv;
  return { canvas: cv, stage: st };
}

// A one-screen backdrop for the menus.
function buildBackdrop(stageKey, seed) {
  const st = STAGES[stageKey];
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  paintGround(cv.getContext('2d'), st, mulberry(seed), W, H);
  return { canvas: cv, stage: st };
}
