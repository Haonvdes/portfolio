// Drives the .is-hero-glow tilt-in entrance (css/styles/redesign.css §4d).
// Adds `.js-hero-glow` to <body> synchronously so the CSS-hidden
// pre-animation state only ever applies with this script present, then
// reveals `.rd-case-cover img` once via IntersectionObserver, matching
// sketch.com's own measured behaviour (fires once on enter, never again).
(function () {
  var body = document.body;
  if (!body || !body.classList.contains('is-hero-glow')) return;
  body.classList.add('js-hero-glow');

  var els = document.querySelectorAll('.rd-case-cover img');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    [].forEach.call(els, function (el) { el.classList.add('is-shown'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-shown');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  [].forEach.call(els, function (el) { io.observe(el); });
}());
