/* ============================================================
   THE AI MONEY MAP — data
   Layers run top (you) to bottom (the Earth). Each node lists
   `up`: the things it typically pays / depends on one step down.
   For capital providers, `up` points at what they finance.
   Relationships are simplified, publicly known patterns, not a
   list of contracts. Facts reflect my knowledge to roughly
   mid-2026; always check live sources before acting.
   Fields: id l(ayer) n(ame) d(omain for logo) e(moji) q(Yahoo symbol)
           s(status note) w(what) y(why it matters) p(performance)
           o(opportunity) up[] c(hokepoint)
   ============================================================ */
window.AIMAP = (function () {

const LAYERS = [
  { id: 'you', name: 'You',
    sub: 'What households spend, consume and earn.',
    take: 'Every purchase, scroll and prompt is a small payment that funds everything below.',
    build: 'Start from a daily frustration, then trace what an AI fix would run on.' },
  { id: 'shop', name: 'Shopping & delivery',
    sub: 'Marketplaces, retailers and delivery.',
    take: 'Heavy AI users: recommendations, pricing, fraud checks, warehouse robots and routing.',
    build: 'Merchant tools, returns and shopping agents. Platforms own distribution; niches win.' },
  { id: 'social', name: 'Social, video & search',
    sub: 'Feeds, video, search and the ads that pay for them.',
    take: 'Attention is sold to advertisers, and AI ranking picks what you see. Among the largest AI workloads.',
    build: 'Creator tools, ad measurement and brand safety. The platforms are the customers.' },
  { id: 'work', name: 'Work & payroll',
    sub: 'Work software and payroll.',
    take: 'Enterprise seats are the steadiest AI revenue. Payroll firms sit on the rails that move wages.',
    build: 'Vertical AI for one profession, or agents that finish whole tasks.' },
  { id: 'gig', name: 'Gig work',
    sub: 'Platforms matching workers to jobs, and paid AI training.',
    take: 'Matching runs on AI, and gig work feels automation first. Labs now pay experts to train models.',
    build: 'Tools for independents: benefits, taxes, portable reputation.' },
  { id: 'money', name: 'Money & payments',
    sub: 'Cards, banks, brokers and central-bank rails.',
    take: 'AI scores fraud and credit. Networks earn a toll on every payment, and savings flow on to fund AI.',
    build: 'Fraud tools, embedded finance and agentic payments. Compliance know-how is an edge.' },
  { id: 'health', name: 'Health',
    sub: 'Wearables, insurers, hospitals and drug discovery.',
    take: 'Real value in note-taking, diagnostics and drug discovery, slowed by regulation and privacy.',
    build: 'Clinical workflow tools. Trust and domain expertise beat raw model quality.' },
  { id: 'food', name: 'Food & restaurants',
    sub: 'Grocers, restaurants and their software.',
    take: 'Thin margins make small AI gains matter: forecasting, ordering, drive-through voice.',
    build: 'Restaurant software, food-waste cuts and kitchen automation.' },
  { id: 'travel', name: 'Travel',
    sub: 'Airlines, hotels and booking.',
    take: 'Big discretionary spend and a prime use for trip-planning agents. Planes rest on a few makers.',
    build: 'Agentic planning and disruption handling. Giants hold distribution.' },
  { id: 'edu', name: 'Education',
    sub: 'Schools, courses and tutoring.',
    take: 'AI threatens education (cheating, homework help) and powers it (one-to-one tutoring).',
    build: 'Tutors with real pedagogy, teacher tools, cheat-resistant assessment.' },
  { id: 'devices', name: 'Devices, cars & home',
    sub: 'Phones, cars and the connected home.',
    take: 'Hardware is the glass between you and AI. Margins are thin, switching costs are real.',
    build: 'Software for homes, health and cars is easier than building hardware.' },
  { id: 'labs', name: 'AI labs',
    sub: 'Who trains and serves the models.',
    take: 'Labs burn huge capital to train models, then sell access. Most are private.',
    build: 'Evaluation, data, safety and vertical fine-tuning, not frontier training.' },
  { id: 'cloud', name: 'Cloud & compute',
    sub: 'Hyperscalers and GPU clouds.',
    take: 'They buy chips and rent out compute. Capex runs to hundreds of billions a year.',
    build: 'Spare capacity, scheduling and inference cost tooling.' },
  { id: 'capital', name: 'Capital & financing',
    sub: 'The money that fronts the buildout.',
    take: 'Data centres run on equity, private credit and infrastructure funds. Watch circular deals and debt.',
    build: 'Infrastructure finance is a real career path.' },
  { id: 'dc', name: 'Data centres',
    sub: 'Buildings, cooling and power gear.',
    take: 'Rack power has jumped from a few kW to 100+, pushing liquid cooling and high-voltage gear.',
    build: 'Cooling retrofits, commissioning and power tech are short of skilled people.' },
  { id: 'energy', name: 'Energy & grid',
    sub: 'Power plants, turbines, grid and fuel.',
    take: 'Electricity is the binding limit. Grid hookups take years, and turbines and transformers are backordered.',
    build: 'Grid software, storage, flexible load and permitting automation.' },
  { id: 'agri', name: 'Farming & food supply',
    sub: 'Distributors, processors, machinery and fertiliser.',
    take: 'A concentrated chain of few traders, machinery makers and fertiliser producers. AI enters via precision farming.',
    build: 'Precision agriculture, cold-chain logistics and fertiliser efficiency.' },
  { id: 'systems', name: 'Servers & networking',
    sub: 'Servers, networking and optics.',
    take: 'Server makers earn thin margins on volume. Optics and networking grow faster.',
    build: 'Optical interconnect, cooling parts and cluster diagnostics.' },
  { id: 'chips', name: 'Chip designers',
    sub: 'Chip designers, design software and IP.',
    take: 'High-margin and concentrated. NVIDIA leads, custom chips are rising, two firms own the design software.',
    build: 'Custom silicon, design automation and open hardware.' },
  { id: 'fabs', name: 'Fabs, memory & packaging',
    sub: 'Where chips are made, stacked and packaged.',
    take: 'The tightest chokepoint. Few fabs make leading-edge chips, and AI memory and packaging are sold out.',
    build: 'Yield analytics, supply-chain visibility and defect detection.' },
  { id: 'equip', name: 'Chip equipment',
    sub: 'Machines that print, etch, inspect and test.',
    take: 'Tool makers sell to every fab, and a few firms own whole categories.',
    build: 'Metrology, AI process control and specialist machines.' },
  { id: 'parts', name: 'Precision parts',
    sub: 'Valves, pumps and subsystems inside the tools.',
    take: 'Qualifying a new part takes years, so incumbents stick. This is the one-single-screw layer.',
    build: 'Find a part with one dominant supplier and long qualification cycles.' },
  { id: 'materials', name: 'Materials & chemicals',
    sub: 'Wafers, resists, gases, films, glass and masks.',
    take: 'A chip uses hundreds of ultra-pure materials. Several are near-monopolies, mostly Japanese.',
    build: 'Purification, recycling and substitute materials.' },
  { id: 'space', name: 'Space & launch',
    sub: 'Launch, satellites and orbital compute.',
    take: 'Reusable rockets cut launch costs. Satellites now deliver internet, phone service and imagery.',
    build: 'Apps built on cheap launch and imagery are the accessible entry.' },
  { id: 'rocket', name: 'Aerospace suppliers',
    sub: 'Engines, alloys, composites and avionics.',
    take: 'A few primes and specialists supply the industry. Defence demand steadies revenue.',
    build: 'New materials, additive manufacturing and radiation-hardened electronics.' },
  { id: 'raw', name: 'Raw earth',
    sub: 'Quartz, copper, tin, gases, rare earths, water.',
    take: 'Everything rests on a few mines and countries. Supply shocks reach your phone.',
    build: 'Recycling, substitutes and processing outside China.' }
];

const ZONES = [
  { id: 'demand', name: 'Demand', sub: 'What people spend, consume and earn. The money at the top that pays for everything below.', from: 'you', to: 'edu', h: 22 },
  { id: 'ai', name: 'AI products & capital', sub: 'The devices, AI labs, clouds and money that deliver AI.', from: 'devices', to: 'capital', h: 214 },
  { id: 'phys', name: 'Physical buildout', sub: 'Buildings, power and food: the real-world base AI sits on.', from: 'dc', to: 'agri', h: 150 },
  { id: 'chips', name: 'Chip supply chain', sub: 'From servers down to wafers and chemicals.', from: 'systems', to: 'materials', h: 268 },
  { id: 'edge', name: 'Frontier & Earth', sub: 'Space, aerospace and raw materials.', from: 'space', to: 'raw', h: 190 }
];

// compact constructor
const N = (id, l, n, o) => Object.assign({ id, l, n, up: [] }, o);

let NODES = [

/* ---------------- 1 · APPS ---------------- */
N('spotify', 1, 'Spotify', { d: 'spotify.com', q: 'SPOT', w: 'Music and podcast streaming at the scale of hundreds of millions of monthly users, with AI-driven playlists and DJ features.', y: 'A clean example of AI as a feature: Spotify rents compute rather than building chips.', p: 'Reached sustained profitability from 2024 after years of losses. The story now is pricing power, ads and personalisation.', o: 'Product, data and ML roles. For founders, AI music and audio tools sit on top of platforms like this.', up: ['gcloud', 'recsys'] }),
N('netflix', 1, 'Netflix', { d: 'netflix.com', q: 'NFLX', w: 'Streaming video with ML-based recommendations and encoding; runs mostly on AWS.', y: 'Heavy but steady compute for personalisation, encoding and delivery.', p: 'Ad tier and password-sharing crackdown drove growth in 2023-25.', up: ['aws', 'recsys'] }),
N('meta', 1, 'Meta', { d: 'meta.com', q: 'META', w: 'Facebook, Instagram, WhatsApp, with AI-ranked feeds and ads, plus smart glasses.', y: 'Nearly all revenue is advertising, so AI ranking is the business. It is among the biggest AI capex spenders, and ad revenue pays for it.', p: 'Ad growth has been strong, but investors scrutinise the steep rise in AI infrastructure spending.', up: ['meta_ai', 'meta_infra', 'recsys'] }),
N('google', 1, 'Google / Alphabet', { d: 'google.com', q: 'GOOGL', w: 'Search, YouTube, Android, Gemini app, AI Overviews and Workspace.', y: 'The only giant that owns every layer: apps, models, cloud, chips (TPU) and even robotaxis.', p: 'Search has held up better than feared; Cloud and Gemini momentum improved through 2025.', up: ['deepmind', 'gcloud', 'google_tpu'] }),
N('microsoft', 1, 'Microsoft', { d: 'microsoft.com', q: 'MSFT', w: 'Windows, Microsoft 365 with Copilot, GitHub, LinkedIn, Xbox.', y: 'Sells AI through the software enterprises already pay for. Holds a large stake in OpenAI after the 2025 restructuring.', p: 'Azure growth powered by AI demand. Capacity, not demand, has been the limit.', up: ['azure', 'openai', 'nvidia'] }),
N('amazon', 1, 'Amazon', { d: 'amazon.com', q: 'AMZN', w: 'Retail marketplace, logistics, Prime Video, Alexa+. AWS is a separate node below.', y: 'Uses AI everywhere in logistics and recommendations, and sells AI via AWS.', p: 'Retail margins and AWS growth both matter to the story.', up: ['aws', 'anthropic', 'visa', 'mastercard', 'recsys'] }),
N('visa', 1, 'Visa', { d: 'visa.com', q: 'V', w: 'Global card payments network with AI-based fraud scoring.', up: ['recsys'], y: 'AI is invisible at checkout. The network earns a small toll on commerce.', p: 'Steady compounding from volume growth and cross-border payments. Agentic commerce is the new bet.', o: 'Payments plus AI agents ("agentic commerce") is an open startup area.' }),
N('mastercard', 1, 'Mastercard', { d: 'mastercard.com', q: 'MA', w: 'Global card network with AI fraud and identity products.', up: ['recsys'], y: 'Same toll-road model as Visa.', p: 'Consistent growth; both networks face regulatory pressure on fees.' }),
N('robinhood', 1, 'Robinhood', { d: 'robinhood.com', q: 'HOOD', w: 'Retail brokerage, crypto and prediction markets, with an AI assistant.', y: 'Shows how AI is being embedded in consumer finance.', p: 'Joined the S&P 500 in 2025 after a big rally. High growth, high volatility.', up: ['aws'] }),
N('adobe', 1, 'Adobe', { d: 'adobe.com', q: 'ADBE', w: 'Creative Cloud, Firefly image/video models, Acrobat AI.', y: 'Test case for whether generative AI strengthens or erodes software moats.', p: 'Solid cash flow; valuation reflects debate over AI disruption.', up: ['aws', 'azure'] }),
N('bytedance', 1, 'ByteDance (TikTok)', { d: 'bytedance.com', s: 'Private', w: 'TikTok, Douyin, CapCut and the Doubao AI assistant.', y: 'Arguably the best recommendation engine in the world, and a large buyer of AI compute.', p: 'One of the most valuable private companies. TikTok US operations were reportedly restructured into a US-led joint venture.', up: ['oracle', 'nvidia', 'recsys'] }),
N('waymo', 1, 'Waymo', { d: 'waymo.com', s: 'Alphabet subsidiary', w: 'Fully driverless ride-hailing in multiple US cities.', y: 'Real-world AI at scale: lidar, cameras and models making life-or-death decisions.', p: 'Paid rides have been growing rapidly, with hundreds of thousands per week reported.', up: ['gcloud', 'google_tpu'] }),
N('palantir', 1, 'Palantir', { d: 'palantir.com', q: 'PLTR', w: 'Foundry, AIP and Gotham: operational AI platforms for governments and enterprises.', y: 'Sells the layer that connects company data to models.', p: 'Revenue growth accelerated with AIP. Valuation multiples are extremely high, so expectations are too.', up: ['aws', 'azure', 'nvidia'] }),
N('cursor', 1, 'Cursor (Anysphere)', { d: 'cursor.com', s: 'Private', w: 'AI-native code editor used by millions of developers.', y: 'Poster child for the AI-native app. Its biggest cost is paying model labs.', p: 'Among the fastest-growing software start-ups ever. Reported valuation near $30B in late 2025.', o: 'Shows how a small team can hit scale quickly. Margin risk comes from model API costs.', up: ['anthropic', 'openai'] }),
N('perplexity', 1, 'Perplexity', { d: 'perplexity.ai', s: 'Private', w: 'AI answer engine that cites its sources.', y: 'Challenges search by answering instead of listing links.', p: 'Rapid growth and a high private valuation; faces publisher disputes.', up: ['openai', 'anthropic', 'aws'] }),

/* ---------------- 2 · DEVICES ---------------- */
N('apple', 2, 'Apple', { d: 'apple.com', q: 'AAPL', w: 'iPhone, Mac, iPad, Watch, Vision Pro and Services; designs its own chips.', y: 'Controls the glass between billions of people and AI. Its chips are made by TSMC.', p: 'iPhone and Services are resilient. Its AI strategy leans on partnerships, reportedly including Google Gemini for Siri.', o: 'Services and wearables are where AI is most visible. Supply-chain and silicon roles are highly sought after.', up: ['apple_si', 'foxconn', 'corning', 'broadcom', 'globalstar', 'mp_materials'] }),
N('samsung', 2, 'Samsung Electronics', { d: 'samsung.com', q: '005930.KS', w: 'Galaxy phones, TVs, appliances and SmartThings; also memory and foundry (separate nodes).', y: 'The only company present in devices, memory and foundry.', p: 'Phones are steady; memory profits swung sharply with the HBM and DRAM cycle.', up: ['qualcomm', 'samsung_mem', 'samsung_foundry'] }),
N('tesla', 2, 'Tesla', { d: 'tesla.com', q: 'TSLA', w: 'EVs with driver-assist, Optimus robot and Megapack batteries; trains on large GPU clusters.', y: 'A bet that autonomy and robots are worth more than cars.', p: 'Valuation rests on autonomy and robotics more than vehicle sales, which face margin pressure.', up: ['nvidia', 'tsmc', 'samsung_foundry'] }),
N('nest', 2, 'Google Pixel & Nest', { d: 'store.google.com', s: 'Alphabet', w: 'Pixel phones, Nest thermostats, cameras and speakers, now with Gemini.', y: 'Google\'s own hardware shows what Gemini can do on-device.', up: ['tsmc', 'deepmind'] }),
N('amazon_devices', 2, 'Amazon Devices', { d: 'amazon.com', s: 'Amazon', w: 'Echo, Ring, Kindle and Fire TV with Alexa+.', y: 'Hundreds of millions of voice endpoints. Alexa+ uses large models, including Anthropic\'s Claude.', up: ['mediatek', 'aws', 'anthropic'] }),
N('sonos', 2, 'Sonos', { d: 'sonos.com', q: 'SONO', w: 'Wi-Fi speakers and soundbars.', y: 'Premium audio brand that has to run a software platform on thin margins.', up: ['qualcomm'] }),
N('signify', 2, 'Signify (Philips Hue)', { d: 'signify.com', q: 'LIGHT.AS', w: 'Smart lighting (Philips Hue).', y: 'Home lighting is a classic IoT entry point, with Matter as the new standard.' }),
N('ikea', 2, 'IKEA', { d: 'ikea.com', s: 'Private (Inter IKEA)', w: 'Furniture plus a Matter-compatible smart-home line: lamps, blinds, sensors, air purifiers.', y: 'Shows the world\'s furniture makers turning into connected-hardware companies.', o: 'Furniture plus sensors plus an AI layer is open ground for design-led startups.' }),
N('eightsleep', 2, 'Eight Sleep', { d: 'eightsleep.com', s: 'Private', w: 'Pod smart mattress cover with temperature control and sleep tracking.', y: 'A start-up example of AI plus furniture: a bed that tunes itself.', p: 'Raised growth capital in 2025 to build an AI sleep coach.', o: 'Direct example of a small hardware-plus-AI business.' }),
N('lg', 2, 'LG Electronics', { d: 'lg.com', q: '066570.KS', w: 'ThinQ AI appliances, OLED TVs, webOS.', y: 'Appliances are becoming connected computers.', up: ['mediatek', 'qualcomm'] }),
N('sony', 2, 'Sony', { d: 'sony.com', q: 'SONY', w: 'PlayStation 5, camera sensors, music, film.', y: 'Image sensors in most flagship phones, plus a big gaming business built on AMD chips.', up: ['amd', 'tsmc'] }),
N('nintendo', 2, 'Nintendo', { d: 'nintendo.com', q: '7974.T', w: 'Switch 2, launched June 2025, built on a custom NVIDIA chip.', y: 'Even games consoles now depend on AI-era chip supply chains.', up: ['nvidia', 'samsung_foundry'] }),
N('oura', 2, 'Oura', { d: 'ouraring.com', s: 'Private', w: 'Smart ring tracking sleep, heart rate and readiness.', y: 'Proof that tiny sensors plus AI can build a premium consumer brand.' }),
N('essilor', 2, 'EssilorLuxottica', { d: 'essilorluxottica.com', q: 'EL.PA', w: 'Ray-Ban and Oakley brands, including Meta smart glasses.', y: 'Smart glasses are a likely next computing device.', up: ['meta_ai', 'qualcomm'] }),
N('xiaomi', 2, 'Xiaomi', { d: 'mi.com', q: '1810.HK', w: 'Phones, EVs and a huge IoT ecosystem; started designing its own chips in 2025.', y: 'Shows how fast a hardware ecosystem can expand into EVs and chips.', up: ['qualcomm', 'tsmc'] }),

/* ---------------- 3 · LABS ---------------- */
N('openai', 3, 'OpenAI', { d: 'openai.com', s: 'Private', w: 'ChatGPT, GPT models, Sora, Codex; sponsor of the Stargate programme.', y: 'Largest consumer AI app. Has committed to well over $1 trillion of multi-year compute from Microsoft, Oracle, CoreWeave, NVIDIA, AMD, Broadcom and AWS (reported).', p: 'Private valuations in the hundreds of billions, funded by large rounds. Revenue is growing very fast, and so are losses.', o: 'Access as an investor is mostly via partners (Microsoft, SoftBank, AMD, Oracle). As a builder, think about tools around the API.', up: ['azure', 'oracle', 'coreweave', 'stargate', 'nvidia', 'amd', 'broadcom', 'aws', 'scale_ai', 'mercor', 'surge_ai', 'softbank', 'vc'] }),
N('anthropic', 3, 'Anthropic', { d: 'anthropic.com', s: 'Private', w: 'Claude models and Claude Code; safety-focused AI lab.', y: 'Multi-cloud, multi-chip by design: Google TPUs, AWS Trainium and NVIDIA GPUs.', p: 'Revenue run-rate grew very quickly through 2025, with large funding from Amazon, Google, Microsoft/NVIDIA and others.', o: 'Private. Exposure is indirect via Amazon and Alphabet. Strong demand for engineers, researchers and applied/enterprise roles.', up: ['aws', 'aws_trainium', 'gcloud', 'google_tpu', 'azure', 'nvidia', 'surge_ai', 'vc'] }),
N('deepmind', 3, 'Google DeepMind', { d: 'deepmind.google', s: 'Alphabet', w: 'Gemini models, Veo video, AlphaFold; Alphabet\'s research and model arm.', y: 'The lab with its own chips and cloud, so it controls cost directly.', up: ['gcloud', 'google_tpu'] }),
N('meta_ai', 3, 'Meta AI (Llama)', { d: 'ai.meta.com', s: 'Meta', w: 'Llama open-weight models and Meta Superintelligence Labs.', y: 'Big open-weight bet, financed by the ad business.', up: ['meta_infra', 'nvidia', 'scale_ai'] }),
N('xai', 3, 'xAI', { d: 'x.ai', s: 'Private', w: 'Grok models and the Colossus supercomputer in Memphis.', y: 'Showed how fast a giant GPU cluster can be stood up, and that on-site power is the real bottleneck. Reportedly combined with SpaceX in 2026; verify the current structure.', up: ['nvidia', 'supermicro', 'dell', 'tesla_energy', 'apollo'] }),
N('mistral', 3, 'Mistral AI', { d: 'mistral.ai', s: 'Private (France)', w: 'Open-weight and commercial models; Le Chat assistant.', y: 'Europe\'s leading lab. ASML led its 2025 funding round.', up: ['nvidia'] }),
N('deepseek', 3, 'DeepSeek', { d: 'deepseek.com', s: 'Private (China)', w: 'Efficient open-weight reasoning models.', y: 'January 2025 showed that clever training can cut compute needs, and briefly rattled chip stocks.', up: ['nvidia', 'huawei'] }),
N('alibaba', 3, 'Alibaba (Qwen)', { d: 'alibabagroup.com', q: 'BABA', w: 'Qwen open models and Alibaba Cloud.', y: 'Leading open-model family and China\'s largest cloud.', up: ['nvidia'] }),
N('huggingface', 3, 'Hugging Face', { d: 'huggingface.co', s: 'Private', w: 'The hub where open models and datasets are shared.', y: 'The GitHub of AI; much of the open ecosystem passes through it.', up: ['aws'] }),
N('scale_ai', 3, 'Scale AI', { d: 'scale.com', s: 'Private (Meta owns ~49%)', w: 'Data labelling, evaluation and reinforcement-learning data for labs.', y: 'Human expertise is a quiet cost of every model. Meta\'s 2025 investment reshaped the sector.', o: 'Expert data and evaluation is a real services and startup niche.' }),

/* ---------------- 4 · CLOUD ---------------- */
N('aws', 4, 'AWS', { d: 'aws.amazon.com', q: 'AMZN', s: 'Amazon', w: 'Largest cloud; custom Trainium chips; Bedrock; Project Rainier cluster for Anthropic.', y: 'Hosts a huge slice of the internet and is building its own AI chips to cut dependence on NVIDIA.', p: 'Growth re-accelerated on AI demand. Large backlog, with power and chips as limits.', up: ['aws_trainium', 'nvidia', 'vertiv', 'talen', 'dominion', 'arista', 'digital_realty'] }),
N('azure', 4, 'Microsoft Azure', { d: 'azure.microsoft.com', q: 'MSFT', s: 'Microsoft', w: 'Cloud hosting OpenAI, with large NVIDIA and AMD fleets; own Maia chips.', y: 'Signed a nuclear power deal to restart a reactor at Three Mile Island (Crane Clean Energy Center).', p: 'Growth driven by AI. Management has repeatedly said it is capacity-constrained.', up: ['nvidia', 'amd', 'vertiv', 'constellation', 'digital_realty', 'qts'] }),
N('gcloud', 4, 'Google Cloud', { d: 'cloud.google.com', q: 'GOOGL', s: 'Alphabet', w: 'Cloud with Gemini, TPUs and NVIDIA GPUs.', y: 'Sells TPU capacity to outside labs, including Anthropic.', p: 'One of the faster-growing hyperscalers with a rising backlog.', up: ['google_tpu', 'nvidia', 'vertiv', 'nextera', 'equinix', 'suncatcher'] }),
N('oracle', 4, 'Oracle Cloud', { d: 'oracle.com', q: 'ORCL', w: 'OCI cloud, with giant multi-year contracts for OpenAI and others.', y: 'Pivoted from databases to AI infrastructure. Debt-funded buildout is under scrutiny.', p: 'Contracted backlog exploded in 2025, so concerns shifted to financing and concentration.', up: ['nvidia', 'amd', 'dell', 'vertiv', 'crusoe'] }),
N('coreweave', 4, 'CoreWeave', { d: 'coreweave.com', q: 'CRWV', w: 'GPU-specialist "neocloud" that went public in March 2025.', y: 'Rents NVIDIA GPUs at scale to Microsoft, OpenAI, Meta. Heavy debt and customer concentration.', p: 'Revenue surged; stock very volatile.', up: ['nvidia', 'dell', 'supermicro', 'vertiv', 'digital_realty', 'blackstone'] }),
N('nebius', 4, 'Nebius', { d: 'nebius.com', q: 'NBIS', w: 'AI neocloud (ex-Yandex NV) with deals with Microsoft and Meta.', y: 'Another example of the GPU-rental model.', up: ['nvidia', 'vertiv'] }),
N('crusoe', 4, 'Crusoe', { d: 'crusoe.ai', s: 'Private', w: 'AI data centres built close to energy; builder of the Abilene Stargate campus.', y: 'Started by using stranded gas for compute, and now partners to put cloud capacity in orbit.', up: ['nvidia', 'ge_vernova', 'vertiv', 'starcloud'] }),
N('meta_infra', 4, 'Meta data-centre fleet', { d: 'meta.com', s: 'Meta', w: 'Meta\'s own hyperscale campuses and in-house MTIA chips.', y: 'Building multi-gigawatt campuses, financed in part by private-credit partners.', up: ['nvidia', 'amd', 'broadcom', 'vertiv', 'williams', 'vistra', 'oklo', 'blue_owl'] }),
N('stargate', 4, 'Stargate', { d: 'openai.com', s: 'OpenAI / Oracle / SoftBank programme', w: 'A $500B US AI infrastructure programme announced January 2025, with Abilene, Texas as the flagship.', y: 'The headline example of AI buildout as national infrastructure.', up: ['crusoe', 'oracle', 'nvidia', 'vertiv', 'softbank', 'mgx'] }),

/* ---------------- 5 · CAPITAL ---------------- */
N('softbank', 5, 'SoftBank', { d: 'softbank.jp', q: '9984.T', w: 'Japanese investor behind a large stake in OpenAI and a partner in Stargate.', y: 'Went all-in on AI, selling other assets to fund it.', p: 'Stock tracks OpenAI sentiment closely.' }),
N('blackstone', 5, 'Blackstone', { d: 'blackstone.com', q: 'BX', w: 'Asset manager that owns data-centre operators (QTS, AirTrunk) and lends to GPU clouds.', y: 'Turns pensions and insurers\' money into data-centre capacity.', up: ['qts'] }),
N('brookfield', 5, 'Brookfield', { d: 'brookfield.com', q: 'BN', w: 'Infrastructure investor in power, data centres and an AI infrastructure fund.', y: 'Connects energy and compute: for example, financing for Bloom Energy fuel cells.', up: ['bloom'] }),
N('mgx', 5, 'MGX (Abu Dhabi)', { d: 'mgx.ae', s: 'Sovereign-backed investor', w: 'AI investor from the UAE, partner in Stargate and in OpenAI.', y: 'Gulf sovereign money is a significant new source of AI capital.' }),
N('blackrock', 5, 'BlackRock', { d: 'blackrock.com', q: 'BLK', w: 'World\'s largest asset manager and an organiser of AI infrastructure partnerships.', y: 'Both the index funds in your 401(k) and an investor in physical AI assets.' }),
N('apollo', 5, 'Apollo', { d: 'apollo.com', q: 'APO', w: 'Private-credit giant that finances GPU purchases and data centres.', y: 'Lends against GPUs and leases, which carries different risks than equity.', up: [] }),
N('blue_owl', 5, 'Blue Owl', { d: 'blueowl.com', q: 'OWL', w: 'Alternative asset manager that co-financed Meta\'s Hyperion campus.', y: 'A key vehicle for off-balance-sheet data-centre financing.' }),
N('vc', 5, 'Venture capital (a16z, Sequoia, Thrive...)', { d: 'a16z.com', s: 'Private funds', w: 'Funds that back AI labs and app start-ups.', y: 'Early backers set valuations for the whole sector.', o: 'The most direct path for founders: raise from funds that have already backed the layer you want to build in.' }),

/* ---------------- 6 · DATA CENTRES ---------------- */
N('equinix', 6, 'Equinix', { d: 'equinix.com', q: 'EQIX', w: 'Largest colocation and interconnection data-centre company.', y: 'Neutral meeting point where networks, clouds and enterprises connect.', p: 'Steady growth, with AI-ready capacity expanding.', up: ['vertiv', 'schneider', 'eaton', 'dominion'] }),
N('digital_realty', 6, 'Digital Realty', { d: 'digitalrealty.com', q: 'DLR', w: 'Data-centre REIT leasing wholesale capacity to hyperscalers.', y: 'Landlord to the cloud.', up: ['vertiv', 'schneider', 'eaton', 'abb', 'caterpillar', 'trane', 'jci', 'dominion'] }),
N('qts', 6, 'QTS', { d: 'qtsdatacenters.com', s: 'Blackstone', w: 'Hyperscale data-centre developer owned by Blackstone.', y: 'Example of pension and insurance money financing campuses.', up: ['vertiv', 'schneider', 'eaton', 'cummins', 'dominion'] }),
N('vantage', 6, 'Vantage Data Centers', { d: 'vantage-dc.com', s: 'Private (DigitalBridge, Silver Lake)', w: 'Hyperscale campus developer, including the large Frontier campus in Texas.', y: 'Builds gigawatt-scale campuses for hyperscalers.', up: ['vertiv', 'schneider', 'eaton', 'caterpillar', 'modine', 'dominion'] }),
N('vertiv', 6, 'Vertiv', { d: 'vertiv.com', q: 'VRT', w: 'Cooling, power distribution and rack infrastructure for data centres.', y: 'Liquid cooling is now essential: dense AI racks are too hot for air.', p: 'Orders and backlog grew strongly with AI.', o: 'Public-company exposure to cooling and power. Careers in mechanical, electrical and controls engineering.', up: ['freeport'] }),
N('schneider', 6, 'Schneider Electric', { d: 'se.com', q: 'SU.PA', w: 'Power distribution, UPS, cooling and building management software.', y: 'Electrical backbone of many data centres.', up: ['freeport'] }),
N('eaton', 6, 'Eaton', { d: 'eaton.com', q: 'ETN', w: 'Switchgear, UPS, power distribution.', y: 'Makes the equipment that safely delivers high power to racks.', up: ['freeport'] }),
N('abb', 6, 'ABB', { d: 'abb.com', q: 'ABBN.SW', w: 'Electrification, motors, drives, grid automation.', y: 'Supplies power distribution to data centres and utilities.', up: ['freeport'] }),
N('trane', 6, 'Trane Technologies', { d: 'trane.com', q: 'TT', w: 'Chillers and large HVAC systems.', y: 'Cooling is a significant fraction of data-centre energy.' }),
N('jci', 6, 'Johnson Controls', { d: 'johnsoncontrols.com', q: 'JCI', w: 'Chillers, building controls and fire safety.', y: 'Another major cooling vendor.' }),
N('modine', 6, 'Modine', { d: 'modine.com', q: 'MOD', w: 'Thermal management: data-centre cooling products.', y: 'A smaller, fast-growing cooling specialist.' }),
N('caterpillar', 6, 'Caterpillar', { d: 'cat.com', q: 'CAT', w: 'Backup generators and gas turbines (Solar Turbines).', y: 'Backup and on-site power are now standard in AI campuses.' }),
N('cummins', 6, 'Cummins', { d: 'cummins.com', q: 'CMI', w: 'Diesel and gas generator sets used for data-centre backup.', y: 'Large orders for data-centre backup power.' }),

/* ---------------- 7 · ENERGY ---------------- */
N('constellation', 7, 'Constellation Energy', { d: 'constellationenergy.com', q: 'CEG', w: 'Largest US nuclear fleet; restarting Three Mile Island Unit 1 for Microsoft.', y: 'Nuclear is back as data-centre power.', p: 'Stock re-rated on AI power demand.', up: ['cameco'] }),
N('vistra', 7, 'Vistra', { d: 'vistracorp.com', q: 'VST', w: 'Large US power producer: gas, nuclear and solar.', y: 'Independent producer positioned for data-centre contracts.', up: ['ge_vernova', 'williams'] }),
N('nextera', 7, 'NextEra Energy', { d: 'nexteraenergy.com', q: 'NEE', w: 'Largest US renewables developer; agreed with Google to restart Duane Arnold nuclear plant.', y: 'Bridges wind, solar and nuclear to AI demand.', up: ['first_solar', 'ge_vernova'] }),
N('talen', 7, 'Talen Energy', { d: 'talenenergy.com', q: 'TLN', w: 'Owns the Susquehanna nuclear plant, supplying Amazon.', y: 'Early example of a hyperscaler buying power directly from a plant.' }),
N('dominion', 7, 'Dominion Energy', { d: 'dominionenergy.com', q: 'D', w: 'Utility serving Northern Virginia, the world\'s biggest data-centre market.', y: 'A utility where data-centre load is straining the grid.', up: ['ge_vernova', 'hitachi_energy', 'quanta'] }),
N('oklo', 7, 'Oklo', { d: 'oklo.com', q: 'OKLO', w: 'Developer of small advanced nuclear reactors.', y: 'A pre-revenue bet on small modular reactors for data centres.', p: 'Speculative and very volatile. No commercial reactor yet.', o: 'High-risk. SMRs need regulatory approvals and years of delivery.' }),
N('cameco', 7, 'Cameco', { d: 'cameco.com', q: 'CCJ', w: 'Major uranium producer and part-owner of Westinghouse.', y: 'Uranium demand rises with new nuclear.' }),
N('ge_vernova', 7, 'GE Vernova', { d: 'gevernova.com', q: 'GEV', w: 'Gas turbines, wind, grid equipment.', y: 'Gas turbines are sold out for years, so a turbine slot is worth a lot.', p: 'Backlog and pricing have risen strongly.', up: ['freeport'], c: 1 }),
N('siemens_energy', 7, 'Siemens Energy', { d: 'siemens-energy.com', q: 'ENR.DE', w: 'Gas turbines, grid technology and transformers.', y: 'Third major turbine maker alongside GE Vernova and Mitsubishi.', up: ['freeport'] }),
N('bloom', 7, 'Bloom Energy', { d: 'bloomenergy.com', q: 'BE', w: 'Solid-oxide fuel cells that give on-site power.', y: 'Offers faster on-site power than waiting for the grid.', p: 'Orders jumped with data-centre demand; stock very volatile.' }),
N('first_solar', 7, 'First Solar', { d: 'firstsolar.com', q: 'FSLR', w: 'US thin-film solar panel maker.', y: 'Solar is the fastest power to deploy at scale.' }),
N('tesla_energy', 7, 'Tesla Energy (Megapack)', { d: 'tesla.com', q: 'TSLA', s: 'Tesla', w: 'Grid-scale batteries; supplied power buffering for xAI\'s Colossus.', y: 'Batteries smooth AI\'s spiky power draw.' }),
N('hitachi_energy', 7, 'Hitachi Energy', { d: 'hitachienergy.com', q: '6501.T', s: 'Hitachi', w: 'Large power transformers and HVDC equipment.', y: 'Large transformers have waits of years, making them a hidden bottleneck.', up: ['freeport'], c: 1 }),
N('quanta', 7, 'Quanta Services', { d: 'quantaservices.com', q: 'PWR', w: 'Builds power lines, substations and grid connections.', y: 'Labour for grid construction is scarce.', o: 'Skilled-trades career with strong demand.' }),
N('williams', 7, 'Williams', { d: 'williams.com', q: 'WMB', w: 'Natural-gas pipelines, now building on-site power for data centres.', y: 'Gas is the fastest firm power to bring online today.' }),

/* ---------------- 8 · SYSTEMS ---------------- */
N('foxconn', 8, 'Foxconn (Hon Hai)', { d: 'foxconn.com', q: '2317.TW', w: 'World\'s largest electronics manufacturer: iPhones and NVIDIA AI servers.', y: 'AI server racks are now a major growth driver.', up: ['nvidia', 'amd', 'amphenol'] }),
N('quanta_computer', 8, 'Quanta Computer', { d: 'quantatw.com', q: '2382.TW', w: 'Server maker for the big hyperscalers.', y: 'Behind-the-scenes builder of cloud racks.', up: ['nvidia', 'amd', 'broadcom', 'amphenol'] }),
N('wiwynn', 8, 'Wiwynn', { d: 'wiwynn.com', q: '6669.TW', w: 'Server maker for Microsoft, Meta and others.', y: 'Rapid growth from AI rack demand.', up: ['nvidia', 'amd', 'amphenol'] }),
N('supermicro', 8, 'Super Micro', { d: 'supermicro.com', q: 'SMCI', w: 'Rack-scale AI servers, many with liquid cooling.', y: 'Quick to ship the newest NVIDIA systems.', p: 'High growth with accounting and margin scrutiny.', up: ['nvidia', 'amd', 'amphenol'] }),
N('dell', 8, 'Dell Technologies', { d: 'dell.com', q: 'DELL', w: 'AI-optimised servers; large backlog for xAI, CoreWeave and enterprises.', y: 'Brings AI hardware to enterprise customers.', up: ['nvidia', 'amd', 'intel'] }),
N('hpe', 8, 'Hewlett Packard Enterprise', { d: 'hpe.com', q: 'HPE', w: 'Servers, Cray supercomputers and Juniper networking (acquired 2025).', y: 'Supercomputers and networking for AI clusters.', up: ['nvidia', 'amd', 'broadcom'] }),
N('celestica', 8, 'Celestica', { d: 'celestica.com', q: 'CLS', w: 'Network switches and AI hardware platforms for hyperscalers.', y: 'Rising star in hyperscale hardware.', up: ['broadcom', 'marvell'] }),
N('arista', 8, 'Arista Networks', { d: 'arista.com', q: 'ANET', w: 'Ethernet switches for AI clusters at Meta and Microsoft.', y: 'Cluster performance depends on the network.', up: ['broadcom', 'coherent', 'lumentum', 'innolight'] }),
N('cisco', 8, 'Cisco', { d: 'cisco.com', q: 'CSCO', w: 'Networking, security and Silicon One chips.', y: 'Incumbent now winning hyperscale AI networking orders.', up: ['coherent', 'innolight'] }),
N('coherent', 8, 'Coherent', { d: 'coherent.com', q: 'COHR', w: 'Optical transceivers, lasers and materials.', y: 'Optical links carry data between GPUs.' }),
N('lumentum', 8, 'Lumentum', { d: 'lumentum.com', q: 'LITE', w: 'Lasers used in optical transceivers.', y: 'Laser chips are a key part of optical interconnect.' }),
N('innolight', 8, 'Innolight', { d: 'innolight.com', q: '300308.SZ', w: 'One of the largest makers of 800G and 1.6T optical modules.', y: 'Major NVIDIA optical supplier.' }),
N('corning', 8, 'Corning', { d: 'corning.com', q: 'GLW', w: 'Optical fibre, Gorilla Glass and specialty glass.', y: 'Fibre inside data centres and the glass on your phone.', up: ['china_gallium'] }),
N('credo', 8, 'Credo', { d: 'credosemi.com', q: 'CRDO', w: 'Active electrical cables and retimers for AI racks.', y: 'Short-reach copper links inside racks.', up: ['tsmc'] }),
N('amphenol', 8, 'Amphenol', { d: 'amphenol.com', q: 'APH', w: 'Connectors and high-speed cables.', y: 'Every rack is full of them.', up: ['freeport'] }),

/* ---------------- 9 · CHIPS ---------------- */
N('nvidia', 9, 'NVIDIA', { d: 'nvidia.com', q: 'NVDA', w: 'GPUs (Hopper, Blackwell, Rubin), NVLink networking and the CUDA software platform.', y: 'The dominant supplier of AI training chips, and CUDA is a deep moat. It also invests in its own customers, which some call circular financing.', p: 'Revenue grew from about $27B (fiscal 2023) to about $130B (fiscal 2025), and it briefly became the first $5T company in October 2025.', o: 'Public. A huge employer of engineers; its CUDA ecosystem is a skill in itself.', up: ['tsmc', 'sk_hynix', 'micron', 'samsung_mem', 'ase', 'amkor', 'synopsys', 'cadence', 'arm'], c: 1 }),
N('amd', 9, 'AMD', { d: 'amd.com', q: 'AMD', w: 'Instinct AI GPUs and EPYC server CPUs.', y: 'The main merchant GPU alternative. A 2025 OpenAI deal gave a large customer.', p: 'Data-centre AI revenue ramping from a smaller base.', up: ['tsmc', 'sk_hynix', 'samsung_mem', 'micron', 'ase', 'amkor', 'synopsys', 'cadence'] }),
N('broadcom', 9, 'Broadcom', { d: 'broadcom.com', q: 'AVGO', w: 'Custom AI chips (XPUs) for Google, Meta, ByteDance and OpenAI, plus Ethernet switching.', y: 'The quiet beneficiary of hyperscalers designing their own chips.', p: 'AI revenue growing very fast. Big customer concentration.', up: ['tsmc', 'sk_hynix', 'samsung_mem', 'micron', 'ase', 'synopsys', 'cadence'] }),
N('marvell', 9, 'Marvell', { d: 'marvell.com', q: 'MRVL', w: 'Custom silicon for AWS and Microsoft, plus optical DSPs.', y: 'Designs part of the custom-chip stack.', up: ['tsmc', 'synopsys', 'cadence', 'arm'] }),
N('google_tpu', 9, 'Google TPU', { d: 'cloud.google.com', s: 'Alphabet', w: 'Google\'s in-house Tensor Processing Units; latest generation is Ironwood.', y: 'Credible NVIDIA alternative. Anthropic announced plans for up to a million TPUs in 2025.', up: ['broadcom', 'tsmc', 'sk_hynix', 'samsung_mem'] }),
N('aws_trainium', 9, 'AWS Trainium', { d: 'aws.amazon.com', s: 'Amazon', w: 'Amazon\'s custom AI training chips, built by its Annapurna Labs.', y: 'Amazon\'s hedge against GPU scarcity and cost.', up: ['marvell', 'tsmc', 'sk_hynix'] }),
N('apple_si', 9, 'Apple Silicon', { d: 'apple.com', s: 'Apple', w: 'A-series and M-series chips for iPhone, Mac and iPad.', y: 'Apple\'s edge in power efficiency; all made at TSMC.', up: ['tsmc', 'arm', 'synopsys', 'cadence', 'samsung_mem', 'micron'] }),
N('qualcomm', 9, 'Qualcomm', { d: 'qualcomm.com', q: 'QCOM', w: 'Snapdragon for phones, PCs, cars and IoT; announced data-centre AI chips in 2025.', y: 'Dominant in Android and cars. Pushing into the data centre.', up: ['tsmc', 'samsung_foundry', 'arm', 'synopsys', 'cadence'] }),
N('mediatek', 9, 'MediaTek', { d: 'mediatek.com', q: '2454.TW', w: 'Chips for phones, TVs and smart devices; reported TPU design partner.', y: 'Supplier for large volumes of IoT devices.', up: ['tsmc', 'arm', 'synopsys', 'cadence'] }),
N('arm', 9, 'Arm', { d: 'arm.com', q: 'ARM', w: 'CPU architecture licensed in almost every phone and many servers.', y: 'Royalty on nearly every chip shipped; also the basis for NVIDIA Grace and AWS Graviton.', c: 1 }),
N('intel', 9, 'Intel', { d: 'intel.com', q: 'INTC', w: 'x86 CPUs and a foundry arm; US government took a stake in 2025 and NVIDIA invested.', y: 'The only US company that both designs and makes leading chips, in a long turnaround.', p: 'Turnaround story propped up by government and strategic investors.', up: ['intel_foundry', 'tsmc', 'synopsys', 'cadence'] }),
N('cerebras', 9, 'Cerebras', { d: 'cerebras.ai', s: 'Private (IPO plans)', w: 'Wafer-scale AI chips; reported large OpenAI agreement in 2026.', y: 'Radically different approach: one giant chip per wafer.', up: ['tsmc'] }),
N('huawei', 9, 'Huawei', { d: 'huawei.com', s: 'Private (China)', w: 'Ascend AI chips and Kirin phone chips.', y: 'China\'s leading alternative to NVIDIA under export controls.', up: ['smic'] }),
N('synopsys', 9, 'Synopsys', { d: 'synopsys.com', q: 'SNPS', w: 'Chip-design software (EDA) and IP; acquired Ansys in 2025.', y: 'Every advanced chip is designed with tools from one of two companies.', c: 1 }),
N('cadence', 9, 'Cadence', { d: 'cadence.com', q: 'CDNS', w: 'Chip-design software (EDA) and IP.', y: 'The other half of the EDA duopoly.', c: 1 }),

/* ---------------- 10 · FABS ---------------- */
N('tsmc', 10, 'TSMC', { d: 'tsmc.com', q: 'TSM', w: 'Largest foundry: makes chips for NVIDIA, AMD, Apple, Broadcom and more, plus CoWoS packaging.', y: 'Makes roughly 90% of the world\'s most advanced logic chips. Concentration in Taiwan is the single biggest geopolitical risk in the map.', p: 'Revenue growth has been strong, led by AI accelerators. Building fabs in Arizona and Japan.', o: 'Public (ADR: TSM). Huge engineering employer; leading-edge process roles are among the most sought-after in tech.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'kla', 'advantest', 'teradyne', 'lasertec', 'disco', 'shin_etsu', 'sumco', 'entegris', 'linde', 'air_liquide', 'jsr', 'tok', 'fujifilm', 'dupont', 'merck_kgaa', 'ajinomoto', 'ibiden', 'photronics', 'water', 'neon_helium'], c: 1 }),
N('samsung_foundry', 10, 'Samsung Foundry', { d: 'samsung.com', s: 'Samsung', w: 'Number-two foundry; won a Tesla AI chip contract in 2025.', y: 'The main rival to TSMC at the leading edge.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'shin_etsu', 'entegris', 'jsr', 'tok'] }),
N('intel_foundry', 10, 'Intel Foundry', { d: 'intel.com', s: 'Intel', w: 'Intel\'s contract-manufacturing arm; the 18A process and Arizona Fab 52.', y: 'The best hope for leading-edge capacity in the US.', up: ['asml', 'applied_materials', 'lam', 'kla', 'entegris'] }),
N('globalfoundries', 10, 'GlobalFoundries', { d: 'globalfoundries.com', q: 'GFS', w: 'Mature-node and specialty chips for auto, IoT and RF.', y: 'Makes the unglamorous chips in cars and devices.', up: ['applied_materials', 'lam', 'tokyo_electron', 'entegris'] }),
N('smic', 10, 'SMIC', { d: 'smics.com', q: '0981.HK', w: 'China\'s largest foundry, producing chips for Huawei under export controls.', y: 'Shows what a country can do without access to EUV machines.' }),
N('rapidus', 10, 'Rapidus', { d: 'rapidus.inc', s: 'Private (Japan, state-backed)', w: 'Japan\'s government-backed 2nm start-up.', y: 'A national bet on re-entering leading-edge chipmaking.', up: ['asml'] }),
N('sk_hynix', 10, 'SK hynix', { d: 'skhynix.com', q: '000660.KS', w: 'World leader in HBM, the stacked memory that sits beside every AI GPU.', y: 'HBM is as scarce as the GPU itself. Primary supplier to NVIDIA.', p: 'Record profits on HBM through 2025; overtook Samsung in DRAM revenue.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'advantest', 'disco', 'besi', 'entegris', 'shin_etsu'], c: 1 }),
N('samsung_mem', 10, 'Samsung Memory', { d: 'samsung.com', s: 'Samsung', w: 'DRAM, NAND and HBM; catching up in HBM.', y: 'Largest memory maker overall, trying to regain HBM leadership.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'advantest', 'disco', 'shin_etsu', 'entegris'] }),
N('micron', 10, 'Micron', { d: 'micron.com', q: 'MU', w: 'HBM, DRAM and NAND; the only large US memory maker.', y: 'Ramping HBM and building fabs in Idaho and New York.', p: 'Profits rebounded sharply with the AI memory cycle.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'kla', 'advantest', 'entegris'] }),
N('ase', 10, 'ASE Technology', { d: 'aseglobal.com', q: 'ASX', w: 'World\'s largest outsourced chip packaging and test company.', y: 'Advanced packaging is a bottleneck for AI chips.', up: ['disco', 'besi', 'advantest', 'teradyne', 'ibiden', 'unimicron', 'ajinomoto', 'resonac'] }),
N('amkor', 10, 'Amkor', { d: 'amkor.com', q: 'AMKR', w: 'Chip packaging and test; building a large Arizona facility.', y: 'US-based advanced packaging.', up: ['disco', 'besi', 'advantest', 'teradyne', 'ibiden', 'ajinomoto', 'resonac'] }),

/* ---------------- 11 · EQUIPMENT ---------------- */
N('asml', 11, 'ASML', { d: 'asml.com', q: 'ASML', w: 'The only company that makes EUV lithography machines, each costing hundreds of millions of dollars.', y: 'No EUV machine, no leading-edge chip. A textbook chokepoint.', p: 'Orders track AI-driven fab expansion; European tech\'s largest company by value.', o: 'Public. Famously hard to replicate: it integrates parts from thousands of suppliers.', up: ['zeiss', 'trumpf', 'vat', 'edwards', 'mks', 'tin_tungsten'], c: 1 }),
N('applied_materials', 11, 'Applied Materials', { d: 'appliedmaterials.com', q: 'AMAT', w: 'Deposition, etch, implant and inspection tools; the biggest by revenue.', y: 'Sells to every fab and every node.', up: ['mks', 'advanced_energy', 'ichor', 'ucts', 'vat', 'edwards', 'coorstek', 'ferrotec'] }),
N('lam', 11, 'Lam Research', { d: 'lamresearch.com', q: 'LRCX', w: 'Etch and deposition tools, central to memory and 3D structures.', y: 'Critical for NAND and HBM.', up: ['mks', 'advanced_energy', 'ichor', 'ucts', 'vat', 'edwards', 'coorstek', 'ferrotec'] }),
N('tokyo_electron', 11, 'Tokyo Electron', { d: 'tel.com', q: '8035.T', w: 'Coater/developers (essentially unrivalled for EUV), etch, deposition.', y: 'Every EUV line needs its track machines.', up: ['vat', 'edwards', 'mks'] }),
N('kla', 11, 'KLA', { d: 'kla.com', q: 'KLAC', w: 'Inspection and process-control tools.', y: 'Finds defects, so improves yield.', up: ['mks'] }),
N('advantest', 11, 'Advantest', { d: 'advantest.com', q: '6857.T', w: 'Automated test systems for GPUs and memory.', y: 'Dominant in testing AI chips.', c: 1 }),
N('teradyne', 11, 'Teradyne', { d: 'teradyne.com', q: 'TER', w: 'Semiconductor test, and robots (Universal Robots).', y: 'The other major tester.' }),
N('disco', 11, 'Disco', { d: 'disco.co.jp', q: '6146.T', w: 'Wafer dicing, grinding and polishing tools.', y: 'Essential for thinning wafers in HBM stacks.' }),
N('lasertec', 11, 'Lasertec', { d: 'lasertec.co.jp', q: '6920.T', w: 'EUV mask inspection equipment.', y: 'A niche monopoly in a critical step.', c: 1 }),
N('besi', 11, 'BE Semiconductor (Besi)', { d: 'besi.com', q: 'BESI.AS', w: 'Hybrid bonding equipment for stacking chips.', y: 'Next-generation stacking depends on it. Applied Materials owns a stake.' }),
N('asm_intl', 11, 'ASM International', { d: 'asm.com', q: 'ASM.AS', w: 'Atomic layer deposition and epitaxy tools.', y: 'Atomic-scale layers are needed for advanced transistors.', up: ['mks', 'vat'] }),
N('zeiss', 11, 'Carl Zeiss SMT', { d: 'zeiss.com', s: 'Private (foundation-owned)', w: 'Makes the ultra-smooth mirrors and optics inside EUV machines.', y: 'Mirrors smooth to atomic scale, with a single customer: ASML.', up: ['schott'], c: 1 }),
N('trumpf', 11, 'TRUMPF', { d: 'trumpf.com', s: 'Private (family-owned)', w: 'Makes the high-power laser that vaporises tin droplets to produce EUV light.', y: 'No laser, no EUV light source.', c: 1 }),

/* ---------------- 12 · PARTS ---------------- */
N('mks', 12, 'MKS Instruments', { d: 'mks.com', q: 'MKSI', w: 'Vacuum, gas-flow and power subsystems inside chip tools.', y: 'Hundreds of small parts determine tool uptime.' }),
N('advanced_energy', 12, 'Advanced Energy', { d: 'advancedenergy.com', q: 'AEIS', w: 'Precision power supplies for plasma processing.', y: 'Plasma etch and deposition depend on stable power.' }),
N('vat', 12, 'VAT Group', { d: 'vatvalve.com', q: 'VACN.SW', w: 'Vacuum valves for chip tools.', y: 'Dominant share in a niche that is slow to qualify.', c: 1 }),
N('edwards', 12, 'Edwards Vacuum (Atlas Copco)', { d: 'edwardsvacuum.com', q: 'ATCO-A.ST', s: 'Atlas Copco', w: 'Dry vacuum pumps for fabs.', y: 'Every vacuum chamber needs a pump.' }),
N('ichor', 12, 'Ichor', { d: 'ichorsystems.com', q: 'ICHR', w: 'Fluid delivery subsystems (gas panels) for chip tools.', y: 'A tiny supplier on which Lam and Applied depend.', up: ['swagelok'] }),
N('ucts', 12, 'Ultra Clean (UCT)', { d: 'uct.com', q: 'UCTT', w: 'Gas delivery systems and weldments for chip tools.', y: 'Another contract manufacturer behind the machines.', up: ['swagelok'] }),
N('swagelok', 12, 'Swagelok', { d: 'swagelok.com', s: 'Private', w: 'Precision fittings, valves and tubing.', y: 'The one-single-screw layer. Fittings that cannot leak are qualified once and stay.' }),
N('coorstek', 12, 'CoorsTek', { d: 'coorstek.com', s: 'Private', w: 'Technical ceramics for chip tools.', y: 'Plasma-resistant ceramic parts are consumables inside every etcher.' }),
N('ferrotec', 12, 'Ferrotec', { d: 'ferrotec.com', q: '6890.T', w: 'Quartz and ceramic parts, vacuum seals and wafers.', y: 'Japanese specialist in tool components.' }),

/* ---------------- 13 · MATERIALS ---------------- */
N('shin_etsu', 13, 'Shin-Etsu Chemical', { d: 'shinetsu.co.jp', q: '4063.T', w: 'Largest silicon wafer maker, plus photoresists and mask blanks.', y: 'Around a third of the world\'s wafers.', up: ['crucible', 'wacker'], c: 1 }),
N('sumco', 13, 'SUMCO', { d: 'sumcosi.com', q: '3436.T', w: 'Second-largest silicon wafer maker.', y: 'Every chip starts as one of its wafers.', up: ['crucible', 'wacker'] }),
N('globalwafers', 13, 'GlobalWafers', { d: 'sas-globalwafers.com', q: '6488.TWO', w: 'Taiwanese wafer maker with US expansion.', y: 'Third force in wafers.', up: ['crucible', 'wacker'] }),
N('entegris', 13, 'Entegris', { d: 'entegris.com', q: 'ENTG', w: 'Filters, containers and ultra-clean materials.', y: 'Purity is everything in a fab.' }),
N('linde', 13, 'Linde', { d: 'linde.com', q: 'LIN', w: 'Industrial and specialty gases for fabs.', y: 'Pipes gases directly into the world\'s biggest fabs.', up: ['neon_helium'] }),
N('air_liquide', 13, 'Air Liquide', { d: 'airliquide.com', q: 'AI.PA', w: 'Industrial and electronic gases.', y: 'Another major supplier of ultra-pure gases.', up: ['neon_helium'] }),
N('jsr', 13, 'JSR', { d: 'jsr.co.jp', s: 'Private (JIC)', w: 'Photoresists, the light-sensitive coatings used in lithography.', y: 'Japan holds most of the world\'s advanced photoresist capacity.' }),
N('tok', 13, 'Tokyo Ohka Kogyo', { d: 'tok.co.jp', q: '4186.T', w: 'Photoresists and chemicals.', y: 'Another Japanese photoresist leader.' }),
N('ajinomoto', 13, 'Ajinomoto', { d: 'ajinomoto.com', q: '2802.T', w: 'Famous for seasoning, but also makes ABF, the film used for chip packaging substrates.', y: 'Near-monopoly on a food-company-made film that nearly every AI chip depends on.', o: 'A good example of how a non-obvious company can be critical. A well-known "hidden gem" for researchers.', c: 1 }),
N('ibiden', 13, 'Ibiden', { d: 'ibiden.com', q: '4062.T', w: 'Advanced IC substrates for GPUs and CPUs.', y: 'Key supplier of packaging substrates.', up: ['ajinomoto', 'nittobo'], c: 1 }),
N('unimicron', 13, 'Unimicron', { d: 'unimicron.com', q: '3037.TW', w: 'IC substrates and circuit boards.', y: 'Substrate supply is a bottleneck.', up: ['ajinomoto', 'nittobo'] }),
N('nittobo', 13, 'Nittobo', { d: 'nittobo.co.jp', q: '3110.T', w: 'Specialty glass-fibre cloth used in substrates.', y: 'Supply of the cloth tightened as AI substrates grew.', c: 1 }),
N('resonac', 13, 'Resonac', { d: 'resonac.com', q: '4004.T', w: 'Materials for packaging and memory.', y: 'Supplies encapsulants and substrate materials.' }),
N('dupont', 13, 'DuPont', { d: 'dupont.com', q: 'DD', w: 'CMP pads and electronic materials.', y: 'Used to polish wafers flat.' }),
N('merck_kgaa', 13, 'Merck KGaA (EMD Electronics)', { d: 'merckgroup.com', q: 'MRK.DE', w: 'Specialty chemicals and materials for chip making.', y: 'Large electronic-materials business.' }),
N('fujifilm', 13, 'Fujifilm', { d: 'fujifilm.com', q: '4901.T', w: 'Photoresists and CMP slurries.', y: 'A camera company that is also a major chip-materials supplier.' }),
N('photronics', 13, 'Photronics', { d: 'photronics.com', q: 'PLAB', w: 'Photomasks: stencils used in lithography.', y: 'Every layer of every chip needs a mask.', up: ['hoya'] }),
N('hoya', 13, 'HOYA', { d: 'hoya.com', q: '7741.T', w: 'EUV mask blanks.', y: 'Dominant supplier of EUV blanks.', c: 1 }),
N('schott', 13, 'SCHOTT', { d: 'schott.com', s: 'Private (foundation-owned)', w: 'Zerodur: ultra-stable glass-ceramic used in lithography optics.', y: 'Zeiss\'s mirrors start on SCHOTT substrates.', c: 1 }),
N('wacker', 13, 'Wacker Chemie', { d: 'wacker.com', q: 'WCH.DE', w: 'Ultra-pure polysilicon, the raw feedstock for wafers.', y: 'Chips begin as polysilicon that is 99.999999999% pure.', up: ['ferroglobe'] }),
N('crucible', 13, 'Quartz crucible makers (Heraeus, Momentive, Shin-Etsu Quartz)', { d: 'heraeus.com', s: 'Specialists', w: 'High-purity quartz crucibles in which silicon crystals are grown.', y: 'The crucible must be ultra-pure, so it relies on a few quartz sources.', up: ['sibelco', 'quartz_corp'], c: 1 }),

/* ---------------- 14 · SPACE ---------------- */
N('spacex', 14, 'SpaceX', { d: 'spacex.com', s: 'Private (IPO reported; verify)', w: 'Falcon 9 and Heavy (reusable), Dragon, Starship and Starlink satellites, much built in-house.', y: 'Reuse cut launch costs sharply and gave SpaceX the majority of global mass to orbit. Highly vertically integrated, which is unusual in aerospace.', p: 'Valuation reported in the hundreds of billions and rising. Starlink is a growing revenue engine.', o: 'Heavily recruits engineers. Starship could cut launch costs again, enabling more orbital businesses.', up: ['ati', 'howmet'], c: 1 }),
N('starlink', 14, 'Starlink', { d: 'starlink.com', s: 'SpaceX', w: 'Low-orbit broadband with thousands of satellites and millions of subscribers; direct-to-phone service.', y: 'Connects places fibre does not reach and funds Starship.', up: ['spacex'] }),
N('kuiper', 14, 'Amazon Leo (Kuiper)', { d: 'amazon.com', s: 'Amazon', w: 'Amazon\'s low-orbit broadband constellation.', y: 'Amazon bought launches from several rocket companies, including rivals.', up: ['ula', 'blueorigin', 'spacex', 'arianespace'] }),
N('rocketlab', 14, 'Rocket Lab', { d: 'rocketlab.com', q: 'RKLB', w: 'Electron small launcher, Neutron medium rocket in development, plus spacecraft and components.', y: 'The number-two US launcher by cadence, growing into satellites.', p: 'Stock rose strongly in 2025 on backlog and Neutron progress; still volatile.', up: ['hexcel', 'toray'] }),
N('blueorigin', 14, 'Blue Origin', { d: 'blueorigin.com', s: 'Private (Bezos)', w: 'New Shepard and the New Glenn orbital rocket; BE-4 engines also fly on ULA\'s Vulcan.', y: 'Second heavy-lift reusable launcher after SpaceX.', up: ['ati', 'howmet'] }),
N('ula', 14, 'United Launch Alliance', { d: 'ulalaunch.com', s: 'Private (Boeing / Lockheed JV)', w: 'Vulcan and Atlas V launchers.', y: 'Heavy national-security launcher.', up: ['blueorigin', 'l3harris', 'northrop', 'moog', 'honeywell'] }),
N('arianespace', 14, 'Arianespace', { d: 'arianespace.com', s: 'ArianeGroup', w: 'Europe\'s Ariane 6 launcher.', y: 'Europe\'s independent access to space.', up: ['airbus'] }),
N('ast', 14, 'AST SpaceMobile', { d: 'ast-science.com', q: 'ASTS', w: 'Satellites that connect directly to ordinary phones.', y: 'Partners with major carriers; no special phone needed.', p: 'Speculative with volatile shares.', up: ['spacex', 'blueorigin'] }),
N('planet', 14, 'Planet Labs', { d: 'planet.com', q: 'PL', w: 'Daily Earth-imaging satellites; data used for AI analytics in agriculture and defence.', y: 'Turns satellite imagery into a data feed for AI.', up: ['spacex'], o: 'A data supplier: AI companies can build products on imagery without ever launching hardware.' }),
N('globalstar', 14, 'Globalstar', { d: 'globalstar.com', q: 'GSAT', w: 'Satellite network behind Apple\'s emergency messaging.', y: 'The link between iPhones and space.', up: ['spacex'] }),
N('starcloud', 14, 'Starcloud', { d: 'starcloud.com', s: 'Private (NVIDIA-backed)', w: 'Launched an NVIDIA H100 to orbit in 2025 as a test of space-based data centres.', y: 'Orbital compute gets continuous solar power and radiative cooling.', up: ['spacex'], o: 'Early-stage frontier. Sceptics note heat, radiation and maintenance challenges.' }),
N('suncatcher', 14, 'Google Project Suncatcher', { d: 'research.google', s: 'Alphabet research', w: 'Research to run TPUs on solar-powered satellites, with prototype launches planned with Planet.', y: 'Google exploring orbital compute for AI.', up: ['planet'] }),
N('nasa', 14, 'NASA', { d: 'nasa.gov', s: 'US government', w: 'Artemis, commercial crew and cargo, science missions.', y: 'Anchor customer that helped seed commercial launch.', up: ['spacex', 'blueorigin', 'boeing', 'lockheed', 'northrop', 'l3harris'] }),
N('ussf', 14, 'US Space Force & Golden Dome', { e: '🛡️', s: 'US government', w: 'Military space launch, satellites and missile defence.', y: 'Defence budgets underwrite much of the space industry.', up: ['spacex', 'ula', 'blueorigin', 'lockheed', 'northrop', 'l3harris', 'rocketlab'] }),

/* ---------------- 15 · ROCKET SCIENCE ---------------- */
N('l3harris', 15, 'L3Harris (Aerojet Rocketdyne)', { d: 'l3harris.com', q: 'LHX', w: 'Rocket engines (RS-25, RL10), solid motors and satellite payloads.', y: 'Makes engines on SLS and Vulcan upper stages.' }),
N('northrop', 15, 'Northrop Grumman', { d: 'northropgrumman.com', q: 'NOC', w: 'Solid rocket boosters, Cygnus spacecraft, satellites.', y: 'Boosters for SLS and Vulcan.' }),
N('hexcel', 15, 'Hexcel', { d: 'hexcel.com', q: 'HXL', w: 'Carbon-fibre composites for aircraft and space.', y: 'Lightweight structure is everything in rockets.' }),
N('toray', 15, 'Toray', { d: 'toray.com', q: '3402.T', w: 'Carbon fibre and advanced materials.', y: 'World-leading carbon-fibre supplier.' }),
N('howmet', 15, 'Howmet Aerospace', { d: 'howmet.com', q: 'HWM', w: 'Precision engine castings, fasteners and structures.', y: 'High-temperature parts that survive extreme heat.' }),
N('ati', 15, 'ATI', { d: 'atimaterials.com', q: 'ATI', w: 'Titanium and nickel-based specialty alloys.', y: 'Specialty metals are a scarce input for aerospace.' }),
N('moog', 15, 'Moog', { d: 'moog.com', q: 'MOG.A', w: 'Actuators, valves and propulsion controls.', y: 'Controls thrust and flight surfaces.' }),
N('honeywell', 15, 'Honeywell Aerospace', { d: 'honeywell.com', q: 'HON', w: 'Avionics, sensors and propulsion components.', y: 'Electronics that guide spacecraft.' }),
N('lockheed', 15, 'Lockheed Martin', { d: 'lockheedmartin.com', q: 'LMT', w: 'Orion capsule, satellites and defence systems.', y: 'Prime contractor for crewed deep-space flight.' }),
N('boeing', 15, 'Boeing', { d: 'boeing.com', q: 'BA', w: 'SLS core stage, Starliner, satellites.', y: 'Builds the core stage of NASA\'s moon rocket.', up: ['spectrolab'] }),
N('airbus', 15, 'Airbus Defence & Space', { d: 'airbus.com', q: 'AIR.PA', w: 'Satellites, Ariane 6 stages and Orion service module.', y: 'Europe\'s largest space company.' }),
N('spectrolab', 15, 'Spectrolab (Boeing)', { d: 'spectrolab.com', s: 'Boeing', w: 'Multi-junction solar cells that power satellites.', y: 'Space solar cells use gallium arsenide and germanium, which ties space back to China\'s export controls.', up: ['china_gallium'] }),

/* ---------------- 16 · RAW EARTH ---------------- */
N('sibelco', 16, 'Sibelco', { d: 'sibelco.com', s: 'Private', w: 'Industrial minerals, including high-purity quartz.', y: 'High-purity quartz from a few deposits (notably Spruce Pine, North Carolina) is essential for the crucibles that grow silicon crystals.', o: 'Alternative purification and synthetic quartz are active areas.', c: 1 }),
N('quartz_corp', 16, 'The Quartz Corp', { d: 'thequartzcorp.com', s: 'Private', w: 'Produces some of the world\'s highest-purity quartz, with operations in Spruce Pine, North Carolina and Norway.', y: 'One of very few sources of ultra-pure quartz.', c: 1 }),
N('ferroglobe', 16, 'Ferroglobe', { d: 'ferroglobe.com', q: 'GSM', w: 'Silicon metal and alloys.', y: 'Silicon metal is the first step toward polysilicon.' }),
N('freeport', 16, 'Freeport-McMoRan', { d: 'fcx.com', q: 'FCX', w: 'One of the world\'s largest copper producers.', y: 'Every chip, cable, transformer and motor needs copper. Supply is tight and prices have been near records.', p: 'Operational disruptions in 2025 tightened supply further.' }),
N('mp_materials', 16, 'MP Materials', { d: 'mpmaterials.com', q: 'MP', w: 'The only scaled US rare-earth mine and processor (Mountain Pass, California).', y: 'Rare-earth magnets sit in motors, drives and disk drives. The US government and Apple have backed it.' }),
N('china_gallium', 16, 'China: gallium, germanium & rare-earth refining', { e: '⛏️', s: 'Market structure', w: 'China refines most of the world\'s gallium, germanium and rare earths, and has tightened export controls since 2023.', y: 'A policy lever that can slow chips, optics, solar cells and magnets worldwide.', c: 1 }),
N('neon_helium', 16, 'Neon & helium', { e: '🎈', s: 'Commodity gases', w: 'Neon for lithography lasers; helium for cooling and leak-testing.', y: 'The 2022 war in Ukraine disrupted neon supply and forced fabs to diversify. Helium comes from a few places, notably the US and Qatar.' }),
N('water', 16, 'Fresh water', { e: '💧', s: 'Resource', w: 'Fabs use huge volumes of ultra-pure water; data centres use water for cooling.', y: 'Water is a hidden constraint in dry regions such as Arizona and Taiwan.' }),
N('tin_tungsten', 16, 'Tin & tungsten', { e: '🪙', s: 'Metals', w: 'Tin droplets are vaporised to create EUV light; tungsten forms contacts in chips.', y: 'Both come from a small set of countries.' })
,

/* ================= v2: household-scale consumer layers ================= */

/* ---- YOU ---- */
N('you_shop', 'you', 'Shopping & home delivery', { e: '🛒', w: 'Everything you buy online or in store: groceries, household goods, gifts, takeaway, rides.', y: 'The largest slice of household spending that touches AI. Search, recommendations, pricing, fraud checks and delivery routing all run on models, and the retailer pays for the compute.', up: ['amazon', 'walmart', 'shopify', 'temu', 'costco', 'ups', 'fedex', 'doordash', 'uber', 'ikea'] }),
N('you_scroll', 'you', 'Social, short video & search', { e: '📱', w: 'TikTok, YouTube, Instagram, X, Reddit, Google: how you find things and fill spare minutes.', y: 'Free to you, paid for by advertisers. AI ranking decides every item you see, and it runs on some of the largest GPU fleets on Earth.', up: ['youtube', 'bytedance', 'meta', 'google', 'snap', 'reddit', 'pinterest', 'x_twitter', 'perplexity'] }),
N('you_stream', 'you', 'Streaming TV, music & podcasts', { e: '🎬', w: 'Netflix, YouTube, Disney+, Spotify and the rest of your subscriptions.', y: 'Subscriptions plus ads. Personalisation, encoding and delivery run in the cloud.', up: ['netflix', 'youtube', 'disney', 'spotify'] }),
N('you_game', 'you', 'Gaming & XR', { e: '🎮', w: 'Consoles, PC gaming, Roblox, VR and smart glasses.', y: 'Gaming built the GPU industry that now powers AI.', up: ['sony', 'nintendo', 'microsoft', 'nvidia', 'roblox', 'essilor', 'meta'] }),
N('you_paycheck', 'you', 'Getting paid: payroll, benefits & taxes', { e: '💵', w: 'The salary, bonus or gig payment that lands in your account, and the taxes and benefits around it.', y: 'Payroll software calculates, taxes and moves your pay over bank rails. AI is entering payroll, benefits and tax prep, and it also decides whether your job gets automated.', up: ['adp', 'paychex', 'workday', 'gusto', 'rippling', 'deel', 'intuit'] }),
N('you_job', 'you', 'Doing the job: docs, code & meetings', { e: '💼', w: 'The software and AI assistants you use at work.', y: 'Enterprise seats are the most dependable AI revenue, and where lab revenue is growing fastest.', up: ['microsoft', 'gworkspace', 'salesforce', 'servicenow', 'zoom', 'atlassian', 'sap', 'adobe', 'cursor', 'palantir', 'anthropic', 'openai'] }),
N('you_pay', 'you', 'Cards, banking & payments', { e: '💳', w: 'Every tap, transfer, bill and subscription charge.', y: 'Each payment is scored by AI fraud models in milliseconds, and the network takes a tiny cut that funds more compute.', up: ['jpm', 'bofa', 'visa', 'mastercard', 'paypal', 'block', 'stripe', 'affirm', 'apple'] }),
N('you_invest', 'you', 'Investing, saving & crypto', { e: '📈', w: 'Brokerage apps, savings, crypto and AI-assisted research.', y: 'Retail investors both use AI and, through their holdings, own the companies being funded.', up: ['robinhood', 'schwab', 'coinbase', 'anthropic', 'openai', 'perplexity'] }),
N('you_retire', 'you', '401(k)s, pensions & index funds', { e: '🏦', w: 'Retirement savings that sit in funds you rarely look at.', y: 'Index funds are heavily weighted to AI leaders, and big asset managers also finance data centres directly. You may already be an investor in this map.', up: ['blackrock', 'blackstone', 'brookfield', 'apollo'] }),
N('you_health', 'you', 'Health, fitness & care', { e: '⚕️', w: 'Your watch or ring, your insurer, your doctor, pharmacy and telehealth.', y: 'AI note-takers, diagnostics and drug discovery are reshaping healthcare, and it is among the biggest per-person spending categories.', up: ['apple', 'whoop', 'oura', 'garmin', 'unitedhealth', 'cvs', 'epic', 'abridge', 'teladoc', 'hims', 'tempus', 'doximity'] }),
N('you_ai', 'you', 'Chatting with AI assistants', { e: '🤖', w: 'Asking Claude, ChatGPT, Gemini, Copilot, Grok or Perplexity to write, plan or explain.', y: 'The most compute-hungry thing a consumer does. A heavy user can cost a lab more than a subscription earns.', up: ['anthropic', 'openai', 'google', 'microsoft', 'meta', 'perplexity', 'xai'] }),
N('you_home', 'you', 'Smart home & IoT', { e: '🏠', w: 'Speakers, doorbells, thermostats, lights, cameras and robot vacuums.', y: 'Billions of low-power chips plus voice assistants that now call large models in the cloud.', up: ['amazon_devices', 'nest', 'apple', 'samsung', 'signify', 'sonos'] }),
N('you_furniture', 'you', 'Furniture, beds & appliances', { e: '🛋️', w: 'Smart mattresses, connected fridges, lamps with chips and sensors.', y: 'Even a lamp now has a Wi-Fi chip. Furniture makers are becoming hardware companies.', up: ['ikea', 'eightsleep', 'lg', 'samsung'] }),
N('you_car', 'you', 'Cars & robotaxis', { e: '🚗', w: 'Driver-assist, self-driving rides and in-car assistants.', y: 'Cars are now rolling computers: big vision models, cameras, radar and constant connectivity.', up: ['tesla', 'waymo', 'qualcomm', 'nvidia'] }),
N('you_connect', 'you', 'Internet anywhere', { e: '📡', w: 'Satellite broadband on planes, ships and farms, and satellite messaging on phones.', y: 'Space-based connectivity is now a consumer product, and could connect AI to places fibre never will.', up: ['starlink', 'ast', 'globalstar'] }),
N('you_learn', 'you', 'Creating: writing, music, images & video', { e: '🎨', w: 'Writing, music, images and video made with AI.', y: 'Creative tools drive heavy, spiky compute use, especially image and video generation.', up: ['openai', 'google', 'adobe', 'anthropic'] }),

/* ---- SHOP ---- */
N('walmart', 'shop', 'Walmart', { d: 'walmart.com', q: 'WMT', w: 'Largest retailer; uses AI for search, inventory and supply-chain forecasting, and announced in-chat shopping with OpenAI in 2025.', y: 'Shows how a store giant becomes a tech buyer.', p: 'Steady growth with a fast-growing e-commerce and ads business.', up: ['azure', 'gcloud', 'openai', 'visa', 'mastercard'] }),
N('shopify', 'shop', 'Shopify', { d: 'shopify.com', q: 'SHOP', w: 'Commerce platform for millions of merchants, with AI assistants and agent-checkout integrations.', y: 'The rails small brands sell on, and a key gateway for AI shopping agents.', up: ['gcloud', 'openai', 'stripe'] }),
N('temu', 'shop', 'Temu (PDD Holdings)', { d: 'temu.com', q: 'PDD', w: 'Ultra-low-price marketplace known for an aggressive recommendation algorithm.', y: 'Proof of how powerful a ranking engine can be, and how exposed to trade policy.', p: 'US tariff and customs changes in 2025 squeezed its low-price model.' }),
N('costco', 'shop', 'Costco', { d: 'costco.com', q: 'COST', w: 'Membership warehouse club; a steady, less AI-exposed counterweight.', y: 'Useful contrast: great retail with a modest AI footprint.', up: ['visa'] }),
N('ups', 'shop', 'UPS', { d: 'ups.com', q: 'UPS', w: 'Parcel delivery; AI route optimisation (ORION) and automated sorting hubs.', y: 'The physical half of e-commerce.' }),
N('fedex', 'shop', 'FedEx', { d: 'fedex.com', q: 'FDX', w: 'Parcel and freight delivery; AI-driven logistics and network planning.', y: 'Another backbone of home delivery.' }),
N('doordash', 'shop', 'DoorDash', { d: 'doordash.com', q: 'DASH', w: 'Food and grocery delivery; ML for dispatch and recommendations.', y: 'Real-time logistics is one of the hardest ML problems in consumer tech.', up: ['aws', 'recsys'] }),
N('uber', 'shop', 'Uber', { d: 'uber.com', q: 'UBER', w: 'Rides and delivery; partners with Waymo and others for robotaxis.', y: 'Aggregator that could benefit or be disrupted as autonomy arrives.', up: ['oracle', 'gcloud', 'waymo', 'recsys'] }),

/* ---- SOCIAL ---- */
N('youtube', 'social', 'YouTube', { d: 'youtube.com', s: 'Alphabet', w: 'World\'s largest video platform, with shorts, music, TV apps and a huge creator economy.', y: 'The company has said recommendations drive a large share of what people watch (it has cited roughly 70%). That engine is a major TPU and GPU customer.', p: 'Ads plus subscriptions are one of Alphabet\'s largest revenue lines.', o: 'Creator tools, analytics and AI video are huge adjacent markets.', up: ['google_tpu', 'gcloud', 'deepmind'] }),
N('snap', 'social', 'Snap', { d: 'snap.com', q: 'SNAP', w: 'Snapchat, AR filters and Spectacles glasses.', y: 'A smaller platform that depends on cloud AI to compete on ads.', up: ['gcloud', 'aws'] }),
N('reddit', 'social', 'Reddit', { d: 'reddit.com', q: 'RDDT', w: 'Forum platform whose conversations are licensed as AI training and search data.', y: 'Shows how human-written content became a paid input to AI.', p: 'Stock surged after IPO on ads growth and data-licensing deals.', up: ['gcloud'] }),
N('pinterest', 'social', 'Pinterest', { d: 'pinterest.com', q: 'PINS', w: 'Visual discovery and shopping platform with AI-driven recommendations.', y: 'A clean example of recommendation-led shopping.', up: ['aws'] }),
N('x_twitter', 'social', 'X (Twitter)', { d: 'x.com', s: 'Private (merged with xAI)', w: 'Social network and distribution channel for the Grok assistant.', y: 'Merged with xAI in 2025, tying social data directly to a model lab.', up: ['xai', 'oracle'] }),
N('disney', 'social', 'Disney', { d: 'disney.com', q: 'DIS', w: 'Disney+, ESPN, parks and studios; reported licensing and investment deal with OpenAI.', y: 'Hollywood\'s big test of generative AI: threat to creators, tool for studios.', up: ['aws'] }),
N('roblox', 'social', 'Roblox', { d: 'roblox.com', q: 'RBLX', w: 'User-generated game platform for hundreds of millions of players, mostly young.', y: 'Heavy real-time compute and a safety-moderation challenge.' }),
N('applovin', 'social', 'AppLovin', { d: 'applovin.com', q: 'APP', w: 'AI ad-optimisation engine that matches advertisers to mobile app audiences.', y: 'Example of a pure AI-for-ads business with huge margins.', up: ['recsys'], p: 'Shares rose sharply on the success of its AI ad engine, with periodic short-seller scrutiny.' }),
N('trade_desk', 'social', 'The Trade Desk', { d: 'thetradedesk.com', q: 'TTD', w: 'Independent platform advertisers use to buy ads across the web, with AI bidding.', y: 'Challenger to the walled gardens, now competing with Amazon\'s ad tools.', p: 'Growth slowed and the stock fell on competition concerns.', up: ['recsys', 'aws'] }),

/* ---- WORK ---- */
N('gworkspace', 'work', 'Google Workspace', { d: 'workspace.google.com', s: 'Alphabet', w: 'Gmail, Docs, Meet and Drive with Gemini built in.', y: 'Google\'s answer to Microsoft 365 for AI at work.', up: ['deepmind', 'gcloud'] }),
N('salesforce', 'work', 'Salesforce', { d: 'salesforce.com', q: 'CRM', w: 'CRM and Slack, with Agentforce AI agents for sales and service.', y: 'Bet that agents will do work seats used to do.', p: 'Debate over whether AI agents expand or shrink per-seat software.', up: ['aws', 'gcloud', 'anthropic', 'openai'] }),
N('servicenow', 'work', 'ServiceNow', { d: 'servicenow.com', q: 'NOW', w: 'Workflow automation for IT, HR and customer service, with AI agents.', y: 'The plumbing of big-company back offices.', up: ['nvidia', 'azure'] }),
N('workday', 'work', 'Workday', { d: 'workday.com', q: 'WDAY', w: 'HR, payroll and finance software for large employers, with AI agents.', y: 'Holds the records of who works where and what they are paid.', up: ['aws', 'gcloud'] }),
N('adp', 'work', 'ADP', { d: 'adp.com', q: 'ADP', w: 'Payroll for roughly one in six US workers (company-cited scale), plus HR and benefits.', y: 'Moves wages over bank rails every pay cycle, and is adding AI assistants.', p: 'Stable, cash-rich business; AI is both a tool and a threat to headcount-based pricing.', o: 'Look at how payroll evolves for gig, freelance and AI-augmented workers.', up: ['jpm', 'fed'] }),
N('paychex', 'work', 'Paychex', { d: 'paychex.com', q: 'PAYX', w: 'Payroll and HR for small and mid-sized businesses.', y: 'Runs payroll for millions of small-business employees.', up: ['jpm', 'fed'] }),
N('gusto', 'work', 'Gusto', { d: 'gusto.com', s: 'Private', w: 'Payroll, benefits and HR for small businesses.', y: 'Startup-friendly payroll that adds AI help for small employers.', up: ['jpm', 'fed'] }),
N('rippling', 'work', 'Rippling', { d: 'rippling.com', s: 'Private', w: 'Employee platform combining payroll, IT and HR.', y: 'A fast-growing challenger to the incumbents.', up: ['fed'] }),
N('deel', 'work', 'Deel', { d: 'deel.com', s: 'Private', w: 'Global payroll and contractor payments across countries.', y: 'Shows how remote work turned payroll into a borderless product.', up: ['fed', 'stripe'] }),
N('zoom', 'work', 'Zoom', { d: 'zoom.us', q: 'ZM', w: 'Video meetings and AI companion features; invested in Anthropic.', y: 'Example of an incumbent adding AI assistants.', up: ['aws', 'oracle', 'anthropic'] }),
N('atlassian', 'work', 'Atlassian', { d: 'atlassian.com', q: 'TEAM', w: 'Jira, Confluence and team tools with Rovo AI.', y: 'Where many software teams plan their work.', up: ['aws'] }),
N('sap', 'work', 'SAP', { d: 'sap.com', q: 'SAP', w: 'Enterprise software running finance and supply chains for large firms.', y: 'Business-critical systems that AI agents want to plug into.', up: ['azure', 'aws', 'gcloud'] }),

/* ---- MONEY ---- */
N('jpm', 'money', 'JPMorgan Chase', { d: 'jpmorganchase.com', q: 'JPM', w: 'Largest US bank; one of the biggest corporate AI spenders and a major cloud customer.', y: 'Moves a large share of payroll and card flows, and funds many AI infrastructure deals.', p: 'Consistently profitable; uses AI for fraud, coding and client service.', up: ['aws', 'azure', 'fed'] }),
N('bofa', 'money', 'Bank of America', { d: 'bankofamerica.com', q: 'BAC', w: 'Major US bank; its Erica assistant handles billions of customer requests.', y: 'One of the early consumer-bank AI deployments.', up: ['fed'] }),
N('paypal', 'money', 'PayPal', { d: 'paypal.com', q: 'PYPL', w: 'Digital wallet and checkout; partners on agent-driven shopping.', y: 'Checkout is a key battleground for AI shopping agents.', up: ['gcloud', 'fed'] }),
N('block', 'money', 'Block (Square, Cash App)', { d: 'block.xyz', q: 'XYZ', w: 'Payments for small merchants and a consumer app with a large user base.', y: 'Small-business and consumer finance on one platform.', up: ['aws', 'fed'] }),
N('stripe', 'money', 'Stripe', { d: 'stripe.com', s: 'Private', w: 'Payments infrastructure used by a large share of internet businesses; powers agent checkout.', y: 'The default payments API for AI companies and web shops.', o: 'Developer-friendly fintech infrastructure is a proven startup path.', up: ['aws', 'fed'] }),
N('schwab', 'money', 'Charles Schwab', { d: 'schwab.com', q: 'SCHW', w: 'Brokerage and wealth manager with trillions in client assets.', y: 'Where many households hold the AI-heavy index funds.', up: ['fed'] }),
N('affirm', 'money', 'Affirm', { d: 'affirm.com', q: 'AFRM', w: 'Buy-now-pay-later lender that uses ML for instant credit decisions.', y: 'Real-time credit scoring at checkout.', up: ['aws', 'fed'] }),
N('coinbase', 'money', 'Coinbase', { d: 'coinbase.com', q: 'COIN', w: 'Crypto exchange; building payment rails for AI agents.', y: 'Possible rails for machine-to-machine payments.', up: ['aws'] }),
N('intuit', 'money', 'Intuit', { d: 'intuit.com', q: 'INTU', w: 'TurboTax, QuickBooks, Credit Karma and Mailchimp, with a strong AI push.', y: 'Where many people file taxes and small businesses keep their books.', up: ['aws', 'openai'] }),
N('fed', 'money', 'Federal Reserve payment rails (ACH, FedNow)', { e: '🏛️', s: 'Government / central bank', w: 'The public infrastructure that moves paychecks and bank transfers.', y: 'Almost every payroll run ends up on these rails.' }),

/* ---- HEALTH ---- */
N('whoop', 'health', 'WHOOP', { d: 'whoop.com', s: 'Private', w: 'Subscription wearable for recovery and training.', y: 'Sensor data plus AI coaching is the wearable business model.' }),
N('garmin', 'health', 'Garmin', { d: 'garmin.com', q: 'GRMN', w: 'Sports watches, fitness trackers and GPS devices.', y: 'Profitable hardware brand that stays out of the AI arms race.' }),
N('unitedhealth', 'health', 'UnitedHealth', { d: 'unitedhealthgroup.com', q: 'UNH', w: 'Largest US health insurer and operator of Optum care and data businesses.', y: 'Huge data owner and heavy AI user; faces scrutiny over AI in claims decisions.', p: 'Shares fell sharply in 2025 on rising medical costs and investigations.' }),
N('cvs', 'health', 'CVS Health', { d: 'cvshealth.com', q: 'CVS', w: 'Pharmacy chain, Aetna insurer and primary-care clinics.', y: 'Where pharmacy, insurance and AI meet.' }),
N('epic', 'health', 'Epic Systems', { d: 'epic.com', s: 'Private', w: 'Electronic health records used by most large US hospitals.', y: 'The data system of record for care; adding generative AI with Microsoft.', up: ['azure', 'openai'] }),
N('abridge', 'health', 'Abridge', { d: 'abridge.com', s: 'Private', w: 'Ambient AI that writes clinical notes from doctor-patient conversations.', y: 'One of the clearest healthcare AI wins: it gives clinicians time back.', o: 'Shows a workflow where AI saves hours of pure paperwork.' }),
N('teladoc', 'health', 'Teladoc', { d: 'teladochealth.com', q: 'TDOC', w: 'Virtual care and telehealth.', y: 'An early digital-health giant under pressure to reinvent itself.' }),
N('hims', 'health', 'Hims & Hers', { d: 'forhims.com', q: 'HIMS', w: 'Direct-to-consumer telehealth for weight, hair and wellness.', y: 'Consumer health brand that grew fast and is volatile.' }),
N('tempus', 'health', 'Tempus AI', { d: 'tempus.com', q: 'TEM', w: 'Genomic testing and clinical data used to guide cancer treatment.', y: 'AI plus a large proprietary clinical dataset.' }),
N('recursion', 'health', 'Recursion', { d: 'recursion.com', q: 'RXRX', w: 'AI drug-discovery company with a large biology dataset; NVIDIA is an investor.', y: 'A test of whether AI can shorten the decade-long drug timeline.', p: 'Speculative; clinical results matter more than model news.', up: ['nvidia'] }),
N('isomorphic', 'health', 'Isomorphic Labs', { d: 'isomorphiclabs.com', s: 'Alphabet', w: 'DeepMind spin-out applying AlphaFold-style AI to drug design.', y: 'The most prominent AI-first drug-discovery lab.', up: ['gcloud', 'deepmind'] }),
N('doximity', 'health', 'Doximity', { d: 'doximity.com', q: 'DOCS', w: 'Professional network for US doctors with AI note and referral tools.', y: 'Where physicians already spend time.', up: ['aws'] }),

/* ---- concept hub: the AI engines behind commerce, feeds, payments ---- */
N('recsys', 'labs', 'Recommendation, ranking & risk models', { e: '🎯', s: 'Technology, not a company', w: 'The models that decide which product you see, which video plays next, which ad shows, and whether a payment looks like fraud.', y: 'The oldest and most profitable AI workload. It is the engine behind e-commerce, feeds, ads and card security, and it runs on GPUs, TPUs and custom chips around the clock.', o: 'Anywhere ranking or scoring creates money (shopping, ads, lending, hiring) is a market. Cheaper inference makes it bigger.', up: ['nvidia', 'google_tpu', 'aws_trainium', 'meta_infra', 'amd'] }),

/* ================= v3: food, travel, education, gig work ================= */

/* ---- YOU ---- */
N('you_food', 'you', 'Eating: groceries, restaurants & delivery', { e: '🍽️', w: 'The supermarket shop, the coffee, the takeaway and the restaurant booking.', y: 'Food is one of the biggest household budgets. AI now touches ordering, pricing, forecasting and farming, and the chain behind your plate runs from restaurants all the way to fertiliser mines.', up: ['kroger', 'starbucks', 'mcdonalds', 'chipotle', 'dominos', 'yum', 'toast', 'doordash', 'instacart', 'walmart', 'costco'] }),
N('you_travel', 'you', 'Travel & stays', { e: '✈️', w: 'Flights, hotels, rentals and trip planning.', y: 'Travel is a huge discretionary spend and an early AI use case: search, pricing, personalisation and trip-planning agents.', up: ['booking', 'airbnb', 'expedia', 'marriott', 'hilton', 'delta', 'united', 'carnival', 'google', 'uber'] }),
N('you_edu', 'you', 'Learning: school, courses & tutoring', { e: '📚', w: 'Classes, language apps, online courses, homework help and AI tutors.', y: 'Students were among the earliest mass users of chatbots, which is rewriting education and hurting some homework-help businesses.', up: ['duolingo', 'coursera', 'khan', 'chegg', 'pearson', 'instructure', 'grammarly', 'openai', 'anthropic', 'google'] }),
N('you_gig', 'you', 'Gig & freelance work', { e: '🧑‍💻', w: 'Driving, delivering, freelancing, and increasingly, being paid to train AI.', y: 'Gig platforms match workers to jobs with AI. At the same time, labs now pay thousands of experts to write, grade and correct model answers, which is a new kind of gig work.', up: ['uber', 'doordash', 'instacart', 'lyft', 'upwork', 'fiverr', 'mercor', 'surge_ai', 'scale_ai'] }),

/* ---- GIG ---- */
N('lyft', 'gig', 'Lyft', { d: 'lyft.com', q: 'LYFT', w: 'Ride-hailing platform; partners on autonomous vehicles.', y: 'Exposed to the robotaxi shift, and trying to be a marketplace for it.', up: ['aws', 'waymo', 'recsys'] }),
N('instacart', 'gig', 'Instacart (Maplebear)', { d: 'instacart.com', q: 'CART', w: 'Grocery delivery platform that uses personal shoppers; AI for substitutions and recommendations.', y: 'Brings food and gig work together. Its former CEO now leads applications at OpenAI.', up: ['aws', 'openai', 'recsys'] }),
N('upwork', 'gig', 'Upwork', { d: 'upwork.com', q: 'UPWK', w: 'Freelance marketplace for knowledge work.', y: 'A live test of whether AI replaces freelancers or makes them more productive.', p: 'Growth has been modest as AI changes which tasks get outsourced.', up: ['aws', 'paypal', 'recsys'] }),
N('fiverr', 'gig', 'Fiverr', { d: 'fiverr.com', q: 'FVRR', w: 'Marketplace for small creative and digital services.', y: 'Directly exposed to generative AI for writing, design and video.', up: ['aws', 'paypal', 'recsys'] }),

/* ---- FOOD ---- */
N('kroger', 'food', 'Kroger', { d: 'kroger.com', q: 'KR', w: 'Largest US supermarket chain by sales; uses AI for demand forecasting and personalised offers.', y: 'Groceries are thin-margin, so small AI efficiencies matter.', up: ['azure', 'tyson', 'cargill'] }),
N('starbucks', 'food', 'Starbucks', { d: 'starbucks.com', q: 'SBUX', w: 'Global coffee chain; its Deep Brew AI drives personalisation and inventory.', y: 'A consumer brand run on a loyalty app, which is effectively a data business.', up: ['azure'] }),
N('mcdonalds', 'food', 'McDonald\'s', { d: 'mcdonalds.com', q: 'MCD', w: 'World\'s largest restaurant chain; AI-assisted ordering and kitchen systems with Google Cloud.', y: 'Scale means tiny efficiency gains turn into huge savings.', up: ['gcloud', 'tyson', 'cargill'] }),
N('chipotle', 'food', 'Chipotle', { d: 'chipotle.com', q: 'CMG', w: 'Fast-casual chain that tests kitchen automation and AI for hiring and ordering.', y: 'Shows how a restaurant uses robotics and AI to cut labour cost.' }),
N('dominos', 'food', 'Domino\'s', { d: 'dominos.com', q: 'DPZ', w: 'Pizza chain with a heavy digital-ordering and logistics focus.', y: 'A restaurant that already behaves like a tech company.', up: ['tyson'] }),
N('yum', 'food', 'Yum! Brands (KFC, Taco Bell)', { d: 'yum.com', q: 'YUM', w: 'Parent of KFC, Taco Bell and Pizza Hut; announced AI partnerships with NVIDIA.', y: 'Drive-through voice AI is a visible, fast-moving use case.', up: ['nvidia', 'tyson'] }),
N('toast', 'food', 'Toast', { d: 'toasttab.com', q: 'TOST', w: 'Point-of-sale and software platform for restaurants.', y: 'The operating system for independent restaurants, adding AI features.', up: ['aws'] }),

/* ---- TRAVEL ---- */
N('booking', 'travel', 'Booking Holdings', { d: 'booking.com', q: 'BKNG', w: 'Booking.com, Priceline, Kayak and OpenTable, with an AI trip planner.', y: 'The biggest online travel agency, now competing with AI assistants that plan trips.', up: ['openai', 'amadeus'] }),
N('airbnb', 'travel', 'Airbnb', { d: 'airbnb.com', q: 'ABNB', w: 'Short-term rental marketplace; hosts are a kind of gig worker.', y: 'Has used third-party models, including reportedly Alibaba\'s Qwen, for customer service.', up: ['aws', 'alibaba'] }),
N('expedia', 'travel', 'Expedia Group', { d: 'expedia.com', q: 'EXPE', w: 'Online travel agency group (Expedia, Hotels.com, Vrbo).', y: 'Competes with Booking and with AI agents that do the planning.', up: ['openai', 'aws', 'amadeus'] }),
N('marriott', 'travel', 'Marriott', { d: 'marriott.com', q: 'MAR', w: 'World\'s largest hotel company.', y: 'Uses AI for revenue management and guest service.' }),
N('hilton', 'travel', 'Hilton', { d: 'hilton.com', q: 'HLT', w: 'Global hotel group.', y: 'Heavy loyalty-data business.' }),
N('delta', 'travel', 'Delta Air Lines', { d: 'delta.com', q: 'DAL', w: 'Major US airline; uses AI for pricing and operations.', y: 'Airlines depend on planemakers, engine makers and the exotic alloys inside them.', up: ['boeing', 'airbus', 'ge_aerospace', 'rtx', 'amadeus'] }),
N('united', 'travel', 'United Airlines', { d: 'united.com', q: 'UAL', w: 'Major US airline; rolling out Starlink Wi-Fi across its fleet.', y: 'A direct customer of satellite internet and of the aerospace chain.', up: ['boeing', 'airbus', 'ge_aerospace', 'starlink', 'amadeus'] }),
N('carnival', 'travel', 'Carnival', { d: 'carnival.com', q: 'CCL', w: 'World\'s largest cruise company; cruise lines rely on satellite internet.', y: 'Ships are floating customers for Starlink.', up: ['starlink'] }),
N('amadeus', 'travel', 'Amadeus', { d: 'amadeus.com', q: 'AMS.MC', w: 'Booking and airline IT backbone that powers much of global travel distribution.', y: 'Plumbing most travellers never see.', up: ['azure'] }),

/* ---- EDUCATION ---- */
N('duolingo', 'edu', 'Duolingo', { d: 'duolingo.com', q: 'DUOL', w: 'Language-learning app with AI tutors and conversation practice.', y: 'Leans on AI heavily, and its stock swings with debates about AI replacing learning.', up: ['openai', 'aws'] }),
N('coursera', 'edu', 'Coursera', { d: 'coursera.org', q: 'COUR', w: 'Online courses and degrees from universities and companies.', y: 'Competing with free AI tutors by leaning on credentials.' }),
N('khan', 'edu', 'Khan Academy', { d: 'khanacademy.org', s: 'Non-profit', w: 'Free lessons and the Khanmigo AI tutor, built with OpenAI.', y: 'The clearest example of an AI tutor designed to guide rather than give answers.', up: ['openai', 'azure'] }),
N('chegg', 'edu', 'Chegg', { d: 'chegg.com', q: 'CHGG', w: 'Homework-help subscription business.', y: 'A cautionary tale: its traffic and subscribers fell as students turned to chatbots.', p: 'Shares fell dramatically after generative AI arrived, with major layoffs.' }),
N('pearson', 'edu', 'Pearson', { d: 'pearson.com', q: 'PSO', w: 'Education publisher and assessment company, adding AI study tools.', y: 'Incumbent trying to turn content into AI products.', up: ['aws', 'gcloud'] }),
N('instructure', 'edu', 'Instructure (Canvas)', { d: 'instructure.com', s: 'Private (KKR)', w: 'Canvas learning-management system used by many schools and universities; partnered with OpenAI.', y: 'The software where assignments live, so a key gateway for AI in classrooms.', up: ['openai', 'aws'] }),
N('grammarly', 'edu', 'Grammarly (Superhuman)', { d: 'grammarly.com', s: 'Private', w: 'Writing assistant with AI features used by students and professionals.', y: 'Writing help was one of the first mainstream AI products.' }),

/* ---- AGRI ---- */
N('sysco', 'agri', 'Sysco', { d: 'sysco.com', q: 'SYY', w: 'Largest US foodservice distributor, supplying restaurants and hospitals.', y: 'The warehouse-and-truck layer between farms and restaurants.', up: ['tyson', 'cargill', 'adm'] }),
N('usfoods', 'agri', 'US Foods', { d: 'usfoods.com', q: 'USFD', w: 'Major US foodservice distributor.', y: 'Another key link from producers to restaurants.', up: ['tyson', 'cargill', 'adm'] }),
N('tyson', 'agri', 'Tyson Foods', { d: 'tysonfoods.com', q: 'TSN', w: 'One of the largest US meat and poultry processors.', y: 'Depends on grain, water and farm machinery.', up: ['adm', 'cargill', 'water'] }),
N('adm', 'agri', 'Archer-Daniels-Midland (ADM)', { d: 'adm.com', q: 'ADM', w: 'Global grain trader and processor.', y: 'Moves and processes the crops that become feed, oil and sweeteners.', up: ['deere', 'corteva'] }),
N('cargill', 'agri', 'Cargill', { d: 'cargill.com', s: 'Private (family-owned)', w: 'One of the world\'s largest private companies, trading and processing food and farm commodities.', y: 'Hidden giant of the food supply chain.', up: ['deere', 'corteva'] }),
N('deere', 'agri', 'Deere & Company', { d: 'deere.com', q: 'DE', w: 'Tractors and combines with computer-vision spraying and autonomy.', y: 'A tractor is now a robot, and precision farming runs on NVIDIA chips and satellite data.', p: 'Farm equipment is cyclical; the AI story is about precision and labour savings.', o: 'Ag-tech is a real frontier: sensors, imagery and autonomy cut chemical use and labour.', up: ['nvidia', 'planet'], c: 1 }),
N('corteva', 'agri', 'Corteva', { d: 'corteva.com', q: 'CTVA', w: 'Seeds and crop-protection chemicals.', y: 'Genetics decides yield, and AI is speeding up crop breeding.', up: ['water'] }),
N('nutrien', 'agri', 'Nutrien', { d: 'nutrien.com', q: 'NTR', w: 'World\'s largest potash producer, plus fertiliser retail.', y: 'No fertiliser, no crop. Potash comes from a handful of countries.', up: ['potash_fertilizer'], c: 1 }),
N('mosaic', 'agri', 'Mosaic', { d: 'mosaicco.com', q: 'MOS', w: 'Phosphate and potash fertiliser producer.', y: 'Phosphate is another scarce farm input.', up: ['potash_fertilizer'] }),
N('cf_industries', 'agri', 'CF Industries', { d: 'cfindustries.com', q: 'CF', w: 'Nitrogen fertiliser producer that uses natural gas as feedstock.', y: 'Links natural gas prices directly to food prices.', up: ['potash_fertilizer'] }),

/* ---- AI-training gig work (labs layer) ---- */
N('mercor', 'labs', 'Mercor', { d: 'mercor.com', s: 'Private', w: 'Marketplace that pays experts (doctors, lawyers, engineers) to train and evaluate AI models.', y: 'A fast-growing example of AI creating new paid work: expert contractors teaching models.', p: 'Reported valuation around $10B in late 2025.', o: 'If you have professional expertise, this is paid work today, and a sign of where demand for human knowledge is going.', up: ['aws'] }),
N('surge_ai', 'labs', 'Surge AI', { d: 'surgehq.ai', s: 'Private', w: 'High-quality human data and evaluation for labs, largely bootstrapped.', y: 'Part of the quiet industry of humans who make models better.', up: [] }),

/* ---- raw: fertiliser ---- */
N('potash_fertilizer', 'raw', 'Potash, phosphate & nitrogen', { e: '🌱', s: 'Commodities', w: 'The three macronutrients behind modern farming, mined or made from natural gas.', y: 'A small number of countries and companies supply most of the world\'s fertiliser, so a supply shock raises food prices everywhere.' }),

/* ---- aerospace suppliers used by airlines (rocket layer) ---- */
N('ge_aerospace', 'rocket', 'GE Aerospace', { d: 'geaerospace.com', q: 'GE', w: 'Jet engines (alone and via CFM with Safran) for most commercial airliners.', y: 'One of two or three companies that can build a modern airliner engine.', up: ['ati', 'howmet'], c: 1 }),
N('rtx', 'rocket', 'RTX (Pratt & Whitney, Collins)', { d: 'rtx.com', q: 'RTX', w: 'Pratt & Whitney engines, Collins avionics and Raytheon defence systems.', y: 'Another of the few makers of jet engines and cockpit electronics.', up: ['ati', 'howmet'] })
];

/* ---------------- guided journeys ---------------- */
const JOURNEYS = [
  { id: 'food', title: 'Your burger → the chip in a tractor',
    blurb: 'Follow a meal from the drive-through back to the farm, and to the GPUs steering the tractor.',
    steps: [
      ['you_food', 'You order a burger.'],
      ['mcdonalds', 'McDonald\'s runs ordering and kitchen systems with AI, and buys meat and ingredients at huge scale.'],
      ['tyson', 'Meat comes from processors like Tyson.'],
      ['adm', 'They buy feed grain from traders such as ADM.'],
      ['deere', 'Grain comes from farms running Deere machines, now robots with computer vision.'],
      ['nvidia', 'Those tractors run on NVIDIA chips.'],
      ['tsmc', 'And TSMC makes the chips, so a burger depends on Taiwan.']
    ] },
  { id: 'travel', title: 'Your flight → the alloys inside a jet engine',
    blurb: 'From a seat on a plane to the exotic metals in its engines.',
    steps: [
      ['you_travel', 'You book a flight.'],
      ['united', 'United flies it, and is rolling out Starlink Wi-Fi.'],
      ['ge_aerospace', 'Its engines come from one of very few makers, such as GE Aerospace.'],
      ['ati', 'Jet engines are built from specialty titanium and nickel alloys made by suppliers like ATI.']
    ] },
  { id: 'gig', title: 'Your gig shift → the robotaxi that might replace it',
    blurb: 'A driver\'s app, a competitor with no driver, and the chips beneath both.',
    steps: [
      ['you_gig', 'You pick up a driving shift.'],
      ['uber', 'Uber\'s app matches you to riders with AI.'],
      ['waymo', 'Uber also partners with Waymo, whose cars have no driver.'],
      ['google_tpu', 'Waymo\'s models are trained on Google\'s TPU chips.'],
      ['tsmc', 'TSMC makes those chips.']
    ] },
  { id: 'edu', title: 'Your language lesson → NVIDIA',
    blurb: 'A Duolingo streak and the GPUs behind the AI tutor.',
    steps: [
      ['you_edu', 'You practise a language with an app.'],
      ['duolingo', 'Duolingo\'s AI tutor runs on large models.'],
      ['openai', 'It uses models from OpenAI.'],
      ['nvidia', 'OpenAI trains and serves them on NVIDIA GPUs.'],
      ['tsmc', 'Made by TSMC.']
    ] },
  { id: 'amazon', title: 'Your Amazon order → a quartz mine',
    blurb: 'Follow a single purchase from a recommendation to the sand inside the chip that made it.',
    steps: [
      ['you_shop', 'You tap "buy" on something a recommendation engine put in front of you.'],
      ['amazon', 'Amazon earns the sale, runs the marketplace, and pays for the AI behind search, ads and delivery.'],
      ['aws', 'All of that runs on AWS, Amazon\'s own cloud, which doubles as its biggest profit engine.'],
      ['aws_trainium', 'Part of the AI work runs on Amazon\'s custom Trainium chips.'],
      ['tsmc', 'Those chips are made by TSMC.'],
      ['sumco', 'TSMC starts with silicon wafers from companies like SUMCO.'],
      ['crucible', 'Wafers are sliced from a crystal that grows inside a quartz crucible.'],
      ['quartz_corp', 'That crucible needs some of the purest quartz on Earth, from a few mines in North Carolina and Norway.']
    ] },
  { id: 'feed', title: 'Your YouTube feed → tin in EUV light',
    blurb: 'Why scrolling is really a bet on TPUs, TSMC and a laser that vaporises tin.',
    steps: [
      ['you_scroll', 'You open an app and swipe. Advertisers, not you, pay for it.'],
      ['youtube', 'YouTube\'s recommendation engine decides what plays next, and it is a major compute customer.'],
      ['google_tpu', 'It runs on Google\'s own TPU chips.'],
      ['tsmc', 'TPUs are manufactured by TSMC.'],
      ['asml', 'TSMC\'s leading-edge fabs depend on ASML\'s EUV machines.'],
      ['tin_tungsten', 'Each EUV machine makes its light by zapping tiny tin droplets with a laser, so a metal that also goes in solder ends up inside your phone\'s chip.']
    ] },
  { id: 'paycheck', title: 'Your paycheck → copper in a cooling unit',
    blurb: 'Follow the money that pays you, down to the metal in the machines that process it.',
    steps: [
      ['you_paycheck', 'Your employer pays you, usually via a payroll company.'],
      ['adp', 'Payroll firms like ADP calculate pay, taxes and benefits.'],
      ['jpm', 'The money moves through banks such as JPMorgan.'],
      ['aws', 'Banks increasingly run on cloud providers like AWS.'],
      ['vertiv', 'AWS data centres rely on cooling and power gear from firms like Vertiv.'],
      ['freeport', 'That gear is full of copper, so the chain ends at a mine.']
    ] },
  { id: 'health', title: 'Your doctor\'s chart → the EUV machine',
    blurb: 'From a medical record to the lithography tool that prints the chips behind it.',
    steps: [
      ['you_health', 'You visit a doctor.'],
      ['epic', 'Your record sits in Epic, the system used by most large US hospitals.'],
      ['azure', 'Epic\'s generative AI features run on Microsoft Azure.'],
      ['nvidia', 'Azure serves them with NVIDIA GPUs.'],
      ['tsmc', 'TSMC makes those GPUs.'],
      ['asml', 'And only ASML can build the machines TSMC prints them with.']
    ] },
  { id: 'claude', title: 'Ask Claude a question → the glass inside ASML',
    blurb: 'Trace a prompt through cloud and chips to the mirrors that print them.',
    steps: [
      ['you_ai', 'You ask an AI assistant a question.'],
      ['anthropic', 'Anthropic runs Claude across several clouds and chip types.'],
      ['aws', 'AWS is one of its compute providers, and a heavy investor.'],
      ['aws_trainium', 'Part of the work runs on Amazon\'s own Trainium chips.'],
      ['tsmc', 'Those chips are made by TSMC.'],
      ['asml', 'TSMC\'s leading-edge fabs depend on ASML\'s EUV machines. ASML is the only supplier.'],
      ['zeiss', 'Each ASML machine contains mirrors from Zeiss, polished to atomic smoothness.'],
      ['schott', 'Those mirrors are built on ultra-stable glass-ceramic from SCHOTT.']
    ] },
  { id: 'power', title: 'A ChatGPT prompt → a copper mine',
    blurb: 'Follow the electricity: from a prompt to a gas turbine to copper.',
    steps: [
      ['you_ai', 'You send a prompt.'],
      ['openai', 'OpenAI serves it from capacity it rents from partners.'],
      ['stargate', 'Part of that capacity is the Stargate programme.'],
      ['crusoe', 'Crusoe builds the Abilene campus: a gigawatt-scale data centre.'],
      ['ge_vernova', 'It needs on-site gas turbines, and slots are sold out for years.'],
      ['freeport', 'Turbines, transformers and cables all need copper from mines like Freeport\'s.']
    ] },
  { id: 'retire', title: 'Your 401(k) → copper in a data-centre cabinet',
    blurb: 'See how retirement savings quietly finance physical infrastructure.',
    steps: [
      ['you_retire', 'You contribute to an index fund or pension.'],
      ['blackstone', 'Asset managers such as Blackstone invest that money in infrastructure.'],
      ['qts', 'Blackstone owns data-centre developer QTS.'],
      ['vertiv', 'QTS buys cooling and power gear from firms like Vertiv.'],
      ['freeport', 'Vertiv\'s gear needs copper, so the chain ends in a mine.']
    ] },
  { id: 'starlink', title: 'Satellite internet → rocket alloys',
    blurb: 'From a farm with no fibre to the metals in a rocket engine.',
    steps: [
      ['you_connect', 'A farm, ship or plane gets broadband from orbit.'],
      ['starlink', 'Starlink provides the service.'],
      ['spacex', 'SpaceX launches and builds the satellites, mostly in-house.'],
      ['ati', 'Rockets rely on specialty titanium and nickel alloys from suppliers like ATI.']
    ] }
];


/* ---- resolve layers: legacy numeric indices map via OLD; MOVE re-homes nodes ---- */
const OLD = ['you', 'apps', 'devices', 'labs', 'cloud', 'capital', 'dc', 'energy', 'systems', 'chips', 'fabs', 'equip', 'parts', 'materials', 'space', 'rocket', 'raw'];
const MOVE = { uber: 'gig', doordash: 'gig', spotify: 'social', netflix: 'social', meta: 'social', google: 'social', bytedance: 'social', perplexity: 'social', microsoft: 'work', adobe: 'work', palantir: 'work', cursor: 'work', amazon: 'shop', visa: 'money', mastercard: 'money', robinhood: 'money', waymo: 'devices', oura: 'health' };
NODES.forEach(function (n) {
  var k = typeof n.l === 'number' ? OLD[n.l] : n.l;
  if (MOVE[n.id]) k = MOVE[n.id];
  n.l = LAYERS.findIndex(function (L) { return L.id === k; });
});

return { LAYERS, NODES, JOURNEYS, ZONES };
})();
