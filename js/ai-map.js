/* ============================================================
   THE AI MONEY MAP — interaction
   Plain JS. Nodes are real DOM buttons; edges are one SVG overlay
   that is redrawn only for the active selection.
   ============================================================ */
(function () {
  'use strict';
  var D = window.AIMAP;
  var LAYERS = D.LAYERS, NODES = D.NODES, JOURNEYS = D.JOURNEYS;

  /* ---------- index ---------- */
  var PARENT = {
    'Alphabet': 'GOOGL', 'Alphabet subsidiary': 'GOOGL', 'Alphabet research': 'GOOGL',
    'Amazon': 'AMZN', 'Meta': 'META', 'Samsung': '005930.KS', 'Intel': 'INTC', 'Apple': 'AAPL',
    'Microsoft': 'MSFT', 'Tesla': 'TSLA', 'Blackstone': 'BX', 'Boeing': 'BA', 'Hitachi': '6501.T',
    'Atlas Copco': 'ATCO-A.ST'
  };
  var by = {}, down = {};
  NODES.forEach(function (n) { by[n.id] = n; });
  NODES.forEach(function (n) {
    n.up.forEach(function (u) { (down[u] = down[u] || []).push(n.id); });
    n.pq = n.q || PARENT[n.s] || '';
    if (n.l === 0) n.kind = 'life';
    else if (n.pq) n.kind = 'public';
    else if (/government|market structure|resource|commodity|metals|sovereign|technology/i.test(n.s || '')) n.kind = 'other';
    else n.kind = 'private';
    n.hay = (n.n + ' ' + n.id + ' ' + (n.pq || '') + ' ' + (n.s || '') + ' ' + (n.w || '')).toLowerCase();
  });
  var edgeCount = NODES.reduce(function (a, n) { return a + n.up.length; }, 0);

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  /* ---------- logos: try several favicon sources in turn; cache the winner per domain ---------- */
  var LOGO_KEY = 'aimap-logos-v2';
  var logoStore = {}, logoMemo = {};
  try { logoStore = JSON.parse(localStorage.getItem(LOGO_KEY) || '{}') || {}; } catch (e) { logoStore = {}; }
  window.__logoStats = { ok: 0, fail: 0, bySource: {} };
  function probeImg(u, min) {
    return new Promise(function (resolve) {
      var im = new Image(), done = false;
      function fin(v) { if (!done) { done = true; clearTimeout(t); resolve(v); } }
      var t = setTimeout(function () { fin(null); }, 7000);
      im.referrerPolicy = 'no-referrer';
      im.onload = function () { fin(im.naturalWidth >= min ? u : null); };
      im.onerror = function () { fin(null); };
      im.src = u;
    });
  }
  function logoSources(d) {
    var e = encodeURIComponent(d);
    return [
      ['google', 'https://www.google.com/s2/favicons?domain=' + e + '&sz=128', 32],
      ['gstatic', 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://' + e + '&size=128', 32],
      ['duckduckgo', 'https://icons.duckduckgo.com/ip3/' + d + '.ico', 16],
      ['site', 'https://' + d + '/favicon.ico', 16]
    ];
  }
  /* logos saved in the repo (see scripts/fetch-logos.mjs) win over any third-party service */
  var logoManifest = (window.fetch ? fetch('assets/logos/manifest.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }) : Promise.resolve({}));
  function findLogo(d) {
    if (logoMemo[d]) return logoMemo[d];
    var p = logoManifest.then(function (m) {
      if (m && m[d]) {
        return probeImg('assets/logos/' + m[d], 16).then(function (u) {
          if (u) { window.__logoStats.ok++; window.__logoStats.bySource.local = (window.__logoStats.bySource.local || 0) + 1; return u; }
          return viaServices(d);
        });
      }
      return viaServices(d);
    });
    logoMemo[d] = p;
    return p;
  }
  function viaServices(d) {
    if (logoStore[d]) return probeImg(logoStore[d], 16).then(function (u) { return u || trySources(d); });
    return trySources(d);
  }
  function trySources(d) {
    var list = logoSources(d), i = 0;
    return (function next() {
      if (i >= list.length) { window.__logoStats.fail++; return Promise.resolve(null); }
      var src = list[i++];
      return probeImg(src[1], src[2]).then(function (u) {
        if (!u) return next();
        window.__logoStats.ok++;
        window.__logoStats.bySource[src[0]] = (window.__logoStats.bySource[src[0]] || 0) + 1;
        logoStore[d] = u;
        try { localStorage.setItem(LOGO_KEY, JSON.stringify(logoStore)); } catch (e) {}
        return u;
      });
    })();
  }
  function logo(n, size) {
    var wrap = el('span', 'lg lg-' + size);
    if (n.e && !n.d) { wrap.classList.add('lg-emoji'); wrap.textContent = n.e; wrap.setAttribute('aria-hidden', 'true'); return wrap; }
    if (n.e) { wrap.classList.add('lg-emoji'); wrap.textContent = n.e; return wrap; }
    var mono = el('span', 'lg-mono', n.n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase());
    wrap.appendChild(mono);
    findLogo(n.d).then(function (u) {
      if (!u) return;
      var img = new Image();
      img.alt = ''; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.onload = function () { wrap.appendChild(img); mono.style.display = 'none'; };
      img.src = u;
    });
    return wrap;
  }
  var mq = window.matchMedia('(max-width: 900px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- state ---------- */
  var state = { sel: null, hover: null, type: 'all', choke: false, country: '', view: 'all', group: -1, query: '', depth: 'full', journey: null, mode: 'layers' };
  var COUNTRIES = D.COUNTRIES || {}, VIEWS = D.VIEWS || [{ id: 'all', name: 'Everything' }];
  var VIEW = { def: VIEWS[0], set: null };
  var nodeEls = {};

  /* ---------- colour: one hue per zone, a muted shade per layer ---------- */
  var ZONES = D.ZONES, zoneOf = [];
  ZONES.forEach(function (z, zi) {
    z.a = LAYERS.findIndex(function (L) { return L.id === z.from; });
    z.b = LAYERS.findIndex(function (L) { return L.id === z.to; });
    for (var i = z.a; i <= z.b; i++) zoneOf[i] = zi;
  });
  function lerp(a, b, t) { return a + (b - a) * t; }
  function zoneColor(zi, t) {
    var st = ZONES[zi].stops, x = t * (st.length - 1), i = Math.min(st.length - 2, Math.floor(x)), f = x - i;
    return [lerp(st[i][0], st[i + 1][0], f), lerp(st[i][1], st[i + 1][1], f), lerp(st[i][2], st[i + 1][2], f)];
  }
  function setPal(el, layer) {
    var zi = zoneOf[layer], z = ZONES[zi], n = z.b - z.a, k = layer - z.a, t = n ? k / n : 0.5;
    var c = zoneColor(zi, t);
    var l = c[2] + (n >= 3 ? (k % 2 ? 4 : -4) : 0);          /* alternate light/dark so neighbours stay distinct */
    el.style.setProperty('--h', Math.round((c[0] + 360) % 360));
    el.style.setProperty('--s', Math.round(c[1]) + '%');
    el.style.setProperty('--l', Math.round(l) + '%');
  }
  function setZonePal(el, zi) {
    var c = zoneColor(zi, 0.5);
    el.style.setProperty('--h', Math.round((c[0] + 360) % 360));
    el.style.setProperty('--s', Math.round(c[1]) + '%');
    el.style.setProperty('--l', Math.round(c[2]) + '%');
  }
  /* first sentence, for tooltips and the short form of panel text */
  function firstSentence(t) { var m = /^(.+?[.!?])(\s|$)/.exec(t || ''); return m ? m[1] : (t || ''); }
  function annotate(root) { if (window.AITip) window.AITip.annotate(root); }

  /* hover text for a category: what it is, why it matters, who is in it, where they are based */
  function catTip(title, sub, take, nodes, zoom) {
    var rank = nodes.slice().sort(function (a, b) { return (b.up.length + (down[b.id] || []).length + (b.c ? 3 : 0)) - (a.up.length + (down[a.id] || []).length + (a.c ? 3 : 0)); });
    var top = rank.slice(0, 4).map(function (n) { return n.n.replace(/ \(.*\)$/, ''); });
    var cc = {};
    nodes.forEach(function (n) { if (n.hq && n.hq !== 'WW') cc[n.hq] = (cc[n.hq] || 0) + 1; });
    var cs = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; }).slice(0, 3).map(function (k) { return countryName(k) + ' ' + cc[k]; });
    var ch = nodes.filter(function (n) { return n.c; }).length;
    return title + ' (' + nodes.length + ')|' + sub + (take ? ' ' + take : '') + (top.length ? ' Includes ' + top.join(', ') + '.' : '') +
      (cs.length ? ' Based mostly in ' + cs.join(', ') + '.' : '') + (ch ? ' ' + ch + ' bottleneck' + (ch > 1 ? 's' : '') + '.' : '') + (zoom ? ' Click to zoom in.' : '');
  }
  function nodeTip(n) { return n.n + (n.pq ? ' · ' + n.pq : '') + '|' + firstSentence(n.w) + (n.c && n.cw ? ' \u25C6 ' + n.cw : ''); }

  /* ---------- build the layers ---------- */
  var layersRoot = $('#layers');
  LAYERS.forEach(function (L, i) {
    var sec = el('section', 'layer');
    sec.id = 'layer-' + L.id;
    sec.dataset.l = i;
    setPal(sec, i);
    var head = el('header', 'layer-h');
    var num = el('span', 'layer-n', String(i).padStart(2, '0'));
    var t = el('div', 'layer-t');
    var h2 = el('h2', null, L.name); t.appendChild(h2);
    head.dataset.tip = catTip(L.name, L.sub, L.take, NODES.filter(function (n) { return n.l === i; }), false);
    t.appendChild(el('p', 'layer-sub', L.sub));
    head.appendChild(num); head.appendChild(t);
    var info = el('details', 'layer-info');
    var sum = el('summary', null, 'More');
    info.appendChild(sum);
    var b1 = el('p'); var s1 = el('strong', null, 'Take. '); b1.appendChild(s1); b1.appendChild(document.createTextNode(L.take));
    var b2 = el('p'); var s2 = el('strong', null, 'Build. '); b2.appendChild(s2); b2.appendChild(document.createTextNode(L.build));
    info.appendChild(b1); info.appendChild(b2);
    t.appendChild(info);
    var grid = el('div', 'nodes');
    NODES.filter(function (n) { return n.l === i; }).forEach(function (n) {
      var b = el('button', 'node k-' + n.kind);
      b.type = 'button';
      b.dataset.id = n.id;
      b.dataset.tip = nodeTip(n);
      b.setAttribute('aria-label', n.n + (n.pq ? ', ' + n.pq : '') + (n.hq ? ', ' + countryName(n.hq) : '') + (n.c ? ', bottleneck' : ''));
      b.appendChild(logo(n, 'm'));
      b.appendChild(el('span', 'node-n', n.n));
      var sub = n.kind === 'public' ? n.pq : n.kind === 'private' ? 'Private' : n.kind === 'life' ? '' : (n.kind === 'other' ? '' : '');
      sub = [sub, hqLabel(n)].filter(Boolean).join(' · ');
      if (sub) b.appendChild(el('span', 'node-t', sub));
      if (n.c) { var c = el('span', 'node-c', '◆'); b.appendChild(c); }
      grid.appendChild(b);
      nodeEls[n.id] = b;
    });
    sec.appendChild(head);
    sec.appendChild(grid);
    annotate(t);
    layersRoot.appendChild(sec);
    if (i < LAYERS.length - 1) {
      var flow = el('div', 'flow');
      flow.setAttribute('aria-hidden', 'true');
      flow.innerHTML = '<span>↓ dollars flow down</span><span>chips, power &amp; materials flow up ↑</span>';
      layersRoot.appendChild(flow);
    }
  });

  /* ---------- chains ---------- */
  function chain(id, maxDepth) {
    var ups = {}, downs = {}, edges = {};
    function walk(start, dir) {
      var seen = {}, q = [[start, 0]];
      seen[start] = 1;
      while (q.length) {
        var cur = q.shift(), x = cur[0], d = cur[1];
        if (d >= maxDepth) continue;
        var nbrs = dir === 'up' ? by[x].up : (down[x] || []);
        nbrs.forEach(function (y) {
          var key = dir === 'up' ? x + '>' + y : y + '>' + x;
          if (!edges[key]) edges[key] = { a: dir === 'up' ? x : y, b: dir === 'up' ? y : x, dir: dir, d: d + 1 };
          (dir === 'up' ? ups : downs)[y] = 1;
          if (!seen[y]) { seen[y] = 1; q.push([y, d + 1]); }
        });
      }
    }
    walk(id, 'up'); walk(id, 'down');
    return { id: id, ups: ups, downs: downs, edges: Object.keys(edges).map(function (k) { return edges[k]; }) };
  }

  /* ---------- filters ---------- */
  function matchesFilters(n) {
    if (state.type === 'public' && n.kind !== 'public') return false;
    if (state.type === 'private' && n.kind !== 'private') return false;
    if (state.type === 'other' && n.kind !== 'other') return false;
    if (state.choke && !n.c) return false;
    if (state.country && n.hq !== state.country) return false;
    if (state.query && n.hay.indexOf(state.query) === -1) return false;
    return true;
  }
  function inView(n) { return !VIEW.set || VIEW.set[n.id] !== undefined; }
  function countryName(c) { return c === 'WW' ? 'Global' : (COUNTRIES[c] || c); }
  function hqLabel(n) { return n.hq && n.hq !== 'WW' ? n.hq : ''; }
  /* a view = the layers (and extra players) it is about, plus whatever they depend on, `depth` steps down */
  function computeView(v) {
    if (!v || v.id === 'all') return null;
    var set = {}, q = [], ex = v.exclude || [];
    NODES.forEach(function (n) { if ((v.layers || []).indexOf(LAYERS[n.l].id) > -1 || (v.hq && n.hq === v.hq)) { set[n.id] = 0; q.push(n.id); } });
    (v.extra || []).forEach(function (id) { if (by[id] && set[id] === undefined) { set[id] = 0; q.push(id); } });
    (v.customers || []).forEach(function (id) { (down[id] || []).forEach(function (c) { if (set[c] === undefined) set[c] = v.depth || 99; }); });   /* shown for context, not expanded */
    while (q.length) {
      var x = q.shift(), d = set[x];
      if (d >= (v.depth || 99)) continue;
      by[x].up.forEach(function (u) {
        if (set[u] === undefined && ex.indexOf(LAYERS[by[u].l].id) < 0) { set[u] = d + 1; q.push(u); }
      });
    }
    return set;
  }

  /* ---------- edge drawing ---------- */
  var svg = $('#edges'), map = $('#map');
  var NS = 'http://www.w3.org/2000/svg';
  var drawn = [];
  function rectOf(id) {
    var r = nodeEls[id].getBoundingClientRect(), m = map.getBoundingClientRect();
    return { x: r.left - m.left + r.width / 2, t: r.top - m.top, b: r.bottom - m.top, cx: r.left - m.left };
  }
  function drawEdges(list) {
    drawn = list;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('width', map.scrollWidth);
    svg.setAttribute('height', map.scrollHeight);
    list.forEach(function (e) {
      var A = rectOf(e.a), B = rectOf(e.b), d;
      if (Math.abs(A.t - B.t) < 8) {
        var y0 = A.b, drop = 34 + Math.min(60, Math.abs(A.x - B.x) * 0.08);
        d = 'M' + A.x + ' ' + y0 + ' C' + A.x + ' ' + (y0 + drop) + ',' + B.x + ' ' + (y0 + drop) + ',' + B.x + ' ' + y0;
      } else {
        var y1 = A.b, y2 = B.t, dy = Math.max(40, (y2 - y1) * 0.5);
        d = 'M' + A.x + ' ' + y1 + ' C' + A.x + ' ' + (y1 + dy) + ',' + B.x + ' ' + (y2 - dy) + ',' + B.x + ' ' + y2;
      }
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'edge ' + e.cls);
      svg.appendChild(p);
    });
  }

  /* ---------- highlight ---------- */
  var NODE_CLASSES = ['sel', 'sup', 'cus', 'dim', 'jn', 'off'];
  function apply() {
    var active = null, cls = {};
    var edges = [];
    if (state.journey) {
      var steps = state.journey.j.steps, cur = state.journey.i;
      active = true;
      steps.forEach(function (s, i) { cls[s[0]] = i === cur ? 'sel' : (i < cur ? 'jn' : 'jn'); });
      for (var i = 1; i <= cur; i++) edges.push({ a: steps[i - 1][0], b: steps[i][0], cls: 'jn' + (i === cur ? ' strong' : '') });
    } else {
      var focus = state.sel || state.hover;
      if (focus) {
        active = true;
        var depth = state.sel ? (state.depth === 'direct' ? 1 : 99) : 1;
        var c = chain(focus, depth);
        cls[focus] = 'sel';
        Object.keys(c.ups).forEach(function (k) { if (!cls[k]) cls[k] = 'sup'; });
        Object.keys(c.downs).forEach(function (k) { if (!cls[k]) cls[k] = 'cus'; });
        c.edges.forEach(function (e) { edges.push({ a: e.a, b: e.b, cls: (e.dir === 'up' ? 'sup' : 'cus') + (e.d === 1 ? ' strong' : '') }); });
      } else if (state.group > -1 && VIEW.def.groups) {
        active = true;
        groupIds(VIEW.def.groups[state.group]).forEach(function (id) { cls[id] = 'sup'; });
      }
    }
    edges = edges.filter(function (e) { return inView(by[e.a]) && inView(by[e.b]); });
    var shown = 0, total = 0;
    NODES.forEach(function (n) {
      var e = nodeEls[n.id];
      NODE_CLASSES.forEach(function (k) { e.classList.remove(k); });
      if (!inView(n)) return;
      total++;
      var ok = matchesFilters(n);
      if (ok) shown++;
      if (active) { if (cls[n.id]) e.classList.add(cls[n.id]); else e.classList.add('dim'); }
      if (!ok) e.classList.add('off');
    });
    var filtered = state.type !== 'all' || state.choke || state.country || state.query;
    $('#count').textContent = filtered ? shown + ' of ' + total : total + ' players';
    map.classList.toggle('has-active', !!active);
    if (state.mode === 'map') fmUpdate(cls, edges, active); else drawEdges(edges);
  }

  /* ---------- detail panel ---------- */
  var panel = $('#panel'), pbody = $('#panel-body');
  var KIND_LABEL = { life: 'Daily life', public: 'Public company', private: 'Private company', other: 'Not a company' };
  function chipList(ids, emptyMsg) {
    var wrap = el('div', 'chips');
    if (!ids.length) { wrap.appendChild(el('span', 'muted', emptyMsg)); return wrap; }
    ids.forEach(function (id) {
      var n = by[id];
      var b = el('button', 'chip');
      b.type = 'button';
      b.appendChild(logo(n, 's'));
      b.appendChild(el('span', null, n.n));
      b.addEventListener('click', function () { select(id, { scroll: true }); });
      wrap.appendChild(b);
    });
    return wrap;
  }
  /* what flows along a link: buyer <- supplier */
  function flowOf(a, b) {
    if (!D.FLOW) return '';
    if (by[a].up.indexOf(b) > -1) return D.FLOW(a, b);
    if (by[b].up.indexOf(a) > -1) return D.FLOW(b, a);
    return '';
  }
  function flowList(ids, emptyMsg, flowFor) {
    var wrap = el('div', 'flows');
    if (!ids.length) { wrap.appendChild(el('span', 'muted', emptyMsg)); return wrap; }
    ids.forEach(function (id) {
      var n = by[id], b = el('button', 'frow'); b.type = 'button';
      b.appendChild(logo(n, 's'));
      var t = el('span', 'frow-t'); t.appendChild(el('span', 'frow-n', n.n));
      var f = flowFor(id); if (f) t.appendChild(el('span', 'frow-f', f));
      b.appendChild(t);
      b.addEventListener('click', function () { select(id, { scroll: true }); });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function section(title, bodyNode) {
    var s = el('section', 'p-sec');
    s.appendChild(el('h3', null, title));
    s.appendChild(bodyNode);
    return s;
  }
  /* one sentence by default, with a More toggle for the rest */
  function para(text, extra) {
    var wrap = el('div', 'short');
    var first = firstSentence(text), rest = (text || '').slice(first.length).trim();
    wrap.appendChild(el('p', null, first));
    if (rest || extra) {
      var more = el('div', 'rest'); more.hidden = true;
      if (rest) more.appendChild(el('p', null, rest));
      if (extra) more.appendChild(extra);
      var btn = el('button', 'more', 'More'); btn.type = 'button';
      btn.addEventListener('click', function () { more.hidden = !more.hidden; btn.textContent = more.hidden ? 'More' : 'Less'; annotate(more); });
      wrap.appendChild(btn); wrap.appendChild(more);
    }
    return wrap;
  }
  function renderPanel(id) {
    var n = by[id], L = LAYERS[n.l];
    pbody.textContent = '';
    setPal(pbody, n.l);
    var head = el('div', 'p-head');
    head.appendChild(logo(n, 'l'));
    var ht = el('div', 'p-ht');
    ht.appendChild(el('h2', null, n.n));
    var badges = el('div', 'badges');
    var kindTxt = KIND_LABEL[n.kind];
    if (n.kind === 'public') kindTxt += ' · ' + n.pq;
    badges.appendChild(el('span', 'badge k-' + n.kind, kindTxt));
    if (n.s && n.kind !== 'life') badges.appendChild(el('span', 'badge soft', n.s));
    if (n.hq) badges.appendChild(el('span', 'badge soft', countryName(n.hq)));
    if (n.c) badges.appendChild(el('span', 'badge warn', '◆ Bottleneck'));
    ht.appendChild(badges);
    ht.appendChild(el('div', 'p-layer', 'Layer ' + String(n.l).padStart(2, '0') + ' · ' + L.name));
    head.appendChild(ht);
    pbody.appendChild(head);

    pbody.appendChild(section('What it does', para(n.w)));
    pbody.appendChild(section('Why it matters', para(n.y)));
    if (n.cw) pbody.appendChild(section('Why it is a bottleneck', para(n.cw)));
    if (n.geo) pbody.appendChild(section('Where it comes from', para(n.geo)));
    if (n.loc) pbody.appendChild(section('Where in Taiwan', para(n.loc)));
    if (n.p) pbody.appendChild(section('Outlook', para(n.p + ' (Qualitative, to about mid-2026; not live data.)')));
    var bp = el('p', 'angle'); bp.appendChild(el('strong', null, 'Build. ')); bp.appendChild(document.createTextNode(L.build));
    pbody.appendChild(section('Opportunity', para(n.o || L.take, bp)));
    var fin = LAYERS[n.l].id === 'capital';
    pbody.appendChild(section(fin ? 'Funds' : 'Depends on', flowList(n.up, 'Nothing mapped below.', function (u) { return flowOf(id, u); })));
    pbody.appendChild(section(fin ? 'Funded by' : 'Used by', flowList(down[id] || [], 'Nothing mapped above.', function (b) { return flowOf(b, id); })));

    var links = el('div', 'p-links');
    if (n.d) { var a = el('a', null, 'Website ↗'); a.href = 'https://' + n.d; a.target = '_blank'; a.rel = 'noopener'; links.appendChild(a); }
    if (n.pq) { var q = el('a', null, 'Live quote ↗'); q.href = 'https://finance.yahoo.com/quote/' + encodeURIComponent(n.pq); q.target = '_blank'; q.rel = 'noopener'; links.appendChild(q); }
    var sh = el('button', null, 'Copy link'); sh.type = 'button';
    sh.addEventListener('click', function () {
      var url = location.origin + location.pathname + '#' + (state.mode === 'layers' ? 'layers&' : '') + 'n=' + id;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { sh.textContent = 'Copied ✓'; }, function () { sh.textContent = url; });
      setTimeout(function () { sh.textContent = 'Copy link'; }, 2200);
    });
    links.appendChild(sh);
    pbody.appendChild(links);
    pbody.appendChild(el('p', 'fine', 'Educational, not investment advice. Links are typical relationships, simplified.'));
    annotate(pbody);
    pbody.scrollTop = 0;
  }
  function openPanel(id) {
    renderPanel(id);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-panel');
  }
  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-panel');
  }

  /* ---------- selection ---------- */
  function setHash(h) {
    var parts = [];
    if (state.mode === 'layers') parts.push('layers');
    if (state.view !== 'all') parts.push('view=' + state.view);
    if (state.country) parts.push('country=' + state.country);
    if (state.choke) parts.push('lens=choke');
    if (state.type !== 'all') parts.push('lens=' + state.type);
    if (h) parts.push(h);
    var full = parts.join('&');
    try { history.replaceState(null, '', full ? '#' + full : location.pathname + location.search); } catch (e) {}
  }
  function select(id, opts) {
    endJourney(true);
    if (!inView(by[id])) setView('all', { keep: true });
    state.sel = id; state.hover = null; state.group = -1; syncGroups();
    openPanel(id);
    apply();
    setHash('n=' + id);
    if (state.mode === 'map') { fmFocus(id); } else if ((opts && opts.scroll) || mq.matches) {
      var e = nodeEls[id];
      setTimeout(function () { e.scrollIntoView({ block: mq.matches ? 'start' : 'center', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }, 60);
    }
  }
  function clearSel() {
    state.sel = null; state.hover = null;
    closePanel(); apply(); setHash('');
  }
  document.addEventListener('click', function (ev) {                 /* a click outside any control or node clears a group highlight */
    if (state.group > -1 && document.contains(ev.target) && !ev.target.closest('#fm-groups, .fn, .node, .bar, #panel')) { state.group = -1; syncGroups(); apply(); }
  });

  layersRoot.addEventListener('click', function (ev) {
    var b = ev.target.closest('.node');
    if (!b) return;
    var id = b.dataset.id;
    if (state.sel === id) clearSel(); else select(id);
  });
  layersRoot.addEventListener('mouseover', function (ev) {
    if (state.sel || state.journey || mq.matches) return;
    var b = ev.target.closest('.node');
    var id = b ? b.dataset.id : null;
    if (id !== state.hover) { state.hover = id; apply(); }
  });
  layersRoot.addEventListener('mouseleave', function () {
    if (state.hover) { state.hover = null; apply(); }
  });
  $('#panel-close').addEventListener('click', clearSel);

  /* ---------- controls ---------- */
  var search = $('#q');
  search.addEventListener('input', function () { state.query = search.value.trim().toLowerCase(); apply(); });
  search.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') {
      var m = NODES.filter(function (n) { return inView(n) && matchesFilters(n); })[0];
      if (m && state.query) { select(m.id, { scroll: true }); }
    }
    if (ev.key === 'Escape') { search.value = ''; state.query = ''; apply(); search.blur(); }
  });
  var selType = $('#type'), selCountry = $('#country'), btnChoke = $('#choke'), viewsEl = $('#views');
  function syncFilters() {
    selType.value = state.type; selType.classList.toggle('on', state.type !== 'all');
    selCountry.value = state.country; selCountry.classList.toggle('on', !!state.country);
    btnChoke.setAttribute('aria-pressed', String(state.choke));
  }
  /* kept for old links like #lens=choke */
  function setLens(l) {
    if (l === 'choke') { state.choke = true; state.type = 'all'; }
    else if (l === 'all') { state.choke = false; state.type = 'all'; }
    else { state.type = l; }
    syncFilters(); apply(); setHash(state.sel ? 'n=' + state.sel : '');
  }
  selType.addEventListener('change', function () { state.type = selType.value; syncFilters(); apply(); setHash(state.sel ? 'n=' + state.sel : ''); });
  selCountry.addEventListener('change', function () { state.country = selCountry.value; syncFilters(); apply(); setHash(state.sel ? 'n=' + state.sel : ''); });
  btnChoke.addEventListener('click', function () { state.choke = !state.choke; syncFilters(); apply(); setHash(state.sel ? 'n=' + state.sel : ''); });

  /* ---------- industry views ---------- */
  VIEWS.forEach(function (v) {
    var b = el('button', null, v.name); b.type = 'button'; b.dataset.view = v.id; b.setAttribute('aria-pressed', String(v.id === 'all')); b.dataset.tip = v.name + '|' + (v.blurb || '');
    b.addEventListener('click', function () { setView(v.id); });
    viewsEl.appendChild(b);
  });
  function refreshCountries() {
    var cnt = {};
    NODES.forEach(function (n) { if (inView(n) && n.hq && n.hq !== 'WW') cnt[n.hq] = (cnt[n.hq] || 0) + 1; });
    var keys = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || (countryName(a) < countryName(b) ? -1 : 1); });
    selCountry.textContent = '';
    var o0 = el('option', null, 'Any country'); o0.value = ''; selCountry.appendChild(o0);
    keys.forEach(function (k) { var o = el('option', null, countryName(k) + ' (' + cnt[k] + ')'); o.value = k; selCountry.appendChild(o); });
    if (state.country && !cnt[state.country]) state.country = '';
    syncFilters();
  }
  var groupsEl = $('#fm-groups');
  function groupIds(g) { return g.hq ? NODES.filter(function (n) { return n.hq === g.hq && inView(n); }).map(function (n) { return n.id; }) : g.ids; }
  function syncGroups() {
    var gs = VIEW.def.groups;
    groupsEl.textContent = '';
    groupsEl.hidden = !gs;
    var top = gs ? 56 : 12;
    if (FMC.TOP !== top) { FMC.TOP = top; if (FM.ready) { FM.sig = ''; } }
    if (!gs) return;
    groupsEl.appendChild(el('h3', null, 'Highlight'));
    gs.forEach(function (g, i) {
      var b = el('button', null, g.name); b.type = 'button'; b.setAttribute('aria-pressed', String(i === state.group));
      if (g.desc) b.dataset.tip = g.name + '|' + g.desc;
      b.addEventListener('click', function () {
        state.group = state.group === i ? -1 : i;
        if (state.group > -1) { endJourney(true); state.sel = null; closePanel(); setHash(''); }
        syncGroups(); apply();
        if (state.group > -1 && state.mode === 'map') fmFlyIds(groupIds(g));
      });
      groupsEl.appendChild(b);
    });
  }
  function layersViewApply() {
    document.querySelectorAll('.node').forEach(function (b) { b.hidden = !inView(by[b.dataset.id]); });
    document.querySelectorAll('.layer').forEach(function (sec) { sec.hidden = !sec.querySelector('.node:not([hidden])'); });
    document.querySelectorAll('.flow').forEach(function (f) { f.hidden = VIEW.set !== null; });
  }
  function setView(id, opts) {
    var v = VIEWS.filter(function (x) { return x.id === id; })[0] || VIEWS[0];
    if (v === VIEW.def && !(opts && opts.force)) return;
    VIEW.def = v; VIEW.set = computeView(v); state.view = v.id; state.group = -1;
    if (state.journey) endJourney(true);
    if (state.sel && !inView(by[state.sel])) { state.sel = null; closePanel(); }
    state.hover = null;
    viewsEl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v.id)); });
    $('#viewnote').textContent = v.blurb || '';
    refreshCountries(); syncGroups(); layersViewApply();
    if (FM.ready) fmViewApply(); else apply();
    if (state.mode !== 'map') redraw();
    if (!(opts && opts.keep)) setHash(state.sel ? 'n=' + state.sel : '');
  }
  document.querySelectorAll('[data-depth]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.depth = b.dataset.depth;
      document.querySelectorAll('[data-depth]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
  });
  $('#reset').addEventListener('click', function () {
    search.value = ''; state.query = '';
    endJourney(true); state.sel = null; closePanel(); state.type = 'all'; state.choke = false; state.country = ''; syncFilters(); setView('all'); setHash(''); apply();
    if (state.mode === 'map') { fmFitAll(true); apply(); } else window.scrollTo({ top: $('#map-top').offsetTop - 90, behavior: reduced ? 'auto' : 'smooth' });
  });
  document.addEventListener('keydown', function (ev) {
    var tag = (document.activeElement || {}).tagName;
    if (ev.key === '/' && tag !== 'INPUT') { ev.preventDefault(); search.focus(); }
    if (ev.key === 'Escape') {
      if (state.journey) endJourney(); else if (state.sel) clearSel();
    }
    if (state.journey && tag !== 'INPUT') {
      if (ev.key === 'ArrowRight') stepJourney(1);
      if (ev.key === 'ArrowLeft') stepJourney(-1);
    }
  });

  /* "you are here" layer tracker */
  var here = $('#here');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var i = +en.target.dataset.l;
          if (here) here.textContent = String(i).padStart(2, '0') + ' · ' + LAYERS[i].name;
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.layer').forEach(function (s) { io.observe(s); });
  }

  /* ---------- journeys ---------- */
  var jcard = $('#journey'), jmenu = $('#jmenu'), jbtn = $('#jbtn');
  JOURNEYS.forEach(function (j) {
    var b = el('button', 'jitem'); b.type = 'button'; b.setAttribute('role', 'menuitem');
    b.appendChild(el('strong', null, j.title));
    b.appendChild(el('span', null, j.blurb));
    b.appendChild(el('em', null, j.steps.length + ' steps \u2192'));
    b.addEventListener('click', function () { closeJMenu(); startJourney(j.id); });
    jmenu.appendChild(b);
  });
  function closeJMenu() { jmenu.hidden = true; jbtn.setAttribute('aria-expanded', 'false'); }
  jbtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    var open = jmenu.hidden;
    jmenu.hidden = !open; jbtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (ev) { if (!jmenu.hidden && !ev.target.closest('#jmenu')) closeJMenu(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeJMenu(); });
  function startJourney(id) {
    var j = JOURNEYS.filter(function (x) { return x.id === id; })[0];
    if (!j) return;
    if (state.view !== 'all') setView('all', { keep: true });
    state.sel = null; state.hover = null; state.group = -1; syncGroups(); closePanel();
    state.journey = { j: j, i: 0 };
    jcard.hidden = false;
    document.body.classList.add('in-journey');
    renderJourney(true);
    setHash('j=' + id);
  }
  function renderJourney(scroll) {
    var jj = state.journey, s = jj.j.steps[jj.i], n = by[s[0]];
    jcard.textContent = '';
    var top = el('div', 'j-top');
    top.appendChild(el('span', 'j-title', jj.j.title));
    var x = el('button', 'j-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'End journey');
    x.addEventListener('click', function () { endJourney(); });
    top.appendChild(x);
    var row = el('div', 'j-row');
    row.appendChild(logo(n, 'l'));
    var tx = el('div', 'j-tx');
    tx.appendChild(el('div', 'j-n', n.n));
    tx.appendChild(el('div', 'j-l', 'Layer ' + String(n.l).padStart(2, '0') + ' · ' + LAYERS[n.l].name));
    tx.appendChild(el('p', 'j-p', s[1]));
    row.appendChild(tx);
    var nav = el('div', 'j-nav');
    var prev = el('button', 'j-b', '← Back'); prev.type = 'button'; prev.disabled = jj.i === 0;
    prev.addEventListener('click', function () { stepJourney(-1); });
    var dots = el('div', 'j-dots');
    jj.j.steps.forEach(function (_, i) { var d = el('span', i <= jj.i ? 'on' : ''); dots.appendChild(d); });
    var last = jj.i === jj.j.steps.length - 1;
    var next = el('button', 'j-b primary', last ? 'Open details' : 'Next →'); next.type = 'button';
    next.addEventListener('click', function () { if (last) select(s[0], { scroll: true }); else stepJourney(1); });
    nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
    jcard.appendChild(top); jcard.appendChild(row); jcard.appendChild(nav);
    apply();
    if (scroll) {
      if (state.mode === 'map') fmFlyNode(s[0], 1.1); else nodeEls[s[0]].scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  function stepJourney(d) {
    if (!state.journey) return;
    var i = state.journey.i + d;
    if (i < 0 || i >= state.journey.j.steps.length) return;
    state.journey.i = i;
    renderJourney(true);
  }
  function endJourney(silent) {
    if (!state.journey) return;
    state.journey = null; jcard.hidden = true;
    document.body.classList.remove('in-journey');
    if (!silent) { apply(); setHash(''); }
  }

  /* "four ways in" buttons */
  document.querySelectorAll('[data-go-lens]').forEach(function (b) {
    b.addEventListener('click', function () {
      setLens(b.dataset.goLens);
      window.scrollTo({ top: $('#map-top').offsetTop - 90, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================
     FULL MAP: a space-filling, zoomable layout.
     The five zones are packed into blocks that suit the window's shape
     (wide laptops get side-by-side blocks, phones get a stack). Icons,
     names and titles all live in one scene and scale together, so nothing
     can overlap at any zoom. Zoom out stops at the fitted view; names
     appear once they are big enough to read.
     ============================================================ */
  var FM = { ready: false, zc: '', active: false, sig: '', kfit: 0.3, kmin: 0.3 };
  var FMC = { CW: 106, CH: 122, R: 34, PADX: 16, LHEAD: 60, LGAP: 12, ZHEAD: 84, ZPADB: 14, ZGAP: 40, MARGIN: 30, KFLOOR: 0.2, TOP: 12, BOTTOM: 66, SIDE: 12 };
  /* ways to arrange zones [0 demand, 1 AI, 2 physical, 3 chips, 4 frontier] into columns */
  var KCAP = 1.25;                           /* small views start at this scale instead of blowing up */
  /* every way to deal the visible zones into at most four columns (zones in a column keep their order) */
  function fmArrs(vis) {
    var vz = [], out = [];
    ZONES.forEach(function (z, zi) { if (vis[zi]) vz.push(zi); });
    var cols = [];
    (function rec(i, used) {
      if (i === vz.length) { out.push(cols.map(function (c) { return c.slice(); })); return; }
      for (var c = 0; c <= used && c < 4; c++) {
        if (c === used) cols.push([]);
        cols[c].push(vz[i]);
        rec(i + 1, c === used ? used + 1 : used);
        cols[c].pop();
        if (c === used) cols.pop();
      }
    })(0, 0);
    return out;
  }
  var fmEl = $('#fullmap'), fmSvg = $('#fm-svg'), fmVp = $('#fm-vp');
  var fmV = { x: 0, y: 0, k: 0.3 }, fmFly = 0, fmNodes = {}, fmRows = [], fmLay = [], fmZon = [], fmPos = { layers: [], zones: [] };

  function fmPad() {
    var open = panel.classList.contains('open');
    var w = fmEl.clientWidth, h = fmEl.clientHeight;
    return { w: w, h: h, r: (open && !mq.matches) ? 450 : 0, b: (open && mq.matches) ? h * 0.62 : 0 };
  }
  function fmSet(x, y, k) {
    fmV.x = x; fmV.y = y; fmV.k = k;
    fmVp.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + k + ')');
    var c = k < 0.6 ? 'z0' : k < 1.1 ? 'z1' : k < 1.8 ? 'z2' : 'z3';
    if (c !== FM.zc) { FM.zc = c; fmSvg.classList.remove('z0', 'z1', 'z2', 'z3'); fmSvg.classList.add(c); }
  }
  function fmCancel() { if (fmFly) { cancelAnimationFrame(fmFly); fmFly = 0; } }
  function fmClamp(k) { return Math.max(FM.kmin, Math.min(3, k)); }
  function fmFlyCenter(cx, cy, k, ms) {
    fmCancel();
    var p = fmPad(), sx = (p.w - p.r) / 2, sy = (p.h - p.b) / 2;
    k = fmClamp(k);
    var tx = sx - cx * k, ty = sy - cy * k;
    if (reduced || ms === 0) { fmSet(tx, ty, k); return; }
    var s = { x: fmV.x, y: fmV.y, k: fmV.k };
    var c0x = (sx - s.x) / s.k, c0y = (sy - s.y) / s.k, t0 = performance.now(), dur = ms || 750;
    (function step(t) {
      var q = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - q, 3);
      var kk = s.k * Math.pow(k / s.k, e);
      var cx2 = c0x + (cx - c0x) * e, cy2 = c0y + (cy - c0y) * e;
      fmSet(sx - cx2 * kk, sy - cy2 * kk, kk);
      fmFly = q < 1 ? requestAnimationFrame(step) : 0;
    })(t0);
  }
  function fmFitBox(x0, y0, x1, y1, opt) {
    opt = opt || {};
    var p = fmPad(), m = opt.margin || 40;
    var k = Math.min((p.w - p.r - 2 * m) / (x1 - x0), (p.h - p.b - 2 * m) / (y1 - y0));
    k = Math.max(FM.kmin, Math.min(opt.kmax || 1.3, k));
    fmFlyCenter((x0 + x1) / 2, (y0 + y1) / 2, k, opt.ms);
  }
  function fmFitAll(animate) {
    var p = fmPad(), aw = p.w - 2 * FMC.SIDE, ah = p.h - FMC.TOP - FMC.BOTTOM;
    var kf = Math.min(aw / FM.W, ah / FM.H);
    FM.kfit = kf; FM.kmin = Math.max(Math.min(kf, KCAP), FMC.KFLOOR);
    var k = Math.max(FM.kstart || Math.min(kf, KCAP), FM.kmin);
    var x = FM.W * k <= aw ? FMC.SIDE + (aw - FM.W * k) / 2 : FMC.SIDE, y = FM.H * k <= ah ? FMC.TOP + (ah - FM.H * k) / 2 : FMC.TOP;
    if (animate && !reduced) fmFlyCenter((p.w / 2 - x) / k, (p.h / 2 - y) / k, k, 650);
    else fmSet(x, y, k);
  }
  function fmFlyIds(ids) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, any = false;
    ids.forEach(function (i) { var m = by[i]; if (!m || !inView(m) || m.fx === undefined) return; any = true; x0 = Math.min(x0, m.fx); x1 = Math.max(x1, m.fx); y0 = Math.min(y0, m.fy); y1 = Math.max(y1, m.fy); });
    if (any) fmFitBox(x0 - 90, y0 - 90, x1 + 90, y1 + 110, { kmax: 0.9 });
  }
  function fmFlyNode(id, k) { var n = by[id]; fmFlyCenter(n.fx, n.fy, k || 1.1); }
  function fmFocus(id) {
    var n = by[id], ids = [id].concat(n.up, down[id] || []);
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach(function (i) { var m = by[i]; x0 = Math.min(x0, m.fx); x1 = Math.max(x1, m.fx); y0 = Math.min(y0, m.fy); y1 = Math.max(y1, m.fy); });
    x0 -= 90; x1 += 90; y0 -= 90; y1 += 90;
    var p = fmPad(), fit = Math.min((p.w - p.r - 80) / (x1 - x0), (p.h - p.b - 80) / (y1 - y0));
    var k = Math.max(0.7, Math.min(1.5, fit)), tight = k > fit + 1e-6;
    fmFlyCenter(tight ? n.fx : (x0 + x1) / 2, tight ? n.fy : (y0 + y1) / 2, k);
  }
  function fmFlyLayer(i) { var b = fmPos.layers[i]; if (!b) return; fmFitBox(b.x, b.y, b.x + b.w, b.y + b.h, { kmax: 1.15 }); }
  function fmFlyZone(i) { var b = fmPos.zones[i]; if (!b) return; fmFitBox(b.x, b.y, b.x + b.w, b.y + b.h, { kmax: 0.9 }); }

  /* links: smooth S-curves between icon centres (icons sit on top and hide the ends) */
  function fmPath(a, b) {
    var dx = b.fx - a.fx, dy = b.fy - a.fy, c1x, c1y, c2x, c2y;
    if (Math.abs(dx) >= Math.abs(dy)) { c1x = a.fx + dx * 0.5; c1y = a.fy; c2x = b.fx - dx * 0.5; c2y = b.fy; }
    else { c1x = a.fx; c1y = a.fy + dy * 0.5; c2x = b.fx; c2y = b.fy - dy * 0.5; }
    return 'M' + a.fx + ' ' + a.fy + 'C' + c1x + ' ' + c1y + ',' + c2x + ' ' + c2y + ',' + b.fx + ' ' + b.fy;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function fmBuildBg() {
    var g = $('#fm-bg');
    while (g.firstChild) g.removeChild(g.firstChild);
    NODES.forEach(function (n) {
      if (!inView(n)) return;
      n.up.forEach(function (u) {
        if (!inView(by[u])) return;
        var p = svgEl('path', { d: fmPath(n, by[u]), 'class': 'be' });
        setPal(p, n.l);
        g.appendChild(p);
      });
    });
  }

  /* Layouts that fit the window at a readable size win, biggest icons first. If nothing fits
     (a phone), take a comfortable width-fit size and let the view scroll vertically. */
  function fmScore(Wm, Hm, vw, vh) {
    var kw = vw / Wm, kh = vh / Hm, kfit = Math.min(kw, kh);
    if (kfit >= FMC.KFLOOR) return { score: 100 + kfit, kstart: Math.min(kfit, KCAP) };
    var kc = Math.min(kw, 0.5);
    return { score: kc * 10 - (Hm * kc) / 20000, kstart: Math.max(kc, FMC.KFLOOR) };
  }

  /* ---------- layout: choose how to pack the zones for this window shape ---------- */
  function fmCompute(vw, vh) {
    var cnt = fmRows.map(function (r) { return r.length; }), CMIN = 3, CMAX = 14;
    var vis = ZONES.map(function (z) { for (var l = z.a; l <= z.b; l++) if (cnt[l]) return true; return false; });
    var ZMIN = [], ZMAXC = [], ZH = [];
    ZONES.forEach(function (z, zi) {
      if (!vis[zi]) return;
      var need = ((zi + 1) + '  ' + z.name).length * 36 * 0.62 + 44, mx = 1, nl = 0;
      for (var l = z.a; l <= z.b; l++) if (cnt[l]) { need = Math.max(need, LAYERS[l].name.length * 28 * 0.6 + 96 + FMC.PADX); mx = Math.max(mx, cnt[l]); nl++; }
      ZMIN[zi] = Math.min(CMAX, Math.max(CMIN, Math.ceil((need - 2 * FMC.PADX) / FMC.CW)));   /* narrowest column (cells) that still shows every title in full */
      ZMAXC[zi] = Math.max(ZMIN[zi], Math.min(CMAX, mx));
      ZH[zi] = {};
      for (var c = CMIN; c <= CMAX; c++) {
        var h = FMC.ZHEAD + FMC.ZPADB + (nl - 1) * FMC.LGAP;
        for (var l2 = z.a; l2 <= z.b; l2++) if (cnt[l2]) h += FMC.LHEAD + Math.ceil(cnt[l2] / c) * FMC.CH;
        ZH[zi][c] = h;
      }
    });
    var best = null;
    fmArrs(vis).forEach(function (arr) {
      var cols = arr.length, cpl = new Array(cols);
      var cmin = arr.map(function (zs) { return Math.max.apply(null, zs.map(function (zi) { return ZMIN[zi]; })); });
      var cmax = arr.map(function (zs, i) { return Math.max(cmin[i], Math.max.apply(null, zs.map(function (zi) { return ZMAXC[zi]; }))); });
      function score() {
        var W = (cols - 1) * FMC.ZGAP, H = 0, used = 0, i;
        for (i = 0; i < cols; i++) {
          var h = (arr[i].length - 1) * FMC.ZGAP;
          arr[i].forEach(function (zi) { h += ZH[zi][cpl[i]]; });
          var w = cpl[i] * FMC.CW + 2 * FMC.PADX;
          W += w; H = Math.max(H, h); used += w * h;
        }
        var sc = fmScore(W + 2 * FMC.MARGIN, H + 2 * FMC.MARGIN, vw, vh);
        var cost = -sc.score - 0.0004 * (used / (W * H));
        if (!best || cost < best.cost) best = { cost: cost, arr: arr, cpl: cpl.slice(), W: W, H: H, kstart: sc.kstart };
      }
      (function rec(i) {
        if (i === cols) { score(); return; }
        for (var c = cmin[i]; c <= cmax[i]; c++) { cpl[i] = c; rec(i + 1); }
      })(0);
    });
    return best;
  }
  function fmPlaceAll(best) {
    var arr = best.arr, x = FMC.MARGIN;
    fmPos = { layers: [], zones: [] };
    arr.forEach(function (zs, ci) {
      var cpl = best.cpl[ci], w = cpl * FMC.CW + 2 * FMC.PADX, y = FMC.MARGIN;
      zs.forEach(function (zi) {
        var z = ZONES[zi], y0 = y, cy = y + FMC.ZHEAD;
        for (var l = z.a; l <= z.b; l++) {
          var n = fmRows[l].length;
          if (!n) continue;
          var rows = Math.ceil(n / cpl), bh = FMC.LHEAD + rows * FMC.CH;
          fmPos.layers[l] = { x: x + FMC.PADX / 2, y: cy, w: w - FMC.PADX, h: bh };
          fmRows[l].forEach(function (nd, i) {
            nd.fx = x + FMC.PADX + (i % cpl) * FMC.CW + FMC.CW / 2;
            nd.fy = cy + FMC.LHEAD + Math.floor(i / cpl) * FMC.CH + FMC.R + 8;
          });
          cy += bh + FMC.LGAP;
        }
        var zh = cy - FMC.LGAP + FMC.ZPADB - y0;
        fmPos.zones[zi] = { x: x, y: y0, w: w, h: zh };
        y = y0 + zh + FMC.ZGAP;
      });
      x += w + FMC.ZGAP;
    });
    FM.W = best.W + 2 * FMC.MARGIN; FM.H = best.H + 2 * FMC.MARGIN; FM.kstart = best.kstart;
    FM.sig = JSON.stringify(best.arr) + ':' + best.cpl.join(',');
  }
  function fit(text, px, maxW) {          /* trim a title so it always fits its box */
    var per = px * 0.58, max = Math.max(4, Math.floor(maxW / per));
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }
  function fmApply() {
    ZONES.forEach(function (z, zi) {
      var b = fmPos.zones[zi], e = fmZon[zi];
      e.g.classList.toggle('gone', !b);
      if (!b) return;
      var zl = [], zn = [];
      for (var q = z.a; q <= z.b; q++) if (fmRows[q] && fmRows[q].length) { zl.push(LAYERS[q].name); zn = zn.concat(fmRows[q]); }
      e.g.dataset.tip = catTip((zi + 1) + ' \u00b7 ' + z.name, z.sub, 'Layers: ' + zl.join(', ') + '.', zn, true);
      e.rect.setAttribute('x', b.x); e.rect.setAttribute('y', b.y); e.rect.setAttribute('width', b.w); e.rect.setAttribute('height', b.h);
      e.title.setAttribute('x', b.x + 22); e.title.setAttribute('y', b.y + 54);
      e.title.textContent = fit((zi + 1) + '  ' + z.name.toUpperCase(), 36, b.w - 44);
    });
    LAYERS.forEach(function (L, i) {
      var b = fmPos.layers[i], e = fmLay[i];
      e.g.classList.toggle('gone', !b);
      if (!b) return;
      e.g.dataset.tip = catTip(L.name, L.sub, L.take, fmRows[i], true);
      e.count.textContent = fmRows[i].length;
      e.rect.setAttribute('x', b.x); e.rect.setAttribute('y', b.y); e.rect.setAttribute('width', b.w); e.rect.setAttribute('height', b.h);
      e.title.setAttribute('x', b.x + 16); e.title.setAttribute('y', b.y + 40);
      e.title.textContent = fit(L.name, 28, b.w - 96);
      e.count.setAttribute('x', b.x + b.w - 16); e.count.setAttribute('y', b.y + 40);
    });
    NODES.forEach(function (n) {
      var g = fmNodes[n.id], on = inView(n);
      g.classList.toggle('vhide', !on);
      if (on) g.setAttribute('transform', 'translate(' + n.fx + ',' + n.fy + ')');
    });
    var jump = $('#fm-jump');
    jump.textContent = ''; var o0 = el('option', null, 'Jump to layer\u2026'); o0.value = ''; jump.appendChild(o0);
    LAYERS.forEach(function (L, i) { if (!fmPos.layers[i]) return; var o = el('option', null, String(i).padStart(2, '0') + ' \u00b7 ' + L.name); o.value = i; jump.appendChild(o); });
    if ($('#fm-bg').firstChild) fmBuildBg();
  }
  function fmRelayout(force) {
    var p = fmPad();
    if (!p.w || !p.h) return;
    var best = fmCompute(p.w - 2 * FMC.SIDE, p.h - FMC.TOP - FMC.BOTTOM);
    var sig = JSON.stringify(best.arr) + ':' + best.cpl.join(',');
    var wasFit = Math.abs(fmV.k - Math.max(FM.kstart || 0, FM.kmin)) < 0.002;
    if (sig !== FM.sig || force) { fmPlaceAll(best); fmApply(); fmFitAll(false); apply(); return; }
    var oldMin = FM.kmin;
    FM.kfit = Math.min((p.w - 2 * FMC.SIDE) / FM.W, (p.h - FMC.TOP - FMC.BOTTOM) / FM.H); FM.kmin = Math.max(Math.min(FM.kfit, KCAP), FMC.KFLOOR);
    FM.kstart = fmScore(FM.W, FM.H, p.w - 2 * FMC.SIDE, p.h - FMC.TOP - FMC.BOTTOM).kstart;
    if (wasFit || fmV.k < FM.kmin) fmFitAll(false);
    else fmSet(fmV.x, fmV.y, fmV.k);
  }

  function fmRowsBuild() {
    fmRows = LAYERS.map(function () { return []; });
    NODES.forEach(function (n) { if (inView(n)) fmRows[n.l].push(n); });
    fmRows.forEach(function (r) {            /* best-connected first, so key names lead each row */
      r.sort(function (a, b) {
        var da = a.up.length + (down[a.id] || []).length + (a.c ? 3 : 0), db = b.up.length + (down[b.id] || []).length + (b.c ? 3 : 0);
        return db - da || (a.n < b.n ? -1 : 1);
      });
    });
  }
  function fmViewApply() {
    fmRowsBuild();
    fmCancel();
    FM.sig = '';
    fmRelayout(true);
  }
  function buildFM() {
    var R = FMC.R;
    fmRowsBuild();
    var gZones = svgEl('g'), gBg = svgEl('g', { 'class': 'fm-bg', id: 'fm-bg' }), gHi = svgEl('g', { id: 'fm-hi' }), gNodes = svgEl('g');
    ZONES.forEach(function (z, zi) {
      var g = svgEl('g', { 'class': 'zn' });
      g.dataset.z = zi;
      setZonePal(g, zi);
      var rect = svgEl('rect', { 'class': 'zbox', rx: 30 });
      var title = svgEl('text', { 'class': 'zt' });
      g.appendChild(rect); g.appendChild(title);
      gZones.appendChild(g);
      fmZon[zi] = { g: g, rect: rect, title: title };
    });
    LAYERS.forEach(function (L, i) {
      var g = svgEl('g', { 'class': 'ly' });
      g.dataset.l = i;
      setPal(g, i);
      var rect = svgEl('rect', { 'class': 'band', rx: 20 });
      var title = svgEl('text', { 'class': 'lt' });
      var count = svgEl('text', { 'class': 'lc', 'text-anchor': 'end' }); count.textContent = fmRows[i].length;
      g.appendChild(rect); g.appendChild(title); g.appendChild(count);
      gZones.appendChild(g);
      fmLay[i] = { g: g, rect: rect, title: title, count: count };
    });
    NODES.forEach(function (n) {
      var g = svgEl('g', { 'class': 'fn k-' + n.kind, tabindex: -1 });
      g.dataset.id = n.id;
      setPal(g, n.l);
      g.dataset.tip = nodeTip(n);
      var vis = svgEl('g', { 'class': 'vis' });
      vis.appendChild(svgEl('circle', { r: R, 'class': 'c' }));
      var mono = svgEl('text', { 'class': 'mono', y: 6, 'text-anchor': 'middle' });
      if (n.e) { mono.textContent = n.e; mono.setAttribute('class', 'mono emo'); mono.setAttribute('y', 13); g.classList.add('haslogo'); }
      else mono.textContent = n.n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
      vis.appendChild(mono);
      if (n.d && !n.e) {
        findLogo(n.d).then(function (u) {
          if (!u) return;
          var ie = svgEl('image', { x: -R * 0.9, y: -R * 0.9, width: R * 1.8, height: R * 1.8, 'class': 'lgo', preserveAspectRatio: 'xMidYMid meet' });
          ie.setAttributeNS('http://www.w3.org/1999/xlink', 'href', u); ie.setAttribute('href', u);
          vis.insertBefore(ie, mono.nextSibling); mono.setAttribute('class', 'mono hide'); g.classList.add('haslogo');
        });
      }
      if (n.c) { var dm = svgEl('text', { 'class': 'dm', x: R - 5, y: -R + 9 }); dm.textContent = '◆'; vis.appendChild(dm); }
      g.appendChild(vis);
      /* name on up to two lines, each short enough for the cell */
      var words = n.n.split(' '), l1 = '', l2 = '';
      words.forEach(function (w) { if (!l2 && (l1 + ' ' + w).trim().length <= 12) l1 = (l1 + ' ' + w).trim(); else l2 = (l2 + ' ' + w).trim(); });
      if (!l1) { l1 = l2.slice(0, 11); l2 = l2.slice(11); }
      if (l1.length > 12) l1 = l1.slice(0, 11) + '…';
      if (l2.length > 12) l2 = l2.slice(0, 11) + '…';
      var t1 = svgEl('text', { 'class': 'lbl', y: R + 16, 'text-anchor': 'middle' }); t1.textContent = l1; g.appendChild(t1);
      if (l2) { var t2 = svgEl('text', { 'class': 'lbl', y: R + 30, 'text-anchor': 'middle' }); t2.textContent = l2; g.appendChild(t2); }
      var tkt = [n.pq || (n.kind === 'private' ? 'Private' : ''), hqLabel(n)].filter(Boolean).join(' \u00b7 ');
      if (tkt) {
        var tk = svgEl('text', { 'class': 'tk', y: R + (l2 ? 44 : 30), 'text-anchor': 'middle' }); tk.textContent = tkt; g.appendChild(tk);
      }
      gNodes.appendChild(g);
      fmNodes[n.id] = g;
    });
    fmVp.appendChild(gZones); fmVp.appendChild(gBg); fmVp.appendChild(gHi); fmVp.appendChild(gNodes);

    var jump = $('#fm-jump');
    jump.addEventListener('change', function () { if (jump.value !== '') fmFlyLayer(+jump.value); jump.value = ''; });

    /* interaction: wheel, drag, pinch, click, dblclick, hover */
    var ptrs = {}, moved = 0, pinch0 = 0;
    function hideHint() { var h = $('.fm-hint'); if (h) h.classList.add('gone'); }
    function zoomAt(cx, cy, f) {
      var nk = fmClamp(fmV.k * f), q = nk / fmV.k;
      fmSet(cx - (cx - fmV.x) * q, cy - (cy - fmV.y) * q, nk);
    }
    fmEl.addEventListener('wheel', function (ev) {
      ev.preventDefault(); fmCancel(); hideHint();
      var r = fmEl.getBoundingClientRect();
      zoomAt(ev.clientX - r.left, ev.clientY - r.top, Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.012 : 0.0016)));
    }, { passive: false });
    fmEl.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.fm-ui')) return;
      hideHint(); fmCancel();
      ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(ptrs); moved = 0;
      if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
      fmEl.classList.add('grab');
    });
    fmEl.addEventListener('pointermove', function (ev) {
      if (!ptrs[ev.pointerId]) return;
      var prev = ptrs[ev.pointerId];
      ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY, cap: prev.cap };
      var ids = Object.keys(ptrs);
      if (ids.length >= 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = fmEl.getBoundingClientRect();
        if (pinch0) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch0);
        pinch0 = d; moved = 99;
        fmSet(fmV.x + ((ev.clientX - prev.x) / 2), fmV.y + ((ev.clientY - prev.y) / 2), fmV.k);
      } else {
        var dx = ev.clientX - prev.x, dy = ev.clientY - prev.y;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 5) {
          if (!ptrs[ev.pointerId].cap) { try { fmEl.setPointerCapture(ev.pointerId); } catch (e) {} ptrs[ev.pointerId].cap = 1; }   /* capture only once it is a drag, so plain clicks still hit their target */
          fmSet(fmV.x + dx, fmV.y + dy, fmV.k);
        }
      }
    });
    function up(ev) {
      delete ptrs[ev.pointerId];
      if (!Object.keys(ptrs).length) { fmEl.classList.remove('grab'); pinch0 = 0; }
    }
    fmEl.addEventListener('pointerup', up);
    fmEl.addEventListener('pointercancel', up);
    fmEl.addEventListener('click', function (ev) {
      if (moved > 5) { moved = 0; return; }
      var g = ev.target.closest('.fn');
      if (g) { var id = g.dataset.id; if (state.sel === id) clearSel(); else select(id); return; }
      var ly = ev.target.closest('.ly');
      if (ly && fmV.k < 0.95) { fmFlyLayer(+ly.dataset.l); return; }
      var zn = ev.target.closest('.zn');
      if (zn && fmV.k < FM.kmin * 1.5) { fmFlyZone(+zn.dataset.z); return; }
      if (state.sel && !ev.target.closest('.fm-ui')) clearSel();
    });
    fmEl.addEventListener('dblclick', function (ev) {
      if (ev.target.closest('.fm-ui, .fn')) return;
      var r = fmEl.getBoundingClientRect(); fmCancel();
      fmFlyCenter((ev.clientX - r.left - fmV.x) / fmV.k, (ev.clientY - r.top - fmV.y) / fmV.k, fmV.k * 2.2, 450);
    });
    fmEl.addEventListener('mouseover', function (ev) {
      if (state.sel || state.journey || mq.matches || FM.zc === 'z0') return;
      var g = ev.target.closest('.fn'), id = g ? g.dataset.id : null;
      if (id !== state.hover) { state.hover = id; apply(); }
    });
    fmEl.addEventListener('mouseleave', function () { if (state.hover) { state.hover = null; apply(); } });
    $('#fm-in').addEventListener('click', function () { var p = fmPad(); fmCancel(); zoomAt((p.w - p.r) / 2, (p.h - p.b) / 2, 1.5); });
    $('#fm-out').addEventListener('click', function () { var p = fmPad(); fmCancel(); zoomAt((p.w - p.r) / 2, (p.h - p.b) / 2, 1 / 1.5); });
    $('#fm-fit').addEventListener('click', function () { fmCancel(); fmFitAll(true); });
    $('#fm-links').addEventListener('click', function () {
      var on = fmSvg.classList.toggle('show-links');
      this.setAttribute('aria-pressed', String(on));
      if (on) fmBuildBg();
    });
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (state.mode === 'map' && FM.ready) fmRelayout(); }, 140); });

    FM.ready = true;
    fmRelayout(true);
  }

  var FM_CLASSES = ['sel', 'sup', 'cus', 'dim', 'jn', 'off'];
  function fmUpdate(cls, edges, active) {
    if (!FM.ready) return;
    FM.active = !!active;
    NODES.forEach(function (n) {
      var g = fmNodes[n.id];
      if (!inView(n)) return;
      FM_CLASSES.forEach(function (c) { g.classList.remove(c); });
      if (active) { if (cls[n.id]) g.classList.add(cls[n.id]); else g.classList.add('dim'); }
      if (!matchesFilters(n)) g.classList.add('off');
    });
    var hi = $('#fm-hi');
    while (hi.firstChild) hi.removeChild(hi.firstChild);
    edges.forEach(function (e) {
      var d = fmPath(by[e.a], by[e.b]), line = svgEl('path', { d: d, 'class': 'he ' + e.cls });
      hi.appendChild(line);
      if (!/strong/.test(e.cls)) return;
      var f = flowOf(e.a, e.b);
      if (!f) return;
      var buyer = by[e.a].up.indexOf(e.b) > -1 ? e.a : e.b, supplier = buyer === e.a ? e.b : e.a;
      hi.appendChild(svgEl('path', { d: d, 'class': 'ehit', 'data-tip': by[buyer].n + ' \u2190 ' + by[supplier].n + '|' + f }));
      var mid = line.getPointAtLength(line.getTotalLength() / 2);
      var tx = svgEl('text', { 'class': 'efl', x: mid.x, y: mid.y, 'text-anchor': 'middle' });
      tx.textContent = f.length > 34 ? f.slice(0, 33) + '\u2026' : f;
      hi.appendChild(tx);
    });
    fmSvg.classList.toggle('has-active', !!active);
  }

  function setMode(m, noScroll) {
    if (m === state.mode) return;
    state.mode = m;
    document.body.classList.toggle('mode-map', m === 'map');
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
    if (m === 'map') {
      if (!FM.ready) buildFM();
      if (!noScroll) window.scrollTo({ top: $('#map-top').offsetTop, behavior: 'auto' });
      requestAnimationFrame(function () {
        fmRelayout();
        if (state.sel) fmFocus(state.sel); else fmFitAll(false);
        apply();
      });
    } else {
      requestAnimationFrame(function () { apply(); redraw(); });
    }
    setHash(state.journey ? 'j=' + state.journey.j.id : state.sel ? 'n=' + state.sel : '');
  }
  document.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  var openBtn = $('#open-map');
  if (openBtn) openBtn.addEventListener('click', function () { setMode('layers'); window.scrollTo({ top: $('#map-top').offsetTop - 90, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- redraw on layout change ---------- */
  var raf = 0;
  function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { if (drawn.length) drawEdges(drawn); }); }
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(map);
  window.addEventListener('resize', redraw);
  window.addEventListener('load', redraw);
  document.querySelectorAll('.layer-info').forEach(function (d) { d.addEventListener('toggle', redraw); });

  /* ---------- theme toggle ---------- */
  var tbtn = $('#theme');
  tbtn.addEventListener('click', function () {
    var t = document.documentElement.dataset.mwTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.mwTheme = t;
    try { localStorage.setItem('mw-theme', t); } catch (e) {}
  });

  /* ---------- initial state from URL ---------- */
  apply();
  var hn = /(?:^|[#&])n=([\w-]+)/.exec(location.hash), hj = /(?:^|[#&])j=([\w-]+)/.exec(location.hash);
  var hl = location.hash.match(/(?:^#|&)lens=(all|public|private|choke|other)/g);
  if (hl) hl.forEach(function (m) { setLens(m.replace(/^[#&]lens=/, '')); });
  var hv = /(?:^#|&)view=(\w+)/.exec(location.hash), hc = /(?:^#|&)country=([A-Z]{2})/.exec(location.hash);
  if (hc && COUNTRIES[hc[1]]) { state.country = hc[1]; }
  if (hv) setView(hv[1], { keep: true });
  refreshCountries();
  var wantLayers = /(?:^#|&)layers(?:&|$)/.test(location.hash);
  if (!wantLayers) setMode('map', !(hn || hj));
  if (hn && by[hn[1]]) {
    select(hn[1]);
    if (state.mode !== 'map') setTimeout(function () { nodeEls[hn[1]].scrollIntoView({ block: 'center' }); }, 120);
  }
  if (hj) startJourney(hj[1]);
})();
