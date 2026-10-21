// Slumbear redesign mock-up, J2 "scrambled data" (r126; not loaded by the game). The owner liked the stitched
// jumbled-bears mock-up and asked for a J2 version to compare: the same mix of bears, but the jumble shows as
// blocky sections of different bears' fur that don't quite line up (each block nudged a pixel), with faintly
// glowing data seams between them, and a sloth bear's shaggy mane round its shoulders.
// r127: the glow cut back to two seams; r128 (the owner): no glowing seams at all, and the same colours on
// the same parts from every angle (see the colour map in the art function).
// To see it: (0, eval)(await (await fetch('docs/samples/slumbear-j2.js')).text()) adds 'slumbearJ2'.
(function () {
  const G = P('#8a5a3a', '#6a4028', '#a87850'), WH = P('#f1eee8', '#d2ccc0', '#ffffff'), K = P('#3a3640', '#25222a', '#56525e');
  const CIN = P('#b8703e', '#8c522c', '#d6905c'), SUN = P('#e2b264', '#b88a44', '#f2d49a'), RING = '#efe0b8', MUZ = P('#e8dcc0', '#c8b898', '#f8f0dc');
  const MANE = P('#2a262c', '#18161a', '#423c46'), DATA = '#8ee4ff', DATAD = '#4aa8d0', NOSE = '#1e1a22';
  // one block of fur: the part of the ellipse (cx, cy, rx, ry) inside the box x0..x1, y0..y1, nudged by (dx, dy)
  // so blocks don't quite line up; its top and left edges are shaded, and with glow set its left edge is
  // a glowing data seam instead (r127, the owner: only one or two glowing seams)
  const block = (p, [cx, cy, rx, ry], x0, y0, x1, y1, pal, dx = 0, dy = 0, glow = false) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const X = x - dx, Y = y - dy;
      if (((X + 0.5 - cx) / rx) ** 2 + ((Y + 0.5 - cy) / ry) ** 2 > 1) continue;
      const k = ((x - x0) / Math.max(1, x1 - x0)) * 0.4 + ((y - y0) / Math.max(1, y1 - y0)) * 0.9;
      const top = y === y0 && y0 > cy - ry + 1, left = x === x0 && x0 > cx - rx + 1;
      p.px(x, y, glow && left ? ((x + y) % 3 ? DATA : DATAD) : top || left ? pal.s : k > 0.95 ? pal.s : k < 0.22 ? pal.l : pal.b);
    }
  };
  const mane = (p, cx, cy, w, h) => {   // a sloth bear's shaggy black mane: a jagged fringe
    const pts = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (i / 14), r = i % 2 ? 0.8 : 1.15; pts.push([cx - Math.cos(a) * w, cy - h * 0.5 + Math.sin(a) * h * r]); }   // tufts hanging down
    p.poly(pts, MANE, { edge: true });
  };

  MONSTER_ART.slumbearJ2 = function (g, v = 'front') {
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    // One colour map for every view (r128, the owner: "his colors change when viewed from the side").
    // His right side: brown head half with the panda eye patch, black ear, arm, leg and hip, brown shoulder.
    // His left side: white head half with the cream eye ring, white ear and leg, cinnamon arm, white shoulder,
    // brown hip. A cinnamon belly, the golden crescent on his chest, the black mane under his chin.
    // The side view shows his right side.
    if (side) {
      legB.ellipse(16, 40, 4.5, 3, P(WH.s, '#b8b2a6', WH.b), { edge: true });   // far leg: his left, white
      t.ellipse(6, 31, 2.4, 2.2, K, { edge: true });
      const E = [21, 28, 15, 13];
      block(b, E, 5, 14, 37, 30, G);                                   // his right shoulder and back: grizzly
      b.ellipse(14, 19, 6.5, 3.6, G, { edge: true });                  // the grizzly's hump
      block(b, E, 5, 30, 21, 43, K, 0, 1);                              // his right hip: black, a pixel low
      block(b, E, 21, 30, 37, 43, CIN, 1, 0);                           // his belly: cinnamon, a pixel forward
      b.poly([[30, 24], [36, 25.5], [35.5, 30.5], [31, 29]], SUN);      // the golden crescent on his chest
      legA.ellipse(28, 40, 4.5, 3, K, { edge: true });                  // near leg: his right, black
      armA.ellipse(30, 28, 3.4, 5, K, { edge: true });                  // near arm: his right, black
      mane(b, 25, 21, 7, 6);                                           // the shaggy mane round his neck
      earB.ellipse(20.5, 7, 2.4, 2.4, P(WH.s, '#b8b2a6', WH.b));         // far ear: his left, white
      h.ellipse(26, 14, 9, 7.8, G, { edge: true });                    // his head, from his brown right side
      earA.ellipse(23.5, 6.5, 3, 3, K, { edge: true });                 // near ear: his right, black
      h.poly([[27, 11], [32, 11.5], [32, 15], [28, 15.5]], K);          // the panda eye patch
      rigEye(h, Q, 29, 13, () => { h.rect(29, 13, 2, 1, '#e6ddcc'); h.px(30, 13, '#fffaf2'); }, 3);
      h.ellipse(33.5, 17.5, 3.4, 2.8, MUZ, { edge: true });
      h.rect(36, 16, 2, 2, NOSE); h.px(36, 16, '#5a5060');
      rigMouth(h, Q, 32, 20, 3, () => { h.rect(32, 20, 3, 1, G.s); });
      return;
    }
    if (v === 'back') {   // seen from behind, his left side is on the left
      legA.ellipse(14, 40, 5, 3.2, WH, { edge: true }); legB.ellipse(30, 40, 5, 3.2, K, { edge: true });
      const E = [22, 28, 16, 13];
      block(b, E, 5, 14, 22, 30, WH, -1, 0); block(b, E, 22, 14, 40, 30, G, 0, -1);
      block(b, E, 5, 30, 17, 43, G, 0, 1); block(b, E, 17, 30, 29, 43, CIN); block(b, E, 29, 30, 40, 43, K, 1, 0);
      armA.ellipse(7, 26, 3.6, 6, CIN, { edge: true }); armB.ellipse(37, 26, 3.6, 6, K, { edge: true });
      mane(b, 22, 21, 13, 6);
      earA.ellipse(12, 6, 3.2, 3, WH, { edge: true }); earB.ellipse(32, 6, 3.2, 3, K, { edge: true });
      const HE = [22, 13, 11, 8.5];
      block(h, HE, 10, 4, 22, 23, WH, 0, 1); block(h, HE, 22, 4, 35, 23, G);
      t.ellipse(22, 37, 2.6, 2.2, K, { edge: true });
      return;
    }
    legA.ellipse(14, 40, 5, 3.2, K, { edge: true }); legB.ellipse(30, 40, 5, 3.2, WH, { edge: true });   // mismatched legs
    const E = [22, 28, 16, 13];
    block(b, E, 5, 14, 22, 30, G);                                     // blocks of different bears' fur, not quite lined up
    block(b, E, 22, 14, 40, 30, WH, 1, -1);
    block(b, E, 5, 30, 17, 43, K, -1, 0);
    block(b, E, 17, 30, 29, 43, CIN, 0, 1);
    block(b, E, 29, 30, 40, 43, G, 1, 0);
    b.poly([[15, 28], [18.5, 28], [19.8, 30.2], [22, 31], [22, 34.5], [16.5, 32.2]], SUN);   // the sun bear's golden crescent, broken in two:
    b.poly([[22, 32], [24.2, 31.2], [25.5, 29], [29, 29], [27.5, 33.2], [22, 35.5]], SUN);   // its right half sits a pixel low
    armA.ellipse(7, 26, 3.6, 6, K, { edge: true }); armB.ellipse(37, 26, 3.6, 6, CIN, { edge: true });   // panda arm, cinnamon arm
    mane(b, 22, 22, 14, 6);                                            // a sloth bear's shaggy mane round its shoulders, under its chin
    earA.ellipse(12, 6, 3.2, 3, K, { edge: true }); earB.ellipse(32, 6, 3.2, 3, WH, { edge: true });
    const HE = [22, 13, 11, 8.5];
    block(h, HE, 10, 4, 22, 23, G);                                    // its face: two halves, a pixel apart
    block(h, HE, 22, 4, 35, 23, WH, 0, 1);
    h.poly([[13, 10], [19, 10.5], [19, 14.5], [14, 15]], K);           // panda's eye patch on one side
    h.ellipse(27.5, 13.5, 3.2, 2.6, RING);                             // spectacled bear's eye ring on the other
    rigEyes(h, Q, 44, 15, 12, 3, () => { h.rect(15, 12, 3, 1, '#e6ddcc'); h.px(17, 12, '#fffaf2'); h.rect(26, 13, 3, 1, NOSE); });
    h.ellipse(22, 18, 5, 3.4, MUZ, { edge: true });                    // short bear muzzle
    h.rect(20, 16, 4, 2, NOSE); h.px(20, 16, '#5a5060');
    rigMouth(h, Q, 20, 20, 4, () => { h.rect(21, 20, 2, 1, G.s); h.px(20, 19, G.s); h.px(23, 19, G.s); });
  };
  RIGGED.slumbearJ2 = 'biped';
  if (!ROSTER_BY_ID.slumbearJ2) { const d = { ...ROSTER_BY_ID.slumbear, id: 'slumbearJ2', name: 'SLUMBEAR J2' }; EVOLVED.push(d); ROSTER_BY_ID[d.id] = d; }
})();
