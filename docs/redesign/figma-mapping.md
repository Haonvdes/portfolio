# Homepage → Figma node mapping

> **The node map below is still accurate and useful. The transcribed *values*
> are a point-in-time record of what Figma held on 2026-08-02 — they are not
> current and must not be copied into CSS.**
>
> Known to have changed since: the design collapsed every text tone onto a
> single deep teal ink (`#0a2a30`), so the `#131313` / `#000000` / `#374151`
> rows in the colour table below no longer describe the site. The type table
> lists 49/600 for the hero where the live token is 48px, and weights 800 where
> the redesign consolidated to three roles (500/600/700).
>
> For values, use `css/styles/tokens.css`. See `docs/redesign/design-tokens.md`.

Design file: `Wrapup` (`R2444s7q1V2Rp7Ubd6l5BH`), page `UI V1.0`, section `40000102:8463` "Final Design".
Homepage root: `40000028:3126`. Canvas 1920px wide, content column 1440px, 240px side margins.

| Section | Figma node | Implemented in |
|---|---|---|
| Nav + hero | `40000031:5463` / `40000031:5788` | `templates/nav.html`, `index.html` `.rd-hero-section` |
| How I Create Impact | `40000031:5907` | `index.html` `.rd-impact-section` |
| Selected Product Initiatives | `40000124:720` | `index.html` `.rd-initiatives-section` |
| Closing CTA + footer bar | `40000028:3230` | `index.html` `.rd-closing`, `templates/footer.html` |

## Values transcribed from `get_design_context`

**Colour**

| Value | Where |
|---|---|
| `#131313` | all body + heading text |
| `#131311` | second span of the nav tagline |
| `#000000` | "At glance", "Problem framing", stat numbers |
| `#374151` | STEPHANO.NG wordmark |
| `green` (literal) | `#opentowork` |
| `#01679c` | buttons, text buttons |
| `#f3f3ef` | section background, mini stat row |
| `#666666` | card + stat-box border |
| `#e5e7eb` | CTA top border |

Hero background: `linear-gradient(to bottom, #fff 58.388%, #f3f3ef)`.
Closing background: `linear-gradient(to top, #fff, rgba(243,243,239,0.98))`.

**Type — DM Sans throughout, Raleway Bold for the wordmark only**

| Size / weight | Used for |
|---|---|
| 49 / 600 | hero headline (max 935px) |
| 32 / 600 | section headings, CTA heading |
| 24 / 600 | initiative title |
| 24 / 700 uppercase, lh 1.4 | stat numbers |
| 20 / 800 | impact card titles |
| 20 / 700 uppercase, lh 1.4 | "At glance", "Problem framing" |
| 20 / 500 | hero lead |
| 16 / 500 | body copy |
| 16 / 400 | impact card descriptions |
| 16 / 800 uppercase | "At a Glance" label, stat-bar items |
| 14 / 500 | buttons |
| 14 / 400 | footer location |
| 12 / 500 | nav tagline, footer credentials |
| 16 / 700, 1.6px tracking | wordmark (Raleway) |

All line heights are `normal` except the three noted as 1.4.

**Geometry**

- Nav: 1440×80, padding 24, radius 16, `backdrop-filter: blur(10px)`, shadow `0 4px 2px rgba(224,224,224,.25)`, `align-items: flex-start`, no background fill.
- Nav → hero gap: 118px. Hero row padding 24. Hero content 952px, headline group gap 32, content gap 24.
- Hero media: padding 16, radius 24, `rgba(255,255,255,.4)`, `backdrop-filter: blur(67px)`; image 358×501, radius 16.
- Impact: section padding 40, inner gap 40, head padding-inline 24 gap 24, card row padding 24 **gap 80**, icons **40×40**, card gap 16.
- Stat bar: white, 1px `#666`, radius 16, padding 24; items `flex: 1`, centred, uppercase.
- Initiative card: white, 1px `#666`, radius 16, padding 32, height 742, row gap 80, body 544px gap 40, head `border-bottom` 1px `#666` `padding-bottom` 24 gap 8.
- Mini stat row: `#f3f3ef`, radius 12, padding 16/40, gap 24, item gap 10.
- CTA: `border-top` 1px `#e5e7eb`, padding 80, inner padding 24, block gap 24, sub gap 10, copy max 1091px.
- Footer: outer height 100 padding 80; bar 1440×80, `padding-block` 16, radius 16, brand `padding-inline` 16 gap 4, meta gap 8, social gap 16.

