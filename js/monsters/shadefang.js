// Shadefang: shadefang. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r247 (the owner: the traced guide version should "lean more towards the old style"): the old chibi pup's big head,
// red eyes and collar, with the guide's wolf in it: four real legs, a pointed muzzle with a fang, cheek tufts, a shaggy
// chest ruff and a bushy tail. A shade lighter than before so it reads on dark floors. Colours in FANG.
const FANG = { B: P('#46425c', '#2a2640', '#66628a'), DK: P('#34304a', '#211d33', '#4c4866'), RUFF: P('#5e5a7a', '#403c5a', '#807c9c'),
  G: P('#9a96b0', '#6a6684', '#c4c0d6'), RED: '#d2384a', EYE: '#ff3a3a', TAG: '#e8c040' };
// a leg: a pillar from the body (y0) down to a dark paw at x
function fangLeg(p, x, y0, C, w = 1.4) {
  p.poly([[x - w, y0], [x + w, y0], [x + w - 0.2, 28.6], [x - w + 0.2, 28.6]], C, { edge: true });
  p.ellipse(x, 29.1, w + 0.8, 1.1, FANG.DK.s);
}
Object.assign(MONSTER_ART, {
  shadefang(g, v = 'front') {
    const { B, DK, RUFF, G, RED, EYE, TAG } = FANG;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      fangLeg(legB, 10, 22, DK); fangLeg(legA, 21.5, 21, DK);                                   // far legs, in shadow
      t.poly([[9, 19], [2.5, 12], [1, 15], [3, 17], [0, 19.5], [4, 21], [3, 24], [8, 23.5]], B, { edge: true });   // bushy tail, raised
      b.ellipse(15.5, 20.5, 7.6, 4.6, B, { edge: true });                                       // a long wolf body
      legA.ellipse(11.5, 21.5, 3.2, 3.4, B, { edge: true }); fangLeg(legA, 11.5, 23, B);        // near haunch and hind leg
      fangLeg(legB, 19.5, 21, B);                                                               // near foreleg
      b.poly([[18.5, 16], [24, 16.5], [22.5, 19], [23, 21.5], [21, 20.5], [19.5, 23], [18.5, 20]], RUFF, { edge: true });   // shaggy chest ruff
      b.ellipse(20.5, 16.5, 1.8, 2.8, RED);                                                     // collar
      b.px(21, 19, TAG);
      earB.poly([[16, 9], [14.5, 1.5], [19, 6]], DK, { edge: true });                           // far ear
      h.poly([[18, 13], [15.5, 16.5], [19, 15.5]], B, { edge: true });                           // cheek tuft
      h.ellipse(21, 11.5, 5, 4.5, B, { edge: true });
      h.poly([[24, 9.5], [30, 12], [29.5, 14.5], [24, 15]], B, { edge: true });                 // pointed muzzle
      h.ellipse(26.5, 14, 2.6, 1.1, G);
      h.px(29, 12, OUTLINE).px(30, 12, OUTLINE);                                                // nose
      earA.poly([[18, 9], [18.5, -0.5], [22.5, 6.5]], B, { edge: true }); earA.px(19, 4, RED).px(19, 5, RED).px(20, 5, RED);
      rigEye(h, Q, 23, 10, () => { h.rect(23, 10, 2, 2, EYE); h.px(23, 10, '#ffffff'); h.px(22, 9, OUTLINE).px(23, 9, OUTLINE).px(24, 9, OUTLINE).px(25, 10, OUTLINE); });
      rigMouth(h, Q, 25, 15, 2, () => h.px(25, 15, OUTLINE).px(26, 15, OUTLINE).px(27, 15, '#ffffff'));   // a fang
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 22.5, 3, 3, B, { edge: true }); fangLeg(legA, 11, 24, B);
      legB.ellipse(21, 22.5, 3, 3, B, { edge: true }); fangLeg(legB, 21, 24, B);
      b.ellipse(16, 21, 7, 5, B, { edge: true });
      b.ellipse(16, 16.5, 5.5, 1.6, RED);                                                       // collar
      h.poly([[9.5, 11], [7, 14], [10.5, 14.5]], B, { edge: true }); h.poly([[22.5, 11], [25, 14], [21.5, 14.5]], B, { edge: true });   // cheek tufts
      h.ellipse(16, 11.5, 6.5, 5.2, B, { edge: true });
      h.px(14, 8, B.b).px(15, 8, B.b).px(16, 7, B.b);                                           // a lick of lighter fur
      earA.poly([[10, 10], [8, 0], [11, 1.5], [14, 7]], B, { edge: true }); earB.poly([[22, 10], [24, 0], [21, 1.5], [18, 7]], B, { edge: true });
      t.poly([[14, 25], [13, 18], [14.5, 14], [17, 11], [17.5, 14], [19.5, 16], [18.5, 19], [19, 25]], B, { edge: true });   // bushy tail up
      t.px(16, 12, B.b).px(17, 13, B.b);
      return;
    }
    t.poly([[21, 22], [27, 15], [30, 13], [29, 17], [31, 18], [28, 21], [29, 24], [25, 25]], B, { edge: true });   // bushy tail behind
    fangLeg(legB, 10, 23, DK); fangLeg(legA, 22, 23, DK);                                       // hind legs, behind
    b.ellipse(16, 21, 7, 5, B, { edge: true });
    fangLeg(legA, 13, 22, B); fangLeg(legB, 19, 22, B);                                         // forelegs
    b.poly([[11, 17], [13, 23], [14.5, 20.5], [16, 24], [17.5, 20.5], [19, 23], [21, 17]], RUFF, { edge: true });   // shaggy chest ruff
    b.ellipse(16, 17.5, 5.5, 1.6, RED);                                                         // collar
    b.px(16, 19, TAG);
    h.poly([[9.5, 11], [7, 14], [10.5, 14.5]], B, { edge: true }); h.poly([[22.5, 11], [25, 14], [21.5, 14.5]], B, { edge: true });   // cheek tufts
    h.ellipse(16, 11.5, 6.5, 5.2, B, { edge: true });
    h.ellipse(16, 14.5, 3.2, 2.2, G);                                                           // muzzle
    h.rect(15, 13, 2, 1, OUTLINE);                                                              // nose
    earA.poly([[10, 10], [8, 0], [11, 1.5], [14, 7]], B, { edge: true }); earA.px(10, 3, RED).px(10, 4, RED).px(11, 5, RED);
    earB.poly([[22, 10], [24, 0], [21, 1.5], [18, 7]], B, { edge: true }); earB.px(21, 3, RED).px(21, 4, RED).px(20, 5, RED);
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, EYE, { brow: true }));
    rigMouth(h, Q, 15, 16, 2, () => h.px(15, 16, OUTLINE).px(16, 16, OUTLINE).px(17, 16, '#ffffff'));   // a fang
  },
});
Object.assign(MONSTER_ART_DIAG, {
  shadefang(g, v) {
    const { B, DK, RUFF, G, RED, EYE, TAG } = FANG;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'bside') {
      legA.ellipse(10.5, 22.5, 3, 3, B, { edge: true }); fangLeg(legA, 10.5, 24, B);
      legB.ellipse(20.5, 22.5, 3, 3, B, { edge: true }); fangLeg(legB, 20.5, 24, B);
      b.ellipse(15.5, 21, 7, 5, B, { edge: true });
      b.ellipse(16.5, 16.5, 5.5, 1.6, RED);
      h.poly([[22, 12.5], [27, 13.5], [22, 15.5]], B, { edge: true });                           // snout peeking out
      h.poly([[11, 11], [8.5, 14], [12, 14.5]], B, { edge: true });
      h.ellipse(17.5, 11.5, 6.5, 5.2, B, { edge: true });
      earB.poly([[11.5, 10], [9.5, 0], [12.5, 1.5], [15.5, 7]], B, { edge: true }); earA.poly([[23, 10], [25, 0.5], [22, 1.5], [19.5, 7]], B, { edge: true });
      t.poly([[12, 25], [11, 18], [12.5, 14], [15, 11], [15.5, 14], [17.5, 16], [16.5, 19], [17, 25]], B, { edge: true });
      return;
    }
    t.poly([[10, 20], [3, 13], [2, 16], [4, 18], [1, 20.5], [5, 22], [5, 25], [9, 24]], B, { edge: true });   // bushy tail
    fangLeg(legB, 10, 23, DK); fangLeg(legA, 22, 22, DK);                                       // far legs
    b.ellipse(15.5, 21, 7.2, 4.8, B, { edge: true });
    fangLeg(legA, 13, 23, B); fangLeg(legB, 18.5, 22, B);                                       // near legs
    b.poly([[14.5, 17], [16.5, 23], [18, 20.5], [19.5, 24], [21, 20.5], [22.5, 22.5], [23.5, 17]], RUFF, { edge: true });
    b.ellipse(18.5, 17.5, 5, 1.6, RED); b.px(19, 19, TAG);
    h.poly([[12.8, 11], [10.5, 14], [14, 14.5]], B, { edge: true }); h.poly([[24, 11], [26, 14], [23, 14.5]], B, { edge: true });
    h.ellipse(18.5, 11.5, 6, 5, B, { edge: true });
    h.poly([[20, 12.5], [26.5, 13], [26, 15.5], [20, 16.2]], B, { edge: true });                 // muzzle turned its way
    h.ellipse(22.5, 15, 3, 1.3, G);
    h.px(25, 13, OUTLINE).px(26, 13, OUTLINE);
    earB.poly([[12.5, 10], [11, 0.5], [14, 2.5], [16, 7]], B, { edge: true }); earB.px(13, 4, RED).px(13, 5, RED);
    earA.poly([[19.5, 8], [22.5, -0.5], [24, 3], [24, 8.5]], B, { edge: true }); earA.px(22, 3, RED).px(22, 4, RED).px(22, 5, RED);
    rigEye(h, Q, 15, 10, () => { h.rect(15, 10, 2, 2, EYE); h.px(15, 10, '#ffffff'); h.px(14, 9, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE).px(17, 10, OUTLINE); });
    rigEye(h, Q, 20, 10, () => { h.rect(20, 10, 2, 2, EYE); h.px(20, 10, '#ffffff'); h.px(19, 10, OUTLINE).px(20, 9, OUTLINE).px(21, 9, OUTLINE).px(22, 9, OUTLINE); });
    rigMouth(h, Q, 21, 16, 2, () => h.px(21, 16, OUTLINE).px(22, 16, OUTLINE).px(23, 16, '#ffffff'));
  },
});
Object.assign(RIGGED, { shadefang: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  shadefang: { fps: 5, every: 9, frames: [{ head: [1, 1] }, { head: [1, 2], ears: [1, 1] }, { head: [1, 1] }, { head: [0, -1] }, { }] },   // sniffs the ground
});
