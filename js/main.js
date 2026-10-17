// App bootstrap: menus, starter pick, room-to-room flow, game loop.

// Shown on the title screen so players can tell whether their browser has the latest
// build (GitHub Pages lets browsers cache files for up to 10 minutes). Bump on every release.
const VERSION = '2026.10.17-r12';

const App = {
  endless: false,   // the mode picked on the title screen
  run: null,        // the current RunState
  battle: null,     // the current room
  paused: false,
  starter: null,
};

const canvas = $('#view');
const ctx = canvas.getContext('2d');
buildSprites();

// ---------- menu backdrop: a meadow with a few idle monsters ----------
const Backdrop = {
  init() {
    this.stage = buildBackdrop('meadow', 12345);
    this.petals = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 10 + Math.random() * 14, c: Math.random() < 0.5 ? '#ffd0e0' : '#ffffff' }));
    this.mons = ['slumbear', 'sparkit', 'smugshi', 'tidalisk', 'cinderox', 'galewing'].map((id, i) => ({ id, x: 60 + i * 92, y: 270 + (i % 2) * 22, face: i % 2 ? -1 : 1 }));
  },
  render(dt, t) {
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.stage.canvas, 0, 0);
    for (const m of this.mons) {
      const sp = SPRITES[m.id];
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, sp.size / 2, sp.size / 6, 0, 0, Math.PI * 2); ctx.fill();
      const bob = Math.sin(t * 3 + m.x) > 0.6 ? -1 : 0;
      const S = sp.size * 1.5;
      ctx.save(); ctx.translate(Math.round(m.x), Math.round(m.y + bob)); if (m.face < 0) ctx.scale(-1, 1);
      ctx.drawImage(sp.img, -S / 2, -S + 3, S, S); ctx.restore();
    }
    for (const f of this.petals) {
      f.y += f.v * dt; f.x += (12 + Math.sin(t + f.y * 0.05) * 6) * dt;
      if (f.y > H) { f.y = -2; f.x = Math.random() * W; }
      if (f.x > W) f.x = -2;
      ctx.fillStyle = f.c; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2);
    }
  },
};
Backdrop.init();

// ---------- title ----------
$('#btn-play').onclick = () => { Sfx.init(); Sfx.play('select'); App.endless = false; openStarter(); };
$('#btn-endless').onclick = () => { Sfx.init(); Sfx.play('select'); App.endless = true; openStarter(); };
$('#btn-help').onclick = () => { Sfx.init(); Sfx.play('select'); UI.show('help'); };
$('#btn-help-back').onclick = () => { Sfx.play('back'); UI.show('title'); };
const muteBtn = $('#btn-mute');
function toggleMute() { Sfx.init(); const m = Sfx.toggle(); muteBtn.textContent = 'Sound: ' + (m ? 'Off' : 'On'); }
muteBtn.onclick = toggleMute;
Input.onMute = toggleMute;

// ---------- starter pick ----------
function openStarter() {
  App.starter = null;
  $('#starter-title').textContent = App.endless ? 'Endless: choose your starter' : 'Choose your starter';
  const list = $('#starter-list');
  list.innerHTML = '';
  for (const id of Save.data.starters) {
    const def = ROSTER_BY_ID[id];
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.id = id;
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
    drawPortrait(cv, id);
    card.appendChild(cv);
    card.insertAdjacentHTML('beforeend', `<div class="c-name">${def.name}</div><div class="c-types">${def.types.map(t => UI.typeTag(t)).join('')}</div>`);
    card.onclick = () => {
      Sfx.play('select');
      App.starter = id;
      list.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.id === id));
      UI.fillDetail($('#starter-detail'), def);
      $('#btn-starter-go').disabled = false;
    };
    list.appendChild(card);
  }
  $('#starter-detail').innerHTML = `<div class="hint">Pick the monster you start the run with. You can recruit more along the way.<br>
    Beat a monster as a boss to unlock it as a starter (${Save.data.starters.length} of ${ROSTER.length} unlocked).</div>`;
  $('#btn-starter-go').disabled = true;
  UI.show('starter');
}
$('#btn-starter-back').onclick = () => { Sfx.play('back'); UI.show('title'); };
$('#btn-starter-go').onclick = () => { if (App.starter) { Sfx.play('select'); startRun(App.starter); } };

