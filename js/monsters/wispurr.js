// Wispurr: wispurr. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  wispurr(g, v = 'front') {
    const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa'), Q = rig(), TONGUE = '#e8607a';
    const side = v === 'side', fwd = side ? Q.head[0] : 0;
    const b = part(g, 0, Q.body), t = part(g, Q.tail[0], Q.body + Q.tail[1]), h = part(g, fwd, Q.head[1]);
    const ear = i => part(g, fwd - (side && Q.ears[i] > 1 ? 1 : 0), Q.head[1] + Q.ears[i]), earA = ear(0), earB = ear(1);
    const mouth = (x, y) => { if (Q.mouth === 'roar') { h.rect(x - 1, y, 5, 3, OUTLINE); h.px(x + 1, y + 2, TONGUE); } else { h.rect(x, y, 3, 2, OUTLINE); h.px(x + 1, y + 1, TONGUE); } };
    if (side) {
      t.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);
      t.ellipse(3, 16, 2.5, 3.5, F);
      earB.poly([[13, 9], [10, 1], [16, 6]], B);
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      earA.poly([[17, 8], [19, 0], [22, 6]], B, { edge: true }); earA.px(19, 3, '#3ab8b0');
      h.ellipse(19, 12, 7.5, 6.5, B, { edge: true });
      rigEye(h, Q, 22, 11, () => { h.rect(22, 11, 2, 3, '#2ad8c0'); h.px(22, 11, '#ffffff'); });
      if (Q.mouth) mouth(23, 15); else h.px(25, 15, OUTLINE);
      h.px(26, 14, '#bcaaf0').px(27, 13, '#bcaaf0');
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earB.poly([[22, 9], [25, 1], [18, 6]], B, { edge: true });
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      h.ellipse(16, 12, 7.5, 6.5, B, { edge: true });
      t.poly([[15, 25], [20, 17], [17, 11], [24, 13], [19, 23]], B, { edge: true });
      t.ellipse(22, 10, 2.5, 3.5, F);
      return;
    }
    t.poly([[18, 23], [27, 29], [25, 23], [30, 18], [22, 19]], B);                              // wispy tail
    t.ellipse(29, 16, 2.5, 3.5, F);                                                             // tail wisp-flame
    earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earB.poly([[22, 9], [25, 1], [18, 6]], B, { edge: true });   // ears
    earA.px(8, 3, '#3ab8b0').px(9, 5, '#3ab8b0'); earB.px(23, 3, '#3ab8b0').px(22, 5, '#3ab8b0');
    b.ellipse(16, 21, 7, 6, B, { edge: true });                                                 // body
    b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
    h.ellipse(16, 12, 7.5, 6.5, B, { edge: true });                                             // head
    for (const x of [11, 19]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 3, '#2ad8c0'); h.px(x, 11, '#ffffff'); });
    if (Q.mouth) mouth(15, 15); else h.px(15, 15, OUTLINE).px(17, 15, OUTLINE).px(16, 16, OUTLINE);   // cat mouth
    h.pxM(6, 14, '#bcaaf0'); h.pxM(5, 15, '#bcaaf0');                                           // whiskers
  },
});
Object.assign(MONSTER_ART_DIAG, {
  wispurr(g, v) {
    const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa'), Q = rig(), TONGUE = '#e8607a';
    const b = part(g, 0, Q.body), t = part(g, Q.tail[0], Q.body + Q.tail[1]), h = part(g, Q.head[0], Q.head[1]);
    const ear = i => part(g, Q.head[0] - (Q.ears[i] > 1 ? 1 : 0), Q.head[1] + Q.ears[i]), earA = ear(0), earB = ear(1);
    const ears = () => {
      earA.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); earA.px(8, 3, '#3ab8b0'); earA.px(9, 5, '#3ab8b0');
      earB.poly([[19, 8], [23, 1], [24, 7]], B, { edge: true }); earB.px(22, 3, '#3ab8b0');
    };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 21, 7, 6, B, { edge: true });
      b.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
      h.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
      h.px(25, 14, '#bcaaf0'); h.px(26, 13, '#bcaaf0');                                          // a whisker
      t.poly([[11, 25], [16, 17], [13, 11], [20, 13], [15, 23]], B, { edge: true });             // wispy tail
      t.ellipse(19, 10, 2.5, 3.5, F);
      return;
    }
    t.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);                                  // wispy tail
    t.ellipse(3, 16, 2.5, 3.5, F);
    ears();
    b.ellipse(15, 21, 7, 6, B, { edge: true });
    b.poly([[8, 21], [9, 29], [12, 25], [15, 30], [18, 25], [21, 29], [22, 21]], B);
    h.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
    for (const x of [13, 20]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 3, '#2ad8c0'); h.px(x, 11, '#ffffff'); });
    if (Q.mouth === 'roar') { h.rect(16, 15, 5, 3, OUTLINE); h.px(18, 17, TONGUE); }
    else if (Q.mouth === 'open') { h.rect(17, 15, 3, 2, OUTLINE); h.px(18, 16, TONGUE); }
    else h.px(17, 15, OUTLINE).px(19, 15, OUTLINE).px(18, 16, OUTLINE);                          // cat mouth
    h.px(8, 14, '#bcaaf0'); h.px(7, 15, '#bcaaf0'); h.px(25, 14, '#bcaaf0');                     // whiskers
  },
});
Object.assign(RIGGED, { wispurr: 'floater' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  wispurr: { fps: 5, every: 8, frames: [{ body: -1, tail: [1, 0] }, { body: -2, tail: [-1, 0] }, { body: -1, eyes: 'blink' }, { }] },   // drifts up and settles
});
