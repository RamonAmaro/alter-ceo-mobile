import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

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
  // Chamado quando a gravação é interrompida por unmount/navegação (não por
  // cancelar/enviar explícitos). Permite à tela persistir o audio como draft.
  readonly onRecordingInterrupted?: (draft: ChatAudioDraftPayload) => void;
}

interface UseChatAudioRecorderResult {
  readonly audioState: ChatAudioState;
  readonly elapsedMs: number;
  readonly handleStartRecording: () => void;
  readonly handleStopRecording: () => void;
  readonly handleCancelRecording: () => void;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useChatAudioRecorder({
  disabled = false,
  onSubmitAudio,
  onRecordingInterrupted,
}: UseChatAudioRecorderOptions): UseChatAudioRecorderResult {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);

  const [state, setState] = useState<RecorderState>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);

  const mountedRef = useRef(true);
  // Mantém o último estado em ref para o cleanup de unmount conseguir ler
  // sincronamente sem depender de deps. React limpa useEffect em ordem reversa,
  // então o cleanup do unmount final lê o ref pra decidir se salva um draft.
  const stateRef = useRef<RecorderState>({ kind: "idle" });
  stateRef.current = state;

  const interruptedCallbackRef = useRef(onRecordingInterrupted);
  interruptedCallbackRef.current = onRecordingInterrupted;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopAndSubmit = useCallback(
    async (startedAt: number): Promise<void> => {
      setState({ kind: "submitting" });
      setElapsedMs(Math.min(Date.now() - startedAt, AUDIO_MAX_DURATION_MS));

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

  const cancelRecording = useCallback(async (): Promise<void> => {
    setState({ kind: "idle" });
    setElapsedMs(0);
    await stopRecorderAndGetUri(recorder).catch(() => null);
  }, [recorder]);

  useEffect(() => {
    if (state.kind !== "recording") return;

    const tick = () => {
      const next = Math.min(Date.now() - state.startedAt, AUDIO_MAX_DURATION_MS);
      setElapsedMs(next);
      if (next >= AUDIO_MAX_DURATION_MS) {
        void stopAndSubmit(state.startedAt);
      }
    };

    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [state, stopAndSubmit]);

  useEffect(() => {
    return () => {
      // Ao desmontar durante gravação (usuário saiu da tela, app foi recarregado,
      // logout), capturamos o áudio parcial e entregamos à tela via callback
      // para virar um draft. Sem isso, o áudio seria descartado silenciosamente.
      const finalState = stateRef.current;
      const callback = interruptedCallbackRef.current;
      if (finalState.kind === "recording" && callback) {
        const durationMs = Math.min(Date.now() - finalState.startedAt, AUDIO_MAX_DURATION_MS);
        void (async () => {
          const tempUri = await stopRecorderAndGetUri(recorder).catch(() => null);
          if (!tempUri) return;
          try {
            const persistedUri = await persistRecordingFile(tempUri);
            callback({ uri: persistedUri, durationMs });
          } catch {
            callback({ uri: tempUri, durationMs });
          }
        })();
        return;
      }
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

  const handleStartRecording = useCallback(() => {
    if (state.kind !== "idle") return;
    void startRecording();
  }, [state.kind, startRecording]);

  const handleStopRecording = useCallback(() => {
    if (state.kind !== "recording") return;
    void stopAndSubmit(state.startedAt);
  }, [state, stopAndSubmit]);

  const handleCancelRecording = useCallback(() => {
    if (state.kind !== "recording") return;
    void cancelRecording();
  }, [state.kind, cancelRecording]);

  return {
    audioState: state.kind,
    elapsedMs,
    handleStartRecording,
    handleStopRecording,
    handleCancelRecording,
  };
}
