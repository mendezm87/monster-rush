// Original monster designs, drawn procedurally with the PixGrid primitives.
// Each draw function receives an empty grid and paints back-to-front.

const P = (b, s, l) => ({ b, s, l });
const DARK_EYE = '#1a1222';
// Toshi's colours (from photos of the real dog), shared by Smugshi and Smugshogun
const TOSHI = { coat: P('#d08548', '#a85e2c', '#e8a868'), white: P('#f7f1e6', '#e2d4bf', '#ffffff'), ear: '#f1dcc4' };

// Wings: flying monsters draw their wings through these, so buildSprites can make a second
// "flap" frame (FLAP = 1): polygons swing down from the shoulder (their first point, or w.root;
// w.swing overrides the angle), ellipses (butterfly wings) fold in toward the body.
let FLAP = 0;
function flapPts(pts, w = {}) {
  if (!FLAP) return pts;
  const [rx, ry] = w.root || pts[0];
  const cx = pts.reduce((t, p) => t + p[0], 0) / pts.length;
  const a = FLAP * (w.swing ?? 0.85 * Math.sign(cx - rx)), c = Math.cos(a), sn = Math.sin(a);
  return pts.map(([x, y]) => { const dx = (x - rx) * 0.85, dy = (y - ry) * 0.85; return [rx + dx * c - dy * sn, ry + dx * sn + dy * c]; });
}
const wingPoly = (g, pts, pal, opt, w) => g.poly(flapPts(pts, w), pal, opt);
const wingPolyM = (g, pts, pal, opt, w) => g.polyM(flapPts(pts, w), pal, opt);
const flapEll = (cx, rx) => (FLAP ? [16 + (cx - 16) * 0.72, rx * 0.55] : [cx, rx]);
const wingEllipse = (g, cx, cy, rx, ry, pal, opt) => { const [x, r] = flapEll(cx, rx); return g.ellipse(x, cy, r, ry, pal, opt); };
const wingEllipseM = (g, cx, cy, rx, ry, pal, opt) => { const [x, r] = flapEll(cx, rx); return g.ellipseM(x, cy, r, ry, pal, opt); };

// ---------- rigs: real frame animation drawn from the same art ----------
// A rigged monster draws each part of itself through part(g, dx, dy), so the parts can move
// separately: RIG (set while its animation frames are built, null for the plain drawing) says
// where. body: the torso's y; head: [x, y] for the head and everything on it (x is "forward",
// used in side views); tail: [x, y]; legs: [a, b] how far each diagonal pair of legs is lifted
// (a = the near front and far back leg); eyes: null, 'blink' or 'hurt'; mouth: null or 'open'.
// RIG_FRAMES is the cycle every rigged four-legged monster uses; buildSprites draws them all.
let RIG = null;
const REST = { body: 0, head: [0, 0], tail: [0, 0], legs: [0, 0], eyes: null, mouth: null };
const rig = () => RIG || REST;
function part(g, dx = 0, dy = 0) {
  if (!dx && !dy) return g;
  const W = g.w, p = {};
  const sh = pts => pts.map(([x, y]) => [x + dx, y + dy]), mir = pts => pts.map(([x, y]) => [W - x, y]);
  p.ellipse = (cx, cy, rx, ry, pal, opt) => (g.ellipse(cx + dx, cy + dy, rx, ry, pal, opt), p);
  p.ellipseM = (cx, cy, rx, ry, pal, opt) => (g.ellipse(cx + dx, cy + dy, rx, ry, pal, opt), g.ellipse(W - cx + dx, cy + dy, rx, ry, pal, opt), p);
  p.poly = (pts, pal, opt) => (g.poly(sh(pts), pal, opt), p);
  p.polyM = (pts, pal, opt) => (g.poly(sh(pts), pal, opt), g.poly(sh(mir(pts)), pal, opt), p);
  p.rect = (x, y, w, h, col) => (g.rect(x + dx, y + dy, w, h, col), p);
  p.rectM = (x, y, w, h, col) => (g.rect(x + dx, y + dy, w, h, col), g.rect(W - x - w + dx, y + dy, w, h, col), p);
  p.px = (x, y, col) => (g.px(x + dx, y + dy, col), p);
  p.pxM = (x, y, col) => (g.px(x + dx, y + dy, col), g.px(W - 1 - x + dx, y + dy, col), p);
  return p;
}
// The animation frames: a 4-frame walk (a diagonal pair of legs lifts while the body rises; the
// head follows the body a frame late; the tail swings), a slow 4-frame idle (breathing head bob,
// tail wag), a blink, a crouched wind-up, the attack (head forward, mouth open) and a hurt flinch.
const RIG_FRAMES = {
  walk: [
    { body: 0, tail: [1, 0], legs: [0, 0] },
    { body: -1, tail: [0, -1], legs: [2, 0] },
    { body: 0, tail: [-1, 0], legs: [0, 0] },
    { body: -1, tail: [0, -1], legs: [0, 2] },
  ].map((f, i, a) => ({ ...f, head: [0, a[(i + 3) % 4].body] })),
  idle: [
    { head: [0, 0], tail: [0, 0] }, { head: [0, 0], tail: [1, 0] },
    { head: [0, -1], tail: [0, 0] }, { head: [0, -1], tail: [-1, 0] },
  ],
  blink: { eyes: 'blink' },
  windup: { body: 1, head: [-1, 1], tail: [0, 1] },
  attack: { head: [1, 0], tail: [0, -1], mouth: 'open' },
  hurt: { head: [-1, -1], eyes: 'hurt', mouth: 'open' },
};

// Flying monsters: how high they hover and how fast they flap (beats a second; 0 = they just
// float). drawMon lifts them off their shadow and swaps in the flap frame (SPRITES[id].flap).
// Monsters whose art is rigged (draws its parts through part() and reads rig()).
const RIGGED = new Set(['smugshi']);
const FLYERS = { galewing: { hover: 8, flap: 4 }, pixibelle: { hover: 7, flap: 6 }, drakorn: { hover: 6, flap: 3 }, wispurr: { hover: 6, flap: 0 } };

