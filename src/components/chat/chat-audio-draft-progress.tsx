import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import { formatTimer } from "@/utils/format-timer";

interface ChatAudioDraftProgressProps {
  readonly currentMs: number;
  readonly totalMs: number;
  readonly isPlaying: boolean;
}

function buildEyebrow(isPlaying: boolean): string {
  return isPlaying ? "REPRODUCIENDO" : "BORRADOR · AUDIO";
}

export function ChatAudioDraftProgress({
  currentMs,
  totalMs,
  isPlaying,
}: ChatAudioDraftProgressProps) {
  const showCurrent = isPlaying || currentMs > 0;

  return (
    <View style={styles.block}>
      <ThemedText
        style={[styles.eyebrow, isPlaying ? styles.eyebrowPlaying : null]}
        numberOfLines={1}
      >
        {buildEyebrow(isPlaying)}
      </ThemedText>
      <ThemedText style={styles.timer} numberOfLines={1}>
        {showCurrent ? `${formatTimer(currentMs)} / ${formatTimer(totalMs)}` : formatTimer(totalMs)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: "rgba(255, 255, 255, 0.55)",
    letterSpacing: 2,
  },
  eyebrowPlaying: {
    color: SemanticColors.success,
  },
  timer: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 13,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
});
