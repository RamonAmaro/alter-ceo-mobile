import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { InsightCategory, InsightSeverity, SourceInsight } from "@/types/source";

interface SourceInsightCardProps {
  insight: SourceInsight;
  showActionMeta?: boolean;
}

interface CategoryVisual {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}

const CATEGORY: Record<InsightCategory, CategoryVisual> = {
  risk: { label: "Riesgo", icon: "shield-alert-outline" },
  opportunity: { label: "Oportunidad", icon: "rocket-launch-outline" },
  strategy_signal: { label: "Señal estratégica", icon: "compass-outline" },
  pain_point: { label: "Punto de fricción", icon: "alert-octagon-outline" },
  resource: { label: "Recurso clave", icon: "cube-outline" },
  milestone: { label: "Hito", icon: "flag-checkered" },
  kpi_signal: { label: "Señal KPI", icon: "chart-line-variant" },
};

const FALLBACK_CATEGORY: CategoryVisual = {
  label: "Insight",
  icon: "lightbulb-on-outline",
};

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  high: "URGENTE",
  medium: "IMPORTANTE",
  low: "INFORMATIVO",
};

const UNSPECIFIED = "Sin especificar";

function categoryVisual(category: string): CategoryVisual {
  if (category in CATEGORY) return CATEGORY[category as InsightCategory];
  return {
    ...FALLBACK_CATEGORY,
    label: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, " "),
  };
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

function confidencePct(conf: number): number {
  return Math.max(0, Math.min(100, Math.round(conf * 100)));
}

// Confidence is a quantitative metric, so we use a 3-step colour scale
// (red / orange / green). Single colour per card: the bar AND the % share
// the same hue, so it reads as "this card's confidence is X" rather than
// adding random colour noise.
function confidenceColor(pct: number): string {
  if (pct >= 71) return SemanticColors.success;
  if (pct >= 31) return SemanticColors.warning;
  return SemanticColors.error;
}

function pageLabel(
  start: number | null | undefined,
  end: number | null | undefined,
): string | null {
  if (start == null && end == null) return null;
  if (start != null && end != null && start !== end) return `Páginas ${start}–${end}`;
  return `Página ${start ?? end}`;
}

export function SourceInsightCard({ insight, showActionMeta = false }: SourceInsightCardProps) {
  const sevColor = severityColor(insight.severity);
  const confPct = confidencePct(insight.confidence);
  const confColor = confidenceColor(confPct);
  const cat = categoryVisual(insight.category);
  const page = pageLabel(insight.page_start, insight.page_end);

  return (
    <View style={styles.card}>
      <View style={[styles.cardRail, { backgroundColor: sevColor }]} />
      <View style={styles.cardBody}>
        {/* Header: icon + category label on the left, severity chip on the right */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconPlate}>
              <MaterialCommunityIcons name={cat.icon} size={16} color={SemanticColors.textSubtle} />
            </View>
            <ThemedText style={styles.categoryLabel} numberOfLines={1}>
              {cat.label}
            </ThemedText>
          </View>
          <View style={[styles.severityChip, { borderColor: sevColor }]}>
            <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
            <ThemedText style={[styles.severityText, { color: sevColor }]}>
              {severityLabel(insight.severity)}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.insightText}>{insight.insight_text}</ThemedText>

        {showActionMeta ? (
          <View style={styles.actionMetaRow}>
            <View style={styles.actionMetaBlock}>
              <ThemedText style={styles.actionMetaLabel}>Responsables</ThemedText>
              <ThemedText style={styles.actionMetaValue}>{UNSPECIFIED}</ThemedText>
            </View>
            <View style={styles.actionMetaDivider} />
            <View style={styles.actionMetaBlock}>
              <ThemedText style={styles.actionMetaLabel}>Fecha límite</ThemedText>
              <ThemedText style={styles.actionMetaValue}>{UNSPECIFIED}</ThemedText>
            </View>
          </View>
        ) : null}

        {insight.supporting_evidence ? (
          <View style={styles.evidenceBox}>
            <View style={styles.evidenceHeaderRow}>
              <ThemedText style={styles.evidenceLabel}>EXTRACTO DEL DOCUMENTO</ThemedText>
              {page ? (
                <View style={styles.pageBadge}>
                  <Ionicons name="book-outline" size={10} color={SemanticColors.textMuted} />
                  <ThemedText style={styles.pageBadgeText}>{page}</ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.evidenceWrap}>
              <View style={styles.evidenceRail} />
              <ThemedText style={styles.evidenceText} numberOfLines={4}>
                “{insight.supporting_evidence}”
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.confidenceRow}>
          <ThemedText style={styles.confidenceCaption}>FIABILIDAD</ThemedText>
          <View style={styles.confidenceTrack}>
            <View
              style={[styles.confidenceFill, { width: `${confPct}%`, backgroundColor: confColor }]}
            />
          </View>
          <ThemedText style={[styles.confidenceValue, { color: confColor }]}>{confPct}%</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardRail: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flexShrink: 1,
  },
  iconPlate: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  severityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.4,
  },
  categoryLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  insightText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.1,
  },
  actionMetaRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
    paddingTop: 2,
    paddingBottom: 2,
  },
  actionMetaBlock: {
    gap: 2,
  },
  actionMetaDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionMetaLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  actionMetaValue: {
    fontFamily: Fonts.montserratMedium,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textDisabled,
    letterSpacing: 0.1,
  },
  evidenceBox: {
    gap: 6,
    paddingTop: 2,
  },
  evidenceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  evidenceLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  pageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pageBadgeText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 0.6,
  },
  evidenceWrap: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  evidenceRail: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
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
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  confidenceCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  confidenceTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceFill: {
    height: 3,
  },
  confidenceValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
    minWidth: 32,
    textAlign: "right",
  },
});
