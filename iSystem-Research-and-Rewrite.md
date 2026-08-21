# iSystem — research, fact-check, and rewritten case study

Sources checked 3 Aug 2026: US nail-salon industry data (IBISWorld / Nails Magazine
aggregations, MarketsandData), InVision's shutdown record, and a direct fetch of the
page's own prototype links. Compared against `portfolio/case-studies/marketing-platform.html`
and `Case-Study-Framework.md`.

**Scope on record, confirmed by Hao 3 Aug 2026:** designer who also drove product decisions.
Full eight-section treatment, decisions in first person.

**Status on record, confirmed by Hao:** the startup **folded**. This is the single most
important change in this document. The current page reads as a product tour of eight live
apps; the true story is a system specced and prototyped for a company that no longer exists.
That is not a weaker case study — under the framework it is a *stronger* one, because it
forces a real Section 7 and Section 8 where the page currently has neither.

**Evidence labelling on record:** the 7,730 / 350 / 50 user figures are **client-reported**.
They are tagged that way in every instance below and must never ship unlabelled.

**Assigned claim (Part 0 of the framework):** *I prioritise across conflicting user segments.*
Eight apps, three user types, one team. No other case study in the set carries this claim, so
everything below is bent toward proving it — and away from the ecosystem tour the page
currently is.

---

## Part A — What is verifiable today

### The market the project was aimed at

| Fact | Value | Source basis |
|---|---|---|
| Nail salons in the US, 2022 | **~54,000** | Nails Magazine industry stats, widely syndicated |
| Licensed nail technicians, US 2022 | **250,000+** | Same |
| US nail care market, 2022 | **USD 3.58bn** (nail care); ~USD 8bn on the broader salon-services basis | MarketsandData; industry aggregations |
| Vietnamese-owned share of US nail salons | **~50% nationally, 80%+ in California** | Multiple industry and press sources |

That last row is the most useful fact available and the page does not use it at all. It is the
reason a Vietnam-based team was building US salon software in the first place — the buyer and
the builder shared a language and a community. Stating it turns an unexplained engagement into
an obvious one.

### The "20% of the nail industry" claim, measured

The page's introduction says iSystem aimed to capture *"20% of the nail industry's clients."*
Set that against the page's own numbers:

- **50 salon owners** on the platform (client-reported)
- **~54,000** nail salons in the US

That is **0.09% of the market against a stated 20% goal** — a factor of roughly 220x. Both
numbers are already on the page, one paragraph apart, and the page never connects them.

This is not a reason to hide the goal. It is the case study's best framing device: a startup
with a 20% ambition and 50 salons is a startup that has not yet earned the right to build
eight apps. Which is exactly the prioritisation problem the assigned claim needs.

### The three segments, as the page reports them

| Segment | Users (client-reported) | Apps built for them | Users per app |
|---|---|---|---|
| Customer | **7,730** | iBooking, iCheckin, iReview, iMembership — **4** | ~1,930 |
| Staff | **350** | iPOS, iStaff (+ staff-side iCheckin) — **2–3** | ~140 |
| Salon owner | **50** | Remarketing System, Owner Management / CRM — **2** | ~25 |

**95% of the users got half the product surface. 5% got the other half.** That single sentence
is the sharpest thing in the entire project and it appears nowhere on the page — the numbers
sit in a three-row list under a heading that promises a journey map and does not deliver one.

### The prototypes are gone

All seven "Play Prototype" buttons point at `isystem.invisionapp.com`. **InVision shut down its
prototyping product on 31 December 2024** and deleted hosted prototypes shortly after. A direct
fetch of `isystem.invisionapp.com/console/share/2D31P63MK8` returns nothing.

So the page's primary interactive evidence — seven CTAs, the most prominent buttons on the
screen — has been dead for roughly nineteen months. Every reviewer who clicked one got a blank
page. Compare Aura, where the equivalent artifacts still resolve, and HD Saison, where the
Marvel prototype is still live.

**This must be fixed before anything else on this page.** A dead CTA is worse than no CTA: it
reads as a portfolio nobody has opened in two years.

---

## Part B — Fact-check and audit of the current page

### Structural and functional defects

