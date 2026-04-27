import type { QuestionValidationKind } from "@/constants/onboarding-questions";
import { isNoBusinessAnswer } from "@/utils/onboarding-contact-presence";
import { validateContactInput } from "@/utils/validate-contact-input";

export function validateQuestionAnswer(
  questionType: string,
  answer: string | string[] | undefined,
  validationKind?: QuestionValidationKind,
): boolean {
  if (questionType === "audio") return false;

  if (questionType === "text") {
    if (validationKind) {
      return validateContactInput(validationKind, answer).valid;
    }
    return typeof answer === "string" && answer.trim() !== "";
  }

  if (questionType === "integer") {
    if (isNoBusinessAnswer(answer)) return true;
    return typeof answer === "string" && /^\d+$/.test(answer.trim());
  }

  if (questionType === "multi") {
    return Array.isArray(answer) && answer.length > 0;
  }

  return typeof answer === "string" && answer !== "";
}
