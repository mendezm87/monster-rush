"""Preview a traced or hand-drawn Coreature's maps (r289): every view close up and at about game size, each with the
outline the sprite builder adds.  python tools/show-maps.py maps.json big.png small.png"""
import json, sys
from PIL import Image
d = json.load(open(sys.argv[1])); pal = d['pal']
hexc = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def render(S):
    ims = []
    for g in d['maps']:
        H, W = len(g), len(g[0]); im = Image.new('RGB', ((W + 2) * S, (H + 2) * S), (122, 150, 104))
        fl = lambda x, y: 0 <= y < H and 0 <= x < W and g[y][x] != '.'
        for y in range(-1, H + 1):
            for x in range(-1, W + 1):
                if fl(x, y): c = hexc(pal[g[y][x]])
                elif any(fl(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): c = (17, 13, 30)
                else: continue
                im.paste(c, ((x + 1) * S, (y + 1) * S, (x + 2) * S, (y + 2) * S))
        ims.append(im)
    out = Image.new('RGB', (sum(i.width + 10 for i in ims), max(i.height for i in ims)), (122, 150, 104)); x = 0
    for i in ims: out.paste(i, (x, out.height - i.height)); x += i.width + 10
    return out


render(12).save(sys.argv[2]); render(3).save(sys.argv[3])
