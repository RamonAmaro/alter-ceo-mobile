import { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useStrategyReportStore } from "@/stores/strategy-report-store";

export default function StrategyCaptacionReadyScreen() {
  const insets = useSafeAreaInsets();
  const template = useStrategyReportStore((s) => s.template);
  const answers = useStrategyReportStore((s) => s.answers);
  const reset = useStrategyReportStore((s) => s.reset);

  useEffect(() => {
    if (!template) {
      router.replace("/(app)/strategy");
    }
  }, [template]);

  if (!template) return null;

  const answeredCount = template.questions.filter(
    (question) => answers[question.key] !== undefined,
  ).length;

  function handleBackToStrategy(): void {
    reset();
    router.replace("/(app)/strategy");
  }

  return (
    <ScreenLayout>
      <View style={[styles.inner, { paddingTop: insets.top + Spacing.five }]}>
        <View style={styles.content}>
          <ThemedText type="headingLg" style={styles.heading}>
            Cuestionario listo
          </ThemedText>
          <ThemedText type="bodyLg" style={styles.subtitle}>
            Ya estamos cargando y recorriendo el cuestionario real desde backend. En la siguiente
            iteración conectamos el envío de respuestas y la generación del informe.
          </ThemedText>

          <View style={styles.summaryCard}>
            <ThemedText type="labelMd" style={styles.summaryValue}>
              {answeredCount}/{template.questions.length}
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.summaryText}>
              preguntas completadas en {template.name}
            </ThemedText>
          </View>

          <ThemedText type="bodyMd" style={styles.note}>
            Tus respuestas siguen en memoria por si quieres revisarlas antes de seguir.
          </ThemedText>
        </View>

        <FooterActionBar>
          <View style={styles.footerContent}>
            <Button label="Revisar respuestas" onPress={() => router.back()} />

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleBackToStrategy}
              activeOpacity={0.7}
            >
              <ThemedText type="labelSm" style={styles.linkText}>
                Volver a Estrategia
              </ThemedText>
            </TouchableOpacity>
          </View>
        </FooterActionBar>
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
  heading: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  subtitle: {
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    paddingHorizontal: Spacing.two,
  },
  summaryCard: {
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 18,
    backgroundColor: SemanticColors.glassBackground,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    alignItems: "center",
    gap: Spacing.one,
  },
  summaryValue: {
    color: SemanticColors.success,
  },
  summaryText: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  note: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  footerContent: {
    alignItems: "center",
    gap: Spacing.three,
  },
  linkButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  linkText: {
    color: "#E8731A",
    textDecorationLine: "underline",
  },
});
