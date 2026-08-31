// Section menu for case studies (.rd-case-toc) — a corner popover, not a bar.
//
// It also absorbs what used to be back-to-top.js's job: "Back to top" is the
// panel's first entry (`.rd-case-toc-top`), so the two floating controls
// this page used to have in the same corner are one now. See redesign.css's
// `.rd-case-toc` comment for why the component moved here at all — in short,
// every earlier shape of this rail ended up fighting the site nav
// (js/script.js) for an edge, top or bottom, and a corner control that opens
// on demand doesn't compete for an edge at all. (Hao, 2026-08-30.)
(function () {
  var root = document.querySelector('.rd-case-toc');
  if (!root) return;

  var toggle = root.querySelector('.rd-case-toc-toggle');
  var panel = root.querySelector('.rd-case-toc-panel');
  var topLink = root.querySelector('.rd-case-toc-top');
  if (!toggle || !panel) return;

  // -------------------------------------------------------------- open/close
  function isOpen() { return root.classList.contains('is-open'); }

  function open() {
    root.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onOutsideClick, true);
    document.addEventListener('keydown', onKeydown);
  }

  function close(returnFocus) {
    root.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('keydown', onKeydown);
    if (returnFocus) toggle.focus();
  }

  function onOutsideClick(e) {
    if (!root.contains(e.target)) close(false);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close(true);
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) close(false); else open();
  });

  // A link click always closes the panel, whether it's a real section jump
  // or "Back to top" (handled separately below) — the browser's own anchor
  // navigation still runs for section links.
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) close(false);
  });

  // ------------------------------------------------------------ back to top
  if (topLink) {
    topLink.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      // Send focus somewhere sensible; otherwise it stays on a link that is
      // about to scroll off-panel, and the next Tab resumes from wherever
      // the page happened to be.
      var target = document.querySelector('h1') || document.body;
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  if (!('IntersectionObserver' in window)) return;

  // -------------------------------------------------------------- scroll-spy
  // rootMargin pins the trigger line near the top of the viewport so the
  // highlighted item matches the heading the reader is actually looking at.
  var links = Array.prototype.slice.call(panel.querySelectorAll('a[href^="#"]'));
  var byId = {};
  var sections = [];

  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (!el) return;              // "Back to top" has no matching section, by design
    byId[id] = a;
    sections.push(el);
  });

  function setCurrent(id) {
    links.forEach(function (a) { a.classList.remove('is-current'); });
    if (byId[id]) byId[id].classList.add('is-current');
  }

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setCurrent(entry.target.id);
    });
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

  sections.forEach(function (s) { spy.observe(s); });

  // --------------------------------------------------- reveal past Overview
  // Applies on every hero variant now — the popover starts hidden by default
  // (redesign.css) regardless of `.is-hero-overlap` / `.is-hero-glow`, so the
  // trigger isn't gated to those classes the way the old rail's was.
  var overview = document.getElementById('overview');
  if (!overview) return;          // no Overview, no trigger — leave it CSS-hidden

  new IntersectionObserver(function (entries) {
    var e = entries[0];
    var scrolledPast = !e.isIntersecting && e.boundingClientRect.top < 0;
    root.classList.toggle('is-visible', scrolledPast);
    // Don't leave an open panel floating mid-fade if the reader scrolls back
    // up into Overview.
    if (!scrolledPast) close(false);
  }, { threshold: 0 }).observe(overview);
})();
