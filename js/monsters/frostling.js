// Frostling: frostling. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r253 (the owner liked it "better when he looked more like a squirrel mixed with a fox with the horn on its head"): the
// old design again, with the guide's detail: its big tail curling over at the top like a squirrel's, a fluffy white chest
// ruff, icy inner ears, small legs with paws instead of foot blobs, and a glint on its horn.
function frostLeg(p, x, B) {   // r254 (the owner: the blocky feet "look terrible"): a short leg and a round white paw, like an arctic fox's socks
  p.poly([[x - 1.2, 25.5], [x + 1.2, 25.5], [x + 1, 28], [x - 1, 28]], B);
  p.ellipse(x, 28.6, 1.9, 1.4, FROST_SOCK, { edge: true });
}
const FROST_SOCK = P('#f2fcff', '#bfe4f4', '#ffffff');
const frostRuff = (b, cx, Cr) => b.poly([[cx - 4, 19], [cx - 3, 22], [cx - 1.5, 20.5], [cx, 23], [cx + 1.5, 20.5], [cx + 3, 22], [cx + 4, 19]], Cr);
Object.assign(MONSTER_ART, {
  frostling(g, v = 'front') {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    if (v === 'side') {
      t.ellipse(6, 19, 5, 7.5, Cr); t.ellipse(8.5, 11.5, 2.8, 2.2, Cr); t.px(8, 12, Cr.s).px(7, 13, Cr.s).px(6, 15, Cr.s);   // the tail, curling over at the top
      earB.poly([[13, 10], [11, 2], [16, 8]], B);
      b.ellipse(15, 23, 6.5, 6, B, { edge: true });
      frostLeg(legB, 12, B); frostLeg(legA, 18, B);
      earA.poly([[17, 10], [18, 1], [22, 9]], B, { edge: true }); earA.poly([[18, 9], [18.4, 3.5], [20.6, 8.4]], Cr.s);   // icy inner ear
      h.ellipse(18, 14, 7.5, 6, B, { edge: true });
      h.poly([[22, 12.6], [27, 14.6], [27.6, 15.6], [26.6, 16.6], [22, 18]], B);                 // snout, blending into the head (r254)
      h.poly([[16, 9], [19, 2], [20, 9]], Cr, { edge: true });
      h.poly([[19, 17], [15, 21], [21, 20]], Cr);
      h.px(18, 4, '#ffffff');                                                                    // a glint on its horn
      h.px(27, 15, OUTLINE).px(28, 15, OUTLINE);                                                 // nose tip
      rigEye(h, Q, 19, 12, () => { h.rect(19, 12, 2, 3, '#1a3a5a'); h.px(19, 12, '#ffffff'); });  // eye set back from the snout
      rigMouth(h, Q, 24, 17, 2, () => h.px(24, 17, OUTLINE).px(25, 17, OUTLINE));
      return;
    }
    if (v === 'back') {
      earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      frostLeg(legA, 12, B); frostLeg(legB, 20, B);
      h.ellipse(16, 14, 7.5, 6, B, { edge: true });
      h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
      t.ellipse(16, 21, 5, 7.5, Cr, { edge: true }); t.ellipse(16, 13.5, 2.8, 2.2, Cr, { edge: true }); t.px(15, 14, Cr.s).px(16, 16, Cr.s).px(16, 18, Cr.s);   // its curling tail
      return;
    }
    t.ellipse(25, 19, 5, 7.5, Cr); t.ellipse(23, 11.5, 2.8, 2.2, Cr); t.px(24, 12, Cr.s).px(25, 13, Cr.s).px(26, 15, Cr.s);   // fluffy tail, curling over like a squirrel's
    earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
    earA.poly([[10, 9], [8.2, 3.2], [12.6, 7.6]], Cr.s); earB.poly([[22, 9], [23.8, 3.2], [19.4, 7.6]], Cr.s);   // icy inner ears
    b.ellipse(16, 23, 6.5, 6, B, { edge: true });
    frostRuff(b, 16, Cr);                                                                         // fluffy chest ruff
    h.ellipse(16, 14, 7.5, 6, B, { edge: true });
    h.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true }); h.px(15, 4, '#ffffff');
    h.polyM([[9, 17], [5, 20], [10, 20]], Cr);                                                  // cheek frost
    frostLeg(legA, 12, B); frostLeg(legB, 20, B);
    rigEyes(h, Q, 32, 12, 13, 2, () => h.eyes(12, 13, '#1a3a5a'));
    rigMouth(h, Q, 15, 17, 2, () => h.px(15, 17, OUTLINE).px(16, 17, OUTLINE));
  },
});
Object.assign(MONSTER_ART_DIAG, {
  frostling(g, v) {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
    const ears = () => { earB.poly([[10, 10], [7, 1], [14, 8]], B); earA.poly([[19, 9], [23, 1], [24, 8]], B); earB.poly([[10, 9], [8.2, 3.2], [12.6, 7.6]], Cr.s); earA.poly([[20, 8.4], [22.8, 3.4], [23.2, 7.8]], Cr.s); };
    if (v === 'bside') {
      ears();
      b.ellipse(16, 23, 6.5, 6, B, { edge: true });
      frostLeg(legB, 12, B); frostLeg(legA, 18.5, B);
      h.ellipse(17, 14, 7.5, 6, B, { edge: true });
      h.poly([[23, 14], [26, 16], [23, 17]], B, { edge: true });                                 // snout peeking out
      h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
      t.ellipse(12, 21, 5, 7.5, Cr, { edge: true }); t.ellipse(12, 13.5, 2.8, 2.2, Cr, { edge: true }); t.px(11, 14, Cr.s).px(12, 16, Cr.s);   // fluffy tail, curling
      return;
    }
    t.ellipse(7, 19, 5, 7.5, Cr); t.ellipse(9, 11.5, 2.8, 2.2, Cr); t.px(8, 12, Cr.s).px(7, 13, Cr.s).px(6, 15, Cr.s);   // fluffy tail, curling over
    ears();
    b.ellipse(15, 23, 6.5, 6, B, { edge: true });
    frostRuff(b, 16.5, Cr);
    h.ellipse(17, 14, 7.5, 6, B, { edge: true });
    h.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true }); h.px(17, 4, '#ffffff');
    h.poly([[10, 17], [6, 20], [11, 20]], Cr);                                                   // cheek frost
    frostLeg(legB, 12, B); frostLeg(legA, 18.5, B);
    rigEye(h, Q, 14, 13, () => { h.rect(14, 13, 2, 3, '#1a3a5a'); h.px(14, 13, '#ffffff'); });
    rigEye(h, Q, 20, 13, () => { h.rect(20, 13, 2, 3, '#1a3a5a'); h.px(20, 13, '#ffffff'); });
    rigMouth(h, Q, 18, 17, 2, () => h.px(18, 17, OUTLINE).px(19, 17, OUTLINE));
  },
});
Object.assign(RIGGED, { frostling: 'quad' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  frostling: { fps: 5, every: 8, frames: [{ body: 1 }, { }, { body: 1 }, { }, { head: [0, -1], eyes: 'blink' }, { }] },   // shivers
});
