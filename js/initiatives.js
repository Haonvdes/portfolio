/*
  Selected Product Initiatives.

  Two presentations of the same four panels:

    >= 1181px wide, > 700px tall, motion allowed
              A PINNED DECK, the same one web-3.html §03 uses (js/pinned-deck.js,
              which must load first). The section is the track, .rd-initiatives-inner
              the sticky 100vh stage; one card shows at a time and one scroll
              gesture moves exactly one card. CSS in initiatives-desktop.css.
    769–1180px, or too short, or reduced motion
              A plain vertical list of the four cards. No script involved.
    <= 768px  A horizontal scroll-snap carousel. The reader swipes; the dots are
              the control and the position indicator, and run autoplay.

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

  function initWrap(wrap) {
    var deck = wrap.querySelector(".rd-initiative-deck");
    var dotwrap = wrap.querySelector(".rd-deck-dots");
    if (!deck) return;

    var panels = Array.prototype.slice.call(deck.querySelectorAll(".rd-initiative-panel"));
    var dots = dotwrap
      ? Array.prototype.slice.call(dotwrap.querySelectorAll(".rd-deck-dot"))
      : [];
    if (!panels.length) return;

    var section = wrap.closest(".rd-initiatives-section");

    /* Desktop. Min height matches the max-height: 700px card reset and the
       home page's own snap cut-off in redesign.css. */
    if (section && window.rdPinnedDeck) {
      window.rdPinnedDeck(section, {
        stage: ".rd-initiatives-inner",
        cards: ".rd-initiative-panel",
        countVar: "--rd-deck-n",
        minWidth: 1181,
        minHeight: 701
      });
    }

    var mq = window.matchMedia(MOBILE);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function activeIndex() {
      return Math.max(0, panels.indexOf(deck.querySelector(".is-active")));
    }
    var current = activeIndex();

    function paint(i) {
      current = i;
      dots.forEach(function (d, n) {
        if (n === i) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      panels.forEach(function (p, n) {
        p.classList.toggle("is-active", n === i);
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

    function select(i) {
      if (!mq.matches) return;
      paint(i);
      scrollToMobile(i);
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

    /* Mobile-only whole-card click, matching .rd-related-card's pattern on
       case-study pages. Desktop deliberately keeps "Learn
       More" as the sole click target — the desktop card carries a full
       Problem paragraph the reader may want to select/copy, and a card-wide
       click handler would fight that; the mobile card shows only
       title/desc/CTA (redesign.css hides rd-detail-outcome and
       rd-initiative-detail there), so a tap anywhere is unambiguous. A real
       <a> stays the click source either way — this only widens its hit area,
       and lets a tap that lands on the anchor itself navigate natively
       instead of double-firing. */
    panels.forEach(function (p) {
      var card = p.querySelector(".rd-initiative-card");
      var cta = card && card.querySelector(".rd-initiative-actions a");
      if (!card || !cta) return;
      card.addEventListener("click", function (e) {
        if (!mq.matches) return;
        if (e.target.closest("a")) return;
        window.location.href = cta.href;
      });
    });

    /* A real swipe stops autoplay; our own scrollTo does not. */
    deck.addEventListener("pointerdown", function () {
      if (mq.matches) stop();
    }, { passive: true });

    /* The deck is only a scroll container on mobile. */
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

    /* The desktop deck moves .is-active on its own, so pick the carousel up
       from whichever card it left showing. */
    function remeasure() {
      applyRoles();
      if (mq.matches) {
        paint(activeIndex());
        scrollToMobile(current);
      }
      sync();
    }

    window.addEventListener("resize", function () {
      if (mq.matches) scrollToMobile(current);
    });
    if (mq.addEventListener) mq.addEventListener("change", remeasure);
    else if (mq.addListener) mq.addListener(remeasure);

    paint(current);
    applyRoles();
    sync();
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
