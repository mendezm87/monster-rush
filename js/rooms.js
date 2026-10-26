// Each area's own walls and decorations (r260, the owner: "give each area its own look"; prompts in
// docs/level-prompts.md, pieces cut by tools/level-sheets.py into js/level-sheets.js). Rush only.
//
// A room gets a decoration layer, built once and kept on the room (room.decor, freed with the floor), drawn over its
// floor and brick walls (roomCanvas in arena.js, which stays underneath as the fallback). The layer is at the sprites'
// own pixel size (one pixel = one sprite pixel = 1.5 world units), so the art's pixels match the Coreatures'. It holds:
// the area's wall faces along the top wall (now and then one with a decoration built in), its wall tops seen from above
// along the sides and bottom, its doorways, a few things hung on the top wall, flat ground patches and small details
// scattered by the room's seed (the same room always looks the same), and medium and large props along the top wall
// and in its corners. Everything is looks only for now: you walk over or in front of all of it (obstacles come later).
const DECOR_PX = 1.5;   // world units per decoration pixel
const LEVEL_IMG = {};
// the sheet's picture, loaded the first time it's asked for (data URLs decode in a moment, but not instantly)
function levelSheet(area, kind) {
  const d = typeof LEVEL_SHEET_DATA !== 'undefined' && LEVEL_SHEET_DATA[area] && LEVEL_SHEET_DATA[area][kind];
  if (!d) return null;
  const key = area + ':' + kind;
  if (!LEVEL_IMG[key]) { const img = new Image(); img.src = d.src; LEVEL_IMG[key] = img; }
  const img = LEVEL_IMG[key];
  return img.complete && img.naturalWidth ? { img, d } : null;
}
// a pillar picture's cap, as [first row, rows]: from where it reaches its full width (below any ornament on top) down
// to where the shaft below gets narrower (r267), else 40% of it
const PILLAR_CAPS = new Map();
function pillarCap(img, p) {
  const key = img.src.length + ':' + p.join(',');
  if (PILLAR_CAPS.has(key)) return PILLAR_CAPS.get(key);
  const [sx, sy, w, h] = p, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  const a = g.getImageData(0, 0, w, h).data, width = y => { let n = 0; for (let x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > 0) n++; return n; };
  // once the cap has reached its full width (its top edge may be ragged, like the Grotto's crystals), the first row
  // that's clearly narrower is where the shaft starts
  const rows = Array.from({ length: h }, (_, y) => width(y)), full = Math.max(...rows);
  const top = rows.findIndex(n => n >= full - 1), y0 = top > 3 ? top : 0;   // a rounded rim of a row or two stays
  let cap = [y0, Math.round(h * 0.4)];
  for (let y = Math.max(0, top); y < h * 0.7; y++) if (rows[y] <= full - 3) { cap = [y0, Math.max(4, y - y0)]; break; }
  freeCanvas(c); PILLAR_CAPS.set(key, cap); return cap;
}

// start decoding every area's sheets at load, so the first room doesn't wait
if (typeof LEVEL_SHEET_DATA !== 'undefined') for (const a of Object.keys(LEVEL_SHEET_DATA)) for (const k of Object.keys(LEVEL_SHEET_DATA[a])) levelSheet(a, k);

// draw piece p ([x, y, w, h] in the sheet) with its top-left at (x, y); rot = quarter turns clockwise
// th = the height to draw it at (a wall strip stretched by a pixel or two to fill its wall exactly, r262); flip = mirrored
// along its length (r263: a wall run alternates a tile and its mirror image, so it never shows a seam in its pattern)
function decorPiece(ctx, img, p, x, y, rot = 0, th = 0, flip = false) {
  const [sx, sy, w, h0] = p, h = th || h0;
  if (!rot && !flip) { ctx.drawImage(img, sx, sy, w, h0, Math.round(x), Math.round(y), w, h); return; }
  ctx.save(); ctx.translate(Math.round(x), Math.round(y));
  if (rot === 1) { ctx.translate(h, 0); ctx.rotate(Math.PI / 2); }
  else if (rot === 3) { ctx.translate(0, w); ctx.rotate(-Math.PI / 2); }
  if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
  ctx.drawImage(img, sx, sy, w, h0, 0, 0, w, h); ctx.restore();
}

