# Roadmap: Coreatures: Deep Archive

Where the game is, what the big roguelikes have that it doesn't yet, and an order to build it in.
Written 2026-10-20 (r81). Claude keeps it current: tick items (`[x]`) as they land, and the owner
decides the order and anything marked **(owner)**. Short-term chores live in `TODO.md`.

## Where we are now

| | Today | Big roguelikes, for scale |
|---|---|---|
| Coreatures | 33 (27 regular, 3 evolved starters, 3 legends); 5 evolve | Creature games ship 100-150+ |
| Moves | 101 | |
| Relics (run items) | 14, plus fused versions | Isaac: several hundred items; Hades: a few hundred boons |
| Held items | 10 | |
| Trainers (characters) | 4, each him or her | Isaac and Slay the Spire: a handful of very different characters |
| Areas | 6 (one per floor), no alternates | Isaac and Dead Cells: alternate paths and secret areas |
| Bosses | 1 boss room per floor, drawn from the area's Coreatures; 1 final boss type | Dozens of hand-made bosses with their own attack patterns |
| Room types | fight, recruit, shop, treasure, boss, altar | Isaac: a dozen or more (secret, challenge, curse, sacrifice...) |
| Modes | normal (6 floors), endless | Daily runs, challenge modes, a difficulty ladder (Hades' Heat) |
| Music | 7 songs | |
| Meta-progression | starters unlocked by bosses, 4 trainer unlocks, best floor | Long unlock trees, achievements, multiple endings, a story told across runs |

**What's already strong:** real-time combat with 8 move kinds, types and statuses; creature collecting
inside a roguelike; evolution plus the relic-fusion altar (no big roguelike does that, it's the hook);
door rewards, champions, area natives; hand-made pixel art with 8-way rigs; relic gear worn by your
team; run saving; runs on phone, PC and gamepad.

**The hook to build on:** *a roguelike where your team is the build.* Every run you collect different
Coreatures, they restore and transform, and relics fuse into them. The roadmap leans into that.

---

## Phase 1: Release blockers (must happen before anything is sold)

- [x] **Our own type system (r87):** 14 types (Fire, Water, Electric, Ice, Plant, Earth, Wind, Metal, Glitch, Arcane, Shade, Phantom, Beast, Brawl), every matchup with a common-sense reason, in both games, plus in-fight cues that make matchups obvious. Follow-ups: re-run the Stadium's balance round robin; maybe rename the poison status to Glitch's own.
- [ ] **Redesign the look-alikes (owner, with generated concept art).** Still flagged: Cinderox (ember or lava calf, a young Infernox), Slumbear (several rounds with the owner), Mindra, Drakorn, and the medium-risk list (Tidalisk and Maelstrisk, Venomire, Scarablade, Brawlix, Thornback, Boulderon). Sparkit and Lumawool are done.
- [ ] **Rename the moves that share Pokémon's move names:** 37 of the 101 do (Thunderbolt, Flamethrower, Shadow Ball, Dark Pulse, Close Combat, Moonblast...). Single common words like Gust or Wish are low risk; a whole list matching theirs isn't. Keep signature moves (Zoomies, Shiba Scream, Blank Stare) as they are: they're ours.
- [ ] **Trademark search** by a lawyer for the game and brand names (see `TODO.md`).
- [ ] **Phone check** of the whole game on the owner's phone (memory, frame rate, controls).

## The Restore system (owner's picks, 2026-10-20): replaces levels

Coreatures don't "level up", they **recover their lost data**. The owner picked four ideas from a list of eight (the others were plain levels, fragment collecting, bond through use and feeding):

- [x] **Restore bar (r88):** each form has a bar from 0 to 100% restored, filled by beating wild Coreatures and Arc-core Shards. Stats grow smoothly with it; the HUD shows the form's stage (I, II, III) instead of a level. At 100% the Coreature **Restores** into its next form ("Smugshi restored: it's Smugshogun again!"). Final forms overflow into altar fuel or a mastery bonus. Grounding: file recovery (rebuilding a damaged file from scattered pieces), a hologram (every piece holds the whole image, blurrier), metamorphosis (smooth growth, then a sudden change of form).
- [x] **Memory choices (r88):** at 25 / 50 / 75%, a pick-1-of-2 between fights: which lost memory comes back (two moves, or a move vs a strength such as speed, toughness or a passive). Replaces "a move every 2 levels".
- [ ] **Branching forms (Digimon-style):** how a Coreature was used (move types, tanking vs dodging, time fighting) decides which form it Restores into when it has more than one. Undiscovered forms show as "???" in the codex. Needs a second form designed per line (owner's image generator), starters first.
- [x] **Glitch risk (r95):** tainted data (Glitch champions, cursed rooms, absorbing data at a full bar) builds corruption; at the limit the Coreature becomes a **Glitched** variant (distorted colours, Glitch as a second type, a strong corrupted move, a drawback). Cleanse at the altar or keep it. Done: Corrupted Shards (a rare room reward, and dropped by the new Glitched champion), the Glitched look, type, Fatal Error and the HP drawback, cleansing at the altar. Not yet: cursed rooms, corruption from data taken at a full bar.

Build order: the bar and memory choices first (code only), then Glitch variants (code-drawn colours), then branching forms (needs new designs).

## Phase 2: Runs that feel different every time (the core of a great roguelike)

The roguelikes people play for hundreds of hours are built on **builds**: items that combine in surprising, sometimes broken ways.

- [ ] **Relic choices:** treasure rooms and chests offer 1 of 3 (with a reroll now and then).
- [ ] **Many more relics: 14 -> 60 by Early Access, 150+ later.** Rarities (common, rare, legendary), every element, and relics that change *how moves behave* (shots split, beams bounce, dashes leave clones, zones follow you), not just stats.
- [ ] **Synergies:** relic sets (two storm relics = a bonus), relic + Coreature-type combos, fused relics that mutate further.
- [ ] **Active items** (like Isaac's space-bar items): a usable artifact that recharges by clearing rooms (a time-stop, a decoy, a heal pulse).
- [ ] **Risk and reward:** a shrine per floor (trade HP or a relic for power), cursed relics, a gamble room.
- [ ] **Floor twists:** a dark floor, a stampede floor, rain, a cursed floor; announced on the floor banner.
- [ ] **More room types:** challenge rooms (waves for a prize), secret rooms (hidden doors), a move tutor, a rival trainer fight, a rest spot, a Coreature nursery (eggs that hatch later in the run).
- [ ] **Smarter wild Coreatures:** each species fights in its own way (kiting, charging, burrowing, summoning, shielding a partner), plus elite versions.

## Phase 3: Bosses and the world

- [ ] **Hand-made bosses:** each area gets 2-3 boss Coreatures with their own attack patterns, phases and arenas (today bosses are just bigger wild Coreatures). About 15-20 by release.
- [ ] **A true final boss** with its own design and story weight (the owner's open question: a Coreature of its own?), and a **secret final floor** for players who meet a hidden condition.
- [ ] **Alternate areas:** two choices per floor (like Isaac's alt paths), so a run's route varies: 6 floors -> 10-12 areas.
- [ ] **The story of the fallen civilization**, told a little each run (Hades-style): terminals in the ruins, the altar's machine, what the Arc-cores really are, why Coreatures lost their forms. Multiple endings.

## Phase 4: Long-term goals (why players keep coming back)

- [ ] **The Deep Archive codex:** a dex of every Coreature, relic, boss and area you've found, filling in as you play; it fits the game's name and gives collectors a goal.
- [ ] **An unlock tree:** permanent upgrades and new options bought with something earned in runs (Hades' Mirror, Dead Cells' cells), balanced so skill still matters.
- [ ] **Achievements** (100+ by release; Steam achievements later) that unlock new relics, Coreatures and trainers, the way Isaac's do.
- [ ] **More trainers (4 -> 8):** each changes how a run plays, not just a stat (one with two Coreatures out at once, one who can't recruit but levels faster, one who fuses relics at any time...).
- [ ] **A difficulty ladder** (like Hades' Heat or Slay the Spire's Ascension): stackable challenges for a reward, for players who've beaten the game.
- [ ] **Daily seeded runs** with a shared leaderboard (needs an online service: decide later, **owner**).
- [ ] **Content scale for 1.0:** about 100-150 Coreatures with evolution lines and branches, 150+ moves, 150+ relics.

## Phase 5: Polish and feel

- [ ] **Onboarding:** a first run that teaches by playing (move, attack, swap, recruit), instead of only the How to Play page.
- [ ] **Game feel:** hit-stop on big hits, stronger screen shake options, better death and victory moments, a run-summary screen worth screenshotting.
- [ ] **Accessibility:** colour-blind-safe type colours, text size, reduced flashing, remappable gamepad buttons.
- [ ] **Audio:** more songs (a title song, alternate areas, boss themes per area), a sound pass on the UI.
- [ ] **Translations** (later; text is already in a few places, so keep new text easy to find).

## Phase 6: Getting it out there

- [ ] **Steam page early (owner):** wishlists decide how many people Steam shows a game to. Capsule art, a short trailer, screenshots.
- [ ] **A free demo** for a Steam Next Fest.
- [ ] **Desktop and phone builds:** Electron or Tauri for Steam, Capacitor for iPhone and Android (the plan in CLAUDE.md); Steam Cloud saves, achievements, controller support badges.
- [ ] **A playtest community (owner):** a Discord, friends and testers, a feedback form.
- [ ] **Early Access target** (a suggestion): about 60 Coreatures, 60 relics, 10 hand-made bosses, 8 areas with some alternates, 6 trainers, the codex, achievements, a difficulty ladder. Then grow to 1.0 with updates.
- [ ] **Later:** co-op (a friend's trainer and Coreature in the same room), the real Arcbracer and Arc-core collectibles (**owner**).

---

## Suggested order

1. **Phase 1** first: the type system and redesigns change data everything else builds on, so they're cheapest now.
2. **Phase 2** next (relic choices, many more relics, synergies): the biggest boost to replay value.
3. **Phase 3** bosses, while relics are being added (bosses test builds).
4. **Phase 4** codex and unlocks, then the difficulty ladder.
5. **Phase 6** Steam page as soon as the game looks like itself (after Phase 1 and some of 2), so wishlists build while the rest is made. Polish (**Phase 5**) runs alongside everything.

A reality check: the famous roguelikes took years. *The Binding of Isaac* started with two people and grew
through several expansions; *Hades* had a studio of about twenty. Early Access exists for exactly this:
release a strong, smaller game and grow it with players.
