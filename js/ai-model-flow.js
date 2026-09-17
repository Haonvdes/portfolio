/* Step-through sequence diagram — "The model" block on healthcare.html §05.
   Reads window.AI_MODEL_FLOW (js/ai-model-flow-data.js), which must load first.

   Scoped to #ai-model-flow by id, not to the first match of a class: the page
   already carries a second diagram and a picker of its own.

   Everything is drawn from steps[n]. Nothing accumulates, so clicking step 6
   renders exactly what stepping to 6 renders.

   The lane cards and badges are HTML (text has to wrap and stay selectable);
   only the lifelines and arrows are SVG, drawn at the measured centre of each
   card. That means the SVG viewBox is rebuilt on resize — and that measuring
   inside a closed <details> returns zero, so the first draw waits for it to
   open. */

(function () {
  var D = window.AI_MODEL_FLOW;
  var root = document.getElementById('ai-model-flow');
  if (!D || !root) return;

  var NS = 'http://www.w3.org/2000/svg';
  var ROW_H = 64, PAD_TOP = 26, PAD_BOTTOM = 20;
  var HEAD_L = 11, HEAD_W = 5.5;

  var plot = root.querySelector('.rd-aiflow-plot');
  var svg = root.querySelector('.rd-aiflow-svg');
  var stepList = root.querySelector('.rd-aiflow-steps');
  var compact = root.querySelector('.rd-aiflow-compact');
  var panel = root.querySelector('.rd-aiflow-panel');
  var legend = root.querySelector('.rd-aiflow-legend');
  var index = 0;
  var laneEls = {}, badgeEls = {}, stepEls = [];
  var built = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---- static scaffolding: zones, lane cards, badge cells, legend -------- */

  function laneColumns() {
    var cols = {}, parts = [], col = 1;
    var lane = 0;
    D.zones.forEach(function (z, zi) {
      z.col = col;
      parts.push('repeat(' + z.span + ', minmax(0, 1fr))');
      for (var i = 0; i < z.span; i++) cols[D.lanes[lane++].id] = col + i;
      col += z.span;
      if (zi < D.zones.length - 1) {
        z.divider = col;
        parts.push('var(--aimf-zone-gap)');
        col += 1;
      }
    });
    plot.style.gridTemplateColumns = parts.join(' ');
    return cols;
  }

  function scaffold() {
    var cols = laneColumns();

    D.zones.forEach(function (z) {
      var label = el('p', 'rd-aiflow-zone', z.label);
      label.style.gridColumn = z.col + ' / span ' + z.span;
      plot.appendChild(label);
      if (z.divider) {
        var d = el('span', 'rd-aiflow-divider');
        d.setAttribute('aria-hidden', 'true');
        d.style.gridColumn = String(z.divider);
        plot.appendChild(d);
      }
    });

    D.lanes.forEach(function (lane) {
      var card = el('div', 'rd-aiflow-lane');
      card.style.gridColumn = String(cols[lane.id]);
      card.appendChild(el('span', 'rd-aiflow-lane-name', lane.name));
      card.appendChild(el('span', 'rd-aiflow-lane-sub', lane.sub));
      plot.appendChild(card);
      laneEls[lane.id] = card;

      var cell = el('div', 'rd-aiflow-badges');
      cell.style.gridColumn = String(cols[lane.id]);
      plot.appendChild(cell);
      badgeEls[lane.id] = cell;
    });

    svg.style.gridColumn = '1 / -1';

    D.legend.forEach(function (item) {
      var li = el('li', 'rd-aiflow-legend-item');
      var mark = el('span', 'rd-aiflow-legend-mark is-' + item.tone + (item.auto ? ' is-auto' : ''));
      mark.setAttribute('aria-hidden', 'true');
      li.appendChild(mark);
      li.appendChild(el('span', null, item.text));
      legend.appendChild(li);
    });

    D.steps.forEach(function (step, i) {
      var li = el('li');
      var b = el('button', 'rd-aiflow-step');
      b.type = 'button';
      b.appendChild(el('span', 'rd-aiflow-step-num', String(i + 1)));
      b.appendChild(el('span', 'rd-aiflow-step-label', step.label));
      b.addEventListener('click', function () { go(i); });
      li.appendChild(b);
      stepList.appendChild(li);
      stepEls.push(b);
    });
  }

  /* ---- state ------------------------------------------------------------ */

  function rowTone(rowId) {
    var step = D.steps[index];
    if (step.current.indexOf(rowId) > -1) return 'current';
    if (!step.current.length) return index === 0 ? 'pending' : 'done';
    var first = D.rows.findIndex(function (r) { return r.id === step.current[0]; });
    var here = D.rows.findIndex(function (r) { return r.id === rowId; });
    return here < first ? 'done' : 'pending';
  }

  /* ---- diagram ---------------------------------------------------------- */

  function centre(laneId) {
    var a = laneEls[laneId].getBoundingClientRect();
    var b = svg.getBoundingClientRect();
    return Math.round(a.left + a.width / 2 - b.left);
  }

  /* `span` is how much horizontal room the row's arrows actually have. A pill
     wider than that would hide the arrow it labels, so it lifts above the line
     instead of sitting on it. */
  function pill(x, y, text, tone, auto, span) {
    var g = svgEl('g', { class: 'rd-aiflow-pill is-' + tone + (auto ? ' is-auto' : '') });
    var box = svgEl('rect', { x: x, y: y - 12, height: 24, rx: 6, ry: 6, width: 0, class: 'rd-aiflow-pill-box' });
    /* dy, not dominant-baseline: Safari has never been reliable on the
       central/middle keywords for <text> inside a transformed parent. */
    var label = svgEl('text', { x: x, y: y, dy: '0.35em', class: 'rd-aiflow-pill-text' });
    label.setAttribute('text-anchor', 'middle');
    label.textContent = text;
    g.appendChild(box);
    g.appendChild(label);
    svg.appendChild(g);
    var w = Math.ceil(label.getComputedTextLength()) + 20;
    if (span != null && w + 28 > span) {
      var lift = 17;
      box.setAttribute('y', y - 12 - lift);
      label.setAttribute('y', y - lift);
    }
    box.setAttribute('width', w);
    box.setAttribute('x', x - w / 2);
    return g;
  }

  function arrow(x1, x2, y, tone, auto) {
    var dir = x2 > x1 ? 1 : -1;
    var tip = x2 - dir * 1;
    var cls = 'rd-aiflow-arrow is-' + tone + (auto ? ' is-auto' : '');
    svg.appendChild(svgEl('line', {
      x1: x1 + dir * 1, y1: y, x2: tip - dir * HEAD_L, y2: y, class: cls
    }));
    svg.appendChild(svgEl('path', {
      d: 'M ' + tip + ' ' + y +
         ' L ' + (tip - dir * HEAD_L) + ' ' + (y - HEAD_W) +
         ' L ' + (tip - dir * HEAD_L) + ' ' + (y + HEAD_W) + ' Z',
      class: 'rd-aiflow-head is-' + tone
    }));
  }

  /* Dots first: the pill is opaque and has to cover the lifeline it sits on. */
  function note(row, y, tone) {
    var xs = row.lanes.map(centre);
    row.lanes.forEach(function (id) {
      svg.appendChild(svgEl('circle', { cx: centre(id), cy: y, r: 3.5, class: 'rd-aiflow-dot is-' + tone }));
    });
    var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
    var g = pill((lo + hi) / 2, y, row.label, tone);
    g.setAttribute('class', g.getAttribute('class') + ' is-note');
    /* Wide enough to contain every lifeline it applies to — the box IS the
       statement that this happens on those branches and nowhere else. */
    var box = g.firstChild;
    var w = Math.max(+box.getAttribute('width'), hi - lo + 48);
    box.setAttribute('width', w);
    box.setAttribute('x', (lo + hi) / 2 - w / 2);
  }

  function draw() {
    var w = Math.round(svg.getBoundingClientRect().width);
    if (!w) return;
    var h = PAD_TOP + D.rows.length * ROW_H + PAD_BOTTOM;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('height', h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var rowY = function (i) { return PAD_TOP + i * ROW_H + ROW_H / 2; };
    var closeIdx = D.rows.findIndex(function (r) { return r.id === D.closes.afterRow; });
    var closeY = rowY(closeIdx) + 24;

    D.lanes.forEach(function (lane) {
      var x = centre(lane.id);
      var ends = lane.id === D.closes.lane ? closeY : h;
      svg.appendChild(svgEl('line', { x1: x, y1: 0, x2: x, y2: ends, class: 'rd-aiflow-life' }));
      if (lane.id === D.closes.lane) {
        var tone = rowTone(D.closes.afterRow);
        svg.appendChild(svgEl('line', { x1: x, y1: closeY, x2: x, y2: h, class: 'rd-aiflow-life is-ghost' }));
        svg.appendChild(svgEl('path', {
          d: 'M ' + (x - 5) + ' ' + (closeY - 5) + ' L ' + (x + 5) + ' ' + (closeY + 5) +
             ' M ' + (x + 5) + ' ' + (closeY - 5) + ' L ' + (x - 5) + ' ' + (closeY + 5),
          class: 'rd-aiflow-close is-' + tone
        }));
      }
    });

    D.rows.forEach(function (row, i) {
      var y = rowY(i);
      var tone = rowTone(row.id);
      if (row.kind === 'note') { note(row, y, tone); return; }
      var xs = [];
      row.arrows.forEach(function (pair) {
        var x1 = centre(pair[0]), x2 = centre(pair[1]);
        arrow(x1, x2, y, tone, row.auto);
        xs.push(x1, x2);
      });
      var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
      pill((lo + hi) / 2, y, row.label, tone, row.auto, hi - lo);
    });
  }

  /* ---- badges, stepper, panel ------------------------------------------- */

  function renderBadges() {
    var badges = D.steps[index].badges;
    D.lanes.forEach(function (lane) {
      var cell = badgeEls[lane.id];
      cell.textContent = '';
      (badges[lane.id] || []).forEach(function (b) {
        cell.appendChild(el('span', 'rd-aiflow-badge is-' + b.tone, b.text));
      });
    });
  }

  function renderStepper() {
    stepEls.forEach(function (b, i) {
      var state = i === index ? 'current' : (i < index ? 'done' : 'pending');
      b.className = 'rd-aiflow-step is-' + state;
      if (i === index) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    compact.textContent = (index + 1) + ' / ' + D.steps.length + ' · ' + D.steps[index].label;
    barPrev.disabled = index === 0;
    barNext.disabled = index === D.steps.length - 1;
  }

  function renderPanel() {
    var step = D.steps[index];
    var last = index === D.steps.length - 1;
    panel.textContent = '';
    panel.appendChild(el('p', 'rd-aiflow-eyebrow', 'Step ' + (index + 1) + ' of ' + D.steps.length));
    panel.appendChild(el('h4', 'rd-aiflow-title', step.title));

    var body = el('p', 'rd-aiflow-text');
    body.innerHTML = step.body;
    panel.appendChild(body);

    if (step.code) {
      var box = el('div', 'rd-aiflow-code');
      box.appendChild(el('p', 'rd-aiflow-code-caption', step.code.caption));
      var pre = el('pre', 'rd-aiflow-code-lines', step.code.lines.join('\n'));
      box.appendChild(pre);
      panel.appendChild(box);
    }

    if (step.callout) {
      var c = el('div', 'rd-aiflow-callout');
      c.appendChild(el('p', 'rd-aiflow-callout-title', step.callout.title));
      c.appendChild(el('p', 'rd-aiflow-callout-body', step.callout.body));
      panel.appendChild(c);
    }

    var actions = el('div', 'rd-aiflow-actions');
    var back = el('button', 'rd-btn rd-aiflow-nav', '← Back');
    back.type = 'button';
    back.disabled = index === 0;
    back.addEventListener('click', function () { go(index - 1); });
    var next = el('button', 'rd-btn rd-btn-primary rd-aiflow-nav', last ? 'Done' : 'Next →');
    next.type = 'button';
    next.disabled = last;
    next.addEventListener('click', function () { go(index + 1); });
    actions.appendChild(back);
    actions.appendChild(next);
    panel.appendChild(actions);
  }

  function render() {
    renderStepper();
    renderBadges();
    renderPanel();
    draw();
  }

  function go(i) {
    if (i < 0 || i >= D.steps.length || i === index) return;
    index = i;
    render();
  }

  /* ---- wiring ----------------------------------------------------------- */

  var barPrev = root.querySelector('[data-aimf-prev]');
  var barNext = root.querySelector('[data-aimf-next]');
  barPrev.addEventListener('click', function () { go(index - 1); });
  barNext.addEventListener('click', function () { go(index + 1); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
  });

  function build() {
    if (built) return;
    built = true;
    scaffold();
    render();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(plot);
    else window.addEventListener('resize', draw);
  }

  /* A closed <details> has no layout, so every lane centre would measure 0.
     Wait for the first open; on the preview page it is already open. */
  var host = root.closest('details');
  if (host && !host.open) {
    host.addEventListener('toggle', function () {
      if (host.open) { build(); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }
    });
  } else {
    build();
  }
})();
