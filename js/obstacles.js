// Obstacles and floor hazards (r268, the owner: "let's try them out", step 2 of the level work). Obstacles: solid props in fight rooms, the area's
// own large props (bushes and boulders in the meadow, lava rocks in the crater, crystals in the grotto...). They block
// walking for everyone and stop shots from both sides, so fights get cover and paths. Rush only.
//
// A room's obstacles are worked out once from its seed (room.obstacles, plain data, so the run save keeps them) and
// laid out in mirrored pairs, so a room looks designed. What always stays open: the middle of the room (rewards and
// the stairs appear there), a lane across the room each way through the middle (the way to every door), a gap along
// every wall, and a gap between obstacles, so nothing can wall you in.
//
// Each obstacle: x, y = the middle of its base (where it stands, like a Coreature's feet), fw, fd = its footprint
// (width, and depth up from its base), w, h = its picture's size in world units, p = the piece in the area's props
// sheet, flip = mirrored.
const OBSTACLE_ROOMS = { fight: true, challenge: true };
const OBST_LANE = 44;      // half the width of the open lanes through the middle
const OBST_MIDDLE = 74;    // how far from the middle of the room everything stays clear
const OBST_WALL = 40;      // the gap kept along every wall
const OBST_GAP = 44;       // the gap kept between obstacles

function roomObstacles(room, stageKey) {
  if (room.obstacles) return room.obstacles;
  const sheet = typeof LEVEL_SHEET_DATA !== 'undefined' && LEVEL_SHEET_DATA[stageKey] && LEVEL_SHEET_DATA[stageKey].props;
  if (!OBSTACLE_ROOMS[room.type] || !sheet || !(sheet.large || []).length) return (room.obstacles = []);
  const rand = mulberry((room.seed || 1) * 31 + 7), F = roomField(room);
  const cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2, my = doorPos(room, 'w').y;
  const out = [];
  if (rand() < 0.2) return (room.obstacles = out);   // now and then an open room
  const big = (F.x1 - F.x0) * (F.y1 - F.y0) > 200000;
  const pairs = big ? 2 + ((rand() * 2) | 0) : 1 + ((rand() * 2) | 0);
  const S = DECOR_PX, groups = [];   // each group's box, for the gaps between them
  // a footprint's box, grown by m; the box round a whole group
  const box = (o, m = 0) => [o.x - o.fw / 2 - m, o.y - o.fd - m, o.x + o.fw / 2 + m, o.y + m];
  const around = g => g.map(o => box(o)).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  const grow = (b, m) => [b[0] - m, b[1] - m, b[2] + m, b[3] + m];
  const hits = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const ok = g => {
    const [x0, y0, x1, y1] = around(g);
    if (x0 < F.x0 + OBST_WALL || x1 > F.x1 - OBST_WALL || y0 < F.y0 + OBST_WALL || y1 > F.y1 - OBST_WALL * 0.8) return false;
    if (x1 > cx - OBST_LANE && x0 < cx + OBST_LANE) return false;                 // the lane down through the middle
    if (y1 > Math.min(cy, my) - OBST_LANE && y0 < Math.max(cy, my) + OBST_LANE) return false;   // and across it
    if (Math.max(x0 - cx, cx - x1, 0) ** 2 + Math.max(y0 - cy, cy - y1, 0) ** 2 < OBST_MIDDLE ** 2) return false;
    return groups.every(q => !hits(grow([x0, y0, x1, y1], OBST_GAP / 2), grow(q, OBST_GAP / 2)));
  };
  // room shapes: now and then a block of solid wall fills one corner (an L-shaped room) or both top or both bottom
  // corners (a T); it stops short of the lanes through the middle, so every doorway stays open. It's drawn as part of
  // the walls (rooms.js), and only its open sides push things out (open: l, r, u, d)
  if (rand() < 0.35) {
    const top = rand() < 0.5, two = rand() < 0.5, left = rand() < 0.5;
    const bw = Math.round((cx - OBST_LANE - 20 - F.x0) * (0.55 + rand() * 0.35));
    const room_ = top ? Math.min(cy, my) - OBST_LANE - 10 - F.y0 : F.y1 - (Math.max(cy, my) + OBST_LANE + 10);
    const bh = Math.round(room_ * (0.8 + rand() * 0.2));
    if (bh >= (top ? 62 : 36)) for (const L of two ? [true, false] : [left]) {
      const x0 = L ? F.x0 : F.x1 - bw, y0 = top ? F.y0 : F.y1 - bh;
      const b = { x: x0 + bw / 2, y: y0 + bh, fw: bw, fd: bh, block: (top ? 't' : 'b') + (L ? 'l' : 'r'), open: (L ? 'r' : 'l') + (top ? 'd' : 'u') };
      out.push(b); groups.push(box(b));
    }
  }
  // a formation of 1-3 of the area's large props side by side, overlapping a little, staggered in depth; built round
  // (0, 0) and then moved into place
  const formation = () => {
    const n = rand() < 0.3 ? 1 : rand() < (big ? 0.6 : 0.85) ? 2 : 3, pool = sheet.large.slice(), g = [];
    let x = 0;
    for (let i = 0; i < n; i++) {
      if (!pool.length) pool.push(...sheet.large);
      const p = pool.splice((rand() * pool.length) | 0, 1)[0], w = p[2] * S, h = p[3] * S;
      const fw = Math.round(w * 0.8), fd = Math.round(Math.min(h * 0.4, 16));
      if (i) x += fw / 2 - 6;
      g.push({ x: x, y: i ? Math.round(rand() * 10 - 3) : 0, fw, fd, w, h, p, flip: rand() < 0.5 });
      x += fw / 2;
    }
    for (const o of g) o.x = Math.round(o.x - (x - g[0].fw / 2) / 2);   // centred on 0
    return g;
  };
  for (let i = 0; i < pairs; i++) {
    const g = formation(), [gx0, , gx1] = around(g), gw = gx1 - gx0;
    for (let t = 0; t < 30; t++) {
      const x = Math.round(F.x0 + OBST_WALL + gw / 2 + rand() * Math.max(0, cx - OBST_LANE - F.x0 - OBST_WALL - gw)), y = Math.round(F.y0 + OBST_WALL + 18 + rand() * (F.y1 - F.y0 - OBST_WALL * 1.8 - 18));
      const a = g.map(o => ({ ...o, x: o.x + x, y: o.y + y }));
      const b = a.map(o => ({ ...o, x: Math.round(2 * cx - o.x), flip: !o.flip }));   // and its mirror image
      if (!ok(a)) continue;
      groups.push(around(a));
      if (!ok(b)) { groups.pop(); continue; }
      groups.push(around(b)); out.push(...a, ...b); break;
    }
  }
  return (room.obstacles = out);
}

