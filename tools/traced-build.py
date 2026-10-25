# Builds the traced Coreatures' parts (head, ears, tail, legs, eyes, wings) from trace-guide.py JSONs in %TMP%/tr/
# (<id>.json, or per-view files named in CFG src), then run tools/traced-js.py to write them into js/monsters/traced.js.
# Writes chk-parts.png, a part-coloured preview, to check the zones by eye. (r245-r246)
"""Turn the traced guide maps into js/monsters/traced.js data, with parts worked out per view.
Writes a part-coloured preview (chk-parts.png) so the zones can be checked by eye."""
import json, os, sys
from PIL import Image
T = os.environ['TMP'] + '/tr/'
VIEWS = ['front', 'fside', 'side', 'back']
# per Coreature: neck = head rows (share of height), ear = ear rows, hx = where the head starts in side views (share of
# width; head on the right), tail = box [x0, y0, x1, y1] shares for side views (fside, side) and back, legMax = how
# much of the height legs may take, wings = palette keys that are wings (fliers), eyes = number of eyes in front
def coil_spring(m, view):
    """Coilizard's spring tail: the coil pixels joined to its glowing bulb, repainted as silver rings (at this size the
    guide's dark gaps between coils swallow the silver). Returns the map and the tail's pixels (y * 64 + x)."""
    H, W = len(m), len(m[0]); g = [list(r) for r in m]
    body = set('mlgdor'); coilk = set('kqswbcnp')
    near_body = lambda x, y: any(0 <= x + dx < W and 0 <= y + dy < H and g[y + dy][x + dx] in body for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    seen = {(x, y) for y in range(H) for x in range(W) if g[y][x] == 'c'}; st = list(seen)
    while st:
        x, y = st.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            u, v = x + dx, y + dy
            if 0 <= u < W and 0 <= v < H and (u, v) not in seen and g[v][u] in coilk and not near_body(u, v): seen.add((u, v)); st.append((u, v))
    run = lambda x, y, dx, dy: sum(1 for k in range(-2, 3) if (x + dx * k, y + dy * k) in seen)
    for x, y in seen:
        if g[y][x] in 'kqsw':
            horiz = run(x, y, 1, 0) >= run(x, y, 0, 1)
            g[y][x] = 'w' if (x if horiz else y) % 2 == 0 else 'q'
    return [''.join(r) for r in g], sorted(y * 64 + x for x, y in seen)


def brawl_post(m, view):
    """Brawlix in between the old boxer and the lean guide: bigger taped fists (the tape grown a pixel into the fur round
    it) and a cream belly and muzzle like the old one."""
    H, W = len(m), len(m[0]); g = [list(r) for r in m]; fur = set('sdflb')
    for _ in range(2):   # grown twice
        src = [r[:] for r in g]
        for x, y in [(x, y) for y in range(H) for x in range(W) if src[y][x] in 'wt']:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                u, v = x + dx, y + dy
                if 0 <= u < W and 0 <= v < H and src[v][u] in fur: g[v][u] = 't' if dy > 0 else 'w'
    if view in ('front', 'fside', 'side'):   # the belly: the middle of the torso, lighter fur turned cream
        xs = [x for x in range(W) if any(m[y][x] != '.' for y in range(round(H * 0.42), round(H * 0.62)))]
        cx = (min(xs) + max(xs)) / 2 + (1 if view == 'fside' else 2 if view == 'side' else 0); half = max(1.5, (max(xs) - min(xs)) * 0.18)
        for y in range(round(H * 0.42), round(H * 0.63)):
            for x in range(W):
                if abs(x - cx) <= half and g[y][x] in 'fl': g[y][x] = 'b'
    return [''.join(r) for r in g], []


CFG = {   # neck/ear: head and ear rows; hb: the head's columns per view (shares); leg: where legs start; eyeKeys: eye colours
  'lumawool':  dict(neck=0.55, ear=0.3, hb={'front': [0.2, 0.8], 'back': [0.15, 0.85], 'fside': [0.45, 1], 'side': [0.62, 1]}, tail={'side': [0, 0.3, 0.12, 0.65], 'fside': [0, 0.35, 0.1, 0.7]}, leg=0.82, eyeKeys=None),
  'smouldox':  dict(neck=0.5, ear=0.22, hb={'fside': [0.55, 1], 'side': [0.7, 1]}, tail={'side': [0, 0.2, 0.12, 0.7], 'fside': [0, 0.2, 0.12, 0.7]}, leg=0.75, eyeKeys=None),
  'coilizard': dict(neck=0.5, ear=0.0, hb={'front': [0.2, 0.8], 'back': [0, 0.6], 'fside': [0.55, 1], 'side': [0.6, 1]}, tail={}, leg=0.72, eyeKeys='d', src={'front': 'coil-27.json', 'fside': 'coil-27.json', 'side': 'coil-22.json', 'back': 'coil-27.json'}, post=coil_spring),
  'thornback': dict(neck=0.6, ear=0.0, hb={'front': [0.2, 0.8], 'fside': [0.7, 1], 'side': [0.75, 1], 'back': [0.2, 0.8]}, tail={'side': [0, 0.5, 0.35, 1], 'fside': [0, 0.5, 0.35, 1], 'back': [0.4, 0.75, 1, 1]}, leg=0.8, eyeKeys='kab'),
  'shadefang': dict(neck=0.42, ear=0.15, hb={'fside': [0.55, 1], 'side': [0.65, 1]}, tail={'side': [0, 0.3, 0.22, 0.85], 'fside': [0, 0.3, 0.2, 0.85]}, leg=0.68, eyeKeys='j', palx={'a': '#1c1a24', 'b': '#24222c', 'c': '#2a2832', 'd': '#2e2c36', 'f': '#383640', 'g': '#44434e', 'h': '#52505c', 'i': '#62626e', 'e': '#7a1c28', 'j': '#ff3a40'}),
  'frostling': dict(neck=0.55, ear=0.25, hb={'front': [0.15, 0.85], 'fside': [0.45, 1], 'side': [0.55, 1]}, tail={'side': [0, 0.1, 0.4, 0.8], 'fside': [0, 0.1, 0.4, 0.8]}, leg=0.85, eyeKeys='kab'),
  'bellpaca':  dict(neck=0.33, ear=0.1, hb={'fside': [0.5, 1], 'side': [0.55, 1]}, tail={'side': [0, 0.3, 0.15, 0.6], 'fside': [0, 0.3, 0.15, 0.6]}, leg=0.75, eyeKeys='k'),
  'brawlix':   dict(neck=0.38, ear=0.2, hb={}, tail={'side': [0, 0.5, 0.25, 0.7], 'fside': [0, 0.5, 0.25, 0.7]}, leg=0.66, eyeKeys='o', src={v: 'brawl-x.json' for v in VIEWS}, post=brawl_post),
  'wispurr':   dict(neck=0.45, ear=0.15, hb={'front': [0, 0.7], 'fside': [0, 0.75], 'side': [0.3, 1], 'back': [0.3, 1]}, tail={'side': [0, 0.5, 0.45, 1], 'fside': [0.6, 0.5, 1, 1], 'front': [0.65, 0.4, 1, 1], 'back': [0, 0.4, 0.35, 1]}, leg=2, eyeKeys='c'),
  'pixibelle': dict(neck=0.52, ear=0.24, hb={'front': [0.3, 0.7], 'fside': [0.3, 0.75], 'side': [0.35, 0.95], 'back': [0.3, 0.7]}, tail={}, leg=0.94, wings='eghi', eyeKeys='ka'),
}


def strip_outline(m):
    H, W = len(m), len(m[0]); g = [list(r) for r in m]
    empty = lambda x, y: x < 0 or y < 0 or x >= W or y >= H or m[y][x] == '.'
    for y in range(H):
        for x in range(W):
            if m[y][x] == 'k' and any(empty(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): g[y][x] = '.'
    return [''.join(r) for r in g]


def antennae(m, hbf):
    """Pixibelle's thin curled antennae don't survive the shrink (bits of stalk float loose): keep the pink tips, drop
    the loose bits over the head, and join each tip to the top of the head with a one-pixel stalk."""
    H, W = len(m), len(m[0]); g = [list(r) for r in m]; x0, x1 = round(hbf[0] * W), round(hbf[1] * W) - 1
    body = [y for y in range(H) if sum(1 for x in range(x0, x1 + 1) if m[y][x] not in '.akc') >= 4 and y > 3][0]   # the head's top row
    for y in range(body):
        for x in range(x0, min(W, x1 + 3)):
            if g[y][x] in 'akc': g[y][x] = '.'   # c: a pink smudge the ghosted row left over the three-quarter view's head
    tips = {}
    for y in range(body):
        for x in range(x0, min(W, x1 + 3)):
            if g[y][x] == 'd': tips.setdefault(x < (x0 + x1) / 2, []).append((x, y))
    cols = [x for x in range(W) if m[body][x] not in '.ak' and x0 <= x <= x1]; cx = (min(cols) + max(cols)) / 2
    for left, ps in tips.items():
        tx, ty = max(ps, key=lambda p: p[1]); ex = round(cx + (-2 if left else 2)); ey = body - 1
        n = max(abs(ex - tx), abs(ey - ty))
        for i in range(1, n + 1):
            x = round(tx + (ex - tx) * i / n); y = round(ty + (ey - ty) * i / n)
            if g[y][x] == '.': g[y][x] = 'a'
    return [''.join(r) for r in g]


def runs(row):
    out, s = [], None
    for x, c in enumerate(row + '.'):
        if c != '.' and s is None: s = x
        if c == '.' and s is not None: out.append((s, x)); s = None
    return out


def legs(m, frac):
    H = len(m); top = round(frac * H)
    if top >= H: return H, []
    W = len(m[0]); seen = set(); comps = []
    for y in range(top, H):
        for x in range(W):
            if m[y][x] == '.' or (x, y) in seen: continue
            st = [(x, y)]; seen.add((x, y)); cs = [(x, y)]
            while st:
                a, b = st.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    u, v = a + dx, b + dy
                    if top <= v < H and 0 <= u < W and m[v][u] != '.' and (u, v) not in seen: seen.add((u, v)); st.append((u, v)); cs.append((u, v))
            comps.append(cs)
    if len(comps) == 1:   # one piece (a dress, legs joined at the top): split at its middle column
        xs = [p[0] for p in comps[0]]; mid = (min(xs) + max(xs)) / 2
        return top, sorted(p for p in comps[0] if p[0] < mid)
    order = sorted(range(len(comps)), key=lambda i: min(p[0] for p in comps[i]))
    A = set()
    for n, i in enumerate(order):
        if n % 2 == 0: A.update(comps[i])
    return top, sorted(A)


def eyes(m, pal, view, neck, hb, n, keys):
    H, W = len(m), len(m[0])
    dark = keys or ''
    seen = set(); found = []
    for y in range(H):
        for x in range(W):
            if m[y][x] not in dark or (x, y) in seen: continue
            st = [(x, y)]; seen.add((x, y)); cs = [(x, y)]
            while st:
                a, b = st.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    u, v = a + dx, b + dy
                    if 0 <= u < W and 0 <= v < H and m[v][u] in dark and (u, v) not in seen: seen.add((u, v)); st.append((u, v)); cs.append((u, v))
            enclosed = all(0 < a < W - 1 and 0 < b < H - 1 and all(m[b + dy][a + dx] != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))) for a, b in cs)
            if enclosed and 1 <= len(cs) <= 6 and max(p[1] for p in cs) < neck and min(p[0] for p in cs) >= hb[0] and max(p[0] for p in cs) <= hb[1]: found.append(cs)
    if not found: return []
    if view in ('side', 'fside'): found = [max(found, key=lambda c: sum(p[0] for p in c) / len(c) + 0.3 * len(c))] if view == 'side' else found
    found.sort(key=lambda c: -len(c)); found = found[:n]
    return [[min(p[0] for p in c), min(p[1] for p in c), max(1, max(p[0] for p in c) - min(p[0] for p in c) + 1)] for c in found]


