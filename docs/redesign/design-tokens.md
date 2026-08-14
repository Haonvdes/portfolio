# Design Tokens — Portfolio Redesign

> **Source of truth: `css/styles/tokens.css`.**
> This document explains the *why*. It does not define values. If a number here
> ever disagrees with `tokens.css` or with what the page actually renders,
> **the rendered page wins** and this file is the thing that is wrong.

Last corrected: 2026-08-07.

## Read this before trusting any older copy of this file

Between 2026-08-02 and 2026-08-07 this document, and the `tokens.css` sitting
next to it in `docs/redesign/`, drifted badly out of sync with the live design
and were then used as a reference — which put wrong values into the v3 case
studies before the mistake was caught on screen.

What the stale copy said, against what the site actually renders:

| | stale docs copy | live | consequence |
|---|---|---|---|
| body font weight | `400` | **`500`** | body copy rendered visibly lighter than the rest of the site |
| page title size | `40px` | **`48px`** | case-study titles a full rung too small |
| `--lh-tight` | `1.1` | **`1.4`** | headings too cramped |
| primary text | `#131313` | **`#0a2a30`** | near-black instead of the deep teal ink |
| page background | `#f4f3ef` | **`#f3f3ef`** | one digit off |
| ink ramp | five steps, `--ink-900` → `--ink-100` | **one ink** | the tonal hierarchy was deliberately retired (see below) |

The lesson worth keeping: a documented token set that nothing imports will
drift, silently, and then read as authoritative. Which is why the values now
live in one imported stylesheet and this file only explains them.

## Where the values live

```
css/styles/tokens.css        ← SOURCE OF TRUTH. Imported by css/styles/style.css,
                               which every page loads.
css/styles/redesign.css      ← aliases them: --rd-fs-md: var(--fs-md), etc.
                               Do NOT put literal values back in its :root.
css/styles/case-retheme-v3.css ← consumes the canonical names directly.
```

`docs/redesign/tokens.css`, `site.css`, `home.css` and `index-standalone.html`
are an **archived early prototype**. Nothing links them and their values are
wrong. Don't read numbers out of them.

## Why not the Figma bound variables

The Figma file (`Wrapup`, node `40000102:8463` "Final Design") has a bound
variable library (`grey/G200`, `text/neutral/*`, …) but the rendered frames
don't use it consistently — the primary button, hero text and status tag all
carry raw hex fills that aren't tokenized in Figma. Per direction from Hao:
ignore the stale bound variables and anchor the token system on the colours
actually visible in the rendered design.

The same caution now applies to the legacy `tokens.css` variable set
(`--grey-G600`, `--blue-B700`, `--text-neutral-body`, …). Those still exist and
are still consumed by the 2021 pages, so they can't be deleted — but they are
not the redesign's palette.

## Colour

One ink, not a ramp. On 2026-08-03 every text tone collapsed onto a single deep
teal: headings, body, labels and captions are all `--rd-ink`. The old Figma
greys (`#131313` / `#000` / `#333` / `#374151` / `#4b5563`) survive only as
comments in `redesign.css`, in case the tonal hierarchy is ever wanted back.

| Token | Value | Use |
|---|---|---|
| `--rd-ink` | `#0a2a30` | every heading, body, label and caption |
| `--rd-ink-inverse` | `#ffffff` | text on a primary or dark fill |
| `--rd-primary` | `#01679c` | buttons, text buttons, links |
| `--rd-primary-hover` | `#014a70` | hover/pressed (not in Figma — darkened primary) |
| `--rd-surface` | `#f3f3ef` | section background |
| `--rd-white` | `#ffffff` | cards, elevated panels |
| `--rd-border` | `#666666` | card + stat-box border |
| `--rd-border-soft` | `#e5e7eb` | CTA top border, dividers |
| `--rd-border-muted` | `#999999` | inactive tab underline |
| `--rd-open` | `green` | `#opentowork` tag — literal `green` in the design |

Contrast: `--rd-ink` on `--rd-surface` passes AAA. White on `--rd-primary` is
~6.1:1, passing AA for normal text and UI components.

## Type

Two families. **DM Sans** for everything. **Raleway Bold** for the
"STEPHANO.NG" wordmark only — uppercase, `0.1em` tracking. Don't use it
anywhere else.

**Keep these in `px`, never `rem`.** `style.css` sets `html { font-size: 14px }`
globally and `port-2021.css` resets it to `16px`, so the same rem token resolves
to two different pixel sizes depending on which page loads it. This is not
hypothetical — it shipped, and made the whole scale render at 87.5% on
`web-3.html`.

| Token | Value | Use |
|---|---|---|
| `--fs-xs` | 12px | nav tagline, footer credentials, tags |
| `--fs-sm` | 14px | buttons, metadata, captions |
| `--fs-md` | 16px | body copy — the default |
| `--fs-lg` | 18px | case-study lead |
| `--fs-xl` | 20px | hero lead, journey blurb, impact card title |
| `--fs-2xl` | 24px | card + panel titles |
| `--fs-3xl` | 32px | section headings |
| `--fs-4xl` | 48px | page titles |

Sizes off this ladder (15/17/19/22/28/36/40px) survive only on the legacy
case-study pages and in responsive step-downs. They stay literal so they're easy
to spot and retire.

Three weights, by role. Before this was consolidated, the same role was set
differently per page — impact-card titles were 800 while the equivalent
pillar-card titles were 600, and eyebrows/stat numbers were split 700 vs 800.

| Token | Value | Use |
|---|---|---|
| `--fw-body` | 500 | all prose and UI text |
| `--fw-heading` | 600 | headings, card and section titles |
| `--fw-emphasis` | 700 | eyebrows, labels, stat numbers, inline strong |

| Token | Value | Use |
|---|---|---|
| `--lh-prose` | 1.6 | multi-line body copy meant to be read |
| `--lh-tight` | 1.4 | labels, captions, single-line UI text |
| `--lh-heading` | 1.3 | wrapping card titles |

`--measure: 778px` caps long-form line length (~97 characters at 16px).

## Layout

Figma frames are built on a 1920px canvas with a 1440px content column and
240px side margins. `--rd-shell: 1440px` reproduces the column.

## Using this when implementing a page

1. `css/styles/tokens.css` is already imported via `style.css` — you don't need
   to link it separately.
2. Use the token names in new CSS. Don't hardcode hex or px.
3. If a page needs a value that isn't on the scale, add it to `tokens.css` with
   a comment explaining the source, rather than hardcoding a one-off.
4. If you change a value, re-measure. The cheap check is to snapshot computed
   `font-size`/`font-weight`/`line-height`/`color` across every text element on
   `index.html`, `about.html` and `case-studies/healthcare.html` before and
   after, and diff. That is how the 2026-08-07 refactor was proven to change
   nothing on those three pages.
