# To-do

## Where we left off (keep this current at the end of every session)

**2026-10-20 (r97):** the game is *Coreatures: Deep Archive*. Done this session: hand-shaped trainers (8 looks), our own 14 types with in-fight cues, the Restore system's first step (restore bar, memory choices), even starters, and the Restore moment. Glitch variants are in (r95: Corrupted Shards, the Glitched champion, the Glitched look, Fatal Error, cleansing at the altar); the owner hasn't seen them yet. **Look-alike redesigns (r96):** both starter lines are redrawn from the owner's picks (Cinderox the basalt calf, Infernox the kiln bull, Tidalisk the rune serpent, Maelstrisk the rune leviathan); the owner hasn't seen them in the game yet. The owner approved them. Mindra is now a three-stage line from all three of the owner's picks (Gyroculus -> Mindra -> Stonicface, r97); the owner hasn't seen them in the game yet. Drakorn: none of the first designs landed; the owner wants "something like Dragonite, but better, maybe a dinosaur that transforms into a dragon", Round 4's dinosaur-to-dragon pairs didn't land either ("all those dragon designs suck"); Round 5 tries cute and cartoony (a 2000s TV cartoon style block; K1-K3 with L1-L3: tiny-arms rex, cloud puff dino, kite-back stego), waiting on the owner's images. Follow-up: put Gyroculus and Stonicface in the Stadium's roster (1v1 stats, round robin). Order agreed: Drakorn, then the medium list, Slumbear last and slowly. Meanwhile Claude can draft the move renames. **Next up, from ROADMAP.md:** the Phase 1 release blockers (renaming the 37 moves that share Pokémon's names, the look-alike redesigns), relic choices and more relics, branching forms. Waiting on the owner: moving and renaming the repos (below). Vic's slowdown with many relics is fixed (r94, confirmed on the owner's phone with `stress.html`); Vic can try the same link.

Things waiting to be done, for the owner and for Claude. Tick them off (`[x]`) or delete them when they're done.

## Move and rename the repos (owner, on the GitHub website)

The game is now *Coreatures: Deep Archive*, but the repo and the play link still say `monster-rush`. The plan is to move both games into the **Waffle Widgets** organization (https://github.com/Waffle-Widgets), make the code private and keep the games public.

For each repo (`monster-rush`, then `monster-battle-stadium`):

- [ ] **Transfer** it to Waffle-Widgets: the repo's Settings > General > Danger Zone > Transfer. Do this before making it private: a private repo on a free personal account loses its GitHub Pages site.
- [ ] **Rename** `monster-rush` while you're there (Settings > General > Repository name), for example to `coreatures-deep-archive`.
- [ ] **Make it private:** Settings > General > Danger Zone > Change visibility. On GitHub Team the Pages site stays public.
- [ ] **Check Pages** still says "main / root" (Settings > Pages) and open the new link.

New play links (with the example name above):
- https://waffle-widgets.github.io/coreatures-deep-archive/
- https://waffle-widgets.github.io/monster-battle-stadium/

## Tell everyone with the old link (owner)

- [ ] Send friends and testers the new links. **The old links stop working** (GitHub doesn't forward github.io addresses after a move).
- [ ] Warn them that **saved progress starts fresh** on the new link: browsers keep saves per web address, so unlocks, best floors and a run in progress on the old link don't come along.
- [ ] Update the link on your own phone (bookmark or home-screen icon).

## After the move (Claude, once the owner says it's done)

- [ ] Point this PC's copies at the new repo addresses (`git remote set-url`) for both games.
- [ ] Update the links in `README.md` and `CLAUDE.md` (both games), and the Stadium link in this game's README.
- [ ] Check both games load from the new links.

## Issues to look into

- [x] **Slowdown after picking up lots of relics (reported by Vic, 2026-10-20; not confirmed as a bug yet).** Vic felt the game slow down after collecting a lot of power-ups; it then went away and didn't come back, even after more relics. **Device: a mobile phone, in the browser** (which phone and browser not known). That fits suspect 1: phones are several times slower than the dev PC at drawing a whole dressed sprite set, and phone browsers pause longer to clean up freed canvases. Leading suspects, from the code:
  1. **Dressing the party in relic gear.** Picking up a relic that's worn (`gear` in RELICS) calls `RunState.dress()`, which builds a new dressed sprite set (`gearSprites` in gear.js) for every party member whose gear changed: every frame of every view, all at once. About 15 ms per Coreature on the dev PC, far more on a phone, so 6 Coreatures can mean a noticeable hitch, and each new combination of gear is a new set. Once every gear spot (head, eyes, neck, feet) is taken, later relics often don't change what's worn, or are auras, which fits "it didn't come back". Fix idea: build dressed sets in the background a few frames at a time (like `warmSprites`), or only for the Coreature that's out first.
  2. **Relic auras** (sparks, embers, berries, water rings drawn every frame round every Coreature) piling up with lots of relics. This would be a steady cost rather than a passing one, so less likely.
  3. **Memory clean-up:** freeing old dressed sets (`forgetGear`) and old canvases can make the browser pause to collect garbage, especially on iPhone.
  How to check: time `dress()` on each relic pickup, and log frame times through a run that collects 10+ relics (on the dev PC and on a phone). Note whether it lines up with picking up worn relics.
  **Measured 2026-10-20 (dev PC, party of 6, every relic added one by one): suspect 1 confirmed.** Each worn relic: 130-180 ms frozen and 1,090 new canvases (a whole dressed set per Coreature). Aura relics: 0 ms, 0 canvases. On a phone that's likely a freeze of half a second or more per worn relic, plus a burst of canvas memory (the phone-memory problem from r67). **Fix to build next:** make `gearSprites` build in steps like `warmSprites` (a generator, a few ms per frame, the Coreature that's out first) and have `monSprite` show the old or plain set until the new one is ready; then measure again.
  **Fixed in r92:** dressed sets now build in the background (steps of about 6-8 ms, sometimes 15, instead of one 130-180 ms freeze per worn relic), and old ones are freed a batch at a time. Measured on the dev PC only: worth asking Vic (or checking on a phone) whether it still hitches. **Owner's phone (Android, Chrome, r93):** still 7-18 hitches over 50 ms after each relic, worst 550 ms, while a fight with 6 was nearly smooth (2 hitches). **r94 fix:** dressed pictures are now drawn one at a time the first time they're shown, instead of whole sets in the background (a pickup is about 0.3 ms on the dev PC; benched Coreatures cost nothing). **Confirmed fixed on the owner's phone (r94):** standing still worst frame 22 ms; every relic and two fights of 6 stayed at 13-27 ms, no hitches over 50 ms. To re-check after big changes:  open https://mendezm87.github.io/monster-rush/stress.html, tap Auto relics, then Horde a few times, and send back what Copy results gives (green under 25 ms is smooth, yellow under 50, red is a visible hitch).

## Game work waiting its turn

- [x] **Make transformations look cool (done in r91):** the Restore moment (spotlight, the Coreature breaking into its own pixels, swirling data, the new form assembling, flash, burst and its new name). Possible extras: a music sting, per-type flourishes.

## Before any release or real product

- [ ] Trademark search by a lawyer (US, EU, Japan) for *Coreatures*, *Deep Archive*, *Arcbracer* and *Arc-core*. The quick web checks so far are in CLAUDE.md under "Names".
