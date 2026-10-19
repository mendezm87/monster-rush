// Voltergeist: voltergeist. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Voltergeist (r48, from the owner's pick): a crackling ball of black-violet static fur, two cold
  // glowing slit eyes, a jagged crack of light for a mouth (kept off a toothy grin on purpose), an
  // antenna with a glowing bulb, stubby feet, purple arcs flickering round it.
  voltergeist(g, v = 'front') {
    const F = P('#3a2a6a', '#24184a', '#5a46a0'), GLOW = '#e8f4ff', ARC = '#c8a8ff', CRACK = '#bfefff', FT = P('#24184a', '#160e30', '#3a2a6a');
    const { Q, b, h, t, earA } = rigParts(g, v);
    const ball = cx => {   // a spiky ball of static fur
      const pts = [];
      for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 9.5 : 12.2 + ((i * 7) % 3) * 0.4; pts.push([cx + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.92]); }
      b.poly(pts, F, { edge: true });
      b.ellipse(cx - 2, 14.5, 6, 4, F.l);                                                         // a sheen on the fur
      b.px(cx - 7, 20, ARC).px(cx - 6, 19, ARC).px(cx - 5, 20, ARC); b.px(cx + 5, 24, ARC).px(cx + 6, 23, ARC);   // static in the fur
    };
    const feet = (a, c) => { b.ellipse(a, 29.5, 2.6, 1.4, FT, { edge: true }); b.ellipse(c, 29.5, 2.6, 1.4, FT, { edge: true }); };
    const antenna = x => { earA.rect(x, 2, 1, 5, OUTLINE); earA.ellipse(x + 0.5, 1.8, 1.8, 1.8, P('#fff6c0', '#e0c060', '#ffffff')); };
    const sparks = () => { t.px(3, 12, ARC).px(4, 11, ARC).px(4, 13, ARC); t.px(28, 21, ARC).px(29, 20, ARC).px(28, 22, ARC); };   // arcs that sway like a tail
    if (v === 'side') {
      feet(13, 19); antenna(16); ball(15); sparks();
      rigEye(h, Q, 20, 15, () => h.poly([[19, 15], [25, 16], [24, 17], [19, 16]], GLOW), 4);
      rigMouth(h, Q, 20, 20, 3, () => h.px(20, 21, CRACK).px(21, 20, CRACK).px(22, 21, CRACK).px(23, 20, CRACK).px(24, 21, CRACK));
      return;
    }
    if (v === 'back') { feet(12, 20); antenna(16); ball(16); sparks(); return; }
    feet(12, 20);
    antenna(17);
    ball(16);
    sparks();
    rigEyes(h, Q, 32, 9, 14, 5, () => h.polyM([[9, 14], [15, 16], [14, 17], [9, 15]], GLOW));     // cold glowing slits
    rigMouth(h, Q, 12, 20, 8, () => { for (let x = 11; x <= 21; x++) h.px(x, x % 2 ? 21 : 20, CRACK); });   // a jagged crack of light
  },
});
Object.assign(MONSTER_ART_DIAG, {
  voltergeist(g, v) {
    const F = P('#3a2a6a', '#24184a', '#5a46a0'), GLOW = '#e8f4ff', ARC = '#c8a8ff', CRACK = '#bfefff', FT = P('#24184a', '#160e30', '#3a2a6a');
    const { Q, b, h, t, earA } = rigParts(g, v);
    const pts = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 9.5 : 12.2 + ((i * 7) % 3) * 0.4; pts.push([16.5 + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.92]); }
    b.ellipse(12.5, 29.5, 2.6, 1.4, FT, { edge: true }); b.ellipse(20, 29.5, 2.4, 1.3, FT, { edge: true });
    earA.rect(18, 2, 1, 5, OUTLINE); earA.ellipse(18.5, 1.8, 1.8, 1.8, P('#fff6c0', '#e0c060', '#ffffff'));
    b.poly(pts, F, { edge: true });
    b.ellipse(14.5, 14.5, 6, 4, F.l);
    b.px(9, 20, ARC).px(10, 19, ARC).px(11, 20, ARC); b.px(22, 24, ARC).px(23, 23, ARC);
    t.px(3, 12, ARC).px(4, 11, ARC).px(4, 13, ARC); t.px(29, 21, ARC).px(30, 20, ARC).px(29, 22, ARC);
    if (v === 'bside') return;
    rigEye(h, Q, 11, 14, () => h.poly([[11, 14], [16, 16], [15, 17], [11, 15]], GLOW), 4);
    rigEye(h, Q, 19, 14, () => h.poly([[25, 14], [20, 16], [21, 17], [25, 15]], GLOW), 4);
    rigMouth(h, Q, 14, 20, 8, () => { for (let x = 13; x <= 23; x++) h.px(x, x % 2 ? 21 : 20, CRACK); });
  },
});
Object.assign(RIGGED, { voltergeist: 'floater' });
