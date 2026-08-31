#!/usr/bin/env node
// Keeps each card's thumbnail, title and description on work.html and
// index.html in sync with the case study it links to, so an edit on the case
// study page doesn't also need a manual copy-paste onto every card that
// quotes it. The case study is always the source; cards never write back to it.
//
// IMAGE — looks for case-studies/<slug>.html and pulls its cover <img>
// (src + alt) using whichever of these three markup patterns the page
// actually uses — the three templates in this repo each do it differently:
//   - v3 redesign:   <figure class="rd-case-cover"><img ...></figure>
//   - older v2:       <div class="case-cover">...<img ...></div>
//   - legacy 2021:    <div id="cover"><img ...></div>
//
// TITLE/DESC — only synced when the case study uses the current house
// style: <h1 class="rd-case-title">...</h1> plus a project-specific
// <meta property="og:description" content="...">. Pages still on the old
// 2021 template (web-3.html, marketing-platform.html as of 2026-08-30) fail
// that check on purpose — their <h1> is multi-line marketing copy and their
// og:description is the site-wide default, not about the project, so
// pulling either would inject garbage onto every card. They're skipped, not
// guessed at, until those pages get an <h1 class="rd-case-title"> of their
// own.
//
// Tiles whose case-studies/<slug>.html doesn't exist yet (e.g. coming-soon
// placeholders) are left untouched.
//
// RELATED CARDS — every case-studies/*.html can also carry a "Related case
// studies" section (.rd-related-card entries), each one quoting another case
// study's title/desc inline. Those quotes drift the same way work.html and
// index.html cards did, so this script also walks every file in
// case-studies/ (skipping any starting with "_" — previews/reference docs,
// not real pages), finds each .rd-related-card's href, and syncs its title/
// desc from the linked page — same rd-case-title/og:description source and
// same skip-if-old-template rule as above. New pages need no script change:
// any file with a .rd-related-card pointing at a page with a rd-case-title
// is picked up automatically. The eyebrow line is hand-authored (there's no
// equivalent field on the source page) and is never touched.
//
// Usage: node scripts/sync-thumbnails.js [--dry-run]

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const COVER_PATTERNS = [
  /<figure[^>]*class="[^"]*\brd-case-cover\b[^"]*"[^>]*>\s*<img\s[^>]*>/i,
  /<div[^>]*class="[^"]*\bcase-cover\b[^"]*"[^>]*>\s*<img\s[^>]*>/i,
  /<div[^>]*id="cover"[^>]*>\s*<img\s[^>]*>/i,
];

const TITLE_PATTERN = /<h1[^>]*class="[^"]*\brd-case-title\b[^"]*"[^>]*>([\s\S]*?)<\/h1>/i;
const DESCRIPTION_PATTERN = /<meta\s+property="og:description"\s+content="([^"]*)"/i;

// work.html: one tile per [data-case-study="<slug>"], marker == slug.
// index.html: the initiative-deck panels use their own ids, not the case
// study's slug — mapping confirmed against each panel's "Learn More" href.
const TARGETS = [
  {
    file: "work.html",
    mediaClass: "rd-work-media",
    titleTag: "h3",
    titleClass: "rd-work-tile-title",
    descTag: "p",
    descClass: "rd-work-desc",
    tiles(html) {
      const slugs = [...html.matchAll(/data-case-study="([^"]+)"/g)].map((m) => m[1]);
      return [...new Set(slugs)].map((slug) => ({ marker: `data-case-study="${slug}"`, slug }));
    },
  },
  {
    file: "index.html",
    mediaClass: "rd-initiative-media",
    titleTag: "h3",
    titleClass: "rd-initiative-title",
    descTag: "p",
    descClass: "rd-initiative-desc",
    tiles: () => [
      { marker: 'id="panel-hd"', slug: "lending" },
      { marker: 'id="panel-aura"', slug: "web-3" },
      { marker: 'id="panel-comms"', slug: "healthcare" },
      { marker: 'id="panel-ce"', slug: "customer-engagement" },
    ],
  },
];

