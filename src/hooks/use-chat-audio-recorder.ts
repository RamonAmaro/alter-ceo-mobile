import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  enableRecordingMode,
  MAX_DURATION_MS,
  openAppSettings,
  RecordingPresets,
  requestAudioPermission,
  useAudioRecorder,
} from "@/services/audio-service";

export type ChatAudioState = "idle" | "recording" | "submitting";

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

async function waitForRecorderUri(
  recorder: { uri: string | null },
  timeoutMs = 1500,
  intervalMs = 50,
): Promise<string | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (recorder.uri) {
      return recorder.uri;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return recorder.uri;
}

export function useChatAudioRecorder({
  disabled = false,
  onSubmitAudio,
}: UseChatAudioRecorderOptions): UseChatAudioRecorderResult {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);

  const [audioState, setAudioState] = useState<ChatAudioState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const preparedRef = useRef(false);
  const segmentStartRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const isStoppingRef = useRef(false);
  const audioStateRef = useRef<ChatAudioState>("idle");
  const recorderRef = useRef(recorder);
  const onSubmitAudioRef = useRef(onSubmitAudio);

  audioStateRef.current = audioState;
  recorderRef.current = recorder;
  onSubmitAudioRef.current = onSubmitAudio;

  useEffect(() => {
    return () => {
      if (audioStateRef.current === "recording" || audioStateRef.current === "submitting") {
        recorderRef.current.stop();
      }
    };
  }, []);

  const stopAndSubmitRecording = useCallback(async (): Promise<void> => {
    if (audioState !== "recording" || isStoppingRef.current) return;

    const activeRecorder = recorderRef.current;

    isStoppingRef.current = true;
    accumulatedMsRef.current += Date.now() - segmentStartRef.current;
    segmentStartRef.current = 0;
    setElapsedMs(Math.min(accumulatedMsRef.current, MAX_DURATION_MS));
    setAudioState("submitting");

    activeRecorder.stop();
    preparedRef.current = false;

    const uri = await waitForRecorderUri(activeRecorder);
    if (!uri) {
      accumulatedMsRef.current = 0;
      setElapsedMs(0);
      setAudioState("idle");
      isStoppingRef.current = false;
      Alert.alert("Error al grabar", "No se ha podido procesar el audio. Inténtalo de nuevo.");
      return;
    }

    try {
      await onSubmitAudioRef.current(uri);
    } finally {
      accumulatedMsRef.current = 0;
      setElapsedMs(0);
      setAudioState("idle");
      isStoppingRef.current = false;
    }
  }, [audioState]);

  useEffect(() => {
    if (audioState !== "recording") return;

    const interval = setInterval(() => {
      const nextElapsedMs = Math.min(
        accumulatedMsRef.current +
          (segmentStartRef.current ? Date.now() - segmentStartRef.current : 0),
        MAX_DURATION_MS,
      );

      setElapsedMs(nextElapsedMs);

      if (nextElapsedMs >= MAX_DURATION_MS) {
        void stopAndSubmitRecording();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [audioState, stopAndSubmitRecording]);

  const startRecording = useCallback(async (): Promise<void> => {
    if (disabled) return;

    const activeRecorder = recorderRef.current;

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

    try {
      await enableRecordingMode();

      if (!preparedRef.current) {
        await activeRecorder.prepareToRecordAsync();
        preparedRef.current = true;
      }

      accumulatedMsRef.current = 0;
      segmentStartRef.current = Date.now();
      setElapsedMs(0);
      activeRecorder.record();
      setAudioState("recording");
    } catch {
      preparedRef.current = false;
      setAudioState("idle");
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.");
    }
  }, [disabled]);

  const handleAudioPress = useCallback(() => {
    if (audioState === "idle") {
      void startRecording();
      return;
    }

    if (audioState === "recording") {
      void stopAndSubmitRecording();
    }
  }, [audioState, startRecording, stopAndSubmitRecording]);

  return {
    audioState,
    elapsedMs,
    handleAudioPress,
  };
}
