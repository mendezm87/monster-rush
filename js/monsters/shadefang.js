// Shadefang: shadefang. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  shadefang(g, v = 'front') {
    const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);
      earB.poly([[14, 10], [12, 1], [17, 7]], B);
      b.ellipse(15, 22, 8, 6.5, B, { edge: true });
      legB.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legA.ellipse(19, 28.5, 2.5, 1.5, '#24203a');
      b.ellipse(18, 18, 4, 2, '#d2384a');
      earA.poly([[17, 9], [19, 1], [21, 8]], B, { edge: true }); earA.px(19, 4, '#d2384a'); earA.px(19, 5, '#d2384a');
      h.ellipse(19, 13, 6.5, 5.5, B, { edge: true });
      h.poly([[22, 12], [28, 15], [22, 17]], B, { edge: true });
      h.ellipse(24, 16, 3, 1.5, G);
      rigEye(h, Q, 21, 12, () => { h.rect(21, 12, 2, 3, '#ff3a3a'); h.px(21, 12, '#ffffff'); });
      h.px(20, 10, OUTLINE); h.px(21, 10, OUTLINE); h.px(22, 11, OUTLINE);
      rigMouth(h, Q, 25, 15, 2, () => h.px(28, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[11, 10], [9, 1], [15, 7]], B); earB.poly([[21, 10], [23, 1], [17, 7]], B);
      earA.px(10, 4, '#d2384a').px(10, 5, '#d2384a'); earB.px(21, 4, '#d2384a').px(21, 5, '#d2384a');
      b.ellipse(16, 22, 8, 6.5, B, { edge: true });
      b.ellipse(16, 18, 6, 2, '#d2384a');
      h.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
      legA.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legB.ellipse(21, 28.5, 2.5, 1.5, '#24203a');
      t.poly([[14, 25], [19, 15], [22, 12], [19, 24]], B, { edge: true });
      return;
    }
    t.poly([[21, 22], [31, 13], [28, 22], [24, 26]], B);
    earA.poly([[11, 10], [9, 1], [15, 7]], B); earB.poly([[21, 10], [23, 1], [17, 7]], B);
    earA.px(10, 4, '#d2384a').px(10, 5, '#d2384a'); earB.px(21, 4, '#d2384a').px(21, 5, '#d2384a');
    b.ellipse(16, 22, 8, 6.5, B, { edge: true });
    b.ellipse(16, 18, 6, 2, '#d2384a');                                                         // collar
    h.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
    h.ellipse(16, 16, 3, 2, G);
    rigEyes(h, Q, 32, 12, 12, 2, () => h.eyes(12, 12, '#ff3a3a', { brow: true }));
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
    legA.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legB.ellipse(21, 28.5, 2.5, 1.5, '#24203a');
  },
});
Object.assign(MONSTER_ART_DIAG, {
  shadefang(g, v) {
    const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8'), RED = '#d2384a';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const ears = () => {
      earB.poly([[11, 10], [9, 1], [15, 7]], B); earB.px(10, 4, RED); earB.px(10, 5, RED);
      earA.poly([[19, 9], [22, 1], [24, 8]], B, { edge: true }); earA.px(22, 4, RED);
    };
    const feet = () => { legB.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); legA.ellipse(19, 28.5, 2.3, 1.4, '#24203a'); };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 22, 8, 6.5, B, { edge: true });
      b.ellipse(17, 18, 6, 2, RED);
      h.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
      h.poly([[23, 13], [27, 15], [23, 17]], B, { edge: true });                                 // snout peeking out
      feet();
      t.poly([[11, 25], [16, 15], [19, 12], [16, 24]], B, { edge: true });                       // tail
      return;
    }
    t.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);                                            // tail
    ears();
    b.ellipse(15, 22, 8, 6.5, B, { edge: true });
    b.ellipse(17, 18, 6, 2, RED);                                                                // collar
    h.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
    h.ellipse(20, 16, 3.2, 2, G);                                                                // muzzle, turned its way
    rigEye(h, Q, 15, 12, () => { h.rect(15, 12, 2, 3, '#ff3a3a'); h.px(15, 12, '#ffffff'); });
    rigEye(h, Q, 21, 12, () => { h.rect(21, 12, 2, 3, '#ff3a3a'); h.px(21, 12, '#ffffff'); });
    h.px(14, 10, OUTLINE).px(15, 10, OUTLINE).px(16, 11, OUTLINE).px(17, 11, OUTLINE);           // angry brows
    h.px(23, 10, OUTLINE).px(22, 10, OUTLINE).px(21, 11, OUTLINE).px(20, 11, OUTLINE);
    rigMouth(h, Q, 20, 15, 2, () => h.px(20, 15, OUTLINE).px(21, 15, OUTLINE));
    feet();
  },
});
Object.assign(RIGGED, { shadefang: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  shadefang: { fps: 5, every: 9, frames: [{ head: [1, 1] }, { head: [1, 2], ears: [1, 1] }, { head: [1, 1] }, { head: [0, -1] }, { }] },   // sniffs the ground
});
