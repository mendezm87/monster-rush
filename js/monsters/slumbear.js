// Slumbear: slumbear, and the three bears his data can sort into when he Restores (polarest, bambooze, grizzleep). Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
//
// Redesigned in r130 with the owner over several rounds (docs/concept-prompts.md round 6, mock-ups in
// docs/samples): the old Slumbear read as Snorlax. Now his data came back scrambled from every bear on record:
// a huge round sleepy creature made of blocks of different bears' fur that don't quite line up (each block
// nudged a pixel). One colour map in every view (the owner: his colours mustn't change between angles):
// his right side is brown with a panda's eye patch, a black ear, arm, leg and hip; his left side is white
// with a spectacled bear's cream eye ring, a white ear and leg and a cinnamon arm; a cinnamon belly, a sun
// bear's golden crescent on his chest (in two halves, a pixel apart), a sloth bear's shaggy black mane under
// his chin, and a grizzly's shoulder hump flowing into his back. The side views show his right side.
const SLUM = { G: P('#8a5a3a', '#6a4028', '#a87850'), WH: P('#f1eee8', '#d2ccc0', '#ffffff'), K: P('#3a3640', '#25222a', '#56525e'),
  CIN: P('#b8703e', '#8c522c', '#d6905c'), SUN: P('#e2b264', '#b88a44', '#f2d49a'), RING: '#efe0b8', MUZ: P('#e8dcc0', '#c8b898', '#f8f0dc'),
  MANE: P('#2a262c', '#18161a', '#423c46'), NOSE: '#1e1a22', LID: '#e6ddcc', SHINE: '#fffaf2' };
SLUM.WHd = P(SLUM.WH.s, '#b8b2a6', SLUM.WH.b);
// One block of fur: the part of the ellipse (cx, cy, rx, ry) inside the box x0..x1, y0..y1, nudged by (dx, dy)
// so the blocks don't quite line up; its top and left edges are shaded where it meets the next block.
function slumBlock(p, [cx, cy, rx, ry], x0, y0, x1, y1, pal, dx = 0, dy = 0) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const X = x - dx, Y = y - dy;
    if (((X + 0.5 - cx) / rx) ** 2 + ((Y + 0.5 - cy) / ry) ** 2 > 1) continue;
    const k = ((x - x0) / Math.max(1, x1 - x0)) * 0.4 + ((y - y0) / Math.max(1, y1 - y0)) * 0.9;
    const top = y === y0 && y0 > cy - ry + 1, left = x === x0 && x0 > cx - rx + 1;
    p.px(x, y, top || left ? pal.s : k > 0.95 ? pal.s : k < 0.22 ? pal.l : pal.b);
  }
}
// A sloth bear's shaggy black mane: a fringe of tufts hanging down.
function slumMane(p, cx, cy, w, h) {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const a = Math.PI * (i / 14), r = i % 2 ? 0.8 : 1.15; pts.push([cx - Math.cos(a) * w, cy - h * 0.5 + Math.sin(a) * h * r]); }
  p.poly(pts, SLUM.MANE, { edge: true });
}

