// Drawing: sprite tints and item icons, and Battle's effects (shake, particles,
// numbers, weather) and rendering of a room. See battle.js.

const BALL_IMG = gridFromMap([
  '.kkkk.',
  'krrrrk',
  'kkwwkk',
  'kwwwwk',
  '.kkkk.',
], { k: OUTLINE, r: '#e8433a', w: '#f6f2ee' }).toCanvas();

const COIN_IMG = gridFromMap([
  '.kkk.',
  'kyyhk',
  'kyowk',
  'kyowk',
  'kooyk',
  '.kkk.',
], { k: OUTLINE, y: '#ffd23f', o: '#d8902a', h: '#fff6c8', w: '#fff6c8' }).toCanvas();

const BERRY_IMG = gridFromMap([
  '..gg..',
  '.kgk..',
  'krrhrk',
  'krrrhk',
  'krrrrk',
  '.kddk.',
  '..kk..',
], { k: OUTLINE, g: '#4fae2e', r: '#e8435a', h: '#ffb0c0', d: '#a82a40' }).toCanvas();

// 14px icons for relics and shop goods.
const ICON_ART = {
  leechLens(g) { g.ellipse(6.5, 6.5, 5.5, 5.5, P('#c8d6ff', '#8a9ad0', '#ffffff')); g.ellipse(6.5, 6.5, 3, 3, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[10, 10], [13, 13], [12, 14], [9, 11]], '#8a6a4a'); },
  emberTracks(g) { g.poly([[2, 5], [6, 5], [6, 9], [12, 9], [12, 13], [2, 13]], P('#8a5a3a', '#5a3a22', '#b07a52')); g.poly([[9, 0], [13, 5], [11, 8], [8, 6]], P('#ff7a1c', '#e2401a', '#ffd34a')); },
  muscleCharm(g) { g.ellipse(7, 7, 5.5, 5, P('#d9a066', '#a8703e', '#f2c896')); g.rect(3, 5, 8, 1, '#a8703e'); g.rect(3, 8, 8, 1, '#a8703e'); g.rect(2, 11, 10, 2, '#d23a3a'); },
  ironShell(g) { g.poly([[1, 1], [13, 1], [13, 7], [7, 13], [1, 7]], P('#a8b0c4', '#6e7690', '#dfe4f0')); g.rect(7, 2, 1, 9, '#6e7690'); g.rect(2, 5, 11, 1, '#6e7690'); },
  swiftBoots(g) { g.poly([[3, 5], [7, 5], [7, 9], [13, 9], [13, 13], [3, 13]], P('#5aa0ff', '#2a6ad0', '#a8d0ff')); g.poly([[0, 3], [5, 0], [6, 5], [1, 6]], P('#ffffff', '#c8d6ff', '#ffffff')); },
  hourglass(g) { g.rect(2, 0, 10, 2, '#8a6a4a'); g.rect(2, 12, 10, 2, '#8a6a4a'); g.poly([[3, 2], [11, 2], [7, 7]], P('#c8f0ff', '#8ac8e8', '#ffffff')); g.poly([[3, 12], [11, 12], [7, 7]], P('#c8f0ff', '#8ac8e8', '#ffffff')); g.poly([[4, 12], [10, 12], [7, 9]], '#ffd23f'); },
  luckyCoin(g) { g.ellipse(7, 7, 6, 6, P('#ffd23f', '#d8902a', '#fff6c8')); g.ellipse(5.5, 6, 1.6, 1.6, '#4fae2e'); g.ellipse(8.5, 6, 1.6, 1.6, '#4fae2e'); g.ellipse(7, 8.6, 1.6, 1.6, '#4fae2e'); },
  berryBasket(g) { g.ellipse(4, 5, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.ellipse(7.5, 4, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.ellipse(11, 5, 2.2, 2.2, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[1, 7], [14, 7], [12, 13], [3, 13]], P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(3, 9, 9, 1, '#8a6a3a'); },
  splitShot(g) { g.ellipse(4, 10, 3, 3, P('#7af0e0', '#3ab8b0', '#e0fffa')); g.ellipse(10, 4, 3, 3, P('#7af0e0', '#3ab8b0', '#e0fffa')); g.rect(1, 3, 4, 1, '#3ab8b0'); g.rect(7, 11, 4, 1, '#3ab8b0'); },
  staticCharm(g) { g.poly([[8, 0], [2, 8], [6, 8], [4, 14], [12, 5], [8, 5], [10, 0]], P('#ffd84a', '#e0a722', '#fff3a0')); },
  blastCore(g) {
    const pts = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 3 : 6.5; pts.push([7 + Math.cos(a) * r, 7 + Math.sin(a) * r]); }
    g.poly(pts, P('#ff5a2a', '#c8301a', '#ffb06a')); g.ellipse(7, 7, 2.2, 2.2, '#ffe066');
  },
  bigBerry(g) { g.ellipse(7, 8, 5.5, 5, P('#e8435a', '#a82a40', '#ffb0c0')); g.poly([[6, 3], [9, 0], [11, 2], [8, 4]], '#4fae2e'); g.px(5, 6, '#ffffff'); },
  picnic(g) { g.poly([[1, 6], [13, 6], [12, 13], [2, 13]], P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(1, 5, 12, 2, '#e8435a'); for (let x = 2; x < 13; x += 3) g.rect(x, 5, 1, 2, '#ffffff'); g.rect(4, 1, 1, 4, '#8a6a3a'); g.rect(9, 1, 1, 4, '#8a6a3a'); g.rect(4, 1, 6, 1, '#8a6a3a'); },
  revive(g) { g.ellipse(7, 10, 4.5, 3.5, P('#c89a5a', '#8a6a3a', '#e8c08a')); g.rect(7, 3, 1, 5, '#4fae2e'); g.ellipse(4.5, 4, 2.5, 1.5, '#8be04e'); g.ellipse(10, 3, 2.5, 1.5, '#8be04e'); },
};
const _icons = {};
function itemIcon(id) {
  if (_icons[id]) return _icons[id];
  const g = new PixGrid(16, 16), inner = new PixGrid(14, 14);
  ICON_ART[id](inner);
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { const c = inner.get(x, y); if (c) g.set(x + 1, y + 1, c); }
  g.outline();
  return (_icons[id] = g.toCanvas());
}

// Lazily tinted sprite variants (freeze / burn / paralysis / buff glow).
const _tint = {};
function tinted(id, color, view = 'front') {
  const key = id + color + view;
  if (_tint[key]) return _tint[key];
  const src = SPRITES[id].views[view];
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
  return (_tint[key] = cv);
}

// ------------------------------------------------------------------ Monster

mixInto(Battle, class {
  // ---------------------------------------------------------- fx helpers
  addShake(v) { this.shake = Math.max(this.shake, v); }

  // k: how far above the ground the burst happens (body height by default)
  burst(x, y, cols, n, speed, vy0 = 0, k = 19) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(0.2, 1) * speed;
      this.particles.push({ x, y, g: y + k, vx: Math.cos(a) * s, vy: Math.sin(a) * s + vy0, life: rand(0.25, 0.6), max: 0.6, size: rand(1, 3.5), color: cols[(Math.random() * cols.length) | 0], kind: 'sq', drag: 3 });
    }
  }

  sparks(x, y, n, color = '#ffffff') {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(120, 260);
      this.particles.push({ x, y, g: y + 19, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.18, max: 0.18, color, kind: 'spark', drag: 4 });
    }
  }

  decalAt(x, y, r) {
    const c = this.dctx, col = this.stage.decal;
    for (let i = 0; i < r * 3; i++) {
      const a = rand(0, TAU), rr = Math.sqrt(Math.random()) * r;
      const s = 1 + ((Math.random() * 3) | 0);
      c.fillStyle = col + rand(0.15, 0.45).toFixed(2) + ')';
      c.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * 0.6), s, s);
    }
  }

  // Floating damage number; merges repeated ticks with the same key.
  number(m, val, key, fill, shade, prefix = '') {
    // the pixel font has no decimal point, so 245.6 would read as "2456"
    val = Math.round(val);
    if (key) {
      const f = this.floats.find(f => f.key === key && f.t < 0.5);
      if (f) {
        f.val += val; f.t = 0.05; f.x = m.x; f.y = m.y - m.h - 2;
        f.img = numberCanvas(prefix + f.val, fill, shade);
        return false;
      }
    }
    const ox = rand(-8, 8);
    this.floats.push({ key, val, x: m.x + ox, y: m.y - m.h - 2, t: 0, fill, shade, prefix, img: numberCanvas(prefix + val, fill, shade) });
    return true;
  }

  text(x, y, str, color) { this.texts.push({ x, y, str, color, t: 0 }); }

  newFlake(anywhere) {
    const kind = this.stage.weather;
    const y = anywhere ? rand(0, H) : -4;
    if (kind === 'ash') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-6, 6), vy: rand(-26, -10), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#ff8a3a' : '#5a4a48' };
    if (kind === 'petals') return { x: anywhere ? rand(0, W) : rand(-40, W), y, vx: rand(10, 24), vy: rand(10, 22), s: 2, c: rand() < 0.5 ? '#ffd0e0' : '#ffffff' };
    if (kind === 'motes') return { x: rand(0, W), y: anywhere ? rand(0, H) : H + 4, vx: rand(-4, 4), vy: rand(-14, -5), s: rand() < 0.3 ? 2 : 1, c: rand() < 0.5 ? '#7af0e0' : '#c8a8ff' };
    if (kind === 'sand') return { x: anywhere ? rand(0, W) : -4, y: rand(0, H), vx: rand(40, 70), vy: rand(-4, 6), s: 1, c: rand() < 0.5 ? '#e8d8a8' : '#cdbc88' };
    return { x: rand(0, W), y, vx: rand(-8, 4), vy: rand(14, 34), s: rand() < 0.25 ? 2 : 1, c: '#ffffff' };
  }

  updateWeather(dt) {
    for (let i = 0; i < this.weather.length; i++) {
      const f = this.weather[i];
      f.x += (f.vx + Math.sin(this.time * 1.5 + i) * 6) * dt; f.y += f.vy * dt;
      if (f.y > H + 6 || f.y < -6 || f.x < -50 || f.x > W + 6) this.weather[i] = this.newFlake(false);
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.vx !== undefined) {
        if (p.drag) { p.vx *= Math.exp(-p.drag * dt); p.vy *= Math.exp(-p.drag * dt); }
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.particles.length > 900) this.particles.splice(0, this.particles.length - 900);
    for (const f of this.floats) { f.t += dt; f.y -= 14 * dt; }
    this.floats = this.floats.filter(f => f.t < 0.95);
    for (const t of this.texts) { t.t += dt; t.y -= 10 * dt; }
    this.texts = this.texts.filter(t => t.t < 1.2);
  }

  // ---------------------------------------------------------- render
  render(ctx) {
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const shx = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    const shy = this.shake > 0.3 ? Math.round(rand(-1, 1) * this.shake * 2) / 2 : 0;
    ctx.fillStyle = this.stage.bg; ctx.fillRect(0, 0, W, H);
    ctx.translate(-Math.round(this.cam.x) + shx, -Math.round(this.cam.y) + shy);
    ctx.drawImage(this.ground, 0, 0);
    ctx.drawImage(this.decal, 0, 0);
    Lighting.drawTorches(ctx, this.room, this.time);
    this.drawDoors(ctx);
    if (this.stairs) this.drawStairs(ctx);
    this.drawPickups(ctx);
    this.drawTelegraphs(ctx);

    // trainer, monsters and pedestals, depth sorted by where they stand
    const actors = [{ y: this.trainer.y, draw: () => this.drawTrainer(ctx) }];
    for (const m of this.mons) if (m.visible) actors.push({ y: m.y, draw: () => this.drawMon(ctx, m) });
    for (const ped of this.pedestals) actors.push({ y: ped.y, draw: () => this.drawPedestal(ctx, ped) });
    actors.sort((a, b) => a.y - b.y).forEach(a => a.draw());
    // the room and everyone in it get lit; attacks and effects below stay crisp and unlit
    Lighting.apply(ctx, this);
    if (Lighting.on) this.drawTelegraphs(ctx, true);

    for (const m of this.mons) if (m.action && m.action.kind === 'beam' && m.visible) this.drawBeam(ctx, m, m.action);
    for (const p of this.projectiles) this.drawProjectile(ctx, p);
    this.drawZoneFalls(ctx);
    this.drawParticles(ctx);
    for (const b of this.balls) {
      const k = Math.min(1, b.t / b.dur);
      const x = b.from.x + (b.to.x - b.from.x) * k;
      const y = b.from.y + (b.to.y - b.from.y) * k - Math.sin(Math.PI * k) * 46;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(k * 10);
      ctx.drawImage(BALL_IMG, -4.5, -3.75, 9, 7.5); ctx.restore();
    }
    this.drawBars(ctx);
    this.drawFloats(ctx);
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    this.drawWeather(ctx);
    Lighting.overlay(ctx, this);
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    this.drawMinimap(ctx);
  }

  // Locked doors get bars across the doorway.
  drawDoors(ctx) {
    if (this.state !== 'fight' && !(this.state === 'faint' && this.e.some(m => !m.fainted))) return;
    const F = this.F, hw = DOOR_W / 2;
    for (const dir of Object.keys(this.room.doors)) {
      const d = doorPos(this.room, dir);
      ctx.fillStyle = '#2a2230';
      if (dir === 'n') ctx.fillRect(d.x - hw, F.y0 - 14, DOOR_W, 14);
      if (dir === 's') ctx.fillRect(d.x - hw, F.y1, DOOR_W, 10);
      if (dir === 'w') ctx.fillRect(F.x0 - 10, d.y - hw, 10, DOOR_W);
      if (dir === 'e') ctx.fillRect(F.x1, d.y - hw, 10, DOOR_W);
      ctx.fillStyle = '#9a8a7a';
      for (let i = 0; i < 5; i++) {
        const o = -hw + 4 + i * (DOOR_W - 8) / 4;
        if (dir === 'n') ctx.fillRect(d.x + o - 1, F.y0 - 26, 3, 26);
        if (dir === 's') ctx.fillRect(d.x + o - 1, F.y1, 3, 20);
        if (dir === 'w') ctx.fillRect(F.x0 - 20, d.y + o - 1, 20, 3);
        if (dir === 'e') ctx.fillRect(F.x1, d.y + o - 1, 20, 3);
      }
    }
  }

  drawStairs(ctx) {
    const s = this.stairs, x = Math.round(s.x), y = Math.round(s.y);
    ctx.fillStyle = OUTLINE; ctx.fillRect(x - 18, y - 13, 36, 26);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ['#6a6070', '#544a5c', '#3e3648', '#2a2432'][i];
      ctx.fillRect(x - 16, y - 11 + i * 6, 32, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x - 16, y - 11 + i * 6, 32, 1);
    }
    const glow = 0.25 + Math.sin(this.time * 4) * 0.15;
    ctx.globalAlpha = glow; ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
    ctx.strokeRect(x - 19, y - 14, 38, 28); ctx.globalAlpha = 1;
  }

  drawPickups(ctx) {
    for (const k of this.pickups) {
      const img = k.kind === 'coin' ? COIN_IMG : BERRY_IMG;
      const X = Math.round(k.x), Y = Math.round(k.y);
      Lighting.shadow(ctx, X, Y, 4, 1.6, 1.1);
      const bob = k.z > 0 ? k.z : Math.sin(this.time * 4 + k.x) > 0.5 ? 1 : 0;
      // coins spin by squashing sideways
      const sq = k.kind === 'coin' ? Math.max(0.3, Math.abs(Math.cos(this.time * 5 + k.x * 0.3))) : 1;
      const w = img.width * 1.5 * sq, h = img.height * 1.5;
      ctx.drawImage(img, Math.round(X - w / 2), Math.round(Y - h - bob), Math.max(1, Math.round(w)), h);
    }
  }

  drawPedestal(ctx, ped) {
    const X = Math.round(ped.x), Y = Math.round(ped.y);
    Lighting.shadow(ctx, X, Y + 4, 22, 7, 1.1);
    ctx.fillStyle = OUTLINE; ctx.fillRect(X - 19, Y - 7, 38, 13);
    ctx.fillStyle = ped.kind === 'relic' ? '#e0c060' : '#b8b0c8'; ctx.fillRect(X - 18, Y - 6, 36, 5);
    ctx.fillStyle = ped.kind === 'relic' ? '#a8862a' : '#7a7090'; ctx.fillRect(X - 18, Y - 1, 36, 6);
    let name;
    if (ped.kind === 'mon') {
      const def = ROSTER_BY_ID[ped.id], sp = SPRITES[ped.id], S = sp.size * SPR_SCALE;
      const bob = Math.sin(this.time * 3 + ped.x) > 0.6 ? -1 : 0;
      ctx.save(); ctx.translate(X, Y - 6 + bob); if (ped.x > this.P.x) ctx.scale(-1, 1);
      ctx.drawImage(sp.img, -S / 2, -S + 3, S, S); ctx.restore();
      name = def.name;
    } else {
      const img = itemIcon(ped.id), S = img.width * 1.5, bob = Math.round(Math.sin(this.time * 2.5 + ped.x) * 2);
      if (ped.kind === 'relic') {   // a soft glow under treasure
        ctx.globalAlpha = 0.25 + Math.sin(this.time * 4) * 0.1; ctx.fillStyle = '#ffe066';
        ctx.beginPath(); ctx.arc(X, Y - 20 + bob, 15, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.drawImage(img, Math.round(X - S / 2), Math.round(Y - 12 - S + bob), S, S);
      name = itemDef(ped.id).name;
    }
    ctx.font = 'italic 900 8px "Lilita One", "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = 3; ctx.strokeStyle = '#2a1405'; ctx.strokeText(name, X, Y + 16);
    ctx.fillStyle = '#ffe066'; ctx.fillText(name, X, Y + 16);
    if (ped.kind === 'shop') {   // price tag
      const img = numberCanvas(ped.item.price, this.run.coins >= ped.item.price ? '#fff6c8' : '#ff9a8a', this.run.coins >= ped.item.price ? '#e0b040' : '#c04a3a');
      const w = img.width * 1.5 + 11;
      ctx.drawImage(COIN_IMG, Math.round(X - w / 2), Y + 20, COIN_IMG.width * 1.5, COIN_IMG.height * 1.5);
      ctx.drawImage(img, Math.round(X - w / 2 + 10), Y + 20, img.width * 1.5, img.height * 1.5);
    }
  }

  // Each wild monster carries a small HP bar (the boss gets the big one in the HUD).
  drawBars(ctx) {
    const STATUS_COL = { par: '#d6b21e', brn: '#e0582a', frz: '#4fb6d8', psn: '#9a3ab8' };
    for (const m of this.e) {
      if (!m.alive || m.boss) continue;
      const w = 26, x = Math.round(m.x - w / 2), y = Math.round(m.y - m.h - 6);
      const pct = m.hp / m.maxHp;
      ctx.fillStyle = OUTLINE; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = '#2a2638'; ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = pct > 0.5 ? '#3ccf4e' : pct > 0.2 ? '#f2c12e' : '#e8433a';
      ctx.fillRect(x, y, Math.max(1, Math.round(w * pct)), 3);
      if (m.status) { ctx.fillStyle = STATUS_COL[m.status]; ctx.fillRect(x + w + 2, y - 1, 4, 5); }
    }
  }

  drawTrainer(ctx) {
    const t = this.trainer, img = this.trainerImg[t.view];
    const px = Math.round(t.x), py = Math.round(t.y);
    Lighting.shadow(ctx, px, py, 9, 3.5, 0.9);
    const bob = t.moving ? -Math.round(Math.abs(Math.sin(t.walkT / 6 * Math.PI))) : (Math.sin(this.time * 2) > 0.7 ? -1 : 0);
    const w = img.width * SPR_SCALE, h = img.height * SPR_SCALE;
    ctx.save(); ctx.translate(px, 0); if (isSideView(t.view) && t.face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, Math.round(-w / 2), Math.round(py - h + 1 + bob), w, h);
    ctx.restore();
  }

  drawMon(ctx, m) {
    const sp = SPRITES[m.id], S = sp.size * SPR_SCALE * m.scale;
    let alpha = 1, sink = 0;
    if (m.fainted) { alpha = Math.max(0, 1 - m.fadeT / 1.1); sink = m.fadeT * 6; }
    if (alpha <= 0) return;
    const moving = Math.hypot(m.vx, m.vy) > 12;
    let bob = moving ? -Math.round(Math.abs(Math.sin(m.walkT / 7 * Math.PI)) * 2) : (Math.sin(this.time * 3 + m.x) > 0.6 ? -1 : 0);
    if (m.status === 'frz' || m.stunT > 0 || m.fainted) bob = 0;
    const X = Math.round(m.x), Y = Math.round(m.y);
    const mine = m.side === 'player';

    // ground marker + shadow
    ctx.globalAlpha = alpha;
    Lighting.shadow(ctx, X, Y, m.r + 2, m.r * 0.42);
    ctx.strokeStyle = mine ? 'rgba(90,160,255,0.75)' : m.boss ? 'rgba(255,200,60,0.8)' : 'rgba(255,90,80,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(X, Y, m.r + 4, m.r * 0.5 + 1, 0, 0, TAU); ctx.stroke();

    // dash afterimages
    for (const g of m.ghosts) {
      ctx.globalAlpha = (g.t / 0.22) * 0.5 * alpha;
      ctx.save(); ctx.translate(Math.round(g.x), Math.round(g.y)); if (g.face < 0) ctx.scale(-1, 1);
      ctx.drawImage(tinted(m.id, g.color, g.view), -S / 2, -S + 3, S, S); ctx.restore();
    }
    ctx.globalAlpha = alpha;

    // buff aura
    if (m.buffs.length && !m.fainted) {
      ctx.globalAlpha = 0.25 + Math.sin(this.time * 8) * 0.1;
      ctx.fillStyle = TYPES[m.def.types[0]].fx[1];
      ctx.beginPath(); ctx.ellipse(X, Y - 1, m.r + 5, m.r * 0.6 + 2, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = alpha;
    }

    ctx.save();
    ctx.translate(X, Math.round(Y + bob + sink));
    if (m.face < 0) ctx.scale(-1, 1);
    const dx = -S / 2, dy = -S + 3;
    ctx.drawImage(sp.views[m.view], dx, dy, S, S);
    let tint = null, ta = 0;
    if (m.flash > 0) { tint = '#ffffff'; ta = Math.min(1, m.flash * 8); }
    else if (m.fainted) { tint = '#ffffff'; ta = Math.min(0.8, m.fadeT); }
    else if (m.status === 'frz') { tint = '#9fe6ff'; ta = 0.55; }
    else if (m.status === 'par' && Math.sin(this.time * 18) > 0.6) { tint = '#ffe24a'; ta = 0.45; }
    else if (m.status === 'brn' && Math.sin(this.time * 10) > 0.5) { tint = '#ff5a2a'; ta = 0.35; }
    else if (m.status === 'psn' && Math.sin(this.time * 7) > 0.4) { tint = '#b04ae0'; ta = 0.4; }
    else if (m.stunT > 0 && Math.sin(this.time * 20) > 0) { tint = '#ffffff'; ta = 0.25; }
    if (tint) { ctx.globalAlpha = ta * alpha; ctx.drawImage(tinted(m.id, tint, m.view), dx, dy, S, S); }
    ctx.restore();
    ctx.globalAlpha = 1;

    if (m.status === 'frz' && !m.fainted) {
      ctx.strokeStyle = 'rgba(220,250,255,0.9)'; ctx.fillStyle = 'rgba(160,230,255,0.25)';
      ctx.fillRect(Math.round(X - S / 2), Math.round(Y - S + 3), S, S - 3);
      ctx.strokeRect(Math.round(X - S / 2) + 0.5, Math.round(Y - S + 3) + 0.5, S - 1, S - 4);
    }
  }

  // outlines: true redraws only the outlines (after the room lighting, so warnings stay bright)
  drawTelegraphs(ctx, outlines = false) {
    const fill = () => { if (!outlines) ctx.fill(); };
    const pulse = 0.55 + Math.sin(this.time * 14) * 0.2;
    ctx.lineWidth = 1.5;
    // a wild monster about to appear: a shadow growing on the ground
    for (const m of this.e) {
      if (m.spawnT <= 0) continue;
      const k = clamp(1 - m.spawnT / 0.7, 0, 1);
      ctx.globalAlpha = 0.2 + k * 0.3; ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, (m.r + 2) * k, (m.r * 0.45) * k, 0, 0, TAU); fill();
      ctx.globalAlpha = pulse; ctx.strokeStyle = m.boss ? '#ffd23f' : '#ff6a5a';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.ellipse(m.x, m.y, m.r + 6, m.r * 0.5 + 3, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const z of this.zones) {
      if (z.done) {
        if (!z.mv.linger) continue;
        // lingering pool: fades in and out, with bubbles popping across it
        const age = z.t - z.delay, left = z.mv.linger - age;
        const fade = clamp(Math.min(age / 0.15, left / 0.4), 0, 1);
        const zx = z.x, zy = z.y, fx = TYPES[z.mv.type].fx;
        ctx.globalAlpha = 0.38 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); fill();
        ctx.globalAlpha = 0.7 * fade; ctx.strokeStyle = fx[1]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(zx, zy, z.r * (0.95 + Math.sin(this.time * 6) * 0.03), z.r * 0.68, 0, 0, TAU); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const ph = (this.time * 1.3 + i * 0.37 + z.id * 0.11) % 1;
          const a = i * 2.4 + z.id, rr = z.r * 0.6 * ((i * 0.37 + z.id * 0.07) % 1);
          ctx.globalAlpha = (1 - ph) * fade; ctx.strokeStyle = fx[2]; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(zx + Math.cos(a) * rr, zy + Math.sin(a) * rr * 0.7, 1 + ph * 3, 0, TAU); ctx.stroke();
        }
        continue;
      }
      const k = clamp(z.t / z.delay, 0, 1), zx = z.x, zy = z.y;
      ctx.fillStyle = TYPES[z.mv.type].fx[0];
      ctx.globalAlpha = 0.18 + k * 0.2;
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r * k, z.r * k * 0.7, 0, 0, TAU); fill();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.ellipse(zx, zy, z.r, z.r * 0.7, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const m of this.mons) {
      const a = m.action;
      if (!a || !m.visible) continue;
      const X = m.x, Y = m.y, dir = a.dir;
      if (a.kind === 'burst' && !a.done) {
        const k = clamp(a.t / a.mv.delay, 0, 1);
        ctx.fillStyle = TYPES[a.mv.type].fx[0];
        ctx.globalAlpha = 0.15 + k * 0.2;
        ctx.beginPath(); ctx.ellipse(X, Y, a.r * k, a.r * k * 0.7, 0, 0, TAU); fill();
        ctx.globalAlpha = pulse; ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.ellipse(X, Y, a.r, a.r * 0.7, 0, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (a.kind === 'beam' && a.phase === 'charge') {
        const cy = m.cy;
        ctx.globalAlpha = 0.3 + (a.t / a.mv.charge) * 0.4;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(X, cy);
        ctx.lineTo(X + Math.cos(dir) * a.mv.len, cy + Math.sin(dir) * a.mv.len); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1.5;
      }
      if (a.kind === 'vortex') {
        // swirling dashed rings marking the pull radius
        const fx = TYPES[a.mv.type].fx, fade = clamp(Math.min(a.t / 0.12, (a.mv.dur - a.t) / 0.2), 0, 1);
        ctx.globalAlpha = 0.16 * fade; ctx.fillStyle = fx[0];
        ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r, a.mv.r * 0.7, 0, 0, TAU); fill();
        ctx.lineWidth = 1.5;
        for (const [sc, spd, col] of [[1, 1, fx[2]], [0.66, -1.6, fx[1]], [0.33, 2.4, fx[2]]]) {
          ctx.globalAlpha = 0.75 * fade; ctx.strokeStyle = col;
          ctx.setLineDash([7, 5]); ctx.lineDashOffset = this.time * 40 * spd;
          ctx.beginPath(); ctx.ellipse(X, Y, a.mv.r * sc, a.mv.r * sc * 0.7, 0, 0, TAU); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      if (a.kind === 'dash' && a.t <= 0.1) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = TYPES[a.mv.type].fx[2];
        ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.lineTo(X + Math.cos(dir) * 40, Y + Math.sin(dir) * 40); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawZoneFalls(ctx) {
    for (const z of this.zones) {
      if (z.done) continue;
      const left = z.delay - z.t;
      const fx = TYPES[z.mv.type].fx;
      const zx = z.x, zy = z.y;
      if (z.mv.fx === 'meteor' && left < 0.45) {
        const k = 1 - left / 0.45;
        const x = zx - 70 * (1 - k), y = zy - 170 * (1 - k);
        ctx.globalAlpha = 0.5; ctx.strokeStyle = fx[1]; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 20, y - 48); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = fx[0]; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = fx[2]; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
      } else if (z.mv.fx === 'rock' && left < 0.35) {
        const k = 1 - left / 0.35;
        const y = zy - 150 * (1 - k * k);
        ctx.fillStyle = '#8f8170'; ctx.fillRect(Math.round(zx - 6), Math.round(y - 10), 12, 10);
        ctx.fillStyle = '#b8aa96'; ctx.fillRect(Math.round(zx - 5), Math.round(y - 9), 6, 3);
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.strokeRect(Math.round(zx - 6) + 0.5, Math.round(y - 10) + 0.5, 11, 9);
      }
    }
  }

  drawBeam(ctx, m, a) {
    const mv = a.mv, fx = TYPES[mv.type].fx;
    // the muzzle sits at body height, 6 units out along the aim
    const ox = m.x + Math.cos(a.dir) * 6, oy = m.cy + Math.sin(a.dir) * 6;
    if (a.phase === 'charge') {
      const k = a.t / mv.charge;
      ctx.globalAlpha = 0.5; ctx.fillStyle = fx[0];
      ctx.beginPath(); ctx.arc(ox, oy, 3 + k * mv.width * 0.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = fx[2];
      ctx.beginPath(); ctx.arc(ox, oy, 1 + k * mv.width * 0.25, 0, TAU); ctx.fill();
      return;
    }
    const grow = Math.min(1, a.t / 0.08);
    const fade = Math.min(1, (mv.dur - a.t) / 0.15);
    const len = mv.len * grow, w = mv.width * Math.max(0.2, fade);
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(a.dir);
    const layers = [[fx[0], 0.35, 1.7], [fx[0], 0.9, 1.15], [fx[1], 1, 0.8], [fx[2], 1, 0.38]];
    for (const [col, al, sc] of layers) {
      ctx.globalAlpha = al; ctx.fillStyle = col;
      ctx.beginPath();
      const steps = Math.max(2, Math.ceil(len / 5));
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * len;
        const hw = (w / 2) * sc * (1 + 0.16 * Math.sin(x * 0.18 - this.time * 40)) * Math.min(1, 0.4 + x / 20);
        i === 0 ? ctx.moveTo(x, -hw) : ctx.lineTo(x, -hw);
      }
      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * len;
        const hw = (w / 2) * sc * (1 + 0.16 * Math.sin(x * 0.18 - this.time * 40 + 1.5)) * Math.min(1, 0.4 + x / 20);
        ctx.lineTo(x, hw);
      }
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(len, 0, (w / 2) * sc, 0, TAU); ctx.fill();
    }
    // spiral rings travelling down the beam
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = fx[2]; ctx.lineWidth = 1.3;
    for (let x = (this.time * 260) % 24; x < len; x += 24) {
      ctx.beginPath(); ctx.ellipse(x, 0, 2.5, w * 0.95, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = fx[2];
    ctx.beginPath(); ctx.arc(0, 0, w * 0.7, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawProjectile(ctx, p) {
    const fx = TYPES[p.mv.type].fx, t = p.mv.type;
    const px = p.x, py = p.y;
    if (p.mv.boomerang) {   // a spinning crescent blade
      ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin * 1.7);
      ctx.fillStyle = fx[1];
      ctx.beginPath(); ctx.arc(0, 0, p.r * 1.7, 0, Math.PI * 1.25); ctx.arc(p.r * 0.6, -p.r * 0.2, p.r * 1.1, Math.PI * 1.25, 0, true);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = fx[2]; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      return;
    }
    if (t === 'grass') {
      ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
      ctx.fillStyle = fx[1]; ctx.beginPath(); ctx.moveTo(-p.r * 1.4, 0); ctx.lineTo(0, -p.r * 0.7); ctx.lineTo(p.r * 1.4, 0); ctx.lineTo(0, p.r * 0.7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
      return;
    }
    if (t === 'rock' || t === 'ground') {
      ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.rotate(p.spin * 0.3);
      ctx.fillStyle = fx[1]; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.fillStyle = fx[2]; ctx.fillRect(-p.r, -p.r, p.r, p.r * 0.7);
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.strokeRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
      return;
    }
    if (t === 'ice' || t === 'bug' || t === 'flying') {
      const a = Math.atan2(p.vy, p.vx);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.fillStyle = fx[1]; ctx.beginPath(); ctx.moveTo(p.r * 3, 0); ctx.lineTo(-p.r * 2, -p.r); ctx.lineTo(-p.r * 2, p.r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = fx[2]; ctx.fillRect(-p.r, -0.5, p.r * 3, 1);
      ctx.restore();
      return;
    }
    ctx.globalAlpha = 0.35; ctx.fillStyle = fx[0];
    ctx.beginPath(); ctx.arc(px, py, p.r * 2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = fx[1];
    ctx.beginPath(); ctx.arc(px, py, p.r * 1.2, 0, TAU); ctx.fill();
    ctx.fillStyle = fx[2];
    ctx.beginPath(); ctx.arc(px, py, p.r * 0.6, 0, TAU); ctx.fill();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const k = clamp(p.life / p.max, 0, 1);
      const X = p.x, Y = p.y;
      ctx.globalAlpha = k;
      switch (p.kind) {
        case 'sq': {
          const s = Math.max(1, Math.round(p.size * (0.5 + k * 0.5)));
          ctx.fillStyle = p.color; ctx.fillRect(Math.round(X - s / 2), Math.round(Y - s / 2), s, s);
          break;
        }
        case 'spark':
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - p.vx * 0.06, Y - p.vy * 0.06); ctx.stroke();
          break;
        case 'ring': {
          const r = p.r1 + (p.r0 - p.r1) * k;
          ctx.strokeStyle = p.color; ctx.lineWidth = p.w * k + 0.5;
          ctx.beginPath(); ctx.ellipse(X, Y, r, r * 0.7, 0, 0, TAU); ctx.stroke();
          break;
        }
        case 'line':
          ctx.strokeStyle = p.color; ctx.lineWidth = 3 * k + 0.5;
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(p.x2, p.y2); ctx.stroke();
          break;
        case 'bolt': {
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
          const r2 = mulberry((p.seed * 1e6) | 0);
          ctx.beginPath(); let x = X + (r2() - 0.5) * 30, y = Y - 220; ctx.moveTo(x, y);
          while (y < Y) { y += 14; x += (r2() - 0.5) * 18; if (y >= Y) { x = X; y = Y; } ctx.lineTo(x, y); }
          ctx.stroke(); ctx.strokeStyle = p.color; ctx.lineWidth = 1.2; ctx.stroke();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawFloats(ctx) {
    for (const f of this.floats) {
      const pop = f.t < 0.1 ? 3 - f.t * 10 : 2;
      ctx.globalAlpha = f.t > 0.7 ? 1 - (f.t - 0.7) / 0.25 : 1;
      const w = f.img.width * pop, h = f.img.height * pop;
      ctx.drawImage(f.img, Math.round(f.x - w / 2), Math.round(f.y - h), w, h);
    }
    ctx.globalAlpha = 1;
    ctx.font = 'italic 900 10px "Lilita One", "Arial Black", "Segoe UI Black", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const t of this.texts) {
      ctx.globalAlpha = t.t > 0.9 ? 1 - (t.t - 0.9) / 0.3 : 1;
      const x = clamp(t.x, this.cam.x + 50, this.cam.x + W - 50), y = t.y;
      ctx.lineWidth = 3; ctx.strokeStyle = '#2a1405'; ctx.strokeText(t.str, x, y);
      ctx.fillStyle = t.color; ctx.fillText(t.str, x, y);
    }
    ctx.globalAlpha = 1;
  }

  drawWeather(ctx) {
    for (const f of this.weather) { ctx.fillStyle = f.c; ctx.globalAlpha = 0.85; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s); }
    ctx.globalAlpha = 1;
  }

  // Top-right: the rooms you've seen on this floor, and your coins.
  drawMinimap(ctx) {
    const rooms = this.run.floor.rooms;
    const seen = r => r.visited || Object.values(r.doors).some(o => o.visited);
    const shown = rooms.filter(seen);
    const cw = 13, ch = 9, gap = 2;
    const gxs = shown.map(r => r.gx), gys = shown.map(r => r.gy);
    const minX = Math.min(...gxs), maxX = Math.max(...gxs), minY = Math.min(...gys), maxY = Math.max(...gys);
    const mw = (maxX - minX + 1) * (cw + gap) + 3, mh = (maxY - minY + 1) * (ch + gap) + 3;
    const x0 = W - mw - 6, y0 = 6;
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#0e0b18'; ctx.fillRect(x0 - 2, y0 - 2, mw + 4, mh + 4); ctx.globalAlpha = 1;
    for (const r of shown) {
      const x = x0 + 2 + (r.gx - minX) * (cw + gap), y = y0 + 2 + (r.gy - minY) * (ch + gap);
      ctx.fillStyle = r === this.room ? '#ffffff' : r.visited ? '#8a84a0' : '#3a3450';
      ctx.fillRect(x, y, cw, ch);
      const icon = r.type === 'boss' ? '#e8433a' : r.type === 'recruit' && !r.recruited ? '#5aa0ff'
        : r.type === 'shop' ? '#ffd23f' : r.type === 'treasure' && !r.taken ? '#ffffff' : null;
      if (icon) { ctx.fillStyle = icon; ctx.fillRect(x + 4, y + 3, 5, 3); }
    }
    // coins
    const img = numberCanvas(this.run.coins, '#fff6c8', '#e0b040');
    const cy = y0 + mh + 6;
    ctx.drawImage(COIN_IMG, W - 8 - img.width * 2 - 12, cy + 1, COIN_IMG.width * 2, COIN_IMG.height * 2);
    ctx.drawImage(img, W - 6 - img.width * 2, cy, img.width * 2, img.height * 2);
    ctx.font = 'italic 900 9px "Lilita One", "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'right'; ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#15111f';
    const label = (this.run.endless ? 'ENDLESS ' : '') + 'FLOOR ' + this.run.floorN;
    ctx.strokeText(label, W - 6, cy + 26); ctx.fillStyle = '#ffffff'; ctx.fillText(label, W - 6, cy + 26);
  }
});
