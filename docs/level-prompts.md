# Level art: the prompts for each area's props and walls

**On a phone:** open https://mendezm87.github.io/monster-rush/prompts.html?f=level for these prompts with a Copy button each.

*Written 2026-10-26 (r258), after the owner looked at the levels and picked "give each area its own look" to start.*

## Why

Every room in every area is the same empty rectangle: a speckled floor, brick walls, a doorway in the middle of each
wall. The six areas only change colour (plus the falling weather and the lighting tint). The Coreatures and attacks have
real personality now; the places they fight in don't.

This round gives each area **its own walls and its own decorations**, from Gemini sheets cut into pieces the same way
the attacks were (`tools/fx-sheets.py`). The game scatters the decorations by each room's seed, so a room looks the same
every time you come back, and no two rooms look alike. This round is **looks only**: you walk over or past everything.

**Room shapes and obstacles come next (step 2).** An L-shaped room or a ring round a pit is the same machinery as a rock
you can't walk through (a solid area the walking, the AI, shots and beams all respect), so shapes are built together with
obstacles and hazards. The big props in these sheets (row 3) are drawn so they can become those obstacles later.

## How to run them

1. **One prompt per image.** Copy a prompt (the text in the grey box) into Gemini on its own. Every prompt is complete.
2. **Send the picture back with its code** (for example "LV-MEADOW-1"). Claude saves it in `docs/refs/` and cuts it
   into pieces.
3. **What to check before sending:** every row has the number of pieces the prompt asks for; nothing is cut off at an
   edge; no boxes, panels or frames behind the pieces; pieces don't overlap or touch. If one piece came out wrong, send
   it anyway and say which.
4. **Order:** any order. Each area is two prompts: **-1** is its props, **-2** its walls and doorways. One area's pair
   is enough for Claude to build and show that area.

### Rules every prompt follows (and why)

- **The game's camera:** top-down, seen from slightly above (the "3/4 view" of 16-bit RPGs). The top wall of a room
  shows its front face; floor things are flat ovals.
- **4 rows at most, an exact count in each row,** lots of empty space, no panels or boxes (the cutting tool finds pieces
  row by row; panels cost a lot of fixing on the attack sheets).
- **No creatures, people or text.** Light from the top left, like the Coreatures.
- **Sizes are given relative to each other** (small, medium, large); the game shrinks every piece to its own size, so
  Gemini only needs to keep them in proportion.
- **Colours in words, matching each area's colours in the game**, so the props sit on its floor and walls.

### What the game does with each row

| Row | Pieces | In the game |
| --- | --- | --- |
| Props row 1 | 6 small floor details | scattered by the dozen, flat on the ground, walked over |
| Props row 2 | 4 medium props | a few per room, near walls and corners, drawn with depth (behind or in front of a Coreature) |
| Props row 3 | 3 large props | one or two in bigger rooms, against the walls; later, obstacles |
| Props row 4 | 3 ground patches | large flat patches under everything, to break up the floor |
| Walls row 1 | 3 wall faces | the top wall, laid side by side |
| Walls row 2 | 3 wall tops seen from above | the side and bottom walls |
| Walls row 3 | 2 doorways | a doorway in the top wall, and one seen from above for the side and bottom walls |
| Walls row 4 | 4 wall decorations | torches, banners, vines and so on, hung on the top wall |

---

## Verdant Meadow (floor 1)

### LV-MEADOW-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. A sunny green meadow. Four neat rows. Row 1, six small flat floor details: a tuft of short grass, a cluster of tiny white daisies, a cluster of tiny yellow buttercups, three small grey pebbles, a clover patch, a tiny pink wildflower. Row 2, four medium props: a cut tree stump with rings on top, a cluster of red-capped mushrooms, a mossy grey boulder, a tall clump of grass with a few seed heads. Row 3, three large props: a round leafy green bush with small red berries, a big moss-covered rock with ferns at its base, a short broken wooden fence section with two posts. Row 4, three large flat ground patches seen from above as flat ovals: a patch of bare brown dirt with a few pebbles, a small clear pond with lily pads, a dense bed of mixed wildflowers.
```

### LV-MEADOW-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls of a sunny meadow: a thick green hedge on a low base of grey fieldstone. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: the hedge with fieldstone below, the same with small white flowers in the hedge, the same with a few stones jutting out. Row 2, three wall sections seen straight from above, the top of the hedge wall as a long horizontal strip of the same thickness with straight ends: plain leafy top, leafy top with a few flowers, leafy top with a bird's nest. Row 3, two doorways: an opening in the hedge wall seen from the front, a dark gap framed by two wooden gateposts with a mossy stone step; and the same opening seen straight from above, a gap in the hedge strip framed by two gateposts. Row 4, four wall decorations seen from the front: a lit lantern on a wooden post, a climbing ivy vine hanging down, a small wooden birdhouse, a clump of tall sunflowers.
```

