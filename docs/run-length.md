# How long should a run be? Research and tests (2026-10-31, r294)

The owner wants a run long and hard enough that a player who chose well feels overpowered by the end, with a story
that completes, and a balance check that scales with the length. This note has what the big roguelikes do, what our
own game does today, what the bots found when they played longer runs, and a recommendation. The numbers for other
games are from their wikis and reviews (links at the end), rounded; run times are for a player who knows the game.

## What the big roguelikes do

| Game | Structure of a winning run | Time for a win | How a run stays fresh |
|---|---|---|---|
| **Hades** | 4 regions in a fixed order (Tartarus ~14 chambers, Asphodel ~10, Elysium ~11, Styx ~5), a boss at the end of each: about 40 chambers | 30-45 min | The build (boons from 9 gods), room rewards shown on doors, no alternate regions (Hades II adds a second route) |
| **Slay the Spire** | 3 acts of 16-17 floors (about 15 fights and events, then the boss), an optional 4th act of 4 floors for the true ending | 45-75 min | Each act has its own enemies, elites and 3 possible bosses; a branching map lets you pick your route |
| **The Binding of Isaac** (Repentance) | 4 chapters of 2 floors, then 1-floor chapters (Sheol/Cathedral, Dark Room/Chest): 8-10 floors; the long path through the alternate chapters is 11-13 | 30-50 min (longer on the alternate path) | Every chapter has 2-4 **floor variants** (Basement / Cellar / Burning Basement: a new look and a few new enemies on the same rules) and a whole **alternate path** (Downpour, Mines, Mausoleum, Corpse: new areas, opened by a choice mid-run) |
| **Dead Cells** | 7-8 biomes per run, chosen stage by stage from about 15 main biomes plus boss biomes | 30-70 min | Branching: at the end of most biomes you pick one of 2-3 exits, so two runs rarely share a route |
| **Monster Train** | 8 battles over 9 rings, 3 of them fixed bosses | 45-60 min | A branching map between battles; no filler fights |
| **Risk of Rain 2** | 5 stages then the final; looping is optional | 45-60 min; 60-90 with loops, where people say it drags | Each stage picks one of 2-3 maps |
| **Enter the Gungeon** | 5 chambers (+2 secret) | 45-60 min | Secret floors, a huge gun pool |
| **Balatro** | 8 antes of 3 blinds | 30-60 min | The deck |

What they share:

- **3-4 acts, each with its own enemies, look and boss**, is the shape of nearly every one. The acts carry the story
  (Hades' regions, the Spire's acts, Isaac's chapters). Within an act, floors are variations, not new worlds.
- **45-60 minutes for a win** is the sweet spot people keep coming back to; the games that run 70-90 minutes (Dead Cells
  with every room explored, Risk of Rain loops, long Isaac paths) are the ones whose communities talk about fatigue.
  About 30 minutes is "a short roguelike". Mid-run saving (which we have) is what makes a long run bearable.
- **Variety comes from choice and variants, not from more fixed floors.** Isaac's floor variants are cheap (a palette,
  a few enemies, the same rules) and its alternate path is the expensive kind (whole new areas); Dead Cells and the Spire
  branch the route instead. Nobody adds more floors in a fixed order to make runs feel different.
- **The power curve:** the Spire and Monster Train are built so a deck that "comes together" wins act 3 easily while a
  weak one dies there; Hades' Heat system then adds difficulty back for people who feel overpowered. The feeling the
  owner wants (strong at the end if you chose well) is the Spire's: the enemies climb a fixed amount, the build compounds.

## Our game today (r293)

- 6 floors in 2 acts of 3; 11-15 rooms a floor; one area per floor in a fixed order.
- A bot's winning run takes 20-32 minutes of game time (24 runs, r291: 1,200-1,900 s). A person is slower (reading,
  menus, careful fights): about 30-45 minutes for a win, which is Hades' length.
- Bots won 18 of 24 before r292's difficulty change; every loss was on floors 1, 2 or 4. Nobody who reached floor 5 lost.

## Tests: longer runs with today's game

Endless mode is a 12-floor run in all but name (floors keep scaling, areas loop, an act boss every 3 floors), so the bots
played endless to floor 12 with three climbs: the game's own, and gentler ones where the wild Coreatures grow 85% and
70% as fast per floor (`&curve=` on test.html; floor 1 is the same in all three). 3 runs per starter each, hard bots.

