// Frostling: frostling. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// r253 (the owner liked it "better when he looked more like a squirrel mixed with a fox with the horn on its head"): the
// old design again, with the guide's detail: its big tail curling over at the top like a squirrel's, a fluffy white chest
// ruff, icy inner ears and a glint on its horn. r256 (the owner: "should be bipedal and not have a fox face, the front
// view of the face looked fine"): it stands up on its hind legs like a squirrel, little paws held at its chest, and keeps
// the round face it has from the front in every view (a small button nose side-on, no long snout).
const FROST = { B: P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr: P('#d8f4ff', '#8fcfee', '#ffffff'), SOCK: P('#f2fcff', '#bfe4f4', '#ffffff'), EYE: '#1a3a5a' };
// a hind leg standing: a round thigh and a white paw (foot = how far the paw points forward side-on)
function frostLeg(p, x, foot = 0, C = FROST.B) {
  p.ellipse(x, 26, 2.4, 2.4, C, { edge: true });
  p.ellipse(x + foot, 28.9, foot ? 2.6 : 2, 1.2, FROST.SOCK, { edge: true });
}
const frostRuff = (b, cx, Cr) => b.poly([[cx - 3.5, 18.5], [cx - 2.6, 21.5], [cx - 1.3, 20], [cx, 22.5], [cx + 1.3, 20], [cx + 2.6, 21.5], [cx + 3.5, 18.5]], Cr);
const frostPaw = (p, x, y) => { p.ellipse(x, y, 1.4, 1.1, FROST.SOCK); p.px(Math.round(x), Math.round(y) + 1, FROST.SOCK.s); };   // a little front paw, held at its chest
// the big squirrel tail, curling over at the top; (x, y) = its middle, dir = which way the curl leans
function frostTail(t, x, y, dir, edge) {
  const { Cr } = FROST, o = edge ? { edge: true } : undefined;
  t.ellipse(x, y, 5, 7.5, Cr, o); t.ellipse(x + dir * 2.4, y - 7.5, 2.8, 2.2, Cr, o);
  t.px(Math.round(x + dir * 2), y - 7, Cr.s).px(Math.round(x + dir), y - 6, Cr.s).px(x, y - 4, Cr.s);
}
Object.assign(MONSTER_ART, {
  frostling(g, v = 'front') {
    const { B, Cr, EYE } = FROST;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {
      frostTail(t, 7, 18, 1);                                                                    // the tail, curling over at the top
      frostLeg(legB, 13.5, 1.6, P(B.s, '#4a8cb0', B.b));                                        // far leg, in shadow
      earB.poly([[13, 10], [11, 2], [16, 8]], B);
      b.ellipse(15.5, 21.5, 5, 5.5, B, { edge: true });                                           // standing up
      frostRuff(b, 18, Cr);
      frostLeg(legA, 15.5, 1.8);                                                                 // near leg
      armB.ellipse(20, 19.5, 1.2, 1.1, FROST.SOCK.s);                                            // far paw
      earA.poly([[16, 10], [17, 1], [21, 9]], B, { edge: true }); earA.poly([[17, 9], [17.4, 3.5], [19.6, 8.4]], Cr.s);   // icy inner ear
      h.ellipse(17.5, 12, 7, 6, B, { edge: true });                                             // round head, no snout
      h.poly([[15, 9], [18, 2], [19, 9]], Cr, { edge: true }); h.px(17, 4, '#ffffff');           // its ice horn, with a glint
      h.ellipse(23.4, 13.6, 1.4, 1.2, B, { edge: true }); h.px(24, 13, OUTLINE);                 // a little button nose
      h.poly([[20, 16], [16, 19.5], [22, 18.5]], Cr);                                            // cheek frost
      rigEye(h, Q, 20, 11, () => { h.rect(20, 11, 2, 3, EYE); h.px(20, 11, '#ffffff'); });
      rigMouth(h, Q, 21, 16, 2, () => h.px(22, 16, OUTLINE));
      frostPaw(armA, 21, 19.5);                                                                  // near paw, held up
      return;
    }
    if (v === 'back') {
      frostLeg(legA, 13); frostLeg(legB, 19);
      earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
      b.ellipse(16, 21.5, 5.5, 5.5, B, { edge: true });
      armA.ellipse(10.8, 20, 1.4, 1.3, B); armB.ellipse(21.2, 20, 1.4, 1.3, B);                  // elbows peeking out
      h.ellipse(16, 12, 7.5, 6, B, { edge: true });
      h.poly([[14, 7], [16, 1], [18, 7]], Cr, { edge: true });
      frostTail(t, 16, 21, 0, true);                                                             // its tail, toward you
      return;
    }
    frostTail(t, 25, 18, -1);                                                                    // fluffy tail, curling over like a squirrel's
    earA.poly([[10, 10], [7, 1], [14, 8]], B); earB.poly([[22, 10], [25, 1], [18, 8]], B);
    earA.poly([[10, 9], [8.2, 3.2], [12.6, 7.6]], Cr.s); earB.poly([[22, 9], [23.8, 3.2], [19.4, 7.6]], Cr.s);   // icy inner ears
    frostLeg(legA, 13); frostLeg(legB, 19);                                                      // standing on its hind legs
    b.ellipse(16, 21.5, 5.5, 5.5, B, { edge: true });
    frostRuff(b, 16, Cr);                                                                         // fluffy chest ruff
    h.ellipse(16, 12, 7.5, 6, B, { edge: true });
    h.poly([[14, 7], [16, 1], [18, 7]], Cr, { edge: true }); h.px(15, 3, '#ffffff');              // its ice horn
    h.polyM([[9, 15], [5, 18], [10, 18]], Cr);                                                  // cheek frost
    rigEyes(h, Q, 32, 12, 11, 2, () => h.eyes(12, 11, EYE));
    rigMouth(h, Q, 15, 15, 2, () => h.px(15, 15, OUTLINE).px(16, 15, OUTLINE));
    frostPaw(armA, 13.5, 20); frostPaw(armB, 18.5, 20);                                          // little paws held at its chest
  },
});
Object.assign(MONSTER_ART_DIAG, {
  frostling(g, v) {
    const { B, Cr, EYE } = FROST;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const ears = () => { earB.poly([[10, 10], [7, 1], [14, 8]], B); earA.poly([[19, 9], [23, 1], [24, 8]], B); earB.poly([[10, 9], [8.2, 3.2], [12.6, 7.6]], Cr.s); earA.poly([[20, 8.4], [22.8, 3.4], [23.2, 7.8]], Cr.s); };
    if (v === 'bside') {
      frostLeg(legB, 13); frostLeg(legA, 19);
      ears();
      b.ellipse(16, 21.5, 5.5, 5.5, B, { edge: true });
      armA.ellipse(21.6, 20, 1.4, 1.3, B);
      h.ellipse(17, 12, 7.5, 6, B, { edge: true });
      h.ellipse(23.6, 13.6, 1.2, 1, B, { edge: true });                                          // a sliver of nose peeking out
      h.poly([[15, 7], [17, 1], [19, 7]], Cr, { edge: true });
      frostTail(t, 13, 21, 0, true);
      return;
    }
    frostTail(t, 7, 18, 1);                                                                      // fluffy tail, curling over
    ears();
    frostLeg(legB, 13); frostLeg(legA, 19, 0.6);
    b.ellipse(15.5, 21.5, 5.5, 5.5, B, { edge: true });
    frostRuff(b, 17, Cr);
    h.ellipse(17, 12, 7.5, 6, B, { edge: true });
    h.poly([[15, 7], [17, 1], [19, 7]], Cr, { edge: true }); h.px(16, 3, '#ffffff');
    h.poly([[10, 15], [6, 18], [11, 18]], Cr);                                                   // cheek frost
    rigEye(h, Q, 14, 11, () => { h.rect(14, 11, 2, 3, EYE); h.px(14, 11, '#ffffff'); });
    rigEye(h, Q, 20, 11, () => { h.rect(20, 11, 2, 3, EYE); h.px(20, 11, '#ffffff'); });
    rigMouth(h, Q, 17, 15, 2, () => h.px(17, 15, OUTLINE).px(18, 15, OUTLINE));
    frostPaw(armB, 14.5, 20); frostPaw(armA, 19.5, 20);
  },
});
Object.assign(RIGGED, { frostling: 'biped' });   // stands up like a squirrel (r256; it was a quad)
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  frostling: { fps: 5, every: 8, frames: [{ body: 1 }, { }, { body: 1 }, { }, { head: [0, -1], eyes: 'blink' }, { }] },   // shivers
});
