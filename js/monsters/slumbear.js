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
    if (v === 'side') {   // his right side (facing left, ART_LEFT: his left side, white with the cream eye ring)
      const L = ART_LEFT, Kd = P(K.s, '#18161c', K.b);
      legB.ellipse(16, 40, 4.5, 3, L ? Kd : WHd, { edge: true });         // far leg
      t.ellipse(6, 31, 2.4, 2.2, K, { edge: true });                     // stubby black tail
      const E = [21, 28, 15, 13];
      b.ellipse(17, 19, 9, 5.5, L ? WH : G);                             // the grizzly's shoulder hump, flowing into his back
      slumBlock(b, E, 5, 14, 37, 30, L ? WH : G);                        // his shoulder and back: grizzly on his right, polar on his left
      slumBlock(b, E, 5, 30, 21, 43, L ? G : K, 0, 1);                   // his hip: black on his right, brown on his left, a pixel low
      slumBlock(b, E, 21, 30, 37, 43, CIN, 1, 0);                        // his belly: cinnamon, a pixel forward
      b.poly([[30, 24], [36, 25.5], [35.5, 30.5], [31, 29]], SUN);       // the golden crescent on his chest
      legA.ellipse(28, 40, 4.5, 3, L ? WH : K, { edge: true });          // near leg
      armA.ellipse(30, 28, 3.4, 5, L ? CIN : K, { edge: true });         // near arm
      slumMane(b, 25, 21, 7, 6);                                         // the shaggy mane round his neck
      earB.ellipse(20.5, 7, 2.4, 2.4, L ? Kd : WHd);                     // far ear
      h.ellipse(26, 14, 9, 7.8, L ? WH : G, { edge: true });             // his head, from this side
      earA.ellipse(23.5, 6.5, 3, 3, L ? WH : K, { edge: true });         // near ear
      if (L) { h.ellipse(29.5, 13.5, 2.8, 2.4, RING); rigEye(h, Q, 29, 13, () => { h.rect(29, 13, 2, 1, NOSE); }, 3); }   // the spectacled bear's eye ring
      else { h.poly([[27, 11], [32, 11.5], [32, 15], [28, 15.5]], K); rigEye(h, Q, 29, 13, () => { h.rect(29, 13, 2, 1, LID); h.px(30, 13, SHINE); }, 3); }   // the panda eye patch
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
    // Facing left (ART_LEFT), the two sides swap: the near side is his left (white, cinnamon arm, cream eye ring).
    const L = ART_LEFT, Kd = P(K.s, '#18161c', K.b);
    if (v === 'bside') {
      legA.ellipse(14, 40, 4.4, 3, L ? Kd : WHd, { edge: true }); legB.ellipse(30, 40, 5, 3.2, L ? WH : K, { edge: true });   // far leg, near leg
      b.ellipse(26, 19, 8, 5, L ? WH : G);                               // the shoulder hump on the near side
      slumBlock(b, E, 5, 14, 19, 30, L ? G : WH, -1, 0); slumBlock(b, E, 19, 14, 40, 30, L ? WH : G, 0, -1);
      slumBlock(b, E, 5, 30, 15, 43, L ? K : G, 0, 1); slumBlock(b, E, 15, 30, 27, 43, CIN); slumBlock(b, E, 27, 30, 40, 43, L ? G : K, 1, 0);
      armA.ellipse(7.5, 26, 3, 5.4, L ? K : CIN, { edge: true }); armB.ellipse(37, 26, 3.8, 6, L ? CIN : K, { edge: true });   // far arm, near arm
      slumMane(b, 24, 21, 13, 6);
      earA.ellipse(14, 6, 2.8, 2.7, L ? K : WH, { edge: true }); earB.ellipse(33, 6, 3.2, 3, L ? WH : K, { edge: true });
      slumBlock(h, HE, 12, 4, 24, 23, L ? G : WH, 0, 1); slumBlock(h, HE, 24, 4, 36, 23, L ? WH : G);   // the back of his head, turned a little
      h.ellipse(35, 17, 1.8, 1.8, MUZ);                                  // a sliver of muzzle peeking out
      t.ellipse(21, 37, 2.6, 2.2, K, { edge: true });
      return;
    }
    legA.ellipse(13, 40, 5, 3.2, L ? WH : K, { edge: true }); legB.ellipse(30, 40, 4.4, 3, L ? K : WH, { edge: true });   // near leg, far leg
    slumBlock(b, E, 5, 14, 24, 30, L ? WH : G);                          // the near side shows more as he turns
    slumBlock(b, E, 24, 14, 40, 30, L ? G : WH, 1, -1);
    slumBlock(b, E, 5, 30, 19, 43, L ? G : K, -1, 0);
    slumBlock(b, E, 19, 30, 31, 43, CIN, 0, 1);
    slumBlock(b, E, 31, 30, 40, 43, L ? K : G, 1, 0);
    b.poly([[17, 28], [20.5, 28], [21.8, 30.2], [24, 31], [24, 34.5], [18.5, 32.2]], SUN);   // the golden crescent, turned his way
    b.poly([[24, 32], [26, 31.2], [27, 29], [30, 29], [28.8, 33.2], [24, 35.5]], SUN);
    armA.ellipse(7, 27, 3.8, 6, L ? CIN : K, { edge: true }); armB.ellipse(37.5, 26, 3, 5.2, L ? K : CIN, { edge: true });   // near arm, far arm
    slumMane(b, 24, 22, 14, 6);
    earA.ellipse(13, 6, 3.2, 3, L ? WH : K, { edge: true }); earB.ellipse(33.5, 6.5, 2.8, 2.7, L ? K : WH, { edge: true });
    slumBlock(h, HE, 12, 4, 25, 23, L ? WH : G);                         // his face turned a little: the near half shows more
    slumBlock(h, HE, 25, 4, 36, 23, L ? G : WH, 0, 1);
    if (L) { h.ellipse(17.5, 13.5, 3, 2.6, RING); h.poly([[27, 10.5], [32, 11], [31.5, 14.5], [27.5, 15]], K); }   // cream eye ring (near), panda patch (far)
    else { h.poly([[15, 10], [21, 10.5], [21, 14.5], [16, 15]], K); h.ellipse(29.5, 13.5, 2.8, 2.4, RING); }        // panda patch (near), cream eye ring (far)
    rigEye(h, Q, 17, 12, () => { if (L) h.rect(17, 13, 3, 1, NOSE); else { h.rect(17, 12, 3, 1, LID); h.px(19, 12, SHINE); } }, 3);
    rigEye(h, Q, 28, 13, () => { if (L) { h.rect(28, 12, 3, 1, LID); h.px(28, 12, SHINE); } else h.rect(28, 13, 3, 1, NOSE); }, 3);
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

// ---- Slumbear's three bears: POLAROAR (id polarest), PANDAWN (bambooze), GRIZZQUAKE (grizzleep).
// r134 (the owner's idea): when he Restores, his jumbled bear data sorts itself into one bear, decided by the
// area he's in (data.js `areas`). r135: awakened and fierce, embracing their elements. r136: lean. r137 the
// names (the owner's picks; the sleepy ones, Polarest / Bambooze / Grizzleep, are kept as ids). r138 (the owner:
// "the sprites look pretty bad, put some effort into those"): redrawn as powerful bears in a fighting crouch:
// a deep barrel chest tapering to the hips, thick thighs, wide clawed paws, arms held out from the body, the
// head low and forward with a fur ruff under the chin, a heavy brow, a long snarling muzzle with four fangs,
// tufts of fur on the shoulders and back, and their element built into the body. One body for all three
// (bearForm, bearDiag); each keeps one mismatched ear from the jumble (earB); each adds its element (`extra`, in
// layers: 'back' before the body, 'body' on it, 'head' after the head and arms). Side on they show their right
// side; facing left (ART_LEFT, TWO_SIDED) the odd ear swaps sides.
const BEAR_DARK = '#1a1222', BEAR_FANG = '#fbf8f0';
// a pointed tuft of fur sticking out from (x, y) toward (x + dx, y + dy)
// one tapering shape per limb (stacked ellipses read as blobs): shoulder, elbow, a thick forearm, the paw
const BEAR_ARM = [[13, 18], [7.5, 18], [4.5, 20.5], [2.5, 25.5], [1.5, 30], [1, 34.5], [2.5, 37], [7, 36.5], [7.5, 33], [7.5, 29], [9.5, 25], [12.5, 22.5]];   // flaring out from the body, paw at the side
const BEAR_LEG = [[12, 30], [19.5, 30], [19.5, 34], [18.5, 38.5], [19.5, 42.5], [9.5, 42.5], [10, 38.5], [11, 34]];   // bowed apart
const bearMirror = (pts, dx = 0) => pts.map(([x, y]) => [44 - x + dx, y]);
const bearShift = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);
const bearTuft = (p, x, y, dx, dy, pal) => p.poly([[x - (dy ? 1 : 0), y - (dx ? 1 : 0)], [x + (dy ? 1 : 0), y + (dx ? 1 : 0)], [x + dx, y + dy]], pal, { edge: true });
function bearForm(g, v, F, extra) {
  if (ART_LEFT) F = { ...F, EAR_A: F.EAR_B, EAR_B: F.EAR_A };   // facing left: the odd ear is the near one
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  const Fd = pal => P(pal.s, pal.s, pal.b), claw = (p, x, y, n = 2) => { for (let i = 0; i < n; i++) p.px(x, y + i, F.CLAW); };
  if (v === 'side') {   // hunched forward like a bear about to charge
    X('back');
    legB.poly([[14, 30], [20, 30], [20, 35], [19, 39], [21, 42.5], [13.5, 42.5], [14.5, 39], [13.5, 35]], Fd(F.LEG), { edge: true });   // far leg
    t.ellipse(10, 30, 2, 1.8, F.FUR, { edge: true });
    b.poly([[11, 22], [16, 16], [24, 15], [30, 17], [32, 23], [30, 30], [25, 34], [15, 34], [11, 29]], F.FUR, { edge: true });   // a deep, hunched body
    if (F.hump) b.ellipse(19, 16.5, 6, 3.4, F.FUR);
    if (F.CHEST) b.ellipse(29, 25, 2.6, 5, F.CHEST);
    for (const [x, y] of [[16, 26], [20, 27], [24, 26]]) b.px(x, y, F.FUR.s);                       // fur texture
    bearTuft(b, 13, 19, -2, -2, F.FUR); bearTuft(b, 18, 15.5, -1, -3, F.FUR); bearTuft(b, 13, 31, -1, 2, F.FUR);   // tufts along its back and belly
    X('body');
    legA.poly([[19, 29], [27, 29], [27.5, 35], [26.5, 39], [29.5, 42.5], [19.5, 42.5], [20.5, 39], [19.5, 35]], F.LEG, { edge: true });   // near leg, thick
    legA.px(23, 34, F.LEG.s).px(24, 35, F.LEG.s); legA.px(30, 42, F.CLAW).px(28, 42, F.CLAW);
    armA.poly([[26, 18.5], [31.5, 19], [33.5, 23], [33, 27.5], [35.5, 31.5], [36.5, 35.5], [30, 35.8], [29.5, 31.5], [28, 27], [26.5, 23]], F.ARM, { edge: true });   // a thick arm reaching forward, big paw
    armA.px(30, 28, F.ARM.s).px(31, 29, F.ARM.s);
    claw(armA, 33, 35); claw(armA, 35, 35); armA.px(36, 34, F.CLAW);
    earB.ellipse(25, 7.2, 2, 2, Fd(F.EAR_B));                                                      // far ear
    bearTuft(b, 26, 18, -1, 3, F.HEAD);                                                            // the ruff under its jaw
    h.ellipse(30, 13, 7, 6, F.HEAD, { edge: true });                                               // head, low and forward
    h.rect(25, 9, 9, 1, F.HEAD.s);                                                                 // heavy brow
    earA.ellipse(27.5, 7, 2.5, 2.5, F.EAR_A, { edge: true });
    if (F.PATCH) h.poly([[29.5, 9.5], [35, 10.5], [34.5, 13.5], [30.5, 14]], F.PATCH);
    rigEye(h, Q, 31, 11, () => { h.rect(31, 11, 3, 2, F.EYE); h.px(32, 11, BEAR_DARK).px(32, 12, BEAR_DARK); if (F.BROW) h.px(30, 9, F.BROW).px(31, 9, F.BROW).px(32, 10, F.BROW).px(33, 10, F.BROW).px(34, 10, F.BROW); }, 3);   // a fierce glowing eye
    h.ellipse(36, 15.5, 4.2, 2.8, F.MUZ, { edge: true });                                          // a long muzzle
    h.rect(39, 14, 2, 2, F.NOSE); h.px(39, 14, '#5a5060');
    rigMouth(h, Q, 34, 17, 5, () => { h.rect(34, 17, 5, 1, BEAR_DARK); h.px(35, 18, BEAR_FANG).px(38, 18, BEAR_FANG); h.px(33, 16, F.MUZ.s); });   // a snarl and fangs
    X('head');
    return;
  }
  const torso = () => {
    b.poly([[10, 17], [34, 17], [36.5, 21], [32.5, 27], [29.5, 33], [14.5, 33], [11.5, 27], [7.5, 21]], F.FUR, { edge: true });   // a deep barrel chest tapering to the hips
    bearTuft(b, 7, 20, -2, -1, F.FUR); bearTuft(b, 37, 20, 2, -1, F.FUR);                           // shoulder tufts
    bearTuft(b, 10, 27, -2, 1, F.FUR); bearTuft(b, 34, 27, 2, 1, F.FUR);
  };
  const limbs = (front) => {   // thick arms held out from the body, big clawed paws
    armA.poly(BEAR_ARM, F.ARM, { edge: true }); armB.poly(bearMirror(BEAR_ARM), F.ARM, { edge: true });
    armA.px(8, 26, F.ARM.s).px(7, 27, F.ARM.s); armB.px(36, 26, F.ARM.s).px(37, 27, F.ARM.s);   // elbow creases
    if (front) { claw(armA, 1, 37); claw(armA, 3, 37.5); claw(armA, 5, 37.5); claw(armB, 43, 37); claw(armB, 41, 37.5); claw(armB, 39, 37.5); }
  };
  const legs = () => {
    legA.poly(BEAR_LEG, F.LEG, { edge: true }); legB.poly(bearMirror(BEAR_LEG), F.LEG, { edge: true });   // thick legs, wide paws
    legA.px(16, 39, F.LEG.s).px(28, 39, F.LEG.s);
  };
  if (v === 'back') {
    X('back');
    legs();
    torso();
    if (F.hump) b.ellipse(22, 17.5, 9, 3.6, F.FUR, { edge: true });
    for (let y = 21; y <= 32; y += 2) b.px(22, y, F.FUR.s);                                         // its spine
    b.px(15, 21, F.FUR.s).px(16, 22, F.FUR.s).px(29, 21, F.FUR.s).px(28, 22, F.FUR.s);              // shoulder blades
    X('body');
    limbs(false);
    earA.ellipse(14.5, 6.5, 2.6, 2.4, F.EAR_B, { edge: true }); earB.ellipse(29.5, 6.5, 2.6, 2.4, F.EAR_A, { edge: true });   // from behind, the odd ear is on the left
    h.ellipse(22, 12.5, 9, 7, F.HEAD, { edge: true });
    t.ellipse(22, 33.5, 2.2, 1.8, F.FUR, { edge: true });
    X('head');
    return;
  }
  X('back');
  legs();
  legA.px(11, 42, F.CLAW).px(13, 43, F.CLAW).px(15, 43, F.CLAW); legB.px(33, 42, F.CLAW).px(31, 43, F.CLAW).px(29, 43, F.CLAW);
  torso();
  if (F.CHEST) b.poly([[15, 19], [29, 19], [27, 27], [22, 30], [17, 27]], F.CHEST);                // a V of lighter fur on its chest
  for (let y = 21; y <= 26; y++) b.px(22, y, F.FUR.s);                                              // chest muscles
  b.px(19, 29, F.FUR.s).px(25, 29, F.FUR.s).px(20, 31, F.FUR.s).px(24, 31, F.FUR.s);
  X('body');
  limbs(true);
  earA.ellipse(14.5, 6.5, 2.6, 2.4, F.EAR_A, { edge: true }); earB.ellipse(29.5, 6.5, 2.6, 2.4, F.EAR_B, { edge: true });   // one ear left over from the jumble
  h.ellipse(22, 12.5, 9, 7, F.HEAD, { edge: true });                                             // head, low and forward
  bearTuft(h, 14, 15, -3, 1, F.HEAD); bearTuft(h, 30, 15, 3, 1, F.HEAD);                          // shaggy cheeks
  h.rect(15, 9, 14, 1, F.HEAD.s);                                                                  // heavy brow
  if (F.PATCH) { h.poly([[14.5, 10], [20, 11.5], [19.5, 14], [16, 14.5]], F.PATCH); h.poly([[29.5, 10], [24, 11.5], [24.5, 14], [28, 14.5]], F.PATCH); }   // slanted patches
  bearTuft(h, 16, 18, -1, 3, F.HEAD); bearTuft(h, 28, 18, 1, 3, F.HEAD);                            // shaggy fur under its jaw
  rigEyes(h, Q, 44, 17, 11, 3, () => {                                                             // fierce glowing eyes under angry brows
    h.rectM(17, 11, 3, 2, F.EYE); h.pxM(18, 11, BEAR_DARK); h.pxM(18, 12, BEAR_DARK);
    if (F.BROW) { h.pxM(16, 9, F.BROW); h.pxM(17, 9, F.BROW); h.pxM(18, 10, F.BROW); h.pxM(19, 10, F.BROW); h.pxM(20, 10, F.BROW); }
  });
  h.ellipse(22, 16.5, 4.6, 3.6, F.MUZ, { edge: true });                                            // a long muzzle
  h.rect(20, 14, 4, 1, F.NOSE); h.rect(21, 15, 2, 1, F.NOSE); h.px(20, 14, '#5a5060');
  rigMouth(h, Q, 19, 17, 6, () => { h.rect(19, 17, 6, 2, BEAR_DARK); h.px(19, 17, BEAR_FANG).px(24, 17, BEAR_FANG).px(20, 18, BEAR_FANG).px(23, 18, BEAR_FANG); h.px(18, 16, F.MUZ.s).px(25, 16, F.MUZ.s); });   // a snarl: fangs above and below
  X('head');
}
// The three-quarter views: turned a little right, shared by all three.
function bearDiag(g, v, F, extra) {
  if (ART_LEFT) F = { ...F, EAR_A: F.EAR_B, EAR_B: F.EAR_A };
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  const claw = (p, x, y, n = 2) => { for (let i = 0; i < n; i++) p.px(x, y + i, F.CLAW); };
  X('back');
  legA.poly(BEAR_LEG, F.LEG, { edge: true }); legB.poly(bearShift(bearMirror(BEAR_LEG), 1), F.LEG, { edge: true });
  b.poly([[10, 17], [34, 17], [36.5, 21], [32.5, 27], [29.5, 33], [14.5, 33], [11.5, 27], [7.5, 21]], F.FUR, { edge: true });
  bearTuft(b, 7, 20, -2, -1, F.FUR); bearTuft(b, 10, 27, -2, 1, F.FUR);
  if (F.hump && v === 'bside') b.ellipse(23, 17.5, 9, 3.6, F.FUR, { edge: true });
  if (F.CHEST && v === 'fside') b.poly([[17, 19], [31, 19], [29, 27], [24, 30], [19, 27]], F.CHEST);
  X('body');
  armA.poly(BEAR_ARM, F.ARM, { edge: true }); armB.poly(bearShift(bearMirror(BEAR_ARM), -1), F.ARM, { edge: true });
  armA.px(8, 26, F.ARM.s).px(7, 27, F.ARM.s);
  if (v === 'bside') {
    earA.ellipse(16, 6.5, 2.3, 2.2, F.EAR_B, { edge: true }); earB.ellipse(31, 6.5, 2.6, 2.4, F.EAR_A, { edge: true });
    h.ellipse(23.5, 12.5, 9, 7, F.HEAD, { edge: true });
    h.ellipse(31.5, 15, 1.8, 1.6, F.MUZ);                                                          // a sliver of muzzle peeking out
    t.ellipse(21, 33.5, 2.2, 1.8, F.FUR, { edge: true });
    X('head');
    return;
  }
  claw(armA, 1, 37); claw(armA, 3, 37.5); claw(armA, 5, 37.5); claw(armB, 42, 37); claw(armB, 40, 37.5); claw(armB, 38, 37.5);
  earA.ellipse(16, 6.5, 2.6, 2.4, F.EAR_A, { edge: true }); earB.ellipse(31, 6.8, 2.3, 2.2, F.EAR_B, { edge: true });
  h.ellipse(24, 12.5, 9, 7, F.HEAD, { edge: true });
  h.rect(17, 9, 14, 1, F.HEAD.s);
  if (F.PATCH) { h.poly([[16.5, 10], [21.5, 11.5], [21, 14], [17.5, 14.5]], F.PATCH); h.poly([[30.5, 10.5], [26.5, 11.5], [27, 14], [29.5, 14.5]], F.PATCH); }
  bearTuft(h, 16, 15, -3, 1, F.HEAD); bearTuft(h, 18, 18, -1, 3, F.HEAD); bearTuft(h, 30, 18, 1, 3, F.HEAD);
  rigEye(h, Q, 18.5, 11, () => { h.rect(18, 11, 3, 2, F.EYE); h.px(19, 11, BEAR_DARK).px(19, 12, BEAR_DARK); if (F.BROW) h.px(17, 9, F.BROW).px(18, 9, F.BROW).px(19, 10, F.BROW).px(20, 10, F.BROW).px(21, 10, F.BROW); }, 3);
  rigEye(h, Q, 27, 11, () => { h.rect(27, 11, 3, 2, F.EYE); h.px(28, 11, BEAR_DARK).px(28, 12, BEAR_DARK); if (F.BROW) h.px(26, 10, F.BROW).px(27, 10, F.BROW).px(28, 10, F.BROW).px(29, 9, F.BROW); }, 3);
  h.ellipse(25, 16.5, 4.6, 3.6, F.MUZ, { edge: true });
  h.rect(23, 14, 4, 1, F.NOSE); h.rect(24, 15, 2, 1, F.NOSE); h.px(23, 14, '#5a5060');
  rigMouth(h, Q, 22, 17, 6, () => { h.rect(22, 17, 6, 2, BEAR_DARK); h.px(22, 17, BEAR_FANG).px(27, 17, BEAR_FANG).px(23, 18, BEAR_FANG).px(26, 18, BEAR_FANG); });
  X('head');
}
// The elements: ice (Polaroar), bamboo (Pandawn), stone with glowing cracks (Grizzquake).
const BEAR_ICE = P('#8ad0f0', '#3e88c0', '#dff8ff'), BEAR_BAMBOO = P('#7ab84a', '#4a8a2e', '#a8dc78'), BEAR_LEAF = P('#5aaa3a', '#3a7a28', '#8ad860'),
  BEAR_STONE = P('#847d72', '#57514a', '#aca597'), BEAR_MOSS = '#6a8a3a', BEAR_GLOW = '#ffb040';
