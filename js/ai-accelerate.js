// Scroll-driven "AI Accelerate" section (GSAP + ScrollTrigger).
// See css/styles/redesign.css §13 for the default/reduced-motion/mobile
// states this progressively enhances — every one of them is already a fully
// readable static render, so this file only ever adds motion, never adds
// content, and simply not running (no GSAP, reduced motion, mobile) leaves
// a correct page behind.
//
// All widths, including mobile: one pinned, scroll-scrubbed timeline —
// STEP 1 hold -> STEP 2 Validate/Build fade -> STEP 3 Discovery/Launch
// converge -> STEP 4 heading + panel reveal. Convergence distance is
// measured from the live DOM (stage width vs. circle width) rather than
// hard-coded, and re-measured on every ScrollTrigger refresh
// (invalidateOnRefresh), so it stays correct across the 1024px/768px
// circle-size breakpoints and on browser resize. Mobile used to skip the
// pin entirely (a scroll-hijack on a small viewport read worse than a
// static section) — Hao asked 2026-08-31 for the mobile version to animate
// the same way desktop does, so it now runs unconditionally; see
// redesign.css §13 for the `#ai-accelerate .rd-ai-pin` override that keeps
// the mobile pin box full-height instead of the static fallback's `0`.
(function () {
  var section = document.querySelector('.rd-ai-accelerate');
  if (!section) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Every image ABOVE this section on the page — the hero cover, the §03
  // challenge icons, and critically the §05 map crops, all `loading="lazy"`
  // and none with width/height attributes reserving their box — loads (and
  // therefore reflows everything below it) well after ScrollTrigger's
  // initial measurement, and lazy images specifically don't finish loading
  // until the reader scrolls near them, i.e. potentially after this pin's
  // start/end were already cached. That desync is what let the pin fire at
  // the wrong scroll position and cover §06 Handed off instead of sitting
  // where it belongs, right after it — caught from a real scroll-through,
  // not reproducible on a fresh `networkidle` load where every image is
  // already settled before ScrollTrigger ever measures anything. Refreshing
  // on every image's `load` covers it regardless of where the image sits or
  // when the browser actually decides to fetch it.
  Array.prototype.forEach.call(document.images, function (img) {
    if (!img.complete) img.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
  });

  var pinEl = section.querySelector('.rd-ai-pin');
  var stage = section.querySelector('.rd-ai-stage');
  var discovery = section.querySelector('[data-role="discovery"]');
  var validate = section.querySelector('[data-role="validate"]');
  var build = section.querySelector('[data-role="build"]');
  var launch = section.querySelector('[data-role="launch"]');
  var loopLines = section.querySelectorAll('.rd-ai-loop-line');
  var revealHeading = section.querySelector('.rd-ai-reveal-heading');
  // The question and the toggle are part of the same Step 4 reveal as the
  // heading — one group, not separate appearances — so they animate
  // together rather than sitting fully visible from Step 1 (caught
  // 2026-08-27: they were rendering at the top of the section before the
  // heading even faded in).
  var revealHeadingGroup = section.querySelectorAll('.rd-ai-reveal-heading, .rd-ai-reveal-question, .rd-ai-toggle');
  var revealPanel = section.querySelector('.rd-ai-panel');
  var relabelShort = section.querySelectorAll('.rd-ai-circle-label.is-short');
  var relabelLong = section.querySelectorAll('.rd-ai-circle-label.is-long');

  if (!pinEl || !stage || !discovery || !validate || !build || !launch || !revealHeading || !revealPanel) return;

  var CONVERGE_GAP = 16; // px between Discovery/Launch once converged — matches the CSS reduced-motion fallback's gap
  // Mobile-only: at the 72px mobile circle size the long relabel text
  // ("Discover, Validate, and experiment") reads cramped against the edge
  // even at the smallest legible font-size, so Step 4 also scales Discovery
  // /Launch up — Hao asked for this 2026-08-31 over shrinking the text
  // further. Desktop circles are already roomy enough and get scale: 1 (a
  // no-op). convergeDelta() reserves room for this scale-up up front (using
  // the POST-scale width, not the current one) so Step 3's convergence
  // already leaves the exact gap Step 4's growth fills — it doesn't
  // re-converge or overlap when the circles grow.
  var MOBILE_CIRCLE_SCALE = 1.6;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function circleScale() {
    return isMobile() ? MOBILE_CIRCLE_SCALE : 1;
  }

  function convergeDelta() {
    var stageWidth = stage.getBoundingClientRect().width;
    var circleWidth = discovery.getBoundingClientRect().width;
    // `x` translates the circle's original (unscaled) box; the Step 4 scale
    // that follows grows it around its own center, not from this new edge —
    // so the final edge sits at center ± (circleWidth*scale)/2, not
    // center ± circleWidth*scale. Averaging the unscaled and scaled widths
    // here (vs. the plain `circleWidth` the desktop/scale-1 case reduces to)
    // reserves exactly the gap Step 4's growth fills, no more.
    var scale = circleScale();
    return Math.max(0, stageWidth / 2 - CONVERGE_GAP / 2 - circleWidth * (1 + scale) / 2);
  }

  ScrollTrigger.matchMedia({
    'all': function () {
      section.classList.add('js-ai-ready');

      gsap.set([validate, build], { opacity: 1, scale: 1, filter: 'blur(0px)' });
      gsap.set([discovery, launch], { x: 0, scale: 1 });
      gsap.set(loopLines, { opacity: 1 });
      gsap.set(relabelShort, { opacity: 1 });
      gsap.set(relabelLong, { opacity: 0 });
      gsap.set(revealHeadingGroup, { opacity: 0, y: 20 });
      gsap.set(revealPanel, { opacity: 0, y: 30 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: '+=' + Math.round(window.innerHeight * 2.75),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // No snap: this site sets `scroll-behavior: smooth` globally
          // (redesign.css). GSAP's own docs flag that CSS as a known
          // ScrollTrigger conflict — double easing (the browser's smooth
          // scroll on top of `scrub`) reads as laggy/rubbery rather than
          // responsive, exactly what the spec asks to avoid, and testing
          // this section turned up scroll-position overshoots severe
          // enough to skip whole steps. Toggling it off only while this
          // trigger is actually active (and restoring it on leave) is
          // GSAP's documented fix; TOC anchor-scrolling elsewhere on the
          // page keeps its smooth behavior untouched.
          onToggle: function (self) {
            document.documentElement.style.scrollBehavior = self.isActive ? 'auto' : '';
          }
        }
      });

      tl.to({}, { duration: 0.35 }) // STEP 1 — hold so the initial state registers before anything moves
        .to([validate, build], { opacity: 0, scale: 0, filter: 'blur(2px)', duration: 1, ease: 'power1.out' }) // STEP 2
        .to(loopLines, { opacity: 0, duration: 0.6 }, '<')
        .to(discovery, { x: function () { return convergeDelta(); }, duration: 1, ease: 'power2.inOut' }) // STEP 3
        .to(launch, { x: function () { return -convergeDelta(); }, duration: 1, ease: 'power2.inOut' }, '<')
        .to(revealHeadingGroup, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }) // STEP 4
        .to(revealPanel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
        .to(relabelShort, { opacity: 0, duration: 0.4, ease: 'power1.out' }, '<')
        .to(relabelLong, { opacity: 1, duration: 0.4, ease: 'power1.out' }, '<')
        .to([discovery, launch], { scale: function () { return circleScale(); }, duration: 0.4, ease: 'power1.out' }, '<');

      return function () {
        section.classList.remove('js-ai-ready');
      };
    }
  });
}());

