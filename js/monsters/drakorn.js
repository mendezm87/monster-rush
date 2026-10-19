// Drakorn: drakorn. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  drakorn(g, v = 'front') {
    const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const spine = x => { for (const y of [8, 11, 17]) (y < 15 ? h : b).rect(x, y, 2, 1, '#c45e1e'); };
    if (v === 'side') {
      wingPoly(b, [[12, 18], [2, 5], [4, 19]], W);
      t.poly([[10, 26], [1, 30], [8, 22]], O);
      earA.poly([[17, 9], [13, 1], [19, 6]], C, { edge: true });
      b.ellipse(15, 23, 8, 7.5, O, { edge: true });
      b.ellipse(19, 25, 3.5, 5.5, C);
      legB.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); legA.ellipse(19, 30, 2.5, 1.5, '#c45e1e');
      h.ellipse(19, 12, 7, 6, O, { edge: true });
      h.ellipse(24, 14, 3.5, 2.5, C);
      rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
      h.px(20, 8, OUTLINE); h.px(21, 8, OUTLINE); h.px(22, 9, OUTLINE);
      rigMouth(h, Q, 24, 13, 2, () => h.px(26, 13, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[13, 9], [9, 1], [15, 6]], C, { edge: true }); earB.poly([[19, 9], [23, 1], [17, 6]], C, { edge: true });
      b.ellipse(16, 23, 8, 7.5, O, { edge: true });
      legA.ellipse(11, 30, 2.5, 1.5, '#c45e1e'); legB.ellipse(21, 30, 2.5, 1.5, '#c45e1e');
      h.ellipse(16, 12, 7, 6, O, { edge: true });
      t.poly([[14, 27], [18, 27], [16, 32]], O, { edge: true });
      spine(15);
      wingPolyM(b, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });
      return;
    }
    wingPolyM(b, [[10, 17], [0, 5], [2, 19]], W);
    t.poly([[21, 26], [31, 30], [24, 22]], O);
    earA.poly([[13, 9], [9, 1], [15, 6]], C, { edge: true }); earB.poly([[19, 9], [23, 1], [17, 6]], C, { edge: true });
    b.ellipse(16, 23, 8, 7.5, O, { edge: true });
    b.ellipse(16, 25, 5, 5.5, C);
    h.ellipse(16, 12, 7, 6, O, { edge: true });
    h.ellipse(16, 15, 4, 2.2, C);
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
    legA.ellipse(11, 30, 2.5, 1.5, '#c45e1e'); legB.ellipse(21, 30, 2.5, 1.5, '#c45e1e');
  },
});
Object.assign(MONSTER_ART_DIAG, {
  drakorn(g, v) {
    const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const horns = () => { earB.poly([[12, 9], [8, 1], [14, 6]], C, { edge: true }); earA.poly([[20, 8], [23, 1], [24, 7]], C, { edge: true }); };
    const feet = () => { legB.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); legA.ellipse(19.5, 30, 2.3, 1.4, '#c45e1e'); };
    if (v === 'bside') {
      horns();
      b.ellipse(16, 23, 8, 7.5, O, { edge: true });
      feet();
      h.ellipse(17.5, 12, 7, 6, O, { edge: true });
      h.ellipse(24, 14, 1.6, 1.4, C);                                                            // snout peeking out
      t.poly([[13, 27], [17, 27], [11, 32]], O, { edge: true });                                 // tail
      for (const y of [8, 11, 17]) (y < 15 ? h : b).rect(16, y, 2, 1, '#c45e1e');
      wingPoly(b, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });                     // wings
      wingPoly(b, [[21, 18], [30, 6], [29, 19], [22, 23]], W, { edge: true });
      return;
    }
    wingPoly(b, [[9, 17], [0, 5], [2, 19]], W); wingPoly(b, [[21, 15], [29, 4], [27, 17]], W);   // wings
    t.poly([[10, 26], [1, 30], [8, 22]], O);                                                     // tail
    horns();
    b.ellipse(15, 23, 8, 7.5, O, { edge: true });
    b.ellipse(17.5, 25, 4.5, 5.5, C);
    h.ellipse(17.5, 12, 7, 6, O, { edge: true });
    h.ellipse(20, 15, 4, 2.2, C);                                                                // snout, turned its way
    rigEye(h, Q, 14, 10, () => { h.rect(14, 10, 2, 3, DARK_EYE); h.px(14, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);               // brows
    h.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    rigMouth(h, Q, 20, 15, 2, () => h.px(20, 15, OUTLINE).px(21, 15, OUTLINE));
    feet();
  },
});
Object.assign(RIGGED, { drakorn: 'flier' });
