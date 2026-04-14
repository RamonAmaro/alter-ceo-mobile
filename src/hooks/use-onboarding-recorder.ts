import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useAudioRecorder } from "@/hooks/use-studio-recorder";
import {
  enableRecordingMode,
  MAX_DURATION_MS,
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
  const { startRecording, stopRecording } = useAudioRecorder();

  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const pausedRef = useRef(false);
  const sessionRef = useRef<TranscriptionSession | null>(null);
  const amplitudeRef = useRef<number>(0);
  const prevQuestionIndexRef = useRef(currentQuestionIndex);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishRecording = useCallback(async (): Promise<void> => {
    stopTimer();
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
  }, [stopTimer, stopRecording]);

  const startTimer = useCallback(
    (accumulated: number) => {
      accumulatedMsRef.current = accumulated;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = accumulatedMsRef.current + (Date.now() - startTimeRef.current);
        if (elapsed >= MAX_DURATION_MS) {
          setElapsedMs(MAX_DURATION_MS);
          stopTimer();
          void finishRecording();
        } else {
          setElapsedMs(elapsed);
        }
      }, 50);
    },
    [stopTimer, finishRecording],
  );

  useEffect(() => {
    if (prevQuestionIndexRef.current === currentQuestionIndex) return;
    prevQuestionIndexRef.current = currentQuestionIndex;
    setRecordState("idle");
    setElapsedMs(0);
    setResult(null);
    stopTimer();
    sessionRef.current?.close();
    sessionRef.current = null;
  }, [currentQuestionIndex, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      sessionRef.current?.close();
      sessionRef.current = null;
      void stopRecording().catch(() => {});
    };
  }, [stopTimer, stopRecording]);

  const startNewRecording = useCallback(async (): Promise<void> => {
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
    pausedRef.current = false;
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
    }

    try {
      await startRecording({
        sampleRate: 24000 as never,
        channels: 1,
        encoding: "pcm_16bit",
        interval: 50,
        onAudioStream: async (event) => {
          if (!pausedRef.current && sessionRef.current) {
            sessionRef.current.sendAudioData(event.data as string | Float32Array);
          }
          if (event.data instanceof Float32Array && event.data.length > 0) {
            amplitudeRef.current = computeAmplitudeFromFloat32(event.data);
          } else if (typeof event.data === "string" && event.data.length > 0) {
            amplitudeRef.current = computeAmplitudeFromBase64(event.data);
          }
        },
      });

      setResult(null);
      setElapsedMs(0);
      setRecordState("recording");
      startTimer(0);
    } catch {
      session?.close();
      sessionRef.current = null;
      setRecordState("idle");
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.", [
        { text: "Reintentar", onPress: () => void startNewRecording() },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  }, [startRecording, startTimer]);

  const handleRecord = useCallback(() => {
    void startNewRecording();
  }, [startNewRecording]);

  const handlePause = useCallback(() => {
    pausedRef.current = true;
    stopTimer();
    accumulatedMsRef.current += Date.now() - startTimeRef.current;
    setRecordState("paused");
  }, [stopTimer]);

  const handleResume = useCallback(() => {
    pausedRef.current = false;
    setRecordState("recording");
    startTimer(accumulatedMsRef.current);
  }, [startTimer]);

  const handleFinish = useCallback(() => {
    void finishRecording();
  }, [finishRecording]);

  const handleRestart = useCallback(() => {
    stopTimer();
    sessionRef.current?.close();
    sessionRef.current = null;
    void stopRecording().catch(() => {});
    setRecordState("countdown");
  }, [stopTimer, stopRecording]);

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
