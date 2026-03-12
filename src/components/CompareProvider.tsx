"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const MAX_COMPARE = 3;
const STORAGE_KEY = "cspathfinder-compare";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return (parsed as string[]).slice(0, MAX_COMPARE);
  } catch {
    // ignore
  }
  return [];
}

function writeToStorage(slugs: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // ignore
  }
}

interface CompareContextType {
  slugs: string[];
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => void;
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
  const [slugs, setSlugs] = useState<string[]>([]);

  // Hydrate from sessionStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSlugs(readFromStorage()), []);

  const add = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug) || prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, slug];
      writeToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.filter((s) => s !== slug);
      writeToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) {
        const next = prev.filter((s) => s !== slug);
        writeToStorage(next);
        return next;
      }
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, slug];
      writeToStorage(next);
      return next;
    });
  }, []);

  const isSelected = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const clear = useCallback(() => {
    setSlugs([]);
    writeToStorage([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{ slugs, add, remove, toggle, isSelected, clear, isFull: slugs.length >= MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  );
}
