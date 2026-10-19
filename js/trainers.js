// The trainers (Monster Rush). Four trainers (dungeon.js TRAINERS), each as him ('m') and her
// ('f'), hand-shaped from the owner's concept art (docs/concept-prompts.md T1-T4, T1F-T4F): 8 looks
// in 5 views (front, back, side facing right, and the diagonals fside / bside, also facing right).
// A picture is 34x42 (the figure itself about 20 wide; the rest is room for a flying scarf or a
// coat tail). Each look draws its own head (typed rows, `heads`) and body (`body`: hand-picked
// rows and pixels) in body coordinates (x 0-23, TOX added when placed), then everything is
// inked round. The three-quarter views are made from the front and back ones: the face slides
// toward the way they're heading (`turnHead`), or a cheek peeks out from behind.
// The arms are separate so the pose rig (trainer.js) can swing them: TRAINER_ARMS says where
// they hang, each look's `arm(k)` gives their colours from shoulder to hand (3 wide), and
// trainerArmPx lays them at any angle. Everyone wears the Arcbracer on arm R: a slim bracelet at
// the wrist (band 1) with a glowing Arc-core set in it (2); the phone is its screen.
// A look key is trainerLook(id, 'm' | 'f'), e.g. 'diver-f'.
const TW = 34, TH = 42, TOX = 6;
const TR_BODY = 17, TR_LEGS = 30, TR_FEET = 38, TR_SPLIT = 12 + TOX;   // head rows 0-16, body 17-29, legs 30-41
const TRAINER_VIEWS = ['front', 'side', 'back', 'fside', 'bside'];
const TRAINER_ARMS = {
  front: { L: { sx: 2, sy: 19, side: -1 }, R: { sx: 21, sy: 19, side: 1 } },
  side: { R: { sx: 13, sy: 19, side: 1, over: true } },   // the near arm, over the body
};
TRAINER_ARMS.back = TRAINER_ARMS.fside = TRAINER_ARMS.bside = TRAINER_ARMS.front;
const TR_INK = '#1a1622';
const TRAINER_SKIN = { k: TR_INK, s: '#f2c49a', S: '#d49a74', r: '#2a1a1a', w: '#fff6e8', i: '#5a3020', K: '#6a2a2a', 3: '#fffaf0', 1: '#3a3e52', 2: '#5ae8ff' };
const TR_FACE = 'sSriwK3zmy';   // what counts as face when a head turns

function trPainter(w = TW, h = TH, ox = TOX) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const P = {
    g,
    at: (x, y) => (g[y] && g[y][x + ox]) || '.',
    px(x, y, c) { x += ox; if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; },
    row(y, x0, x1, c) { for (let x = x0; x <= x1; x++) P.px(x, y, c); },
    rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) P.row(y, x0, x1, c); },
    pts(list, c) { for (const [x, y] of list) P.px(x, y, c); },
    col(x, y0, y1, c) { for (let y = y0; y <= y1; y++) P.px(x, y, c); },
    head(rows, hx) { rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') P.px(x + hx, y, c); })); },
  };
  return P;
}
function trInk(g) {
  const add = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (g[y][x] !== '.') continue;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = (g[y + oy] || [])[x + ox]; if (c && c !== '.' && c !== 'k') { add.push([x, y]); break; } }
  }
  for (const [x, y] of add) g[y][x] = 'k';
}
// An arm as pixels [x, y, key] (body coordinates plus ox/oy), drawn as a thick limb from the
// shoulder at `deg` (0 = hanging, 90 = straight out, 180 = straight up): every pixel within 1.45
// of the line from the shoulder is arm, coloured by how far along it is (arm.cols[t] = the keys
// across the arm at step t, outer edge first, so its light and dark edges stay at any angle), with
// a rounded shoulder that joins the body and a chunky hand (arm.fist) at the end. A pixel's 4th
// value says it's past the shoulder (where the arm gets an outline even over the body).
function trainerArmPx(a, deg, arm, ox = 0, oy = 0) {
  const ang = deg * Math.PI / 180, dx = Math.sin(ang) * a.side, dy = Math.cos(ang);
  const nx = dy * a.side, ny = -dx * a.side;   // across the arm, pointing to its outer edge
  const cx = a.sx - a.side + ox, cy = a.sy + oy, L = arm.cols.length - 1;
  const out = [], pick = (cs, d) => cs[d > 0.5 ? 0 : d < -0.5 ? 2 : 1];
  for (let y = Math.floor(cy - L - 4); y <= cy + L + 4; y++) for (let x = Math.floor(cx - L - 4); x <= cx + L + 4; x++) {
    const px = x - cx, py = y - cy, t = px * dx + py * dy, d = px * nx + py * ny;
    if (t > L + 0.5 && t <= L + 2 && Math.abs(d) <= 1.6) out.push([x, y, pick(arm.fist, d), true]);   // the hand
    else if (t >= -0.5 && t <= L + 0.5 && Math.abs(d) <= 1.45) out.push([x, y, pick(arm.cols[Math.max(0, Math.min(L, Math.round(t)))], d), t > 2.5]);
    else if (px * px + py * py <= 2.3) out.push([x, y, pick(arm.cols[0], d)]);   // the round of the shoulder
  }
  return out;
}
function trArm(P, a, arm) {
  const px = trainerArmPx(a, 0, arm);
  for (const [x, y, c] of px) P.px(x, y, c);
  if (!a.over) return;
  const own = new Set(px.map(([x, y]) => x + ',' + y));   // over the body: ink its front edge and the hand (the back edge melts into the body)
  for (const [x, y] of px) for (const [ox, oy] of [[1, 0], [0, 1]]) {
    const nx = x + ox, ny = y + oy;
    if (!own.has(nx + ',' + ny) && ny > a.sy && P.at(nx, ny) !== '.') P.px(nx, ny, 'k');
  }
}
// The three-quarter front head: the whole face slides one pixel toward the right inside the
// head (the far side gets a little more hair or hood, the near side a little less).
function turnHead(rows) {
  return rows.map(r => {
    let i0 = -1, i1 = -1;
    [...r].forEach((c, i) => { if (TR_FACE.includes(c)) { if (i0 < 0) i0 = i; i1 = i; } });
    if (i0 < 1 || i1 + 3 > r.length) return r;
    return r.slice(0, i0) + r[i0 - 1] + r.slice(i0, i1 + 2) + r.slice(i1 + 3);
  });
}
// The three-quarter back head: a sliver of cheek shows at the right edge.
function peekHead(rows, ys) {
  return rows.map((r, y) => {
    if (!ys.includes(y)) return r;
    const e = r.lastIndexOf('k');
    return e > 1 ? r.slice(0, e - 1) + 'S' + r.slice(e) : r;
  });
}

