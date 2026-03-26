import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const BAR_COUNT = 20;
const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 40;
const SMOOTHING = 0.35;

const BAR_OFFSETS = [
  0.3, 0.45, 0.6, 0.75, 0.85, 0.95, 1.0, 0.95, 0.9, 0.85,
  0.85, 0.9, 0.95, 1.0, 0.95, 0.85, 0.75, 0.6, 0.45, 0.3,
];

interface RecordingWaveformProps {
  isRecording: boolean;
  amplitudeRef: React.RefObject<number>;
}

export function RecordingWaveform({ isRecording, amplitudeRef }: RecordingWaveformProps) {
  const animValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN_HEIGHT)),
  ).current;

  const smoothedRef = useRef(0);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  useEffect(() => {
    if (!isRecording) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      smoothedRef.current = 0;
      animValues.forEach((val) =>
        Animated.timing(val, {
          toValue: BAR_MIN_HEIGHT,
          duration: 150,
          useNativeDriver: false,
        }).start(),
      );
      return;
    }

    const tick = () => {
      if (!isRecordingRef.current) return;

      smoothedRef.current =
        smoothedRef.current * (1 - SMOOTHING) + (amplitudeRef.current ?? 0) * SMOOTHING;

      const s = smoothedRef.current;
      animValues.forEach((val, i) => {
        const target = BAR_MIN_HEIGHT + s * BAR_OFFSETS[i] * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);
        val.setValue(target);
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {animValues.map((val, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { height: val, opacity: isRecording ? 1 : 0.3 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: BAR_MAX_HEIGHT + 8,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#00FF84",
  },
});
