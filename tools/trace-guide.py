"""Turn a Gemini pixel-art guide (one creature in several views side by side on a flat background) into small
colour maps the game's art can draw from (r242, Smugshogun's redraw).

    python tools/trace-guide.py docs/refs/smugshogun-guide.jpg 43 smugshogun

Finds each figure (columns of non-background), shrinks it to `height` rows by taking the most common palette colour
in each cell (outline wins when it covers a good share, so thin lines survive), and prints the maps as JS, plus a
preview PNG (trace-preview.png, ignored by git) to compare with the guide.
"""
import sys
from PIL import Image
import numpy as np

PAL = {   # key: colour, the game's own (TOSHI, SAMURAI, OUTLINE in js/sprites.js, js/monsters/smugshi.js)
    'k': '#1c1428', 'o': '#d08548', 's': '#a85e2c', 'l': '#e8a868', 'w': '#f7f1e6', 'v': '#e2d4bf',
    'c': '#f0d6a0', 'p': '#e8b4a4', 'r': '#c42a36', 'q': '#861824', 'e': '#ee6064', 'g': '#ecc452',
    'n': '#1b264c', 'u': '#b8a68c',
}
keys = list(PAL); cols = np.array([[int(PAL[k][i:i + 2], 16) for i in (1, 3, 5)] for k in keys])

def main(path, height, name):
    im = np.array(Image.open(path).convert('RGB')).astype(int)
    bg = im[5, 5]; fg = np.abs(im - bg).sum(2) > 40
    segs, s = [], None
    for x, c in enumerate(fg.any(0)):
        if c and s is None: s = x
        if not c and s is not None:
            if x - s > 30: segs.append((s, x))
            s = None
    ys = np.where(fg.any(1))[0]; y0, y1 = ys.min(), ys.max() + 1
    cell = (y1 - y0) / height
    near = np.argmin(((im[:, :, None, :] - cols[None, None]) ** 2).sum(3), axis=2)   # nearest palette colour per pixel
    maps = []
    for a, b in segs:
        wcells = int(np.ceil((b - a) / cell))
        rows = []
        for r in range(height):
            row = ''
            for q in range(wcells):
                ya, yb = int(y0 + r * cell), int(y0 + (r + 1) * cell); xa, xb = int(a + q * cell), int(min(b, a + (q + 1) * cell))
                f = fg[ya:yb, xa:xb]
                if f.mean() < 0.45: row += '.'; continue
                ks = near[ya:yb, xa:xb][f]
                cnt = np.bincount(ks, minlength=len(keys))
                ko = keys.index('k')
                row += 'k' if cnt[ko] > 0.34 * cnt.sum() else keys[int(np.argmax(cnt))]
            rows.append(row)
        maps.append(rows)
    # preview
    Z = 8; W = sum(len(m[0]) + 2 for m in maps)
    out = Image.new('RGB', (W * Z, height * Z), (90, 138, 74)); x0 = 0
    for m in maps:
        for y, row in enumerate(m):
            for x, k in enumerate(row):
                if k != '.': out.paste(tuple(int(PAL[k][i:i + 2], 16) for i in (1, 3, 5)), ((x0 + x) * Z, y * Z, (x0 + x + 1) * Z, (y + 1) * Z))
        x0 += len(m[0]) + 2
    out.save('trace-preview.png')
    print(f'// {name}: traced from {path} ({len(maps)} views, {height} rows)')
    for i, m in enumerate(maps):
        print(f'// view {i}: {len(m[0])} wide')
        print('[\n' + ',\n'.join(f"  '{r}'" for r in m) + '\n],')

if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3])