// ---------------------------------------------------------------- the looks
const TRAINER_LOOKS = {
  // T1: messy dark hair with a red streak, brass goggles, a long red scarf whipping in the wind,
  // a charcoal bomber covered in patches over a slate tee, crystal charms on the belt, olive cargo
  // shorts over leggings, chunky boots, fingerless gloves (her: long locks and a high ponytail)
  scarf: {
    name: 'Scarf Tamer',
    pal: { h: '#3a3248', H: '#241e30', e: '#5e5470', R: '#c8303a', g: '#b08a4a', G: '#7a5a2a', y: '#8ad4ec', Y: '#3a6a8a',
      m: '#8a3a34', a: '#d8343a', A: '#a01e2a', q: '#6e1420', j: '#4a3a30', J: '#30261e', I: '#6a5444',
      t: '#55618a', T: '#3e4868', v: '#b84040', o: '#f08a2a', u: '#f0d040', p: '#9a6ad8', n: '#3ac0b0',
      l: '#5a4030', L: '#3e2a1e', b: '#6a4a2e', B: '#c0c4cc', c: '#8af6e8', C: '#f090f8',
      O: '#6e6a48', P: '#545034', Q: '#8a8660', d: '#2e3446', D: '#22263a', z: '#d8d4cc',
      f: '#7a6040', F: '#54422a', Z: '#b0aca4', V: '#2a2420' },
    heads: {
      front: { x: 2, lash: [[5, 12], [15, 12]], rows: [
        '.......k..k...k.....',
        '.....k.khkhk.khk.k..',
        '....khkhhhhhkhhhkhk.',
        '...khhhhehhhhhhRhhhk',
        '..khhheehhhhhhRRhhhk',
        '..khhkkkkkkkkkkkkhhk',
        '.khhkgyyYgkkgyyYgkhk',
        '.khhkgYyyggggYyygkhk',
        '.khhhkkkkkhhkkkkkhhk',
        'khhhhHhhhhhhhhHhhhhk',
        'khhhhHshssshsssHhhhk',
        'khhhksHHsssssHHSkhhk',
        'khhhkSrrsssssrrSkhhk',
        'khhhkswissssswiSkhhk',
        '.khhksiisssKsiiSkhk.',
        '..khksssKKKsssSkhk..',
        '...khkSssssssSkhk...',
      ] },
      side: { x: 1, lash: [[16, 12]], rows: [
        '......k..kk.k.......',
        '.....khkkhhkhk......',
        '...kkhhhhhhhhhkk....',
        '..khhhhhhhhhRhhhk...',
        '.khhhehhhhhhRRhhhk..',
        '.khheehhhhhhhhkkkkk.',
        'khhhhhhhhhhhhkgyyYk.',
        'khhhhhhhhhhhhkgYyyk.',
        'khhhhhhhhhhhhhkkkkk.',
        'khhhhhhhhhhhhHhhhhk.',
        '.khhhhhhhhhhhshhsshk',
        '.khhhhhhhSSssssHHssk',
        '.khhhhhhSSssssrrsssk',
        '..khhhhhSssssswisssk',
        '..khhhhhhsssssiisKk.',
        '...khhhkSsssssKKsk..',
        '....kk.kSSssssssk...',
      ] },
      back: { x: 2, rows: [
        '.......k..k...k.....',
        '.....k.khkhk.khk.k..',
        '....khkhhhhhkhhhkhk.',
        '...khhhhehhhhhhRhhhk',
        '..khhheehhhhhhRRhhhk',
        '..khhkkkkkkkkkkkkhhk',
        '.khhkGGGGGGGGGGGGkhk',
        '.khhhkkkkkkkkkkkkhhk',
        '.khhhhhhhhehhhhhhhhk',
        'khhhhhhHhhhhhhHhhhhk',
        'khhhhehhhhhhhhhhhhhk',
        'khhhhhhhhhhhhhhehhhk',
        'khhhhHhhhhhhhhhhhhhk',
        'khhhhhhhhHhhhhhhhhhk',
        '.khhhhHhhhhhhHhhhhk.',
        '..khhhkhhhhhhkhhhk..',
        '...kk.kSSSSSSk.kk...',
      ] },
    },
    arm: k => k === 'R'
      ? { cols: ['jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', 'JJJ', '121', 'lll', 'Lll'], fist: 'sss' }
      : { cols: ['jjj', 'Ijj', 'Ijj', 'Ijj', 'Ijj', 'Ijj', 'JJJ', 'lll', 'lll', 'Lll'], fist: 'sss' },
    body(P, v, f) {
      const side = v === 'side', back = v === 'back' || v === 'bside';
      const streamer = (x0, dir) => {   // the scarf's long end, drooping as it trails off, a tattered tip
        for (let i = 0; i <= 13; i++) {
          const x = x0 + dir * i, y = i <= 4 ? 16 : i <= 8 ? 17 : i <= 11 ? 18 : 19;
          P.px(x, y, 'a'); P.px(x, y + 1, i > 2 ? 'A' : 'a');
        }
        const t = n => x0 + dir * n;
        P.pts([[t(13), 19], [t(11), 20]], '.'); P.pts([[t(13), 20], [t(12), 21], [t(10), 20]], 'q'); P.px(t(7), 18, 'q');
      };
      if (side) {
        P.row(18, 7, 15, 'a'); P.rect(7, 19, 15, 25, 'j'); P.col(8, 19, 25, 'I'); P.col(15, 19, 25, 'J');
        P.rect(14, 20, 14, 25, 't'); P.rect(8, 21, 9, 22, 'o'); P.px(9, 22, 'u');
        P.row(26, 7, 15, 'J'); P.row(27, 8, 15, 't'); P.row(28, 7, 15, 'b');
        P.rect(7, 29, 16, 31, 'O'); P.rect(7, 32, 10, 33, 'O'); P.rect(13, 32, 16, 33, 'O'); P.col(7, 29, 33, 'Q'); P.col(16, 29, 33, 'P');
        P.row(30, 10, 12, 'P'); P.rect(10, 31, 12, 32, 'O'); P.pts([[14, 29], [8, 29]], 'g'); P.pts([[14, 30], [14, 31]], 'c'); P.pts([[8, 30], [8, 31]], 'C');
        P.rect(8, 34, 10, 36, 'D'); P.rect(13, 34, 15, 36, 'd'); P.col(15, 34, 36, 'D');
        P.row(37, 8, 10, 'z'); P.row(37, 13, 15, 'z');
        P.rect(6, 38, 10, 40, 'F'); P.rect(12, 38, 16, 40, 'f'); P.pts([[14, 38], [15, 39]], 'z'); P.row(40, 15, 16, 'Z'); P.row(40, 9, 10, 'Z');
        P.row(41, 6, 10, 'V'); P.row(41, 12, 16, 'V');
        P.head(this.heads.side.rows, this.heads.side.x);
        P.row(16, 8, 14, 'a'); P.row(17, 7, 15, 'a'); P.pts([[13, 17], [14, 17], [15, 17], [15, 18], [14, 18]], 'A');
        P.rect(14, 19, 15, 23, 'a'); P.col(15, 19, 23, 'A');
        streamer(7, -1);
        if (f) { P.pts([[2, 2], [1, 3], [2, 3], [0, 4], [1, 4], [0, 5], [-1, 6], [0, 6], [-1, 7], [-2, 8], [-1, 8], [-2, 9], [-2, 10]], 'h'); P.pts([[1, 3], [0, 5], [-1, 7]], 'R'); P.px(3, 3, 'a'); }
        return;
      }
      // the jacket, open over the tee, cropped, covered in patches (one big one on the back)
      P.row(19, 5, 18, 'j'); P.rect(6, 20, 17, 25, 'j'); P.col(6, 20, 25, 'I'); P.col(17, 20, 25, 'J');
      if (back) {
        P.rect(10, 21, 13, 24, 'o'); P.pts([[11, 21], [12, 22], [11, 23], [12, 24], [10, 24], [13, 21]], 'u'); P.pts([[10, 21], [13, 24]], 'j');
        P.row(26, 6, 17, 'J'); P.row(27, 7, 16, 't'); P.row(28, 6, 17, 'b');
      } else {
        P.rect(10, 20, 13, 26, 't'); P.pts([[10, 22], [13, 22], [11, 23], [12, 23]], 'v'); P.pts([[13, 24], [13, 25]], 'T');
        P.col(9, 20, 25, 'J'); P.col(14, 20, 25, 'I');
        P.row(26, 6, 9, 'J'); P.row(26, 14, 17, 'J'); P.row(27, 7, 16, 't'); P.row(27, 14, 16, 'T');
        P.pts([[7, 21], [8, 21], [7, 22]], 'o'); P.px(8, 22, 'u'); P.pts([[15, 21], [16, 22], [15, 22]], 'u'); P.pts([[7, 24], [8, 24]], 'p'); P.px(16, 24, 'n');
        P.row(28, 6, 17, 'b'); P.pts([[11, 28], [12, 28]], 'B');
      }
      for (let y = 21; y <= 27; y++) { P.px(5, y, 'k'); P.px(18, y, 'k'); }
      // cargo shorts with crystal charms hanging off the belt
      P.row(29, 6, 17, 'O'); P.rect(5, 30, 18, 32, 'O'); P.row(33, 6, 10, 'O'); P.row(33, 13, 17, 'O');
      P.col(6, 29, 33, 'Q'); P.col(17, 29, 33, 'P');
      P.row(30, 4, 6, 'P'); P.rect(4, 31, 6, 32, 'O'); P.px(4, 31, 'Q'); P.row(30, 17, 19, 'P'); P.rect(17, 31, 19, 32, 'O'); P.row(32, 17, 19, 'P');
      for (let y = 31; y <= 33; y++) { P.px(11, y, 'k'); P.px(12, y, 'k'); }
      if (back) P.pts([[8, 30], [9, 30], [14, 30], [15, 30]], 'P');
      else { P.pts([[7, 29], [9, 29], [14, 29], [16, 29]], 'g'); P.pts([[7, 30], [7, 31], [16, 30], [16, 31]], 'c'); P.pts([[9, 30], [9, 31], [14, 30], [14, 31]], 'C'); }
      // leggings, socks, boots
      P.rect(7, 34, 10, 36, 'd'); P.rect(13, 34, 16, 36, 'd'); P.col(10, 34, 36, 'D'); P.col(16, 34, 36, 'D');
      P.row(37, 7, 10, 'z'); P.row(37, 13, 16, 'z');
      const fs = v === 'fside' ? 1 : 0;
      P.rect(6, 38, 10, 40, 'f'); P.rect(13, 38, 17 + fs, 40, 'f');
      if (!back) { P.pts([[8, 38], [9, 39], [14, 38], [15, 39]], 'z'); P.row(40, 5, 7, 'Z'); P.row(40, 16 + fs, 18 + fs, 'Z'); }
      else { P.col(10, 38, 39, 'F'); P.col(17, 38, 39, 'F'); }
      P.row(41, 5, 10, 'V'); P.row(41, 13, 18 + fs, 'V');
      // the head, with tufts sticking out
      const H = back ? this.heads.back : this.heads.front;
      if (v === 'front') P.head(H.rows, H.x);
      else if (v === 'fside') P.head(turnHead(H.rows), H.x + 1);
      else if (v === 'back') P.head(H.rows, H.x);
      else P.head(peekHead(H.rows, [11, 12, 13]), H.x + 1);
      const sx = v === 'fside' || v === 'bside' ? 1 : 0;
      P.pts([[1, 6], [0, 7], [1, 7], [1, 9], [0, 10], [1, 10]].map(([x, y]) => [x + sx, y]), 'h'); P.px(1 + sx, 7, 'e');
      if (!sx) { P.pts([[22, 5], [23, 6], [22, 6], [22, 9], [23, 10], [22, 10], [21, 2], [22, 2]], 'h'); P.px(22, 6, 'e'); }
      if (!back) P.pts([[17 + sx, 2], [17 + sx, 3], [16 + sx, 4]], 'R');
      // the scarf: wrapped round the neck, one end down the front (or back), the long end flying
      P.row(17, 6, 17, 'a'); P.row(18, 5, 18, 'a'); P.pts([[15, 18], [16, 18], [17, 18], [18, 18], [16, 17], [17, 17]], 'A');
      if (back) { P.rect(13, 19, 14, 24, 'a'); P.col(14, 19, 24, 'A'); P.pts([[13, 25], [14, 26]], 'a'); streamer(18, 1); }
      else { P.rect(8, 19, 9, 23, 'a'); P.col(9, 19, 23, 'A'); P.pts([[8, 24], [9, 25]], 'a'); streamer(6, -1); }
      if (f) {   // her: long locks over the shoulders and a high ponytail
        if (back) { P.rect(10 + sx, 3, 13 + sx, 15, 'h'); P.rect(10 + sx, 16, 12 + sx, 21, 'h'); P.pts([[11, 5], [12, 8], [11, 11], [12, 14], [11, 18]].map(([x, y]) => [x + sx, y]), 'e'); P.pts([[12, 5], [12, 6], [13, 7], [13, 8], [12, 9], [12, 10], [13, 11], [13, 12], [12, 13]].map(([x, y]) => [x + sx, y]), 'R'); P.pts([[10, 4], [13, 4]].map(([x, y]) => [x + sx, y]), 'a'); }
        else {
          P.pts([[3, 1], [2, 0], [4, 0]].map(([x, y]) => [x + sx, y]), 'h');
          for (let y = 13; y <= 18; y++) { P.px(2 + sx, y, 'h'); P.px(3 + sx, y, y % 2 ? 'h' : 'e'); if (!sx) { P.px(21, y, 'h'); P.px(20, y, y % 2 ? 'h' : 'e'); } }
        }
      }
    },
  },

  // T2: a weathered bucket hat with a red band, round wire glasses, dark hair, a khaki field coat
  // with pockets over a dark tee, a red neckerchief, a leather satchel across the body, baggy
  // olive trousers rolled at the cuff, grey socks, scuffed boots, work gloves (her: a bob)
  researcher: {
    name: 'Field Researcher',
    pal: { c: '#a8a07c', C: '#827a5a', a: '#c0382e', A: '#8a2420', h: '#22303a', H: '#3a4c58', m: '#5a4a38', y: '#d8f0f4',
      j: '#b8a070', J: '#8c784e', I: '#d0bc8c', t: '#2e2e34', T: '#202024', b: '#7a4a2a', B: '#56321c', N: '#9a6238',
      p: '#7a7458', P: '#5a5640', Q: '#949070', z: '#c8c4b8', f: '#7a5a3a', F: '#54402a', V: '#2a2420', g: '#6a4a30', G: '#4a3220', e: '#7ae8d0' },
    heads: {
      front: { x: 2, lash: [[4, 11], [15, 11]], rows: [
        '....................',
        '......kkkkkkkk......',
        '.....kccccccccCk....',
        '....kccccccccccCk...',
        '....kcccccccccCCk...',
        '...kaaaaaaaaaaaAAk..',
        '.kkccccccccccccccCkk',
        'kccccccccccccccccCCk',
        '.kkCCCCCCCCCCCCCCkk.',
        '..khhSSSSSSSSSShhk..',
        '..khhsHhsssssHhshk..',
        '..khsmmssssssmmshk..',
        '..khmyrmsmmsmyrmhk..',
        '..khmiimssssmiimhk..',
        '..khsmmssssKsmmShk..',
        '...kssssKKKsssSk....',
        '....kkSssssssSkk....',
      ] },
      side: { x: 1, lash: [[15, 11]], rows: [
        '....................',
        '.....kkkkkkkk.......',
        '....kccccccccCk.....',
        '...kcccccccccCCk....',
        '...kccccccccccCk....',
        '..kaaaaaaaaaaaAk....',
        '.kccccccccccccccCkk.',
        'kCcccccccccccccccCCk',
        '.kkCCCCCCCCCCCCCCkk.',
        '..khhhhhhhSSSSSSk...',
        '..khhhhhhhssHhssk...',
        '..khhhhhSSssmmsssk..',
        '..khhhhhSSsmyrmssk..',
        '...khhhhhSsmiimssk..',
        '...khhhhhsssmmsKsk..',
        '....khhhkSsssKKsk...',
        '.....kkk.kSSsssk....',
      ] },
      back: { x: 2, rows: [
        '....................',
        '......kkkkkkkk......',
        '.....kccccccccCk....',
        '....kccccccccccCk...',
        '....kcccccccccCCk...',
        '...kaaaaaaaaaaaAAk..',
        '.kkccccccccccccccCkk',
        'kccccccccccccccccCCk',
        '.kkCCCCCCCCCCCCCCkk.',
        '..khhhhhhhhhhhhhhk..',
        '..khhhHhhhhhhHhhhk..',
        '..khhhhhhhhhhhhhhk..',
        '..khhhhhhHhhhhhhhk..',
        '...khhhhhhhhhhhhk...',
        '....khhhhhhhhhhk....',
        '.....kkSSSSSSkk.....',
        '.......kSSSSk.......',
      ] },
    },
    arm: k => k === 'R'
      ? { cols: ['jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', 'III', 'sss', '121', 'ggg', 'Ggg'], fist: 'ggg' }
      : { cols: ['jjj', 'Ijj', 'Ijj', 'Ijj', 'Ijj', 'III', 'sss', 'Sss', 'ggg', 'ggG'], fist: 'ggg' },
    body(P, v, f) {
      const side = v === 'side', back = v === 'back' || v === 'bside', sx = v === 'fside' || v === 'bside' ? 1 : 0;
      if (side) {
        P.rect(7, 19, 15, 29, 'j'); P.col(7, 19, 29, 'I'); P.col(15, 19, 29, 'J'); P.rect(14, 20, 14, 26, 't');
        P.rect(5, 30, 15, 33, 'j'); P.px(5, 30, '.'); P.col(15, 30, 33, 'J'); P.row(33, 5, 15, 'J'); P.row(30, 8, 10, 'J');
        P.rect(9, 27, 13, 31, 'N'); P.row(27, 9, 13, 'b'); P.px(11, 28, 'B'); P.pts([[9, 26], [10, 25], [11, 24]], 'b'); P.px(10, 26, 'z');
        P.rect(8, 34, 10, 36, 'P'); P.rect(12, 34, 15, 36, 'p'); P.col(15, 34, 36, 'P'); P.row(36, 8, 10, 'Q'); P.row(36, 12, 15, 'Q');
        P.row(37, 8, 10, 'z'); P.row(37, 12, 15, 'z');
        P.rect(6, 38, 10, 40, 'F'); P.rect(12, 38, 16, 40, 'f'); P.pts([[13, 38], [14, 39]], 'z'); P.row(41, 6, 10, 'V'); P.row(41, 12, 16, 'V');
        P.head(this.heads.side.rows, this.heads.side.x);
        P.row(17, 10, 15, 'a'); P.row(18, 12, 16, 'a'); P.px(16, 19, 'A'); P.pts([[9, 17], [8, 18], [7, 18]], 'a');
        if (f) { P.rect(3, 9, 8, 16, 'h'); P.pts([[2, 10], [2, 11], [2, 12], [2, 13], [2, 14], [2, 15], [3, 17], [4, 17]], 'h'); P.pts([[4, 11], [6, 14], [3, 15]], 'H'); }
        return;
      }
      // the coat: collar, pockets, open over the tee, long skirts; trousers between
      P.row(19, 5, 18, 'j'); P.rect(6, 20, 17, 29, 'j'); P.col(6, 20, 29, 'I'); P.col(17, 20, 29, 'J');
      P.rect(4, 30, 9, 33, 'j'); P.rect(14, 30, 19, 33, 'j'); P.col(4, 30, 33, 'I'); P.col(19, 30, 33, 'J'); P.row(33, 4, 9, 'J'); P.row(33, 14, 19, 'J');
      P.rect(10, 29, 13, 33, 'p'); P.col(13, 29, 33, 'P');
      for (let y = 21; y <= 29; y++) { P.px(5, y, 'k'); P.px(18, y, 'k'); }
      if (back) {
        P.rect(10, 29, 13, 33, 'j'); P.col(11, 26, 33, 'J'); P.pts([[11, 32], [12, 32], [11, 33], [12, 33]], '.');
        P.pts([[7, 20], [8, 21], [9, 22], [10, 23], [11, 24], [12, 25], [13, 26], [14, 27], [15, 28]], 'b');
        const bx = 3 + sx;
        P.rect(bx, 28, bx + 4, 32, 'N'); P.row(28, bx, bx + 4, 'b'); P.px(bx + 2, 29, 'B');
      } else {
        P.rect(10, 20, 13, 28, 't'); P.col(13, 21, 28, 'T'); P.col(9, 20, 29, 'J'); P.col(14, 20, 29, 'I');
        P.pts([[8, 19], [9, 19], [14, 19], [15, 19], [8, 20], [15, 20]], 'I');
        P.rect(7, 22, 8, 23, 'J'); P.rect(15, 22, 16, 23, 'J'); P.pts([[15, 21], [16, 21]], 'y'); P.px(16, 21, 'a');
        P.row(29, 10, 13, 'b'); P.pts([[11, 29], [12, 29]], 'z');
        P.rect(6, 30, 8, 31, 'J'); P.rect(15, 30, 17, 31, 'J');
        P.pts([[7, 20], [8, 21], [9, 22], [10, 23], [11, 24], [12, 25], [13, 26], [14, 27], [15, 28]], 'b');
        P.rect(15, 28, 19, 32, 'N'); P.row(28, 15, 19, 'b'); P.col(19, 28, 32, 'B'); P.px(17, 29, 'z'); P.pts([[16, 27], [17, 27]], 'z');
        P.rect(16, 30, 17, 30, 'e');
      }
      // baggy trousers rolled at the cuff, socks, boots
      P.rect(6, 34, 10, 36, 'p'); P.rect(13, 34, 17, 36, 'p'); P.col(10, 34, 35, 'P'); P.col(17, 34, 35, 'P');
      P.row(36, 6, 10, 'Q'); P.row(36, 13, 17, 'Q'); P.row(37, 7, 10, 'z'); P.row(37, 13, 16, 'z');
      const fs = v === 'fside' ? 1 : 0;
      P.rect(6, 38, 10, 40, 'f'); P.rect(13, 38, 17 + fs, 40, 'f'); P.row(41, 5, 10, 'V'); P.row(41, 13, 18 + fs, 'V');
      if (!back) P.pts([[8, 38], [8, 39], [15, 38], [15, 39]], 'z'); else { P.col(10, 38, 40, 'F'); P.col(17, 38, 40, 'F'); }
      const H = back ? this.heads.back : this.heads.front;
      if (v === 'front' || v === 'back') P.head(H.rows, H.x);
      else if (v === 'fside') P.head(turnHead(H.rows), H.x + 1);
      else P.head(peekHead(H.rows, [11, 12, 13]), H.x + 1);
      // the neckerchief, knotted with its tails out to the side
      if (back) { P.row(17, 7, 16, 'a'); P.row(18, 6, 17, 'A'); }
      else { P.row(17, 7, 16, 'a'); P.row(18, 9, 14, 'a'); P.row(19, 10, 13, 'a'); P.pts([[11, 20], [12, 20]], 'A'); P.pts([[17, 17], [18, 17], [18, 18], [19, 18]], 'a'); P.px(19, 19, 'A'); }
      if (f) {   // her: a bob under the hat
        if (back) { P.rect(4 + sx, 9, 19 + sx, 16, 'h'); P.pts([[8, 11], [13, 13], [16, 10]].map(([x, y]) => [x + sx, y]), 'H'); P.row(16, 7 + sx, 16 + sx, 'h'); }
        else {
          P.rect(2 + sx, 9, 4 + sx, 16, 'h'); P.pts([[3, 11], [2, 14]].map(([x, y]) => [x + sx, y]), 'H');
          P.rect(19 + 2 * sx, 9, 21, 16, 'h'); if (!sx) P.px(20, 12, 'H');
          P.row(9, 5 + sx, 16 + sx, 'h'); P.pts([[8, 10], [12, 10]].map(([x, y]) => [x + 2 * sx, y]), 'h');
        }
      }
    },
  },

  // T3: a crimson hood and a long torn coat, a steel chest plate, a coil of rope on the shoulder,
  // a gauntlet with glowing studs, a belt pouch and a hanging lantern, khaki trousers with knee
  // guards, tall strapped boots, a plaster on the cheek (her: a braid)
  diver: {
    name: 'Dungeon Diver',
    pal: { c: '#a8323c', C: '#7a2028', x: '#4a141c', h: '#1c1820', H: '#363040', z: '#e8d8b8',
      j: '#9a2c36', J: '#6e1c24', I: '#c04450', m: '#c8ccd4', M: '#8a909c', W: '#eef0f4', t: '#3a2e2a',
      b: '#6a4628', B: '#4a2e18', n: '#c8a46a', N: '#9a7a44', y: '#ffd76a', Y: '#ffa83a',
      p: '#8a8268', P: '#6a6450', f: '#6a4a2e', F: '#4a321e', V: '#2a2018', g: '#b0a890', G: '#8a8270' },
    heads: {
      front: { x: 2, lash: [[5, 10], [15, 10]], rows: [
        '.......kkkkkk.......',
        '.....kkcccccckk.....',
        '....kcccccccccck....',
        '...kccccccccccccCk..',
        '..kccccxxxxxxccccCk.',
        '..kcccxhhhhhhxcccCk.',
        '.kcccxhhhHhhhhxcccCk',
        '.kccxhhHhhhhHhhxccCk',
        '.kccxhHhhhhhhhHhxcCk',
        '.kccxssHsssssHssxcCk',
        '.kccxsrrsssssrrsxcCk',
        '.kccxswissssswisxcCk',
        '.kccxsiisssKsiisxcCk',
        '.kccxsssKKKsszzSxcCk',
        '.kcccxSsssssssSxccCk',
        '..kcccxxSSSSSSxxcCk.',
        '..kccccccccccccccCk.',
      ] },
      side: { x: 0, lash: [[19, 10]], rows: [
        '.....kkkkkk.........',
        '...kkcccccckk.......',
        '..kcccccccccck......',
        '.kccccccccccccCk....',
        'kccccccccccccxxCk...',
        'kcccccccccccxhhxCk..',
        'kccccccccccxhhHhxk..',
        'kccccccccccxhhhhssk.',
        'kcccccccccxhhhHHHsk.',
        'kcccccccccxssssssHk.',
        'kCccccccccxSsssssrrk',
        'kCccccccccxSssssswik',
        '.kCcccccccxSzzssssKk',
        '.kCcccccccxSsssssKKk',
        '..kCccccccxxSsssssk.',
        '..kCCcccccccxSSSSk..',
        '...kCCccccccccccCk..',
      ] },
      back: { x: 2, rows: [
        '.......kkkkkk.......',
        '.....kkcccccckk.....',
        '....kcccccccccck....',
        '...kccccccccccccCk..',
        '..kccccccCccccccCCk.',
        '..kccccccCccccccCCk.',
        '.kcccccccCcccccccCCk',
        '.kcccccccCcccccccCCk',
        '.kcccccccCcccccccCCk',
        '.kcccccccCcccccccCCk',
        '.kcccccccCcccccccCCk',
        '.kcccccccccccccccCCk',
        '.kcccccccccccccccCCk',
        '.kCccccccccccccccCCk',
        '..kCcccccccccccccCk.',
        '..kCCccccccccccCCCk.',
        '..kkCCCCCCCCCCCCCkk.',
      ] },
    },
    arm: k => k === 'R'
      ? { cols: ['jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', 'Jjj', '121', 'ggg', 'Ggg'], fist: 'sss' }
      : { cols: ['jjj', 'Ijj', 'Ijj', 'Ijj', 'WmM', 'Wmm', 'mmM', 'myM', 'mmM', 'mmM'], fist: 'WmM' },
    body(P, v, f) {
      const side = v === 'side', back = v === 'back' || v === 'bside', sx = v === 'fside' || v === 'bside' ? 1 : 0;
      if (side) {
        P.rect(6, 19, 15, 28, 'j'); P.col(6, 19, 28, 'I'); P.col(15, 19, 28, 'J'); P.rect(13, 20, 15, 25, 'm'); P.col(13, 20, 22, 'W'); P.row(25, 13, 15, 'M');
        P.row(28, 6, 15, 'b');
        [[29, 5], [30, 4], [31, 4], [32, 3], [33, 3], [34, 2], [35, 2], [36, 2]].forEach(([y, x0]) => { P.row(y, x0, 9, 'j'); P.px(x0, y, 'I'); });   // the coat tail swept back
        P.pts([[2, 37], [4, 37], [5, 38], [7, 37], [9, 37]], 'j'); P.pts([[3, 36], [6, 36]], '.'); P.rect(15, 29, 16, 33, 'j'); P.col(16, 29, 33, 'J'); P.px(16, 34, 'j');
        P.rect(10, 29, 15, 33, 'p'); P.col(15, 29, 33, 'P'); P.rect(12, 32, 15, 33, 'm');
        P.pts([[14, 29], [14, 30]], 'M'); P.rect(13, 31, 15, 33, 'y'); P.pts([[13, 31], [15, 31], [13, 33], [15, 33]], 'M'); P.px(14, 34, 'M'); P.px(14, 32, 'Y');
        P.rect(8, 34, 10, 40, 'F'); P.rect(12, 34, 15, 40, 'f'); P.col(15, 34, 38, 'F'); P.row(36, 12, 15, 'B'); P.row(38, 12, 15, 'B'); P.row(37, 8, 10, 'B');
        P.row(39, 7, 10, 'F'); P.row(40, 7, 10, 'F'); P.rect(12, 39, 16, 40, 'f'); P.row(41, 7, 10, 'V'); P.row(41, 12, 16, 'V');
        P.head(this.heads.side.rows, this.heads.side.x);
        P.rect(4, 16, 15, 19, 'c'); P.row(19, 4, 15, 'C'); P.pts([[4, 20], [6, 20], [9, 20], [11, 20]], 'C');
        P.pts([[8, 16], [9, 17], [10, 17], [11, 18], [12, 18], [9, 19], [10, 19]], 'n'); P.pts([[10, 18], [11, 19]], 'N');
        if (f) { for (let y = 12; y <= 23; y++) { P.px(1, y, y % 2 ? 'h' : 'H'); P.px(2, y, y % 2 ? 'H' : 'h'); } P.pts([[1, 24], [2, 24]], 'n'); }
        return;
      }
      // the coat and the steel plate, belt, pouch and lantern
      P.rect(5, 20, 18, 28, 'j'); P.col(6, 20, 28, 'I'); P.col(17, 20, 28, 'J');
      for (let y = 21; y <= 28; y++) { P.px(5, y, 'k'); P.px(18, y, 'k'); }
      if (back) {
        P.col(11, 20, 28, 'J'); P.row(28, 6, 17, 'b');
        P.rect(4, 29, 19, 36, 'j'); P.col(4, 29, 36, 'I'); P.col(19, 29, 36, 'J'); P.col(11, 29, 36, 'J');
        P.pts([[4, 36], [7, 36], [9, 36], [13, 36], [16, 36], [19, 36]], '.'); P.pts([[5, 37], [8, 37], [12, 37], [15, 37], [18, 37]], 'j');
      } else {
        P.row(19, 9, 14, 'm'); P.rect(8, 20, 15, 24, 'm'); P.row(25, 9, 14, 'M'); P.col(15, 20, 24, 'M'); P.col(9, 20, 22, 'W'); P.row(22, 9, 14, 'M');
        P.pts([[8, 26], [9, 26], [14, 26], [15, 26]], 'j'); P.rect(10, 26, 13, 27, 't');
        P.pts([[9, 24], [10, 23], [11, 22], [12, 21], [13, 20]], 'b');
        P.row(28, 6, 17, 'b'); P.pts([[11, 28], [12, 28]], 'm'); P.rect(13, 28, 15, 30, 'b'); P.row(28, 13, 15, 'B');
        P.rect(4, 29, 8, 37, 'j'); P.rect(15, 29, 19, 37, 'j'); P.col(4, 29, 37, 'I'); P.col(19, 29, 37, 'J');
        P.pts([[4, 36], [6, 37], [8, 37], [15, 37], [17, 36], [19, 37]], '.'); P.pts([[5, 38], [18, 38]], 'j');
        P.rect(9, 29, 14, 33, 'p'); P.col(14, 29, 33, 'P'); P.rect(9, 32, 10, 33, 'm'); P.rect(13, 32, 14, 33, 'm');
        P.px(16, 31, 'M'); P.row(32, 15, 17, 'M'); P.rect(15, 33, 17, 34, 'y'); P.px(16, 33, 'Y'); P.pts([[15, 33], [17, 33], [15, 34], [17, 34]], 'M'); P.row(35, 15, 17, 'M');
      }
      // tall strapped boots
      P.rect(7, 34, 10, 40, 'f'); P.rect(13, 34, 16, 40, 'f'); P.col(10, 34, 40, 'F'); P.col(16, 34, 40, 'F');
      P.row(35, 7, 10, 'B'); P.row(35, 13, 16, 'B'); P.row(38, 7, 10, 'B'); P.row(38, 13, 16, 'B');
      const fs = v === 'fside' ? 1 : 0;
      P.rect(6, 39, 10, 40, 'f'); P.rect(13, 39, 17 + fs, 40, 'f'); P.row(41, 6, 10, 'V'); P.row(41, 13, 17 + fs, 'V');
      const H = back ? this.heads.back : this.heads.front;
      if (v === 'front' || v === 'back') P.head(H.rows, H.x);
      else if (v === 'fside') P.head(turnHead(H.rows), H.x + 1);
      else P.head(peekHead(H.rows, [10, 11, 12]), H.x + 1);
      // the hood's cape over the shoulders, ragged at the edge, and the coil of rope
      P.rect(4, 17, 19, 19, 'c'); P.row(16, 6, 17, 'c'); P.row(19, 4, 19, 'C'); P.pts([[4, 20], [7, 20], [12, 20], [16, 20], [19, 20]], 'C');
      if (!back) P.rect(9 + sx, 16, 14 + sx, 17, 'x');
      const rx = back ? 5 : 15;
      P.pts([[rx, 16], [rx + 1, 16], [rx + 2, 16], [rx - 1, 17], [rx + 3, 17], [rx - 1, 18], [rx + 3, 18], [rx, 19], [rx + 1, 19], [rx + 2, 19]], 'n'); P.pts([[rx + 2, 17], [rx, 18], [rx + 3, 19]], 'N');
      if (f) {   // her: a braid
        if (back) { for (let y = 17; y <= 27; y++) P.pts([[11 + sx, y], [12 + sx, y]], y % 2 ? 'h' : 'H'); P.pts([[11 + sx, 28], [12 + sx, 28]], 'n'); }
        else { for (let y = 15; y <= 26; y++) { P.px(6 + sx, y, y % 2 ? 'h' : 'H'); P.px(7 + sx, y, y % 2 ? 'H' : 'h'); } P.pts([[6 + sx, 27], [7 + sx, 27]], 'n'); }
      }
    },
  },

  // T4: a shiba hoodie: a ginger hood with pointed ears up over ginger hair, a cream body with ginger
  // raglan sleeves, drawstrings, a zip and a curl pendant, a kangaroo pocket; a black bum bag with
  // bone charms, black track pants with a red stripe, cream sneakers (her: ginger pigtails)
  shiba: {
    name: 'Shiba Trainer',
    pal: { c: '#d88a3a', C: '#a8622a', e: '#eaa258', w: '#f4e6c8', W: '#d8c49e', h: '#c8642a', H: '#e08a44',
      t: '#2a2830', u: '#a8a8b0', o: '#e8d8a8', p: '#26242c', P: '#18161e', Q: '#3a3842', a: '#d8343a', A: '#a01e2a',
      b: '#2e2c38', B: '#1e1c26', f: '#f2ead8', F: '#c8a070', V: '#8a7a62' },
    heads: {
      front: { x: 2, lash: [[4, 10], [15, 10]], rows: [
        '..kk............kk..',
        '..kck..........kck..',
        '..kcwk..kkkk..kwck..',
        '..kcwwkkcccckkwwck..',
        '..kccwcccccccccwck..',
        '.kcccccccccccccccCk.',
        '.kcccchhhhhhhhccccCk',
        'kcchhhhHhhhHhhhhccCk',
        'kcchhCshhhhhshChhcCk',
        'kcchssCssssssCsshcCk',
        'kcchsrrssssssrrShcCk',
        'kcchswisssssswiShcCk',
        'kcchsiissssKsiiShcCk',
        'kcchssssKKKssssShcCk',
        '.kcchSssssssssShccCk',
        '.kccchSSSSSSSShccCk.',
        '..kccccSSSSSScccCk..',
      ] },
      side: { x: 1, lash: [[17, 10]], rows: [
        '.......kk...kk......',
        '.......kck.kck......',
        '......kcck.kcwk.....',
        '....kkcccckkcwwkk...',
        '...kccccccccccccck..',
        '..kcccccccccccccCk..',
        '.kcccccccccchhhhcCk.',
        '.kccccccccchhhHhhck.',
        'kccccccccchhhhhhssk.',
        'kcccccccchSsssssCsk.',
        'kccccccccSSsssssrrk.',
        'kCcccccccSSssssswik.',
        'kCccccccchsssssssKk.',
        '.kCcccccchSssssKKk..',
        '.kCccccccchSssssk...',
        '..kCCcccccchSSSk....',
        '...kCCcccccSSSSk....',
      ] },
      back: { x: 2, rows: [
        '..kk............kk..',
        '..kck..........kck..',
        '..kcck..kkkk..kcck..',
        '..kccckkcccckkccck..',
        '..kcccccccccccccck..',
        '.kcccccccccccccccCk.',
        '.kcccccccccccccccCk.',
        'kccccccccccccccccCCk',
        'kccccccccccccccccCCk',
        'kccccccccccccccccCCk',
        'kccccccccccccccccCCk',
        'kccccccccccccccccCCk',
        'kCcccccccccccccccCCk',
        'kCcccccccccccccccCCk',
        '.kCccccccccccccCCCk.',
        '.kCCccccccccccCCCk..',
        '..kkCCCCCCCCCCCCkk..',
      ] },
    },
    arm: k => k === 'R'
      ? { cols: ['ccc', 'Ccc', 'Ccc', 'Ccc', 'Ccc', 'Ccc', 'CCC', '121', 'sss', 'Sss'], fist: 'sss' }
      : { cols: ['ccc', 'ecc', 'ecc', 'ecc', 'ecc', 'ecc', 'CCC', 'sss', 'sss', 'sSs'], fist: 'sss' },
    body(P, v, f) {
      const side = v === 'side', back = v === 'back' || v === 'bside', sx = v === 'fside' || v === 'bside' ? 1 : 0;
      if (side) {
        P.rect(7, 19, 15, 26, 'w'); P.col(15, 19, 26, 'W'); P.rect(7, 19, 10, 21, 'c'); P.col(7, 19, 26, 'c');
        P.row(27, 7, 15, 'c'); P.row(28, 7, 15, 'C'); P.pts([[14, 19], [14, 20], [14, 21]], 'w'); P.px(14, 22, 'W'); P.rect(12, 23, 14, 25, 'W'); P.row(23, 12, 14, 'c');
        P.rect(5, 18, 8, 20, 'c'); P.row(20, 5, 8, 'C');
        P.rect(7, 29, 16, 31, 'p'); P.rect(12, 28, 16, 30, 'b'); P.row(29, 13, 15, 'u'); P.pts([[15, 31], [15, 32]], 'o');
        P.rect(7, 32, 10, 37, 'P'); P.rect(12, 32, 16, 37, 'p'); P.col(16, 32, 37, 'P'); P.col(8, 29, 37, 'a'); P.col(13, 31, 37, 'a');
        P.rect(6, 38, 10, 40, 'F'); P.rect(12, 38, 17, 40, 'f'); P.row(39, 12, 17, 'F'); P.pts([[14, 38], [15, 38]], 'w'); P.row(41, 6, 10, 'V'); P.row(41, 12, 17, 'V');
        P.head(this.heads.side.rows, this.heads.side.x);
        if (f) { P.pts([[2, 9], [1, 10], [2, 10], [0, 11], [1, 11], [0, 12], [1, 12], [0, 13], [1, 14]], 'h'); P.pts([[1, 11], [0, 13]], 'H'); P.px(2, 11, 'a'); }
        return;
      }
      // the hoodie: cream body, ginger raglan shoulders, the hood bunched behind the neck
      P.row(19, 5, 18, 'c'); P.rect(6, 20, 17, 26, 'w'); P.col(17, 20, 26, 'W');
      P.pts([[6, 20], [7, 20], [6, 21], [16, 20], [17, 20], [17, 21]], 'c');
      for (let y = 21; y <= 28; y++) { P.px(5, y, 'k'); P.px(18, y, 'k'); }
      P.row(27, 6, 17, 'c'); P.row(28, 6, 17, 'C');
      if (back) {
        P.pts([[10, 21], [11, 21], [12, 21], [9, 22], [13, 22], [9, 23], [11, 23], [13, 23], [9, 24], [11, 24], [12, 24], [10, 25], [9, 26]], 'c'); P.pts([[13, 23], [12, 24], [9, 26]], 'C');   // the curly tail
        P.row(29, 6, 17, 'b');
      } else {
        P.pts([[11, 19], [12, 19]], 't'); P.col(11, 20, 26, 'W'); P.pts([[9, 20], [9, 21], [14, 20], [14, 21]], 'W'); P.pts([[9, 22], [14, 22]], 'u');
        P.pts([[12, 22], [12, 23]], 'o');
        P.row(24, 8, 15, 'W'); P.pts([[7, 24], [7, 25], [16, 24], [16, 25]], 'c');
        P.row(29, 6, 17, 'b'); P.rect(13, 28, 17, 31, 'b'); P.row(29, 13, 17, 'u'); P.col(17, 28, 31, 'B'); P.pts([[12, 31], [12, 32], [11, 32], [13, 32]], 'w');
      }
      // track pants with a red stripe, cream sneakers
      P.rect(6, 30, 17, 31, 'p'); P.rect(6, 32, 10, 37, 'p'); P.rect(13, 32, 17, 37, 'p'); P.col(10, 32, 37, 'P'); P.col(17, 30, 37, 'P');
      P.col(6, 29, 37, 'a'); P.col(17, 29, 37, 'a'); P.row(37, 7, 10, 'P'); P.row(37, 13, 16, 'P');
      const fs = v === 'fside' ? 1 : 0;
      P.rect(5, 38, 10, 40, 'f'); P.rect(13, 38, 18 + fs, 40, 'f'); P.row(41, 5, 10, 'V'); P.row(41, 13, 18 + fs, 'V');
      if (!back) { P.pts([[7, 38], [8, 38], [15, 38], [16, 38]], 'w'); P.row(40, 5, 6, 'F'); P.row(40, 17 + fs, 18 + fs, 'F'); P.pts([[9, 39], [14, 39]], 'F'); }
      else { P.row(39, 5, 10, 'F'); P.row(39, 13, 18, 'F'); }
      const H = back ? this.heads.back : this.heads.front;
      if (v === 'front' || v === 'back') P.head(H.rows, H.x);
      else if (v === 'fside') P.head(turnHead(H.rows), H.x + 1);
      else P.head(peekHead(H.rows, [10, 11, 12]), H.x + 1);
      P.row(17, 5, 18, 'c'); P.row(18, 5, 18, 'C'); if (!back) { P.rect(10 + sx, 17, 13 + sx, 18, 't'); P.pts([[9 + sx, 18], [14 + sx, 18]], 'W'); }
      if (f) {   // her: ginger pigtails out of the hood
        const L = [[1, 9], [0, 10], [1, 10], [-1, 11], [0, 11], [-1, 12], [0, 12], [0, 13], [-1, 14]];
        P.pts(L.map(([x, y]) => [x + sx + 1, y]), 'h'); P.pts([[0, 11], [-1, 13]].map(([x, y]) => [x + sx + 1, y]), 'H'); P.px(2 + sx, 10, 'a');
        if (!sx) { P.pts(L.map(([x, y]) => [23 - x - 1, y]), 'h'); P.pts([[23, 11], [24, 13]].map(([x, y]) => [x - 1, y]), 'H'); P.px(21, 10, 'a'); }
      }
    },
  },
};

