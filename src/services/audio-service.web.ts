import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioPermissionResult {
  readonly granted: boolean;
  readonly canAskAgain: boolean;
}

export async function checkAudioPermission(): Promise<AudioPermissionResult> {
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return { granted: status.state === "granted", canAskAgain: status.state !== "denied" };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

export async function requestAudioPermission(): Promise<AudioPermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return { granted: true, canAskAgain: true };
  } catch {
    return { granted: false, canAskAgain: false };
  }
}

export function openAppSettings(): void {
  // Web has no app settings — browser handles permissions natively
}

export async function enableRecordingMode(): Promise<void> {}

interface Recorder {
  readonly uri: string | null;
  stop(): Promise<string | null> | Promise<unknown>;
}

export async function stopRecorderAndGetUri(recorder: Recorder): Promise<string | null> {
  const result = await recorder.stop();
  if (typeof result === "string" || result === null) return result;
  return recorder.uri;
}

interface RecordingStatus {
  metering?: number;
}

interface WebAudioRecorder {
  prepareToRecordAsync: () => Promise<void>;
  record: () => void;
  pause: () => void;
  stop: () => Promise<string | null>;
  getStatus: () => RecordingStatus;
  uri: string | null;
}

interface RecordingOptions {
  isMeteringEnabled?: boolean;
}

export const RecordingPresets = {
  HIGH_QUALITY: {} as RecordingOptions,
};

const DB_FLOOR = -60;

export function useAudioRecorder(_options?: RecordingOptions): WebAudioRecorder {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const uriRef = useRef<string | null>(null);
  const pendingStopResolverRef = useRef<((uri: string | null) => void) | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return () => {
      if (uriRef.current) {
        URL.revokeObjectURL(uriRef.current);
        uriRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const computeMetering = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return DB_FLOOR;

    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    const db = rms > 0 ? 20 * Math.log10(rms) : DB_FLOOR;
    return Math.max(DB_FLOOR, Math.min(0, db));
  }, []);

  const buildUri = useCallback((): string | null => {
    if (chunksRef.current.length === 0) return null;
    if (uriRef.current) {
      URL.revokeObjectURL(uriRef.current);
    }
    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
    uriRef.current = URL.createObjectURL(blob);
    forceUpdate((n) => n + 1);
    return uriRef.current;
  }, []);

  const prepareToRecordAsync = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;

    // Browsers differ on supported MIME types: desktop Chrome/Firefox do webm;opus,
    // Safari/iOS only do mp4, some Android webviews only do ogg. Probe in order
    // so we always record with a type the browser actually accepts — falling
    // back to a blank string lets the browser pick its default.
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    mimeTypeRef.current = mimeType || "audio/webm";

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    // Some browsers substitute the requested type. Trust what the recorder ends up with.
    if (recorder.mimeType) mimeTypeRef.current = recorder.mimeType;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const uri = buildUri();
      const resolve = pendingStopResolverRef.current;
      pendingStopResolverRef.current = null;
      resolve?.(uri);
    };

    recorderRef.current = recorder;
  }, [buildUri]);

  const record = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    if (recorder.state === "paused") {
      recorder.resume();
    } else if (recorder.state === "inactive") {
      chunksRef.current = [];
      if (uriRef.current) {
        URL.revokeObjectURL(uriRef.current);
        uriRef.current = null;
      }
      recorder.start(100);
    }
  }, []);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
    }
  }, []);

  const stop = useCallback((): Promise<string | null> => {
    const recorder = recorderRef.current;

    const cleanup = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };

    if (!recorder || recorder.state === "inactive") {
      cleanup();
      return Promise.resolve(uriRef.current);
    }

    const uriPromise = new Promise<string | null>((resolve) => {
      pendingStopResolverRef.current = resolve;
    });

    recorder.requestData();
    recorder.stop();

    return uriPromise.finally(cleanup);
  }, []);

  const getStatus = useCallback((): RecordingStatus => {
    return { metering: computeMetering() };
  }, [computeMetering]);

  return {
    prepareToRecordAsync,
    record,
    pause,
    stop,
    getStatus,
    get uri() {
      return uriRef.current;
    },
  };
}
