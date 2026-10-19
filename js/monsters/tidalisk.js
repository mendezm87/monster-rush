// The tidalisk family: tidalisk, maelstrisk. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  tidalisk(g, v = 'front') {
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[5, 25], [0, 20], [1, 29]], Fn);
      g.ellipse(15, 26, 12, 4.5, B, { edge: true });
      earB.poly([[14, 10], [6, 5], [11, 14]], Fn);
      b.ellipse(17, 19, 5.5, 8, B, { edge: true });
      b.ellipse(19.5, 21, 2.5, 6, C);
      h.poly([[15, 7], [13, 0], [19, 5]], Fn);
      h.ellipse(20, 10, 7, 5.5, B, { edge: true });
      h.ellipse(25, 12, 3, 2, C);
      rigEye(h, Q, 21, 8, () => { h.rect(21, 8, 2, 3, DARK_EYE); h.px(21, 8, '#ffffff'); });
      rigMouth(h, Q, 24, 12, 2);
      g.px(10, 26, '#7ab4ff'); g.px(7, 25, '#7ab4ff');
      return;
    }
    if (v === 'back') {
      t.poly([[26, 25], [31, 20], [30, 29]], Fn);
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      b.ellipse(16, 19, 6, 8, B, { edge: true });
      h.ellipse(16, 10, 7, 5.5, B, { edge: true });
      earA.poly([[10, 9], [2, 4], [8, 13]], Fn); earB.poly([[22, 9], [30, 4], [24, 13]], Fn);
      h.poly([[14, 6], [16, 0], [19, 6]], Fn);
      for (const y of [13, 16, 19, 22]) b.rect(15, y, 2, 2, '#7ab4ff');
      return;
    }
    h.poly([[14, 6], [16, 0], [19, 6]], Fn);
    earA.poly([[10, 9], [2, 4], [8, 13]], Fn); earB.poly([[22, 9], [30, 4], [24, 13]], Fn);
    g.ellipse(16, 26, 12, 4.5, B, { edge: true });
    b.ellipse(16, 19, 6, 8, B, { edge: true });
    b.ellipse(16, 21, 3.5, 6, C);
    h.ellipse(16, 10, 7, 5.5, B, { edge: true });
    h.ellipse(16, 13, 4, 2, C);
    rigEyes(h, Q, 32, 12, 9, 2, () => h.eyes(12, 9, DARK_EYE));
    rigMouth(h, Q, 15, 13, 2);
    g.pxM(9, 26, '#7ab4ff'); g.pxM(6, 25, '#7ab4ff');
  },
  // Tidalisk grown into a sea dragon: a coiled body, teal fin-wings, gold horns,
  // long whiskers and a belly of cream scales.
  maelstrisk(g, v = 'front') {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                  // tail fin
      g.ellipse(20, 37, 18, 6, B, { edge: true });                                              // coil
      for (const x of [10, 16, 22, 28]) g.rect(x, 39, 3, 1, '#1a3a8a');
      b.poly([[19, 18], [13, 25], [19, 33]], Fn, { edge: true });                               // dorsal fin
      b.ellipse(24, 27, 6.5, 10, B, { edge: true });                                            // neck
      b.ellipse(28, 29, 3, 8, C);
      for (const y of [24, 28, 32]) b.rect(27, y, 3, 1, '#cdbb88');
      h.poly([[22, 8], [20, 0], [27, 6]], Fn);                                                  // crest
      h.ellipse(28, 13, 8.5, 6.5, B, { edge: true });                                           // head
      earA.poly([[27, 8], [31, 0], [32, 7]], H, { edge: true });                                // horn
      h.ellipse(35, 16, 5, 3, C);                                                               // snout
      h.poly([[35, 18], [43, 23], [42, 24], [34, 19]], Wh);                                     // whisker
      rigEye(h, Q, 30, 11, () => { h.rect(30, 11, 2, 3, DARK_EYE); h.px(30, 11, '#ffffff'); });
      h.px(29, 9, OUTLINE); h.px(30, 9, OUTLINE); h.px(31, 10, OUTLINE);
      rigMouth(h, Q, 36, 17, 3, () => h.px(39, 15, OUTLINE));
      return;
    }
    if (v === 'back') {
      t.poly([[38, 36], [43, 29], [43, 43]], Fn, { edge: true });
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      b.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                       // fin-wings
      b.ellipse(22, 27, 7.5, 10, B, { edge: true });
      h.ellipse(22, 13, 9, 7, B, { edge: true });
      h.polyM([[16, 16], [7, 20], [8, 21], [17, 17]], Wh);                                      // whiskers from behind
      earA.poly([[15, 8], [10, 0], [17, 5]], H, { edge: true }); earB.poly([[29, 8], [34, 0], [27, 5]], H, { edge: true });
      h.poly([[19, 7], [22, 0], [25, 7]], Fn);
      for (const y of [19, 24, 29, 34]) b.poly([[20, y], [22, y - 4], [24, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(22, 37, 18, 6, B, { edge: true });                                                // coil
    for (const x of [8, 14, 27, 33]) g.rect(x, 39, 3, 1, '#1a3a8a');
    b.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                         // fin-wings
    b.ellipse(22, 27, 7.5, 10, B, { edge: true });                                              // neck
    b.ellipse(22, 29, 4, 8, C);                                                                 // belly scales
    for (const y of [23, 26, 29, 32, 35]) b.rect(19, y, 6, 1, '#cdbb88');
    h.poly([[19, 7], [22, 0], [25, 7]], Fn);                                                    // crest
    earA.poly([[15, 8], [10, 0], [17, 5]], H, { edge: true }); earB.poly([[29, 8], [34, 0], [27, 5]], H, { edge: true });   // gold horns
    h.ellipse(22, 13, 9, 7, B, { edge: true });                                                 // head
    h.ellipse(22, 17, 5.5, 3.5, C);                                                             // snout
    h.polyM([[17, 17], [8, 21], [9, 22], [18, 18]], Wh);                                        // whiskers
    rigEyes(h, Q, 44, 16, 11, 2, () => h.eyes(16, 11, DARK_EYE, { brow: true }));
    rigMouth(h, Q, 20, 17, 4, () => { h.px(20, 17, OUTLINE); h.px(23, 17, OUTLINE); });
  },
});
Object.assign(MONSTER_ART_DIAG, {
  tidalisk(g, v) {
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'bside') {
      t.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                   // tail fin
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      b.ellipse(17, 19, 6, 8, B, { edge: true });
      h.ellipse(18, 10, 7, 5.5, B, { edge: true });
      h.ellipse(24, 12, 1.6, 1.4, C);                                                            // snout peeking out
      earB.poly([[12, 9], [4, 4], [10, 13]], Fn); earA.poly([[23, 8], [30, 3], [25, 12]], Fn);   // head fins
      h.poly([[16, 6], [18, 0], [21, 6]], Fn);
      for (const y of [13, 16, 19, 22]) b.rect(16, y, 2, 2, '#7ab4ff');                          // spine spots
      return;
    }
    t.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                     // tail fin
    h.poly([[16, 6], [18, 0], [21, 6]], Fn);                                                     // crest
    earB.poly([[11, 9], [3, 4], [8, 13]], Fn); earA.poly([[23, 8], [29, 4], [25, 12]], Fn);     // head fins
    g.ellipse(15, 26, 12, 4.5, B, { edge: true });                                               // coil
    b.ellipse(17, 19, 6, 8, B, { edge: true });                                                  // neck
    b.ellipse(18.5, 21, 3, 6, C);                                                                // belly
    h.ellipse(18, 10, 7, 5.5, B, { edge: true });                                                // head
    h.ellipse(20.5, 13, 4, 2, C);                                                                // snout, turned its way
    rigEye(h, Q, 14, 9, () => { h.rect(14, 9, 2, 3, DARK_EYE); h.px(14, 9, '#ffffff'); });
    rigEye(h, Q, 21, 9, () => { h.rect(21, 9, 2, 3, DARK_EYE); h.px(21, 9, '#ffffff'); });
    rigMouth(h, Q, 19, 13, 3);
    g.px(9, 26, '#7ab4ff'); g.px(6, 25, '#7ab4ff');
  },
  maelstrisk(g, v) {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const horns = () => { earB.poly([[17, 8], [12, 0], [19, 5]], H, { edge: true }); earA.poly([[28, 7], [32, 0], [30, 6]], H, { edge: true }); };
    t.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                     // tail fin
    if (v === 'bside') {
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      b.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                        // fin-wings
      b.poly([[31, 21], [41, 14], [39, 24], [33, 28]], Fn, { edge: true });
      b.ellipse(23, 27, 7.5, 10, B, { edge: true });
      h.ellipse(24, 13, 9, 7, B, { edge: true });
      h.ellipse(32.5, 15, 2, 2, C);                                                              // snout peeking out
      h.poly([[18, 16], [9, 20], [10, 21], [19, 17]], Wh); h.poly([[31, 16], [39, 19], [38, 20], [30, 17]], Wh);
      horns();
      h.poly([[21, 7], [24, 0], [27, 7]], Fn);
      for (const y of [19, 24, 29, 34]) b.poly([[21, y], [23, y - 4], [25, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(21, 37, 18, 6, B, { edge: true });                                                 // coil
    for (const x of [9, 15, 28, 34]) g.rect(x, 39, 3, 1, '#1a3a8a');
    b.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                          // fin-wings
    b.poly([[30, 21], [39, 14], [38, 23], [33, 27]], Fn, { edge: true });
    b.ellipse(23, 27, 7.5, 10, B, { edge: true });                                               // neck
    b.ellipse(25, 29, 4, 8, C);                                                                  // belly scales
    for (const y of [23, 26, 29, 32, 35]) b.rect(22, y, 6, 1, '#cdbb88');
    h.poly([[21, 7], [24, 0], [27, 7]], Fn);                                                     // crest
    horns();
    h.ellipse(24, 13, 9, 7, B, { edge: true });                                                  // head
    h.ellipse(26.5, 17, 5.5, 3.5, C);                                                            // snout, turned its way
    h.poly([[21, 17], [12, 21], [13, 22], [22, 18]], Wh); h.poly([[31, 17], [38, 20], [37, 21], [30, 18]], Wh);   // whiskers
    rigEye(h, Q, 19, 11, () => { h.rect(19, 11, 2, 3, DARK_EYE); h.px(19, 11, '#ffffff'); });
    h.px(18, 9, OUTLINE).px(19, 9, OUTLINE).px(20, 10, OUTLINE).px(21, 10, OUTLINE);
    rigEye(h, Q, 28, 11, () => { h.rect(28, 11, 2, 3, DARK_EYE); h.px(28, 11, '#ffffff'); });
    h.px(30, 9, OUTLINE).px(29, 9, OUTLINE).px(28, 10, OUTLINE).px(27, 10, OUTLINE);
    rigMouth(h, Q, 25, 17, 4, () => { h.px(25, 17, OUTLINE); h.px(28, 17, OUTLINE); });
  },
});
Object.assign(RIGGED, { tidalisk: 'slither', maelstrisk: 'slither' });