## Assets

All exported assets were already committed to `public/` — no new exports were needed except one.

| Figma node | File |
|---|---|
| `40000031:5810` hero photo | `public/personal_image.webp` |
| `40000087:7561` | `public/Customer-Centered Discovery.svg` |
| `40000087:7602` | `public/Strategic Product Thinking.svg` |
| `40000087:7595` | `public/Cross-functional Leadership.svg` |
| `40000087:7571` | `public/Outcome-driven  Execution.svg` (note the double space) |
| `40000028:3243/3246/3248` | `public/ic_mail.svg`, `public/ic_tweet.svg`, `public/ic_linkedin.svg` |
| `40000124:754` case-study cover | **not exported yet** — `public/web3.jpg` is a stand-in |

## Selected Product Initiatives — redesigned 2026-08-02

The section was reworked in Figma after the first implementation. Node `40000124:720`
is now 1032px tall (was 986). Changes:

- **"View All" moved into the header row** (`40000132:3024`): heading is `flex: 1`, with a
  52px text button at the right. The old button below the card (`40000124:755`) is gone.
- **New tab strip** (`40000132:3660`): four tabs, `gap: 16`, each `flex: 1 0 0`, 62px tall,
  padding `8px 8px 8px 16px`, `border-bottom: 2px`. Active = `#01679c` border + DM Sans
  Bold 16 `#01679c`; inactive = `#999` border + DM Sans Regular 16 `#131313`.
- **Card padding 40** (was 32); inner content 1312×662 (was 1328×678); image 688 wide.
- **"Learn More" is now a sibling of the detail block**, not a child, so it pins to the
  bottom of the 662px column (`40000132:3671` at y=622). The detail block is `flex: 1`.
- Tab strip sits 24px above the card inside `Frame 1000002747`'s 24px padding.

Tabs 2–4 read "Sample Text Will Be Replaced" in the design. They ship as
"Initiative 02/03/04" with a "Case study coming soon." panel until real content exists.
Switching is handled by `js/initiatives.js` (APG tabs pattern: click, arrow keys,
Home/End, roving tabindex).

## Deliberate deviations from Figma

These were requested and are not transcription errors:

- **Every section is a full viewport.** `.rd-hero-section`, `.rd-impact-section` and
  `.rd-initiatives-section` are `min-height: 100vh` (`100svh` where supported). In the
  header the nav sits at the top and the hero flexes to fill the remainder, so Figma's
  fixed 118px nav→hero gap becomes the leftover space (floored at 118px).
- **Section scroll-snapping.** `html:has(body.rd-home)` gets
  `scroll-snap-type: y mandatory`, and each section gets `scroll-snap-align: start` plus
  `scroll-snap-stop: always` — the latter is what stops a fast flick skipping a section.
  The closing CTA + footer uses `scroll-snap-align: end` so it settles flush with the
  bottom of the document at its natural height. Snapping switches off under
  `max-width: 1180px` or `max-height: 700px`, where a section no longer fits one screen,
  and `scroll-behavior` drops to `auto` under `prefers-reduced-motion`.
- `min-height` (not `height`) is used throughout, so a section grows rather than clipping
  when content exceeds the viewport — most likely on the initiatives section, whose card
  is a fixed 742px in the design.

## Notes

- The bootstrap `.container` class is deliberately not used on the redesigned page: its
  breakpoint max-widths (1140/1280px) would clamp the 1440px design column. `.rd-shell`
  replaces it.
- Figma applies the nav shadow as `drop-shadow()`. That is implemented as `box-shadow`
  because a `filter` on the same element suppresses `backdrop-filter` in Blink/WebKit.
- Exact Figma values apply at ≥1440px; below that the layout reflows at 1180px and 768px.
