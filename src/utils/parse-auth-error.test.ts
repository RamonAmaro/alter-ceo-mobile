import { describe, expect, it } from "vitest";

import { ApiError } from "@/types/api";

import { parseAuthError } from "./parse-auth-error";

describe("parseAuthError", () => {
  it("input não-Error → mensagem genérica", () => {
    expect(parseAuthError(undefined)).toMatch(/error/i);
    expect(parseAuthError("string solta")).toMatch(/error/i);
    expect(parseAuthError({ random: 1 })).toMatch(/error/i);
  });

  it("ApiError 5xx → mensagem de servidor", () => {
    expect(parseAuthError(new ApiError(500, "Boom"))).toMatch(/servidor/i);
    expect(parseAuthError(new ApiError(503, "Down"))).toMatch(/servidor/i);
  });

  it("ApiError 401/403 → credenciais inválidas", () => {
    expect(parseAuthError(new ApiError(401, "HTTP 401"))).toMatch(/contraseña/i);
    expect(parseAuthError(new ApiError(403, "HTTP 403"))).toMatch(/contraseña/i);
  });

  it("ApiError 409 → conta já existe", () => {
    expect(parseAuthError(new ApiError(409, "HTTP 409"))).toMatch(/cuenta/i);
  });

  it("ApiError 422 → revisar dados", () => {
    expect(parseAuthError(new ApiError(422, "HTTP 422"))).toMatch(/datos/i);
  });

  it("preserva mensagem amigável do backend (não começa com HTTP)", () => {
    expect(parseAuthError(new ApiError(400, "Email já registrado"))).toBe("Email já registrado");
  });
});
