"""Turn a Gemini pixel-art guide (one creature in several views side by side on a flat background) into small
colour maps the game's art can draw from (r242 Smugshogun; r245 every traced Coreature).

    python tools/trace-guide.py docs/refs/GUIDE-LUMAWOOL.jpg --height 31 --colors 12 --json lumawool.json
    python tools/trace-guide.py guide.jpg --band 0.45,1    # only the lower part of the picture (a ghosted row above)

Finds each figure (columns of non-background, small gaps joined until there are --views of them), shrinks it to
`height` rows by taking the most common palette colour in each cell (outline wins when it covers a good share, so thin
lines survive). The palette is picked from the guide itself (--colors, 'k' = the darkest, the outline) or, with
--pal smugshogun, Smugshogun's fixed one. Writes the maps and palette as JSON plus trace-preview.png (ignored by git).
"""
import argparse, json
from PIL import Image
import numpy as np

SHOGUN = {'k': '#1c1428', 'o': '#d08548', 's': '#a85e2c', 'l': '#e8a868', 'w': '#f7f1e6', 'v': '#e2d4bf',
          'c': '#f0d6a0', 'p': '#e8b4a4', 'r': '#c42a36', 'q': '#861824', 'e': '#ee6064', 'g': '#ecc452',
          'n': '#1b264c', 'u': '#b8a68c'}
