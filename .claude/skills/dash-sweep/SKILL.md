---
name: dash-sweep
description: Scan the portfolio's public pages (and the JS that writes copy into them) for em dashes (—) and `--` in visible prose, remove the ones that come out with the meaning intact, and list every rewrite that shifts meaning or needs added words for Hao to approve before it is applied. Use whenever Hao asks to scan, find, remove, clean or sweep em dashes / dấu gạch / dấu — on the site, a page, or a case study, or says "/dash-sweep".
---

# Dash sweep (stpnguyen.com)

Same rule the cv-tailor skill applies to resumes (Hao, 2026-09-21), carried over to the site:
**no em dash (—) and no `--` inside a sentence a visitor reads.** Label separators that are not
sentences stay.

The skill has one hard gate: **a dash comes out silently only when the words stay exactly the
same and only the punctuation changes.** Anything else is listed for Hao and waits for approval.

## Step 1 — Scan

```bash
python3 .claude/skills/dash-sweep/scripts/scan.py                 # whole public site
python3 .claude/skills/dash-sweep/scripts/scan.py about.html      # one page (paths from repo root)
python3 .claude/skills/dash-sweep/scripts/scan.py --json          # for working through hits
```

Default scope: `index.html`, `about.html`, `work.html`, `case-studies/*.html` (not `_preview-*`,
which never publish), `templates/*.html`, and every `js/*.js` that a page or another script
references (vendor bootstrap files excluded; unreferenced scripts are named at the end and skipped).

What it reads as visible copy: HTML text nodes (not `<script>`, `<style>`, `<title>`, `<code>`,
`<pre>`, `<svg>`, comments), copy attributes (`alt`, `aria-label`, `title`, `placeholder`,
`data-*`, meta description / og / twitter), and JS string literals with their embedded HTML comments
blanked out. `&mdash;` and `&#8212;` are caught too.

**Out of scope by default:** the three `Stephano-Ng-Resume-*.html` files. They were already swept
on 2026-09-21, and any edit there means re-rendering the repo PDFs
(see `.claude/memory/resume_html_page_budget.md`). Only scan them if Hao names them.

Each hit comes back with an id (`D12`), `file:line`, the enclosing element, the whole sentence or
block around the dash, `xN` when one block holds several dashes, and a `hint`. The hint is a
starting guess, not a verdict. Read the sentence yourself.

## Step 2 — Put every hit in one of three buckets

### KEEP: not a sentence, leave it alone

- Label separators: `Web3 — L1 Blockchain`, `Stephano Ng — home` (aria-label), the page-title
  pattern `Page | Stephano Ng — Product Manager` in `<title>` and og/meta titles, quote-attribution
  figcaptions like `Accounting Team — reconciliation`.
- A lone `—` used as an empty-value glyph in a table, stat or matrix cell (`role-matrix.js`).
- Legend annotations that read like labels (`— most used`, `— no permission`).
- `templates/case-study-v3.template.html` `TODO — …` placeholders. They are generator
  scaffolding, replaced before any page ships.

A `label?` hint on something that is really a sentence (a heading like `With AI — four phases
become two` makes a claim) is prose. Judge by whether it reads as a sentence.

### AUTO: fix directly, no approval

The replacement changes **punctuation only**. Same words, same order, same meaning, same
emphasis. The allowed swaps:

| Pattern | Swap | Example |
|---|---|---|
| Paired dashes around an aside | two commas, or parentheses if it holds commas already | `the manager — on desktop and mobile — rather` → `the manager, on desktop and mobile, rather` |
| Dash introducing a list or the thing just promised | colon | `parts of a sprint — status rollups, …` → `parts of a sprint: status rollups, …` |
| Dash between two full clauses that each stand alone | full stop, capitalise the next word | `nothing could be attached to it — it sat outside` → `…attached to it. It sat outside` |
| Unspaced `—` between two words (`decisions—from`) | same rules as spaced | |

A full stop is the default when both halves are full clauses. That's what Hao's voice note asks
for (`.claude/memory/portfolio_case_study_voice.md`: "most become a full stop"). Prefer it over a
semicolon; semicolons are an AI tell he's asked to keep down.

### APPROVE: list it, don't apply it

