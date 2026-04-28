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
  index: number;
}

export function MeetingSummarySection({
  icon,
  iconColor,
  title,
  items,
  emptyMessage,
  index,
}: MeetingSummarySectionProps) {
  const isEmpty = items.length === 0;
  const folio = String(index).padStart(2, "0");

  return (
    <View style={styles.block}>
      <View style={styles.folioColumn}>
        <ThemedText style={styles.folio}>{folio}</ThemedText>
        <View style={styles.folioRail} />
      </View>

      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <View style={[styles.iconPlate, { borderColor: `${iconColor}40` }]}>
            <Ionicons name={icon} size={16} color={iconColor} />
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>

        <View style={styles.rule} />

        {isEmpty ? (
          <ThemedText style={styles.empty}>{emptyMessage}</ThemedText>
        ) : (
          <View style={styles.list}>
            {items.map((item, itemIndex) => (
              <View key={`${title}-${itemIndex}`} style={styles.itemRow}>
                <ThemedText style={styles.itemDash}>—</ThemedText>
                <ThemedText style={styles.itemText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  folioColumn: {
    alignItems: "flex-start",
    width: 28,
    gap: 6,
  },
  folio: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 20,
    color: "rgba(255,255,255,0.18)",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  folioRail: {
    width: 1,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  contentColumn: {
    flex: 1,
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconPlate: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  empty: {
    fontFamily: Fonts.montserrat,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textDisabled,
    letterSpacing: 0.1,
  },
  list: {
    gap: Spacing.two,
    paddingTop: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  itemDash: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.35)",
    width: 16,
  },
  itemText: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textSecondaryLight,
  },
});