const crystal = (p, x, y, s = 1) => p.poly([[x - 1.6 * s, y], [x + 1.6 * s, y], [x + 0.4 * s, y - 4.5 * s], [x - 0.6 * s, y - 3.5 * s]], BEAR_ICE, { edge: true });
const iceShard = (p, x, y, dx, dy) => p.poly([[x, y - 1], [x, y + 1], [x + dx, y + dy]], BEAR_ICE, { edge: true });   // an ice shard pointing out
// a bamboo shoot cut to a spear point, rising from y0 to y1, with a leaf
const bamboo = (p, x, y0, y1) => {
  p.rect(x, y1, 2, y0 - y1, BEAR_BAMBOO.b); p.rect(x, y1, 1, y0 - y1, BEAR_BAMBOO.l);
  for (let y = y1 + 3; y < y0; y += 4) p.rect(x, y, 2, 1, BEAR_BAMBOO.s);
  p.poly([[x, y1], [x + 2, y1], [x + 2, y1 - 3]], BEAR_BAMBOO, { edge: true });
  p.poly([[x + 1, y1 + 4], [x + 5, y1 + 1], [x + 2, y1 + 5]], BEAR_LEAF, { edge: true });
};
const stonePlate = (p, x, y, w, h2, glow = true) => {
  p.poly([[x - w, y + 0.3 * h2], [x - 0.5 * w, y - h2], [x + 0.4 * w, y - h2], [x + w, y - 0.1 * h2], [x + 0.7 * w, y + h2], [x - 0.6 * w, y + h2]], BEAR_STONE, { edge: true });   // a broken slab of rock
  p.px(Math.round(x - 0.4 * w), Math.round(y - h2 + 1), BEAR_MOSS).px(Math.round(x - 0.4 * w) + 1, Math.round(y - h2 + 1), BEAR_MOSS);
  if (glow) { const cx = Math.round(x), cy = Math.round(y); p.px(cx - 1, cy, BEAR_GLOW).px(cx, cy + 1, BEAR_GLOW).px(cx + 1, cy, BEAR_GLOW); }   // a glowing crack
};
const POLAREST = { FUR: P('#e8eef6', '#a8b8d0', '#ffffff'), ARM: P('#e2eaf4', '#a2b4cc', '#ffffff'), LEG: P('#dae2ee', '#9caec8', '#f6faff'),
  HEAD: P('#f2f6fa', '#c4d2e2', '#ffffff'), MUZ: P('#fbfaf6', '#d8dce4', '#ffffff'), EAR_A: P('#eef3f8', '#bccbdd', '#ffffff'),
  EAR_B: P('#3a3640', '#25222a', '#56525e'), NOSE: '#1e1a22', CHEST: P('#d4e2f0', '#aec0d4', '#eef4fa'),
  EYE: '#6ae8ff', BROW: '#3a4a5a', CLAW: '#9ad8f0' };
