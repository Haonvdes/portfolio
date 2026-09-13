/* Aura's two phases for the adoption-curve block on web-3.html §04, read by
   js/web3-chasm.js. `side` matches the data-side attributes on the chart. */

window.W3C_CHASM = {
  phases: [
    {
      name: 'Early market', side: 'early',
      goal: 'Make the chain look credible to backers: a brand, a social presence, and research into who Aura was for.',
      facts: [
        { k: 'Purpose', v: 'Fund raise' },
        { k: 'Adopter share', v: '16%' },
        { k: 'Designed for', v: 'Backers' },
        { k: 'Needs', v: 'Minimum feature set' }
      ]
    },
    {
      name: 'Mainstream market', side: 'main',
      goal: 'Move the work into the products: interfaces and one design system across every surface, checked against real users.',
      facts: [
        { k: 'Purpose', v: 'Mass adoption' },
        { k: 'Adopter share', v: '84%' },
        { k: 'Designed for', v: 'Non-experts' },
        { k: 'Needs', v: 'Whole product' }
      ]
    }
  ]
};
