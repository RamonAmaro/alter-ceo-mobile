import { AppBackground } from "@/components/app-background";
import { CircleButton } from "@/components/circle-button";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { LiveTranscriptBox } from "@/components/onboarding/live-transcript-box";
import { RecordButton } from "@/components/record-button";
import { CheckIcon, RestartIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  getExpressQuestions,
  getProfessionalQuestions,
} from "@/constants/onboarding-questions";
import {
  MAX_DURATION_MS,
  requestAudioPermission,
} from "@/services/audio-service";
import { createTranscriptionSession } from "@/services/transcription-service";
import type { TranscriptionSession } from "@/services/transcription-service";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { formatTimer } from "@/utils/format-timer";
import { useAudioRecorder } from "@siteed/expo-audio-studio";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RecordingState = "idle" | "recording" | "paused" | "finishing" | "done" | "countdown";

interface RecordingResult {
  uri: string;
  transcript: string | null;
}

export function AudioRecorderView() {
  const insets = useSafeAreaInsets();
  const {
    planType,
    currentQuestionIndex,
    setAnswer,
    addAudioRecord,
    nextQuestion,
    previousQuestion,
  } = useOnboardingStore();

  const questions = useMemo(
    () => (planType === "professional" ? getProfessionalQuestions() : getExpressQuestions()),
    [planType],
  );

  const question = questions[currentQuestionIndex];
  const { startRecording, stopRecording } = useAudioRecorder();

  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<RecordingResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const pausedRef = useRef(false);
  const sessionRef = useRef<TranscriptionSession | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (accumulated: number) => {
      accumulatedMsRef.current = accumulated;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = accumulatedMsRef.current + (Date.now() - startTimeRef.current);
        if (elapsed >= MAX_DURATION_MS) {
          setElapsedMs(MAX_DURATION_MS);
          stopTimer();
          void finishRecording();
        } else {
          setElapsedMs(elapsed);
        }
      }, 50);
    },
    [stopTimer],
  );

  useEffect(() => {
    return () => {
      stopTimer();
      sessionRef.current?.close();
      sessionRef.current = null;
      void stopRecording().catch(() => {});
    };
  }, [stopTimer, stopRecording]);

  async function startNewRecording(): Promise<void> {
    const granted = await requestAudioPermission();
    if (!granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso al micrófono para grabar tu respuesta. Actívalo en Ajustes.",
      );
      return;
    }

    sessionRef.current?.close();
    sessionRef.current = null;
    pausedRef.current = false;

    let session: TranscriptionSession | null = null;
    try {
      session = await createTranscriptionSession();
      sessionRef.current = session;
    } catch {
      sessionRef.current = null;
    }

    try {
      await startRecording({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sampleRate: 24000 as any,
        channels: 1,
        encoding: "pcm_16bit",
        interval: 100,
        onAudioStream: async (event) => {
          if (!pausedRef.current && session) {
            session.sendAudioData(event.data as string | Float32Array);
          }
        },
      });

      setResult(null);
      setElapsedMs(0);
      setRecordState("recording");
      startTimer(0);
    } catch {
      session?.close();
      sessionRef.current = null;
      Alert.alert("Error", "No se pudo iniciar la grabación.");
    }
  }

  async function finishRecording(): Promise<void> {
    stopTimer();
    setRecordState("finishing");

    const session = sessionRef.current;
    sessionRef.current = null;

    const [recordingResult, transcriptText] = await Promise.all([
      stopRecording().catch(() => null),
      session
        ? session.stop().catch(() => { session.close(); return ""; })
        : Promise.resolve(""),
    ]);

    setResult({
      uri: recordingResult?.fileUri ?? "",
      transcript: transcriptText || null,
    });
    setRecordState("done");
  }

  function handleRecord(): void {
    void startNewRecording();
  }

  function handlePause(): void {
    pausedRef.current = true;
    stopTimer();
    accumulatedMsRef.current += Date.now() - startTimeRef.current;
    setRecordState("paused");
  }

  function handleResume(): void {
    pausedRef.current = false;
    setRecordState("recording");
    startTimer(accumulatedMsRef.current);
  }

  function handleFinish(): void {
    void finishRecording();
  }

  function handleRestart(): void {
    stopTimer();
    sessionRef.current?.close();
    sessionRef.current = null;
    setRecordState("countdown");
  }

  function handleCountdownComplete(): void {
    void startNewRecording();
  }

  function handleConfirm(): void {
    if (!result) return;

    setAnswer(currentQuestionIndex, `[audio_recorded]:${result.uri}`);
    addAudioRecord({
      uri: result.uri,
      origin: planType as "express" | "professional",
      questionIndex: currentQuestionIndex,
      question: question?.question ?? "",
      transcript: result.transcript,
    });

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      router.replace(
        planType === "express"
          ? "/(onboarding)/express-complete"
          : "/(onboarding)/report-loading",
      );
      return;
    }

    nextQuestion();
    const nextQ = questions[nextIndex];
    if (nextQ.type === "audio") {
      setResult(null);
      setElapsedMs(0);
      setRecordState("idle");
    } else {
      router.back();
    }
  }

  const progressRatio = Math.min(elapsedMs / MAX_DURATION_MS, 1);
  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";
  const isRecordingActive = recordState === "recording";

  if (!question) return null;

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              previousQuestion();
              router.back();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <ThemedText type="labelMd" style={{ color: "#ffffff" }}>
            {planType === "professional" ? "PROFESIONAL" : "EXPRESS"}
          </ThemedText>
        </View>

        <ScrollView
          style={styles.topSection}
          contentContainerStyle={styles.topContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="headingLg" style={{ color: "#ffffff" }}>
            {question.instruction ||
              "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:"}
          </ThemedText>

          <ThemedText
            type="bodyLg"
            style={{ fontFamily: Fonts.montserratMedium, color: "#ffffff", marginTop: Spacing.three }}
          >
            {question.question}
          </ThemedText>

          <ThemedText type="labelMd" style={{ color: "#00FF84", marginTop: Spacing.two }}>
            ({question.progress}%)
          </ThemedText>
        </ScrollView>

        <View style={styles.recordWrapper}>
          <View style={styles.separator} />
          <LinearGradient
            colors={["rgba(0,255,255,0.15)", "transparent"]}
            style={styles.recordGradient}
          >
            <View style={styles.topArea}>
              {isRecordingOrPaused && (
                <>
                  <View style={styles.timerRow}>
                    <ThemedText
                      type="headingMd"
                      style={[
                        styles.timerText,
                        isRecordingActive && styles.timerRecording,
                        recordState === "paused" && styles.timerPaused,
                      ]}
                    >
                      {formatTimer(elapsedMs)}
                    </ThemedText>
                    <ThemedText type="bodyMd" style={styles.timerLimit}>
                      / {formatTimer(MAX_DURATION_MS)}
                    </ThemedText>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressRatio * 100}%` as unknown as number },
                      ]}
                    />
                  </View>
                </>
              )}

              {recordState === "finishing" && (
                <View style={styles.finishingBlock}>
                  <ActivityIndicator color="#00FF84" size="large" />
                  <ThemedText type="labelMd" style={styles.finishingTitle}>
                    Transcribiendo audio...
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.finishingSubtitle}>
                    Espera un momento, estamos procesando tu respuesta
                  </ThemedText>
                </View>
              )}

              {recordState === "done" && (
                result?.transcript ? (
                  <>
                    <ThemedText type="labelMd" style={styles.transcriptLabel}>
                      Transcripción
                    </ThemedText>
                    <LiveTranscriptBox text={result.transcript} />
                  </>
                ) : (
                  <ThemedText type="bodySm" style={styles.noTranscriptText}>
                    Audio grabado correctamente
                  </ThemedText>
                )
              )}
            </View>

            {recordState === "done" && (
              <View style={styles.doneActions}>
                <CircleButton
                  size={120}
                  gradientId="gradRestart"
                  colors={["#FF9500", "#E68400"]}
                  icon={RestartIcon}
                  label="Reintentar"
                  onPress={handleRestart}
                />
                <CircleButton
                  size={120}
                  gradientId="gradConfirm"
                  colors={["#00D68F", "#00A86B"]}
                  icon={CheckIcon}
                  label="Confirmar"
                  onPress={handleConfirm}
                  pulse
                />
              </View>
            )}
            {recordState !== "done" && recordState !== "finishing" && (
              <RecordButton
                state={isRecordingOrPaused ? recordState : "idle"}
                onRecord={handleRecord}
                onPause={handlePause}
                onResume={handleResume}
                onFinish={handleFinish}
                onRestart={handleRestart}
              />
            )}
          </LinearGradient>
        </View>
      </View>

      {recordState === "countdown" && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  topSection: {
    flex: 1,
  },
  topContent: {
    paddingBottom: Spacing.three,
  },
  recordWrapper: {
    marginHorizontal: -Spacing.five,
  },
  separator: {
    height: 2,
    backgroundColor: "#ffffff",
  },
  recordGradient: {
    alignItems: "center",
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  topArea: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 160,
    justifyContent: "flex-end",
    marginBottom: Spacing.two,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
  },
  timerText: {
    fontFamily: Fonts.montserratSemiBold,
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  timerRecording: {
    color: "#00FF84",
  },
  timerPaused: {
    color: "#FF9500",
  },
  timerLimit: {
    color: "rgba(255,255,255,0.4)",
    fontVariant: ["tabular-nums"],
  },
  progressBarTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00FF84",
    borderRadius: 2,
  },
  finishingBlock: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  finishingTitle: {
    color: "#ffffff",
    textAlign: "center",
  },
  finishingSubtitle: {
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 18,
  },
  transcriptLabel: {
    color: "rgba(255,255,255,0.5)",
  },
  noTranscriptText: {
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
  },
  doneActions: {
    flexDirection: "row",
    gap: Spacing.five,
    justifyContent: "center",
    width: "100%",
  },
});
