// The smugshi family: smugshi, smugshogun. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Toshi, the owner's real-life Shiba Inu (drawn from photos): a soft ginger coat; a big
  // white bib, belly and legs; white cheeks up to his eyes; pale eyebrow spots; upright
  // ears with pale insides; a big black nose; a ring of white ruff round the neck; and his smug half-shut stare.
  // The curled tail is ginger on top with lots of white fluff.
  smugshi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Ei = TOSHI.ear, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig(), side = v === 'side';
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]);
    const hx = side ? R.head[0] : 0, h = part(g, hx, R.head[1]);
    const ear = i => part(g, hx - (side && R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]);   // ears drop (and fold back) when pinned
    const earA = ear(0), earB = ear(1);
    const legA = part(g, side && R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, side && R.legs[1] ? 1 : 0, -R.legs[1]);
    if (side) {
      t.ellipse(8, 15, 4.5, 4.5, O, { edge: true });                                             // curled tail, very fluffy
      t.ellipse(7.5, 14.5, 3.3, 3.3, C); t.px(7, 14, O.l); t.px(8, 15, O.s);
      legA.ellipse(10, 27, 1.8, 3, P(C.s, '#cbbba4', C.b)); legB.ellipse(19, 27, 1.8, 3, P(C.s, '#cbbba4', C.b));   // far legs
      b.ellipse(14, 22, 8.5, 5.5, O, { edge: true });                                            // body
      b.ellipse(14, 25.5, 7, 2, C);                                                              // white belly
      b.ellipse(9, 25, 2.2, 2.6, C);                                                             // white back of the thigh
      b.ellipse(20, 22, 3.5, 4.5, C);                                                            // white chest
      legB.ellipse(11, 27.5, 1.9, 3, C, { edge: true }); legA.ellipse(21, 27.5, 1.9, 3, C, { edge: true });   // white legs
      b.poly([[13, 15], [16, 13.5], [19, 17], [22, 22], [18, 23], [15.5, 18.5]], C);             // white sash from the chest up over the neck
      earB.poly([[14, 8], [13, 1], [17, 5]], O);                                                 // far ear
      h.ellipse(19, 12, 6.5, 5.5, O, { edge: true });                                            // head
      b.px(13, 15, C.b); b.px(13, 16, C.b); b.px(14, 17, C.b);                                   // the ruff showing behind the head
      earA.poly([[17, 7], [19, 0], [22, 6]], O, { edge: true });                                 // near ear
      earA.poly([[18.5, 6], [19.3, 2.5], [21, 5.5]], PINK);
      h.poly([[21, 12], [28, 13.5], [27.5, 16.5], [20, 17.5]], C, { edge: true });               // white muzzle
      h.ellipse(19.5, 15.5, 3, 2, C);                                                            // white cheek
      h.px(21, 9, C.b); h.px(22, 9, C.b);                                                        // eyebrow spot
      rigEye(h, R, 21, 11, () => { h.rect(21, 11, 3, 1, OUTLINE); h.px(22, 12, DARK_EYE); h.px(23, 12, DARK_EYE); }, 3);   // smug half-shut eye
      h.rect(27, 13, 2, 2, OUTLINE);                                                             // nose
      if (R.mouth === 'roar') { h.rect(22, 15, 5, 3, OUTLINE); h.px(23, 17, TONGUE).px(24, 17, TONGUE); }
      else if (R.mouth === 'open') { h.rect(23, 16, 4, 2, OUTLINE); h.px(24, 17, TONGUE); h.px(25, 17, TONGUE); }
      else h.px(24, 17, OUTLINE).px(25, 17, OUTLINE).px(26, 16, OUTLINE);                       // flat little mouth
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(20, 27.5, 2.2, 3, C, { edge: true });   // white hind legs
      b.ellipse(16, 22, 7.5, 6, O, { edge: true });
      b.ellipse(16, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears
      b.ellipse(16, 18.2, 7, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(16, 12, 8, 6.2, O, { edge: true });
      h.ellipseM(9, 15, 1.6, 1.6, C);                                                            // cheek fluff peeking out
      t.ellipse(16, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(16, 18.5, 3, 2.6, C); t.px(16, 18, O.s); t.px(17, 18, O.s);
      return;
    }
    t.ellipse(25.5, 17.5, 4.5, 4.5, O, { edge: true });                                          // curled tail behind him
    t.ellipse(26, 17, 3.2, 3.2, C); t.px(25, 17, O.l); t.px(26, 17, O.s);                        // lots of cream fluff in the curl
    legA.ellipse(12, 27, 2.4, 3.4, C, { edge: true }); legB.ellipse(20, 27, 2.4, 3.4, C, { edge: true });   // white front legs
    legA.px(11, 30, C.s).px(13, 30, C.s); legB.px(20, 30, C.s).px(18, 30, C.s);                  // toes
    b.ellipse(16, 22, 7.5, 6, O, { edge: true });                                                // body
    b.ellipse(16, 23, 5.2, 6, C);                                                                // white chest
    earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears, set wide
    earA.poly([[8.3, 8], [7.8, 2.5], [11.8, 5.8]], PINK); earB.poly([[23.7, 8], [24.2, 2.5], [20.2, 5.8]], PINK);   // pink insides
    earA.px(9, 4, C.b).px(10, 6, C.b); earB.px(22, 4, C.b).px(21, 6, C.b);                       // white fur at the inner edge
    h.ellipse(16, 12, 8.5, 6.5, O, { edge: true });                                              // head
    h.ellipseM(10.5, 14.6, 2.8, 2.6, C);                                                         // white cheeks, up under the eyes
    h.ellipse(16, 15.6, 4.6, 3, C);                                                              // white muzzle
    h.rect(13, 17, 6, 3, C.b); h.rect(12, 18, 8, 2, C.b);                                        // white throat running into the chest (no chin line)
    h.rectM(11, 9, 2, 1, C.b);                                                                   // pale eyebrow spots
    for (const x of [10, 18]) rigEye(h, R, x + (R.eyes ? 1 : 0), 11, () => { h.rect(x, 11, 4, 1, OUTLINE); h.rect(x + 1, 12, 2, 1, DARK_EYE); });   // smug half-shut lids
    h.rect(15, 13, 2, 2, OUTLINE); h.px(15, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'roar') { h.rect(13, 16, 6, 3, OUTLINE); h.px(15, 18, TONGUE).px(16, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(14, 16, 4, 2, OUTLINE); h.px(15, 17, TONGUE).px(16, 17, TONGUE); }
    else { h.px(14, 17, OUTLINE).px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(17, 17, OUTLINE); h.px(18, 16, OUTLINE); }   // flat, unimpressed mouth with a smug corner
  },
  // ---- evolved starters (44px, their own designs) ----
  // Toshi all grown up: the same red Shiba with the cream mask, white socks, eyebrow
  // spots and smug half-shut eyes, now with a ruff, a samurai headband and a red cape.
  smugshogun(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v), side = v === 'side';
    const tails = part(g, (side ? Q.head[0] : 0) + Q.tail[0], Q.head[1] + Q.tail[1]);   // the headband's tails trail behind (the cape swings with the tail, t)
    if (side) {
      t.ellipse(8, 22, 6, 6, O, { edge: true });                                                // curled tail
      t.ellipse(7.5, 21.5, 3, 3, C); t.px(7, 21, O.s);
      t.poly([[15, 22], [27, 22], [24, 40], [3, 38]], R, { edge: true });                       // cape streaming back
      t.rect(4, 37, 20, 1, Gd);
      legB.ellipse(13, 40, 3, 2, C, { edge: true });
      b.ellipse(19, 31, 11, 8, O, { edge: true });                                              // body
      b.ellipse(27, 33, 4.5, 6, C);                                                             // cream chest
      legA.ellipse(26, 40, 3, 2, C, { edge: true });
      b.ellipse(26, 24, 6, 4, C, { edge: true });                                               // neck ruff
      earB.poly([[20, 11], [19, 2], [24, 8]], O);                                               // far ear
      h.ellipse(27, 16, 9.5, 8, O, { edge: true });                                             // head
      earA.poly([[25, 10], [28, 0], [31, 9]], O, { edge: true });                               // near ear
      earA.poly([[27, 8.5], [28, 3], [30, 8]], C.b);
      h.ellipse(35, 20, 5.5, 3.6, C);                                                           // muzzle
      h.ellipse(29, 20, 3, 2, C);
      h.rect(18, 9, 17, 2, Wb.b); h.rect(18, 10, 17, 1, Wb.s);                                   // headband
      tails.poly([[19, 9], [9, 6], [11, 13]], Wb, { edge: true });                               // its tails, flying back
      h.ellipse(32, 10, 1.5, 1.1, '#c8303a');
      h.px(29, 12, C.b); h.px(30, 12, C.b);                                                     // eyebrow spot
      rigEye(h, Q, 29, 14, () => { h.rect(29, 14, 5, 1, OUTLINE); h.rect(30, 15, 3, 1, DARK_EYE); }, 5);   // smug lid
      h.rect(39, 18, 3, 2, OUTLINE);                                                            // nose
      rigMouth(h, Q, 35, 22, 4, () => h.px(35, 23, OUTLINE).px(36, 23, OUTLINE).px(37, 23, OUTLINE).px(38, 22, OUTLINE));   // smirk
      return;
    }
    if (v === 'back') {
      legA.ellipse(15, 40, 3.5, 2.2, C, { edge: true }); legB.ellipse(29, 40, 3.5, 2.2, C, { edge: true });
      b.ellipse(22, 31, 10, 8.5, O, { edge: true });
      t.poly([[12, 23], [32, 23], [36, 40], [8, 40]], R, { edge: true });                       // the cape
      t.rect(9, 39, 26, 1, Gd);
      b.ellipse(12, 23, 3, 2, C); b.ellipse(32, 23, 3, 2, C);                                   // ruff peeking out
      earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
      h.ellipse(22, 15, 11, 8.5, O, { edge: true });
      h.rect(11, 9, 22, 2, Wb.b); h.rect(11, 10, 22, 1, Wb.s);
      h.rect(20, 9, 4, 3, Wb.l);                                                                // headband knot
      tails.poly([[21, 11], [17, 21], [20, 20]], Wb, { edge: true }); tails.poly([[23, 11], [27, 21], [24, 20]], Wb, { edge: true });
      t.ellipse(22, 30, 6, 5.5, O, { edge: true });                                             // the famous curled tail
      t.ellipse(22, 29.5, 3.2, 2.8, C); t.px(22, 29, O.s); t.px(23, 29, O.s);
      return;
    }
    t.ellipse(36, 25, 6.5, 6.5, O, { edge: true });                                             // tail
    t.ellipse(36.5, 24.5, 3.5, 3.5, C); t.px(36, 24, O.s);
    t.poly([[11, 23], [33, 23], [38, 40], [6, 40]], R, { edge: true });                         // cape behind
    t.rect(6, 39, 4, 1, Gd); t.rect(34, 39, 4, 1, Gd);
    legA.ellipse(15, 40, 3.5, 2.2, C, { edge: true }); legB.ellipse(29, 40, 3.5, 2.2, C, { edge: true });   // white socks
    b.ellipse(22, 31, 10, 8.5, O, { edge: true });
    b.ellipse(22, 33, 6, 6.5, C);                                                               // cream chest
    b.ellipse(22, 24, 10, 4, C, { edge: true });                                                // neck ruff
    b.ellipse(22, 24.5, 2, 2, Gd); b.px(22, 24, '#a87a1a');                                     // gold clasp
    earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
    earA.poly([[13.5, 10], [12.5, 4], [17, 8]], C.b); earB.poly([[30.5, 10], [31.5, 4], [27, 8]], C.b);
    h.ellipse(22, 15, 11, 8.5, O, { edge: true });
    h.ellipse(22, 19.5, 7, 4.5, C);                                                             // muzzle
    h.ellipseM(13, 18, 2.2, 1.8, C);
    h.rect(11, 9, 22, 2, Wb.b); h.rect(11, 10, 22, 1, Wb.s);                                     // headband
    h.ellipse(22, 9.5, 1.8, 1.4, '#c8303a');
    tails.poly([[32, 9], [41, 5], [40, 12]], Wb, { edge: true });
    h.pxM(15, 12, C.b); h.pxM(16, 12, C.b);                                                     // eyebrow spots
    rigEyes(h, Q, 44, 14, 14, 5, () => { h.rectM(14, 14, 5, 1, OUTLINE); h.rectM(15, 15, 3, 1, DARK_EYE); });   // smug lids
    h.rect(21, 17, 3, 2, OUTLINE);                                                              // nose
    rigMouth(h, Q, 20, 21, 4, () => h.px(20, 22, OUTLINE).px(21, 22, OUTLINE).px(22, 22, OUTLINE).px(23, 21, OUTLINE));   // smirk
  },
});
Object.assign(MONSTER_ART_DIAG, {
  smugshi(g, v) {
    const O = TOSHI.coat, C = TOSHI.white, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig();
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]), h = part(g, R.head[0], R.head[1]);
    const ear = i => part(g, R.head[0] - (R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]), earA = ear(0), earB = ear(1);
    const legA = part(g, R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, R.legs[1] ? 1 : 0, -R.legs[1]);
    if (v === 'bside') {
      legA.ellipse(11, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(19, 28, 2, 2.8, C, { edge: true });   // white hind legs
      b.ellipse(15, 22, 7.5, 6, O, { edge: true });
      b.ellipse(13, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[10, 9], [10, 0], [16, 5]], O, { edge: true });                                 // big upright ears
      earB.poly([[19, 6], [23, 0], [25, 7]], O, { edge: true });
      b.ellipse(17, 18, 6.5, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(18, 11.5, 8, 6.2, O, { edge: true });
      h.ellipse(24.5, 14, 1.8, 1.8, C); h.ellipse(25.5, 12.5, 1.4, 1.4, C);                      // cheek and muzzle peeking out
      t.ellipse(13, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(13, 18.5, 3, 2.6, C); t.px(13, 18, O.s); t.px(14, 18, O.s);
      return;
    }
    t.ellipse(8, 17, 4.5, 4.5, O, { edge: true });                                               // curled tail behind him
    t.ellipse(7.5, 16.5, 3.2, 3.2, C); t.px(7, 16, O.l); t.px(8, 17, O.s);
    legB.ellipse(9, 26.5, 1.8, 2.8, P(C.s, '#cbbba4', C.b));                                     // hind leg
    b.ellipse(14, 22, 8, 6, O, { edge: true });                                                  // body
    b.ellipse(18.5, 23, 4.5, 5.5, C);                                                            // white chest
    legB.ellipse(15, 27.5, 2.2, 3.2, C, { edge: true }); legA.ellipse(21, 27.5, 2.2, 3.2, C, { edge: true });   // white front legs
    legB.px(14, 30, C.s); legA.px(20, 30, C.s);
    earA.poly([[9, 10], [9, 0], [15, 5]], O, { edge: true });                                    // near ear
    earA.poly([[10.3, 8], [10.3, 2.5], [13.5, 5.3]], PINK); earA.px(11, 4, C.b);
    earB.poly([[20, 7], [24, 0], [26, 7]], O, { edge: true });                                   // far ear
    earB.poly([[21.5, 6], [23.6, 2.5], [24.6, 6]], PINK);
    h.ellipse(17.5, 12, 8, 6.5, O, { edge: true });                                              // head
    h.ellipse(12.5, 14.8, 2.6, 2.4, C); h.ellipse(23, 14.5, 1.6, 2, C);                          // white cheeks
    h.ellipse(20, 15.6, 4.4, 3, C);                                                              // white muzzle, turned his way
    h.rect(16, 17, 7, 3, C.b); h.rect(15, 18, 8, 2, C.b);                                        // white throat into the chest
    h.rect(13, 9, 2, 1, C.b); h.rect(21, 9, 2, 1, C.b);                                          // pale eyebrow spots
    rigEye(h, R, 13, 11, () => { h.rect(12, 11, 4, 1, OUTLINE); h.rect(13, 12, 2, 1, DARK_EYE); });   // smug lids
    rigEye(h, R, 21, 11, () => { h.rect(20, 11, 3, 1, OUTLINE); h.rect(21, 12, 2, 1, DARK_EYE); });
    h.rect(21, 13, 2, 2, OUTLINE); h.px(21, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'roar') { h.rect(18, 16, 6, 3, OUTLINE); h.px(20, 18, TONGUE).px(21, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(19, 16, 4, 2, OUTLINE); h.px(20, 17, TONGUE).px(21, 17, TONGUE); }
    else h.px(19, 17, OUTLINE).px(20, 17, OUTLINE).px(21, 17, OUTLINE).px(22, 17, OUTLINE).px(23, 16, OUTLINE);   // flat mouth, smug corner
  },
  smugshogun(g, v) {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    if (v === 'bside') {
      legB.ellipse(16, 40, 3.5, 2.2, C, { edge: true }); legA.ellipse(28, 40, 3, 2, C, { edge: true });
      b.ellipse(21, 31, 10, 8.5, O, { edge: true });
      t.poly([[11, 23], [31, 23], [35, 40], [7, 40]], R, { edge: true });                       // the cape
      t.rect(8, 39, 26, 1, Gd);
      b.ellipse(12, 23, 3, 2, C); b.ellipse(32, 23.5, 2, 1.6, C);                                // ruff peeking out
      earB.poly([[13, 12], [12, 1], [20, 8]], O, { edge: true }); earA.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true });
      h.ellipse(23, 15, 11, 8.5, O, { edge: true });
      h.ellipse(33.5, 18.5, 1.8, 2, C);                                                          // muzzle peeking out
      h.rect(12, 9, 22, 2, Wb.b); h.rect(12, 10, 22, 1, Wb.s);
      h.rect(17, 9, 4, 3, Wb.l);                                                                 // headband knot
      tails.poly([[18, 11], [14, 21], [17, 20]], Wb, { edge: true }); tails.poly([[20, 11], [24, 21], [21, 20]], Wb, { edge: true });
      t.ellipse(20, 30, 6, 5.5, O, { edge: true });                                              // curled tail
      t.ellipse(20, 29.5, 3.2, 2.8, C); t.px(20, 29, O.s); t.px(21, 29, O.s);
      return;
    }
    t.ellipse(8, 25, 6.5, 6.5, O, { edge: true });                                               // tail
    t.ellipse(7.5, 24.5, 3.5, 3.5, C); t.px(8, 24, O.s);
    t.poly([[9, 23], [31, 23], [34, 40], [4, 40]], R, { edge: true });                           // cape behind
    t.rect(4, 39, 4, 1, Gd); t.rect(30, 39, 4, 1, Gd);
    legB.ellipse(17, 40, 3.5, 2.2, C, { edge: true }); legA.ellipse(29, 40, 3, 2, C, { edge: true });  // white socks
    b.ellipse(21, 31, 10, 8.5, O, { edge: true });
    b.ellipse(24, 33, 6, 6.5, C);                                                                // cream chest
    b.ellipse(23, 24, 9.5, 4, C, { edge: true });                                                // neck ruff
    b.ellipse(25, 24.5, 2, 2, Gd); b.px(25, 24, '#a87a1a');                                      // gold clasp
    earB.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[13.5, 10], [12.5, 4], [17, 8]], C.b);
    earA.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true }); earA.poly([[28.5, 8.5], [31.5, 3.5], [32.5, 9]], C.b);
    h.ellipse(23, 15, 11, 8.5, O, { edge: true });
    h.ellipse(26, 19.5, 7, 4.5, C);                                                              // muzzle, turned his way
    h.ellipse(15, 18, 2.2, 1.8, C); h.ellipse(32.5, 18, 1.5, 1.5, C);
    h.rect(12, 9, 22, 2, Wb.b); h.rect(12, 10, 22, 1, Wb.s);                                     // headband
    h.ellipse(26, 9.5, 1.8, 1.4, '#c8303a');
    tails.poly([[13, 9], [3, 6], [5, 13]], Wb, { edge: true });                                  // its tails, flying back
    h.px(17, 12, C.b); h.px(18, 12, C.b); h.px(28, 12, C.b); h.px(29, 12, C.b);                  // eyebrow spots
    rigEye(h, Q, 16, 14, () => { h.rect(16, 14, 5, 1, OUTLINE); h.rect(17, 15, 3, 1, DARK_EYE); }, 5);   // smug lids
    rigEye(h, Q, 27, 14, () => { h.rect(27, 14, 4, 1, OUTLINE); h.rect(28, 15, 2, 1, DARK_EYE); }, 4);
    h.rect(26, 17, 3, 2, OUTLINE);                                                               // nose
    rigMouth(h, Q, 25, 21, 4, () => h.px(25, 22, OUTLINE).px(26, 22, OUTLINE).px(27, 22, OUTLINE).px(28, 21, OUTLINE));   // smirk
  },
});
Object.assign(RIGGED, { smugshi: 'quad', smugshogun: 'quad' });
// Smugshi's fidget (r110): a big lazy yawn, then a smug glance away, every 9 seconds or so.
Object.assign(FIDGETS, { smugshi: { fps: 5, every: 9, frames: [
  { head: [0, -1], eyes: 'blink' },
  { head: [0, -2], eyes: 'sleep', mouth: 'roar', ears: [1, 1] },
  { head: [0, -2], eyes: 'sleep', mouth: 'roar', ears: [1, 1] },
  { head: [0, -1], eyes: 'blink', mouth: 'open' },
  { head: [-1, 0], tail: [1, 0] },
  { head: [-1, 0], tail: [-1, 0] },
  {},
] } });
