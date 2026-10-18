// Anime-style illustrations of the redesign concepts (js/concepts.js), shonen / seinen style
// (owner: the first, cheery anime set was "way too cheery"): fierce, narrow, angular eyes with
// heavy brows, snarls and fangs, scars, steam; hard two-step shadows (cel) with a coloured rim
// light on the lit edge; dark gritty backgrounds with manga focus lines, screentone dots and grain.
// SVG; only redesign.html loads this.

const CONCEPT_ANIME = (() => {
  const INK = '#0e0a12';
  let uid = 0, D = [];
  const nid = () => 'sh' + (uid++);
  const finish = body => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><defs>${D.join('')}</defs>${body}</svg>`;
  const grad = (kind, stops, a) => { const i = nid(); D.push(`<${kind}Gradient id="${i}" ${a}>${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</${kind}Gradient>`); return `url(#${i})`; };
  const lin = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => grad('linear', stops, `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`);
  const rad = (stops, cx = 0.5, cy = 0.5, r = 0.6) => grad('radial', stops, `cx="${cx}" cy="${cy}" r="${r}"`);
  const E = (cx, cy, rx, ry, t = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${t ? ` transform="${t}"` : ''}`;
  const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"`;
  const R = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
  const PT = d => `<path d="${d}"`;
  const SP = (cx, cy, r1, r2, n, jag = 0) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + (i % 2 ? jag : 0), r = i % 2 ? r2 : r1 * (1 + ((i * 7) % 5) * 0.03); pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.95).toFixed(1)}`); } return `<polygon points="${pts.join(' ')}"`; };
  const fill = (shape, color, extra = '') => `${shape} fill="${color}" ${extra}/>`;
  const flat = (shape, color) => fill(shape, color, 'stroke="none"');
  // hard shading: deep shadow, a mid tone, the lit part, and a coloured rim light along the lit edge
  function cel(shape, base, shade, dark, rim, dx = 7, dy = 6) {
    const i = nid();
    D.push(`<clipPath id="${i}">${shape}/></clipPath>`);
    return `<g clip-path="url(#${i})">${flat(shape, dark)}<g transform="translate(${-dx * 0.5} ${-dy * 0.5})">${flat(shape, shade)}</g>` +
      `<g transform="translate(${-dx} ${-dy})">${flat(shape, base)}</g>` +
      (rim ? `<g transform="translate(${dx * 0.35} ${dy * 0.35})">${fill(shape, 'none', `stroke="${rim}" stroke-width="5" opacity=".85"`)}</g>` : '') +
      `</g>${fill(shape, 'none')}`;
  }
  // a fierce eye: angular, narrowed, the outer corner swept up; a small iris, a pinpoint or slit
  // pupil, one hard glint; a heavy brow slanting down to the middle. dir -1 = the left eye.
  function eye(cx, cy, w, h, iris, dir, o = {}) {
    const x0 = cx - dir * w, x1 = cx + dir * w;
    const shape = `M${x0} ${cy + h * 0.15} Q${cx - dir * w * 0.2} ${cy - h * 0.95} ${x1} ${cy - h * 0.9} Q${cx + dir * w * 0.3} ${cy + h * 0.85} ${x0} ${cy + h * 0.15} Z`;
    const i = nid();
    D.push(`<clipPath id="${i}"><path d="${shape}"/></clipPath>`);
    const white = o.glow ? o.glow : '#f4f0e8';
    return (o.glow ? flat(C(cx, cy, w * 1.4), rad([[0, o.glow], [1, 'rgba(0,0,0,0)']])) : '') +
      fill(PT(shape), white, 'stroke-width="2.4"') +
      (o.glow ? '' : `<g clip-path="url(#${i})">${flat(C(cx + dir * w * 0.15, cy, h * 0.75), iris)}${flat(o.slit ? E(cx + dir * w * 0.15, cy, h * 0.12, h * 0.6) : C(cx + dir * w * 0.15, cy, h * 0.25), INK)}${flat(C(cx + dir * w * 0.15 - h * 0.25, cy - h * 0.3, h * 0.14), '#ffffff')}</g>`) +
      `<path d="${shape}" fill="none" stroke-width="2.4"/>` +
      (o.brow === false ? '' : `<path d="M${cx - dir * w * 1.3} ${cy - h * 1.9} L${cx + dir * w * 1.15} ${cy - h * 0.85} L${cx + dir * w * 0.9} ${cy - h * 1.45} Z" fill="${INK}"/>`);
  }
  const scar = (x, y, l, a = 60) => `<path d="M${x} ${y} l${l * Math.cos(a * Math.PI / 180)} ${l * Math.sin(a * Math.PI / 180)}" stroke="#f0d8d0" stroke-width="2"/><path d="M${x - 3} ${y + 6} l6 -2 M${x + 1} ${y + 12} l6 -2" stroke="#f0d8d0" stroke-width="1.6"/>`;
  // a snarl: an open mouth with fangs top and bottom
  const snarl = (cx, cy, w, h) => `<path d="M${cx - w} ${cy} Q${cx} ${cy - h * 0.4} ${cx + w} ${cy} Q${cx} ${cy + h} ${cx - w} ${cy} Z" fill="#3a0a14" stroke-width="2.4"/>` +
    `<path d="M${cx - w * 0.75} ${cy - h * 0.05} l${w * 0.18} ${h * 0.45} l${w * 0.14} ${-h * 0.42} Z M${cx + w * 0.75} ${cy - h * 0.05} l${-w * 0.18} ${h * 0.45} l${-w * 0.14} ${-h * 0.42} Z" fill="#f8f4ec" stroke-width="1.4"/>` +
    `<path d="M${cx - w * 0.3} ${cy + h * 0.62} l${w * 0.12} ${-h * 0.3} l${w * 0.12} ${h * 0.28} Z M${cx + w * 0.3} ${cy + h * 0.62} l${-w * 0.12} ${-h * 0.3} l${-w * 0.12} ${h * 0.28} Z" fill="#f8f4ec" stroke-width="1.4"/>`;
  const claws = (x, y, dir = 1) => [0, 1, 2].map(k => `<path d="M${x - 5 + k * 5} ${y} l${dir * 1.5} 6 l2 -6 Z" fill="#f4f0e8" stroke-width="1.4"/>`).join('');
  const steam = (x, y, dir) => [0, 1, 2].map(k => flat(C(x + dir * k * 7, y - k * 4, 4 + k * 2), `rgba(230,225,235,${0.75 - k * 0.2})`)).join('');
  const tube = (d, color, w, shade, rim) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${shade}" stroke-width="${w}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w * 0.5}" transform="translate(-2 -2)"/>` + (rim ? `<path d="${d}" fill="none" stroke="${rim}" stroke-width="1.6" transform="translate(-3.5 -3.5)" opacity=".9"/>` : '');
  const flame = (x, y, s, outer, inner, core = '#fff6d0') => {
    const f = (k, col, inked) => `<path d="M${x - 0.42 * s * k} ${y} Q${x - 0.7 * s * k} ${y - 0.5 * s * k} ${x - 0.3 * s * k} ${y - 0.95 * s * k} Q${x - 0.1 * s * k} ${y - 0.6 * s * k} ${x + 0.05 * s * k} ${y - 1.2 * s * k} Q${x + 0.42 * s * k} ${y - 0.6 * s * k} ${x + 0.3 * s * k} ${y - 0.45 * s * k} Q${x + 0.62 * s * k} ${y - 0.7 * s * k} ${x + 0.5 * s * k} ${y - 0.2 * s * k} Q${x + 0.5 * s * k} ${y} ${x} ${y} Z" fill="${col}" ${inked ? '' : 'stroke="none"'}/>`;
    return f(1, outer, true) + f(0.66, inner, false) + f(0.32, core, false);
  };
  // a crackling arc of electricity from (x1, y1) to (x2, y2)
  const arc = (x1, y1, x2, y2, col = '#bff6ff', seed = 1) => { let d = `M${x1} ${y1}`; for (let k = 1; k < 6; k++) { const t = k / 6, j = ((k * seed * 37) % 11 - 5) * 1.6; d += ` L${x1 + (x2 - x1) * t + j} ${y1 + (y2 - y1) * t - j}`; } d += ` L${x2} ${y2}`; return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.4"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="1"/>`; };
  const glow = (x, y, r, col) => flat(C(x, y, r), rad([[0, col], [1, 'rgba(0,0,0,0)']]));
  const puff = (pts, base, shade, dark, rim) => pts.map(([x, y, r]) => cel(C(x, y, r), base, shade, dark, rim, r * 0.25, r * 0.22)).join('');
  const curl = (x, y, s, dir, color, shade, rim) => tube(`M${x} ${y} C${x + dir * 0.9 * s} ${y - 0.9 * s} ${x + dir * 1.9 * s} ${y + 0.1 * s} ${x + dir * 1.4 * s} ${y + 0.85 * s} C${x + dir * 1.0 * s} ${y + 1.25 * s} ${x + dir * 0.55 * s} ${y + 0.8 * s} ${x + dir * 0.85 * s} ${y + 0.5 * s}`, color, 9, shade, rim);
  const shadow = (rx = 58) => flat(E(100, 189, rx, 8), 'rgba(0,0,0,.55)');
  // gritty backgrounds: a dark gradient, manga focus lines, screentone dots, grain, a cracked floor
  const screentone = (col = 'rgba(0,0,0,.35)') => { const i = nid(); D.push(`<pattern id="${i}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${col}"/></pattern>`); return `url(#${i})`; };
  const focus = (col, n = 40) => { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (i % 3) * 0.02, w = 0.012 + (i % 4) * 0.006; s += `<path d="M${100 + Math.cos(a) * 78} ${100 + Math.sin(a) * 78} L${100 + Math.cos(a - w) * 220} ${100 + Math.sin(a - w) * 220} L${100 + Math.cos(a + w) * 220} ${100 + Math.sin(a + w) * 220} Z" fill="${col}" stroke="none"/>`; } return s; };
  const grain = () => [...Array(70)].map((_, i) => flat(C((i * 73) % 200, (i * 131) % 200, (i % 3) * 0.4 + 0.4), `rgba(255,255,255,${0.04 + (i % 4) * 0.02})`)).join('');
  const floor = col => `<path d="M0 178 L200 178 L200 200 L0 200 Z" fill="${col}" stroke="none"/><path d="M40 182 l12 4 l6 -3 l10 5 M140 184 l10 -3 l8 5 l9 -2" fill="none" stroke="rgba(0,0,0,.6)" stroke-width="1.6"/>`;
  // a soft back-glow in the type's colour, so dark monsters stand out from dark backgrounds
  const backlight = col => flat(E(100, 112, 92, 84), rad([[0, col], [1, 'rgba(0,0,0,0)']]));
  const BG = {
    electric: () => flat(R(0, 0, 200, 200, 0), rad([[0, '#3a4a8a'], [0.55, '#141a3a'], [1, '#05060e']], 0.5, 0.45, 0.8)) + backlight('rgba(110,160,255,.45)') + focus('rgba(150,200,255,.2)') + flat(R(0, 0, 200, 200, 0), screentone('rgba(0,0,0,.35)')) + floor('#0a0c18') + grain(),
    fire: () => flat(R(0, 0, 200, 200, 0), rad([[0, '#a03a14'], [0.5, '#3a0c0a'], [1, '#080202']], 0.5, 0.5, 0.8)) + backlight('rgba(255,110,40,.45)') + focus('rgba(255,150,70,.2)') + flat(R(0, 0, 200, 200, 0), screentone('rgba(0,0,0,.34)')) + floor('#120404') +
      [[22, 40, 2], [176, 30, 1.8], [160, 150, 2], [30, 150, 1.5], [60, 20, 1.5], [150, 80, 1.6], [120, 30, 1.2]].map(([x, y, r]) => flat(C(x, y, r), '#ffb04a')).join('') + grain(),
    storm: () => flat(R(0, 0, 200, 200, 0), lin([[0, '#06080e'], [1, '#262c40']])) + backlight('rgba(150,175,235,.35)') + flat(R(0, 0, 200, 200, 0), screentone('rgba(0,0,0,.36)')) +
      [...Array(24)].map((_, i) => `<path d="M${(i * 37) % 210} ${(i * 53) % 170} l-9 26" stroke="rgba(170,190,230,.28)" stroke-width="1.3"/>`).join('') + floor('#05060a') + grain(),
    night: () => flat(R(0, 0, 200, 200, 0), lin([[0, '#020608'], [1, '#0e2a30']])) + backlight('rgba(110,220,235,.2)') + flat(R(0, 0, 200, 200, 0), screentone('rgba(0,0,0,.4)')) +
      flat(E(100, 170, 100, 26), 'rgba(140,220,230,.08)') + floor('#03080a') + grain(),
    dusk: () => flat(R(0, 0, 200, 200, 0), rad([[0, '#4a2a5a'], [0.6, '#160a20'], [1, '#040208']], 0.5, 0.45, 0.8)) + backlight('rgba(190,130,255,.42)') + focus('rgba(200,150,255,.2)') + flat(R(0, 0, 200, 200, 0), screentone('rgba(0,0,0,.35)')) + floor('#08040c') + grain(),
  };
  // the body is built (its clip paths and gradients collected) before this runs, so clear them after
  const art = (bg, body) => { const out = finish(BG[bg]() + body); D = []; return out; };

  return {
    sparkit: [
      // A · Plug ferret: lean street fighter, scar over one eye, tail plug spitting arcs
      art('electric', shadow(50) +
        tube('M120 150 C162 154 178 126 164 92', '#2a8f8a', 11, '#165450', '#7ae8ff') +
        glow(163, 66, 30, 'rgba(160,230,255,.75)') +
        cel(R(150, 72, 26, 24, 4), '#c87830', '#7a4214', '#3a1e08', '#ffd8a0', 4, 4) + cel(R(154, 52, 6, 21, 1), '#e8a860', '#8a5420', '#3a1e08', null, 2, 2) + cel(R(166, 52, 6, 21, 1), '#e8a860', '#8a5420', '#3a1e08', null, 2, 2) +
        arc(157, 50, 140, 26, '#7ae8ff', 3) + arc(169, 50, 190, 30, '#7ae8ff', 5) + arc(176, 84, 196, 96, '#7ae8ff', 2) +
        cel(E(80, 178, 16, 7), '#165450', '#0e3a38', '#061c1c', null, 3, 2) + cel(E(120, 178, 16, 7), '#165450', '#0e3a38', '#061c1c', null, 3, 2) +
        cel(PT('M76 112 Q78 96 100 94 Q124 96 126 116 L122 168 Q100 178 80 168 Z'), '#2a8f8a', '#1a5e5a', '#0c2e2c', '#7ae8ff') +   // lean, wiry torso
        cel(PT('M88 120 Q100 112 112 120 L110 160 Q100 166 90 160 Z'), '#d8ccb0', '#a89a7c', '#5a5040', null, 4, 4) +
        cel(E(70, 132, 7, 17, 'rotate(15 70 132)'), '#2a8f8a', '#1a5e5a', '#0c2e2c', '#7ae8ff', 3, 3) + claws(64, 147) + cel(E(130, 128, 7, 17, 'rotate(-30 130 128)'), '#2a8f8a', '#1a5e5a', '#0c2e2c', '#7ae8ff', 3, 3) + claws(138, 140, -1) +
        cel(PT('M66 60 L70 40 L82 52 Z'), '#2a8f8a', '#1a5e5a', '#0c2e2c', null, 3, 3) + cel(PT('M134 60 L130 40 L118 52 Z'), '#2a8f8a', '#1a5e5a', '#0c2e2c', null, 3, 3) +   // swept-back ears
        cel(PT('M62 76 Q66 52 100 50 Q134 52 138 76 Q132 98 100 102 Q68 98 62 76 Z'), '#2a8f8a', '#1a5e5a', '#0c2e2c', '#7ae8ff') +   // narrow head
        cel(PT('M84 52 L80 22 L94 40 L100 10 L108 38 L122 20 L116 52 Z'), '#e8fffa', '#8adcd4', '#3a8a84', '#ffffff', 3, 3) +   // jagged static crest
        flat(PT('M60 70 Q100 60 140 70 L136 84 Q100 76 64 84 Z'), '#0a2a28') +
        eye(84, 76, 10, 6, '#c08aff', -1, { slit: true }) + eye(116, 76, 10, 6, '#c08aff', 1, { slit: true }) + scar(124, 80, 14, 60) +
        snarl(100, 92, 12, 10)),
      // B · Storm core: a black-violet ball of static, two cold glowing slits, a cracked grin of light
      art('electric', shadow(52) +
        cel(E(78, 180, 15, 7), '#1a1a40', '#10102a', '#060610', null, 3, 2) + cel(E(122, 180, 15, 7), '#1a1a40', '#10102a', '#060610', null, 3, 2) +
        `<line x1="100" y1="56" x2="96" y2="24" stroke-width="5"/>` + glow(96, 20, 30, 'rgba(200,230,255,.9)') + cel(C(96, 20, 9), '#f0faff', '#9ad8ff', '#3a6a9a', null, 3, 3) +
        arc(96, 20, 70, 6, '#bff6ff', 2) + arc(96, 20, 124, 4, '#bff6ff', 4) +
        glow(100, 116, 76, 'rgba(120,90,255,.35)') +
        cel(SP(100, 116, 68, 52, 17, 0.06), '#2e2470', '#1c1648', '#0a0820', '#a07aff', 10, 9) +
        arc(36, 96, 14, 80, '#c8a8ff', 3) + arc(166, 100, 190, 84, '#c8a8ff', 5) + arc(150, 160, 178, 176, '#c8a8ff', 2) + arc(52, 160, 24, 174, '#c8a8ff', 7) +
        eye(78, 106, 15, 6, '#000', -1, { glow: '#d0f4ff', brow: true }) + eye(122, 106, 15, 6, '#000', 1, { glow: '#d0f4ff', brow: true }) +
        glow(100, 138, 24, 'rgba(200,240,255,.6)') + `<path d="M76 134 L84 140 L90 132 L98 142 L104 132 L112 141 L118 133 L126 138 L118 146 L82 146 Z" fill="#e8faff" stroke-width="2.4"/>`),
      // C · Coil gecko: pressed low like a predator, slit eyes locked on, tail sprung and sparking
      art('electric', shadow(62) +
        tube('M128 160 C170 166 184 128 160 120 C140 114 138 146 158 146 C172 146 170 128 160 130', '#5a9a2a', 11, '#2e5a14', '#c8ff8a') +
        glow(160, 130, 22, 'rgba(160,240,255,.85)') + cel(C(160, 130, 6), '#e0fcff', '#5ad0f0', '#1a6a8a', null, 2, 2) + arc(160, 130, 186, 110, '#7ae8ff', 4) + arc(160, 130, 176, 158, '#7ae8ff', 2) +
        cel(E(72, 176, 20, 8), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 2) + cel(E(128, 176, 20, 8), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 2) + claws(58, 180) + claws(142, 180, -1) +
        cel(E(100, 146, 36, 28), '#5a9a2a', '#3a6a1a', '#1a3008', '#c8ff8a') + cel(E(100, 154, 22, 16), '#c8d8a0', '#98a870', '#4a5430', null, 4, 4) +
        `<path d="M70 130 L80 136 L70 142 L80 148" fill="none" stroke="#e8902a" stroke-width="4"/><path d="M130 130 L120 136 L130 142 L120 148" fill="none" stroke="#e8902a" stroke-width="4"/>` +
        cel(E(62, 152, 8, 15, 'rotate(45 62 152)'), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 3) + cel(E(138, 152, 8, 15, 'rotate(-45 138 152)'), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 3) +
        cel(PT('M54 104 Q58 74 100 70 Q142 74 146 104 Q140 124 100 128 Q60 124 54 104 Z'), '#5a9a2a', '#3a6a1a', '#1a3008', '#c8ff8a') +   // wedge head, held low
        `<path d="M84 72 L89 80 L94 72 L100 80 L106 72 L111 80 L116 72" fill="none" stroke="#e8902a" stroke-width="3"/>` +
        cel(C(64, 98, 14), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 3) + cel(C(136, 98, 14), '#5a9a2a', '#3a6a1a', '#1a3008', null, 3, 3) +
        eye(66, 98, 11, 7, '#ffc020', -1, { slit: true }) + eye(134, 98, 11, 7, '#ffc020', 1, { slit: true }) +
        snarl(100, 116, 18, 10) + `<path d="M100 122 Q96 132 102 138 M102 138 l4 2 M102 138 l-1 4" fill="none" stroke="#ff4a6a" stroke-width="2.4"/>`),
    ],

    cinderox: [
      // A · Ember calf: head down, mid-charge, steam blasting from its nostrils, forelock roaring
      art('fire', shadow(62) +
        tube('M144 130 C164 128 172 114 176 98', '#24385e', 7, '#16224a', '#ffb04a') + flame(178, 98, 34, '#e83a10', '#ff9a2a') +
        cel(R(74, 148, 18, 34, 6), '#1e3050', '#121e36', '#060a14', null, 3, 3) + cel(R(110, 148, 18, 34, 6), '#1e3050', '#121e36', '#060a14', null, 3, 3) +
        cel(E(100, 136, 56, 34), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a') + cel(E(100, 148, 32, 15), '#d8be84', '#a8884e', '#5a4420', null, 4, 4) +
        cel(R(60, 152, 20, 32, 7), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a', 3, 3) + cel(R(120, 152, 20, 32, 7), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a', 3, 3) +
        fill(R(60, 174, 20, 10, 3), '#06080e') + fill(R(120, 174, 20, 10, 3), '#06080e') +
        cel(PT('M48 90 L70 80 L66 94 Z'), '#2c4470', '#1a2c4e', '#0a1224', null, 3, 3) + cel(PT('M152 90 L130 80 L134 94 Z'), '#2c4470', '#1a2c4e', '#0a1224', null, 3, 3) +   // pinned-back ears
        cel(PT('M72 72 Q60 62 54 46 Q68 54 80 64 Z'), '#e8dcc0', '#a89878', '#4a4030', '#ffe0a0', 2, 2) + cel(PT('M128 72 Q140 62 146 46 Q132 54 120 64 Z'), '#e8dcc0', '#a89878', '#4a4030', '#ffe0a0', 2, 2) +
        cel(PT('M64 92 Q66 66 100 64 Q134 66 136 92 Q132 118 100 120 Q68 118 64 92 Z'), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a') +   // head, lowered
        flame(100, 70, 60, '#e83a10', '#ff9a2a') +
        cel(E(100, 112, 25, 14), '#d8be84', '#a8884e', '#5a4420', null, 3, 3) + flat(E(91, 112, 3, 4), INK) + flat(E(109, 112, 3, 4), INK) +
        steam(72, 116, -1) + steam(128, 116, 1) +
        eye(84, 92, 10, 6, '#ffb020', -1) + eye(116, 92, 10, 6, '#ffb020', 1) + scar(70, 98, 16, 40) +
        `<path d="M90 122 L110 122" stroke-width="2.4"/>`),
      // B · Lava-shouldered calf: armoured in cracked rock, eyes burning white, smoke curling
      art('fire', shadow(64) +
        cel(R(74, 148, 18, 34, 6), '#1e3050', '#121e36', '#060a14', null, 3, 3) + cel(R(110, 148, 18, 34, 6), '#1e3050', '#121e36', '#060a14', null, 3, 3) +
        flame(68, 112, 42, '#e83a10', '#ff9a2a') + flame(90, 104, 52, '#e83a10', '#ff9a2a') + flame(112, 104, 52, '#e83a10', '#ff9a2a') + flame(134, 112, 42, '#e83a10', '#ff9a2a') +
        cel(E(100, 138, 58, 34), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a') + cel(E(100, 150, 32, 15), '#d8be84', '#a8884e', '#5a4420', null, 4, 4) +
        glow(58, 122, 30, 'rgba(255,120,30,.75)') + glow(142, 122, 30, 'rgba(255,120,30,.75)') +
        cel(PT('M36 122 L50 98 L76 96 L88 116 L78 142 L50 144 Z'), '#4a3a32', '#2e2420', '#120c0a', '#ff9a3a', 5, 5) + cel(PT('M164 122 L150 98 L124 96 L112 116 L122 142 L150 144 Z'), '#4a3a32', '#2e2420', '#120c0a', '#ff9a3a', 5, 5) +
        `<path d="M50 106 L62 120 L56 134 M62 120 L76 116" fill="none" stroke="#ffc04a" stroke-width="3"/><path d="M150 106 L138 120 L144 134 M138 120 L124 116" fill="none" stroke="#ffc04a" stroke-width="3"/>` +
        cel(R(60, 152, 20, 32, 7), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a', 3, 3) + cel(R(120, 152, 20, 32, 7), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a', 3, 3) +
        fill(R(60, 174, 20, 10, 3), '#2a1e18') + fill(R(120, 174, 20, 10, 3), '#2a1e18') +
        cel(PT('M72 66 Q44 60 36 34 Q34 24 42 28 Q50 48 76 54 Z'), '#e8dcc0', '#a89878', '#4a4030', '#ffe0a0', 2, 2) + cel(PT('M128 66 Q156 60 164 34 Q166 24 158 28 Q150 48 124 54 Z'), '#e8dcc0', '#a89878', '#4a4030', '#ffe0a0', 2, 2) +
        cel(PT('M66 86 Q68 58 100 56 Q132 58 134 86 Q130 112 100 114 Q70 112 66 86 Z'), '#2c4470', '#1a2c4e', '#0a1224', '#ffb04a') +
        cel(E(100, 106, 25, 14), '#d8be84', '#a8884e', '#5a4420', null, 3, 3) + flat(E(91, 106, 3, 4), INK) + flat(E(109, 106, 3, 4), INK) +
        steam(74, 112, -1) + steam(126, 112, 1) +
        eye(84, 86, 11, 6, '#000', -1, { glow: '#fff4c0' }) + eye(116, 86, 11, 6, '#000', 1, { glow: '#fff4c0' }) +
        `<path d="M88 116 L94 120 L100 116 L106 120 L112 116" fill="none" stroke-width="2.4"/>`),
      // C · Coal calf: smouldering in the dark, coals glowing through soot, smoke rolling off it
      art('fire', shadow(64) +
        tube('M144 130 C164 128 170 116 172 104', '#2a2226', 7, '#160e12', '#ff9a3a') + [[174, 92, 9], [184, 76, 7], [176, 62, 6], [188, 52, 5]].map(([x, y, r]) => flat(C(x, y, r), 'rgba(120,110,118,.75)')).join('') +
        cel(R(74, 148, 18, 34, 6), '#1e181c', '#120c10', '#050304', null, 3, 3) + cel(R(110, 148, 18, 34, 6), '#1e181c', '#120c10', '#050304', null, 3, 3) +
        cel(E(100, 136, 58, 34), '#2e262a', '#1c1418', '#080506', '#ff8a2a') +
        glow(100, 152, 44, 'rgba(255,120,30,.85)') + fill(E(100, 152, 30, 12), lin([[0, '#ffe080'], [1, '#e04a10']]), 'stroke-width="2"') +
        [[64, 112, 15], [86, 104, 17], [110, 104, 17], [134, 112, 15], [76, 124, 12], [122, 124, 12]].map(([x, y, r]) =>
          cel(PT(`M${x - r} ${y} L${x - r * 0.4} ${y - r * 0.9} L${x + r * 0.6} ${y - r * 0.7} L${x + r} ${y + r * 0.2} L${x + r * 0.2} ${y + r * 0.8} L${x - r * 0.7} ${y + r * 0.6} Z`), '#26201e', '#16100e', '#060404', '#ff7a1c', 3, 3) +
          `<path d="M${x - r * 0.4} ${y - r * 0.2} L${x} ${y + r * 0.2} L${x + r * 0.4} ${y - r * 0.3}" fill="none" stroke="#ffc04a" stroke-width="3"/>`).join('') +
        cel(R(60, 152, 20, 32, 7), '#2e262a', '#1c1418', '#080506', '#ff8a2a', 3, 3) + cel(R(120, 152, 20, 32, 7), '#2e262a', '#1c1418', '#080506', '#ff8a2a', 3, 3) +
        cel(PT('M74 68 Q66 56 68 44 Q80 52 82 62 Z'), '#c8b8a0', '#8a7a62', '#3a3226', null, 2, 2) + cel(PT('M126 68 Q134 56 132 44 Q120 52 118 62 Z'), '#c8b8a0', '#8a7a62', '#3a3226', null, 2, 2) +
        cel(PT('M66 88 Q68 60 100 58 Q132 60 134 88 Q130 114 100 116 Q70 114 66 88 Z'), '#2e262a', '#1c1418', '#080506', '#ff8a2a') +
        cel(E(100, 108, 24, 13), '#b89a70', '#806848', '#3a2e1e', null, 3, 3) + flat(E(91, 108, 3, 4), INK) + flat(E(109, 108, 3, 4), INK) +
        [[78, 108], [122, 108]].map(([x, y], k) => [0, 1, 2].map(j => flat(C(x + (k ? 1 : -1) * j * 8, y - j * 6, 4 + j * 2.5), `rgba(110,100,108,${0.7 - j * 0.18})`)).join('')).join('') +
        eye(84, 88, 10, 5, '#000', -1, { glow: '#ffa040' }) + eye(116, 88, 10, 5, '#000', 1, { glow: '#ffa040' })),
    ],

    lumawool: [
      // A · Storm ram: a living thundercloud, dark face, horns like iron, lightning lashing out
      art('storm', shadow(62) +
        cel(R(74, 156, 12, 30, 3), '#141018', '#0c080e', '#040206', null, 2, 2) + cel(R(114, 156, 12, 30, 3), '#141018', '#0c080e', '#040206', null, 2, 2) +
        puff([[60, 132, 26], [100, 140, 34], [140, 132, 26], [72, 104, 24], [128, 104, 24], [100, 80, 30], [72, 78, 20], [128, 78, 20]], '#3e4458', '#2a2e3e', '#12141c', '#9ab0e0') +
        glow(54, 130, 28, 'rgba(220,230,255,.55)') + glow(148, 128, 26, 'rgba(220,230,255,.55)') +
        arc(52, 112, 12, 150, '#e8f0ff', 3) + arc(150, 110, 192, 146, '#e8f0ff', 5) + arc(100, 156, 92, 196, '#e8f0ff', 2) + arc(76, 60, 40, 10, '#e8f0ff', 7) +
        curl(80, 90, 18, -1, '#a8acb8', '#5a5e6a', '#e0e8ff') + curl(120, 90, 18, 1, '#a8acb8', '#5a5e6a', '#e0e8ff') +
        cel(PT('M78 92 Q80 82 100 82 Q120 82 122 92 L116 128 Q100 138 84 128 Z'), '#4a4c58', '#30323c', '#141418', '#c8d8ff', 5, 4) +   // long, dark ram's face
        eye(90, 104, 8, 4, '#000', -1, { glow: '#fff2a0' }) + eye(110, 104, 8, 4, '#000', 1, { glow: '#fff2a0' }) +
        `<path d="M94 126 L100 130 L106 126" fill="none" stroke-width="2.4"/>` + flat(E(96, 120, 2, 1.5), INK) + flat(E(104, 120, 2, 1.5), INK)),
      // B · Lantern alpaca: a silent guardian in the night mist, lit from below by its lantern
      art('night', shadow(50) +
        cel(R(70, 146, 12, 38, 4), '#b8aa8c', '#7a6e58', '#2e2a20', null, 2, 2) + cel(R(118, 146, 12, 38, 4), '#b8aa8c', '#7a6e58', '#2e2a20', null, 2, 2) +
        cel(R(82, 150, 12, 34, 4), '#a09276', '#6a604c', '#26221a', null, 2, 2) + cel(R(106, 150, 12, 34, 4), '#a09276', '#6a604c', '#26221a', null, 2, 2) +
        puff([[72, 138, 20], [100, 132, 24], [128, 138, 20], [86, 150, 18], [114, 150, 18]], '#c8bca0', '#8a806a', '#3a3428', '#7ae8f0') +
        cel(R(84, 66, 32, 76, 14), '#c8bca0', '#8a806a', '#3a3428', '#7ae8f0', 6, 0) +
        cel(R(82, 102, 36, 9, 3), '#6a2020', '#3a0e0e', '#180404', null, 2, 2) +
        glow(100, 124, 46, 'rgba(110,230,240,.75)') +
        cel(PT('M90 112 L110 112 L114 130 L86 130 Z'), '#a07a30', '#6a4e1a', '#2a1e08', '#ffe0a0', 3, 3) + fill(R(94, 116, 12, 10, 2), '#d8fcff', 'stroke-width="2"') +
        flat(PT('M84 60 L116 60 L116 96 L84 96 Z'), lin([[0, 'rgba(110,230,240,0)'], [1, 'rgba(110,230,240,.35)']])) +   // the lantern's light from below
        cel(PT('M76 46 Q70 22 78 12 Q86 26 86 44 Z'), '#c8bca0', '#8a806a', '#3a3428', null, 2, 2) + cel(PT('M124 46 Q130 22 122 12 Q114 26 114 44 Z'), '#c8bca0', '#8a806a', '#3a3428', null, 2, 2) +
        cel(PT('M76 60 Q78 38 100 36 Q122 38 124 60 Q122 84 100 86 Q78 84 76 60 Z'), '#c8bca0', '#8a806a', '#3a3428', '#7ae8f0', 5, 4) +
        puff([[88, 38, 10], [100, 34, 12], [112, 38, 10]], '#d8ccb0', '#9a8e74', '#3a3428', null) +
        `<path d="M82 56 L97 57" stroke-width="3"/><path d="M118 56 L103 57" stroke-width="3"/>` +   // heavy half-lidded stare
        fill(PT('M83 60 Q90 56 97 60 Q90 64 83 60 Z'), '#e8f8f4', 'stroke-width="2"') + fill(PT('M103 60 Q110 56 117 60 Q110 64 103 60 Z'), '#e8f8f4', 'stroke-width="2"') +
        flat(C(91, 60, 2.2), '#1a2a2a') + flat(C(109, 60, 2.2), '#1a2a2a') +
        cel(E(100, 75, 12, 8), '#b8aa8c', '#7a6e58', '#2e2a20', null, 2, 2) + `<path d="M100 73 L100 78 M95 80 L105 80" fill="none" stroke-width="2"/>`),
      // C · Static goat: a berserker, eyes wild, horns arcing, wool bristling with charge
      art('dusk', shadow(60) +
        cel(R(72, 150, 12, 34, 3), '#5a4a6a', '#3a2e48', '#140e1c', null, 2, 2) + cel(R(116, 150, 12, 34, 3), '#5a4a6a', '#3a2e48', '#140e1c', null, 2, 2) +
        fill(R(72, 176, 12, 8, 2), '#06040a') + fill(R(116, 176, 12, 8, 2), '#06040a') +
        cel(E(100, 140, 50, 28), '#5a4a6a', '#3a2e48', '#140e1c', '#c8a8ff') +
        `<path d="M58 120 L50 92 M72 112 L68 80 M88 108 L88 74 M112 108 L112 74 M128 112 L132 80 M142 120 L150 92" fill="none" stroke="#e8e0f4" stroke-width="4"/>` +
        puff([[64, 126, 16], [84, 118, 18], [104, 116, 18], [124, 120, 17], [140, 130, 14]], '#d8d0e8', '#9a90b0', '#3a3448', '#ffffff') +
        arc(50, 92, 30, 70, '#bff6ff', 3) + arc(150, 92, 172, 66, '#bff6ff', 5) + arc(88, 74, 78, 50, '#bff6ff', 2) +
        curl(86, 58, 20, -1, '#c87a30', '#7a4214', '#ffd0a0') + curl(114, 58, 20, 1, '#c87a30', '#7a4214', '#ffd0a0') +
        glow(62, 88, 16, 'rgba(160,240,255,.85)') + glow(138, 88, 16, 'rgba(160,240,255,.85)') + arc(62, 88, 40, 104, '#bff6ff', 4) + arc(138, 88, 160, 106, '#bff6ff', 6) +
        cel(PT('M68 76 L82 70 L80 82 Z'), '#5a4a6a', '#3a2e48', '#140e1c', null, 2, 2) + cel(PT('M132 76 L118 70 L120 82 Z'), '#5a4a6a', '#3a2e48', '#140e1c', null, 2, 2) +
        cel(PT('M78 80 Q80 60 100 60 Q120 60 122 80 L114 108 Q100 116 86 108 Z'), '#5a4a6a', '#3a2e48', '#140e1c', '#c8a8ff', 5, 4) +
        puff([[92, 58, 9], [100, 55, 10], [108, 58, 9]], '#d8d0e8', '#9a90b0', '#3a3448', null) +
        eye(89, 82, 9, 6, '#ffd020', -1, { slit: true }) + eye(111, 82, 9, 6, '#ffd020', 1, { slit: true }) +
        steam(84, 104, -1) + steam(116, 104, 1) +
        snarl(100, 102, 10, 8) +
        cel(PT('M92 110 L100 136 L108 110 Z'), '#d8d0e8', '#9a90b0', '#3a3448', null, 2, 2)),
    ],
  };
})();
