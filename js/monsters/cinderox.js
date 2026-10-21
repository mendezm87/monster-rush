// The cinderox family: cinderox, infernox. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.

// Shared by the family: a lava seam between rock plates, a line of glowing pixels with a hot middle.
function lavaSeam(p, pts, L = '#ff7a1c', G = '#ffd34a') {
  for (let i = 0; i < pts.length - 1; i++) {
    let [x0, y0] = pts[i]; const [x1, y1] = pts[i + 1], dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx - dy;
    for (;;) { p.px(x0, y0, L); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dy) { e += dx; y0 += sy; } }
  }
  const [mx, my] = pts[Math.floor(pts.length / 2)]; p.px(mx, my, G);
}
// Cinderox's colours (r96 redesign, the owner's pick C2): dark basalt with a warm tinge, obsidian horns.
const CINDEROX = {
  R: P('#5c5450', '#3a3330', '#7e756e'), Rd: P('#433c39', '#2c2624', '#5a524e'), M: P('#6e6560', '#4a423e', '#8a807a'),
  O: P('#2a2630', '#141218', '#6a6888'), F: P('#ff8a1c', '#e2401a', '#ffd34a'),
  L: '#ff7a1c', G: '#ffd34a', HOOF: '#241e1c', EYE: '#ffb020', HOT: '#fff2a8', TUFT: '#2e2826',
};
// The calf's parts, for any view: a leg (a block of rock with a dark hoof) and the flame on its forehead.
function cinderoxKit(h) {
  const C = CINDEROX;
  return {
    leg: (p, x, y, w, pal) => { p.poly([[x, y], [x + w, y], [x + w, 30], [x, 30]], pal, { edge: true }); p.rect(x, 29, w, 1, C.HOOF); },
    flame: (x, y = 8) => { h.poly([[x - 2, y], [x - 1.5, y - 4], [x, y - 2.5], [x + 0.5, y - 7], [x + 2, y - 3], [x + 2, y]], C.F); h.poly([[x - 1, y], [x, y - 3], [x + 1, y]], C.G); },
  };
}

// Infernox's colours (r96 redesign, the owner's pick I1): baked rust-red clay, firebrick, stone chimneys, black iron.
const INFERNOX = {
  K: P('#b4582e', '#7e3a1e', '#d47a4a'), Kd: P('#8e4424', '#5e2a14', '#a85a34'), Mz: P('#94452a', '#66301a', '#b4603c'),
  Bk: P('#9a4a2c', '#6a2e1a', '#bc6640'), Ch: P('#8a7a6a', '#5e5046', '#a89888'), I: P('#4a4a56', '#2a2a34', '#7a7a8a'),
  O: CINDEROX.O, L: CINDEROX.L, G: CINDEROX.G, EYE: CINDEROX.EYE, HOT: CINDEROX.HOT, TUFT: '#3a2a26',
};
// The kiln bull's parts: a pillar of a leg with a dark hoof, a block of firebrick (mortar rows,
// joints staggered, soot), a stone chimney, and the furnace door with its glowing grate.
function infernoxKit() {
  const C = INFERNOX, MORTAR = '#3e1e12', SOOT = '#3a2a26';
  return {
    leg: (p, x, y, w, pal) => { p.poly([[x, y], [x + w, y], [x + w, 42], [x, 42]], pal, { edge: true }); p.rect(x, 41, w, 1, CINDEROX.HOOF); },
    bricks: (p, pts, joints, x0, x1) => {
      p.poly(pts, C.Bk, { edge: true });
      const ys = pts.map(q => q[1]), top = Math.min(...ys), bot = Math.max(...ys);
      for (let y = top + 3, row = 0; y < bot - 1; y += 4, row++) {
        p.rect(x0 + 1, y, x1 - x0 - 1, 1, MORTAR);
        p.rect(joints[row % 2], y + 1, 1, 3, MORTAR);
      }
      p.px(x0 + 2, top + 2, SOOT).px(x0 + 3, top + 2, SOOT).px(x1 - 3, bot - 3, SOOT);
    },
    chimney: (p, x, y, w, yb) => {
      p.poly([[x, y + 1], [x + w, y + 1], [x + w, yb], [x, yb]], C.Ch, { edge: true });
      p.rect(x - 1, y, w + 2, 2, '#6e6054'); p.rect(x, y, w, 1, '#1e1614');            // rim and opening
      p.px(x + 1, y, '#ff8a1c'); p.px(x + w - 2, y, '#ffd34a');                          // embers in its mouth
      for (let yy = y + 5; yy < yb - 1; yy += 4) p.rect(x, yy, w, 1, '#4e4238');          // stone courses
    },
    furnace: (p, x, y, w, hgt) => {
      p.rect(x, y, w, hgt, '#2a2a34');                                                    // iron frame
      p.rect(x + 1, y + 1, w - 2, hgt - 2, '#ff8a1c');
      if (w > 4) p.rect(x + 2, y + 2, w - 4, hgt - 4, '#ffd34a');
      for (let xx = x + 2; xx < x + w - 1; xx += 2) p.rect(xx, y + 1, 1, hgt - 2, '#3a2a26');   // grate bars
      p.px(x, y + 1, '#7a7a8a'); p.px(x, y + hgt - 2, '#7a7a8a');                         // hinges
    },
  };
}

