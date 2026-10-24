# Turns the owner's attack reference sheets (docs/refs, Gemini pixel-art effect sheets) into the game's attack
# frames: removes the background, finds the frames, shrinks each to the game's pixel size (one sprite pixel each),
# tidies the colours, and writes js/fx-sheets.js (each sheet a small PNG as a data URL, plus where its frames are).
# Data URLs, not image files: the effect layer reads its own pixels back every frame, and an image loaded from a
# file:// address would block that.  Run: python tools/fx-sheets.py   (then review: python tools/fx-sheets.py --sheet)
# Shared with the Stadium (js/fx-sheets.js is a shared file, like fx.js).
import io, os, sys, json, base64
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFS = os.path.join(ROOT, 'docs', 'refs')

# id: (reference, px: the height of its tallest frame in sprite pixels, frames in each row of the sheet). px is chosen so
# the game draws the frames at about one pixel per sprite pixel (big attacks get more pixels, not bigger ones).
SHEETS = {
    'flameWheel':    ('f1-flame-wheel.png', 56, [5]),
    'blazeRush':     ('f2-blaze-rush.png', 56, [5]),
    'flamethrower':  ('f3-flamethrower.png', 40, [3, 2]),
    'fireBlast':     ('f4-fire-blast.png', 34, [5]),
    'eruption':      ('f5-eruption.png', 90, [5]),
    'infernoBeam':   ('f6-inferno-beam.png', 34, [2, 2]),
    'steamEruption': ('f7-steam-eruption.png', 80, [5]),
    'magmaWave':     ('f8b-magma-wave.png', 52, [4, 4]),   # the owner's second sheet: 8 frames, nothing cut off
    # batch 3, water (W1-W5)
    'hydroCannon':   ('w1-hydro-cannon.webp', 40, [2, 2, 2, 2]),
    'tidalCannon':   ('w2-tidal-cannon.webp', 48, [3, 2, 2, 2]),
    'bubbleSpray':   ('w3-bubble-spray.png', 26, [8]),
    'waterShot':     ('w4-water-shot.png', 24, [8]),     # Spout Shot, Cuff Cannon, Twin Cannon
    'geyserVent':    ('w5-geyser-vent.png', 70, [5, 4]),
    'whirlpool':     ('w6-whirlpool.webp', 90, [4, 4]),
    'maelstrom':     ('w7-maelstrom.webp', 100, [4, 4]),
    # batch 4, electric (E1-E4)
    'thunderbolt':   ('e1-thunderbolt.png', 30, [8]),
    'thunder':       ('e2-thunder.png', 110, [8]),
    'discharge':     ('e3-discharge.png', 60, [4, 4]),
    'voltCannon':    ('e4-volt-cannon.webp', 40, [2, 2, 2, 2]),
    'thunderBolt':   ('e2c-thunder-bolt.png', 115, [4, 4]),   # Thunder's bolt (r176), under E2b's cloud
    'railShot':      ('e5-rail-shot.png', 34, [2, 2, 2, 2]),    # E5, the owner sent two takes: a shot plays one of them
    'railShotB':     ('e5b-rail-shot.png', 34, [2, 2, 2, 2]),
    # pieces (r182): parts that code moves. P1, Eruption: flame tongue x4, rocks x3, embers x3, smoke x4, crack ring, lava pool, flash
    'eruptionParts': ('p1-eruption-pieces.png', 54, [4, 6, 4, 3]),
    # COMMON-1 (docs/attack-pieces.md): dust x4, pebbles x3, shock ring, crack star, impact star x3, speed lines x2, sparkles x2, wind curl
    'common1':       ('pk-common-1.png', 40, [4, 5, 5, 3]),
    # COMMON-2: arrows x3 (attack, defence, speed), big plus, small plus, gold sparkle, white sparkle, gold ring, aura flame x3, shield dot, power burst, speed swoosh
    'common2':       ('pk-common-2.png', 34, [3, 4, 4, 3]),
    # HITS-1: one row per look (fire, water, electric, ice): a burst in 3 frames, then 3 bits
    'hits1':         ('pk-hits-1.png', 28, [6, 6, 6, 6]),
    # HITS-2: plant, earth, wind, metal (a burst in 3 frames, then 3 bits each)
    'hits2':         ('pk-hits-2.png', 28, [6, 6, 6, 6]),
    # HITS-3: arcane, shade, phantom, dragonkin (a burst in 3 frames, then 3 bits each)
    'hits3':         ('pk-hits-3.png', 28, [6, 6, 6, 6]),
    # HITS-4: beast, brawl, glitch, critical (a burst in 3 frames, then 3 bits each)
    'hits4':         ('pk-hits-4.png', 28, [6, 6, 6, 6]),
    # SMUG-1: smug beam sections x4, smirk tip x3, charge glow x3, supreme beam sections x4, petals x3, sparkles x2
    'smug1':         ('pk-smug-1.png', 24, [4, 6, 4, 5]),
    # SMUG-1b: patterned body x4, core strand x4, muzzle x3 + smug face, impact x4
    'smug1b':        ('pk-smug-1b.png', 40, [4, 4, 4, 4]),
    # BEAST-2: stars x6 (two spinning loops of 3), speed lines x2 + zigzag, sound waves x3 + shout lines x2, shout bubble x3
    # SMUG-1c: supreme body x4, core strand x4, muzzle x4, impact x4
    'smug1c':        ('pk-smug-1c.png', 44, [4, 4, 4, 4]),
    # BEAST-3: cookie x4 (bites), crumbs x5 + milk, blanket x3 (falling, settling, tucked), Z x3, moon, star
    'beast3':        ('pk-beast-3.png', 30, [4, 6, 3, 5]),
    # BEAST-1: Mega Beam body x4, core x4, muzzle x4, impact x4
    'beast1':        ('pk-beast-1.png', 28, [4, 4, 4, 4]),
    # BEAST-4: sigh cloud x4, mug x2 + steam x3, wool x3 + sparks x2, beans x2 + jitter line + droopy wind + sweat drop
    'beast4':        ('pk-beast-4.png', 34, [4, 5, 5, 5]),
    # FIRE-2a: Flamethrower body x4 (a fireball at each one's right end), core x4, head x4 (stub + fireball), impact x4
    'fire2a':        ('pk-fire-2a.png', 30, [4, 4, 4, 4]),
    # FIRE-2b: Inferno Beam body x4, core x4, muzzle x4 (flash + ring + stub), impact x4
    'fire2b':        ('pk-fire-2b.png', 30, [4, 4, 4, 4]),
    # FIRE-3: fireball x4, explosion x4, flame crescent x3 + scorch, comet head x3
    'fire3':         ('pk-fire-3.png', 40, [4, 4, 4, 3]),
    # FIRE-4: vent x2 + droplets x2, steam geyser x3, steam puff x4, lava glob x2 + lava splash x3
    'fire4':         ('pk-fire-4.png', 40, [4, 3, 4, 5]),
    # WATER-1a: Hydro Cannon torrent x4, core x4, muzzle x4 (swirl + stub), impact x4 (splash on the left, beam from the right)
    'water1a':       ('pk-water-1a.png', 40, [4, 4, 4, 4]),
    # WATER-1b: Tidal Cannon wave panel x4, core x4, muzzle x4 (whirl + arrow stub), impact x4 (wave on the left, beam from the right)
    'water1b':       ('pk-water-1b.png', 40, [4, 4, 4, 4]),
    # WATER-2: water slug x4, splash x4, bubble wobble x3 + pop x3, droplets x3 + spray puff
    'water2':        ('pk-water-2.png', 30, [4, 4, 6, 4]),
    # WATER-3: streamer x3 + geyser x3, wave arc x3, whirlpool x3, foam x2 + rune stone x2
    'water3':        ('pk-water-3.png', 40, [6, 3, 3, 4]),
    # PLANT-1: spinning leaf x5, leaves x3 + pollen x2, seed pod x2 + burst x4, shadow + grass tuft
    'plant1':        ('pk-plant-1.png', 30, [5, 5, 6, 2]),
    'beast2':        ('pk-beast-2.png', 48, [6, 2, 5, 3]),   # (cut from MANUAL boxes: Gemini laid its rows out unevenly)
    'stormCloud':    ('e2b-storm-cloud.png', 36, [8]),   # Thunder's cloud (E2's own is sliced flat at the sides; its bolt is kept)
    'staticSiphon':  ('e6-static-siphon.png', 28, [8]),
    # batch 1 (dashes D1-D10, hit impacts I1)
    'voltRush':      ('d1-volt-rush.png', 46, [5]),
    'voltRushB':     ('d1b-volt-rush.png', 46, [5]),
    'aquaJet':       ('d2-aqua-jet.png', 46, [5]),
    'megahorn':      ('d3-megahorn.png', 46, [5]),
    'ironSlam':      ('d4-iron-slam.png', 46, [5]),
    'braveDive':     ('d5-brave-dive.png', 46, [5]),
    'lanceCharge':   ('d6-lance-charge.png', 46, [5]),
    'phantomStrike': ('d7-phantom-strike.png', 46, [5]),
    'deadlineDash':  ('d8-deadline-dash.png', 46, [5]),
    'slamWool':      ('d9-body-slam-wool-tackle.webp', 46, [5, 5]),   # row 1 Body Slam, row 2 Wool Tackle
    'zoomies':       ('d10-zoomies.png', 46, [5]),
    'impacts':       ('i1-impacts.webp', 24, [5] * 15),   # one row per look: fire, water, electric, ice, plant, earth, wind, metal, arcane, shade, phantom, beast, brawl, dragonkin, glitch
}

