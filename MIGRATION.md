# Portfolio Migration Plan

## Vanilla HTML/CSS/Express → Next.js 14 + shadcn/ui

**Site:** stpnguyen.com  
**Goal:** Rebuild the portfolio using Next.js (App Router), shadcn/ui, and Tailwind CSS while preserving all visual identity — colors, typography, spacing, layout, and interactions — with minor modernization where shadcn/ui patterns naturally fit.

---

## Migration Status

| Phase   | Description         | Status     |
| ------- | ------------------- | ---------- |
| Phase 1 | Scaffold & Tokens   | ✅ Done    |
| Phase 2 | Layout & Navigation | ✅ Done    |
| Phase 3 | API Routes          | ✅ Done    |
| Phase 4 | Auth Middleware     | ✅ Done    |
| Phase 5 | Home Page           | ✅ Done    |
| Phase 6 | Remaining Pages     | ✅ Done    |
| Phase 7 | Polish & QA         | ✅ Done    |
| Phase 8 | Deploy              | ⬜ Pending |

### Actual stack (differs from plan)

| Item                   | Plan                                           | Actual                                                           |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Next.js                | 14+                                            | **16.2.6**                                                       |
| Tailwind               | v3 (`tailwind.config.ts`)                      | **v4** (`@theme inline {}` in globals.css)                       |
| shadcn primitives      | Radix UI                                       | **`@base-ui/react`**                                             |
| Auth middleware        | `middleware.ts` / `export function middleware` | **`proxy.ts` / `export function proxy`** (Next.js 16 convention) |
| JWT library            | `jsonwebtoken`                                 | **`jose`** (edge-runtime compatible)                             |
| `lastPlayedSong` cache | Vercel KV                                      | Module-level variable for now — TODO before prod                 |

---

## Table of Contents

