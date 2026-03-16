import { AppBackground } from "@/components/app-background";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { RecordButton } from "@/components/record-button";
import { Fonts, Spacing } from "@/constants/theme";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RecordingState = "idle" | "recording" | "paused" | "countdown";

interface AudioRecorderViewProps {
  autoStart?: boolean;
  onRestart?: () => void;
}

function AudioRecorderView({ autoStart, onRestart }: AudioRecorderViewProps) {
  const insets = useSafeAreaInsets();
  const planType = useOnboardingStore((s) => s.planType);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed =
        accumulatedRef.current + (Date.now() - startTimeRef.current);

      if (elapsed >= MAX_DURATION_MS) {
        setElapsedMs(MAX_DURATION_MS);
        stopTimer();
        try { recorder.stop(); } catch { /* already stopped */ }
        setRecordState("idle");
        handleRecordingComplete();
      } else {
        setElapsedMs(elapsed);
      }
    }, 50);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  useEffect(() => {
    if (!autoStart) return;
    handleRecord();
  }, []);

  async function handleRecord() {
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
      await recorder.prepareToRecordAsync();
      recorder.record();
      accumulatedRef.current = 0;
      setElapsedMs(0);
      setRecordState("recording");
      startTimer();
    } catch (e) {
      console.error("Recording error:", e);
      Alert.alert("Error", "No se pudo iniciar la grabación.");
    }
  }

  function handlePause() {
    recorder.pause();
    stopTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRecordState("paused");
  }

  function handleResume() {
    recorder.record();
    setRecordState("recording");
    startTimer();
  }

  function handleFinish() {
    stopTimer();
    try { recorder.stop(); } catch { /* already stopped */ }
    setRecordState("idle");
    handleRecordingComplete();
  }

  function handleRestart() {
    stopTimer();
    try { recorder.stop(); } catch { /* already stopped */ }
    setElapsedMs(0);
    accumulatedRef.current = 0;
    setRecordState("countdown");
  }

  function handleCountdownComplete() {
    // Signal parent to remount this component with autoStart
    onRestart?.();
  }

  function handleRecordingComplete() {
    Alert.alert(
      "¡Audio grabado!",
      "Tu respuesta ha sido registrada correctamente.",
      [
        {
          text: "Continuar",
          onPress: () => router.push("/(onboarding)/completion"),
        },
      ],
    );
  }

  const showControls = recordState === "recording" || recordState === "paused";

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
          <Text style={styles.planLabel}>
            {planType === "professional" ? "PROFESIONAL" : "EXPRESS"}
          </Text>

          <Text style={styles.instruction}>
            Graba un audio de un máximo de 30 segundos contestando a la
            siguiente pregunta:
          </Text>

          <Text style={styles.question}>
            ¿Cuál es tu producto o servicio principal y cuál es el precio
            aproximado de venta?
          </Text>

          <Text style={styles.progress}>(75%)</Text>
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
              onRestart={handleRestart}
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

  function handleRestart() {
    setAutoStart(true);
    setKey((k) => k + 1);
  }

  return (
    <AudioRecorderView
      key={key}
      autoStart={autoStart}
      onRestart={handleRestart}
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
  planLabel: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  instruction: {
    fontFamily: Fonts.montserrat,
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 29,
  },
  question: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    lineHeight: 26,
    marginTop: Spacing.three,
  },
  progress: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "700",
    color: "#00FF84",
    lineHeight: 26,
    marginTop: Spacing.two,
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
    fontFamily: Fonts.montserrat,
    fontSize: 32,
    fontWeight: "600",
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
