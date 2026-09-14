/*
  §03 "Current state of UX in Web3" — case-studies/web-3.html.
  The engine lives in js/pinned-deck.js, which must load first.
*/
(function () {
  'use strict';
  if (!window.rdPinnedDeck) return;
  window.rdPinnedDeck(document.querySelector('.rd-b6-fx'), {
    stage: '.rd-b6-fx-stage',
    cards: '.rd-b6-fx-card',
    countVar: '--rd-b6-fx-n'
  });
})();
