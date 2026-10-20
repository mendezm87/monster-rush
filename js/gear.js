// Relic gear: every relic you own shows up as something your Coreatures wear (Isaac-style;
// the owner: "if it's funny it's a win", as long as it never looks cheap or buggy).
// Where gear goes comes from the rig, with no hand-placed points: drawing a Coreature with its
// head nudged a pixel shows which pixels are its head, ears nudged its ears and antennae,
// blinking its eyes, legs lifted its feet (gearAnchors). Gear is drawn on its own pixel layer
// (same pixel size, its own ink outline) and laid over the Coreature's pictures, following the
// head's and legs' nudge in each animation frame, so it bobs and steps along (gearSprites).
// Laying it over is cheap, so a Coreature can be dressed the moment you pick up a relic.

// Where each relic is worn is its `gear` in RELICS (dungeon.js). One piece per spot: the newest wins.
const relicGear = id => typeof RELICS !== 'undefined' && RELICS[id] ? RELICS[id].gear : null;
const GEAR_ORDER = ['feet', 'neck', 'head', 'eyes'];   // drawing order: goggles over a helmet's brim
function gearFor(relics) {
  const at = {};
  for (const id of relics) if (relicGear(id)) at[relicGear(id)] = id;
  return GEAR_ORDER.filter(s => at[s]).map(s => at[s]);
}

