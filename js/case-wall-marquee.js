// healthcare-v3.html §06 "What got built" — sticky screen-wall marquee.
// GSAP + ScrollTrigger for the scrub only; the "stay on screen" behavior is
// native CSS `position: sticky` (redesign.css §13f), not GSAP's `pin: true`
// — see the banner comment above .rd-case-wall-spacer in healthcare-v3.html
// for why (a real, Safari-only bug with GSAP's pin-spacer on this element).
// Bails cleanly with no GSAP / reduced-motion / mobile, progressively
// enhancing a page that already reads correctly without this file.
//
// Desktop/tablet (>=769px): holds the wall on screen for ~3 screens of
// scroll while two rows of screenshots scrub horizontally in opposite
// directions, then releases into normal flow.
//
// Mobile (<769px): does nothing — .rd-case-wall-row's default CSS (redesign
// .css §13f) already renders both rows as a plain wrapped grid, same "static
// render is the fallback, not a broken enhancement" rule the AI section uses.
(function () {
  var spacerEl = document.querySelector('.rd-case-wall-spacer');
  if (!spacerEl) return;
  var pinEl = spacerEl.querySelector('.rd-case-wall-pin');
  if (!pinEl) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var rowA = pinEl.querySelector('[data-wall-row="a"]');
  var rowB = pinEl.querySelector('[data-wall-row="b"]');
  if (!rowA || !rowB) return;

  // Same fix as ai-accelerate-v2.js: images below the fold are all
  // loading="lazy" and load well after ScrollTrigger's first measurement,
  // which can cache this trigger's start/end against a shorter page than
  // the one the reader actually scrolls. Refreshing on every image's own
  // load keeps it correct regardless of load order.
  Array.prototype.forEach.call(document.images, function (img) {
    if (!img.complete) img.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
  });

  ScrollTrigger.matchMedia({
    '(min-width: 769px)': function () {
      // Adds `height: 400vh` to the spacer (100vh visible + 300vh hold) and
      // `position: sticky` to the pin inside it — see redesign.css §13f.
      // This is what actually holds the wall on screen; ScrollTrigger below
      // only drives the marquee, it doesn't pin anything.
      spacerEl.classList.add('js-wall-ready');

      // The markup carries one clean set of 7 screenshots per row (see the
      // HTML comment) so the no-JS/mobile/reduced-motion fallback stays a
      // normal, non-repetitive grid. Only once this branch is confirmed to
      // run does each row get cloned to 3x its own width — the minimum a
      // looping strip needs so animating exactly -1/3 of its width lands
      // back on an identical frame, with no visible seam.
      [rowA, rowB].forEach(function (row) {
        if (row.dataset.wallCloned) return;
        var originals = Array.prototype.slice.call(row.children);
        for (var copy = 0; copy < 2; copy++) {
          originals.forEach(function (img) {
            row.appendChild(img.cloneNode(true));
          });
        }
        row.dataset.wallCloned = 'true';
      });

      // Row B starts pre-shifted by one loop period so it can animate
      // TOWARD 0 (visually rightward) while row A animates AWAY from 0
      // (visually leftward) — opposite directions, same seamless loop math.
      gsap.set(rowB, { xPercent: -33.333 });

      // trigger is the SPACER, not the pin: with the pin now `position:
      // sticky` inside a 400vh spacer, "top top" -> "bottom bottom" on the
      // spacer covers exactly the 300vh the pin is actually stuck for (spacer
      // height minus one viewport height) — sticky unsticks itself right as
      // the spacer's bottom edge reaches the viewport bottom.
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacerEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          // Same GSAP-documented fix as ai-accelerate-v2.js: this site sets
          // `scroll-behavior: smooth` globally, which double-eases against
          // `scrub` and overshoots. Toggled off only while this trigger is
          // active.
          onToggle: function (self) {
            document.documentElement.style.scrollBehavior = self.isActive ? 'auto' : '';
          }
        }
      });

      tl.to(rowA, { xPercent: -33.333, ease: 'none' }, 0)
        .to(rowB, { xPercent: 0, ease: 'none' }, 0);

      requestAnimationFrame(function () { ScrollTrigger.refresh(); });

      return function () {
        spacerEl.classList.remove('js-wall-ready');
      };
    }
  });
}());
