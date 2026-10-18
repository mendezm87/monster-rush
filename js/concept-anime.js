// Anime-style illustrations of the redesign concepts (js/concepts.js), the owner's request:
// cel shading (each big shape gets a hard-edged shadow on the side away from the light, top-left),
// glossy anime eyes (a dark-to-bright iris, a big and a small highlight, a heavy upper lash),
// blush marks, and a dramatic background for the monster's type, like an introduction shot.
// SVG; only redesign.html loads this.

const CONCEPT_ANIME = (() => {
  const INK = '#1e1428';
  let uid = 0, D = [];
  const nid = () => 'an' + (uid++);
  const start = () => { D = []; };
  const finish = body => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><defs>${D.join('')}</defs>${body}</svg>`;
  const grad = (kind, stops, a) => { const i = nid(); D.push(`<${kind}Gradient id="${i}" ${a}>${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</${kind}Gradient>`); return `url(#${i})`; };
  const lin = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => grad('linear', stops, `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`);
  const rad = (stops, cx = 0.5, cy = 0.5, r = 0.6) => grad('radial', stops, `cx="${cx}" cy="${cy}" r="${r}"`);
  // shapes, left open so a fill can be added (cel() uses each one several times)
  const E = (cx, cy, rx, ry, t = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${t ? ` transform="${t}"` : ''}`;
  const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"`;
  const R = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
  const PT = d => `<path d="${d}"`;
  const SP = (cx, cy, r1, r2, n) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.95).toFixed(1)}`); } return `<polygon points="${pts.join(' ')}"`; };
  const fill = (shape, color, extra = '') => `${shape} fill="${color}" ${extra}/>`;
  const flat = (shape, color) => fill(shape, color, 'stroke="none"');
  // cel shading: the shape in its shadow colour, the lit part (the shape nudged up-left) on top,
  // a soft sheen near the top-left, then the ink outline
  function cel(shape, base, shade, dx = 7, dy = 6, sheen = true) {
    const i = nid();
    D.push(`<clipPath id="${i}">${shape}/></clipPath>`);
    return `<g clip-path="url(#${i})">${flat(shape, shade)}<g transform="translate(${-dx} ${-dy})">${flat(shape, base)}</g>` +
      (sheen ? `<g transform="translate(${-dx * 2.4} ${-dy * 2.4})" opacity=".22">${flat(shape, '#ffffff')}</g><g transform="translate(${-dx * 1.4} ${-dy * 1.4})">${flat(shape, base)}</g>` : '') +
      `</g>${fill(shape, 'none')}`;
  }
  // a glossy anime eye: white, a gradient iris (dark at the top), pupil, two highlights, heavy upper lash
  function eye(cx, cy, w, h, top, bottom, lash = true) {
    const g = lin([[0, top], [1, bottom]]);
    return fill(E(cx, cy, w, h), '#ffffff', 'stroke-width="2"') +
      flat(E(cx, cy + h * 0.1, w * 0.8, h * 0.85), g) + flat(E(cx, cy + h * 0.16, w * 0.38, h * 0.42), INK) +
      flat(E(cx - w * 0.32, cy - h * 0.32, w * 0.34, h * 0.26), '#ffffff') + flat(C(cx + w * 0.3, cy + h * 0.38, w * 0.15), '#ffffff') +
      (lash ? `<path d="M${cx - w * 1.1} ${cy - h * 0.25} Q${cx} ${cy - h * 1.35} ${cx + w * 1.1} ${cy - h * 0.35}" fill="none" stroke-width="4"/>` : '');
  }
  const blush = (x, y) => [0, 1, 2].map(k => `<path d="M${x - 6 + k * 5} ${y + 3} L${x - 3 + k * 5} ${y - 3}" stroke="#ff6a8a" stroke-width="2"/>`).join('') + flat(E(x, y, 9, 4), 'rgba(255,120,150,.35)');
  const tube = (d, color, w, shade) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${shade || color}" stroke-width="${w}"/>` + (shade ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w * 0.55}" transform="translate(-1.5 -1.5)"/>` : '');
  const flame = (x, y, s, outer, inner, core = '#fff6c0') => {
    const f = (k, col, inked) => `<path d="M${x - 0.42 * s * k} ${y} Q${x - 0.6 * s * k} ${y - 0.55 * s * k} ${x - 0.2 * s * k} ${y - 0.85 * s * k} Q${x - 0.12 * s * k} ${y - 0.55 * s * k} ${x + 0.05 * s * k} ${y - 1.05 * s * k} Q${x + 0.38 * s * k} ${y - 0.6 * s * k} ${x + 0.28 * s * k} ${y - 0.45 * s * k} Q${x + 0.55 * s * k} ${y - 0.6 * s * k} ${x + 0.46 * s * k} ${y - 0.25 * s * k} Q${x + 0.5 * s * k} ${y} ${x} ${y} Z" fill="${col}" ${inked ? '' : 'stroke="none"'}/>`;
    return f(1, outer, true) + f(0.66, inner, false) + f(0.34, core, false);
  };
  const bolt = (x, y, s, col = '#ffe680') => `<path d="M${x} ${y} L${x - 0.35 * s} ${y + 0.55 * s} L${x - 0.05 * s} ${y + 0.5 * s} L${x - 0.2 * s} ${y + s} L${x + 0.35 * s} ${y + 0.4 * s} L${x + 0.05 * s} ${y + 0.45 * s} L${x + 0.2 * s} ${y} Z" fill="${col}" stroke-width="2"/>`;
  const spark = (x, y, s, col = '#fff6b0') => `<path d="M${x} ${y - s} L${x + s * 0.25} ${y - s * 0.25} L${x + s} ${y} L${x + s * 0.25} ${y + s * 0.25} L${x} ${y + s} L${x - s * 0.25} ${y + s * 0.25} L${x - s} ${y} L${x - s * 0.25} ${y - s * 0.25} Z" fill="${col}" stroke="none"/>`;
  const glow = (x, y, r, col) => flat(C(x, y, r), rad([[0, col], [1, 'rgba(255,255,255,0)']]));
  const puff = (pts, base, shade) => pts.map(([x, y, r]) => cel(C(x, y, r), base, shade, r * 0.22, r * 0.2)).join('');
  const curl = (x, y, s, dir, color, shade) => tube(`M${x} ${y} C${x + dir * 0.9 * s} ${y - 0.9 * s} ${x + dir * 1.9 * s} ${y + 0.1 * s} ${x + dir * 1.4 * s} ${y + 0.85 * s} C${x + dir * 1.0 * s} ${y + 1.25 * s} ${x + dir * 0.55 * s} ${y + 0.8 * s} ${x + dir * 0.85 * s} ${y + 0.5 * s}`, color, 9, shade);
  const shadow = (rx = 54) => flat(E(100, 188, rx, 7), 'rgba(0,0,0,.28)');
  // dramatic backgrounds, one per mood
  const speedLines = (col, n = 26) => { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, w = i % 3 ? 0.035 : 0.07; s += `<path d="M100 96 L${100 + Math.cos(a - w) * 200} ${96 + Math.sin(a - w) * 200} L${100 + Math.cos(a + w) * 200} ${96 + Math.sin(a + w) * 200} Z" fill="${col}" stroke="none"/>`; } return s; };
  const BG = {
    electric: () => flat(R(0, 0, 200, 200, 0), rad([[0, '#fffbd0'], [0.4, '#7ae0ff'], [1, '#2a3480']], 0.5, 0.48, 0.75)) + speedLines('rgba(255,255,255,.2)'),
    fire: () => flat(R(0, 0, 200, 200, 0), rad([[0, '#fff0a0'], [0.35, '#ff9a3a'], [1, '#6a1420']], 0.5, 0.5, 0.75)) + speedLines('rgba(255,230,160,.18)') +
      [[22, 40, 3], [176, 30, 2.5], [160, 150, 3], [30, 150, 2], [60, 20, 2], [150, 80, 2]].map(([x, y, r]) => flat(C(x, y, r), '#ffe680')).join(''),
    storm: () => flat(R(0, 0, 200, 200, 0), lin([[0, '#1e2438'], [1, '#56607e']])) +
      [...Array(16)].map((_, i) => `<path d="M${(i * 37) % 210} ${(i * 53) % 120} l-8 22" stroke="rgba(200,215,255,.3)" stroke-width="1.5"/>`).join('') + bolt(176, 6, 46, 'rgba(255,240,160,.55)'),
    sky: () => flat(R(0, 0, 200, 200, 0), lin([[0, '#9ad8ff'], [0.7, '#e8f6ff'], [1, '#fff0f6']])) +
      [[30, 30, 7], [170, 40, 6], [150, 18, 4], [40, 70, 4], [176, 90, 5]].map(([x, y, s]) => spark(x, y, s, '#ffffff')).join('') +
      flat(E(46, 150, 50, 12), 'rgba(255,255,255,.7)') + flat(E(160, 160, 44, 10), 'rgba(255,255,255,.7)'),
    dusk: () => flat(R(0, 0, 200, 200, 0), lin([[0, '#2e2050'], [0.6, '#8a5aa0'], [1, '#e0a0b0']])) +
      [[24, 30], [176, 24], [160, 70], [30, 90]].map(([x, y]) => `<path d="M${x} ${y} l6 6 l-4 2 l6 7" fill="none" stroke="#7ae8ff" stroke-width="2"/>`).join(''),
  };
  // the body is built (its clip paths and gradients collected) before this runs, so clear them after, not before
  const art = (bg, body) => { const out = finish(BG[bg]() + body); start(); return out; };

  return {
    sparkit: [
      // A · Plug ferret: long, slim and wiry, mid-bounce, tail flicked up into its copper plug
      art('electric', shadow(48) +
        tube('M122 150 C164 152 176 124 164 94', '#3ec9c0', 12, '#2a9a94') +
        glow(163, 70, 24, 'rgba(255,250,180,.9)') +
        cel(R(150, 74, 26, 24, 5), '#f0a050', '#b0601e', 4, 4) + cel(R(154, 54, 6, 21, 2), '#ffd08a', '#c88040', 2, 2, false) + cel(R(166, 54, 6, 21, 2), '#ffd08a', '#c88040', 2, 2, false) +
        spark(188, 62, 9) + spark(140, 58, 6) + spark(176, 40, 5) +
        cel(E(82, 177, 15, 8), '#2a9a94', '#1a6a66', 3, 3, false) + cel(E(118, 177, 15, 8), '#2a9a94', '#1a6a66', 3, 3, false) +
        cel(E(100, 134, 28, 42), '#3ec9c0', '#2a9a94') + cel(E(100, 144, 17, 30), '#fbf4e2', '#e0d0b0', 4, 4) +
        cel(E(70, 126, 7, 15, 'rotate(25 70 126)'), '#3ec9c0', '#2a9a94', 3, 3, false) + cel(E(130, 126, 7, 15, 'rotate(-25 130 126)'), '#3ec9c0', '#2a9a94', 3, 3, false) +
        cel(C(72, 54, 9), '#3ec9c0', '#2a9a94', 3, 3, false) + cel(C(128, 54, 9), '#3ec9c0', '#2a9a94', 3, 3, false) + flat(C(72, 55, 4.5), '#ff9ab0') + flat(C(128, 55, 4.5), '#ff9ab0') +
        cel(E(100, 78, 38, 28), '#3ec9c0', '#2a9a94') +
        cel(PT('M84 52 L88 26 L96 42 L102 16 L109 38 L118 24 L116 52 Z'), '#f0fffc', '#9ae8e0', 3, 3, false) +
        flat(PT('M64 72 Q100 62 136 72 Q134 86 118 84 Q100 80 82 84 Q66 86 64 72 Z'), 'rgba(22,96,92,.85)') +
        eye(84, 76, 9, 11, '#3a1a6a', '#b07af0') + eye(116, 76, 9, 11, '#3a1a6a', '#b07af0') +
        blush(72, 92) + blush(128, 92) +
        cel(E(100, 94, 15, 10), '#fbf4e2', '#e0d0b0', 3, 3, false) + fill(E(100, 88, 4.5, 3), '#ff6a8a', 'stroke-width="2"') +
        fill(PT('M93 96 Q100 106 107 96 Z'), '#c8304a', 'stroke-width="2"') + flat(PT('M96 100 Q100 104 104 100 Z'), '#ff8aa0')),
      // B · Static puff: a crackling fuzzball, eyes shining, bulb blazing
      art('electric', shadow(48) +
        cel(E(80, 179, 15, 8), '#3a3aa0', '#24246a', 3, 3, false) + cel(E(120, 179, 15, 8), '#3a3aa0', '#24246a', 3, 3, false) +
        `<line x1="100" y1="58" x2="100" y2="26" stroke-width="5"/>` + glow(100, 22, 30, 'rgba(255,240,150,.95)') + cel(C(100, 22, 10), '#fff2a0', '#e0b030', 3, 3) +
        cel(SP(100, 116, 66, 54, 15), '#6a6af0', '#4646c0', 9, 8) +
        flat(E(100, 122, 42, 36), 'rgba(160,160,255,.35)') +
        eye(80, 110, 14, 18, '#1a1a60', '#5ae0ff', false) + eye(120, 110, 14, 18, '#1a1a60', '#5ae0ff', false) +
        blush(66, 132) + blush(134, 132) +
        fill(PT('M92 136 Q100 146 108 136 Z'), '#c8304a', 'stroke-width="2"') +
        spark(26, 66, 11) + spark(174, 76, 9) + spark(22, 140, 8) + spark(178, 148, 11) + spark(150, 30, 6) + spark(46, 32, 6)),
      // C · Coil gecko: clinging low, wedge head up, tail sprung and sparking
      art('electric', shadow(56) +
        tube('M126 160 C168 166 182 128 158 120 C138 114 136 146 156 146 C170 146 168 128 158 130', '#8fd84a', 12, '#5aa02a') +
        glow(158, 130, 18, 'rgba(160,240,255,.9)') + cel(C(158, 130, 6), '#bff6ff', '#2ab0d8', 2, 2, false) +
        cel(E(76, 173, 18, 9), '#8fd84a', '#5aa02a', 3, 3, false) + cel(E(124, 173, 18, 9), '#8fd84a', '#5aa02a', 3, 3, false) +
        [[60, 177], [70, 181], [140, 181], [130, 177]].map(([x, y]) => fill(C(x, y, 4), '#f0fbd8', 'stroke-width="2"')).join('') +
        cel(E(100, 140, 31, 35), '#8fd84a', '#5aa02a') + cel(E(100, 147, 19, 25), '#f0fbd8', '#cfe8a8', 3, 3, false) +
        `<path d="M74 120 L82 126 L74 132 L82 138" fill="none" stroke="#c8702a" stroke-width="4"/><path d="M126 120 L118 126 L126 132 L118 138" fill="none" stroke="#c8702a" stroke-width="4"/>` +
        cel(E(66, 140, 8, 15, 'rotate(25 66 140)'), '#8fd84a', '#5aa02a', 3, 3, false) + cel(E(134, 140, 8, 15, 'rotate(-25 134 140)'), '#8fd84a', '#5aa02a', 3, 3, false) +
        cel(PT('M58 92 Q60 62 100 58 Q140 62 142 92 Q140 112 100 116 Q60 112 58 92 Z'), '#8fd84a', '#5aa02a') +
        `<path d="M88 60 L92 66 L96 60 L100 66 L104 60 L108 66 L112 60" fill="none" stroke="#c8702a" stroke-width="3"/>` +
        cel(C(64, 86, 15), '#8fd84a', '#5aa02a', 3, 3, false) + cel(C(136, 86, 15), '#8fd84a', '#5aa02a', 3, 3, false) +
        fill(C(64, 86, 11), lin([[0, '#ffb020'], [1, '#fff27a']]), 'stroke-width="2"') + fill(C(136, 86, 11), lin([[0, '#ffb020'], [1, '#fff27a']]), 'stroke-width="2"') +
        flat(E(64, 87, 2.5, 9), INK) + flat(E(136, 87, 2.5, 9), INK) + flat(E(59, 80, 3.5, 3), '#ffffff') + flat(E(131, 80, 3.5, 3), '#ffffff') +
        blush(80, 104) + blush(120, 104) +
        fill(PT('M74 102 Q100 118 126 102 Q100 110 74 102 Z'), '#c8304a', 'stroke-width="2"') + flat(PT('M95 109 Q100 114 105 109 Z'), '#ff8aa0') +
        flat(C(94, 74, 2), INK) + flat(C(106, 74, 2), INK)),
    ],

    cinderox: [
      // A · Ember calf: head lowered, flame forelock roaring, ready to charge
      art('fire', shadow(58) +
        tube('M142 132 C162 130 170 118 174 104', '#2f4a7a', 7, '#24385e') + flame(176, 104, 30, '#ff6a1c', '#ffb02a') +
        cel(R(76, 148, 18, 34, 7), '#24385e', '#18284a', 3, 3, false) + cel(R(108, 148, 18, 34, 7), '#24385e', '#18284a', 3, 3, false) +
        cel(E(100, 134, 54, 34), '#3a5890', '#26406a') + cel(E(100, 147, 32, 16), '#f6e2a4', '#d4b56a', 4, 4) +
        cel(R(62, 150, 20, 34, 8), '#3a5890', '#26406a', 3, 3, false) + cel(R(118, 150, 20, 34, 8), '#3a5890', '#26406a', 3, 3, false) +
        fill(R(62, 174, 20, 10, 4), '#16224a') + fill(R(118, 174, 20, 10, 4), '#16224a') +
        cel(E(58, 82, 15, 8, 'rotate(-20 58 82)'), '#3a5890', '#26406a', 3, 3, false) + cel(E(142, 82, 15, 8, 'rotate(20 142 82)'), '#3a5890', '#26406a', 3, 3, false) +
        cel(PT('M74 64 Q64 56 62 44 Q72 50 80 58 Z'), '#fff6e0', '#c8b490', 2, 2, false) + cel(PT('M126 64 Q136 56 138 44 Q128 50 120 58 Z'), '#fff6e0', '#c8b490', 2, 2, false) +
        cel(E(100, 88, 38, 33), '#3a5890', '#26406a') +
        flame(100, 64, 52, '#ff6a1c', '#ffb02a') +
        cel(E(100, 108, 25, 16), '#f6e2a4', '#d4b56a', 3, 3, false) + flat(E(91, 108, 3, 4), INK) + flat(E(109, 108, 3, 4), INK) +
        `<path d="M70 76 L93 84" stroke-width="5"/><path d="M130 76 L107 84" stroke-width="5"/>` +
        eye(84, 91, 8, 8, '#7a1a10', '#ffb02a', false) + eye(116, 91, 8, 8, '#7a1a10', '#ffb02a', false) +
        spark(36, 56, 6, '#ffd08a') + spark(164, 46, 5, '#ffd08a') + spark(40, 120, 4, '#ffd08a')),
      // B · Lava-shouldered calf: braced, lava glowing through cracked rock, smoke snorting
      art('fire', shadow(60) +
        cel(R(76, 148, 18, 34, 7), '#24385e', '#18284a', 3, 3, false) + cel(R(108, 148, 18, 34, 7), '#24385e', '#18284a', 3, 3, false) +
        flame(70, 112, 38, '#ff6a1c', '#ffb02a') + flame(90, 104, 46, '#ff6a1c', '#ffb02a') + flame(112, 104, 46, '#ff6a1c', '#ffb02a') + flame(132, 112, 38, '#ff6a1c', '#ffb02a') +
        cel(E(100, 136, 56, 34), '#3a5890', '#26406a') + cel(E(100, 148, 32, 16), '#f6e2a4', '#d4b56a', 4, 4) +
        glow(60, 122, 26, 'rgba(255,140,40,.7)') + glow(140, 122, 26, 'rgba(255,140,40,.7)') +
        cel(PT('M40 120 L52 102 L74 100 L84 116 L76 138 L52 140 Z'), '#5a4840', '#3a2c26', 5, 5) + cel(PT('M160 120 L148 102 L126 100 L116 116 L124 138 L148 140 Z'), '#5a4840', '#3a2c26', 5, 5) +
        `<path d="M54 110 L64 120 L58 132 M64 120 L74 118" fill="none" stroke="#ffb02a" stroke-width="3"/><path d="M146 110 L136 120 L142 132 M136 120 L126 118" fill="none" stroke="#ffb02a" stroke-width="3"/>` +
        cel(R(62, 150, 20, 34, 8), '#3a5890', '#26406a', 3, 3, false) + cel(R(118, 150, 20, 34, 8), '#3a5890', '#26406a', 3, 3, false) +
        fill(R(62, 174, 20, 10, 4), '#4a3a34') + fill(R(118, 174, 20, 10, 4), '#4a3a34') +
        cel(PT('M74 66 Q50 62 44 42 Q42 34 48 36 Q54 52 78 56 Z'), '#fff6e0', '#c8b490', 2, 2, false) + cel(PT('M126 66 Q150 62 156 42 Q158 34 152 36 Q146 52 122 56 Z'), '#fff6e0', '#c8b490', 2, 2, false) +
        cel(E(100, 86, 36, 31), '#3a5890', '#26406a') +
        cel(E(100, 106, 25, 15), '#f6e2a4', '#d4b56a', 3, 3, false) + flat(E(91, 106, 3, 4), INK) + flat(E(109, 106, 3, 4), INK) +
        puff([[74, 118, 7], [64, 124, 5], [126, 118, 7], [136, 124, 5]], '#e8e0ec', '#a8a0b0') +
        `<path d="M70 74 L93 82" stroke-width="5"/><path d="M130 74 L107 82" stroke-width="5"/>` +
        glow(84, 89, 12, 'rgba(255,230,120,.8)') + glow(116, 89, 12, 'rgba(255,230,120,.8)') +
        fill(E(84, 89, 8, 6), '#ffe066', 'stroke-width="2"') + fill(E(116, 89, 8, 6), '#ffe066', 'stroke-width="2"') + flat(E(82, 87, 3, 2), '#ffffff') + flat(E(114, 87, 3, 2), '#ffffff')),
      // C · Coal calf: smouldering, coals glowing through the soot
      art('fire', shadow(60) +
        tube('M144 130 C164 128 170 116 172 104', '#3a3236', 7, '#2a2226') + puff([[174, 92, 8], [182, 78, 6], [176, 66, 5]], '#b8b0b8', '#7a7078') +
        cel(R(76, 148, 18, 34, 7), '#2a2226', '#1a1416', 3, 3, false) + cel(R(108, 148, 18, 34, 7), '#2a2226', '#1a1416', 3, 3, false) +
        cel(E(100, 136, 56, 34), '#443a40', '#2a2226') +
        glow(100, 152, 40, 'rgba(255,150,40,.8)') + fill(E(100, 152, 30, 13), lin([[0, '#ffd34a'], [1, '#ff6a1c']]), 'stroke-width="2"') +
        [[64, 112, 15], [86, 104, 17], [110, 104, 17], [134, 112, 15], [76, 124, 12], [122, 124, 12]].map(([x, y, r]) =>
          cel(PT(`M${x - r} ${y} L${x - r * 0.4} ${y - r * 0.9} L${x + r * 0.6} ${y - r * 0.7} L${x + r} ${y + r * 0.2} L${x + r * 0.2} ${y + r * 0.8} L${x - r * 0.7} ${y + r * 0.6} Z`), '#3a3034', '#1e181a', 3, 3, false) +
          `<path d="M${x - r * 0.4} ${y - r * 0.2} L${x} ${y + r * 0.2} L${x + r * 0.4} ${y - r * 0.3}" fill="none" stroke="#ffb02a" stroke-width="3"/>`).join('') +
        cel(R(62, 150, 20, 34, 8), '#443a40', '#2a2226', 3, 3, false) + cel(R(118, 150, 20, 34, 8), '#443a40', '#2a2226', 3, 3, false) +
        cel(PT('M76 66 Q70 56 72 48 Q80 54 82 60 Z'), '#e0d0b8', '#a8987e', 2, 2, false) + cel(PT('M124 66 Q130 56 128 48 Q120 54 118 60 Z'), '#e0d0b8', '#a8987e', 2, 2, false) +
        cel(E(100, 88, 36, 31), '#443a40', '#2a2226') + cel(E(100, 107, 24, 15), '#ecd0a0', '#c0a070', 3, 3, false) + flat(E(91, 107, 3, 4), INK) + flat(E(109, 107, 3, 4), INK) +
        glow(84, 88, 12, 'rgba(255,170,60,.8)') + glow(116, 88, 12, 'rgba(255,170,60,.8)') +
        fill(E(84, 88, 8, 6), '#ffb04a', 'stroke-width="2"') + fill(E(116, 88, 8, 6), '#ffb04a', 'stroke-width="2"') + flat(E(82, 86, 3, 2), '#fff0c0') + flat(E(114, 86, 3, 2), '#fff0c0')),
    ],

    lumawool: [
      // A · Storm lamb: a thundercloud with a sweet face, lightning crackling through the wool
      art('storm', shadow(58) +
        cel(R(74, 156, 12, 30, 4), '#2a2230', '#141018', 2, 2, false) + cel(R(114, 156, 12, 30, 4), '#2a2230', '#141018', 2, 2, false) +
        puff([[60, 132, 26], [100, 140, 34], [140, 132, 26], [72, 104, 24], [128, 104, 24], [100, 82, 30], [74, 80, 20], [126, 80, 20]], '#7a849a', '#4e566c') +
        glow(56, 132, 22, 'rgba(255,240,160,.6)') + glow(146, 130, 20, 'rgba(255,240,160,.6)') +
        bolt(56, 118, 34) + bolt(146, 116, 30) + bolt(102, 148, 26) +
        curl(80, 92, 16, -1, '#e0e4ee', '#9aa0b0') + curl(120, 92, 16, 1, '#e0e4ee', '#9aa0b0') +
        cel(E(72, 112, 13, 6, 'rotate(25 72 112)'), '#f6f2ea', '#d0c8bc', 2, 2, false) + cel(E(128, 112, 13, 6, 'rotate(-25 128 112)'), '#f6f2ea', '#d0c8bc', 2, 2, false) +
        cel(E(100, 112, 22, 26), '#f6f2ea', '#d6cec2', 5, 4) +
        eye(91, 108, 6, 8, '#1e1e3a', '#7a8ad8') + eye(109, 108, 6, 8, '#1e1e3a', '#7a8ad8') +
        blush(84, 121) + blush(116, 121) +
        fill(PT('M96 121 L104 121 L100 125 Z'), '#e89aa8', 'stroke-width="2"') + `<path d="M100 125 L100 128 M100 128 Q96 132 93 130 M100 128 Q104 132 107 130" fill="none" stroke-width="2"/>`),
      // B · Lantern alpaca: tall, fluffy and serene, lantern-bell glowing at its throat
      art('sky', shadow(48) +
        cel(R(70, 146, 12, 38, 5), '#f0e2c4', '#cdb894', 2, 2, false) + cel(R(118, 146, 12, 38, 5), '#f0e2c4', '#cdb894', 2, 2, false) +
        cel(R(82, 150, 12, 34, 5), '#e0d0ac', '#bca880', 2, 2, false) + cel(R(106, 150, 12, 34, 5), '#e0d0ac', '#bca880', 2, 2, false) +
        puff([[72, 138, 20], [100, 132, 24], [128, 138, 20], [86, 150, 18], [114, 150, 18]], '#fff6e4', '#e2cfa8') +
        cel(R(84, 66, 32, 76, 16), '#fff6e4', '#e2cfa8', 6, 0) +
        cel(R(82, 102, 36, 9, 4), '#c84848', '#902a2a', 2, 2, false) +
        glow(100, 124, 26, 'rgba(122,232,255,.85)') +
        cel(PT('M90 112 L110 112 L114 130 L86 130 Z'), '#f0b850', '#a87428', 3, 3, false) + fill(R(94, 116, 12, 10, 2), '#bff6ff', 'stroke-width="2"') +
        cel(PT('M76 46 Q70 24 78 16 Q86 28 86 44 Z'), '#fff6e4', '#e2cfa8', 2, 2, false) + cel(PT('M124 46 Q130 24 122 16 Q114 28 114 44 Z'), '#fff6e4', '#e2cfa8', 2, 2, false) +
        cel(E(100, 60, 26, 24), '#fff6e4', '#e2cfa8', 5, 4) +
        puff([[88, 38, 10], [100, 34, 12], [112, 38, 10]], '#ffffff', '#e8dcc8') +
        eye(89, 59, 6, 7, '#3a2210', '#c08a50') + eye(111, 59, 6, 7, '#3a2210', '#c08a50') +
        `<path d="M80 52 L77 48 M83 50 L82 46 M120 52 L123 48 M117 50 L118 46" stroke-width="2"/>` +
        blush(82, 70) + blush(118, 70) +
        cel(E(100, 75, 12, 8), '#f0e2c4', '#cdb894', 2, 2, false) + `<path d="M100 73 L100 78 M95 80 Q100 83 105 80" fill="none" stroke-width="2"/>`),
      // C · Static goat: wool standing on end, horns crackling, stubborn glare
      art('dusk', shadow(56) +
        cel(R(72, 150, 12, 34, 4), '#9a8aac', '#6a5a80', 2, 2, false) + cel(R(116, 150, 12, 34, 4), '#9a8aac', '#6a5a80', 2, 2, false) +
        fill(R(72, 176, 12, 8, 3), '#2a2230') + fill(R(116, 176, 12, 8, 3), '#2a2230') +
        cel(E(100, 140, 48, 28), '#9a8aac', '#6a5a80') +
        `<path d="M60 120 L54 96 M74 112 L72 86 M90 108 L92 80 M110 108 L108 80 M126 112 L128 86 M140 120 L146 96" fill="none" stroke="#f6f2fc" stroke-width="4"/>` +
        puff([[64, 126, 16], [84, 118, 18], [104, 116, 18], [124, 120, 17], [140, 130, 14]], '#f6f2fc', '#cfc6e0') +
        spark(52, 92, 8, '#bff6ff') + spark(150, 92, 8, '#bff6ff') + spark(100, 74, 6, '#bff6ff') +
        curl(86, 60, 18, -1, '#e8924a', '#a85a20') + curl(114, 60, 18, 1, '#e8924a', '#a85a20') +
        glow(64, 88, 12, 'rgba(122,232,255,.8)') + glow(136, 88, 12, 'rgba(122,232,255,.8)') + spark(64, 88, 7, '#ffffff') + spark(136, 88, 7, '#ffffff') +
        cel(E(70, 78, 12, 5, 'rotate(-15 70 78)'), '#9a8aac', '#6a5a80', 2, 2, false) + cel(E(130, 78, 12, 5, 'rotate(15 130 78)'), '#9a8aac', '#6a5a80', 2, 2, false) +
        cel(E(100, 82, 22, 26), '#9a8aac', '#6a5a80', 5, 4) + puff([[92, 58, 9], [100, 55, 10], [108, 58, 9]], '#f6f2fc', '#cfc6e0') +
        `<path d="M80 72 L95 77" stroke-width="4"/><path d="M120 72 L105 77" stroke-width="4"/>` +
        fill(E(90, 81, 7, 5.5), lin([[0, '#e0a020'], [1, '#fff27a']]), 'stroke-width="2"') + fill(E(110, 81, 7, 5.5), lin([[0, '#e0a020'], [1, '#fff27a']]), 'stroke-width="2"') +
        flat(R(85, 80, 10, 2.6, 1), INK) + flat(R(105, 80, 10, 2.6, 1), INK) + flat(C(88, 78.5, 1.4), '#ffffff') + flat(C(108, 78.5, 1.4), '#ffffff') +
        cel(E(100, 98, 9, 6), '#c0b4d0', '#9a8aac', 2, 2, false) + `<path d="M96 98 L98 98 M102 98 L104 98" stroke-width="2"/>` +
        cel(PT('M92 106 Q100 132 108 106 Z'), '#f6f2fc', '#cfc6e0', 2, 2, false)),
    ],
  };
})();
