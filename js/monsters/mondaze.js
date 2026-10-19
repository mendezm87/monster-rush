// Mondaze: mondaze. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // An exhausted sloth clinging to its coffee: dark eye bands that double as
  // tired bags, droopy half-shut eyes, a frown and messy bed hair.
  mondaze(g, v = 'front') {
    const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const fur = pts => { for (const [x, y] of pts) { const p = y < 16 ? h : b; p.px(x, y, '#6e6052'); p.px(x + 1, y + 1, '#6e6052'); } };
    if (v === 'side') {
      legB.ellipse(12, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 3, 1.6, F, { edge: true });
      b.ellipse(15, 22, 9, 7.5, F, { edge: true });
      b.ellipse(18, 24, 4, 4.5, '#b0a090');
      h.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
      h.ellipse(18, 11, 8.5, 7, F, { edge: true });
      h.ellipse(21, 12, 5.5, 5, C);
      h.poly([[18, 10], [24, 10], [24, 14], [20, 14]], '#4a3a30');
      rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 1, '#1a1222'); h.rect(21, 12, 2, 1, '#7a6a8a'); });
      h.rect(25, 13, 2, 1, OUTLINE);
      rigMouth(h, Q, 23, 16, 3, () => h.px(23, 17, OUTLINE).px(24, 16, OUTLINE).px(25, 17, OUTLINE));
      armA.ellipse(20, 21, 2.5, 4, F, { edge: true });
      b.poly([[22, 20], [27, 20], [27, 26], [22, 26]], M, { edge: true });
      b.rect(28, 21, 1, 3, '#24766f'); b.rect(23, 20, 3, 1, '#5a3a22');
      b.px(23, 18, '#eef2f6').px(24, 17, '#eef2f6').px(26, 18, '#eef2f6');
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 29, 3, 1.6, F, { edge: true }); legB.ellipse(21, 29, 3, 1.6, F, { edge: true });
      b.ellipse(16, 22, 9, 7.5, F, { edge: true });
      armA.ellipse(8, 21, 2.5, 4, F, { edge: true }); armB.ellipse(24, 21, 2.5, 4, F, { edge: true });
      h.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);
      h.ellipse(16, 11, 8.5, 7, F, { edge: true });
      fur([[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]);
      return;
    }
    legA.ellipse(11, 29, 3, 1.6, F, { edge: true }); legB.ellipse(21, 29, 3, 1.6, F, { edge: true });   // feet
    b.ellipse(16, 22, 9, 7.5, F, { edge: true });                                               // slumped body
    b.ellipse(16, 24, 5, 4.5, '#b0a090');                                                       // belly
    h.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);                 // bed hair
    h.ellipse(16, 11, 8.5, 7, F, { edge: true });                                               // head
    h.ellipse(16, 12, 6.5, 5, C);                                                               // face
    h.polyM([[8, 10], [14, 10], [14, 14], [10, 14]], '#4a3a30');                                 // droopy eye bands
    rigEyes(h, Q, 32, 11, 11, 2, () => { h.rectM(11, 11, 2, 1, '#1a1222'); h.rectM(11, 12, 2, 1, '#7a6a8a'); });   // half-shut eyes, eye bags
    h.rect(15, 14, 2, 1, OUTLINE);                                                              // nose
    rigMouth(h, Q, 14, 16, 4, () => h.px(14, 17, OUTLINE).px(15, 16, OUTLINE).px(16, 16, OUTLINE).px(17, 17, OUTLINE));   // frown
    armA.ellipse(9, 21, 2.5, 4, F, { edge: true }); armB.ellipse(23, 21, 2.5, 4, F, { edge: true });   // arms
    b.poly([[13, 21], [19, 21], [19, 27], [13, 27]], M, { edge: true });                        // coffee mug
    b.rect(20, 22, 1, 3, '#24766f'); b.px(19, 22, '#24766f'); b.px(19, 24, '#24766f');          // handle
    b.rect(14, 21, 4, 1, '#5a3a22');                                                            // coffee
    armA.px(12, 24, '#e8dcc6'); armB.px(19, 24, '#e8dcc6');                                     // claws round the mug
    b.px(14, 19, '#eef2f6').px(15, 18, '#eef2f6').px(17, 19, '#eef2f6').px(18, 18, '#eef2f6');  // steam
  },
});
Object.assign(MONSTER_ART_DIAG, {
  mondaze(g, v) {
    const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const hair = () => h.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
    if (v === 'bside') {
      legB.ellipse(11, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 2.8, 1.5, F, { edge: true });
      b.ellipse(16, 22, 9, 7.5, F, { edge: true });
      armB.ellipse(8, 21, 2.5, 4, F, { edge: true }); armA.ellipse(24.5, 21, 2.2, 3.6, F, { edge: true });
      hair();
      h.ellipse(17, 11, 8.5, 7, F, { edge: true });
      h.ellipse(24, 13, 1.6, 2.5, C);                                                            // face peeking out
      for (const [x, y] of [[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]) { const p = y < 16 ? h : b; p.px(x, y, '#6e6052'); p.px(x + 1, y + 1, '#6e6052'); }
      return;
    }
    legB.ellipse(12, 29, 3, 1.6, F, { edge: true }); legA.ellipse(20, 29, 2.8, 1.5, F, { edge: true }); // feet
    b.ellipse(16, 22, 9, 7.5, F, { edge: true });                                                // slumped body
    b.ellipse(18, 24, 5, 4.5, '#b0a090');
    hair();
    h.ellipse(17, 11, 8.5, 7, F, { edge: true });
    h.ellipse(19, 12, 6.5, 5, C);                                                                // face, turned its way
    h.poly([[11, 10], [17, 10], [17, 14], [13, 14]], '#4a3a30'); h.poly([[20, 10], [25, 10], [24, 14], [20, 14]], '#4a3a30');   // droopy eye bands
    rigEye(h, Q, 14, 11, () => { h.rect(14, 11, 2, 1, '#1a1222'); h.rect(14, 12, 2, 1, '#7a6a8a'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 1, '#1a1222'); h.rect(21, 12, 2, 1, '#7a6a8a'); });
    h.rect(18, 14, 2, 1, OUTLINE);
    rigMouth(h, Q, 17, 16, 4, () => h.px(17, 17, OUTLINE).px(18, 16, OUTLINE).px(19, 16, OUTLINE).px(20, 17, OUTLINE));   // frown
    armB.ellipse(11, 21, 2.5, 4, F, { edge: true }); armA.ellipse(24, 21, 2.2, 3.6, F, { edge: true }); // arms
    b.poly([[16, 21], [22, 21], [22, 27], [16, 27]], M, { edge: true });                         // coffee mug
    b.rect(23, 22, 1, 3, '#24766f'); b.px(22, 22, '#24766f'); b.px(22, 24, '#24766f');
    b.rect(17, 21, 4, 1, '#5a3a22');
    armB.px(15, 24, '#e8dcc6'); armA.px(23, 25, '#e8dcc6');                                      // claws round the mug
    b.px(17, 19, '#eef2f6').px(18, 18, '#eef2f6').px(20, 19, '#eef2f6').px(21, 18, '#eef2f6');  // steam
  },
});
Object.assign(RIGGED, { mondaze: 'biped' });
