/**
 * Scrape all Niche profiles sequentially. Pauses on 403 and prompts
 * you to change your IP, then continues where it left off.
 *
 * Usage:  bun run scripts/scrape-niche-all-profiles.ts [--start <rank>] [--delay <seconds>]
 *
 * Default delay: 3 seconds between requests.
 *
 * NOTE: Niche stops ranking at #356 (page 15).
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const args = process.argv.slice(2);
let startRank = 1;
let delay = 3;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--start" && args[i + 1]) startRank = parseInt(args[++i], 10);
  if (args[i] === "--delay" && args[i + 1]) delay = parseInt(args[++i], 10);
}

const nicheDir = path.join(process.cwd(), "data", "niche-cs");
const profileDir = path.join(process.cwd(), "data", "niche-profiles");
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

// Load all ranked schools
interface RankedEntry {
  slug: string;
  name: string;
  rank: number;
}

const pageFiles = fs.readdirSync(nicheDir).filter((f) => f.match(/^page-\d+\.json$/));

const allSchools: RankedEntry[] = [];
for (const file of pageFiles) {
  const entries: RankedEntry[] = JSON.parse(fs.readFileSync(path.join(nicheDir, file), "utf-8"));
  allSchools.push(...entries);
}
allSchools.sort((a, b) => a.rank - b.rank);

// Filter to schools starting from startRank
const todo = allSchools.filter((s) => s.rank >= startRank);
console.log(`${todo.length} schools to process (starting from rank #${startRank})\n`);

function askToContinue(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(
      "\nChange your IP (ProtonVPN → Change Server), then press ENTER to continue... ",
      () => {
        rl.close();
        resolve();
      }
    );
  });
}

async function scrapeProfile(slug: string): Promise<"ok" | "blocked" | "error"> {
  const url = `https://www.niche.com/colleges/${slug}/`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (resp.status === 403) return "blocked";
  if (!resp.ok) {
    console.error(`  HTTP ${resp.status}`);
    return "error";
  }

  const html = await resp.text();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? "";
  if (title.toLowerCase().includes("denied") || title.toLowerCase().includes("captcha")) {
    return "blocked";
  }

  // --- Extract JSON-LD ---
  interface JsonLdData {
    "@type"?: string;
    name?: string;
    sameAs?: string;
    address?: { addressLocality?: string; addressRegion?: string };
    additionalProperty?: Array<{ name: string; value: string }>;
    [key: string]: unknown;
  }

  let jsonLd: JsonLdData | null = null;
  const ldRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = ldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].replace(/\\u002F/g, "/"));
      if (data["@type"] === "CollegeOrUniversity") {
        jsonLd = data;
        break;
      }
    } catch {
      /* skip */
    }
  }

  // --- Grades from JSON-LD ---
  const GRADE_NAME_MAP: Record<string, string> = {
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
      if (key && validGrades.has(prop.value)) grades[key] = prop.value;
    }
  }

  // --- Stats ---
  function dollarAfterLabel(label: string): number | null {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = html.match(new RegExp(escaped + "[\\s\\S]{0,500}?\\$(\\d[\\d,]*)", "i"));
    return m ? parseFloat(m[1].replace(/,/g, "")) : null;
  }

  function jsonConfigValue(label: string): number | null {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = html.match(new RegExp(`"label":"${escaped}"[^}]*?"value":(\\d[\\d.]*)`));
    return m ? parseFloat(m[1]) : null;
  }

  const tuitionInState = dollarAfterLabel("In-State Tuition");
  const tuitionOutOfState = dollarAfterLabel("Out-of-State Tuition");
  const housingCost = dollarAfterLabel("Average Housing Cost");
  const mealPlanCost = dollarAfterLabel("Average Meal Plan Cost");
  const roomAndBoard = housingCost && mealPlanCost ? housingCost + mealPlanCost : null;

  let acceptanceRate: number | null =
    jsonConfigValue("Acceptance Rate") ??
    (() => {
      const m = html.match(/acceptance rate (?:is )?(?:only )?(\d+)%/i);
      return m ? parseFloat(m[1]) / 100 : null;
    })();
  if (acceptanceRate !== null) acceptanceRate = Math.round(acceptanceRate * 1000) / 1000;

  let graduationRate: number | null =
    jsonConfigValue("Graduation Rate") ??
    (() => {
      const m = html.match(/graduates (\d+)% of/i);
      return m ? parseFloat(m[1]) / 100 : null;
    })();
  if (graduationRate !== null) graduationRate = Math.round(graduationRate * 1000) / 1000;

  const enrollment: number | null = (() => {
    const jm = html.match(/"label":"(?:Full.?Time|Total) Enrollment"[^}]*?"value":(\d[\d.]*)/i);
    if (jm) return Math.round(parseFloat(jm[1]));
    const tm =
      html.match(/(?:full-time )?(?:undergraduate )?enrollment (?:of )?([\d,]+)/i) ??
      html.match(/(?:with|has) ([\d,]+) (?:undergraduate )?students/i) ??
      html.match(/([\d,]+) undergraduate students/i) ??
      html.match(/student body of ([\d,]+)/i);
    return tm ? parseInt(tm[1].replace(/,/g, ""), 10) : null;
  })();

  const profile = {
    slug,
    name: jsonLd?.name ?? title.replace(/\s*[|\-–].*/g, "").trim(),
    city: jsonLd?.address?.addressLocality ?? null,
    state: jsonLd?.address?.addressRegion ?? null,
    website: jsonLd?.sameAs ?? null,
    acceptanceRate,
    enrollment,
    graduationRate,
    tuitionInState,
    tuitionOutOfState,
    roomAndBoard,
    netPrice: dollarAfterLabel("Net Price"),
    medianEarnings6yr: dollarAfterLabel("Median Earnings"),
    medianDebt: dollarAfterLabel("Median Total Debt") ?? dollarAfterLabel("Median Debt"),
    nicheGrades: Object.keys(grades).length > 0 ? grades : null,
    nicheUrl: `https://www.niche.com/colleges/${slug}/`,
  };

  fs.writeFileSync(path.join(profileDir, `${slug}.json`), JSON.stringify(profile, null, 2) + "\n");

  const missing: string[] = [];
  if (!profile.city) missing.push("city");
  if (!profile.state) missing.push("state");
  if (!profile.website) missing.push("website");
  if (acceptanceRate === null) missing.push("accept");
  if (!enrollment) missing.push("enroll");
  if (graduationRate === null) missing.push("grad");
  if (!tuitionInState) missing.push("tuition");
  if (Object.keys(grades).length < 13) missing.push(`grades(${Object.keys(grades).length})`);

  const status = missing.length > 0 ? `missing: ${missing.join(",")}` : "✓";
  console.log(`  ${status}`);

  return "ok";
}

