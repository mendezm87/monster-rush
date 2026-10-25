// The smugshi family: smugshi, and the two forms he grows into: smugshogun (armoured) or daimochi (on Grandma's Cooking). Drawn with the helpers in js/sprites.js (PixGrid shapes, rigParts, rigEye...).
// Each monster: MONSTER_ART (front, side, back), MONSTER_ART_DIAG (fside, bside) and its body type in RIGGED.
// Hand touches (r112): the lines inside Toshi are a dark shade of the fur round them (black stays
// for his silhouette, eyes, nose and mouth), and his ears, nose, mouth and cheeks are placed pixel by pixel.
const toshiLines = g => softLines(g, cs => cs.some(c => c === TOSHI.coat.b || c === TOSHI.coat.s || c === TOSHI.coat.l || c === '#e8b4a4') ? TOSHI.line : TOSHI.wline);
// Samurai armour (r116), shared by Smugshi's two grown-up forms: red lacquer laced with navy cord and studded with gold.
const SAMURAI = { RED: P('#c42a36', '#861824', '#ee6064'), NAVY: P('#2c3c70', '#1b264c', '#4a60a0'), GOLD: '#ecc452', CORD: '#1b264c',
  HILT: P('#3f8a7a', '#22564c', '#6ab8a4'), BELT: P('#e6d8b4', '#bca880', '#f6ecd0'), SANDAL: '#8a5a3a' };
const samuraiPlates = (p, bands) => { for (const pts of bands) p.poly(pts, SAMURAI.RED, { edge: true }); };   // rows of plates, each overlapping the one above
const samuraiStuds = (p, x0, x1, y, step = 4) => { for (let x = x0; x <= x1; x += step) p.px(x, y, SAMURAI.GOLD); };
const samuraiLace = (p, x0, x1, y, step = 2) => { for (let x = x0; x <= x1; x += step) p.px(x, y, SAMURAI.CORD); };
// Smugshogun redrawn from a pixel-art guide (r242, the owner: "looks very low quality, especially from the side and
// back"). Each view is a colour map traced from the owner's Gemini guide (docs/refs/smugshogun-guide.jpg, with
// tools/trace-guide.py: shrunk to 43 rows, armour tidied into lacquered bands), drawn pixel by pixel with each pixel on
// its rig part (ears, head, tail, body, legs), so he still walks, blinks, chews and strikes like everyone else.
const SHOGUN_PAL = { k: '#1c1428', o: '#d08548', s: '#a85e2c', l: '#e8a868', w: '#f7f1e6', v: '#e2d4bf', c: '#f0d6a0', p: '#e8b4a4',
  r: '#c42a36', q: '#861824', e: '#ee6064', g: '#ecc452', n: '#1b264c', u: '#b8a68c' };
