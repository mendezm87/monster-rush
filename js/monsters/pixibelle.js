// Pixibelle: pixibelle. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r253 (the owner: "make pixibelle ... more chibi"): the old big-headed design again, with the guide's detail: pointed
// butterfly wings with veins (wingPoly, so they still flap), curled antennae with pink tips, folds in her bell dress,
// and a smile. A left-side wing as points; PIXI_WING_R is the root they swing from.
const PIXI_WN = P('#c8eefa', '#94c8ec', '#ffffff'), PIXI_VEIN = '#6aa8dc', PIXI_TIP = '#ff6f9e';
const PIXI_UP = [[12, 16], [6, 8], [3, 6.6], [1.6, 9.4], [3.4, 15.2], [9, 19]], PIXI_LOW = [[12, 19], [6.5, 19.4], [4.2, 23], [5.8, 26.4], [10, 24.4]];
const PIXI_VEINS = [[[11.4, 16.2], [5, 9.4], [5.8, 9], [11.8, 15.6]], [[11.4, 17], [3.6, 13.2], [3.8, 12.4], [11.8, 16.4]], [[11.6, 19.6], [6, 23], [6.6, 23.4], [11.8, 20.2]]];
function pixiWings(b, dx, mirror, far) {   // dx shifts them; mirror = both sides (front, back); far = a smaller one on the right too
  const sh = pts => pts.map(([x, y]) => [x + dx, y]), w = { root: [12 + dx, 17] };
  const draw = mirror ? wingPolyM : wingPoly;
  draw(b, sh(PIXI_UP), PIXI_WN, { edge: true }, w); draw(b, sh(PIXI_LOW), PIXI_WN, { edge: true }, w);
  for (const v of PIXI_VEINS) draw(b, sh(v), PIXI_VEIN, undefined, w);
  if (far) {   // the far wings, peeking out on the right
    const fw = { root: [20 + dx, 17] }, fx = pts => pts.map(([x, y]) => [32 - x + dx + far, y]);
    wingPoly(b, fx(PIXI_UP).map(([x, y]) => [x - 1, y + 1]), PIXI_WN, { edge: true }, fw); wingPoly(b, fx(PIXI_LOW), PIXI_WN, { edge: true }, fw);
  }
}
const pixiAntenna = (p, x, dir) => { p.rect(x, 2, 1, 4, OUTLINE); p.px(x + dir, 1, OUTLINE); p.px(x + dir * 2, 1, PIXI_TIP).px(x + dir * 2, 0, PIXI_TIP).px(x + dir * 3, 1, PIXI_TIP); };
const pixiFolds = b => { b.px(14, 25, '#c83a7a').px(14, 27, '#c83a7a').px(18, 25, '#c83a7a').px(18, 27, '#c83a7a'); };
Object.assign(MONSTER_ART, {
  pixibelle(g, v = 'front') {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const skirt = () => b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
    if (v === 'side') {
      pixiWings(b, 2, false, 0);
      pixiAntenna(earA, 19, 1);
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt(); pixiFolds(b);
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[9, 6], [13, 9], [9, 12]], Pk); h.px(12, 9, '#c83a7a');
      rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
      h.ellipse(22, 16, 1.5, 1, '#ff8ab8');
      rigMouth(h, Q, 22, 17, 2, () => h.px(22, 17, OUTLINE).px(23, 18, OUTLINE));   // a smile
      return;
    }
    if (v === 'back') {
      pixiAntenna(earA, 12, -1); pixiAntenna(earB, 19, 1);
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt(); pixiFolds(b);
      h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk); h.px(16, 8, '#c83a7a');
      pixiWings(b, 0, true);
      return;
    }
    pixiWings(b, 0, true);                                                                       // pointed butterfly wings with veins
    pixiAntenna(earA, 12, -1); pixiAntenna(earB, 19, 1);                                         // curled antennae, pink tips
    b.ellipse(16, 23, 5, 5.5, B, { edge: true });                                               // body
    skirt(); pixiFolds(b);                                                                      // her bell dress, with folds
    h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });                                             // head
    h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk);         // bow
    h.px(16, 8, '#c83a7a');
    rigEyes(h, Q, 32, 12, 12, 2, () => h.eyes(12, 12, '#6a2a5a'));
    h.ellipseM(10, 16, 1.5, 1, '#ff8ab8');                                                      // cheeks
    rigMouth(h, Q, 15, 17, 2, () => h.px(15, 17, OUTLINE).px(16, 18, OUTLINE).px(17, 17, OUTLINE));   // a smile
  },
});
Object.assign(MONSTER_ART_DIAG, {
  pixibelle(g, v) {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const antennae = () => {
      pixiAntenna(earB, 13, -1); pixiAntenna(earA, 20, 1);
    };
    const body = () => {
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); pixiFolds(b);   // skirt
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
    };
    if (v === 'bside') {
      antennae();
      body();
      h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[22, 5], [17, 8], [22, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
      pixiWings(b, 1, false, 1);
      return;
    }
    pixiWings(b, 0, false, 2);
    antennae();
    body();
    h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[21, 6], [17, 8], [21, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
    rigEye(h, Q, 13, 12, () => { h.rect(13, 12, 2, 3, '#6a2a5a'); h.px(13, 12, '#ffffff'); });
    rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
    h.ellipse(11.5, 16, 1.5, 1, '#ff8ab8'); h.ellipse(23, 16, 1.2, 1, '#ff8ab8');               // cheeks
    rigMouth(h, Q, 17, 17, 2, () => h.px(17, 17, OUTLINE).px(18, 18, OUTLINE).px(19, 17, OUTLINE));
  },
});
Object.assign(RIGGED, { pixibelle: 'flier' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  pixibelle: { fps: 5, every: 9, frames: [{ flap: -0.4, head: [0, -1] }, { flap: 0.5 }, { flap: -0.4, eyes: 'blink' }, { flap: 0.5 }, { }] },   // twirls
});
