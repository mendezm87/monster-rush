// DOM-side UI: screens, HUD, callouts, banners, move buttons, party menus.

const $ = sel => document.querySelector(sel);

const UI = {
  screens: ['title', 'help', 'starter', 'recruit', 'party', 'pick', 'pause', 'result', 'settings', 'learn'],

  show(name) {
    for (const s of this.screens) $('#screen-' + s).classList.toggle('hidden', s !== name);
  },
  hideScreens() { for (const s of this.screens) $('#screen-' + s).classList.add('hidden'); },

  setRunChrome(on) {
    $('#hud').classList.toggle('hidden', !on);
    $('#controls').classList.toggle('hidden', !on);
    if (!on) { $('#callouts').innerHTML = ''; $('#banner').className = ''; }
  },

  typeTag(t) { return `<span class="tag" style="background:${TYPES[t].color}">${TYPES[t].name}</span>`; },

  // A monster's portrait, name, types, stats and moves (team cards, recruit offers).
  detailHtml(def, extra = '') {
    return `<canvas width="88" height="88"></canvas><div>
      <div class="d-name">${def.name} ${def.types.map(t => this.typeTag(t)).join(' ')}</div>
      <div class="d-stats">HP ${def.hp} · ATK ${Math.round(def.atk * 100)} · DEF ${Math.round(def.def * 100)} · SPD ${def.spd} · ${ITEMS[def.item].name}${extra}</div>
      <div class="d-moves">${def.moves.map(k => `<div class="d-move" style="background:${TYPES[MOVES[k].type].color}">${MOVES[k].name}</div>`).join('')}</div></div>`;
  },
  // A relic or shop good: icon, name, what it does.
  fillItem(el, id, note) {
    const it = itemDef(id);
    el.innerHTML = `<canvas width="16" height="16"></canvas><div><div class="d-name">${it.name}</div>
      <div class="d-desc">${it.desc}</div><div class="d-stats">${note}</div></div>`;
    const c = el.querySelector('canvas').getContext('2d');
    c.imageSmoothingEnabled = false; c.drawImage(itemIcon(id), 0, 0);
  },
  // the relics you hold, under the HUD panel
  drawRelics(run) {
    const box = $('#relics'), key = run.relics.join(',');
    if (box.dataset.key === key) return;
    box.dataset.key = key; box.innerHTML = '';
    for (const id of run.relics) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 16; cv.title = RELICS[id].name + ': ' + RELICS[id].desc;
      const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(itemIcon(id), 0, 0);
      box.appendChild(cv);
    }
  },
  fillDetail(el, def, extra) {
    el.innerHTML = this.detailHtml(def, extra);
    drawPortrait(el.querySelector('canvas'), def.id);
  },

  // A row of party cards. onPick(i) on tap; mark(i) returns extra classes.
  partyCards(el, party, { onPick, mark = () => '', hp = true } = {}) {
    el.innerHTML = '';
    party.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'card ' + (m.fainted ? 'out ' : '') + mark(i);
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      drawPortrait(cv, m.id, { fainted: m.fainted });
      card.appendChild(cv);
      card.insertAdjacentHTML('beforeend',
        `<div class="c-lv">Lv ${m.level}</div><div class="c-name">${m.def.name}</div><div class="c-types">${m.def.types.map(t => this.typeTag(t)).join('')}</div>` +
        (hp ? `<div class="c-hp">${m.fainted ? 'FAINTED' : `${Math.ceil(m.hp)} / ${m.maxHp} HP`}</div>` : ''));
      if (onPick) card.onclick = () => onPick(i);
      el.appendChild(card);
    });
  },

  // ---------------- battle hooks (called by Battle) ----------------
  callout(side, name, type) {
    const el = document.createElement('div');
    const pos = side === 'player' ? 'left' : 'right';
    el.className = 'callout ' + pos;
    el.style.borderColor = TYPES[type].color;
    el.textContent = name + '!';
    const box = $('#callouts');
    [...box.querySelectorAll('.callout.' + pos)].forEach(n => n.remove());
    box.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  },

  banner(text) {
    const b = $('#banner');
    b.textContent = text;
    b.className = '';
    void b.offsetWidth; // restart animation
    b.className = 'show';
  },

  onSendOut(side, mon) {
    if (side === 'player') { this.buildMoveButtons(mon); this.closeSwap(); }
    this.hudCache = {};
  },

  // ---------------- swap tray (does not pause the fight) ----------------
  moveBtns: [],
  swapOpen: false,
  toggleSwap(battle) {
    if (this.swapOpen) { this.closeSwap(); return; }
    if (!battle || (battle.state !== 'fight' && battle.state !== 'explore')) return;
    const tray = $('#swap-tray');
    tray.innerHTML = '';
    this.swapChips = battle.p.map((m, i) => {
      if (i === battle.pi) return null;
      const chip = document.createElement('div');
      chip.className = 'swap-chip';
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
      drawPortrait(cv, m.id, { fainted: m.fainted });
      chip.appendChild(cv);
      chip.insertAdjacentHTML('beforeend', '<div class="mini"><div></div></div>');
      chip.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (battle.swap('player', i)) Sfx.play('ball');
        this.closeSwap();
      });
      tray.appendChild(chip);
      return { el: chip, bar: chip.querySelector('.mini div'), mon: m, i };
    }).filter(Boolean);
    if (!this.swapChips.length) return;
    this.swapOpen = true;
    tray.classList.remove('hidden');
    $('#btn-swap').classList.add('open');
    Sfx.play('select');
  },
  closeSwap() {
    this.swapOpen = false;
    $('#swap-tray').classList.add('hidden');
    $('#btn-swap').classList.remove('open');
  },

  pickNext(team, cb) {
    this.partyCards($('#pick-list'), team, {
      mark: i => (team[i].fainted ? 'done' : ''),
      onPick: i => { if (team[i].fainted) return; Sfx.play('select'); this.hideScreens(); cb(i); },
    });
    this.show('pick');
  },

  // ---------------- HUD ----------------
  buildMoveButtons(mon) {
    const box = $('#move-buttons');
    box.innerHTML = '';
    const keys = Input.labels(0);
    // with the mouse layout, each button shows a little mouse with its side filled in
    this.moveBtns = mon.moves.map((mv, i) => {
      const b = document.createElement('div');
      b.className = 'mbtn';
      const col = TYPES[mv.type].color;
      b.style.background = `linear-gradient(${col}, ${shadeHex(col, -0.25)})`;
      const key = `${i >= 2 ? '<b>⇧</b>' : ''}${mouseIcon(i % 2 === 0 ? 'left' : 'right')}`;
      b.title = keys[i].replace('⇧', 'Shift +') + ' or ' + Input.keyName(Input.keysFor('move' + (i + 1))[0]);
      b.innerHTML = `<span class="key">${key}</span><span class="nm">${mv.name}</span><div class="cd"></div>`;
      Input.bindMoveButton(b, i, 0);
      box.appendChild(b);
      return { el: b, cd: b.querySelector('.cd') };
    });
    $('#btn-swap .key').textContent = Input.swapLabel();
  },

  hudCache: {},
  updateHud(battle) {
    this.updateSide('#hud-p', battle.P, battle.p, battle.pi);
    this.drawRelics(battle.run);
    const floor = `FLOOR ${battle.run.floorN}`;
    if (this.hudCache.floor !== floor) { $('#floor-label').textContent = floor; this.hudCache.floor = floor; }
    // the boss gets a big bar along the top
    const boss = battle.boss, bb = $('#boss-bar');
    const showBoss = !!boss && boss.visible && !boss.fainted;
    bb.classList.toggle('hidden', !showBoss);
    if (showBoss) {
      const c = this.hudCache.boss || (this.hudCache.boss = { ghost: boss.hp });
      if (c.id !== boss.id) { c.id = boss.id; bb.querySelector('.boss-name').textContent = boss.def.name; c.ghost = boss.hp; }
      c.ghost = c.ghost > boss.hp ? Math.max(boss.hp, c.ghost - boss.maxHp * 0.4 / 60) : boss.hp;
      bb.querySelector('.fill').style.width = (boss.hp / boss.maxHp * 100) + '%';
      bb.querySelector('.ghost').style.width = (c.ghost / boss.maxHp * 100) + '%';
    }
    const scd = Math.max(0, battle.run.swapCd);
    $('#btn-swap .cd').style.height = (scd / 8 * 100) + '%';
    $('#btn-swap').classList.toggle('off', battle.p.length < 2);
    if (this.swapOpen) {
      if (battle.state !== 'fight' && battle.state !== 'explore') this.closeSwap();
      else for (const c of this.swapChips) {
        const pct = c.mon.hp / c.mon.maxHp;
        c.bar.style.width = (pct * 100) + '%';
        c.bar.style.background = pct > 0.5 ? 'var(--hp-hi)' : pct > 0.2 ? 'var(--hp-mid)' : 'var(--hp-lo)';
        c.el.classList.toggle('off', !battle.canSwap('player', c.i));
      }
    }
    const m = battle.P;
    const calm = battle.state !== 'fight';
    $('#move-buttons').classList.toggle('calm', calm);
    this.moveBtns.forEach((b, i) => {
      if (!m.moves[i]) return;
      const full = m.moves[i].cd * m.cdMul();
      b.cd.style.height = (m.cd[i] > 0 ? (m.cd[i] / full) * 100 : 0) + '%';
    });
  },

  updateSide(sel, mon, team, idx) {
    const root = $(sel);
    const c = this.hudCache.p || (this.hudCache.p = { ghost: mon.hp });
    if (c.id !== mon.id + idx) {
      c.id = mon.id + idx; c.ghost = mon.hp;
      drawPortrait(root.querySelector('.portrait canvas'), mon.id, { zoom: 1.6, crop: true });
      c.tags = null; c.name = null;
    }
    const name = `${mon.def.name}<span class="lv">Lv ${mon.level}</span>`;
    if (c.name !== name) { root.querySelector('.mon-name').innerHTML = name; c.name = name; }
    root.querySelector('.xpbar div').style.width = (mon.xp / XP_NEED(mon.level) * 100) + '%';
    const tags = mon.def.types.map(t => this.typeTag(t)).join('') +
      (mon.status ? `<span class="tag status ${mon.status}">${mon.status.toUpperCase()}</span>` : `<span class="tag item">${mon.item.name || ''}</span>`);
    if (c.tags !== tags) { root.querySelector('.tags').innerHTML = tags; c.tags = tags; }

    const pct = mon.hp / mon.maxHp;
    c.ghost = c.ghost > mon.hp ? Math.max(mon.hp, c.ghost - mon.maxHp * 0.6 / 60) : mon.hp;
    const fill = root.querySelector('.fill'), ghost = root.querySelector('.ghost');
    fill.style.width = (pct * 100) + '%';
    fill.style.background = pct > 0.5 ? 'var(--hp-hi)' : pct > 0.2 ? 'var(--hp-mid)' : 'var(--hp-lo)';
    ghost.style.width = (c.ghost / mon.maxHp * 100) + '%';
    const hpText = `${Math.ceil(mon.hp)} / ${mon.maxHp}`;
    if (c.hp !== hpText) { root.querySelector('.hpnum').textContent = hpText; c.hp = hpText; }

    const balls = team.map((m, i) => `<div class="ball${m.fainted ? ' out' : ''}${i === idx && !m.fainted ? ' active' : ''}"></div>`).join('');
    if (c.balls !== balls) { root.querySelector('.balls').innerHTML = balls; c.balls = balls; }
  },
};

function shadeHex(hex, amt) {
  const [r, g, b] = hexRgb(hex);
  const f = v => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// A small mouse outline with the left or right button filled in.
function mouseIcon(side) {
  const fill = side === 'left' ? 'M5 0.6A4.4 4.4 0 0 0 0.6 5V6H5Z' : 'M5 0.6A4.4 4.4 0 0 1 9.4 5V6H5Z';
  return `<svg class="mouse-ico" viewBox="0 0 10 14" aria-hidden="true"><path d="${fill}" fill="currentColor"/>` +
    '<rect x="0.6" y="0.6" width="8.8" height="12.8" rx="4.4" fill="none" stroke="currentColor" stroke-width="1.1"/>' +
    '<path d="M5 0.6V6M0.6 6H9.4" stroke="currentColor" stroke-width="1.1"/></svg>';
}
