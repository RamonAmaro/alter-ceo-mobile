import type { Question } from "@/constants/onboarding-questions";
import type { Answer } from "@/stores/onboarding-store";

export function buildDefaultAnswers(questions: Question[]): Map<number, Answer> {
  const answers = new Map<number, Answer>();

  questions.forEach((question, index) => {
    if (question.type === "single" && question.options?.length) {
      answers.set(index, question.options[0].label);
    } else if (question.type === "multi" && question.options?.length) {
      answers.set(index, [question.options[0].label]);
    } else if (question.type === "text") {
      answers.set(index, question.placeholder ?? "https://www.example.com");
    }
  });

  return answers;
}
