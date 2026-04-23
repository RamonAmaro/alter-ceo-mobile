import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useFocusEffect } from "expo-router";

import { AUDIO_MAX_DURATION_MS } from "@/constants/audio";

// TODO(native): draft de áudio ao blur/unmount — ver CHAT_AUDIO_DRAFT_ON_LEAVE_UNSTABLE_ON_NATIVE em `@/constants/audio`.
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

  // Guard contra dupla captura: no Expo Router nativo, um pop da tela dispara
  // `useFocusEffect` cleanup (blur) E em seguida `useEffect` cleanup (unmount).
  // Sem esse flag, a segunda chamada tentaria parar um recorder já parado,
  // resultando em "Unable to find the native shared object" (expo-audio).
  const capturedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopAndSubmit = useCallback(
    async (startedAt: number): Promise<void> => {
      // Marca como "já capturado": se a tela perder foco durante o envio,
      // `captureInFlightRecording` deve ser no-op (o áudio está sendo enviado,
      // não é um draft).
      capturedRef.current = true;
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
    // Mesma ideia do stopAndSubmit: ao cancelar, o áudio é explicitamente
    // descartado — nenhum draft deve ser criado se a tela perder foco agora.
    capturedRef.current = true;
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

  // Captura a gravação em andamento e entrega à tela como draft. Sem isso,
  // o recorder seria parado e o áudio descartado silenciosamente. O flag
  // `capturedRef` é idempotente: múltiplas chamadas (ex: blur + unmount em
  // sequência) só acionam a lógica uma vez — a segunda tentaria operar num
  // recorder já parado, que o expo-audio rejeita com "Unable to find the
  // native shared object".
  //
  // O ref ao `recorder` é mantido num ref separado (não deps de useCallback)
  // para que esta função seja estável entre renders — caso contrário o
  // `useFocusEffect` abaixo re-registraria o listener a cada render, podendo
  // disparar cleanups espúrios.
  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;

  const captureInFlightRecording = useCallback(() => {
    if (capturedRef.current) return;
    const finalState = stateRef.current;
    const callback = interruptedCallbackRef.current;
    if (finalState.kind !== "recording" || !callback) return;

    capturedRef.current = true;
    const durationMs = Math.min(Date.now() - finalState.startedAt, AUDIO_MAX_DURATION_MS);
    stateRef.current = { kind: "idle" };
    setState({ kind: "idle" });
    setElapsedMs(0);

    const currentRecorder = recorderRef.current;
    void (async () => {
      const tempUri = await stopRecorderAndGetUri(currentRecorder).catch(() => null);
      if (!tempUri) return;
      try {
        const persistedUri = await persistRecordingFile(tempUri);
        callback({ uri: persistedUri, durationMs });
      } catch {
        callback({ uri: tempUri, durationMs });
      }
    })();
    // Sem deps intencional: refs estáveis para evitar re-registrar efeitos.
  }, []);

  // No Expo Router, o `Stack` nativo **não desmonta** a tela ao navegar —
  // ela fica montada em segundo plano. Isso significa que `useEffect` cleanup
  // só roda em unmount real (pop do stack, troca de usuário, reload). Para
  // capturar o caso comum de "usuário navegou pra outra tela", usamos
  // `useFocusEffect` cujo cleanup roda no blur.
  useFocusEffect(
    useCallback(() => {
      return () => {
        captureInFlightRecording();
      };
    }, [captureInFlightRecording]),
  );

  // Rede de segurança para unmount real (reload no web, logout, pop do
  // stack). Na maioria das vezes o `useFocusEffect` acima já capturou o
  // draft e resetou o state — a condição abaixo só entra quando o unmount
  // acontece sem passar por um blur.
  useEffect(() => {
    return () => {
      const finalState = stateRef.current;
      if (finalState.kind === "recording") {
        captureInFlightRecording();
        return;
      }
      void recorderRef.current.stop();
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
      // Reset do guard de captura: uma nova sessão de gravação deve poder ser
      // capturada de novo ao sair da tela, mesmo que a anterior já tenha sido.
      capturedRef.current = false;
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
