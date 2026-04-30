import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

export type HistoryItemStatus = "completed" | "processing" | "failed" | "queued";

interface StrategyHistoryItemProps {
  title: string;
  iconName: string;
  date: string;
  status: HistoryItemStatus;
  errorMessage?: string | null;
  onPress?: () => void;
  disabled?: boolean;
}

interface StatusVisual {
  label: string;
  color: string;
  bg: string;
  border: string;
  loading: boolean;
}

function statusVisual(status: HistoryItemStatus): StatusVisual {
  switch (status) {
    case "completed":
      return {
        label: "COMPLETADO",
        color: SemanticColors.success,
        bg: "rgba(0,255,132,0.12)",
        border: "rgba(0,255,132,0.25)",
        loading: false,
      };
    case "processing":
      return {
        label: "PROCESANDO",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.12)",
        border: "rgba(255,149,0,0.28)",
        loading: true,
      };
    case "queued":
      return {
        label: "EN COLA",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.10)",
        border: "rgba(255,149,0,0.24)",
        loading: true,
      };
    case "failed":
      return {
        label: "ERROR",
        color: SemanticColors.error,
        bg: "rgba(255,68,68,0.12)",
        border: "rgba(255,68,68,0.25)",
        loading: false,
      };
  }
}

export function StrategyHistoryItem({
  title,
  iconName,
  date,
  status,
  errorMessage,
  onPress,
  disabled,
}: StrategyHistoryItemProps) {
  const visual = statusVisual(status);
  const isInteractive = status === "completed" && !disabled && onPress !== undefined;

  return (
    <TouchableOpacity
      style={[styles.card, cardShadow, !isInteractive && styles.cardMuted]}
      activeOpacity={isInteractive ? 0.7 : 1}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
    >
      <LinearGradient
        colors={["rgba(0,255,132,0.04)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.mainRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName as never} size={22} color={SemanticColors.success} />
        </View>

        <View style={styles.body}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
              <ThemedText style={styles.meta}>{date}</ThemedText>
            </View>
          </View>
        </View>

        <View
          style={[styles.statusPill, { backgroundColor: visual.bg, borderColor: visual.border }]}
        >
          {visual.loading ? (
            <ActivityIndicator size={10} color={visual.color} />
          ) : (
            <View style={[styles.statusDot, { backgroundColor: visual.color }]} />
          )}
          <ThemedText style={[styles.statusText, { color: visual.color }]}>
            {visual.label}
          </ThemedText>
        </View>

        <View style={[styles.chevron, !isInteractive && styles.chevronMuted]}>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isInteractive ? SemanticColors.success : SemanticColors.textMuted}
          />
        </View>
      </View>

      {status === "failed" && errorMessage ? (
        <View style={styles.errorStrip}>
          <Ionicons name="alert-circle" size={14} color={SemanticColors.error} />
          <ThemedText style={styles.errorMessage} numberOfLines={2}>
            {errorMessage}
          </ThemedText>
        </View>
      ) : null}
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
    flexDirection: "column",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    overflow: "hidden",
  },
  cardMuted: {
    opacity: 0.85,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
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
  chevronMuted: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  errorStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "rgba(255,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.22)",
  },
  errorMessage: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.error,
  },
});
