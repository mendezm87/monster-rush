// Original monster designs, drawn procedurally with the PixGrid primitives.
// Each draw function receives an empty grid and paints back-to-front.

const P = (b, s, l) => ({ b, s, l });
const DARK_EYE = '#1a1222';

const MONSTER_ART = {
  sparkit(g) {
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

  cinderox(g) {
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

  tidalisk(g) {
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

  thornback(g) {
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

  slumbear(g) { // 44x44
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

  frostling(g) {
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

  drakorn(g) {
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

  boulderon(g) { // 44x44
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

  mindra(g) {
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

  shadefang(g) {
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

  lumawool(g) {
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

  brawlix(g) {
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

  galewing(g) {
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

  venomire(g) {
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

  scarablade(g) {
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

  wispurr(g) {
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

  gearhulk(g) { // 44x44
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

  // Toshi, the owner's real-life Shiba Inu: red coat, cream mask and socks,
  // white eyebrow spots, a big curled tail and his trademark smug half-closed eyes.
  smugshi(g) {
    const O = P('#d9792e', '#a8521c', '#f0a050');
    const C = P('#fbf0dc', '#e4cfae', '#ffffff');
    g.ellipse(26, 19, 4.5, 4.5, O, { edge: true });                                             // curled tail
    g.ellipse(26.5, 18.5, 2.2, 2.2, C);                                                          // fluffy white curl
    g.px(26, 18, '#a8521c');
    g.ellipseM(11, 29, 2.5, 1.6, C, { edge: true });                                            // white socks
    g.ellipse(16, 23, 8, 6.5, O, { edge: true });                                               // body
    g.ellipse(16, 24.5, 4.5, 5, C);                                                             // cream chest
    g.polyM([[9, 9], [8, 0], [14, 6]], O, { edge: true });                                      // pointy ears
    g.polyM([[10, 7], [9, 3], [12, 6]], '#fbf0dc');                                             // cream inner ears
    g.ellipse(16, 12, 8, 6.5, O, { edge: true });                                               // head
    g.ellipse(16, 15, 5.5, 3.6, C);                                                             // cream muzzle and cheeks
    g.ellipseM(9.5, 14, 1.6, 1.4, C);
    g.pxM(11, 9, '#fbf0dc'); g.pxM(12, 9, '#fbf0dc');                                           // eyebrow spots
    g.rectM(10, 11, 4, 1, OUTLINE);                                                             // smug half-closed lids
    g.rectM(11, 12, 2, 1, DARK_EYE);
    g.rect(15, 13, 2, 2, OUTLINE);                                                              // nose
    g.px(14, 17, OUTLINE).px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(17, 16, OUTLINE);          // smirk
  },

  // An exhausted sloth clinging to its coffee: dark eye bands that double as
  // tired bags, droopy half-shut eyes, a frown and messy bed hair.
  mondaze(g) {
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

  pixibelle(g) {
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

// Build every monster's normal + white-silhouette canvas once.
function buildSprites() {
  for (const mon of ROSTER) {
    const size = mon.size === 'L' ? 44 : 32;
    const g = new PixGrid(size, size);
    MONSTER_ART[mon.id](g);
    g.outline();
    SPRITES[mon.id] = { img: g.toCanvas(), white: g.toCanvas('#ffffff'), size };
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
