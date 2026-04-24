import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { InsightCategory, InsightSeverity, SourceInsight } from "@/types/source";

interface MeetingAlertsSectionProps {
  insights: readonly SourceInsight[];
}

const CATEGORY_LABEL: Record<InsightCategory, string> = {
  risk: "Riesgo",
  opportunity: "Oportunidad",
  strategy_signal: "Señal estratégica",
  pain_point: "Punto de dolor",
  resource: "Recurso",
  milestone: "Hito",
  kpi_signal: "Señal KPI",
};

const CATEGORY_ICON: Record<InsightCategory, React.ComponentProps<typeof Ionicons>["name"]> = {
  risk: "alert-circle-outline",
  opportunity: "trending-up-outline",
  strategy_signal: "compass-outline",
  pain_point: "bandage-outline",
  resource: "layers-outline",
  milestone: "flag-outline",
  kpi_signal: "stats-chart-outline",
};

const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  high: "ALTA",
  medium: "MEDIA",
  low: "BAJA",
};

function categoryLabel(category: string): string {
  if (category in CATEGORY_LABEL) return CATEGORY_LABEL[category as InsightCategory];
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, " ");
}

function categoryIcon(category: string): React.ComponentProps<typeof Ionicons>["name"] {
  if (category in CATEGORY_ICON) return CATEGORY_ICON[category as InsightCategory];
  return "ellipse-outline";
}

function severityColor(severity: string): string {
  if (severity === "high") return SemanticColors.error;
  if (severity === "medium") return SemanticColors.warning;
  return SemanticColors.textMuted;
}

function severityLabel(severity: string): string {
  if (severity in SEVERITY_LABEL) return SEVERITY_LABEL[severity as InsightSeverity];
  return severity.toUpperCase();
}

function severityRank(severity: string): number {
  if (severity in SEVERITY_ORDER) return SEVERITY_ORDER[severity as InsightSeverity];
  return 99;
}

function sortInsights(insights: readonly SourceInsight[]): SourceInsight[] {
  return [...insights].sort((a, b) => {
    const rankDiff = severityRank(a.severity) - severityRank(b.severity);
    if (rankDiff !== 0) return rankDiff;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });
}

function formatConfidence(conf: number): string {
  const pct = Math.round(conf * 100);
  return `${pct}%`;
}

export function MeetingAlertsSection({ insights }: MeetingAlertsSectionProps) {
  if (insights.length === 0) return null;

  const sorted = sortInsights(insights);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.eyebrow}>ALERTAS · DEL AGENTE</ThemedText>
        <ThemedText style={styles.count}>{String(insights.length).padStart(2, "0")}</ThemedText>
      </View>

      <View style={styles.rule} />

      <View style={styles.list}>
        {sorted.map((insight, idx) => {
          const color = severityColor(insight.severity);
          const isFirst = idx === 0;
          return (
            <View key={insight.insight_id} style={[styles.item, !isFirst && styles.itemDivider]}>
              <View style={styles.itemTopRow}>
                <Ionicons
                  name={categoryIcon(insight.category)}
                  size={14}
                  color={SemanticColors.textSecondaryLight}
                />
                <ThemedText style={styles.categoryLabel}>
                  {categoryLabel(insight.category)}
                </ThemedText>
                <View style={styles.severityBadge}>
                  <View style={[styles.severityDot, { backgroundColor: color }]} />
                  <ThemedText style={[styles.severityText, { color }]}>
                    {severityLabel(insight.severity)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.insightText}>{insight.insight_text}</ThemedText>

              {insight.supporting_evidence ? (
                <View style={styles.evidenceWrap}>
                  <View style={styles.evidenceRail} />
                  <ThemedText style={styles.evidenceText} numberOfLines={3}>
                    {insight.supporting_evidence}
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>CONFIANZA</ThemedText>
                <View style={styles.confidenceTrack}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${Math.max(0, Math.min(100, insight.confidence * 100))}%` },
                    ]}
                  />
                </View>
                <ThemedText style={styles.confidenceValue}>
                  {formatConfidence(insight.confidence)}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingBottom: 2,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  count: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 12,
    lineHeight: 14,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  list: {
    paddingTop: Spacing.two,
  },
  item: {
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  categoryLabel: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  severityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  severityText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.6,
  },
  insightText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.1,
  },
  evidenceWrap: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingTop: 2,
  },
  evidenceRail: {
    width: 1,
    backgroundColor: "rgba(0,255,132,0.25)",
  },
  evidenceText: {
    flex: 1,
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    fontStyle: "italic",
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: 4,
  },
  metaLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  confidenceTrack: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 1,
    overflow: "hidden",
  },
  confidenceFill: {
    height: 2,
    backgroundColor: SemanticColors.success,
  },
  confidenceValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
    minWidth: 32,
    textAlign: "right",
  },
});
