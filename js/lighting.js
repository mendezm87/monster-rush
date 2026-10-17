// Room lighting ("HD-2D" rooms): each floor theme's mood light, flickering wall torches,
// soft shadows, a lens-style blur on the far and near edges, and floating light motes.
// Attacks, warning circles, numbers and the HUD are drawn after the lighting, so they
// stay crisp pixel art. Can be switched off (Settings) for slow devices.

const Lighting = (() => {
  const CW = W * 2, CH = H * 2;   // the light buffers work at 2x whatever the canvas size (RES)
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const light = mk(CW, CH), small = mk(CW / 4, CH / 4), blur = mk(CW, CH), mask = mk(CW, CH);
  // where the lens blur shows: the top and bottom edges of the screen
  {
    const c = mask.getContext('2d'), g = c.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.15, 'rgba(0,0,0,0)');
    g.addColorStop(0.86, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.9)');
    c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  }
  // a soft shadow blob, stretched to size when drawn
  const SHADOW = mk(64, 32);
  {
    const c = SHADOW.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.6, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.scale(1, 0.5); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  }
  const motes = Array.from({ length: 36 }, () => ({ x: Math.random() * W, y: Math.random() * H, vy: -4 - Math.random() * 8, ph: Math.random() * 6 }));
  let lastT = null;

  // Wall torches for a room (worked out once and kept on the room).
  function torches(room) {
    if (room.torches) return room.torches;
    const F = roomField(room), list = [];
    const clearOf = (v, door) => door === undefined || Math.abs(v - door) > DOOR_W / 2 + 14;
    for (let x = 90; x < room.w - 60; x += 170) {
      if (clearOf(x, room.doors.n ? room.w / 2 : undefined)) list.push({ x, y: 26, wall: 'top' });
    }
    const my = (F.y0 + F.y1) / 2;
    for (let y = F.y0 + 60; y < F.y1 - 20; y += 150) {
      if (clearOf(y, room.doors.w ? my : undefined)) list.push({ x: 13, y, wall: 'side' });
      if (clearOf(y, room.doors.e ? my : undefined)) list.push({ x: room.w - 13, y, wall: 'side' });
    }
    return (room.torches = list);
  }

  return {
    on: true,
    // soft shadow when lit, the old flat ellipse otherwise (world coordinates)
    shadow(ctx, x, y, rx, ry, alpha = 1) {
      if (!this.on) {
        ctx.fillStyle = `rgba(0,0,0,${0.28 * alpha})`;
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        return;
      }
      const a = ctx.globalAlpha; ctx.globalAlpha = a * alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(SHADOW, x - rx * 1.5 + 2, y - ry * 1.6, rx * 3, ry * 3.2);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = a;
    },
    // flickering torches on the walls (drawn in world space with the room)
    drawTorches(ctx, room, t) {
      if (!this.on) return;
      for (const tc of torches(room)) {
        const fl = Math.sin(t * 13 + tc.x + tc.y) * 0.5 + 0.5;
        ctx.fillStyle = '#3a2a22'; ctx.fillRect(tc.x - 2, tc.y - 2, 4, 10);
        ctx.fillStyle = '#ff7a1c'; ctx.fillRect(tc.x - 3, Math.round(tc.y - 8 - fl), 6, 6);
        ctx.fillStyle = '#ffe066'; ctx.fillRect(tc.x - 1.5, Math.round(tc.y - 6 - fl), 3, 3);
      }
    },
    // Light the scene drawn so far: multiply by a light map, then soften the far and near edges.
    apply(ctx, b) {
      if (!this.on) return;
      const mood = b.stage.light, cx = Math.round(b.cam.x), cy = Math.round(b.cam.y), t = b.time;
      const lc = light.getContext('2d');
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over';
      lc.fillStyle = mood.amb; lc.fillRect(0, 0, CW, CH);
      lc.globalCompositeOperation = 'lighter';
      const glow = (x, y, r, [R, G, B], a) => {
        const sx = (x - cx) * 2, sy = (y - cy) * 2, sr = r * 2;
        if (sx < -sr || sy < -sr || sx > CW + sr || sy > CH + sr) return;
        const g = lc.createRadialGradient(sx, sy, 0, sx, sy, sr);
        g.addColorStop(0, `rgba(${R},${G},${B},${a})`); g.addColorStop(1, `rgba(${R},${G},${B},0)`);
        lc.fillStyle = g; lc.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      };
      for (const tc of torches(b.room)) glow(tc.x, tc.y + 14, 200 + Math.sin(t * 9 + tc.x) * 10, mood.torch, 0.85);
      const P = b.P;
      if (P.visible) glow(P.x, P.y - 10, 110, [255, 235, 210], 0.35);   // a soft light that follows your monster
      for (const m of b.e) if (m.alive) glow(m.x, m.y - 10, 70, [255, 235, 210], 0.18);
      if (b.stairs) glow(b.stairs.x, b.stairs.y, 60, [255, 220, 120], 0.4);
      ctx.save();
      ctx.setTransform(RES / 2, 0, 0, RES / 2, 0, 0);   // the light buffers are 2x; stretch them to the canvas
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(light, 0, 0);
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; ctx.drawImage(light, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // lens blur: a small blurred copy, shown only along the top and bottom edges
      const sc = small.getContext('2d');
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.imageSmoothingEnabled = true; sc.filter = 'blur(1.2px)';
      sc.drawImage(ctx.canvas, 0, 0, small.width, small.height); sc.filter = 'none';
      const bc = blur.getContext('2d');
      bc.globalCompositeOperation = 'source-over'; bc.clearRect(0, 0, CW, CH);
      bc.imageSmoothingEnabled = true; bc.drawImage(small, 0, 0, CW, CH);
      bc.globalCompositeOperation = 'destination-in'; bc.drawImage(mask, 0, 0);
      ctx.drawImage(blur, 0, 0);
      ctx.restore();
    },
    // After the crisp layer: floating motes, the theme's colour tint and a soft vignette (screen space).
    overlay(ctx, b) {
      if (!this.on) return;
      const mood = b.stage.light, t = b.time, dt = lastT === null ? 0 : Math.max(0, Math.min(0.05, t - lastT));
      lastT = t;
      ctx.save();
      ctx.setTransform(RES / 2, 0, 0, RES / 2, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      const [R, G, B] = mood.torch;
      for (const m of motes) {
        m.y += m.vy * dt; m.x += Math.sin(t + m.ph) * 4 * dt;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        const a = 0.3 + Math.sin(t * 2 + m.ph) * 0.2, x = m.x * 2, y = m.y * 2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, `rgba(${R},${G},${B},${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 7, y - 7, 14, 14);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = mood.tint; ctx.fillRect(0, 0, CW, CH);
      const v = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.4, CW / 2, CH / 2, CH * 1.0);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, CW, CH);
      ctx.restore();
    },
  };
})();
