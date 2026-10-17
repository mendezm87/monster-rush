// DOM-side UI: screens, HUD, callouts, banners, move buttons.

const $ = sel => document.querySelector(sel);

const UI = {
  screens: ['title', 'help', 'online', 'team', 'pick', 'pause', 'result'],

  show(name) {
    for (const s of this.screens) $('#screen-' + s).classList.toggle('hidden', s !== name);
  },
  hideScreens() { for (const s of this.screens) $('#screen-' + s).classList.add('hidden'); },

  setBattleChrome(on) {
    $('#hud').classList.toggle('hidden', !on);
    $('#controls').classList.toggle('hidden', !on);
    $('#controls2').classList.toggle('hidden', !on || !this.twoP);
    if (!on) { $('#callouts').innerHTML = ''; $('#banner').className = ''; }
  },

  typeTag(t) { return `<span class="tag" style="background:${TYPES[t].color}">${TYPES[t].name}</span>`; },

  // ---------------- battle hooks (called by Battle) ----------------
  callout(side, name, type) {
    const el = document.createElement('div');
    const pos = side === this.mySide ? 'left' : 'right';
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
    if (side === this.mySide) { this.buildMoveButtons(mon, 0); this.closeSwap(); }
    else if (this.twoP) this.buildMoveButtons(mon, 1);
    this.hudCache = {};
  },

  // ---------------- swap tray (does not pause the fight) ----------------
  twoP: false,      // set by main.js for the current battle
  tabletop: false,  // 2-player on one touch screen, player 2's side rotated
  mySide: 'player', // the side this screen plays: 'enemy' for an online guest
  onSwapPick: null, // online guest: send the swap to the host instead of doing it

  // this screen's own side of a battle
  own(b) {
    return this.mySide === 'enemy' ? { side: 'enemy', mon: b.E, team: b.e, idx: b.ei } : { side: 'player', mon: b.P, team: b.p, idx: b.pi };
  },
  moveBtns: [],

  swapOpen: false,
  toggleSwap(battle) {
    if (this.swapOpen) { this.closeSwap(); return; }
    if (!battle || battle.state !== 'fight') return;
    const tray = $('#swap-tray');
    tray.innerHTML = '';
    const me = this.own(battle);
    this.swapChips = me.team.map((m, i) => {
      if (i === me.idx) return null;
      const chip = document.createElement('div');
      chip.className = 'swap-chip';
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
      drawPortrait(cv, m.id, { fainted: m.fainted });
      chip.appendChild(cv);
      chip.insertAdjacentHTML('beforeend', '<div class="mini"><div></div></div>');
      chip.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (this.onSwapPick) this.onSwapPick(i);
        else if (battle.swap(me.side, i)) Sfx.play('ball');
        this.closeSwap();
      });
      tray.appendChild(chip);
      return { el: chip, bar: chip.querySelector('.mini div'), mon: m, i };
    }).filter(Boolean);
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

  // who: null in 1P, else 'player' / 'enemy' to say whose turn it is.
  pickNext(team, cb, who = null) {
    const scr = $('#screen-pick');
    scr.querySelector('h2').textContent = who ? `Player ${who === 'player' ? 1 : 2}: choose your next monster` : 'Choose your next monster';
    scr.classList.toggle('flip', this.tabletop && who === 'enemy');
    const list = $('#pick-list');
    list.innerHTML = '';
    team.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'card' + (m.fainted ? ' done' : '');
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      drawPortrait(cv, m.id, { fainted: m.fainted });
      card.appendChild(cv);
      card.insertAdjacentHTML('beforeend',
        `<div class="c-name">${m.def.name}</div><div class="c-types">${m.def.types.map(t => this.typeTag(t)).join('')}</div>
         <div class="c-hp">${m.fainted ? 'FAINTED' : `${Math.ceil(m.hp)} / ${m.maxHp} HP`}</div>`);
      if (!m.fainted) card.onclick = () => { Sfx.play('select'); this.hideScreens(); cb(i); };
      list.appendChild(card);
    });
    this.show('pick');
  },

  onEnd(r) {
    setTimeout(() => {
      const title = r.twoP ? { win: 'PLAYER 1 WINS!', lose: 'PLAYER 2 WINS!', draw: 'DRAW' }[r.result]
        : { win: 'VICTORY!', lose: 'DEFEAT', draw: 'DRAW' }[r.result];
      $('#result-title').textContent = title;
      const mm = Math.floor(r.time / 60), ss = String(Math.floor(r.time % 60)).padStart(2, '0');
      $('#result-stats').innerHTML = r.twoP
        ? `Time ${mm}:${ss}<br>Knockouts P1 ${r.kos} &nbsp;·&nbsp; P2 ${r.lost}<br>Damage P1 ${r.dealt} &nbsp;·&nbsp; P2 ${r.dealtE}`
        : `Time ${mm}:${ss}<br>Knockouts ${r.kos} &nbsp;·&nbsp; Lost ${r.lost}<br>Damage dealt ${r.dealt}`;
      this.show('result');
    }, 1200);
  },

  // ---------------- HUD ----------------
  // p: 0 = bottom player, 1 = player 2 (2-player mode only)
  buildMoveButtons(mon, p = 0) {
    const box = $(p ? '#move-buttons2' : '#move-buttons');
    box.innerHTML = '';
    const keys = Input.labels(p);
    // with the mouse layout, each button shows a little mouse with its side filled in
    const mouse = p === 0 && Input.mode === 'solo';
    this.moveBtns[p] = mon.moves.map((mv, i) => {
      const b = document.createElement('div');
      b.className = 'mbtn';
      const col = TYPES[mv.type].color;
      b.style.background = `linear-gradient(${col}, ${shadeHex(col, -0.25)})`;
      const key = mouse ? `${i >= 2 ? '<b>⇧</b>' : ''}${mouseIcon(i % 2 === 0 ? 'left' : 'right')}` : keys[i];
      b.title = keys[i].replace('⇧', 'Shift +');
      b.innerHTML = `<span class="key">${key}</span><span class="nm">${mv.name}</span><div class="cd"></div>`;
      b.style.display = 'flex'; b.style.alignItems = 'center'; b.style.justifyContent = 'center';
      Input.bindMoveButton(b, i, p);
      box.appendChild(b);
      return { el: b, cd: b.querySelector('.cd') };
    });
  },

  hudCache: {},
  updateHud(battle) {
    // left panel is always this screen's own side
    const flip = this.mySide === 'enemy';
    const sides = [['#hud-p', battle.P, battle.p, battle.pi, 'player'], ['#hud-e', battle.E, battle.e, battle.ei, 'rival']];
    if (flip) sides.reverse();
    this.updateSide('#hud-p', ...sides[0].slice(1), 'p');
    this.updateSide('#hud-e', ...sides[1].slice(1), 'e');
    const t = Math.floor(battle.clock);
    const ts = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    if (this.hudCache.time !== ts) { $('#timer').textContent = ts; this.hudCache.time = ts; }
    const me = this.own(battle);
    const scd = Math.max(0, battle.swapCd[me.side]);
    $('#btn-swap .cd').style.height = (scd / 8 * 100) + '%';
    if (this.swapOpen) {
      if (battle.state !== 'fight') this.closeSwap();
      else for (const c of this.swapChips) {
        const pct = c.mon.hp / c.mon.maxHp;
        c.bar.style.width = (pct * 100) + '%';
        c.bar.style.background = pct > 0.5 ? 'var(--hp-hi)' : pct > 0.2 ? 'var(--hp-mid)' : 'var(--hp-lo)';
        c.el.classList.toggle('off', !battle.canSwap(me.side, c.i));
      }
    }
    if (this.twoP) $('#btn-swap2 .cd').style.height = (Math.max(0, battle.swapCd.enemy) / 8 * 100) + '%';
    this.moveBtns.forEach((btns, p) => {
      const m = p ? battle.E : me.mon;
      if (!btns || (p && !this.twoP)) return;
      btns.forEach((b, i) => {
        const full = m.moves[i].cd * (m.item.cd || 1);
        b.cd.style.height = (m.cd[i] > 0 ? (m.cd[i] / full) * 100 : 0) + '%';
      });
    });
  },

  // trainer: which trainer palette to show ('player' / 'rival'); key: HUD cache slot
  updateSide(sel, mon, team, idx, trainer, key) {
    const root = $(sel);
    const c = this.hudCache[key] || (this.hudCache[key] = { ghost: mon.hp });
    if (c.id !== mon.id + idx) {
      c.id = mon.id + idx; c.ghost = mon.hp;
      root.querySelector('.mon-name').textContent = mon.def.name;
      drawPortrait(root.querySelector('.portrait canvas'), mon.id, { zoom: 1.6, crop: true });
      const tc = root.querySelector('.trainer-icon canvas');
      const ctx = tc.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 24, 24);
      ctx.drawImage(trainerCanvas(trainer, false), 0, 0, 12, 12, 0, 0, 24, 24);
      c.tags = null;
    }
    const tags = mon.def.types.map(t => this.typeTag(t)).join('') +
      (mon.status ? `<span class="tag status ${mon.status}">${mon.status.toUpperCase()}</span>` : `<span class="tag item">${mon.item.name || ''}</span>`);
    if (c.tags !== tags) { root.querySelector('.tags').innerHTML = tags; c.tags = tags; }

    const pct = mon.hp / mon.maxHp;
    c.ghost = c.ghost > mon.hp ? Math.max(mon.hp, c.ghost - mon.maxHp * 0.6 / 60) : mon.hp;
    const fill = root.querySelector('.fill'), ghost = root.querySelector('.ghost');
    fill.style.width = (pct * 100) + '%';
    fill.style.background = pct > 0.5 ? 'var(--hp-hi)' : pct > 0.2 ? 'var(--hp-mid)' : 'var(--hp-lo)';
    ghost.style.width = (c.ghost / mon.maxHp * 100) + '%';
    const hpText = String(Math.ceil(mon.hp));
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
