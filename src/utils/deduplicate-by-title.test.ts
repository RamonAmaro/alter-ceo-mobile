import { describe, expect, it } from "vitest";

import { deduplicateByTitle } from "./deduplicate-by-title";

describe("deduplicateByTitle", () => {
  it("preserva a primeira ocorrência de cada título", () => {
    const items = [
      { titulo: "A", value: 1 },
      { titulo: "B", value: 2 },
      { titulo: "A", value: 3 },
      { titulo: "C", value: 4 },
      { titulo: "B", value: 5 },
    ];
    expect(deduplicateByTitle(items)).toEqual([
      { titulo: "A", value: 1 },
      { titulo: "B", value: 2 },
      { titulo: "C", value: 4 },
    ]);
  });

  it("retorna array vazio para input vazio", () => {
    expect(deduplicateByTitle([])).toEqual([]);
  });

  it("preserva ordem original quando não há duplicatas", () => {
    const items = [{ titulo: "X" }, { titulo: "Y" }, { titulo: "Z" }];
    expect(deduplicateByTitle(items)).toEqual(items);
  });

  it("é case-sensitive (A ≠ a)", () => {
    const items = [{ titulo: "A" }, { titulo: "a" }, { titulo: "A" }];
    expect(deduplicateByTitle(items)).toEqual([{ titulo: "A" }, { titulo: "a" }]);
  });
});
