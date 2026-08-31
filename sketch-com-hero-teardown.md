# sketch.com — Background Colors & Hero Load Animation

A teardown of the homepage at `https://www.sketch.com/`, measured live in the browser (computed styles, stylesheet rules, and pixel sampling of the background image).

---

## 1. Background colors

### Base page

| Element | Value | Notes |
|---|---|---|
| `<body>` | `#f5f5f5` | **The real page background.** |
| `<html>` | `transparent` | — |
| `<main>` | `transparent` | — |
| every `<section>` | `transparent` | Nothing paints its own bg; `#f5f5f5` shows through. |
| `<footer>` | `#fafafa` | Slightly lighter than the body. |

### The pastel glow in the hero

It is **not** a CSS gradient — it's a large raster image layered behind the content:

```html
<div class="hero__orbs-wrapper">
  <img src="https://cdn.sketch.com/assets/pages/home/orbs@2x.webp" class="hero__orbs">
</div>
```

```css
.hero__orbs-wrapper {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 160rem;
  overflow: hidden; pointer-events: none; z-index: -1;
}
.hero__orbs {
  position: absolute; top: 0; left: 50%;
  width: 240rem; height: auto;
  transform: translateX(-50%);
  overflow-x: clip; z-index: -1;
}
```

Colors sampled from that image (7680 × 3148 source):

| Region | Hex |
|---|---|
| Outer edges / fade-out | `#f6f6f6` |
| Pink-ish blend, left of center | `#efe5eb` |
| Lavender core | `#e8def1` |
| Lavender core, deeper | `#e3d8f3` |
| Blue-violet orb, right side | `#e4dffe` |

Dominant quantized buckets: `#f0f0f0` (most of the frame), then `#f0e0f0`, `#e0e0f0`, `#e0d0f0`.

### Other notable backgrounds

```css
/* dark feature cards */
.item__inner { background-image: linear-gradient(rgba(0,0,0,0) 0%, #141d33 50%); }

/* primary button glow */
.button-new-glow { background-image: linear-gradient(104deg, #fc7a9b 0%, #b47eee 100%); }

/* button sheen overlay */
.button-new--primary {
  background-image: linear-gradient(rgba(255,255,255,0) 0%,
                                    rgba(255,255,255,.05) 50%,
                                    rgba(255,255,255,.15) 100%);
}

/* section badges */
.section--design    .section__badge { background: linear-gradient(191deg, #f7e5c6 0%, #efd3d7 100%); }
.section--prototype .section__badge { background: linear-gradient(29deg,  #b9e8de 0%, rgba(0,199,184,.27) 100%); }
.section--collaborate .section__badge { background: linear-gradient(204deg, #dceefe 0%, #d2d8f9 100%); }

/* rainbow hairline under the about card */
.about__card::after {
  background-image: linear-gradient(90deg,
    #fcc1c1 0%, #efd3e0 17%, #ddc8f5 33%, #c8cff9 50%,
    #b6ecb7 67%, #f9dda5 83%, #ffc399 100%);
}
```

### Recreating the look

```css
body { background: #f5f5f5; }

.hero-glow {
  position: absolute; inset: 0 0 auto 0; height: 160vh; z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(60% 45% at 55% 25%, #e4dffe 0%, transparent 70%),
    radial-gradient(45% 40% at 30% 35%, #efe5eb 0%, transparent 70%),
    radial-gradient(50% 40% at 50% 30%, #e3d8f3 0%, transparent 75%);
}
```

---

## 2. First-load hero animation

### What does *not* animate

The `<h1>`, the lead paragraph, and the CTA carry **no** entrance classes — they paint immediately on first frame. The orbs image is static. The only motion in the hero is the app screenshot.

### Observed timeline (captured on reload)

| Time | State |
|---|---|
| ~0 ms | Hero text + pastel gradient already visible; empty space below. |
| ~300 ms | Screenshot has appeared, tilted steeply back in 3D, mid-fade. |
| ~700 ms | Nearly flat and fully opaque. |
| 800 ms | Settled. |

### The tilt

```html
<section class="canvas">
  <div class="canvas__perspective">
    <div class="canvas__asset entrance entrance--tiltUp"
         data-controller="entrance"
         data-home-target="canvas">
      <img class="canvas__asset__image" src="…">
    </div>
  </div>
</section>
```

```css
:root { --rotationAmount: 3deg; }   /* overwritten by JS at runtime */

.canvas__perspective {
  perspective: 30rem;      /* 480px — perspective lives on the PARENT */
  max-width: 100rem;
  margin: 0 auto;
}

.canvas__asset {
  opacity: 0;
  transform: rotateX(2deg) rotateY(0deg);
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform .25s;
  background: #f5f5f5;
  border-radius: 1.625rem 1.625rem 0 0;
  box-shadow: 0 40px 200px #c8abad;   /* warm pink, not grey */
  max-width: 90rem;
  margin: 0 auto;
}

@keyframes tiltInUp {
  0%   { opacity: 0; transform: rotateX(12deg) rotateY(0deg); }
  100% { opacity: 1; transform: rotateX(var(--rotationAmount)) rotateY(0deg); }
}

.canvas__asset.entrance.was-shown {
  animation-name: tiltInUp;
  animation-duration: .8s;
  animation-timing-function: cubic-bezier(.785, .135, .15, .86);
  animation-fill-mode: both;
}
```

