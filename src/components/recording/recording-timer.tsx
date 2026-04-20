import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

const TIMER_UPDATE_INTERVAL_MS = 500;

interface RecordingTimerProps {
  isRecording: boolean;
  isPaused: boolean;
}

function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(" : ");
}

export function RecordingTimer({ isRecording, isPaused }: RecordingTimerProps) {
  const [displayMs, setDisplayMs] = useState(0);
  const accumulatedRef = useRef(0);
  const segmentStartRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      segmentStartRef.current = Date.now();

      const intervalId = setInterval(() => {
        const segmentElapsed = Date.now() - segmentStartRef.current;
        setDisplayMs(accumulatedRef.current + segmentElapsed);
      }, TIMER_UPDATE_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }

    if (isPaused) {
      const segmentElapsed = Date.now() - segmentStartRef.current;
      accumulatedRef.current += segmentElapsed;
      return;
    }

    accumulatedRef.current = 0;
    segmentStartRef.current = 0;
    setDisplayMs(0);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isRecording, pulseAnim]);

  const statusLabel = isRecording
    ? "GRABANDO · EN VIVO"
    : isPaused
      ? "PAUSADO · RETOMAR"
      : "LISTO PARA CAPTURAR";

  const statusColor = isRecording
    ? SemanticColors.error
    : isPaused
      ? SemanticColors.warning
      : SemanticColors.success;

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusPill}>
        {isRecording ? (
          <Animated.View
            style={[styles.statusDot, { backgroundColor: statusColor, opacity: pulseOpacity }]}
          />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
        <ThemedText style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</ThemedText>
      </View>

      <ThemedText style={styles.timer}>{formatElapsedTime(displayMs)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2,
  },
  timer: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    marginTop: Spacing.one,
  },
});
