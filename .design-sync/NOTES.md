# design-sync notes — stpnguyen.com

- **Styles-only sync (Hao's choice, 2026-09-28).** The site is plain HTML/CSS, so there are
  no React components. The project gets `styles.css` + `_ds_bundle.css` + the README
  conventions header, and no component cards.
- **Source branch: `redesign`**, i.e. the live look. The `theme-system` branch has the CSS split
  (`css/core`, `css/components`, `css/pages`) and role-named tokens; if that merges, rewrite
  `pkg/ds-entry.css` to import the new files and re-validate `conventions.md` (token names change).
- `.design-sync/pkg/` is a stub package (name, empty `index.mjs`/`index.d.ts`) because the
  repo root `package.json` has no `name`, and the converter needs a named package dir.
  `cssEntry` must live inside it, so `build-css.mjs` writes `pkg/dist/styles.css` (gitignored).
- **Build:** `node .design-sync/pkg/build-css.mjs` (the `buildCmd`), then the converter with
  `--node-modules ./.ds-sync/node_modules --entry ./.design-sync/pkg/index.mjs`.
  `pkg/ds-entry.css` mirrors index.html's stylesheet order: DM Sans → style.css →
  redesign.css → initiatives-desktop.css. Case-page-only sheets (case-legacy, case-retheme-v3,
  back-to-top) are deliberately left out.
- `style.css` @imports `./chatbox.css`, which doesn't exist (a 404 on the live site too).
  `build-css.mjs` resolves it to empty. It also drops `@import url('https://fonts.googleapis.com')`,
  which imports an HTML page.
- Playwright: the cache has chromium-1223, which matches `playwright@1.60.0` (installed into `.ds-sync/`).

## Known validate warns
- `[TOKENS_MISSING]` `--text-neutral-default`, `--background-surface-main`, `--button-bg-primary-hover`:
  referenced in legacy sheets but never defined, a pre-existing site bug. `--i` is set inline by JS.
- `[FONT_REMOTE]` lists Raleway and IBM Plex Mono. Neither is actually served: the site never loads
  Raleway (`--font-wordmark` falls back to system-ui live), and IBM Plex Mono loads only on a
  `_preview-*` page. Designs match the live site. Don't "fix" this by adding the fonts without asking Hao.

## Re-sync risks
- `conventions.md` names tokens and classes by hand. Re-run its name check against
  `ds-bundle/_ds_bundle.css` after any CSS change (the token/class grep in the sync session).
- The remote @imports (Google Fonts, cdnjs aos/animate, unpkg swiper@latest) load at runtime.
  unpkg swiper is unpinned.
