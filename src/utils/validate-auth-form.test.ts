import { describe, expect, it } from "vitest";

import { hasErrors, validateRequiredFields } from "./validate-auth-form";

describe("validateRequiredFields", () => {
  it("marca campos vazios como erro", () => {
    const result = validateRequiredFields({ email: "", password: "" });
    expect(result).toEqual({ email: true, password: true });
  });

  it("marca apenas o campo vazio", () => {
    const result = validateRequiredFields({ email: "user@example.com", password: "" });
    expect(result).toEqual({ email: false, password: true });
  });

  it("trata strings só com espaços como vazias", () => {
    const result = validateRequiredFields({ email: "   ", password: "abc" });
    expect(result).toEqual({ email: true, password: false });
  });

  it("nenhum erro quando todos preenchidos", () => {
    const result = validateRequiredFields({ a: "x", b: "y", c: "z" });
    expect(result).toEqual({ a: false, b: false, c: false });
  });
});

describe("hasErrors", () => {
  it("retorna true se algum valor for true", () => {
    expect(hasErrors({ a: false, b: true })).toBe(true);
    expect(hasErrors({ a: true })).toBe(true);
  });

  it("retorna false se todos forem false", () => {
    expect(hasErrors({ a: false, b: false })).toBe(false);
  });

  it("retorna false para objeto vazio", () => {
    expect(hasErrors({})).toBe(false);
  });
});