// the decoration layer for a room (null until the area's sheets have loaded, or if the area has none).
// r261 (the owner: "there are things overlapping that shouldn't be and it makes it look like slop"): nothing overlaps.
// Wall pieces butt up edge to edge and each doorway gets its own slot in its wall; the side walls meet the top and bottom
// walls at the floor's corners; things hung on the wall go where the torches are (and only in areas whose wall tiles
// don't already carry a decoration); every patch, prop and small detail on the floor claims its own space; and a room
// never uses the same prop twice.
function roomDecor(room, stageKey) {
  if (room.decor !== undefined) return room.decor;
  const walls = levelSheet(stageKey, 'walls'), props = levelSheet(stageKey, 'props'), corners = levelSheet(stageKey, 'corners');
  const has = typeof LEVEL_SHEET_DATA !== 'undefined' && LEVEL_SHEET_DATA[stageKey];
  if (!has) return (room.decor = null);
  if ((has.walls && !walls) || (has.props && !props) || (has.corners && !corners)) return null;   // still loading: try again next frame
  const S = DECOR_PX, dw = Math.ceil(room.w / S), dh = Math.ceil(room.h / S);
  const cv = document.createElement('canvas'); cv.width = dw; cv.height = dh;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const rand = mulberry((room.seed || 1) * 7 + 13), pick = a => a[(rand() * a.length) | 0];
  const F = roomField(room), fx0 = Math.round(F.x0 / S), fy0 = Math.round(F.y0 / S), fx1 = Math.round(F.x1 / S), fy1 = Math.round(F.y1 / S);
  const gap = Math.round(DOOR_W / S), mx = Math.round(room.w / 2 / S), my = Math.round((F.y0 + F.y1) / 2 / S);
  // claimed space, so nothing lands on anything else: [x0, y0, x1, y1] in layer pixels
  const taken = [];
  const free = (x0, y0, x1, y1, m = 2) => taken.every(r => x1 + m <= r[0] || x0 - m >= r[2] || y1 + m <= r[1] || y0 - m >= r[3]);
  const claim = (x0, y0, x1, y1) => taken.push([x0, y0, x1, y1]);
  const clip = (x0, y0, x1, y1, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); fn(); ctx.restore(); };
  // pieces laid end to end from a to b along a wall (clipped there, so the last one stops at b), picked by next()
  const run = (a, b, next, place) => { for (let t = a; t < b;) { const p = next(t); place(p, t); t += p.len; } };

  if (walls) {
    const { img, d } = walls, tops = d.top || [], faces = d.face || [];
    const len = (p, flip = false) => ({ p, len: p[2], flip });   // a wall top turned upright runs along its width too
    // the old brick walls covered in the area's dark backdrop colour, so no sliver of them shows where a piece is a
    // little thinner than its wall (the doorways' passages are cleared back out below)
    // (r262, the owner: gaps in the walls) the side and bottom walls in the wall's own main colour (worked out by the
    // cutting tool), so where a piece is a little thinner than its wall, or at the corners, it reads as more wall
    ctx.fillStyle = STAGES[stageKey].bg; ctx.fillRect(0, 0, dw, fy0);
    ctx.fillStyle = d.fill || STAGES[stageKey].bg;
    ctx.fillRect(0, fy0, fx0, dh - fy0); ctx.fillRect(fx1, fy0, dw - fx1, dh - fy0); ctx.fillRect(0, fy1, dw, dh - fy1);
    const flat = p => (Array.isArray(p[0]) ? p : [p]);   // a doorway seen from above: one piece, or [left, right]
    // (r263, the owner: walls that "don't match up") a wall run is one plain tile alternating with its mirror image, so
    // its pattern (bricks, rocks, hedge) carries on unbroken; the matching variants (a window, a crack, a carving) come
    // now and then, never twice running; the tiles with a decoration built in (faceDeco) came at their own scale, so
    // they aren't used; the side and bottom walls use only the plain wall top
    let flipTop = false;
    const topPick = () => len(tops[0], (flipTop = !flipTop));
    // where things will hang on the top wall (where the torches are; lighting.js lights them, same spacing as its
    // torches()), only for areas whose wall faces don't carry decorations of their own; the faces behind them are plain
    const hung = [];
    if (d.deco) {
      const pool = d.deco.slice();
      for (let x = 90; x < room.w - 60; x += 170) {
        if (room.doors.n && Math.abs(x - room.w / 2) <= DOOR_W / 2 + 14) continue;
        if (!pool.length) pool.push(...d.deco);
        const p = pool.splice((rand() * pool.length) | 0, 1)[0], px = Math.round(x / S - p[2] / 2);
        hung.push({ p, x: px, y: Math.max(1, fy0 - 3 - p[3]) });
      }
    }
    let lastAccent = true, flipFace = false;
    const facePick = t => {   // plain behind a hung decoration
      flipFace = !flipFace;
      const behind = hung.some(h => h.x + h.p[2] + 3 > t && h.x - 3 < t + faces[0][2]);
      const accent = !behind && !lastAccent && faces.length > 1 && rand() < 0.3; lastAccent = accent;
      return accent ? len(faces[1 + ((rand() * (faces.length - 1)) | 0)], rand() < 0.5) : len(faces[0], flipFace);
    };
    // the top wall: faces bottom-aligned on the floor's edge, the full width of the room (the side walls start below it),
    // with a slot for its doorway
    // faces line up by the wall's base (the shortest face's height), so a face with rocks spilling below its base
    // doesn't sit higher than the rest (r265, the owner: the meadow's corner looked lifted); the spill goes onto the floor
    const baseH = Math.min(...faces.map(p => p[3]));
    const faceRow = (a, b) => clip(a, 0, b, fy0 + 4, () => run(a - ((rand() * 12) | 0), b, facePick, (q, t) => decorPiece(ctx, img, q.p, t, fy0 - Math.min(q.p[3], baseH), 0, 0, q.flip)));
    const front = room.doors.n && d.doorFront ? d.doorFront[0] : null;
    if (front) {
      const a = mx - Math.round(front[2] / 2), b = a + front[2];
      faceRow(0, a); faceRow(b, dw);
      ctx.clearRect(mx - gap / 2, 0, gap, fy0);   // the passage, back to the room's own dark doorway
      decorPiece(ctx, img, front, a, fy0 - front[3]);
      claim(a, fy0 - front[3], b, fy0 + 14);   // and its front step kept clear
    } else faceRow(0, dw);
    // a doorway seen from above in a wall run along `along` ('x' bottom wall, 'y' side walls): its pieces and where
    // they go along the wall, so the wall pieces either side stop at them
    const doorTops = d.doorTop && d.doorTop.length ? flat(pick(d.doorTop)) : null;
    const doorSpan = c => {
      if (!doorTops) return { a: c - gap / 2, b: c + gap / 2, parts: [] };
      if (doorTops.length === 2) { const [L, R] = doorTops; return { a: c - gap / 2 - L[2], b: c + gap / 2 + R[2], parts: [[L, c - gap / 2 - L[2]], [R, c + gap / 2]] }; }
      const p = doorTops[0]; return { a: c - Math.round(p[2] / 2), b: c - Math.round(p[2] / 2) + p[2], parts: [[p, c - Math.round(p[2] / 2)]] };
    };
    // the bottom wall: wall tops lying flat, between the side walls
    const bottomRow = (a, b) => clip(a, fy1, b, dh, () => run(a - ((rand() * 12) | 0), b, topPick, (q, t) => decorPiece(ctx, img, q.p, t, fy1, 0, dh - fy1, q.flip)));
    if (room.doors.s) {
      const s = doorSpan(mx); bottomRow(fx0, s.a); bottomRow(s.b, fx1);
      ctx.clearRect(mx - gap / 2, fy1, gap, dh - fy1);
      for (const [p, x] of s.parts) decorPiece(ctx, img, p, x, fy1, 0, dh - fy1);
    } else bottomRow(fx0, fx1);
    // the side walls: wall tops turned upright, the whole height of the room, against the floor's edges (left: turned
    // so the piece's left end is at the bottom; right: the other way)
    const pillars = corners && corners.d.pillar, wallEnd = pillars ? fy1 : dh;   // with corner pillars the side walls stop where the bottom wall starts
    for (const dir of ['w', 'e']) {
      const x0 = dir === 'w' ? 0 : fx1, x1 = dir === 'w' ? fx0 : dw, rot = dir === 'w' ? 3 : 1;
      const put = (p, y, flip = false) => decorPiece(ctx, img, p, dir === 'w' ? 0 : fx1, y, rot, dir === 'w' ? fx0 : dw - fx1, flip);   // filling the wall's thickness
      const col = (a, b) => clip(x0, a, x1, b, () => run(a - ((rand() * 12) | 0), b, topPick, (q, t) => put(q.p, t, q.flip)));
      if (room.doors[dir]) {
        const s = doorSpan(my); col(fy0, s.a); col(s.b, wallEnd);
        ctx.clearRect(x0, my - gap / 2, x1 - x0, gap);
        // turned upright, a [left, right] pair swaps ends: on the left wall the right half (post at its left end, which
        // turns to the bottom) goes above the gap; on the right wall the left half does
        if (doorTops && doorTops.length === 2) {
          const [L, R] = doorTops, up = dir === 'w' ? R : L, down = dir === 'w' ? L : R;
          put(up, my - gap / 2 - up[2]); put(down, my + gap / 2);
        } else for (const [p, y] of s.parts) put(p, y);
      } else col(fy0, wallEnd);
    }
    // a pillar at each corner of the room (r265, the owner: "maybe we should have corners"); r267 (the owner: "make them
    // look like they actually fit there instead of just pasting a pillar on top"): each is drawn exactly as wide as its
    // wall. At the top corners the decorated one stands beside the back wall, its foot on the floor line like the wall
    // faces', the side wall running down from under it. At the bottom corners this camera only sees a pillar's top, so
    // the square where the side and bottom walls meet gets the plain one's cap, and the side walls stop there.
    if (pillars) {
      const [plain, fancy] = pillars, cimg = corners.img;
      for (const [x0, x1] of [[0, fx0], [fx1, dw]]) {
        const w = x1 - x0, top = fancy || plain;
        const th = Math.min(fy0, Math.round(top[3] * w / top[2]));   // squeezed a little if it's taller than the back wall
        ctx.drawImage(cimg, top[0], top[1], top[2], top[3], x0, fy0 - th, w, th);
        const [cy, ch] = pillarCap(cimg, plain), bh = dh - fy1;
        ctx.fillStyle = d.fill || STAGES[stageKey].bg; ctx.fillRect(x0, fy1, w, bh);   // nothing of the floor shows round the cap's rounded corners
        ctx.drawImage(cimg, plain[0], plain[1] + cy, plain[2], ch, x0, fy1, w, bh);
        claim(x0, 0, x1, fy0); claim(x0, fy1, x1, dh);
      }
    }
    for (const h of hung) { decorPiece(ctx, img, h.p, h.x, h.y); claim(h.x, h.y, h.x + h.p[2], h.y + h.p[3]); }   // the things hung on the top wall
    // room shapes (r268, obstacles.js): a block of solid wall filling a corner of the room, built from the area's own
    // wall pieces so it reads as the walls stepping in. A block along the top shows a wall face along its front edge
    // (like the back wall) with wall tops above it; one along the bottom shows only its top, like the bottom wall. Its
    // open side gets a side wall's strip, with the corner pillar (or its cap) where the edges meet.
    if (tops.length) for (const q of typeof roomObstacles === 'function' ? roomObstacles(room, stageKey) : []) {
      if (!q.block) continue;
      const top = q.block[0] === 't', L = q.block[1] === 'l', wt = fx0, th = tops[0][3];
      const bx0 = Math.round((q.x - q.fw / 2) / S), bx1 = Math.round((q.x + q.fw / 2) / S), by0 = Math.round((q.y - q.fd) / S), by1 = Math.round(q.y / S);
      const ex0 = L ? 0 : bx0, ex1 = L ? bx1 : dw, ey0 = top ? 0 : by0, ey1 = top ? by1 : dh;   // reaching into the walls it's against
      const faceTop = top && faces.length ? by1 - baseH : ey1;
      ctx.fillStyle = d.fill || STAGES[stageKey].bg; ctx.fillRect(ex0, ey0, ex1 - ex0, faceTop - ey0);
      // its top: rows of wall tops, from the open edge back into the wall
      if (top) for (let y = faceTop - th; y > ey0 - th; y -= th) clip(ex0, Math.max(ey0, y), ex1, faceTop, () => run(ex0 - ((rand() * 12) | 0), ex1, topPick, (r, t) => decorPiece(ctx, img, r.p, t, y, 0, 0, r.flip)));
      else for (let y = by0; y < dh; y += th) clip(ex0, y, ex1, Math.min(dh, y + th), () => run(ex0 - ((rand() * 12) | 0), ex1, topPick, (r, t) => decorPiece(ctx, img, r.p, t, y, 0, 0, r.flip)));
      // the open side: a strip like a side wall's (its top turned upright, filling the wall's thickness)
      const sx = L ? bx1 - wt : bx0, rot = L ? 3 : 1;
      clip(sx, ey0, sx + wt, faceTop, () => run(ey0 - ((rand() * 12) | 0), faceTop, topPick, (r, t) => decorPiece(ctx, img, r.p, sx, t, rot, wt, r.flip)));
      if (top && faces.length) {   // its wall face, the same tiles as the back wall's, lined up by their base
        let flipF = false;
        clip(ex0, faceTop - 2, ex1, by1 + 4, () => run(ex0 - ((rand() * 12) | 0), ex1, () => len(faces[0], (flipF = !flipF)), (r, t) => decorPiece(ctx, img, r.p, t, by1 - Math.min(r.p[3], baseH), 0, 0, r.flip)));
      } else clip(ex0, by0, ex1, by0 + th, () => run(ex0 - ((rand() * 12) | 0), ex1, topPick, (r, t) => decorPiece(ctx, img, r.p, t, by0, 0, 0, r.flip)));   // a bottom block's front edge
      if (pillars) {   // where its edges meet
        const [plain, fancy] = pillars, cimg = corners.img;
        if (top) { const pp = fancy || plain, ph = Math.min(baseH + 4, Math.round(pp[3] * wt / pp[2])); ctx.drawImage(cimg, pp[0], pp[1], pp[2], pp[3], sx, by1 - ph, wt, ph); }
        else { const [cy0, ch] = pillarCap(cimg, plain), bh = dh - fy1; ctx.fillRect(sx, by0, wt, bh); ctx.drawImage(cimg, plain[0], plain[1] + cy0, plain[2], ch, sx, by0, wt, bh); }
      }
      claim(ex0, ey0, ex1, ey1);
    }
  }
  // the doorways' approaches on the floor stay clear
  if (room.doors.n) claim(mx - gap / 2 - 4, fy0, mx + gap / 2 + 4, fy0 + 22);
  if (room.doors.s) claim(mx - gap / 2 - 4, fy1 - 22, mx + gap / 2 + 4, fy1);
  if (room.doors.w) claim(fx0, my - gap / 2 - 4, fx0 + 22, my + gap / 2 + 4);
  if (room.doors.e) claim(fx1 - 22, my - gap / 2 - 4, fx1, my + gap / 2 + 4);

  // the room's obstacles (obstacles.js) stand where nothing else goes
  if (typeof roomObstacles === 'function') for (const q of roomObstacles(room, stageKey)) if (!q.block) claim(Math.round((q.x - q.w / 2) / S), Math.round((q.y - q.h) / S), Math.round((q.x + q.w / 2) / S), Math.round((q.y + 4) / S));

  if (props) {   // after the walls: the props along the top wall stand in front of it
    const { img, d } = props;
    // the floor hazards (obstacles.js) are the area's dangerous-looking patches; only the harmless ones are scattered
    if (typeof roomFloorHazards === 'function') for (const q of roomFloorHazards(room, stageKey)) {
      const x = Math.round(q.x / S - q.p[2] / 2), y = Math.round(q.y / S - q.p[3] / 2);
      decorPiece(ctx, img, q.p, x, y); claim(x, y, x + q.p[2], y + q.p[3]);
    }
    const bag = list => { const b = (list || []).slice(); return () => (b.length ? b.splice((rand() * b.length) | 0, 1)[0] : null); };   // each piece once per room
    // medium and large props stand along the top wall and in its corners, so Coreatures always pass in front of them
    const stand = [], large = bag(d.large), medium = bag(d.medium);
    const tryStand = (p, xs, tries = 14) => {
      for (let t = 0; t < tries; t++) {
        const x = Math.round(xs()), y = Math.round(fy0 + 3 + rand() * 4 - p[3] * 0.35);
        if (x < fx0 + 2 || x + p[2] > fx1 - 2 || !free(x, y, x + p[2], y + p[3], 3)) continue;
        claim(x, y, x + p[2], y + p[3]); stand.push({ p, x, y }); return true;
      }
      return false;
    };
    for (let i = 0, n = room.w > 600 ? 2 : rand() < 0.6 ? 1 : 0; i < n; i++) {
      const p = large(); if (!p) break;
      const left = i === 0 ? rand() < 0.5 : !(stand[0] && stand[0].x < mx);
      tryStand(p, () => (left ? fx0 + 3 + rand() * 10 : fx1 - 3 - p[2] - rand() * 10));
    }
    for (let i = 0, n = 2 + ((rand() * 2) | 0) + (room.w > 600 ? 1 : 0); i < n; i++) {
      const p = medium(); if (!p) break;
      tryStand(p, () => fx0 + 6 + rand() * (fx1 - fx0 - 12 - p[2]));
    }
    // flat things on the floor: a patch or two, then small details, each in its own space
    const flatIn = (p, m, tries) => {
      for (let t = 0; t < tries; t++) {
        const x = Math.round(fx0 + 6 + rand() * (fx1 - fx0 - 12 - p[2])), y = Math.round(fy0 + 18 + rand() * (fy1 - fy0 - 24 - p[3]));
        if (!free(x, y, x + p[2], y + p[3], m)) continue;
        claim(x, y, x + p[2], y + p[3]); decorPiece(ctx, img, p, x, y); return true;
      }
      return false;
    };
    const danger = typeof hazardPatchSet === 'function' ? hazardPatchSet(stageKey) : new Set();
    const patch = bag((d.patch || []).filter((p, i) => !danger.has(i))), area = (fx1 - fx0) * (fy1 - fy0);
    for (let i = 0, n = area > 30000 ? 2 : rand() < 0.6 ? 1 : 0; i < n; i++) { const p = patch(); if (p) flatIn(p, 10, 20); }
    if (d.small) for (let i = 0, n = Math.round(area / 2000); i < n; i++) flatIn(pick(d.small), 5, 6);
    stand.sort((a, b) => (a.y + a.p[3]) - (b.y + b.p[3]));
    for (const s of stand) decorPiece(ctx, img, s.p, s.x, s.y);
  }
  return (room.decor = cv);
}
