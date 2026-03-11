# Chat Drawer Slide Animation

**Date:** 2026-03-11

## Overview

When the AI chat drawer opens, smoothly slide the main content to the left instead of blocking it with an overlay. On mobile screens, maintain the current overlay behavior.

## Requirements

- Slide main content left when chat opens on tablet+ (768px+)
- Maintain overlay behavior on mobile (<768px)
- 300ms ease-in-out animation
- Main content minimum width ~650px for readability
- Chat drawer width: 380px (mobile/tablet), 420px (desktop)

## Architecture

Extend ChatContext to expose the existing `isOpen` state. Main content container in layout.tsx subscribes to this context and conditionally applies margin-right based on chat state and screen size. No new state management needed.

## Components

- **ChatProvider**: Already exposes `isOpen` via context - no changes needed
- **layout.tsx**: Add conditional margin classes to main container based on `isOpen` state
- **ChatDrawer**: No changes required
- **ChatButton**: No changes required

## Implementation Details

### layout.tsx Changes

```tsx
// Add context hook and conditional classes
const { isOpen } = useChatContext();
const marginClass = isOpen ? "md:mr-[420px] lg:mr-[420px]" : "";
// Apply to main container with transition
<main className={cn("max-w-[960px] mx-auto px-8 transition-all duration-300 ease-in-out", marginClass)}>
```

### Responsive Behavior

- **Mobile (<768px)**: Overlay only (current behavior)
- **Tablet/Desktop (≥768px)**: Slide left with margin-right
- Chat drawer maintains existing z-50 layering

## Styling

- Uses existing Catppuccin color variables
- `transition-all duration-300 ease-in-out` for smooth animation
- Main content respects min-width ~650px constraint implicitly via max-width-[960px]

## Edge Cases

- Main content maintains readability at minimum width
- Mobile breakpoints ignore chat state entirely
- Existing chat state management unchanged
