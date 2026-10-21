// The drakorn family: cosmite, drakorn. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// Redesigned in r98 with the owner (several rounds of their generated art): night-sky dragons with
// midnight skin full of stars, a glowing nebula belly, silver horns, gold eyes and a silver star on
// the tip of the tail. Smug little Cosmite grows into Drakorn. Dragonkin/Shade.

const NIGHT = {
  Sk: P('#34366e', '#1e2048', '#5458a8'), SkD: P('#26285a', '#181a3c', '#383c7a'), Muz: P('#c4c0dc', '#9894bc', '#e8e6f8'),
  Neb: P('#d062e0', '#9a3ab8', '#f2aaff'), Horn: P('#d8dce8', '#9aa0b8', '#ffffff'), Wing: P('#7a54c8', '#4a3a98', '#a88ae8'),
  WingD: P('#5a3ea0', '#3a2a78', '#7a62c0'), STAR: '#ffffff', TEAL: '#5af0e8', GOLD: '#f2c440', CLAW: '#d8d8e8',
};
// a five-pointed star (the tip of the tail)
function nightStar(p, cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  p.poly(pts, P('#e8eef8', '#b0b8d0', '#ffffff'), { edge: true });
}
// tiny white stars speckled over the skin
const speckle = (p, pts) => { for (const [x, y] of pts) p.px(x, y, NIGHT.STAR); };
// the glowing nebula belly: pink-violet plates with a streak of teal light
function nebula(p, cx, cy, rx, ry, rows) {
  p.ellipse(cx, cy, rx, ry, NIGHT.Neb, { edge: true });
  for (const y of rows) p.rect(Math.round(cx - rx + 2), y, Math.round(rx * 2 - 3), 1, NIGHT.Neb.s);
  p.px(Math.round(cx - 1), Math.round(cy - 2), NIGHT.TEAL).px(Math.round(cx + 1), Math.round(cy + 1), NIGHT.TEAL).px(Math.round(cx), Math.round(cy + 3), NIGHT.TEAL);
}

