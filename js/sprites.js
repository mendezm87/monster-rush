// Original monster designs, drawn procedurally with the PixGrid primitives.
// Each draw function receives an empty grid and paints back-to-front.

const P = (b, s, l) => ({ b, s, l });
const DARK_EYE = '#1a1222';
// Toshi's colours (from photos of the real dog), shared by Smugshi and Smugshogun
const TOSHI = { coat: P('#d08548', '#a85e2c', '#e8a868'), white: P('#f7f1e6', '#e2d4bf', '#ffffff'), ear: '#f1dcc4' };

const MONSTER_ART = {
  // ---- evolved starters (44px, their own designs) ----

  // Toshi all grown up: the same red Shiba with the cream mask, white socks, eyebrow
  // spots and smug half-shut eyes, now with a ruff, a samurai headband and a red cape.
  smugshogun(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    if (v === 'side') {
      g.ellipse(8, 22, 6, 6, O, { edge: true });                                                // curled tail
      g.ellipse(7.5, 21.5, 3, 3, C); g.px(7, 21, O.s);
      g.poly([[15, 22], [27, 22], [24, 40], [3, 38]], R, { edge: true });                       // cape streaming back
      g.rect(4, 37, 20, 1, Gd);
      g.ellipse(13, 40, 3, 2, C, { edge: true });
      g.ellipse(19, 31, 11, 8, O, { edge: true });                                              // body
      g.ellipse(27, 33, 4.5, 6, C);                                                             // cream chest
      g.ellipse(26, 40, 3, 2, C, { edge: true });
      g.ellipse(26, 24, 6, 4, C, { edge: true });                                               // neck ruff
      g.poly([[20, 11], [19, 2], [24, 8]], O);                                                  // far ear
      g.ellipse(27, 16, 9.5, 8, O, { edge: true });                                             // head
      g.poly([[25, 10], [28, 0], [31, 9]], O, { edge: true });                                  // near ear
      g.poly([[27, 8.5], [28, 3], [30, 8]], C.b);
      g.ellipse(35, 20, 5.5, 3.6, C);                                                           // muzzle
      g.ellipse(29, 20, 3, 2, C);
      g.rect(18, 9, 17, 2, Wb.b); g.rect(18, 10, 17, 1, Wb.s);                                   // headband
      g.poly([[19, 9], [9, 6], [11, 13]], Wb, { edge: true });                                   // its tails, flying back
      g.ellipse(32, 10, 1.5, 1.1, '#c8303a');
      g.px(29, 12, C.b); g.px(30, 12, C.b);                                         // eyebrow spot
      g.rect(29, 14, 5, 1, OUTLINE); g.rect(30, 15, 3, 1, DARK_EYE);                             // smug lid
      g.rect(39, 18, 3, 2, OUTLINE);                                                            // nose
      g.px(35, 23, OUTLINE).px(36, 23, OUTLINE).px(37, 23, OUTLINE).px(38, 22, OUTLINE);        // smirk
      return;
    }
    if (v === 'back') {
      g.ellipseM(15, 40, 3.5, 2.2, C, { edge: true });
      g.ellipse(22, 31, 10, 8.5, O, { edge: true });
      g.poly([[12, 23], [32, 23], [36, 40], [8, 40]], R, { edge: true });                       // the cape
      g.rect(9, 39, 26, 1, Gd);
      g.ellipseM(12, 23, 3, 2, C);                                                              // ruff peeking out
      g.polyM([[12, 12], [11, 1], [19, 8]], O, { edge: true });
      g.ellipse(22, 15, 11, 8.5, O, { edge: true });
      g.rect(11, 9, 22, 2, Wb.b); g.rect(11, 10, 22, 1, Wb.s);
      g.rect(20, 9, 4, 3, Wb.l);                                                                // headband knot
      g.poly([[21, 11], [17, 21], [20, 20]], Wb, { edge: true }); g.poly([[23, 11], [27, 21], [24, 20]], Wb, { edge: true });
      g.ellipse(22, 30, 6, 5.5, O, { edge: true });                                             // the famous curled tail
      g.ellipse(22, 29.5, 3.2, 2.8, C); g.px(22, 29, O.s); g.px(23, 29, O.s);
      return;
    }
    g.ellipse(36, 25, 6.5, 6.5, O, { edge: true });                                             // tail
    g.ellipse(36.5, 24.5, 3.5, 3.5, C); g.px(36, 24, O.s);
    g.poly([[11, 23], [33, 23], [38, 40], [6, 40]], R, { edge: true });                         // cape behind
    g.rect(6, 39, 4, 1, Gd); g.rect(34, 39, 4, 1, Gd);
    g.ellipseM(15, 40, 3.5, 2.2, C, { edge: true });                                            // white socks
    g.ellipse(22, 31, 10, 8.5, O, { edge: true });
    g.ellipse(22, 33, 6, 6.5, C);                                                               // cream chest
    g.ellipse(22, 24, 10, 4, C, { edge: true });                                                // neck ruff
    g.ellipse(22, 24.5, 2, 2, Gd); g.px(22, 24, '#a87a1a');                                     // gold clasp
    g.polyM([[12, 12], [11, 1], [19, 8]], O, { edge: true });
    g.polyM([[13.5, 10], [12.5, 4], [17, 8]], C.b);
    g.ellipse(22, 15, 11, 8.5, O, { edge: true });
    g.ellipse(22, 19.5, 7, 4.5, C);                                                             // muzzle
    g.ellipseM(13, 18, 2.2, 1.8, C);
    g.rect(11, 9, 22, 2, Wb.b); g.rect(11, 10, 22, 1, Wb.s);                                     // headband
    g.ellipse(22, 9.5, 1.8, 1.4, '#c8303a');
    g.poly([[32, 9], [41, 5], [40, 12]], Wb, { edge: true });
    g.pxM(15, 12, C.b); g.pxM(16, 12, C.b);                                         // eyebrow spots
    g.rectM(14, 14, 5, 1, OUTLINE);                                                             // smug lids
    g.rectM(15, 15, 3, 1, DARK_EYE);
    g.rect(21, 17, 3, 2, OUTLINE);                                                              // nose
    g.px(20, 22, OUTLINE).px(21, 22, OUTLINE).px(22, 22, OUTLINE).px(23, 21, OUTLINE);          // smirk
  },

  // Cinderox grown into a magma bull: a blazing mane, curved horns, lava-cracked rock
  // armour on the shoulders and a gold nose ring.
  infernox(g, v = 'front') {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const cracks = pts => { for (const [x, y] of pts) { g.px(x, y, L); g.px(x + 1, y + 1, Gl); } };
    if (v === 'side') {
      g.poly([[7, 30], [1, 25], [3, 32]], B); g.ellipse(2, 24, 2, 2.4, F);                       // tail, flame tip
      g.ellipse(12, 39, 3.5, 3, Rk, { edge: true }); g.ellipse(25, 39, 3.5, 3, Rk, { edge: true });
      g.poly([[7, 26], [9, 11], [14, 22]], F); g.poly([[12, 21], [16, 5], [20, 18]], F); g.poly([[18, 17], [23, 3], [26, 16]], F);
      g.poly([[11, 22], [16, 12], [22, 15], [17, 24]], Gl);
      g.ellipse(19, 30, 14, 8.5, B, { edge: true });                                            // body
      g.ellipse(22, 34, 9, 4, C);
      g.ellipse(15, 40, 3.5, 3, Rk, { edge: true }); g.ellipse(29, 40, 3.5, 3, Rk, { edge: true });
      g.px(14, 42, L); g.px(29, 42, L);                                                         // glowing hooves
      cracks([[10, 28], [15, 25], [20, 29]]);
      g.ellipse(27, 25, 6, 5, Rk, { edge: true }); cracks([[25, 24], [28, 26]]);                // shoulder armour
      g.poly([[28, 14], [32, 6], [33, 13]], P('#b8a68a', '#8a7a62', '#d8ccb0'));                 // far horn
      g.ellipse(32, 19, 8, 7, B, { edge: true });                                               // head
      g.poly([[30, 15], [38, 5], [41, 7], [35, 16]], H, { edge: true });                        // horn
      g.ellipse(38, 22, 4.5, 3.2, C);                                                           // muzzle
      g.px(41, 21, OUTLINE);
      g.ellipse(40, 25, 1.6, 1.3, '#ffd23f');                                                   // nose ring
      g.rect(33, 16, 5, 1, OUTLINE); g.rect(34, 17, 3, 2, Gl); g.px(36, 17, '#ffffff');          // glowing eye
      return;
    }
    if (v === 'back') {
      g.ellipseM(13, 39, 4, 3, Rk, { edge: true });
      g.ellipse(22, 30, 13, 9, B, { edge: true });
      cracks([[14, 30], [28, 28], [18, 34], [26, 34]]);
      g.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[8, 24], [35, 25]]);
      g.ellipse(22, 18, 9, 7.5, B, { edge: true });
      g.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });       // horns
      g.poly([[8, 20], [10, 4], [16, 14]], F); g.poly([[14, 13], [18, 1], [22, 11]], F);        // blazing mane
      g.poly([[22, 11], [26, 1], [30, 13]], F); g.poly([[28, 14], [34, 4], [36, 20]], F);
      g.poly([[15, 13], [22, 6], [29, 13], [22, 17]], Gl);
      g.poly([[18, 34], [22, 21], [26, 34]], F); g.poly([[20, 32], [22, 25], [24, 32]], Gl);    // flames down the spine
      g.rect(21, 37, 2, 4, '#16224a'); g.ellipse(22, 41, 1.8, 1.8, F);                          // tail
      return;
    }
    g.poly([[8, 20], [10, 4], [16, 14]], F); g.poly([[14, 13], [18, 1], [22, 11]], F);          // blazing mane
    g.poly([[22, 11], [26, 1], [30, 13]], F); g.poly([[28, 14], [34, 4], [36, 20]], F);
    g.poly([[15, 12], [22, 5], [29, 12], [22, 16]], Gl);
    g.ellipseM(13, 39, 4, 3, Rk, { edge: true }); g.pxM(12, 41, L); g.pxM(14, 41, L);           // hooves
    g.ellipse(22, 30, 13, 9, B, { edge: true });                                                // body
    g.ellipse(22, 33, 8, 5.5, C);                                                               // belly
    cracks([[11, 32], [31, 31], [13, 35]]);
    g.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[7, 24], [35, 24], [9, 27]]);          // shoulder armour
    g.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });         // horns
    g.ellipse(22, 18, 10, 8, B, { edge: true });                                                // head
    g.ellipse(22, 23, 7, 3.5, C, { edge: true });                                               // broad muzzle
    g.rect(19, 23, 2, 1, OUTLINE); g.rect(24, 23, 2, 1, OUTLINE);                               // nostrils
    g.ellipse(22, 27, 2.2, 1.4, '#ffd23f'); g.px(22, 26, '#a87a1a');                            // nose ring
    g.rectM(14, 15, 6, 1, OUTLINE);                                                             // heavy brows
    g.rectM(15, 16, 4, 2, Gl); g.rectM(17, 16, 2, 2, '#ffffff');                                // glowing eyes
  },

  // Tidalisk grown into a sea dragon: a coiled body, teal fin-wings, gold horns,
  // long whiskers and a belly of cream scales.
  maelstrisk(g, v = 'front') {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    if (v === 'side') {
      g.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                  // tail fin
      g.ellipse(20, 37, 18, 6, B, { edge: true });                                              // coil
      for (const x of [10, 16, 22, 28]) g.rect(x, 39, 3, 1, '#1a3a8a');
      g.poly([[19, 18], [13, 25], [19, 33]], Fn, { edge: true });                               // dorsal fin
      g.ellipse(24, 27, 6.5, 10, B, { edge: true });                                            // neck
      g.ellipse(28, 29, 3, 8, C);
      for (const y of [24, 28, 32]) g.rect(27, y, 3, 1, '#cdbb88');
      g.poly([[22, 8], [20, 0], [27, 6]], Fn);                                                  // crest
      g.ellipse(28, 13, 8.5, 6.5, B, { edge: true });                                           // head
      g.poly([[27, 8], [31, 0], [32, 7]], H, { edge: true });                                   // horn
      g.ellipse(35, 16, 5, 3, C);                                                               // snout
      g.poly([[35, 18], [43, 23], [42, 24], [34, 19]], Wh);                                     // whisker
      g.rect(30, 11, 2, 3, DARK_EYE); g.px(30, 11, '#ffffff'); g.px(29, 9, OUTLINE); g.px(30, 9, OUTLINE); g.px(31, 10, OUTLINE);
      g.px(39, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      g.poly([[38, 36], [43, 29], [43, 43]], Fn, { edge: true });
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      g.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                       // fin-wings
      g.ellipse(22, 27, 7.5, 10, B, { edge: true });
      g.ellipse(22, 13, 9, 7, B, { edge: true });
      g.polyM([[16, 16], [7, 20], [8, 21], [17, 17]], Wh);                                      // whiskers from behind
      g.polyM([[15, 8], [10, 0], [17, 5]], H, { edge: true });
      g.poly([[19, 7], [22, 0], [25, 7]], Fn);
      for (const y of [19, 24, 29, 34]) g.poly([[20, y], [22, y - 4], [24, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(22, 37, 18, 6, B, { edge: true });                                                // coil
    for (const x of [8, 14, 27, 33]) g.rect(x, 39, 3, 1, '#1a3a8a');
    g.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                         // fin-wings
    g.ellipse(22, 27, 7.5, 10, B, { edge: true });                                              // neck
    g.ellipse(22, 29, 4, 8, C);                                                                 // belly scales
    for (const y of [23, 26, 29, 32, 35]) g.rect(19, y, 6, 1, '#cdbb88');
    g.poly([[19, 7], [22, 0], [25, 7]], Fn);                                                    // crest
    g.polyM([[15, 8], [10, 0], [17, 5]], H, { edge: true });                                    // gold horns
    g.ellipse(22, 13, 9, 7, B, { edge: true });                                                 // head
    g.ellipse(22, 17, 5.5, 3.5, C);                                                             // snout
    g.polyM([[17, 17], [8, 21], [9, 22], [18, 18]], Wh);                                        // whiskers
    g.eyes(16, 11, DARK_EYE, { brow: true });
    g.px(20, 17, OUTLINE); g.px(23, 17, OUTLINE);
  },

  sparkit(g, v = 'front') {
    if (v === 'side') {
      const Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.poly([[11, 23], [4, 16], [7, 15], [2, 8], [9, 12], [6, 13], [13, 20]], Y);
      g.poly([[14, 10], [11, 1], [17, 8]], Y); g.poly([[11, 1], [13, 2], [12, 4]], '#2a2230');
      g.ellipse(15, 23, 7, 6.5, Y, { edge: true });
      g.ellipse(12, 29, 3, 1.5, '#e0a722'); g.ellipse(19, 29, 3, 1.5, '#e0a722');
      g.poly([[18, 9], [19, 0], [23, 8]], Y, { edge: true }); g.poly([[19, 0], [21, 2], [19.5, 4]], '#2a2230');
      g.ellipse(18, 14, 8.5, 7.5, Y, { edge: true });
      g.ellipse(20, 22, 2, 2.5, Y, { edge: true });
      g.rect(21, 12, 2, 3, DARK_EYE); g.px(21, 12, '#ffffff');
      g.ellipse(23, 17, 2, 1.5, '#ff5a4a');
      g.px(25, 16, OUTLINE).px(24, 17, OUTLINE);
      return;
    }
    if (v === 'back') {
      const Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.polyM([[11, 11], [4, 1], [14, 8]], Y);
      g.polyM([[4, 1], [8, 2], [5, 5]], '#2a2230');
      g.ellipse(16, 23, 7, 6.5, Y, { edge: true });
      g.ellipseM(10.5, 22, 2, 2.5, Y, { edge: true });
      g.ellipse(16, 14, 9, 7.5, Y, { edge: true });
      g.ellipseM(12, 29, 3, 1.5, '#e0a722');
      g.rect(13, 20, 6, 1, '#c98a1a'); g.rect(14, 23, 4, 1, '#c98a1a');
      g.poly([[15, 27], [21, 20], [18, 19], [23, 11], [16, 15], [19, 16], [13, 23]], Y, { edge: true });
      return;
    }
    const Y = P('#ffd84a', '#e0a722', '#fff3a0');
    g.poly([[21, 23], [28, 16], [25, 15], [30, 8], [23, 12], [26, 13], [19, 20]], Y);           // bolt tail
    g.polyM([[11, 11], [4, 1], [14, 8]], Y);                                                   // ears
    g.polyM([[4, 1], [8, 2], [5, 5]], '#2a2230');                                              // ear tips
    g.ellipse(16, 23, 7, 6.5, Y, { edge: true });                                              // body
    g.ellipseM(10.5, 22, 2, 2.5, Y, { edge: true });                                           // arms
    g.ellipse(16, 14, 9, 7.5, Y, { edge: true });                                              // head
    g.ellipseM(12, 29, 3, 1.5, '#e0a722');                                                     // feet
    g.eyes(11, 12, DARK_EYE);
    g.ellipseM(9, 17, 2, 1.5, '#ff5a4a');                                                      // cheeks
    g.px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(14, 16, OUTLINE).px(17, 16, OUTLINE);          // mouth
    g.rect(13, 24, 6, 1, '#c98a1a');                                                           // back stripe hint
  },

  cinderox(g, v = 'front') {
    if (v === 'side') {
      const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
      g.poly([[7, 20], [1, 17], [7, 24]], F);
      g.poly([[12, 14], [13, 3], [17, 11]], F); g.poly([[16, 11], [19, 0], [22, 11]], F); g.poly([[21, 12], [25, 3], [25, 15]], F);
      g.poly([[15, 8], [19, 3], [23, 8], [19, 11]], '#ffd34a');
      g.ellipse(14, 21, 10, 7, B, { edge: true });
      g.ellipse(16, 24.5, 6, 4, C);
      g.ellipse(9, 28, 3, 2, C, { edge: true }); g.ellipse(19, 28, 3, 2, C, { edge: true });
      g.ellipse(20, 14, 7, 6, B, { edge: true });
      g.ellipse(24, 16.5, 3.5, 2.5, C);
      g.rect(21, 13, 3, 1, OUTLINE); g.px(23, 14, '#ff5a2a');
      g.px(26, 16, OUTLINE);
      return;
    }
    if (v === 'back') {
      const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0');
      g.polyM([[6, 20], [2, 18], [6, 23]], F);
      g.ellipse(16, 21, 10, 7, B, { edge: true });
      g.ellipseM(10, 28, 3, 2, B, { edge: true });
      g.ellipse(16, 14, 7, 6, B, { edge: true });
      g.poly([[7, 15], [9, 2], [14, 11]], F); g.poly([[12, 11], [16, 0], [20, 11]], F); g.poly([[18, 11], [23, 2], [25, 15]], F);
      g.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
      g.rect(15, 22, 2, 5, '#1f3054'); g.ellipse(16, 27.5, 1.6, 1.6, '#ff7a1c');
      return;
    }
    const F = P('#ff7a1c', '#e2401a', '#ffd34a');
    const B = P('#2f4a7a', '#1f3054', '#4a6aa0');
    const C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    g.poly([[7, 15], [9, 2], [14, 11]], F); g.poly([[12, 11], [16, 0], [20, 11]], F); g.poly([[18, 11], [23, 2], [25, 15]], F);
    g.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
    g.ellipse(16, 21, 10, 7, B, { edge: true });
    g.ellipse(16, 24, 7, 5, C);
    g.ellipse(16, 14, 7, 6, B, { edge: true });
    g.ellipse(16, 17, 4, 2.5, C);
    g.ellipseM(10, 28, 3, 2, C, { edge: true });
    g.rectM(10, 13, 3, 1, OUTLINE); g.pxM(12, 14, '#ff5a2a');                                   // narrow eyes
    g.px(15, 16, OUTLINE).px(16, 16, OUTLINE);
    g.polyM([[6, 20], [2, 18], [6, 23]], F);                                                    // flank flames
  },

  tidalisk(g, v = 'front') {
    if (v === 'side') {
      const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
      g.poly([[5, 25], [0, 20], [1, 29]], Fn);
      g.ellipse(15, 26, 12, 4.5, B, { edge: true });
      g.poly([[14, 10], [6, 5], [11, 14]], Fn);
      g.ellipse(17, 19, 5.5, 8, B, { edge: true });
      g.ellipse(19.5, 21, 2.5, 6, C);
      g.poly([[15, 7], [13, 0], [19, 5]], Fn);
      g.ellipse(20, 10, 7, 5.5, B, { edge: true });
      g.ellipse(25, 12, 3, 2, C);
      g.rect(21, 8, 2, 3, DARK_EYE); g.px(21, 8, '#ffffff');
      g.px(10, 26, '#7ab4ff'); g.px(7, 25, '#7ab4ff');
      return;
    }
    if (v === 'back') {
      const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
      g.poly([[26, 25], [31, 20], [30, 29]], Fn);
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      g.ellipse(16, 19, 6, 8, B, { edge: true });
      g.ellipse(16, 10, 7, 5.5, B, { edge: true });
      g.polyM([[10, 9], [2, 4], [8, 13]], Fn);
      g.poly([[14, 6], [16, 0], [19, 6]], Fn);
      for (const y of [13, 16, 19, 22]) g.rect(15, y, 2, 2, '#7ab4ff');
      return;
    }
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6');
    const Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    g.poly([[14, 6], [16, 0], [19, 6]], Fn);
    g.polyM([[10, 9], [2, 4], [8, 13]], Fn);
    g.ellipse(16, 26, 12, 4.5, B, { edge: true });
    g.ellipse(16, 19, 6, 8, B, { edge: true });
    g.ellipse(16, 21, 3.5, 6, C);
    g.ellipse(16, 10, 7, 5.5, B, { edge: true });
    g.ellipse(16, 13, 4, 2, C);
    g.eyes(12, 9, DARK_EYE);
    g.pxM(9, 26, '#7ab4ff'); g.pxM(6, 25, '#7ab4ff');
  },

  thornback(g, v = 'front') {
    if (v === 'side') {
      const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
      g.poly([[4, 22], [0, 24], [4, 26]], T);
      g.poly([[9, 13], [4, 4], [12, 11]], L); g.poly([[13, 11], [13, 1], [18, 10]], L);
      g.ellipse(9, 28, 3, 2.5, T, { edge: true }); g.ellipse(20, 28, 3, 2.5, T, { edge: true });
      g.ellipse(15, 19, 12, 9, S, { edge: true });
      for (const [x, y] of [[9, 16], [15, 13], [20, 16], [11, 21], [17, 21]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
      g.ellipse(26, 23, 4.5, 4, T, { edge: true });
      g.rect(27, 21, 1, 2, DARK_EYE); g.px(27, 21, '#ffffff');
      g.px(29, 24, OUTLINE);
      return;
    }
    if (v === 'back') {
      const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
      g.polyM([[10, 13], [6, 3], [14, 10]], L);
      g.poly([[13, 11], [16, 1], [19, 11]], L);
      g.ellipseM(8, 28, 3, 2.5, T, { edge: true });
      g.ellipse(16, 19, 12, 9, S, { edge: true });
      for (const [x, y] of [[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
      g.poly([[15, 26], [16, 30], [17, 26]], T);
      return;
    }
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a');
    const L = P('#8be04e', '#4fae2e', '#d4ff9a');
    const T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    g.polyM([[10, 13], [6, 3], [14, 10]], L);
    g.poly([[13, 11], [16, 1], [19, 11]], L);
    g.ellipseM(8, 28, 3, 2.5, T, { edge: true });
    g.ellipse(16, 19, 12, 9, S, { edge: true });
    // shell plates
    for (const [x, y] of [[11, 15], [16, 13], [21, 15], [13, 20], [19, 20]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
    g.ellipse(16, 23, 5.5, 4.5, T, { edge: true });
    g.rectM(13, 22, 1, 2, DARK_EYE); g.pxM(13, 22, '#ffffff');
    g.px(15, 25, OUTLINE).px(16, 25, OUTLINE);
  },

  slumbear(g, v = 'front') { // 44x44
    if (v === 'side') {
      const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
      g.ellipse(5, 30, 2.5, 2.5, B);
      g.ellipse(21, 8, 3.5, 3.5, B);
      g.ellipse(14, 41, 5, 2.5, C, { edge: true });
      g.ellipse(21, 27, 16, 14, B, { edge: true });
      g.ellipse(26, 31, 9, 9, C);
      g.ellipse(28, 41, 5, 2.5, C, { edge: true });
      g.ellipse(26, 14, 10, 8.5, B, { edge: true });
      g.ellipse(33, 17, 4.5, 3.5, C);
      g.ellipse(28, 27, 3.5, 6, B, { edge: true });
      g.rect(35, 15, 2, 2, OUTLINE);
      g.rect(28, 13, 4, 1, OUTLINE);
      g.px(33, 20, OUTLINE).px(34, 20, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
      g.ellipseM(11, 8, 3.5, 3.5, B);
      g.ellipse(22, 27, 17, 14, B, { edge: true });
      g.ellipseM(6, 27, 3.5, 6, B, { edge: true });
      g.ellipse(22, 14, 11, 8.5, B, { edge: true });
      g.ellipseM(12, 41, 5, 2.5, P('#2a4c55', '#1f3a42', '#3f6f78'), { edge: true });
      g.ellipse(22, 36, 3, 3, C, { edge: true });
      return;
    }
    const B = P('#3f6f78', '#2a4c55', '#5d939c');
    const C = P('#f2e2bc', '#cdb98a', '#fff6de');
    g.ellipseM(11, 8, 3.5, 3.5, B);
    g.ellipse(22, 27, 17, 14, B, { edge: true });
    g.ellipse(22, 31, 12, 10, C);
    g.ellipseM(6, 27, 3.5, 6, B, { edge: true });
    g.ellipse(22, 14, 11, 8.5, B, { edge: true });
    g.ellipse(22, 16.5, 8, 5.5, C);
    g.rectM(16, 14, 4, 1, OUTLINE);                                                             // sleepy eyes
    g.rect(20, 19, 4, 1, OUTLINE); g.px(19, 18, OUTLINE); g.px(24, 18, OUTLINE);                // smile
    g.ellipseM(12, 41, 5, 2.5, C, { edge: true });
    g.pxM(10, 41, OUTLINE); g.pxM(12, 41, OUTLINE); g.pxM(14, 41, OUTLINE);
    g.pxM(11, 7, '#2a4c55');
  },

  frostling(g, v = 'front') {
    if (v === 'side') {
      const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
      g.ellipse(6, 19, 5, 7.5, Cr);
      g.poly([[13, 10], [11, 2], [16, 8]], B);
      g.ellipse(15, 23, 6.5, 6, B, { edge: true });
      g.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); g.ellipse(18, 29, 2.5, 1.5, '#5ea8cc');
      g.poly([[17, 10], [18, 1], [22, 9]], B, { edge: true });
      g.ellipse(18, 14, 7.5, 6, B, { edge: true });
      g.poly([[22, 13], [28, 16], [22, 18]], B, { edge: true });
      g.poly([[16, 9], [19, 2], [20, 9]], Cr, { edge: true });
      g.poly([[19, 17], [15, 21], [21, 20]], Cr);
      g.rect(21, 13, 2, 3, '#1a3a5a'); g.px(21, 13, '#ffffff');
      g.px(27, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
      g.polyM([[10, 10], [7, 1], [14, 8]], B);
      g.ellipse(16, 23, 6.5, 6, B, { edge: true });
      g.ellipseM(12, 29, 2.5, 1.5, '#5ea8cc');
      g.ellipse(16, 14, 7.5, 6, B, { edge: true });
      g.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
      g.ellipse(16, 21, 5, 7.5, Cr, { edge: true });
      return;
    }
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff');
    const Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    g.ellipse(25, 19, 5, 7.5, Cr);                                                              // fluffy tail
    g.polyM([[10, 10], [7, 1], [14, 8]], B);
    g.ellipse(16, 23, 6.5, 6, B, { edge: true });
    g.ellipse(16, 14, 7.5, 6, B, { edge: true });
    g.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
    g.polyM([[9, 17], [5, 20], [10, 20]], Cr);                                                  // cheek frost
    g.ellipseM(12, 29, 2.5, 1.5, '#5ea8cc');
    g.eyes(12, 13, '#1a3a5a');
    g.px(15, 17, OUTLINE).px(16, 17, OUTLINE);
  },

  drakorn(g, v = 'front') {
    if (v === 'side') {
      const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
      g.poly([[12, 18], [2, 5], [4, 19]], W);
      g.poly([[10, 26], [1, 30], [8, 22]], O);
      g.poly([[17, 9], [13, 1], [19, 6]], C, { edge: true });
      g.ellipse(15, 23, 8, 7.5, O, { edge: true });
      g.ellipse(19, 25, 3.5, 5.5, C);
      g.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); g.ellipse(19, 30, 2.5, 1.5, '#c45e1e');
      g.ellipse(19, 12, 7, 6, O, { edge: true });
      g.ellipse(24, 14, 3.5, 2.5, C);
      g.rect(21, 10, 2, 3, DARK_EYE); g.px(21, 10, '#ffffff'); g.px(20, 8, OUTLINE); g.px(21, 8, OUTLINE); g.px(22, 9, OUTLINE);
      g.px(26, 13, OUTLINE);
      return;
    }
    if (v === 'back') {
      const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
      g.polyM([[13, 9], [9, 1], [15, 6]], C, { edge: true });
      g.ellipse(16, 23, 8, 7.5, O, { edge: true });
      g.ellipseM(11, 30, 2.5, 1.5, '#c45e1e');
      g.ellipse(16, 12, 7, 6, O, { edge: true });
      g.poly([[14, 27], [18, 27], [16, 32]], O, { edge: true });
      for (const y of [8, 11, 17]) g.rect(15, y, 2, 1, '#c45e1e');
      g.polyM([[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });
      return;
    }
    const O = P('#f08a3a', '#c45e1e', '#ffb873');
    const W = P('#7b4bd6', '#5430a0', '#a682ff');
    const C = P('#f6e2b0', '#d2b070', '#fff6dc');
    g.polyM([[10, 17], [0, 5], [2, 19]], W);
    g.poly([[21, 26], [31, 30], [24, 22]], O);
    g.polyM([[13, 9], [9, 1], [15, 6]], C, { edge: true });
    g.ellipse(16, 23, 8, 7.5, O, { edge: true });
    g.ellipse(16, 25, 5, 5.5, C);
    g.ellipse(16, 12, 7, 6, O, { edge: true });
    g.ellipse(16, 15, 4, 2.2, C);
    g.eyes(12, 10, DARK_EYE, { brow: true });
    g.px(15, 15, OUTLINE).px(16, 15, OUTLINE);
    g.ellipseM(11, 30, 2.5, 1.5, '#c45e1e');
  },

  boulderon(g, v = 'front') { // 44x44
    if (v === 'side') {
      const R = P('#8f8170', '#625747', '#b8aa96');
      g.poly([[9, 18], [11, 6], [16, 15]], R, { edge: true });
      g.poly([[15, 13], [19, 2], [23, 13]], R, { edge: true });
      g.poly([[22, 14], [28, 5], [30, 17]], R, { edge: true });
      g.ellipse(14, 40, 4.5, 2.5, R, { edge: true });
      g.ellipse(21, 26, 15, 14, R, { edge: true });
      g.ellipse(28, 40, 4.5, 2.5, R, { edge: true });
      g.ellipse(26, 28, 5, 6, R, { edge: true });
      g.rect(30, 22, 2, 3, '#ffb02a'); g.px(30, 22, '#ffffff'); g.px(29, 20, OUTLINE); g.px(30, 20, OUTLINE); g.px(31, 21, OUTLINE);
      g.rect(31, 31, 4, 1, OUTLINE);
      for (const [x, y] of [[10, 30], [11, 31], [11, 32], [16, 18], [17, 19], [19, 34]]) g.px(x, y, '#4e4436');
      return;
    }
    if (v === 'back') {
      const R = P('#8f8170', '#625747', '#b8aa96');
      g.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
      g.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
      g.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
      g.ellipse(22, 26, 15, 14, R, { edge: true });
      g.ellipseM(6, 28, 5, 6, R, { edge: true });
      g.ellipseM(14, 40, 4.5, 2.5, R, { edge: true });
      g.poly([[18, 26], [22, 18], [26, 26]], R, { edge: true });
      g.poly([[19, 34], [22, 28], [25, 34]], R, { edge: true });
      for (const [x, y] of [[12, 22], [13, 23], [31, 30], [30, 31], [16, 33], [28, 20]]) g.px(x, y, '#4e4436');
      return;
    }
    const R = P('#8f8170', '#625747', '#b8aa96');
    g.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
    g.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
    g.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
    g.ellipse(22, 26, 15, 14, R, { edge: true });
    g.ellipseM(6, 28, 5, 6, R, { edge: true });
    g.ellipseM(14, 40, 4.5, 2.5, R, { edge: true });
    g.eyes(16, 22, '#ffb02a', { brow: true });
    g.rect(19, 30, 7, 1, OUTLINE); g.px(18, 29, OUTLINE); g.px(26, 29, OUTLINE);
    // cracks
    for (const [x, y] of [[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [29, 33], [30, 34]]) g.px(x, y, '#4e4436');
  },

  mindra(g, v = 'front') {
    if (v === 'side') {
      const B = P('#c48ce8', '#9058b8', '#ebc8ff');
      g.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);
      g.poly([[13, 8], [10, 0], [16, 5]], B);
      g.ellipse(15, 23, 5, 6.5, B, { edge: true });
      g.ellipse(13, 29.5, 2, 1.2, '#9058b8'); g.ellipse(18, 29.5, 2, 1.2, '#9058b8');
      g.poly([[17, 7], [19, 0], [22, 6]], B, { edge: true });
      g.ellipse(18, 12, 8, 7, B, { edge: true });
      g.ellipse(22, 8.5, 1.6, 1.6, '#ff3a6a'); g.px(21, 8, '#ffd0dc');
      g.rect(21, 11, 2, 4, '#5a1a8a'); g.px(21, 11, '#ffffff');
      g.px(25, 16, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#c48ce8', '#9058b8', '#ebc8ff');
      g.polyM([[10, 8], [5, 0], [13, 5]], B);
      g.ellipse(16, 23, 5, 6.5, B, { edge: true });
      g.ellipseM(13, 29.5, 2, 1.2, '#9058b8');
      g.ellipse(16, 12, 8, 7, B, { edge: true });
      g.poly([[15, 27], [23, 22], [20, 15], [25, 11], [18, 19], [21, 23], [14, 25]], B, { edge: true });
      return;
    }
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    g.poly([[19, 24], [30, 17], [27, 23], [31, 27], [21, 28]], B);
    g.polyM([[10, 8], [5, 0], [13, 5]], B);
    g.ellipse(16, 23, 5, 6.5, B, { edge: true });
    g.ellipse(16, 12, 8, 7, B, { edge: true });
    g.ellipse(16, 8.5, 1.6, 1.6, '#ff3a6a'); g.px(15, 8, '#ffd0dc');
    g.eyes(11, 11, '#5a1a8a', { h: 4 });
    g.px(16, 16, OUTLINE);
    g.ellipseM(13, 29.5, 2, 1.2, '#9058b8');
  },

  shadefang(g, v = 'front') {
    if (v === 'side') {
      const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8');
      g.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);
      g.poly([[14, 10], [12, 1], [17, 7]], B);
      g.ellipse(15, 22, 8, 6.5, B, { edge: true });
      g.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); g.ellipse(19, 28.5, 2.5, 1.5, '#24203a');
      g.ellipse(18, 18, 4, 2, '#d2384a');
      g.poly([[17, 9], [19, 1], [21, 8]], B, { edge: true }); g.px(19, 4, '#d2384a'); g.px(19, 5, '#d2384a');
      g.ellipse(19, 13, 6.5, 5.5, B, { edge: true });
      g.poly([[22, 12], [28, 15], [22, 17]], B, { edge: true });
      g.ellipse(24, 16, 3, 1.5, G);
      g.rect(21, 12, 2, 3, '#ff3a3a'); g.px(21, 12, '#ffffff'); g.px(20, 10, OUTLINE); g.px(21, 10, OUTLINE); g.px(22, 11, OUTLINE);
      g.px(28, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#3a3550', '#24203a', '#5a5478');
      g.polyM([[11, 10], [9, 1], [15, 7]], B);
      g.pxM(10, 4, '#d2384a'); g.pxM(10, 5, '#d2384a');
      g.ellipse(16, 22, 8, 6.5, B, { edge: true });
      g.ellipse(16, 18, 6, 2, '#d2384a');
      g.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
      g.ellipseM(11, 28.5, 2.5, 1.5, '#24203a');
      g.poly([[14, 25], [19, 15], [22, 12], [19, 24]], B, { edge: true });
      return;
    }
    const B = P('#3a3550', '#24203a', '#5a5478');
    const G = P('#8a86a0', '#5e5a74', '#b4b0c8');
    g.poly([[21, 22], [31, 13], [28, 22], [24, 26]], B);
    g.polyM([[11, 10], [9, 1], [15, 7]], B);
    g.pxM(10, 4, '#d2384a'); g.pxM(10, 5, '#d2384a');
    g.ellipse(16, 22, 8, 6.5, B, { edge: true });
    g.ellipse(16, 18, 6, 2, '#d2384a');                                                         // collar
    g.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
    g.ellipse(16, 16, 3, 2, G);
    g.eyes(12, 12, '#ff3a3a', { brow: true });
    g.px(15, 15, OUTLINE).px(16, 15, OUTLINE);
    g.ellipseM(11, 28.5, 2.5, 1.5, '#24203a');
  },

  lumawool(g, v = 'front') {
    if (v === 'side') {
      const W = P('#fff3d6', '#d9c39a', '#ffffff'), Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.rect(4, 22, 1, 4, OUTLINE); g.ellipse(4, 21, 2.5, 2.5, '#ff4a3a');
      g.rect(10, 26, 2, 4, '#2a2230'); g.rect(19, 26, 2, 4, '#2a2230');
      g.ellipse(10, 20, 6, 6, W); g.ellipse(19, 20, 6, 6, W); g.ellipse(14, 15, 7, 6, W); g.ellipse(15, 23, 8, 6, W);
      g.poly([[19, 11], [14, 14], [19, 15]], Y);
      g.rect(21, 6, 1, 3, '#2a2230');
      g.ellipse(22, 13, 5, 5, Y, { edge: true });
      g.rect(24, 12, 2, 2, DARK_EYE); g.px(24, 12, '#ffffff');
      g.ellipse(23, 8, 1.5, 1.5, '#ff4a3a');
      return;
    }
    if (v === 'back') {
      const W = P('#fff3d6', '#d9c39a', '#ffffff'), Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.rectM(11, 26, 2, 4, '#2a2230');
      g.ellipse(10, 20, 6, 6, W); g.ellipse(22, 20, 6, 6, W); g.ellipse(16, 15, 7, 6, W); g.ellipse(16, 23, 8, 6, W);
      g.polyM([[12, 11], [6, 13], [11, 15]], Y);
      g.ellipse(16, 12, 5, 5, Y, { edge: true });
      g.rectM(13, 6, 1, 3, '#2a2230');
      g.rect(16, 24, 1, 4, OUTLINE); g.ellipse(16.5, 28, 2.5, 2.5, '#ff4a3a');
      return;
    }
    const W = P('#fff3d6', '#d9c39a', '#ffffff');
    const Y = P('#ffd84a', '#e0a722', '#fff3a0');
    g.rect(26, 22, 1, 4, OUTLINE);
    g.ellipse(27, 21, 2.5, 2.5, '#ff4a3a');                                                      // tail orb
    g.rectM(11, 26, 2, 4, '#2a2230');
    g.ellipse(10, 20, 6, 6, W); g.ellipse(22, 20, 6, 6, W); g.ellipse(16, 15, 7, 6, W); g.ellipse(16, 23, 8, 6, W);
    g.polyM([[12, 11], [6, 13], [11, 15]], Y);
    g.ellipse(16, 12, 5, 5, Y, { edge: true });
    g.rectM(13, 6, 1, 3, '#2a2230');
    g.eyes(13, 11, DARK_EYE, { h: 2 });
    g.ellipse(16, 8, 1.5, 1.5, '#ff4a3a');
  },

  brawlix(g, v = 'front') {
    if (v === 'side') {
      const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a');
      g.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');
      g.ellipse(12, 29, 2.2, 2, T, { edge: true }); g.ellipse(19, 29, 2.2, 2, T, { edge: true });
      g.ellipse(11, 20, 3.2, 3.2, R, { edge: true });
      g.ellipse(16, 21, 6, 6, T, { edge: true });
      g.ellipse(16, 26, 5.5, 2.6, '#3a5ab8', { edge: true });
      g.ellipse(17, 11, 6, 5.5, T, { edge: true });
      g.rect(11, 8, 12, 2, '#d23a3a');
      g.ellipse(19, 18, 2.5, 3.5, T, { edge: true });
      g.ellipse(23, 20, 3.5, 3.5, R, { edge: true });
      g.rect(20, 11, 2, 2, DARK_EYE); g.px(20, 11, '#ffffff'); g.px(19, 10, OUTLINE); g.px(20, 10, OUTLINE); g.px(21, 10, OUTLINE);
      g.px(22, 14, OUTLINE);
      return;
    }
    if (v === 'back') {
      const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a');
      g.ellipseM(12, 29, 2.2, 2, T, { edge: true });
      g.ellipse(16, 21, 6.5, 6, T, { edge: true });
      g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      g.ellipseM(10, 18, 2.5, 3.5, T, { edge: true });
      g.ellipseM(6.5, 21, 3.5, 3.5, R, { edge: true });
      g.ellipse(16, 11, 6, 5.5, T, { edge: true });
      g.rect(10, 8, 12, 2, '#d23a3a');
      g.rect(15, 8, 2, 3, '#9a2222');
      g.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); g.poly([[17, 10], [20, 16], [17, 15]], '#d23a3a');
      g.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    const T = P('#d9a066', '#a8703e', '#f2c896');
    const R = P('#d23a3a', '#9a2222', '#ff7a6a');
    g.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');                                              // headband tails
    g.ellipseM(12, 29, 2.2, 2, T, { edge: true });
    g.ellipse(16, 21, 6.5, 6, T, { edge: true });
    g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    g.ellipseM(10, 18, 2.5, 3.5, T, { edge: true });
    g.ellipseM(6.5, 21, 3.5, 3.5, R, { edge: true });
    g.ellipse(16, 11, 6, 5.5, T, { edge: true });
    g.rect(10, 8, 12, 2, '#d23a3a');
    g.eyes(13, 11, DARK_EYE, { brow: true, h: 2 });
    g.rect(15, 14, 2, 1, OUTLINE);
    g.rect(14, 19, 4, 1, '#a8703e');
  },

  galewing(g, v = 'front') {
    if (v === 'side') {
      const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
      g.poly([[12, 23], [1, 29], [5, 21]], B);
      g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      g.ellipse(19.5, 22, 3.5, 5, '#f4f0e6');
      g.poly([[16, 7], [13, 0], [18, 4], [20, 1], [20, 7]], B);
      g.ellipse(19, 11, 6.5, 6, B, { edge: true });
      g.poly([[24, 10], [30, 12], [24, 14]], Y);
      g.rect(20, 9, 2, 3, DARK_EYE); g.px(20, 9, '#ffffff'); g.px(19, 7, OUTLINE); g.px(20, 7, OUTLINE); g.px(21, 8, OUTLINE);
      g.poly([[9, 16], [21, 18], [17, 25], [7, 24]], Wg, { edge: true });
      g.px(11, 21, '#a8b4e0'); g.px(14, 20, '#a8b4e0');
      g.rect(14, 28, 2, 2, Y); g.rect(19, 28, 2, 2, Y);
      return;
    }
    if (v === 'back') {
      const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
      g.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);
      g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      g.ellipse(16, 11, 6.5, 6, B, { edge: true });
      g.rectM(12, 28, 2, 2, Y);
      g.poly([[13, 25], [16, 31], [19, 25]], B, { edge: true });
      g.polyM([[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });
      g.pxM(3, 13, '#a8b4e0'); g.pxM(5, 18, '#a8b4e0'); g.pxM(8, 16, '#a8b4e0');
      return;
    }
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff');
    const Wg = P('#eef2ff', '#a8b4e0', '#ffffff');
    const Y = '#ffc23a';
    g.poly([[20, 23], [31, 29], [27, 21]], B);                                                  // tail feathers
    g.polyM([[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });                // spread wings
    g.pxM(3, 13, '#a8b4e0'); g.pxM(4, 18, '#a8b4e0');
    g.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);                                   // crest
    g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });                                             // body
    g.ellipse(16, 22, 4.5, 5, '#f4f0e6');                                                       // belly
    g.ellipse(16, 11, 6.5, 6, B, { edge: true });                                               // head
    g.poly([[14, 13], [19, 13], [16, 17]], Y);                                                  // beak
    g.eyes(12, 10, DARK_EYE, { brow: true });
    g.rectM(12, 28, 2, 2, Y);                                                                   // feet
  },

  venomire(g, v = 'front') {
    if (v === 'side') {
      const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      g.poly([[13, 10], [10, 2], [16, 8]], B);
      g.ellipse(17, 17, 8, 9, B, { edge: true });
      g.poly([[18, 9], [20, 1], [22, 8]], B, { edge: true }); g.px(20, 1, S); g.px(20, 2, S);
      g.ellipse(21.5, 21, 3, 4.5, '#e4b8f4');
      for (const [x, y] of [[6, 25], [22, 27], [12, 20], [11, 13], [26, 24]]) { g.px(x, y, S); g.px(x + 1, y, S); }
      g.rect(21, 13, 2, 3, '#3a0a4a'); g.px(21, 13, '#ffffff');
      g.rect(22, 17, 3, 1, OUTLINE); g.px(23, 18, '#ffffff');
      return;
    }
    if (v === 'back') {
      const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      g.polyM([[11, 10], [7, 2], [14, 8]], B);
      g.pxM(7, 2, S); g.pxM(8, 3, S);
      g.ellipse(16, 17, 8, 9, B, { edge: true });
      for (const [x, y] of [[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]]) { g.px(x, y, S); g.px(x + 1, y, S); }
      return;
    }
    const B = P('#a052c8', '#6e2e94', '#d08cf0');
    const S = '#d8f04a';
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                              // slimy base
    g.polyM([[11, 10], [7, 2], [14, 8]], B);                                                    // horns
    g.pxM(7, 2, S); g.pxM(8, 3, S);
    g.ellipse(16, 17, 8, 9, B, { edge: true });                                                 // body
    g.ellipse(16, 21, 4.5, 4.5, '#e4b8f4');                                                     // belly
    for (const [x, y] of [[8, 25], [22, 27], [25, 23], [5, 24], [17, 9], [11, 20]]) { g.px(x, y, S); g.px(x + 1, y, S); }
    g.eyes(12, 13, '#3a0a4a');
    g.rect(14, 17, 4, 1, OUTLINE); g.px(15, 18, '#ffffff'); g.px(17, 18, '#ffffff');             // fanged grin
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },

  scarablade(g, v = 'front') {
    if (v === 'side') {
      const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
      g.poly([[17, 8], [10, 5], [11, 10]], '#d23a3a');
      g.ellipse(10, 28, 3, 2, Bd, { edge: true }); g.ellipse(19, 28, 3, 2, Bd, { edge: true });
      g.ellipse(21, 12, 5.5, 4.5, Bd, { edge: true });
      g.poly([[22, 9], [25, 3], [29, 0], [27, 4], [26, 9]], Hn, { edge: true });
      g.rect(17, 8, 9, 2, '#d23a3a');
      g.ellipse(14, 20, 10, 8.5, Sh, { edge: true });
      g.rect(6, 17, 16, 1, '#3a5208');
      g.px(9, 15, '#c4e04a'); g.px(10, 14, '#c4e04a'); g.px(13, 14, '#c4e04a');
      g.ellipse(23, 21, 3, 3.2, Bd, { edge: true });
      g.rect(24, 11, 2, 2, '#ffde3a'); g.px(23, 10, OUTLINE); g.px(24, 10, OUTLINE);
      return;
    }
    if (v === 'back') {
      const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
      g.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });
      g.ellipseM(9, 28, 3, 2, Bd, { edge: true });
      g.ellipseM(5.5, 19, 3, 3.2, Bd, { edge: true });
      g.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });
      g.rect(10, 8, 12, 2, '#d23a3a');
      g.ellipse(16, 20, 10, 8.5, Sh, { edge: true });
      g.rect(16, 12, 1, 17, '#3a5208');
      g.pxM(10, 16, '#c4e04a'); g.pxM(11, 15, '#c4e04a'); g.pxM(12, 21, '#c4e04a');
      return;
    }
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a');
    const Bd = P('#3a3a2a', '#22221a', '#5a5a44');
    const Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    g.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });      // great horn
    g.poly([[16, 4], [21, 1], [19, 5], [17, 6]], Hn);                                           // horn fork
    g.ellipseM(9, 28, 3, 2, Bd, { edge: true });                                                // legs
    g.ellipseM(5.5, 19, 3, 3.2, Bd, { edge: true });                                            // fists
    g.ellipse(16, 20, 10, 8.5, Sh, { edge: true });                                             // shell
    g.rect(16, 13, 1, 15, '#3a5208');                                                           // shell seam
    g.pxM(11, 18, '#c4e04a'); g.pxM(12, 17, '#c4e04a');
    g.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });                                            // head
    g.rect(10, 8, 12, 2, '#d23a3a');                                                            // headband
    g.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');
    g.eyes(12, 11, '#ffde3a', { brow: true, h: 2 });
  },

  wispurr(g, v = 'front') {
    if (v === 'side') {
      const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa');
      g.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);
      g.ellipse(3, 16, 2.5, 3.5, F);
      g.poly([[13, 9], [10, 1], [16, 6]], B);
      g.ellipse(16, 21, 7, 6, B, { edge: true });
      g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      g.poly([[17, 8], [19, 0], [22, 6]], B, { edge: true }); g.px(19, 3, '#3ab8b0');
      g.ellipse(19, 12, 7.5, 6.5, B, { edge: true });
      g.rect(22, 11, 2, 3, '#2ad8c0'); g.px(22, 11, '#ffffff');
      g.px(25, 15, OUTLINE).px(26, 14, '#bcaaf0').px(27, 13, '#bcaaf0');
      return;
    }
    if (v === 'back') {
      const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa');
      g.polyM([[10, 9], [7, 1], [14, 6]], B, { edge: true });
      g.ellipse(16, 21, 7, 6, B, { edge: true });
      g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      g.ellipse(16, 12, 7.5, 6.5, B, { edge: true });
      g.poly([[15, 25], [20, 17], [17, 11], [24, 13], [19, 23]], B, { edge: true });
      g.ellipse(22, 10, 2.5, 3.5, F);
      return;
    }
    const B = P('#8a74c8', '#5a4494', '#bcaaf0');
    const F = P('#7af0e0', '#3ab8b0', '#e0fffa');
    g.poly([[18, 23], [27, 29], [25, 23], [30, 18], [22, 19]], B);                              // wispy tail
    g.ellipse(29, 16, 2.5, 3.5, F);                                                             // tail wisp-flame
    g.polyM([[10, 9], [7, 1], [14, 6]], B, { edge: true });                                     // ears
    g.pxM(8, 3, '#3ab8b0'); g.pxM(9, 5, '#3ab8b0');
    g.ellipse(16, 21, 7, 6, B, { edge: true });                                                 // body
    g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
    g.ellipse(16, 12, 7.5, 6.5, B, { edge: true });                                             // head
    g.eyes(11, 11, '#2ad8c0');
    g.px(15, 15, OUTLINE).px(17, 15, OUTLINE).px(16, 16, OUTLINE);                              // cat mouth
    g.pxM(6, 14, '#bcaaf0'); g.pxM(5, 15, '#bcaaf0');                                           // whiskers
  },

  gearhulk(g, v = 'front') { // 44x44
    if (v === 'side') {
      const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
      g.ellipse(15, 40, 5, 2.5, D, { edge: true }); g.ellipse(28, 40, 5, 2.5, D, { edge: true });
      g.ellipse(15, 25, 4.5, 8, D, { edge: true });
      g.poly([[10, 14], [32, 14], [34, 37], [8, 37]], M, { edge: true });
      g.rect(14, 20, 12, 3, '#6e7690'); g.rect(14, 26, 12, 3, '#6e7690');
      for (const [x, y] of [[12, 17], [30, 17], [11, 34], [31, 34]]) g.px(x, y, '#3a4054');
      g.ellipse(25, 25, 4.5, 8, D, { edge: true });
      g.ellipse(26, 34, 5, 4, M, { edge: true });
      g.rect(19, 1, 2, 4, '#6e7690'); g.ellipse(20, 1.5, 1.6, 1.6, '#ff4a3a');
      g.poly([[13, 5], [29, 5], [30, 15], [12, 15]], M, { edge: true });
      g.rect(23, 8, 7, 4, '#1c2a3a'); g.rect(27, 9, 2, 2, '#5affff');
      return;
    }
    if (v === 'back') {
      const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c');
      g.ellipseM(11, 40, 5, 2.5, D, { edge: true });
      g.ellipseM(5, 25, 4.5, 8, D, { edge: true });
      g.ellipseM(5, 34, 5, 4, M, { edge: true });
      g.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      g.rect(15, 18, 14, 14, '#6e7690');
      for (let y = 20; y < 31; y += 3) g.rect(17, y, 10, 1, '#3a4054');
      for (const [x, y] of [[11, 17], [32, 17], [10, 34], [33, 34]]) g.px(x, y, '#3a4054');
      g.rect(21, 1, 2, 4, '#6e7690'); g.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      g.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      g.rect(17, 9, 10, 2, '#6e7690');
      return;
    }
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0');
    const D = P('#5a6278', '#3a4054', '#7e869c');
    const G = '#e0a83a';
    g.ellipseM(11, 40, 5, 2.5, D, { edge: true });                                              // feet
    g.ellipseM(5, 25, 4.5, 8, D, { edge: true });                                               // arms
    g.ellipseM(5, 34, 5, 4, M, { edge: true });                                                 // fists
    g.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });                          // torso
    g.ellipse(22, 26, 6, 6, G);                                                                 // chest gear
    g.rect(21, 18, 2, 2, G); g.rect(21, 32, 2, 2, G); g.rect(14, 25, 2, 2, G); g.rect(28, 25, 2, 2, G);
    g.ellipse(22, 26, 2.2, 2.2, '#7a5418');
    for (const [x, y] of [[11, 17], [32, 17], [10, 34], [33, 34]]) g.px(x, y, '#3a4054');        // rivets
    g.rect(21, 1, 2, 4, '#6e7690'); g.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');                    // antenna
    g.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });                          // head
    g.rect(16, 8, 12, 4, '#1c2a3a');                                                            // visor
    g.rect(18, 9, 2, 2, '#5affff'); g.rect(24, 9, 2, 2, '#5affff');
  },

  // Toshi, the owner's real-life Shiba Inu (drawn from photos): a soft ginger coat; a big
  // white bib, belly and legs; white cheeks up to his eyes; pale eyebrow spots; upright
  // ears with pale insides; a big black nose; a ring of white ruff round the neck; and his smug half-shut stare.
  // The curled tail is ginger on top with lots of white fluff.
  smugshi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Ei = TOSHI.ear;
    if (v === 'side') {
      g.ellipse(8, 15, 4.5, 4.5, O, { edge: true });                                             // curled tail
      g.ellipse(7.5, 14.5, 2.7, 2.7, C); g.px(7, 14, O.s);
      g.ellipse(10, 27, 1.8, 3, P(C.s, '#cbbba4', C.b)); g.ellipse(19, 27, 1.8, 3, P(C.s, '#cbbba4', C.b));   // far legs
      g.ellipse(14, 22, 8.5, 5.5, O, { edge: true });                                            // body
      g.ellipse(14, 25.5, 7, 2, C);                                                              // white belly
      g.ellipse(20, 22, 3.5, 4.5, C);                                                            // white chest
      g.ellipse(11, 27.5, 1.9, 3, C, { edge: true }); g.ellipse(21, 27.5, 1.9, 3, C, { edge: true });   // white legs
      g.ellipse(17, 17, 4.5, 3.2, C, { edge: true });                                            // white ruff round the neck
      g.poly([[14, 8], [13, 1], [17, 5]], O);                                                    // far ear
      g.ellipse(19, 12, 6.5, 5.5, O, { edge: true });                                            // head
      g.px(13, 15, C.b); g.px(13, 16, C.b); g.px(14, 17, C.b);                                   // the ruff showing behind the head
      g.poly([[17, 7], [19, 0], [22, 6]], O, { edge: true });                                    // near ear
      g.poly([[18.5, 6], [19.3, 2.5], [21, 5.5]], Ei);
      g.poly([[21, 12], [28, 13.5], [27.5, 16.5], [20, 17.5]], C, { edge: true });               // white muzzle
      g.ellipse(19.5, 15.5, 3, 2, C);                                                            // white cheek
      g.px(21, 9, C.b); g.px(22, 9, C.b);                                                        // eyebrow spot
      g.rect(21, 11, 3, 1, OUTLINE); g.px(22, 12, DARK_EYE); g.px(23, 12, DARK_EYE);              // smug half-shut eye
      g.rect(27, 13, 2, 2, OUTLINE);                                                             // nose
      g.px(24, 17, OUTLINE).px(25, 17, OUTLINE).px(26, 16, OUTLINE);                             // flat little mouth
      return;
    }
    if (v === 'back') {
      g.ellipseM(12, 27.5, 2.2, 3, C, { edge: true });                                           // white hind legs
      g.ellipse(16, 22, 7.5, 6, O, { edge: true });
      g.ellipse(16, 26, 4, 2.2, C);                                                              // white rear
      g.polyM([[9, 9], [8.5, 1], [14, 6]], O, { edge: true });
      g.ellipse(16, 17.5, 7.5, 2.4, C, { edge: true });                                          // white ruff round the neck
      g.ellipse(16, 12, 8, 6.2, O, { edge: true });
      g.ellipseM(9, 15, 1.6, 1.6, C);                                                            // cheek fluff peeking out
      g.rect(11, 18, 10, 1, C.b);                                                                // the ruff under the nape
      g.ellipse(16, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      g.ellipse(16, 18.5, 3, 2.6, C); g.px(16, 18, O.s); g.px(17, 18, O.s);
      return;
    }
    g.ellipse(26, 18, 4.5, 4.5, O, { edge: true });                                              // curled tail
    g.ellipse(26.5, 17.5, 2.7, 2.7, C); g.px(26, 17, O.s);
    g.ellipseM(12, 27, 2.4, 3.4, C, { edge: true });                                             // white legs
    g.ellipse(16, 22, 7.5, 6, O, { edge: true });                                                // body
    g.ellipse(16, 23.5, 5, 5.5, C);                                                              // big white bib
    g.polyM([[9, 9], [8.5, 1], [14, 6]], O, { edge: true });                                     // upright ears
    g.polyM([[10, 7.5], [9.5, 3], [12.5, 6]], Ei);                                               // pale insides
    g.ellipse(16, 12, 8, 6.5, O, { edge: true });                                                // head
    g.ellipse(16, 15.5, 6, 3.6, C);                                                              // white muzzle
    g.ellipseM(10.2, 14, 2.2, 2, C);                                                             // white cheeks up to the eyes
    g.pxM(11, 9, C.b); g.pxM(12, 9, C.b);                                                        // eyebrow spots
    g.rectM(10, 11, 4, 1, OUTLINE);                                                              // smug half-shut lids
    g.rectM(11, 12, 2, 1, DARK_EYE);
    g.rect(15, 13, 2, 2, OUTLINE); g.px(15, 13, '#5a5060');                                      // big black nose
    g.px(14, 17, OUTLINE).px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(17, 17, OUTLINE);          // flat, unimpressed mouth
    g.px(18, 16, OUTLINE);                                                                       // ...with a smug corner
  },

  // An exhausted sloth clinging to its coffee: dark eye bands that double as
  // tired bags, droopy half-shut eyes, a frown and messy bed hair.
  mondaze(g, v = 'front') {
    if (v === 'side') {
      const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
      g.ellipse(12, 29, 3, 1.6, F, { edge: true }); g.ellipse(20, 29, 3, 1.6, F, { edge: true });
      g.ellipse(15, 22, 9, 7.5, F, { edge: true });
      g.ellipse(18, 24, 4, 4.5, '#b0a090');
      g.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
      g.ellipse(18, 11, 8.5, 7, F, { edge: true });
      g.ellipse(21, 12, 5.5, 5, C);
      g.poly([[18, 10], [24, 10], [24, 14], [20, 14]], '#4a3a30');
      g.rect(21, 11, 2, 1, '#1a1222'); g.rect(21, 12, 2, 1, '#7a6a8a');
      g.rect(25, 13, 2, 1, OUTLINE);
      g.px(23, 17, OUTLINE).px(24, 16, OUTLINE).px(25, 17, OUTLINE);
      g.ellipse(20, 21, 2.5, 4, F, { edge: true });
      g.poly([[22, 20], [27, 20], [27, 26], [22, 26]], M, { edge: true });
      g.rect(28, 21, 1, 3, '#24766f'); g.rect(23, 20, 3, 1, '#5a3a22');
      g.px(23, 18, '#eef2f6').px(24, 17, '#eef2f6').px(26, 18, '#eef2f6');
      return;
    }
    if (v === 'back') {
      const F = P('#9a8a78', '#6e6052', '#bcae9c');
      g.ellipseM(11, 29, 3, 1.6, F, { edge: true });
      g.ellipse(16, 22, 9, 7.5, F, { edge: true });
      g.ellipseM(8, 21, 2.5, 4, F, { edge: true });
      g.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);
      g.ellipse(16, 11, 8.5, 7, F, { edge: true });
      for (const [x, y] of [[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]) { g.px(x, y, '#6e6052'); g.px(x + 1, y + 1, '#6e6052'); }
      return;
    }
    const F = P('#9a8a78', '#6e6052', '#bcae9c');
    const C = P('#e8dcc6', '#c8b89e', '#fff6e6');
    const M = P('#3aa8a0', '#24766f', '#6fd0c8');
    g.ellipseM(11, 29, 3, 1.6, F, { edge: true });                                              // feet
    g.ellipse(16, 22, 9, 7.5, F, { edge: true });                                               // slumped body
    g.ellipse(16, 24, 5, 4.5, '#b0a090');                                                       // belly
    g.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);                 // bed hair
    g.ellipse(16, 11, 8.5, 7, F, { edge: true });                                               // head
    g.ellipse(16, 12, 6.5, 5, C);                                                               // face
    g.polyM([[8, 10], [14, 10], [14, 14], [10, 14]], '#4a3a30');                                 // droopy eye bands
    g.rectM(11, 11, 2, 1, '#1a1222');                                                           // half-shut eyes
    g.rectM(11, 12, 2, 1, '#7a6a8a');                                                           // eye bags
    g.rect(15, 14, 2, 1, OUTLINE);                                                              // nose
    g.px(14, 17, OUTLINE).px(15, 16, OUTLINE).px(16, 16, OUTLINE).px(17, 17, OUTLINE);          // frown
    g.ellipseM(9, 21, 2.5, 4, F, { edge: true });                                               // arms
    g.poly([[13, 21], [19, 21], [19, 27], [13, 27]], M, { edge: true });                        // coffee mug
    g.rect(20, 22, 1, 3, '#24766f'); g.px(19, 22, '#24766f'); g.px(19, 24, '#24766f');          // handle
    g.rect(14, 21, 4, 1, '#5a3a22');                                                            // coffee
    g.pxM(12, 24, '#e8dcc6');                                                                   // claws round the mug
    g.px(14, 19, '#eef2f6').px(15, 18, '#eef2f6').px(17, 19, '#eef2f6').px(18, 18, '#eef2f6');  // steam
  },

  pixibelle(g, v = 'front') {
    if (v === 'side') {
      const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
      g.ellipse(9, 13, 5.5, 5, Wn, { edge: true }); g.ellipse(10, 22, 4, 3.5, Wn, { edge: true });
      g.ellipse(8, 12, 1.8, 1.5, '#ffb4dc');
      g.rect(19, 2, 1, 4, OUTLINE); g.px(19, 1, '#ffe066'); g.px(20, 1, '#ffe066'); g.px(19, 0, '#ffe066');
      g.ellipse(16, 23, 5, 5.5, B, { edge: true });
      g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
      g.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
      g.poly([[9, 6], [13, 9], [9, 12]], Pk); g.px(12, 9, '#c83a7a');
      g.rect(20, 12, 2, 3, '#6a2a5a'); g.px(20, 12, '#ffffff');
      g.ellipse(22, 16, 1.5, 1, '#ff8ab8');
      g.px(23, 17, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
      g.rectM(12, 2, 1, 4, OUTLINE);
      g.pxM(12, 1, '#ffe066'); g.pxM(11, 1, '#ffe066'); g.pxM(12, 0, '#ffe066');
      g.ellipse(16, 23, 5, 5.5, B, { edge: true });
      g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
      g.ellipse(16, 12.5, 7, 6.5, B, { edge: true });
      g.poly([[11, 5], [16, 8], [11, 10]], Pk); g.poly([[21, 5], [16, 8], [21, 10]], Pk); g.px(16, 8, '#c83a7a');
      g.ellipseM(7.5, 14, 5.5, 5, Wn, { edge: true });
      g.ellipseM(9, 22, 4, 3.5, Wn, { edge: true });
      g.ellipseM(6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6');
    const Wn = P('#d8f4ff', '#a4d4f0', '#ffffff');
    const Pk = '#ff5a9e';
    g.ellipseM(6.5, 13, 5.5, 5, Wn, { edge: true });                                            // upper wings
    g.ellipseM(8, 22, 4, 3.5, Wn, { edge: true });                                              // lower wings
    g.ellipseM(5.5, 12, 1.8, 1.5, '#ffb4dc');                                                   // wing spots
    g.rectM(12, 2, 1, 4, OUTLINE);                                                              // antennae
    g.pxM(12, 1, '#ffe066'); g.pxM(11, 1, '#ffe066'); g.pxM(12, 0, '#ffe066');
    g.ellipse(16, 23, 5, 5.5, B, { edge: true });                                               // body
    g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); // skirt
    g.ellipse(16, 12.5, 7, 6.5, B, { edge: true });                                             // head
    g.poly([[11, 5], [16, 8], [11, 10]], Pk); g.poly([[21, 5], [16, 8], [21, 10]], Pk);         // bow
    g.px(16, 8, '#c83a7a');
    g.eyes(12, 12, '#6a2a5a');
    g.ellipseM(10, 16, 1.5, 1, '#ff8ab8');                                                      // cheeks
    g.px(16, 17, OUTLINE);
  },
};

const SPRITES = {};

// Build every monster's views once: front (img), side (facing right) and back.
const VIEWS = ['front', 'side', 'back'];
function buildSprites() {
  for (const mon of ALL_MONS()) {
    const size = mon.size === 'L' ? 44 : 32;
    const views = {};
    for (const v of VIEWS) {
      const g = new PixGrid(size, size);
      MONSTER_ART[mon.id](g, v);
      g.outline();
      views[v] = g.toCanvas();
    }
    SPRITES[mon.id] = { img: views.front, views, size };
  }
}

// Draw a monster into an arbitrary canvas, scaled to fit with integer pixels where possible.
function drawPortrait(canvas, monId, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sp = SPRITES[monId];
  const s = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / sp.size * (opts.zoom || 1)));
  const w = sp.size * s;
  const x = Math.round((canvas.width - w) / 2);
  const y = opts.crop ? Math.round(canvas.height * 0.08) : Math.round((canvas.height - w) / 2);
  if (opts.fainted) ctx.filter = 'grayscale(1) brightness(.6)';
  ctx.drawImage(sp.img, x, y, w, w);
  ctx.filter = 'none';
}
