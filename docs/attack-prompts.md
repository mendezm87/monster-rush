# Attack art prompts

Prompts for the attacks' art (the Coreatures' and trainers' prompts are in `docs/concept-prompts.md`). The
audit and the plan are in `docs/attack-art.md`. Run a batch in Gemini and send back the images you like;
Claude cuts them into the game's frames (tools/fx-sheets.py) and plays them as the attacks.

**Since r185 attacks are built from pieces: the prompts for that are in `docs/attack-pieces.md`.** The whole-scene prompts below are kept for the record (and E2b, E2c and P1 are still used).

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

## Batch 2: fire (r150; the owner: "I don't think we prompted any fire attacks. Blaze Rush should engulf the user in flames and then he dashes. Flame Wheel should look more like flames instead of small fire sprites pasted together")

Every fire attack, asking for **one big continuous body of fire** (roaring tongues that merge, a hot white-yellow
core, orange, then deep red edges and dark smoke) instead of separate little flames, and for each attack to look
**strong**: big, layered, with a clear wind-up and a big finish. Send back the ones you like (a second take of any
is welcome).

**F1 · Flame Wheel** (a dash)
> A roaring wheel of continuous fire rolling forward: one thick ring of merged flames wrapped around an empty
> creature-sized space, big tongues of flame licking backwards off the rim as it spins, a hot white-yellow core
> band inside the orange flames, sparks and embers flung off, a burning track left on the ground behind it, then a
> fiery explosion of flame on impact. 16-bit pixel art visual effect sprite sheet for an action game, frames in a
> row from left to right (wind-up, travel, impact, fade), chunky pixels with a dark 1-pixel outline, limited
> bright palette with hard-edged shading, the effect wraps around an empty creature-sized space in the middle (no
> creature drawn, not a solid ball), plain dark navy background, no text

**F2 · Blaze Rush** (a dash: it bursts into flames first, then charges)
> First a creature-sized space bursts into flames: a pillar of roaring fire engulfs it from the ground up, flames
> rising tall above it; then the whole blaze charges forward like a comet of fire, the flames streaming far back
> behind it, embers and smoke trailing; then a big burst of fire on impact. 16-bit pixel art visual effect sprite
> sheet for an action game, frames in a row from left to right (ignite, engulfed, charge, impact, fade), chunky
> pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, the effect wraps around an
> empty creature-sized space in the middle (no creature drawn, not a solid ball), plain dark navy background, no
> text

**F3 · Flamethrower** (a stream of fire from the mouth)
> A roaring stream of fire blasting out to the right from a small point: a bright white-hot nozzle flash, a
> twisting jet of flame that widens into billowing rolling flame clouds with dark smoke at the edges, embers
> scattering, then the far end splashing into a burst of fire. 16-bit pixel art visual effect sprite sheet for an
> action game, frames in a row from left to right (spark, stream starting, full blast, fading), chunky pixels with
> a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain dark
> navy background, no text

**F4 · Fire Blast** (a big fireball)
> A big fireball flying to the right: a swirling white-hot core, layers of churning orange and red fire around
> it, a long flickering comet tail of flame and smoke, then it slams into a huge explosion: a ball of fire with a
> ring of flame tongues bursting outwards and smoke puffs. 16-bit pixel art visual effect sprite sheet for an
> action game, frames in a row from left to right (forming, flying, impact, explosion, smoke), chunky pixels with
> a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain dark
> navy background, no text

**F5 · Eruption** (fire bursting up all around the user)
> The ground cracks in a ring around an empty creature-sized space, glowing lava showing through the cracks, then
> a ring of fire geysers erupts upwards all around it, molten rocks and blobs of lava thrown high into the air,
> then they rain down and the cracks glow and cool. 16-bit pixel art visual effect sprite sheet for an action
> game, frames in a row from left to right (cracks, eruption, peak, falling rocks, cooling), chunky pixels with a
> dark 1-pixel outline, limited bright palette with hard-edged shading, no creature drawn, plain dark navy
> background, no text

**F6 · Inferno Beam** (a huge beam of fire)
> A massive beam of white-hot fire blasting to the right: a blinding muzzle flare at the source, a thick core of
> white and yellow, flames spiralling around the beam, roaring flame edges, embers thrown off, and a big fiery
> explosion where it hits. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from
> left to right (charging, firing, full power, fading), chunky pixels with a dark 1-pixel outline, limited bright
> palette with hard-edged shading, no creature or character, plain dark navy background, no text

