/**
 * Tests for the chat route's data-context injection logic.
 *
 * `buildDataContext` and `topN` are module-private, so we mirror the logic
 * here and test it independently — the same pattern used in ChatDrawer.test.tsx
 * for parseFilterBlock.
 */
import { describe, it, expect } from "vitest";
import { gradeToNumeric } from "@/lib/data/schema";
import type { School } from "@/lib/data/schema";

// ─── Mirror of topN from route.ts ───────────────────────────────────────────

function topN(schools: School[], n: number, score: (s: School) => number, desc: boolean): string {
  return [...schools]
    .sort((a, b) => (desc ? score(b) - score(a) : score(a) - score(b)))
    .slice(0, n)
    .map((s) => s.name)
    .join(", ");
}

// ─── Mirror of buildDataContext keyword detection ────────────────────────────

type GradeKey = keyof School["nicheGrades"];

function detectGradeKey(q: string): { key: GradeKey; label: string } | null {
  if (/\b(food|dining|cafeteria|meal|eat)\b/.test(q))
    return { key: "campusFood", label: "campus food" };
  if (/\b(safe(?:st)?|unsafe|safety|danger(?:ous)?|crime)\b/.test(q))
    return { key: "safety", label: "safety" };
  if (/\b(dorm|dorms|housing|residence hall)\b/.test(q)) return { key: "dorms", label: "dorms" };
  if (/\b(party|parties|nightlife|social scene)\b/.test(q))
    return { key: "partyScene", label: "party scene" };
  if (/\b(student life|social life|clubs|activities)\b/.test(q))
    return { key: "studentLife", label: "student life" };
  if (/\b(divers|inclusion|inclusive)\b/.test(q)) return { key: "diversity", label: "diversity" };
  if (/\b(professors?|faculty|teacher|instruction|teaching)\b/.test(q))
    return { key: "professors", label: "professors" };
  if (/\b(athletic|sport|sports|gym)\b/.test(q)) return { key: "athletics", label: "athletics" };
  if (/\b(value|bang for|worth)\b/.test(q)) return { key: "value", label: "value" };
  if (/\b(location|neighborhood|area|surroundings)\b/.test(q))
    return { key: "location", label: "location" };
  if (/\b(academics?|education|learning quality)\b/.test(q))
    return { key: "academics", label: "academics" };
  return null;
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

const base: School = {
  name: "Alpha University",
  slug: "alpha",
  state: "CA",
  city: "Palo Alto",
  region: "West",
  csRanking: 1,
  nicheRanking: 1,
  tuitionInState: 20000,
  tuitionOutOfState: 40000,
  roomAndBoard: 10000,
  acceptanceRate: 0.1,
  enrollment: 5000,
  graduationRate: 0.9,
  medianEarnings6yr: 80000,
  medianDebt: 10000,
  website: "https://alpha.edu",
  usnewsUrl: null,
  nicheUrl: null,
  nicheGrades: {
    overall: "A+",
    academics: "A+",
    value: "A+",
    diversity: "A+",
    campus: "A",
    athletics: "A+",
    partyScene: "B",
    professors: "A+",
    location: "A+",
    dorms: "A+",
    campusFood: "A+",
    studentLife: "A+",
    safety: "A+",
  },
};

const schools: School[] = [
  base,
  {
    ...base,
    slug: "beta",
    name: "Beta College",
    medianEarnings6yr: 60000,
    nicheGrades: { ...base.nicheGrades, campusFood: "B", safety: "B", academics: "A" },
  },
  {
    ...base,
    slug: "gamma",
    name: "Gamma Institute",
    medianEarnings6yr: 100000,
    tuitionInState: 50000,
    nicheGrades: { ...base.nicheGrades, campusFood: "C", safety: "A-", academics: "A-" },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("topN", () => {
  it("returns the N highest earners when desc=true", () => {
    const result = topN(schools, 2, (s) => s.medianEarnings6yr ?? 0, true);
    expect(result).toBe("Gamma Institute, Alpha University");
  });

  it("returns the N lowest earners when desc=false", () => {
    const result = topN(schools, 2, (s) => s.medianEarnings6yr ?? 0, false);
    expect(result).toBe("Beta College, Alpha University");
  });

  it("handles n larger than array length by returning all schools", () => {
    const result = topN(schools, 100, (s) => s.medianEarnings6yr ?? 0, true);
    expect(result.split(", ")).toHaveLength(schools.length);
  });

  it("does not mutate the input array", () => {
    const copy = [...schools];
    topN(schools, 2, (s) => s.medianEarnings6yr ?? 0, true);
    expect(schools.map((s) => s.slug)).toEqual(copy.map((s) => s.slug));
  });

  it("handles null earnings by scoring them as 0", () => {
    const noEarnings: School = {
      ...base,
      slug: "noearnings",
      name: "No Earnings",
      medianEarnings6yr: null,
    };
    const result = topN([...schools, noEarnings], 4, (s) => s.medianEarnings6yr ?? 0, true);
    // noEarnings has score 0 → sorts last in desc
    expect(result.split(", ").at(-1)).toBe("No Earnings");
  });

  it("ROI: best ROI (ascending payback) sorts lowest payback first", () => {
    // alpha: (20000+10000)*4 / 80000  = 1.5 yrs  ← best ROI
    // beta:  (20000+10000)*4 / 60000  = 2.0 yrs
    // gamma: (50000+10000)*4 / 100000 = 2.4 yrs  ← worst ROI
    const payback = (s: School) => {
      const e = s.medianEarnings6yr;
      if (!e || e <= 0) return Infinity;
      return ((s.tuitionInState + s.roomAndBoard) * 4) / e;
    };
    const bestROI = topN(schools, 3, payback, false); // desc=false = ascending = best first
    expect(bestROI.split(", ")[0]).toBe("Alpha University");
    expect(bestROI.split(", ")[2]).toBe("Gamma Institute");
  });

  it("ROI: worst ROI (descending payback) sorts highest payback first", () => {
    const payback = (s: School) => {
      const e = s.medianEarnings6yr;
      if (!e || e <= 0) return -Infinity; // no-earnings → last in desc
      return ((s.tuitionInState + s.roomAndBoard) * 4) / e;
    };
    const worstROI = topN(schools, 3, payback, true); // desc=true = highest payback first
    expect(worstROI.split(", ")[0]).toBe("Gamma Institute");
    expect(worstROI.split(", ")[2]).toBe("Alpha University");
  });
});

describe("detectGradeKey", () => {
  it("detects food-related queries", () => {
    expect(detectGradeKey("best food on campus")).toMatchObject({ key: "campusFood" });
    expect(detectGradeKey("worst dining options")).toMatchObject({ key: "campusFood" });
    expect(detectGradeKey("school with best cafeteria")).toMatchObject({ key: "campusFood" });
  });

  it("detects safety-related queries", () => {
    expect(detectGradeKey("schools with best safety rating")).toMatchObject({ key: "safety" });
    expect(detectGradeKey("most dangerous campus")).toMatchObject({ key: "safety" });
    expect(detectGradeKey("lowest crime rate")).toMatchObject({ key: "safety" });
    expect(detectGradeKey("which school is safe")).toMatchObject({ key: "safety" });
    expect(detectGradeKey("safest schools")).toMatchObject({ key: "safety" });
  });

  it("detects dorm-related queries", () => {
    expect(detectGradeKey("best dorms")).toMatchObject({ key: "dorms" });
    expect(detectGradeKey("worst housing options")).toMatchObject({ key: "dorms" });
  });

  it("detects party scene queries", () => {
    expect(detectGradeKey("best party schools")).toMatchObject({ key: "partyScene" });
    expect(detectGradeKey("best nightlife")).toMatchObject({ key: "partyScene" });
  });

  it("detects professor queries", () => {
    expect(detectGradeKey("best professor ratings")).toMatchObject({ key: "professors" });
    expect(detectGradeKey("best professors")).toMatchObject({ key: "professors" });
    expect(detectGradeKey("schools with great faculty")).toMatchObject({ key: "professors" });
  });

  it("detects academics queries", () => {
    expect(detectGradeKey("best academics")).toMatchObject({ key: "academics" });
    expect(detectGradeKey("top academic programs")).toMatchObject({ key: "academics" });
  });

  it("returns null for unrelated queries", () => {
    expect(detectGradeKey("what is the tuition")).toBeNull();
    expect(detectGradeKey("cheapest schools")).toBeNull();
    expect(detectGradeKey("schools in california")).toBeNull();
  });
});

describe("grade scoring for topN", () => {
  it("A+ schools sort before A schools in desc order", () => {
    const result = topN(schools, 3, (s) => gradeToNumeric(s.nicheGrades.campusFood), true);
    const ranked = result.split(", ");
    // alpha: A+ (13), beta: B (9), gamma: C (6)
    expect(ranked[0]).toBe("Alpha University");
    expect(ranked[2]).toBe("Gamma Institute");
  });

  it("C schools sort before A+ schools in asc order (worst first)", () => {
    const result = topN(schools, 3, (s) => gradeToNumeric(s.nicheGrades.campusFood), false);
    const ranked = result.split(", ");
    expect(ranked[0]).toBe("Gamma Institute");
    expect(ranked[2]).toBe("Alpha University");
  });
});
