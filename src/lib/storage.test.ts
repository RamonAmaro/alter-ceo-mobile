import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getAllKeys: vi.fn(),
  },
}));

const { storage } = await import("./storage");

describe("storage.versionedKey", () => {
  it("constrói chave padrão version:domain", () => {
    expect(storage.versionedKey("v1", "auth")).toBe("v1:auth");
  });

  it("aceita segmentos extras", () => {
    expect(storage.versionedKey("v1", "onboarding", "draft", "user-123")).toBe(
      "v1:onboarding:draft:user-123",
    );
  });

  it("ignora segmentos extras vazios (userId opcional)", () => {
    expect(storage.versionedKey("v1", "auth", "")).toBe("v1:auth");
  });

  it("lança se version for vazia", () => {
    expect(() => storage.versionedKey("", "auth")).toThrow(/version/);
  });

  it("lança se domain for vazio", () => {
    expect(() => storage.versionedKey("v1", "")).toThrow(/domain/);
  });
});