// --- Main loop ---
let consecutiveBlocks = 0;

for (let i = 0; i < todo.length; i++) {
  const school = todo[i];

  // Skip already scraped
  if (fs.existsSync(path.join(profileDir, `${school.slug}.json`))) {
    continue;
  }

  process.stdout.write(`[${school.rank}/356] ${school.name}`);

  const result = await scrapeProfile(school.slug);

  if (result === "blocked") {
    consecutiveBlocks++;
    console.log(`  ⛔ BLOCKED (403)`);
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  Blocked after ${consecutiveBlocks} attempt(s).`);
    console.log(`  Scraped so far: ${fs.readdirSync(profileDir).length} profiles`);
    console.log(`  Next up: #${school.rank} ${school.name}`);
    console.log(`═══════════════════════════════════════════`);

    await askToContinue();
    consecutiveBlocks = 0;
    i--; // retry this school
    continue;
  }

  if (result === "error") {
    continue; // skip errors, move on
  }

  consecutiveBlocks = 0;

  // Delay between requests
  if (i < todo.length - 1) {
    await new Promise((r) => setTimeout(r, delay * 1000));
  }
}

const total = fs.readdirSync(profileDir).length;
console.log(`\nDone! ${total} profiles scraped.`);
console.log(`Run: bun run scripts/merge-niche-cs.ts`);
