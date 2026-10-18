// Gear: things a monster wears (a test of showing relics on the monsters; see gear.html).
// Gear is drawn into a monster's own pixel grid, before its outline, on every view and
// animation frame (buildMonSprites(mon, gear) in sprites.js), so it gets the same ink outline
// and pixel size as the art. Where it goes comes from the rig: drawing a monster with its
// head nudged a pixel shows which pixels are its head, with its ears nudged which are ears,
// and blinking which are its eyes. So gear finds the top of the head, the eyes and the neck
// on any monster without hand-placed points, and moves with the head as it animates.

const GEAR_CACHE = {};
// Where a monster's head, eyes and neck are in view v, at rest.
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
  if (eyes.length && v !== 'back') {   // seen from behind, goggles are just a strap
    const ps = eyes.map(xy).sort((a, b) => a[0] - b[0]);
    let cur = [ps[0]];
    for (let i = 1; i < ps.length; i++) {
      if (ps[i][0] - ps[i - 1][0] > 1) { lenses.push(cur); cur = []; }
      cur.push(ps[i]);
    }
    lenses.push(cur);
    lenses = lenses.map(c => ({ x: (Math.min(...c.map(p => p[0])) + Math.max(...c.map(p => p[0]))) / 2, y: (Math.min(...c.map(p => p[1])) + Math.max(...c.map(p => p[1]))) / 2 }));
  }
  // the crown goes on the very top of the monster above its head (a turret, a spiky ball's crown), ears and antennae aside
  const topX = mid(y => y <= H.y0 + 2);
  let crown = H.y0;
  for (let y = 0; y < H.y0; y++) if ([-1, 0, 1].some(d => { const i = y * size + Math.round(topX) + d; return base[i] && !ears.has(i); })) { crown = y; break; }
  // a neck only if the head sits on top of a body (not a face on a ball, or a head hidden from behind)
  let filled = 0, lowest = 0;
  base.forEach((c, i) => { if (c) { filled++; lowest = Math.max(lowest, Math.floor(i / size)); } });
  const neck = H.y1 < lowest * 0.72 && head.length > filled * 0.12;
  return GEAR_CACHE[key] = {
    crown, neck, top: H.y0, topX,
    bottom: H.y1, neckX: mid(y => y >= H.y1 - 2),
    left: H.x0, right: H.x1, w: H.x1 - H.x0 + 1, h: H.y1 - H.y0 + 1,
    lenses,
  };
}

const GEAR_PAL = {
  gold: P('#f0c040', '#b88a20', '#fff0a0'),
  strap: P('#6a4a30', '#4a3020', '#8a6a48'),
  scarf: P('#d83a3a', '#a02020', '#ff7a6a'),
};
const r0 = Math.round;
// Each piece: (g, a = anchors already moved with the head, v, big = a 44px monster)
const GEAR_ART = {
  // a tiny crown perched on top of the head, however big the head is
  crown(g, a, v, big) {
    const w = big ? 9 : 7, x = r0(a.topX - w / 2 + 0.5), y = Math.max(a.crown, 4);   // room for its points
    g.poly([[x, y - 2], [x + w, y - 2], [x + w, y + 1], [x, y + 1]], GEAR_PAL.gold, { edge: true });
    for (const px of [x, x + (w >> 1), x + w - 1]) g.rect(px, y - 4, 1, 2, '#f0c040');
    g.px(x + (w >> 1), y - 1, '#e04060');
    if (v !== 'back' && v !== 'bside') { g.px(x + 1, y - 1, '#5ac8ff'); g.px(x + w - 2, y - 1, '#5ac8ff'); }
  },
  // aviator goggles over the eyes (a strap round the back of the head when we can't see them)
  goggles(g, a, v, big) {
    const R = big ? 2.6 : 2.1;
    if (!a.lenses.length) {
      if (!a.neck) return;
      const y = r0(a.top + a.h * 0.38);
      g.rect(a.left + 1, y, a.w - 2, 2, '#4a3020');
      g.rect(r0((a.left + a.right) / 2) - 1, y, 3, 2, '#c0a060');   // buckle
      return;
    }
    const ly = r0(a.lenses[0].y);
    const sx = v === 'side' || v === 'fside' ? a.left + 1 : a.left;
    g.rect(sx, ly, a.right - sx, 1, '#4a3020');                              // strap
    for (const l of a.lenses) {
      g.ellipse(l.x + 0.5, l.y + 0.5, R, R, GEAR_PAL.strap, { edge: true });
      g.ellipse(l.x + 0.5, l.y + 0.5, R - 1, R - 1, '#9ae8ff');
      g.px(r0(l.x - R / 2 + 0.5), r0(l.y - R / 2 + 0.5), '#ffffff');
    }
  },
  // a red scarf round the neck, its end flapping out behind
  scarf(g, a, v, big) {
    if (!a.neck) return;
    const w = Math.max(6, Math.min(a.w - 2, big ? 14 : 10)), x = r0(a.neckX - w / 2 + 0.5), y = a.bottom - 1;
    g.poly([[x, y], [x + w, y], [x + w, y + 2], [x, y + 2]], GEAR_PAL.scarf, { edge: true });
    if (v === 'side' || v === 'fside' || v === 'bside') g.poly([[x + 1, y + 1], [x - 4, y + 2], [x - 5, y + 4], [x + 1, y + 3]], GEAR_PAL.scarf, { edge: true });   // trails behind
    else g.poly([[x + w - 3, y + 1], [x + w - 1, y + 1], [x + w, y + 5], [x + w - 3, y + 5]], GEAR_PAL.scarf, { edge: true });           // hangs down
    g.rect(x + 1, y + 1, w - 2, 1, '#a02020');
  },
};

function drawGear(g, id, v, gear) {
  const big = g.w > 32, Q = rig(), side = v !== 'front' && v !== 'back';
  const base = gearAnchors(id, v, g.w);
  const dx = side ? Q.head[0] : 0, dy = Q.head[1];   // the head's nudge in this frame (see rigParts)
  const a = { ...base, crown: base.crown + dy, top: base.top + dy, bottom: base.bottom + dy, topX: base.topX + dx, neckX: base.neckX + dx,
    left: base.left + dx, right: base.right + dx, lenses: base.lenses.map(l => ({ x: l.x + dx, y: l.y + dy })) };
  for (const k of gear) GEAR_ART[k] && GEAR_ART[k](g, a, v, big);
}
