/* Step-through sequence model for healthcare.html §05 ("The model"), read by
   js/ai-model-flow.js. Lanes are places a change passes through, left to right;
   `rows` are the actions between them, in time order; `steps[n]` is the whole
   picture at step n — which rows are lit and what every badge reads.

   State is not accumulated: a row's tone comes from its index against the
   current step's `current` list, so jumping straight to step 6 renders the
   same as stepping there.

   Branch, token and component names follow the git-flow graph that already sits
   in the same section of healthcare.html — one set of names for both.

   >>> OPEN: lane and step copy follows the git-flow graph already on the page.
   Real branch names for the speaker-bureau build are not confirmed. */

window.AI_MODEL_FLOW = {

  zones: [
    { id: 'design',  label: 'Design',   span: 4 },
    { id: 'build',   label: 'Build',    span: 2 },
    { id: 'live',    label: 'Live',     span: 1 }
  ],

  lanes: [
    { id: 'system',  name: 'Design system',  sub: 'tokens · components' },
    { id: 'ca',      name: 'concept-a',      sub: 'AI prototype' },
    { id: 'cb',      name: 'concept-b',      sub: 'AI prototype' },
    { id: 'preview', name: 'Preview link',   sub: 'deploy preview' },
    { id: 'feature', name: 'feature',        sub: 'this feature' },
    { id: 'dev',     name: 'dev',            sub: 'integration' },
    { id: 'main',    name: 'main',           sub: 'production' }
  ],

  /* kind: 'note' draws a dashed box on its lanes instead of an arrow.
     auto: true draws a dashed arrow — it happens without anyone doing it. */
  rows: [
    { id: 'a', label: 'brief · AI drafts both', kind: 'note', lanes: ['ca', 'cb'] },
    { id: 'b', label: 'build on tokens v8 · components v14', arrows: [['system', 'ca'], ['system', 'cb']] },
    { id: 'c', label: 'preview builds itself', auto: true, arrows: [['ca', 'preview'], ['cb', 'preview']] },
    { id: 'd', label: '5 sessions · flow A preferred', arrows: [['preview', 'ca'], ['preview', 'cb']] },
    { id: 'e', label: 'merge at the gate', arrows: [['ca', 'feature']] },
    { id: 'f', label: 'rebuild on production components', arrows: [['system', 'feature']] },
    { id: 'g', label: 'merge to dev', arrows: [['feature', 'dev']] },
    { id: 'h', label: 'release', auto: true, arrows: [['dev', 'main']] }
  ],

  /* The × on concept-b's lifeline, and the row it sits under. */
  closes: { lane: 'cb', afterRow: 'd' },

  steps: [
    {
      key: 'baseline', label: 'Baseline',
      title: 'Everything is at checkout v1',
      body: 'Seven places, read left to right: design on the left, the shared branches in the middle, production on the right. Tokens, components and every branch sit at the same version. Step through to watch one idea cross the whole line.',
      callout: { title: 'The rule', body: 'Nothing reaches production because it looked right in a design file. It gets there as code, on the same tokens the live app runs on.' },
      current: [],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'base' }, { text: 'components v14', tone: 'base' }],
        ca:      [{ text: 'no branch', tone: 'base' }],
        cb:      [{ text: 'no branch', tone: 'base' }],
        preview: [{ text: 'nothing yet', tone: 'base' }],
        feature: [{ text: 'not cut', tone: 'base' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'brief', label: 'Brief',
      title: 'Two directions, drafted at once',
      body: 'The designer writes the brief; AI drafts both directions as code rather than pictures. <code>concept-a</code> is the single-page flow, <code>concept-b</code> the stepper. Nothing else on the line knows about either one yet.',
      code: { caption: 'Both branches open the same way', lines: ['git switch -c design/concept-a', 'git switch -c design/concept-b'] },
      callout: { title: 'Notice', body: 'Two branches, not one. A direction that only gets described always loses to a direction that runs.' },
      current: ['a'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'base' }, { text: 'components v14', tone: 'base' }],
        ca:      [{ text: 'draft', tone: 'open' }],
        cb:      [{ text: 'draft', tone: 'open' }],
        preview: [{ text: 'nothing yet', tone: 'base' }],
        feature: [{ text: 'not cut', tone: 'base' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'prototype', label: 'Prototype',
      title: 'Both built on the real foundation',
      body: 'Each prototype is built on <code>tokens v8</code> and <code>components v14</code> — the same spacing, colour and components the product already uses. Placeholder data, real styling.',
      callout: { title: 'Check first', body: 'A prototype with its own colours and spacing tests the prototype. Only one on the real tokens tests the design.' },
      current: ['b'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v14', tone: 'done' }],
        ca:      [{ text: 'flow A runs', tone: 'current' }],
        cb:      [{ text: 'flow B runs', tone: 'current' }],
        preview: [{ text: 'nothing yet', tone: 'base' }],
        feature: [{ text: 'not cut', tone: 'base' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'preview', label: 'Preview',
      title: 'Each branch publishes its own link',
      body: 'Every push builds a preview. Nobody assembles a deck and nobody books a walkthrough — a participant opens a URL and uses the thing.',
      callout: { title: 'The dashed arrows', body: 'Dashed means nobody did it. The push was the publish.' },
      current: ['c'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v14', tone: 'done' }],
        ca:      [{ text: 'flow A runs', tone: 'done' }],
        cb:      [{ text: 'flow B runs', tone: 'done' }],
        preview: [{ text: 'both flows', tone: 'current' }],
        feature: [{ text: 'not cut', tone: 'base' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'test', label: 'Test',
      title: 'Five sessions, one direction left',
      body: 'Both flows go into the same round of five sessions. Flow A is preferred. Flow B loses people on step two, so <code>concept-b</code> closes without merging.',
      callout: { title: 'What the branch cost', body: 'A few days of design and AI time — not a shipped feature that has to be walked back.' },
      current: ['d'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v14', tone: 'done' }],
        ca:      [{ text: 'flow A wins', tone: 'current' }],
        cb:      [{ text: 'closed', tone: 'dead' }],
        preview: [{ text: 'both flows', tone: 'done' }],
        feature: [{ text: 'not cut', tone: 'base' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'gate', label: 'Gate',
      title: 'The winner merges into the feature',
      body: 'The feature branch is cut and <code>concept-a</code> merges into it as reference. Layout, copy and interaction come across.',
      code: { caption: 'What the merge is', lines: ['git switch feature/checkout', 'git merge design/concept-a'] },
      callout: { title: 'What does not cross', body: 'State handling, real payment calls, error paths. A prototype skips all three, which is why it is fast.' },
      current: ['e'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v14', tone: 'done' }],
        ca:      [{ text: 'merged', tone: 'done' }],
        cb:      [{ text: 'closed', tone: 'dead' }],
        preview: [{ text: 'both flows', tone: 'done' }],
        feature: [{ text: 'prototype in', tone: 'current' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'rebuild', label: 'Rebuild',
      title: 'Prototype markup out, production components in',
      body: 'The scaffolding is swapped for the component library, which has moved to <code>v15</code> in the meantime. Same layout, real code underneath. Payment logic, loading and error states and tests all land here.',
      callout: { title: 'The honest part', body: 'The prototype never ships. What ships is the thing rebuilt on top of what the prototype proved.' },
      current: ['f'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v15', tone: 'current' }],
        ca:      [{ text: 'merged', tone: 'done' }],
        cb:      [{ text: 'closed', tone: 'dead' }],
        preview: [{ text: 'both flows', tone: 'done' }],
        feature: [{ text: 'rebuilt', tone: 'current' }],
        dev:     [{ text: 'checkout v1', tone: 'base' }],
        main:    [{ text: 'v1 · live', tone: 'base' }]
      }
    },
    {
      key: 'ship', label: 'Ship',
      title: 'Everything is at checkout v2',
      body: 'The feature merges to <code>dev</code>, <code>dev</code> releases to <code>main</code>, and the release builds itself. Every place is at v2 — the same picture as the start, one version later. The next feature takes the same path.',
      callout: { title: 'What the user gets', body: 'A faster checkout. The prototyping, the flow that was cut and the rebuild are all invisible from here.' },
      current: ['g', 'h'],
      badges: {
        system:  [{ text: 'tokens v8', tone: 'done' }, { text: 'components v15', tone: 'done' }],
        ca:      [{ text: 'merged', tone: 'done' }],
        cb:      [{ text: 'closed', tone: 'dead' }],
        preview: [{ text: 'both flows', tone: 'done' }],
        feature: [{ text: 'merged', tone: 'done' }],
        dev:     [{ text: 'checkout v2', tone: 'current' }],
        main:    [{ text: 'v2 · live', tone: 'current' }]
      }
    }
  ],

  legend: [
    { tone: 'current', text: 'this step' },
    { tone: 'done',    text: 'done' },
    { tone: 'pending', text: 'not yet' },
    { tone: 'done', auto: true, text: 'happens by itself' }
  ]
};
