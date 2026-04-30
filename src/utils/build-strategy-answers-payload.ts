import type { PrefilledField, ReportQuestion } from "@/types/report";

export function buildStrategyAnswersPayload(
  questions: readonly ReportQuestion[],
  prefilled: readonly PrefilledField[],
  answers: Record<string, string | string[]>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const question of questions) {
    const rawAnswer = answers[question.key];
    if (rawAnswer === undefined) continue;
    payload[question.key] =
      question.input_type === "integer" ? Number.parseInt(String(rawAnswer), 10) : rawAnswer;
  }

  // Backend removes kernel-resolvable questions from `questions` but the answers
  // model still expects those keys (extra="forbid"). Forward the user-validated
  // value if they edited it, otherwise the original prefilled value.
  for (const field of prefilled) {
    if (payload[field.key] !== undefined) continue;
    const userOverride = answers[field.key];
    payload[field.key] = userOverride !== undefined ? userOverride : field.value;
  }

  return payload;
}
