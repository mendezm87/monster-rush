// Online 2-player over WebRTC, using PeerJS and its free public signalling server
// to find each other (the library is only loaded once someone opens the online menu).
//
// The host's browser runs the battle exactly as in local 2-player mode. The guest
// sends its stick and buttons, and gets a snapshot of everything on screen about
// 20 times a second, which it draws from its own side of the arena (Battle.flip).
// Between snapshots the guest keeps things moving along their last velocities.

const Net = (() => {
  const PEERJS = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  const PREFIX = 'monster-battle-stadium-v1-';
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const SNAP_GAP = 1 / 20;

  // STUN servers let each browser learn its public address so the two can link
  // directly. Some networks (mobile data especially) block direct links; those need
  // a TURN relay. PeerJS's built-in relay is gone, so a relay has to be supplied:
  // set TURN_URL to a provider endpoint that returns a JSON array of iceServers
  // (e.g. Metered: https://<app>.metered.live/api/v1/turn/credentials?apiKey=<key>).
  const STUN = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];
  const TURN_URL = 'https://monsterbattle.metered.live/api/v1/turn/credentials?apiKey=4dfcbabe48c3ae5dd2a2edc601a58454553f';
  const LINK_FAILED = 'Found the game, but could not link the two devices. Reload the page on both and try again. If it keeps failing, a VPN or a privacy extension on either device may be blocking the connection.';
  let relayLoaded = false;

  // Which kinds of route this browser could offer, for the error message:
  // host = local network, srflx = public address, relay = the TURN relay.
  async function routesTried(c) {
    try {
      const st = await c.peerConnection.getStats();
      const kinds = new Set();
      st.forEach(s => { if (s.type === 'local-candidate') kinds.add({ host: 'local', srflx: 'public', relay: 'relay' }[s.candidateType] || s.candidateType); });
      return [...kinds].join(', ') || 'none';
    } catch (e) { return 'unknown'; }
  }

  let peer = null, conn = null, role = null;
  let onMessage = () => {}, onConnected = () => {}, onClosed = () => {};
  const r1 = v => Math.round(v * 10) / 10;

  let iceCache = null;
  async function peerOptions() {
    if (!iceCache) {
      let servers = STUN;
      if (TURN_URL) {
        try { servers = STUN.concat(await (await fetch(TURN_URL)).json()); relayLoaded = true; }
        catch (e) { console.warn('[net] no relay credentials', e); }
      }
      iceCache = servers;
    }
    return { config: { iceServers: iceCache } };
  }

  // ---------------------------------------------------------- connection
  let libPromise = null;
  function loadLib() {
    if (window.Peer) return Promise.resolve();
    return libPromise || (libPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = PEERJS; s.onload = res;
      s.onerror = () => { libPromise = null; rej(new Error('Could not load the online library. Check your connection.')); };
      document.head.appendChild(s);
    }));
  }

  // Until a connection opens it is only an attempt: if it fails, forget it (the
  // host's room stays open for another try) instead of tearing everything down.
  function wire(c) {
    conn = c;
    let opened = false;
    const forget = () => { if (conn === c && !opened) conn = null; };
    c.on('open', () => { opened = true; onConnected(role); });
    c.on('data', receive);
    c.on('close', () => (opened ? drop('Your opponent left.') : forget()));
    c.on('error', e => {
      console.warn('[net]', e && (e.type || e.message), e);
      if (opened) drop('The connection was lost.'); else forget();
    });
    c.on('iceStateChanged', s => { if (!opened && (s === 'failed' || s === 'closed')) forget(); });
  }

  function drop(reason) {
    if (!conn) return;
    conn = null;
    const wasRole = role;
    leave();
    onClosed(reason, wasRole);
  }

  // Host a game: resolves with the 5-letter room code once the signalling server knows us.
  async function host() {
    leave();
    await loadLib();
    const opts = await peerOptions();
    role = 'host';
    for (let tries = 0; tries < 4; tries++) {
      const code = Array.from({ length: 5 }, () => CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0]).join('');
      try {
        await new Promise((res, rej) => {
          peer = new Peer(PREFIX + code, opts);
          peer.on('open', res);
          peer.on('error', rej);
        });
      } catch (e) {
        if (peer) peer.destroy();
        peer = null;
        if (e.type === 'unavailable-id') continue;   // code already taken, roll another
        role = null;
        throw new Error('Could not reach the matchmaking server.');
      }
      peer.on('connection', c => {
        if (conn && conn.open) { c.on('open', () => c.close()); return; }   // room is full
        if (conn) conn.close();   // an earlier attempt that never opened: replace it
        wire(c);
      });
      peer.on('error', () => {});
      return code;
    }
    role = null;
    throw new Error('Could not get a room code. Try again.');
  }

  // Join a game by its room code; onConnected fires when the link is up.
  async function join(code) {
    leave();
    await loadLib();
    const opts = await peerOptions();
    role = 'guest';
    await new Promise((res, rej) => {
      peer = new Peer(opts);
      peer.on('open', res);
      peer.on('error', e => rej(e));
    }).catch(() => { leave(); throw new Error('Could not reach the matchmaking server.'); });
    return new Promise((res, rej) => {
      let done = false;
      const fail = msg => { if (done) return; done = true; clearTimeout(timer); leave(); rej(new Error(msg)); };
      // add what was tried, so a screenshot of the message is enough to diagnose it
      const failLink = async () => {
        if (done) return;
        const routes = await routesTried(c);
        fail(`${LINK_FAILED} (Relay: ${relayLoaded ? 'loaded' : 'not loaded'}. Routes tried: ${routes}.)`);
      };
      const timer = setTimeout(failLink, 20000);
      peer.on('error', e => (e.type === 'peer-unavailable' ? fail('No game with that code. Check it, and keep the game open on the host\'s screen.') : failLink()));
      const c = peer.connect(PREFIX + code.toUpperCase(), { reliable: true, serialization: 'json' });
      wire(c);
      // the room was found but no route between the devices works: say so right away
      c.on('iceStateChanged', s => { if (s === 'failed') failLink(); });
      c.on('open', () => { if (done) return; done = true; clearTimeout(timer); res(); });
    });
  }

  function leave() {
    if (conn) { try { conn.send({ t: 'bye' }); } catch (e) { /* already closed */ } }
    const c = conn; conn = null;
    if (c) setTimeout(() => c.close(), 100);
    if (peer) { const p = peer; peer = null; setTimeout(() => p.destroy(), 150); }
    role = null; battle = null; pendingPick = null;
  }

  let sentBytes = 0, maxMsg = 0;
  function send(msg) {
    if (!conn || !conn.open) return;
    if (window.__netStats) { const n = JSON.stringify(msg).length; sentBytes += n; maxMsg = Math.max(maxMsg, n); window.__netStats = { sentBytes, maxMsg }; }
    conn.send(msg);
  }

  function receive(d) {
    if (d.t === 'in') { remote.x = d.v[0]; remote.y = d.v[1]; remote.m = d.v[2]; return; }
    if (d.t === 's') { if (battle && battle.puppet) applySnap(battle, d); return; }
    if (d.t === 'picked') { if (pendingPick) { const cb = pendingPick; pendingPick = null; cb(d.i); } return; }
    if (d.t === 'bye') { drop('Your opponent left.'); return; }
    onMessage(d);
  }

  // ---------------------------------------------------------- host side
  let battle = null, snapT = 0, pendingPick = null;
  const remote = { x: 0, y: 0, m: 0 };
  const rec = { snd: [], beam: [], ui: [], dec: [] };
  const clearRec = () => { rec.snd = []; rec.beam = []; rec.ui = []; rec.dec = []; };
  const recording = () => role === 'host' && battle && !battle.puppet;

  // Sounds made by the simulation are replayed on the guest. Result jingles are
  // left out: each side plays its own win or lose tune.
  const sfxPlay = Sfx.play, sfxCharge = Sfx.beamCharge, sfxFire = Sfx.beamFire;
  Sfx.play = name => { sfxPlay.call(Sfx, name); if (recording() && name !== 'win' && name !== 'lose') rec.snd.push(name); };
  Sfx.beamCharge = dur => { sfxCharge.call(Sfx, dur); if (recording()) rec.beam.push([dur]); };
  Sfx.beamFire = (dur, type) => { sfxFire.call(Sfx, dur, type); if (recording()) rec.beam.push([dur, type]); };

  // What the host's battle tells the screen is also recorded for the guest.
  const hostUI = Object.assign(Object.create(UI), {
    callout(side, name, type) { UI.callout(side, name, type); rec.ui.push(['c', side, name, type]); },
    banner(text) { UI.banner(text); rec.ui.push(['b', text]); },
    onSendOut(side, mon) { UI.onSendOut(side, mon); rec.ui.push(['o', side]); },
    pickNext(team, cb, who) {
      if (who === 'enemy') { pendingPick = cb; send({ t: 'pick' }); UI.banner('OPPONENT IS CHOOSING'); }
      else { send({ t: 'wait' }); UI.pickNext(team, cb, null); }
    },
    onEnd(r) {
      UI.onEnd({ ...r, twoP: false });
      const flipRes = { win: 'lose', lose: 'win', draw: 'draw' }[r.result];
      send({ t: 'end', r: { result: flipRes, time: r.time, kos: r.lost, lost: r.kos, dealt: r.dealtE } });
    },
  });

  const p2Input = {
    dir: () => ({ x: remote.x, y: remote.y }),
    moves: () => [0, 1, 2, 3].map(i => !!(remote.m & (1 << i))),
  };

  // Extra Battle options for an online game. `cfg` comes from the host's start message.
  function battleOptions(cfg) {
    const base = { playerTeam: cfg.p, enemyTeam: cfg.e, stage: cfg.stage, seed: cfg.seed, twoP: true, online: true };
    return role === 'host' ? { ...base, ui: hostUI, p2Input } : { ...base, flip: true, puppet: true };
  }

  function attach(b) {
    battle = b; snapT = 0; pendingPick = null; clearRec();
    remote.x = remote.y = remote.m = 0;
    if (role === 'host') {
      // scorch marks are random, so the guest gets the call and draws its own
      const decalAt = b.decalAt.bind(b);
      b.decalAt = (x, y, r) => { decalAt(x, y, r); rec.dec.push([r1(x), r1(y), r1(r)]); };
    }
  }

  function hostTick(dt) {
    if (!battle || role !== 'host') return;
    snapT -= dt;
    if (snapT > 0) return;
    snapT = SNAP_GAP;
    send(snapshot(battle));
  }

  // ---------------------------------------------------------- snapshots
  const lite = m => [Math.ceil(m.hp), m.fainted ? 1 : 0, m.status || 0];
  function full(m) {
    const a = m.action;
    return {
      x: r1(m.x), y: r1(m.y), vx: r1(m.vx), vy: r1(m.vy), kx: r1(m.kx), ky: r1(m.ky), f: m.face, w: r1(m.walkT),
      fl: +m.flash.toFixed(2), v: m.visible ? 1 : 0, ft: +m.fadeT.toFixed(2), st: +m.stunT.toFixed(2),
      cd: m.cd.map(r1), b: m.buffs.map(b => [b.stat, b.mul, r1(b.t)]),
      a: a ? { k: a.kind, t: +a.t.toFixed(3), d: a.dir, p: a.phase, m: a.mv ? a.mv.id : 0, dn: a.done ? 1 : 0, du: a.dur } : 0,
      g: m.ghosts.map(g => [r1(g.x), r1(g.y), g.face, +g.t.toFixed(2), g.color]),
    };
  }
  // Particles are cosmetic and numerous, so they travel as short arrays and only
  // the newest few make it into each snapshot.
  const MAX_PARTICLES = 90;
  const r2 = v => Math.round(v * 100) / 100;
  const ga = p => (p.g === undefined ? null : r1(p.g));
  function packParticle(p) {
    switch (p.kind) {
      case 'sq': return ['q', r1(p.x), r1(p.y), r1(p.vx), r1(p.vy), r2(p.life), p.max, r1(p.size), p.color, p.drag || 0, ga(p)];
      case 'spark': return ['s', r1(p.x), r1(p.y), r1(p.vx), r1(p.vy), r2(p.life), p.max, p.color, p.drag || 0, ga(p)];
      case 'ring': return ['r', r1(p.x), r1(p.y), p.r0, r1(p.r1), r2(p.life), p.max, p.color, p.w, ga(p)];
      case 'line': return ['l', r1(p.x), r1(p.y), r1(p.x2), r1(p.y2), r2(p.life), p.max, p.color, ga(p), r1(p.k2 ?? 19)];
      case 'bolt': return ['b', r1(p.x), r1(p.y), r2(p.life), p.max, p.color, r2(p.seed)];
    }
    return null;
  }
  function unpackParticle(a) {
    const g = v => (v === null ? undefined : v);
    switch (a[0]) {
      case 'q': return { kind: 'sq', x: a[1], y: a[2], vx: a[3], vy: a[4], life: a[5], max: a[6], size: a[7], color: a[8], drag: a[9], g: g(a[10]) };
      case 's': return { kind: 'spark', x: a[1], y: a[2], vx: a[3], vy: a[4], life: a[5], max: a[6], color: a[7], drag: a[8], g: g(a[9]) };
      case 'r': return { kind: 'ring', x: a[1], y: a[2], r0: a[3], r1: a[4], life: a[5], max: a[6], color: a[7], w: a[8], g: g(a[9]) };
      case 'l': return { kind: 'line', x: a[1], y: a[2], x2: a[3], y2: a[4], life: a[5], max: a[6], color: a[7], g: g(a[8]), k2: a[9] };
      case 'b': return { kind: 'bolt', x: a[1], y: a[2], life: a[3], max: a[4], color: a[5], seed: a[6] };
    }
    return null;
  }

  // PeerJS's JSON channel refuses messages over ~16 KB
  const MAX_BYTES = 14000;
  function snapshot(b) {
    let fresh = [];
    for (const p of b.particles) {
      if (p._s) continue;
      p._s = 1;
      const q = packParticle(p);
      if (q) fresh.push(q);
    }
    // rings, lines and bolts carry the most meaning; keep them, then the newest squares
    fresh.sort((a, c) => (a[0] === 'q' || a[0] === 's') - (c[0] === 'q' || c[0] === 's'));
    if (fresh.length > MAX_PARTICLES) fresh = fresh.slice(0, MAX_PARTICLES);
    const s = {
      t: 's', st: b.state, stT: r1(b.stateT), cl: r1(b.clock), sh: r1(b.shake), pi: b.pi, ei: b.ei,
      sc: [r1(b.swapCd.player), r1(b.swapCd.enemy)], ko: [b.kos.player, b.kos.enemy],
      tp: b.p.map(lite), te: b.e.map(lite), P: full(b.P), E: full(b.E),
      pr: b.projectiles.map(p => [r1(p.x), r1(p.y), r1(p.vx), r1(p.vy), p.r, p.mv.id, r1(p.spin), p.owner.side === 'player' ? 0 : 1, r1(p.k)]),
      zo: b.zones.map(z => [r1(z.x), r1(z.y), z.r, +z.t.toFixed(3), z.delay, z.mv.id, z.done ? 1 : 0, z.id || 0]),
      ba: b.balls.map(x => [x.side, +x.t.toFixed(3), x.dur, r1(x.to.x), r1(x.to.y)]),
      fl: b.floats.map(f => [f.val, r1(f.x), r1(f.y), r1(f.g), +f.t.toFixed(3), f.fill, f.shade, f.prefix]),
      tx: b.texts.map(t => [r1(t.x), r1(t.y), r1(t.g), t.str, t.color, +t.t.toFixed(3)]),
      pa: fresh, ev: { ...rec },
    };
    clearRec();
    // still too big (a burst of effects at once): shed particles until it fits
    let size = JSON.stringify(s).length;
    while (size > MAX_BYTES && s.pa.length) {
      s.pa = s.pa.slice(0, Math.floor(s.pa.length / 2));
      size = JSON.stringify(s).length;
    }
    return s;
  }

  // ---------------------------------------------------------- guest side
  const numCache = new Map();
  function numImg(text, fill, shade) {
    const key = text + fill + shade;
    if (!numCache.has(key)) {
      if (numCache.size > 300) numCache.clear();
      numCache.set(key, numberCanvas(text, fill, shade));
    }
    return numCache.get(key);
  }

  function applyMon(m, d) {
    Object.assign(m, { x: d.x, y: d.y, vx: d.vx, vy: d.vy, kx: d.kx, ky: d.ky, face: d.f, walkT: d.w,
      flash: d.fl, visible: !!d.v, fadeT: d.ft, stunT: d.st, cd: d.cd });
    m.buffs = d.b.map(([stat, mul, t]) => ({ stat, mul, t }));
    m.action = d.a ? { kind: d.a.k, t: d.a.t, dir: d.a.d, phase: d.a.p, mv: d.a.m ? MOVES[d.a.m] : null, done: !!d.a.dn, dur: d.a.du, lock: true } : null;
    m.ghosts = d.g.map(([x, y, face, t, color]) => ({ x, y, face, t, color }));
  }
  function applyLite(m, [hp, fainted, status]) { m.hp = hp; m.fainted = !!fainted; m.status = status || null; }

  function applySnap(b, s) {
    b.state = s.st; b.stateT = s.stT; b.clock = s.cl; b.shake = Math.max(b.shake, s.sh);
    b.pi = s.pi; b.ei = s.ei;
    b.swapCd.player = s.sc[0]; b.swapCd.enemy = s.sc[1];
    b.kos.player = s.ko[0]; b.kos.enemy = s.ko[1];
    s.tp.forEach((x, i) => applyLite(b.p[i], x));
    s.te.forEach((x, i) => applyLite(b.e[i], x));
    applyMon(b.P, s.P); applyMon(b.E, s.E);
    b.projectiles = s.pr.map(([x, y, vx, vy, r, id, spin, side, k]) => ({ x, y, vx, vy, r, mv: MOVES[id], spin, owner: side ? b.E : b.P, k, life: 1 }));
    b.zones = s.zo.map(([x, y, r, t, delay, id, done, zid]) => ({ x, y, r, t, delay, mv: MOVES[id], done: !!done, id: zid }));
    b.balls = s.ba.map(([side, t, dur, x, y]) => ({ side, t, dur, from: TRAINER_POS[side], to: { x, y } }));
    b.floats = s.fl.map(([val, x, y, g, t, fill, shade, prefix]) => ({ val, x, y, g, t, img: numImg((prefix || '') + val, fill, shade) }));
    b.texts = s.tx.map(([x, y, g, str, color, t]) => ({ x, y, g, str, color, t }));
    for (const a of s.pa) { const p = unpackParticle(a); if (p) b.particles.push(p); }
    const ev = s.ev;
    ev.snd.forEach(n => Sfx.play(n));
    ev.beam.forEach(([dur, type]) => (type ? Sfx.beamFire(dur, type) : Sfx.beamCharge(dur)));
    ev.dec.forEach(([x, y, r]) => b.decalAt(x, y, r));
    for (const [k, a, n, ty] of ev.ui) {
      if (k === 'c') UI.callout(a, n, ty);
      else if (k === 'b') UI.banner(a);
      else if (k === 'o') UI.onSendOut(a, a === 'player' ? b.P : b.E);
    }
  }

  // Every frame on the guest: send input, then keep the picture moving until the next snapshot.
  let lastIn = '', inT = 0;
  function guestFrame(dt, paused) {
    const b = battle;
    if (!b) return;
    const d = Input.dir(0), held = Input.moves(0);
    // the guest's view is turned 180°, so its directions point the other way in the arena
    const v = [Math.round(-d.x * 100) / 100, Math.round(-d.y * 100) / 100, held.reduce((a, h, i) => a | (h ? 1 << i : 0), 0)];
    const key = v.join(',');
    inT -= dt;
    if (key !== lastIn || inT <= 0) { send({ t: 'in', v }); lastIn = key; inT = 0.1; }
    if (paused || b.state === 'pick') return;
    b.time += dt; b.shake *= Math.exp(-dt * 9);
    b.updateWeather(dt); b.updateParticles(dt);
    for (const p of b.projectiles) { p.x += p.vx * dt; p.y += p.vy * dt; p.spin += dt * 12; }
    for (const z of b.zones) z.t += dt;
    for (const x of b.balls) x.t += dt;
    for (const m of [b.P, b.E]) {
      if (m.visible && !m.fainted && b.state === 'fight') {
        m.x = clamp(m.x + (m.vx + m.kx) * dt, FIELD.x0 + m.r, FIELD.x1 - m.r);
        m.y = clamp(m.y + (m.vy + m.ky) * dt, FIELD.y0 + m.r, FIELD.y1 - 2);
        m.walkT += Math.hypot(m.vx, m.vy) * dt;
      }
      if (m.action) m.action.t += dt;
      if (m.fainted) m.fadeT += dt;
      m.flash = Math.max(0, m.flash - dt);
      m.ghosts.forEach(g => (g.t -= dt));
      m.ghosts = m.ghosts.filter(g => g.t > 0);
    }
  }

  return {
    host, join, leave, send, battleOptions, attach, hostTick, guestFrame,
    get role() { return role; },
    get active() { return !!(conn && conn.open); },
    set onMessage(f) { onMessage = f; }, set onConnected(f) { onConnected = f; }, set onClosed(f) { onClosed = f; },
  };
})();
