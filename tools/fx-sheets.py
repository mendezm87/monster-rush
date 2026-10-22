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

def bg_mask(im):
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
            if not edge and len(comp) < 400:
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

def shrink(im, m, box, k):
    x0, y0, x1, y1 = box[:4]
    crop = im.crop((x0, y0, x1 + 1, y1 + 1)).convert('RGBA')
    px = crop.load()
    for y in range(crop.size[1]):
        for x in range(crop.size[0]):
            if m[y0 + y][x0 + x]: px[x, y] = (0, 0, 0, 0)
    W, H = max(1, round(crop.size[0] / k)), max(1, round(crop.size[1] / k))
    small = crop.resize((W, H), Image.BOX)
    sp = small.load()
    for y in range(H):
        for x in range(W):
            r, g, b, a = sp[x, y]
            sp[x, y] = (r, g, b, 255) if a >= 110 else (0, 0, 0, 0)
    return small

def build(only=None, sheet=False):
    data, review = {}, []
    for sid, (ref, px, counts) in SHEETS.items():
        if only and sid != only: continue
        im = Image.open(os.path.join(REFS, ref)).convert('RGB')
        m = bg_mask(im)
        boxes = frames_of(im, m, counts)
        tallest = max(b[3] - b[1] + 1 for b in boxes)
        k = tallest / px
        frames = [shrink(im, m, b, k) for b in boxes]
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
            pq = part.convert('RGB').quantize(colors=20, method=Image.Quantize.MEDIANCUT).convert('RGB').convert('RGBA')
            pq.putalpha(part.getchannel('A')); q.paste(pq, (x0, 0))
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
        data[sid] = {'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'frames': meta}
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
