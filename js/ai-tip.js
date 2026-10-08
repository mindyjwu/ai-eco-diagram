/* ============================================================
   Hover help: a glossary that explains jargon in place, plus a
   tooltip for anything carrying data-tip="Title|Body".
   AITip.annotate(el) underlines glossary terms inside el.
   ============================================================ */
(function () {
  'use strict';

  /* term, definition + context, optional flags: i = case-insensitive */
  var G = [
    ['GPU', 'Graphics processing unit. The chip that trains and runs most AI models by doing many calculations in parallel. NVIDIA makes most of them.'],
    ['TPU', 'Tensor Processing Unit. Google’s own AI chip, offered as an alternative to NVIDIA GPUs.'],
    ['custom silicon', 'Chips a cloud company designs for its own workloads, usually built by TSMC, to cut cost and reliance on NVIDIA.', 1],
    ['HBM', 'High-bandwidth memory. Stacked memory chips packed beside an AI processor. It is as scarce as the GPU itself.'],
    ['DRAM', 'The fast working memory in every computer and phone.'],
    ['NAND', 'Flash memory used for storage in phones and servers.'],
    ['CoWoS', 'TSMC’s advanced packaging that joins a processor and its memory into one module. A major bottleneck for AI chips.'],
    ['EUV', 'Extreme ultraviolet lithography. The light-based printing step that makes the most advanced chips. Only ASML builds the machines.'],
    ['High-NA', 'The next generation of EUV machines, with finer resolution and a much higher price.'],
    ['lithography', 'Printing a chip’s circuit pattern onto a silicon wafer using light. The most critical, most concentrated step.', 1],
    ['foundry', 'A factory that makes chips designed by other companies. TSMC is the largest.', 1],
    ['foundries', 'Factories that make chips designed by other companies. TSMC is the largest.', 1],
    ['fab', 'A chip factory. Building one costs tens of billions of dollars.', 1],
    ['fabs', 'Chip factories. Building one costs tens of billions of dollars.', 1],
    ['wafer', 'A thin disc of ultra-pure silicon on which hundreds of chips are made at once.', 1],
    ['wafers', 'Thin discs of ultra-pure silicon on which hundreds of chips are made at once.', 1],
    ['photoresist', 'A light-sensitive coating that holds the circuit pattern during lithography. Japan dominates supply.', 1],
    ['photoresists', 'Light-sensitive coatings that hold the circuit pattern during lithography. Japan dominates supply.', 1],
    ['photomask', 'A stencil used to print one layer of a chip.', 1],
    ['photomasks', 'Stencils used to print each layer of a chip.', 1],
    ['ABF', 'Ajinomoto Build-up Film. An insulating film inside chip packages. One company makes nearly all of it.'],
    ['OSAT', 'Outsourced semiconductor assembly and test. Companies that package and test chips for others.'],
    ['EDA', 'Electronic design automation. The software every chip is designed in. Two firms dominate.'],
    ['CUDA', 'NVIDIA’s software platform for programming GPUs. Its ecosystem is NVIDIA’s deepest moat.'],
    ['NVLink', 'NVIDIA’s high-speed links that make many GPUs act as one.'],
    ['etch', 'Carving the printed pattern into the chip using plasma or chemicals.', 1],
    ['deposition', 'Laying down ultra-thin layers of material on a wafer.', 1],
    ['hybrid bonding', 'Joining chips face to face with direct copper contacts. Key for dense memory stacks.', 1],
    ['advanced packaging', 'Joining several chips into one module. As important as the chips themselves for AI.', 1],
    ['polysilicon', 'Ultra-pure silicon (99.999999999%) that wafers are grown from.', 1],
    ['quartz crucible', 'A pure-quartz bowl in which a silicon crystal is grown. It needs some of the purest quartz on Earth.', 1],
    ['gallium', 'A metal used in chips, LEDs and satellite solar cells. China refines most of it.', 1],
    ['germanium', 'A metal used in fibre optics and space solar cells. China controls much of the refining.', 1],
    ['rare earths', 'Metals used in magnets and electronics. China refines most of them.', 1],
    ['hyperscaler', 'A very large cloud company, such as Amazon, Microsoft or Google.', 1],
    ['hyperscalers', 'Very large cloud companies, such as Amazon, Microsoft and Google.', 1],
    ['neocloud', 'A cloud company that rents out GPUs specifically for AI, such as CoreWeave.', 1],
    ['colocation', 'Renting space and power in someone else’s data centre for your servers.', 1],
    ['capex', 'Capital expenditure: money spent on buildings and equipment. AI capex runs to hundreds of billions a year.', 1],
    ['inference', 'Running a trained model to answer a request. It is what happens each time you send a prompt.', 1],
    ['LLM', 'Large language model, the kind of AI behind chatbots.'],
    ['open-weight', 'A model whose trained settings are published so anyone can run it, such as Llama or Qwen.', 1],
    ['agentic', 'AI that carries out multi-step tasks on its own, such as booking or buying, instead of only answering.', 1],
    ['AI agents', 'AI that takes actions for you, such as booking a trip or running a workflow, not just chatting.', 1],
    ['recommendation engine', 'The AI that decides which product, video or ad to show you next.', 1],
    ['robotaxi', 'A driverless ride-hailing car. Waymo is the leader in the US.', 1],
    ['chokepoint', 'A step where one or very few suppliers control supply, so it is hard or slow to replace. Marked ◆ on the map.', 1],
    ['private credit', 'Loans made by funds rather than banks. A major source of money for data centres.', 1],
    ['SMR', 'Small modular reactor. A compact nuclear plant built in a factory. Still mostly pre-commercial.'],
    ['SMRs', 'Small modular reactors. Compact nuclear plants built in factories. Still mostly pre-commercial.'],
    ['HVDC', 'High-voltage direct current. Efficient long-distance power transmission.'],
    ['liquid cooling', 'Cooling servers with liquid instead of air. Dense AI racks are too hot for fans.', 1],
    ['transformers', 'Large electrical equipment that steps grid voltage up or down. Orders now wait years.', 1],
    ['gigawatt', 'One billion watts, roughly a large power plant. Some AI campuses plan several.', 1],
    ['REIT', 'Real estate investment trust. A listed company that owns property, such as data centres.'],
    ['ADR', 'American depositary receipt. A way to buy a foreign company’s shares on a US exchange.'],
    ['IPO', 'Initial public offering. A company’s first sale of shares to the public.'],
    ['Stargate', 'A US$500B AI infrastructure programme announced in 2025 by OpenAI, Oracle and SoftBank.'],
    ['Starship', 'SpaceX’s giant, fully reusable rocket still in testing. If it works, launch costs fall again.'],
    ['Trainium', 'Amazon’s own AI training chip.'],
    ['MTIA', 'Meta’s in-house AI chip.'],
    ['low-orbit', 'Satellites a few hundred kilometres up, close enough for fast internet. Starlink is the best known.', 1],
    ['precision farming', 'Using sensors, imagery and AI to apply seed, water and chemicals only where needed.', 1],
    ['circular financing', 'When a supplier invests in its own customer, who then buys from the supplier. It can inflate demand.', 1]
  ];

  var BY = {}, RX = [];
  G.forEach(function (g) {
    var key = g[2] ? g[0].toLowerCase() : g[0];
    BY[key] = { term: g[0], def: g[1], ci: !!g[2] };
  });
  var cs = [], ci = [];
  Object.keys(BY).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
    var esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    (BY[k].ci ? ci : cs).push(esc);
  });
  RX.push(new RegExp('(^|[^\\w-])(' + cs.join('|') + ')(?![\\w-])', 'g'));
  RX.push(new RegExp('(^|[^\\w-])(' + ci.join('|') + ')(?![\\w-])', 'gi'));

  /* ---------- annotate: underline the first occurrence of each term ---------- */
  function annotate(root) {
    if (!root) return;
    var seen = {};
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (p.closest && p.closest('button, a, .term, .chip, .badge, h1, h2, h3, summary, [data-tip], script, style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var text = node.nodeValue, hits = [];
      RX.forEach(function (rx, ri) {
        rx.lastIndex = 0;
        var m;
        while ((m = rx.exec(text))) {
          var word = m[2], key = ri === 1 ? word.toLowerCase() : word;
          if (!BY[key]) continue;
          var start = m.index + m[1].length;
          if (seen[BY[key].term.toLowerCase()]) continue;
          hits.push({ s: start, e: start + word.length, key: key });
          seen[BY[key].term.toLowerCase()] = 1;
        }
      });
      if (!hits.length) return;
      hits.sort(function (a, b) { return a.s - b.s; });
      var frag = document.createDocumentFragment(), pos = 0;
      hits.forEach(function (h) {
        if (h.s < pos) return;
        if (h.s > pos) frag.appendChild(document.createTextNode(text.slice(pos, h.s)));
        var sp = document.createElement('span');
        sp.className = 'term';
        sp.tabIndex = 0;
        sp.textContent = text.slice(h.s, h.e);
        sp.dataset.tip = BY[h.key].term + '|' + BY[h.key].def;
        frag.appendChild(sp);
        pos = h.e;
      });
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---------- tooltip ---------- */
  var tip = document.createElement('div');
  tip.id = 'aitip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(tip); });
  if (document.body) document.body.appendChild(tip);
  var cur = null, hideT = 0;

  function fill(src) {
    tip.textContent = '';
    var parts = String(src).split('|');
    if (parts.length > 1) {
      var b = document.createElement('b'); b.textContent = parts[0]; tip.appendChild(b);
      var s = document.createElement('span'); s.textContent = parts.slice(1).join('|'); tip.appendChild(s);
    } else tip.textContent = src;
  }
  function place(x, y) {
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var left = Math.min(Math.max(8, x + 14), vw - w - 8);
    var top = y + 18;
    if (top + h > vh - 8) top = Math.max(8, y - h - 14);
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function show(el, x, y) {
    clearTimeout(hideT);
    var src = el.getAttribute('data-tip');
    if (!src) return;
    cur = el;
    fill(src);
    tip.hidden = false;
    if (x == null) { var r = el.getBoundingClientRect(); x = r.left; y = r.bottom - 14; }
    place(x, y);
  }
  function hide() { clearTimeout(hideT); hideT = setTimeout(function () { tip.hidden = true; cur = null; }, 60); }

  document.addEventListener('pointerover', function (ev) {
    if (ev.pointerType && ev.pointerType !== 'mouse') return;
    var el = ev.target.closest && ev.target.closest('[data-tip]');
    if (el) show(el, ev.clientX, ev.clientY);
  });
  document.addEventListener('pointermove', function (ev) {
    if (cur && !tip.hidden && (!ev.pointerType || ev.pointerType === 'mouse')) {
      var el = ev.target.closest && ev.target.closest('[data-tip]');
      if (el === cur) place(ev.clientX, ev.clientY);
    }
  });
  document.addEventListener('pointerout', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-tip]');
    if (el && el === cur) hide();
  });
  document.addEventListener('focusin', function (ev) { var el = ev.target.closest && ev.target.closest('.term'); if (el) show(el); });
  document.addEventListener('focusout', function (ev) { if (ev.target.closest && ev.target.closest('.term')) hide(); });
  /* touch: tap a term to read it, tap elsewhere to dismiss */
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('.term');
    if (el && (ev.pointerType === 'touch' || (window.matchMedia && matchMedia('(hover: none)').matches))) {
      if (cur === el && !tip.hidden) { tip.hidden = true; cur = null; } else show(el);
    } else if (!tip.hidden && !(ev.target.closest && ev.target.closest('#aitip'))) { tip.hidden = true; cur = null; }
  });
  document.addEventListener('scroll', function () { tip.hidden = true; }, true);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') tip.hidden = true; });

  window.AITip = { annotate: annotate, show: show, hide: hide };
})();