**Key details**

- **12° → ~1°** rotation on the X axis, plus `opacity: 0 → 1`.
- **0.8s**, easing `cubic-bezier(.785, .135, .15, .86)` — slow start, snap through the middle, soft settle.
- `--rotationAmount` defaults to `3deg` in CSS, then JS overwrites it based on viewport size. At a 1080px-wide window it resolved to **`1.103deg`**.
- It is **not** scroll-driven. Sampled at `scrollY` 0 → 800 and the value never changed.
- `perspective` on the parent + `preserve-3d` on the child is what makes it read as depth instead of a vertical squash.
- The `#c8abad` shadow is deliberately tinted so it blends into the pink orbs rather than looking muddy.

### The trigger

A Stimulus controller (`data-controller="entrance"`) with an IntersectionObserver adds `.was-shown` when the element enters the viewport.

```css
/* hidden until observed */
.entrance:not(.was-shown):not(.no-js) { opacity: 0; }
.entrance.entrance--fadeUp:not(.was-shown):not(.no-js)   { transform: translateY(2rem); }
.entrance.entrance--fadeDown:not(.was-shown):not(.no-js) { transform: translateY(-2rem); }

/* shared defaults */
.entrance { --entrance-animation-delay: 0s; }
.entrance:not([data-entrance-split-value]) {
  animation-duration: .8s;
  animation-timing-function: cubic-bezier(.19, 1, .22, 1);
  animation-delay: var(--entrance-animation-delay);
  animation-fill-mode: both;
}
```

Notes on the system:

- `.no-js` fallback plays every entrance animation unconditionally, so nothing is stuck invisible without JS.
- A reduced-motion block collapses `animation-duration` to `1ms` and `animation-delay` to `0s`.
- Text can be split into words or lines via `data-entrance-split-value`, staggering `.1s` per word or `.2s` per line:
  ```css
  animation-delay: calc(var(--entrance-animation-delay) + var(--word-index) * .1s);
  ```

### Full entrance variant library

| Class | Keyframes |
|---|---|
| `entrance--fade` | `opacity: 0 → 1` |
| `entrance--fadeUp` | `translateY(2rem) → 0`, fade |
| `entrance--fadeDown` | `translateY(-2rem) → 0`, fade |
| `entrance--drop` | `scale(1.333) → 1`, fade |
| `entrance--zoom` | `scale(.9) → 1`, fade |
| `entrance--scaleDown` | `translateY(-.75rem) scale(.95) → 0 / 1`, fade |
| `entrance--tiltUp` | `rotateX(12deg) → rotateX(var(--rotationAmount))`, fade |
| `entrance--lay` | `layIn` |

Default easing for all of them is `cubic-bezier(.19, 1, .22, 1)` (a strong ease-out); `--tiltUp` on the canvas asset overrides it to `cubic-bezier(.785, .135, .15, .86)`.

### Bottom fade into the page

```css
.canvas::after {
  content: "";
  position: absolute; bottom: -27.5rem; left: 0;
  width: 100%; height: 31.5rem;
  z-index: 1; pointer-events: none;
  background-image: linear-gradient(rgba(0,0,0,0) 0%, #f5f5f5 13%);
}
```

The gradient stop percentage and offsets change per breakpoint (`36%` / `13%` / `41%`), but the target color is always the body background `#f5f5f5` — that's what dissolves the bottom of the screenshot instead of cutting it off.

---

## 3. Copy-paste starter

```html
<section class="canvas">
  <div class="canvas__perspective">
    <div class="canvas__asset" data-entrance>
      <img src="your-screenshot.png" alt="">
    </div>
  </div>
</section>
```

```css
:root { --rotationAmount: 2deg; }
body { background: #f5f5f5; }

.canvas { position: relative; overflow-x: clip; }
.canvas::after {
  content: ""; position: absolute; left: 0; bottom: -27.5rem;
  width: 100%; height: 31.5rem; z-index: 1; pointer-events: none;
  background-image: linear-gradient(rgba(0,0,0,0) 0%, #f5f5f5 13%);
}

.canvas__perspective { perspective: 30rem; max-width: 100rem; margin: 0 auto; }

.canvas__asset {
  opacity: 0;
  transform: rotateX(12deg);
  transform-style: preserve-3d;
  will-change: transform;
  background: #f5f5f5;
  border-radius: 1.625rem 1.625rem 0 0;
  box-shadow: 0 40px 200px #c8abad;
  max-width: 90rem; margin: 0 auto;
}
.canvas__asset img { width: 100%; display: block; }

.canvas__asset.is-shown {
  animation: tiltInUp .8s cubic-bezier(.785, .135, .15, .86) both;
}

@keyframes tiltInUp {
  from { opacity: 0; transform: rotateX(12deg); }
  to   { opacity: 1; transform: rotateX(var(--rotationAmount)); }
}

@media (prefers-reduced-motion: reduce) {
  .canvas__asset.is-shown { animation-duration: 1ms; }
}
```

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('is-shown');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });

document.querySelectorAll('[data-entrance]').forEach(el => io.observe(el));
```

---

*Measured from the live site on 2026-08-21. Class names, asset URLs, and values reflect the page as shipped at that time and may change.*
