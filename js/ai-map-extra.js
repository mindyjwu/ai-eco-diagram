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
  add('agilent', T, 'Agilent', { d: 'agilent.com', q: 'A', s: 'Life-science tools', w: 'Instruments for chemistry, diagnostics and lab testing.', y: 'Used in quality control across drug and chip making.', p: 'Steady, tied to pharma and chemicals spending.', up: ['linde'] });
  add('bruker', T, 'Bruker', { d: 'bruker.com', q: 'BRKR', s: 'Life-science tools', w: 'NMR and mass-spectrometry instruments.', y: 'Its magnets need liquid helium, a supply that is hard to scale.', p: 'Hit by academic budget cuts.', up: ['neon_helium'] });
  add('waters', T, 'Waters', { d: 'waters.com', q: 'WAT', s: 'Life-science tools', w: 'Liquid chromatography and mass spectrometry for drug testing.', y: 'Every batch of medicine is tested on machines like these.', p: 'Steady pharma demand.', up: ['linde'] });

  /* biomanufacturing and consumables */
  add('lonza', M, 'Lonza', { d: 'lonza.com', q: 'LONN.SW', s: 'Contract manufacturer', w: 'Contract manufacturer of biologics, cell and gene therapies.', y: 'Drug makers rent its factories instead of building their own.', p: 'Buying capacity (a former Roche site in California).', o: 'Public. Capacity close to customers and faster tech transfer are wide open.', up: ['sartorius', 'danaher', 'thermo', 'schott', 'west', 'corning'] });
  add('samsung_bio', M, 'Samsung Biologics', { d: 'samsungbiologics.com', q: '207940.KS', s: 'Contract manufacturer', w: 'One of the world\'s largest biologics contract factories.', y: 'Korea is becoming a hub for drug manufacturing outside the US and China.', p: 'Rapid capacity growth.', up: ['sartorius', 'danaher', 'thermo', 'schott', 'west'] });
  add('wuxi', M, 'WuXi AppTec & Biologics', { d: 'wuxiapptec.com', q: '2359.HK', s: 'Contract manufacturer', w: 'Chinese contract research and manufacturing for global drug makers.', y: 'Many Western drug makers rely on it, so US lawmakers have pushed laws to reduce that dependence.', p: 'Still growing, with political risk.', o: 'Public. Non-China alternatives are an opening.', up: ['thermo', 'danaher', 'sartorius', 'west'] });
  add('sartorius', M, 'Sartorius', { d: 'sartorius.com', q: 'SRT3.DE', s: 'Bioprocess supplier', w: 'Filters, single-use bags and lab equipment for making biologic drugs.', y: 'One of a few firms (with Cytiva and Merck KGaA) supplying the whole industry.', p: 'Recovering after customers cut stock.', o: 'Public. Single-use and analytics are active startup areas.', up: ['water'] });
  add('west', M, 'West Pharmaceutical Services', { d: 'westpharma.com', q: 'WST', s: 'Drug-delivery components', c: true, w: 'Rubber stoppers, plungers and seals for injectable drugs.', y: 'Every vial and pen needs these. A shortage stalls the drug even if the drug is made.', p: 'Demand tied to injectables and GLP-1 growth.', o: 'Public. Quiet, sticky and hard to qualify, so entry takes years.', up: [] });

  /* move AI-bio companies out of consumer health, and wire patients to drugs */
  [['recursion', B], ['isomorphic', B], ['tempus', B]].forEach(function (p) { by[p[0]].l = p[1]; });
  by.tempus.up.push('illumina');
  by.you_health.up.push('lilly', 'novo', 'pfizer', 'moderna', 'regeneron');

  /* ---------- the TSMC ecosystem in Taiwan ---------- */
  function tw(id, layer, n, o) { o.hq = 'TW'; add(id, li(layer), n, o); }
  var FABTOOLS = ['applied_materials', 'lam', 'tokyo_electron', 'kla'];
  /* chip designers and design services */
  tw('alchip', 'chips', 'Alchip', { d: 'alchip.com', q: '3661.TW', s: 'Design services', w: 'Designs custom AI chips for cloud customers and hands them to TSMC to build.', y: 'The route by which cloud companies get their own AI chip without a big chip team.', p: 'Fast growth on custom AI chip projects, concentrated in a few customers.', o: 'Public. Design-service firms live on TSMC process access and advanced-packaging know-how.', up: ['tsmc', 'synopsys', 'cadence', 'arm'], loc: 'Taipei.' });
  tw('guc', 'chips', 'Global Unichip (GUC)', { d: 'guc-asic.com', q: '3443.TW', s: 'Design services', w: 'Custom-chip design service. TSMC is its largest shareholder.', y: 'Often first to use new TSMC processes and packaging, because it works so close to TSMC.', p: 'Growing with AI and networking chips.', o: 'Public. A model for how a partner stays inside TSMC\'s ecosystem.', up: ['tsmc', 'synopsys', 'cadence', 'arm'], loc: 'Hsinchu Science Park.' });
  tw('faraday', 'chips', 'Faraday Technology', { d: 'faraday-tech.com', q: '3035.TW', s: 'Design services', w: 'Chip IP and custom-chip design services, mostly on mature processes.', y: 'Serves customers who need chips but not the newest process.', p: 'Steady, tied to industrial and consumer chips.', o: 'Public. Mature-node design is less crowded than the leading edge.', up: ['umc', 'synopsys', 'cadence'] });
  tw('realtek', 'chips', 'Realtek', { d: 'realtek.com', q: '2379.TW', s: 'Chip designer', w: 'Networking, audio and PC chips found in routers, laptops and TVs.', y: 'Shows how Taiwan fabless firms ship at huge volume on TSMC and UMC.', p: 'Cyclical with consumer electronics.', up: ['tsmc', 'synopsys', 'cadence'] });
  tw('novatek', 'chips', 'Novatek', { d: 'novatek.com.tw', q: '3034.TW', s: 'Chip designer', w: 'Display driver and TV chips.', y: 'Every phone and TV screen needs a driver chip, and many come from Taiwan.', p: 'Cyclical with screen demand.', up: ['tsmc', 'synopsys', 'cadence'] });
  /* foundries, memory, packaging and test */
  tw('umc', 'fabs', 'UMC', { d: 'umc.com', q: 'UMC', s: 'Foundry', w: 'Taiwan\'s second-largest foundry, focused on mature processes for cars, displays and power chips.', y: 'Makes the chips that do not need the newest process, and is a hedge for customers wary of relying on TSMC.', p: 'Utilisation recovering; pricing pressure from Chinese foundries.', o: 'Public. Mature-node specialty processes are a steady niche.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'kla', 'shin_etsu', 'sumco', 'globalwafers', 'entegris', 'linde', 'water'], loc: 'Hsinchu Science Park.' });
  tw('vis', 'fabs', 'Vanguard (VIS)', { d: 'vis.com.tw', q: '5347.TWO', s: 'Foundry', w: 'Mature-node foundry for power management and display chips; TSMC is its largest shareholder.', y: 'Part of the TSMC family of mature-node fabs.', p: 'Steady.', up: ['applied_materials', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'] });
  tw('psmc', 'fabs', 'Powerchip (PSMC)', { d: 'psmc.com.tw', q: '6770.TW', s: 'Foundry', w: 'Foundry and memory maker with fabs in Hsinchu and Tongluo.', y: 'Offers capacity to customers who cannot get it elsewhere.', p: 'Recovering from a downturn.', up: ['applied_materials', 'lam', 'tokyo_electron', 'globalwafers', 'linde'] });
  tw('nanya', 'fabs', 'Nanya Technology', { d: 'nanya.com', q: '2408.TW', s: 'Memory', w: 'Maker of standard DRAM memory.', y: 'Taiwan\'s main memory maker, smaller than SK hynix, Samsung and Micron.', p: 'Rides the memory price cycle.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'] });
  tw('winbond', 'fabs', 'Winbond', { d: 'winbond.com', q: '2344.TW', s: 'Memory', w: 'Specialty memory for cars, industrial gear and edge AI.', y: 'Niche memory with long product lives.', p: 'Recovering from a downturn.', up: ['applied_materials', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'], loc: 'Taichung.' });
  tw('macronix', 'fabs', 'Macronix', { d: 'mxic.com.tw', q: '2337.TW', s: 'Memory', w: 'NOR flash memory, used to store boot code in cars, devices and servers.', y: 'A quiet but critical memory in many products.', p: 'Cyclical.', up: ['applied_materials', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'], loc: 'Hsinchu Science Park.' });
  tw('kyec', 'fabs', 'King Yuan Electronics (KYEC)', { d: 'kyec.com.tw', q: '2449.TW', s: 'Chip test', w: 'The largest independent maker of chip testing services.', y: 'Every AI chip is tested before it ships, and test capacity can limit output.', p: 'Benefiting from AI chip volumes and longer test times.', o: 'Public. Test time and cost per chip is a real pain point.', up: ['advantest', 'teradyne', 'chroma'] });
  /* equipment */
  tw('chroma', 'equip', 'Chroma ATE', { d: 'chromaate.com', q: '2360.TW', s: 'Test equipment', w: 'Test and measurement systems for chips, power and batteries.', y: 'A homegrown rival to Advantest and Teradyne in some areas.', p: 'Growing with AI server and chip test.', up: [] });
  tw('gptc', 'equip', 'Grand Process Technology (GPTC)', { d: 'gptc.com.tw', q: '3131.TWO', s: 'Wet-process equipment', w: 'Wet-process tools for advanced packaging, used in CoWoS.', y: 'A local supplier benefiting from TSMC packaging expansion.', p: 'Orders track CoWoS capacity.', o: 'Public. Local tool makers win by being fast to qualify with TSMC.', up: [] });
  tw('scientech', 'equip', 'Scientech', { d: 'scientech.com.tw', q: '3583.TW', s: 'Wet-process equipment', w: 'Wet-process and packaging equipment, including for CoWoS.', y: 'Another local supplier riding TSMC\'s packaging build.', p: 'Orders track CoWoS capacity.', up: [] });
  tw('all_ring', 'equip', 'All Ring Tech', { d: 'allring.com.tw', q: '6187.TWO', s: 'Packaging equipment', w: 'Automation and dispensing equipment for advanced packaging.', y: 'Part of the local tool cluster for packaging.', p: 'Orders track advanced-packaging build.', up: [] });
  /* fab facilities and consumables */
  tw('marketech', 'parts', 'Marketech', { d: 'marketech.com.tw', q: '6196.TW', s: 'Fab systems', w: 'Designs and installs the gas, chemical and piping systems inside fabs.', y: 'No fab runs without these systems, and TSMC keeps building fabs.', p: 'Orders track TSMC fab construction.', o: 'Public. Fab-building services follow wherever TSMC goes, including Arizona and Japan.', up: ['swagelok', 'entegris', 'mks'] });
  tw('uis', 'parts', 'United Integrated Services (UIS)', { d: 'uis.com.tw', q: '2404.TW', s: 'Fab construction', w: 'Builds cleanrooms and fab facility systems.', y: 'Cleanroom build is one of the pacing items for any new fab.', p: 'Orders track TSMC and other fab construction.', up: ['swagelok', 'entegris'] });
  tw('gudeng', 'parts', 'Gudeng Precision', { d: 'gudeng.com', q: '3680.TWO', s: 'Fab consumables', c: true, cw: 'One of two main makers of EUV mask pods (with Entegris). Each pod has to be qualified by the chipmaker and the tool maker.', w: 'Makes the pods that carry photomasks, including EUV masks.', y: 'EUV masks are fragile and expensive, so the pods that carry them are tightly qualified.', p: 'Growing with EUV adoption.', o: 'Public. A tiny, specialised part that became essential.', up: [] });
  /* wafers, masks and substrates */
  tw('sas', 'materials', 'Sino-American Silicon (SAS)', { d: 'sas.com.tw', q: '5483.TWO', s: 'Wafers', w: 'Silicon wafer maker; parent of GlobalWafers.', y: 'Taiwan\'s home source of wafers for local fabs.', p: 'Wafer demand recovering.', up: ['crucible', 'wacker'] });
  tw('taiwan_mask', 'materials', 'Taiwan Mask', { d: 'tmc.com.tw', q: '2338.TW', s: 'Photomasks', w: 'Makes photomasks, the stencils used to print circuits on wafers.', y: 'Masks are a quiet bottleneck of any new chip design.', p: 'Steady.', up: ['hoya'] });
  tw('kinsus', 'materials', 'Kinsus', { d: 'kinsus.com.tw', q: '3189.TW', s: 'Substrates', w: 'Chip package substrates for networking and AI chips.', y: 'Advanced substrates are among the tightest parts in the AI chip chain.', p: 'Benefiting from AI demand.', up: ['ajinomoto', 'nittobo'] });
  tw('nanya_pcb', 'materials', 'Nan Ya PCB', { d: 'nanyapcb.com.tw', q: '8046.TW', s: 'Substrates', w: 'ABF package substrates and circuit boards.', y: 'A major Taiwan substrate maker, with Unimicron and Kinsus.', p: 'Recovering with AI demand.', up: ['ajinomoto', 'nittobo'] });
  tw('emc', 'materials', 'Elite Material (EMC)', { d: 'emctw.com', q: '2383.TW', s: 'Laminates', w: 'Copper-clad laminates, the base of AI server circuit boards.', y: 'Higher-speed AI boards need better laminates, and EMC is a lead supplier.', p: 'Growing with AI servers.', up: ['nittobo'] });
  /* servers, networking, power and cooling */
  tw('wistron', 'systems', 'Wistron', { d: 'wistron.com', q: '3231.TW', s: 'Server maker', w: 'Builds AI servers and boards, including for NVIDIA.', y: 'One of the Taiwan assemblers that turn GPUs into servers.', p: 'Growing with AI servers.', up: ['nvidia', 'amd', 'delta_elec', 'avc', 'auras', 'amphenol'] });
  tw('inventec', 'systems', 'Inventec', { d: 'inventec.com', q: '2356.TW', s: 'Server maker', w: 'Builds servers for cloud companies.', y: 'A long-time server builder for the big clouds.', p: 'Growing with AI servers.', up: ['nvidia', 'amd', 'delta_elec', 'avc'] });
  tw('compal', 'systems', 'Compal Electronics', { d: 'compal.com', q: '2324.TW', s: 'Server maker', w: 'Laptops, servers and smart devices.', y: 'Part of the Taiwan assembly cluster.', p: 'Moving from laptops towards servers.', up: ['nvidia', 'amd', 'delta_elec'] });
  tw('accton', 'systems', 'Accton', { d: 'accton.com', q: '2345.TW', s: 'Networking', w: 'Builds the white-box network switches used in data centres.', y: 'AI clusters need huge amounts of fast switching.', p: 'Growing with AI networking.', up: ['broadcom', 'marvell'] });
  tw('delta_elec', 'systems', 'Delta Electronics', { d: 'deltaww.com', q: '2308.TW', s: 'Power and cooling', w: 'Power supplies and cooling for servers and data centres.', y: 'Each AI rack draws far more power, so power gear is as important as chips.', p: 'Strong growth from AI servers.', o: 'Public. Power conversion and cooling are open fronts.', up: [], loc: 'Taipei.' });
  tw('avc', 'systems', 'AVC (Asia Vital Components)', { d: 'avc.com.tw', q: '3017.TW', s: 'Cooling', w: 'Heat sinks, heat pipes and liquid-cooling parts for servers.', y: 'AI chips run hot, so cooling is a bottleneck in rack design.', p: 'Growing with liquid cooling.', up: [] });
  tw('auras', 'systems', 'Auras Technology', { d: 'auras.com.tw', q: '3324.TWO', s: 'Cooling', w: 'Cold plates and liquid-cooling parts.', y: 'Direct-to-chip liquid cooling is becoming standard on AI racks.', p: 'Growing with AI servers.', up: [] });
  tw('lite_on', 'systems', 'Lite-On', { d: 'liteon.com', q: '2301.TW', s: 'Power', w: 'Server power supplies, optical parts and electronics.', y: 'Another Taiwan source of rack power.', p: 'Growing with AI servers.', up: [] });
  /* grid */
  tw('taipower', 'energy', 'Taipower', { s: 'State utility (government-owned)', c: true, cw: 'Taiwan imports almost all its energy and has little spare grid capacity, while fabs use a growing share of its power.', w: 'Taiwan\'s state-owned electricity company.', y: 'A fab cannot stop mid-run. Power cuts or shortages hit the whole chip chain.', p: 'Capacity is tight as fab and data-centre demand grows.', o: 'Government-owned. Power-quality, backup and on-site energy for fabs are real needs.', up: [] });

  /* wire the new players into TSMC and its customers */
  ['gudeng', 'marketech', 'uis', 'gptc', 'scientech', 'all_ring', 'chroma', 'sas', 'taiwan_mask', 'kyec', 'ase', 'globalwafers', 'taipower'].forEach(function (id) { if (by.tsmc.up.indexOf(id) < 0) by.tsmc.up.push(id); });
  by.ase.c = true; by.ase.cw = 'Largest outsourced chip packager. Advanced packaging capacity, not chips, has limited AI supply, and ASE is TSMC\'s main overflow route.';
  by.tsmc.loc = 'Headquarters and R&D in Hsinchu Science Park. Fabs in Hsinchu, Taichung, Tainan and Kaohsiung, plus overseas fabs in Arizona, Kumamoto (Japan) and Dresden (Germany).';
  by.ase.loc = 'Kaohsiung.'; by.mediatek.loc = 'Hsinchu Science Park.'; by.foxconn.loc = 'New Taipei.'; by.globalwafers.loc = 'Hsinchu Science Park.';

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
    sibelco: 'One of very few miners of high-purity quartz, the feedstock for semiconductor-grade crucibles.',
    deere: 'Dominant maker of large farm machinery, and its software and data lock in farmers.',
    nutrien: 'One of the largest potash producers, and potash is a key fertiliser input with few sources.',
    ge_aerospace: 'One of very few makers of large jet engines. Engine slots are booked for years.',
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
  var TW_GROUPS = [
    { name: 'All Taiwan', hq: 'TW' },
    { name: 'Design services', ids: ['alchip', 'guc', 'faraday', 'mediatek', 'realtek', 'novatek'] },
    { name: 'Foundry & memory', ids: ['tsmc', 'umc', 'vis', 'psmc', 'nanya', 'winbond', 'macronix'] },
    { name: 'Packaging & test', ids: ['ase', 'kyec', 'unimicron', 'kinsus', 'nanya_pcb'] },
    { name: 'Fab tools', ids: ['gptc', 'scientech', 'all_ring', 'chroma'] },
    { name: 'Fab facilities', ids: ['marketech', 'uis', 'gudeng', 'taipower'] },
    { name: 'Wafers & masks', ids: ['globalwafers', 'sas', 'taiwan_mask', 'emc'] },
    { name: 'Servers', ids: ['foxconn', 'quanta_computer', 'wiwynn', 'wistron', 'inventec', 'compal', 'accton'] },
    { name: 'Power & cooling', ids: ['delta_elec', 'avc', 'auras', 'lite_on'] },
    { name: 'TSMC customers', ids: ['nvidia', 'amd', 'apple_si', 'broadcom', 'qualcomm', 'marvell', 'google_tpu', 'aws_trainium'] },
    { name: 'Foreign suppliers', ids: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'kla', 'shin_etsu', 'sumco', 'entegris', 'ajinomoto', 'nittobo'] }
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
    { id: 'tsmc', name: 'TSMC & Taiwan', blurb: 'Taiwan-based players, TSMC\'s customers and the foreign suppliers they rely on.',
      hq: 'TW', customers: ['tsmc'], depth: 1, groups: TW_GROUPS },
    { id: 'bio', name: 'Biotech', blurb: 'Drug makers, lab tools and contract factories, and the chips and glass they depend on.',
      layers: ['bio', 'biotools', 'biomfg'], extra: ['you_health'], depth: 2 }
  ];
})();
