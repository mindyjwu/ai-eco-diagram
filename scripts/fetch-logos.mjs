#!/usr/bin/env node
/* Download every company's logo once and store it in assets/logos/, so the site
   no longer depends on third-party favicon services at view time.

     node scripts/fetch-logos.mjs          # fetch any logos not already saved
     node scripts/fetch-logos.mjs --force  # re-fetch everything

   Then commit assets/logos/. The page prefers these local files and falls back to
   live favicon services for anything missing. Needs Node 18+ and internet access. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'logos');
const force = process.argv.includes('--force');

const w = {};
new Function('window', fs.readFileSync(path.join(root, 'js', 'ai-map-data.js'), 'utf8'))(w);
const domains = [...new Set(w.AIMAP.NODES.filter((n) => n.d && !n.e).map((n) => n.d))].sort();

fs.mkdirSync(outDir, { recursive: true });
const manifestPath = path.join(outDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

const sources = (d) => [
  [`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`, 1500],
  [`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${d}&size=128`, 1500],
  [`https://icons.duckduckgo.com/ip3/${d}.ico`, 300],
  [`https://${d}/favicon.ico`, 300],
];
const ext = (type) => (/svg/.test(type) ? 'svg' : /png/.test(type) ? 'png' : /jpe?g/.test(type) ? 'jpg' : /webp/.test(type) ? 'webp' : /icon|ico/.test(type) ? 'ico' : null);

async function grab(d) {
  for (const [url, minBytes] of sources(d)) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (logo fetch for ai-eco-diagram)' } });
      if (!res.ok) continue;
      const type = (res.headers.get('content-type') || '').toLowerCase();
      const e = ext(type);
      if (!e) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < minBytes) continue; // tiny = the generic globe placeholder
      const file = `${d}.${e}`;
      fs.writeFileSync(path.join(outDir, file), buf);
      return file;
    } catch { /* try the next source */ }
  }
  return null;
}

let ok = 0, skipped = 0;
const missing = [];
for (const d of domains) {
  if (!force && manifest[d] && fs.existsSync(path.join(outDir, manifest[d]))) { skipped++; continue; }
  const file = await grab(d);
  if (file) { manifest[d] = file; ok++; process.stdout.write('.'); }
  else { missing.push(d); process.stdout.write('x'); }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
console.log(`\nfetched ${ok}, already had ${skipped}, missing ${missing.length}`);
if (missing.length) console.log('missing (monograms will show):', missing.join(', '));
