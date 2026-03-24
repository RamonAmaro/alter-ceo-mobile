import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  duration: string;
}

interface MeetingListItemProps {
  item: MeetingItem;
  onPlay: (id: string) => void;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

function ActionButton({
  icon,
  onPress,
}: {
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} activeOpacity={0.6}>
      {icon}
    </TouchableOpacity>
  );
}

export function MeetingListItem({
  item,
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
        <View style={styles.playCircle}>
          <Ionicons name="play" size={18} color="#00FF84" />
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <ThemedText
          type="labelSm"
          style={{ color: "#ffffff", fontFamily: Fonts.montserratSemiBold }}
        >
          {item.title}
        </ThemedText>
        <ThemedText type="caption" style={styles.date}>
          {item.date}
        </ThemedText>
      </View>

      <ThemedText type="caption" style={styles.duration}>
        {item.duration}
      </ThemedText>

      <View style={styles.actions}>
        <ActionButton
          icon={<Ionicons name="share-social-outline" size={16} color="rgba(255,255,255,0.6)" />}
          onPress={() => onShare(item.id)}
        />
        <ActionButton
          icon={<Ionicons name="download-outline" size={16} color="rgba(255,255,255,0.6)" />}
          onPress={() => onDownload(item.id)}
        />
        <ActionButton
          icon={<Ionicons name="star-outline" size={16} color="rgba(255,255,255,0.6)" />}
          onPress={() => onFavorite(item.id)}
        />
        <ActionButton
          icon={<MaterialCommunityIcons name="delete-outline" size={16} color="rgba(255,255,255,0.6)" />}
          onPress={() => onDelete(item.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 255, 132, 0.15)",
    gap: Spacing.two,
  },
  playButton: {
    marginRight: Spacing.one,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00FF84",
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
    marginRight: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
});
