// Gearhulk: gearhulk. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  gearhulk(g, v = 'front') { // 44x44
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    const rivets = pts => { for (const [x, y] of pts) b.px(x, y, '#3a4054'); };
    if (v === 'side') {
      legB.ellipse(15, 40, 5, 2.5, D, { edge: true }); legA.ellipse(28, 40, 5, 2.5, D, { edge: true });
      armB.ellipse(15, 25, 4.5, 8, D, { edge: true });
      b.poly([[10, 14], [32, 14], [34, 37], [8, 37]], M, { edge: true });
      b.rect(14, 20, 12, 3, '#6e7690'); b.rect(14, 26, 12, 3, '#6e7690');
      rivets([[12, 17], [30, 17], [11, 34], [31, 34]]);
      armA.ellipse(25, 25, 4.5, 8, D, { edge: true });
      armA.ellipse(26, 34, 5, 4, M, { edge: true });
      earA.rect(19, 1, 2, 4, '#6e7690'); earA.ellipse(20, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[13, 5], [29, 5], [30, 15], [12, 15]], M, { edge: true });
      h.rect(23, 8, 7, 4, '#1c2a3a');
      rigEye(h, Q, 27, 9, () => h.rect(27, 9, 2, 2, '#5affff'));
      return;
    }
    if (v === 'back') {
      legA.ellipse(11, 40, 5, 2.5, D, { edge: true }); legB.ellipse(33, 40, 5, 2.5, D, { edge: true });
      armA.ellipse(5, 25, 4.5, 8, D, { edge: true }); armB.ellipse(39, 25, 4.5, 8, D, { edge: true });
      armA.ellipse(5, 34, 5, 4, M, { edge: true }); armB.ellipse(39, 34, 5, 4, M, { edge: true });
      b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      b.rect(15, 18, 14, 14, '#6e7690');
      for (let y = 20; y < 31; y += 3) b.rect(17, y, 10, 1, '#3a4054');
      rivets([[11, 17], [32, 17], [10, 34], [33, 34]]);
      earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      h.rect(17, 9, 10, 2, '#6e7690');
      return;
    }
    legA.ellipse(11, 40, 5, 2.5, D, { edge: true }); legB.ellipse(33, 40, 5, 2.5, D, { edge: true });   // feet
    armA.ellipse(5, 25, 4.5, 8, D, { edge: true }); armB.ellipse(39, 25, 4.5, 8, D, { edge: true });     // arms
    armA.ellipse(5, 34, 5, 4, M, { edge: true }); armB.ellipse(39, 34, 5, 4, M, { edge: true });         // fists
    b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });                          // torso
    b.ellipse(22, 26, 6, 6, G);                                                                 // chest gear
    b.rect(21, 18, 2, 2, G); b.rect(21, 32, 2, 2, G); b.rect(14, 25, 2, 2, G); b.rect(28, 25, 2, 2, G);
    b.ellipse(22, 26, 2.2, 2.2, '#7a5418');
    rivets([[11, 17], [32, 17], [10, 34], [33, 34]]);                                           // rivets
    earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');              // antenna
    h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });                          // head
    h.rect(16, 8, 12, 4, '#1c2a3a');                                                            // visor
    rigEye(h, Q, 18, 9, () => h.rect(18, 9, 2, 2, '#5affff')); rigEye(h, Q, 24, 9, () => h.rect(24, 9, 2, 2, '#5affff'));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  gearhulk(g, v) { // 44x44
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
    const { Q, b, h, earA, legA, legB, armA, armB } = rigParts(g, v);
    const rivets = pts => { for (const [x, y] of pts) b.px(x, y, '#3a4054'); };
    legB.ellipse(13, 40, 5, 2.5, D, { edge: true }); legA.ellipse(29, 40, 4.5, 2.3, D, { edge: true }); // feet
    if (v === 'bside') {
      armB.ellipse(5, 25, 4.5, 8, D, { edge: true }); armA.ellipse(38, 25, 3.5, 7, D, { edge: true });
      armB.ellipse(5, 34, 5, 4, M, { edge: true }); armA.ellipse(38, 34, 4, 3.5, M, { edge: true });
      b.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      b.rect(14, 18, 14, 14, '#6e7690');                                                         // back panel
      for (let y = 20; y < 31; y += 3) b.rect(16, y, 10, 1, '#3a4054');
      b.rect(32, 16, 3, 20, '#6e7690');                                                          // side of the torso
      rivets([[11, 17], [30, 17], [10, 34], [31, 34]]);
      earA.rect(21, 1, 2, 4, '#6e7690'); earA.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      h.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      h.rect(16, 9, 10, 2, '#6e7690');
      h.rect(29, 8, 2, 4, '#1c2a3a');                                                            // edge of the visor
      return;
    }
    armB.ellipse(5, 25, 4.5, 8, D, { edge: true }); armA.ellipse(37, 25, 3.5, 7, D, { edge: true });   // arms
    armB.ellipse(5, 34, 5, 4, M, { edge: true }); armA.ellipse(37, 34, 4, 3.5, M, { edge: true });     // fists
    b.poly([[9, 14], [34, 14], [35, 37], [8, 37]], M, { edge: true });                           // torso
    b.rect(9, 16, 3, 20, '#6e7690');                                                             // its left side, turned to us
    b.ellipse(24, 26, 6, 6, G);                                                                  // chest gear
    b.rect(23, 18, 2, 2, G); b.rect(23, 32, 2, 2, G); b.rect(16, 25, 2, 2, G); b.rect(30, 25, 2, 2, G);
    b.ellipse(24, 26, 2.2, 2.2, '#7a5418');
    rivets([[13, 17], [32, 17], [13, 34], [33, 34]]);                                            // rivets
    earA.rect(23, 1, 2, 4, '#6e7690'); earA.ellipse(24, 1.5, 1.6, 1.6, '#ff4a3a');               // antenna
    h.poly([[15, 5], [31, 5], [32, 15], [14, 15]], M, { edge: true });                           // head
    h.rect(15, 6, 2, 8, '#6e7690');
    h.rect(18, 8, 12, 4, '#1c2a3a');                                                             // visor
    rigEye(h, Q, 20, 9, () => h.rect(20, 9, 2, 2, '#5affff')); rigEye(h, Q, 26, 9, () => h.rect(26, 9, 2, 2, '#5affff'));
  },
});
Object.assign(RIGGED, { gearhulk: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  gearhulk: { fps: 5, every: 10, frames: [{ head: [0, 1] }, { head: [0, -1], body: -1 }, { head: [0, -1] }, { }] },   // vents and resets
});
