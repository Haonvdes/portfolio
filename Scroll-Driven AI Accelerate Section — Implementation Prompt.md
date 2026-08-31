# Implement Scroll-Driven "AI Accelerate" Section

I want you to implement the **AI Accelerate** section shown in the attached reference image.

The reference image represents **4 visual states of the same section**, corresponding to the user's scroll progress. Do NOT implement these as four separate sections or four independent components.

The intended experience is a **single pinned, scroll-driven storytelling animation** where the UI smoothly transitions between these four states.

## Reference

Use the Figma link as the visual reference for the four states:

[https://www.figma.com/design/R2444s7q1V2Rp7Ubd6l5BH/Wrapup?node-id=40000417-8561&t=zwY4JMGTWo0GkMsK-4](https://www.figma.com/design/R2444s7q1V2Rp7Ubd6l5BH/Wrapup?node-id=40000417-8561\&t=zwY4JMGTWo0GkMsK-4)

The image contains:

- STEP 1 — initial state
- STEP 2 — middle circles disappear
- STEP 3 — remaining circles converge
- STEP 4 — final explanatory content appears

Study the reference carefully before implementing.

---

# Core UX

The section should behave like an interactive visual story.

When the user reaches the section:

1. The section becomes pinned/sticky.
2. Scrolling controls the animation progress.
3. The animation smoothly transitions through the four visual states.
4. The user should feel that the diagram is **evolving**, rather than navigating between four separate screens.
5. Once the final state is reached, normal page scrolling resumes.

The animation should feel:

- smooth
- intentional
- premium
- calm
- responsive
- visually coherent
- not overly flashy

Avoid excessive bouncing, elastic effects, dramatic rotations, or unnecessary effects.

The animation should communicate a clear narrative:

**Explore the product lifecycle → narrow the process → bring the remaining capabilities together → reveal how AI supports the product lifecycle.**

---

# Technical Approach

Prefer **GSAP + ScrollTrigger** if the project already supports GSAP.

If GSAP is not installed:

- first inspect the existing project structure and dependencies
- if adding GSAP is appropriate, install/use it
- otherwise implement an equivalent scroll-progress animation using the existing stack

Do NOT introduce a large animation framework unnecessarily.

Use a **single ScrollTrigger/timeline** controlling the entire sequence.

Conceptually:

```text
SECTION ENTERS
      ↓
PIN SECTION
      ↓
STEP 1
      ↓
STEP 2
      ↓
STEP 3
      ↓
STEP 4
      ↓
UNPIN
      ↓
NORMAL PAGE SCROLL
```

The animation should be tied to scroll progress (`scrub`) rather than triggered as four independent animations.

---

# STEP 1 — Initial State

At the beginning of the pinned section:

Show:

### Heading

AI Accelerate

### Supporting text

Revert Engineering, Integrate customer data enables insight generation across product horizontal

Keep the existing typography/system of the website if these already exist. Do not arbitrarily introduce a new visual language.

Below the heading, show four circular elements arranged horizontally:

```text
DISCOVERY → VALIDATE → BUILD → LAUNCH
```

Colors from the reference:

- Discovery — yellow
- Validate — blue
- Build — lime/green
- Launch — green

Each circle should have:

- circular shape
- centered label
- subtle border
- small directional arrow indicators around the circumference if present in the existing design/reference

The four circles should enter smoothly.

Do not make them pop in aggressively.

A subtle combination of:

- opacity
- scale
- slight vertical movement

is acceptable.

---

# STEP 2 — Remove the Middle Stages

As the user continues scrolling:

The two middle circles:

- VALIDATE
- BUILD

should smoothly disappear.

The remaining:

- DISCOVERY
- LAUNCH

stay visually anchored.

The disappearing circles should NOT suddenly be removed from the DOM or switch to `display: none`.

Animate them using something like:

```text
opacity → 0
scale → 0
```

Optionally use a very subtle blur if it looks good, but do not overdo it.

The transition should feel like the process is being simplified.

Target visual state:

```text
DISCOVERY                    LAUNCH
    ●                          ●
```

---

# STEP 3 — Bring the Remaining Circles Together

This is the key transition.

The remaining:

- DISCOVERY
- LAUNCH

should smoothly move toward each other.

They should converge into the final arrangement shown in the reference.

Important:

Do NOT simply teleport them to the center.

Their movement must be directly controlled by scroll progress.

Both circles should move simultaneously and symmetrically.

Conceptually:

```text
●                              ●

       ↓                ↓

          ●        ●
```

The final spacing should be visually intentional and match the reference as closely as possible.

Do not overlap them unless the reference/layout clearly requires it.

The circles should settle naturally before the next content appears.

---

# STEP 4 — Reveal the AI Enabled Content

After the circles have converged, continue scrolling.

Reveal:

### Heading

AI ENABLED IN ACROSS PRODUCT PHASE

Then reveal the bordered information container beneath it.

The container should contain two conceptual groups:

### Discovery, Validate, and Experiment

- Revert Engineering
- Set strategy and vision
- Empathize
- Ideate
- Experiment
- Learn

### Build, Launch and Scale

- Code, Build, Test
- Release and deploy
- Customer adoption
- Product usage and analytics

Use the reference image for the exact visual hierarchy and layout.

The final state should feel like the **logical conclusion of the animation**, not like a new unrelated section suddenly appearing.

Recommended transition:

```text
heading:
opacity 0 → 1
y: 20px → 0

container:
opacity 0 → 1
y: 30px → 0
```

The container can appear slightly after the heading.

Keep the transition subtle.

---

# Scroll Timing

Use one continuous timeline divided roughly into four phases:

```text
0% ───────── 25%
STEP 1
Initial diagram appears

25% ───────── 50%
STEP 2
Validate + Build disappear

50% ───────── 75%
STEP 3
Discovery + Launch converge

75% ───────── 100%
STEP 4
Final heading + information container appear
```

These percentages are guidelines, not hard requirements.

Adjust the timing if necessary to create a better UX.

The most important thing is that each state has enough scroll distance for the user to understand what happened.

---

# Pinning

The section should remain fixed in the viewport while the animation progresses.

Use ScrollTrigger-style behavior:

```text
start: section reaches viewport
pin: true
scrub: smooth
end: sufficient scroll distance for the entire animation
```

The exact scroll distance should be tuned based on the actual viewport and content.

Do not make the section so long that the interaction becomes tedious.

Desktop should feel like a deliberate storytelling moment, not a 10-second animation.

---

# Smoothness

Prioritize animation performance.

Requirements:

- animate `transform` and `opacity` wherever possible
- avoid continuously animating layout properties such as `top`, `left`, `width`, etc.
- avoid unnecessary React re-renders during scroll
- do not attach expensive custom `scroll` listeners if ScrollTrigger can handle it
- use GPU-friendly transforms
- prevent layout jumps
- ensure fonts/images are loaded without causing the animation to shift

The animation should remain smooth at normal desktop scrolling speeds.

---

# Responsive Behavior

Do not blindly apply the desktop animation to mobile.

First inspect the existing responsive system.

### Desktop

Use the full interaction described above.

### Tablet

Reduce spacing and circle sizes while preserving the storytelling.

### Mobile

If four circles cannot comfortably fit horizontally, adapt the composition intelligently.

Possible approach:

- stack/reposition the circles
- maintain the same four-stage narrative
- preserve the convergence concept
- avoid making the user scroll an excessive distance

Do NOT allow:

- text overlap
- circles going outside the viewport
- horizontal page overflow
- tiny unreadable labels
- excessive empty space

Use responsive breakpoints consistent with the existing website.

---

# Important UX Detail — Scroll Progress vs Snap

The interaction should primarily be **scroll-controlled**, not click-controlled.

However, if appropriate, use subtle ScrollTrigger snapping between the four major states.

For example:

```text
0.00
0.25
0.50
0.75
1.00
```

Only use snapping if it improves the experience.

Do NOT make the page feel like it is fighting the user's scroll.

If the user scrolls quickly, the animation should still feel natural.

If the user scrolls slowly, they should be able to observe the transitions.

---

# Visual Fidelity

Use the supplied reference as the source of truth for:

- relative positioning
- scale
- hierarchy
- spacing
- colors
- circle relationships
- final container structure

But do NOT sacrifice usability just to reproduce pixel positions from the screenshot.

The screenshot represents visual states, not necessarily the exact responsive implementation.

Preserve the existing site's:

- typography
- spacing system
- grid
- border radius
- color system
- visual language

unless the reference explicitly requires otherwise.

---

# Accessibility

The animation must not make the content inaccessible.

Ensure:

- semantic headings are real HTML headings
- text remains selectable
- important information is present in the DOM
- screen readers can access the final information
- animation is decorative/progressive enhancement rather than the only way to access the content

Respect:

```css
prefers-reduced-motion
```

For users who prefer reduced motion:

- disable the complex scroll animation
- show a static, readable final composition
- preserve all important content

---

# Implementation Quality

Before coding:

1. Inspect the existing project.
2. Identify the current component/page containing this section.
3. Identify the existing CSS/design system.
4. Identify whether GSAP is already installed.
5. Reuse existing components/styles where appropriate.
6. Do not rewrite unrelated parts of the site.

Then implement the section cleanly.

Prefer a structure conceptually similar to:

```text
AIAccessSection
├── Header
│   ├── Step indicator
│   ├── Heading
│   └── Description
│
├── ProcessVisualization
│   ├── Discovery
│   ├── Validate
│   ├── Build
│   └── Launch
│
└── AIEnabledContent
    ├── Heading
    └── InformationContainer
```

The exact component structure should follow the existing project conventions.

---

# Critical Requirement

Do NOT interpret the four screenshots as four pages or four components that appear/disappear.

They are **four keyframes/states of ONE scroll-driven animation**.

The user should experience:

> "I'm scrolling through one visual story and the diagram is transforming in response to my scroll."

not:

> "I'm scrolling through four slides."

---

# Final QA

After implementation, test:

### Desktop

- section enters correctly
- pinning works
- STEP 1 appears correctly
- middle circles disappear smoothly
- remaining circles converge smoothly
- final heading appears at the right moment
- information container appears naturally
- section unpins correctly
- no scroll jump
- no horizontal overflow

### Fast scrolling

Test rapidly scrolling through the section.

The animation must not:

- break
- leave elements in the wrong state
- skip permanently
- create duplicated elements

### Reverse scrolling

This is important.

When the user scrolls back upward, the animation should reverse smoothly:

```text
STEP 4
↓
STEP 3
↓
STEP 2
↓
STEP 1
```

Nothing should rely on one-time-only triggers.

### Mobile

Verify the layout and interaction remain usable.

### Reduced motion

Verify the static fallback.

---

# Success Criteria

Consider the implementation successful only if:

1. It feels like a premium scroll-driven interaction.
2. The four reference images correspond naturally to four states of one animation.
3. Every transition is smooth and reversible.
4. The user understands the visual transformation without needing instructions.
5. The final content feels causally connected to the circles.
6. The section does not feel unnecessarily long.
7. The animation performs smoothly.
8. It works responsively.
9. It does not break the rest of the website.
10. The implementation is maintainable and follows the existing codebase conventions.

After implementation, briefly report:

- what files/components were changed
- whether GSAP/ScrollTrigger was used
- how the four scroll phases were implemented
- any responsive decisions made
- any issues that remain
