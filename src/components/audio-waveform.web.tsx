import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

// --- Layout constants (smaller for web) ----------------------------------

const BAR_WIDTH = 2;
const BAR_GAP = 1.5;
const HEIGHT = 60;
const MAX_BAR_COUNT = 80;

// --- Animation constants -------------------------------------------------

const MIN_SCALE = 0.04;
const AMPLITUDE_SCALE = 0.85;
const SHIFT_MS = 80;
const TRANSITION_MS = 140;

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

// --- AudioWaveform (web — CSS transitions) -------------------------------

export const AudioWaveform = memo(function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
}: AudioWaveformProps) {
  const [visibleCount, setVisibleCount] = useState(MAX_BAR_COUNT);
  const [barScales, setBarScales] = useState<number[]>(() =>
    new Array(MAX_BAR_COUNT).fill(MIN_SCALE),
  );

  const bufferRef = useRef(new Float32Array(MAX_BAR_COUNT));

  // Reset
  useEffect(() => {
    bufferRef.current.fill(0);
    setBarScales(new Array(MAX_BAR_COUNT).fill(MIN_SCALE));
  }, [resetKey]);

  // Main animation loop — shift buffer + batch setState
  useEffect(() => {
    if (!active || visibleCount === 0) return;

    const buffer = bufferRef.current;
    const lastIdx = visibleCount - 1;

    const id = setInterval(() => {
      const level = amplitudeRef.current ?? 0;

      buffer.copyWithin(0, 1);
      buffer[lastIdx] = level;

      const next = new Array(visibleCount);
      for (let i = 0; i <= lastIdx; i++) {
        next[i] = MIN_SCALE + buffer[i] * AMPLITUDE_SCALE;
      }
      setBarScales(next);
    }, SHIFT_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleCount]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setVisibleCount(computeBarCount(e.nativeEvent.layout.width));
  }, []);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {barScales.slice(0, visibleCount).map((scale, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: COLORS[i],
              transform: [{ scaleY: scale }],
              transitionProperty: "transform",
              transitionDuration: `${TRANSITION_MS}ms`,
              transitionTimingFunction: "ease-out",
            },
          ]}
        />
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
    borderRadius: 1,
  },
});
