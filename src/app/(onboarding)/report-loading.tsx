import { AppBackground } from "@/components/app-background";
import { ThemedText } from "@/components/themed-text";
import { STEPS } from "@/constants/report-loading-steps";
import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressCircle } from "./components/progress-circle";

export default function ReportLoadingScreen() {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            router.replace("/(onboarding)/completion");
          }, 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const step = STEPS[stepIndex];

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.content}>
          <ProgressCircle progress={step.percent} />

          <ThemedText type="bodyLg" style={styles.stepLabel}>
            {step.label}
          </ThemedText>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center" as const,
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
