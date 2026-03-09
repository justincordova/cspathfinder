# College ROI Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app and CLI tool that helps high school students compare the financial return on investment of Computer Science programs across different colleges.

**Architecture:** Shared ROI calculation logic in `src/lib/roi/` used by both Next.js web app and Bun CLI. Data loaded at build time from CSV/JSON sources (US News scraper, College Scorecard, BLS). Swiss International design with 5-step user flow.

**Tech Stack:** Next.js 15 (App Router), Bun, TypeScript, Tailwind CSS v4, Zod, Vitest, Recharts

---

## Task 0: Setup and Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Add required dependencies**

Add these to `dependencies` in `package.json`:

```json
{
  "csv-parse": "^5.5.6",
  "recharts": "^2.13.3"
}
```

**Step 2: Install dependencies**

Run: `bun install`
Expected: All dependencies installed successfully

**Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "feat: add csv-parse and recharts dependencies"
```

---

## Task 1: Create Project Structure

**Files:**

- Create: `data/` (directory)
- Create: `data/README.md`
- Create: `src/lib/roi/` (directory)
- Create: `src/lib/data/` (directory)
- Create: `src/cli/` (directory)

**Step 1: Create data directory and README**

Create `data/README.md`:

```markdown
# Data Directory

Contains raw and processed data for the College ROI Calculator.

## Files

- `usnews-schools.csv`: School data from US News scraper
- `cs-earnings.json`: CS earnings data from College Scorecard API
- `bls-salaries.json`: BLS salary data by degree level

## How to Update

See individual files for data sources and update instructions.
```

**Step 2: Commit**

```bash
git add data/ data/README.md src/lib/roi/ src/lib/data/ src/cli/
git commit -m "feat: create project structure for ROI calculator"
```

---

## Task 2: Define Data Schemas with Zod

**Files:**

- Create: `src/lib/data/schema.ts`

**Step 1: Write the failing test**

Create `src/tests/data/schema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SchoolSchema } from "@/lib/data/schema";

