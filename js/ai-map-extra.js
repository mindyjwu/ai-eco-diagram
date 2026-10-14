/* ============================================================
   Extra data layered on top of ai-map-data.js:
   - a Life sciences zone (3 layers) so there is a biotech view
   - headquarters country for every company
   - a plain-English reason for each bottleneck
   - the industry views (which part of the map to show)
   Facts reflect my knowledge to roughly mid-2026 and are
   qualitative: check live sources before relying on them.
   ============================================================ */
(function () {
  var D = window.AIMAP, LAYERS = D.LAYERS, NODES = D.NODES, ZONES = D.ZONES;
  var by = {}; NODES.forEach(function (n) { by[n.id] = n; });
  function li(id) { return LAYERS.findIndex(function (L) { return L.id === id; }); }

  /* ---------- life sciences: three new layers in a sixth zone ---------- */
  LAYERS.push(
    { id: 'bio', name: 'Drug makers & AI biology',
      sub: 'Companies that discover and sell medicines, and the AI labs speeding it up.',
      take: 'AI is now used to find drug targets, design proteins and read scans. It runs on the same GPUs as everything else.',
      build: 'Software and data for one narrow step (trial design, target discovery) beats a general platform.' },
    { id: 'biomfg', name: 'Biomanufacturing & consumables',
      sub: 'Contract factories and the filters, bags, glass and stoppers they use.',
      take: 'Capacity and a handful of consumables limit how fast new drugs reach patients.',
      build: 'Single-use equipment, faster process development and cheaper capacity outside the big hubs.' },
    { id: 'biotools', name: 'Lab tools & sequencing',
      sub: 'Instruments and reagents every lab and drug maker buys.',
      take: 'A few firms sell the machines and consumables that the whole industry runs on. Switching is slow because methods are validated on them.',
      build: 'Cheaper, faster or more accurate versions of one instrument or consumable.' }
  );
  ZONES.push({ id: 'life', name: 'Life sciences', sub: 'Drug makers, lab tools and biomanufacturing: where AI meets biology.', from: 'bio', to: 'biotools', h: 330, stops: [[326, 66, 60], [338, 62, 58], [350, 60, 58]] });

  var B = li('bio'), T = li('biotools'), M = li('biomfg');
  function add(id, l, n, o) { var x = Object.assign({ id: id, l: l, n: n, up: [] }, o); NODES.push(x); by[id] = x; }

  /* drug makers and AI biology */
  add('lilly', B, 'Eli Lilly', { d: 'lilly.com', q: 'LLY', s: 'Pharma', w: 'Maker of the GLP-1 drugs Mounjaro and Zepbound.', y: 'One of the biggest drug makers by value. It is spending heavily on AI for discovery and on new manufacturing sites.', p: 'Obesity and diabetes drugs drove very strong growth; capacity is the limit.', o: 'Public. Sells to anyone who can reach patients faster or cheaper, from trial software to cold-chain logistics.', up: ['thermo', 'danaher', 'west', 'schott', 'lonza', 'nvidia'] });
  add('novo', B, 'Novo Nordisk', { d: 'novonordisk.com', q: 'NVO', s: 'Pharma', w: 'Maker of Ozempic and Wegovy, and the biggest insulin supplier.', y: 'The other half of the GLP-1 duopoly. Injectable pens need glass, rubber and device parts at huge volume.', p: 'Fast growth, then pricing and competition pressure.', o: 'Public. Pens, plungers and fill-finish capacity are the pinch points.', up: ['west', 'schott', 'thermo', 'danaher', 'sartorius'] });
  add('pfizer', B, 'Pfizer', { d: 'pfizer.com', q: 'PFE', s: 'Pharma', w: 'Global drug maker, from vaccines to cancer medicines.', y: 'A large buyer of lab tools and contract manufacturing; an early mover on mRNA.', p: 'Post-COVID reset; leaning on cancer drugs and acquisitions.', o: 'Public. Buys manufacturing capacity and data tools at scale.', up: ['thermo', 'danaher', 'west', 'schott', 'sartorius', 'lonza'] });
  add('moderna', B, 'Moderna', { d: 'modernatx.com', q: 'MRNA', s: 'Biotech', w: 'Designs mRNA medicines and vaccines.', y: 'Shows how fast a digital design (the mRNA sequence) can become a drug.', p: 'Revenue fell after COVID; betting on cancer and rare-disease programmes.', o: 'Public. Software-defined drug design is the model many startups copy.', up: ['lonza', 'thermo', 'danaher', 'corning', 'schott'] });
  add('regeneron', B, 'Regeneron', { d: 'regeneron.com', q: 'REGN', s: 'Biotech', w: 'Antibody drugs for eye disease, allergy and cancer, plus a large genetics database.', y: 'Combines big sequencing data with drug discovery.', p: 'Steady growth from a few big products.', o: 'Public. Genetic data is the scarce input.', up: ['thermo', 'danaher', 'sartorius', 'west', 'schott', 'illumina'] });

  /* lab tools and sequencing */
  add('thermo', T, 'Thermo Fisher Scientific', { d: 'thermofisher.com', q: 'TMO', s: 'Life-science tools', w: 'The largest lab-tools company: instruments, reagents, plastics and contract services.', y: 'Almost every lab and drug maker buys from it.', p: 'Strong demand from drug makers, softer academic spending.', o: 'Public. Huge catalogue; niches in consumables and software are open to startups.', up: ['corning', 'linde', 'water'] });
  add('danaher', T, 'Danaher', { d: 'danaher.com', q: 'DHR', s: 'Life-science tools', w: 'Owns Cytiva (bioprocess), Beckman Coulter, SCIEX and Cepheid.', y: 'Cytiva filters and bioreactor bags are in most biologic drug factories.', p: 'Recovering as drug makers restock after destocking.', o: 'Public. A model for how consumables lock in customers.', up: ['corning', 'linde', 'water'] });
  add('illumina', T, 'Illumina', { d: 'illumina.com', q: 'ILMN', s: 'Life-science tools', c: true, w: 'Makes the DNA sequencers behind most genomic data.', y: 'Cheap sequencing is what makes AI on biology possible: no data, no model.', p: 'Growth slowed on weak China demand and competition.', o: 'Public. Sequencing cost and long-read alternatives are open fronts.', up: ['aws'] });
  add('agilent', T, 'Agilent', { d: 'agilent.com', q: 'A', s: 'Life-science tools', w: 'Instruments for chemistry, diagnostics and lab testing.', y: 'Used in quality control across drug and chip making.', p: 'Steady, tied to pharma and chemicals spending.', o: 'Public.', up: ['linde'] });
  add('bruker', T, 'Bruker', { d: 'bruker.com', q: 'BRKR', s: 'Life-science tools', w: 'NMR and mass-spectrometry instruments.', y: 'Its magnets need liquid helium, a supply that is hard to scale.', p: 'Hit by academic budget cuts.', o: 'Public.', up: ['neon_helium'] });
  add('waters', T, 'Waters', { d: 'waters.com', q: 'WAT', s: 'Life-science tools', w: 'Liquid chromatography and mass spectrometry for drug testing.', y: 'Every batch of medicine is tested on machines like these.', p: 'Steady pharma demand.', o: 'Public.', up: ['linde'] });

  /* biomanufacturing and consumables */
  add('lonza', M, 'Lonza', { d: 'lonza.com', q: 'LONN.SW', s: 'Contract manufacturer', w: 'Contract manufacturer of biologics, cell and gene therapies.', y: 'Drug makers rent its factories instead of building their own.', p: 'Buying capacity (a former Roche site in California).', o: 'Public. Capacity close to customers and faster tech transfer are wide open.', up: ['sartorius', 'danaher', 'thermo', 'schott', 'west', 'corning'] });
  add('samsung_bio', M, 'Samsung Biologics', { d: 'samsungbiologics.com', q: '207940.KS', s: 'Contract manufacturer', w: 'One of the world\'s largest biologics contract factories.', y: 'Korea is becoming a hub for drug manufacturing outside the US and China.', p: 'Rapid capacity growth.', o: 'Public.', up: ['sartorius', 'danaher', 'thermo', 'schott', 'west'] });
  add('wuxi', M, 'WuXi AppTec & Biologics', { d: 'wuxiapptec.com', q: '2359.HK', s: 'Contract manufacturer', w: 'Chinese contract research and manufacturing for global drug makers.', y: 'Many Western drug makers rely on it, so US lawmakers have pushed laws to reduce that dependence.', p: 'Still growing, with political risk.', o: 'Public. Non-China alternatives are an opening.', up: ['thermo', 'danaher', 'sartorius', 'west'] });
  add('sartorius', M, 'Sartorius', { d: 'sartorius.com', q: 'SRT3.DE', s: 'Bioprocess supplier', w: 'Filters, single-use bags and lab equipment for making biologic drugs.', y: 'One of a few firms (with Cytiva and Merck KGaA) supplying the whole industry.', p: 'Recovering after customers cut stock.', o: 'Public. Single-use and analytics are active startup areas.', up: ['water'] });
  add('west', M, 'West Pharmaceutical Services', { d: 'westpharma.com', q: 'WST', s: 'Drug-delivery components', c: true, w: 'Rubber stoppers, plungers and seals for injectable drugs.', y: 'Every vial and pen needs these. A shortage stalls the drug even if the drug is made.', p: 'Demand tied to injectables and GLP-1 growth.', o: 'Public. Quiet, sticky and hard to qualify, so entry takes years.', up: [] });

  /* move AI-bio companies out of consumer health, and wire patients to drugs */
  [['recursion', B], ['isomorphic', B], ['tempus', B]].forEach(function (p) { by[p[0]].l = p[1]; });
  by.tempus.up.push('illumina');
  by.you_health.up.push('lilly', 'novo', 'pfizer', 'moderna', 'regeneron');

  /* ---------- headquarters country (ISO-2; WW = no single country) ---------- */
  var HQ = {
    amazon: 'US', walmart: 'US', shopify: 'CA', temu: 'CN', costco: 'US', ups: 'US', fedex: 'US',
    spotify: 'SE', netflix: 'US', meta: 'US', google: 'US', bytedance: 'CN', perplexity: 'US', youtube: 'US', snap: 'US', reddit: 'US', pinterest: 'US', x_twitter: 'US', disney: 'US', roblox: 'US', applovin: 'US', trade_desk: 'US',
    microsoft: 'US', adobe: 'US', palantir: 'US', cursor: 'US', gworkspace: 'US', salesforce: 'US', servicenow: 'US', workday: 'US', adp: 'US', paychex: 'US', gusto: 'US', rippling: 'US', deel: 'US', zoom: 'US', atlassian: 'AU', sap: 'DE',
    doordash: 'US', uber: 'US', lyft: 'US', instacart: 'US', upwork: 'US', fiverr: 'IL',
    visa: 'US', mastercard: 'US', robinhood: 'US', jpm: 'US', bofa: 'US', paypal: 'US', block: 'US', stripe: 'US', schwab: 'US', affirm: 'US', coinbase: 'US', intuit: 'US', fed: 'US',
    oura: 'FI', whoop: 'US', garmin: 'CH', unitedhealth: 'US', cvs: 'US', epic: 'US', abridge: 'US', teladoc: 'US', hims: 'US', tempus: 'US', recursion: 'US', isomorphic: 'GB', doximity: 'US',
    kroger: 'US', starbucks: 'US', mcdonalds: 'US', chipotle: 'US', dominos: 'US', yum: 'US', toast: 'US',
    booking: 'US', airbnb: 'US', expedia: 'US', marriott: 'US', hilton: 'US', delta: 'US', united: 'US', carnival: 'US', amadeus: 'ES',
    duolingo: 'US', coursera: 'US', khan: 'US', chegg: 'US', pearson: 'GB', instructure: 'US', grammarly: 'US',
    waymo: 'US', apple: 'US', samsung: 'KR', tesla: 'US', nest: 'US', amazon_devices: 'US', sonos: 'US', signify: 'NL', ikea: 'SE', eightsleep: 'US', lg: 'KR', sony: 'JP', nintendo: 'JP', essilor: 'FR', xiaomi: 'CN',
    openai: 'US', anthropic: 'US', deepmind: 'GB', meta_ai: 'US', xai: 'US', mistral: 'FR', deepseek: 'CN', alibaba: 'CN', huggingface: 'US', scale_ai: 'US', recsys: 'WW', mercor: 'US', surge_ai: 'US',
    aws: 'US', azure: 'US', gcloud: 'US', oracle: 'US', coreweave: 'US', nebius: 'NL', crusoe: 'US', meta_infra: 'US', stargate: 'US',
    softbank: 'JP', blackstone: 'US', brookfield: 'CA', mgx: 'AE', blackrock: 'US', apollo: 'US', blue_owl: 'US', vc: 'US',
    equinix: 'US', digital_realty: 'US', qts: 'US', vantage: 'US', vertiv: 'US', schneider: 'FR', eaton: 'IE', abb: 'CH', trane: 'IE', jci: 'IE', modine: 'US', caterpillar: 'US', cummins: 'US',
    constellation: 'US', vistra: 'US', nextera: 'US', talen: 'US', dominion: 'US', oklo: 'US', cameco: 'CA', ge_vernova: 'US', siemens_energy: 'DE', bloom: 'US', first_solar: 'US', tesla_energy: 'US', hitachi_energy: 'CH', quanta: 'US', williams: 'US',
    sysco: 'US', usfoods: 'US', tyson: 'US', adm: 'US', cargill: 'US', deere: 'US', corteva: 'US', nutrien: 'CA', mosaic: 'US', cf_industries: 'US',
    foxconn: 'TW', quanta_computer: 'TW', wiwynn: 'TW', supermicro: 'US', dell: 'US', hpe: 'US', celestica: 'CA', arista: 'US', cisco: 'US', coherent: 'US', lumentum: 'US', innolight: 'CN', corning: 'US', credo: 'US', amphenol: 'US',
    nvidia: 'US', amd: 'US', broadcom: 'US', marvell: 'US', google_tpu: 'US', aws_trainium: 'US', apple_si: 'US', qualcomm: 'US', mediatek: 'TW', arm: 'GB', intel: 'US', cerebras: 'US', huawei: 'CN', synopsys: 'US', cadence: 'US',
    tsmc: 'TW', samsung_foundry: 'KR', intel_foundry: 'US', globalfoundries: 'US', smic: 'CN', rapidus: 'JP', sk_hynix: 'KR', samsung_mem: 'KR', micron: 'US', ase: 'TW', amkor: 'US',
    asml: 'NL', applied_materials: 'US', lam: 'US', tokyo_electron: 'JP', kla: 'US', advantest: 'JP', teradyne: 'US', disco: 'JP', lasertec: 'JP', besi: 'NL', asm_intl: 'NL', zeiss: 'DE', trumpf: 'DE',
    mks: 'US', advanced_energy: 'US', vat: 'CH', edwards: 'SE', ichor: 'US', ucts: 'US', swagelok: 'US', coorstek: 'US', ferrotec: 'JP',
    shin_etsu: 'JP', sumco: 'JP', globalwafers: 'TW', entegris: 'US', linde: 'GB', air_liquide: 'FR', jsr: 'JP', tok: 'JP', ajinomoto: 'JP', ibiden: 'JP', unimicron: 'TW', nittobo: 'JP', resonac: 'JP', dupont: 'US', merck_kgaa: 'DE', fujifilm: 'JP', photronics: 'US', hoya: 'JP', schott: 'DE', wacker: 'DE', crucible: 'WW',
    spacex: 'US', starlink: 'US', kuiper: 'US', rocketlab: 'US', blueorigin: 'US', ula: 'US', arianespace: 'FR', ast: 'US', planet: 'US', globalstar: 'US', starcloud: 'US', suncatcher: 'US', nasa: 'US', ussf: 'US',
    l3harris: 'US', northrop: 'US', hexcel: 'US', toray: 'JP', howmet: 'US', ati: 'US', moog: 'US', honeywell: 'US', lockheed: 'US', boeing: 'US', airbus: 'FR', spectrolab: 'US', ge_aerospace: 'US', rtx: 'US',
    sibelco: 'BE', quartz_corp: 'NO', ferroglobe: 'GB', freeport: 'US', mp_materials: 'US', china_gallium: 'CN', neon_helium: 'WW', water: 'WW', tin_tungsten: 'WW', potash_fertilizer: 'WW',
    lilly: 'US', novo: 'DK', pfizer: 'US', moderna: 'US', regeneron: 'US', thermo: 'US', danaher: 'US', illumina: 'US', agilent: 'US', bruker: 'US', waters: 'US', lonza: 'CH', samsung_bio: 'KR', wuxi: 'CN', sartorius: 'DE', west: 'US'
  };
  NODES.forEach(function (n) { if (HQ[n.id]) n.hq = HQ[n.id]; });

  /* where the physical stuff actually comes from (raw and shared inputs) */
  var GEO = {
    sibelco: 'Mines high-purity quartz in Norway and the US.',
    quartz_corp: 'Spruce Pine, North Carolina is the world\'s main source of the purest quartz.',
    china_gallium: 'China refines most of the world\'s gallium and germanium and most rare earths.',
    neon_helium: 'Neon came largely from Ukraine and Russia before 2022; helium from the US, Qatar and Russia.',
    water: 'Chip fabs and drug plants both use huge volumes of ultrapure water, which makes Taiwan\'s dry spells a risk.',
    tin_tungsten: 'China, Indonesia and Myanmar lead tin; China leads tungsten.',
    potash_fertilizer: 'Canada, Russia and Belarus lead potash.',
    crucible: 'Crucible-grade quartz comes mainly from Spruce Pine, North Carolina.',
    mp_materials: 'Runs the only large rare-earth mine in the US (Mountain Pass, California).',
    freeport: 'Copper mines in the US, Peru and Indonesia.'
  };
  Object.keys(GEO).forEach(function (id) { if (by[id]) by[id].geo = GEO[id]; });

  /* ---------- bottlenecks: why each one is hard to route around ---------- */
  var CHOKE = {
    nvidia: 'Sells most AI accelerators, and its CUDA software keeps customers on its chips. Alternatives exist, but rewriting software takes years.',
    arm: 'Its instruction set sits in nearly every phone chip and a growing share of server chips.',
    synopsys: 'With Cadence, supplies most of the software used to design advanced chips. No chip is finished without them.',
    cadence: 'With Synopsys, supplies most of the software used to design advanced chips.',
    tsmc: 'Makes most of the world\'s most advanced AI chips, almost all of it in Taiwan.',
    sk_hynix: 'Leads in HBM, the memory stacked beside every AI GPU. Only Samsung and Micron can follow.',
    asml: 'Without its EUV machines no one can make the most advanced chips, and there is no second supplier.',
    advantest: 'Dominant supplier of the machines that test AI chips before they ship.',
    lasertec: 'Near-monopoly on inspecting the masks used in EUV lithography.',
    zeiss: 'Sole maker of the mirrors and optics inside ASML\'s EUV machines.',
    trumpf: 'Makes the high-power laser that generates EUV light, sold essentially to ASML.',
    vat: 'Leading maker of the vacuum valves that chip tools depend on.',
    shin_etsu: 'With SUMCO, supplies over half the world\'s silicon wafers.',
    ajinomoto: 'Its ABF film is the insulating layer in nearly all advanced chip packages.',
    ibiden: 'One of a few makers of the substrates that carry AI chips, and capacity is tight.',
    nittobo: 'Dominant supplier of the specialty glass cloth in advanced package substrates. Shortages have slowed output.',
    hoya: 'Leading maker of the blanks used for EUV masks.',
    schott: 'Makes the ultra-stable glass-ceramic in lithography optics, and much of the world\'s pharmaceutical glass.',
    crucible: 'Ultra-pure quartz crucibles are needed to grow silicon crystals, and the purest quartz comes from one place.',
    china_gallium: 'China refines most gallium, germanium and rare earths and has restricted exports in the past.',
    quartz_corp: 'The purest quartz on Earth comes mainly from one area of North Carolina.',
    spacex: 'Flies most of the world\'s payload to orbit. Rivals are still ramping up.',
    ge_vernova: 'Gas turbines are sold out for years. It is a main limit on new data-centre power.',
    siemens_energy: 'Gas turbines are sold out for years, which limits new data-centre power.',
    hitachi_energy: 'Large power transformers have multi-year waits, which slows grid hookups.',
    illumina: 'Its sequencers produce most genomic data, the raw input for AI on biology.',
    west: 'Makes a large share of the stoppers and plungers for injectable drugs. A shortage stalls drugs that are otherwise ready.'
  };
  Object.keys(CHOKE).forEach(function (id) { if (by[id]) { by[id].c = true; by[id].cw = CHOKE[id]; } });

  /* ---------- country names ---------- */
  D.COUNTRIES = {
    US: 'United States', TW: 'Taiwan', JP: 'Japan', KR: 'South Korea', CN: 'China', NL: 'Netherlands', DE: 'Germany', GB: 'United Kingdom',
    CH: 'Switzerland', FR: 'France', IE: 'Ireland', CA: 'Canada', SE: 'Sweden', DK: 'Denmark', IL: 'Israel', AU: 'Australia',
    AE: 'UAE', ES: 'Spain', FI: 'Finland', BE: 'Belgium', NO: 'Norway', WW: 'Global / no single country'
  };

  /* ---------- industry views ----------
     seeds: layers (and extra ids) at the centre; the view also shows what they depend on, `depth` steps down. */
  var AI_GROUPS = [
    { name: 'Compute', ids: ['nvidia', 'amd', 'google_tpu', 'aws_trainium', 'broadcom', 'marvell', 'cerebras'] },
    { name: 'Memory', ids: ['sk_hynix', 'samsung_mem', 'micron'] },
    { name: 'Foundry & packaging', ids: ['tsmc', 'samsung_foundry', 'intel_foundry', 'ase', 'amkor', 'ajinomoto', 'ibiden', 'nittobo'] },
    { name: 'Chip tools', ids: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'kla', 'zeiss', 'trumpf'] },
    { name: 'Servers', ids: ['foxconn', 'quanta_computer', 'wiwynn', 'supermicro', 'dell', 'hpe', 'arista', 'cisco', 'credo', 'amphenol'] },
    { name: 'Optics', ids: ['coherent', 'lumentum', 'innolight', 'corning'] },
    { name: 'Power', ids: ['constellation', 'vistra', 'nextera', 'talen', 'dominion', 'oklo', 'bloom', 'first_solar', 'tesla_energy', 'cameco'] },
    { name: 'Grid gear', ids: ['ge_vernova', 'siemens_energy', 'hitachi_energy', 'schneider', 'eaton', 'abb', 'quanta'] },
    { name: 'Cooling & buildings', ids: ['vertiv', 'trane', 'jci', 'modine', 'equinix', 'digital_realty', 'qts', 'vantage'] },
    { name: 'Minerals & gases', ids: ['freeport', 'sibelco', 'quartz_corp', 'mp_materials', 'china_gallium', 'neon_helium', 'tin_tungsten', 'linde', 'air_liquide'] }
  ];
  D.VIEWS = [
    { id: 'all', name: 'Everything', blurb: 'The whole map, from household spending down to raw materials.' },
    { id: 'model', name: 'AI model', blurb: 'What it physically takes to train and run an AI model: chips, memory, servers, power, buildings and minerals.',
      layers: ['labs'], exclude: ['capital', 'space', 'rocket'], depth: 99, groups: AI_GROUPS },
    { id: 'semis', name: 'Semiconductors', blurb: 'From servers and chip designers through fabs, tools and materials to raw quartz.',
      layers: ['systems', 'chips', 'fabs', 'equip', 'parts', 'materials'], depth: 99 },
    { id: 'space', name: 'Space', blurb: 'Launch, satellites and aerospace suppliers, and the metals underneath.',
      layers: ['space', 'rocket'], depth: 99 },
    { id: 'power', name: 'Power & data centres', blurb: 'The buildings, electricity and cooling that AI runs on.',
      layers: ['dc', 'energy'], depth: 99 },
    { id: 'bio', name: 'Biotech', blurb: 'Drug makers, lab tools and contract factories, and the chips and glass they depend on.',
      layers: ['bio', 'biotools', 'biomfg'], extra: ['you_health'], depth: 2 }
  ];
})();