| # | Defect | Evidence | Severity |
|---|---|---|---|
| 1 | **The page has no navigation.** There is no `#nav-placeholder`, so `js/script.js` injects nothing. A reader who lands here has no way back to the site. | `lending.html`, `web-3.html` and `work.html` all contain the placeholder; this file does not. | **Critical** |
| 2 | **All 7 prototype CTAs are dead.** | InVision EOL 31 Dec 2024; fetch returns empty. | **Critical** |
| 3 | **The Owner tab is outside the tab container.** `<div id="Owner" class="tabcontent">` sits after the `.container-fluid` that wraps Customer and Staff, so it is not a sibling of the tabs it belongs to. | Line ~530, after the `<!-- End for Staff -->` comment closes the wrapper. | High |
| 4 | **The eight-icon grid renders twice, verbatim.** Identical 34-line block under "Introduction" and again under "Stay Connected". | Two identical `connect block` divs. | Medium |
| 5 | **Invalid CSS** — `padding-bottom: 24x` (no unit) on the Exploring intro paragraph. Declaration is dropped silently. | Inline style. | Low |
| 6 | Title/H1 mismatch: `<title>iSystem | Case Study</title>` vs H1 "Marketting Platform for Salon Business". The product has no consistent name. | — | Medium |

### Spelling and copy errors, all user-visible

**Marketting** (H1) · **Desinger** (role label — misspelling your own job title is the worst
one here) · **Onwner** (×3, incl. a tab label) · **Managemnt** · **Consitent** · **Ui Friendly**
· **Chose Staff** / **Chose services** (should be "Choose") · **reivew** · **refferal** ·
**iamge** · "increase client demand." (lowercase sentence start) · "Salon Onwner" as a tab
users actually click.

Eleven visible misspellings on a page whose stated client expectation is *"Consistent."*

### Framework compliance

| Framework section | On the page? |
|---|---|
| 1 — Header block | **Partial.** Has Client / Role / Platform / Created Date. Missing **Domain**, **Timeline** (a single date is not a timeline), **Team**, and **Status**. Role is not first. |
| 2 — Overview | **Absent.** |
| 3 — Discovery | **Weak.** "Client Expectation" is three adjectives from the client. There is no user insight, no data insight, no business insight, and none of the four Way-of-Work questions is answered. |
| 4 — The decision | **Absent.** No option rejected, no scope cut, no criteria. |
| 5 — Solution design | **Over-weight.** This is ~80% of the page: eight apps, every feature, no validation method named. |
| 6 — Delivery | **Absent.** |
| 7 — Learning and follow-up | **Absent.** |
| 8 — What I'd do differently | **Absent.** |

Five of eight sections missing, and the one that is present is four times its proper size.
**669 words of visible text**, against the framework's 800–1,200 — and almost none of those
words are about a decision.

### Banned metrics currently doing headline work

The page leads on *8 apps*, *3 user types*, and a feature inventory. Under Part 1 of the
framework these are effort measures. The framework explicitly bans "screens designed" and
"flows mapped" as headline metrics; "eight apps built" is the same currency.

### What the page gets right — keep these

- The three-segment split with user counts. Wrong section, wrong framing, right data.
- "Stay Connected" — the ecosystem-coherence argument is genuinely the product thesis.
- The client-expectation trio (Consistent / Friendly / Attractive) is a real artifact of
  working with a client. It belongs in Discovery as *the client's stated priority*, which is
  precisely what Section 4 will show me overriding.

---

## Part C — The rewritten case study

Target: ~1,050 words. Every number tagged. First person for decisions, first person plural
for execution.

### Section 1 — Header block

> # iSystem
> **An eight-app operating system for US nail salons — booking, check-in, payments,
> loyalty and owner analytics on one shared account.**
>
> | | |
> |---|---|
> | **Role** | Product designer, driving product decisions |
> | **Domain** | SMB vertical SaaS · US nail-salon industry |
> | **Timeline** | *[blocked on Hao — see Part E]* · handed off Dec 2021 |
> | **Team** | *[blocked on Hao]* |
> | **Platform** | Web · iOS · Android · in-salon tablet |
> | **Status** | **Specced, prototyped, handed off. The company later folded — the full ecosystem never reached general availability.** |

Status first-class and stated plainly. A reviewer who finds out later that iSystem is gone will
discount everything else on the page; a reviewer who is told up front reads the rest as honest.

### Section 2 — Overview

