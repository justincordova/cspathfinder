# Multi-Page Decision Aid Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform single-page scroll into polished decision aid with sticky tab navigation, smooth scrolling, and Catppuccin theme system with light/dark toggle (default light: Latte)

**Architecture:** Single-page app with tab-based navigation using URL hashes for bookmarking. Tab clicks trigger smooth scroll to sections, with URL hash updates. Theme system with Latte (light) and Mocha (dark) variants, toggleable via navbar. Theme preference persisted in localStorage.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, Catppuccin Latte & Mocha color schemes

---

### Task 1: Create Theme Module

**Files:**

- Create: `src/theme/colors.ts`
- Modify: `src/app/globals.css`

**Step 1: Create theme colors module**

```typescript
// src/theme/colors.ts
export type Theme = "latte" | "mocha";

export const themes = {
  latte: {
    base: "#eff1f5",
    mantle: "#e6e9ef",
    crust: "#dce0e8",
    surface0: "#ccd0da",
    surface1: "#bcc0cc",
    surface2: "#acb0be",
    text: "#4c4f69",
    subtext1: "#5c5f77",
    subtext0: "#6c6f85",
    overlay2: "#7c7f93",
    overlay1: "#8c8fa1",
    overlay0: "#9ca0b0",
  },
  mocha: {
    base: "#1e1e2e",
    mantle: "#181825",
    crust: "#11111b",
    surface0: "#313244",
    surface1: "#45475a",
    surface2: "#585b70",
    text: "#cdd6f4",
    subtext1: "#bac2de",
    subtext0: "#a6adc8",
    overlay2: "#9399b2",
    overlay1: "#7f849c",
    overlay0: "#6c7086",
  },
} as const;

export const accentColors = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
} as const;

export const defaultTheme: Theme = "latte";
```

**Step 2: Update globals.css with Catppuccin themes**

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Catppuccin Latte (light theme) */
  --color-latte-base: #eff1f5;
  --color-latte-mantle: #e6e9ef;
  --color-latte-crust: #dce0e8;
  --color-latte-surface0: #ccd0da;
  --color-latte-surface1: #bcc0cc;
  --color-latte-surface2: #acb0be;
  --color-latte-text: #4c4f69;
  --color-latte-subtext1: #5c5f77;
  --color-latte-subtext0: #6c6f85;
  --color-latte-overlay2: #7c7f93;
  --color-latte-overlay1: #8c8fa1;
  --color-latte-overlay0: #9ca0b0;

  /* Catppuccin Mocha (dark theme) */
  --color-mocha-base: #1e1e2e;
  --color-mocha-mantle: #181825;
  --color-mocha-crust: #11111b;
  --color-mocha-surface0: #313244;
  --color-mocha-surface1: #45475a;
  --color-mocha-surface2: #585b70;
  --color-mocha-text: #cdd6f4;
  --color-mocha-subtext1: #bac2de;
  --color-mocha-subtext0: #a6adc8;
  --color-mocha-overlay2: #9399b2;
  --color-mocha-overlay1: #7f849c;
  --color-mocha-overlay0: #6c7086;

  /* Accent colors (same for both themes) */
  --color-peach: #fab387;
  --color-sapphire: #74c7ec;
  --color-lavender: #b4befe;
  --color-red: #f38ba8;
  --color-green: #a6e3a1;
  --color-yellow: #f9e2af;

  /* 8px base spacing scale */
  --spacing: 8px;

  /* Typography */
  --line-height-body: 1.5;
  --line-height-heading: 1.2;
}

