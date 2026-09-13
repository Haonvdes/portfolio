/*
  §03 "Current state of UX in Web3" — case-studies/web-3.html.

  The stage pins for one viewport while the track scrolls past it, and one
  scroll gesture moves exactly one card. CSS fades the old card out and the new
  one in. The page snaps section by section (redesign.css, B6), but a snap
  point per card would fight the pinned stage, so while the page is inside the
  track this script takes the wheel / touch / key input itself:

  - The first event of a gesture steps one card and jumps the page to that
    card's rest position. The rest of that gesture (the finger's travel, a
    trackpad's inertia tail, a spun mouse wheel) is swallowed, so a hard flick
    still only moves one card.
  - Stepping past card 1 upward or card n downward is not intercepted, so the
    page carries on scrolling into the neighbouring section.
  - A gesture that would carry the page across the track's edge from outside
    stops at the edge card instead of flying past the whole deck.

  Rest positions sit evenly from the track's first pinned pixel (card 1) to its
  last (card n). Scrolling that doesn't come through here — the scrollbar, the
  TOC, find-in-page — picks the nearest card, so the two can never disagree.

  Only runs when `.is-live` can: wide, tall enough, and motion allowed. In every
  other case the CSS lays the same cards out as a plain grid.
*/
(function () {
  'use strict';

  var MIN_WIDTH = 1181; // matches the max-width: 1180px reset in redesign.css
  var MIN_HEIGHT = 640; // below this the intro column + card no longer fit 100vh
  var SWIPE = 40; // px of touch travel that counts as a swipe

  // Where one wheel gesture ends and the next begins. The DOM exposes no
  // gesture phase, so this reads the shape of the deltas instead. See
  // newGesture() for how each is used.
  var QUIET = 90; // ms gap that ends a gesture — unless its deltas are still dying
  var PAUSE = 300; // ms gap that ends a gesture no matter what
  var DECAY = 0.6; // at or below this share of the peak, the gesture is winding down
  var SETTLED = 200; // ms a gesture runs before its shape can call a new one

  var track = document.querySelector('.rd-b6-fx');
  if (!track) return;
  var stage = track.querySelector('.rd-b6-fx-stage');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.rd-b6-fx-card'));
  if (!stage || cards.length < 2) return;

  var rail = track.querySelector('.rd-deck-index');
  var items = cards.map(function (card) {
    var btn = rail
      ? rail.querySelector('button[aria-controls="' + card.id + '"]')
      : null;
    return btn ? btn.parentNode : null;
  });

  var last = cards.length - 1;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ticking = false;
  var active = -1;

  track.style.setProperty('--rd-b6-fx-n', cards.length);

  // Pure decoration that only JS moves, so it is created here, not authored.
  var marker = null;
  if (rail) {
    marker = document.createElement('span');
    marker.className = 'rd-deck-marker';
    rail.appendChild(marker);
  }

  function isLive() {
    return track.classList.contains('is-live');
  }

  function canRun() {
    return (
      window.innerWidth >= MIN_WIDTH &&
      window.innerHeight >= MIN_HEIGHT &&
      !reduceMotion.matches
    );
  }

  /* ------------------------------------------------------------ geometry - */

  // Document y where the stage first pins, and how far the page can scroll
  // while it stays pinned. Track height is set in CSS only.
  function trackTop() {
    return window.pageYOffset + track.getBoundingClientRect().top;
  }
  function range() {
    return track.offsetHeight - stage.offsetHeight;
  }
  function restOf(i) {
    return trackTop() + Math.round((i * range()) / last);
  }
  function nearest(y) {
    var i = Math.round(((y - trackTop()) * last) / range());
    return i < 0 ? 0 : i > last ? last : i;
  }
  function inside(y) {
    var top = trackTop();
    return y >= top - 1 && y <= top + range() + 1;
  }

  /* ----------------------------------------------------------- painting - */

  function paint(i) {
    if (i === active) return;
    active = i;
    cards.forEach(function (card, n) {
      card.classList.toggle('is-active', n === i);
    });
    items.forEach(function (li, n) {
      if (li) li.classList.toggle('is-current', n === i);
    });
    var li = items[i];
    if (marker && li) {
      marker.style.height = li.offsetHeight + 'px';
      marker.style.transform = 'translateY(' + li.offsetTop + 'px)';
    }
  }

  function update() {
    ticking = false;
    if (isLive()) paint(nearest(window.pageYOffset));
  }

  // `behavior` has to be explicit: the case pages set `scroll-behavior:
  // smooth` on html, and a smooth jump would still be travelling when the
  // next gesture arrives.
  function jump(y, smooth) {
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' });
  }

  /* ------------------------------------------------------------ targets - */
  // Each returns the y to jump to, or null when the page should scroll natively.

  // One card on from where the page is, in direction `dir` (+1 down, -1 up).
  function stepTarget(dir) {
    var y = window.pageYOffset;
    if (!inside(y)) return null;

    var here = nearest(y);
    var off = y - restOf(here);
    // Not sitting on a card. A few px off is the page having slipped just
    // past an edge card on entry — WebKit reports scroll position a frame or
    // two late — so settle on the card showing. Further off (the scrollbar,
    // the TOC) the reader is between two cards, so take the one ahead.
    if (Math.abs(off) > 2) {
      var ahead = here;
      if (Math.abs(off) > range() / last / 4 && off * dir > 0) ahead += dir;
      return ahead < 0 || ahead > last ? null : restOf(ahead);
    }

    var next = here + dir;
    return next < 0 || next > last ? null : restOf(next); // null: leave the track
  }

  // For the rest of a gesture the browser has been scrolling on its own: if it
  // has carried the page into the track, park on the card showing rather than
  // stepping on from it. Moving outward from an edge card is the page leaving
  // the track, so that stays native.
  function settleTarget(dir) {
    var y = window.pageYOffset;
    if (!inside(y)) return null;
    var here = nearest(y);
    if (dir > 0 && here === last && y >= restOf(last) - 2) return null;
    if (dir < 0 && here === 0 && y <= restOf(0) + 2) return null;
    return restOf(here);
  }

  // A delta that would carry the page over the track's edge from outside.
  function entryTarget(dir, delta) {
    var y = window.pageYOffset;
    var top = trackTop();
    var end = top + range();
    if (dir > 0 && y < top - 1 && y + delta >= top) return top;
    if (dir < 0 && y > end + 1 && y + delta <= end) return end;
    return null;
  }

  /* -------------------------------------------------------------- wheel - */

  var g = {
    start: 0, // time this gesture's first event arrived
    at: 0, // time of the last wheel event
    dir: 0,
    last: 0, // |delta| of the last event
    peak: 0, // largest |delta| so far in this gesture
    decaying: false, // has fallen to DECAY × peak since the gesture began
    floor: Infinity, // smallest |delta| since it started decaying
    handled: false, // this gesture already moved a card (or caught an edge)
    hold: null // the y this gesture parked the page on
  };

  // Is this event the start of a new gesture, or more of the current one?
  //
  // A finger's stroke ramps up, and a trackpad's inertia only ever winds down;
  // neither changes direction. So: a reversal is new; a long pause is new; a
  // short pause is new unless the deltas were already dying and still are (an
  // inertia tail can stutter); and once a gesture is dying, a delta that
  // climbs well clear of its floor is a new stroke landing on top of the tail.
  // That last rule is what lets a quick second scroll count without waiting
  // for the first one's inertia to run out. The shape rules wait SETTLED ms,
  // because a finger's own stroke is uneven for its first moments.
  function newGesture(a, dir, now) {
    if (!g.at) return true;
    var gap = now - g.at;
    if (gap > PAUSE) return true;
    if (gap > QUIET && !(g.decaying && a <= g.last)) return true;
    if (now - g.start < SETTLED) return false;
    if (dir !== g.dir && a >= 2) return true;
    if (g.decaying && a >= Math.max(g.floor * 2 + 4, 8)) return true;
    return false;
  }

  function onWheel(e) {
    if (!isLive() || e.ctrlKey) return; // ctrl+wheel is pinch-zoom
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;
    if (Math.abs(dy) < Math.abs(e.deltaX) || dy === 0) return;

    var now = Date.now();
    var a = Math.abs(dy);
    var dir = dy > 0 ? 1 : -1;
    var fresh = newGesture(a, dir, now);

    if (fresh) {
      g.start = now;
      g.peak = 0;
      g.decaying = false;
      g.floor = Infinity;
      g.handled = false;
      g.hold = null;
    }
    if (a > g.peak) g.peak = a;
    if (!g.decaying && a <= g.peak * DECAY) g.decaying = true;
    if (g.decaying && a < g.floor) g.floor = a;
    g.at = now;
    g.dir = dir;
    g.last = a;

    if (g.handled) {
      hold(e);
      return;
    }

    var target = fresh ? stepTarget(dir) : settleTarget(dir);
    if (target === null) target = entryTarget(dir, dy);
    if (target === null) return; // native scroll

    g.handled = true;
    g.hold = target;
    jump(target);
    hold(e);
  }

  // Keep the page parked for the rest of a handled gesture. Chrome only lets a
  // gesture's later events be cancelled if its first one was; when the first
  // went through natively (a flick caught on the way into the track), the
  // browser keeps applying the deltas, so put the page back after each one.
  function hold(e) {
    if (e.cancelable) {
      e.preventDefault();
    } else if (g.hold !== null) {
      var y = g.hold;
      window.requestAnimationFrame(function () {
        if (Math.abs(window.pageYOffset - y) > 1) jump(y);
      });
    }
  }

  /* -------------------------------------------------------- touch + keys - */

  // Touch: a swipe inside the track is one step; outside it, native scrolling.
  var touchY = null;
  var touchUsed = false;
  function onTouchStart(e) {
    touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
    touchUsed = false;
  }
  function onTouchMove(e) {
    if (!isLive() || touchY === null) return;
    var y = window.pageYOffset;
    if (!inside(y)) return;
    var dy = touchY - e.touches[0].clientY;
    var dir = dy > 0 ? 1 : -1;
    var next = nearest(y) + dir;
    // At either end, a swipe outward is the page's to scroll.
    if (!touchUsed && (next < 0 || next > last)) return;
    e.preventDefault();
    if (!touchUsed && Math.abs(dy) >= SWIPE) {
      var target = stepTarget(dir);
      if (target !== null) {
        jump(target);
        touchUsed = true;
      }
    }
  }

  var KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
  function onKey(e) {
    if (!isLive() || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var dir = KEYS[e.key];
    if (!dir) return;
    if (e.key === ' ' && e.shiftKey) dir = -1;
    var target = stepTarget(dir);
    if (target === null) return;
    e.preventDefault();
    jump(target);
  }

  /* ---------------------------------------------------------- rail + wiring - */

  items.forEach(function (li, i) {
    var btn = li ? li.querySelector('button') : null;
    if (btn) {
      btn.addEventListener('click', function () {
        if (!isLive()) return;
        jump(restOf(i), !reduceMotion.matches);
      });
    }
  });

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function measure() {
    var live = canRun();
    track.classList.toggle('is-live', live);
    if (live) {
      active = -1; // repaint: the rail marker's geometry may have changed
      update();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', measure);
  // Webfonts change the rail rows' heights after first paint.
  window.addEventListener('load', measure);
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', measure);
  }

  measure();
})();
