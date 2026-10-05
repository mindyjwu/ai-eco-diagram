# AI Eco Diagram — The AI Money Map

An interactive supply chain of who funds AI: 17 layers and ~220 players, from daily life (Spotify, cards, chatbots, smart homes) through apps, labs, clouds, capital, data-centre gear, energy, servers, chip designers, fabs, equipment, materials and space, down to raw quartz and copper.

Part of [Mindy's portfolio](https://mindy-portfolio.vercel.app).

- Click any logo for what it makes, how it's doing and the opportunity.
- Follow the amber (depends on it) and teal (it depends on) chains.
- Filter by public, private, chokepoint, or government/raw materials.
- Run guided journeys, e.g. one Spotify stream down to a quartz mine.

## Run locally

Plain HTML/CSS/JS, no build step:

```bash
python3 -m http.server 8080
```

## Edit the data

All companies, layers and journeys live in `js/ai-map-data.js`. Each node lists `up`, the things it typically depends on one step down. Logos load from each company's favicon with a monogram fallback.

## Caveats

Educational, not investment advice. Descriptions reflect knowledge to roughly mid-2026; "how they're doing" is qualitative on purpose. Links between companies are simplified, publicly known patterns, not contracts.
