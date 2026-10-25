# writes the TRACED data block of js/monsters/traced.js from traced-all.json, keeping the code below it
import json, os, io
T = os.environ['TMP'] + '/tr/'
D = json.load(open(T + 'traced-all.json'))
L = ['const TRACED = {']
for id_, o in D.items():
    L.append(f'  {id_}: {{')
    L.append('    pal: ' + json.dumps(o['pal']).replace('"', "'") + ',')
    if o['wings']: L.append(f"    wings: '{o['wings']}',")
    L.append('    maps: {')
    for v, m in o['maps'].items(): L.append(f'      {v}: [' + ', '.join(f"'{r}'" for r in m) + '],')
    L.append('    },')
    L.append('    parts: {')
    for v, p in o['parts'].items():
        A = [int(s.split(',')[1]) * 64 + int(s.split(',')[0]) for s in p['legA']]
        tp = f", tailPx: {p['tailPx']}" if p.get('tailPx') else ''
        L.append(f"      {v}: {{ neck: {p['neck']}, ear: {p['ear']}, hb: {p['hb']}, tail: {json.dumps(p['tail'])}{tp}, leg: {p['leg']}, legA: {A}, eyes: {json.dumps(p['eyes'])} }},")
    L.append('    },')
    L.append('  },')
L.append('};')
p = 'js/monsters/traced.js'; s = io.open(p, encoding='utf-8').read()
a = s.index('const TRACED = {'); b = s.index('\n};\n', a) + 4
s = s[:a] + '\n'.join(L) + '\n' + s[b:]
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('written')
