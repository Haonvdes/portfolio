/* Adoption curve + goal card (web-3.html §04). Reads window.W3C_CHASM from
   js/web3-chasm-data.js, which must load first. */

(function () {
  var D = window.W3C_CHASM;
  var chart = document.getElementById('w3cChart');
  if (!D || !chart) return;

  var els = {
    markets: chart.querySelectorAll('.rd-w3c-market'),
    goalTitle: document.getElementById('w3cGoalTitle'),
    goal: document.getElementById('w3cGoal'),
    facts: document.getElementById('w3cFacts')
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function select(i) {
    var p = D.phases[i];
    Array.prototype.forEach.call(els.markets, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-side') === p.side ? 'true' : 'false');
    });
    els.goalTitle.textContent = p.name;
    els.goal.textContent = p.goal;

    els.facts.textContent = '';
    p.facts.forEach(function (f) {
      var row = el('div');
      row.appendChild(el('dt', null, f.k));
      row.appendChild(el('dd', null, f.v));
      els.facts.appendChild(row);
    });

    chart.setAttribute('data-active', p.side);
  }

  // The market labels are the buttons; the curve halves and brackets are a
  // larger mouse target for the same switch.
  chart.addEventListener('click', function (e) {
    var hit = e.target.closest('[data-side]');
    if (!hit) return;
    var side = hit.getAttribute('data-side');
    for (var i = 0; i < D.phases.length; i++) {
      if (D.phases[i].side === side) { select(i); return; }
    }
  });

  select(0);
})();
