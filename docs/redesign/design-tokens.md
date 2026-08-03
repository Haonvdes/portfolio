# Design Tokens — Portfolio Redesign

Last updated: 2026-08-02
Source: `css/tokens.css` (import that file in every page — this doc explains the *why*)

## Why these values, not the Figma variables

The Figma file (`Wrapup`, node `40000102:8463` "Final Design") has a bound variable
library (`grey/G200`, `grey/G300`, `text/neutral/*`, etc.) — but the actual rendered
frames don't use it consistently. The primary button, hero text, and status tag all use
raw hex fills that aren't tokenized in Figma (`#01679c` for buttons, `#131313` for text,
literal `green` for the "opentowork" tag). Per direction from Hao: ignore the stale bound
variables and build a fresh, consistent token system anchored on the colors actually
visible in the rendered design.

Evidence pulled directly from `get_design_context` on the homepage nav/hero frame
(`40000031:5788`):
- Button fill: `bg-[#01679c]`, white text
- Headline/body text: `text-[#131313]`
- Status tag ("#opentowork"): literal `green`
- Card/nav radius: `16px`, hero image radius: `24px`, button radius: `999px` (pill)
- Fonts: `DM Sans` for all UI/body/heading text; `Raleway Bold` only for the
  "STEPHANO.NG" wordmark (uppercase, `1.6px` letter-spacing on 16px type)

## Color

| Token | Value | Use |
|---|---|---|
| `--ink-900` | `#131313` | primary text |
| `--ink-700` | `#3f3f3d` | secondary text |
| `--ink-500` | `#6b6a66` | muted / placeholder text |
| `--ink-300` | `#a9a79f` | disabled text |
| `--ink-100` | `#e4e1d9` | borders, dividers |
| `--surface-0` | `#ffffff` | cards, elevated panels |
| `--surface-50` | `#f4f3ef` | page background |
| `--surface-100` | `#ece9e2` | subtle alternate section band |
| `--primary-900` | `#014a70` | button hover/pressed |
| `--primary-700` | `#01679c` | buttons, links, active state (brand primary) |
| `--primary-500` | `#1580b8` | lighter accents |
| `--primary-100` | `#d6ebf4` | tint backgrounds, badges |
| `--accent-700` | `#157f3c` | success/status text |
| `--accent-500` | `#22a559` | success/status icon or dot |
| `--accent-100` | `#dff3e6` | tint background |

Contrast checked: `--ink-900` on `--surface-50` is effectively black-on-near-white
(passes AAA). White text on `--primary-700` is ~6.1:1 (passes AA for normal text and
UI components). `--accent-700` on `--surface-50` is ~4.6:1 (passes AA for normal text;
prefer it over `--accent-500` for any text use).

Use the semantic aliases in `tokens.css` (`--color-text-primary`,
`--color-brand-primary`, etc.) in page CSS rather than the raw scale — that way a future
palette swap only touches `tokens.css`.

## Typography

Two families:
- **DM Sans** — everything: nav, body, headings, buttons, tags. Weights used: 400, 500,
  600, 700, 800.
- **Raleway** (Bold only) — reserved for the personal wordmark/logo ("STEPHANO.NG"),
  uppercase with `0.1em` letter-spacing. Don't use it anywhere else.

Load both from Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Raleway:wght@700&display=swap" rel="stylesheet">
```

Type scale (`--fs-*` in tokens.css): display 48px, h1 40px, h2 32px, h3/sub-heading
22px, body-lg 20px (hero subhead / lead paragraphs), body-md 16px (default), body-sm
14px, caption 12px (tags/meta).

## Spacing, radius, shadow

- Spacing scale is 4px-based: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128.
- Radius: `8px` small elements, `16px` cards/nav, `24px` large media, `999px` pill
  buttons — all matched to values actually used in the Figma frames.
- Shadows: `--shadow-nav` matches the exact soft nav shadow from Figma
  (`0px 4px 2px rgba(224,224,224,0.25)`); `--shadow-sm/md/lg` are new elevation levels
  for cards, built from `--ink-900` at low opacity for consistency with the ink scale.

## Layout

Figma frames are built on a 1920px canvas with 1440px content width and 240px side
margins. Tokens: `--container-max: 1440px`, `--container-padding: 24px` (mobile gutter),
`--container-padding-lg: 240px` (desktop side margin).

## How to use this when implementing a page

1. Link `css/tokens.css` before the page stylesheet.
2. Use the semantic `--color-*` aliases, not raw hex, in new CSS.
3. If a new page needs a color/spacing/radius that isn't in this scale, add it to
   `tokens.css` first (with a comment explaining the source) rather than hardcoding a
   one-off value in the page file.
