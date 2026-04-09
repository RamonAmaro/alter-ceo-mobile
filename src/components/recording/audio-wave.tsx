import { useEffect, useRef } from "react";
import type { AudioRecorderLike } from "@/types/audio";

import { AudioWaveform } from "@/components/audio-waveform";

// --- Constants -----------------------------------------------------------

const METERING_INTERVAL_MS = 100;
const DB_FLOOR = -60;
const DB_CEILING = 0;

// --- Types ---------------------------------------------------------------

type AudioWaveProps =
  | {
      isActive: boolean;
      isReset: boolean;
      recorder: AudioRecorderLike;
      amplitudeRef?: never;
    }
  | {
      isActive: boolean;
      isReset: boolean;
      amplitudeRef: React.RefObject<number>;
      recorder?: never;
    };

// --- Pure helpers --------------------------------------------------------

/** Converts a dB value (typically -60..0) to a normalized 0-1 amplitude. */
function normalizeDecibels(db: number): number {
  const clamped = Math.max(DB_FLOOR, Math.min(DB_CEILING, db));
  return (clamped - DB_FLOOR) / (DB_CEILING - DB_FLOOR);
}

// --- Component -----------------------------------------------------------

export function AudioWave({ isActive, isReset, recorder, amplitudeRef }: AudioWaveProps) {
  const levelRef = useRef(0);
  const resetCountRef = useRef(0);

  useEffect(() => {
    if (!isActive || !recorder) return;

    const rec = recorder;

    const intervalId = setInterval(() => {
      const metering = rec.getStatus().metering ?? DB_FLOOR;
      levelRef.current = normalizeDecibels(metering);
    }, METERING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isActive, recorder]);

  useEffect(() => {
    if (isReset) {
      resetCountRef.current += 1;
      levelRef.current = 0;
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
