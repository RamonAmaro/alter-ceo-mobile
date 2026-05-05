import { describe, expect, it } from "vitest";

import { normalizeWebsiteUrl } from "./normalize-website-url";

describe("normalizeWebsiteUrl", () => {
  it("preserva protocolo quando já existe", () => {
    expect(normalizeWebsiteUrl("https://tunegocio.com")).toBe("https://tunegocio.com");
    expect(normalizeWebsiteUrl("http://tunegocio.com")).toBe("http://tunegocio.com");
  });

  it("adiciona https:// quando ausente", () => {
    expect(normalizeWebsiteUrl("tunegocio.com")).toBe("https://tunegocio.com");
    expect(normalizeWebsiteUrl("www.tunegocio.com")).toBe("https://www.tunegocio.com");
  });

  it("trata protocol-relative (//host) como https", () => {
    expect(normalizeWebsiteUrl("//tunegocio.com")).toBe("https://tunegocio.com");
  });

  it("retorna string vazia para input vazio ou só espaços", () => {
    expect(normalizeWebsiteUrl("")).toBe("");
    expect(normalizeWebsiteUrl("   ")).toBe("");
  });

  it("faz trim antes de normalizar", () => {
    expect(normalizeWebsiteUrl("  tunegocio.com  ")).toBe("https://tunegocio.com");
  });
});
