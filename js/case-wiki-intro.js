// Retrospective intro — truncate the .rd-case-wiki-intro paragraph(s) above
// the lessons heading to 6 lines and put an inline "See more" link at
// the end of the cut text ("…text… See more"), with "See less" inline after
// the last paragraph once expanded. A CSS line-clamp can't do this: the
// toggle would have to sit outside the clamped box, on its own line. So the
// cut is computed here instead — word-level binary search on the paragraph's
// text until text + "… See more" fits the remaining lines. This assumes the
// intro paragraphs are plain text (no inline markup), which they all are;
// the original strings are kept and restored on every re-measure. Intros
// that fit in 6 lines never get a toggle.
(function () {
  var MAX_LINES = 6;
  var intros = [];

  document.querySelectorAll('.rd-case-wiki-intro').forEach(function (block) {
    var paras = Array.prototype.slice.call(block.querySelectorAll(':scope > p'));
    if (!paras.length) return;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'rd-case-wiki-intro-toggle';
    toggle.setAttribute('aria-expanded', 'false');

    var intro = {
      block: block,
      paras: paras,
      texts: paras.map(function (p) { return p.textContent.replace(/\s+/g, ' ').trim(); }),
      toggle: toggle,
      expanded: false,
      width: 0
    };

    toggle.addEventListener('click', function () {
      intro.expanded = !intro.expanded;
      render(intro);
      toggle.focus();
    });

    intros.push(intro);
  });

  if (!intros.length) return;

  function lineCount(p, lh) {
    return Math.round(p.getBoundingClientRect().height / lh);
  }

  function render(i) {
    i.width = i.block.clientWidth;
    i.paras.forEach(function (p, n) {
      p.hidden = false;
      p.textContent = i.texts[n];
    });

    var lh = parseFloat(getComputedStyle(i.paras[0]).lineHeight);
    var lines = i.paras.map(function (p) { return lineCount(p, lh); });
    var total = lines.reduce(function (a, b) { return a + b; }, 0);

    if (total <= MAX_LINES) {
      i.block.classList.remove('is-expanded');
      return;
    }

    i.toggle.setAttribute('aria-expanded', String(i.expanded));
    i.block.classList.toggle('is-expanded', i.expanded);

    if (i.expanded) {
      var last = i.paras[i.paras.length - 1];
      i.toggle.textContent = 'See less';
      last.append(' ', i.toggle);
      return;
    }

    // Find the paragraph the 6th line falls in, and how many lines it gets.
    var cut = 0;
    var used = 0;
    while (used + lines[cut] <= MAX_LINES) used += lines[cut++];
    var allowed = MAX_LINES - used;
    // Earlier paragraphs fill exactly 6 lines: cut the last of those instead,
    // so the toggle doesn't open a 7th line on its own.
    if (allowed === 0) allowed = lines[--cut];

    for (var n = cut + 1; n < i.paras.length; n++) i.paras[n].hidden = true;

    var p = i.paras[cut];
    var words = i.texts[cut].split(' ');
    var suffix = document.createTextNode('');
    i.toggle.textContent = 'See more';
    p.textContent = '';
    p.append(suffix, i.toggle);

    var lo = 0;
    var hi = words.length;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      suffix.textContent = words.slice(0, mid).join(' ') + '… ';
      if (lineCount(p, lh) <= allowed) lo = mid;
      else hi = mid - 1;
    }
    suffix.textContent = words.slice(0, lo).join(' ').replace(/[\s.,;:—–-]+$/, '') + '… ';
  }

  function renderAll() { intros.forEach(render); }

  renderAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderAll);

  // Re-measured on width change only — a mobile URL bar collapsing fires
  // resize without changing the line breaks.
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      intros.forEach(function (i) {
        if (i.block.clientWidth !== i.width) render(i);
      });
    }, 150);
  });
}());
