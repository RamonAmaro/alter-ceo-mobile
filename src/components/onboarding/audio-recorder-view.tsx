import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
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
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useOnboardingRecorder } from "@/hooks/use-onboarding-recorder";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Ionicons } from "@expo/vector-icons";

interface AudioRecorderViewProps {
  onConfirm: (uri: string, transcript: string | null) => void;
  onBack: () => void;
}

type ViewMode = "audio" | "writing";

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
  const [mode, setMode] = useState<ViewMode>("audio");
  const [editedTranscript, setEditedTranscript] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const confirmingRef = useRef(false);

  const questions = useMemo(
    () => (planType === "professional" ? getProfessionalQuestions() : getExpressQuestions()),
    [planType],
  );

  const question = questions[currentQuestionIndex];

  useEffect(() => {
    confirmingRef.current = false;
    setIsConfirming(false);
    setMode("audio");
    setEditedTranscript("");
    setWrittenAnswer("");
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

  // Sync transcript from recorder into the editable field whenever a new
  // transcription arrives. Empty transcripts (failed recognition) leave the
  // field empty so the user can write the answer manually.
  useEffect(() => {
    if (recordState === "done") {
      setEditedTranscript(result?.transcript ?? "");
    }
  }, [recordState, result?.transcript]);

  if (!question) return null;

  function commitConfirm(uri: string, transcript: string): void {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    setIsConfirming(true);

    const normalized = transcript.trim();
    setAnswer(currentQuestionIndex, `[audio_recorded]:${uri}`);
    if (planType) {
      addAudioRecord({
        uri,
        origin: planType,
        questionIndex: currentQuestionIndex,
        question: question?.question ?? "",
        transcript: normalized || null,
      });
    }

    try {
      onConfirm(uri, normalized || null);
    } finally {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  }

  function handleConfirmAudio(): void {
    commitConfirm(result?.uri ?? "", editedTranscript);
  }

  function handleConfirmWritten(): void {
    commitConfirm("", writtenAnswer);
  }

  function handleSwitchToWriting(): void {
    setMode("writing");
  }

  function handleSwitchToAudio(): void {
    setMode("audio");
    setWrittenAnswer("");
  }

  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";
  const isRecordingActive = recordState === "recording";
  const planLabel = planType === "professional" ? "PROFESIONAL" : "EXPRESS";
  const showRecordControls =
    recordState !== "preparing" && recordState !== "done" && recordState !== "finishing";
  const canFinish = elapsedMs >= AUDIO_MIN_DURATION_MS;
  const canOfferWritingShortcut = mode === "audio" && recordState === "idle";
  const writtenIsValid = writtenAnswer.trim().length > 0;
  const editedIsValid = editedTranscript.trim().length > 0;

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <ThemedText type="headingLg" style={styles.whiteText}>
          {mode === "writing"
            ? "Escribe tu respuesta a la siguiente pregunta:"
            : question.instruction ||
              "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:"}
        </ThemedText>

        <ThemedText type="bodyLg" style={styles.questionText}>
          {question.question}
        </ThemedText>

        <ThemedText type="labelMd" style={styles.progressText}>
          ({question.progress}%)
        </ThemedText>

        {mode === "writing" ? (
          <View style={styles.writingBlock}>
            <TextInput
              value={writtenAnswer}
              onChangeText={setWrittenAnswer}
              style={styles.writingInput}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect
              placeholder="Escribe aquí tu respuesta…"
              placeholderTextColor={SemanticColors.textPlaceholder}
            />
            <Pressable
              onPress={handleConfirmWritten}
              disabled={!writtenIsValid || isConfirming}
              style={({ pressed }) => [
                styles.confirmButton,
                (!writtenIsValid || isConfirming) && styles.confirmButtonDisabled,
                pressed && writtenIsValid && !isConfirming && styles.confirmButtonPressed,
              ]}
            >
              <Ionicons name="checkmark" size={18} color={SemanticColors.onSuccess} />
              <ThemedText type="labelMd" style={styles.confirmButtonLabel}>
                Confirmar respuesta
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSwitchToAudio}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.switchLink, pressed && styles.switchLinkPressed]}
            >
              <Ionicons name="mic-outline" size={16} color={SemanticColors.success} />
              <ThemedText type="labelSm" style={styles.switchLinkText}>
                Volver a grabar audio
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      {mode === "writing" ? null : (
        <View style={styles.stageWrap}>
          <View style={styles.stage}>
            <View style={styles.stageGlowClip} pointerEvents="none">
              <LinearGradient
                colors={["rgba(0,255,132,0.14)", "rgba(0,255,132,0.04)", "transparent"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.stageGlow}
                pointerEvents="none"
              />
            </View>
            <AudioRecorderStatus
              recordState={recordState}
              elapsedMs={elapsedMs}
              result={result}
              transcriptionError={transcriptionError}
              amplitudeRef={amplitudeRef}
              isRecordingActive={isRecordingActive}
              editedTranscript={editedTranscript}
              onEditTranscript={setEditedTranscript}
            />

            {recordState === "idle" && (
              <View style={styles.idleHint}>
                <View style={styles.idleDot} />
                <ThemedText type="caption" style={styles.idleHintText}>
                  PULSA PARA EMPEZAR · MÁX 30S
                </ThemedText>
              </View>
            )}

            {recordState === "done" && (
              <AudioDoneActions
                onRestart={handleRestart}
                onConfirm={handleConfirmAudio}
                confirmLoading={isConfirming}
                confirmDisabled={!editedIsValid}
              />
            )}

            {showRecordControls && (
              <View style={styles.recordButtonWrap}>
                <RecordButton
                  state={isRecordingOrPaused ? recordState : "idle"}
                  onRecord={handleRecord}
                  onPause={handlePause}
                  onResume={handleResume}
                  onFinish={handleFinish}
                  onRestart={handleRestart}
                  finishDisabled={isRecordingOrPaused && !canFinish}
                />
              </View>
            )}

            {canOfferWritingShortcut && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <ThemedText type="caption" style={styles.dividerLabel}>
                    O BIEN
                  </ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  onPress={handleSwitchToWriting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [
                    styles.writingChip,
                    pressed && styles.writingChipPressed,
                  ]}
                >
                  <Ionicons name="create-outline" size={16} color={SemanticColors.textPrimary} />
                  <ThemedText type="labelSm" style={styles.writingChipLabel}>
                    Escribir la respuesta
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}

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
  writingBlock: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  writingInput: {
    minHeight: 120,
    maxHeight: 240,
    backgroundColor: SemanticColors.glassBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    lineHeight: 22,
    outlineStyle: "none" as never,
  },
  switchLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  switchLinkPressed: {
    opacity: 0.6,
  },
  switchLinkText: {
    color: SemanticColors.success,
    letterSpacing: 0.4,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: Spacing.two,
    backgroundColor: SemanticColors.success,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: Spacing.five,
    minWidth: 220,
    marginTop: Spacing.two,
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmButtonDisabled: {
    backgroundColor: "rgba(0,255,132,0.25)",
  },
  confirmButtonLabel: {
    color: SemanticColors.onSuccess,
  },
  stageWrap: {
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  stageGlowClip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: "hidden",
  },
  stageGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  stage: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    gap: Spacing.three,
  },
  idleHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  idleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  idleHintText: {
    color: SemanticColors.success,
    letterSpacing: 2.2,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: Fonts.montserratSemiBold,
  },
  recordButtonWrap: {
    alignItems: "center",
    paddingVertical: Spacing.one,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    width: "100%",
    paddingHorizontal: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  dividerLabel: {
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: Fonts.montserratSemiBold,
  },
  writingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  writingChipPressed: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.22)",
  },
  writingChipLabel: {
    color: SemanticColors.textPrimary,
    letterSpacing: 0.4,
  },
});
