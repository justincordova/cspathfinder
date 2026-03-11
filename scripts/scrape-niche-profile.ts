/**
 * Scrape a Niche college profile page for school data.
 *
 * Usage:  bun run scripts/scrape-niche-profile.ts <rank-or-slug>
 *         bun run scripts/scrape-niche-profile.ts 1
 *         bun run scripts/scrape-niche-profile.ts 85
 *         bun run scripts/scrape-niche-profile.ts massachusetts-institute-of-technology
 *
 * If a number is given, looks up the slug from data/niche-cs/page-*.json
 * Saves result to data/niche-profiles/<slug>.json
 *
 * After scraping all profiles + ranking pages, run: bun run scripts/merge-niche-cs.ts
 */

import fs from "fs";
import path from "path";

const input = process.argv[2]?.trim();
if (!input) {
  console.error("Usage: bun run scripts/scrape-niche-profile.ts <rank-or-slug>");
  process.exit(1);
}

let slug: string;

if (/^\d+$/.test(input)) {
  const rank = parseInt(input, 10);
  const nicheDir = path.join(process.cwd(), "data", "niche-cs");
  if (!fs.existsSync(nicheDir)) {
    console.error("No data/niche-cs/ directory. Run scrape-niche-page.ts first.");
    process.exit(1);
  }
  const pageFiles = fs.readdirSync(nicheDir).filter((f) => f.match(/^page-\d+\.json$/));
  let found: { slug: string; name: string; rank: number } | null = null;
  for (const file of pageFiles) {
    const entries: { slug: string; name: string; rank: number }[] = JSON.parse(
      fs.readFileSync(path.join(nicheDir, file), "utf-8")
    );
    const entry = entries.find((e) => e.rank === rank);
    if (entry) {
      found = entry;
      break;
    }
  }
  if (!found) {
    console.error(`No school found at rank #${rank}.`);
    process.exit(1);
  }
  slug = found.slug;
  console.log(`Rank #${rank} → ${found.name} (${slug})`);
} else {
  slug = input;
}

// Try /colleges/ first, fall back to /graduate-schools/
let urlPath = "colleges";
if (process.argv.includes("--grad")) urlPath = "graduate-schools";
const url = `https://www.niche.com/${urlPath}/${slug}/`;
const outDir = path.join(process.cwd(), "data", "niche-profiles");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log(`Fetching: ${url}`);

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

if (title.toLowerCase().includes("denied") || title.toLowerCase().includes("captcha")) {
  console.error("BLOCKED — wait a bit and try again.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Extract JSON-LD (CollegeOrUniversity block)
// ---------------------------------------------------------------------------

interface JsonLdData {
  "@type"?: string;
  name?: string;
  sameAs?: string;
  address?: { addressLocality?: string; addressRegion?: string };
  additionalProperty?: Array<{ name: string; value: string }>;
  [key: string]: unknown;
}

let jsonLd: JsonLdData | null = null;
const ldJsonRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
let match;
while ((match = ldJsonRegex.exec(html)) !== null) {
  try {
    const data = JSON.parse(match[1].replace(/\\u002F/g, "/"));
    if (data["@type"] === "CollegeOrUniversity") {
      jsonLd = data;
      break;
    }
  } catch {
    // skip
  }
}

// ---------------------------------------------------------------------------
// Extract grades from JSON-LD additionalProperty
// ---------------------------------------------------------------------------

type GradeKey =
  | "overall"
  | "academics"
  | "value"
  | "diversity"
  | "campus"
  | "athletics"
  | "partyScene"
  | "professors"
  | "location"
  | "dorms"
  | "campusFood"
  | "studentLife"
  | "safety";

const GRADE_NAME_MAP: Record<string, GradeKey> = {
  "Overall Niche Grade": "overall",
  Academics: "academics",
  Value: "value",
  Diversity: "diversity",
  Campus: "campus",
  Athletics: "athletics",
  "Party Scene": "partyScene",
  Professors: "professors",
  Location: "location",
  Dorms: "dorms",
  "Campus Food": "campusFood",
  "Student Life": "studentLife",
  Safety: "safety",
};

const validGrades = new Set([
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
]);

const grades: Record<string, string> = {};
if (jsonLd?.additionalProperty) {
  for (const prop of jsonLd.additionalProperty) {
    const key = GRADE_NAME_MAP[prop.name];
    if (key && validGrades.has(prop.value)) {
      grades[key] = prop.value;
    }
  }
}

// ---------------------------------------------------------------------------
// Extract stats
// ---------------------------------------------------------------------------

// Helper: find dollar amount after a label in HTML
function dollarAfterLabel(label: string): number | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = html.match(new RegExp(escaped + "[\\s\\S]{0,500}?\\$(\\d[\\d,]*)", "i"));
  if (!m) return null;
  return parseFloat(m[1].replace(/,/g, ""));
}

// Tuition (from scalar labels)
const tuitionInState = dollarAfterLabel("In-State Tuition");
const tuitionOutOfState = dollarAfterLabel("Out-of-State Tuition");
const housingCost = dollarAfterLabel("Average Housing Cost");
const mealPlanCost = dollarAfterLabel("Average Meal Plan Cost");
const roomAndBoard = housingCost && mealPlanCost ? housingCost + mealPlanCost : null;

// Net price
const netPrice = dollarAfterLabel("Net Price");

// Median earnings (in the "Median Earnings" section)
const medianEarnings = dollarAfterLabel("Median Earnings");

// Helper: extract value from embedded JSON config: "label":"X"..."value":N
function jsonConfigValue(label: string): number | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = html.match(new RegExp(`"label":"${escaped}"[^}]*?"value":(\\d[\\d.]*)`));
  return m ? parseFloat(m[1]) : null;
}

