import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { STRATEGY_CATALOG, type StrategyKey } from "@/components/strategies/strategy-catalog";
import { StrategyTopicSelector } from "@/components/strategy/strategy-topic-selector";
import { ThemedText } from "@/components/themed-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { STRATEGY_INTROS } from "@/constants/strategy-intros";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.userId);
  const setOpenedFromApp = useOnboardingStore((s) => s.setOpenedFromApp);

  function handleSelectTopic(key: StrategyKey): void {
    if (!userId) return;

    if (key === "plan_duplicacion") {
      setOpenedFromApp(true);
      router.push("/(onboarding)/welcome");
      return;
    }

    const entry = STRATEGY_CATALOG.find((e) => e.key === key);
    if (!entry?.available) {
      Alert.alert("Próximamente", "Esta estrategia estará disponible muy pronto.");
      return;
    }

    if (!STRATEGY_INTROS[key]) {
      Alert.alert("Próximamente", "Esta estrategia estará disponible muy pronto.");
      return;
    }

    router.push(`/(app)/strategy-intro/${key}`);
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="bar-chart"
          titlePrefix="Estrategias"
          titleAccent="personalizadas"
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