@layer base {
  html {
    font-family: var(--font-sans);
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
  }

  /* Light theme (default) */
  :root[data-theme="latte"] {
    --color-base: var(--color-latte-base);
    --color-mantle: var(--color-latte-mantle);
    --color-crust: var(--color-latte-crust);
    --color-surface0: var(--color-latte-surface0);
    --color-surface1: var(--color-latte-surface1);
    --color-surface2: var(--color-latte-surface2);
    --color-text: var(--color-latte-text);
    --color-subtext1: var(--color-latte-subtext1);
    --color-subtext0: var(--color-latte-subtext0);
    --color-overlay2: var(--color-latte-overlay2);
    --color-overlay1: var(--color-latte-overlay1);
    --color-overlay0: var(--color-latte-overlay0);
    background-color: var(--color-base);
    color: var(--color-text);
  }

  /* Dark theme */
  :root[data-theme="mocha"] {
    --color-base: var(--color-mocha-base);
    --color-mantle: var(--color-mocha-mantle);
    --color-crust: var(--color-mocha-crust);
    --color-surface0: var(--color-mocha-surface0);
    --color-surface1: var(--color-mocha-surface1);
    --color-surface2: var(--color-mocha-surface2);
    --color-text: var(--color-mocha-text);
    --color-subtext1: var(--color-mocha-subtext1);
    --color-subtext0: var(--color-mocha-subtext0);
    --color-overlay2: var(--color-mocha-overlay2);
    --color-overlay1: var(--color-mocha-overlay1);
    --color-overlay0: var(--color-mocha-overlay0);
    background-color: var(--color-base);
    color: var(--color-text);
  }
}
```

**Step 3: Test theme loads correctly**

Run: `bun run dev`
Expected: App starts with light theme (Latte) as default

**Step 4: Commit**

```bash
git add src/theme/colors.ts src/app/globals.css
git commit -m "feat: add Catppuccin Latte and Mocha theme system"
```

---

### Task 2: Create Theme Provider and Toggle Components

**Files:**

- Create: `src/components/theme/ThemeProvider.tsx`
- Create: `src/components/theme/ThemeToggle.tsx`

**Step 1: Create ThemeProvider component**

```typescript
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Theme, defaultTheme } from '../../theme/colors';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'latte' || savedTheme === 'mocha')) {
      setTheme(savedTheme);
    } else {
      setTheme(defaultTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'latte' ? 'mocha' : 'latte'));
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Step 2: Create ThemeToggle component**

```typescript
'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-surface2 transition-colors text-subtext1 hover:text-text"
      aria-label={`Switch to ${theme === 'latte' ? 'dark' : 'light'} theme`}
    >
      {theme === 'latte' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
```

**Step 3: Test theme provider and toggle work**

Run: `bun run dev`
Expected:

- Page loads with light theme (Latte) by default
- Clicking toggle switches to dark theme (Mocha)
- Theme preference persists across page reloads

**Step 4: Commit**

```bash
git add src/components/theme/
git commit -m "feat: add theme provider and toggle components"
```

---

### Task 3: Create Sticky Navigation Component with Theme Toggle

**Files:**

- Create: `src/components/navigation/TabNav.tsx`

**Step 1: Write the TabNav component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from '../theme/ThemeToggle';

const tabs = [
  { id: 'cost', label: 'Cost' },
  { id: 'debt', label: 'Debt' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'completion', label: 'Completion' },
  { id: 'takeaway', label: 'Takeaway' },
] as const;

