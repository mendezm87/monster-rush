// Scarablade: scarablade. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// (The horn rides the ears, so headgear sits on its head, not on the blade's tip.)
// Redesigned in r131 (it read as Heracross in a headband): a beetle armoured in tree bark and moss, standing
// up like a fighter, its horn carved like a wooden training sword (with a little crossguard), and forearms
// that end in sharp leaf blades. Amber eyes under a heavy brow. Colours in SCARAB.
const SCARAB = { BARK: P('#86643e', '#5c442c', '#a8845a'), HEAD: P('#5e4430', '#3e2c1e', '#7a5a40'), MOSS: P('#6a9a3a', '#4a7228', '#8cc05a'),
  WOOD: P('#e2c488', '#b09058', '#f8e4b0'), GUARD: '#c89a3a', BELLY: P('#b08850', '#8a6838', '#c8a068'), LEAF: P('#5aaa3a', '#3a7a28', '#8ad860'), EYE: '#ffc040', GRAIN: '#4a3624' };

Object.assign(MONSTER_ART, {
  scarablade(g, v = 'front') {
    const { BARK, HEAD, MOSS, WOOD, GUARD, LEAF, EYE, GRAIN, BELLY } = SCARAB;
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const grain = (p, xs, y0, y1) => { for (const x of xs) for (let y = y0; y <= y1; y += 2) p.px(x, y + (x % 2), GRAIN); };   // bark grain
    if (v === 'side') {
      legB.ellipse(13, 28.5, 2.2, 2, BARK.s, { edge: true });
      armB.poly([[18, 17], [21, 18], [24, 24], [20, 22]], P(LEAF.s, '#2a5a1e', LEAF.b));             // far leaf blade
      b.ellipse(15, 21, 8.5, 6.5, BARK, { edge: true });                                         // bark wing-cases
      grain(b, [10, 13, 16, 19], 17, 25);
      b.ellipse(13, 15.5, 5, 1.6, MOSS);                                                          // moss on his back
      legA.ellipse(18, 28.5, 2.3, 2, BARK, { edge: true });
      earA.poly([[19, 9], [17, 4], [21, 8]], HEAD.l);                                             // antenna
      h.ellipse(21.5, 13, 4.6, 4, HEAD, { edge: true });                                          // head
      earA.poly([[22.5, 9], [25.5, 9], [30, 2.5], [29.5, 0.5], [27, 1.5]], WOOD, { edge: true });     // the wooden sword horn
      earA.rect(21, 9, 6, 1, GUARD);                                                                 // its crossguard
      rigEye(h, Q, 23, 12, () => { h.rect(23, 12, 2, 2, EYE); h.px(23, 11, OUTLINE).px(24, 11, OUTLINE).px(25, 11, OUTLINE); });
      rigMouth(h, Q, 24, 15, 2, () => h.px(24, 15, OUTLINE).px(25, 15, OUTLINE));
      armA.poly([[17, 16.5], [20, 17.5], [24, 22], [28, 27], [22, 24]], LEAF, { edge: true });      // leaf-blade forearm
      armA.px(20, 19, LEAF.l).px(22, 21, LEAF.l);
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 28.5, 2.4, 2, BARK, { edge: true }); legB.ellipse(21, 28.5, 2.4, 2, BARK, { edge: true });
      armA.poly([[8.5, 15], [11.5, 16.5], [10, 22], [6.5, 28], [4, 22]], LEAF, { edge: true }); armB.poly([[23.5, 15], [20.5, 16.5], [22, 22], [25.5, 28], [28, 22]], LEAF, { edge: true });
      earA.poly([[13, 9], [11, 4], [15, 8]], HEAD.l); earB.poly([[19, 9], [21, 4], [17, 8]], HEAD.l);
      h.ellipse(16, 11.5, 5, 4, HEAD, { edge: true });
      earA.poly([[14.5, 8], [17.5, 8], [17.5, 2], [16, -0.5], [14.5, 2]], WOOD, { edge: true }); earA.rect(12, 8, 8, 1, GUARD);
      b.ellipse(16, 21, 8, 7, BARK, { edge: true });                                              // the two bark wing-cases
      b.rect(16, 15, 1, 13, BARK.s);                                                             // and the seam between them
      grain(b, [10, 13, 19, 22], 16, 26);
      b.ellipse(12, 15.5, 3, 1.5, MOSS); b.ellipse(20.5, 16, 2.6, 1.4, MOSS); b.px(14, 23, MOSS.b).px(19, 20, MOSS.l);
      return;
    }
    legA.ellipse(11, 28.5, 2.4, 2, BARK, { edge: true }); legB.ellipse(21, 28.5, 2.4, 2, BARK, { edge: true });
    b.ellipse(16, 21, 8, 7, BARK, { edge: true });                                                // bark body
    b.ellipse(16, 22.5, 4.5, 4.8, BELLY);                                                         // a segmented belly
    for (const y of [20, 22, 24, 26]) b.rect(13, y, 7, 1, BELLY.s);
    grain(b, [10, 22], 17, 25); b.px(14, 19, GRAIN).px(18, 21, GRAIN).px(15, 24, GRAIN);
    b.ellipseM(11, 15.5, 3, 1.5, MOSS);                                                           // moss on his shoulders
    armA.poly([[8.5, 15], [11.5, 16.5], [10, 22], [6.5, 28], [4, 22]], LEAF, { edge: true }); armB.poly([[23.5, 15], [20.5, 16.5], [22, 22], [25.5, 28], [28, 22]], LEAF, { edge: true });   // long leaf blades
    armA.px(8, 19, LEAF.l).px(7, 22, LEAF.l); armB.px(23, 19, LEAF.l).px(24, 22, LEAF.l);
    earA.poly([[13, 9], [11, 4], [15, 8]], HEAD.l); earB.poly([[19, 9], [21, 4], [17, 8]], HEAD.l);   // antennae
    h.ellipse(16, 11.5, 5, 4, HEAD, { edge: true });                                              // head
    earA.poly([[14.5, 8], [17.5, 8], [17.5, 2], [16, -0.5], [14.5, 2]], WOOD, { edge: true });       // the horn, carved like a wooden sword
    earA.rect(12, 8, 8, 1, GUARD); earA.rect(16, 2, 1, 5, WOOD.s);                                     // its crossguard, and the blade's ridge
    rigEyes(h, Q, 32, 13, 11, 2, () => { h.rectM(13, 11, 2, 2, EYE); h.rectM(12, 10, 4, 1, OUTLINE); });   // amber eyes under a heavy brow
    rigMouth(h, Q, 15, 14, 2, () => h.px(15, 14, OUTLINE).px(16, 14, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  scarablade(g, v) {   // turned a little right
    const { BARK, HEAD, MOSS, WOOD, GUARD, LEAF, EYE, GRAIN, BELLY } = SCARAB;
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const grain = (p, xs, y0, y1) => { for (const x of xs) for (let y = y0; y <= y1; y += 2) p.px(x, y + (x % 2), GRAIN); };
    legA.ellipse(11, 28.5, 2.4, 2, BARK, { edge: true }); legB.ellipse(20, 28.5, 2.2, 2, BARK, { edge: true });
    if (v === 'bside') {
      armA.poly([[7.5, 15], [10.5, 16.5], [9, 22], [5.5, 28], [3, 22]], LEAF, { edge: true }); armB.poly([[24, 15], [21, 16.5], [23, 22], [26.5, 27], [28.5, 21]], LEAF, { edge: true });
      earA.poly([[15, 9], [13, 4], [17, 8]], HEAD.l); earB.poly([[21, 9], [23, 4], [19, 8]], HEAD.l);
      h.ellipse(18, 11.5, 5, 4, HEAD, { edge: true });
      earA.poly([[16.5, 8], [19.5, 8], [20, 2], [18.5, -0.5], [17, 2]], WOOD, { edge: true }); earA.rect(14, 8, 8, 1, GUARD);
      b.ellipse(15, 21, 8, 7, BARK, { edge: true });
      b.rect(16, 15, 1, 13, BARK.s);
      grain(b, [9, 12, 19, 21], 16, 26);
      b.ellipse(11, 15.5, 3, 1.5, MOSS); b.ellipse(19.5, 16, 2.6, 1.4, MOSS);
      return;
    }
    b.ellipse(15, 21, 8, 7, BARK, { edge: true });
    b.ellipse(17, 22.5, 4.3, 4.8, BELLY);
    for (const y of [20, 22, 24, 26]) b.rect(14, y, 7, 1, BELLY.s);
    grain(b, [9, 12], 17, 25); b.px(16, 19, GRAIN).px(19, 22, GRAIN);
    b.ellipse(10, 15.5, 3, 1.5, MOSS); b.ellipse(20, 15.5, 2.4, 1.4, MOSS);
    armA.poly([[7.5, 15], [10.5, 16.5], [9, 22], [5.5, 28], [3, 22]], LEAF, { edge: true }); armB.poly([[24, 15], [21, 16.5], [23, 22], [26.5, 27], [28.5, 21]], LEAF, { edge: true });
    armA.px(7, 19, LEAF.l); armB.px(24, 19, LEAF.l);
    earA.poly([[15, 9], [13, 4], [17, 8]], HEAD.l); earB.poly([[21, 9], [23, 4], [19, 8]], HEAD.l);
    h.ellipse(18, 11.5, 5, 4, HEAD, { edge: true });
    earA.poly([[17, 8], [20, 8], [21, 2], [19.5, -0.5], [18, 2]], WOOD, { edge: true });
    earA.rect(14, 8, 8, 1, GUARD); earA.rect(19, 2, 1, 5, WOOD.s);
    rigEye(h, Q, 15, 11, () => { h.rect(15, 11, 2, 2, EYE); h.rect(14, 10, 4, 1, OUTLINE); });
    rigEye(h, Q, 20, 11, () => { h.rect(20, 11, 2, 2, EYE); h.rect(19, 10, 4, 1, OUTLINE); });
    rigMouth(h, Q, 18, 14, 2, () => h.px(18, 14, OUTLINE).px(19, 14, OUTLINE));
  },
});
Object.assign(RIGGED, { scarablade: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  scarablade: { fps: 5, every: 10, frames: [{ arms: [2, 2] }, { arms: [1, 3] }, { arms: [3, 1] }, { arms: [1, 3] }, { }] },   // sharpens its leaf blades
});