// ---------- the run ----------
Input.bindStick($('#stick-zone'), $('#stick'), $('#knob'), 0);

function startRun(starterId) {
  App.run = new RunState(starterId, App.endless);
  UI.hideScreens();
  UI.setRunChrome(true);
  Input.mouse = true;
  Input.reset();
  Sfx.init(); Sfx.resume(); Sfx.music.start();
  App.paused = false;
  enterRoom(App.run.room, null);
  UI.banner('FLOOR 1');
}

const roomHooks = {
  exit(dir) { transition(() => enterRoom(App.run.room.doors[dir], DOOR_DIRS[dir][2])); },
  stairs() {
    transition(() => {
      const run = App.run;
      run.stats.floors++;
      run.newFloor(run.floorN + 1);
      enterRoom(run.room, null);
      UI.banner(`FLOOR ${run.floorN}`);
    });
  },
  offer(ped) { openOffer(ped); },
  bossBeaten(id) { if (Save.unlockStarter(id)) setTimeout(() => UI.banner(`NEW STARTER: ${ROSTER_BY_ID[id].name}!`), 2000); },
  end(result) { const record = Save.endRun(App.run.floorN, result === 'win', App.run.endless); showResult(result, record); },
};

function enterRoom(room, entry) {
  App.run.room = room;
  App.battle = new Battle({ run: App.run, room, entry, ui: UI, hooks: roomHooks });
  UI.hudCache = {};
  UI.closeSwap();
  UI.buildMoveButtons(App.battle.P);
  UI.drawRelics(App.run);
}

// A quick fade to black between rooms.
function transition(fn) {
  const f = $('#fade');
  f.classList.add('on');
  setTimeout(() => { if (App.run) fn(); f.classList.remove('on'); }, 200);
}

function titleStats() {
  const d = Save.data;
  $('#title-stats').textContent = d.runs ? `Runs ${d.runs} · Wins ${d.wins}${d.bestEndless ? ` · Endless best floor ${d.bestEndless}` : ''} · Starters ${d.starters.length}/${ROSTER.length}` : '';
}

function leaveRun(to) {
  App.battle = null; App.run = null; App.paused = false;
  Sfx.resume(); Sfx.music.stop();
  UI.setRunChrome(false);
  Input.mouse = false;
  titleStats();
  if (to === 'title') UI.show('title'); else if (to === 'starter') openStarter();
}

function showResult(result, record = false) {
  const run = App.run;
  setTimeout(() => {
    if (App.run !== run) return;
    $('#result-title').textContent = result === 'win' ? 'RUN CLEARED!' : run.endless ? (record ? 'NEW RECORD!' : 'ENDLESS OVER') : 'RUN OVER';
    const t = Math.floor(run.stats.time), ts = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    $('#result-stats').innerHTML = `Reached floor ${run.floorN}${run.endless ? ` (best ${Save.data.bestEndless})` : ''} &nbsp;·&nbsp; Time ${ts}<br>
      Rooms cleared ${run.stats.rooms} &nbsp;·&nbsp; Wild monsters beaten ${run.stats.kos}<br>
      Coins ${run.coins} &nbsp;·&nbsp; Relics ${run.relics.length}<br>
      Party ${run.party.map(m => `${m.def.name} Lv ${m.level}`).join(', ')}`;
    UI.show('result');
  }, 1400);
}
$('#btn-again').onclick = () => { Sfx.play('select'); leaveRun('starter'); };
$('#btn-title').onclick = () => { Sfx.play('back'); leaveRun('title'); };

