// Tiny synthesized sound effects (WebAudio, no asset files).
const Sfx = (() => {
  // Sound effects play into `master` (the effects volume) and music into `musicBus` (the music
  // volume); both feed `mainOut`, the overall level that mute silences.
  let ctx = null, master = null, musicBus = null, mainOut = null, noiseBuf = null, muted = false;
  const vol = { music: 0.8, sfx: 0.8 };   // 0..1, from the settings
  const last = {};

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      mainOut = ctx.createGain();
      mainOut.gain.value = muted ? 0 : 0.3;
      mainOut.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = vol.sfx; master.connect(mainOut);
      musicBus = ctx.createGain(); musicBus.gain.value = vol.music; musicBus.connect(mainOut);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type = 'square', vol = 0.2, slide = 0, delay = 0) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol = 0.3, freq = 1000, delay = 0) {
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const SCREAM_GAIN = 0.5; // level-matched just under the beam blasts (a high scream sounds louder than it measures)

  const lib = {
    select() { tone(880, 0.06, 'square', 0.12); },
    back() { tone(440, 0.06, 'square', 0.1); },
    shoot() { tone(720, 0.09, 'square', 0.08, -420); },
    dash() { noise(0.18, 0.18, 2400); tone(260, 0.15, 'sawtooth', 0.06, 300); },
    charge() { tone(180, 0.45, 'sawtooth', 0.07, 600); },
    beam() { noise(0.6, 0.22, 1800); tone(110, 0.6, 'sawtooth', 0.1, 40); },
    hit() { noise(0.12, 0.35, 1600); tone(150, 0.1, 'square', 0.14, -70); },
    bigHit() { noise(0.3, 0.5, 900); tone(90, 0.25, 'square', 0.2, -50); },
    boom() { noise(0.45, 0.5, 600); tone(70, 0.4, 'triangle', 0.25, -30); },
    zap() { noise(0.2, 0.3, 4000); tone(1200, 0.12, 'square', 0.06, -900); },
    heal() { tone(523, 0.1, 'triangle', 0.15); tone(659, 0.1, 'triangle', 0.15, 0, 0.08); tone(784, 0.18, 'triangle', 0.15, 0, 0.16); },
    buff() { tone(400, 0.25, 'triangle', 0.14, 500); },
    status() { tone(300, 0.08, 'square', 0.1); tone(300, 0.08, 'square', 0.1, 0, 0.12); },
    ball() { tone(380, 0.18, 'sine', 0.18, 500); },
    // a monster's data beamed out of the bracer, and back in (Monster Rush)
    deploy() { tone(520, 0.06, 'square', 0.06, 260); tone(780, 0.06, 'square', 0.06, 390, 0.05); tone(1170, 0.14, 'triangle', 0.09, 700, 0.1); },
    recall() { tone(1240, 0.07, 'square', 0.05, -500, 0); tone(820, 0.1, 'triangle', 0.07, -420, 0.05); },
    pop() { noise(0.12, 0.25, 3000); tone(900, 0.08, 'square', 0.08); },
    faint() { tone(500, 0.7, 'triangle', 0.22, -420); },
    // boomerang throw: an airy swoosh rising in pitch
    whoosh() {
      const t = ctx.currentTime;
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; f.type = 'bandpass'; f.Q.value = 4;
      f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.25);
      g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.75, t + 0.06); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 0.32);
    },
    // vortex: a swirling roar whose filter circles round and round, winding down
    vortex() {
      const t = ctx.currentTime, dur = 1.4;
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = 5; f.frequency.value = 700;
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.setValueAtTime(6, t); l.frequency.linearRampToValueAtTime(2, t + dur); lg.gain.value = 450;
      l.connect(lg).connect(f.frequency);
      g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.45, t + 0.15);
      g.gain.setValueAtTime(0.45, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f).connect(g).connect(master);
      for (const n of [s, l]) { n.start(t); n.stop(t + dur + 0.05); }
      tone(90, dur, 'sine', 0.12, -30);
    },
    // drain: a quick upward "sip"
    drain() { tone(330, 0.12, 'triangle', 0.1, 400); tone(660, 0.1, 'sine', 0.06, 500, 0.05); },
    // Smugshi's Shiba Scream: a dramatic, wobbling "AAAAAH!". A buzzy voice is
    // shaped into an "ah" vowel by three formant filters, scoops up into the
    // scream, warbles, cracks upward and gives out, over a hoarse breath.
    shibaScream() {
      const t = ctx.currentTime, dur = 0.8;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(480, t);
      o.frequency.exponentialRampToValueAtTime(860, t + 0.09);      // scoop up
      o.frequency.setValueAtTime(860, t + 0.52);
      o.frequency.exponentialRampToValueAtTime(1180, t + 0.6);      // voice cracks
      o.frequency.exponentialRampToValueAtTime(560, t + dur);       // and gives out
      const vib = ctx.createOscillator(), vg = ctx.createGain();
      vib.frequency.value = 11; vg.gain.value = 48;
      vib.connect(vg).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(SCREAM_GAIN, t + 0.04);
      g.gain.setValueAtTime(SCREAM_GAIN, t + dur - 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      const flutter = ctx.createOscillator(), fg = ctx.createGain();   // the "aAaAa" warble
      flutter.frequency.value = 7; fg.gain.value = SCREAM_GAIN * 0.3;
      flutter.connect(fg).connect(g.gain);
      for (const [f, q, v] of [[850, 5, 1], [1250, 7, 0.55], [2850, 9, 0.25]]) {   // "ah" formants
        const bp = ctx.createBiquadFilter(), fv = ctx.createGain();
        bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; fv.gain.value = v;
        o.connect(bp).connect(fv).connect(g);
      }
      g.connect(master);
      for (const s of [o, vib, flutter]) { s.start(t); s.stop(t + dur + 0.05); }
      noise(dur, 0.05, 3200);                                      // hoarse breath
    },
    // Shiba Roar: the Shiba Scream, overreacting even for a Shiba. It stammers ("a-a-"),
    // scoops way up, warbles wider, cracks twice, sputters, collapses into a wheeze and
    // then squeaks one last time.
    shibaRoar() {
      const G = SCREAM_GAIN * 1.05;
      voice(
        [[0, 420], [0.05, 720], [0.09, 460], [0.14, 760], [0.2, 520], [0.32, 1120], [0.72, 1180], [0.78, 1560], [0.86, 1150], [1.0, 1200], [1.06, 1620], [1.14, 1180], [1.36, 560], [1.48, 980], [1.56, 1300]],
        [[0.02, G], [0.07, 0.05], [0.1, G], [0.16, 0.06], [0.2, G], [1.22, G], [1.38, G * 0.25], [1.47, G * 0.7], [1.6, 0.001]],
        { vib: [13, 95], flutter: 9 });
      noise(1.5, 0.06, 3200);                                    // hoarse, ragged breath under it all
      noise(0.3, 0.05, 1500, 1.22);                              // the wheeze
    },
    // a big sleepy yawn, then two soft snores
    yawn() {
      voice([[0, 170], [0.25, 270], [0.95, 140]], [[0.12, 0.22], [0.75, 0.18], [1.05, 0.001]], { vib: [5, 6], flutter: 3 });
      for (const at of [1.2, 1.85]) { noise(0.45, 0.1, 260, at); tone(70, 0.4, 'sine', 0.08, -10, at); }
    },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'square', 0.1, 0, i * 0.13)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, 'triangle', 0.14, 0, i * 0.18)); },
    // dungeon sounds
    coin() { tone(988, 0.05, 'square', 0.07); tone(1319, 0.12, 'square', 0.07, 0, 0.05); },
    doorShut() { noise(0.25, 0.4, 500); tone(80, 0.25, 'square', 0.16, -30); },
    doorOpen() { noise(0.2, 0.2, 900); tone(220, 0.15, 'triangle', 0.12, 220); },
    levelUp() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, 'square', 0.07, 0, i * 0.06)); },
    evolve() { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.14, 'triangle', 0.12, 0, i * 0.08)); },
    stairs() { [392, 330, 262, 196, 165].forEach((f, i) => tone(f, 0.12, 'square', 0.08, 0, i * 0.07)); },
  };

  // ---------- beams: a rising charge-up, then a blast and a sustained roar ----------
  const BEAM_PITCH = { normal: 55, dragon: 49, water: 65, ice: 82, psychic: 73, flying: 78, poison: 52, bug: 87, ghost: 46, steel: 61, fairy: 98 };

  function beamCharge(dur) {
    const t = ctx.currentTime, end = t + dur;
    // whine: saw sweeping up through an opening filter, chopped by a speeding tremolo
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), trem = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(900, end);
    f.type = 'lowpass'; f.Q.value = 8;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4000, end);
    g.gain.setValueAtTime(0.02, t); g.gain.exponentialRampToValueAtTime(0.16, end);
    g.gain.setValueAtTime(0.16, end); g.gain.exponentialRampToValueAtTime(0.001, end + 0.05);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(8, t); lfo.frequency.exponentialRampToValueAtTime(40, end);
    lg.gain.value = 0.5; trem.gain.value = 0.5;
    lfo.connect(lg).connect(trem.gain);
    o.connect(f).connect(trem).connect(g).connect(master);
    // rushing air gathering in
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = noiseBuf; n.loop = true;
    bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(5000, end);
    ng.gain.setValueAtTime(0.01, t); ng.gain.exponentialRampToValueAtTime(0.18, end);
    ng.gain.exponentialRampToValueAtTime(0.001, end + 0.05);
    n.connect(bp).connect(ng).connect(master);
    for (const s of [o, lfo, n]) { s.start(t); s.stop(end + 0.08); }
  }

  function beamFire(dur, type) {
    const t = ctx.currentTime, end = t + dur;
    const base = BEAM_PITCH[type] || 58;
    // impact: thump + noise blast with a closing filter
    tone(150, 0.35, 'sine', 0.5, -110);
    const n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = noiseBuf; n.loop = true;
    nf.type = 'lowpass';
    nf.frequency.setValueAtTime(6000, t); nf.frequency.exponentialRampToValueAtTime(700, t + 0.5);
    ng.gain.setValueAtTime(0.55, t); ng.gain.exponentialRampToValueAtTime(0.12, t + 0.4);
    ng.gain.setValueAtTime(0.12, end); ng.gain.exponentialRampToValueAtTime(0.001, end + 0.3);
    n.connect(nf).connect(ng).connect(master);
    n.start(t); n.stop(end + 0.35);
    // roar: detuned saws + square an octave up, filter wobbling fast
    const rf = ctx.createBiquadFilter(), rg = ctx.createGain();
    rf.type = 'lowpass'; rf.Q.value = 6; rf.frequency.value = 1400;
    const wob = ctx.createOscillator(), wg = ctx.createGain();
    wob.frequency.value = 14; wg.gain.value = 900;
    wob.connect(wg).connect(rf.frequency);
    const roar = BEAM_LAYERS[type] ? 0.22 : 0.32;   // typed beams let their flavour layer through
    rg.gain.setValueAtTime(0.001, t); rg.gain.exponentialRampToValueAtTime(roar, t + 0.03);
    rg.gain.setValueAtTime(roar * 0.94, end); rg.gain.exponentialRampToValueAtTime(0.001, end + 0.3);
    rf.connect(rg).connect(master);
    const voices = [['sawtooth', base, 0], ['sawtooth', base * 1.012, 0], ['square', base * 2, 0], ['sawtooth', base * 1.5, -0.4]];
    const oscs = voices.map(([ty, fr]) => {
      const o = ctx.createOscillator(); o.type = ty;
      o.frequency.setValueAtTime(fr * 1.6, t); o.frequency.exponentialRampToValueAtTime(fr, t + 0.12);
      o.frequency.setValueAtTime(fr, end); o.frequency.exponentialRampToValueAtTime(fr * 0.5, end + 0.3);
      o.connect(rf); return o;
    });
    for (const s of [...oscs, wob]) { s.start(t); s.stop(end + 0.35); }
    // shimmer: a fast high arpeggio riding on top
    const arp = [4, 4 * 1.26, 4 * 1.5, 8].map(m => base * m * 2);
    for (let i = 0, at = 0; at < dur; i++, at += 0.045) tone(arp[i % 4], 0.04, 'square', 0.035, 0, at);
    // type flavour layered over the base (Normal is the base sound alone)
    if (BEAM_LAYERS[type]) {
      bus = ctx.createGain(); bus.gain.value = LAYER_GAIN[type] || 1; bus.connect(master);
      BEAM_LAYERS[type](t, dur, base);
      bus = null;
    }
  }

  // ---------- per-type beam layers ----------
  // Layers play through `bus`, a gain whose level is balanced per type so each
  // flavour sits clearly under the base roar (sparse clicky layers need more gain).
  let bus = null;
  const LAYER_GAIN = { fire: 7, water: 4.5, ice: 5, electric: 2, psychic: 2, dragon: 1.4, dark: 0.9, grass: 2.6, ground: 1, rock: 7, fighting: 2.6,
    flying: 18, poison: 2.5, bug: 3.6, ghost: 2.3, steel: 3.5, fairy: 5 };
  // short filtered noise hit at absolute time t
  function hiss(t, len, vol, ftype, freq, q = 1) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = ftype; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + len + 0.02);
    return { f, g };
  }
  // pitched blip gliding f1 -> f2 at absolute time t
  function blip(t, f1, f2, len, type, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + len);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g).connect(bus); o.start(t); o.stop(t + len + 0.02);
    return o;
  }
  // a held voice from t to t+dur with a short fade-out; returns the oscillator and gain
  function drone(t, dur, type, freq, vol, filterFreq) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.setValueAtTime(vol, t + dur); g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.25);
    let node = o;
    if (filterFreq) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq; node = o.connect(f); }
    node.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.3);
    return { o, g };
  }
  function lfo(t, dur, rate, depth, target, type = 'sine') {
    const l = ctx.createOscillator(), lg = ctx.createGain();
    l.type = type; l.frequency.value = rate; lg.gain.value = depth;
    l.connect(lg).connect(target); l.start(t); l.stop(t + dur + 0.3);
  }
  const every = (dur, gap, fn) => { for (let at = 0; at < dur; at += gap * (0.6 + Math.random() * 0.8)) fn(at); };

  const BEAM_LAYERS = {
    // crackling flames over a low furnace rumble
    fire(t, dur) {
      hiss(t, dur + 0.25, 0.18, 'lowpass', 220);
      every(dur, 0.03, at => hiss(t + at, 0.02 + Math.random() * 0.02, 0.28, 'bandpass', 1800 + Math.random() * 3500, 4));
    },
    // rushing torrent + bubbles popping upward
    water(t, dur) {
      const { f } = hiss(t, dur + 0.25, 0.2, 'bandpass', 900, 2);
      f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1600, t + dur / 2); f.frequency.linearRampToValueAtTime(600, t + dur);
      every(dur, 0.04, at => { const p = 300 + Math.random() * 600; blip(t + at, p, p * 2.2, 0.05, 'sine', 0.14); });
    },
    // mains buzz chopped hard + random arcing zaps
    electric(t, dur, base) {
      const { g } = drone(t, dur, 'square', base * 4, 0.07);
      lfo(t, dur, 32, 0.07, g.gain, 'square');
      every(dur, 0.06, at => blip(t + at, 2500 + Math.random() * 2500, 150, 0.05, 'square', 0.08));
    },
    // glassy air + crystal chimes from a high pentatonic
    ice(t, dur) {
      hiss(t, dur + 0.25, 0.06, 'highpass', 7000);
      const notes = [1319, 1568, 1760, 1976, 2349, 2637];
      every(dur, 0.06, at => blip(t + at, notes[(Math.random() * notes.length) | 0], 2637 * 1.5, 0.18, 'sine', 0.07));
    },
    // eerie gliding sine + a deeply warbling overtone
    psychic(t, dur, base) {
      const a = drone(t, dur, 'sine', 600, 0.09);
      a.o.frequency.setValueAtTime(400, t); a.o.frequency.linearRampToValueAtTime(1200, t + dur * 0.6); a.o.frequency.linearRampToValueAtTime(500, t + dur);
      lfo(t, dur, 3, 80, a.o.frequency);
      const b = drone(t, dur, 'triangle', base * 3, 0.1);
      lfo(t, dur, 5, base * 3 * 0.15, b.o.frequency);
    },
    // sub-octave growl with a throaty tremolo + falling roar
    dragon(t, dur, base) {
      const g = drone(t, dur, 'sawtooth', base / 2, 0.22, 600);
      lfo(t, dur, 22, 0.15, g.g.gain);
      blip(t, 320, 120, dur + 0.2, 'sawtooth', 0.08);
    },
    // dissonant beating drone + a descending whole-tone line
    dark(t, dur, base) {
      drone(t, dur, 'sine', base / 2, 0.2);
      drone(t, dur, 'sine', base / 2 * 1.06, 0.2);
      let f = 700;
      for (let at = 0; at < dur; at += 0.1) { blip(t + at, f, f * 0.97, 0.09, 'square', 0.05); f *= 0.89; }
    },
    // fluttering leaves rustle + soft wooden chimes
    grass(t, dur) {
      const { g } = hiss(t, dur + 0.25, 0.15, 'highpass', 3000);
      lfo(t, dur, 18, 0.12, g.gain);
      every(dur, 0.08, at => blip(t + at, 1000 + Math.random() * 1000, 900, 0.08, 'triangle', 0.06));
    },
    // deep earth rumble
    ground(t, dur) {
      hiss(t, dur + 0.3, 0.35, 'lowpass', 120);
      drone(t, dur, 'sine', 40, 0.25);
    },
    // grinding crunches
    rock(t, dur) {
      every(dur, 0.05, at => hiss(t + at, 0.04, 0.28, 'lowpass', 600 + Math.random() * 600));
    },
    // rhythmic body blows
    fighting(t, dur) {
      for (let at = 0; at < dur; at += 0.12) blip(t + at, 180, 55, 0.1, 'sine', 0.3);
    },
    // howling wind: a resonant noise band sweeping up and down + whooshing gusts
    flying(t, dur) {
      const { f } = hiss(t, dur + 0.25, 0.2, 'bandpass', 1200, 6);
      lfo(t, dur, 2.5, 700, f.frequency);
      every(dur, 0.15, at => { const w = hiss(t + at, 0.14, 0.18, 'bandpass', 600, 3); w.f.frequency.exponentialRampToValueAtTime(3500, t + at + 0.14); });
    },
    // bubbling sludge: low gurgling blips over a sickly detuned drone
    poison(t, dur, base) {
      drone(t, dur, 'sawtooth', base * 3, 0.06, 900);
      drone(t, dur, 'sawtooth', base * 3 * 1.09, 0.06, 900);
      every(dur, 0.05, at => { const p = 120 + Math.random() * 180; blip(t + at, p, p * 0.6, 0.07, 'sine', 0.2); });
    },
    // buzzing wings: a fast-trilling nasal saw
    bug(t, dur, base) {
      const a = drone(t, dur, 'sawtooth', base * 6, 0.08, 2500);
      lfo(t, dur, 28, base * 6 * 0.05, a.o.frequency);
      lfo(t, dur, 45, 0.05, a.g.gain, 'square');
    },
    // ghostly moan: theremin-like sine with wide slow vibrato + distant whispers
    ghost(t, dur, base) {
      const a = drone(t, dur, 'sine', base * 8, 0.1);
      a.o.frequency.setValueAtTime(base * 10, t); a.o.frequency.exponentialRampToValueAtTime(base * 6, t + dur);
      lfo(t, dur, 5, base * 0.6, a.o.frequency);
      hiss(t, dur + 0.25, 0.05, 'bandpass', 2400, 8);
    },
    // metallic clang + ringing inharmonic partials
    steel(t, dur) {
      for (let at = 0; at < dur; at += 0.18) for (const p of [880, 1253, 1717]) blip(t + at, p, p * 0.98, 0.16, 'square', 0.025);
      drone(t, dur, 'triangle', 1500, 0.04);
    },
    // sparkling twinkles from a major arpeggio + a soft shimmer
    fairy(t, dur) {
      const notes = [1047, 1319, 1568, 2093, 2637];
      let i = 0;
      for (let at = 0; at < dur; at += 0.05) blip(t + at, notes[i++ % notes.length], notes[i % notes.length] * 1.01, 0.12, 'triangle', 0.08);
      hiss(t, dur + 0.25, 0.04, 'highpass', 9000);
    },
  };

  // ---------- attack sounds: every move that isn't a beam has a voice of its own ----------
  // A move sounds like its kind (a launch, a rush, a wind-up and blast, a landing, a gust...)
  // plus a short burst of its type's beam layer (above), so moves of one type share a
  // family sound and different kinds of move sound different. MOVE_SFX gives signature
  // moves their own sounds. Played through Sfx.move(mv, phase): 'cast' when it's used,
  // 'release' when a blast goes off, 'land' when a zone lands, 'hit' on each direct hit.
  // (the beam gains suit long layers; a few types come out too strong in short bursts)
  const SHORT_TRIM = { flying: 0.45, fire: 0.6 };
  function typeLayer(type, dur, vol = 1, delay = 0) {
    // fire and dark have short-burst voices of their own (the beam layers don't carry: see above)
    if (type === 'fire') return flame(dur, vol, delay);
    if (type === 'dark') return shadow(dur, vol * 2.2, delay);
    const L = BEAM_LAYERS[type];
    if (!L) return;
    bus = ctx.createGain(); bus.gain.value = (LAYER_GAIN[type] || 1) * vol * (SHORT_TRIM[type] || 1); bus.connect(master);
    L(ctx.currentTime + delay, dur, BEAM_PITCH[type] || 58);
    bus = null;
  }
  // a band of noise sweeping f1 -> f2 (whooshes, rushes, swishes), straight to the effects bus
  function sweep(dur, f1, f2, vol, q = 3, delay = 0) {
    const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    return f;
  }
  // a tiny sharp pop of high noise at absolute time t (fire crackles, thunder's snap)
  function pop(t, len, vol, freq) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 0.5); s.stop(t + len + 0.02);
  }
  // noise through a filter with a shaped level: [[time, level], ...] (relative to now + delay)
  function shaped(type, freq, q, levels, delay = 0) {
    const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.001, t);
    for (const [at, l] of levels) g.gain.exponentialRampToValueAtTime(Math.max(0.001, l), t + at);
    s.connect(f).connect(g).connect(master);
    const end = levels[levels.length - 1][0];
    s.start(t, Math.random() * 0.5); s.stop(t + end + 0.05);
    return { f, g, t, end };
  }
  // a gain that wobbles irregularly (two LFOs at odd rates) for flicker and rolling
  function flutterGain(t, end, rates, depth) {
    const fl = ctx.createGain(); fl.gain.value = 1 - depth;
    for (const r of rates) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = r * (0.85 + Math.random() * 0.3); lg.gain.value = depth / rates.length;
      l.connect(lg).connect(fl.gain); l.start(t); l.stop(end + 0.1);
    }
    return fl;
  }

  // FIRE: a roaring flame that flares open and flickers, a breathy "fwoosh", and crackles
  function flame(dur, vol = 1, delay = 0) {
    const t = ctx.currentTime + delay, end = t + dur;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(2800, t + Math.min(0.12, dur * 0.3)); f.frequency.exponentialRampToValueAtTime(800, end);
    g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.55 * vol, t + 0.04);
    g.gain.setValueAtTime(0.45 * vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.001, end + 0.15);
    const fl = flutterGain(t, end, [13, 21], 0.55);
    s.connect(f).connect(fl).connect(g).connect(master); s.start(t, Math.random() * 0.5); s.stop(end + 0.2);
    sweep(Math.min(0.35, dur + 0.05), 450, 2200, 0.3 * vol, 1.4, delay);
    for (let at = 0.02; at < dur + 0.1; at += 0.018 + Math.random() * 0.045) pop(t + at, 0.006 + Math.random() * 0.012, (0.12 + Math.random() * 0.22) * vol, 2500 + Math.random() * 4500);
  }

  // THUNDER: a far-off grumble building (cast), then the crack and a long rolling rumble
  function thunderNear(dur) {
    shaped('lowpass', 260, 0.8, [[dur * 0.8, 0.22], [dur, 0.12]]);
    shaped('bandpass', 320, 1.2, [[dur * 0.8, 0.12], [dur, 0.05]]);
  }
  function thunderClap(big = 0.8) {
    const t = ctx.currentTime;
    pop(t, 0.09, 0.75 * big, 2200); pop(t + 0.03, 0.12, 0.5 * big, 900);              // the crack
    tone(65, 0.45, 'sine', 0.35 * big, -20);                                            // the hit
    // the roll: low noise swelling and sinking a few times, the rumble darkening as it fades
    const r = shaped('lowpass', 1400, 0.7, [[0.04, 0.6 * big], [0.5, 0.4 * big], [1.2, 0.18 * big], [1.9, 0.001]]);
    r.f.frequency.exponentialRampToValueAtTime(260, r.t + 1.6);
    const fl = flutterGain(r.t, r.t + r.end, [3.1, 5.3, 8.2], 0.6);
    r.g.disconnect(); r.g.connect(fl).connect(master);
    shaped('bandpass', 380, 1, [[0.05, 0.25 * big], [0.9, 0.1 * big], [1.7, 0.001]]);   // so phone speakers hear the roll too
  }

  // DARK: a shadowy swell that rushes in and cuts off, a sour pair of notes, and a sinking moan
  // (kept in the middle range: phone speakers can't play the beam's deep drones)
  function shadow(dur, vol = 1, delay = 0) {
    const d = Math.max(0.15, dur);
    const sw = shaped('bandpass', 700, 2.2, [[d * 0.75, 0.42 * vol], [d * 0.85, 0.3 * vol], [d + 0.05, 0.001]], delay);
    sw.f.frequency.setValueAtTime(900, sw.t); sw.f.frequency.exponentialRampToValueAtTime(280, sw.t + d);
    const t = ctx.currentTime + delay;
    for (const fr of [233, 247]) {   // a minor second, rubbing
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(fr, t); o.frequency.exponentialRampToValueAtTime(fr * 0.8, t + d);
      f.type = 'lowpass'; f.frequency.value = 1400;
      g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.07 * vol, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.1);
      o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + d + 0.15);
    }
    tone(680, d + 0.1, 'triangle', 0.06 * vol, -380, delay);   // the moan, sinking
  }

  // how high a type's "pew" sits
  const TYPE_PITCH = { normal: 700, fire: 520, water: 480, grass: 880, electric: 1400, ice: 1700, ground: 200, rock: 260, poison: 300,
    psychic: 820, dark: 340, fairy: 1500, fighting: 240, flying: 1000, bug: 1250, ghost: 650, dragon: 300, steel: 1100 };

  // A breathy "ah" voice: a buzzy saw shaped by three formant filters. pitch: [[time, Hz], ...],
  // gain: [[time, level], ...]; wobble: vibrato Hz and depth; chop: a stutter rate (0 = none).
  function voice(pitch, gain, { vib = [11, 48], flutter = 7, chop = 0 } = {}) {
    const t = ctx.currentTime, end = gain[gain.length - 1][0];
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(pitch[0][1], t);
    for (const [at, f] of pitch.slice(1)) o.frequency.exponentialRampToValueAtTime(f, t + at);
    const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = vib[0]; vg.gain.value = vib[1]; v.connect(vg).connect(o.frequency);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.001, t);
    for (const [at, l] of gain) g.gain.exponentialRampToValueAtTime(Math.max(0.001, l), t + at);
    const peak = Math.max(...gain.map(x => x[1]));
    const fl = ctx.createOscillator(), fg = ctx.createGain(); fl.frequency.value = flutter; fg.gain.value = peak * 0.3; fl.connect(fg).connect(g.gain);
    const nodes = [o, v, fl];
    if (chop) { const ch = ctx.createOscillator(), cg = ctx.createGain(); ch.type = 'square'; ch.frequency.value = chop; cg.gain.value = peak * 0.45; ch.connect(cg).connect(g.gain); nodes.push(ch); }
    for (const [f, q, lv] of [[850, 5, 1], [1250, 7, 0.55], [2850, 9, 0.25]]) {
      const bp = ctx.createBiquadFilter(), fv = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; fv.gain.value = lv;
      o.connect(bp).connect(fv).connect(g);
    }
    g.connect(master);
    for (const n of nodes) { n.start(t); n.stop(t + end + 0.05); }
    return end;
  }

  // the sound of each kind of move, at each phase
  const KIND_SFX = {
    projectile: {
      cast(mv) { const p = TYPE_PITCH[mv.type] || 700; tone(p, 0.09, 'square', 0.06, -p * 0.5); typeLayer(mv.type, 0.16, 0.55); },
      land(mv) { noise(0.35, 0.4, 700); tone(80, 0.3, 'triangle', 0.2, -30); typeLayer(mv.type, 0.4, 0.8); },   // a shot that explodes
    },
    dash: {
      cast(mv) { sweep(0.22, 400, 2600, 0.6); tone((TYPE_PITCH[mv.type] || 700) * 0.4, 0.16, 'sawtooth', 0.07, 250); typeLayer(mv.type, 0.28, 0.5); },
    },
    burst: {
      cast(mv) { tone(160, mv.delay || 0.4, 'sawtooth', 0.06, 500); typeLayer(mv.type, mv.delay || 0.4, 0.3); },
      release(mv) {
        if (mv.cone) { sweep(mv.blow + 0.1, 300, 2400, 0.45, 2); typeLayer(mv.type, mv.blow, 0.8); return; }
        if (mv.ripple) { for (let i = 0; i < 3; i++) { tone(170, 0.2, 'sawtooth', 0.09, -80, i * 0.14); tone(85, 0.2, 'sine', 0.25, -30, i * 0.14); } typeLayer(mv.type, mv.ripple, 1); return; }
        noise(0.4, 0.42, 650); tone(75, 0.36, 'triangle', 0.22, -30); typeLayer(mv.type, 0.38, 0.75);
      },
    },
    zone: {
      cast(mv) { if (mv.fx === 'bolt') return thunderNear(mv.delay); tone((TYPE_PITCH[mv.type] || 700) * 0.6, 0.18, 'triangle', 0.08, 500); typeLayer(mv.type, 0.12, 0.4); },
      land(mv) { if (mv.fx === 'bolt') return thunderClap(); noise(0.3, 0.35, 800); tone(90, 0.25, 'triangle', 0.18, -30); typeLayer(mv.type, 0.28, 0.6); },
    },
    vortex: { cast(mv) { lib.vortex(); typeLayer(mv.type, mv.dur || 1.2, 0.55); } },
    buff: { cast(mv) { tone(400, 0.25, 'triangle', 0.13, 500); typeLayer(mv.type, 0.3, 0.45); } },
    heal: { cast() { lib.heal(); } },
    // a direct hit: a thud with a dash of the type on top
    hit: { hit(mv) { typeLayer(mv.type, 0.08, 0.4); } },
  };

  // signature moves
  const MOVE_SFX = {
    // a volley: five quick little launches, buzzing
    pinMissile: { cast(mv) { for (let i = 0; i < 5; i++) tone(1900 - i * 90, 0.05, 'square', 0.05, -900, i * 0.035); typeLayer('bug', 0.2, 0.5); } },
    // a heavy orb of gloom: a low swelling 'wom' as it leaves
    gloomOrb: { cast() { shadow(0.4, 2.4); tone(300, 0.3, 'sawtooth', 0.07, -150); } },
    // the boomerang blade keeps its rising swoosh
    razorGale: { cast() { lib.whoosh(); typeLayer('flying', 0.2, 0.4); } },
    // a sparkling breeze
    fairyWind: { cast() { sweep(0.4, 1200, 5000, 0.3, 5); typeLayer('fairy', 0.3, 0.6); } },
    // bubbles popping off one after another
    bubbleBeam: { cast() { for (let i = 0; i < 5; i++) { const p = 500 + Math.random() * 400; tone(p, 0.07, 'sine', 0.14, p * 1.3, i * 0.05); } } },
    // a wet splat
    mudShot: { cast() { noise(0.12, 0.35, 500); tone(110, 0.14, 'sine', 0.25, -50); tone(220, 0.08, 'sine', 0.12, -120, 0.06); } },
    thunderbolt: { cast() { lib.zap(); typeLayer('electric', 0.18, 0.6); } },
    // a rumbling roll
    rollout: { cast(mv) { const f = sweep(mv.dur + 0.15, 180, 120, 0.5, 1.2); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 16; lg.gain.value = 60; l.connect(lg).connect(f.frequency); l.start(); l.stop(ctx.currentTime + mv.dur + 0.2); typeLayer('rock', mv.dur, 0.6); } },
    // a roaring ring of fire
    flameWheel: { cast(mv) { flame(mv.dur + 0.2, 1.1); sweep(mv.dur + 0.15, 250, 1400, 0.3, 1.5); } },
    blazeRush: { cast(mv) { flame(mv.dur + 0.3, 1.25); tone(110, mv.dur, 'sawtooth', 0.06, 60); sweep(mv.dur + 0.15, 300, 1800, 0.3, 1.5); } },
    // Eruption: a deep blast, then fire roaring up
    eruption: { release() { noise(0.45, 0.42, 600); tone(70, 0.4, 'triangle', 0.22, -30); flame(0.8, 1.2, 0.05); } },
    fireBlast: { cast() { flame(0.45, 0.9); tone(260, 0.2, 'sawtooth', 0.05, -120); } },
    // blade swishes
    nightSlash: { cast() { sweep(0.16, 1800, 7000, 0.45, 6); typeLayer('dark', 0.15, 0.4); }, hit() { sweep(0.1, 5000, 1500, 0.4, 8); } },
    dragonClaw: { cast() { sweep(0.18, 900, 4000, 0.4, 4); typeLayer('dragon', 0.2, 0.5); }, hit() { for (let i = 0; i < 3; i++) sweep(0.07, 4500, 1600, 0.3, 8, i * 0.04); } },
    // a flurry: a sharp shout of air, then every punch thumps (each hit)
    closeCombat: { cast() { sweep(0.14, 600, 3000, 0.4); }, hit() { tone(170, 0.06, 'square', 0.12, -90); noise(0.05, 0.25, 1400); } },
    // a soft fluffy whump with static crackling
    woolTackle: { cast() { noise(0.2, 0.3, 450); typeLayer('electric', 0.25, 0.35); }, hit() { noise(0.15, 0.4, 350); } },
    gust: { release(mv) { lib.whoosh(); sweep(mv.blow + 0.15, 400, 2600, 0.45, 2); typeLayer('flying', mv.blow, 0.6); } },
    // a howling storm for as long as it lasts
    tornado: { land(mv) { typeLayer('flying', mv.linger * 0.85, 0.55); sweep(mv.linger, 300, 900, 0.18, 4); } },
    // Smugshi's zoomies: scampering paws and a whoosh
    zoomies: { cast() { for (let i = 0; i < 6; i++) tone(520 + (i % 2) * 140, 0.035, 'square', 0.07, -200, i * 0.045); sweep(0.25, 600, 3000, 0.5); } },
    zoomiesMax: { cast() { for (let i = 0; i < 8; i++) tone(560 + (i % 2) * 160, 0.035, 'square', 0.08, -220, i * 0.035); sweep(0.3, 600, 3600, 0.55); }, hit() { tone(420, 0.05, 'square', 0.08, -200); } },
    // a big heavy body flop
    bodySlam: { cast() { sweep(0.3, 200, 900, 0.6, 1.5); }, hit() { tone(60, 0.3, 'sine', 0.4, -20); noise(0.25, 0.4, 400); } },
    // Mondaze heaves a long, tired sigh
    heavySigh: { cast() { voice([[0, 210], [0.6, 120]], [[0.15, 0.2], [0.55, 0.14], [0.75, 0.001]], { vib: [4, 4], flutter: 2 }); noise(0.75, 0.08, 1400); }, release() { noise(0.4, 0.35, 500); tone(80, 0.35, 'triangle', 0.18, -30); } },
    // Shiba Scream (as before) and Shiba Roar, which is the same scream, overreacting
    shibaScream: { cast() { lib.shibaScream(); }, release() { noise(0.3, 0.3, 700); } },
    shibaRoar: { cast() { lib.shibaRoar(); }, release() { noise(0.35, 0.35, 650); } },
    // heals that sound like their names
    snack: { cast() { for (let i = 0; i < 3; i++) noise(0.06, 0.4, 2600, 0.25 + i * 0.2); tone(300, 0.12, 'sine', 0.2, -150, 0.85); } },   // crunch, crunch, crunch, gulp
    photosynth: { cast() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.7 - i * 0.1, 'sine', 0.09, 0, i * 0.09)); typeLayer('grass', 0.5, 0.4, 0.2); } },   // warm light swelling
    blanketNap: { cast() { lib.yawn(); } },
    wish: { cast() { [1568, 1760, 2093, 2349, 2637].forEach((f, i) => tone(f, 0.25, 'triangle', 0.07, 0, i * 0.08)); tone(3136, 0.5, 'sine', 0.08, 0, 0.5); [2637, 2093, 1568, 1319].forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, 0, 0.72 + i * 0.06)); lib.heal(); } },   // twinkle, the star chimes, then sparkles down
  };

  function moveSound(mv, phase) {
    const sig = MOVE_SFX[mv.id];
    if (sig && sig[phase]) return sig[phase](mv);
    if (phase === 'hit') return KIND_SFX.hit.hit(mv);
    const k = KIND_SFX[mv.kind];
    if (k && k[phase]) k[phase](mv);
  }

  // ---------- music: original Game Boy-style chiptunes ----------
  // Pulse lead, 12.5% pulse arpeggios, triangle bass, noise drums. Every song is
  // original; never transcribe real game melodies. Sfx.music.play(name) switches songs
  // with a short crossfade (and does nothing if that song is already playing).
  const Music = (() => {
    const mid = n => 440 * Math.pow(2, (n - 69) / 12);
    const CH = { // arpeggio chord tones and bass root (MIDI)
      Em: [[64, 67, 71, 76], 40], C: [[60, 64, 67, 72], 36], D: [[62, 66, 69, 74], 38],
      B: [[59, 63, 66, 71], 35], Am: [[57, 60, 64, 69], 33], G: [[55, 59, 62, 67], 43],
      Dm: [[62, 65, 69, 74], 38], Bb: [[58, 62, 65, 70], 34], A: [[57, 61, 64, 69], 33],
      Gm: [[55, 58, 62, 67], 43], F: [[53, 57, 60, 65], 41], E: [[59, 64, 68, 71], 40],
      Bm: [[59, 62, 66, 71], 35], Fs: [[61, 66, 70, 73], 42], Cm: [[60, 63, 67, 72], 36],
      Ab: [[56, 60, 63, 68], 44], Fm: [[53, 56, 60, 65], 41],
    };
    // A melody as note names with lengths in 16th steps, e.g. 'E5.2 G5.4 r.2'
    // ('r' is a rest; 's' = sharp, 'b' = flat). Each bar adds up to 16.
    const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    function mel(str) {
      const out = []; let at = 0;
      for (const tok of str.trim().split(/\s+/).filter(Boolean)) {
        const [name, len] = tok.split('.');
        if (name !== 'r') {
          const m = name.match(/^([A-G])(s|b)?(\d)$/);
          out.push([at, 12 * (+m[3] + 1) + SEMI[m[1]] + (m[2] === 's' ? 1 : m[2] === 'b' ? -1 : 0), +len]);
        }
        at += +len;
      }
      return out;
    }
    const bar = (ch, lead = '', fill = false) => ({ ch, lead: mel(lead), fill });

    // bass: 'octave' = pumping octaves on 8ths, 'walk' = root, fifth, octave, fifth on quarters
    // drums: steps (of 16) for kick and snare; hat on 'odd' 16ths, 'even' 16ths or 'all'
    const SONGS = {
      // Rush: the original battle song. 172 BPM, E minor. Floor 1 (meadow).
      rush: {
        bpm: 172, arp: [0, 1, 2, 3, 2, 1], bass: 'octave', duty: 0.25,
        drums: { kick: [0, 6, 8, 10], snare: [4, 12], hat: 'odd' },
        bars: {
          intro1: bar('Em'),
          intro2: bar('B', 'r.8 B4.2 Ds5.2 Fs5.2 B5.2', true),
          a1: bar('Em', 'B4.3 E5.3 G5.2 Fs5.2 E5.2 D5.2 E5.2'),
          a2: bar('C', 'C5.3 E5.3 G5.4 A5.2 G5.2 E5.2'),
          a3: bar('D', 'D5.3 Fs5.3 A5.2 B5.4 A5.2 Fs5.2'),
          a4: bar('B', 'Ds5.4 Fs5.4 B5.6 r.2', true),
          b1: bar('Em', 'E5.2 G5.2 B5.4 A5.2 G5.2 Fs5.4'),
          b2: bar('C', 'G5.2 E5.2 C5.4 D5.2 E5.2 G5.4'),
          b3: bar('Am', 'A5.4 C6.4 B5.2 A5.2 E5.4'),
          b4: bar('B', 'Fs5.2 Ds5.2 B4.4 Ds5.2 Fs5.2 A5.2 B5.2', true),
          c1: bar('C', 'E6.6 D6.2 C6.4 B5.4'),
          c2: bar('D', 'D6.6 C6.2 B5.4 A5.4'),
          c3: bar('G', 'B5.3 D6.3 G5.2 A5.2 B5.2 D6.4'),
          c4: bar('B', 'Ds5.2 Fs5.2 B5.2 Ds5.2 Fs5.2 B5.2 Ds5.2 Fs5.2', true),
        },
        intro: ['intro1', 'intro2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4', 'a1', 'a2', 'a3', 'a4', 'c1', 'c2', 'c3', 'c4'],
      },
      // Magma March: floor 2 (crater). 160 BPM, D minor, heavy and stomping.
      magma: {
        bpm: 160, arp: [0, 2, 1, 3], bass: 'octave', duty: 0.25,
        drums: { kick: [0, 3, 8, 11], snare: [4, 12], hat: 'odd' },
        bars: {
          i1: bar('Dm'),
          i2: bar('A', 'r.8 A4.2 Cs5.2 E5.2 A5.2', true),
          a1: bar('Dm', 'D5.2 F5.2 A5.4 G5.2 F5.2 E5.2 F5.2'),
          a2: bar('Bb', 'D5.2 F5.2 Bb5.4 A5.2 G5.2 F5.4'),
          a3: bar('C', 'E5.2 G5.2 C6.4 Bb5.2 A5.2 G5.2 E5.2'),
          a4: bar('A', 'Cs5.4 E5.4 A5.6 r.2', true),
          b1: bar('Gm', 'G5.3 Bb5.3 D6.2 C6.2 Bb5.2 A5.4'),
          b2: bar('Dm', 'F5.3 A5.3 D6.4 C6.2 A5.4'),
          b3: bar('Bb', 'Bb5.2 A5.2 G5.2 F5.2 G5.4 D5.4'),
          b4: bar('A', 'E5.2 Cs5.2 E5.2 A5.2 G5.2 F5.2 E5.2 Cs5.2', true),
        },
        intro: ['i1', 'i2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'],
      },
      // Summit Wind: floor 3 (summit). 150 BPM, A minor lifting to C major, a brighter
      // square-wave lead.
      summit: {
        bpm: 150, arp: [0, 1, 2, 3, 2, 1], bass: 'octave', duty: 0.5,
        drums: { kick: [0, 8, 10], snare: [4, 12], hat: 'even' },
        bars: {
          i1: bar('Am'),
          i2: bar('E', 'r.8 E5.2 Gs5.2 B5.2 E6.2', true),
          a1: bar('Am', 'A4.4 C5.2 E5.2 A5.6 G5.2'),
          a2: bar('F', 'F5.4 E5.2 D5.2 C5.4 D5.4'),
          a3: bar('C', 'E5.4 G5.2 C6.2 B5.4 G5.4'),
          a4: bar('G', 'D5.6 B4.2 D5.2 G5.6'),
          a6: bar('F', 'A5.4 G5.2 F5.2 E5.4 F5.4'),
          a7: bar('Dm', 'D5.2 E5.2 F5.2 A5.2 D6.6 C6.2'),
          a8: bar('E', 'B5.4 Gs5.4 E5.4 Gs5.4', true),
          b1: bar('F', 'C6.6 A5.2 F5.4 A5.4'),
          b2: bar('G', 'B5.6 G5.2 D5.4 G5.4'),
          b3: bar('C', 'C6.4 E6.4 D6.4 C6.4'),
          b4: bar('E', 'B5.8 Gs5.4 B5.4', true),
        },
        intro: ['i1', 'i2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'a1', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4'],
      },
      // Deep Echoes: endless floors 4-5 (grotto, ruins). 138 BPM, B minor, half-time
      // drums and a walking bass, more mysterious.
      deep: {
        bpm: 138, arp: [0, 1, 2, 3, 3, 2, 1, 0], bass: 'walk', duty: 0.25,
        drums: { kick: [0, 10], snare: [8], hat: 'odd' },
        bars: {
          i1: bar('Bm'),
          i2: bar('Fs', 'r.8 Cs5.4 Fs5.4', true),
          a1: bar('Bm', 'Fs5.6 E5.2 D5.4 Cs5.4'),
          a2: bar('G', 'D5.6 E5.2 B4.8'),
          a3: bar('D', 'A5.6 G5.2 Fs5.4 E5.4'),
          a4: bar('Fs', 'Fs5.6 As5.2 Cs6.8', true),
          b1: bar('Em', 'G5.4 B5.4 E6.6 D6.2'),
          b2: bar('Bm', 'D6.4 B5.4 Fs5.8'),
          b3: bar('G', 'G5.2 A5.2 B5.2 D6.2 Cs6.4 B5.4'),
          b4: bar('Fs', 'As5.4 Cs6.4 Fs6.8', true),
        },
        intro: ['i1', 'i2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'],
      },
      // Last Ascent: the final floor (spire). 168 BPM, E minor, driving 16th hats and a
      // high, heroic square lead that keeps climbing.
      spire: {
        bpm: 168, arp: [0, 2, 1, 3, 2, 1], bass: 'octave', duty: 0.5,
        drums: { kick: [0, 6, 8, 14], snare: [4, 12], hat: 'all' },
        bars: {
          i1: bar('Em'),
          i2: bar('B', 'r.4 E5.2 Fs5.2 G5.2 A5.2 B5.4', true),
          a1: bar('Em', 'E5.4 B5.4 A5.2 G5.2 Fs5.2 G5.2'),
          a2: bar('C', 'E5.4 C6.4 B5.2 A5.2 G5.4'),
          a3: bar('D', 'Fs5.4 D6.4 C6.2 B5.2 A5.4'),
          a4: bar('B', 'B5.6 A5.2 Fs5.2 Ds5.2 B4.4', true),
          b1: bar('Am', 'C6.4 B5.2 A5.2 E6.6 D6.2'),
          b2: bar('G', 'B5.4 D6.2 B5.2 G5.8'),
          b3: bar('C', 'G5.2 A5.2 B5.2 C6.2 E6.4 D6.4'),
          b4: bar('B', 'Ds6.4 B5.4 Fs5.8', true),
          c1: bar('Em', 'G5.6 Fs5.2 E5.4 B5.4'),
          c2: bar('C', 'E6.6 D6.2 C6.4 G5.4'),
          c3: bar('D', 'D6.4 Fs6.4 E6.2 D6.2 A5.4'),
          c4: bar('B', 'B4.2 Ds5.2 Fs5.2 A5.2 B5.4 Ds6.4', true),
        },
        intro: ['i1', 'i2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4', 'a1', 'a2', 'a3', 'a4', 'c1', 'c2', 'c3', 'c4'],
      },
      // Boss Rush: boss rooms until the boss falls. 184 BPM, C minor, four on the floor.
      boss: {
        bpm: 184, arp: [0, 1, 2, 3], bass: 'octave', duty: 0.25,
        drums: { kick: [0, 4, 8, 12], snare: [4, 12], hat: 'odd' },
        bars: {
          i1: bar('Cm'),
          i2: bar('G', 'r.8 G4.2 B4.2 D5.2 G5.2', true),
          a1: bar('Cm', 'C5.2 C5.2 Eb5.2 G5.2 C6.4 Bb5.2 G5.2'),
          a2: bar('Ab', 'Ab5.4 G5.2 F5.2 Eb5.4 F5.4'),
          a3: bar('Bb', 'D5.2 F5.2 Bb5.4 Ab5.2 G5.2 F5.4'),
          a4: bar('G', 'G5.2 B5.2 D6.2 B5.2 G5.2 F5.2 D5.2 B4.2', true),
          b1: bar('Fm', 'F5.4 Ab5.4 C6.6 Bb5.2'),
          b2: bar('Cm', 'G5.4 Eb5.4 C5.8'),
          b3: bar('Ab', 'Eb6.4 D6.2 C6.2 Bb5.4 Ab5.4'),
          b4: bar('G', 'B5.4 D6.4 G6.4 F6.2 D6.2', true),
        },
        intro: ['i1', 'i2'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'],
      },
      // Coin Corner: the shop. 112 BPM, F major, relaxed: soft square lead, walking bass.
      shop: {
        bpm: 112, arp: [0, 1, 2, 1], bass: 'walk', duty: 0.5, leadVol: 0.1,
        drums: { kick: [0], snare: [8], hat: 'even' },
        bars: {
          i1: bar('F'),
          a1: bar('F', 'A5.4 C6.4 A5.2 G5.2 F5.4'),
          a2: bar('Dm', 'F5.4 A5.4 D6.8'),
          a3: bar('Gm', 'Bb5.4 A5.2 G5.2 D5.8'),
          a4: bar('C', 'E5.4 G5.4 C6.4 Bb5.4'),
          b1: bar('Bb', 'D6.6 C6.2 Bb5.4 A5.4'),
          b2: bar('Am', 'C6.6 A5.2 E5.8'),
          b3: bar('Gm', 'G5.4 Bb5.4 D6.4 C6.4'),
          b4: bar('C', 'E5.4 G5.4 Bb5.4 C6.4'),
        },
        intro: ['i1'],
        loop: ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'],
      },
    };

    let out = null, waves = {}, timer = null, nextT = 0, barN = 0, step = 0, playing = false, song = null, songName = null;

    function pulse(duty) {
      const n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      return ctx.createPeriodicWave(re, im);
    }
    const wave = duty => waves[duty] || (waves[duty] = pulse(duty));

    function note(t, freq, len, wave, vol, vib) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      if (typeof wave === 'string') o.type = wave; else o.setPeriodicWave(wave);
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.006);
      g.gain.setValueAtTime(vol * 0.8, t + Math.min(len * 0.5, 0.08));
      g.gain.linearRampToValueAtTime(0.0001, t + len * 0.95);
      if (vib && len > 0.3) { // delayed vibrato on held notes
        const l = ctx.createOscillator(), lg = ctx.createGain();
        l.frequency.value = 6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.012, t + len);
        l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + len);
      }
      o.connect(g).connect(out);
      o.start(t); o.stop(t + len);
    }

    function drum(t, kind) {
      if (kind === 'kick') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.1);
        g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.13);
        return;
      }
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf;
      s.playbackRate.value = kind === 'hat' ? 1 : 0.6;
      f.type = kind === 'hat' ? 'highpass' : 'bandpass';
      f.frequency.value = kind === 'hat' ? 7000 : 1800;
      const len = kind === 'hat' ? 0.03 : 0.12, vol = kind === 'hat' ? 0.06 : 0.28;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      s.connect(f).connect(g).connect(out);
      s.start(t, Math.random() * 0.5); s.stop(t + len + 0.01);
    }

    function scheduleStep(t) {
      const S = song, STEP = 60 / S.bpm / 4;
      const name = barN < S.intro.length ? S.intro[barN] : S.loop[(barN - S.intro.length) % S.loop.length];
      const b = S.bars[name];
      const [arp, root] = CH[b.ch];
      note(t, mid(arp[S.arp[step % S.arp.length]]), STEP, wave(0.125), 0.045);
      if (S.bass === 'walk') {
        if (step % 4 === 0) note(t, mid(root + [0, 7, 12, 7][step / 4]), STEP * 3.5, 'triangle', 0.32);
      } else if (step % 2 === 0) note(t, mid(step % 4 === 0 ? root : root + 12), STEP * 1.8, 'triangle', 0.32);
      for (const [s, n, l] of b.lead) if (s === step) note(t, mid(n), l * STEP, wave(S.duty), S.leadVol || 0.13, true);
      // drums (only hats in the very first bar)
      const first = barN === 0, D = S.drums;
      if (b.fill && step >= 12) drum(t, 'snare');
      else {
        if (!first && D.kick.includes(step)) drum(t, 'kick');
        if (!first && D.snare.includes(step)) drum(t, 'snare');
        if (first || D.hat === 'all' || (D.hat === 'odd') === (step % 2 === 1)) drum(t, 'hat');
      }
    }
    function advance() {
      nextT += 60 / song.bpm / 4;
      if (++step === 16) { step = 0; barN++; }
    }

    function tick() {
      while (nextT < ctx.currentTime + 0.15) { scheduleStep(nextT); advance(); }
    }

    return {
      SONGS,
      start(name = 'rush') {
        if (!ctx) return;
        this.stop();
        song = SONGS[name] || SONGS.rush; songName = name;
        out = ctx.createGain(); out.gain.value = 0.8; out.connect(musicBus);
        barN = 0; step = 0; nextT = ctx.currentTime + 0.1; playing = true;
        tick();
        timer = setInterval(tick, 25);
      },
      // switch to a song unless it's already the one playing
      play(name) { if (!(playing && songName === name)) this.start(name); },
      stop(fade = 0.3) {
        if (timer) clearInterval(timer);
        timer = null; playing = false; songName = null;
        if (out) {
          const o = out;
          o.gain.setValueAtTime(o.gain.value, ctx.currentTime);
          o.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fade);
          setTimeout(() => o.disconnect(), fade * 1000 + 300);
          out = null;
        }
      },
      get playing() { return playing; },
      get song() { return songName; },
      _scheduleAll(seconds, name = 'rush') {
        waves = {}; song = SONGS[name];
        out = ctx.createGain(); out.gain.value = 0.8; out.connect(musicBus);
        barN = 0; step = 0; nextT = 0.05;
        while (nextT < seconds) { scheduleStep(nextT); advance(); }
        out = null; waves = {};
      },
    };
  })();

  return {
    init,
    play(name) {
      if (!ctx || muted || !lib[name]) return;
      const now = performance.now();
      if (last[name] && now - last[name] < 45) return; // throttle spam
      last[name] = now;
      lib[name]();
    },
    // an attack's sound (see KIND_SFX / MOVE_SFX); phase: 'cast' | 'release' | 'land' | 'hit'
    move(mv, phase) {
      if (!ctx || muted || !mv) return;
      const key = mv.id + ':' + phase, now = performance.now();
      if (last[key] && now - last[key] < (phase === 'hit' ? 70 : 45)) return;   // throttle spam
      last[key] = now;
      moveSound(mv, phase);
    },
    beamCharge(dur) { if (ctx && !muted) beamCharge(dur); },
    beamFire(dur, type) { if (ctx && !muted) beamFire(dur, type); },
    music: Music,
    // pausing suspends the whole audio clock, so music resumes exactly where it stopped
    pause() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    toggle() {
      muted = !muted;
      if (mainOut) mainOut.gain.setValueAtTime(muted ? 0 : 0.3, ctx.currentTime);
      return muted;
    },
    get muted() { return muted; },
    // which: 'music' | 'sfx'; v: 0..1. Works before init too (applied when audio starts).
    setVolume(which, v) {
      vol[which] = Math.max(0, Math.min(1, v));
      const bus = which === 'music' ? musicBus : master;
      if (bus) bus.gain.setTargetAtTime(vol[which], ctx.currentTime, 0.03);
    },
    volume(which) { return vol[which]; },
    // Test hook: render audio into an OfflineAudioContext (used to preview / level-check the mix).
    _offline(off, fn) {
      const saved = [ctx, master, musicBus, mainOut, noiseBuf];
      ctx = off; mainOut = off.createGain(); mainOut.gain.value = 0.3; mainOut.connect(off.destination);
      master = off.createGain(); master.connect(mainOut); musicBus = off.createGain(); musicBus.connect(mainOut);   // full volume
      noiseBuf = off.createBuffer(1, off.sampleRate, off.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const layer = (type, t, dur) => { bus = ctx.createGain(); bus.gain.value = LAYER_GAIN[type] || 1; bus.connect(master); BEAM_LAYERS[type](t, dur, BEAM_PITCH[type] || 58); bus = null; };
      try { fn({ tone, beamCharge, beamFire, Music, BEAM_LAYERS, layer, lib, moveSound }); } finally { [ctx, master, musicBus, mainOut, noiseBuf] = saved; }
    },
  };
})();
