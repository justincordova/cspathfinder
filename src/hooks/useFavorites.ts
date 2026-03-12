"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "cspathfinder-favorites";

function readFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function writeToStorage(favorites: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Hydrate from localStorage after mount to avoid SSR mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setFavorites(readFromStorage()), []);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      writeToStorage(next);
      return next;
    });
  }, []);

  const isFavorited = useCallback((slug: string) => favorites.has(slug), [favorites]);

  return { favorites, toggle, isFavorited, count: favorites.size };
}
