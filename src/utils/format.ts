import type { NicheGrades } from "@/lib/data/schema";

export function formatCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n) || n === 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n) || n < 0 || n > 1) return "—";
  return `${(n * 100).toFixed(0)}%`;
}

export const GRADE_LABELS: Record<keyof NicheGrades, string> = {
  overall: "Overall",
  academics: "Academics",
  value: "Value",
  diversity: "Diversity",
  campus: "Campus",
  athletics: "Athletics",
  partyScene: "Party Scene",
  professors: "Professors",
  location: "Location",
  dorms: "Dorms",
  campusFood: "Campus Food",
  studentLife: "Student Life",
  safety: "Safety",
};
