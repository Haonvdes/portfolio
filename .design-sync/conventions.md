# stpnguyen.com — how to build with this design system

This is a **CSS-only** design system: no React components, `window.StpPortfolio` is empty.
Everything is plain HTML elements styled with CSS custom properties and `.rd-*` classes.
Build your own markup (JSX or HTML) and apply these classes and tokens. Never invent new
`--rd-*` tokens or `.rd-*` class names — if nothing fits, use inline styles built from the
tokens below.

## Setup

`styles.css` carries everything: tokens, the `.rd-*` rules, and the web fonts (DM Sans,
Manrope via Google Fonts). It also sets global resets — `html` is 14px, and legacy
Bootstrap grid classes (`.container`, `.row`, `.col-*`) are present. Set text in
`var(--rd-font)` explicitly on your root; body copy is **weight 500**, not 400.

## Tokens (use `var(--name)`)

| Role | Tokens |
|---|---|
| Text | `--rd-ink` (all headings + body), `--rd-ink-muted` (captions), `--rd-ink-inverse` |
| Brand | `--rd-primary` (buttons, links), `--rd-primary-hover` |
| Surfaces | `--rd-white`, `--rd-surface` (tinted section bg), `--rd-tint`, `--rd-panel-tint` |
| Lines | `--rd-line` (hairlines), `--rd-border`, `--rd-border-soft`, `--rd-border-muted` |
| Font family | `--rd-font`, `--rd-font-mono` |
| Size | `--rd-fs-xs` 12 · `-sm` 14 · `-md` 16 (body) · `-lg` 18 · `-xl` 20 · `-2xl` 24 · `-3xl` 32 · `-4xl` 48 |
| Weight | `--rd-fw-body` 500 · `--rd-fw-heading` 600 · `--rd-fw-emphasis` 700 |
| Line height | `--rd-lh-prose` 1.6 · `--rd-lh-tight` 1.4 · `--rd-lh-heading` 1.3 |
| Layout | `--rd-shell` 1440px column, `--rd-measure` 778px max prose width |
| Shadow | `--rd-shadow-card`, `--rd-shadow-nav` |
| Spacing | `--p-4` … `--p-80` (padding), `--m-4` … `--m-80` (margin), `--r-4` … `--r-40` (radius) |

Use only these sizes and three weights — the live site has zero off-scale font sizes.
Chart/categorical colours exist (`--rd-severity-critical|notable|attention|minor`,
`--rd-market-a|b|subject|rest`) for data graphics only.

## Classes

- **Layout:** `.rd-shell` (centred 1440px column), `.rd-grid` (page inset — one per
  nesting chain; use `.rd-grid-inner` when nested), `.rd-grid-bleed` (break out to full width).
- **Buttons:** always `.rd-btn` plus a variant — `.rd-btn-primary` (filled) or
  `.rd-btn-text` (text link). Works on `<a>` and `<button>`.
- **Case-study page:** `body.rd-case` → `header.rd-case-hero` with `h1.rd-case-title` and
  `p.rd-case-lead` → `section.rd-case-section` (add `.is-tinted` for the `--rd-surface`
  band) → `div.rd-case-inner.rd-shell` → `h2.rd-case-h2`.
- **Facts row:** `.rd-case-snapshot` holding pairs of `span.rd-case-meta-k` (label) and
  `span.rd-case-meta-v` (value).
- **Stat row:** `.rd-ai-evi` > `.rd-ai-evi-stat` > `<strong>` number + `<span>` caption.
- **Cards:** `.rd-case-card`, `.rd-related-card`, `.rd-impact-card`.

## Where the truth lives

Read `_ds_bundle.css` before styling: the `:root` blocks hold every token with comments
on its role, and each `.rd-*` rule shows how a pattern is meant to look.

## Example

```jsx
<section className="rd-case-section is-tinted">
  <div className="rd-case-inner rd-shell">
    <h2 className="rd-case-h2">Overview</h2>
    <div className="rd-case-snapshot">
      <div><span className="rd-case-meta-k">Role</span><span className="rd-case-meta-v">UX Lead</span></div>
      <div><span className="rd-case-meta-k">Team</span><span className="rd-case-meta-v">22 members</span></div>
    </div>
    <div className="rd-ai-evi">
      <div className="rd-ai-evi-stat"><strong>793</strong><span>programs a year</span></div>
    </div>
    <a className="rd-btn rd-btn-primary" href="#">Read the case study</a>
  </div>
</section>
```
