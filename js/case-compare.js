// Before/after image wipe. Two stacked images in one box; the top one is
// clipped to --rd-compare-pos with clip-path: inset(), and a full-bleed
// range input drives that variable.
//
// A range input rather than a mousedown/mousemove/touchmove trio: pointer
// drag, touch drag, focus and the arrow keys are all behaviour the element
// already has, so none of it is reimplemented here. The input is
// appearance:none with a transparent thumb — invisible, but still the thing
// being operated.
(function () {
  document.querySelectorAll('[data-compare]').forEach(function (box) {
    var range = box.querySelector('.rd-compare-range');
    if (!range) return;

    function apply() {
      box.style.setProperty('--rd-compare-pos', range.value + '%');
    }

    range.addEventListener('input', apply);

    // step="0.1" in the markup keeps the pointer drag smooth, but `step` also
    // sets the arrow-key increment — which would move the wipe 0.1% a press,
    // roughly a thousand presses to cross the image. So the keys are handled
    // at a usable size here and the fine step is left to the pointer.
    range.addEventListener('keydown', function (e) {
      var jump = {
        ArrowLeft: -5, ArrowRight: 5,
        ArrowDown: -5, ArrowUp: 5,
        PageDown: -20, PageUp: 20
      }[e.key];

      if (jump === undefined && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();

      var next = e.key === 'Home' ? 0
               : e.key === 'End' ? 100
               : Number(range.value) + jump;

      range.value = Math.min(100, Math.max(0, next));
      apply();
    });

    apply();
  });
}());
