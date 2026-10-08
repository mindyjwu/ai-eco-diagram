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
  var state = { sel: null, hover: null, lens: 'all', query: '', depth: 'full', journey: null, mode: 'layers' };
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
    var h2 = el('h2', null, L.name); h2.dataset.tip = L.name + '|' + L.sub + ' ' + L.take; t.appendChild(h2);
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
      b.dataset.tip = n.n + (n.pq ? ' · ' + n.pq : '') + '|' + firstSentence(n.w);
      b.setAttribute('aria-label', n.n + (n.pq ? ', ' + n.pq : '') + (n.c ? ', chokepoint' : ''));
      b.appendChild(logo(n, 'm'));
      b.appendChild(el('span', 'node-n', n.n));
      var sub = n.kind === 'public' ? n.pq : n.kind === 'private' ? 'Private' : n.kind === 'life' ? '' : (n.kind === 'other' ? '' : '');
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
    if (state.lens === 'public' && n.kind !== 'public') return false;
    if (state.lens === 'private' && n.kind !== 'private') return false;
    if (state.lens === 'choke' && !n.c) return false;
    if (state.lens === 'other' && n.kind !== 'other') return false;
    if (state.query && n.hay.indexOf(state.query) === -1) return false;
    return true;
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
      }
    }
    var shown = 0;
    NODES.forEach(function (n) {
      var e = nodeEls[n.id];
      NODE_CLASSES.forEach(function (k) { e.classList.remove(k); });
      var ok = matchesFilters(n);
      if (ok) shown++;
      if (active) { if (cls[n.id]) e.classList.add(cls[n.id]); else e.classList.add('dim'); }
      if (!ok) e.classList.add('off');
    });
    $('#count').textContent = (state.lens === 'all' && !state.query) ? NODES.length + ' players' : shown + ' of ' + NODES.length;
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
    if (n.c) badges.appendChild(el('span', 'badge warn', '◆ Chokepoint'));
    ht.appendChild(badges);
    ht.appendChild(el('div', 'p-layer', 'Layer ' + String(n.l).padStart(2, '0') + ' · ' + L.name));
    head.appendChild(ht);
    pbody.appendChild(head);

    pbody.appendChild(section('What it does', para(n.w)));
    pbody.appendChild(section('Why it matters', para(n.y)));
    if (n.p) pbody.appendChild(section('Outlook', para(n.p + ' (Qualitative, to about mid-2026; not live data.)')));
    var bp = el('p', 'angle'); bp.appendChild(el('strong', null, 'Build. ')); bp.appendChild(document.createTextNode(L.build));
    pbody.appendChild(section('Opportunity', para(n.o || L.take, bp)));
    pbody.appendChild(section('Depends on', chipList(n.up, 'Nothing mapped below.')));
    pbody.appendChild(section('Used by', chipList(down[id] || [], 'Nothing mapped above.')));

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
    var full = (state.mode === 'layers' ? 'layers' + (h ? '&' : '') : '') + (h || '');
    try { history.replaceState(null, '', full ? '#' + full : location.pathname + location.search); } catch (e) {}
  }
  function select(id, opts) {
    endJourney(true);
    state.sel = id; state.hover = null;
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
      var m = NODES.filter(matchesFilters)[0];
      if (m && state.query) { select(m.id, { scroll: true }); }
    }
    if (ev.key === 'Escape') { search.value = ''; state.query = ''; apply(); search.blur(); }
  });
  document.querySelectorAll('[data-lens]').forEach(function (b) {
    b.addEventListener('click', function () { setLens(b.dataset.lens); });
  });
  function setLens(l) {
    state.lens = l;
    document.querySelectorAll('[data-lens]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lens === l)); });
    apply();
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
    endJourney(true); state.sel = null; closePanel(); setLens('all'); setHash('');
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
    state.sel = null; state.hover = null; closePanel();
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
     FULL MAP — a three-level zoomable view.
       overview  zones → layers → each layer's 8 best-connected logos,
                 plus arcs showing how many links run between layers
       layer     zoom in and a row spreads out to every company
       company   click one to reveal only its own chains
     ============================================================ */
  var FM = { ready: false, zc: '', compact: null, active: false };
  var FMC = { W: 2800, ARC: 560, ROW: 128, BAND: 108, R: 28, ZGAP: 84, REPS: 8 };
  var fmEl = $('#fullmap'), fmSvg = $('#fm-svg'), fmVp = $('#fm-vp'), fmRail = $('#fm-rail');
  var fmV = { x: 0, y: 0, k: 0.2 }, fmFly = 0, fmNodes = {}, fmZoneOf = [], fmCY = [];

  function fmGeometry() {
    var idx = function (id) { return LAYERS.findIndex(function (L) { return L.id === id; }); };
    ZONES.forEach(function (z, zi) { z.a = idx(z.from); z.b = idx(z.to); for (var i = z.a; i <= z.b; i++) fmZoneOf[i] = zi; });
    LAYERS.forEach(function (L, i) { fmCY[i] = FMC.ZGAP + i * FMC.ROW + fmZoneOf[i] * FMC.ZGAP + FMC.ROW / 2; });
    FM.H = fmCY[LAYERS.length - 1] + FMC.ROW / 2 + 24;
  }
  function fmPad() {
    var open = panel.classList.contains('open');
    var w = fmEl.clientWidth, h = fmEl.clientHeight;
    return { w: w, h: h, r: (open && !mq.matches) ? 450 : 0, b: (open && mq.matches) ? h * 0.62 : 0 };
  }
  function fmSet(x, y, k) {
    fmV.x = x; fmV.y = y; fmV.k = k;
    fmVp.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + k + ')');
    var c = k < 0.3 ? 'z0' : k < 0.5 ? 'z1' : k < 1.2 ? 'z2' : 'z3';
    if (c !== FM.zc) {
      FM.zc = c; fmSvg.classList.remove('z0', 'z1', 'z2', 'z3'); fmSvg.classList.add(c);
      if (FM.ready) fmPlace(c === 'z0' && !FM.active);
    }
    fmRailUpdate();
  }
  /* overview: representative logos sit in a compact strip; everything else folds away */
  function fmPlace(compact) {
    if (FM.compact === compact) return;
    FM.compact = compact;
    NODES.forEach(function (n) {
      var g = fmNodes[n.id];
      g.style.transform = 'translate(' + (compact ? n.ox : n.fx) + 'px,' + n.fy + 'px)';
      g.classList.toggle('ovhide', compact && !n.rep);
    });
    fmSvg.style.setProperty('--ns', compact ? 1.5 : 1);
    fmSvg.classList.toggle('ov', compact);
  }
  function fmRailUpdate() {
    if (!FM.chips) return;
    var h = fmEl.clientHeight, k = fmV.k, right = Math.max(fmV.x - 8, mq.matches ? 50 : 8);
    FM.chips.forEach(function (c, i) {
      var cy = fmV.y + fmCY[i] * k, off = cy < -20 || cy > h + 20;
      c.style.display = off ? 'none' : '';
      if (!off) c.style.transform = 'translate(' + right + 'px,' + cy + 'px) translate(-100%,-50%)';
    });
    FM.zlabels.forEach(function (z, zi) {
      var top = fmV.y + (fmCY[ZONES[zi].a] - FMC.ROW / 2 - FMC.ZGAP * 0.62) * k, off = top < -30 || top > h + 10;
      z.style.display = off ? 'none' : '';
      if (!off) z.style.transform = 'translate(' + right + 'px,' + top + 'px) translate(-100%,0)';
    });
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
  function fmFitAll(animate) {
    var p = fmPad(), left = mq.matches ? 60 : 210, ww = FMC.W + FMC.ARC;
    var k = Math.min((p.w - left - 16) / ww, (p.h - 20) / FM.H);
    FM.kfit = k; FM.kmin = k * 0.85;
    var x = left + ((p.w - left - 16) - ww * k) / 2, y = 10 + ((p.h - 20) - FM.H * k) / 2;
    if (animate && !reduced) fmFlyCenter((p.w / 2 - x) / k, (p.h / 2 - y) / k, k, 650);
    else fmSet(x, y, k);
  }
  function fmFlyNode(id, k) { var n = by[id]; fmFlyCenter(n.fx, n.fy, k || 1.1); }
  function fmFocus(id) {
    var n = by[id], ids = [id].concat(n.up, down[id] || []);
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach(function (i) { var m = by[i]; x0 = Math.min(x0, m.fx); x1 = Math.max(x1, m.fx); y0 = Math.min(y0, m.fy); y1 = Math.max(y1, m.fy); });
    x0 -= 90; x1 += 90; y0 -= 90; y1 += 90;
    var p = fmPad(), fit = Math.min((p.w - p.r - 80) / (x1 - x0), (p.h - p.b - 80) / (y1 - y0));
    var k = Math.max(0.6, Math.min(1.5, fit)), tight = k > fit + 1e-6;
    fmFlyCenter(tight ? n.fx : (x0 + x1) / 2, tight ? n.fy : (y0 + y1) / 2, k);
  }
  function fmFlyLayer(i) { fmFlyCenter(FMC.W / 2, fmCY[i], 0.56); }

  function fmPath(a, b) {
    var R = FMC.R, d;
    if (a.l === b.l) {
      var y0 = a.fy + R, drop = 26 + Math.min(40, Math.abs(a.fx - b.fx) * 0.05);
      d = 'M' + a.fx + ' ' + y0 + 'C' + a.fx + ' ' + (y0 + drop) + ',' + b.fx + ' ' + (y0 + drop) + ',' + b.fx + ' ' + y0;
    } else {
      var y1 = a.fy + R, y2 = b.fy - R, dy = Math.max(30, (y2 - y1) * 0.5);
      d = 'M' + a.fx + ' ' + y1 + 'C' + a.fx + ' ' + (y1 + dy) + ',' + b.fx + ' ' + (y2 - dy) + ',' + b.fx + ' ' + y2;
    }
    return d;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function fmBuildBg() {
    var g = $('#fm-bg');
    if (g.firstChild) return;
    NODES.forEach(function (n) {
      n.up.forEach(function (u) {
        var p = svgEl('path', { d: fmPath(n, by[u]), 'class': 'be' });
        setPal(p, n.l);
        g.appendChild(p);
      });
    });
  }

  function buildFM() {
    var W = FMC.W, R = FMC.R, BAND = FMC.BAND;
    fmGeometry();
    var rows = LAYERS.map(function () { return []; });
    NODES.forEach(function (n) { rows[n.l].push(n); });
    function assign(r) { r.forEach(function (n, i) { n.fx = 120 + (i + 0.5) * (W - 240) / r.length; n.fy = fmCY[n.l]; }); }
    rows.forEach(assign);
    function bary(n) {
      var s = 0, c = 0;
      n.up.concat(down[n.id] || []).forEach(function (id) { s += by[id].fx; c++; });
      return c ? s / c : n.fx;
    }
    for (var it = 0; it < 16; it++) {
      var seq = it % 2 ? rows.slice().reverse() : rows;
      seq.forEach(function (r) { r.forEach(function (n) { n.bx = bary(n); }); r.sort(function (a, b) { return a.bx - b.bx; }); assign(r); });
    }
    /* representatives: the best-connected nodes of each layer, laid out in a compact strip for the overview */
    rows.forEach(function (r) {
      var rank = r.slice().sort(function (a, b) {
        var da = a.up.length + (down[a.id] || []).length + (a.c ? 3 : 0), db = b.up.length + (down[b.id] || []).length + (b.c ? 3 : 0);
        return db - da;
      });
      rank.forEach(function (n, i) { n.rep = i < FMC.REPS; });
      var reps = r.filter(function (n) { return n.rep; });
      var gap = 104;
      reps.forEach(function (n, j) { n.ox = W / 2 + (j - (reps.length - 1) / 2) * gap; });
      r.forEach(function (n) { if (!n.rep) n.ox = W / 2; });
    });

    var gBands = svgEl('g'), gArcs = svgEl('g', { 'class': 'arcs' }), gBg = svgEl('g', { 'class': 'fm-bg', id: 'fm-bg' }), gHi = svgEl('g', { id: 'fm-hi' }), gNodes = svgEl('g');
    LAYERS.forEach(function (L, i) {
      var r = svgEl('rect', { x: 0, y: fmCY[i] - BAND / 2, width: W, height: BAND, rx: 22, 'class': 'band' });
      setPal(r, i);
      r.dataset.l = i;
      gBands.appendChild(r);
    });
    /* layer-to-layer arcs for the overview */
    var pc = {};
    NODES.forEach(function (n) { n.up.forEach(function (u) { var b = by[u].l; if (b !== n.l) { var key = n.l + '>' + b; pc[key] = (pc[key] || 0) + 1; } }); });
    Object.keys(pc).sort(function (x, y) { return pc[y] - pc[x]; }).forEach(function (key) {
      var c = pc[key]; if (c < 3) return;
      var ab = key.split('>').map(Number), a = ab[0], b = ab[1];
      var ya = fmCY[a], yb = fmCY[b], span = b - a, bulge = Math.min(FMC.ARC - 20, 46 + span * 34), x0 = W - 4;
      var path = svgEl('path', { d: 'M' + x0 + ' ' + ya + 'C' + (x0 + bulge) + ' ' + (ya + (yb - ya) * 0.1) + ',' + (x0 + bulge) + ' ' + (yb - (yb - ya) * 0.1) + ',' + x0 + ' ' + yb, 'class': 'arc' });
      setPal(path, a);
      path.style.strokeWidth = Math.min(6.5, 0.9 + c * 0.28) + 'px';
      path.dataset.tip = LAYERS[a].name + ' → ' + LAYERS[b].name + '|' + c + ' links: the first depends on the second.';
      gArcs.appendChild(path);
    });
    NODES.forEach(function (n) {
      var g = svgEl('g', { 'class': 'fn k-' + n.kind, tabindex: -1 });
      g.style.transform = 'translate(' + n.fx + 'px,' + n.fy + 'px)';
      g.dataset.id = n.id;
      setPal(g, n.l);
      g.dataset.tip = n.n + (n.pq ? ' · ' + n.pq : '') + '|' + firstSentence(n.w);
      var vis = svgEl('g', { 'class': 'vis' });
      vis.appendChild(svgEl('circle', { r: R, 'class': 'c' }));
      var mono = svgEl('text', { 'class': 'mono', y: 6, 'text-anchor': 'middle' });
      if (n.e) { mono.textContent = n.e; mono.setAttribute('class', 'mono emo'); mono.setAttribute('y', 10); }
      else mono.textContent = n.n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
      vis.appendChild(mono);
      if (n.d && !n.e) {
        findLogo(n.d).then(function (u) {
          if (!u) return;
          var ie = svgEl('image', { x: -R * 0.62, y: -R * 0.62, width: R * 1.24, height: R * 1.24, 'class': 'lgo', preserveAspectRatio: 'xMidYMid meet' });
          ie.setAttributeNS('http://www.w3.org/1999/xlink', 'href', u); ie.setAttribute('href', u);
          vis.insertBefore(ie, mono.nextSibling); mono.setAttribute('class', 'mono hide');
        });
      }
      if (n.c) { var dm = svgEl('text', { 'class': 'dm', x: R - 4, y: -R + 8 }); dm.textContent = '◆'; vis.appendChild(dm); }
      g.appendChild(vis);
      var nm = n.n.length > 15 ? n.n.slice(0, 14) + '…' : n.n;
      var lbl = svgEl('text', { 'class': 'lbl', y: R + 20, 'text-anchor': 'middle' }); lbl.textContent = nm; g.appendChild(lbl);
      if (n.pq || n.kind === 'private') {
        var tk = svgEl('text', { 'class': 'tk', y: R + 36, 'text-anchor': 'middle' }); tk.textContent = n.pq || 'Private'; g.appendChild(tk);
      }
      gNodes.appendChild(g);
      fmNodes[n.id] = g;
    });
    fmVp.appendChild(gBands); fmVp.appendChild(gBg); fmVp.appendChild(gArcs); fmVp.appendChild(gHi); fmVp.appendChild(gNodes);

    FM.chips = LAYERS.map(function (L, i) {
      var c = el('button', 'rail-chip');
      c.type = 'button';
      setPal(c, i);
      c.appendChild(el('b', null, String(i).padStart(2, '0')));
      c.appendChild(el('span', 't', L.name));
      c.appendChild(el('i', null, String(rows[i].length)));
      c.dataset.tip = L.name + ' (' + rows[i].length + ')|' + L.sub + ' Click to zoom in.';
      c.addEventListener('click', function () { fmFlyLayer(i); });
      fmRail.appendChild(c);
      return c;
    });
    FM.zlabels = ZONES.map(function (z) {
      var d = el('div', 'rail-zone', z.name);
      setZonePal(d, ZONES.indexOf(z)); d.dataset.tip = z.name + '|' + z.sub;
      fmRail.appendChild(d);
      return d;
    });
    var jump = $('#fm-jump');
    LAYERS.forEach(function (L, i) { var o = el('option', null, String(i).padStart(2, '0') + ' · ' + L.name); o.value = i; jump.appendChild(o); });
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
      if (ev.target.closest('.fm-ui, .rail-chip')) return;
      hideHint(); fmCancel();
      fmEl.setPointerCapture(ev.pointerId);
      ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(ptrs); moved = 0;
      if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
      fmEl.classList.add('grab');
    });
    fmEl.addEventListener('pointermove', function (ev) {
      if (!ptrs[ev.pointerId]) return;
      var prev = ptrs[ev.pointerId];
      ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(ptrs);
      if (ids.length >= 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = fmEl.getBoundingClientRect();
        if (pinch0) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch0);
        pinch0 = d; moved = 99;
        fmSet(fmV.x + ((ev.clientX - prev.x) / 2), fmV.y + ((ev.clientY - prev.y) / 2), fmV.k);
      } else {
        var dx = ev.clientX - prev.x, dy = ev.clientY - prev.y;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 5) fmSet(fmV.x + dx, fmV.y + dy, fmV.k);
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
      var band = ev.target.closest('.band');
      if (band && fmV.k < 0.5) { fmFlyLayer(+band.dataset.l); return; }
      if (state.sel && !ev.target.closest('.fm-ui, .rail-chip')) clearSel();
    });
    fmEl.addEventListener('dblclick', function (ev) {
      if (ev.target.closest('.fm-ui, .rail-chip, .fn')) return;
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
    window.addEventListener('resize', function () { if (state.mode === 'map') fmRailUpdate(); });

    fmSvg.classList.add('noanim');
    FM.ready = true;
    fmFitAll(false);
    FM.compact = null;
    fmPlace(FM.zc === 'z0');
    requestAnimationFrame(function () { requestAnimationFrame(function () { fmSvg.classList.remove('noanim'); }); });
  }

  var FM_CLASSES = ['sel', 'sup', 'cus', 'dim', 'jn', 'off'];
  function fmUpdate(cls, edges, active) {
    if (!FM.ready) return;
    FM.active = !!active;
    fmPlace(FM.zc === 'z0' && !FM.active);
    NODES.forEach(function (n) {
      var g = fmNodes[n.id];
      FM_CLASSES.forEach(function (c) { g.classList.remove(c); });
      if (active) { if (cls[n.id]) g.classList.add(cls[n.id]); else g.classList.add('dim'); }
      if (!matchesFilters(n)) g.classList.add('off');
    });
    var hi = $('#fm-hi');
    while (hi.firstChild) hi.removeChild(hi.firstChild);
    edges.forEach(function (e) {
      hi.appendChild(svgEl('path', { d: fmPath(by[e.a], by[e.b]), 'class': 'he ' + e.cls }));
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
        if (state.sel) fmFocus(state.sel);
        else if (mq.matches) fmSet(fmEl.clientWidth / 2 - (FMC.W / 2) * 0.27, 14, 0.27);
        else fmFitAll(false);
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
  var hl = /(?:^#|&)lens=(all|public|private|choke|other)/.exec(location.hash);
  if (hl) setLens(hl[1]);
  var wantLayers = /(?:^#|&)layers(?:&|$)/.test(location.hash);
  if (!wantLayers) setMode('map', !(hn || hj));
  if (hn && by[hn[1]]) {
    select(hn[1]);
    if (state.mode !== 'map') setTimeout(function () { nodeEls[hn[1]].scrollIntoView({ block: 'center' }); }, 120);
  }
  if (hj) startJourney(hj[1]);
})();