Anything that fails the AUTO test goes on the approval list. In particular:

- **Needs a word added, removed or moved.** The part after the dash is a fragment that can't stand
  on its own after a full stop, and a comma or colon reads wrong (`Xstaxy mainnet live, 20 March
  2023 — after 15 months of development.`).
- **The dash carries contrast or a turn.** `not X — Y`, `was not a tool — it was one backlog
  convention`, `A volume business — and a fifth of that volume…`. Punctuation alone flattens
  the emphasis or changes which half is the point.
- **The dash sets up a punchline or conclusion.** A colon or full stop changes the rhythm enough
  that it's a copy decision.
- **A comma swap would create ambiguity**, for example an aside that already holds commas and
  would run into the surrounding list.
- **Quoted words.** Any `<blockquote>`, `.rd-quote-*`, testimonial or quoted document text. Those
  are someone else's words. Never rewrite them without Hao saying so, even punctuation.
- **The sentence spans inline elements** (`<em>`, `<a>`, `<strong>`) where the new punctuation
  would land inside or across a tag.
- **Fixed-length slots.** Hero leads, the marquee, card descriptions (`.rd-work-desc`), `data-blurb`
  tooltips, anything in a component with a fixed height or a typing/reveal animation. A longer
  rewrite can break layout, so it needs a look.
- **The same sentence exists in several places.** The customer-engagement cover `alt` is repeated
  on four pages. Approve it once and apply it everywhere, so the copies don't drift.
- **Meta description / og text.** Shows up in search results and link previews.

When unsure, it's APPROVE. A listed item costs Hao ten seconds. A silently changed sentence costs
trust in the whole pass.

## Step 3 — Apply AUTO, present APPROVE

Apply every AUTO fix with Edit in the same turn (the repo's standing rule is "sửa luôn", no
proposal step). Then give Hao the approval list, in Vietnamese for the framing and English for the
copy:

```
### Cần duyệt (N)

**D23** · case-studies/customer-engagement.html:114 · <p>
Trước: The tool was old enough that nothing new could be attached to it — it sat outside the
       rest of the stack, Salesforce above all, and …
Đề xuất: The tool was old enough that nothing new could be attached to it. It sat outside the
       rest of the stack, Salesforce above all, and …
Lý do: đổi được bằng dấu chấm nhưng "Salesforce above all" giờ thành mệnh đề chính, nhấn khác.
Phương án khác (nếu có): …
```

Rules for the list:

- Show the **whole sentence** before and after, not just the fragment around the dash. Mark
  added words in **bold** so the change is visible at a glance.
- One line of **Lý do** saying what shifts: meaning, emphasis, rhythm, length, or which words
  were added.
- Offer a second option only when the two differ in a way Hao would care about.
- Group repeated sentences into one item and list every `file:line` it appears on.
- Number items with their scan id so Hao can answer "ok D23, D41 dùng phương án 2, bỏ D57".

Rewrites follow the site voice: short sentences, concrete nouns, contractions fine, no semicolons,
no new "X, Y, and Z" triads, no aphoristic closing line, and **never introduce a new em dash**.
No number or claim changes. A rewrite that touches a figure isn't a dash fix.

After Hao answers, apply exactly what he approved. Leave anything he didn't mention unchanged
and say so.

## Step 4 — Verify

1. Re-run `scan.py` on the touched files. What's left should be KEEP items only. Name any
   remaining prose hit and say why it's still there (pending approval, or Hao declined).
2. `git diff --stat` and a read of the diff. Only punctuation and approved wording should change.
   No markup, classes or whitespace churn.
3. If any change landed in a fixed-length slot (see APPROVE), render that page with
   `scripts/shot.py` at a phone and a desktop width and look at the component. Punctuation-only
   edits elsewhere don't need a render.

## Step 5 — Report

Short, in Vietnamese:

- Counts: scanned / KEEP / AUTO applied / waiting for approval.
- AUTO changes as `file:line` + before → after (one line each), so Hao can spot-check.
- The approval list (Step 3).
- Anything odd the scan turned up that isn't a dash, such as copy leaking out of a broken HTML
  comment. Report it; don't fix it in this pass.

Don't commit unless Hao asks.
