# Attack art prompts

Prompts for the attacks' art (the Coreatures' and trainers' prompts are in `docs/concept-prompts.md`). The
audit and the plan are in `docs/attack-art.md`. Run a batch in Gemini and send back the images you like;
Claude draws the batch from them.

The owner's picks are kept in `docs/refs/` (tracked in git, unlike other pictures), named after their prompt
(`d1-volt-rush.png`), so later sessions can see what each attack was drawn from.

## Batch 1: dashes and hit impacts (r144; the owner: "a lot of them look like basic squares or circles, we need to treat them as important as sprites")

The audit and the plan are in `docs/attack-art.md`. Dashes are the worst (a flat coloured block behind the
Coreature and a white blob on the target), and the white impact blob shows up on almost every hit. Run these
in Gemini and send back the ones you like. Each asks for a **pixel-art effect sheet** (frames left to right),
which Claude uses as a guide for shapes, timing and colours; the creature is left out on purpose, so only the
effect is drawn. (r146: the first D1 came out as a glowing ball, which is right for a shot but not a dash, where the
Coreature itself is moving, so the dash prompts now ask for the effect to wrap around an empty creature-sized
space.)

The shared style, already in every prompt:

> 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D1 · Volt Rush** (Electric dash)
> A body-shaped burst of crackling electricity charging forward: jagged yellow and white lightning bolts
> streaming back from a bright leading edge, sparks peeling off, a trail of fading afterimage outlines, then a
> zigzag electric impact star that splits into small bolts. 16-bit pixel art visual effect sprite sheet for an
> action game, frames in a row from left to right (wind-up, travel, impact, fade), chunky pixels with a dark
> 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text

**D2 · Aqua Jet** (Water dash)
> A torpedo-shaped jet of water rushing forward: a pointed spearhead of white foam, a twisting body of blue
> water behind it, droplets and spray flying off the sides, then a crashing splash impact with a ring of
> droplets. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D3 · Megahorn** (Plant dash)
> A long glowing green horn-shaped lance of energy thrusting forward, with leaf-shaped speed streaks and torn
> leaves swirling behind it, then a piercing impact: a sharp green starburst with leaf shards. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D4 · Iron Slam** (Metal dash)
> A heavy steel shockwave charging forward: a wedge of grey metal plates with rivets and bright white glints,
> heavy speed lines, sparks scraping off the ground, then a clanging impact: a flat white-and-steel star with
> a ring of metal fragments and sparks. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D5 · Brave Dive** (Wind dash)
> A diving streak through the air: a bright white-blue arrowhead of wind, swept-back air currents curling
> behind it like a comet's tail, loose feathers spinning off, then a wind-burst impact that flattens into
> curved gust lines. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D6 · Lance Charge** (Electric dash with a railgun lance)
> A straight lance of blue-white electric light thrusting forward, a coil of current spiralling round it,
> blue sparks, then a piercing flash impact with a cross-shaped burst and lingering sparks. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D7 · Phantom Strike** (Phantom dash)
> A ghostly lunge: a trail of three or four translucent violet afterimages fading behind, wisps of spectral
> purple flame streaming off them, then a spooky impact: a violet slash mark with a skull-shaped puff of
> smoke that fades. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D8 · Deadline Dash** (Shade dash; Mondaze, a burnt-out coffee sloth, sprinting before a deadline)
> A frantic dash trail made of flying sheets of paper, clock-face symbols and dark coffee splashes, with
> panicked speed lines, then a comic impact: a dark starburst with papers scattering. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D9 · Body Slam / Wool Tackle** (Beast dashes)
> Body Slam: a heavy body-shaped shockwave charging forward with big round dust clouds kicking up behind and
> a heavy ground-shaking impact with a burst of dust and a crack in the ground. Wool Tackle: a puffy cloud of
> storm-grey wool charging forward with little sparks crackling inside, then a soft but powerful impact of
> wool tufts and sparks. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**D10 · Zoomies** (Beast dash; Smugshi, a Shiba Inu, running in silly circles)
> A comic zig-zagging speed trail of golden-orange motion lines, little paw-print puffs of dust, and cartoon
> speed swooshes, then a bonk impact: a bouncy yellow star with tiny spinning stars. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to right
> (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no creature
> drawn, not a solid ball), plain dark navy background, no text

**I1 · Hit impacts, one per type** (to replace the white blob on every hit)
> A sheet of 15 small hit-impact effects, each 4 frames, one row per element: fire (a burst of flame tongues),
> water (a splash crown of droplets), electric (a zigzag spark star), ice (shattering crystal shards), plant
> (a burst of leaves), earth (cracked rock chips and dust), wind (curved gust slashes), metal (a white clang
> star with sparks), arcane (a pink starburst with sparkles), shade (a jagged dark burst), phantom (a violet
> wisp puff), beast (a bold comic star with motion lines), brawl (a punch-shaped shock ring), dragonkin (a
> burst of silver scales and violet energy), glitch (broken magenta and cyan pixel blocks). 16-bit pixel art
> visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text

- Volt Rush: travel from d1-volt-rush.png (bolts streaming back, no figure), impact from d1b-volt-rush.png (a zigzag bolt striking into the star); d1b's running humanoid of lightning doesn't fit four-legged and floating Coreatures.