1. [Current Stack Snapshot](#1-current-stack-snapshot)
2. [Target Stack](#2-target-stack)
3. [Project Structure (New)](#3-project-structure-new)
4. [Route Mapping](#4-route-mapping)
5. [Design Token Migration](#5-design-token-migration)
6. [Typography System](#6-typography-system)
7. [Component Mapping](#7-component-mapping)
8. [API Route Migration](#8-api-route-migration)
9. [Auth System Migration](#9-auth-system-migration)
10. [Environment Variables](#10-environment-variables)
11. [Animation Strategy](#11-animation-strategy)
12. [Assets](#12-assets)
13. [SEO & Analytics](#13-seo--analytics)
14. [Migration Phases](#14-migration-phases)
15. [Deployment](#15-deployment)
16. [Resolved Decisions](#16-resolved-decisions)
17. [Spotify & Strava — Compatibility Confirmation](#17-spotify--strava--compatibility-confirmation)
18. [Post-Migration: Job Analysis](#18-post-migration-job-analysis)

---

## 1. Current Stack Snapshot

| Layer         | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| Markup        | HTML5 (no build step)                                               |
| Styling       | Vanilla CSS + CSS custom properties (Specify CLI tokens)            |
| Layout        | Bootstrap 5 grid (`bootstrap-grid.css`)                             |
| UI libraries  | Swiper 11 (carousel), AOS 2.3.4 (scroll animation), animate.css 4.1 |
| Typography    | Manrope (headings), Sora (body) — Google Fonts                      |
| Backend       | Node.js + Express 4.21                                              |
| Auth          | JWT (24h expiry, 2 password-protected users)                        |
| External APIs | Spotify OAuth, Strava OAuth, OpenAI, Make.com webhook               |
| Templating    | Vanilla `fetch()` loading HTML partials from `/templates/`          |
| Deploy        | GitHub Actions → Render + PM2, Node 16                              |
| Analytics     | Google Analytics (GA4: `G-7VM3QDKCYW`) + GTM (`GTM-PF5XGDGK`)       |

---

## 2. Target Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 14+ (App Router)                      |
| Language   | TypeScript                                    |
| Styling    | Tailwind CSS v3 + shadcn/ui CSS variables     |
| Components | shadcn/ui (Radix UI primitives)               |
| Animation  | Framer Motion                                 |
| Carousel   | shadcn/ui Carousel (Embla-based)              |
| Typography | Manrope + Sora — via `next/font/google`       |
| Backend    | Next.js API Route Handlers (replaces Express) |
| Auth       | JWT via Next.js middleware (`middleware.ts`)  |
| Deploy     | Vercel (recommended) or Render                |
| Node       | 20+                                           |

---

## 3. Project Structure (New)

```
portfolio-next/
├── app/
│   ├── layout.tsx                  # Root layout (nav + footer)
│   ├── page.tsx                    # Home (index.html)
│   ├── about/
│   │   └── page.tsx                # about.html
│   ├── work/
│   │   └── page.tsx                # work.html
│   ├── work-experience/
│   │   └── page.tsx                # work-experience.html
│   ├── case-studies/
│   │   └── [slug]/
│   │       └── page.tsx            # case-studies/*.html (protected)
│   └── api/
│       ├── spotify/
│       │   └── playback/route.ts
│       ├── strava/
│       │   ├── club/[clubId]/route.ts
│       │   └── personal/weekly/route.ts
│       ├── verify/route.ts
│       ├── analyze/route.ts
│       └── job-analysis-result/route.ts
├── components/
│   ├── ui/                         # shadcn/ui generated components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── WorkExperienceSection.tsx
│   │   ├── DomainSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── ActivitiesSection.tsx
│   │   └── CertificatesSection.tsx
│   ├── spotify/
│   │   └── SpotifyWidget.tsx
│   ├── strava/
│   │   └── StravaWidget.tsx
│   └── chat/
│       └── JobFitChat.tsx          # ai-chat.js → React component
├── lib/
│   ├── spotify.ts                  # Token refresh logic
│   ├── strava.ts
│   ├── auth.ts                     # JWT helpers
│   └── utils.ts                    # shadcn/ui cn() util
├── middleware.ts                   # JWT guard for /case-studies/*
├── public/                         # All existing assets moved here
├── styles/
│   └── globals.css                 # Tailwind directives + CSS vars
└── tailwind.config.ts
```

---

## 4. Route Mapping

| Current file                           | New route                          | Notes         |
| -------------------------------------- | ---------------------------------- | ------------- |
| `index.html`                           | `/` (`app/page.tsx`)               |               |
| `about.html`                           | `/about`                           |               |
| `work.html`                            | `/work`                            |               |
| `work-experience.html`                 | `/work-experience`                 |               |
| `case-studies/lending.html`            | `/case-studies/lending`            | JWT protected |
| `case-studies/marketing-platform.html` | `/case-studies/marketing-platform` | JWT protected |
| `case-studies/web-3.html`              | `/case-studies/web-3`              | JWT protected |
| `case-studies/case-study-2.html`       | `/case-studies/case-study-2`       | JWT protected |
| `case-studies/case-study-3.html`       | `/case-studies/case-study-3`       | JWT protected |
| `case-studies/work.html`               | `/case-studies/work`               | JWT protected |

---

## 5. Design Token Migration

All CSS custom properties from `css/styles/tokens.css` map into Tailwind config. shadcn/ui's own CSS variables are layered on top in `globals.css`.

### `tailwind.config.ts` — extend theme

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: 'rgb(0, 144, 218)', // --primary-default
        },
        blue: {
          50: 'rgb(240, 249, 255)', // --blue-B50
          100: 'rgb(224, 242, 254)',
          200: 'rgb(186, 230, 253)',
          300: 'rgb(125, 211, 252)',
          400: 'rgb(56, 189, 248)',
          500: 'rgb(14, 165, 233)',
          600: 'rgb(2, 132, 199)',
          700: 'rgb(1, 103, 156)', // --blue-B700 (borders, decorative text)
        },
        grey: {
          50: 'rgb(249, 250, 251)', // --grey-G50
          100: 'rgb(243, 244, 246)',
          200: 'rgb(229, 231, 235)', // --border-neutral-default
          300: 'rgb(209, 213, 219)',
          400: 'rgb(156, 163, 175)',
          500: 'rgb(107, 114, 128)',
          600: 'rgb(75, 85, 99)', // --text-neutral-body
          700: 'rgb(55, 65, 81)', // --text-neutral-heading
          800: 'rgb(31, 41, 55)',
          900: 'rgb(17, 24, 39)',
          950: 'rgb(3, 7, 18)', // --text-neutral-display
        },
        emerald: {
          700: 'rgb(21, 128, 61)', // --emerald-E700 (#opentowork badge)
        },
        // Semantic aliases (for shadcn/ui compatibility)
        background: 'rgb(255, 255, 255)',
        foreground: 'rgb(75, 85, 99)',
        border: 'rgb(229, 231, 235)',
        input: 'rgb(229, 231, 235)',
        ring: 'rgb(1, 103, 156)',
      },
      spacing: {
        // Mirrors --m-* / --p-* tokens
        '2': '2px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
        '72': '72px',
        '80': '80px',
      },
      borderRadius: {
        pill: '999px', // Used on buttons and select
        sm: '2px',
        md: '8px',
        lg: '16px',
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### `styles/globals.css` — CSS variable layer

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn/ui required vars — mapped to our tokens */
    --background: 0 0% 100%;
    --foreground: 220 9% 34%;
    --primary: 201 100% 43%;
    --primary-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 203 98% 31%;
    --radius: 999px;

    /* Preserve original token names for gradual migration */
    --text-utilities-decorate-primary: rgb(1, 103, 156);
    --bg-surface-main: rgb(255, 255, 255);
    --text-neutral-body: rgb(75, 85, 99);
  }

  html {
    font-size: 14px;
    background: var(--bg-surface-main);
    color: var(--text-neutral-body);
    overflow-x: hidden;
  }
}
```

---

## 6. Typography System

Load both fonts in `app/layout.tsx` using `next/font/google`.

```ts
import { Manrope, Sora } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});
```

### Type scale mapping

| Current class  | Size                     | Weight | Tailwind equivalent                                  |
| -------------- | ------------------------ | ------ | ---------------------------------------------------- |
| `.display`     | `clamp(34px, 2vw, 42px)` | 700    | `text-[clamp(34px,2vw,42px)] font-bold font-manrope` |
| `h1`           | 24px                     | 800    | `text-2xl font-extrabold font-manrope`               |
| `h2`           | 22px                     | 700    | `text-[22px] font-bold font-manrope`                 |
| `h3`           | 20px uppercase           | 700    | `text-xl font-bold uppercase font-manrope`           |
| `.sub-heading` | 16px uppercase           | 800    | `text-base font-extrabold uppercase font-manrope`    |
| `.lg-medium`   | 16px                     | 500    | `text-base font-medium font-manrope`                 |
| `.lg-regular`  | 16px                     | 400    | `text-base font-normal font-manrope`                 |
| `.lg-bold`     | 16px                     | 700    | `text-base font-bold font-manrope`                   |
| `.md-bold`     | 14px                     | 800    | `text-sm font-extrabold font-manrope`                |
| `.md-medium`   | 14px                     | 500    | `text-sm font-medium font-manrope`                   |
| `.md-regular`  | 14px                     | 400    | `text-sm font-normal font-manrope`                   |
| `.sm-bold`     | 12px uppercase           | 700    | `text-xs font-bold uppercase font-manrope`           |
| `.sm-medium`   | 12px                     | 500    | `text-xs font-medium font-manrope`                   |

> **Tip:** Define these as Tailwind component classes in `globals.css` under `@layer components` to avoid repeating long strings.

---

## 7. Component Mapping

### shadcn/ui components to install

```bash
npx shadcn@latest add button
npx shadcn@latest add navigation-menu
npx shadcn@latest add dialog
npx shadcn@latest add carousel
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add card
```

### Component mapping table

| Current pattern               | shadcn/ui component               | Notes                                         |
| ----------------------------- | --------------------------------- | --------------------------------------------- |
| `.btn-primary`                | `<Button>`                        | Keep pill radius + bottom-border hover effect |
| `.btn-secondary`              | `<Button variant="outline">`      |                                               |
| `.btn-ghosh`                  | `<Button variant="ghost">`        | Keep slide-in padding animation               |
| Bootstrap navbar              | `<NavigationMenu>`                | Hamburger menu → Sheet on mobile              |
| Swiper carousel               | `<Carousel>`                      | Embla-based, drop Swiper dependency           |
| `#hastag` tab switcher        | `<Tabs>`                          | Domain / Process / Activities sections        |
| `<select>` (phaseSelector)    | `<Select>`                        | Phase / Sprint / Product dropdown             |
| AI chat overlay               | `<Dialog>` or `<Sheet>`           | Floating chat bubble → slide-in Sheet         |
| File upload form              | `<Form>` + `<Input type="file">`  | Keep drag-and-drop zone styling               |
| Case study password gate      | Custom modal using `<Dialog>`     |                                               |
| AOS `data-aos="fade-up"`      | `framer-motion` `whileInView`     |                                               |
| animate.css `animate__fadeIn` | `framer-motion` `initial/animate` |                                               |

### Button styles to preserve

The primary button has a distinctive bottom-border 3D effect. Implement as a variant override in `components/ui/button.tsx`:

```ts
// Bottom border presses down on hover
className =
  'border border-blue-700 border-b-[6px] hover:border-b transition-all duration-100';
```

---

## 8. API Route Migration

Each Express endpoint becomes a Next.js Route Handler in `app/api/`.

### Spotify — `app/api/spotify/playback/route.ts`

- Mirrors `GET /api/spotify/playback` from `app.js:122`
- Logic: refresh token → fetch `/me/player` + `/me/player/recently-played` in parallel
- File persistence (`lastPlayed.json`) → use `unstable_cache` or a simple KV store on Vercel
- Returns: `{ status, playing, track, artist, albumCover, trackUrl }`

### Strava Club — `app/api/strava/club/[clubId]/route.ts`

- Mirrors `GET /api/strava/club/:clubId/latest` from `app.js:202`
- Returns: `{ clubName, currentWeek, totalDistance, totalTime, totalActivities, latestActivities[] }`

### Strava Personal — `app/api/strava/personal/weekly/route.ts`

- Mirrors `GET /api/strava/personal/weekly` from `app.js:255`
- Returns: `{ currentWeek, totalDistance, totalTime, totalActivities, averageSpeed }`

### Auth — `app/api/verify/route.ts`

- Mirrors `POST /api/verify` from `app.js:338`
- Reads `USER_1_PASSWORD`, `USER_1_EXPIRY`, `USER_2_PASSWORD`, `USER_2_EXPIRY` from env
- Signs JWT with `JWT_SECRET`, returns `{ success: true, token }`
- Token stored in `localStorage` on the client (current behavior) or `httpOnly` cookie (recommended upgrade)

### Job Analysis — deferred

> **Not part of this migration.** The job analysis feature (AI-powered form + Make.com webhook) will be rebuilt after the core migration is complete. See [Section 18](#18-post-migration-job-analysis) for the planned approach.

During migration: the `JobFitChat.tsx` component and its floating chat bubble UI will be built as a **placeholder** — the form renders correctly but the submit button is disabled with a "Coming soon" label. No API routes for `/api/analyze` or `/api/job-analysis-result` are created at this stage.

---

## 9. Auth System Migration

Current flow:

1. User enters password on the case study page
2. `POST /api/verify` validates password against env vars, returns JWT
3. Client stores token in `localStorage`
4. Client appends `?token=<jwt>` to case study URL
5. Express `authenticateToken` middleware verifies and serves the HTML file

New flow (Next.js):

1. User enters password → `POST /api/verify` (same logic)
2. JWT stored in `httpOnly` cookie (upgrade from localStorage for security)
3. `middleware.ts` intercepts all `/case-studies/*` routes, reads cookie, verifies JWT
4. Redirect to `/?error=unauthorized` on failure (mirrors current behavior)

### `middleware.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/?error=invalid_token', req.url));
  }
}

export const config = {
  matcher: ['/case-studies/:path*'],
};
```

---

## 10. Environment Variables

### Where they live today

All secrets (Spotify, Strava, JWT, Make.com) are stored in **Render's environment variable dashboard** for the current Express backend at `portfolio-7hpb.onrender.com`.

### Where they go after migration

Copy every value from **Render → Environment** into **Vercel → Project → Settings → Environment Variables**. Nothing else changes — same names, same values.

The current frontend makes API calls to the full Render URL (e.g. `https://portfolio-7hpb.onrender.com/api/spotify/playback`). After migration, those calls become relative (`/api/spotify/playback`) since the frontend and backend live in the same Vercel project. Update any hardcoded Render URLs in the frontend components during Phase 3.

### `.env.local` (for local development)

```bash
# Spotify — copy from Render dashboard
CLIENT_ID=
CLIENT_SECRET=
REFRESH_TOKEN=

# Strava — copy from Render dashboard
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=

# Auth — copy from Render dashboard
JWT_SECRET=
USER_1_PASSWORD=
USER_1_EXPIRY=
USER_2_PASSWORD=
USER_2_EXPIRY=

# Make.com — copy from Render dashboard
MAKE_WEBHOOK_URL=

# Vercel KV — auto-generated when you add KV to the project
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

> **Do not commit `.env.local` to git.** It is already in `.gitignore` by default with Next.js. Add `.env.local` to `.gitignore` manually if it isn't there.

---

## 11. Animation Strategy

Replace AOS + animate.css with Framer Motion.

### Fade-up on scroll (was `data-aos="fade-up"`)

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>;
```

### Fade-in on mount (was `animate__animated animate__fadeIn`)

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  {children}
</motion.div>
```

### Reusable wrapper

Create `components/FadeIn.tsx` and `components/FadeUp.tsx` to avoid repeating the motion config across pages.

---

## 12. Assets

All files under `/public/` copy directly to the new project's `/public/` folder. No changes needed.

Key assets to verify paths for after copy:

- `favicon.png`
- `logo.svg`, `logo.png`
- `personal_image.webp`
- All `team_img_*.jpg` (used in Swiper carousel)
- All `cert_*.png` (certificate badges)
- All `ic_*.svg` (domain icons)
- `[Stephano Ng] Resume.pdf`

Use Next.js `<Image>` component for all `<img>` tags — enables automatic optimization, lazy loading, and WebP conversion.

---

## 13. SEO & Analytics

### Metadata (replaces `<meta>` tags in each HTML file)

```ts
// app/layout.tsx
export const metadata = {
  title:
    'Stephano Ng | Practical AI, Product Design and Professional Project Management',
  description:
    'Stephano specializes in bridging the gap between business strategy and user-centered solutions that drive measurable results.',
  openGraph: {
    title: 'Stephano Ng | Practical AI, UXD and PMP',
    description: '...',
    url: 'https://www.stpnguyen.com',
    images: [{ url: '/assets/og-img.png' }],
    type: 'website',
  },
};
```

### Google Analytics + GTM

Use `next/script` to add GTM and GA4 snippets in `app/layout.tsx`:

```tsx
import Script from 'next/script'

// GA4
<Script src="https://www.googletagmanager.com/gtag/js?id=G-7VM3QDKCYW" strategy="afterInteractive" />

// GTM
<Script id="gtm" strategy="afterInteractive">{`
  (function(w,d,s,l,i){...})(...,'GTM-PF5XGDGK');
`}</Script>
```

---

## 14. Migration Phases

### Phase 1 — Scaffold & Tokens _(Day 1)_ ✅

- [x] `npx create-next-app@latest portfolio-next --typescript --tailwind --app` — Next.js 16.2.6 installed
- [x] `npx shadcn@latest init` — uses `@base-ui/react` primitives (not Radix UI)
- [x] ~~Configure `tailwind.config.ts`~~ — Tailwind v4 installed; tokens live in `@theme inline {}` inside `globals.css` instead
- [x] Set up `globals.css` with CSS variable layer + all original token names preserved
- [x] Add Manrope + Sora via `next/font/google` in `app/layout.tsx`
- [x] Define type-scale utility classes in `@layer components`
- [x] Copy all `/public/` assets

### Phase 2 — Layout & Navigation _(Day 1–2)_ ✅

- [x] Build `Navbar.tsx` — custom hamburger + full-screen mobile overlay (no Sheet used)
- [x] Build `Footer.tsx` — CTA + bottom bar with logo/email/LinkedIn
- [x] Wire both into `app/layout.tsx`
- [x] Verify visual parity with current `templates/nav.html` and `templates/footer.html`

### Phase 3 — API Routes _(Day 2–3)_ ✅

- [x] Migrate Spotify endpoint → `app/api/spotify/playback/route.ts`
- [x] Migrate Strava club endpoint → `app/api/strava/club/[clubId]/route.ts` (Next.js 16: `await params`)
- [x] Migrate Strava personal weekly endpoint → `app/api/strava/personal/weekly/route.ts`
- [x] Migrate `/api/verify` auth endpoint → httpOnly cookie (upgrade from localStorage)
- [x] Set up `.env.local` with all secrets
- [x] ~~Job analysis endpoints~~ — deferred, see Section 18

### Phase 4 — Auth Middleware _(Day 3)_ ✅

- [x] ~~`middleware.ts`~~ → renamed to `proxy.ts` with `export function proxy` (Next.js 16 convention)
- [x] Uses `jose` (edge-runtime compatible) instead of `jsonwebtoken`
- [x] Redirects preserve `?from=<path>` so PasswordGate can redirect back after login
- [x] Build `PasswordGate.tsx` — auto-opens Dialog on `?error=unauthorized` / `?error=invalid_token`
- [x] Wrapped in `<Suspense>` in layout (required by `useSearchParams`)

### Phase 5 — Home Page _(Day 3–4)_ ✅

- [x] `HeroSection.tsx` — headline, profile image, fade-in animation
- [x] `WorkExperienceSection.tsx` — company list with vertical rotated labels
- [x] `DomainSection.tsx` — 6 domain cards (Web3, Banking, Lending, ERP, Automotive, ESG)
- [x] `ProcessSection.tsx` — phase/sprint/product tab switcher with stage bar + metrics
- [x] `ActivitiesSection.tsx` — team photo carousel + StravaWidget
- [x] `CertificatesSection.tsx` — badge grid with Credly links
- [x] `InnovationSection.tsx` — hashtag tab bar wrapping Domain/Process/Activities
- [x] `JobFitChat.tsx` — floating bubble + panel, submit disabled "Coming soon"
- [x] Spotify widget deferred to `/about` page (original site placement)
- [x] `FadeUp` / `FadeIn` Framer Motion wrappers in `components/FadeUp.tsx`

### Phase 6 — Remaining Pages _(Day 4–5)_ ✅

- [x] `/about` page — profile hero, bio, SpotifyWidget + PersonalStravaWidget + team carousel
- [x] `/work` page — hero + 8 case study cards grid, each linking to `/case-studies/[slug]`
- [x] `/work-experience` page — wraps existing `WorkExperienceSection`
- [x] `/case-studies/[slug]` — dynamic route, `notFound()` on unknown slug, `proxy.ts` protects all paths
- [x] `components/spotify/SpotifyWidget.tsx` — fetches `/api/spotify/playback`
- [x] `components/about/PersonalStravaWidget.tsx` — fetches `/api/strava/personal/weekly`
- [x] `lib/case-studies.ts` — case study data + `getCaseStudy(slug)` helper

### Phase 7 — Polish & QA _(Day 5–6)_ ✅

- [x] Verify all Framer Motion animations match AOS originals — FadeUp (whileInView) and FadeIn (on-mount) confirmed correct; removed double-wrap on WorkExperienceSection
- [x] Mobile responsiveness audit — fixed CertificatesSection (stack on mobile), About activities row (responsive height), Work grid (1-col on mobile), InnovationSection tabs (overflow-x + flex-1), Footer CTA (no whitespace-nowrap), InnovationSection padding (responsive)
- [ ] Lighthouse score check (performance, accessibility, SEO) — requires production deploy
- [ ] Cross-browser test (Chrome, Safari, Firefox) — requires production deploy
- [x] Remove `Backend.js` (legacy duplicate of `app.js`) — deleted
- [ ] Update CNAME / DNS if changing host — handled in Phase 8

### Phase 8 — Deploy _(Day 6)_

- [ ] Push to GitHub
- [ ] Connect to Vercel (import project → set env vars)
- [ ] Update `CNAME` to point `stpnguyen.com` to Vercel
- [ ] Validate all routes, API endpoints, and auth in production
- [ ] Update CORS allowed origins if needed

---

## 15. Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

- Zero config for Next.js
- Serverless API routes (no PM2 needed)
- Edge middleware for JWT auth
- Automatic HTTPS
- Set env vars under Project → Settings → Environment Variables

### Render (alternative, if staying on current host)

Add a `render.yaml`:

```yaml
services:
  - type: web
    name: portfolio
    env: node
    buildCommand: npm run build
    startCommand: npm start
    nodeVersion: 20
```

Environment variables must be added manually in the Render dashboard.

---

## 16. Resolved Decisions

All decisions are locked. No open items.

| Decision                    | Resolved                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **Deploy target**           | Vercel — zero config, no PM2, automatic HTTPS                                      |
| **Job results persistence** | Vercel KV (free tier) — survives cold starts, no extra service needed              |
| **Auth token storage**      | `httpOnly` cookie — more secure than `localStorage`, works with Next.js middleware |
| **Specify CLI**             | Dropped — tokens live directly in `tailwind.config.ts`, no external tooling        |
| **Carousel library**        | shadcn/ui Carousel (Embla) — removes Swiper dependency                             |
| **`Backend.js`**            | Deleted — legacy duplicate, not migrated                                           |
| **DNS**                     | Update CNAME to point `stpnguyen.com` → `cname.vercel-dns.com` after deploy        |

---

## 17. Spotify & Strava — Compatibility Confirmation

Both integrations carry over **without any changes to credentials, logic, or API behavior.**

### What stays identical

- All environment variables (`CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, `STRAVA_*`) copy directly to Vercel's environment variable settings
- Token refresh logic (the `getSpotifyAccessToken` and `getStravaAccessToken` functions) ports line-for-line into the new route handlers
- API response shapes are unchanged — frontend widgets call the same URLs (`/api/spotify/playback`, `/api/strava/club/:clubId/latest`, `/api/strava/personal/weekly`) and receive the same JSON

### One small difference

The current Express server writes `lastPlayed.json` to disk to persist the last Spotify track across restarts. Vercel's serverless functions don't have a writable filesystem. The replacement: store `lastPlayedSong` in Vercel KV. One extra line — everything else is identical.

### Re-authorizing on Vercel

No re-authorization needed. The existing refresh tokens are long-lived and don't expire unless you revoke them. Just paste the same values into Vercel's env var settings and the integrations work on first deploy.

---

## 18. Post-Migration: Job Analysis

> **Implement after the core migration is complete and live.**

### Planned approach — direct OpenAI streaming (no Make.com)

Cut Make.com out entirely. Call OpenAI directly from a Next.js route handler and stream the result back to the browser in real time. The user sees the analysis appear word by word — no polling, no callbacks, no KV storage needed for results.

```
User submits form → /api/analyze → OpenAI (streaming) → result streams to browser
```

### What gets removed vs. current

- `MAKE_WEBHOOK_URL` env var — no longer needed
- `/api/job-analysis-result` callback route — no longer needed (Make.com was the only caller)
- Email field on the form — no longer needed (result goes directly to the browser)
- "Check back soon" / polling UX — replaced by live streaming

### What gets added

- `OPENAI_API_KEY` env var in Vercel settings (the `openai` package is already a dependency)
- One route handler (`/api/analyze`) that calls OpenAI with a system prompt describing Stephano's profile and streams the response

### UI change

The "Coming soon" placeholder built during the main migration gets updated: the submit button is re-enabled and the response area renders streamed text progressively.

### Action required by you at that time

Delete the Make.com scenario (or just leave it disabled) — it will no longer be called.