const SHOGUN_MAPS = {
  front: [
    '....kk.........kkk....',
    '....kosk......kopk....',
    '....klok......kolk....',
    '...kolpok....koplok...',
    '...kollokkkkkkollok...',
    '...kolloooooooollok...',
    '...koloooooooooolok...',
    '...koooowoooowoooo....',
    '....koooowoowooook....',
    '...koookkkookkkoook...',
    '...kowokkooookowwok...',
    '...kwwwwooooowwwwwk...',
    '...kwwwwwkkkwwwwwwk...',
    '...kwwwwwwkkwwwwwwk...',
    '....vwwwvkukkvwwwv....',
    '....kvwwwwwwwwwwvk....',
    '....kowwwwwwvwwvok....',
    '..kkkovwwvvvwwwvokk...',
    '..kskkwwwwwwwwwwkksk..',
    '..krekkwwwwwwwwkgerk..',
    '..krrkkkwwwwwwkkgrrk..',
    '..kqkkkkkkwwkkkkgqnk..',
    '.kerkkkeegkkeekkkrrek.',
    '.krrgkorrrrrrrkokgrrk.',
    'kqnqkkwqnqnqnqkwkknqk.',
    'krrgkowrrrrrrrkwokgrkk',
    'krrgkowkrrrrrrkwokgrrk',
    'kqnkkowwkkkkkkwwoksqnk',
    'kkgkoowwwwwwwwwwookgkk',
    '..kkoowwwwwwwwwwookk..',
    '...koowwkkkkkkwwook...',
    '...koowwk....kwwoo....',
    '....koow.....kwook....',
    '....koow.....kwook....',
    '....kook......woo.....',
    '....kook......koo.....',
    '....kook......koo.....',
    '....kowk......kwo.....',
    '....kwwk......kww.....',
    '....kwwk......kwwk....',
    '....kwwk......kwwk....',
    '...kwwwk......kwww....',
    '......................'],
  fside: [
    '................kk.......kkk..',
    '...............kopk......ksk..',
    '...............kplok....kolk..',
    '...............kplok...koplk..',
    '..............kpllpkkkkkoplk..',
    '..............kollpooooooplk..',
    '..............kolpoooooooopk..',
    '..............kopoooowwooowk..',
    '..............kooooooowoowoo..',
    '..............koooookkkoookok.',
    '....kkkkk....koooowwokooookwkk',
    '..kcccccck...kooowwwwooooookkk',
    '.kccoocccck..koowwwwwwwwwwkkkk',
    'kvcooooccck..koowwwwwwkwwwkkkk',
    'kcookkoocck...koowwwwwwkkkkwks',
    'kcokoooocck..kooowwwwwwwwwwk..',
    'kcokoooccckkkkkoooowwwwuuuk...',
    'kcookoccukkkkkkkooowwwwwvv....',
    '.kcookkkkekkkeegkkswwwwwwwk...',
    '..kkokkkkkkkkgrrrggkwwwwwwkk..',
    '...kkqnqkknkkqnqnqgkwwwwwkkk..',
    '..kokrrrkkrkkrrrrrkkkkwwkkkk..',
    '..kokrrrkkrrrrrrorkkrrkkkkkk..',
    '..ookqnqkkkqnqnqngkknqnqnqkk..',
    '..ookrkkkkkgrrrrrgkkrrrrrrkk..',
    '..oookoorkkrrrrrrkukrrrrrrkk..',
    '..ooooookkkqnqnqgkwknqnqnkkk..',
    '..oooooovkkrrrrrkowkkrrrrkkk..',
    '..ooooowkkkgrrrrkowwwkkkookk..',
    '..oooowkkuukkkngkwwwwwwvok.k..',
    '..oooow.kuuukkkkowkvkkuook....',
    '.kooowk.kuuuksooowk.kvwok.....',
    'kkoowk..kuuk.koook...kwok.....',
    'koovk...kuk..koook...kwok.....',
    'kook....kuk...oook...kwok.....',
    'kowk....kuk...kook...kwok.....',
    'kwwk....kuvk..kook...kwok.....',
    'kwwk.....vuuk.kook...kwwk.....',
    'kwwwk.....kkk.kowk....wwk.....',
    '.kkkk.........kwwk....wwwk....',
    '..............kwwwk...kwvk....',
    '...............wwwk...........',
    '...............kkkk...........'],
  side: [
    '...........................kk...........',
    '..........................kokkkk........',
    '..........................kpkkok........',
    '.........................koloklk........',
    '.........................opllklk........',
    '........................koplokkk........',
    '........................koppoooook......',
    '.......................kooooooooook.....',
    '.......................kooooooooowk.....',
    '.....kkk..............koooooooookoo.....',
    '...kvccckk............koooooowwokkokk...',
    '..vccccccck...........koooowwwwwoooookk.',
    '.kcvcccccvc..........kooooowwwwwwwwwwwkk',
    'kcccooooccck.........kooooowwwwwwwwwwwkk',
    'kccookooccvk.........kooooowwwwwwwwwwk..',
    'kcooskocccck.......kkekooooowwwwwwwwk...',
    'kcookkccccck....kkkrkkrkooooowwwuk......',
    'kccokccccckkkkkkkqnqkonkkkooowwwk.......',
    '.ccookkkkkkkeeeeerrrkkgegkkkkwww........',
    '.kkcookrrrrrrrrrrrrrrrrrrrrggkww........',
    '...koonqnqnqnqnqnqnqnqnqnqnqgkww........',
    '...kokrrrrrrrrrrrrrrrrrrrrrrkkkk........',
    '...kokrrrrrrrrrrrrrkkrrrrrrrkkrk........',
    '..kooonqnqnqnqnqkkkkkqnqnqngnqnq........',
    '..kooorrrrrkkkkkkkokgrrrrrrgrrrk........',
    '..koookrkkkokkookkokgrrrrrrkkrrk........',
    '..koooooooookkoookkknqnqnqnkkqnk........',
    '..koooooooowwkkookkkrrrrrrgkkkk.........',
    '..koooooookkkkkwwkrrggggrrkkvk..........',
    '...kooooockuu.kkkkkukkkkkkkkk...........',
    '...koooovkuuk.....kkkkooookuk...........',
    '...koooockuvk........koooouk............',
    '..koooovkuuk..........oooouk............',
    '.kooookkvk............kookuk............',
    '.koookkuu.............kookuk............',
    '.kook.kuk.............kooku.............',
    '.kowk.kuk.............kooku.............',
    '.kowk.kuk.............kooku.............',
    '.kwwk.kvuk............kwwkvv............',
    '.kwwk.kkkkk...........kwwkuuk...........',
    '.kwwwk.................kwwkkk...........',
    '..kkkk.................kwww.............',
    '........................................'],
  back: [
    '....kk.........kk....',
    '...kook.......koo....',
    '...kook......kooo....',
    '...koook.....koook...',
    '...kooookkkkkooook...',
    '...koooooooooooook...',
    '...koooooooooooook...',
    '...koooooooooooook...',
    '...kooooooooooooo....',
    '...koooooooooooook...',
    '..kooooooooooooooo...',
    '..koooooooooooooook..',
    '..kooooookcckkooook..',
    '...ooookcccccckook...',
    '...koooucccccccook...',
    '...kkokccccooockk....',
    '....kkkcccoosookk....',
    '..kkkekvccokoookkkk..',
    '..kokkkcccokookkgsk..',
    '..kqkknccccokkkkgqk..',
    '.kkrkkrkcccokkeegrk..',
    '.krrkkkkccccookkkrrk.',
    '.knqnkkoocccoookkgnk.',
    '.errrkooowvwoookkkrk.',
    'krgkkkoowwkwwoookkgkk',
    'kqkkkoowwwwwwwookkkkk',
    'krkkkoowwwwwwwwookkek',
    'krkkoowwwwuwwwwoookrk',
    'kkkkoowwwwuwwwwoookkk',
    '...koowwwwkuwwwvook..',
    '...koowwwk.kwwwvoo...',
    '...koowwwk..kwwook...',
    '...koowwk...kwwook...',
    '....koow.....kwoo....',
    '....koov.....kooo....',
    '....kook.....kook....',
    '....kowk.....kwwk....',
    '....kowk.....kwwk....',
    '....kowk.....kwwk....',
    '....kwwk.....kwwk....',
    '....kwwk.....kwwk....',
    '...kwwwk.....kwwwk...',
    '.....................']
};
// which part each pixel rides, per view: ears above `ear` (split at earX), the head above `neck` (and right of headX),
// a tail box, legs below `leg` (split into the two diagonal pairs by legA), the body for the rest; eyes and mouth for
// blinks and bites. (bside is the back view with the head turned a pixel right.)
const SHOGUN_PARTS = {
  front: { ear: 4, earX: 11, neck: 17, leg: 32, legA: x => x < 11, eyes: [[7, 9, 3], [11, 9, 3]], mouth: [10, 14] },
  fside: { ear: 5, earX: 21, neck: 18, headX: 13, tail: [0, 10, 12, 18], leg: 30, legA: x => x < 8 || (x >= 13 && x < 19), eyes: [[19, 9, 3]], mouth: [24, 15] },
  side: { ear: 6, earX: 99, neck: 18, headX: 21, tail: [0, 9, 13, 18], leg: 29, legA: x => x < 6 || x >= 22, eyes: [[32, 10, 2]], mouth: [35, 16] },
  back: { ear: 4, earX: 10, neck: 13, tail: [6, 12, 14, 22], leg: 33, legA: x => x < 10, eyes: [], mouth: null },
};
function shogunDraw(g, v) {
  const key = v === 'bside' ? 'back' : v, map = SHOGUN_MAPS[key], S = SHOGUN_PARTS[key], { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
  const W = map[0].length, ox = Math.floor((44 - W) / 2), oy = 1, turn = v === 'bside' ? 1 : 0;
  const tb = S.tail;
  map.forEach((row, y) => { for (let x = 0; x < W; x++) {
    const k = row[x]; if (k === '.') continue;
    if (k === 'k' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ((map[y + dy] || '')[x + dx] || '.') === '.')) continue;   // the traced outer edge: the sprite builder draws its own outline there
    const inTail = tb && x >= tb[0] && x <= tb[2] && y >= tb[1] && y <= tb[3] && 'cosvlk'.includes(k);
    const onEar = y < S.ear && !(S.headX && x < S.headX), onHead = onEar || (y < S.neck && !(S.headX && x < S.headX) && !inTail);
    const p = onEar ? (x < S.earX ? earA : earB) : onHead ? h : inTail ? t : y >= S.leg ? (S.legA(x) ? legA : legB) : b;
    p.px(ox + x + (onHead ? turn : 0), oy + y, SHOGUN_PAL[k]);   // turn by zone: at rest every part is the same grid
  } });
  for (const [ex, ey, w] of S.eyes) rigEye(h, Q, ox + ex, oy + ey, () => {}, w);   // closed, hurt and fainting eyes over his smug ones
  if (S.mouth && Q.mouth) rigMouth(h, Q, ox + S.mouth[0], oy + S.mouth[1], 2);
}
Object.assign(MONSTER_ART, {
  // Toshi, the owner's real-life Shiba Inu (drawn from photos): a soft ginger coat; a big
  // white bib, belly and legs; white cheeks up to his eyes; pale eyebrow spots; upright
  // ears with pale insides; a big black nose; a ring of white ruff round the neck; and his smug half-shut stare.
  // The curled tail is ginger on top with lots of white fluff.
  smugshi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, Ei = TOSHI.ear, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig(), side = v === 'side';
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]);
    const hx = side ? R.head[0] : 0, h = part(g, hx, R.head[1]);
    const ear = i => part(g, hx - (side && R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]);   // ears drop (and fold back) when pinned
    const earA = ear(0), earB = ear(1);
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
      earB.poly([[14, 8], [13, 1], [17, 5]], P(O.s, TOSHI.line, O.b));                           // far ear, in shadow
      h.ellipse(19, 12, 6.5, 5.5, O, { edge: true });                                            // head
      b.px(13, 15, C.b); b.px(13, 16, C.b); b.px(14, 17, C.b);                                   // the ruff showing behind the head
      earA.poly([[17, 7], [19, 0], [22, 6]], O, { edge: true });                                 // near ear
      earA.poly([[18.5, 6], [19.3, 2.5], [21, 5.5]], PINK);
      h.poly([[21, 12], [28, 13.5], [27.5, 16.5], [20, 17.5]], C, { edge: true });               // white muzzle
      h.ellipse(19.5, 15.5, 3, 2, C);                                                            // white cheek
      h.px(21, 9, C.b); h.px(22, 9, C.b);                                                        // eyebrow spot
      toshiLines(g);
      rigEye(h, R, 21, 11, () => { h.rect(21, 11, 3, 1, OUTLINE); h.px(22, 12, DARK_EYE); h.px(23, 12, DARK_EYE); }, 3);   // smug half-shut eye
      h.rect(27, 13, 2, 2, OUTLINE); h.px(27, 13, '#5a5060');                                    // nose
      if (R.mouth === 'roar') { h.rect(22, 15, 5, 3, OUTLINE); h.px(23, 17, TONGUE).px(24, 17, TONGUE); }
      else if (R.mouth === 'open') { h.rect(23, 16, 4, 2, OUTLINE); h.px(24, 17, TONGUE); h.px(25, 17, TONGUE); }
      else h.px(24, 17, OUTLINE).px(25, 17, OUTLINE).px(26, 16, OUTLINE);                       // flat little mouth
      return;
    }
    if (v === 'back') {
      legA.ellipse(12, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(20, 27.5, 2.2, 3, C, { edge: true });   // white hind legs
      b.ellipse(16, 22, 7.5, 6, O, { edge: true });
      b.ellipse(16, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears
      b.ellipse(16, 18.2, 7, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(16, 12, 8, 6.2, O, { edge: true });
      h.ellipseM(9, 15, 1.6, 1.6, C);                                                            // cheek fluff peeking out
      t.ellipse(16, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(16, 18.5, 3, 2.6, C); t.px(16, 18, O.s); t.px(17, 18, O.s);
      toshiLines(g);
      return;
    }
    t.ellipse(25.5, 17.5, 4.5, 4.5, O, { edge: true });                                          // curled tail behind him
    t.ellipse(26, 17, 3.2, 3.2, C); t.px(25, 17, O.l); t.px(26, 17, O.s);                        // lots of cream fluff in the curl
    legA.ellipse(12, 27, 2.4, 3.4, C, { edge: true }); legB.ellipse(20, 27, 2.4, 3.4, C, { edge: true });   // white front legs
    legA.px(11, 30, C.s).px(13, 30, C.s); legB.px(20, 30, C.s).px(18, 30, C.s);                  // toes
    b.ellipse(16, 22, 7.5, 6, O, { edge: true });                                                // body
    b.ellipse(16, 23, 5.2, 6, C);                                                                // white chest
    earA.poly([[7, 10], [6.5, 0], [13.5, 5.5]], O, { edge: true }); earB.poly([[25, 10], [25.5, 0], [18.5, 5.5]], O, { edge: true });   // big upright ears, set wide
    earA.poly([[8.3, 8], [7.8, 2.5], [11.8, 5.8]], PINK); earB.poly([[23.7, 8], [24.2, 2.5], [20.2, 5.8]], PINK);   // pink insides
    earA.px(9, 6, C.b).px(10, 6, C.b).px(8, 7, C.b); earB.px(22, 6, C.b).px(21, 6, C.b).px(23, 7, C.b);   // white tufts at the base
    h.ellipse(16, 12, 8.5, 6.5, O, { edge: true });                                              // head
    h.ellipseM(10.5, 14.6, 2.8, 2.6, C);                                                         // white cheeks, up under the eyes
    h.ellipse(16, 15.6, 4.6, 3, C);                                                              // white muzzle
    h.rect(13, 17, 6, 3, C.b); h.rect(12, 18, 8, 2, C.b);                                        // white throat running into the chest (no chin line)
    h.rectM(11, 9, 2, 1, C.b);                                                                   // pale eyebrow spots
    h.px(7, 14, C.b); h.rect(24, 14, 1, 3, OUTLINE);                                             // a tuft of cheek fluff; his cheek against the tail
    toshiLines(g);
    for (const x of [10, 18]) rigEye(h, R, x + (R.eyes ? 1 : 0), 11, () => { h.rect(x, 11, 4, 1, OUTLINE); h.rect(x + 1, 12, 2, 1, DARK_EYE); });   // smug half-shut lids
    h.rect(14, 13, 4, 1, OUTLINE); h.rect(15, 14, 2, 1, OUTLINE); h.px(15, 13, '#5a5060');       // big black nose
    if (R.mouth === 'roar') { h.rect(13, 16, 6, 3, OUTLINE); h.px(15, 18, TONGUE).px(16, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(14, 16, 4, 2, OUTLINE); h.px(15, 17, TONGUE).px(16, 17, TONGUE); }
    else { h.rect(14, 16, 4, 1, OUTLINE); h.px(18, 15, OUTLINE); h.rect(14, 17, 4, 1, C.s); }    // flat, unimpressed mouth with a smug corner, and a chin
  },
  // ---- Smugshi's two grown-up forms (44px; r116, the owner's picks from two reference pictures) ----
  // Smugshogun: Toshi all grown up, slim on four legs, in red lacquered samurai armour: rows of plates
  // over his back laced with navy cord and studded with gold, gold-rimmed shoulder guards, a breastplate.
  smugshogun(g, v = 'front') { shogunDraw(g, v); },
  // Daimochi (daimyo + mochi): what Smugshi grows into on Grandma's Cooking. A chubby samurai standing
  // up: a round belly in a red breastplate, navy shoulder guards and wide trousers, red shin guards,
  // a red headband, a rope belt and a katana at his hip, puffy cheeks and a smug little "w" smile.
  daimochi(g, v = 'front') {
    const O = TOSHI.coat, C = TOSHI.white, { RED, NAVY, GOLD, CORD, HILT, BELT, SANDAL } = SAMURAI, Nd = P(NAVY.s, '#121a36', NAVY.b), PINK = '#e8b4a4';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v), side = v === 'side';
    if (side) {
      t.ellipse(7.5, 26, 5, 5.5, O, { edge: true });                                             // big fluffy tail
      t.ellipse(7, 25.5, 3, 3.3, C); t.px(7, 25, O.s);
      t.poly([[24, 31], [25.5, 33], [5, 39.5], [4, 37.5]], NAVY, { edge: true });                // scabbard, slung back from his hip
      t.px(5, 38, GOLD);
      legB.poly([[15, 35], [23, 35], [23, 40], [15, 40]], Nd, { edge: true });
      legB.ellipse(19.5, 42.2, 3, 1.4, P(C.s, '#b8a68c', C.b), { edge: true });
      armB.ellipse(15.5, 23, 3.8, 4.2, Nd, { edge: true });                                      // far shoulder guard
      b.ellipse(21, 28, 12.5, 9.8, RED, { edge: true });                                         // a big round belly in a lacquered breastplate
      b.poly([[9, 25], [33, 25], [33, 29], [9, 29]], RED, { edge: true });
      samuraiLace(b, 10, 32, 24); samuraiLace(b, 10, 32, 28); samuraiStuds(b, 12, 30, 21, 6);
      b.poly([[25, 19], [31, 21], [29, 24], [24, 23]], C);                                       // white bib at the neck
      b.rect(9, 33, 25, 2, BELT.b); b.rect(9, 34, 25, 1, BELT.s);                                // rope belt
      b.ellipse(30, 34, 1.6, 1.4, BELT, { edge: true }); b.rect(29, 35, 2, 3, BELT.s);           // knot and tassel
      legA.poly([[18, 35], [27, 35], [28, 40], [19, 40]], NAVY, { edge: true });                 // short legs in wide trousers
      legA.poly([[20, 38.5], [27, 38.5], [26, 41.5], [21, 41.5]], RED, { edge: true });          // red shin guard
      legA.ellipse(25, 42.3, 3.6, 1.5, C, { edge: true }); legA.rect(23, 42, 3, 1, SANDAL);      // white paw in a sandal
      b.poly([[27, 32], [37, 28.5], [37.5, 30], [28, 33.5]], HILT, { edge: true });              // the katana's hilt, forward at the hip
      b.px(30, 31, HILT.s).px(33, 30, HILT.s).px(35, 29, HILT.s);
      b.ellipse(27, 33, 1.4, 2, GOLD, { edge: true });                                           // guard
      armA.ellipse(22, 22.5, 4.5, 5, NAVY, { edge: true });                                      // near shoulder guard
      armA.rect(18, 23, 8, 1, RED.b); armA.rect(18, 25, 8, 1, RED.b);
      armA.ellipse(28, 30, 2.8, 2.4, C, { edge: true });                                         // chubby paw on the hilt
      earB.poly([[22, 6], [21, -1], [26, 3]], P(O.s, TOSHI.line, O.b));
      h.ellipse(28, 12, 10.5, 9, O, { edge: true });                                             // big round head
      earA.poly([[25, 5], [28, -1], [31, 4]], O, { edge: true }); earA.poly([[27, 4], [28, 0.5], [29.8, 3.5]], PINK);
      h.ellipse(36, 16, 5.4, 3.6, C); h.ellipse(29.5, 16.5, 4.2, 3.4, C); h.ellipse(31, 19.6, 5.2, 2.3, C);   // muzzle, puffy cheek, chin
      h.rect(18, 5, 17, 2, RED.b); h.rect(18, 6, 17, 1, RED.s);                                  // red headband
      h.poly([[19, 5], [11, 3], [12, 8]], RED, { edge: true }); h.poly([[19, 6], [12, 10], [15, 11]], RED, { edge: true });   // its tails behind
      h.px(31, 8, C.b); h.px(32, 8, C.b);
      rigEye(h, Q, 30, 9, () => { h.rect(30, 9, 5, 1, OUTLINE); h.rect(31, 10, 3, 1, DARK_EYE); }, 5);
      h.rect(40, 14, 2, 2, OUTLINE); h.px(40, 14, '#5a5060');
      rigMouth(h, Q, 35, 18, 4, () => { h.rect(35, 18, 4, 1, OUTLINE); h.px(34, 17, OUTLINE); });
      return;
    }
    const legs = () => {   // short legs in wide navy trousers, red shin guards
      legA.poly([[11, 34], [21, 34], [21, 40], [10, 40]], NAVY, { edge: true }); legB.poly([[23, 34], [33, 34], [34, 40], [23, 40]], NAVY, { edge: true });
      legA.poly([[12, 38.5], [20, 38.5], [20, 41.5], [13, 41.5]], RED, { edge: true }); legB.poly([[24, 38.5], [32, 38.5], [31, 41.5], [24, 41.5]], RED, { edge: true });
    };
    const belly = () => {  // the round belly in its lacquered breastplate, and the rope belt
      b.ellipse(22, 27.5, 13, 9.8, RED, { edge: true });
      b.poly([[9.5, 25], [34.5, 25], [34.5, 29], [9.5, 29]], RED, { edge: true });
      samuraiLace(b, 10, 34, 24); samuraiLace(b, 10, 34, 28);
      b.rect(9, 33, 26, 2, BELT.b); b.rect(9, 34, 26, 1, BELT.s);
    };
    const shoulders = () => {
      armA.ellipse(8.5, 22, 4.5, 5, NAVY, { edge: true }); armB.ellipse(35.5, 22, 4.5, 5, NAVY, { edge: true });
      armA.rect(4, 22, 9, 1, RED.b); armB.rect(31, 22, 9, 1, RED.b); armA.rect(4, 24, 9, 1, RED.b); armB.rect(31, 24, 9, 1, RED.b);
    };
    if (v === 'back') {
      legs(); belly(); samuraiStuds(b, 12, 32, 21, 5);
      b.poly([[5, 26], [7, 25], [12, 31], [10, 32]], HILT, { edge: true });                      // hilt peeking out at his side
      shoulders();
      earA.poly([[12, 9], [11, -1], [19, 5]], O, { edge: true }); earB.poly([[32, 9], [33, -1], [25, 5]], O, { edge: true });
      h.ellipse(22, 13, 12, 9, O, { edge: true });
      h.ellipseM(10, 16, 2.2, 2.2, C);                                                           // puffy cheeks from behind
      h.rect(10, 6, 24, 2, RED.b); h.rect(10, 7, 24, 1, RED.s);
      h.ellipse(22, 7, 2.2, 1.8, RED, { edge: true });                                           // the knot
      h.poly([[21, 8], [17, 19], [20, 18]], RED, { edge: true }); h.poly([[23, 8], [27, 19], [24, 18]], RED, { edge: true });   // tails hanging down
      t.ellipse(22, 31, 5.5, 5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(22, 30.5, 3.2, 2.8, C); t.px(22, 30, O.s); t.px(23, 30, O.s);
      return;
    }
    t.ellipse(37, 27, 5, 5.5, O, { edge: true });                                                // fluffy tail out to the side
    t.ellipse(37.5, 26.5, 3, 3.3, C); t.px(37, 26, O.s);
    t.poly([[10, 33], [12, 34], [5, 42], [3, 41]], NAVY, { edge: true });                        // scabbard trailing behind his left leg
    legs();
    legA.ellipse(16.5, 42.4, 3.8, 1.5, C, { edge: true }); legB.ellipse(27.5, 42.4, 3.8, 1.5, C, { edge: true });   // paws in sandals
    legA.rect(16, 42, 2, 1, SANDAL); legB.rect(27, 42, 2, 1, SANDAL);
    belly();
    b.poly([[18, 18], [26, 18], [22, 23]], C);                                                   // white bib at the neck
    b.rect(18, 19, 8, 1, CORD); samuraiStuds(b, 13, 31, 21, 6);
    b.ellipse(15, 33.5, 1.8, 1.5, BELT, { edge: true }); b.rect(14, 35, 2, 3, BELT.s);           // knot and tassel
    b.poly([[6, 26], [8, 25], [14.5, 31.5], [12.5, 32.5]], HILT, { edge: true });                // the katana's hilt at his left hip
    b.px(9, 27, HILT.s).px(11, 29, HILT.s);
    b.ellipse(13.5, 32, 2, 1.5, GOLD, { edge: true });
    shoulders();
    armA.ellipse(12, 30, 2.9, 2.5, C, { edge: true }); armB.ellipse(32, 30, 2.9, 2.5, C, { edge: true });   // chubby paws
    earA.poly([[12, 9], [11, -1], [19, 5]], O, { edge: true }); earB.poly([[32, 9], [33, -1], [25, 5]], O, { edge: true });
    earA.poly([[13.5, 7.5], [12.5, 1.5], [17, 5]], PINK); earB.poly([[30.5, 7.5], [31.5, 1.5], [27, 5]], PINK);
    h.ellipse(22, 13, 12, 9, O, { edge: true });                                                 // big round head
    h.ellipseM(10.5, 16.5, 3.2, 3, C, { edge: true });                                           // puffy cheeks sticking out
    h.ellipse(22, 17.5, 9.5, 5.2, C);                                                            // big cream lower face
    h.rect(10, 6, 24, 2, RED.b); h.rect(10, 7, 24, 1, RED.s);                                    // red headband
    h.ellipse(22, 6, 2.2, 1.8, RED, { edge: true }); h.rect(21, 8, 2, 3, RED.b);                 // its knot, a strap down the brow
    h.pxM(15, 10, C.b); h.pxM(16, 10, C.b);
    rigEyes(h, Q, 44, 14, 12, 5, () => { h.rectM(14, 12, 5, 1, OUTLINE); h.rectM(15, 13, 3, 1, DARK_EYE); });
    h.rect(20, 15, 4, 1, OUTLINE); h.rect(21, 16, 2, 1, OUTLINE); h.px(21, 15, '#5a5060');
    rigMouth(h, Q, 19, 18, 6, () => { h.px(19, 18, OUTLINE); h.rect(20, 19, 2, 1, OUTLINE); h.rect(22, 19, 2, 1, OUTLINE); h.px(24, 18, OUTLINE); h.px(21, 17, OUTLINE); h.px(22, 17, OUTLINE); });   // smug little "w" smile
  },
});
Object.assign(MONSTER_ART_DIAG, {
  smugshi(g, v) {
    const O = TOSHI.coat, C = TOSHI.white, PINK = '#e8b4a4', TONGUE = '#e8607a';
    const R = rig();
    const b = part(g, 0, R.body), t = part(g, R.tail[0], R.body + R.tail[1]), h = part(g, R.head[0], R.head[1]);
    const ear = i => part(g, R.head[0] - (R.ears[i] > 1 ? 1 : 0), R.head[1] + R.ears[i]), earA = ear(0), earB = ear(1);
    const legA = part(g, R.legs[0] ? 1 : 0, -R.legs[0]), legB = part(g, R.legs[1] ? 1 : 0, -R.legs[1]);
    if (v === 'bside') {
      legA.ellipse(11, 27.5, 2.2, 3, C, { edge: true }); legB.ellipse(19, 28, 2, 2.8, C, { edge: true });   // white hind legs
      b.ellipse(15, 22, 7.5, 6, O, { edge: true });
      b.ellipse(13, 26, 4, 2.2, C);                                                              // white rear
      earA.poly([[10, 9], [10, 0], [16, 5]], O, { edge: true });                                 // big upright ears
      earB.poly([[19, 6], [23, 0], [25, 7]], O, { edge: true });
      b.ellipse(17, 18, 6.5, 2.3, C);                                                            // white crescent across the shoulders
      h.ellipse(18, 11.5, 8, 6.2, O, { edge: true });
      h.ellipse(24.5, 14, 1.8, 1.8, C); h.ellipse(25.5, 12.5, 1.4, 1.4, C);                      // cheek and muzzle peeking out
      t.ellipse(13, 19, 5, 4.5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(13, 18.5, 3, 2.6, C); t.px(13, 18, O.s); t.px(14, 18, O.s);
      toshiLines(g);
      return;
    }
    t.ellipse(8, 17, 4.5, 4.5, O, { edge: true });                                               // curled tail behind him
    t.ellipse(7.5, 16.5, 3.2, 3.2, C); t.px(7, 16, O.l); t.px(8, 17, O.s);
    legB.ellipse(9, 26.5, 1.8, 2.8, P(C.s, '#cbbba4', C.b));                                     // hind leg
    b.ellipse(14, 22, 8, 6, O, { edge: true });                                                  // body
    b.ellipse(18.5, 23, 4.5, 5.5, C);                                                            // white chest
    legB.ellipse(15, 27.5, 2.2, 3.2, C, { edge: true }); legA.ellipse(21, 27.5, 2.2, 3.2, C, { edge: true });   // white front legs
    legB.px(14, 30, C.s); legA.px(20, 30, C.s);
    earA.poly([[9, 10], [9, 0], [15, 5]], O, { edge: true });                                    // near ear
    earA.poly([[10.3, 8], [10.3, 2.5], [13.5, 5.3]], PINK); earA.px(11, 4, C.b);
    earB.poly([[20, 7], [24, 0], [26, 7]], P(O.s, TOSHI.line, O.b), { edge: true });             // far ear, in shadow
    earB.poly([[21.5, 6], [23.6, 2.5], [24.6, 6]], PINK);
    h.ellipse(17.5, 12, 8, 6.5, O, { edge: true });                                              // head
    h.ellipse(12.5, 14.8, 2.6, 2.4, C); h.ellipse(23, 14.5, 1.6, 2, C);                          // white cheeks
    h.ellipse(20, 15.6, 4.4, 3, C);                                                              // white muzzle, turned his way
    h.rect(16, 17, 7, 3, C.b); h.rect(15, 18, 8, 2, C.b);                                        // white throat into the chest
    h.rect(13, 9, 2, 1, C.b); h.rect(21, 9, 2, 1, C.b);                                          // pale eyebrow spots
    toshiLines(g);
    rigEye(h, R, 13, 11, () => { h.rect(12, 11, 4, 1, OUTLINE); h.rect(13, 12, 2, 1, DARK_EYE); });   // smug lids
    rigEye(h, R, 21, 11, () => { h.rect(20, 11, 3, 1, OUTLINE); h.rect(21, 12, 2, 1, DARK_EYE); });
    h.rect(21, 13, 2, 2, OUTLINE); h.px(21, 13, '#5a5060');                                      // big black nose
    if (R.mouth === 'roar') { h.rect(18, 16, 6, 3, OUTLINE); h.px(20, 18, TONGUE).px(21, 18, TONGUE); }
    else if (R.mouth === 'open') { h.rect(19, 16, 4, 2, OUTLINE); h.px(20, 17, TONGUE).px(21, 17, TONGUE); }
    else { h.rect(19, 16, 4, 1, OUTLINE); h.px(23, 15, OUTLINE); h.rect(19, 17, 4, 1, C.s); }   // flat mouth, smug corner, and a chin
  },
  smugshogun(g, v) { shogunDraw(g, v); },
  daimochi(g, v) {
    const O = TOSHI.coat, C = TOSHI.white, { RED, NAVY, GOLD, CORD, HILT, BELT, SANDAL } = SAMURAI, Nd = P(NAVY.s, '#121a36', NAVY.b), PINK = '#e8b4a4';
    const { Q, b, h, t, earA, earB, legA, legB, armA, armB } = rigParts(g, v);
    legA.poly([[11, 34], [20, 34], [20, 40], [10, 40]], NAVY, { edge: true }); legB.poly([[23, 34], [32, 34], [33, 40], [23, 40]], NAVY, { edge: true });
    legA.poly([[12, 38.5], [19, 38.5], [19, 41.5], [13, 41.5]], RED, { edge: true }); legB.poly([[24, 38.5], [31, 38.5], [30, 41.5], [24, 41.5]], RED, { edge: true });
    if (v === 'bside') {
      b.ellipse(22, 27.5, 12.5, 9.8, RED, { edge: true });
      b.poly([[9.5, 25], [34.5, 25], [34.5, 29], [9.5, 29]], RED, { edge: true });
      samuraiLace(b, 10, 34, 24); samuraiLace(b, 10, 34, 28); samuraiStuds(b, 12, 32, 21, 5);
      b.rect(9, 33, 26, 2, BELT.b); b.rect(9, 34, 26, 1, BELT.s);
      b.poly([[5, 26], [7, 25], [12, 31], [10, 32]], HILT, { edge: true });                      // hilt peeking out at his side
      armA.ellipse(8.5, 22, 4.5, 5, NAVY, { edge: true }); armB.ellipse(35, 22, 4, 4.8, NAVY, { edge: true });
      armA.rect(4, 22, 9, 1, RED.b); armA.rect(4, 24, 9, 1, RED.b); armB.rect(31, 22, 8, 1, RED.b); armB.rect(31, 24, 8, 1, RED.b);
      earA.poly([[13, 9], [12, -1], [20, 5]], O, { edge: true }); earB.poly([[28, 7], [32, -1], [34, 8]], O, { edge: true });
      h.ellipse(24, 13, 12, 9, O, { edge: true });
      h.ellipse(35.5, 16, 2.4, 2.4, C, { edge: true }); h.ellipse(12, 16, 2, 2, C);              // a puffy cheek peeking out
      h.rect(12, 6, 24, 2, RED.b); h.rect(12, 7, 24, 1, RED.s);
      h.ellipse(22, 7, 2.2, 1.8, RED, { edge: true });
      h.poly([[21, 8], [17, 19], [20, 18]], RED, { edge: true }); h.poly([[23, 8], [27, 19], [24, 18]], RED, { edge: true });
      t.ellipse(21, 31, 5.5, 5, O, { edge: true });                                              // the famous curled tail
      t.ellipse(21, 30.5, 3.2, 2.8, C); t.px(21, 30, O.s); t.px(22, 30, O.s);
      return;
    }
    t.ellipse(8, 27, 5, 5.5, O, { edge: true });                                                 // fluffy tail, behind on the left
    t.ellipse(7.5, 26.5, 3, 3.3, C); t.px(7, 26, O.s);
    t.poly([[11, 33], [13, 34], [6, 42], [4, 41]], NAVY, { edge: true });                        // scabbard
    legA.ellipse(15.5, 42.4, 3.8, 1.5, C, { edge: true }); legB.ellipse(28, 42.4, 3.6, 1.5, C, { edge: true });   // paws in sandals
    legA.rect(15, 42, 2, 1, SANDAL); legB.rect(28, 42, 2, 1, SANDAL);
    b.ellipse(22, 27.5, 12.5, 9.8, RED, { edge: true });                                         // round belly in its breastplate
    b.poly([[9.5, 25], [34.5, 25], [34.5, 29], [9.5, 29]], RED, { edge: true });
    samuraiLace(b, 10, 34, 24); samuraiLace(b, 10, 34, 28);
    b.rect(9, 33, 26, 2, BELT.b); b.rect(9, 34, 26, 1, BELT.s);
    b.poly([[21, 18], [29, 18], [25, 23]], C);                                                   // white bib, turned his way
    b.rect(21, 19, 8, 1, CORD); samuraiStuds(b, 13, 31, 21, 6);
    b.ellipse(18, 33.5, 1.8, 1.5, BELT, { edge: true }); b.rect(17, 35, 2, 3, BELT.s);           // knot and tassel
    b.poly([[6, 26], [8, 25], [14.5, 31.5], [12.5, 32.5]], HILT, { edge: true });                // the katana's hilt
    b.px(9, 27, HILT.s).px(11, 29, HILT.s);
    b.ellipse(13.5, 32, 2, 1.5, GOLD, { edge: true });
    armA.ellipse(8.5, 22, 4.5, 5, NAVY, { edge: true }); armB.ellipse(35, 22, 3.8, 4.6, Nd, { edge: true });   // shoulder guards, the far one in shadow
    armA.rect(4, 22, 9, 1, RED.b); armA.rect(4, 24, 9, 1, RED.b); armB.rect(32, 22, 7, 1, RED.s); armB.rect(32, 24, 7, 1, RED.s);
    armA.ellipse(12, 30, 2.9, 2.5, C, { edge: true }); armB.ellipse(32, 30, 2.6, 2.3, C, { edge: true });   // chubby paws
    earA.poly([[13, 9], [12, -1], [20, 5]], O, { edge: true }); earA.poly([[14.5, 7.5], [13.5, 1.5], [18, 5]], PINK);
    earB.poly([[30, 8], [33, -1], [35, 7]], P(O.s, TOSHI.line, O.b), { edge: true }); earB.poly([[31.5, 6.5], [32.8, 2], [33.8, 6]], PINK);
    h.ellipse(23.5, 13, 12, 9, O, { edge: true });                                               // big round head
    h.ellipse(12, 16.5, 3.2, 3, C, { edge: true }); h.ellipse(34.5, 16.5, 2.4, 2.6, C, { edge: true });   // puffy cheeks
    h.ellipse(25, 17.5, 9, 5.2, C);                                                              // big cream lower face
    h.rect(11, 6, 25, 2, RED.b); h.rect(11, 7, 25, 1, RED.s);                                    // red headband
    h.ellipse(25, 6, 2.2, 1.8, RED, { edge: true }); h.rect(24, 8, 2, 3, RED.b);
    h.px(18, 10, C.b); h.px(19, 10, C.b); h.px(29, 10, C.b); h.px(30, 10, C.b);
    rigEye(h, Q, 17, 12, () => { h.rect(17, 12, 5, 1, OUTLINE); h.rect(18, 13, 3, 1, DARK_EYE); }, 5);
    rigEye(h, Q, 28, 12, () => { h.rect(28, 12, 4, 1, OUTLINE); h.rect(29, 13, 2, 1, DARK_EYE); }, 4);
    h.rect(23, 15, 4, 1, OUTLINE); h.rect(24, 16, 2, 1, OUTLINE); h.px(24, 15, '#5a5060');
    rigMouth(h, Q, 22, 18, 6, () => { h.px(22, 18, OUTLINE); h.rect(23, 19, 2, 1, OUTLINE); h.rect(25, 19, 2, 1, OUTLINE); h.px(27, 18, OUTLINE); h.px(24, 17, OUTLINE); h.px(25, 17, OUTLINE); });
  },
});
Object.assign(RIGGED, { smugshi: 'quad', smugshogun: 'quad', daimochi: 'biped' });
// Smugshi's fidget (r110): a big lazy yawn, then a smug glance away, every 9 seconds or so.
Object.assign(FIDGETS, { smugshi: { fps: 5, every: 9, frames: [
  { head: [0, -1], eyes: 'blink' },
  { head: [0, -2], eyes: 'sleep', mouth: 'roar', ears: [1, 1] },
  { head: [0, -2], eyes: 'sleep', mouth: 'roar', ears: [1, 1] },
  { head: [0, -1], eyes: 'blink', mouth: 'open' },
  { head: [-1, 0], tail: [1, 0] },
  { head: [-1, 0], tail: [-1, 0] },
  {},
] } });
// Fidgets for his grown-up forms (r116).
Object.assign(FIDGETS, {
  smugshogun: { fps: 5, every: 9, frames: [{ body: -1 }, { body: -1, head: [0, -1], eyes: 'blink' }, { body: 1, tail: [1, 0] }, { head: [1, 0], tail: [-1, 0] }, { head: [1, 0] }, {}] },   // settles his armour with a shrug, chin up, very pleased with himself
  daimochi: { fps: 5, every: 9, frames: [{ arms: [0, 2] }, { arms: [0, 3], eyes: 'blink' }, { arms: [0, 2], body: 1, mouth: 'open' }, { arms: [0, 3], eyes: 'blink' }, { arms: [0, 2] }, {}] },   // pats his belly and sighs, very content
});
