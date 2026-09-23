# Theme system — plan of record

Branch: `theme-system`. Phase 1 (cleanup) is done and committed. Phases 2–4 are pending.

Measurements in this doc were taken 2026-09-23 with Chrome, at 1440px, by testing every
CSS selector in every loaded sheet against each page's live DOM after a full scroll pass.
Re-measure before acting on any number here.

---

## Phase 1 — Cleanup ✅ DONE

| Removed | Amount |
|---|---|
| `js/bootstrap.js`, `bootstrap.bundle.js`, both `.min` | 11,460 lines |
| `js/process.js` | 33 lines |
| `css/styles/responsive.css` | empty file |
| Orphaned images in `public/` | 118 files, 53 MB |
| `node_modules` untracked from git | 5,122 files |
| Dead `.rd-philosophy-*` / `.rd-pillar-*` rules | 59 lines |
| Dangling `@import url(./chatbox.css)` in `style.css` | a 404 on every page load |

Verified: 64 page/width layout fingerprints identical before vs after; zero broken local
assets across all 8 pages.

**Not done, deliberately:**

- `app.js` / `frontend.js` / `spotify-reauth.js` — an Express server tracked in a Pages
  repo. Needs Hao to say where it runs before it is split out or deleted.
- `.git` is still ~438 MB. Untracking `node_modules` stops future growth but does not
  shrink history; that needs a `filter-repo` rewrite and a force-push past main's branch
  protection. Separate decision.
- The ~100 remaining orphan CSS classes. Static analysis proved unreliable twice here —
  `.rb-*` (role matrix version B) and 11 of 22 `is-*` classes are built by string
  concatenation in JS (`'is-' + tone`, `'<div class="rb-seg' + state`) and do not appear
  as literal tokens anywhere. **Any future orphan sweep must resolve JS-built class names
  against the data files, not grep for quoted strings.** Defer to Phase 2, where every
  rule gets touched once anyway.

---

## The core measurement

`redesign.css` is 468 KB raw / 138 KB gzip, 1,771 style rules, and **every page loads all
of it**.

| Page | rules loaded | matched | unused | KB used of ~211 KB |
|---|---|---|---|---|
| index.html | 2,020 | 257 | **87%** | 29 |
| about.html | 1,990 | 254 | **87%** | 29 |
| work.html | 2,112 | 159 | **93%** | 21 |
| healthcare.html | 2,039 | 700 | **66%** | 76 |
| lending.html | 1,990 | 411 | **79%** | 47 |
| web-3.html | 1,997 | 453 | **77%** | 51 |
| customer-engagement.html | 1,990 | 383 | **81%** | 44 |
| marketing-platform.html | 2,200 | 209 | **91%** | 23 |

No page uses more than a third of what it downloads. The homepage uses 14%.

`healthcare.html` at 700 matched rules is the reason the file is big: it carries B2 (AI
Accelerate), B9 (role matrix), B3 (phase decisions), the screen wall and the shipped-screens
tabs. Those five components are ~40% of `redesign.css` and appear on exactly one page.

---

## Phase 2 — Restructure (do this before theming)

Target:

```
css/
  core/        reset.css, grid.css, tokens.css      ← survives every redesign
  themes/      2026.css, 2027.css, dark.css         ← the only layer a redesign replaces
  components/  card.css, tabs.css, bench.css, …     ← one file per component
  pages/       home.css, about.css, work.css,
               case/healthcare.css, case/web3.css, …
```

Rules that make it hold:

1. **Components consume tokens only — zero colour literals.** Then a new year is a new
   theme file and every component follows for free.
2. **Page files may not define components.** Today page-only and shared CSS sit in one
   file with no boundary. That is what produced the `#built` id collision and the
   `.rd-case-label-in-card` cascade trap.
3. **One component, one file.** `.rd-deck-index` currently lives in two.
4. **No bare `#id` rules** — they hit any page reusing that id.

Precondition, cheap: extend the `body.rd-*` page scope to every page. Only 3 pages have it
today (`rd-home`, `rd-about`, `rd-ce`) across 7 rules.

Sequencing note: `redesign.css` is ordered by **build batch** (`B0`…`B9`, `W3C`), i.e.
chronologically, not by concern. Split by reading the batch banners, not by line ranges.

Also rename. `redesign.css` means "the 2026 redesign"; next year's has nowhere to go.

Expected result: homepage CSS drops from ~211 KB to ~30 KB.

---

## Phase 3 — Grid

Current: 1440 column, 40 gutter, 24 inner → **64px ink edge**, 1392 ink, 12 cols, 24 gap,
caps at 1520 viewport. On a 1920 monitor that leaves 264px dead each side.

Proposed: **1600 column, 32px gap**, gutter and inner unchanged.

| viewport | edge now | edge new | ink now | ink new |
|---|---|---|---|---|
| 1440 | 64 | 64 | 1312 | 1312 |
| 1512 | 64 | 64 | 1384 | 1384 |
| 1728 | 168 | 64 | 1392 | 1600 |
| 1920 | 264 | 184 | 1392 | 1552 |

Nothing below 1520 moves, so the whole mobile/tablet ladder is untouched — the safest
possible direction for a grid change on this codebase.

Blast radius is two code sites: `--rd-shell: 1440px` (redesign.css, 3 usages) and
`max-width: 1440px` (bootstrap-grid.css:85). Make `--rd-shell` alias `--grid-max` first.
Every other `1440px`/`1520px` hit in the tree is inside a comment.

Verify with the 16-width sweep, not a screenshot. 16px of drift is invisible in an image.

---

## Phase 4 — Dark / light theme

What already helps: a semantic token layer exists at `redesign.css:56–87` (`--rd-ink`,
`--rd-surface`, `--rd-border`, `--rd-line`, `--rd-tint`).

Four blockers, in the order they must be solved:

1. **Rename light-biased tokens first.** `--rd-white` is used as *card background* and
   `--rd-ink-inverse: #ffffff` means "text on dark". In dark mode `--rd-white` has to
   become near-black, which makes the name a lie. Go to role names
   (`--rd-surface-raised`, `--rd-text-on-accent`) *before* dark values land.

2. **148 colour literals** in the active path — 97 `redesign.css`, 48 `style.css`,
   3 `initiatives-desktop.css` (plus 30 `case-retheme-v3`, 44 `case-legacy`,
   19 `case-studies`). Most are chart/diagram inks of the form `rgba(10, 42, 48, .05)`,
   all derived from `--rd-ink` — those become `color-mix(in srgb, var(--rd-ink) 5%,
   transparent)` and theme themselves for free.

3. **`data-color-mode="light"` on every `<html>` is a decoy.** It reads
   `data-theme="alias semantic component spacer" data-color-mode="light"` — a leftover
   Specify token-export artifact. **No stylesheet reads either attribute.** Replace with a
   real `data-theme="light|dark"` contract so nobody assumes theming is half-wired.

4. **The actual hard problem: 55 raster screenshots** across the case studies, all
   white-background UI captures. `healthcare.html` alone has 31 `<img>` plus 44 inline
   SVGs whose `fill`/`stroke` are presentation attributes — and **SVG presentation
   attributes ignore `var()`**, so each needs converting to CSS. The screenshots need a
   product decision, not code: matte them in a permanent light frame, or dim them with a
   filter. A white screenshot on a dark page is a flashbang. **This one needs Hao.**
