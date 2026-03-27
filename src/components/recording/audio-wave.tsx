import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { AudioRecorder } from "expo-audio";

const N_BARS = 60;
const BAR_W = 3;
const BAR_GAP = 2;
const BAR_STEP = BAR_W + BAR_GAP;
const WAVE_H = 140;
const HALF = WAVE_H / 2;
const MAX_BAR_H = 130;
const MIN_BAR_H = 3;
const POLL_MS = 60;
const ANIM_MS = 40;

type AudioWaveProps =
  | { isActive: boolean; isReset: boolean; recorder: AudioRecorder; amplitudeRef?: never }
  | { isActive: boolean; isReset: boolean; amplitudeRef: React.RefObject<number>; recorder?: never };

function normalizeLevel(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  return (clamped + 60) / 60;
}

export function AudioWave({ isActive, isReset, recorder, amplitudeRef }: AudioWaveProps) {
  const [headIndex, setHeadIndex] = useState(0);
  const barAnims = useRef(
    Array.from({ length: N_BARS }, () => new Animated.Value(MIN_BAR_H)),
  );

  useEffect(() => {
    if (!isReset) return;
    setHeadIndex(0);
    barAnims.current.forEach((v) =>
      Animated.timing(v, { toValue: MIN_BAR_H, duration: 300, useNativeDriver: false }).start(),
    );
  }, [isReset]);

  useEffect(() => {
    if (!isActive) return;

    let currentIndex = 0;

    const id = setInterval(() => {
      const level = recorder
        ? normalizeLevel(recorder.getStatus().metering ?? -60)
        : (amplitudeRef?.current ?? 0);

      const targetH = MIN_BAR_H + level * (MAX_BAR_H - MIN_BAR_H);
      const idx = currentIndex % N_BARS;

      Animated.timing(barAnims.current[idx], {
        toValue: targetH,
        duration: ANIM_MS,
        useNativeDriver: false,
      }).start();

      currentIndex += 1;
      setHeadIndex(currentIndex);
    }, POLL_MS);

    return () => clearInterval(id);
  }, [isActive, recorder, amplitudeRef]);

  const orderedBars = Array.from({ length: N_BARS }, (_, i) => {
    const bufferIndex = (headIndex + i) % N_BARS;
    return barAnims.current[bufferIndex];
  });

  return (
    <View style={styles.container}>
      {orderedBars.map((animH, i) => {
        const progress = i / (N_BARS - 1);
        const opacity = 0.15 + progress * 0.85;
        const r = Math.round(0 + progress * 30);
        const g = Math.round(140 + progress * 80);
        const b = 255;
        const barColor = `rgba(${r},${g},${b},${opacity.toFixed(2)})`;

        const y = animH.interpolate({
          inputRange: [MIN_BAR_H, MAX_BAR_H],
          outputRange: [HALF - MIN_BAR_H / 2, HALF - MAX_BAR_H / 2],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i}
            style={[styles.bar, { left: i * BAR_STEP, height: animH, top: y, backgroundColor: barColor }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: N_BARS * BAR_STEP,
    height: WAVE_H,
    overflow: "hidden",
  },
  bar: {
    position: "absolute",
    width: BAR_W,
    borderRadius: 1.5,
    backgroundColor: "transparent",
  },
});
