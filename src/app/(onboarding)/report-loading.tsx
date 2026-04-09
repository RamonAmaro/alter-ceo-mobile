import { StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ProgressCircle } from "@/components/onboarding/progress-circle";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { STEPS } from "@/constants/report-loading-steps";
import { SemanticColors, Spacing } from "@/constants/theme";
import { usePlanGeneration } from "@/hooks/use-plan-generation";

export default function ReportLoadingScreen() {
  const insets = useSafeAreaInsets();
  const { stepIndex, error } = usePlanGeneration();
  const step = STEPS[stepIndex];

  const topPadding = { paddingTop: insets.top + Spacing.five };

  if (error) {
    return (
      <ScreenLayout>
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
            <Button label="Volver" onPress={() => router.back()} />
          </FooterActionBar>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={[styles.inner, topPadding, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.content}>
          <ProgressCircle progress={step.percent} />
          <ThemedText type="bodyLg" style={styles.stepLabel}>
            {step.label}
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
