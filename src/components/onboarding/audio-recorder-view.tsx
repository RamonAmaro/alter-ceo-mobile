import { CircleButton } from "@/components/circle-button";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { LiveTranscriptBox } from "@/components/onboarding/live-transcript-box";
import { AudioWave } from "@/components/recording/audio-wave";
import { RecordButton } from "@/components/record-button";
import { CheckIcon, RestartIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import {
  getExpressQuestions,
  getProfessionalQuestions,
} from "@/constants/onboarding-questions";
import { Ionicons } from "@expo/vector-icons";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RecordingState = "idle" | "preparing" | "recording" | "paused" | "finishing" | "done" | "countdown";

interface RecordingResult {
  uri: string;
  transcript: string | null;
}

interface AudioRecorderViewProps {
  onConfirm: (uri: string, transcript: string | null) => void;
  onBack: () => void;
}

export function AudioRecorderView({ onConfirm, onBack }: AudioRecorderViewProps) {
  const insets = useSafeAreaInsets();
  const {
    planType,
    currentQuestionIndex,
    setAnswer,
    addAudioRecord,
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
  const amplitudeRef = useRef<number>(0);
  const prevQuestionIndexRef = useRef(currentQuestionIndex);

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
    if (prevQuestionIndexRef.current === currentQuestionIndex) return;
    prevQuestionIndexRef.current = currentQuestionIndex;
    setRecordState("idle");
    setElapsedMs(0);
    setResult(null);
    stopTimer();
    sessionRef.current?.close();
    sessionRef.current = null;
  }, [currentQuestionIndex]);

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
    setRecordState("preparing");

    let session: TranscriptionSession | null = null;
    try {
      session = await createTranscriptionSession();
      sessionRef.current = session;
    } catch {
      sessionRef.current = null;
      Alert.alert(
        "Transcripción no disponible",
        "Puedes grabar igualmente. Tu respuesta será procesada sin transcripción en tiempo real.",
      );
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
          if (event.data instanceof Float32Array && event.data.length > 0) {
            let sum = 0;
            for (let i = 0; i < event.data.length; i++) {
              sum += event.data[i] * event.data[i];
            }
            amplitudeRef.current = Math.min(Math.sqrt(sum / event.data.length) * 15, 1);
          } else if (typeof event.data === "string" && event.data.length > 0) {
            try {
              const binary = atob(event.data);
              const count = Math.floor(binary.length / 2);
              let sum = 0;
              for (let i = 0; i < count; i++) {
                const s16 = (binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8)) << 16 >> 16;
                const norm = s16 / 32768;
                sum += norm * norm;
              }
              amplitudeRef.current = count > 0 ? Math.min(Math.sqrt(sum / count) * 15, 1) : 0;
            } catch {
              amplitudeRef.current = 0;
            }
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
      setRecordState("idle");
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

    onConfirm(result.uri, result.transcript);
  }

  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";
  const isRecordingActive = recordState === "recording";
  const isPreparing = recordState === "preparing";

  if (!question) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
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
            {isPreparing && (
              <View style={styles.preparingBlock}>
                <ActivityIndicator color="#00CFFF" size="large" />
                <ThemedText type="labelMd" style={styles.preparingTitle}>
                  Preparando grabación...
                </ThemedText>
              </View>
            )}

            {isRecordingOrPaused && (
              <>
                <AudioWave
                  isActive={isRecordingActive}
                  isReset={false}
                  amplitudeRef={amplitudeRef}
                />
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
          {!isPreparing && recordState !== "done" && recordState !== "finishing" && (
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

      {recordState === "countdown" && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}
    </View>
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
  preparingBlock: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  preparingTitle: {
    color: "#00CFFF",
    textAlign: "center",
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