**F7 · Steam Eruption** (geysers of scalding steam and fire from the ground)
> Spots on the ground bubble and crack, then geysers of scalding white steam shoot up with orange fire glowing
> inside them, hot water droplets flying, then the steam billows out into clouds and fades. 16-bit pixel art
> visual effect sprite sheet for an action game, frames in a row from left to right (bubbling, bursting, peak,
> billowing, fading), chunky pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading,
> no creature or character, plain dark navy background, no text

**F8 · Magma Wave** (a wave of lava rolling out in front)
> A wave of molten lava rolling forward to the right along the ground: a glowing orange crest curling over, a dark
> cooling crust on its back, blobs and droplets of lava splashing off, smoke rising, then it crashes and spreads
> into a glowing pool. 16-bit pixel art visual effect sprite sheet for an action game, frames in a row from left to
> right (rising, rolling, crest, crash, pool), chunky pixels with a dark 1-pixel outline, limited bright palette
> with hard-edged shading, no creature or character, plain dark navy background, no text

## Fixes: sheets to redo (r154)

**What to ask for from now on (the owner: "some of it looks cut off ... you can tell when the sprites change"):** Gemini
sometimes runs out of room in a frame and slices the effect off in a straight line, and 4-5 very different frames
make the swaps visible. So prompts now ask for **8 frames, each small change from the last**, and **each frame
fully inside its own space with empty background all round it, nothing touching the edges or cut off**.