Object.assign(MONSTER_ART, {
  slumbear(g, v = 'front') { // 44x44
    const { G, WH, WHd, K, CIN, SUN, RING, MUZ, NOSE, LID, SHINE } = SLUM;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    if (v === 'side') {   // his right side
      legB.ellipse(16, 40, 4.5, 3, WHd, { edge: true });                 // far leg: his left, white
      t.ellipse(6, 31, 2.4, 2.2, K, { edge: true });                     // stubby black tail
      const E = [21, 28, 15, 13];
      b.ellipse(17, 19, 9, 5.5, G);                                      // the grizzly's shoulder hump, flowing into his back
      slumBlock(b, E, 5, 14, 37, 30, G);                                 // his right shoulder and back: grizzly
      slumBlock(b, E, 5, 30, 21, 43, K, 0, 1);                           // his right hip: black, a pixel low
      slumBlock(b, E, 21, 30, 37, 43, CIN, 1, 0);                        // his belly: cinnamon, a pixel forward
      b.poly([[30, 24], [36, 25.5], [35.5, 30.5], [31, 29]], SUN);       // the golden crescent on his chest
      legA.ellipse(28, 40, 4.5, 3, K, { edge: true });                   // near leg: his right, black
      armA.ellipse(30, 28, 3.4, 5, K, { edge: true });                   // near arm: his right, black
      slumMane(b, 25, 21, 7, 6);                                         // the shaggy mane round his neck
      earB.ellipse(20.5, 7, 2.4, 2.4, WHd);                              // far ear: his left, white
      h.ellipse(26, 14, 9, 7.8, G, { edge: true });                      // his head, from his brown right side
      earA.ellipse(23.5, 6.5, 3, 3, K, { edge: true });                  // near ear: his right, black
      h.poly([[27, 11], [32, 11.5], [32, 15], [28, 15.5]], K);           // the panda eye patch
      rigEye(h, Q, 29, 13, () => { h.rect(29, 13, 2, 1, LID); h.px(30, 13, SHINE); }, 3);   // heavy sleepy eye
      h.ellipse(33.5, 17.5, 3.4, 2.8, MUZ, { edge: true });              // short bear muzzle
      h.rect(36, 16, 2, 2, NOSE); h.px(36, 16, '#5a5060');
      rigMouth(h, Q, 32, 20, 3, () => { h.rect(32, 20, 3, 1, G.s); });
      return;
    }
    if (v === 'back') {   // from behind, his left side is on the left
      legA.ellipse(14, 40, 5, 3.2, WH, { edge: true }); legB.ellipse(30, 40, 5, 3.2, K, { edge: true });
      const E = [22, 28, 16, 13];
      slumBlock(b, E, 5, 14, 22, 30, WH, -1, 0); slumBlock(b, E, 22, 14, 40, 30, G, 0, -1);
      slumBlock(b, E, 5, 30, 17, 43, G, 0, 1); slumBlock(b, E, 17, 30, 29, 43, CIN); slumBlock(b, E, 29, 30, 40, 43, K, 1, 0);
      armA.ellipse(7, 26, 3.6, 6, CIN, { edge: true }); armB.ellipse(37, 26, 3.6, 6, K, { edge: true });
      slumMane(b, 22, 21, 13, 6);
      earA.ellipse(12, 6, 3.2, 3, WH, { edge: true }); earB.ellipse(32, 6, 3.2, 3, K, { edge: true });
      const HE = [22, 13, 11, 8.5];
      slumBlock(h, HE, 10, 4, 22, 23, WH, 0, 1); slumBlock(h, HE, 22, 4, 35, 23, G);
      t.ellipse(22, 37, 2.6, 2.2, K, { edge: true });                    // stubby black tail
      return;
    }
    legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, WH, { edge: true });   // his right leg black, his left white
    const E = [22, 28, 16, 13];
    slumBlock(b, E, 5, 14, 22, 30, G);                                   // blocks of different bears' fur, not quite lined up
    slumBlock(b, E, 22, 14, 40, 30, WH, 1, -1);
    slumBlock(b, E, 5, 30, 17, 43, K, -1, 0);
    slumBlock(b, E, 17, 30, 29, 43, CIN, 0, 1);
    slumBlock(b, E, 29, 30, 40, 43, G, 1, 0);
    b.poly([[15, 28], [18.5, 28], [19.8, 30.2], [22, 31], [22, 34.5], [16.5, 32.2]], SUN);   // the sun bear's golden crescent, broken in two:
    b.poly([[22, 32], [24.2, 31.2], [25.5, 29], [29, 29], [27.5, 33.2], [22, 35.5]], SUN);   // its right half sits a pixel low
    armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, CIN, { edge: true });   // his right arm black, his left cinnamon
    slumMane(b, 22, 22, 14, 6);                                          // the sloth bear's mane, under his chin
    earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, WH, { edge: true });
    const HE = [22, 13, 11, 8.5];
    slumBlock(h, HE, 10, 4, 22, 23, G);                                  // his face: two halves, a pixel apart
    slumBlock(h, HE, 22, 4, 35, 23, WH, 0, 1);
    h.poly([[13, 10], [19, 10.5], [19, 14.5], [14, 15]], K);             // a panda's eye patch on his right
    h.ellipse(27.5, 13.5, 3.2, 2.6, RING);                               // a spectacled bear's eye ring on his left
    rigEyes(h, Q, 44, 15, 12, 3, () => { h.rect(15, 12, 3, 1, LID); h.px(17, 12, SHINE); h.rect(26, 13, 3, 1, NOSE); });   // heavy sleepy eyes
    h.ellipse(22, 18, 5, 3.4, MUZ, { edge: true });                      // short bear muzzle
    h.rect(20, 16, 4, 2, NOSE); h.px(20, 16, '#5a5060');
    rigMouth(h, Q, 20, 20, 4, () => { h.rect(21, 20, 2, 1, G.s); h.px(20, 19, G.s); h.px(23, 19, G.s); });
  },
});
Object.assign(MONSTER_ART_DIAG, {
  slumbear(g, v) { // 44x44; heading down-right (fside) or up-right (bside), turning his right side toward you
    const { G, WH, WHd, K, CIN, SUN, RING, MUZ, NOSE, LID, SHINE } = SLUM;
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    const E = [22, 28, 16, 13], HE = [24, 13, 11, 8.5];
    if (v === 'bside') {
      legA.ellipse(14, 40, 4.4, 3, WHd, { edge: true }); legB.ellipse(30, 40, 5, 3.2, K, { edge: true });   // his left leg white (far), his right black
      b.ellipse(26, 19, 8, 5, G);                                        // the shoulder hump on his right
      slumBlock(b, E, 5, 14, 19, 30, WH, -1, 0); slumBlock(b, E, 19, 14, 40, 30, G, 0, -1);
      slumBlock(b, E, 5, 30, 15, 43, G, 0, 1); slumBlock(b, E, 15, 30, 27, 43, CIN); slumBlock(b, E, 27, 30, 40, 43, K, 1, 0);
      armA.ellipse(7.5, 26, 3, 5.4, CIN, { edge: true }); armB.ellipse(37, 26, 3.8, 6, K, { edge: true });   // his left arm (far), his right arm
      slumMane(b, 24, 21, 13, 6);
      earA.ellipse(14, 6, 2.8, 2.7, WH, { edge: true }); earB.ellipse(33, 6, 3.2, 3, K, { edge: true });
      slumBlock(h, HE, 12, 4, 24, 23, WH, 0, 1); slumBlock(h, HE, 24, 4, 36, 23, G);   // the back of his head, turned a little right
      h.ellipse(35, 17, 1.8, 1.8, MUZ);                                  // a sliver of muzzle peeking out
      t.ellipse(21, 37, 2.6, 2.2, K, { edge: true });
      return;
    }
    legA.ellipse(13, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 4.4, 3, WH, { edge: true });   // his right leg (near) black, his left white
    slumBlock(b, E, 5, 14, 24, 30, G);                                   // his right side shows more as he turns
    slumBlock(b, E, 24, 14, 40, 30, WH, 1, -1);
    slumBlock(b, E, 5, 30, 19, 43, K, -1, 0);
    slumBlock(b, E, 19, 30, 31, 43, CIN, 0, 1);
    slumBlock(b, E, 31, 30, 40, 43, G, 1, 0);
    b.poly([[17, 28], [20.5, 28], [21.8, 30.2], [24, 31], [24, 34.5], [18.5, 32.2]], SUN);   // the golden crescent, turned his way
    b.poly([[24, 32], [26, 31.2], [27, 29], [30, 29], [28.8, 33.2], [24, 35.5]], SUN);
    armA.ellipse(7, 27, 3.8, 6, K, { edge: true }); armB.ellipse(37.5, 26, 3, 5.2, CIN, { edge: true });   // his right arm (near), his left
    slumMane(b, 24, 22, 14, 6);
    earA.ellipse(13, 6, 3.2, 3, K, { edge: true }); earB.ellipse(33.5, 6.5, 2.8, 2.7, WH, { edge: true });
    slumBlock(h, HE, 12, 4, 25, 23, G);                                  // his face turned a little right: the brown half shows more
    slumBlock(h, HE, 25, 4, 36, 23, WH, 0, 1);
    h.poly([[15, 10], [21, 10.5], [21, 14.5], [16, 15]], K);             // panda eye patch (near)
    h.ellipse(29.5, 13.5, 2.8, 2.4, RING);                               // cream eye ring (far)
    rigEye(h, Q, 17, 12, () => { h.rect(17, 12, 3, 1, LID); h.px(19, 12, SHINE); }, 3);
    rigEye(h, Q, 28, 13, () => { h.rect(28, 13, 3, 1, NOSE); }, 3);
    h.ellipse(25, 18, 5, 3.4, MUZ, { edge: true });                      // short bear muzzle, turned his way
    h.rect(24, 16, 4, 2, NOSE); h.px(24, 16, '#5a5060');
    rigMouth(h, Q, 23, 20, 4, () => { h.rect(24, 20, 2, 1, G.s); h.px(23, 19, G.s); h.px(26, 19, G.s); });
  },
});
Object.assign(RIGGED, { slumbear: 'biped' });
// Fidgets (r111): a little routine each plays every so often while it stands around.
Object.assign(FIDGETS, {
  slumbear: { fps: 5, every: 9, frames: [{ eyes: 'blink', head: [0, 1] }, { eyes: 'sleep', head: [0, 2], body: 1 }, { eyes: 'sleep', head: [0, 2], body: 1 }, { eyes: 'hurt', head: [0, -1] }, { }] },   // dozes off and jolts awake
});