hexc = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c)
rgb = lambda h: [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def figures(fg, views):
    cols = fg.any(0); segs, s = [], None
    for x, c in enumerate(cols):
        if c and s is None: s = x
        if not c and s is not None: segs.append([s, x]); s = None
    if s is not None: segs.append([s, len(cols)])
    segs = [g for g in segs if g[1] - g[0] > 4]
    while len(segs) > views:   # join the two pieces with the smallest gap (a tail wisp floating off its body)
        i = min(range(len(segs) - 1), key=lambda i: segs[i + 1][0] - segs[i][1])
        segs[i] = [segs[i][0], segs[i + 1][1]]; del segs[i + 1]
    while len(segs) < views:   # views touching (a tail wisp reaching the next one): split the widest at its emptiest column
        i = max(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0]); a0, b0 = segs[i]
        cnt = fg[:, a0:b0].sum(0); m = len(cnt) // 5
        x = a0 + m + int(np.argmin(cnt[m:len(cnt) - m]))
        segs[i:i + 1] = [[a0, x], [x + 1, b0]]
    return segs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path'); ap.add_argument('--height', type=int, default=31); ap.add_argument('--views', type=int, default=4)
    ap.add_argument('--colors', type=int, default=12); ap.add_argument('--accents', type=int, default=4); ap.add_argument('--pal'); ap.add_argument('--band', default='0,1'); ap.add_argument('--tol', type=int, default=40); ap.add_argument('--smooth', type=int, default=0); ap.add_argument('--kshare', type=float, default=0.34); ap.add_argument('--xscale', type=float, default=1)
    ap.add_argument('--json')
    a = ap.parse_args()
    im = np.array(Image.open(a.path).convert('RGB')).astype(int)
    b0, b1 = [float(v) for v in a.band.split(',')]
    im = im[int(b0 * im.shape[0]):int(b1 * im.shape[0])]
    bg = np.median(np.concatenate([im[:4].reshape(-1, 3), im[-4:].reshape(-1, 3)]), axis=0)
    # the background is what's background-coloured AND connected to the picture's edge (flood-filled in), so grey
    # wool or fur inside an outline stays part of the creature even when it's close to the background's grey
    cand = np.abs(im - bg).sum(2) <= a.tol
    if a.smooth:   # --smooth N: background is also flat over an N-pixel window, so a striped grey part (Coilizard's spring) isn't taken for it
        from PIL import ImageFilter
        gray = Image.fromarray(im.mean(2).astype('uint8'))
        rng = np.array(gray.filter(ImageFilter.MaxFilter(a.smooth))).astype(int) - np.array(gray.filter(ImageFilter.MinFilter(a.smooth))).astype(int)
        cand &= rng < 24   # --tol: lower it for fur close to the background's grey (Brawlix)
    reach = np.zeros_like(cand); reach[0, :] = cand[0, :]; reach[-1, :] = cand[-1, :]; reach[:, 0] = cand[:, 0]; reach[:, -1] = cand[:, -1]
    while True:
        grow = reach.copy()
        grow[1:] |= reach[:-1]; grow[:-1] |= reach[1:]; grow[:, 1:] |= reach[:, :-1]; grow[:, :-1] |= reach[:, 1:]
        grow &= cand
        for _ in range(30):   # a few cheap steps between checks
            g2 = grow.copy(); g2[1:] |= grow[:-1]; g2[:-1] |= grow[1:]; g2[:, 1:] |= grow[:, :-1]; g2[:, :-1] |= grow[:, 1:]; grow = g2 & cand
        if (grow == reach).all(): break
        reach = grow
    fg = ~reach
    segs = figures(fg, a.views)
    ys = np.where(fg[:, segs[0][0]:segs[-1][1]].any(1))[0]; y0, y1 = ys.min(), ys.max() + 1
    cell = (y1 - y0) / a.height
    if a.pal == 'smugshogun': PAL = SHOGUN
    elif a.pal: PAL = json.load(open(a.pal))['pal']   # another trace's palette, so views traced at other sizes share keys
    else:   # the guide's own colours: the darkest is the outline
        px = im[fg].reshape(-1, 3)
        q = Image.fromarray(px.reshape(1, -1, 3).astype('uint8')).quantize(a.colors, method=Image.Quantize.MEDIANCUT)
        cs = np.array(q.getpalette()[:3 * a.colors]).reshape(-1, 3)
        cs = cs.tolist()
        sat = px[(px.max(1) - px.min(1)) > 90]   # bright accents (sparks, glowing eyes) get slots of their own, or a few pixels lose out
        if len(sat) > 50:
            qa = Image.fromarray(sat.reshape(1, -1, 3).astype('uint8')).quantize(a.accents, method=Image.Quantize.MEDIANCUT)
            for c in np.array(qa.getpalette()[:3 * a.accents]).reshape(-1, 3).tolist():
                if min(sum(abs(c[i] - d[i]) for i in range(3)) for d in cs) > 60: cs.append(c)
        cs = sorted(cs, key=lambda c: sum(c))
        keys = 'k' + 'abcdefghijmnopqrstuvwxyz'
        PAL = {keys[i]: hexc(c) for i, c in enumerate(cs)}
    keys = list(PAL); cols = np.array([rgb(PAL[k]) for k in keys])
    near = np.argmin(((im[:, :, None, :] - cols[None, None]) ** 2).sum(3), axis=2)
    maps = []
    for xa0, xb0 in segs:
        cw = cell / a.xscale   # --xscale > 1: narrower cells across, so a lanky figure comes out stockier
        wcells = int(np.ceil((xb0 - xa0) / cw))
        rows = []
        for r in range(a.height):
            row = ''
            for q in range(wcells):
                ya, yb = int(y0 + r * cell), int(y0 + (r + 1) * cell); xa, xb = int(xa0 + q * cw), int(min(xb0, xa0 + (q + 1) * cw))
                f = fg[ya:yb, xa:xb]
                if f.size == 0 or f.mean() < 0.45: row += '.'; continue
                cnt = np.bincount(near[ya:yb, xa:xb][f], minlength=len(keys))
                row += 'k' if cnt[0] > a.kshare * cnt.sum() else keys[int(np.argmax(cnt))]
            rows.append(row)
        g = [list(r) for r in rows]; seen = set()   # drop loose specks (a few cells floating off the figure)
        for y0_ in range(len(g)):
            for x0_ in range(len(g[0])):
                if g[y0_][x0_] == '.' or (x0_, y0_) in seen: continue
                comp, st = [], [(x0_, y0_)]; seen.add((x0_, y0_))
                while st:
                    x_, y_ = st.pop(); comp.append((x_, y_))
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        u, w_ = x_ + dx, y_ + dy
                        if 0 <= w_ < len(g) and 0 <= u < len(g[0]) and g[w_][u] != '.' and (u, w_) not in seen: seen.add((u, w_)); st.append((u, w_))
                if len(comp) < 6:
                    for x_, y_ in comp: g[y_][x_] = '.'
        if a.smooth:   # --smooth leaves a ring of background round the figure: peel off background-coloured cells at the edge
            bk = keys[int(np.argmin([np.abs(np.array(rgb(PAL[k])) - bg).sum() for k in keys]))]
            for _ in range(2):
                drop = [(x_, y_) for y_ in range(len(g)) for x_ in range(len(g[0])) if g[y_][x_] == bk and any(
                    not (0 <= y_ + dy < len(g) and 0 <= x_ + dx < len(g[0])) or g[y_ + dy][x_ + dx] == '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
                for x_, y_ in drop: g[y_][x_] = '.'
        maps.append([''.join(r) for r in g])
    Z = 8; W = sum(len(m[0]) + 2 for m in maps)
    out = Image.new('RGB', (W * Z, a.height * Z), (90, 138, 74)); x0 = 0
    for m in maps:
        for y, row in enumerate(m):
            for x, k in enumerate(row):
                if k != '.': out.paste(tuple(rgb(PAL[k])), ((x0 + x) * Z, y * Z, (x0 + x + 1) * Z, (y + 1) * Z))
        x0 += len(m[0]) + 2
    out.save('trace-preview.png')
    res = {'pal': PAL, 'maps': maps}
    if a.json: json.dump(res, open(a.json, 'w'))
    for i, m in enumerate(maps):
        print(f'view {i} ({len(m[0])} wide)')
        for y, r in enumerate(m): print(f'{y:2d} {r}')


if __name__ == '__main__':
    main()
