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

  // --------------------------------------------------------------------
  // Reveal the rail only after the reader has scrolled past Overview.
  //
  // Opt-in: pages on the `.is-hero-overlap` hero, or the `.is-hero-split`
  // sub-variant of `.is-hero-glow` (redesign.css §4d) — both fill the first
  // view with nothing but nav / title / lead / cover (overlap's 60dvh band
  // plus the cover breaking through it; split's full 100dvh) — want a rail
  // pinned at the top from page load kept out of that view. Every other
  // case study keeps its sticky rail, so this block does nothing there.
  //
  // Why a boundingClientRect check and not just `isIntersecting`: Overview
  // stops intersecting at BOTH ends of the page — scrolled past it (rail
  // should show) and not yet reached it, which is the state on first paint
  // (rail must stay hidden). The two are only distinguishable by which side
  // of the viewport the section is on, and `top < 0` is that test.
  // --------------------------------------------------------------------
  var body = document.body;
  if (!body.classList.contains('is-hero-overlap') && !body.classList.contains('is-hero-split')) return;

  var overview = document.getElementById('overview');
  if (!overview) return;          // no Overview, no trigger — leave the rail as CSS left it

  new IntersectionObserver(function (entries) {
    var e = entries[0];
    var scrolledPast = !e.isIntersecting && e.boundingClientRect.top < 0;
    rail.classList.toggle('is-visible', scrolledPast);
  }, { threshold: 0 }).observe(overview);
})();
