// The tidalisk family: tidalisk, maelstrisk. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// Redesigned in r96 (the owner's picks S1 and M1): a sea serpent with a carved stone horn covered in
// glowing runes, growing into a leviathan that wears the ruins of a sunken temple.

const TIDALISK = {
  S: P('#5aa88a', '#3a7a64', '#8ad0b4'), Sd: P('#3e8a74', '#2a6050', '#5aa88a'), Sn: P('#6cbc9c', '#4a8e74', '#9adcc0'),
  Bel: P('#c4e8cc', '#94c4a4', '#e8fff0'), Fin: P('#d0f6ee', '#8ad0c0', '#ffffff'), Stone: P('#d8ccb0', '#a89a7c', '#f4ecd8'),
  RUNE: '#5af0ff', EYE: '#ffb02a', DARK: DARK_EYE, SEG: '#94c4a4',
};
const MAELSTRISK = {
  T: P('#2e8a7a', '#1c5e54', '#5ab8a4'), Td: P('#22705f', '#164a40', '#3e9a88'), Tn: P('#3a9e8c', '#26706a', '#62c2b0'),
  Bel: P('#a8d8c0', '#78b098', '#d0f0e0'), Fin: P('#b8f0e4', '#6ac0b0', '#ffffff'), Stone: TIDALISK.Stone,
  Water: P('#7ad0d0', '#4aa0a8', '#c8f8f8'), RUNE: '#6afcff', EYE: '#8afcff', SEG: '#78b098',
};
// a carved stone spike (a horn, or one of the leviathan's crown) with a rune or two glowing on it
function runeSpike(p, pts, runes) { p.poly(pts, MAELSTRISK.Stone, { edge: true }); for (const [x, y] of runes) p.px(x, y, MAELSTRISK.RUNE); }

