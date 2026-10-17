# Monster Rush

A real-time, top-down pixel-art **roguelike** in the style of *The Binding of Isaac*, built on the combat engine of the owner's arena game, Monster Battle Stadium (`mendezm87/monster-battle-stadium`, live at https://mendezm87.github.io/monster-battle-stadium/). The owner likes how that game plays: **keep its combat and expand it for dungeons.** Plain HTML5 Canvas + vanilla JS: no build step, no asset files, no dependencies. Scripts load as classic `<script>` tags in `index.html` (globals, not ES modules), so the page also works from `file://`. Runs on phone (touch), PC (mouse + keyboard) and gamepads.

## Where things live

- Repo: `mendezm87/monster-rush` (public). Everything lives on `main`, the default and only branch.
- GitHub Pages (public): https://mendezm87.github.io/monster-rush/ , serving the root of `main`. Pages rebuilds on push; a manual rebuild is `gh api -X POST repos/mendezm87/monster-rush/pages/builds`.
- This repo started as a file copy of Monster Battle Stadium at its commit `178a842` (2026-10-17). The two games are independent from here on: changes here don't flow back, and monster stats may diverge (the arena is tuned for fair 1v1s, this game for runs).

## Workflow

- **Always push after committing** unless the owner says otherwise for that piece of work; no need to ask first, since changes can be rolled back.
- **Work directly on `main`.** The owner doesn't want a clutter of branches; only make a branch if they ask for one, and merge and delete it when done.
- **Bump `VERSION` in `js/main.js` with every change you push** (format `YYYY.MM.DD-rN`). It shows on the title screen so the owner can check a device isn't running a cached older build (GitHub Pages lets browsers cache files for up to 10 minutes).
- **Always test with the sound off.** Right after every page load, run `if (!Sfx.muted) toggleMute()` (mute resets on reload).
- The owner is a hobbyist who prefers plain-language explanations and being shown results; they decide design, Claude proposes and builds.

## The design (decided with the owner)

- **Structure like The Binding of Isaac.** Each floor is a grid of rooms connected by doors. Entering a room with monsters **locks the doors until it's cleared**. A floor has a start room, normal fight rooms, a **boss room** (beat it to open the way down), a **treasure room**, a **shop**, and **recruit rooms**. Clear floors to go deeper.
- **Combat = the arena game's combat, expanded.** Real-time, auto-aimed moves, types, statuses, beams, the newer move kinds, mid-fight swapping. The big expansion: **rooms hold 1–3 wild monsters at once**, all fighting your one active monster (done: auto-aim targets the nearest wild monster, and beams, bursts, zones, vortexes and pools hit every wild monster they touch). Some special rooms hold a single tougher monster.
- **Your team.** Pick **a starter** at the beginning of a run and **recruit** along the way. **Recruit rooms offer a choice of monsters (e.g. pick 1 of 3).** The party has a size limit (6, like now); the player must be able to **release a monster or swap one out** for a newly offered one. One monster is active at a time; you can swap between party members as now.
- **Exploring:** the player controls their active monster directly; **their trainer character walks behind, following them.**
- **Trainer look** (owner liked the vibe of a famous cap-wearing anime trainer, so we made an original take, not a copy): cap pulled low over shadowed eyes, spiky dark hair, popped-collar short-sleeve jacket over a dark tee, fingerless gloves, wristbands, jeans, sneakers. 16x24 sprite, outfit colourways in `TRAINER_OUTFITS`, all shown in the gallery. The owner wants red: Crimson (solid red cap with black brim, red jacket with black collar and sleeves, cream tee) is used in the game; Scarlet, Midnight, Ember and Forest are options. Red is fine, but never that character's exact combo (red cap with white front, red vest with white sleeves, black tee, blue jeans) or his logo.
- **Currency and items, picked up along the way.** Coins drop from fights and rooms and are spent in the shop. Items/relics change how moves work (ideas: "beams also drain", "dashes leave fire", stat ups, healing items, revives).
- **Growth within a run:** monsters **level up** (stats grow).
- **Evolution / transformation:** **some monsters transform** at a level, or with a special item, gaining a new look and new or upgraded moves.
- **Between runs:** unlocks (new starters, monsters, items) are **saved in the browser** (localStorage, wrapped in try/catch) and kept across runs.
- **Permadeath:** if your whole party faints, the run ends. Unlocks stay.

