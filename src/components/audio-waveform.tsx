import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

// --- Layout constants ----------------------------------------------------

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const HEIGHT = 120;
const MAX_BAR_COUNT = 80;

// --- Animation constants -------------------------------------------------

const MIN_SCALE = 0.04;
const SHIFT_MS = 80;

const TIMING_CONFIG = {
  duration: 100,
  easing: Easing.out(Easing.quad),
};

// --- Pure functions ------------------------------------------------------

function computeBarColor(index: number, total: number): string {
  const progress = index / (total - 1 || 1);
  const opacity = 0.3 + progress * 0.7;
  const r = Math.round(progress * 30);
  const g = Math.round(140 + progress * 80);
  return `rgba(${r},${g},255,${opacity.toFixed(2)})`;
}

function computeBarCount(containerWidth: number): number {
  if (containerWidth <= 0) return MAX_BAR_COUNT;
  return Math.min(Math.floor(containerWidth / (BAR_WIDTH + BAR_GAP)), MAX_BAR_COUNT);
}

// --- Pre-computed colors -------------------------------------------------

const COLORS = Array.from({ length: MAX_BAR_COUNT }, (_, i) => computeBarColor(i, MAX_BAR_COUNT));

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

// --- WaveBar (pure UI-thread animation) ----------------------------------

const WaveBar = memo(function WaveBar({ scale, color }: WaveBarProps) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
});

// --- AudioWaveform -------------------------------------------------------

export const AudioWaveform = memo(function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
}: AudioWaveformProps) {
  const [visibleCount, setVisibleCount] = useState(MAX_BAR_COUNT);

  // Stable array of shared values — always MAX_BAR_COUNT, created once
  const scales = useMemo(
    () => Array.from({ length: MAX_BAR_COUNT }, () => makeMutable(MIN_SCALE)),
    [],
  );

  const scalesRef = useRef(scales);
  scalesRef.current = scales;

  const bufferRef = useRef(new Float32Array(MAX_BAR_COUNT));

  // Reset
  useEffect(() => {
    bufferRef.current.fill(0);
    const s = scalesRef.current;
    for (let i = 0; i < s.length; i++) {
      s[i].value = MIN_SCALE;
    }
  }, [resetKey]);

  // Main animation loop — shift buffer + update shared values directly
  useEffect(() => {
    if (!active || visibleCount === 0) return;

    const buffer = bufferRef.current;
    const s = scalesRef.current;
    const lastIdx = visibleCount - 1;

    const id = setInterval(() => {
      const level = amplitudeRef.current ?? 0;

      // Shift buffer left
      buffer.copyWithin(0, 1);
      buffer[lastIdx] = level;

      // Animate each bar with withTiming for smooth transitions
      for (let i = 0; i <= lastIdx; i++) {
        s[i].value = withTiming(MIN_SCALE + buffer[i], TIMING_CONFIG);
      }
    }, SHIFT_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleCount]);

  function handleLayout(e: LayoutChangeEvent): void {
    setVisibleCount(computeBarCount(e.nativeEvent.layout.width));
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {scales.slice(0, visibleCount).map((sv, i) => (
        <WaveBar key={i} scale={sv} color={COLORS[i]} />
      ))}
    </View>
  );
});

// --- Styles --------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: HEIGHT,
    gap: BAR_GAP,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bar: {
    width: BAR_WIDTH,
    height: HEIGHT,
    borderRadius: 1.5,
  },
});
