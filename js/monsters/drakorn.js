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
  // Drakorn: Cosmite grown into a lean night-sky dragon on the wing: big dusk-violet wings with
  // constellations, long silver horns and a crest of silver spines, a glowing nebula stripe down
  // its chest, gold eyes, and a long tail ending in a silver star.
  drakorn(g, v = 'front') {
    const { Sk, SkD, Horn, Wing, WingD, GOLD, CLAW } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const stars = pts => { if (!FLAP) for (const [x, y] of pts) b.px(x, y, '#ffe8a0'); };   // constellation stars on the wings (not while flapping)
    if (v === 'side') {
      wingPoly(b, [[20, 18], [10, 2], [8, 4], [10, 10], [6, 14], [11, 17], [7, 22], [17, 23]], WingD);                   // far wing
      t.poly([[17, 32], [9, 37], [3, 35], [2, 30], [4, 30], [5, 33], [9, 34], [16, 29]], Sk, { edge: true }); nightStar(t, 3, 27, 3.5);
      legB.poly([[18, 32], [21, 32], [21, 40], [18, 41]], SkD, { edge: true });                                          // far leg
      b.ellipse(21, 27, 6.5, 9.5, Sk, { edge: true });                                                                   // lean body
      nebula(b, 25, 28, 2.5, 8, [22, 25, 28, 31, 34]);
      b.poly([[22, 20], [27, 20], [29, 13], [25, 12]], Sk, { edge: true });                                              // neck
      for (const [x, y] of [[24, 13], [23, 16], [21, 19], [18, 22]]) b.poly([[x, y], [x - 3, y + 1], [x, y + 2]], Horn); // spines down its neck and back
      legA.poly([[21, 31], [25, 31], [25, 39], [27, 41], [22, 41]], Sk, { edge: true }); legA.px(26, 41, CLAW).px(27, 41, CLAW);
      armA.poly([[25, 21], [29, 26], [28, 28], [24, 24]], Sk, { edge: true });
      wingPoly(b, [[22, 19], [12, 4], [10, 6], [12, 11], [8, 16], [13, 19], [10, 24], [20, 25]], Wing, { edge: true }); // near wing
      stars([[14, 9], [12, 14], [15, 17], [13, 21]]);
      earB.poly([[26, 7], [21, 3], [22, 2], [27, 5]], Horn);                                                             // far horn
      h.ellipse(29, 10, 5.5, 4.5, Sk, { edge: true });                                                                   // head
      h.poly([[31, 8], [39, 10], [39, 13], [31, 14]], Sk, { edge: true });                                               // long snout
      earA.poly([[28, 7], [21, 1], [22, 0], [29, 4], [31, 6]], Horn, { edge: true });                                    // horn, swept back
      h.px(38, 10, OUTLINE);
      h.rect(29, 7, 4, 1, OUTLINE);                                                                                      // brow
      rigEye(h, Q, 30, 8, () => { h.rect(30, 8, 3, 1, GOLD); h.px(32, 8, '#ffffff'); }, 3);
      rigMouth(h, Q, 34, 12, 4, () => h.rect(34, 12, 4, 1, OUTLINE));
      speckle(b, [[19, 24], [21, 33], [17, 28]]); speckle(h, [[27, 9]]);
      return;
    }
    if (v === 'back') {
      t.poly([[21, 34], [23, 34], [30, 38], [36, 36], [38, 32], [36, 31], [34, 35], [29, 35], [23, 32]], Sk, { edge: true }); nightStar(t, 38, 29, 3.5);
      legA.poly([[15, 31], [19, 31], [19, 40], [15, 41]], Sk, { edge: true }); legB.poly([[25, 31], [29, 31], [29, 41], [25, 40]], Sk, { edge: true });
      earA.poly([[19, 6], [14, 1], [15, 0], [20, 3], [22, 4]], Horn, { edge: true }); earB.poly([[25, 6], [30, 1], [29, 0], [24, 3], [22, 4]], Horn, { edge: true });
      h.ellipse(22, 9, 5.5, 5, Sk, { edge: true });                                                                      // head, behind
      b.ellipse(22, 26, 7, 10, Sk, { edge: true });                                                                      // body
      for (const y of [13, 17, 21, 25, 29]) b.poly([[21, y + 2], [22, y - 1], [23, y + 2]], Horn);                      // the crest down its back
      wingPolyM(b, [[18, 18], [4, 4], [2, 6], [5, 12], [2, 16], [7, 19], [3, 24], [11, 25], [16, 24]], Wing, { edge: true });   // wings, toward you
      stars([[7, 9], [6, 15], [10, 20], [37, 9], [38, 15], [34, 20]]);
      speckle(b, [[19, 30], [25, 24]]);
      return;
    }
    wingPolyM(b, [[17, 18], [3, 4], [1, 6], [4, 12], [1, 16], [6, 19], [2, 24], [10, 25], [15, 24]], Wing, { edge: true });   // big wings
    stars([[7, 9], [5, 14], [9, 19], [37, 9], [39, 14], [35, 19]]);
    t.poly([[26, 34], [33, 36], [38, 32], [39, 27], [37, 27], [36, 31], [32, 34], [27, 32]], Sk, { edge: true }); nightStar(t, 38, 24, 3.5);   // tail and its star
    legA.poly([[15, 30], [19, 30], [19, 40], [16, 41], [14, 40]], Sk, { edge: true }); legB.poly([[25, 30], [29, 30], [30, 40], [28, 41], [25, 40]], Sk, { edge: true });
    legA.px(14, 41, CLAW).px(16, 41, CLAW); legB.px(28, 41, CLAW).px(30, 41, CLAW);
    b.ellipse(22, 26, 7, 10, Sk, { edge: true });                                                                        // lean body
    nebula(b, 22, 27, 3, 8.5, [21, 24, 27, 30, 33]);                                                                     // glowing nebula stripe
    b.poly([[19, 17], [25, 17], [24, 12], [20, 12]], Sk, { edge: true });                                               // neck
    armA.poly([[16, 20], [13, 26], [14, 29], [16, 27], [17, 22]], Sk, { edge: true }); armB.poly([[28, 20], [31, 26], [30, 29], [28, 27], [27, 22]], Sk, { edge: true });
    earA.poly([[19, 6], [14, 1], [15, 0], [20, 3], [22, 4]], Horn, { edge: true }); earB.poly([[25, 6], [30, 1], [29, 0], [24, 3], [22, 4]], Horn, { edge: true });   // long silver horns
    h.polyM([[17, 9], [13, 8], [17, 11]], Horn);                                                                         // spines framing its face
    h.ellipse(22, 9, 5.5, 5, Sk, { edge: true });                                                                        // head
    h.ellipse(22, 12.5, 3.5, 2.6, Sk, { edge: true });                                                                   // snout
    h.px(21, 13, OUTLINE).px(23, 13, OUTLINE);
    h.rectM(17, 7, 4, 1, OUTLINE);                                                                                       // brows
    rigEyes(h, Q, 44, 18, 8, 3, () => { h.rectM(18, 8, 3, 1, GOLD); h.pxM(18, 8, '#ffffff'); });
    rigMouth(h, Q, 20, 14, 4, () => h.rect(21, 14, 2, 1, OUTLINE));
    speckle(b, [[19, 20], [25, 33], [18, 31]]); speckle(h, [[20, 6], [25, 10]]);
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
    const { Sk, SkD, Horn, Wing, WingD, GOLD, CLAW } = NIGHT;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const stars = pts => { if (!FLAP) for (const [x, y] of pts) b.px(x, y, '#ffe8a0'); };
    if (v === 'bside') {
      t.poly([[19, 34], [21, 34], [28, 38], [34, 36], [36, 32], [34, 31], [32, 35], [27, 35], [21, 32]], Sk, { edge: true }); nightStar(t, 36, 29, 3.5);
      legA.poly([[14, 31], [18, 31], [18, 40], [14, 41]], Sk, { edge: true }); legB.poly([[24, 31], [28, 31], [28, 41], [24, 40]], Sk, { edge: true });
      earB.poly([[20, 6], [15, 1], [16, 0], [21, 3], [23, 4]], Horn, { edge: true }); earA.poly([[27, 6], [32, 1], [31, 0], [26, 3], [24, 4]], Horn, { edge: true });
      h.ellipse(24, 9, 5.5, 5, Sk, { edge: true });
      h.ellipse(29.5, 11, 1.8, 1.6, Sk);                                                                                 // snout peeking out
      b.ellipse(21, 26, 7, 10, Sk, { edge: true });
      for (const y of [13, 17, 21, 25, 29]) b.poly([[20, y + 2], [21, y - 1], [22, y + 2]], Horn);
      wingPoly(b, [[17, 18], [3, 4], [1, 6], [4, 12], [1, 16], [6, 19], [2, 24], [10, 25], [15, 24]], Wing, { edge: true });
      wingPoly(b, [[26, 18], [38, 5], [40, 7], [37, 12], [40, 16], [35, 19], [38, 24], [31, 25], [27, 24]], Wing, { edge: true });
      stars([[6, 9], [5, 15], [9, 20], [36, 10], [36, 16]]);
      return;
    }
    wingPoly(b, [[16, 18], [4, 5], [2, 7], [5, 12], [2, 16], [7, 19], [3, 23], [10, 24], [14, 23]], WingD);             // far wing
    wingPoly(b, [[27, 18], [40, 3], [42, 5], [39, 11], [42, 15], [37, 19], [41, 24], [33, 25], [28, 24]], Wing, { edge: true });   // near wing
    stars([[38, 8], [39, 14], [35, 20]]);
    t.poly([[16, 33], [9, 36], [4, 33], [3, 28], [5, 28], [6, 31], [10, 33], [16, 30]], Sk, { edge: true }); nightStar(t, 4, 25, 3.5);   // tail, out to the side
    legB.poly([[16, 30], [19, 30], [19, 40], [16, 41]], SkD, { edge: true }); legA.poly([[25, 30], [29, 30], [30, 40], [28, 41], [25, 40]], Sk, { edge: true });
    legA.px(28, 41, CLAW).px(30, 41, CLAW);
    b.ellipse(22, 26, 7, 10, Sk, { edge: true });
    nebula(b, 23.5, 27, 3, 8.5, [21, 24, 27, 30, 33]);
    b.poly([[20, 17], [26, 17], [25, 12], [21, 12]], Sk, { edge: true });
    armB.poly([[17, 20], [15, 26], [16, 28], [18, 23]], Sk, { edge: true }); armA.poly([[29, 20], [32, 26], [31, 29], [29, 27], [28, 22]], Sk, { edge: true });
    earB.poly([[20, 6], [16, 2], [17, 1], [21, 3], [23, 4]], Horn, { edge: true }); earA.poly([[26, 6], [32, 1], [31, 0], [25, 3], [23, 4]], Horn, { edge: true });
    h.poly([[18, 9], [14, 8], [18, 11]], Horn); h.poly([[29, 9], [33, 8], [29, 11]], Horn);
    h.ellipse(23, 9, 5.5, 5, Sk, { edge: true });
    h.ellipse(24.5, 12.5, 3.5, 2.6, Sk, { edge: true });                                                                 // snout, turned its way
    h.px(23, 13, OUTLINE).px(26, 13, OUTLINE);
    h.rect(18, 7, 3, 1, OUTLINE); h.rect(24, 7, 4, 1, OUTLINE);
    rigEye(h, Q, 19, 8, () => { h.rect(19, 8, 2, 1, GOLD); h.px(19, 8, '#ffffff'); });
    rigEye(h, Q, 25, 8, () => { h.rect(25, 8, 3, 1, GOLD); h.px(25, 8, '#ffffff'); }, 3);
    rigMouth(h, Q, 23, 14, 4, () => h.rect(23, 14, 2, 1, OUTLINE));
    speckle(b, [[20, 20], [26, 33], [19, 31]]); speckle(h, [[21, 6], [26, 10]]);
  },
});
Object.assign(RIGGED, { cosmite: 'biped', drakorn: 'flier' });
