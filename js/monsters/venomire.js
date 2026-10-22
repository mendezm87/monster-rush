// Venomire: venomire. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// Its mouth (r133, the owner: "I was expecting teeth like a blender or garbage disposal"): a round
// grinder, always open, ringed with teeth pointing in toward a dark throat, with a blender's metal blade
// spinning in the middle (it turns a step whenever its mouth opens, so it whirls as it attacks). The
// ellipse at (cx, cy) is the mouth; an open mouth or a roar opens it wider.
function venomGrinder(h, cx, cy, rx, ry, mouth) {
  const D = '#2a0838', W = '#f4eefa', Wd = '#c8bcd8', M = '#b8bec8', Ms = '#7a808c', grow = mouth === 'roar' ? 1.2 : mouth === 'open' ? 0.6 : 0;
  rx += grow; ry += grow;
  h.ellipse(cx, cy, rx + 1, ry + 1, OUTLINE);                                                    // its rim
  h.ellipse(cx, cy, rx, ry, D);                                                                  // the throat
  const n = Math.max(8, Math.round((rx + ry) * 2.2));
  for (let k = 0; k < n; k++) {                                                                  // teeth all round, pointing in
    const a = (k / n) * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
    h.px(Math.round(cx - 0.5 + c * (rx - 0.5)), Math.round(cy - 0.5 + s2 * (ry - 0.5)), W);
    if (k % 2 === 0 && rx > 3.5) h.px(Math.round(cx - 0.5 + c * (rx - 1.5)), Math.round(cy - 0.5 + s2 * (ry - 1.5)), Wd);   // a second row when it's open wide
  }
  const x = Math.round(cx - 0.5), y = Math.round(cy - 0.5), turn = mouth ? 1 : 0;                 // the spinning blade
  h.px(x, y, M);
  const arms = turn ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (const [dx, dy] of arms) h.px(x + dx, y + dy, M);
  h.px(x + arms[0][0] * 2, y + arms[0][1] * 2, Ms).px(x + arms[1][0] * 2, y + arms[1][1] * 2, Ms);
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
      venomGrinder(h, 22.5, 20.5, 1.6, 2.8, Q.mouth);                                             // its grinder mouth, side on
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
    venomGrinder(h, 16, 21, 3.4, 2.8, Q.mouth);                                               // a round grinder of a mouth
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
    venomGrinder(h, 18.5, 21, 3, 2.8, Q.mouth);                                             // a round grinder of a mouth
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },
});
Object.assign(RIGGED, { venomire: 'slither' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  venomire: { fps: 5, every: 8, frames: [{ body: 1 }, { body: -1, mouth: 'open' }, { body: 1 }, { }] },   // bubbles
});
