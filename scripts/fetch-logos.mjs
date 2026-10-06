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

/* Companies whose own domain blocks bots or only returns a placeholder: also try these. */
const ALT = {
  'alibabagroup.com': ['alibaba.com', 'aliyun.com'],
  'mgx.ae': ['www.mgx.ae'],
  'quantatw.com': ['quanta.com.tw'],
  'tel.com': ['tokyoelectron.com', 'tel.co.jp'],
  'shinetsu.co.jp': ['shinetsu.jp', 'shin-etsu.co.jp'],
  'sas-globalwafers.com': ['globalwafers.com'],
  'ibiden.com': ['ibiden.co.jp'],
  'nittobo.co.jp': ['nittobo.com'],
  'honeywell.com': ['aerospace.honeywell.com'],
  'thequartzcorp.com': ['quartzcorp.com'],
  'yum.com': ['tacobell.com', 'kfc.com'],
  'ulalaunch.com': ['ula.com'],
  'applovin.com': ['axon.ai'],
};

/* Last resort for a few stubborn companies: the official logo from Wikidata / Wikimedia Commons.
   Only used for the names listed here, so it can't match the wrong company for anyone else. */
const WIKI = {
  'smics.com': 'Semiconductor Manufacturing International Corporation',
  'coorstek.com': 'CoorsTek',
  'unimicron.com': 'Unimicron',
  'ulalaunch.com': 'United Launch Alliance',
};

async function grabWiki(d) {
  const name = WIKI[d];
  if (!name) return null;
  const get = async (url, json = true) => {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'ai-eco-diagram logo fetch (https://github.com/mindyjwu/ai-eco-diagram)' } });
    if (!res.ok) throw new Error(String(res.status));
    return json ? res.json() : res;
  };
  try {
    const found = await get(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&type=item&limit=3&format=json&origin=*`);
    const hit = (found.search || [])[0];
    if (!hit) return null;
    for (const prop of ['P154', 'P8972']) { // logo image, small logo or icon
      const claims = await get(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${hit.id}&property=${prop}&format=json&origin=*`);
      const file = claims.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
      if (!file) continue;
      const res = await get(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=256`, false);
      const type = (res.headers.get('content-type') || '').toLowerCase();
      const e = ext(type);
      if (!e || e === 'svg') continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!good('wiki', buf, e)) continue;
      const out = `${d}.${e}`;
      fs.writeFileSync(path.join(outDir, out), buf);
      console.log(`\n  ${d}: used Wikidata ${hit.id} "${hit.label}" (${hit.description || 'no description'}) -> ${file}`);
      return out;
    }
  } catch { /* give up quietly */ }
  return null;
}

const sources = (d) => [
  ['google', `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`],
  ['gstatic', `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${d}&size=128`],
  ['duckduckgo', `https://icons.duckduckgo.com/ip3/${d}.ico`],
  ['site', `https://${d}/favicon.ico`],
];
const ext = (type) => (/svg/.test(type) ? 'svg' : /png/.test(type) ? 'png' : /jpe?g/.test(type) ? 'jpg' : /webp/.test(type) ? 'webp' : /icon|ico/.test(type) ? 'ico' : null);

/* Real pixel width where we can read it (PNG header / ICO directory), else null. */
function width(buf, e) {
  if (e === 'png' && buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return buf.readUInt32BE(16);
  if (e === 'ico' && buf.length > 8) { let w = 0; const n = buf.readUInt16LE(4); for (let i = 0; i < n && 6 + i * 16 < buf.length; i++) w = Math.max(w, buf[6 + i * 16] || 256); return w || null; }
  return null;
}
/* Google's "no favicon" globe is a 16px image, so it fails the size test; real logos are bigger. */
function good(name, buf, e) {
  const w = width(buf, e);
  if (name === 'google' || name === 'gstatic') return w != null ? w >= 32 : buf.length >= 1500;
  return w != null ? w >= 16 : buf.length >= 300;
}

async function grab(d) {
  const tries = [d];
  if (!d.startsWith('www.')) tries.push('www.' + d);
  for (const alt of ALT[d] || []) { tries.push(alt); if (!alt.startsWith('www.')) tries.push('www.' + alt); }
  for (const dom of tries) {
    for (const [name, url] of sources(dom)) {
      try {
        const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (logo fetch for ai-eco-diagram)' } });
        if (!res.ok) continue;
        const type = (res.headers.get('content-type') || '').toLowerCase();
        const e = ext(type);
        if (!e) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (!good(name, buf, e)) continue;
        const file = `${d}.${e}`;
        fs.writeFileSync(path.join(outDir, file), buf);
        return file;
      } catch { /* try the next source */ }
    }
  }
  return await grabWiki(d);
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
