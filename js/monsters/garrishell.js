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
// Railwarden's parts (r106 redraw from the owner's art): tall copper coil spires on a capacitor pack,
// a thick railgun lance with a glowing channel, a heater shield, lunging clawed legs, a knight's helm.
const RAIL = {
  SK: P('#5a8a3a', '#3a6226', '#7aa856'), SKD: P('#4a7430', '#30521e', '#5e8a44'), SHELL: P('#6a6a3e', '#48482a', '#8a8a56'),
  PL: P('#b8c47a', '#8a9a52', '#d8e0a0'),   // the pale plastron on its chest
  RIM: P('#d8a838', '#a07220', '#f0cc68'), E: '#7af0ff', E2: '#d0faff', GOLD: '#d8a838', CLAW: '#c8c0a0',
  CU: '#e08a44', CUD: '#9a5220', CAP: '#e8e8f0',
};
function railLine(p, x0, y0, x1, y1, col) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) p.px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), col);
}
const railKit = {
  // a copper coil spire: rings from its top down to the pack, a white ceramic cap and a silver spike
  coil(p, x, top, bottom = 11) {
    for (let y = top; y < bottom; y += 2) { p.rect(x - 1, y, 3, 1, RAIL.CU); p.rect(x - 1, y + 1, 3, 1, RAIL.CUD); }
    p.rect(x - 1, top - 1, 3, 1, RAIL.CAP); p.px(x, top - 2, '#ffffff');
  },
  // the capacitor pack on its shell
  pack(p, x0, x1, y0, y1) {
    const { D } = LEGEND_PAL;
    p.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], D, { edge: true }); p.rect(x0, y0, x1 - x0, 1, RAIL.GOLD);
    p.rect(x0 + 3, y0 + 4, x1 - x0 - 6, 1, '#30333c'); p.px(x0 + 4, y0 + 7, RAIL.E).px(x1 - 4, y0 + 7, RAIL.E);
  },
  // the railgun lance: a thick barrel from its forearm housing (sx, sy) to the tip (ex, ey), a glowing channel down it
  lance(p, sx, sy, ex, ey, w = 2.2) {
    const { M, D } = LEGEND_PAL, len = Math.hypot(ex - sx, ey - sy), ux = (ex - sx) / len, uy = (ey - sy) / len, nx = -uy * w, ny = ux * w;
    p.poly([[sx + nx, sy + ny], [ex + nx * 0.8, ey + ny * 0.8], [ex - nx * 0.8, ey - ny * 0.8], [sx - nx, sy - ny]], D, { edge: true });   // dark gunmetal barrel
    railLine(p, sx + nx * 0.6, sy + ny * 0.6, ex + nx * 0.5, ey + ny * 0.5, M.b);                  // the two rails
    railLine(p, sx - nx * 0.6, sy - ny * 0.6, ex - nx * 0.5, ey - ny * 0.5, M.s);
    railLine(p, sx + ux * 3, sy + uy * 3, ex, ey, RAIL.E);                                           // blue light down the channel
    for (let k = 0.3; k < 1; k += 0.3) p.px(Math.round(sx + (ex - sx) * k), Math.round(sy + (ey - sy) * k), RAIL.E2);
    p.poly([[ex + nx, ey + ny], [ex + ux * 4, ey + uy * 4], [ex - nx, ey - ny]], M, { edge: true });     // steel spear tip
    p.poly([[sx - 3, sy - 3], [sx + 3, sy - 3], [sx + 3, sy + 3], [sx - 3, sy + 3]], D, { edge: true });   // the housing on its forearm
    p.rect(Math.round(sx - 3), Math.round(sy), 6, 1, RAIL.GOLD);
  },

  // a lunging clawed leg: thigh at (hx, 31), knee, shin down to the foot at fx
  leg(p, hx, fx, pal = RAIL.SK) {
    p.ellipse(hx, 31, 3.5, 4.5, pal, { edge: true });
    p.poly([[hx - 2, 34], [hx + 2, 34], [fx + 2, 40], [fx - 2, 40]], pal, { edge: true });
    p.poly([[fx - 4, 40], [fx + 4, 40], [fx + 4, 42], [fx - 4, 42]], pal, { edge: true });
    p.px(Math.round(fx - 4), 42, RAIL.CLAW).px(Math.round(fx), 42, RAIL.CLAW).px(Math.round(fx + 3), 42, RAIL.CLAW);
  },
  // the heater shield, gold-rimmed, riveted, with a shine
  shield(p, x0, y0) {
    const { M, D } = LEGEND_PAL;
    p.poly([[x0, y0], [x0 + 14, y0], [x0 + 15, y0 + 13], [x0 + 8, y0 + 25], [x0, y0 + 15]], RAIL.RIM, { edge: true });
    p.poly([[x0 + 2, y0 + 2], [x0 + 12, y0 + 2], [x0 + 13, y0 + 12], [x0 + 8, y0 + 22], [x0 + 2, y0 + 14]], M);
    for (const [dx, dy] of [[3, 3], [11, 3], [3, 12], [12, 12], [7, 19]]) p.px(x0 + dx, y0 + dy, D.s);
    railLine(p, x0 + 4, y0 + 10, x0 + 9, y0 + 4, M.l); railLine(p, x0 + 5, y0 + 11, x0 + 10, y0 + 5, M.l);
  },
};
// Magma Bastion's and Citadrone's parts (r107 redraws, the owner: "show me what you can do").
const MAGMA = {
  SK: P('#3a5a2e', '#24401c', '#527a3e'), ROCK: P('#4a3e38', '#2e2622', '#6a5a50'), MOSS: P('#3e5a2a', '#28401a', '#567a3a'),
  BASALT: P('#2e2a2a', '#1a1818', '#46403e'), STONE: P('#8a7c6a', '#5e5446', '#aa9c88'),
  L: '#ff7a1c', HOT: '#ffd34a', DEEP: '#c8401a', WATER: '#7ad0f0', WATER2: '#d8f4ff', CLAW: '#c8c0a0', EYE: '#fff4d0', EYE2: '#ffb040',
};
const magmaKit = {
  // the shell: a whole volcanic mountain, mossy green round its foot, lava rivers running down from
  // the crater, a ruined castle on one slope (castleX, or none), seawater pouring off its rim
  mountain(b, cx, castleX, flip = 1) {
    const { ROCK, MOSS, STONE, L, HOT, DEEP, WATER, WATER2 } = MAGMA;
    const pts = [[-20, 30], [-18, 24], [-14, 19], [-11, 15], [-7, 8], [-4, 5], [4, 5], [7, 8], [11, 14], [15, 19], [18, 24], [20, 30]];
    b.poly(pts.map(([x, y]) => [cx + x, y]), ROCK, { edge: true });
    b.poly([[cx - 20, 30], [cx - 18, 25], [cx - 12, 24], [cx - 5, 26], [cx + 3, 25], [cx + 10, 26], [cx + 17, 24], [cx + 20, 30]], MOSS);   // mossy green round its foot
    for (const [x, y] of [[-15, 27], [-10, 28], [-4, 28], [2, 28], [8, 28], [14, 27]]) b.px(cx + x, y, MOSS.s).px(cx + x + 1, y, MOSS.s);   // scales
    b.rect(cx - 4, 5, 8, 2, DEEP); b.rect(cx - 3, 5, 6, 1, L); b.px(cx - 1, 5, HOT).px(cx + 1, 5, HOT);    // the crater, glowing
    const river = (x0, x1, seed) => { for (let y = 7; y < 26; y++) { const f = (y - 7) / 19, x = Math.round(x0 + (x1 - x0) * f + Math.sin(y * 0.9 + seed) * 0.8); b.px(x, y, (y + seed) % 4 ? L : HOT); if (y % 5 === 0) b.px(x + 1, y, DEEP); } };
    river(cx - 2 * flip, cx - 9 * flip, 0); river(cx + 2 * flip, cx + 11 * flip, 2);
    if (castleX !== null) {   // a ruined castle on its slope: a broken tower and a stretch of wall
      const x = castleX;
      b.rect(x, 13, 4, 8, STONE.b); b.rect(x, 13, 1, 8, STONE.l); b.px(x, 12, STONE.b).px(x + 2, 12, STONE.b); b.px(x + 1, 15, OUTLINE).px(x + 1, 16, OUTLINE);
      const wx = flip > 0 ? x + 4 : x - 6;
      b.rect(wx, 17, 6, 4, STONE.b); b.px(wx, 16, STONE.b).px(wx + 2, 16, STONE.b).px(wx + 4, 16, STONE.b);
    }
    for (const s of [-1, 1]) { const x = cx + s * 19; b.px(x, 27, WATER).px(x, 28, WATER2).px(x, 29, WATER).px(x - s, 30, WATER); }   // seawater pouring off
  },
  // a pillar leg: green scales on top, black basalt below cracked with lava, clawed
  pillar(p, x, big) {
    const { SK, BASALT, L, CLAW } = MAGMA, w = big ? 6 : 5;
    p.ellipse(x, 32, w, 4, SK, { edge: true });
    p.poly([[x - w + 0.5, 32], [x + w - 0.5, 32], [x + w, 41], [x - w, 41]], BASALT, { edge: true });
    p.px(x - 2, 34, L).px(x - 1, 35, L).px(x - 1, 36, MAGMA.HOT).px(x + 2, 37, L).px(x + 1, 38, L);
    p.rect(x - w, 41, w * 2, 1, BASALT.s); p.px(x - w + 1, 42, CLAW).px(x - 1, 42, CLAW).px(x + w - 2, 42, CLAW);
  },
  // the small armoured head, low at the front, one white-hot eye behind the visor
  head(h, Q, cx, cy) {
    const { M, BORE } = LEGEND_PAL, { SK, EYE, EYE2, L } = MAGMA;
    h.ellipse(cx, cy + 1, 6, 4.5, SK, { edge: true });
    h.poly([[cx - 6, cy], [cx - 4, cy - 4], [cx + 4, cy - 4], [cx + 6, cy], [cx + 6, cy + 2], [cx - 6, cy + 2]], M, { edge: true });
    h.rect(cx - 4, cy - 2, 8, 2, BORE);
    rigEye(h, Q, cx, cy - 2, () => { h.rect(cx, cy - 2, 3, 2, EYE); h.px(cx + 2, cy - 1, EYE2); }, 3);
    h.ellipse(cx, cy + 4, 3.5, 2, SK, { edge: true }); h.px(cx - 2, cy + 3, L).px(cx + 2, cy + 4, L);
  },
};
const CITA = {
  M: P('#7a8290', '#4e5462', '#a8b0bc'), MD: P('#545a68', '#363a46', '#6e7484'), SK: P('#5a8a3a', '#3a6226', '#7aa856'),
  T: '#4af0d8', T2: '#c0fff4', JET: P('#4af0d8', '#20a090', '#c0fff4'), HATCH: '#2a2e38', ROOF: P('#3a7a74', '#22504c', '#5aa8a0'),
};
const citaKit = {
  // the armoured flying disc: its hull, a rim band with glowing panel lines, the dark underside
  disc(b, cx) {
    const { M, MD, T } = CITA;
    b.ellipse(cx, 29, 19, 4.5, MD, { edge: true });                                               // underside
    b.ellipse(cx, 26, 20, 6, M, { edge: true });                                                  // the hull
    b.rect(cx - 19, 27, 38, 1, MD.s);                                                             // its rim band
    for (const x of [-15, -9, -3, 3, 9, 15]) b.px(cx + x, 27, T);                                 // glowing panel lights
    for (const x of [-12, 0, 12]) b.rect(cx + x - 2, 24, 4, 1, T);                                // panel lines
  },
  // the citadel on top: a ring of battlements with a round tower at each end
  walls(b, cx, w = 15) {
    const { M, MD, ROOF, T } = CITA;
    b.rect(cx - w, 18, w * 2, 4, MD.b); b.rect(cx - w, 18, w * 2, 1, M.l);
    for (let x = cx - w; x < cx + w; x += 3) b.rect(x, 16, 2, 2, MD.b);                            // crenellations
    for (const s of [-1, 1]) {
      const x = cx + s * (w - 1);
      b.poly([[x - 2.5, 21], [x + 2.5, 21], [x + 2.5, 12], [x - 2.5, 12]], M, { edge: true });    // tower
      b.poly([[x - 3.5, 12], [x + 3.5, 12], [x, 7]], ROOF, { edge: true });                       // its teal-lit roof
      b.px(x, 15, T).px(x, 16, T);                                                                 // a lit window
    }
  },
  // a green scaly arm out of a hatch under its rim, holding a stubby cannon pointing down at the enemy
  arm(p, x, dir) {
    const { SK, M, HATCH, T } = CITA;
    p.rect(x - 2, 28, 4, 3, HATCH);
    p.ellipse(x, 31, 2.5, 2.5, SK, { edge: true });
    p.poly([[x - 2, 32], [x + 2, 32], [x + 2 + dir, 37], [x - 2 + dir, 37]], M, { edge: true });
    p.rect(x - 1 + dir, 37, 2, 1, T);
  },

  // glowing teal engines beneath (on the tail part so they sway)
  jets(t, xs) {
    const { JET, T2 } = CITA;
    for (const x of xs) { t.poly([[x - 2, 31], [x + 2, 31], [x + 1, 39], [x - 1, 39]], JET); t.px(x, 33, T2).px(x, 34, T2); }
  },
};
const LEGEND_PAL = {
  M: P('#8a909c', '#5a606c', '#b4bac4'), D: P('#4a4e58', '#30333c', '#64687a'), BORE: '#1c2430',
  STEAM: P('#eef0f4', '#c4c8d4', '#ffffff'), LAVA: P('#ff7a1c', '#c8401a', '#ffd34a'),
};
Object.assign(MONSTER_ART, {
  // Magma Bastion (fire relics; redrawn in r107): a walking volcano island. Its shell is a whole
  // volcanic mountain, mossy green round its foot, lava rivers running down from the glowing
  // crater, a ruined castle on one slope, seawater pouring off its rim (water/fire); four pillar
  // legs of black basalt cracked with lava; a small armoured head low at the front with one
  // white-hot eye. In the game it erupts sparks and steams (SPECIES_AURA volcano).
  magmabastion(g, v = 'front') { // 44x44
    const { M, BORE } = LEGEND_PAL;
    const { SK, EYE, EYE2, L } = MAGMA;
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const K = magmaKit;
    if (v === 'side') {
      t.poly([[5, 30], [0, 33], [6, 33]], SK, { edge: true });                                   // stubby tail
      K.pillar(legA, 10, false); K.pillar(legB, 27, false);                                      // far legs
      K.mountain(b, 19, 8, 1);                                                                   // the volcano, castle on its back slope
      K.pillar(legB, 13, true); K.pillar(legA, 31, true);                                        // near legs
      h.ellipse(35, 31, 4, 3, SK);                                                               // neck
      h.ellipse(38, 32, 5, 4, SK, { edge: true });
      h.poly([[33, 30], [35, 27], [40, 27], [43, 30], [43, 33], [34, 33]], M, { edge: true });   // small helm
      h.rect(38, 29, 5, 2, BORE);
      rigEye(h, Q, 40, 29, () => { h.rect(40, 29, 2, 2, EYE); h.px(41, 30, EYE2); }, 2);
      h.px(36, 35, L).px(37, 36, L);
      return;
    }
    if (v === 'back') {
      t.poly([[20, 31], [24, 31], [22, 38]], SK, { edge: true });                               // tail
      K.mountain(b, 22, 29, -1);
      K.pillar(legA, 9, true); K.pillar(legB, 35, true);
      return;
    }
    K.mountain(b, 22, 11, 1);                                                                    // the volcano shell
    K.pillar(legA, 9, true); K.pillar(legB, 35, true);                                           // pillar legs
    K.head(h, Q, 22, 33);                                                                        // small armoured head
  },

  // Railwarden (storm relics; redrawn in r106 from the owner's art): a lean, muscular turtle lancer
  // in a wide lunging stance, its shell turned into a capacitor pack with three tall copper coil
  // spires (lightning crackles between them in the game: SPECIES_AURA), a thick railgun lance with
  // a glowing channel for one arm, a gold-rimmed heater shield on the other, and a knight's helm
  // with one cyan eye behind the visor.
  railwarden(g, v = 'front') { // 44x44
    const { M, D, BORE } = LEGEND_PAL;
    const { SK, SKD, SHELL, E, E2 } = RAIL;
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const K = railKit;
    const helmFront = cx => {
      h.poly([[cx - 5, 9], [cx - 3, 5], [cx + 3, 5], [cx + 5, 9], [cx + 5, 16], [cx - 5, 16]], M, { edge: true });
      h.rect(cx - 1, 3, 2, 3, M.l);                                                                 // crest
      h.rect(cx - 4, 10, 8, 2, BORE);                                                               // visor slit
      rigEye(h, Q, cx + 1, 10, () => { h.rect(cx + 1, 10, 2, 2, E); h.px(cx + 1, 10, E2); }, 2);     // one cyan eye
      for (const dx of [-3, -1, 1, 3]) h.px(cx + dx, 14, BORE);                                     // breathing holes
    };
    if (v === 'side') {
      K.pack(b, 6, 15, 10, 24);                                                                     // capacitor pack on its back
      K.coil(b, 7, 3, 10); K.coil(b, 11, 1, 10); K.coil(b, 14, 3, 10);
      t.poly([[13, 29], [7, 35], [9, 37], [15, 32]], SK, { edge: true }); t.rect(9, 33, 3, 2, D.b);   // tail with its cuff
      K.leg(legB, 16, 12, SKD);                                                                     // back leg, braced
      armB.poly([[16, 15], [20, 15], [20, 32], [16, 32]], M, { edge: true }); armB.rect(19, 15, 1, 17, RAIL.GOLD);   // the shield, edge on
      b.ellipse(19, 28, 5, 4, SK, { edge: true });                                                  // hips
      b.poly([[14, 13], [25, 13], [26, 22], [23, 28], [16, 28], [14, 21]], SK, { edge: true });     // lean, muscled body
      b.poly([[22, 14], [26, 14], [26, 22], [23, 27], [21, 24]], RAIL.PL);                          // pale plastron
      b.rect(22, 18, 4, 1, RAIL.PL.s).rect(22, 22, 3, 1, RAIL.PL.s);
      b.ellipse(14, 17, 3, 6, SHELL, { edge: true });                                               // shell rim under the pack
      K.leg(legA, 21, 27);                                                                          // front leg, lunging
      h.poly([[19, 7], [22, 4], [27, 5], [30, 8], [30, 15], [20, 15]], M, { edge: true });          // helm, side-on
      h.rect(21, 3, 4, 2, M.l);
      h.rect(25, 9, 5, 2, BORE);
      rigEye(h, Q, 27, 9, () => { h.rect(27, 9, 2, 2, E); h.px(27, 9, E2); }, 2);
      h.px(27, 13, BORE).px(29, 13, BORE);
      K.lance(armA, 24, 20, 41, 20, 2.4);                                                           // the lance, levelled at the enemy
      return;
    }
    if (v === 'back') {
      K.shield(armB, 0, 15);                                                                        // shield on this side from behind
      K.leg(legA, 17, 13); K.leg(legB, 27, 31);
      t.poly([[21, 28], [24, 28], [19, 38], [16, 37]], SK, { edge: true }); t.rect(18, 33, 3, 2, D.b);
      b.ellipse(22, 28, 6, 4, SK, { edge: true });
      b.poly([[14, 14], [30, 14], [29, 22], [26, 28], [18, 28], [15, 22]], SK, { edge: true });
      h.poly([[18, 8], [20, 5], [24, 5], [26, 8], [26, 13], [18, 13]], M, { edge: true });          // top of the helm
      b.ellipse(22, 18, 11, 8, SHELL, { edge: true });                                              // the shell
      K.pack(b, 13, 31, 9, 24);                                                                     // capacitor pack
      K.coil(b, 15, 2, 9); K.coil(b, 22, 0, 9); K.coil(b, 29, 2, 9);
      K.lance(armA, 32, 21, 42, 40);                                                                // the lance
      return;
    }
    K.pack(b, 12, 32, 9, 21);                                                                       // capacitor pack, behind
    K.coil(b, 13, 2, 9); K.coil(b, 22, 0, 9); K.coil(b, 31, 2, 9);                                 // three tall coil spires
    t.poly([[19, 29], [22, 31], [11, 38], [7, 37]], SK, { edge: true }); t.rect(12, 34, 3, 2, D.b);   // tail, curling out behind its leg, iron cuff
    b.ellipse(22, 17, 11, 7, SHELL, { edge: true });                                                // shell rim behind its shoulders
    K.leg(legA, 17, 12); K.leg(legB, 27, 32);                                                       // a wide, lunging stance
    b.ellipse(22, 28, 6, 4, SK, { edge: true });                                                    // hips
    b.poly([[14, 14], [30, 14], [29, 22], [26, 28], [18, 28], [15, 22]], SK, { edge: true });       // muscled chest
    b.poly([[17, 15], [27, 15], [26.5, 23], [22, 28], [17.5, 23]], RAIL.PL, { edge: true });        // pale plastron
    b.rect(22, 15, 1, 12, RAIL.PL.s).rect(18, 19, 9, 1, RAIL.PL.s).rect(19, 23, 7, 1, RAIL.PL.s);   // its scutes
    b.rect(20, 12, 4, 3, SK);                                                                       // neck
    armB.ellipse(31, 16, 3, 3, SK, { edge: true });                                                 // shield arm
    K.shield(armB, 27, 15);
    armA.ellipse(13, 16, 3, 3, SK, { edge: true });                                                 // lance arm
    K.lance(armA, 11, 21, 3, 40);
    helmFront(22);
  },

  // Citadrone (iron relics; redrawn in r107): a flying citadel. An armoured disc with glowing teal
  // panel lines, a ring of battlements on top with a round tower at each end, its head in a
  // cockpit-like dome helm with one teal eye behind the visor, green scaly arms out of side hatches
  // holding cannons, and teal engines beneath. In the game drones circle it and its engines
  // flicker (SPECIES_AURA citadel).
  citadrone(g, v = 'front') { // 44x44
    const { BORE } = LEGEND_PAL;
    const { M, SK, T, T2 } = CITA;
    const { Q, b, h, t, armA, armB } = rigParts(g, v);
    const K = citaKit;
    const dome = (cx, eye) => {
      h.ellipse(cx, 21, 4, 2, SK, { edge: true });                                               // its green chin, out of the hatch
      h.ellipse(cx, 15, 6, 5.5, M, { edge: true });                                              // the dome helm
      h.rect(cx - 1, 9, 2, 2, M.l);
      if (eye) {
        h.rect(cx - 5, 14, 10, 2, BORE);                                                         // visor slit
        rigEye(h, Q, cx + eye, 14, () => { h.rect(cx + eye, 14, 2, 2, T); h.px(cx + eye, 14, T2); }, 2);   // one teal eye
      } else { h.rect(cx - 4, 15, 8, 1, M.s); h.px(cx - 3, 13, T).px(cx + 3, 13, T); }
    };
    if (v === 'side') {
      K.jets(t, [16, 26]);
      K.disc(b, 22);
      K.walls(b, 20, 13);
      dome(28, 3);
      K.arm(armA, 33, 1);
      return;
    }
    if (v === 'back') {
      K.jets(t, [14, 22, 30]);
      K.arm(armA, 8, -1); K.arm(armB, 36, 1);
      K.disc(b, 22);
      dome(22, 0);
      K.walls(b, 22);
      return;
    }
    K.jets(t, [14, 22, 30]);
    K.disc(b, 22);
    K.walls(b, 22);
    dome(22, 0.5);
    K.arm(armA, 8, -1); K.arm(armB, 36, 1);                                                      // arms and cannons out of side hatches
  },
});
Object.assign(MONSTER_ART_DIAG, {
  magmabastion(g, v) {
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const K = magmaKit, { SK } = MAGMA;
    if (v === 'bside') {
      t.poly([[16, 31], [20, 31], [17, 38]], SK, { edge: true });
      K.mountain(b, 21, 28, -1);
      K.pillar(legB, 9, true); K.pillar(legA, 34, true);
      h.ellipse(37, 33, 3, 2.5, SK);                                                              // the edge of its head, just showing
      return;
    }
    K.mountain(b, 21, 10, 1);
    K.pillar(legB, 9, false); K.pillar(legA, 34, true);
    K.head(h, Q, 27, 33);                                                                        // head, turned its way
  },
  railwarden(g, v) {
    const { M, D, BORE } = LEGEND_PAL;
    const { SK, SKD, SHELL, E, E2 } = RAIL;
    const { Q, b, h, t, legA, legB, armA, armB } = rigParts(g, v);
    const K = railKit;
    if (v === 'bside') {
      K.shield(armB, 0, 15);
      K.leg(legB, 16, 12); K.leg(legA, 26, 30);
      t.poly([[19, 28], [22, 28], [15, 38], [12, 37]], SK, { edge: true }); t.rect(15, 33, 3, 2, D.b);
      b.ellipse(21, 28, 6, 4, SK, { edge: true });
      b.poly([[14, 14], [29, 14], [28, 22], [25, 28], [17, 28], [15, 22]], SK, { edge: true });
      h.poly([[21, 8], [24, 5], [28, 6], [30, 9], [30, 14], [22, 14]], M, { edge: true });
      h.rect(29, 10, 2, 2, BORE); h.px(30, 10, E);                                                  // the edge of the visor
      b.ellipse(20, 18, 10, 8, SHELL, { edge: true });
      K.pack(b, 12, 29, 9, 24);
      K.coil(b, 14, 2, 9); K.coil(b, 20, 0, 9); K.coil(b, 27, 2, 9);
      K.lance(armA, 31, 21, 42, 40);
      return;
    }
    K.pack(b, 13, 30, 9, 21);
    K.coil(b, 14, 2, 9); K.coil(b, 21, 0, 9); K.coil(b, 28, 2, 9);
    t.poly([[18, 29], [12, 35], [14, 37], [20, 32]], SK, { edge: true }); t.rect(14, 33, 3, 2, D.b);   // tail, out to the left
    b.ellipse(21, 17, 10, 7, SHELL, { edge: true });
    K.leg(legB, 18, 13, SKD); K.leg(legA, 27, 32);
    b.ellipse(22, 28, 6, 4, SK, { edge: true });
    b.poly([[15, 14], [30, 14], [29, 22], [26, 28], [19, 28], [16, 22]], SK, { edge: true });
    b.poly([[19, 15], [28, 15], [27.5, 23], [23.5, 28], [19.5, 23]], RAIL.PL, { edge: true });
    b.rect(24, 15, 1, 12, RAIL.PL.s).rect(20, 19, 8, 1, RAIL.PL.s).rect(21, 23, 6, 1, RAIL.PL.s);
    b.rect(21, 12, 4, 3, SK);
    armB.ellipse(16, 16, 2.6, 2.6, SK, { edge: true });                                             // far arm: the shield, half hidden
    K.shield(armB, 6, 15);
    armA.ellipse(31, 16, 3, 3, SK, { edge: true });                                                 // near arm: the lance
    K.lance(armA, 33, 21, 42, 39);
    h.poly([[19, 9], [21, 5], [27, 5], [29, 9], [29, 16], [19, 16]], M, { edge: true });
    h.rect(19, 8, 2, 8, M.s);                                                                       // its side
    h.rect(23, 4, 2, 2, M.l);
    h.rect(21, 10, 8, 2, BORE);
    rigEye(h, Q, 25, 10, () => { h.rect(25, 10, 2, 2, E); h.px(25, 10, E2); }, 2);
    for (const x of [22, 24, 26, 28]) h.px(x, 14, BORE);
  },
  citadrone(g, v) {
    const { BORE } = LEGEND_PAL;
    const { M, SK, T, T2 } = CITA;
    const { Q, b, h, t, armA, armB } = rigParts(g, v);
    const K = citaKit;
    K.jets(t, [15, 23, 31]);
    if (v === 'bside') {
      K.arm(armB, 8, -1); K.arm(armA, 36, 1);
      K.disc(b, 22);
      h.ellipse(25, 15, 6, 5.5, M, { edge: true }); h.rect(21, 15, 8, 1, M.s); h.px(29, 14, T);  // the back of the dome
      K.walls(b, 22);
      return;
    }
    K.disc(b, 22);
    K.walls(b, 22);
    h.ellipse(25, 21, 4, 2, SK, { edge: true });
    h.ellipse(25, 15, 6, 5.5, M, { edge: true }); h.rect(24, 9, 2, 2, M.l);
    h.rect(21, 14, 9, 2, BORE);
    rigEye(h, Q, 26, 14, () => { h.rect(26, 14, 2, 2, T); h.px(26, 14, T2); }, 2);
    K.arm(armB, 8, -1); K.arm(armA, 36, 1);
  },
});
Object.assign(RIGGED, { magmabastion: 'quad', railwarden: 'biped', citadrone: 'floater' });
Object.assign(FLYERS, { citadrone: { hover: 8, flap: 0 } });
