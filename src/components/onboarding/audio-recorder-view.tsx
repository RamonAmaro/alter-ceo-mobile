import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import { CountdownOverlay } from "@/components/countdown-overlay";
import { AudioDoneActions } from "@/components/onboarding/audio-done-actions";
import { AudioRecorderHeader } from "@/components/onboarding/audio-recorder-header";
import { AudioRecorderStatus } from "@/components/onboarding/audio-recorder-status";
import { RecordButton } from "@/components/record-button";
import { ThemedText } from "@/components/themed-text";
import { AUDIO_MIN_DURATION_MS } from "@/constants/audio";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { getExpressQuestions, getProfessionalQuestions } from "@/constants/onboarding-questions";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { useOnboardingRecorder } from "@/hooks/use-onboarding-recorder";
import { useOnboardingStore } from "@/stores/onboarding-store";

interface AudioRecorderViewProps {
  onConfirm: (uri: string, transcript: string | null) => void;
  onBack: () => void;
}

export function AudioRecorderView({
  onConfirm,
  onBack,
}: AudioRecorderViewProps): React.ReactElement | null {
  const insets = useSafeAreaInsets();
  const planType = useOnboardingStore((s) => s.planType);
  const currentQuestionIndex = useOnboardingStore((s) => s.currentQuestionIndex);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const addAudioRecord = useOnboardingStore((s) => s.addAudioRecord);
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmingRef = useRef(false);

  const questions = useMemo(
    () => (planType === "professional" ? getProfessionalQuestions() : getExpressQuestions()),
    [planType],
  );

  const question = questions[currentQuestionIndex];

  useEffect(() => {
    confirmingRef.current = false;
    setIsConfirming(false);
  }, [currentQuestionIndex]);

  const {
    recordState,
    elapsedMs,
    result,
    transcriptionError,
    amplitudeRef,
    handleRecord,
    handlePause,
    handleResume,
    handleFinish,
    handleRestart,
    handleCountdownComplete,
  } = useOnboardingRecorder(currentQuestionIndex);

  if (!question) return null;

  function handleConfirm(): void {
    if (confirmingRef.current) return;

    confirmingRef.current = true;
    setIsConfirming(true);

    const uri = result?.uri ?? "";
    const transcript = result?.transcript ?? null;

    setAnswer(currentQuestionIndex, `[audio_recorded]:${uri}`);
    if (planType) {
      addAudioRecord({
        uri,
        origin: planType,
        questionIndex: currentQuestionIndex,
        question: question?.question ?? "",
        transcript,
      });
    }

    try {
      onConfirm(uri, transcript);
    } finally {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  }

  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";
  const isRecordingActive = recordState === "recording";
  const planLabel = planType === "professional" ? "PROFESIONAL" : "EXPRESS";
  const showControls =
    recordState !== "preparing" && recordState !== "done" && recordState !== "finishing";
  const canFinish = elapsedMs >= AUDIO_MIN_DURATION_MS;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom },
      ]}
    >
      <AudioRecorderHeader planLabel={planLabel} onBack={onBack} />

      <ScrollView
        style={styles.topSection}
        contentContainerStyle={styles.topContent}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemedText type="headingLg" style={styles.whiteText}>
          {question.instruction ||
            "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:"}
        </ThemedText>

        <ThemedText type="bodyLg" style={styles.questionText}>
          {question.question}
        </ThemedText>

        <ThemedText type="labelMd" style={styles.progressText}>
          ({question.progress}%)
        </ThemedText>
      </ScrollView>

      <View style={styles.recordWrapper}>
        <View style={styles.separator} />
        <LinearGradient
          colors={["rgba(0,255,255,0.15)", "transparent"]}
          style={styles.recordGradient}
        >
          <AudioRecorderStatus
            recordState={recordState}
            elapsedMs={elapsedMs}
            result={result}
            transcriptionError={transcriptionError}
            amplitudeRef={amplitudeRef}
            isRecordingActive={isRecordingActive}
          />

          {recordState === "done" && (
            <AudioDoneActions
              onRestart={handleRestart}
              onConfirm={handleConfirm}
              confirmLoading={isConfirming}
            />
          )}

          {showControls && (
            <RecordButton
              state={isRecordingOrPaused ? recordState : "idle"}
              onRecord={handleRecord}
              onPause={handlePause}
              onResume={handleResume}
              onFinish={handleFinish}
              onRestart={handleRestart}
              finishDisabled={isRecordingOrPaused && !canFinish}
            />
          )}
        </LinearGradient>
      </View>

      {recordState === "countdown" && <CountdownOverlay onComplete={handleCountdownComplete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  topSection: {
    flex: 1,
  },
  topContent: {
    paddingBottom: Spacing.three,
  },
  whiteText: {
    color: SemanticColors.textPrimary,
  },
  questionText: {
    fontFamily: Fonts.montserratMedium,
    color: SemanticColors.textPrimary,
    marginTop: Spacing.three,
  },
  progressText: {
    color: SemanticColors.success,
    marginTop: Spacing.two,
  },
  recordWrapper: {
    marginHorizontal: -Spacing.five,
  },
  separator: {
    height: 2,
    backgroundColor: SemanticColors.textPrimary,
  },
  recordGradient: {
    alignItems: "center",
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
});
