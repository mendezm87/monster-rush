// Venomire: venomire. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r131 (the owner: "do them all in one shot"; it read as Grimer/Muk): a leaking specimen jar from
// the old Archive. Corrupted ooze (Glitch) lives inside a cracked glass flask with a cork, one big eye looking
// out through the glass; it seeps out of the crack into a puddle round its base, flecked with glitch pixels.
// From behind, the jar's old specimen label. Bubbles rise inside (they ride the ears). Colours in VENOM.
const VENOM = { GL: P('#cfe6e2', '#9cc2bc', '#f4fffd'), OOZE: P('#8fd046', '#5a9a2a', '#c4f070'), CORK: P('#c89a5a', '#8a6a3a', '#e8c08a'),
  EYE: '#f6f2e6', IRIS: '#3a0a4a', MAG: '#ff4ad8', CYAN: '#4af0ff', CRACK: '#2a3a34', LABEL: P('#efe4c4', '#cdbf98', '#fff8e0') };

Object.assign(MONSTER_ART, {
  venomire(g, v = 'front') {
    const { GL, OOZE, CORK, EYE, IRIS, MAG, CYAN, CRACK, LABEL } = VENOM;
    const { Q, b, h, earA, earB } = rigParts(g, v), side = v === 'side';
    const jar = (cx) => {   // the flask: glass round the ooze, a neck, ooze filling it with a wavy surface
      b.poly([[cx - 8, 11], [cx + 8, 11], [cx + 9, 14], [cx + 9, 25], [cx + 7, 27], [cx - 7, 27], [cx - 9, 25], [cx - 9, 14]], GL, { edge: true });
      b.rect(cx - 4, 8, 8, 3, GL.b); b.rect(cx - 4, 8, 1, 3, GL.l);
      b.poly([[cx - 7.5, 15], [cx + 7.5, 15], [cx + 7.5, 25], [cx + 6, 26], [cx - 6, 26], [cx - 7.5, 25]], OOZE);
      for (let x = cx - 7; x <= cx + 6; x += 3) b.px(x, 14, OOZE.l).px(x + 1, 14, OOZE.l);       // the ooze's wavy surface
      b.rect(cx - 7, 13, 1, 9, GL.l); b.px(cx - 6, 12, '#ffffff');                                 // a shine down the glass
    };
    g.ellipse(16, 28, 13, 3, OOZE, { edge: true });                                                // the puddle it has leaked (stays put)
    g.px(5, 28, MAG).px(25, 29, CYAN).px(19, 30, MAG);                                            // glitch flecks in it
    if (v === 'back') {
      jar(16);
      b.rect(10, 17, 12, 6, LABEL.b); b.rect(10, 22, 12, 1, LABEL.s);                              // the old specimen label
      b.rect(12, 18, 7, 1, CRACK).rect(12, 20, 5, 1, CRACK).px(19, 20, CRACK);
      earA.ellipse(12, 15.5, 1.2, 1.2, OOZE.l); earB.ellipse(20, 15, 1, 1, OOZE.l);
      h.rect(12, 4, 8, 4, CORK.b); h.rect(12, 4, 8, 1, CORK.l); h.rect(12, 7, 8, 1, CORK.s);       // cork
      return;
    }
    const cx = side ? 15 : 16, ex = side ? 18.5 : 16;
    jar(cx);
    earA.ellipse(cx - 4, 22, 1.2, 1.2, OOZE.l); earB.ellipse(cx + 4, 18, 1, 1, OOZE.l); earB.px(cx + 4, 17, '#ffffff');   // bubbles rising
    h.ellipse(ex, 19, 3.6, 3.2, EYE, { edge: true });                                              // the big eye looking out
    rigEye(h, Q, Math.round(ex) - 1, 18, () => { h.rect(Math.round(ex) - 1, 18, 2, 3, IRIS); h.px(Math.round(ex) - 1, 18, '#ffffff'); h.px(Math.round(ex), 21, MAG); });
    rigMouth(h, Q, Math.round(ex) - 2, 23, 4, () => { h.rect(Math.round(ex) - 2, 23, 4, 1, OOZE.s); h.px(Math.round(ex) - 2, 24, OOZE.s); });
    // the crack it leaks from, ooze dripping out of it
    const kx = side ? cx + 7 : cx + 5;
    b.px(kx, 16, CRACK).px(kx + 1, 17, CRACK).px(kx, 18, CRACK).px(kx + 1, 19, CRACK).px(kx + 1, 20, CRACK);
    b.px(kx + 2, 20, OOZE.b).px(kx + 2, 21, OOZE.b).px(kx + 2, 22, OOZE.s).px(kx + 3, 24, OOZE.b);
    b.px(kx - 1, 16, CYAN).px(cx - 5, 24, MAG);                                                    // glitch flecks in the ooze
    h.rect(12 - (side ? 1 : 0), 4, 8, 4, CORK.b); h.rect(12 - (side ? 1 : 0), 4, 8, 1, CORK.l); h.rect(12 - (side ? 1 : 0), 7, 8, 1, CORK.s);   // cork
  },
});
Object.assign(MONSTER_ART_DIAG, {
  venomire(g, v) {   // turned a little right: the eye slides right (fside), the label (bside)
    const { GL, OOZE, CORK, EYE, IRIS, MAG, CYAN, CRACK, LABEL } = VENOM;
    const { Q, b, h, earA, earB } = rigParts(g, v), cx = 16;
    g.ellipse(16, 28, 13, 3, OOZE, { edge: true });
    g.px(5, 28, MAG).px(25, 29, CYAN).px(19, 30, MAG);
    b.poly([[cx - 8, 11], [cx + 8, 11], [cx + 9, 14], [cx + 9, 25], [cx + 7, 27], [cx - 7, 27], [cx - 9, 25], [cx - 9, 14]], GL, { edge: true });
    b.rect(cx - 4, 8, 8, 3, GL.b); b.rect(cx - 4, 8, 1, 3, GL.l);
    b.poly([[cx - 7.5, 15], [cx + 7.5, 15], [cx + 7.5, 25], [cx + 6, 26], [cx - 6, 26], [cx - 7.5, 25]], OOZE);
    for (let x = cx - 7; x <= cx + 6; x += 3) b.px(x, 14, OOZE.l).px(x + 1, 14, OOZE.l);
    b.rect(cx - 7, 13, 1, 9, GL.l); b.px(cx - 6, 12, '#ffffff');
    h.rect(12, 4, 8, 4, CORK.b); h.rect(12, 4, 8, 1, CORK.l); h.rect(12, 7, 8, 1, CORK.s);
    if (v === 'bside') {
      b.rect(13, 17, 11, 6, LABEL.b); b.rect(13, 22, 11, 1, LABEL.s);
      b.rect(15, 18, 7, 1, CRACK).rect(15, 20, 5, 1, CRACK);
      earA.ellipse(11, 16, 1.2, 1.2, OOZE.l); earB.ellipse(19, 15, 1, 1, OOZE.l);
      return;
    }
    earA.ellipse(11, 22, 1.2, 1.2, OOZE.l); earB.ellipse(13, 17, 1, 1, OOZE.l);
    h.ellipse(18, 19, 3.6, 3.2, EYE, { edge: true });
    rigEye(h, Q, 17, 18, () => { h.rect(17, 18, 2, 3, IRIS); h.px(17, 18, '#ffffff'); h.px(18, 21, MAG); });
    rigMouth(h, Q, 16, 23, 4, () => { h.rect(16, 23, 4, 1, OOZE.s); h.px(16, 24, OOZE.s); });
    b.px(22, 16, CRACK).px(23, 17, CRACK).px(22, 18, CRACK).px(23, 19, CRACK).px(23, 20, CRACK);
    b.px(24, 20, OOZE.b).px(24, 21, OOZE.b).px(24, 22, OOZE.s).px(25, 24, OOZE.b);
    b.px(21, 16, CYAN).px(11, 24, MAG);
  },
});
Object.assign(RIGGED, { venomire: 'slither' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  venomire: { fps: 5, every: 8, frames: [{ body: 1, ears: [0, -2] }, { body: -1, mouth: 'open', ears: [-2, -3] }, { body: 1, ears: [-3, 0] }, { }] },   // sloshes in its jar, bubbles rising
});
