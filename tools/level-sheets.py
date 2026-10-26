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

def pack(groups):
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
    for role, (a, b) in spans.items():   # one palette per role, like the attack sheets' rows
        part = strip.crop((a, 0, b, strip_h))
        pq = part.convert('RGB').quantize(colors=24, method=Image.Quantize.MEDIANCUT).convert('RGB').convert('RGBA')
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
        groups.append((role, items))
    return pack(groups)

def build():
    data, review = {}, []
    for area in AREAS:
        for kind, fn in (('props', 'LV-{}-1.jpg'), ('walls', 'LV-{}-2.jpg')):
            path = os.path.join(REFS, fn.format(area.upper()))
            if not os.path.exists(path): print(f'{area} {kind}: no sheet yet'); continue
            q, meta = props(path) if kind == 'props' else walls(path, WALL_ROLES[area])
            buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
            data.setdefault(area, {})[kind] = {'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), **meta}
            review.append(q)
            print(f'{area} {kind}: ' + ', '.join(f'{r} {len(v)}' for r, v in meta.items()) + f', {len(buf.getvalue())} bytes')
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
