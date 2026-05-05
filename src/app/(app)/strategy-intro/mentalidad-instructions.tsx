import { router } from "expo-router";

import { MentalidadInstructionsScreen } from "@/components/strategy/mentalidad-instructions-screen";
import { STRATEGY_CATALOG } from "@/components/strategies/strategy-catalog";
import { MENTALIDAD_INSTRUCTIONS } from "@/constants/strategy-intros";
import { useAuthStore } from "@/stores/auth-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";

export default function MentalidadInstructionsPage() {
  const userId = useAuthStore((s) => s.user?.userId);
  const beginDraft = useStrategyReportStore((s) => s.beginDraft);

  function handleStart(): void {
    if (!userId) return;
    const entry = STRATEGY_CATALOG.find((e) => e.key === "test_mentalidad");
    if (!entry?.reportType) return;
    beginDraft(userId, entry.reportType);
    router.push("/(app)/strategy-questionnaire");
  }

  return (
    <MentalidadInstructionsScreen content={MENTALIDAD_INSTRUCTIONS} onContinue={handleStart} />
  );
}
