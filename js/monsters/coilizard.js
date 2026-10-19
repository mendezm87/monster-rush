// Coilizard: coilizard. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Coilizard (r48, from the owner's pick): a lime-green gecko crouched low like a predator, a wedge
  // head with big golden slit eyes on the sides, copper zigzag stripes, splayed sticky toes, and a
  // tail coiled like a metal spring with a glowing blue core.
  coilizard(g, v = 'front') {
    const G = P('#9ad84a', '#64a02a', '#cff48a'), BL = '#e8f4c0', Cu = '#c8702a', M = P('#c8d0dc', '#8a94a8', '#f0f4fa'), BAND = '#5a6478', CORE = '#7ae8ff', EYE = '#ffc020';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const coil = (cx, cy) => { t.ellipse(cx, cy, 5, 5, M, { edge: true }); t.ellipse(cx, cy, 3.2, 3.2, BAND); t.ellipse(cx, cy, 2.2, 2.2, M); t.ellipse(cx, cy, 1.2, 1.2, CORE); t.px(cx - 4, cy - 1, BAND).px(cx + 3, cy - 4, BAND).px(cx + 4, cy + 2, BAND); };
    const zig = (p, x0, y, n) => { for (let i = 0; i < n; i++) p.px(x0 + i, y + (i % 2), Cu); };
    if (v === 'side') {
      t.ellipse(6, 20, 1.8, 3, M, { edge: true });                                               // tail rising into the coil
      coil(6, 13);
      legA.ellipse(8, 26, 2, 1.4, G.s); legB.ellipse(18, 26, 2, 1.4, G.s);                       // far legs
      b.ellipse(14, 22.5, 9, 3.6, G, { edge: true });                                            // long, low body
      b.ellipse(15, 24.5, 6, 1.4, BL);
      zig(b, 8, 19, 12);                                                                         // copper stripe down the back
      legB.ellipse(10.5, 27, 2.4, 1.6, G, { edge: true }); legA.ellipse(20.5, 27, 2.4, 1.6, G, { edge: true });   // near legs
      legB.px(9, 28, BL).px(12, 28, BL); legA.px(19, 28, BL).px(22, 28, BL);                     // sticky toe pads
      h.poly([[20, 18], [23, 15], [28, 16], [30, 19], [25, 22], [20, 22]], G, { edge: true });  // wedge head
      h.ellipse(26, 21, 3, 1, BL);
      rigEye(h, Q, 23, 16, () => { h.ellipse(24, 17, 2, 2, EYE, { edge: true }); h.rect(24, 16, 1, 3, DARK_EYE); h.px(23, 16, '#ffffff'); }, 3);
      rigMouth(h, Q, 25, 20, 4, () => h.rect(25, 20, 5, 1, OUTLINE));
      return;
    }
    if (v === 'back') {
      legA.ellipse(8, 26, 3, 2, G, { edge: true }); legB.ellipse(24, 26, 3, 2, G, { edge: true });
      b.ellipse(16, 22, 7, 5, G, { edge: true });
      for (let y = 18; y < 26; y += 2) b.px(15, y, Cu).px(16, y + 1, Cu).px(17, y, Cu);         // zigzag down the spine
      h.ellipse(16, 15.5, 5, 3.5, G, { edge: true });
      h.ellipseM(11.5, 15, 1.4, 1.6, EYE);                                                        // eyes peeking out at the sides
      coil(16, 8);
      return;
    }
    t.ellipse(21, 18, 2, 2, M, { edge: true });                                                  // tail rising behind into the coil
    coil(24, 12);
    legA.ellipse(8, 26, 3, 2, G, { edge: true }); legB.ellipse(24, 26, 3, 2, G, { edge: true });   // splayed front legs
    legA.px(6, 27, BL).px(9, 27, BL); legB.px(22, 27, BL).px(25, 27, BL);                         // sticky toe pads
    b.ellipse(16, 23, 7, 4.5, G, { edge: true });                                                // low body
    b.ellipse(16, 24.5, 4, 2.4, BL);
    zig(b, 11, 20, 3); zig(b, 19, 20, 3);
    h.poly([[8, 18], [11, 13], [16, 10], [21, 13], [24, 18], [16, 21]], G, { edge: true });     // a wedge of a head
    h.ellipse(16, 19, 4, 1.5, BL);
    zig(h, 14, 12, 5);                                                                           // copper crest
    rigEyes(h, Q, 32, 7, 15, 4, () => { h.ellipseM(9, 16, 2.4, 2.4, EYE, { edge: true }); h.rectM(9, 15, 1, 3, DARK_EYE); h.pxM(8, 15, '#ffffff'); });   // big golden slit eyes, low on the sides
    rigMouth(h, Q, 13, 18, 6, () => h.rect(12, 18, 8, 1, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  coilizard(g, v) {
    const G = P('#9ad84a', '#64a02a', '#cff48a'), BL = '#e8f4c0', Cu = '#c8702a', M = P('#c8d0dc', '#8a94a8', '#f0f4fa'), BAND = '#5a6478', CORE = '#7ae8ff', EYE = '#ffc020';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const coil = (cx, cy) => { t.ellipse(cx, cy, 5, 5, M, { edge: true }); t.ellipse(cx, cy, 3.2, 3.2, BAND); t.ellipse(cx, cy, 2.2, 2.2, M); t.ellipse(cx, cy, 1.2, 1.2, CORE); t.px(cx - 4, cy - 1, BAND).px(cx + 3, cy - 4, BAND).px(cx + 4, cy + 2, BAND); };
    if (v === 'bside') {
      legB.ellipse(8, 26, 3, 2, G, { edge: true }); legA.ellipse(23, 26.5, 2.6, 1.8, G, { edge: true });
      b.ellipse(15, 22, 7.5, 5, G, { edge: true });
      for (let y = 18; y < 26; y += 2) b.px(14, y, Cu).px(15, y + 1, Cu).px(16, y, Cu);
      h.ellipse(18, 15.5, 5, 3.5, G, { edge: true });
      h.ellipse(23, 15, 1.4, 1.6, EYE);                                                           // an eye peeking out
      t.ellipse(11, 18, 2, 2, M, { edge: true });
      coil(9, 10);
      return;
    }
    t.ellipse(10, 18, 2, 2, M, { edge: true });
    coil(7, 12);                                                                                 // the coil behind, on the left
    legB.ellipse(8, 26, 2.6, 1.8, G, { edge: true }); legA.ellipse(24, 26.5, 3, 2, G, { edge: true });
    legB.px(7, 27, BL); legA.px(22, 27, BL).px(25, 27, BL);
    b.ellipse(16, 23, 7.5, 4.5, G, { edge: true });
    b.ellipse(17.5, 24.5, 4.5, 2.4, BL);
    for (let i = 0; i < 4; i++) b.px(11 + i, 20 + (i % 2), Cu);
    h.poly([[9, 17], [11, 12], [18, 10], [25, 12], [27, 17], [18, 20]], G, { edge: true });     // wedge head, turned its way
    h.ellipse(19, 18, 4, 1.5, BL);
    for (let i = 0; i < 5; i++) h.px(16 + i, 11 + (i % 2), Cu);
    rigEye(h, Q, 11, 13, () => { h.ellipse(12, 14, 2.2, 2.4, EYE, { edge: true }); h.rect(12, 13, 1, 3, DARK_EYE); h.px(11, 13, '#ffffff'); }, 3);
    rigEye(h, Q, 22, 13, () => { h.ellipse(23, 14, 2.6, 2.6, EYE, { edge: true }); h.rect(23, 13, 1, 3, DARK_EYE); h.px(22, 13, '#ffffff'); }, 3);
    rigMouth(h, Q, 16, 17, 6, () => h.rect(15, 17, 8, 1, OUTLINE));
  },
});
Object.assign(RIGGED, { coilizard: 'quad' });
