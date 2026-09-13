/* Release phases for healthcare.html §04, read by js/phase-decision.js.
   `tiers` is fixed; `phases[i].moscow` is keyed by the same four ids. */

window.B3_DECISION = {
  tiers: [
    { id: 'must',   label: 'Must' },
    { id: 'should', label: 'Should' },
    { id: 'could',  label: 'Could' },
    { id: 'wont',   label: 'Won’t' }
  ],

  phases: [
    {
      step: 'Phase 1', name: 'MVP',
      goal: 'One program goes the whole way on a single record: requested, approved, funded, contracted, run and closed.',
      facts: [
        ['Roles with screens', '4 of 17'],
        ['Workflow areas', '6 of 13'],
        ['Done when', 'One program closes']
      ],
      moscow: {
        must:   ['Program request: raise, route, approve', 'Budget allocation and charges', 'Speaker nomination and contracting', 'Event-day check-in and attestation', 'One program record every role reads'],
        should: ['A rep dashboard that opens on a to-do list', 'Venue booking inside the request'],
        could:  ['Clone last year’s program', 'Saved drafts'],
        wont:   ['Expense, billing and payment', 'Reconciliation', 'Screens for roles that only read the record']
      }
    },
    {
      step: 'Phase 2', name: 'UAT',
      goal: 'The four roles that own a program run real ones through the MVP before anyone else touches it.',
      facts: [
        ['Roles with screens', '4 of 17'],
        ['Workflow areas', '6 of 13'],
        ['Done when', 'Owner roles sign off']
      ],
      moscow: {
        must:   ['A program closed end to end by the four owner roles', 'Charges that match the budget on every test program', 'A reason on every rejection'],
        should: ['Fixes wherever testers stall on the request form'],
        could:  ['Wording and label clean-up'],
        wont:   ['New features. Anything new goes to the Post-MVP backlog']
      }
    },
    {
      step: 'Phase 3', name: 'Release 1',
      goal: 'The MVP goes live for the roles that carry a program from request to closed event.',
      facts: [
        ['Roles with screens', '4 of 17'],
        ['Workflow areas', '6 of 13'],
        ['Status', 'Live, June 2026']
      ],
      moscow: {
        must:   ['Request, budget, contracting and event day, live', 'Access scoped to the four owner roles'],
        should: ['Rep dashboard', 'Venue booking'],
        could:  ['Saved drafts'],
        wont:   ['Screens for roles that only read the record', 'Expense, billing and payment']
      }
    },
    {
      step: 'Phase 4', name: 'UAT',
      goal: 'The Post-MVP areas get tested by the roles that settle and audit a program: accounting, compliance and auditors.',
      facts: [
        ['Roles with screens', '17 of 17'],
        ['Workflow areas', '13 of 13'],
        ['Done when', 'Every role signs off']
      ],
      moscow: {
        must:   ['Expense forms and payment against real charges', 'Reconciliation that balances to the budget', 'An audit trail compliance can read'],
        should: ['Operational reports'],
        could:  ['Inquiry handling'],
        wont:   ['Changes to the live request flow, unless UAT breaks it']
      }
    },
    {
      step: 'Phase 5', name: 'Release 2',
      goal: 'The seven Post-MVP workflow areas go live, and every role gets its own screen on the same record.',
      facts: [
        ['Roles with screens', '17 of 17'],
        ['Workflow areas', '13 of 13'],
        ['Done when', 'All 17 roles live']
      ],
      moscow: {
        must:   ['Expense, billing and payment', 'Reconciliation', 'Screens for all seventeen roles'],
        should: ['Reporting', 'Inquiry'],
        could:  ['Onboarding', 'Speaker and library self-service'],
        wont:   ['A 102-column report. That was the old workaround, not the requirement']
      }
    }
  ]
};
