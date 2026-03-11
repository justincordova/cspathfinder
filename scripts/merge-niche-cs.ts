/**
 * Build niche-schools.json from scraped ranking pages + profile data.
 *
 * Reads:
 *   data/niche-cs/page-*.json     — ranking + slug + name
 *   data/niche-profiles/<slug>.json — full school data from profile pages
 *
 * Outputs: data/niche-schools.json
 *
 * Usage: bun run scripts/merge-niche-cs.ts
 */

import fs from "fs";
import path from "path";

const nicheDir = path.join(process.cwd(), "data", "niche-cs");
const profileDir = path.join(process.cwd(), "data", "niche-profiles");
const outPath = path.join(process.cwd(), "data", "niche-schools.json");

if (!fs.existsSync(nicheDir)) {
  console.error("No data/niche-cs/ directory. Run scrape-niche-page.ts first.");
  process.exit(1);
}

// State → region mapping
const STATE_TO_REGION: Record<string, string> = {
  CT: "Northeast",
  ME: "Northeast",
  MA: "Northeast",
  NH: "Northeast",
  RI: "Northeast",
  VT: "Northeast",
  NJ: "Mid-Atlantic",
  NY: "Mid-Atlantic",
  PA: "Mid-Atlantic",
  DE: "Mid-Atlantic",
  MD: "Mid-Atlantic",
  DC: "Mid-Atlantic",
  IL: "Midwest",
  IN: "Midwest",
  IA: "Midwest",
  KS: "Midwest",
  MI: "Midwest",
  MN: "Midwest",
  MO: "Midwest",
  NE: "Midwest",
  ND: "Midwest",
  OH: "Midwest",
  SD: "Midwest",
  WI: "Midwest",
  AL: "Southeast",
  AR: "Southeast",
  FL: "Southeast",
  GA: "Southeast",
  KY: "Southeast",
  LA: "Southeast",
  MS: "Southeast",
  NC: "Southeast",
  SC: "Southeast",
  TN: "Southeast",
  VA: "Southeast",
  WV: "Southeast",
  AZ: "Southwest",
  NM: "Southwest",
  OK: "Southwest",
  TX: "Southwest",
  AK: "Pacific",
  HI: "Pacific",
  CA: "Pacific",
  OR: "Pacific",
  WA: "Pacific",
  CO: "West",
  ID: "West",
  MT: "West",
  NV: "West",
  UT: "West",
  WY: "West",
};

// Load ranking pages
const pageFiles = fs
  .readdirSync(nicheDir)
  .filter((f) => f.match(/^page-\d+\.json$/))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
    const nb = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
    return na - nb;
  });

console.log(`Found ${pageFiles.length} ranking pages`);

interface RankedEntry {
  slug: string;
  name: string;
  rank: number;
}

const ranked: RankedEntry[] = [];
for (const file of pageFiles) {
  const entries: RankedEntry[] = JSON.parse(fs.readFileSync(path.join(nicheDir, file), "utf-8"));
  ranked.push(...entries);
}

console.log(`Total ranked schools: ${ranked.length}`);

// Load profiles
const profileExists = fs.existsSync(profileDir);
let profileCount = 0;
const missingProfiles: string[] = [];

interface SchoolOutput {
  name: string;
  slug: string;
  state: string;
  city: string;
  region: string;
  csRanking: number | null;
  nicheRanking: number;
  tuitionInState: number;
  tuitionOutOfState: number;
  roomAndBoard: number;
  acceptanceRate: number;
  enrollment: number;
  graduationRate: number;
  medianEarnings6yr: number | null;
  medianDebt: number | null;
  website: string;
  usnewsUrl: string | null;
  nicheGrades: Record<string, string>;
  nicheUrl: string;
}

const DEFAULT_GRADES: Record<string, string> = {
  overall: "B",
  academics: "B",
  value: "B",
  diversity: "B",
  campus: "B",
  athletics: "B",
  partyScene: "B",
  professors: "B",
  location: "B",
  dorms: "B",
  campusFood: "B",
  studentLife: "B",
  safety: "B",
};

const schools: SchoolOutput[] = [];

for (const entry of ranked) {
  const profilePath = path.join(profileDir, `${entry.slug}.json`);
  let profile: Record<string, unknown> | null = null;

  if (profileExists && fs.existsSync(profilePath)) {
    profile = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
    profileCount++;
  } else {
    missingProfiles.push(`#${entry.rank} ${entry.slug}`);
    continue; // Skip schools without profile data
  }

  const state = (profile?.state as string) ?? "";
  const region = STATE_TO_REGION[state] ?? "Northeast";
  const nicheGrades = (profile?.nicheGrades as Record<string, string>) ?? DEFAULT_GRADES;

  // Fill in missing grades with defaults
  for (const key of Object.keys(DEFAULT_GRADES)) {
    if (!nicheGrades[key]) nicheGrades[key] = DEFAULT_GRADES[key];
  }

  // Build school slug from name (lowercase, hyphenated)
  const schoolSlug = entry.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const school: SchoolOutput = {
    name: (profile?.name as string) ?? entry.name,
    slug: schoolSlug,
    state,
    city: (profile?.city as string) ?? "",
    region,
    csRanking: null,
    nicheRanking: entry.rank,
    tuitionInState: (profile?.tuitionInState as number) ?? 0,
    tuitionOutOfState: (profile?.tuitionOutOfState as number) ?? 0,
    roomAndBoard: (profile?.roomAndBoard as number) ?? 0,
    acceptanceRate: (profile?.acceptanceRate as number) ?? 0,
    enrollment: (profile?.enrollment as number) ?? 0,
    graduationRate: (profile?.graduationRate as number) ?? 0,
    medianEarnings6yr: (profile?.medianEarnings6yr as number) ?? null,
    medianDebt: (profile?.medianDebt as number) ?? null,
    website:
      (profile?.website as string) ??
      `https://www.google.com/search?q=${encodeURIComponent(entry.name)}`,
    usnewsUrl: null,
    nicheGrades,
    nicheUrl: `https://www.niche.com/colleges/${entry.slug}/`,
  };

  schools.push(school);
}

// Sort by nicheRanking
schools.sort((a, b) => a.nicheRanking - b.nicheRanking);

console.log(`\nBuilt ${schools.length} schools with profile data`);
console.log(`Profiles found: ${profileCount}`);

if (missingProfiles.length > 0) {
  console.log(`\nMissing profiles (${missingProfiles.length} schools skipped):`);
  for (const m of missingProfiles.slice(0, 20)) {
    console.log(`  ${m}`);
  }
  if (missingProfiles.length > 20) {
    console.log(`  ... and ${missingProfiles.length - 20} more`);
  }
  console.log(`\nRun scrape-niche-profile.ts for these schools to include them.`);
}

// Check for ranking gaps
const ranks = schools.map((s) => s.nicheRanking);
const gaps: string[] = [];
for (let i = 1; i < ranks.length; i++) {
  if (ranks[i] !== ranks[i - 1] + 1) {
    gaps.push(`${ranks[i - 1]}→${ranks[i]}`);
  }
}
if (gaps.length > 0) {
  console.log(`\nRanking gaps: ${gaps.join(", ")}`);
}

fs.writeFileSync(outPath, JSON.stringify(schools, null, 2) + "\n");
console.log(`\nWrote ${outPath}`);
