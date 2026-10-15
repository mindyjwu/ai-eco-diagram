/* ============================================================
   What flows along each link.
   Every link is "buyer depends on supplier". The label says what the
   supplier provides, so it reads: buyer <- supplier: product.
   - SUPPLIES: the usual product of each supplier (covers most links)
   - PAIRS:    exceptions for one specific buyer and supplier
   - capital providers: a link from a capital provider to a company
     means "funds", so those are written as "Capital for ..."
   Typical, simplified relationships, not contracts. Facts reflect my
   knowledge to roughly mid-2026.
   ============================================================ */
(function () {
  var D = window.AIMAP, NODES = D.NODES, LAYERS = D.LAYERS;
  var by = {}; NODES.forEach(function (n) { by[n.id] = n; });

  var SUPPLIES = {
    /* clouds and labs */
    gcloud: 'Cloud compute, storage and TPUs', aws: 'Cloud compute, storage and Trainium', meta_infra: 'Meta\'s own AI data-centre fleet', azure: 'Cloud compute and OpenAI models',
    oracle: 'Cloud compute (OCI)', coreweave: 'Rented GPU clusters', stargate: 'Planned AI data-centre capacity', crusoe: 'GPU cloud and data-centre sites',
    recsys: 'Ranking, recommendation and risk models', meta_ai: 'Llama open-weight models', deepmind: 'Gemini models and research', openai: 'GPT models and ChatGPT', anthropic: 'Claude models',
    scale_ai: 'Labelled training data', mercor: 'Expert human data and evaluation', surge_ai: 'Human-labelled training data', xai: 'Grok models', alibaba: 'Qwen models and cloud',
    /* chip designers and design tools */
    google_tpu: 'TPU accelerators', nvidia: 'GPUs, networking and CUDA software', apple_si: 'Apple-designed chips', broadcom: 'Custom AI chips and networking silicon', qualcomm: 'Phone and edge chips',
    mediatek: 'Phone and device chips', amd: 'GPUs and CPUs', aws_trainium: 'Trainium AI chips', huawei: 'Ascend AI chips', intel: 'CPUs and Gaudi accelerators', marvell: 'Custom chips and optical DSPs',
    synopsys: 'Chip design software (EDA)', cadence: 'Chip design software (EDA)', arm: 'Chip architecture licences',
    alchip: 'Custom AI chip design', guc: 'Custom chip design services', faraday: 'Chip IP and design services', realtek: 'Network and audio chips', novatek: 'Display driver chips',
    /* money */
    visa: 'Card payments network', mastercard: 'Card payments network', intuit: 'Tax and accounting software', jpm: 'Banking, cards and credit', bofa: 'Banking and cards', paypal: 'Online payments',
    block: 'Payments and Cash App', stripe: 'Online payment processing', affirm: 'Buy-now-pay-later credit', robinhood: 'Retail brokerage', schwab: 'Brokerage and retirement accounts', coinbase: 'Crypto exchange', fed: 'Interbank payment rails',
    /* servers and networking */
    foxconn: 'AI server assembly', corning: 'Optical fibre and glass', supermicro: 'AI servers and racks', dell: 'AI servers', arista: 'Data-centre switches', amphenol: 'Cables and connectors',
    coherent: 'Lasers for optical transceivers', lumentum: 'Lasers for optical links', innolight: 'Optical transceivers', delta_elec: 'Server power supplies and cooling', avc: 'Heat sinks and cooling parts', auras: 'Liquid-cooling cold plates',
    quanta_computer: 'AI server assembly', wiwynn: 'AI server assembly', wistron: 'AI server and board assembly', inventec: 'Server assembly', compal: 'Server and laptop assembly', accton: 'White-box network switches', lite_on: 'Server power supplies',
    hpe: 'Servers and networking', celestica: 'Server and network assembly', cisco: 'Networking equipment', credo: 'High-speed cable chips',
    /* space and raw */
    globalstar: 'Satellite connectivity', suncatcher: 'Space-based compute concept', starcloud: 'Orbital data-centre concept', spacex: 'Launch services', ula: 'Launch services', blueorigin: 'Launch services',
    arianespace: 'Launch services', planet: 'Earth-imaging data', rocketlab: 'Small-satellite launch', starlink: 'Satellite broadband', ast: 'Direct-to-phone satellite service',
    mp_materials: 'Rare-earth oxides and magnets', freeport: 'Copper', china_gallium: 'Gallium, germanium and rare-earth refining', water: 'Fresh water', neon_helium: 'Neon and helium gases',
    tin_tungsten: 'Tin and tungsten', ferroglobe: 'Silicon metal', sibelco: 'High-purity quartz', quartz_corp: 'High-purity quartz', potash_fertilizer: 'Fertiliser inputs',
    /* fabs, memory, packaging, test */
    samsung_mem: 'HBM and DRAM memory', samsung_foundry: 'Contract chip manufacturing', tsmc: 'Leading-edge wafers and advanced packaging', sk_hynix: 'HBM and DRAM memory', micron: 'HBM and DRAM memory',
    ase: 'Chip packaging and test', amkor: 'Chip packaging and test', intel_foundry: 'Contract chip manufacturing', smic: 'Contract chip manufacturing', kyec: 'Chip testing services', umc: 'Mature-node wafers',
    vis: 'Mature-node wafers', psmc: 'Wafers and memory', nanya: 'DRAM memory', winbond: 'Specialty memory', macronix: 'NOR flash memory', globalfoundries: 'Contract chip manufacturing', rapidus: 'Planned 2nm contract manufacturing',
    /* capital */
    softbank: 'Funding', vc: 'Venture funding', apollo: 'Private credit', blackstone: 'Infrastructure equity', blue_owl: 'Data-centre financing', mgx: 'Sovereign-backed funding', blackrock: 'Infrastructure investment', brookfield: 'Infrastructure equity',
    /* energy and data centres */
    tesla_energy: 'Battery storage', talen: 'Nuclear power', dominion: 'Grid power', constellation: 'Nuclear power', nextera: 'Renewable and grid power', ge_vernova: 'Gas turbines and grid gear', williams: 'Natural gas supply',
    vistra: 'Power generation', oklo: 'Small nuclear reactors', bloom: 'On-site fuel-cell power', cameco: 'Uranium fuel', first_solar: 'Solar panels', hitachi_energy: 'Transformers and grid equipment', quanta: 'Grid and substation construction',
    siemens_energy: 'Gas turbines and grid gear', taipower: 'Grid electricity',
    vertiv: 'Cooling and power systems', digital_realty: 'Data-centre space', qts: 'Data-centre space', equinix: 'Colocation data-centre space', vantage: 'Data-centre space', schneider: 'Power distribution and cooling',
    eaton: 'Power distribution and switchgear', abb: 'Electrical gear', caterpillar: 'Backup generators', trane: 'Cooling systems', jci: 'Cooling and controls', cummins: 'Backup generators', modine: 'Cooling systems',
    /* chip equipment */
    asml: 'EUV and DUV lithography machines', applied_materials: 'Deposition, etch and inspection tools', lam: 'Etch and deposition tools', tokyo_electron: 'Coater-developers and etch tools', kla: 'Inspection and metrology tools',
    advantest: 'Chip test systems', teradyne: 'Chip test systems', lasertec: 'Mask inspection tools', disco: 'Wafer dicing and grinding tools', gptc: 'Wet-process packaging tools', scientech: 'Wet-process packaging tools',
    all_ring: 'Packaging automation tools', chroma: 'Test and measurement systems', besi: 'Chip bonding equipment', asm_intl: 'Deposition tools', zeiss: 'EUV mirrors and optics', trumpf: 'Lasers for EUV light',
    /* materials */
    shin_etsu: 'Silicon wafers and photoresist materials', sumco: 'Silicon wafers', entegris: 'Filters, pods and process chemicals', linde: 'Industrial gases', air_liquide: 'Industrial gases', jsr: 'Photoresists', tok: 'Photoresists',
    fujifilm: 'Photoresists and process chemicals', dupont: 'Specialty chemicals and polishing pads', merck_kgaa: 'Specialty chemicals', ajinomoto: 'ABF substrate film', ibiden: 'Package substrates', photronics: 'Photomasks', sas: 'Silicon wafers',
    taiwan_mask: 'Photomasks', globalwafers: 'Silicon wafers', unimicron: 'Package substrates', resonac: 'Chemicals and packaging materials', schott: 'Specialty glass', crucible: 'Quartz crucibles', wacker: 'Polysilicon',
    nittobo: 'Glass cloth for substrates', hoya: 'EUV mask blanks', kinsus: 'Package substrates', nanya_pcb: 'Package substrates', emc: 'Circuit-board laminates',
    /* precision parts */
    gudeng: 'Photomask pods', marketech: 'Fab gas and chemical systems', uis: 'Cleanroom construction', vat: 'Vacuum valves', edwards: 'Vacuum pumps', mks: 'Gas flow, power and vacuum parts',
    advanced_energy: 'Power supplies for chip tools', ichor: 'Gas and liquid delivery modules', ucts: 'Gas delivery subsystems', coorstek: 'Ceramic parts for chip tools', ferrotec: 'Quartz and ceramic parts', swagelok: 'Valves and fluid fittings',
    /* aerospace */
    ati: 'Titanium and nickel alloys', howmet: 'Engine and airframe castings', hexcel: 'Carbon fibre', toray: 'Carbon fibre', l3harris: 'Rocket engines', northrop: 'Solid rocket motors', moog: 'Flight controls',
    honeywell: 'Avionics and components', airbus: 'Satellites and launchers', boeing: 'Satellites and spacecraft', lockheed: 'Spacecraft and missiles', spectrolab: 'Space solar cells', ge_aerospace: 'Jet engines', rtx: 'Engines and avionics',
    /* everyday companies (what they give you) */
    amazon: 'Shopping, delivery and Prime', walmart: 'Groceries and general goods', shopify: 'Online store software', temu: 'Low-cost goods marketplace', costco: 'Bulk groceries and goods', ups: 'Parcel delivery', fedex: 'Parcel delivery',
    doordash: 'Delivery orders and drivers', uber: 'Rides and delivery', instacart: 'Grocery delivery', lyft: 'Rides', upwork: 'Freelance marketplace', fiverr: 'Freelance marketplace',
    ikea: 'Furniture and home goods', sony: 'Consoles, cameras and sensors', nintendo: 'Game consoles', essilor: 'Eyewear and smart glasses', apple: 'iPhones, Macs and services', amazon_devices: 'Echo, Kindle and Ring',
    nest: 'Pixel phones and Nest devices', samsung: 'Phones, TVs and appliances', signify: 'Smart lighting', sonos: 'Smart speakers', eightsleep: 'Smart mattress covers', lg: 'Appliances and displays', tesla: 'Cars and robotaxi tech', waymo: 'Robotaxi rides', xiaomi: 'Phones and smart devices',
    youtube: 'Video and ads', bytedance: 'Short video and ads', meta: 'Social apps and ads', google: 'Search and ads', snap: 'Messaging and ads', reddit: 'Forums', pinterest: 'Visual discovery', x_twitter: 'Social feed',
    perplexity: 'AI search', netflix: 'Streaming video', disney: 'Streaming and parks', spotify: 'Music and podcasts', roblox: 'Games platform', applovin: 'Mobile ad technology', trade_desk: 'Ad buying platform',
    microsoft: 'Office, Windows and Copilot', adp: 'Payroll', paychex: 'Payroll', workday: 'HR and payroll software', gusto: 'Payroll for small firms', rippling: 'HR and payroll software', deel: 'Global payroll',
    gworkspace: 'Docs, Gmail and Meet', salesforce: 'CRM software', servicenow: 'Workflow software', zoom: 'Video meetings', atlassian: 'Jira and Confluence', sap: 'Business software', adobe: 'Creative software',
    cursor: 'AI coding assistant', palantir: 'Data analytics platforms',
    whoop: 'Fitness wearables', oura: 'Smart rings', garmin: 'Wearables', unitedhealth: 'Health insurance and care', cvs: 'Pharmacy and insurance', epic: 'Medical records software', abridge: 'AI clinical notes',
    teladoc: 'Telehealth visits', hims: 'Telehealth and prescriptions', doximity: 'Doctor network and tools', tempus: 'AI diagnostics and data', recursion: 'AI drug discovery', isomorphic: 'AI drug design',
    lilly: 'GLP-1 and other drugs', novo: 'GLP-1 drugs and insulin', pfizer: 'Vaccines and medicines', moderna: 'mRNA vaccines', regeneron: 'Antibody drugs',
    illumina: 'DNA sequencers', thermo: 'Lab instruments and consumables', danaher: 'Bioprocess equipment and diagnostics', agilent: 'Lab instruments', bruker: 'NMR and mass-spec instruments', waters: 'Chromatography instruments',
    west: 'Stoppers, plungers and seals', lonza: 'Contract drug manufacturing', sartorius: 'Filters and single-use bags', samsung_bio: 'Contract drug manufacturing', wuxi: 'Contract research and manufacturing',
    kroger: 'Groceries', starbucks: 'Coffee and food', mcdonalds: 'Fast food', chipotle: 'Fast-casual food', dominos: 'Pizza delivery', yum: 'KFC, Taco Bell and Pizza Hut', toast: 'Restaurant software',
    booking: 'Hotel and travel booking', airbnb: 'Stays', expedia: 'Travel booking', marriott: 'Hotels', hilton: 'Hotels', delta: 'Flights', united: 'Flights', carnival: 'Cruises', amadeus: 'Airline booking systems',
    duolingo: 'Language lessons', coursera: 'Online courses', khan: 'Free lessons and tutoring', chegg: 'Study help', pearson: 'Courses and testing', instructure: 'Canvas learning software', grammarly: 'Writing assistant',
    tyson: 'Meat and poultry', cargill: 'Grain and food ingredients', adm: 'Grains and oilseeds', deere: 'Farm machinery', corteva: 'Seeds and crop chemicals', nutrien: 'Potash and fertiliser', mosaic: 'Phosphate and potash',
    cf_industries: 'Nitrogen fertiliser', sysco: 'Food distribution', usfoods: 'Food distribution', sibelco_: ''
  };
  delete SUPPLIES.sibelco_;

  /* exceptions: 'buyer>supplier' */
  var PAIRS = {
    'tsmc>ase': 'Overflow packaging (CoWoS steps) and test', 'tsmc>kyec': 'Final test of finished chips', 'tsmc>taipower': 'Electricity for fabs', 'tsmc>water': 'Ultrapure water',
    'tsmc>neon_helium': 'Neon for lithography lasers, helium for cooling', 'tsmc>globalwafers': 'Silicon wafers', 'tsmc>gudeng': 'EUV photomask pods', 'tsmc>marketech': 'Fab gas and chemical systems',
    'tsmc>uis': 'Cleanroom and fab facility construction', 'tsmc>ibiden': 'Package substrates for CoWoS', 'tsmc>ajinomoto': 'ABF film used in package substrates',
    'nvidia>tsmc': 'GPU wafers and CoWoS packaging', 'amd>tsmc': 'AI chip wafers and CoWoS packaging', 'broadcom>tsmc': 'AI chip wafers and CoWoS packaging', 'google_tpu>tsmc': 'TPU wafers and CoWoS packaging',
    'aws_trainium>tsmc': 'Trainium wafers and packaging', 'marvell>tsmc': 'Custom AI chip wafers and packaging', 'apple_si>tsmc': 'Leading-edge wafers for Apple chips', 'qualcomm>tsmc': 'Leading-edge phone-chip wafers',
    'nvidia>sk_hynix': 'HBM3E and HBM4 memory stacks', 'nvidia>micron': 'HBM memory stacks', 'nvidia>samsung_mem': 'HBM memory stacks', 'nvidia>ase': 'Packaging and test', 'nvidia>amkor': 'Packaging and test',
    'nvidia>synopsys': 'Chip design software', 'nvidia>cadence': 'Chip design software', 'nvidia>arm': 'CPU architecture for Grace and Vera chips',
    'asml>zeiss': 'EUV mirrors and optics', 'asml>trumpf': 'CO2 laser for the EUV light source', 'asml>vat': 'Vacuum valves', 'asml>edwards': 'Vacuum pumps', 'asml>mks': 'Sensors and power parts', 'asml>tin_tungsten': 'Tin droplets (EUV light) and tungsten',
    'kinsus>ajinomoto': 'ABF insulating film', 'kinsus>nittobo': 'Glass cloth', 'nanya_pcb>ajinomoto': 'ABF insulating film', 'nanya_pcb>nittobo': 'Glass cloth', 'unimicron>ajinomoto': 'ABF insulating film', 'unimicron>nittobo': 'Glass cloth',
    'ibiden>ajinomoto': 'ABF insulating film', 'ibiden>nittobo': 'Glass cloth', 'emc>nittobo': 'Glass cloth for laminates',
    'sas>crucible': 'Quartz crucibles for crystal growth', 'sas>wacker': 'Polysilicon', 'globalwafers>wacker': 'Polysilicon', 'sumco>crucible': 'Quartz crucibles for crystal growth', 'taiwan_mask>hoya': 'Mask blanks',
    'kyec>advantest': 'Chip test systems', 'kyec>teradyne': 'Chip test systems', 'kyec>chroma': 'Test and measurement systems',
    'lilly>nvidia': 'GPUs for AI drug discovery', 'lilly>lonza': 'Contract manufacturing capacity', 'moderna>lonza': 'mRNA drug-substance manufacturing', 'regeneron>illumina': 'Sequencing for genetics research', 'tempus>illumina': 'Sequencers for patient data',
    'openai>azure': 'Training and inference compute', 'openai>oracle': 'Compute capacity (Stargate)', 'openai>coreweave': 'Rented GPU capacity', 'openai>stargate': 'Planned data-centre capacity',
    'anthropic>aws': 'Trainium compute and cloud', 'anthropic>gcloud': 'TPU compute', 'anthropic>azure': 'GPU compute'
  };

  /* defaults by layer pair, for what a supplier's usual product does not cover */
  var LAYER_PAIRS = {
    'you>capital': 'Invests your savings', 'devices>fabs': 'Chips and memory for devices', 'devices>chips': 'Chip designs and processors', 'devices>space': 'Satellite connectivity',
    'travel>rocket': 'Aircraft, engines and parts', 'travel>space': 'Satellite connectivity and navigation', 'cloud>capital': 'Funding for data centres', 'labs>capital': 'Funding for AI labs'
  };

  D.FLOW = function (buyerId, supplierId) {
    var b = by[buyerId], s = by[supplierId];
    if (!b || !s) return '';
    var lb = LAYERS[b.l].id, ls = LAYERS[s.l].id;
    if (PAIRS[buyerId + '>' + supplierId]) return PAIRS[buyerId + '>' + supplierId];
    if (lb === 'capital') return 'Capital for ' + s.n;
    if (ls === 'capital' && LAYER_PAIRS[lb + '>capital']) return LAYER_PAIRS[lb + '>capital'];
    if (LAYER_PAIRS[lb + '>' + ls]) return LAYER_PAIRS[lb + '>' + ls];
    return SUPPLIES[supplierId] || '';
  };
  D.FLOW_SPECIFIC = function (buyerId, supplierId) { return !!PAIRS[buyerId + '>' + supplierId]; };
})();