// A line of pixels (two wide when thick), for wing bones and constellation lines.
function dLine(p, x0, y0, x1, y1, col, thick = false) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
    p.px(x, y, col); if (thick) p.px(x, y + 1, col);
  }
}
// A boned dragon wing: membrane from the shoulder up to the wrist, out to each finger tip (scalloped
// between them) and back to the body, with dark bones, a silver claw at the wrist, and gold
// constellations (stars joined by faint lines; not in the flap frame). For the flap frame the whole
// wing, bones too, folds down round the shoulder (flapPts in sprites.js).
function dragonWing(p, W, pal, stars) {
  const all = [W.sh, W.wr, ...W.tips, W.back], cx = all.reduce((s, q) => s + q[0], 0) / all.length;
  const fold = pts => flapPts(pts, { root: W.sh, swing: 0.85 * Math.sign(cx - W.sh[0]) });
  const mem = [W.sh, W.wr];
  W.tips.forEach((tp, i) => { mem.push(tp); mem.push(W.scal[i]); });
  mem.push(W.back);
  p.poly(fold(mem), pal, { edge: true });
  const [sh, wr, ...tips] = fold([W.sh, W.wr, ...W.tips]).map(([x, y]) => [Math.round(x), Math.round(y)]);
  dLine(p, sh[0], sh[1], wr[0], wr[1], NIGHT.Sk.s, true);                                // the arm bone
  for (const tp of tips) dLine(p, wr[0], wr[1], tp[0], tp[1], NIGHT.Sk.b);               // finger bones
  p.poly([[wr[0] - 1, wr[1] + 1], [wr[0], wr[1] - 3], [wr[0] + 1.5, wr[1] + 1]], NIGHT.Horn);   // silver wrist claw
  if (stars && !FLAP) {
    for (let i = 0; i < stars.length - 1; i++) dLine(p, ...stars[i], ...stars[i + 1], pal.l);
    for (const [x, y] of stars) p.px(x, y, '#ffe8a0');
  }
}
const mirrorPts = (pts, s) => (s > 0 ? pts : pts.map(([x, y]) => [44 - x, y]));
const mirrorWing = (W, s) => (s > 0 ? W : { sh: mirrorPts([W.sh], s)[0], wr: mirrorPts([W.wr], s)[0], tips: mirrorPts(W.tips, s), scal: mirrorPts(W.scal, s), back: mirrorPts([W.back], s)[0] });
// A long tail drawn as a chain of shrinking ellipses through pts, with small silver spikes, ending in a star.
function dragonTail(p, pts, tip) {
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) {   // one smooth taper: many small steps along the curve
    const f = k / 4, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, r = 2.8 - (i + f) * 0.3;
    p.ellipse(x, y, r, r, NIGHT.Sk);
  }
  for (const [x, y] of pts.slice(1, 4)) p.px(Math.round(x), Math.round(y) - 3, NIGHT.Horn.b);
  nightStar(p, tip[0], tip[1], 3.5);
}
// A lean leg that bends like a big cat's: a thigh, a shin angled back, a foot with silver claws.
function dragonLeg(p, view, x, pal) {
  if (view === 'side') {
    p.ellipse(x, 33, 3.5, 4.5, pal, { edge: true });
    p.poly([[x, 36], [x + 2, 37], [x - 2, 41], [x - 4, 41]], pal, { edge: true });
    p.poly([[x - 4, 40], [x + 3, 40], [x + 3, 42], [x - 4, 42]], pal, { edge: true });
    p.px(x + 2, 42, NIGHT.CLAW).px(x + 3, 42, NIGHT.CLAW);
    return;
  }
  p.ellipse(x, 33, 3.2, 4, pal, { edge: true });
  p.poly([[x - 2, 35], [x + 1, 35], [x + 1, 40], [x - 2, 40]], pal, { edge: true });
  p.ellipse(x - 0.5, 41, 2.6, 1.2, pal);
  p.px(x - 2, 42, NIGHT.CLAW).px(x, 42, NIGHT.CLAW).px(x + 1, 42, NIGHT.CLAW);
}
// The glowing nebula on its chest: a broad plate, wide at the chest and rounding off above the hips,
// with plate lines and a teal glow in the middle (r100: a tall narrow stripe down to the hips read badly).
function nebulaPlate(p, cx, top = 20) {
  p.poly([[cx - 4, top], [cx + 4, top], [cx + 3.5, top + 5], [cx + 2, top + 8], [cx, top + 9], [cx - 2, top + 8], [cx - 3.5, top + 5]], NIGHT.Neb, { edge: true });
  for (const [dy, w] of [[2, 7], [4, 7], [6, 5]]) p.rect(Math.round(cx - w / 2), top + dy, w, 1, NIGHT.Neb.s);
  p.px(Math.round(cx), top + 3, NIGHT.TEAL).px(Math.round(cx) - 1, top + 5, NIGHT.TEAL).px(Math.round(cx), top + 6, '#ffffff');
}
// The glowing nebula along its throat and belly: pink-violet ellipses with plate lines and teal light.
function nebulaStripe(p, ells, rows = []) {
  for (const [x, y, rx, ry] of ells) p.ellipse(x, y, rx, ry, NIGHT.Neb);
  for (const [x, y] of rows) p.rect(x, y, 3, 1, NIGHT.Neb.s);
  const [x, y] = ells[ells.length - 1];
  p.px(Math.round(x), Math.round(y - 3), NIGHT.TEAL).px(Math.round(x - 1), Math.round(y + 1), NIGHT.TEAL).px(Math.round(x), Math.round(y + 4), NIGHT.TEAL);
}

