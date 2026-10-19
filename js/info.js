// Monster Rush's Info screen (pause > Info, or tap a relic icon under the HUD): your relics, your
// monsters' held items and types. The descriptions and tooltips it uses are in describe.js.

const iconCanvas = id => { const cv = document.createElement('canvas'); cv.width = cv.height = 14; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(itemIcon(id), 0, 0); return cv; };

// ---------- the Info screen ----------
const Info = { tab: 'relics', from: 'pause' };
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
    const T = run.T;
    const tc = document.createElement('canvas'); tc.width = tc.height = 48; { const c = tc.getContext('2d'), im = trainerCanvas(trainerLook(run.trainer, run.look), 'front'); c.imageSmoothingEnabled = false; c.drawImage(im, 14, 2, im.width * 1.5, im.height * 1.5); }
    row(tc, `<b>${T.name}</b> <span class="tag elem">${T.power}</span><br>${T.desc}${T.drawback ? `<br><span class="lbl">Drawback</span> ${T.drawback}` : ''}`);
    if (!run.relics.length) body.insertAdjacentHTML('beforeend', '<div class="hint">No relics yet. Treasure rooms, the shop and room rewards have them. They help your whole party for the rest of the run.</div>');
    for (const id of run.relics) {
      const r = RELICS[id];
      row(Object.assign(iconCanvas(id), { title: '' }), `<b data-tip="relic:${id}">${r.name}</b> <span class="tag elem">${TAG_LABEL(id)}</span><br>${r.desc}`);
    }
    const fused = run.party.filter(m => m.fused && m.fused.length);
    if (fused.length) {
      body.insertAdjacentHTML('beforeend', '<h3>Fused at the altar</h3>');
      for (const m of fused) row(portrait(m), `<b>${m.def.name}</b><br>${m.fused.map(id => `<b class="fz" data-tip="fused:${id}">${RELICS[id].fused.name}</b> ${RELICS[id].fused.desc}`).join('<br>')}`);
    }
  } else if (Info.tab === 'items') {
    body.insertAdjacentHTML('beforeend', '<div class="hint">Each monster holds one item of its own; it always has it.</div>');
    for (const m of run.party) row(portrait(m), `<b>${m.def.name}</b> holds <b data-tip="item:${m.def.item}">${ITEMS[m.def.item].name}</b><br>${itemDesc(ITEMS[m.def.item])}`);
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