### Decided for the first playable (2026-10-17)

- **Wide screen, and rooms may be bigger than the screen** (Hades-style scrolling). The view is 576x324 world units (canvas 2x); rooms are 576x324, 864x324, 576x486, 864x486, and 864x540 for bosses. Phones are played sideways (a "turn your phone" notice shows in portrait).
- **3 floors per run** (`RUN_FLOORS`); an **endless mode** is wanted later, so floors keep generating from a floor number.
- **Starters:** Smugshi, Cinderox, Tidalisk (`STARTERS`); unlocks can add more.
- **Fainted monsters stay fainted until the next floor**, then get back up at 30% HP (`REVIVE_HP`). Stricter once revives are in the shop.
- **Recruit rooms** offer 3 random monsters not in your party; walk onto a pedestal to see the card. With a full party you pick who to let go. Release also lives in pause > Party (not the monster that's out mid-fight).
- **Berries** (Claude's addition, like Isaac's hearts): 30% of wild monsters drop one, healing 25% of the active monster. Needed because monsters without a heal move otherwise wear down across rooms.
- **Wild monsters are scaled-down arena monsters** (`wildSpec` in `js/dungeon.js`: about 30% HP and 36% attack on floor 1, growing per floor); "tough" single-monster rooms and bosses (bigger sprite, big HP bar, barely knocked back) sit in between. They take turns attacking (`enemyAtkT`). Balance at this point: a hard bot reaches floor 2-3 most runs and clears all 3 about 1 run in 18.
- The 2-player and online modes were removed (`js/net.js` deleted; it's in git history and in the arena repo).

### Decided in the second pass (2026-10-17)

- **Monsters and the trainer turn to face where they go:** every design has `front`, `side` (facing right, flipped for left) and `back` views (`MONSTER_ART[id](grid, view)`). A new monster needs all three, plus the two diagonals in `MONSTER_ART_DIAG` (see the third pass).
- **Leveling:** XP per wild monster beaten (`XP_WILD`/`XP_TOUGH`/`XP_BOSS`), full for the active monster, half for the rest; each level +3.5% HP, +2% attack/defence, heals 5%. Recruits join a level below the party's average.
- **Evolution:** the three starters evolve at level 6 (`EVOLVE_LEVEL`) once a room is cleared: Smugshi -> **Smugshogun** (grown-up Toshi: neck ruff, samurai headband, red cape, still smug), Cinderox -> **Infernox** (fire/ground magma bull: blazing mane, curved horns, lava-cracked rock shoulders, nose ring, glowing eyes), Tidalisk -> **Maelstrisk** (water/dragon sea dragon: coil, teal fin-wings, gold horns, whiskers). Each has its own hand-drawn 44px art in all three views (the owner asked for all-new art, not scaled-up starters). So far only the starters evolve. **More monsters can evolve, but not every monster needs to** (the owner's words); designs get worked out with the owner as we go.
- **Every floor has a shop and a treasure room** (dead ends, like the boss and recruit rooms). The shop sells a Big Berry, a Picnic Basket or Revive Seed, and two relics; the treasure room has one free relic.
- **Relics** (`RELICS` in `js/dungeon.js`) last the run and help the whole party: Leech Lens (beams drain), Ember Tracks (dashes leave fire), Muscle Charm, Iron Shell, Swift Boots, Hourglass, Lucky Coin, Berry Basket, Split Shot, Static Charm, Blast Core.
- **Saved unlocks** (`Save`, localStorage key `monsterRush.save.v1`): beating a monster as a boss unlocks it as a starter; runs, wins and best floor show on the title screen.
- Cinderox got more HP/attack/defence here (1200 / 1.15 / 1.1) and a bigger, quicker Eruption (r 74, delay 0.42, power 300, cd 7), because it has no heal and wild monsters kept stepping out of Eruption; the arena game's numbers are separate.
- **Endless mode** (title screen button, `RunState.endless`): the boss always opens stairs, floors keep scaling (`wildSpec` is linear in the floor number; from floor 4 rooms hold more monsters and more "tough" ones), floor themes loop through `FLOOR_STAGES` (meadow, crater, summit, then Crystal Grotto and Sunken Ruins). Once every relic is owned, treasure rooms give a picnic. The best endless floor is saved (`Save.data.bestEndless`). Bots reach floor 4-6.
- Floors have 11-15 rooms (`target` in `tryFloor`), 4 of them special (recruit, shop, treasure, boss). Level n needs `18 + 11n` XP.
- Balance at this point: the hard bot nearly always clears floor 1 and wins a bit over half its runs (Smugshi most, Cinderox least); most losses come on floor 2.

### Decided in the third pass (2026-10-17, now developed on the owner's Windows PC)

- **Diagonal views (8-way turning)**, asked for by the owner: `fside` (three-quarter front, heading down-right) and `bside` (three-quarter back, heading up-right), both flipped by `face` for the left. They live in `MONSTER_ART_DIAG` in `js/sprites.js` (sets `SPRITES[id].diag`) and `TRAINER_FSIDE`/`TRAINER_BSIDE` in `js/pixel.js`; `viewFor()` picks the view from 8 directions with a little hysteresis (or 4 for a monster without diagonals). **Every monster, the evolved starters and the trainer have them** (the owner approved the first batch, then asked for the rest). The usual recipe: from the front view, shift the face and muzzle 2-4 px toward the right, shrink the far-side ear/arm/eye a little, and move the tail out to the left; for `bside`, take the back view, shift the head right and let a sliver of muzzle or cheek peek out on the right edge. The gallery shows the diagonals and spins through all 8.
- **More music** (the owner: "we only have one song"): `Sfx.music` holds several original songs (`SONGS` in `js/audio.js`; melodies written as note names, `mel('E5.2 G5.4 r.2')`). Rush (floor 1 meadow, the original), Magma March (floor 2 crater, D minor 160), Summit Wind (floor 3 summit, A minor 150, square lead), Deep Echoes (endless grotto and ruins, B minor 138, half-time), Boss Rush (boss rooms until the boss falls, C minor 184), Coin Corner (the shop, F major 112). `roomSong()` in `js/dungeon.js` picks one per room; `Sfx.music.play(name)` crossfades and ignores the song already playing. Levels were checked with `_scheduleAll(seconds, name)`: peaks 0.16-0.20, similar RMS.

### Goals and plans (2026-10-17)

- The owner wants this to become a **full-fledged roguelike**, with **Steam and phones** as the release targets (browser stays for now). Plan: wrap with Electron or Tauri for Steam and Capacitor for phones; consoles only much later. Port-readiness work still to do: bundle the font locally (it comes from Google Fonts now), a settings screen (volume, fullscreen, control remapping), crisp scaling at 1080p/4K, and versioned save data.
- **Before any paid release, the monsters that look too much like Pokémon need redesigns** (e.g. Sparkit ~ Pikachu, Slumbear ~ Snorlax), plus the trainer and the copied type chart. **The owner really likes Slumbear's design**: if it changes, go through several revisions with lots of their input, never a solo redesign.

### Not decided yet (ask the owner when it matters)

Which other monsters evolve and into what (to design together); more relics and unlock types; whether the evolved starters' designs are what the owner wants; a title-screen song.

## Rules carried over from the arena game (keep these)

- **Art style: pixel art at 32px (44px for big monsters).** The owner chose pixel art over a smooth cartoon style (2026-10-17). A 64px "HD" Toshi was tried (`art-test.html`) but looked wrong next to everything else at 32px; HD only works if the whole game (monsters, trainer, rooms, effects) moves to it together, which would be a big job to agree with the owner first.
- **Rooms are lit "HD-2D" style, attacks stay pixel art** (owner's choice, 2026-10-17, after trying `hd2d-test.html`): `js/lighting.js` adds each floor theme's mood light (`STAGES[key].light`), wall torches, soft shadows, a lens blur on the top and bottom edges, floating motes, a tint and a vignette. Everything that's an attack or a warning (beams, shots, particles, zone falls, the dashed warning outlines), plus numbers, bars and the minimap, is drawn after the lighting so it stays crisp and bright. No bloom or glow on attacks (the owner preferred them crisp). Lighting can be switched off (title screen and pause menu, saved as `Save.data.lighting`).
- **Original IP only.** Monsters, names and sprites are original designs, never Pokémon, Nintendo, Palworld or other games' assets. "Like X from game Y" requests become an original monster with a similar vibe (e.g. Mondaze, a burnt-out coffee sloth, answered "something like Palworld's Depresso"). Avoid names ending in "-mon" or using "pocket".
- **Smugshi is the owner's real dog, Toshi** (a Shiba Inu, drawn from the owner's photos: a soft ginger coat, not bright orange; lots of white: a big bib down the chest and belly, white legs, white backs of the thighs, white cheeks rising right up under the eyes; white that runs unbroken from the cheeks down the throat into the chest (no outline under the chin: an outline there read as a double chin), joined to a white sash that runs from the chest up behind the cheek and over the top of the neck (a crescent across the shoulders seen from above or behind); white on the belly, flanks and backs of the thighs; a very fluffy, mostly cream tail curl; big wide-set upright ears with pink insides edged in white fur; pale eyebrow spots; upright triangular ears with pale insides; a big black nose; a flat, unimpressed mouth; a curled tail, ginger on top with white fluff; slim and fox-like from the side; and a famously smug half-closed stare). Colours live in `TOSHI` in `js/sprites.js`. Keep his look and personality: Zoomies, Shiba Scream (its own synthesized "AAAAAH" sound, `shibaScream` in `js/audio.js`, picked via the move's `sfx` field), Smug Beam, Blanket Nap. A natural fit as a starter.
- **Music is an original chiptune** (Game Boy style). Never transcribe real game melodies.
- **18 types** with the real games' type chart; immunities softened to 0.25× because zero-damage matchups are frustrating in real time.
- **Swapping mid-fight doesn't pause the game**; the swapping side is briefly open to attack, with an 8 s cooldown; HP and status carry over.
- **Beam sound:** Normal is the base sound; every other type adds a flavour layer (`BEAM_LAYERS`, levels balanced via `LAYER_GAIN`). Not every monster needs a beam.
- **Move kinds** (comment above `MOVES` in `js/data.js`): projectile, beam, dash, burst, zone, buff, heal, vortex, plus modifiers `drain`, `boomerang`, `hits` (combo dash), `linger` (pools). A new kind needs battle code, drawing, CPU use and dodging (`AI.pick` / `AI.threat`), and a sound level-checked against the others.
- **Balance lesson:** a beam roots its user while it charges and fires, so a fast monster without one gets much stronger against bots. When changing a monster's moves, re-check its stats too.
- **PC controls:** move with WASD/arrows; left click = move 1, right click = move 2, Shift + left = move 3, Shift + right = move 4 (J K L ; also work); Q swaps; Esc/P pauses; M mutes. On PC the move buttons sit in a 2×2 block shaped like the mouse. Touch has a floating stick and move buttons; gamepads use A/B/X/Y, bumpers swap, Start pauses.
- **Floating numbers are rounded** (the pixel font has no decimal point; 245.6 would read "2456").

## Code map

| File | Purpose |
| --- | --- |
| `js/data.js` | `TYPES` (colours and FX palettes), `CHART`, `MOVES`, `ITEMS` (held items), `ROSTER` (20 monsters), `EVOLVED` (evolved starters, not in the wild pool), `ROSTER_BY_ID` (both), `DIFFICULTY` (arena bot levels, used by test bots) |
| `js/pixel.js` | `PixGrid` (shaded ellipses and polygons, auto-outline), bitmap digits, the trainer (`TRAINER_FRONT/BACK/SIDE`, `TRAINER_OUTFITS`, `trainerCanvas(outfit, view)`) |
| `js/sprites.js` | `MONSTER_ART[id](grid, view)`: the procedural monster designs (32px, or 44px for size `L`) in `front` / `side` / `back` (evolved starters are 44px designs of their own); `SPRITES[id].views` |
| `js/arena.js` | Room drawing: `W`/`H` = the 576x324 view, `WALL`, `DOOR_W`, `DOOR_DIRS`, `STAGES` (floor themes: palette, walls, weather), `roomField`, `doorPos`, `roomCanvas` (cached per room) |
| `js/dungeon.js` | `RUN_FLOORS`, `STARTERS`, XP/level constants, `WILD_AI`, `wildSpec`/`makeWave` (who's in a room), `RELICS`, `GOODS`, `genFloor` (Isaac-style grid: start, fights, recruit, shop, treasure, boss), `Save` (unlocks), `RunState` (party, coins, relics, XP, floor, stats) |
| `js/mon.js` | Shared helpers (`rand`, `clamp`, `dist`, `TAU`, ...) and `Mon` (levels, `look()` for facing, `setDef` for evolving) |
| `js/ai.js` | `AI`: one brain per wild monster (the test bots use it too) |
| `js/battle.js` | `Battle` = one room: exploring, doors, pedestals (recruits, shop, treasure), starting and clearing fights, `foe(m)` = nearest target, `foes(m)` = everything an attack can hit, relic checks (`relic(m, id)`), swapping and fainting, loot, XP, evolution, the `update` loop, movement, trainer follow, camera. Also `mixInto`, which lets the class continue in the next two files |
| `js/combat.js` | `mixInto(Battle, class {...})`: moves (`tryMove`, `aim`, `execute`), `hit`, statuses, move actions in flight (dashes, beams, bursts, vortexes), projectiles, zones, thrown balls |
| `js/render.js` | Sprite tints (`tinted`), `ICON_ART`/`itemIcon` for relic and shop icons, and `mixInto(Battle, ...)`: effects (shake, particles, numbers, weather) and all of a room's drawing, minimap included |
| `js/audio.js` | `Sfx`: synthesized SFX (incl. `coin`, `doorShut`, `doorOpen`, `stairs`), `beamCharge`/`beamFire` + per-type layers, `Sfx.music` sequencer, `_offline` render hook for level checks |
| `js/ui.js`, `js/main.js` | HUD (active monster, boss bar), callouts, swap tray, starter / recruit / party / pick / result screens, room-to-room flow (`enterRoom`, `roomHooks`), game loop, `VERSION` |
| `gallery.html` | Sprite gallery (linked from the title screen): every monster and the trainer in front/side/back plus a turning preview, on any floor theme. New monsters appear in it automatically |
| `js/lighting.js` | `Lighting`: room lighting (`apply` after the room and monsters are drawn, `overlay` after the crisp layer), wall torches, soft shadows (`Lighting.shadow`), on/off |
| `js/input.js` | Keyboard, mouse, touch and gamepad input (`Input.dir(p)`, `Input.moves(p)`, `Input.mouse`) |

## Testing

**Run `test.html` after every change** (serve the folder with `python serve.py`, a no-cache version of `python -m http.server 8137`, then open http://localhost:8137/test.html; it also refreshes the browser's copies of the game files itself, so it never tests a stale build). It loads the real game in a frame, stubs `Save.write` so the owner's save is never touched, mutes, and checks: every sprite in all 5 views, every song renders at a sane level, and hard bots play full runs (10 normal + 2 endless per starter by default; `?runs=`, `&endless=`, `&maxfloor=`, `&starter=`). Any error or a bot stuck while exploring fails it; a fight lasting 4+ minutes is listed as a balance note. It takes about a minute. Win rates are noisy at 10 runs, so compare with more runs before reading anything into a change. Baseline (r21): Smugshi 7/10, Cinderox 3/10, Tidalisk 1/10 wins; endless bots reach floor 2-5. After the battle.js split (r22): 8/10, 1/10, 1/10, the same within noise. Recurring note: a recruited Lumawool can get stuck in 4+ minute fights (against Thornback, or another Lumawool), a balance question to raise with the owner.

The bot (in `test.html`) fights with an `AI(DIFFICULTY.hard)`, swaps when a fight passes 45 s, and explores by picking up loot, visiting pedestals (recruits while there's room, takes relics, buys what it can use), then walking to the nearest unvisited room (boss last) and the stairs. For one-off checks in the console:

- Serve the folder as above and open it. `window.__MBS` exposes app state.
- **Mute first** (see Workflow).
- Bot-play: set `App.paused = true` (so the real loop doesn't also step), override `Input.dir` to return an `AI`'s direction in fights (`ai.update(dt, battle.P, battle)` fires moves itself) and a walk-to-the-next-door direction when exploring, stub `UI.pickNext` and `openRecruit`, make `window.transition = fn => fn()`, and step `App.battle.update(1/60)`. A whole run takes a few seconds. Yield (`await setTimeout 0`) every few hundred steps. When the Browser pane is hidden the real game loop doesn't run, so step manually there too. Don't name test globals `W` or `H` (they're the view-size constants).
- Balance checks: full bot runs per starter (floor reached, rooms cleared); log damage taken per move by wrapping `Battle.prototype.hit`. Hard bots favour ranged kits, so read results with that in mind.
- Audio levels: `Sfx._offline(new OfflineAudioContext(...), ({ lib, beamFire, layer }) => ...)` renders silently; compare peak and loudest-50 ms RMS against existing sounds.
