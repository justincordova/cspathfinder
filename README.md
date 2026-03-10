# CSPathFinder

Find and compare the top 100 Computer Science programs across US colleges.

## Features

- **Top 100 CS Schools:** Paginated list (10 per page) with rankings, tuition, earnings, and Niche grades
- **Rich Filters:** Sort by ranking, ROI, tuition, earnings, campus food, party scene, social life, athletics, dorms, safety, professors, diversity, value, location
- **School Details:** Full stats page with Niche letter grades across 12 categories
- **AI Chat Assistant:** Slide-out chatbot that answers questions AND auto-applies filters to the list
- **Theming:** Catppuccin Mocha (dark) / Latte (light) with toggle
- **Charts:** Visual ROI comparison across schools

## Quick Start

```bash
bun install
cp .env.example .env.local  # Add your tokens
bun run dev                  # http://localhost:3000
```

## Environment Variables

| Variable                     | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `HF_TOKEN`                   | Hugging Face API token (free at huggingface.co/settings/tokens) |
| `NEXT_PUBLIC_LOGO_DEV_TOKEN` | Logo.dev API token (free at logo.dev) for school logos          |

## Data Sources

- [College Scorecard API](https://collegescorecard.ed.gov/data/api/) — tuition, earnings, debt, graduation rates
- [Niche.com](https://www.niche.com/colleges/) — 12-category letter grades (food, party, social, safety, etc.)
- [US News](https://www.usnews.com/best-graduate-schools/top-science-schools/computer-science-rankings) — CS program rankings

## Tech Stack

- Next.js 16 (App Router), React 19, Bun, TypeScript
- Tailwind CSS v4, Catppuccin theme
- Recharts, Zod v4, Vitest
- Hugging Face Inference API (Mistral Small)
