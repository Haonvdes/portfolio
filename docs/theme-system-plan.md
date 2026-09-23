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

## Phase 2 — Minimize CSS scope per page

### What the measurement says

Every rule in `redesign.css` (1,771 rules, 184 KB) was tested against all 8 pages' live
DOM, at 390px and 1440px, after a full scroll pass and after clicking every tab, pill and
picker so JS-built DOM existed. Rules were then grouped by *which set of pages* matches them.

| Ownership | KB | share |
|---|---|---|
| Shared by all 8 pages | 9 | **5%** |
| Real components (2–7 pages) | 32 | 17% |
| **Exactly ONE page** | **104** | **57%** |
| Matched by no page in any captured state | 39 | 21% |

**57% of the file is single-page CSS that all 8 pages download.** Only 5% is genuinely
shared. That is the whole opportunity, and it means the split is mostly mechanical: the
big blocks are already page-exclusive, they are just not in page-exclusive files.

Per-page exclusive weight:

| Page | rules only it matches | KB |
|---|---|---|
| healthcare | 400 | 40 |
| web-3 | 176 | 17 |
| about | 128 | 13 |
| lending | 125 | 12 |
| home | 112 | 11 |
| customer-engagement | 113 | 10 |
| work | 0 | 0 |
| marketing-platform | 0 | 0 |

`work.html` and `marketing-platform.html` have **no** exclusive CSS — they are pure
chrome + shared components, and are nearly free once the split exists.

### Projected result

| Page | now | after | cut |
|---|---|---|---|
| work | 184 KB | 12 KB | **93%** |
| marketing-platform | 184 KB | 13 KB | **93%** |
| home | 184 KB | 29 KB | **84%** |
| about | 184 KB | 32 KB | **83%** |
| customer-engagement | 184 KB | 53 KB | 71% |
| lending | 184 KB | 55 KB | 70% |
| web-3 | 184 KB | 60 KB | 68% |
| healthcare | 184 KB | 85 KB | 54% |

(includes a 20% overhead for state-dependent rules that travel with their component)

### Target layout

```
css/
  core/         tokens.css  reset.css  grid.css  chrome.css   ← ~9 KB, every page
  components/   hero.css  tabs.css  deck.css  figure.css
                case-shell.css  toc.css  related.css  …       ← ~32 KB, pick per page
  pages/        home.css  about.css  work.css
                case/healthcare.css  case/web-3.css
                case/lending.css  case/customer-engagement.css ← ~104 KB, one page each
```

### Order of work

Do it leaf-first. Page-exclusive blocks carry the least risk (one page can regress) and
the most weight (57%), so they come first — not last.

**Step 0 — page scopes.** Add `body.rd-*` to every page. Only 3 have it today
(`rd-home`, `rd-about`, `rd-ce`) across 7 rules. This is the precondition: it makes a
page-exclusive file structurally unable to leak.

**Step 1 — extract the four case-study pages.** `healthcare` (40 KB) first; it alone is
22% of the file and its five big components (B2 AI Accelerate, B9 role matrix, B3 phase
decisions, screen wall, shipped-screens tabs) appear on exactly one page. Then `web-3`,
`lending`, `customer-engagement`. After this step every other page is already ~60% lighter.

**Step 2 — extract `home` and `about`.** Their blocks are already cleanly bannered
(`Section 1–4` at redesign.css:752–1703, `About §1–§6` at 1715–2640), so the boundaries
are readable rather than inferred.

**Step 3 — split what is left into `components/`.** Whatever remains after steps 1–2 is by
definition shared. Use the existing numbered banners (`1. Evidence chips`, `3. Section TOC`,
`5. Figure variants`, …) as the file boundaries.

**Step 4 — core.** The residue: `:root`, nav, footer, shell, typography roles
(redesign.css:49–710).

**Step 5 — rename.** `redesign.css` means "the 2026 redesign"; next year's has nowhere to
go. It should not survive the split as a name.

### The regression gate

A harness already exists and is proven: it records, for every page × width, the ink-left
edge of every element wider than 50px keyed by class, and diffs two runs. It was used on
the Phase 1 CSS removal and reported **0 differences across 64 page/width combinations**.

Run it after every step. A step that reports any diff it cannot explain gets reverted, not
debugged forward. This replaces screenshots — 16px of drift is invisible in an image.

### Two traps, both already paid for

1. **Never bulk-delete CSS from static analysis.** `.rb-*` (12 classes) is the role matrix
   *version B that Hao picked*, built by string concatenation in `role-matrix.js`
   (`'<div class="rb-seg' + state`). 11 of 22 `is-*` classes are built as `'is-' + tone`
   from the data files. Neither appears as a literal token anywhere. A grep-driven sweep
   would have deleted both.

2. **The 39 KB "matched by no page" bucket is NOT dead code.** 132 of those 369 rules are
   state-dependent (`body.nav-open`, `.is-open`, `.is-playing`, `[aria-selected]`) and are
   live. The rest are *candidates* — `.rd-activity-card .club-summary` genuinely is dead
   (Strava killed the club API, 2026-09-22), `.rd-wordmark` and `.rd-head-row` look dead —
   but each needs verifying individually, against the JS that builds the state, not in bulk.
   Audit this bucket during the split, when every rule is being read anyway.

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
