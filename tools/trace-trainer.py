"""Turn a chibi trainer sheet from Gemini (him and her in four views each) into the game's trainer pictures (r275,
the owner's new HD-2D trainers).

Gemini draws real pixel art on a grid of its own, a few sheet pixels per art pixel. Averaging the sheet down (like
trace-guide.py does for creatures) smears that into noise, so this reads the colour at the middle of each cell
instead: the sheet is cut into cells so the tallest figure is --rows tall, and each cell takes the colour at its
centre. The figures keep Gemini's own dark outline (the game doesn't ink traced looks again). The colours are cut to
one shared palette (--colors). Each figure is centred in the 34 x 42 trainer picture, feet on the bottom row.

    python tools/trace-trainer.py docs/refs/TR-1A-chibi.jpg --id scarf --band 0,0.5 --preview tr-preview.png
    --order m0,m1,m2,m3,f0,f1,f2,f3   which figure (left to right) is which: m/f, then 0 front, 1 three-quarter
                                      front, 2 side facing right, 3 back; '-' skips one
    --rowmap 0,0,0,1,1,1              for a sheet in two rows (one --band per row, joined with ';')

Writes tools/traced-trainers/<id>.json: { pal, m: { front, fside, side, back }, f: {...} }, which tools/traced-trainers.py
turns into js/trainers-traced.js.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TW, TH = 34, 42
VIEWS = ['front', 'fside', 'side', 'back']
KEYS = 'kabcdefghijlmnopqtuvxyzABCDEFGHIJLMNOPQTUVXYZ'   # palette keys ('k' the darkest), clear of the game's own skin keys


def figures(fg, n=None, gap=6):
    cols = fg.any(0); segs, s = [], None
    for x, c in enumerate(cols):
        if c and s is None: s = x
        if not c and s is not None: segs.append([s, x]); s = None
    if s is not None: segs.append([s, len(cols)])
    out = []
    for g in segs:   # pieces closer than `gap` belong together (a scarf end, a ponytail)
        if out and g[0] - out[-1][1] < gap: out[-1][1] = g[1]
        else: out.append(g)
    out = [g for g in out if g[1] - g[0] > 20]
    while n and len(out) < n:   # figures touching: split the widest at its emptiest column (away from its edges)
        i = max(range(len(out)), key=lambda i: out[i][1] - out[i][0]); a0, b0 = out[i]
        cnt = fg[:, a0:b0].sum(0); m = len(cnt) // 4
        x = a0 + m + int(np.argmin(cnt[m:len(cnt) - m]))
        out[i:i + 1] = [[a0, x], [x + 1, b0]]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path'); ap.add_argument('--id', required=True); ap.add_argument('--band', default='0,1')
    ap.add_argument('--colors', type=int, default=24); ap.add_argument('--rows', type=int, default=40)
    ap.add_argument('--order', default='m0,m1,m2,m3,f0,f1,f2,f3'); ap.add_argument('--tol', type=int, default=36)
    ap.add_argument('--preview')
    a = ap.parse_args()
    src = Image.open(a.path).convert('RGB'); full = np.array(src).astype(int)
    found = []   # (crop box in sheet pixels)
    for band in a.band.split(';'):
        b0, b1 = [float(v) for v in band.split(',')]
        y0b, y1b = int(b0 * full.shape[0]), int(b1 * full.shape[0])
        im = full[y0b:y1b]
        bg = np.median(np.concatenate([im[:3].reshape(-1, 3), im[-3:].reshape(-1, 3)]), axis=0)
        fg = np.abs(im - bg).sum(2) > a.tol
        for x0, x1 in figures(fg, len(a.order.split(',')) // len(a.band.split(';'))):
            ys = np.where(fg[:, x0:x1].any(1))[0]
            found.append((x0, y0b + ys[0], x1, y0b + ys[-1] + 1, bg))
    order = a.order.split(',')
    assert len(found) >= len([o for o in order]), f'found {len(found)} figures'
    cell = max(f[3] - f[1] for f in found) / a.rows   # sheet pixels per game pixel
    keep = [(f, tag) for f, tag in zip(found, order) if tag != '-']
    # one palette for all the figures, from their pixels (the background left out)
    sample = []
    for (x0, y0, x1, y1, bg), _ in keep:
        c = full[y0:y1:2, x0:x1:2].reshape(-1, 3); sample.append(c[np.abs(c - bg).sum(1) > a.tol])
    sample = np.concatenate(sample).astype('uint8')
    q = Image.fromarray(sample.reshape(1, -1, 3)).quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT)
    pal = np.array(q.getpalette()[:a.colors * 3]).reshape(-1, 3)
    order_dark = np.argsort(pal.sum(1))   # 'k' the darkest
    key = {int(c): KEYS[r] for r, c in enumerate(order_dark)}
    out = {'pal': {KEYS[r]: '#%02x%02x%02x' % tuple(pal[c]) for r, c in enumerate(order_dark)}, 'm': {}, 'f': {}}
    for (x0, y0, x1, y1, bg), tag in keep:
        crop = full[y0:y1, x0:x1]
        idx = np.array(Image.fromarray(crop.astype('uint8')).quantize(palette=q, dither=Image.Dither.NONE)).astype(int)
        isfg = np.abs(crop - bg).sum(2) > a.tol
        w, h = round((x1 - x0) / cell), round((y1 - y0) / cell)
        ids = np.zeros((h, w), int); mask = np.zeros((h, w), bool)
        for j in range(h):   # each game pixel: the most common colour in the middle of its cell (crisp, and a stray
            for i in range(w):   # sheet pixel or JPEG speck doesn't win)
                ya, yb = int(y0 - y0 + (j + 0.2) * cell), max(int((j + 0.8) * cell), int((j + 0.2) * cell) + 1)
                xa, xb = int((i + 0.2) * cell), max(int((i + 0.8) * cell), int((i + 0.2) * cell) + 1)
                f = isfg[ya:yb, xa:xb]
                if f.size == 0 or f.mean() < 0.5: continue
                vals, cnt = np.unique(idx[ya:yb, xa:xb][f], return_counts=True)
                ids[j, i] = vals[np.argmax(cnt)]; mask[j, i] = True
        rows = [''.join(key[int(ids[j, i])] if mask[j, i] else '.' for i in range(w)) for j in range(h)]
        while rows and set(rows[-1]) == {'.'}: rows.pop()
        rows = rows[-TH:]
        ox = (TW - w) // 2
        pic = ['.' * TW] * (TH - len(rows)) + [('.' * ox + r + '.' * TW)[:TW] if ox >= 0 else r[-ox:-ox + TW] for r in rows]
        out[tag[0]][VIEWS[int(tag[1])]] = pic
    os.makedirs(os.path.join(ROOT, 'tools', 'traced-trainers'), exist_ok=True)
    json.dump(out, open(os.path.join(ROOT, 'tools', 'traced-trainers', a.id + '.json'), 'w'), indent=0)
    if a.preview:
        S = 10; ims = []
        for sex in 'mf':
            for v in VIEWS:
                rows = out[sex].get(v)
                if not rows: continue
                im = Image.new('RGB', (TW * S, TH * S), (120, 150, 110)); d = ImageDraw.Draw(im)
                for y, r in enumerate(rows):
                    for x, c in enumerate(r):
                        if c != '.': d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=out['pal'][c])
                for k in range(0, TW + 1, 2): d.line([(k * S, 0), (k * S, TH * S)], fill=(200, 60, 60) if k % 10 == 0 else (100, 125, 92))
                for k in range(0, TH + 1, 2): d.line([(0, k * S), (TW * S, k * S)], fill=(200, 60, 60) if k % 10 == 0 else (100, 125, 92))
                ims.append(im)
        W = sum(i.width + 10 for i in ims); prev = Image.new('RGB', (W, TH * S), (40, 40, 40)); x = 0
        for im in ims: prev.paste(im, (x, 0)); x += im.width + 10
        prev.save(a.preview)
    print(a.id, 'cell %.2f' % cell, {s: {v: max(len(r.strip('.')) for r in out[s][v]) for v in out[s]} for s in 'mf'})


if __name__ == '__main__':
    main()
