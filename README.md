# The AI Ecosystem

An interactive map of the current AI ecosystem: 29 layers and ~410 players from 28 countries, from what people spend on (shopping, feeds, food, travel, education, gig work, payments, health, work) through labs, clouds, capital, data centres, energy, chips, fabs and equipment, down to space and raw materials.

Part of [Mindy's portfolio](https://mindy-portfolio.vercel.app).

The home page (`index.html`) *is* the app: a slim toolbar and the map filling the rest of the window. `about.html` holds the "Who actually pays for AI?" intro, a how-to-read guide, the guided journeys, "four ways in" and the caveats.

- **Two views, one dataset.** *Full map* (the default) packs the six zones into a space-filling layout chosen for your window's shape (side-by-side blocks on a laptop, a single column on a phone) and re-flows when you resize. Every company is an icon; icons, names and titles live in one scene and scale together, so nothing overlaps at any zoom, and zooming out stops at a readable size. Zoom or click a layer to see names and tickers; click a company to reveal only its own links (amber = used by, teal = depends on). Hover for definitions. An *All links* button draws every link. *Layers* is the guided, scrollable alternative.
- Click any logo for what it makes, how it's doing and the opportunity.
- Follow the amber (depends on it) and teal (it depends on) chains.
- **Industry views** (top bar): Everything, AI model, Semiconductors, Space, Power & data centres, Biotech, plus TSMC & Taiwan (about 40 Taiwan-based players, TSMC's customers and the foreign suppliers they rely on). A view shows its layers plus what they depend on, re-packed to fill the screen. The AI model view adds a *Highlight* bar (compute, memory, foundry, power, minerals…).
- **Countries and bottlenecks.** Every company has a headquarters country (shown as a code under its name; filter from the country menu). ◆ marks bottlenecks, and each has a one-line reason in its panel. Country data and bottleneck reasons live in `js/ai-map-extra.js`.
- **Supply-chain page.** Click a household activity in the You layer (for example *Creating: writing, music, images & video*) and a full-page branch opens in the same page: the chain laid out in columns from the activity down to the Earth (apps, AI labs, clouds, data centres and power, servers and chip designers, fabs, tools, materials, raw inputs). The best-connected players show first per column, with "+N more"; hover or click one to trace its path, double-click to make it the new starting point. *Open supply chain* in any company's panel does the same, and also shows who depends on it. Code: `js/ai-map-branch.js`; link with `#branch=ID`.
- **Flows on every link.** Click a company and its *Depends on* / *Used by* lists say what moves along each link (for example TSMC ← ASML: EUV and DUV lithography machines). On the map, hover a highlighted link for the same text; zoom in and the labels appear on the line. Labels live in `js/ai-map-flows.js`: one usual product per supplier, plus exceptions for specific pairs. They are typical and simplified, not contract data.
- Filter by public, private, bottleneck, or non-company; run guided journeys such as *Your Amazon order → a quartz mine*.
- The **full map is the default view**. Deep links: `#layers` opens the scrollable layer view instead, `#lens=public` (or `private`, `choke`, `other`) pre-selects a lens, `#n=nvidia` selects a company, `#j=feed` starts a journey (combine with `&`, e.g. `#layers&n=nvidia`).

## Run locally

Plain HTML/CSS/JS, no build step:

```bash
python3 -m http.server 8080
```

## Edit the data

All companies, layers and journeys live in `js/ai-map-data.js`; the life-sciences layers, countries, bottleneck reasons and views are layered on top in `js/ai-map-extra.js`. Each node lists `up`, the things it typically depends on one step down. Logos load from each company's favicon with a monogram fallback.

## Caveats

Educational, not investment advice. Descriptions reflect knowledge to roughly mid-2026; "how they're doing" is qualitative on purpose. Links between companies are simplified, publicly known patterns, not contracts.

## Logos

Logos are shown from `assets/logos/` when present, and otherwise fetched live from several favicon services in turn (Google, Google's gstatic, DuckDuckGo, then the company's own `/favicon.ico`), with a letter badge as the last resort.

A GitHub Action (`.github/workflows/fetch-logos.yml`) keeps `assets/logos/` up to date automatically: it runs whenever `js/ai-map-data.js` or `js/ai-map-extra.js` changes (for example when you add a company), once a month to catch rebrands, and on demand from the repo's **Actions** tab (*Fetch logos → Run workflow*; tick *force* to re-download everything). It commits any new logos back to `main`, which redeploys the site.

To do the same locally: `node scripts/fetch-logos.mjs` (Node 18+, internet access), then commit `assets/logos/`.
