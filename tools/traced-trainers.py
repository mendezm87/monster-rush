"""Write js/trainers-traced.js from the traced trainer sheets in tools/traced-trainers/<id>.json (made by
trace-trainer.py), r275.

For each look and view it also finds the arms, so the pose rig (trainer.js) can lift them out and swing them: in
the rows from the shoulders to the hands, an arm is the outermost few columns on its side, measured from the side's
typical edge over those rows (so a scarf end or a cape that juts out further on a row or two isn't taken for it).
It records which pixels are arm (to leave off when that arm moves), where the shoulder is, and the arm's colours from
shoulder to hand (outer edge, middle, inner edge), which the rig paints the swung arm with. ARM_FIX overrides the
guess for a look and view where it's off.

    python tools/traced-trainers.py
"""
import json, os, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOX = 6               # body coordinates (the pose rig's) are picture x minus TOX
SHOULDER, HAND = 0.42, 0.80   # where the arms run, as a share of the figure's height from the top of its head
ARM_W = 4             # how many columns an arm takes at the side
NAMES = {'scarf': 'Relay Runner', 'researcher': 'Archive Scholar', 'diver': 'Salvager', 'shiba': 'Shrine Keeper'}
FACE_LEFT = {'researcher', 'diver'}   # Gemini drew these looks' side and three-quarter views facing left; the game's face right (r278)
WALK_FLIP = {('scarf', 'm', 'back')}   # walk rows Gemini drew with a one-sided thing on the other side from the standing picture (the scarf over the other shoulder from behind)
WALK_SKIP = {('scarf', 'm', 'fside'): (0,)}   # walk frames to leave out (Gemini's first 'front' frame, before it turned three-quarters)
ARM_FIX = {           # (look, sex, view, arm): (x0, y0, x1, y1) in picture pixels, where the guess is off
    ('scarf', 'm', 'back', 'L'): (4, 24, 7, 33), ('scarf', 'm', 'back', 'R'): (19, 24, 22, 33),   # the scarf hangs down his right side
    ('scarf', 'f', 'back', 'L'): (6, 24, 9, 33), ('scarf', 'f', 'back', 'R'): (18, 24, 21, 33),
    ('scarf', 'm', 'front', 'L'): (10, 24, 13, 32), ('scarf', 'm', 'fside', 'L'): (11, 26, 14, 33),   # and down the left in front
    ('scarf', 'f', 'front', 'L'): (10, 26, 13, 33), ('scarf', 'f', 'fside', 'L'): (11, 27, 14, 32),
}


def fill_holes(rows):
    """Gaps inside a figure are bits of its outfit the trace took for background (the Salvager's grey jumpsuit is close
    to the sheet's grey, r277): fill each from the colours round it, working in from its edge."""
    h, w = len(rows), len(rows[0]); g = [list(r) for r in rows]
    out, st = set(), [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while st:
        x, y = st.pop()
        if (x, y) in out or not (0 <= x < w and 0 <= y < h) or g[y][x] != '.': continue
        out.add((x, y)); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    holes = {(x, y) for y in range(h) for x in range(w) if g[y][x] == '.' and (x, y) not in out}
    while holes:
        done = {}
        for x, y in holes:
            near = [g[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, 1), (1, -1), (-1, -1))
                    if 0 <= x + dx < w and 0 <= y + dy < h and g[y + dy][x + dx] != '.']
            near = [c for c in near if c != 'k'] or near   # the outline only where nothing else is next to it
            if len(near) >= 2: done[(x, y)] = max(set(near), key=near.count)
        if not done: done = {p: 'k' for p in holes}
        for (x, y), c in done.items(): g[y][x] = c
        holes -= set(done)
    return [''.join(r) for r in g]


def side_sig(rows):
    """Where each colour sits left to right, from the figure's middle: {key: (count, mean x)}."""
    pts = [(x, c) for r in rows for x, c in enumerate(r) if c != '.']
    if not pts: return {}
    mid = (min(x for x, _ in pts) + max(x for x, _ in pts)) / 2
    sig = {}
    for x, c in pts: n, sx = sig.get(c, (0, 0)); sig[c] = (n + 1, sx + x - mid)
    return {c: (n, sx / n) for c, (n, sx) in sig.items()}


