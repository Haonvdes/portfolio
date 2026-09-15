// GA4 + GTM loader and site events. Replaces the inline gtag/GTM snippets.
//
// Tags load only on the live domain, so localhost previews, scripts/shot.py
// renders and the resume PDF build (file://) never count as visits.
// URL switches, remembered per browser:
//   ?analytics=off    stop tracking this browser (your own visits)
//   ?analytics=on     undo that
//   ?analytics=debug  log every event to the console, on any host
// Must stay a plain synchronous <script> in <head>: the page_view fires from here.
(function () {
  var GA_ID = 'G-7VM3QDKCYW';
  var GTM_ID = 'GTM-PF5XGDGK';

  var params = new URLSearchParams(location.search);
  var mode = params.get('analytics');
  function store(kind, key, value) {
    try {
      var s = window[kind];
      if (value === undefined) { return s.getItem(key); }
      if (value === null) { s.removeItem(key); } else { s.setItem(key, value); }
    } catch (e) { return null; }
  }
  if (mode === 'off') { store('localStorage', 'rd-analytics-off', '1'); }
  if (mode === 'on') { store('localStorage', 'rd-analytics-off', null); }
  if (mode === 'debug') { store('sessionStorage', 'rd-analytics-debug', '1'); }

  var live = /(^|\.)stpnguyen\.com$/.test(location.hostname) &&
    store('localStorage', 'rd-analytics-off') !== '1';
  var debug = store('sessionStorage', 'rd-analytics-debug') === '1';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Clarity itself is injected by a Custom HTML tag in the GTM container. Its
  // snippet keeps an existing window.clarity, so calls queued here are replayed.
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };

  function inject(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  if (live) {
    gtag('js', new Date());
    gtag('config', GA_ID);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    inject('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    inject('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);
  }

  function track(name, data) {
    if (debug) { console.log('[analytics]', name, data || {}); }
    if (!live) { return; }
    gtag('event', name, data || {});
    window.clarity('event', name);
  }

  // GA4 reads UTM tags on its own. Clarity only sees them on the landing page,
  // so they are carried through the session and set as Clarity tags on every page.
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
    if (params.get(k)) { utm[k] = params.get(k); }
  });
  if (Object.keys(utm).length) {
    store('sessionStorage', 'rd-utm', JSON.stringify(utm));
  } else {
    try { utm = JSON.parse(store('sessionStorage', 'rd-utm') || '{}'); } catch (e) { utm = {}; }
  }
  if (live) {
    Object.keys(utm).forEach(function (k) { window.clarity('set', k, utm[k]); });
  }

  var page = location.pathname.replace(/^\/+|\.html$/g, '') || 'index';

  function text(el) {
    return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function linkLocation(el) {
    if (el.closest('#nav-placeholder')) { return 'nav'; }
    if (el.closest('#footer-placeholder')) { return 'footer'; }
    if (el.closest('.rd-related')) { return 'related'; }
    if (el.closest('.cv-page')) { return 'resume'; }
    return 'page';
  }

  // Delegated on document: nav and footer are injected after load by script.js.
  document.addEventListener('click', function (e) {
    // Scripts that sync one control to another call .click(); count people only.
    if (!e.isTrusted || !(e.target instanceof Element)) { return; }

    var action = e.target.closest('.cv-actions a, .cv-actions button');
    if (action) {
      var label = (action.getAttribute('aria-label') || '').toLowerCase();
      if (label.indexOf('download') !== -1) { track('resume_action', { action: 'download' }); }
      if (label.indexOf('share') !== -1) { track('resume_action', { action: 'share' }); }
      return; // print is counted by beforeprint below, which also catches Cmd+P
    }

    var tab = e.target.closest('[role="tab"], [role="option"], [aria-pressed], .rd-tab, .rd-case-tab');
    if (tab) {
      var section = tab.closest('section[id]');
      track('tab_select', { section_id: section ? section.id : '', tab_label: text(tab) });
      return;
    }

    var link = e.target.closest('a[href]');
    if (!link) { return; }
    var href = link.getAttribute('href');
    var where = linkLocation(link);
    // Resolved URL, not the attribute: related cards link with ./lending.html.
    var caseMatch = link.href.match(/\/case-studies\/([a-z0-9-]+)\.html/);

    if (/^mailto:/i.test(href)) {
      track('contact_click', { method: 'email', link_location: where });
    } else if (/linkedin\.com/i.test(href)) {
      track('contact_click', { method: 'linkedin', link_location: where });
    } else if (/resume/i.test(href)) {
      track('resume_open', { format: /\.pdf$/i.test(href) ? 'pdf' : 'html', link_location: where });
    } else if (caseMatch && page !== 'case-studies/' + caseMatch[1]) {
      track('case_open', { case_slug: caseMatch[1], from_page: page, link_location: where });
    }
  });

  window.addEventListener('beforeprint', function () {
    if (document.querySelector('.cv-actions')) { track('resume_action', { action: 'print' }); }
  });

  // A section counts as read once it has sat in the top half of the viewport
  // for a second, so jumping past it from the table of contents does not count.
  function watchSections() {
    var sections = document.querySelectorAll('section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) { return; }
    var timers = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (entry.isIntersecting) {
          timers[id] = setTimeout(function () {
            track('section_view', { section_id: id });
            observer.unobserve(entry.target);
          }, 1000);
        } else {
          clearTimeout(timers[id]);
        }
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchSections);
  } else {
    watchSections();
  }
})();
