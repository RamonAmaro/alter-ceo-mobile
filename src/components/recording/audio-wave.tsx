import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import type { AudioRecorder } from "expo-audio";

const WAVE_HEIGHT = 120;
const BAR_WIDTH = 3;
const BAR_GAP = 1;
const BAR_STEP = BAR_WIDTH + BAR_GAP;
const MIN_H = 2;
const HALF = WAVE_HEIGHT / 2;
const POLL_MS = 80;

interface AudioWaveProps {
  isActive: boolean;
  recorder: AudioRecorder;
}

function normalizeLevel(db: number): number {
  return Math.max(0, Math.pow(10, (db + 40) / 20));
}

export function AudioWave({ isActive, recorder }: AudioWaveProps) {
  const { width } = useWindowDimensions();
  const [bars, setBars] = useState<number[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isActive) {
      setBars([]);
      return;
    }

    const id = setInterval(() => {
      const status = recorder.getStatus();
      const db = status.metering ?? -160;
      const h = Math.max(MIN_H, normalizeLevel(db) * WAVE_HEIGHT * 0.5);

      setBars((prev) => [...prev, h]);
    }, POLL_MS);

    return () => clearInterval(id);
  }, [isActive, recorder]);

  useEffect(() => {
    const totalWidth = bars.length * BAR_STEP;
    if (totalWidth > width) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, [bars.length, width]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {bars.map((h, i) => (
          <View
            key={i}
            style={[styles.bar, { height: h, top: HALF - h / 2 }]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: WAVE_HEIGHT,
    overflow: "hidden",
  },
  row: {
    alignItems: "flex-start",
    height: WAVE_HEIGHT,
  },
  bar: {
    position: "relative",
    width: BAR_WIDTH,
    marginHorizontal: BAR_GAP / 2,
    borderRadius: 1.5,
    backgroundColor: "#00D4F0",
  },
});
