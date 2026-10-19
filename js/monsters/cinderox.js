// The cinderox family: cinderox, infernox. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  cinderox(g, v = 'front') {
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[7, 20], [1, 17], [7, 24]], F);
      h.poly([[12, 14], [13, 3], [17, 11]], F); h.poly([[16, 11], [19, 0], [22, 11]], F); h.poly([[21, 12], [25, 3], [25, 15]], F);
      h.poly([[15, 8], [19, 3], [23, 8], [19, 11]], '#ffd34a');
      b.ellipse(14, 21, 10, 7, B, { edge: true });
      b.ellipse(16, 24.5, 6, 4, C);
      legB.ellipse(9, 28, 3, 2, C, { edge: true }); legA.ellipse(19, 28, 3, 2, C, { edge: true });
      h.ellipse(20, 14, 7, 6, B, { edge: true });
      h.ellipse(24, 16.5, 3.5, 2.5, C);
      rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 3, 1, OUTLINE); h.px(23, 14, '#ff5a2a'); }, 3);
      rigMouth(h, Q, 24, 16, 2, () => h.px(26, 16, OUTLINE));
      return;
    }
    if (v === 'back') {
      t.poly([[6, 20], [2, 18], [6, 23]], F); t.poly([[26, 20], [30, 18], [26, 23]], F);
      b.ellipse(16, 21, 10, 7, B, { edge: true });
      legA.ellipse(10, 28, 3, 2, B, { edge: true }); legB.ellipse(22, 28, 3, 2, B, { edge: true });
      h.ellipse(16, 14, 7, 6, B, { edge: true });
      h.poly([[7, 15], [9, 2], [14, 11]], F); h.poly([[12, 11], [16, 0], [20, 11]], F); h.poly([[18, 11], [23, 2], [25, 15]], F);
      h.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
      t.rect(15, 22, 2, 5, '#1f3054'); t.ellipse(16, 27.5, 1.6, 1.6, '#ff7a1c');
      return;
    }
    h.poly([[7, 15], [9, 2], [14, 11]], F); h.poly([[12, 11], [16, 0], [20, 11]], F); h.poly([[18, 11], [23, 2], [25, 15]], F);
    h.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
    b.ellipse(16, 21, 10, 7, B, { edge: true });
    b.ellipse(16, 24, 7, 5, C);
    h.ellipse(16, 14, 7, 6, B, { edge: true });
    h.ellipse(16, 17, 4, 2.5, C);
    legA.ellipse(10, 28, 3, 2, C, { edge: true }); legB.ellipse(22, 28, 3, 2, C, { edge: true });
    rigEyes(h, Q, 32, 10, 13, 3, () => { h.rectM(10, 13, 3, 1, OUTLINE); h.pxM(12, 14, '#ff5a2a'); });   // narrow eyes
    rigMouth(h, Q, 15, 16, 2, () => h.px(15, 16, OUTLINE).px(16, 16, OUTLINE));
    t.poly([[6, 20], [2, 18], [6, 23]], F); t.poly([[26, 20], [30, 18], [26, 23]], F);          // flank flames
  },
  // Cinderox grown into a magma bull: a blazing mane, curved horns, lava-cracked rock
  // armour on the shoulders and a gold nose ring.
  infernox(g, v = 'front') {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) { b.px(x, y, L); b.px(x + 1, y + 1, Gl); } };
    if (v === 'side') {
      t.poly([[7, 30], [1, 25], [3, 32]], B); t.ellipse(2, 24, 2, 2.4, F);                       // tail, flame tip
      legA.ellipse(12, 39, 3.5, 3, Rk, { edge: true }); legB.ellipse(25, 39, 3.5, 3, Rk, { edge: true });
      h.poly([[7, 26], [9, 11], [14, 22]], F); h.poly([[12, 21], [16, 5], [20, 18]], F); h.poly([[18, 17], [23, 3], [26, 16]], F);
      h.poly([[11, 22], [16, 12], [22, 15], [17, 24]], Gl);
      b.ellipse(19, 30, 14, 8.5, B, { edge: true });                                            // body
      b.ellipse(22, 34, 9, 4, C);
      legB.ellipse(15, 40, 3.5, 3, Rk, { edge: true }); legA.ellipse(29, 40, 3.5, 3, Rk, { edge: true });
      legB.px(14, 42, L); legA.px(29, 42, L);                                                   // glowing hooves
      cracks([[10, 28], [15, 25], [20, 29]]);
      b.ellipse(27, 25, 6, 5, Rk, { edge: true }); cracks([[25, 24], [28, 26]]);                // shoulder armour
      h.poly([[28, 14], [32, 6], [33, 13]], P('#b8a68a', '#8a7a62', '#d8ccb0'));                 // far horn
      h.ellipse(32, 19, 8, 7, B, { edge: true });                                               // head
      h.poly([[30, 15], [38, 5], [41, 7], [35, 16]], H, { edge: true });                        // horn
      h.ellipse(38, 22, 4.5, 3.2, C);                                                           // muzzle
      h.px(41, 21, OUTLINE);
      rigMouth(h, Q, 37, 23, 3);
      h.ellipse(40, 25, 1.6, 1.3, '#ffd23f');                                                   // nose ring
      h.rect(33, 16, 5, 1, OUTLINE);
      rigEye(h, Q, 34, 17, () => { h.rect(34, 17, 3, 2, Gl); h.px(36, 17, '#ffffff'); }, 3);     // glowing eye
      return;
    }
    if (v === 'back') {
      legA.ellipse(13, 39, 4, 3, Rk, { edge: true }); legB.ellipse(31, 39, 4, 3, Rk, { edge: true });
      b.ellipse(22, 30, 13, 9, B, { edge: true });
      cracks([[14, 30], [28, 28], [18, 34], [26, 34]]);
      b.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[8, 24], [35, 25]]);
      h.ellipse(22, 18, 9, 7.5, B, { edge: true });
      h.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });       // horns
      h.poly([[8, 20], [10, 4], [16, 14]], F); h.poly([[14, 13], [18, 1], [22, 11]], F);        // blazing mane
      h.poly([[22, 11], [26, 1], [30, 13]], F); h.poly([[28, 14], [34, 4], [36, 20]], F);
      h.poly([[15, 13], [22, 6], [29, 13], [22, 17]], Gl);
      b.poly([[18, 34], [22, 21], [26, 34]], F); b.poly([[20, 32], [22, 25], [24, 32]], Gl);    // flames down the spine
      t.rect(21, 37, 2, 4, '#16224a'); t.ellipse(22, 41, 1.8, 1.8, F);                          // tail
      return;
    }
    h.poly([[8, 20], [10, 4], [16, 14]], F); h.poly([[14, 13], [18, 1], [22, 11]], F);          // blazing mane
    h.poly([[22, 11], [26, 1], [30, 13]], F); h.poly([[28, 14], [34, 4], [36, 20]], F);
    h.poly([[15, 12], [22, 5], [29, 12], [22, 16]], Gl);
    legA.ellipse(13, 39, 4, 3, Rk, { edge: true }); legB.ellipse(31, 39, 4, 3, Rk, { edge: true });   // hooves
    legA.px(12, 41, L).px(14, 41, L); legB.px(31, 41, L).px(29, 41, L);
    b.ellipse(22, 30, 13, 9, B, { edge: true });                                                // body
    b.ellipse(22, 33, 8, 5.5, C);                                                               // belly
    cracks([[11, 32], [31, 31], [13, 35]]);
    b.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[7, 24], [35, 24], [9, 27]]);          // shoulder armour
    h.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });         // horns
    h.ellipse(22, 18, 10, 8, B, { edge: true });                                                // head
    h.ellipse(22, 23, 7, 3.5, C, { edge: true });                                               // broad muzzle
    h.rect(19, 23, 2, 1, OUTLINE); h.rect(24, 23, 2, 1, OUTLINE);                               // nostrils
    rigMouth(h, Q, 20, 25, 4);
    h.ellipse(22, 27, 2.2, 1.4, '#ffd23f'); h.px(22, 26, '#a87a1a');                            // nose ring
    h.rectM(14, 15, 6, 1, OUTLINE);                                                             // heavy brows
    rigEyes(h, Q, 44, 15, 16, 4, () => { h.rectM(15, 16, 4, 2, Gl); h.rectM(17, 16, 2, 2, '#ffffff'); });   // glowing eyes
  },
});
Object.assign(MONSTER_ART_DIAG, {
  cinderox(g, v) {
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const mane = () => {
      h.poly([[9, 15], [11, 2], [16, 11]], F); h.poly([[14, 11], [18, 0], [22, 11]], F); h.poly([[20, 11], [25, 2], [26, 15]], F);
      h.poly([[13, 8], [18, 3], [23, 8], [18, 11]], '#ffd34a');
    };
    if (v === 'bside') {
      t.poly([[6, 20], [2, 18], [6, 23]], F);                                                    // flank flame
      b.ellipse(15, 21, 10, 7, B, { edge: true });
      legB.ellipse(10, 28, 3, 2, B, { edge: true }); legA.ellipse(20, 28.5, 3, 2, B, { edge: true });
      h.ellipse(18, 14, 7, 6, B, { edge: true });
      h.ellipse(24.5, 16.5, 1.6, 1.4, C);                                                        // muzzle peeking out
      mane();
      t.rect(12, 22, 2, 5, '#1f3054'); t.ellipse(12.5, 27.5, 1.6, 1.6, '#ff7a1c');               // tail
      return;
    }
    mane();
    t.poly([[6, 20], [1, 18], [6, 23]], F);                                                      // flank flame
    b.ellipse(14, 21, 10, 7, B, { edge: true });
    b.ellipse(17, 24, 6.5, 4.5, C);                                                              // belly
    h.ellipse(18, 14, 7, 6, B, { edge: true });
    h.ellipse(20.5, 17, 4, 2.5, C);                                                              // muzzle, turned his way
    legB.ellipse(11, 28, 3, 2, C, { edge: true }); legA.ellipse(20, 28.5, 3, 2, C, { edge: true });
    rigEye(h, Q, 13, 13, () => { h.rect(13, 13, 3, 1, OUTLINE); h.px(15, 14, '#ff5a2a'); }, 3);  // narrow eyes
    rigEye(h, Q, 21, 13, () => { h.rect(21, 13, 2, 1, OUTLINE); h.px(22, 14, '#ff5a2a'); });
    rigMouth(h, Q, 20, 16, 3, () => h.px(20, 16, OUTLINE).px(22, 16, OUTLINE));
  },
  infernox(g, v) {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const { Q, b, h, t, legA, legB } = rigParts(g, v);
    const cracks = pts => { for (const [x, y] of pts) { b.px(x, y, L); b.px(x + 1, y + 1, Gl); } };
    const horns = () => {
      h.poly([[17, 16], [8, 13], [4, 5], [7, 4], [10, 10], [18, 12]], H, { edge: true });
      h.poly([[31, 16], [38, 13], [41, 5], [38, 4], [36, 10], [30, 12]], H, { edge: true });
    };
    const mane = () => {
      h.poly([[10, 20], [12, 4], [18, 14]], F); h.poly([[16, 13], [20, 1], [24, 11]], F);
      h.poly([[24, 11], [28, 1], [32, 13]], F); h.poly([[30, 14], [36, 4], [38, 20]], F);
    };
    if (v === 'bside') {
      legB.ellipse(13, 39, 4, 3, Rk, { edge: true }); legA.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });
      b.ellipse(21, 30, 13, 9, B, { edge: true });
      cracks([[13, 30], [27, 28], [17, 34], [25, 34]]);
      b.ellipse(9, 25, 6, 5, Rk, { edge: true }); b.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); cracks([[8, 24], [34, 25]]);
      h.ellipse(24, 18, 9, 7.5, B, { edge: true });
      h.ellipse(33, 22, 2, 2, C);                                                                // muzzle peeking out
      horns();
      mane(); h.poly([[17, 13], [24, 6], [31, 13], [24, 17]], Gl);                               // blazing mane
      b.poly([[17, 34], [21, 21], [25, 34]], F); b.poly([[19, 32], [21, 25], [23, 32]], Gl);    // flames down the spine
      t.rect(15, 37, 2, 4, '#16224a'); t.ellipse(15, 41, 1.8, 1.8, F);                           // tail
      return;
    }
    mane(); h.poly([[17, 12], [24, 5], [31, 12], [24, 16]], Gl);                                 // blazing mane
    t.poly([[7, 30], [1, 25], [3, 32]], B); t.ellipse(2, 24, 2, 2.4, F);                         // tail, flame tip
    legB.ellipse(13, 39, 4, 3, Rk, { edge: true }); legA.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });   // hooves
    legB.px(12, 41, L); legB.px(14, 41, L); legA.px(30, 41, L);
    b.ellipse(21, 30, 13, 9, B, { edge: true });                                                 // body
    b.ellipse(24, 33, 8, 5.5, C);                                                                // belly
    cracks([[10, 32], [30, 31], [12, 35]]);
    b.ellipse(9, 25, 6, 5, Rk, { edge: true }); b.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); // shoulder armour
    cracks([[7, 24], [34, 24], [9, 27]]);
    horns();
    h.ellipse(24, 18, 10, 8, B, { edge: true });                                                 // head
    h.ellipse(26, 23, 7, 3.5, C, { edge: true });                                                // broad muzzle, turned his way
    h.rect(23, 23, 2, 1, OUTLINE); h.rect(28, 23, 2, 1, OUTLINE);                                // nostrils
    rigMouth(h, Q, 24, 25, 4);
    h.ellipse(26, 27, 2.2, 1.4, '#ffd23f'); h.px(26, 26, '#a87a1a');                             // nose ring
    h.rect(16, 15, 6, 1, OUTLINE); h.rect(27, 15, 5, 1, OUTLINE);                                // heavy brows
    rigEye(h, Q, 17, 16, () => { h.rect(17, 16, 4, 2, Gl); h.rect(19, 16, 2, 2, '#ffffff'); }, 4);   // glowing eyes
    rigEye(h, Q, 28, 16, () => { h.rect(28, 16, 3, 2, Gl); h.rect(28, 16, 2, 2, '#ffffff'); }, 3);
  },
});
Object.assign(RIGGED, { cinderox: 'quad', infernox: 'quad' });
