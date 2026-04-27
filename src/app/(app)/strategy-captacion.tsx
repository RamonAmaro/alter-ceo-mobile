import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { QuestionBody } from "@/components/onboarding/question-body";
import { QuestionHeader } from "@/components/onboarding/question-header";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR, USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useStrategyReportStore, type StrategyReportAnswer } from "@/stores/strategy-report-store";
import type { ReportInputType, ReportQuestion } from "@/types/report";
import { validateQuestionAnswer } from "@/utils/validate-question-answer";

function mapQuestionType(inputType: ReportInputType): "single" | "multi" | "text" | "integer" {
  switch (inputType) {
    case "multi_choice":
      return "multi";
    case "integer":
      return "integer";
    case "text":
      return "text";
    default:
      return "single";
  }
}

function buildProgress(currentQuestionIndex: number, totalQuestions: number): number {
  if (totalQuestions <= 1) return 100;
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
}

function getPlaceholder(question: ReportQuestion): string | undefined {
  if (question.input_type === "integer") return "Ej. 1000";
  if (question.input_type === "text") return "Escribe tu respuesta";
  return undefined;
}

export default function StrategyCaptacionScreen() {
  const insets = useSafeAreaInsets();
  const reportType = useStrategyReportStore((s) => s.reportType);
  const template = useStrategyReportStore((s) => s.template);
  const currentQuestionIndex = useStrategyReportStore((s) => s.currentQuestionIndex);
  const answers = useStrategyReportStore((s) => s.answers);
  const isLoading = useStrategyReportStore((s) => s.isLoading);
  const error = useStrategyReportStore((s) => s.error);
  const loadTemplate = useStrategyReportStore((s) => s.loadTemplate);
  const setAnswer = useStrategyReportStore((s) => s.setAnswer);
  const nextQuestion = useStrategyReportStore((s) => s.nextQuestion);
  const previousQuestion = useStrategyReportStore((s) => s.previousQuestion);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const finalSubmitRef = useRef(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  useEffect(() => {
    if (!reportType) {
      router.replace("/(app)/strategy");
      return;
    }
    void loadTemplate(reportType);
  }, [loadTemplate, reportType]);

  const questionCount = template?.questions.length ?? 0;
  const question = template?.questions[currentQuestionIndex] ?? null;
  const currentAnswer = question ? answers[question.key] : undefined;
  const nextEnabled = question
    ? validateQuestionAnswer(mapQuestionType(question.input_type), currentAnswer)
    : false;

  const viewQuestion = useMemo(() => {
    if (!question || !questionCount) return null;

    return {
      question: question.label,
      instruction: question.help_text ?? undefined,
      progress: buildProgress(currentQuestionIndex, questionCount),
      type: mapQuestionType(question.input_type),
      placeholder: getPlaceholder(question),
      options: question.options.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    };
  }, [currentQuestionIndex, question, questionCount]);

  function animateIn(): void {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function animateTransition(callback: () => void): void {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      callback();
      animateIn();
    });
  }

  function handleOptionPress(value: string): void {
    if (!question) return;

    if (question.input_type === "multi_choice") {
      const current = Array.isArray(currentAnswer) ? currentAnswer : [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      setAnswer(question.key, updated);
      return;
    }

    setAnswer(question.key, value);
  }

  function handleTextChange(text: string): void {
    if (!question) return;
    setAnswer(question.key, text);
  }

  function handleBack(): void {
    if (currentQuestionIndex > 0) {
      animateTransition(() => previousQuestion());
      return;
    }
    router.back();
  }

  function handleNext(): void {
    if (!question) return;

    if (currentQuestionIndex + 1 < questionCount) {
      animateTransition(() => nextQuestion());
      return;
    }

    if (finalSubmitRef.current) return;
    finalSubmitRef.current = true;
    setIsFinalSubmitting(true);
    router.push("/(app)/strategy-captacion-loading");
  }

  async function handleRetry(): Promise<void> {
    if (!reportType) return;
    await loadTemplate(reportType);
  }

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing.five }]}>
          <ActivityIndicator color={SemanticColors.success} size="large" />
          <ThemedText type="bodyLg" style={styles.helperText}>
            Cargando el cuestionario de captación...
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (error || !question || !viewQuestion) {
    return (
      <ScreenLayout>
        <View style={[styles.errorWrap, { paddingTop: insets.top + Spacing.five }]}>
          <View style={styles.errorContent}>
            <ThemedText type="headingMd" style={styles.errorTitle}>
              No hemos podido cargar el cuestionario
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.errorMessage}>
              {error ?? "Inténtalo de nuevo en unos segundos."}
            </ThemedText>
          </View>

          <View style={styles.errorActions}>
            <Button label="Reintentar" onPress={handleRetry} />
            <Button
              label="Volver"
              onPress={() => router.replace("/(app)/strategy")}
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withKeyboard>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom + Spacing.three,
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          keyboardShouldPersistTaps="handled"
        >
          <QuestionHeader planLabel="CAPTACIÓN" onBack={handleBack} />

          {question.section ? (
            <ThemedText type="labelSm" style={styles.sectionLabel}>
              {question.section}
            </ThemedText>
          ) : null}

          <QuestionBody
            question={viewQuestion}
            currentAnswer={currentAnswer as StrategyReportAnswer | undefined}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onOptionPress={handleOptionPress}
            onTextChange={handleTextChange}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={currentQuestionIndex + 1 === questionCount ? "Finalizar" : "Siguiente"}
            onPress={handleNext}
            disabled={!nextEnabled || isFinalSubmitting}
            loading={isFinalSubmitting}
            style={!nextEnabled ? styles.buttonDisabled : undefined}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  helperText: {
    color: SemanticColors.textSubtle,
    textAlign: "center",
  },
  sectionLabel: {
    color: SemanticColors.success,
    marginBottom: Spacing.one,
  },
  errorWrap: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: Spacing.four,
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  errorMessage: {
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    paddingHorizontal: Spacing.three,
  },
  errorActions: {
    gap: Spacing.two,
  },
  secondaryButton: {
    opacity: 0.75,
  },
});
