# Scraping Guide

How to manually update school data from Niche and CSRankings.

## Prerequisites

- **ProtonVPN** — Niche bans your IP after ~10 requests. Switch VPN servers between batches.
- **Playwright** — CSRankings scraper uses Playwright (`bun add playwright`).

## IP Management (ProtonVPN)

Niche rate-limits aggressively. When you get a `403 Forbidden`:

1. Open ProtonVPN and disconnect
2. Connect to a different server (different country/city works best)
3. Continue scraping

You get roughly **10 requests per IP** before getting banned.

---

## Niche CS Rankings

Niche ranks 356 schools across 15 pages (25 per page, page 15 has 6).

### Step 1: Scrape ranking pages

Each page gives you the school slugs + names + ranks.

```bash
bun run scripts/scrape-niche-page.ts 1
bun run scripts/scrape-niche-page.ts 2
# ... through 15
```

- Do ~10 pages per IP, then switch VPN server
- Output: `data/niche-cs/page-N.json`

### Step 2: Scrape school profiles

Each school needs its Niche profile page scraped for tuition, grades, acceptance rate, etc.

**Interactive mode (recommended)** — runs continuously, pauses when blocked:

```bash
bun run scripts/scrape-niche-all-profiles.ts
```

Or start from a specific rank:

```bash
bun run scripts/scrape-niche-all-profiles.ts --start 83
```

When it hits a 403, it pauses and asks you to change your IP. Switch ProtonVPN server, press Enter, and it continues.

**Manual mode** — one school at a time by rank or slug:

```bash
bun run scripts/scrape-niche-profile.ts 1
bun run scripts/scrape-niche-profile.ts 85
bun run scripts/scrape-niche-profile.ts carnegie-mellon-university
```

- Output: `data/niche-profiles/<slug>.json`

### Step 3: Build niche-schools.json

Once you have all ranking pages + profiles scraped:

```bash
bun run scripts/merge-niche-cs.ts
```

This builds `data/niche-schools.json` from the scraped data. It reports any missing profiles so you know what to go back and scrape.

---

## CSRankings

CSRankings.org doesn't block scrapers — it uses a client-rendered table that Playwright reads.

### Step 1: Scrape rankings

```bash
bun run scripts/scrape-csrankings.ts --scrape-only
```

This launches a headless browser, loads CSRankings.org, and saves all US institutions + ranks to `data/csrankings-raw.json`.

### Step 2: Get Niche profiles for CSRankings schools

CSRankings only gives rank + name. School data (tuition, grades, etc.) comes from Niche profiles. The merge step will tell you which profiles are missing.

```bash
bun run scripts/scrape-csrankings.ts --merge-only
```

This outputs a list of missing Niche slugs. Scrape them:

```bash
bun run scripts/scrape-niche-profile.ts <slug>
```

Or use the missing profiles file it generates:

```bash
cat data/csrankings-missing-profiles.txt | while read slug; do
  bun run scripts/scrape-niche-profile.ts "$slug"
  sleep 3
done
```

(Switch VPN every ~10 schools when you get 403s.)

Then re-run the merge:

```bash
bun run scripts/scrape-csrankings.ts --merge-only
```

Output: `data/csrankings-schools.json`

---

## Data files

| File                              | Source  | Description                              |
| --------------------------------- | ------- | ---------------------------------------- |
| `data/niche-cs/page-N.json`       | Scraped | Niche ranking pages (slug, name, rank)   |
| `data/niche-profiles/<slug>.json` | Scraped | Individual school data from Niche        |
| `data/niche-schools.json`         | Built   | Final Niche school list for the app      |
| `data/csrankings-raw.json`        | Scraped | Raw CSRankings institutions + ranks      |
| `data/csrankings-schools.json`    | Built   | Final CSRankings school list for the app |

## Tips

- Niche ranking stops at **#356** (page 15)
- CSRankings has no rate limiting
- Always run the merge script after scraping to rebuild the JSON files
- The app reads `niche-schools.json` and `csrankings-schools.json` at build time
