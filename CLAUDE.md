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

- **Monsters and the trainer turn to face where they go:** every design has `front`, `side` (facing right, flipped for left) and `back` views (`MONSTER_ART[id](grid, view)`). A new monster needs all three.
- **Leveling:** XP per wild monster beaten (`XP_WILD`/`XP_TOUGH`/`XP_BOSS`), full for the active monster, half for the rest; each level +3.5% HP, +2% attack/defence, heals 5%. Recruits join a level below the party's average.
- **Evolution:** the three starters evolve at level 6 (`EVOLVE_LEVEL`) once a room is cleared: Smugshi -> **Smugshogun** (grown-up Toshi: neck ruff, samurai headband, red cape, still smug), Cinderox -> **Infernox** (fire/ground magma bull: blazing mane, curved horns, lava-cracked rock shoulders, nose ring, glowing eyes), Tidalisk -> **Maelstrisk** (water/dragon sea dragon: coil, teal fin-wings, gold horns, whiskers). Each has its own hand-drawn 44px art in all three views (the owner asked for all-new art, not scaled-up starters). So far only the starters evolve. **More monsters can evolve, but not every monster needs to** (the owner's words); designs get worked out with the owner as we go.
- **Every floor has a shop and a treasure room** (dead ends, like the boss and recruit rooms). The shop sells a Big Berry, a Picnic Basket or Revive Seed, and two relics; the treasure room has one free relic.
- **Relics** (`RELICS` in `js/dungeon.js`) last the run and help the whole party: Leech Lens (beams drain), Ember Tracks (dashes leave fire), Muscle Charm, Iron Shell, Swift Boots, Hourglass, Lucky Coin, Berry Basket, Split Shot, Static Charm, Blast Core.
- **Saved unlocks** (`Save`, localStorage key `monsterRush.save.v1`): beating a monster as a boss unlocks it as a starter; runs, wins and best floor show on the title screen.
- Cinderox got more HP/attack/defence here (1200 / 1.15 / 1.1) and a bigger, quicker Eruption (r 74, delay 0.42, power 300, cd 7), because it has no heal and wild monsters kept stepping out of Eruption; the arena game's numbers are separate.
- **Endless mode** (title screen button, `RunState.endless`): the boss always opens stairs, floors keep scaling (`wildSpec` is linear in the floor number; from floor 4 rooms hold more monsters and more "tough" ones), floor themes loop through `FLOOR_STAGES` (meadow, crater, summit, then Crystal Grotto and Sunken Ruins). Once every relic is owned, treasure rooms give a picnic. The best endless floor is saved (`Save.data.bestEndless`). Bots reach floor 4-6.
- Floors have 11-15 rooms (`target` in `tryFloor`), 4 of them special (recruit, shop, treasure, boss). Level n needs `18 + 11n` XP.
- Balance at this point: the hard bot nearly always clears floor 1 and wins a bit over half its runs (Smugshi most, Cinderox least); most losses come on floor 2.

### Not decided yet (ask the owner when it matters)

Which other monsters evolve and into what (to design together); more relics and unlock types; whether the evolved starters' designs are what the owner wants.

## Rules carried over from the arena game (keep these)

- **Original IP only.** Monsters, names and sprites are original designs, never Pokémon, Nintendo, Palworld or other games' assets. "Like X from game Y" requests become an original monster with a similar vibe (e.g. Mondaze, a burnt-out coffee sloth, answered "something like Palworld's Depresso"). Avoid names ending in "-mon" or using "pocket".
- **Smugshi is the owner's real dog, Toshi** (a Shiba Inu, drawn from the owner's photos: a soft ginger coat, not bright orange; lots of white: a big bib down the chest and belly, white legs, white backs of the thighs, white cheeks rising right up under the eyes; pale eyebrow spots; upright triangular ears with pale insides; a big black nose; a flat, unimpressed mouth; a curled tail, ginger on top with white fluff; slim and fox-like from the side; and a famously smug half-closed stare). Colours live in `TOSHI` in `js/sprites.js`. Keep his look and personality: Zoomies, Shiba Scream (its own synthesized "AAAAAH" sound, `shibaScream` in `js/audio.js`, picked via the move's `sfx` field), Smug Beam, Blanket Nap. A natural fit as a starter.
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
| `js/battle.js` | `Mon` (levels, `look()` for facing, `setDef` for evolving), `AI` (one brain per wild monster), `Battle` = one room: exploring, doors, pedestals (recruits, shop, treasure), multi-enemy fights (`foe(m)` = nearest target, `foes(m)` = everything an attack can hit), relic effects (`relic(m, id)`), loot, XP, evolution, trainer follow, camera, rendering, minimap; `ICON_ART`/`itemIcon` for relic and shop icons |
| `js/audio.js` | `Sfx`: synthesized SFX (incl. `coin`, `doorShut`, `doorOpen`, `stairs`), `beamCharge`/`beamFire` + per-type layers, `Sfx.music` sequencer, `_offline` render hook for level checks |
| `js/ui.js`, `js/main.js` | HUD (active monster, boss bar), callouts, swap tray, starter / recruit / party / pick / result screens, room-to-room flow (`enterRoom`, `roomHooks`), game loop, `VERSION` |
| `gallery.html` | Sprite gallery (linked from the title screen): every monster and the trainer in front/side/back plus a turning preview, on any floor theme. New monsters appear in it automatically |
| `js/input.js` | Keyboard, mouse, touch and gamepad input (`Input.dir(p)`, `Input.moves(p)`, `Input.mouse`) |

## Testing

There is no test suite. Check changes in the browser:

- Serve the folder with `python -m http.server 8137` (another port if the arena game's server is running) and open it. `window.__MBS` exposes app state.
- **Mute first** (see Workflow).
- Bot-play: set `App.paused = true` (so the real loop doesn't also step), override `Input.dir` to return an `AI`'s direction in fights (`ai.update(dt, battle.P, battle)` fires moves itself) and a walk-to-the-next-door direction when exploring, stub `UI.pickNext` and `openRecruit`, make `window.transition = fn => fn()`, and step `App.battle.update(1/60)`. A whole run takes a few seconds. Yield (`await setTimeout 0`) every few hundred steps. When the Browser pane is hidden the real game loop doesn't run, so step manually there too. Don't name test globals `W` or `H` (they're the view-size constants).
- Balance checks: full bot runs per starter (floor reached, rooms cleared); log damage taken per move by wrapping `Battle.prototype.hit`. Hard bots favour ranged kits, so read results with that in mind.
- Audio levels: `Sfx._offline(new OfflineAudioContext(...), ({ lib, beamFire, layer }) => ...)` renders silently; compare peak and loudest-50 ms RMS against existing sounds.
