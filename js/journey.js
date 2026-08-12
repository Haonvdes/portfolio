/*
  "My Path of Growth and Leadership" — about.html.
  Base spec: scroll-stacking-timeline-spec.md.

  CSS does the stacking on its own: every .rd-work-card shares
  `position: sticky; top: var(--rd-journey-top)`, so each parks until the next
  scrolls up over it. The heading column shares that same line, which keeps the
  timeline top-aligned with it. The spec's scroll-scrubbed scale/lift is deliberately NOT implemented —
  Hao removed it on 2026-08-02 because it made the whole stack drift upward as
  the last card pinned. Once every card is parked the result is a flat year
  strip sitting over a single card.

  Three jobs here:

  1. YEAR STRIP
     At rest every pill sits at the same 24px inset, exactly as designed. All
     the cards pin at the same y though, so once stacked they would all land on
     the same spot — each pill therefore slides right, by the running sum of the
     preceding pills' widths (minus 1px each, so neighbouring borders collapse
     into a single hairline), into its slot in one continuous strip.

     That slide is scrubbed by scroll over the last TAG_LEAD pixels of the
     card's approach to the sticky line, so the pills travel into place as you
     scroll instead of being pre-fanned on load.

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
  var TAG_LEAD = 220; // px of approach over which a pill slides into the strip
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

  // Card heights change when a list is expanded, so this has to re-run then too.
  function positionMarkers() {
    entries.forEach(function (e, i) {
      markers[i].style.top = e.card.offsetTop + 'px';
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

  function update() {
    ticking = false;

    if (!isStacked()) {
      entries.forEach(function (e) {
        e.card.style.removeProperty('--rd-tag-x');
        if (e.tag) e.tag.removeAttribute('aria-current');
      });
      return;
    }

    var listTop = list.getBoundingClientRect().top;
    var front = 0;

    entries.forEach(function (e, i) {
      // Where the card's top edge would sit if it weren't pinned.
      var naturalTop = listTop + e.card.offsetTop;
      // Positive while the card is still approaching the sticky line, <= 0 once
      // it has reached it and pinned.
      var distance = naturalTop - STICKY_TOP;

      if (distance <= 1) front = i;

      // 0 while the card is still TAG_LEAD or more below the line, ramping to 1
      // exactly as it pins — so the pill slides from its resting inset into its
      // slot in the strip, scrubbed by scroll rather than eased on a timer.
      var progress = 1 - distance / TAG_LEAD;
      progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;

      e.card.style.setProperty(
        '--rd-tag-x',
        (travel[i] * progress).toFixed(1) + 'px'
      );
    });

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
  function liftIfTallerThanViewport(card, height) {
    var available = window.innerHeight - STICKY_TOP;
    var overflow = height - available;
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
    positionMarkers();
    update();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', onResize);
  }
  // Images and webfonts shift card heights and pill widths after load.
  window.addEventListener('load', onResize);

  measureTags();
  positionMarkers();
  update();
})();
