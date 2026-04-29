import { ApiError } from "@/types/api";

export function parseAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return "Error del servidor. Inténtalo de nuevo más tarde";
    }
    if (error.message && !error.message.startsWith("HTTP ")) {
      return error.message;
    }
    if (error.status === 401 || error.status === 403) {
      return "Correo o contraseña incorrectos";
    }
    if (error.status === 409) {
      return "Ya existe una cuenta con este correo";
    }
    if (error.status === 422) {
      return "Por favor, revisa los datos introducidos";
    }
  }
  return "Ha ocurrido un error. Inténtalo de nuevo";
}
