// Scroll-spy for the case study section rail (.rd-case-toc).
//
// IntersectionObserver rather than a scroll listener — no rAF throttling to
// get wrong, and it stays correct when the reader jumps via the rail itself.
// rootMargin pins the trigger line near the top of the viewport so the
// highlighted item matches the heading the reader is actually looking at.
(function () {
  var rail = document.querySelector('.rd-case-toc');
  if (!rail || !('IntersectionObserver' in window)) return;

  var links = Array.prototype.slice.call(rail.querySelectorAll('a'));
  var byId = {};
  var sections = [];

  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (!el) return;              // a rail entry with no section is a typo, not a crash
    byId[id] = a;
    sections.push(el);
  });

  function setCurrent(id) {
    links.forEach(function (a) { a.classList.remove('is-current'); });
    if (byId[id]) byId[id].classList.add('is-current');
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setCurrent(entry.target.id);
    });
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
})();
