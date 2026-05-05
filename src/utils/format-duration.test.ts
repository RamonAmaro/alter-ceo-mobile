import { describe, expect, it } from "vitest";

import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("formata segundos abaixo de 1 minuto como MM:SS", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(5_000)).toBe("00:05");
    expect(formatDuration(59_000)).toBe("00:59");
  });

  it("formata minutos como MM:SS", () => {
    expect(formatDuration(60_000)).toBe("01:00");
    expect(formatDuration(125_000)).toBe("02:05");
    expect(formatDuration(59 * 60_000 + 59_000)).toBe("59:59");
  });

  it("formata horas como H:MM:SS", () => {
    expect(formatDuration(60 * 60_000)).toBe("1:00:00");
    expect(formatDuration(2 * 60 * 60_000 + 5 * 60_000 + 30_000)).toBe("2:05:30");
  });

  it("trunca milissegundos parciais para baixo", () => {
    expect(formatDuration(1_999)).toBe("00:01");
    expect(formatDuration(1)).toBe("00:00");
  });
});
