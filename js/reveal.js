// Per-word blur/drift-up reveal for `.reveal` headings (redesign.css §17).
// Same shape as hero-entrance.js: add a `js-*` class to <body> synchronously
// so the CSS-hidden pre-animation state only ever applies with this script
// present, then fire once per element via IntersectionObserver, never again.
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  document.body.classList.add('js-reveal');

  [].forEach.call(els, function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.textContent = w;
      span.style.setProperty('--i', i);
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('is-split');
  });

  function settle(el) {
    // Fires once one of the three staggered transitions ends on the last
    // (latest-delayed) span, i.e. once the whole heading has finished —
    // cheaper than tracking every span's transitionend, and the point is
    // just to drop `will-change` so the heading stops pinning a GPU layer.
    var spans = el.querySelectorAll('span');
    var last = spans[spans.length - 1];
    if (!last) return;
    last.addEventListener('transitionend', function () {
      el.classList.add('is-done');
    }, { once: true });
  }

  if (!('IntersectionObserver' in window)) {
    [].forEach.call(els, function (el) {
      el.classList.add('is-in');
      settle(el);
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        settle(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  [].forEach.call(els, function (el) { io.observe(el); });
}());