const GEAR_CACHE = {};
// Where a Coreature's head, eyes, neck and feet are in view v, at rest.
function gearAnchors(id, v, size) {
  const key = id + ':' + v;
  if (GEAR_CACHE[key]) return GEAR_CACHE[key];
  const art = (v === 'fside' || v === 'bside' ? MONSTER_ART_DIAG : MONSTER_ART)[id];
  const keep = RIG;
  const render = pose => { RIG = { ...REST, ...pose }; const g = new PixGrid(size, size); art(g, v); RIG = keep; return g.c; };
  const base = render({});
  const diff = other => { const out = new Set(); other.forEach((c, i) => { if (c !== base[i]) out.add(i); }); return out; };
  const ears = new Set();   // nudged a few distances, so thin antennae and horns show up whole
  for (const n of [1, 2, 3, 4]) for (const i of diff(render({ ears: [n, n] }))) ears.add(i);
  let head = [...diff(render({ head: [0, 1] }))].filter(i => !ears.has(i) && base[i]);
  if (!head.length) head = base.map((c, i) => c ? i : -1).filter(i => i >= 0);   // no head part: the whole sprite
  const eyes = [...diff(render({ eyes: 'blink' }))];
  const xy = i => [i % size, Math.floor(i / size)];
  const box = idx => {
    const ps = idx.map(xy), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
    return { ps, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const H = box(head);
  const mid = rows => { const xs = H.ps.filter(([, y]) => rows(y)).map(p => p[0]); return (Math.min(...xs) + Math.max(...xs)) / 2; };
  // eye clusters: split where there's a gap in x (two eyes facing us, one from the side)
  let lenses = [];
  if (eyes.length && v !== 'back') {   // seen from behind, glasses are just a strap
    const ps = eyes.map(xy).sort((a, b) => a[0] - b[0]);
    let cur = [ps[0]];
    for (let i = 1; i < ps.length; i++) {
      if (ps[i][0] - ps[i - 1][0] > 1) { lenses.push(cur); cur = []; }
      cur.push(ps[i]);
    }
    lenses.push(cur);
    lenses = lenses.map(c => ({ x: (Math.min(...c.map(p => p[0])) + Math.max(...c.map(p => p[0]))) / 2, y: (Math.min(...c.map(p => p[1])) + Math.max(...c.map(p => p[1]))) / 2 }));
  }
  // Hats sit on the solid top of the Coreature above its head (a turret, a volcano, the head itself):
  // the first row where at least 5 of the 7 middle columns are filled, so thin spikes, crests and
  // antennae (and ears) don't hold a hat up in the air.
  const topX = mid(y => y <= H.y0 + 2), cx = Math.round(topX);
  const headSet = new Set(head);
  const solid = (y, inSet) => { let n = 0; for (let d = -3; d <= 3; d++) { const x = cx + d, i = y * size + x; if (x >= 0 && x < size && base[i] && !ears.has(i) && inSet(i)) n++; } return n >= 5; };
  let crown = H.y0, headTop = H.y0;
  for (let y = 0; y <= H.y1; y++) if (solid(y, () => true)) { crown = y; break; }
  for (let y = H.y0; y <= H.y1; y++) if (solid(y, i => headSet.has(i))) { headTop = y; break; }
  // how wide the head (and the whole Coreature) is on each row, to fit bands and hats to it
  const span = (inSet, y) => { let x0 = -1, x1 = -1; for (let x = 0; x < size; x++) { const i = y * size + x; if (base[i] && !ears.has(i) && inSet(i)) { if (x0 < 0) x0 = x; x1 = x; } } return x0 < 0 ? null : [x0, x1]; };
  const headRows = [], bodyRows = [];
  for (let y = 0; y < size; y++) { headRows.push(span(i => headSet.has(i), y)); bodyRows.push(span(() => true, y)); }
  // a neck only if the head sits on top of a body (not a face on a ball, or a head hidden from behind)
  let filled = 0, lowest = 0;
  base.forEach((c, i) => { if (c) { filled++; lowest = Math.max(lowest, Math.floor(i / size)); } });
  const neck = H.y1 < lowest * 0.72 && head.length > filled * 0.12;
  // feet: the bottom of each leg (or diagonal pair of legs), found by lifting it
  const foot = n => {
    const ps = [...diff(render({ legs: n ? [0, 3] : [3, 0] }))].filter(i => base[i]).map(xy);
    if (ps.length < 3) return null;
    const y = Math.max(...ps.map(p => p[1])), low = ps.filter(p => p[1] >= y - 1).map(p => p[0]);
    return { x: (Math.min(...low) + Math.max(...low)) / 2, y, w: Math.max(...low) - Math.min(...low) + 1 };
  };
  return GEAR_CACHE[key] = {
    crown, headTop, headRows, bodyRows, neck, top: H.y0, topX,
    bottom: H.y1, neckX: mid(y => y >= H.y1 - 2),
    left: H.x0, right: H.x1, w: H.x1 - H.x0 + 1, h: H.y1 - H.y0 + 1,
    lenses, feet: [foot(0), foot(1)],
  };
}

const r0 = Math.round;
// a row's [x0, x1] kept within w of the head's middle (so a hat doesn't spread along a long body)
const clip = (row, cx, w) => [Math.max(row[0], Math.round(cx - w / 2)), Math.min(row[1], Math.round(cx + w / 2))];
const isSide = v => v === 'side' || v === 'fside' || v === 'bside';
const GP = {
  gold: P('#f0c040', '#b88a20', '#fff0a0'), red: P('#d83a3a', '#a02020', '#ff7a6a'), iron: P('#9aa0aa', '#6a707c', '#cfd4dc'),
  leaf: P('#4ab04a', '#2a7a30', '#8ae07a'), ember: P('#ff8a2a', '#c8501a', '#ffd06a'), frame: P('#6a4a30', '#4a3020', '#8a6a48'),
  shoe: P('#3a7aff', '#2050c0', '#8ab8ff'), white: P('#f4f4f8', '#c8c8d4', '#ffffff'),
};
// glasses: two lenses (or one from the side) with a strap, or just the strap from behind
function glasses(g, a, v, big, lens, frame = GP.frame, square = false) {
  if (!a.lenses.length) {   // from behind: the strap across the back of the head, fitted to it
    if (!a.neck) return;
    const y = r0(a.headTop + (a.bottom - a.headTop) * 0.35), row = a.headRow(y);
    if (row) g.rect(row[0] + 1, y, row[1] - row[0] - 1, 1, '#4a3020');
    return;
  }
  const R = big ? 2.6 : 2.1, ly = r0(a.lenses[0].y);
  const xs = a.lenses.map(l => l.x), lo = Math.min(...xs), hi = Math.max(...xs);
  // a bridge between the lenses and short arms back over the ears (one arm, going back, from the side)
  const x0 = Math.max(a.left, r0(lo - R - (isSide(v) ? 4 : 2))), x1 = Math.min(a.right, r0(hi + R + (isSide(v) ? 0 : 2)));
  g.rect(x0, ly, Math.max(1, x1 - x0 + 1), 1, square ? frame.b : '#4a3020');
  a.lenses.forEach((l, i) => {
    const col = Array.isArray(lens) ? lens[i % lens.length] : lens;
    if (square) { g.poly([[l.x - R + 0.5, l.y - R + 1], [l.x + R + 0.5, l.y - R + 1], [l.x + R + 0.5, l.y + R], [l.x - R + 0.5, l.y + R]], frame, { edge: true }); g.rect(r0(l.x - R + 1.5), r0(l.y - R + 2), r0(2 * R - 2), r0(2 * R - 2), col); }
    else { g.ellipse(l.x + 0.5, l.y + 0.5, R, R, frame, { edge: true }); g.ellipse(l.x + 0.5, l.y + 0.5, R - 1, R - 1, col); }
    g.px(r0(l.x - R / 2 + 0.5), r0(l.y - R / 2 + 0.5), '#ffffff');
  });
}
// a chain round the neck with something hanging from it
function pendant(g, a, v, big, charm) {
  if (!a.neck) return;
  const w = Math.max(5, Math.min(a.w - 3, big ? 11 : 8)), cx = r0(a.neckX), y = a.bottom;
  if (v !== 'back') { g.rect(cx - (w >> 1), y - 1, w, 1, '#d8b040'); g.px(cx - (w >> 1) - 1, y - 2, '#d8b040'); g.px(cx + (w >> 1), y - 2, '#d8b040'); }
  else { g.rect(cx - (w >> 1), y - 1, w, 1, '#d8b040'); return; }   // just the chain from behind
  charm(isSide(v) ? cx + 2 : cx, y + 1);
}
// Each piece: (g, a = anchors already moved with the head and legs, v, big = a 44px Coreature)
const GEAR_ART = {
  crown(g, a, v, big) {   // not a relic yet; kept for a boss or an unlock
    const w = big ? 9 : 7, x = r0(a.topX - w / 2 + 0.5), y = Math.max(a.crown, 4);
    g.poly([[x, y - 2], [x + w, y - 2], [x + w, y + 1], [x, y + 1]], GP.gold, { edge: true });
    for (const px of [x, x + (w >> 1), x + w - 1]) g.rect(px, y - 4, 1, 2, '#f0c040');
    g.px(x + (w >> 1), y - 1, '#e04060');
  },
  // Muscle Charm: a sweatband round the forehead, its knot tails flying out behind
  muscleCharm(g, a, v, big) {
    // round the forehead; on a Coreature without a separate head (a ball, a boulder), round the top of it
    let y = a.neck ? a.headTop + 1 : Math.max(a.crown, 2) + 1;
    if (a.lenses.length) y = Math.max(a.neck ? a.headTop : a.crown, Math.min(y, r0(Math.min(...a.lenses.map(l => l.y))) - (big ? 6 : 5)));   // above the eyes
    const cap = a.neck ? (big ? 16 : 12) : (big ? 12 : 9);   // no neck: just round the top, over the head
    const row = clip((a.neck ? a.headRow : a.bodyRow)(y + 1) || [a.left, a.right], a.topX, cap);
    const W = Math.min(row[1] - row[0] + 3, cap), cx = (row[0] + row[1] + 1) / 2;
    const L = r0(cx - W / 2), R = L + W;
    g.poly([[L, y], [R, y], [R, y + 2], [L, y + 2]], GP.red, { edge: true });
    g.rect(L + 1, y + 1, W - 2, 1, '#ffffff');
    if (isSide(v)) g.poly([[L + 1, y], [L - 4, y - 1], [L - 5, y + 2], [L + 1, y + 2]], GP.red, { edge: true });
    else if (v === 'back') g.poly([[r0(cx), y + 1], [r0(cx) - 2, y + 5], [r0(cx) + 2, y + 5]], GP.red, { edge: true });
  },
  // Iron Shell: a cooking pot worn as a helmet, handle sticking out
  ironShell(g, a, v, big) {
    const top = Math.max(a.crown, 4), row = clip(a.bodyRow(top + 2) || [a.left, a.right], a.topX, big ? 14 : 11);
    const w = Math.max(7, Math.min(row[1] - row[0] - 1, big ? 12 : 9)), x = r0((row[0] + row[1] + 1) / 2 - w / 2), y = top + 1;
    const hh = Math.max(3, Math.min(5, r0(w * 0.42)));   // as tall as it is wide, roughly, so it never goes flat
    g.poly([[x + 1, y - hh], [x + w - 1, y - hh], [x + w, y], [x, y]], GP.iron, { edge: true });
    g.rect(x - 1, y, w + 2, 1, '#6a707c');                                         // rim
    if (isSide(v)) g.rect(x - 3, y - hh + 1, 3, 1, '#4a4e58'); else g.rect(x + w + 1, y - hh + 1, 2, 1, '#4a4e58');   // the handle
    g.px(x + 2, y - hh + 1, '#ffffff');
  },
  // Leech Lens: red-lensed goggles
  leechLens(g, a, v, big) { glasses(g, a, v, big, '#ff4a6a'); },
  // Split Shot: 3D glasses, one red lens and one blue
  splitShot(g, a, v, big) { glasses(g, a, v, big, a.lenses.length > 1 ? ['#ff3a4a', '#3ad0ff'] : '#3ad0ff', GP.white, true); },
  // Rain Bell: a little brass bell on a collar
  rainBell(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.poly([[x - 1, y], [x + 2, y], [x + 3, y + 3], [x - 2, y + 3]], GP.gold, { edge: true }); g.px(x, y + 4, '#a07a20'); g.px(x, y + 1, '#fff0a0'); });
  },
  // Storm Coil: a copper coil antenna standing up off the head, sparking at the tip
  stormCoil(g, a, v, big) {
    const x = r0(a.topX) + (isSide(v) ? -2 : 2), y = Math.max(a.crown, 7);
    for (let k = 0; k < 3; k++) { g.rect(x - 1, y - 2 - k * 2, 3, 1, '#d87a3a'); g.rect(x - 1, y - 3 - k * 2, 3, 1, '#8a4a1a'); }
    g.px(x, y - 8, '#e8e8f0'); g.px(x - 1, y - 9, '#7af0ff'); g.px(x + 1, y - 10, '#d0faff');
  },
  hourglass(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => {
      g.rect(x - 1, y, 3, 1, '#d8b040'); g.rect(x - 1, y + 4, 3, 1, '#d8b040');
      g.px(x - 1, y + 1, '#c8e8ff').px(x, y + 1, '#f0d070').px(x + 1, y + 1, '#c8e8ff').px(x, y + 2, '#f0d070').px(x - 1, y + 3, '#f0d070').px(x, y + 3, '#f0d070').px(x + 1, y + 3, '#f0d070');
    });
  },
  luckyCoin(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.ellipse(x + 0.5, y + 1.5, 1.9, 1.9, GP.gold, { edge: true }); g.px(x, y + 1, '#fff0a0'); });
  },
  blastCore(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.ellipse(x + 0.5, y + 1.5, 2, 2, P('#ff6a1a', '#c02a0a', '#ffe070'), { edge: true }); g.px(x, y + 1, '#fff8c0'); });
  },
  // Swift Boots: a pair of blue sneakers with white soles
  swiftBoots(g, a, v, big) {
    for (const f of a.feet) {
      if (!f) continue;
      const w = Math.max(3, Math.min(f.w + 1, big ? 7 : 5)), x = r0(f.x - w / 2 + 0.5) + (isSide(v) ? 1 : 0), y = f.y;
      g.poly([[x, y - 2], [x + w, y - 2], [x + w, y + 1], [x, y + 1]], GP.shoe, { edge: true });
      g.rect(x, y, w, 1, '#ffffff');
      g.px(x + (isSide(v) ? 0 : w - 1), y - 2, '#ffffff');   // a little white stripe
    }
  },
};

