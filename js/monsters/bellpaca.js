// Bellpaca: bellpaca. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r253 (the owner: "make ... bellpaca more chibi"): a big woolly head with a fluffy topknot and long banana ears, big
// dark eyes, a short neck, a round fluffy body and short legs, still wearing the guide's red collar and gold bell (with
// a spark of electric blue in it). Colours in BELLPACA.
const BELLPACA = { W: P('#f6ecd6', '#d8c8a4', '#ffffff'), MZ: '#ece0c4', HOOF: '#5a4a3a', COL: P('#c8302e', '#962020', '#e85a50'),
  BELL: P('#ffd23a', '#d08a10', '#fff2a0'), GLOW: '#7ae8ff', EYE: '#3a2a1a', EAR: '#e8b8a8', BLUSH: '#f4b0a8' };
function bellLeg(p, x) {   // a short fluffy leg and its hoof
  const { W, HOOF } = BELLPACA;
  p.poly([[x - 1.5, 24.5], [x + 1.5, 24.5], [x + 1.3, 28.8], [x - 1.3, 28.8]], W, { edge: true });
  p.rect(Math.round(x) - 1, 29, 3, 1, HOOF);
}
function bellBell(b, x, y) {   // the gold bell on its collar, with a spark of blue inside
  const { BELL, GLOW } = BELLPACA;
  b.ellipse(x, y, 1.9, 1.8, BELL, { edge: true }); b.px(x - 1, y - 1, BELL.l); b.px(x, y + 1, GLOW);
}
function bellWool(b, cx, cy, W) {   // the round fluffy body with wool bumps
  b.ellipse(cx, cy, 7.5, 5, W, { edge: true });
  for (const [dx, dy] of [[-6.5, -0.5], [6.5, -0.5], [-3.5, -3.5], [3.5, -3.5], [-5, 3], [5, 3]]) b.ellipse(cx + dx, cy + dy, 2.4, 2.2, W);
}
function bellHead(h, earA, earB, cx, Q, view) {   // big woolly head, topknot, ears
  const { W, EAR } = BELLPACA;
  earA.poly([[cx - 4, 7], [cx - 6.4, 2], [cx - 5.4, 1.2], [cx - 2.6, 5.4]], W, { edge: true }); earA.px(cx - 5, 3, EAR).px(cx - 4, 4, EAR);
  earB.poly([[cx + 4, 7], [cx + 6.4, 2], [cx + 5.4, 1.2], [cx + 2.6, 5.4]], W, { edge: true }); if (view !== 'back') earB.px(cx + 5, 3, EAR).px(cx + 4, 4, EAR);
  h.ellipse(cx, 10, 5.6, 4.8, W, { edge: true });
  for (const [dx, dy, r] of [[-2.5, -4.2, 2], [0, -5, 2.3], [2.5, -4.2, 2]]) h.ellipse(cx + dx, 10 + dy, r, r * 0.8, W.l);   // fluffy topknot, one soft tuft
}
Object.assign(MONSTER_ART, {
  bellpaca(g, v = 'front') {
    const { W, MZ, COL, EYE, BLUSH } = BELLPACA;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      bellLeg(legB, 9); bellLeg(legA, 17);                                                       // far legs
      t.ellipse(5.5, 19.5, 1.8, 1.8, W, { edge: true });                                         // tail tuft
      bellWool(b, 13, 21.5, W);
      bellLeg(legA, 11); bellLeg(legB, 19);                                                      // near legs
      b.ellipse(19.5, 16, 2.8, 3.4, W, { edge: true });                                          // short neck
      b.rect(17, 16, 5, 1, COL.b); bellBell(b, 21, 18);
      earB.poly([[18, 6], [16.2, 1.6], [17.2, 1], [19.4, 5]], W.s, { edge: true });               // far ear
      h.ellipse(21, 10, 4.8, 4.5, W, { edge: true });
      h.ellipse(25, 11.5, 2.2, 1.7, MZ, { edge: true });                                         // snout
      for (const [dx, dy, r] of [[-1.5, -4.2, 2], [0.8, -4.8, 2.1]]) h.ellipse(21 + dx, 10 + dy, r, r * 0.8, W.l);
      earA.poly([[20, 6], [19, 1.2], [20.2, 0.6], [21.6, 4.8]], W, { edge: true }); earA.px(20, 2, BELLPACA.EAR).px(20, 3, BELLPACA.EAR);
      rigEye(h, Q, 22, 9, () => { h.rect(22, 9, 2, 3, EYE); h.px(22, 9, '#ffffff'); });
      h.px(21, 12, BLUSH);
      h.px(27, 11, OUTLINE);                                                                     // nostril
      rigMouth(h, Q, 25, 13, 2, () => h.px(25, 13, OUTLINE));
      return;
    }
    if (v === 'back') {
      bellLeg(legA, 12); bellLeg(legB, 20);
      bellWool(b, 16, 21.5, W);
      b.ellipse(16, 16, 3.6, 3, W, { edge: true });
      b.rect(12, 16, 8, 1, COL.b);
      bellHead(h, earA, earB, 16, Q, 'back');
      t.ellipse(16, 23, 1.8, 1.8, W, { edge: true });
      return;
    }
    bellLeg(legA, 12.5); bellLeg(legB, 19.5);                                                    // short legs
    t.ellipse(24.5, 20, 1.7, 1.7, W, { edge: true });                                            // tail tuft
    bellWool(b, 16, 21.5, W);                                                                    // round fluffy body
    b.ellipse(16, 16, 3.6, 3, W, { edge: true });                                                // short neck
    b.rect(12, 16, 8, 1, COL.b); b.px(12, 17, COL.s).px(19, 17, COL.s);                         // red collar
    bellBell(b, 16, 18);                                                                         // gold bell
    bellHead(h, earA, earB, 16, Q, v);                                                           // big woolly head
    rigEyes(h, Q, 32, 12, 9, 2, () => h.eyes(12, 9, EYE));                                       // big dark eyes
    h.px(11, 12, BLUSH); h.px(20, 12, BLUSH);
    h.ellipse(16, 12.5, 2.2, 1.4, MZ);                                                           // muzzle
    rigMouth(h, Q, 15, 14, 2, () => h.px(16, 14, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  bellpaca(g, v) {   // turned a little right
    const { W, MZ, COL, EYE, BLUSH } = BELLPACA;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'bside') {
      bellLeg(legB, 11); bellLeg(legA, 19.5);
      bellWool(b, 15, 21.5, W);
      b.ellipse(16.5, 16, 3.6, 3, W, { edge: true });
      b.rect(13, 16, 8, 1, COL.b);
      h.ellipse(22, 11.5, 1.6, 1.4, MZ);                                                          // a sliver of snout
      bellHead(h, earA, earB, 17, Q, 'back');
      t.ellipse(13, 23, 1.8, 1.8, W, { edge: true });
      return;
    }
    bellLeg(legB, 11.5); bellLeg(legA, 20);
    t.ellipse(7.5, 20, 1.7, 1.7, W, { edge: true });
    bellWool(b, 15, 21.5, W);
    b.ellipse(17, 16, 3.6, 3, W, { edge: true });
    b.rect(13, 16, 8, 1, COL.b);
    bellBell(b, 17.5, 18);
    bellHead(h, earA, earB, 17, Q, v);
    rigEye(h, Q, 14, 9, () => { h.rect(14, 9, 2, 3, EYE); h.px(14, 9, '#ffffff'); });
    rigEye(h, Q, 19, 9, () => { h.rect(19, 9, 2, 3, EYE); h.px(19, 9, '#ffffff'); });
    h.px(13, 12, BLUSH); h.px(21, 12, BLUSH);
    h.ellipse(18, 12.5, 2.2, 1.4, MZ);
    rigMouth(h, Q, 17, 14, 2, () => h.px(18, 14, OUTLINE));
  },
});
Object.assign(RIGGED, { bellpaca: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  bellpaca: { fps: 5, every: 10, frames: [{ head: [0, 1] }, { head: [0, -1] }, { head: [0, 1] }, { head: [0, -1], eyes: 'blink' }, { }] },   // rings its bell
});
