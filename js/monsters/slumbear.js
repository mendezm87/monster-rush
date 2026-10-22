// Slumbear: slumbear. Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
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
