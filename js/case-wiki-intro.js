// Retrospective intro — clamp the .rd-case-wiki-intro paragraph(s) above
// "What I'd do differently" to 6 lines (see .rd-case-wiki-intro-text in
// redesign.css) and reveal a See more/See less toggle only when the text
// actually overflows that clamp. Generic over every `.rd-case-wiki-intro` on
// the page: wraps the block's existing <p> children into a
// .rd-case-wiki-intro-text element and appends the toggle button at
// runtime, so no case study markup needs a wrapper of its own — same
// shared-file pattern as js/case-picker.js.
(function () {
  var intros = [];

  document.querySelectorAll('.rd-case-wiki-intro').forEach(function (block) {
    var text = document.createElement('div');
    text.className = 'rd-case-wiki-intro-text';
    while (block.firstChild) text.appendChild(block.firstChild);
    block.appendChild(text);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'rd-case-wiki-intro-toggle';
    toggle.textContent = 'See more';
    toggle.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var expanded = block.classList.toggle('is-expanded');
      toggle.textContent = expanded ? 'See less' : 'See more';
      toggle.setAttribute('aria-expanded', String(expanded));
    });
    block.appendChild(toggle);

    intros.push({ block: block, text: text, toggle: toggle });
  });

  if (!intros.length) return;

  // Re-measured on resize, not just once: a paragraph that overflows six
  // lines at one viewport width may not at another.
  function sync() {
    intros.forEach(function (i) {
      if (i.block.classList.contains('is-expanded')) return;
      i.toggle.hidden = i.text.scrollHeight <= i.text.clientHeight + 1;
    });
  }

  requestAnimationFrame(sync);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sync, 150);
  });
}());
