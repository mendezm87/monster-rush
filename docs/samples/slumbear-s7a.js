// Slumbear redesign mock-up, S7a "patchwork panda" (r123; not loaded by the game). To see it, open the game,
// then in the console: (0, eval)(await (await fetch('docs/samples/slumbear-s7a.js')).text()) adds 'slumbearS7a'
// (start a run and App.run.party[0].setDef(ROSTER_BY_ID.slumbearS7a)). Front, side and back only.
// r124 (the owner: "I don't know that I like the hippo look"): three other faces, slumbearS7a_button
// (a short soft snout with a button nose), _plush (a flat face with an embroidered nose and a seam), _pillow
// (a flat face with a piped seam across it).
// A huge round sleepy creature with a soft quilted hide like an old mattress, cream, with charcoal
// patches sewn on (round the eyes, the ears, the stubby arms and legs, a band across the shoulders),
// a broad hippo-like muzzle, a cloth button on its belly and a tuft of stuffing poking out of a seam.
(function () {
  const C = P('#f1ebdc', '#d2c6ae', '#fffaf2'), K = P('#3e3a46', '#28252e', '#5a5664'), M = P('#f8f1e4', '#ddd0b8', '#ffffff');
  const STITCH = '#c4b598', THREAD = '#9c96a8', STUFF = '#ffffff', NOSE = '#2a2630';
  // diamond quilting stitched across a round shape (dashed diagonal lines), inside the ellipse only
  const quilt = (p, cx, cy, rx, ry, step = 6) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 > 0.78) continue;
      const a = ((x + y) % step + step) % step, b = ((x - y) % step + step) % step;
      if ((a === 0 || b === 0) && (x + y) % 2 === 0) p.px(x, y, STITCH);
    }
  };
  // stitches round a sewn-on patch: light thread dots along its edge
  const stitches = (p, cx, cy, rx, ry, n = 10) => { for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; p.px(Math.round(cx + Math.cos(t) * (rx - 0.6) - 0.5), Math.round(cy + Math.sin(t) * (ry - 0.6) - 0.5), THREAD); } };

  const draw = (g, v, face) => {
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    if (side) {
      legB.ellipse(16, 40, 4.5, 3, P(K.s, '#1c1a20', K.b), { edge: true });                      // far leg
      t.ellipse(6.5, 32, 2.4, 2.2, C, { edge: true }); t.px(5, 31, STUFF).px(6, 31, STUFF);   // stubby tail with a wisp of stuffing
      b.ellipse(21, 28, 15, 13, C, { edge: true });                                          // the huge round body
      quilt(b, 21, 28, 15, 13);
      b.ellipse(24, 18.5, 8, 4.2, K, { edge: true }); stitches(b, 24, 18.5, 8, 4.2, 12);       // patch band over the shoulder
      b.ellipse(33.5, 31, 2.2, 2.4, C.s); b.px(33, 30, K.s).px(34, 31, K.s);                   // the button, side on
      b.px(8, 25, STUFF).px(7, 26, STUFF).px(8, 26, STUFF);                                    // stuffing poking out of a seam
      legA.ellipse(28, 40, 4.5, 3, K, { edge: true }); legA.px(26, 41, THREAD).px(28, 42, THREAD).px(30, 41, THREAD);
      armA.ellipse(30, 28, 3.4, 5, K, { edge: true });                                       // stubby arm, held forward
      earB.ellipse(20.5, 7, 2.4, 2.4, P(K.s, '#1c1a20', K.b));
      h.ellipse(26, 14, 9, 7.8, C, { edge: true });                                          // round head
      earA.ellipse(23.5, 6.5, 3, 3, K, { edge: true });
      h.ellipse(28.5, 12.5, 3, 2.5, K);                                                       // eye patch
      rigEye(h, Q, 28, 12, () => { h.rect(28, 13, 2, 1, '#e6ddcc'); h.px(29, 13, '#fffaf2'); }, 3);   // heavy sleepy eye
      if (face === 'hippo') {
        h.ellipse(32.5, 17, 4.4, 3.6, M, { edge: true });                                    // broad hippo-like muzzle
        h.px(36, 15, NOSE).px(36, 16, NOSE);                                                  // nostril
        rigMouth(h, Q, 31, 19, 4, () => { h.rect(31, 19, 3, 1, K.s); h.px(34, 18, K.s); });
      } else if (face === 'button') {
        h.ellipse(33, 16.5, 3.2, 2.6, M, { edge: true });                                    // a short soft snout
        h.ellipse(35.5, 15, 1.4, 1.2, NOSE); h.px(35, 14, THREAD);                            // a round button nose
        rigMouth(h, Q, 31, 19, 3, () => { h.rect(31, 19, 2, 1, K.s); h.px(33, 18, K.s); });
      } else if (face === 'plush') {
        h.rect(33, 14, 2, 2, NOSE); h.px(33, 14, THREAD);                                     // an embroidered nose on a flat face
        h.px(33, 16, STITCH).px(33, 17, STITCH);                                              // the seam down its face, like a plush toy
        rigMouth(h, Q, 30, 18, 3, () => { h.rect(30, 18, 3, 1, K.s); h.px(33, 18, K.s); h.px(29, 17, K.s); });
        h.px(30, 15, '#e8c8bc');                                                              // a rosy cheek
      } else {                                                                                // pillow: a piped seam across the lower face
        h.rect(27, 17, 8, 1, STITCH);
        h.px(33, 14, NOSE).px(34, 15, NOSE).px(34, 14, NOSE).px(33, 15, NOSE);                // a small stitched nose
        rigMouth(h, Q, 30, 19, 4, () => { h.rect(30, 19, 4, 1, K.s); });
      }
      return;
    }
    if (v === 'back') {
      legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, K, { edge: true });
      b.ellipse(22, 28, 16, 13, C, { edge: true });
      quilt(b, 22, 28, 16, 13);
      b.ellipse(22, 19, 13, 4, K, { edge: true }); stitches(b, 22, 19, 13, 4, 18);              // the band across his shoulders
      b.rect(26, 27, 7, 6, K.b); b.rect(26, 27, 7, 1, THREAD).rect(26, 32, 7, 1, THREAD);         // a square patch sewn on his back
      b.px(26, 29, THREAD).px(32, 30, THREAD);
      armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, K, { edge: true });
      earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, K, { edge: true });
      h.ellipse(22, 13, 11, 8.5, C, { edge: true });
      t.ellipse(22, 37, 2.6, 2.2, C, { edge: true }); t.px(21, 36, STUFF);                     // stubby tail
      return;
    }
    legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, K, { edge: true });   // stubby dark legs
    legA.px(12, 41, THREAD).px(14, 42, THREAD).px(16, 41, THREAD); legB.px(28, 41, THREAD).px(30, 42, THREAD).px(32, 41, THREAD);
    b.ellipse(22, 28, 16, 13, C, { edge: true });                                            // the huge round quilted body
    quilt(b, 22, 28, 16, 13);
    b.ellipse(22, 19, 13, 4, K, { edge: true }); stitches(b, 22, 19, 13, 4, 18);                // charcoal band across the shoulders
    b.ellipse(22, 31, 2.6, 2.6, P('#e6dcc8', '#bcae94', '#fffaf0'), { edge: true });            // a big cloth button on the belly
    b.px(21, 30, K.s).px(23, 30, K.s).px(21, 32, K.s).px(23, 32, K.s);
    b.px(35, 33, STUFF).px(36, 32, STUFF).px(36, 34, STUFF).px(37, 33, STUFF);                 // stuffing poking out of a seam
    armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, K, { edge: true });   // stubby dark arms
    stitches(armA, 7, 26, 3.6, 6, 8); stitches(armB, 37, 26, 3.6, 6, 8);
    earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, K, { edge: true });   // tiny round ears
    h.ellipse(22, 13, 11, 8.5, C, { edge: true });                                           // head
    h.poly([[13, 10], [19, 10.5], [19, 14.5], [14, 15]], K); h.poly([[31, 10], [25, 10.5], [25, 14.5], [30, 15]], K);   // drooping eye patches
    rigEyes(h, Q, 44, 15, 12, 3, () => { h.rectM(15, 12, 3, 1, '#e6ddcc'); h.pxM(17, 12, '#fffaf2'); });   // heavy sleepy lids
    if (face === 'hippo') {
      h.ellipse(22, 17.5, 7, 4, M, { edge: true });                                          // broad hippo-like muzzle
      h.px(19, 16, NOSE).px(24, 16, NOSE);                                                   // nostrils
      rigMouth(h, Q, 19, 19, 6, () => { h.rect(20, 19, 4, 1, K.s); h.px(19, 18, K.s); h.px(24, 18, K.s); });   // a slow, sleepy smile
    } else if (face === 'button') {
      h.ellipse(22, 17, 4.6, 3, M, { edge: true });                                          // a short soft snout
      h.ellipse(22, 15.6, 1.8, 1.3, NOSE); h.px(21, 15, THREAD).px(22, 15, THREAD);          // a round button nose with its thread
      rigMouth(h, Q, 20, 18, 4, () => { h.rect(21, 19, 2, 1, K.s); h.px(20, 18, K.s); h.px(23, 18, K.s); });
    } else if (face === 'plush') {
      h.rect(20, 15, 4, 1, NOSE); h.rect(21, 16, 2, 1, NOSE); h.px(20, 15, THREAD);          // an embroidered nose on a flat face
      h.px(21, 17, STITCH); h.px(22, 17, STITCH);                                            // the seam down its face, like a plush toy
      rigMouth(h, Q, 19, 18, 6, () => { h.px(19, 18, K.s); h.rect(20, 19, 4, 1, K.s); h.px(24, 18, K.s); });
      h.pxM(13, 16, '#e8c8bc'); h.pxM(14, 16, '#e8c8bc');                                    // rosy cheeks
    } else {                                                                                  // pillow: a piped seam across the lower face
      h.rect(13, 17, 18, 1, STITCH);
      h.px(21, 14, NOSE).px(22, 15, NOSE).px(22, 14, NOSE).px(21, 15, NOSE);                 // a small stitched nose
      rigMouth(h, Q, 18, 19, 8, () => { h.rect(19, 19, 6, 1, K.s); h.px(18, 18, K.s); h.px(25, 18, K.s); });
    }
  };
  MONSTER_ART.slumbearS7a = (g, v = 'front') => draw(g, v, 'hippo');
  for (const f of ['button', 'plush', 'pillow']) { MONSTER_ART['slumbearS7a_' + f] = (g, v = 'front') => draw(g, v, f); RIGGED['slumbearS7a_' + f] = 'biped'; }
  RIGGED.slumbearS7a = 'biped';
  for (const id of ['slumbearS7a', 'slumbearS7a_button', 'slumbearS7a_plush', 'slumbearS7a_pillow'])
    if (!ROSTER_BY_ID[id]) { const d = { ...ROSTER_BY_ID.slumbear, id, name: 'SLUMBEAR ' + id.slice(9).toUpperCase() }; EVOLVED.push(d); ROSTER_BY_ID[d.id] = d; }
})();
