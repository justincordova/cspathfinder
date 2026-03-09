# Multi-Page Decision Aid with Catppuccin Mocha Design

**Goal:** Transform single-page scroll into polished decision aid with sticky tab navigation, smooth scrolling, and Catppuccin Mocha dark theme

**Architecture:** Single-page app with tab-based navigation using URL hashes for bookmarking. Tab clicks trigger smooth scroll to sections, with URL hash updates. Theme stored in centralized TypeScript module.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, Catppuccin Mocha color scheme

---

## Page Structure

### Sticky Navigation Bar (Fixed Top)

- Height: ~60px
- Background: Mantle (#181825)
- Border bottom: Surface 0 (#313244)
- 5 tabs: Cost, Debt, Earnings, Completion, Takeaway
- Active tab: Lavender (#b4befe)
- Inactive tab: Subtext 1 (#bac2de) → Lavender on hover
- Hover state: Surface 2 (#585b70)
- Click → smooth scroll to section (1.5s)
- Updates URL hash immediately
- Active state persists based on scroll position

### Main Content

- Max-width: 960px
- Section spacing: 64px+
- Sections: Intro, Cost, Debt, Earnings, Completion, Takeaway

---

## Visual Design

### Color Palette (Catppuccin Mocha)

- Background: Base (#1e1e2e)
- Card backgrounds: Surface 0 (#313244)
- Navigation: Mantle (#181825)
- Primary text: Text (#cdd6f4)
- Secondary text: Subtext 1 (#bac2de)
- 4-year path accent: Sapphire (#74c7ec)
- Transfer path accent: Peach (#fab387)
- Navigation active: Lavender (#b4befe)
- Success/hints: Green (#a6e3a1)
- Borders: Surface 1 (#45475a)

### Typography

- Font: Inter (Swiss International)
- Heading leading: 1.2
- Body leading: 1.5
- Section labels: uppercase, tracking-widest, Peach (#fab387)

### Spacing

- 8px grid base
- Scale: 8px, 16px, 24px, 32px, 64px

---

## Interaction Design

### Tab Navigation

- Click triggers smooth scroll (1.5s animation)
- URL hash updates immediately
- Active tab highlights briefly on section arrival (optional fade-in)
- Scroll-based active tab detection

### Chart Interactions

- Keep existing sliders, toggles, dropdowns
- Use theme colors for interactive elements
- Hover states: Surface 2 (#585b70) → lighter variants

---

## Component Changes

### Header Component

- Remove "Student Reality Lab" branding
- Remove existing header structure
- Create new sticky tab navigation component

### Navigation Component (New)

- Fixed position at top
- Tab-based navigation
- Smooth scroll behavior
- URL hash updates
- Active state management

### Section Headers

- Remove "View X — " prefix
- Simplify to section name only (Cost, Debt, etc.)
- Keep uppercase tracking style

### Chart Components

- Update colors to Catppuccin Mocha
- Ensure contrast on dark background
- Use theme accent colors (Sapphire, Peach)

---

## Theme Organization

### File Structure

```
src/
  theme/
    colors.ts  # Full Catppuccin Mocha palette + spacing + typography
  app/
    globals.css  # Theme variables, Tailwind config
```

### Theme Export

```typescript
export const theme = {
  colors: { /* full Catppuccin Mocha palette */ },
  spacing: { 1: 8, 2: 16, ... },
  typography: { /* font settings */ }
}
```

---

## Data Flow

- Data loading remains server-side (no client-side fetch)
- Charts still lazy-loaded with `dynamic()`
- Validation still uses Zod schemas
- No changes to data architecture

---

## Testing

- Verify smooth scroll behavior across browsers
- Test URL hash updates and bookmarking
- Validate color contrast on dark theme
- Ensure chart readability with new colors
- Test active tab state on scroll

---

## Success Criteria

1. Sticky navigation bar stays visible on scroll
2. Tab clicks smooth scroll to correct section
3. URL hash updates correctly
4. Active tab reflects current section
5. Catppuccin Mocha colors applied consistently
6. All charts readable on dark background
7. Section names simplified (no "View X")
8. Back button works with hash changes
