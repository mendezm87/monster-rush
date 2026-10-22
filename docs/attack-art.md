# Attack art: the audit and the plan

The owner (2026-10-22): "We need to work on the attack animations, a lot of them look like basic squares or
circles. We need to treat them as important as sprites for Coreatures."

Every one of the 101 attacks was frozen mid-move on `moves.html` (the review sheets are the `fx-<type>.png`
pictures made with its Freeze sheet). What follows is what reads as a basic shape, what already works, and
the plan to give attacks the same care as Coreature sprites.

## 1. The audit

Most attacks are built from **five shared templates**, recoloured per type. That's why so many look alike
and why they read as plain shapes: the type changes the colour, not the drawing.

| Template | What it looks like now | Attacks using it |
| --- | --- | --- |
| **Dash smear** | A flat, see-through **coloured rectangle** behind the user, then a **white blob** covering the target. The worst offender: literally a square. | Volt Rush, Megahorn, Iron Slam, Aqua Jet, Brave Dive, Lance Charge, Phantom Strike, Deadline Dash, Wool Tackle, Body Slam, Zoomies, Flame Wheel, Blaze Rush (the last two have flames on top, but the same block underneath) |
| **Helix beam** | A capsule with a white twisted-ribbon pattern inside, **identical for every type** except the colour. | Mega Beam, Hydro Cannon, Tidal Cannon, Flash Cannon, Dazzle Beam, Smug Beam, Supreme Smug Beam, Venom Jet, Dragon Pulse, Aura Cannon (Volt Cannon and Rail Shot are bolts, Psybeam and Spectral Ray are rings) |
| **Ground ring burst** | A **white ellipse** on the ground and a crown of the type's debris flying out. | Heavy Stomp, Quake, Magma Quake, Eruption, Geyser Vent, Shiba Scream, Shiba Roar, Heavy Sigh, Dark Wave, Fatal Error, Discharge |
| **Hex shield / chevrons** | A **honeycomb of hexagons** over the user (defence) or chevrons (attack/speed), the same for every buff. | Iron Defense, Tower Shield, Cotton Guard, Frost Armor, Calm Mind, Bulk Up, Coffee Break, Tailwind, Dragon Dance |
| **Orb shot** | A plain **ball or blob** with a dotted trail. | Thunderbolt, Static Siphon, Gloom Orb, Mind Orbs, Aura Sphere, Sludge Bomb, Acid Spray, Shadow Ball, Spout Shot, Cuff Cannon, Twin Cannon, Mud Shot |
| **Impact cloud** (every hit) | A **white silhouette cloud** over the target on landing, which hides the target and reads as a blob. | Thunder, Seed Bomb, Rock Slide, Magnet Storm, Starfall, Spirit Flames, Quicksand, and most dashes |

**Already working well** (keep their spirit, polish later): Flamethrower, Inferno Beam, Solar Beam, Frost Ray,
Fire Blast's comet, Blizzard's cone, Tornado, Whirlpool and Maelstrom, Bubble Spray, Razor Leaf, Pin Missile,
Air Slash, Razor Gale, Moonblast's star, Dark Pulse's ripple, Blank Stare, Snack Time, Blanket Nap, Wish.
What these have in common: a **drawn shape that means something** (a flame, a leaf, a funnel, a blanket),
not a geometric primitive with a colour.

## 2. What "as important as sprites" means

The same rules as the Coreature art checklist (CLAUDE.md), applied to attacks:
- **One drawing per attack, not per type.** Signature moves get their own art (Smug Beam shouldn't look like
  Hydro Cannon). Shared helpers are fine, shared looks aren't.
- **Real frames.** Every attack has an anticipation (charge, wind-up), a travel, an impact and a fade, drawn as
  pixel art at the sprites' scale (one FX pixel = one sprite pixel, as today), with a 1-pixel ink outline.
- **A silhouette that reads** at game size and in solid black: a spear is long and pointed, a fist is a fist, a
  wave curls. No plain circles, squares or capsules unless the move *is* a ball.
- **Impacts that show the hit, not hide it:** a shaped burst (a crack, a splash, a starburst in the type's
  style) beside and over the target's edge, never a white blob over the whole target.
- **Pictures first.** The owner's Gemini images (concept and pixel-art references, prompts in
  `docs/attack-prompts.md`) before drawing; Claude reviews every attack frame by frame before the owner
  sees it (a frame-strip review on moves.html, like review.html does for Coreatures).

## 3. The plan, in batches (worst first)

1. **Dashes** (13): replace the coloured block with a drawn motion trail per move (speed lines and afterimages
   of the Coreature itself, sparks for Volt Rush, a water jet for Aqua Jet, a horn-shaped lance of light for
   Megahorn, a dive streak with feathers for Brave Dive, a ghostly trail for Phantom Strike...), and a proper
   impact.
2. **The impact cloud** (every hit): shaped impacts per type instead of the white blob. Fixes dozens of moves
   at once.
3. **Beams** (10 helix beams): a body of its own per beam (a torrent with foam for Hydro Cannon, a polished
   light lance with glints for Flash Cannon, a sparkling prism for Dazzle Beam, a lazy, smug, drooping beam with
   a smirk for Smug Beam, a sputtering toxic stream for Venom Jet, a roaring dragon-head of energy for Dragon
   Pulse...), plus a muzzle flash at the source and a splash where it hits.
4. **Ground bursts** (11): shaped shockwaves (cracked earth rings, a lava geyser, a sonic scream with the
   Shiba's AAAH, a sigh cloud) instead of the white ellipse.
5. **Orb shots** (12): each a drawn object (a thunderbolt, a glob of sludge with drips, a spinning aura
   shuriken, a cannon-shaped water slug, a mud clod).
6. **Buffs** (9): per-move animations (iron plates clanking on, cotton puffing up, frost crystals growing,
   muscles flexing with a burst, a coffee cup steaming, a dragon's dance aura).
7. Polish the good ones.

Each batch: the owner runs the prompts for it (`docs/attack-prompts.md`) in Gemini and sends the images they like, Claude draws
the batch and reviews it, the owner checks it in the game.
