// Smouldox: smouldox. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Smouldox (r48, from the owner's pick): a hulking charcoal calf with a heap of glowing coals on
  // its back, an ember glow from its belly, small horns, eyes like embers, head held low, smoke
  // curling off it.
  smouldox(g, v = 'front') {
    const K = P('#3a3236', '#221c20', '#5a5056'), CO = P('#2a2226', '#140e12', '#4a3e44'), MZ = P('#6a5a5a', '#4a3e3e', '#8a7a78'), HN = '#9a9098';
    const EMB = '#ff7a1c', HOT = '#ffd34a', EYE = '#ff9a3a', HOOF = '#141012', SMOKE = '#8a8088';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const coals = pts => { for (const [x, y] of pts) { b.ellipse(x, y, 2, 1.6, CO, { edge: true }); b.px(x, y, EMB); b.px(x - 1, y + 1, HOT); } };
    const smoke = pts => { for (const [x, y] of pts) t.px(x, y, SMOKE); };
    const leg = (p, x) => { p.ellipse(x, 27.5, 2.4, 2.6, K, { edge: true }); p.ellipse(x, 30, 2.4, 1, HOOF); };
    if (v === 'side') {
      t.rect(4, 18, 1, 4, K.s); t.ellipse(4, 23, 1.5, 1.5, K, { edge: true });                  // thin tail with a tuft
      leg(legA, 8); leg(legB, 18);
      b.ellipse(14, 21, 10, 6, K, { edge: true });
      b.ellipse(15, 26, 6, 1.4, EMB);                                                            // ember glow underneath
      coals([[8, 15], [12, 14], [16, 14.5], [19, 16]]);
      leg(legB, 10.5); leg(legA, 20.5);
      earA.ellipse(21, 16, 2, 1.2, K, { edge: true });
      h.ellipse(24, 19, 4.5, 4, K, { edge: true });                                              // head held low
      h.poly([[22, 15], [23, 12], [24, 15]], HN);                                                // horn
      h.ellipse(27.5, 21, 2.4, 1.8, MZ, { edge: true });
      rigEye(h, Q, 24, 18, () => h.rect(24, 18, 2, 1, EYE));
      h.px(23, 17, OUTLINE).px(24, 17, OUTLINE);
      h.px(28, 21, OUTLINE);
      rigMouth(h, Q, 26, 23, 2);
      smoke([[12, 10], [13, 8], [12, 6], [16, 9], [17, 7]]);
      return;
    }
    if (v === 'back') {
      leg(legA, 10.5); leg(legB, 21.5);
      b.ellipse(16, 21, 10, 6.5, K, { edge: true });
      coals([[10, 16], [14, 15], [18, 15], [22, 16], [12, 19], [20, 19], [16, 18]]);
      earA.ellipse(9.5, 13, 2, 1.2, K, { edge: true }); earB.ellipse(22.5, 13, 2, 1.2, K, { edge: true });
      h.ellipse(16, 13, 4, 2.5, K, { edge: true });
      h.poly([[12, 12], [11, 9], [13, 11]], HN); h.poly([[20, 12], [21, 9], [19, 11]], HN);
      t.rect(16, 23, 1, 4, K.s); t.ellipse(16.5, 27.5, 1.5, 1.5, K, { edge: true });
      return;
    }
    leg(legA, 10.5); leg(legB, 21.5);                                                            // sturdy legs, dark hooves
    b.ellipse(16, 21, 10, 6.5, K, { edge: true });                                               // hulking body
    b.ellipse(16, 25.5, 6, 1.6, EMB);                                                            // ember glow from the belly
    coals([[9, 15], [12.5, 13.5], [19.5, 13.5], [23, 15]]);                                      // the heap of coals on its back
    earA.ellipse(9.5, 14, 2, 1.2, K, { edge: true }); earB.ellipse(22.5, 14, 2, 1.2, K, { edge: true });
    h.poly([[11, 12], [10, 9], [12, 11]], HN); h.poly([[21, 12], [22, 9], [20, 11]], HN);       // small horns
    h.ellipse(16, 15.5, 5, 4.5, K, { edge: true });                                              // head held low
    h.ellipse(16, 19, 3, 2, MZ, { edge: true });                                                 // muzzle
    h.px(15, 19, OUTLINE).px(17, 19, OUTLINE);                                                   // nostrils
    rigEyes(h, Q, 32, 12, 15, 2, () => h.rectM(12, 15, 2, 1, EYE));                              // eyes like embers
    h.pxM(12, 14, OUTLINE).pxM(13, 14, OUTLINE);                                                 // a hard brow
    rigMouth(h, Q, 15, 21, 2);
  },
});
Object.assign(MONSTER_ART_DIAG, {
  smouldox(g, v) {
    const K = P('#3a3236', '#221c20', '#5a5056'), CO = P('#2a2226', '#140e12', '#4a3e44'), MZ = P('#6a5a5a', '#4a3e3e', '#8a7a78'), HN = '#9a9098';
    const EMB = '#ff7a1c', HOT = '#ffd34a', EYE = '#ff9a3a', HOOF = '#141012', SMOKE = '#8a8088';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const coals = pts => { for (const [x, y] of pts) { b.ellipse(x, y, 2, 1.6, CO, { edge: true }); b.px(x, y, EMB); b.px(x - 1, y + 1, HOT); } };
    const leg = (p, x) => { p.ellipse(x, 27.5, 2.4, 2.6, K, { edge: true }); p.ellipse(x, 30, 2.4, 1, HOOF); };
    if (v === 'bside') {
      leg(legB, 10); leg(legA, 21);
      b.ellipse(15.5, 21, 10, 6.5, K, { edge: true });
      coals([[9, 16], [13, 15], [17, 15], [21, 16], [11, 19], [19, 19], [15, 18]]);
      earB.ellipse(11, 13, 2, 1.2, K, { edge: true }); earA.ellipse(23.5, 13, 2, 1.2, K, { edge: true });
      h.ellipse(18, 13, 4, 2.5, K, { edge: true });
      h.poly([[14, 12], [13, 9], [15, 11]], HN); h.poly([[22, 12], [23, 9], [21, 11]], HN);
      t.rect(11, 23, 1, 4, K.s); t.ellipse(11.5, 27.5, 1.5, 1.5, K, { edge: true });
      t.px(8, 11, SMOKE).px(9, 9, SMOKE).px(8, 7, SMOKE);
      return;
    }
    t.rect(5, 19, 1, 4, K.s); t.ellipse(5, 24, 1.5, 1.5, K, { edge: true });
    leg(legB, 10); leg(legA, 21);
    b.ellipse(15, 21, 10, 6.5, K, { edge: true });
    b.ellipse(16, 25.5, 6, 1.6, EMB);
    coals([[8, 15], [11.5, 13.5], [16, 13], [20, 14.5]]);
    earB.ellipse(11.5, 14, 2, 1.2, K, { edge: true }); earA.ellipse(24.5, 14, 2, 1.2, K, { edge: true });
    h.poly([[13, 12], [12, 9], [14, 11]], HN); h.poly([[23, 12], [24, 9], [22, 11]], HN);
    h.ellipse(18, 15.5, 5, 4.5, K, { edge: true });
    h.ellipse(19.5, 19, 3, 2, MZ, { edge: true });
    h.px(18, 19, OUTLINE).px(21, 19, OUTLINE);
    rigEye(h, Q, 14, 15, () => h.rect(14, 15, 2, 1, EYE));
    rigEye(h, Q, 20, 15, () => h.rect(20, 15, 2, 1, EYE));
    h.px(14, 14, OUTLINE).px(15, 14, OUTLINE); h.px(21, 14, OUTLINE).px(20, 14, OUTLINE);
    rigMouth(h, Q, 18, 21, 2);
  },
});
Object.assign(RIGGED, { smouldox: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  smouldox: { fps: 5, every: 9, frames: [{ legs: [2, 0] }, { body: 1 }, { legs: [2, 0], head: [1, 0] }, { body: 1, mouth: 'open' }, { }] },   // stamps a hoof and snorts
});
