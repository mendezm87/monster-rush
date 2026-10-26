// Ten Coreatures redrawn from the owner's pixel-art guides (r245, Round 9 in docs/guide-prompts.md; the guides are
// docs/refs/GUIDE-*.jpg). Each view is a colour map traced with tools/trace-guide.py (the guide's own palette, shrunk so
// the widest view fits the 32px picture; the traced outer outline is dropped, the sprite builder adds its own), drawn
// pixel by pixel with every pixel on its rig part, so they still walk, blink, strike and fidget. Loaded after every
// family's file, so these pictures replace the hand-drawn ones; the old art stays in those files for now.
// parts per view: neck/ear = rows above which pixels ride the head/ears, hb = the head's columns, tail = a box,
// tailPx = the tail's own pixels (Coilizard's spring), leg = the row legs start (legA lists the pixels of one diagonal
// pair, y * 64 + x), eyes = [x, y, w] for blinks,
// wings = palette keys that are wings (folded down for the flap frames).
const TRACED = {
  lumawool: {
    pal: {'k': '#000002', 'a': '#0a0b0f', 'b': '#292a33', 'c': '#31333b', 'd': '#323340', 'e': '#3e4149', 'f': '#4e525b', 'g': '#666a77', 'h': '#686d7b', 'i': '#7c8077', 'j': '#ffe14a', 'm': '#fff27a'},
    maps: {
      front: ['......................', '...hhhh..ehh...hhhh...', '..fafhhekhhhhkehffff..', '.fbcaafhkghhhkffaacag.', '.bbkkabffghhgffbkkkcc.', '.bbkekkgfeghkfkkkekcb.', '.bkkkeekbbkkbbkeekkcb.', '.ackkbkbccccccbkbkkca.', '.fkkgkkamccccmakkgkbf.', '.bgbkfkbmccccmbkfbbg..', '..kkeffbcccccckffkkk..', '.fffihekcccdcckghgfff.', '.fhhhhhfkcbddkfhhghff.', '.ffehhhhekkkkehhhhff..', '..ffhhhhheeeehhhhffe..', '..dfffhhhhhhhhhfhfmd..', '..ddmfffhhhfhffffddd..', '..ddcdffffffffffccc...', '...kddddddfffddddd....', '....bcddddcddddcdd....', '......kdaacddkdk......', '.......kkk..kkk.......', '.......ck....kb.......', '.......h.....kd.......', '......................'],
      fside: ['...........................', '............hhhh....kfh....', '...........fhaghhkhhfgdg...', '.......fhkfabbaafikhgmff...', '.....fhghfbbkkkbffkghhfk...', '....ehhhgkabkffkkkfffgfk...', '...hfhehhkakekdbffkbkkk....', '..fgmghhhkbkkakkfkccccck.g.', '..fffmehgkefkkkkkbbmddcckk.', '..kffhhhhhkfbkbkkbcbcccdk..', '.ekffhhhhgfkkkkffbcccccc...', '.kcfffhhhhhhfffffkbcccak...', '.kddffhhhghhhhhhffkkbbb....', '.cddffffhhhhhhhhhffdkk.....', '..dddffffhhffhhhhhffdda....', '..dddddfffffffmfffffddd....', '..ccdddcdffcffffffffdc.....', '...cddddddccfffffddddi.....', '....ddkcdddddffcddccdd.....', '....kcdkdddkcddddcdkk......', '....bk..kkk.cddc.kkk.......', '....dd..bb...kk...b........', '....bg........c...c........', '..............h............', '...........................'],
      side: ['..............................', '................iiifikkkk.....', '...............ihaaafikgfk....', '..........hhhgefaabbbffkigg...', '.......fhehmhkhbbkkkbbehhih...', '......fhhhhhgkfdkfekkkffffe...', '....fghhhhhhhkbbkgkddefkbk....', '....hhheghhhhkbbkgbbkkkbacc...', '...fgghhhhghhhkbkkkkekkcmmcc..', '...fhhhhhhhmhhkbebbbkebdccdcc.', '...kffehhhhhhhhkkkkkffkcccccc.', '.fkcfffhhhhhhhhhhfffhhebbccb..', '.dkdffffhhhhhhhhhhhhhhfdkk....', '.acdddffeefhghhhhhhhhhfcd.....', '.cdddfffffffhfffghhhhhffc.....', '..kdddffffffffffmgffhfedc.....', '...ddcddddffffddfffffffd......', '...ddddddddddddddfffeccd......', '....cdddckddddccddddccc.......', '.....ddddcdddddkddddkd........', '.....kkkkkc.cdd.cdcck.........', '.....bbkkb.......kkkk.........', '.....cdkbb.......bbkbb........', '.....ddk.........cck..........', '..............................'],
      back: ['......................', '...heif..ehhf..fihh...', '..ifbbbkgghhggkbbbhh..', '..ifbbkkfkhgkfkkbbbf..', '.ffbkkghfhhhhhhkkkbgf.', '.fbakhhhhhhhhhhhgkadf.', '.fbakghhhhhhhjeghfadf.', '.kbkehhhhhhhhheheekbk.', '.kkgghhhhhhhhhhhhhhkk.', '..hhhhhghhhhhhhhhhhd..', '..ghhhhghhhhhhhhhehf..', '..ffhhhhhhfehhhhheff..', '..dfhhhhhfhhfhhhefee..', '.ddfehhhkhhhhkhhffffc.', '.ddffeghkffffkhhffffd.', '..cfffdhdkfeddfffffc..', '..cdmfffcckkcfffccdd..', '..dddfcffcdddfffddcd..', '...dcdddddddddddddd...', '.....dddddddddddc.....', '.....addkkcddkdda.....', '.......kkk..kkk.......', '......cbk....kbd......', '......dd.....kdd......', '......................'],
    },
    parts: {
      front: { neck: 14, ear: 8, hb: [4, 17], tail: null, leg: 20, legA: [1286, 1287, 1351, 1415, 1479, 1288, 1352, 1416, 1289, 1353, 1290], eyes: [] },
      fside: { neck: 14, ear: 8, hb: [12, 26], tail: [0, 9, 2, 17], leg: 20, legA: [1284, 1348, 1412, 1285, 1349, 1413, 1292, 1293, 1357, 1294, 1358, 1422, 1486, 1295], eyes: [] },
      side: { neck: 14, ear: 8, hb: [19, 29], tail: [0, 8, 3, 15], leg: 20, legA: [1285, 1349, 1413, 1477, 1286, 1350, 1414, 1478, 1287, 1351, 1415, 1479, 1288, 1352, 1416, 1289, 1353, 1417, 1290, 1296, 1297, 1361, 1425, 1489, 1298, 1362, 1426, 1490, 1299, 1363, 1427, 1491, 1300, 1364, 1428, 1429], eyes: [] },
      back: { neck: 14, ear: 8, hb: [3, 18], tail: null, leg: 20, legA: [1285, 1286, 1414, 1478, 1287, 1351, 1415, 1479, 1288, 1352, 1416, 1289, 1353, 1290], eyes: [] },
    },
  },
  coilizard: {
    pal: {'k': '#0a0a26', 'm': '#b1f900', 'l': '#d3fa71', 'g': '#8cc823', 'd': '#2f5a18', 'o': '#f47b05', 'r': '#b4560c', 'w': '#c4c6c8', 's': '#868482', 'q': '#56565c', 'b': '#1e73df', 'c': '#0adcfc', 'n': '#0524b2', 'p': '#9cf0fc', 'y': '#eef8d4'},
    maps: {
      front: ['.............qwq.......', '............wqwqw......', '..........wqwqwqwqn....', '.........qwqwqwqnccn...', '.........qwqwqwqbcpcn..', '.........qwqwskkkcccn..', '.....yykkksskkyykkcb...', '.....yykkmoomkyykkn....', '.....yyyymoomkyyyy.....', '......kkdmmmmmkk.......', '......dgmmmmmmgdg......', '......dmmmmmmmmdm......', '.....koddddddddok......', '....ggkkommmmmokgg.....', '....gmmgoorrrogmmgg....', '..ggmmmgooooooggmmgg...', '.ggkmgk.oooooorkgmkgg..', '..skmgs........sgmks...', '...mmm..........mmm....', '...kmmg........gmgm....', '...m.m..........m......', '.......................'],
      fside: ['............nn.............', '......wqwqnbccn............', '....w.wqwncccccn...........', '...qwqqkdnbbcccn...........', '..wqwqwq.nbccccn...........', '.qwqwqw....bbbn............', '.qwqwq.....................', 'wqqq..................mm...', '..www..............moommd..', '.qqqq...........yykkmoomd..', '..wwwq....ommo.kyykkmmomm..', '.qwqqq...ommookkyyyymmmmmg.', '...wwwsmmmoomokmkkkgmmmmmm.', '..wqwqkgmmomoodmmmmmmmmmmd.', '....wqgmgmommmmdmmddddddd..', '.....gmggggmdmmggroorkk....', '.....ggkkoggmmmgoooorg.....', '.....ggks..mmgkoooo.kgg....', '...gmmm.....mkk.....sgggg..', '.....m......mms......ggg...', '............mmm............', '............mgm............', '............m.m............'],
      side: ['.........cn.....................', '.......qcccc....................', '.....qwncccc....................', '...qwqwqbbb.....................', '..wqwqwqw.......................', '..qqqq..........................', '.qwqwq.................yykko....', '..qqq................okyykkmm...', '..www...............omkyyyymmm..', '.qqqq.......omoommomommkkkmmmm..', '..wwwqw.w.omomoomommmmmmmmdddd..', '..wqwqwqkmmmmmmomommmmgrrr......', '...qwqwwkmmmmmmmmmmmmoo.........', '....q.wqsgdmmggggmmko...........', '.......wwkmmkoooo.mk............', '.........mmk......mmk...........', '........m.mmm.....m.m...........', '................................'],
      back: ['......................', '.....mmm...mlm........', '.....mmmmoommmd.......', '....gmmmmoommmd.......', '.....mmmmommmmm.......', '....gmmmmmmmmmm.......', '....ggmmmmmmmmgs.nn...', '.....ggmmoommgsqcccb..', '......goommookwnccccn.', '......gmmoomokwnccccn.', '.....mgooooommkncccc..', '....mggommmmoomkncbq..', '....gkgmmmmmmgkgsnnww.', '...kgkmmooooomkkwqwqw.', '..ggmmgmommmomkmkqwww.', '...kmmmmmmkkmmmmmkqq..', '....mgmmmswwkmgggkwww.', '..mmmkggkqqqkgkgkqqq..', '..mmg...wqwwwkwkwqww..', '.m......wqwqwqwqwqqq..', '.........qwqwqwqwqwq..', '..........qqwqwqwqw...', '..........wqwqwqwq....', '.............q.qq.....', '...............w......'],
    },
    parts: {
      front: { neck: 11, ear: 0, hb: [5, 17], tail: null, tailPx: [13, 14, 15, 76, 77, 78, 79, 80, 138, 139, 140, 141, 142, 143, 144, 145, 146, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 329, 330, 331, 332, 336, 337, 338, 339, 340, 401, 402, 403, 465, 466], leg: 16, legA: [1025, 1026, 1090, 1027, 1091, 1155, 1219, 1283, 1028, 1092, 1156, 1220, 1029, 1093, 1157, 1221, 1285, 1030, 1094, 1222], eyes: [[5, 6, 3], [14, 6, 3]] },
      fside: { neck: 12, ear: 0, hb: [15, 26], tail: null, tailPx: [12, 13, 70, 71, 72, 73, 74, 75, 76, 77, 78, 132, 134, 135, 137, 138, 139, 140, 141, 142, 143, 195, 196, 197, 198, 202, 203, 204, 205, 206, 207, 258, 259, 260, 261, 262, 263, 265, 266, 267, 268, 269, 270, 271, 321, 322, 323, 324, 325, 326, 331, 332, 333, 334, 385, 386, 387, 388, 389, 448, 449, 450, 451, 514, 515, 516, 577, 578, 579, 580, 642, 643, 644, 645, 705, 706, 707, 708, 709, 771, 772, 773, 834, 835, 836, 837, 900], leg: 17, legA: [1155, 1156, 1093, 1157, 1221, 1094, 1158, 1095, 1096, 1108, 1172, 1109, 1173, 1237, 1110, 1174, 1238, 1175, 1239, 1176], eyes: [[16, 9, 3]] },
      side: { neck: 9, ear: 0, hb: [19, 31], tail: null, tailPx: [9, 10, 71, 72, 73, 74, 75, 133, 134, 135, 136, 137, 138, 139, 195, 196, 197, 198, 199, 200, 201, 202, 258, 259, 260, 261, 262, 263, 264, 322, 323, 324, 325, 385, 386, 387, 388, 389, 450, 451, 452, 514, 515, 516, 577, 578, 579, 580, 642, 643, 644, 645, 646, 648, 706, 707, 708, 709, 710, 711, 771, 772, 773, 774, 775, 836, 838, 839, 903, 904], leg: 13, legA: [836, 1032], eyes: [[23, 6, 3]] },
      back: { neck: 12, ear: 0, hb: [0, 12], tail: null, tailPx: [401, 402, 463, 464, 465, 466, 467, 526, 527, 528, 529, 530, 531, 532, 590, 591, 592, 593, 594, 595, 596, 655, 656, 657, 658, 659, 720, 721, 722, 723, 785, 786, 787, 788, 848, 849, 850, 851, 852, 913, 914, 915, 916, 978, 979, 1034, 1035, 1042, 1043, 1044, 1097, 1098, 1099, 1105, 1106, 1107, 1160, 1161, 1162, 1163, 1164, 1166, 1168, 1169, 1170, 1171, 1224, 1225, 1226, 1227, 1228, 1229, 1230, 1231, 1232, 1233, 1234, 1235, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361, 1362, 1418, 1419, 1420, 1421, 1422, 1423, 1424, 1425, 1485, 1487, 1488, 1551], leg: 18, legA: [1217, 1160, 1224, 1161, 1225, 1289, 1162, 1226, 1290, 1354, 1418, 1163, 1227, 1291, 1355, 1419, 1164, 1228, 1292, 1356, 1420, 1165, 1229, 1293, 1357, 1421, 1485, 1166, 1230, 1294, 1358, 1422, 1167, 1231, 1295, 1359, 1423, 1487, 1551, 1168, 1232, 1296, 1360, 1424, 1488, 1169, 1233, 1297, 1361, 1425, 1170, 1234, 1298, 1362, 1171, 1235, 1299], eyes: [] },
    },
  },
};
function tracedDraw(g, v, id) {
  const D = TRACED[id], key = v === 'bside' ? 'back' : v, map = D.maps[key], S = D.parts[key], { Q, b, h, t, earA, earB, legA, legB } = rigParts(g, v);
  const H = map.length, W = map[0].length, ox = Math.floor((32 - W) / 2), oy = 32 - H, turn = v === 'bside' ? 1 : 0;
  const A = new Set(S.legA), TP = new Set(S.tailPx || []), tb = S.tail, mid = (S.hb[0] + S.hb[1]) / 2, wings = D.wings || '';
  const eyeAt = new Set(); if (Q.eyes) for (const [ex, ey, w] of S.eyes) for (let i = 0; i < w; i++) for (let j = 0; j < 3; j++) eyeAt.add((ey + j) * 64 + ex + i);
  const skin = (x, y) => {   // under a shut eye: the commonest colour round it that isn't outline or eye
    const n = {}; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const k = (map[y + dy] || '')[x + dx]; if (k && k !== '.' && k !== 'k' && !eyeAt.has((y + dy) * 64 + x + dx)) n[k] = (n[k] || 0) + 1; }
    return Object.keys(n).sort((a, c) => n[c] - n[a])[0] || map[y][x];
  };
  const fold = wings && FLAP ? Math.round(3 * FLAP) : 0;
  for (const pass of wings ? [0, 1] : [1]) map.forEach((row, y) => { for (let x = 0; x < W; x++) {
    let k = row[x]; if (k === '.') continue;
    const inHead = y < S.neck && x >= S.hb[0] && x <= S.hb[1];
    const wing = wings.includes(k);   // wings never ride the head, even where they show behind it
    if (wings && (pass === 0) !== wing) continue;
    if (eyeAt.has(y * 64 + x)) k = skin(x, y);
    if (wing) { b.px(ox + x + Math.sign(x - mid) * -fold, oy + y + fold, D.pal[k]); continue; }
    const inTail = TP.has(y * 64 + x) || (tb && x >= tb[0] && x <= tb[2] && y >= tb[1] && y <= tb[3]);
    const onHead = inHead && !inTail;   // (at rest every part is the same grid, so turn by zone, not by part)
    const p = onHead && y < S.ear ? (x < mid ? earA : earB) : onHead ? h : inTail ? t : y >= S.leg ? (A.has(y * 64 + x) ? legA : legB) : b;
    p.px(ox + x + (onHead ? turn : 0), oy + y, D.pal[k]);
  } });
  for (const [ex, ey, w] of S.eyes) rigEye(h, Q, ox + ex + turn, oy + ey, () => {}, w);
}
for (const id of Object.keys(TRACED)) { MONSTER_ART[id] = (g, v = 'front') => tracedDraw(g, v, id); MONSTER_ART_DIAG[id] = (g, v) => tracedDraw(g, v, id); }