const MONSTER_ART = {
  // ---- evolved starters (44px, their own designs) ----

  // Toshi all grown up: the same red Shiba with the cream mask, white socks, eyebrow
  // spots and smug half-shut eyes, now with a ruff, a samurai headband and a red cape.
  smugshogun(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    if (v === 'side') {
      g.ellipse(8, 22, 6, 6, O, { edge: true });                                                // curled tail
      g.ellipse(7.5, 21.5, 3, 3, C); g.px(7, 21, O.s);
      g.poly([[15, 22], [27, 22], [24, 40], [3, 38]], R, { edge: true });                       // cape streaming back
      g.rect(4, 37, 20, 1, Gd);
      g.ellipse(13, 40, 3, 2, C, { edge: true });
      g.ellipse(19, 31, 11, 8, O, { edge: true });                                              // body
      g.ellipse(27, 33, 4.5, 6, C);                                                             // cream chest
      g.ellipse(26, 40, 3, 2, C, { edge: true });
      g.ellipse(26, 24, 6, 4, C, { edge: true });                                               // neck ruff
      g.poly([[20, 11], [19, 2], [24, 8]], O);                                                  // far ear
      g.ellipse(27, 16, 9.5, 8, O, { edge: true });                                             // head
      g.poly([[25, 10], [28, 0], [31, 9]], O, { edge: true });                                  // near ear
      g.poly([[27, 8.5], [28, 3], [30, 8]], C.b);
      g.ellipse(35, 20, 5.5, 3.6, C);                                                           // muzzle
      g.ellipse(29, 20, 3, 2, C);
      g.rect(18, 9, 17, 2, Wb.b); g.rect(18, 10, 17, 1, Wb.s);                                   // headband
      g.poly([[19, 9], [9, 6], [11, 13]], Wb, { edge: true });                                   // its tails, flying back
      g.ellipse(32, 10, 1.5, 1.1, '#c8303a');
      g.px(29, 12, C.b); g.px(30, 12, C.b);                                         // eyebrow spot
      g.rect(29, 14, 5, 1, OUTLINE); g.rect(30, 15, 3, 1, DARK_EYE);                             // smug lid
      g.rect(39, 18, 3, 2, OUTLINE);                                                            // nose
      g.px(35, 23, OUTLINE).px(36, 23, OUTLINE).px(37, 23, OUTLINE).px(38, 22, OUTLINE);        // smirk
      return;
    }
    if (v === 'back') {
      g.ellipseM(15, 40, 3.5, 2.2, C, { edge: true });
      g.ellipse(22, 31, 10, 8.5, O, { edge: true });
      g.poly([[12, 23], [32, 23], [36, 40], [8, 40]], R, { edge: true });                       // the cape
      g.rect(9, 39, 26, 1, Gd);
      g.ellipseM(12, 23, 3, 2, C);                                                              // ruff peeking out
      g.polyM([[12, 12], [11, 1], [19, 8]], O, { edge: true });
      g.ellipse(22, 15, 11, 8.5, O, { edge: true });
      g.rect(11, 9, 22, 2, Wb.b); g.rect(11, 10, 22, 1, Wb.s);
      g.rect(20, 9, 4, 3, Wb.l);                                                                // headband knot
      g.poly([[21, 11], [17, 21], [20, 20]], Wb, { edge: true }); g.poly([[23, 11], [27, 21], [24, 20]], Wb, { edge: true });
      g.ellipse(22, 30, 6, 5.5, O, { edge: true });                                             // the famous curled tail
      g.ellipse(22, 29.5, 3.2, 2.8, C); g.px(22, 29, O.s); g.px(23, 29, O.s);
      return;
    }
    g.ellipse(36, 25, 6.5, 6.5, O, { edge: true });                                             // tail
    g.ellipse(36.5, 24.5, 3.5, 3.5, C); g.px(36, 24, O.s);
    g.poly([[11, 23], [33, 23], [38, 40], [6, 40]], R, { edge: true });                         // cape behind
    g.rect(6, 39, 4, 1, Gd); g.rect(34, 39, 4, 1, Gd);
    g.ellipseM(15, 40, 3.5, 2.2, C, { edge: true });                                            // white socks
    g.ellipse(22, 31, 10, 8.5, O, { edge: true });
    g.ellipse(22, 33, 6, 6.5, C);                                                               // cream chest
    g.ellipse(22, 24, 10, 4, C, { edge: true });                                                // neck ruff
    g.ellipse(22, 24.5, 2, 2, Gd); g.px(22, 24, '#a87a1a');                                     // gold clasp
    g.polyM([[12, 12], [11, 1], [19, 8]], O, { edge: true });
    g.polyM([[13.5, 10], [12.5, 4], [17, 8]], C.b);
    g.ellipse(22, 15, 11, 8.5, O, { edge: true });
    g.ellipse(22, 19.5, 7, 4.5, C);                                                             // muzzle
    g.ellipseM(13, 18, 2.2, 1.8, C);
    g.rect(11, 9, 22, 2, Wb.b); g.rect(11, 10, 22, 1, Wb.s);                                     // headband
    g.ellipse(22, 9.5, 1.8, 1.4, '#c8303a');
    g.poly([[32, 9], [41, 5], [40, 12]], Wb, { edge: true });
    g.pxM(15, 12, C.b); g.pxM(16, 12, C.b);                                         // eyebrow spots
    g.rectM(14, 14, 5, 1, OUTLINE);                                                             // smug lids
    g.rectM(15, 15, 3, 1, DARK_EYE);
    g.rect(21, 17, 3, 2, OUTLINE);                                                              // nose
    g.px(20, 22, OUTLINE).px(21, 22, OUTLINE).px(22, 22, OUTLINE).px(23, 21, OUTLINE);          // smirk
  },

  // Cinderox grown into a magma bull: a blazing mane, curved horns, lava-cracked rock
  // armour on the shoulders and a gold nose ring.
  infernox(g, v = 'front') {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const cracks = pts => { for (const [x, y] of pts) { g.px(x, y, L); g.px(x + 1, y + 1, Gl); } };
    if (v === 'side') {
      g.poly([[7, 30], [1, 25], [3, 32]], B); g.ellipse(2, 24, 2, 2.4, F);                       // tail, flame tip
      g.ellipse(12, 39, 3.5, 3, Rk, { edge: true }); g.ellipse(25, 39, 3.5, 3, Rk, { edge: true });
      g.poly([[7, 26], [9, 11], [14, 22]], F); g.poly([[12, 21], [16, 5], [20, 18]], F); g.poly([[18, 17], [23, 3], [26, 16]], F);
      g.poly([[11, 22], [16, 12], [22, 15], [17, 24]], Gl);
      g.ellipse(19, 30, 14, 8.5, B, { edge: true });                                            // body
      g.ellipse(22, 34, 9, 4, C);
      g.ellipse(15, 40, 3.5, 3, Rk, { edge: true }); g.ellipse(29, 40, 3.5, 3, Rk, { edge: true });
      g.px(14, 42, L); g.px(29, 42, L);                                                         // glowing hooves
      cracks([[10, 28], [15, 25], [20, 29]]);
      g.ellipse(27, 25, 6, 5, Rk, { edge: true }); cracks([[25, 24], [28, 26]]);                // shoulder armour
      g.poly([[28, 14], [32, 6], [33, 13]], P('#b8a68a', '#8a7a62', '#d8ccb0'));                 // far horn
      g.ellipse(32, 19, 8, 7, B, { edge: true });                                               // head
      g.poly([[30, 15], [38, 5], [41, 7], [35, 16]], H, { edge: true });                        // horn
      g.ellipse(38, 22, 4.5, 3.2, C);                                                           // muzzle
      g.px(41, 21, OUTLINE);
      g.ellipse(40, 25, 1.6, 1.3, '#ffd23f');                                                   // nose ring
      g.rect(33, 16, 5, 1, OUTLINE); g.rect(34, 17, 3, 2, Gl); g.px(36, 17, '#ffffff');          // glowing eye
      return;
    }
    if (v === 'back') {
      g.ellipseM(13, 39, 4, 3, Rk, { edge: true });
      g.ellipse(22, 30, 13, 9, B, { edge: true });
      cracks([[14, 30], [28, 28], [18, 34], [26, 34]]);
      g.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[8, 24], [35, 25]]);
      g.ellipse(22, 18, 9, 7.5, B, { edge: true });
      g.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });       // horns
      g.poly([[8, 20], [10, 4], [16, 14]], F); g.poly([[14, 13], [18, 1], [22, 11]], F);        // blazing mane
      g.poly([[22, 11], [26, 1], [30, 13]], F); g.poly([[28, 14], [34, 4], [36, 20]], F);
      g.poly([[15, 13], [22, 6], [29, 13], [22, 17]], Gl);
      g.poly([[18, 34], [22, 21], [26, 34]], F); g.poly([[20, 32], [22, 25], [24, 32]], Gl);    // flames down the spine
      g.rect(21, 37, 2, 4, '#16224a'); g.ellipse(22, 41, 1.8, 1.8, F);                          // tail
      return;
    }
    g.poly([[8, 20], [10, 4], [16, 14]], F); g.poly([[14, 13], [18, 1], [22, 11]], F);          // blazing mane
    g.poly([[22, 11], [26, 1], [30, 13]], F); g.poly([[28, 14], [34, 4], [36, 20]], F);
    g.poly([[15, 12], [22, 5], [29, 12], [22, 16]], Gl);
    g.ellipseM(13, 39, 4, 3, Rk, { edge: true }); g.pxM(12, 41, L); g.pxM(14, 41, L);           // hooves
    g.ellipse(22, 30, 13, 9, B, { edge: true });                                                // body
    g.ellipse(22, 33, 8, 5.5, C);                                                               // belly
    cracks([[11, 32], [31, 31], [13, 35]]);
    g.ellipseM(9, 25, 6, 5, Rk, { edge: true }); cracks([[7, 24], [35, 24], [9, 27]]);          // shoulder armour
    g.polyM([[15, 16], [6, 13], [2, 5], [5, 4], [8, 10], [16, 12]], H, { edge: true });         // horns
    g.ellipse(22, 18, 10, 8, B, { edge: true });                                                // head
    g.ellipse(22, 23, 7, 3.5, C, { edge: true });                                               // broad muzzle
    g.rect(19, 23, 2, 1, OUTLINE); g.rect(24, 23, 2, 1, OUTLINE);                               // nostrils
    g.ellipse(22, 27, 2.2, 1.4, '#ffd23f'); g.px(22, 26, '#a87a1a');                            // nose ring
    g.rectM(14, 15, 6, 1, OUTLINE);                                                             // heavy brows
    g.rectM(15, 16, 4, 2, Gl); g.rectM(17, 16, 2, 2, '#ffffff');                                // glowing eyes
  },

  // Tidalisk grown into a sea dragon: a coiled body, teal fin-wings, gold horns,
  // long whiskers and a belly of cream scales.
  maelstrisk(g, v = 'front') {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    if (v === 'side') {
      g.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                  // tail fin
      g.ellipse(20, 37, 18, 6, B, { edge: true });                                              // coil
      for (const x of [10, 16, 22, 28]) g.rect(x, 39, 3, 1, '#1a3a8a');
      g.poly([[19, 18], [13, 25], [19, 33]], Fn, { edge: true });                               // dorsal fin
      g.ellipse(24, 27, 6.5, 10, B, { edge: true });                                            // neck
      g.ellipse(28, 29, 3, 8, C);
      for (const y of [24, 28, 32]) g.rect(27, y, 3, 1, '#cdbb88');
      g.poly([[22, 8], [20, 0], [27, 6]], Fn);                                                  // crest
      g.ellipse(28, 13, 8.5, 6.5, B, { edge: true });                                           // head
      g.poly([[27, 8], [31, 0], [32, 7]], H, { edge: true });                                   // horn
      g.ellipse(35, 16, 5, 3, C);                                                               // snout
      g.poly([[35, 18], [43, 23], [42, 24], [34, 19]], Wh);                                     // whisker
      g.rect(30, 11, 2, 3, DARK_EYE); g.px(30, 11, '#ffffff'); g.px(29, 9, OUTLINE); g.px(30, 9, OUTLINE); g.px(31, 10, OUTLINE);
      g.px(39, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      g.poly([[38, 36], [43, 29], [43, 43]], Fn, { edge: true });
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      g.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                       // fin-wings
      g.ellipse(22, 27, 7.5, 10, B, { edge: true });
      g.ellipse(22, 13, 9, 7, B, { edge: true });
      g.polyM([[16, 16], [7, 20], [8, 21], [17, 17]], Wh);                                      // whiskers from behind
      g.polyM([[15, 8], [10, 0], [17, 5]], H, { edge: true });
      g.poly([[19, 7], [22, 0], [25, 7]], Fn);
      for (const y of [19, 24, 29, 34]) g.poly([[20, y], [22, y - 4], [24, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(22, 37, 18, 6, B, { edge: true });                                                // coil
    for (const x of [8, 14, 27, 33]) g.rect(x, 39, 3, 1, '#1a3a8a');
    g.polyM([[12, 22], [1, 14], [3, 24], [9, 28]], Fn, { edge: true });                         // fin-wings
    g.ellipse(22, 27, 7.5, 10, B, { edge: true });                                              // neck
    g.ellipse(22, 29, 4, 8, C);                                                                 // belly scales
    for (const y of [23, 26, 29, 32, 35]) g.rect(19, y, 6, 1, '#cdbb88');
    g.poly([[19, 7], [22, 0], [25, 7]], Fn);                                                    // crest
    g.polyM([[15, 8], [10, 0], [17, 5]], H, { edge: true });                                    // gold horns
    g.ellipse(22, 13, 9, 7, B, { edge: true });                                                 // head
    g.ellipse(22, 17, 5.5, 3.5, C);                                                             // snout
    g.polyM([[17, 17], [8, 21], [9, 22], [18, 18]], Wh);                                        // whiskers
    g.eyes(16, 11, DARK_EYE, { brow: true });
    g.px(20, 17, OUTLINE); g.px(23, 17, OUTLINE);
  },

  sparkit(g, v = 'front') {
    if (v === 'side') {
      const Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.poly([[11, 23], [4, 16], [7, 15], [2, 8], [9, 12], [6, 13], [13, 20]], Y);
      g.poly([[14, 10], [11, 1], [17, 8]], Y); g.poly([[11, 1], [13, 2], [12, 4]], '#2a2230');
      g.ellipse(15, 23, 7, 6.5, Y, { edge: true });
      g.ellipse(12, 29, 3, 1.5, '#e0a722'); g.ellipse(19, 29, 3, 1.5, '#e0a722');
      g.poly([[18, 9], [19, 0], [23, 8]], Y, { edge: true }); g.poly([[19, 0], [21, 2], [19.5, 4]], '#2a2230');
      g.ellipse(18, 14, 8.5, 7.5, Y, { edge: true });
      g.ellipse(20, 22, 2, 2.5, Y, { edge: true });
      g.rect(21, 12, 2, 3, DARK_EYE); g.px(21, 12, '#ffffff');
      g.ellipse(23, 17, 2, 1.5, '#ff5a4a');
      g.px(25, 16, OUTLINE).px(24, 17, OUTLINE);
      return;
    }
    if (v === 'back') {
      const Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.polyM([[11, 11], [4, 1], [14, 8]], Y);
      g.polyM([[4, 1], [8, 2], [5, 5]], '#2a2230');
      g.ellipse(16, 23, 7, 6.5, Y, { edge: true });
      g.ellipseM(10.5, 22, 2, 2.5, Y, { edge: true });
      g.ellipse(16, 14, 9, 7.5, Y, { edge: true });
      g.ellipseM(12, 29, 3, 1.5, '#e0a722');
      g.rect(13, 20, 6, 1, '#c98a1a'); g.rect(14, 23, 4, 1, '#c98a1a');
      g.poly([[15, 27], [21, 20], [18, 19], [23, 11], [16, 15], [19, 16], [13, 23]], Y, { edge: true });
      return;
    }
    const Y = P('#ffd84a', '#e0a722', '#fff3a0');
    g.poly([[21, 23], [28, 16], [25, 15], [30, 8], [23, 12], [26, 13], [19, 20]], Y);           // bolt tail
    g.polyM([[11, 11], [4, 1], [14, 8]], Y);                                                   // ears
    g.polyM([[4, 1], [8, 2], [5, 5]], '#2a2230');                                              // ear tips
    g.ellipse(16, 23, 7, 6.5, Y, { edge: true });                                              // body
    g.ellipseM(10.5, 22, 2, 2.5, Y, { edge: true });                                           // arms
    g.ellipse(16, 14, 9, 7.5, Y, { edge: true });                                              // head
    g.ellipseM(12, 29, 3, 1.5, '#e0a722');                                                     // feet
    g.eyes(11, 12, DARK_EYE);
    g.ellipseM(9, 17, 2, 1.5, '#ff5a4a');                                                      // cheeks
    g.px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(14, 16, OUTLINE).px(17, 16, OUTLINE);          // mouth
    g.rect(13, 24, 6, 1, '#c98a1a');                                                           // back stripe hint
  },

  cinderox(g, v = 'front') {
    if (v === 'side') {
      const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
      g.poly([[7, 20], [1, 17], [7, 24]], F);
      g.poly([[12, 14], [13, 3], [17, 11]], F); g.poly([[16, 11], [19, 0], [22, 11]], F); g.poly([[21, 12], [25, 3], [25, 15]], F);
      g.poly([[15, 8], [19, 3], [23, 8], [19, 11]], '#ffd34a');
      g.ellipse(14, 21, 10, 7, B, { edge: true });
      g.ellipse(16, 24.5, 6, 4, C);
      g.ellipse(9, 28, 3, 2, C, { edge: true }); g.ellipse(19, 28, 3, 2, C, { edge: true });
      g.ellipse(20, 14, 7, 6, B, { edge: true });
      g.ellipse(24, 16.5, 3.5, 2.5, C);
      g.rect(21, 13, 3, 1, OUTLINE); g.px(23, 14, '#ff5a2a');
      g.px(26, 16, OUTLINE);
      return;
    }
    if (v === 'back') {
      const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0');
      g.polyM([[6, 20], [2, 18], [6, 23]], F);
      g.ellipse(16, 21, 10, 7, B, { edge: true });
      g.ellipseM(10, 28, 3, 2, B, { edge: true });
      g.ellipse(16, 14, 7, 6, B, { edge: true });
      g.poly([[7, 15], [9, 2], [14, 11]], F); g.poly([[12, 11], [16, 0], [20, 11]], F); g.poly([[18, 11], [23, 2], [25, 15]], F);
      g.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
      g.rect(15, 22, 2, 5, '#1f3054'); g.ellipse(16, 27.5, 1.6, 1.6, '#ff7a1c');
      return;
    }
    const F = P('#ff7a1c', '#e2401a', '#ffd34a');
    const B = P('#2f4a7a', '#1f3054', '#4a6aa0');
    const C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    g.poly([[7, 15], [9, 2], [14, 11]], F); g.poly([[12, 11], [16, 0], [20, 11]], F); g.poly([[18, 11], [23, 2], [25, 15]], F);
    g.poly([[11, 8], [16, 3], [21, 8], [16, 11]], '#ffd34a');
    g.ellipse(16, 21, 10, 7, B, { edge: true });
    g.ellipse(16, 24, 7, 5, C);
    g.ellipse(16, 14, 7, 6, B, { edge: true });
    g.ellipse(16, 17, 4, 2.5, C);
    g.ellipseM(10, 28, 3, 2, C, { edge: true });
    g.rectM(10, 13, 3, 1, OUTLINE); g.pxM(12, 14, '#ff5a2a');                                   // narrow eyes
    g.px(15, 16, OUTLINE).px(16, 16, OUTLINE);
    g.polyM([[6, 20], [2, 18], [6, 23]], F);                                                    // flank flames
  },

  tidalisk(g, v = 'front') {
    if (v === 'side') {
      const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
      g.poly([[5, 25], [0, 20], [1, 29]], Fn);
      g.ellipse(15, 26, 12, 4.5, B, { edge: true });
      g.poly([[14, 10], [6, 5], [11, 14]], Fn);
      g.ellipse(17, 19, 5.5, 8, B, { edge: true });
      g.ellipse(19.5, 21, 2.5, 6, C);
      g.poly([[15, 7], [13, 0], [19, 5]], Fn);
      g.ellipse(20, 10, 7, 5.5, B, { edge: true });
      g.ellipse(25, 12, 3, 2, C);
      g.rect(21, 8, 2, 3, DARK_EYE); g.px(21, 8, '#ffffff');
      g.px(10, 26, '#7ab4ff'); g.px(7, 25, '#7ab4ff');
      return;
    }
    if (v === 'back') {
      const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
      g.poly([[26, 25], [31, 20], [30, 29]], Fn);
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      g.ellipse(16, 19, 6, 8, B, { edge: true });
      g.ellipse(16, 10, 7, 5.5, B, { edge: true });
      g.polyM([[10, 9], [2, 4], [8, 13]], Fn);
      g.poly([[14, 6], [16, 0], [19, 6]], Fn);
      for (const y of [13, 16, 19, 22]) g.rect(15, y, 2, 2, '#7ab4ff');
      return;
    }
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6');
    const Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    g.poly([[14, 6], [16, 0], [19, 6]], Fn);
    g.polyM([[10, 9], [2, 4], [8, 13]], Fn);
    g.ellipse(16, 26, 12, 4.5, B, { edge: true });
    g.ellipse(16, 19, 6, 8, B, { edge: true });
    g.ellipse(16, 21, 3.5, 6, C);
    g.ellipse(16, 10, 7, 5.5, B, { edge: true });
    g.ellipse(16, 13, 4, 2, C);
    g.eyes(12, 9, DARK_EYE);
    g.pxM(9, 26, '#7ab4ff'); g.pxM(6, 25, '#7ab4ff');
  },

  thornback(g, v = 'front') {
    if (v === 'side') {
      const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
      g.poly([[4, 22], [0, 24], [4, 26]], T);
      g.poly([[9, 13], [4, 4], [12, 11]], L); g.poly([[13, 11], [13, 1], [18, 10]], L);
      g.ellipse(9, 28, 3, 2.5, T, { edge: true }); g.ellipse(20, 28, 3, 2.5, T, { edge: true });
      g.ellipse(15, 19, 12, 9, S, { edge: true });
      for (const [x, y] of [[9, 16], [15, 13], [20, 16], [11, 21], [17, 21]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
      g.ellipse(26, 23, 4.5, 4, T, { edge: true });
      g.rect(27, 21, 1, 2, DARK_EYE); g.px(27, 21, '#ffffff');
      g.px(29, 24, OUTLINE);
      return;
    }
    if (v === 'back') {
      const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
      g.polyM([[10, 13], [6, 3], [14, 10]], L);
      g.poly([[13, 11], [16, 1], [19, 11]], L);
      g.ellipseM(8, 28, 3, 2.5, T, { edge: true });
      g.ellipse(16, 19, 12, 9, S, { edge: true });
      for (const [x, y] of [[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
      g.poly([[15, 26], [16, 30], [17, 26]], T);
      return;
    }
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a');
    const L = P('#8be04e', '#4fae2e', '#d4ff9a');
    const T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    g.polyM([[10, 13], [6, 3], [14, 10]], L);
    g.poly([[13, 11], [16, 1], [19, 11]], L);
    g.ellipseM(8, 28, 3, 2.5, T, { edge: true });
    g.ellipse(16, 19, 12, 9, S, { edge: true });
    // shell plates
    for (const [x, y] of [[11, 15], [16, 13], [21, 15], [13, 20], [19, 20]]) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); }
    g.ellipse(16, 23, 5.5, 4.5, T, { edge: true });
    g.rectM(13, 22, 1, 2, DARK_EYE); g.pxM(13, 22, '#ffffff');
    g.px(15, 25, OUTLINE).px(16, 25, OUTLINE);
  },

  slumbear(g, v = 'front') { // 44x44
    if (v === 'side') {
      const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
      g.ellipse(5, 30, 2.5, 2.5, B);
      g.ellipse(21, 8, 3.5, 3.5, B);
      g.ellipse(14, 41, 5, 2.5, C, { edge: true });
      g.ellipse(21, 27, 16, 14, B, { edge: true });
      g.ellipse(26, 31, 9, 9, C);
      g.ellipse(28, 41, 5, 2.5, C, { edge: true });
      g.ellipse(26, 14, 10, 8.5, B, { edge: true });
      g.ellipse(33, 17, 4.5, 3.5, C);
      g.ellipse(28, 27, 3.5, 6, B, { edge: true });
      g.rect(35, 15, 2, 2, OUTLINE);
      g.rect(28, 13, 4, 1, OUTLINE);
      g.px(33, 20, OUTLINE).px(34, 20, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
      g.ellipseM(11, 8, 3.5, 3.5, B);
      g.ellipse(22, 27, 17, 14, B, { edge: true });
      g.ellipseM(6, 27, 3.5, 6, B, { edge: true });
      g.ellipse(22, 14, 11, 8.5, B, { edge: true });
      g.ellipseM(12, 41, 5, 2.5, P('#2a4c55', '#1f3a42', '#3f6f78'), { edge: true });
      g.ellipse(22, 36, 3, 3, C, { edge: true });
      return;
    }
    const B = P('#3f6f78', '#2a4c55', '#5d939c');
    const C = P('#f2e2bc', '#cdb98a', '#fff6de');
    g.ellipseM(11, 8, 3.5, 3.5, B);
    g.ellipse(22, 27, 17, 14, B, { edge: true });
    g.ellipse(22, 31, 12, 10, C);
    g.ellipseM(6, 27, 3.5, 6, B, { edge: true });
    g.ellipse(22, 14, 11, 8.5, B, { edge: true });
    g.ellipse(22, 16.5, 8, 5.5, C);
    g.rectM(16, 14, 4, 1, OUTLINE);                                                             // sleepy eyes
    g.rect(20, 19, 4, 1, OUTLINE); g.px(19, 18, OUTLINE); g.px(24, 18, OUTLINE);                // smile
    g.ellipseM(12, 41, 5, 2.5, C, { edge: true });
    g.pxM(10, 41, OUTLINE); g.pxM(12, 41, OUTLINE); g.pxM(14, 41, OUTLINE);
    g.pxM(11, 7, '#2a4c55');
  },

  frostling(g, v = 'front') {
    if (v === 'side') {
      const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
      g.ellipse(6, 19, 5, 7.5, Cr);
      g.poly([[13, 10], [11, 2], [16, 8]], B);
      g.ellipse(15, 23, 6.5, 6, B, { edge: true });
      g.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); g.ellipse(18, 29, 2.5, 1.5, '#5ea8cc');
      g.poly([[17, 10], [18, 1], [22, 9]], B, { edge: true });
      g.ellipse(18, 14, 7.5, 6, B, { edge: true });
      g.poly([[22, 13], [28, 16], [22, 18]], B, { edge: true });
      g.poly([[16, 9], [19, 2], [20, 9]], Cr, { edge: true });
      g.poly([[19, 17], [15, 21], [21, 20]], Cr);
      g.rect(21, 13, 2, 3, '#1a3a5a'); g.px(21, 13, '#ffffff');
      g.px(27, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
      g.polyM([[10, 10], [7, 1], [14, 8]], B);
      g.ellipse(16, 23, 6.5, 6, B, { edge: true });
      g.ellipseM(12, 29, 2.5, 1.5, '#5ea8cc');
      g.ellipse(16, 14, 7.5, 6, B, { edge: true });
      g.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
      g.ellipse(16, 21, 5, 7.5, Cr, { edge: true });
      return;
    }
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff');
    const Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    g.ellipse(25, 19, 5, 7.5, Cr);                                                              // fluffy tail
    g.polyM([[10, 10], [7, 1], [14, 8]], B);
    g.ellipse(16, 23, 6.5, 6, B, { edge: true });
    g.ellipse(16, 14, 7.5, 6, B, { edge: true });
    g.poly([[14, 9], [16, 2], [18, 9]], Cr, { edge: true });
    g.polyM([[9, 17], [5, 20], [10, 20]], Cr);                                                  // cheek frost
    g.ellipseM(12, 29, 2.5, 1.5, '#5ea8cc');
    g.eyes(12, 13, '#1a3a5a');
    g.px(15, 17, OUTLINE).px(16, 17, OUTLINE);
  },

  drakorn(g, v = 'front') {
    if (v === 'side') {
      const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
      wingPoly(g, [[12, 18], [2, 5], [4, 19]], W);
      g.poly([[10, 26], [1, 30], [8, 22]], O);
      g.poly([[17, 9], [13, 1], [19, 6]], C, { edge: true });
      g.ellipse(15, 23, 8, 7.5, O, { edge: true });
      g.ellipse(19, 25, 3.5, 5.5, C);
      g.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); g.ellipse(19, 30, 2.5, 1.5, '#c45e1e');
      g.ellipse(19, 12, 7, 6, O, { edge: true });
      g.ellipse(24, 14, 3.5, 2.5, C);
      g.rect(21, 10, 2, 3, DARK_EYE); g.px(21, 10, '#ffffff'); g.px(20, 8, OUTLINE); g.px(21, 8, OUTLINE); g.px(22, 9, OUTLINE);
      g.px(26, 13, OUTLINE);
      return;
    }
    if (v === 'back') {
      const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
      g.polyM([[13, 9], [9, 1], [15, 6]], C, { edge: true });
      g.ellipse(16, 23, 8, 7.5, O, { edge: true });
      g.ellipseM(11, 30, 2.5, 1.5, '#c45e1e');
      g.ellipse(16, 12, 7, 6, O, { edge: true });
      g.poly([[14, 27], [18, 27], [16, 32]], O, { edge: true });
      for (const y of [8, 11, 17]) g.rect(15, y, 2, 1, '#c45e1e');
      wingPolyM(g, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });
      return;
    }
    const O = P('#f08a3a', '#c45e1e', '#ffb873');
    const W = P('#7b4bd6', '#5430a0', '#a682ff');
    const C = P('#f6e2b0', '#d2b070', '#fff6dc');
    wingPolyM(g, [[10, 17], [0, 5], [2, 19]], W);
    g.poly([[21, 26], [31, 30], [24, 22]], O);
    g.polyM([[13, 9], [9, 1], [15, 6]], C, { edge: true });
    g.ellipse(16, 23, 8, 7.5, O, { edge: true });
    g.ellipse(16, 25, 5, 5.5, C);
    g.ellipse(16, 12, 7, 6, O, { edge: true });
    g.ellipse(16, 15, 4, 2.2, C);
    g.eyes(12, 10, DARK_EYE, { brow: true });
    g.px(15, 15, OUTLINE).px(16, 15, OUTLINE);
    g.ellipseM(11, 30, 2.5, 1.5, '#c45e1e');
  },

  boulderon(g, v = 'front') { // 44x44
    if (v === 'side') {
      const R = P('#8f8170', '#625747', '#b8aa96');
      g.poly([[9, 18], [11, 6], [16, 15]], R, { edge: true });
      g.poly([[15, 13], [19, 2], [23, 13]], R, { edge: true });
      g.poly([[22, 14], [28, 5], [30, 17]], R, { edge: true });
      g.ellipse(14, 40, 4.5, 2.5, R, { edge: true });
      g.ellipse(21, 26, 15, 14, R, { edge: true });
      g.ellipse(28, 40, 4.5, 2.5, R, { edge: true });
      g.ellipse(26, 28, 5, 6, R, { edge: true });
      g.rect(30, 22, 2, 3, '#ffb02a'); g.px(30, 22, '#ffffff'); g.px(29, 20, OUTLINE); g.px(30, 20, OUTLINE); g.px(31, 21, OUTLINE);
      g.rect(31, 31, 4, 1, OUTLINE);
      for (const [x, y] of [[10, 30], [11, 31], [11, 32], [16, 18], [17, 19], [19, 34]]) g.px(x, y, '#4e4436');
      return;
    }
    if (v === 'back') {
      const R = P('#8f8170', '#625747', '#b8aa96');
      g.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
      g.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
      g.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
      g.ellipse(22, 26, 15, 14, R, { edge: true });
      g.ellipseM(6, 28, 5, 6, R, { edge: true });
      g.ellipseM(14, 40, 4.5, 2.5, R, { edge: true });
      g.poly([[18, 26], [22, 18], [26, 26]], R, { edge: true });
      g.poly([[19, 34], [22, 28], [25, 34]], R, { edge: true });
      for (const [x, y] of [[12, 22], [13, 23], [31, 30], [30, 31], [16, 33], [28, 20]]) g.px(x, y, '#4e4436');
      return;
    }
    const R = P('#8f8170', '#625747', '#b8aa96');
    g.poly([[11, 17], [14, 5], [19, 14]], R, { edge: true });
    g.poly([[18, 13], [22, 2], [26, 13]], R, { edge: true });
    g.poly([[25, 14], [30, 5], [33, 17]], R, { edge: true });
    g.ellipse(22, 26, 15, 14, R, { edge: true });
    g.ellipseM(6, 28, 5, 6, R, { edge: true });
    g.ellipseM(14, 40, 4.5, 2.5, R, { edge: true });
    g.eyes(16, 22, '#ffb02a', { brow: true });
    g.rect(19, 30, 7, 1, OUTLINE); g.px(18, 29, OUTLINE); g.px(26, 29, OUTLINE);
    // cracks
    for (const [x, y] of [[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [29, 33], [30, 34]]) g.px(x, y, '#4e4436');
  },

  mindra(g, v = 'front') {
    if (v === 'side') {
      const B = P('#c48ce8', '#9058b8', '#ebc8ff');
      g.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);
      g.poly([[13, 8], [10, 0], [16, 5]], B);
      g.ellipse(15, 23, 5, 6.5, B, { edge: true });
      g.ellipse(13, 29.5, 2, 1.2, '#9058b8'); g.ellipse(18, 29.5, 2, 1.2, '#9058b8');
      g.poly([[17, 7], [19, 0], [22, 6]], B, { edge: true });
      g.ellipse(18, 12, 8, 7, B, { edge: true });
      g.ellipse(22, 8.5, 1.6, 1.6, '#ff3a6a'); g.px(21, 8, '#ffd0dc');
      g.rect(21, 11, 2, 4, '#5a1a8a'); g.px(21, 11, '#ffffff');
      g.px(25, 16, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#c48ce8', '#9058b8', '#ebc8ff');
      g.polyM([[10, 8], [5, 0], [13, 5]], B);
      g.ellipse(16, 23, 5, 6.5, B, { edge: true });
      g.ellipseM(13, 29.5, 2, 1.2, '#9058b8');
      g.ellipse(16, 12, 8, 7, B, { edge: true });
      g.poly([[15, 27], [23, 22], [20, 15], [25, 11], [18, 19], [21, 23], [14, 25]], B, { edge: true });
      return;
    }
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    g.poly([[19, 24], [30, 17], [27, 23], [31, 27], [21, 28]], B);
    g.polyM([[10, 8], [5, 0], [13, 5]], B);
    g.ellipse(16, 23, 5, 6.5, B, { edge: true });
    g.ellipse(16, 12, 8, 7, B, { edge: true });
    g.ellipse(16, 8.5, 1.6, 1.6, '#ff3a6a'); g.px(15, 8, '#ffd0dc');
    g.eyes(11, 11, '#5a1a8a', { h: 4 });
    g.px(16, 16, OUTLINE);
    g.ellipseM(13, 29.5, 2, 1.2, '#9058b8');
  },

  shadefang(g, v = 'front') {
    if (v === 'side') {
      const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8');
      g.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);
      g.poly([[14, 10], [12, 1], [17, 7]], B);
      g.ellipse(15, 22, 8, 6.5, B, { edge: true });
      g.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); g.ellipse(19, 28.5, 2.5, 1.5, '#24203a');
      g.ellipse(18, 18, 4, 2, '#d2384a');
      g.poly([[17, 9], [19, 1], [21, 8]], B, { edge: true }); g.px(19, 4, '#d2384a'); g.px(19, 5, '#d2384a');
      g.ellipse(19, 13, 6.5, 5.5, B, { edge: true });
      g.poly([[22, 12], [28, 15], [22, 17]], B, { edge: true });
      g.ellipse(24, 16, 3, 1.5, G);
      g.rect(21, 12, 2, 3, '#ff3a3a'); g.px(21, 12, '#ffffff'); g.px(20, 10, OUTLINE); g.px(21, 10, OUTLINE); g.px(22, 11, OUTLINE);
      g.px(28, 15, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#3a3550', '#24203a', '#5a5478');
      g.polyM([[11, 10], [9, 1], [15, 7]], B);
      g.pxM(10, 4, '#d2384a'); g.pxM(10, 5, '#d2384a');
      g.ellipse(16, 22, 8, 6.5, B, { edge: true });
      g.ellipse(16, 18, 6, 2, '#d2384a');
      g.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
      g.ellipseM(11, 28.5, 2.5, 1.5, '#24203a');
      g.poly([[14, 25], [19, 15], [22, 12], [19, 24]], B, { edge: true });
      return;
    }
    const B = P('#3a3550', '#24203a', '#5a5478');
    const G = P('#8a86a0', '#5e5a74', '#b4b0c8');
    g.poly([[21, 22], [31, 13], [28, 22], [24, 26]], B);
    g.polyM([[11, 10], [9, 1], [15, 7]], B);
    g.pxM(10, 4, '#d2384a'); g.pxM(10, 5, '#d2384a');
    g.ellipse(16, 22, 8, 6.5, B, { edge: true });
    g.ellipse(16, 18, 6, 2, '#d2384a');                                                         // collar
    g.ellipse(16, 13, 6.5, 5.5, B, { edge: true });
    g.ellipse(16, 16, 3, 2, G);
    g.eyes(12, 12, '#ff3a3a', { brow: true });
    g.px(15, 15, OUTLINE).px(16, 15, OUTLINE);
    g.ellipseM(11, 28.5, 2.5, 1.5, '#24203a');
  },

  lumawool(g, v = 'front') {
    if (v === 'side') {
      const W = P('#fff3d6', '#d9c39a', '#ffffff'), Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.rect(4, 22, 1, 4, OUTLINE); g.ellipse(4, 21, 2.5, 2.5, '#ff4a3a');
      g.rect(10, 26, 2, 4, '#2a2230'); g.rect(19, 26, 2, 4, '#2a2230');
      g.ellipse(10, 20, 6, 6, W); g.ellipse(19, 20, 6, 6, W); g.ellipse(14, 15, 7, 6, W); g.ellipse(15, 23, 8, 6, W);
      g.poly([[19, 11], [14, 14], [19, 15]], Y);
      g.rect(21, 6, 1, 3, '#2a2230');
      g.ellipse(22, 13, 5, 5, Y, { edge: true });
      g.rect(24, 12, 2, 2, DARK_EYE); g.px(24, 12, '#ffffff');
      g.ellipse(23, 8, 1.5, 1.5, '#ff4a3a');
      return;
    }
    if (v === 'back') {
      const W = P('#fff3d6', '#d9c39a', '#ffffff'), Y = P('#ffd84a', '#e0a722', '#fff3a0');
      g.rectM(11, 26, 2, 4, '#2a2230');
      g.ellipse(10, 20, 6, 6, W); g.ellipse(22, 20, 6, 6, W); g.ellipse(16, 15, 7, 6, W); g.ellipse(16, 23, 8, 6, W);
      g.polyM([[12, 11], [6, 13], [11, 15]], Y);
      g.ellipse(16, 12, 5, 5, Y, { edge: true });
      g.rectM(13, 6, 1, 3, '#2a2230');
      g.rect(16, 24, 1, 4, OUTLINE); g.ellipse(16.5, 28, 2.5, 2.5, '#ff4a3a');
      return;
    }
    const W = P('#fff3d6', '#d9c39a', '#ffffff');
    const Y = P('#ffd84a', '#e0a722', '#fff3a0');
    g.rect(26, 22, 1, 4, OUTLINE);
    g.ellipse(27, 21, 2.5, 2.5, '#ff4a3a');                                                      // tail orb
    g.rectM(11, 26, 2, 4, '#2a2230');
    g.ellipse(10, 20, 6, 6, W); g.ellipse(22, 20, 6, 6, W); g.ellipse(16, 15, 7, 6, W); g.ellipse(16, 23, 8, 6, W);
    g.polyM([[12, 11], [6, 13], [11, 15]], Y);
    g.ellipse(16, 12, 5, 5, Y, { edge: true });
    g.rectM(13, 6, 1, 3, '#2a2230');
    g.eyes(13, 11, DARK_EYE, { h: 2 });
    g.ellipse(16, 8, 1.5, 1.5, '#ff4a3a');
  },

  brawlix(g, v = 'front') {
    if (v === 'side') {
      const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a');
      g.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');
      g.ellipse(12, 29, 2.2, 2, T, { edge: true }); g.ellipse(19, 29, 2.2, 2, T, { edge: true });
      g.ellipse(11, 20, 3.2, 3.2, R, { edge: true });
      g.ellipse(16, 21, 6, 6, T, { edge: true });
      g.ellipse(16, 26, 5.5, 2.6, '#3a5ab8', { edge: true });
      g.ellipse(17, 11, 6, 5.5, T, { edge: true });
      g.rect(11, 8, 12, 2, '#d23a3a');
      g.ellipse(19, 18, 2.5, 3.5, T, { edge: true });
      g.ellipse(23, 20, 3.5, 3.5, R, { edge: true });
      g.rect(20, 11, 2, 2, DARK_EYE); g.px(20, 11, '#ffffff'); g.px(19, 10, OUTLINE); g.px(20, 10, OUTLINE); g.px(21, 10, OUTLINE);
      g.px(22, 14, OUTLINE);
      return;
    }
    if (v === 'back') {
      const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a');
      g.ellipseM(12, 29, 2.2, 2, T, { edge: true });
      g.ellipse(16, 21, 6.5, 6, T, { edge: true });
      g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      g.ellipseM(10, 18, 2.5, 3.5, T, { edge: true });
      g.ellipseM(6.5, 21, 3.5, 3.5, R, { edge: true });
      g.ellipse(16, 11, 6, 5.5, T, { edge: true });
      g.rect(10, 8, 12, 2, '#d23a3a');
      g.rect(15, 8, 2, 3, '#9a2222');
      g.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); g.poly([[17, 10], [20, 16], [17, 15]], '#d23a3a');
      g.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    const T = P('#d9a066', '#a8703e', '#f2c896');
    const R = P('#d23a3a', '#9a2222', '#ff7a6a');
    g.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');                                              // headband tails
    g.ellipseM(12, 29, 2.2, 2, T, { edge: true });
    g.ellipse(16, 21, 6.5, 6, T, { edge: true });
    g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    g.ellipseM(10, 18, 2.5, 3.5, T, { edge: true });
    g.ellipseM(6.5, 21, 3.5, 3.5, R, { edge: true });
    g.ellipse(16, 11, 6, 5.5, T, { edge: true });
    g.rect(10, 8, 12, 2, '#d23a3a');
    g.eyes(13, 11, DARK_EYE, { brow: true, h: 2 });
    g.rect(15, 14, 2, 1, OUTLINE);
    g.rect(14, 19, 4, 1, '#a8703e');
  },

  galewing(g, v = 'front') {
    if (v === 'side') {
      const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
      g.poly([[12, 23], [1, 29], [5, 21]], B);
      g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      g.ellipse(19.5, 22, 3.5, 5, '#f4f0e6');
      g.poly([[16, 7], [13, 0], [18, 4], [20, 1], [20, 7]], B);
      g.ellipse(19, 11, 6.5, 6, B, { edge: true });
      g.poly([[24, 10], [30, 12], [24, 14]], Y);
      g.rect(20, 9, 2, 3, DARK_EYE); g.px(20, 9, '#ffffff'); g.px(19, 7, OUTLINE); g.px(20, 7, OUTLINE); g.px(21, 8, OUTLINE);
      wingPoly(g, [[9, 16], [21, 18], [17, 25], [7, 24]], Wg, { edge: true }, { root: [19, 18], swing: -0.6 });
      FLAP || g.px(11, 21, '#a8b4e0'); FLAP || g.px(14, 20, '#a8b4e0');
      g.rect(14, 28, 2, 2, Y); g.rect(19, 28, 2, 2, Y);
      return;
    }
    if (v === 'back') {
      const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
      g.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);
      g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      g.ellipse(16, 11, 6.5, 6, B, { edge: true });
      g.rectM(12, 28, 2, 2, Y);
      g.poly([[13, 25], [16, 31], [19, 25]], B, { edge: true });
      wingPolyM(g, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });
      FLAP || g.pxM(3, 13, '#a8b4e0'); FLAP || g.pxM(5, 18, '#a8b4e0'); FLAP || g.pxM(8, 16, '#a8b4e0');
      return;
    }
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff');
    const Wg = P('#eef2ff', '#a8b4e0', '#ffffff');
    const Y = '#ffc23a';
    g.poly([[20, 23], [31, 29], [27, 21]], B);                                                  // tail feathers
    wingPolyM(g, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });                // spread wings
    FLAP || g.pxM(3, 13, '#a8b4e0'); FLAP || g.pxM(4, 18, '#a8b4e0');
    g.poly([[14, 7], [12, 0], [16, 4], [19, 0], [18, 7]], B);                                   // crest
    g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });                                             // body
    g.ellipse(16, 22, 4.5, 5, '#f4f0e6');                                                       // belly
    g.ellipse(16, 11, 6.5, 6, B, { edge: true });                                               // head
    g.poly([[14, 13], [19, 13], [16, 17]], Y);                                                  // beak
    g.eyes(12, 10, DARK_EYE, { brow: true });
    g.rectM(12, 28, 2, 2, Y);                                                                   // feet
  },

  venomire(g, v = 'front') {
    if (v === 'side') {
      const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      g.poly([[13, 10], [10, 2], [16, 8]], B);
      g.ellipse(17, 17, 8, 9, B, { edge: true });
      g.poly([[18, 9], [20, 1], [22, 8]], B, { edge: true }); g.px(20, 1, S); g.px(20, 2, S);
      g.ellipse(21.5, 21, 3, 4.5, '#e4b8f4');
      for (const [x, y] of [[6, 25], [22, 27], [12, 20], [11, 13], [26, 24]]) { g.px(x, y, S); g.px(x + 1, y, S); }
      g.rect(21, 13, 2, 3, '#3a0a4a'); g.px(21, 13, '#ffffff');
      g.rect(22, 17, 3, 1, OUTLINE); g.px(23, 18, '#ffffff');
      return;
    }
    if (v === 'back') {
      const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
      g.ellipse(16, 25.5, 13, 5, B, { edge: true });
      g.polyM([[11, 10], [7, 2], [14, 8]], B);
      g.pxM(7, 2, S); g.pxM(8, 3, S);
      g.ellipse(16, 17, 8, 9, B, { edge: true });
      for (const [x, y] of [[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]]) { g.px(x, y, S); g.px(x + 1, y, S); }
      return;
    }
    const B = P('#a052c8', '#6e2e94', '#d08cf0');
    const S = '#d8f04a';
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                              // slimy base
    g.polyM([[11, 10], [7, 2], [14, 8]], B);                                                    // horns
    g.pxM(7, 2, S); g.pxM(8, 3, S);
    g.ellipse(16, 17, 8, 9, B, { edge: true });                                                 // body
    g.ellipse(16, 21, 4.5, 4.5, '#e4b8f4');                                                     // belly
    for (const [x, y] of [[8, 25], [22, 27], [25, 23], [5, 24], [17, 9], [11, 20]]) { g.px(x, y, S); g.px(x + 1, y, S); }
    g.eyes(12, 13, '#3a0a4a');
    g.rect(14, 17, 4, 1, OUTLINE); g.px(15, 18, '#ffffff'); g.px(17, 18, '#ffffff');             // fanged grin
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },

  scarablade(g, v = 'front') {
    if (v === 'side') {
      const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
      g.poly([[17, 8], [10, 5], [11, 10]], '#d23a3a');
      g.ellipse(10, 28, 3, 2, Bd, { edge: true }); g.ellipse(19, 28, 3, 2, Bd, { edge: true });
      g.ellipse(21, 12, 5.5, 4.5, Bd, { edge: true });
      g.poly([[22, 9], [25, 3], [29, 0], [27, 4], [26, 9]], Hn, { edge: true });
      g.rect(17, 8, 9, 2, '#d23a3a');
      g.ellipse(14, 20, 10, 8.5, Sh, { edge: true });
      g.rect(6, 17, 16, 1, '#3a5208');
      g.px(9, 15, '#c4e04a'); g.px(10, 14, '#c4e04a'); g.px(13, 14, '#c4e04a');
      g.ellipse(23, 21, 3, 3.2, Bd, { edge: true });
      g.rect(24, 11, 2, 2, '#ffde3a'); g.px(23, 10, OUTLINE); g.px(24, 10, OUTLINE);
      return;
    }
    if (v === 'back') {
      const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
      g.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });
      g.ellipseM(9, 28, 3, 2, Bd, { edge: true });
      g.ellipseM(5.5, 19, 3, 3.2, Bd, { edge: true });
      g.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });
      g.rect(10, 8, 12, 2, '#d23a3a');
      g.ellipse(16, 20, 10, 8.5, Sh, { edge: true });
      g.rect(16, 12, 1, 17, '#3a5208');
      g.pxM(10, 16, '#c4e04a'); g.pxM(11, 15, '#c4e04a'); g.pxM(12, 21, '#c4e04a');
      return;
    }
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a');
    const Bd = P('#3a3a2a', '#22221a', '#5a5a44');
    const Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    g.poly([[14, 10], [14, 4], [12, 0], [16, 2], [17, 5], [18, 10]], Hn, { edge: true });      // great horn
    g.poly([[16, 4], [21, 1], [19, 5], [17, 6]], Hn);                                           // horn fork
    g.ellipseM(9, 28, 3, 2, Bd, { edge: true });                                                // legs
    g.ellipseM(5.5, 19, 3, 3.2, Bd, { edge: true });                                            // fists
    g.ellipse(16, 20, 10, 8.5, Sh, { edge: true });                                             // shell
    g.rect(16, 13, 1, 15, '#3a5208');                                                           // shell seam
    g.pxM(11, 18, '#c4e04a'); g.pxM(12, 17, '#c4e04a');
    g.ellipse(16, 11.5, 6, 4.5, Bd, { edge: true });                                            // head
    g.rect(10, 8, 12, 2, '#d23a3a');                                                            // headband
    g.poly([[21, 8], [28, 5], [27, 10]], '#d23a3a');
    g.eyes(12, 11, '#ffde3a', { brow: true, h: 2 });
  },

  wispurr(g, v = 'front') {
    if (v === 'side') {
      const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa');
      g.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);
      g.ellipse(3, 16, 2.5, 3.5, F);
      g.poly([[13, 9], [10, 1], [16, 6]], B);
      g.ellipse(16, 21, 7, 6, B, { edge: true });
      g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      g.poly([[17, 8], [19, 0], [22, 6]], B, { edge: true }); g.px(19, 3, '#3ab8b0');
      g.ellipse(19, 12, 7.5, 6.5, B, { edge: true });
      g.rect(22, 11, 2, 3, '#2ad8c0'); g.px(22, 11, '#ffffff');
      g.px(25, 15, OUTLINE).px(26, 14, '#bcaaf0').px(27, 13, '#bcaaf0');
      return;
    }
    if (v === 'back') {
      const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa');
      g.polyM([[10, 9], [7, 1], [14, 6]], B, { edge: true });
      g.ellipse(16, 21, 7, 6, B, { edge: true });
      g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);
      g.ellipse(16, 12, 7.5, 6.5, B, { edge: true });
      g.poly([[15, 25], [20, 17], [17, 11], [24, 13], [19, 23]], B, { edge: true });
      g.ellipse(22, 10, 2.5, 3.5, F);
      return;
    }
    const B = P('#8a74c8', '#5a4494', '#bcaaf0');
    const F = P('#7af0e0', '#3ab8b0', '#e0fffa');
    g.poly([[18, 23], [27, 29], [25, 23], [30, 18], [22, 19]], B);                              // wispy tail
    g.ellipse(29, 16, 2.5, 3.5, F);                                                             // tail wisp-flame
    g.polyM([[10, 9], [7, 1], [14, 6]], B, { edge: true });                                     // ears
    g.pxM(8, 3, '#3ab8b0'); g.pxM(9, 5, '#3ab8b0');
    g.ellipse(16, 21, 7, 6, B, { edge: true });                                                 // body
    g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
    g.ellipse(16, 12, 7.5, 6.5, B, { edge: true });                                             // head
    g.eyes(11, 11, '#2ad8c0');
    g.px(15, 15, OUTLINE).px(17, 15, OUTLINE).px(16, 16, OUTLINE);                              // cat mouth
    g.pxM(6, 14, '#bcaaf0'); g.pxM(5, 15, '#bcaaf0');                                           // whiskers
  },

  gearhulk(g, v = 'front') { // 44x44
    if (v === 'side') {
      const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
      g.ellipse(15, 40, 5, 2.5, D, { edge: true }); g.ellipse(28, 40, 5, 2.5, D, { edge: true });
      g.ellipse(15, 25, 4.5, 8, D, { edge: true });
      g.poly([[10, 14], [32, 14], [34, 37], [8, 37]], M, { edge: true });
      g.rect(14, 20, 12, 3, '#6e7690'); g.rect(14, 26, 12, 3, '#6e7690');
      for (const [x, y] of [[12, 17], [30, 17], [11, 34], [31, 34]]) g.px(x, y, '#3a4054');
      g.ellipse(25, 25, 4.5, 8, D, { edge: true });
      g.ellipse(26, 34, 5, 4, M, { edge: true });
      g.rect(19, 1, 2, 4, '#6e7690'); g.ellipse(20, 1.5, 1.6, 1.6, '#ff4a3a');
      g.poly([[13, 5], [29, 5], [30, 15], [12, 15]], M, { edge: true });
      g.rect(23, 8, 7, 4, '#1c2a3a'); g.rect(27, 9, 2, 2, '#5affff');
      return;
    }
    if (v === 'back') {
      const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c');
      g.ellipseM(11, 40, 5, 2.5, D, { edge: true });
      g.ellipseM(5, 25, 4.5, 8, D, { edge: true });
      g.ellipseM(5, 34, 5, 4, M, { edge: true });
      g.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      g.rect(15, 18, 14, 14, '#6e7690');
      for (let y = 20; y < 31; y += 3) g.rect(17, y, 10, 1, '#3a4054');
      for (const [x, y] of [[11, 17], [32, 17], [10, 34], [33, 34]]) g.px(x, y, '#3a4054');
      g.rect(21, 1, 2, 4, '#6e7690'); g.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      g.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      g.rect(17, 9, 10, 2, '#6e7690');
      return;
    }
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0');
    const D = P('#5a6278', '#3a4054', '#7e869c');
    const G = '#e0a83a';
    g.ellipseM(11, 40, 5, 2.5, D, { edge: true });                                              // feet
    g.ellipseM(5, 25, 4.5, 8, D, { edge: true });                                               // arms
    g.ellipseM(5, 34, 5, 4, M, { edge: true });                                                 // fists
    g.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });                          // torso
    g.ellipse(22, 26, 6, 6, G);                                                                 // chest gear
    g.rect(21, 18, 2, 2, G); g.rect(21, 32, 2, 2, G); g.rect(14, 25, 2, 2, G); g.rect(28, 25, 2, 2, G);
    g.ellipse(22, 26, 2.2, 2.2, '#7a5418');
    for (const [x, y] of [[11, 17], [32, 17], [10, 34], [33, 34]]) g.px(x, y, '#3a4054');        // rivets
    g.rect(21, 1, 2, 4, '#6e7690'); g.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');                    // antenna
    g.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });                          // head
    g.rect(16, 8, 12, 4, '#1c2a3a');                                                            // visor
    g.rect(18, 9, 2, 2, '#5affff'); g.rect(24, 9, 2, 2, '#5affff');
  },

  // Toshi, the owner's real-life Shiba Inu (drawn from photos): a soft ginger coat; a big
  // white bib, belly and legs; white cheeks up to his eyes; pale eyebrow spots; upright
  // ears with pale insides; a big black nose; a ring of white ruff round the neck; and his smug half-shut stare.
  // The curled tail is ginger on top with lots of white fluff.
  smugshi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Ei = TOSHI.ear, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig(), side = v === 'side';
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]);
    const h = part(g, side ? R.head[0] : 0, R.head[1]);
    const legA = part(g, side && R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, side && R.legs[1] ? 1 : 0, -R.legs[1]);
    if (side) {
      t.ellipse(8, 15, 4.5, 4.5, O, { edge: true });                                             // curled tail, very fluffy
      t.ellipse(7.5, 14.5, 3.3, 3.3, C); t.px(7, 14, O.l); t.px(8, 15, O.s);
      legA.ellipse(10, 27, 1.8, 3, P(C.s, '#cbbba4', C.b)); legB.ellipse(19, 27, 1.8, 3, P(C.s, '#cbbba4', C.b));   // far legs
      b.ellipse(14, 22, 8.5, 5.5, O, { edge: true });                                            // body
      b.ellipse(14, 25.5, 7, 2, C);                                                              // white belly
      b.ellipse(9, 25, 2.2, 2.6, C);                                                             // white back of the thigh
      b.ellipse(20, 22, 3.5, 4.5, C);                                                            // white chest
      legB.ellipse(11, 27.5, 1.9, 3, C, { edge: true }); legA.ellipse(21, 27.5, 1.9, 3, C, { edge: true });   // white legs
      b.poly([[13, 15], [16, 13.5], [19, 17], [22, 22], [18, 23], [15.5, 18.5]], C);             // white sash from the chest up over the neck
      h.poly([[14, 8], [13, 1], [17, 5]], O);                                                    // far ear
      h.ellipse(19, 12, 6.5, 5.5, O, { edge: true });                                            // head
      b.px(13, 15, C.b); b.px(13, 16, C.b); b.px(14, 17, C.b);                                   // the ruff showing behind the head
      h.poly([[17, 7], [19, 0], [22, 6]], O, { edge: true });                                    // near ear
      h.poly([[18.5, 6], [19.3, 2.5], [21, 5.5]], PINK);
      h.poly([[21, 12], [28, 13.5], [27.5, 16.5], [20, 17.5]], C, { edge: true });               // white muzzle
      h.ellipse(19.5, 15.5, 3, 2, C);                                                            // white cheek
      h.px(21, 9, C.b); h.px(22, 9, C.b);                                                        // eyebrow spot
      if (R.eyes === 'blink') h.rect(21, 12, 3, 1, OUTLINE);
      else if (R.eyes === 'hurt') { h.rect(21, 12, 3, 1, OUTLINE); h.px(21, 11, OUTLINE); h.px(23, 11, OUTLINE); }
      else { h.rect(21, 11, 3, 1, OUTLINE); h.px(22, 12, DARK_EYE); h.px(23, 12, DARK_EYE); }    // smug half-shut eye
      h.rect(27, 13, 2, 2, OUTLINE);                                                             // nose
      if (R.mouth === 'open') { h.rect(23, 16, 4, 2, OUTLINE); h.px(24, 17, TONGUE); h.px(25, 17, TONGUE); }
      else h.px(24, 17, OUTLINE).px(25, 17, OUTLINE).px(26, 16, OUTLINE);                       // flat little mouth
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(20, 27.5, 2.2, 3, C, { edge: true });   // white hind legs
      b.ellipse(16, 22, 7.5, 6, O, { edge: true });
      b.ellipse(16, 26, 4, 2.2, C);                                                              // white rear
      h.polyM([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true });                             // big upright ears
      b.ellipse(16, 18.2, 7, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(16, 12, 8, 6.2, O, { edge: true });
      h.ellipseM(9, 15, 1.6, 1.6, C);                                                            // cheek fluff peeking out
      t.ellipse(16, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(16, 18.5, 3, 2.6, C); t.px(16, 18, O.s); t.px(17, 18, O.s);
      return;
    }
    t.ellipse(25.5, 17.5, 4.5, 4.5, O, { edge: true });                                          // curled tail behind him
    t.ellipse(26, 17, 3.2, 3.2, C); t.px(25, 17, O.l); t.px(26, 17, O.s);                        // lots of cream fluff in the curl
    legA.ellipse(12, 27, 2.4, 3.4, C, { edge: true }); legB.ellipse(20, 27, 2.4, 3.4, C, { edge: true });   // white front legs
    legA.px(11, 30, C.s).px(13, 30, C.s); legB.px(20, 30, C.s).px(18, 30, C.s);                  // toes
    b.ellipse(16, 22, 7.5, 6, O, { edge: true });                                                // body
    b.ellipse(16, 23, 5.2, 6, C);                                                                // white chest
    h.polyM([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true });                                // big upright ears, set wide
    h.polyM([[8.3, 8], [7.8, 2.5], [11.8, 5.8]], PINK);                                          // pink insides
    h.pxM(9, 4, C.b); h.pxM(10, 6, C.b);                                                         // white fur at the inner edge
    h.ellipse(16, 12, 8.5, 6.5, O, { edge: true });                                              // head
    h.ellipseM(10.5, 14.6, 2.8, 2.6, C);                                                         // white cheeks, up under the eyes
    h.ellipse(16, 15.6, 4.6, 3, C);                                                              // white muzzle
    h.rect(13, 17, 6, 3, C.b); h.rect(12, 18, 8, 2, C.b);                                        // white throat running into the chest (no chin line)
    h.rectM(11, 9, 2, 1, C.b);                                                                   // pale eyebrow spots
    if (R.eyes === 'blink') h.rectM(10, 12, 4, 1, OUTLINE);
    else if (R.eyes === 'hurt') h.pxM(10, 11, OUTLINE).pxM(11, 12, OUTLINE).pxM(12, 12, OUTLINE).pxM(13, 11, OUTLINE);   // squeezed shut
    else { h.rectM(10, 11, 4, 1, OUTLINE); h.rectM(11, 12, 2, 1, DARK_EYE); }                    // smug half-shut lids
    h.rect(15, 13, 2, 2, OUTLINE); h.px(15, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'open') { h.rect(14, 16, 4, 2, OUTLINE); h.px(15, 17, TONGUE).px(16, 17, TONGUE); }
    else { h.px(14, 17, OUTLINE).px(15, 17, OUTLINE).px(16, 17, OUTLINE).px(17, 17, OUTLINE); h.px(18, 16, OUTLINE); }   // flat, unimpressed mouth with a smug corner
  },

  // An exhausted sloth clinging to its coffee: dark eye bands that double as
  // tired bags, droopy half-shut eyes, a frown and messy bed hair.
  mondaze(g, v = 'front') {
    if (v === 'side') {
      const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
      g.ellipse(12, 29, 3, 1.6, F, { edge: true }); g.ellipse(20, 29, 3, 1.6, F, { edge: true });
      g.ellipse(15, 22, 9, 7.5, F, { edge: true });
      g.ellipse(18, 24, 4, 4.5, '#b0a090');
      g.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
      g.ellipse(18, 11, 8.5, 7, F, { edge: true });
      g.ellipse(21, 12, 5.5, 5, C);
      g.poly([[18, 10], [24, 10], [24, 14], [20, 14]], '#4a3a30');
      g.rect(21, 11, 2, 1, '#1a1222'); g.rect(21, 12, 2, 1, '#7a6a8a');
      g.rect(25, 13, 2, 1, OUTLINE);
      g.px(23, 17, OUTLINE).px(24, 16, OUTLINE).px(25, 17, OUTLINE);
      g.ellipse(20, 21, 2.5, 4, F, { edge: true });
      g.poly([[22, 20], [27, 20], [27, 26], [22, 26]], M, { edge: true });
      g.rect(28, 21, 1, 3, '#24766f'); g.rect(23, 20, 3, 1, '#5a3a22');
      g.px(23, 18, '#eef2f6').px(24, 17, '#eef2f6').px(26, 18, '#eef2f6');
      return;
    }
    if (v === 'back') {
      const F = P('#9a8a78', '#6e6052', '#bcae9c');
      g.ellipseM(11, 29, 3, 1.6, F, { edge: true });
      g.ellipse(16, 22, 9, 7.5, F, { edge: true });
      g.ellipseM(8, 21, 2.5, 4, F, { edge: true });
      g.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);
      g.ellipse(16, 11, 8.5, 7, F, { edge: true });
      for (const [x, y] of [[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]) { g.px(x, y, '#6e6052'); g.px(x + 1, y + 1, '#6e6052'); }
      return;
    }
    const F = P('#9a8a78', '#6e6052', '#bcae9c');
    const C = P('#e8dcc6', '#c8b89e', '#fff6e6');
    const M = P('#3aa8a0', '#24766f', '#6fd0c8');
    g.ellipseM(11, 29, 3, 1.6, F, { edge: true });                                              // feet
    g.ellipse(16, 22, 9, 7.5, F, { edge: true });                                               // slumped body
    g.ellipse(16, 24, 5, 4.5, '#b0a090');                                                       // belly
    g.poly([[12, 6], [13, 1], [15, 4], [17, 0], [18, 4], [21, 2], [20, 7]], F);                 // bed hair
    g.ellipse(16, 11, 8.5, 7, F, { edge: true });                                               // head
    g.ellipse(16, 12, 6.5, 5, C);                                                               // face
    g.polyM([[8, 10], [14, 10], [14, 14], [10, 14]], '#4a3a30');                                 // droopy eye bands
    g.rectM(11, 11, 2, 1, '#1a1222');                                                           // half-shut eyes
    g.rectM(11, 12, 2, 1, '#7a6a8a');                                                           // eye bags
    g.rect(15, 14, 2, 1, OUTLINE);                                                              // nose
    g.px(14, 17, OUTLINE).px(15, 16, OUTLINE).px(16, 16, OUTLINE).px(17, 17, OUTLINE);          // frown
    g.ellipseM(9, 21, 2.5, 4, F, { edge: true });                                               // arms
    g.poly([[13, 21], [19, 21], [19, 27], [13, 27]], M, { edge: true });                        // coffee mug
    g.rect(20, 22, 1, 3, '#24766f'); g.px(19, 22, '#24766f'); g.px(19, 24, '#24766f');          // handle
    g.rect(14, 21, 4, 1, '#5a3a22');                                                            // coffee
    g.pxM(12, 24, '#e8dcc6');                                                                   // claws round the mug
    g.px(14, 19, '#eef2f6').px(15, 18, '#eef2f6').px(17, 19, '#eef2f6').px(18, 18, '#eef2f6');  // steam
  },

  pixibelle(g, v = 'front') {
    if (v === 'side') {
      const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
      wingEllipse(g, 9, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(g, 10, 22, 4, 3.5, Wn, { edge: true });
      wingEllipse(g, 8, 12, 1.8, 1.5, '#ffb4dc');
      g.rect(19, 2, 1, 4, OUTLINE); g.px(19, 1, '#ffe066'); g.px(20, 1, '#ffe066'); g.px(19, 0, '#ffe066');
      g.ellipse(16, 23, 5, 5.5, B, { edge: true });
      g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
      g.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
      g.poly([[9, 6], [13, 9], [9, 12]], Pk); g.px(12, 9, '#c83a7a');
      g.rect(20, 12, 2, 3, '#6a2a5a'); g.px(20, 12, '#ffffff');
      g.ellipse(22, 16, 1.5, 1, '#ff8ab8');
      g.px(23, 17, OUTLINE);
      return;
    }
    if (v === 'back') {
      const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
      g.rectM(12, 2, 1, 4, OUTLINE);
      g.pxM(12, 1, '#ffe066'); g.pxM(11, 1, '#ffe066'); g.pxM(12, 0, '#ffe066');
      g.ellipse(16, 23, 5, 5.5, B, { edge: true });
      g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true });
      g.ellipse(16, 12.5, 7, 6.5, B, { edge: true });
      g.poly([[11, 5], [16, 8], [11, 10]], Pk); g.poly([[21, 5], [16, 8], [21, 10]], Pk); g.px(16, 8, '#c83a7a');
      wingEllipseM(g, 7.5, 14, 5.5, 5, Wn, { edge: true });
      wingEllipseM(g, 9, 22, 4, 3.5, Wn, { edge: true });
      wingEllipseM(g, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6');
    const Wn = P('#d8f4ff', '#a4d4f0', '#ffffff');
    const Pk = '#ff5a9e';
    wingEllipseM(g, 6.5, 13, 5.5, 5, Wn, { edge: true });                                            // upper wings
    wingEllipseM(g, 8, 22, 4, 3.5, Wn, { edge: true });                                              // lower wings
    wingEllipseM(g, 5.5, 12, 1.8, 1.5, '#ffb4dc');                                                   // wing spots
    g.rectM(12, 2, 1, 4, OUTLINE);                                                              // antennae
    g.pxM(12, 1, '#ffe066'); g.pxM(11, 1, '#ffe066'); g.pxM(12, 0, '#ffe066');
    g.ellipse(16, 23, 5, 5.5, B, { edge: true });                                               // body
    g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); // skirt
    g.ellipse(16, 12.5, 7, 6.5, B, { edge: true });                                             // head
    g.poly([[11, 5], [16, 8], [11, 10]], Pk); g.poly([[21, 5], [16, 8], [21, 10]], Pk);         // bow
    g.px(16, 8, '#c83a7a');
    g.eyes(12, 12, '#6a2a5a');
    g.ellipseM(10, 16, 1.5, 1, '#ff8ab8');                                                      // cheeks
    g.px(16, 17, OUTLINE);
  },
};

