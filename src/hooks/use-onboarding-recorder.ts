import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useAudioRecorder } from "@siteed/audio-studio";
import type { AudioDataEvent } from "@siteed/audio-studio";

import {
  enableRecordingMode,
  openAppSettings,
  requestAudioPermission,
} from "@/services/audio-service";
import type { TranscriptionSession } from "@/services/transcription-service";
import { createTranscriptionSession } from "@/services/transcription-service";
import { computeAmplitudeFromBase64, computeAmplitudeFromFloat32 } from "@/utils/compute-amplitude";

export type RecordingState =
  | "idle"
  | "preparing"
  | "recording"
  | "paused"
  | "finishing"
  | "done"
  | "countdown";

export interface RecordingResult {
  readonly uri: string;
  readonly transcript: string | null;
}

interface OnboardingRecorder {
  readonly recordState: RecordingState;
  readonly elapsedMs: number;
  readonly result: RecordingResult | null;
  readonly transcriptionError: string | null;
  readonly amplitudeRef: React.RefObject<number>;
  readonly handleRecord: () => void;
  readonly handlePause: () => void;
  readonly handleResume: () => void;
  readonly handleFinish: () => void;
  readonly handleRestart: () => void;
  readonly handleCountdownComplete: () => void;
}

export function useOnboardingRecorder(currentQuestionIndex: number): OnboardingRecorder {
  const { startRecording, stopRecording, pauseRecording, resumeRecording, durationMs } =
    useAudioRecorder();

  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const sessionRef = useRef<TranscriptionSession | null>(null);
  const amplitudeRef = useRef<number>(0);
  const prevQuestionIndexRef = useRef(currentQuestionIndex);
  const finishingRef = useRef(false);
  const startingRef = useRef(false);

  const elapsedMs = durationMs;

  const finishRecording = useCallback(async (): Promise<void> => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setRecordState("finishing");

    const session = sessionRef.current;
    sessionRef.current = null;

    const [recordingResult, transcriptText] = await Promise.all([
      stopRecording().catch(() => null),
      session
        ? session.stop().catch(() => {
            session.close();
            return "";
          })
        : Promise.resolve(""),
    ]);

    setResult({
      uri: recordingResult?.fileUri ?? "",
      transcript: transcriptText || null,
    });
    setRecordState("done");
    finishingRef.current = false;
  }, [stopRecording]);

  // Reset when question changes
  useEffect(() => {
    if (prevQuestionIndexRef.current === currentQuestionIndex) return;
    prevQuestionIndexRef.current = currentQuestionIndex;
    setRecordState("idle");
    setResult(null);
    sessionRef.current?.close();
    sessionRef.current = null;
  }, [currentQuestionIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      sessionRef.current = null;
      void stopRecording().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function extractAmplitude(event: AudioDataEvent): void {
    if (event.data instanceof Float32Array && event.data.length > 0) {
      amplitudeRef.current = computeAmplitudeFromFloat32(event.data);
    } else if (typeof event.data === "string" && event.data.length > 0) {
      amplitudeRef.current = computeAmplitudeFromBase64(event.data);
    }
  }

  const startNewRecording = useCallback(async (): Promise<void> => {
    if (startingRef.current || finishingRef.current) return;
    startingRef.current = true;

    const { granted, canAskAgain } = await requestAudioPermission().catch(() => ({
      granted: false,
      canAskAgain: true,
    }));

    if (!granted) {
      startingRef.current = false;
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
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso al micrófono para grabar tu respuesta. Pulsa el botón de grabación para intentarlo de nuevo.",
        );
      }
      return;
    }

    await enableRecordingMode();

    sessionRef.current?.close();
    sessionRef.current = null;
    finishingRef.current = false;
    setRecordState("preparing");

    let session: TranscriptionSession | null = null;
    setTranscriptionError(null);
    try {
      session = await createTranscriptionSession();
      session.onError((errorMsg) => {
        setTranscriptionError(errorMsg);
      });
      sessionRef.current = session;
    } catch {
      sessionRef.current = null;
      setTranscriptionError(
        "No se pudo conectar al servicio de transcripción. La grabación seguirá funcionando.",
      );
    }

    try {
      await startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: "pcm_16bit",
        interval: 50,
        onAudioStream: async (event: AudioDataEvent) => {
          if (sessionRef.current) {
            sessionRef.current.sendAudioData(event.data as string | Float32Array);
          }
          extractAmplitude(event);
        },
      });

      setResult(null);
      setRecordState("recording");
    } catch {
      session?.close();
      sessionRef.current = null;
      setRecordState("idle");
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.", [
        { text: "Reintentar", onPress: () => void startNewRecording() },
        { text: "Cancelar", style: "cancel" },
      ]);
    } finally {
      startingRef.current = false;
    }
  }, [startRecording]);

  const handleRecord = useCallback(() => {
    void startNewRecording();
  }, [startNewRecording]);

  const handlePause = useCallback(() => {
    void pauseRecording();
    setRecordState("paused");
  }, [pauseRecording]);

  const handleResume = useCallback(() => {
    void resumeRecording();
    setRecordState("recording");
  }, [resumeRecording]);

  const handleFinish = useCallback(() => {
    void finishRecording();
  }, [finishRecording]);

  const handleRestart = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    void stopRecording().catch(() => {});
    setRecordState("countdown");
  }, [stopRecording]);

  const handleCountdownComplete = useCallback(() => {
    void startNewRecording();
  }, [startNewRecording]);

  return {
    recordState,
    elapsedMs,
    result,
    transcriptionError,
    amplitudeRef,
    handleRecord,
    handlePause,
    handleResume,
    handleFinish,
    handleRestart,
    handleCountdownComplete,
  };
}
