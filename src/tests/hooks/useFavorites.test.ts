import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites, __resetForTesting } from "@/hooks/useFavorites";

beforeEach(() => {
  localStorage.clear();
  __resetForTesting();
});

describe("useFavorites", () => {
  it("starts with no favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.count).toBe(0);
    expect(result.current.favorites.size).toBe(0);
  });

  it("toggle adds a slug to favorites", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("mit");
    });
    expect(result.current.isFavorited("mit")).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it("toggle removes an already-favorited slug", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("mit");
    });
    act(() => {
      result.current.toggle("mit");
    });
    expect(result.current.isFavorited("mit")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("persists favorites to localStorage", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("stanford");
    });
    const stored = JSON.parse(localStorage.getItem("cspathfinder-favorites") ?? "[]");
    expect(stored).toContain("stanford");
  });

  it("hydrates from localStorage on mount", () => {
    localStorage.setItem("cspathfinder-favorites", JSON.stringify(["cmu", "caltech"]));
    __resetForTesting();
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorited("cmu")).toBe(true);
    expect(result.current.isFavorited("caltech")).toBe(true);
    expect(result.current.count).toBe(2);
  });

  it("syncs state across two hook instances", () => {
    const { result: a } = renderHook(() => useFavorites());
    const { result: b } = renderHook(() => useFavorites());
    act(() => {
      a.current.toggle("berkeley");
    });
    expect(b.current.isFavorited("berkeley")).toBe(true);
  });

  it("cleans up listener on unmount", () => {
    const { result, unmount } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("uw");
    });
    unmount();
    // After unmount, toggling from another instance should not throw
    const { result: b } = renderHook(() => useFavorites());
    act(() => {
      b.current.toggle("uw");
    });
    expect(b.current.isFavorited("uw")).toBe(false);
  });
});
