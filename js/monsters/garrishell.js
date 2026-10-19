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

// Garrishell's legendary 4th stages, made at the evolution altar by offering relics (the owner's
// generated art): the element offered picks the branch. Each keeps the family's green scales and
// one glowing eye behind a visor; everything else changes.
const LEGEND_PAL = {
  M: P('#8a909c', '#5a606c', '#b4bac4'), D: P('#4a4e58', '#30333c', '#64687a'), BORE: '#1c2430',
  STEAM: P('#eef0f4', '#c4c8d4', '#ffffff'), LAVA: P('#ff7a1c', '#c8401a', '#ffd34a'),
};
Object.assign(MONSTER_ART, {
  // Magma Bastion (fire): a walking volcano island. Its shell is a whole volcano with a ruined
  // castle on its slopes, erupting at the top; seawater pours off it and hisses into steam
  // geysers (water/fire); four huge pillar legs cracked with magma; a small helm low at the front.
  magmabastion(g, v = 'front') { // 44x44
    const { M, BORE, STEAM, LAVA } = LEGEND_PAL;
    const SK = P('#3a5a2e', '#24401c', '#527a3e'), ROCK = P('#4a3e38', '#2e2622', '#6a5a50'), SHELL = P('#3e4a2a', '#28321a', '#566440');
    const L = '#ff7a1c', HOT = '#ffd34a', WATER = '#7ad0f0', CLAW = '#c8c0a0', EYE = '#fff4d0', EYE2 = '#ffb040', STONE = '#7a6a5a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cone = (x0, peakL, peakR, x1, base = 24) => {   // the volcano, with lava running down from its crater
      b.poly([[x0, base], [peakL, 7], [peakR, 7], [x1, base]], ROCK, { edge: true });
      b.rect(peakL, 6, peakR - peakL, 2, '#c8401a'); b.rect(peakL + 1, 6, peakR - peakL - 2, 1, L);
      for (let y = 8; y < base - 1; y++) { b.px(peakL + 2 + ((y - 8) >> 2), y, y % 3 ? L : HOT); b.px(peakR - 2 + ((y - 8) >> 1), y, L); }
    };
    const castle = x => { b.rect(x, 15, 5, 4, STONE); b.px(x, 14, STONE).px(x + 2, 14, STONE).px(x + 4, 14, STONE); b.px(x + 2, 16, OUTLINE).px(x + 2, 17, OUTLINE); };
    const shell = (cx, rx) => {
      b.ellipse(cx, 25, rx, 7.5, SHELL, { edge: true });
      for (const [x, y] of [[-12, 24], [-11, 25], [-10, 24], [-9, 26], [7, 23], [8, 24], [9, 25], [11, 24], [-3, 28], [-2, 29], [3, 28]]) b.px(cx + x, y, L);
      b.px(cx - rx + 1, 27, WATER).px(cx - rx + 1, 28, WATER).px(cx + rx - 2, 27, WATER).px(cx + rx - 2, 28, WATER);   // seawater pouring off
    };
    const plume = (x) => {   // the eruption and the steam geysers (on the tail part, so they sway)
      t.poly([[x - 3, 6], [x, 0], [x + 3, 6]], LAVA, { edge: true }); t.px(x, 2, HOT);
    };
    const geyser = (x, dir) => { for (const [dx, y, r] of [[0, 15, 2], [-1.5, 11, 2.8], [-2.5, 7, 3.4]]) t.ellipse(x + dir * dx, y, r, r * 0.85, STEAM, { edge: true }); t.px(x, 18, WATER).px(x + dir, 17, WATER); };   // a puffy steam geyser, seawater at its foot
    const pillar = (p, x, big) => {
      p.ellipse(x, 35, big ? 6 : 5, big ? 6.5 : 5.5, SK, { edge: true });
      p.ellipse(x, 40, big ? 6.5 : 5.5, 2.5, SK, { edge: true });
      p.px(x - 2, 33, L).px(x - 1, 34, L).px(x + 1, 36, L).px(x, 37, L).px(x + 2, 33, L);
      p.px(x - 4, 42, CLAW).px(x - 1, 42, CLAW).px(x + 2, 42, CLAW);
    };
    if (v === 'side') {
      plume(17); geyser(5, 1);
      t.poly([[5, 30], [0, 33], [6, 33]], SK, { edge: true });                                  // stubby tail
      pillar(legA, 10, false); pillar(legB, 28, false);                                         // far legs
      cone(7, 14, 21, 30); castle(22);
      shell(19, 17);
      pillar(legB, 13, true); pillar(legA, 31, true);                                          // near legs
      h.ellipse(33, 32, 4, 3, SK);                                                              // neck
      h.ellipse(37, 32, 5, 4.5, SK, { edge: true });
      h.poly([[32, 30], [34, 27], [39, 27], [42, 30], [42, 33], [33, 33]], M, { edge: true });   // small helm
      h.rect(37, 29, 5, 2, BORE);
      rigEye(h, Q, 39, 29, () => { h.rect(39, 29, 2, 2, EYE); h.px(40, 30, EYE2); }, 2);
      h.px(35, 35, L).px(36, 36, L);
      return;
    }
    if (v === 'back') {
      pillar(legA, 10, true); pillar(legB, 34, true);
      t.poly([[20, 31], [24, 31], [22, 38]], SK, { edge: true });                               // tail
      plume(22); geyser(7, 1); geyser(37, -1);
      cone(11, 18, 26, 33); castle(26);
      shell(22, 20);
      return;
    }
    plume(22); geyser(7, 1); geyser(37, -1);
    cone(11, 18, 26, 33); castle(13);
    shell(22, 20);
    pillar(legA, 10, true); pillar(legB, 34, true);
    h.ellipse(22, 33, 6.5, 5, SK, { edge: true });                                              // head, low at the front
    h.poly([[16, 30], [18, 26], [26, 26], [28, 30], [28, 33], [16, 33]], M, { edge: true });     // helm
    h.rect(18, 29, 8, 2, BORE);                                                                 // visor
    rigEye(h, Q, 22, 29, () => { h.rect(22, 29, 3, 2, EYE); h.px(24, 30, EYE2); }, 3);           // one white-hot eye
    h.px(19, 32, BORE).px(21, 32, BORE).px(23, 32, BORE).px(25, 32, BORE);                      // grille
    h.ellipse(22, 36, 4, 2.2, SK, { edge: true });                                              // snout
    h.px(20, 35, L).px(25, 36, L);
  },

  // Railwarden (storm): lean and upright like an armoured lancer. The shell is now a capacitor
  // pack with three copper coil spires; one arm is a railgun lance glowing along its rails, the
  // other holds a tower shield made from a shell plate; a narrow helm with one cyan eye.
  railwarden(g, v = 'front') { // 44x44
    const { M, D, BORE } = LEGEND_PAL;
    const SK = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0'), RIM = P('#d8a838', '#a07220', '#f0cc68');
    const E = '#7af0ff', E2 = '#d0faff', GOLD = '#d8a838', CLAW = '#c8c0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const coil = (x, top) => { for (let y = top; y < 10; y += 2) { b.rect(x - 1, y, 3, 1, '#d87a3a'); b.rect(x - 1, y + 1, 3, 1, '#8a4a1a'); } b.px(x, top - 1, '#e8e8f0'); };
    const arcs = pts => { for (const [x, y] of pts) t.px(x, y, (x + y) % 3 ? E : E2); };
    const leg = (p, x, dir) => {
      p.poly([[x - 3, 29], [x + 2, 29], [x + 1, 35], [x + 2 * dir, 41], [x - 3 * dir, 41], [x - 2, 35]], SK, { edge: true });
      p.px(x - 3, 42, CLAW).px(x, 42, CLAW).px(x + 2, 42, CLAW);
    };
    const shieldKite = (p, x0) => {   // a tower shield made from a shell plate
      p.poly([[x0, 14], [x0 + 14, 14], [x0 + 15, 28], [x0 + 8, 38], [x0, 30]], RIM, { edge: true });
      p.poly([[x0 + 2, 16], [x0 + 12, 16], [x0 + 13, 27], [x0 + 8, 35], [x0 + 2, 29]], M);
      p.px(x0 + 3, 17, D.s).px(x0 + 11, 17, D.s).px(x0 + 7, 25, D.s).px(x0 + 5, 20, M.l).px(x0 + 6, 19, M.l);
    };
    if (v === 'side') {
      b.poly([[6, 10], [14, 10], [14, 24], [6, 24]], D, { edge: true }); b.rect(6, 10, 8, 1, GOLD);   // capacitor pack
      coil(7, 3); coil(10, 1); coil(13, 3);
      arcs([[8, 0], [9, 1], [11, 0], [12, 2], [14, 1], [15, 3], [5, 4], [4, 6]]);
      t.poly([[13, 28], [6, 36], [9, 37], [15, 31]], SK, { edge: true }); t.rect(9, 32, 3, 2, D.b);   // tail with its cuff
      armB.poly([[17, 14], [21, 14], [21, 31], [17, 31]], M, { edge: true }); armB.rect(20, 14, 1, 17, GOLD);   // the shield, edge on
      leg(legB, 17, 1);
      b.poly([[14, 12], [24, 12], [25, 26], [21, 31], [16, 31], [14, 24]], SK, { edge: true });   // lean body
      b.poly([[21, 14], [25, 14], [25, 26], [22, 30]], C);
      leg(legA, 21, 1);
      h.poly([[17, 4], [20, 1], [25, 2], [28, 5], [28, 11], [18, 12]], M, { edge: true });        // narrow helm
      h.rect(23, 6, 5, 2, BORE);
      rigEye(h, Q, 25, 6, () => { h.rect(25, 6, 2, 2, E); h.px(25, 6, E2); }, 2);
      h.px(25, 9, BORE).px(27, 9, BORE);
      armA.ellipse(21, 16, 3, 3, SK, { edge: true });                                            // the railgun lance, levelled
      armA.poly([[19, 17], [41, 17], [43, 19], [41, 21], [19, 21]], M, { edge: true });
      armA.rect(23, 19, 17, 1, E); armA.rect(19, 17, 4, 4, D.b);
      return;
    }
    if (v === 'back') {
      shieldKite(armB, 1);                                                                       // shield on this side from behind
      leg(legA, 18, -1); leg(legB, 27, 1);
      t.poly([[21, 28], [24, 28], [19, 38], [16, 37]], SK, { edge: true }); t.rect(18, 33, 3, 2, D.b);
      b.poly([[15, 13], [29, 13], [27, 27], [24, 30], [20, 30], [17, 27]], SK, { edge: true });
      h.poly([[19, 5], [21, 2], [23, 2], [25, 5], [25, 9], [19, 9]], M, { edge: true });           // top of the helm
      b.poly([[13, 9], [31, 9], [31, 24], [13, 24]], D, { edge: true }); b.rect(13, 9, 18, 1, GOLD);   // capacitor pack
      b.rect(16, 13, 12, 1, '#30333c'); b.rect(16, 17, 12, 1, '#30333c'); b.px(18, 20, E).px(26, 20, E);
      coil(16, 3); coil(22, 1); coil(28, 3);
      arcs([[17, 1], [18, 0], [20, 1], [21, 0], [24, 0], [25, 1], [27, 0], [29, 1], [31, 4], [32, 6], [12, 5], [11, 7]]);
      armA.ellipse(31, 15, 3, 3, SK, { edge: true });                                            // the lance
      armA.poly([[29, 17], [32, 15], [43, 38], [40, 40]], M, { edge: true });
      for (let k = 0; k < 9; k++) armA.px(33 + k, 20 + k * 2, E);
      return;
    }
    b.poly([[13, 10], [31, 10], [31, 22], [13, 22]], D, { edge: true }); b.rect(13, 10, 18, 1, GOLD);   // capacitor pack behind
    coil(15, 3); coil(22, 1); coil(29, 3);
    arcs([[16, 1], [17, 0], [19, 1], [20, 0], [24, 0], [25, 1], [27, 0], [28, 1], [31, 3], [32, 5], [12, 3], [11, 5]]);
    leg(legA, 17, -1); leg(legB, 27, 1);
    b.poly([[15, 13], [29, 13], [27, 26], [24, 30], [20, 30], [17, 26]], SK, { edge: true });     // lean torso
    b.poly([[18, 15], [26, 15], [25, 26], [22, 29], [19, 26]], C);
    b.rect(19, 19, 7, 1, C.s); b.rect(19, 23, 7, 1, C.s); b.rect(22, 15, 1, 13, C.s);
    armA.ellipse(14, 15, 3, 3, SK, { edge: true });                                              // lance arm
    armA.poly([[12, 16], [16, 18], [5, 40], [2, 38]], M, { edge: true });
    armA.rect(11, 16, 4, 4, D.b);
    for (let k = 0; k < 9; k++) armA.px(12 - k, 21 + Math.round(k * 2), E);                      // rails glowing
    armA.poly([[2, 38], [5, 40], [1, 43]], M, { edge: true });
    armB.ellipse(30, 15, 3, 3, SK, { edge: true });
    shieldKite(armB, 27);
    h.poly([[18, 5], [20, 2], [24, 2], [26, 5], [26, 13], [18, 13]], M, { edge: true });         // narrow knight's helm
    h.rect(21, 1, 2, 4, M.l);
    h.rect(19, 7, 6, 2, BORE);
    rigEye(h, Q, 22, 7, () => { h.rect(22, 7, 2, 2, E); h.px(22, 7, E2); }, 2);                  // one cyan eye
    h.px(20, 10, BORE).px(22, 10, BORE).px(24, 10, BORE).px(20, 11, BORE).px(22, 11, BORE).px(24, 11, BORE);
  },

  // Citadrone (iron): a flying citadel. The shell is a huge armoured disc with teal panel lines
  // and a cockpit dome, hover engines underneath and no legs; the head and cannon arms poke out
  // of hatches; small drone turrets fly alongside it.
  citadrone(g, v = 'front') { // 44x44
    const { D, BORE } = LEGEND_PAL;
    const SK = P('#5a8a3a', '#3a6226', '#7aa856'), M = P('#7a8290', '#4e5462', '#a8b0bc'), HM = P('#8a909c', '#5a606c', '#b4bac4');
    const T = '#4af0d8', T2 = '#c0fff4', JET = P('#4af0d8', '#20a090', '#c0fff4'), HATCH = '#2a2e38';
    const { Q, b, h, t, earA, earB, armA, armB } = rigParts(g, v);
    const drone = (p, x, y) => { p.ellipse(x, y, 3.5, 1.5, M, { edge: true }); p.ellipse(x, y - 1, 1.6, 1, P(T, '#20a090', T2)); p.px(x, y + 2, T); };
    const jets = xs => { for (const x of xs) { t.poly([[x - 2, 30], [x + 2, 30], [x + 1, 39], [x - 1, 39]], JET); t.px(x, 32, T2); } };
    const cannon = (p, x0, x1) => { p.poly([[x0, 24], [x1, 24], [x1, 29], [x0, 29]], D, { edge: true }); p.rect(Math.min(x0, x1) + 3, 24, 1, 5, T); };
    const panels = (cx) => {
      b.rect(cx - 19, 25, 38, 1, '#3a404c');
      for (const [x, y] of [[-12, 15], [-11, 16], [-10, 17], [12, 15], [11, 16], [10, 17], [-6, 13], [6, 13], [-15, 22], [15, 22], [-2, 27], [2, 27]]) b.px(cx + x, y, T);
      b.rect(cx - 8, 20, 4, 1, T); b.rect(cx + 5, 20, 4, 1, T);
    };
    if (v === 'side') {
      drone(earA, 6, 5); drone(earB, 38, 3);
      jets([14, 26]);
      b.ellipse(22, 24, 20, 6, M, { edge: true });                                              // the disc, from the side
      b.ellipse(19, 18, 13, 7, M, { edge: true });                                              // armoured dome
      b.ellipse(20, 11, 3.5, 2, JET, { edge: true });                                           // cockpit
      b.rect(3, 25, 38, 1, '#3a404c'); b.px(12, 15, T).px(13, 16, T).px(25, 14, T).px(26, 15, T).px(9, 22, T).px(30, 22, T);
      b.ellipse(35, 22, 4, 4, HATCH);                                                           // front hatch
      h.ellipse(36, 23, 3.5, 3, SK, { edge: true });
      h.poly([[33, 21], [35, 18], [39, 18], [41, 21], [41, 23], [34, 23]], HM, { edge: true });
      h.rect(37, 20, 4, 2, BORE);
      rigEye(h, Q, 38, 20, () => { h.rect(38, 20, 2, 2, T); h.px(38, 20, T2); }, 2);
      armA.ellipse(31, 27, 2.5, 2, SK, { edge: true });
      cannon(armA, 31, 43);
      return;
    }
    if (v === 'back') {
      drone(earA, 5, 6); drone(earB, 39, 6);
      jets([14, 22, 30]);
      cannon(armA, 1, 9); cannon(armB, 35, 43);
      b.ellipse(22, 24, 21, 7, M, { edge: true });
      b.ellipse(22, 18, 14, 8, M, { edge: true });
      b.ellipse(22, 11, 4, 2.5, JET, { edge: true });
      panels(22);
      b.ellipse(15, 26, 3, 1.6, JET); b.ellipse(29, 26, 3, 1.6, JET);                           // rear thrusters
      return;
    }
    drone(earA, 5, 6); drone(earB, 39, 6);
    jets([14, 22, 30]);
    b.ellipse(22, 24, 21, 7, M, { edge: true });                                                // the citadel disc
    b.ellipse(22, 18, 14, 8, M, { edge: true });                                                // armoured dome
    b.ellipse(22, 11, 4, 2.5, JET, { edge: true });                                             // cockpit
    panels(22);
    b.ellipse(22, 22, 6, 5, HATCH);                                                             // hatch
    armA.ellipse(9, 25, 3, 2.5, SK, { edge: true }); armB.ellipse(35, 25, 3, 2.5, SK, { edge: true });   // arms, half out
    cannon(armA, 1, 8); cannon(armB, 36, 43);
    armA.px(1, 26, BORE).px(1, 27, BORE); armB.px(42, 26, BORE).px(42, 27, BORE);
    h.ellipse(22, 23, 4, 3.5, SK, { edge: true });                                              // head in the hatch
    h.poly([[18, 21], [19, 18], [25, 18], [26, 21], [26, 24], [18, 24]], HM, { edge: true });
    h.rect(19, 20, 6, 2, BORE);
    rigEye(h, Q, 22, 20, () => { h.rect(22, 20, 2, 2, T); h.px(22, 20, T2); }, 2);               // one teal eye
  },
});
Object.assign(MONSTER_ART_DIAG, {
  magmabastion(g, v) {
    const { M, BORE, STEAM, LAVA } = LEGEND_PAL;
    const SK = P('#3a5a2e', '#24401c', '#527a3e'), ROCK = P('#4a3e38', '#2e2622', '#6a5a50'), SHELL = P('#3e4a2a', '#28321a', '#566440');
    const L = '#ff7a1c', HOT = '#ffd34a', WATER = '#7ad0f0', CLAW = '#c8c0a0', EYE = '#fff4d0', EYE2 = '#ffb040', STONE = '#7a6a5a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cone = (x0, peakL, peakR, x1, base = 24) => {
      b.poly([[x0, base], [peakL, 7], [peakR, 7], [x1, base]], ROCK, { edge: true });
      b.rect(peakL, 6, peakR - peakL, 2, '#c8401a'); b.rect(peakL + 1, 6, peakR - peakL - 2, 1, L);
      for (let y = 8; y < base - 1; y++) { b.px(peakL + 2 + ((y - 8) >> 2), y, y % 3 ? L : HOT); b.px(peakR - 2 + ((y - 8) >> 1), y, L); }
    };
    const castle = x => { b.rect(x, 15, 5, 4, STONE); b.px(x, 14, STONE).px(x + 2, 14, STONE).px(x + 4, 14, STONE); b.px(x + 2, 16, OUTLINE).px(x + 2, 17, OUTLINE); };
    const shell = (cx, rx) => {
      b.ellipse(cx, 25, rx, 7.5, SHELL, { edge: true });
      for (const [x, y] of [[-12, 24], [-11, 25], [-10, 24], [-9, 26], [7, 23], [8, 24], [9, 25], [11, 24], [-3, 28], [-2, 29], [3, 28]]) b.px(cx + x, y, L);
      b.px(cx - rx + 1, 27, WATER).px(cx - rx + 1, 28, WATER).px(cx + rx - 2, 27, WATER).px(cx + rx - 2, 28, WATER);
    };
    const plume = x => { t.poly([[x - 3, 6], [x, 0], [x + 3, 6]], LAVA, { edge: true }); t.px(x, 2, HOT); };
    const geyser = (x, dir) => { for (const [dx, y, r] of [[0, 15, 2], [-1.5, 11, 2.8], [-2.5, 7, 3.4]]) t.ellipse(x + dir * dx, y, r, r * 0.85, STEAM, { edge: true }); t.px(x, 18, WATER).px(x + dir, 17, WATER); };   // a puffy steam geyser, seawater at its foot
    const pillar = (p, x, big) => {
      p.ellipse(x, 35, big ? 6 : 5, big ? 6.5 : 5.5, SK, { edge: true });
      p.ellipse(x, 40, big ? 6.5 : 5.5, 2.5, SK, { edge: true });
      p.px(x - 2, 33, L).px(x - 1, 34, L).px(x + 1, 36, L).px(x, 37, L).px(x + 2, 33, L);
      p.px(x - 4, 42, CLAW).px(x - 1, 42, CLAW).px(x + 2, 42, CLAW);
    };
    if (v === 'bside') {
      pillar(legB, 10, true); pillar(legA, 33, false);
      t.poly([[17, 31], [21, 31], [14, 37]], SK, { edge: true });
      plume(20); geyser(6, 1); geyser(35, -1);
      h.poly([[34, 27], [37, 25], [41, 26], [43, 29], [42, 32], [35, 32]], M, { edge: true });    // the helm, peeking out past the shell
      h.rect(41, 28, 2, 2, BORE); h.px(42, 28, EYE);
      cone(9, 16, 24, 31); castle(24);
      shell(20, 19);
      return;
    }
    t.poly([[4, 30], [0, 33], [5, 33]], SK, { edge: true });
    plume(20); geyser(6, 1); geyser(35, -1);
    cone(8, 15, 23, 31); castle(10);
    shell(20, 19);
    pillar(legB, 9, false); pillar(legA, 34, true);
    h.ellipse(26, 33, 6, 5, SK, { edge: true });
    h.poly([[20, 30], [22, 26], [30, 26], [32, 30], [32, 33], [20, 33]], M, { edge: true });
    h.rect(21, 27, 2, 6, M.s);                                                                 // its side
    h.rect(23, 29, 8, 2, BORE);
    rigEye(h, Q, 27, 29, () => { h.rect(27, 29, 3, 2, EYE); h.px(29, 30, EYE2); }, 3);
    h.px(24, 32, BORE).px(26, 32, BORE).px(28, 32, BORE).px(30, 32, BORE);
    h.ellipse(27, 36, 4, 2.2, SK, { edge: true });
    h.px(25, 35, L);
  },
  railwarden(g, v) {
    const { M, D, BORE } = LEGEND_PAL;
    const SK = P('#5a8a3a', '#3a6226', '#7aa856'), C = P('#b8c47a', '#8a9a52', '#d8e0a0'), RIM = P('#d8a838', '#a07220', '#f0cc68');
    const E = '#7af0ff', E2 = '#d0faff', GOLD = '#d8a838', CLAW = '#c8c0a0';
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const coil = (x, top) => { for (let y = top; y < 10; y += 2) { b.rect(x - 1, y, 3, 1, '#d87a3a'); b.rect(x - 1, y + 1, 3, 1, '#8a4a1a'); } b.px(x, top - 1, '#e8e8f0'); };
    const arcs = pts => { for (const [x, y] of pts) t.px(x, y, (x + y) % 3 ? E : E2); };
    const leg = (p, x, dir) => {
      p.poly([[x - 3, 29], [x + 2, 29], [x + 1, 35], [x + 2 * dir, 41], [x - 3 * dir, 41], [x - 2, 35]], SK, { edge: true });
      p.px(x - 3, 42, CLAW).px(x, 42, CLAW).px(x + 2, 42, CLAW);
    };
    const shieldKite = (p, x0) => {
      p.poly([[x0, 14], [x0 + 14, 14], [x0 + 15, 28], [x0 + 8, 38], [x0, 30]], RIM, { edge: true });
      p.poly([[x0 + 2, 16], [x0 + 12, 16], [x0 + 13, 27], [x0 + 8, 35], [x0 + 2, 29]], M);
      p.px(x0 + 3, 17, D.s).px(x0 + 11, 17, D.s).px(x0 + 7, 25, D.s).px(x0 + 5, 20, M.l).px(x0 + 6, 19, M.l);
    };
    if (v === 'bside') {
      shieldKite(armB, 0);
      leg(legB, 16, -1); leg(legA, 26, 1);
      t.poly([[19, 28], [22, 28], [15, 38], [12, 37]], SK, { edge: true }); t.rect(15, 33, 3, 2, D.b);
      b.poly([[14, 13], [28, 13], [26, 27], [23, 30], [19, 30], [16, 27]], SK, { edge: true });
      h.poly([[21, 4], [24, 1], [28, 2], [30, 5], [30, 10], [22, 10]], M, { edge: true });
      h.rect(29, 6, 2, 2, BORE); h.px(30, 6, E);
      b.poly([[12, 9], [29, 9], [29, 24], [12, 24]], D, { edge: true }); b.rect(12, 9, 17, 1, GOLD);
      b.rect(15, 13, 11, 1, '#30333c'); b.rect(15, 17, 11, 1, '#30333c'); b.px(17, 20, E).px(25, 20, E);
      coil(15, 3); coil(21, 1); coil(27, 3);
      arcs([[16, 1], [17, 0], [19, 1], [20, 0], [23, 0], [24, 1], [26, 0], [28, 1], [30, 4], [31, 6], [11, 5], [10, 7]]);
      armA.ellipse(30, 15, 3, 3, SK, { edge: true });
      armA.poly([[28, 17], [31, 15], [43, 36], [40, 38]], M, { edge: true });
      for (let k = 0; k < 9; k++) armA.px(32 + k, 20 + k * 2, E);
      return;
    }
    b.poly([[12, 10], [29, 10], [29, 22], [12, 22]], D, { edge: true }); b.rect(12, 10, 17, 1, GOLD);
    coil(14, 3); coil(20, 1); coil(27, 3);
    arcs([[15, 1], [16, 0], [18, 1], [19, 0], [22, 0], [23, 1], [25, 0], [26, 1], [29, 3], [30, 5], [11, 3], [10, 5]]);
    t.poly([[18, 28], [21, 28], [14, 38], [11, 37]], SK, { edge: true }); t.rect(14, 33, 3, 2, D.b);   // tail, out to the left
    leg(legB, 18, -1); leg(legA, 28, 1);
    b.poly([[16, 13], [30, 13], [28, 26], [25, 30], [21, 30], [18, 26]], SK, { edge: true });
    b.poly([[20, 15], [28, 15], [27, 26], [24, 29], [21, 26]], C);
    b.rect(21, 19, 7, 1, C.s); b.rect(21, 23, 7, 1, C.s); b.rect(24, 15, 1, 13, C.s);
    armB.ellipse(16, 15, 2.6, 2.6, SK, { edge: true });                                        // far arm: the shield, half hidden
    armB.poly([[8, 14], [17, 14], [17, 28], [12, 35], [8, 29]], RIM, { edge: true });
    armB.poly([[10, 16], [15, 16], [15, 27], [12, 32], [10, 28]], M);
    armA.ellipse(31, 15, 3, 3, SK, { edge: true });                                             // near arm: the lance
    armA.poly([[29, 17], [33, 15], [43, 38], [40, 40]], M, { edge: true });
    armA.rect(29, 16, 4, 4, D.b);
    for (let k = 0; k < 9; k++) armA.px(33 + k, 20 + k * 2, E);
    h.poly([[20, 5], [22, 2], [26, 2], [28, 5], [28, 13], [20, 13]], M, { edge: true });
    h.rect(20, 4, 2, 8, M.s);                                                                   // its side
    h.rect(22, 7, 6, 2, BORE);
    rigEye(h, Q, 25, 7, () => { h.rect(25, 7, 2, 2, E); h.px(25, 7, E2); }, 2);
    h.px(23, 10, BORE).px(25, 10, BORE).px(27, 10, BORE).px(23, 11, BORE).px(25, 11, BORE).px(27, 11, BORE);
  },
  citadrone(g, v) {
    const { D, BORE } = LEGEND_PAL;
    const SK = P('#5a8a3a', '#3a6226', '#7aa856'), M = P('#7a8290', '#4e5462', '#a8b0bc'), HM = P('#8a909c', '#5a606c', '#b4bac4');
    const T = '#4af0d8', T2 = '#c0fff4', JET = P('#4af0d8', '#20a090', '#c0fff4'), HATCH = '#2a2e38';
    const { Q, b, h, t, earA, earB, armA, armB } = rigParts(g, v);
    const drone = (p, x, y) => { p.ellipse(x, y, 3.5, 1.5, M, { edge: true }); p.ellipse(x, y - 1, 1.6, 1, P(T, '#20a090', T2)); p.px(x, y + 2, T); };
    const jets = xs => { for (const x of xs) { t.poly([[x - 2, 30], [x + 2, 30], [x + 1, 39], [x - 1, 39]], JET); t.px(x, 32, T2); } };
    const cannon = (p, x0, x1) => { p.poly([[x0, 24], [x1, 24], [x1, 29], [x0, 29]], D, { edge: true }); p.rect(Math.min(x0, x1) + 3, 24, 1, 5, T); };
    drone(earA, 5, 6); drone(earB, 39, 5);
    jets([13, 21, 29]);
    if (v === 'bside') {
      cannon(armB, 1, 8); cannon(armA, 35, 43);
      h.poly([[30, 14], [33, 12], [37, 13], [38, 16], [37, 19], [31, 19]], HM, { edge: true });   // helm peeking over the front rim
      h.rect(36, 15, 2, 2, BORE); h.px(37, 15, T);
      b.ellipse(21, 24, 21, 7, M, { edge: true });
      b.ellipse(20, 18, 14, 8, M, { edge: true });
      b.ellipse(20, 11, 4, 2.5, JET, { edge: true });
      b.rect(2, 25, 38, 1, '#3a404c');
      for (const [x, y] of [[8, 15], [9, 16], [10, 17], [30, 15], [29, 16], [28, 17], [5, 22], [35, 22]]) b.px(x, y, T);
      b.ellipse(13, 26, 3, 1.6, JET); b.ellipse(27, 26, 3, 1.6, JET);
      return;
    }
    b.ellipse(21, 24, 21, 7, M, { edge: true });
    b.ellipse(21, 18, 14, 8, M, { edge: true });
    b.ellipse(21, 11, 4, 2.5, JET, { edge: true });
    b.rect(2, 25, 38, 1, '#3a404c');
    for (const [x, y] of [[9, 15], [10, 16], [11, 17], [31, 15], [30, 16], [29, 17], [15, 13], [27, 13], [6, 22], [36, 22]]) b.px(x, y, T);
    b.ellipse(25, 22, 6, 5, HATCH);
    armB.ellipse(10, 25, 2.5, 2.2, SK, { edge: true }); cannon(armB, 2, 9);
    armA.ellipse(36, 25, 3, 2.5, SK, { edge: true }); cannon(armA, 36, 43);
    armA.px(42, 26, BORE).px(42, 27, BORE);
    h.ellipse(25, 23, 4, 3.5, SK, { edge: true });
    h.poly([[21, 21], [22, 18], [28, 18], [29, 21], [29, 24], [21, 24]], HM, { edge: true });
    h.rect(21, 19, 2, 5, HM.s);
    h.rect(23, 20, 6, 2, BORE);
    rigEye(h, Q, 26, 20, () => { h.rect(26, 20, 2, 2, T); h.px(26, 20, T2); }, 2);
  },
});
Object.assign(RIGGED, { magmabastion: 'quad', railwarden: 'biped', citadrone: 'floater' });
Object.assign(FLYERS, { citadrone: { hover: 8, flap: 0 } });
