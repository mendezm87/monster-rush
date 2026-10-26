# Turns the owner's level art sheets (docs/refs/LV-<AREA>-1.jpg props, LV-<AREA>-2.jpg walls; prompts in
# docs/level-prompts.md) into the game's room pieces: removes the background (the attack tool's helpers,
# tools/fx-sheets.py), finds each piece, shrinks it to its size in sprite pixels, tidies the colours, and writes
# js/level-sheets.js (each sheet a small PNG as a data URL, plus its pieces by role). Rush only (the Stadium has no rooms).
#   python tools/level-sheets.py            (then look at level-pieces.png, ignored by git)
#
# Props are cut row by row (Gemini kept those rows tidy). Wall sheets came back in different layouts (a doorway seen
# from above in one piece or as two halves, decorations as small items or as whole wall tiles with the decoration in
# them), so each wall sheet lists which separate piece is which (WALL_ROLES), by its number in reading order.
import io, os, json, base64, importlib.util
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFS = os.path.join(ROOT, 'docs', 'refs')
spec = importlib.util.spec_from_file_location('fxs', os.path.join(ROOT, 'tools', 'fx-sheets.py'))
fxs = importlib.util.module_from_spec(spec); spec.loader.exec_module(fxs)

AREAS = ['meadow', 'crater', 'summit', 'grotto', 'ruins', 'spire']
# props: pieces per row, the role of each row, and the height of the row's tallest piece in sprite pixels
# (one sprite pixel = 1.5 world units)
PROP_ROWS = [(6, 'small', 9), (4, 'medium', 18), (3, 'large', 30), (3, 'patch', 20)]
# walls: the top wall is 44 world units tall (about 29 sprite pixels), the side and bottom walls 26 (about 17)
FACE_PX, TOP_PX = 30, 18
# each wall sheet's pieces in reading order (see blobs()): face (the top wall, from the front), top (the side and
# bottom walls, from above), doorFront, doorTop (a whole piece, or [left, right] halves set at the gap's edges),
# faceDeco (a wall face with a decoration in it), deco (a small thing hung on the top wall); [a, b] = two blobs as one
WALL_ROLES = {
    'meadow': {'face': [0, 1, 2], 'top': [3, 4, 5], 'doorFront': [6], 'doorTop': [7], 'deco': [8, 9, 10, 11]},
    'crater': {'face': [0, 1, 2], 'top': [3, 4, 5], 'doorFront': [6], 'doorTop': [7, 8], 'deco': [9, 10, 11, 12]},
    'summit': {'face': [0, 1, 2], 'top': [3, 4, 5], 'doorFront': [6], 'doorTop': [(7, 8)], 'faceDeco': [9, 10, 11, 12]},
    'grotto': {'face': [0, 1, 2], 'top': [3, 4, 5], 'doorFront': [6], 'doorTop': [7, 8], 'faceDeco': [9, 10, 11, 12]},
    'ruins':  {'face': [0, 1, 2], 'top': [3, 4, [5, 6]], 'doorFront': [7], 'doorTop': [8, 9], 'faceDeco': [10, 11, 12, 13]},
    'spire':  {'face': [0, 1, 2], 'top': [3, 4, 5], 'doorFront': [6], 'doorTop': [(7, 8), (9, 10)], 'deco': [11, 12, 13, [14, 15]]},
}

