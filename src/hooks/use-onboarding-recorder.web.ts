import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { AUDIO_MAX_DURATION_MS } from "@/constants/audio";
import {
  enableRecordingMode,
  openAppSettings,
  requestAudioPermission,
} from "@/services/audio-service";
import type { TranscriptionSession } from "@/services/transcription-service";
import { createTranscriptionSession } from "@/services/transcription-service";
import { computeAmplitudeFromFloat32 } from "@/utils/compute-amplitude";

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

const TARGET_SAMPLE_RATE = 16000;
const ANALYSER_FFT_SIZE = 2048;
const METERING_INTERVAL_MS = 50;
const STREAM_CHUNK_SIZE = 4096;
const TIMER_INTERVAL_MS = 100;

function downsampleTo16k(input: Float32Array, inputRate: number): Float32Array {
  if (inputRate === TARGET_SAMPLE_RATE) return input;
  const ratio = inputRate / TARGET_SAMPLE_RATE;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const srcFloor = Math.floor(srcIndex);
    const srcCeil = Math.min(srcFloor + 1, input.length - 1);
    const frac = srcIndex - srcFloor;
    out[i] = input[srcFloor] * (1 - frac) + input[srcCeil] * frac;
  }
  return out;
}

function createAudioContextSafe(): AudioContext {
  const AudioCtor: typeof AudioContext =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  try {
    return new AudioCtor({ sampleRate: TARGET_SAMPLE_RATE });
  } catch {
    return new AudioCtor();
  }
}

// Temporary debug log — remove after the multi-question recording issue is fixed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debugLog(tag: string, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.log(`[onboarding-recorder/web] ${tag}`, ...args);
}

interface WebRecorderHandles {
  readonly mediaRecorder: MediaRecorder;
  readonly stream: MediaStream;
  readonly audioCtx: AudioContext;
  readonly analyser: AnalyserNode;
  readonly processor: ScriptProcessorNode;
  readonly source: MediaStreamAudioSourceNode;
  readonly chunks: Blob[];
  readonly mimeType: string;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "";
}

