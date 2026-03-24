import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface MeetingPlayerBarProps {
  title: string;
  date: string;
  duration: string;
  progress: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onShare: () => void;
  onFavorite: () => void;
}

export function MeetingPlayerBar({
  title,
  date,
  duration,
  progress,
  isPlaying,
  onTogglePlay,
  onShare,
  onFavorite,
}: MeetingPlayerBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <View
            style={[
              styles.progressThumb,
              { left: `${progress * 100}%` },
            ]}
          />
        </View>
        <ThemedText type="caption" style={styles.durationText}>
          {duration}
        </ThemedText>
      </View>

      <View style={styles.infoRow}>
        <TouchableOpacity onPress={onTogglePlay} activeOpacity={0.7}>
          <View style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#ffffff"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.info}>
          <ThemedText
            type="labelSm"
            style={{ color: "#ffffff", fontFamily: Fonts.montserratSemiBold }}
          >
            {title}
          </ThemedText>
          <ThemedText type="caption" style={styles.date}>
            {date}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onShare} hitSlop={8}>
            <Ionicons name="share-social-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onFavorite} hitSlop={8}>
            <Ionicons name="star-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 20, 20, 0.9)",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 1.5,
  },
  progressFill: {
    height: 3,
    backgroundColor: "#00FF84",
    borderRadius: 1.5,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00FF84",
    marginLeft: -5,
  },
  durationText: {
    color: "#00FF84",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  date: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
});
