// Brawlix: brawlix. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r132 (it read as Hitmonchan; the owner turned down a punching bag: "just make him look more like
// an animal that fights"): a boxing hare, since real hares stand up and box. Lean and wiry, brown-grey fur and a
// cream belly, tall ears (the left one notched from old fights), a scar over one eye, fierce amber eyes under
// angry brows, a red fighter's headband, fists wrapped in white tape held up in a guard by its chin, big hind feet,
// a cotton tail. Colours in HARE.
const HARE = { FUR: P('#a88a6a', '#7a5e44', '#c8aa88'), CREAM: P('#efe2c8', '#cdbc9c', '#fff6e0'), PINK: '#e8a8a0', NOSE: '#c86a64',
  TAPE: P('#f0ece0', '#c8c0ac', '#ffffff'), EYE: '#f0a828', SCAR: '#6a4c34', BAND: P('#d23a34', '#962420', '#f06a5a') };

Object.assign(MONSTER_ART, {
  brawlix(g, v = 'front') {
    const { FUR, CREAM, PINK, NOSE, TAPE, EYE, SCAR, BAND } = HARE;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), Fd = P(FUR.s, '#5a4430', FUR.b);
    const fist = (p, x, y, r = 2.4) => { p.ellipse(x, y, r, r * 0.9, TAPE, { edge: true }); p.px(Math.round(x) - 1, Math.round(y), TAPE.s).px(Math.round(x), Math.round(y) - 1, TAPE.s); };
    if (v === 'side') {
      earB.poly([[15, 7], [11.5, 0.5], [13.5, 0], [17, 6]], Fd);                                  // far ear, swept back
      legB.ellipse(13, 29, 3.2, 1.5, Fd, { edge: true });
      armB.ellipse(19, 18, 1.4, 2.6, Fd); fist(armB, 21, 14.5, 2.1);                               // its guard: far fist up
      t.ellipse(9, 22, 2, 2, CREAM, { edge: true });                                              // cotton tail
      b.ellipse(15, 21, 5.5, 6.5, FUR, { edge: true });                                           // lean body
      b.ellipse(16, 17.5, 5, 2.8, FUR, { edge: true });                                           // its shoulders
      b.ellipse(17.5, 22, 2.6, 4.5, CREAM);                                                       // cream belly
      legA.ellipse(16, 29, 3.6, 1.6, FUR, { edge: true }); legA.px(19, 29, CREAM.s);              // big hind foot
      h.ellipse(19, 10, 4.6, 4, FUR, { edge: true });                                             // head
      h.ellipse(22.5, 11.5, 2.2, 1.8, CREAM);                                                     // muzzle
      h.px(24, 10, NOSE);
      earA.poly([[17, 7], [13, 0.5], [15.5, -0.5], [19.5, 6]], FUR, { edge: true }); earA.poly([[17, 6], [14.5, 1], [15.5, 0.8], [18.5, 5.5]], PINK);   // near ear
      h.rect(15, 6, 8, 2, BAND.b); h.rect(15, 7, 8, 1, BAND.s); h.poly([[15, 6], [10, 5], [11, 9]], BAND, { edge: true });   // headband, tails flying back
      rigEye(h, Q, 20, 9, () => { h.rect(20, 9, 2, 2, EYE); h.px(21, 9, OUTLINE).px(21, 10, OUTLINE); h.rect(19, 8, 4, 1, OUTLINE); }, 2);   // fierce eye, heavy brow
      h.px(19, 10, SCAR).px(20, 11, SCAR);
      rigMouth(h, Q, 22, 13, 2, () => h.px(22, 13, OUTLINE).px(23, 13, OUTLINE));
      armA.ellipse(18, 19, 1.7, 2.8, FUR, { edge: true }); fist(armA, 23.5, 15, 2.8);              // near fist, jabbing forward
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 29, 3, 1.6, FUR, { edge: true }); legB.ellipse(21, 29, 3, 1.6, FUR, { edge: true });
      b.ellipse(16, 21, 6, 6.5, FUR, { edge: true }); b.ellipse(16, 17.5, 7.5, 2.8, FUR, { edge: true });
      t.ellipse(16, 24.5, 2.3, 2.1, CREAM, { edge: true });                                       // cotton tail
      armA.ellipse(9, 18, 1.6, 2.8, FUR, { edge: true }); armB.ellipse(23, 18, 1.6, 2.8, FUR, { edge: true });
      fist(armA, 9, 14.5); fist(armB, 23, 14.5);
      h.ellipse(16, 10, 5, 4.2, FUR, { edge: true });
      h.rect(11, 6, 10, 2, BAND.b); h.rect(11, 7, 10, 1, BAND.s); h.ellipse(16, 7, 1.4, 1.2, BAND); h.poly([[15, 8], [13, 13], [15, 12.5]], BAND, { edge: true }); h.poly([[17, 8], [19, 13], [17, 12.5]], BAND, { edge: true });   // headband knot and tails
      earA.poly([[12.5, 7], [10.5, 0.5], [13, -0.5], [14.5, 6]], FUR, { edge: true });
      earB.poly([[19.5, 7], [21.5, 0.5], [19.4, -0.5], [19.4, 2.4], [20.2, 3], [18.8, 3.5], [17.5, 6]], FUR, { edge: true });   // the notched ear
      return;
    }
    legA.ellipse(11, 29, 3, 1.6, FUR, { edge: true }); legB.ellipse(21, 29, 3, 1.6, FUR, { edge: true });   // big hind feet
    legA.px(9, 29, CREAM.s).px(11, 30, CREAM.s); legB.px(23, 29, CREAM.s).px(21, 30, CREAM.s);
    b.ellipse(16, 21, 6, 6.5, FUR, { edge: true });                                               // lean, wiry body
    b.ellipse(16, 17.5, 7.5, 2.8, FUR, { edge: true });                                          // broad fighter's shoulders
    b.ellipse(16, 22.5, 3.4, 4.6, CREAM);                                                        // cream belly
    earA.poly([[12.5, 7], [10.5, 0.5], [13, -0.5], [14.5, 6]], FUR, { edge: true }); earA.poly([[12.8, 6], [11.5, 1], [12.7, 0.8], [13.8, 5.5]], PINK);   // tall ears
    earB.poly([[19.5, 7], [21.5, 0.5], [19.4, -0.5], [19.4, 2.4], [20.2, 3], [18.8, 3.5], [17.5, 6]], FUR, { edge: true });   // the right one notched from old fights
    earB.poly([[19.2, 6], [20.5, 1], [19.6, 1], [18.2, 5.5]], PINK);
    h.ellipse(16, 10, 5, 4.2, FUR, { edge: true });                                              // head
    h.ellipse(16, 12, 2.7, 1.8, CREAM);                                                          // muzzle
    h.rect(15, 11, 2, 1, NOSE);                                                                  // nose
    h.rect(11, 6, 10, 2, BAND.b); h.rect(11, 7, 10, 1, BAND.s);                                   // a red fighter's headband
    h.poly([[11, 6], [6, 4], [7, 8]], BAND, { edge: true });                                      // its tails flying
    rigEyes(h, Q, 32, 12, 9, 2, () => { h.rectM(12, 9, 2, 2, EYE); h.pxM(13, 9, OUTLINE); h.pxM(13, 10, OUTLINE); h.rectM(11, 8, 3, 1, OUTLINE); h.pxM(14, 9, OUTLINE); });   // fierce eyes, heavy angry brows
    h.px(11, 10, SCAR).px(12, 11, SCAR);                                                          // a scar under one eye
    rigMouth(h, Q, 15, 13, 2, () => h.px(15, 13, OUTLINE).px(16, 13, OUTLINE));
    armA.ellipse(10, 18, 1.8, 3, FUR, { edge: true }); armB.ellipse(22, 18, 1.8, 3, FUR, { edge: true });   // forearms
    fist(armA, 12, 14.5, 2.9); fist(armB, 20, 14.5, 2.9);                                         // big taped fists up in a guard, by its chin
  },
});
Object.assign(MONSTER_ART_DIAG, {
  brawlix(g, v) {   // turned a little right
    const { FUR, CREAM, PINK, NOSE, TAPE, EYE, SCAR, BAND } = HARE;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const fist = (p, x, y, r = 2.4) => { p.ellipse(x, y, r, r * 0.9, TAPE, { edge: true }); p.px(Math.round(x) - 1, Math.round(y), TAPE.s).px(Math.round(x), Math.round(y) - 1, TAPE.s); };
    legA.ellipse(11, 29, 3, 1.6, FUR, { edge: true }); legB.ellipse(20.5, 29, 2.8, 1.5, FUR, { edge: true });
    if (v === 'bside') {
      b.ellipse(15.5, 21, 6, 6.5, FUR, { edge: true });
      t.ellipse(14, 24.5, 2.3, 2.1, CREAM, { edge: true });
      armA.ellipse(9, 18, 1.6, 2.8, FUR, { edge: true }); armB.ellipse(23, 18, 1.5, 2.6, FUR, { edge: true });
      fist(armA, 9, 14.5); fist(armB, 23.5, 14.5, 2.2);
      h.ellipse(17.5, 10, 5, 4.2, FUR, { edge: true });
      h.rect(12.5, 6, 10, 2, BAND.b); h.rect(12.5, 7, 10, 1, BAND.s); h.ellipse(16.5, 7, 1.4, 1.2, BAND); h.poly([[15.5, 8], [13.5, 13], [15.5, 12.5]], BAND, { edge: true });
      h.ellipse(21.5, 11.5, 1.4, 1.3, CREAM);                                                     // a sliver of muzzle
      earA.poly([[14, 7], [12, 0.5], [14.5, -0.5], [16, 6]], FUR, { edge: true });
      earB.poly([[21, 7], [23, 0.5], [20.9, -0.5], [20.9, 2.4], [21.7, 3], [20.3, 3.5], [19, 6]], FUR, { edge: true });
      return;
    }
    b.ellipse(15.5, 21, 6, 6.5, FUR, { edge: true }); b.ellipse(16, 17.5, 7.2, 2.8, FUR, { edge: true });
    b.ellipse(17, 22.5, 3.2, 4.6, CREAM);
    earA.poly([[14, 7], [12, 0.5], [14.5, -0.5], [16, 6]], FUR, { edge: true }); earA.poly([[14.3, 6], [13, 1], [14.2, 0.8], [15.3, 5.5]], PINK);
    earB.poly([[21, 7], [23, 0.5], [20.9, -0.5], [20.9, 2.4], [21.7, 3], [20.3, 3.5], [19, 6]], FUR, { edge: true });
    h.ellipse(17.5, 10, 5, 4.2, FUR, { edge: true });
    h.ellipse(19, 12, 2.6, 1.8, CREAM);
    h.rect(19, 11, 2, 1, NOSE);
    h.rect(12.5, 6, 10, 2, BAND.b); h.rect(12.5, 7, 10, 1, BAND.s); h.poly([[12.5, 6], [7.5, 4], [8.5, 8]], BAND, { edge: true });
    rigEye(h, Q, 14, 9, () => { h.rect(14, 9, 2, 2, EYE); h.px(15, 9, OUTLINE).px(15, 10, OUTLINE); h.rect(13, 8, 3, 1, OUTLINE).px(16, 9, OUTLINE); }, 2);
    rigEye(h, Q, 20, 9, () => { h.rect(20, 9, 2, 2, EYE); h.px(20, 9, OUTLINE).px(20, 10, OUTLINE); h.rect(20, 8, 3, 1, OUTLINE).px(19, 9, OUTLINE); }, 2);
    h.px(13, 10, SCAR).px(14, 11, SCAR);
    rigMouth(h, Q, 18, 13, 2, () => h.px(18, 13, OUTLINE).px(19, 13, OUTLINE));
    armA.ellipse(11, 18, 1.8, 3, FUR, { edge: true }); armB.ellipse(23, 18, 1.6, 2.8, FUR, { edge: true });
    fist(armA, 13.5, 14.5, 2.9); fist(armB, 21.5, 14.5, 2.6);
  },
});
Object.assign(RIGGED, { brawlix: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  brawlix: { fps: 5, every: 8, frames: [{ arms: [3, -1] }, { arms: [-1, 3] }, { arms: [3, -1], ears: [1, 0] }, { arms: [-1, 3] }, { }] },   // shadowboxes, ears twitching
});
