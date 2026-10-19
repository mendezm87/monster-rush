// Plain-language info: what moves, held items, relics and types do. Move and item text is
// written from their numbers (so it's never out of date), and the Info screen (pause > Info, or
// tap a relic icon under the HUD) lists your relics, your monsters' held items and types.

const STATUS_NAMES = { par: 'paralyze', brn: 'burn', frz: 'freeze', psn: 'poison' };
const STAT_NAMES = { atk: 'attack', def: 'defence', spd: 'speed', cd: 'move recharge' };
const KIND_NAMES = { projectile: 'Shot', beam: 'Beam', dash: 'Dash', burst: 'Blast', zone: 'Strike from above', buff: 'Boost', heal: 'Heal', vortex: 'Vortex' };
const pct = x => Math.round(x * 100) + '%';
const secs = x => (Math.round(x * 10) / 10) + ' s';
const area = r => (r < 35 ? 'small' : r < 75 ? 'medium' : r < 110 ? 'large' : 'huge');
const statList = (o, f) => Object.entries(o).map(([k, v]) => `${STAT_NAMES[k]} by ${pct(f(k, v))}`).join(' and ');

// What a move does, in a sentence or three.
function moveDesc(mv) {
  const s = [];
  switch (mv.kind) {
    case 'projectile': {
      const n = mv.count || 1;
      let t = n > 1 ? `Fires ${n} shots${mv.spread > 0.6 ? ' in a wide spread' : ' side by side'}` : 'Fires a shot';
      if (mv.homing) t += n > 1 ? ' that home in on their target' : ' that homes in on its target';
      if (mv.boomerang) t += ' that flies out and comes back, hitting on the way out and back';
      if (mv.explode) t += ' that explodes when it hits, catching everything nearby';
      s.push(t + '.');
      break;
    }
    case 'beam':
      s.push(`Charges for ${secs(mv.charge)}, then fires a ${mv.width >= 14 ? 'thick ' : mv.width <= 8 ? 'thin ' : ''}${mv.len >= 330 ? 'long ' : ''}beam for ${secs(mv.dur)} that hurts everything in its path. It can't move while charging or firing.`);
      if (mv.recharge) s.push(`Afterwards it has to rest for ${secs(mv.recharge)}.`);
      break;
    case 'dash':
      s.push(mv.hits > 1 ? `Rushes at the nearest foe and lands a flurry of ${mv.hits} hits.` : 'Rushes at the nearest foe and slams into it.');
      if (mv.recoil) s.push(`It takes ${pct(mv.recoil)} of the damage back as recoil.`);
      if (mv.crit) s.push(`High chance of a critical hit (${pct(mv.crit)}).`);
      break;
    case 'burst':
      s.push(mv.cone ? `Blows a ${area(mv.r)} cone out in front of it, hitting 3 times.`
        : mv.ripple ? `Sends a ${area(mv.r)} ring rolling outward that hits whatever it passes.`
        : `After ${secs(mv.delay)}, blasts a ${area(mv.r)} area all around it.`);
      if (mv.push) s.push('Knocks foes far back.');
      break;
    case 'zone': {
      const n = mv.count || 1;
      s.push(n > 1 ? `Marks ${n} spots around the foe; they strike from above ${secs(mv.delay)} later.` : `Marks the spot where the foe stands; it strikes from above ${secs(mv.delay)} later.`);
      if (mv.linger) s.push(`Leaves a ${mv.pull ? 'swirling ' : ''}pool for ${secs(mv.linger)} that keeps hurting anyone in it${mv.pull ? ' and drags them toward the middle' : ''}.`);
      break;
    }
    case 'buff': s.push(`Raises its ${statList(mv.buff, (k, v) => (k === 'cd' ? 1 - v : v - 1))} for ${secs(mv.dur)}.`); break;
    case 'heal': s.push(`Heals ${pct(mv.amount)} of its HP.`); break;
    case 'vortex': s.push(`Stands still and pulls foes in a ${area(mv.r)} circle toward it, grinding them for ${secs(mv.dur)}.`); break;
  }
  if (mv.status) s.push(`${pct(mv.status[1])} chance to ${STATUS_NAMES[mv.status[0]]}.`);
  if (mv.slow) s.push(`Slows foes for ${secs(mv.slow)}.`);
  if (mv.drain) s.push(`It heals by ${pct(mv.drain)} of the damage dealt.`);
  if (mv.selfDebuff) s.push(`Lowers its own ${statList(mv.selfDebuff, (k, v) => 1 - v)} for 5 s.`);
  return s.join(' ');
}
// The numbers: type, kind, power, recharge.
function moveStats(mv) {
  const parts = [TYPES[mv.type].name, KIND_NAMES[mv.kind]];
  if (mv.power) parts.push(`Power ${mv.power}${mv.hits > 1 ? ' × ' + mv.hits : (mv.count || 1) > 1 ? ' each' : ''}`);
  parts.push(`Recharge ${secs(mv.cd)}`);
  return parts.join(' · ');
}
// A held item's effect.
function itemDesc(it) {
  if (it.boostType) return `${TYPES[it.boostType].name} moves hit ${pct(it.mul - 1)} harder.`;
  if (it.regen) return `Slowly heals ${(it.regen * 100).toFixed(1)}% of its HP every second during fights.`;
  const parts = [];
  for (const k of ['atk', 'def', 'spd']) if (it[k]) parts.push(`+${pct(it[k] - 1)} ${STAT_NAMES[k]}`);
  if (it.cd) parts.push(`moves recharge ${pct(1 - it.cd)} faster`);
  const t = parts.join(', ');
  return t.charAt(0).toUpperCase() + t.slice(1) + '.';
}
// How hard each type hits these types: weak to (×2, ×4) and resists (×½, ×¼).
function typeMatchups(types) {
  const weak = [], resist = [];
  for (const t of Object.keys(TYPES)) {
    const e = typeEffect(t, types);
    if (e > 1) weak.push([t, e]); else if (e < 1) resist.push([t, e]);
  }
  return { weak: weak.sort((a, b) => b[1] - a[1]), resist: resist.sort((a, b) => a[1] - b[1]) };
}
const mult = e => (e >= 4 ? '×4' : e >= 2 ? '×2' : e <= 0.0625 ? '×1/16' : e <= 0.125 ? '×⅛' : e <= 0.25 ? '×¼' : '×½');
const typeChip = (t, extra = '') => `<span class="tag" style="background:${TYPES[t].color}">${TYPES[t].name}${extra ? ' ' + extra : ''}</span>`;
const iconCanvas = id => { const cv = document.createElement('canvas'); cv.width = cv.height = 14; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(itemIcon(id), 0, 0); return cv; };

