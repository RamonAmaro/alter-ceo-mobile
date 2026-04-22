import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { MemoryOverviewCard } from "@/components/business-memory/memory-overview-card";
import { StepsGrid } from "@/components/business-memory/steps-grid";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { type BusinessMemoryStep } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useRouter, type Href } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BusinessMemoryIndexScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const router = useRouter();
  const { error, isLoading, progress, refresh, steps } = useBusinessMemoryDashboard();

  function handleStepPress(step: BusinessMemoryStep): void {
    router.push(`/(app)/business-memory/${step.id}` as Href);
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          titlePrefix="Memoria"
          titleAccent="de negocio"
          icon="briefcase"
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.eyebrowPill}>
            <View style={styles.eyebrowDot} />
            <ThemedText style={styles.eyebrowText}>RESUMEN · CARTOGRAFÍA</ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.feedbackCard}>
              <ThemedText style={styles.feedbackTitle}>Cargando memoria de negocio</ThemedText>
              <ThemedText style={styles.feedbackDescription}>
                Estamos trayendo tus secciones y porcentajes desde el backend.
              </ThemedText>
            </View>
          ) : error || !progress ? (
            <View style={styles.feedbackCard}>
              <ThemedText style={styles.feedbackTitle}>No pudimos cargar la memoria</ThemedText>
              <ThemedText style={styles.feedbackDescription}>
                {error ?? "Intentalo de nuevo en unos segundos."}
              </ThemedText>
              <Button label="Reintentar" onPress={refresh} style={styles.retryButton} />
            </View>
          ) : (
            <MemoryOverviewCard progress={progress} />
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <ThemedText style={styles.sectionEyebrow}>ESTADO ACTUAL</ThemedText>
          </View>

          <ThemedText style={styles.sectionTitle}>
            Explora tus <ThemedText style={styles.sectionTitleAccent}>bloques</ThemedText>
          </ThemedText>

          {!isLoading && !error ? <StepsGrid steps={steps} onStepPress={handleStepPress} /> : null}
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
    gap: Spacing.four,
  },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  eyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrowText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.one,
  },
  sectionAccent: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  sectionEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  sectionTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    paddingHorizontal: Spacing.three,
    marginTop: -Spacing.two,
  },
  sectionTitleAccent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 28,
    color: SemanticColors.success,
    fontStyle: "italic",
  },
  feedbackCard: {
    marginHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.two,
    alignItems: "center",
  },
  feedbackTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  feedbackDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 320,
  },
  retryButton: {
    marginTop: Spacing.two,
  },
});
