/**
 * Scrape missing Niche profiles for CSRankings schools.
 * Reads from data/csrankings-missing-profiles.txt, skips already scraped.
 * Pauses on 403 for you to change VPN.
 *
 * Usage: bun run scripts/scrape-csrankings-missing.ts
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const missingFile = path.join(process.cwd(), "data", "csrankings-missing-profiles.txt");
const profileDir = path.join(process.cwd(), "data", "niche-profiles");

if (!fs.existsSync(missingFile)) {
  console.error("No missing profiles file. Run: bun run scripts/scrape-csrankings.ts --merge-only");
  process.exit(1);
}

const slugs = fs.readFileSync(missingFile, "utf-8").split("\n").filter(Boolean);
const todo = slugs.filter((s) => !fs.existsSync(path.join(profileDir, `${s}.json`)));

console.log(`${todo.length} profiles to scrape\n`);

function ask(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) => {
    rl.question("\nChange VPN server, then press ENTER... ", () => {
      rl.close();
      r();
    });
  });
}

for (let i = 0; i < todo.length; i++) {
  const slug = todo[i];
  process.stdout.write(`[${i + 1}/${todo.length}] ${slug}`);

  let resp: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    resp = await fetch(`https://www.niche.com/colleges/${slug}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    console.log(" ⏱ TIMEOUT — retrying after VPN change");
    await ask();
    i--;
    continue;
  }

  if (resp.status === 403) {
    console.log(" ⛔ BLOCKED");
    await ask();
    i--;
    continue;
  }

  if (resp.status === 404) {
    console.log(" 404 — no Niche page, skipping");
    continue;
  }

  if (!resp.ok) {
    console.log(` HTTP ${resp.status} — skipping`);
    continue;
  }

  const html = await resp.text();
  if (html.length < 10000) {
    console.log(" ⛔ BLOCKED (small page)");
    await ask();
    i--;
    continue;
  }

  // Extract data (same logic as scrape-niche-profile.ts)
  interface JLD {
    "@type"?: string;
    name?: string;
    sameAs?: string;
    address?: { addressLocality?: string; addressRegion?: string };
    additionalProperty?: Array<{ name: string; value: string }>;
    [k: string]: unknown;
  }
  let jsonLd: JLD | null = null;
  const ldR = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = ldR.exec(html)) !== null) {
    try {
      const d = JSON.parse(m[1].replace(/\\u002F/g, "/"));
      if (d["@type"] === "CollegeOrUniversity") {
        jsonLd = d;
        break;
      }
    } catch {}
  }

  const GM: Record<string, string> = {
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
  const VG = new Set(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"]);
  const grades: Record<string, string> = {};
  if (jsonLd?.additionalProperty)
    for (const p of jsonLd.additionalProperty) {
      const k = GM[p.name];
      if (k && VG.has(p.value)) grades[k] = p.value;
    }

  const $$ = (l: string) => {
    const e = l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = html.match(new RegExp(e + "[\\s\\S]{0,500}?\\$(\\d[\\d,]*)", "i"));
    return m ? parseFloat(m[1].replace(/,/g, "")) : null;
  };
  const jv = (l: string) => {
    const e = l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = html.match(new RegExp(`"label":"${e}"[^}]*?"value":(\\d[\\d.]*)`));
    return m ? parseFloat(m[1]) : null;
  };

  const h = $$("Average Housing Cost"),
    mp = $$("Average Meal Plan Cost");
  let ar =
    jv("Acceptance Rate") ??
    (() => {
      const m = html.match(/acceptance rate (?:is )?(?:only )?(\d+)%/i);
      return m ? parseFloat(m[1]) / 100 : null;
    })();
  if (ar !== null) ar = Math.round(ar * 1000) / 1000;
  let gr =
    jv("Graduation Rate") ??
    (() => {
      const m = html.match(/graduates (\d+)% of/i);
      return m ? parseFloat(m[1]) / 100 : null;
    })();
  if (gr !== null) gr = Math.round(gr * 1000) / 1000;
  const enr = (() => {
    const j = html.match(/"label":"(?:Full.?Time|Total) Enrollment"[^}]*?"value":(\d[\d.]*)/i);
    if (j) return Math.round(parseFloat(j[1]));
    const t =
      html.match(/(?:full-time )?(?:undergraduate )?enrollment (?:of )?([\d,]+)/i) ??
      html.match(/([\d,]+) undergraduate students/i);
    return t ? parseInt(t[1].replace(/,/g, ""), 10) : null;
  })();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? "";

  const profile = {
    slug,
    name: jsonLd?.name ?? title.replace(/\s*[|\-–].*/g, "").trim(),
    city: jsonLd?.address?.addressLocality ?? null,
    state: jsonLd?.address?.addressRegion ?? null,
    website: jsonLd?.sameAs ?? null,
    acceptanceRate: ar,
    enrollment: enr,
    graduationRate: gr,
    tuitionInState: $$("In-State Tuition"),
    tuitionOutOfState: $$("Out-of-State Tuition"),
    roomAndBoard: h && mp ? h + mp : null,
    netPrice: $$("Net Price"),
    medianEarnings6yr: $$("Median Earnings"),
    medianDebt: $$("Median Total Debt") ?? $$("Median Debt"),
    nicheGrades: Object.keys(grades).length > 0 ? grades : null,
    nicheUrl: `https://www.niche.com/colleges/${slug}/`,
  };

  fs.writeFileSync(path.join(profileDir, `${slug}.json`), JSON.stringify(profile, null, 2) + "\n");
  console.log(" ✓");

  if (i < todo.length - 1) await new Promise((r) => setTimeout(r, 3000));
}

console.log("\nDone! Now run: bun run scripts/scrape-csrankings.ts --merge-only");
