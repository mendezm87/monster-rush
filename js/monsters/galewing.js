// Galewing: galewing. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  galewing(g, v = 'front') {
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[12, 23], [1, 29], [5, 21]], B);
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      b.ellipse(19.5, 22, 3.5, 5, '#f4f0e6');
      h.poly([[16, 7], [13, 0], [18, 4], [20, 1], [20, 7]], B);
      h.ellipse(19, 11, 6.5, 6, B, { edge: true });
      h.poly([[24, 10], [30, 12], [24, 14]], Y);
      rigEye(h, Q, 20, 9, () => { h.rect(20, 9, 2, 3, DARK_EYE); h.px(20, 9, '#ffffff'); });
      h.px(19, 7, OUTLINE); h.px(20, 7, OUTLINE); h.px(21, 8, OUTLINE);
      rigMouth(h, Q, 24, 12, 2);
      wingPoly(b, [[9, 16], [21, 18], [17, 25], [7, 24]], Wg, { edge: true }, { root: [19, 18], swing: -0.6 });
      FLAP || b.px(11, 21, '#a8b4e0'); FLAP || b.px(14, 20, '#a8b4e0');
      legB.rect(14, 28, 2, 2, Y); legA.rect(19, 28, 2, 2, Y);
      return;
    }
    if (v === 'back') {
      h.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      h.ellipse(16, 11, 6.5, 6, B, { edge: true });
      legA.rect(12, 28, 2, 2, Y); legB.rect(18, 28, 2, 2, Y);
      t.poly([[13, 25], [16, 31], [19, 25]], B, { edge: true });
      wingPolyM(b, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });
      FLAP || b.pxM(3, 13, '#a8b4e0'); FLAP || b.pxM(5, 18, '#a8b4e0'); FLAP || b.pxM(8, 16, '#a8b4e0');
      return;
    }
    t.poly([[20, 23], [31, 29], [27, 21]], B);                                                  // tail feathers
    wingPolyM(b, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });           // spread wings
    FLAP || b.pxM(3, 13, '#a8b4e0'); FLAP || b.pxM(4, 18, '#a8b4e0');
    h.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);                                   // crest
    b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });                                             // body
    b.ellipse(16, 22, 4.5, 5, '#f4f0e6');                                                       // belly
    h.ellipse(16, 11, 6.5, 6, B, { edge: true });                                               // head
    h.poly([[14, 13], [19, 13], [16, 17]], Y);                                                  // beak
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 15, 15, 2);
    legA.rect(12, 28, 2, 2, Y); legB.rect(18, 28, 2, 2, Y);                                     // feet
  },
});
Object.assign(MONSTER_ART_DIAG, {
  galewing(g, v) {
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const crest = () => h.poly([[16, 7], [14, 0], [18, 4], [21, 0], [20, 7]], B);
    const feet = () => { legB.rect(13, 28, 2, 2, Y); legA.rect(19, 28, 2, 2, Y); };
    if (v === 'bside') {
      crest();
      b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      h.ellipse(18, 11, 6.5, 6, B, { edge: true });
      h.poly([[24, 11], [27, 12], [24, 14]], Y);                                                 // beak peeking out
      feet();
      t.poly([[11, 25], [13, 31], [16, 25]], B, { edge: true });                                 // tail
      wingPoly(b, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });          // wings
      wingPoly(b, [[20, 17], [31, 9], [30, 17], [22, 23]], Wg, { edge: true });
      FLAP || b.px(3, 13, '#a8b4e0'); FLAP || b.px(5, 18, '#a8b4e0'); FLAP || b.px(8, 16, '#a8b4e0'); FLAP || b.px(27, 14, '#a8b4e0');
      return;
    }
    t.poly([[12, 23], [1, 29], [5, 21]], B);                                                     // tail feathers
    wingPoly(b, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });             // spread wings
    wingPoly(b, [[22, 16], [30, 9], [29, 17], [24, 23]], Wg, { edge: true });
    FLAP || b.px(3, 13, '#a8b4e0'); FLAP || b.px(4, 18, '#a8b4e0');
    crest();
    b.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
    b.ellipse(18, 22, 4.5, 5, '#f4f0e6');
    h.ellipse(18, 11, 6.5, 6, B, { edge: true });
    h.poly([[18, 13], [23, 13], [21, 17]], Y);                                                   // beak, turned its way
    rigEye(h, Q, 14, 10, () => { h.rect(14, 10, 2, 3, DARK_EYE); h.px(14, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 3, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);               // brows
    h.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    rigMouth(h, Q, 20, 14, 2);
    feet();
  },
});
Object.assign(RIGGED, { galewing: 'flier' });
