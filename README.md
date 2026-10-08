# The AI Ecosystem

An interactive map of the current AI ecosystem: 26 layers and ~320 players, from what people spend on (shopping, feeds, food, travel, education, gig work, payments, health, work) through labs, clouds, capital, data centres, energy, chips, fabs and equipment, down to space and raw materials.

Part of [Mindy's portfolio](https://mindy-portfolio.vercel.app).

The home page (`index.html`) *is* the app: a slim toolbar and the map filling the rest of the window. `about.html` holds the "Who actually pays for AI?" intro, a how-to-read guide, the guided journeys, "four ways in" and the caveats.

- **Two views, one dataset.** *Full map* (the default) packs the five zones into a space-filling layout chosen for your window's shape (side-by-side blocks on a laptop, a single column on a phone) and re-flows when you resize. Every company is an icon; icons, names and titles live in one scene and scale together, so nothing overlaps at any zoom, and zooming out stops at a readable size. Zoom or click a layer to see names and tickers; click a company to reveal only its own links (amber = used by, teal = depends on). Hover for definitions. An *All links* button draws every link. *Layers* is the guided, scrollable alternative.
- Click any logo for what it makes, how it's doing and the opportunity.
- Follow the amber (depends on it) and teal (it depends on) chains.
- Filter by public, private, chokepoint, or non-company; run guided journeys such as *Your Amazon order → a quartz mine*.
- The **full map is the default view**. Deep links: `#layers` opens the scrollable layer view instead, `#lens=public` (or `private`, `choke`, `other`) pre-selects a lens, `#n=nvidia` selects a company, `#j=feed` starts a journey (combine with `&`, e.g. `#layers&n=nvidia`).

## Run locally

Plain HTML/CSS/JS, no build step:

```bash
python3 -m http.server 8080
```

## Edit the data

All companies, layers and journeys live in `js/ai-map-data.js`. Each node lists `up`, the things it typically depends on one step down. Logos load from each company's favicon with a monogram fallback.

## Caveats

Educational, not investment advice. Descriptions reflect knowledge to roughly mid-2026; "how they're doing" is qualitative on purpose. Links between companies are simplified, publicly known patterns, not contracts.

## Logos

Logos are shown from `assets/logos/` when present, and otherwise fetched live from several favicon services in turn (Google, Google's gstatic, DuckDuckGo, then the company's own `/favicon.ico`), with a letter badge as the last resort.

A GitHub Action (`.github/workflows/fetch-logos.yml`) keeps `assets/logos/` up to date automatically: it runs whenever `js/ai-map-data.js` changes (for example when you add a company), once a month to catch rebrands, and on demand from the repo's **Actions** tab (*Fetch logos → Run workflow*; tick *force* to re-download everything). It commits any new logos back to `main`, which redeploys the site.

To do the same locally: `node scripts/fetch-logos.mjs` (Node 18+, internet access), then commit `assets/logos/`.
