// Brawlix: brawlix. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r131 (it read as Hitmonchan): a living punching bag from an old training hall. A heavy bag of
// worn brown leather with stitched seams, a red band round it and a dent where it's been punched a thousand
// times; its face is on the bag; stubby arms end in fists wrapped in white tape; the chain it once hung
// from still dangles from its top (it rides the ears, so it swings). Colours in BRAWL.
const BRAWL = { LEATHER: P('#9a6236', '#6e4224', '#ba8250'), TOP: P('#ae7444', '#7a4c2a', '#c8925e'), BAND: P('#c43a32', '#8a2420', '#e86058'),
  TAPE: P('#f0ece0', '#c8c0ac', '#ffffff'), CHAIN: P('#a8adb6', '#6c707a', '#d8dce4'), STITCH: '#e0c89a', BOOT: P('#3a3036', '#24202a', '#544a52') };

Object.assign(MONSTER_ART, {
  brawlix(g, v = 'front') {
    const { LEATHER, TOP, BAND, TAPE, CHAIN, STITCH, BOOT } = BRAWL;
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    const chain = (p, x) => { p.ellipse(x, 6, 1.4, 1.2, CHAIN, { edge: true }); p.ellipse(x, 3.6, 1.2, 1.4, CHAIN, { edge: true }); p.rect(x - 1, 1, 3, 1, CHAIN.s); };
    const bag = (x0, x1) => {   // the heavy bag: leather body, a rounded top, stitched seams, a red band
      b.poly([[x0, 9], [x1, 9], [x1 + 1, 11], [x1 + 1, 25], [x1, 27], [x0, 27], [x0 - 1, 25], [x0 - 1, 11]], LEATHER, { edge: true });
      b.ellipse((x0 + x1) / 2, 9, (x1 - x0) / 2 + 0.5, 2, TOP, { edge: true });
      b.rect(x0 - 1, 22, x1 - x0 + 3, 2, BAND.b); b.rect(x0 - 1, 23, x1 - x0 + 3, 1, BAND.s);
    };
    const stitches = (p, x, y0, y1) => { for (let y = y0; y <= y1; y += 2) p.px(x, y, STITCH); };
    if (side) {
      legB.ellipse(13.5, 28.5, 2.3, 1.6, P(BOOT.s, '#18141a', BOOT.b), { edge: true });
      armB.ellipse(13, 17, 1.8, 3, P(LEATHER.s, '#4a2c18', LEATHER.b));
      bag(11, 20);
      stitches(b, 15, 11, 21); stitches(b, 15, 25, 26);
      b.px(12, 15, LEATHER.s).px(12, 16, LEATHER.s).px(13, 17, LEATHER.s);                        // the dent
      earA.ellipse(15.5, 6, 1.4, 1.2, CHAIN, { edge: true }); earA.ellipse(15.5, 3.6, 1.2, 1.4, CHAIN, { edge: true }); earA.rect(14.5, 1, 3, 1, CHAIN.s);
      legA.ellipse(17.5, 28.5, 2.4, 1.6, BOOT, { edge: true });
      rigEye(h, Q, 19, 13, () => { h.rect(19, 13, 2, 1, OUTLINE); h.px(20, 14, OUTLINE); h.px(18, 12, OUTLINE).px(19, 12, OUTLINE); }, 2);   // a scowl
      rigMouth(h, Q, 19, 17, 2, () => { h.rect(19, 17, 2, 1, OUTLINE); });
      armA.ellipse(21, 17, 1.8, 3, LEATHER, { edge: true });
      armA.ellipse(24.5, 19, 3.3, 3, TAPE, { edge: true }); armA.px(23, 18, TAPE.s).px(25, 19, TAPE.s).px(23, 20, TAPE.s);   // taped fist up
      return;
    }
    legA.ellipse(12.5, 28.5, 2.5, 1.6, BOOT, { edge: true }); legB.ellipse(19.5, 28.5, 2.5, 1.6, BOOT, { edge: true });
    bag(10, 22);
    chain(earA, 16);
    armA.ellipse(7.5, 16, 1.8, 3, LEATHER, { edge: true }); armB.ellipse(24.5, 16, 1.8, 3, LEATHER, { edge: true });
    armA.ellipse(6, 20.5, 3.3, 3, TAPE, { edge: true }); armB.ellipse(26, 20.5, 3.3, 3, TAPE, { edge: true });   // taped fists
    armA.px(5, 19, TAPE.s).px(7, 20, TAPE.s).px(5, 21, TAPE.s); armB.px(26, 19, TAPE.s).px(24, 20, TAPE.s).px(26, 21, TAPE.s);
    if (v === 'back') {
      stitches(b, 13, 11, 21); stitches(b, 19, 11, 21); stitches(b, 13, 25, 26); stitches(b, 19, 25, 26);
      b.rect(14, 14, 4, 4, LEATHER.l); b.rect(14, 14, 4, 1, STITCH); b.rect(14, 17, 4, 1, STITCH);   // a stitched-on patch
      return;
    }
    stitches(b, 11, 11, 21); stitches(b, 21, 11, 21);
    b.px(19, 18, LEATHER.s).px(20, 19, LEATHER.s).px(20, 20, LEATHER.s).px(19, 21, LEATHER.s);       // the dent
    rigEyes(h, Q, 32, 13, 13, 2, () => { h.rectM(13, 13, 2, 1, OUTLINE); h.pxM(14, 14, OUTLINE); h.pxM(12, 12, OUTLINE); h.pxM(13, 12, OUTLINE); });   // a fierce scowl
    rigMouth(h, Q, 14, 17, 4, () => { h.rect(14, 17, 4, 1, OUTLINE); h.px(15, 18, TAPE.b); h.px(16, 18, TAPE.b); });   // gritted teeth
  },
});
Object.assign(MONSTER_ART_DIAG, {
  brawlix(g, v) {   // turned a little right
    const { LEATHER, TOP, BAND, TAPE, CHAIN, STITCH, BOOT } = BRAWL;
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    legA.ellipse(12, 28.5, 2.5, 1.6, BOOT, { edge: true }); legB.ellipse(19, 28.5, 2.4, 1.6, BOOT, { edge: true });
    b.poly([[10, 9], [21, 9], [22, 11], [22, 25], [21, 27], [10, 27], [9, 25], [9, 11]], LEATHER, { edge: true });
    b.ellipse(15.5, 9, 6, 2, TOP, { edge: true });
    b.rect(9, 22, 14, 2, BAND.b); b.rect(9, 23, 14, 1, BAND.s);
    earA.ellipse(16, 6, 1.4, 1.2, CHAIN, { edge: true }); earA.ellipse(16, 3.6, 1.2, 1.4, CHAIN, { edge: true }); earA.rect(15, 1, 3, 1, CHAIN.s);
    armA.ellipse(7.5, 16, 1.8, 3, LEATHER, { edge: true }); armB.ellipse(23.5, 16, 1.6, 2.8, LEATHER, { edge: true });
    armA.ellipse(6, 20.5, 3.3, 3, TAPE, { edge: true }); armB.ellipse(25.5, 20.5, 2.9, 2.7, TAPE, { edge: true });
    armA.px(5, 19, TAPE.s).px(7, 20, TAPE.s); armB.px(25, 19, TAPE.s).px(24, 21, TAPE.s);
    for (let y = 11; y <= 21; y += 2) b.px(v === 'bside' ? 14 : 11, y, STITCH).px(v === 'bside' ? 20 : 20, y, STITCH);
    if (v === 'bside') { b.rect(15, 14, 4, 4, LEATHER.l); b.rect(15, 14, 4, 1, STITCH); b.rect(15, 17, 4, 1, STITCH); return; }
    b.px(20, 18, LEATHER.s).px(21, 19, LEATHER.s).px(21, 20, LEATHER.s);
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 1, OUTLINE); h.px(15, 14, OUTLINE); h.px(13, 12, OUTLINE).px(14, 12, OUTLINE); }, 2);
    rigEye(h, Q, 18, 13, () => { h.rect(18, 13, 2, 1, OUTLINE); h.px(18, 14, OUTLINE); h.px(19, 12, OUTLINE).px(20, 12, OUTLINE); }, 2);
    rigMouth(h, Q, 15, 17, 4, () => { h.rect(15, 17, 4, 1, OUTLINE); h.px(16, 18, TAPE.b); h.px(17, 18, TAPE.b); });
  },
});
Object.assign(RIGGED, { brawlix: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  brawlix: { fps: 5, every: 8, frames: [{ arms: [3, -1] }, { arms: [-1, 3] }, { arms: [3, -1] }, { arms: [-1, 3], ears: [1, 0] }, { }] },   // shadowboxes, chain swinging
});
