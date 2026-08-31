// Problems carousel — healthcare-v3.html's unnumbered beat (Figma 40000453:672).
//
// Three pain points, one visible at a time, driven by three dots and a pair of
// chevrons. Progressive enhancement in the strict sense: the markup ships with
// slide 1 visible and slides 2 and 3 carrying `hidden`, so with this file
// blocked or erroring the section still reads as one pain point and a set of
// inert controls. It never injects content.
//
// Scoped to [data-quote-carousel] and written for N carousels, not one — this
// page already learned that lesson the hard way with js/ai-accelerate.js, whose
// unscoped `document.querySelector` calls meant a second copy of a section
// silently bound to the first (see js/ai-accelerate-v2.js).
(function () {
  var carousels = document.querySelectorAll('[data-quote-carousel]');
  if (!carousels.length) return;

  var AUTOPLAY_MS = 4000;

  Array.prototype.forEach.call(carousels, function (root) {
    var slides = root.querySelectorAll('[data-quote-slide]');
    var dots = root.querySelectorAll('[data-quote-dot]');
    var prev = root.querySelector('[data-quote-prev]');
    var next = root.querySelector('[data-quote-next]');
    if (slides.length < 2) return;

    // Read the crossfade duration off the CSS itself (redesign.css's
    // `.rd-quote` transition) rather than hardcoding it a second time here —
    // prefers-reduced-motion zeroes that duration, and this follows it down
    // to 0 automatically instead of still waiting out a fixed delay.
    var fadeMs = parseFloat(getComputedStyle(slides[0]).transitionDuration) * 1000 || 0;
    var hideTimer = null;

    var index = 0;
    var timer = null;

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function start() {
      stop();
      timer = setInterval(function () { show(index + 1); }, AUTOPLAY_MS);
    }

    // A manual nav action restarts the clock rather than letting it fire
    // right after someone has just chosen a slide themselves.
    function goTo(i) {
      show(i);
      start();
    }

    function show(i) {
      // Wrap in both directions: the chevrons are the only way to reach the
      // last slide from the first, and dead-ending on slide 1 makes the left
      // chevron look broken rather than deliberate.
      var nextIndex = (i + slides.length) % slides.length;
      var current = slides[index];
      var incoming = slides[nextIndex];
      var changed = nextIndex !== index;
      index = nextIndex;

      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

      if (changed) {
        // Fade the outgoing slide out FIRST, then bring the incoming one in
        // — not a simultaneous crossfade. Two quotes of different lengths
        // both partway-visible at once double-expose as overlapping italic
        // text, which is what actually read as jerky, not the fade speed.
        current.classList.remove('is-active');
        hideTimer = window.setTimeout(function () {
          current.hidden = true;
          incoming.hidden = false;
          void incoming.offsetWidth;
          incoming.classList.add('is-active');
          hideTimer = null;
        }, fadeMs);
      }

      Array.prototype.forEach.call(dots, function (dot, n) {
        var on = n === index;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    Array.prototype.forEach.call(dots, function (dot, n) {
      dot.addEventListener('click', function () { goTo(n); });
    });
    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });

    // Left/right arrow keys move between dots while focus is inside the
    // tablist — the expected keyboard model for role="tablist", and without it
    // a keyboard user has to tab to each dot individually.
    var tablist = root.querySelector('[role="tablist"]');
    if (tablist) {
      tablist.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        goTo(index + (e.key === 'ArrowRight' ? 1 : -1));
        if (dots[index]) dots[index].focus();
      });
    }

    // Pause on hover/focus rather than autoplaying over a reader's shoulder —
    // WCAG 2.2.2 wants a way to stop auto-updating content, and pausing on the
    // interaction someone is already doing (reading, tabbing through controls)
    // covers that without adding a separate pause button.
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    show(0);
    start();
  });
}());