**Where runs ended (9 runs per climb, 12 floors):**

| Climb | Cleared all 12 | Ended on floor | Game time to floor 12 |
|---|---|---|---|
| the game's (r292) | 8 of 9 | 3 (one run) | 48 min |
| 85% as steep | 9 of 9 | – | 44 min |
| 70% as steep | 8 of 9 | 2 (one run) | 40 min |

**The party floor by floor, the game's climb** (restoration = full bars plus the current one, averaged over the party;
relics held; HP on arriving):

| Floor | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Restoration | 0.6 | 1.3 | 2.0 | 2.6 | 3.3 | 4.0 | 4.6 | 5.1 | 5.6 | 6.0 | 6.5 |
| Relics (of 30) | 1.6 | 4.0 | 7.3 | 10.8 | 14.0 | 17.6 | 20.6 | 23.4 | 26.3 | 27.9 | 29.4 |
| Party size | 2 | 3 | 4 | 5 | 6 | 6 | 6 | 6 | 6 | 6 | 6 |
| HP on arriving | 87% | 81% | 89% | 86% | 92% | 91% | 95% | 98% | 97% | 98% | 98% |
| Time | 2:30 | 6:01 | 11:01 | 16:26 | 21:21 | 26:04 | 30:58 | 35:16 | 39:24 | 43:25 | 47:37 |

What this says:

1. **The climb isn't what decides a run.** Steeper or gentler by 30%, the bots clear 12 floors the same way, and the
   only deaths are on floors 2-3, when the party is one or two Coreatures with a relic or two. From floor 6 on the party
   arrives at every floor with 90-98% HP: the wild Coreatures stop being a threat halfway through, however steep the stats.
2. **The party's growth outruns any linear climb.** By floor 6 it has 6 Coreatures, 14 relics and 3.3 bars each (+50% HP,
   +26% attack); by floor 12 it holds **all 30 relics**, 6.5 bars (+98% HP, +52% attack) and every member Restored.
   Swapping six Coreatures is six health bars. That compounding is exactly what makes a player feel overpowered, which
   is the feeling the owner wants; the problem is that it arrives for everyone, choices or not.
3. **The relic pool is the first wall.** The party holds 14 relics at floor 6 (the run's end today) and the whole pool by
   floor 10; after that every treasure room is a picnic. A 9-floor run wants about 60 relics so that a pick of three is
   still a pick on the last floor; 12 floors want 90+.
4. **Time:** about 4.3 minutes a floor for a bot, so 21 minutes to floor 6, 35 to floor 9, 48 to floor 12. A person is
   slower (reading, menus, careful fights, dying): roughly 1.5x, so 6 floors is 30-35 minutes, 9 is 50-55, 12 is 70-75.


### Fewer relics and recruits (the owner's question)

A third round slowed how fast the party gathers instead of touching the climb (9 floors, 2 runs per starter, the game's
own climb): recruit rooms and treasure rooms only every 2nd floor; the same with a 4-slot Arcbracer; and every 3rd floor
with 4 slots (`&recruitEvery=2&treasureEvery=2&party=4` on test.html).

| Party gathering | Cleared 9 | Ended on floors | Party, relics at floor 9 | HP arriving at floors 6-9 |
|---|---|---|---|---|
| as the game is | 8 of 9 (12 floors) | 3 | 6, 23 | 92-98% |
| recruits and treasure every 2nd floor | 4 of 6 | 2, 2 | 5, 18 | 84-95% |
| ... and a 4-slot Arcbracer | 2 of 6 | 1, 2, 3, 5 | 4, 23 | 84-91% |
| every 3rd floor, 4 slots | 3 of 6 | 2, 2, 3 | 4, 19 | 76-100% |

Two things stand out:

- **It moves the deaths earlier, not later.** A thinner party dies on floors 2-3; whoever survives those still arrives at
  floors 6-9 nearly untouched. The relic count barely drops (the shop sells two a floor and chests keep coming), and the
  party's real growth isn't relics or bodies: it's **restoration**, about 0.65 bars a floor in every setting (+15% HP and
  +8% attack a bar, plus a Restore into the next form), which no amount of fewer rooms slows.
