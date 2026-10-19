// Frostling: frostling. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  frostling(g, v = 'front') {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.ellipse(6, 19, 5, 7.5, Cr);
      earB.poly([[13, 10], [11, 2], [16, 8]], B);
      b.ellipse(15, 23, 6.5, 6, B, { edge: true });
      legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18, 29, 2.5, 1.5, '#5ea8cc');
      earA.poly([[17, 10], [18, 1], [22, 9]], B, { edge: true });
      h.ellipse(18, 14, 7.5, 6, B, { edge: true });
      h.poly([[22, 13], [28, 16], [22, 18]], B, { edge: true });
      h.poly([[16, 9], [19, 2], [20, 9]], Cr, { edge: true });
      h.poly([[19, 17], [15, 21], [21, 20]], Cr);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#1a3a5a'); h.px(21, 13, '#ffffff'); });
      rigMouth(h, Q, 25, 16, 2, () => h.px(27, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      legA.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legB.ellipse(20, 29, 2.5, 1.5, '#5ea8cc');
      h.ellipse(16, 14, 7.5, 6, B, { edge: true });
      h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
      t.ellipse(16, 21, 5, 7.5, Cr, { edge: true });
      return;
    }
    t.ellipse(25, 19, 5, 7.5, Cr);                                                              // fluffy tail
    earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
    b.ellipse(16, 23, 6.5, 6, B, { edge: true });
    h.ellipse(16, 14, 7.5, 6, B, { edge: true });
    h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
    h.polyM([[9, 17], [5, 20], [10, 20]], Cr);                                                  // cheek frost
    legA.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legB.ellipse(20, 29, 2.5, 1.5, '#5ea8cc');
    rigEyes(h, Q, 32, 12, 13, 2, () => h.eyes(12, 13, '#1a3a5a'));
    rigMouth(h, Q, 15, 17, 2, () => h.px(15, 17, OUTLINE).px(16, 17, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  frostling(g, v) {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const ears = () => { earB.poly([[10, 10], [7, 1], [14, 8]], B); earA.poly([[19, 9], [23, 1], [24, 8]], B); };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
      h.ellipse(17, 14, 7.5, 6, B, { edge: true });
      h.poly([[23, 14], [26, 16], [23, 17]], B, { edge: true });                                 // snout peeking out
      h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
      t.ellipse(12, 21, 5, 7.5, Cr, { edge: true });                                             // fluffy tail
      return;
    }
    t.ellipse(7, 19, 5, 7.5, Cr);                                                                // fluffy tail
    ears();
    b.ellipse(15, 23, 6.5, 6, B, { edge: true });
    h.ellipse(17, 14, 7.5, 6, B, { edge: true });
    h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
    h.poly([[10, 17], [6, 20], [11, 20]], Cr);                                                   // cheek frost
    legB.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); legA.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 3, '#1a3a5a'); h.px(14, 13, '#ffffff'); });
    rigEye(h, Q, 20, 13, () => { h.rect(20, 13, 2, 3, '#1a3a5a'); h.px(20, 13, '#ffffff'); });
    rigMouth(h, Q, 18, 17, 2, () => h.px(18, 17, OUTLINE).px(19, 17, OUTLINE));
  },
});
Object.assign(RIGGED, { frostling: 'quad' });
