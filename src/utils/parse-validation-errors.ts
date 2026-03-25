import type { ValidationError } from "@/types/api";

const FIELD_MESSAGES: Record<string, Record<string, string>> = {
  password: {
    string_too_short: "La contraseña debe tener al menos 8 caracteres",
    string_too_long: "La contraseña es demasiado larga",
  },
  email: {
    string_too_short: "Introduce un e-mail válido",
    value_error: "Introduce un e-mail válido",
  },
};

const FALLBACK_FIELD_MESSAGES: Record<string, string> = {
  password: "Contraseña no válida",
  email: "E-mail no válido",
  display_name: "Nombre no válido",
};

export function parseValidationErrors(
  errors: ValidationError[],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const error of errors) {
    const field = String(error.loc[error.loc.length - 1]);
    const byType = FIELD_MESSAGES[field]?.[error.type];
    const byField = FALLBACK_FIELD_MESSAGES[field];
    result[field] = byType ?? byField ?? "Valor no válido";
  }

  return result;
}