def sig_dist(a, b):
    return sum(min(a[c][0], b[c][0]) * abs(a[c][1] - b[c][1]) for c in a if c in b)


def agree(frames):
    """Gemini's walk rows aren't always consistent: a frame turned the other way, or the scarf swinging over the
    other shoulder (r284, the owner: walking diagonally the Relay Runner seemed to flip back and forth). Mirror any
    frame that matches the rest of its row better mirrored, so the whole cycle keeps one side."""
    out = [list(f) for f in frames]
    for _ in range(2):
        sigs = [side_sig(f) for f in out]
        for i, f in enumerate(out):
            m = [r[::-1] for r in f]; sm = side_sig(m)
            here = sum(sig_dist(sigs[i], sigs[j]) for j in range(len(out)) if j != i)
            flipped = sum(sig_dist(sm, sigs[j]) for j in range(len(out)) if j != i)
            if flipped < here * 0.8: out[i] = m; sigs[i] = sm
    return out


def fix_left(look, sex, view, rows):
    """A mirrored walk frame facing left: put back what the mirror moved to the wrong side (LEFT_FIX)."""
    return rows


def find_arms(rows, look, sex, view):
    filled = [(x, y) for y, r in enumerate(rows) for x, c in enumerate(r) if c != '.']
    y_top = min(y for _, y in filled); y_bot = max(y for _, y in filled); h = y_bot - y_top + 1
    y0, y1 = round(y_top + SHOULDER * h), round(y_top + HAND * h)
    lefts, rights = [], []
    for y in range(y0, y1 + 1):
        xs = [x for x, c in enumerate(rows[y]) if c != '.']
        if xs: lefts.append(min(xs)); rights.append(max(xs))
    arms = {}
    for k, edge, sign in (('L', round(statistics.median(lefts)), 1), ('R', round(statistics.median(rights)), -1)):
        xa, xb = (edge, edge + ARM_W - 1) if sign > 0 else (edge - ARM_W + 1, edge)
        box = ARM_FIX.get((look, sex, view, k), (xa, y0, xb, y1))
        px = [(x, y) for y in range(box[1], box[3] + 1) for x in range(box[0], box[2] + 1) if 0 <= x < len(rows[0]) and rows[y][x] != '.']
        if len(px) < 6: continue
        # colours down the arm: for each row, the pixels from its outer edge in (3 of them: outer, middle, inner)
        cols = []
        for y in range(box[1], box[3] + 1):
            row = [rows[y][x] for x in (range(box[0], box[2] + 1) if k == 'L' else range(box[2], box[0] - 1, -1)) if rows[y][x] != '.']
            if len(row) >= 2: cols.append([row[0], row[len(row) // 2], row[-1]])
        if len(cols) < 4: continue
        hand = cols[-2:]
        # what's left when the arm is lifted out: where the outfit is as wide just below the hands (a coat, wide
        # sleeves or trousers behind the arm), the gap takes the colour beside it, with a dark edge on the outside;
        # where the arm stuck out past the body, the gap is cleared
        below = [x for x, c in enumerate(rows[min(len(rows) - 1, box[3] + 2)]) if c != '.']
        body = (min(below) if k == 'L' else max(below)) if below else None
        mine = set(px); fill = []
        for x, y in px:
            inside = body is not None and (x >= body if k == 'L' else x <= body)
            if not inside: continue
            step = 1 if k == 'L' else -1; xx = x
            while (xx, y) in mine: xx += step
            c = rows[y][xx] if 0 <= xx < len(rows[0]) else '.'
            if c != '.': fill.append([x, y, 'k' if x == body else c])
        arms[k] = {'px': [[x, y] for x, y in px], 'fill': fill, 'sx': (box[0] + box[2]) / 2 - TOX + (-1 if k == 'L' else 1), 'sy': box[1],
                   'side': -1 if k == 'L' else 1, 'cols': cols[:-2], 'fist': hand[-1]}
    return arms


def main():
    out = {}
    d = os.path.join(ROOT, 'tools', 'traced-trainers')
    for f in sorted(os.listdir(d)):
        if not f.endswith('.json') or '-walk' in f: continue
        look = f[:-5]; t = json.load(open(os.path.join(d, f)))
        L = {'name': NAMES.get(look, look), 'pal': t['pal'], 'm': {}, 'f': {}}
        for sex in 'mf':
            for view, rows in t[sex].items():
                rows = fill_holes(rows)
                if look in FACE_LEFT and view in ('side', 'fside'): rows = [r[::-1] for r in rows]
                L[sex][view] = {'map': rows, 'arms': find_arms(rows, look, sex, view) if view != 'side' else {}}
            # no three-quarter back yet: trainers.js uses the back picture (never mirrored)
            # walk cycles from Gemini (r279), traced by trace-trainer.py --walk: <look>-<sex>-walk.json, -walk2.json...
            wfs = sorted(os.path.join(d, g) for g in os.listdir(d) if g.startswith(f'{look}-{sex}-walk'))
            frames = {}
            for wf in wfs:
                w = json.load(open(wf))
                rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
                near = {k: min(t['pal'], key=lambda j: sum((a - b) ** 2 for a, b in zip(rgb(c), rgb(t['pal'][j])))) for k, c in w['pal'].items()}
                for pics in w['walk'].values():   # the walk in the look's own colours, so its pictures mix with the rest
                    for p in pics: p[:] = [''.join(near.get(c, c) for c in r) for r in p]
                for view, pics in w['walk'].items():
                    keep = [fill_holes(p) for i, p in enumerate(pics) if i not in WALK_SKIP.get((look, sex, view), ())]
                    if (look, sex, view) in WALK_FLIP: keep = [[r[::-1] for r in p] for p in keep]   # (FACE_LEFT is for the standing sheets only)
                    keep = agree(keep)
                    frames[view] = keep
            if not frames: continue
            for v, src in (('sideL', 'side'), ('fsideL', 'fside')):   # facing left with no picture of its own (Gemini kept
                if src in frames and v not in frames:                     # turning them right, r279): the right-facing walk
                    frames[v] = [fix_left(look, sex, v, [r[::-1] for r in p]) for p in frames[src]]   # mirrored, one-sided things put right
            if 'back' in frames: frames.setdefault('bside', frames['back'])
            for v in ('sideL', 'fsideL'):   # facing left, drawn by Gemini (not mirrored, so one-sided things stay put): its
                if v not in frames: continue    # standing picture is the walk frame with the feet closest together
                def stance(p):
                    bot = max(y for y, r in enumerate(p) if r.strip('.')); xs = [x for y in range(bot - 2, bot + 1) for x, c in enumerate(p[y]) if c != '.']
                    return max(xs) - min(xs)
                still = min(frames[v], key=stance)
                L[sex][v] = {'map': still, 'arms': find_arms(still, look, sex, v) if v == 'fsideL' else {}}
            L[sex]['walk'] = {'pal': t['pal'], 'frames': frames}
        out[look] = L
    js = ('// The traced trainer looks (r275, the owner\'s new HD-2D trainers: docs/refs/TR-*-chibi.jpg), written by\n'
          '// tools/traced-trainers.py from tools/traced-trainers/*.json. Do not edit by hand. trainers.js turns each into a\n'
          '// look: the picture straight from the trace, and its arms (found by the tool) for the pose rig.\n'
          'const TRAINER_TRACED = ' + json.dumps(out, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'js', 'trainers-traced.js'), 'w', encoding='utf-8', newline='\n').write(js)
    print({k: {s: sorted(L[s]) for s in 'mf'} for k, L in out.items()}, len(js), 'bytes')


if __name__ == '__main__':
    main()
