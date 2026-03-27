import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { WaveformIcon } from "./waveform-icon";

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  duration: string;
}

interface MeetingListItemProps {
  item: MeetingItem;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

function ActionButton({ icon, onPress }: { icon: React.ReactNode; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} activeOpacity={0.6}>
      {icon}
    </TouchableOpacity>
  );
}

export function MeetingListItem({
  item,
  isActive,
  isPlaying,
  onPlay,
  onShare,
  onDownload,
  onFavorite,
  onDelete,
}: MeetingListItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPlay(item.id)}
        activeOpacity={0.7}
        style={styles.playButton}
      >
        {isActive ? (
          <View style={styles.waveformWrapper}>
            <WaveformIcon isPlaying={isPlaying} />
          </View>
        ) : (
          <>
            <Svg width={50} height={50} viewBox="0 0 50 50">
              <Defs>
                <LinearGradient id="playBorder" x1="0" y1="1" x2="1" y2="0">
                  <Stop offset="0" stopColor="#59FB77" />
                  <Stop offset="0.5" stopColor="#59FBA6" />
                  <Stop offset="1" stopColor="#2AF0E1" />
                </LinearGradient>
              </Defs>
              <Circle cx="25" cy="25" r="24" fill="url(#playBorder)" />
              <Circle cx="25" cy="25" r="20.5" fill="#313747" />
            </Svg>
            <View style={styles.playIcon}>
              <Ionicons name="play" size={18} color="#ffffff" />
            </View>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <ThemedText
          type="labelSm"
          style={{ color: "#ffffff", fontFamily: Fonts.montserratSemiBold }}
        >
          {item.title}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText type="caption" style={styles.date}>
            {item.date}
          </ThemedText>
          <ThemedText type="caption" style={styles.duration}>
            {item.duration}
          </ThemedText>
          <View style={styles.actions}>
            <ActionButton
              icon={
                <Ionicons name="share-social-outline" size={20} color="rgba(255,255,255,0.6)" />
              }
              onPress={() => onShare(item.id)}
            />
            <ActionButton
              icon={<Ionicons name="download-outline" size={20} color="rgba(255,255,255,0.6)" />}
              onPress={() => onDownload(item.id)}
            />
            <ActionButton
              icon={<Ionicons name="star-outline" size={20} color="rgba(255,255,255,0.6)" />}
              onPress={() => onFavorite(item.id)}
            />
            <ActionButton
              icon={
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              }
              onPress={() => onDelete(item.id)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderBottomWidth: 2,
    borderBottomColor: "#43BCB8",
    gap: Spacing.two,
  },
  waveformWrapper: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    marginRight: Spacing.one,
  },
  playIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
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
  duration: {
    color: "#00FF84",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
});
