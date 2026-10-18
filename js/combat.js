// Battle's moves: using them, aiming, hits and damage, statuses, and the moves in
// flight (dashes, beams, bursts, projectiles, zones, thrown balls). See battle.js.

mixInto(Battle, class {
  // ---------------------------------------------------------- moves
  tryMove(m, i) {
    if (this.state !== 'fight' || !m.canAct() || m.cd[i] > 0 || m.gcd > 0 || !this.foe(m)) return false;
    this.execute(m, i);
    return true;
  }

  aim(m, foe, mv) {
    let tx = foe.x, ty = foe.cy;
    const d = m.ai && m.side === 'enemy' ? m.ai.d : null;
    if (d && d.lead && mv.speed && mv.kind === 'projectile') {
      const t = Math.hypot(tx - m.x, ty - m.cy) / mv.speed;
      tx += foe.vx * t * 0.8; ty += foe.vy * t * 0.8;
    }
    let a = Math.atan2(ty - m.cy, tx - m.x);
    if (d) a += (Math.random() - 0.5) * 2 * d.aimErr;
    return a;
  }

  execute(m, i) {
    const mv = m.moves[i], foe = this.foe(m), F = this.F;
    m.cd[i] = mv.cd * m.cdMul();
    m.gcd = 0.35;
    if (m.side === 'enemy') {
      const alive = this.e.filter(e => e.alive).length;
      this.enemyAtkT = alive > 1 ? rand(0.5, 0.8) + 0.2 * (alive - 2) : 0;
    }
    this.ui.callout(m.side, mv.name, mv.type);
    const dir = this.aim(m, foe, mv);
    if (Math.abs(Math.cos(dir)) > 0.2) m.face = Math.cos(dir) > 0 ? 1 : -1;
    m.look(Math.cos(dir), Math.sin(dir));
    const fx = TYPES[mv.type].fx;

    switch (mv.kind) {
      case 'projectile': {
        const split = this.relic(m, 'splitShot') && !mv.boomerang;
        const n = (mv.count || 1) + (split ? 1 : 0), sp = split ? Math.max(mv.spread || 0, 0.22) : mv.spread || 0;
        for (let k = 0; k < n; k++) {
          const a = dir + (n > 1 ? (k / (n - 1) - 0.5) * sp : 0);
          this.projectiles.push({
            x: m.x + Math.cos(a) * m.r, y: m.cy + Math.sin(a) * m.r,
            vx: Math.cos(a) * mv.speed, vy: Math.sin(a) * mv.speed,
            r: mv.r || 4, mv, owner: m, life: 2.6, spin: rand(0, TAU), k: m.y - m.cy,
            // boomerangs fly out `range`, then home back to the thrower
            out: mv.boomerang ? mv.range / mv.speed : 0, back: false, hitCd: 0, hitIds: null,
          });
        }
        m.action = { kind: 'cast', t: 0, dur: 0.18, lock: true };
        Sfx.move(mv, 'cast');
        break;
      }
      case 'beam':
        m.action = { kind: 'beam', t: 0, mv, dir, lock: true, phase: 'charge', tick: 0, id: _uid++ };
        Sfx.beamCharge(mv.charge);
        break;
      case 'dash':
        m.action = { kind: 'dash', t: 0, mv, dir, lock: true, hit: false, tgt: foe, id: _uid++ };
        Sfx.move(mv, 'cast');
        break;
      case 'vortex':
        m.action = { kind: 'vortex', t: 0, mv, dir, lock: true, tick: 0, id: _uid++ };
        Sfx.move(mv, 'cast');
        break;
      case 'burst':
        m.action = { kind: 'burst', t: 0, mv, dir, lock: true, done: false, r: mv.r * (this.relic(m, 'blastCore') ? 1.25 : 1), id: _uid++ };
        Sfx.move(mv, 'cast');   // see KIND_SFX / MOVE_SFX in audio.js
        break;
      case 'zone': {
        const n = mv.count || 1;
        for (let k = 0; k < n; k++) {
          const off = k === 0 ? 0 : (mv.scatter || 30);
          const a = rand(0, TAU), rr = rand(0.4, 1) * off;
          this.zones.push({
            x: clamp(foe.x + Math.cos(a) * rr, F.x0 + 8, F.x1 - 8),
            y: clamp(foe.y + Math.sin(a) * rr, F.y0 + 8, F.y1 - 8),
            r: mv.r * (this.relic(m, 'blastCore') ? 1.25 : 1), t: 0, delay: mv.delay + k * 0.18, mv, owner: m, done: false, tick: 0, id: _uid++,
          });
        }
        m.action = { kind: 'cast', t: 0, dur: 0.25, lock: true };
        Sfx.move(mv, 'cast');
        break;
      }
      case 'buff': {
        for (const [stat, mul] of Object.entries(mv.buff)) {
          m.buffs = m.buffs.filter(b => b.stat !== stat);
          m.buffs.push({ stat, mul, t: mv.dur });
        }
        const label = Object.keys(mv.buff).map(s => s.toUpperCase()).join(' & ') + ' UP!';
        this.text(m.x, m.y - m.h - 6, label, fx[1], m.y);
        this.fxBuff(m, mv);
        this.burst(m.x, m.cy, fx, 8, 60, -40);
        m.action = { kind: 'cast', t: 0, dur: 0.35, lock: true };
        Sfx.move(mv, 'cast');
        break;
      }
      case 'heal': {
        const amt = Math.round(m.maxHp * mv.amount);
        const real = Math.round(Math.min(amt, m.maxHp - m.hp));
        m.hp = Math.min(m.maxHp, m.hp + real);
        this.number(m, real, null, '#b6ff9a', '#4fae2e', '+');
        this.fxHeal(m, mv);
        this.burst(m.x, m.cy, ['#4fae2e', '#b6ff9a', '#ffffff'], 8, 50, -50);
        m.action = { kind: 'cast', t: 0, dur: 0.45, lock: true };
        Sfx.move(mv, 'cast');
        break;
      }
    }
  }

  // Apply damage. mult scales power (beam ticks), opts.merge groups numbers,
  // opts.kb sets the knockback direction and opts.force overrides its strength.
  hit(src, tgt, mv, mult = 1, opts = {}) {
    if (!tgt.visible || tgt.fainted || tgt.invuln > 0) return 0;
    const eff = typeEffect(mv.type, tgt.def.types);
    const stab = src.def.types.includes(mv.type) ? 1.3 : 1;
    const itemMul = src.item.boostType === mv.type ? src.item.mul : 1;
    const crit = mult >= 1 && Math.random() < (mv.crit || 0.06);
    let dmg = DMG_SCALE * mv.power * mult * (src.atk() / tgt.defense()) * stab * eff * itemMul * (crit ? 1.5 : 1) * rand(0.9, 1.05);
    dmg = Math.max(1, Math.round(dmg));
    tgt.hp = Math.max(0, tgt.hp - dmg);
    src.dmgDealt += dmg;
    tgt.flash = 0.12;

    const merge = opts.merge ? opts.merge + ':' + (tgt.uid || (tgt.uid = _uid++)) : null;
    const fresh = this.number(tgt, dmg, merge);
    const kb = opts.kb ?? Math.atan2(tgt.cy - src.cy, tgt.x - src.x);
    // bosses barely budge
    const force = (opts.force ?? (mult < 1 ? 22 : Math.min(260, 60 + dmg * 0.45))) * (tgt.boss ? 0.35 : 1);
    tgt.kx += Math.cos(kb) * force; tgt.ky += Math.sin(kb) * force;

    this.fxImpact(tgt, mv, dmg, eff, mult, src);
    if (mult >= 1 || fresh) this.sparks(tgt.x, tgt.cy, mult < 1 ? 2 : 6);
    if (fresh) {
      if (eff >= 2) this.text(tgt.x, tgt.y - tgt.h - 12, 'SUPER EFFECTIVE!', '#ffe066', tgt.y);
      else if (eff < 1) this.text(tgt.x, tgt.y - tgt.h - 12, eff <= 0.25 ? 'BARELY AFFECTS...' : 'NOT VERY EFFECTIVE', '#c8c8d8', tgt.y);
      if (crit) this.text(tgt.x, tgt.y - tgt.h - 22, 'CRITICAL HIT!', '#ff7a5a', tgt.y);
    }
    Sfx.play(dmg > 200 ? 'bigHit' : 'hit');
    if (mult >= 1) Sfx.move(mv, 'hit');
    this.addShake(mult < 1 ? 1.2 : Math.min(6, 1 + dmg / 80));
    if (mult >= 1 && dmg > 150) this.hitstop = Math.min(0.09, 0.03 + dmg / 6000);

    if (mv.status && Math.random() < mv.status[1] * Math.min(1, mult * 3)) this.applyStatus(tgt, mv.status[0]);
    if (mult >= 1 && this.relic(src, 'staticCharm') && Math.random() < 0.1) this.applyStatus(tgt, 'par');
    if (mv.slow) tgt.slowT = Math.max(tgt.slowT, mv.slow);
    // drain: the attacker heals for part of the damage it dealt
    const drain = (mv.drain || 0) + (mv.kind === 'beam' && this.relic(src, 'leechLens') ? 0.15 : 0);
    if (drain && !src.fainted && src.hp > 0) {
      const heal = Math.round(Math.min(dmg * drain, src.maxHp - src.hp));
      if (heal > 0) {
        src.hp += heal;
        this.number(src, heal, opts.merge ? 'drain' + opts.merge : null, '#b6ff9a', '#4fae2e', '+');
        this.particles.push({ x: tgt.x, y: tgt.cy, x2: src.x, y2: src.cy, k2: src.y - src.cy, life: 0.25, max: 0.25, color: '#b6ff9a', kind: 'line' });
        this.burst(src.x, src.cy, ['#4fae2e', '#b6ff9a'], 8, 40, -40);
        Sfx.play('drain');
      }
    }
    if (tgt.hp <= 0) this.faint(tgt);
    return dmg;
  }

  applyStatus(m, s) {
    if (m.status || m.fainted) return;
    const immune = { par: ['electric'], brn: ['fire'], frz: ['ice'], psn: ['poison', 'steel'] }[s];
    if (m.def.types.some(t => immune.includes(t))) return;
    m.status = s;
    m.statusT = { par: 8, brn: 6, frz: 1.6, psn: 8 }[s];
    m.statusTick = 1;
    const label = { par: 'IS PARALYZED!', brn: 'WAS BURNED!', frz: 'IS FROZEN!', psn: 'WAS POISONED!' }[s];
    const col = { par: '#ffe066', brn: '#ff8a4a', frz: '#bff0ff', psn: '#e0a0ff' }[s];
    this.text(m.x, m.y - m.h - 2, label, col, m.y);
    if (s === 'frz') { m.action = null; m.vx = m.vy = 0; }
    Sfx.play('status');
  }

  updateAction(m, dt) {
    const a = m.action;
    a.t += dt;
    const fx = a.mv ? TYPES[a.mv.type].fx : null;
    switch (a.kind) {
      case 'cast':
        if (a.t >= a.dur) m.action = null;
        break;

      case 'beam': {
        const mv = a.mv;
        if (a.phase === 'charge') {
          const foe = this.foe(m);
          if (foe && a.t < mv.charge * 0.7) a.dir = this.aim(m, foe, mv);
          if (Math.random() < 0.8) {
            const ang = rand(0, TAU), rr = rand(14, 26);
            const ox = m.x + Math.cos(a.dir) * 8, oy = m.cy + Math.sin(a.dir) * 8;
            this.particles.push({ x: ox + Math.cos(ang) * rr, y: oy + Math.sin(ang) * rr, vx: -Math.cos(ang) * rr * 3, vy: -Math.sin(ang) * rr * 3, life: 0.3, max: 0.3, size: 2, color: fx[Math.random() < 0.5 ? 1 : 2], kind: 'sq' });
          }
          if (a.t >= mv.charge) { a.phase = 'fire'; a.t = 0; Sfx.beamFire(mv.dur, mv.type); this.addShake(5); }
        } else {
          a.tick -= dt;
          if (a.tick <= 0) {
            a.tick = 0.1;
            // a beam hits everything in its line
            for (const foe of this.foes(m)) {
              if (this.beamHits(m, a, foe)) this.hit(m, foe, mv, 0.1 / mv.dur * 1.15, { merge: a.id, kb: a.dir });
              if (m.fainted || !m.action || this.state === 'faint') return;
            }
          }
          this.addShake(1.2);
          const L = mv.len * Math.random();
          const bx = m.x + Math.cos(a.dir) * L, by = m.cy + Math.sin(a.dir) * L;
          this.particles.push({ x: bx, y: by, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.35, max: 0.35, size: rand(1, 3), color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
          if (a.t >= mv.dur) {
            m.action = null;
            if (mv.recharge) { m.stunT = mv.recharge; this.text(m.x, m.y - m.h - 2, 'MUST RECHARGE', '#d8d8e8', m.y); }
          }
        }
        break;
      }

      case 'dash': {
        const mv = a.mv;
        // combo: after connecting, stay on the target and land the rest of the hits
        if (a.phase === 'combo') {
          const foe = a.tgt;
          const d = Math.hypot(foe.x - m.x, foe.y - m.y) || 1;
          if (d > m.r + foe.r) { m.x += (foe.x - m.x) / d * 90 * dt; m.y += (foe.y - m.y) / d * 90 * dt; }
          a.tick -= dt;
          if (a.tick <= 0) {
            if (a.left <= 0 || d > m.r + foe.r + 16 || !foe.alive) { m.action = null; break; }
            a.left--;
            const last = a.left === 0;
            // light jabs keep the target close; the last hit knocks it away
            this.hit(m, foe, mv, 1, { kb: Math.atan2(foe.y - m.y, foe.x - m.x), merge: a.id, force: last ? undefined : 35 });
            if (m.fainted || !m.action || this.state === 'faint') return;
            a.tick = mv.hitGap || 0.13;
            if (last) {
              m.action = null; this.decalAt(foe.x, foe.y, 8);
              if (mv.selfDebuff) for (const [stat, mul] of Object.entries(mv.selfDebuff)) m.buffs.push({ stat, mul, t: 5 });
            }
          }
          break;
        }
        if (a.t <= 0.1) {
          if (a.t < 0.03) { const f = this.foe(m); if (f) { a.tgt = f; a.dir = this.aim(m, f, mv); } }
          break;
        }
        if (this.relic(m, 'emberTracks') && (a.trailT = (a.trailT || 0) - dt) <= 0) {
          a.trailT = 0.07;   // a pool of fire left along the dash
          this.zones.push({ x: m.x, y: m.y, r: 13, t: 0, delay: 0, mv: EMBER_MV, owner: m, done: true, tick: 0.15, id: _uid++ });
        }
        m.ghostT -= dt;
        if (m.ghostT <= 0) { m.ghostT = 0.03; m.ghosts.push({ x: m.x, y: m.y, face: m.face, view: m.view, t: 0.22, color: fx[1] }); }
        if (Math.random() < 0.7) this.particles.push({ x: m.x + rand(-6, 6), y: m.cy + rand(-6, 6), vx: -m.vx * 0.2, vy: -m.vy * 0.2, life: 0.3, max: 0.3, size: 2, color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
        if (Math.random() < 0.6) this.particles.push({ kind: 'streak', x: m.x + rand(-9, 9), y: m.cy + rand(-9, 9), sx: m.vx, sy: m.vy, color: fx[2], life: 0.16, max: 0.16 });
        const foe = !a.hit && this.foes(m).find(f => Math.hypot(m.x - f.x, m.cy - f.cy) < m.r + f.r + 4);
        if (foe) {
          a.hit = true; a.tgt = foe;
          if (mv.hits > 1) {   // a combo: stop here and start hitting
            a.phase = 'combo'; a.left = mv.hits; a.tick = 0;
            m.vx = m.vy = 0;
            break;
          }
          const dealt = this.hit(m, foe, mv, 1, { kb: a.dir });
          if (this.state === 'faint') return;
          if (mv.recoil && dealt && !m.fainted) {
            const rc = Math.round(dealt * mv.recoil);
            m.hp = Math.max(0, m.hp - rc);
            this.number(m, rc, null, '#ffd0d0', '#c05050');
            if (m.hp <= 0) { this.faint(m); return; }
          }
          if (mv.selfDebuff) for (const [stat, mul] of Object.entries(mv.selfDebuff)) m.buffs.push({ stat, mul, t: 5 });
          m.action = null;
          m.vx *= -0.25; m.vy *= -0.25;
          this.decalAt(foe.x, foe.y, 8);
          break;
        }
        if (a.t >= 0.1 + mv.dur) { m.action = null; m.vx *= 0.3; m.vy *= 0.3; }
        break;
      }

      case 'burst': {
        const mv = a.mv;
        // a cone (Blizzard, Gust): aim again on release, then blow in front, hitting 3 times
        if (mv.cone) {
          if (!a.done && a.t >= mv.delay) {
            a.done = true; a.blowT = 0; a.ticks = 0;
            const f = this.foe(m); if (f) a.dir = this.aim(m, f, mv);
            this.addShake(3); Sfx.move(mv, 'release');
          }
          if (a.done) {
            a.blowT += dt;
            this.fxCone(m, a);
            const due = Math.min(3, Math.floor(a.blowT / (mv.blow / 3)) + 1);
            while (a.ticks < due) {
              a.ticks++;
              for (const foe of this.foes(m)) {
                if (this.inCone(m, a, foe)) this.hit(m, foe, mv, 1 / 3, { kb: a.dir, merge: a.id, force: mv.push ? mv.push / 3 : undefined });
                if (m.fainted || !m.action || this.state === 'faint') return;
              }
            }
            if (a.blowT >= mv.blow) m.action = null;
          }
          break;
        }
        // a ripple (Dark Pulse): a ring that travels out, hitting each opponent once as it passes
        if (mv.ripple) {
          if (!a.done && a.t >= mv.delay) { a.done = true; a.ripT = 0; a.hitIds = new Set(); this.addShake(3); Sfx.move(mv, 'release'); }
          if (a.done) {
            a.ripT += dt;
            const R = a.r * Math.min(1, a.ripT / mv.ripple);
            for (const foe of this.foes(m)) {
              if (a.hitIds.has(foe) || Math.hypot(foe.x - m.x, foe.y - m.y) - foe.r * 0.6 > R) continue;
              a.hitIds.add(foe);
              this.hit(m, foe, mv, 1, { kb: Math.atan2(foe.y - m.y, foe.x - m.x) });
              if (m.fainted || !m.action || this.state === 'faint') return;
            }
            if (a.ripT >= mv.ripple) m.action = null;
          }
          break;
        }
        if (!a.done && a.t >= mv.delay) {
          a.done = true;
          this.fxBlast(m.x, m.y, a.r, mv);
          this.decalAt(m.x, m.y, a.r * 0.6);
          this.addShake(6);
          Sfx.move(mv, 'release');
          for (const foe of this.foes(m)) {
            if (Math.hypot(foe.x - m.x, foe.y - m.y) < a.r + foe.r * 0.6) this.hit(m, foe, mv, 1);
            if (m.fainted || this.state === 'faint') return;
          }
        }
        if (a.t >= mv.delay + 0.15) m.action = null;
        break;
      }

      // vortex: the user stands still and drags opponents in, grinding them while they're caught
      case 'vortex': {
        const mv = a.mv;
        if (Math.random() < 0.9) {   // debris spiralling inward
          const ang = rand(0, TAU), rr = rand(0.5, 1) * mv.r;
          const px = m.x + Math.cos(ang) * rr, py = m.y + Math.sin(ang) * rr * 0.7;
          this.particles.push({ x: px, y: py - 3, g: py, vx: (m.x - px) * 1.6 - Math.sin(ang) * 70, vy: (m.y - py) * 1.6 + Math.cos(ang) * 50,
            life: 0.45, max: 0.45, size: rand(1, 2.5), color: fx[rand() < 0.5 ? 1 : 2], kind: 'sq' });
        }
        a.tick -= dt;
        const tick = a.tick <= 0;
        if (tick) a.tick = 0.25;
        for (const foe of this.foes(m)) {
          const dx = m.x - foe.x, dy = m.y - foe.y, d = Math.hypot(dx, dy) || 1;
          if (d >= mv.r + foe.r) continue;
          if (d > m.r + foe.r) {
            const B = this.bounds(foe), pull = mv.pull * (foe.boss ? 0.4 : 1);
            foe.x = clamp(foe.x + dx / d * pull * dt, B.x0, B.x1);
            foe.y = clamp(foe.y + dy / d * pull * dt, B.y0, B.y1);
          }
          if (tick) {
            this.hit(m, foe, mv, 0.25 / mv.dur, { merge: a.id, kb: Math.atan2(dy, dx), force: 0 });
            if (m.fainted || !m.action || this.state === 'faint') return;
          }
        }
        if (a.t >= mv.dur) m.action = null;
        break;
      }
    }
  }

  // is foe inside a cone blast's wedge?
  inCone(m, a, foe) {
    const dx = foe.x - m.x, dy = foe.cy - m.cy, d = Math.hypot(dx, dy);
    if (d > a.r + foe.r * 0.5) return false;
    const off = Math.abs(((Math.atan2(dy, dx) - a.dir + Math.PI * 3) % TAU) - Math.PI);
    return d < m.r + foe.r || off <= a.mv.cone + Math.atan2(foe.r, d);
  }

  beamHits(m, a, foe) {
    const ox = m.x, oy = m.cy;
    const dx = Math.cos(a.dir), dy = Math.sin(a.dir);
    const px = foe.x - ox, py = foe.cy - oy;
    const t = clamp(px * dx + py * dy, 0, a.mv.len);
    const cx = ox + dx * t, cy = oy + dy * t;
    return Math.hypot(foe.x - cx, foe.cy - cy) <= a.mv.width / 2 + foe.r * 0.85;
  }

  separate(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
    const min = (a.r + b.r) * 0.85;
    if (d < min) {
      // a boss doesn't get shoved around
      const wa = a.boss ? 0.1 : b.boss ? 0.9 : 0.5, push = min - d;
      a.x -= dx / d * push * wa; a.y -= dy / d * push * wa;
      b.x += dx / d * push * (1 - wa); b.y += dy / d * push * (1 - wa);
    }
  }

  updateProjectiles(dt) {
    const F = this.F;
    for (const p of this.projectiles) {
      p.life -= dt; p.spin += dt * 12;
      if (p.mv.homing) {
        const foe = this.foe(p.owner);
        if (foe && foe.visible) {
          const cur = Math.atan2(p.vy, p.vx), want = Math.atan2(foe.cy - p.y, foe.x - p.x);
          let diff = ((want - cur + Math.PI * 3) % TAU) - Math.PI;
          const turn = clamp(diff, -p.mv.homing * dt, p.mv.homing * dt);
          const sp = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(cur + turn) * sp; p.vy = Math.sin(cur + turn) * sp;
        }
      }
      if (p.mv.boomerang) {
        p.hitCd -= dt;
        if (!p.back && (p.out -= dt) <= 0) p.back = true;
        if (p.back) {   // home in on the thrower; caught when it gets back
          const o = p.owner, sp = Math.hypot(p.vx, p.vy), a = Math.atan2(o.cy - p.y, o.x - p.x);
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
          if (!o.visible || o.fainted || Math.hypot(o.x - p.x, o.cy - p.y) < o.r + p.r) { p.life = -1; p.dead = true; }
        }
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      const fx = p.mv.palette || TYPES[p.mv.type].fx;
      if (Math.random() < 0.9) this.particles.push({ x: p.x + rand(-1, 1) * p.r * 0.5, y: p.y + rand(-1, 1) * p.r * 0.5, vx: -p.vx * 0.1, vy: -p.vy * 0.1, life: 0.25, max: 0.25, size: Math.max(1, p.r * 0.6), color: fx[rand() < 0.5 ? 0 : 1], kind: 'sq' });
      const foe = p.life > 0 && !(p.hitCd > 0) && this.foes(p.owner).find(f => Math.hypot(p.x - f.x, p.y - f.cy) < p.r + f.r);
      if (foe) {
        // a boomerang cuts through and can hit again on the way back
        if (p.mv.boomerang) p.hitCd = 0.35; else p.life = -1;
        if (p.mv.explode) {
          this.fxBlast(p.x, p.y, p.mv.explode, p.mv);
          this.decalAt(foe.x, foe.y, p.mv.explode * 0.6);
          Sfx.move(p.mv, 'land');
        }
        this.hit(p.owner, foe, p.mv, 1, { kb: Math.atan2(p.vy, p.vx) });
        if (this.state === 'faint') return;
      }
      // the walls stop shots (the top wall a bit higher up, since shots fly at body height)
      if (p.x < F.x0 - 6 || p.x > F.x1 + 6 || p.y < F.y0 - 34 || p.y > F.y1 + 4) p.life = -1;
      if (p.life <= 0 && !p.dead) { p.dead = true; this.burst(p.x, p.y, fx, 4, 40); }
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  updateZones(dt) {
    // anyone standing in a tornado is lifted off the ground and spun (only for looks)
    const caught = new Set();
    for (const z of this.zones) {
      if (!z.done || z.mv.fx !== 'tornado' || z.t > z.delay + z.mv.linger - 0.3) continue;
      for (const foe of this.foes(z.owner)) if (Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) caught.add(foe);
    }
    for (const m of this.mons) m.lift = clamp((m.lift || 0) + (caught.has(m) ? 4 : -4) * dt, 0, 1);
    for (const z of this.zones) {
      z.t += dt;
      if (!z.done && z.t >= z.delay) {
        z.done = true; z.tick = 0.5;   // a pool's first tick comes after the landing hit
        const fx = TYPES[z.mv.type].fx;
        if (z.mv.fx === 'bolt') this.particles.push({ x: z.x, y: z.y, life: 0.25, max: 0.25, kind: 'bolt', color: fx[1], seed: Math.random() });
        Sfx.move(z.mv, 'land');
        if (z.mv.fx === 'tornado') {   // touching down: a puff of dust rather than a blast
          this.particles.push({ kind: 'wave', x: z.x, y: z.y - 2, r0: 4, r1: z.r * 1.3, life: 0.35, max: 0.35, color: '#d8ccb0', w: 3 });
          this.fxDebris(z.x, z.y - 4, { type: 'rock', palette: ['#8a7a5a', '#c8b898', '#e8dcc0'] }, 10, z.r * 3, 3.5, 4);
        } else this.fxBlast(z.x, z.y, z.r * 1.2, z.mv);
        this.decalAt(z.x, z.y, z.r * 0.7);
        this.addShake(4);
        for (const foe of this.foes(z.owner)) {
          if (Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) this.hit(z.owner, foe, z.mv, 1, { kb: Math.atan2(foe.y - z.y, foe.x - z.x) });
          if (this.state === 'faint') return;
        }
      } else if (z.done && z.mv.linger) {
        // a lingering pool keeps hurting whoever stands in it (and a tornado drags them in)
        if (z.mv.pull) for (const foe of this.foes(z.owner)) {
          const dx = z.x - foe.x, dy = z.y - foe.y, d = Math.hypot(dx, dy);
          if (d > 2 && d < z.r * 2.2 + foe.r) {
            const B = this.bounds(foe), pull = z.mv.pull * (foe.boss ? 0.4 : 1) * dt;
            foe.x = clamp(foe.x + dx / d * pull, B.x0, B.x1); foe.y = clamp(foe.y + dy / d * pull, B.y0, B.y1);
          }
        }
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick = 0.5;
          for (const foe of this.foes(z.owner)) {
            if (Math.hypot(foe.x - z.x, foe.y - z.y) < z.r + foe.r * 0.5) this.hit(z.owner, foe, z.mv, z.mv.tick, { merge: z.id, force: 0 });
            if (this.state === 'faint') return;
          }
        }
      }
    }
    this.zones = this.zones.filter(z => z.t < z.delay + (z.mv.linger || 0) + 0.05);
  }

  updateBalls(dt) {
    for (const b of this.balls) {
      b.t += dt;
      if (b.t >= b.dur && !b.done) {
        b.done = true;
        const m = this.P;
        m.visible = true; m.flash = 0.35; m.invuln = 0.4;
        this.particles.push({ x: b.to.x, y: b.to.y, r0: 2, r1: 26, life: 0.35, max: 0.35, color: '#ffffff', kind: 'ring', w: 3 });
        this.burst(b.to.x, b.to.y, ['#ffffff', '#ffe9a0', '#ffffff'], 20, 90);
        Sfx.play('pop');
      }
    }
    this.balls = this.balls.filter(b => !b.done);
  }
});
