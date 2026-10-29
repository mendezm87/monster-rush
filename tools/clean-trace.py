"""Clean up a traced Coreature (r288, the owner liked traced Sparkit's side views but its front and back "need some
cleaning up"): stray single pixels in the fur, a crest traced grey, colours the trace muddied.

    python tools/clean-trace.py in.json out.json [--fix fixes.json] [--preview clean-preview.png]

Steps:
  despeckle  every pixel (but those in --keep) inside the figure (not the outline) whose colour has no same-colour neighbour is replaced by
             the most common colour round it, twice over: the speckled fur becomes even bands of shading.
  fixes      a JSON of hand fixes: {"pal": {key: colour}, "views": [[[x, y, key], ...], ...] per view,
             "recolour": [[view or -1, x0, y0, x1, y1, from_keys, to_key], ...]} applied after the despeckle.
"""
import argparse, json
from collections import Counter
from PIL import Image, ImageDraw

OUTLINE = set('ka')


def despeckle(g, keep=''):
    H, W = len(g), len(g[0]); out = [r[:] for r in g]
    for y in range(H):
        for x in range(W):
            c = g[y][x]
            if c == '.' or c in OUTLINE or c in keep: continue
            near4 = [g[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < W and 0 <= y + dy < H]
            if c in near4: continue
            near8 = [g[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and 0 <= x + dx < W and 0 <= y + dy < H]
            near8 = [n for n in near8 if n != '.' and n not in OUTLINE]
            if near8: out[y][x] = Counter(near8).most_common(1)[0][0]
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--fix'); ap.add_argument('--preview'); ap.add_argument('--passes', type=int, default=2); ap.add_argument('--views', help='which views to despeckle (e.g. 0,3); all by default'); ap.add_argument('--keep', default='', help='colour keys never despeckled (eyes, a plug)')
    a = ap.parse_args()
    d = json.load(open(a.src)); pal = dict(d['pal'])
    maps = [[list(r) for r in m] for m in d['maps']]
    for g in maps:
        w = max(len(r) for r in g)
        for r in g: r += ['.'] * (w - len(r))
    only = {int(v) for v in a.views.split(',')} if a.views else set(range(len(maps)))
    for _ in range(a.passes): maps = [despeckle(g, a.keep) if i in only else g for i, g in enumerate(maps)]
    if a.fix:
        f = json.load(open(a.fix)); pal.update(f.get('pal', {}))
        for v, x0, y0, x1, y1, frm, to in f.get('recolour', []):
            for vi, g in enumerate(maps):
                if v != -1 and v != vi: continue
                for y in range(y0, min(y1 + 1, len(g))):
                    for x in range(x0, min(x1 + 1, len(g[0]))):
                        if g[y][x] in frm: g[y][x] = to
        for vi, pts in enumerate(f.get('views', [])):
            for x, y, k in pts: maps[vi][y][x] = k
    json.dump({'pal': pal, 'maps': [[''.join(r) for r in g] for g in maps]}, open(a.dst, 'w'))
    if a.preview:
        S = 14; ims = []
        for g in maps:
            im = Image.new('RGB', (len(g[0]) * S, len(g) * S), (122, 150, 104)); dr = ImageDraw.Draw(im)
            for y, r in enumerate(g):
                for x, c in enumerate(r):
                    if c != '.': dr.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=pal[c])
            ims.append(im)
        out = Image.new('RGB', (sum(i.width + 10 for i in ims), max(i.height for i in ims)), (40, 40, 40)); x = 0
        for i in ims: out.paste(i, (x, 0)); x += i.width + 10
        out.save(a.preview)


if __name__ == '__main__':
    main()
