# Resources Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `/resources` page with curated developer resources organized into categories with a card-based grid layout.

**Architecture:** New Next.js App Router page at `/resources` with a data-driven approach - resources stored as a constant array, rendered through reusable ResourceCard component. Navbar updated to include Resources link.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, existing Catppuccin theme

---

### Task 1: Create resources data structure

**Files:**

- Create: `src/app/resources/data.ts`

**Step 1: Create the resources data file**

```typescript
export interface Resource {
  name: string;
  url: string;
  description: string;
}

export interface ResourceCategory {
  title: string;
  resources: Resource[];
}

export const resourceCategories: ResourceCategory[] = [
  {
    title: "Learn to Code",
    resources: [
      {
        name: "DevRoadmaps",
        url: "https://roadmap.sh",
        description: "Roadmaps for every tech stack",
      },
      {
        name: "W3Schools",
        url: "https://www.w3schools.com",
        description: "Basic HTML/CSS/JS tutorials",
      },
      {
        name: "freeCodeCamp",
        url: "https://www.freecodecamp.org",
        description: "Free coding courses with projects",
      },
      {
        name: "Exercism",
        url: "https://exercism.org",
        description: "Language-agnostic challenges with mentor feedback",
      },
      {
        name: "GitHub Skills",
        url: "https://skills.github.com",
        description: "Interactive Git tutorials",
      },
    ],
  },
  {
    title: "Interview Prep",
    resources: [
      {
        name: "LeetCode",
        url: "https://leetcode.com",
        description: "Algorithm and data structure problems",
      },
      {
        name: "NeetCode",
        url: "https://neetcode.io",
        description: "Curated LeetCode problem lists",
      },
      {
        name: "Tech Interview Handbook",
        url: "https://www.techinterviewhandbook.org",
        description: "Comprehensive interview prep guide",
      },
      {
        name: "CodeSignal",
        url: "https://codesignal.com",
        description: "Practice interviews with real-world scenarios",
      },
      {
        name: "Pramp",
        url: "https://www.pramp.com",
        description: "Free peer-to-peer mock interviews",
      },
    ],
  },
  {
    title: "Job Search",
    resources: [
      {
        name: "Levels.fyi",
        url: "https://www.levels.fyi",
        description: "Salary data by company and location",
      },
      {
        name: "Coursera",
        url: "https://www.coursera.org",
        description: "College-level courses for skill-building",
      },
      {
        name: "edX",
        url: "https://www.edx.org",
        description: "College-level courses from top universities",
      },
    ],
  },
  {
    title: "Tools & Docs",
    resources: [
      {
        name: "Can I Use",
        url: "https://caniuse.com",
        description: "Browser compatibility tables",
      },
      {
        name: "GitHub Docs",
        url: "https://docs.github.com",
        description: "Git and GitHub documentation",
      },
    ],
  },
];
```

**Step 2: Run type check**

Run: `bun run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/app/resources/data.ts
git commit -m "feat(resources): add data structure for resources page"
```

---

### Task 2: Create ResourceCard component

**Files:**

- Create: `src/app/resources/ResourceCard.tsx`

**Step 1: Create the ResourceCard component**

```typescript
import Link from "next/link";

interface ResourceCardProps {
  name: string;
  url: string;
  description: string;
}

export default function ResourceCard({ name, url, description }: ResourceCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-mantle border border-surface0 hover:border-blue transition-all rounded-lg p-4 flex flex-col h-full"
    >
      <h3 className="font-semibold text-blue mb-2">{name}</h3>
      <p className="text-sm text-subtext0 flex-grow">{description}</p>
      <span className="mt-3 text-sm font-medium text-blue hover:underline">
        Visit →
      </span>
    </a>
  );
}
```

**Step 2: Run type check**

Run: `bun run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/app/resources/ResourceCard.tsx
git commit -m "feat(resources): add ResourceCard component"
```

---

### Task 3: Create the resources page

**Files:**

- Create: `src/app/resources/page.tsx`

