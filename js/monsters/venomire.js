// Venomire: venomire. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// A maw ringed with sharp fangs (r132, the owner: "give it sharp fangs all around the inside of its mouth"):
// always open, a row of fangs along the top, long canines at the corners, a row along the bottom (between
// the top ones), a purple tongue; a roar opens it a row wider. w = how many pixels wide inside.
function venomMaw(h, x0, y, w, mouth) {
  const O = OUTLINE, D = '#2a0838', W = '#f4eefa', T = '#c060a0', extra = mouth === 'roar' ? 2 : mouth === 'open' ? 1 : 0;
  const top = i => (i % 2 === 0 && i < w / 2) || ((w - 1 - i) % 2 === 0 && i >= w / 2);
  h.rect(x0 + 1, y, w, 1, O);                                                                    // upper lip
  for (let r = 1; r <= 3 + extra; r++) { h.px(x0, y + r, O); h.px(x0 + w + 1, y + r, O); }        // the corners
  for (let i = 0; i < w; i++) {
    const x = x0 + 1 + i, mid = i === Math.floor((w - 1) / 2) || i === Math.ceil((w - 1) / 2);
    h.px(x, y + 1, top(i) ? W : D);                                                              // the top fangs
    for (let r = 2; r <= 2 + extra; r++) h.px(x, y + r, (i === 0 || i === w - 1) && r === 2 ? W : mid && r === 2 + extra ? T : D);   // canines, tongue
    h.px(x, y + 3 + extra, !top(i) && i > 0 && i < w - 1 ? W : D);                               // the bottom fangs
  }
  h.rect(x0 + 1, y + 4 + extra, w, 1, O);                                                        // lower lip
}
Object.assign(MONSTER_ART, {
  venomire(g, v = 'front') {
    const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    // spots on the body move with it, spots on the slimy base stay put
    const spots = (pts, cx) => { for (const [x, y] of pts) { const p = ((x + 0.5 - cx) / 8) ** 2 + ((y + 0.5 - 17) / 9) ** 2 <= 1 ? b : g; p.px(x, y, S); p.px(x + 1, y, S); } };
    if (v === 'side') {
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      earB.poly([[13, 10], [10, 2], [16, 8]], B);
      b.ellipse(17, 17, 8, 9, B, { edge: true });
      earA.poly([[18, 9], [20, 1], [22, 8]], B, { edge: true }); earA.px(20, 1, S); earA.px(20, 2, S);
      b.ellipse(21.5, 21, 3, 4.5, '#e4b8f4');
      spots([[6, 25], [22, 27], [12, 20], [11, 13], [26, 24]], 17);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#3a0a4a'); h.px(21, 13, '#ffffff'); });
      venomMaw(h, 20, 16, 4, Q.mouth);                                                          // its fanged maw
      return;
    }
    if (v === 'back') {
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      earA.poly([[11, 10], [7, 2], [14, 8]], B); earB.poly([[21, 10], [25, 2], [18, 8]], B);
      earA.px(7, 2, S).px(8, 3, S); earB.px(24, 2, S).px(23, 3, S);
      b.ellipse(16, 17, 8, 9, B, { edge: true });
      spots([[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]], 16);
      return;
    }
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                              // slimy base
    earA.poly([[11, 10], [7, 2], [14, 8]], B); earB.poly([[21, 10], [25, 2], [18, 8]], B);      // horns
    earA.px(7, 2, S).px(8, 3, S); earB.px(24, 2, S).px(23, 3, S);
    b.ellipse(16, 17, 8, 9, B, { edge: true });                                                 // body
    b.ellipse(16, 21, 4.5, 4.5, '#e4b8f4');                                                     // belly
    spots([[8, 25], [22, 27], [25, 23], [5, 24], [17, 9], [11, 20]], 16);
    rigEyes(h, Q, 32, 12, 13, 2, () => h.eyes(12, 13, '#3a0a4a'));
    venomMaw(h, 12, 16, 6, Q.mouth);                                                            // a maw ringed with fangs
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },
});
Object.assign(MONSTER_ART_DIAG, {
  venomire(g, v) {
    const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const spots = pts => { for (const [x, y] of pts) { const p = ((x + 0.5 - 17) / 8) ** 2 + ((y + 0.5 - 17) / 9) ** 2 <= 1 ? b : g; p.px(x, y, S); p.px(x + 1, y, S); } };
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                               // slimy base
    earB.poly([[11, 10], [7, 2], [14, 8]], B); earB.px(7, 2, S); earB.px(8, 3, S);               // horns
    earA.poly([[20, 9], [24, 2], [23, 8]], B); earA.px(24, 2, S); earA.px(23, 3, S);
    b.ellipse(17, 17, 8, 9, B, { edge: true });
    if (v === 'bside') {
      spots([[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]]);
      return;
    }
    b.ellipse(19, 21, 4, 4.5, '#e4b8f4');                                                        // belly
    spots([[6, 25], [22, 27], [25, 23], [11, 20], [13, 10]]);
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 3, '#3a0a4a'); h.px(14, 13, '#ffffff'); });
    rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 3, '#3a0a4a'); h.px(21, 13, '#ffffff'); });
    venomMaw(h, 15, 16, 6, Q.mouth);                                                            // a maw ringed with fangs
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },
});
Object.assign(RIGGED, { venomire: 'slither' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  venomire: { fps: 5, every: 8, frames: [{ body: 1 }, { body: -1, mouth: 'open' }, { body: 1 }, { }] },   // bubbles
});