export function useOnboardingRecorder(currentQuestionIndex: number): OnboardingRecorder {
  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const sessionRef = useRef<TranscriptionSession | null>(null);
  const amplitudeRef = useRef<number>(0);
  const prevQuestionIndexRef = useRef(currentQuestionIndex);
  const finishingRef = useRef(false);
  const handlesRef = useRef<WebRecorderHandles | null>(null);
  const uriRef = useRef<string | null>(null);
  const meterIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);

  const clearMeterLoop = useCallback(() => {
    if (meterIdRef.current !== null) {
      clearInterval(meterIdRef.current);
      meterIdRef.current = null;
    }
  }, []);

  const clearTimerLoop = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const startMeterLoop = useCallback(() => {
    clearMeterLoop();
    meterIdRef.current = setInterval(() => {
      const handles = handlesRef.current;
      if (!handles) return;
      const data = new Float32Array(handles.analyser.fftSize);
      handles.analyser.getFloatTimeDomainData(data);
      amplitudeRef.current = computeAmplitudeFromFloat32(data);
    }, METERING_INTERVAL_MS);
  }, [clearMeterLoop]);

  const startTimerLoop = useCallback(() => {
    clearTimerLoop();
    startedAtRef.current = Date.now();
    timerIdRef.current = setInterval(() => {
      const now = Date.now();
      const total = accumulatedMsRef.current + (now - startedAtRef.current);
      setElapsedMs(Math.min(total, AUDIO_MAX_DURATION_MS));
    }, TIMER_INTERVAL_MS);
  }, [clearTimerLoop]);

  const pauseTimerLoop = useCallback(() => {
    if (timerIdRef.current !== null) {
      accumulatedMsRef.current += Date.now() - startedAtRef.current;
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const releaseHandles = useCallback(() => {
    const handles = handlesRef.current;
    handlesRef.current = null;
    if (!handles) return;

    try {
      handles.processor.disconnect();
      handles.analyser.disconnect();
      handles.source.disconnect();
    } catch {
      // ignore
    }
    handles.stream.getTracks().forEach((t) => t.stop());
    handles.audioCtx.close().catch(() => {});
  }, []);

  const stopWebRecorder = useCallback((): Promise<string | null> => {
    const handles = handlesRef.current;
    if (!handles) return Promise.resolve(uriRef.current);

    const rec = handles.mediaRecorder;
    if (rec.state === "inactive") {
      releaseHandles();
      return Promise.resolve(uriRef.current);
    }

    return new Promise<string | null>((resolve) => {
      rec.onstop = () => {
        if (uriRef.current) {
          URL.revokeObjectURL(uriRef.current);
          uriRef.current = null;
        }
        if (handles.chunks.length > 0) {
          const blob = new Blob(handles.chunks, { type: handles.mimeType || "audio/webm" });
          uriRef.current = URL.createObjectURL(blob);
        }
        releaseHandles();
        resolve(uriRef.current);
      };
      try {
        rec.requestData();
      } catch {
        // ignore
      }
      rec.stop();
    });
  }, [releaseHandles]);

  const finishRecording = useCallback(async (): Promise<void> => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    debugLog("finishRecording:begin", { hasSession: sessionRef.current !== null });
    setRecordState("finishing");

    clearMeterLoop();
    pauseTimerLoop();

    const session = sessionRef.current;
    sessionRef.current = null;

    const [uri, transcriptText] = await Promise.all([
      stopWebRecorder().catch(() => null),
      session
        ? session.stop().catch((err) => {
            debugLog("session.stop:error", err);
            session.close();
            return "";
          })
        : Promise.resolve(""),
    ]);

    debugLog("finishRecording:end", {
      uri: uri ?? null,
      transcriptLength: transcriptText?.length ?? 0,
      transcriptPreview: transcriptText ? transcriptText.slice(0, 60) : null,
    });

    setResult({
      uri: uri ?? "",
      transcript: transcriptText || null,
    });
    setRecordState("done");
    finishingRef.current = false;
  }, [clearMeterLoop, pauseTimerLoop, stopWebRecorder]);

  // Auto-stop at max duration
  useEffect(() => {
    if (elapsedMs >= AUDIO_MAX_DURATION_MS && recordState === "recording") {
      void finishRecording();
    }
  }, [elapsedMs, recordState, finishRecording]);

  // Reset when question changes
  useEffect(() => {
    if (prevQuestionIndexRef.current === currentQuestionIndex) return;
    prevQuestionIndexRef.current = currentQuestionIndex;
    setRecordState("idle");
    setResult(null);
    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    sessionRef.current?.close();
    sessionRef.current = null;
  }, [currentQuestionIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMeterLoop();
      clearTimerLoop();
      sessionRef.current?.close();
      sessionRef.current = null;
      const handles = handlesRef.current;
      if (handles && handles.mediaRecorder.state !== "inactive") {
        try {
          handles.mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
      releaseHandles();
      if (uriRef.current) {
        URL.revokeObjectURL(uriRef.current);
        uriRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRecording = useCallback(async (): Promise<void> => {
    debugLog("startNewRecording:begin", { questionIndex: currentQuestionIndex });
    const { granted, canAskAgain } = await requestAudioPermission();

    if (!granted) {
      if (!canAskAgain) {
        Alert.alert(
          "Micrófono desactivado",
          "Activa el permiso de micrófono en los ajustes de tu navegador para poder grabar.",
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
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setRecordState("preparing");

    let session: TranscriptionSession | null = null;
    setTranscriptionError(null);
    try {
      debugLog("createTranscriptionSession:before");
      session = await createTranscriptionSession();
      debugLog("createTranscriptionSession:after", { ok: true });
      session.onError((errorMsg) => {
        debugLog("session.onError", errorMsg);
        setTranscriptionError(errorMsg);
      });
      sessionRef.current = session;
    } catch (err) {
      debugLog("createTranscriptionSession:error", err);
      sessionRef.current = null;
      setTranscriptionError(
        "No se pudo conectar al servicio de transcripción. La grabación seguirá funcionando.",
      );
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = createAudioContextSafe();
      if (audioCtx.state === "suspended") {
        try {
          await audioCtx.resume();
          debugLog("audioCtx.resume:ok", { state: audioCtx.state });
        } catch (err) {
          debugLog("audioCtx.resume:error", err);
        }
      }
      const actualRate = audioCtx.sampleRate;
      const needsResample = actualRate !== TARGET_SAMPLE_RATE;

      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = ANALYSER_FFT_SIZE;
      source.connect(analyser);

      const processor = audioCtx.createScriptProcessor(STREAM_CHUNK_SIZE, 1, 1);
      let chunkCount = 0;
      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const copy = new Float32Array(input.length);
        copy.set(input);
        const payload = needsResample ? downsampleTo16k(copy, actualRate) : copy;
        const hasSession = sessionRef.current !== null;
        if (chunkCount < 3 || chunkCount % 50 === 0) {
          debugLog("processor.chunk", {
            n: chunkCount,
            hasSession,
            length: payload.length,
            actualRate,
            needsResample,
          });
        }
        chunkCount += 1;
        sessionRef.current?.sendAudioData(payload);
      };
      source.connect(processor);
      processor.connect(audioCtx.destination);

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      handlesRef.current = {
        mediaRecorder: recorder,
        stream,
        audioCtx,
        analyser,
        processor,
        source,
        chunks,
        mimeType: mimeType || recorder.mimeType || "audio/webm",
      };

      recorder.start(100);

      setResult(null);
      setRecordState("recording");
      startMeterLoop();
      startTimerLoop();
    } catch {
      session?.close();
      sessionRef.current = null;
      releaseHandles();
      setRecordState("idle");
      Alert.alert("Error al grabar", "No se pudo iniciar la grabación. Inténtalo de nuevo.", [
        { text: "Reintentar", onPress: () => void startNewRecording() },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  }, [releaseHandles, startMeterLoop, startTimerLoop]);

  const handleRecord = useCallback(() => {
    void startNewRecording();
  }, [startNewRecording]);

  const handlePause = useCallback(() => {
    const handles = handlesRef.current;
    if (handles && handles.mediaRecorder.state === "recording") {
      handles.mediaRecorder.pause();
    }
    pauseTimerLoop();
    clearMeterLoop();
    amplitudeRef.current = 0;
    setRecordState("paused");
  }, [clearMeterLoop, pauseTimerLoop]);

  const handleResume = useCallback(() => {
    const handles = handlesRef.current;
    if (handles && handles.mediaRecorder.state === "paused") {
      handles.mediaRecorder.resume();
    }
    startTimerLoop();
    startMeterLoop();
    setRecordState("recording");
  }, [startMeterLoop, startTimerLoop]);

  const handleFinish = useCallback(() => {
    void finishRecording();
  }, [finishRecording]);

  const handleRestart = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    clearMeterLoop();
    clearTimerLoop();
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    const handles = handlesRef.current;
    if (handles && handles.mediaRecorder.state !== "inactive") {
      try {
        handles.mediaRecorder.onstop = null;
        handles.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    releaseHandles();
    setRecordState("countdown");
  }, [clearMeterLoop, clearTimerLoop, releaseHandles]);

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
