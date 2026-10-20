# To-do

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

- [ ] **Make transformations look cool (owner's request, 2026-10-20).** When a Coreature Restores into its next form it should be a big, memorable moment, not just a flash and a banner: e.g. the screen dims, the Coreature breaks into glowing data, the new form assembles piece by piece (like a deploy, but bigger), a burst in its type's colours, a sound and music sting, the trainer reacting, the new name and form shown big. Plan it with the owner once the Restore bar is in (ROADMAP.md, "The Restore system").

## Before any release or real product

- [ ] Trademark search by a lawyer (US, EU, Japan) for *Coreatures*, *Deep Archive*, *Arcbracer* and *Arc-core*. The quick web checks so far are in CLAUDE.md under "Names".