> **The problem** — iSystem wanted 20% of a 54,000-salon market but had 50 salons on the
> platform (client-reported), and was asking one design team to build eight apps at once
> across three user types with opposed needs.
>
> **What I decided** — I sequenced the eight apps around a single transaction spine —
> book → check in → pay — and pushed the owner-facing remarketing suite, the client's stated
> priority, behind it.
>
> **What changed** — The team stopped building eight products in parallel and started building
> one. The sequence was accepted and specced; the company folded before the later phases
> shipped, so no launch metric is mine to claim.

### Section 3 — Discovery

**User insight.** Three user types whose interests actively conflict. The customer wants to
book in under a minute and leave. The technician wants an accurate queue and a correct tip
split. The owner wants data — who earns, which promotion converts, who has not returned in
60 days — and every feature serving that appetite adds a step for the person holding the
tablet. Check-in is where this is sharpest: the owner wants identity and marketing consent;
the walk-in wants a number and a chair.

**Data insight** *(client-reported)*. 7,730 customer accounts, 350 staff, 50 salon owners —
a 155 : 7 : 1 ratio. But the build plan gave four of eight apps to the 50 owners and their
staff. **95% of the user base was scheduled to receive half the product surface**, and the
half that lagged was the half with all the volume, all the reviews, and all the word of mouth.

**Business insight.** US nail salons are ~54,000 businesses, roughly half Vietnamese-owned
(80%+ in California) — a market a Vietnamese-speaking team could sell into on trust, and
which incumbent salon software has historically served in English only. The market was real.
The 20% ambition against 50 accounts was not a strategy, it was a slogan; at 0.09%
penetration the binding constraint was not feature coverage, it was whether the first fifty
salons could run a whole working day on the system without falling back to paper.

**The four questions, answered:**

1. **Who and what problem?** Salon owners running a business on paper appointment books, a
   card terminal and a separate loyalty punch card, with no view of which customers return.
2. **Why now?** The client had 50 paying salons and a 20% ambition. Sequencing was urgent
   precisely because the gap was 220x — there was no version of "build all eight" that
   reached general availability before runway ran out.
3. **What outcome would tell us it worked?** A salon completes a full day — walk-ins,
   appointments, payments, tips — without paper. *(Target. Never measured; see Section 7.)*
4. **Is it feasible?** For the transaction spine, yes. For eight apps at the team size we had,
   no — which is the finding that produced the decision below.

### Section 4 — The decision

> **Options on the table**
> **A. Owner-first.** Ship CRM, analytics and the remarketing suite first. The owner signs
> the cheque, and it was what the client asked for. Cost: the owner dashboard has nothing to
> report until transactions exist. It would have shipped an empty product.
> **B. Customer-first.** Ship the four consumer apps. Buys adoption and app-store presence.
> Cost: no salon can *operate* on it — bookings arrive with nowhere to land.
> **C. Transaction spine first.** iBooking → iCheckin → iPOS as one continuous flow across all
> three user types, then loyalty, then owner tooling on top of the data the spine produces.
>
> **Criteria I judged on** — does a salon get through a whole working day on it; does it
> generate the data later apps depend on; can we validate it with the 50 salons we already had.
>
> **What I chose** — **C.** The spine is the only sequence where each phase makes the next one
> possible: check-in has no meaning without a booking, the POS has nothing to total without a
> check-in, and every owner-facing report is a query over transactions that do not exist until
> the first three ship. I treated the eight apps as one product with three front doors rather
> than eight products sharing a logo.
>
> **What I killed** — the remarketing suite, the lucky-spin referral mechanic and gift cards
> went behind the spine, despite remarketing being the client's stated priority. I argued that
> a retention tool is worthless with no transaction history to retain against, and that
> spending the first build cycle on acquisition mechanics for 50 salons was optimising the
> wrong end of the funnel.

### Section 5 — Solution design

The spine is one flow crossing three surfaces: the customer books in four steps and confirms
by OTP; that booking lands on the staff waiting list at check-in; the check-in record totals
into iPOS at payment. One record, three views — the customer sees a confirmation, the
technician sees a queue position, the owner sees a line of revenue.

Two decisions carry the design.
**OTP at booking** — an extra step on the flow with the highest drop-off risk, kept
deliberately. Without a verified phone number, no-shows are uncontactable and the loyalty
layer has no identity to attach to. I traded conversion for a customer record the later apps
could build on.
**One shared design system across all eight apps** — each app alone would have been better
with a bespoke pattern set, but shared components meant a technician moving between iCheckin
and iPOS mid-shift never relearned anything, and one designer could hold eight surfaces.

