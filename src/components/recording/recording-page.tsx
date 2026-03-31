import { useCallback, useRef, useState } from "react";
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

// --- Constants -----------------------------------------------------------

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const GRADIENT_COLORS: readonly [string, string, ...string[]] = [
  "transparent",
  "rgba(0, 50, 50, 0.4)",
  "rgba(0, 40, 40, 0.7)",
  "rgba(0, 30, 30, 0.9)",
];

const GRADIENT_LOCATIONS: readonly [number, number, ...number[]] = [0, 0.3, 0.6, 1];

const TOAST_DURATION_MS = 2000;

// --- Types ---------------------------------------------------------------

type RecordingState = "idle" | "recording" | "paused";

interface RecordingPageProps {
  width: number;
  height: number;
}

// --- Component -----------------------------------------------------------

export function RecordingPage({ width, height }: RecordingPageProps) {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<RecordingState>("idle");
  const [showToast, setShowToast] = useState(false);

  const preparedRef = useRef(false);
  const segmentStartRef = useRef(0);
  const accumulatedMsRef = useRef(0);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const addRecording = useRecordingsStore((s) => s.addRecording);

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
      segmentStartRef.current = Date.now();
      accumulatedMsRef.current = 0;
      setState("recording");
    } else if (state === "recording") {
      recorder.pause();
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
      setState("paused");
    } else if (state === "paused") {
      recorder.record();
      segmentStartRef.current = Date.now();
      setState("recording");
    }
  }, [state, recorder]);

  const handleDelete = useCallback(async () => {
    if (state === "recording" || state === "paused") {
      recorder.stop();
    }
    preparedRef.current = false;
    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");
  }, [state, recorder]);

  const handleSave = useCallback(async () => {
    if (state === "idle") return;

    if (state === "recording") {
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
    }

    recorder.stop();
    preparedRef.current = false;

    const durationMs = accumulatedMsRef.current;
    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");

    const uri = recorder.uri;
    if (!uri) return;

    const now = new Date();
    await addRecording({
      id: Date.now().toString(),
      uri,
      title: `Reunión ${formatShortDate(now)}`,
      date: formatShortDate(now),
      durationMs,
      createdAt: now.toISOString(),
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
  }, [state, recorder, addRecording]);

  const isActive = state === "recording";
  const isReset = state === "idle";

  return (
    <View style={{ width, height }}>
      <View style={styles.content}>
        <AudioWave isActive={isActive} isReset={isReset} recorder={recorder} />
        <RecordingTimer isRecording={isActive} isPaused={state === "paused"} />
      </View>

      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
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

// --- Styles --------------------------------------------------------------

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
