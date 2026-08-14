# Page grid

One grid, every page. Written 2026-08-11, verified across 256 page/width combinations.

> Source of truth is `css/styles/grid.css`. If this doc and the rendered page
> disagree, **the rendered page wins** — the earlier `docs/redesign/tokens.css`
> and `design-tokens.md` went stale exactly this way.

---

## The grid

| | |
|---|---|
| Content column | **1440px** max, centred (includes its own 24px inner padding) |
| Page gutter | **40px** — outside the column, binds below 1520px |
| Inner padding | **24px** — inside the column, binds at every width |
| **Ink edge** | **64px** (40 + 40 gutter + inner), **16px** at ≤768px |
| Usable ink width | 1392px capped, `100vw − 128` below 1520px |
| Columns | 12 |
| Column gap | 24px |

**The ink edge is the invariant.** Every page-level element — nav wordmark,
`<h1>`, section headings, eyebrow labels, card left edges, CTA heading, footer
wordmark — shares one left edge:

```
ink left = max(40, (100vw − 1440) / 2) + 24
```

| Viewport | Ink edge | Ink width |
|---|---|---|
| 320 | 16 | 288 |
| 390 | 16 | 358 |
| 768 | 16 | 736 |
| 769 | 64 | 641 |
| 1024 | 64 | 896 |
| 1280 | 64 | 1152 |
| 1366 | 64 | 1238 |
| 1440 | 64 | 1312 |
| 1520 | 64 | 1392 |
| 1600 | 104 | 1392 |
| 1920 | 264 | 1392 |
| 2560 | 584 | 1392 |

Above 1520 the column caps and centres, so the edge grows but stays a *single*
value across the page.

---

## Using it

```html
<section class="container-fluid">      <!-- full-bleed background lives here -->
  <div class="rd-grid">                <!-- the page inset -->
    <h2 class="rd-section-heading">…</h2>
  </div>
</section>
```

`.rd-grid` is `max-width: 1520px` (= 1440 + 2×40) with `padding-inline: 64px`
(= 40 + 24), dropping to 16px at ≤768. That single element reproduces the
`section-gutter → .rd-shell → inner-padding` chain exactly, so it can replace a
Bootstrap `.container` in place.

Helpers in the same file:

| Class | Use |
|---|---|
| `.rd-grid` | The page inset. One per nesting chain. |
| `.rd-grid-cols` | 12-column track (`grid-template-columns`, 24px gap). |
| `.rd-grid-inner` | A block already inside a `.rd-grid`; contributes no further inset. |
| `.rd-grid-bleed` | Breaks a child back out to the viewport edges from inside a grid. |
| `.rd-shell` | The bare 1440 column, no padding. Used by the nav/footer bars and the `.rd-case-*` pages. |

Bootstrap `.row` / `.col-*` still work **inside** `.rd-grid` — `.row`'s −15px
margin and `.col`'s +15px padding net to zero, so column ink stays on the 64px
line. A stray `.container` nested inside a `.rd-grid` is neutralised
automatically by `grid.css`.

---

## Rules

1. **One `.rd-grid` per nesting chain.** It is an absolute inset from the
   viewport, not a relative one, so two nested grids inset twice.
2. **Backgrounds go outside the grid**, on `.container-fluid` or the `<section>`.
   Never put a full-bleed fill on the grid element itself.
3. **Never add horizontal padding to a direct child of `.rd-grid`.** Every
   historical misalignment on this site was an *additive* inset, not a wrong
   value. If a component genuinely needs its own inset, it is a card — give it a
   border or a background so the inset reads as the card's, not the page's.
4. **Don't reintroduce a second page column.** `#wrapper`'s `max-width: 1280px`
   and Bootstrap `.container`'s stepped max-widths were both removed from page
   layout for this reason.
5. Values come from the `--grid-*` custom properties. Don't hardcode 40/24/64.

---

## What this replaced

Two grids were running side by side:

- **`.rd-shell`** (redesign) on `index`, `about`, `healthcare` and the v2/v3
  rebuilds → 64px ink edge.
- **Bootstrap `.container`** on `work.html` and the 2021 case studies → stepped
  max-widths (343/358/398/544/736/960/1140/1280), auto-centred, so the ink edge
  was a *derived* number: 32px at 1024, 70px at 1280, 113px at 1366, 80px at
  1440, 320px at 1920.

Measured drift: **32px at 1024, 49px at 1366, 16px at 1440, 56px at 1920**, plus
a 1280 vs 1392 difference in usable column width.

### Bugs found and fixed along the way

Each was an *additive* inset or a competing column, never a wrong value:

