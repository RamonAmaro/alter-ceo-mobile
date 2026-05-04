import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  cancelAnimation,
  makeMutable,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";

// --- Layout constants ----------------------------------------------------

const BAR_WIDTH = 2.5;
const BAR_GAP = 2;
const STEP_WIDTH = BAR_WIDTH + BAR_GAP;
const HEIGHT = 110;
const MIN_ACTIVE_HEIGHT = 3;
const MAX_ACTIVE_HEIGHT = HEIGHT - 12;
const MAX_BAR_COUNT = 220;

// --- Animation constants -------------------------------------------------

const STEP_MS = 55;
const METER_HZ = 60;
const METER_INTERVAL_MS = 1000 / METER_HZ;
const LERP_FACTOR = 0.32;
const ATTACK = 0.55;
const DECAY = 0.16;

// --- Pure functions ------------------------------------------------------

function computeBarCount(containerWidth: number): number {
  if (containerWidth <= 0) return MAX_BAR_COUNT;
  return Math.min(Math.ceil(containerWidth / STEP_WIDTH) + 2, MAX_BAR_COUNT);
}

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

// --- Types ---------------------------------------------------------------

interface AudioWaveformProps {
  amplitudeRef: React.RefObject<number>;
  active: boolean;
  resetKey?: number;
}

interface WaveBarProps {
  level: SharedValue<number>;
}

// --- WaveBar -------------------------------------------------------------
// A single tall bar centered vertically. Height interpolates between
// MIN_ACTIVE_HEIGHT (silence) and MAX_ACTIVE_HEIGHT (peak) via scaleY.
// Combined with the always-visible baseline below, this produces a
// continuous waveform line that never disappears.

const WaveBar = memo(function WaveBar({ level }: WaveBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const v = level.value;
    const targetHeight = MIN_ACTIVE_HEIGHT + v * (MAX_ACTIVE_HEIGHT - MIN_ACTIVE_HEIGHT);
    const scale = targetHeight / MAX_ACTIVE_HEIGHT;
    return {
      transform: [{ scaleY: scale }],
      opacity: 0.85 + v * 0.15,
    };
  });
  return <Animated.View style={[styles.bar, animatedStyle]} />;
});

// --- AudioWaveform -------------------------------------------------------

export const AudioWaveform = memo(function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
}: AudioWaveformProps) {
  const [visibleCount, setVisibleCount] = useState(MAX_BAR_COUNT);

  const levels = useMemo(
    () => Array.from({ length: MAX_BAR_COUNT }, () => makeMutable(0)),
    [],
  );
  const translateX = useMemo(() => makeMutable(0), []);

  const levelsRef = useRef(levels);
  levelsRef.current = levels;

  const targetBufferRef = useRef(new Float32Array(MAX_BAR_COUNT));
  const displayBufferRef = useRef(new Float32Array(MAX_BAR_COUNT));
  const smoothedLevelRef = useRef(0);

  // Reset
  useEffect(() => {
    targetBufferRef.current.fill(0);
    displayBufferRef.current.fill(0);
    smoothedLevelRef.current = 0;
    cancelAnimation(translateX);
    translateX.value = 0;
    const lvls = levelsRef.current;
    for (let i = 0; i < lvls.length; i++) {
      lvls[i].value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Main animation loop
  useEffect(() => {
    if (!active || visibleCount === 0) {
      cancelAnimation(translateX);
      return;
    }

    const target = targetBufferRef.current;
    const display = displayBufferRef.current;
    const lvls = levelsRef.current;
    const lastIdx = visibleCount - 1;
    let rafId = 0;
    let lastStepTime = performance.now();
    let lastMeterTime = lastStepTime;

    translateX.value = 0;
    translateX.value = withTiming(-STEP_WIDTH, {
      duration: STEP_MS,
      easing: Easing.linear,
    });

    function tick(): void {
      const now = performance.now();

      if (now - lastMeterTime >= METER_INTERVAL_MS) {
        const raw = amplitudeRef.current ?? 0;
        const prev = smoothedLevelRef.current;
        const factor = raw > prev ? ATTACK : DECAY;
        smoothedLevelRef.current = prev + (raw - prev) * factor;
        lastMeterTime = now;
      }

      if (now - lastStepTime >= STEP_MS) {
        target.copyWithin(0, 1);
        target[lastIdx] = smoothedLevelRef.current;
        lastStepTime = now;

        translateX.value = 0;
        translateX.value = withTiming(-STEP_WIDTH, {
          duration: STEP_MS,
          easing: Easing.linear,
        });
      }

      for (let i = 0; i < visibleCount; i++) {
        const next = lerp(display[i], target[i], LERP_FACTOR);
        display[i] = next;
        lvls[i].value = next;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimation(translateX);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleCount]);

  function handleLayout(e: LayoutChangeEvent): void {
    setVisibleCount(computeBarCount(e.nativeEvent.layout.width));
  }

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.track, trackStyle]}>
        {levels.slice(0, visibleCount).map((sv, i) => (
          <WaveBar key={i} level={sv} />
        ))}
      </Animated.View>
    </View>
  );
});

// --- Styles --------------------------------------------------------------

const BAR_COLOR = "#3DA9FF";

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