const BAMBOOZE = { FUR: P('#f4f0e6', '#d4ccbc', '#ffffff'), ARM: P('#3a3640', '#25222a', '#56525e'), LEG: P('#3a3640', '#25222a', '#56525e'),
  HEAD: P('#f6f2e8', '#d8d0c0', '#ffffff'), MUZ: P('#fbf8f0', '#ddd6c8', '#ffffff'), EAR_A: P('#3a3640', '#25222a', '#56525e'),
  EAR_B: P('#8a5a3a', '#6a4028', '#a87850'), NOSE: '#1e1a22', PATCH: P('#3a3640', '#25222a', '#56525e'),
  EYE: '#9aff5a', BROW: null, CLAW: '#e8e2d2' };
const GRIZZLEEP = { FUR: P('#8a5a3a', '#663e26', '#a87850'), ARM: P('#7e5234', '#5a3a22', '#9a6e4c'), LEG: P('#6e4a30', '#4c321c', '#8a6444'),
  HEAD: P('#8e5e3e', '#6a422a', '#ac7c56'), MUZ: P('#d8b88a', '#b09068', '#f0d4a8'), EAR_A: P('#8a5a3a', '#663e26', '#a87850'),
  EAR_B: P('#f1eee8', '#d2ccc0', '#ffffff'), NOSE: '#1e1a22', CHEST: P('#a87a52', '#86603e', '#c09468'), hump: true,
  EYE: '#ffb040', BROW: '#3a2418', CLAW: '#e8dcc0' };
