// Pixibelle: pixibelle. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
Object.assign(MONSTER_ART, {
  pixibelle(g, v = 'front') {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const skirt = () => b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
    if (v === 'side') {
      wingEllipse(b, 9, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 10, 22, 4, 3.5, Wn, { edge: true });
      wingEllipse(b, 8, 12, 1.8, 1.5, '#ffb4dc');
      earA.rect(19, 2, 1, 4, OUTLINE); earA.px(19, 1, '#ffe066'); earA.px(20, 1, '#ffe066'); earA.px(19, 0, '#ffe066');
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt();
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[9, 6], [13, 9], [9, 12]], Pk); h.px(12, 9, '#c83a7a');
      rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
      h.ellipse(22, 16, 1.5, 1, '#ff8ab8');
      rigMouth(h, Q, 22, 17, 2, () => h.px(23, 17, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.rect(12, 2, 1, 4, OUTLINE); earB.rect(19, 2, 1, 4, OUTLINE);
      earA.px(12, 1, '#ffe066').px(11, 1, '#ffe066').px(12, 0, '#ffe066'); earB.px(19, 1, '#ffe066').px(20, 1, '#ffe066').px(19, 0, '#ffe066');
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      skirt();
      h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });
      h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk); h.px(16, 8, '#c83a7a');
      wingEllipseM(b, 7.5, 14, 5.5, 5, Wn, { edge: true });
      wingEllipseM(b, 9, 22, 4, 3.5, Wn, { edge: true });
      wingEllipseM(b, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    wingEllipseM(b, 6.5, 13, 5.5, 5, Wn, { edge: true });                                       // upper wings
    wingEllipseM(b, 8, 22, 4, 3.5, Wn, { edge: true });                                         // lower wings
    wingEllipseM(b, 5.5, 12, 1.8, 1.5, '#ffb4dc');                                              // wing spots
    earA.rect(12, 2, 1, 4, OUTLINE); earB.rect(19, 2, 1, 4, OUTLINE);                           // antennae
    earA.px(12, 1, '#ffe066').px(11, 1, '#ffe066').px(12, 0, '#ffe066'); earB.px(19, 1, '#ffe066').px(20, 1, '#ffe066').px(19, 0, '#ffe066');
    b.ellipse(16, 23, 5, 5.5, B, { edge: true });                                               // body
    skirt();                                                                                    // skirt
    h.ellipse(16, 12.5, 7, 6.5, B, { edge: true });                                             // head
    h.poly([[11, 5], [16, 8], [11, 10]], Pk); h.poly([[21, 5], [16, 8], [21, 10]], Pk);         // bow
    h.px(16, 8, '#c83a7a');
    rigEyes(h, Q, 32, 12, 12, 2, () => h.eyes(12, 12, '#6a2a5a'));
    h.ellipseM(10, 16, 1.5, 1, '#ff8ab8');                                                      // cheeks
    rigMouth(h, Q, 15, 17, 2, () => h.px(16, 17, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  pixibelle(g, v) {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const { Q, b, h, earA, earB } = rigParts(g, v);
    const antennae = () => {
      earB.rect(13, 2, 1, 4, OUTLINE); earB.px(13, 1, '#ffe066'); earB.px(12, 1, '#ffe066'); earB.px(13, 0, '#ffe066');
      earA.rect(20, 2, 1, 4, OUTLINE); earA.px(20, 1, '#ffe066'); earA.px(21, 1, '#ffe066'); earA.px(20, 0, '#ffe066');
    };
    const body = () => {
      b.ellipse(16, 23, 5, 5.5, B, { edge: true });
      b.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); // skirt
      h.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
    };
    if (v === 'bside') {
      antennae();
      body();
      h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[22, 5], [17, 8], [22, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
      wingEllipse(b, 7.5, 14, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 9, 22, 4, 3.5, Wn, { edge: true });   // wings
      wingEllipse(b, 25.5, 13, 4.5, 4.5, Wn, { edge: true }); wingEllipse(b, 23.5, 21, 3.2, 3, Wn, { edge: true });
      wingEllipse(b, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    wingEllipse(b, 6.5, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(b, 8, 22, 4, 3.5, Wn, { edge: true }); // wings
    wingEllipse(b, 25, 12, 4, 4.5, Wn, { edge: true }); wingEllipse(b, 24, 21, 3, 3, Wn, { edge: true });
    wingEllipse(b, 5.5, 12, 1.8, 1.5, '#ffb4dc');
    antennae();
    body();
    h.poly([[12, 5], [17, 8], [12, 10]], Pk); h.poly([[21, 6], [17, 8], [21, 10]], Pk); h.px(17, 8, '#c83a7a');   // bow
    rigEye(h, Q, 13, 12, () => { h.rect(13, 12, 2, 3, '#6a2a5a'); h.px(13, 12, '#ffffff'); });
    rigEye(h, Q, 20, 12, () => { h.rect(20, 12, 2, 3, '#6a2a5a'); h.px(20, 12, '#ffffff'); });
    h.ellipse(11.5, 16, 1.5, 1, '#ff8ab8'); h.ellipse(23, 16, 1.2, 1, '#ff8ab8');               // cheeks
    rigMouth(h, Q, 17, 17, 2, () => h.px(18, 17, OUTLINE));
  },
});
Object.assign(RIGGED, { pixibelle: 'flier' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  pixibelle: { fps: 5, every: 9, frames: [{ flap: -0.4, head: [0, -1] }, { flap: 0.5 }, { flap: -0.4, eyes: 'blink' }, { flap: 0.5 }, { }] },   // twirls
});
