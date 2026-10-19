// Scarablade: scarablade. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  scarablade(g, v = 'front') {
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    const tails = part(g, (side ? Q.head[0] : 0) + Q.tail[0], Q.head[1] + Q.tail[1]);   // the headband's tails trail behind the head
    if (side) {
      tails.poly([[17, 8], [10, 5], [11, 10]], '#d23a3a');
      legB.ellipse(10, 28, 3, 2, Bd, { edge: true }); legA.ellipse(19, 28, 3, 2, Bd, { edge: true });
      h.ellipse(21, 12, 5.5, 4.5, Bd, { edge: true });
      h.poly([[22, 9], [25, 3], [29, 0], [27, 4], [26, 9]], Hn, { edge: true });
      h.rect(17, 8, 9, 2, '#d23a3a');
      b.ellipse(14, 20, 10, 8.5, Sh, { edge: true });
      b.rect(6, 17, 16, 1, '#3a5208');
      b.px(9, 15, '#c4e04a'); b.px(10, 14, '#c4e04a'); b.px(13, 14, '#c4e04a');
      armA.ellipse(23, 21, 3, 3.2, Bd, { edge: true });
      rigEye(h, Q, 24, 11, () => h.rect(24, 11, 2, 2, '#ffde3a'));
      h.px(23, 10, OUTLINE); h.px(24, 10, OUTLINE);
      rigMouth(h, Q, 24, 14, 2);
      return;
    }
    if (v === 'back') {
      h.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });
      legA.ellipse(9, 28, 3, 2, Bd, { edge: true }); legB.ellipse(23, 28, 3, 2, Bd, { edge: true });
      armA.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armB.ellipse(26.5, 19, 3, 3.2, Bd, { edge: true });
      h.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });
      h.rect(10, 8, 12, 2, '#d23a3a');
      b.ellipse(16, 20, 10, 8.5, Sh, { edge: true });
      b.rect(16, 12, 1, 17, '#3a5208');
      b.pxM(10, 16, '#c4e04a'); b.pxM(11, 15, '#c4e04a'); b.pxM(12, 21, '#c4e04a');
      return;
    }
    h.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });      // great horn
    h.poly([[16, 4], [21, 1], [19, 5], [17, 6]], Hn);                                           // horn fork
    legA.ellipse(9, 28, 3, 2, Bd, { edge: true }); legB.ellipse(23, 28, 3, 2, Bd, { edge: true });   // legs
    armA.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armB.ellipse(26.5, 19, 3, 3.2, Bd, { edge: true });   // fists
    b.ellipse(16, 20, 10, 8.5, Sh, { edge: true });                                             // shell
    b.rect(16, 13, 1, 15, '#3a5208');                                                           // shell seam
    b.pxM(11, 18, '#c4e04a'); b.pxM(12, 17, '#c4e04a');
    h.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });                                            // head
    h.rect(10, 8, 12, 2, '#d23a3a');                                                            // headband
    tails.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');
    rigEyes(h, Q, 32, 12, 11, 2, () => h.eyes(12, 11, '#ffde3a', { brow: true, h: 2 }));
    rigMouth(h, Q, 15, 14, 2);
  },
});
Object.assign(MONSTER_ART_DIAG, {
  scarablade(g, v) {
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    const { Q, b, h, legA, legB, armA, armB } = rigParts(g, v);
    const tails = part(g, Q.head[0] + Q.tail[0], Q.head[1] + Q.tail[1]);
    h.poly([[17, 10], [17, 4], [16, 0], [20, 2], [21, 5], [21, 10]], Hn, { edge: true });        // great horn
    if (v === 'bside') {
      legB.ellipse(9, 28, 3, 2, Bd, { edge: true }); legA.ellipse(21, 28, 2.8, 2, Bd, { edge: true });
      armB.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armA.ellipse(26.5, 19, 2.6, 3, Bd, { edge: true });
      h.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });
      h.rect(12, 8, 12, 2, '#d23a3a');
      b.ellipse(15, 20, 10, 8.5, Sh, { edge: true });
      b.rect(15, 12, 1, 17, '#3a5208');                                                          // shell seam
      b.px(10, 16, '#c4e04a'); b.px(11, 15, '#c4e04a'); b.px(12, 21, '#c4e04a'); b.px(20, 16, '#c4e04a');
      return;
    }
    h.poly([[20, 4], [25, 1], [23, 5], [21, 6]], Hn);                                            // horn fork
    tails.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                           // headband tails
    legB.ellipse(9, 28, 3, 2, Bd, { edge: true }); legA.ellipse(21, 28, 2.8, 2, Bd, { edge: true });   // legs
    armB.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); armA.ellipse(26, 19, 2.6, 3, Bd, { edge: true });   // fists
    b.ellipse(15, 20, 10, 8.5, Sh, { edge: true });                                              // shell
    b.rect(14, 13, 1, 15, '#3a5208');
    b.px(10, 18, '#c4e04a'); b.px(11, 17, '#c4e04a'); b.px(19, 17, '#c4e04a');
    h.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });                                             // head
    h.rect(12, 8, 12, 2, '#d23a3a');                                                             // headband
    rigEye(h, Q, 15, 11, () => { h.rect(15, 11, 2, 2, '#ffde3a'); h.px(15, 11, '#ffffff'); });
    rigEye(h, Q, 21, 11, () => { h.rect(21, 11, 2, 2, '#ffde3a'); h.px(21, 11, '#ffffff'); });
    h.px(14, 9, OUTLINE).px(15, 9, OUTLINE).px(16, 10, OUTLINE).px(17, 10, OUTLINE);             // brows
    h.px(23, 9, OUTLINE).px(22, 9, OUTLINE).px(21, 10, OUTLINE).px(20, 10, OUTLINE);
    rigMouth(h, Q, 18, 14, 2);
  },
});
Object.assign(RIGGED, { scarablade: 'biped' });
