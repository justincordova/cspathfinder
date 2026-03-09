# Student Reality Lab: 2-Year Transfer vs. 4-Year Direct — Is the Transfer Path Worth It?

## Track: Custom (combines elements of Track C/D/E)

## Essential Question

**For a student choosing between 2 years at a community college + transfer and 4 years at a public university, which path produces lower total debt and higher earnings within 10 years of enrollment?**

## Claim (Hypothesis)

Starting at a community college and transferring to a 4-year public university saves the average student $10,000+ in total costs, but the earnings gap means it takes 5+ years of work to break even — and only if you actually complete the degree.

## Audience

Current high school seniors and first/second-year college students deciding whether to start at a community college or go directly to a 4-year institution.

---

## STAR Draft

- **S — Situation**: Tuition at 4-year public universities now averages $10,000+/year while community colleges average ~$4,000–5,400/year. Students face a binary decision with long-term financial consequences, often with incomplete information. Most advice is anecdotal — "just go to community college, it's cheaper" — but the full picture includes debt, earnings, credit loss, and completion risk.
- **T — Task**: The viewer should be able to compare total cost, debt, and earnings for both paths, adjust assumptions with interactive controls, and draw a personalized conclusion about which route makes financial sense for them.
- **A — Action**: Build 3–4 interactive views (cost calculator with slider, debt comparison with state filter, earnings gap with degree-level toggle, completion risk funnel) using federal data from College Scorecard, BLS, and IPEDS.
- **R — Result**: Data shows transfer students save ~$4,500 in debt but bachelor's holders earn ~$500/week more than associate's holders. The interactive breakeven calculator lets users see when (if ever) their savings offset the earnings gap. Only 16% of CC students transfer AND finish a bachelor's within 6 years — completion risk is the hidden variable.

---

## Data Sources

### Primary (Downloadable, Verifiable)

