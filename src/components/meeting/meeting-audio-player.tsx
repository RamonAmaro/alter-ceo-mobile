import { useCallback } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
  const isPlaying = status.playing;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.06)", "rgba(42,240,225,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <View style={styles.accentBar} />
          <ThemedText style={styles.label}>
            {isPlaying ? "REPRODUCIENDO · EN VIVO" : "AUDIO · GRABADO"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={canPlay ? handleTogglePlay : undefined}
          style={[styles.playButton, !canPlay && styles.playButtonDisabled, playShadow]}
          disabled={!canPlay || isLoading}
        >
          {canPlay ? (
            <LinearGradient
              colors={["#00FF84", "#2AF0E1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          {isLoading ? (
            <ActivityIndicator size="small" color="#0B1A1A" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color={canPlay ? "#0B1A1A" : SemanticColors.textDisabled}
              style={!isPlaying ? styles.playIconOffset : undefined}
            />
          )}
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={["#00FF84", "#2AF0E1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]}
            />
            {progress > 0 && progress < 1 ? (
              <View style={[styles.progressThumb, { left: `${Math.min(100, progress * 100)}%` }]} />
            ) : null}
          </View>

          <View style={styles.timeRow}>
            <ThemedText style={styles.timeCurrent}>{formatTime(status.currentTime)}</ThemedText>
            <ThemedText style={styles.timeSeparator}>/</ThemedText>
            <ThemedText style={styles.timeTotal}>{formatTime(duration)}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const playShadow = Platform.select({
  ios: {
    shadowColor: "#00FF84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 4px 14px rgba(0,255,132,0.35)" },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: SemanticColors.tealLight,
  },
  playButtonDisabled: {
    backgroundColor: SemanticColors.glassBackground,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressTrack: {
    position: "relative",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "visible",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#00FF84",
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeCurrent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 15,
    color: SemanticColors.success,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },
  timeSeparator: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
  },
  timeTotal: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    fontVariant: ["tabular-nums"],
  },
});
