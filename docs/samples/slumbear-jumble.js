// Slumbear redesign mock-up, "jumbled bears" (r125; not loaded by the game). The owner: "what if we try a mix
// of different bears combined, as if the data on all bears was jumbled up". A huge round sleepy creature
// stitched together from the records of different bears: a grizzly-brown body with a shoulder hump, a
// polar-white patch over one side, a sun bear's golden chest mark, one panda eye patch and one spectacled
// bear's cream eye ring, mismatched ears, arms and legs, all joined by stitched seams.
// To see it: (0, eval)(await (await fetch('docs/samples/slumbear-jumble.js')).text()) adds 'slumbearJumble'.
(function () {
  const G = P('#8a5a3a', '#6a4028', '#a87850'), WH = P('#f1eee8', '#d2ccc0', '#ffffff'), K = P('#3a3640', '#25222a', '#56525e');
  const CIN = P('#b8703e', '#8c522c', '#d6905c'), SUN = P('#e2b264', '#b88a44', '#f2d49a'), RING = '#efe0b8', MUZ = P('#e8dcc0', '#c8b898', '#f8f0dc');
  const SEAM = '#d8ceb8', SEAMD = '#4a3a30', NOSE = '#1e1a22';
  // stitches along a seam: short dashes across it, in a thread that shows on either fur
  const seamLine = (p, pts, col = SEAM) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k += 2) p.px(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), col); } };

  MONSTER_ART.slumbearJumble = function (g, v = 'front') {
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    if (side) {
      legB.ellipse(16, 40, 4.5, 3, P(WH.s, '#b8b2a6', WH.b), { edge: true });                    // far leg: polar white
      t.ellipse(6, 31, 2.4, 2.2, K, { edge: true });                                          // a short black tail
      b.ellipse(21, 28, 15, 13, G, { edge: true });                                          // grizzly body
      b.ellipse(15, 19, 7, 4, G, { edge: true });                                            // the grizzly's shoulder hump
      b.poly([[26, 16], [35, 22], [36, 34], [30, 40], [22, 40], [24, 28]], WH, { edge: true });   // a polar-white patch over the front
      seamLine(b, [[26, 16], [24, 28], [22, 40]]);
      b.poly([[30, 24], [35, 27], [33, 31], [30, 28]], SUN);                                  // the sun bear's golden mark on its chest
      legA.ellipse(28, 40, 4.5, 3, K, { edge: true });                                       // near leg: panda black
      armA.ellipse(30, 28, 3.4, 5, CIN, { edge: true });                                     // near arm: cinnamon
      earB.ellipse(20.5, 7, 2.4, 2.4, P(WH.s, '#b8b2a6', WH.b));                              // far ear: polar
      h.ellipse(26, 14, 9, 7.8, G, { edge: true });                                          // head
      earA.ellipse(23.5, 6.5, 3, 3, K, { edge: true });                                      // near ear: panda
      h.ellipse(28.5, 12.5, 2.8, 2.4, RING);                                                  // the spectacled bear's cream eye ring
      rigEye(h, Q, 28, 12, () => { h.rect(28, 12, 2, 1, NOSE); h.rect(28, 13, 2, 1, G.s); }, 3);   // heavy sleepy eye
      h.ellipse(32.5, 16.5, 3.6, 3, MUZ, { edge: true });                                    // a short bear muzzle
      h.rect(35, 15, 2, 2, NOSE); h.px(35, 15, '#5a5060');
      rigMouth(h, Q, 31, 19, 3, () => { h.rect(31, 19, 3, 1, G.s); });
      seamLine(h, [[22, 9], [24, 20]], SEAMD);                                                // a seam where two heads' data were joined
      return;
    }
    if (v === 'back') {
      legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, WH, { edge: true });
      b.ellipse(22, 28, 16, 13, G, { edge: true });
      b.ellipse(22, 18.5, 10, 4, G, { edge: true });                                         // shoulder hump
      b.poly([[22, 22], [37, 24], [37, 34], [28, 40], [22, 40]], WH, { edge: true });          // polar-white patch
      seamLine(b, [[22, 22], [22, 40]]);
      armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, CIN, { edge: true });
      earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, WH, { edge: true });
      h.ellipse(22, 13, 11, 8.5, G, { edge: true });
      seamLine(h, [[22, 5], [22, 21]], SEAMD);
      t.ellipse(22, 37, 2.6, 2.2, K, { edge: true });
      return;
    }
    legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, WH, { edge: true });   // one panda leg, one polar leg
    b.ellipse(22, 28, 16, 13, G, { edge: true });                                            // grizzly body
    b.poly([[22, 17], [33, 19], [37, 27], [35, 35], [29, 39.5], [23, 40]], WH, { edge: true });   // polar-white patch down one side
    seamLine(b, [[22, 17], [23, 28], [23, 40]]);
    b.poly([[13, 20], [18, 20], [19.5, 22.5], [22, 23.5], [24.5, 22.5], [26, 20], [31, 20], [29, 27.5], [22, 31], [15, 27.5]], SUN, { edge: true });   // the sun bear's golden U across its chest
    armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, CIN, { edge: true });   // panda arm, cinnamon arm
    earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, WH, { edge: true });     // mismatched ears
    h.ellipse(22, 13, 11, 8.5, G, { edge: true });                                           // head
    h.poly([[22, 5], [32, 8], [33, 16], [22, 21]], P('#9a6a48', '#7a5034', '#b88a64'));       // the other half of its face, a slightly different brown
    seamLine(h, [[22, 5], [22, 21]], SEAMD);
    h.poly([[13, 10], [19, 10.5], [19, 14.5], [14, 15]], K);                                  // a panda's eye patch on one side
    h.ellipse(27.5, 12.5, 3.2, 2.6, RING);                                                    // a spectacled bear's eye ring on the other
    rigEyes(h, Q, 44, 15, 12, 3, () => { h.rect(15, 12, 3, 1, '#e6ddcc'); h.px(17, 12, '#fffaf2'); h.rect(26, 12, 3, 1, NOSE); h.rect(26, 13, 3, 1, G.s); });   // heavy sleepy lids
    h.ellipse(22, 17.5, 5, 3.4, MUZ, { edge: true });                                        // a short bear muzzle
    h.rect(20, 15, 4, 2, NOSE); h.px(20, 15, '#5a5060');                                     // nose
    rigMouth(h, Q, 20, 19, 4, () => { h.rect(21, 19, 2, 1, G.s); h.px(20, 18, G.s); h.px(23, 18, G.s); });
  };
  RIGGED.slumbearJumble = 'biped';
  if (!ROSTER_BY_ID.slumbearJumble) { const d = { ...ROSTER_BY_ID.slumbear, id: 'slumbearJumble', name: 'SLUMBEAR JUMBLE' }; EVOLVED.push(d); ROSTER_BY_ID[d.id] = d; }
})();