// ---------- the Info screen ----------
const Info = { tab: 'relics', from: 'pause' };
const TAG_LABEL = id => (typeof TAG_NAMES !== 'undefined' ? TAG_NAMES[RELICS[id].tag] : RELICS[id].tag.toUpperCase());
function openInfo(tab = 'relics', from = 'pause') {
  Object.assign(Info, { tab, from });
  App.paused = true;
  drawInfo();
  UI.show('info');
}
function drawInfo() {
  const run = App.run, body = $('#info-body');
  document.querySelectorAll('#info-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === Info.tab));
  body.innerHTML = '';
  const row = (left, html) => { const r = document.createElement('div'); r.className = 'info-row'; if (left) r.appendChild(left); r.insertAdjacentHTML('beforeend', `<div>${html}</div>`); body.appendChild(r); return r; };
  const portrait = m => { const cv = document.createElement('canvas'); cv.width = cv.height = 48; drawPortrait(cv, m.id, { fainted: m.fainted }); return cv; };
  if (!run) return;
  if (Info.tab === 'relics') {
    if (!run.relics.length) body.insertAdjacentHTML('beforeend', '<div class="hint">No relics yet. Treasure rooms, the shop and room rewards have them. They help your whole party for the rest of the run.</div>');
    for (const id of run.relics) {
      const r = RELICS[id];
      row(iconCanvas(id), `<b>${r.name}</b> <span class="tag elem">${TAG_LABEL(id)}</span><br>${r.desc}`);
    }
    const fused = run.party.filter(m => m.fused && m.fused.length);
    if (fused.length) {
      body.insertAdjacentHTML('beforeend', '<h3>Fused at the altar</h3>');
      for (const m of fused) row(portrait(m), `<b>${m.def.name}</b><br>${m.fused.map(id => `<b class="fz">${RELICS[id].fused.name}</b> ${RELICS[id].fused.desc}`).join('<br>')}`);
    }
  } else if (Info.tab === 'items') {
    body.insertAdjacentHTML('beforeend', '<div class="hint">Each monster holds one item of its own; it always has it.</div>');
    for (const m of run.party) row(portrait(m), `<b>${m.def.name}</b> holds <b>${ITEMS[m.def.item].name}</b><br>${itemDesc(ITEMS[m.def.item])}`);
  } else {
    body.insertAdjacentHTML('beforeend', '<div class="hint">A move of the same type as its user hits 30% harder. ×2 means double damage, ×½ half.</div>');
    for (const m of run.party) {
      const { weak, resist } = typeMatchups(m.def.types);
      row(portrait(m), `<b>${m.def.name}</b> ${m.def.types.map(t => typeChip(t)).join(' ')}<br>
        <span class="lbl">Weak to</span> ${weak.map(([t, e]) => typeChip(t, mult(e))).join(' ') || 'nothing'}<br>
        <span class="lbl">Resists</span> ${resist.map(([t, e]) => typeChip(t, mult(e))).join(' ') || 'nothing'}`);
    }
    body.insertAdjacentHTML('beforeend', '<h3>Every type attacking</h3>');
    for (const t of Object.keys(TYPES)) {
      const good = [], bad = [];
      for (const d of Object.keys(TYPES)) { const e = typeEffect(t, [d]); if (e > 1) good.push(d); else if (e < 1) bad.push(d); }
      row(null, `${typeChip(t)} <span class="lbl">strong vs</span> ${good.map(d => typeChip(d)).join(' ') || '–'} <span class="lbl">weak vs</span> ${bad.map(d => typeChip(d)).join(' ') || '–'}`);
    }
  }
}
document.querySelectorAll('#info-tabs button').forEach(b => { b.onclick = () => { Sfx.play('select'); Info.tab = b.dataset.tab; drawInfo(); }; });
$('#btn-info').onclick = () => { Sfx.play('select'); openInfo('relics', 'pause'); };
$('#btn-info-back').onclick = () => {
  Sfx.play('back');
  if (Info.from === 'pause') UI.show('pause');
  else { UI.hideScreens(); App.paused = false; }
};
// tap a relic icon under the HUD: the Info screen opens on your relics
$('#relics').addEventListener('click', () => {
  const b = App.battle;
  if (!b || App.paused || b.state === 'over' || b.state === 'pick' || b.state === 'leaving') return;
  Sfx.play('select');
  Input.reset();
  openInfo('relics', 'game');
});