// Floor hazards (r268): the area's dangerous-looking floor patches, which now really are dangerous (in fights, to
// both sides; fliers float over them). Which patches in each props sheet (by their place in its patch row) and what
// they do. The patches not listed stay plain decoration, and the listed ones are never used as decoration, so a
// patch that looks dangerous always is.
const FLOOR_HAZARDS = { meadow: { 0: 'mud' }, crater: { 0: 'lava', 1: 'lava' }, summit: { 0: 'ice', 1: 'snow' }, grotto: { 1: 'crystal' }, ruins: { 2: 'quicksand' }, spire: { 1: 'rune' } };
const HAZARD_FX = {
  mud: { slow: 0.35, name: 'MUD' }, snow: { slow: 0.3, name: 'SNOWDRIFT' }, ice: { slip: true, name: 'ICE' },
  quicksand: { slow: 0.45, pull: 34, name: 'QUICKSAND' },
  lava: { dmg: 0.025, every: 0.5, status: 'brn', chance: 0.2, col: ['#ffb080', '#c84a1a'], name: 'LAVA' },
  crystal: { dmg: 0.02, every: 0.5, col: ['#bff8ff', '#2a8ad0'], name: 'CRYSTALS' },
  rune: { dmg: 0.02, every: 0.7, status: 'par', chance: 0.15, col: ['#ffe066', '#8a6a1a'], name: 'RUNE' },
};
function hazardPatchSet(stageKey) { return new Set(Object.keys(FLOOR_HAZARDS[stageKey] || {}).map(Number)); }

// a room's hazards, worked out once from its seed like its obstacles: { x, y, rx, ry, kind, p } (the middle, the
// patch's half size in world units, what it does, its piece in the props sheet). Kept off the doorways (you never
// walk into a room straight into lava), the middle of the room and the obstacles.
function roomFloorHazards(room, stageKey) {
  if (room.floorHazards) return room.floorHazards;
  const sheet = typeof LEVEL_SHEET_DATA !== 'undefined' && LEVEL_SHEET_DATA[stageKey] && LEVEL_SHEET_DATA[stageKey].props;
  const kinds = FLOOR_HAZARDS[stageKey];
  if (!OBSTACLE_ROOMS[room.type] || !sheet || !kinds || !(sheet.patch || []).length) return (room.floorHazards = []);
  const rand = mulberry((room.seed || 1) * 53 + 11), F = roomField(room), S = DECOR_PX, out = [];
  if (rand() < 0.25) return (room.floorHazards = out);
  const cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2, big = (F.x1 - F.x0) * (F.y1 - F.y0) > 200000;
  const n = big ? 3 + ((rand() * 4) | 0) : 2 + ((rand() * 3) | 0), idx = Object.keys(kinds).map(Number);
  const doors = ['n', 's', 'w', 'e'].map(d => doorPos(room, d)), obs = roomObstacles(room, stageKey);
  for (let i = 0; i < n; i++) {
    const k = idx[(rand() * idx.length) | 0], p = sheet.patch[k];
    if (!p) continue;
    const rx = p[2] * S / 2, ry = p[3] * S / 2;
    for (let t = 0; t < 30; t++) {
      const x = Math.round(F.x0 + 14 + rx + rand() * (F.x1 - F.x0 - 28 - rx * 2)), y = Math.round(F.y0 + 14 + ry + rand() * (F.y1 - F.y0 - 28 - ry * 2));
      if (doors.some(d => Math.hypot(d.x - x, d.y - y) < 70 + rx)) continue;
      if (Math.hypot((x - cx) / 1.6, y - cy) < 50 + ry) continue;
      if (obs.some(q => Math.abs(q.x - x) < q.fw / 2 + rx + 10 && y + ry > q.y - q.fd - 10 && y - ry < q.y + 10)) continue;
      if (out.some(q => Math.abs(q.x - x) < q.rx + rx + 16 && Math.abs(q.y - y) < q.ry + ry + 12)) continue;
      out.push({ x, y, rx: Math.round(rx * 0.92), ry: Math.round(ry * 0.92), kind: kinds[k], p }); break;
    }
  }
  return (room.floorHazards = out);
}

