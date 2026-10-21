// Slumbear: slumbear. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  slumbear(g, v = 'front') { // 44x44
    const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {
      t.ellipse(5, 30, 2.5, 2.5, B);
      earA.ellipse(21, 8, 3.5, 3.5, B);
      legB.ellipse(14, 41, 5, 2.5, C, { edge: true });
      b.ellipse(21, 27, 16, 14, B, { edge: true });
      b.ellipse(26, 31, 9, 9, C);
      legA.ellipse(28, 41, 5, 2.5, C, { edge: true });
      h.ellipse(26, 14, 10, 8.5, B, { edge: true });
      h.ellipse(33, 17, 4.5, 3.5, C);
      armA.ellipse(28, 27, 3.5, 6, B, { edge: true });
      h.rect(35, 15, 2, 2, OUTLINE);
      rigEye(h, Q, 28, 13, () => h.rect(28, 13, 4, 1, OUTLINE), 4);
      rigMouth(h, Q, 33, 20, 2, () => h.px(33, 20, OUTLINE).px(34, 20, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.ellipse(11, 8, 3.5, 3.5, B); earB.ellipse(33, 8, 3.5, 3.5, B);
      b.ellipse(22, 27, 17, 14, B, { edge: true });
      armA.ellipse(6, 27, 3.5, 6, B, { edge: true }); armB.ellipse(38, 27, 3.5, 6, B, { edge: true });
      h.ellipse(22, 14, 11, 8.5, B, { edge: true });
      const D = P('#2a4c55', '#1f3a42', '#3f6f78');
      legA.ellipse(12, 41, 5, 2.5, D, { edge: true }); legB.ellipse(32, 41, 5, 2.5, D, { edge: true });
      t.ellipse(22, 36, 3, 3, C, { edge: true });
      return;
    }
    earA.ellipse(11, 8, 3.5, 3.5, B); earB.ellipse(33, 8, 3.5, 3.5, B);
    b.ellipse(22, 27, 17, 14, B, { edge: true });
    b.ellipse(22, 31, 12, 10, C);
    armA.ellipse(6, 27, 3.5, 6, B, { edge: true }); armB.ellipse(38, 27, 3.5, 6, B, { edge: true });
    h.ellipse(22, 14, 11, 8.5, B, { edge: true });
    h.ellipse(22, 16.5, 8, 5.5, C);
    rigEyes(h, Q, 44, 16, 14, 4, () => h.rectM(16, 14, 4, 1, OUTLINE));                        // sleepy eyes
    rigMouth(h, Q, 20, 19, 4, () => { h.rect(20, 19, 4, 1, OUTLINE); h.px(19, 18, OUTLINE); h.px(24, 18, OUTLINE); });   // smile
    legA.ellipse(12, 41, 5, 2.5, C, { edge: true }); legB.ellipse(32, 41, 5, 2.5, C, { edge: true });
    legA.px(10, 41, OUTLINE).px(12, 41, OUTLINE).px(14, 41, OUTLINE); legB.px(33, 41, OUTLINE).px(31, 41, OUTLINE).px(29, 41, OUTLINE);
    earA.px(11, 7, '#2a4c55'); earB.px(32, 7, '#2a4c55');
  },
});
Object.assign(MONSTER_ART_DIAG, {
  slumbear(g, v) { // 44x44
    const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    earB.ellipse(13, 8, 3.5, 3.5, B); earA.ellipse(30, 7.5, 3, 3, B);                            // ears
    if (v === 'bside') {
      b.ellipse(22, 27, 17, 14, B, { edge: true });
      armB.ellipse(6, 27, 3.5, 6, B, { edge: true }); armA.ellipse(38, 27, 3, 5.5, B, { edge: true });
      h.ellipse(23, 14, 11, 8.5, B, { edge: true });
      h.ellipse(33.5, 16.5, 1.8, 2, C);                                                          // muzzle peeking out
      const D = P('#2a4c55', '#1f3a42', '#3f6f78');
      legB.ellipse(13, 41, 5, 2.5, D, { edge: true }); legA.ellipse(31, 41, 4.5, 2.3, D, { edge: true });
      t.ellipse(19, 36, 3, 3, C, { edge: true });                                                // stubby tail
      return;
    }
    b.ellipse(21, 27, 16.5, 14, B, { edge: true });
    b.ellipse(24, 31, 11, 10, C);                                                                // belly
    armB.ellipse(6, 27, 3.5, 6, B, { edge: true }); armA.ellipse(37, 27, 2.8, 5.5, B, { edge: true }); // arms
    h.ellipse(23, 14, 11, 8.5, B, { edge: true });
    h.ellipse(26, 16.5, 7, 5.5, C);                                                              // muzzle, turned its way
    rigEye(h, Q, 19, 14, () => h.rect(19, 14, 3, 1, OUTLINE), 3);                                // sleepy eyes
    rigEye(h, Q, 28, 14, () => h.rect(28, 14, 3, 1, OUTLINE), 3);
    rigMouth(h, Q, 24, 19, 4, () => { h.rect(24, 19, 4, 1, OUTLINE); h.px(23, 18, OUTLINE); h.px(28, 18, OUTLINE); });   // smile
    legB.ellipse(13, 41, 5, 2.5, C, { edge: true }); legA.ellipse(31, 41, 4.5, 2.3, C, { edge: true });
    legB.px(11, 41, OUTLINE).px(13, 41, OUTLINE).px(15, 41, OUTLINE); legA.px(30, 41, OUTLINE).px(32, 41, OUTLINE);
    earB.px(12, 7, '#2a4c55');
  },
});
Object.assign(RIGGED, { slumbear: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  slumbear: { fps: 5, every: 9, frames: [{ eyes: 'blink', head: [0, 1] }, { eyes: 'sleep', head: [0, 2], body: 1 }, { eyes: 'sleep', head: [0, 2], body: 1 }, { eyes: 'hurt', head: [0, -1] }, { }] },   // dozes off and jolts awake
});
