import { describe, expect, it } from "vitest";

import { ApiError } from "@/types/api";

import { toErrorMessage } from "./to-error-message";

describe("toErrorMessage", () => {
  it("retorna mensagem genérica para input inesperado", () => {
    expect(toErrorMessage(undefined)).toMatch(/error/i);
    expect(toErrorMessage(null)).toMatch(/error/i);
    expect(toErrorMessage(42)).toMatch(/error/i);
  });

  it("preserva mensagem de Error não-técnica", () => {
    expect(toErrorMessage(new Error("Sesión caducada"))).toBe("Sesión caducada");
  });

  it("substitui mensagens técnicas por texto amigável em es-ES", () => {
    expect(toErrorMessage(new Error("Network Error"))).toMatch(/conex/i);
    expect(toErrorMessage(new Error("timeout of 30000ms exceeded"))).toMatch(/tardado|tiempo/i);
  });

  it("ApiError 5xx → mensagem de servidor", () => {
    const err = new ApiError(503, "Service Unavailable");
    expect(toErrorMessage(err)).toMatch(/servidor/i);
  });

  it("ApiError 408/504 → mensagem de timeout", () => {
    expect(toErrorMessage(new ApiError(408, "Timeout"))).toMatch(/tardado|tiempo/i);
    expect(toErrorMessage(new ApiError(504, "Gateway Timeout"))).toMatch(/tardado|tiempo/i);
  });

  it("ApiError com mensagem amigável é preservada", () => {
    const err = new ApiError(400, "El correo ya existe");
    expect(toErrorMessage(err)).toBe("El correo ya existe");
  });

  it("string simples é tratada como mensagem", () => {
    expect(toErrorMessage("Acceso denegado")).toBe("Acceso denegado");
  });
});
