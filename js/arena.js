// Stage generation: a pixel-noise ground texture, field markings and edge rocks.

const W = 288, H = 512;
const FIELD = { x0: 14, y0: 120, x1: 274, y1: 470 };
const TRAINER_POS = { player: { x: 144, y: 492 }, enemy: { x: 144, y: 104 } };
const SPAWN_POS = { player: { x: 144, y: 400 }, enemy: { x: 144, y: 200 } };

const STAGES = {
  summit: {
    name: 'Snowy Summit',
    ground: ['#7f8796', '#959dab', '#a9b0bd', '#bfc5cf', '#d4d8df'],
    line: 'rgba(255,255,255,0.35)', rock: P('#8a8e98', '#5e626c', '#c4c8d0'), rockCap: '#e8ecf2',
    weather: 'snow', decal: 'rgba(40,30,30,', bg: '#5a6170',
  },
  crater: {
    name: 'Ember Crater',
    ground: ['#3a2a2a', '#4a3430', '#5a3e36', '#6c4a3c', '#80583f'],
    line: 'rgba(255,190,140,0.3)', rock: P('#5a4640', '#3a2a28', '#7e6458'), rockCap: '#ff7a3a',
    weather: 'ash', decal: 'rgba(15,8,8,', bg: '#2a1c1c',
  },
  meadow: {
    name: 'Verdant Meadow',
    ground: ['#3f7a3a', '#4b8a40', '#5a9a48', '#6aaa52', '#7fbb60'],
    line: 'rgba(255,255,255,0.4)', rock: P('#8a8a7a', '#5e5e50', '#bcbcaa'), rockCap: '#7fbb60',
    weather: 'petals', decal: 'rgba(40,30,15,', bg: '#2e5a2a',
  },
};

// Seeded RNG so a stage looks the same across a battle.
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

function buildStage(key, seed = 7) {
  const st = STAGES[key];
  const rand = mulberry(seed);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const n1 = valueNoise(rand, W, H, 40), n2 = valueNoise(rand, W, H, 14), n3 = valueNoise(rand, W, H, 5);
  const cols = st.ground.map(hexRgb);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = n1(x, y) * 0.55 + n2(x, y) * 0.3 + n3(x, y) * 0.15;
    v += (rand() - 0.5) * 0.06;                                   // dithering grain
    const idx = Math.max(0, Math.min(cols.length - 1, Math.floor(v * cols.length * 1.15 - 0.4)));
    const [r, g, b] = cols[idx];
    const i = (y * W + x) * 4;
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // tufts / pebbles
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rand() * W), y = Math.floor(rand() * H);
    ctx.fillStyle = st.ground[0];
    ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 2, y - 1, 1, 3); ctx.fillRect(x + 4, y, 1, 2);
  }

  // field markings
  ctx.strokeStyle = st.line; ctx.lineWidth = 1;
  ctx.strokeRect(FIELD.x0 + 0.5, FIELD.y0 + 0.5, FIELD.x1 - FIELD.x0 - 1, FIELD.y1 - FIELD.y0 - 1);
  const midY = Math.round((FIELD.y0 + FIELD.y1) / 2) + 0.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(FIELD.x0, midY); ctx.lineTo(FIELD.x1, midY); ctx.stroke();
  ctx.beginPath(); ctx.arc(144, midY, 38, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(FIELD.x0 + 40.5, FIELD.y0 + 0.5, FIELD.x1 - FIELD.x0 - 81, 54);
  ctx.strokeRect(FIELD.x0 + 40.5, FIELD.y1 - 54.5, FIELD.x1 - FIELD.x0 - 81, 54);

  // edge band + rocks beyond the field
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, FIELD.y1 + 4, W, 2);
  ctx.fillRect(0, FIELD.y0 - 6, W, 2);
  const rocks = [];
  for (let i = 0; i < 7; i++) rocks.push([12 + i * 44 + rand() * 18, 86 + rand() * 20, 9 + rand() * 8]);
  for (let i = 0; i < 7; i++) rocks.push([10 + i * 44 + rand() * 18, 486 + rand() * 18, 9 + rand() * 9]);
  for (const [x, y, r] of rocks) {
    if (Math.abs(x - 144) < 24) continue; // keep trainer spots clear
    const g = new PixGrid(Math.ceil(r * 2 + 4), Math.ceil(r * 1.5 + 4));
    g.ellipse(g.w / 2, g.h / 2 + 1, r, r * 0.7, st.rock);
    g.ellipse(g.w / 2 - 1, g.h / 2 - r * 0.25, r * 0.7, r * 0.3, st.rockCap);
    g.outline();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y + r * 0.6), r + 1, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(g.toCanvas(), Math.round(x - g.w / 2), Math.round(y - g.h / 2));
  }
  return { canvas: cv, stage: st };
}