def bg_mask(im, keep=400):
    """True where a pixel is the plain background (close to the colour in the corners)."""
    w, h = im.size
    cs = [im.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
    bg = tuple(sorted(c[i] for c in cs)[1] for i in range(3))
    px = im.load()
    m = [[False] * w for _ in range(h)]
    for y in range(h):
        row = m[y]
        for x in range(w):
            r, g, b = px[x, y]
            row[x] = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) < 30
    # small patches of background-like colour inside an effect (dark crust, smoke shading) are part of it: only
    # patches touching the edge of the picture, or big ones (the hole in a ring of fire), are background
    seen = [[False] * w for _ in range(h)]
    for sy in range(h):
        for sx in range(w):
            if not m[sy][sx] or seen[sy][sx]: continue
            stack, comp, edge = [(sx, sy)], [], False
            seen[sy][sx] = True
            while stack:
                x, y = stack.pop(); comp.append((x, y))
                if x in (0, w - 1) or y in (0, h - 1): edge = True
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and m[ny][nx] and not seen[ny][nx]: seen[ny][nx] = True; stack.append((nx, ny))
            if not edge and len(comp) < keep:
                for x, y in comp: m[y][x] = False
    return m

def spans(counts, gap, minlen):
    """Runs of non-zero counts, joined across gaps smaller than `gap`, dropping runs shorter than minlen."""
    out, start, last = [], None, None
    for i, v in enumerate(counts):
        if v:
            if start is None: start = i
            elif i - last > gap: out.append([start, last]); start = i
            last = i
    if start is not None: out.append([start, last])
    return [s for s in out if s[1] - s[0] + 1 >= minlen]

