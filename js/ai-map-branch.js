/* ============================================================
   Supply-chain branch view.
   Click a household activity (or "Open supply chain" on any company) and a
   full-page branch opens inside the same page: the chain laid out in
   columns, left to right, from the thing you started with down to the
   Earth. Only the best-connected players per column are shown at first
   ("+N more" opens the rest). Hover or click a card to light up its path;
   the flow along each link shows up on the line.
   ============================================================ */
(function () {
  'use strict';
  var A = window.AIMAP_API;
  if (!A) return;
  var by = A.by, down = A.down, LAYERS = A.LAYERS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var NS = 'http://www.w3.org/2000/svg';

  var STAGES = [
    { n: 'You', d: 'What households spend, consume and earn.', layers: ['you'] },
    { n: 'Apps & products', d: 'The companies and devices you deal with directly.', layers: ['shop', 'social', 'work', 'gig', 'money', 'health', 'food', 'travel', 'edu', 'devices', 'bio'] },
    { n: 'AI labs', d: 'Build the models behind the apps.', layers: ['labs'] },
    { n: 'Clouds & funding', d: 'Rent out the computing, and the investors paying for it.', layers: ['cloud', 'capital'] },
    { n: 'Data centres, power & farms', d: 'Buildings, electricity, cooling, satellites and farmland.', layers: ['dc', 'energy', 'space', 'agri'] },
    { n: 'Servers & chip designers', d: 'Assemble the servers and design the chips.', layers: ['systems', 'chips'] },
    { n: 'Fabs & packaging', d: 'Make, stack and package the chips.', layers: ['fabs', 'biomfg'] },
    { n: 'Tools & parts', d: 'The machines and parts that make chips, drugs and rockets.', layers: ['equip', 'parts', 'biotools', 'rocket'] },
    { n: 'Materials', d: 'Wafers, chemicals, gases, glass and masks.', layers: ['materials'] },
    { n: 'Earth', d: 'Mines, water and raw inputs.', layers: ['raw'] }
  ];
  var stageOf = {};
  STAGES.forEach(function (s, i) { s.layers.forEach(function (l) { stageOf[l] = i; }); });
  function st(id) { return stageOf[LAYERS[by[id].l].id]; }

  var K = 6;                                   /* players shown per column before "+N more" */
  var root = null, trail = [], expanded = {}, sel = null, hover = null, opened = false;
  var cols = [], shown = {}, edges = [], inSet = {}, weight = {};
  var wrap = $('#branch'), grid = $('#br-grid'), colsEl = $('#br-cols'), svg = $('#br-svg'), scroller = $('#br-scroll');
  var cards = {};

  /* ---------- the subgraph around one starting point ---------- */
  function build(rootId) {
    var s0 = st(rootId), set = {}, q = [rootId], x;
    set[rootId] = 1;
    while (q.length) {                          /* what it depends on, going down the chain */
      x = q.shift();
      by[x].up.forEach(function (u) { if (!set[u] && st(u) >= s0) { set[u] = 1; q.push(u); } });
    }
    q = [rootId]; var seenDown = {}; seenDown[rootId] = 1;
    while (q.length) {                          /* who depends on it, going up the chain */
      x = q.shift();
      (down[x] || []).forEach(function (b) { if (!seenDown[b] && st(b) <= s0) { seenDown[b] = 1; set[b] = 1; q.push(b); } });
    }
    var w = {};
    Object.keys(set).forEach(function (id) { w[id] = 0; });
    Object.keys(set).forEach(function (id) {
      by[id].up.forEach(function (u) { if (set[u] && st(u) !== st(id)) { w[id]++; w[u]++; } });
    });
    Object.keys(set).forEach(function (id) { w[id] += by[id].c ? 2 : 0; });
    w[rootId] = 1e6;
    inSet = set; weight = w;
  }

  function buildColumns() {
    var by_stage = {};
    Object.keys(inSet).forEach(function (id) { (by_stage[st(id)] = by_stage[st(id)] || []).push(id); });
    cols = Object.keys(by_stage).map(Number).sort(function (a, b) { return a - b; }).map(function (s) {
      var ids = by_stage[s].sort(function (a, b) { return weight[b] - weight[a] || (by[a].n < by[b].n ? -1 : 1); });
      return { stage: s, all: ids, show: expanded[s] ? ids : ids.slice(0, K) };
    });
    shown = {};
    cols.forEach(function (c) { c.show.forEach(function (id) { shown[id] = 1; }); });
    edges = [];
    Object.keys(shown).forEach(function (a) {
      by[a].up.forEach(function (b) { if (shown[b] && st(b) > st(a)) edges.push({ a: a, b: b }); });
    });
  }

  /* ---------- drawing ---------- */
  function card(id) {
    var n = by[id], b = mk('button', 'bn' + (id === root ? ' root' : '') + (n.c ? ' choke' : ''));
    b.type = 'button'; b.dataset.id = id;
    A.setPal(b, n.l);
    b.dataset.tip = A.nodeTip(n);
    b.appendChild(A.logo(n, 'm'));
    b.appendChild(mk('span', 'bn-n', n.n.replace(/ \(.*\)$/, '')));
    var meta = [n.pq || (n.kind === 'private' ? 'Private' : ''), A.hqLabel(n)].filter(Boolean).join(' · ');
    if (meta) b.appendChild(mk('span', 'bn-m', meta));
    if (n.c) b.appendChild(mk('span', 'bn-c', '◆'));
    cards[id] = b;
    return b;
  }
  function renderColumns() {
    colsEl.textContent = ''; cards = {};
    cols.forEach(function (c) {
      var S = STAGES[c.stage], sec = mk('section', 'br-col');
      var h = mk('h3', null, S.n); h.appendChild(mk('i', null, String(c.all.length)));
      h.dataset.tip = A.catTip(S.n, S.d, '', c.all.map(function (i) { return by[i]; }), false);
      sec.appendChild(h);
      var list = mk('div', 'br-nodes');
      c.show.forEach(function (id) { list.appendChild(card(id)); });
      sec.appendChild(list);
      if (c.all.length > c.show.length || expanded[c.stage]) {
        var m = mk('button', 'br-more', expanded[c.stage] && c.all.length > K ? 'Show fewer' : '+' + (c.all.length - c.show.length) + ' more');
        m.type = 'button';
        m.addEventListener('click', function () { expanded[c.stage] = !expanded[c.stage]; refresh(); });
        sec.appendChild(m);
      }
      colsEl.appendChild(sec);
    });
  }
  function sizeColumns() {
    var n = cols.length || 1;                    /* column widths never change when the side panel opens, so double-clicks land where they started */
    var avail = scroller.clientWidth - 28, gap = n > 8 ? 26 : 44;
    var bw = Math.max(104, Math.min(176, Math.floor((avail - (n - 1) * gap) / n)));
    grid.style.setProperty('--bw', bw + 'px'); grid.style.setProperty('--gap', gap + 'px');
  }
  function rel(e, g) { var r = e.getBoundingClientRect(); return { l: r.left - g.left, r: r.right - g.left, y: r.top - g.top + r.height / 2 }; }
  function drawEdges() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var g = grid.getBoundingClientRect();
    svg.setAttribute('width', grid.scrollWidth); svg.setAttribute('height', grid.scrollHeight);
    var active = sel || hover, ch = active ? chain(active) : null, labelled = {}, nLab = 0;
    edges.forEach(function (e) {
      var A1 = rel(cards[e.a], g), B1 = rel(cards[e.b], g);
      var dx = Math.max(30, (B1.l - A1.r) * 0.45);
      var d = 'M' + A1.r + ' ' + A1.y + ' C' + (A1.r + dx) + ' ' + A1.y + ',' + (B1.l - dx) + ' ' + B1.y + ',' + B1.l + ' ' + B1.y;
      var cls = 'br-e';
      if (ch) {
        var k = e.a + '>' + e.b;
        if (ch.up[k]) cls += ' sup'; else if (ch.down[k]) cls += ' cus'; else cls += ' faint';
        if (e.a === active || e.b === active) cls += ' strong';
      }
      var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.appendChild(p);
      if (ch && /strong/.test(cls)) {
        var f = A.flowOf(e.a, e.b);
        if (f) {
          var hit = document.createElementNS(NS, 'path'); hit.setAttribute('d', d); hit.setAttribute('class', 'br-hit');
          hit.setAttribute('data-tip', by[e.a].n + ' ← ' + by[e.b].n + '|' + f); svg.appendChild(hit);
          var m = p.getPointAtLength(p.getTotalLength() / 2), t = document.createElementNS(NS, 'text');
          t.setAttribute('x', m.x); t.setAttribute('y', m.y); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'br-fl');
          t.textContent = f.length > 30 ? f.slice(0, 29) + '…' : f;
          if (!labelled[f] && nLab < 6) { labelled[f] = 1; nLab++; svg.appendChild(t); }   /* many links: label the first few distinct flows, the rest are on hover */
        }
      }
    });
  }
  /* the path through the branch that touches one player, following only drawn links */
  function chain(id) {
    var up = {}, dn = {}, seen = {}, q = [id], x;
    seen[id] = 1;
    while (q.length) { x = q.shift(); edges.forEach(function (e) { if (e.a === x) { up[e.a + '>' + e.b] = 1; if (!seen[e.b]) { seen[e.b] = 1; q.push(e.b); } } }); }
    var seen2 = {}; seen2[id] = 1; q = [id];
    while (q.length) { x = q.shift(); edges.forEach(function (e) { if (e.b === x) { dn[e.a + '>' + e.b] = 1; if (!seen2[e.a]) { seen2[e.a] = 1; q.push(e.a); } } }); }
    return { up: up, down: dn, nodesUp: seen, nodesDown: seen2 };
  }
  function paint() {
    var active = sel || hover, ch = active ? chain(active) : null;
    Object.keys(cards).forEach(function (id) {
      var c = cards[id];
      c.classList.remove('sel', 'sup', 'cus', 'dim');
      if (!active) return;
      if (id === active) c.classList.add('sel');
      else if (ch.nodesUp[id]) c.classList.add('sup');
      else if (ch.nodesDown[id]) c.classList.add('cus');
      else c.classList.add('dim');
    });
    drawEdges();
  }

  /* ---------- the strip at the top ---------- */
  function renderTop() {
    var n = by[root], ids = Object.keys(inSet), cc = {};
    ids.forEach(function (i) { var h = by[i].hq; if (h && h !== 'WW') cc[h] = 1; });
    var weak = ids.filter(function (i) { return by[i].c; }).sort(function (a, b) { return weight[b] - weight[a]; });
    var name = n.n;
    $('#br-name').textContent = name;
    $('#br-sub').textContent = A.firstSentence(n.w);
    var stats = $('#br-stats'); stats.textContent = '';
    [[ids.length, 'players'], [Object.keys(cc).length, 'countries'], [weak.length, 'bottlenecks']].forEach(function (s) {
      var b = mk('span', 'br-stat'); b.appendChild(mk('b', null, String(s[0]))); b.appendChild(document.createTextNode(' ' + s[1])); stats.appendChild(b);
    });
    var w = $('#br-weak'); w.textContent = '';
    if (weak.length) {
      w.appendChild(mk('span', 'br-wl', 'Weak points'));
      weak.slice(0, 4).forEach(function (i) {
        var b = mk('button', 'br-chip', by[i].n.replace(/ \(.*\)$/, '')); b.type = 'button'; b.dataset.tip = by[i].n + '|' + (by[i].cw || '');
        b.addEventListener('click', function () { focus(i); });
        w.appendChild(b);
      });
    }
    var lg = $('#br-logo'); lg.textContent = ''; lg.appendChild(A.logo(n, 'l'));
    var tr = $('#br-trail'); tr.textContent = '';
    trail.slice(0, -1).forEach(function (id, i) {
      var b = mk('button', 'br-crumb', by[id].n.replace(/ \(.*\)$/, '')); b.type = 'button';
      b.addEventListener('click', function () { trail = trail.slice(0, i + 1); open(id, true); });
      tr.appendChild(b); tr.appendChild(mk('span', 'br-sep', '›'));
    });
    $('#br-back').textContent = trail.length > 1 ? '← Back' : '← Back to map';
    $('#br-all').setAttribute('aria-pressed', String(Object.keys(expanded).length > 0 && cols.every(function (c) { return c.all.length <= K || expanded[c.stage]; })));
    A.annotate($('.br-top'));
  }

  /* ---------- open, close, focus ---------- */
  function refresh() {
    buildColumns(); renderColumns(); sizeColumns(); renderTop();
    requestAnimationFrame(function () { paint(); });
  }
  function open(id, fromTrail) {
    if (!by[id]) return;
    if (!fromTrail) { if (trail[trail.length - 1] !== id) trail.push(id); }
    root = id; sel = null; hover = null; expanded = {};
    if (opened) A.closePanel();
    build(id);
    wrap.hidden = false; opened = true;
    document.body.classList.add('in-branch');
    refresh();
    scroller.scrollTop = 0; scroller.scrollLeft = 0;
    try { history.replaceState(null, '', '#branch=' + id); } catch (e) {}
    $('#br-back').focus({ preventScroll: true });
  }
  function close() {
    if (!opened) return;
    opened = false; wrap.hidden = true; sel = null; hover = null; trail = [];
    document.body.classList.remove('in-branch');
    A.closePanel();
    A.setHash('');
  }
  function back() {
    if (trail.length > 1) { trail.pop(); open(trail[trail.length - 1], true); } else close();
  }
  function focus(id) {
    if (!inSet[id]) { open(id); return; }
    var s = st(id);
    if (!shown[id]) { expanded[s] = true; refresh(); }
    sel = id; paint();
    var c = cards[id]; if (c) c.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    A.openPanel(id);
    sizeColumns(); requestAnimationFrame(paint);
  }

  /* ---------- events ---------- */
  colsEl.addEventListener('click', function (ev) {
    var b = ev.target.closest('.bn');
    if (!b) return;
    var id = b.dataset.id;
    if (sel === id) { sel = null; A.closePanel(); paint(); return; }
    sel = id; paint(); A.openPanel(id); sizeColumns(); requestAnimationFrame(paint);
  });
  colsEl.addEventListener('dblclick', function (ev) {
    var b = ev.target.closest('.bn');
    if (b && b.dataset.id !== root) open(b.dataset.id);
  });
  colsEl.addEventListener('mouseover', function (ev) {
    if (sel) return;
    var b = ev.target.closest('.bn'), id = b ? b.dataset.id : null;
    if (id !== hover) { hover = id; paint(); }
  });
  colsEl.addEventListener('mouseleave', function () { if (hover) { hover = null; paint(); } });
  scroller.addEventListener('click', function (ev) {
    if (sel && !ev.target.closest('.bn, .br-more, .br-hit')) { sel = null; A.closePanel(); paint(); }
  });
  $('#br-back').addEventListener('click', back);
  $('#br-all').addEventListener('click', function () {
    var allOn = cols.every(function (c) { return c.all.length <= K || expanded[c.stage]; });
    expanded = {};
    if (!allOn) cols.forEach(function (c) { expanded[c.stage] = true; });
    refresh();
  });
  $('#br-copy').addEventListener('click', function () {
    var b = this, url = location.origin + location.pathname + '#branch=' + root;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { b.textContent = 'Copied ✓'; }, function () { b.textContent = 'Link in address bar'; });
    setTimeout(function () { b.textContent = 'Copy link'; }, 2000);
  });
  document.addEventListener('keydown', function (ev) {
    if (!opened || ev.key !== 'Escape') return;
    ev.stopImmediatePropagation();
    if (document.body.classList.contains('has-panel')) { sel = null; A.closePanel(); paint(); } else back();
  }, true);
  var rt = 0;
  function relayout() { clearTimeout(rt); rt = setTimeout(function () { if (opened) { sizeColumns(); requestAnimationFrame(paint); } }, 60); }
  window.addEventListener('resize', relayout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(scroller);
  new MutationObserver(relayout).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* household activities and the apps, shops and devices you deal with open their own supply-chain page when clicked */
  A.branch = { open: open, close: close, focus: focus, isOpen: function () { return opened; }, autoOpen: function (id) { return st(id) <= 1; } };

  var H = A.initialHash || location.hash, hb = /(?:^#|&)branch=([\w-]+)/.exec(H), hn = /(?:^#|&)n=([\w-]+)/.exec(H);
  if (hb && by[hb[1]]) open(hb[1]);
  else if (hn && by[hn[1]] && A.branch.autoOpen(hn[1])) open(hn[1]);
})();
