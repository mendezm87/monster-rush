// Brawlix: brawlix. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  brawlix(g, v = 'front') {
    const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a'), Q = rig(), TONGUE = '#e8607a';
    const side = v === 'side', fwd = side ? Q.head[0] : 0;
    const b = part(g, 0, Q.body), h = part(g, fwd, Q.head[1]), tails = part(g, fwd + Q.tail[0], Q.head[1] + Q.tail[1]);
    const leg = i => part(g, side && Q.legs[i] ? 1 : 0, -Q.legs[i]), legA = leg(0), legB = leg(1);
    const arm = i => part(g, side ? Q.arms[i] : 0, Q.body - (side ? 0 : Q.arms[i])), armA = arm(0), armB = arm(1);
    const mouth = (x, y) => { if (Q.mouth === 'roar') { h.rect(x - 1, y, 4, 2, OUTLINE); h.px(x, y + 1, TONGUE); } else if (Q.mouth === 'open') h.rect(x, y, 2, 2, OUTLINE); else h.rect(x, y, 2, 1, OUTLINE); };
    if (side) {
      tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');
      legB.ellipse(12, 29, 2.2, 2, T, { edge: true }); legA.ellipse(19, 29, 2.2, 2, T, { edge: true });
      armB.ellipse(11, 20, 3.2, 3.2, R, { edge: true });
      b.ellipse(16, 21, 6, 6, T, { edge: true });
      b.ellipse(16, 26, 5.5, 2.6, '#3a5ab8', { edge: true });
      h.ellipse(17, 11, 6, 5.5, T, { edge: true });
      h.rect(11, 8, 12, 2, '#d23a3a');
      armA.ellipse(19, 18, 2.5, 3.5, T, { edge: true });
      armA.ellipse(23, 20, 3.5, 3.5, R, { edge: true });
      rigEye(h, Q, 20, 11, () => { h.rect(20, 11, 2, 2, DARK_EYE); h.px(20, 11, '#ffffff'); });
      h.px(19, 10, OUTLINE); h.px(20, 10, OUTLINE); h.px(21, 10, OUTLINE);
      if (Q.mouth) mouth(21, 14); else h.px(22, 14, OUTLINE);
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 29, 2.2, 2, T, { edge: true }); legB.ellipse(20, 29, 2.2, 2, T, { edge: true });
      b.ellipse(16, 21, 6.5, 6, T, { edge: true });
      b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      armA.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armB.ellipse(22, 18, 2.5, 3.5, T, { edge: true });
      armA.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armB.ellipse(25.5, 21, 3.5, 3.5, R, { edge: true });
      h.ellipse(16, 11, 6, 5.5, T, { edge: true });
      h.rect(10, 8, 12, 2, '#d23a3a');
      h.rect(15, 8, 2, 3, '#9a2222');
      tails.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); tails.poly([[17, 10], [20, 16], [17, 15]], '#d23a3a');
      b.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    tails.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');                                         // headband tails
    legA.ellipse(12, 29, 2.2, 2, T, { edge: true }); legB.ellipse(20, 29, 2.2, 2, T, { edge: true });
    b.ellipse(16, 21, 6.5, 6, T, { edge: true });
    b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    armA.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armB.ellipse(22, 18, 2.5, 3.5, T, { edge: true });
    armA.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armB.ellipse(25.5, 21, 3.5, 3.5, R, { edge: true });
    h.ellipse(16, 11, 6, 5.5, T, { edge: true });
    h.rect(10, 8, 12, 2, '#d23a3a');
    for (const x of [13, 17]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 2, DARK_EYE); h.px(x, 11, '#ffffff'); });
    h.px(12, 9, OUTLINE).px(13, 9, OUTLINE).px(14, 10, OUTLINE).px(15, 10, OUTLINE);            // angry brows
    h.px(19, 9, OUTLINE).px(18, 9, OUTLINE).px(17, 10, OUTLINE).px(16, 10, OUTLINE);
    mouth(15, 14);
    b.rect(14, 19, 4, 1, '#a8703e');
  },
});
Object.assign(MONSTER_ART_DIAG, {
  brawlix(g, v) {
    const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a'), Q = rig(), TONGUE = '#e8607a';
    const b = part(g, 0, Q.body), h = part(g, Q.head[0], Q.head[1]), tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    const leg = i => part(g, Q.legs[i] ? 1 : 0, -Q.legs[i]), legA = leg(0), legB = leg(1);
    const arm = i => part(g, Q.arms[i], Q.body), armA = arm(0), armB = arm(1);
    const legs = () => { legB.ellipse(12, 29, 2.2, 2, T, { edge: true }); legA.ellipse(19.5, 29, 2, 1.9, T, { edge: true }); };
    if (v === 'bside') {
      legs();
      b.ellipse(16, 21, 6.5, 6, T, { edge: true });
      b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      armB.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armA.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
      armB.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armA.ellipse(25.5, 21, 3.2, 3.2, R, { edge: true });
      h.ellipse(17, 11, 6, 5.5, T, { edge: true });
      h.rect(11, 8, 12, 2, '#d23a3a');
      h.rect(15, 8, 2, 3, '#9a2222');                                                            // headband knot
      tails.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); tails.poly([[17, 10], [19, 16], [17, 15]], '#d23a3a');
      b.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                           // headband tails
    legs();
    b.ellipse(16, 21, 6.5, 6, T, { edge: true });
    b.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    armB.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); armA.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
    armB.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); armA.ellipse(25, 20.5, 3.2, 3.2, R, { edge: true });   // gloves up
    h.ellipse(17, 11, 6, 5.5, T, { edge: true });
    h.rect(11, 8, 12, 2, '#d23a3a');
    for (const x of [14, 20]) rigEye(h, Q, x, 11, () => { h.rect(x, 11, 2, 2, DARK_EYE); h.px(x, 11, '#ffffff'); });
    h.px(13, 9, OUTLINE).px(14, 9, OUTLINE).px(15, 10, OUTLINE).px(16, 10, OUTLINE);
    h.px(22, 9, OUTLINE).px(21, 9, OUTLINE).px(20, 10, OUTLINE).px(19, 10, OUTLINE);
    if (Q.mouth === 'roar') { h.rect(16, 14, 4, 2, OUTLINE); h.px(17, 15, TONGUE); } else if (Q.mouth === 'open') h.rect(17, 14, 2, 2, OUTLINE); else h.rect(17, 14, 2, 1, OUTLINE);
    b.rect(15, 19, 4, 1, '#a8703e');
  },
});
Object.assign(RIGGED, { brawlix: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  brawlix: { fps: 5, every: 8, frames: [{ arms: [3, -1] }, { arms: [-1, 3] }, { arms: [3, -1] }, { arms: [-1, 3] }, { }] },   // shadowboxes
});
