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
  function wireGroups(groupSelector, tabSelector, toggleActiveClass) {
    document.querySelectorAll(groupSelector).forEach(function (group) {
      var tabs = group.querySelectorAll(tabSelector);

      function select(tab) {
        tabs.forEach(function (t) {
          var active = t === tab;
          if (toggleActiveClass) { t.classList.toggle('is-active', active); }
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { select(tab); });
      });
    });
  }

  wireGroups('.rd-case-tabs', '.rd-case-tab', true);
  wireGroups('.rd-tabs:not(.rd-bench-views)', '.rd-tab', false);
}());