// Acceptance rate: try embedded JSON first, then description text
let acceptanceRate: number | null =
  jsonConfigValue("Acceptance Rate") ??
  (() => {
    const m = html.match(/acceptance rate (?:is )?(?:only )?(\d+)%/i);
    return m ? parseFloat(m[1]) / 100 : null;
  })();

// Graduation rate: try embedded JSON first, then description text
let graduationRate: number | null =
  jsonConfigValue("Graduation Rate") ??
  (() => {
    const m = html.match(/graduates (\d+)% of/i);
    return m ? parseFloat(m[1]) / 100 : null;
  })();

// Round rates to reasonable precision
if (acceptanceRate !== null) acceptanceRate = Math.round(acceptanceRate * 1000) / 1000;
if (graduationRate !== null) graduationRate = Math.round(graduationRate * 1000) / 1000;

// Enrollment: try description text, then embedded JSON
// Enrollment: try JSON config, then various description patterns
const enrollment: number | null = (() => {
  // JSON config: "label":"Full-Time Enrollment"..."value":XXXX
  const jsonMatch = html.match(
    /"label":"(?:Full.?Time|Total) Enrollment"[^}]*?"value":(\d[\d.]*)/i
  );
  if (jsonMatch) return Math.round(parseFloat(jsonMatch[1]));
  // Description patterns
  const textMatch =
    html.match(/(?:full-time )?(?:undergraduate )?enrollment (?:of )?([\d,]+)/i) ??
    html.match(/(?:with|has) ([\d,]+) (?:undergraduate )?students/i) ??
    html.match(/([\d,]+) undergraduate students/i) ??
    html.match(/student body of ([\d,]+)/i);
  if (textMatch) return parseInt(textMatch[1].replace(/,/g, ""), 10);
  return null;
})();

// Median debt - look for it near "median" and "debt"
const medianDebt = dollarAfterLabel("Median Total Debt") ?? dollarAfterLabel("Median Debt");

// Website from JSON-LD sameAs
const website = jsonLd?.sameAs ?? null;

// City/state from JSON-LD
const city = jsonLd?.address?.addressLocality ?? null;
const state = jsonLd?.address?.addressRegion ?? null;
const name = jsonLd?.name ?? title.replace(/\s*[|\-–].*/g, "").trim();

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const profile = {
  slug,
  name,
  city,
  state,
  website,
  acceptanceRate,
  enrollment,
  graduationRate,
  tuitionInState,
  tuitionOutOfState,
  roomAndBoard,
  netPrice,
  medianEarnings6yr: medianEarnings,
  medianDebt,
  nicheGrades: Object.keys(grades).length > 0 ? grades : null,
  nicheUrl: url,
};

const outFile = path.join(outDir, `${slug}.json`);
fs.writeFileSync(outFile, JSON.stringify(profile, null, 2) + "\n");
console.log(`Saved to ${outFile}`);
console.log(JSON.stringify(profile, null, 2));

// Report missing fields
const missing: string[] = [];
if (!city) missing.push("city");
if (!state) missing.push("state");
if (!website) missing.push("website");
if (acceptanceRate === null) missing.push("acceptanceRate");
if (!enrollment) missing.push("enrollment");
if (graduationRate === null) missing.push("graduationRate");
if (!tuitionInState) missing.push("tuitionInState");
if (!tuitionOutOfState) missing.push("tuitionOutOfState");
if (!roomAndBoard) missing.push("roomAndBoard");
if (!grades.overall) missing.push("grades.overall");
if (Object.keys(grades).length < 13) missing.push(`grades (${Object.keys(grades).length}/13)`);

if (missing.length > 0) {
  console.log(`\nMissing fields: ${missing.join(", ")}`);
} else {
  console.log(`\nAll fields extracted successfully!`);
}