function extractAttr(tag, attr) {
  const m = tag.match(new RegExp(`${attr}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

function findCoverImage(html) {
  for (const pattern of COVER_PATTERNS) {
    const block = html.match(pattern);
    if (!block) continue;
    const imgTag = block[0].match(/<img\s[^>]*>/i)[0];
    return { src: extractAttr(imgTag, "src"), alt: extractAttr(imgTag, "alt") };
  }
  return null;
}

// Only trusted together: a real og:description without a matching
// rd-case-title h1 is, in this repo, always the site-wide default meta —
// see the header comment.
function findTitleAndDescription(html) {
  const titleMatch = html.match(TITLE_PATTERN);
  if (!titleMatch) return null;
  const title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  const descMatch = html.match(DESCRIPTION_PATTERN);
  const description = descMatch ? descMatch[1].trim() : "";
  return { title, description };
}

// case-studies/*.html covers are written relative to case-studies/, e.g.
// "../public/foo.png" or "/public/foo.png" — the target pages need them
// relative to the repo root, e.g. "./public/foo.png".
function toRootRelative(src) {
  let p = src.replace(/^\.\.\//, "").replace(/^\//, "");
  if (!p.startsWith("public/")) return null;
  return "./" + p;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Scopes to the first <tag class="...className..."> after marker, so a tile
// further down the page (or a same-named class inside the detail block,
// e.g. rd-detail-label) is never touched.
function replaceTaggedText(html, marker, tag, className, newText, label, log) {
  const re = new RegExp(
    `(${escapeRegExp(marker)}[\\s\\S]*?<${tag} class="[^"]*\\b${escapeRegExp(className)}\\b[^"]*">)[\\s\\S]*?(</${tag}>)`
  );
  const match = html.match(re);
  if (!match) {
    log(`  skip   ${label} — couldn't find its .${className}`);
    return html;
  }
  const oldText = match[0].slice(match[1].length, match[0].length - match[2].length);
  if (oldText === newText) {
    log(`  ok     ${label} — .${className} already in sync`);
    return html;
  }
  log(`  update ${label} — .${className}`);
  return html.replace(re, (full, open, close) => `${open}${newText}${close}`);
}

// Every .rd-related-card in every case-studies/*.html, synced from whatever
// page its href points to. Unlike TARGETS above, this isn't a fixed list —
// it discovers both the files and the cards inside them, so a new case
// study page (or a new related-card entry on an existing one) is covered
// without editing this script.
function syncRelatedCards() {
  const caseStudiesDir = path.join(root, "case-studies");
  const files = fs.readdirSync(caseStudiesDir).filter((f) => f.endsWith(".html") && !f.startsWith("_"));

  console.log(`\nRelated case study cards`);
  let sectionChanges = 0;

  for (const file of files) {
    const filePath = path.join(caseStudiesDir, file);
    let html = fs.readFileSync(filePath, "utf8");
    const slugs = [...html.matchAll(/<a class="rd-related-card" href="\.\/([\w-]+)\.html">/g)].map((m) => m[1]);
    if (slugs.length === 0) continue;

    let fileChanges = 0;
    for (const slug of slugs) {
      const caseStudyPath = path.join(caseStudiesDir, `${slug}.html`);
      if (!fs.existsSync(caseStudyPath)) {
        console.log(`  skip   ${file} -> ${slug} (related card) — no case-studies/${slug}.html`);
        continue;
      }

      const caseHtml = fs.readFileSync(caseStudyPath, "utf8");
      const marker = `class="rd-related-card" href="./${slug}.html"`;
      const before = html;

      // Image — same source cover as the work.html/index.html tiles, but no
      // toRootRelative(): case-studies/*.html is already at the same
      // directory depth as the source page, so the "../public/..." src it
      // was written with is reused as-is.
      const cover = findCoverImage(caseHtml);
      if (!cover || !cover.src) {
        console.log(`  skip   ${file} -> ${slug} (related image) — no recognised cover image markup on the target`);
      } else {
        const mediaRe = new RegExp(
          `(${escapeRegExp(marker)}[\\s\\S]*?<div class="rd-related-media">\\s*<img src=")[^"]*("\\s+alt=")[^"]*("[^>]*>)`
        );
        const match = html.match(mediaRe);
        if (!match) {
          console.log(`  skip   ${file} -> ${slug} (related image) — couldn't find its rd-related-media`);
        } else {
          const currentImgTag = match[0].match(/<img\s[^>]*>/i)[0];
          const oldSrc = extractAttr(currentImgTag, "src");
          const oldAlt = extractAttr(currentImgTag, "alt");
          const newAlt = (cover.alt || "").replace(/"/g, "&quot;");
          if (oldSrc === cover.src && oldAlt === newAlt) {
            console.log(`  ok     ${file} -> ${slug} (related image) — already in sync (${cover.src})`);
          } else {
            html = html.replace(mediaRe, `$1${cover.src}$2${newAlt}$3`);
            console.log(`  update ${file} -> ${slug} (related image) — ${oldSrc} -> ${cover.src}`);
          }
        }
      }

      const copy = findTitleAndDescription(caseHtml);
      if (!copy) {
        console.log(`  skip   ${file} -> ${slug} (related title/desc) — no <h1 class="rd-case-title"> on the target yet`);
      } else {
        html = replaceTaggedText(html, marker, "h3", "rd-related-title", copy.title, `${file} -> ${slug} (related title)`, console.log);
        if (copy.description) {
          html = replaceTaggedText(html, marker, "p", "rd-related-desc", copy.description, `${file} -> ${slug} (related desc)`, console.log);
        } else {
          console.log(`  skip   ${file} -> ${slug} (related desc) — target has no og:description`);
        }
      }
      if (html !== before) fileChanges++;
    }

    if (fileChanges > 0 && !dryRun) {
      fs.writeFileSync(filePath, html);
    }
    sectionChanges += fileChanges;
  }

  return sectionChanges;
}

let totalChanges = 0;

for (const target of TARGETS) {
  const filePath = path.join(root, target.file);
  let html = fs.readFileSync(filePath, "utf8");
  const tiles = typeof target.tiles === "function" ? target.tiles(html) : target.tiles;

  console.log(`\n${target.file}`);
  let fileChanges = 0;

  for (const { marker, slug } of tiles) {
    const caseStudyPath = path.join(root, "case-studies", `${slug}.html`);
    if (!fs.existsSync(caseStudyPath)) {
      console.log(`  skip   ${slug} — no case-studies/${slug}.html yet`);
      continue;
    }

    const caseHtml = fs.readFileSync(caseStudyPath, "utf8");

    const cover = findCoverImage(caseHtml);
    if (!cover || !cover.src) {
      console.log(`  skip   ${slug} (image) — no recognised cover image markup`);
    } else {
      const newSrc = toRootRelative(cover.src);
      if (!newSrc) {
        console.log(`  skip   ${slug} (image) — cover src "${cover.src}" isn't under public/`);
      } else {
        const tileRe = new RegExp(
          `(${escapeRegExp(marker)}[\\s\\S]*?<div class="${target.mediaClass}">\\s*<img src=")[^"]*("\\s+alt=")[^"]*("[^>]*>)`
        );
        const match = html.match(tileRe);
        if (!match) {
          console.log(`  skip   ${slug} (image) — couldn't find its ${target.mediaClass} tile`);
        } else {
          const currentImgTag = match[0].match(/<img\s[^>]*>/i)[0];
          const oldSrc = extractAttr(currentImgTag, "src");
          const oldAlt = extractAttr(currentImgTag, "alt");
          const newAlt = (cover.alt || "").replace(/"/g, "&quot;");
          if (oldSrc === newSrc && oldAlt === newAlt) {
            console.log(`  ok     ${slug} (image) — already in sync (${newSrc})`);
          } else {
            html = html.replace(tileRe, `$1${newSrc}$2${newAlt}$3`);
            fileChanges++;
            console.log(`  update ${slug} (image) — ${oldSrc} -> ${newSrc}`);
          }
        }
      }
    }

    const copy = findTitleAndDescription(caseHtml);
    if (!copy) {
      console.log(`  skip   ${slug} (title/desc) — no <h1 class="rd-case-title"> on the case study yet`);
      continue;
    }

    const beforeCopy = html;
    html = replaceTaggedText(html, marker, target.titleTag, target.titleClass, copy.title, `${slug} (title)`, console.log);
    if (copy.description) {
      html = replaceTaggedText(html, marker, target.descTag, target.descClass, copy.description, `${slug} (desc)`, console.log);
    } else {
      console.log(`  skip   ${slug} (desc) — case study has no og:description`);
    }
    if (html !== beforeCopy) fileChanges++;
  }

  if (fileChanges > 0 && !dryRun) {
    fs.writeFileSync(filePath, html);
  }
  totalChanges += fileChanges;
}

totalChanges += syncRelatedCards();

if (totalChanges === 0) {
  console.log("\nNothing to update.");
} else if (dryRun) {
  console.log(`\n${totalChanges} change(s) would be written. Re-run without --dry-run to write.`);
} else {
  console.log(`\nWrote ${totalChanges} change(s).`);
}
