// Slabominable: slabominable. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r131 (it read as Geodude / Graveler): a living cairn from the ruins. Flat standing stones
// balanced in a stack, each a little off-centre and a different grey, moss on their tops and cracks in their
// faces; the top stone is its head, carved by the old civilization with two glowing eye slits and a rune on
// its brow; a small pebble balanced on top (it wobbles on the ears); fists of stacked pebbles. Colours in CAIRN.
const CAIRN = { S1: P('#9a948a', '#6e6a62', '#bab4a8'), S2: P('#8a8478', '#5e5a52', '#aaa498'), S3: P('#a89a84', '#7a6e5a', '#c8baa2'),
  MOSS: '#6a8a3a', MOSSL: '#8aaa4a', GLOW: '#7ae0c8', GLOWD: '#3aa898', CRACK: '#4a4640' };

Object.assign(MONSTER_ART, {
  slabominable(g, v = 'front') { // 44x44
    const { S1, S2, S3, MOSS, MOSSL, GLOW, GLOWD, CRACK } = CAIRN;
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    const moss = (p, x0, x1, y) => { for (let x = x0; x <= x1; x++) p.px(x, y, (x * 7) % 3 ? MOSS : MOSSL); p.px(x0 + 2, y + 1, MOSS).px(x1 - 3, y + 1, MOSS); };
    const fist = (p, x, y) => { p.ellipse(x, y, 3.5, 2.8, S1, { edge: true }); p.ellipse(x - 1, y + 4, 4, 3.2, S2, { edge: true }); p.px(x - 2, y + 4, CRACK).px(x - 1, y + 5, CRACK); };
    if (side) {
      legB.ellipse(17, 40.5, 4, 2.6, S2.s, { edge: true });
      b.ellipse(21, 33, 12, 6.5, S1, { edge: true });                                             // the wide bottom stone
      moss(b, 13, 27, 27);
      b.px(15, 34, CRACK).px(16, 35, CRACK).px(16, 36, CRACK);
      b.ellipse(23, 24.5, 9, 5, S3, { edge: true });                                              // the middle stone, set a little forward
      moss(b, 17, 26, 20);
      legA.ellipse(25, 40.5, 4.5, 2.8, S2, { edge: true });
      h.ellipse(24, 14.5, 8.5, 5.2, S2, { edge: true });                                              // the head stone
      h.rect(28, 13, 3, 1, GLOW); h.px(30, 12, GLOWD);                                             // a glowing eye slit (carved)
      rigEye(h, Q, 28, 13, () => { h.rect(28, 13, 3, 1, GLOW); }, 3);
      h.px(27, 9, GLOWD).px(28, 9, GLOWD);                                                         // the rune on its brow, edge-on
      rigMouth(h, Q, 28, 17, 3, () => { h.rect(28, 17, 3, 1, S2.s); });
      earA.ellipse(24, 8.5, 3.6, 1.6, S3, { edge: true });                                             // pebble balanced on top
      fist(armA, 30, 25);                                                                         // pebble fist
      return;
    }
    legA.ellipse(15, 40.5, 4.5, 2.8, S2, { edge: true }); legB.ellipse(29, 40.5, 4.5, 2.8, S2, { edge: true });   // stone feet
    b.ellipse(22, 33, 13, 6.5, S1, { edge: true });                                               // the wide bottom stone
    moss(b, 12, 31, 27);
    b.ellipse(23, 24.5, 10, 5, S3, { edge: true });                                               // the middle stone, a little off-centre
    moss(b, 16, 29, 20);
    fist(armA, 8, 23); fist(armB, 36, 23);                                                        // fists of stacked pebbles
    if (v === 'back') {
      b.px(26, 33, CRACK).px(27, 34, CRACK).px(27, 35, CRACK).px(28, 36, CRACK);
      h.ellipse(22, 14.5, 9.5, 5.2, S2, { edge: true });
      h.px(19, 12, CRACK).px(20, 13, CRACK).px(21, 13, CRACK);
      moss(h, 16, 27, 10);
      earA.ellipse(23, 8.5, 4, 1.6, S3, { edge: true });
      return;
    }
    b.px(16, 33, CRACK).px(17, 34, CRACK).px(17, 35, CRACK).px(18, 36, CRACK);                     // cracks
    b.px(28, 25, CRACK).px(29, 26, CRACK);
    h.ellipse(22, 14.5, 9.5, 5.2, S2, { edge: true });                                                // the head stone
    moss(h, 16, 27, 10);
    h.rect(21, 10, 2, 1, GLOWD); h.px(20, 11, GLOWD).px(23, 11, GLOWD); h.px(21, 12, GLOW).px(22, 12, GLOW);   // the carved rune on its brow
    rigEyes(h, Q, 44, 16, 14, 4, () => { h.rectM(16, 14, 4, 1, GLOW); h.pxM(16, 15, GLOWD); });   // two glowing eye slits
    rigMouth(h, Q, 19, 17, 6, () => { h.rect(19, 17, 6, 1, S2.s); });
    earA.ellipse(23, 8.5, 4, 1.6, S3, { edge: true });                                              // a pebble balanced on top
  },
});
Object.assign(MONSTER_ART_DIAG, {
  slabominable(g, v) {   // turned a little right
    const { S1, S2, S3, MOSS, MOSSL, GLOW, GLOWD, CRACK } = CAIRN;
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    const moss = (p, x0, x1, y) => { for (let x = x0; x <= x1; x++) p.px(x, y, (x * 7) % 3 ? MOSS : MOSSL); p.px(x0 + 2, y + 1, MOSS).px(x1 - 3, y + 1, MOSS); };
    const fist = (p, x, y) => { p.ellipse(x, y, 3.5, 2.8, S1, { edge: true }); p.ellipse(x - 1, y + 4, 4, 3.2, S2, { edge: true }); p.px(x - 2, y + 4, CRACK).px(x - 1, y + 5, CRACK); };
    legA.ellipse(15, 40.5, 4.5, 2.8, S2, { edge: true }); legB.ellipse(28, 40.5, 4.2, 2.7, S2, { edge: true });
    b.ellipse(21.5, 33, 12.5, 6.5, S1, { edge: true });
    moss(b, 12, 30, 27);
    b.ellipse(23.5, 24.5, 9.5, 5, S3, { edge: true });
    moss(b, 17, 29, 20);
    fist(armA, 9, 23); fist(armB, 36, 23.5);
    if (v === 'bside') {
      b.px(26, 33, CRACK).px(27, 34, CRACK).px(27, 35, CRACK);
      h.ellipse(23, 14.5, 9, 5.2, S2, { edge: true });
      moss(h, 17, 28, 10);
      earA.ellipse(24, 8.5, 3.6, 1.6, S3, { edge: true });
      return;
    }
    b.px(15, 33, CRACK).px(16, 34, CRACK).px(16, 35, CRACK);
    h.ellipse(24, 14.5, 9, 5.2, S2, { edge: true });
    moss(h, 18, 29, 10);
    h.rect(24, 10, 2, 1, GLOWD); h.px(23, 11, GLOWD).px(26, 11, GLOWD); h.px(24, 12, GLOW).px(25, 12, GLOW);
    rigEye(h, Q, 19, 14, () => { h.rect(19, 14, 4, 1, GLOW); h.px(19, 15, GLOWD); }, 4);
    rigEye(h, Q, 27, 14, () => { h.rect(27, 14, 3, 1, GLOW); h.px(29, 15, GLOWD); }, 3);
    rigMouth(h, Q, 22, 17, 6, () => { h.rect(22, 17, 6, 1, S2.s); });
    earA.ellipse(25, 8.5, 4, 1.6, S3, { edge: true });
  },
});
Object.assign(RIGGED, { slabominable: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  slabominable: { fps: 5, every: 11, frames: [{ arms: [-2, -2] }, { arms: [-3, -3], body: -1, ears: [1, 0] }, { arms: [-3, -3], body: -1, eyes: 'blink', ears: [-1, 0] }, { arms: [-1, -1], ears: [1, 0] }, { }] },   // has a big stretch, its pebble wobbling
});
