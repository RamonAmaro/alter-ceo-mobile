import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <View style={[styles.card, { borderColor: `${iconColor}22` }]}>
      <LinearGradient
        colors={[`${iconColor}12`, "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${iconColor}18`, borderColor: `${iconColor}33` },
          ]}
        >
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <View style={[styles.accentBar, { backgroundColor: iconColor }]} />
            <ThemedText style={styles.meta}>
              {items.length > 0 ? `${items.length} ELEMENTOS` : "SIN DATOS"}
            </ThemedText>
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
      </View>

      <View style={styles.list}>
        {displayItems.map((item, index) => (
          <View key={`${title}-${index}`} style={styles.itemRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isEmpty ? "rgba(255,255,255,0.15)" : iconColor },
              ]}
            />
            <ThemedText style={[styles.itemText, isEmpty && styles.itemTextEmpty]}>
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  list: {
    gap: Spacing.two,
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
    marginTop: 7,
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
  },
  itemTextEmpty: {
    color: SemanticColors.textDisabled,
    fontStyle: "italic",
    fontFamily: Fonts.montserrat,
  },
});