// ---- Slumbear's three bears (r134, the owner's idea): when he Restores, his jumbled bear data sorts itself
// into one bear, decided by the area he's in (data.js `areas`): Polarest (cold areas), Bambooze (green areas),
// Grizzleep (anywhere else). r135 (the owner: "what if they embraced their elements more and were more fierce
// since they have awakened?"): awake now, with glowing eyes in their element's colour under angry brows, a
// snarl with fangs and claws, and much more of their element. They share one round body (bearForm, bearDiag)
// and keep one mismatched ear from the jumble (earB) as a family mark; each adds its element (`extra`, drawn in
// layers: 'back' before the body, 'body' on it, 'head' after the head and arms). Side on, they show their right side.
const BEAR_DARK = '#1a1222', BEAR_FANG = '#fbf8f0';
function bearForm(g, v, F, extra) {
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  if (v === 'side') {
    X('back');
    legB.ellipse(16, 40, 4.5, 3, P(F.LEG.s, F.LEG.s, F.LEG.b), { edge: true });
    t.ellipse(6.5, 31, 2.4, 2.2, F.FUR, { edge: true });
    if (F.hump) b.ellipse(17, 19, 9, 5.5, F.FUR);
    b.ellipse(21, 28, 15, 13, F.FUR, { edge: true });
    if (F.CHEST) b.ellipse(30, 30, 4, 7, F.CHEST);
    X('body');
    legA.ellipse(28, 40, 4.5, 3, F.LEG, { edge: true });
    armA.ellipse(30, 28, 3.6, 5.5, F.ARM, { edge: true });
    armA.px(29, 33, F.CLAW).px(31, 34, F.CLAW).px(33, 33, F.CLAW);                                // claws
    earB.ellipse(20.5, 7, 2.4, 2.4, P(F.EAR_B.s, F.EAR_B.s, F.EAR_B.b));                        // far ear (the mismatched one)
    h.ellipse(26.5, 14, 9, 7.8, F.HEAD, { edge: true });
    earA.ellipse(23.5, 6.5, 3, 3, F.EAR_A, { edge: true });
    if (F.PATCH) h.poly([[26, 10.5], [32.5, 11.5], [32, 15], [27.5, 15.5]], F.PATCH);
    rigEye(h, Q, 29, 12, () => { h.rect(29, 12, 3, 2, F.EYE); h.px(30, 12, BEAR_DARK).px(30, 13, BEAR_DARK); if (F.BROW) h.px(28, 10, F.BROW).px(29, 10, F.BROW).px(30, 11, F.BROW).px(31, 11, F.BROW).px(32, 11, F.BROW); }, 3);   // a fierce glowing eye
    h.ellipse(33.5, 17.5, 3.6, 2.8, F.MUZ, { edge: true });
    h.rect(36, 16, 2, 2, F.NOSE); h.px(36, 16, '#5a5060');
    rigMouth(h, Q, 31, 20, 4, () => { h.rect(31, 20, 5, 1, BEAR_DARK); h.px(32, 21, BEAR_FANG).px(35, 21, BEAR_FANG); });   // a snarl and fangs
    X('head');
    return;
  }
  if (v === 'back') {
    X('back');
    legA.ellipse(14, 40, 5, 3.2, F.LEG, { edge: true }); legB.ellipse(30, 40, 5, 3.2, F.LEG, { edge: true });
    b.ellipse(22, 28, 16, 13, F.FUR, { edge: true });
    if (F.hump) b.ellipse(22, 19, 11, 4.5, F.FUR, { edge: true });
    X('body');
    armA.ellipse(7, 26, 3.8, 6, F.ARM, { edge: true }); armB.ellipse(37, 26, 3.8, 6, F.ARM, { edge: true });
    earA.ellipse(12, 6, 3.2, 3, F.EAR_B, { edge: true }); earB.ellipse(32, 6, 3.2, 3, F.EAR_A, { edge: true });   // from behind, the odd ear is on the left
    h.ellipse(22, 13, 11, 8.5, F.HEAD, { edge: true });
    t.ellipse(22, 37, 2.6, 2.2, F.FUR, { edge: true });
    X('head');
    return;
  }
  X('back');
  legA.ellipse(14, 40, 5, 3.2, F.LEG, { edge: true }); legB.ellipse(30, 40, 5, 3.2, F.LEG, { edge: true });
  legA.px(12, 42, F.CLAW).px(14, 43, F.CLAW).px(16, 42, F.CLAW); legB.px(28, 42, F.CLAW).px(30, 43, F.CLAW).px(32, 42, F.CLAW);   // claws
  b.ellipse(22, 28, 16, 13, F.FUR, { edge: true });                                              // big round body
  if (F.CHEST) b.ellipse(22, 30, 8.5, 8.5, F.CHEST);
  X('body');
  armA.ellipse(7, 26, 3.8, 6, F.ARM, { edge: true }); armB.ellipse(37, 26, 3.8, 6, F.ARM, { edge: true });
  armA.px(5, 32, F.CLAW).px(7, 33, F.CLAW).px(9, 32, F.CLAW); armB.px(35, 32, F.CLAW).px(37, 33, F.CLAW).px(39, 32, F.CLAW);
  earA.ellipse(12, 6, 3.2, 3, F.EAR_A, { edge: true }); earB.ellipse(32, 6, 3.2, 3, F.EAR_B, { edge: true });   // one ear left over from the jumble
  h.ellipse(22, 13, 11, 8.5, F.HEAD, { edge: true });                                            // head
  if (F.PATCH) { h.poly([[12, 10.5], [19, 12], [19, 15], [14, 15.5]], F.PATCH); h.poly([[32, 10.5], [25, 12], [25, 15], [30, 15.5]], F.PATCH); }   // fierce, slanted patches
  rigEyes(h, Q, 44, 15, 12, 3, () => {                                                           // fierce glowing eyes under angry brows
    h.rectM(15, 12, 3, 2, F.EYE); h.pxM(16, 12, BEAR_DARK); h.pxM(16, 13, BEAR_DARK);
    if (F.BROW) { h.pxM(14, 10, F.BROW); h.pxM(15, 10, F.BROW); h.pxM(16, 11, F.BROW); h.pxM(17, 11, F.BROW); h.pxM(18, 11, F.BROW); }
  });
  h.ellipse(22, 17.5, 5, 3.4, F.MUZ, { edge: true });                                            // muzzle
  h.rect(20, 15, 4, 2, F.NOSE); h.px(20, 15, '#5a5060');
  rigMouth(h, Q, 19, 19, 6, () => { h.rect(19, 19, 6, 1, BEAR_DARK); h.px(19, 18, F.MUZ.s).px(24, 18, F.MUZ.s); h.px(20, 20, BEAR_FANG).px(23, 20, BEAR_FANG); });   // a snarl, fangs showing
  X('head');
}
// The three-quarter views: the front or back view turned a little right (parts nudged), shared by all three.
function bearDiag(g, v, F, extra) {
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  X('back');
  legA.ellipse(14, 40, 5, 3.2, F.LEG, { edge: true }); legB.ellipse(29.5, 40, 4.5, 3, F.LEG, { edge: true });
  b.ellipse(22, 28, 16, 13, F.FUR, { edge: true });
  if (F.hump && v === 'bside') b.ellipse(23, 19, 10, 4.5, F.FUR, { edge: true });
  if (F.CHEST && v === 'fside') b.ellipse(24.5, 30, 8, 8.5, F.CHEST);
  X('body');
  armA.ellipse(7, 26, 3.8, 6, F.ARM, { edge: true }); armB.ellipse(37.5, 26, 3.2, 5.4, F.ARM, { edge: true });
  if (v === 'bside') {
    earA.ellipse(14, 6, 2.8, 2.7, F.EAR_B, { edge: true }); earB.ellipse(33, 6, 3.2, 3, F.EAR_A, { edge: true });
    h.ellipse(24, 13, 11, 8.5, F.HEAD, { edge: true });
    h.ellipse(35, 17, 1.8, 1.8, F.MUZ);                                                          // a sliver of muzzle peeking out
    t.ellipse(21, 37, 2.6, 2.2, F.FUR, { edge: true });
    X('head');
    return;
  }
  armA.px(5, 32, F.CLAW).px(7, 33, F.CLAW).px(9, 32, F.CLAW); armB.px(36, 31, F.CLAW).px(38, 32, F.CLAW);
  earA.ellipse(13, 6, 3.2, 3, F.EAR_A, { edge: true }); earB.ellipse(33.5, 6.5, 2.8, 2.7, F.EAR_B, { edge: true });
  h.ellipse(24, 13, 11, 8.5, F.HEAD, { edge: true });
  if (F.PATCH) { h.poly([[14, 10.5], [21, 12], [21, 15], [16, 15.5]], F.PATCH); h.poly([[32.5, 11], [27, 12], [27, 15], [31, 15.5]], F.PATCH); }
  rigEye(h, Q, 17, 12, () => { h.rect(17, 12, 3, 2, F.EYE); h.px(18, 12, BEAR_DARK).px(18, 13, BEAR_DARK); if (F.BROW) h.px(16, 10, F.BROW).px(17, 10, F.BROW).px(18, 11, F.BROW).px(19, 11, F.BROW).px(20, 11, F.BROW); }, 3);
  rigEye(h, Q, 28, 12, () => { h.rect(28, 12, 3, 2, F.EYE); h.px(29, 12, BEAR_DARK).px(29, 13, BEAR_DARK); if (F.BROW) h.px(27, 11, F.BROW).px(28, 11, F.BROW).px(29, 11, F.BROW).px(30, 10, F.BROW); }, 3);
  h.ellipse(25, 17.5, 5, 3.4, F.MUZ, { edge: true });
  h.rect(24, 15, 4, 2, F.NOSE); h.px(24, 15, '#5a5060');
  rigMouth(h, Q, 22, 19, 6, () => { h.rect(22, 19, 6, 1, BEAR_DARK); h.px(23, 20, BEAR_FANG).px(26, 20, BEAR_FANG); });
  X('head');
}
// The elements: ice (Polarest), bamboo (Bambooze), stone with glowing cracks (Grizzleep).
const BEAR_ICE = P('#bfe8f8', '#7ab8d8', '#eefcff'), BEAR_BAMBOO = P('#7ab84a', '#4a8a2e', '#a8dc78'), BEAR_LEAF = P('#5aaa3a', '#3a7a28', '#8ad860'),
  BEAR_STONE = P('#9a948a', '#6e6a62', '#bab4a8'), BEAR_MOSS = '#6a8a3a', BEAR_GLOW = '#ffb040';
