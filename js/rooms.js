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
// start decoding every area's sheets at load, so the first room doesn't wait
if (typeof LEVEL_SHEET_DATA !== 'undefined') for (const a of Object.keys(LEVEL_SHEET_DATA)) for (const k of Object.keys(LEVEL_SHEET_DATA[a])) levelSheet(a, k);

// draw piece p ([x, y, w, h] in the sheet) with its top-left at (x, y); rot = quarter turns clockwise
function decorPiece(ctx, img, p, x, y, rot = 0) {
  const [sx, sy, w, h] = p;
  if (!rot) { ctx.drawImage(img, sx, sy, w, h, Math.round(x), Math.round(y), w, h); return; }
  ctx.save(); ctx.translate(Math.round(x), Math.round(y));
  if (rot === 1) { ctx.translate(h, 0); ctx.rotate(Math.PI / 2); }
  else if (rot === 3) { ctx.translate(0, w); ctx.rotate(-Math.PI / 2); }
  ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h); ctx.restore();
}

// the decoration layer for a room (null until the area's sheets have loaded, or if the area has none)
function roomDecor(room, stageKey) {
  if (room.decor !== undefined) return room.decor;
  const walls = levelSheet(stageKey, 'walls'), props = levelSheet(stageKey, 'props');
  const has = LEVEL_SHEET_DATA && LEVEL_SHEET_DATA[stageKey];
  if (!has) return (room.decor = null);
  if ((has.walls && !walls) || (has.props && !props)) return null;   // still loading: try again next frame
  const S = DECOR_PX, dw = Math.ceil(room.w / S), dh = Math.ceil(room.h / S);
  const cv = document.createElement('canvas'); cv.width = dw; cv.height = dh;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const rand = mulberry((room.seed || 1) * 7 + 13), pick = a => a[(rand() * a.length) | 0];
  const F = roomField(room), fx0 = F.x0 / S, fy0 = F.y0 / S, fx1 = F.x1 / S, fy1 = F.y1 / S;
  const doorHalf = DOOR_W / 2 / S, mx = room.w / 2 / S, my = (F.y0 + F.y1) / 2 / S;
  const nearDoor = (x0, x1, dir) => room.doors[dir] && x1 > mx - doorHalf - 6 && x0 < mx + doorHalf + 6;

  if (walls) {
    const { img, d } = walls, top = d.top || [], faces = d.face || [];
    // the old brick walls covered first in the area's dark backdrop colour, so no sliver of them shows where a piece
    // is a little thinner than the wall (the doorways are cleared back out below)
    ctx.fillStyle = STAGES[stageKey].bg;
    ctx.fillRect(0, 0, dw, Math.ceil(fy0)); ctx.fillRect(0, 0, Math.ceil(fx0), dh); ctx.fillRect(Math.floor(fx1), 0, dw, dh); ctx.fillRect(0, Math.floor(fy1), dw, dh);
    const flat = p => (Array.isArray(p[0]) ? p : [p]);   // a doorway seen from above: one piece, or [left, right]
    // the top wall: faces side by side (one in four with a decoration built in), bottom-aligned on the floor's edge
    for (let x = -((rand() * 20) | 0); x < dw;) {
      const p = d.faceDeco && rand() < 0.25 ? pick(d.faceDeco) : pick(faces);
      decorPiece(ctx, img, p, x, fy0 + 1 - p[3]); x += p[2] - 1;
    }
    // the bottom wall: wall tops lying flat
    for (let x = -((rand() * 20) | 0); x < dw;) { const p = pick(top); decorPiece(ctx, img, p, x, fy1 - 1); x += p[2] - 1; }
    // the side walls: wall tops turned upright, the whole height of the room (over the top wall's ends, like a room
    // seen from above), set against the floor's edge
    for (const dir of ['w', 'e']) {
      for (let y = -((rand() * 20) | 0); y < dh;) {
        const p = pick(top);
        decorPiece(ctx, img, p, dir === 'w' ? fx0 + 1 - p[3] : fx1 - 1, y, dir === 'w' ? 3 : 1); y += p[2] - 1;
      }
    }
    // things hung on the top wall, clear of the doorway and the torches
    if (d.deco) for (let i = 0, n = room.w > 600 ? 3 : 2; i < n; i++) {
      const p = pick(d.deco);
      for (let t = 0; t < 10; t++) {
        const x = fx0 + 10 + rand() * (fx1 - fx0 - 20 - p[2]);
        if (nearDoor(x - 4, x + p[2] + 4, 'n')) continue;
        decorPiece(ctx, img, p, x, Math.max(1, fy0 - 4 - p[3])); break;
      }
    }
    // doorways: the wall cleared where the passage is (the room's own dark passage shows through), then the area's
    // doorway drawn over it, its gap on the passage
    const gap = (DOOR_W) / S;
    if (room.doors.n && d.doorFront) {
      const p = d.doorFront[0];
      ctx.clearRect(mx - gap / 2, 0, gap, fy0 + 1);
      decorPiece(ctx, img, p, mx - p[2] / 2, fy0 + 1 - p[3]);
    }
    const dt = d.doorTop && d.doorTop.length ? flat(pick(d.doorTop)) : null;
    const doorTop = (dir) => {
      if (!dt) return;
      if (dt.length === 2) {   // left and right halves set at the gap's edges
        const [L, R] = dt;
        if (dir === 's') { ctx.clearRect(mx - gap / 2, fy1, gap, dh - fy1); decorPiece(ctx, img, L, mx - gap / 2 - L[2] + 2, fy1 - 1); decorPiece(ctx, img, R, mx + gap / 2 - 2, fy1 - 1); }
        else {   // turned upright: for the left wall the left half goes on top, for the right wall the right half
          const yA = my - gap / 2, yB = my + gap / 2, x = dir === 'w' ? fx0 - L[3] + 1 : fx1 - 1;
          ctx.clearRect(dir === 'w' ? 0 : fx1, yA, dir === 'w' ? fx0 : dw - fx1, gap);
          if (dir === 'w') { decorPiece(ctx, img, R, x, yA - R[2] + 2, 3); decorPiece(ctx, img, L, x, yB - 2, 3); }
          else { decorPiece(ctx, img, L, x, yA - L[2] + 2, 1); decorPiece(ctx, img, R, x, yB - 2, 1); }
        }
        return;
      }
      const p = dt[0];
      if (dir === 's') { ctx.clearRect(mx - gap / 2, fy1, gap, dh - fy1); decorPiece(ctx, img, p, mx - p[2] / 2, fy1 - 1); }
      else {
        ctx.clearRect(dir === 'w' ? 0 : fx1, my - gap / 2, dir === 'w' ? fx0 : dw - fx1, gap);
        decorPiece(ctx, img, p, dir === 'w' ? fx0 - p[3] + 1 : fx1 - 1, my - p[2] / 2, dir === 'w' ? 3 : 1);
      }
    };
    for (const dir of ['s', 'w', 'e']) if (room.doors[dir]) doorTop(dir);
  }
  if (props) {   // after the walls: the props along the top wall stand in front of it
    const { img, d } = props;
    // ground patches and small details, flat on the floor (kept off the doorways' fronts)
    const clearOfDoors = (x, y, w, h) => !(['n', 's'].some(dir => room.doors[dir] && x + w > mx - doorHalf - 4 && x < mx + doorHalf + 4 && (dir === 'n' ? y < fy0 + 18 : y + h > fy1 - 18))
      || ['w', 'e'].some(dir => room.doors[dir] && y + h > my - doorHalf - 4 && y < my + doorHalf + 4 && (dir === 'w' ? x < fx0 + 18 : x + w > fx1 - 18)));
    const place = (p, tries = 12) => {
      for (let t = 0; t < tries; t++) {
        const x = fx0 + 4 + rand() * (fx1 - fx0 - 8 - p[2]), y = fy0 + 6 + rand() * (fy1 - fy0 - 10 - p[3]);
        if (clearOfDoors(x, y, p[2], p[3])) { decorPiece(ctx, img, p, x, y); return true; }
      }
      return false;
    };
    const area = (fx1 - fx0) * (fy1 - fy0);
    if (d.patch) for (let i = 0, n = area > 30000 ? 2 : rand() < 0.6 ? 1 : 0; i < n; i++) place(pick(d.patch));
    if (d.small) for (let i = 0, n = Math.round(area / 2000); i < n; i++) place(pick(d.small), 4);
    // medium and large props stand along the top wall and in its corners, so Coreatures always pass in front of them
    const stand = [];
    if (d.large) for (let i = 0, n = room.w > 600 ? 2 : rand() < 0.5 ? 1 : 0; i < n; i++) {
      const p = pick(d.large), left = i === 0 ? rand() < 0.5 : !stand[0].left;
      stand.push({ p, left, x: left ? fx0 + 3 + rand() * 6 : fx1 - 3 - p[2] - rand() * 6, y: fy0 + 4 + rand() * 4 - p[3] * 0.35 });
    }
    if (d.medium) for (let i = 0, n = 2 + ((rand() * 3) | 0); i < n; i++) {
      const p = pick(d.medium);
      for (let t = 0; t < 10; t++) {
        const x = fx0 + 6 + rand() * (fx1 - fx0 - 12 - p[2]), y = fy0 + 2 + rand() * 6 - p[3] * 0.3;
        if (nearDoor(x, x + p[2], 'n') || stand.some(s => x + p[2] > s.x - 3 && x < s.x + s.p[2] + 3)) continue;
        stand.push({ p, x, y }); break;
      }
    }
    stand.sort((a, b) => (a.y + a.p[3]) - (b.y + b.p[3]));
    for (const s of stand) decorPiece(ctx, img, s.p, s.x, s.y);
  }

  return (room.decor = cv);
}
