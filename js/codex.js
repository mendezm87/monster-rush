// The Deep Archive codex (r283, the owner: "do them all"): everything you've found, kept between runs in the save
// (Save.data.codex). Coreatures are seen when a fight with them starts (a boss's forms as it changes) and marked
// once they've been in your party; relics once you've held one; bosses once beaten; areas once reached. Unfound
// things show as dark silhouettes and ???. Open it from the title screen or the pause phone. Rush only; loaded
// after info.js.

const CODEX_KINDS = ['seen', 'owned', 'relics', 'bosses', 'areas'];
function codexData() {
  const c = Save.data.codex || (Save.data.codex = {});
  for (const k of CODEX_KINDS) if (!Array.isArray(c[k])) c[k] = [];
  return c;
}
// note things found; writes the save only when something is new
function codexNote(kind, ...ids) {
  const list = codexData()[kind];
  let added = false;
  for (const id of ids) if (id && !list.includes(id)) { list.push(id); added = true; }
  if (added) Save.write();
}
// what you have right now: the party (owned and seen), your relics, the area you're in
function codexNoteRun(run) {
  if (!run) return;
  const ids = run.party.map(m => m.id);
  codexNote('seen', ...ids); codexNote('owned', ...ids);
  codexNote('relics', ...run.relics);
  if (run.floor) codexNote('areas', run.floor.stage);
}

// the bosses worth a page: the hand-made ones, then every area's gatekeepers
function codexBosses() {
  const out = Object.entries(BOSSES).map(([id, B]) => ({ key: id, mon: B.forms[0], name: B.final ? `THE ${B.title}` : `${ROSTER_BY_ID[B.forms[0]].name}, ${B.title}`, sub: B.final ? 'Final boss' : `Act ${B.act} boss` }));
  const gates = [...new Set(Object.values(AREA_MONS).flatMap(a => a.bosses))];
  for (const id of gates) if (ROSTER_BY_ID[id]) out.push({ key: id, mon: id, name: ROSTER_BY_ID[id].name, sub: 'Gatekeeper' });
  return out;
}

const Codex = { tab: 'mons', from: 'title' };
function openCodex(from) {
  Codex.from = from;
  if (App.run) codexNoteRun(App.run);
  drawCodex();
  UI.show('codex');
}
function codexPortrait(id, found) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 48;
  drawPortrait(cv, id, {});
  if (!found) { const c = cv.getContext('2d'); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#4a4262'; c.fillRect(0, 0, 48, 48); }
  return cv;
}
function drawCodex() {
  const c = codexData(), body = $('#codex-body');
  document.querySelectorAll('#codex-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === Codex.tab));
  body.innerHTML = '';
  const count = (n, of, what) => body.insertAdjacentHTML('beforeend', `<div class="hint">${n} of ${of} ${what} found</div>`);
  if (Codex.tab === 'mons') {
    const all = [...ROSTER, ...EVOLVED, ...LEGENDS];
    count(all.filter(d => c.seen.includes(d.id)).length, all.length, 'Coreatures');
    const grid = document.createElement('div'); grid.className = 'codex-grid'; body.appendChild(grid);
    for (const d of all) {
      const seen = c.seen.includes(d.id), owned = c.owned.includes(d.id);
      const card = document.createElement('div'); card.className = 'codex-card' + (seen ? '' : ' unknown');
      card.appendChild(codexPortrait(d.id, seen));
      card.insertAdjacentHTML('beforeend', seen ? `<b>${d.name}${owned ? ' <span class="star" title="Has been in your party">★</span>' : ''}</b><div>${d.types.map(t => typeChip(t)).join(' ')}</div>` : '<b>???</b>');
      grid.appendChild(card);
    }
  } else if (Codex.tab === 'relics') {
    const ids = Object.keys(RELICS);
    count(ids.filter(id => c.relics.includes(id)).length, ids.length, 'relics');
    for (const id of ids) {
      const got = c.relics.includes(id), r = RELICS[id], cv = iconCanvas(id);
      if (!got) { const x = cv.getContext('2d'); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#4a4262'; x.fillRect(0, 0, 14, 14); }
      const row = document.createElement('div'); row.className = 'info-row'; row.appendChild(cv);
      row.insertAdjacentHTML('beforeend', got ? `<div><b data-tip="relic:${id}">${r.name}</b> <span class="tag elem">${TAG_LABEL(id)}</span><br>${r.desc}</div>` : '<div><b>???</b><br><span class="lbl">Not found yet</span></div>');
      body.appendChild(row);
    }
  } else if (Codex.tab === 'bosses') {
    const list = codexBosses();
    count(list.filter(b => c.bosses.includes(b.key)).length, list.length, 'bosses beaten');
    for (const b of list) {
      const got = c.bosses.includes(b.key), row = document.createElement('div'); row.className = 'info-row';
      row.appendChild(codexPortrait(b.mon, got));
      row.insertAdjacentHTML('beforeend', `<div><b>${got ? b.name : '???'}</b><br><span class="lbl">${b.sub}</span>${got ? ' · beaten' : ''}</div>`);
      body.appendChild(row);
    }
  } else {
    const keys = [...new Set(FLOOR_STAGES)];
    count(keys.filter(k => c.areas.includes(k)).length, keys.length, 'areas');
    keys.forEach((k, i) => {
      const got = c.areas.includes(k), S = STAGES[k], row = document.createElement('div'); row.className = 'info-row';
      const sw = document.createElement('canvas'); sw.width = sw.height = 14;
      const x = sw.getContext('2d'); if (got) { S.ground.forEach((col, j) => { x.fillStyle = col; x.fillRect(0, j * 3, 14, 3); }); x.fillStyle = S.wall[1]; x.fillRect(0, 0, 14, 3); } else { x.fillStyle = '#1a1626'; x.fillRect(0, 0, 14, 14); }
      row.appendChild(sw);
      const natives = got ? AREA_MONS[k].natives.map(id => c.seen.includes(id) ? ROSTER_BY_ID[id].name : '???').join(', ') : '';
      row.insertAdjacentHTML('beforeend', `<div><b>${got ? S.name : '???'}</b> <span class="lbl">Floor ${i + 1}</span>${got ? `<br><span class="lbl">Lives here</span> ${natives}` : ''}</div>`);
      body.appendChild(row);
    });
  }
}
document.querySelectorAll('#codex-tabs button').forEach(b => { b.onclick = () => { Sfx.play('select'); Codex.tab = b.dataset.tab; drawCodex(); }; });
$('#btn-codex').onclick = () => { Sfx.init(); Sfx.play('select'); openCodex('title'); };
$('#btn-codex2').onclick = () => { Sfx.play('select'); openCodex('pause'); };
$('#btn-codex-back').onclick = () => { Sfx.play('back'); UI.show(Codex.from); };
