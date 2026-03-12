import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/components/ChatProvider", () => ({
  useChatContext: () => ({
    isOpen: false,
    close: vi.fn(),
    applyFilters: vi.fn(),
  }),
}));

// Import after mocks
// We test parseFilterBlock by extracting it indirectly through the module.
// Since it's not exported, we test its behavior via the rendered component output.
// Instead, we test the schema-based parsing logic directly here.

import { ChatFiltersSchema } from "@/lib/data/schema";

// Mirror of parseFilterBlock logic for unit testing
const FILTER_REGEX = /```filter\n([\s\S]*?)\n```/;
function parseFilterBlock(text: string): { cleanText: string; filters: unknown | null } {
  const match = text.match(FILTER_REGEX);
  if (!match) return { cleanText: text, filters: null };
  try {
    const parsed = ChatFiltersSchema.safeParse(JSON.parse(match[1]));
    if (!parsed.success) return { cleanText: text, filters: null };
    const cleanText = text.replace(FILTER_REGEX, "").trim();
    return { cleanText, filters: parsed.data };
  } catch {
    return { cleanText: text, filters: null };
  }
}

describe("parseFilterBlock", () => {
  it("returns original text and null filters when no filter block present", () => {
    const result = parseFilterBlock("Hello world");
    expect(result.cleanText).toBe("Hello world");
    expect(result.filters).toBeNull();
  });

  it("extracts valid filter block", () => {
    const text = 'Here are results\n```filter\n{"sortBy":"csRanking","sortDir":"asc"}\n```';
    const result = parseFilterBlock(text);
    expect(result.filters).toEqual({ sortBy: "csRanking", sortDir: "asc" });
    expect(result.cleanText).toBe("Here are results");
  });

  it("returns null filters for invalid JSON", () => {
    const text = "```filter\nnot-json\n```";
    const result = parseFilterBlock(text);
    expect(result.filters).toBeNull();
  });

  it("returns null filters for invalid sortDir", () => {
    const text = '```filter\n{"sortDir":"sideways"}\n```';
    const result = parseFilterBlock(text);
    expect(result.filters).toBeNull();
  });

  it("handles filter block with state and region", () => {
    const text =
      'Schools in CA:\n```filter\n{"state":"CA","region":"West","sortBy":"tuitionInState","sortDir":"asc"}\n```';
    const result = parseFilterBlock(text);
    expect(result.filters).toMatchObject({ state: "CA", region: "West" });
    expect(result.cleanText).toBe("Schools in CA:");
  });

  it("returns empty object for filter block with only unknown keys (they get stripped by Zod)", () => {
    const text = '```filter\n{"unknownField":"value"}\n```';
    const result = parseFilterBlock(text);
    // Zod strips unknown keys, parse should succeed with empty object
    expect(result.filters).toEqual({});
  });
});

// Mirror of the full parseBlocks function from ChatDrawer.tsx
const SUGGESTIONS_REGEX = /```suggestions\n([\s\S]*?)\n```/;
function parseBlocks(text: string): {
  cleanText: string;
  filters: unknown | null;
  suggestions: string[];
} {
  if (typeof text !== "string") return { cleanText: "", filters: null, suggestions: [] };

  let cleanText = text;
  let filters: unknown | null = null;
  let suggestions: string[] = [];

  const filterMatch = cleanText.match(FILTER_REGEX);
  if (filterMatch) {
    try {
      const parsed = ChatFiltersSchema.safeParse(JSON.parse(filterMatch[1]));
      if (parsed.success) filters = parsed.data;
    } catch {
      // ignore
    }
    cleanText = cleanText.replace(FILTER_REGEX, "").trim();
  }

  const suggestionsMatch = cleanText.match(SUGGESTIONS_REGEX);
  if (suggestionsMatch) {
    try {
      const parsed = JSON.parse(suggestionsMatch[1]);
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
        suggestions = parsed.slice(0, 3);
      }
    } catch {
      // ignore
    }
    cleanText = cleanText.replace(SUGGESTIONS_REGEX, "").trim();
  }

  return { cleanText, filters, suggestions };
}

describe("parseBlocks (full — filters + suggestions)", () => {
  it("parses text with both filter and suggestions blocks", () => {
    const text = [
      "Here are results",
      '```filter\n{"sortBy":"csRanking","sortDir":"asc"}\n```',
      '```suggestions\n["Follow-up question 1?","Follow-up question 2?"]\n```',
    ].join("\n");
    const result = parseBlocks(text);
    expect(result.cleanText).toBe("Here are results");
    expect(result.filters).toEqual({ sortBy: "csRanking", sortDir: "asc" });
    expect(result.suggestions).toEqual(["Follow-up question 1?", "Follow-up question 2?"]);
  });

  it("returns empty suggestions array when no suggestions block", () => {
    const result = parseBlocks("Just some text");
    expect(result.suggestions).toEqual([]);
  });

  it("caps suggestions at 3 items", () => {
    const text = '```suggestions\n["Q1?","Q2?","Q3?","Q4?","Q5?"]\n```';
    const result = parseBlocks(text);
    expect(result.suggestions).toHaveLength(3);
  });

  it("ignores suggestions block with non-string items", () => {
    const text = "```suggestions\n[1, 2, 3]\n```";
    const result = parseBlocks(text);
    expect(result.suggestions).toEqual([]);
    // cleanText gets the block stripped even when suggestions parse fails
  });

  it("ignores suggestions block with invalid JSON", () => {
    const text = "```suggestions\nnot-json\n```";
    const result = parseBlocks(text);
    expect(result.suggestions).toEqual([]);
  });

  it("handles non-string input gracefully", () => {
    // @ts-expect-error: intentionally passing wrong type for robustness test
    const result = parseBlocks(null);
    expect(result.cleanText).toBe("");
    expect(result.filters).toBeNull();
    expect(result.suggestions).toEqual([]);
  });

  it("removes both blocks from cleanText leaving only the prose", () => {
    const prose = "MIT has excellent CS programs.";
    const text = [
      prose,
      '```filter\n{"sortBy":"csRanking"}\n```',
      '```suggestions\n["What about research?","Compare MIT and Stanford?"]\n```',
    ].join("\n");
    const result = parseBlocks(text);
    expect(result.cleanText).toBe(prose);
  });
});