**Step 1: Create the main resources page**

```typescript
import ResourceCard from "./ResourceCard";
import { resourceCategories } from "./data";

export default function ResourcesPage() {
  return (
    <main className="max-w-[960px] mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4">Resources for New Developers</h1>
        <p className="text-lg text-subtext0 max-w-2xl">
          Curated tools, tutorials, and guides to help you learn to code, ace interviews,
          and launch your career in computer science.
        </p>
      </section>

      {resourceCategories.map((category) => (
        <section key={category.title} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.resources.map((resource) => (
              <ResourceCard
                key={resource.name}
                name={resource.name}
                url={resource.url}
                description={resource.description}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
```

**Step 2: Run dev server and verify page**

Run: `bun run dev`
Visit: `http://localhost:3000/resources`
Expected: Page loads with 4 categories, resources displayed in grid layout

**Step 3: Run type check**

Run: `bun run type-check`
Expected: No TypeScript errors

**Step 4: Run lint**

Run: `bun run lint`
Expected: No linting errors

**Step 5: Commit**

```bash
git add src/app/resources/page.tsx
git commit -m "feat(resources): add resources page with category grid"
```

---

### Task 4: Update Navbar to include Resources link

**Files:**

- Modify: `src/components/Navbar.tsx`

**Step 1: Add Resources link to navbar**

```tsx
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto max-w-[800px] mt-4 rounded-lg border border-surface0 bg-mantle px-8 shadow-sm">
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue">
            CSPathFinder
          </Link>
          <Link
            href="/resources"
            className={`text-sm font-medium transition-colors ${
              pathname === "/resources" ? "text-blue" : "text-text hover:text-subtext0"
            }`}
          >
            Resources
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

**Step 2: Run type check**

Run: `bun run type-check`
Expected: No TypeScript errors

**Step 3: Run dev server and verify navbar**

Run: `bun run dev`
Visit: `http://localhost:3000` and `http://localhost:3000/resources`
Expected:

- Resources link appears in navbar
- Link is blue when on `/resources` page
- Link changes color on hover

**Step 4: Run lint**

Run: `bun run lint`
Expected: No linting errors

**Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(resources): add Resources link to navbar"
```

---

### Task 5: Verify and test all functionality

**Files:**

- Test: Manual testing in browser

**Step 1: Test resources page fully**

Run: `bun run dev`
Visit: `http://localhost:3000/resources`

Check:

- [ ] Page title displays correctly
- [ ] All 4 categories show with correct titles
- [ ] All resources display with name, description, and link
- [ ] Cards have proper styling (border, hover effect)
- [ ] Grid is responsive (1 col mobile, 2 tablet, 3 desktop)
- [ ] All resource links open in new tab (rel="noopener noreferrer")

**Step 2: Test navbar navigation**

Check:

- [ ] Resources link appears on all pages
- [ ] Clicking Resources navigates to `/resources`
- [ ] Active state highlights correctly on resources page
- [ ] Other nav items still work (home link, theme toggle)

**Step 3: Test dark/light mode**

Check:

- [ ] Resources page looks good in both dark and light modes
- [ ] Card colors adapt to theme (using theme variables)
- [ ] Text contrast is readable in both modes

**Step 4: Run all checks**

```bash
bun run type-check
bun run lint
bun run test
```

Expected: All checks pass

**Step 5: Commit final verification**

```bash
git add .
git commit -m "chore(resources): verify and finalize resources page"
```

---

### Task 6: Deploy to Vercel

**Files:**

- None (deployment)

**Step 1: Push to GitHub**

```bash
git push origin main
```

**Step 2: Verify Vercel deployment**

Visit: `https://cspathfinder.vercel.app/resources`
Expected: Resources page loads and functions correctly

**Step 3: Test production deployment**

Check:

- [ ] Resources link works in production navbar
- [ ] All resources load and link correctly
- [ ] Dark/light mode toggle works
- [ ] Responsive layout works on mobile

**Step 4: Done!**

The resources page is now live and fully functional.
