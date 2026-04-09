import { useCallback, useEffect, useRef } from "react";

interface AudioStreamEvent {
  data: string | Float32Array;
}

interface StartRecordingOptions {
  sampleRate?: number;
  channels?: number;
  encoding?: string;
  interval?: number;
  onAudioStream?: (event: AudioStreamEvent) => void;
}

interface StopRecordingResult {
  fileUri: string;
}

interface StudioRecorder {
  startRecording: (options: StartRecordingOptions) => Promise<void>;
  stopRecording: () => Promise<StopRecordingResult | null>;
}

function resampleLinear(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const length = Math.round(input.length / ratio);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const srcIdx = i * ratio;
    const floor = Math.floor(srcIdx);
    const frac = srcIdx - floor;
    const a = input[floor] ?? 0;
    const b = input[Math.min(floor + 1, input.length - 1)] ?? 0;
    output[i] = a + frac * (b - a);
  }
  return output;
}

function float32ToPcm16Base64(samples: Float32Array): string {
  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  const CHUNK = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(""));
}

export function useAudioRecorder(): StudioRecorder {
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const callbackRef = useRef<((event: AudioStreamEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      processorRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const startRecording = useCallback(async (options: StartRecordingOptions) => {
    const targetRate = options.sampleRate ?? 16000;
    callbackRef.current = options.onAudioStream ?? null;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: options.channels ?? 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    let audioCtx: AudioContext;
    try {
      audioCtx = new AudioContext({ sampleRate: targetRate });
    } catch {
      audioCtx = new AudioContext();
    }
    audioCtxRef.current = audioCtx;
    const actualRate = audioCtx.sampleRate;

    const source = audioCtx.createMediaStreamSource(stream);
    const bufferSize = 2048;
    const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      // Silence output to prevent mic feedback on web
      e.outputBuffer.getChannelData(0).fill(0);

      if (!callbackRef.current) return;

      const raw = e.inputBuffer.getChannelData(0);
      const resampled =
        actualRate !== targetRate
          ? resampleLinear(raw, actualRate, targetRate)
          : new Float32Array(raw);

      const base64 = float32ToPcm16Base64(resampled);
      callbackRef.current({ data: base64 });
    };

    source.connect(processor);
    // Connect through a silent gain node to prevent audio playback
    const silencer = audioCtx.createGain();
    silencer.gain.value = 0;
    processor.connect(silencer);
    silencer.connect(audioCtx.destination);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorderRef.current = recorder;
    recorder.start(options.interval ?? 100);
  }, []);

  const stopRecording = useCallback(async (): Promise<StopRecordingResult | null> => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      return null;
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const fileUri = URL.createObjectURL(blob);

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;

        resolve({ fileUri });
      };
      recorder.stop();
    });
  }, []);

  return { startRecording, stopRecording };
}
