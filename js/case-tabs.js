// Generic tab-group wiring for case study pages. Two patterns share one file
// because they are the same behaviour (click a tab, show its panel, aria-select
// follows) with different class names:
//   .rd-case-tabs   > .rd-case-tab   (also toggles .is-active on the tab)
//   .rd-tabs        > .rd-tab        (skips any .rd-bench-views group — those
//                                      are wired by a page's own bench/findings
//                                      script, which swaps a chart inside one
//                                      shared panel rather than hiding/showing
//                                      panels by id)
//
// Both loops are scoped PER GROUP, not queried globally across the page. A
// page with two tab groups of the same pattern must not have clicking one
// group's tab hide/show a panel that belongs to the other group — that was a
// real bug (customer-engagement-v3.html, 2026-08-25, fixed there first) that
// this shared file now fixes everywhere at once, including in
// templates/case-study-v3.template.html so new case studies never regress to
// the unscoped version.
(function () {
  // Custom mobile dropdown (see .rd-tabs-dropdown in redesign.css, TAB STRIP
  // section) — the `<select>` it replaced couldn't have its open-state
  // listbox restyled at all, native chevron included, so this rebuilds it as
  // a plain button + `role="listbox"` panel. It exposes the same `.value`
  // getter/setter and dispatches the same `change` event a real `<select>`
  // would, so wireGroups() below and every page's own `tabSelect.value = …`
  // wiring needs no changes beyond the class rename.
  function wireDropdowns() {
    document.querySelectorAll('.rd-tabs-dropdown').forEach(function (el) {
      var toggle = el.querySelector('.rd-tabs-dropdown-toggle');
      var valueEl = toggle && toggle.querySelector('[data-tabs-dropdown-value]');
      var panel = el.querySelector('.rd-tabs-dropdown-panel');
      var options = Array.prototype.slice.call(el.querySelectorAll('.rd-tabs-dropdown-option'));
      if (!toggle || !valueEl || !panel || !options.length) { return; }

      // Fixed group description ("Findings, three views") set in the markup;
      // the value that follows it is appended fresh on every selection so
      // a screen reader gets both the group and the current choice, the way
      // a native select's label + selected option would read together.
      var baseLabel = toggle.getAttribute('aria-label') || '';

      function isOpen() { return el.classList.contains('is-open'); }
      function currentOption() {
        return options.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || options[0];
      }

      function open() {
        el.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        currentOption().focus();
        document.addEventListener('click', onOutsideClick, true);
        document.addEventListener('keydown', onKeydown);
      }
      function close(returnFocus) {
        el.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', onOutsideClick, true);
        document.removeEventListener('keydown', onKeydown);
        if (returnFocus) { toggle.focus(); }
      }
      function onOutsideClick(e) { if (!el.contains(e.target)) { close(false); } }
      function onKeydown(e) {
        if (e.key === 'Escape') { close(true); return; }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') { return; }
        e.preventDefault();
        var i = options.indexOf(document.activeElement);
        if (i === -1) { i = 0; }
        options[(i + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length].focus();
      }

      toggle.addEventListener('click', function () { if (isOpen()) { close(false); } else { open(); } });

      function selectValue(value, dispatch) {
        var match = null;
        options.forEach(function (o) {
          var on = o.dataset.value === value;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          if (on) { match = o; }
        });
        if (!match) { return; }
        valueEl.textContent = match.textContent;
        toggle.setAttribute('aria-label', baseLabel ? baseLabel + ': ' + match.textContent : match.textContent);
        el._value = value;
        if (dispatch) { el.dispatchEvent(new Event('change')); }
      }

      options.forEach(function (o) {
        o.addEventListener('click', function () { selectValue(o.dataset.value, true); close(true); });
        o.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectValue(o.dataset.value, true); close(true); }
        });
      });

      el._value = currentOption().dataset.value;
      Object.defineProperty(el, 'value', {
        get: function () { return el._value; },
        set: function (v) { selectValue(v, false); }
      });
    });
  }
  wireDropdowns();

  function wireGroups(groupSelector, tabSelector, toggleActiveClass) {
    document.querySelectorAll(groupSelector).forEach(function (group) {
      var tabs = group.querySelectorAll(tabSelector);
      // Mobile dropdown fallback (see .rd-tabs-collapsible in redesign.css):
      // opt-in per group by placing a `.rd-tabs-dropdown` right after the
      // group, its option `data-value`s matching each tab's own id. A group
      // with no such sibling (healthcare.html's Yes/No .rd-ai-toggle) is
      // untouched.
      var mobileSelect = group.nextElementSibling;
      if (!mobileSelect || !mobileSelect.classList.contains('rd-tabs-dropdown')) { mobileSelect = null; }

      function select(tab) {
        tabs.forEach(function (t) {
          var active = t === tab;
          if (toggleActiveClass) { t.classList.toggle('is-active', active); }
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
        });
        if (mobileSelect) { mobileSelect.value = tab.id; }
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { select(tab); });
      });

      if (mobileSelect) {
        mobileSelect.addEventListener('change', function () {
          var tab = document.getElementById(mobileSelect.value);
          if (tab) { select(tab); }
        });
      }
    });
  }

  wireGroups('.rd-case-tabs', '.rd-case-tab', true);
  wireGroups('.rd-tabs:not(.rd-bench-views)', '.rd-tab', false);
}());
