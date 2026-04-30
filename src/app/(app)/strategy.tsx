import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { StrategyTopicSelector } from "@/components/strategy/strategy-topic-selector";
import { ThemedText } from "@/components/themed-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STRATEGY_CATALOG, type StrategyKey } from "@/components/strategies/strategy-catalog";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const userId = useAuthStore((s) => s.user?.userId);
  const latestPlan = usePlanStore((s) => s.latestPlan);
  const beginDraft = useStrategyReportStore((s) => s.beginDraft);

  function handleSelectTopic(key: StrategyKey): void {
    if (!userId) return;

    if (key === "plan_duplicacion") {
      if (latestPlan) {
        router.push("/(app)/plan-detail");
      } else {
        Alert.alert("Próximamente", "Esta estrategia estará disponible muy pronto.");
      }
      return;
    }

    const entry = STRATEGY_CATALOG.find((e) => e.key === key);
    if (!entry?.available || !entry.reportType) {
      Alert.alert("Próximamente", "Esta estrategia estará disponible muy pronto.");
      return;
    }

    beginDraft(userId, entry.reportType);
    router.push("/(app)/strategy-questionnaire");
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="bar-chart"
          titlePrefix="Estrategias"
          titleAccent="personalizadas"
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.heading}>
            <SectionHeading
              eyebrow="PANEL DE CONTROL"
              titlePrefix="Diseña estrategias para las"
              titleAccent="áreas clave"
              titleSuffix="de tu negocio."
            />
            <ThemedText style={styles.description}>
              Elige una, contesta el cuestionario y Alter CEO generará un informe personalizado.
            </ThemedText>
          </View>

          <ThemedText style={styles.gridLabel}>Crea una nueva estrategia.</ThemedText>

          <StrategyTopicSelector onSelect={handleSelectTopic} />
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textMuted,
  },
  gridLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 18,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
});
