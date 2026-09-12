// Feature pickers — click a row, the row goes active and the render beside it
// cross-fades to that row's data-image. Generic over every
// `.rd-case-checklist[data-picker]` on the page.
//
// Embed-aware: a row with NO data-image means "show the iframe inside this
// picker's figure instead" (see the Marvel prototype row in
// lending-new-v3.html's #homepage). Pages with no iframe in the figure never
// hit that branch — `embed` is just null and every embed-only line is a
// no-op — so this one file is a safe superset of the plainer picker that used
// to be duplicated, unchanged, into customer-engagement-v3.html and
// templates/case-study-v3.template.html. Keeping one copy means a future
// fix here reaches every case study, instead of landing in whichever file
// happened to get edited.
//
// Centralised 2026-09-10: case-study-framework.html, marketing-platform-v3.html
// and web-3-v3.html each carried a byte-identical inline copy of an OLDER
// version of this loop — no embed branch — so the same data-picker markup
// behaved differently depending on which page it sat on, and nothing in the
// markup or the CSS said so. Those copies are gone. Add behaviour here, never
// in a page.
(function () {
  document.querySelectorAll('.rd-case-checklist[data-picker]').forEach(function (picker) {
    var image = document.getElementById(picker.dataset.picker);
    if (!image) return;
    var figure = image.closest('.rd-case-figure');
    var embed = figure ? figure.querySelector('iframe') : null;
    var rows = picker.querySelectorAll('.rd-case-checklist-row');

    function select(row) {
      rows.forEach(function (r) {
        r.classList.toggle('is-active', r === row);
        r.setAttribute('aria-selected', r === row ? 'true' : 'false');
      });

      var src = row.dataset.image;

      if (!src) {
        // No image and no iframe to fall back to (a row whose screenshot does
        // not exist yet): keep whatever is showing rather than hide the image
        // and leave the panel blank.
        if (!embed) return;
        embed.hidden = false;
        image.hidden = true;
        if (figure) figure.classList.add('is-embed');
        return;
      }

      if (embed) embed.hidden = true;
      if (figure) figure.classList.remove('is-embed');
      image.hidden = false;
      if (src === image.getAttribute('src')) return;
      image.style.opacity = 0;
      setTimeout(function () {
        image.src = src;
        image.style.opacity = 1;
      }, 150);
    }

    // Hover selects too, on pointer devices only. It is deliberately layered
    // ON TOP of click rather than replacing it: hover reaches neither touch nor
    // keyboard, so click and Enter/Space stay the definition of "select" and
    // hover just calls into the same select(). Gated on (hover: hover) so a
    // touch device never fires it from a tap's synthetic mouseenter.
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    rows.forEach(function (row) {
      row.addEventListener('click', function () { select(row); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(row); }
      });
      if (canHover) {
        row.addEventListener('mouseenter', function () {
          if (!row.classList.contains('is-active')) select(row);
        });
      }
    });
  });
}());
