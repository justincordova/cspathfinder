import { describe, it, expect } from "vitest";
import { SchoolSchema, NicheGrade } from "@/lib/data/schema";

const validSchool = {
  name: "Massachusetts Institute of Technology",
  slug: "mit",
  state: "MA",
  city: "Cambridge",
  region: "Northeast",
  csRanking: 1,
  nicheRanking: 1,
  tuitionInState: 57986,
  tuitionOutOfState: 57986,
  roomAndBoard: 18590,
  acceptanceRate: 0.04,
  enrollment: 11520,
  graduationRate: 0.94,
  medianEarnings6yr: 104700,
  medianDebt: 12000,
  website: "https://www.mit.edu",
  usnewsUrl: "https://www.usnews.com/best-colleges/mit-2178",
  nicheGrades: {
    overall: "A+",
    academics: "A+",
    value: "A+",
    diversity: "A",
    campus: "A",
    athletics: "B+",
    partyScene: "B",
    professors: "A+",
    location: "A+",
    dorms: "B+",
    campusFood: "B",
    studentLife: "A",
    safety: "A+",
  },
  nicheUrl: "https://www.niche.com/colleges/massachusetts-institute-of-technology/",
};

describe("School Schema", () => {
  it("should validate a complete school entry", () => {
    const result = SchoolSchema.safeParse(validSchool);
    expect(result.success).toBe(true);
  });

  it("should reject school with missing required fields", () => {
    const result = SchoolSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("should reject out-of-range acceptance rate", () => {
    const result = SchoolSchema.safeParse({ ...validSchool, acceptanceRate: 1.5 });
    expect(result.success).toBe(false);
  });

  it("should reject negative acceptance rate", () => {
    const result = SchoolSchema.safeParse({ ...validSchool, acceptanceRate: -0.1 });
    expect(result.success).toBe(false);
  });

  it("should reject invalid state code (too long)", () => {
    const result = SchoolSchema.safeParse({ ...validSchool, state: "CAL" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid region", () => {
    const result = SchoolSchema.safeParse({ ...validSchool, region: "InvalidRegion" });
    expect(result.success).toBe(false);
  });

  it("should reject negative tuition", () => {
    const result = SchoolSchema.safeParse({ ...validSchool, tuitionInState: -1 });
    expect(result.success).toBe(false);
  });

  it("should accept valid Niche grade values", () => {
    const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
    validGrades.forEach((g) => {
      expect(NicheGrade.safeParse(g).success).toBe(true);
    });
  });

  it("should reject invalid Niche grade", () => {
    expect(NicheGrade.safeParse("Z+").success).toBe(false);
    expect(NicheGrade.safeParse("").success).toBe(false);
    expect(NicheGrade.safeParse("AA").success).toBe(false);
  });

  it("should reject school with invalid Niche grade in nicheGrades", () => {
    const result = SchoolSchema.safeParse({
      ...validSchool,
      nicheGrades: { ...validSchool.nicheGrades, overall: "Z+" },
    });
    expect(result.success).toBe(false);
  });
});
