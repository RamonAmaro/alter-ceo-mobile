import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAudioPlayer, useAudioPlayerStatus } from "@/hooks/use-audio-playback";

interface MeetingAudioPlayerProps {
  audioUrl: string | null | undefined;
  durationSeconds: number | null | undefined;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function isPlayableUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return null;
}

export function MeetingAudioPlayer({ audioUrl, durationSeconds }: MeetingAudioPlayerProps) {
  const playableUrl = isPlayableUrl(audioUrl);
  const player = useAudioPlayer(playableUrl, { updateInterval: 0.1 });
  const status = useAudioPlayerStatus(player);

  const handleTogglePlay = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else if (status.duration > 0 && status.currentTime >= status.duration) {
      player.seekTo(0);
      player.play();
    } else {
      player.play();
    }
  }, [status.playing, status.currentTime, status.duration, player]);

  const duration = status.duration > 0 ? status.duration : (durationSeconds ?? 0);
  const progress = duration > 0 ? status.currentTime / duration : 0;
  const isLoading = playableUrl ? !status.isLoaded : false;
  const canPlay = !!playableUrl;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={canPlay ? handleTogglePlay : undefined}
        activeOpacity={canPlay ? 0.7 : 1}
        style={[styles.playButton, !canPlay && styles.playButtonDisabled]}
        disabled={!canPlay || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={SemanticColors.surfaceDark} />
        ) : (
          <Ionicons
            name={status.playing ? "pause" : "play"}
            size={16}
            color={canPlay ? SemanticColors.surfaceDark : SemanticColors.textDisabled}
          />
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ThemedText type="caption" style={styles.timeText}>
        {status.currentTime > 0
          ? `${formatTime(status.currentTime)} / ${formatTime(duration)}`
          : formatTime(duration)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: SemanticColors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SemanticColors.tealLight,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  playButtonDisabled: {
    backgroundColor: SemanticColors.glassBackground,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: SemanticColors.tealLight,
  },
  timeText: {
    color: SemanticColors.textMuted,
    fontSize: 11,
    fontFamily: Fonts.montserratMedium,
    minWidth: 30,
    textAlign: "right",
  },
});
