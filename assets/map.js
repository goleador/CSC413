/* ============================================================
   CSC 413 — architecture map renderer
   Draws assets/map-data.js as a pannable, zoomable UML-style map
   and wires the concept lens, the details panel, search, and the
   milestone slider. No libraries, no build step, works from file://.
   ============================================================ */

(function () {
  'use strict';

  const D = window.MAP_DATA;
  const NODE_W = 210;
  const HEADER_H = 40;
  const LINE_H = 15;
  const PAD_BOTTOM = 8;
  const MAX_MEMBER_CHARS = 34;
  const GROUP_PAD = 26;

  const svgNS = 'http://www.w3.org/2000/svg';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (name, attrs, parent) => {
    const e = document.createElementNS(svgNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const html = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  // ---------- indexes ----------
  const nodeById = new Map(D.NODES.map(n => [n.id, n]));
  const groupById = new Map(D.GROUPS.map(g => [g.id, g]));
  const catById = new Map(D.CATEGORIES.map(c => [c.id, c]));
  const conceptById = new Map(D.CONCEPTS.map(c => [c.id, c]));
  const milestoneIndex = new Map(D.MILESTONES.map((m, i) => [m.id, i]));

  D.NODES.forEach(n => {
    n.w = NODE_W;
    n.h = HEADER_H + n.members.length * LINE_H + PAD_BOTTOM;
    n.cx = n.x + n.w / 2;
    n.cy = n.y + n.h / 2;
    n.mIndex = milestoneIndex.get(n.milestone);
    n.concepts = [];
  });
  D.EDGES.forEach(e => { e.id = e.from + '>' + e.to; e.src = nodeById.get(e.from); e.dst = nodeById.get(e.to); });
  const edgeById = new Map(D.EDGES.map(e => [e.id, e]));

  // Normalise concept node lists and build the inverse index.
  D.CONCEPTS.forEach(c => {
    c.entries = c.nodes.map(x => typeof x === 'string' ? { id: x, note: '' } : x);
    c.nodeSet = new Set(c.entries.map(x => x.id));
    c.edgeSet = new Set(c.edges || []);
    c.entries.forEach(x => {
      const n = nodeById.get(x.id);
      if (!n) { console.warn('concept', c.id, 'names unknown node', x.id); return; }
      n.concepts.push({ concept: c, note: x.note });
    });
    c.edgeSet.forEach(id => { if (!edgeById.has(id)) console.warn('concept', c.id, 'names unknown edge', id); });
  });

  // ---------- state ----------
  const state = {
    selectedNode: null,
    selectedConcept: null,
    hoverNode: null,
    showMinor: false,
    showTests: false,
    milestone: D.MILESTONES.length - 1,
    t: { x: 0, y: 0, k: 1 },
  };

  // ---------- DOM handles ----------
  const svg = $('#map');
  const viewport = $('#viewport');
  const gGroups = $('#layer-groups');
  const gEdges = $('#layer-edges');
  const gNodes = $('#layer-nodes');
  const gLabels = $('#layer-labels');
  const panel = $('#panel');
  const conceptList = $('#concept-list');

  const nodeEls = new Map();
  const edgeEls = new Map();
  const labelEls = new Map();
  const groupEls = new Map();

  const STEREO = {
    abstract: '«abstract»', interface: '«interface»', sealed: '«sealed interface»',
    record: '«record»', enum: '«enum»', final: '«final»', test: '«test»', class: '',
  };

  // ---------- drawing: nodes ----------
  function truncate(s) {
    return s.length > MAX_MEMBER_CHARS ? s.slice(0, MAX_MEMBER_CHARS - 1) + '…' : s;
  }

  function drawNode(n) {
    const g = el('g', { class: `node kind-${n.kind} c${groupById.get(n.group).color}` + (n.planned ? ' planned' : ''), 'data-id': n.id, transform: `translate(${n.x},${n.y})`, tabindex: 0, role: 'button' }, gNodes);
    el('title', {}, g).textContent = n.id + (n.summary ? ' — ' + n.summary : '');
    el('rect', { class: 'node-bg', width: n.w, height: n.h, rx: 6 }, g);
    el('rect', { class: 'node-head', width: n.w, height: HEADER_H, rx: 6 }, g);
    el('rect', { class: 'node-head-fix', y: HEADER_H - 6, width: n.w, height: 6 }, g); // square off the header's bottom corners
    const stereo = n.planned ? '«planned»' : STEREO[n.kind];
    if (stereo) el('text', { class: 'stereo', x: n.w / 2, y: 13, 'text-anchor': 'middle' }, g).textContent = stereo;
    el('text', { class: 'name', x: n.w / 2, y: stereo ? 30 : 25, 'text-anchor': 'middle' }, g).textContent = n.id;
    n.members.forEach((m, i) => {
      el('text', { class: 'member', x: 8, y: HEADER_H + 11 + i * LINE_H }, g).textContent = truncate(m);
    });
    el('rect', { class: 'node-outline', width: n.w, height: n.h, rx: 6 }, g);
    nodeEls.set(n.id, g);
  }

  // ---------- drawing: groups ----------
  function groupBox(gid) {
    const members = D.NODES.filter(n => n.group === gid && isNodeVisible(n));
    if (!members.length) return null;
    const x0 = Math.min(...members.map(n => n.x)) - GROUP_PAD;
    const y0 = Math.min(...members.map(n => n.y)) - GROUP_PAD - 14;
    const x1 = Math.max(...members.map(n => n.x + n.w)) + GROUP_PAD;
    const y1 = Math.max(...members.map(n => n.y + n.h)) + GROUP_PAD;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  function drawGroups() {
    gGroups.textContent = '';
    groupEls.clear();
    D.GROUPS.forEach(grp => {
      const box = groupBox(grp.id);
      if (!box) return;
      const g = el('g', { class: `group c${grp.color}` + (grp.planned ? ' planned' : '') }, gGroups);
      el('rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 14 }, g);
      const t = el('text', { class: 'group-label', x: box.x + 14, y: box.y + 20 }, g);
      el('tspan', { class: 'group-name' }, t).textContent = grp.label;
      el('tspan', { class: 'group-sub', dx: 10 }, t).textContent = grp.sub;
      groupEls.set(grp.id, g);
    });
  }

  // ---------- drawing: edges ----------
  function anchor(from, to) {
    // Point where the segment from `from`'s centre to `to`'s centre leaves `from`'s box.
    const dx = to.cx - from.cx, dy = to.cy - from.cy;
    if (dx === 0 && dy === 0) return { x: from.cx, y: from.cy };
    const hw = from.w / 2, hh = from.h / 2;
    const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
    const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
    const s = Math.min(sx, sy);
    return { x: from.cx + dx * s, y: from.cy + dy * s };
  }

  function edgePath(e) {
    const a = e.src, b = e.dst;
    if (e.kind === 'extends' || e.kind === 'implements') {
      // Orthogonal: leave the child's top (or bottom), run along a bus, enter the parent's bottom (or top).
      const childBelow = a.cy > b.cy;
      const sx = a.cx, sy = childBelow ? a.y : a.y + a.h;
      const tx = b.cx, ty = childBelow ? b.y + b.h : b.y;
      const busY = childBelow ? ty + 40 : ty - 40;
      const mid = { x: (sx + tx) / 2, y: busY };
      return { d: `M${sx},${sy} L${sx},${busY} L${tx},${busY} L${tx},${ty}`, mid };
    }
    const p = anchor(a, b), q = anchor(b, a);
    return { d: `M${p.x},${p.y} L${q.x},${q.y}`, mid: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } };
  }

  function drawEdge(e) {
    const { d, mid } = edgePath(e);
    const g = el('g', { class: `edge kind-${e.kind}`, 'data-id': e.id }, gEdges);
    el('path', { class: 'edge-hit', d }, g);
    el('path', { class: 'edge-line', d, 'marker-end': `url(#arrow-${e.kind})`, 'marker-start': e.kind === 'has' ? 'url(#diamond)' : null }, g);
    if (e.kind !== 'has') g.lastChild.removeAttribute('marker-start');
    edgeEls.set(e.id, g);
    if (e.label) {
      const lg = el('g', { class: 'edge-label', 'data-id': e.id, transform: `translate(${mid.x},${mid.y})` }, gLabels);
      const t = el('text', { 'text-anchor': 'middle', y: 4 }, lg);
      t.textContent = e.label;
      // background sized after layout
      requestAnimationFrame(() => {
        const bb = t.getBBox();
        const r = el('rect', { x: bb.x - 4, y: bb.y - 2, width: bb.width + 8, height: bb.height + 4, rx: 3 });
        lg.insertBefore(r, t);
      });
      labelEls.set(e.id, lg);
    }
  }

  // ---------- visibility & emphasis ----------
  function isNodeVisible(n) {
    if (n.test && !state.showTests) return false;
    if (n.mIndex > state.milestone) return false;
    return true;
  }

  function isEdgeVisible(e) {
    if (!isNodeVisible(e.src) || !isNodeVisible(e.dst)) return false;
    if (!e.minor) return true;
    if (state.showMinor) return true;
    const sel = state.selectedNode || state.hoverNode;
    if (sel && (e.from === sel || e.to === sel)) return true;
    if (state.selectedConcept && state.selectedConcept.edgeSet.has(e.id)) return true;
    return false;
  }

  function applyState() {
    const c = state.selectedConcept;
    const sel = state.selectedNode;
    const hov = state.hoverNode;
    const neighbours = new Set();
    const focusNode = sel || hov;
    if (focusNode) {
      D.EDGES.forEach(e => {
        if (e.from === focusNode) neighbours.add(e.to);
        if (e.to === focusNode) neighbours.add(e.from);
      });
    }

    D.NODES.forEach(n => {
      const g = nodeEls.get(n.id);
      const vis = isNodeVisible(n);
      g.classList.toggle('hidden', !vis);
      let dim = false, focus = false, inConcept = false;
      if (c) { inConcept = c.nodeSet.has(n.id); dim = !inConcept; }
      if (focusNode) {
        if (n.id === focusNode) focus = true;
        else if (!neighbours.has(n.id)) dim = true;
        else if (c && !inConcept) dim = true;
      }
      g.classList.toggle('dim', dim);
      g.classList.toggle('focus', focus);
      g.classList.toggle('selected', n.id === sel);
      g.classList.toggle('in-concept', !!(c && inConcept));
      if (c && inConcept) g.style.setProperty('--concept', `var(--c${catById.get(c.cat).color})`);
      else g.style.removeProperty('--concept');
    });

    D.EDGES.forEach(e => {
      const g = edgeEls.get(e.id);
      const vis = isEdgeVisible(e);
      g.classList.toggle('hidden', !vis);
      let hi = false, dim = false;
      if (focusNode) { hi = e.from === focusNode || e.to === focusNode; dim = !hi; }
      if (c) {
        const inC = c.edgeSet.has(e.id) || (c.nodeSet.has(e.from) && c.nodeSet.has(e.to));
        if (!focusNode) { hi = c.edgeSet.has(e.id); dim = !inC; }
        else if (!inC) dim = true;
      }
      g.classList.toggle('hi', hi);
      g.classList.toggle('dim', dim);
      if (c && hi) g.style.setProperty('--concept', `var(--c${catById.get(c.cat).color})`);
      else g.style.removeProperty('--concept');
      const lg = labelEls.get(e.id);
      if (lg) lg.classList.toggle('show', vis && hi);
    });

    drawGroups();
    document.body.classList.toggle('has-selection', !!(sel || c));
  }

  // ---------- pan & zoom ----------
  function setTransform(t) {
    state.t = t;
    viewport.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.k})`);
    $('#zoom-level').textContent = Math.round(t.k * 100) + '%';
  }

  function animateTo(target, ms) {
    const from = { ...state.t };
    const start = performance.now();
    const ease = u => 1 - Math.pow(1 - u, 3);
    function step(now) {
      const u = Math.min(1, (now - start) / (ms || 300));
      const v = ease(u);
      setTransform({ x: from.x + (target.x - from.x) * v, y: from.y + (target.y - from.y) * v, k: from.k + (target.k - from.k) * v });
      if (u < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function clampK(k) { return Math.max(0.12, Math.min(3, k)); }

  function zoomAt(clientX, clientY, factor) {
    const r = svg.getBoundingClientRect();
    const px = clientX - r.left, py = clientY - r.top;
    const k = clampK(state.t.k * factor);
    const f = k / state.t.k;
    setTransform({ x: px - (px - state.t.x) * f, y: py - (py - state.t.y) * f, k });
  }

  function bboxOf(nodes) {
    const vis = nodes.filter(isNodeVisible);
    if (!vis.length) return null;
    const x0 = Math.min(...vis.map(n => n.x)), y0 = Math.min(...vis.map(n => n.y));
    const x1 = Math.max(...vis.map(n => n.x + n.w)), y1 = Math.max(...vis.map(n => n.y + n.h));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  function fitTo(box, animate) {
    if (!box) return;
    const r = svg.getBoundingClientRect();
    const margin = 60;
    const k = clampK(Math.min((r.width - margin * 2) / box.w, (r.height - margin * 2) / box.h));
    const t = { k, x: (r.width - box.w * k) / 2 - box.x * k, y: (r.height - box.h * k) / 2 - box.y * k };
    if (animate) animateTo(t, 350); else setTransform(t);
  }

  function fitAll(animate) { fitTo(bboxOf(D.NODES), animate); }
  function fitCore(animate) { fitTo(bboxOf(D.NODES.filter(n => !n.planned)), animate); }

  function ensureVisible(n) {
    const r = svg.getBoundingClientRect();
    const t = state.t;
    const sx = n.x * t.k + t.x, sy = n.y * t.k + t.y, sw = n.w * t.k, sh = n.h * t.k;
    const inside = sx > 20 && sy > 20 && sx + sw < r.width - 20 && sy + sh < r.height - 20;
    if (inside) return;
    animateTo({ k: t.k, x: r.width / 2 - n.cx * t.k, y: r.height / 2 - n.cy * t.k }, 350);
  }

  // Wheel: plain scroll pans, ctrl/⌘ + scroll (and trackpad pinch) zooms.
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
    } else {
      const t = state.t;
      setTransform({ x: t.x - e.deltaX, y: t.y - e.deltaY, k: t.k });
    }
  }, { passive: false });

  // Safari trackpad pinch.
  let gestureK = 1;
  svg.addEventListener('gesturestart', e => { e.preventDefault(); gestureK = state.t.k; });
  svg.addEventListener('gesturechange', e => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, (gestureK * e.scale) / state.t.k);
  });

  // Pointer drag (pan) and two-finger pinch.
  const pointers = new Map();
  let drag = null;
  let pinch = null;

  svg.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { x: e.clientX, y: e.clientY, tx: state.t.x, ty: state.t.y, moved: false, target: e.target.closest('.node') };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: state.t.k };
      drag = null;
    }
  });

  svg.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      zoomAt(cx, cy, (pinch.k * d / pinch.d) / state.t.k);
      return;
    }
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; svg.classList.add('dragging'); }
      if (drag.moved) setTransform({ x: drag.tx + dx, y: drag.ty + dy, k: state.t.k });
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (drag && !drag.moved && pointers.size === 0) {
      if (drag.target) selectNode(drag.target.getAttribute('data-id'));
      else clearSelection();
    }
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) { drag = null; svg.classList.remove('dragging'); }
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  // Hover emphasis (mouse only; touch has no hover).
  gNodes.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const g = e.target.closest('.node');
    if (!g) return;
    state.hoverNode = g.getAttribute('data-id');
    applyState();
  });
  gNodes.addEventListener('pointerout', e => {
    const g = e.target.closest('.node');
    if (!g || g.contains(e.relatedTarget)) return;
    state.hoverNode = null;
    applyState();
  });
  gNodes.addEventListener('keydown', e => {
    const g = e.target.closest('.node');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNode(g.getAttribute('data-id')); }
  });
  svg.addEventListener('dblclick', e => {
    if (e.target.closest('.node')) return;
    zoomAt(e.clientX, e.clientY, 1.6);
  });

  // ---------- selection ----------
  function selectNode(id) {
    const n = nodeById.get(id);
    if (!n) return;
    state.selectedNode = id;
    if (state.selectedConcept && !state.selectedConcept.nodeSet.has(id)) state.selectedConcept = null;
    applyState();
    renderNodePanel(n);
    ensureVisible(n);
    updateHash();
    highlightConceptList();
  }

  function selectConcept(id, opts) {
    const c = conceptById.get(id);
    if (!c) return;
    state.selectedConcept = c;
    state.selectedNode = null;
    // Reveal anything the concept needs.
    if (c.entries.some(x => nodeById.get(x.id)?.test)) { state.showTests = true; $('#toggle-tests').checked = true; }
    const maxM = Math.max(...c.entries.map(x => nodeById.get(x.id)?.mIndex ?? 0));
    if (maxM > state.milestone) { state.milestone = maxM; $('#milestone').value = maxM; updateMilestoneLabel(); }
    applyState();
    renderConceptPanel(c);
    if (!opts || !opts.noFit) fitTo(bboxOf(c.entries.map(x => nodeById.get(x.id)).filter(Boolean)), true);
    updateHash();
    highlightConceptList();
  }

  function clearSelection() {
    if (!state.selectedNode && !state.selectedConcept) return;
    state.selectedNode = null;
    state.selectedConcept = null;
    applyState();
    renderIntroPanel();
    updateHash();
    highlightConceptList();
  }

  function updateHash() {
    const parts = [];
    if (state.selectedNode) parts.push('node=' + encodeURIComponent(state.selectedNode));
    else if (state.selectedConcept) parts.push('concept=' + state.selectedConcept.id);
    if (state.milestone < D.MILESTONES.length - 1) parts.push('m=' + D.MILESTONES[state.milestone].id);
    history.replaceState(null, '', parts.length ? '#' + parts.join('&') : location.pathname + location.search);
  }

  function readHash() {
    const h = location.hash.replace(/^#/, '');
    if (!h) return;
    const q = Object.fromEntries(h.split('&').map(kv => kv.split('=').map(decodeURIComponent)));
    if (q.m && milestoneIndex.has(q.m)) { state.milestone = milestoneIndex.get(q.m); $('#milestone').value = state.milestone; updateMilestoneLabel(); applyState(); fitAll(false); }
    if (q.node && nodeById.has(q.node)) { selectNode(q.node); return true; }
    if (q.concept && conceptById.has(q.concept)) { selectConcept(q.concept); return true; }
    return false;
  }

  // ---------- panel rendering ----------
  function chip(text, colorSlot, onClick, cls) {
    const b = html(onClick ? 'button' : 'span', 'chip' + (cls ? ' ' + cls : ''), text);
    if (colorSlot) b.style.setProperty('--chip', `var(--c${colorSlot})`);
    if (onClick) { b.type = 'button'; b.addEventListener('click', onClick); }
    return b;
  }

  function nodeButton(id, extraCls) {
    const n = nodeById.get(id);
    const b = html('button', 'node-link ' + (extraCls || ''), id);
    b.type = 'button';
    if (n) b.style.setProperty('--chip', `var(--c${groupById.get(n.group).color})`);
    b.addEventListener('click', () => selectNode(id));
    return b;
  }

  function milestoneLabel(n) {
    const m = D.MILESTONES[n.mIndex];
    if (!m) return '';
    return m.week ? `${m.id} · week ${m.week}` : m.id;
  }

  function renderNodePanel(n) {
    panel.textContent = '';
    const grp = groupById.get(n.group);

    const head = html('div', 'panel-head');
    const kicker = html('div', 'kicker');
    kicker.append(chip((n.planned ? '«planned» ' : '') + (STEREO[n.kind] || 'class'), null, null, 'plain'));
    kicker.append(chip(grp.label, grp.color));
    head.append(kicker);
    head.append(html('h2', 'mono', n.id));
    const meta = html('p', 'meta');
    meta.append(n.planned ? 'Design document only, not yet in the source tree' : `Appears at ${milestoneLabel(n)}`);
    if (n.file) {
      meta.append(' · ');
      const a = html('a', null, n.doc ? 'design doc ↗' : 'source ↗');
      a.href = n.doc ? D.REPO + n.file : (n.test ? D.TEST : D.SRC) + n.file;
      a.target = '_blank'; a.rel = 'noopener';
      meta.append(a);
    }
    head.append(meta);
    panel.append(head);

    panel.append(html('p', 'summary', n.summary));

    if (n.notes && n.notes.length) {
      panel.append(html('h3', null, 'Design notes'));
      const ul = html('ul', 'notes');
      n.notes.forEach(t => ul.append(html('li', null, t)));
      panel.append(ul);
    }

    if (n.concepts.length) {
      panel.append(html('h3', null, 'Concepts shown here'));
      const list = html('ul', 'concept-hits');
      n.concepts
        .slice()
        .sort((a, b) => D.CONCEPTS.indexOf(a.concept) - D.CONCEPTS.indexOf(b.concept))
        .forEach(({ concept, note }) => {
          const li = html('li');
          li.append(chip(concept.label, catById.get(concept.cat).color, () => selectConcept(concept.id)));
          if (note) li.append(html('span', 'note', note));
          list.append(li);
        });
      panel.append(list);
    }

    panel.append(html('h3', null, 'Members'));
    const pre = html('pre', 'members');
    pre.textContent = n.members.join('\n');
    panel.append(pre);

    const out = D.EDGES.filter(e => e.from === n.id && isNodeVisible(e.dst));
    const inn = D.EDGES.filter(e => e.to === n.id && isNodeVisible(e.src));
    if (out.length || inn.length) {
      panel.append(html('h3', null, 'Relationships'));
      const ul = html('ul', 'rels');
      const verb = { extends: 'extends', implements: 'implements', has: 'has a', uses: 'uses', creates: 'creates', tests: 'tests' };
      const passive = { extends: 'extended by', implements: 'implemented by', has: 'part of', uses: 'used by', creates: 'created by', tests: 'tested by' };
      const order = ['extends', 'implements', 'has', 'creates', 'uses', 'tests'];
      out.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)).forEach(e => {
        const li = html('li', 'rel-' + e.kind);
        li.append(html('span', 'verb', verb[e.kind]), ' ', nodeButton(e.to));
        if (e.label) li.append(html('span', 'note', e.label));
        ul.append(li);
      });
      inn.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)).forEach(e => {
        const li = html('li', 'rel-' + e.kind + ' incoming');
        li.append(html('span', 'verb', passive[e.kind]), ' ', nodeButton(e.from));
        if (e.label) li.append(html('span', 'note', e.label));
        ul.append(li);
      });
      panel.append(ul);
    }
    panel.scrollTop = 0;
  }

  function renderConceptPanel(c) {
    panel.textContent = '';
    const cat = catById.get(c.cat);
    const head = html('div', 'panel-head');
    const kicker = html('div', 'kicker');
    kicker.append(chip(cat.label, cat.color));
    if (c.absent) kicker.append(chip('not in the code, by design', null, null, 'plain'));
    head.append(kicker);
    head.append(html('h2', null, c.label));
    const m = D.MILESTONES[milestoneIndex.get(c.milestone)];
    head.append(html('p', 'meta', `Week ${c.week}` + (m ? ` · visible in the project from ${m.id}` : '')));
    panel.append(head);
    panel.append(html('p', 'summary', c.blurb));

    panel.append(html('h3', null, 'Where to look'));
    const ul = html('ul', 'where');
    c.entries.forEach(x => {
      if (!nodeById.has(x.id)) return;
      const li = html('li');
      li.append(nodeButton(x.id));
      if (x.note) li.append(html('span', 'note', x.note));
      ul.append(li);
    });
    panel.append(ul);

    // prev / next within the list
    const i = D.CONCEPTS.indexOf(c);
    const nav = html('div', 'concept-nav');
    if (i > 0) { const b = html('button', 'ghost', '← ' + D.CONCEPTS[i - 1].label); b.type = 'button'; b.addEventListener('click', () => selectConcept(D.CONCEPTS[i - 1].id)); nav.append(b); }
    if (i < D.CONCEPTS.length - 1) { const b = html('button', 'ghost', D.CONCEPTS[i + 1].label + ' →'); b.type = 'button'; b.addEventListener('click', () => selectConcept(D.CONCEPTS[i + 1].id)); nav.append(b); }
    panel.append(nav);
    panel.scrollTop = 0;
  }

  function renderIntroPanel() {
    panel.textContent = '';
    const head = html('div', 'panel-head');
    head.append(html('h2', null, 'How to read this map'));
    panel.append(head);
    const p1 = html('p', 'summary');
    p1.append('Every box is one class in the reference engine, drawn in UML class-diagram notation (Week 8). Packages are the tinted regions, laid out as layers: the entry point on top, the views below it, then the engine and factories, and the model at the bottom. Dependencies point downward.');
    panel.append(p1);

    const ol = html('ul', 'notes');
    [
      'Click a class to see what it is for, the design decisions written into its Javadoc, and every relationship it takes part in.',
      'Pick a concept on the left to dim everything that does not demonstrate it and read where to look.',
      'Drag the "as of milestone" slider to watch the codebase grow the way the student project does.',
      'Minor dependencies (on Position, Color, Move and the like) are hidden until you select a class or turn them all on.',
    ].forEach(t => ol.append(html('li', null, t)));
    panel.append(ol);

    panel.append(html('h3', null, 'Edges'));
    const legend = html('ul', 'legend');
    [
      ['extends', 'inheritance: solid line, hollow triangle'],
      ['implements', 'interface realisation: dashed line, hollow triangle'],
      ['has', 'composition: a field holding the other object; diamond on the owner'],
      ['uses', 'dependency: calls methods on, dashed open arrow'],
      ['creates', 'instantiates, dashed open arrow'],
      ['tests', 'a test class exercising a subject'],
    ].forEach(([kind, desc]) => {
      const li = html('li');
      const s = document.createElementNS(svgNS, 'svg');
      s.setAttribute('viewBox', '0 0 70 14'); s.setAttribute('class', 'legend-swatch kind-' + kind);
      const path = el('path', { class: 'edge-line', d: 'M2,7 L58,7', 'marker-end': `url(#arrow-${kind})` }, s);
      if (kind === 'has') path.setAttribute('marker-start', 'url(#diamond)');
      li.append(s, html('span', null, desc));
      legend.append(li);
    });
    panel.append(legend);

    panel.append(html('h3', null, 'Boxes'));
    const kinds = html('ul', 'notes');
    [
      'Header: stereotype («interface», «abstract», «record», «enum», «sealed interface», «final» for a static utility, «test») and the class name. Abstract names are in italics.',
      'Body: the members that matter for the course, with UML visibility marks: + public, − private, # protected.',
      'Dashed, faded boxes are planned classes from the AI design document, not yet in the repository.',
    ].forEach(t => kinds.append(html('li', null, t)));
    panel.append(kinds);

    panel.append(html('h3', null, 'Controls'));
    const keys = html('ul', 'notes keys');
    [
      ['drag', 'pan'], ['scroll', 'pan'], ['⌘/ctrl + scroll · pinch', 'zoom'], ['double-click', 'zoom in'],
      ['+ / −', 'zoom'], ['0', 'fit everything'], ['/', 'search'], ['esc', 'clear selection'],
    ].forEach(([k, v]) => { const li = html('li'); li.append(html('kbd', null, k), ' ', v); keys.append(li); });
    panel.append(keys);
  }

  // ---------- concept list (left) ----------
  function buildConceptList() {
    conceptList.textContent = '';
    D.CATEGORIES.forEach(cat => {
      const section = html('section', 'cat');
      section.style.setProperty('--chip', `var(--c${cat.color})`);
      const h = html('h3', null, cat.label);
      section.append(h);
      const ul = html('ul');
      D.CONCEPTS.filter(c => c.cat === cat.id).forEach(c => {
        const li = html('li');
        const b = html('button', 'concept-btn' + (c.absent ? ' absent' : ''));
        b.type = 'button';
        b.setAttribute('data-id', c.id);
        b.append(html('span', 'label', c.label), html('span', 'wk', 'wk ' + c.week));
        b.addEventListener('click', () => (state.selectedConcept === c ? clearSelection() : selectConcept(c.id)));
        li.append(b);
        ul.append(li);
      });
      section.append(ul);
      conceptList.append(section);
    });
  }

  function highlightConceptList() {
    conceptList.querySelectorAll('.concept-btn').forEach(b => {
      b.classList.toggle('active', !!state.selectedConcept && b.getAttribute('data-id') === state.selectedConcept.id);
    });
  }

  // ---------- controls ----------
  function updateMilestoneLabel() {
    const m = D.MILESTONES[state.milestone];
    $('#milestone-label').textContent = state.milestone === D.MILESTONES.length - 1 ? 'everything' : m.label;
  }

  $('#milestone').max = D.MILESTONES.length - 1;
  $('#milestone').value = state.milestone;
  $('#milestone').addEventListener('input', e => {
    state.milestone = +e.target.value;
    updateMilestoneLabel();
    if (state.selectedNode && !isNodeVisible(nodeById.get(state.selectedNode))) { state.selectedNode = null; renderIntroPanel(); }
    applyState();
    updateHash();
  });
  updateMilestoneLabel();

  $('#toggle-minor').addEventListener('change', e => { state.showMinor = e.target.checked; applyState(); });
  $('#toggle-tests').addEventListener('change', e => { state.showTests = e.target.checked; applyState(); });
  $('#zoom-in').addEventListener('click', () => { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.25); });
  $('#zoom-out').addEventListener('click', () => { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 0.8); });
  $('#zoom-fit').addEventListener('click', () => fitAll(true));
  $('#panel-close').addEventListener('click', clearSelection);
  $('#toggle-sidebar').addEventListener('click', () => document.body.classList.toggle('sidebar-open'));

  // theme: shares the course site's localStorage key
  const root = document.documentElement;
  function applyTheme(mode) {
    if (mode) root.setAttribute('data-theme', mode); else root.removeAttribute('data-theme');
  }
  const themeParam = new URLSearchParams(location.search).get('theme');
  applyTheme(themeParam === 'dark' || themeParam === 'light' ? themeParam
    : localStorage.getItem('theme') === 'dark' ? 'dark' : localStorage.getItem('theme') === 'light' ? 'light' : null);
  $('#theme-toggle').addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // search
  const search = $('#search');
  const results = $('#search-results');
  function runSearch() {
    const q = search.value.trim().toLowerCase();
    results.textContent = '';
    if (!q) { results.hidden = true; return; }
    const hits = [];
    D.NODES.forEach(n => { if (n.id.toLowerCase().includes(q)) hits.push({ type: 'class', id: n.id, label: n.id, color: groupById.get(n.group).color }); });
    D.CONCEPTS.forEach(c => { if (c.label.toLowerCase().includes(q)) hits.push({ type: 'concept', id: c.id, label: c.label, color: catById.get(c.cat).color }); });
    D.NODES.forEach(n => {
      if (n.id.toLowerCase().includes(q)) return;
      if (n.members.some(m => m.toLowerCase().includes(q))) hits.push({ type: 'member of', id: n.id, label: n.id, color: groupById.get(n.group).color, sub: n.members.find(m => m.toLowerCase().includes(q)) });
    });
    hits.slice(0, 12).forEach(h => {
      const li = html('li');
      const b = html('button', 'result');
      b.type = 'button';
      b.style.setProperty('--chip', `var(--c${h.color})`);
      b.append(html('span', 'type', h.type), ' ', html('span', 'label', h.label));
      if (h.sub) b.append(html('span', 'sub', h.sub));
      b.addEventListener('click', () => { h.type === 'concept' ? selectConcept(h.id) : selectNode(h.id); search.value = ''; results.hidden = true; });
      li.append(b);
      results.append(li);
    });
    results.hidden = hits.length === 0;
  }
  search.addEventListener('input', runSearch);
  search.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const b = results.querySelector('button'); if (b) b.click(); }
    if (e.key === 'Escape') { search.value = ''; results.hidden = true; search.blur(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search-box')) results.hidden = true; });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === '/') { e.preventDefault(); search.focus(); }
    else if (e.key === '+' || e.key === '=') $('#zoom-in').click();
    else if (e.key === '-') $('#zoom-out').click();
    else if (e.key === '0') fitAll(true);
    else if (e.key === 'Escape') clearSelection();
  });

  window.addEventListener('hashchange', () => { if (!readHash()) clearSelection(); });
  window.addEventListener('resize', () => { /* keep transform; the user can press 0 */ });

  // ---------- boot ----------
  D.EDGES.forEach(drawEdge);
  D.NODES.forEach(drawNode);
  buildConceptList();
  applyState();
  renderIntroPanel();
  fitCore(false);
  readHash();
})();