## Ember Crater (floor 2)

### LV-CRATER-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. A volcanic crater of dark brown and charcoal rock with glowing orange lava. Four neat rows. Row 1, six small flat floor details: a thin glowing orange crack in dark rock, a few small black obsidian shards, scattered grey ash, a tiny ember glowing on the ground, a small cluster of dark pebbles, a small scorch mark. Row 2, four medium props: a short smoking vent in the ground with a wisp of grey smoke, a cluster of sharp black obsidian crystals, a cracked dark boulder with glowing orange veins, a charred dead shrub. Row 3, three large props: a tall jagged basalt pillar, a big dark boulder with lava glowing in its cracks, a small cone of rock with orange lava bubbling at its top. Row 4, three large flat ground patches seen from above as flat ovals: a small pool of glowing orange lava with a dark crust at its edges, a patch of cracked dark rock with glowing seams, a patch of grey ash and cinders.
```

### LV-CRATER-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls of a volcanic crater: rough dark basalt rock with thin glowing orange lava seams. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: jagged basalt rock, the same with a glowing lava seam, the same with a trickle of lava running down. Row 2, three wall sections seen straight from above, the top of the rock wall as a long horizontal strip of the same thickness with straight ends: plain rough rock, rock with a glowing crack, rock with a few obsidian shards. Row 3, two doorways: an opening in the rock wall seen from the front, a dark cave mouth framed by heavy basalt blocks with glowing seams; and the same opening seen straight from above, a gap in the rock strip framed by two basalt blocks. Row 4, four wall decorations seen from the front: an iron brazier full of burning coals, a cracked rock with a small lavafall, a hanging chain with a glowing lantern, a cluster of obsidian crystals growing out of the wall.
```

## Snowy Summit (floor 3)

### LV-SUMMIT-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. A snowy mountain top of white snow and blue-grey stone. Four neat rows. Row 1, six small flat floor details: a small mound of snow, a few blue-grey pebbles poking through snow, a tiny frozen puddle, a patch of frost crystals, a tuft of frozen grass, a small set of animal footprints in snow. Row 2, four medium props: a snow-covered rock, a small cluster of pale blue ice crystals, a snow-dusted dead shrub, a short pile of snowballs. Row 3, three large props: a small pine tree heavy with snow, a tall pillar of clear blue ice, a big grey boulder with a cap of snow. Row 4, three large flat ground patches seen from above as flat ovals: a sheet of shiny pale blue ice, a deep snowdrift, a patch of bare blue-grey stone.
```

### LV-SUMMIT-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls of a snowy mountain top: blue-grey stone blocks capped with thick white snow and hung with icicles. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: stone capped with snow, the same with a row of icicles, the same with a crack full of ice. Row 2, three wall sections seen straight from above, the top of the snowy wall as a long horizontal strip of the same thickness with straight ends: plain snow, snow with a few stones showing, snow with a small drift. Row 3, two doorways: an opening in the stone wall seen from the front, a dark passage framed by two snow-capped stone posts with icicles; and the same opening seen straight from above, a gap in the snowy strip framed by two posts. Row 4, four wall decorations seen from the front: a lantern with a cold blue flame, a frozen waterfall, a tattered blue prayer flag on a pole, a cluster of icicles.
```

## Crystal Grotto (floor 4)

### LV-GROTTO-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. A dark cave of deep purple and indigo stone lit by glowing cyan crystals. Four neat rows. Row 1, six small flat floor details: a tiny glowing cyan crystal shard, a few dark purple pebbles, a small glowing blue mushroom, a thin glowing crack, a little puddle reflecting cyan light, a patch of pale cave moss. Row 2, four medium props: a cluster of glowing cyan crystals, a short dark stalagmite, a clump of glowing blue mushrooms, a purple rock with crystals growing on top. Row 3, three large props: a tall cluster of big glowing cyan crystals, a thick dark stalagmite with a crystal tip, a large geode broken open with glowing purple crystals inside. Row 4, three large flat ground patches seen from above as flat ovals: a still underground pool glowing faintly cyan, a carpet of glowing moss, a patch of crystal gravel.
```

### LV-GROTTO-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls of a crystal cave: rough dark indigo cave rock with glowing cyan crystals growing out of it. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: rough cave rock, the same with a small cluster of crystals, the same with a dripping wet streak. Row 2, three wall sections seen straight from above, the top of the cave wall as a long horizontal strip of the same thickness with straight ends: plain rough rock, rock with small crystals, rock with a glowing crack. Row 3, two doorways: an opening in the cave wall seen from the front, a dark tunnel mouth framed by two crystal-studded rock columns; and the same opening seen straight from above, a gap in the rock strip framed by two crystal clusters. Row 4, four wall decorations seen from the front: a large glowing crystal jutting from the wall, hanging glowing cave roots, a carved old-world glyph glowing cyan in the rock, a small waterfall trickling down.
```

