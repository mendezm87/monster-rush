// Samurai Smugshogun samples (r114; not loaded by the game). To see them, open the game, then in the
// console: (0, eval)(await (await fetch('docs/samples/samurai-smugshogun.js')).text()) adds them as
// 'shogunA' and 'shogunB' (start a run, App.run.recruit('shogunB'), or App.run.party[0].setDef(ROSTER_BY_ID.shogunA)).
// Front, side and back only (no diagonals yet); the pick becomes Smugshogun in js/monsters/smugshi.js.
// A: from the owner's photo, Toshi on four legs in red lacquered plate armour.
// B: from the owner's painting, a chubby Toshi standing up in red and navy samurai armour, red headband, katana.
(function () {
  const RED = P('#c42a36', '#861824', '#ee6064'), NAVY = P('#2c3c70', '#1b264c', '#4a60a0');
  const GOLD = '#ecc452', GOLDS = '#a87e2a', CORD = '#1b264c', PINK = '#e8b4a4';
  const HILT = P('#3f8a7a', '#22564c', '#6ab8a4'), BELT = P('#e6d8b4', '#bca880', '#f6ecd0');
  const studs = (p, x0, x1, y, step = 4) => { for (let x = x0; x <= x1; x += step) p.px(x, y, GOLD); };
  const lace = (p, x0, x1, y, step = 2) => { for (let x = x0; x <= x1; x += step) p.px(x, y, CORD); };

  MONSTER_ART.shogunA = function (g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Cd = P(C.s, '#b8a68c', C.b);
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.ellipse(9, 20, 5.5, 5.5, O, { edge: true });                        // curled tail, up over the back
      t.ellipse(8.5, 19.5, 3.3, 3.3, C); t.px(8, 19, O.s); t.px(9, 20, O.s);
      legB.ellipse(15, 37.5, 2, 4.8, Cd); legB.ellipse(29, 37.5, 2, 4.8, Cd);   // far legs
      b.ellipse(21, 29, 11, 6.5, O, { edge: true });                        // body
      b.ellipse(22, 33.6, 8, 2, C);                                         // white belly
      b.ellipse(31, 28.5, 3.6, 5, C);                                       // white chest
      legA.ellipse(13, 36, 3, 5, O, { edge: true }); legA.ellipse(13.5, 40, 2.3, 2.6, C, { edge: true });   // hind leg, white sock
      legA.ellipse(30, 37.5, 2.4, 5.5, C, { edge: true });                  // front leg
      // the lacquered plates over his back, row on row, laced with navy cord and studded with gold
      b.poly([[11, 22], [29, 21], [30, 25], [10, 26]], RED, { edge: true });
      b.poly([[10, 25], [30, 24], [31, 28.5], [10, 29]], RED, { edge: true });
      b.poly([[10, 28], [31, 27.5], [31, 32], [10, 32]], RED, { edge: true });
      b.poly([[11, 31], [30, 31], [29, 35.5], [12, 35.5]], RED, { edge: true });
      b.rect(17, 32, 1, 3, RED.s); b.rect(23, 32, 1, 3, RED.s);             // the skirt hangs in panels
      studs(b, 13, 27, 22); lace(b, 12, 28, 25); lace(b, 12, 29, 28); lace(b, 12, 29, 31);
      // shoulder guard over the near shoulder, gold-rimmed
      b.poly([[25, 21], [32, 21.5], [33, 25.5], [25, 25.5]], RED, { edge: true });
      b.poly([[25, 25], [33, 25], [33, 29], [25, 29]], RED, { edge: true });
      b.poly([[25, 28.5], [33, 28.5], [32, 32.5], [26, 32.5]], RED, { edge: true });
      b.rect(26, 21, 6, 1, GOLD); lace(b, 26, 32, 25); lace(b, 26, 32, 28); b.px(29, 31, GOLD);
      b.poly([[32, 23], [36, 25], [36, 30], [33, 31]], RED, { edge: true });   // breastplate
      b.px(34, 26, GOLD); b.px(34, 29, GOLD);
      earB.poly([[24, 10], [22, 1], [28, 6]], P(O.s, TOSHI.line, O.b));    // far ear, in shadow
      h.ellipse(30, 14, 9, 7.5, O, { edge: true });                         // head
      earA.poly([[28, 8], [31, 0], [34, 7]], O, { edge: true });            // near ear
      earA.poly([[30, 6.5], [31, 2.5], [32.8, 6]], PINK); earA.px(30, 6, C.b);
      h.ellipse(37.5, 18, 5.6, 3.5, C); h.ellipse(32, 18.5, 3, 2.2, C); h.ellipse(32, 21, 3, 1.6, C);   // muzzle, cheek, throat
      h.px(33, 9, C.b); h.px(34, 9, C.b);                                   // eyebrow spot
      rigEye(h, Q, 32, 11, () => { h.rect(32, 11, 5, 1, OUTLINE); h.rect(33, 12, 3, 1, DARK_EYE); }, 5);   // smug lid
      h.rect(41, 16, 2, 2, OUTLINE); h.px(41, 16, '#5a5060');               // nose
      rigMouth(h, Q, 37, 20, 4, () => { h.rect(37, 20, 4, 1, OUTLINE); h.px(36, 19, OUTLINE); });   // smirk
      return;
    }
    if (v === 'back') {
      legA.ellipse(16, 39, 2.8, 4, C, { edge: true }); legB.ellipse(28, 39, 2.8, 4, C, { edge: true });
      b.ellipse(22, 29, 10, 7.5, O, { edge: true });
      earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
      h.ellipse(22, 14, 10, 8, O, { edge: true });
      h.ellipseM(12.5, 18, 1.8, 1.8, C);                                    // cheek fluff peeking out
      b.poly([[13, 21], [31, 21], [32, 25], [12, 25]], RED, { edge: true });
      b.poly([[12, 24], [32, 24], [32, 28], [12, 28]], RED, { edge: true });
      b.poly([[12, 27], [32, 27], [32, 31], [12, 31]], RED, { edge: true });
      b.poly([[12, 30], [32, 30], [31, 35], [13, 35]], RED, { edge: true });
      b.rect(17, 31, 1, 4, RED.s); b.rect(26, 31, 1, 4, RED.s);
      studs(b, 14, 30, 22); lace(b, 13, 31, 24); lace(b, 13, 31, 27); lace(b, 13, 31, 30);
      t.ellipse(22, 23, 5.5, 5, O, { edge: true });                         // the famous curled tail, over the armour
      t.ellipse(22, 22.5, 3.2, 2.8, C); t.px(22, 22, O.s); t.px(23, 22, O.s);
      return;
    }
    t.ellipse(34, 22, 5.5, 5.5, O, { edge: true });                         // tail behind him
    t.ellipse(34.5, 21.5, 3.3, 3.3, C); t.px(34, 21, O.s);
    legA.ellipse(16, 38, 2.6, 5, C, { edge: true }); legB.ellipse(28, 38, 2.6, 5, C, { edge: true });   // white front legs
    legA.px(15, 42, C.s).px(17, 42, C.s); legB.px(27, 42, C.s).px(29, 42, C.s);
    b.ellipse(22, 29, 9.5, 7, O, { edge: true });                           // body
    b.ellipse(22, 29, 5.5, 6, C);                                           // white chest
    // shoulder guards on both sides, a breastplate laced across his chest
    for (const s of [1, -1]) {
      const X = x => (s > 0 ? x : 44 - x);
      b.poly([[X(10), 22], [X(16), 22.5], [X(16.5), 26], [X(10), 26]], RED, { edge: true });
      b.poly([[X(10), 25.5], [X(16.5), 25.5], [X(16.5), 29.5], [X(10), 29.5]], RED, { edge: true });
      b.poly([[X(10.5), 29], [X(16.5), 29], [X(16), 33], [X(11.5), 33]], RED, { edge: true });
    }
    b.rectM(11, 22, 5, 1, GOLD);
    b.poly([[17, 25], [27, 25], [26.5, 28], [17.5, 28]], RED, { edge: true });
    b.poly([[17.5, 27.5], [26.5, 27.5], [26, 30.5], [18, 30.5]], RED, { edge: true });
    b.poly([[18, 30], [26, 30], [25.5, 33], [18.5, 33]], RED, { edge: true });
    b.rect(17, 25, 10, 1, GOLD); b.rect(18, 26, 8, 1, RED.l);
    earA.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); earB.poly([[32, 12], [33, 1], [25, 8]], O, { edge: true });
    earA.poly([[13.5, 10], [12.5, 4], [17, 8]], PINK); earB.poly([[30.5, 10], [31.5, 4], [27, 8]], PINK);
    earA.px(14, 9, C.b).px(15, 9, C.b); earB.px(29, 9, C.b).px(28, 9, C.b);
    h.ellipse(22, 15, 10, 8, O, { edge: true });                            // head
    h.ellipse(22, 19.5, 6.5, 4, C); h.ellipseM(14, 18, 2.4, 2.2, C);       // muzzle, cheeks
    h.rect(18, 22, 8, 2, C.b);                                              // white throat
    h.pxM(15, 12, C.b); h.pxM(16, 12, C.b);                                 // eyebrow spots
    rigEyes(h, Q, 44, 14, 14, 5, () => { h.rectM(14, 14, 5, 1, OUTLINE); h.rectM(15, 15, 3, 1, DARK_EYE); });   // smug lids
    h.rect(20, 17, 4, 1, OUTLINE); h.rect(21, 18, 2, 1, OUTLINE); h.px(21, 17, '#5a5060');   // nose
    rigMouth(h, Q, 20, 21, 4, () => { h.rect(20, 21, 4, 1, OUTLINE); h.px(24, 20, OUTLINE); h.rect(20, 22, 4, 1, C.s); });
  };

  MONSTER_ART.shogunB = function (g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.ellipse(10, 25, 5, 5.5, O, { edge: true });                         // big fluffy tail
      t.ellipse(9.5, 24.5, 3, 3.3, C); t.px(9, 24, O.s);
      t.poly([[25, 29], [26.5, 31], [6, 38], [5, 36]], NAVY, { edge: true });   // scabbard, slung back from his hip
      t.px(6, 37, GOLD);
      legB.poly([[15, 32], [22, 32], [22, 39], [15, 39]], P(NAVY.s, '#121a36', NAVY.b), { edge: true });   // far leg, wide trousers
      legB.ellipse(19, 42, 3, 1.6, P(C.s, '#b8a68c', C.b), { edge: true });
      armB.ellipse(17, 23, 3.5, 4, P(NAVY.s, '#121a36', NAVY.b), { edge: true });   // far shoulder guard
      b.ellipse(21, 27, 10, 8.5, RED, { edge: true });                      // round belly in a lacquered breastplate
      b.poly([[12, 25], [31, 25], [31, 29], [12, 29]], RED, { edge: true });
      lace(b, 13, 30, 24); lace(b, 13, 30, 28); studs(b, 15, 27, 22);
      b.poly([[24, 19], [30, 21], [28, 24], [23, 23]], C);                  // white bib at the neck
      b.rect(11, 31, 21, 2, BELT.b); b.rect(11, 32, 21, 1, BELT.s);         // rope belt
      b.ellipse(28, 33, 1.6, 1.4, BELT, { edge: true }); b.rect(27, 34, 2, 3, BELT.s);   // its knot and tassel
      legA.poly([[17, 33], [26, 33], [27, 39], [18, 39]], NAVY, { edge: true });   // near leg
      legA.poly([[19, 38], [26, 38], [25, 42], [20, 42]], RED, { edge: true });    // red shin guard
      legA.ellipse(24, 42.4, 3.4, 1.5, C, { edge: true }); legA.rect(22, 42, 3, 1, '#8a5a3a');   // white paw in a sandal
      b.poly([[26, 30], [36, 26.5], [36.5, 28], [27, 31.5]], HILT, { edge: true });   // the katana's hilt, forward at the hip
      b.px(29, 30, '#22564c').px(31, 29, '#22564c').px(33, 28, '#22564c');
      b.ellipse(26, 31, 1.4, 2, GOLD, { edge: true });                      // guard
      armA.ellipse(22, 22.5, 4, 4.5, NAVY, { edge: true });                 // near shoulder guard
      armA.rect(19, 23, 7, 1, RED.b); armA.rect(19, 25, 7, 1, RED.b);
      armA.ellipse(27, 28.5, 2.6, 2.2, C, { edge: true });                  // paw resting on the hilt
      earB.poly([[23, 7], [22, -1], [27, 4]], P(O.s, TOSHI.line, O.b));
      h.ellipse(28, 12, 9.5, 8, O, { edge: true });                         // big round head
      earA.poly([[26, 6], [29, -1], [32, 5]], O, { edge: true }); earA.poly([[28, 5], [29, 1.5], [30.8, 4.5]], PINK);
      h.ellipse(35, 16, 5.4, 3.6, C); h.ellipse(29.5, 16.5, 3.4, 2.6, C); h.ellipse(31, 19.5, 4, 2, C);   // muzzle, cheek, chin
      h.rect(19, 6, 16, 2, RED.b); h.rect(19, 7, 16, 1, RED.s);             // red headband
      h.poly([[20, 6], [12, 4], [13, 9]], RED, { edge: true }); h.poly([[20, 7], [13, 11], [16, 12]], RED, { edge: true });   // its tails behind
      h.px(31, 9, C.b); h.px(32, 9, C.b);
      rigEye(h, Q, 30, 10, () => { h.rect(30, 10, 5, 1, OUTLINE); h.rect(31, 11, 3, 1, DARK_EYE); }, 5);
      h.rect(39, 14, 2, 2, OUTLINE); h.px(39, 14, '#5a5060');
      rigMouth(h, Q, 34, 18, 4, () => { h.rect(34, 18, 4, 1, OUTLINE); h.px(33, 17, OUTLINE); });
      return;
    }
    if (v === 'back') {
      legA.poly([[12, 32], [21, 32], [21, 39], [11, 39]], NAVY, { edge: true }); legB.poly([[23, 32], [32, 32], [33, 39], [23, 39]], NAVY, { edge: true });
      legA.poly([[13, 38], [20, 38], [20, 42], [14, 42]], RED, { edge: true }); legB.poly([[24, 38], [31, 38], [30, 42], [24, 42]], RED, { edge: true });
      b.ellipse(22, 27, 10.5, 8.5, RED, { edge: true });
      b.poly([[12, 24], [32, 24], [32, 28], [12, 28]], RED, { edge: true });
      lace(b, 13, 31, 23); lace(b, 13, 31, 27); studs(b, 14, 30, 21);
      b.rect(12, 31, 20, 2, BELT.b); b.rect(12, 32, 20, 1, BELT.s);
      b.poly([[7, 25], [9, 24], [14, 30], [12, 31]], HILT, { edge: true });   // hilt peeking out at his side
      armA.ellipse(11, 23, 4, 4.5, NAVY, { edge: true }); armB.ellipse(33, 23, 4, 4.5, NAVY, { edge: true });
      armA.rect(8, 23, 7, 1, RED.b); armB.rect(30, 23, 7, 1, RED.b); armA.rect(8, 25, 7, 1, RED.b); armB.rect(30, 25, 7, 1, RED.b);
      earA.poly([[12, 10], [11, -1], [19, 6]], O, { edge: true }); earB.poly([[32, 10], [33, -1], [25, 6]], O, { edge: true });
      h.ellipse(22, 13, 10.5, 8.5, O, { edge: true });
      h.ellipseM(12, 17, 1.8, 1.8, C);
      h.rect(11, 7, 22, 2, RED.b); h.rect(11, 8, 22, 1, RED.s);
      h.ellipse(22, 8, 2.2, 1.8, RED, { edge: true });                      // the knot
      h.poly([[21, 9], [17, 19], [20, 18]], RED, { edge: true }); h.poly([[23, 9], [27, 19], [24, 18]], RED, { edge: true });   // tails hanging down
      t.ellipse(22, 31, 5, 5, O, { edge: true });                           // the famous curled tail
      t.ellipse(22, 30.5, 3, 2.8, C); t.px(22, 30, O.s); t.px(23, 30, O.s);
      return;
    }
    t.ellipse(34, 27, 5, 5.5, O, { edge: true });                           // fluffy tail out to the side
    t.ellipse(34.5, 26.5, 3, 3.3, C); t.px(34, 26, O.s);
    t.poly([[11, 32], [13, 33], [6, 42], [4, 41]], NAVY, { edge: true });   // scabbard trailing behind his left leg
    legA.poly([[12, 32], [21, 32], [21, 39], [11, 39]], NAVY, { edge: true }); legB.poly([[23, 32], [32, 32], [33, 39], [23, 39]], NAVY, { edge: true });   // wide trousers
    legA.poly([[13, 37], [20, 37], [20, 41], [14, 41]], RED, { edge: true }); legB.poly([[24, 37], [31, 37], [30, 41], [24, 41]], RED, { edge: true });   // shin guards
    legA.ellipse(17, 42.4, 3.4, 1.5, C, { edge: true }); legB.ellipse(27, 42.4, 3.4, 1.5, C, { edge: true });   // paws in sandals
    legA.rect(16, 42, 2, 1, '#8a5a3a'); legB.rect(26, 42, 2, 1, '#8a5a3a');
    b.ellipse(22, 27, 10.5, 8.5, RED, { edge: true });                      // round belly in a lacquered breastplate
    b.poly([[12, 26], [32, 26], [32, 30], [12, 30]], RED, { edge: true });
    lace(b, 13, 31, 25); lace(b, 13, 31, 29);
    b.poly([[17, 19], [27, 19], [22, 25]], C);                              // white bib at the neck
    b.rect(18, 20, 8, 1, CORD); studs(b, 15, 29, 22, 7);
    b.rect(12, 31, 20, 2, BELT.b); b.rect(12, 32, 20, 1, BELT.s);           // rope belt
    b.ellipse(16, 32, 1.8, 1.5, BELT, { edge: true }); b.rect(15, 33, 2, 3, BELT.s);   // knot and tassel
    b.poly([[8, 25], [10, 24], [15.5, 30.5], [13.5, 31.5]], HILT, { edge: true });   // the katana's hilt at his left hip
    b.px(10, 26, '#22564c').px(12, 28, '#22564c');
    b.ellipse(14.5, 31, 2, 1.5, GOLD, { edge: true });                      // guard
    armA.ellipse(11, 22, 4, 4.5, NAVY, { edge: true }); armB.ellipse(33, 22, 4, 4.5, NAVY, { edge: true });   // shoulder guards
    armA.rect(8, 22, 7, 1, RED.b); armB.rect(30, 22, 7, 1, RED.b); armA.rect(8, 24, 7, 1, RED.b); armB.rect(30, 24, 7, 1, RED.b);
    armA.ellipse(13, 29, 2.6, 2.2, C, { edge: true });                      // paw on the hilt
    armB.ellipse(31, 29, 2.6, 2.2, C, { edge: true });                      // other paw on his belly
    earA.poly([[12, 10], [11, -1], [19, 6]], O, { edge: true }); earB.poly([[32, 10], [33, -1], [25, 6]], O, { edge: true });
    earA.poly([[13.5, 8.5], [12.5, 2], [17, 6]], PINK); earB.poly([[30.5, 8.5], [31.5, 2], [27, 6]], PINK);
    h.ellipse(22, 13, 11, 8.5, O, { edge: true });                          // big round head
    h.ellipse(22, 17, 8, 4.8, C); h.ellipseM(13, 15.5, 2.6, 2.4, C);       // big cream mask, cheeks
    h.rect(11, 6, 22, 2, RED.b); h.rect(11, 7, 22, 1, RED.s);               // red headband
    h.ellipse(22, 6, 2.2, 1.8, RED, { edge: true }); h.rect(21, 8, 2, 3, RED.b);   // its knot, a strap down the brow
    h.pxM(15, 10, C.b); h.pxM(16, 10, C.b);
    rigEyes(h, Q, 44, 14, 12, 5, () => { h.rectM(14, 12, 5, 1, OUTLINE); h.rectM(15, 13, 3, 1, DARK_EYE); });
    h.rect(20, 15, 4, 1, OUTLINE); h.rect(21, 16, 2, 1, OUTLINE); h.px(21, 15, '#5a5060');
    rigMouth(h, Q, 19, 18, 6, () => { h.px(19, 18, OUTLINE); h.rect(20, 19, 2, 1, OUTLINE); h.rect(22, 19, 2, 1, OUTLINE); h.px(24, 18, OUTLINE); h.px(21, 17, OUTLINE); h.px(22, 17, OUTLINE); });   // smug little "w" smile
  };
  // B2 (the owner: "can I see the B one more chubby like the painting?"): a body nearly as wide as
  // the picture, a bigger round head with puffy cheeks sticking out, short stubby legs.
  MONSTER_ART.shogunC = function (g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Nd = P(NAVY.s, '#121a36', NAVY.b), SANDAL = '#8a5a3a';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.ellipse(7.5, 26, 5, 5.5, O, { edge: true });                        // big fluffy tail
      t.ellipse(7, 25.5, 3, 3.3, C); t.px(7, 25, O.s);
      t.poly([[24, 31], [25.5, 33], [5, 39.5], [4, 37.5]], NAVY, { edge: true });   // scabbard, slung back from his hip
      t.px(5, 38, GOLD);
      legB.poly([[15, 35], [23, 35], [23, 40], [15, 40]], Nd, { edge: true });
      legB.ellipse(19.5, 42.2, 3, 1.4, P(C.s, '#b8a68c', C.b), { edge: true });
      armB.ellipse(15.5, 23, 3.8, 4.2, Nd, { edge: true });                 // far shoulder guard
      b.ellipse(21, 28, 12.5, 9.8, RED, { edge: true });                    // a big round belly in a lacquered breastplate
      b.poly([[9, 25], [33, 25], [33, 29], [9, 29]], RED, { edge: true });
      lace(b, 10, 32, 24); lace(b, 10, 32, 28); studs(b, 12, 30, 21, 6);
      b.poly([[25, 19], [31, 21], [29, 24], [24, 23]], C);                  // white bib at the neck
      b.rect(9, 33, 25, 2, BELT.b); b.rect(9, 34, 25, 1, BELT.s);           // rope belt
      b.ellipse(30, 34, 1.6, 1.4, BELT, { edge: true }); b.rect(29, 35, 2, 3, BELT.s);   // knot and tassel
      legA.poly([[18, 35], [27, 35], [28, 40], [19, 40]], NAVY, { edge: true });   // short legs in wide trousers
      legA.poly([[20, 38.5], [27, 38.5], [26, 41.5], [21, 41.5]], RED, { edge: true });
      legA.ellipse(25, 42.3, 3.6, 1.5, C, { edge: true }); legA.rect(23, 42, 3, 1, SANDAL);
      b.poly([[27, 32], [37, 28.5], [37.5, 30], [28, 33.5]], HILT, { edge: true });   // the katana's hilt, forward at the hip
      b.px(30, 31, '#22564c').px(33, 30, '#22564c').px(35, 29, '#22564c');
      b.ellipse(27, 33, 1.4, 2, GOLD, { edge: true });
      armA.ellipse(22, 22.5, 4.5, 5, NAVY, { edge: true });                 // near shoulder guard
      armA.rect(18, 23, 8, 1, RED.b); armA.rect(18, 25, 8, 1, RED.b);
      armA.ellipse(28, 30, 2.8, 2.4, C, { edge: true });                    // chubby paw on the hilt
      earB.poly([[22, 6], [21, -1], [26, 3]], P(O.s, TOSHI.line, O.b));
      h.ellipse(28, 12, 10.5, 9, O, { edge: true });                        // big round head
      earA.poly([[25, 5], [28, -1], [31, 4]], O, { edge: true }); earA.poly([[27, 4], [28, 0.5], [29.8, 3.5]], PINK);
      h.ellipse(36, 16, 5.4, 3.6, C); h.ellipse(29.5, 16.5, 4.2, 3.4, C); h.ellipse(31, 19.6, 5.2, 2.3, C);   // muzzle, puffy cheek, chin
      h.rect(18, 5, 17, 2, RED.b); h.rect(18, 6, 17, 1, RED.s);             // red headband
      h.poly([[19, 5], [11, 3], [12, 8]], RED, { edge: true }); h.poly([[19, 6], [12, 10], [15, 11]], RED, { edge: true });
      h.px(31, 8, C.b); h.px(32, 8, C.b);
      rigEye(h, Q, 30, 9, () => { h.rect(30, 9, 5, 1, OUTLINE); h.rect(31, 10, 3, 1, DARK_EYE); }, 5);
      h.rect(40, 14, 2, 2, OUTLINE); h.px(40, 14, '#5a5060');
      rigMouth(h, Q, 35, 18, 4, () => { h.rect(35, 18, 4, 1, OUTLINE); h.px(34, 17, OUTLINE); });
      return;
    }
    const legs = () => {
      legA.poly([[11, 34], [21, 34], [21, 40], [10, 40]], NAVY, { edge: true }); legB.poly([[23, 34], [33, 34], [34, 40], [23, 40]], NAVY, { edge: true });
      legA.poly([[12, 38.5], [20, 38.5], [20, 41.5], [13, 41.5]], RED, { edge: true }); legB.poly([[24, 38.5], [32, 38.5], [31, 41.5], [24, 41.5]], RED, { edge: true });
    };
    const belly = () => {
      b.ellipse(22, 27.5, 13, 9.8, RED, { edge: true });
      b.poly([[9.5, 25], [34.5, 25], [34.5, 29], [9.5, 29]], RED, { edge: true });
      lace(b, 10, 34, 24); lace(b, 10, 34, 28);
      b.rect(9, 33, 26, 2, BELT.b); b.rect(9, 34, 26, 1, BELT.s);
    };
    const shoulders = () => {
      armA.ellipse(8.5, 22, 4.5, 5, NAVY, { edge: true }); armB.ellipse(35.5, 22, 4.5, 5, NAVY, { edge: true });
      armA.rect(4, 22, 9, 1, RED.b); armB.rect(31, 22, 9, 1, RED.b); armA.rect(4, 24, 9, 1, RED.b); armB.rect(31, 24, 9, 1, RED.b);
    };
    if (v === 'back') {
      legs(); belly(); studs(b, 12, 32, 21, 5);
      b.poly([[5, 26], [7, 25], [12, 31], [10, 32]], HILT, { edge: true });   // hilt peeking out at his side
      shoulders();
      earA.poly([[12, 9], [11, -1], [19, 5]], O, { edge: true }); earB.poly([[32, 9], [33, -1], [25, 5]], O, { edge: true });
      h.ellipse(22, 13, 12, 9, O, { edge: true });
      h.ellipseM(10, 16, 2.2, 2.2, C);                                      // puffy cheeks from behind
      h.rect(10, 6, 24, 2, RED.b); h.rect(10, 7, 24, 1, RED.s);
      h.ellipse(22, 7, 2.2, 1.8, RED, { edge: true });
      h.poly([[21, 8], [17, 19], [20, 18]], RED, { edge: true }); h.poly([[23, 8], [27, 19], [24, 18]], RED, { edge: true });
      t.ellipse(22, 31, 5.5, 5, O, { edge: true });                         // the famous curled tail
      t.ellipse(22, 30.5, 3.2, 2.8, C); t.px(22, 30, O.s); t.px(23, 30, O.s);
      return;
    }
    t.ellipse(37, 27, 5, 5.5, O, { edge: true });                           // fluffy tail out to the side
    t.ellipse(37.5, 26.5, 3, 3.3, C); t.px(37, 26, O.s);
    t.poly([[10, 33], [12, 34], [5, 42], [3, 41]], NAVY, { edge: true });   // scabbard trailing behind his left leg
    legs();
    legA.ellipse(16.5, 42.4, 3.8, 1.5, C, { edge: true }); legB.ellipse(27.5, 42.4, 3.8, 1.5, C, { edge: true });   // paws in sandals
    legA.rect(16, 42, 2, 1, SANDAL); legB.rect(27, 42, 2, 1, SANDAL);
    belly();
    b.poly([[18, 18], [26, 18], [22, 23]], C);                              // white bib at the neck
    b.rect(18, 19, 8, 1, CORD); studs(b, 13, 31, 21, 6);
    b.ellipse(15, 33.5, 1.8, 1.5, BELT, { edge: true }); b.rect(14, 35, 2, 3, BELT.s);   // knot and tassel
    b.poly([[6, 26], [8, 25], [14.5, 31.5], [12.5, 32.5]], HILT, { edge: true });   // the katana's hilt at his left hip
    b.px(9, 27, '#22564c').px(11, 29, '#22564c');
    b.ellipse(13.5, 32, 2, 1.5, GOLD, { edge: true });
    shoulders();
    armA.ellipse(12, 30, 2.9, 2.5, C, { edge: true }); armB.ellipse(32, 30, 2.9, 2.5, C, { edge: true });   // chubby paws
    earA.poly([[12, 9], [11, -1], [19, 5]], O, { edge: true }); earB.poly([[32, 9], [33, -1], [25, 5]], O, { edge: true });
    earA.poly([[13.5, 7.5], [12.5, 1.5], [17, 5]], PINK); earB.poly([[30.5, 7.5], [31.5, 1.5], [27, 5]], PINK);
    h.ellipse(22, 13, 12, 9, O, { edge: true });                            // bigger round head
    h.ellipseM(10.5, 16.5, 3.2, 3, C, { edge: true });                      // puffy cheeks sticking out
    h.ellipse(22, 17.5, 9.5, 5.2, C);                                       // big cream lower face
    h.rect(10, 6, 24, 2, RED.b); h.rect(10, 7, 24, 1, RED.s);               // red headband
    h.ellipse(22, 6, 2.2, 1.8, RED, { edge: true }); h.rect(21, 8, 2, 3, RED.b);
    h.pxM(15, 10, C.b); h.pxM(16, 10, C.b);
    rigEyes(h, Q, 44, 14, 12, 5, () => { h.rectM(14, 12, 5, 1, OUTLINE); h.rectM(15, 13, 3, 1, DARK_EYE); });
    h.rect(20, 15, 4, 1, OUTLINE); h.rect(21, 16, 2, 1, OUTLINE); h.px(21, 15, '#5a5060');
    rigMouth(h, Q, 19, 18, 6, () => { h.px(19, 18, OUTLINE); h.rect(20, 19, 2, 1, OUTLINE); h.rect(22, 19, 2, 1, OUTLINE); h.px(24, 18, OUTLINE); h.px(21, 17, OUTLINE); h.px(22, 17, OUTLINE); });
  };
  RIGGED.shogunA = 'quad'; RIGGED.shogunB = 'biped'; RIGGED.shogunC = 'biped';
  const base = ROSTER_BY_ID.smugshogun;
  for (const [id, name] of [['shogunA', 'SAMURAI A'], ['shogunB', 'SAMURAI B'], ['shogunC', 'SAMURAI B2']])
    if (!ROSTER_BY_ID[id]) { const d = { ...base, id, name }; EVOLVED.push(d); ROSTER_BY_ID[id] = d; }
})();
