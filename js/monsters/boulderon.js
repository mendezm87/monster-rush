// Boulderon: boulderon. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  boulderon(g, v = 'front') { // 44x44
    const R = P('#8f8170', '#625747', '#b8aa96');
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) b.px(x, y, '#4e4436'); };
    if (v === 'side') {
      earB.poly([[9, 18], [11, 6], [16, 15]], R, { edge: true });
      h.poly([[15, 13], [19, 2], [23, 13]], R, { edge: true });
      earA.poly([[22, 14], [28, 5], [30, 17]], R, { edge: true });
      legB.ellipse(14, 40, 4.5, 2.5, R, { edge: true });
      b.ellipse(21, 26, 15, 14, R, { edge: true });
      legA.ellipse(28, 40, 4.5, 2.5, R, { edge: true });
      armA.ellipse(26, 28, 5, 6, R, { edge: true });
      rigEye(h, Q, 30, 22, () => { h.rect(30, 22, 2, 3, '#ffb02a'); h.px(30, 22, '#ffffff'); h.px(29, 20, OUTLINE); h.px(30, 20, OUTLINE); h.px(31, 21, OUTLINE); });
      rigMouth(h, Q, 31, 31, 4, () => h.rect(31, 31, 4, 1, OUTLINE));
      cracks([[10, 30], [11, 31], [11, 32], [16, 18], [17, 19], [19, 34]]);
      return;
    }
    if (v === 'back') {
      earA.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
      h.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
      earB.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
      b.ellipse(22, 26, 15, 14, R, { edge: true });
      armA.ellipse(6, 28, 5, 6, R, { edge: true }); armB.ellipse(38, 28, 5, 6, R, { edge: true });
      legA.ellipse(14, 40, 4.5, 2.5, R, { edge: true }); legB.ellipse(30, 40, 4.5, 2.5, R, { edge: true });
      b.poly([[18, 26], [22, 18], [26, 26]], R, { edge: true });
      b.poly([[19, 34], [22, 28], [25, 34]], R, { edge: true });
      cracks([[12, 22], [13, 23], [31, 30], [30, 31], [16, 33], [28, 20]]);
      return;
    }
    earA.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
    h.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
    earB.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
    b.ellipse(22, 26, 15, 14, R, { edge: true });
    armA.ellipse(6, 28, 5, 6, R, { edge: true }); armB.ellipse(38, 28, 5, 6, R, { edge: true });
    legA.ellipse(14, 40, 4.5, 2.5, R, { edge: true }); legB.ellipse(30, 40, 4.5, 2.5, R, { edge: true });
    rigEyes(h, Q, 44, 16, 22, 2, () => h.eyes(16, 22, '#ffb02a', { brow: true }));
    rigMouth(h, Q, 19, 30, 7, () => { h.rect(19, 30, 7, 1, OUTLINE); h.px(18, 29, OUTLINE); h.px(26, 29, OUTLINE); });
    cracks([[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [29, 33], [30, 34]]);
  },
});
Object.assign(MONSTER_ART_DIAG, {
  boulderon(g, v) { // 44x44
    const R = P('#8f8170', '#625747', '#b8aa96');
    const { Q, b, h, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) b.px(x, y, '#4e4436'); };
    earB.poly([[9, 17], [12, 5], [17, 14]], R, { edge: true });                                  // rocky spikes
    h.poly([[17, 13], [21, 2], [25, 13]], R, { edge: true });
    earA.poly([[24, 14], [30, 5], [32, 17]], R, { edge: true });
    if (v === 'bside') {
      b.ellipse(22, 26, 15, 14, R, { edge: true });
      armB.ellipse(6, 28, 5, 6, R, { edge: true }); armA.ellipse(37, 28, 4, 5.5, R, { edge: true });
      legB.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); legA.ellipse(29, 40, 4, 2.3, R, { edge: true });
      b.poly([[17, 26], [21, 18], [25, 26]], R, { edge: true }); b.poly([[18, 34], [21, 28], [24, 34]], R, { edge: true });
      cracks([[12, 22], [13, 23], [31, 30], [30, 31], [15, 33], [28, 20]]);
      return;
    }
    b.ellipse(21, 26, 15, 14, R, { edge: true });
    armB.ellipse(6, 28, 5, 6, R, { edge: true }); armA.ellipse(36, 28, 4, 5.5, R, { edge: true });   // arms
    legB.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); legA.ellipse(29, 40, 4, 2.3, R, { edge: true });
    rigEye(h, Q, 18, 22, () => { h.rect(18, 22, 2, 3, '#ffb02a'); h.px(18, 22, '#ffffff'); h.px(17, 20, OUTLINE).px(18, 20, OUTLINE).px(19, 21, OUTLINE).px(20, 21, OUTLINE); });
    rigEye(h, Q, 27, 22, () => { h.rect(27, 22, 2, 3, '#ffb02a'); h.px(27, 22, '#ffffff'); h.px(29, 20, OUTLINE).px(28, 20, OUTLINE).px(27, 21, OUTLINE).px(26, 21, OUTLINE); });
    rigMouth(h, Q, 22, 30, 6, () => { h.rect(22, 30, 6, 1, OUTLINE); h.px(21, 29, OUTLINE); h.px(28, 29, OUTLINE); });   // scowl
    cracks([[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [28, 33], [29, 34]]);
  },
});
Object.assign(RIGGED, { boulderon: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  boulderon: { fps: 5, every: 11, frames: [{ arms: [-2, -2] }, { arms: [-3, -3], body: -1 }, { arms: [-3, -3], body: -1, eyes: 'blink' }, { arms: [-1, -1] }, { }] },   // has a big stretch
});
