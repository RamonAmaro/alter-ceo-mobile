import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import {
  enableRecordingMode,
  RecordingPresets,
  requestAudioPermission,
  useAudioRecorder,
} from "@/services/audio-service";

import { RecordingControls } from "./recording-controls";
import { RecordingTimer } from "./recording-timer";

type RecordingState = "idle" | "recording";

interface RecordingPageProps {
  width: number;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function RecordingPage({ width }: RecordingPageProps) {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const preparedRef = useRef(false);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const isRecording = state === "recording";

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedMs;
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
  }, [elapsedMs]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleRecord = useCallback(async () => {
    if (state === "idle") {
      const granted = await requestAudioPermission();
      if (!granted) return;
      await enableRecordingMode();
      if (!preparedRef.current) {
        await recorder.prepareToRecordAsync();
        preparedRef.current = true;
      }
      recorder.record();
      setState("recording");
      startTimer();
    } else {
      recorder.stop();
      preparedRef.current = false;
      stopTimer();
      setState("idle");
    }
  }, [state, recorder, startTimer, stopTimer]);

  const handleDelete = useCallback(async () => {
    if (isRecording) {
      recorder.stop();
      preparedRef.current = false;
      stopTimer();
    }
    setElapsedMs(0);
    setState("idle");
  }, [isRecording, recorder, stopTimer]);

  const handleSave = useCallback(async () => {
    if (isRecording) {
      recorder.stop();
      preparedRef.current = false;
      stopTimer();
      setState("idle");
    }
  }, [isRecording, recorder, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.content}>
        <RecordingTimer elapsedMs={elapsedMs} isRecording={isRecording} />
      </View>

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0, 50, 50, 0.4)",
          "rgba(0, 40, 40, 0.7)",
          "rgba(0, 30, 30, 0.85)",
        ]}
        locations={[0, 0.3, 0.6, 1]}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom + Spacing.two }]}
      >
        <RecordingControls
          state={state}
          onRecord={handleRecord}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  bottomGradient: {
    paddingTop: Spacing.six,
  },
});
