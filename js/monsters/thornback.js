// Thornback: thornback. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r131 (it read as Turtwig / Grotle): a thorny-devil lizard of the dry hills, low and wide,
// sandy ochre with dark mottles, its back studded with thorny spikes, a rose vine growing along its spine
// with buds and two blooms, a horned crest over each eye (they ride the ears), a long spiky tail. Colours in THORN.
const THORN = { SAND: P('#d8a860', '#a87838', '#f0c888'), MOTTLE: '#8a5a2a', SPIKE: P('#9a5a2a', '#6a3a1a', '#c8844a'),
  VINE: '#3e8a2e', VINEL: '#6ab84a', ROSE: P('#e04868', '#a02848', '#ff8aa0'), BUD: '#c83858', EYE: '#2a1a10' };

// thorns: little cones sticking up from (x, y), tall pointing up (or leaning by dx)
function thornRow(p, pts, tall = 4) { for (const [x, y, dx = 0] of pts) p.poly([[x - 1.7, y + 1], [x + 1.7, y + 1], [x + dx * 1.5, y - tall]], THORN.SPIKE, { edge: true }); }
// the dark saddle markings a thorny devil has across its back
function thornSaddle(p, pts) { for (const [x, y] of pts) p.rect(x, y, 3, 1, THORN.MOTTLE).px(x + 1, y + 1, THORN.MOTTLE); }

