import fs from "fs";
import path from "path";
import { SchoolSchema, type School } from "@/lib/data/schema";

let cached: School[] | null = null;

export function loadSchools(): School[] {
  if (cached) return cached;
  const jsonPath = path.join(process.cwd(), "data", "schools.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  cached = data.map((item: unknown) => {
    const record = item as Record<string, unknown>;
    // Migrate: if nicheRanking is absent, default to null
    if (!("nicheRanking" in record)) {
      record.nicheRanking = null;
    }
    return SchoolSchema.parse(record);
  });
  return cached!;
}

export function getSchoolBySlug(slug: string): School | undefined {
  return loadSchools().find((s) => s.slug === slug);
}

export * from "./filters";
