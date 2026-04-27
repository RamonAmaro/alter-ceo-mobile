import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { SourceInsightCard } from "@/components/sources/source-insight-card";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { SourceInsight } from "@/types/source";

interface SourceInsightsBucketProps {
  index: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  insights: readonly SourceInsight[];
  emptyMessage: string;
  showActionMeta?: boolean;
}

export function SourceInsightsBucket({
  index,
  icon,
  iconColor,
  title,
  insights,
  emptyMessage,
  showActionMeta = false,
}: SourceInsightsBucketProps) {
  const folio = String(index).padStart(2, "0");
  const isEmpty = insights.length === 0;

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
          {!isEmpty ? (
            <ThemedText style={styles.count}>{String(insights.length).padStart(2, "0")}</ThemedText>
          ) : null}
        </View>

        <View style={styles.rule} />

        {isEmpty ? (
          <ThemedText style={styles.empty}>{emptyMessage}</ThemedText>
        ) : (
          <View style={styles.list}>
            {insights.map((insight) => (
              <SourceInsightCard
                key={insight.insight_id}
                insight={insight}
                showActionMeta={showActionMeta}
              />
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
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 18,
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
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 17,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
  },
  count: {
    fontFamily: Fonts.octosquaresBlack,
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
});
