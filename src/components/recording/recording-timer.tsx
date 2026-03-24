import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface RecordingTimerProps {
  elapsedMs: number;
  isRecording: boolean;
}

function formatHhMmSs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh} : ${mm} : ${ss}`;
}

export function RecordingTimer({ elapsedMs, isRecording }: RecordingTimerProps) {
  const timerText = formatHhMmSs(elapsedMs);
  const statusText = isRecording ? "Grabando" : "Comenzar grabación";

  return (
    <View style={styles.container}>
      <ThemedText
        type="headingLg"
        style={[styles.timer, { fontFamily: Fonts.montserratBold }]}
      >
        {timerText}
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.status}>
        {statusText}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
  },
  timer: {
    color: "#ffffff",
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  status: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});
