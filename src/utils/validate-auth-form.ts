export function validateRequiredFields<T extends Record<string, string>>(
  fields: T,
): { [K in keyof T]: boolean } {
  const errors = {} as { [K in keyof T]: boolean };
  for (const key of Object.keys(fields) as (keyof T)[]) {
    errors[key] = (fields[key] as string).trim().length === 0;
  }
  return errors;
}

export function hasErrors<T extends Record<string, boolean>>(errors: T): boolean {
  return Object.values(errors).some(Boolean);
}