Object.assign(MONSTER_ART, {
  thornback(g, v = 'front') {
    const { SAND, MOTTLE, SPIKE, VINE, VINEL, ROSE, BUD, EYE } = THORN;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.poly([[8, 21], [12, 20], [12, 25], [5, 24], [1, 22.5]], SAND, { edge: true });             // long spiky tail
      thornRow(t, [[4, 22, -1], [7, 21, -1], [10, 20]], 2);
      legB.ellipse(10, 27, 2, 1.8, SAND.s, { edge: true }); legB.ellipse(21, 27, 2, 1.8, SAND.s, { edge: true });   // far legs
      b.ellipse(16, 22, 9, 5, SAND, { edge: true });                                              // low wide body
      thornSaddle(b, [[10, 20], [15, 19], [20, 20]]); b.px(13, 24, MOTTLE).px(19, 24, MOTTLE);
      thornRow(b, [[9, 17.5, -1], [12, 17], [15, 16.5], [18, 16.5], [21, 17.5, 1]]);                // thorns along its back
      for (let x = 9; x <= 22; x++) b.px(x, x % 3 ? 18 : 17, VINE);                               // the rose vine along its spine
      b.ellipse(13, 16, 2, 1.8, ROSE); b.px(12, 15, ROSE.l); b.px(19, 16, BUD).px(10, 17, BUD).px(16, 16, VINEL);
      legA.ellipse(12, 27.5, 2.2, 1.8, SAND, { edge: true }); legA.ellipse(22, 27.5, 2.2, 1.8, SAND, { edge: true });
      h.ellipse(25, 20, 5, 3.4, SAND, { edge: true });                                            // flat wide lizard head
      earA.poly([[22, 17.5], [20.5, 12.5], [24.5, 16.5]], SPIKE, { edge: true });                 // horned crest over its eye
      rigEye(h, Q, 25, 19, () => { h.rect(25, 19, 2, 1, EYE); h.px(25, 18, SAND.s); }, 2);
      rigMouth(h, Q, 26, 22, 3, () => { h.rect(26, 22, 4, 1, SAND.s); });
      h.px(28, 21, MOTTLE);
      return;
    }
    if (v === 'back') {
      legA.ellipse(8, 26, 2.4, 2, SAND, { edge: true }); legB.ellipse(24, 26, 2.4, 2, SAND, { edge: true });
      h.ellipse(16, 15, 5, 3.4, SAND, { edge: true });
      earA.poly([[12, 14], [10.5, 9], [14.5, 13]], SPIKE, { edge: true }); earB.poly([[20, 14], [21.5, 9], [17.5, 13]], SPIKE, { edge: true });
      b.ellipse(16, 21, 10, 6, SAND, { edge: true });
      thornSaddle(b, [[9, 19], [20, 19], [11, 23], [18, 23]]);
      thornRow(b, [[7, 18, -1], [10, 16], [13, 15.5], [19, 15.5], [22, 16], [25, 18, 1]]);
      for (let y = 16; y <= 26; y++) b.px(16 + (y % 3 ? 0 : 1), y, VINE);                         // the rose vine down its spine
      b.ellipse(16, 19, 1.8, 1.6, ROSE); b.px(16, 18, ROSE.l); b.ellipse(17, 24, 1.4, 1.3, ROSE); b.px(15, 22, BUD).px(17, 16, VINEL);
      t.poly([[13, 25], [19, 25], [17, 31], [15, 31]], SAND, { edge: true });                      // its tail, toward you
      thornRow(t, [[16, 28], [16, 31]], 2);
      return;
    }
    t.poly([[22, 21], [27, 19], [30, 16], [29, 21], [24, 24]], SAND, { edge: true });              // tail curving out behind
    thornRow(t, [[27, 18.5, 1], [29.5, 16, 1]], 2);
    b.ellipse(16, 19, 10.5, 5.5, SAND, { edge: true });                                             // low wide body
    thornSaddle(b, [[8, 18], [21, 18], [14, 16]]);
    thornRow(b, [[7, 16, -1], [10, 14.5], [13, 14], [19, 14], [22, 14.5], [25, 16, 1]]);            // thorns studding its back
    for (let x = 8; x <= 24; x++) b.px(x, x % 3 ? 15 : 16, VINE);                                  // the rose vine across its back
    b.ellipse(11, 15, 2, 1.8, ROSE); b.px(10, 14, ROSE.l); b.ellipse(21, 15, 1.8, 1.6, ROSE); b.px(21, 14, ROSE.l); b.px(16, 15, BUD).px(18, 16, VINEL);
    legA.ellipse(8, 25, 2.6, 2.2, SAND, { edge: true }); legB.ellipse(24, 25, 2.6, 2.2, SAND, { edge: true });   // splayed front legs
    legA.px(6, 26, SAND.s).px(8, 27, SAND.s); legB.px(26, 26, SAND.s).px(24, 27, SAND.s);
    h.ellipse(16, 22.5, 6, 3.8, SAND, { edge: true });                                             // flat wide lizard head, low in front
    earA.poly([[11, 21], [8.5, 14.5], [14, 20]], SPIKE, { edge: true }); earB.poly([[21, 21], [23.5, 14.5], [18, 20]], SPIKE, { edge: true });   // horned crests
    rigEyes(h, Q, 32, 12, 21, 2, () => { h.rectM(12, 21, 2, 1, EYE); h.pxM(13, 20, SAND.s); });
    rigMouth(h, Q, 13, 24, 6, () => { h.rect(13, 24, 6, 1, SAND.s); });
    h.px(15, 22, MOTTLE).px(17, 23, MOTTLE);
  },
});
Object.assign(MONSTER_ART_DIAG, {
  thornback(g, v) {   // turned a little right
    const { SAND, MOTTLE, SPIKE, VINE, VINEL, ROSE, BUD, EYE } = THORN;
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'bside') {
      legA.ellipse(8, 26, 2.4, 2, SAND, { edge: true }); legB.ellipse(23, 26.5, 2.2, 1.8, SAND, { edge: true });
      h.ellipse(19, 15.5, 5, 3.4, SAND, { edge: true });
      earA.poly([[15, 14.5], [14, 10.5], [17, 13.5]], SPIKE, { edge: true }); earB.poly([[23, 14.5], [24, 10.5], [21, 13.5]], SPIKE, { edge: true });
      b.ellipse(15, 21, 10, 6, SAND, { edge: true });
      thornSaddle(b, [[9, 19], [18, 19], [11, 23]]);
      thornRow(b, [[6, 18, -1], [9, 16], [12, 15.5], [18, 15.5], [21, 16], [24, 18, 1]]);
      for (let y = 16; y <= 26; y++) b.px(15 + (y % 3 ? 0 : 1), y, VINE);
      b.ellipse(15, 19, 1.8, 1.6, ROSE); b.px(15, 18, ROSE.l); b.px(14, 22, BUD).px(16, 16, VINEL);
      t.poly([[10, 24], [15, 25], [9, 30], [6, 29]], SAND, { edge: true }); thornRow(t, [[10, 27]], 2);
      return;
    }
    t.poly([[8, 21], [12, 20], [6, 17], [3, 18], [5, 22]], SAND, { edge: true }); thornRow(t, [[5, 18, -1], [8, 19]], 2);
    b.ellipse(15, 19, 10.5, 5.5, SAND, { edge: true });
    thornSaddle(b, [[7, 18], [19, 18], [13, 16]]);
    thornRow(b, [[6, 16, -1], [9, 14.5], [12, 14], [18, 14], [21, 14.5], [24, 16, 1]]);
    for (let x = 7; x <= 23; x++) b.px(x, x % 3 ? 15 : 16, VINE);
    b.ellipse(10, 15, 2, 1.8, ROSE); b.px(9, 14, ROSE.l); b.ellipse(20, 15, 1.8, 1.6, ROSE); b.px(15, 15, BUD);
    legA.ellipse(9, 25, 2.6, 2.2, SAND, { edge: true }); legB.ellipse(25, 25, 2.4, 2, SAND, { edge: true });
    h.ellipse(18.5, 22.5, 6, 3.8, SAND, { edge: true });
    earA.poly([[14, 21], [12, 15.5], [16.5, 20]], SPIKE, { edge: true }); earB.poly([[22.5, 21], [24.5, 16], [20.5, 20]], SPIKE, { edge: true });
    rigEye(h, Q, 15, 21, () => { h.rect(15, 21, 2, 1, EYE); h.px(16, 20, SAND.s); }, 2);
    rigEye(h, Q, 21, 21, () => { h.rect(21, 21, 2, 1, EYE); h.px(21, 20, SAND.s); }, 2);
    rigMouth(h, Q, 16, 24, 6, () => { h.rect(16, 24, 6, 1, SAND.s); });
  },
});
Object.assign(RIGGED, { thornback: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  thornback: { fps: 5, every: 10, frames: [{ tail: [1, 0] }, { tail: [-1, 0], head: [0, -1] }, { tail: [1, 0], head: [0, -1], eyes: 'blink' }, { tail: [-1, 0] }, { }] },   // swishes its tail and basks
});
