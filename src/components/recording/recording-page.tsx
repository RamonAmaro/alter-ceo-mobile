import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, type AppStateStatus, Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useUploadRecording } from "@/hooks/use-upload-recording";
import {
  checkAudioPermission,
  enableRecordingMode,
  openAppSettings,
  RecordingPresets,
  requestAudioPermission,
  stopRecorderAndGetUri,
  useAudioRecorder,
} from "@/services/audio-service";
import type { RecordingStatus } from "expo-audio";
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
  onGoToHistory?: () => void;
}

// --- Component -----------------------------------------------------------

export function RecordingPage({
  width,
  height,
  onUploadComplete,
  onGoToHistory,
}: RecordingPageProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [state, setState] = useState<RecordingState>("idle");
  const [showToast, setShowToast] = useState(false);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);

  const preparedRef = useRef(false);
  const segmentStartRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const pendingSaveRef = useRef<{ uri: string; durationMs: number } | null>(null);

  const stateRef = useRef<RecordingState>(state);
  stateRef.current = state;
  const interruptionAlertShownRef = useRef(false);
  const recorderRef = useRef<ReturnType<typeof useAudioRecorder> | null>(null);

  const pauseDueToInterruption = useCallback(() => {
    if (stateRef.current !== "recording") return;

    try {
      recorderRef.current?.pause();
    } catch {
      // ignore — recorder may already be invalidated by the system
    }

    if (segmentStartRef.current > 0) {
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
      segmentStartRef.current = 0;
    }
    setState("paused");

    if (interruptionAlertShownRef.current) return;
    interruptionAlertShownRef.current = true;

    Alert.alert(
      "Grabación pausada",
      "Tu grabación se ha pausado por una llamada o interrupción del sistema. Pulsa Reanudar cuando quieras continuar.",
      [
        {
          text: "Entendido",
          onPress: () => {
            interruptionAlertShownRef.current = false;
          },
        },
      ],
    );
  }, []);

  const handleRecorderStatus = useCallback(
    (status: RecordingStatus) => {
      if (status.mediaServicesDidReset) {
        preparedRef.current = false;
        pauseDueToInterruption();
        return;
      }
      if (status.hasError) {
        pauseDueToInterruption();
      }
    },
    [pauseDueToInterruption],
  );

  const recorder = useAudioRecorder(RECORDING_OPTIONS, handleRecorderStatus);
  recorderRef.current = recorder;
  const { uploadRecording } = useUploadRecording();

  const persistAndSaveDraft = useCallback(
    async (uri: string, durationMs: number, title: string) => {
      const userId = useAuthStore.getState().user?.userId;
      if (!userId) return;

      const persistedUri = await persistRecordingFile(uri).catch(() => uri);
      const recordingId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date();

      await useRecordingsStore.getState().addRecording({
        id: recordingId,
        userId,
        uri: persistedUri,
        title,
        date: formatShortDate(now),
        durationMs,
        createdAt: now.toISOString(),
        uploadStatus: "local_only",
      });

      onUploadComplete?.();

      await uploadRecording({
        recordingId,
        uri: persistedUri,
        title,
        durationMs,
      });
    },
    [uploadRecording, onUploadComplete],
  );

  const saveAsAutoDraft = useCallback(async () => {
    const current = stateRef.current;
    if (current === "idle") return;

    const segmentMs =
      current === "recording" && segmentStartRef.current > 0
        ? Date.now() - segmentStartRef.current
        : 0;
    const durationMs = accumulatedMsRef.current + segmentMs;

    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");

    const uri = await stopRecorderAndGetUri(recorderRef.current!).catch(() => null);
    preparedRef.current = false;
    if (!uri || durationMs < 1000) return;

    const autoTitle = `Grabación ${formatShortDate(new Date())}`;
    await persistAndSaveDraft(uri, durationMs, autoTitle);
  }, [persistAndSaveDraft]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const appStateRef = { current: AppState.currentState };
    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      const wasActive = appStateRef.current === "active";
      appStateRef.current = next;
      if (wasActive && next !== "active" && stateRef.current !== "idle") {
        void saveAsAutoDraft();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [saveAsAutoDraft]);

  const handleStart = useCallback(async () => {
    if (state !== "idle") return;

    const existing = await checkAudioPermission();
    const permission = existing.granted ? existing : await requestAudioPermission();
    if (!permission.granted) {
      if (!permission.canAskAgain) {
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
  }, [state, recorder]);

  const handlePauseResume = useCallback(async () => {
    if (state === "recording") {
      recorder.pause();
      if (segmentStartRef.current > 0) {
        accumulatedMsRef.current += Date.now() - segmentStartRef.current;
        segmentStartRef.current = 0;
      }
      setState("paused");
    } else if (state === "paused") {
      if (!preparedRef.current) {
        await enableRecordingMode();
        await recorder.prepareToRecordAsync();
        preparedRef.current = true;
      }
      recorder.record();
      segmentStartRef.current = Date.now();
      setState("recording");
    }
  }, [state, recorder]);

  const handleDelete = useCallback(async () => {
    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");
    if (state === "recording" || state === "paused") {
      await stopRecorderAndGetUri(recorder).catch(() => null);
    }
    preparedRef.current = false;
  }, [state, recorder]);

  const handleSave = useCallback(async () => {
    if (state === "idle") return;

    if (state === "recording" && segmentStartRef.current > 0) {
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
    }

    const durationMs = accumulatedMsRef.current;
    accumulatedMsRef.current = 0;
    segmentStartRef.current = 0;
    setState("idle");

    const uri = await stopRecorderAndGetUri(recorder).catch(() => null);
    preparedRef.current = false;

    if (!uri) return;

    pendingSaveRef.current = { uri, durationMs };
    setShowTitlePrompt(true);
  }, [state, recorder]);

  const handleTitleConfirm = useCallback(
    async (title: string) => {
      setShowTitlePrompt(false);
      const pending = pendingSaveRef.current;
      if (!pending) return;
      pendingSaveRef.current = null;

      onGoToHistory?.();
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION_MS);

      await persistAndSaveDraft(pending.uri, pending.durationMs, title);
    },
    [persistAndSaveDraft, onGoToHistory],
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
              onRecord={handleStart}
              onPauseResume={handlePauseResume}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          </LinearGradient>
        </>
      ) : (
        <RecordingStageDesktop
          state={state}
          recorder={recorder}
          onRecord={handleStart}
          onPauseResume={handlePauseResume}
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
