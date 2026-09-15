/* Role & permission band (healthcare.html §02). Reads window.ROLE_MATRIX from
   js/role-matrix-data.js, which must load first.

   Every lookup is scoped to the [data-role-matrix] root and goes by class, not
   id: bare #id rules in redesign.css reach any page that reuses an id, and
   generic names like #name or #type are exactly the ones that collide.

   The readout is built from <div>s, not <p>s. `.rd-case p` resets margin,
   colour and text-transform at (0,1,1), which beats every single-class .rb-*
   rule, so a <p> here renders without the component's spacing or muted text. */
(function () {
  var root = document.querySelector('[data-role-matrix]');
  var M = window.ROLE_MATRIX;
  if (!root || !M) return;

  function $(cls) { return root.querySelector('.' + cls); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var select = $('rb-select'), toggle = $('rb-select-toggle'), panel = $('rb-select-panel');
  var band = $('rb-band'), quote = $('rb-quote');
  var current = null;

  panel.innerHTML = M.roles.map(function (r) {
    return '<li class="rb-option" role="option" tabindex="-1" data-role="' + r.id + '" aria-selected="false">' +
           esc(r.name) + '</li>';
  }).join('');
  var options = Array.prototype.slice.call(panel.querySelectorAll('.rb-option'));

  function roleById(id) {
    for (var i = 0; i < M.roles.length; i++) { if (M.roles[i].id === id) return M.roles[i]; }
    return null;
  }

  function laneById(id) {
    for (var i = 0; i < M.lanes.length; i++) { if (M.lanes[i].id === id) return M.lanes[i]; }
    return null;
  }

  function defaultQuote(r) {
    var first = null;
    M.lanes.forEach(function (l) { if (!first && M.has(r, l.id)) first = l; });
    return first ? '<b>' + esc(first.label) + '</b> — ' + esc(r.cells[first.id]) : '';
  }

  function render(id) {
    var r = roleById(id);
    if (!r) return;
    current = r;

    options.forEach(function (o) {
      o.setAttribute('aria-selected', o.getAttribute('data-role') === id ? 'true' : 'false');
    });

    $('rb-name').textContent = r.name;
    toggle.setAttribute('aria-label', 'Role: ' + r.name);

    var segs = '', axis = '', vert = '';
    M.lanes.forEach(function (l) {
      var on = M.has(r, l.id), hot = M.hot(r, l.id);
      var state = (on ? ' is-on' : '') + (hot ? ' is-hot' : '');
      segs += '<div class="rb-seg' + state + '"' +
              (on ? ' tabindex="0" data-lane="' + l.id + '"' : '') +
              ' title="' + esc(l.label) + (on ? (hot ? ' — most used' : '') : ' — no permission') + '"></div>';
      axis += '<span class="' + state.trim() + '">' + esc(l.label) + '</span>';
      vert += '<div class="rb-vrow' + state + '">' +
              '<div class="rb-vmark"></div>' +
              '<div><div class="rb-vlabel">' + esc(l.label) + '</div>' +
              '<div class="rb-vquote">' + (on ? esc(r.cells[l.id]) : 'No permission.') + '</div>' +
              '</div></div>';
    });
    band.innerHTML = segs;
    $('rb-axis').innerHTML = axis;
    $('rb-vert').innerHTML = vert;
    quote.innerHTML = defaultQuote(r);

    $('rb-overview').textContent = r.overview || '';

    var n = r.journeys.length;
    var dup = M.dupPartners(r.id);
    var facts = [
      r.group + ' group',
      n ? n + ' user ' + (n === 1 ? 'journey' : 'journeys') : 'No user journey',
      !dup.length ? 'Its own permission set'
        : dup.length === 1 ? 'Same permissions as ' + M.nameOf(dup[0])
        : 'Same permissions as ' + dup.length + ' other roles'
    ];
    $('rb-facts').innerHTML = facts.map(function (f, i) {
      var title = i === 2 && dup.length > 1 ? ' title="' + esc(dup.map(M.nameOf).join(', ')) + '"' : '';
      return '<span' + title + '>' + esc(f) + '</span>';
    }).join('');

    $('rb-journeys-body').innerHTML = n
      ? r.journeys.map(function (key) {
          var j = M.journeys[key];
          return '<div class="rb-journey">' +
                 '<div class="rb-journey-name">' + esc(j.name) + '</div>' +
                 '<ol class="rb-steps">' + j.steps.map(function (s) {
                   return '<li><span>' + esc(s) + '</span></li>';
                 }).join('') + '</ol></div>';
        }).join('')
      : '<div class="rb-journey-none">No user journey is drawn for this role.</div>';
  }

  /* --- role dropdown: a button plus a role="listbox" panel, same contract as
     .rd-tabs-dropdown in js/case-tabs.js (which this page does not load). --- */
  function isOpen() { return select.classList.contains('is-open'); }
  function selectedOption() {
    return options.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || options[0];
  }
  function open() {
    select.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    var o = selectedOption();
    o.focus();
    panel.scrollTop = o.offsetTop - panel.clientHeight / 2 + o.offsetHeight / 2;
    document.addEventListener('click', onOutside, true);
  }
  function close(returnFocus) {
    select.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutside, true);
    if (returnFocus) toggle.focus();
  }
  function onOutside(e) { if (!select.contains(e.target)) close(false); }
  function choose(o) { render(o.getAttribute('data-role')); close(true); }

  toggle.addEventListener('click', function () { if (isOpen()) close(false); else open(); });
  toggle.addEventListener('keydown', function (e) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isOpen()) { e.preventDefault(); open(); }
  });
  panel.addEventListener('click', function (e) {
    var o = e.target.closest('.rb-option');
    if (o) choose(o);
  });
  panel.addEventListener('keydown', function (e) {
    var i = options.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'Tab') { close(false); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i !== -1) choose(options[i]); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (i === -1) i = 0;
      options[(i + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length].focus();
    }
  });

  /* --- journeys accordion --- */
  var jToggle = $('rb-journeys-toggle'), jBody = $('rb-journeys-body');
  jToggle.addEventListener('click', function () {
    var expanded = jToggle.getAttribute('aria-expanded') !== 'true';
    jToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    jBody.hidden = !expanded;
  });

  /* focusin as well as mouseover: the solid segments are focusable, so a
     keyboard user and a tap (which focuses) both reach the quote. */
  function laneQuote(e) {
    var seg = e.target.closest('.rb-seg.is-on');
    if (!seg || !current) return;
    var lane = laneById(seg.getAttribute('data-lane'));
    quote.innerHTML = '<b>' + esc(lane.label) + '</b> — ' + esc(current.cells[lane.id]);
  }
  band.addEventListener('mouseover', laneQuote);
  band.addEventListener('focusin', laneQuote);
  band.addEventListener('mouseleave', function () {
    if (current) quote.innerHTML = defaultQuote(current);
  });

  /* Lets another component open a role here (js/phase-decision.js does, from
     the release card's impacted users). */
  root.addEventListener('rb:show', function (e) { render(e.detail); });

  /* Opens on the widest-reaching role: if even that one has empty areas, the
     band makes the point before anyone clicks. */
  render('homeoffice');
})();
