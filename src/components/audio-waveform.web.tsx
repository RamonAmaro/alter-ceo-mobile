import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

// --- Layout constants ----------------------------------------------------

const BAR_WIDTH = 2.5;
const BAR_GAP = 2;
const STEP_WIDTH = BAR_WIDTH + BAR_GAP;
const HEIGHT = 110;
const MAX_WIDTH = 560;
const MIN_ACTIVE_HEIGHT = 3;
const MAX_ACTIVE_HEIGHT = HEIGHT - 12;
const MAX_BAR_COUNT = 240;

// --- Animation constants -------------------------------------------------

const STEP_MS = 55;
const ATTACK = 0.55;
const DECAY = 0.16;

// --- Pure functions ------------------------------------------------------

function computeBarCount(containerWidth: number): number {
  if (containerWidth <= 0) return MAX_BAR_COUNT;
  return Math.min(Math.ceil(containerWidth / STEP_WIDTH) + 2, MAX_BAR_COUNT);
}

// --- Types ---------------------------------------------------------------

interface AudioWaveformProps {
  amplitudeRef: React.RefObject<number>;
  active: boolean;
  resetKey?: number;
}

// --- AudioWaveform (web) -------------------------------------------------

export const AudioWaveform = memo(function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
}: AudioWaveformProps) {
  const [visibleCount, setVisibleCount] = useState(MAX_BAR_COUNT);
  const [barLevels, setBarLevels] = useState<number[]>(() => new Array(MAX_BAR_COUNT).fill(0));
  const [translate, setTranslate] = useState(0);

  const bufferRef = useRef(new Float32Array(MAX_BAR_COUNT));
  const smoothedLevelRef = useRef(0);

  // Reset
  useEffect(() => {
    bufferRef.current.fill(0);
    smoothedLevelRef.current = 0;
    setBarLevels(new Array(MAX_BAR_COUNT).fill(0));
    setTranslate(0);
  }, [resetKey]);

  useEffect(() => {
    if (!active || visibleCount === 0) return;

    const buffer = bufferRef.current;
    const lastIdx = visibleCount - 1;

    const id = setInterval(() => {
      const raw = amplitudeRef.current ?? 0;
      const prev = smoothedLevelRef.current;
      const factor = raw > prev ? ATTACK : DECAY;
      const level = prev + (raw - prev) * factor;
      smoothedLevelRef.current = level;

      buffer.copyWithin(0, 1);
      buffer[lastIdx] = level;

      const next = new Array(visibleCount);
      for (let i = 0; i <= lastIdx; i++) {
        next[i] = buffer[i];
      }
      setBarLevels(next);

      setTranslate(0);
      requestAnimationFrame(() => setTranslate(-STEP_WIDTH));
    }, STEP_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleCount]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setVisibleCount(computeBarCount(e.nativeEvent.layout.width));
  }, []);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View
        style={[
          styles.track,
          {
            transform: [{ translateX: translate }],
            transitionProperty: "transform",
            transitionDuration: `${STEP_MS}ms`,
            transitionTimingFunction: "linear",
          },
        ]}
      >
        {barLevels.slice(0, visibleCount).map((level, i) => {
          const targetHeight = MIN_ACTIVE_HEIGHT + level * (MAX_ACTIVE_HEIGHT - MIN_ACTIVE_HEIGHT);
          const scale = targetHeight / MAX_ACTIVE_HEIGHT;
          const opacity = 0.85 + level * 0.15;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  transform: [{ scaleY: scale }],
                  opacity,
                  transitionProperty: "transform, opacity",
                  transitionDuration: `${STEP_MS}ms`,
                  transitionTimingFunction: "ease-out",
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
});

// --- Styles --------------------------------------------------------------

const BAR_COLOR = "#3DA9FF";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    height: HEIGHT,
    overflow: "hidden",
    justifyContent: "center",
  },
  track: {
    height: HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: BAR_GAP,
    paddingRight: STEP_WIDTH,
  },
  bar: {
    width: BAR_WIDTH,
    height: MAX_ACTIVE_HEIGHT,
    backgroundColor: BAR_COLOR,
    borderRadius: BAR_WIDTH / 2,
  },
});
