// Pixibelle: pixibelle. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r253 (the owner: "make pixibelle ... more chibi"): the old design again, with the guide's detail; r254 ("less chibi
// for pixi and remove the bow"): a smaller head on a taller body and a longer dress, no bow. The guide's details: pointed
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
// her dress (r255, the owner: it "looks like it's falling off" when it started below her chest): a fitted bodice up to her
// neck, a darker sash at the waist, then the bell skirt flaring out to the hem
const pixiDress = (b, Pk) => {
  b.poly([[10, 29], [22, 29], [19.6, 21.5], [18.6, 17], [13.4, 17], [12.4, 21.5]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
  b.rect(13, 21, 6, 1, '#c83a7a');
};
const pixiFolds = b => { b.px(14, 25, '#c83a7a').px(14, 27, '#c83a7a').px(18, 25, '#c83a7a').px(18, 27, '#c83a7a'); };
Object.assign(MONSTER_ART, {
  pixibelle(g, v = 'front') {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const skirt = () => pixiDress(b, Pk);
    if (v === 'side') {
      pixiWings(b, 2, false, 0);
      pixiAntenna(earA, 19, 1);
      b.ellipse(16, 21, 4, 4, B, { edge: true });
      skirt(); pixiFolds(b);
      h.ellipse(17, 11.5, 5.8, 5.4, B, { edge: true });
      rigEye(h, Q, 19, 10, () => { h.rect(19, 10, 2, 3, '#6a2a5a'); h.px(19, 10, '#ffffff'); });
      h.ellipse(21, 13.5, 1, 0.8, '#ff8ab8');
      rigMouth(h, Q, 20, 15, 2, () => h.px(20, 15, OUTLINE).px(21, 16, OUTLINE));   // a smile
      return;
    }
    if (v === 'back') {
      pixiAntenna(earA, 12, -1); pixiAntenna(earB, 19, 1);
      b.ellipse(16, 21, 4, 4, B, { edge: true });
      skirt(); pixiFolds(b);
      h.ellipse(16, 11.5, 5.8, 5.4, B, { edge: true });
      pixiWings(b, 0, true);
      return;
    }
    pixiWings(b, 0, true);                                                                       // pointed butterfly wings with veins
    pixiAntenna(earA, 12, -1); pixiAntenna(earB, 19, 1);                                         // curled antennae, pink tips
    b.ellipse(16, 21, 4, 4, B, { edge: true });                                               // body
    skirt(); pixiFolds(b);                                                                      // her bell dress, with folds
    h.ellipse(16, 11.5, 5.8, 5.4, B, { edge: true });                                             // head
    rigEyes(h, Q, 32, 12, 10, 2, () => h.eyes(12, 10, '#6a2a5a'));
    h.ellipseM(11, 13.5, 1.2, 0.8, '#ff8ab8');                                                   // cheeks
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 16, OUTLINE).px(17, 15, OUTLINE));   // a smile
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
      b.ellipse(16, 21, 4, 4, B, { edge: true });
      pixiDress(b, Pk); pixiFolds(b);   // her dress
      h.ellipse(17, 11.5, 5.8, 5.4, B, { edge: true });
    };
    if (v === 'bside') {
      antennae();
      body();
      pixiWings(b, 1, false, 1);
      return;
    }
    pixiWings(b, 0, false, 2);
    antennae();
    body();
    rigEye(h, Q, 14, 10, () => { h.rect(14, 10, 2, 3, '#6a2a5a'); h.px(14, 10, '#ffffff'); });
    rigEye(h, Q, 19, 10, () => { h.rect(19, 10, 2, 3, '#6a2a5a'); h.px(19, 10, '#ffffff'); });
    h.ellipse(12.5, 13.5, 1.2, 0.8, '#ff8ab8'); h.ellipse(21.5, 13.5, 1, 0.8, '#ff8ab8');      // cheeks
    rigMouth(h, Q, 16, 15, 2, () => h.px(16, 15, OUTLINE).px(17, 16, OUTLINE).px(18, 15, OUTLINE));
  },
});
Object.assign(RIGGED, { pixibelle: 'flier' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  pixibelle: { fps: 5, every: 9, frames: [{ flap: -0.4, head: [0, -1] }, { flap: 0.5 }, { flap: -0.4, eyes: 'blink' }, { flap: 0.5 }, { }] },   // twirls
});
