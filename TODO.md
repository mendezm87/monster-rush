# To-do

## Where we left off (keep this current at the end of every session)

**2026-10-20 (r91):** the game is *Coreatures: Deep Archive*. Done this session: hand-shaped trainers (8 looks), our own 14 types with in-fight cues, the Restore system's first step (restore bar, memory choices), even starters, and the Restore moment. **Next up, from ROADMAP.md:** Glitch variants (Restore system step 2, code only), then the Phase 1 release blockers (renaming the 37 moves that share Pokémon's names, the look-alike redesigns), relic choices and more relics, branching forms. Waiting on the owner: moving and renaming the repos (below).

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

## Game work waiting its turn

- [x] **Make transformations look cool (done in r91):** the Restore moment (spotlight, the Coreature breaking into its own pixels, swirling data, the new form assembling, flash, burst and its new name). Possible extras: a music sting, per-type flourishes.

## Before any release or real product

- [ ] Trademark search by a lawyer (US, EU, Japan) for *Coreatures*, *Deep Archive*, *Arcbracer* and *Arc-core*. The quick web checks so far are in CLAUDE.md under "Names".
