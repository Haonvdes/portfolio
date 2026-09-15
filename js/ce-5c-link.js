// Links the coordination diagram's steps to the 5 Cs rows on
// customer-engagement.html (#charter-panel-collab). One shared selection:
// picking a step or a row selects that C on both sides and dims the rest.
// Picking the selected one again, clicking anywhere else, or Escape clears it. Click-only on purpose —
// hover reaches neither touch nor keyboard.
(function () {
  var root = document.querySelector('[data-ce5c]');
  if (!root) { return; }

  var steps = Array.prototype.slice.call(root.querySelectorAll('.rd-ceflow-step[data-c]'));
  var rows = Array.prototype.slice.call(root.querySelectorAll('.rd-ce5c-row[data-c]'));
  var scroller = root.querySelector('.rd-figure-scroll');
  var live = root.querySelector('[data-ce5c-live]');
  var names = { 1: 'Cognizance', 2: 'Communication', 3: 'Coordination', 4: 'Cooperation', 5: 'Collaboration' };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = null;

  function select(c, fromRow) {
    current = c;
    root.classList.toggle('has-selection', c !== null);
    steps.concat(rows).forEach(function (el) {
      var on = el.getAttribute('data-c') === c;
      el.classList.toggle('is-selected', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (live) { live.textContent = c ? names[c] + ': step ' + c : 'All steps shown'; }
    if (c && fromRow) { scrollToStep(c); }
  }

  // Below ~1280px the diagram scrolls inside its frame, so the selected step
  // can be out of view. Centre it horizontally; the page itself isn't moved.
  function scrollToStep(c) {
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) { return; }
    var step = steps.filter(function (s) { return s.getAttribute('data-c') === c; })[0];
    if (!step) { return; }
    var box = step.getBoundingClientRect();
    var frame = scroller.getBoundingClientRect();
    var left = scroller.scrollLeft + (box.left - frame.left) - (scroller.clientWidth - box.width) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  function toggle(c, fromRow) { select(current === c ? null : c, fromRow); }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { toggle(row.getAttribute('data-c'), true); });
  });

  // SVG <g role="button"> has no native activation, so Enter and Space are
  // wired by hand. Space's default would scroll the page.
  steps.forEach(function (step) {
    step.addEventListener('click', function () { toggle(step.getAttribute('data-c'), false); });
    step.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle(step.getAttribute('data-c'), false);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (current !== null && (e.key === 'Escape' || e.key === 'Esc')) { select(null, false); }
  });

  // A click anywhere that isn't a step or a row clears the selection. The
  // step and row handlers above have already run by the time this bubbles up.
  document.addEventListener('click', function (e) {
    if (current === null) { return; }
    if (e.target.closest && e.target.closest('.rd-ceflow-step, .rd-ce5c-row')) { return; }
    select(null, false);
  });
})();
