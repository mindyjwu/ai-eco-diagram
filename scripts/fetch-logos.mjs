#!/usr/bin/env node
/* Download every company's logo once and store it in assets/logos/, so the site
   no longer depends on third-party favicon services at view time.

     node scripts/fetch-logos.mjs          # fetch any logos not already saved
     node scripts/fetch-logos.mjs --force  # re-fetch everything

   Then commit assets/logos/. The page prefers these local files and falls back to
   live favicon services for anything missing. Needs Node 18+ and internet access. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'logos');
const force = process.argv.includes('--force');

const w = {};
new Function('window', fs.readFileSync(path.join(root, 'js', 'ai-map-data.js'), 'utf8'))(w);
new Function('window', fs.readFileSync(path.join(root, 'js', 'ai-map-extra.js'), 'utf8'))(w);   /* adds the life-sciences companies */
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
  'macronix.com': ['mxic.com.tw', 'www.mxic.com.tw'],
  'samsungsem.com': ['sem.samsung.com', 'samsung.com'],
  'amecnsh.com': ['amec-inc.com', 'www.amecnsh.com'],
  'jcetglobal.com': ['jcet.com.cn', 'www.jcetglobal.com'],
  'inari-amertron.com.my': ['inari.com.my'],
  'unimicron.com': ['unimicron.com.tw', 'www.unimicron.com'],
  'ulalaunch.com': ['ula.com', 'www.ulalaunch.com'],
  'nanyapcb.com.tw': ['npc.com.tw'],
  'applovin.com': ['axon.ai'],
};

/* Last resort for a few stubborn companies: the official logo from Wikidata / Wikimedia Commons.
   Only used for the names listed here, so it can't match the wrong company for anyone else. */
