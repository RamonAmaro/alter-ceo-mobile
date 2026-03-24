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
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatShortDate } from "@/utils/format-date";

import { AudioWave } from "./audio-wave";
import { RecordingControls } from "./recording-controls";
import { RecordingTimer } from "./recording-timer";
import { SavedToast } from "./saved-toast";

type RecordingState = "idle" | "recording" | "paused";

interface RecordingPageProps {
  width: number;
  height: number;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function RecordingPage({ width, height }: RecordingPageProps) {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const preparedRef = useRef(false);
  const elapsedRef = useRef(0);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const addRecording = useRecordingsStore((s) => s.addRecording);

  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

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

  const reset = useCallback(() => {
    preparedRef.current = false;
    stopTimer();
    setState("idle");
    setElapsedMs(0);
  }, [stopTimer]);

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
    } else if (state === "recording") {
      recorder.pause();
      stopTimer();
      setState("paused");
    } else if (state === "paused") {
      recorder.record();
      setState("recording");
      startTimer();
    }
  }, [state, recorder, startTimer, stopTimer]);

  const handleDelete = useCallback(async () => {
    if (state === "recording" || state === "paused") {
      recorder.stop();
    }
    reset();
  }, [state, recorder, reset]);

  const handleSave = useCallback(async () => {
    if (state === "idle") return;
    recorder.stop();
    preparedRef.current = false;
    stopTimer();
    setState("idle");

    const uri = recorder.uri;
    const savedMs = elapsedRef.current;

    if (uri) {
      const now = new Date();
      await addRecording({
        id: Date.now().toString(),
        uri,
        title: `Reunión ${formatShortDate(now)}`,
        date: formatShortDate(now),
        durationMs: savedMs,
        createdAt: now.toISOString(),
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }

    setElapsedMs(0);
  }, [state, recorder, stopTimer, addRecording]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const isActive = state === "recording";

  return (
    <View style={{ width, height }}>
      <View style={styles.content}>
        <AudioWave isActive={isActive} recorder={recorder} />
        <RecordingTimer elapsedMs={elapsedMs} isRecording={isActive} />
      </View>

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0, 50, 50, 0.4)",
          "rgba(0, 40, 40, 0.7)",
          "rgba(0, 30, 30, 0.9)",
        ]}
        locations={[0, 0.3, 0.6, 1]}
        style={[styles.bottomOverlay, { paddingBottom: insets.bottom + Spacing.three }]}
        pointerEvents="box-none"
      >
        <RecordingControls
          state={state}
          onRecord={handleRecord}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      </LinearGradient>

      <SavedToast visible={showToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.six,
  },
});
