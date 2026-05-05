import { Redirect, router, useLocalSearchParams } from "expo-router";

import { StrategyIntroScreen } from "@/components/strategy/strategy-intro-screen";
import { STRATEGY_CATALOG, type StrategyKey } from "@/components/strategies/strategy-catalog";
import { STRATEGY_INTROS } from "@/constants/strategy-intros";
import { useAuthStore } from "@/stores/auth-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";

export default function StrategyIntroPage() {
  const { strategyKey } = useLocalSearchParams<{ strategyKey: string }>();
  const userId = useAuthStore((s) => s.user?.userId);
  const beginDraft = useStrategyReportStore((s) => s.beginDraft);

  const content = strategyKey ? STRATEGY_INTROS[strategyKey as StrategyKey] : undefined;
  const catalogEntry = STRATEGY_CATALOG.find((entry) => entry.key === strategyKey);

  if (!content || !catalogEntry) {
    return <Redirect href="/(app)/strategy" />;
  }

  function handleContinue(): void {
    if (!userId || !catalogEntry) return;

    if (content?.hasInstructionsScreen) {
      router.push("/(app)/strategy-intro/mentalidad-instructions");
      return;
    }

    if (!catalogEntry.reportType) return;
    beginDraft(userId, catalogEntry.reportType);
    router.push("/(app)/strategy-questionnaire");
  }

  return <StrategyIntroScreen content={content} onContinue={handleContinue} />;
}