const WIKI = {
  'smics.com': 'Semiconductor Manufacturing International Corporation',
  'coorstek.com': 'CoorsTek',
  'unimicron.com': 'Unimicron',
  'ulalaunch.com': 'United Launch Alliance',
  'powerchip.com': 'Powerchip',
  'micb2b.com': 'Marketech International',
  'nanyapcb.com.tw': 'Nan Ya PCB',
  'saswafer.com': 'Sino-American Silicon Products',
  'tmcnet.com.tw': 'Taiwan Mask Corporation',
  'allring-tech.com.tw': 'All Ring Tech',
  'macronix.com': 'Macronix',
  'samsungsem.com': 'Samsung Electro-Mechanics',
  'inari-amertron.com.my': 'Inari Amertron',
  'amecnsh.com': 'Advanced Micro-Fabrication Equipment',
  'jcetglobal.com': 'JCET Group',
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

/* More ways to find a logo for sites that block plain favicon requests. Each notes why it failed in `log`. */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const WIKI_PAGE = {
  'macronix.com': 'Macronix', 'unimicron.com': 'Unimicron', 'ulalaunch.com': 'United Launch Alliance',
  'nanyapcb.com.tw': 'Nan Ya PCB', 'inari-amertron.com.my': 'Inari Amertron', 'jcetglobal.com': 'JCET Group',
};
/* curl gets through some bot filters that drop Node's own HTTP client, and tells us why a request failed. */
const WIKI_UA = 'ai-eco-diagram logo fetch (https://github.com/mindyjwu/ai-eco-diagram)';
function curlGet(url, ms = 20000, ua = UA) {
  const tmp = path.join(os.tmpdir(), 'logo-' + Math.random().toString(36).slice(2));
  try {
    const meta = execFileSync('curl', ['-sSL', '--max-time', String(Math.ceil(ms / 1000)), '--compressed', '-A', ua, '-H', 'Accept: image/*,text/html,application/json,*/*', '-o', tmp, '-w', '%{http_code}|%{content_type}|%{url_effective}', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const [code, type, eff] = meta.split('|');
    if (!/^2/.test(code)) throw new Error('HTTP ' + code);
    return { buf: fs.readFileSync(tmp), type: (type || '').toLowerCase(), url: eff };
  } catch (e) {
    throw new Error(String(e.stderr || e.message || 'curl failed').trim().split('\n')[0].slice(0, 90));
  } finally { try { fs.unlinkSync(tmp); } catch { /* nothing to clean */ } }
}
async function getBuf(url, ms) { return curlGet(url, ms); }
const extFromUrl = (u) => { const m = /\.(png|jpe?g|webp|ico|svg)(\?|$)/i.exec(u); return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : null; };
function iconsFromHtml(html, base) {
  const out = [];
  const add = (href, rank) => { try { out.push({ url: new URL(href, base).href, rank }); } catch { /* bad url */ } };
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0], rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1] || '', href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/icon/i.test(rel)) continue;
    const size = parseInt(/sizes=["'](\d+)/i.exec(tag)?.[1] || '0', 10);
    add(href, (/apple-touch/i.test(rel) ? 1000 : 500) + size);
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (/property=["']og:image["']/i.test(tag)) { const c = /content=["']([^"']+)["']/i.exec(tag)?.[1]; if (c) add(c, 10); }
  }
  return out.sort((x, y) => y.rank - x.rank).map((x) => x.url);
}
async function saveIcon(d, name, url, log) {
  try {
    const { buf, type } = await getBuf(url);
    const e = ext(type) || extFromUrl(url);
    if (e === 'svg') {
      const text = buf.toString('utf8');
      if (!/<svg[\s>]/i.test(text) || buf.length < 300) { log.push(`${name}: ${url} is not a usable svg`); return null; }
    } else if (!e || e === 'webp') { log.push(`${name}: ${url} is ${e || type}`); return null; }
    else if (!good('site', buf, e)) { log.push(`${name}: ${url} too small`); return null; }
    const file = `${d}.${e}`; fs.writeFileSync(path.join(outDir, file), buf);
    console.log(`\n  ${d}: used ${name} ${url}`);
    return file;
  } catch (err) { log.push(`${name}: ${url} ${err.message}`); return null; }
}
async function grabHtml(d, log) {
  const hosts = [d, 'www.' + d, ...(ALT[d] || [])];
  for (const host of hosts) {
    try {
      const { buf, url } = await getBuf(`https://${host}/`);
      for (const icon of iconsFromHtml(buf.toString('utf8'), url).slice(0, 6)) { const f = await saveIcon(d, 'page-icon', icon, log); if (f) return f; }
    } catch (err) { log.push(`page ${host}: ${err.message}`); }
  }
  return null;
}
async function grabWayback(d, log) {
  for (const host of [d, 'www.' + d]) {
    try {
      const api = JSON.parse(curlGet(`https://archive.org/wayback/available?url=${host}`, 20000).buf.toString('utf8'));
      const snap = api.archived_snapshots?.closest?.url;
      if (!snap) { log.push(`wayback ${host}: no snapshot`); continue; }
      const raw = snap.replace(/\/web\/(\d+)\//, '/web/$1id_/');
      const { buf } = await getBuf(raw);
      for (const icon of iconsFromHtml(buf.toString('utf8'), `https://${host}/`).slice(0, 6)) {
        const ts = /\/web\/(\d+)/.exec(snap)?.[1];
        const f = await saveIcon(d, 'wayback-icon', `https://web.archive.org/web/${ts}im_/${icon}`, log); if (f) return f;
      }
    } catch (err) { log.push(`wayback ${host}: ${err.message}`); }
  }
  return null;
}
async function grabWikiPage(d, log) {
  const title = WIKI_PAGE[d];
  if (!title) return null;
  try {
    const res = JSON.parse(curlGet(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|description&piprop=thumbnail&pithumbsize=256&redirects=1&titles=${encodeURIComponent(title)}&format=json`, 20000, WIKI_UA).buf.toString('utf8'));
    const page = Object.values(res.query?.pages || {})[0];
    const src = page?.thumbnail?.source;
    if (!src) { log.push(`wikipedia "${title}": no lead image`); return null; }
    const f = await saveIcon(d, `wikipedia "${page.title}" (${page.description || 'no description'})`, src, log);
    return f;
  } catch (err) { log.push(`wikipedia "${title}": ${err.message}`); return null; }
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
  const log = [];
  const f = (await grabWiki(d)) || (await grabHtml(d, log)) || (await grabWayback(d, log)) || (await grabWikiPage(d, log));
  if (!f && log.length) console.log(`\n  ${d}: ${log.slice(0, 8).join(' | ')}`);
  return f;
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
