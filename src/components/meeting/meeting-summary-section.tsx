import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface MeetingSummarySectionProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  items: readonly string[];
  emptyMessage: string;
}

export function MeetingSummarySection({
  icon,
  iconColor,
  title,
  items,
  emptyMessage,
}: MeetingSummarySectionProps) {
  const displayItems = items.length > 0 ? items : [emptyMessage];
  const isEmpty = items.length === 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <ThemedText type="bodySm" style={styles.title}>
          {title}
        </ThemedText>
      </View>

      {displayItems.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.itemRow}>
          <View style={[styles.dot, { backgroundColor: isEmpty ? "rgba(255,255,255,0.15)" : iconColor }]} />
          <ThemedText type="bodySm" style={[styles.itemText, isEmpty && styles.itemTextEmpty]}>
            {item}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
  },
  itemTextEmpty: {
    color: SemanticColors.textDisabled,
    fontStyle: "italic",
    fontFamily: Fonts.montserrat,
  },
});
