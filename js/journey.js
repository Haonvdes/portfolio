/*
  "My Path of Growth and Leadership" — about.html.
  Base spec: scroll-stacking-timeline-spec.md.

  CSS does the stacking on its own: every .rd-work-card shares
  `position: sticky; top: var(--rd-journey-top)`, so each parks until the next
  scrolls up over it. The heading column shares that same line, which keeps the
  timeline top-aligned with it. The spec's scroll-scrubbed scale/lift is deliberately NOT
  implemented — it made the whole stack drift upward as
  the last card pinned. Once every card is parked the result is a flat year
  strip sitting over a single card.

  Four jobs here:

  0. THE LANDING
     Sticky alone lets the incoming card ride the scroll straight up across the
     front card's text, which left the two smeared together for the whole
     gesture. Holding it against the bottom edge of the card in front fixed the
     smear but bought a worse problem: the next card sat parked in plain sight
     halfway up the screen, so it read as having been there all along instead of
     arriving (Hao, 2026-09-16).

     So the card now waits HOLD_GAP below the card in front — far enough to sit
     in the 50vh bottom fade and show as a ghost, close enough that the space
     between them reads as a runway rather than a void. At the commit point it
     travels the rest of the way to the sticky line in one eased move, up out of
     the fade and onto the stack.

     HOLD_PEEK caps that on a short window: the waiting card never parks below
     the fold, where nothing of it would show at all.

     The hold is an exact per-frame transform (--rd-card-y), so it can carry no
     CSS transition; the landing therefore runs as its own WAAPI animation with
     `composite: 'add'` on top of that transform, starting from where the card
     was drawn last frame and resolving to nothing.

  1. YEAR STRIP
     At rest every pill sits at the same 24px inset, exactly as designed. All
     the cards pin at the same y though, so once stacked they would all land on
     the same spot — each pill therefore slides right, by the running sum of the
     preceding pills' widths (minus 1px each, so neighbouring borders collapse
     into a single hairline), into its slot in one continuous strip.

     The pill belongs to its card, so it takes its slot on the same commit the
     card lands on — a step, eased by a CSS transition on .rd-work-tag, not a
     scrub.

  2. NAVIGATION
     Scrolling decides which card is at the front — that is just DOM order plus
     sticky. Two controls jump between them: the pills on the cards, and the
     numbered rail in the left column (.rd-deck-index, the same component as the
     homepage initiative rail). Both do the one thing — scroll the chosen card to
     the front — so scroll position and the visible card can never disagree.

  3. SHOW MORE / LESS
     Lists longer than 4 bullets collapse behind the chevron beside
     "Scope of work:". The card has a fixed default height; expanding animates
     that height out to fit the text (never an internal scrollbar), so the
     height has to be set in pixels for the CSS transition to have two definite
     endpoints to move between.

  Card progress is measured off the LIST, not the card: once pinned, a card's
  own getBoundingClientRect().top is frozen at the sticky line and can't say how
  far it has travelled. .rd-journey-list is `position: relative` (the cards'
  offsetParent), so `list rect top + card.offsetTop` reconstructs where the card
  would sit unpinned.
*/
(function () {
  'use strict';

  // Read from the stylesheet rather than duplicated here, so the sticky line
  // can only ever be changed in one place (--rd-journey-top in redesign.css).
  var STICKY_TOP =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--rd-journey-top'
      ),
      10
    ) || 60;
  var TAG_BASE = 24; // .rd-work-tagrow's resting left inset
  var BORDER = 1; // pill border width, collapsed between neighbours
  var VISIBLE_BULLETS = 4; // must match the :nth-child(n + 5) rule in redesign.css
  var DISABLE_BELOW = 1181; // matches the max-width: 1180px reset in redesign.css

  var list = document.querySelector('.rd-journey-list');
  if (!list) return;

  var entries = Array.prototype.slice
    .call(list.querySelectorAll('.rd-work-card'))
    .map(function (card) {
      var body = card.querySelector('.rd-work-body');
      return {
        card: card,
        body: body,
        tag: card.querySelector('.rd-work-tag'),
        // Paired by aria-controls rather than by index, so reordering the cards
        // or the index can't silently mismatch them.
        navItem: body
          ? document.querySelector(
              '.rd-deck-index button[aria-controls="' + body.id + '"]'
            )
          : null
      };
    });
  if (!entries.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ticking = false;

  function isStacked() {
    return window.innerWidth >= DISABLE_BELOW;
  }

  /* -------------------------------------------------------- 1. year strip - */

  // How far each pill has to travel from its resting inset to its slot in the
  // strip. Recomputed on resize; consumed every frame by update().
  var travel = entries.map(function () {
    return 0;
  });

  // Scroll-snap markers — one per card, so a single gesture advances exactly
  // one card. They exist instead of snapping the cards directly because a
  // sticky element makes a broken snap target (see .rd-work-snap in the CSS).
  var markers = entries.map(function () {
    var marker = document.createElement('span');
    marker.className = 'rd-work-snap';
    marker.setAttribute('aria-hidden', 'true');
    list.appendChild(marker);
    return marker;
  });


  /* Sliding indicator in the rail — created here rather than authored in the
     HTML because it is pure decoration and must not exist without JS to move it. */
  var rail = document.querySelector('.rd-deck-index');
  var railMarker = null;
  if (rail) {
    railMarker = document.createElement('span');
    railMarker.className = 'rd-deck-marker';
    rail.appendChild(railMarker);
  }
  function moveMarker(i) {
    if (!railMarker) return;
    var e = entries[i];
    var li = e && e.navItem ? e.navItem.parentNode : null;
    if (!li) return;
    railMarker.style.height = li.offsetHeight + 'px';
    railMarker.style.transform = 'translateY(' + li.offsetTop + 'px)';
  }

  // A stuck sticky element reports its CURRENT offset from `offsetTop`, not the
  // one it would have in flow — so once the stack is pinned every card returns
  // the same number and the spacing between them reads as zero. The static
  // offsets are rebuilt from the card heights and the list's row gap instead,
  // which sticky does not touch. Everything that needs "where would this card
  // sit unpinned" reads this array.
  var staticTop = entries.map(function () {
    return 0;
  });
  function measureOffsets() {
    var gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    var y = 0;
    entries.forEach(function (e, i) {
      staticTop[i] = y;
      y += e.card.offsetHeight + gap;
    });
  }

  // Card heights change when a list is expanded, so this has to re-run then too.
  function positionMarkers() {
    // Below the stacking breakpoint the markers must all sit at 0. Their
    // offsets describe a VERTICAL stack, but the phone deck is a horizontal
    // scroller — and `overflow-x: auto` computes overflow-y to `auto` as well,
    // so leaving them spread down the page gave the deck ~1,800px of vertical
    // scroll inside a 600px box. One stray vertical scroll there and the cards
    // are cut off mid-sentence with their titles above the top edge (Hao,
    // 2026-09-16). Nothing is lost by parking them: the phone deck snaps on
    // `scroll-snap-align` on the cards themselves, not on these.
    var stacked = isStacked();
    entries.forEach(function (e, i) {
      markers[i].style.top = (stacked ? staticTop[i] : 0) + 'px';
    });
  }

  function measureTags() {
    if (!isStacked()) {
      travel = entries.map(function () {
        return 0;
      });
      entries.forEach(function (e) {
        e.card.style.removeProperty('--rd-tag-x');
      });
      return;
    }

    var widths = entries.map(function (e) {
      return e.tag ? e.tag.offsetWidth : 0;
    });

    var offsets = [];
    var x = TAG_BASE;
    widths.forEach(function (w) {
      offsets.push(x);
      x += w - BORDER; // -1px so adjacent pills share one border line
    });

    // If the strip is wider than the column, tighten the step so the pills
    // overlap evenly instead of pushing the last one out of the card.
    var available = list.clientWidth - TAG_BASE * 2;
    var needed = x - TAG_BASE;
    if (needed > available && entries.length > 1) {
      var step = (available - widths[widths.length - 1]) / (entries.length - 1);
      offsets = entries.map(function (_, i) {
        return TAG_BASE + step * i;
      });
    }

    // Every pill rests at TAG_BASE, so the offset is purely a delta.
    travel = offsets.map(function (o) {
      return o - TAG_BASE;
    });
  }

  /* --------------------------------------------------------- 2. selection - */

  // Marks the card that is currently at the front of the stack, in both places
  // that show it: the on-card pill and the rail. Driven from one function so the
  // two can never disagree.
  function paint(frontIndex) {
    entries.forEach(function (e, i) {
      if (e.tag) {
        if (i === frontIndex) e.tag.setAttribute('aria-current', 'true');
        else e.tag.removeAttribute('aria-current');
      }
      if (e.navItem && e.navItem.parentNode) {
        e.navItem.parentNode.classList.toggle('is-current', i === frontIndex);
      }
    });
    moveMarker(frontIndex);
  }

  // Where each card was actually drawn on the previous frame, and whether it
  // had already committed to the front. Both are needed to run the landing as a
  // one-shot animation instead of scrubbing it with the scroll.
  var renderedAt = entries.map(function () { return 0; });
  var hasLanded = entries.map(function () { return false; });
  var primed = false;

  // A card whose scope list is expanded gets its sticky line pulled up by
  // js/journey.js (liftIfTallerThanViewport), so read the line off the card
  // rather than assuming the shared one.
  function lineOf(card) {
    var explicit = parseFloat(card.style.top);
    return isNaN(explicit) ? STICKY_TOP : explicit;
  }

  // The card lands when it is this far through its approach. Below it the card
  // waits at the fold; at it the card travels the rest of the way in one move.
  var COMMIT = 0.5;

  // How much of a waiting card's top edge sits above the bottom of the window.
  // Not zero: a fully hidden card gives no hint that the stack continues. Kept
  // small because the bottom fade (--rd-journey-fade-h, 50vh) is ~80% opaque
  // this close to the edge, so this reads as a ghost of a card rather than a
  // card — which is the whole difference Hao asked for.
  var HOLD_PEEK = 96;

  // ...and how far below the card in front it waits. See --rd-journey-hold-gap
  // for why this value and not 0 or a whole screen.
  var HOLD_GAP = 140;

  // Read from the stylesheet for the same reason STICKY_TOP is: .rd-work-tag
  // transitions the year pill with these exact values, so taking them from
  // anywhere else would let the card and its pill drift apart.
  var rootStyle = getComputedStyle(document.documentElement);
  var LAND_MS = parseFloat(rootStyle.getPropertyValue('--rd-journey-land')) || 640;
  var LAND_EASE =
    rootStyle.getPropertyValue('--rd-journey-land-ease').trim() ||
    'cubic-bezier(0.33, 1, 0.68, 1)';
  HOLD_GAP =
    parseFloat(rootStyle.getPropertyValue('--rd-journey-hold-gap')) || HOLD_GAP;

  function update() {
    ticking = false;

    if (!isStacked()) {
      entries.forEach(function (e) {
        e.card.style.removeProperty('--rd-tag-x');
        e.card.style.removeProperty('--rd-card-y');
        if (e.tag) e.tag.removeAttribute('aria-current');
      });
      primed = false;
      return;
    }

    var listTop = list.getBoundingClientRect().top;
    var front = 0;
    var prevBottom = null;
    // The lowest a waiting card may park. Read every frame rather than cached:
    // it moves with the window, and a phone's URL bar collapsing changes
    // innerHeight mid-scroll without firing a resize.
    var foldLine = window.innerHeight - HOLD_PEEK;

    entries.forEach(function (e, i) {
      var line = lineOf(e.card);
      // Where the card's top edge would sit if it weren't pinned, clamped by
      // sticky: it can never draw above its own line.
      var natural = listTop + staticTop[i];
      if (natural < line) natural = line;

      var target;
      var landed;

      if (i === 0) {
        target = natural;
        landed = natural <= line + 1;
      } else {
        var span = staticTop[i] - staticTop[i - 1];
        // 0 where the card starts its approach (one card-plus-gap below the
        // line), 1 where it would pin.
        var p = (line + span - natural) / span;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        landed = p >= COMMIT;
        // Before the commit the card waits HOLD_GAP below the one in front,
        // but never past the fold — on a short window that cap is what stops
        // the wait position sliding off screen entirely. prevBottom is then the
        // floor underneath both, so when several cards are waiting the second
        // sits a full card-height below the first instead of inside it.
        // `natural` stays in the outer max so a card still below its wait
        // position is left exactly where the document puts it: the clamp only
        // ever holds a card DOWN, never drags one up early.
        var hold = Math.max(
          prevBottom,
          Math.min(foldLine, prevBottom + HOLD_GAP)
        );
        target = landed ? line : Math.max(natural, hold);
      }

      // The hold is exact per frame, so the transform can carry no CSS
      // transition. The landing is therefore run as its own animation, added on
      // top of the scrubbed transform: it starts where the card was drawn last
      // frame and resolves to nothing, so the scroll keeps full control the
      // moment it finishes.
      if (primed && landed !== hasLanded[i] && !reduceMotion.matches) {
        var delta = renderedAt[i] - target;
        if (Math.abs(delta) > 1) {
          e.card.animate(
            [
              { transform: 'translateY(' + delta.toFixed(1) + 'px)' },
              { transform: 'translateY(0px)' }
            ],
            {
              duration: LAND_MS,
              easing: LAND_EASE,
              composite: 'add'
            }
          );
        }
      }

      e.card.style.setProperty(
        '--rd-card-y',
        (target - natural).toFixed(1) + 'px'
      );
      // The pill belongs to the card, so it takes its slot in the strip on the
      // same commit rather than on a scrub of its own; .rd-work-tag transitions
      // the step.
      e.card.style.setProperty(
        '--rd-tag-x',
        (landed ? travel[i] : 0).toFixed(1) + 'px'
      );

      renderedAt[i] = target;
      hasLanded[i] = landed;
      if (landed) front = i;
      prevBottom = target + e.card.offsetHeight;
    });

    primed = true;
    paint(front);
  }

  // Both controls do the same thing: bring the card to the front by scrolling to
  // it. Scrolling the MARKER rather than computing a scrollTo target is what
  // makes this cooperate with scroll-snap — the marker is itself a snap target
  // and carries scroll-margin-top, so the snap engine agrees with where we
  // asked to go instead of yanking the page back to the nearest snap point.
  function goTo(i) {
    markers[i].scrollIntoView({
      block: 'start',
      behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
  }

  entries.forEach(function (e, i) {
    [e.tag, e.navItem].forEach(function (el) {
      if (el) el.addEventListener('click', function () { goTo(i); });
    });
  });

  /* --------------------------------------------- 3. show more / less - */

  // Measure the card's natural height with the list fully open, without letting
  // the reader see the intermediate state.
  function fullHeight(body) {
    var prev = body.style.height;
    body.style.transition = 'none';
    body.style.height = 'auto';
    var h = body.offsetHeight;
    body.style.height = prev;
    body.offsetHeight; // force reflow so the transition restarts cleanly
    body.style.transition = '';
    return h;
  }

  // A card pinned at the sticky line that is taller than the space below it
  // would have its bottom permanently off-screen — it is stuck, so you cannot
  // scroll to reach it. Pulling its sticky line up by the overflow lets it
  // scroll until its bottom shows, then dock.
  // `height` is the BODY's height, but the card is that body plus the year-pill
  // row above it — so measuring the body alone under-reports the card by the
  // row and the lift engages about 46px later than it should. Both boxes are
  // read in the same frame, so the difference is the card's own chrome
  // whatever state the height transition happens to be in.
  function liftIfTallerThanViewport(card, height) {
    var body = card.querySelector('.rd-work-body');
    var chrome = body ? card.offsetHeight - body.offsetHeight : 0;
    var available = window.innerHeight - STICKY_TOP;
    var overflow = height + chrome - available;
    card.style.top = overflow > 0 ? STICKY_TOP - overflow + 'px' : '';
  }

  entries.forEach(function (e, index) {
    var resp = e.card.querySelector('.rd-work-scope');
    var head = e.card.querySelector('.rd-work-scope-head');
    var ul = e.card.querySelector('.rd-work-scope-list');
    if (!resp || !head || !ul || !e.body) return;

    var total = ul.children.length;
    if (total <= VISIBLE_BULLETS) return; // nothing to hide, so no toggle

    var hidden = total - VISIBLE_BULLETS;
    var labelMore = 'Show ' + hidden + ' more scope of work items';
    var labelLess = 'Show fewer scope of work items';

    // Icon-only button: the chevron is drawn in CSS, so the accessible name has
    // to come from aria-label and stay in sync on every toggle.
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rd-work-more';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', labelMore);
    btn.title = labelMore;

    if (!ul.id) ul.id = 'scope-' + (e.body.id || index + 1);
    btn.setAttribute('aria-controls', ul.id);

    ul.classList.add('is-collapsed');
    resp.classList.add('is-collapsible');
    head.appendChild(btn);

    btn.addEventListener('click', function () {
      var open = ul.classList.toggle('is-collapsed') === false;
      var label = open ? labelLess : labelMore;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.title = label;

      if (!isStacked()) {
        // Card is auto-height below the breakpoint; leave it alone.
        e.body.style.height = '';
        return;
      }

      if (open) {
        // Grow to fit the text. An explicit px value is required — `auto` is
        // not an animatable endpoint.
        var h = fullHeight(e.body);
        e.body.style.height = h + 'px';
        liftIfTallerThanViewport(e.card, h);
      } else {
        // Back to the shared default height from the stylesheet.
        e.body.style.height = '';
        e.card.style.top = '';
      }
      // The card changed height, so every card below it — and every snap point
      // below it — just moved, and the tail slack depends on that height.
      // measureTags() alongside them for the same reason onResize() calls all
      // three: expanding does not change a pill's width today, but nothing
      // guarantees that for the next bit of copy that lands in a card.
      measureTags();
      positionMarkers();
      update();
    });

    // The card's height ANIMATES, so on the click frame offsetHeight is still
    // the old value and the static offsets built from it would be a card-height
    // out of date — which now feeds the landing, not just the snap markers.
    // Re-run once the height has actually settled.
    e.body.addEventListener('transitionend', function (ev) {
      if (ev.target !== e.body || ev.propertyName !== 'height') return;
      measureOffsets();
      positionMarkers();
      update();
    });

    // A card left open when the viewport crosses the breakpoint would keep a
    // stale pixel height, so drop it and re-measure.
    // A card left open across a resize keeps a stale pixel height, and its
    // sticky lift was measured against the old viewport.
    e.card.addEventListener('rd-remeasure', function () {
      e.card.style.top = '';
      if (ul.classList.contains('is-collapsed') || !isStacked()) {
        e.body.style.height = '';
        return;
      }
      var h = fullHeight(e.body);
      e.body.style.height = h + 'px';
      liftIfTallerThanViewport(e.card, h);
    });
  });

  /* ------------------------------------------------------------- wiring - */

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function onResize() {
    measureTags();
    entries.forEach(function (e) {
      e.card.dispatchEvent(new Event('rd-remeasure'));
    });
    // After the remeasure, not before: a card left expanded gets its height
    // back there, and the static offsets are built out of those heights.
    measureOffsets();
    positionMarkers();
    update();
    // Crossing 768px turns the deck into a scroller or back again, so the
    // end-of-deck flag has to be recomputed even without a deck scroll.
    readDeckEdge();
  }

  /* ------------------------------------ 5. phone deck right-edge fade - */

  /* Below 769px the stack becomes a horizontal swipe deck and redesign.css
     masks its right edge so the next card dissolves into the section
     background. The mask is pinned to the element's box, not the content, so
     once the deck is scrolled to its end it would sit on top of the LAST
     card and eat its border and the last few characters of every line. This
     flag lets the stylesheet drop the mask there. Read `scrollLeft` only
     inside rAF: reading it in the scroll handler itself forces layout on
     every frame of a momentum swipe.

     The 2px slack absorbs sub-pixel scroll positions — a deck scrolled fully
     right lands on fractional values in both Chromium and WebKit, so an
     exact comparison never fires. */
  var deckTicking = false;

  function readDeckEdge() {
    deckTicking = false;
    var max = list.scrollWidth - list.clientWidth;
    list.classList.toggle('is-deck-end', max <= 0 || list.scrollLeft >= max - 2);
  }

  function onDeckScroll() {
    if (deckTicking) return;
    deckTicking = true;
    window.requestAnimationFrame(readDeckEdge);
  }

  list.addEventListener('scroll', onDeckScroll, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', onResize);
  }
  // Images and webfonts shift card heights and pill widths after load.
  window.addEventListener('load', onResize);

  measureTags();
  measureOffsets();
  positionMarkers();
  update();
  readDeckEdge();
})();
