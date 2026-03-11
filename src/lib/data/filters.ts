import { type School } from "@/lib/data/schema";
import { SCHOOL_ALIASES } from "./aliases";

export type SortField =
  | "csRanking"
  | "nicheRanking"
  | "tuitionInState"
  | "tuitionOutOfState"
  | "acceptanceRate"
  | "graduationRate"
  | "medianDebt"
  | "enrollment"
  | "roi"
  | "earnings";

export interface FilterOptions {
  state?: string;
  region?: string;
  search?: string;
  sortBy?: SortField;
  sortDir?: "asc" | "desc";
  page?: number;
  perPage?: number;
  paginate?: boolean;
  rankField?: "csRanking" | "nicheRanking";
}

export interface FilterResult {
  schools: School[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Returns the payback period in years (4-year in-state cost ÷ median earnings 6yr after enrollment).
 * Returns null if data is missing or invalid.
 */
export function calculatePaybackYears(school: School): number | null {
  if (!school.medianEarnings6yr || school.medianEarnings6yr <= 0) return null;
  const totalCost = (school.tuitionInState + school.roomAndBoard) * 4;
  if (!isFinite(totalCost) || totalCost <= 0) return null;
  return totalCost / school.medianEarnings6yr;
}

// Returns payback period negated so asc sort = best ROI first.
function calculateROI(school: School): number {
  const years = calculatePaybackYears(school);
  return years === null ? Infinity : -years;
}

function getSortValue(school: School, field: SortField): number {
  if (field === "roi") return calculateROI(school);
  if (field === "csRanking") return school.csRanking ?? 999;
  if (field === "nicheRanking") return school.nicheRanking ?? 999;
  if (field === "earnings") return school.medianEarnings6yr ?? 0;
  if (field === "tuitionInState") return school.tuitionInState;
  if (field === "tuitionOutOfState") return school.tuitionOutOfState;
  if (field === "acceptanceRate") return school.acceptanceRate;
  if (field === "graduationRate") return school.graduationRate;
  if (field === "medianDebt") return school.medianDebt ?? 0;
  if (field === "enrollment") return school.enrollment;
  return 0;
}

export function filterSchools(
  schools: School[],
  opts: FilterOptions & { paginate: true }
): FilterResult;
export function filterSchools(schools: School[], opts: FilterOptions): School[];
export function filterSchools(schools: School[], opts: FilterOptions): School[] | FilterResult {
  if (!Array.isArray(schools)) {
    throw new Error("schools must be an array");
  }

  let result = [...schools];

  if (opts.state) {
    const states = opts.state.split(",").map((s) => s.trim().toUpperCase());
    result = result.filter((s) => s.state && states.includes(s.state.toUpperCase()));
  }

  if (opts.region) {
    result = result.filter(
      (s) => s.region && s.region.toLowerCase() === opts.region!.toLowerCase()
    );
  }

  if (opts.search) {
    const q = opts.search.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.state && s.state.toLowerCase().includes(q)) ||
        s.slug.toLowerCase().includes(q) ||
        SCHOOL_ALIASES[s.slug]?.some((alias) => alias.includes(q))
    );
  }

  if (opts.sortBy) {
    const dir = opts.sortDir === "desc" ? -1 : 1;
    const rf = opts.rankField ?? "nicheRanking";

    result.sort((a, b) => {
      const av = getSortValue(a, opts.sortBy!);
      const bv = getSortValue(b, opts.sortBy!);
      if (av !== bv) return Math.sign((av - bv) * dir);
      const ar = a[rf],
        br = b[rf];
      if (ar !== br) {
        if (ar === null) return 1;
        if (br === null) return -1;
        return ar - br;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }

  const totalCount = result.length;
  const MAX_PER_PAGE = 100;
  const MAX_PAGE = 1000;
  const perPage = Math.max(1, Math.min(opts.perPage ?? 10, MAX_PER_PAGE));
  const page = Math.max(1, Math.min(opts.page ?? 1, MAX_PAGE));
  const totalPages = Math.ceil(totalCount / perPage);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const paginated = result.slice((safePage - 1) * perPage, safePage * perPage);

  if (opts.paginate) {
    return { schools: paginated, totalCount, totalPages, currentPage: safePage };
  }

  if (opts.page || opts.perPage) {
    return paginated;
  }

  return result;
}
