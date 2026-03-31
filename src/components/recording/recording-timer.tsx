import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";

// --- Constants -----------------------------------------------------------

const TIMER_UPDATE_INTERVAL_MS = 500;

// --- Types ---------------------------------------------------------------

interface RecordingTimerProps {
  isRecording: boolean;
  isPaused: boolean;
}

// --- Pure helpers --------------------------------------------------------

function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(" : ");
}

// --- Component -----------------------------------------------------------

export function RecordingTimer({ isRecording, isPaused }: RecordingTimerProps) {
  const [displayMs, setDisplayMs] = useState(0);
  const accumulatedRef = useRef(0);
  const segmentStartRef = useRef(0);

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

  const statusLabel = isRecording ? "Grabando" : "Comenzar grabación";

  return (
    <View style={styles.container}>
      <ThemedText type="headingLg" style={styles.timer}>
        {formatElapsedTime(displayMs)}
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.status}>
        {statusLabel}
      </ThemedText>
    </View>
  );
}

// --- Styles --------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
  },
  timer: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  status: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});