out = {}
for id_, c in CFG.items():
    d = json.load(open(T + id_ + '.json')); pal = d['pal']; maps = {}; parts = {}
    srcm = d['maps']
    if 'src' in c:   # views traced at different sizes (front and back bigger than a long side view), empty rows trimmed
        srcm = []
        for i, v in enumerate(VIEWS):
            dm = json.load(open(T + c['src'][v]))['maps'][i]
            while dm and set(dm[-1]) == {'.'}: dm = dm[:-1]
            while dm and set(dm[0]) == {'.'}: dm = dm[1:]
            srcm.append(dm)
        pal = json.load(open(T + c['src']['front']))['pal']
    if 'palx' in c: pal = {**pal, **c['palx']}   # recoloured keys (the in-between pass)
    tailpx = {}
    for view, m in zip(VIEWS, srcm):
        if 'post' in c: m, tailpx[view] = c['post'](m, view)
        m = strip_outline(m)
        if id_ == 'pixibelle': m = antennae(m, c['hb'][view])
        H, W = len(m), len(m[0])
        neck = round(c['neck'] * H); ear = round(c['ear'] * H)
        hb = c['hb'].get(view, [0, 1]); hb = [round(hb[0] * W), round(hb[1] * W) - 1]
        tb = c['tail'].get(view)
        tail = [round(tb[0] * W), round(tb[1] * H), round(tb[2] * W) - 1, round(tb[3] * H) - 1] if tb else None
        top, A = legs(m, c['leg'])
        ne = 0 if view == 'back' else (1 if view == 'side' else 2)
        ey = eyes(m, pal, view, neck, hb, ne, c['eyeKeys']) if ne and c['eyeKeys'] else []
        maps[view] = m
        parts[view] = dict(tailPx=tailpx.get(view, []), neck=neck, ear=ear, hb=hb, tail=tail, leg=top, legA=[f'{x},{y}' for x, y in A], eyes=ey)
    out[id_] = dict(pal=pal, maps=maps, parts=parts, wings=c.get('wings', ''))
