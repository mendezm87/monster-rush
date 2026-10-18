// Redesign concepts, for the owner to pick from on redesign.html (not loaded by the game).
// Monsters that read as a specific Pokemon get original replacements before release: each
// concept keeps the monster's name, type and moves and changes only the look. A picked concept
// moves into sprites.js (all five views, rigged) and leaves this file.
// Each art function draws the front view into a 32x32 PixGrid (44x44 for size L), like MONSTER_ART.

const CONCEPTS = {
  sparkit: {
    why: 'Reads as Pikachu: a yellow mouse with black-tipped ears, red cheeks and a lightning tail.',
    list: [
      {
        name: 'A · Plug ferret',
        desc: 'A slim teal ferret with a cream belly, a spiky static tuft on its head, and a tail that ends in a two-pronged copper plug. Quick and wiry.',
        art(g) {
          const T = P('#3ec9c0', '#23908a', '#8af0e8'), C = P('#f4ecd6', '#d6c8a4', '#ffffff'), Cu = P('#e8903a', '#b0601e', '#ffc07a');
          g.poly([[20, 25], [26, 22], [29, 17], [27, 16], [24, 20], [19, 22]], T, { edge: true });   // long tail
          g.rect(26, 12, 2, 4, Cu.b); g.rect(29, 12, 1, 4, Cu.b); g.rect(26, 15, 4, 2, Cu.s);             // the plug's prongs
          g.ellipse(16, 24, 5.5, 6, T, { edge: true });                                            // body
          g.ellipse(16, 25.5, 3.5, 4, C);                                                          // belly
          g.ellipseM(11.5, 23, 1.6, 2.2, T, { edge: true });                                      // little paws
          g.ellipseM(13, 30, 2.5, 1.4, P('#23908a', '#16605c', '#3ec9c0'));                        // feet
          g.ellipseM(10.5, 9, 1.8, 2, T, { edge: true }); g.pxM(10, 9, '#ff9ab0');                // small round ears
          g.ellipse(16, 13, 7, 5, T, { edge: true });                                              // long head
          g.polyM([[9, 11], [14, 11], [14, 14], [10, 14]], '#16605c');                              // a ferret's dark eye mask
          g.ellipse(16, 16, 3.5, 2.6, C);                                                          // muzzle
          g.poly([[13, 7], [14, 2], [16, 6], [18, 1], [19, 7]], P('#e0fff8', '#8af0e8', '#ffffff'), { edge: true });   // static tuft
          g.eyes(12, 11, '#3a1a5a', { h: 3 });
          g.rect(15, 15, 2, 1, OUTLINE); g.px(14, 17, OUTLINE); g.px(17, 17, OUTLINE); g.px(15, 18, OUTLINE).px(16, 18, OUTLINE);
        },
      },
      {
        name: 'B · Static puff',
        desc: 'A round indigo fluffball of crackling static fur with big round eyes, stubby feet and a little antenna with a glowing bulb. Floats a bit when it charges.',
        art(g) {
          const F = P('#6a6af0', '#4040b8', '#b0b0ff'), Bu = P('#ffe680', '#e0b030', '#fffbd0');
          // frizzy outline of static fur: spikes all round a round body
          const pts = [];
          for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = i % 2 ? 9.5 : 11.5; pts.push([16 + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.92]); }
          g.poly(pts, F, { edge: true });
          g.ellipse(16, 19, 6, 5.5, '#8a8af8');                                                    // lighter face
          g.rect(16, 3, 1, 5, '#2a2a5a'); g.ellipse(16.5, 3, 2.2, 2.2, Bu, { edge: true });        // antenna and bulb
          g.ellipseM(11.5, 30, 2.5, 1.4, P('#4040b8', '#2a2a80', '#6a6af0'));                      // stubby feet
          g.eyes(11, 15, '#1a1a40', { h: 4, w: 3 });
          g.px(15, 21, OUTLINE).px(16, 22, OUTLINE).px(17, 21, OUTLINE);                           // little smile
          g.px(5, 9, Bu.b).px(27, 11, Bu.b).px(4, 24, Bu.b).px(28, 25, Bu.b);                       // sparks
        },
      },
      {
        name: 'C · Coil gecko',
        desc: 'A lime-green gecko with copper zigzag stripes, sticky toes, and a tail curled like a spring with a glowing tip. Big wide eyes, always grinning.',
        art(g) {
          const G = P('#8fd84a', '#5aa02a', '#c8f48a'), Cu = '#c8702a', Gl = P('#7ae8ff', '#2ab0d8', '#e0faff');
          // spring-coiled tail behind, to one side
          g.ellipse(25, 22, 4.5, 4, G, { edge: true }); g.ellipse(25, 22, 2.2, 1.8, '#3a6a1a');
          g.ellipse(28.5, 17, 2, 2, Gl, { edge: true });                                           // glowing tip
          g.ellipse(16, 22, 6, 6.5, G, { edge: true });                                            // body
          g.ellipse(16, 23.5, 3.5, 4.5, '#e8f8c8');                                                // pale belly
          g.px(13, 18, Cu).px(14, 19, Cu).px(13, 20, Cu); g.px(19, 18, Cu).px(18, 19, Cu).px(19, 20, Cu);   // zigzag stripes
          g.ellipseM(9, 24, 2, 1.6, G, { edge: true });                                            // splayed front feet
          g.ellipseM(11, 29.5, 3, 1.5, G, { edge: true });
          g.pxM(8, 25, '#e8f8c8'); g.pxM(10, 25, '#e8f8c8');                                         // sticky toe pads
          g.ellipse(16, 12, 8, 6, G, { edge: true });                                              // wide head
          g.ellipseM(10.5, 10, 3, 3, '#ffffff', { edge: true });                                   // big wide eyes
          g.ellipseM(11, 10.5, 1.4, 1.6, '#1a2a10');
          g.px(11, 9, '#ffffff'); g.px(21, 9, '#ffffff');
          g.rect(12, 15, 8, 1, OUTLINE); g.px(11, 14, OUTLINE); g.px(20, 14, OUTLINE);               // grin
          g.px(14, 16, '#ff7a9a').px(15, 16, '#ff7a9a');
        },
      },
    ],
  },

  cinderox: {
    why: "Reads as Cyndaquil: a navy back, cream belly and a collar of flames on the back. It should look like a young Infernox (the magma bull) instead.",
    list: [
      {
        name: 'A · Ember calf',
        desc: 'A sturdy navy bull calf with a cream muzzle, stubby horn nubs, a flame forelock and a flame-tipped tail. Clearly grows into Infernox.',
        art(g) {
          const B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4'), F = P('#ff7a1c', '#e2401a', '#ffd34a'), H = P('#f3e8d0', '#b8a68a', '#ffffff');
          g.poly([[24, 23], [29, 20], [28, 22]], B); g.poly([[28, 17], [31, 20], [28, 23], [26, 20]], F);   // tail with a flame tip
          g.ellipse(16, 22, 9, 6.5, B, { edge: true });                                            // body
          g.ellipse(16, 24.5, 5.5, 3.5, C);                                                        // belly
          g.ellipseM(10.5, 28.5, 2.5, 2.5, B, { edge: true }); g.ellipseM(10.5, 30, 2.2, 1.2, '#16224a');   // legs, dark hooves
          g.polyM([[10, 9], [6, 7], [6, 5], [9, 7]], H, { edge: true });                           // stubby horns
          g.ellipseM(8.5, 11, 2.5, 1.6, B, { edge: true });                                        // ears
          g.ellipse(16, 12, 7, 6, B, { edge: true });                                              // head
          g.poly([[13, 7], [14, 1], [16, 4], [18, 0], [19, 7]], F, { edge: true });                 // flame forelock
          g.poly([[15, 7], [16, 3], [17, 7]], '#ffd34a');
          g.ellipse(16, 15.5, 4.5, 3, C, { edge: true });                                          // muzzle
          g.rect(14, 15, 1, 1, OUTLINE); g.rect(17, 15, 1, 1, OUTLINE);                            // nostrils
          g.rectM(11, 11, 3, 2, '#ffd34a'); g.rectM(12, 11, 2, 2, '#1a1222');                       // determined eyes
          g.rectM(10, 10, 4, 1, OUTLINE);
        },
      },
      {
        name: 'B · Lava-shouldered calf',
        desc: 'A mini Infernox: navy calf with rocky shoulder plates cracked with glowing lava, little curved horns, a short flame mane down the neck and puffs of smoke from its nose.',
        art(g) {
          const B = P('#2f4a7a', '#1f3054', '#4a6aa0'), C = P('#f3dd9a', '#d4b56a', '#fff2c4'), F = P('#ff7a1c', '#e2401a', '#ffd34a'), Rk = P('#4a3a34', '#2a201c', '#6a564c'), H = P('#f3e8d0', '#b8a68a', '#ffffff');
          g.poly([[9, 13], [11, 4], [14, 10]], F); g.poly([[13, 10], [16, 2], [19, 10]], F); g.poly([[18, 10], [21, 4], [23, 13]], F);   // flame mane
          g.ellipse(16, 22, 9.5, 6.5, B, { edge: true });                                          // body
          g.ellipse(16, 24.5, 5.5, 3.5, C);
          g.ellipseM(8, 20, 3.5, 3, Rk, { edge: true }); g.pxM(7, 19, '#ff7a1c'); g.pxM(8, 20, '#ffd34a');   // rocky shoulders, lava cracks
          g.ellipseM(10.5, 28.5, 2.5, 2.5, B, { edge: true }); g.ellipseM(10.5, 30, 2.2, 1.2, Rk);  // legs, rock hooves
          g.polyM([[11, 9], [6, 8], [5, 4], [7, 4], [8, 7], [11, 7]], H, { edge: true });           // little curved horns
          g.ellipse(16, 12.5, 6.5, 5.5, B, { edge: true });                                        // head
          g.ellipse(16, 16, 4.5, 2.8, C, { edge: true });                                          // muzzle
          g.rect(14, 16, 1, 1, OUTLINE); g.rect(17, 16, 1, 1, OUTLINE);
          g.ellipseM(11, 18, 1.2, 1.2, '#b8b0c0'); g.pxM(10, 17, '#d8d0e0');                       // smoke puffs
          g.rectM(11, 11, 3, 2, '#ffd34a'); g.pxM(12, 11, '#ffffff');                              // glowing eyes
          g.rectM(10, 10, 4, 1, OUTLINE);
        },
      },
      {
        name: 'C · Coal calf',
        desc: 'A chunky charcoal calf whose back is a heap of glowing coals, with an ember-orange belly glow and a smoking tail. A different palette from Infernox (it would brighten into navy on evolving).',
        art(g) {
          const K = P('#3a3236', '#221c20', '#5a5056'), Co = P('#2a2226', '#140e12', '#4a3e44'), F = P('#ff7a1c', '#e2401a', '#ffd34a'), C = P('#e8c890', '#c09a5a', '#fff0c8');
          g.ellipse(16, 22, 9.5, 6.5, K, { edge: true });                                          // body
          for (const [x, y] of [[10, 17], [14, 15], [19, 16], [22, 19], [12, 20], [18, 19]]) { g.ellipse(x, y, 2.6, 2.2, Co, { edge: true }); g.px(x, y, '#ff7a1c'); }   // coals
          g.ellipse(16, 25, 5, 2.8, F);                                                            // ember belly glow
          g.ellipseM(10.5, 28.5, 2.5, 2.5, K, { edge: true });
          g.polyM([[10, 9], [7, 6], [8, 5], [10, 7]], P('#c8b8a0', '#8a7a62', '#e8dcc8'), { edge: true });   // horn nubs
          g.ellipse(16, 12, 6.5, 5.5, K, { edge: true });                                          // head
          g.ellipse(16, 15.5, 4.5, 2.8, C, { edge: true });
          g.rect(14, 15, 1, 1, OUTLINE); g.rect(17, 15, 1, 1, OUTLINE);
          g.rectM(11, 11, 3, 2, '#ff9a3a'); g.pxM(12, 11, '#ffe0a0');
          g.poly([[25, 22], [29, 18], [30, 19], [26, 23]], K); g.ellipse(29.5, 16.5, 1.5, 1.5, '#9a9098');   // tail and smoke
        },
      },
    ],
  },

  lumawool: {
    why: 'Reads as Mareep / Flaaffy: a woolly electric sheep with a yellow face and a glowing orb on its tail.',
    list: [
      {
        name: 'A · Storm lamb',
        desc: 'Its wool is a dark storm cloud with lightning flickering inside, puffed up like a hood over its head. A pale lamb face, curled silver horns, hooves peeking out underneath. No tail orb.',
        art(g) {
          const S = P('#6a7488', '#4a5266', '#9aa4b8'), Fc = P('#f2eee6', '#cfc8bc', '#ffffff'), Hn = P('#c8ccd8', '#8a90a0', '#eef0f6');
          g.rectM(11, 26, 2, 4, '#2a2230');                                                        // legs
          for (const [x, y, r] of [[16, 22, 8.5], [9, 19, 5], [23, 19, 5], [11, 13, 4.5], [21, 13, 4.5], [16, 10, 5]]) g.ellipse(x, y, r, r * 0.85, S);   // storm-cloud wool, a hood over the head
          g.poly([[7, 21], [10, 17], [9, 20], [12, 19], [9, 24]], '#ffe680');                      // lightning in the cloud
          g.poly([[23, 20], [25, 17], [25, 19], [27, 19], [24, 23]], '#ffe680');
          g.polyM([[11, 16], [7, 15], [6, 18], [8, 19], [9, 17]], Hn, { edge: true });              // curled horns
          g.ellipse(16, 18, 4.5, 5, Fc, { edge: true });                                           // lamb face
          g.ellipseM(10.5, 17, 2, 1.2, Fc, { edge: true });                                        // floppy ears
          g.eyes(13, 17, '#2a2a3a', { h: 2 });
          g.px(15, 21, '#e89aa8').px(16, 21, '#e89aa8'); g.px(15, 22, OUTLINE).px(16, 22, OUTLINE);
        },
      },
      {
        name: 'B · Lantern alpaca',
        desc: 'A fluffy cream alpaca with a long neck, a tuft over its eyes and a little brass lantern-bell on a collar that glows electric blue.',
        art(g) {
          const W = P('#fff3dc', '#dcc8a0', '#ffffff'), Br = P('#d8a040', '#a06a1e', '#ffd88a'), Gl = '#7ae8ff';
          g.rectM(11, 25, 2, 5, '#c8b088'); g.rectM(11, 29, 2, 1, '#5a4a3a');                      // legs and hooves
          g.ellipse(16, 22, 8, 6, W, { edge: true });                                              // fluffy body
          g.ellipse(16, 14, 3.5, 6, W, { edge: true });                                            // long neck
          g.ellipse(16, 8, 4.5, 4, W, { edge: true });                                             // head
          g.polyM([[12, 6], [11, 1], [14, 4]], W, { edge: true });                                  // pointed ears
          g.ellipse(16, 5, 3.5, 2, P('#ffffff', '#e8dcc0', '#ffffff'));                             // tuft
          g.eyes(13, 8, '#3a2a1a', { h: 2 });
          g.ellipse(16, 11, 2, 1.4, '#e8d8b8'); g.px(16, 11, OUTLINE);                              // muzzle
          g.rect(13, 16, 7, 1, '#7a3a3a');                                                          // collar
          g.ellipse(16, 18.5, 2, 2.2, Br, { edge: true }); g.px(16, 18, Gl); g.px(16, 19, Gl);       // lantern-bell, glowing
        },
      },
      {
        name: 'C · Static goat',
        desc: 'A small goat whose fluffy wool tufts stand on end with static, copper ram horns crackling blue at the tips, and a stubborn little beard.',
        art(g) {
          const Wl = P('#f0ecf8', '#c8c0dc', '#ffffff'), Bd = P('#8a7a9a', '#5e5070', '#b0a4c0'), Cu = P('#d8823a', '#9a501a', '#ffb06a');
          g.rectM(11, 25, 2, 5, Bd.s); g.rectM(11, 29, 2, 1, '#2a2230');                          // legs and hooves
          g.ellipse(16, 22, 8, 5.5, Bd, { edge: true });                                           // body
          for (const [x, y, r] of [[11, 19, 3.8], [16, 18, 4.2], [21, 19, 3.8]]) g.ellipse(x, y, r, r * 0.9, Wl, { edge: true });   // fluffy wool tufts
          for (const x of [9, 13, 16, 19, 23]) g.poly([[x - 1, 16], [x, 13], [x + 1, 16]], Wl);    // standing on end with static
          g.ellipse(16, 12, 4.5, 4.5, Bd, { edge: true });                                         // head
          g.ellipse(16, 8.5, 3, 2, Wl, { edge: true });                                            // woolly forelock
          g.polyM([[12, 10], [7, 7], [6, 11], [8, 13], [9, 10]], Cu, { edge: true });               // ram horns
          g.pxM(6, 11, '#7ae8ff'); g.pxM(7, 12, '#7ae8ff');                                         // sparks at the tips
          g.eyes(13, 11, '#ffe066', { h: 2 });
          g.px(15, 14, OUTLINE).px(16, 14, OUTLINE);
          g.poly([[15, 16], [17, 16], [16, 19]], Wl);                                               // little beard
        },
      },
    ],
  },
};
