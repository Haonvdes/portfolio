/* Release-phase track + MoSCoW quadrants (healthcare.html §04). Reads
   window.B3_DECISION from js/phase-decision-data.js, which must load first. */

(function () {
  var D = window.B3_DECISION;
  var track = document.getElementById('phTrack');
  if (!D || !track) return;

  var els = {
    panel: document.getElementById('phPanel'),
    goalTitle: document.getElementById('phGoalTitle'),
    goal: document.getElementById('phGoal'),
    facts: document.getElementById('phFacts'),
    moscow: document.getElementById('phMoscow'),
    key: document.getElementById('phKey')
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var steps = D.phases.map(function (p, i) {
    var b = el('button', 'rd-phase-step');
    b.type = 'button';
    b.id = 'phTab' + i;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'phPanel');
    var label = el('span', 'rd-phase-step-label');
    label.appendChild(el('span', null, p.step));
    label.appendChild(el('span', null, p.name));
    var seg = el('span', 'rd-phase-step-seg');
    seg.setAttribute('aria-hidden', 'true');
    b.appendChild(label);
    b.appendChild(seg);
    b.addEventListener('click', function () { select(i); });
    track.appendChild(b);
    return b;
  });

  D.tiers.forEach(function (t) {
    var li = el('li');
    var sw = el('span', 'rd-moscow-sw is-' + t.id);
    sw.setAttribute('aria-hidden', 'true');
    li.appendChild(sw);
    li.appendChild(el('span', null, t.label));
    els.key.appendChild(li);
  });

  function quadrant(t, rows) {
    var q = el('div', 'rd-moscow-q is-' + t.id);
    q.appendChild(el('h4', 'rd-sr-only', t.label));
    q.appendChild(el('p', null, t.desc));
    if (rows.length) {
      var ul = el('ul');
      rows.forEach(function (r) { ul.appendChild(el('li', null, r)); });
      q.appendChild(ul);
    }
    return q;
  }

  // Quadrants and tiles share one grid, so DOM order is the layout:
  // must, should (top) · the four tiles · could, won't (bottom).
  function renderMoscow(p) {
    var T = D.tiers, m = els.moscow;
    m.textContent = '';
    m.appendChild(quadrant(T[0], p.moscow.must));
    m.appendChild(quadrant(T[1], p.moscow.should));
    var tiles = el('div', 'rd-moscow-tiles');
    tiles.setAttribute('aria-hidden', 'true');
    T.forEach(function (t) { tiles.appendChild(el('span', 'rd-moscow-tile is-' + t.id, t.label)); });
    m.appendChild(tiles);
    m.appendChild(quadrant(T[2], p.moscow.could));
    m.appendChild(quadrant(T[3], p.moscow.wont));
  }

  function select(i) {
    var p = D.phases[i];
    steps.forEach(function (b, j) {
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
      b.tabIndex = j === i ? 0 : -1;
    });
    els.panel.setAttribute('aria-labelledby', steps[i].id);
    els.goalTitle.textContent = p.name + ' goal';
    els.goal.textContent = p.goal;
    els.facts.textContent = '';
    p.facts.forEach(function (f) {
      var row = el('div');
      row.appendChild(el('dt', null, f[0]));
      row.appendChild(el('dd', null, f[1]));
      els.facts.appendChild(row);
    });
    renderMoscow(p);
  }

  track.addEventListener('keydown', function (e) {
    var cur = steps.indexOf(document.activeElement);
    if (cur < 0) return;
    var next = { ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: steps.length - 1 }[e.key];
    if (next == null || next < 0 || next >= steps.length) return;
    e.preventDefault();
    select(next);
    steps[next].focus();
  });

  select(0);
})();