// Diagonal views, facing right like 'side' (flipped by face for left):
// 'fside' = three-quarter front (heading down-right), 'bside' = three-quarter back
// (heading up-right). A monster without an entry here turns in 4 directions only.
const MONSTER_ART_DIAG = {
  smugshi(g, v) {
    const O = TOSHI.coat, C = TOSHI.white, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig();
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]), h = part(g, R.head[0], R.head[1]);
    const legA = part(g, R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, R.legs[1] ? 1 : 0, -R.legs[1]);
    if (v === 'bside') {
      legA.ellipse(11, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(19, 28, 2, 2.8, C, { edge: true });   // white hind legs
      b.ellipse(15, 22, 7.5, 6, O, { edge: true });
      b.ellipse(13, 26, 4, 2.2, C);                                                              // white rear
      h.poly([[10, 9], [10, 0], [16, 5]], O, { edge: true });                                    // big upright ears
      h.poly([[19, 6], [23, 0], [25, 7]], O, { edge: true });
      b.ellipse(17, 18, 6.5, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(18, 11.5, 8, 6.2, O, { edge: true });
      h.ellipse(24.5, 14, 1.8, 1.8, C); h.ellipse(25.5, 12.5, 1.4, 1.4, C);                      // cheek and muzzle peeking out
      t.ellipse(13, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(13, 18.5, 3, 2.6, C); t.px(13, 18, O.s); t.px(14, 18, O.s);
      return;
    }
    t.ellipse(8, 17, 4.5, 4.5, O, { edge: true });                                               // curled tail behind him
    t.ellipse(7.5, 16.5, 3.2, 3.2, C); t.px(7, 16, O.l); t.px(8, 17, O.s);
    legB.ellipse(9, 26.5, 1.8, 2.8, P(C.s, '#cbbba4', C.b));                                     // hind leg
    b.ellipse(14, 22, 8, 6, O, { edge: true });                                                  // body
    b.ellipse(18.5, 23, 4.5, 5.5, C);                                                            // white chest
    legB.ellipse(15, 27.5, 2.2, 3.2, C, { edge: true }); legA.ellipse(21, 27.5, 2.2, 3.2, C, { edge: true });   // white front legs
    legB.px(14, 30, C.s); legA.px(20, 30, C.s);
    h.poly([[9, 10], [9, 0], [15, 5]], O, { edge: true });                                       // near ear
    h.poly([[10.3, 8], [10.3, 2.5], [13.5, 5.3]], PINK); h.px(11, 4, C.b);
    h.poly([[20, 7], [24, 0], [26, 7]], O, { edge: true });                                      // far ear
    h.poly([[21.5, 6], [23.6, 2.5], [24.6, 6]], PINK);
    h.ellipse(17.5, 12, 8, 6.5, O, { edge: true });                                              // head
    h.ellipse(12.5, 14.8, 2.6, 2.4, C); h.ellipse(23, 14.5, 1.6, 2, C);                          // white cheeks
    h.ellipse(20, 15.6, 4.4, 3, C);                                                              // white muzzle, turned his way
    h.rect(16, 17, 7, 3, C.b); h.rect(15, 18, 8, 2, C.b);                                        // white throat into the chest
    h.rect(13, 9, 2, 1, C.b); h.rect(21, 9, 2, 1, C.b);                                          // pale eyebrow spots
    if (R.eyes === 'blink') { h.rect(12, 12, 4, 1, OUTLINE); h.rect(20, 12, 3, 1, OUTLINE); }
    else if (R.eyes === 'hurt') { h.px(12, 11, OUTLINE).px(13, 12, OUTLINE).px(14, 12, OUTLINE).px(15, 11, OUTLINE); h.px(20, 11, OUTLINE).px(21, 12, OUTLINE).px(22, 11, OUTLINE); }
    else { h.rect(12, 11, 4, 1, OUTLINE); h.rect(13, 12, 2, 1, DARK_EYE); h.rect(20, 11, 3, 1, OUTLINE); h.rect(21, 12, 2, 1, DARK_EYE); }   // smug lids
    h.rect(21, 13, 2, 2, OUTLINE); h.px(21, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'open') { h.rect(19, 16, 4, 2, OUTLINE); h.px(20, 17, TONGUE).px(21, 17, TONGUE); }
    else h.px(19, 17, OUTLINE).px(20, 17, OUTLINE).px(21, 17, OUTLINE).px(22, 17, OUTLINE).px(23, 16, OUTLINE);   // flat mouth, smug corner
  },

  cinderox(g, v) {
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const mane = () => {
      g.poly([[9, 15], [11, 2], [16, 11]], F); g.poly([[14, 11], [18, 0], [22, 11]], F); g.poly([[20, 11], [25, 2], [26, 15]], F);
      g.poly([[13, 8], [18, 3], [23, 8], [18, 11]], '#ffd34a');
    };
    if (v === 'bside') {
      g.poly([[6, 20], [2, 18], [6, 23]], F);                                                    // flank flame
      g.ellipse(15, 21, 10, 7, B, { edge: true });
      g.ellipse(10, 28, 3, 2, B, { edge: true }); g.ellipse(20, 28.5, 3, 2, B, { edge: true });
      g.ellipse(18, 14, 7, 6, B, { edge: true });
      g.ellipse(24.5, 16.5, 1.6, 1.4, C);                                                        // muzzle peeking out
      mane();
      g.rect(12, 22, 2, 5, '#1f3054'); g.ellipse(12.5, 27.5, 1.6, 1.6, '#ff7a1c');               // tail
      return;
    }
    mane();
    g.poly([[6, 20], [1, 18], [6, 23]], F);                                                      // flank flame
    g.ellipse(14, 21, 10, 7, B, { edge: true });
    g.ellipse(17, 24, 6.5, 4.5, C);                                                              // belly
    g.ellipse(18, 14, 7, 6, B, { edge: true });
    g.ellipse(20.5, 17, 4, 2.5, C);                                                              // muzzle, turned his way
    g.ellipse(11, 28, 3, 2, C, { edge: true }); g.ellipse(20, 28.5, 3, 2, C, { edge: true });
    g.rect(13, 13, 3, 1, OUTLINE); g.px(15, 14, '#ff5a2a');                                      // narrow eyes
    g.rect(21, 13, 2, 1, OUTLINE); g.px(22, 14, '#ff5a2a');
    g.px(20, 16, OUTLINE).px(22, 16, OUTLINE);
  },

  tidalisk(g, v) {
    const B = P('#3d7fe0', '#2a58a8', '#7ab4ff'), C = P('#f2e6c0', '#cdbb88', '#fffbe6'), Fn = P('#bfe6ff', '#7ab4e8', '#ffffff');
    if (v === 'bside') {
      g.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                   // tail fin
      g.ellipse(16, 26, 12, 4.5, B, { edge: true });
      g.ellipse(17, 19, 6, 8, B, { edge: true });
      g.ellipse(18, 10, 7, 5.5, B, { edge: true });
      g.ellipse(24, 12, 1.6, 1.4, C);                                                            // snout peeking out
      g.poly([[12, 9], [4, 4], [10, 13]], Fn); g.poly([[23, 8], [30, 3], [25, 12]], Fn);         // head fins
      g.poly([[16, 6], [18, 0], [21, 6]], Fn);
      for (const y of [13, 16, 19, 22]) g.rect(16, y, 2, 2, '#7ab4ff');                          // spine spots
      return;
    }
    g.poly([[6, 25], [1, 20], [2, 29]], Fn);                                                     // tail fin
    g.poly([[16, 6], [18, 0], [21, 6]], Fn);                                                     // crest
    g.poly([[11, 9], [3, 4], [8, 13]], Fn); g.poly([[23, 8], [29, 4], [25, 12]], Fn);           // head fins
    g.ellipse(15, 26, 12, 4.5, B, { edge: true });                                               // coil
    g.ellipse(17, 19, 6, 8, B, { edge: true });                                                  // neck
    g.ellipse(18.5, 21, 3, 6, C);                                                                // belly
    g.ellipse(18, 10, 7, 5.5, B, { edge: true });                                                // head
    g.ellipse(20.5, 13, 4, 2, C);                                                                // snout, turned its way
    g.rect(14, 9, 2, 3, DARK_EYE); g.px(14, 9, '#ffffff');
    g.rect(21, 9, 2, 3, DARK_EYE); g.px(21, 9, '#ffffff');
    g.px(9, 26, '#7ab4ff'); g.px(6, 25, '#7ab4ff');
  },

  smugshogun(g, v) {
    const O = TOSHI.coat, C = TOSHI.white;
    const R = P('#c8303a', '#8a1a24', '#ff6a6a'), Wb = P('#f6f2ee', '#cfc8d8', '#ffffff'), Gd = '#ffd23f';
    if (v === 'bside') {
      g.ellipse(16, 40, 3.5, 2.2, C, { edge: true }); g.ellipse(28, 40, 3, 2, C, { edge: true });
      g.ellipse(21, 31, 10, 8.5, O, { edge: true });
      g.poly([[11, 23], [31, 23], [35, 40], [7, 40]], R, { edge: true });                       // the cape
      g.rect(8, 39, 26, 1, Gd);
      g.ellipse(12, 23, 3, 2, C); g.ellipse(32, 23.5, 2, 1.6, C);                                // ruff peeking out
      g.poly([[13, 12], [12, 1], [20, 8]], O, { edge: true }); g.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true });
      g.ellipse(23, 15, 11, 8.5, O, { edge: true });
      g.ellipse(33.5, 18.5, 1.8, 2, C);                                                          // muzzle peeking out
      g.rect(12, 9, 22, 2, Wb.b); g.rect(12, 10, 22, 1, Wb.s);
      g.rect(17, 9, 4, 3, Wb.l);                                                                 // headband knot
      g.poly([[18, 11], [14, 21], [17, 20]], Wb, { edge: true }); g.poly([[20, 11], [24, 21], [21, 20]], Wb, { edge: true });
      g.ellipse(20, 30, 6, 5.5, O, { edge: true });                                              // curled tail
      g.ellipse(20, 29.5, 3.2, 2.8, C); g.px(20, 29, O.s); g.px(21, 29, O.s);
      return;
    }
    g.ellipse(8, 25, 6.5, 6.5, O, { edge: true });                                               // tail
    g.ellipse(7.5, 24.5, 3.5, 3.5, C); g.px(8, 24, O.s);
    g.poly([[9, 23], [31, 23], [34, 40], [4, 40]], R, { edge: true });                           // cape behind
    g.rect(4, 39, 4, 1, Gd); g.rect(30, 39, 4, 1, Gd);
    g.ellipse(17, 40, 3.5, 2.2, C, { edge: true }); g.ellipse(29, 40, 3, 2, C, { edge: true });  // white socks
    g.ellipse(21, 31, 10, 8.5, O, { edge: true });
    g.ellipse(24, 33, 6, 6.5, C);                                                                // cream chest
    g.ellipse(23, 24, 9.5, 4, C, { edge: true });                                                // neck ruff
    g.ellipse(25, 24.5, 2, 2, Gd); g.px(25, 24, '#a87a1a');                                      // gold clasp
    g.poly([[12, 12], [11, 1], [19, 8]], O, { edge: true }); g.poly([[13.5, 10], [12.5, 4], [17, 8]], C.b);
    g.poly([[27, 9], [32, 1], [34, 10]], O, { edge: true }); g.poly([[28.5, 8.5], [31.5, 3.5], [32.5, 9]], C.b);
    g.ellipse(23, 15, 11, 8.5, O, { edge: true });
    g.ellipse(26, 19.5, 7, 4.5, C);                                                              // muzzle, turned his way
    g.ellipse(15, 18, 2.2, 1.8, C); g.ellipse(32.5, 18, 1.5, 1.5, C);
    g.rect(12, 9, 22, 2, Wb.b); g.rect(12, 10, 22, 1, Wb.s);                                     // headband
    g.ellipse(26, 9.5, 1.8, 1.4, '#c8303a');
    g.poly([[13, 9], [3, 6], [5, 13]], Wb, { edge: true });                                      // its tails, flying back
    g.px(17, 12, C.b); g.px(18, 12, C.b); g.px(28, 12, C.b); g.px(29, 12, C.b);                  // eyebrow spots
    g.rect(16, 14, 5, 1, OUTLINE); g.rect(17, 15, 3, 1, DARK_EYE);                               // smug lids
    g.rect(27, 14, 4, 1, OUTLINE); g.rect(28, 15, 2, 1, DARK_EYE);
    g.rect(26, 17, 3, 2, OUTLINE);                                                               // nose
    g.px(25, 22, OUTLINE).px(26, 22, OUTLINE).px(27, 22, OUTLINE).px(28, 21, OUTLINE);          // smirk
  },

  infernox(g, v) {
    const B = P('#26386a', '#16224a', '#3e5694'), C = P('#f3dd9a', '#d4b56a', '#fff2c4');
    const F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c');
    const H = P('#f3e8d0', '#b8a68a', '#ffffff'), L = '#ff7a1c', Gl = '#ffd34a';
    const cracks = pts => { for (const [x, y] of pts) { g.px(x, y, L); g.px(x + 1, y + 1, Gl); } };
    const horns = () => {
      g.poly([[17, 16], [8, 13], [4, 5], [7, 4], [10, 10], [18, 12]], H, { edge: true });
      g.poly([[31, 16], [38, 13], [41, 5], [38, 4], [36, 10], [30, 12]], H, { edge: true });
    };
    const mane = () => {
      g.poly([[10, 20], [12, 4], [18, 14]], F); g.poly([[16, 13], [20, 1], [24, 11]], F);
      g.poly([[24, 11], [28, 1], [32, 13]], F); g.poly([[30, 14], [36, 4], [38, 20]], F);
    };
    if (v === 'bside') {
      g.ellipse(13, 39, 4, 3, Rk, { edge: true }); g.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });
      g.ellipse(21, 30, 13, 9, B, { edge: true });
      cracks([[13, 30], [27, 28], [17, 34], [25, 34]]);
      g.ellipse(9, 25, 6, 5, Rk, { edge: true }); g.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); cracks([[8, 24], [34, 25]]);
      g.ellipse(24, 18, 9, 7.5, B, { edge: true });
      g.ellipse(33, 22, 2, 2, C);                                                                // muzzle peeking out
      horns();
      mane(); g.poly([[17, 13], [24, 6], [31, 13], [24, 17]], Gl);                               // blazing mane
      g.poly([[17, 34], [21, 21], [25, 34]], F); g.poly([[19, 32], [21, 25], [23, 32]], Gl);    // flames down the spine
      g.rect(15, 37, 2, 4, '#16224a'); g.ellipse(15, 41, 1.8, 1.8, F);                           // tail
      return;
    }
    mane(); g.poly([[17, 12], [24, 5], [31, 12], [24, 16]], Gl);                                 // blazing mane
    g.poly([[7, 30], [1, 25], [3, 32]], B); g.ellipse(2, 24, 2, 2.4, F);                         // tail, flame tip
    g.ellipse(13, 39, 4, 3, Rk, { edge: true }); g.ellipse(30, 39.5, 3.5, 2.8, Rk, { edge: true });   // hooves
    g.px(12, 41, L); g.px(14, 41, L); g.px(30, 41, L);
    g.ellipse(21, 30, 13, 9, B, { edge: true });                                                 // body
    g.ellipse(24, 33, 8, 5.5, C);                                                                // belly
    cracks([[10, 32], [30, 31], [12, 35]]);
    g.ellipse(9, 25, 6, 5, Rk, { edge: true }); g.ellipse(35, 25, 4.5, 4.5, Rk, { edge: true }); // shoulder armour
    cracks([[7, 24], [34, 24], [9, 27]]);
    horns();
    g.ellipse(24, 18, 10, 8, B, { edge: true });                                                 // head
    g.ellipse(26, 23, 7, 3.5, C, { edge: true });                                                // broad muzzle, turned his way
    g.rect(23, 23, 2, 1, OUTLINE); g.rect(28, 23, 2, 1, OUTLINE);                                // nostrils
    g.ellipse(26, 27, 2.2, 1.4, '#ffd23f'); g.px(26, 26, '#a87a1a');                             // nose ring
    g.rect(16, 15, 6, 1, OUTLINE); g.rect(27, 15, 5, 1, OUTLINE);                                // heavy brows
    g.rect(17, 16, 4, 2, Gl); g.rect(19, 16, 2, 2, '#ffffff');                                   // glowing eyes
    g.rect(28, 16, 3, 2, Gl); g.rect(28, 16, 2, 2, '#ffffff');
  },

  maelstrisk(g, v) {
    const B = P('#2a5ac8', '#1a3a8a', '#5a8cf0'), Fn = P('#5ae0d0', '#2aa8a0', '#c0fff8');
    const C = P('#f2e6c0', '#cdbb88', '#fffbe6'), H = P('#ffd23f', '#d89a1a', '#fff3a0'), Wh = '#e8fbff';
    const horns = () => { g.poly([[17, 8], [12, 0], [19, 5]], H, { edge: true }); g.poly([[28, 7], [32, 0], [30, 6]], H, { edge: true }); };
    g.poly([[5, 36], [0, 29], [1, 43]], Fn, { edge: true });                                     // tail fin
    if (v === 'bside') {
      g.ellipse(22, 37, 18, 6, B, { edge: true });
      g.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                        // fin-wings
      g.poly([[31, 21], [41, 14], [39, 24], [33, 28]], Fn, { edge: true });
      g.ellipse(23, 27, 7.5, 10, B, { edge: true });
      g.ellipse(24, 13, 9, 7, B, { edge: true });
      g.ellipse(32.5, 15, 2, 2, C);                                                              // snout peeking out
      g.poly([[18, 16], [9, 20], [10, 21], [19, 17]], Wh); g.poly([[31, 16], [39, 19], [38, 20], [30, 17]], Wh);
      horns();
      g.poly([[21, 7], [24, 0], [27, 7]], Fn);
      for (const y of [19, 24, 29, 34]) g.poly([[21, y], [23, y - 4], [25, y]], Fn, { edge: true }); // spines
      return;
    }
    g.ellipse(21, 37, 18, 6, B, { edge: true });                                                 // coil
    for (const x of [9, 15, 28, 34]) g.rect(x, 39, 3, 1, '#1a3a8a');
    g.poly([[13, 22], [2, 14], [4, 24], [10, 28]], Fn, { edge: true });                          // fin-wings
    g.poly([[30, 21], [39, 14], [38, 23], [33, 27]], Fn, { edge: true });
    g.ellipse(23, 27, 7.5, 10, B, { edge: true });                                               // neck
    g.ellipse(25, 29, 4, 8, C);                                                                  // belly scales
    for (const y of [23, 26, 29, 32, 35]) g.rect(22, y, 6, 1, '#cdbb88');
    g.poly([[21, 7], [24, 0], [27, 7]], Fn);                                                     // crest
    horns();
    g.ellipse(24, 13, 9, 7, B, { edge: true });                                                  // head
    g.ellipse(26.5, 17, 5.5, 3.5, C);                                                            // snout, turned its way
    g.poly([[21, 17], [12, 21], [13, 22], [22, 18]], Wh); g.poly([[31, 17], [38, 20], [37, 21], [30, 18]], Wh);   // whiskers
    g.rect(19, 11, 2, 3, DARK_EYE); g.px(19, 11, '#ffffff'); g.px(18, 9, OUTLINE).px(19, 9, OUTLINE).px(20, 10, OUTLINE).px(21, 10, OUTLINE);
    g.rect(28, 11, 2, 3, DARK_EYE); g.px(28, 11, '#ffffff'); g.px(30, 9, OUTLINE).px(29, 9, OUTLINE).px(28, 10, OUTLINE).px(27, 10, OUTLINE);
    g.px(25, 17, OUTLINE); g.px(28, 17, OUTLINE);
  },

  sparkit(g, v) {
    const Y = P('#ffd84a', '#e0a722', '#fff3a0'), TIP = '#2a2230';
    const ears = () => {
      g.poly([[12, 11], [5, 1], [15, 8]], Y); g.poly([[5, 1], [9, 2], [6, 5]], TIP);
      g.poly([[19, 9], [23, 0], [26, 8]], Y, { edge: true }); g.poly([[23, 0], [25, 2], [23, 4]], TIP);
    };
    if (v === 'bside') {
      ears();
      g.ellipse(16, 23, 7, 6.5, Y, { edge: true });
      g.ellipse(10, 22, 2, 2.5, Y, { edge: true });
      g.ellipse(17, 14, 9, 7.5, Y, { edge: true });
      g.ellipse(25, 17, 1.2, 1.2, '#ff5a4a');                                                    // cheek peeking out
      g.ellipse(12, 29, 3, 1.5, '#e0a722'); g.ellipse(19.5, 29, 2.6, 1.4, '#e0a722');
      g.rect(13, 20, 6, 1, '#c98a1a'); g.rect(13, 23, 4, 1, '#c98a1a');
      g.poly([[12, 27], [18, 20], [15, 19], [20, 11], [13, 15], [16, 16], [10, 23]], Y, { edge: true });   // bolt tail
      return;
    }
    g.poly([[11, 23], [4, 16], [7, 15], [2, 8], [9, 12], [6, 13], [13, 20]], Y);                 // bolt tail
    ears();
    g.ellipse(15, 23, 7, 6.5, Y, { edge: true });                                                // body
    g.ellipse(10, 22, 2, 2.5, Y, { edge: true }); g.ellipse(21, 22, 1.8, 2.3, Y, { edge: true }); // arms
    g.ellipse(17, 14, 9, 7.5, Y, { edge: true });                                                // head
    g.ellipse(12, 29, 3, 1.5, '#e0a722'); g.ellipse(19.5, 29, 2.6, 1.4, '#e0a722');              // feet
    g.rect(13, 12, 2, 3, DARK_EYE); g.px(13, 12, '#ffffff');
    g.rect(21, 12, 2, 3, DARK_EYE); g.px(21, 12, '#ffffff');
    g.ellipse(10.5, 17, 2, 1.5, '#ff5a4a'); g.ellipse(23.5, 16.5, 1.4, 1.4, '#ff5a4a');          // cheeks
    g.px(17, 17, OUTLINE).px(18, 17, OUTLINE).px(16, 16, OUTLINE).px(19, 16, OUTLINE);          // mouth
  },

  thornback(g, v) {
    const S = P('#3f9a3a', '#2a6b2a', '#77cc5a'), L = P('#8be04e', '#4fae2e', '#d4ff9a'), T = P('#e0c27a', '#b08f4a', '#f6e2a8');
    const plates = pts => { for (const [x, y] of pts) { g.px(x, y, '#2a6b2a'); g.px(x + 1, y, '#2a6b2a'); g.px(x, y + 1, '#2a6b2a'); } };
    const leaves = () => { g.poly([[9, 13], [5, 3], [13, 10]], L); g.poly([[14, 11], [17, 1], [20, 11]], L); g.poly([[20, 12], [23, 3], [26, 11]], L); };
    if (v === 'bside') {
      leaves();
      g.ellipse(8, 28, 3, 2.5, T, { edge: true }); g.ellipse(22, 28.5, 3, 2.5, T, { edge: true });
      g.ellipse(26, 23, 3.5, 3.2, T, { edge: true });                                            // head, mostly hidden
      g.ellipse(16, 19, 12, 9, S, { edge: true });
      plates([[10, 15], [16, 13], [21, 15], [12, 20], [19, 20], [15, 24], [8, 20], [23, 20]]);
      g.poly([[9, 25], [6, 30], [11, 27]], T);                                                   // tail
      return;
    }
    g.poly([[4, 22], [0, 24], [4, 26]], T);                                                      // tail
    leaves();
    g.ellipse(8, 28, 3, 2.5, T, { edge: true }); g.ellipse(21, 28.5, 3, 2.5, T, { edge: true });
    g.ellipse(15, 19, 12, 9, S, { edge: true });
    plates([[9, 15], [15, 13], [20, 15], [11, 20], [17, 20]]);
    g.ellipse(20, 23.5, 5, 4.2, T, { edge: true });                                              // head, turned its way
    g.rect(18, 22, 1, 2, DARK_EYE); g.px(18, 22, '#ffffff');
    g.rect(22, 22, 1, 2, DARK_EYE); g.px(22, 22, '#ffffff');
    g.px(20, 25, OUTLINE).px(21, 25, OUTLINE);
  },

  slumbear(g, v) { // 44x44
    const B = P('#3f6f78', '#2a4c55', '#5d939c'), C = P('#f2e2bc', '#cdb98a', '#fff6de');
    g.ellipse(13, 8, 3.5, 3.5, B); g.ellipse(30, 7.5, 3, 3, B);                                  // ears
    if (v === 'bside') {
      g.ellipse(22, 27, 17, 14, B, { edge: true });
      g.ellipse(6, 27, 3.5, 6, B, { edge: true }); g.ellipse(38, 27, 3, 5.5, B, { edge: true });
      g.ellipse(23, 14, 11, 8.5, B, { edge: true });
      g.ellipse(33.5, 16.5, 1.8, 2, C);                                                          // muzzle peeking out
      const D = P('#2a4c55', '#1f3a42', '#3f6f78');
      g.ellipse(13, 41, 5, 2.5, D, { edge: true }); g.ellipse(31, 41, 4.5, 2.3, D, { edge: true });
      g.ellipse(19, 36, 3, 3, C, { edge: true });                                                // stubby tail
      return;
    }
    g.ellipse(21, 27, 16.5, 14, B, { edge: true });
    g.ellipse(24, 31, 11, 10, C);                                                                // belly
    g.ellipse(6, 27, 3.5, 6, B, { edge: true }); g.ellipse(37, 27, 2.8, 5.5, B, { edge: true }); // arms
    g.ellipse(23, 14, 11, 8.5, B, { edge: true });
    g.ellipse(26, 16.5, 7, 5.5, C);                                                              // muzzle, turned its way
    g.rect(19, 14, 3, 1, OUTLINE); g.rect(28, 14, 3, 1, OUTLINE);                                // sleepy eyes
    g.rect(24, 19, 4, 1, OUTLINE); g.px(23, 18, OUTLINE); g.px(28, 18, OUTLINE);                 // smile
    g.ellipse(13, 41, 5, 2.5, C, { edge: true }); g.ellipse(31, 41, 4.5, 2.3, C, { edge: true });
    g.px(11, 41, OUTLINE); g.px(13, 41, OUTLINE); g.px(15, 41, OUTLINE); g.px(30, 41, OUTLINE); g.px(32, 41, OUTLINE);
    g.px(12, 7, '#2a4c55');
  },

  frostling(g, v) {
    const B = P('#9fdcf0', '#5ea8cc', '#e8fbff'), Cr = P('#d8f4ff', '#8fcfee', '#ffffff');
    const ears = () => { g.poly([[10, 10], [7, 1], [14, 8]], B); g.poly([[19, 9], [23, 1], [24, 8]], B); };
    if (v === 'bside') {
      ears();
      g.ellipse(16, 23, 6.5, 6, B, { edge: true });
      g.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); g.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
      g.ellipse(17, 14, 7.5, 6, B, { edge: true });
      g.poly([[23, 14], [26, 16], [23, 17]], B, { edge: true });                                 // snout peeking out
      g.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
      g.ellipse(12, 21, 5, 7.5, Cr, { edge: true });                                             // fluffy tail
      return;
    }
    g.ellipse(7, 19, 5, 7.5, Cr);                                                                // fluffy tail
    ears();
    g.ellipse(15, 23, 6.5, 6, B, { edge: true });
    g.ellipse(17, 14, 7.5, 6, B, { edge: true });
    g.poly([[16, 9], [18, 2], [20, 9]], Cr, { edge: true });
    g.poly([[10, 17], [6, 20], [11, 20]], Cr);                                                   // cheek frost
    g.ellipse(12, 29, 2.5, 1.5, '#5ea8cc'); g.ellipse(18.5, 29, 2.3, 1.4, '#5ea8cc');
    g.rect(14, 13, 2, 3, '#1a3a5a'); g.px(14, 13, '#ffffff');
    g.rect(20, 13, 2, 3, '#1a3a5a'); g.px(20, 13, '#ffffff');
    g.px(18, 17, OUTLINE).px(19, 17, OUTLINE);
  },

  drakorn(g, v) {
    const O = P('#f08a3a', '#c45e1e', '#ffb873'), W = P('#7b4bd6', '#5430a0', '#a682ff'), C = P('#f6e2b0', '#d2b070', '#fff6dc');
    const horns = () => { g.poly([[12, 9], [8, 1], [14, 6]], C, { edge: true }); g.poly([[20, 8], [23, 1], [24, 7]], C, { edge: true }); };
    const feet = () => { g.ellipse(12, 30, 2.5, 1.5, '#c45e1e'); g.ellipse(19.5, 30, 2.3, 1.4, '#c45e1e'); };
    if (v === 'bside') {
      horns();
      g.ellipse(16, 23, 8, 7.5, O, { edge: true });
      feet();
      g.ellipse(17.5, 12, 7, 6, O, { edge: true });
      g.ellipse(24, 14, 1.6, 1.4, C);                                                            // snout peeking out
      g.poly([[13, 27], [17, 27], [11, 32]], O, { edge: true });                                 // tail
      for (const y of [8, 11, 17]) g.rect(16, y, 2, 1, '#c45e1e');
      wingPoly(g, [[13, 19], [1, 6], [3, 20], [12, 24]], W, { edge: true });                          // wings
      wingPoly(g, [[21, 18], [30, 6], [29, 19], [22, 23]], W, { edge: true });
      return;
    }
    wingPoly(g, [[9, 17], [0, 5], [2, 19]], W); wingPoly(g, [[21, 15], [29, 4], [27, 17]], W);            // wings
    g.poly([[10, 26], [1, 30], [8, 22]], O);                                                     // tail
    horns();
    g.ellipse(15, 23, 8, 7.5, O, { edge: true });
    g.ellipse(17.5, 25, 4.5, 5.5, C);
    g.ellipse(17.5, 12, 7, 6, O, { edge: true });
    g.ellipse(20, 15, 4, 2.2, C);                                                                // snout, turned its way
    g.rect(14, 10, 2, 3, DARK_EYE); g.px(14, 10, '#ffffff'); g.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);
    g.rect(21, 10, 2, 3, DARK_EYE); g.px(21, 10, '#ffffff'); g.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    g.px(20, 15, OUTLINE).px(21, 15, OUTLINE);
    feet();
  },

  boulderon(g, v) { // 44x44
    const R = P('#8f8170', '#625747', '#b8aa96');
    g.poly([[9, 17], [12, 5], [17, 14]], R, { edge: true });                                     // rocky spikes
    g.poly([[17, 13], [21, 2], [25, 13]], R, { edge: true });
    g.poly([[24, 14], [30, 5], [32, 17]], R, { edge: true });
    if (v === 'bside') {
      g.ellipse(22, 26, 15, 14, R, { edge: true });
      g.ellipse(6, 28, 5, 6, R, { edge: true }); g.ellipse(37, 28, 4, 5.5, R, { edge: true });
      g.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); g.ellipse(29, 40, 4, 2.3, R, { edge: true });
      g.poly([[17, 26], [21, 18], [25, 26]], R, { edge: true }); g.poly([[18, 34], [21, 28], [24, 34]], R, { edge: true });
      for (const [x, y] of [[12, 22], [13, 23], [31, 30], [30, 31], [15, 33], [28, 20]]) g.px(x, y, '#4e4436');
      return;
    }
    g.ellipse(21, 26, 15, 14, R, { edge: true });
    g.ellipse(6, 28, 5, 6, R, { edge: true }); g.ellipse(36, 28, 4, 5.5, R, { edge: true });     // arms
    g.ellipse(13, 40, 4.5, 2.5, R, { edge: true }); g.ellipse(29, 40, 4, 2.3, R, { edge: true });
    g.rect(18, 22, 2, 3, '#ffb02a'); g.px(18, 22, '#ffffff'); g.px(17, 20, OUTLINE).px(18, 20, OUTLINE).px(19, 21, OUTLINE).px(20, 21, OUTLINE);
    g.rect(27, 22, 2, 3, '#ffb02a'); g.px(27, 22, '#ffffff'); g.px(29, 20, OUTLINE).px(28, 20, OUTLINE).px(27, 21, OUTLINE).px(26, 21, OUTLINE);
    g.rect(22, 30, 6, 1, OUTLINE); g.px(21, 29, OUTLINE); g.px(28, 29, OUTLINE);                 // scowl
    for (const [x, y] of [[12, 30], [13, 31], [13, 32], [30, 18], [31, 19], [28, 33], [29, 34]]) g.px(x, y, '#4e4436');
  },

  mindra(g, v) {
    const B = P('#c48ce8', '#9058b8', '#ebc8ff');
    const feet = () => { g.ellipse(13, 29.5, 2, 1.2, '#9058b8'); g.ellipse(18.5, 29.5, 1.8, 1.1, '#9058b8'); };
    if (v === 'bside') {
      g.poly([[10, 8], [5, 0], [13, 5]], B); g.poly([[19, 7], [23, 0], [24, 6]], B);
      g.ellipse(16, 23, 5, 6.5, B, { edge: true });
      feet();
      g.ellipse(17, 12, 8, 7, B, { edge: true });
      g.poly([[12, 27], [20, 22], [17, 15], [22, 11], [15, 19], [18, 23], [11, 25]], B, { edge: true });   // tail
      return;
    }
    g.poly([[13, 24], [2, 17], [5, 23], [1, 27], [11, 28]], B);                                  // tail
    g.poly([[10, 8], [5, 0], [13, 5]], B); g.poly([[19, 7], [23, 0], [24, 6]], B);              // ears
    g.ellipse(15, 23, 5, 6.5, B, { edge: true });
    g.ellipse(17, 12, 8, 7, B, { edge: true });
    g.ellipse(18.5, 8.5, 1.6, 1.6, '#ff3a6a'); g.px(18, 8, '#ffd0dc');                           // forehead gem
    g.rect(13, 11, 2, 4, '#5a1a8a'); g.px(13, 11, '#ffffff');
    g.rect(21, 11, 2, 4, '#5a1a8a'); g.px(21, 11, '#ffffff');
    g.px(19, 16, OUTLINE);
    feet();
  },

  shadefang(g, v) {
    const B = P('#3a3550', '#24203a', '#5a5478'), G = P('#8a86a0', '#5e5a74', '#b4b0c8'), RED = '#d2384a';
    const ears = () => {
      g.poly([[11, 10], [9, 1], [15, 7]], B); g.px(10, 4, RED); g.px(10, 5, RED);
      g.poly([[19, 9], [22, 1], [24, 8]], B, { edge: true }); g.px(22, 4, RED);
    };
    const feet = () => { g.ellipse(11, 28.5, 2.5, 1.5, '#24203a'); g.ellipse(19, 28.5, 2.3, 1.4, '#24203a'); };
    if (v === 'bside') {
      ears();
      g.ellipse(16, 22, 8, 6.5, B, { edge: true });
      g.ellipse(17, 18, 6, 2, RED);
      g.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
      g.poly([[23, 13], [27, 15], [23, 17]], B, { edge: true });                                 // snout peeking out
      feet();
      g.poly([[11, 25], [16, 15], [19, 12], [16, 24]], B, { edge: true });                       // tail
      return;
    }
    g.poly([[11, 22], [1, 13], [4, 22], [8, 26]], B);                                            // tail
    ears();
    g.ellipse(15, 22, 8, 6.5, B, { edge: true });
    g.ellipse(17, 18, 6, 2, RED);                                                                // collar
    g.ellipse(18, 13, 6.5, 5.5, B, { edge: true });
    g.ellipse(20, 16, 3.2, 2, G);                                                                // muzzle, turned its way
    g.rect(15, 12, 2, 3, '#ff3a3a'); g.px(15, 12, '#ffffff'); g.px(14, 10, OUTLINE).px(15, 10, OUTLINE).px(16, 11, OUTLINE).px(17, 11, OUTLINE);
    g.rect(21, 12, 2, 3, '#ff3a3a'); g.px(21, 12, '#ffffff'); g.px(23, 10, OUTLINE).px(22, 10, OUTLINE).px(21, 11, OUTLINE).px(20, 11, OUTLINE);
    g.px(20, 15, OUTLINE).px(21, 15, OUTLINE);
    feet();
  },

  lumawool(g, v) {
    const W = P('#fff3d6', '#d9c39a', '#ffffff'), Y = P('#ffd84a', '#e0a722', '#fff3a0');
    const wool = dx => { g.ellipse(9, 20, 6, 6, W); g.ellipse(20 + dx, 20, 5.5 + dx * 0.5, 6, W); g.ellipse(15, 15, 7, 6, W); g.ellipse(15, 23, 8, 6, W); };
    const head = () => {
      g.poly([[14, 11], [8, 13], [13, 15]], Y); g.poly([[22, 11], [26, 12], [22, 15]], Y);       // ears
      g.ellipse(18, 12, 5, 5, Y, { edge: true });
      g.rect(15, 6, 1, 3, '#2a2230'); g.rect(21, 6, 1, 3, '#2a2230');                            // little horns
    };
    if (v === 'bside') {
      g.rect(10, 26, 2, 4, '#2a2230'); g.rect(19, 26, 2, 4, '#2a2230');
      wool(1);
      head();
      g.rect(12, 24, 1, 4, OUTLINE); g.ellipse(12.5, 28, 2.5, 2.5, '#ff4a3a');                   // tail orb
      return;
    }
    g.rect(5, 22, 1, 4, OUTLINE); g.ellipse(4, 21, 2.5, 2.5, '#ff4a3a');                         // tail orb
    g.rect(10, 26, 2, 4, '#2a2230'); g.rect(19, 26, 2, 4, '#2a2230');
    wool(0);
    head();
    g.rect(15, 11, 2, 2, DARK_EYE); g.px(15, 11, '#ffffff');
    g.rect(20, 11, 2, 2, DARK_EYE); g.px(20, 11, '#ffffff');
    g.ellipse(18, 8, 1.5, 1.5, '#ff4a3a');
  },

  brawlix(g, v) {
    const T = P('#d9a066', '#a8703e', '#f2c896'), R = P('#d23a3a', '#9a2222', '#ff7a6a');
    const legs = () => { g.ellipse(12, 29, 2.2, 2, T, { edge: true }); g.ellipse(19.5, 29, 2, 1.9, T, { edge: true }); };
    if (v === 'bside') {
      legs();
      g.ellipse(16, 21, 6.5, 6, T, { edge: true });
      g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
      g.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); g.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
      g.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); g.ellipse(25.5, 21, 3.2, 3.2, R, { edge: true });
      g.ellipse(17, 11, 6, 5.5, T, { edge: true });
      g.rect(11, 8, 12, 2, '#d23a3a');
      g.rect(15, 8, 2, 3, '#9a2222');                                                            // headband knot
      g.poly([[15, 10], [12, 16], [15, 15]], '#d23a3a'); g.poly([[17, 10], [19, 16], [17, 15]], '#d23a3a');
      g.rect(14, 19, 4, 1, '#a8703e');
      return;
    }
    g.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                               // headband tails
    legs();
    g.ellipse(16, 21, 6.5, 6, T, { edge: true });
    g.ellipse(16, 26, 6, 2.6, '#3a5ab8', { edge: true });
    g.ellipse(10, 18, 2.5, 3.5, T, { edge: true }); g.ellipse(22, 18, 2.2, 3.2, T, { edge: true });
    g.ellipse(6.5, 21, 3.5, 3.5, R, { edge: true }); g.ellipse(25, 20.5, 3.2, 3.2, R, { edge: true });   // gloves up
    g.ellipse(17, 11, 6, 5.5, T, { edge: true });
    g.rect(11, 8, 12, 2, '#d23a3a');
    g.rect(14, 11, 2, 2, DARK_EYE); g.px(14, 11, '#ffffff'); g.px(13, 9, OUTLINE).px(14, 9, OUTLINE).px(15, 10, OUTLINE).px(16, 10, OUTLINE);
    g.rect(20, 11, 2, 2, DARK_EYE); g.px(20, 11, '#ffffff'); g.px(22, 9, OUTLINE).px(21, 9, OUTLINE).px(20, 10, OUTLINE).px(19, 10, OUTLINE);
    g.rect(17, 14, 2, 1, OUTLINE);
    g.rect(15, 19, 4, 1, '#a8703e');
  },

  galewing(g, v) {
    const B = P('#8fa8f0', '#5a6ec8', '#c8d6ff'), Wg = P('#eef2ff', '#a8b4e0', '#ffffff'), Y = '#ffc23a';
    const crest = () => g.poly([[16, 7], [14, 0], [18, 4], [21, 0], [20, 7]], B);
    const feet = () => { g.rect(13, 28, 2, 2, Y); g.rect(19, 28, 2, 2, Y); };
    if (v === 'bside') {
      crest();
      g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
      g.ellipse(18, 11, 6.5, 6, B, { edge: true });
      g.poly([[24, 11], [27, 12], [24, 14]], Y);                                                 // beak peeking out
      feet();
      g.poly([[11, 25], [13, 31], [16, 25]], B, { edge: true });                                 // tail
      wingPoly(g, [[13, 17], [0, 8], [2, 15], [1, 21], [11, 24]], Wg, { edge: true });                // wings
      wingPoly(g, [[20, 17], [31, 9], [30, 17], [22, 23]], Wg, { edge: true });
      FLAP || g.px(3, 13, '#a8b4e0'); FLAP || g.px(5, 18, '#a8b4e0'); FLAP || g.px(8, 16, '#a8b4e0'); FLAP || g.px(27, 14, '#a8b4e0');
      return;
    }
    g.poly([[12, 23], [1, 29], [5, 21]], B);                                                     // tail feathers
    wingPoly(g, [[10, 17], [0, 8], [2, 15], [1, 21], [8, 25]], Wg, { edge: true });                   // spread wings
    wingPoly(g, [[22, 16], [30, 9], [29, 17], [24, 23]], Wg, { edge: true });
    FLAP || g.px(3, 13, '#a8b4e0'); FLAP || g.px(4, 18, '#a8b4e0');
    crest();
    g.ellipse(16, 20, 7.5, 7.5, B, { edge: true });
    g.ellipse(18, 22, 4.5, 5, '#f4f0e6');
    g.ellipse(18, 11, 6.5, 6, B, { edge: true });
    g.poly([[18, 13], [23, 13], [21, 17]], Y);                                                   // beak, turned its way
    g.rect(14, 10, 2, 3, DARK_EYE); g.px(14, 10, '#ffffff'); g.px(13, 8, OUTLINE).px(14, 8, OUTLINE).px(15, 9, OUTLINE).px(16, 9, OUTLINE);
    g.rect(21, 10, 2, 3, DARK_EYE); g.px(21, 10, '#ffffff'); g.px(23, 8, OUTLINE).px(22, 8, OUTLINE).px(21, 9, OUTLINE).px(20, 9, OUTLINE);
    feet();
  },

  venomire(g, v) {
    const B = P('#a052c8', '#6e2e94', '#d08cf0'), S = '#d8f04a';
    const spots = pts => { for (const [x, y] of pts) { g.px(x, y, S); g.px(x + 1, y, S); } };
    g.ellipse(16, 25.5, 13, 5, B, { edge: true });                                               // slimy base
    g.poly([[11, 10], [7, 2], [14, 8]], B); g.px(7, 2, S); g.px(8, 3, S);                        // horns
    g.poly([[20, 9], [24, 2], [23, 8]], B); g.px(24, 2, S); g.px(23, 3, S);
    g.ellipse(17, 17, 8, 9, B, { edge: true });
    if (v === 'bside') {
      spots([[8, 25], [22, 27], [25, 23], [5, 24], [13, 12], [18, 15], [11, 19], [20, 21], [15, 23]]);
      return;
    }
    g.ellipse(19, 21, 4, 4.5, '#e4b8f4');                                                        // belly
    spots([[6, 25], [22, 27], [25, 23], [11, 20], [13, 10]]);
    g.rect(14, 13, 2, 3, '#3a0a4a'); g.px(14, 13, '#ffffff');
    g.rect(21, 13, 2, 3, '#3a0a4a'); g.px(21, 13, '#ffffff');
    g.rect(17, 17, 4, 1, OUTLINE); g.px(18, 18, '#ffffff'); g.px(20, 18, '#ffffff');             // fanged grin
    g.px(4, 28, '#6e2e94'); g.px(27, 28, '#6e2e94');                                             // drips
  },

  scarablade(g, v) {
    const Sh = P('#7ea81e', '#4e6e10', '#c4e04a'), Bd = P('#3a3a2a', '#22221a', '#5a5a44'), Hn = P('#e8dcb0', '#a89c78', '#fffbe6');
    g.poly([[17, 10], [17, 4], [16, 0], [20, 2], [21, 5], [21, 10]], Hn, { edge: true });        // great horn
    if (v === 'bside') {
      g.ellipse(9, 28, 3, 2, Bd, { edge: true }); g.ellipse(21, 28, 2.8, 2, Bd, { edge: true });
      g.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); g.ellipse(26.5, 19, 2.6, 3, Bd, { edge: true });
      g.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });
      g.rect(12, 8, 12, 2, '#d23a3a');
      g.ellipse(15, 20, 10, 8.5, Sh, { edge: true });
      g.rect(15, 12, 1, 17, '#3a5208');                                                          // shell seam
      g.px(10, 16, '#c4e04a'); g.px(11, 15, '#c4e04a'); g.px(12, 21, '#c4e04a'); g.px(20, 16, '#c4e04a');
      return;
    }
    g.poly([[20, 4], [25, 1], [23, 5], [21, 6]], Hn);                                            // horn fork
    g.poly([[11, 8], [4, 5], [5, 10]], '#d23a3a');                                               // headband tails
    g.ellipse(9, 28, 3, 2, Bd, { edge: true }); g.ellipse(21, 28, 2.8, 2, Bd, { edge: true });   // legs
    g.ellipse(5.5, 19, 3, 3.2, Bd, { edge: true }); g.ellipse(26, 19, 2.6, 3, Bd, { edge: true });   // fists
    g.ellipse(15, 20, 10, 8.5, Sh, { edge: true });                                              // shell
    g.rect(14, 13, 1, 15, '#3a5208');
    g.px(10, 18, '#c4e04a'); g.px(11, 17, '#c4e04a'); g.px(19, 17, '#c4e04a');
    g.ellipse(18, 11.5, 6, 4.5, Bd, { edge: true });                                             // head
    g.rect(12, 8, 12, 2, '#d23a3a');                                                             // headband
    g.rect(15, 11, 2, 2, '#ffde3a'); g.px(15, 11, '#ffffff'); g.px(14, 9, OUTLINE).px(15, 9, OUTLINE).px(16, 10, OUTLINE).px(17, 10, OUTLINE);
    g.rect(21, 11, 2, 2, '#ffde3a'); g.px(21, 11, '#ffffff'); g.px(23, 9, OUTLINE).px(22, 9, OUTLINE).px(21, 10, OUTLINE).px(20, 10, OUTLINE);
  },

  wispurr(g, v) {
    const B = P('#8a74c8', '#5a4494', '#bcaaf0'), F = P('#7af0e0', '#3ab8b0', '#e0fffa');
    const ears = () => {
      g.poly([[10, 9], [7, 1], [14, 6]], B, { edge: true }); g.px(8, 3, '#3ab8b0'); g.px(9, 5, '#3ab8b0');
      g.poly([[19, 8], [23, 1], [24, 7]], B, { edge: true }); g.px(22, 3, '#3ab8b0');
    };
    if (v === 'bside') {
      ears();
      g.ellipse(16, 21, 7, 6, B, { edge: true });
      g.poly([[9, 21], [10, 29], [13, 25], [16, 30], [19, 25], [22, 29], [23, 21]], B);           // ragged hem
      g.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
      g.px(25, 14, '#bcaaf0'); g.px(26, 13, '#bcaaf0');                                          // a whisker
      g.poly([[11, 25], [16, 17], [13, 11], [20, 13], [15, 23]], B, { edge: true });             // wispy tail
      g.ellipse(19, 10, 2.5, 3.5, F);
      return;
    }
    g.poly([[14, 23], [5, 29], [7, 23], [2, 18], [10, 19]], B);                                  // wispy tail
    g.ellipse(3, 16, 2.5, 3.5, F);
    ears();
    g.ellipse(15, 21, 7, 6, B, { edge: true });
    g.poly([[8, 21], [9, 29], [12, 25], [15, 30], [18, 25], [21, 29], [22, 21]], B);
    g.ellipse(17, 12, 7.5, 6.5, B, { edge: true });
    g.rect(13, 11, 2, 3, '#2ad8c0'); g.px(13, 11, '#ffffff');
    g.rect(20, 11, 2, 3, '#2ad8c0'); g.px(20, 11, '#ffffff');
    g.px(17, 15, OUTLINE).px(19, 15, OUTLINE).px(18, 16, OUTLINE);                              // cat mouth
    g.px(8, 14, '#bcaaf0'); g.px(7, 15, '#bcaaf0'); g.px(25, 14, '#bcaaf0');                     // whiskers
  },

  gearhulk(g, v) { // 44x44
    const M = P('#a8b0c4', '#6e7690', '#dfe4f0'), D = P('#5a6278', '#3a4054', '#7e869c'), G = '#e0a83a';
    g.ellipse(13, 40, 5, 2.5, D, { edge: true }); g.ellipse(29, 40, 4.5, 2.3, D, { edge: true }); // feet
    if (v === 'bside') {
      g.ellipse(5, 25, 4.5, 8, D, { edge: true }); g.ellipse(38, 25, 3.5, 7, D, { edge: true });
      g.ellipse(5, 34, 5, 4, M, { edge: true }); g.ellipse(38, 34, 4, 3.5, M, { edge: true });
      g.poly([[9, 14], [35, 14], [37, 37], [7, 37]], M, { edge: true });
      g.rect(14, 18, 14, 14, '#6e7690');                                                         // back panel
      for (let y = 20; y < 31; y += 3) g.rect(16, y, 10, 1, '#3a4054');
      g.rect(32, 16, 3, 20, '#6e7690');                                                          // side of the torso
      for (const [x, y] of [[11, 17], [30, 17], [10, 34], [31, 34]]) g.px(x, y, '#3a4054');
      g.rect(21, 1, 2, 4, '#6e7690'); g.ellipse(22, 1.5, 1.6, 1.6, '#ff4a3a');
      g.poly([[14, 5], [30, 5], [31, 15], [13, 15]], M, { edge: true });
      g.rect(16, 9, 10, 2, '#6e7690');
      g.rect(29, 8, 2, 4, '#1c2a3a');                                                            // edge of the visor
      return;
    }
    g.ellipse(5, 25, 4.5, 8, D, { edge: true }); g.ellipse(37, 25, 3.5, 7, D, { edge: true });   // arms
    g.ellipse(5, 34, 5, 4, M, { edge: true }); g.ellipse(37, 34, 4, 3.5, M, { edge: true });     // fists
    g.poly([[9, 14], [34, 14], [35, 37], [8, 37]], M, { edge: true });                           // torso
    g.rect(9, 16, 3, 20, '#6e7690');                                                             // its left side, turned to us
    g.ellipse(24, 26, 6, 6, G);                                                                  // chest gear
    g.rect(23, 18, 2, 2, G); g.rect(23, 32, 2, 2, G); g.rect(16, 25, 2, 2, G); g.rect(30, 25, 2, 2, G);
    g.ellipse(24, 26, 2.2, 2.2, '#7a5418');
    for (const [x, y] of [[13, 17], [32, 17], [13, 34], [33, 34]]) g.px(x, y, '#3a4054');        // rivets
    g.rect(23, 1, 2, 4, '#6e7690'); g.ellipse(24, 1.5, 1.6, 1.6, '#ff4a3a');                     // antenna
    g.poly([[15, 5], [31, 5], [32, 15], [14, 15]], M, { edge: true });                           // head
    g.rect(15, 6, 2, 8, '#6e7690');
    g.rect(18, 8, 12, 4, '#1c2a3a');                                                             // visor
    g.rect(20, 9, 2, 2, '#5affff'); g.rect(26, 9, 2, 2, '#5affff');
  },

  mondaze(g, v) {
    const F = P('#9a8a78', '#6e6052', '#bcae9c'), C = P('#e8dcc6', '#c8b89e', '#fff6e6'), M = P('#3aa8a0', '#24766f', '#6fd0c8');
    const hair = () => g.poly([[13, 6], [14, 1], [16, 4], [18, 0], [19, 4], [22, 2], [21, 7]], F);
    if (v === 'bside') {
      g.ellipse(11, 29, 3, 1.6, F, { edge: true }); g.ellipse(20, 29, 2.8, 1.5, F, { edge: true });
      g.ellipse(16, 22, 9, 7.5, F, { edge: true });
      g.ellipse(8, 21, 2.5, 4, F, { edge: true }); g.ellipse(24.5, 21, 2.2, 3.6, F, { edge: true });
      hair();
      g.ellipse(17, 11, 8.5, 7, F, { edge: true });
      g.ellipse(24, 13, 1.6, 2.5, C);                                                            // face peeking out
      for (const [x, y] of [[12, 9], [15, 7], [19, 9], [14, 13], [18, 14], [12, 20], [16, 18], [20, 21], [15, 24]]) { g.px(x, y, '#6e6052'); g.px(x + 1, y + 1, '#6e6052'); }
      return;
    }
    g.ellipse(12, 29, 3, 1.6, F, { edge: true }); g.ellipse(20, 29, 2.8, 1.5, F, { edge: true }); // feet
    g.ellipse(16, 22, 9, 7.5, F, { edge: true });                                                // slumped body
    g.ellipse(18, 24, 5, 4.5, '#b0a090');
    hair();
    g.ellipse(17, 11, 8.5, 7, F, { edge: true });
    g.ellipse(19, 12, 6.5, 5, C);                                                                // face, turned its way
    g.poly([[11, 10], [17, 10], [17, 14], [13, 14]], '#4a3a30'); g.poly([[20, 10], [25, 10], [24, 14], [20, 14]], '#4a3a30');   // droopy eye bands
    g.rect(14, 11, 2, 1, '#1a1222'); g.rect(14, 12, 2, 1, '#7a6a8a');
    g.rect(21, 11, 2, 1, '#1a1222'); g.rect(21, 12, 2, 1, '#7a6a8a');
    g.rect(18, 14, 2, 1, OUTLINE);
    g.px(17, 17, OUTLINE).px(18, 16, OUTLINE).px(19, 16, OUTLINE).px(20, 17, OUTLINE);          // frown
    g.ellipse(11, 21, 2.5, 4, F, { edge: true }); g.ellipse(24, 21, 2.2, 3.6, F, { edge: true }); // arms
    g.poly([[16, 21], [22, 21], [22, 27], [16, 27]], M, { edge: true });                         // coffee mug
    g.rect(23, 22, 1, 3, '#24766f'); g.px(22, 22, '#24766f'); g.px(22, 24, '#24766f');
    g.rect(17, 21, 4, 1, '#5a3a22');
    g.px(15, 24, '#e8dcc6'); g.px(23, 25, '#e8dcc6');                                            // claws round the mug
    g.px(17, 19, '#eef2f6').px(18, 18, '#eef2f6').px(20, 19, '#eef2f6').px(21, 18, '#eef2f6');  // steam
  },

  pixibelle(g, v) {
    const B = P('#ffc4dc', '#e88ab4', '#fff0f6'), Wn = P('#d8f4ff', '#a4d4f0', '#ffffff'), Pk = '#ff5a9e';
    const antennae = () => {
      g.rect(13, 2, 1, 4, OUTLINE); g.px(13, 1, '#ffe066'); g.px(12, 1, '#ffe066'); g.px(13, 0, '#ffe066');
      g.rect(20, 2, 1, 4, OUTLINE); g.px(20, 1, '#ffe066'); g.px(21, 1, '#ffe066'); g.px(20, 0, '#ffe066');
    };
    const body = () => {
      g.ellipse(16, 23, 5, 5.5, B, { edge: true });
      g.poly([[10, 29], [22, 29], [19, 22], [13, 22]], P(Pk, '#c83a7a', '#ff9ac4'), { edge: true }); // skirt
      g.ellipse(17, 12.5, 7, 6.5, B, { edge: true });
    };
    if (v === 'bside') {
      antennae();
      body();
      g.poly([[12, 5], [17, 8], [12, 10]], Pk); g.poly([[22, 5], [17, 8], [22, 10]], Pk); g.px(17, 8, '#c83a7a');   // bow
      wingEllipse(g, 7.5, 14, 5.5, 5, Wn, { edge: true }); wingEllipse(g, 9, 22, 4, 3.5, Wn, { edge: true });   // wings
      wingEllipse(g, 25.5, 13, 4.5, 4.5, Wn, { edge: true }); wingEllipse(g, 23.5, 21, 3.2, 3, Wn, { edge: true });
      wingEllipse(g, 6.5, 13, 1.8, 1.5, '#ffb4dc');
      return;
    }
    wingEllipse(g, 6.5, 13, 5.5, 5, Wn, { edge: true }); wingEllipse(g, 8, 22, 4, 3.5, Wn, { edge: true }); // wings
    wingEllipse(g, 25, 12, 4, 4.5, Wn, { edge: true }); wingEllipse(g, 24, 21, 3, 3, Wn, { edge: true });
    wingEllipse(g, 5.5, 12, 1.8, 1.5, '#ffb4dc');
    antennae();
    body();
    g.poly([[12, 5], [17, 8], [12, 10]], Pk); g.poly([[21, 6], [17, 8], [21, 10]], Pk); g.px(17, 8, '#c83a7a');   // bow
    g.rect(13, 12, 2, 3, '#6a2a5a'); g.px(13, 12, '#ffffff');
    g.rect(20, 12, 2, 3, '#6a2a5a'); g.px(20, 12, '#ffffff');
    g.ellipse(11.5, 16, 1.5, 1, '#ff8ab8'); g.ellipse(23, 16, 1.2, 1, '#ff8ab8');               // cheeks
    g.px(18, 17, OUTLINE);
  },
};

