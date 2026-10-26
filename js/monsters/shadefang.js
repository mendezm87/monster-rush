// Shadefang: shadefang. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r247 (the owner: the traced guide version should "lean more towards the old style"): the old chibi pup's big head,
// red eyes and collar, with the guide's wolf in it: four real legs, a pointed muzzle with a fang, cheek tufts, a shaggy
// chest ruff and a bushy tail. A shade lighter than before so it reads on dark floors. Colours in FANG.
const FANG = { B: P('#46425c', '#2a2640', '#66628a'), DK: P('#34304a', '#211d33', '#4c4866'), RUFF: P('#5e5a7a', '#403c5a', '#807c9c'),
  G: P('#9a96b0', '#6a6684', '#c4c0d6'), RED: '#d2384a', EYE: '#ff3a3a', TAG: '#e8c040' };
// a hind leg seen from behind (r251, the owner: the back legs "look bad"): a rounded haunch on the rump, the leg tapering
// in to the ankle and a small paw, out = which side it's on (-1 left, 1 right), so the two lean in a little like a wolf's
function fangHind(p, x, out, C) {
  p.ellipse(x, 21.8, 3, 2.8, C, { edge: true });
  p.poly([[x - 1.8, 22.6], [x + 1.8, 22.6], [x + 1.2 - out * 0.4, 26.4], [x + 0.9 - out * 0.6, 28.6], [x - 0.9 - out * 0.6, 28.6], [x - 1.2 - out * 0.4, 26.4]], C, { edge: true });
  p.ellipse(x - out * 0.6, 29.2, 1.7, 0.9, C, { edge: true });
  p.px(Math.round(x - out * 0.6), 29, C.s);
  p.px(Math.round(x - out * 0.4), 24, C.b);   // light on the back of the thigh
}
// a leg (r248, the owner: "some fixing in the leg area"; they were thick blocks over a dark band of paws): slim and
// tapering from the body (y0) to a small paw at x in the leg's own colour with a toe line; hock = a hind leg seen
// side-on, bent back at the hock like a wolf's.
function fangLeg(p, x, y0, C, w = 1.2, hock = false) {
  if (hock) p.poly([[x - w - 0.4, y0], [x + w, y0], [x + 0.2, 25.6], [x + 0.9, 28.6], [x - 0.9, 28.6], [x - w - 0.8, 25.6]], C, { edge: true });
  else p.poly([[x - w, y0], [x + w, y0], [x + w - 0.4, 28.6], [x - w + 0.4, 28.6]], C, { edge: true });
  p.ellipse(x + (hock ? 0.3 : 0), 29.2, w + 0.6, 0.9, C, { edge: true });
  p.px(Math.round(x), 29, C.s);
}
Object.assign(MONSTER_ART, {
  shadefang(g, v = 'front') {
    const { B, DK, RUFF, G, RED, EYE, TAG } = FANG;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      fangLeg(legB, 10, 22, DK, 1.1, true); fangLeg(legA, 21.5, 21, DK, 1.1);                    // far legs, in shadow
      t.poly([[9, 19], [2.5, 12], [1, 15], [3, 17], [0, 19.5], [4, 21], [3, 24], [8, 23.5]], B, { edge: true });   // bushy tail, raised
      b.ellipse(15.5, 19.8, 7.6, 4.2, B, { edge: true });                                       // a long wolf body
      legA.ellipse(11.5, 21, 3, 3, B, { edge: true }); fangLeg(legA, 11.5, 22.5, B, 1.3, true);   // near haunch and hind leg, bent at the hock
      fangLeg(legB, 19.5, 21, B, 1.2);                                                          // near foreleg
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
    if (v === 'back') {   // r251 (the owner: from behind it "looks dumb"): a smaller head so the collar shows, a pale mane down
      // its spine, and the bushy tail swept out to the side with a pale tip, so it isn't lost against the body
      b.ellipse(16, 20.2, 7, 4.4, B, { edge: true });
      fangHind(legA, 12.3, -1, B); fangHind(legB, 19.7, 1, B);                                  // the hind legs, the forelegs hidden behind
      b.poly([[14.6, 16], [17.4, 16], [17.2, 19], [16.6, 22.4], [16, 23.4], [15.4, 22.4], [14.8, 19]], RUFF);   // mane down its spine
      b.ellipse(16, 17, 5.6, 1.4, RED);                                                         // collar
      b.px(16, 17, '#9a2434');                                                                  // its buckle
      h.poly([[10, 10.5], [7.6, 13.4], [10.8, 14]], B, { edge: true }); h.poly([[22, 10.5], [24.4, 13.4], [21.2, 14]], B, { edge: true });   // cheek tufts
      h.ellipse(16, 11, 6, 4.8, B, { edge: true });
      h.px(14, 8, B.b).px(15, 7, B.b).px(16, 7, B.b).px(17, 8, B.b);                            // a lick of lighter fur
      earA.poly([[10.5, 9.5], [8.5, 0], [11.5, 1.5], [14, 7]], B, { edge: true }); earA.poly([[10.6, 7.5], [9.6, 2.5], [11.2, 3], [12.6, 6.6]], DK);   // ears, their backs in shadow
      earB.poly([[21.5, 9.5], [23.5, 0], [20.5, 1.5], [18, 7]], B, { edge: true }); earB.poly([[21.4, 7.5], [22.4, 2.5], [20.8, 3], [19.4, 6.6]], DK);
      t.poly([[17, 23.5], [20.5, 21.5], [24, 18], [26.5, 13.5], [28.5, 15], [29.5, 18], [28, 21.5], [24.5, 24.5], [19.5, 25.5]], B, { edge: true });   // bushy tail, swept out
      t.poly([[25.5, 14.5], [26.5, 13.5], [28.5, 15], [28.8, 17], [27, 16.5]], G);              // its pale tip
      return;
    }
    t.poly([[21, 22], [27, 15], [30, 13], [29, 17], [31, 18], [28, 21], [29, 24], [25, 25]], B, { edge: true });   // bushy tail behind
    fangLeg(legB, 10.5, 23, DK, 1); fangLeg(legA, 21.5, 23, DK, 1);                             // hind legs, behind
    b.ellipse(16, 20.2, 7, 4.4, B, { edge: true });
    fangLeg(legA, 13.5, 22, B); fangLeg(legB, 18.5, 22, B);                                     // forelegs
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
      t.poly([[14, 23.5], [10.5, 21.5], [7, 18], [4.5, 13.5], [2.5, 15], [1.5, 18], [3, 21.5], [6.5, 24.5], [11.5, 25.5]], B, { edge: true });   // tail swept out behind
      t.poly([[5.5, 14.5], [4.5, 13.5], [2.5, 15], [2.2, 17], [4, 16.5]], G);
      b.ellipse(15.5, 20.2, 7, 4.4, B, { edge: true });
      fangHind(legA, 11.8, -1, B); fangHind(legB, 19.2, 1, B);
      b.poly([[15.1, 16], [17.9, 16], [17.7, 19], [17.1, 22.4], [16.5, 23.4], [15.9, 22.4], [15.3, 19]], RUFF);
      b.ellipse(16.5, 17, 5.6, 1.4, RED);
      h.poly([[22.5, 12.5], [27, 13.5], [22.5, 15.5]], B, { edge: true });                       // snout peeking out
      h.poly([[11.5, 10.5], [9.1, 13.4], [12.3, 14]], B, { edge: true });
      h.ellipse(17.5, 11, 6, 4.8, B, { edge: true });
      h.px(16, 8, B.b).px(17, 7, B.b).px(18, 7, B.b);
      earB.poly([[12, 9.5], [10, 0], [13, 1.5], [15.5, 7]], B, { edge: true }); earB.poly([[12.1, 7.5], [11.1, 2.5], [12.7, 3], [14.1, 6.6]], DK);
      earA.poly([[23, 9.5], [25, 0.5], [22, 1.5], [19.5, 7]], B, { edge: true }); earA.poly([[22.9, 7.5], [23.9, 3], [22.3, 3], [20.9, 6.6]], DK);
      return;
    }
    t.poly([[10, 20], [3, 13], [2, 16], [4, 18], [1, 20.5], [5, 22], [5, 25], [9, 24]], B, { edge: true });   // bushy tail
    fangLeg(legB, 10, 23, DK, 1, true); fangLeg(legA, 22, 22, DK, 1);                           // far legs
    b.ellipse(15.5, 20.2, 7.2, 4.4, B, { edge: true });
    fangLeg(legA, 12.5, 22.5, B, 1.2, true); fangLeg(legB, 18.5, 22, B, 1.2);                   // near legs
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
