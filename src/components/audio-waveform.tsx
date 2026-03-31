import React, { memo, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

// --- Layout constants ----------------------------------------------------

const BAR_WIDTH = 4;
const BAR_GAP = 4;
const HEIGHT = 120;
const WIDTH_RATIO = 0.75;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CONTAINER_WIDTH = Math.floor(SCREEN_WIDTH * WIDTH_RATIO);
const BAR_COUNT = Math.floor(CONTAINER_WIDTH / (BAR_WIDTH + BAR_GAP));

// --- Animation constants -------------------------------------------------

const MIN_SCALE = 0.05;
const TICK_MS = 120;
const EMA_ALPHA = 0.4;

// --- Pure functions ------------------------------------------------------

function computeBarColor(index: number, total: number): string {
  const progress = index / (total - 1);
  const opacity = 0.3 + progress * 0.7;
  const r = Math.round(progress * 30);
  const g = Math.round(140 + progress * 80);
  return `rgba(${r},${g},255,${opacity.toFixed(2)})`;
}

function smoothAmplitude(previous: number, current: number): number {
  return previous * (1 - EMA_ALPHA) + current * EMA_ALPHA;
}

function shiftBufferAndAppend(buffer: Float32Array, value: number): void {
  buffer.copyWithin(0, 1);
  buffer[buffer.length - 1] = value;
}

function applyScalesToSharedValues(scales: SharedValue<number>[], buffer: Float32Array): void {
  for (let i = 0; i < scales.length; i++) {
    scales[i].value = MIN_SCALE + buffer[i];
  }
}

function resetSharedValues(scales: SharedValue<number>[]): void {
  for (let i = 0; i < scales.length; i++) {
    scales[i].value = MIN_SCALE;
  }
}

// --- Pre-computed values -------------------------------------------------

const COLORS = Array.from({ length: BAR_COUNT }, (_, i) => computeBarColor(i, BAR_COUNT));

// --- Types ---------------------------------------------------------------

interface AudioWaveformProps {
  amplitudeRef: React.RefObject<number>;
  active: boolean;
  resetKey?: number;
}

interface WaveBarProps {
  scale: SharedValue<number>;
  color: string;
}

// --- WaveBar (UI thread animation via Reanimated) ------------------------

const WaveBar = memo(function WaveBar({ scale, color }: WaveBarProps) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, animStyle]} />;
});

// --- AudioWaveform -------------------------------------------------------

export const AudioWaveform = memo(function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
}: AudioWaveformProps) {
  const scaleValues: SharedValue<number>[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    scaleValues.push(useSharedValue(MIN_SCALE));
  }

  const scalesRef = useRef(scaleValues);
  scalesRef.current = scaleValues;

  const bufferRef = useRef(new Float32Array(BAR_COUNT));
  const smoothedRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    bufferRef.current.fill(0);
    smoothedRef.current = 0;
    resetSharedValues(scalesRef.current);
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;

    const buffer = bufferRef.current;
    const scales = scalesRef.current;

    const intervalId = setInterval(() => {
      if (!mountedRef.current) return;

      const raw = amplitudeRef.current ?? 0;
      smoothedRef.current = smoothAmplitude(smoothedRef.current, raw);

      shiftBufferAndAppend(buffer, smoothedRef.current);
      applyScalesToSharedValues(scales, buffer);
    }, TICK_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <View style={styles.container}>
      {scaleValues.map((sv, i) => (
        <WaveBar key={i} scale={sv} color={COLORS[i]} />
      ))}
    </View>
  );
});

// --- Styles --------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: HEIGHT,
    gap: BAR_GAP,
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    width: BAR_WIDTH,
    height: HEIGHT,
    borderRadius: 2,
  },
});
