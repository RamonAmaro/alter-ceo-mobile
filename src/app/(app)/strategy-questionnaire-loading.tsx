import { StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ProgressCircle } from "@/components/onboarding/progress-circle";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { getStrategyReportSteps } from "@/constants/strategy-report-loading-steps";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useStrategyReportGeneration } from "@/hooks/use-strategy-report-generation";
import { useStrategyReportStore } from "@/stores/strategy-report-store";

export default function StrategyQuestionnaireLoadingScreen() {
  const insets = useSafeAreaInsets();
  const { stepIndex, error } = useStrategyReportGeneration();
  const reportType = useStrategyReportStore((s) => s.reportType);
  const steps = getStrategyReportSteps(reportType);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const topPadding = { paddingTop: insets.top + Spacing.five };

  if (error) {
    return (
      <ScreenLayout maxWidth={900}>
        <View style={[styles.inner, topPadding]}>
          <View style={styles.content}>
            <ThemedText type="headingMd" style={styles.errorTitle}>
              Algo salió mal
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.errorMessage}>
              {error}
            </ThemedText>
          </View>
          <FooterActionBar>
            <Button
              label="Volver"
              onPress={() => router.replace("/(app)/strategy-questionnaire")}
            />
          </FooterActionBar>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout maxWidth={900}>
      <View style={[styles.inner, topPadding, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.content}>
          <ProgressCircle progress={step.percent} />
          <ThemedText type="bodyLg" style={styles.stepLabel}>
            {step.label}
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.helperText}>
            Estamos generando tu informe personalizado con el contexto que has dado.
          </ThemedText>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    color: SemanticColors.textSubtle,
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  helperText: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  errorTitle: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  errorMessage: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    paddingHorizontal: Spacing.two,
  },
});