def blobs(im):
    """Every separate piece on a sheet, in reading order: [x0, y0, x1, y1] boxes (found at a quarter of the size)."""
    a = np.array(im).astype(int)
    bg = np.median(np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3)]), axis=0)
    fg = np.abs(a - bg).sum(2) >= 30
    s = 4; h, w = fg.shape
    small = fg[:h - h % s, :w - w % s].reshape(h // s, s, w // s, s).any(axis=(1, 3))
    H, W = small.shape; lab = np.zeros((H, W), int); n = 0; boxes = []
    for y in range(H):
        for x in range(W):
            if small[y, x] and not lab[y, x]:
                n += 1; st = [(x, y)]; lab[y, x] = n; xs = [x]; ys = [y]
                while st:
                    cx, cy = st.pop()
                    for dx in (-2, -1, 0, 1, 2):
                        for dy in (-2, -1, 0, 1, 2):
                            u, v = cx + dx, cy + dy
                            if 0 <= u < W and 0 <= v < H and small[v, u] and not lab[v, u]:
                                lab[v, u] = n; st.append((u, v)); xs.append(u); ys.append(v)
                if len(xs) > 20: boxes.append((min(xs) * s, min(ys) * s, (max(xs) + 1) * s, (max(ys) + 1) * s))
    boxes.sort(key=lambda b: (b[1] // 120, b[0]))
    return boxes

def tight(m, box):
    """The box shrunk to the piece's own pixels (the background mask m), as fx-sheets' shrink() wants it."""
    x0, y0, x1, y1 = box
    pts = [(x, y) for y in range(y0, min(y1, len(m))) for x in range(x0, min(x1, len(m[0]))) if not m[y][x]]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return (min(xs), min(ys), max(xs), max(ys))

def pack(groups, colors=24):
    """groups: [(role, [piece images or [left, right] pairs])] -> one strip (a palette per role) and the meta by role"""
    flat = [(role, j, k, p) for role, items in groups for j, it in enumerate(items) for k, p in enumerate(it if isinstance(it, list) else [it])]
    strip_w = sum(p.size[0] + 1 for *_, p in flat); strip_h = max(p.size[1] for *_, p in flat)
    strip = Image.new('RGBA', (strip_w, strip_h), (0, 0, 0, 0)); meta, x, spans = {}, 0, {}
    for role, j, k, p in flat:
        strip.paste(p, (x, 0)); box = [x, 0, p.size[0], p.size[1]]
        lst = meta.setdefault(role, [])
        if k == 0: lst.append(box)
        else: lst[-1] = [lst[-1], box] if k == 1 else lst[-1] + [box]
        a, b = spans.get(role, (x, x)); spans[role] = (min(a, x), max(b, x + p.size[0])); x += p.size[0] + 1
    q = Image.new('RGBA', strip.size, (0, 0, 0, 0))
    if not colors: return strip, meta   # (a fill tile keeps every colour: cutting it down greyed its few bright stars)
    for role, (a, b) in spans.items():   # one palette per role, like the attack sheets' rows
        part = strip.crop((a, 0, b, strip_h))
        pq = part.convert('RGB').quantize(colors=colors, method=Image.Quantize.MEDIANCUT).convert('RGB').convert('RGBA')
        pq.putalpha(part.getchannel('A')); q.paste(pq, (a, 0))
    return q, meta

def props(path):
    im = Image.open(path).convert('RGB'); m = fxs.bg_mask(im, 40)
    boxes = fxs.frames_of(im, m, [n for n, _, _ in PROP_ROWS])
    groups, i = [], 0
    for n, role, px in PROP_ROWS:
        rb = boxes[i:i + n]; i += n
        k = max(b[3] - b[1] + 1 for b in rb) / px
        groups.append((role, [fxs.shrink(im, m, b, k) for b in rb]))
    return pack(groups)

def trim_ends(im, frac=0.8):
    """A wall piece cut down to where it's solid top to bottom, one more pixel in (its outline): laid end to end, the
    pieces then join without the dark notch their own outlines and rounded ends made (r262, the owner: gaps in the walls)"""
    a = np.array(im)[:, :, 3] > 0; h, w = a.shape
    cov = a.sum(0) / h
    solid = [x for x in range(w) if cov[x] >= frac]
    if len(solid) < 6: return im
    x0, x1 = solid[0] + 1, solid[-1] - 1
    return im.crop((x0, 0, x1 + 1, h))

def main_colour(ims):
    """the most common colour of a group of pieces (the wall's own colour, to fill what the pieces don't cover)"""
    cnt = {}
    for im in ims:
        for r, g, b, al in im.getdata():
            if al: cnt[(r // 8, g // 8, b // 8)] = cnt.get((r // 8, g // 8, b // 8), 0) + 1
    r, g, b = max(cnt, key=cnt.get)
    return '#%02x%02x%02x' % (r * 8 + 4, g * 8 + 4, b * 8 + 4)

def door_core(im, rows='low', keep=None):
    """A doorway cut down to its opening and the posts either side (r263, the owner: walls that "don't match up"):
    the wall the picture drew round it came at its own height and pattern, so the room's own wall tiles run up to the
    posts instead. The opening: the widest run of columns that are empty or near black (in the lower part, for a
    doorway seen from the front, whose lintel spans the top). keep = how much to keep beyond it on each side."""
    a = np.array(im).astype(int); h, w = a.shape[:2]
    band = a[int(h * 0.55):] if rows == 'low' else a
    open_ = (band[:, :, 3] == 0) | (band[:, :, :3].sum(2) < 90)
    cols = open_.mean(0) >= 0.7
    best, cur, start = (0, 0, 0), 0, 0
    for x in range(w + 1):
        if x < w and cols[x]:
            if cur == 0: start = x
            cur += 1
        else:
            if cur > best[0]: best = (cur, start, x - 1)
            cur = 0
    n, g0, g1 = best
    if n < 3: return im
    m = keep if keep is not None else max(4, round(n * 0.35))
    return im.crop((max(0, g0 - m), 0, min(w, g1 + m + 1), h))

def post_end(im, side, keep=7):
    """one half of a doorway seen from above, cut down to its post (the end next to the opening)"""
    w, h = im.size
    return im.crop((w - keep, 0, w, h)) if side == 'right' else im.crop((0, 0, keep, h))

def walls(path, roles):
    im = Image.open(path).convert('RGB'); m = fxs.bg_mask(im, 40); bl = blobs(im)
    def box(ref):   # a blob, or several blobs as one piece
        if isinstance(ref, list):
            bs = [bl[r] for r in ref]; return tight(m, (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)))
        return tight(m, bl[ref])
    hgt = lambda b: b[3] - b[1] + 1
    k_face = max(hgt(box(r)) for r in roles['face']) / FACE_PX
    k_top = max(hgt(box(r)) for r in roles['top']) / TOP_PX
    groups = []
    for role in ['face', 'top', 'doorFront', 'doorTop', 'faceDeco', 'deco']:
        if role not in roles: continue
        items = []
        for ref in roles[role]:
            if role == 'faceDeco': b = box(ref); items.append(fxs.shrink(im, m, b, hgt(b) / FACE_PX)); continue
            k = k_top if role in ('top', 'doorTop') else k_face
            if isinstance(ref, tuple): items.append([fxs.shrink(im, m, box(r), k) for r in ref])   # left and right halves
            else: items.append(fxs.shrink(im, m, box(ref), k))
        if role in ('face', 'top', 'faceDeco'): items = [trim_ends(p) for p in items]   # tiled end to end
        if role == 'doorFront': items = [door_core(p, 'low') for p in items]
        if role == 'doorTop': items = [[post_end(it[0], 'right'), post_end(it[1], 'left')] if isinstance(it, list) else door_core(it, 'all') for it in items]
        groups.append((role, items))
    q, meta = pack(groups)
    meta['fill'] = main_colour([p for r, ps in groups if r == 'top' for p in ps])         # the side and bottom walls' colour
    meta['faceFill'] = main_colour([p for r, ps in groups if r == 'face' for p in ps])    # the top wall's
    return q, meta

PILLAR_W = 22   # a corner pillar's width in sprite pixels (the side walls are about 17 thick)

def corners(path):
    """LV-<AREA>-3 (r265): the two corner pillars, plain and decorated. The sheets' wall corners came in different
    layouts and some facing the wrong way, but every sheet ends with its two pillars, so they're the last two pieces."""
    im = Image.open(path).convert('RGB'); m = fxs.bg_mask(im, 40); bl = blobs(im)
    items = []
    for b in bl[-2:]:
        t = tight(m, b); items.append(fxs.shrink(im, m, t, (t[2] - t[0] + 1) / PILLAR_W))
    return pack([('pillar', items)])

FILL_SRC = 16   # sheet pixels per tile pixel: Gemini's pixel art comes about 8 sheet pixels to one of its pixels, so
                # a tile keeps it at about half size, close to the props' scale
FILL_CROP = {'spire': 0.22}   # how much of the middle to use: the spire's sky sits inside broken grey stone that isn't
                              # the spire's colours (the game draws the spire's sky itself now, rooms.js FILL_SKY)

def repeat_of(sq):
    """If Gemini drew the texture as a repeating pattern (LV-GROTTO-4b and LV-SPIRE-4b came as 2 x 2 copies of one
    tile), the size of one repeat (w, h) in sheet pixels, else None: the shift at which the picture best matches itself,
    if it matches closely."""
    a = np.array(sq.convert('L')).astype(float); h, w = a.shape; out = []
    for axis, n in ((1, w), (0, h)):
        best = min((np.abs((a[:, :n - p] - a[:, p:]) if axis == 1 else (a[:h - p, :] - a[p:, :])).mean(), p) for p in range(60, int(n * 0.6)))
        if best[0] > 7: return None
        out.append(best[1])
    return tuple(out)

def fill(path, area):
    """LV-<AREA>-4 (r269): the ground that fills a room's blocked-off corners, one square texture seen from straight
    above. The biggest piece on the sheet; if it's a repeating pattern, exactly one repeat (it then tiles seamlessly,
    'seamless' in the meta), else its middle square, which the game tiles mirrored so it joins up whatever its edges
    look like. Shrunk to keep about the props' scale."""
    im = Image.open(path).convert('RGB')
    b = max(blobs(im), key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
    inner = im.crop((b[0] + 4, b[1] + 4, b[2] - 4, b[3] - 4))
    rep = repeat_of(inner)
    if rep:
        sq = inner.crop((0, 0, rep[0], rep[1]))
        n, m = round(rep[0] / 8), round(rep[1] / 8)
        tile = sq.resize((n, m), Image.NEAREST, reducing_gap=None).convert('RGBA')   # at its own pixel size: a repeat is small enough, and its glints and stars are single pixels
        q, meta = pack([('tile', [tile])], colors=None); meta['seamless'] = True
        return q, meta
    side = int(min(b[2] - b[0], b[3] - b[1]) * FILL_CROP.get(area, 0.86)); cx, cy = (b[0] + b[2]) // 2, (b[1] + b[3]) // 2
    sq = im.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side))
    n = max(24, round(side / FILL_SRC))
    tile = sq.resize((n + 4, n + 4), Image.BOX).crop((2, 2, n + 2, n + 2)).convert('RGBA')   # trimmed: its edge can catch the sheet's margin
    return pack([('tile', [tile])])

# areas with no corner sheet borrow another area's pillars, recoloured (r266: written while Gemini kept drawing the Spire's
# pillars at an angle; the Spire now has its own sheet, so this is only a fallback)
BORROW_PILLARS = {'spire': 'ruins'}
SPIRE_STONE = [(31, 27, 48), (40, 38, 80), (48, 48, 98), (56, 56, 112), (66, 68, 132), (84, 86, 152), (104, 108, 176)]
SPIRE_GOLD = [(70, 46, 28), (119, 85, 50), (170, 124, 56), (210, 154, 67), (218, 185, 100), (240, 214, 140), (252, 236, 180)]
SPIRE_GOLD_ROWS = {1, 2, 12, 13, 39, 40}   # the cap's rim and lip and the base's top band, in the Ruins pillars' rows

def recolour_pillars(img):
    """Each pixel by its brightness onto the Spire's stone ramp (gold on the trim rows); the dark outline stays dark."""
    o = img.convert('RGBA').copy()
    for y in range(o.height):
        for x in range(o.width):
            r, g, b, al = o.getpixel((x, y))
            if al == 0: continue
            l = r + g + b
            if l < 150: o.putpixel((x, y), (24, 20, 40, 255)); continue
            ramp = SPIRE_GOLD if y in SPIRE_GOLD_ROWS else SPIRE_STONE
            o.putpixel((x, y), ramp[min(6, max(0, (l - 150) * 7 // 550))] + (255,))
    return o

def borrow_pillars(data):
    for area, src in BORROW_PILLARS.items():
        if area not in data or 'corners' in data[area] or 'corners' not in data.get(src, {}): continue
        c = data[src]['corners']; img = Image.open(io.BytesIO(base64.b64decode(c['src'].split(',')[1])))
        buf = io.BytesIO(); recolour_pillars(img).save(buf, 'PNG', optimize=True)
        data[area]['corners'] = {**c, 'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}
        print(f'{area} corners: {src} pillars recoloured')

def build():
    data, review = {}, []
    for area in AREAS:
        for kind, fn in (('props', 'LV-{}-1.jpg'), ('walls', 'LV-{}-2.jpg'), ('corners', 'LV-{}-3.jpg'), ('fill', 'LV-{}-4.jpg')):
            path = os.path.join(REFS, fn.format(area.upper()))
            if kind == 'fill' and os.path.exists(path.replace('-4.jpg', '-4b.jpg')): path = path.replace('-4.jpg', '-4b.jpg')   # a second take wins
            if not os.path.exists(path): print(f'{area} {kind}: no sheet yet'); continue
            q, meta = props(path) if kind == 'props' else corners(path) if kind == 'corners' else fill(path, area) if kind == 'fill' else walls(path, WALL_ROLES[area])
            buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
            data.setdefault(area, {})[kind] = {'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), **meta}
            review.append(q)
            print(f'{area} {kind}: ' + ', '.join(f'{r} {len(v)}' for r, v in meta.items()) + f', {len(buf.getvalue())} bytes')
    borrow_pillars(data)
    js = ('// Room pieces cut from the owner\'s level sheets (docs/refs/LV-*) by tools/level-sheets.py. Do not edit by hand.\n'
          '// One pixel here is one sprite pixel. Pieces by role, each [x, y, w, h] in its sheet (a doorway seen from above\n'
          '// may be a [left, right] pair). Rush only.\n'
          'const LEVEL_SHEET_DATA = ' + json.dumps(data, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'js', 'level-sheets.js'), 'w', encoding='utf-8', newline='\n').write(js)
    S = 4   # a review picture, 4x, on a neutral grey
    W = max(q.size[0] for q in review) * S + 20; Ht = sum(q.size[1] * S + 30 for q in review)
    out = Image.new('RGB', (W, Ht), (60, 60, 66)); y = 0
    for q in review:
        big = q.resize((q.size[0] * S, q.size[1] * S), Image.NEAREST); out.paste(big, (10, y + 20), big); y += q.size[1] * S + 30
    out.save(os.path.join(ROOT, 'level-pieces.png'))

if __name__ == '__main__':
    build()
