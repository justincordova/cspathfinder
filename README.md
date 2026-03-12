# CSPathFinder

Find and compare the top Computer Science programs across US colleges.

## What You Can Do

**Browse and Filter**

- Explore top CS programs with rankings from CSRankings.org
- Sort by CS ranking, ROI, tuition, earnings, or acceptance rate
- Filter by state, region, or search by school name
- See detailed stats: tuition, earnings, debt, graduation rates, and acceptance rates

**School Details**

- View Niche letter grades across 13 categories: academics, campus food, party scene, social life, dorms, safety, professors, athletics, diversity, value, location, campus, and overall
- See payback period: 4-year cost of attendance divided by median earnings 6 years after enrollment
- See school logos and quick stats at a glance

**Compare Schools**

- Add up to 3 schools to a side-by-side comparison
- Highlights the best value in each row (rankings, tuition, earnings, debt, Niche grades)
- Persistent across pages via session storage

**Saved Schools**

- Heart any school to save it to your favorites list
- Favorites persist across sessions via local storage
- View all saved schools on the /favorites page

**AI Assistant**

- Ask questions like "Best CS school for food?" or "Cheapest top 20 programs?"
- Get instant answers with automatic filter suggestions
- The chat applies filters to your list so you can see results immediately
- Chat history persists across sessions

**Visual Data**

- ROI chart comparing tuition vs median earnings across filtered results
- Clean, readable tables with pagination
- Shareable URLs — filters are reflected in the URL
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
