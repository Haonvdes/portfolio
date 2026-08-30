# Portfolio (stpnguyen.com) — working agreement

Hao's personal portfolio. Plain HTML/CSS/JS, no framework, no build step. Live at
stpnguyen.com via GitHub Pages from `main`. Working branch is `redesign`.

## Two rules that come before everything else

1. **Ask before you edit. Every time.** Read, analyse, say what you would change and in which
   file — then stop and wait for an explicit yes. A question is a request for an answer, not
   permission to edit. "[No preference]" is not consent.
2. **Edit only the files the request names.** Anything shared (`css/styles/style.css`,
   `grid.css`, `redesign.css`, `templates/*`) or documentary gets raised first, not edited
   first. Every page loads the shared sheets, so a scoped rule there still has site-wide reach.

Details and the incidents behind both: `.claude/memory/feedback_scope_discipline.md`.

## Project memory — read it before you touch anything

`.claude/memory/` holds the accumulated context for this project: decisions Hao has made,
facts verified against sources, traps that have already cost a session, and what is still
open. **`.claude/memory/MEMORY.md` is the index — read it first, then open only the one or two
files that match the task.** They are long on purpose; each one exists because something went
wrong without it.

This folder is shared with the Claude desktop app (Cowork), which works on the same repo
through a mounted-folder bridge. **When you learn something durable, write it here** — a
decision Hao made and why, a non-obvious constraint, an approach that does not work — so the
other surface gets it too. Update the matching file rather than starting a new one, and add a
line to `MEMORY.md` if you create one.

## Where things are

- Pages at root (`index.html`, `about.html`, `work.html`) plus `case-studies/*.html`
- One stylesheet entry `css/styles/style.css`, which `@import`s the rest; `redesign.css` is
  linked separately from each redesigned page's `<head>`, after it — never `@import`ed
- Shared nav/footer live in `templates/` and are injected by `js/script.js` into
  `#nav-placeholder` / `#footer-placeholder`. Keep those ids and never inline new chrome.
- Type and colour tokens: `css/styles/tokens.css` is the ONE source of truth. `docs/redesign/`
  copies are stale — if a doc and the rendered page disagree, the page wins.
- `scripts/shot.py` renders any page headlessly for verification
- Research and intake docs live one level up, in the `Site` folder — see its own `CLAUDE.md`

## Verification

Layout changes are verified with a **width sweep**, not a screenshot: assert the page-level
elements return a single `getBoundingClientRect().left` across the breakpoint ladder. 16px of
drift is invisible in an image. Recipe: `.claude/memory/portfolio_mobile_responsive.md`.

## Voice

Case study prose must read as a person wrote it — short sentences, concrete nouns,
contractions fine, no aphoristic closing lines. Nothing in visible page copy may describe how
the page was built or what research went into it; that belongs in an HTML comment.
