import { isAxiosError } from "axios";

import { ApiError } from "@/types/api";

const GENERIC_ERROR_MESSAGE = "Ha ocurrido un error. Inténtalo de nuevo.";
const SERVER_ERROR_MESSAGE = "Ha ocurrido un problema en el servidor. Inténtalo de nuevo.";
const TIMEOUT_ERROR_MESSAGE = "La solicitud ha tardado demasiado. Inténtalo de nuevo.";
const NETWORK_ERROR_MESSAGE =
  "No hemos podido conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

function isTechnicalMessage(message: string): boolean {
  const normalizedMessage = message.trim().toLowerCase();

  return (
    normalizedMessage.startsWith("timeout of ") ||
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("network error") ||
    normalizedMessage.includes("econnaborted") ||
    normalizedMessage.includes("err_network") ||
    normalizedMessage.includes("sse connection timeout") ||
    normalizedMessage.includes("sse connection error") ||
    normalizedMessage.startsWith("http ")
  );
}

function fromApiError(error: ApiError): string {
  if (error.status === 408 || error.status === 504) {
    return TIMEOUT_ERROR_MESSAGE;
  }

  if (error.status >= 500) {
    return SERVER_ERROR_MESSAGE;
  }

  if (error.message && !isTechnicalMessage(error.message)) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGE;
}

function fromAxiosError(error: unknown): string | null {
  if (!isAxiosError(error)) return null;

  const normalizedMessage = error.message.trim().toLowerCase();

  if (error.code === "ECONNABORTED" || normalizedMessage.includes("timeout")) {
    return TIMEOUT_ERROR_MESSAGE;
  }

  if (error.code === "ERR_NETWORK" || normalizedMessage.includes("network error")) {
    return NETWORK_ERROR_MESSAGE;
  }

  return null;
}

function fromPlainMessage(message: string): string {
  if (!message.trim()) return GENERIC_ERROR_MESSAGE;

  if (isTechnicalMessage(message)) {
    const normalizedMessage = message.trim().toLowerCase();

    if (normalizedMessage.includes("timeout")) {
      return TIMEOUT_ERROR_MESSAGE;
    }

    if (
      normalizedMessage.includes("network error") ||
      normalizedMessage.includes("err_network") ||
      normalizedMessage.includes("connection")
    ) {
      return NETWORK_ERROR_MESSAGE;
    }

    return GENERIC_ERROR_MESSAGE;
  }

  return message;
}

export function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return fromApiError(err);
  }

  const axiosMessage = fromAxiosError(err);
  if (axiosMessage) {
    return axiosMessage;
  }

  if (err instanceof Error) {
    return fromPlainMessage(err.message);
  }

  if (typeof err === "string") {
    return fromPlainMessage(err);
  }

  return GENERIC_ERROR_MESSAGE;
}