def frames_of(im, m, counts):
    """The frames: each row of the sheet split into its known number of frames, at the emptiest columns near
    where the boundaries would be if they were evenly spaced (sparks often bridge the gaps)."""
    w, h = im.size
    rowc = [sum(1 for x in range(w) if not m[y][x]) for y in range(h)]
    rows = spans([1 if c > 2 else 0 for c in rowc], 26, 30)
    if len(rows) != len(counts):   # rows packed tight (a grid): split at the emptiest rows near even spacing
        ys = [y for y in range(h) if rowc[y] > 2]; a, b = ys[0], ys[-1]; n = len(counts)
        cuts = [a - 1]
        for i in range(1, n):
            e, r = a + (b - a) * i / n, (b - a) / n * 0.3
            cuts.append(min(range(int(e - r), int(e + r) + 1), key=lambda y: (rowc[y], abs(y - e))))
        cuts.append(b + 1)
        rows = [[cuts[i] + 1, cuts[i + 1] - 1] for i in range(n)]
    out = []
    for (y0, y1), n in zip(rows, counts):
        cols = [sum(1 for y in range(y0, y1 + 1) if not m[y][x]) for x in range(w)]
        xs = [x for x in range(w) if cols[x] > 0]
        a, b = xs[0], xs[-1]
        segs = spans([1 if c > 0 else 0 for c in cols], 18, 1)   # clear gaps between frames, when there are exactly enough
        if len(segs) == n:
            for x0, x1 in segs:
                ys = [y for y in range(y0, y1 + 1) if any(not m[y][x] for x in range(x0, x1 + 1))]
                out.append((x0, ys[0], x1, ys[-1], (y0, y1)))
            continue
        cuts = [a - 1]
        for i in range(1, n):
            e, r = a + (b - a) * i / n, (b - a) / n * 0.3
            lo, hi = int(e - r), int(e + r)
            cuts.append(min(range(lo, hi + 1), key=lambda x: (cols[x], abs(x - e))))
        cuts.append(b + 1)
        for i in range(n):
            x0, x1 = cuts[i] + 1, cuts[i + 1] - 1
            cx = [x for x in range(x0, x1 + 1) if cols[x] > 0]
            ys = [y for y in range(y0, y1 + 1) if any(not m[y][x] for x in range(cx[0], cx[-1] + 1))]
            out.append((cx[0], ys[0], cx[-1], ys[-1], (y0, y1)))
    return out

