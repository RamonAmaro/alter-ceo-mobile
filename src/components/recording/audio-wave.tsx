import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { AudioRecorder } from "expo-audio";

const N_BARS = 60;
const BAR_W = 3;
const BAR_GAP = 2;
const BAR_STEP = BAR_W + BAR_GAP;
const WAVE_H = 100;
const HALF = WAVE_H / 2;
const MAX_BAR_H = 46;
const MIN_BAR_H = 3;
const POLL_MS = 80;
const ANIM_MS = 55;

interface AudioWaveProps {
  isActive: boolean;
  recorder: AudioRecorder;
}

function normalizeLevel(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  return (clamped + 60) / 60;
}

export function AudioWave({ isActive, recorder }: AudioWaveProps) {
  const writeIndex = useRef(0);
  const anims = useRef(
    Array.from({ length: N_BARS }, () => new Animated.Value(MIN_BAR_H))
  );

  useEffect(() => {
    if (!isActive) {
      anims.current.forEach((v) =>
        Animated.timing(v, { toValue: MIN_BAR_H, duration: 300, useNativeDriver: false }).start()
      );
      writeIndex.current = 0;
      return;
    }

    const id = setInterval(() => {
      const db = recorder.getStatus().metering ?? -60;
      const level = normalizeLevel(db);
      const targetH = MIN_BAR_H + level * (MAX_BAR_H - MIN_BAR_H);
      const idx = writeIndex.current;

      Animated.timing(anims.current[idx], {
        toValue: targetH,
        duration: ANIM_MS,
        useNativeDriver: false,
      }).start();

      writeIndex.current = (idx + 1) % N_BARS;
    }, POLL_MS);

    return () => clearInterval(id);
  }, [isActive, recorder]);

  return (
    <View style={styles.container}>
      {anims.current.map((animH, i) => {
        const y = animH.interpolate({
          inputRange: [MIN_BAR_H, MAX_BAR_H],
          outputRange: [HALF - MIN_BAR_H / 2, HALF - MAX_BAR_H / 2],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                left: i * BAR_STEP,
                height: animH,
                top: y,
              },
            ]}
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
    position: "relative",
  },
  bar: {
    position: "absolute",
    width: BAR_W,
    borderRadius: 1.5,
    backgroundColor: "rgba(0,255,132,0.7)",
  },
});