| Where | Cause | Fix |
|---|---|---|
| `work.html` h1 at 96px vs nav at 64px | `.experience` adds `padding: 16px` on top of the container | `.rd-grid > .experience { padding-inline: 0 }` |
| lending / marketing-platform h1 at 144px (384px at 1920) | `#wrapper` in `case-2021.css` was a **third** page column at `max-width: 1280px`, centred, with `.rd-grid` inside it | `max-width` removed; `#wrapper` is now a flow wrapper |
| lending / web-3 nav wordmark following Bootstrap | Those pages don't load `redesign.css`, so the injected nav had no shell and no gutter | Chrome geometry moved into `grid.css`, which every page loads via `style.css` |
| healthcare `<h1>` at 24px vs nav at 64px | `.rd-case-hero` / `.rd-case-section` had no page gutter, so `.rd-case-inner`'s 24px was the only inset. Agreed only above 1520, where the column caps either way — easy to miss on a wide monitor | `padding-inline: var(--grid-gutter)` on both |
| case-study nav wordmark at 104px | Nav is injected *inside* `.rd-case-hero`, so it was inset twice once the hero gained its gutter | `.rd-case-hero .rd-nav-outer { padding-inline: 0 }` at ≥769 |
| `web-3-v3.html` h1 at −0.9px on a 390px screen | `case-retheme-v3.css` declared `.display, h1` at a flat 48px with no responsive step. "Entertainment" measured 391.8px of min-content, and the hero wrapper is `justify-content: center`, so the overflowing line centred itself off the left edge | Type ladder 48 → 36 (≤1180) → 28 (≤768), mirroring `.rd-case-title` |
| `bootstrap-grid.css` | `@media (min-width: 2560)` — no unit, so the rule never applied and 1280px was the real ceiling at any width | Rule commented out; `.rd-grid` owns page width now |
| `.rd-case-*` mobile block | Was `max-width: 767px` while the chrome block is `max-width: 768px` — a one-pixel-wide misalignment at exactly 768 | Aligned to 768 |

---

## Verifying

**Use a width sweep, not a screenshot.** A 16px drift is invisible in a
screenshot and obvious in a measurement.

Assert that every reference element returns a **single distinct**
`getBoundingClientRect().left` at
`320 / 390 / 430 / 600 / 768 / 769 / 900 / 1024 / 1180 / 1280 / 1366 / 1440 / 1520 / 1600 / 1920 / 2560`,
and that the value equals `16` (≤768), `64` (≤1520), or `(vw − 1440) / 2 + 24`.

Reference elements — measure the **ink**, not padded wrappers like
`.rd-split-head` or `.rd-footer-brand`, or you will chase phantom 40px offsets:

- `#nav-placeholder .rd-wordmark-img`
- the page `<h1>`
- a section heading (`.rd-case-h2`, `.rd-section-heading`)
- `#footer-placeholder .rd-wordmark-img`

Pages in the sweep: `index`, `about`, `work`, `work-v3`, `work-experience`, and
`case-studies/` × {`healthcare`, `lending`, `lending-v2`, `lending-v3`,
`marketing-platform`, `marketing-platform-v2`, `marketing-platform-v3`, `web-3`,
`web-3-v2`, `web-3-v3`, `work`}.

### Running it headlessly

`file://` breaks the `fetch()` that injects `templates/nav.html` and
`templates/footer.html`, so serve over HTTP. The server and the Playwright
script must be in the **same** shell invocation — backgrounded jobs don't
survive between calls:

```bash
(python3 -m http.server 8899 >/dev/null 2>&1 &) && sleep 2 && \
LD_LIBRARY_PATH=/tmp/stublib PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 python3 sweep.py
```

Sandbox notes: `playwright install chromium` fails host validation (`libXdamage1`
missing, apt blocked) — compile a four-symbol stub and pass
`executable_path=~/.cache/ms-playwright/chromium-*/chrome-linux/chrome` with
`args=["--no-sandbox"]`. The proxy also blocks jsdelivr / unpkg / cdnjs / Google
Fonts, so `Swiper`, `AOS` and Bootstrap's `.img-fluid` are missing — an image
that overflows its column in a sandbox screenshot is usually that, not a grid
bug. Confirm on a real browser before "fixing" it.

---

## Still open

`case-studies/lending.html`, `marketing-platform.html` and `web-3.html` do not
load `redesign.css`. Their grid is now correct, but the shared nav and footer
render **unstyled** on those pages — no pill, no blur, no flex row, just stacked
links. That is a pre-existing bug independent of the grid, and worth fixing
separately since all three are linked directly from the homepage.
