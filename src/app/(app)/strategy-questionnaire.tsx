import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { QuestionBody } from "@/components/onboarding/question-body";
import { QuestionHeader } from "@/components/onboarding/question-header";
import { ScreenLayout } from "@/components/screen-layout";
import { PrefilledDisclosure } from "@/components/strategies/prefilled-disclosure";
import { getStrategyByReportType } from "@/components/strategies/strategy-catalog";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR, USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { createReportRun } from "@/services/report-service";
import { useAuthStore } from "@/stores/auth-store";
import { useStrategiesStore } from "@/stores/strategies-store";
import { useStrategyReportStore, type StrategyReportAnswer } from "@/stores/strategy-report-store";
import type { ReportInputType, ReportQuestion } from "@/types/report";
import { buildStrategyAnswersPayload } from "@/utils/build-strategy-answers-payload";
import { toErrorMessage } from "@/utils/to-error-message";
import { validateQuestionAnswer } from "@/utils/validate-question-answer";

function mapQuestionType(
  inputType: ReportInputType,
): "single" | "multi" | "text" | "integer" | "scale" {
  switch (inputType) {
    case "multi_choice":
      return "multi";
    case "integer":
      return "integer";
    case "scale":
      return "scale";
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

export default function StrategyQuestionnaireScreen() {
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
  const discardDraft = useStrategyReportStore((s) => s.discardDraft);
  const userId = useAuthStore((s) => s.user?.userId);
  const trackPendingRun = useStrategiesStore((s) => s.trackPendingRun);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const finalSubmitRef = useRef(false);
  const isLeavingRef = useRef(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  useEffect(() => {
    if (isLeavingRef.current) return;
    if (!reportType) {
      router.replace("/(app)/strategy");
      return;
    }
    void loadTemplate(reportType);
  }, [loadTemplate, reportType]);

  const catalogEntry = reportType ? getStrategyByReportType(reportType) : undefined;
  const planLabel = catalogEntry?.shortTitle ?? template?.name?.toUpperCase() ?? "ESTRATEGIA";

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
      scaleMin: question.scale_min ?? undefined,
      scaleMax: question.scale_max ?? undefined,
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
    handleCancel();
  }

  function handlePreviousQuestion(): void {
    animateTransition(() => previousQuestion());
  }

  function handleCancel(): void {
    discardDraft();
    router.replace("/(app)/strategy");
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
    void submitGeneration();
  }

  async function submitGeneration(): Promise<void> {
    if (!userId || !reportType || !template) {
      finalSubmitRef.current = false;
      setIsFinalSubmitting(false);
      setSubmitError("No hay suficiente contexto para generar el informe.");
      return;
    }

    try {
      setSubmitError(null);
      const payload = buildStrategyAnswersPayload(
        template.questions,
        template.prefilled ?? [],
        answers,
      );
      const accepted = await createReportRun({
        user_id: userId,
        report_type: reportType,
        answers: payload,
      });
      await trackPendingRun(userId, accepted.run_id, reportType);
      isLeavingRef.current = true;
      router.replace("/(app)/strategies");
      discardDraft();
    } catch (err) {
      finalSubmitRef.current = false;
      setIsFinalSubmitting(false);
      setSubmitError(toErrorMessage(err));
    }
  }

  async function handleRetry(): Promise<void> {
    if (!reportType) return;
    await loadTemplate(reportType);
  }

  if (isLoading) {
    return (
      <ScreenLayout maxWidth={900}>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing.five }]}>
          <ActivityIndicator color={SemanticColors.success} size="large" />
          <ThemedText type="bodyLg" style={styles.helperText}>
            Cargando el cuestionario...
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (error || !question || !viewQuestion) {
    return (
      <ScreenLayout maxWidth={900}>
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
              style={styles.errorSecondaryButton}
            />
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withKeyboard maxWidth={900}>
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
          <QuestionHeader planLabel={planLabel} onBack={handleBack} />

          {currentQuestionIndex === 0 && template?.prefilled && template.prefilled.length > 0 ? (
            <View style={styles.prefilledWrap}>
              <PrefilledDisclosure fields={template.prefilled} />
            </View>
          ) : null}

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
          {submitError ? (
            <ThemedText type="bodySm" style={styles.submitErrorText}>
              {submitError}
            </ThemedText>
          ) : null}
          <View style={styles.footerActions}>
            <Pressable
              onPress={currentQuestionIndex === 0 ? handleCancel : handlePreviousQuestion}
              disabled={isFinalSubmitting}
              hitSlop={8}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
                isFinalSubmitting && styles.secondaryButtonDisabled,
              ]}
            >
              <Ionicons
                name={currentQuestionIndex === 0 ? "close" : "arrow-back"}
                size={14}
                color={SemanticColors.textPrimary}
              />
              <ThemedText style={styles.secondaryLabel}>
                {currentQuestionIndex === 0 ? "Cancelar" : "Volver"}
              </ThemedText>
            </Pressable>
            <Button
              label={currentQuestionIndex + 1 === questionCount ? "Finalizar" : "Siguiente"}
              icon={currentQuestionIndex + 1 === questionCount ? "checkmark" : "arrow-forward"}
              iconPosition="trailing"
              onPress={handleNext}
              disabled={!nextEnabled || isFinalSubmitting}
              loading={isFinalSubmitting}
              style={[styles.primaryButton, !nextEnabled && styles.buttonDisabled]}
            />
          </View>
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
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    width: "100%",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: Spacing.three,
    height: 43,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.32)",
  },
  secondaryButtonDisabled: {
    opacity: 0.4,
  },
  secondaryLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
  },
  primaryButton: {
    flex: 1,
    width: undefined,
    alignSelf: "auto",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  submitErrorText: {
    color: SemanticColors.error,
    textAlign: "center",
    marginBottom: Spacing.two,
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
  prefilledWrap: {
    marginBottom: Spacing.three,
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
  errorSecondaryButton: {
    opacity: 0.75,
  },
});