describe("School Schema", () => {
  it("should validate valid school data", () => {
    const result = SchoolSchema.safeParse({
      name: "New Jersey Institute of Technology",
      state: "NJ",
      city: "Newark",
      ranking: 115,
      tuitionInState: 18000,
      tuitionOutOfState: 33000,
      acceptanceRate: 0.66,
      percentReceivingAid: 0.76,
      enrollment: 11520,
      website: "https://www.njit.edu",
    });

    expect(result.success).toBe(true);
  });

  it("should reject invalid school data (missing required fields)", () => {
    const result = SchoolSchema.safeParse({
      name: "Test University",
    });

    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/tests/data/schema.test.ts`
Expected: FAIL with "Cannot find module '@/lib/data/schema'"

**Step 3: Write minimal implementation**

Create `src/lib/data/schema.ts`:

```typescript
import { z } from "zod";

export const SchoolSchema = z.object({
  name: z.string(),
  state: z.string(),
  city: z.string(),
  ranking: z.number(),
  tuitionInState: z.number(),
  tuitionOutOfState: z.number(),
  acceptanceRate: z.number(),
  percentReceivingAid: z.number(),
  enrollment: z.number(),
  website: z.string().url(),
});

export type School = z.infer<typeof SchoolSchema>;

export const EarningsSchema = z.object({
  schoolName: z.string(),
  medianEarnings10yr: z.number(),
  startingSalary: z.number(),
});

export type Earnings = z.infer<typeof EarningsSchema>;

export const BLSSalarySchema = z.object({
  degree: z.string(),
  weeklyEarnings: z.number(),
  unemploymentRate: z.number(),
});

export type BLSSalary = z.infer<typeof BLSSalarySchema>;
```

**Step 4: Run test to verify it passes**

Run: `bun run test src/tests/data/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/data/schema.ts src/tests/data/schema.test.ts
git commit -m "feat: add Zod schemas for school and earnings data"
```

---

## Task 3: Load US News School Data from CSV

**Files:**

- Create: `src/lib/data/loadSchools.ts`
- Create: `data/usnews-schools.csv` (placeholder)

**Step 1: Write the failing test**

Create `src/tests/data/loadSchools.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { loadSchools } from "@/lib/data/loadSchools";

describe("loadSchools", () => {
  it("should load and parse school data from CSV", () => {
    const schools = loadSchools();

    expect(Array.isArray(schools)).toBe(true);
    expect(schools.length).toBeGreaterThan(0);

    const firstSchool = schools[0];
    expect(firstSchool).toHaveProperty("name");
    expect(firstSchool).toHaveProperty("state");
    expect(firstSchool).toHaveProperty("tuitionInState");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/tests/data/loadSchools.test.ts`
Expected: FAIL with "Cannot find module '@/lib/data/loadSchools'"

**Step 3: Write minimal implementation**

Create `src/lib/data/loadSchools.ts`:

```typescript
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { SchoolSchema, type School } from "./schema";

export function loadSchools(): School[] {
  const csvPath = path.join(process.cwd(), "data", "usnews-schools.csv");
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Map US News CSV fields to our schema
  const schools = records.map((record: any) => ({
    name: record["institution.displayName"],
    state: record["institution.state"],
    city: record["institution.city"],
    ranking: parseInt(record["ranking.displayRank"]) || 999,
    tuitionInState: parseFloat(record["searchData.tuition.rawValue"]) || 0,
    tuitionOutOfState: parseFloat(record["searchData.tuition.rawValue"]) || 0,
    acceptanceRate: parseFloat(record["searchData.acceptanceRate.rawValue"]) || 0,
    percentReceivingAid: parseFloat(record["searchData.percentReceivingAid.rawValue"]) || 0,
    enrollment: parseInt(record["searchData.enrollment.rawValue"]) || 0,
    website: record["School Website"] || "https://example.com",
  }));

  return schools.map((school) => SchoolSchema.parse(school));
}

export function filterSchoolsByState(schools: School[], state: string): School[] {
  return schools.filter((school) => school.state.toLowerCase() === state.toLowerCase());
}

export function getTopSchools(schools: School[], count: number = 100): School[] {
  return schools.sort((a, b) => a.ranking - b.ranking).slice(0, count);
}
```

**Step 4: Create placeholder CSV file**

Create `data/usnews-schools.csv`:

```csv
institution.displayName,institution.state,institution.city,ranking.displayRank,searchData.tuition.rawValue,searchData.acceptanceRate.rawValue,searchData.percentReceivingAid.rawValue,searchData.enrollment.rawValue,School Website
New Jersey Institute of Technology,NJ,Newark,115,18000,0.66,0.76,11520,https://www.njit.edu
Rutgers University-New Brunswick,NJ,New Brunswick,40,15568,0.66,0.66,50000,https://www.rutgers.edu
```

**Step 5: Run test to verify it passes**

Run: `bun run test src/tests/data/loadSchools.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/data/loadSchools.ts src/tests/data/loadSchools.test.ts data/usnews-schools.csv
git commit -m "feat: implement school data loading from CSV"
```

---

## Task 4: Create Placeholder Earnings Data

**Files:**

- Create: `data/cs-earnings.json`
- Create: `data/bls-salaries.json`

**Step 1: Create CS earnings placeholder**

Create `data/cs-earnings.json`:

```json
[
  {
    "schoolName": "New Jersey Institute of Technology",
    "medianEarnings10yr": 85000,
    "startingSalary": 75000
  },
  {
    "schoolName": "Rutgers University-New Brunswick",
    "medianEarnings10yr": 95000,
    "startingSalary": 80000
  }
]
```

**Step 2: Create BLS salary placeholder**

Create `data/bls-salaries.json`:

```json
[
  {
    "degree": "Bachelor's degree",
    "weeklyEarnings": 1754,
    "unemploymentRate": 0.02
  },
  {
    "degree": "Master's degree",
    "weeklyEarnings": 2012,
    "unemploymentRate": 0.02
  }
]
```

**Step 3: Commit**

```bash
git add data/cs-earnings.json data/bls-salaries.json
git commit -m "feat: add placeholder earnings and salary data"
```

---

## Task 5: Load Earnings Data

**Files:**

- Create: `src/lib/data/loadEarnings.ts`

**Step 1: Write the failing test**

Create `src/tests/data/loadEarnings.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { loadEarnings } from "@/lib/data/loadEarnings";

describe("loadEarnings", () => {
  it("should load earnings data from JSON", () => {
    const earnings = loadEarnings();

    expect(Array.isArray(earnings)).toBe(true);
    expect(earnings.length).toBeGreaterThan(0);

    const first = earnings[0];
    expect(first).toHaveProperty("schoolName");
    expect(first).toHaveProperty("medianEarnings10yr");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/tests/data/loadEarnings.test.ts`
Expected: FAIL with "Cannot find module '@/lib/data/loadEarnings'"

**Step 3: Write minimal implementation**

Create `src/lib/data/loadEarnings.ts`:

```typescript
import fs from "fs";
import path from "path";
import { EarningsSchema, BLSSalarySchema, type Earnings, type BLSSalary } from "./schema";

export function loadEarnings(): Earnings[] {
  const jsonPath = path.join(process.cwd(), "data", "cs-earnings.json");
  const content = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(content);

  return data.map((item: any) => EarningsSchema.parse(item));
}

export function loadBLSSalaries(): BLSSalary[] {
  const jsonPath = path.join(process.cwd(), "data", "bls-salaries.json");
  const content = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(content);

  return data.map((item: any) => BLSSalarySchema.parse(item));
}

export function findEarningsForSchool(schoolName: string): Earnings | undefined {
  const earnings = loadEarnings();
  return earnings.find((e) => e.schoolName.toLowerCase().includes(schoolName.toLowerCase()));
}
```

**Step 4: Run test to verify it passes**

Run: `bun run test src/tests/data/loadEarnings.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/data/loadEarnings.ts src/tests/data/loadEarnings.test.ts
git commit -m "feat: implement earnings data loading"
```

---

## Task 6: Implement ROI Calculation Logic

**Files:**

- Create: `src/lib/roi/calculate.ts`
- Create: `src/lib/roi/types.ts`

**Step 1: Write the failing test**

Create `src/tests/roi/calculate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateROI } from "@/lib/roi/calculate";
import type { School } from "@/lib/data/schema";

describe("calculateROI", () => {
  it("should calculate ROI for a school", () => {
    const school: School = {
      name: "Test University",
      state: "NJ",
      city: "Test City",
      ranking: 50,
      tuitionInState: 20000,
      tuitionOutOfState: 40000,
      acceptanceRate: 0.5,
      percentReceivingAid: 0.6,
      enrollment: 10000,
      website: "https://test.edu",
    };

    const result = calculateROI(school, {
      major: "Computer Science",
      inState: true,
      commute: false,
      startingSalary: 80000,
      interestRate: 6,
      loanTerm: 10,
    });

    expect(result).toHaveProperty("net4YearCost");
    expect(result).toHaveProperty("monthlyLoanPayment");
    expect(result).toHaveProperty("salaryToDebtRatio");
    expect(result).toHaveProperty("yearsToBreakEven");
    expect(result.net4YearCost).toBeGreaterThan(0);
  });

  it("should reduce cost when commuting", () => {
    const school: School = {
      name: "Test University",
      state: "NJ",
      city: "Test City",
      ranking: 50,
      tuitionInState: 20000,
      tuitionOutOfState: 40000,
      acceptanceRate: 0.5,
      percentReceivingAid: 0.6,
      enrollment: 10000,
      website: "https://test.edu",
    };

    const resultWithCommuting = calculateROI(school, {
      major: "Computer Science",
      inState: true,
      commute: true,
      startingSalary: 80000,
      interestRate: 6,
      loanTerm: 10,
    });

    const resultWithoutCommuting = calculateROI(school, {
      major: "Computer Science",
      inState: true,
      commute: false,
      startingSalary: 80000,
      interestRate: 6,
      loanTerm: 10,
    });

    expect(resultWithCommuting.net4YearCost).toBeLessThan(resultWithoutCommuting.net4YearCost);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/tests/roi/calculate.test.ts`
Expected: FAIL with "Cannot find module '@/lib/roi/calculate'"

**Step 3: Write ROI types**

Create `src/lib/roi/types.ts`:

```typescript
export interface ROIOptions {
  major: string;
  inState: boolean;
  commute: boolean;
  startingSalary: number;
  interestRate: number;
  loanTerm: number;
}

export interface ROIResult {
  schoolName: string;
  major: string;
  tuitionPerYear: number;
  housingPerYear: number;
  feesPerYear: number;
  estimatedFinancialAid: number;
  net4YearCost: number;
  monthlyLoanPayment: number;
  totalLoanAmount: number;
  startingSalary: number;
  salaryToDebtRatio: number;
  yearsToBreakEven: number;
  inState: boolean;
  commute: boolean;
  interestRate: number;
  loanTerm: number;
}
```

**Step 4: Write minimal implementation**

Create `src/lib/roi/calculate.ts`:

```typescript
import type { School } from "../data/schema";
import type { ROIOptions, ROIResult } from "./types";

const HOUSING_COST_PER_YEAR = 12000;
const FEES_PER_YEAR = 2000;
const LIVING_EXPENSES_PER_YEAR = 20000;

export function calculateROI(school: School, options: ROIOptions): ROIResult {
  const { major, inState, commute, startingSalary, interestRate, loanTerm } = options;

  // Calculate tuition
  const tuitionPerYear = inState ? school.tuitionInState : school.tuitionOutOfState;

  // Calculate housing (skip if commuting)
  const housingPerYear = commute ? 0 : HOUSING_COST_PER_YEAR;

  // Calculate fees
  const feesPerYear = FEES_PER_YEAR;

  // Estimate financial aid (simplified)
  const estimatedFinancialAid =
    school.percentReceivingAid > 0
      ? school.tuitionInState * 0.3 // Assume 30% of tuition as average aid
      : 0;

  // Calculate net 4-year cost
  const annualCost = tuitionPerYear + housingPerYear + feesPerYear - estimatedFinancialAid;
  const net4YearCost = annualCost * 4;

  // Calculate monthly loan payment (amortization formula)
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const totalLoanAmount = net4YearCost; // Assume full amount financed
  const monthlyLoanPayment =
    totalLoanAmount > 0
      ? (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0;

  // Calculate salary-to-debt ratio
  const salaryToDebtRatio = totalLoanAmount > 0 ? startingSalary / totalLoanAmount : Infinity;

  // Calculate years to break even
  const annualNetEarnings = startingSalary - LIVING_EXPENSES_PER_YEAR;
  const yearsToBreakEven = annualNetEarnings > 0 ? totalLoanAmount / annualNetEarnings : Infinity;

  return {
    schoolName: school.name,
    major,
    tuitionPerYear,
    housingPerYear,
    feesPerYear,
    estimatedFinancialAid,
    net4YearCost,
    monthlyLoanPayment: Math.round(monthlyLoanPayment),
    totalLoanAmount: Math.round(totalLoanAmount),
    startingSalary,
    salaryToDebtRatio: Math.round(salaryToDebtRatio * 10) / 10,
    yearsToBreakEven: Math.round(yearsToBreakEven * 10) / 10,
    inState,
    commute,
    interestRate,
    loanTerm,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

**Step 5: Run test to verify it passes**

Run: `bun run test src/tests/roi/calculate.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/roi/calculate.ts src/lib/roi/types.ts src/tests/roi/calculate.test.ts
git commit -m "feat: implement ROI calculation logic"
```

---

## Task 7: Create CLI Entry Point

**Files:**

- Create: `cli.ts`

**Step 1: Write the CLI implementation**

Create `cli.ts`:

```typescript
#!/usr/bin/env bun
import { parseArgs } from "util";
import { loadSchools, findEarningsForSchool } from "./src/lib/data/loadSchools";
import { calculateROI, formatCurrency } from "./src/lib/roi/calculate";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    school: {
      type: "string",
      description: "School name (fuzzy match)",
    },
    major: {
      type: "string",
      default: "Computer Science",
      description: "Major name",
    },
    "in-state": {
      type: "boolean",
      default: false,
      description: "Use in-state tuition",
    },
    commute: {
      type: "boolean",
      default: false,
      description: "Commute (no housing costs)",
    },
    years: {
      type: "string",
      default: "10",
      description: "Loan term in years",
    },
    interest: {
      type: "string",
      default: "6",
      description: "Loan interest rate",
    },
    help: {
      type: "boolean",
      default: false,
      description: "Show help",
    },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
College ROI Calculator CLI

Usage:
  bun cli.ts --school "School Name" [options]

Options:
  --school <name>        School name (required)
  --major <name>         Major name (default: "Computer Science")
  --in-state             Use in-state tuition
  --commute              Commute (no housing costs)
  --years <n>            Loan term in years (default: 10)
  --interest <rate>      Loan interest rate (default: 6)
  --help                 Show this help message

Example:
  bun cli.ts --school "New Jersey Institute of Technology" --major "Computer Science" --out-of-state
  `);
  process.exit(0);
}

if (!values.school) {
  console.error("Error: --school is required");
  console.error("Use --help for usage information");
  process.exit(1);
}

// Find school (fuzzy match)
const schools = loadSchools();
const schoolName = values.school.toLowerCase();
const school = schools.find((s) => s.name.toLowerCase().includes(schoolName));

if (!school) {
  console.error(`Error: School not found: "${values.school}"`);
  console.error(`\nAvailable schools (${schools.length}):`);
  schools.slice(0, 10).forEach((s) => console.log(`  - ${s.name}`));
  if (schools.length > 10) {
    console.log("  ... and more");
  }
  process.exit(1);
}

// Find earnings data
const earnings = findEarningsForSchool(school.name);
const startingSalary = earnings?.startingSalary || 75000; // Default to $75k

// Calculate ROI
const result = calculateROI(school, {
  major: values.major!,
  inState: values["in-state"]!,
  commute: values.commute!,
  startingSalary,
  interestRate: parseFloat(values.interest!),
  loanTerm: parseInt(values.years!),
});

// Display results
console.log(`\n=== ROI Calculator: ${school.name} - ${result.major} ===\n`);
console.log(
  `4-Year Net Cost: ${formatCurrency(result.net4YearCost)} (${result.inState ? "in-state" : "out-of-state"}, ${result.commute ? "commuting" : "with housing"})`
);
console.log(
  `Estimated Monthly Loan Payment: ${formatCurrency(result.monthlyLoanPayment)} (${result.loanTerm}-year loan at ${result.interestRate}%)`
);
console.log(`Starting ${result.major} Salary: ${formatCurrency(result.startingSalary)}`);
console.log(`Salary-to-Debt Ratio: ${result.salaryToDebtRatio}x`);
console.log(`Years to Break Even: ~${result.yearsToBreakEven} years`);
console.log(`\nLearn more: ${school.website}\n`);
```

**Step 2: Make CLI executable**

Run: `chmod +x cli.ts`

**Step 3: Test CLI**

Run: `bun cli.ts --school "New Jersey Institute of Technology"`
Expected: Shows ROI results for NJIT

**Step 4: Commit**

```bash
git add cli.ts
git commit -m "feat: add CLI entry point for ROI calculations"
```

---

## Task 8: Create Main Page Component

**Files:**

- Create: `src/app/page.tsx`

**Step 1: Create main page component**

Create `src/app/page.tsx`:

```typescript
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-[960px] mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">College ROI Calculator</h1>
        <p className="text-xl mb-12">
          Compare the return on investment of Computer Science programs across different colleges.
        </p>

        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Filter Schools</h2>
              <p>Step 1 content coming soon...</p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Select School</h2>
              <p>Step 2 content coming soon...</p>
              <button
                onClick={() => setStep(3)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Select Major</h2>
              <p>Step 3 content coming soon...</p>
              <button
                onClick={() => setStep(4)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Options</h2>
              <p>Step 4 content coming soon...</p>
              <button
                onClick={() => setStep(5)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">ROI Results</h2>
              <p>Step 5 content coming soon...</p>
              <button
                onClick={() => setStep(1)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Test the page**

Run: `bun run dev`
Visit: http://localhost:3000
Expected: Shows 5-step wizard with navigation

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: create main page with 5-step wizard structure"
```

---

## Task 9: Create School Filter Component

**Files:**

- Create: `src/components/SchoolFilter.tsx`

**Step 1: Create school filter component**

Create `src/components/SchoolFilter.tsx`:

```typescript
'use client';

import { useState } from 'react';

interface SchoolFilterProps {
  onSelectFilter: (filter: 'top100' | 'state', value?: string) => void;
}

export default function SchoolFilter({ onSelectFilter }: SchoolFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState<'top100' | 'state'>('top100');
  const [stateInput, setStateInput] = useState('');

  const handleTop100Click = () => {
    setSelectedFilter('top100');
    onSelectFilter('top100');
  };

  const handleStateClick = () => {
    setSelectedFilter('state');
    if (stateInput.trim()) {
      onSelectFilter('state', stateInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Filter Schools</h2>
      <p className="text-gray-600">
        Choose how you want to filter Computer Science programs.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleTop100Click}
          className={`w-full p-6 text-left rounded-lg border-2 transition-colors ${
            selectedFilter === 'top100'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-lg mb-1">Top 100 CS Schools</div>
          <div className="text-gray-600 text-sm">
            National ranking of best Computer Science programs
          </div>
        </button>

        <div className={`p-6 rounded-lg border-2 ${selectedFilter === 'state' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <div className="font-semibold text-lg mb-2">CS Schools in Your State</div>
          <div className="text-gray-600 text-sm mb-4">
            Enter state abbreviations (e.g., NJ, NY, PA)
          </div>
          <input
            type="text"
            value={stateInput}
            onChange={(e) => setStateInput(e.target.value)}
            placeholder="Enter state(s)... (e.g., NJ, NY)"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleStateClick}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Integrate into main page**

Update `src/app/page.tsx` to use SchoolFilter component in step 1.

**Step 3: Commit**

```bash
git add src/components/SchoolFilter.tsx src/app/page.tsx
git commit -m "feat: add school filter component"
```

---

## Task 10: Update README

**Files:**

- Modify: `README.md`

**Step 1: Update README with project information**

Update `README.md`:

````markdown
# College ROI Calculator for CS Schools

Compare the return on investment of Computer Science programs across different colleges.

## Features

- **Web App:** Interactive 5-step wizard to compare CS programs
- **CLI:** Quick ROI calculations from command line
- **Data-Driven:** US News rankings, College Scorecard earnings, BLS salaries
- **Shared Logic:** ROI calculation used by both web app and CLI

## Quick Start

```bash
bun install
bun run dev  # Web app at http://localhost:3000
bun cli.ts --school "New Jersey Institute of Technology"  # CLI
```
````

## Usage

### Web App

1. Filter schools (top 100 or by state)
2. Select a school
3. Choose your major
4. Set options (in-state/out-of-state, commute)
5. View ROI results

### CLI

```bash
# Basic usage
bun cli.ts --school "New Jersey Institute of Technology"

# With options
bun cli.ts --school "New Jersey Institute of Technology" --major "Computer Science" --in-state --commute

# All options
bun cli.ts --school "School Name" --major "Major" --in-state --commute --years 10 --interest 6
```

## Tech Stack

- Next.js 15 (App Router)
- Bun runtime
- TypeScript
- Tailwind CSS v4
- Zod for validation
- Vitest for testing

## Data Sources

- [US News College Rankings](https://github.com/kaijchang/USNews-College-Scraper)
- College Scorecard API
- BLS Education Pays

## License

MIT

````

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with project information"
````

---

## Task 11: Run All Tests

**Step 1: Run all tests**

Run: `bun run test`
Expected: All tests pass

**Step 2: Verify CLI works**

Run: `bun cli.ts --school "New Jersey Institute of Technology" --help`
Expected: Shows help message

**Step 3: Verify web app works**

Run: `bun run dev`
Visit: http://localhost:3000
Expected: Shows ROI calculator wizard

**Step 4: Commit**

```bash
git commit --allow-empty -m "test: verify all tests and functionality"
```

---

## Task 12: Deploy to Vercel (Optional)

**Step 1: Build production version**

Run: `bun run build`
Expected: Builds successfully

**Step 2: Deploy (if Vercel CLI installed)**

Run: `vercel --prod`

**Step 3: Update README with deployment URL**

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add deployment URL"
```

---

## Next Steps (Future Enhancements)

1. Fetch real US News data using the scraper
2. Fetch real CS earnings from College Scorecard API
3. Add more majors beyond Computer Science
4. Implement school list component with search
5. Implement major selection component
6. Implement options form component
7. Implement ROI results display with charts
8. Add state-specific filtering for CLI
9. Add more detailed financial aid calculations
10. Add international student support

---

**Plan complete and saved to `docs/plans/2026-03-09-college-roi-calculator-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
