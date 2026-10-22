// ------------------------------------------------------------------ CPU brain
// Drives one Coreature (each wild Coreature has its own; tests can drive the player with one).
class AI {
  constructor(diff) { this.d = diff; this.reset(); }
  reset() { this.dir = { x: 0, y: 0 }; this.want = -1; this.delay = 0; this.think = rand(0.2, 0.6); this.strafe = Math.random() < 0.5 ? 1 : -1; }

  update(dt, me, b) {
    const foe = b.foe(me);
    if (!foe) { this.dir = { x: 0, y: 0 }; this.want = -1; return this.dir; }
    this.think -= dt;
    if (this.think <= 0) {
      this.think = this.d.think * rand(0.7, 1.3);
      this.decide(me, foe, b);
    }
    if (this.want >= 0) {
      this.delay -= dt;
      if (this.delay <= 0) {
        if (b.tryMove(me, this.want) || me.cd[this.want] > 0) this.want = -1;
      }
    }
    return this.dir;
  }

  decide(me, foe, b) {
    const dx = foe.x - me.x, dy = foe.y - me.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    let mx, my;
    const threat = this.threat(me, b);
    if (threat && Math.random() < this.d.dodge) {
      mx = threat.x; my = threat.y;
    } else {
      if (Math.random() < 0.07) this.strafe *= -1;
      const radial = d > me.prefRange + 18 ? 1 : d < me.prefRange - 18 ? -0.8 : 0;
      mx = ux * radial - uy * this.strafe * 0.75;
      my = uy * radial + ux * this.strafe * 0.75;
    }
    // wild Coreatures spread out instead of piling onto one spot
    for (const o of b.e) {
      if (o === me || !o.alive || me.side !== 'enemy') continue;
      const ox = me.x - o.x, oy = me.y - o.y, od = Math.hypot(ox, oy);
      if (od < 60 && od > 0.1) { mx += ox / od * 0.7; my += oy / od * 0.7; }
    }
    // keep away from walls
    const m = 30, F = b.F;
    if (me.x < F.x0 + m) mx += 0.8; if (me.x > F.x1 - m) mx -= 0.8;
    if (me.y < F.y0 + m) my += 0.8; if (me.y > F.y1 - m) my -= 0.8;
    if ((me.x < F.x0 + m || me.x > F.x1 - m) && Math.random() < 0.3) this.strafe *= -1;
    const mm = Math.hypot(mx, my);
    this.dir = mm > 0.05 ? { x: mx / mm, y: my / mm } : { x: 0, y: 0 };

    // wild Coreatures take turns, so three of them don't all fire on the same frame
    const waiting = me.side === 'enemy' && b.enemyAtkT > 0;
    if (this.want < 0 && !waiting && me.canAct() && Math.random() < this.d.aggro) {
      const i = this.pick(me, foe, d);
      if (i >= 0) { this.want = i; this.delay = this.d.react * Math.random(); }
    }
  }

  pick(me, foe, d) {
    const c = [];
    me.moves.forEach((mv, i) => {
      if (me.cd[i] > 0) return;
      let ok = false, w = mv.power || 0;
      switch (mv.kind) {
        case 'projectile': ok = d < (mv.boomerang ? mv.range + 30 : 280); break;
        case 'vortex': ok = d < mv.r - 6; w *= 1.3; break;
        case 'beam': ok = d < mv.len - 20; w *= 1.1; break;
        case 'dash': ok = d < mv.speed * mv.dur + me.r + foe.r; w *= 1.2; break;
        case 'burst': ok = d < mv.r + foe.r * 0.5 - 4; w *= 1.4; break;
        case 'zone': ok = d < 300; break;
        case 'heal': ok = me.hp / me.maxHp < 0.5; w = 420; break;
        case 'buff': ok = me.buffs.length === 0 && d > 70; w = 140; break;
      }
      if (ok) c.push([i, Math.max(20, w * typeEffect(mv.type, foe.def.types))]);
    });
    if (!c.length) return -1;
    let total = c.reduce((s, x) => s + x[1], 0), r = Math.random() * total;
    for (const [i, w] of c) { if ((r -= w) <= 0) return i; }
    return c[0][0];
  }

  // Returns a unit vector to dodge along, or null.
  threat(me, b) {
    if (b.hazardThreat) { const h = b.hazardThreat(me); if (h) return h; }   // a boss's warned attacks (bosses.js)
    let best = null, bestT = Infinity;
    for (const p of b.projectiles) {
      if (p.owner.side === me.side) continue;
      const rx = me.x - p.x, ry = me.cy - p.y;
      const vv = p.vx * p.vx + p.vy * p.vy;
      const t = (rx * p.vx + ry * p.vy) / vv;
      if (t < 0 || t > 0.9) continue;
      const cx = rx - p.vx * t, cy = ry - p.vy * t;
      const s = Math.hypot(cx, cy);
      if (s < me.r + p.r + 10 && t < bestT) {
        bestT = t;
        const sp = Math.sqrt(vv);
        best = s > 0.5 ? { x: cx / s, y: cy / s } : { x: -p.vy / sp, y: p.vx / sp };
      }
    }
    if (best) return best;
    for (const z of b.zones) {
      // incoming strikes, and lingering pools that are still active
      if (z.owner.side === me.side || (z.done && !z.mv.linger)) continue;
      const dd = Math.hypot(me.x - z.x, me.y - z.y);
      if (dd < z.r + me.r + 8) return dd > 0.5 ? { x: (me.x - z.x) / dd, y: (me.y - z.y) / dd } : { x: 1, y: 0 };
    }
    for (const foe of b.foes(me)) {
      const a = foe.action;
      if (!a) continue;
      if (a.kind === 'beam' || a.kind === 'dash' || (a.kind === 'burst' && a.mv.cone)) {
        const cx = Math.cos(a.dir), cy = Math.sin(a.dir);
        const along = (me.x - foe.x) * cx + (me.cy - foe.cy) * cy;
        if (along < -10) continue;   // it's aimed away from me
        const side = Math.sign((me.x - foe.x) * cy - (me.cy - foe.cy) * cx) || 1;
        return { x: cy * side, y: -cx * side };
      }
      if (a.kind === 'burst' || a.kind === 'vortex') {   // get out of the blast or the pull
        const dd = dist(me, foe) || 1;
        if (dd < a.mv.r + (a.kind === 'vortex' ? 30 : 18)) return { x: (me.x - foe.x) / dd, y: (me.y - foe.y) / dd };
      }
    }
    return null;
  }
}
