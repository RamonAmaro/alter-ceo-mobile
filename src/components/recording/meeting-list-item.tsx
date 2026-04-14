import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { UploadStatus } from "./upload-status-badge";

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  meetingId?: string;
  uploadStatus?: UploadStatus;
}

interface MeetingListItemProps {
  item: MeetingItem;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

function statusConfig(status: UploadStatus | undefined): {
  label: string;
  color: string;
} {
  switch (status) {
    case "completed":
      return { label: "Completado", color: SemanticColors.success };
    case "failed":
      return { label: "Error", color: SemanticColors.error };
    case "uploading":
      return { label: "Subiendo...", color: SemanticColors.warning };
    case "processing":
      return { label: "Procesando...", color: SemanticColors.warning };
    default:
      return { label: "", color: SemanticColors.textMuted };
  }
}

export function MeetingListItem({ item, onPress }: MeetingListItemProps) {
  const cfg = statusConfig(item.uploadStatus);
  const isLoading = item.uploadStatus === "uploading" || item.uploadStatus === "processing";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.65} onPress={() => onPress(item.id)}>
      <View style={styles.topRow}>
        <ThemedText type="bodyMd" style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.15)" />
      </View>

      <View style={styles.bottomRow}>
        <ThemedText type="caption" style={styles.meta}>
          {item.date}
        </ThemedText>
        <View style={styles.dot} />
        <ThemedText type="caption" style={styles.meta}>
          {item.duration}
        </ThemedText>

        <View style={styles.spacer} />

        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size={10} color={cfg.color} />
            <ThemedText type="caption" style={[styles.statusText, { color: cfg.color }]}>
              {cfg.label}
            </ThemedText>
          </View>
        ) : cfg.label ? (
          <ThemedText type="caption" style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </ThemedText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    color: SemanticColors.textMuted,
    fontSize: 11,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  spacer: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.montserratMedium,
  },
});
