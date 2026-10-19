// Lumawool: lumawool. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Lumawool, redrawn (r48) from the owner's pick: a storm ram. Its wool is a dark living
  // thundercloud with lightning flickering inside, heavy curled iron horns, a long dark face and
  // glowing eyes; sparks crackle off it.
  lumawool(g, v = 'front') {
    const W = P('#3e4458', '#2a2e3e', '#5a627a'), Fc = P('#4a4c58', '#30323c', '#6a6c78'), H = P('#7a7e8a', '#4a4e5a', '#a8acb8');
    const LEG = '#2a2a34', HOOF = '#141418', BOLT = '#ffe066', GLOW = '#fff2a0';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 2, 5, LEG); p.rect(x, 29, 2, 1, HOOF); };
    const horn = (p, cx, cy) => { p.ellipse(cx, cy, 3, 3, H, { edge: true }); p.ellipse(cx, cy, 1.4, 1.4, H.s); p.px(cx, cy - 2, H.l); };
    const bolts = pts => { for (const [x, y] of pts) b.px(x, y, BOLT).px(x + 1, y - 1, BOLT).px(x + 2, y, BOLT); };
    const sparks = () => { t.px(3, 15, BOLT).px(4, 14, BOLT).px(4, 16, '#bfe8ff'); t.px(28, 22, BOLT).px(29, 21, BOLT).px(28, 23, '#bfe8ff'); };   // sparks that sway like a tail
    if (v === 'side') {
      leg(legA, 9); leg(legB, 18);
      for (const [x, y, r] of [[14, 19, 8], [8, 17, 4], [18, 14, 5], [12, 13, 4]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });   // thundercloud wool
      bolts([[8, 19], [15, 21], [17, 15]]);
      leg(legB, 11); leg(legA, 20);
      h.poly([[19, 11], [25, 13], [27, 17], [25, 19], [20, 17]], Fc, { edge: true });            // long dark face
      horn(earA, 20, 11);
      rigEye(h, Q, 22, 13, () => h.rect(22, 13, 2, 1, GLOW));
      h.px(21, 12, OUTLINE).px(22, 12, OUTLINE);
      h.px(26, 16, OUTLINE);
      rigMouth(h, Q, 24, 18, 2);
      sparks();
      return;
    }
    if (v === 'back') {
      leg(legA, 11); leg(legB, 19);
      for (const [x, y, r] of [[16, 20, 9.5], [9, 17, 4.5], [23, 17, 4.5], [11, 13, 4], [21, 13, 4], [16, 12, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });
      bolts([[9, 19], [20, 22], [14, 14]]);
      horn(earA, 9.5, 11); horn(earB, 22.5, 11);
      sparks();
      return;
    }
    leg(legA, 11); leg(legB, 19);                                                                // legs and hooves
    for (const [x, y, r] of [[16, 21, 9], [9, 18, 4.5], [23, 18, 4.5], [11, 13, 4], [21, 13, 4], [16, 11, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });   // thundercloud wool
    bolts([[8, 19], [21, 20], [15, 24]]);                                                        // lightning inside it
    horn(earA, 9.5, 11); horn(earB, 22.5, 11);                                                   // curled iron horns
    h.poly([[13, 11], [19, 11], [18.5, 19], [16, 21], [13.5, 19]], Fc, { edge: true });         // long dark face
    h.ellipse(16, 19, 2, 1.2, Fc.l);
    rigEyes(h, Q, 32, 13, 14, 2, () => h.rectM(13, 14, 2, 1, GLOW));                            // glowing eyes
    h.pxM(13, 13, OUTLINE).pxM(14, 13, OUTLINE);                                                 // heavy brows
    h.px(15, 18, OUTLINE).px(17, 18, OUTLINE);                                                   // nostrils
    rigMouth(h, Q, 15, 20, 2);
    sparks();
  },
});
Object.assign(MONSTER_ART_DIAG, {
  lumawool(g, v) {
    const W = P('#3e4458', '#2a2e3e', '#5a627a'), Fc = P('#4a4c58', '#30323c', '#6a6c78'), H = P('#7a7e8a', '#4a4e5a', '#a8acb8');
    const LEG = '#2a2a34', HOOF = '#141418', BOLT = '#ffe066', GLOW = '#fff2a0';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const leg = (p, x) => { p.rect(x, 25, 2, 5, LEG); p.rect(x, 29, 2, 1, HOOF); };
    const horn = (p, cx, cy) => { p.ellipse(cx, cy, 3, 3, H, { edge: true }); p.ellipse(cx, cy, 1.4, 1.4, H.s); p.px(cx, cy - 2, H.l); };
    const bolts = pts => { for (const [x, y] of pts) b.px(x, y, BOLT).px(x + 1, y - 1, BOLT).px(x + 2, y, BOLT); };
    leg(legB, 10); leg(legA, 20);
    for (const [x, y, r] of [[15.5, 21, 9], [8.5, 18, 4.5], [22.5, 18, 4], [11, 13, 4], [21, 13, 4], [16, 11, 5]]) b.ellipse(x, y, r, r * 0.8, W, { edge: true });
    bolts([[8, 19], [20, 21], [14, 24]]);
    t.px(3, 15, BOLT).px(4, 14, BOLT).px(4, 16, '#bfe8ff'); t.px(28, 22, BOLT).px(29, 21, BOLT).px(28, 23, '#bfe8ff');
    horn(earB, 10, 11); horn(earA, 23, 11);
    if (v === 'bside') return;
    h.poly([[15, 11], [21, 11], [21, 19], [18.5, 21], [16, 19]], Fc, { edge: true });           // face, turned its way
    h.ellipse(18.5, 19, 2, 1.2, Fc.l);
    rigEye(h, Q, 15, 14, () => h.rect(15, 14, 2, 1, GLOW));
    rigEye(h, Q, 19, 14, () => h.rect(19, 14, 2, 1, GLOW));
    h.px(15, 13, OUTLINE).px(16, 13, OUTLINE); h.px(19, 13, OUTLINE).px(20, 13, OUTLINE);
    h.px(18, 18, OUTLINE).px(20, 18, OUTLINE);
    rigMouth(h, Q, 17, 20, 2);
  },
});
Object.assign(RIGGED, { lumawool: 'quad' });