const SPRITES = {};

// Build every monster's views once: front (img), side (facing right), back, and the
// diagonals (fside, bside) for monsters that have them (sp.diag).
const VIEWS = ['front', 'side', 'back'];
function buildSprites() {
  for (const mon of ALL_MONS()) {
    const size = mon.size === 'L' ? 44 : 32;
    const diag = !!MONSTER_ART_DIAG[mon.id];
    const draw = () => {
      const out = {};
      for (const v of diag ? [...VIEWS, 'fside', 'bside'] : VIEWS) {
        const g = new PixGrid(size, size);
        (v === 'fside' || v === 'bside' ? MONSTER_ART_DIAG : MONSTER_ART)[mon.id](g, v);
        g.outline();
        out[v] = g.toCanvas();
      }
      return out;
    };
    const views = draw(), fly = FLYERS[mon.id] || null;
    let flap = null;
    if (fly && fly.flap) { FLAP = 1; flap = draw(); FLAP = 0; }   // the wings-down frame
    let frames = null;
    if (RIGGED.has(mon.id)) {   // its animation frames, each a full set of views
      const at = f => { RIG = { ...REST, ...f }; const out = draw(); RIG = null; return out; };
      frames = {};
      for (const [k, f] of Object.entries(RIG_FRAMES)) frames[k] = Array.isArray(f) ? f.map(at) : at(f);
    }
    SPRITES[mon.id] = { img: views.front, views, size, diag, fly, flap, frames };
  }
}

