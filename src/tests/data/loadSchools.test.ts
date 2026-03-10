import { describe, it, expect } from "vitest";
import { loadSchools, filterSchools } from "@/lib/data/loadSchools";

describe("loadSchools", () => {
  it("should load and validate all school data", () => {
    const schools = loadSchools();
    expect(schools.length).toBeGreaterThanOrEqual(25);
    expect(schools[0]).toHaveProperty("name");
    expect(schools[0]).toHaveProperty("nicheGrades");
    expect(schools[0].nicheGrades).toHaveProperty("campusFood");
  });
});

describe("filterSchools", () => {
  it("should filter by state", () => {
    const schools = loadSchools();
    const ca = filterSchools(schools, { state: "CA" });
    expect(ca.length).toBeGreaterThan(0);
    expect(ca.every((s) => s.state === "CA")).toBe(true);
  });

  it("should sort by ranking ascending", () => {
    const schools = loadSchools();
    const sorted = filterSchools(schools, { sortBy: "ranking", sortDir: "asc" });
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].ranking).toBeGreaterThanOrEqual(sorted[i - 1].ranking);
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
