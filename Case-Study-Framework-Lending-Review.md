# case-study-framework.html — review as the HD Saison lending case study

Reviewed 20 Aug 2026 against `portfolio/case-studies/case-study-framework.html` (888 lines),
`HD-Saison-Research-and-Rewrite.md` and `HD-Saison-Case-Study-v2.md`.

Nothing in the page has been edited. This document is the punch list.

---

## Part A — Blocking factual errors

These are wrong on the page today, in reading order.

### A1. The Overview snapshot is Aura's metadata, not HD Saison's

`§overview`, lines 170–195. Every one of the six fields is wrong for this project:

| Field | On the page now | Should be (confirm) |
| --- | --- | --- |
| Role | Lead Product Designers | Product Designer — also drove product decisions |
| Domain | Web 3 | Consumer finance / lending |
| Timeline | Mar – Apr 2024 | Jun 2021 – Dec 2021 *(confirm end date)* |
| Team | 5 Product Designers | *(blocked — Hao to supply)* |
| Platform | Web Desktop | Mobile app, iOS + Android |
| Status | 10 member | **Shipped** |

"Status: 10 member" is not a status. It reads as a copy-paste that was never re-read.

### A2. The page never says it shipped

The app (`id1589425903`) has been live since v1.1.0, 16 May 2022, is now v1.1.30 and ranks
#36 in Finance VN. eSign is in production. This is the strongest verified fact available and
it appears nowhere — while the section headed *"It shipped, and then I stopped looking"*
contains no shipping.

### A3. "5h → 2h" is presented as a measured outcome

`§overview`, lines 233–236, sits under the label **"Outcomes / Success metric"**. Per the
standing ruling on this project, the 2-hour approval figure is a **discovery target that was
never measured by Hao**. Unlabelled, it is the most falsifiable claim on the page.

Same problem, lower stakes, with **"100% — Offline process to online"**: that is the brief
restated as a result.

Fix: either relabel the block ("Targets set in discovery") or split it — targets above,
verified outcome (shipped, still running, 3.0★) below.

### A4. The timeline contradicts itself

Snapshot says **Mar – Apr 2024**. Body copy in `§context` (line 266) says discovery ran
*"from kickoff in June 2021 to the first interactive prototype in September."* The Marvel
cover asset is dated Sep 2021. Two of these three cannot both be true.

### A5. Citation markers leaked into the prose

`§context`, lines 256–274. Three source tags were left inline as visible words:

- "…41% in 2022, up from 34% the year before **published**"
- "…more than 16,000 dealer counters, to over 6 million customers **published**"
- "…four stages and eight separate signatures **client-reported**"

These are the sourcing convention from the rewrite doc, not English. They should either be
removed or converted to a real citation treatment.

### A6. Placeholder copy still live in three places

1. **Industry Challenges** (lines 369–388) — three cards of lorem ipsum.
2. **§04 and §05 lead paragraphs** (lines 398–402 and 418–422) — the *identical* filler
   sentence, *"Each step in my career has taken me closer to the bigger picture…"*, which is
   about Hao's career and not about either section.
3. **The three lesson cards** (lines 559–561) — *"Short lesson learned (keyword, short 3 keys)"*.

### A7. §06's opening paragraph is a copy-paste

Lines 548–553 duplicate the Homepage card paragraph from line 447 verbatim — card-ordering
rationale sitting under a heading about what happened after launch.

### A8. Minor

- The Homepage feature picker (lines 465–470) points all four rows at the same render. Known
  and commented in the source, but it means three of the four rows do nothing visible.
- `<h3>Industry Challenges</h3>` wraps a grid of `<h3>`s — flat heading hierarchy inside the card.
- The TOC lists six sections; "Related case studies" is unlisted (probably fine, noting it).

---

## Part B — Information and story

### What works

The spine is right and it is Hao's own: **four goals, equal weight → one problem, sequenced.**
Sections 01–03 build it properly. The benchmark figure is the best thing on the page — it does
the argumentative work that most portfolio charts only decorate.

### The payoff never lands

`§built` is titled *"Signing first, then everything downstream of it"* and then does not argue
it. There is no option set, nothing killed, no reason signing beat remarketing or payment. It
is a headline over filler and an image band.

This is the **load-bearing beat of the whole case study**. A reader currently leaves knowing
the market context and the screens, but not the decision — which is the only part that
demonstrates product judgement rather than execution.

Per `HD-Saison-Research-and-Rewrite.md` Part E item 6, this beat is still unconfirmed: the
options and the kill were reconstructed from the old page. **If the real decision was
different, this section is fiction.** It needs Hao's account before it can be written.

### Research → build has no hinge

`§research` ends on Industry Challenges, then `§built` opens on the solution. The reframe —
the moment four flat goals became one sequenced problem — belongs in that gap and isn't
anywhere.

