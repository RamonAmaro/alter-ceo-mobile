import { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useUploadRecording } from "@/hooks/use-upload-recording";
import {
  enableRecordingMode,
  openAppSettings,
  RecordingPresets,
  requestAudioPermission,
  useAudioRecorder,
} from "@/services/audio-service";
import { persistRecordingFile } from "@/services/recording-storage";
import { useAuthStore } from "@/stores/auth-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatShortDate } from "@/utils/format-date";

import { AudioWave } from "./audio-wave";
import { RecordingControls } from "./recording-controls";
import { RecordingStageDesktop } from "./recording-stage-desktop";
import { RecordingTimer } from "./recording-timer";
import { SavedToast } from "./saved-toast";
import { TitlePrompt } from "./title-prompt";

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
  onUploadComplete?: () => void;
}

// --- Component -----------------------------------------------------------

export function RecordingPage({ width, height, onUploadComplete }: RecordingPageProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [state, setState] = useState<RecordingState>("idle");
  const [showToast, setShowToast] = useState(false);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);

  const preparedRef = useRef(false);
  const segmentStartRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const pendingSaveRef = useRef<{ uri: string; durationMs: number } | null>(null);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const { uploadRecording } = useUploadRecording();

  const handleRecord = useCallback(async () => {
    if (state === "idle") {
      const { granted, canAskAgain } = await requestAudioPermission();
      if (!granted) {
        if (!canAskAgain) {
          Alert.alert(
            "Micrófono desactivado",
            "Activa el permiso de micrófono en los ajustes de tu dispositivo para poder grabar.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a ajustes", onPress: openAppSettings },
            ],
          );
        } else {
          Alert.alert("Permiso requerido", "Necesitamos acceso al micrófono para grabar.");
        }
        return;
      }

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

  const handleSave = useCallback(() => {
    if (state === "idle") return;

    if (state === "recording") {
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
    }

    recorder.stop();
    preparedRef.current = false;

    const uri = recorder.uri;
    if (!uri) {
      accumulatedMsRef.current = 0;
      segmentStartRef.current = 0;
      setState("idle");
      return;
    }

    pendingSaveRef.current = { uri, durationMs: accumulatedMsRef.current };
    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");
    setShowTitlePrompt(true);
  }, [state, recorder]);

  const handleTitleConfirm = useCallback(
    async (title: string) => {
      setShowTitlePrompt(false);
      const pending = pendingSaveRef.current;
      if (!pending) return;
      pendingSaveRef.current = null;

      const userId = useAuthStore.getState().user?.userId;
      if (!userId) return;

      const persistedUri = await persistRecordingFile(pending.uri);
      const recordingId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date();

      await useRecordingsStore.getState().addRecording({
        id: recordingId,
        userId,
        uri: persistedUri,
        title,
        date: formatShortDate(now),
        durationMs: pending.durationMs,
        createdAt: now.toISOString(),
        uploadStatus: "local_only",
      });

      onUploadComplete?.();
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION_MS);

      await uploadRecording({
        recordingId,
        uri: persistedUri,
        title,
        durationMs: pending.durationMs,
      });
    },
    [uploadRecording, onUploadComplete],
  );

  const handleTitleCancel = useCallback(() => {
    setShowTitlePrompt(false);
    pendingSaveRef.current = null;
  }, []);

  const isActive = state === "recording";
  const isReset = state === "idle";

  return (
    <View style={[styles.page, { width, height }]}>
      {isMobile ? (
        <>
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
        </>
      ) : (
        <RecordingStageDesktop
          state={state}
          recorder={recorder}
          onRecord={handleRecord}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}

      <SavedToast visible={showToast} />

      <TitlePrompt
        visible={showTitlePrompt}
        defaultTitle={`Reunión ${formatShortDate(new Date())}`}
        onConfirm={handleTitleConfirm}
        onCancel={handleTitleCancel}
      />
    </View>
  );
}

// --- Styles --------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    overflow: "hidden",
  },
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