// Polaroar: clusters of ice crystals on its shoulders, shards along its forearms, an icy crest on its head,
// a ridge of ice down its spine, frost on its fur and frosty breath
function polarIce(layer, v, p) {
  if (v === 'side') {
    if (layer === 'body') for (const [x, y, k] of [[14, 17.5, 1.6], [18.5, 15.5, 2.1], [23, 15, 2.3], [27, 16.5, 1.5]]) crystal(p.b, x, y, k);   // the ridge down its back
    if (layer === 'head') {
      crystal(p.armA, 28, 20, 1.7); crystal(p.armA, 31, 20.5, 1.1); iceShard(p.armA, 33, 27, 3, 1); iceShard(p.armA, 34, 30, 2, 2);   // shoulder ice, forearm shards
      crystal(p.h, 28, 7.5, 1.3); crystal(p.h, 31, 7, 1);                                          // icy crest
      p.h.px(41, 17, BEAR_ICE.l).px(42, 16, BEAR_ICE.b).px(42, 18, BEAR_ICE.l);                       // frosty breath
    }
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'body') { crystal(p.b, 22, 22, 2.6); crystal(p.b, 22, 27.5, 1.9); crystal(p.b, 22, 32, 1.3); crystal(p.b, 18, 21, 1.4); crystal(p.b, 26, 21, 1.4); }   // the ridge down its spine
    if (layer === 'head') { crystal(p.armA, 8, 20, 2.2); crystal(p.armA, 11, 19, 1.3); crystal(p.armB, 36, 20, 2.2); crystal(p.armB, 33, 19, 1.3); crystal(p.h, v === 'bside' ? 23.5 : 22, 6.5, 1.5); }
    return;
  }
  if (layer === 'head') {
    crystal(p.armA, 7, 20, 2.3); crystal(p.armA, 10.5, 19, 1.4); crystal(p.armA, 4.5, 22, 1.1);   // clusters of ice on its shoulders
    crystal(p.armB, 37, 20, 2.3); crystal(p.armB, 33.5, 19, 1.4); crystal(p.armB, 39.5, 22, 1.1);
    iceShard(p.armA, 2, 28, -3, 0); iceShard(p.armA, 1, 31, -2, 1); iceShard(p.armB, 42, 28, 3, 0); iceShard(p.armB, 43, 31, 2, 1);   // shards along its forearms
    const cx = v === 'fside' ? 24 : 22;
    crystal(p.h, cx, 6.5, 1.5); crystal(p.h, cx - 3, 7, 0.9); crystal(p.h, cx + 3, 7, 0.9);          // an icy crest between its ears
  }
}
// Pandawn: the black band across its shoulders, a quiver of spear-cut bamboo on its back, leaf-wrapped
// forearms, a leaf headband with its tails flying, a bamboo staff held like a spear
function pandaBamboo(layer, v, p) {
  const K = BAMBOOZE.ARM;
  const staff = (q, x0, y0, x1, y1) => { q.poly([[x0, y0], [x0 + 2, y0], [x1 + 2, y1], [x1, y1]], BEAR_BAMBOO, { edge: true }); for (let k = 1; k < 5; k++) q.px(Math.round(x0 + (x1 - x0) * k / 5), Math.round(y0 + (y1 - y0) * k / 5), BEAR_BAMBOO.s); q.poly([[x1, y1], [x1 + 2, y1], [x1 + 2, y1 - 4]], BEAR_BAMBOO, { edge: true }); };
  const wrap = (q, x, y) => { q.rect(x, y, 6, 2, BEAR_LEAF.b); q.rect(x, y, 6, 1, BEAR_LEAF.l); q.px(x + 2, y + 2, BEAR_LEAF.s); };
  if (v === 'side') {
    if (layer === 'body') p.b.poly([[16, 16], [24, 15], [30, 17], [31, 21], [24, 21], [17, 20]], K, { edge: true });
    if (layer === 'head') {
      staff(p.armA, 27, 41, 37, 3);                                                                // the staff, held forward like a spear
      wrap(p.armA, 28, 27);
      p.h.rect(24, 8, 12, 1, BEAR_LEAF.b); p.h.poly([[24, 8], [19, 6], [20, 10]], BEAR_LEAF, { edge: true });   // the leaf headband, its tails flying back
    }
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'body') p.b.poly([[8, 17], [36, 17], [37.5, 21.5], [33, 23], [11, 23], [6.5, 21.5]], K, { edge: true });
    if (layer === 'head') {
      wrap(p.armA, 1, 30); wrap(p.armB, 37, 30);
      const cx = v === 'bside' ? 23.5 : 22;
      p.h.rect(cx - 8, 8, 16, 1, BEAR_LEAF.b); p.h.ellipse(cx, 8.5, 1.6, 1.3, BEAR_LEAF, { edge: true });   // the headband's knot
      p.h.poly([[cx - 1, 9], [cx - 3, 16], [cx - 1, 15]], BEAR_LEAF, { edge: true }); p.h.poly([[cx + 1, 9], [cx + 3, 16], [cx + 1, 15]], BEAR_LEAF, { edge: true });
    }
    return;
  }
  if (layer === 'body') p.b.poly([[8, 17], [36, 17], [37.5, 21.5], [33, 23], [11, 23], [6.5, 21.5]], K, { edge: true });   // the black band across its shoulders
  if (layer === 'head') {
    wrap(p.armA, 1, 30); wrap(p.armB, 37, 30);                                                     // leaf-wrapped forearms
    staff(p.armB, 33, 42, 41, 2);                                                                  // a bamboo staff, held like a spear
    const cx = v === 'fside' ? 24 : 22;
    p.h.rect(cx - 8, 8, 16, 1, BEAR_LEAF.b); p.h.rect(cx - 8, 7, 16, 1, BEAR_LEAF.l);                // a leaf headband
    p.h.poly([[cx - 8, 8], [cx - 13, 6], [cx - 12, 10]], BEAR_LEAF, { edge: true });                // its tails flying
  }
}
// Grizzquake: rock fused into its shoulders, forearms and spine, stone knuckles, glowing amber cracks
// running through the rock and into its fur like a fault line
function grizzlyStone(layer, v, p) {
  const knuckles = (q, x, y) => { q.ellipse(x, y, 3.4, 1.8, BEAR_STONE, { edge: true }); q.px(Math.round(x) - 1, Math.round(y), BEAR_GLOW).px(Math.round(x) + 1, Math.round(y), BEAR_GLOW); };
  if (v === 'side') {
    if (layer === 'body') {
      stonePlate(p.b, 15, 17.5, 4, 2.2); stonePlate(p.b, 21, 15.8, 4.5, 2.4); stonePlate(p.b, 27, 17.5, 3.6, 2, false);   // rock down its spine
      p.b.px(18, 21, BEAR_GLOW).px(19, 22, BEAR_GLOW).px(19, 23, BEAR_GLOW).px(20, 24, BEAR_GLOW);   // a glowing crack into its fur
    }
    if (layer === 'head') { stonePlate(p.armA, 29, 21, 3.4, 2.4); stonePlate(p.armA, 31.5, 28, 2.6, 2, false); knuckles(p.armA, 33, 33.5); }
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'body') { stonePlate(p.b, 22, 20.5, 4.5, 2.4); stonePlate(p.b, 22, 25.5, 4.8, 2.4); stonePlate(p.b, 22, 30.5, 3.8, 2); }   // its rock spine
    if (layer === 'head') { stonePlate(p.armA, 8.5, 20, 4.6, 3); stonePlate(p.armB, 35.5, 20, 4.6, 3); stonePlate(p.armA, 4.5, 29.5, 3, 2.4, false); stonePlate(p.armB, 39.5, 29.5, 3, 2.4, false); }
    return;
  }
  if (layer === 'body') { p.b.px(14, 22, BEAR_GLOW).px(15, 23, BEAR_GLOW).px(15, 24, BEAR_GLOW).px(16, 25, BEAR_GLOW); p.b.px(30, 22, BEAR_GLOW).px(29, 23, BEAR_GLOW).px(29, 24, BEAR_GLOW).px(28, 25, BEAR_GLOW); }   // glowing cracks into its fur
  if (layer === 'head') {
    stonePlate(p.armA, 8, 20, 4.6, 3); stonePlate(p.armA, 11, 18.5, 2.6, 1.8, false);                // rock fused into its shoulders
    stonePlate(p.armB, 36, 20, 4.6, 3); stonePlate(p.armB, 33, 18.5, 2.6, 1.8, false);
    stonePlate(p.armA, 4.5, 29.5, 3, 2.4, false); stonePlate(p.armB, 39.5, 29.5, 3, 2.4, false);      // and its forearms
    knuckles(p.armA, 4, 35); knuckles(p.armB, 40, 35);                                              // stone knuckles
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
Object.assign(TWO_SIDED, { slumbear: true, polarest: true, bambooze: true, grizzleep: true });   // their sides differ: own facing-left pictures (sprites.js)
Object.assign(FIDGETS, {
  polarest: { fps: 5, every: 9, frames: [{ head: [0, -1], mouth: 'open' }, { head: [0, -1], mouth: 'roar', arms: [1, 1] }, { mouth: 'open' }, { }] },   // a frosty growl
  bambooze: { fps: 5, every: 8, frames: [{ arms: [2, -2] }, { arms: [-2, 2] }, { arms: [2, -2], mouth: 'open' }, { arms: [-2, 2] }, { }] },   // twirls its staff
  grizzleep: { fps: 5, every: 10, frames: [{ arms: [2, 2] }, { arms: [-1, -1], body: 1 }, { arms: [2, 2], mouth: 'roar' }, { body: 1 }, { }] },   // pounds its stone fists together
});