const crystal = (p, x, y, s = 1) => p.poly([[x - 1.6 * s, y], [x + 1.6 * s, y], [x + 0.4 * s, y - 4.5 * s], [x - 0.6 * s, y - 3.5 * s]], BEAR_ICE, { edge: true });
// a bamboo shoot cut to a spear point, rising from y0 to y1, with a leaf
const bamboo = (p, x, y0, y1) => {
  p.rect(x, y1, 2, y0 - y1, BEAR_BAMBOO.b); p.rect(x, y1, 1, y0 - y1, BEAR_BAMBOO.l);
  for (let y = y1 + 3; y < y0; y += 4) p.rect(x, y, 2, 1, BEAR_BAMBOO.s);
  p.poly([[x, y1], [x + 2, y1], [x + 2, y1 - 3]], BEAR_BAMBOO, { edge: true });                    // cut to a point
  p.poly([[x + 1, y1 + 4], [x + 5, y1 + 1], [x + 2, y1 + 5]], BEAR_LEAF, { edge: true });
};
const stonePlate = (p, x, y, w, h2, glow = true) => {
  p.ellipse(x, y, w, h2, BEAR_STONE, { edge: true }); p.rect(Math.round(x - w + 1.5), Math.round(y - h2 + 0.5), Math.round(w * 1.4), 1, BEAR_MOSS);
  if (glow) { const cx = Math.round(x), cy = Math.round(y); p.px(cx - 1, cy, BEAR_GLOW).px(cx, cy + 1, BEAR_GLOW).px(cx + 1, cy, BEAR_GLOW); }   // a glowing crack
};
const POLAREST = { FUR: P('#f0f4f8', '#c4d2e2', '#ffffff'), ARM: P('#e6eef6', '#b8c8da', '#ffffff'), LEG: P('#e0e8f2', '#b0c0d4', '#f6faff'),
  HEAD: P('#f2f6fa', '#c8d6e6', '#ffffff'), MUZ: P('#fbfaf6', '#d8dce4', '#ffffff'), EAR_A: P('#f0f4f8', '#c4d2e2', '#ffffff'),
  EAR_B: P('#3a3640', '#25222a', '#56525e'), NOSE: '#1e1a22', CHEST: P('#dde8f2', '#b8c8d8', '#f0f6fc'),
  EYE: '#6ae8ff', BROW: '#3a4a5a', CLAW: '#9ad8f0' };
