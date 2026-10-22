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
    'magmaWave':     ('f8-magma-wave.png', 64, [5]),
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
    rows = spans([1 if sum(1 for x in range(w) if not m[y][x]) > 2 else 0 for y in range(h)], 26, 30)
    assert len(rows) == len(counts), f'{len(rows)} rows found, {len(counts)} expected'
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
        alpha = strip.getchannel('A')
        q = strip.convert('RGB').quantize(colors=20, method=Image.Quantize.MEDIANCUT).convert('RGB').convert('RGBA')
        q.putalpha(alpha)
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