## Sunken Ruins (floor 5)

### LV-RUINS-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Ancient sandstone ruins half buried in sand, warm tan and gold colours. Four neat rows. Row 1, six small flat floor details: a small pile of sand, a cracked sandstone tile, a few broken pottery shards, a small tuft of dry grass, a fallen carved stone fragment, a few small stones. Row 2, four medium props: a broken clay urn, a short broken sandstone column stump, a small stone statue head lying on its side, a cluster of desert shrubs. Row 3, three large props: a tall broken sandstone column, a toppled column lying on its side, a stone block carved with faded old-world glyphs. Row 4, three large flat ground patches seen from above as flat ovals: a patch of carved square floor tiles half covered in sand, a small shallow pool of clear water, a patch of drifting sand dunes.
```

### LV-RUINS-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls of ancient sunken ruins: large weathered sandstone blocks with faded carvings, some cracked, sand piled at the base. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: plain sandstone blocks, the same with a faded carved band, the same with a crack and a vine. Row 2, three wall sections seen straight from above, the top of the sandstone wall as a long horizontal strip of the same thickness with straight ends: plain worn blocks, blocks with sand drifted on top, blocks with a broken gap. Row 3, two doorways: an opening in the wall seen from the front, a dark passage under a carved stone lintel held by two pillars; and the same opening seen straight from above, a gap in the stone strip framed by two pillar tops. Row 4, four wall decorations seen from the front: a faded cloth banner with a gold sun emblem, a carved stone face in the wall, a wall torch in a stone bracket, a cracked niche holding a small urn.
```

## Starlit Spire (floor 6)

### LV-SPIRE-1 · props

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The top of an ancient tower at night: deep indigo stone with gold trim and tiny glowing stars. Four neat rows. Row 1, six small flat floor details: a small gold star inlaid in the floor, a cracked indigo floor tile, a tiny fallen star fragment glowing pale yellow, a small gold rune, a few indigo pebbles, a little pool of starlight on the floor. Row 2, four medium props: a short indigo pedestal with a glowing orb, a gold brazier with a pale flame, a small brass telescope on a stand, a stack of old books. Row 3, three large props: a tall indigo obelisk with gold carvings, a large brass armillary sphere of rings, a broken statue of a robed figure seen from behind with no face. Row 4, three large flat ground patches seen from above as flat ovals: a round gold star map inlaid in the floor, a circle of glowing runes, a patch of indigo tiles with gold edges.
```

### LV-SPIRE-2 · walls and doorways

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. The walls at the top of an ancient tower at night: smooth deep indigo stone blocks trimmed with gold, with tiny stars twinkling in the stone. Four neat rows. Row 1, three wall sections seen from the front, each a wide rectangle of the same height, flat-topped, with straight left and right ends so copies placed side by side join into one long wall: indigo blocks with a gold top edge, the same with a tall narrow window showing the night sky, the same with a gold star emblem. Row 2, three wall sections seen straight from above, the top of the indigo wall as a long horizontal strip of the same thickness with straight ends: plain indigo with a gold edge, with a gold pattern, with a crack. Row 3, two doorways: an opening in the wall seen from the front, a dark arched passage with a gold-trimmed arch and a glowing keystone; and the same opening seen straight from above, a gap in the indigo strip framed by two gold-capped pillars. Row 4, four wall decorations seen from the front: a hanging gold lantern with a pale flame, a deep blue banner with a gold star, a round stained-glass window of a constellation, a gold wall sconce with a floating light.
```

---

## Corners (round 2, r264)

*The owner, after the walls were fixed: "Maybe we should have corners."* Right now a room's corners are just where two walls meet. These give each area real corners: the two top corners where the back wall turns into the side walls, the two bottom corners seen from above, and corner pillars. Same rules as above: one prompt per picture, send it back with its code (for example "LV-MEADOW-3").

