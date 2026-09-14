// Pinned section header (.rd-pin-head): heading, intro and pills stay at the
// top of the viewport while the panels scroll under them.
//
// Once pinned, the header compacts (.is-stuck): the intro hides and the pills
// move up beside the heading. The header gets shorter while it is still in
// the flow, which would pull everything below it up by the same amount, so a
// spacer after it takes that height back. The spacer sits outside the header
// on purpose — extra margin on the header itself would enlarge its sticky
// margin box and make it let go before the section ends.
//
// Tab switches from deep inside a long panel bring the new panel's start up
// to just under the header. That runs a frame later, so whichever script
// swaps the panel (case-tabs.js or a page's own) has already done it.
(function () {
  var heads = document.querySelectorAll('.rd-pin-head');
  if (!heads.length) return;

  function isSticky(el) {
    return el && getComputedStyle(el).position === 'sticky' && el.offsetHeight > 0;
  }

  function firstVisibleAfter(el) {
    for (var n = el.nextElementSibling; n; n = n.nextElementSibling) {
      if (!n.classList.contains('rd-pin-head-spacer') && n.offsetHeight > 0) return n;
    }
    return null;
  }

  heads.forEach(function (head) {
    var dropdown = head.querySelector('.rd-tabs-dropdown');
    var spacer = document.createElement('div');
    spacer.className = 'rd-pin-head-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    head.parentNode.insertBefore(spacer, head.nextSibling);

    var tabs = head.querySelector('.rd-tabs');
    var body = head.querySelector('.rd-case-body, .rd-pin-head-intro');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var applied = false;   // the layout currently on the page
    var wanted = false;    // the layout scrolling last asked for
    var run = 0;           // bumps on every new switch, so stale callbacks bail
    var anims = [];

    function px(n) { return n + 'px'; }
    function gapOf() { return parseFloat(getComputedStyle(head.parentNode).rowGap) || 0; }

    // Switches the layout and sets the final inline values. Animations only
    // ever override these for their duration, so cancelling one lands on the
    // finished state.
    function switchLayout(next) {
      var gap = gapOf();
      var fromH = head.offsetHeight;
      var fromM = spacer.hidden ? -gap : parseFloat(spacer.style.marginTop) || 0;
      head.classList.toggle('is-stuck', next);
      var toH = head.offsetHeight;
      // The spacer adds one flex gap of its own, so its margin nets that out.
      // -gap is "takes no room".
      var toM = next ? fromH - toH + fromM : -gap;
      spacer.style.marginTop = px(toM);
      applied = next;
      return { fromH: fromH, toH: toH, fromM: fromM, toM: toM };
    }

    function settle() {
      head.style.overflow = '';
      spacer.hidden = !applied;
    }

    function abort() {
      run++;
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      settle();
    }

    function track(a) { anims.push(a); return a; }

    // The pills never travel between the two layouts. They (and the intro,
    // when it is about to hide) fade out in place; then the layout switches
    // while the header's height eases to its new size, the spacer easing the
    // other way on the same timeline so nothing below moves; then the pills
    // fade in where they now sit.
    function setStuck(next, animate) {
      if (next === wanted) return;
      wanted = next;
      abort();
      if (next === applied) return;
      if (!animate || !tabs || !head.animate || reduceMotion.matches) {
        switchLayout(next);
        settle();
        return;
      }

      var id = run;
      var fadeOut = [tabs].concat(next && body ? [body] : []).map(function (el) {
        return track(el.animate([{ opacity: 1 }, { opacity: 0 }],
          { duration: 120, easing: 'ease-in', fill: 'forwards' }));
      });

      fadeOut[0].onfinish = function () {
        if (id !== run) return;
        var m = switchLayout(next);
        var ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
        var D = 300;
        // New animations first, then drop the fade-outs, all in this task,
        // so no frame paints the pills at full opacity in between.
        var enter = [
          head.animate([{ height: px(m.fromH) }, { height: px(m.toH) }], { duration: D, easing: ease }),
          spacer.animate([{ marginTop: px(m.fromM) }, { marginTop: px(m.toM) }], { duration: D, easing: ease }),
          tabs.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
            { duration: 240, delay: next ? 100 : 180, easing: 'ease-out', fill: 'backwards' })
        ];
        if (!next && body) {
          enter.push(body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D, easing: 'ease-out' }));
        }
        head.style.overflow = 'hidden';
        spacer.hidden = false;
        fadeOut.forEach(function (a) { a.cancel(); });
        anims = enter;
        enter[0].onfinish = function () { if (id === run) settle(); };
      };
    }

    function update(animate) {
      // Compacting only applies where the whole header pins (desktop). On
      // narrow screens only the dropdown pins and the header is display:contents.
      if (!isSticky(head)) { setStuck(false); return; }
      setStuck(head.getBoundingClientRect().top <= 0.5, animate);
    }

    spacer.hidden = true;

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; update(true); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      // Heights change with width; measure again from the resting layout.
      setStuck(false);
      update();
    });
    update();

    function toPanelStart() {
      requestAnimationFrame(function () {
        var pinned = [head, dropdown].filter(isSticky)[0];
        var panel = firstVisibleAfter(head);
        if (!pinned || !panel) return;
        // Same space under the pinned box as the resting layout leaves. Its
        // pinned bottom, not its current one: a shorter panel can already have
        // the section's end pushing the header out.
        var gap = (parseFloat(getComputedStyle(head.parentNode).rowGap) || 0)
          + (parseFloat(getComputedStyle(pinned).marginBottom) || 0);
        var pinnedBottom = (parseFloat(getComputedStyle(pinned).top) || 0) + pinned.offsetHeight;
        var shortBy = pinnedBottom + gap - panel.getBoundingClientRect().top;
        if (shortBy > 1) {
          // Tells the nav (js/script.js) not to read this as scrolling up.
          window.rdNavIgnoreScroll = true;
          window.scrollTo({ top: window.pageYOffset - shortBy, behavior: 'instant' });
        }
      });
    }

    head.querySelectorAll('.rd-tabs .rd-tab').forEach(function (tab) {
      tab.addEventListener('click', toPanelStart);
    });
    if (dropdown) dropdown.addEventListener('change', toPanelStart);
  });
})();
