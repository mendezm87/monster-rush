// Bellpaca: bellpaca. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Bellpaca (r48, from the owner's pick): a tall, calm alpaca of thick cream wool, a woolly tuft
  // over its half-lidded eyes, and a brass bell on a red collar glowing electric blue, lighting its
  // chest. A quiet guardian.
  bellpaca(g, v = 'front') {
    const W = P('#f4ead2', '#d6c6a0', '#ffffff'), MZ = '#ece0c4', HOOF = '#5a4a3a', COL = '#a83030', BELL = P('#e0b048', '#a07828', '#fff0a0'), GLOW = '#9af0ff';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 3, 5, W.s); p.rect(x, 29, 3, 1, HOOF); };
    const bell = (x, y) => { b.ellipse(x, y - 1, 3, 2, '#d8fcff'); b.ellipse(x, y + 0.5, 1.6, 1.8, BELL, { edge: true }); b.px(x, y + 2, GLOW); };
    if (v === 'side') {
      leg(legA, 8); leg(legB, 17);
      t.ellipse(6, 19, 1.6, 1.6, W, { edge: true });                                             // tail tuft
      b.ellipse(13, 21, 8, 5.5, W, { edge: true });
      b.ellipse(19, 13, 2.8, 6.5, W, { edge: true });                                            // long neck
      b.rect(17, 15, 5, 1, COL);
      bell(20, 17);
      leg(legB, 10); leg(legA, 19);
      earA.poly([[19, 3], [19, -1], [21, 2]], W, { edge: true });
      h.ellipse(21, 6, 3.5, 3, W, { edge: true }); h.ellipse(24, 7.5, 2, 1.5, MZ, { edge: true });   // head, snout
      h.ellipse(20, 3.5, 3, 1.6, W.l, { edge: true });                                           // woolly tuft
      rigEye(h, Q, 21, 5, () => { h.rect(21, 5, 2, 1, OUTLINE); h.px(22, 6, '#3a2a1a'); });    // half-lidded stare
      rigMouth(h, Q, 24, 9, 2, () => h.px(25, 9, OUTLINE));
      return;
    }
    if (v === 'back') {
      leg(legA, 10); leg(legB, 19);
      b.ellipse(16, 21, 8, 5.5, W, { edge: true }); b.ellipse(9, 20, 2.5, 2.5, W); b.ellipse(23, 20, 2.5, 2.5, W);
      b.ellipse(16, 13, 3.5, 6, W, { edge: true });
      earA.poly([[11, 4], [11, 0], [13, 3]], W, { edge: true }); earB.poly([[21, 4], [21, 0], [19, 3]], W, { edge: true });
      h.ellipse(16, 6, 4, 3.5, W, { edge: true }); h.ellipse(16, 3, 3.5, 2, W.l, { edge: true });
      t.ellipse(16, 23, 1.6, 1.6, W, { edge: true });
      return;
    }
    leg(legA, 10); leg(legB, 19);                                                                // legs
    t.ellipse(24, 20, 1.5, 1.5, W, { edge: true });                                              // tail tuft
    b.ellipse(16, 21, 8, 5.5, W, { edge: true }); b.ellipse(9, 20, 2.5, 2.5, W); b.ellipse(23, 20, 2.5, 2.5, W);   // thick fluffy body
    b.ellipse(16, 13, 3.5, 6, W, { edge: true });                                                // long neck
    b.rect(13, 15, 6, 1, COL);                                                                   // red collar
    bell(16, 17);                                                                                // brass bell, glowing blue
    earA.poly([[11, 4], [11, 0], [13, 3]], W, { edge: true }); earB.poly([[21, 4], [21, 0], [19, 3]], W, { edge: true });
    h.ellipse(16, 6, 4, 3.5, W, { edge: true });                                                 // head
    h.ellipse(16, 3, 3.5, 2, W.l, { edge: true });                                               // woolly tuft
    rigEyes(h, Q, 32, 13, 6, 2, () => { h.rectM(13, 6, 2, 1, OUTLINE); h.pxM(13, 7, '#3a2a1a'); });   // calm, half-lidded eyes
    h.ellipse(16, 8.5, 1.8, 1.2, MZ);
    rigMouth(h, Q, 15, 9, 2, () => h.px(16, 9, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  bellpaca(g, v) {
    const W = P('#f4ead2', '#d6c6a0', '#ffffff'), MZ = '#ece0c4', HOOF = '#5a4a3a', COL = '#a83030', BELL = P('#e0b048', '#a07828', '#fff0a0'), GLOW = '#9af0ff';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 3, 5, W.s); p.rect(x, 29, 3, 1, HOOF); };
    if (v === 'bside') {
      leg(legB, 10); leg(legA, 19);
      b.ellipse(15, 21, 8, 5.5, W, { edge: true }); b.ellipse(8, 20, 2.5, 2.5, W);
      b.ellipse(17, 13, 3.5, 6, W, { edge: true });
      earB.poly([[12, 4], [12, 0], [14, 3]], W, { edge: true }); earA.poly([[22, 4], [22, 0], [20, 3]], W, { edge: true });
      h.ellipse(17, 6, 4, 3.5, W, { edge: true }); h.ellipse(17, 3, 3.5, 2, W.l, { edge: true });
      t.ellipse(12, 23, 1.6, 1.6, W, { edge: true });
      return;
    }
    leg(legB, 10); leg(legA, 19);
    t.ellipse(8, 20, 1.5, 1.5, W, { edge: true });
    b.ellipse(15, 21, 8, 5.5, W, { edge: true }); b.ellipse(22, 20, 2.5, 2.5, W);
    b.ellipse(17, 13, 3.5, 6, W, { edge: true });
    b.rect(14, 15, 6, 1, COL);
    b.ellipse(17.5, 16, 3, 2, '#d8fcff'); b.ellipse(17.5, 17.5, 1.6, 1.8, BELL, { edge: true }); b.px(17, 19, GLOW);
    earB.poly([[12, 4], [12, 0], [14, 3]], W, { edge: true }); earA.poly([[22, 4], [22, 0], [20, 3]], W, { edge: true });
    h.ellipse(17, 6, 4, 3.5, W, { edge: true }); h.ellipse(17, 3, 3.5, 2, W.l, { edge: true });
    rigEye(h, Q, 14, 6, () => { h.rect(14, 6, 2, 1, OUTLINE); h.px(15, 7, '#3a2a1a'); });
    rigEye(h, Q, 19, 6, () => { h.rect(19, 6, 2, 1, OUTLINE); h.px(19, 7, '#3a2a1a'); });
    h.ellipse(18, 8.5, 1.8, 1.2, MZ);
    rigMouth(h, Q, 17, 9, 2, () => h.px(18, 9, OUTLINE));
  },
});
Object.assign(RIGGED, { bellpaca: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  bellpaca: { fps: 5, every: 10, frames: [{ head: [0, 1] }, { head: [0, -1] }, { head: [0, 1] }, { head: [0, -1], eyes: 'blink' }, { }] },   // rings its bell
});
