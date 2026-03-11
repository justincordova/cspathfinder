# Chat Drawer Slide Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When the AI chat drawer opens, smoothly slide the main content to the left instead of blocking it with an overlay, while maintaining overlay behavior on mobile screens.

**Architecture:** Extend ChatContext to expose existing `isOpen` state, modify layout.tsx main container to conditionally apply margin-right based on chat state and screen size, add smooth transitions.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS v4, TypeScript

---

### Task 1: Update layout.tsx to read chat context

**Files:**

- Modify: `src/app/layout.tsx`

**Step 1: Import useChatContext hook**

Add import at the top of file after existing imports:

```tsx
import { useChatContext } from "@/components/ChatProvider";
```

**Step 2: Extract layout to client component**

Since we need to use a client-side hook, convert the main layout component:

```tsx
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useChatContext();
  const marginClass = isOpen ? "md:mr-[420px] lg:mr-[420px]" : "";

  return (
    <main
      className={cn(
        "max-w-[960px] mx-auto px-8 transition-all duration-300 ease-in-out",
        marginClass
      )}
    >
      {children}
    </main>
  );
}
```

**Step 3: Update RootLayout to use the new component**

Replace the main element with the new LayoutContent component inside ChatProvider:

```tsx
<ChatProvider>
  <Navbar />
  <LayoutContent>{children}</LayoutContent>
  <ChatButton />
  <ChatDrawer />
</ChatProvider>
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(chat): add context-based margin to main container"
```

---

### Task 2: Test responsive behavior manually

**Files:**

- No files changed

**Step 1: Start dev server**

```bash
bun run dev
```

**Step 2: Verify desktop behavior**

- Open browser at http://localhost:3000
- Click chat button to open drawer
- Expected: Main content slides left smoothly (300ms animation)
- Expected: Chat drawer slides in from right
- Expected: Both visible side by side

**Step 3: Verify mobile behavior**

- Resize browser to <768px width
- Click chat button to open drawer
- Expected: Chat drawer overlays main content with backdrop
- Expected: Main content does NOT shift left on mobile
- Expected: Backdrop click closes drawer

**Step 4: Verify animation smoothness**

- Toggle chat open/close multiple times
- Expected: Smooth 300ms ease-in-out transition
- Expected: No layout shifts or flickering

**Step 5: Commit**

```bash
git commit --allow-empty -m "test(chat): verify responsive slide animation behavior"
```

---

### Task 3: Remove mobile overlay when chat opens

**Files:**

- Modify: `src/components/ChatDrawer.tsx`

**Step 1: Update overlay condition**

Modify lines 204-208 to only show overlay on mobile:

```tsx
{
  isOpen && (
    <div className="fixed inset-0 bg-crust/50 z-40 md:hidden" onClick={close} aria-hidden="true" />
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ChatDrawer.tsx
git commit -m "fix(chat): only show overlay on mobile screens"
```

---

### Task 4: Final verification

**Files:**

- No files changed

**Step 1: Run type check**

```bash
bun run type-check
```

Expected: No TypeScript errors

**Step 2: Run lint**

```bash
bun run lint
```

Expected: No linting errors

**Step 3: Manual smoke test**

- Open http://localhost:3000
- Test chat open/close on desktop
- Test chat open/close on tablet (768px+)
- Test chat open/close on mobile (<768px)
- Verify animations are smooth on all sizes
- Verify main content stays readable

**Step 4: Commit**

```bash
git commit --allow-empty -m "test(chat): final verification complete"
```
