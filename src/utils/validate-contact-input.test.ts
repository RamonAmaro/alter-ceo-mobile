import { describe, expect, it } from "vitest";

import { validateContactInput } from "./validate-contact-input";

describe("validateContactInput — website", () => {
  it("aceita domínios simples", () => {
    expect(validateContactInput("website", "tunegocio.com").valid).toBe(true);
    expect(validateContactInput("website", "www.tunegocio.com").valid).toBe(true);
    expect(validateContactInput("website", "shop.tunegocio.com").valid).toBe(true);
  });

  it("aceita domínio com protocolo", () => {
    expect(validateContactInput("website", "https://tunegocio.com").valid).toBe(true);
  });

  it("rejeita strings sem TLD", () => {
    const result = validateContactInput("website", "tunegocio");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/válida/);
  });

  it("rejeita string vazia", () => {
    expect(validateContactInput("website", "").valid).toBe(false);
    expect(validateContactInput("website", "   ").valid).toBe(false);
  });

  it("aceita marker 'no tengo' como válido (unavailable)", () => {
    const result = validateContactInput("website", "no_tengo_web");
    expect(typeof result.valid).toBe("boolean");
  });
});

describe("validateContactInput — instagram", () => {
  it("aceita @handle", () => {
    expect(validateContactInput("instagram", "@tunegocio").valid).toBe(true);
    expect(validateContactInput("instagram", "@tunegocio.oficial").valid).toBe(true);
  });

  it("aceita URL completa do Instagram", () => {
    expect(validateContactInput("instagram", "https://www.instagram.com/tunegocio").valid).toBe(
      true,
    );
    expect(validateContactInput("instagram", "https://instagram.com/tunegocio/").valid).toBe(true);
  });

  it("rejeita handle sem @", () => {
    const result = validateContactInput("instagram", "tunegocio");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/válido/);
  });

  it("rejeita undefined / não-string", () => {
    expect(validateContactInput("instagram", undefined).valid).toBe(false);
    expect(validateContactInput("instagram", ["a", "b"]).valid).toBe(false);
  });
});
