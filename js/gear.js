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
// Fixed spots on the head for gear (r240): the same place on the Coreature in every view.
// The top of the head: the middle of its top row (a Coreature with no neck: the middle of its top).
function headTopAt(a) {
  // the head's own top row (at least 3 pixels wide, ears and horns aside); a Coreature with no neck: the top of it
  // (the head's own pixels when the rig knows them, even without a neck: a lizard's head is out in front, not on top)
  let y = Math.max(a.crown, 2), rows = a.bodyRow;
  for (let yy = 0; yy < 64; yy++) { const r = a.headRow(yy); if (r && r[1] - r[0] >= 2) { y = yy; rows = a.headRow; break; } }
  const row = rows(y + 1) || rows(y);
  y = Math.max(y, 2);   // room above for what stands on it (the picture's margin is GEAR_PAD)
  return { x: r0(row ? (row[0] + row[1]) / 2 : a.topX), y };
}
// The middle of the forehead, just above the eyes: between the eyes from the front; from the side, at the brow's front
// edge (that's where the middle of a forehead is, seen side-on); in between at three-quarters; hidden from behind.
function foreheadAt(a, v, big) {
  if (v === 'back' || v === 'bside' || !a.lenses.length) return null;
  const ly = Math.min(...a.lenses.map(l => l.y)), y = r0(ly) - (big ? 4 : 3);
  const eyes = a.lenses.reduce((t, l) => t + l.x, 0) / a.lenses.length;
  const row = (a.neck ? a.headRow : a.bodyRow)(r0(ly) - 1), front = row ? row[1] - 1 : eyes;   // side views face right
  const x = v === 'front' ? eyes : v === 'side' ? Math.max(eyes, front - 1) : a.lenses.length > 1 ? eyes : (eyes + front) / 2;
  return { x: r0(x), y };
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
  // Grandma's Cooking: a rice ball wrapped in nori, hung round the neck
  grandma(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.poly([[x + 0.5, y - 0.5], [x + 3.5, y + 3.5], [x - 2.5, y + 3.5]], P('#fbf8f0', '#d8d0c0', '#ffffff'), { edge: true }); g.rect(x - 1, y + 2, 3, 2, '#24402e'); });
  },
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
  // ---- r240's relics ----
  // Each piece has one spot on the body that it keeps in every view (the owner: gear mustn't wander from the head to
  // the mouth, or swap sides, as a Coreature turns): the top of the head (headTopAt) or the middle of the forehead
  // (foreheadAt), worked out per view from the head's own shape and eyes.
  // Ricochet Prism: a cyan crystal in the middle of the forehead
  ricochetPrism(g, a, v, big) {
    const f = foreheadAt(a, v, big); if (!f) return;
    const { x, y } = f;
    g.poly([[x + 0.5, y - 2], [x + 2.5, y + 0.5], [x + 0.5, y + 3], [x - 1.5, y + 0.5]], P('#7af0ff', '#3a9ad0', '#e0fcff'), { edge: true });
    g.px(x, y - 1, '#ffffff');
  },
  // Echo Chamber: a little brass horn standing on top of the head, its bell open to the sky
  echoChamber(g, a, v, big) {
    const { x, y } = headTopAt(a);
    g.poly([[x - 0.5, y + 1], [x + 1.5, y + 1], [x + 1.5, y - 1], [x + 3, y - 4], [x - 2, y - 4], [x - 0.5, y - 1]], GP.gold, { edge: true });
    g.rect(x - 1, y - 4, 3, 1, '#6a4a10'); g.px(x, y - 2, '#fff0a0');
  },
  // Frost Rune: a snowflake clip in the middle of the top of the head
  frostRune(g, a, v, big) {
    const { x, y } = headTopAt(a), cy = y - 1;
    g.rect(x - 1, cy, 3, 1, '#a8e8ff'); g.rect(x, cy - 1, 1, 3, '#a8e8ff'); g.px(x, cy, '#ffffff');
    g.px(x - 1, cy - 1, '#e0f8ff').px(x + 1, cy + 1, '#e0f8ff').px(x + 1, cy - 1, '#e0f8ff').px(x - 1, cy + 1, '#e0f8ff');
  },
  // Seedling: a little sprout growing from the top of the head
  seedling(g, a, v, big) {
    const { x, y } = headTopAt(a);
    g.rect(x, y - 2, 1, 3, '#2a7a30');
    g.ellipse(x - 1, y - 3, 1.6, 1, GP.leaf, { edge: true }); g.ellipse(x + 2, y - 3, 1.6, 1, GP.leaf, { edge: true });
  },
  // Twin Fang: a band across the top of the head with two white fangs hanging from it
  twinFang(g, a, v, big) {
    const { x, y } = headTopAt(a);
    g.rect(x - 2, y, 5, 1, '#a82a40');
    for (const dx of [-2, 1]) g.poly([[x + dx, y + 1], [x + dx + 2, y + 1], [x + dx + 1, y + 3.5]], GP.white, { edge: true });
  },
  // Second Wind: a white feather standing straight up from the top of the head
  secondWind(g, a, v, big) {
    const { x, y } = headTopAt(a);
    g.poly([[x, y + 1], [x - 1, y - 1], [x, y - 5], [x + 1, y - 1], [x + 1, y + 1]], GP.white, { edge: true });
    g.rect(x, y - 3, 1, 4, '#8ab8e8');
  },
  // Overclock Chip: goggles with glowing cyan lenses and circuit frames
  overclock(g, a, v, big) { glasses(g, a, v, big, '#7af0ff', P('#3a5a6a', '#2a3a4a', '#5a8a9a'), true); },
  // Data Leech: a cracked magenta monocle over one eye
  dataLeech(g, a, v, big) {
    if (!a.lenses.length) return;
    const l = a.lenses[a.lenses.length - 1], R = big ? 2.6 : 2.1;
    g.ellipse(l.x + 0.5, l.y + 0.5, R, R, P('#ff3ad8', '#a01a8a', '#ffb0f0'), { edge: true }); g.ellipse(l.x + 0.5, l.y + 0.5, R - 1, R - 1, '#3ad8ff');
    g.px(r0(l.x), r0(l.y), '#ff3ad8'); g.rect(r0(l.x + R), r0(l.y + 1), 1, 3, '#a01a8a');
  },
  // Magma Heart: a glowing ember on a chain
  magmaHeart(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.poly([[x + 0.5, y + 4], [x - 1.5, y + 1.5], [x - 1, y], [x + 0.5, y + 1], [x + 2, y], [x + 2.5, y + 1.5]], P('#ff6a1a', '#b82a0a', '#ffd06a'), { edge: true }); g.px(x, y + 2, '#ffe070'); });
  },
  // Undertow Charm: a spiral seashell on a chain
  undertow(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.ellipse(x + 0.5, y + 1.5, 2, 2, P('#e8d8c0', '#b8a080', '#fff8e8'), { edge: true }); g.px(x, y + 1, '#4a90e8').px(x + 1, y + 2, '#4a90e8'); });
  },
  // Thorn Collar: a leafy collar bristling with thorns
  thornCollar(g, a, v, big) {
    if (!a.neck) return;
    const w = Math.max(5, Math.min(a.w - 2, big ? 12 : 9)), cx = r0(a.neckX), y = a.bottom + 1;   // round the neck, below the chin
    g.rect(cx - (w >> 1), y, w, 2, '#2a7a30'); g.rect(cx - (w >> 1), y, w, 1, '#4ab04a');
    for (let x = cx - (w >> 1); x < cx - (w >> 1) + w; x += 2) g.px(x, y - 1, '#e8dcc0');
    if (v !== 'back') g.px(cx, y + 2, '#e8dcc0');
  },
  // Anvil Plate: a small iron chest plate hung on its front
  anvilPlate(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.poly([[x - 2, y], [x + 3, y], [x + 3, y + 2], [x + 1.5, y + 4], [x - 0.5, y + 4], [x - 2, y + 2]], GP.iron, { edge: true }); g.px(x - 1, y + 1, '#ffffff'); });
  },
  // Gambler's Die: a red-spotted die on a chain
  gamblersDie(g, a, v, big) {
    pendant(g, a, v, big, (x, y) => { g.poly([[x - 1.5, y], [x + 2.5, y], [x + 2.5, y + 4], [x - 1.5, y + 4]], GP.white, { edge: true }); g.px(x - 1, y + 1, '#c8303a').px(x + 1, y + 3, '#c8303a').px(x, y + 2, '#c8303a'); });
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
// **Lazy:** a dressed picture is only drawn the first time something reads it (drawMon asks for
// one view of one frame at a time), then kept. Building whole sets up front was ~1,090 new
// pictures for a party of six on every worn relic: a 130-180 ms freeze on the dev PC and lots of
// 50-500 ms hitches on an Android phone even when spread out (Vic's slowdown, r92-r94). Now a
// benched Coreature costs nothing, and the one that's out dresses a picture or two as it animates.
// Layers are shared between frames where the head and legs sit the same.
const GEAR_SETS = {};
// Dressed pictures get a margin (r111) above and to each side, in sprite pixels, so a hat, an antenna
// or glasses on a head thrown forward never get clipped at the edge of the art. drawMon lines pictures
// up by their feet and centre, so the Coreature stays exactly where it was.
const GEAR_PAD = 6;
// The Glitched look (dungeon.js, GLITCH): colours rotated through the channels (red to green, green
// to blue, blue to red), so the shading stays but the palette turns wrong, and two or three torn
// rows slid sideways with a magenta or cyan leading edge. The dark outline stays. Seeded per
// picture, so a frame always tears the same way, and the tears jump about as it animates.
function glitchPaint(c, key) {
  const x = c.getContext('2d'), w = c.width, h = c.height, im = x.getImageData(0, 0, w, h), d = im.data;
  const lit = o => d[o + 3] && d[o] + d[o + 1] + d[o + 2] > 110;   // a coloured pixel, not the dark outline
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
    const o = (y * w + xx) * 4;
    if (!lit(o)) continue;
    const r = d[o], g = d[o + 1], b = d[o + 2], dim = y % 3 === 2 ? 0.8 : 1;   // and faint scanlines
    d[o] = b * dim; d[o + 1] = r * dim; d[o + 2] = g * dim;
  }
  let s = 7; for (const ch of key) s = (s * 31 + ch.charCodeAt(0)) | 0;
  const rnd = () => ((s = (Math.imul(s, 1103515245) + 12345) | 0) >>> 0) / 4294967296;
  const MAG = [255, 58, 216], CYAN = [58, 240, 255];
  // torn bands: a row or two slid sideways and washed in magenta or cyan, with a bright leading edge
  const tears = 2 + (rnd() < 0.5 ? 1 : 0);
  for (let t = 0; t < tears; t++) {
    const y0 = Math.floor(h * (0.25 + rnd() * 0.6)), rows = 1 + (rnd() < 0.5 ? 1 : 0), sh = rnd() < 0.5 ? -1 : 1, by = 2 + (rnd() < 0.4 ? 1 : 0), col = rnd() < 0.5 ? MAG : CYAN;
    for (let y = y0; y < Math.min(h, y0 + rows); y++) {
      const row = d.slice(y * w * 4, (y + 1) * w * 4), at = (xx, j) => (xx < 0 || xx >= w ? 0 : row[xx * 4 + j]);
      for (let xx = 0; xx < w; xx++) {
        const sx = xx - sh * by, o = (y * w + xx) * 4;
        for (let j = 0; j < 4; j++) d[o + j] = at(sx, j);
        if (!d[o + 3]) continue;
        const edge = !at(sx + sh, 3), k = edge ? 1 : 0.4;
        for (let j = 0; j < 3; j++) d[o + j] = d[o + j] * (1 - k) + col[j] * k;
      }
    }
  }
  // a few dead pixels on the body
  for (let n = 0, tries = 0; n < 3 && tries < 60; tries++) {
    const xx = Math.floor(rnd() * (w - 1)), y = Math.floor(rnd() * h), o = (y * w + xx) * 4;
    if (!lit(o) || !lit(o + 4)) continue;
    const col = [MAG, CYAN, [255, 255, 255]][n % 3];
    for (const q of [o, o + 4]) { d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2]; }
    n++;
  }
  x.putImageData(im, 0, 0);
}
function gearSprites(id, gear) {
  const key = id + '|' + gear.join(',');
  if (GEAR_SETS[key]) return GEAR_SETS[key];
  const glitch = gear.includes('glitch');   // the Glitched look (glitchPaint), not a worn piece
  const sp = SPRITES[id], layers = {}, own = [];   // own: the canvases made here (faint frames are the plain Coreature's, shared)
  const layer = v => {
    const Q = rig(), k = v + Q.head.join() + (Q.legs || [0, 0]).join();
    if (layers[k]) return layers[k];
    const g = new PixGrid(sp.size + 2 * GEAR_PAD, sp.size + GEAR_PAD), at = part(g, GEAR_PAD, GEAR_PAD);
    at.w = sp.size;                                                     // drawn in the sprite's own coordinates
    drawGear(at, id, v, gear);
    g.outline();
    own.push(layers[k] = g.toCanvas());
    return layers[k];
  };
  // views in a pose: each one is drawn when first read (the rig is set and put back inside, never left on);
  // a facing-left picture (sideL, r137) wears its facing-right twin's gear, since the shape is the same
  const dress = (views, pose) => {
    const out = {};
    for (const v of Object.keys(views)) Object.defineProperty(out, v, { enumerable: true, configurable: true, get() {
      const keep = RIG, src = views[v];
      const c = document.createElement('canvas'); c.width = src.width + 2 * GEAR_PAD; c.height = src.height + GEAR_PAD;   // room for gear past the art's edges
      try { RIG = pose ? { ...REST, ...pose } : null; const x = c.getContext('2d'); x.drawImage(src, GEAR_PAD, GEAR_PAD); x.drawImage(layer(v.replace(/L$/, '')), 0, 0); if (glitch) glitchPaint(c, v + JSON.stringify(pose || 0)); }
      finally { RIG = keep; }
      own.push(c);
      Object.defineProperty(out, v, { value: c, enumerable: true });
      return c;
    } });
    if (views.flapped) flapped(out, dress(views.flapped, pose));
    if (views.half) halfFlapped(out, dress(views.half, pose));
    return out;
  };
  const out = { ...sp, views: dress(sp.views, null) };
  Object.defineProperty(out, 'img', { enumerable: true, get: () => out.views.front });
  if (sp.frames) {
    out.frames = {};
    const poses = rigPoses(id);
    for (const [k, f] of Object.entries(sp.frames)) {
      if (k === 'faint') { out.frames[k] = f; continue; }   // it topples over and its gear falls off
      out.frames[k] = Array.isArray(f) ? f.map((views, i) => dress(views, poses[k][i])) : dress(f, poses[k]);
    }
  }
  Object.defineProperty(out, 'own', { value: own });
  Object.defineProperty(out, 'pad', { value: GEAR_PAD });
  return GEAR_SETS[key] = out;
}
const gearSet = gearSprites;   // review pages (gear.html)
// Free every dressed set no party member wears now (relics changed, someone left or evolved).
// The pictures are freed a few at a time between frames (freeing hundreds at once took 25 ms).
const _gearFree = [];
let _gearT = 0;
function forgetGear(inUse) {
  for (const [key, set] of Object.entries(GEAR_SETS)) {
    if (inUse.has(key)) continue;
    _gearFree.push(...set.own);
    delete GEAR_SETS[key];
  }
  if (_gearFree.length && !_gearT) _gearT = setTimeout(_gearTick, 0);
}
function _gearTick() {
  _gearT = 0;
  const t0 = performance.now();
  while (_gearFree.length && performance.now() - t0 < 2) freeCanvas(_gearFree.pop());
  if (_gearFree.length) _gearT = setTimeout(_gearTick, 16);
}
