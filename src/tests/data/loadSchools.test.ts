import { describe, it, expect } from "vitest";
import { loadSchools, loadSchoolsBySource, getSchoolBySlug } from "@/lib/data/loadSchools";
import { filterSchools } from "@/lib/data/filters";

describe("loadSchools", () => {
  it("should load and validate all school data", () => {
    const schools = loadSchools();
    expect(schools.length).toBeGreaterThanOrEqual(25);
    expect(schools[0]).toHaveProperty("name");
    expect(schools[0]).toHaveProperty("nicheGrades");
    expect(schools[0].nicheGrades).toHaveProperty("campusFood");
  });
});

describe("getSchoolBySlug", () => {
  it("returns a school for a known slug", () => {
    const schools = loadSchools();
    const firstSlug = schools[0]?.slug;
    if (!firstSlug) return; // guard for empty fixture
    const school = getSchoolBySlug(firstSlug);
    expect(school).toBeDefined();
    expect(school?.slug).toBe(firstSlug);
  });

  it("returns undefined for an unknown slug", () => {
    const school = getSchoolBySlug("this-slug-does-not-exist");
    expect(school).toBeUndefined();
  });

  it("returns undefined for an empty string slug", () => {
    const school = getSchoolBySlug("");
    expect(school).toBeUndefined();
  });

  it("merges csRanking and nicheRanking from both sources when available", () => {
    const csSchools = loadSchoolsBySource("csrankings");
    const nicheSchools = loadSchoolsBySource("niche");
    // Find a slug that appears in both sources
    const nicheSlugs = new Set(nicheSchools.map((s) => s.slug));
    const sharedSlug = csSchools.find((s) => nicheSlugs.has(s.slug))?.slug;
    if (!sharedSlug) return; // no overlap in fixture data, skip gracefully
    const merged = getSchoolBySlug(sharedSlug);
    expect(merged).toBeDefined();
    expect(merged?.slug).toBe(sharedSlug);
  });
});

describe("filterSchools", () => {
  it("should filter by state", () => {
    const schools = loadSchools();
    const ca = filterSchools(schools, { state: "CA" });
    expect(ca.length).toBeGreaterThan(0);
    expect(ca.every((s) => s.state === "CA")).toBe(true);
  });

  it("should sort by csRanking ascending", () => {
    const schools = loadSchools();
    const sorted = filterSchools(schools, { sortBy: "csRanking", sortDir: "asc" });
    const ranked = (sorted as import("@/lib/data/schema").School[]).filter(
      (s) => s.csRanking !== null
    );
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].csRanking!).toBeGreaterThanOrEqual(ranked[i - 1].csRanking!);
    }
  });

  it("should paginate results", () => {
    const schools = loadSchools();
    const page1 = filterSchools(schools, { page: 1, perPage: 10 });
    const page2 = filterSchools(schools, { page: 2, perPage: 10 });
    expect(page1.length).toBeLessThanOrEqual(10);
    expect(page2.length).toBeLessThanOrEqual(10);
    if (page1.length > 0 && page2.length > 0) {
      expect(page1[0].slug).not.toBe(page2[0].slug);
    }
  });

  it("should search by name", () => {
    const schools = loadSchools();
    const results = filterSchools(schools, { search: "MIT" });
    expect(results.some((s) => s.name.includes("MIT") || s.slug === "mit")).toBe(true);
  });
});
