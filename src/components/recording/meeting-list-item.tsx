import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
  index: number;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

function statusConfig(status: UploadStatus | undefined): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case "completed":
      return {
        label: "COMPLETADO",
        color: SemanticColors.success,
        bg: "rgba(0,255,132,0.12)",
        border: "rgba(0,255,132,0.25)",
      };
    case "failed":
      return {
        label: "ERROR",
        color: SemanticColors.error,
        bg: "rgba(255,68,68,0.12)",
        border: "rgba(255,68,68,0.25)",
      };
    case "uploading":
      return {
        label: "SUBIENDO",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.12)",
        border: "rgba(255,149,0,0.28)",
      };
    case "processing":
      return {
        label: "PROCESANDO",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.12)",
        border: "rgba(255,149,0,0.28)",
      };
    default:
      return {
        label: "",
        color: SemanticColors.textMuted,
        bg: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
      };
  }
}

export function MeetingListItem({ item, index, onPress }: MeetingListItemProps) {
  const cfg = statusConfig(item.uploadStatus);
  const isLoading = item.uploadStatus === "uploading" || item.uploadStatus === "processing";
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <TouchableOpacity
      style={[styles.card, cardShadow]}
      activeOpacity={0.7}
      onPress={() => onPress(item.id)}
    >
      <LinearGradient
        colors={["rgba(0,255,132,0.04)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.indexWrap}>
        <ThemedText style={styles.indexLabel}>{indexLabel}</ThemedText>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {item.title}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
            <ThemedText style={styles.meta}>{item.date}</ThemedText>
          </View>
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={11} color={SemanticColors.textMuted} />
            <ThemedText style={styles.meta}>{item.duration}</ThemedText>
          </View>
        </View>
      </View>

      {cfg.label ? (
        <View
          style={[
            styles.statusPill,
            { backgroundColor: cfg.bg, borderColor: cfg.border },
          ]}
        >
          {isLoading ? <ActivityIndicator size={10} color={cfg.color} /> : (
            <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          )}
          <ThemedText style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</ThemedText>
        </View>
      ) : null}

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={14} color={SemanticColors.success} />
      </View>
    </TouchableOpacity>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  web: { boxShadow: "0 4px 14px rgba(0,0,0,0.18)" },
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    overflow: "hidden",
  },
  indexWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  indexLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 15,
    color: SemanticColors.success,
    letterSpacing: -0.4,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meta: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.5,
  },
  chevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
});
