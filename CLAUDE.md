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
- **Combat = the arena game's combat, expanded.** Real-time, auto-aimed moves, types, statuses, beams, the newer move kinds, mid-fight swapping. The big expansion: **rooms hold 1–3 wild monsters at once**, all fighting your one active monster (the engine is currently strictly 1v1, so `Battle`, `AI`, targeting/auto-aim, projectile/zone/beam hit tests and the HUD need multi-enemy support). Some special rooms hold a single tougher monster.
- **Your team.** Pick **a starter** at the beginning of a run and **recruit** along the way. **Recruit rooms offer a choice of monsters (e.g. pick 1 of 3).** The party has a size limit (6, like now); the player must be able to **release a monster or swap one out** for a newly offered one. One monster is active at a time; you can swap between party members as now.
- **Exploring:** the player controls their active monster directly; **their trainer character walks behind, following them.**
- **Currency and items, picked up along the way.** Coins drop from fights and rooms and are spent in the shop. Items/relics change how moves work (ideas: "beams also drain", "dashes leave fire", stat ups, healing items, revives).
- **Growth within a run:** monsters **level up** (stats grow).
- **Evolution / transformation:** **some monsters transform** at a level, or with a special item, gaining a new look and new or upgraded moves.
- **Between runs:** unlocks (new starters, monsters, items) are **saved in the browser** (localStorage, wrapped in try/catch) and kept across runs.
- **Permadeath:** if your whole party faints, the run ends. Unlocks stay.

### Not decided yet (ask the owner when it matters)

Floor count and length of a run; exact recruit-room rules; how leveling/XP works; which monsters evolve and into what; shop prices and the item list; what the first unlocks are; whether 2-player or online come back in any form (the copied 2-player/online code is still in the repo and can be removed if it gets in the way).

## Rules carried over from the arena game (keep these)

- **Original IP only.** Monsters, names and sprites are original designs, never Pokémon, Nintendo, Palworld or other games' assets. "Like X from game Y" requests become an original monster with a similar vibe (e.g. Mondaze, a burnt-out coffee sloth, answered "something like Palworld's Depresso"). Avoid names ending in "-mon" or using "pocket".
- **Smugshi is the owner's real dog, Toshi** (a red Shiba Inu with a cream mask, white socks, white eyebrow spots, a big curled tail and a famously smug half-closed stare). Keep his look and personality: Zoomies, Shiba Scream (its own synthesized "AAAAAH" sound, `shibaScream` in `js/audio.js`, picked via the move's `sfx` field), Smug Beam, Blanket Nap. A natural fit as a starter.
- **Music is an original chiptune** (Game Boy style). Never transcribe real game melodies.
- **18 types** with the real games' type chart; immunities softened to 0.25× because zero-damage matchups are frustrating in real time.
- **Swapping mid-fight doesn't pause the game**; the swapping side is briefly open to attack, with an 8 s cooldown; HP and status carry over.
- **Beam sound:** Normal is the base sound; every other type adds a flavour layer (`BEAM_LAYERS`, levels balanced via `LAYER_GAIN`). Not every monster needs a beam.
- **Move kinds** (comment above `MOVES` in `js/data.js`): projectile, beam, dash, burst, zone, buff, heal, vortex, plus modifiers `drain`, `boomerang`, `hits` (combo dash), `linger` (pools). A new kind needs battle code, drawing, CPU use and dodging (`AI.pick` / `AI.threat`), and a sound level-checked against the others.
- **Balance lesson:** a beam roots its user while it charges and fires, so a fast monster without one gets much stronger against bots. When changing a monster's moves, re-check its stats too.
- **PC controls:** move with WASD/arrows; left click = move 1, right click = move 2, Shift + left = move 3, Shift + right = move 4 (J K L ; also work); Q swaps; Esc/P pauses; M mutes. On PC the move buttons sit in a 2×2 block shaped like the mouse. Touch has a floating stick and move buttons; gamepads use A/B/X/Y, bumpers swap, Start pauses.
- **Floating numbers are rounded** (the pixel font has no decimal point; 245.6 would read "2456").

## Code map (as copied from the arena game)

| File | Purpose |
| --- | --- |
| `js/data.js` | `TYPES` (colours and FX palettes), `CHART`, `MOVES`, `ITEMS`, `ROSTER` (20 monsters), `DIFFICULTY` |
| `js/pixel.js` | `PixGrid` (shaded ellipses and polygons, auto-outline), bitmap digits, trainer sprites (`trainerCanvas`, front and back) |
| `js/sprites.js` | `MONSTER_ART[id](grid)`: the procedural monster designs (32px, or 44px for size `L`) |
| `js/arena.js` | Arena stage generation (`STAGES`: summit, crater, meadow); `W`/`H` = 288×512 world, `FIELD` bounds |
| `js/battle.js` | `Mon`, `AI`, `Battle`: simulation, effects, rendering (canvas is 2× world; sprites at `SPR_SCALE` 1.5). Also has the online "flip" view helpers (`sx`/`sy`/`gy`) |
| `js/audio.js` | `Sfx`: synthesized SFX, `beamCharge`/`beamFire` + per-type layers, `Sfx.music` sequencer, `_offline` render hook for level checks |
| `js/ui.js`, `js/main.js` | HUD, callouts, swap tray, menus, team select, online lobby, game loop, `VERSION` |
| `js/net.js` | Online play (PeerJS + the owner's Metered TURN relay). Probably not needed here |
| `js/input.js` | Keyboard, mouse, touch and gamepad input (`Input.dir(p)`, `Input.moves(p)`, `Input.mouse`) |

## Testing

There is no test suite. Check changes in the browser:

- Serve the folder with `python -m http.server 8137` (another port if the arena game's server is running) and open it. `window.__MBS` exposes app state.
- **Mute first** (see Workflow).
- Bot-play: override `Input.dir`/`Input.moves` so they drive an `AI` for the player, and step `battle.update(1/60)` in a loop; a battle runs in well under a second. Stub `UI.pickNext` to auto-pick. Keep the tab in front during long bot runs (background tabs crawl), and don't name test globals `W` or `H` (they're the world-size constants).
- Balance checks: bot round robins, as in the arena game (hard bots favour ranged kits, so read results with that in mind).
- Audio levels: `Sfx._offline(new OfflineAudioContext(...), ({ lib, beamFire, layer }) => ...)` renders silently; compare peak and loudest-50 ms RMS against existing sounds.
