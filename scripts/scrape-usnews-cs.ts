/**
 * Scrape US News Best Undergraduate Computer Science Rankings
 *
 * URL: https://www.usnews.com/best-colleges/rankings/computer-science-overall?myCollege=computer-science&_sort=myCollege&_sortDirection=asc
 *
 * The page uses a "Load More" button (no pagination). We click it
 * repeatedly until all schools are loaded, then extract from JSON-LD
 * or the DOM.
 *
 * Uses playwright-extra with stealth plugin to bypass bot detection.
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

// @ts-expect-error — stealth plugin types are for puppeteer but work with playwright-extra
chromium.use(stealth());

const DEBUG = process.argv.includes("--debug");
const URL =
  "https://www.usnews.com/best-colleges/rankings/computer-science-overall?myCollege=computer-science&_sort=myCollege&_sortDirection=asc";

const dataPath = path.join(process.cwd(), "data", "schools.json");
const schools: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(`Loaded ${schools.length} schools from data/schools.json`);

// ---------------------------------------------------------------------------
// Name matching helpers
// ---------------------------------------------------------------------------

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[.,\-]/g, " ")
    .replace(/--/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const USNEWS_ALIASES: Record<string, string> = {
  "university of california berkeley": "University of California Berkeley",
  "university of california, berkeley": "University of California Berkeley",
  "university of california los angeles": "University of California Los Angeles",
  "university of california, los angeles": "University of California Los Angeles",
  "university of california san diego": "University of California San Diego",
  "university of california, san diego": "University of California San Diego",
  "university of california davis": "University of California Davis",
  "university of california, davis": "University of California Davis",
  "university of california irvine": "University of California Irvine",
  "university of california, irvine": "University of California Irvine",
  "university of california santa barbara": "University of California Santa Barbara",
  "university of california, santa barbara": "University of California Santa Barbara",
  "university of california santa cruz": "University of California Santa Cruz",
  "university of california, santa cruz": "University of California Santa Cruz",
  "university of california riverside": "University of California Riverside",
  "university of california, riverside": "University of California Riverside",
  "university of illinois urbana champaign": "University of Illinois Urbana-Champaign",
  "university of illinois at urbana champaign": "University of Illinois Urbana-Champaign",
  "georgia institute of technology": "Georgia Institute of Technology",
  "massachusetts institute of technology": "Massachusetts Institute of Technology",
  "california institute of technology": "California Institute of Technology",
  "university of maryland college park": "University of Maryland",
  "university of maryland, college park": "University of Maryland",
  "university of wisconsin madison": "University of Wisconsin-Madison",
  "university of wisconsin  madison": "University of Wisconsin-Madison",
  "university of north carolina chapel hill": "University of North Carolina Chapel Hill",
  "university of north carolina at chapel hill": "University of North Carolina Chapel Hill",
  "north carolina state university": "NC State University",
  "pennsylvania state university university park": "Penn State University",
  "pennsylvania state university  university park": "Penn State University",
  "indiana university bloomington": "Indiana University Bloomington",
  "indiana university  bloomington": "Indiana University Bloomington",
  "university of nebraska lincoln": "University of Nebraska-Lincoln",
  "university of nebraska  lincoln": "University of Nebraska-Lincoln",
  "university of illinois chicago": "University of Illinois Chicago",
  "rochester institute of technology": "Rochester Institute of Technology",
  "new jersey institute of technology": "New Jersey Institute of Technology",
  "colorado school of mines": "Colorado School of Mines",
  "rensselaer polytechnic institute": "Rensselaer Polytechnic Institute",
  "worcester polytechnic institute": "Worcester Polytechnic Institute",
  "stevens institute of technology": "Stevens Institute of Technology",
  "texas a&m university college station": "Texas A&M University",
  "texas a&m university": "Texas A&M University",
  "texas a&m university  college station": "Texas A&M University",
  "university of texas austin": "University of Texas at Austin",
  "university of texas  austin": "University of Texas at Austin",
  "the university of texas at austin": "University of Texas at Austin",
  "university of texas at austin": "University of Texas at Austin",
};

const ourSchoolsByNormalized = new Map<string, string>();
for (const school of schools) {
  const name = school["name"] as string;
  ourSchoolsByNormalized.set(normalize(name), name);
}

function matchName(usnewsName: string): string | null {
  const norm = normalize(usnewsName);

  if (USNEWS_ALIASES[norm]) return USNEWS_ALIASES[norm];
  if (ourSchoolsByNormalized.has(norm)) return ourSchoolsByNormalized.get(norm)!;

  // Strip parentheticals
  const stripped = norm
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (ourSchoolsByNormalized.has(stripped)) return ourSchoolsByNormalized.get(stripped)!;

  // Remove commas
  const noComma = norm.replace(/,/g, "").replace(/\s+/g, " ").trim();
  if (USNEWS_ALIASES[noComma]) return USNEWS_ALIASES[noComma];
  if (ourSchoolsByNormalized.has(noComma)) return ourSchoolsByNormalized.get(noComma)!;

  return null;
}

// ---------------------------------------------------------------------------
// Scrape
// ---------------------------------------------------------------------------

interface RankedSchool {
  name: string;
  rank: number;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });
  const page = await context.newPage();

  try {
    console.log(`\nNavigating to ${URL}`);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log(`Page title: ${await page.title()}`);

    // Dismiss overlays/modals that block interaction
    async function dismissOverlays() {
      await page.evaluate(() => {
        // 1. Registration wall modal (MUI)
        const muiBackdrops = document.querySelectorAll(".MuiModal-root, .MuiBackdrop-root");
        for (const el of muiBackdrops) el.remove();

        // 2. Ad/campaign overlays (Bounce Exchange)
        const bxOverlays = document.querySelectorAll('[id^="bx-campaign"], .bx-base, .bxc');
        for (const el of bxOverlays) el.remove();

        // 3. Any generic overlay/backdrop
        const overlays = document.querySelectorAll(
          '[class*="overlay"], [class*="Overlay"], [class*="backdrop"], [class*="Backdrop"], [class*="modal"], [class*="Modal"]'
        );
        for (const el of overlays) {
          const style = window.getComputedStyle(el);
          if (style.position === "fixed" || style.position === "absolute") {
            el.remove();
          }
        }

        // 4. Remove any fixed-position elements covering the page
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
      });
    }

    await dismissOverlays();
    console.log("Dismissed overlays");

    // Click "Load More" until it disappears or we've loaded everything
    let loadMoreClicks = 0;
    const MAX_CLICKS = 50; // safety limit

    while (loadMoreClicks < MAX_CLICKS) {
      // Dismiss overlays that may reappear
      await dismissOverlays();
      // Click "Load More" via JS evaluate to bypass all overlay checks
      const clicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll("button, a");
        for (const b of buttons) {
          const text = b.textContent?.trim().toLowerCase() ?? "";
          if (text.includes("load more") || text.includes("show more")) {
            (b as HTMLElement).click();
            return true;
          }
        }
        return false;
      });

      if (!clicked) {
        console.log("  No more 'Load More' button found.");
        break;
      }

      loadMoreClicks++;
      console.log(`  Clicked Load More (#${loadMoreClicks}), waiting...`);

      // Wait for new content to load
      await page.waitForTimeout(2000 + Math.random() * 1500);
    }

    console.log(`\nDone loading. Clicked Load More ${loadMoreClicks} times.`);

    if (DEBUG) {
      const html = await page.content();
      fs.writeFileSync("debug-usnews.html", html);
      await page.screenshot({ path: "debug-usnews.png", fullPage: true });
      console.log("Saved debug-usnews.html and debug-usnews.png");
    }

    // ---------------------------------------------------------------
    // Extract rankings
    // ---------------------------------------------------------------

    // Strategy 1: JSON-LD ItemList
    let results: RankedSchool[] = await page.evaluate(() => {
      const found: { name: string; rank: number }[] = [];
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const raw = JSON.parse(script.textContent ?? "");
          const items = Array.isArray(raw) ? raw : [raw];
          for (const obj of items) {
            const graph = obj["@graph"] ?? [obj];
            const arr = Array.isArray(graph) ? graph : [graph];
            for (const node of arr) {
              if (node["@type"] === "ItemList" && node.itemListElement) {
                for (const el of node.itemListElement) {
                  if (el.item?.name && typeof el.position === "number") {
                    found.push({
                      name: el.item.name,
                      rank: el.position,
                    });
                  }
                }
              }
            }
          }
        } catch {
          // skip
        }
      }
      return found;
    });

    console.log(`JSON-LD extracted ${results.length} entries`);

    // Strategy 2: DOM scraping if JSON-LD didn't get enough
    if (results.length < 20) {
      console.log("Trying DOM scraping...");
      const domResults = await page.evaluate(() => {
        const found: { name: string; rank: number }[] = [];
        // Look for elements with rank numbers and school names
        const cards = document.querySelectorAll(
          "li, article, [class*='Card'], [class*='card'], [class*='Result'], [class*='result']"
        );
        for (const card of cards) {
          const text = card.textContent ?? "";
          const rankMatch = text.match(/#(\d+)/);
          if (!rankMatch) continue;
          const rank = parseInt(rankMatch[1], 10);
          if (rank < 1 || rank > 700) continue;

          const nameEl =
            card.querySelector("h3 a") ??
            card.querySelector("h3") ??
            card.querySelector("h2 a") ??
            card.querySelector("h2") ??
            card.querySelector("a[href*='best-colleges']");
          const name = nameEl?.textContent?.trim();
          if (name && name.length > 3 && name.length < 100) {
            if (!found.some((f) => f.name === name)) {
              found.push({ name, rank });
            }
          }
        }
        return found;
      });
      if (domResults.length > results.length) {
        results = domResults;
        console.log(`DOM scraping found ${results.length} entries`);
      }
    }

    // Deduplicate by name
    const seen = new Set<string>();
    results = results.filter((r) => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    });

    console.log(`\nTotal unique schools scraped: ${results.length}`);

    if (DEBUG) {
      console.log("\nAll scraped entries:");
      for (const s of results) {
        const matched = matchName(s.name);
        console.log(`  #${s.rank} ${s.name}${matched ? ` → ${matched}` : " [NO MATCH]"}`);
      }
      return;
    }

    if (results.length === 0) {
      console.error("\nNo rankings scraped. Run with --debug to inspect the page.");
      process.exit(1);
    }

    // Match to our schools
    const rankBySchoolName = new Map<string, number>();
    const unmatched: string[] = [];

    for (const inst of results) {
      const matched = matchName(inst.name);
      if (matched) {
        if (!rankBySchoolName.has(matched)) {
          rankBySchoolName.set(matched, inst.rank);
        }
      } else {
        unmatched.push(`#${inst.rank} ${inst.name}`);
      }
    }

    let matchedCount = 0;
    const updatedSchools = schools.map((school) => {
      const name = school["name"] as string;
      const usnewsRanking = rankBySchoolName.get(name) ?? null;
      if (usnewsRanking !== null) matchedCount++;
      return { ...school, usnewsRanking };
    });

    console.log(`Matched ${matchedCount} of ${schools.length} schools.`);

    if (unmatched.length > 0) {
      console.log(`\nUS News schools not matched to our dataset (${unmatched.length}):`);
      for (const u of unmatched.slice(0, 50)) {
        console.log(`  ${u}`);
      }
      if (unmatched.length > 50) {
        console.log(`  ... and ${unmatched.length - 50} more`);
      }
    }

    const ourUnmatched = schools
      .map((s) => s["name"] as string)
      .filter((n) => !rankBySchoolName.has(n));
    if (ourUnmatched.length > 0) {
      console.log(`\nOur schools with no US News CS ranking (${ourUnmatched.length}):`);
      for (const n of ourUnmatched) {
        console.log(`  ${n}`);
      }
    }

    if (matchedCount < 10) {
      console.error(`\nFewer than 10 schools matched (got ${matchedCount}). Aborting write.`);
      process.exit(1);
    }

    fs.writeFileSync(dataPath, JSON.stringify(updatedSchools, null, 2) + "\n", "utf-8");
    console.log(`\nSuccessfully wrote usnewsRanking values to ${dataPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
