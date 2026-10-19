// Mindra: mindra. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  mindra(g, v = 'front') {
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);
      earB.poly([[13, 8], [10, 0], [16, 5]], B);
      b.ellipse(15, 23, 5, 6.5, B, { edge: true });
      legB.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legA.ellipse(18, 29.5, 2, 1.2, '#9058b8');
      earA.poly([[17, 7], [19, 0], [22, 6]], B, { edge: true });
      h.ellipse(18, 12, 8, 7, B, { edge: true });
      h.ellipse(22, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(21, 8, '#ffd0dc');
      rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 4, '#5a1a8a'); h.px(21, 11, '#ffffff'); });
      rigMouth(h, Q, 23, 16, 2, () => h.px(25, 16, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 8], [5, 0], [13, 5]], B); earB.poly([[22, 8], [27, 0], [19, 5]], B);
      b.ellipse(16, 23, 5, 6.5, B, { edge: true });
      legA.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legB.ellipse(19, 29.5, 2, 1.2, '#9058b8');
      h.ellipse(16, 12, 8, 7, B, { edge: true });
      t.poly([[15, 27], [23, 22], [20, 15], [25, 11], [18, 19], [21, 23], [14, 25]], B, { edge: true });
      return;
    }
    t.poly([[19, 24], [30, 17], [27, 23], [31, 27], [21, 28]], B);
    earA.poly([[10, 8], [5, 0], [13, 5]], B); earB.poly([[22, 8], [27, 0], [19, 5]], B);
    b.ellipse(16, 23, 5, 6.5, B, { edge: true });
    h.ellipse(16, 12, 8, 7, B, { edge: true });
    h.ellipse(16, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(15, 8, '#ffd0dc');
    rigEyes(h, Q, 32, 11, 11, 2, () => h.eyes(11, 11, '#5a1a8a', { h: 4 }));
    rigMouth(h, Q, 15, 16, 2, () => h.px(16, 16, OUTLINE));
    legA.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legB.ellipse(19, 29.5, 2, 1.2, '#9058b8');
  },
});
Object.assign(MONSTER_ART_DIAG, {
  mindra(g, v) {
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const feet = () => { legB.ellipse(13, 29.5, 2, 1.2, '#9058b8'); legA.ellipse(18.5, 29.5, 1.8, 1.1, '#9058b8'); };
    if (v === 'bside') {
      earB.poly([[10, 8], [5, 0], [13, 5]], B); earA.poly([[19, 7], [23, 0], [24, 6]], B);
      b.ellipse(16, 23, 5, 6.5, B, { edge: true });
      feet();
      h.ellipse(17, 12, 8, 7, B, { edge: true });
      t.poly([[12, 27], [20, 22], [17, 15], [22, 11], [15, 19], [18, 23], [11, 25]], B, { edge: true });   // tail
      return;
    }
    t.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);                                  // tail
    earB.poly([[10, 8], [5, 0], [13, 5]], B); earA.poly([[19, 7], [23, 0], [24, 6]], B);        // ears
    b.ellipse(15, 23, 5, 6.5, B, { edge: true });
    h.ellipse(17, 12, 8, 7, B, { edge: true });
    h.ellipse(18.5, 8.5, 1.6, 1.6, '#ff3a6a'); h.px(18, 8, '#ffd0dc');                           // forehead gem
    rigEye(h, Q, 13, 11, () => { h.rect(13, 11, 2, 4, '#5a1a8a'); h.px(13, 11, '#ffffff'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 4, '#5a1a8a'); h.px(21, 11, '#ffffff'); });
    rigMouth(h, Q, 18, 16, 2, () => h.px(19, 16, OUTLINE));
    feet();
  },
});
Object.assign(RIGGED, { mindra: 'biped' });
