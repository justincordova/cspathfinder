# Phase 7: Niche.com CS Rankings Scraper

## Overview

Add automated daily scraping of Niche.com's numeric CS program rankings via GitHub Actions + Playwright. Replace letter-grade sort filters with real numeric rankings.

## Architecture

```
Daily at 6 AM UTC (GitHub Actions cron)
  → Spin up Ubuntu VM (free)
  → Install Playwright + Chromium
  → Scrape niche.com/colleges/search/best-colleges-for-computer-science/
  → Match scraped schools to our data via nicheUrl slug comparison
  → Update data/schools.json with nicheRanking field
  → Git commit + push
  → Vercel auto-deploys with fresh data (zero-downtime swap)
```

## Phase 1: Scraper Script

### New file: `scripts/scrape-niche-rankings.ts`

**Dependencies**: `playwright` (devDependency)

**Script structure:**

1. **Launch Playwright Chromium** with `headless: true`, realistic user-agent, and viewport
2. **Navigate and paginate** — Niche shows 25 per page, need pages 1–4 for 100 schools
   - URL pattern: `?page=2`, `?page=3`, `?page=4`
   - Random delay (2–5s) between pages to reduce bot detection
3. **Extract data** — each page has school cards with name + rank position (implicit from order)
4. **Match to existing data** — use `nicheUrl` slug from each school as primary match key (most reliable). Fall back to normalized name similarity (threshold 0.6)
5. **Validate with Zod** — validate each scraped entry before merging
6. **Write updated data** — merge `nicheRanking` into `data/schools.json`, preserve formatting
7. **Failure handling** — if any page yields zero results or errors, abort without writing. Exit code 1 so GitHub Actions knows it failed

**PerimeterX mitigations:**

- Real Chromium browser (not headless detection-prone alternatives)
- Realistic user-agent string
- Random delays between navigations
- Detect blocks (CAPTCHA elements or empty results) → abort gracefully
- Escalation path: `playwright-extra` with stealth plugin → `xvfb-run` with headed mode

**Package.json script:**

```json
"scrape:niche": "bunx playwright install chromium && bun run scripts/scrape-niche-rankings.ts"
```

## Phase 2: Data Schema Update

### `src/lib/data/schema.ts`

- Add `nicheRanking: z.number().int().min(1).nullable()` to SchoolSchema
- Keep `ranking` as US News ranking (add comment for clarity)

### `data/schools.json`

- Add `"nicheRanking": null` to all 100 entries initially (before first scrape)

### `src/lib/data/filters.ts`

- Add `"nicheRanking"` to `SortField` union type
- Handle in `getSortValue`: `school.nicheRanking ?? 999` (unranked sort last)
- Remove all Niche grade fields from `SortField`: `overall`, `academics`, `value`, `diversity`, `campus`, `athletics`, `partyScene`, `professors`, `location`, `dorms`, `campusFood`, `studentLife`, `safety`
- Remove `NICHE_GRADE_FIELDS` set and grade-sorting branch in `getSortValue`
- Keep `gradeToNumeric` in schema.ts (still used by `GradeBadge`)

### `src/components/SchoolList.tsx`

- Replace `SORT_OPTIONS` with:
  ```
  Niche Rank (asc) | US News (asc) | ROI (asc) | Earnings (desc) | Tuition (asc) | Acceptance (asc)
  ```
- Default sort = `nicheRanking` ascending (#1 = best)
- **Remove `rankMap` useMemo entirely** — use actual ranking numbers from data
- Card display: show `#{school.nicheRanking}` directly
- Update `clearAllFilters` to reset to `nicheRanking`

## Phase 3: GitHub Actions Workflow

### New file: `.github/workflows/scrape-niche.yml`

```yaml
name: Scrape Niche Rankings

on:
  schedule:
    - cron: "0 6 * * *" # Daily at 6 AM UTC
  workflow_dispatch: {} # Manual trigger

permissions:
  contents: write

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - name: Install Playwright browsers
        run: bunx playwright install --with-deps chromium
      - name: Run Niche scraper
        run: bun run scripts/scrape-niche-rankings.ts
      - name: Commit and push if changed
        run: |
          git diff --quiet data/schools.json && exit 0
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/schools.json
          git commit -m "data: update niche rankings $(date -u +%Y-%m-%d)"
          git push
```

**Budget:** ~2-3 min/run × 30 days = 90 min/month (well within 2000 free minutes)

**Failure behavior:** Scraper exits code 1 → workflow stops before commit → last good data preserved

## Phase 4: Frontend Cleanup

### School cards (`SchoolList.tsx`)

- Show actual `nicheRanking` number: `#{school.nicheRanking}`
- Keep GradeBadges on cards (visual info, just not sortable)

### School detail page (`src/app/school/[slug]/page.tsx`)

- Show both rankings in stats grid:
  - "Niche CS Ranking" → `#3`
  - "US News CS Ranking" → `#5`

## Implementation Order

1. Add `nicheRanking: null` to all schools in `data/schools.json` + update Zod schema
2. Write scraper script `scripts/scrape-niche-rankings.ts`
3. Test scraper locally: `bun run scripts/scrape-niche-rankings.ts`
4. Update `filters.ts` (new sort field, remove grade sorts)
5. Update `SchoolList.tsx` (new sort options, remove rankMap, new card display)
6. Update detail page to show both rankings
7. Add `.github/workflows/scrape-niche.yml`
8. Run tests + lint, commit all changes

## Risks & Mitigations

| Risk                            | Likelihood         | Mitigation                                     |
| ------------------------------- | ------------------ | ---------------------------------------------- |
| PerimeterX blocks scraper       | Medium             | Stealth plugin → headed mode → manual fallback |
| Niche DOM structure changes     | Low (monthly)      | Assert min 20 results/page, fail loudly        |
| Name matching inaccuracy        | Low                | Use nicheUrl slug as primary key               |
| Schools not in Niche top 100    | Expected           | `nicheRanking: null`, sort last                |
| GitHub Actions minutes exceeded | Very low (90/2000) | N/A                                            |
