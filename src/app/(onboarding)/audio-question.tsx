import { AppBackground } from "@/components/app-background";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { RecordButton } from "@/components/record-button";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  getExpressQuestions,
  getProfessionalQuestions,
} from "@/constants/onboarding-questions";
import {
  MAX_DURATION_MS,
  RecordingPresets,
  enableRecordingMode,
  requestAudioPermission,
  useAudioRecorder,
} from "@/services/audio-service";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { formatTimer } from "@/utils/format-timer";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RecordingState = "idle" | "recording" | "paused" | "countdown";

interface AudioRecorderViewProps {
  autoStart?: boolean;
  onRestart?: () => void;
  onNextAudio?: () => void;
}

function AudioRecorderView({ autoStart, onRestart, onNextAudio }: AudioRecorderViewProps) {
  const insets = useSafeAreaInsets();
  const {
    planType,
    currentQuestionIndex,
    setAnswer,
    addAudioRecord,
    nextQuestion,
    previousQuestion,
  } = useOnboardingStore();

  const questions = useMemo(() => {
    return planType === "professional"
      ? getProfessionalQuestions()
      : getExpressQuestions();
  }, [planType]);

  const question = questions[currentQuestionIndex];

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const recorderActiveRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const safeStopRecorder = useCallback(() => {
    if (!recorderActiveRef.current) return;
    recorderActiveRef.current = false;
    try {
      recorder.stop();
    } catch {
    }
  }, [recorder]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed =
        accumulatedRef.current + (Date.now() - startTimeRef.current);

      if (elapsed >= MAX_DURATION_MS) {
        setElapsedMs(MAX_DURATION_MS);
        stopTimer();
        safeStopRecorder();
        setRecordState("idle");
        handleRecordingComplete();
      } else {
        setElapsedMs(elapsed);
      }
    }, 50);
  }, [stopTimer]);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopTimer();
      safeStopRecorder();
    };
  }, [stopTimer, safeStopRecorder]);

  useEffect(() => {
    if (!autoStart) return;
    const timeout = setTimeout(() => {
      if (mountedRef.current) handleRecord();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  async function handleRecord(): Promise<void> {
    if (!mountedRef.current) return;

    const granted = await requestAudioPermission();
    if (!granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso al micrófono para grabar tu respuesta. Actívalo en Ajustes.",
      );
      return;
    }

    try {
      await enableRecordingMode();
      if (!mountedRef.current) return;
      await recorder.prepareToRecordAsync();
      if (!mountedRef.current) return;
      recorder.record();
      recorderActiveRef.current = true;
      accumulatedRef.current = 0;
      setElapsedMs(0);
      setRecordState("recording");
      startTimer();
    } catch {
      if (mountedRef.current) {
        Alert.alert("Error", "No se pudo iniciar la grabación.");
      }
    }
  }

  function handlePause(): void {
    recorder.pause();
    stopTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRecordState("paused");
  }

  function handleResume(): void {
    recorder.record();
    setRecordState("recording");
    startTimer();
  }

  function handleFinish(): void {
    stopTimer();
    safeStopRecorder();
    setRecordState("idle");
    handleRecordingComplete();
  }

  function handleRestartRecording(): void {
    stopTimer();
    safeStopRecorder();
    setElapsedMs(0);
    accumulatedRef.current = 0;
    setRecordState("countdown");
  }

  function handleCountdownComplete(): void {
    onRestart?.();
  }

  function handleRecordingComplete(): void {
    const uri = recorder.uri ?? "";
    setAnswer(currentQuestionIndex, `[audio_recorded]:${uri}`);
    addAudioRecord({
      uri,
      origin: planType as "express" | "professional",
      questionIndex: currentQuestionIndex,
      question: question?.question ?? "",
    });

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];
      nextQuestion();
      if (nextQ.type === "audio") {
        onNextAudio?.();
      } else {
        router.back();
      }
    } else {
      if (planType === "express") {
        router.replace("/(onboarding)/express-complete");
      } else {
        router.replace("/(onboarding)/report-loading");
      }
    }
  }

  const showControls = recordState === "recording" || recordState === "paused";

  if (!question) return null;

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.topSection}>
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

          <ThemedText type="headingLg" style={{ color: "#ffffff" }}>
            {question.instruction ||
              "Graba un audio de un máximo de 30 segundos contestando a la siguiente pregunta:"}
          </ThemedText>

          <ThemedText type="bodyLg" style={{ fontFamily: Fonts.montserratMedium, color: "#ffffff", marginTop: Spacing.three }}>{question.question}</ThemedText>

          <ThemedText type="labelMd" style={{ color: "#00FF84", marginTop: Spacing.two }}>({question.progress}%)</ThemedText>
        </View>

        <View style={styles.recordWrapper}>
          <View style={styles.separator} />
          <LinearGradient
            colors={["rgba(0,255,255,0.15)", "transparent"]}
            style={styles.recordGradient}
          >
            <Text
              style={[
                styles.timer,
                recordState === "recording" && styles.timerRecording,
                recordState === "paused" && styles.timerPaused,
              ]}
            >
              {formatTimer(elapsedMs)}
            </Text>

            <RecordButton
              state={showControls ? recordState : "idle"}
              onRecord={handleRecord}
              onPause={handlePause}
              onResume={handleResume}
              onFinish={handleFinish}
              onRestart={handleRestartRecording}
            />
          </LinearGradient>
        </View>
      </View>

      {recordState === "countdown" && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}
    </AppBackground>
  );
}

export default function AudioQuestionScreen() {
  const [key, setKey] = useState(0);
  const [autoStart, setAutoStart] = useState(false);

  function handleRestart(shouldAutoStart = true): void {
    setAutoStart(shouldAutoStart);
    setKey((k) => k + 1);
  }

  return (
    <AudioRecorderView
      key={key}
      autoStart={autoStart}
      onRestart={handleRestart}
      onNextAudio={() => handleRestart(false)}
    />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.three,
    gap: Spacing.two,
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  timer: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 32,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.three,
    fontVariant: ["tabular-nums"],
    minWidth: 280,
  },
  timerRecording: {
    color: "#00FF84",
  },
  timerPaused: {
    color: "#FF9500",
  },
});