// AI-enablement toggle — swaps the reveal panel's step lists between the
// "critical" and "normal" playbooks. Deliberately its own always-runs IIFE,
// not folded into the block above: that one is gated behind GSAP +
// ScrollTrigger + !prefers-reduced-motion and does nothing on mobile, but
// this control has to work in every one of those cases too.
(function () {
  var toggle = document.querySelector('.rd-ai-toggle');
  var panel = document.querySelector('[data-ai-panel]');
  if (!toggle || !panel) return;

  var buttons = toggle.querySelectorAll('.rd-tab');
  // Every swappable piece — the two step lists per column AND the two
  // per-column subtitles in the tinted head — carries data-ai-state, so one
  // selector and one select() loop drives all of them.
  var stateEls = panel.querySelectorAll('[data-ai-state]');
  var wraps = panel.querySelectorAll('.rd-ai-swap-wrap');

  function select(state) {
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.aiState === state ? 'true' : 'false');
    });
    stateEls.forEach(function (el) {
      el.hidden = el.dataset.aiState !== state;
    });
  }

  // Measures a hidden list's real height by briefly unhiding it (off-flow
  // and invisible so nothing flashes or shifts), then restores whatever
  // hidden state it already had. Needed because the two states have
  // different row counts (5 vs 3) and some rows wrap at narrow widths, so a
  // hard-coded pixel guess would drift from the real layout.
  function measure(list) {
    var wasHidden = list.hidden;
    list.hidden = false;
    list.style.position = 'absolute';
    // Absolute positioning alone shrinks the box to fit its content instead
    // of the column's actual width, which rewraps the row text and throws
    // off the height reading (caught by measuring 300px then rendering at
    // 308px on load) — pin left/right to the wrap's own width so it wraps
    // exactly as it would in normal flow.
    list.style.left = '0';
    list.style.right = '0';
    list.style.visibility = 'hidden';
    var height = list.getBoundingClientRect().height;
    list.style.position = '';
    list.style.left = '';
    list.style.right = '';
    list.style.visibility = '';
    list.hidden = wasHidden;
    return height;
  }

  // Locks each swap region (both step lists per column, and both subtitles
  // per column) to the taller of its two states, so toggling to the shorter
  // one leaves whitespace instead of shrinking the card and moving the
  // "every round" band (and the closing line below it) up the page.
  function lockHeight() {
    wraps.forEach(function (wrap) {
      var max = 0;
      wrap.querySelectorAll('[data-ai-state]').forEach(function (el) {
        max = Math.max(max, measure(el));
      });
      wrap.style.minHeight = max + 'px';
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { select(btn.dataset.aiState); });
  });

  select('critical'); // default state on load
  lockHeight();

  // Re-lock once the real webfont is in: this script tag runs before DM
  // Sans necessarily finishes downloading, so the first lockHeight() can
  // measure fallback-font metrics — a touch shorter than the real font,
  // which left the floor a few px under the active state's actual height
  // (caught by measuring 280px pre-swap against a 295px post-swap render).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lockHeight);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(lockHeight, 150);
  });
}());
