/*
  back-to-top.js — scroll-to-top control for the v3 case studies.

  Vanilla, no jQuery. The 2021 equivalent in script-2021.js is jQuery-based and
  bound to `#button`; web-3-v3 loads neither jQuery nor that file, which is why
  it had no back-to-top at all. This is self-contained so all three v3 pages can
  share one implementation.

  Threshold and animation match the old behaviour: show past 700px, smooth
  scroll to 0.
*/
(function () {
  'use strict';

  var SHOW_AFTER = 700;

  function init() {
    var btn = document.querySelector('.rd-to-top');
    if (!btn) return;

    // rAF-throttled: scroll fires far more often than we need to toggle a class.
    var ticking = false;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      btn.classList.toggle('is-visible', y > SHOW_AFTER);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Honour the OS "reduce motion" setting rather than always smooth-scrolling.
      var reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      // Send focus somewhere sensible; otherwise it stays on a button that is
      // about to fade out, and the next Tab resumes from the page bottom.
      var target = document.querySelector('h1') || document.body;
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
