/**
 * Scrape Niche.com Best Colleges for Computer Science Rankings
 *
 * URL pattern:
 *   Page 1: https://www.niche.com/colleges/search/best-colleges-for-computer-science/
 *   Page N: https://www.niche.com/colleges/search/best-colleges-for-computer-science/?page=N
 *
 * ~25 schools per page, ~15 pages (~356 schools total).
 * Rank is implicit from position on the page.
 * Match to our data via nicheUrl slug.
 *
 * Uses playwright-extra with stealth plugin for PerimeterX bypass.
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

// @ts-expect-error — stealth plugin types are for puppeteer but work with playwright-extra
chromium.use(stealth());

const DEBUG = process.argv.includes("--debug");
const MAX_PAGES = 20;
const MIN_MATCHED = 60;

const BASE_URL = "https://www.niche.com/colleges/search/best-colleges-for-computer-science/";

const dataPath = path.join(process.cwd(), "data", "schools.json");
const schools: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(`Loaded ${schools.length} schools from data/schools.json`);

// Build slug lookup from our nicheUrl field
// e.g. "https://www.niche.com/colleges/massachusetts-institute-of-technology/" → "massachusetts-institute-of-technology"
function extractNicheSlug(url: string): string {
  const match = url.match(/\/colleges\/([^/]+)\/?$/);
  return match?.[1] ?? "";
}

const slugToSchoolName = new Map<string, string>();
for (const school of schools) {
  const nicheUrl = school["nicheUrl"] as string | null;
  if (nicheUrl) {
    const slug = extractNicheSlug(nicheUrl);
    if (slug) {
      slugToSchoolName.set(slug, school["name"] as string);
    }
  }
}
console.log(`Built slug lookup: ${slugToSchoolName.size} schools with nicheUrl`);

// ---------------------------------------------------------------------------
// Scrape
// ---------------------------------------------------------------------------

interface ScrapedEntry {
  name: string;
  slug: string;
  rank: number;
}

async function main() {
  console.log("Launching headed browser — you may need to solve a CAPTCHA...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
  });
  const page = await context.newPage();

  const allEntries: ScrapedEntry[] = [];
  let globalRank = 1;

  try {
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      const url = pageNum === 1 ? BASE_URL : `${BASE_URL}?page=${pageNum}`;

      console.log(`\nPage ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

      // Random delay to appear human
      await page.waitForTimeout(2000 + Math.random() * 3000);

      // Check for CAPTCHA or block page
      const title = await page.title();
      if (
        title.toLowerCase().includes("captcha") ||
        title.toLowerCase().includes("blocked") ||
        title.toLowerCase().includes("access denied") ||
        title.toLowerCase().includes("denied")
      ) {
        console.log(`\n  ⚠ CAPTCHA/block detected: "${title}"`);
        console.log("  Please solve the CAPTCHA in the browser window.");
        console.log("  Waiting for the page to load the rankings...\n");

        // Wait until the page title changes (CAPTCHA solved) or timeout after 2 min
        try {
          await page.waitForFunction(
            () => {
              const t = document.title.toLowerCase();
              return (
                !t.includes("captcha") &&
                !t.includes("blocked") &&
                !t.includes("access denied") &&
                !t.includes("denied")
              );
            },
            { timeout: 120000 }
          );
          console.log("  CAPTCHA solved! Continuing...\n");
          await page.waitForTimeout(2000);
        } catch {
          console.error("  Timed out waiting for CAPTCHA. Aborting.");
          break;
        }
      }

      if (DEBUG && pageNum === 1) {
        const html = await page.content();
        fs.writeFileSync("debug-niche.html", html);
        await page.screenshot({ path: "debug-niche.png", fullPage: true });
        console.log(`  Saved debug-niche.html and debug-niche.png`);
        console.log(`  Page title: ${title}`);
        // Show some element counts
        for (const sel of [
          "a[href*='/colleges/']",
          "h2",
          "li",
          "article",
          "[class*='card']",
          "[class*='Card']",
          "[class*='search']",
          "[class*='Search']",
          "[class*='result']",
          "[class*='Result']",
        ]) {
          const count = await page.$$eval(sel, (els) => els.length);
          if (count > 0) console.log(`    ${sel}: ${count}`);
        }
      }

      // Extract from JSON-LD CollectionPage → mainEntity → itemListElement
      const entries = await page.evaluate(() => {
        const results: { name: string; href: string }[] = [];
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');

        for (const script of scripts) {
          try {
            const data = JSON.parse(script.textContent ?? "");
            if (data["@type"] !== "CollectionPage" || !data.mainEntity?.itemListElement) continue;

            for (const item of data.mainEntity.itemListElement) {
              const entry = item.item;
              if (entry?.["@type"] !== "CollegeOrUniversity") continue;
              const id: string = entry["@id"] ?? "";
              const match = id.match(/\/colleges\/([a-z0-9-]+)\/?$/);
              if (!match) continue;
              const slug = match[1];
              const name: string = entry.name ?? entry.award?.replace(/#\d+\s*/, "") ?? slug;
              results.push({ name, href: slug });
            }
          } catch {
            // skip
          }
        }

        return results;
      });

      if (entries.length === 0) {
        console.log(`  No entries found. Stopping pagination.`);
        break;
      }

      for (const entry of entries) {
        allEntries.push({
          name: entry.name,
          slug: entry.href,
          rank: globalRank++,
        });
      }

      console.log(`  Found ${entries.length} schools (total: ${allEntries.length})`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`Total Niche CS ranked schools: ${allEntries.length}`);
  console.log(`========================================`);

  if (allEntries.length === 0) {
    console.error("\nNo schools scraped. Niche may have blocked the request.");
    console.error("Try running with headed browser or check for CAPTCHAs.");
    process.exit(1);
  }

  // Match to our schools via slug
  const rankBySchoolName = new Map<string, number>();
  const unmatched: string[] = [];

  for (const entry of allEntries) {
    const matched = slugToSchoolName.get(entry.slug);
    if (matched) {
      if (!rankBySchoolName.has(matched)) {
        rankBySchoolName.set(matched, entry.rank);
      }
    } else {
      unmatched.push(`#${entry.rank} ${entry.name} (${entry.slug})`);
    }
  }

  if (DEBUG) {
    console.log("\nAll scraped entries:");
    for (const e of allEntries) {
      const matched = slugToSchoolName.get(e.slug);
      console.log(`  #${e.rank} ${e.name}${matched ? ` → ${matched}` : " [NO MATCH]"}`);
    }
  }

  let matchedCount = 0;
  const updatedSchools = schools.map((school) => {
    const name = school["name"] as string;
    const nicheRanking = rankBySchoolName.get(name) ?? null;
    if (nicheRanking !== null) matchedCount++;
    return { ...school, nicheRanking };
  });

  console.log(`\nMatched ${matchedCount} of ${schools.length} schools.`);

  if (unmatched.length > 0 && DEBUG) {
    console.log(`\nNiche schools not in our dataset (${unmatched.length}):`);
    for (const u of unmatched.slice(0, 30)) {
      console.log(`  ${u}`);
    }
    if (unmatched.length > 30) {
      console.log(`  ... and ${unmatched.length - 30} more`);
    }
  }

  const ourUnmatched = schools
    .map((s) => s["name"] as string)
    .filter((n) => !rankBySchoolName.has(n));
  if (ourUnmatched.length > 0) {
    console.log(`\nOur schools with no Niche CS ranking (${ourUnmatched.length}):`);
    for (const n of ourUnmatched) {
      console.log(`  ${n}`);
    }
  }

  if (matchedCount < MIN_MATCHED) {
    console.error(
      `\nFewer than ${MIN_MATCHED} schools matched (got ${matchedCount}). Aborting write.`
    );
    process.exit(1);
  }

  fs.writeFileSync(dataPath, JSON.stringify(updatedSchools, null, 2) + "\n", "utf-8");
  console.log(`\nSuccessfully wrote nicheRanking values to ${dataPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
