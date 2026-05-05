import { describe, expect, it } from "vitest";

import { formatTimer } from "./format-timer";

describe("formatTimer", () => {
  it("formata como M:SS sem horas", () => {
    expect(formatTimer(0)).toBe("0:00");
    expect(formatTimer(5_000)).toBe("0:05");
    expect(formatTimer(65_000)).toBe("1:05");
    expect(formatTimer(3_600_000)).toBe("60:00");
  });

  it("nunca produz negativo", () => {
    expect(formatTimer(-100)).toBe("0:00");
    expect(formatTimer(-1_000_000)).toBe("0:00");
  });

  it("trunca ms parciais", () => {
    expect(formatTimer(999)).toBe("0:00");
    expect(formatTimer(1_999)).toBe("0:01");
  });
});