### Heading voice is inconsistent

Every other h2 is a sentence that carries a claim: *"Every loan started at a counter"*,
*"It shipped, and then I stopped looking"*. `§research` is labelled **"UX Research Findings"**,
which is a filing category. Something like **"Four competitors had already left the counter"**
puts the finding in the heading, where it does work.

### Missing, and available

- The **shipped status** (A2 above).
- **3.0★ from ~2,500 ratings.** Not a good score, and the first thing an interviewer will
  find. Saying it first is worth more than it costs.
- **41% motorbike-loan share, up from 34%** — verified, strong, and currently unused.

---

## Part C — UX Research: deep-diving the hover panel

The insight card today shows: lender name, a blurb, the 50-dot strip, three raw metrics. It
**states facts but does not compare** — which is the entire purpose of a benchmark.

Proposed additions, in priority order:

1. **Express every metric relative to HD Saison.** "1.07M visits" means little on its own;
   "**9× HD Saison**" means everything. One delta line under each metric.
2. **Ghost HD Saison's dot strip behind the hovered lender's.** Every hover then reads as a
   gap rather than an isolated fact card.
3. **Add a fourth data line: the channel.** "18% online" is a number. "18% online, through an
   app" is a finding — it tells the reader what HD Saison would have to build, not just that
   it was behind. This is the single highest-value addition.
4. **A rank chip** tying back to the market-share bar above — e.g. *"#2 by market share, #3 by
   digital share"* — so the two figures in the section talk to each other instead of sitting
   as separate exhibits.
5. **One "so what" line per lender.** JACCS and Home Credit's blurbs already do this
   ("Neither of those advantages depends on a branch"). FE Credit's and EasyCredit's are
   description. All five should end on an implication.
6. **Bidirectional highlight.** Hovering a logo should highlight its table row, and hovering a
   row should highlight its logo. The table and the map are currently the same data twice with
   no visible link.
7. **Click-to-pin.** The interaction is hover-only, so touch and keyboard users see the default
   card and nothing else. Pinning also lets a reader hold a comparison while reading the table.

---

## Part D — Industry Challenges, short version

Pattern: icon + 3–4 word title + one sentence under 20 words. Three cards, no more.

> **Wet ink by default**
> The law allowed electronic signing. The operation had no precedent for accepting it.

> **Trust sat at the counter**
> Borrowers verified the deal by reading a person's face, not a screen.

> **16,000 dealers to protect**
> Any digital path had to add a door without taking sales off the ones already selling.

**Confirm before shipping:** the third is the strongest tension available — a genuine
conflict between the digital thesis and the distribution model — but it needs to be true.
If dealer cannibalisation was never actually raised in the project, replace it rather than
assert it.

---

## Part E — "Looking at the main (This)" lead block

The heading is a working title and the paragraph underneath is career filler unrelated to the
section. Replace both:

> ### Three screens carried the reframe
>
> The home screen ranks unsigned loans above every offer. Loan management makes the next
> payment obvious before it's late. And signing collapsed eight signatures into one.
> Everything else in the brief was sequenced behind these three.

Alternative headings if that one reads too neat: *"Where the decision shows up on screen"*, or
*"The three areas the sequencing produced"*.

**`§built` needs its own lead as well** — it currently shares the same filler paragraph, and
it is the section that should carry the decision argument (Part B above), not more description.

---

## Part F — Lesson cards (the yellow three)

Card length, drawn from `HD-Saison-Research-and-Rewrite.md` §8:

> **Benchmark first**
> I accepted the four-goal brief, then ran the competitor benchmark. It took days and reframed
> everything — it should have been week one.

> **I picked the comfortable metric**
> Approval time was the client's measure. Share of loans originated without a branch visit was
> the one that tested my thesis, and it never got instrumented.

> **Handoff isn't an ending**
> Four years of App Store history exist for this product and I can't tell you what happened in
> the first ninety days.

Optional fourth, if the honesty beat is wanted on the page (the row is a 6-column grid, so a
fourth card fits without wrapping):

> **3.0 stars**
> The app holds 3.0★ from roughly 2,500 ratings. That's the first thing an interviewer will
> find, so I'd rather say it here.

---

## Part G — Suggested order of work

1. **Overview snapshot** (A1) and **leaked citation markers** (A5) — visible defects, no
   research needed, ten minutes.
2. **Label the targets honestly** (A3) and **state that it shipped** (A2).
3. **Lesson cards** (Part F) and **§05 lead block** (Part E) — copy already drafted above.
4. **Industry Challenges** (Part D) — after confirming the dealer point.
5. **Hover panel deep dive** (Part C) — the channel line and the relative metrics first.
6. **§04, the decision beat** (Part B) — blocked on Hao's account of the real decision. This is
   the biggest single improvement available and the only one that can't be written without him.