**F8b · Magma Wave, smoother** (the first sheet's waves were cut off flat at the back)
> A wave of molten lava rolling to the right along the ground, 8 frames in a row, each only a small step from the
> one before: lava swelling up out of the ground, rising into a wave, the crest growing taller, curling over, the
> curl at its tallest, starting to break, crashing down in a splash of lava blobs, settling into a glowing pool.
> A glowing orange and yellow crest, a dark cooling crust on its back, smoke rising. Every frame complete and fully
> inside its own space with empty background all round it, nothing touching the edges or cut off, all frames the
> same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with
> a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text

**D1c · Volt Rush, hollow** (r156: in the first sheet the travel frames are a solid ball of lightning, so the
Coreature vanishes inside it; the other dashes work because their frames wrap a hollow middle)
> A creature-sized hollow cage of crackling electricity charging forward to the right, 8 frames in a row, each a
> small step from the one before: sparks gathering in a ring around an empty middle, the ring crackling brighter,
> jagged yellow and white lightning bolts streaming back from a bright crescent at the front, the bolts growing
> longer, a trail of fading afterimage outlines, then a zigzag electric impact star splitting into small bolts,
> fading sparks. The middle of every travel frame stays EMPTY (dark background showing through), like a hoop or a
> cage, never a solid ball. Every frame complete and fully inside its own space with empty background all round it,
> nothing touching the edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art visual effect
> sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, no creature or character, plain dark navy background, no text

## Batch 3: water (r159; the owner: "give me the prompts and I will start")

Every water attack except Aqua Jet (it already has D2). **Run each prompt on its own, one attack per image** (r161: all seven in one picture came out far too small, about 65 pixels a frame). 8 frames each, small steps, nothing cut off. Water should
look like **one body of water**: deep blue edges, bright cyan, white foam and highlights, splashes and droplets.

**W1 · Hydro Cannon** (a beam of water from the mouth)
> A powerful blast of water firing to the right from a small point, 8 frames in two rows of 4 (long beams need the room), each a small step from the one
> before: water gathering into a swirling ball, a burst of spray at the nozzle, a thick jet of water shooting out,
> the jet at full length with white foam churning along it and twisting currents inside, spray flying off the edges,
> the far end exploding into a big splash, the jet thinning, a last splash of droplets. Deep blue edges, bright
> cyan body, white foam and highlights. Every frame complete and fully inside its own space with empty background
> all round it, nothing touching the edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art
> visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright palette
> with hard-edged shading, no creature or character, plain dark navy background, no text

**W2 · Tidal Cannon** (the evolved, bigger Hydro Cannon)
> A massive beam of seawater firing to the right, 8 frames in two rows of 4 (long beams need the room), each a small step from the one before: a
> glowing orb of water swelling, a ring of spray bursting out, a huge torrent shooting out with a wave crest rolling
> along the top of it and whirlpools spinning inside, foam and droplets streaming off, the far end crashing into a
> tall splash like a wave breaking, the torrent at full power, then thinning, then mist and droplets. Deep blue
> edges, bright cyan body, white foam crests. Every frame complete and fully inside its own space with empty
> background all round it, nothing touching the edges or cut off, all frames the same size and evenly spaced.
> 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited
> bright palette with hard-edged shading, no creature or character, plain dark navy background, no text

**W3 · Bubble Spray** (a spray of bubbles that slows)
> A spray of shiny bubbles flying to the right, 8 frames in a row, each a small step from the one before: small
> bubbles forming, a cluster of bubbles of different sizes floating forward, wobbling, each with a white shine and a
> see-through blue rim, bubbles drifting apart, one big bubble popping into a ring of tiny droplets, the rest popping
> one by one, a last fizz of sparkles. Every frame complete and fully inside its own space with empty background all
> round it, nothing touching the edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art
> visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright palette
> with hard-edged shading, no creature or character, plain dark navy background, no text

**W4 · Water cannon shot** (for Spout Shot, Cuff Cannon and Twin Cannon: a fired slug of water)
> A slug of water fired to the right like a cannon shell, 8 frames in a row, each a small step from the one before: a
> puff of spray at the muzzle, a round blob of water launching, stretching into a bullet shape with a foamy front and
> a tail of droplets, flying with a spiral of water round it, hitting and bursting into a splash crown, droplets
> flying out, a small puddle ring, a few last drops. Deep blue edges, bright cyan body, white foam. Every frame
> complete and fully inside its own space with empty background all round it, nothing touching the edges or cut
> off, all frames the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game,
> chunky pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or
> character, plain dark navy background, no text

**W5 · Geyser Vent** (scalding water erupting all round the user)
> A ring of scalding geysers erupting from the ground around an empty creature-sized space in the middle, seen from
> slightly above, 8 frames in a row, each a small step from the one before: the ground bubbling in a ring with steam
> wisps, cracks spurting small jets, tall columns of hot water and steam blasting up all round the ring, the geysers
> at their tallest with white steam at their tops, water raining down, the columns falling, steam drifting, a damp
> ring with the last wisps of steam. Blue and cyan water, white steam, a hint of orange heat in the cracks. Every
> frame complete and fully inside its own space with empty background all round it, nothing touching the edges or
> cut off, all frames the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action
> game, chunky pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature
> drawn, plain dark navy background, no text

**W6 · Whirlpool** (a spinning pool of water that drags foes in)
> A whirlpool spinning on the ground around an empty creature-sized space in the middle, seen from slightly above, 8
> frames in a row, each a small step from the one before: ripples spreading in a ring, the water starting to swirl,
> spiral arms of water and white foam turning faster, the whirlpool at full spin with a deep blue funnel at its
> heart and spray flying off its rim, still spinning, starting to slow, the spiral breaking up, calm ripples. Deep
> blue, bright cyan, white foam. Every frame complete and fully inside its own space with empty background all round
> it, nothing touching the edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art visual
> effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, no creature drawn, plain dark navy background, no text

**W7 · Maelstrom** (the evolved, huge Whirlpool)
> A huge raging maelstrom around an empty creature-sized space in the middle, seen from slightly above, 8 frames in a
> row, each a small step from the one before: dark water rising in a wide ring, waves curling inward, a vast spinning
> vortex with tall walls of water and crashing white crests, lightning-blue glints in the spray, the maelstrom at its
> most violent with waves rearing up around the ring, still raging, the walls collapsing inward, a last crash of
> spray, churning foam settling. Deep navy and blue water, bright cyan, white foam. Every frame complete and fully
> inside its own space with empty background all round it, nothing touching the edges or cut off, all frames the
> same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with a
> dark 1-pixel outline, limited bright palette with hard-edged shading, no creature drawn, plain dark navy
> background, no text

## Batch 4: electric (r166)

Every electric attack except the two dashes (Volt Rush and Lance Charge already have D1 and D6). **Run each prompt on
its own, one attack per image.** 8 frames each, small steps, nothing cut off. Electricity should look like **jagged
bolts and crackling arcs**: white-hot cores, bright yellow, pale blue glow at the edges, sparks.

**E1 · Thunderbolt** (a crackling bolt of lightning shot forward)
> A crackling ball of lightning shot to the right, 8 frames in a row, each a small step from the one before: sparks
> gathering into a small bright orb, the orb crackling with arcs, launching with a jagged lightning tail behind it,
> flying with forked bolts flicking off it, the tail flickering longer, hitting and bursting into a zigzag spark
> star, bolts splitting outward, fading sparks. White-hot core, bright yellow bolts, pale blue glow at the edges.
> Every frame complete and fully inside its own space with empty background all round it, nothing touching the
> edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an
> action game, chunky pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, no
> creature or character, plain dark navy background, no text

**E2 · Thunder** (a lightning strike from the sky onto a spot)
> A lightning strike from the sky onto a spot on the ground, tall frames, 8 frames in a row, each a small step from
> the one before: a dark cloud gathering at the top with flickers inside, a thin crackle reaching down, a huge jagged
> bolt striking all the way to the ground, the ground exploding in a burst of white light and sparks, the bolt at its
> brightest with forks branching, the bolt flickering and thinning, a scorch ring on the ground with sparks, the last
> sparks fading. White-hot core, bright yellow bolt, pale blue glow, dark grey cloud. Every frame complete and fully
> inside its own space with empty background all round it, nothing touching the edges or cut off, all frames the
> same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with a
> dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain dark navy
> background, no text

**E3 · Discharge** (electricity bursting out all around the user)
> An electric shockwave bursting out all around an empty creature-sized space in the middle, seen from slightly
> above, 8 frames in a row, each a small step from the one before: sparks crackling in a ring, the ring charging
> brighter, a blinding flash, jagged bolts shooting outward in every direction, a ring of crackling arcs spreading
> wide across the ground, the arcs at their widest, flickering and breaking apart, a few last sparks on the ground.
> White-hot core, bright yellow bolts, pale blue glow. Every frame complete and fully inside its own space with
> empty background all round it, nothing touching the edges or cut off, all frames the same size and evenly
> spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline,
> limited bright palette with hard-edged shading, no creature drawn, plain dark navy background, no text

**E4 · Volt Cannon** (a beam of crackling electricity)
> A thick beam of crackling electricity firing to the right from a small point, 8 frames in two rows of 4, each a
> small step from the one before: sparks gathering into a glowing orb, the orb crackling with arcs, a jagged beam
> shooting out, the beam at full length with twisting bolts wrapped around a white-hot core, forked arcs jumping off
> its edges, the far end exploding into a burst of sparks, the beam flickering and thinning, a last crackle of
> sparks. White-hot core, bright yellow bolts, pale blue glow. Every frame complete and fully inside its own space
> with empty background all round it, nothing touching the edges or cut off, all frames the same size and evenly
> spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with a dark 1-pixel outline,
> limited bright palette with hard-edged shading, no creature or character, plain dark navy background, no text

**E5 · Rail Shot** (a railgun shot: a very thin, very fast, very straight beam)
> A railgun shot firing to the right, 8 frames in two rows of 4, each a small step from the one before: rings of blue
> light charging in a line, the rings spinning faster, a blinding flash at the muzzle, a perfectly straight thin
> beam of white-blue light shooting across the frame with rings of energy around it, the beam at full length with a
> shockwave ring at the muzzle, the far end bursting in a cross-shaped flash, the beam fading leaving a glowing
> trail, the trail dissolving into sparks. White core, electric blue and cyan, a little yellow. Every frame complete
> and fully inside its own space with empty background all round it, nothing touching the edges or cut off, all
> frames the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky
> pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character,
> plain dark navy background, no text

**E6 · Static Siphon** (a ball of static that drains energy back)
> A fuzzy ball of static electricity flying to the right, 8 frames in a row, each a small step from the one before:
> static crackling into a fuzzy orb, the orb buzzing with tiny arcs, flying with a wobbly trail of static, wobbling
> and crackling, hitting and clinging to its target in a fizzing burst, small green-yellow sparks flowing back the
> way it came, the sparks streaming away, a last fizz. Pale yellow and white static, a hint of green in the
> draining sparks. Every frame complete and fully inside its own space with empty background all round it, nothing
> touching the edges or cut off, all frames the same size and evenly spaced. 16-bit pixel art visual effect sprite
> sheet for an action game, chunky pixels with a dark 1-pixel outline, limited bright palette with hard-edged
> shading, no creature or character, plain dark navy background, no text

**E2b · Thunder's storm cloud** (r173; the cloud in E2 fills its panels and is sliced flat at the sides. The game keeps
E2's lightning and swaps in this cloud. Run it on its own.)
> A dark thundercloud seen from the side, 8 frames in a row, each a small step from the one before: a small dark storm
> cloud forming, swelling bigger and billowing, rumbling with faint flickers of light inside, suddenly lit bright
> yellow-white from underneath by a lightning flash, at its biggest and darkest with the glow underneath fading, the
> first puffs beginning to drift apart, breaking up into separate small dark puffs, the last wisps fading. A billowing
> rounded top and a flatter underside, deep slate grey and charcoal with lighter grey highlights on the tops of the
> puffs, no lightning bolt drawn below it. Each cloud is complete and fully inside its own space with a wide margin of
> empty background on the left and right and above and below it, nothing touching the edges or cut off, all frames
> the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky pixels with
> a dark 1-pixel outline, limited palette with hard-edged shading, no creature or character, plain dark navy
> background, no text

**E2c · Thunder's bolt** (r175; the owner doesn't like E2's bolt and wants "a really flashy attack because it is difficult
to land". The game keeps E2b's cloud on top and the same height, so this is the bolt alone, no cloud. Run it on its own.)
> A huge lightning strike from the sky hitting the ground, tall frames, no cloud, 8 frames in a row, each a small
> step from the one before: a thin jagged crackle reaching down from the top, a massive thick jagged bolt slamming
> into the ground with a white-hot core and bright yellow edges, the bolt at its brightest and widest with many forks
> branching off it and a pale blue electric glow around it, the ground exploding in a dome of white light with sparks
> and chunks of rock blasting up and a shockwave ring spreading across the ground, a second flickering strike down the
> same path with arcs crawling along the ground, the bolt thinning into crackling arcs, a glowing scorched crater with
> sparks dancing over it, the last sparks fading. White-hot core, bright yellow, electric blue glow. Every frame
> complete and fully inside its own space with empty background all round it, nothing touching the edges or cut off,
> all frames the same size and evenly spaced. 16-bit pixel art visual effect sprite sheet for an action game, chunky
> pixels with a dark 1-pixel outline, limited bright palette with hard-edged shading, no creature or character, plain
> dark navy background, no text

## Pieces (r182): Gemini draws an attack's parts, code moves them

The owner wanted attacks as smooth as the old code-drawn ones. A whole-scene sheet has 5-8 pictures for an attack
lasting about a second, so it steps; parts moved by code move 60 times a second and never look quite the same twice.
Big one-off shapes (Thunder's dome of light, Magma Wave's crashing wave, the whirlpool) stay whole sheets. **Test
first: P1 rebuilds Eruption from parts, compared side by side with today's Eruption (F5).** Run it on its own.

**P1 · Eruption pieces** (code will: crack the ground round the user, glowing brighter; burst a ring of flame
tongues up round it, each flickering; throw rocks out in arcs, tumbling and bouncing; send embers rising; billow
smoke up and away; flash once)
> A sprite sheet of separate fire effect pieces for an action game, laid out in 4 rows with lots of empty space
> between every piece, nothing touching or overlapping. Row 1: one tall narrow flame tongue in 4 frames, each a
> small step from the last as it flickers and licks upward, white-hot at its base, then yellow, orange and deep red
> at its curling tip. Row 2: three chunks of dark basalt rock of different shapes with glowing orange cracks, then
> three small glowing embers of different sizes. Row 3: a puff of smoke in 4 stages, dense dark grey with a warm
> orange underside, then billowing bigger, then thinning, then a few last wisps. Row 4: a ring of cracked ground
> seen from slightly above (a flat oval of jagged cracks glowing orange, empty in the middle), a flat oval pool of
> molten lava glowing yellow-orange, and a small white-yellow four-pointed flash star. Every piece complete and
> fully inside its own space with empty background all round it, nothing touching the edges or cut off. 16-bit
> pixel art visual effect sprites, chunky pixels with a dark 1-pixel outline, limited bright palette with
> hard-edged shading, no creature or character, plain dark navy background, no text, no labels
