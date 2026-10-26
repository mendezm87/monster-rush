// Thornback: thornback. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r132 (it read as Turtwig; the r131 thorny-devil lizard "looks like nachos, can't even tell if this
// is grass type"): a barrel-cactus lizard. Its back is a big green barrel cactus, ribbed and studded with white
// spines, with a pink cactus flower blooming on top (Plant); its head, legs and tail are a sandy desert lizard's,
// with two little horns over its eyes (Earth). Colours in THORN.
const THORN = { CACT: P('#4e9e4a', '#2e6e34', '#7ac86a'), RIB: '#2c5e30', SPINE: '#f6f2de', SAND: P('#d8b078', '#a88050', '#f0d0a0'),
  HORN: P('#9a6a3a', '#6a4422', '#c08a52'), FLOWER: P('#f06aa0', '#c03a78', '#ff9ac8'), MID: '#ffd84a', EYE: '#2a1a10' };

// the cactus dome: ribs (curved dark lines) and white spines sticking out along them and over its top
function cactusDome(p, cx, cy, rx, ry, ribs) {
  const { CACT, RIB, SPINE } = THORN;
  p.ellipse(cx, cy, rx, ry, CACT, { edge: true });
  for (const k of ribs) {   // k: -1..1 across the dome
    for (let y = Math.ceil(cy - ry + 1); y < cy + ry - 0.5; y++) {
      const w = rx * Math.sqrt(Math.max(0, 1 - ((y + 0.5 - cy) / ry) ** 2));
      const x = Math.round(cx + k * w * 0.85 - 0.5);
      p.px(x, y, RIB);
      if ((y + Math.round(k * 4)) % 3 === 0) p.px(x + (k < 0 ? -1 : 1), y, SPINE);           // a spine on the rib
    }
  }
  for (const k of [-0.8, -0.45, -0.1, 0.25, 0.6]) {                                          // spines poking out over its top
    const x = Math.round(cx + k * rx), y = Math.round(cy - ry * Math.sqrt(1 - k * k)) - 1;
    p.px(x, y, SPINE); p.px(x + (k < 0 ? -1 : 1), y - 1, SPINE);
  }
}
// r252, the in-between pass (the owner: keep the old design, add the guide's detail): splayed lizard legs with toes
// instead of round stubs. thornLeg = seen from the front (dir: -1 left, 1 right), thornLegSide = side-on.
function thornLeg(p, x, y, dir, C) {
  p.poly([[x, y - 1.2], [x + dir * 3.2, y - 0.4], [x + dir * 3.8, y + 2.4], [x + dir * 2.4, y + 2.6], [x + dir * 1.6, y + 0.8], [x, y + 1]], C, { edge: true });
  p.ellipse(x + dir * 3.4, y + 3, 1.9, 0.9, C, { edge: true });
  p.px(Math.round(x + dir * 4.8), Math.round(y + 3), THORN.HORN.s).px(Math.round(x + dir * 2.2), Math.round(y + 3.4), THORN.HORN.s);   // claws
}
function thornLegSide(p, x, C) {
  p.poly([[x - 1.2, 24.5], [x + 1.4, 24.5], [x + 1.2, 27], [x + 2.8, 28], [x + 2.6, 28.9], [x - 1.4, 28.9]], C, { edge: true });
  p.px(Math.round(x + 3), 28, THORN.HORN.s);
}
function cactusFlower(p, x, y) { const { FLOWER, MID } = THORN; p.ellipse(x, y, 2.6, 1.7, FLOWER, { edge: true }); p.px(Math.round(x) - 1, Math.round(y) - 1, FLOWER.l); p.px(Math.round(x), Math.round(y), MID).px(Math.round(x) - 1, Math.round(y), MID); }