# Sheets shrunk keeping their bright lines: a pixel that a bright line runs through takes the line's colour, instead
# of averaging it with the dark outline round it (thin lightning forks turned dark grey). The older sheets were made
# before this and the owner approved them as they are, so it's per sheet.
CLEAN_SHRINK = {'thunderbolt', 'thunder', 'thunderBolt', 'hits1', 'hits2', 'hits3', 'hits4', 'smug1b', 'smug1c', 'beast1', 'railShot', 'railShotB', 'discharge', 'voltCannon', 'staticSiphon'}

# Small accents that must survive the shrink (E6's green draining sparks): a pixel any of them runs through takes their colour
ACCENT = {'staticSiphon': lambda r, g, b: g > r + 15 and g > b + 40}

def shrink(im, m, box, k, clean=False, accent=None):
    x0, y0, x1, y1 = box[:4]
    crop = im.crop((x0, y0, x1 + 1, y1 + 1)).convert('RGBA')
    px = crop.load()
    for y in range(crop.size[1]):
        for x in range(crop.size[0]):
            if m[y0 + y][x0 + x]: px[x, y] = (0, 0, 0, 0)
    W, H = max(1, round(crop.size[0] / k)), max(1, round(crop.size[1] / k))
    small = crop.resize((W, H), Image.BOX)
    if clean:
        sp, cp = small.load(), crop.load(); cw, ch = crop.size
        for y in range(H):
            for x in range(W):
                xa, xb = int(x * cw / W), max(int(x * cw / W) + 1, int((x + 1) * cw / W))
                ya, yb = int(y * ch / H), max(int(y * ch / H) + 1, int((y + 1) * ch / H))
                cells = [cp[i, j] for j in range(ya, yb) for i in range(xa, xb)]
                lit = [c for c in cells if c[3] and c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 > 150]
                if len(lit) >= len(cells) * 0.15:
                    n = len(lit); sp[x, y] = (sum(c[0] for c in lit) // n, sum(c[1] for c in lit) // n, sum(c[2] for c in lit) // n, 255)
                acc = [c for c in cells if c[3] and accent and accent(*c[:3])]
                if len(acc) >= 2:
                    n = len(acc); sp[x, y] = (sum(c[0] for c in acc) // n, sum(c[1] for c in acc) // n, sum(c[2] for c in acc) // n, 255)
    sp = small.load()
    for y in range(H):
        for x in range(W):
            r, g, b, a = sp[x, y]
            sp[x, y] = (r, g, b, 255) if a >= 110 else (0, 0, 0, 0)
    return small

# Sheets drawn round their user (a ring on the ground with the user in its empty middle): each frame is split into
# what's behind the user and what's in front (r169, the owner: the user should stand between the far and near sides).
# value: in a frame with no hole, is what fills the middle in front of the user (flames engulfing it) or behind (a
# funnel of water under it)?
DEPTH = {}   # (r170: unused for now; the owner preferred the user simply on top. Keys: eruption 'front', geyserVent 'front', whirlpool 'back', maelstrom 'back')

def split_depth(fr, last, fill='front'):
    """One frame (RGBA) -> (back, front, ground row's distance from the bottom). The ground's middle is the middle
    of the ring's empty hole (the biggest see-through patch not touching the frame's edge; a frame with no hole uses
    the last one's). A pixel is in front if it's at or below that row, or if, going straight down its column, it
    reaches that row without crossing the hole (a flame or geyser rising from the near rim); otherwise it's behind
    (it stands on the far rim, past the hole)."""
    W, H = fr.size; a = fr.getchannel('A').load()
    solid = [[a[x, y] > 0 for x in range(W)] for y in range(H)]
    seen = [[False] * W for _ in range(H)]; best = []
    for sy in range(H):
        for sx in range(W):
            if solid[sy][sx] or seen[sy][sx]: continue
            st, comp, edge = [(sx, sy)], [], False; seen[sy][sx] = True
            while st:
                x, y = st.pop(); comp.append((x, y))
                if x in (0, W - 1) or y in (0, H - 1): edge = True
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < W and 0 <= ny < H and not solid[ny][nx] and not seen[ny][nx]: seen[ny][nx] = True; st.append((nx, ny))
            if not edge and len(comp) > len(best): best = comp
    hole = set(best) if len(best) >= 60 else set()
    if hole:
        cy = round(sum(y for _, y in best) / len(best))
        xs = [x for x, _ in best]; span = (min(xs) / W, max(xs) / W)
    else:   # no hole (the ring is filled with flame): the last frame's, by its place in the frame
        from_bottom, span = last if last else (H // 3, (0.35, 0.65))
        cy = H - from_bottom
    hx0, hx1 = round(span[0] * W), round(span[1] * W)
    back, front = fr.copy(), fr.copy(); bp, fp = back.load(), front.load()
    for x in range(W):
        for y in range(H):
            if not solid[y][x]: continue
            # at or below the ground's middle: the near half. Above it: behind, unless it's over the hole and reaches
            # down to the ground's middle without crossing the hole (a flame rising from the near rim)
            infront = y >= cy
            if not infront and hx0 <= x <= hx1 and (hole or fill == 'front'):
                infront = not any((x, yy) in hole for yy in range(y + 1, cy + 1))
            if infront: bp[x, y] = (0, 0, 0, 0)
            else: fp[x, y] = (0, 0, 0, 0)
    return back, front, (H - cy, span)

# Sheets whose frames sit on panels (E2): the panels' navy and their edges are background, and so is the faint blue
# glow behind the brightest bolt, below the clouds (the clouds' undersides are the same colour, so only below them)
PANELS = {'thunder': lambda r, g, b, x, y: max(r, g, b) < 72 and b - r >= 22 and (r < 26 or y > 130),
          # E2c: navy panels everywhere, and the third panel's darker blue lit up behind its brightest bolt (only there:
          # the dome of light in the fourth frame has a glow of nearly the same blue, which is part of it)
          'thunderBolt': lambda r, g, b, x, y: b - r >= 20 and (max(r, g, b) < 60 or (536 <= x <= 703 and y < 285 and max(r, g, b) < 100))}

# Repairs to a frame after it's cut: (sheet, frame) -> function(frame) -> frame. E2c's fourth frame (r178, the owner:
# "it is still cut off"): Gemini drew its ground ring partly hidden behind the third frame's lighter panel, so the
# ring's left end stops short (about 50 pixels from the dome's middle here, against 63 on the right). Its left end is
# rebuilt by mirroring the right side, on a frame widened to fit (so the dome is now in the middle of it).
def ring_mirror(fr, cx, ytop):
    W, H = fr.size; R = W - cx; pad = max(0, R - cx)
    out = Image.new('RGBA', (W + pad, H), (0, 0, 0, 0)); out.paste(fr, (pad, 0))
    op, c2 = out.load(), cx + pad
    for y in range(ytop, H):
        for x in range(0, c2 - cx + 6):
            mx = 2 * c2 - x
            if mx < out.size[0] and op[x, y][3] == 0 and op[mx, y][3]: op[x, y] = op[mx, y]
    return out
FRAME_REPAIRS = {('thunderBolt', 3): lambda fr: ring_mirror(fr, 50, 82)}

# Sheets whose pieces are found in hand-measured boxes (reference pixels), in sheet order, when Gemini's rows overlap
# (BEAST-2's shout lines reach down into the shout bubbles' row). Each box is shrunk to what's drawn inside it.
MANUAL = {'beast1': [(10, 20, 245, 112), (265, 20, 500, 112), (520, 20, 755, 112), (775, 20, 1010, 112), (10, 145, 245, 195), (265, 145, 500, 195), (520, 145, 755, 195), (775, 145, 1010, 195), (10, 210, 245, 365), (265, 210, 500, 365), (520, 210, 755, 365), (775, 210, 1010, 365), (10, 385, 245, 540), (265, 385, 500, 540), (520, 385, 755, 540), (775, 385, 1010, 540)],
          'beast2': [(45, 20, 160, 120), (210, 20, 320, 120), (375, 20, 485, 120), (540, 20, 690, 120), (700, 15, 845, 120), (870, 20, 985, 120),
                     (35, 150, 500, 255), (550, 150, 990, 275),
                     (60, 300, 130, 395), (205, 285, 305, 405), (370, 270, 500, 420), (545, 335, 712, 492), (722, 298, 990, 530),
                     (45, 445, 145, 545), (160, 415, 345, 550), (355, 420, 515, 555)]}

# Sheets whose frames keep their row's full height (E2: every frame's ground is its bottom row, so the strike lines up
# with the spot it hits, cloud-only frames included)
FULL_ROWS = {'thunder', 'thunderBolt'}

def drop_specks(im, m, most=12):
    """Tiny islands of colour left from panel corners (E2) become background."""
    w, h = im.size; seen = set()
    for sy in range(h):
        for sx in range(w):
            if m[sy][sx] or (sx, sy) in seen: continue
            st, comp = [(sx, sy)], []; seen.add((sx, sy))
            while st:
                x, y = st.pop(); comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1), (x + 1, y + 1), (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not m[ny][nx] and (nx, ny) not in seen: seen.add((nx, ny)); st.append((nx, ny))
            if len(comp) <= most:
                for x, y in comp: m[y][x] = True

# Sheets that need more than 20 colours (E6: its few green draining sparks were lost among the yellows)
COLOURS = {'staticSiphon': 40}

def build(only=None, sheet=False):
    data, review = {}, []
    for sid, (ref, px, counts) in SHEETS.items():
        if only and sid != only: continue
        im = Image.open(os.path.join(REFS, ref)).convert('RGB')
        if sid in PANELS:   # paint the panels the page's colour, so they read as background
            isbg, bgc, px_ = PANELS[sid], im.getpixel((2, 2)), im.load()
            for yy in range(im.size[1]):
                for xx in range(im.size[0]):
                    if isbg(*px_[xx, yy], xx, yy): px_[xx, yy] = bgc
        m = bg_mask(im, 40 if (sid in CLEAN_SHRINK and sid != 'thunder') or sid in ('eruptionParts', 'common1', 'common2', 'hits1', 'hits2', 'hits3', 'hits4', 'smug1', 'smug1b', 'smug1c', 'beast1', 'beast2', 'beast3', 'beast4', 'fire2a', 'fire2b', 'fire3', 'fire4', 'water1a', 'water1b', 'water2', 'water3', 'plant1') else 400)   # electric arcs close round gaps of background: only tiny ones are part of it (Thunder's cloud undersides are near the background colour, so not there)
        if sid in PANELS: drop_specks(im, m)
        if sid in MANUAL:
            boxes = []
            for (bx0, by0, bx1, by1) in MANUAL[sid]:
                pts = [(x, y) for y in range(by0, by1) for x in range(bx0, bx1) if not m[y][x]]
                xs, ys = [q[0] for q in pts], [q[1] for q in pts]
                boxes.append((min(xs), min(ys), max(xs), max(ys), (by0, by1)))
        else: boxes = frames_of(im, m, counts)
        if sid in FULL_ROWS: boxes = [(b[0], b[4][0], b[2], b[4][1], b[4]) for b in boxes]
        tallest = max(b[3] - b[1] + 1 for b in boxes)
        k = tallest / px
        frames = [shrink(im, m, b, k, sid in CLEAN_SHRINK, ACCENT.get(sid)) for b in boxes]
        frames = [FRAME_REPAIRS[(sid, i)](f) if (sid, i) in FRAME_REPAIRS else f for i, f in enumerate(frames)]
        # a tidy palette for the whole sheet, so its frames match
        strip_w, strip_h = sum(f.size[0] + 1 for f in frames), max(f.size[1] for f in frames)
        strip = Image.new('RGBA', (strip_w, strip_h), (0, 0, 0, 0))
        meta, x = [], 0
        for f in frames:
            strip.paste(f, (x, 0)); meta.append([x, 0, f.size[0], f.size[1]]); x += f.size[0] + 1
        # a tidy palette of 20 colours per row of the sheet (a sheet whose rows are different looks, like the
        # impacts' 15 types, would turn muddy sharing one palette)
        q = Image.new('RGBA', strip.size, (0, 0, 0, 0)); i = 0
        for n in counts:
            x0 = meta[i][0]; x1 = meta[i + n - 1][0] + meta[i + n - 1][2]; i += n
            part = strip.crop((x0, 0, x1, strip_h))
            pq = part.convert('RGB').quantize(colors=COLOURS.get(sid, 20), method=Image.Quantize.MEDIANCUT).convert('RGB').convert('RGBA')
            pq.putalpha(part.getchannel('A'))
            if sid in ACCENT:   # rare accent colours get merged away by the palette: put them back
                pp, op = pq.load(), part.load()
                for yy in range(part.size[1]):
                    for xx in range(part.size[0]):
                        o = op[xx, yy]
                        if o[3] and ACCENT[sid](*o[:3]): pp[xx, yy] = o
            q.paste(pq, (x0, 0))
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
        data[sid] = {'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'frames': meta}
        if sid in DEPTH:   # its back and front halves, same layout (see split_depth)
            bk, fs, last = Image.new('RGBA', q.size, (0, 0, 0, 0)), Image.new('RGBA', q.size, (0, 0, 0, 0)), None
            for (fx, fy, fw, fh) in meta:
                b2, f2, last = split_depth(q.crop((fx, fy, fx + fw, fy + fh)), last, DEPTH[sid])
                bk.paste(b2, (fx, fy)); fs.paste(f2, (fx, fy))
            for key, img in (('back', bk), ('front', fs)):
                b3 = io.BytesIO(); img.save(b3, 'PNG', optimize=True)
                data[sid][key] = 'data:image/png;base64,' + base64.b64encode(b3.getvalue()).decode()
            review.append((sid + ' (back)', bk, meta)); review.append((sid + ' (front)', fs, meta))
        review.append((sid, q, meta))
        print(f'{sid}: {len(meta)} frames, scale 1/{k:.1f}, sizes {[(f[2], f[3]) for f in meta]}, {len(buf.getvalue())} bytes')
    js = ('// Attack frames cut from the owner\'s reference sheets (docs/refs) by tools/fx-sheets.py. Do not edit by hand:\n'
          '// change the tool or the reference and run it again. One pixel here is one sprite pixel. Shared with the Stadium.\n'
          'const FX_SHEET_DATA = ' + json.dumps(data, separators=(',', ':')) + ';\n')
    if not only: open(os.path.join(ROOT, 'js', 'fx-sheets.js'), 'w', encoding='utf-8', newline='\n').write(js)
    if sheet:   # a review picture, 6x, on the game's grass green
        S = 6
        W = max(q.size[0] for _, q, _ in review) * S + 20
        Ht = sum(q.size[1] * S + 30 for _, q, _ in review)
        out = Image.new('RGB', (W, Ht), (74, 120, 60)); y = 0
        for sid, q, meta in review:
            big = q.resize((q.size[0] * S, q.size[1] * S), Image.NEAREST)
            out.paste(big, (10, y + 20), big); y += q.size[1] * S + 30
        out.save(os.path.join(ROOT, 'fx-frames.png'))
        print('review picture: fx-frames.png')

if __name__ == '__main__':
    build(only=next((a.split('=')[1] for a in sys.argv if a.startswith('--only=')), None), sheet='--sheet' in sys.argv)
