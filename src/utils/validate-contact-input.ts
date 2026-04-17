import {
  isInstagramUnavailableAnswer,
  isWebsiteUnavailableAnswer,
} from "@/utils/onboarding-contact-presence";

export type ContactValidationKind = "website" | "instagram";

interface ValidationResult {
  valid: boolean;
  message?: string;
}

const WEBSITE_HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})(?::\d{1,5})?(?:[/?#].*)?$/i;
const INSTAGRAM_HANDLE_PATTERN = /^@[A-Za-z0-9._]{1,29}$/;
const INSTAGRAM_URL_PATTERN = /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/i;

function normalizeWebsiteCandidate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
}

export function validateContactInput(
  kind: ContactValidationKind,
  answer: string | string[] | undefined,
): ValidationResult {
  if (typeof answer !== "string") {
    return { valid: false };
  }

  const trimmed = answer.trim();
  if (!trimmed) {
    return { valid: false };
  }

  if (kind === "website" && isWebsiteUnavailableAnswer(trimmed)) {
    return { valid: true };
  }

  if (kind === "instagram" && isInstagramUnavailableAnswer(trimmed)) {
    return { valid: true };
  }

  if (kind === "website") {
    const candidate = normalizeWebsiteCandidate(trimmed);
    const valid = WEBSITE_HOSTNAME_PATTERN.test(candidate);
    return valid
      ? { valid: true }
      : { valid: false, message: "Introduce una web válida, por ejemplo tunegocio.com" };
  }

  const valid = INSTAGRAM_HANDLE_PATTERN.test(trimmed) || INSTAGRAM_URL_PATTERN.test(trimmed);
  return valid
    ? { valid: true }
    : { valid: false, message: "Introduce un Instagram válido, por ejemplo @tunegocio" };
}