// Push a point with radius r (a Coreature's feet, a pickup) out of any obstacle it's in. Feet are squashed like the
// floor: half as deep as wide. Returns true if it moved.
function pushOutOfObstacles(obs, o, r) {
  let moved = false;
  for (const q of obs) {
    const x0 = q.x - q.fw / 2 - r, x1 = q.x + q.fw / 2 + r, y0 = q.y - q.fd - r * 0.5, y1 = q.y + r * 0.5;
    if (o.x <= x0 || o.x >= x1 || o.y <= y0 || o.y >= y1) continue;
    const can = s => !q.open || q.open.includes(s);   // a wall block only lets things out of its open sides
    const l = can('l') ? o.x - x0 : Infinity, rr = can('r') ? x1 - o.x : Infinity, u = can('u') ? o.y - y0 : Infinity, d = can('d') ? y1 - o.y : Infinity;
    const m = Math.min(l, rr, u, d);   // out the nearest side
    if (m === l) o.x = x0; else if (m === rr) o.x = x1; else if (m === u) o.y = y0; else o.y = y1;
    moved = true;
  }
  return moved;
}
// is a shot flying at body height over (x, y) going into an obstacle?
function shotBlocked(obs, x, y) {
  return obs.some(q => Math.abs(x - q.x) < q.fw / 2 && y > q.y - q.fd - 22 && y < q.y - 2);
}

mixInto(Battle, class {
  get floorHazards() { return this._fh || (this._fh = roomFloorHazards(this.room, this.run.stageKey)); }
  // what the floor under a Coreature does to it this frame (in fights; fliers float over): slows, slips, pulls and
  // hurts are applied here or returned for updateMon's movement
  floorHazard(m, dt) {
    if (this.state !== 'fight' || m.fainted || m.hover > 0 || (FLYERS[m.id] && m.status !== 'frz')) return null;
    const h = this.floorHazards.find(q => ((m.x - q.x) / q.rx) ** 2 + ((m.y - q.y) / q.ry) ** 2 < 1);
    if (!h) { m.hzT = 0; return null; }
    const f = HAZARD_FX[h.kind];
    if (f.pull) {
      const dx = h.x - m.x, dy = h.y - m.y, d = Math.hypot(dx, dy);
      if (d > 3) { m.x += dx / d * f.pull * dt; m.y += dy / d * f.pull * dt; }
    }
    if (f.dmg && !(m.invuln > 0) && !(m.spawnT > 0)) {
      m.hzT = (m.hzT || 0) - dt;
      if (m.hzT <= 0) {
        m.hzT = f.every;
        const d = Math.max(1, Math.round(m.maxHp * f.dmg));
        m.hp = Math.max(0, m.hp - d);
        this.number(m, d, null, f.col[0], f.col[1]);
        if (f.status && Math.random() < f.chance) this.applyStatus(m, f.status);
        if (m.hp <= 0) this.faint(m);
      }
    }
    return f;
  }
  // how far a beam fired from m along dir gets before an obstacle stops it
  beamReach(m, dir, mv) {
    const obs = this.obstacles;
    if (!obs.length) return mv.len;
    const cs = Math.cos(dir), sn = Math.sin(dir);
    for (let d = m.r; d < mv.len; d += 4) if (shotBlocked(obs, m.x + cs * d, m.cy + sn * d)) return Math.max(m.r, d);
    return mv.len;
  }
  get obstacles() { return this._obs || (this._obs = roomObstacles(this.room, this.run.stageKey)); }
  // keep a Coreature (or anything with x, y) out of the obstacles
  unblock(o, r) { const obs = this.obstacles; return obs.length ? pushOutOfObstacles(obs, o, r) : false; }
  drawObstacle(ctx, q) {
    const s = levelSheet(this.run.stageKey, 'props');
    if (!s || q.block) return;   // wall blocks are part of the walls (rooms.js)
    Lighting.shadow(ctx, q.x, q.y - 1, q.fw / 2 + 2, Math.max(3, q.fd * 0.4), 1.1);
    const [sx, sy, w, h] = q.p, X = Math.round(q.x - q.w / 2), Y = Math.round(q.y - q.h + 3);
    if (!q.flip) { ctx.drawImage(s.img, sx, sy, w, h, X, Y, q.w, q.h); return; }
    ctx.save(); ctx.translate(X + q.w, Y); ctx.scale(-1, 1); ctx.drawImage(s.img, sx, sy, w, h, 0, 0, q.w, q.h); ctx.restore();
  }
});