| Source                                                                                                                | What It Provides                                                                                                                                                                                                               | Format           | License       |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------- |
| [College Scorecard API](https://collegescorecard.ed.gov/data/api-documentation/) (Dept. of Education)                 | Institution-level tuition (`TUITIONFEE_IN`, `TUITIONFEE_OUT`), median debt (`GRAD_DEBT_MDN`), median earnings 10yr post-entry (`MD_EARN_WNE_P10`), completion rate (`C150_4`), state (`STABBR`), institution level (`ICLEVEL`) | JSON API / CSV   | Public domain |
| [BLS Education Pays](https://www.bls.gov/emp/tables/unemployment-earnings-education.htm) (Bureau of Labor Statistics) | Median weekly earnings by degree level (associate's vs bachelor's), unemployment rates, updated annually with historical data                                                                                                  | HTML table / PDF | Public domain |
| [IPEDS Outcome Measures](https://nces.ed.gov/ipeds/use-the-data) (NCES)                                               | Transfer-out rates, completion at 4/6/8 years by institution type, includes non-first-time (transfer) students                                                                                                                 | CSV              | Public domain |

### Secondary (Reference — cited, not raw data)

| Source                                                                                                                                            | What It Provides                                                        | Usage                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| [NCES Annual Earnings by Attainment](https://nces.ed.gov/programs/coe/indicator/cba/annual-earnings)                                              | Annual earnings by degree with demographic breakdowns (age/race/gender) | Segmentation context for View 3             |
| [Brookings Institution](https://www.brookings.edu/articles/community-college-students-dont-always-benefit-from-transferring-to-a-4-year-college/) | Transfer penalty research ($4,200/yr gap), credit loss stats            | Cited in annotations                        |
| [CCRC / Columbia](https://ccrc.tc.columbia.edu/publications/community-colleges-student-debt.html)                                                 | Transfer student debt analysis, completion outcomes                     | Cited in annotations                        |
| [NSC Tracking Transfer](https://nscresearchcenter.org/tracking-transfer/)                                                                         | 16% completion stat, state-level transfer outcomes                      | Headline stat for View 4, cited with source |

### Data Dictionary (Mapped to Real Scorecard Column Names)

| Column                  | Scorecard Field   | Meaning                                              | Units       |
| ----------------------- | ----------------- | ---------------------------------------------------- | ----------- |
| `institution_level`     | `ICLEVEL`         | 1 = 4-year, 2 = 2-year, 3 = less-than-2-year         | category    |
| `tuition_in_state`      | `TUITIONFEE_IN`   | Published in-state tuition and fees                  | USD/year    |
| `tuition_out_state`     | `TUITIONFEE_OUT`  | Published out-of-state tuition and fees              | USD/year    |
| `avg_cost_attendance`   | `COSTT4_A`        | Average cost of attendance (academic year)           | USD/year    |
| `median_debt`           | `GRAD_DEBT_MDN`   | Median debt at graduation for completers             | USD         |
| `median_earnings_10yr`  | `MD_EARN_WNE_P10` | Median earnings 10 years after entry                 | USD/year    |
| `completion_rate`       | `C150_4`          | 150% time completion rate (6yr for 4yr institutions) | ratio (0–1) |
| `state`                 | `STABBR`          | State abbreviation                                   | category    |
| `institution_name`      | `INSTNM`          | Institution name                                     | string      |
| `weekly_earnings_assoc` | BLS table         | Median weekly earnings, associate's degree holders   | USD/week    |
| `weekly_earnings_bach`  | BLS table         | Median weekly earnings, bachelor's degree holders    | USD/week    |

---

## Design System: Swiss International

All UI follows Swiss International (International Typographic Style) principles:

- **Typography**: Tight hierarchy. **Inter** (Google Fonts, variable weight, designed for screens). Bold 700 for headlines, Regular 400 for body, Medium 500 for labels. Line-height 1.5 body, 1.2 headings.
- **Grid**: Strict 12-column grid. All elements snap to grid. No decorative flourishes.
- **Color**: Minimal palette — black (`#0a0a0a`), white (`#fafafa`), blue (`#2563eb`) for 4-year path, orange (`#ea580c`) for transfer path. Gray (`#e5e7eb`) for gridlines. No other colors.
- **Charts**: Clean axes, no chartjunk. Labels directly on data where possible. Gridlines light gray, no borders on chart areas. No gradient fills.
- **Spacing**: Consistent 8px base unit (`--spacing: 8px`). Large whitespace between sections (64px+).
- **Layout**: Asymmetric but balanced. Left-aligned text. Charts occupy full content width. Max content width 960px.

---

## Tech Stack

Copied/adapted from `nextjs-bun-starter`:

| Layer           | Tool                    | Reason                                        |
| --------------- | ----------------------- | --------------------------------------------- |
| Framework       | Next.js 16 (App Router) | Server components for data loading            |
| Runtime         | Bun                     | Fast installs + dev server                    |
| Language        | TypeScript (strict)     | Type-safe data transforms                     |
| Styling         | Tailwind CSS v4         | Utility-first, Swiss grid via custom `@theme` |
| Charts          | Recharts                | React-native, composable, Tailwind-friendly   |
| Data validation | Zod                     | Schema contracts for datasets                 |
| Testing         | Vitest                  | Fast, ESM-native                              |
| Deployment      | Vercel                  | Free tier, instant deploys                    |
| Linting         | ESLint + Prettier       | From starter                                  |
| Git hooks       | Husky + lint-staged     | From starter                                  |

### What to copy from starter:

- `tsconfig.json` (path aliases)
- `next.config.ts` (security headers, standalone output)
- `postcss.config.mjs` (Tailwind v4)
- `prettier.config.mjs` + `eslint.config.mjs`
- `.husky/` setup
- `vitest.config.ts`
- `src/lib/env.ts` (Zod env validation)
- `src/utils/cn.ts` (clsx + tailwind-merge)
- `src/app/error.tsx`, `not-found.tsx`, `loading.tsx` (error boundaries)

### What to skip:

- Winston logger (overkill for static data story)
- Rate limiting (no public API)
- Docker setup (deploying to Vercel)
- API wrapper / HTTP logging middleware

---

## Views (3–4 Maximum)

### View 1: Cost Calculator (Interactive)

**Purpose**: Answer "How much does each path actually cost?"

- Side-by-side bar chart: 2yr CC + transfer vs 4yr direct total cost
- **Phase 3 Interaction**: Slider for years at CC (1 or 2) — reactively updates both bars and the savings annotation
- **Phase 4 Interaction**: Add toggle for in-state vs out-of-state
- **Annotation**: Callout showing the exact dollar savings at the user's selected configuration
- **Data source**: College Scorecard API — `TUITIONFEE_IN`, `TUITIONFEE_OUT`, `COSTT4_A` aggregated by `ICLEVEL`
- Story text: Context on hidden costs (housing, lost credits, extra semesters)

### View 2: Debt by State

**Purpose**: Answer "How much debt will I carry, and does it vary by where I live?"

- Grouped bar chart comparing median debt at 2-year vs 4-year institutions
- **Interaction**: Dropdown filter by state/region — shows how the debt gap varies geographically
- **Annotation**: National average callout ($10,300 for CC starters vs ~$20,000 for 4-year starters) + note on credit loss (avg 13 credits lost, 40% get zero credit)
- **Data source**: College Scorecard API — `GRAD_DEBT_MDN` grouped by `ICLEVEL` and `STABBR`
- Story text: The credit-loss trap and why geography matters

### View 3: Earnings Gap — Associate's vs Bachelor's

**Purpose**: Answer "How much more will I earn with a bachelor's vs stopping at an associate's?"

- Line chart showing median weekly earnings over time (historical BLS data, multiple years)
- **Interaction**: Toggle between degree levels (associate's, bachelor's, some college/no degree) to show the earnings premium
- **Annotation**: Current gap callout (bachelor's = ~$1,754/week vs associate's = ~$1,096/week in Q1 2025) + interactive breakeven calculator showing when debt savings offset the earnings gap based on user inputs
- **Data source**: BLS Education Pays table — median weekly earnings by educational attainment
- Story text: The "transfer penalty" framed honestly — aggregate data, not individual destiny. The breakeven calculator is a projection, not a prediction.

### View 4: Completion Funnel (Optional — if time permits)

**Purpose**: Answer "What are my odds of actually finishing?"

- Funnel/waterfall chart: Start at CC → Transfer → Complete bachelor's
- **Interaction**: Filter by state using IPEDS data to show geographic variation in transfer success
- **Annotation**: Only 16% of CC students transfer AND complete a bachelor's within 6 years (NSC, cited). Low-income: 11%. Black students: 9%.
- **Data source**: IPEDS Outcome Measures (downloadable) for transfer-out and completion rates; NSC cited for headline stats
- Story text: The hidden risk — not finishing costs more than any path

---

## Weekly Phases

### Phase 0 — Track Selection (Day 1) `[DONE — Custom Track]`

**Track**: 2-Year Transfer vs. 4-Year Direct comparison
**Approved**: Combines cost, debt, earnings, and completion data into one cohesive story

---

### Phase 1 — Story Pitch + Data Viability Audit (End of Week 1)

**Due**: End of Week 1

#### Tasks:

1. **Set up repository structure**
   - Initialize from nextjs-bun-starter (copy essential configs listed above)
   - Create `/data/raw/` directory
   - Create `/data/processed/` directory
   - Set up `bun install` with Recharts + project deps

2. **Fetch and audit raw data**
   - Query College Scorecard API: filter by `ICLEVEL=1` (4-year) and `ICLEVEL=2` (2-year), pull `TUITIONFEE_IN`, `TUITIONFEE_OUT`, `COSTT4_A`, `GRAD_DEBT_MDN`, `MD_EARN_WNE_P10`, `C150_4`, `STABBR`, `INSTNM`
   - Download IPEDS Outcome Measures data (transfer completion rates)
   - Extract BLS Education Pays table (median weekly earnings by degree level)
   - Document provenance: source URLs, retrieval date, license
   - Save to `/data/raw/`

3. **Write `/data/notes.md`**
   - Source links + retrieval dates
   - Known caveats:
     - Scorecard earnings are institution-level, not pathway-level (can't isolate transfer students)
     - BLS data is by degree type, not by college path
     - IPEDS OM tracks cohorts, not individuals
   - What the data cannot prove: individual outcomes, causation, whether CC _caused_ lower earnings vs selection bias

4. **Complete README.md** with all required headings:
   - Title, Essential Question, Claim, Audience
   - STAR Draft (bullets)
   - Dataset & Provenance table (3 primary + 4 secondary sources)
   - Data Dictionary (11 rows — mapped to real column names)
   - Data Viability Audit:
     - Missing values analysis (run after download)
     - Weird fields identification
     - Cleaning plan
     - Limitations/bias statement
   - Draft chart: Build a quick static Recharts bar chart comparing avg tuition (proves stack works + satisfies rubric)

#### Deliverables:

- [x] Repository with structure
- [ ] README.md with all required sections
- [ ] `/data/raw/` with fetched datasets
- [ ] `/data/notes.md`
- [ ] Draft chart (static Recharts component, screenshot in README)

---

### Phase 2 — Data Pipeline + Contract (End of Week 2)

**Due**: End of Week 2

#### Tasks:

1. **Build data loading module** — `src/lib/data/loadData.ts`
   - Parse Scorecard JSON response / raw CSV at build time
   - Filter to relevant columns, drop institutions with missing tuition/debt/earnings
   - Aggregate by `ICLEVEL` (mean/median per institution type)
   - Group by `STABBR` for state-level views
   - Parse BLS earnings table into typed array
   - Output clean typed arrays matching Zod schemas

2. **Define schema contract** — `src/lib/data/schema.ts`
   - Zod schemas for each data shape the UI consumes:
   - `InstitutionCost` — tuition in/out, cost of attendance, by institution level
   - `DebtByState` — median debt by institution level and state
   - `EarningsByDegree` — weekly earnings by degree level over time (BLS)
   - `CompletionRate` — transfer-out rate, completion rate by institution/state (IPEDS)

3. **Generate processed data** — `/data/processed/`
   - `costs.json` — aggregated cost comparison (2yr vs 4yr, in-state vs out-of-state)
   - `debt.json` — median debt by institution type, grouped by state
   - `earnings.json` — BLS earnings time series by degree level
   - `completion.json` — IPEDS transfer/completion rates (if View 4 data is ready)

4. **Update README**
   - Cleaning & Transform Notes section (what was dropped, why, how many records)
   - Definitions section:
     - "Transfer student" = started at ICLEVEL=2 institution, enrolled at ICLEVEL=1
     - "Earnings" = median weekly earnings of full-time wage/salary workers (BLS definition)
     - "Completion rate" = IPEDS 150% time measure

5. **Verify engineering gates**
   - `bun run dev` works
   - `bun run build` works
   - No magic numbers without comments
   - At least one test for data loading (schema validation pass/fail)

#### Deliverables:

- [ ] `src/lib/data/loadData.ts`
- [ ] `src/lib/data/schema.ts`
- [ ] `/data/processed/*.json`
- [ ] README updates (Cleaning & Transform Notes, Definitions)
- [ ] Passing build + at least 1 data test

---

### Phase 3 — Prototype: One View That Proves the Claim (End of Week 3)

**Due**: End of Week 3

#### Tasks:

1. **Build View 1: Cost Calculator**
   - Recharts `BarChart` with two grouped bars (2yr+transfer vs 4yr direct)
   - **One interaction only**: Slider — "Years at community college" (1 or 2)
   - Reactively update chart + savings annotation on slider change
   - Annotation component: callout box showing exact dollar savings

2. **Swiss International styling**
   - Set up Tailwind `@theme`: Inter font (Google Fonts), 8px spacing scale, color palette (blue/orange/black/white/gray)
   - Chart styling: clean axes, no chartjunk, direct labels, light gray gridlines
   - Layout: 12-col grid, max-w-[960px] centered, generous whitespace (64px between sections)

3. **Story text panel**
   - 150–250 words explaining what to notice
   - References specific numbers from the data
   - Explains what the slider reveals (how 1yr vs 2yr at CC changes the savings)

4. **Deploy to Vercel**
   - Connect repo to Vercel
   - Verify deployed URL works
   - Add deployment link to README

5. **Update README**
   - Interaction Design section: what the slider does + why it helps answer the question

#### Deliverables:

- [ ] Working View 1 with slider interaction
- [ ] Deployed URL
- [ ] README with Interaction Design section

---

### Phase 4 — Full Story: 2–4 Views + STAR Narrative (End of Week 4)

**Due**: End of Week 4

#### Tasks:

1. **Enhance View 1**
   - Add in-state/out-of-state toggle (second interaction)

2. **Build View 2: Debt by State**
   - Grouped bar chart: median debt at 2yr vs 4yr institutions
   - Dropdown: filter by state/region
   - Annotation: national average callout + credit loss context

3. **Build View 3: Earnings Gap**
   - Line chart: BLS median weekly earnings over time
   - Toggle: associate's vs bachelor's vs some-college
   - Annotation: current earnings gap + interactive breakeven calculator
   - Breakeven calculator: user inputs CC savings amount + assumed weekly earnings gap → shows years to breakeven. Clearly labeled as "projection based on your inputs."

4. **Build View 4 (if time): Completion Funnel**
   - Waterfall/funnel: CC start → Transfer → Bachelor's completion
   - Filter by state (IPEDS data)
   - Annotation: 16% headline stat (NSC, cited)

5. **Narrative structure**
   - Page layout: Context → Evidence → Segmentation → Takeaway
   - Smooth scroll between views (anchor links)
   - Each view: section header + intro text + chart + "what to notice" text

6. **Create `PRESENTATION.md`**
   - S — Situation (20–30 sec): College costs are rising. Students face a fork: CC then transfer, or 4-year direct. Most advice is anecdotal, not data-driven.
   - T — Task (10–15 sec): I built an interactive data story that lets students compare both paths using federal data on cost, debt, earnings, and completion.
   - A — Action (60–90 sec):
     - Data: College Scorecard API + BLS Education Pays + IPEDS Outcome Measures
     - Key transform: aggregated 6,000+ institutions by type (2yr vs 4yr), grouped by state
     - Interactions: slider for CC years (personalizes cost), state filter (segments debt), degree toggle (compares earnings), breakeven calculator (projects ROI)
     - Engineering: Next.js server components load data at build time, Zod validates schema contracts, Recharts renders all charts
   - R — Result (60–90 sec):
     - Transfer path saves ~$10,000+ in total cost, ~$4,500 in debt
     - Bachelor's holders earn ~$658/week more than associate's holders ($34,000/year)
     - Breakeven depends on individual savings and earnings trajectory
     - Only 16% of CC students complete a bachelor's within 6 years
     - Limitation: aggregate institutional data, not individual pathway tracking. Cannot prove causation.

#### Deliverables:

- [ ] 3–4 working views with interactions
- [ ] Narrative flow between views
- [ ] `PRESENTATION.md` with full STAR script

---

### Phase 5 — Polish + Demo Day (End of Week 5)

**Due**: End of Week 5

#### Tasks:

1. **Accessibility**
   - Readable chart labels (min 14px)
   - Keyboard-navigable controls (slider, toggles, dropdown)
   - `aria-label` on chart containers
   - Color choices pass WCAG AA contrast (blue #2563eb on white = 4.6:1, orange #ea580c on white = 4.5:1)

2. **Performance**
   - Data loaded via server components at build time (no client-side parsing)
   - Charts lazy-loaded if below fold (`dynamic(() => import(...), { ssr: false })`)
   - Debounce slider interaction (150ms) to prevent rerender storms

3. **README additions**
   - "Limits & What I'd Do Next" section:
     - Limits: aggregate data, not individual tracking; BLS earnings are by degree not pathway; no control for major/field of study; Scorecard suppresses small cohorts
     - Next: add field-of-study breakdown (Scorecard has this), track individual cohorts if NSC releases data, add cost-of-living adjustment by state
   - Final deployment link
   - Screen recording link

4. **Record 60-second backup demo**
   - State claim ("CC transfer saves money but costs earnings")
   - Show slider changing the cost comparison
   - Show state filter revealing geographic variation in debt
   - Cite limitation ("this is aggregate data, not individual predictions")
   - End with takeaway ("completion is the hidden variable — the cheapest path means nothing if you don't finish")

5. **Live demo prep (3–5 min, STAR format)**
   - Practice run-through
   - Prepare for questions about data provenance and limitations

#### Deliverables:

- [ ] Polished, accessible deployed app
- [ ] Final README with all sections
- [ ] 60-second screen recording
- [ ] Live demo ready

---

## Project Structure

```
student-reality-lab-cordova/
├── docs/
│   └── plans/
│       ├── PROJECT_PLAN.md          # This file
│       └── PLAN_CRITIQUE.md         # Review & data gap analysis
├── data/
│   ├── raw/                         # Untouched source files
│   │   ├── scorecard.json           # College Scorecard API response
│   │   ├── bls_earnings.json        # BLS Education Pays extracted table
│   │   └── ipeds_outcomes.csv       # IPEDS Outcome Measures download
│   ├── processed/                   # Build-ready JSON
│   │   ├── costs.json
│   │   ├── debt.json
│   │   ├── earnings.json
│   │   └── completion.json
│   └── notes.md                     # Provenance + caveats
├── public/
│   └── images/
│       └── draft-chart.png          # Phase 1 draft screenshot
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (Inter font, metadata)
│   │   ├── page.tsx                 # Main data story page
│   │   ├── globals.css              # Tailwind @theme (Swiss International)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── charts/
│   │   │   ├── CostCalculator.tsx   # View 1: bar chart + slider
│   │   │   ├── DebtByState.tsx      # View 2: grouped bars + state filter
│   │   │   ├── EarningsGap.tsx      # View 3: line chart + degree toggle
│   │   │   └── CompletionFunnel.tsx # View 4: funnel + state filter (stretch)
│   │   ├── ui/
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Annotation.tsx
│   │   │   ├── BreakevenCalc.tsx    # Interactive projection calculator
│   │   │   └── SectionHeader.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── data/
│   │   │   ├── loadData.ts          # Data loading + transforms
│   │   │   └── schema.ts            # Zod schemas
│   │   └── env.ts                   # Environment validation
│   ├── utils/
│   │   └── cn.ts                    # clsx + tailwind-merge
│   ├── hooks/
│   │   └── useChartInteraction.ts   # Shared interaction state
│   ├── types/
│   │   └── data.ts                  # TypeScript interfaces
│   └── tests/
│       ├── data/
│       │   └── loadData.test.ts
│       └── components/
│           └── CostCalculator.test.ts
├── PRESENTATION.md                  # STAR narrative (Phase 4)
├── README.md                        # Full project documentation
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── prettier.config.mjs
├── eslint.config.mjs
└── .husky/
    └── pre-commit
```

---

## Key Research Findings (for reference)

### Cost Data

- Community college avg tuition: ~$4,000–5,400/year (in-state)
- Public 4-year avg tuition: ~$10,000+/year (in-state)
- 2yr CC + 2yr university saves $10,000–20,000+ vs 4yr direct

### Debt Data

- Transfer students graduate with ~$4,500 less debt on average
- CC starters: ~$10,300 cumulative debt after 12 years
- 4-year starters: ~$20,000 cumulative debt after 12 years
- Transfer students who complete AA first carry less debt

### Earnings Data (BLS Q1 2025)

- Associate's degree: $1,096/week median ($56,992/year)
- Bachelor's degree: $1,754/week median ($91,208/year)
- Gap: ~$658/week ($34,216/year)
- Some college, no degree: $935/week — the cost of not finishing
- Transfer penalty (Brookings, restricted data): ~$4,200/year lower for transfer students vs direct 4-year graduates
- Top 25% of CC graduates earn more than average 4-year public grads

### Completion Data

- Only 16% of CC students transfer AND complete bachelor's within 6 years (NSC)
- Low-income students: 11% transfer + complete
- Black students: 9% transfer + complete
- Average credit loss on transfer: 13 credits (~1 semester)
- 40% of transfer students receive zero credit for prior work
- Transfer enrollment grew 4.4% in fall 2024 (NSC)

### Sources

- [College Scorecard Data & API](https://collegescorecard.ed.gov/data)
- [College Scorecard API Docs](https://collegescorecard.ed.gov/data/api-documentation/)
- [BLS Education Pays](https://www.bls.gov/emp/tables/unemployment-earnings-education.htm)
- [BLS Weekly Earnings Q1 2025](https://www.bls.gov/opub/ted/2025/median-weekly-earnings-by-educational-attainment-first-quarter-2025.htm)
- [NCES Annual Earnings by Attainment](https://nces.ed.gov/programs/coe/indicator/cba/annual-earnings)
- [IPEDS Data](https://nces.ed.gov/ipeds/use-the-data)
- [NSC Tracking Transfer](https://nscresearchcenter.org/tracking-transfer/)
- [Brookings: CC Transfer Outcomes](https://www.brookings.edu/articles/community-college-students-dont-always-benefit-from-transferring-to-a-4-year-college/)
- [CCRC: Community Colleges and Student Debt](https://ccrc.tc.columbia.edu/publications/community-colleges-student-debt.html)
- [CCRC: Transfer Students as "Good Bet"](https://ccrc.tc.columbia.edu/publications/are-community-college-transfer-students-good-bet-4-year-admissions.html)
- [Community College Review: 2026 Tuition Guide](https://www.communitycollegereview.com/blog/2026-community-college-tuition-national-cost-guide)