json.dump(out, open(T + 'traced-all.json', 'w'))

# preview: real colours left, part colours right
PC = {'h': (230, 80, 80), 'e': (240, 200, 60), 't': (80, 200, 240), 'A': (60, 200, 90), 'B': (30, 120, 50), 'b': (150, 150, 160), 'w': (200, 160, 255), 'eye': (0, 0, 0)}
Z = 5; rows = []
for id_, o in out.items():
    im = Image.new('RGB', ((sum(len(o['maps'][v][0]) + 2 for v in VIEWS) * 2) * Z, 32 * Z), (40, 70, 40)); x0 = 0
    for v in VIEWS:
        m = o['maps'][v]; P = o['parts'][v]; A = set(P['legA'])
        for y, r in enumerate(m):
            for x, k in enumerate(r):
                if k == '.': continue
                col = tuple(int(o['pal'][k][i:i + 2], 16) for i in (1, 3, 5))
                im.paste(col, ((x0 + x) * Z, y * Z, (x0 + x + 1) * Z, (y + 1) * Z))
                tb = P['tail']; inT = tb and tb[0] <= x <= tb[2] and tb[1] <= y <= tb[3]
                part = 'w' if k in o['wings'] and not (y < P['neck'] and P['hb'][0] <= x <= P['hb'][1]) else 'e' if y < P['ear'] and P['hb'][0] <= x <= P['hb'][1] else 'h' if y < P['neck'] and P['hb'][0] <= x <= P['hb'][1] and not inT else 't' if inT else ('A' if f'{x},{y}' in A else 'B') if y >= P['leg'] else 'b'
                im.paste(PC[part], ((x0 + len(m[0]) + 1 + x) * Z, y * Z, (x0 + len(m[0]) + 2 + x) * Z, (y + 1) * Z))
        for ex, ey_, w in P['eyes']:
            for dx in range(w): im.paste((255, 255, 255), ((x0 + len(m[0]) + 1 + ex + dx) * Z + 1, ey_ * Z + 1, (x0 + len(m[0]) + 2 + ex + dx) * Z - 1, (ey_ + 1) * Z - 1))
        x0 += 2 * len(m[0]) + 3
    rows.append(im)
o = Image.new('RGB', (max(r.width for r in rows), sum(r.height + 6 for r in rows)), (20, 20, 20)); y = 0
for r in rows: o.paste(r, (0, y)); y += r.height + 6
o.save('chk-parts.png')
print('ok')