- **Challenge rooms are the early killer.** Of the eight deaths the test could describe, six were in a challenge room
  (three waves, from floor 2) on floors 2-5 with a party of two. The challenge room is tuned for a full party; on floor
  2 it's a trap. (A seventh was a lone Smugshi on floor 1 against a tough Shadefang, which hits Arcane hard: fair.)

So the owner's lever on its own doesn't give the curve either, but it points at the right one: **slow the party's growth
in the middle of the run (restoration, not rooms), and keep the early rooms for a small party.** Used together with the
ramp: a ramp makes the late floors matter; fewer bodies and slower bars keep the choices mattering.

## Recommendation

**1. Length: 9 floors in 3 acts as the standard run, and a hidden 4th act of 3 floors for the true ending.**

- 9 floors is 50-55 minutes for a person: the 45-60 minute sweet spot every big roguelike lands in. 12 floors is 70-75,
  where Dead Cells and Risk of Rain loops get called tiring; the owner wants runs people finish and start again.
- Three acts of three floors is the Spire's shape, the best-liked structure in the genre, and each act is a story beat
  with its own boss (act 1 Slumbear; act 2 a new hand-made boss; act 3 the Archive's Warden).
- The 4th act is how the Spire gives its players both: a run that ends in an hour, and a longer, harder climb with the
  real ending for those who meet a hidden condition during the run (its three keys). For us: a condition found in the
  story (a terminal in each act, say), then three more floors at the top of the curve and a second ending. That's the
  owner's 12 floors, for the players who have earned it, without making every run 12.
- Floors stay as they are (11-15 rooms); the length comes from acts, not longer floors.

**2. What fills the acts: alternates per act now, new areas as the acts get their story.**

- Isaac's lesson is that floor variants are the cheap way to make a long run feel different, and that whole new areas
  are the expensive one, worth doing when they carry something (a path, a boss, a story). Dead Cells and the Spire get
  their variety from branching, not from more fixed floors.
- So: each act has **two areas**, and at the stairs down you pick which one the next floor is (a door to the left or the
  right, like Isaac's alternate path). The six areas now pair up as the three acts' first choices (Meadow / Crater, Summit /
  Grotto, Ruins / Spire); each act's second area comes later, one at a time, as its story beat is written. A new area is
  about four Gemini sheets (props, walls, corners, fill), a native list, a gatekeeper list and a song: a few days each.
- Until an act has two real areas, an **alternate** is a cheap stand-in: the same walls and props in another palette with
  a different native list and a twist baked in (a flooded Meadow, a frozen Crater). Isaac does exactly this (Cellar,
  Burning Basement) and players like them.
- The hidden 4th act is one new area (the Archive's core) and reuses the others' pieces.

**3. The power curve is the real work, not the length.** The tests say the run gets easier the longer it goes; a longer
run as the game is now would be nine floors of which the last five are a victory lap. In order of what to do:

- **A climb that steepens through the run, not a flat one.** A second round of tests ramped the wild Coreatures' growth
  per floor from the game's at floor 2 up to 2.2x, 3x and 4x of it by floor 12 (`&curve=1,2.2`):

  | Climb by floor 12 | Cleared 12 | Ended on floors | HP arriving at floors 7-12 |
  |---|---|---|---|
  | the game's (flat) | 8 of 9 | 3 | 91-98% |
  | ramping to 2.2x | 4 of 9 | 2, 3, 4, 4, 9 | 76-85% |
  | ramping to 3x | 1 of 9 | 2, 2, 4, 6, 6, 6, 8, 9 | 71-92%; 42-53% on 11-12 |
  | ramping to 4x | 0 of 9 | 1, 1, 2, 2, 2, 3, 6, 6, 6 | nobody passed the floor-6 boss |

  The 2.2x ramp is the first shape that looks like a roguelike: deaths spread from floor 2 to floor 9, the party arrives
  at the late floors scuffed rather than untouched, and the best starter still gets through. Steeper than that, the act
  bosses turn into walls (3x: three of six who reached floor 6 died to its boss) before the floors between them get
  dangerous, which is the wrong kind of hard. So the stat climb should ramp (about double the game's growth per floor by
  the last act), and the rest of the difficulty has to come from the things below, not from bigger numbers.

- **More relics, with rarities:** 60 by the time the run is 9 floors (the pool is 30 now and gone by floor 10), 90+ for a
  4th act; common ones early, rare ones late, so the last floors' picks still matter. This is Phase 2 of the roadmap and
  it's what makes "the right choices" exist in the first place.
- **Threat that isn't just numbers:** the bots arrive at late floors at full health because wild Coreatures are three
  scaled-up stat blocks. Late acts should add kinds of danger: rooms of four and five in the big rooms, champions far more
  often (Isaac's champions are 30-50% in late chapters), wild Coreatures in their Restored forms (a stage II Smugshogun
  in act 3, not a bigger Smugshi), elite rooms with a relic behind them, gatekeepers with a pattern or two, and two more
  hand-made act bosses. Each of these is checkable with the bots, floor by floor.
- **Growth that tapers (the tests say this is the lever, see above):** restoration is the party's real engine, about
  0.65 bars a floor whatever else changes. Options to try with the bots: bars past the third give half as much (+8% HP,
  +4% attack), data needs grow faster (`RESTORE_NEED`), a 5-slot Arcbracer as the default with the 6th a late unlock or
  a relic, recruit rooms every other floor from act 2 on, and fewer berries late. And **challenge rooms from floor 4, not
  2**, or two waves on floors 2-3: the bots' early deaths were nearly all in them with a party of two.
- **A difficulty ladder after that** (Hades' Heat) for the players who feel overpowered and want the climb back.

**4. The balance check now scales:** test.html shows where runs end floor by floor and the party's shape on every floor
(restoration, relics, size, HP), and `&maxfloor=`, `&endless=`, `&curve=a,b` try a length and a climb without touching
the game. The target shape for a 9-floor run: hard bots win about a third of runs, losses spread over acts 2 and 3,
almost none on floor 1, and the party arriving at the act bosses with 60-80% HP, not 98%.


## Sources

- Hades: [Underworld structure (gamepressure)](https://www.gamepressure.com/hades/underworld-structure-1/z4d9c4), [Tartarus (wiki)](https://breezewiki.discard.no/hades/wiki/Tartarus), [Elysium (wiki)](https://breezewiki.discard.no/hades/wiki/Elysium), [campaign encounters (PC Invasion)](https://pcinvasion.com/hades-campaign-encounters-guide/2)
- Slay the Spire: [Map generation (wiki)](https://slaythespire.wiki.gg/wiki/Map_Generation), [Wikipedia](https://en.wikipedia.org/wiki/Slay_the_Spire), [Slay the Spire 2 run structure](https://gamerblurb.com/articles/slay-the-spire-2-how-many-acts-full-run-structure-explained), [review (Zatu)](https://zatu.com/en-au/blogs/reviews/slay-the-spire-review)
- The Binding of Isaac: [Chapters (wiki)](https://bindingofisaacrebirth.wiki.gg/wiki/Chapters), [Floor (wiki)](https://bindingofisaacrebirth.wiki.gg/wiki/Floor), [The Corpse (wiki)](https://bindingofisaacrebirth.wiki.gg/wiki/The_Corpse)
- Dead Cells: [Biome (wiki)](https://deadcells.wiki.gg/wiki/Biome), [How long to beat (TheGamer)](https://www.thegamer.com/dead-cells-how-long-beat/), [run length (Twinfinite)](https://twinfinite.net/guides/dead-cells-long-levels-many-how/)
- Monster Train: [review (Boss Rush)](https://bossrush.net/2023/03/game-review-race-through-rings-of-hell-in-monster-train/), [review (Gaming Trend)](https://gamingtrend.com/feature/reviews/all-aboard-next-stop-hell-monster-train-review), [beginner's guide (BlueStacks)](https://www.bluestacks.com/blog/game-guides/monster-train/mstn-beginners-guide-en.html)
- Run length and fatigue: [short-session roguelikes](https://www.twoaveragegamers.com/best-roguelikes-short-sessions/), [Risk of Rain 2 run length (Steam forum)](https://steamcommunity.com/app/632360/discussions/0/1639790664937280264), [Dead Cells run length (Steam forum)](https://steamcommunity.com/app/588650/discussions/0/1489992713713196437), [a developer on shortening runs (itch.io)](https://itch.io/post/13268626)
