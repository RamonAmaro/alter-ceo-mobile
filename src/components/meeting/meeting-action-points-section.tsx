import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface MeetingActionPointsSectionProps {
  items: readonly string[];
  index: number;
}

const UNSPECIFIED = "Sin especificar";
const EMPTY_LABEL = "Sin definir";

export function MeetingActionPointsSection({ items, index }: MeetingActionPointsSectionProps) {
  const folio = String(index).padStart(2, "0");
  const isEmpty = items.length === 0;

  return (
    <View style={styles.block}>
      <View style={styles.folioColumn}>
        <ThemedText style={styles.folio}>{folio}</ThemedText>
        <View style={styles.folioRail} />
      </View>

      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <View style={[styles.iconPlate, { borderColor: `${SemanticColors.info}40` }]}>
            <Ionicons name="arrow-forward-circle-outline" size={16} color={SemanticColors.info} />
          </View>
          <ThemedText style={styles.title}>Puntos de acción</ThemedText>
          {!isEmpty ? (
            <ThemedText style={styles.count}>{String(items.length).padStart(2, "0")}</ThemedText>
          ) : null}
        </View>

        <View style={styles.rule} />

        {isEmpty ? (
          <ThemedText style={styles.empty}>{EMPTY_LABEL}</ThemedText>
        ) : (
          <View style={styles.list}>
            {items.map((item, itemIndex) => (
              <View key={`action-${itemIndex}`} style={styles.itemCard}>
                <ThemedText style={styles.itemText}>{item}</ThemedText>
                <View style={styles.metaRow}>
                  <View style={styles.metaBlock}>
                    <ThemedText style={styles.metaLabel}>Responsables</ThemedText>
                    <ThemedText style={styles.metaValue}>{UNSPECIFIED}</ThemedText>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaBlock}>
                    <ThemedText style={styles.metaLabel}>Fecha límite</ThemedText>
                    <ThemedText style={styles.metaValue}>{UNSPECIFIED}</ThemedText>
                  </View>
                </View>
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
    paddingBottom: Spacing.four,
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
  count: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
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
    gap: Spacing.three,
    paddingTop: Spacing.one,
  },
  itemCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  itemText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
    paddingTop: 2,
  },
  metaBlock: {
    gap: 2,
  },
  metaDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  metaLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  metaValue: {
    fontFamily: Fonts.montserratMedium,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textDisabled,
    letterSpacing: 0.1,
  },
});
