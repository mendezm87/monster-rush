# Checks that the files shared with Monster Battle Stadium are identical in both games (line endings ignored).
# Run before every push: python tools/check-shared.py   (exit code 1 and a list if anything differs)
# Optional: --stadium PATH (default: the folder next to this repo, ../monster-battle-stadium)
import os, sys, glob

RUSH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
STADIUM = args[args.index('--stadium') + 1] if '--stadium' in args else os.path.join(os.path.dirname(RUSH), 'monster-battle-stadium')
SHARED = ['js/fx-sheets.js', 'js/sprites.js', 'js/monsters.js', 'js/fx.js', 'js/audio.js', 'js/describe.js', 'js/movesets.js']

def read(root, rel):
    p = os.path.join(root, rel)
    if not os.path.exists(p): return None
    return open(p, 'rb').read().replace(b'\r\n', b'\n')

def monster_files(root):
    return {os.path.relpath(p, root).replace('\\', '/') for p in glob.glob(os.path.join(root, 'js', 'monsters', '*.js'))}

if not os.path.isdir(STADIUM):
    print('Stadium not found at', STADIUM); sys.exit(2)
files = SHARED + sorted(monster_files(RUSH) | monster_files(STADIUM))
problems = []
for rel in files:
    a, b = read(RUSH, rel), read(STADIUM, rel)
    if a is None: problems.append(f'{rel}: only in the Stadium')
    elif b is None: problems.append(f'{rel}: only in Rush')
    elif a != b:
        la, lb = a.split(b'\n'), b.split(b'\n')
        first = next((i for i, (x, y) in enumerate(zip(la, lb)) if x != y), min(len(la), len(lb)))
        problems.append(f'{rel}: differs (first at line {first + 1}; Rush {len(la)} lines, Stadium {len(lb)})')
if problems:
    print('Shared files out of sync:'); [print('  ' + p) for p in problems]; sys.exit(1)
print(f'Shared files in sync ({len(files)} files).')
