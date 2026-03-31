import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const DEFAULT_BARS = 48;
const DEFAULT_BAR_WIDTH = 3;
const DEFAULT_GAP = 2.5;
const DEFAULT_HEIGHT = 140;
const DEFAULT_TICK_MS = 50;
const DEFAULT_ENTER_MS = 80;
const DEFAULT_MIN_SCALE = 0.04;

interface AudioWaveformProps {
  /** Ref to a number 0–1 representing current amplitude. Updated externally. */
  amplitudeRef: React.RefObject<number>;
  /** Whether the waveform is actively consuming amplitude data. */
  active: boolean;
  /** Increment to force a full reset (clear all bars). */
  resetKey?: number;
  /** Number of bars to display. */
  bars?: number;
  /** Height of the waveform container in px. */
  height?: number;
  /** Width of each bar in px. */
  barWidth?: number;
  /** Gap between bars in px. */
  barGap?: number;
  /** Color builder — receives progress (0–1, left to right) and returns a color string. */
  barColor?: (progress: number) => string;
}

function defaultBarColor(progress: number): string {
  const opacity = 0.2 + progress * 0.8;
  const r = Math.round(progress * 30);
  const g = Math.round(140 + progress * 80);
  return `rgba(${r},${g},255,${opacity.toFixed(2)})`;
}

export function AudioWaveform({
  amplitudeRef,
  active,
  resetKey = 0,
  bars = DEFAULT_BARS,
  height = DEFAULT_HEIGHT,
  barWidth = DEFAULT_BAR_WIDTH,
  barGap = DEFAULT_GAP,
  barColor = defaultBarColor,
}: AudioWaveformProps) {
  const scaleAnims = useRef(Array.from({ length: bars }, () => new Animated.Value(0))).current;
  const valuesRef = useRef(new Float32Array(bars));
  const lastTickRef = useRef(0);
  const rafRef = useRef(0);
  const colorsRef = useRef(Array.from({ length: bars }, (_, i) => barColor(i / (bars - 1))));

  useEffect(() => {
    valuesRef.current.fill(0);
    scaleAnims.forEach((anim) => anim.setValue(0));
  }, [resetKey, scaleAnims]);

  useEffect(() => {
    if (!active) return;

    const values = valuesRef.current;
    lastTickRef.current = 0;

    function tick(now: number): void {
      rafRef.current = requestAnimationFrame(tick);

      if (now - lastTickRef.current < DEFAULT_TICK_MS) return;
      lastTickRef.current = now;

      const level = amplitudeRef.current ?? 0;

      values.copyWithin(0, 1);
      values[bars - 1] = level;

      for (let i = 0; i < bars - 1; i++) {
        scaleAnims[i].setValue(values[i]);
      }

      Animated.timing(scaleAnims[bars - 1], {
        toValue: level,
        duration: DEFAULT_ENTER_MS,
        useNativeDriver: true,
      }).start();
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, amplitudeRef, bars, scaleAnims]);

  const containerWidth = bars * (barWidth + barGap);
  const colors = colorsRef.current;

  return (
    <View style={[styles.container, { width: containerWidth, height, gap: barGap }]}>
      {scaleAnims.map((scaleAnim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              width: barWidth,
              height,
              backgroundColor: colors[i],
              transform: [{ scaleY: Animated.add(DEFAULT_MIN_SCALE, scaleAnim) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    borderRadius: 1.5,
  },
});
