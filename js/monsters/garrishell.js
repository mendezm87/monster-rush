// The garrishell family: shellmet, bulwarden, garrishell. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Garrishell's first form (the owner's pick): a scrappy baby turtle still wearing half its
  // riveted gunmetal egg as a helmet, one glowing amber eye peeking out under a crack, a
  // brass spout on its snout, and a little round shell with a gold band and one tiny tower.
  shellmet(g, v = 'front') {
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0', BRASS = '#d8a838', BR2 = '#a07a20';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const tower = (x, y) => { b.poly([[x, y + 1], [x + 4, y + 1], [x + 4, y + 5], [x, y + 5]], M, { edge: true }); b.px(x, y, M.b).px(x + 2, y, M.b).px(x + 4, y, M.b); };
    if (v === 'side') {
      t.poly([[7, 22], [2, 24.5], [8, 25]], S, { edge: true });                                   // stubby tail
      legB.ellipse(21, 27, 2.2, 2.8, S, { edge: true }); legA.ellipse(11, 27, 2.2, 2.8, S, { edge: true });   // far legs
      tower(9, 8);                                                                                // the tiny tower
      b.ellipse(14, 19, 9, 6.5, M, { edge: true });                                               // round shell
      b.rect(13, 13, 2, 12, GOLD);                                                                // gold band
      b.px(9, 17, D.s).px(19, 17, D.s).px(10, 22, D.s).px(18, 22, D.s);
      b.ellipse(16, 24, 8, 2.6, S, { edge: true }); b.rect(10, 25, 12, 1, C.b);                  // belly
      legA.ellipse(22, 28, 2.4, 3, S, { edge: true }); legB.ellipse(9, 28, 2.4, 3, S, { edge: true });   // near legs
      legA.px(23, 30, C.l); legB.px(10, 30, C.l);
      h.ellipse(24, 19, 5, 4, S, { edge: true });                                                // head
      h.poly([[19, 17], [19, 14], [22, 11], [26, 11], [29, 14], [29, 17]], M, { edge: true });   // the egg-shell helmet
      h.px(24, 12, D.s).px(21, 15, D.s).px(27, 15, D.s);
      h.px(26, 13, BORE).px(27, 14, BORE).px(26, 15, BORE);                                       // its crack
      rigEye(h, Q, 25, 17, () => { h.rect(25, 17, 2, 2, EYE); h.px(25, 17, HOT); }, 2);           // the eye peeking out
      h.rect(28, 19, 2, 2, BRASS); h.px(29, 20, BR2); h.px(30, 19, WET);                         // brass spout
      rigMouth(h, Q, 25, 21, 2, () => h.px(25, 21, OUTLINE).px(26, 21, OUTLINE));
      return;
    }
    if (v === 'back') {
      legA.ellipse(10, 27, 2.8, 3, S, { edge: true }); legB.ellipse(22, 27, 2.8, 3, S, { edge: true });
      t.poly([[15, 25], [17, 25], [16, 29]], S, { edge: true });
      h.ellipse(16, 10, 7, 5, M, { edge: true });                                                 // top of the helmet
      h.px(16, 7, D.s).px(12, 9, D.s).px(20, 9, D.s);
      tower(18, 8);
      b.ellipse(16, 19, 9.5, 7, M, { edge: true });                                               // the shell
      b.rect(15, 12, 2, 14, GOLD);
      b.px(10, 16, D.s).px(21, 16, D.s).px(11, 22, D.s).px(20, 22, D.s).px(12, 18, M.l).px(13, 17, M.l);
      return;
    }
    tower(23, 8);                                                                                 // the tiny tower, behind
    b.ellipse(16, 20, 10, 6, M, { edge: true });                                                  // shell behind
    b.pxM(8, 21, D.s);
    legA.ellipse(10, 27, 2.8, 3, S, { edge: true }); legB.ellipse(22, 27, 2.8, 3, S, { edge: true });   // stubby legs
    legA.px(9, 29, C.l).px(11, 29, C.l); legB.px(21, 29, C.l).px(23, 29, C.l);
    b.ellipse(16, 22, 7, 5, S, { edge: true });                                                   // body
    b.ellipse(16, 23.5, 4.5, 3, C);                                                               // plastron
    h.ellipse(16, 16, 6, 4, S, { edge: true });                                                   // face
    h.poly([[7, 14], [8, 9], [11, 6], [16, 5], [21, 6], [24, 9], [25, 14]], M, { edge: true });   // half an egg-shell for a helmet
    h.rect(15, 6, 2, 8, M.s); h.px(15, 8, D.s).px(16, 11, D.s);                                   // riveted strip
    h.px(9, 12, D.s).px(12, 13, D.s).px(20, 13, D.s).px(23, 12, D.s).px(11, 8, M.l).px(12, 7, M.l);
    h.rect(18, 12, 4, 3, BORE);                                                                   // the hole under the crack
    h.px(21, 11, BORE).px(22, 10, BORE).px(21, 9, BORE).px(22, 8, BORE);                          // the crack
    rigEye(h, Q, 18, 13, () => { h.rect(18, 13, 3, 2, EYE); h.px(19, 13, HOT); }, 3);             // one glowing eye
    h.rect(15, 17, 2, 2, BRASS); h.px(16, 18, BR2); h.px(15, 19, WET);                            // brass spout on its snout
    rigMouth(h, Q, 12, 18, 2, () => h.px(12, 18, OUTLINE).px(13, 17, OUTLINE));                   // a little frown
  },
  // Garrishell's middle form (the owner's pick): a stocky young turtle on its hind legs, a simple
  // knight's helm with its one glowing eye behind the visor, a cocky smirk, a shell ringed with
  // half-built battlements, one fist and one forearm in an iron cuff ending in a small water
  // cannon, and an iron cuff on its tail.
  bulwarden(g, v = 'front') {
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a'), RIM = P('#d8a838', '#a07220', '#f0cc68');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (x, y, w = 2, hh = 3) => b.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    if (v === 'side') {
      t.poly([[8, 24], [2, 27.5], [9, 27]], S, { edge: true }); t.rect(4, 26, 2, 2, D.b);         // tail with its iron cuff
      merlon(5, 3); merlon(9, 2); merlon(13, 3, 2, 2);                                            // battlements (one broken)
      b.poly([[5, 5], [15, 5], [15, 9], [5, 9]], M, { edge: true });
      b.ellipse(11, 17, 8, 9, RIM, { edge: true }); b.ellipse(11, 17.5, 6.8, 7.8, M);              // shell, gold rim
      b.rect(5, 17, 13, 1, GOLD); b.px(8, 13, D.s).px(8, 21, D.s).px(14, 13, D.s);
      armB.ellipse(21, 20, 2.5, 2.5, S, { edge: true });                                          // far fist
      legB.ellipse(14, 27, 3, 3, S, { edge: true }); legA.ellipse(19, 27.5, 3.2, 3, S, { edge: true });
      legA.px(21, 29, C.l);
      b.ellipse(17, 21, 6, 6.5, S, { edge: true });                                               // body
      b.ellipse(21, 22, 2.5, 5, C);                                                               // plastron
      h.ellipse(23, 12.5, 3.5, 2.2, S, { edge: true });                                           // snout
      h.poly([[14, 8], [17, 4], [22, 4], [25, 7], [25, 11], [15, 11]], M, { edge: true });        // helm
      h.rect(20, 7, 5, 2, BORE);                                                                  // visor slit
      rigEye(h, Q, 22, 7, () => { h.rect(22, 7, 2, 2, EYE); h.px(22, 7, HOT); }, 2);
      h.px(16, 7, D.s);
      rigMouth(h, Q, 24, 13, 2, () => h.px(24, 13, OUTLINE).px(25, 12, OUTLINE));                 // smirk
      armA.ellipse(18, 19, 3, 3, S, { edge: true });                                              // near arm: the cannon
      armA.poly([[17, 20], [27, 20], [27, 24], [17, 24]], D, { edge: true }); armA.rect(21, 20, 1, 4, M.b);
      armA.ellipse(28, 22, 1.5, 2.6, M, { edge: true }); armA.px(29, 22, WET);
      return;
    }
    if (v === 'back') {
      h.ellipse(16, 6, 5, 3, M, { edge: true });                                                  // top of the helm
      armB.ellipse(6, 19, 3, 3, S, { edge: true });                                               // the cannon arm, on this side from behind
      armB.poly([[2, 21], [9, 21], [9, 26], [2, 26]], D, { edge: true }); armB.rect(2, 23, 7, 1, M.b);
      armB.ellipse(5.5, 26.5, 3, 1.4, M, { edge: true });
      armA.ellipse(26, 19, 3, 3, S, { edge: true }); armA.ellipse(26.5, 23.5, 2.8, 2.6, S, { edge: true });
      legA.ellipse(11, 27, 3.5, 3, S, { edge: true }); legB.ellipse(21, 27, 3.5, 3, S, { edge: true });
      b.ellipse(16, 17, 11, 10, RIM, { edge: true }); b.ellipse(16, 17.5, 9.5, 8.5, M);           // the shell
      b.rect(11, 10, 1, 15, GOLD); b.rect(20, 10, 1, 15, GOLD); b.rect(6, 18, 20, 1, GOLD);
      b.px(8, 14, D.s).px(24, 14, D.s).px(8, 22, D.s).px(24, 22, D.s).px(15, 13, M.l).px(16, 12, M.l);
      merlon(8, 1); merlon(13, 0, 2, 2); merlon(18, 1); merlon(22, 1);                            // its ring of battlements
      b.poly([[8, 3], [24, 3], [24, 8], [8, 8]], M, { edge: true });
      b.ellipse(16, 4, 7, 1.6, M.l);
      t.poly([[14, 25], [18, 25], [12, 31], [9, 31]], S, { edge: true }); t.rect(12, 27, 3, 2, D.b);
      return;
    }
    b.ellipse(16, 17, 11.5, 9.5, RIM, { edge: true }); b.ellipse(16, 17.5, 10, 8, M);              // shell behind, gold rim
    merlon(8, 2); merlon(12, 1); merlon(18, 2, 2, 2); merlon(22, 2);                              // a ring of half-built battlements
    b.poly([[8, 4], [24, 4], [24, 8], [8, 8]], M, { edge: true });
    legA.ellipse(11, 27, 3.5, 3, S, { edge: true }); legB.ellipse(21, 27, 3.5, 3, S, { edge: true });   // legs
    legA.px(9, 29, C.l).px(12, 29, C.l); legB.px(20, 29, C.l).px(23, 29, C.l);
    b.ellipse(16, 21, 7.5, 6.5, S, { edge: true });                                               // body
    b.ellipse(16, 22, 5, 5, C);                                                                   // plastron
    b.rect(12, 21, 9, 1, C.s); b.rect(16, 17, 1, 9, C.s);
    armA.ellipse(7, 19, 3, 3, S, { edge: true }); armA.ellipse(6.5, 23.5, 2.8, 2.6, S, { edge: true });   // fist up
    armA.px(5, 23, S.s).px(7, 23, S.s);
    armB.ellipse(25, 19, 3, 3, S, { edge: true });                                                // the cannon arm
    armB.poly([[22, 21], [29, 21], [29, 26], [22, 26]], D, { edge: true }); armB.rect(22, 23, 7, 1, M.b);
    armB.ellipse(25.5, 26.5, 3, 1.6, M, { edge: true }); armB.px(25, 26, BORE).px(26, 26, BORE).px(25, 27, WET);
    h.ellipse(16, 13.5, 4, 2.3, S, { edge: true });                                               // snout under the helm
    h.poly([[10, 9], [12, 4], [16, 3], [20, 4], [22, 9], [22, 12], [10, 12]], M, { edge: true }); // knight's helm
    h.rect(11, 7, 10, 3, BORE);                                                                   // visor
    rigEye(h, Q, 16, 7, () => { h.rect(16, 7, 3, 2, EYE); h.px(17, 7, HOT); }, 3);                // one glowing eye
    h.rect(13, 7, 1, 3, M.s); h.rect(20, 7, 1, 3, M.s);                                           // visor bars
    h.px(11, 5, D.s).px(20, 5, D.s).px(16, 4, M.l);
    rigMouth(h, Q, 14, 14, 3, () => h.px(14, 14, OUTLINE).px(15, 14, OUTLINE).px(16, 14, OUTLINE).px(17, 13, OUTLINE));   // cocky smirk
  },
  // The siege turtle (the owner's pick, "A3 · visor helm"): a hulking green turtle with a gunmetal
  // fortress-turret shell (battlements, rivets, gold trim), a castle-gate helm with one glowing eye
  // behind the visor and a portcullis grille, and a water cannon for each forearm.
  garrishell(g, v = 'front') { // 44x44
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (p, x, y, w = 5, hh = 6) => p.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    // From behind (the owner's reference): a domed shell of gold-trimmed plates, a round turret on
    // top with battlements and a hatch, and a tail with an iron cuff.
    const backShell = cx => {
      b.ellipse(cx, 25, 15, 13, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                  // gold rim
      b.ellipse(cx, 25.5, 13.5, 11.5, M);                                                          // the dome
      b.rect(cx - 6, 16, 1, 20, GOLD); b.rect(cx + 6, 16, 1, 20, GOLD);                            // plate seams
      b.rect(cx - 13, 26, 27, 1, GOLD); b.rect(cx - 6, 20, 13, 1, GOLD); b.rect(cx - 6, 32, 13, 1, GOLD);
      for (const [x, y] of [[-10, 21], [-10, 30], [10, 21], [10, 30], [0, 17], [0, 35], [-6, 23], [6, 23], [-6, 29], [6, 29]]) b.px(cx + x, y, D.s);   // rivets
      b.px(cx - 3, 23, M.l).px(cx - 2, 22, M.l).px(cx + 2, 29, M.l).px(cx + 3, 28, M.l);           // shine
      b.px(cx - 10, 24, D.s).px(cx - 9, 23, D.s).px(cx + 9, 33, D.s).px(cx + 10, 32, D.s);         // battle scratches
      merlon(b, cx - 9, 2, 3, 4); merlon(b, cx - 2, 1, 4, 4); merlon(b, cx + 6, 2, 3, 4);          // back battlements
      b.poly([[cx - 10, 5], [cx + 10, 5], [cx + 10, 14], [cx - 10, 14]], M, { edge: true });       // the round tower
      b.ellipse(cx, 6, 9.5, 3.2, P(M.l, M.b, '#d4d8e0'));                                          // its round top
      b.ellipse(cx, 6, 4, 2, D, { edge: true }); b.rect(cx - 1, 6, 2, 1, D.l);                     // round hatch
      for (const x of [-9, 9]) b.rect(cx + x - (x > 0 ? 1 : 0), 8, 2, 6, M.s);                    // shading round the sides
      merlon(b, cx - 11, 4, 3, 5); merlon(b, cx + 8, 4, 3, 5);                                     // battlements at the sides
      b.rect(cx - 10, 13, 21, 1, GOLD);
      b.px(cx - 7, 10, D.s).px(cx, 10, D.s).px(cx + 7, 10, D.s);
    };
    const backTail = x => {
      t.poly([[x + 4, 33], [x + 8, 36], [x - 1, 42], [x - 5, 43]], S, { edge: true });           // tail, out from under the shell
      t.poly([[x + 2, 36], [x + 5, 37.5], [x + 3, 40], [x, 39]], D, { edge: true });             // iron cuff
    };
    if (v === 'side') {
      t.poly([[8, 33], [1, 38], [10, 37]], S, { edge: true });                                   // stubby tail
      legB.ellipse(20, 37, 4.5, 4.5, S, { edge: true }); legB.ellipse(21, 41, 5, 2.2, S, { edge: true });
      b.ellipse(14, 23, 13, 12, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                // domed shell, gold rim
      b.ellipse(14, 23.5, 11.5, 10.5, M);
      b.rect(9, 14, 1, 19, GOLD); b.rect(19, 14, 1, 19, GOLD); b.rect(3, 24, 23, 1, GOLD);         // plate seams
      for (const [x, y] of [[5, 19], [5, 29], [14, 18], [14, 30], [23, 19], [23, 29]]) b.px(x, y, D.s);
      b.px(12, 21, M.l).px(13, 20, M.l).px(6, 27, D.s).px(7, 26, D.s);
      merlon(b, 4, 3, 3, 5); merlon(b, 10, 2, 3, 4); merlon(b, 16, 2, 3, 4); merlon(b, 21, 3, 3, 5);   // the round turret's battlements
      b.poly([[5, 6], [23, 6], [23, 13], [5, 13]], M, { edge: true });                             // the turret
      b.ellipse(14, 6, 8.5, 2, P(M.l, M.b, '#d4d8e0'));
      b.rect(5, 12, 19, 1, GOLD); b.px(9, 9, D.s).px(14, 9, D.s).px(19, 9, D.s);
      armB.poly([[28, 19], [39, 19], [39, 24], [28, 24]], D, { edge: true });                   // far cannon
      b.ellipse(27, 26, 8, 9, S, { edge: true });                                                // body
      b.ellipse(31, 27, 3, 7, C);                                                                // plastron
      b.rect(29, 24, 4, 1, C.s); b.rect(29, 29, 4, 1, C.s);
      legA.ellipse(26, 37, 5, 5, S, { edge: true }); legA.ellipse(28, 41, 6, 2.4, S, { edge: true });   // near leg
      legA.px(32, 41, C.l).px(34, 41, C.l);                                                      // claws
      h.poly([[22, 7], [29, 3], [35, 6], [37, 10], [37, 17], [24, 18], [21, 13]], M, { edge: true });   // helm
      h.rect(28, 3, 1, 7, M.l);                                                                  // crest ridge
      h.rect(30, 9, 7, 3, BORE);                                                                 // visor slit
      h.px(30, 10, S.s);
      rigEye(h, Q, 33, 9, () => { h.rect(33, 9, 3, 2, EYE); h.px(34, 9, HOT); }, 3);            // the glowing eye
      for (const x of [30, 32, 34, 36]) h.rect(x, 13, 1, 4, BORE);                               // portcullis grille
      h.px(24, 9, D.s).px(24, 15, D.s);
      armA.ellipse(26, 22, 4.5, 4.5, S, { edge: true });                                         // shoulder
      armA.poly([[25, 24], [39, 24], [39, 31], [25, 31]], D, { edge: true });                   // near cannon
      armA.rect(30, 24, 1, 7, GOLD); armA.rect(35, 24, 1, 7, GOLD);
      armA.ellipse(40, 27.5, 2, 4.2, M, { edge: true });                                         // muzzle
      armA.ellipse(40.5, 27.5, 1, 2.4, BORE); armA.px(41, 27, WET);
      return;
    }
    if (v === 'back') {
      armA.ellipse(5, 21, 4.5, 4.5, S, { edge: true }); armB.ellipse(39, 21, 4.5, 4.5, S, { edge: true });
      armA.poly([[1, 22], [9, 22], [9, 34], [1, 34]], D, { edge: true }); armB.poly([[35, 22], [43, 22], [43, 34], [35, 34]], D, { edge: true });
      armA.rect(1, 25, 8, 1, GOLD); armB.rect(35, 25, 8, 1, GOLD);
      armA.ellipse(5, 35, 4.5, 2.2, M, { edge: true }); armB.ellipse(39, 35, 4.5, 2.2, M, { edge: true });
      legA.ellipse(14, 38, 5, 4.5, S, { edge: true }); legB.ellipse(30, 38, 5, 4.5, S, { edge: true });
      legA.ellipse(14, 41, 5.5, 2.2, S, { edge: true }); legB.ellipse(30, 41, 5.5, 2.2, S, { edge: true });
      backShell(22);
      backTail(11);
      return;
    }
    b.ellipse(22, 21, 18, 12, P(GOLD, '#a07220', '#f0cc68'), { edge: true });              // the domed shell behind, gold rim
    b.ellipse(22, 21.5, 16.5, 10.5, M);
    b.rect(7, 21, 30, 1, GOLD); b.px(8, 17, D.s).px(8, 26, D.s).px(36, 17, D.s).px(36, 26, D.s);
    merlon(b, 10, 2, 3, 4); merlon(b, 15, 2, 3, 4); merlon(b, 26, 2, 3, 4); merlon(b, 31, 2, 3, 4);   // the round turret's battlements, over the head
    b.poly([[10, 4], [34, 4], [34, 11], [10, 11]], M, { edge: true });     // the turret
    b.rect(10, 5, 2, 6, M.s); b.rect(32, 5, 2, 6, M.s);                                // shading round its sides
    b.rect(10, 10, 24, 1, GOLD); b.px(13, 7, D.s).px(31, 7, D.s);
    legA.ellipse(14, 37, 5, 4.5, S, { edge: true }); legB.ellipse(30, 37, 5, 4.5, S, { edge: true });   // legs
    legA.ellipse(13, 41, 6, 2.4, S, { edge: true }); legB.ellipse(31, 41, 6, 2.4, S, { edge: true });   // feet
    legA.px(9, 42, C.l).px(12, 42, C.l).px(15, 42, C.l); legB.px(28, 42, C.l).px(31, 42, C.l).px(34, 42, C.l);   // claws
    b.ellipse(22, 26, 11, 9.5, S, { edge: true });                                               // body
    b.ellipse(22, 27, 7, 7.5, C);                                                                // plastron
    b.rect(16, 24, 12, 1, C.s); b.rect(16, 29, 12, 1, C.s); b.rect(21, 20, 1, 14, C.s);
    armA.ellipse(9, 21, 5, 5, S, { edge: true }); armB.ellipse(35, 21, 5, 5, S, { edge: true });     // shoulders
    armA.poly([[2, 23], [11, 23], [11, 34], [2, 34]], D, { edge: true });                       // the arm cannons
    armB.poly([[33, 23], [42, 23], [42, 34], [33, 34]], D, { edge: true });
    armA.rect(2, 26, 9, 1, GOLD); armB.rect(33, 26, 9, 1, GOLD);
    armA.ellipse(6.5, 35, 5, 3, M, { edge: true }); armB.ellipse(37.5, 35, 5, 3, M, { edge: true });   // muzzles, pointed at you
    armA.ellipse(6.5, 35, 3, 1.6, BORE); armB.ellipse(37.5, 35, 3, 1.6, BORE);
    armA.px(5, 35, WET); armB.px(37, 35, WET);
    h.poly([[15, 8], [18, 4], [26, 4], [29, 8], [30, 18], [14, 18]], M, { edge: true });         // castle-gate helm
    h.rect(21, 3, 2, 6, M.l);                                                                    // crest ridge
    h.rect(16, 10, 12, 3, BORE);                                                                 // visor slit
    h.rect(17, 11, 3, 1, S.s);                                                                   // skin in the shadow
    rigEye(h, Q, 23, 10, () => { h.rect(23, 10, 4, 2, EYE); h.px(24, 10, HOT); h.px(25, 10, HOT); }, 4);   // one huge glowing eye
    for (const x of [17, 19, 21, 23, 25, 27]) h.rect(x, 14, 1, 3, BORE);                         // portcullis grille
    h.px(16, 8, D.s).px(28, 8, D.s).px(15, 16, D.s).px(29, 16, D.s);                             // rivets
  },
});
Object.assign(MONSTER_ART_DIAG, {
  shellmet(g, v) {
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0', BRASS = '#d8a838', BR2 = '#a07a20';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const tower = (x, y) => { b.poly([[x, y + 1], [x + 4, y + 1], [x + 4, y + 5], [x, y + 5]], M, { edge: true }); b.px(x, y, M.b).px(x + 2, y, M.b).px(x + 4, y, M.b); };
    if (v === 'bside') {
      legB.ellipse(10, 27, 2.8, 3, S, { edge: true }); legA.ellipse(21, 27, 2.6, 3, S, { edge: true });
      t.poly([[11, 24], [8, 28], [13, 26]], S, { edge: true });                                   // tail, out to the left
      h.ellipse(21, 11, 6, 4.5, M, { edge: true });                                               // helmet, turned right
      h.px(21, 8, D.s).px(24, 11, D.s); h.px(26, 13, BORE);
      tower(9, 8);
      b.ellipse(15, 19, 9.5, 7, M, { edge: true });
      b.rect(14, 12, 2, 14, GOLD);
      b.px(9, 16, D.s).px(20, 16, D.s).px(10, 22, D.s).px(19, 22, D.s);
      return;
    }
    tower(4, 8);                                                                                  // the tiny tower, behind on the left
    b.ellipse(15, 20, 10, 6, M, { edge: true });
    b.rect(8, 15, 2, 9, GOLD); b.px(6, 21, D.s);
    t.poly([[6, 23], [1, 25], [7, 26]], S, { edge: true });
    legB.ellipse(10, 27, 2.6, 3, S, { edge: true }); legA.ellipse(22, 27, 2.8, 3, S, { edge: true });
    legB.px(9, 29, C.l); legA.px(21, 29, C.l).px(23, 29, C.l);
    b.ellipse(16, 22, 7, 5, S, { edge: true });
    b.ellipse(18, 23.5, 4, 3, C);
    h.ellipse(19, 16, 5.5, 4, S, { edge: true });                                                 // face, turned our way
    h.poly([[10, 14], [11, 9], [14, 6], [19, 5], [24, 6], [27, 9], [28, 14]], M, { edge: true });
    h.rect(12, 7, 2, 7, M.s);                                                                     // its side
    h.rect(18, 6, 2, 8, M.s); h.px(18, 8, D.s).px(19, 11, D.s);
    h.px(15, 12, D.s).px(23, 13, D.s).px(26, 12, D.s);
    h.rect(21, 12, 4, 3, BORE);
    h.px(24, 11, BORE).px(25, 10, BORE).px(24, 9, BORE).px(25, 8, BORE);
    rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 3, 2, EYE); h.px(22, 13, HOT); }, 3);
    h.rect(19, 17, 2, 2, BRASS); h.px(20, 18, BR2); h.px(20, 19, WET);
    rigMouth(h, Q, 16, 18, 2, () => h.px(16, 18, OUTLINE).px(17, 17, OUTLINE));
  },
  bulwarden(g, v) {
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a'), RIM = P('#d8a838', '#a07220', '#f0cc68');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (x, y, w = 2, hh = 3) => b.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    if (v === 'bside') {
      armB.ellipse(5, 19, 3, 3, S, { edge: true });
      armB.poly([[1, 21], [8, 21], [8, 26], [1, 26]], D, { edge: true }); armB.rect(1, 23, 7, 1, M.b);
      h.poly([[17, 6], [20, 3], [25, 4], [28, 7], [28, 11], [19, 11]], M, { edge: true });       // helm, turned right
      h.rect(26, 7, 2, 2, BORE); h.px(27, 7, EYE);
      armA.ellipse(26, 19, 2.6, 2.6, S, { edge: true }); armA.ellipse(27, 23, 2.4, 2.4, S, { edge: true });
      legB.ellipse(10, 27, 3.5, 3, S, { edge: true }); legA.ellipse(20, 27, 3.2, 3, S, { edge: true });
      b.ellipse(15, 17, 11, 10, RIM, { edge: true }); b.ellipse(15, 17.5, 9.5, 8.5, M);
      b.rect(10, 10, 1, 15, GOLD); b.rect(19, 10, 1, 15, GOLD); b.rect(5, 18, 20, 1, GOLD);
      b.px(7, 14, D.s).px(23, 14, D.s).px(7, 22, D.s).px(23, 22, D.s);
      merlon(7, 1); merlon(12, 0, 2, 2); merlon(17, 1); merlon(21, 1);
      b.poly([[7, 3], [23, 3], [23, 8], [7, 8]], M, { edge: true });
      b.ellipse(15, 4, 7, 1.6, M.l);
      t.poly([[11, 25], [15, 25], [8, 31], [5, 31]], S, { edge: true }); t.rect(9, 27, 3, 2, D.b);
      return;
    }
    b.ellipse(15, 17, 11.5, 9.5, RIM, { edge: true }); b.ellipse(15, 17.5, 10, 8, M);
    merlon(6, 2); merlon(10, 1); merlon(17, 2, 2, 2); merlon(21, 2);
    b.poly([[6, 4], [23, 4], [23, 8], [6, 8]], M, { edge: true });
    t.poly([[7, 25], [1, 28], [7, 28]], S, { edge: true }); t.rect(3, 26, 2, 2, D.b);              // tail, out to the left
    legB.ellipse(11, 27, 3.3, 3, S, { edge: true }); legA.ellipse(22, 27, 3.5, 3, S, { edge: true });
    legB.px(10, 29, C.l); legA.px(21, 29, C.l).px(24, 29, C.l);
    b.ellipse(16, 21, 7.5, 6.5, S, { edge: true });
    b.ellipse(18, 22, 4.5, 5, C);                                                                 // plastron, turned our way
    b.rect(14, 21, 8, 1, C.s); b.rect(18, 17, 1, 9, C.s);
    armB.ellipse(8, 19, 2.6, 2.6, S, { edge: true }); armB.ellipse(7.5, 23, 2.4, 2.3, S, { edge: true });   // far fist
    armA.ellipse(26, 19, 3, 3, S, { edge: true });                                                // near arm: the cannon
    armA.poly([[23, 21], [30, 21], [30, 26], [23, 26]], D, { edge: true }); armA.rect(23, 23, 7, 1, M.b);
    armA.ellipse(26.5, 26.5, 3, 1.6, M, { edge: true }); armA.px(26, 26, BORE).px(27, 26, BORE).px(26, 27, WET);
    h.ellipse(19, 13.5, 3.6, 2.3, S, { edge: true });
    h.poly([[12, 9], [14, 4], [18, 3], [22, 4], [24, 9], [24, 12], [12, 12]], M, { edge: true });
    h.rect(13, 5, 2, 7, M.s);                                                                     // its side
    h.rect(15, 7, 9, 3, BORE);
    rigEye(h, Q, 19, 7, () => { h.rect(19, 7, 3, 2, EYE); h.px(20, 7, HOT); }, 3);
    h.rect(17, 7, 1, 3, M.s); h.rect(23, 7, 1, 3, M.s);
    h.px(22, 5, D.s).px(18, 4, M.l);
    rigMouth(h, Q, 17, 14, 3, () => h.px(17, 14, OUTLINE).px(18, 14, OUTLINE).px(19, 14, OUTLINE).px(20, 13, OUTLINE));
  },
  garrishell(g, v) { // 44x44
    const S = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0');
    const M = P('#8a909c', '#5a606c', '#b4bac4'), D = P('#4a4e58', '#30333c', '#64687a');
    const GOLD = '#d8a838', BORE = '#1c2430', WET = '#7ad0f0', EYE = '#ffa020', HOT = '#fff0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const merlon = (p, x, y, w = 5, hh = 6) => p.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], M, { edge: true });
    // From behind (the owner's reference): a domed shell of gold-trimmed plates, a round turret on
    // top with battlements and a hatch, and a tail with an iron cuff.
    const backShell = cx => {
      b.ellipse(cx, 25, 15, 13, P(GOLD, '#a07220', '#f0cc68'), { edge: true });                  // gold rim
      b.ellipse(cx, 25.5, 13.5, 11.5, M);                                                          // the dome
      b.rect(cx - 6, 16, 1, 20, GOLD); b.rect(cx + 6, 16, 1, 20, GOLD);                            // plate seams
      b.rect(cx - 13, 26, 27, 1, GOLD); b.rect(cx - 6, 20, 13, 1, GOLD); b.rect(cx - 6, 32, 13, 1, GOLD);
      for (const [x, y] of [[-10, 21], [-10, 30], [10, 21], [10, 30], [0, 17], [0, 35], [-6, 23], [6, 23], [-6, 29], [6, 29]]) b.px(cx + x, y, D.s);   // rivets
      b.px(cx - 3, 23, M.l).px(cx - 2, 22, M.l).px(cx + 2, 29, M.l).px(cx + 3, 28, M.l);           // shine
      b.px(cx - 10, 24, D.s).px(cx - 9, 23, D.s).px(cx + 9, 33, D.s).px(cx + 10, 32, D.s);         // battle scratches
      merlon(b, cx - 9, 2, 3, 4); merlon(b, cx - 2, 1, 4, 4); merlon(b, cx + 6, 2, 3, 4);          // back battlements
      b.poly([[cx - 10, 5], [cx + 10, 5], [cx + 10, 14], [cx - 10, 14]], M, { edge: true });       // the round tower
      b.ellipse(cx, 6, 9.5, 3.2, P(M.l, M.b, '#d4d8e0'));                                          // its round top
      b.ellipse(cx, 6, 4, 2, D, { edge: true }); b.rect(cx - 1, 6, 2, 1, D.l);                     // round hatch
      for (const x of [-9, 9]) b.rect(cx + x - (x > 0 ? 1 : 0), 8, 2, 6, M.s);                    // shading round the sides
      merlon(b, cx - 11, 4, 3, 5); merlon(b, cx + 8, 4, 3, 5);                                     // battlements at the sides
      b.rect(cx - 10, 13, 21, 1, GOLD);
      b.px(cx - 7, 10, D.s).px(cx, 10, D.s).px(cx + 7, 10, D.s);
    };
    const backTail = x => {
      t.poly([[x + 4, 33], [x + 8, 36], [x - 1, 42], [x - 5, 43]], S, { edge: true });           // tail, out from under the shell
      t.poly([[x + 2, 36], [x + 5, 37.5], [x + 3, 40], [x, 39]], D, { edge: true });             // iron cuff
    };
    if (v === 'bside') {
      armB.ellipse(5, 21, 4.5, 4.5, S, { edge: true });
      armB.poly([[1, 22], [9, 22], [9, 34], [1, 34]], D, { edge: true }); armB.rect(1, 25, 8, 1, GOLD);
      armB.ellipse(5, 35, 4.5, 2.2, M, { edge: true });
      h.poly([[27, 6], [31, 2], [37, 3], [40, 7], [40, 15], [30, 15]], M, { edge: true });       // helm, turned right, peeking past the turret
      h.rect(35, 1, 1, 5, M.l);
      h.rect(37, 8, 3, 3, BORE); rigEye(h, Q, 38, 8, () => h.px(39, 9, EYE), 1);                 // the visor at its edge, eye glinting
      for (const y of [12, 14]) h.rect(37, y, 3, 1, BORE);
      armA.ellipse(36, 21, 4.5, 4.5, S, { edge: true });                                         // near arm and cannon, pointed ahead
      armA.poly([[33, 22], [42, 22], [42, 30], [33, 30]], D, { edge: true }); armA.rect(38, 22, 1, 8, GOLD);
      armA.ellipse(42, 26, 1.8, 3.6, M, { edge: true }); armA.px(43, 26, WET);
      legB.ellipse(13, 38, 5, 4.5, S, { edge: true }); legB.ellipse(13, 41, 5.5, 2.2, S, { edge: true });
      legA.ellipse(29, 38, 4.5, 4.5, S, { edge: true }); legA.ellipse(30, 41, 5, 2.2, S, { edge: true });
      backShell(20);
      backTail(9);
      return;
    }
    b.ellipse(21, 21, 18, 12, P(GOLD, '#a07220', '#f0cc68'), { edge: true });              // the domed shell behind, gold rim
    b.ellipse(21, 21.5, 16.5, 10.5, M);
    b.rect(6, 21, 30, 1, GOLD); b.px(7, 17, D.s).px(7, 26, D.s).px(35, 17, D.s).px(35, 26, D.s);
    merlon(b, 9, 2, 3, 4); merlon(b, 14, 2, 3, 4); merlon(b, 25, 2, 3, 4); merlon(b, 30, 2, 3, 4);   // the round turret's battlements, over the head
    b.poly([[9, 4], [33, 4], [33, 11], [9, 11]], M, { edge: true });     // the turret
    b.rect(9, 5, 2, 6, M.s); b.rect(31, 5, 2, 6, M.s);                                // shading round its sides
    b.rect(9, 10, 24, 1, GOLD); b.px(12, 7, D.s).px(30, 7, D.s);
    t.poly([[8, 33], [1, 37], [9, 37]], S, { edge: true });                                      // tail, out to the left
    legB.ellipse(15, 37, 4.5, 4.5, S, { edge: true }); legA.ellipse(30, 37, 5, 4.5, S, { edge: true });
    legB.ellipse(14, 41, 5.5, 2.2, S, { edge: true }); legA.ellipse(32, 41, 6, 2.4, S, { edge: true });
    legB.px(10, 42, C.l).px(13, 42, C.l); legA.px(29, 42, C.l).px(32, 42, C.l).px(35, 42, C.l);
    b.ellipse(23, 26, 10.5, 9.5, S, { edge: true });                                             // body
    b.ellipse(25, 27, 6.5, 7.5, C);                                                              // plastron, turned our way
    b.rect(19, 24, 12, 1, C.s); b.rect(19, 29, 12, 1, C.s); b.rect(24, 20, 1, 14, C.s);
    armB.ellipse(10, 21, 4, 4, S, { edge: true });                                               // far shoulder and cannon
    armB.poly([[4, 23], [11, 23], [11, 33], [4, 33]], D, { edge: true }); armB.rect(4, 26, 7, 1, GOLD);
    armB.ellipse(7.5, 34, 4, 2.4, M, { edge: true }); armB.ellipse(7.5, 34, 2.2, 1.2, BORE);
    armA.ellipse(36, 21, 5, 5, S, { edge: true });                                               // near shoulder and cannon
    armA.poly([[33, 23], [42, 23], [42, 34], [33, 34]], D, { edge: true }); armA.rect(33, 26, 9, 1, GOLD);
    armA.ellipse(37.5, 35, 5, 3, M, { edge: true }); armA.ellipse(38, 35, 3, 1.6, BORE); armA.px(37, 35, WET);
    h.poly([[17, 8], [20, 4], [28, 4], [31, 8], [32, 18], [16, 18]], M, { edge: true });         // helm, turned right
    h.rect(17, 7, 2, 10, M.s);                                                                   // its side, turned to us
    h.rect(24, 3, 2, 6, M.l);
    h.rect(20, 10, 11, 3, BORE);                                                                 // visor slit
    h.rect(21, 11, 2, 1, S.s);
    rigEye(h, Q, 26, 10, () => { h.rect(26, 10, 4, 2, EYE); h.px(27, 10, HOT); h.px(28, 10, HOT); }, 4);
    for (const x of [21, 23, 25, 27, 29]) h.rect(x, 14, 1, 3, BORE);                             // grille
    h.px(30, 8, D.s).px(31, 16, D.s);
  },
});
Object.assign(RIGGED, { shellmet: 'quad', bulwarden: 'biped', garrishell: 'biped' });
