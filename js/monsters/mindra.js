// The mindra family: gyroculus, mindra, stonicface. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// Redesigned in r97 from the owner's three picks (MI3, MI1, MI2), made into one line: a mind trapped in
// an old brass instrument (Gyroculus) breaks free as pure thought (Mindra) and recovers its ancient
// stone face (Stonicface).

const GYROCULUS = {
  Br: P('#c8963a', '#8a6020', '#f0d07a'), BrD: P('#9a6e28', '#5e4214', '#c09440'), Iris: P('#a070f0', '#6a3cc0', '#d8c0ff'),
  PUPIL: '#24103a', GLINT: '#fff2a0',
};
const MINDRA = {
  Gl: P('#c4b0f0', '#957ad0', '#ece4ff'), Rim: P('#a890e0', '#7a60b8', '#d0c4f4'), Brain: P('#f6cdf2', '#d89ad8', '#fff2ff'),
  FOLD: '#c27ac4', TEN: '#d6caf4', ORB: '#f4eeff', EYE: '#ffffff',
};
const STONICFACE = {
  St: P('#c8bca4', '#968a74', '#e6dfcc'), StD: P('#8e8470', '#625a4a', '#aaa08a'), Fl: P('#a46cf0', '#7038c0', '#d4aaff'),
  GOLD: '#d8a838', CRACK: '#5a5040', EYE: '#f0c8ff', FLC: '#e8d0ff',
};

// A thin brass ring (two pixels thick), drawn as dots round an ellipse; keep(cos, sin) picks which half
// (the half behind the orb is drawn before it, the front half after).
function brassRing(p, cx, cy, rx, ry, keep = () => true) {
  const { Br } = GYROCULUS, n = Math.ceil((rx + ry) * 5);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    if (!keep(c, s)) continue;
    for (const k of [0, 0.9]) p.px(Math.round(cx + (rx - k) * c), Math.round(cy + (ry - k) * s), s < -0.3 ? Br.l : s > 0.4 ? Br.s : Br.b);
  }
}
// Gyroculus's single great eye, in any pose: open (violet iris, pupil, glint), shut, squeezed or dazed.
function gyroEye(h, Q, cx, cy, rx, ry = rx) {
  const { BrD, Iris, PUPIL } = GYROCULUS;
  if (Q.eyes === 'blink' || Q.eyes === 'sleep') { h.ellipse(cx, cy, rx, ry, BrD); h.rect(Math.round(cx - rx + 1), Math.round(cy), Math.round(rx * 2 - 1), 1, OUTLINE); return; }
  h.ellipse(cx, cy, rx, ry, Iris);
  if (Q.eyes === 'hurt' || Q.eyes === 'faint') { for (let d = -1; d <= 1; d++) { h.px(Math.round(cx + d), Math.round(cy + d), OUTLINE); h.px(Math.round(cx + d), Math.round(cy - d), OUTLINE); } return; }
  h.ellipse(cx + 0.3, cy + 0.3, Math.max(1, rx * 0.42), Math.max(1.2, ry * 0.48), PUPIL);
  h.px(Math.round(cx - rx * 0.5), Math.round(cy - ry * 0.5), '#ffffff');
}
// One of Mindra's tendrils: a thin wavy line hanging from (x, y), curling at the end.
function tendril(p, x, y, len, phase, curl, drift = 0) {
  let px = x;
  for (let i = 0; i < len; i++) { px = Math.round(x + Math.sin(i * 0.55 + phase) * 1.1 + drift * i); p.px(px, y + i, MINDRA.TEN); }
  p.px(px + curl, y + len - 1, MINDRA.TEN); p.px(px + curl, y + len - 2, MINDRA.TEN);
}
// A small floating orb (Mindra's) and a carved stone tablet with a glowing glyph (Stonicface's).
const mindOrb = (p, x, y) => { p.rect(x, y, 2, 2, MINDRA.ORB); p.px(x, y, '#ffffff'); };
function stoneTablet(p, x, y, lean = 0) {
  const { St, Fl } = STONICFACE;
  p.poly([[x + lean, y], [x + 5 + lean, y], [x + 5, y + 7], [x, y + 7]], St, { edge: true });
  p.px(x + 2, y + 2, Fl.l).px(x + 3, y + 3, Fl.l).px(x + 2, y + 4, Fl.l);
}

