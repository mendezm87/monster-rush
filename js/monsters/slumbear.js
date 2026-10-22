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

// ---- Slumbear's three bears (r134, the owner's idea): when he Restores, his jumbled bear data sorts itself
// into one bear, decided by the area he's in (data.js `areas`): Polarest (cold areas), Bambooze (green areas),
// Grizzleep (anywhere else). r135 (the owner: "embrace their elements more and be more fierce since they have
// awakened"): glowing eyes in their element's colour under angry brows, a snarl with fangs, claws, much more of
// their element. r136 (the owner: "what if they shed their weight and are pretty lean now?"): lean hunters,
// standing tall: broad shoulders, a narrow waist, long limbs, a smaller head. They share one body (bearForm,
// bearDiag) and keep one mismatched ear from the jumble (earB) as a family mark; each adds its element (`extra`,
// drawn in layers: 'back' before the body, 'body' on it, 'head' after the head and arms). Side on, they show
// their right side.
const BEAR_DARK = '#1a1222', BEAR_FANG = '#fbf8f0';
function bearForm(g, v, F, extra) {
  if (ART_LEFT) F = { ...F, EAR_A: F.EAR_B, EAR_B: F.EAR_A };   // facing left: the odd ear is the near one
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  const Fd = pal => P(pal.s, pal.s, pal.b);
  const claws = (p, pts) => { for (const [x, y] of pts) p.px(x, y, F.CLAW); };
  if (v === 'side') {
    X('back');
    legB.ellipse(19, 37, 3, 5.5, Fd(F.LEG), { edge: true }); legB.ellipse(20, 41.5, 3.6, 1.8, Fd(F.LEG), { edge: true });   // far leg
    t.ellipse(14, 32, 2, 2, F.FUR, { edge: true });
    if (F.hump) b.ellipse(18, 19.5, 5.5, 3.5, F.FUR);                                            // the grizzly's shoulder hump
    b.poly([[15, 19], [27, 18], [29, 26], [27, 34], [17, 34.5], [14, 27]], F.FUR, { edge: true });   // lean, deep-chested body
    if (F.CHEST) b.ellipse(26.5, 25, 2.6, 5, F.CHEST);
    b.px(20, 29, F.FUR.s).px(21, 31, F.FUR.s);
    X('body');
    legA.ellipse(24, 37, 3.4, 5.5, F.LEG, { edge: true }); legA.ellipse(25.5, 41.5, 4, 2, F.LEG, { edge: true });   // near leg, long
    claws(legA, [[28, 42], [29, 41]]);
    armA.ellipse(26, 27, 3, 7.5, F.ARM, { edge: true }); armA.ellipse(27, 34, 3, 2.3, F.ARM, { edge: true });   // a long arm
    claws(armA, [[25, 36], [27, 37], [29, 36]]);
    earB.ellipse(22.5, 6.5, 2.2, 2.2, Fd(F.EAR_B));                                              // far ear (the mismatched one)
    h.ellipse(26, 12, 7.5, 6.5, F.HEAD, { edge: true });                                         // a smaller head
    earA.ellipse(24, 6, 2.8, 2.8, F.EAR_A, { edge: true });
    if (F.PATCH) h.poly([[26, 8.5], [31.5, 9.5], [31, 13], [27, 13.5]], F.PATCH);
    rigEye(h, Q, 28, 10, () => { h.rect(28, 10, 3, 2, F.EYE); h.px(29, 10, BEAR_DARK).px(29, 11, BEAR_DARK); if (F.BROW) h.px(27, 8, F.BROW).px(28, 8, F.BROW).px(29, 9, F.BROW).px(30, 9, F.BROW).px(31, 9, F.BROW); }, 3);
    h.ellipse(32, 15, 3.8, 2.6, F.MUZ, { edge: true });                                          // longer muzzle
    h.rect(35, 13, 2, 2, F.NOSE); h.px(35, 13, '#5a5060');
    rigMouth(h, Q, 30, 17, 4, () => { h.rect(30, 17, 5, 1, BEAR_DARK); h.px(31, 18, BEAR_FANG).px(34, 18, BEAR_FANG); });   // a snarl and fangs
    X('head');
    return;
  }
  const torso = () => {
    b.poly([[10, 18], [34, 18], [31, 30], [27, 34.5], [17, 34.5], [13, 30]], F.FUR, { edge: true });   // broad shoulders, narrow waist
    b.ellipse(11.5, 20, 4.5, 3.8, F.FUR, { edge: true }); b.ellipse(32.5, 20, 4.5, 3.8, F.FUR, { edge: true });   // muscled shoulders
  };
  const limbs = () => {
    armA.ellipse(8.5, 27, 3, 7.5, F.ARM, { edge: true }); armB.ellipse(35.5, 27, 3, 7.5, F.ARM, { edge: true });   // long arms
    armA.ellipse(8.5, 34, 3.2, 2.4, F.ARM, { edge: true }); armB.ellipse(35.5, 34, 3.2, 2.4, F.ARM, { edge: true });
  };
  if (v === 'back') {
    X('back');
    legA.ellipse(16.5, 37, 3.4, 5.5, F.LEG, { edge: true }); legB.ellipse(27.5, 37, 3.4, 5.5, F.LEG, { edge: true });
    legA.ellipse(16, 41.5, 4, 2, F.LEG, { edge: true }); legB.ellipse(28, 41.5, 4, 2, F.LEG, { edge: true });
    torso();
    if (F.hump) b.ellipse(22, 19, 8, 3.6, F.FUR, { edge: true });
    for (let y = 22; y <= 32; y += 2) b.px(22, y, F.FUR.s);                                      // the line of its spine
    X('body');
    limbs();
    earA.ellipse(14.5, 6, 2.8, 2.6, F.EAR_B, { edge: true }); earB.ellipse(29.5, 6, 2.8, 2.6, F.EAR_A, { edge: true });   // from behind, the odd ear is on the left
    h.ellipse(22, 12, 8.5, 7, F.HEAD, { edge: true });
    t.ellipse(22, 34.5, 2.2, 2, F.FUR, { edge: true });
    X('head');
    return;
  }
  X('back');
  legA.ellipse(16.5, 37, 3.4, 5.5, F.LEG, { edge: true }); legB.ellipse(27.5, 37, 3.4, 5.5, F.LEG, { edge: true });   // long legs
  legA.ellipse(16, 41.5, 4, 2, F.LEG, { edge: true }); legB.ellipse(28, 41.5, 4, 2, F.LEG, { edge: true });
  claws(legA, [[13, 42], [15, 43], [17, 43]]); claws(legB, [[27, 43], [29, 43], [31, 42]]);
  torso();
  if (F.CHEST) b.ellipse(22, 25, 5.5, 6, F.CHEST);
  b.px(20, 29, F.FUR.s).px(24, 29, F.FUR.s).px(20, 31, F.FUR.s).px(24, 31, F.FUR.s);              // a lean, muscled stomach
  X('body');
  limbs();
  claws(armA, [[6, 36], [8, 37], [10, 36]]); claws(armB, [[34, 36], [36, 37], [38, 36]]);
  earA.ellipse(14.5, 6, 2.8, 2.6, F.EAR_A, { edge: true }); earB.ellipse(29.5, 6, 2.8, 2.6, F.EAR_B, { edge: true });   // one ear left over from the jumble
  h.ellipse(22, 12, 8.5, 7, F.HEAD, { edge: true });                                             // a smaller head on a lean body
  if (F.PATCH) { h.poly([[14.5, 9.5], [20, 11], [20, 13.5], [16, 14]], F.PATCH); h.poly([[29.5, 9.5], [24, 11], [24, 13.5], [28, 14]], F.PATCH); }   // slanted patches
  rigEyes(h, Q, 44, 17, 11, 3, () => {                                                           // fierce glowing eyes under angry brows
    h.rectM(17, 11, 3, 2, F.EYE); h.pxM(18, 11, BEAR_DARK); h.pxM(18, 12, BEAR_DARK);
    if (F.BROW) { h.pxM(16, 9, F.BROW); h.pxM(17, 9, F.BROW); h.pxM(18, 10, F.BROW); h.pxM(19, 10, F.BROW); h.pxM(20, 10, F.BROW); }
  });
  h.ellipse(22, 15.5, 4, 2.8, F.MUZ, { edge: true });                                            // muzzle
  h.rect(20, 14, 4, 1, F.NOSE); h.rect(21, 15, 2, 1, F.NOSE); h.px(20, 14, '#5a5060');
  rigMouth(h, Q, 19, 17, 6, () => { h.rect(19, 17, 6, 1, BEAR_DARK); h.px(20, 18, BEAR_FANG).px(23, 18, BEAR_FANG); });   // a snarl, fangs showing
  X('head');
}
// The three-quarter views: the front or back view turned a little right, shared by all three.
function bearDiag(g, v, F, extra) {
  if (ART_LEFT) F = { ...F, EAR_A: F.EAR_B, EAR_B: F.EAR_A };   // facing left: the odd ear swaps sides
  const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
  const P2 = { b, h, t, earA, earB, armA, armB }, X = layer => extra && extra(layer, v, P2);
  const claws = (p, pts) => { for (const [x, y] of pts) p.px(x, y, F.CLAW); };
  X('back');
  legA.ellipse(16.5, 37, 3.4, 5.5, F.LEG, { edge: true }); legB.ellipse(27.5, 37, 3.1, 5.2, F.LEG, { edge: true });
  legA.ellipse(16.5, 41.5, 4, 2, F.LEG, { edge: true }); legB.ellipse(28.5, 41.5, 3.6, 1.8, F.LEG, { edge: true });
  b.poly([[10, 18], [34, 18], [31, 30], [27, 34.5], [17, 34.5], [13, 30]], F.FUR, { edge: true });
  b.ellipse(11.5, 20, 4.5, 3.8, F.FUR, { edge: true }); b.ellipse(32.5, 20, 4, 3.4, F.FUR, { edge: true });
  if (F.hump && v === 'bside') b.ellipse(22, 19, 8, 3.6, F.FUR, { edge: true });
  if (F.CHEST && v === 'fside') b.ellipse(24, 25, 5, 6, F.CHEST);
  X('body');
  armA.ellipse(8.5, 27, 3, 7.5, F.ARM, { edge: true }); armB.ellipse(35.5, 27, 2.7, 7, F.ARM, { edge: true });
  armA.ellipse(8.5, 34, 3.2, 2.4, F.ARM, { edge: true }); armB.ellipse(35.5, 33.5, 2.8, 2.2, F.ARM, { edge: true });
  if (v === 'bside') {
    earA.ellipse(16, 6, 2.5, 2.4, F.EAR_B, { edge: true }); earB.ellipse(30.5, 6, 2.8, 2.6, F.EAR_A, { edge: true });
    h.ellipse(23.5, 12, 8.5, 7, F.HEAD, { edge: true });
    h.ellipse(31.5, 15, 1.6, 1.6, F.MUZ);                                                        // a sliver of muzzle peeking out
    t.ellipse(21, 34.5, 2.2, 2, F.FUR, { edge: true });
    X('head');
    return;
  }
  claws(armA, [[6, 36], [8, 37], [10, 36]]); claws(armB, [[34, 35], [36, 36]]);
  earA.ellipse(15.5, 6, 2.8, 2.6, F.EAR_A, { edge: true }); earB.ellipse(31, 6.5, 2.5, 2.4, F.EAR_B, { edge: true });
  h.ellipse(23.5, 12, 8.5, 7, F.HEAD, { edge: true });
  if (F.PATCH) { h.poly([[16, 9.5], [21.5, 11], [21.5, 13.5], [17.5, 14]], F.PATCH); h.poly([[30.5, 10], [26, 11], [26, 13.5], [29.5, 14]], F.PATCH); }
  rigEye(h, Q, 18.5, 11, () => { h.rect(18, 11, 3, 2, F.EYE); h.px(19, 11, BEAR_DARK).px(19, 12, BEAR_DARK); if (F.BROW) h.px(17, 9, F.BROW).px(18, 9, F.BROW).px(19, 10, F.BROW).px(20, 10, F.BROW).px(21, 10, F.BROW); }, 3);
  rigEye(h, Q, 27, 11, () => { h.rect(27, 11, 3, 2, F.EYE); h.px(28, 11, BEAR_DARK).px(28, 12, BEAR_DARK); if (F.BROW) h.px(26, 10, F.BROW).px(27, 10, F.BROW).px(28, 10, F.BROW).px(29, 9, F.BROW); }, 3);
  h.ellipse(24.5, 15.5, 4, 2.8, F.MUZ, { edge: true });
  h.rect(23, 14, 4, 1, F.NOSE); h.rect(24, 15, 2, 1, F.NOSE); h.px(23, 14, '#5a5060');
  rigMouth(h, Q, 22, 17, 6, () => { h.rect(22, 17, 6, 1, BEAR_DARK); h.px(23, 18, BEAR_FANG).px(26, 18, BEAR_FANG); });
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
  const crown = x => { crystal(p.h, x - 4, 5.5, 1); crystal(p.h, x, 4.5, 1.5); crystal(p.h, x + 4, 5.5, 1); };
  if (v === 'side') {
    if (layer === 'body') for (const [x, y, k] of [[15, 21, 1.6], [19, 19, 2.1], [23.5, 18.5, 1.5]]) crystal(p.b, x, y, k);
    if (layer === 'head') { crystal(p.h, 22.5, 5.5, 1.2); crystal(p.h, 26.5, 5, 1); p.h.px(37, 16, BEAR_ICE.l).px(38, 15, BEAR_ICE.b); }
    return;
  }
  if (v === 'back' || v === 'bside') { if (layer === 'head') { for (const [x, y, k] of [[9.5, 20, 1.7], [15, 19, 2.1], [22, 18.5, 2.5], [29, 19, 2.1], [34.5, 20, 1.7]]) crystal(p.b, x, y, k); crown(v === 'bside' ? 23.5 : 22); } return; }
  if (layer === 'head') {
    for (const [x, k] of [[9, 2.3], [13, 1.4], [35, 2.3], [31, 1.4]]) crystal(p.b, x, 19.5, k);   // ice bursting from its shoulders
    crown(v === 'fside' ? 23.5 : 22);                                                               // a crown of icicles
    const mx = v === 'fside' ? 3 : 0; p.h.px(18 + mx, 18, BEAR_ICE.l).px(25 + mx, 18, BEAR_ICE.l).px(17 + mx, 19, BEAR_ICE.b).px(26 + mx, 19, BEAR_ICE.b);   // frosty breath
  }
}
// Bambooze: bamboo shoots cut to spear points on its back, a black band across its shoulders,
// bamboo bracers on its forearms, a bamboo staff held like a weapon
function pandaBamboo(layer, v, p) {
  const K = BAMBOOZE.ARM;
  const staff = (q, x0, y0, x1, y1) => { q.poly([[x0, y0], [x0 + 2, y0], [x1 + 2, y1], [x1, y1]], BEAR_BAMBOO, { edge: true }); for (let k = 1; k < 4; k++) q.px(Math.round(x0 + (x1 - x0) * k / 4), Math.round(y0 + (y1 - y0) * k / 4), BEAR_BAMBOO.s); };
  if (v === 'side') {
    if (layer === 'back') { bamboo(p.b, 15, 22, 2); bamboo(p.b, 18, 20, 6); }
    if (layer === 'body') p.b.ellipse(22.5, 19.5, 6, 3, K, { edge: true });
    if (layer === 'head') { staff(p.armA, 23, 40, 34, 4); p.armA.rect(23.5, 28, 5, 2, BEAR_BAMBOO.b); }   // the staff, and a bracer
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'back') { bamboo(p.b, 13, 22, 1); bamboo(p.b, 29, 22, 3); bamboo(p.b, 21, 20, 0); }
    if (layer === 'body') p.b.ellipse(22, 19.5, 12.5, 3.4, K, { edge: true });
    if (layer === 'head') { p.armA.rect(5.5, 28, 6, 2, BEAR_BAMBOO.b); p.armB.rect(32.5, 28, 6, 2, BEAR_BAMBOO.b); }
    return;
  }
  if (layer === 'back') { bamboo(p.b, 8, 22, 2); bamboo(p.b, 12, 20, 6); bamboo(p.b, 34, 22, 1); }   // spear-cut shoots rising behind it
  if (layer === 'body') p.b.ellipse(v === 'fside' ? 23 : 22, 19.5, 12.5, 3.2, K, { edge: true });     // the black band across its shoulders
  if (layer === 'head') {
    p.armA.rect(5.5, 28, 6, 2, BEAR_BAMBOO.b); p.armA.rect(5.5, 28, 6, 1, BEAR_BAMBOO.l); p.armB.rect(32.5, 28, 6, 2, BEAR_BAMBOO.b); p.armB.rect(32.5, 28, 6, 1, BEAR_BAMBOO.l);   // bamboo bracers
    staff(p.armB, 32, 42, 41, 6);                                                                 // a bamboo staff, held like a weapon
  }
}
// Grizzleep: heavy stone pauldrons and gauntlets, rock plates down its back, glowing amber cracks in the stone
function grizzlyStone(layer, v, p) {
  const gauntlet = (q, x, y) => { q.ellipse(x, y, 3.8, 2.8, BEAR_STONE, { edge: true }); q.px(Math.round(x) - 1, Math.round(y), BEAR_GLOW).px(Math.round(x), Math.round(y) - 1, BEAR_GLOW); };
  if (v === 'side') {
    if (layer === 'body') { stonePlate(p.b, 17, 23, 3.6, 2.4); stonePlate(p.b, 17, 29, 3, 2, false); }
    if (layer === 'head') { stonePlate(p.armA, 25.5, 20, 4.5, 2.8); gauntlet(p.armA, 27, 34); }
    return;
  }
  if (v === 'back' || v === 'bside') {
    if (layer === 'head') { stonePlate(p.armA, 10, 19, 5, 3); stonePlate(p.armB, 34, 19, 5, 3); stonePlate(p.b, 22, 25, 6, 3); stonePlate(p.b, 22, 30.5, 4.5, 2.4); gauntlet(p.armA, 8.5, 34); gauntlet(p.armB, 35.5, 34); }
    return;
  }
  if (layer === 'head') {
    stonePlate(p.armA, 10, 19, 5, 3); stonePlate(p.armB, 34, 19, 5, 3);                          // heavy stone pauldrons
    gauntlet(p.armA, 8.5, 34); gauntlet(p.armB, 35.5, 34);                                         // stone gauntlets on its fists
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
