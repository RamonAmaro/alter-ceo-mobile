import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { StrategyTopicSelector } from "@/components/strategy/strategy-topic-selector";
import { EyebrowPill } from "@/components/ui/eyebrow-pill";
import { HeroOverviewCard } from "@/components/ui/hero-overview-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const beginDraft = useStrategyReportStore((s) => s.beginDraft);

  function handleSelectTopic(topic: string): void {
    if (topic !== "captacion") return;
    beginDraft("captacion_5_fases");
    router.push("/(app)/strategy-captacion");
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="bar-chart"
          titlePrefix="Crear"
          titleAccent="Estrategia"
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={false}
        >
          <EyebrowPill label="ESTRATEGIAS · ARSENAL" />

          <HeroOverviewCard
            eyebrow="PANEL DE COMANDO"
            headline="Construye tu plan de ataque"
            subhead="Elige un tema y ALTER generará un informe personalizado."
          />

          <View style={styles.sectionHeaderWrap}>
            <SectionHeading
              eyebrow="BIBLIOTECA TÁCTICA"
              titlePrefix="Elige tu"
              titleAccent="tema"
            />
          </View>

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
  sectionHeaderWrap: {
    marginTop: -Spacing.one,
  },
});
