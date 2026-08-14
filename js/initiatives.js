/*
  Selected Product Initiatives.

  Two presentations of the same four panels, chosen by one media query:

    >= 769px  A sticky STACK. Every panel is laid out and shares one sticky
              top, so each parks until the next scrolls up over it, receding
              behind a damped scale/blur/dim pass. The heading, intro and a
              card index sit in a sticky rail beside the stack (>= 1181px) or
              above it. One page scroll advances exactly one card.
    <= 768px  A horizontal scroll-snap carousel. Every panel is laid out side
              by side in #initiative-deck and the reader swipes; the dots are
              the control and the position indicator, and run autoplay.

  WHY THE DESKTOP MODE CHANGED (2026-08-09)
  -----------------------------------------
  The deck used to be its own scroll container on desktop, with wheel events
  forwarded into it and released at the ends. That is a scroll-within-a-scroll:
  the page is already snap-bound to this section, so the deck had to swallow
  every gesture and hand it back. It is replaced by the same mechanism the
  About page journey uses, so the site has ONE stacking pattern:

    - the snap targets are zero-size .rd-deck-snap markers positioned at each
      panel's resting offset, NOT the panels. A stuck element is a broken snap
      target: its snap area travels with the viewport and the scroller chases
      itself. (Same note lives on .rd-work-snap.)
    - the markers must not be visibility:hidden — browsers skip hidden boxes
      when collecting snap targets, so there would be nothing to land on.
    - the section gives up its own snap point in CSS, or the first gesture is
      spent re-landing on the section top instead of moving to card 1.

  DEPTH PASS
  ----------
  Smoothness is DAMPING, not an easing curve: scroll sets a target, a rAF loop
  eases the rendered value toward it by EASE per frame, so a card trails the
  scroll slightly and glides to rest. Progress itself is linear — an ease-out
  made cards decelerate through the half-overlapped state, which is exactly
  where two cards' text competes.

  In a sticky stack the top strip of the outgoing card is unavoidably still on
  screen while the next rises. That cannot be removed geometrically, so the
  outgoing card is pushed out of the READING layer fast: fade and blur run on a
  compressed ramp (CLEAR) and are done by about a third of the travel, while
  scale keeps running slowly across the whole of it as the depth cue.

  LIFT is deliberately tiny. On the About page a large lift made the stack
  appear to drift upward as the last card pinned; here the heavy dim means a
  few px never reads as movement. Do not raise it without re-checking that.

  Autoplay
  --------
  Mobile only. The active dot fills over --rd-autoplay and then advances. The
  timer IS the CSS animation: we listen for its `animationend` rather than
  running a parallel setTimeout, so the bar and the advance can never drift
  apart, and pausing is a one-line `animation-play-state` change instead of
  arithmetic on a remaining duration.

  It yields readily, because an advancing carousel that ignores you is worse
  than no carousel:
    pause  (resumes)  hover, keyboard focus inside, section scrolled out of
                      view, browser tab hidden
    stop   (for good) any explicit navigation — dot, swipe
  `prefers-reduced-motion: reduce` disables it outright.

  Self-contained and defensive: does nothing on pages without
  .rd-initiative-wrap, so it is safe to load anywhere.
*/
(function () {
  "use strict";

  var MOBILE = "(max-width: 768px)";

  /* Depth ramp — see DEPTH PASS above. */
  var EASE = 0.055;   /* lerp factor per frame; lower = lazier */
  var LIFT = 10;      /* px; see the About-page drift note */
  var SCALE = 0.10;   /* 1 -> 0.90 across the full travel */
  var BLUR = 6;       /* px, on the compressed ramp */
  var DIM = 0.84;     /* opacity 1 -> 0.16, on the compressed ramp */
  var CLEAR = 0.34;   /* fraction of travel over which fade+blur complete */
  var RISE = 36;      /* px a card rises in from below */
  var IDLE = 20;      /* frames of stillness before the loop parks */

  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function initWrap(wrap) {
    var deck = wrap.querySelector(".rd-initiative-deck");
    var dotwrap = wrap.querySelector(".rd-deck-dots");
    if (!deck) return;

    var panels = Array.prototype.slice.call(deck.querySelectorAll(".rd-initiative-panel"));
    var dots = dotwrap
      ? Array.prototype.slice.call(dotwrap.querySelectorAll(".rd-deck-dot"))
      : [];
    if (!panels.length) return;

    var section = wrap.closest(".rd-initiatives-section") || wrap;
    var rail = section.querySelector(".rd-initiatives-rail");
    var index = section.querySelector(".rd-deck-index");
    var idxItems = index
      ? Array.prototype.slice.call(index.querySelectorAll("li"))
      : [];

    var mq = window.matchMedia(MOBILE);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var current = Math.max(0, panels.indexOf(deck.querySelector(".is-active")));

    function deckTop() {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue("--rd-deck-top");
      var n = parseFloat(v);
      return isNaN(n) ? 88 : n;
    }

    /* ------------------------------------------------------ shared paint -- */

    function paint(i) {
      current = i;
      dots.forEach(function (d, n) {
        if (n === i) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      idxItems.forEach(function (li, n) {
        li.classList.toggle("is-current", n === i);
      });
      panels.forEach(function (p, n) {
        p.classList.toggle("is-active", n === i);
      });
      moveMarker(i);
    }

    /* ============================ DESKTOP: sticky stack ==================== */

    /* Zero-size snap markers, one per panel. See the header note for why these
       exist instead of snapping the panels directly. */
    var markers = panels.map(function () {
      var m = document.createElement("span");
      m.className = "rd-deck-snap";
      m.setAttribute("aria-hidden", "true");
      deck.appendChild(m);
      return m;
    });

    function positionMarkers() {
      panels.forEach(function (p, i) {
        markers[i].style.top = p.offsetTop + "px";
      });
    }

    /* Sliding indicator in the rail. */
    var marker = null;
    if (index) {
      marker = document.createElement("span");
      marker.className = "rd-deck-marker";
      index.appendChild(marker);
    }
    function moveMarker(i) {
      if (!marker) return;
      var li = idxItems[i];
      if (!li) return;
      marker.style.height = li.offsetHeight + "px";
      marker.style.transform = "translateY(" + li.offsetTop + "px)";
    }

    /* r = recede (how far past its sticky point), e = enter (risen into view) */
    var state = panels.map(function () { return { r: 0, rt: 0, e: 1, et: 1 }; });
    var raf = null;
    var idle = 0;

    function measure() {
      var vh = window.innerHeight;
      var top = deckTop();
      panels.forEach(function (p, i) {
        var box = p.getBoundingClientRect();
        /* linear on purpose — see DEPTH PASS */
        state[i].rt = clamp((top - box.top) / Math.max(box.height, 1));
        state[i].et = clamp((vh - box.top) / (vh * 0.65));
      });
    }

    function frame() {
      measure();
      var moving = false;
      var snap = reduced.matches;

      panels.forEach(function (p, i) {
        var s = state[i];
        s.r += (s.rt - s.r) * (snap ? 1 : EASE);
        s.e += (s.et - s.e) * (snap ? 1 : EASE);
        if (Math.abs(s.rt - s.r) > 0.0004 || Math.abs(s.et - s.e) > 0.0004) moving = true;

        var out = clamp(s.r / CLEAR);           /* compressed fade/blur ramp */
        var y = (1 - s.e) * RISE - s.r * LIFT;

        p.style.transform =
          "translate3d(0," + y.toFixed(2) + "px,0) scale(" + (1 - s.r * SCALE).toFixed(4) + ")";
        p.style.opacity = ((0.35 + 0.65 * s.e) * (1 - out * DIM)).toFixed(3);
        p.style.filter = (!snap && out > 0.01) ? "blur(" + (out * BLUR).toFixed(2) + "px)" : "";
        /* a card you can no longer read should not be clickable */
        p.style.pointerEvents = out > 0.6 ? "none" : "";
      });

      syncCurrent();
      idle = moving ? 0 : idle + 1;
      raf = idle < IDLE ? window.requestAnimationFrame(frame) : null;
    }

    function kick() {
      idle = 0;
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    /* The parked card is the last one whose top has reached the sticky line. */
    function syncCurrent() {
      var top = deckTop() + 44;
      var act = 0;
      panels.forEach(function (p, i) {
        if (p.getBoundingClientRect().top <= top) act = i;
      });
      if (act === current) return;
      paint(act);
    }

    function clearDesktopStyles() {
      panels.forEach(function (p) {
        p.style.transform = "";
        p.style.opacity = "";
        p.style.filter = "";
        p.style.pointerEvents = "";
      });
    }

    /* ============================ MOBILE: carousel ========================= */

    var stopped = reduced.matches;   /* true = never plays again */
    var visible = false;
    var hovered = false;
    var focused = false;
    var programmatic = 0;            /* our own scrolls don't stop autoplay */

    function sync() {
      wrap.classList.toggle("is-playing", !stopped && visible && mq.matches);
      wrap.classList.toggle("is-paused", hovered || focused || document.hidden);
    }

    function stop() {
      if (stopped) return;
      stopped = true;
      sync();
    }

    function scrollToMobile(i) {
      var target = panels[i];
      if (!target) return;
      programmatic++;
      deck.scrollTo({
        left: target.offsetLeft - deck.offsetLeft,
        behavior: reduced.matches ? "auto" : "smooth"
      });
      setTimeout(function () {
        programmatic = Math.max(0, programmatic - 1);
      }, 700);
    }

    function nearestMobile() {
      var start = deck.offsetLeft;
      var pos = deck.scrollLeft;
      var best = 0;
      var min = Infinity;
      panels.forEach(function (p, n) {
        var d = Math.abs(p.offsetLeft - start - pos);
        if (d < min) { min = d; best = n; }
      });
      return best;
    }

    /* Desktop jumps to the card's SNAP MARKER, not the card: the card is
       pinned, so scrolling it into view lands in the wrong place. */
    function select(i) {
      if (mq.matches) {
        paint(i);
        scrollToMobile(i);
      } else {
        var m = markers[i];
        if (!m) return;
        var y = m.getBoundingClientRect().top + window.pageYOffset - deckTop();
        window.scrollTo({ top: y, behavior: reduced.matches ? "auto" : "smooth" });
        kick();
      }
    }

    /* Roles differ per mode so the markup is valid in whichever one is live. */
    function applyRoles() {
      var mobile = mq.matches;
      panels.forEach(function (p) {
        p.setAttribute("role", "group");
        p.setAttribute("aria-roledescription", mobile ? "slide" : "card");
        p.setAttribute("aria-label", "Product initiative");
      });
      deck.setAttribute("role", mobile ? "group" : "region");
      deck.setAttribute("aria-roledescription", mobile ? "carousel" : "Product initiatives");
      deck.setAttribute("aria-label", "Product initiatives");
    }

    /* ------------------------------------------------------------ wiring -- */

    wrap.addEventListener("animationend", function (e) {
      if (e.animationName.indexOf("rd-progress") !== 0 || stopped) return;
      if (!mq.matches) return;
      select((current + 1) % panels.length);
    });

    wrap.addEventListener("mouseenter", function () { hovered = true; sync(); });
    wrap.addEventListener("mouseleave", function () { hovered = false; sync(); });
    wrap.addEventListener("focusin", function () { focused = true; sync(); });
    wrap.addEventListener("focusout", function (e) {
      if (e.relatedTarget && wrap.contains(e.relatedTarget)) return;
      focused = false;
      sync();
    });
    document.addEventListener("visibilitychange", sync);

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.35 }).observe(wrap);
    } else {
      visible = true;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { stop(); select(i); });
    });

    idxItems.forEach(function (li) {
      var b = li.querySelector("button");
      if (!b) return;
      b.addEventListener("click", function () { select(+b.dataset.index); });
    });

    /* A real swipe stops autoplay; our own scrollTo does not. */
    deck.addEventListener("pointerdown", function () {
      if (mq.matches) stop();
    }, { passive: true });

    /* Mobile only: the deck is a scroll container there. On desktop the deck
       does not scroll — the PAGE does, and that is handled by kick() below. */
    var tick = null;
    deck.addEventListener("scroll", function () {
      if (!mq.matches) return;
      if (tick) clearTimeout(tick);
      tick = setTimeout(function () {
        var i = nearestMobile();
        if (i === current) return;
        if (!programmatic) stop();
        paint(i);
      }, 80);
    }, { passive: true });

    window.addEventListener("scroll", function () {
      if (!mq.matches) kick();
    }, { passive: true });

    function remeasure() {
      applyRoles();
      if (mq.matches) {
        clearDesktopStyles();
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        scrollToMobile(current);
      } else {
        positionMarkers();
        kick();
      }
      moveMarker(current);
      sync();
    }

    window.addEventListener("resize", remeasure);
    if (mq.addEventListener) mq.addEventListener("change", remeasure);
    else if (mq.addListener) mq.addListener(remeasure);

    /* Images settle after load and every card below them moves, so the markers
       have to be placed again or the snap points sit at stale offsets. */
    window.addEventListener("load", function () {
      positionMarkers();
      moveMarker(current);
      kick();
    });

    paint(current);
    applyRoles();
    positionMarkers();
    sync();
    if (!mq.matches) kick();
  }

  function init() {
    var wraps = document.querySelectorAll(".rd-initiative-wrap");
    Array.prototype.forEach.call(wraps, initWrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