// ---------------------------------------------------------------- building
const trainerLook = (id, look) => (TRAINER_LOOKS[id] ? id : 'scarf') + '-' + (look === 'f' ? 'f' : 'm');
const trSplit = look => { const [id, sex] = String(look).split('-'); return { T: TRAINER_LOOKS[id] || TRAINER_LOOKS.scarf, f: sex === 'f' }; };
function trainerPal(look) { return { ...TRAINER_SKIN, ...trSplit(look).T.pal }; }
function trainerArmCols(look, k) { return trSplit(look).T.arm(k); }
// A look in a view as rows of keys (cached). noArm: 'L', 'R' or 'LR' leaves those arms off (for posing).
const _trmaps = {};
function trainerMap(look, view, noArm = '') {
  const key = look + view + noArm;
  if (_trmaps[key]) return _trmaps[key];
  const { T, f } = trSplit(look), v = TRAINER_VIEWS.includes(view) ? view : 'front', P = trPainter();
  T.body(P, v, f);
  const arms = TRAINER_ARMS[v];
  for (const k of ['L', 'R']) if (arms[k] && !noArm.includes(k)) trArm(P, arms[k], T.arm(k));
  if (f) {   // her: lashes at the outer corner of each eye
    const H = T.heads[v === 'fside' ? 'front' : v];
    if (H && H.lash) for (const [x, y] of H.lash) P.px(x + H.x + (v === 'fside' ? 2 : 0), y, 'r');
  }
  trInk(P.g);
  return (_trmaps[key] = P.g.map(r => r.join('')));
}
// every look, for the gallery and review pages: { 'scarf-m': { name }, ... }
const TRAINER_OUTFITS = {};
for (const id of Object.keys(TRAINER_LOOKS)) for (const s of ['m', 'f']) TRAINER_OUTFITS[id + '-' + s] = { name: TRAINER_LOOKS[id].name + (s === 'f' ? ' (her)' : ' (him)') };
const TRAINER_OUTFIT = 'scarf-m';