// Draw a Coreature's gear into g for view v in the current rig pose.
function drawGear(g, id, v, gear) {
  const big = g.w > 32, Q = rig(), side = isSide(v);
  const base = gearAnchors(id, v, g.w);
  const dx = side ? Q.head[0] : 0, dy = Q.head[1];   // the head's nudge in this frame (see rigParts)
  const legs = Q.legs || [0, 0];
  const rowAt = (rows, y) => { const r = rows[y - dy]; return r && [r[0] + dx, r[1] + dx]; };
  const a = { ...base, crown: base.crown + dy, headTop: base.headTop + dy, headRow: y => rowAt(base.headRows, y), bodyRow: y => rowAt(base.bodyRows, y), top: base.top + dy, bottom: base.bottom + dy, topX: base.topX + dx, neckX: base.neckX + dx,
    left: base.left + dx, right: base.right + dx, lenses: base.lenses.map(l => ({ x: l.x + dx, y: l.y + dy })),
    feet: base.feet.map((f, i) => f && { ...f, x: f.x + (side && legs[i] ? 1 : 0), y: f.y - legs[i] }) };
  for (const k of gear) GEAR_ART[k] && GEAR_ART[k](g, a, v, big);
}

// A Coreature's whole sprite set with gear laid over it: views, flap frames and animation frames.
// Layers are shared between frames where the head and legs sit the same, so this is quick.
const GEAR_SETS = {};
function gearSprites(id, gear) {
  const key = id + '|' + gear.join(','), sp = SPRITES[id];
  if (GEAR_SETS[key]) return GEAR_SETS[key];
  const layers = {}, own = [];   // own: the canvases made here (faint frames are the plain Coreature's, shared)
  const layer = v => {
    const Q = rig(), k = v + Q.head.join() + (Q.legs || [0, 0]).join();
    if (layers[k]) return layers[k];
    const g = new PixGrid(sp.size, sp.size);
    drawGear(g, id, v, gear);
    g.outline();
    own.push(layers[k] = g.toCanvas());
    return layers[k];
  };
  const dress = views => {
    const out = {};
    for (const v of Object.keys(views)) {
      const c = document.createElement('canvas'); c.width = views[v].width; c.height = views[v].height;
      const x = c.getContext('2d'); x.drawImage(views[v], 0, 0); x.drawImage(layer(v), 0, 0);
      out[v] = c; own.push(c);
    }
    if (views.flapped) flapped(out, dress(views.flapped));
    return out;
  };
  const keep = RIG;
  RIG = null;
  const out = { ...sp, views: dress(sp.views) };
  out.img = out.views.front;
  if (sp.frames) {
    out.frames = {};
    const poses = { ...RIG_COMMON, ...RIG_FRAMES[RIGGED[id]] };
    for (const [k, f] of Object.entries(sp.frames)) {
      if (k === 'faint') { out.frames[k] = f; continue; }   // it topples over and its gear falls off
      const at = (views, pose) => { RIG = { ...REST, ...pose }; const d = dress(views); RIG = null; return d; };
      out.frames[k] = Array.isArray(f) ? f.map((views, i) => at(views, poses[k][i])) : at(f, poses[k]);
    }
  }
  RIG = keep;
  Object.defineProperty(out, 'own', { value: own });
  return GEAR_SETS[key] = out;
}
// Free every dressed set no party member wears now (relics changed, someone left or evolved).
function forgetGear(inUse) {
  for (const [key, set] of Object.entries(GEAR_SETS)) {
    if (inUse.has(key)) continue;
    for (const c of set.own || []) freeCanvas(c);
    delete GEAR_SETS[key];
  }
}
