// Room lighting ("HD-2D" rooms): each floor theme's mood light, flickering wall torches,
// soft shadows, a lens-style blur on the far and near edges, and floating light motes.
// Attacks, warning circles, numbers and the HUD are drawn after the lighting, so they
// stay crisp pixel art. Can be switched off (Settings) for slow devices.
//
// Kept cheap because it runs every frame over the whole screen (r42, the owner saw the frame
// rate drop with it on): the light map is built at half the view's size from pre-drawn glow
// sprites (no new gradients per frame), the lens blur only touches the top and bottom strips
// and softens them by shrinking and stretching (no canvas blur filter, which was the slowest
// part), and the motes and vignette are pre-drawn too.

const Lighting = (() => {
  const LS = 0.5;                                  // light map pixels per world unit (it's a soft map)
  const LW = Math.round(W * LS), LH = Math.round(H * LS);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const light = mk(LW, LH);
  // Pre-drawn soft round glows, one per colour, stretched to size when drawn.
  const glows = {};
  function glowSprite([R, G, B], size = 64) {
    const key = R + ',' + G + ',' + B + ',' + size;
    if (glows[key]) return glows[key];
    const c = mk(size, size), x = c.getContext('2d'), h = size / 2, g = x.createRadialGradient(h, h, 0, h, h, h);
    g.addColorStop(0, `rgba(${R},${G},${B},1)`); g.addColorStop(1, `rgba(${R},${G},${B},0)`);
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return (glows[key] = c);
  }
  // The lens blur: the top 15% and bottom 14% of the view, shrunk to a third and stretched back
  // (bilinear smoothing does the blurring), fading out towards the middle (the strip masks).
  const BLUR = 1 / 3, TOP = Math.round(H * 0.15), BOT = Math.round(H * 0.14);
  const strip = (h, fadeDown) => {
    const c = mk(Math.round(W * BLUR), Math.max(1, Math.round(h * BLUR))), m = mk(c.width, c.height), mx = m.getContext('2d');
    const g = mx.createLinearGradient(0, 0, 0, m.height);
    g.addColorStop(fadeDown ? 0 : 1, `rgba(0,0,0,${fadeDown ? 1 : 0.9})`); g.addColorStop(fadeDown ? 1 : 0, 'rgba(0,0,0,0)');
    mx.fillStyle = g; mx.fillRect(0, 0, m.width, m.height);
    return { c, m };
  };
  const topStrip = strip(TOP, true), botStrip = strip(BOT, false);
  // the theme's colour tint and a vignette (darker towards the corners), drawn once per tint
  // so the overlay is a single full-screen layer
  const finishes = {};
  function finish(tint) {
    if (finishes[tint]) return finishes[tint];
    const c = mk(W / 2, H / 2), x = c.getContext('2d');
    x.fillStyle = tint; x.fillRect(0, 0, c.width, c.height);
    const v = x.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.4, c.width / 2, c.height / 2, c.height);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = v; x.fillRect(0, 0, c.width, c.height);
    return (finishes[tint] = c);
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
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.globalAlpha = 1;
      lc.fillStyle = mood.amb; lc.fillRect(0, 0, LW, LH);
      lc.globalCompositeOperation = 'lighter'; lc.imageSmoothingEnabled = true;
      const glow = (x, y, r, rgb, a) => {
        const sx = (x - cx) * LS, sy = (y - cy) * LS, sr = r * LS;
        if (sx < -sr || sy < -sr || sx > LW + sr || sy > LH + sr) return;
        lc.globalAlpha = a; lc.drawImage(glowSprite(rgb), sx - sr, sy - sr, sr * 2, sr * 2);
      };
      for (const tc of torches(b.room)) glow(tc.x, tc.y + 14, 200 + Math.sin(t * 9 + tc.x) * 10, mood.torch, 0.85);
      const P = b.P;
      if (P.visible) glow(P.x, P.y - 10, 110, [255, 235, 210], 0.35);   // a soft light that follows your monster
      for (const m of b.e) if (m.alive) glow(m.x, m.y - 10, 70, [255, 235, 210], 0.18);
      if (b.stairs) glow(b.stairs.x, b.stairs.y, 60, [255, 220, 120], 0.4);
      lc.globalAlpha = 1;
      ctx.save();
      ctx.setTransform(RES / LS, 0, 0, RES / LS, 0, 0);   // stretch the small light map over the canvas
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(light, 0, 0);
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; ctx.drawImage(light, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // lens blur along the top and bottom edges only
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      const cvs = ctx.canvas;
      for (const [s, y, h] of [[topStrip, 0, TOP], [botStrip, H - BOT, BOT]]) {
        const sc = s.c.getContext('2d');
        sc.globalCompositeOperation = 'copy'; sc.imageSmoothingEnabled = true;
        sc.drawImage(cvs, 0, y * RES, W * RES, h * RES, 0, 0, s.c.width, s.c.height);
        sc.globalCompositeOperation = 'destination-in'; sc.drawImage(s.m, 0, 0);
        ctx.drawImage(s.c, 0, y, W, h);
      }
      ctx.restore();
    },
    // After the crisp layer: floating motes, the theme's colour tint and a soft vignette (screen space).
    overlay(ctx, b) {
      if (!this.on) return;
      const mood = b.stage.light, t = b.time, dt = lastT === null ? 0 : Math.max(0, Math.min(0.05, t - lastT));
      lastT = t;
      ctx.save();
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
      const mote = glowSprite(mood.torch, 16);
      for (const m of motes) {
        m.y += m.vy * dt; m.x += Math.sin(t + m.ph) * 4 * dt;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        ctx.globalAlpha = 0.3 + Math.sin(t * 2 + m.ph) * 0.2;
        ctx.drawImage(mote, m.x - 3.5, m.y - 3.5, 7, 7);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(finish(mood.tint), 0, 0, W, H);
      ctx.restore();
    },
  };
})();