// Which view to show when heading along (dx, dy); null if not moving. With diagonal art
// it picks from 8 directions (front, fside, side, bside, back, mirrored by face), else 4.
// Each view holds on a little past its sector so it doesn't flicker at the edges.
const VIEW_ANGLE = { front: 0, fside: 45, side: 90, bside: 135, back: 180 };
function viewFor(dx, dy, cur, diag) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 0.001 && ay < 0.001) return null;
  if (!diag) {
    const k = cur === 'side' ? 1.6 : 0.8;
    return ay > ax * k ? (dy < 0 ? 'back' : 'front') : 'side';
  }
  const deg = Math.atan2(ax, dy) * 180 / Math.PI;   // 0 = heading down, 180 = heading up
  if (cur in VIEW_ANGLE && Math.abs(deg - VIEW_ANGLE[cur]) < 30) return cur;
  return ['front', 'fside', 'side', 'bside', 'back'][Math.round(deg / 45)];
}
const isSideView = v => v === 'side' || v === 'fside' || v === 'bside';

// Draw a monster into an arbitrary canvas, scaled to fit with integer pixels where possible.
function drawPortrait(canvas, monId, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sp = SPRITES[monId];
  const s = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / sp.size * (opts.zoom || 1)));
  const w = sp.size * s;
  const x = Math.round((canvas.width - w) / 2);
  const y = opts.crop ? Math.round(canvas.height * 0.08) : Math.round((canvas.height - w) / 2);
  if (opts.fainted) ctx.filter = 'grayscale(1) brightness(.6)';
  ctx.drawImage(sp.img, x, y, w, w);
  ctx.filter = 'none';
}