// ---------- offers: recruit rooms, the shop, treasure ----------
const Offer = { ped: null, release: -1 };
function openOffer(ped) {
  const run = App.run;
  Offer.ped = ped; Offer.release = -1;
  const yes = $('#btn-recruit-yes'), full = ped.kind === 'mon' && run.party.length >= 6;
  $('#recruit-full').classList.toggle('hidden', !full);
  if (ped.kind === 'mon') {
    const def = ROSTER_BY_ID[ped.id];
    $('#recruit-title').textContent = `Recruit ${def.name}?`;
    UI.fillDetail($('#recruit-detail'), def, ` · joins at Lv ${run.joinLevel()}`);
    if (full) drawOfferParty();
    yes.textContent = 'RECRUIT'; yes.disabled = full;
  } else {
    const it = itemDef(ped.id), relic = !!RELICS[ped.id];
    $('#recruit-title').textContent = ped.kind === 'shop' ? 'Shop' : 'Treasure!';
    UI.fillItem($('#recruit-detail'), ped.id, relic ? 'Relic: lasts the whole run' : 'Used straight away');
    if (ped.kind === 'shop') {
      const price = ped.item.price, useful = relic || run.useGood(ped.id, true);
      yes.textContent = run.coins < price ? `NEED ${price} COINS` : !useful ? 'NOT NEEDED NOW' : `BUY FOR ${price}`;
      yes.disabled = run.coins < price || !useful;
    } else { yes.textContent = 'TAKE IT'; yes.disabled = false; }
  }
  App.paused = true;
  UI.show('recruit');
}
function drawOfferParty() {
  UI.partyCards($('#recruit-party'), App.run.party, {
    mark: i => (i === Offer.release ? 'sel' : ''),
    onPick: i => {
      Sfx.play('select');
      Offer.release = i;
      drawOfferParty();
      $('#btn-recruit-yes').disabled = false;
      $('#btn-recruit-yes').textContent = `SWAP FOR ${App.run.party[i].def.name}`;
    },
  });
}
function closeOffer(took) {
  const b = App.battle, ped = Offer.ped;
  UI.hideScreens();
  App.paused = false;
  if (!b) return;
  b.offerDone(ped, took);
  if (!took) {   // step back from the pedestal
    const P = b.P;
    const d = Math.hypot(P.x - ped.x, P.y - ped.y) || 1;
    P.x += (P.x - ped.x) / d * 14; P.y += (P.y - ped.y) / d * 14;
  }
}
$('#btn-recruit-no').onclick = () => { Sfx.play('back'); closeOffer(false); };
$('#btn-recruit-yes').onclick = () => {
  const run = App.run, b = App.battle, ped = Offer.ped;
  if (!run || !b || !ped) return;
  if (ped.kind === 'mon') {
    if (run.party.length >= 6 && Offer.release < 0) return;
    const before = b.P, at = { x: before.x, y: before.y };
    const m = run.recruit(ped.id, run.party.length >= 6 ? Offer.release : -1);
    if (b.P !== before) b.replaceActive(at);
    Save.noteRecruit(ped.id);
    UI.hudCache = {};
    closeOffer(true);
    UI.banner(`${m.def.name} JOINED!`);
    return;
  }
  if (ped.kind === 'shop') {
    if (run.coins < ped.item.price) return;
    run.coins -= ped.item.price;
  }
  if (RELICS[ped.id]) { run.addRelic(ped.id); UI.banner(`GOT ${RELICS[ped.id].name}!`); }
  else { run.useGood(ped.id); UI.banner(GOODS[ped.id].name + '!'); }
  UI.hudCache = {};
  closeOffer(true);
};

