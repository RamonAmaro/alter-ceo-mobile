import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Alert, AppState, type AppStateStatus, Platform } from "react-native";

import { useFocusEffect } from "expo-router";

import { AUDIO_MAX_DURATION_MS } from "@/constants/audio";
import {
  enableRecordingMode,
  RecordingPresets,
  stopRecorderAndGetUri,
  useAudioRecorder,
} from "@/services/audio-service";
import { persistRecordingFile } from "@/services/recording-storage";
import { ensureMicrophonePermission } from "@/utils/ensure-microphone-permission";

export type ChatAudioState = "idle" | "recording" | "submitting";

type RecorderState =
  | { readonly kind: "idle" }
  | { readonly kind: "recording"; readonly startedAt: number }
  | { readonly kind: "submitting" };

export interface ChatAudioDraftPayload {
  readonly uri: string;
  readonly durationMs: number;
}

interface UseChatAudioRecorderOptions {
  readonly disabled?: boolean;
  readonly onSubmitAudio: (uri: string) => Promise<void>;
  readonly onRecordingInterrupted?: (draft: ChatAudioDraftPayload) => Promise<void> | void;
}

interface UseChatAudioRecorderResult {
  readonly audioState: ChatAudioState;
  readonly elapsedMs: number;
  readonly handleStartRecording: () => void;
  readonly handleStopRecording: () => void;
  readonly handleCancelRecording: () => void;
  readonly persistRecordingDraft: () => Promise<void>;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

function getElapsedMs(startedAt: number): number {
  return Math.min(Date.now() - startedAt, AUDIO_MAX_DURATION_MS);
}

function resetRecorderUi(
  setState: Dispatch<SetStateAction<RecorderState>>,
  setElapsedMs: Dispatch<SetStateAction<number>>,
): void {
  setState({ kind: "idle" });
  setElapsedMs(0);
}

export function useChatAudioRecorder({
  disabled = false,
  onSubmitAudio,
  onRecordingInterrupted,
}: UseChatAudioRecorderOptions): UseChatAudioRecorderResult {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const [state, setState] = useState<RecorderState>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);

  const mountedRef = useRef(true);
  const stateRef = useRef<RecorderState>({ kind: "idle" });
  const interruptedCallbackRef = useRef(onRecordingInterrupted);
  const capturedRef = useRef(false);
  const recorderRef = useRef(recorder);
  const appStateRef = useRef(AppState.currentState);

  stateRef.current = state;
  interruptedCallbackRef.current = onRecordingInterrupted;
  recorderRef.current = recorder;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopAndSubmit = useCallback(
    async (startedAt: number): Promise<void> => {
      capturedRef.current = true;
      setState({ kind: "submitting" });
      setElapsedMs(getElapsedMs(startedAt));

      const uri = await stopRecorderAndGetUri(recorder).catch(() => null);

      if (!mountedRef.current) return;

      if (!uri) {
        resetRecorderUi(setState, setElapsedMs);
        Alert.alert("Error al grabar", "No se ha podido procesar el audio. Inténtalo de nuevo.");
        return;
      }

      try {
        await onSubmitAudio(uri);
      } finally {
        if (mountedRef.current) {
          resetRecorderUi(setState, setElapsedMs);
        }
      }
    },
    [onSubmitAudio, recorder],
  );

  const cancelRecording = useCallback(async (): Promise<void> => {
    capturedRef.current = true;
    resetRecorderUi(setState, setElapsedMs);
    await stopRecorderAndGetUri(recorder).catch(() => null);
  }, [recorder]);

  useEffect(() => {
    if (state.kind !== "recording") return;

    const interval = setInterval(() => {
      const nextElapsedMs = getElapsedMs(state.startedAt);
      setElapsedMs(nextElapsedMs);

      if (nextElapsedMs >= AUDIO_MAX_DURATION_MS) {
        void stopAndSubmit(state.startedAt);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [state, stopAndSubmit]);

  const captureInFlightRecording = useCallback(async (): Promise<void> => {
    if (capturedRef.current) return;

    const finalState = stateRef.current;
    const interruptedCallback = interruptedCallbackRef.current;

    if (finalState.kind !== "recording" || !interruptedCallback) return;

    capturedRef.current = true;
    stateRef.current = { kind: "idle" };
    resetRecorderUi(setState, setElapsedMs);

    const tempUri = await stopRecorderAndGetUri(recorderRef.current).catch(() => null);
    if (!tempUri) return;

    const persistedUri = await persistRecordingFile(tempUri).catch(() => tempUri);

    await interruptedCallback({
      uri: persistedUri,
      durationMs: getElapsedMs(finalState.startedAt),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        void captureInFlightRecording();
      };
    }, [captureInFlightRecording]),
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      const wasActive = appStateRef.current === "active";
      appStateRef.current = nextState;

      if (wasActive && nextState !== "active") {
        void captureInFlightRecording();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [captureInFlightRecording]);

  useEffect(() => {
    return () => {
      if (stateRef.current.kind === "recording") {
        void captureInFlightRecording();
        return;
      }

      if (!capturedRef.current) {
        void recorderRef.current.stop().catch(() => null);
      }
    };
  }, [captureInFlightRecording]);

  const startRecording = useCallback(async (): Promise<void> => {
    if (disabled) return;

    const granted = await ensureMicrophonePermission({
      deniedMessage: "Necesitamos acceso al micrófono para grabar.",
    });

    if (!granted) return;

    try {
      await enableRecordingMode();
      await recorder.prepareToRecordAsync();
      recorder.record();

      if (!mountedRef.current) return;

      capturedRef.current = false;
      setElapsedMs(0);
      setState({ kind: "recording", startedAt: Date.now() });
    } catch {
      if (!mountedRef.current) return;

      resetRecorderUi(setState, setElapsedMs);
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.");
    }
  }, [disabled, recorder]);

  const handleStartRecording = useCallback(() => {
    if (state.kind !== "idle") return;
    void startRecording();
  }, [startRecording, state.kind]);

  const handleStopRecording = useCallback(() => {
    if (state.kind !== "recording") return;
    void stopAndSubmit(state.startedAt);
  }, [state, stopAndSubmit]);

  const handleCancelRecording = useCallback(() => {
    if (state.kind !== "recording") return;
    void cancelRecording();
  }, [cancelRecording, state.kind]);

  return {
    audioState: state.kind,
    elapsedMs,
    handleStartRecording,
    handleStopRecording,
    handleCancelRecording,
    persistRecordingDraft: captureInFlightRecording,
  };
}