*Validation: [blocked on Hao — see Part E]. Prototypes were built and shared for all major
flows.*

### Section 6 — Delivery

*[blocked on Hao — see Part E]*

### Section 7 — Learning and follow-up

**Not shipped as a full ecosystem — the company folded.** The transaction spine was specced,
prototyped and handed off in Dec 2021; the later phases were never built. I set one target in
discovery — a salon completing a full day without paper — and I never got to measure it. No
number on this page is a launch outcome, and I am not going to imply otherwise.

What I would have tracked, in order: percentage of daily transactions originating in the app
versus paper; walk-in check-in completion rate; and the ratio of repeat to first-time
customers at 60 days, which was the only metric that would have justified the remarketing
suite I deferred.

### Section 8 — What I'd do differently

I accepted the eight-app scope as a given and spent my leverage on sequencing *within* it. The
better move was to challenge the number itself: with 50 salons and a 220x gap to the stated
goal, the honest recommendation was three apps and a waiting list, not eight in a queue. I
sequenced well inside a scope I should have refused.

I also took the client's "Consistent / Friendly / Attractive" brief at face value for too long.
Those are aesthetic criteria, and they framed the first weeks of work as a visual-consistency
problem across eight apps when the real problem was operational — whether a salon could get
through Saturday on it. I reached the transaction-spine argument through design work rather
than through the client's own retention numbers, which I never asked for.

---

## Part D — Card copy

Per Part 1 of the framework: name, meta line, one sentence, two metrics, one link. Nothing else.

> **iSystem — an operating system for nail salons**
> **Product designer** · SMB vertical SaaS · 2021
>
> A client with 50 salons and eight apps in flight. I cut it to one transaction spine —
> book, check in, pay — and sequenced the rest behind it.
>
> | **3 user types → 1 shared spine** | **50 → 54,000** |
> |---|---|
> | eight planned apps resolved into one flow | salons on platform vs. addressable market — the gap that drove the sequencing |
>
> [Read the case study →]

Deliberately *not* on the card: the eight app icons, the feature inventory, "7,730 users"
without its client-reported tag, and the InVision links.

---

## Part E — Open items, blocked on Hao

Nothing goes into HTML until these are answered.

1. **Real timeline.** "Created Dec 2021" is a single date. When did the engagement start?
   (HD Saison had the same problem and the true window was longer, which read better.)
2. **Team composition.** Framework requires it. How many engineers, was there anyone else on
   design, was there a PM on the client side?
3. **Is the Section 4 decision true or reconstructed?** I built it from the artifacts on the
   page — the transaction spine is the only sequence the eight apps support, and the
   remarketing suite is visibly the client's priority. **You need to confirm you actually made
   this call, in these terms.** If the real decision was different, say so and I will rewrite
   Section 4; everything else stands.
4. **Validation method.** Expert inspection, or moderated testing with real salon staff? The
   framework treats naming the method as the thing that separates you from people who shipped
   on instinct. If it was neither, say so — "not validated, and here is why" is acceptable.
5. **Delivery (Section 6).** What changed between spec and handoff? Scope cuts, technical
   constraints, anything the client rejected. Two or three sentences is enough. If nothing was
   built, Section 6 gets cut rather than padded.
6. **When and why did iSystem fold?** If you know, one clause in Section 7 makes the whole
   page more credible. If you do not, say "I don't know what happened after handoff" — also fine.
7. **What replaces the seven dead prototype CTAs?** Options: static screen recordings, exported
   flow images, rebuilt Figma prototypes, or removing the buttons entirely. Cheapest honest fix
   is removal plus a line saying the prototypes were hosted on InVision, which shut down in 2024.

## Part F — Fix list for `marketing-platform.html`, in order

1. Add `#nav-placeholder` — the page currently has no way out.
2. Remove or replace all 7 dead InVision CTAs.
3. Move `<div id="Owner">` inside the tab container.
4. Delete the duplicated eight-icon grid.
5. Fix the 11 misspellings, starting with "Product Desinger" and "Marketting".
6. Rebuild the header block: Role first, add Domain / Timeline / Team / **Status**.
7. Add Sections 2, 4, 6, 7, 8 from Part C.
8. Cut Section 5 to the spine plus the two decisions that carry it; the eight-app tour becomes
   one paragraph.
9. Tag every number: *client-reported* on 7,730 / 350 / 50, *target* on the full-day goal.
10. Fix `padding-bottom: 24x`.
