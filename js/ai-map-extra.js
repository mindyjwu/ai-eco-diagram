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
  tw('psmc', 'fabs', 'Powerchip (PSMC)', { d: 'powerchip.com', q: '6770.TW', s: 'Foundry', w: 'Foundry and memory maker with fabs in Hsinchu and Tongluo.', y: 'Offers capacity to customers who cannot get it elsewhere.', p: 'Recovering from a downturn.', up: ['applied_materials', 'lam', 'tokyo_electron', 'globalwafers', 'linde'] });
  tw('nanya', 'fabs', 'Nanya Technology', { d: 'nanya.com', q: '2408.TW', s: 'Memory', w: 'Maker of standard DRAM memory.', y: 'Taiwan\'s main memory maker, smaller than SK hynix, Samsung and Micron.', p: 'Rides the memory price cycle.', up: ['asml', 'applied_materials', 'lam', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'] });
  tw('winbond', 'fabs', 'Winbond', { d: 'winbond.com', q: '2344.TW', s: 'Memory', w: 'Specialty memory for cars, industrial gear and edge AI.', y: 'Niche memory with long product lives.', p: 'Recovering from a downturn.', up: ['applied_materials', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'], loc: 'Taichung.' });
  tw('macronix', 'fabs', 'Macronix', { d: 'macronix.com', q: '2337.TW', s: 'Memory', w: 'NOR flash memory, used to store boot code in cars, devices and servers.', y: 'A quiet but critical memory in many products.', p: 'Cyclical.', up: ['applied_materials', 'tokyo_electron', 'sumco', 'globalwafers', 'linde'], loc: 'Hsinchu Science Park.' });
  tw('kyec', 'fabs', 'King Yuan Electronics (KYEC)', { d: 'kyec.com.tw', q: '2449.TW', s: 'Chip test', w: 'The largest independent maker of chip testing services.', y: 'Every AI chip is tested before it ships, and test capacity can limit output.', p: 'Benefiting from AI chip volumes and longer test times.', o: 'Public. Test time and cost per chip is a real pain point.', up: ['advantest', 'teradyne', 'chroma'] });
  /* equipment */
  tw('chroma', 'equip', 'Chroma ATE', { d: 'chromaate.com', q: '2360.TW', s: 'Test equipment', w: 'Test and measurement systems for chips, power and batteries.', y: 'A homegrown rival to Advantest and Teradyne in some areas.', p: 'Growing with AI server and chip test.', up: [] });
  tw('gptc', 'equip', 'Grand Process Technology (GPTC)', { d: 'gptc.com.tw', q: '3131.TWO', s: 'Wet-process equipment', w: 'Wet-process tools for advanced packaging, used in CoWoS.', y: 'A local supplier benefiting from TSMC packaging expansion.', p: 'Orders track CoWoS capacity.', o: 'Public. Local tool makers win by being fast to qualify with TSMC.', up: [] });
  tw('scientech', 'equip', 'Scientech', { d: 'scientech.com.tw', q: '3583.TW', s: 'Wet-process equipment', w: 'Wet-process and packaging equipment, including for CoWoS.', y: 'Another local supplier riding TSMC\'s packaging build.', p: 'Orders track CoWoS capacity.', up: [] });
  tw('all_ring', 'equip', 'All Ring Tech', { d: 'allring-tech.com.tw', q: '6187.TWO', s: 'Packaging equipment', w: 'Automation and dispensing equipment for advanced packaging.', y: 'Part of the local tool cluster for packaging.', p: 'Orders track advanced-packaging build.', up: [] });
  /* fab facilities and consumables */
  tw('marketech', 'parts', 'Marketech', { d: 'micb2b.com', q: '6196.TW', s: 'Fab systems', w: 'Designs and installs the gas, chemical and piping systems inside fabs.', y: 'No fab runs without these systems, and TSMC keeps building fabs.', p: 'Orders track TSMC fab construction.', o: 'Public. Fab-building services follow wherever TSMC goes, including Arizona and Japan.', up: ['swagelok', 'entegris', 'mks'] });
  tw('uis', 'parts', 'United Integrated Services (UIS)', { d: 'uis.com.tw', q: '2404.TW', s: 'Fab construction', w: 'Builds cleanrooms and fab facility systems.', y: 'Cleanroom build is one of the pacing items for any new fab.', p: 'Orders track TSMC and other fab construction.', up: ['swagelok', 'entegris'] });
  tw('gudeng', 'parts', 'Gudeng Precision', { d: 'gudeng.com', q: '3680.TWO', s: 'Fab consumables', c: true, cw: 'One of two main makers of EUV mask pods (with Entegris). Each pod has to be qualified by the chipmaker and the tool maker.', w: 'Makes the pods that carry photomasks, including EUV masks.', y: 'EUV masks are fragile and expensive, so the pods that carry them are tightly qualified.', p: 'Growing with EUV adoption.', o: 'Public. A tiny, specialised part that became essential.', up: [] });
  /* wafers, masks and substrates */
  tw('sas', 'materials', 'Sino-American Silicon (SAS)', { d: 'saswafer.com', q: '5483.TWO', s: 'Wafers', w: 'Silicon wafer maker; parent of GlobalWafers.', y: 'Taiwan\'s home source of wafers for local fabs.', p: 'Wafer demand recovering.', up: ['crucible', 'wacker'] });
  tw('taiwan_mask', 'materials', 'Taiwan Mask', { d: 'tmcnet.com.tw', q: '2338.TW', s: 'Photomasks', w: 'Makes photomasks, the stencils used to print circuits on wafers.', y: 'Masks are a quiet bottleneck of any new chip design.', p: 'Steady.', up: ['hoya'] });
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

  /* ---------- more countries: Korea, Japan, Europe, China, Israel, India, Gulf, mining ---------- */
  function co(id, layer, hq, n, o) { o.hq = hq; add(id, li(layer), n, o); }
  /* South Korea */
  co('hanmi_semi', 'equip', 'KR', 'Hanmi Semiconductor', { d: 'hanmisemi.com', q: '042700.KS', s: 'Packaging equipment', w: 'Makes thermocompression bonders that stack HBM memory chips.', y: 'HBM stacking is a bottleneck of AI chips, and these machines do the stacking for SK hynix.', p: 'Grew fast with HBM; rivals are catching up.', up: [] });
  co('samsung_em', 'materials', 'KR', 'Samsung Electro-Mechanics', { d: 'samsungsem.com', q: '009150.KS', s: 'Substrates', w: 'Package substrates and ceramic capacitors (MLCC).', y: 'Advanced substrates are tight, and Korea is trying to build its own supply.', p: 'Moving into AI-chip substrates.', up: ['ajinomoto', 'nittobo'] });
  /* Japan */
  co('renesas', 'chips', 'JP', 'Renesas', { d: 'renesas.com', q: '6723.T', s: 'Chip designer', w: 'Microcontrollers and power chips for cars and industry.', y: 'Cars and factories run on chips like these, not on AI GPUs.', p: 'Cyclical with auto and industrial demand.', up: ['tsmc', 'synopsys', 'cadence'] });
  co('kioxia', 'fabs', 'JP', 'Kioxia', { d: 'kioxia.com', q: '285A.T', s: 'Memory', w: 'Maker of NAND flash memory (SSD storage).', y: 'AI data centres need huge amounts of fast storage.', p: 'Recovering with AI storage demand.', up: ['tokyo_electron', 'lam', 'kla', 'shin_etsu', 'sumco', 'linde'] });
  co('screen', 'equip', 'JP', 'SCREEN Holdings', { d: 'screen.co.jp', q: '7735.T', s: 'Chip equipment', w: 'Wafer cleaning tools, a leader in single-wafer cleaning.', y: 'Every chip layer needs cleaning, so these tools sell with every fab.', p: 'Steady with fab investment.', up: [] });
  co('kokusai', 'equip', 'JP', 'Kokusai Electric', { d: 'kokusai-electric.com', q: '6525.T', s: 'Chip equipment', w: 'Batch deposition furnaces for chip layers.', y: 'A key supplier of furnaces for logic and memory fabs.', p: 'Growing with chip investment.', up: [] });
  co('ebara', 'parts', 'JP', 'Ebara', { d: 'ebara.com', q: '6361.T', s: 'Fab parts', w: 'CMP polishing tools and dry vacuum pumps.', y: 'Wafers are polished flat dozens of times, and vacuum pumps run constantly in a fab.', p: 'Benefiting from fab expansion.', up: [] });
  co('dnp', 'materials', 'JP', 'Dai Nippon Printing (DNP)', { d: 'dnp.co.jp', q: '7912.T', s: 'Photomasks', w: 'Photomasks for chip making, and a leader in EUV masks.', y: 'No mask, no chip. DNP and Toppan are the main independent mask makers.', p: 'Steady, with EUV growth.', up: ['hoya'] });
  /* Europe */
  co('nxp', 'chips', 'NL', 'NXP Semiconductors', { d: 'nxp.com', q: 'NXPI', s: 'Chip designer', w: 'Chips for cars, industry and secure payments.', y: 'Cars rely on chips like these, and shortages in 2021 halted production.', p: 'Cyclical with auto demand.', up: ['tsmc', 'synopsys', 'cadence'] });
  co('infineon', 'chips', 'DE', 'Infineon', { d: 'infineon.com', q: 'IFX.DE', s: 'Power chips', w: 'Power semiconductors for cars, grids and AI servers.', y: 'Each AI rack needs large amounts of power conversion, and Infineon is a leader in the chips for it.', p: 'Growing with AI power demand.', up: ['siltronic', 'linde', 'applied_materials'] });
  co('stmicro', 'chips', 'CH', 'STMicroelectronics', { d: 'st.com', q: 'STM', s: 'Chip designer', w: 'Chips for cars and industry, including silicon carbide power chips.', y: 'Europe\'s largest chipmaker, with fabs in Italy and France.', p: 'Cyclical with auto and industrial demand.', up: ['applied_materials', 'soitec', 'linde'] });
  co('aixtron', 'equip', 'DE', 'AIXTRON', { d: 'aixtron.com', q: 'AIXA.DE', s: 'Chip equipment', w: 'MOCVD reactors that grow layers for LEDs, lasers and power chips.', y: 'Optical links and power chips both start on its machines.', p: 'Tied to optical and power-chip investment.', up: [] });
  co('suss', 'equip', 'DE', 'SUSS MicroTec', { d: 'suss.com', q: 'SMHN.DE', s: 'Packaging equipment', w: 'Bonding and lithography tools for advanced packaging.', y: 'Hybrid bonding and CoWoS-type packaging depend on tools like these.', p: 'Orders track advanced-packaging build.', up: [] });
  co('siltronic', 'materials', 'DE', 'Siltronic', { d: 'siltronic.com', q: 'WAF.DE', s: 'Wafers', w: 'Silicon wafers, one of the five biggest suppliers.', y: 'Europe\'s home source of wafers.', p: 'Recovering with chip demand.', up: ['crucible', 'wacker'] });
  co('soitec', 'materials', 'FR', 'Soitec', { d: 'soitec.com', q: 'SOI.PA', s: 'Wafers', w: 'Engineered wafers (silicon-on-insulator) for phones, cars and photonics.', y: 'The standard source of SOI wafers used in RF chips and silicon photonics.', p: 'Hit by phone and auto softness.', up: [] });
  co('arianegroup', 'rocket', 'FR', 'ArianeGroup', { d: 'arianegroup.com', s: 'Launcher maker', w: 'Builds the Ariane rockets; a joint venture of Airbus and Safran.', y: 'Europe\'s own route to orbit.', p: 'Ramping Ariane 6.', up: [] });
  co('imec', 'chips', 'BE', 'imec', { d: 'imec-int.com', s: 'Research institute (technology)', w: 'Belgian research hub where chipmakers and tool makers jointly develop next-generation processes.', y: 'Much of tomorrow\'s chip technology, including High-NA EUV, is first proven here.', p: 'Core to Europe\'s chip research.', o: 'A place to prove a new tool, material or process with the whole industry watching.', up: [] });
  co('umicore', 'materials', 'BE', 'Umicore', { d: 'umicore.com', q: 'UMI.BR', s: 'Materials', w: 'Specialty metals, including germanium substrates for space solar cells.', y: 'One of few sources of germanium outside China.', p: 'Restructuring battery materials.', up: [] });
  co('iqe', 'materials', 'GB', 'IQE', { d: 'iqep.com', q: 'IQE.L', s: 'Wafers', w: 'Epitaxial wafers for lasers, RF chips and sensors.', y: 'Optical links and 3D sensing depend on wafers like these.', p: 'Restructuring.', up: ['china_gallium'] });
  co('oxford_inst', 'equip', 'GB', 'Oxford Instruments', { d: 'oxinst.com', q: 'OXIG.L', s: 'Chip equipment', w: 'Etch and deposition tools for compound-semiconductor and quantum devices.', y: 'Used where silicon tools do not fit, such as lasers and power chips.', p: 'Steady.', up: [] });
  /* Israel */
  co('nova', 'equip', 'IL', 'Nova', { d: 'novami.com', q: 'NVMI', s: 'Chip equipment', w: 'Optical measurement tools that check chip layers as they are built.', y: 'Every new process node needs more measurement.', p: 'Growing with advanced-node and packaging demand.', up: [] });
  co('camtek', 'equip', 'IL', 'Camtek', { d: 'camtek.com', q: 'CAMT', s: 'Chip equipment', w: 'Inspection tools for advanced packaging, including AI chip packages.', y: 'A key supplier for CoWoS-type inspection.', p: 'Growing with AI packaging.', up: [] });
  co('tower', 'fabs', 'IL', 'Tower Semiconductor', { d: 'towersemi.com', q: 'TSEM', s: 'Foundry', w: 'Specialty foundry for analog, RF and silicon-photonics chips.', y: 'Makes many of the chips inside optical transceivers.', p: 'Growing with silicon photonics.', up: ['applied_materials', 'asml', 'sumco', 'linde'] });
  /* India, Southeast Asia */
  co('tata_elec', 'fabs', 'IN', 'Tata Electronics', { d: 'tata.com', s: 'Fab and packaging builder', w: 'Building India\'s first large chip fab (with PSMC) and chip-packaging plants.', y: 'India\'s attempt to join the chip supply chain.', p: 'Under construction.', o: 'A new ecosystem needs tools, materials, engineers and services from scratch.', up: ['psmc', 'applied_materials'] });
  co('inari', 'fabs', 'MY', 'Inari Amertron', { d: 'inari-amertron.com.my', q: 'INRI.KL', s: 'Chip packaging and test', w: 'Packages and tests RF and optical chips, largely in Malaysia.', y: 'Malaysia handles a big share of the world\'s chip packaging and test.', p: 'Steady growth.', up: ['disco', 'advantest'] });
  /* China */
  co('naura', 'equip', 'CN', 'NAURA', { d: 'naura.com', q: '002371.SZ', s: 'Chip equipment', w: 'China\'s largest chip-equipment maker, covering etch, deposition and cleaning.', y: 'China\'s answer to export controls on Western tools.', p: 'Fast growth on domestic demand.', up: [] });
  co('amec', 'equip', 'CN', 'AMEC', { d: 'amecnsh.com', q: '688012.SS', s: 'Chip equipment', w: 'Etch and deposition tools, strong in China.', y: 'A main domestic alternative to Lam and Applied.', p: 'Fast growth on domestic demand.', up: [] });
  co('ymtc', 'fabs', 'CN', 'YMTC', { d: 'ymtc.com', s: 'Memory', w: 'Chinese maker of NAND flash memory.', y: 'China\'s main NAND maker, restricted by US export controls.', p: 'Growing at home despite restrictions.', up: ['naura', 'amec'] });
  co('cxmt', 'fabs', 'CN', 'CXMT', { d: 'cxmt.com', s: 'Memory', w: 'Chinese maker of DRAM memory, working towards HBM.', y: 'China\'s main DRAM maker.', p: 'Expanding capacity.', up: ['naura', 'amec'] });
  co('hua_hong', 'fabs', 'CN', 'Hua Hong Semiconductor', { d: 'huahonggrace.com', q: '1347.HK', s: 'Foundry', w: 'Mature-node foundry for power, analog and embedded chips.', y: 'Second-largest Chinese foundry after SMIC.', p: 'Steady on domestic demand.', up: ['naura', 'amec'] });
  co('jcet', 'fabs', 'CN', 'JCET', { d: 'jcetglobal.com', q: '600584.SS', s: 'Chip packaging and test', w: 'China\'s largest chip packaging and test company.', y: 'Top-three global packager, and a hedge for Chinese chip designers.', p: 'Steady growth.', up: ['disco', 'advantest', 'besi'] });
  co('cambricon', 'chips', 'CN', 'Cambricon', { d: 'cambricon.com', q: '688256.SS', s: 'Chip designer', w: 'Designs AI accelerator chips for Chinese data centres.', y: 'One of China\'s main domestic alternatives to NVIDIA.', p: 'Very fast growth from a small base.', up: ['smic'] });
  co('catl', 'energy', 'CN', 'CATL', { d: 'catl.com', q: '300750.SZ', s: 'Batteries', w: 'World\'s largest battery maker, for cars and grid storage.', y: 'Grid batteries are how data centres smooth power demand.', p: 'Leading global share.', up: [] });
  /* Gulf */
  co('g42', 'labs', 'AE', 'G42', { d: 'g42.ai', s: 'AI company', w: 'Abu Dhabi AI group building models and large GPU clusters.', y: 'A main vehicle for the UAE\'s AI ambitions, with Microsoft as an investor.', p: 'Scaling compute with US partners.', up: ['azure', 'nvidia', 'cerebras'] });
  co('humain', 'labs', 'SA', 'HUMAIN', { d: 'humain.ai', s: 'AI company', w: 'Saudi AI company backed by the Public Investment Fund.', y: 'Saudi Arabia\'s push to host AI data centres and models.', p: 'Newly formed, signing chip and cloud deals.', up: ['nvidia', 'aws', 'amd', 'qualcomm'] });
  co('pif', 'capital', 'SA', 'Public Investment Fund (PIF)', { d: 'pif.gov.sa', s: 'Sovereign wealth fund', w: 'Saudi Arabia\'s sovereign wealth fund.', y: 'Gulf sovereign money is now a major source of AI capital.', p: 'Large and growing.', up: ['humain'] });
  /* Singapore and Austria */
  co('gic', 'capital', 'SG', 'GIC', { d: 'gic.com.sg', s: 'Sovereign wealth fund', w: 'Singapore\'s sovereign wealth fund, a large investor in data centres and infrastructure.', y: 'A long-term source of infrastructure capital.', p: 'Steady.', up: ['equinix'] });
  co('ev_group', 'equip', 'AT', 'EV Group', { d: 'evgroup.com', s: 'Packaging equipment', w: 'Wafer bonding tools, a leader in hybrid bonding.', y: '3D chip stacking relies on bonding machines like these.', p: 'Growing with advanced packaging.', up: [] });
  /* mining and materials */
  co('teck', 'raw', 'CA', 'Teck Resources', { d: 'teck.com', q: 'TECK', s: 'Miner', w: 'Copper and zinc miner whose smelter also produces germanium.', y: 'A western source of copper and of germanium for optics and solar.', p: 'Copper-focused after a coal sale.', up: [] });
  co('bhp', 'raw', 'AU', 'BHP', { d: 'bhp.com', q: 'BHP', s: 'Miner', w: 'World\'s biggest miner; one of the largest copper producers.', y: 'AI needs a lot of copper for power and cooling.', p: 'Copper is a growing share of its mix.', up: [] });
  co('lynas', 'raw', 'AU', 'Lynas Rare Earths', { d: 'lynasrareearths.com', q: 'LYC.AX', s: 'Miner', w: 'Largest rare-earth producer outside China.', y: 'A main alternative to Chinese rare earths for magnets.', p: 'Expanding processing in the US and Malaysia.', up: [] });
  co('codelco', 'raw', 'CL', 'Codelco', { d: 'codelco.com', s: 'State miner (government-owned)', w: 'Chile\'s state-owned copper miner, the world\'s largest.', y: 'Copper supply for grids and data centres starts in places like this.', p: 'Output under pressure from ageing mines.', up: [] });
  co('elkem', 'raw', 'NO', 'Elkem', { d: 'elkem.com', q: 'ELK.OL', s: 'Silicon producer', w: 'Silicon metal and silicones, from low-carbon Norwegian power.', y: 'Silicon metal is the first step towards polysilicon and wafers.', p: 'Hit by weak silicone prices.', up: [] });

  /* wire the new players into the existing map */
  function link(buyer, supplier) { if (by[buyer] && by[supplier] && by[buyer].up.indexOf(supplier) < 0) by[buyer].up.push(supplier); }
  ['screen', 'kokusai', 'nova', 'camtek', 'suss', 'ev_group', 'siltronic', 'dnp'].forEach(function (id) { link('tsmc', id); });
  link('sk_hynix', 'hanmi_semi'); link('micron', 'hanmi_semi'); link('samsung_foundry', 'samsung_em'); link('smic', 'naura'); link('smic', 'amec');
  link('asml', 'imec'); link('delta_elec', 'infineon'); link('vertiv', 'infineon'); link('tesla', 'infineon'); link('tesla', 'nxp'); link('tesla', 'renesas');
  link('spectrolab', 'umicore'); link('coherent', 'iqe'); link('lumentum', 'tower'); link('innolight', 'tower'); link('arianespace', 'arianegroup');
  link('tesla_energy', 'catl'); link('wacker', 'elkem'); link('tesla', 'lynas');
  ['vertiv', 'schneider', 'eaton', 'abb', 'ge_vernova', 'siemens_energy', 'hitachi_energy', 'amphenol'].forEach(function (b) { link(b, 'bhp'); link(b, 'codelco'); });
  link('amphenol', 'teck');
  link('globalfoundries', 'soitec'); link('stmicro', 'soitec');

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
    AE: 'UAE', ES: 'Spain', FI: 'Finland', BE: 'Belgium', NO: 'Norway', IN: 'India', SG: 'Singapore', MY: 'Malaysia', CL: 'Chile', SA: 'Saudi Arabia', AT: 'Austria', WW: 'Global / no single country'
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
  var GDESC = {
    'Compute': 'The processors that train and run models: GPUs, TPUs and custom accelerators.',
    'Memory': 'HBM memory stacked beside each AI chip. Without it the processor starves, and only three companies make it.',
    'Foundry & packaging': 'The factories that print the chips and the packaging that joins processor and memory.',
    'Chip tools': 'The machines that make the chips. Lithography (ASML) is the hardest to replace.',
    'Servers & networking': 'The boxes and switches that turn thousands of chips into one cluster.',
    'Optics': 'Lasers and fibre that move data between racks at the speed of light.',
    'Power': 'The electricity: nuclear, gas, solar, batteries and fuel cells.',
    'Grid gear': 'Turbines, transformers and switchgear. Long waits for these slow new data centres.',
    'Cooling & buildings': 'The halls, cooling and backup power that keep chips running.',
    'Minerals & gases': 'Copper, quartz, rare earths and gases at the bottom of the chain.',
    'All Taiwan': 'Every Taiwan-headquartered player in this view.',
    'Design services': 'Companies that design chips for others, then have TSMC build them.',
    'Foundry & memory': 'TSMC and Taiwan\'s other chip factories, including memory.',
    'Packaging & test': 'Joining chips into packages and testing them, plus the substrates they sit on.',
    'Fab tools': 'Local equipment makers that sell to TSMC\'s fab and packaging lines.',
    'Fab facilities': 'The firms that build and supply the factory itself: cleanrooms, gas systems, mask pods and power.',
    'Wafers & masks': 'The silicon wafers, photomasks and circuit-board laminates fabs consume.',
    'Servers': 'Taiwan companies that assemble most of the world\'s AI servers.',
    'Power & cooling': 'Power supplies and cooling for AI racks.',
    'TSMC customers': 'Chip designers that rely on TSMC to build their chips.',
    'Foreign suppliers': 'Non-Taiwan tool and material makers TSMC depends on.'
  };
  [AI_GROUPS, TW_GROUPS].forEach(function (gs) { gs.forEach(function (g) { g.desc = GDESC[g.name] || ''; }); });
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
