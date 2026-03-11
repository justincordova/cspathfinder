import { chromium } from "playwright";
import { z } from "zod";
import fs from "fs";
import path from "path";

const ScrapedEntrySchema = z.object({
  name: z.string(),
  rank: z.number().int().min(1).max(500),
  slug: z.string(),
});

type ScrapedEntry = z.infer<typeof ScrapedEntrySchema>;

const TOTAL_PAGES = 15;
const RESULTS_PER_PAGE = 25;
const MIN_MATCHED = 80;
const SHIFT_WARN_THRESHOLD = 50;
const SHIFT_WARN_FRACTION = 0.3;

function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromHref(href: string): string {
  return href.replace(/^\/colleges\//, "").replace(/\/$/, "");
}

function slugFromNicheUrl(nicheUrl: string): string {
  return nicheUrl.replace(/^https:\/\/www\.niche\.com\/colleges\//, "").replace(/\/$/, "");
}

const dataPath = path.join(process.cwd(), "data", "schools.json");
const schools: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(`Loaded ${schools.length} schools from data/schools.json`);

const browser = await chromium.launch({
  headless: true,
});

const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 720 },
});

const page = await context.newPage();

const scraped: ScrapedEntry[] = [];

try {
  for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
    const url =
      pageNum === 1
        ? "https://www.niche.com/colleges/search/best-colleges-for-computer-science/"
        : `https://www.niche.com/colleges/search/best-colleges-for-computer-science/?page=${pageNum}`;

    console.log(`Navigating to page ${pageNum}: ${url}`);

    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 }).catch(async () => {
      console.log("networkidle timed out, continuing anyway...");
    });

    const title = await page.title();
    if (title.includes("Access Denied") || title.includes("CAPTCHA")) {
      console.error(`Block detected on page ${pageNum}: "${title}"`);
      await browser.close();
      process.exit(1);
    }

    // Try multiple selectors
    let links: Array<{ name: string; href: string }> = [];

    const selectors = [
      '[data-testid="search-result"] h2 a',
      ".search-result .search-result__title a",
      'li[class*="result"] h2 a',
    ];

    for (const selector of selectors) {
      links = await page.$$eval(selector, (els) =>
        els.map((el) => ({
          name: (el as HTMLAnchorElement).textContent?.trim() ?? "",
          href: (el as HTMLAnchorElement).getAttribute("href") ?? "",
        }))
      );
      if (links.length > 0) {
        console.log(`  Found ${links.length} results using selector: ${selector}`);
        break;
      }
    }

    if (links.length < 5) {
      console.error(`Too few results on page ${pageNum}: ${links.length}. Aborting.`);
      await browser.close();
      process.exit(1);
    }

    const baseRank = (pageNum - 1) * RESULTS_PER_PAGE + 1;
    for (let i = 0; i < links.length; i++) {
      const { name, href } = links[i];
      const slug = slugFromHref(href);
      const rank = baseRank + i;

      const parsed = ScrapedEntrySchema.safeParse({ name, rank, slug });
      if (!parsed.success) {
        console.error(`Validation failed for entry ${rank} (${name}): ${parsed.error.message}`);
        await browser.close();
        process.exit(1);
      }

      scraped.push(parsed.data);
    }

    console.log(`  Page ${pageNum} done. Total scraped: ${scraped.length}`);

    if (pageNum < TOTAL_PAGES) {
      await randomDelay(2000, 5000);
    }
  }
} catch (err) {
  console.error("Error during scraping:", err);
  await browser.close();
  process.exit(1);
}

await browser.close();

console.log(`Scraping complete. Total entries: ${scraped.length}`);

// Match scraped schools to schools.json using nicheUrl slug
let matchedCount = 0;
let shiftedCount = 0;
let schoolsWithPrevRanking = 0;

const updatedSchools = schools.map((school) => {
  const nicheUrl = school["nicheUrl"] as string | undefined;
  if (!nicheUrl) {
    return { ...school, nicheRanking: null };
  }

  const schoolSlug = slugFromNicheUrl(nicheUrl);
  const match = scraped.find((s) => s.slug === schoolSlug);

  if (!match) {
    return { ...school, nicheRanking: null };
  }

  matchedCount++;

  const prevRanking = school["nicheRanking"] as number | null | undefined;
  if (prevRanking != null) {
    schoolsWithPrevRanking++;
    if (Math.abs(match.rank - prevRanking) >= SHIFT_WARN_THRESHOLD) {
      shiftedCount++;
    }
  }

  return { ...school, nicheRanking: match.rank };
});

console.log(`Matched ${matchedCount} of ${schools.length} schools.`);

if (matchedCount < MIN_MATCHED) {
  console.error(`Fewer than ${MIN_MATCHED} schools matched (got ${matchedCount}). Aborting write.`);
  process.exit(1);
}

if (schoolsWithPrevRanking > 0) {
  const shiftFraction = shiftedCount / schoolsWithPrevRanking;
  if (shiftFraction > SHIFT_WARN_FRACTION) {
    console.warn(
      `Warning: ${shiftedCount} of ${schoolsWithPrevRanking} schools (${(shiftFraction * 100).toFixed(1)}%) shifted 50+ positions vs previous nicheRanking values.`
    );
  }
}

fs.writeFileSync(dataPath, JSON.stringify(updatedSchools, null, 2) + "\n", "utf-8");
console.log(`Successfully wrote updated nicheRanking values to ${dataPath}`);
