/*
  Selected Product Initiatives — tab strip (Figma 40000132:3660).

  Self-contained and defensive: does nothing on pages without a [role="tablist"]
  inside .rd-initiative-wrap, so it is safe to load anywhere.

  Implements the APG tabs pattern: click to select, Left/Right/Home/End to move
  between tabs, roving tabindex so the strip is a single tab stop.
*/
(function () {
  "use strict";

  function initTabs(tablist) {
    var tabs = Array.prototype.slice.call(
      tablist.querySelectorAll('[role="tab"]')
    );
    if (!tabs.length) return;

    function panelFor(tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var isTarget = t === tab;
        var panel = panelFor(t);

        t.setAttribute("aria-selected", isTarget ? "true" : "false");
        t.tabIndex = isTarget ? 0 : -1;

        if (panel) {
          panel.classList.toggle("is-active", isTarget);
          if (isTarget) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        }
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;

      tab.addEventListener("click", function () {
        select(tab, false);
      });

      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });
  }

  function init() {
    var lists = document.querySelectorAll('.rd-initiative-wrap [role="tablist"]');
    Array.prototype.forEach.call(lists, initTabs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
