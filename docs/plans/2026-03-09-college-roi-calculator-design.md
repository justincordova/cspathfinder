# College ROI Calculator for CS Schools — Design Document

## Purpose

Help high school students compare the financial return on investment (ROI) of Computer Science programs across different colleges.

---

## User Flow (Web App)

### Step 1: Filter Schools

Two filter options:

- **Top 100 CS Schools** (national ranking from US News)
- **CS Schools in [State]** (user inputs state(s), e.g., "NJ, NY, PA")

### Step 2: Select School

- Display schools with: name, ranking, in-state tuition, out-of-state tuition
- User clicks a school to select it

### Step 3: Select Major

- Dropdown shows CS-related majors available at that school
- Examples: "Computer Science", "Computer Engineering", "Data Science", "Software Engineering"

### Step 4: Options

- In-state vs Out-of-state tuition
- Commute: Yes/No (affects housing costs - subtracts $12,000/year if commuting)

### Step 5: ROI Results

- Net 4-year cost (tuition + housing/fees - commuting savings)
- Estimated monthly loan payment (10-year loan at 6% interest)
- Starting CS salary
- Salary-to-debt ratio
- "Years to break even" (when cumulative earnings > total cost)
- Link to US News school page (for detailed article)

---

## Data Sources

| Source                    | What It Provides                                                                                  | How to Get                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **US News Scraper**       | School name, ranking, tuition (in/out), acceptance rate, enrollment, location, detailed summaries | Run scraper from https://github.com/kaijchang/USNews-College-Scraper, save `data/usnews-schools.csv` |
| **College Scorecard API** | Earnings by CS major, completion rates by institution                                             | Query for program-level CS earnings (`CIPCODE=11.01`), save `data/cs-earnings.json`                  |
| **BLS Education Pays**    | National CS salary ranges, unemployment rates                                                     | Manual table extraction (already have from previous project), save `data/bls-salaries.json`          |

---

## Architecture

```
college-roi-calculator/
├── data/
│   ├── usnews-schools.csv      # From scraper
│   ├── cs-earnings.json        # College Scorecard
│   └── bls-salaries.json       # BLS data
├── src/
│   ├── app/                    # Next.js web app
│   │   ├── page.tsx            # Main page with 5-step flow
│   │   └── layout.tsx
│   ├── cli/                    # CLI entry point
│   │   └── index.ts            # CLI commands
│   ├── lib/
│   │   ├── data/
│   │   │   ├── loadSchools.ts  # Load and filter US News data
│   │   │   ├── loadEarnings.ts # Load CS earnings data
│   │   │   └── schema.ts        # Zod schemas
│   │   ├── roi/
│   │   │   ├── calculate.ts    # ROI calculation logic (shared)
│   │   │   └── types.ts        # ROI result types
│   │   └── types.ts            # Core TypeScript types
│   └── components/             # UI components
│       ├── SchoolFilter.tsx    # Step 1: Filter schools
│       ├── SchoolList.tsx      # Step 2: Select school
│       ├── MajorSelect.tsx     # Step 3: Select major
│       ├── OptionsForm.tsx     # Step 4: In-state/out-state, commute
│       └── ROIDisplay.tsx      # Step 5: Results
├── cli.ts                      # CLI entry point (bun cli.ts)
└── package.json
```

**Key Design Decision:** ROI calculation logic in `src/lib/roi/calculate.ts` is shared between web app and CLI. No duplication.

---

## CLI Functionality

```bash
# Calculate ROI for specific school + major
bun cli.ts --school "New Jersey Institute of Technology" --major "Computer Science" --out-of-state --no-commute
```

**Output:**

```
=== ROI Calculator: NJIT - Computer Science ===

4-Year Net Cost: $184,000 (out-of-state, with housing)
Estimated Monthly Loan Payment: $1,954 (10-year loan at 6%)
Starting CS Salary: $85,000
Salary-to-Debt Ratio: 4.6x
Years to Break Even: ~2.2 years

Learn more: https://www.usnews.com/best-colleges/njit-2621
```

**Flags:**

- `--school <name>`: Required. School name (fuzzy match)
- `--major <name>`: Required. Major name
- `--in-state`: Use in-state tuition (default: out-of-state)
- `--commute`: Commute (no housing costs, default: with housing)
- `--years <n>`: Loan term in years (default: 10)
- `--interest <rate>`: Loan interest rate as percentage (default: 6)

