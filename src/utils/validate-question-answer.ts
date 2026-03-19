export function validateQuestionAnswer(
  questionType: string,
  answer: string | string[] | undefined,
): boolean {
  if (questionType === "audio") return false;

  if (questionType === "text") {
    return typeof answer === "string" && answer.trim() !== "";
  }

  if (questionType === "multi") {
    return Array.isArray(answer) && answer.length > 0;
  }

  return typeof answer === "string" && answer !== "";
}
