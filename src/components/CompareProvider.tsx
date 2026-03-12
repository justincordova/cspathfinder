"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const MAX_COMPARE = 3;
const STORAGE_KEY = "cspathfinder-compare";

interface StoredEntry {
  slug: string;
  name: string;
}

function readFromStorage(): StoredEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Support both old (string[]) and new (StoredEntry[]) formats
      return (parsed as unknown[])
        .slice(0, MAX_COMPARE)
        .map((item) => {
          if (typeof item === "string") return { slug: item, name: item };
          if (item && typeof item === "object" && "slug" in item) {
            return {
              slug: String((item as StoredEntry).slug),
              name: String((item as StoredEntry).name || (item as StoredEntry).slug),
            };
          }
          return null;
        })
        .filter((item): item is StoredEntry => item !== null);
    }
  } catch {
    // ignore
  }
  return [];
}

function writeToStorage(entries: StoredEntry[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

interface CompareContextType {
  slugs: string[];
  names: Record<string, string>;
  add: (slug: string, name: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string, name: string) => void;
  isSelected: (slug: string) => boolean;
  clear: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function useCompareContext() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompareContext must be used within CompareProvider");
  return ctx;
}

export default function CompareProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  // Hydrate from sessionStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setEntries(readFromStorage()), []);

  const slugs = entries.map((e) => e.slug);
  const names: Record<string, string> = Object.fromEntries(entries.map((e) => [e.slug, e.name]));

  const add = useCallback((slug: string, name: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.slug === slug) || prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, { slug, name }];
      writeToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.slug !== slug);
      writeToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((slug: string, name: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.slug === slug)) {
        const next = prev.filter((e) => e.slug !== slug);
        writeToStorage(next);
        return next;
      }
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, { slug, name }];
      writeToStorage(next);
      return next;
    });
  }, []);

  const isSelected = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const clear = useCallback(() => {
    setEntries([]);
    writeToStorage([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        slugs,
        names,
        add,
        remove,
        toggle,
        isSelected,
        clear,
        isFull: slugs.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}