// ---------- party screen (from the pause menu) ----------
const Party = { sel: -1, confirm: false };
function openParty() {
  Party.sel = -1; Party.confirm = false;
  drawParty();
  UI.show('party');
}
function canRelease(i) {
  const run = App.run, b = App.battle;
  if (!run || run.party.length < 2) return false;
  if (i === run.pi && b && b.state !== 'explore') return false;   // can't drop the monster that's out mid-fight
  return run.party.some((m, j) => j !== i && !m.fainted);
}
function drawParty() {
  const run = App.run;
  $('#party-count').textContent = `${run.party.length}/6`;
  UI.partyCards($('#party-list'), run.party, {
    mark: i => (i === Party.sel ? 'sel' : '') + (i === run.pi ? ' lead' : ''),
    onPick: i => { Sfx.play('select'); Party.sel = i; Party.confirm = false; drawParty(); },
  });
  const btn = $('#btn-release');
  if (Party.sel < 0) {
    $('#party-detail').innerHTML = '<div class="hint">Tap a monster to see its moves, or to release it from your party.</div>';
    btn.disabled = true; btn.textContent = 'Release';
    return;
  }
  const m = run.party[Party.sel];
  UI.fillDetail($('#party-detail'), m.def, ` · ${m.fainted ? 'FAINTED' : `${Math.ceil(m.hp)} HP left`}`);
  btn.disabled = !canRelease(Party.sel);
  btn.textContent = Party.confirm ? `Really release ${m.def.name}?` : 'Release';
}
$('#btn-release').onclick = () => {
  const run = App.run, b = App.battle;
  if (!run || Party.sel < 0 || !canRelease(Party.sel)) return;
  if (!Party.confirm) { Sfx.play('select'); Party.confirm = true; drawParty(); return; }
  Sfx.play('back');
  const before = b.P, at = { x: before.x, y: before.y };
  run.release(Party.sel);
  if (b.P !== before) b.replaceActive(at);
  UI.hudCache = {};
  Party.sel = -1; Party.confirm = false;
  drawParty();
};
$('#btn-party-back').onclick = () => { Sfx.play('back'); UI.show('pause'); };
$('#btn-party').onclick = () => { Sfx.play('select'); openParty(); };

// ---------- pause / swap ----------
function setPaused(on) {
  App.paused = on;
  Input.reset();
  if (on) { UI.show('pause'); Sfx.pause(); } else { UI.hideScreens(); Sfx.resume(); }
}
function togglePause() {
  const b = App.battle;
  if (!b || b.state === 'over' || b.state === 'pick' || b.state === 'leaving') return;
  setPaused(!App.paused);
}
Input.onPause = togglePause;

// Swap key / bumper: instant swap to the next healthy teammate (no pause)
function cycleSwap() {
  const b = App.battle;
  if (!b || App.paused) return;
  for (let k = 1; k < b.p.length; k++) {
    const i = (b.pi + k) % b.p.length;
    if (b.canSwap('player', i)) { b.swap('player', i); Sfx.play('ball'); return; }
  }
}
Input.onSwap = cycleSwap;
$('#btn-swap').addEventListener('pointerdown', e => { e.preventDefault(); UI.toggleSwap(App.battle); });
$('#btn-pause').onclick = togglePause;
$('#btn-resume').onclick = togglePause;
$('#btn-quit').onclick = () => { Sfx.play('back'); leaveRun('title'); };
document.addEventListener('visibilitychange', () => { if (document.hidden && App.battle && !App.paused) togglePause(); });

// ---------- loop ----------
let last = performance.now(), clockT = 0;
function frame(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
  last = now; clockT += dt;
  Input.poll();
  const b = App.battle;
  if (b) {
    if (!App.paused && b.state !== 'pick') b.update(dt);
    b.render(ctx);
    UI.updateHud(b);
  } else {
    Backdrop.render(dt, clockT);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
$('#version').textContent = 'version ' + VERSION;
titleStats();
UI.show('title');

// Debug / testing hook
window.__MBS = App;
