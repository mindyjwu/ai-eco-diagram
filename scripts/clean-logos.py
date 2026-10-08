"""Make every bundled logo a PNG with a transparent background.
Flood-fills near-uniform edge colour (usually white) to transparent, converts ico/jpg/webp to png,
and updates assets/logos/manifest.json. Needs Pillow. Safe to re-run."""
import json, os
from collections import deque
from PIL import Image
D = 'assets/logos'; M = os.path.join(D, 'manifest.json')
man = json.load(open(M))
def clean(im):
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    edge = [px[x, y] for x in range(w) for y in (0, h - 1)] + [px[x, y] for y in range(h) for x in (0, w - 1)]
    opaque = [p for p in edge if p[3] > 200]
    if len(opaque) < len(edge) * 0.6: return im
    bg = max(set(opaque), key=opaque.count)
    if sum(1 for p in opaque if sum(abs(p[i] - bg[i]) for i in range(3)) < 40) < len(opaque) * 0.8: return im
    near = lambda p: p[3] < 20 or sum(abs(p[i] - bg[i]) for i in range(3)) < 60
    seen = bytearray(w * h); q = deque()
    for x in range(w):
        for y in (0, h - 1): q.append((x, y))
    for y in range(h):
        for x in (0, w - 1): q.append((x, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        if not near(px[x, y]): continue
        seen[y * w + x] = 1; px[x, y] = (bg[0], bg[1], bg[2], 0)
        q.extend(((x+1, y), (x-1, y), (x, y+1), (x, y-1)))
    return im
for dom, f in list(man.items()):
    src = os.path.join(D, f)
    if not os.path.exists(src) or f.endswith('.svg'): continue
    try:
        im = Image.open(src)
        if getattr(im, 'n_frames', 1) > 1 and f.endswith('.ico'):
            im = max((im.ico.getimage(s) for s in im.ico.sizes()), key=lambda i: i.size[0]) if hasattr(im, 'ico') else im
        out = clean(im); name = dom + '.png'
        out.save(os.path.join(D, name), 'PNG')
        if name != f: os.remove(src); man[dom] = name
    except Exception as e:
        print('skip', f, e)
json.dump(man, open(M, 'w'), indent=1); open(M, 'a').write('\n')
