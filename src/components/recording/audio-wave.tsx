import { useEffect, useRef } from "react";
import type { AudioRecorder } from "expo-audio";

import { AudioWaveform } from "@/components/audio-waveform";

type AudioWaveProps =
  | { isActive: boolean; isReset: boolean; recorder: AudioRecorder; amplitudeRef?: never }
  | {
      isActive: boolean;
      isReset: boolean;
      amplitudeRef: React.RefObject<number>;
      recorder?: never;
    };

function normalizeLevel(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  return (clamped + 60) / 60;
}

export function AudioWave({ isActive, isReset, recorder, amplitudeRef }: AudioWaveProps) {
  const levelRef = useRef(0);
  const resetCountRef = useRef(0);

  useEffect(() => {
    if (!isActive || !recorder) return;

    const id = setInterval(() => {
      levelRef.current = normalizeLevel(recorder.getStatus().metering ?? -60);
    }, 50);

    return () => clearInterval(id);
  }, [isActive, recorder]);

  useEffect(() => {
    if (isReset) {
      resetCountRef.current += 1;
    }
  }, [isReset]);

  const source = recorder ? levelRef : amplitudeRef;

  return (
    <AudioWaveform
      amplitudeRef={source as React.RefObject<number>}
      active={isActive}
      resetKey={resetCountRef.current}
    />
  );
}