Object.assign(MONSTER_ART, {
  // A stocky calf of dark basalt in rough plates with lava glowing in the seams, stubby obsidian
  // horns, one small flame on its forehead and glowing eyes. Grows into Infernox, the kiln bull.
  cinderox(g, v = 'front') {
    const { R, Rd, M, O, L, G, EYE, HOT, TUFT } = CINDEROX;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const { leg, flame } = cinderoxKit(h);
    if (v === 'side') {
      t.poly([[4, 15], [1, 19], [1, 25], [2, 25], [3, 19], [5, 16]], R); t.ellipse(1.5, 25.5, 1.4, 2, TUFT);    // tail and tuft
      leg(legA, 5, 21, 3, Rd); leg(legB, 21, 21, 3, Rd);                                                           // far legs
      b.ellipse(13, 19, 10.5, 7, R, { edge: true });                                                                // body
      lavaSeam(b, [[5, 16], [8, 18], [8, 23]]); lavaSeam(b, [[8, 18], [13, 17], [15, 13]]); lavaSeam(b, [[13, 17], [13, 22], [15, 25]]); lavaSeam(b, [[13, 22], [19, 21]]);
      leg(legB, 8, 22, 4, R); leg(legA, 18, 22, 4, R);                                                              // near legs
      lavaSeam(legA, [[19, 25], [20, 27]]);
      earB.poly([[20, 10], [20, 6], [22, 4], [23, 5], [22, 8], [22, 10]], O);                                     // far horn
      h.poly([[20, 13], [15, 13], [16, 15], [20, 16]], R, { edge: true });                                          // ear
      h.ellipse(23, 14, 6.5, 5.5, R, { edge: true });                                                               // head
      h.ellipse(28, 17, 3.5, 2.6, M, { edge: true });                                                               // muzzle
      h.px(30, 16, OUTLINE);
      earA.poly([[23, 10], [24, 6], [27, 3], [28, 4], [26, 7], [26, 10]], O, { edge: true });                     // horn
      flame(25, 10);
      h.rect(22, 11, 4, 1, OUTLINE); h.px(26, 12, OUTLINE);                                                         // heavy brow
      rigEye(h, Q, 23, 12, () => { h.rect(23, 12, 3, 2, EYE); h.px(24, 12, HOT); }, 3);
      h.px(20, 17, L); h.px(21, 18, G);                                                                             // a crack on the cheek
      rigMouth(h, Q, 27, 19, 3);
      return;
    }
    if (v === 'back') {
      leg(legA, 8, 22, 5, R); leg(legB, 19, 22, 5, R);
      earA.poly([[10, 8], [6, 7], [3, 3], [4, 1], [7, 4], [11, 6]], O, { edge: true });                           // horns
      earB.poly([[22, 8], [26, 7], [29, 3], [28, 1], [25, 4], [21, 6]], O, { edge: true });
      h.polyM([[10, 11], [5, 12], [6, 14], [10, 13]], R, { edge: true });                                         // ears
      h.ellipse(16, 12, 7, 6, R, { edge: true });                                                                   // head, behind
      flame(16);
      b.ellipse(16, 20, 11, 7, R, { edge: true });                                                                  // body
      lavaSeam(b, [[16, 14], [16, 19], [14, 26]]); lavaSeam(b, [[16, 19], [19, 25]]); lavaSeam(b, [[8, 17], [11, 19], [16, 19]]); lavaSeam(b, [[16, 19], [21, 18], [24, 16]]); lavaSeam(b, [[11, 19], [9, 25]]);
      t.poly([[15, 19], [17, 19], [17, 26], [15, 26]], R); t.ellipse(16, 27, 1.8, 1.6, TUFT);                       // tail
      return;
    }
    leg(legA, 8, 22, 5, R); leg(legB, 19, 22, 5, R);                                                                // front legs
    lavaSeam(legA, [[9, 25], [11, 27]]); lavaSeam(legB, [[22, 25], [21, 27]]);
    b.ellipse(16, 20, 11, 7, R, { edge: true });                                                                    // body
    lavaSeam(b, [[7, 18], [10, 20], [9, 25]]); lavaSeam(b, [[25, 18], [22, 20], [23, 25]]); lavaSeam(b, [[10, 20], [13, 21], [19, 21], [22, 20]]); lavaSeam(b, [[13, 21], [14, 26]]); lavaSeam(b, [[19, 21], [18, 26]]);
    earA.poly([[10, 8], [6, 7], [3, 3], [4, 1], [7, 4], [11, 6]], O, { edge: true });                             // obsidian horns
    earB.poly([[22, 8], [26, 7], [29, 3], [28, 1], [25, 4], [21, 6]], O, { edge: true });
    h.polyM([[10, 11], [5, 12], [6, 14], [10, 13]], R, { edge: true });                                           // ears
    h.ellipse(16, 12, 7, 6, R, { edge: true });                                                                     // head
    h.ellipse(16, 16, 4.5, 2.6, M, { edge: true });                                                                 // muzzle
    h.pxM(14, 16, OUTLINE);                                                                                         // nostrils
    flame(16);
    h.pxM(10, 10, OUTLINE).pxM(11, 10, OUTLINE).pxM(12, 10, OUTLINE).pxM(13, 11, OUTLINE);                          // heavy brows
    rigEyes(h, Q, 32, 11, 11, 3, () => { h.rectM(11, 11, 3, 2, EYE); h.pxM(12, 11, HOT); h.pxM(13, 11, OUTLINE); });
    h.pxM(10, 14, L);                                                                                               // cracks on the cheeks
    rigMouth(h, Q, 15, 18, 2);
  },
  // Infernox (r96 redesign, the owner's pick I1): Cinderox grown into a walking furnace. A hide of
  // baked rust-red clay, shoulders of stacked firebrick, two stone chimneys on its back, a furnace
  // door in its chest glowing through the grate, great obsidian horns and an iron nose ring. The
  // calf's marks carry over: obsidian horns, glowing eyes, lava seams in its legs.
  infernox(g, v = 'front') {
    const { K, Kd, Mz, Bk, Ch, I, O, L, G, EYE, HOT, TUFT } = INFERNOX;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const { leg, bricks, chimney, furnace } = infernoxKit();
    if (v === 'side') {
      t.poly([[7, 24], [3, 28], [2, 34], [3, 34], [5, 29], [8, 26]], K); t.ellipse(2.5, 35, 1.6, 2, TUFT);           // tail and tuft
      leg(legA, 10, 32, 5, Kd); leg(legB, 29, 32, 5, Kd);                                                            // far legs
      chimney(b, 11, 9, 5, 24); chimney(b, 18, 7, 5, 24);                                                             // chimneys on its back
      b.ellipse(20, 30, 15, 9, K, { edge: true });                                                                    // body
      lavaSeam(b, [[9, 27], [12, 30], [11, 35]]); lavaSeam(b, [[16, 33], [20, 31]]);
      leg(legB, 7, 32, 6, K); leg(legA, 25, 32, 7, K);                                                                // near legs
      lavaSeam(legB, [[9, 34], [10, 38]]); lavaSeam(legA, [[27, 34], [29, 37], [28, 40]]);
      bricks(b, [[24, 21], [34, 20], [35, 31], [25, 32]], [23, 27], 24, 35);                                         // firebrick shoulder
      furnace(b, 34, 28, 4, 7);                                                                                       // the furnace door, side-on
      earB.poly([[31, 16], [31, 10], [33, 7], [34, 8], [33, 12], [33, 16]], O);                                      // far horn
      h.poly([[30, 19], [25, 19], [26, 21], [30, 22]], K, { edge: true });                                            // ear
      h.ellipse(35, 21, 7, 6.5, K, { edge: true });                                                                   // head, low and forward
      h.ellipse(39.5, 25, 3.5, 3, Mz, { edge: true });                                                                // muzzle
      h.px(42, 24, OUTLINE);
      earA.poly([[34, 16], [36, 10], [40, 6], [42, 7], [39, 11], [37, 16]], O, { edge: true });                      // horn
      h.rect(33, 18, 5, 1, OUTLINE); h.px(38, 19, OUTLINE);                                                           // heavy brow
      rigEye(h, Q, 34, 19, () => { h.rect(34, 19, 3, 2, EYE); h.px(35, 19, HOT); }, 3);
      rigMouth(h, Q, 37, 27, 3);
      h.ellipse(41, 29, 1.8, 1.5, I); h.px(41, 29, '#1e1614');                                                        // nose ring
      return;
    }
    if (v === 'back') {
      leg(legA, 8, 32, 8, K); leg(legB, 28, 32, 8, K);
      earA.poly([[16, 14], [8, 13], [3, 7], [2, 2], [5, 3], [7, 8], [16, 11]], O, { edge: true });                  // horns
      earB.poly([[28, 14], [36, 13], [41, 7], [42, 2], [39, 3], [37, 8], [28, 11]], O, { edge: true });
      h.polyM([[15, 17], [10, 18], [11, 20], [15, 19]], K, { edge: true });                                          // ears
      h.ellipse(22, 17, 8, 7, K, { edge: true });                                                                     // head, behind
      b.ellipse(22, 29, 15, 10, K, { edge: true });                                                                   // body
      lavaSeam(b, [[22, 22], [22, 30], [19, 37]]); lavaSeam(b, [[22, 30], [26, 36]]);
      bricks(b, [[3, 19], [15, 17], [16, 29], [4, 31]], [5, 14], 4, 16); bricks(b, [[41, 19], [29, 17], [28, 29], [40, 31]], [30, 39], 28, 40);
      chimney(b, 13, 8, 5, 25); chimney(b, 26, 8, 5, 25);                                                             // chimneys, in front of the head
      t.poly([[21, 30], [23, 30], [23, 38], [21, 38]], K); t.ellipse(22, 39, 1.8, 1.6, TUFT);                        // tail
      return;
    }
    chimney(b, 9, 6, 5, 20); chimney(b, 30, 6, 5, 20);                                                                // chimneys behind the shoulders
    b.ellipse(22, 27, 15, 8.5, K, { edge: true });                                                                    // body
    leg(legA, 6, 29, 10, K); leg(legB, 28, 29, 10, K);                                                                // forelegs, thick as pillars
    lavaSeam(legA, [[8, 31], [11, 34], [10, 39]]); lavaSeam(legA, [[11, 34], [15, 36]]);
    lavaSeam(legB, [[36, 31], [33, 34], [34, 39]]); lavaSeam(legB, [[33, 34], [29, 36]]);
    bricks(b, [[2, 21], [5, 18], [15, 17], [16, 28], [3, 30]], [5, 14], 3, 16); bricks(b, [[42, 21], [39, 18], [29, 17], [28, 28], [41, 30]], [30, 39], 28, 41);
    furnace(b, 17, 29, 11, 8);                                                                                        // the furnace door in its chest
    earA.poly([[16, 14], [8, 13], [3, 7], [2, 2], [5, 3], [7, 8], [16, 11]], O, { edge: true });                    // great obsidian horns
    earB.poly([[28, 14], [36, 13], [41, 7], [42, 2], [39, 3], [37, 8], [28, 11]], O, { edge: true });
    h.polyM([[15, 17], [10, 18], [11, 20], [15, 19]], K, { edge: true });                                            // ears
    h.ellipse(22, 18, 9, 7.5, K, { edge: true });                                                                     // head
    h.ellipse(22, 23.5, 6, 3.4, Mz, { edge: true });                                                                  // muzzle
    h.rect(19, 23, 2, 1, OUTLINE); h.rect(24, 23, 2, 1, OUTLINE);                                                     // nostrils
    h.rectM(15, 16, 4, 1, OUTLINE); h.pxM(19, 17, OUTLINE);                                                           // heavy brows
    rigEyes(h, Q, 44, 16, 17, 3, () => { h.rectM(16, 17, 3, 2, EYE); h.pxM(17, 17, HOT); h.pxM(18, 17, OUTLINE); });
    rigMouth(h, Q, 20, 25, 4);
    h.ellipse(22, 27.5, 2.4, 1.8, I); h.px(22, 27, '#1e1614').px(22, 28, '#1e1614');                                 // iron nose ring
    h.pxM(16, 21, L);                                                                                                 // cracks on the cheeks
  },
});
Object.assign(MONSTER_ART_DIAG, {
  cinderox(g, v) {
    const { R, Rd, M, O, L, EYE, HOT, TUFT } = CINDEROX;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const { leg, flame } = cinderoxKit(h);
    if (v === 'bside') {
      leg(legA, 6, 22, 4, R); leg(legB, 17, 22, 4, R);
      earB.poly([[13, 8], [9, 7], [7, 3], [8, 2], [10, 5], [14, 6]], O, { edge: true });                          // horns
      earA.poly([[24, 8], [28, 7], [30, 3], [29, 1], [27, 4], [23, 6]], O, { edge: true });
      h.poly([[13, 11], [8, 12], [9, 14], [13, 13]], R, { edge: true }); h.poly([[25, 11], [29, 12], [28, 14], [25, 13]], R, { edge: true });
      h.ellipse(19, 12, 7, 6, R, { edge: true });                                                                   // head, behind
      h.ellipse(25.5, 15, 1.6, 1.4, M);                                                                             // muzzle peeking out
      flame(19);
      b.ellipse(15, 20, 11, 7, R, { edge: true });                                                                  // body
      lavaSeam(b, [[15, 14], [15, 19], [13, 26]]); lavaSeam(b, [[15, 19], [18, 25]]); lavaSeam(b, [[7, 17], [10, 19], [15, 19]]); lavaSeam(b, [[15, 19], [20, 18], [23, 16]]);
      t.poly([[11, 19], [13, 19], [13, 26], [11, 26]], R); t.ellipse(12, 27, 1.8, 1.6, TUFT);                       // tail
      return;
    }
    t.poly([[6, 16], [2, 19], [2, 25], [3, 25], [4, 19], [7, 18]], R); t.ellipse(2.5, 25.5, 1.4, 2, TUFT);         // tail
    leg(legB, 6, 21, 3, Rd); leg(legA, 13, 22, 3, Rd);                                                              // back legs
    b.ellipse(15, 20, 11, 7, R, { edge: true });                                                                    // body
    lavaSeam(b, [[6, 16], [9, 18], [8, 24]]); lavaSeam(b, [[9, 18], [14, 19], [19, 18], [23, 16]]); lavaSeam(b, [[14, 19], [14, 25]]);
    leg(legA, 9, 22, 4, R); leg(legB, 20, 22, 5, R);                                                                // front legs
    lavaSeam(legB, [[22, 25], [21, 27]]);
    earB.poly([[13, 8], [10, 7], [8, 4], [9, 3], [11, 5], [14, 6]], O, { edge: true });                           // far horn, smaller
    earA.poly([[25, 8], [29, 7], [31, 3], [30, 1], [28, 4], [24, 6]], O, { edge: true });                         // near horn
    h.poly([[13, 11], [9, 12], [10, 14], [13, 13]], R, { edge: true }); h.poly([[25, 11], [30, 12], [29, 14], [25, 13]], R, { edge: true });
    h.ellipse(19, 12, 7, 6, R, { edge: true });                                                                     // head
    h.ellipse(21, 16, 4.5, 2.6, M, { edge: true });                                                                 // muzzle, turned its way
    h.px(19, 16, OUTLINE).px(23, 16, OUTLINE);
    flame(19);
    h.px(13, 10, OUTLINE).px(14, 10, OUTLINE).px(15, 11, OUTLINE);                                                 // brows
    h.px(20, 11, OUTLINE).px(21, 10, OUTLINE).px(22, 10, OUTLINE).px(23, 10, OUTLINE);
    rigEye(h, Q, 14, 11, () => { h.rect(14, 11, 2, 2, EYE); h.px(15, 11, OUTLINE); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 3, 2, EYE); h.px(22, 11, HOT); h.px(21, 11, OUTLINE); }, 3);
    h.px(25, 14, L);
    rigMouth(h, Q, 20, 18, 3);
  },
  infernox(g, v) {
    const { K, Kd, Mz, I, O, L, EYE, HOT, TUFT } = INFERNOX;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const { leg, bricks, chimney, furnace } = infernoxKit();
    if (v === 'bside') {
      leg(legA, 6, 32, 7, K); leg(legB, 25, 32, 7, K);
      earB.poly([[19, 14], [12, 13], [8, 8], [7, 3], [10, 4], [12, 9], [19, 11]], O, { edge: true });              // horns
      earA.poly([[31, 14], [38, 13], [42, 7], [43, 2], [40, 3], [38, 8], [31, 11]], O, { edge: true });
      h.poly([[18, 17], [13, 18], [14, 20], [18, 19]], K, { edge: true }); h.poly([[32, 17], [37, 18], [36, 20], [32, 19]], K, { edge: true });
      h.ellipse(25, 17, 8, 7, K, { edge: true });                                                                     // head, behind
      h.ellipse(32.5, 21, 1.8, 1.6, Mz);                                                                              // muzzle peeking out
      b.ellipse(20, 29, 15, 10, K, { edge: true });                                                                   // body
      lavaSeam(b, [[20, 22], [20, 30], [17, 37]]); lavaSeam(b, [[20, 30], [24, 36]]);
      bricks(b, [[2, 20], [13, 18], [14, 29], [3, 31]], [4, 12], 3, 14); bricks(b, [[38, 19], [28, 17], [27, 29], [37, 30]], [29, 35], 27, 37);
      chimney(b, 12, 8, 5, 25); chimney(b, 24, 8, 5, 25);
      t.poly([[15, 30], [17, 30], [17, 38], [15, 38]], K); t.ellipse(16, 39, 1.8, 1.6, TUFT);                        // tail
      return;
    }
    t.poly([[7, 24], [3, 28], [2, 34], [3, 34], [5, 29], [8, 26]], K); t.ellipse(2.5, 35, 1.6, 2, TUFT);             // tail
    chimney(b, 7, 8, 5, 22); chimney(b, 25, 6, 5, 20);                                                                // chimneys
    leg(legB, 8, 31, 6, Kd); leg(legA, 15, 32, 6, Kd);                                                                // back legs
    b.ellipse(21, 27, 15, 8.5, K, { edge: true });                                                                    // body
    lavaSeam(b, [[8, 25], [11, 28], [10, 33]]);
    leg(legA, 11, 31, 8, K); leg(legB, 29, 31, 9, K);                                                                 // forelegs
    lavaSeam(legA, [[13, 33], [15, 36], [14, 39]]); lavaSeam(legB, [[35, 33], [33, 36], [34, 39]]);
    bricks(b, [[5, 20], [15, 18], [16, 29], [6, 31]], [7, 13], 6, 16); bricks(b, [[42, 19], [32, 17], [31, 29], [41, 31]], [33, 39], 31, 41);
    furnace(b, 21, 28, 10, 8);                                                                                        // the furnace door, turned its way
    earB.poly([[19, 14], [13, 13], [9, 8], [8, 4], [11, 5], [12, 9], [19, 11]], O, { edge: true });                 // far horn, smaller
    earA.poly([[31, 14], [39, 13], [43, 7], [43, 2], [41, 3], [39, 8], [31, 11]], O, { edge: true });               // near horn
    h.poly([[18, 17], [14, 18], [15, 20], [18, 19]], K, { edge: true }); h.poly([[32, 17], [38, 18], [37, 20], [32, 19]], K, { edge: true });
    h.ellipse(25, 18, 9, 7.5, K, { edge: true });                                                                     // head
    h.ellipse(27, 23.5, 6, 3.4, Mz, { edge: true });                                                                  // muzzle, turned its way
    h.rect(24, 23, 2, 1, OUTLINE); h.rect(29, 23, 2, 1, OUTLINE);                                                     // nostrils
    h.rect(18, 16, 4, 1, OUTLINE); h.px(22, 17, OUTLINE); h.px(25, 17, OUTLINE); h.rect(26, 16, 5, 1, OUTLINE);       // heavy brows
    rigEye(h, Q, 19, 17, () => { h.rect(19, 17, 3, 2, EYE); h.px(21, 17, OUTLINE); });
    rigEye(h, Q, 26, 17, () => { h.rect(26, 17, 3, 2, EYE); h.px(27, 17, HOT); h.px(26, 17, OUTLINE); }, 3);
    rigMouth(h, Q, 25, 25, 4);
    h.ellipse(27, 27.5, 2.4, 1.8, I); h.px(27, 27, '#1e1614').px(27, 28, '#1e1614');                                 // iron nose ring
    h.px(32, 21, L);
  },
});
Object.assign(RIGGED, { cinderox: 'quad', infernox: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  cinderox: { fps: 5, every: 8, frames: [{ legs: [2, 0] }, { body: 1 }, { legs: [2, 0], head: [1, 0] }, { body: 1, mouth: 'open' }, { }] },   // stamps a hoof and snorts
  infernox: { fps: 5, every: 10, frames: [{ legs: [2, 0], body: 1 }, { body: 1 }, { head: [1, -1], mouth: 'roar' }, { head: [1, -1], mouth: 'roar' }, { }] },   // stamps, then roars
});
