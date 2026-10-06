# AI Eco Diagram — The AI Money Map

An interactive supply chain of who funds AI: 26 layers and ~320 players, from the things households actually spend on and consume (Amazon orders and recommendations, social and video feeds, food and restaurants, travel, education, gig and freelance work, banking and payments, health, payroll and work software, smart homes, cars) down through AI labs, clouds, capital, data-centre gear, energy, servers, chip designers, fabs, equipment, materials and space, to raw quartz and copper.

Part of [Mindy's portfolio](https://mindy-portfolio.vercel.app).

The home page (`index.html`) *is* the app: a slim toolbar and the map filling the rest of the window. `about.html` holds the "Who actually pays for AI?" intro, a how-to-read guide, the guided journeys, "four ways in" and the caveats.

- **Two views, one dataset.** *Full map* (the default) is a three-level zoomable canvas:
  1. **Overview:** 26 layers grouped into 5 zones, each row showing its eight best-connected logos, with arcs on the right showing how many links run between layers. No company-level lines, so it stays readable.
  2. **Open a layer:** zoom in or click a layer chip and the row spreads out to every company, with names (and tickers when closer).
  3. **Open a company:** click one and only its own chains appear (amber above, teal below) while everything else dims. Hovering previews direct links. An *All links* button draws every link if you want the full web.
  *Layers* is the guided, scrollable alternative.
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
