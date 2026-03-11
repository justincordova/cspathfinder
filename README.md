# CSPathFinder

Find and compare the top Computer Science programs across US colleges.

## What You Can Do

**Browse and Filter**

- Explore top CS programs with rankings from CSRankings.org
- Sort by CS ranking, ROI, tuition, earnings, or acceptance rate
- Filter by state, region, or search by school name
- See detailed stats: tuition, earnings, debt, graduation rates, and acceptance rates

**School Details**

- View Niche letter grades across 12 categories: academics, campus food, party scene, social life, dorms, safety, professors, athletics, diversity, value, and location
- Compare ROI and earnings data
- See school logos and quick stats at a glance

**AI Assistant**

- Ask questions like "Best CS school for food?" or "Cheapest top 20 programs?"
- Get instant answers with automatic filter suggestions
- The chat applies filters to your list so you can see results immediately

**Visual Data**

- ROI charts comparing multiple schools
- Clean, readable tables with pagination
- Dark and light theme modes

## Live Site

Visit the app at [cspathfinder.vercel.app](https://cspathfinder.vercel.app)

## Data Sources

All data is compiled from multiple sources:

- **CSRankings.org** — CS program rankings based on faculty publications
- **Niche.com** — 12-category letter grades (scraped from individual school pages)
- **College Scorecard API** — tuition, earnings, debt, graduation rates

Niche grades and CS rankings are scraped using Playwright and cached at build time for fast loading.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 with Catppuccin Mocha/Latte themes
- **Charts:** Recharts
- **AI:** Hugging Face Inference API (Qwen 2.5 72B) for the chat assistant
- **Validation:** Zod v4
- **Testing:** Vitest, React Testing Library
- **Runtime:** Bun