### LV-MEADOW-3 · corners (Verdant Meadow)

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Corner pieces for walls made of a thick green hedge on a low base of grey fieldstone, with chunky wooden corner posts, at the same scale as a wall section. Three neat rows of two pieces each. Row 1, the two top corners of a room seen from slightly above: on the left, the top-left corner, where the front face of the back wall ends at a sturdy square corner pillar, and from the pillar the top of a side wall runs straight down, seen from above, ending with a straight cut edge at the bottom; on the right, the same corner mirrored for the top-right. Row 2, the two bottom corners of a room seen straight from above: the top of the wall turning a right angle in an L shape, the same thickness as one wall, with both arms ending in straight cut edges, one for the bottom-left corner and one for the bottom-right corner. Row 3, two square corner pillars seen straight from above, a little wider than the wall, one plain and one with a small decoration on top.
```

### LV-CRATER-3 · corners (Ember Crater)

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Corner pieces for walls made of rough dark basalt rock with thin glowing orange lava seams, at the same scale as a wall section. Three neat rows of two pieces each. Row 1, the two top corners of a room seen from slightly above: on the left, the top-left corner, where the front face of the back wall ends at a sturdy square corner pillar, and from the pillar the top of a side wall runs straight down, seen from above, ending with a straight cut edge at the bottom; on the right, the same corner mirrored for the top-right. Row 2, the two bottom corners of a room seen straight from above: the top of the wall turning a right angle in an L shape, the same thickness as one wall, with both arms ending in straight cut edges, one for the bottom-left corner and one for the bottom-right corner. Row 3, two square corner pillars seen straight from above, a little wider than the wall, one plain and one with a small decoration on top.
```

### LV-SUMMIT-3 · corners (Snowy Summit)

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Corner pieces for walls made of blue-grey stone blocks capped with thick white snow and hung with icicles, at the same scale as a wall section. Three neat rows of two pieces each. Row 1, the two top corners of a room seen from slightly above: on the left, the top-left corner, where the front face of the back wall ends at a sturdy square corner pillar, and from the pillar the top of a side wall runs straight down, seen from above, ending with a straight cut edge at the bottom; on the right, the same corner mirrored for the top-right. Row 2, the two bottom corners of a room seen straight from above: the top of the wall turning a right angle in an L shape, the same thickness as one wall, with both arms ending in straight cut edges, one for the bottom-left corner and one for the bottom-right corner. Row 3, two square corner pillars seen straight from above, a little wider than the wall, one plain and one with a small decoration on top.
```

### LV-GROTTO-3 · corners (Crystal Grotto)

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Corner pieces for walls made of rough dark indigo cave rock with small glowing cyan crystals, at the same scale as a wall section. Three neat rows of two pieces each. Row 1, the two top corners of a room seen from slightly above: on the left, the top-left corner, where the front face of the back wall ends at a sturdy square corner pillar, and from the pillar the top of a side wall runs straight down, seen from above, ending with a straight cut edge at the bottom; on the right, the same corner mirrored for the top-right. Row 2, the two bottom corners of a room seen straight from above: the top of the wall turning a right angle in an L shape, the same thickness as one wall, with both arms ending in straight cut edges, one for the bottom-left corner and one for the bottom-right corner. Row 3, two square corner pillars seen straight from above, a little wider than the wall, one plain and one with a small decoration on top.
```

### LV-RUINS-3 · corners (Sunken Ruins)

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Corner pieces for walls made of large weathered sandstone blocks with sand drifted at their base, at the same scale as a wall section. Three neat rows of two pieces each. Row 1, the two top corners of a room seen from slightly above: on the left, the top-left corner, where the front face of the back wall ends at a sturdy square corner pillar, and from the pillar the top of a side wall runs straight down, seen from above, ending with a straight cut edge at the bottom; on the right, the same corner mirrored for the top-right. Row 2, the two bottom corners of a room seen straight from above: the top of the wall turning a right angle in an L shape, the same thickness as one wall, with both arms ending in straight cut edges, one for the bottom-left corner and one for the bottom-right corner. Row 3, two square corner pillars seen straight from above, a little wider than the wall, one plain and one with a small decoration on top.
```

### LV-SPIRE-3 · corners (Starlit Spire)

*Reworded (r265): the first version kept coming out at odd angles. The game only uses the two corner pillars, so this
asks for just those, standing straight.*

*Done (r266): an older take had two straight-on pillars in its last row, and the game uses those.*

```
16-bit SNES-era pixel art game assets for a top-down RPG, seen from slightly above (3/4 view), crisp chunky pixels, a solid 1-pixel dark outline on every asset, cel shading with three hard-edged tones and light from the top left, flat plain dark navy blue background, lots of empty space between assets, no text, no boxes or panels, no characters or creatures. Two square corner pillars made of smooth deep indigo stone blocks trimmed with gold, side by side in one row with lots of space between them. Both stand perfectly straight and upright, facing the viewer head on, not tilted, not rotated, not drawn at an angle: you see the flat square top of each pillar and its front face below it, like a short square column. The left one is plain with a thin gold cap; the right one is the same with a small glowing gold star on top.
```
