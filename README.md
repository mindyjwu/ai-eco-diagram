# AI Eco Diagram — The AI Money Map

An interactive supply chain of who funds AI: 21 layers and ~270 players, from the things households actually spend on and consume (Amazon orders and recommendations, social and video feeds, banking and payments, health, payroll and work software, smart homes, cars) down through AI labs, clouds, capital, data-centre gear, energy, servers, chip designers, fabs, equipment, materials and space, to raw quartz and copper.

Part of [Mindy's portfolio](https://mindy-portfolio.vercel.app).

- **Two views, one dataset.** *Layers* is a guided, scrollable page. *Full map* is a single zoomable canvas with every company and every link: scroll or pinch to zoom, drag to pan, click a layer chip to zoom into that layer, click a logo to fly to it and open its panel. Zoom reveals more: dots, then logos, then names, then tickers.
- Click any logo for what it makes, how it's doing and the opportunity.
- Follow the amber (depends on it) and teal (it depends on) chains.
- Filter by public, private, chokepoint, or non-company; run guided journeys such as *Your Amazon order → a quartz mine*.
- Deep links: `#map` opens the full map, `#n=nvidia` selects a company, `#j=feed` starts a journey (combine with `&`).

## Run locally

Plain HTML/CSS/JS, no build step:

```bash
python3 -m http.server 8080
```

## Edit the data

All companies, layers and journeys live in `js/ai-map-data.js`. Each node lists `up`, the things it typically depends on one step down. Logos load from each company's favicon with a monogram fallback.

## Caveats

Educational, not investment advice. Descriptions reflect knowledge to roughly mid-2026; "how they're doing" is qualitative on purpose. Links between companies are simplified, publicly known patterns, not contracts.
