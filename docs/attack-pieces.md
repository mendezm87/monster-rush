# Attack pieces: the prompts for every attack

*Written 2026-10-23 (r185) after the Eruption test. The owner: "That looks so much better. Let's do that with all
the attacks... make sure we get everything we need for all of the attacks."*

## Why pieces

Until now each attack was one Gemini picture of the whole scene in 5-8 frames. The game could only flip between
those frames, so attacks stepped instead of moving smoothly, never changed, and could only be stretched to fit.

Now Gemini draws an attack's **pieces** (a flame, a rock, a puff of smoke, a crack in the ground, a section of beam)
and the game moves them **60 times a second**:
- **Smooth:** rocks fly in arcs, smoke drifts, rings grow and flames flicker without stepping.
- **Never the same twice:** sparks and debris scatter differently every time.
- **Any size:** a beam is built from sections laid end to end, so it's never stretched or smeared.
- **Depth:** pieces on the far side of the Coreature are drawn behind it and the ones on the near side in front,
  so it stands *inside* its attack (the owner's idea, r183).

**Received so far:** COMMON-1 (r186: Body Slam, Heavy Stomp, Quake's stomp for now, Belly Flop's landing)), COMMON-2 (r187: every boost and heal; its aura flames have a hole, so they aren't used), HITS-1 (r188: fire, water, electric and ice hits), HITS-2 (r189: plant, earth, wind and metal hits), HITS-3 (r190: arcane, shade, phantom and dragonkin hits), HITS-4 (r191: beast, brawl, glitch and critical hits). **Batch 1 is complete.** SMUG-1 (r192: Smug Beam, Supreme Smug Beam; the first beam built from sections). SMUG-1b (r194: the Smug Beam's patterned body, core, muzzle and impact; its smug face is too small to read in the game). SMUG-1c (r196: the Supreme Smug Beam). BEAST-3 (r197: Snack Time, Blanket Nap). BEAST-1 (r199: Mega Beam). BEAST-4 (r201: Heavy Sigh, Coffee Break, Wool Tackle). FIRE-2a (r202: Flamethrower; its sections came with a fireball on the end, so only their twisting part is used). FIRE-2b (r204: Inferno Beam). FIRE-3 (r206: Fire Blast, Flame Wheel, Blaze Rush). FIRE-4 (r207: Steam Eruption, Magma Wave's lava). WATER-1a (r208: Hydro Cannon; its splash came facing the wrong way and is mirrored, its core strand is left out). WATER-1b (r209: Tidal Cannon; Gemini drew arrows on its muzzle and impact, which the game cuts off). WATER-2 (r210: Spout Shot, Cuff Cannon, Twin Cannon, Bubble Spray). WATER-3 (r212: Aqua Jet, Geyser Vent, Whirlpool, Maelstrom). Tidal Cannon's tip is now its whirlpool (r211, the owner didn't like the wave). PLANT-1 (r213: Razor Leaf, Seed Bomb). PLANT-2a (r214: Solar Beam). PLANT-2 (r215: Photosynth). PLANT-3 (r216: Cotton Guard). BUG-1 (r217: Megahorn, Beetle Barrage, Pin Missile; came in 5 rows, cut from MANUAL boxes). ICE-1 (r218: Ice Shard, Blizzard). ICE-2a (r219: Frost Ray, the second take with the rewritten prompt: no arrows). ICE-2 (r220: Frost Armor: a frost patch, a ring of ice spikes cracking up, an ice shield and crystals behind it, frost mist; its plates came as a shield, a crystal and a gauntlet, and the gauntlet isn't used yet; cut from MANUAL boxes; the spikes and frost are there for the boss's frost later). EARTH-1 (r221: Quake's ring of rock spikes and star of cracks, Rock Slide's falling boulders smashing on cracked earth, Rollout's rubble and smash, Heavy Stomp's cracked earth; the spikes, boulders and cracks are there for the boss's Fault Line and Rockfall later). EARTH-2 (r222: Quicksand's swirling sand with grains sinking in, Mud Shot's dripping clod, splat and puddle, Magma Quake's lava cracks and ring of magma spurts). DARK-1 (r223: Night Slash's shadow wisps and crescent cut, Gloom Orb's orb and burst of darkness; the burst is there for Dark Wave with DARK-2). DARK-2 (r224: Dark Wave's glowing crack, ring of shadow tendrils, burst and smoke; Dark Pulse's rings of spiky darkness rolling out with tendrils bursting up as they pass). DARK-3 (r225: Deadline Dash's flying paperwork and calendar page, Blank Stare's thought bubble, blank eyes, one droopy stare beam and hypnotic swirl, question marks on the target; the beam is drawn at full size because its thin lines vanish when shrunk). FIGHT-1 (r226: Rapid Jab and Close Combat stream aura wisps and motion lines and land fists of aura with punch flashes and a shockwave ring, Aura Sphere flies as its spinning sphere; row 4 was cut from MANUAL boxes because the spheres' bits spilled into it). FIGHT-2a (r227: Aura Cannon; its sections came with glowing end caps on both sides, trimmed off; its core strand is unused). FIGHT-2 (r228: Bulk Up's power burst, tongues of aura flaring round it and steam huffing off its head). WIND-1 (r229: Air Slash's crescent blades, Razor Gale's spinning wind shuriken, Gust's curls of wind with leaves and feathers; the streaks are drawn at full size because thin lines vanish when shrunk). WIND-2 (r230: Tornado's funnel under the code-drawn storm cloud, its dust ring and whirling debris; Tailwind's green ribbons and leaves. Its row 3 came back as plain arrows, so Brave Dive used WIND-2b). WIND-2b (r231: Brave Dive's bow wave of air round its front, feathers and wind streaks peeling off behind). GLITCH-1 (r232: Sludge Bomb's dripping glob, splat, data blocks and puddle; Acid Spray's green drops sizzling; Fatal Error's burst of broken data blocks; cut from MANUAL boxes, 40 colours so the cyan flecks survive). GLITCH-2a (r233: Venom Jet; its core strand is unused). GLITCH-2 (r234: Toxic Pool's falling glob and bubbling sludge pool; the glitched bosses' data tears). GHOST-1 (r235: Shadow Ball's ball of ghost fire and mist; Phantom Strike's will-o'-wisps and streak of spirit light; Spirit Flames' wisp drifting down and tongue of spirit flame). GHOST-2 (r236: Spectral Ray; its sections' end caps trimmed, its core strand unused; the spirit faces inside are too small to read once shrunk). ELEC-1 (r237: Thunderbolt's ball of lightning and spark star, Static Siphon's static ball and green sparks flying back to its user; its bolts trail Volt Rush and Lance Charge). ELEC-2a (r237: Volt Cannon). ELEC-2b (r237: cut in, but Rail Shot keeps E5, which is flashier; the entry to try it is commented out in fx.js). ELEC-3 (r237: Discharge's ring and arcs of lightning, Volt Rush's spearhead, Lance Charge's lance and scorch mark). STEEL-1a (r238: Flash Cannon). STEEL-1 (r238: Drone Swarm's drones, bolts and sparks). STEEL-2 (r238: Iron Slam's sparks, clang and dent; Magnet Storm's magnet and field rings; Iron Defense's armour plates; Tower Shield). FAIRY-1 (r238: Moonblast's crescent moon and moonlight burst, Fairy Wind's pink curls). FAIRY-2a (r238: Dazzle Beam). FAIRY-2 (r238: Wish's golden star). PSY-1a (r238: Psybeam). PSY-1 (r238: Mind Orbs). PSY-2 (r238: Foresight's eye and column of light, Calm Mind's rune ring; its sleepy ring and bubble play in Slumbear's Big Yawn). DRAGON-1a (r238: Dragon Pulse, with its roaring dragon's head on the tip). DRAGON-1 (r238: Dragon Claw's raking claws and stardust). DRAGON-2 (r238: Starfall's falling stars, starbursts and craters; Dragon Dance's nebula flames). BOSS-1 (r238: Slumbear's icicles, glacier slabs, bamboo spears, landing shadow and dust ring; his Fault Line and Rockfall use EARTH-1; cut from MANUAL boxes). **Every prompt in this file is now in the game.** BEAST-2 (r195: Zoomies, Zoomies Max, Shiba Scream, Shiba Roar). **Eruption is done** (prompt P1 in `docs/attack-prompts.md`, picture `docs/refs/p1-eruption-pieces.png`), and it's on in
the game since r185. **Thunder** is already built this way (code-drawn gathering clouds, then the E2b storm cloud and
the E2c bolt) and stays as it is. Everything else is below.

## How to run them

1. **One prompt per image.** Copy a prompt (the text in the grey box) into Gemini on its own. Every prompt is complete;
   nothing else needs adding.
2. **Send the picture back with its code** (for example "FIRE-2"). Claude saves it in `docs/refs/` as `pk-fire-2.png`,
   cuts it into pieces with `tools/fx-sheets.py`, and builds the attacks that use it.
3. **What to check before sending:** every row has the number of pieces the prompt asks for; nothing is cut off at an
   edge; no boxes or panels behind the pieces (they're hard to cut out); pieces don't overlap. If one piece came out
   wrong, send it anyway and say which: Claude can often use the rest, and only that row needs redoing.
4. **Order:** the batches below go from most-used to least. Batch 1 (common pieces and hits) improves every attack in
   the game at once.

### Rules every prompt follows (and why)

- **4 rows at most, an exact count in each row.** The cutting tool finds pieces row by row, so counts must match.
- **Lots of empty space between pieces, no panels or boxes.** E2 and E2c came with panels of a different blue, which
  cost a lot of fixing, and E2c's ring was hidden behind the next panel.
- **Frames of one piece side by side, each a small step from the last.** A loop's last frame leads back into the first.
- **Things that point, point right** (shots, beam heads, slashes, spearheads). The game turns them.
- **Never write "pointing right" or "pointing left" for a beam's muzzle or impact (r219):** Gemini reads it as a request for arrows (WATER-1b and ICE-2a came back with arrows). Describe each as a burst on its own with nothing attached, and say "no arrows or arrowheads" and "no box or border" (ICE-2a's beam body came back as a bordered box).
- **Ground pieces are "seen from slightly above, a flat oval"** (cracks, pools, rings), to match the game's view.
- **Beam sections** are asked for as "a straight horizontal section, the same thickness all along, cut off straight at
  both ends so copies placed end to end join into one long beam". If Gemini's ends don't line up, the game overlaps
  them and alternates mirrored copies to hide the joins.
- **Beams are three parts plus layers (r193, after the owner found SMUG-1's beams "a lot more plain than the
  originals" and a look at how games do it):** a **muzzle** flash at the mouth, a **body** with a *pattern inside it*
  (swirls, ripples, sparks, twisting strands, never flat stripes, which look plain once repeated), a thinner bright
  **core** strand laid over it, and an **impact** burst where it hits (the game's beams go through everything in their
  line, so it plays on every Coreature hit). A **head** only leads while the beam shoots out. Ask for all of these
  in every beam prompt.
- **Colours are given in words for every piece**, using each type's colours in the game, so pieces of one attack match.
- **No text**, except where a symbol *is* the piece (the sleepy Z's, a "?" or "..." for Blank Stare), which the
  prompt asks for explicitly.

### How the game will use each kind of piece

| Piece | What the game does with it |
| --- | --- |
| **Loop** (3-4 frames) | Plays it over and over while it moves (a flying orb, a flickering flame, a spinning blade). |
| **One-shot** (3-4 frames) | Plays it once as it happens (a burst, a splash, a pop). |
| **Bit** (single picture, often 2-3 variants) | Throws, drifts, spins, grows and shrinks it: debris, sparks, petals, papers. |
| **Puff** (4 stages) | Rises and swells through its stages: smoke, steam, dust. |
| **Ground piece** (flat oval) | Lies under everything, grows or spreads: cracks, pools, rings, shadows, decals. |
| **Beam section** (4-frame loop) | Laid end to end along the beam, scrolling forward and flickering; a mouth piece at the start and an end piece where it hits. |
| **Leading edge** (3-frame loop, pointing right) | Rides in front of a dashing Coreature, turned the way it dashes. |

---

## The checklist: every attack

Kinds: **Shot** (projectile), **Beam**, **Dash**, **Blast** (burst round the user, or a cone), **Strike** (lands on a
spot after a delay), **Vortex**, **Boost** (buff), **Heal**. Every hit also plays its type's hit pieces (HITS-1 to 4).

| Attack | Type · kind | Used by | Sheets |
| --- | --- | --- | --- |
| Eruption | Fire · Blast | Cinderox | **P1 (done)** |
| Thunder | Electric · Strike | Sparkit, Voltergeist, Coilizard | **E2b + E2c (done)** |
| Flamethrower | Fire · Beam | Cinderox | FIRE-2a, FIRE-1 |
| Inferno Beam | Fire · Beam | Infernox | FIRE-2b, FIRE-1 |
| Fire Blast | Fire · Shot | Smouldox, Infernox | FIRE-3, FIRE-1 |
| Flame Wheel | Fire · Dash | Cinderox, Smouldox | FIRE-3, FIRE-1 |
| Blaze Rush | Fire · Dash | Infernox | FIRE-3, FIRE-1 |
| Steam Eruption | Fire · Strike (lingers) | Magma Bastion | FIRE-4 |
| Magma Wave | Fire · Blast (cone) | Magma Bastion | F8b waves (kept), FIRE-4 |
| Magma Quake | Earth · Blast | Infernox | EARTH-2, FIRE-1 |
| Hydro Cannon | Water · Beam | Tidalisk, Bulwarden, Garrishell, Railwarden, Citadrone | WATER-1a |
| Tidal Cannon | Water · Beam | Maelstrisk | WATER-1b |
| Spout Shot | Water · Shot | Shellmet | WATER-2 |
| Cuff Cannon | Water · Shot | Bulwarden | WATER-2 |
| Twin Cannon | Water · Shot (2) | Garrishell | WATER-2 |
| Bubble Spray | Water · Shot (5) | Tidalisk, Maelstrisk | WATER-2 |
| Aqua Jet | Water · Dash | Shellmet | WATER-3, WATER-2 |
| Geyser Vent | Water · Blast | Magma Bastion | WATER-3, WATER-2, FIRE-4 |
| Whirlpool | Water · Vortex | Tidalisk | WATER-3, WATER-2 |
| Maelstrom | Water · Vortex | Maelstrisk | WATER-3, WATER-2 |
| Thunderbolt | Electric · Shot | Sparkit, Lumawool, Coilizard | ELEC-1 |
| Static Siphon | Electric · Shot (drains) | Voltergeist, Bellpaca | ELEC-1 |
| Discharge | Electric · Blast | Lumawool, Voltergeist | ELEC-3, ELEC-1 |
| Volt Rush | Electric · Dash | Sparkit | ELEC-3, ELEC-1 |
| Lance Charge | Electric · Dash | Railwarden | ELEC-3, ELEC-1 |
| Volt Cannon | Electric · Beam | Sparkit, Bellpaca | ELEC-2a |
| Rail Shot | Electric · Beam | Railwarden | E5 (done); ELEC-2b only if redone |
| Mega Beam | Beast · Beam | Slumbear, Polaroar, Pandawn, Grizzquake | BEAST-1 |
| Body Slam | Beast · Dash | Slumbear, Bellpaca, Daimochi, the three bears | COMMON-1 |
| Wool Tackle | Beast · Dash | Lumawool | BEAST-4, COMMON-1 |
| Zoomies | Beast · Dash | Smugshi | BEAST-2, COMMON-1 |
| Zoomies Max | Beast · Dash (3 hits) | Smugshogun | BEAST-2, COMMON-1 |
| Shiba Scream | Beast · Blast | Smugshi | BEAST-2 |
| Shiba Roar | Beast · Blast | Smugshogun, Daimochi | BEAST-2, COMMON-1 |
| Heavy Sigh | Beast · Blast (slows) | Mondaze | BEAST-4 |
| Snack Time | Beast · Heal | Slumbear, Daimochi, the three bears | BEAST-3, COMMON-2 |
| Blanket Nap | Beast · Heal | Smugshi, Smugshogun | BEAST-3, COMMON-2 |
| Coffee Break | Beast · Boost | Mondaze | BEAST-4, COMMON-2 |
| Smug Beam | Arcane · Beam | Smugshi | SMUG-1 |
| Supreme Smug Beam | Arcane · Beam | Smugshogun | SMUG-1 |
| Moonblast | Arcane · Shot | Cosmite, Pixibelle | FAIRY-1 |
| Fairy Wind | Arcane · Shot (5) | Pixibelle | FAIRY-1 |
| Dazzle Beam | Arcane · Beam | Pixibelle | FAIRY-2a |
| Wish | Arcane · Heal | Pixibelle, Bellpaca | FAIRY-2, COMMON-2 |
| Psybeam | Arcane · Beam (slows) | Gyroculus, Mindra | PSY-1a |
| Mind Orbs | Arcane · Shot (2, homing) | Gyroculus, Mindra | PSY-1 |
| Foresight | Arcane · Strike (late) | Mindra, Stonicface | PSY-2 |
| Calm Mind | Arcane · Boost | Gyroculus, Mindra, Stonicface | PSY-2, COMMON-2 |
| Starfall | Arcane · Strike (4) | Cosmite, Nyxdrake | DRAGON-2 |
| Dragon Pulse | Dragonkin · Beam | Nyxdrake, Maelstrisk | DRAGON-1a |
| Dragon Claw | Dragonkin · Dash | Cosmite, Nyxdrake | DRAGON-1 |
| Dragon Dance | Dragonkin · Boost | Cosmite, Nyxdrake | DRAGON-2, COMMON-2 |
| Razor Leaf | Plant · Shot (2) | Thornback | PLANT-1 |
| Seed Bomb | Plant · Strike (3) | Thornback, Pandawn | PLANT-1 |
| Solar Beam | Plant · Beam | Thornback | PLANT-2a |
| Photosynth | Plant · Heal | Thornback | PLANT-2, COMMON-2 |
| Cotton Guard | Plant · Boost | Lumawool | PLANT-3, COMMON-2 |
| Megahorn | Plant · Dash | Bugilist | BUG-1, COMMON-1 |
| Beetle Barrage | Plant · Dash (4 hits) | Bugilist | BUG-1 |
| Pin Missile | Plant · Shot (5) | Bugilist | BUG-1 |
| Ice Shard | Ice · Shot | Tidalisk, Frostling | ICE-1 |
| Frost Ray | Ice · Beam | Frostling | ICE-2a |
| Blizzard | Ice · Blast (cone) | Frostling, Polaroar | ICE-1 |
| Frost Armor | Ice · Boost | Frostling | ICE-2, COMMON-2 |
| Heavy Stomp | Earth · Blast | Slumbear, Smouldox | EARTH-1, COMMON-1 |
| Quake | Earth · Blast (big) | Slabominable, Grizzquake | EARTH-1, COMMON-1 |
| Quicksand | Earth · Strike (lingers, slows) | Slabominable | EARTH-2 |
| Mud Shot | Earth · Shot (slows) | (move pool) | EARTH-2 |
| Rock Slide | Earth · Strike (4) | Cinderox, Slabominable, Coilizard, Smouldox | EARTH-1, COMMON-1 |
| Rollout | Earth · Dash (rolls) | Slabominable, Coilizard | EARTH-1, COMMON-1 |
| Night Slash | Shade · Dash | Shadefang | DARK-1 |
| Dark Wave | Shade · Blast | Shadefang | DARK-2, DARK-1 |
| Gloom Orb | Shade · Shot | Shadefang | DARK-1 |
| Dark Pulse | Shade · Blast (ripple) | Shadefang | DARK-2 |
| Deadline Dash | Shade · Dash | Mondaze | DARK-3, COMMON-1 |
| Blank Stare | Shade · Beam (slows) | Mondaze | DARK-3 |
| Close Combat | Brawl · Dash (6 hits) | Brawlix, Daimochi | FIGHT-1 |
| Rapid Jab | Brawl · Dash | Brawlix | FIGHT-1 |
| Aura Sphere | Brawl · Shot (homing) | Brawlix | FIGHT-1 |
| Aura Cannon | Brawl · Beam | Brawlix | FIGHT-2a |
| Bulk Up | Brawl · Boost | Bugilist | FIGHT-2, COMMON-2 |
| Air Slash | Wind · Shot (3) | Galewing | WIND-1 |
| Razor Gale | Wind · Shot (boomerang) | Galewing | WIND-1 |
| Gust | Wind · Blast (cone, pushes) | Galewing | WIND-1 |
| Tornado | Wind · Strike (lingers, pulls) | Galewing | WIND-2, E2b cloud |
| Brave Dive | Wind · Dash | (move pool) | WIND-2, WIND-1 |
| Tailwind | Wind · Boost | (move pool) | WIND-2, COMMON-2 |
| Sludge Bomb | Glitch · Shot (explodes) | Venomire | GLITCH-1 |
| Acid Spray | Glitch · Shot (4) | Venomire | GLITCH-1 |
| Toxic Pool | Glitch · Strike (lingers) | Venomire | GLITCH-2, GLITCH-1 |
| Venom Jet | Glitch · Beam | Venomire | GLITCH-2a |
| Fatal Error | Glitch · Blast | (Glitched Coreatures) | GLITCH-1 |
| Shadow Ball | Phantom · Shot (homing) | Stonicface, Wispurr, Voltergeist | GHOST-1 |
| Phantom Strike | Phantom · Dash | Wispurr | GHOST-1 |
| Spirit Flames | Phantom · Strike (3) | Wispurr | GHOST-1 |
| Spectral Ray | Phantom · Beam | Stonicface, Wispurr | GHOST-2 |
| Flash Cannon | Metal · Beam | Gearhulk | STEEL-1a |
| Drone Swarm | Metal · Shot (4, homing) | Citadrone | STEEL-1 |
| Iron Slam | Metal · Dash | Gearhulk, Shellmet, Bulwarden, Garrishell | STEEL-2, COMMON-1 |
| Magnet Storm | Metal · Strike (3) | Gyroculus, Gearhulk, Citadrone | STEEL-2 |
| Iron Defense | Metal · Boost | Gearhulk, the turtle line, Magma Bastion, Citadrone | STEEL-2, COMMON-2 |
| Tower Shield | Metal · Boost | Railwarden | STEEL-2, COMMON-2 |
| **Slumbear (boss):** Belly Flop, Big Yawn, Icicle Rain, Frost Patch, Glacier Slam, Bamboo Volley, Fault Line, Rockfall, Midnight Snack, Big Sleep | | Act 1 boss | BOSS-1, ICE-2, EARTH-1/2, COMMON-1, BEAST-3 |
| **Glitched bosses:** Data Tear | | Glitched bosses | GLITCH-2 |
| **Every hit** | all 15 types | everyone | HITS-1 to HITS-4 |

**61 prompts in all** (P1, E2b and E2c were done before; since r198 every beam has its own picture, laid out like SMUG-1b). ELEC-2b is only needed if Rail Shot's E5 pictures are ever swapped for pieces. They're grouped so that a Coreature's whole move set usually needs
only one or two pictures.

## Batches (suggested order)

1. **Everyone:** COMMON-1, COMMON-2, HITS-1, HITS-2, HITS-3, HITS-4. *(done)*
2. **The starters' lines** (seen in every run): SMUG-1b, SMUG-1c, BEAST-2, BEAST-3 *(done)*, then FIRE-2a, FIRE-2b,
   FIRE-3, WATER-1a, WATER-1b, WATER-2, WATER-3, ICE-1, ICE-2a, ICE-2, EARTH-1.
3. **Common wild Coreatures:** ELEC-1, ELEC-2a, ELEC-3, PLANT-1, PLANT-2a, PLANT-2, PLANT-3, BEAST-1, BEAST-4, EARTH-2,
   FAIRY-1, FAIRY-2a, FAIRY-2.
4. **The rest:** DARK-1, DARK-2, DARK-3, FIGHT-1, FIGHT-2a, FIGHT-2, WIND-1, WIND-2, GLITCH-1, GLITCH-2a, GLITCH-2,
   GHOST-1, GHOST-2, STEEL-1a, STEEL-1, STEEL-2, PSY-1a, PSY-1, PSY-2, DRAGON-1a, DRAGON-1, DRAGON-2, BUG-1, FIRE-4.
5. **The boss:** BOSS-1.

---

## Batch 1: pieces every attack shares

### COMMON-1 · dust, ground hits and speed

Used by every dash (dust kicked up, speed lines, the thud on impact), Body Slam, Heavy Stomp, Quake, Rock Slide,
Rollout, Iron Slam and Belly Flop. Plain tan dust and white so any type can use them.
- **Body Slam:** a launch puff of dust, speed lines streaming back, then a heavy thud: the comic star, a flat
  shockwave ring spreading along the ground, pebbles and dust puffs thrown out round the target.

> A sprite sheet of separate dust and impact effect pieces for an action game, laid out in exactly 4 rows with lots
> of empty space between every piece. Row 1: a puff of tan dust in 4 stages, a small dense puff, then billowing
> bigger, then thinning, then a few last wisps. Row 2: three small pebbles of different shapes in grey-brown stone,
> then one flat oval shockwave ring seen from slightly above (a thin pale tan and white ring on the ground, empty in
> the middle), then one flat star of cracks in the ground seen from slightly above (dark jagged lines spreading from a
> point). Row 3: a white comic impact star in 3 frames, small, then big with sharp points, then breaking into pieces,
> then two white speed lines (long thin streaks, thicker at one end, pointing right). Row 4: a small white four-pointed
> sparkle, a bigger white four-pointed sparkle, and a curved white wind streak. Every piece complete and fully inside
> its own space with a wide margin of empty background all round it, nothing touching another piece or the edges of
> the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background
> everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline,
> light from the top left, limited palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

### COMMON-2 · boosts and heals

Every boost shows what it raises (an arrow per stat), and every heal shows green pluses and sparkles; the
attack's own sheet adds its signature on top (a coffee cup, a cookie, a sun).
- **Arrows:** rise up round the Coreature from its feet, in the colour of the stat raised (red-orange attack, blue
  defence, green speed), a few at a time.
- **Heal:** green pluses float up, sparkles twinkle, a golden ring of light rises up its body.
- **Aura flame:** a pale flickering aura round the Coreature while a boost is fresh (the far side behind it, the near
  side in front).

> A sprite sheet of separate boost and healing effect pieces for an action game, laid out in exactly 4 rows with lots
> of empty space between every piece. Row 1: three upward-pointing chevron arrows, one red-orange, one bright blue,
> one bright green, each glowing with a white edge. Row 2: a big green plus sign glowing with a pale edge, a small
> green plus sign, a small golden four-pointed sparkle and a small white four-pointed sparkle. Row 3: a flat oval ring
> of golden light seen from slightly above (thin, glowing, empty in the middle), and a pale golden aura flame in 3
> frames of a loop flickering upward (a soft tongue of light, as tall as it is wide, each frame a small step from the
> last). Row 4: a small pale blue hexagon of light (a shield cell), a small red-orange burst of power lines, and a
> small green swoosh of speed. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### HITS-1 to HITS-4 · what every hit looks like, per type

Every hit plays its type's burst on the side the hit came from (so the target stays visible), with its bits flying
off. Bigger hits play it bigger; super-effective hits add the white comic star from COMMON-1. These replace the I1
impact frames. Four types per picture, one row each.

**HITS-1** (Fire, Water, Electric, Ice):

> A sprite sheet of separate hit effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece, one row per kind of hit. Row 1, a fire hit: a burst of flame in 3 frames (small, big,
> breaking into tongues of flame), then three small flying embers and flame flecks. Row 2, a water hit: a splash in 3
> frames (a small burst, a big crown of water, falling apart into drops), then three water droplets of different
> sizes. Row 3, an electric hit: a crackling burst of yellow and white lightning in 3 frames (small, big with
> forked bolts, breaking apart), then three small zigzag sparks. Row 4, an ice hit: a burst of shattering ice in 3
> frames (small, big star of ice crystals, breaking apart), then three small ice shards. Every piece complete and
> fully inside its own space with a wide margin of empty background all round it, nothing touching another piece or
> the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain
> background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel
> outline, light from the top left, limited bright palette with hard-edged shading, no creature or character, plain
> dark navy background, no text, no labels

**HITS-2** (Plant, Earth, Wind, Metal):

> A sprite sheet of separate hit effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece, one row per kind of hit. Row 1, a plant hit: a burst of green leaves in 3 frames (small,
> big, scattering), then three single green leaves of different shapes. Row 2, an earth hit: a burst of rock chips
> and brown dust in 3 frames (small, big, breaking apart), then three small brown rock chips. Row 3, a wind hit: a
> burst of pale blue-white wind crescents in 3 frames (small, big swirling slashes, fading curls), then three small
> curled wind streaks. Row 4, a metal hit: a white and steel-grey clang burst in 3 frames (small, big sharp star with
> sparks, breaking apart), then three small orange-white metal sparks. Every piece complete and fully inside its own
> space with a wide margin of empty background all round it, nothing touching another piece or the edges of the
> picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere.
> 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from
> the top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy background,
> no text, no labels

**HITS-3** (Arcane, Shade, Phantom, Dragonkin):

> A sprite sheet of separate hit effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece, one row per kind of hit. Row 1, a magic hit: a burst of pink and white light in 3 frames
> (small, a big star with a ring of sparkles, fading into sparkles), then three small pink sparkles. Row 2, a darkness
> hit: a jagged burst of purple-black shadow in 3 frames (small, big with spiky points, dissolving into wisps), then
> three small dark wisps. Row 3, a ghost hit: a burst of violet spirit flame in 3 frames (small, big with wispy
> curling tongues, fading into wisps), then three small violet will-o'-wisps. Row 4, a dragon hit: a burst of deep
> indigo and violet energy full of tiny white stars in 3 frames (small, big with a pink and teal glow, breaking into
> stardust), then three small silver dragon scales. Every piece complete and fully inside its own space with a wide
> margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut
> off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual
> effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

**HITS-4** (Beast, Brawl, Glitch, and a critical hit):

> A sprite sheet of separate hit effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece, one row per kind of hit. Row 1, a wild beast hit: an orange and yellow burst with three
> claw-like streaks in 3 frames (small, big, fading), then three small orange star flecks. Row 2, a punch hit: a
> red-orange shockwave burst in 3 frames (a small ring, a big burst with motion lines, fading), then three small
> red-orange flecks. Row 3, a corrupted data hit: a burst of broken magenta and cyan square pixel blocks in 3 frames
> (small, big and scattered like a glitch, breaking into loose blocks), then three small loose magenta and cyan
> blocks. Row 4, a critical hit: a big bright white and yellow starburst in 3 frames (small, huge with long sharp
> rays, fading), then three small white sparkles. Every piece complete and fully inside its own space with a wide
> margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut
> off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual
> effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

---

## Beast and Smugshi's line

### SMUG-1b · Smug Beam and Supreme Smug Beam, take 2 (r193)

The owner's review of SMUG-1 in the game: the first was droopy, both had the tip in the wrong place, and both looked
plainer than the originals. The droop is gone and the tip now only leads while the beam shoots out, with an impact on
the target; this take gives the beams a body with something going on inside, a proper muzzle and a proper impact.
The petals and sparkles from SMUG-1 stay. Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a soft pink and gold energy beam with a creamy
> white core and twisting ribbons of brighter pink light spiralling along inside it with small gold sparkles, the same
> thickness all along, cut off straight at both ends so copies placed end to end join into one long beam, in 4 frames
> of a loop as the ribbons twist forward, each a small step from the last. Row 2: a thin straight horizontal strand of
> bright white-pink light with a jagged shimmering edge, the same thickness all along, cut off straight at both ends,
> in 4 frames of a loop (the beam's bright core). Row 3: a burst of pink and gold light at the mouth of a beam pointing
> right (a round flare with short rays and a ring) in 3 frames of a loop as it pulses, then a smug little face symbol
> made of glowing pink light (two half-closed eyes and a lopsided smirk) in 1 frame. Row 4: a pink and gold impact
> burst where a beam hits something, pointing left toward where the beam comes from (a splash of light with sparkles
> and short rays), in 4 frames of a loop. Every piece complete and fully inside its own space with a wide margin of
> empty background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No
> boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### SMUG-1c · Supreme Smug Beam, take 2 (Smugshogun)

The samurai upgrade of SMUG-1b: thicker, straighter and prouder, white-hot with gold and crimson, cherry blossom
petals caught in the light. The petals and sparkles from SMUG-1 stay. Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a thick white-hot energy beam with bright gold
> edges and a thin crimson outline, with gold ribbons spiralling along inside it and small pale pink cherry blossom
> petals caught in the light, the same thickness all along, cut off straight at both ends so copies placed end to end
> join into one long beam, in 4 frames of a loop as the ribbons twist forward, each a small step from the last. Row 2:
> a thin straight horizontal strand of blazing white light with a pale gold shimmering edge, the same thickness all
> along, cut off straight at both ends, in 4 frames of a loop (the beam's bright core). Row 3: a burst of gold and
> crimson light at the mouth of a beam pointing right (a round flare with sharp golden rays like a rising sun and a
> crimson ring) in 4 frames of a loop as it pulses. Row 4: a gold and crimson impact burst where a beam hits
> something, pointing left toward where the beam comes from (a splash of white and gold light with sharp rays, sparks
> and a few cherry blossom petals flying), in 4 frames of a loop. Every piece complete and fully inside its own space
> with a wide margin of empty background all round it, nothing touching another piece or the edges of the picture,
> nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit
> pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top
> left, limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no
> text, no labels

### SMUG-1 · Smug Beam and Supreme Smug Beam (Smugshi, Smugshogun) (first take, in the game since r192)

Smugshi's signature should look like nothing else: a **lazy, smug beam** that droops and wobbles like it can't be
bothered, with a smirking glow at its tip. Smugshogun's Supreme version is the samurai upgrade: gold-edged, straighter
and prouder, with cherry blossom petals.
- **Smug Beam:** a soft pink-gold glow gathers at Smugshi's mouth; the beam unrolls lazily, its sections bobbing up and
  down a little out of step (a droopy wave); the smirk shape rides at the far end; a few sparkles drift off it.
- **Supreme Smug Beam:** the same, but straight and thicker, gold-edged sections, and cherry blossom petals swirling
  along it and bursting out where it hits.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a soft pink and gold energy beam with a creamy
> white core, the same thickness all along, cut off straight at both ends so copies placed end to end join into one
> long beam, in 4 frames of a loop as its glow ripples, each a small step from the last. Row 2: the glowing tip of
> the beam shaped like a big smug lopsided smirk made of pink and gold light, pointing right, in 3 frames of a loop as
> it shimmers, then a small round glow of pink and gold light in 3 frames growing brighter (the beam charging). Row 3:
> a straight horizontal section of a thicker beam of white-hot light with bright gold edges and a thin crimson
> outline, the same thickness all along, cut off straight at both ends so copies join end to end, in 4 frames of a
> loop as its light pulses. Row 4: three cherry blossom petals of different shapes in pale pink, and two small gold
> four-pointed sparkles. Every piece complete and fully inside its own space with a wide margin of empty background
> all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames
> or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

### BEAST-2 · Zoomies, Zoomies Max, Shiba Scream, Shiba Roar (Smugshi, Smugshogun, Daimochi)

- **Zoomies:** Smugshi tears off in a blur: afterimages of Smugshi (code), dust kicked up at every turn (COMMON-1),
  curved speed lines, and little gold stars spinning off; the hit pops a star.
- **Zoomies Max:** the same with three hits, more stars, and a gold zigzag streak marking its path.
- **Shiba Scream:** the famous overreaction. Shout lines burst out round its head, sound-wave arcs roll outward in
  rings (the far half behind it, the near half in front), and the screen shakes; the comic shout bubble pops above it.
- **Shiba Roar:** the same, louder: bigger and more arcs, a ground shockwave (COMMON-1) and dust.

> A sprite sheet of separate cartoon effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a small spinning gold star in 3 frames of a loop (turning, each a small step from
> the last), then a bigger spinning gold star in 3 frames of a loop. Row 2: two curved cartoon speed lines in white
> and pale orange (one short, one long), and a gold zigzag streak like a scribbled path. Row 3: a curved orange and
> yellow sound wave arc (a thick crescent band like a ripple of sound, opening to the right), in 3 sizes from small to
> big. Row 4: a spiky comic shout bubble shape in orange and white with nothing inside it, in 3 frames (popping open,
> full size, bursting apart), then a set of short jagged shout lines radiating outward. Every piece complete and fully
> inside its own space with a wide margin of empty background all round it, nothing touching another piece or the
> edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background
> everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline,
> light from the top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

### BEAST-3 · Snack Time, Blanket Nap (and the boss's Midnight Snack and Big Sleep)

- **Snack Time:** a cookie pops into the Coreature's paws and gets eaten in three bites (each bite a frame), crumbs
  falling and bouncing; green pluses and sparkles rise (COMMON-2). "nom" stays as the game's own text.
- **Blanket Nap:** a patchwork blanket floats down and settles over it (drawn in front of its lower body, so its head
  peeks out), sleepy Z's rise and drift, a little moon and stars twinkle above; then pluses (COMMON-2).
- **Slumbear's Midnight Snack** uses the cookie and crumbs (bigger); **Big Sleep** uses the blanket, Z's and moon.

> A sprite sheet of separate cozy cartoon effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a round golden-brown cookie with chocolate chips in 4 stages of being eaten,
> whole, one bite missing, two bites missing, a last small piece. Row 2: three small cookie crumbs of different
> shapes, and a small glass of milk. Row 3: a cozy patchwork blanket in red, mustard and teal squares with a white
> stitched edge, seen from the front, in 3 frames: floating down flat and wide, settling and drooping, tucked in with
> soft folds. Row 4: three sleepy capital Z letters in pale blue-white of different sizes (small, medium, big), a small
> yellow crescent moon, and a small twinkling star. Every piece complete and fully inside its own space with a wide
> margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut
> off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual
> effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no other text, no
> labels

### BEAST-1 · Mega Beam (Slumbear and the three bears)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a huge thick energy beam with a white-hot
> center, golden yellow body and orange edges, with rings of force rippling along inside it, the same thickness all
> along, cut off straight at both ends so copies placed end to end join into one long beam, in 4 frames of a loop as
> the ripples of force move forward, each a small step from the last. Row 2: a thin straight horizontal strand of
> blinding white-gold light with a shimmering edge, the same thickness all along, cut off straight at both ends, in
> 4 frames of a loop (the beam's bright core). Row 3: a big round golden energy flare with short rays at the mouth
> of a beam pointing right, in 4 frames of a loop as it pulses. Row 4: a huge blast of golden light spraying outward
> with energy specks where a beam hits something, pointing left toward where the beam comes from, in 4 frames of a
> loop. Every piece complete and fully inside its own space with a wide margin of empty background all round it,
> nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders
> behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game,
> chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

### BEAST-4 · Heavy Sigh, Coffee Break (Mondaze) and Wool Tackle (Lumawool)

- **Heavy Sigh:** Mondaze lets out an enormous sigh: a grey-lavender sigh cloud rolls out of it and spreads across
  the ground in all directions (puffs, near ones in front), droopy curls drifting, a sweat drop; anyone caught is
  slowed (the puffs linger a moment round them).
- **Coffee Break:** a steaming mug appears in its hands and it sips (2 frames), steam curls rise, coffee beans pop
  out, then jittery zigzag lines and the speed and attack arrows (COMMON-2).
- **Wool Tackle:** Lumawool (a storm-cloud ram) charges wrapped in its thundercloud wool: wool puffs stream back off
  it, sparks crackle in the wool, and the hit bursts into a poof of wool and sparks.

> A sprite sheet of separate cartoon effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a sad grey-lavender sigh cloud in 4 stages, a small puff, billowing bigger and
> drooping, spreading flat, fading into wisps. Row 2: a white coffee mug with brown coffee seen from the side in 2
> frames (upright, tilted for a sip), then a curl of white steam in 3 frames of a loop rising, each a small step from
> the last. Row 3: a fluffy puff of dark grey storm-cloud wool with a lighter grey top, in 3 different shapes and
> sizes, then two small yellow zigzag sparks. Row 4: two roasted coffee beans, a jittery yellow zigzag line, a droopy
> curled pale lavender wind line, and a light blue sweat drop. Every piece complete and fully inside its own space
> with a wide margin of empty background all round it, nothing touching another piece or the edges of the picture,
> nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit
> pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top
> left, limited palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

---

## Fire (Cinderox, Infernox, Smouldox, Magma Bastion)

FIRE-1 is P1 (done): flame tongue, rocks, embers, smoke, crack ring, lava pool, flash.

- **Flamethrower:** a burst of flame at the mouth, then a roaring jet of fire built from twisting sections, billowing
  into a cloud of flame where it ends or hits, embers and smoke (P1) streaming off the top.
- **Inferno Beam:** a white-hot beam with ribbons of flame spiralling round it, a blinding mouth flash, a fiery blast
  where it hits; embers (P1).
- **Fire Blast:** a fireball with a swirling white-hot core and a flame tail, embers shedding behind it; it explodes
  into a big fireball (near half in front of the target), with P1 rocks, embers and smoke thrown out.
- **Flame Wheel:** four flame crescents spin round the Coreature as it rolls forward (the ones passing behind it
  drawn behind), flame tongues (P1) trailing, a scorched track left on the ground that fades.
- **Blaze Rush:** wind-up: P1 flame tongues burst up all round it until it's engulfed (far ones behind, near ones in
  front); then it charges as a comet, the comet head wrapped round its front, flames and embers streaming back; the
  hit explodes like Fire Blast.
- **Steam Eruption** (three spots that linger): each spot bubbles, then a geyser of scalding steam shoots up and keeps
  venting while it lingers, steam puffs rolling off, droplets falling.
- **Magma Wave:** keeps its F8b waves (already pieces along the cone), adding lava blobs thrown ahead, splashes where
  they land and cooling crust.

### FIRE-2a · Flamethrower (Cinderox)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a roaring jet of fire, twisting orange and
> yellow flames curling around each other along it with a bright yellow-white heart and deep red edges, the same
> thickness all along, cut off straight at both ends so copies placed end to end join into one long beam, in 4
> frames of a loop as the flames twist and roll forward, each a small step from the last. Row 2: a thin straight
> horizontal strand of blazing yellow-white flame with a flickering edge, the same thickness all along, cut off
> straight at both ends, in 4 frames of a loop (the beam's bright core). Row 3: a burst of flame bursting out (a
> round flare of orange and yellow fire with licking tongues) at the mouth of a beam pointing right, in 4 frames of
> a loop as it pulses. Row 4: a billowing cloud of fire with curling tongues and a few embers where a beam hits
> something, pointing left toward where the beam comes from, in 4 frames of a loop. Every piece complete and fully
> inside its own space with a wide margin of empty background all round it, nothing touching another piece or the
> edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background
> everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline,
> light from the top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

### FIRE-2b · Inferno Beam (Infernox)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a white-hot beam of fire with bright yellow
> edges and orange-red ribbons of flame spiralling around it with small embers, the same thickness all along, cut
> off straight at both ends so copies placed end to end join into one long beam, in 4 frames of a loop as the
> ribbons spiral forward, each a small step from the last. Row 2: a thin straight horizontal strand of blinding
> white light with a pale yellow shimmering edge, the same thickness all along, cut off straight at both ends, in 4
> frames of a loop (the beam's bright core). Row 3: a blinding white and yellow flash with sharp rays and a ring of
> flame at the mouth of a beam pointing right, in 4 frames of a loop as it pulses. Row 4: a fiery blast of white,
> yellow and orange flame with embers flying where a beam hits something, pointing left toward where the beam comes
> from, in 4 frames of a loop. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### FIRE-3 · Fire Blast, Flame Wheel, Blaze Rush

> A sprite sheet of separate fire effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a fireball flying to the right with a swirling white-hot core and a tail of
> orange and red flame streaming behind it, in 4 frames of a loop, each a small step from the last. Row 2: a big
> fireball explosion in 4 frames, a bright flash, a big round burst of flame, rolling fire with dark smoke edges,
> breaking apart. Row 3: a curved crescent of flame (a quarter of a circle, like part of a wheel of fire, flames
> licking off its outer edge) in 3 frames of a loop, then a short scorched streak on the ground seen from slightly
> above (a flat dark burnt mark with a few glowing embers). Row 4: the head of a blazing comet pointing right (a
> rounded cap of white-hot and yellow flame curving back into orange and red tongues) in 3 frames of a loop. Every
> piece complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a
> dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### FIRE-4 · Steam Eruption and Magma Wave's lava (Magma Bastion)

> A sprite sheet of separate steam and lava effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a bubbling vent in the ground seen from slightly above (a flat dark oval
> crack with glowing orange inside and white bubbles) in 2 frames, then two scalding water droplets. Row 2: a tall
> geyser of white steam shooting straight up with orange glowing heat at its base, in 3 frames of a loop, each a
> small step from the last. Row 3: a puff of white steam in 4 stages, a small dense puff, billowing bigger, thinning,
> a few last wisps. Row 4: a glob of molten lava in 2 shapes, a lava splash in 3 frames (a small splat, a crown of
> lava, cooling into a dark crusted puddle). Every piece complete and fully inside its own space with a wide margin of
> empty background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No
> boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

---

## Water (Tidalisk, Maelstrisk, the turtle line, Magma Bastion)

- **Hydro Cannon:** a ball of churning water swells at the mouth; a torrent built from sections with foam on its
  edges, droplets spraying off; a big splash at the far end.
- **Tidal Cannon:** bigger: the torrent has wave crests curling along it, and its splash throws foam.
- **Spout Shot, Cuff Cannon, Twin Cannon:** a water slug flies with a short spray behind; splashes on hit (Twin Cannon
  fires two, one from each cannon).
- **Bubble Spray:** five wobbly bubbles drift in a fan, each popping where it hits.
- **Aqua Jet:** the Coreature shoots forward wrapped in a streamer of water (the part behind it drawn behind), spray
  and droplets streaming back, a splash at the hit.
- **Geyser Vent:** the ground bubbles in a ring round it (FIRE-4 vents), then geysers shoot up round the ring (far
  ones behind, near ones in front), scalding steam (FIRE-4) and droplets.
- **Whirlpool:** a swirl spreads flat across the ground round the user (the centre swirl seen from above), curved
  arcs of water race round it (the arcs passing behind the user drawn behind), foam flecks spinning inward with
  whatever gets pulled.
- **Maelstrom:** the same, bigger and wilder, with glowing aqua rune stones from Maelstrisk's coils whirling in it.

### WATER-1a · Hydro Cannon (Tidalisk, the turtle line, Railwarden, Citadrone)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a powerful torrent of deep blue water with a
> pale blue center, ripples running along inside it and white foam curling along its top and bottom edges, the same
> thickness all along, cut off straight at both ends so copies placed end to end join into one long beam, in 4
> frames of a loop as the ripples and foam rush forward, each a small step from the last. Row 2: a thin straight
> horizontal strand of rushing pale blue-white water with a foamy edge, the same thickness all along, cut off
> straight at both ends, in 4 frames of a loop (the beam's bright core). Row 3: a ball of churning water bursting
> out (a round splash of blue water and white spray) at the mouth of a beam pointing right, in 4 frames of a loop as
> it pulses. Row 4: a big splash of water and white spray bursting outward with droplets flying where a beam hits
> something, pointing left toward where the beam comes from, in 4 frames of a loop. Every piece complete and fully
> inside its own space with a wide margin of empty background all round it, nothing touching another piece or the
> edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background
> everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline,
> light from the top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

### WATER-1b · Tidal Cannon (Maelstrisk)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a huge tidal torrent of deep blue and teal
> water with white wave crests curling along inside it and small glowing aqua runes swept along in the current, the
> same thickness all along, cut off straight at both ends so copies placed end to end join into one long beam, in 4
> frames of a loop as the wave crests roll forward, each a small step from the last. Row 2: a thin straight
> horizontal strand of bright aqua-white water with a foamy edge, the same thickness all along, cut off straight at
> both ends, in 4 frames of a loop (the beam's bright core). Row 3: a whirl of churning water bursting out (a round
> splash with a swirl and spray) at the mouth of a beam pointing right, in 4 frames of a loop as it pulses. Row 4: a
> huge crashing wave of water and white foam bursting outward with spray where a beam hits something, pointing left
> toward where the beam comes from, in 4 frames of a loop. Every piece complete and fully inside its own space with
> a wide margin of empty background all round it, nothing touching another piece or the edges of the picture,
> nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit
> pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top
> left, limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no
> text, no labels

### WATER-2 · water shots, bubbles, splashes and drops

> A sprite sheet of separate water effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a slug of water flying to the right (a rounded nose of blue water with a short
> spray trailing behind) in 4 frames of a loop, each a small step from the last. Row 2: a water splash in 4 frames, a
> small burst, a crown of water, falling drops, a puddle ring. Row 3: a shiny see-through bubble with a white shine,
> in 3 frames of a loop as it wobbles, then the bubble popping in 3 frames. Row 4: three water droplets of different
> sizes, and a small puff of white spray. Every piece complete and fully inside its own space with a wide margin of
> empty background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No
> boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### WATER-3 · Aqua Jet, Geyser Vent, Whirlpool, Maelstrom

> A sprite sheet of separate water effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a streamer of water curving back from a pointed front (like water wrapped round
> something rushing to the right) in 3 frames of a loop, then a tall geyser of water shooting up from the ground with
> white foam at its top in 3 frames of a loop. Row 2: a curved arc of rushing blue water with white foam on its outer
> edge (a part of a whirlpool, like a quarter of a circle), in 3 different lengths. Row 3: a whirlpool seen from
> slightly above, a flat oval swirl of dark and light blue water spiralling into a dark centre, in 3 frames of a loop
> as it turns, each a small step from the last. Row 4: two small flecks of white foam, and two carved stone fragments
> with glowing aqua runes. Every piece complete and fully inside its own space with a wide margin of empty background
> all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames
> or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

---

## Electric (Sparkit, Lumawool, Voltergeist, Coilizard, Bellpaca, Railwarden)

Thunder is done (code clouds, E2b, E2c).
- **Thunderbolt:** a crackling orb of lightning flies with zigzag bolts flicking off it; on hit, a spark star and bolts
  splitting outward (HITS-1).
- **Static Siphon:** a fuzzy ball of static wobbles over; on hit it fizzes and green-yellow sparks stream back along a
  curve to the user (the drain).
- **Discharge:** sparks gather in a ring round the user, then crackling arcs jump out all round it (far ones behind,
  near ones in front), a ring of electricity spreads across the floor, sparks everywhere.
- **Volt Rush:** the Coreature charges with a spearhead of lightning in front, bolts crackling round its body, sparks
  shedding back.
- **Lance Charge:** Railwarden charges behind a lance of blue light, a trail of blue sparks, the hit flashes.
- **Volt Cannon:** a beam of crackling bolts twisted round a white-hot core, the far end bursting in sparks.
- **Rail Shot:** charging rings spin at the muzzle; a perfectly straight thin beam with rings of energy along it; a
  cross-shaped flash where it hits; then a glowing trail dissolving into sparks.

### ELEC-1 · bolts, sparks, Thunderbolt, Static Siphon

> A sprite sheet of separate electric effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: three small jagged lightning bolts of different shapes in bright yellow with a
> white core and a pale blue glow. Row 2: a crackling electric spark star in 3 frames (small, big with forked bolts,
> fading), then two tiny yellow spark dots. Row 3: a crackling ball of lightning with a white-hot core, flying to the
> right with short zigzag bolts flicking off it, in 4 frames of a loop, each a small step from the last. Row 4: a
> fuzzy ball of pale yellow and white static with tiny arcs, in 3 frames of a loop as it wobbles, then two small
> green-yellow sparks. Every piece complete and fully inside its own space with a wide margin of empty background all
> round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or
> borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

### ELEC-2a · Volt Cannon (Sparkit, Bellpaca)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a beam of electricity with yellow lightning
> bolts twisting around a white-hot center and a pale blue glow, with soft rounded glowing edges (not a rectangle
> with a border), the same thickness all along, its left and right ends simply cut off straight so copies placed end
> to end join into one long beam, in 4 frames of a loop as the bolts crackle and twist forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of white-hot electricity with a jagged flickering edge,
> the same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core).
> Row 3: a crackling orb of lightning with forked bolts jumping off it, a round burst on its own with nothing
> attached to it (no beam, no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a burst
> of sparks and forked lightning bolts, a burst on its own with nothing attached to it (no beam, no stream, no
> arrow), spraying outward to the right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads
> anywhere, and no box, frame or border around any piece. Every piece complete and fully inside its own space with a
> wide margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing
> cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art
> visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

### ELEC-2b · Rail Shot (Railwarden)

Rail Shot already plays the E5 pictures; this is only needed if those are swapped for pieces later.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a perfectly straight thin beam of white-blue
> light with small spinning rings of cyan energy around it, with soft rounded glowing edges (not a rectangle with a
> border), the same thickness all along, its left and right ends simply cut off straight so copies placed end to end
> join into one long beam, in 4 frames of a loop as the rings slide forward, each a small step from the last. Row 2:
> a thin straight horizontal strand of blazing white light with a cyan shimmering edge, the same thickness all
> along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3: rings of electric
> blue light spinning with a white flash, a round burst on its own with nothing attached to it (no beam, no stream,
> no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a cross-shaped white and cyan flash with
> sparks, a burst on its own with nothing attached to it (no beam, no stream, no arrow), spraying outward to the
> right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame or
> border around any piece. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### ELEC-3 · Discharge, Volt Rush, Lance Charge

> A sprite sheet of separate electric effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a crackling arc of lightning jumping up from the ground and back down (an
> upside-down U of jagged yellow and white bolt), in 3 different shapes. Row 2: a ring of crackling electricity on the
> ground seen from slightly above (a flat oval of jagged yellow and pale blue light, empty in the middle), in 2 frames
> of a loop. Row 3: a spearhead of lightning pointing right (a sharp arrowhead of white-hot and yellow electricity
> with bolts crackling off its edges) in 3 frames of a loop, each a small step from the last. Row 4: a long lance of
> bright blue and white light pointing right (a sharp tip and a glowing shaft) in 3 frames of a loop, then a small
> scorch mark on the ground seen from slightly above. Every piece complete and fully inside its own space with a wide
> margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut
> off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual
> effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

---

## Plant (Thornback, Pandawn, Lumawool) and bugs (Bugilist)

- **Razor Leaf:** two sharp leaves spin through the air, leaf bits shedding; they burst into leaves on hit.
- **Seed Bomb:** three seed pods drop from above (a shadow grows under each), land and burst into leaves and pollen.
- **Solar Beam:** a long charge: light gathers into a little sun at the mouth while sun-rays shaft down onto the user;
  then a broad golden-green beam of sunlight with leaves glinting in it, bursting where it hits.
- **Photosynth:** a sun appears above and shines; a column of sunlight pours down onto the user; leaves and green
  pluses (COMMON-2) rise.
- **Cotton Guard:** cotton puffs pop out all over Lumawool and fluff up into a cotton shell (the ones behind drawn
  behind), then the defence arrows (COMMON-2).
- **Megahorn:** the Coreature charges behind a horn-shaped lance of green light; chitin shards fly on hit.
- **Beetle Barrage:** four rapid hits, each a green X-shaped strike flash and chitin shards.
- **Pin Missile:** five needle-missiles fly in a spread, puffing exhaust, each popping on hit.

### PLANT-1 · Razor Leaf and Seed Bomb

> A sprite sheet of separate plant effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a sharp green leaf with a bright edge spinning as it flies to the right, in 4
> frames of a loop, each a small step from the last. Row 2: three small green leaves of different shapes and two
> small pale yellow pollen puffs. Row 3: a round green seed pod with a darker stripe in 2 frames (falling, about to
> burst), then the seed pod bursting into leaves and pollen in 4 frames. Row 4: a flat oval shadow on the ground seen
> from slightly above (dark, soft-edged), and a small tuft of torn grass. Every piece complete and fully inside its
> own space with a wide margin of empty background all round it, nothing touching another piece or the edges of the
> picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere.
> 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the
> top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no
> text, no labels

### PLANT-2a · Solar Beam (Thornback)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a broad beam of sunlight with a white-hot
> center, golden yellow body and soft green edges, with small leaves glinting and swirling inside it, the same
> thickness all along, cut off straight at both ends so copies placed end to end join into one long beam, in 4
> frames of a loop as the leaves swirl forward, each a small step from the last. Row 2: a thin straight horizontal
> strand of blazing white-gold sunlight with a shimmering edge, the same thickness all along, cut off straight at
> both ends, in 4 frames of a loop (the beam's bright core). Row 3: a small bright sun with rays (sunlight
> gathering) at the mouth of a beam pointing right, in 4 frames of a loop as it pulses. Row 4: a burst of golden-
> green light with leaves and sparkles flying where a beam hits something, pointing left toward where the beam comes
> from, in 4 frames of a loop. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### PLANT-2 · Photosynth (Thornback)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 3 rows with lots of empty space
> between every piece. Row 1: a shining sun with pointed rays, in 4 frames of a loop as the rays turn, each a small
> step from the last. Row 2: a tall column of warm golden sunlight shining straight down, in 3 frames of a loop as
> it shimmers. Row 3: two small green leaves glowing at the edges, and two small golden sparkles. Every piece
> complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a
> dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### PLANT-3 · Cotton Guard

> A sprite sheet of separate cotton effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a fluffy white cotton puff in 3 frames, popping out small, fluffing up, full and
> round. Row 2: three fluffy white cotton balls of different sizes and shapes with soft pale grey shading. Row 3: a
> wisp of cotton fluff floating, in 2 shapes, and a small cotton seed with a tuft. Row 4: a soft round shell of
> fluffy cotton seen from the front with an empty middle (like a ring of cotton puffs), in 2 frames, settling. Every
> piece complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a
> dark 1-pixel outline, light from the top left, limited palette with hard-edged shading, no creature or character,
> plain dark navy background, no text, no labels

### BUG-1 · Megahorn, Beetle Barrage, Pin Missile

> A sprite sheet of separate bug effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a long horn-shaped lance of bright lime-green light pointing right (curved like a
> beetle's horn, a sharp glowing tip) in 3 frames of a loop, each a small step from the last. Row 2: a lime-green
> X-shaped strike flash in 3 frames (small, big, fading), then three small shiny green chitin shards. Row 3: a small
> needle-shaped missile flying to the right (a sharp silver tip, a green body, little fins) in 2 frames of a loop,
> then two small puffs of pale exhaust. Row 4: a small lime-green and white popping burst in 3 frames. Every piece
> complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a
> dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

---

## Ice (Frostling, Tidalisk, Polaroar)

- **Ice Shard:** a spinning crystal flies fast, frost glittering behind; it shatters on hit (HITS-1).
- **Frost Ray:** a pale blue ray with ice crystals forming along it, frost mist at the mouth, a burst of ice where it
  hits.
- **Blizzard:** a cone of snow: snowflakes and snow puffs blow out of the mouth across the wedge, ice chunks tumbling
  in it, frost mist hanging behind.
- **Frost Armor:** ice crystal plates grow over the Coreature one by one (front ones in front, back ones behind),
  frost mist, then the defence arrows (COMMON-2).

### ICE-1 · Ice Shard and Blizzard

> A sprite sheet of separate ice effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a sharp ice crystal shard flying to the right, pale blue and white with a bright
> glint, in 3 frames of a loop as it spins, each a small step from the last. Row 2: a crystal shattering into pieces
> in 4 frames. Row 3: three snowflakes of different shapes and sizes, white with a pale blue edge, and a small chunk of
> ice. Row 4: a puff of cold white frost mist with a pale blue edge in 3 stages, small, billowing, fading. Every piece
> complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a
> dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### ICE-2a · Frost Ray (Frostling)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a freezing ray of pale blue light with a white
> center and small ice crystals forming and spinning inside it, with soft rounded glowing edges (not a rectangle
> with a border), the same thickness all along, its left and right ends simply cut off straight so copies placed end
> to end join into one long beam, in 4 frames of a loop as the crystals form and drift forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of icy white light with a sparkling frosty edge, the same
> thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3: a
> swirl of frost mist with snowflakes, a round burst on its own with nothing attached to it (no beam, no stream, no
> arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a burst of ice crystals and frost, a burst on
> its own with nothing attached to it (no beam, no stream, no arrow), spraying outward to the right as if hit from
> the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame or border around any
> piece. Every piece complete and fully inside its own space with a wide margin of empty background all round it,
> nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders
> behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game,
> chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

### ICE-2 · Frost Armor (and the boss's frost and glacier)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 3 rows with lots of empty space
> between every piece. Row 1: three ice crystal armour plates of different shapes, flat faceted slabs of clear pale
> blue ice with white glints. Row 2: a patch of frost on the ground seen from slightly above (a flat oval of white
> frost and pale blue ice crystals) in 2 frames as it glitters, then a jagged ice spike bursting up from the ground
> in 3 frames (cracking out, tall, shattering). Row 3: a puff of cold white frost mist with a pale blue edge in 3
> stages, small, billowing, fading. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

---

## Earth (Slabominable, Grizzquake, Coilizard, Smouldox, Cinderox, Infernox, Slumbear)

- **Heavy Stomp:** the ground cracks under its foot (COMMON-1 crack star), a shockwave ring spreads, rock chips and
  dust puffs thrown up all round (near ones in front).
- **Quake:** bigger: rock spikes burst up from the ground in a wide ring round it (far ones behind, near in front),
  cracks spread outward, dust everywhere, the screen shakes.
- **Rock Slide:** four boulders drop from above onto spots (a shadow grows under each), smashing into rock chips and
  dust.
- **Rollout:** the Coreature tumbles forward (code rolls the sprite), a trail of rubble and dust bouncing behind.
- **Quicksand:** a patch of sand sinks and swirls where it lands and keeps churning while it lingers, sand grains
  tumbling inward; anyone in it is slowed.
- **Mud Shot:** a clod of mud flies, dripping; it splats on hit and leaves a muddy splash (slows).
- **Magma Quake:** Infernox's version: glowing lava cracks spread across the ground round it, magma spurts up through
  them (far ones behind, near in front), with P1 embers and smoke.
- **Fault Line** (boss): a long crack tears across the floor and rock spikes burst up along it.

### EARTH-1 · rock spikes, boulders, rubble (Quake, Rock Slide, Rollout, Fault Line, Rockfall)

> A sprite sheet of separate rock effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a jagged spike of brown-grey rock bursting up out of the ground in 3 frames
> (cracking out, tall and sharp, crumbling), each a small step from the last. Row 2: a big rounded boulder of grey
> stone with darker cracks, in 2 shapes, then a boulder smashing apart in 3 frames. Row 3: three chunks of rubble of
> different shapes in brown-grey stone, and a flat oval patch of cracked earth seen from slightly above (dark jagged
> cracks in brown ground). Row 4: a long straight crack torn into the ground seen from slightly above, a horizontal
> strip of dark jagged crack with broken edges, cut off straight at both ends so copies join end to end into a longer
> crack. Every piece complete and fully inside its own space with a wide margin of empty background all round it,
> nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders
> behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game,
> chunky pixels with a dark 1-pixel outline, light from the top left, limited palette with hard-edged shading, no
> creature or character, plain dark navy background, no text, no labels

### EARTH-2 · Quicksand, Mud Shot, Magma Quake

> A sprite sheet of separate earth effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a patch of sinking quicksand seen from slightly above, a flat oval of golden-tan
> sand swirling down into a darker centre, in 3 frames of a loop as it turns, each a small step from the last. Row 2:
> a clod of wet brown mud flying to the right with drips falling from it in 3 frames of a loop, then two small sand
> grains. Row 3: a mud splat in 3 frames (a small splash, a big splat of brown mud, a puddle), and a small mud drip.
> Row 4: glowing lava cracks in the ground seen from slightly above (a flat oval web of jagged orange-glowing cracks in
> dark rock) in 2 frames as the glow pulses, then a spurt of magma shooting up in 3 frames. Every piece complete and
> fully inside its own space with a wide margin of empty background all round it, nothing touching another piece or
> the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain
> background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel
> outline, light from the top left, limited palette with hard-edged shading, no creature or character, plain dark
> navy background, no text, no labels

---

## Shade (Shadefang, Mondaze)

- **Night Slash:** a crescent of dark purple light cuts across the target, shadow wisps trailing off it; the dash
  leaves wisps behind.
- **Gloom Orb:** a dark orb with a purple glow drifts over, shadow wisps curling off it; it bursts into darkness.
- **Dark Wave:** shadow tendrils burst up out of the ground all round the user (far ones behind, near in front) and
  dark smoke rolls outward.
- **Dark Pulse:** a jagged ring of darkness rolls outward across the floor (it hits as it passes), dark smoke behind
  it.
- **Deadline Dash:** Mondaze rushes with papers flying off it, a calendar page, sweat drops; papers burst everywhere on
  the hit.
- **Blank Stare:** Mondaze's silly signature (keep it silly): a "..." thought bubble pops up, its eyes go huge and
  empty, two droopy wobbly stare beams wander out trailing sleepy Z's (BEAST-3) into a hypnotic swirl, and a baffled
  "?" pops over the target.

### DARK-1 · Night Slash, Gloom Orb

> A sprite sheet of separate shadow effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a crescent slash of dark purple and black light with a bright lilac edge, curving
> like a sweeping blade cut, in 3 frames (appearing, full, fading), each a small step from the last. Row 2: three
> curling wisps of black and purple shadow of different shapes. Row 3: a dark orb of black shadow with a glowing
> purple rim and wisps curling off it, in 4 frames of a loop. Row 4: a burst of darkness in 3 frames (small, big with
> jagged points, breaking into wisps). Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites
> for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited palette with
> hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### DARK-2 · Dark Wave, Dark Pulse

> A sprite sheet of separate shadow effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a tendril of black and purple shadow bursting up out of the ground and curling, in
> 3 frames (rising, tall and curled, sinking back), each a small step from the last. Row 2: a jagged ring of darkness
> on the ground seen from slightly above (a flat oval of spiky black and purple shadow with a lilac edge, empty in the
> middle) in 2 frames of a loop. Row 3: a puff of dark purple-black smoke in 4 stages, small, billowing, thinning,
> wisps. Row 4: a dark crack in the ground seen from slightly above with purple light glowing in it, in 2 shapes.
> Every piece complete and fully inside its own space with a wide margin of empty background all round it, nothing
> touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the
> pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels
> with a dark 1-pixel outline, light from the top left, limited palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### DARK-3 · Deadline Dash, Blank Stare (Mondaze)

> A sprite sheet of separate silly cartoon effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a sheet of white office paper with grey lines on it, in 3 frames of a loop
> as it flutters and flips, then a torn calendar page with a red top. Row 2: a white thought bubble with three dots
> inside it ("..."), in 2 frames (popping up, full), then a big white question mark symbol. Row 3: a huge round blank
> cartoon eye (white with a tiny black dot pupil and a droopy lid), in 2 frames (opening wide, staring), then a pale
> lavender hypnotic spiral swirl in 2 frames as it turns. Row 4: a straight horizontal section of a droopy, wobbly,
> pale lavender stare beam (thin, a little wavy), cut off straight at both ends so copies placed end to end join into
> one long beam, in 3 frames of a loop. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites
> for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited palette with
> hard-edged shading, no creature or character, plain dark navy background, no other text, no labels

---

## Brawl (Brawlix, Daimochi, Bugilist)

- **Close Combat:** a six-hit flurry: cartoon fists pop in from all sides, each with an impact flash, motion lines
  everywhere.
- **Rapid Jab:** one fast jab: a fist punches forward, a shockwave ring on hit.
- **Aura Sphere:** a sphere of fiery red-orange fighting aura with a spinning core curves toward the target (homing),
  aura wisps trailing.
- **Aura Cannon:** a beam of fighting aura, red-orange with a white core, rings of force along it.
- **Bulk Up:** a burst of red-orange aura flares up round the Coreature (far side behind, near side in front), power
  lines and puffs of steam, then the arrows (COMMON-2).

### FIGHT-1 · Close Combat, Rapid Jab, Aura Sphere

> A sprite sheet of separate fighting effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a cartoon fist of red-orange fighting energy punching to the right with motion
> lines behind it, in 2 frames (pulled back, punching), then a red-orange punch impact flash in 3 frames (small, big
> star, fading). Row 2: a red-orange shockwave ring seen edge-on (an upright oval) in 3 frames growing. Row 3: a sphere
> of fiery red-orange aura energy with a white core and a spinning swirl inside, in 4 frames of a loop, each a small
> step from the last. Row 4: three small wisps of red-orange aura of different shapes, and two short white motion
> lines. Every piece complete and fully inside its own space with a wide margin of empty background all round it,
> nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders
> behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game,
> chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading,
> no creature or character, plain dark navy background, no text, no labels

### FIGHT-2a · Aura Cannon (Brawlix)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a beam of fiery red-orange fighting aura with a
> white-hot center and flickering flame-like wisps streaming along inside it, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the wisps stream forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of white-hot aura with a red-orange flickering edge, the
> same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3:
> a burst of red-orange aura with a shockwave ring, a round burst on its own with nothing attached to it (no beam,
> no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a burst of red-orange aura with
> a shockwave, a burst on its own with nothing attached to it (no beam, no stream, no arrow), spraying outward to
> the right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame
> or border around any piece. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### FIGHT-2 · Bulk Up (Bugilist)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: a tall flaring tongue of red-orange fighting aura rising up, in 3 frames of a loop,
> each a small step from the last. Row 2: a small puff of white steam in 2 shapes, and a burst of short red-orange
> power lines. Every piece complete and fully inside its own space with a wide margin of empty background all round
> it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or
> borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

---

## Wind (Galewing)

- **Air Slash:** three crescent blades of wind fly out in a fan, wind curls shedding behind; they burst into curls on
  hit.
- **Razor Gale:** a big spinning blade of wind flies out and curves back like a boomerang, leaves and curls whirling
  in its wake.
- **Gust:** a cone of wind: wind curls, streaks and leaves blow out across the wedge and push foes back.
- **Tornado:** the E2b storm cloud gathers over the spot (reused), the funnel reaches down and whirls there while it
  lingers (dust ring at its base, debris circling it, the pieces passing behind the caught Coreature drawn behind),
  then draws back up.
- **Brave Dive:** the Coreature dives in behind a spear-point of wind, feathers shedding.
- **Tailwind:** a green-white ribbon of wind spirals up round the Coreature (back half behind, front half in front),
  then the speed and attack arrows (COMMON-2).

### WIND-1 · Air Slash, Razor Gale, Gust

> A sprite sheet of separate wind effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a crescent blade of wind flying to the right (pale blue and white, sharp curved
> edge, a few streaks behind it) in 3 frames of a loop, each a small step from the last. Row 2: a big four-bladed
> spinning blade of wind (like a whirling shuriken made of pale blue and white air), in 4 frames of a loop as it spins.
> Row 3: three curled wind streaks of different shapes and lengths in white and pale blue. Row 4: a small green leaf
> tumbling, a small white feather, and a small grey-blue feather. Every piece complete and fully inside its own space
> with a wide margin of empty background all round it, nothing touching another piece or the edges of the picture,
> nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel
> art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

### WIND-2 · Tornado, Brave Dive, Tailwind

> A sprite sheet of separate wind effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a tall swirling tornado funnel of grey-white wind, wide at the top and narrow at the
> bottom, with spiralling streaks, in 4 frames of a loop as it spins, each a small step from the last. Row 2: a ring of
> kicked-up dust round the bottom of a tornado seen from slightly above (a flat oval of swirling tan dust) in 2 frames
> of a loop, then a small rock, a twig and a leaf (debris caught in the wind). Row 3: a spear-point of white and pale
> blue wind pointing right (a sharp arrowhead of rushing air with streaks trailing back) in 3 frames of a loop. Row 4:
> a ribbon of green and white wind curving in a spiral, in 3 frames of a loop. Every piece complete and fully inside
> its own space with a wide margin of empty background all round it, nothing touching another piece or the edges of
> the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere.
> 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the
> top left, limited palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

---

## Glitch (Venomire, Glitched Coreatures and bosses)

Glitch is corrupted data, and Venomire is corrupted purple ooze, so these are **violet sludge flecked with broken
magenta and cyan pixel blocks**.
- **Sludge Bomb:** a dripping glob of glitched sludge lobs over and explodes into a big splat, globs flying, glitch
  blocks scattering.
- **Acid Spray:** four drops of acid spray out in a fan, each sizzling on hit.
- **Toxic Pool:** a glob lands and spreads into a bubbling pool that lingers (bubbles popping, glitch flecks
  flickering on it); anyone in it is poisoned and slowed.
- **Venom Jet:** a sputtering stream of glitched sludge, splattering where it hits.
- **Fatal Error:** the user flickers and its data bursts out: a shattering explosion of magenta and cyan blocks all
  round it (far behind, near in front), loose blocks drifting and blinking out.
- **Data Tear** (Glitched bosses): flickering torn patches of broken data on the floor.


### WIND-2b · Brave Dive's bow wave (replaces WIND-2's row 3)

WIND-2's row 3 came back as plain arrows (the prompt asked for an arrowhead). Only this row needs redoing.

> A sprite sheet of separate wind effect pieces for an action game, laid out in exactly 1 row with lots of empty
> space between every piece: a long bow wave of rushing white and pale blue air lying on its side, smooth and
> teardrop shaped, pointed at its right end and fraying at its left end into loose streaks of wind, like the
> shockwave of air in front of a diving falcon, in 3 frames of a loop as the streaks ripple, each a small step from
> the last. It is not an arrow: no arrowhead, no barbs, no notch, no shaft, no triangle shape. Draw no arrows or
> arrowheads anywhere, and no box, frame or border around any piece. Every piece complete and fully inside its own
> space with a wide margin of empty background all round it, nothing touching another piece or the edges of the
> picture, nothing cut off. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark
> 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### GLITCH-1 · Sludge Bomb, Acid Spray, Fatal Error

> A sprite sheet of separate corrupted slime effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a glob of violet sludge flecked with magenta and cyan square pixel blocks,
> dripping, in 3 frames of a loop as it wobbles, each a small step from the last, then a small drop of bright green
> acid in 2 frames. Row 2: a big splat of violet sludge in 4 frames (a small splat, a big burst with flying globs,
> spreading flat, a puddle), with magenta and cyan pixel blocks in it. Row 3: a violet bubble popping in 3 frames,
> then a small puff of green acid sizzle in 2 shapes. Row 4: an explosion of broken magenta and cyan square pixel
> blocks in 4 frames (a flicker, a big shattering burst like broken data, scattering, a few blocks left), then two
> loose magenta and cyan blocks. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites
> for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with
> hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### GLITCH-2a · Venom Jet (Venomire)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a sputtering stream of violet sludge with
> bubbles and magenta and cyan square pixel flecks churning inside it, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the sludge churns forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of glowing pale violet sludge with a glitching magenta
> edge, the same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright
> core). Row 3: a glob of violet sludge with drips, a round burst on its own with nothing attached to it (no beam,
> no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a splatter of violet sludge with
> drops and magenta and cyan pixel blocks, a burst on its own with nothing attached to it (no beam, no stream, no
> arrow), spraying outward to the right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads
> anywhere, and no box, frame or border around any piece. Every piece complete and fully inside its own space with a
> wide margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing
> cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art
> visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

### GLITCH-2 · Toxic Pool, Data Tear

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: a bubbling pool of violet sludge on the ground seen from slightly above (a flat oval
> with bubbles and magenta and cyan pixel flecks) in 3 frames of a loop, each a small step from the last. Row 2: a
> torn patch of broken data on the ground seen from slightly above (a flat ragged rectangle of black with glitching
> magenta and cyan stripes and blocks) in 2 frames of a loop as it flickers. Every piece complete and fully inside
> its own space with a wide margin of empty background all round it, nothing touching another piece or the edges of
> the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain background
> everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline,
> light from the top left, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

---

## Phantom (Wispurr, Stonicface, Voltergeist)

- **Shadow Ball:** a ball of dark violet ghost-fire with wisps curling off drifts toward the target (homing), spirit
  wisps trailing; it bursts into ghost-flame (HITS-3).
- **Phantom Strike:** the Coreature fades to a ghostly afterimage and strikes through the target in a violet streak,
  wisps where it passes.
- **Spirit Flames:** three spots: will-o'-wisps gather over each, then violet spirit flames burst up from the ground
  and flicker before fading.
- **Spectral Ray:** a pale violet ray with ghostly rings drifting along it, wisps peeling off.

### GHOST-1 · Shadow Ball, Phantom Strike, Spirit Flames

> A sprite sheet of separate ghost effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a ball of dark violet ghost fire with a pale lilac core and wisps curling off it,
> in 4 frames of a loop, each a small step from the last. Row 2: a small floating violet will-o'-wisp flame with a
> pale core in 3 frames of a loop, then two small curling violet wisps. Row 3: a tall tongue of violet spirit flame
> rising from the ground with a pale lilac core, in 4 frames of a loop as it flickers. Row 4: a ghostly violet streak
> pointing right (a long fading slash of spirit light) in 2 frames, then a puff of pale violet ghost mist in 3 stages
> fading away. Every piece complete and fully inside its own space with a wide margin of empty background all round
> it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders
> behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky
> pixels with a dark 1-pixel outline, light from the top left, limited palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

### GHOST-2 · Spectral Ray (Stonicface, Wispurr)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a pale violet spectral ray with a white center
> and ghostly wisps and faint spirit faces drifting along inside it, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the wisps drift forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of pale white spirit light with a wispy edge, the same
> thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3: a
> swirl of violet spirit light with wisps, a round burst on its own with nothing attached to it (no beam, no stream,
> no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a burst of violet ghost light with wisps, a
> burst on its own with nothing attached to it (no beam, no stream, no arrow), spraying outward to the right as if
> hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame or border
> around any piece. Every piece complete and fully inside its own space with a wide margin of empty background all
> round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or
> borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

---

## Metal (Gearhulk, Citadrone, Railwarden, the turtle line, Gyroculus)

- **Flash Cannon:** a polished beam of white-silver light with glints running along it, a bright flash at the mouth,
  sparks where it hits.
- **Drone Swarm:** four little drones launch from Citadrone and home in on the target (each a drone piece turned the
  way it flies, propellers spinning), popping in sparks on hit.
- **Iron Slam:** a heavy charge; on hit a clang star, metal sparks and a dent in the ground (COMMON-1 ring and dust).
- **Magnet Storm:** three spots: a horseshoe magnet hovers over each, magnetic field lines curve round it, then it
  slams down with sparks (and can paralyse).
- **Iron Defense:** steel plates clank onto the Coreature one by one (front ones in front, back ones behind), sparks,
  then the defence arrows (COMMON-2).
- **Tower Shield:** a huge tower shield appears in front of Railwarden with a glint, then the arrows.

### STEEL-1a · Flash Cannon (Gearhulk)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a beam of polished white-silver light with
> steel-blue edges and bright glints and facets sliding along inside it, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the glints slide forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of blinding white light with a silver shimmering edge, the
> same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3:
> a bright white flash with a steel-blue ring and sharp rays, a round burst on its own with nothing attached to it
> (no beam, no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a spray of white and
> orange metal sparks, a burst on its own with nothing attached to it (no beam, no stream, no arrow), spraying
> outward to the right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no
> box, frame or border around any piece. Every piece complete and fully inside its own space with a wide margin of
> empty background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No
> boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual
> effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### STEEL-1 · Drone Swarm (Citadrone)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: a small flying drone seen from the side facing right (a gunmetal body with a teal eye
> light, a little cannon and a spinning propeller on top), in 2 frames of a loop as the propeller spins, then a
> small drone bursting apart in 3 frames. Row 2: three small orange-white metal sparks and two small steel bolts.
> Every piece complete and fully inside its own space with a wide margin of empty background all round it, nothing
> touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind
> the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky
> pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no
> creature or character, plain dark navy background, no text, no labels

### STEEL-2 · Iron Slam, Magnet Storm, Iron Defense, Tower Shield

> A sprite sheet of separate metal effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a white and steel-grey clang star in 3 frames (small, big with sharp points,
> fading), then a dent in the ground seen from slightly above (a flat oval crater). Row 2: a red and silver horseshoe
> magnet seen from the side, and curved lines of a magnetic field in pale blue (arcs looping between two points) in 3
> frames of a loop. Row 3: three riveted steel armour plates of different shapes (gunmetal grey with lighter edges and
> rivets). Row 4: a big tall steel tower shield seen from the front with gold rims and rivets, in 3 frames (appearing
> from light, solid, a bright glint across it). Every piece complete and fully inside its own space with a wide margin
> of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No
> boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited palette with
> hard-edged shading, no creature or character, plain dark navy background, no text, no labels

---

## Arcane: fairy and mind (Pixibelle, Cosmite, Bellpaca; Gyroculus, Mindra, Stonicface)

- **Moonblast:** a glowing crescent moon spins toward the target, sparkles shedding; it bursts in moonlight.
- **Fairy Wind:** five pink wind curls float out in a spread, sparkles twinkling along them.
- **Dazzle Beam:** a prismatic beam of pink-white light full of sparkles, a starburst where it hits.
- **Wish:** a star appears above the user (it looks up), twinkles, falls and bursts into sparkles and pluses
  (COMMON-2).
- **Psybeam:** a wavy pink-magenta beam with rings of mind energy travelling along it (it slows).
- **Mind Orbs:** two glowing orbs with an eye-like swirl inside curve toward the target (homing), sparkles trailing.
- **Foresight:** a glowing eye sigil opens on the ground under the target, stares, then a column of pink light slams
  down onto it (late, 1.6 s).
- **Calm Mind:** a glowing ring of floating runes circles the Coreature's head (back half behind), motes drift up,
  then the arrows (COMMON-2).

### FAIRY-1 · Moonblast, Fairy Wind

> A sprite sheet of separate fairy magic effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a glowing crescent moon of pale gold and white light with a soft pink glow,
> in 4 frames of a loop as it spins, each a small step from the last. Row 2: a burst of moonlight in 3 frames (small,
> a big starburst with a ring, fading into sparkles). Row 3: a curling ribbon of pink fairy wind with a white edge, in
> 3 different shapes. Row 4: three small sparkles of different shapes in pink, white and pale gold. Every piece
> complete and fully inside its own space with a wide margin of empty background all round it, nothing touching
> another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces,
> one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark
> 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or character,
> plain dark navy background, no text, no labels

### FAIRY-2a · Dazzle Beam (Pixibelle)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a dazzling beam of pink and white light with
> rainbow glints and sparkles twinkling along inside it, with soft rounded glowing edges (not a rectangle with a
> border), the same thickness all along, its left and right ends simply cut off straight so copies placed end to end
> join into one long beam, in 4 frames of a loop as the sparkles twinkle forward, each a small step from the last.
> Row 2: a thin straight horizontal strand of blazing white light with a pink shimmering edge, the same thickness
> all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core). Row 3: a ball of pink
> light with sparkles and short rays, a round burst on its own with nothing attached to it (no beam, no stream, no
> arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a pink and white starburst with sparkles, a
> burst on its own with nothing attached to it (no beam, no stream, no arrow), spraying outward to the right as if
> hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame or border
> around any piece. Every piece complete and fully inside its own space with a wide margin of empty background all
> round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or
> borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action
> game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text, no labels

### FAIRY-2 · Wish (Pixibelle, Bellpaca)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: a big golden wish star with a soft glow in 3 frames of a loop as it twinkles, each a
> small step from the last, then the star falling with a short sparkling tail. Row 2: the star bursting into
> sparkles in 3 frames. Every piece complete and fully inside its own space with a wide margin of empty background
> all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes, panels,
> frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for
> an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright palette with
> hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### PSY-1a · Psybeam (Gyroculus, Mindra)

Its own picture, laid out like SMUG-1b (a body with a pattern inside, a core strand, a muzzle, an impact). Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a wavy beam of pink and magenta mind energy
> with a white center and rings of mind energy rippling along inside it, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the rings ripple forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of bright white-pink light with a wavy shimmering edge,
> the same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright core).
> Row 3: a ring of pink mind energy pulsing with a glowing center, a round burst on its own with nothing attached to
> it (no beam, no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a burst of pink and
> magenta light with small rings, a burst on its own with nothing attached to it (no beam, no stream, no arrow),
> spraying outward to the right as if hit from the left, in 4 frames of a loop. Draw no arrows or arrowheads
> anywhere, and no box, frame or border around any piece. Every piece complete and fully inside its own space with a
> wide margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing
> cut off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art
> visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

### PSY-1 · Mind Orbs (Gyroculus, Mindra)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: a glowing pink orb with a swirling eye-like spiral inside it, in 4 frames of a loop as
> the spiral turns, each a small step from the last. Row 2: a small burst of pink light in 3 frames, and three small
> pink and violet sparkles of different shapes. Every piece complete and fully inside its own space with a wide
> margin of empty background all round it, nothing touching another piece or the edges of the picture, nothing cut
> off. No boxes, panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art
> visual effect sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text, no
> labels

### PSY-2 · Foresight, Calm Mind (and the boss's Big Yawn)

> A sprite sheet of separate mind magic effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a glowing eye sigil drawn on the ground seen from slightly above (a flat
> oval eye shape of pink-magenta light with an iris), in 3 frames (closed, opening, wide open), each a small step from
> the last. Row 2: a tall column of pink and white light slamming straight down, in 3 frames (thin, full and bright,
> fading). Row 3: a flat oval ring of small glowing violet rune symbols floating in a circle seen from slightly above,
> in 2 frames of a loop, then two small floating violet diamond motes. Row 4: a soft lavender ring of sleepy energy on
> the ground seen from slightly above (a flat oval wave, empty in the middle), and a small lavender sleep bubble.
> Every piece complete and fully inside its own space with a wide margin of empty background all round it, nothing
> touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the
> pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels
> with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

---

## Dragonkin (Cosmite, Nyxdrake, Maelstrisk)

Cosmite and Nyxdrake are night-sky dragons, so their attacks are **deep indigo and violet energy full of tiny white
stars with a pink and teal nebula glow**.
- **Dragon Pulse:** the beam ends in a roaring dragon's head of star-filled energy; the beam behind it is a river of
  nebula.
- **Dragon Claw:** three claw streaks rake across the target, stardust spraying.
- **Starfall:** four falling stars streak down onto spots (a shadow grows under each) and burst into starlight,
  leaving little craters of stardust.
- **Dragon Dance:** ribbons of nebula flame spiral up round the dragon (back half behind), silver scales and stardust
  swirl, then the attack and speed arrows (COMMON-2).

### DRAGON-1a · Dragon Pulse (Nyxdrake, Maelstrisk)

Its own picture, laid out like SMUG-1b, except its end is a roaring dragon's head that leads the beam and bites into what it hits. Run it on its own.

> A sprite sheet of separate beam effect pieces for an action game, laid out in exactly 4 rows with lots of empty
> space between every piece. Row 1: a straight horizontal section of a beam of deep indigo and violet energy full of
> tiny white stars swirling inside it, with a pink and teal nebula glow, with soft rounded glowing edges (not a
> rectangle with a border), the same thickness all along, its left and right ends simply cut off straight so copies
> placed end to end join into one long beam, in 4 frames of a loop as the stars swirl forward, each a small step
> from the last. Row 2: a thin straight horizontal strand of bright white starlight with a pink and teal shimmering
> edge, the same thickness all along, its ends simply cut off straight, in 4 frames of a loop (the beam's bright
> core). Row 3: a ball of indigo energy with stars and a pink and teal glow, a round burst on its own with nothing
> attached to it (no beam, no stream, no arrow coming out of it), in 4 frames of a loop as it pulses. Row 4: a
> roaring dragon's head made of the same star-filled violet energy, open jaws facing right, its neck ending in a
> short rounded stub on the left, in 4 frames of a loop. Draw no arrows or arrowheads anywhere, and no box, frame or
> border around any piece. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### DRAGON-1 · Dragon Claw (Cosmite, Nyxdrake)

> A sprite sheet of separate effect pieces for an action game, laid out in exactly 2 rows with lots of empty space
> between every piece. Row 1: three parallel claw slash streaks of violet light with white edges, in 3 frames
> (raking in, full, fading), each a small step from the last, then a small silver dragon scale. Row 2: a sprinkle of
> glowing stardust in 2 shapes. Every piece complete and fully inside its own space with a wide margin of empty
> background all round it, nothing touching another piece or the edges of the picture, nothing cut off. No boxes,
> panels, frames or borders behind the pieces, one plain background everywhere. 16-bit pixel art visual effect
> sprites for an action game, chunky pixels with a dark 1-pixel outline, light from the top left, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text, no labels

### DRAGON-2 · Starfall, Dragon Dance

> A sprite sheet of separate star magic effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a falling star streaking down and to the left (a bright white and gold star
> head with a long trail of violet and pink light), in 3 frames of a loop, each a small step from the last. Row 2: a
> burst of starlight in 4 frames (a flash, a big gold and white starburst, a ring of sparkles, fading stardust). Row
> 3: a small crater of glowing stardust on the ground seen from slightly above (a flat oval), and three small gold and
> white star sparkles. Row 4: a rising ribbon of violet nebula flame with tiny stars in it, in 3 frames of a loop.
> Every piece complete and fully inside its own space with a wide margin of empty background all round it, nothing
> touching another piece or the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the
> pieces, one plain background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels
> with a dark 1-pixel outline, light from the top left, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text, no labels

---

## The boss: Slumbear, the Jumbled King

Most of his attacks reuse type sheets: **Icicle Rain** (an icicle from BOSS-1 falls onto each warned spot, shatters,
leaves an ICE-2 frost patch), **Glacier Slam** (ice slabs from BOSS-1 and ICE-2 spikes burst up across half the
room), **Bamboo Volley** (bamboo spears from BOSS-1 fly along each warned line, splinters on hit), **Fault Line**
(EARTH-1 cracks tear across the room, rock spikes along them), **Rockfall** (EARTH-1 boulders), **Big Yawn** (PSY-2's
sleepy ring rolls out, BEAST-3 Z's), **Belly Flop** (his shadow from BOSS-1 grows where he'll land, then COMMON-1
dust, ring and cracks), **Midnight Snack** and **Big Sleep** (BEAST-3).

### BOSS-1 · Icicle Rain, Glacier Slam, Bamboo Volley, Belly Flop

> A sprite sheet of separate boss attack effect pieces for an action game, laid out in exactly 4 rows with lots of
> empty space between every piece. Row 1: a long sharp icicle falling point down, pale blue and white with a bright
> glint, then the icicle shattering on the ground in 3 frames. Row 2: a huge jagged slab of blue-white ice bursting up
> out of the ground in 3 frames (cracking out, towering, crumbling), each a small step from the last. Row 3: a long
> sharpened bamboo spear flying to the right (green with darker joints and a cut point), then two bamboo splinters and
> a bamboo leaf. Row 4: a big dark oval shadow on the ground seen from slightly above (soft-edged, for something about
> to land), and a big flat oval ring of dust and shock on the ground seen from slightly above. Every piece complete and
> fully inside its own space with a wide margin of empty background all round it, nothing touching another piece or
> the edges of the picture, nothing cut off. No boxes, panels, frames or borders behind the pieces, one plain
> background everywhere. 16-bit pixel art visual effect sprites for an action game, chunky pixels with a dark 1-pixel
> outline, light from the top left, limited palette with hard-edged shading, no creature or character, plain dark navy
> background, no text, no labels

---

## Notes for Claude when building them

- Pieces go in `tools/fx-sheets.py` like P1 (`pk-<code>.png`, the row counts from the prompt), at a size where the
  pieces come out about one pixel per sprite pixel at their usual size in the game (P1 used 54 for its tallest piece).
- Each attack's motion is code in fx.js, built like `fxEruptionPieces` with the `piece` particle (age-based motion,
  frames looped at a rate or played through, grow, shrink, swell, rise, throws with a bounce, spin) and `front` /
  `ground` for depth. A beam needs a new helper: lay its section end to end along the beam (overlapping a pixel or two,
  alternate copies mirrored if the joins show), scroll them forward, add the mouth and end pieces; a dash needs one
  that rides a leading edge in front of the Coreature.
- Keep each attack's old version behind `FX_PIECES` until its new one is reviewed, so the owner can compare on
  moves.html. Review every attack at game speed and in slow motion, and send the owner a side-by-side GIF.
- What the pieces can't do and the old sheets did well can stay as pieces too (F8b waves, E2b cloud, E2c bolt).
