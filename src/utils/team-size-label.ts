import type { TeamSizeRange } from "@/types/plan";

const LABELS: Record<TeamSizeRange, string> = {
  no_business: "Sin negocio",
  solo: "Autónomo",
  one_to_three: "1 a 3 personas",
  four_to_ten: "4 a 10 personas",
  eleven_to_thirty: "11 a 30 personas",
  thirty_to_sixty: "30 a 60 personas",
  sixty_to_hundred: "60 a 100 personas",
  over_hundred: "Más de 100 personas",
};

export function teamSizeLabel(
  range?: TeamSizeRange,
  fallback?: number,
): string | undefined {
  if (range && LABELS[range]) return LABELS[range];
  if (typeof fallback === "number" && fallback > 0) {
    return `${fallback} ${fallback === 1 ? "persona" : "personas"}`;
  }
  return undefined;
}