Object.assign(MONSTER_ART, {
  // A small floating brass astrolabe: two thin rings turning round a brass orb whose window is one
  // great violet eye, a knob on top, and a tail of brass beads ending in a little pendant.
  gyroculus(g, v = 'front') {
    const { Br, BrD } = GYROCULUS;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const beads = dir => {   // the bead tail hangs from the orb's bottom and curls away (dir = which way)
      for (const [dx, y] of [[1, 22], [2.5, 24], [4.5, 25.5], [6.5, 26.5], [8.5, 27]]) t.ellipse(16 + dir * dx, y, 1.3, 1.3, Br, { edge: true });
      const ex = 16 + dir * 10.5; t.poly([[ex, 26], [ex + 1.5, 28], [ex, 30], [ex - 1.5, 28]], Br, { edge: true });
    };
    const knob = () => { b.rect(15, 2, 2, 3, '#8a6020'); b.ellipse(16, 2, 1.6, 1.6, Br); };
    if (v === 'side') {
      beads(-1);
      knob();
      brassRing(earB, 16, 14, 11, 12);                                                         // the upright ring, face-on
      brassRing(earA, 16, 15, 13, 4.5, (c, s) => s < 0);                                      // the flat ring, back half
      h.ellipse(16, 15, 6.5, 6.5, Br, { edge: true });                                         // the orb
      h.ellipse(18.5, 15, 3.4, 4.8, BrD);                                                      // its window, turned right
      gyroEye(h, Q, 19, 15, 2.6, 4);
      brassRing(earA, 16, 15, 13, 4.5, (c, s) => s >= 0);                                     // the flat ring, front half
      return;
    }
    if (v === 'back') {
      beads(-1);
      knob();
      brassRing(earB, 16, 14, 4, 12, c => c > 0);
      brassRing(earA, 16, 15, 13, 4.5, (c, s) => s < 0);
      h.ellipse(16, 15, 6.5, 6.5, Br, { edge: true });                                         // the orb's back: riveted plates
      h.rect(10, 15, 13, 1, BrD.s); h.rect(16, 9, 1, 13, BrD.s);
      h.px(13, 12, BrD.s).px(19, 12, BrD.s).px(13, 18, BrD.s).px(19, 18, BrD.s);
      brassRing(earB, 16, 14, 4, 12, c => c <= 0);
      brassRing(earA, 16, 15, 13, 4.5, (c, s) => s >= 0);
      return;
    }
    beads(1);
    knob();
    brassRing(earB, 16, 14, 4, 12, c => c < 0);                                               // upright ring, back half
    brassRing(earA, 16, 15, 13, 4.5, (c, s) => s < 0);                                        // flat ring, back half
    h.ellipse(16, 15, 6.5, 6.5, Br, { edge: true });                                           // the orb
    h.ellipse(16, 15, 4.8, 4.8, BrD);                                                          // its window
    gyroEye(h, Q, 16, 15, 4);
    brassRing(earB, 16, 14, 4, 12, c => c >= 0);                                              // the front halves
    brassRing(earA, 16, 15, 13, 4.5, (c, s) => s >= 0);
    earA.px(6, 18, GYROCULUS.GLINT).px(25, 19, GYROCULUS.GLINT);                              // engraved stars catching the light
  },
  // An oracle jelly: a bell of pale violet glass with a softly glowing brain inside, calm narrowed
  // eyes glowing white, long thin tendrils that curl like smoke, and three small orbs circling it.
  mindra(g, v = 'front') {
    const { Gl, Rim, Brain, FOLD, EYE } = MINDRA;
    const { Q, h, t, earA, earB } = rigParts(g, v);
    const bell = (cx, eyes) => {
      h.ellipse(cx, 12, 10, 7.5, Gl, { edge: true });                                          // the glass bell
      h.poly([[cx - 10, 16], [cx + 10, 16], [cx + 9, 20], [cx + 6, 19], [cx + 3, 21], [cx, 19], [cx - 3, 21], [cx - 6, 19], [cx - 9, 20]], Rim, { edge: true });   // scalloped rim
      h.ellipse(cx, 9, 6, 4.2, Brain, { edge: true });                                         // the brain inside
      h.rect(cx, 6, 1, 6, FOLD); h.px(cx - 3, 7, FOLD).px(cx - 4, 9, FOLD).px(cx - 2, 10, FOLD).px(cx + 3, 7, FOLD).px(cx + 4, 9, FOLD).px(cx + 2, 10, FOLD);
      h.px(cx - 7, 8, '#ffffff').px(cx - 6, 7, '#ffffff');                                     // glass shine
      if (eyes) eyes();
    };
    if (v === 'side') {
      for (const [x, len, ph, d] of [[12, 10, 0, -1], [15, 11, 1.5, -1], [18, 10, 3, -1], [20, 9, 4.2, 1]]) tendril(t, x, 20, len, ph, d, -0.25);   // trailing back
      mindOrb(earA, 2, 9); mindOrb(earB, 26, 18);
      bell(15, () => { h.px(20, 12, OUTLINE).px(21, 12, OUTLINE).px(22, 13, OUTLINE); rigEye(h, Q, 20, 13, () => { h.rect(20, 13, 3, 2, '#3a2058'); h.rect(20, 13, 2, 1, EYE); }, 3); });
      return;
    }
    if (v === 'back') {
      for (const [x, len, ph, d] of [[9, 9, 0, -1], [12, 11, 1, 1], [15, 10, 2, -1], [17, 11, 3, 1], [20, 10, 4, -1], [23, 9, 5, 1]]) tendril(t, x, 20, len, ph, d);
      mindOrb(earA, 27, 9); mindOrb(earB, 3, 18);
      bell(16);
      return;
    }
    for (const [x, len, ph, d] of [[9, 9, 0, -1], [12, 11, 1, 1], [15, 10, 2, -1], [17, 11, 3, 1], [20, 10, 4, -1], [23, 9, 5, 1]]) tendril(t, x, 20, len, ph, d);
    mindOrb(earA, 2, 12); mindOrb(earA, 28, 9); mindOrb(earB, 26, 20);                           // orbs circling it
    bell(16, () => {
      h.pxM(9, 12, OUTLINE).pxM(10, 12, OUTLINE).pxM(11, 12, OUTLINE).pxM(12, 13, OUTLINE);    // brows: calm, a little unsettling
      rigEyes(h, Q, 32, 9, 13, 4, () => { h.rectM(9, 13, 4, 2, '#3a2058'); h.rectM(10, 13, 2, 1, EYE); h.pxM(12, 14, '#3a2058'); });
      h.px(16, 15, Rim.s); h.px(16, 16, Rim.s);                                                 // the hint of a nose
    });
  },
  // Mindra grown into an ancient stone mask floating in a body of violet flame: cracked and weathered,
  // faded gold paint, eyes glowing violet-white, four carved stone tablets with glowing glyphs around it.
  stonicface(g, v = 'front') {
    const { St, StD, Fl, GOLD, CRACK, EYE, FLC } = STONICFACE;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const flame = cx => {   // a body of violet flame behind the mask, flaring up in tongues
      b.poly([[cx, 1], [cx + 4, 6], [cx + 8, 2], [cx + 9, 9], [cx + 13, 6], [cx + 13, 13], [cx + 15, 18], [cx + 14, 26], [cx + 15, 32], [cx + 10, 36], [cx + 5, 38],
        [cx, 41], [cx - 5, 38], [cx - 10, 36], [cx - 15, 32], [cx - 14, 26], [cx - 15, 18], [cx - 13, 13], [cx - 13, 6], [cx - 9, 9], [cx - 8, 2], [cx - 4, 6]], Fl);
      b.poly([[cx - 3, 4], [cx, 1], [cx + 3, 4], [cx + 1, 7]], FLC); b.poly([[cx + 9, 9], [cx + 13, 7], [cx + 12, 12]], FLC); b.poly([[cx - 9, 9], [cx - 13, 7], [cx - 12, 12]], FLC);
      t.poly([[cx - 4, 35], [cx, 43], [cx + 4, 35]], Fl);                                       // wisps trailing below
    };
    if (v === 'side') {
      flame(19);
      stoneTablet(earB, 6, 12, 1); stoneTablet(earB, 9, 27);
      h.ellipse(25, 21, 6.5, 14, St, { edge: true });                                          // the mask, side-on
      h.poly([[30, 18], [34, 25], [30, 26]], St, { edge: true });                              // its nose
      h.rect(27, 9, 1, 4, GOLD); h.rect(28, 23, 1, 5, GOLD); h.rect(25, 30, 1, 4, GOLD);
      h.px(24, 8, CRACK).px(25, 10, CRACK).px(24, 12, CRACK);
      h.rect(26, 16, 5, 1, StD.s);                                                             // carved brow
      rigEye(h, Q, 27, 18, () => { h.rect(27, 18, 4, 2, EYE); h.rect(28, 18, 2, 1, '#ffffff'); }, 4);
      h.rect(28, 29, 3, 1, CRACK);                                                             // closed lips
      stoneTablet(earA, 35, 10, 1); stoneTablet(earA, 34, 26);
      return;
    }
    if (v === 'back') {
      flame(22);
      stoneTablet(earA, 2, 14, 1); stoneTablet(earA, 5, 27); stoneTablet(earB, 36, 12, -1); stoneTablet(earB, 35, 26);
      h.ellipse(22, 21, 10.5, 14, StD, { edge: true });                                         // the back of the mask
      h.px(19, 10, CRACK).px(20, 13, CRACK).px(19, 16, CRACK).px(25, 26, CRACK).px(26, 29, CRACK);
      return;
    }
    flame(22);
    stoneTablet(earA, 2, 14, 1); stoneTablet(earA, 5, 27); stoneTablet(earB, 36, 12, -1); stoneTablet(earB, 35, 26);   // tablets circling it
    h.ellipse(22, 21, 10.5, 14, St, { edge: true });                                           // the stone mask
    h.rect(17, 9, 1, 4, GOLD); h.rect(26, 9, 1, 4, GOLD); h.rect(21, 8, 2, 3, GOLD);           // faded gold paint
    h.rect(14, 22, 1, 5, GOLD); h.rect(29, 22, 1, 5, GOLD); h.rect(21, 31, 2, 3, GOLD);
    h.px(24, 8, CRACK).px(25, 10, CRACK).px(25, 11, CRACK).px(24, 13, CRACK);                  // cracks
    h.px(15, 27, CRACK).px(16, 28, CRACK).px(16, 29, CRACK).px(17, 31, CRACK);
    h.rectM(14, 16, 6, 1, StD.s);                                                              // carved brows
    rigEyes(h, Q, 44, 15, 18, 5, () => { h.rectM(15, 18, 5, 2, EYE); h.rectM(16, 18, 3, 1, '#ffffff'); });   // glowing eyes
    h.rect(21, 20, 1, 6, St.l); h.rect(22, 21, 1, 5, St.s); h.px(20, 26, St.s).px(23, 26, St.s);   // nose
    h.rect(19, 29, 6, 1, CRACK); h.rect(20, 30, 4, 1, St.s);                                   // closed lips
  },
});
Object.assign(MONSTER_ART_DIAG, {
  gyroculus(g, v) {
    const { Br, BrD } = GYROCULUS;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    for (const [dx, y] of [[1, 22], [2.5, 24], [4.5, 25.5], [6.5, 26.5], [8.5, 27]]) t.ellipse(16 - dx, y, 1.3, 1.3, Br, { edge: true });   // bead tail, trailing
    t.poly([[5.5, 26], [7, 28], [5.5, 30], [4, 28]], Br, { edge: true });
    b.rect(15, 2, 2, 3, '#8a6020'); b.ellipse(16, 2, 1.6, 1.6, Br);
    brassRing(earB, 16, 14, 7, 12, c => c < 0);
    brassRing(earA, 16, 15, 13, 4.5, (c, s) => s < 0);
    h.ellipse(16, 15, 6.5, 6.5, Br, { edge: true });
    if (v === 'bside') {
      h.rect(10, 15, 13, 1, BrD.s); h.rect(14, 9, 1, 13, BrD.s);                               // riveted back
      h.px(22, 14, GYROCULUS.Iris.b).px(22, 15, GYROCULUS.Iris.b);                             // the eye just showing
    } else {
      h.ellipse(17.5, 15, 4.2, 4.8, BrD);
      gyroEye(h, Q, 18, 15, 3.4, 4);
    }
    brassRing(earB, 16, 14, 7, 12, c => c >= 0);
    brassRing(earA, 16, 15, 13, 4.5, (c, s) => s >= 0);
  },
  mindra(g, v) {
    const { Gl, Rim, Brain, FOLD, EYE } = MINDRA;
    const { Q, h, t, earA, earB } = rigParts(g, v);
    for (const [x, len, ph, d] of [[10, 10, 0, -1], [13, 11, 1, 1], [16, 10, 2, -1], [19, 11, 3, 1], [22, 9, 4, -1]]) tendril(t, x, 20, len, ph, d, -0.12);
    mindOrb(earA, 2, 11); mindOrb(earB, 27, 18);
    h.ellipse(17, 12, 10, 7.5, Gl, { edge: true });
    h.poly([[7, 16], [27, 16], [26, 20], [23, 19], [20, 21], [17, 19], [14, 21], [11, 19], [8, 20]], Rim, { edge: true });
    h.ellipse(16.5, 9, 6, 4.2, Brain, { edge: true });
    h.rect(17, 6, 1, 6, FOLD); h.px(14, 7, FOLD).px(13, 9, FOLD).px(15, 10, FOLD).px(20, 7, FOLD).px(21, 9, FOLD).px(19, 10, FOLD);
    h.px(10, 8, '#ffffff').px(11, 7, '#ffffff');
    if (v === 'bside') return;
    h.px(11, 12, OUTLINE).px(12, 12, OUTLINE).px(13, 13, OUTLINE);
    h.px(19, 13, OUTLINE).px(20, 12, OUTLINE).px(21, 12, OUTLINE).px(22, 12, OUTLINE);
    rigEye(h, Q, 11, 13, () => { h.rect(11, 13, 3, 2, '#3a2058'); h.rect(12, 13, 1, 1, EYE); }, 3);
    rigEye(h, Q, 19, 13, () => { h.rect(19, 13, 4, 2, '#3a2058'); h.rect(20, 13, 2, 1, EYE); }, 4);
    h.px(17, 15, Rim.s);
  },
  stonicface(g, v) {
    const { St, StD, Fl, GOLD, CRACK, EYE, FLC } = STONICFACE;
    const { Q, b, h, t, earA, earB } = rigParts(g, v);
    const cx = 21;
    b.poly([[cx, 1], [cx + 4, 6], [cx + 8, 2], [cx + 9, 9], [cx + 13, 6], [cx + 13, 13], [cx + 15, 18], [cx + 14, 26], [cx + 15, 32], [cx + 10, 36], [cx + 5, 38],
      [cx, 41], [cx - 5, 38], [cx - 10, 36], [cx - 15, 32], [cx - 14, 26], [cx - 15, 18], [cx - 13, 13], [cx - 13, 6], [cx - 9, 9], [cx - 8, 2], [cx - 4, 6]], Fl);
    b.poly([[cx - 3, 4], [cx, 1], [cx + 3, 4], [cx + 1, 7]], FLC);
    t.poly([[cx - 4, 35], [cx, 43], [cx + 4, 35]], Fl);
    stoneTablet(earA, 2, 14, 1); stoneTablet(earA, 4, 27); stoneTablet(earB, 36, 11, -1); stoneTablet(earB, 36, 26);
    if (v === 'bside') {
      h.ellipse(22, 21, 9.5, 14, StD, { edge: true });
      h.px(19, 10, CRACK).px(20, 13, CRACK).px(19, 16, CRACK);
      h.px(31, 20, St.b).px(31, 21, St.b).px(31, 22, St.b);                                    // the edge of its face, just showing
      return;
    }
    h.ellipse(23, 21, 9.5, 14, St, { edge: true });                                            // the mask, turned its way
    h.rect(19, 9, 1, 4, GOLD); h.rect(27, 9, 1, 4, GOLD); h.rect(23, 8, 2, 3, GOLD);
    h.rect(17, 22, 1, 4, GOLD); h.rect(30, 22, 1, 5, GOLD); h.rect(24, 31, 2, 3, GOLD);
    h.px(26, 8, CRACK).px(27, 10, CRACK).px(27, 11, CRACK).px(26, 13, CRACK);
    h.rect(16, 16, 5, 1, StD.s); h.rect(25, 16, 6, 1, StD.s);
    rigEye(h, Q, 17, 18, () => { h.rect(17, 18, 4, 2, EYE); h.rect(18, 18, 2, 1, '#ffffff'); }, 4);
    rigEye(h, Q, 25, 18, () => { h.rect(25, 18, 5, 2, EYE); h.rect(26, 18, 3, 1, '#ffffff'); }, 5);
    h.rect(23, 20, 1, 6, St.l); h.rect(24, 21, 1, 5, St.s); h.px(25, 26, St.s);
    h.rect(21, 29, 6, 1, CRACK); h.rect(22, 30, 4, 1, St.s);
  },
});
Object.assign(RIGGED, { gyroculus: 'floater', mindra: 'floater', stonicface: 'floater' });
