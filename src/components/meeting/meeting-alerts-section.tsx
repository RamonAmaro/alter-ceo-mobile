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

// User-facing labels framed as "what should I do with this?" rather than
// abstract severity levels. Product CEO direction: non-technical users read
// "ALTA/MEDIA/BAJA" as ambiguous, so we spell the meaning out.
const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  high: "URGENTE",
  medium: "IMPORTANTE",
  low: "INFORMATIVO",
};

const SEVERITY_HELP: Record<InsightSeverity, string> = {
  high: "Actúa pronto — riesgo u oportunidad crítica.",
  medium: "Revisa esta semana — impacto relevante en el negocio.",
  low: "Lectura de contexto — no requiere acción inmediata.",
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

function severityHelp(severity: string): string | null {
  if (severity in SEVERITY_HELP) return SEVERITY_HELP[severity as InsightSeverity];
  return null;
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

function formatConfidencePct(conf: number): number {
  return Math.max(0, Math.min(100, Math.round(conf * 100)));
}

// Graduated colour for the fiability bar so the user reads it as a quality
// signal, not just a neutral progress bar.
function confidenceColor(conf: number): string {
  const pct = conf * 100;
  if (pct >= 75) return SemanticColors.success;
  if (pct >= 50) return SemanticColors.warning;
  return SemanticColors.error;
}

function confidenceLabel(conf: number): string {
  const pct = conf * 100;
  if (pct >= 75) return "alta";
  if (pct >= 50) return "media";
  return "revisar manualmente";
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

      <ThemedText style={styles.intro}>
        El agente ha analizado el documento y ha marcado estos puntos. Se ordenan por urgencia y
        cada uno incluye una cita literal del PDF.
      </ThemedText>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SemanticColors.error }]} />
          <ThemedText style={styles.legendText}>Urgente</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SemanticColors.warning }]} />
          <ThemedText style={styles.legendText}>Importante</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SemanticColors.textMuted }]} />
          <ThemedText style={styles.legendText}>Informativo</ThemedText>
        </View>
      </View>

      <View style={styles.list}>
        {sorted.map((insight) => {
          const sevColor = severityColor(insight.severity);
          const confPct = formatConfidencePct(insight.confidence);
          const confColor = confidenceColor(insight.confidence);
          const help = severityHelp(insight.severity);
          return (
            <View key={insight.insight_id} style={styles.card}>
              {/* Coloured rail on the left signals urgency at a glance. */}
              <View style={[styles.cardRail, { backgroundColor: sevColor }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.severityChip, { borderColor: sevColor }]}>
                    <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                    <ThemedText style={[styles.severityText, { color: sevColor }]}>
                      {severityLabel(insight.severity)}
                    </ThemedText>
                  </View>
                  <View style={styles.categoryWrap}>
                    <Ionicons
                      name={categoryIcon(insight.category)}
                      size={13}
                      color={SemanticColors.textMuted}
                    />
                    <ThemedText style={styles.categoryLabel}>
                      {categoryLabel(insight.category)}
                    </ThemedText>
                  </View>
                </View>

                {help ? <ThemedText style={styles.severityHelp}>{help}</ThemedText> : null}

                <ThemedText style={styles.insightText}>{insight.insight_text}</ThemedText>

                {insight.supporting_evidence ? (
                  <View style={styles.evidenceBox}>
                    <ThemedText style={styles.evidenceLabel}>EXTRACTO DEL DOCUMENTO</ThemedText>
                    <View style={styles.evidenceWrap}>
                      <View style={styles.evidenceRail} />
                      <ThemedText style={styles.evidenceText} numberOfLines={4}>
                        “{insight.supporting_evidence}”
                      </ThemedText>
                    </View>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaLabelBlock}>
                    <ThemedText style={styles.metaLabel}>FIABILIDAD</ThemedText>
                    <ThemedText style={[styles.metaHint, { color: confColor }]}>
                      {confidenceLabel(insight.confidence)}
                    </ThemedText>
                  </View>
                  <View style={styles.confidenceTrack}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${confPct}%`, backgroundColor: confColor },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.confidenceValue, { color: confColor }]}>
                    {confPct}%
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <ThemedText style={styles.footerNote}>
        La fiabilidad indica cuán seguro está el agente de haber interpretado correctamente el
        documento. Si es baja, revisa la cita original antes de decidir.
      </ThemedText>
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
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 14,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  intro: {
    fontFamily: Fonts.montserrat,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.1,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 0.2,
  },
  list: {
    paddingTop: Spacing.one,
    gap: Spacing.three,
  },
  card: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 10,
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  severityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
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
  severityHelp: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.textMuted,
    letterSpacing: 0.1,
    fontStyle: "italic",
  },
  categoryWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
  evidenceBox: {
    gap: 6,
    paddingTop: 2,
  },
  evidenceLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  evidenceWrap: {
    flexDirection: "row",
    gap: Spacing.two,
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
    paddingTop: Spacing.one,
  },
  metaLabelBlock: {
    gap: 1,
  },
  metaLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  metaHint: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.8,
    textTransform: "lowercase",
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
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
    minWidth: 32,
    textAlign: "right",
  },
  footerNote: {
    fontFamily: Fonts.montserrat,
    fontSize: 11,
    lineHeight: 17,
    color: SemanticColors.textMuted,
    letterSpacing: 0.1,
    fontStyle: "italic",
    paddingTop: Spacing.two,
  },
});
