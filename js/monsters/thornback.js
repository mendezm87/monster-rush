// Thornback: thornback. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  thornback(g, v = 'front') {
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const plates = pts => { for (const [x, y] of pts) { b.px(x, y, '#2a6b2a'); b.px(x + 1, y, '#2a6b2a'); b.px(x, y + 1, '#2a6b2a'); } };
    if (v === 'side') {
      t.poly([[4, 22], [0, 24], [4, 26]], T);
      earB.poly([[9, 13], [4, 4], [12, 11]], L); earA.poly([[13, 11], [13, 1], [18, 10]], L);
      legB.ellipse(9, 28, 3, 2.5, T, { edge: true }); legA.ellipse(20, 28, 3, 2.5, T, { edge: true });
      b.ellipse(15, 19, 12, 9, S, { edge: true });
      plates([[9, 16], [15, 13], [20, 16], [11, 21], [17, 21]]);
      h.ellipse(26, 23, 4.5, 4, T, { edge: true });
      rigEye(h, Q, 27, 21, () => { h.rect(27, 21, 1, 2, DARK_EYE); h.px(27, 21, '#ffffff'); }, 1);
      rigMouth(h, Q, 28, 24, 2, () => h.px(29, 24, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 13], [6, 3], [14, 10]], L); earB.poly([[22, 13], [26, 3], [18, 10]], L);
      b.poly([[13, 11], [16, 1], [19, 11]], L);
      legA.ellipse(8, 28, 3, 2.5, T, { edge: true }); legB.ellipse(24, 28, 3, 2.5, T, { edge: true });
      b.ellipse(16, 19, 12, 9, S, { edge: true });
      plates([[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]);
      t.poly([[15, 26], [16, 30], [17, 26]], T);
      return;
    }
    earA.poly([[10, 13], [6, 3], [14, 10]], L); earB.poly([[22, 13], [26, 3], [18, 10]], L);   // leaves
    b.poly([[13, 11], [16, 1], [19, 11]], L);
    legA.ellipse(8, 28, 3, 2.5, T, { edge: true }); legB.ellipse(24, 28, 3, 2.5, T, { edge: true });
    b.ellipse(16, 19, 12, 9, S, { edge: true });
    plates([[11, 15], [16, 13], [21, 15], [13, 20], [19, 20]]);                                 // shell plates
    h.ellipse(16, 23, 5.5, 4.5, T, { edge: true });
    rigEyes(h, Q, 32, 13, 22, 1, () => { h.rectM(13, 22, 1, 2, DARK_EYE); h.pxM(13, 22, '#ffffff'); });
    rigMouth(h, Q, 15, 25, 2, () => h.px(15, 25, OUTLINE).px(16, 25, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  thornback(g, v) {
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const plates = pts => { for (const [x, y] of pts) { b.px(x, y, '#2a6b2a'); b.px(x + 1, y, '#2a6b2a'); b.px(x, y + 1, '#2a6b2a'); } };
    const leaves = () => { earB.poly([[9, 13], [5, 3], [13, 10]], L); b.poly([[14, 11], [17, 1], [20, 11]], L); earA.poly([[20, 12], [23, 3], [26, 11]], L); };
    if (v === 'bside') {
      leaves();
      legB.ellipse(8, 28, 3, 2.5, T, { edge: true }); legA.ellipse(22, 28.5, 3, 2.5, T, { edge: true });
      h.ellipse(26, 23, 3.5, 3.2, T, { edge: true });                                            // head, mostly hidden
      b.ellipse(16, 19, 12, 9, S, { edge: true });
      plates([[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]);
      t.poly([[9, 25], [6, 30], [11, 27]], T);                                                   // tail
      return;
    }
    t.poly([[4, 22], [0, 24], [4, 26]], T);                                                      // tail
    leaves();
    legB.ellipse(8, 28, 3, 2.5, T, { edge: true }); legA.ellipse(21, 28.5, 3, 2.5, T, { edge: true });
    b.ellipse(15, 19, 12, 9, S, { edge: true });
    plates([[9, 15], [15, 13], [20, 15], [11, 20], [17, 20]]);
    h.ellipse(20, 23.5, 5, 4.2, T, { edge: true });                                              // head, turned its way
    rigEye(h, Q, 18, 22, () => { h.rect(18, 22, 1, 2, DARK_EYE); h.px(18, 22, '#ffffff'); }, 1);
    rigEye(h, Q, 22, 22, () => { h.rect(22, 22, 1, 2, DARK_EYE); h.px(22, 22, '#ffffff'); }, 1);
    rigMouth(h, Q, 20, 25, 2, () => h.px(20, 25, OUTLINE).px(21, 25, OUTLINE));
  },
});
Object.assign(RIGGED, { thornback: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  thornback: { fps: 5, every: 10, frames: [{ ears: [1, 0] }, { ears: [0, 1] }, { ears: [1, 0] }, { ears: [0, 1] }, { }] },   // rustles its leaves
});