Object.assign(MONSTER_ART, {
  thornback(g, v = 'front') {
    const { SAND, HORN, EYE } = THORN;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.poly([[8, 22], [9, 25], [2, 25], [0, 23.5], [3, 23]], SAND, { edge: true }); t.px(0, 23, HORN.s);   // long thin lizard tail
      t.px(3, 24, SAND.s).px(5, 24, SAND.s).px(7, 23, SAND.s);                                   // bands on its tail
      thornLegSide(legB, 9, SAND.s); thornLegSide(legB, 20, SAND.s);                                // far legs
      b.ellipse(16, 23, 10, 3.6, SAND, { edge: true });                                          // its long sandy lizard body
      for (const x of [9, 13, 20]) b.px(x, 24, SAND.s);                                         // scales
      cactusDome(b, 15, 17.8, 6, 5.2, [-0.6, 0, 0.6]);                                         // the barrel cactus growing on its back
      cactusFlower(b, 15, 12.2);
      thornLegSide(legA, 11, SAND); thornLegSide(legA, 22, SAND);                                    // near legs, bent, with claws
      h.poly([[22, 19.5], [27, 19.5], [31, 22], [27, 24.5], [22, 24.5]], SAND, { edge: true });    // pointed lizard head
      earA.poly([[23, 20], [22, 16], [25, 19]], HORN, { edge: true });                            // a little horn over its eye
      rigEye(h, Q, 25, 21, () => { h.rect(25, 21, 2, 2, EYE); h.px(25, 21, '#ffffff'); h.rect(24, 20, 3, 1, SAND.s); }, 2);
      rigMouth(h, Q, 26, 23, 3, () => { h.rect(26, 23, 4, 1, SAND.s); });
      return;
    }
    if (v === 'back') {
      thornLeg(legA, 8, 23.5, -1, SAND); thornLeg(legB, 24, 23.5, 1, SAND);
      earA.poly([[12, 16], [10.5, 12], [14, 15]], HORN, { edge: true }); earB.poly([[20, 16], [21.5, 12], [18, 15]], HORN, { edge: true });
      h.ellipse(16, 16.5, 4.5, 2.8, SAND, { edge: true });
      b.ellipse(16, 22, 10.5, 4.2, SAND, { edge: true });
      cactusDome(b, 16, 17.3, 6.4, 5.4, [-0.6, 0, 0.6]);
      cactusFlower(b, 16, 11.3);
      t.poly([[14, 24], [18, 24], [17, 31], [15, 31]], SAND, { edge: true }); t.px(16, 31, HORN.s); t.px(16, 26, SAND.s).px(16, 28, SAND.s);   // its tail, toward you, banded
      return;
    }
    t.poly([[22, 22], [27, 20], [31, 16], [30, 21], [24, 24.5]], SAND, { edge: true });            // long tail curving out behind
    t.px(27, 21, SAND.s).px(29, 19, SAND.s);
    thornLeg(legA, 8, 23.5, -1, SAND); thornLeg(legB, 24, 23.5, 1, SAND);                         // legs splayed wide, with claws
    b.ellipse(16, 22, 10.5, 4.2, SAND, { edge: true });                                            // wide flat lizard body
    cactusDome(b, 16, 16.3, 6.4, 5.4, [-0.6, 0, 0.6]);                                             // the barrel cactus growing on its back
    cactusFlower(b, 16, 10.3);                                                                      // and the flower blooming on top
    h.ellipse(16, 24, 6, 3.8, SAND, { edge: true });                                               // sandy lizard head, low in front
    earA.poly([[11.5, 22], [9.5, 18], [13.5, 21]], HORN, { edge: true }); earB.poly([[20.5, 22], [22.5, 18], [18.5, 21]], HORN, { edge: true });   // two little horns
    rigEyes(h, Q, 32, 12, 23, 2, () => { h.rectM(12, 23, 2, 2, EYE); h.pxM(12, 23, '#ffffff'); h.rectM(11, 22, 3, 1, SAND.s); });
    rigMouth(h, Q, 14, 26, 4, () => { h.rect(14, 26, 4, 1, SAND.s); h.px(13, 25, SAND.s); h.px(18, 25, SAND.s); });   // a little smile
  },
});
Object.assign(MONSTER_ART_DIAG, {
  thornback(g, v) {   // turned a little right
    const { SAND, HORN, EYE } = THORN;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'bside') {
      thornLeg(legA, 8, 23.5, -1, SAND); thornLeg(legB, 23, 24, 1, SAND);
      earA.poly([[15, 16], [13.5, 12], [17, 15]], HORN, { edge: true }); earB.poly([[23, 16], [24.5, 12], [21, 15]], HORN, { edge: true });
      h.ellipse(19, 16.5, 4.5, 2.8, SAND, { edge: true });
      b.ellipse(15, 22, 10.5, 4.2, SAND, { edge: true });
      cactusDome(b, 15, 17.3, 6.4, 5.4, [-0.6, 0, 0.6]);
      cactusFlower(b, 15, 11.3);
      t.poly([[10, 24], [14, 25], [9, 30], [6, 29]], SAND, { edge: true });
      return;
    }
    t.poly([[8, 22], [10, 25], [2, 24], [0, 20], [4, 21.5]], SAND, { edge: true });
    thornLeg(legA, 9, 23.5, -1, SAND); thornLeg(legB, 24.5, 23.5, 1, SAND);
    b.ellipse(15.5, 22, 10.5, 4.2, SAND, { edge: true });
    cactusDome(b, 14.5, 16.3, 6.4, 5.4, [-0.6, 0, 0.6]);
    cactusFlower(b, 14.5, 10.3);
    h.ellipse(19, 24, 6, 3.8, SAND, { edge: true });
    earA.poly([[14.5, 22], [12.5, 18], [16.5, 21]], HORN, { edge: true }); earB.poly([[23.5, 22], [25.5, 18.5], [21.5, 21]], HORN, { edge: true });
    rigEye(h, Q, 16, 23, () => { h.rect(16, 23, 2, 2, EYE); h.px(16, 23, '#ffffff'); h.rect(15, 22, 3, 1, SAND.s); }, 2);
    rigEye(h, Q, 21, 23, () => { h.rect(21, 23, 2, 2, EYE); h.px(21, 23, '#ffffff'); h.rect(21, 22, 3, 1, SAND.s); }, 2);
    rigMouth(h, Q, 17, 26, 4, () => { h.rect(17, 26, 4, 1, SAND.s); h.px(16, 25, SAND.s); h.px(21, 25, SAND.s); });
  },
});
Object.assign(RIGGED, { thornback: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  thornback: { fps: 5, every: 10, frames: [{ tail: [1, 0] }, { tail: [-1, 0], head: [0, -1] }, { tail: [1, 0], head: [0, -1], eyes: 'blink' }, { tail: [-1, 0] }, { }] },   // swishes its tail and basks in the sun
});