---

## ROI Calculation Logic

### Inputs

- School tuition (in-state or out-of-state) × 4 years
- Housing cost: $12,000/year if not commuting
- Fees: Estimate $2,000/year (from US News data)
- Financial aid: Estimate based on US News "percent receiving aid" × average aid amount
- Starting CS salary: From College Scorecard per-school earnings or national average if missing
- Loan interest rate: 6% (fixed assumption)
- Loan term: 10 years (default, configurable)

### Outputs

- **Net 4-Year Cost:** Tuition + housing + fees - financial aid - commuting savings
- **Monthly Loan Payment:** Standard amortization formula
- **Salary-to-Debt Ratio:** Annual salary / total debt
- **Years to Break Even:** Net cost / (annual salary - living expenses estimate)

### Simplifications

- Financial aid is estimated (user can't input exact amounts)
- Tax brackets not considered (salary is gross)
- Housing cost is fixed estimate ($12,000/year)
- Fees are estimated ($2,000/year)
- Salary data is school average, not specific to individual outcomes

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Runtime:** Bun
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Data Validation:** Zod
- **CLI:** Bun's native CLI capabilities
- **Testing:** Vitest

---

## Implementation Phases

### Phase 1: Setup & Data Collection

- Clean repo, copy from `nextjs-bun-starter`
- Run US News scraper to get school data
- Fetch CS earnings from College Scorecard API
- Set up data schemas in Zod
- Write data loading tests

### Phase 2: ROI Calculation Logic

- Implement `calculateROI()` function (shared)
- Add unit tests for calculation
- Implement CLI entry point
- Test CLI with known values

### Phase 3: Web App - Step 1 & 2

- School filter component (top 100 / by state)
- School list component with selection
- Wire up data loading

### Phase 4: Web App - Step 3 & 4

- Major selection dropdown (filtered by school)
- Options form (in-state/out-state, commute)
- Pass user selections to ROI calculation

### Phase 5: Web App - Step 5

- ROI results display component
- Visual breakdown of costs
- Break-even timeline
- Link to US News article

### Phase 6: Polish & Deploy

- Error handling (missing data)
- Accessibility
- Deploy to Vercel
- Test CLI and web app end-to-end

---

## Data Dictionary

### US News School Data (`usnews-schools.csv`)

| Column                                    | Type   | Description              |
| ----------------------------------------- | ------ | ------------------------ |
| `institution.displayName`                 | string | School name              |
| `institution.state`                       | string | State abbreviation       |
| `institution.city`                        | string | City                     |
| `ranking.displayRank`                     | number | US News ranking          |
| `searchData.tuition.rawValue`             | number | Tuition amount           |
| `searchData.costAfterAid.rawValue`        | number | Cost after financial aid |
| `searchData.acceptanceRate.rawValue`      | number | Acceptance rate (0-1)    |
| `searchData.percentReceivingAid.rawValue` | number | % receiving aid (0-1)    |
| `searchData.enrollment.rawValue`          | number | Total enrollment         |
| `School Website`                          | string | School website URL       |

### CS Earnings Data (`cs-earnings.json`)

| Field                  | Type   | Description                         |
| ---------------------- | ------ | ----------------------------------- |
| `school.name`          | string | School name (for matching)          |
| `earnings.median_10yr` | number | Median earnings 10 years post-entry |
| `earnings.starting`    | number | Estimated starting salary           |

### BLS Salary Data (`bls-salaries.json`)

| Field               | Type   | Description             |
| ------------------- | ------ | ----------------------- |
| `degree`            | string | Degree type             |
| `weekly_earnings`   | number | Median weekly earnings  |
| `unemployment_rate` | number | Unemployment rate (0-1) |

---

## Constraints & Limitations

- **Financial aid:** Estimates only, not user-input
- **Tax brackets:** Not considered
- **Scholarships:** Not included
- **Living expenses:** Fixed estimates
- **Data coverage:** Limited to schools in US News scraper (top-ranked schools)
- **Major availability:** Assume all schools offer "Computer Science", expand later

---

## Success Criteria

- User can filter and select a CS school in < 2 minutes
- ROI calculation produces consistent results between CLI and web app
- All data sources are properly validated with Zod
- CLI runs in < 5 seconds
- Web app loads in < 3 seconds
- Deployment successful on Vercel
