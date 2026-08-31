#!/usr/bin/env node
// Scaffolds a new case-studies/<slug>-v3.html from
// templates/case-study-v3.template.html, with the hero variant, glow color
// and fade-in wiring already filled in — the part that's identical and
// error-prone to hand-copy every time. Everything content-specific (the four
// narrative sections, related-case picks) is left as <!-- TODO --> for you.
//
// Usage:
//   node scripts/new-case-study.js <slug> --title="Page title" [options]
//
// Options:
//   --title=          required. Used for <title>, og:title and the H1.
//   --lead=           hero lead paragraph (optional, defaults to a TODO).
//   --desc=           og:description (defaults to --lead, then a TODO).
//   --cover=          cover image src, relative to case-studies/ (default:
//                     ../public/placeholder-cover.webp).
//   --cover-alt=      alt text for the cover image.
//   --hero=           glow | split | overlap (default: glow). See
//                     css/styles/redesign.css §4c/§4d for what each does.
//   --glow=           hex color for --rd-hero-glow (default: #cdb8ef).
//                     Ignored when --hero=overlap.
//   --section2=       label for TOC item 02 / #context (default: "Context").
//   --section5-id=    id for TOC item 05 (default: "work").
//   --section5=       label for TOC item 05 (default: "The work").
//   --section6=       label for TOC item 06 / #after (default: "Shipped").
//   --out=            output filename inside case-studies/ (default:
//                     "<slug>-v3.html" — the draft convention: it sits
//                     alongside the live "<slug>.html" until you rename it
//                     over that slug).
//   --force           overwrite the output file if it already exists.
//
// Example:
//   node scripts/new-case-study.js fintech-onboarding \
//     --title="Cutting onboarding from nine screens to three" \
//     --hero=split --glow="#e0b8cd" \
//     --cover=../public/fo_casecover.webp \
//     --cover-alt="Fintech onboarding flow, redesigned"

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'case-study-v3.template.html');
const OUT_DIR = path.join(ROOT, 'case-studies');

function parseArgs(argv) {
  const args = { _: [] };
  argv.forEach((raw) => {
    if (raw.startsWith('--')) {
      const eq = raw.indexOf('=');
      if (eq === -1) {
        args[raw.slice(2)] = true;
      } else {
        args[raw.slice(2, eq)] = raw.slice(eq + 1);
      }
    } else {
      args._.push(raw);
    }
  });
  return args;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

function fail(message) {
  console.error('Error: ' + message);
  process.exit(1);
}

const HERO_VARIANTS = {
  glow: { bodyClass: 'is-hero-glow', usesGlow: true },
  split: { bodyClass: 'is-hero-glow is-hero-split', usesGlow: true },
  overlap: { bodyClass: 'is-hero-overlap', usesGlow: false },
};

function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args._[0];

  if (!slug || args.help || args.h) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n')
      .filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(slug ? 0 : 1);
  }

  if (!args.title) fail('--title is required, e.g. --title="Cutting onboarding from nine screens to three"');

  const heroKey = args.hero || 'glow';
  const hero = HERO_VARIANTS[heroKey];
  if (!hero) fail(`--hero must be one of: ${Object.keys(HERO_VARIANTS).join(', ')} (got "${heroKey}")`);

  const glow = args.glow || '#cdb8ef';
  if (hero.usesGlow && !/^#[0-9a-fA-F]{3,8}$/.test(glow)) {
    fail(`--glow must be a hex color like #f2c98e (got "${glow}")`);
  }

  const outName = args.out || `${slug}-v3.html`;
  const outPath = path.join(OUT_DIR, outName);
  if (fs.existsSync(outPath) && !args.force) {
    fail(`${path.relative(ROOT, outPath)} already exists — pass --force to overwrite, or --out to pick a different name.`);
  }

  if (!fs.existsSync(TEMPLATE_PATH)) fail(`template not found at ${path.relative(ROOT, TEMPLATE_PATH)}`);
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const title = args.title;
  const lead = args.lead || 'TODO — one or two sentences: the situation, your role, what you were up against.';
  const ogDesc = args.desc || args.lead || 'TODO — one-sentence summary for social/link previews.';
  const coverSrc = args.cover || '../public/placeholder-cover.webp';
  const coverAlt = args['cover-alt'] || `TODO — describe the cover image for "${title}"`;

  const replacements = {
    '{{TITLE}}': escapeHtml(title),
    '{{OG_DESC}}': escapeAttr(ogDesc),
    '{{COVER_SRC}}': escapeAttr(coverSrc),
    '{{COVER_ALT}}': escapeAttr(coverAlt),
    '{{LEAD}}': escapeHtml(lead),
    '{{HERO_BODY_CLASS}}': hero.bodyClass,
    '{{HERO_STYLE_ATTR}}': hero.usesGlow ? ` style="--rd-hero-glow: ${glow};"` : '',
    '{{SLUG}}': slug.toUpperCase(),
    '{{DATE}}': new Date().toISOString().slice(0, 10),
    '{{SECTION2_LABEL}}': escapeHtml(args.section2 || 'Context'),
    '{{SECTION5_ID}}': args['section5-id'] || 'work',
    '{{SECTION5_LABEL}}': escapeHtml(args.section5 || 'The work'),
    '{{SECTION6_LABEL}}': escapeHtml(args.section6 || 'Shipped'),
  };

  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }

  const leftover = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (leftover) fail(`template placeholder(s) not substituted: ${[...new Set(leftover)].join(', ')}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, html);

  console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  console.log('Hero wiring done: body class, --rd-hero-glow, animate__fadeIn on title/lead, cover reveal, script includes.');
  console.log('Still TODO: Overview snapshot, the four narrative sections, and Related case studies.');
}

main();