Object.assign(MONSTER_ART, {
  // A small sea serpent coiled up on itself: sea-green scales, a single horn of carved stone with
  // glowing runes, a frilled fin down its back like a wave crest, a forked tail fin, wise amber eyes.
  tidalisk(g, v = 'front') {
    const { S, Sd, Sn, Bel, Fin, Stone, RUNE, EYE, DARK, SEG } = TIDALISK;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    if (v === 'side') {
      t.poly([[5, 25], [0, 20], [2, 25], [0, 30]], Fin, { edge: true });                                         // forked tail fin
      g.ellipse(15, 26, 12, 4.5, S, { edge: true });                                                              // coil
      b.poly([[14, 11], [10, 12], [13, 14], [9, 16], [13, 18], [9, 21], [13, 23], [11, 26], [16, 24]], Fin, { edge: true });   // wave-crest frill
      b.ellipse(17, 19, 4.5, 8, S, { edge: true });                                                               // neck
      b.ellipse(20, 21, 2.5, 6, Bel);
      for (const y of [17, 20, 23]) b.rect(19, y, 3, 1, SEG);
      earB.poly([[16, 9], [11, 6], [13, 9], [11, 12], [16, 11]], Fin);                                           // head fin
      h.ellipse(20, 10, 6.5, 4.5, S, { edge: true });                                                             // head
      h.ellipse(25, 11.5, 3.5, 2.2, Sn, { edge: true });                                                          // snout
      h.poly([[19.5, 7], [20, 2], [21, 0], [22, 2], [22.5, 7]], Stone, { edge: true }); h.px(20, 3, RUNE).px(21, 5, RUNE);    // stone horn
      h.rect(22, 8, 2, 1, OUTLINE);                                                                               // heavy lid
      rigEye(h, Q, 22, 9, () => { h.rect(22, 9, 2, 2, EYE); h.px(23, 10, DARK); });
      rigMouth(h, Q, 25, 13, 2);
      g.px(10, 27, '#8ad0b4'); g.px(7, 26, '#8ad0b4');
      return;
    }
    if (v === 'back') {
      t.poly([[26, 25], [31, 20], [29, 25], [31, 30]], Fin, { edge: true });
      g.ellipse(16, 26, 12, 4.5, Sd, { edge: true });
      earA.poly([[11, 9], [5, 6], [7, 10], [5, 13], [11, 12]], Fin); earB.poly([[21, 9], [27, 6], [25, 10], [27, 13], [21, 12]], Fin);
      b.ellipse(16, 19, 4.5, 8, Sd, { edge: true });                                                              // neck
      h.ellipse(16, 10, 6.5, 5, Sd, { edge: true });                                                              // head
      h.poly([[14.5, 7], [15, 2], [16, 0], [17, 2], [17.5, 7]], Stone, { edge: true }); h.px(16, 4, RUNE);
      b.poly([[15, 12], [17, 12], [18, 16], [17, 19], [18, 23], [17, 26], [15, 26], [14, 23], [15, 19], [14, 16]], Fin, { edge: true });   // the frill down its back
      return;
    }
    t.poly([[26, 26], [31, 22], [29, 27], [31, 31]], Fin, { edge: true });                                       // tail fin
    g.ellipse(16, 26, 12, 4.5, S, { edge: true });                                                                // coil
    b.polyM([[12, 13], [7, 14], [10, 16], [7, 19], [10, 21], [7, 24], [12, 24]], Fin, { edge: true });           // frill, both sides of the neck
    b.ellipse(16, 19, 4.5, 8, S, { edge: true });                                                                 // neck
    b.ellipse(16, 21, 2.5, 6, Bel);
    for (const y of [17, 20, 23]) b.rect(15, y, 3, 1, SEG);
    earA.poly([[11, 9], [5, 6], [7, 10], [5, 13], [11, 12]], Fin); earB.poly([[21, 9], [27, 6], [25, 10], [27, 13], [21, 12]], Fin);   // head fins
    h.ellipse(16, 10, 6.5, 5, S, { edge: true });                                                                 // head
    h.ellipse(16, 13, 3.5, 2, Sn);                                                                                // snout
    h.poly([[14.5, 7], [15, 2], [16, 0], [17, 2], [17.5, 7]], Stone, { edge: true }); h.px(15, 3, RUNE).px(16, 5, RUNE);   // carved stone horn
    h.rectM(11, 8, 2, 1, OUTLINE);                                                                                // heavy lids: wise, narrowed
    rigEyes(h, Q, 32, 11, 9, 2, () => { h.rectM(11, 9, 2, 2, EYE); h.pxM(12, 10, DARK); });
    rigMouth(h, Q, 15, 14, 2);
    g.pxM(9, 27, '#8ad0b4'); g.pxM(6, 26, '#8ad0b4');
  },
  // Tidalisk grown into a great leviathan that wears the ruins of a sunken temple: carved stone
  // rings around its coils and neck and a crown of stone spikes, all glowing with runes, a long
  // wave-crest fin, glowing aqua eyes, and a whirlpool turning around its coils.
  maelstrisk(g, v = 'front') {
    const { T, Td, Tn, Bel, Fin, Stone, Water, RUNE, EYE, SEG } = MAELSTRISK;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const band = (pts, runes) => { g.poly(pts, Stone, { edge: true }); for (const [x, y] of runes) g.px(x, y, RUNE); };
    if (v === 'side') {
      t.poly([[5, 36], [0, 29], [2, 36], [0, 43]], Fin, { edge: true });                                          // forked tail fin
      g.ellipse(21, 40.5, 21, 3.5, Water);                                                                         // the whirlpool
      g.ellipse(20, 37, 18, 6, T, { edge: true });                                                                 // coil
      band([[10, 32], [13, 31], [14, 43], [11, 43]], [[12, 35], [12, 39]]); band([[26, 31], [29, 32], [29, 43], [26, 43]], [[27, 35], [27, 39]]);
      b.poly([[22, 14], [17, 16], [20, 18], [15, 21], [19, 23], [14, 27], [19, 28], [15, 33], [21, 32]], Fin, { edge: true });   // wave crest
      b.ellipse(24, 27, 6.5, 10, T, { edge: true });                                                               // neck
      b.ellipse(28, 29, 3, 8, Bel);
      for (const y of [24, 27, 33]) b.rect(26, y, 4, 1, SEG);
      b.poly([[18, 29], [31, 28], [31, 31], [18, 32]], Stone, { edge: true }); b.px(21, 30, RUNE).px(25, 30, RUNE).px(29, 29, RUNE);   // stone ring
      runeSpike(earB, [[22, 12], [14, 6], [16, 5], [25, 10]], [[18, 7]]);                                          // crown of stone spikes, swept back
      runeSpike(earA, [[24, 9], [18, 1], [20, 0], [27, 7]], [[21, 3]]);
      h.ellipse(29, 13, 8.5, 6.5, T, { edge: true });                                                              // head
      runeSpike(h, [[27, 7], [27, 0], [29, 0], [30, 7]], [[28, 3]]);
      h.ellipse(36, 16, 5, 3, Tn, { edge: true });                                                                 // snout
      h.px(39, 14, OUTLINE);
      h.rect(30, 10, 4, 1, OUTLINE); h.px(34, 11, OUTLINE);                                                         // brow
      rigEye(h, Q, 31, 11, () => { h.rect(31, 11, 3, 2, EYE); h.px(32, 11, '#ffffff'); }, 3);
      h.px(27, 15, RUNE);                                                                                           // a rune on the cheek
      rigMouth(h, Q, 35, 18, 4, () => h.rect(35, 18, 3, 1, OUTLINE));
      return;
    }
    if (v === 'back') {
      t.poly([[39, 36], [44, 29], [42, 36], [44, 43]], Fin, { edge: true });
      g.ellipse(22, 40.5, 21, 3.5, Water);
      g.ellipse(22, 37, 18, 6, Td, { edge: true });
      band([[8, 33], [11, 32], [12, 42], [9, 42]], [[10, 36]]); band([[33, 32], [36, 33], [35, 42], [32, 42]], [[34, 36]]);
      runeSpike(earA, [[16, 9], [10, 0], [13, 0], [18, 7]], [[13, 3]]); runeSpike(earA, [[13, 12], [5, 6], [7, 4], [15, 9]], [[9, 7]]);
      runeSpike(earB, [[28, 9], [34, 0], [31, 0], [26, 7]], [[31, 3]]); runeSpike(earB, [[31, 12], [39, 6], [37, 4], [29, 9]], [[35, 7]]);
      b.ellipse(22, 27, 7.5, 10, Td, { edge: true });                                                              // neck
      h.ellipse(22, 13, 9, 7, Td, { edge: true });                                                                 // head
      runeSpike(h, [[20, 7], [21.5, 0], [22.5, 0], [24, 7]], [[22, 3]]);
      for (const y of [20, 25, 30, 35]) b.poly([[19, y + 1], [22, y - 4], [25, y + 1]], Fin, { edge: true });     // the crest down its back
      b.poly([[14, 29], [30, 29], [30, 32], [14, 32]], Stone, { edge: true }); b.px(17, 30, RUNE).px(22, 30, RUNE).px(27, 30, RUNE);
      return;
    }
    g.ellipse(22, 40.5, 21, 3.5, Water);                                                                           // the whirlpool
    t.poly([[38, 36], [43, 31], [41, 37], [43, 42]], Fin, { edge: true });                                         // tail fin
    g.ellipse(22, 37, 18, 6, T, { edge: true });                                                                   // coil
    band([[8, 33], [11, 32], [12, 42], [9, 42]], [[10, 35], [10, 39]]); band([[33, 32], [36, 33], [35, 42], [32, 42]], [[34, 35], [34, 39]]);
    b.polyM([[15, 20], [6, 16], [9, 21], [4, 24], [10, 26], [6, 30], [14, 30]], Fin, { edge: true });             // wave-crest fins
    b.ellipse(22, 27, 7.5, 10, T, { edge: true });                                                                 // neck
    b.ellipse(22, 29, 4, 8, Bel);
    for (const y of [23, 26, 35]) b.rect(19, y, 6, 1, SEG);
    b.poly([[14, 29], [30, 29], [30, 32], [14, 32]], Stone, { edge: true }); b.px(17, 30, RUNE).px(22, 30, RUNE).px(27, 30, RUNE);   // carved stone ring
    runeSpike(earA, [[16, 9], [10, 0], [13, 0], [18, 7]], [[13, 3]]); runeSpike(earA, [[13, 12], [5, 6], [7, 4], [15, 9]], [[9, 7]]);   // crown of stone spikes
    runeSpike(earB, [[28, 9], [34, 0], [31, 0], [26, 7]], [[31, 3]]); runeSpike(earB, [[31, 12], [39, 6], [37, 4], [29, 9]], [[35, 7]]);
    h.ellipse(22, 13, 9, 7, T, { edge: true });                                                                    // head
    runeSpike(h, [[20, 7], [21.5, 0], [22.5, 0], [24, 7]], [[22, 3]]);
    h.ellipse(22, 17.5, 4.5, 3.2, Tn, { edge: true });                                                             // snout
    h.pxM(15, 10, OUTLINE).pxM(16, 10, OUTLINE).pxM(17, 11, OUTLINE).pxM(18, 11, OUTLINE);                         // brows
    rigEyes(h, Q, 44, 16, 12, 3, () => { h.rectM(16, 12, 3, 2, EYE); h.pxM(17, 12, '#ffffff'); });
    h.pxM(14, 15, RUNE);                                                                                           // runes on the cheeks
    rigMouth(h, Q, 20, 19, 4, () => h.rect(20, 19, 4, 1, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  tidalisk(g, v) {
    const { S, Sd, Sn, Bel, Fin, Stone, RUNE, EYE, DARK, SEG } = TIDALISK;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    t.poly([[6, 25], [1, 20], [3, 25], [1, 30]], Fin, { edge: true });                                             // forked tail fin
    if (v === 'bside') {
      g.ellipse(16, 26, 12, 4.5, Sd, { edge: true });
      earB.poly([[12, 9], [6, 6], [8, 10], [6, 13], [12, 12]], Fin); earA.poly([[23, 8], [29, 5], [27, 9], [29, 12], [24, 11]], Fin);
      b.ellipse(17, 19, 4.5, 8, Sd, { edge: true });
      h.ellipse(18, 10, 6.5, 5, Sd, { edge: true });
      h.ellipse(24, 12, 1.6, 1.4, Sn);                                                                            // snout peeking out
      h.poly([[16.5, 7], [17, 2], [18, 0], [19, 2], [19.5, 7]], Stone, { edge: true }); h.px(18, 4, RUNE);
      b.poly([[16, 12], [18, 12], [19, 16], [18, 19], [19, 23], [18, 26], [16, 26], [15, 23], [16, 19], [15, 16]], Fin, { edge: true });
      return;
    }
    g.ellipse(15, 26, 12, 4.5, S, { edge: true });                                                                // coil
    b.poly([[13, 12], [9, 14], [12, 16], [8, 19], [12, 21], [8, 24], [13, 24]], Fin, { edge: true });            // frill
    b.ellipse(17, 19, 4.5, 8, S, { edge: true });                                                                 // neck
    b.ellipse(18.5, 21, 3, 6, Bel);
    for (const y of [17, 20, 23]) b.rect(17, y, 4, 1, SEG);
    earB.poly([[12, 9], [6, 6], [8, 10], [6, 13], [12, 12]], Fin); earA.poly([[23, 9], [28, 7], [26, 10], [28, 13], [23, 12]], Fin);
    h.ellipse(18, 10, 6.5, 5, S, { edge: true });                                                                 // head
    h.ellipse(20.5, 13, 3.5, 2, Sn);                                                                              // snout, turned its way
    h.poly([[16.5, 7], [17, 2], [18, 0], [19, 2], [19.5, 7]], Stone, { edge: true }); h.px(17, 3, RUNE).px(18, 5, RUNE);
    h.rect(14, 8, 2, 1, OUTLINE); h.rect(21, 8, 2, 1, OUTLINE);
    rigEye(h, Q, 14, 9, () => { h.rect(14, 9, 2, 2, EYE); h.px(14, 10, DARK); });
    rigEye(h, Q, 21, 9, () => { h.rect(21, 9, 2, 2, EYE); h.px(22, 10, DARK); });
    rigMouth(h, Q, 19, 14, 3);
    g.px(9, 27, '#8ad0b4'); g.px(6, 26, '#8ad0b4');
  },
  maelstrisk(g, v) {
    const { T, Td, Tn, Bel, Fin, Stone, Water, RUNE, EYE, SEG } = MAELSTRISK;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const band = (pts, runes) => { g.poly(pts, Stone, { edge: true }); for (const [x, y] of runes) g.px(x, y, RUNE); };
    g.ellipse(22, 40.5, 21, 3.5, Water);                                                                           // the whirlpool
    t.poly([[5, 36], [0, 29], [2, 36], [0, 43]], Fin, { edge: true });                                             // tail fin
    if (v === 'bside') {
      g.ellipse(22, 37, 18, 6, Td, { edge: true });
      band([[9, 33], [12, 32], [13, 42], [10, 42]], [[11, 36]]); band([[31, 32], [34, 33], [33, 42], [30, 42]], [[32, 36]]);
      runeSpike(earB, [[17, 9], [11, 0], [14, 0], [19, 7]], [[14, 3]]); runeSpike(earB, [[14, 12], [6, 6], [8, 4], [16, 9]], [[10, 7]]);
      runeSpike(earA, [[30, 9], [35, 1], [32, 0], [28, 7]], [[32, 3]]); runeSpike(earA, [[33, 12], [40, 7], [38, 5], [31, 9]], [[36, 8]]);
      b.ellipse(23, 27, 7.5, 10, Td, { edge: true });
      h.ellipse(24, 13, 9, 7, Td, { edge: true });
      h.ellipse(32.5, 15, 2, 2, Tn);                                                                               // snout peeking out
      runeSpike(h, [[22, 7], [23.5, 0], [24.5, 0], [26, 7]], [[24, 3]]);
      for (const y of [20, 25, 30, 35]) b.poly([[20, y + 1], [23, y - 4], [26, y + 1]], Fin, { edge: true });
      b.poly([[15, 29], [31, 29], [31, 32], [15, 32]], Stone, { edge: true }); b.px(18, 30, RUNE).px(23, 30, RUNE).px(28, 30, RUNE);
      return;
    }
    g.ellipse(21, 37, 18, 6, T, { edge: true });                                                                   // coil
    band([[8, 33], [11, 32], [12, 42], [9, 42]], [[10, 35], [10, 39]]); band([[31, 32], [34, 33], [33, 42], [30, 42]], [[32, 35], [32, 39]]);
    b.poly([[16, 20], [7, 16], [10, 21], [5, 24], [11, 26], [7, 30], [15, 30]], Fin, { edge: true });             // wave-crest fins
    b.poly([[30, 20], [37, 17], [35, 22], [39, 25], [34, 27], [37, 30], [31, 30]], Fin, { edge: true });
    b.ellipse(23, 27, 7.5, 10, T, { edge: true });                                                                 // neck
    b.ellipse(25, 29, 4, 8, Bel);
    for (const y of [23, 26, 35]) b.rect(22, y, 6, 1, SEG);
    b.poly([[15, 29], [31, 29], [31, 32], [15, 32]], Stone, { edge: true }); b.px(18, 30, RUNE).px(23, 30, RUNE).px(28, 30, RUNE);
    runeSpike(earB, [[18, 9], [13, 1], [15, 0], [20, 7]], [[15, 3]]); runeSpike(earB, [[15, 12], [9, 7], [10, 5], [17, 9]], [[12, 8]]);   // far spikes, smaller
    runeSpike(earA, [[30, 9], [36, 0], [33, 0], [28, 7]], [[33, 3]]); runeSpike(earA, [[33, 12], [41, 6], [39, 4], [31, 9]], [[37, 7]]);
    h.ellipse(24, 13, 9, 7, T, { edge: true });                                                                    // head
    runeSpike(h, [[22, 7], [23.5, 0], [24.5, 0], [26, 7]], [[24, 3]]);
    h.ellipse(26.5, 17.5, 4.5, 3.2, Tn, { edge: true });                                                           // snout, turned its way
    h.px(17, 10, OUTLINE).px(18, 10, OUTLINE).px(19, 11, OUTLINE);                                                 // brows
    h.px(25, 11, OUTLINE).px(26, 11, OUTLINE).px(27, 10, OUTLINE).px(28, 10, OUTLINE);
    rigEye(h, Q, 18, 12, () => { h.rect(18, 12, 2, 2, EYE); h.px(18, 12, '#ffffff'); });
    rigEye(h, Q, 25, 12, () => { h.rect(25, 12, 3, 2, EYE); h.px(26, 12, '#ffffff'); }, 3);
    h.px(31, 15, RUNE);
    rigMouth(h, Q, 24, 19, 4, () => h.rect(24, 19, 4, 1, OUTLINE));
  },
});
Object.assign(RIGGED, { tidalisk: 'slither', maelstrisk: 'slither' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  tidalisk: { fps: 5, every: 9, frames: [{ tail: [1, 0] }, { head: [1, -1], mouth: 'open' }, { head: [1, -1] }, { tail: [-1, 0] }, { }] },   // sways and tastes the air
  maelstrisk: { fps: 5, every: 11, frames: [{ body: -1, head: [0, -1] }, { body: -1, head: [0, -2], eyes: 'blink' }, { body: -1, head: [0, -2], mouth: 'open' }, { }] },   // rises up in its coils
});
