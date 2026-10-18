// Larger illustrations of the redesign concepts (js/concepts.js), so the owner can see what each
// one is meant to look like before judging its 32px sprite. SVG, drawn back to front, inked
// outlines, flat colours with a light and a shade. Only redesign.html loads this.

const CONCEPT_ART = (() => {
  const INK = '#1a1222';
  const svg = body => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
  const shadow = (rx = 52) => `<ellipse cx="100" cy="187" rx="${rx}" ry="7" fill="rgba(0,0,0,.22)" stroke="none"/>`;
  const e = (cx, cy, rx, ry, fill, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${x}/>`;
  const c = (cx, cy, r, fill, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${x}/>`;
  const p = (d, fill, x = '') => `<path d="${d}" fill="${fill}" ${x}/>`;
  const none = 'stroke="none"';
  const shine = (cx, cy, r) => c(cx, cy, r, '#ffffff', none);
  // a thick inked stroke (tails, necks)
  const tube = (d, color, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 6}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  // a flame standing on (x, y), s tall
  const flame = (x, y, s, outer, inner) => {
    const f = (k, col, inked) => p(`M${x - 0.42 * s * k} ${y} Q${x - 0.6 * s * k} ${y - 0.55 * s * k} ${x - 0.2 * s * k} ${y - 0.85 * s * k} Q${x - 0.12 * s * k} ${y - 0.55 * s * k} ${x + 0.05 * s * k} ${y - 1.05 * s * k} Q${x + 0.38 * s * k} ${y - 0.6 * s * k} ${x + 0.28 * s * k} ${y - 0.45 * s * k} Q${x + 0.55 * s * k} ${y - 0.6 * s * k} ${x + 0.46 * s * k} ${y - 0.25 * s * k} Q${x + 0.5 * s * k} ${y} ${x} ${y} Z`, col, inked ? '' : none);
    return f(1, outer, true) + f(0.6, inner, false);
  };
  // a lightning bolt, s tall, top at (x, y)
  const bolt = (x, y, s, fill = '#ffe066') => p(`M${x} ${y} L${x - 0.35 * s} ${y + 0.55 * s} L${x - 0.05 * s} ${y + 0.5 * s} L${x - 0.2 * s} ${y + s} L${x + 0.35 * s} ${y + 0.4 * s} L${x + 0.05 * s} ${y + 0.45 * s} L${x + 0.2 * s} ${y} Z`, fill, 'stroke-width="2"');
  // a little spark: a 4-point star
  const spark = (x, y, s, fill = '#ffe066') => p(`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`, fill, 'stroke-width="1.5"');
  // a puff of wool or cloud: overlapping circles with a soft highlight
  const puff = (pts, fill, light) => pts.map(([x, y, r]) => c(x, y, r, fill)).join('') + pts.map(([x, y, r]) => c(x - r * 0.25, y - r * 0.3, r * 0.55, light, none)).join('');
  // an outline made of spikes round a centre
  const spiky = (cx, cy, r1, r2, n, fill) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.95).toFixed(1)}`); }
    return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
  };
  // a curled ram horn: a spiral as a thick inked stroke
  const curl = (x, y, s, dir, color) => tube(`M${x} ${y} C${x + dir * 0.9 * s} ${y - 0.9 * s} ${x + dir * 1.9 * s} ${y + 0.1 * s} ${x + dir * 1.4 * s} ${y + 0.85 * s} C${x + dir * 1.0 * s} ${y + 1.25 * s} ${x + dir * 0.55 * s} ${y + 0.8 * s} ${x + dir * 0.85 * s} ${y + 0.5 * s}`, color, 9);

  return {
    sparkit: [
      // A · Plug ferret
      svg(shadow(46) +
        tube('M122 150 C160 152 172 128 162 98', '#3ec9c0', 13) +                                   // long tail
        `<rect x="150" y="76" width="26" height="24" rx="5" fill="#e8903a"/>` + `<rect x="150" y="90" width="26" height="10" rx="3" fill="#b0601e" stroke="none"/>` +
        `<rect x="154" y="58" width="6" height="19" rx="2" fill="#ffc07a"/><rect x="166" y="58" width="6" height="19" rx="2" fill="#ffc07a"/>` +   // copper plug and prongs
        spark(186, 66, 7) + spark(144, 64, 5) +
        e(82, 177, 15, 8, '#23908a') + e(118, 177, 15, 8, '#23908a') +                             // feet
        e(100, 136, 31, 40, '#3ec9c0') + e(100, 144, 20, 29, '#f4ecd6', 'stroke-width="2"') +       // body and belly
        e(70, 128, 8, 15, '#3ec9c0', 'transform="rotate(20 70 128)"') + e(130, 128, 8, 15, '#3ec9c0', 'transform="rotate(-20 130 128)"') +
        c(70, 50, 11, '#3ec9c0') + c(130, 50, 11, '#3ec9c0') + c(70, 51, 5, '#ff9ab0', none) + c(130, 51, 5, '#ff9ab0', none) +   // small round ears
        e(100, 76, 40, 30, '#3ec9c0') +                                                             // long head
        p('M86 50 L89 26 L97 40 L103 18 L109 38 L117 26 L115 50 Z', '#e0fff8') +                    // static tuft
        p('M62 70 Q100 58 138 70 Q138 88 118 84 Q100 80 82 84 Q62 88 62 70 Z', '#16605c', none) +   // ferret's dark eye mask
        c(83, 74, 8, '#2a1a3a') + c(117, 74, 8, '#2a1a3a') + shine(86, 71, 3) + shine(120, 71, 3) +
        e(100, 92, 17, 11, '#f4ecd6') + e(100, 85, 5, 3.5, '#e8607a', 'stroke-width="2"') +          // muzzle, nose
        p('M92 95 Q100 101 108 95', 'none')),
      // B · Static puff
      svg(shadow(46) +
        e(80, 179, 15, 8, '#2a2a80') + e(120, 179, 15, 8, '#2a2a80') +                             // stubby feet
        `<line x1="100" y1="58" x2="100" y2="26" stroke-width="5"/>` + c(100, 22, 18, 'rgba(255,230,128,.35)', none) + c(100, 22, 10, '#ffe680') + shine(97, 19, 3) +   // antenna, glowing bulb
        spiky(100, 116, 66, 54, 15, '#6a6af0') +                                                    // crackling static fur
        e(100, 122, 44, 38, '#8a8af8', none) + e(88, 98, 18, 10, '#b0b0ff', 'stroke="none" opacity=".7"') +
        e(80, 112, 13, 16, '#1a1a40') + e(120, 112, 13, 16, '#1a1a40') + shine(85, 105, 5) + shine(125, 105, 5) + shine(77, 119, 2) + shine(117, 119, 2) +
        e(68, 130, 7, 4, '#d0a0ff', none) + e(132, 130, 7, 4, '#d0a0ff', none) +
        p('M90 136 Q100 145 110 136', 'none') +
        spark(28, 70, 8) + spark(172, 80, 7) + spark(24, 140, 6) + spark(176, 150, 8)),
      // C · Coil gecko
      svg(shadow(54) +
        tube('M126 160 C168 166 182 128 158 120 C138 114 136 146 156 146 C170 146 168 128 158 130', '#8fd84a', 13) +   // spring-coiled tail
        c(170, 116, 9, 'rgba(122,232,255,.35)', none) + c(158, 130, 6, '#7ae8ff') +                // glowing tip
        e(76, 173, 18, 9, '#8fd84a') + e(124, 173, 18, 9, '#8fd84a') +                             // splayed back feet
        c(60, 177, 4, '#e8f8c8') + c(70, 181, 4, '#e8f8c8') + c(140, 181, 4, '#e8f8c8') + c(130, 177, 4, '#e8f8c8') +   // sticky toe pads
        e(100, 140, 31, 35, '#8fd84a') + e(100, 147, 19, 25, '#e8f8c8', 'stroke-width="2"') +
        p('M74 120 L82 126 L74 132 L82 138', 'none', 'stroke="#c8702a" stroke-width="4"') + p('M126 120 L118 126 L126 132 L118 138', 'none', 'stroke="#c8702a" stroke-width="4"') +   // copper zigzags
        e(66, 140, 8, 15, '#8fd84a', 'transform="rotate(25 66 140)"') + e(134, 140, 8, 15, '#8fd84a', 'transform="rotate(-25 134 140)"') +
        p('M58 92 Q60 62 100 58 Q140 62 142 92 Q140 112 100 116 Q60 112 58 92 Z', '#8fd84a') +   // a gecko's wedge of a head
        p('M88 60 L92 66 L96 60 L100 66 L104 60 L108 66 L112 60', 'none', 'stroke="#c8702a" stroke-width="3"') +   // copper crest
        c(64, 86, 15, '#8fd84a') + c(136, 86, 15, '#8fd84a') + c(64, 86, 10, '#ffe066') + c(136, 86, 10, '#ffe066') +   // big round eyes on the sides
        e(64, 86, 2.5, 8, '#1a2a10', none) + e(136, 86, 2.5, 8, '#1a2a10', none) + shine(60, 81, 2.5) + shine(132, 81, 2.5) +
        p('M74 102 Q100 116 126 102', 'none') + p('M95 108 Q100 114 105 108', '#ff7a9a', 'stroke-width="2"') +   // grin, tongue
        c(94, 74, 2, INK, none) + c(106, 74, 2, INK, none)),
    ],

    cinderox: [
      // A · Ember calf
      svg(shadow(56) +
        tube('M142 132 C162 130 170 118 174 104', '#2f4a7a', 7) + flame(176, 104, 26, '#ff7a1c', '#ffd34a') +   // tail with a flame tip
        `<rect x="76" y="148" width="18" height="34" rx="7" fill="#24385e"/><rect x="108" y="148" width="18" height="34" rx="7" fill="#24385e"/>` +   // back legs
        e(100, 134, 54, 34, '#2f4a7a') + e(100, 146, 32, 17, '#f3dd9a', 'stroke-width="2"') +       // body, cream belly
        `<rect x="62" y="150" width="20" height="34" rx="8" fill="#2f4a7a"/><rect x="118" y="150" width="20" height="34" rx="8" fill="#2f4a7a"/>` +   // front legs
        `<rect x="62" y="174" width="20" height="10" rx="4" fill="#16224a"/><rect x="118" y="174" width="20" height="10" rx="4" fill="#16224a"/>` +   // dark hooves
        e(58, 80, 15, 8, '#2f4a7a', 'transform="rotate(-20 58 80)"') + e(142, 80, 15, 8, '#2f4a7a', 'transform="rotate(20 142 80)"') +   // ears
        p('M74 62 Q64 54 62 42 Q72 48 80 56 Z', '#f3e8d0') + p('M126 62 Q136 54 138 42 Q128 48 120 56 Z', '#f3e8d0') +   // stubby horns
        e(100, 86, 38, 33, '#2f4a7a') +                                                             // head
        flame(100, 62, 44, '#ff7a1c', '#ffd34a') +                                                  // flame forelock
        e(100, 106, 25, 16, '#f3dd9a') + e(91, 106, 3, 4, INK, none) + e(109, 106, 3, 4, INK, none) +   // muzzle, nostrils
        p('M72 76 L92 82', 'none', 'stroke-width="4"') + p('M128 76 L108 82', 'none', 'stroke-width="4"') +   // determined brows
        e(84, 88, 6, 7, INK) + e(116, 88, 6, 7, INK) + shine(86, 86, 2.2) + shine(118, 86, 2.2) +
        spark(40, 60, 5, '#ffb06a') + spark(160, 50, 4, '#ffb06a')),
      // B · Lava-shouldered calf
      svg(shadow(58) +
        `<rect x="76" y="148" width="18" height="34" rx="7" fill="#24385e"/><rect x="108" y="148" width="18" height="34" rx="7" fill="#24385e"/>` +
        flame(70, 112, 34, '#ff7a1c', '#ffd34a') + flame(90, 104, 40, '#ff7a1c', '#ffd34a') + flame(112, 104, 40, '#ff7a1c', '#ffd34a') + flame(132, 112, 34, '#ff7a1c', '#ffd34a') +   // flame mane down the neck
        e(100, 136, 56, 34, '#2f4a7a') + e(100, 148, 32, 16, '#f3dd9a', 'stroke-width="2"') +
        p('M40 120 L52 102 L74 100 L84 116 L76 138 L52 140 Z', '#4a3a34') + p('M160 120 L148 102 L126 100 L116 116 L124 138 L148 140 Z', '#4a3a34') +   // rocky shoulders
        p('M54 112 L64 120 L60 130', 'none', 'stroke="#ff7a1c" stroke-width="3"') + p('M146 112 L136 120 L140 130', 'none', 'stroke="#ff7a1c" stroke-width="3"') +   // lava cracks
        `<rect x="62" y="150" width="20" height="34" rx="8" fill="#2f4a7a"/><rect x="118" y="150" width="20" height="34" rx="8" fill="#2f4a7a"/>` +
        `<rect x="62" y="174" width="20" height="10" rx="4" fill="#4a3a34"/><rect x="118" y="174" width="20" height="10" rx="4" fill="#4a3a34"/>` +
        p('M74 64 Q50 60 44 40 Q42 32 48 34 Q54 50 78 54 Z', '#f3e8d0') + p('M126 64 Q150 60 156 40 Q158 32 152 34 Q146 50 122 54 Z', '#f3e8d0') +   // curved horns
        e(100, 84, 36, 31, '#2f4a7a') +
        e(100, 104, 25, 15, '#f3dd9a') + e(91, 104, 3, 4, INK, none) + e(109, 104, 3, 4, INK, none) +
        c(76, 116, 7, '#c8c0cc', 'stroke-width="2"') + c(68, 122, 5, '#e0d8e4', 'stroke-width="2"') + c(124, 116, 7, '#c8c0cc', 'stroke-width="2"') + c(132, 122, 5, '#e0d8e4', 'stroke-width="2"') +   // smoke puffs
        p('M72 74 L92 80', 'none', 'stroke-width="4"') + p('M128 74 L108 80', 'none', 'stroke-width="4"') +
        e(84, 86, 7, 6, '#ffd34a') + e(116, 86, 7, 6, '#ffd34a') + shine(86, 84, 2.5) + shine(118, 84, 2.5)),   // glowing eyes
      // C · Coal calf
      svg(shadow(58) +
        tube('M144 130 C164 128 170 116 172 104', '#3a3236', 7) + c(174, 92, 8, '#9a9098', 'stroke-width="2"') + c(182, 80, 6, '#b8b0b8', 'stroke-width="2"') +   // tail, smoke
        `<rect x="76" y="148" width="18" height="34" rx="7" fill="#2a2226"/><rect x="108" y="148" width="18" height="34" rx="7" fill="#2a2226"/>` +
        e(100, 136, 56, 34, '#3a3236') + e(100, 152, 30, 13, '#ff7a1c', 'stroke-width="2"') + e(100, 152, 18, 7, '#ffd34a', none) +   // ember belly glow
        [[64, 112, 15], [86, 104, 17], [110, 104, 17], [134, 112, 15], [76, 124, 12], [122, 124, 12]].map(([x, y, r]) => p(`M${x - r} ${y} L${x - r * 0.4} ${y - r * 0.9} L${x + r * 0.6} ${y - r * 0.7} L${x + r} ${y + r * 0.2} L${x + r * 0.2} ${y + r * 0.8} L${x - r * 0.7} ${y + r * 0.6} Z`, '#2a2226') + p(`M${x - r * 0.4} ${y - r * 0.2} L${x} ${y + r * 0.2} L${x + r * 0.4} ${y - r * 0.3}`, 'none', 'stroke="#ff7a1c" stroke-width="3"')).join('') +   // a heap of glowing coals
        `<rect x="62" y="150" width="20" height="34" rx="8" fill="#3a3236"/><rect x="118" y="150" width="20" height="34" rx="8" fill="#3a3236"/>` +
        p('M76 64 Q70 54 72 46 Q80 52 82 58 Z', '#c8b8a0') + p('M124 64 Q130 54 128 46 Q120 52 118 58 Z', '#c8b8a0') +   // horn nubs
        e(100, 86, 36, 31, '#3a3236') + e(100, 105, 24, 15, '#e8c890') + e(91, 105, 3, 4, INK, none) + e(109, 105, 3, 4, INK, none) +
        e(84, 86, 7, 5, '#ff9a3a') + e(116, 86, 7, 5, '#ff9a3a') + shine(86, 85, 2)),
    ],

    lumawool: [
      // A · Storm lamb
      svg(shadow(56) +
        `<rect x="74" y="156" width="12" height="30" rx="4" fill="#2a2230"/><rect x="114" y="156" width="12" height="30" rx="4" fill="#2a2230"/>` +   // legs
        puff([[60, 132, 26], [100, 140, 34], [140, 132, 26], [72, 104, 24], [128, 104, 24], [100, 82, 30], [74, 80, 20], [126, 80, 20]], '#6a7488', '#8a94a8') +   // storm-cloud wool, a hood over the head
        bolt(56, 118, 34) + bolt(146, 116, 30) + bolt(102, 148, 26) +                               // lightning flickering inside
        curl(80, 92, 16, -1, '#c8ccd8') + curl(120, 92, 16, 1, '#c8ccd8') +                         // curled silver horns
        e(72, 112, 13, 6, '#f2eee6', 'transform="rotate(25 72 112)"') + e(128, 112, 13, 6, '#f2eee6', 'transform="rotate(-25 128 112)"') +   // floppy ears
        e(100, 112, 22, 26, '#f2eee6') +                                                            // pale lamb face
        e(91, 108, 4.5, 5.5, '#2a2a3a') + e(109, 108, 4.5, 5.5, '#2a2a3a') + shine(92.5, 106, 1.8) + shine(110.5, 106, 1.8) +
        p('M96 121 L104 121 L100 126 Z', '#e89aa8', 'stroke-width="2"') + p('M100 126 L100 130 M100 130 Q96 133 93 131 M100 130 Q104 133 107 131', 'none', 'stroke-width="2"')),
      // B · Lantern alpaca
      svg(shadow(46) +
        `<rect x="70" y="146" width="12" height="38" rx="5" fill="#e8d8b8"/><rect x="118" y="146" width="12" height="38" rx="5" fill="#e8d8b8"/>` +
        `<rect x="82" y="150" width="12" height="34" rx="5" fill="#d8c8a4"/><rect x="106" y="150" width="12" height="34" rx="5" fill="#d8c8a4"/>` +
        puff([[72, 138, 20], [100, 132, 24], [128, 138, 20], [86, 150, 18], [114, 150, 18]], '#fff3dc', '#ffffff') +   // fluffy body
        `<rect x="84" y="66" width="32" height="76" rx="16" fill="#fff3dc"/>` +                     // long neck
        `<rect x="82" y="102" width="36" height="9" rx="4" fill="#b03a3a"/>` +                      // red collar
        c(100, 124, 15, 'rgba(122,232,255,.3)', none) + `<path d="M90 112 L110 112 L114 130 L86 130 Z" fill="#d8a040"/>` + `<rect x="94" y="116" width="12" height="10" rx="2" fill="#7ae8ff" stroke-width="2"/>` + shine(97, 118, 1.5) +   // brass lantern-bell, glowing blue
        p('M76 46 Q70 24 78 16 Q86 28 86 44 Z', '#fff3dc') + p('M124 46 Q130 24 122 16 Q114 28 114 44 Z', '#fff3dc') +   // banana ears
        e(100, 60, 26, 24, '#fff3dc') +                                                             // head
        puff([[88, 38, 10], [100, 34, 12], [112, 38, 10]], '#ffffff', '#ffffff') +                  // tuft over the eyes
        e(89, 58, 5, 6, '#3a2a1a') + e(111, 58, 5, 6, '#3a2a1a') + shine(90.5, 56, 2) + shine(112.5, 56, 2) +
        p('M83 52 L80 49 M86 51 L85 47 M117 52 L120 49 M114 51 L115 47', 'none', 'stroke-width="2"') +   // lashes
        e(100, 74, 12, 8, '#e8d8b8', 'stroke-width="2"') + p('M100 72 L100 77 M95 79 Q100 82 105 79', 'none', 'stroke-width="2"')),
      // C · Static goat
      svg(shadow(54) +
        `<rect x="72" y="150" width="12" height="34" rx="4" fill="#8a7a9a"/><rect x="116" y="150" width="12" height="34" rx="4" fill="#8a7a9a"/>` +
        `<rect x="72" y="176" width="12" height="8" rx="3" fill="#2a2230"/><rect x="116" y="176" width="12" height="8" rx="3" fill="#2a2230"/>` +
        e(100, 140, 48, 28, '#8a7a9a') +                                                            // body
        p('M60 120 L54 96 M74 112 L72 86 M90 108 L92 80 M110 108 L108 80 M126 112 L128 86 M140 120 L146 96', 'none', 'stroke="#f0ecf8" stroke-width="4"') +   // wool standing on end
        puff([[64, 126, 16], [84, 118, 18], [104, 116, 18], [124, 120, 17], [140, 130, 14]], '#f0ecf8', '#ffffff') +   // fluffy wool tufts
        spark(52, 92, 6, '#7ae8ff') + spark(150, 92, 6, '#7ae8ff') +
        curl(86, 60, 18, -1, '#d8823a') + curl(114, 60, 18, 1, '#d8823a') + spark(64, 88, 6, '#7ae8ff') + spark(136, 88, 6, '#7ae8ff') +   // copper ram horns, crackling
        e(70, 78, 12, 5, '#8a7a9a', 'transform="rotate(-15 70 78)"') + e(130, 78, 12, 5, '#8a7a9a', 'transform="rotate(15 130 78)"') +   // ears
        e(100, 82, 22, 26, '#8a7a9a') + puff([[92, 58, 9], [100, 55, 10], [108, 58, 9]], '#f0ecf8', '#ffffff') +   // head, woolly forelock
        e(90, 80, 6, 5, '#ffe066') + e(110, 80, 6, 5, '#ffe066') + `<rect x="86" y="79" width="8" height="2.5" fill="${INK}" stroke="none"/><rect x="106" y="79" width="8" height="2.5" fill="${INK}" stroke="none"/>` +   // goat eyes, sideways pupils
        e(100, 98, 9, 6, '#b0a4c0', 'stroke-width="2"') + p('M96 98 L98 98 M102 98 L104 98', 'none', 'stroke-width="2"') +
        p('M92 106 Q100 132 108 106 Z', '#f0ecf8')),                                                // stubborn little beard
    ],
  };
})();
