---
name: figma-design-sync
description: Pull design data from this portfolio's Figma file and reconcile it against the codebase (tokens, fonts, colors, spacing) before implementing anything. Use whenever the user wants to check, sync, or implement something from Figma for this project, mentions a figma.com link for the homepage/about/case-study-framework, or asks "does the code match Figma" / "is this consistent with the design". Enforces: analyze code first, compare against Figma second, only then build — and only within this repo's three source-of-truth pages.
---

# Figma ↔ code consistency sync (this portfolio)

This project already has a mature token system and three pages that are the
**design source of truth**: `index.html` (homepage), `about.html`, and
`case-studies/case-study-framework.html`. The whole point of this skill is to
stop drift between Figma and code — never pull a value from Figma and drop it
into a rule as a literal without first checking whether it already exists as
a token.

Generic Figma skills (`figma-design-to-code`, `figma-use`, etc.) still govern
the *mechanics* of calling Figma MCP tools — load them as usual. This skill
adds a mandatory gate in front of them, specific to this repo.

## Scope guardrail — read this before touching anything

**In scope** (the only files this skill may edit):
- `index.html`, `about.html`, `case-studies/case-study-framework.html`
- `css/styles/tokens.css`, `css/styles/redesign.css` (the shared token/design layer these three pages run on)
- `templates/nav.html`, `templates/footer.html` (rendered globally by redesign.css's nav/footer rules, so a homepage/about nav fix touches these)

**Out of scope — do not touch unless the user explicitly names the file**:
`case-studies/lending*.html`, `healthcare.html`, `customer-engagement.html`,
`marketing-platform*.html`, `web-3*.html`, `work.html`,
`work-experience.html`, the legacy 2021 stylesheets, `case-legacy.css`,
`case-retheme-v3.css`. These are either frozen legacy pages or copies that
deliberately diverge — pulling homepage/about tokens into them is a
different task than this one.

If a request would require editing something outside this list, stop and
confirm with the user before proceeding.

## Known Figma node map

The file is Figma **"Wrapup"**. These node IDs are already transcribed into
code comments (`redesign.css` header, `about.html`/`index.html` section
comments, `case-study-framework.html` header) — reuse them instead of asking
the user to re-find nodes that are already documented:

| Page | Section | Node |
|---|---|---|
| Homepage | root | `40000028:3126` |
| Homepage | hero + nav | `40000031:5463` |
| Homepage | How I Create Impact | `40000031:5907` |
| Homepage | Selected Product Initiatives | `40000124:720` |
| Homepage | closing CTA + footer | `40000028:3230` |
| About | hero + nav | `40000188:5690` |
| About | My Path of Growth and Leadership | `40000113:8615` |
| About | What I've Learned Along the Way | `40000188:5716` |
| About | Professional Activities | `40000079:7055` |
| About | closing CTA + footer | `40000113:8484` |
| Case Study Framework | root | `40000221:3462` |

If the user gives a link/node not on this list, use it — then add it to this
table and to the relevant source comment (the file header in `redesign.css`
or the section comment in the HTML) once implemented, so the map stays
current for next time. If no link/node/selection is given at all and the ask
isn't covered by this table, ask the user for it rather than guessing a file.

## Workflow (do not skip or reorder steps)

### 1. Analyze code first

Before calling any Figma tool:

- Read `css/styles/tokens.css` `:root` block — the base ladder: `--fs-*`
  (12/14/16/18/20/24/32/48px), `--fw-*` (body 500 / heading 600 / emphasis
  700), `--lh-*`, `--m-*`/`--p-*`/`--r-*` spacing, and the color ramps
  (`--blue-*`, `--grey-*`, `--emerald-*`, `--red-*`, `--yellow-*`).
- Read the `:root` block at the top of `css/styles/redesign.css` — the
  `--rd-*` semantic layer actually used by the three source-of-truth pages
  (`--rd-ink`, `--rd-primary`, `--rd-surface`, `--rd-shadow-*`, etc.), plus
  any component-scoped custom properties near the rule you're about to touch.
- Grep the relevant section of the target page for existing markup/classes
  covering the area in question, so you know what already exists structurally.
- Write yourself a short inventory of what token(s) plausibly already cover
  the thing you're about to pull from Figma. This is what step 3 checks
  against.

### 2. Pull from Figma

Only now call `get_design_context` / `get_variable_defs` / `get_metadata` /
`get_screenshot` on the node(s) in scope (from the table above, or a link the
user gave). Follow the `figma-design-to-code` skill's mechanics for this.

### 3. Compare before building — mandatory gate

For every raw value Figma returns (px size, hex color, weight, spacing,
shadow), classify it against the step-1 inventory:

- **Exact match to an existing token** → reuse that token. Do not add
  anything new, do not write the raw value anywhere.
- **Near-duplicate, not an exact match** (e.g. Figma says `15px`, the ladder
  has `14px`/`16px`; a hex that's one bit off an existing `--rd-*` color) →
  this is a flag, not an auto-decision. The type/spacing ladder in this repo
  is deliberately closed — `tokens.css` states the off-ladder count should be
  zero. Surface the discrepancy to the user (Figma value vs. nearest token)
  instead of silently rounding or silently adding a new rung.
- **Genuinely new value with no existing token** (a one-off shadow, a brand
  new color actually used by the design) → only then define a new `--rd-*`
  custom property, following the existing convention in `redesign.css`:
  value plus a short comment giving the Figma node and the "why" (see how
  `--rd-primary-hover` and `--rd-market-*` are documented there).

Never write a literal hex/px/weight value directly into a CSS rule or inline
style when a token already exists for it — this is the same rule as the
`figma_tokens_over_literal_values` memory. Figma governs layout/structure/
assets; existing tokens govern color/type/spacing whenever a token already
covers the value.

Present the comparison (existing token vs. Figma value vs. verdict) before
writing implementation code, especially for the near-duplicate and
genuinely-new cases — don't build past this gate silently.

### 4. Implement

- Edit only within the scope guardrail above.
- Match the existing comment style in `redesign.css` (node id + short
  rationale) for any new token or rule.
- After implementing, re-scan the touched files for stray literals that
  duplicate a token (`font-size:`, `color:`, `#[0-9a-f]{3,6}` not wrapped in
  `var(...)`) and fix any you introduced.
