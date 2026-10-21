// Sparkit: sparkit. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  // Sparkit, redrawn (r48) from the owner's pick: a scrappy teal ferret ("kit" = a baby ferret) in a
  // fighting stance, fists up, cream belly, a dark bandit mask over sharp violet eyes, a scar, a spiky
  // white static crest, and a long tail rising to a crackling copper plug.
  sparkit(g, v = 'front') {
    const T = P('#3fb8a8', '#25857a', '#7ae0d0'), C = P('#f4ecd6', '#d6c8a4', '#ffffff'), W = P('#f4fbff', '#b8d0d4', '#ffffff');
    const Cu = P('#e08a3a', '#a85a1e', '#ffc07a'), MASK = '#1e4a46', EYE = '#c8b0ff', SCAR = '#f0d0c8', PINK = '#f0a0a8';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const plug = (x, y) => { t.rect(x, y, 5, 4, Cu.b); t.rect(x, y + 3, 5, 1, Cu.s); t.rect(x, y - 3, 1, 3, '#ffd08a'); t.rect(x + 3, y - 3, 1, 3, '#ffd08a'); t.px(x + 1, y - 4, '#bff6ff'); t.px(x + 4, y - 5, '#bff6ff'); };
    // one smooth tapering tail along a curve (w0 thick at the base, w1 at the tip)
    const tail = (pts, w0 = 2.2, w1 = 1.3) => {
      const L = [], R = [];
      pts.forEach(([x, y], i) => {
        const [ax, ay] = pts[Math.max(i - 1, 0)], [bx, by] = pts[Math.min(i + 1, pts.length - 1)], d = Math.hypot(bx - ax, by - ay) || 1;
        const w = w0 + (w1 - w0) * i / (pts.length - 1), nx = -(by - ay) / d * w, ny = (bx - ax) / d * w;
        L.push([x + nx, y + ny]); R.push([x - nx, y - ny]);
      });
      t.poly([...L, ...R.reverse()], T, { edge: true });
    };
    if (v === 'side') {
      tail([[9, 25], [7, 21], [6.3, 17], [6.5, 13]]);                                            // tail curving up behind
      plug(4, 9);
      legB.ellipse(13, 27.5, 2.2, 2.6, T.s); legB.ellipse(13.5, 30, 2.4, 1.2, T.s);
      b.ellipse(15, 21, 5, 6.5, T, { edge: true });
      b.ellipse(17.5, 22, 2.4, 4.6, C);                                                          // cream belly
      legA.ellipse(17, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(18, 30, 2.6, 1.2, T, { edge: true });
      armB.ellipse(19, 16.5, 1.7, 1.9, T.s);
      earA.ellipse(14.5, 7, 1.8, 2, T, { edge: true }); earA.px(14, 7, PINK);
      h.ellipse(18, 11, 5.5, 4.5, T, { edge: true });
      h.ellipse(23, 12.5, 3, 2, T, { edge: true }); h.ellipse(23.5, 13.5, 2.3, 1.2, C);          // long snout
      h.poly([[17, 9], [25, 10], [25, 12], [17, 12]], MASK);                                       // bandit mask
      h.poly([[12, 8], [12, 2], [14, 5], [15, 0], [17, 5], [19, 2], [20, 8]], W, { edge: true }); // spiky static crest
      rigEye(h, Q, 20, 10, () => { h.rect(20, 10, 2, 2, EYE); h.px(21, 11, DARK_EYE); h.px(20, 10, '#ffffff'); });
      h.px(19, 9, OUTLINE).px(20, 9, OUTLINE).px(21, 9, OUTLINE);                                 // fierce brow
      h.rect(26, 12, 1, 1, OUTLINE);                                                             // nose
      rigMouth(h, Q, 22, 14, 2, () => h.px(23, 14, OUTLINE).px(24, 14, OUTLINE));
      armA.ellipse(21, 17.5, 2, 2.2, T, { edge: true });                                         // fist up
      return;
    }
    if (v === 'back') {
      legA.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legB.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
      legA.ellipse(12.5, 30, 2.4, 1.2, T.s); legB.ellipse(19.5, 30, 2.4, 1.2, T.s);
      b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });
      armA.ellipse(10.5, 18.5, 2, 2.2, T, { edge: true }); armB.ellipse(21.5, 18.5, 2, 2.2, T, { edge: true });
      earA.ellipse(10.5, 6.5, 2, 2, T, { edge: true }); earB.ellipse(21.5, 6.5, 2, 2, T, { edge: true });
      h.ellipse(16, 11, 6.5, 5, T, { edge: true });
      h.poly([[10, 8], [11, 1], [13, 5], [16, 0], [19, 5], [21, 1], [22, 8]], W, { edge: true });
      tail([[12.5, 25.5], [9, 23], [6.8, 19], [6, 15], [5.8, 12]]);                              // tail curling up to one side
      plug(3, 8);
      return;
    }
    tail([[20.5, 25.5], [24, 22.5], [25.6, 18.5], [26, 15], [25.6, 12]]);                       // tail behind
    plug(23, 8);                                                                                 // the crackling plug
    legA.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legB.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
    legA.ellipse(12, 30, 2.6, 1.2, T, { edge: true }); legB.ellipse(20, 30, 2.6, 1.2, T, { edge: true });   // feet
    b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });                                              // body
    b.ellipse(16, 22.5, 3.4, 5, C);                                                              // cream belly
    armA.ellipse(11, 18.5, 2, 2.2, T, { edge: true }); armB.ellipse(21, 18.5, 2, 2.2, T, { edge: true });   // fists up
    earA.ellipse(10.5, 6.5, 2, 2, T, { edge: true }); earB.ellipse(21.5, 6.5, 2, 2, T, { edge: true });
    earA.px(10, 6, PINK); earB.px(21, 6, PINK);
    h.ellipse(16, 11, 6.5, 5, T, { edge: true });                                                // head
    h.ellipse(16, 14, 2.8, 1.8, C);                                                              // muzzle
    h.polyM([[9, 9], [15, 10], [15, 13], [10, 13]], MASK);                                       // bandit mask
    h.poly([[10, 8], [11, 1], [13, 5], [16, 0], [19, 5], [21, 1], [22, 8]], W, { edge: true });  // spiky static crest
    rigEyes(h, Q, 32, 12, 10, 2, () => { h.rectM(12, 10, 2, 2, EYE); h.pxM(13, 11, DARK_EYE); h.pxM(12, 10, '#ffffff'); });
    h.pxM(11, 9, OUTLINE).pxM(12, 9, OUTLINE).pxM(13, 10, OUTLINE);                              // fierce brows
    h.px(19, 9, SCAR).px(20, 10, SCAR).px(19, 11, SCAR);                                         // scar
    h.px(15, 13, OUTLINE).px(16, 13, OUTLINE);                                                   // nose
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  sparkit(g, v) {
    const T = P('#3fb8a8', '#25857a', '#7ae0d0'), C = P('#f4ecd6', '#d6c8a4', '#ffffff'), W = P('#f4fbff', '#b8d0d4', '#ffffff');
    const Cu = P('#e08a3a', '#a85a1e', '#ffc07a'), MASK = '#1e4a46', EYE = '#c8b0ff', SCAR = '#f0d0c8', PINK = '#f0a0a8';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const plug = (x, y) => { t.rect(x, y, 5, 4, Cu.b); t.rect(x, y + 3, 5, 1, Cu.s); t.rect(x, y - 3, 1, 3, '#ffd08a'); t.rect(x + 3, y - 3, 1, 3, '#ffd08a'); t.px(x + 1, y - 4, '#bff6ff'); t.px(x + 4, y - 5, '#bff6ff'); };
    // one smooth tapering tail along a curve (w0 thick at the base, w1 at the tip)
    const tail = (pts, w0 = 2.2, w1 = 1.3) => {
      const L = [], R = [];
      pts.forEach(([x, y], i) => {
        const [ax, ay] = pts[Math.max(i - 1, 0)], [bx, by] = pts[Math.min(i + 1, pts.length - 1)], d = Math.hypot(bx - ax, by - ay) || 1;
        const w = w0 + (w1 - w0) * i / (pts.length - 1), nx = -(by - ay) / d * w, ny = (bx - ax) / d * w;
        L.push([x + nx, y + ny]); R.push([x - nx, y - ny]);
      });
      t.poly([...L, ...R.reverse()], T, { edge: true });
    };
    const crest = () => h.poly([[11, 8], [12, 1], [14, 5], [17, 0], [20, 5], [22, 1], [23, 8]], W, { edge: true });
    if (v === 'bside') {
      legB.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(19.5, 27.5, 2, 2.4, T, { edge: true });
      legB.ellipse(12.5, 30, 2.4, 1.2, T.s); legA.ellipse(19.5, 30, 2.2, 1.1, T.s);
      b.ellipse(16, 21, 5.5, 6.5, T, { edge: true });
      armB.ellipse(10.5, 18.5, 2, 2.2, T, { edge: true }); armA.ellipse(22, 18, 1.8, 2, T, { edge: true });
      earB.ellipse(11.5, 6.5, 2, 2, T, { edge: true }); earA.ellipse(22.5, 6.5, 1.8, 2, T, { edge: true });
      h.ellipse(17, 11, 6.5, 5, T, { edge: true });
      h.ellipse(23.5, 12.5, 1.4, 1.4, T, { edge: true });                                       // snout peeking out
      crest();
      tail([[11.5, 25.5], [8, 22.5], [5.8, 18.5], [5, 15], [4.8, 12]]);
      plug(2, 8);
      return;
    }
    tail([[10.5, 25], [8, 21], [6.6, 17], [6.5, 13]]);                                          // tail behind, on the left
    plug(4, 9);
    legB.ellipse(12.5, 27.5, 2.2, 2.6, T, { edge: true }); legA.ellipse(19.5, 27.5, 2.2, 2.6, T, { edge: true });
    legB.ellipse(12, 30, 2.4, 1.2, T, { edge: true }); legA.ellipse(20.5, 30, 2.6, 1.2, T, { edge: true });
    b.ellipse(15.5, 21, 5.5, 6.5, T, { edge: true });
    b.ellipse(17, 22.5, 3.2, 5, C);
    armB.ellipse(11, 18.5, 1.8, 2, T, { edge: true }); armA.ellipse(21.5, 18, 2, 2.2, T, { edge: true });
    earB.ellipse(11.5, 6.5, 1.8, 2, T, { edge: true }); earA.ellipse(22.5, 6.5, 2, 2, T, { edge: true });
    earB.px(11, 6, PINK); earA.px(22, 6, PINK);
    h.ellipse(17, 11, 6.5, 5, T, { edge: true });
    h.ellipse(19.5, 14, 2.8, 1.8, C);                                                            // muzzle, turned its way
    h.poly([[10, 9], [25, 10], [25, 13], [11, 13]], MASK);
    crest();
    rigEye(h, Q, 13, 10, () => { h.rect(13, 10, 2, 2, EYE); h.px(14, 11, DARK_EYE); h.px(13, 10, '#ffffff'); });
    rigEye(h, Q, 21, 10, () => { h.rect(21, 10, 2, 2, EYE); h.px(22, 11, DARK_EYE); h.px(21, 10, '#ffffff'); });
    h.px(12, 9, OUTLINE).px(13, 9, OUTLINE).px(14, 10, OUTLINE); h.px(23, 9, OUTLINE).px(22, 9, OUTLINE).px(21, 10, OUTLINE);   // fierce brows
    h.px(23, 10, SCAR).px(24, 11, SCAR).px(23, 12, SCAR);                                        // scar
    h.px(20, 13, OUTLINE).px(21, 13, OUTLINE);
    rigMouth(h, Q, 19, 15, 2, () => h.px(19, 15, OUTLINE).px(20, 15, OUTLINE));
  },
});
Object.assign(RIGGED, { sparkit: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  sparkit: { fps: 5, every: 8, frames: [{ arms: [2, 0] }, { arms: [3, 0], head: [0, -1], eyes: 'blink' }, { arms: [2, 0], head: [0, 1] }, { arms: [3, 0], eyes: 'blink' }, { }] },   // scratches behind its ear
});