const BAMBOOZE = { FUR: P('#f4f0e6', '#d4ccbc', '#ffffff'), ARM: P('#3a3640', '#25222a', '#56525e'), LEG: P('#3a3640', '#25222a', '#56525e'),
  HEAD: P('#f6f2e8', '#d8d0c0', '#ffffff'), MUZ: P('#fbf8f0', '#ddd6c8', '#ffffff'), EAR_A: P('#3a3640', '#25222a', '#56525e'),
  EAR_B: P('#8a5a3a', '#6a4028', '#a87850'), NOSE: '#1e1a22', PATCH: P('#3a3640', '#25222a', '#56525e'),
  EYE: '#9aff5a', BROW: null, CLAW: '#e8e2d2' };
const GRIZZLEEP = { FUR: P('#8a5a3a', '#6a4028', '#a87850'), ARM: P('#7e5234', '#5e3c24', '#9a6e4c'), LEG: P('#6e4a30', '#4e341e', '#8a6444'),
  HEAD: P('#8e5e3e', '#6c442c', '#ac7c56'), MUZ: P('#d8b88a', '#b09068', '#f0d4a8'), EAR_A: P('#8a5a3a', '#6a4028', '#a87850'),
  EAR_B: P('#f1eee8', '#d2ccc0', '#ffffff'), NOSE: '#1e1a22', CHEST: P('#a87a52', '#86603e', '#c09468'), hump: true,
  EYE: '#ffb040', BROW: '#3a2418', CLAW: '#e8dcc0' };
