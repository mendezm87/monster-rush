// Tiny synthesized sound effects (WebAudio, no asset files).
const Sfx = (() => {
  let ctx = null, master = null, noiseBuf = null, muted = false;
  const last = {};

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
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
        out = ctx.createGain(); out.gain.value = 0.8; out.connect(master);
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
        out = ctx.createGain(); out.gain.value = 0.8; out.connect(master);
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
    beamCharge(dur) { if (ctx && !muted) beamCharge(dur); },
    beamFire(dur, type) { if (ctx && !muted) beamFire(dur, type); },
    music: Music,
    // pausing suspends the whole audio clock, so music resumes exactly where it stopped
    pause() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    toggle() {
      muted = !muted;
      if (master) master.gain.setValueAtTime(muted ? 0 : 0.3, ctx.currentTime);
      return muted;
    },
    get muted() { return muted; },
    // Test hook: render audio into an OfflineAudioContext (used to preview / level-check the mix).
    _offline(off, fn) {
      const saved = [ctx, master, noiseBuf];
      ctx = off; master = off.createGain(); master.gain.value = 0.3; master.connect(off.destination);
      noiseBuf = off.createBuffer(1, off.sampleRate, off.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const layer = (type, t, dur) => { bus = ctx.createGain(); bus.gain.value = LAYER_GAIN[type] || 1; bus.connect(master); BEAM_LAYERS[type](t, dur, BEAM_PITCH[type] || 58); bus = null; };
      try { fn({ tone, beamCharge, beamFire, Music, BEAM_LAYERS, layer, lib }); } finally { [ctx, master, noiseBuf] = saved; }
    },
  };
})();
