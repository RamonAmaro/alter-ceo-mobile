import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  enableRecordingMode,
  MAX_DURATION_MS,
  RecordingPresets,
  stopRecorderAndGetUri,
  useAudioRecorder,
} from "@/services/audio-service";
import { ensureMicrophonePermission } from "@/utils/ensure-microphone-permission";

export type ChatAudioState = "idle" | "recording" | "submitting";

type RecorderState =
  | { readonly kind: "idle" }
  | { readonly kind: "recording"; readonly startedAt: number }
  | { readonly kind: "submitting" };

interface UseChatAudioRecorderOptions {
  readonly disabled?: boolean;
  readonly onSubmitAudio: (uri: string) => Promise<void>;
}

interface UseChatAudioRecorderResult {
  readonly audioState: ChatAudioState;
  readonly elapsedMs: number;
  readonly handleAudioPress: () => void;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useChatAudioRecorder({
  disabled = false,
  onSubmitAudio,
}: UseChatAudioRecorderOptions): UseChatAudioRecorderResult {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);

  const [state, setState] = useState<RecorderState>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopAndSubmit = useCallback(
    async (startedAt: number): Promise<void> => {
      setState({ kind: "submitting" });
      setElapsedMs(Math.min(Date.now() - startedAt, MAX_DURATION_MS));

      const uri = await stopRecorderAndGetUri(recorder).catch(() => null);

      if (!mountedRef.current) return;

      if (!uri) {
        setState({ kind: "idle" });
        setElapsedMs(0);
        Alert.alert("Error al grabar", "No se ha podido procesar el audio. Inténtalo de nuevo.");
        return;
      }

      try {
        await onSubmitAudio(uri);
      } finally {
        if (mountedRef.current) {
          setState({ kind: "idle" });
          setElapsedMs(0);
        }
      }
    },
    [recorder, onSubmitAudio],
  );

  useEffect(() => {
    if (state.kind !== "recording") return;

    const tick = () => {
      const next = Math.min(Date.now() - state.startedAt, MAX_DURATION_MS);
      setElapsedMs(next);
      if (next >= MAX_DURATION_MS) {
        void stopAndSubmit(state.startedAt);
      }
    };

    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [state, stopAndSubmit]);

  useEffect(() => {
    return () => {
      void recorder.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setElapsedMs(0);
      setState({ kind: "recording", startedAt: Date.now() });
    } catch {
      if (!mountedRef.current) return;
      setState({ kind: "idle" });
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.");
    }
  }, [disabled, recorder]);

  const handleAudioPress = useCallback(() => {
    if (state.kind === "idle") {
      void startRecording();
      return;
    }
    if (state.kind === "recording") {
      void stopAndSubmit(state.startedAt);
    }
  }, [state, startRecording, stopAndSubmit]);

  return {
    audioState: state.kind,
    elapsedMs,
    handleAudioPress,
  };
}