// Polarest: jagged ice spikes bursting from its shoulders and back, a crown of icicles, frosty breath
function polarIce(layer, v, p) {
  const crown = (x) => { crystal(p.h, x - 4, 6.5, 1.1); crystal(p.h, x, 5.5, 1.6); crystal(p.h, x + 4, 6.5, 1.1); };
  if (v === 'side') {
    if (layer === 'body') for (const [x, y, k] of [[8, 21, 1.8], [13, 17, 2.3], [19, 15.5, 2.1], [24, 16, 1.4]]) crystal(p.b, x, y, k);
    if (layer === 'head') { crystal(p.h, 24, 6.5, 1.3); crystal(p.h, 28, 6, 1.1); p.h.px(38, 19, BEAR_ICE.l).px(39, 18, BEAR_ICE.b); }
    return;
  }
  if (v === 'back' || v === 'bside') { if (layer === 'head') { for (const [x, y, k] of [[8, 23, 1.8], [14.5, 21, 2.3], [22, 20, 2.7], [29.5, 21, 2.3], [36, 23, 1.8]]) crystal(p.b, x, y, k); crown(v === 'bside' ? 24 : 22); } return; }
  if (layer === 'head') {
    for (const [x, k] of [[6.5, 2.4], [11, 1.5], [37.5, 2.4], [33, 1.5]]) crystal(p.b, x, 22, k);    // ice bursting from its shoulders
    crown(v === 'fside' ? 24 : 22);                                                                 // a crown of icicles
    const mx = v === 'fside' ? 3 : 0; p.h.px(17 + mx, 21, BEAR_ICE.l).px(26 + mx, 21, BEAR_ICE.l).px(16 + mx, 22, BEAR_ICE.b).px(27 + mx, 22, BEAR_ICE.b);   // frosty breath
  }
}
// Bambooze: tall bamboo shoots cut to spear points on its back, a black band across its shoulders,
// bamboo bracers on its forearms, a bamboo staff held like a weapon
function pandaBamboo(layer, v, p) {
  const K = BAMBOOZE.ARM;
  const staff = (q, x0, y0, x1, y1) => { q.poly([[x0, y0], [x0 + 2, y0], [x1 + 2, y1], [x1, y1]], BEAR_BAMBOO, { edge: true }); for (let k = 1; k < 4; k++) q.px(Math.round(x0 + (x1 - x0) * k / 4), Math.round(y0 + (y1 - y0) * k / 4), BEAR_BAMBOO.s); };
  if (v === 'side') {
    if (layer === 'back') { bamboo(p.b, 9, 24, 3); bamboo(p.b, 13, 22, 6); bamboo(p.b, 6, 26, 10); }
    if (layer === 'body') p.b.ellipse(25, 19, 7, 4, K, { edge: true });
    if (layer === 'head') { staff(p.armA, 27, 38, 37, 6); p.armA.rect(28, 25, 5, 2, BEAR_BAMBOO.b); }   // the staff, and a bracer
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'back') { bamboo(p.b, 13, 24, 2); bamboo(p.b, 29, 23, 4); bamboo(p.b, 21, 22, 0); }
    if (layer === 'body') p.b.ellipse(22, 19, 13, 4.2, K, { edge: true });
    if (layer === 'head') { p.armA.rect(4, 27, 7, 2, BEAR_BAMBOO.b); p.armB.rect(34, 27, 7, 2, BEAR_BAMBOO.b); }
    return;
  }
  if (layer === 'back') { bamboo(p.b, 7, 24, 3); bamboo(p.b, 11, 22, 7); bamboo(p.b, 35, 24, 2); }   // spear-cut shoots rising behind it
  if (layer === 'body') p.b.ellipse(v === 'fside' ? 23 : 22, 19, 13, 4, K, { edge: true });             // the black band across its shoulders
  if (layer === 'head') {
    p.armA.rect(4, 27, 7, 2, BEAR_BAMBOO.b); p.armA.rect(4, 27, 7, 1, BEAR_BAMBOO.l); p.armB.rect(34, 27, 7, 2, BEAR_BAMBOO.b); p.armB.rect(34, 27, 7, 1, BEAR_BAMBOO.l);   // bamboo bracers
    staff(p.armB, 33, 40, 42, 8);                                                                 // a bamboo staff, held like a weapon
  }
}
// Grizzleep: heavy stone pauldrons and gauntlets, rock plates down its back, glowing amber cracks in the stone
function grizzlyStone(layer, v, p) {
  const gauntlet = (q, x, y) => { q.ellipse(x, y, 4.2, 3, BEAR_STONE, { edge: true }); q.px(Math.round(x) - 1, Math.round(y), BEAR_GLOW).px(Math.round(x), Math.round(y) - 1, BEAR_GLOW); };
  if (v === 'side') {
    if (layer === 'body') { stonePlate(p.b, 15, 17.5, 6.5, 3.4); stonePlate(p.b, 8, 23, 4.5, 2.8); stonePlate(p.b, 22, 17, 4.5, 2.4, false); }
    if (layer === 'head') { stonePlate(p.armA, 29.5, 23.5, 4.5, 2.6); gauntlet(p.armA, 30.5, 32); }
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'head') { stonePlate(p.armA, 7, 21, 5.5, 3.2); stonePlate(p.armB, 37, 21, 5.5, 3.2); stonePlate(p.b, 22, 27, 7.5, 3.4); stonePlate(p.b, 22, 33.5, 5.5, 2.6); gauntlet(p.armA, 7, 31); gauntlet(p.armB, 37, 31); }
    return;
  }
  if (layer === 'head') {
    stonePlate(p.armA, 7, 20.5, 5.5, 3.2); stonePlate(p.armB, 37, 20.5, 5.5, 3.2);                // heavy stone pauldrons
    gauntlet(p.armA, 7, 31); gauntlet(p.armB, 37, 31);                                             // stone gauntlets on its fists
  }
}
Object.assign(MONSTER_ART, {
  polarest(g, v = 'front') { bearForm(g, v, POLAREST, polarIce); },
  bambooze(g, v = 'front') { bearForm(g, v, BAMBOOZE, pandaBamboo); },
  grizzleep(g, v = 'front') { bearForm(g, v, GRIZZLEEP, grizzlyStone); },
});
Object.assign(MONSTER_ART_DIAG, {
  polarest(g, v) { bearDiag(g, v, POLAREST, polarIce); },
  bambooze(g, v) { bearDiag(g, v, BAMBOOZE, pandaBamboo); },
  grizzleep(g, v) { bearDiag(g, v, GRIZZLEEP, grizzlyStone); },
});
Object.assign(RIGGED, { polarest: 'biped', bambooze: 'biped', grizzleep: 'biped' });
Object.assign(FIDGETS, {
  polarest: { fps: 5, every: 9, frames: [{ head: [0, -1], mouth: 'open' }, { head: [0, -1], mouth: 'roar', arms: [1, 1] }, { mouth: 'open' }, { }] },   // a frosty growl
  bambooze: { fps: 5, every: 8, frames: [{ arms: [2, -2] }, { arms: [-2, 2] }, { arms: [2, -2], mouth: 'open' }, { arms: [-2, 2] }, { }] },   // twirls its staff
  grizzleep: { fps: 5, every: 10, frames: [{ arms: [2, 2] }, { arms: [-1, -1], body: 1 }, { arms: [2, 2], mouth: 'roar' }, { body: 1 }, { }] },   // pounds its stone fists together
});