// The walk: 4 frames (both feet down, the left leg lifted, both down, the right leg lifted); a
// lifted leg is its half of the boot rows (split at TR_SPLIT) moved up a pixel.
function trainerStep(map, leg) {
  return map.map((row, y) => {
    if (y < TR_FEET) return row;
    const up = (map[y + 1] || '').padEnd(row.length, '.');
    return leg === 0 ? up.slice(0, TR_SPLIT) + row.slice(TR_SPLIT) : row.slice(0, TR_SPLIT) + up.slice(TR_SPLIT);
  });
}
// pictures are made once per look and view (pixel.js gridFromMap)
const _trainer = {};
function trainerCanvas(look = TRAINER_OUTFIT, view = 'front') {
  const key = 'c' + look + view;
  return _trainer[key] || (_trainer[key] = gridFromMap(trainerMap(look, view), trainerPal(look)).toCanvas());
}
function trainerWalk(look = TRAINER_OUTFIT, view = 'front') {
  const key = 'w' + look + view;
  if (_trainer[key]) return _trainer[key];
  const map = trainerMap(look, view), pal = trainerPal(look), still = trainerCanvas(look, view);
  return (_trainer[key] = [still, gridFromMap(trainerStep(map, 0), pal).toCanvas(), still, gridFromMap(trainerStep(map, 1), pal).toCanvas()]);
}