export default function TabNav() {
  const [activeTab, setActiveTab] = useState<string>('cost');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && tabs.some((tab) => tab.id === hash)) {
      setActiveTab(hash);
    }

    const handleScroll = () => {
      const sections = tabs.map((tab) => ({
        id: tab.id,
        element: document.getElementById(tab.id),
      }));

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section.element) {
          const { offsetTop, offsetHeight } = section.element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId: string) => {
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${tabId}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mantle border-b border-surface0">
      <div className="max-w-960 mx-auto px-6">
        <div className="flex items-center justify-between h-15">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'text-lavender bg-surface0'
                    : 'text-subtext1 hover:text-lavender hover:bg-surface2'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: Test TabNav component renders**

Run: `bun run dev`
Expected: Navigation bar appears at top with 5 tabs and theme toggle button

**Step 3: Commit**

```bash
git add src/components/navigation/TabNav.tsx
git commit -m "feat: add sticky tab navigation with theme toggle"
```

---

### Task 4: Remove Old Header and Add ThemeProvider to Layout

**Files:**

- Modify: `src/app/layout.tsx`
- Delete: `src/components/layout/Header.tsx`

**Step 1: Update layout.tsx**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import TabNav from "../components/navigation/TabNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "2-Year Transfer vs. 4-Year Direct",
  description:
    "An evidence-based visualization comparing financial and educational outcomes of community college transfer pathway versus direct 4-year enrollment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider>
          <TabNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 2: Delete old Header component**

Run: `rm src/components/layout/Header.tsx`

**Step 3: Test navigation appears**

Run: `bun run dev`
Expected: TabNav at top with theme toggle, no old header

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "refactor: add ThemeProvider and TabNav to layout"
git rm src/components/layout/Header.tsx
```

---

### Task 5: Update Section Headers and Add Section IDs

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/SectionHeader.tsx`

**Step 1: Update SectionHeader component**

```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold text-text leading-tight mb-3">{title}</h2>
      {subtitle && <p className="text-lg text-subtext1 font-normal">{subtitle}</p>}
    </div>
  );
}
```

**Step 2: Update page.tsx section headers and add IDs**

For each section, simplify titles and add IDs:

- Cost section: `<section id="cost" className="mb-24"><SectionHeader title="Cost" /></section>`
- Debt section: `<section id="debt" className="mb-24"><SectionHeader title="Debt" /></section>`
- Earnings section: `<section id="earnings" className="mb-24"><SectionHeader title="Earnings" /></section>`
- Completion section: `<section id="completion" className="mb-24"><SectionHeader title="Completion" /></section>`
- Takeaway section: `<section id="takeaway" className="mb-16 border-t border-surface1 pt-16"><SectionHeader title="Takeaway" /></section>`

**Step 3: Add top padding to main content**

```typescript
<main className="max-w-960 mx-auto px-6 py-16 pt-20">
```

**Step 4: Test section headers updated**

Run: `bun run dev`
Expected: Simplified titles, section IDs present, content not hidden behind nav

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/ui/SectionHeader.tsx
git commit -m "refactor: simplify section headers, add IDs, add top padding"
```

---

### Task 6: Update Chart Colors to Catppuccin (Theme-Aware)

**Files:**

- Modify: `src/components/charts/CostCalculator.tsx`
- Modify: `src/components/charts/DebtByState.tsx`
- Modify: `src/components/charts/EarningsGap.tsx`
- Modify: `src/components/charts/CompletionFunnel.tsx`

**IMPORTANT:** Use Tailwind utility classes (`text-text`, `bg-surface0`, `border-surface1`, etc.) which automatically adapt to the active theme via CSS variables. Only hardcode hex values for Rechart-specific properties.

**Step 1: Update CostCalculator colors**

Replace line 46-47 (data array):
From:

```typescript
const data = [
  { name: "Transfer Path", total: transferTotal, color: "#ea580c" },
  { name: "4-Year Direct", total: directTotal, color: "#2563eb" },
];
```

To:

```typescript
const data = [
  { name: "Transfer Path", total: transferTotal, color: "#fab387" },
  { name: "4-Year Direct", total: directTotal, color: "#74c7ec" },
];
```

Replace all `text-gray-600` → `text-subtext1`
Replace all `text-gray-900` → `text-text`
Replace all `bg-gray-900` → `bg-surface0`
Replace all `text-white` → `text-text`
Replace all `bg-white` → `bg-surface2`
Replace all `text-gray-600` → `text-subtext1`
Replace all `border-gray-300` → `border-surface1`
Replace all `border-gray-900` → `border-surface0`
Replace all `hover:border-gray-500` → `hover:border-surface1`
Replace `accent-orange-600` → `accent-peach`
Replace `stroke="#e5e7eb"` → `stroke="#313244"`
Replace all `fill: "#111827"` → `fill: "#cdd6f4"`
Replace all `fill: "#6b7280"` → `fill: "#bac2de"`
Replace `cursor={{ fill: "#f3f4f6" }}` → `cursor={{ fill: "#313244" }}`
Replace contentStyle borders and colors:

```typescript
contentStyle={{
  border: '1px solid #45475a',
  borderRadius: '4px',
  fontSize: '13px',
  backgroundColor: '#181825',
  color: '#cdd6f4',
}}
```

Replace annotation boxes:

- `bg-orange-50` → `bg-surface0`
- `bg-blue-50` → `bg-surface0`
- `border-orange-200` → `border-surface1`
- `border-blue-200` → `border-surface1`
- `text-orange-600` → `text-peach`
- `text-blue-600` → `text-sapphire`
- `text-blue-700` → `text-sapphire`
- `text-gray-700` → `text-subtext1`

**Step 2: Update DebtByState colors**

Same pattern as CostCalculator:

- Replace data array colors with Peach (#fab387) and Sapphire (#74c7ec)
- Replace all gray text/border/background classes with theme-aware Tailwind utilities
- Update chart grid and tick styles
- Update tooltip contentStyle

**Step 3: Update EarningsGap colors**

Replace DEGREES array (line ~32-34):

```typescript
const DEGREES = [
  { key: "associate", label: "Associate's", color: "#fab387" },
  { key: "bachelor", label: "Bachelor's", color: "#74c7ec" },
  { key: "some_college", label: "Some College", color: "#f9e2af" },
] as const;
```

Replace button style (around line ~119-128):

```typescript
style={
  isActive
    ? {
        backgroundColor: color,
        color: '#1e1e2e',
        borderColor: color,
      }
    : {
        backgroundColor: '#313244',
        color: '#bac2de',
        borderColor: '#45475a',
      }
}
```

Replace all chart grid/tooltip styles with theme-aware colors
Replace annotation boxes with `bg-surface0`, `border-surface1`, theme-aware text colors

- `text-blue-600` → `text-sapphire`
- `text-orange-600` → `text-peach`
- `text-gray-900` → `text-text`
- `text-gray-700` → `text-subtext1`
- `bg-gray-50` → `bg-surface0`
- `bg-blue-50` → `bg-surface0`
- `border-gray-200` → `border-surface1`
- `border-blue-200` → `border-surface1`
- Replace input colors: `bg-white` → `bg-surface2`, `text-gray-900` → `text-text`, `text-gray-500` → `text-subtext0`, `text-gray-400` → `text-overlay0`

**Step 4: Update CompletionFunnel colors**

Replace FUNNEL_STEPS array (line ~17-20):

```typescript
const FUNNEL_STEPS = [
  { label: "Start at CC", pct: 100, color: "#45475a" },
  { label: "Enrolled after year 1", pct: 65, color: "#585b70" },
  { label: "Transfer to 4-year", pct: 33, color: "#cba6f7" },
  { label: "Transfer + complete bachelor's", pct: 16, color: "#f38ba8" },
];
```

Replace DEMOGRAPHIC_DATA array (line ~24-26):

```typescript
const DEMOGRAPHIC_DATA = [
  { group: "Overall", pct: 16, color: "#f38ba8" },
  { group: "Low-income", pct: 11, color: "#eba0ac" },
  { group: "Black students", pct: 9, color: "#fab387" },
];
```

Replace all chart styles with theme-aware colors:

- `text-gray-500` → `text-subtext1`
- `stroke="#e5e7eb"` → `stroke="#313244"`
- All fill colors to use theme colors

Replace annotation:

- `bg-orange-50` → `bg-surface0`
- `border-orange-200` → `border-surface1`
- `text-orange-700` → `text-red`
- `text-gray-400` → `text-overlay0`

**Step 5: Test all charts render correctly**

Run: `bun run dev`
Expected: All charts use Catppuccin colors and are readable in both light and dark themes

**Step 6: Commit**

```bash
git add src/components/charts/
git commit -m "style: update chart colors to Catppuccin theme"
```

---

### Task 7: Update Content Styling

**Files:**

- Modify: `src/app/page.tsx`

**Step 1: Update text and background colors**

Replace:

- `text-gray-900` → `text-text`
- `text-gray-600` → `text-subtext1`
- `text-gray-500` → `text-subtext0`
- `bg-paper` → `bg-surface0`
- `bg-white` → `bg-surface2`
- `border-gray-200` → `border-surface1`
- `border-gray-300` → `border-surface1`

**Step 2: Test content styling**

Run: `bun run dev`
Expected: All text and backgrounds use theme-aware colors

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: update content styling to use theme colors"
```

---

### Task 8: Update Footer Styling

**Files:**

- Modify: `src/components/layout/Footer.tsx`

**Step 1: Update Footer colors**

Replace gray colors with theme-aware colors (text-subtext0, border-surface1, bg-mantle)

**Step 2: Test Footer styling**

Run: `bun run dev`
Expected: Footer uses theme-aware colors

**Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "style: update footer to use theme colors"
```

---

### Task 9: Test Full User Flow

**Files:**

- No file changes
- Test: Manual testing

**Step 1: Test tab navigation**

Expected:

- Tabs are fixed at top
- Clicking tab smooth scrolls to section
- URL hash updates
- Active tab reflects current section
- Initial URL hash sets correct active tab

**Step 2: Test theme toggle**

Expected:

- Page loads with light theme (Latte) by default
- Clicking toggle switches to dark theme (Mocha)
- Theme persists across page reloads
- All UI elements adapt correctly

**Step 3: Test responsive behavior**

Expected:

- Navigation works on mobile
- Charts resize correctly
- Theme toggle accessible

**Step 4: Test URL hash navigation**

Expected:

- Direct URLs scroll to correct section
- Back button works correctly
- Refresh maintains scroll position

**Step 5: Run type checking and linting**

Run: `bun run typecheck && bun run lint`
Expected: No errors

**Step 6: Run tests**

Run: `bun test`
Expected: All tests pass

**Step 7: Commit**

```bash
git commit -m "test: verify full user flow and theme system"
```

---

### Task 10: Update Documentation

**Files:**

- Modify: `CLAUDE.md`
- Modify: `README.md`

**Step 1: Update CLAUDE.md**

Add Catppuccin theme documentation:

```markdown
## Design System

**Theme**: Catppuccin Latte (light, default) and Mocha (dark)

- Light theme (Latte): Base (#eff1f5), Text (#4c4f69)
- Dark theme (Mocha): Base (#1e1e2e), Text (#cdd6f4)
- Theme toggle in navbar (sun/moon icon)
- Theme preference persisted in localStorage
- All colors defined in `src/theme/colors.ts`
- Tailwind utilities like `text-text`, `bg-surface0` automatically adapt to active theme
```

**Step 2: Update README.md**

Mention Catppuccin Latte (light default) and Mocha (dark) themes

**Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update documentation with Catppuccin theme system"
```

**Step 4: Final verification**

Run: `git log --oneline -10`
Expected: Clean commit history with all tasks completed