// ---------- animation poses (shared by both games' drawMon) ----------
// Pixel-true poses: a sprite bent at its own resolution, so whole rows and columns move and
// pixels stay square and crisp. sq > 0 squashes: sq rows come out of the body (55-85% of the
// height, below the eyes) and the body gets wider (the middle column repeated). sq < 0
// stretches: those rows are doubled instead. sh leans it: the top row shifts sh pixels
// forward (sprite space faces right), less further down. Anchored bottom-centre; cached.
const _poses = new WeakMap();
function posed(src, sq = 0, sh = 0) {
  if (!sq && !sh) return src;
  let cache = _poses.get(src);
  if (!cache) _poses.set(src, cache = {});
  const key = sq + ',' + sh;
  if (cache[key]) return cache[key];
  const w = src.width, h = src.height, b0 = Math.round(h * 0.55), b1 = Math.round(h * 0.85), L = b1 - b0;
  const k = Math.abs(sq), marks = new Set();
  for (let i = 0; i < k; i++) marks.add(b0 + Math.min(L - 1, Math.floor((i + 0.5) * L / k)));
  const rows = [];   // the source row for each output row, top to bottom
  for (let y = 0; y < h; y++) {
    if (sq > 0 && marks.has(y)) continue;
    rows.push(y);
    if (sq < 0 && marks.has(y)) rows.push(y);
  }
  const dw = sq > 0 ? Math.ceil(sq / 2) : 0, pad = Math.abs(sh), H = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w + 2 * dw + 2 * pad; cv.height = H;
  const c = cv.getContext('2d'), cx = w >> 1;
  rows.forEach((r, y) => {
    const off = pad + Math.round(sh * (H - 1 - y) / Math.max(1, H - 1));
    if (dw && r >= b0) {   // the body widens: the middle column is repeated
      c.drawImage(src, 0, r, cx, 1, off, y, cx, 1);
      for (let i = 0; i <= 2 * dw; i++) c.drawImage(src, cx, r, 1, 1, off + cx + i, y, 1, 1);
      c.drawImage(src, cx + 1, r, w - cx - 1, 1, off + cx + 2 * dw + 1, y, w - cx - 1, 1);
    } else c.drawImage(src, 0, r, w, 1, off + dw, y, w, 1);
  });
  return (cache[key] = cv);
}
// A canvas filled with one colour where it isn't transparent (hit flash, status tints), cached.
const _tints = new WeakMap();
function tintOf(src, color) {
  let cache = _tints.get(src);
  if (!cache) _tints.set(src, cache = {});
  if (cache[color]) return cache[color];
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
  return (cache[color] = cv);
}
// What a monster looks like right now: { views } (a rigged monster's animation frame, or its
// plain views), plus { sq, sh } for posed() and dy = extra lift (world units). Rigged monsters
// animate with real frames (walk cycle, idle with a tail wag, blinks, wind-up, attack, hurt);
// the rest just hop when walking and dip or rise a pixel when attacking. Walking means really
// covering ground (a monster the game has paused keeps its speed but mustn't keep stepping), and
// idle, blinks and the walk's hold run on the real clock, so nothing freezes mid-pose.
function monAnim(m, phase, flying) {
  const sp = SPRITES[m.id], F = sp.frames, a = m.action, clock = performance.now() / 1000;
  const side = m.view === 'side' || m.view === 'fside' || m.view === 'bside';
  const out = (views, sq = 0, sh = 0, dy = 0) => ({ views: views || sp.views, sq, sh, dy });
  if (m.walkT !== m._walkT) { m._walkT = m.walkT; m.walkSeen = clock; }
  const walking = m.walkSeen !== undefined && clock - m.walkSeen < 0.15;
  if (m.fainted) {
    if (F) return out(F.hurt);
    const k = Math.min(1, m.fadeT / 0.5);
    return out(null, Math.round(2 * k), side ? -Math.round(2 * k) : 0);
  }
  if (m.popT > 0) return out(F && F.windup, F ? 0 : m.popT > 0.18 ? -1 : 1, 0, m.popT > 0.18 ? 2 : 0);   // sent out: up, then landing
  if (m.hurtT > 0) return F ? out(F.hurt) : out(null, 1, side ? -1 : 0);
  if (a) {
    const wind = a.kind === 'cast' ? a.t < a.dur * 0.45 : a.kind === 'burst' ? !a.done : a.kind === 'beam' ? a.phase === 'charge' : false;
    if (F) return out(wind ? F.windup : F.attack);
    return out(null, wind ? 1 : 0, 0, wind ? 0 : 1);
  }
  if (walking) {
    if (F) return out(F.walk[Math.floor(m.walkT / 9) % 4]);   // a frame every 9 world units walked
    if (flying) return out(null);
    const f = Math.floor((m.walkT / 30 % 1) * 3);
    return out(null, 0, 0, f === 1 ? 2 : f === 2 ? 1 : 0);    // a simple 3-frame hop
  }
  if (F) {
    if ((clock + phase) % 3.7 < 0.14) return out(F.blink);
    return out(F.idle[Math.floor(clock * 2.5 + phase) % 4]);
  }
  return out(null);
}