Object.assign(MONSTER_ART, {
  // Cosmite: a chubby little dragon standing with its hands on its hips and a smug half-lidded look,
  // midnight skin full of stars, a glowing nebula belly, short silver horns, small dusk-violet wings
  // and a silver star on the tip of its tail.
  cosmite(g, v = 'front') {
    const { Sk, SkD, Muz, Horn, Wing, GOLD, CLAW } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {
      b.poly([[12, 14], [4, 6], [5, 10], [3, 14], [7, 15], [6, 19], [12, 18]], NIGHT.WingD);   // far wing
      t.poly([[8, 23], [3, 22], [2, 18], [4, 18], [5, 21], [9, 21]], Sk, { edge: true }); nightStar(t, 3, 16, 3);          // tail and its star
      legB.ellipse(12, 28, 3, 2.5, SkD, { edge: true });
      b.ellipse(14, 22, 7, 7, Sk, { edge: true });                                                                       // round body
      nebula(b, 18.5, 23, 3.2, 6, [20, 23, 26]);
      b.poly([[8, 16], [6, 17], [8, 18]], Sk).poly([[7, 20], [5, 21], [7, 22]], Sk);                                     // bumps down its back
      legA.ellipse(17, 28, 3.2, 2.6, Sk, { edge: true }); legA.px(19, 30, CLAW).px(20, 30, CLAW);
      b.poly([[13, 14], [6, 7], [7, 11], [5, 15], [10, 16]], Wing, { edge: true });                                     // near wing
      armA.poly([[15, 18], [12, 21], [14, 23], [17, 21]], Sk, { edge: true });                                           // hand on hip
      earB.poly([[14, 6], [10, 3], [9, 1], [11, 1], [14, 3], [16, 4]], Horn);                                                    // far horn
      h.ellipse(17, 10, 6.5, 6, Sk, { edge: true });                                                                     // head
      h.ellipse(22.5, 11, 4, 2.6, Sk, { edge: true });                                                                   // snout
      h.ellipse(21, 13.5, 4, 2, Muz);                                                                                    // pale jaw
      earA.poly([[16, 6], [12, 3], [10, 0], [12, 0], [16, 3], [19, 5]], Horn, { edge: true });                                    // horn
      h.px(26, 10, OUTLINE);
      h.rect(18, 7, 4, 1, OUTLINE);                                                                                      // heavy, smug lid
      rigEye(h, Q, 19, 8, () => { h.rect(19, 8, 3, 1, '#ffffff'); h.px(20, 8, GOLD).px(21, 8, GOLD); }, 3);
      rigMouth(h, Q, 21, 12, 3, () => h.px(21, 12, OUTLINE).px(22, 12, OUTLINE).px(23, 12, OUTLINE).px(24, 11, OUTLINE));   // smirk
      speckle(b, [[10, 19], [12, 25], [15, 17]]); speckle(h, [[14, 8], [17, 5]]);
      return;
    }
    if (v === 'back') {
      t.poly([[17, 25], [24, 25], [27, 22], [26, 20], [23, 23], [17, 23]], Sk, { edge: true }); nightStar(t, 27, 19, 3);
      legA.ellipse(12, 28, 3.2, 2.6, Sk, { edge: true }); legB.ellipse(20, 28, 3.2, 2.6, Sk, { edge: true });
      earA.poly([[11, 6], [7, 3], [5, 0], [7, 1], [10, 3], [13, 5]], Horn, { edge: true }); earB.poly([[21, 6], [25, 3], [27, 0], [25, 1], [22, 3], [19, 5]], Horn, { edge: true });
      h.ellipse(16, 10, 7, 6, Sk, { edge: true });                                                                       // head, behind
      b.ellipse(16, 22, 7.5, 7, Sk, { edge: true });                                                                     // body
      for (const y of [16, 19, 22]) b.poly([[15, y + 1], [16, y - 1], [17, y + 1]], Sk);                                 // bumps down its back
      armA.poly([[10, 18], [7, 21], [9, 24], [11, 22]], Sk, { edge: true }); armB.poly([[22, 18], [25, 21], [23, 24], [21, 22]], Sk, { edge: true });
      b.polyM([[13, 14], [3, 6], [4, 10], [2, 14], [6, 15], [4, 19], [12, 19]], Wing, { edge: true });                  // wings, toward you
      speckle(b, [[12, 24], [19, 20], [5, 11], [27, 15]]); speckle(h, [[13, 7], [19, 9]]);
      return;
    }
    b.polyM([[12, 14], [2, 6], [3, 10], [1, 14], [5, 15], [3, 19], [10, 18]], Wing, { edge: true });                    // wings behind
    speckle(b, [[5, 10], [4, 15], [26, 10], [27, 15]]);
    t.poly([[20, 25], [26, 24], [28, 21], [27, 20], [25, 22], [20, 23]], Sk, { edge: true }); nightStar(t, 28, 18, 3);  // tail and its star
    legA.ellipse(12, 28, 3.2, 2.6, Sk, { edge: true }); legB.ellipse(20, 28, 3.2, 2.6, Sk, { edge: true });            // stubby legs
    legA.px(10, 30, CLAW).px(12, 30, CLAW); legB.px(20, 30, CLAW).px(22, 30, CLAW);
    b.ellipse(16, 22, 7.5, 7, Sk, { edge: true });                                                                       // round body
    nebula(b, 16, 23, 5.5, 6, [20, 23, 26]);                                                                           // glowing nebula belly
    armA.poly([[10, 18], [7, 21], [9, 24], [11, 22]], Sk, { edge: true }); armB.poly([[22, 18], [25, 21], [23, 24], [21, 22]], Sk, { edge: true });   // hands on hips
    earA.poly([[11, 6], [7, 3], [5, 0], [7, 1], [10, 3], [13, 5]], Horn, { edge: true }); earB.poly([[21, 6], [25, 3], [27, 0], [25, 1], [22, 3], [19, 5]], Horn, { edge: true });   // silver horns
    h.ellipse(16, 10, 7, 6, Sk, { edge: true });                                                                         // head
    h.ellipse(16, 13.5, 4.5, 2.4, Muz);                                                                                  // pale jaw
    h.px(15, 11, OUTLINE).px(17, 11, OUTLINE);                                                                           // nostrils
    h.rectM(10, 7, 4, 1, OUTLINE);                                                                                       // heavy, smug lids
    rigEyes(h, Q, 32, 10, 8, 3, () => { h.rectM(10, 8, 3, 1, '#ffffff'); h.pxM(11, 8, GOLD).pxM(12, 8, GOLD); });
    rigMouth(h, Q, 14, 13, 3, () => h.px(14, 13, OUTLINE).px(15, 13, OUTLINE).px(16, 13, OUTLINE).px(17, 12, OUTLINE));   // a lopsided smirk
    speckle(b, [[10, 20], [21, 26], [12, 27]]); speckle(h, [[12, 5], [20, 9]]);
  },
  // Drakorn (r99 redraw, the owner: "this looks pretty bad, do better"): Cosmite grown into a lean
  // night-sky dragon, drawn from the owner's art. An S-curved neck and a small head with a long
  // tapered snout and swept-back silver horns, a crest of silver spines, lean legs that bend like a
  // big cat's, boned dusk-violet wings with a silver claw at each wrist and constellations, a glowing
  // nebula stripe from throat to belly, and a long curling tail ending in a silver star.
  drakorn(g, v = 'front') {
    const { Sk, SkD, Horn, Wing, WingD, GOLD } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {
      dragonWing(b, { sh: [22, 18], wr: [17, 2], tips: [[7, 4], [6, 12], [10, 19]], scal: [[11, 8], [10, 15], [15, 20]], back: [20, 22] }, WingD);   // far wing
      dragonTail(t, [[15, 33], [11, 36], [7, 37], [4, 35], [3, 31], [4, 28]], [4, 25]);
      dragonLeg(legB, 'side', 21, SkD);
      b.ellipse(18, 32, 5, 4.5, Sk, { edge: true });                                                   // hips
      b.ellipse(23, 25, 5.5, 6.5, Sk, { edge: true });                                                 // chest, leaning forward
      nebulaStripe(b, [[26.5, 24.5, 2, 5]], [[25, 23], [25, 25]]);
      dragonLeg(legA, 'side', 17, Sk);
      armA.poly([[25, 22], [28, 25], [29, 29], [27, 30], [26, 26], [23, 24]], Sk, { edge: true }); armA.px(28, 30, NIGHT.CLAW).px(29, 30, NIGHT.CLAW);
      dragonWing(b, { sh: [21, 18], wr: [15, 1], tips: [[3, 3], [2, 10], [6, 16]], scal: [[6, 7], [6, 13], [11, 17]], back: [18, 21] }, Wing,
        [[8, 6], [10, 9], [6, 11], [9, 13]]);                                                         // near wing, raised
      b.ellipse(25, 19, 3, 3.5, Sk); b.ellipse(27, 15, 2.8, 3.2, Sk);                                    // the S of the neck
      nebulaStripe(b, [[26.6, 19.5, 1.3, 3], [28.5, 15.5, 1.2, 2.6]]);
      for (const [x, y] of [[23, 17], [25, 13], [20, 21]]) b.poly([[x, y - 1], [x - 3, y - 1], [x, y + 1]], Horn);   // spines down its neck
      h.ellipse(29, 11, 2.6, 3, Sk);
      h.poly([[27, 8], [24, 8], [27, 10]], Horn);
      earB.poly([[29, 8], [24, 5], [25, 4], [30, 6]], Horn);                                           // the smaller horn
      h.ellipse(31, 8, 4, 3, Sk, { edge: true });                                                      // head
      h.poly([[33, 6], [41, 8], [41, 10], [33, 11]], Sk, { edge: true });                              // long tapered snout
      h.px(40, 8, OUTLINE);
      earA.poly([[30, 6], [23, 1], [22, 0], [25, 1], [31, 4]], Horn, { edge: true });                  // long swept-back horn
      h.poly([[30, 10], [27, 11], [30, 11]], Horn);                                                   // cheek spike
      h.rect(31, 6, 4, 1, OUTLINE);
      rigEye(h, Q, 32, 7, () => { h.rect(32, 7, 2, 1, GOLD); });
      rigMouth(h, Q, 35, 10, 4);
      speckle(b, [[17, 31], [21, 23], [19, 35]]); speckle(h, [[30, 9], [36, 8]]);
      return;
    }
    if (v === 'back') {
      dragonTail(t, [[22, 34], [24, 37], [28, 39], [33, 38], [36, 35], [37, 31]], [37, 28]);
      dragonLeg(legA, 'front', 18, Sk); dragonLeg(legB, 'front', 26, Sk);
      earA.poly([[20, 6], [16, 2], [14, 0], [17, 1], [22, 4]], Horn, { edge: true }); earB.poly([[24, 6], [28, 2], [30, 0], [27, 1], [22, 4]], Horn, { edge: true });
      h.ellipse(22, 8, 4.5, 3.8, Sk, { edge: true });                                                  // head, behind
      b.ellipse(22, 16, 3.2, 4.5, Sk, { edge: true });                                                 // neck
      b.ellipse(22, 31, 5.5, 4.5, Sk, { edge: true }); b.ellipse(22, 24, 6.5, 6.5, Sk, { edge: true });
      for (const y of [12, 15, 18, 21, 24, 27, 30]) b.poly([[21, y + 1], [22, y - 2], [23, y + 1]], Horn);   // the crest down its back
      for (const s of [1, -1]) dragonWing(b, mirrorWing({ sh: [17, 20], wr: [9, 4], tips: [[1, 7], [2, 16], [7, 23]], scal: [[5, 12], [6, 19], [11, 23]], back: [16, 26] }, s), Wing,
        mirrorPts([[5, 10], [7, 13], [4, 16], [8, 17]], s));
      speckle(b, [[19, 26], [25, 30]]);
      return;
    }
    for (const s of [1, -1]) dragonWing(b, mirrorWing({ sh: [17, 20], wr: [9, 4], tips: [[1, 7], [2, 16], [7, 23]], scal: [[5, 12], [6, 19], [11, 23]], back: [16, 26] }, s), Wing,
      mirrorPts([[5, 10], [7, 13], [4, 16], [8, 17]], s));                                              // big boned wings
    dragonTail(t, [[26, 37], [30, 39], [34, 39], [37, 36], [38, 32], [38, 29]], [38, 26]);
    b.ellipse(22, 31, 5.5, 4.5, Sk, { edge: true });                                                   // hips
    b.ellipse(22, 24, 6.5, 6.5, Sk, { edge: true });                                                   // chest
    b.ellipse(22, 16, 3.2, 4.5, Sk);                                                                   // neck
    b.ellipse(22, 16.5, 1.4, 3, NIGHT.Neb);                                                            // the glow along its throat
    nebulaPlate(b, 22);                                                                                // and its chest
    b.polyM([[19, 15], [16, 14], [19, 17]], Horn); b.polyM([[18, 19], [15, 19], [18, 21]], Horn);        // spines down the sides of its neck
    dragonLeg(legA, 'front', 18, Sk); dragonLeg(legB, 'front', 26, Sk);
    armA.poly([[17, 20], [19, 22], [17, 27], [16, 30], [14, 29], [15, 25]], Sk, { edge: true }); armA.px(14, 30, NIGHT.CLAW).px(16, 30, NIGHT.CLAW);
    armB.poly([[27, 20], [25, 22], [27, 27], [28, 30], [30, 29], [29, 25]], Sk, { edge: true }); armB.px(28, 30, NIGHT.CLAW).px(30, 30, NIGHT.CLAW);
    earA.poly([[20, 6], [16, 2], [14, 0], [17, 1], [22, 4]], Horn, { edge: true }); earB.poly([[24, 6], [28, 2], [30, 0], [27, 1], [22, 4]], Horn, { edge: true });   // long horns
    h.polyM([[19, 8], [15, 6], [16, 5], [20, 7]], Horn);                                               // the smaller horns
    h.ellipse(22, 8, 5, 4.2, Sk, { edge: true });                                                      // head
    h.ellipse(22, 12, 3, 2.5, P('#3e4282', '#262a5a', '#5c62b0'), { edge: true });                     // snout, coming toward you
    h.px(21, 12, OUTLINE).px(23, 12, OUTLINE);
    h.polyM([[18, 9], [15, 10], [18, 11]], Horn);                                                     // cheek spikes
    h.rectM(17, 6, 3, 1, OUTLINE);
    rigEyes(h, Q, 44, 18, 7, 2, () => h.rectM(18, 7, 2, 1, GOLD));
    rigMouth(h, Q, 21, 13, 2);
    speckle(b, [[18, 23], [26, 22], [19, 31]]); speckle(h, [[20, 6], [25, 9]]);
  },
});
Object.assign(MONSTER_ART_DIAG, {
  cosmite(g, v) {
    const { Sk, SkD, Muz, Horn, Wing, GOLD, CLAW } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'bside') {
      t.poly([[15, 25], [22, 25], [26, 22], [25, 20], [22, 23], [15, 23]], Sk, { edge: true }); nightStar(t, 26, 19, 3);
      legA.ellipse(11, 28, 3.2, 2.6, Sk, { edge: true }); legB.ellipse(19, 28, 3, 2.5, Sk, { edge: true });
      earB.poly([[12, 6], [8, 3], [6, 0], [8, 1], [11, 3], [14, 5]], Horn, { edge: true }); earA.poly([[22, 6], [26, 3], [28, 0], [26, 1], [23, 3], [20, 5]], Horn, { edge: true });
      h.ellipse(17, 10, 7, 6, Sk, { edge: true });
      h.ellipse(23.5, 12, 1.8, 1.6, Sk);                                                                                 // snout peeking out
      b.ellipse(15, 22, 7.5, 7, Sk, { edge: true });
      for (const y of [16, 19, 22]) b.poly([[14, y + 1], [15, y - 1], [16, y + 1]], Sk);
      armA.poly([[9, 18], [6, 21], [8, 24], [10, 22]], Sk, { edge: true }); armB.poly([[21, 18], [24, 21], [22, 24], [20, 22]], Sk, { edge: true });
      b.poly([[12, 14], [2, 6], [3, 10], [1, 14], [5, 15], [3, 19], [11, 19]], Wing, { edge: true });
      b.poly([[18, 14], [27, 7], [26, 11], [28, 14], [24, 16], [26, 19], [19, 19]], Wing, { edge: true });
      speckle(b, [[11, 24], [18, 20], [5, 11]]);
      return;
    }
    b.poly([[11, 14], [2, 6], [3, 10], [1, 14], [5, 15], [3, 19], [9, 18]], Wing, { edge: true });                      // far wing
    b.poly([[21, 14], [29, 6], [28, 10], [30, 14], [26, 15], [28, 19], [22, 18]], Wing, { edge: true });                // near wing
    t.poly([[10, 24], [5, 23], [3, 20], [5, 19], [6, 21], [10, 22]], Sk, { edge: true }); nightStar(t, 4, 17, 3);       // tail, out to the side
    legB.ellipse(12, 28, 3, 2.5, SkD, { edge: true }); legA.ellipse(20, 28, 3.2, 2.6, Sk, { edge: true });
    legA.px(20, 30, CLAW).px(22, 30, CLAW);
    b.ellipse(16, 22, 7.5, 7, Sk, { edge: true });
    nebula(b, 17.5, 23, 5, 6, [20, 23, 26]);
    armB.poly([[10, 18], [8, 21], [10, 23], [11, 21]], Sk, { edge: true }); armA.poly([[23, 18], [26, 21], [24, 24], [22, 22]], Sk, { edge: true });
    earB.poly([[13, 6], [10, 3], [9, 1], [10, 1], [12, 3], [15, 5]], Horn, { edge: true }); earA.poly([[22, 6], [26, 3], [28, 0], [26, 1], [23, 3], [20, 5]], Horn, { edge: true });
    h.ellipse(17, 10, 7, 6, Sk, { edge: true });
    h.ellipse(19, 13.5, 4.5, 2.4, Muz);                                                                                  // pale jaw, turned its way
    h.px(18, 11, OUTLINE).px(21, 11, OUTLINE);
    h.rect(12, 7, 3, 1, OUTLINE); h.rect(19, 7, 4, 1, OUTLINE);
    rigEye(h, Q, 12, 8, () => { h.rect(12, 8, 2, 1, '#ffffff'); h.px(13, 8, GOLD); });
    rigEye(h, Q, 19, 8, () => { h.rect(19, 8, 3, 1, '#ffffff'); h.px(20, 8, GOLD).px(21, 8, GOLD); }, 3);
    rigMouth(h, Q, 17, 13, 3, () => h.px(17, 13, OUTLINE).px(18, 13, OUTLINE).px(19, 13, OUTLINE).px(20, 12, OUTLINE));
    speckle(b, [[11, 20], [21, 26], [5, 11]]); speckle(h, [[13, 5], [21, 9]]);
  },
  drakorn(g, v) {
    const { Sk, SkD, Horn, Wing, WingD, GOLD } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'bside') {
      dragonTail(t, [[19, 34], [16, 37], [12, 38], [9, 36], [8, 32], [8, 29]], [8, 26]);
      dragonLeg(legA, 'front', 17, Sk); dragonLeg(legB, 'front', 25, Sk);
      earB.poly([[22, 6], [18, 2], [16, 0], [19, 1], [24, 4]], Horn, { edge: true }); earA.poly([[27, 6], [31, 2], [33, 0], [30, 1], [25, 4]], Horn, { edge: true });
      h.ellipse(25, 8, 4.5, 3.8, Sk, { edge: true });                                                  // head, beyond the body
      h.ellipse(30, 10, 1.8, 1.6, Sk);                                                                 // snout peeking out
      b.ellipse(23, 16, 3.2, 4.5, Sk, { edge: true });
      b.ellipse(21, 31, 5.5, 4.5, Sk, { edge: true }); b.ellipse(22, 24, 6.5, 6.5, Sk, { edge: true });
      for (const y of [12, 15, 18, 21, 24, 27, 30]) b.poly([[21, y + 1], [22, y - 2], [23, y + 1]], Horn);
      dragonWing(b, { sh: [17, 20], wr: [9, 4], tips: [[1, 7], [2, 16], [7, 23]], scal: [[5, 12], [6, 19], [11, 23]], back: [16, 26] }, Wing, [[5, 10], [7, 13], [4, 16]]);
      dragonWing(b, { sh: [27, 19], wr: [35, 3], tips: [[43, 6], [42, 15], [37, 22]], scal: [[39, 11], [38, 18], [32, 23]], back: [28, 25] }, Wing, [[39, 9], [37, 12], [40, 15]]);
      return;
    }
    dragonWing(b, { sh: [18, 20], wr: [11, 4], tips: [[3, 7], [4, 15], [8, 22]], scal: [[7, 11], [7, 18], [12, 23]], back: [17, 26] }, WingD);   // far wing
    dragonTail(t, [[19, 34], [15, 36], [11, 37], [7, 35], [5, 31], [5, 28]], [5, 25]);
    dragonLeg(legB, 'front', 19, SkD);
    b.ellipse(22, 31, 5.5, 4.5, Sk, { edge: true });
    b.ellipse(23, 24, 6.5, 6.5, Sk, { edge: true });
    b.ellipse(24, 17, 3.2, 4, Sk);
    b.ellipse(25, 16.5, 1.3, 3, NIGHT.Neb);
    nebulaPlate(b, 24.5);
    b.poly([[21, 15], [18, 14], [21, 17]], Horn); b.poly([[20, 19], [17, 19], [20, 21]], Horn);
    dragonLeg(legA, 'front', 27, Sk);
    armB.poly([[18, 21], [17, 26], [16, 29], [18, 28], [19, 23]], Sk, { edge: true });
    armA.poly([[29, 20], [31, 25], [32, 29], [30, 30], [29, 26], [27, 22]], Sk, { edge: true }); armA.px(31, 30, NIGHT.CLAW).px(32, 30, NIGHT.CLAW);
    dragonWing(b, { sh: [27, 19], wr: [36, 3], tips: [[43, 6], [43, 14], [38, 21]], scal: [[39, 10], [39, 17], [33, 22]], back: [28, 25] }, Wing,
      [[39, 8], [37, 11], [40, 14], [38, 17]]);                                                         // near wing
    earB.poly([[22, 6], [18, 2], [17, 1], [19, 1], [24, 4]], Horn, { edge: true });                    // far horn
    h.ellipse(25, 8, 4.5, 3.8, Sk, { edge: true });                                                     // head
    h.ellipse(27.5, 11.5, 3.2, 2.3, P('#3e4282', '#262a5a', '#5c62b0'), { edge: true });               // snout, turned its way
    h.px(27, 12, OUTLINE).px(29, 12, OUTLINE);
    earA.poly([[28, 6], [32, 2], [34, 0], [31, 1], [26, 4]], Horn, { edge: true });                    // near horn
    h.poly([[30, 9], [33, 10], [30, 11]], Horn);
    h.rect(20, 6, 3, 1, OUTLINE); h.rect(26, 6, 3, 1, OUTLINE);
    rigEye(h, Q, 21, 7, () => h.rect(21, 7, 2, 1, GOLD));
    rigEye(h, Q, 27, 7, () => h.rect(27, 7, 2, 1, GOLD));
    rigMouth(h, Q, 26, 13, 2);
    speckle(b, [[20, 23], [27, 22], [21, 31]]); speckle(h, [[23, 6], [27, 9]]);
  },
});
Object.assign(RIGGED, { cosmite: 'biped', drakorn: 'flier' });
