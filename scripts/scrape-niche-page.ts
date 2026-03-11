/**
 * Scrape a single page of Niche CS rankings.
 *
 * Usage:  bun run scripts/scrape-niche-page.ts <page>
 *         bun run scripts/scrape-niche-page.ts 1
 *         bun run scripts/scrape-niche-page.ts 5
 *
 * Saves results to data/niche-cs/page-N.json
 * After all pages are scraped, run: bun run scripts/merge-niche-cs.ts
 *
 * NOTE: Niche stops ranking at #356 (page 15, 6 schools). Pages beyond 15
 * list unranked schools. The merge script caps at rank 356.
 */

import fs from "fs";
import path from "path";

const pageNum = parseInt(process.argv[2] ?? "", 10);
if (!pageNum || pageNum < 1 || pageNum > 20) {
  console.error("Usage: bun run scripts/scrape-niche-page.ts <page 1-20>");
  process.exit(1);
}

const BASE_URL = "https://www.niche.com/colleges/search/best-colleges-for-computer-science/";
const url = pageNum === 1 ? BASE_URL : `${BASE_URL}?page=${pageNum}`;

const outDir = path.join(process.cwd(), "data", "niche-cs");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log(`Fetching page ${pageNum}: ${url}`);

const resp = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

if (!resp.ok) {
  console.error(`HTTP ${resp.status} — ${resp.statusText}`);
  process.exit(1);
}

const html = await resp.text();
const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? "";
console.log(`Page title: ${title}`);

if (title.toLowerCase().includes("denied") || title.toLowerCase().includes("captcha")) {
  console.error("BLOCKED — wait a bit and try again.");
  process.exit(1);
}

// Extract from JSON-LD CollectionPage
interface SchoolEntry {
  slug: string;
  name: string;
  rank: number;
}

const entries: SchoolEntry[] = [];
const ldJsonRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
let match;

while ((match = ldJsonRegex.exec(html)) !== null) {
  try {
    const raw = match[1].replace(/\\u002F/g, "/");
    const data = JSON.parse(raw);
    if (data["@type"] !== "CollectionPage" || !data.mainEntity?.itemListElement) continue;

    const items = data.mainEntity.itemListElement;
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].item;
      if (entry?.["@type"] !== "CollegeOrUniversity") continue;
      const id: string = entry["@id"] ?? "";
      const slugMatch = id.match(/\/colleges\/([a-z0-9-]+)\/?$/);
      if (!slugMatch) continue;

      const rank = (pageNum - 1) * 25 + (i + 1);
      entries.push({
        slug: slugMatch[1],
        name: entry.name ?? slugMatch[1],
        rank,
      });
    }
  } catch {
    // skip
  }
}

if (entries.length === 0) {
  // Fallback: extract slugs from compare links
  const compareRegex = /\/colleges\/compare\/\?type=college&(?:amp;)?colleges=([a-z0-9-]+)/g;
  const seen = new Set<string>();
  let cm;
  let i = 0;
  while ((cm = compareRegex.exec(html)) !== null) {
    const slug = cm[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    entries.push({
      slug,
      name: slug,
      rank: (pageNum - 1) * 25 + ++i,
    });
  }
}

if (entries.length === 0) {
  console.error("No schools found on this page. May be the last page or blocked.");
  process.exit(1);
}

const outFile = path.join(outDir, `page-${pageNum}.json`);
fs.writeFileSync(outFile, JSON.stringify(entries, null, 2) + "\n");
console.log(`Saved ${entries.length} schools to ${outFile}`);

for (const e of entries) {
  console.log(`  #${e.rank} ${e.slug}`);
}
