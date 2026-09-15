/* Release-phase track + MoSCoW 2x2 list (healthcare.html §04). Reads
   window.B3_DECISION from js/phase-decision-data.js, which must load first. */

(function () {
  var D = window.B3_DECISION;
  var M = window.ROLE_MATRIX;
  var track = document.getElementById('phTrack');
  if (!D || !track) return;

  var els = {
    panel: document.getElementById('phPanel'),
    goalTitle: document.getElementById('phGoalTitle'),
    goal: document.getElementById('phGoal'),
    facts: document.getElementById('phFacts'),
    moscow: document.getElementById('phMoscow')
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

  /* Opens the Role & permission view on one role: back to the "By role" tab
     if the reader left it on "By group", then role-matrix.js renders it. */
  function showRole(id) {
    var view = document.getElementById('role-permission');
    var matrix = document.querySelector('[data-role-matrix]');
    if (!view || !matrix) return;
    var tab = document.getElementById('tab-roles-interactive');
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    matrix.dispatchEvent(new CustomEvent('rb:show', { detail: id }));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    view.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function stackRow(label, aside, body) {
    var row = el('div', 'is-stack');
    var dt = el('dt', null, label);
    if (aside) dt.appendChild(el('span', 'rd-phase-facts-aside', aside));
    var dd = el('dd');
    dd.appendChild(body);
    row.appendChild(dt);
    row.appendChild(dd);
    return row;
  }

  function userLink(r) {
    var a = el('a', 'rd-phase-user', r.name);
    a.href = '#role-permission';
    a.title = 'See what ' + r.name + ' can do';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMore(false);
      showRole(r.id);
    });
    return a;
  }

  /* The "(+N)" popover. Only one exists at a time: select() rebuilds the
     card, so a phase switch drops it along with its toggle. */
  var more = null;
  function closeMore(returnFocus) {
    if (!more || more.pop.hidden) return;
    more.pop.hidden = true;
    more.toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) more.toggle.focus();
  }
  document.addEventListener('click', function (e) {
    if (more && !more.wrap.contains(e.target)) closeMore(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && more && !more.pop.hidden) closeMore(true);
  });

  /* Impacted users come from the role matrix, not from this file: every role
     that holds at least one of the phase's lanes. Three are named; the rest
     sit behind the (+N) toggle. */
  function renderImpact(p) {
    more = null;
    if (!M || !p.flows) return;
    var lanes = M.lanes.filter(function (l) { return p.flows.indexOf(l.id) !== -1; });
    var users = M.roles.filter(function (r) {
      return lanes.some(function (l) { return M.has(r, l.id); });
    });
    var leads = (p.leads || []).map(function (id) {
      return users.filter(function (r) { return r.id === id; })[0];
    }).filter(Boolean).slice(0, 3);
    for (var i = 0; leads.length < 3 && i < users.length; i++) {
      if (leads.indexOf(users[i]) === -1) leads.push(users[i]);
    }
    var rest = users.filter(function (r) { return leads.indexOf(r) === -1; });

    var wrap = el('span', 'rd-phase-users');
    leads.forEach(function (r, i) {
      if (i) wrap.appendChild(document.createTextNode(', '));
      wrap.appendChild(userLink(r));
    });
    if (rest.length) {
      var toggle = el('button', 'rd-phase-more', '(+' + rest.length + ')');
      toggle.type = 'button';
      toggle.id = 'phMoreToggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'phMore');
      toggle.setAttribute('aria-label', rest.length + ' more impacted users');
      var pop = el('div', 'rd-phase-more-pop');
      pop.id = 'phMore';
      pop.hidden = true;
      rest.forEach(function (r) { pop.appendChild(userLink(r)); });
      toggle.addEventListener('click', function () {
        var opening = pop.hidden;
        pop.hidden = !opening;
        toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(toggle);
      wrap.appendChild(pop);
      more = { wrap: wrap, toggle: toggle, pop: pop };
    }
    els.facts.appendChild(stackRow('Impacted users', users.length + ' of ' + M.roles.length, wrap));

    els.facts.appendChild(stackRow('Flows', null, document.createTextNode(
      lanes.map(function (l) { return l.label; }).join(' · ')
    )));

    if (p.agreement) {
      els.facts.appendChild(stackRow('Agreement', null, document.createTextNode(p.agreement)));
    }
  }

  function quadrant(t, rows) {
    var q = el('div', 'rd-moscow-q is-' + t.id);
    var h = el('h4');
    var sw = el('span', 'rd-moscow-sw is-' + t.id);
    sw.setAttribute('aria-hidden', 'true');
    h.appendChild(sw);
    h.appendChild(el('span', null, t.label));
    q.appendChild(h);
    if (rows.length) {
      var ul = el('ul');
      rows.forEach(function (r) { ul.appendChild(el('li', null, r)); });
      q.appendChild(ul);
    }
    return q;
  }

  function renderMoscow(p) {
    var m = els.moscow;
    m.textContent = '';
    D.tiers.forEach(function (t) { m.appendChild(quadrant(t, p.moscow[t.id])); });
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
    renderImpact(p);
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
