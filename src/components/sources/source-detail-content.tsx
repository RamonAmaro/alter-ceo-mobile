import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MeetingEntitiesSection } from "@/components/meeting/meeting-entities-section";
import { MeetingSummarySection } from "@/components/meeting/meeting-summary-section";
import { ScreenHeader } from "@/components/screen-header";
import { SourceTablesSection } from "@/components/sources/source-tables-section";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useSourcesStore } from "@/stores/sources-store";
import type { SourceInsight, SourceSummaryOut, SourceTable } from "@/types/source";
import { goBackOrHome } from "@/utils/navigation";

interface SourceDetailContentProps {
  sourceId: string;
}

const STRATEGIC_CATEGORIES: ReadonlySet<string> = new Set([
  "strategy_signal",
  "opportunity",
  "risk",
  "kpi_signal",
]);

function statusLabel(status: string): string {
  if (status === "ready") return "LISTO";
  if (status === "processing") return "PROCESANDO";
  if (status === "pending") return "EN COLA";
  if (status === "failed") return "ERROR";
  return status.toUpperCase();
}

function statusColor(status: string): string {
  if (status === "ready") return SemanticColors.success;
  if (status === "failed") return SemanticColors.error;
  return SemanticColors.warning;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

function topicLabelFromSummary(summary: SourceSummaryOut, fallbackIndex: number): string {
  if (summary.section_path && summary.section_path.length > 0) {
    return summary.section_path.join(" › ");
  }
  return `Sección ${fallbackIndex + 1}`;
}

function sortInsightsByRelevance(insights: readonly SourceInsight[]): SourceInsight[] {
  const severityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return [...insights].sort((a, b) => {
    const aRank = severityRank[a.severity] ?? 99;
    const bRank = severityRank[b.severity] ?? 99;
    if (aRank !== bRank) return aRank - bRank;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });
}

// Derive "Temas tratados" only from real structural signals. The extractor
// populates section_summaries / section_path when it detects chapters; if it
// doesn't, we have no reliable topic source — table captions are NOT topics
// (they're labels of a single table), so we don't fall back to them.
function deriveTopics(
  sectionSummaries: readonly SourceSummaryOut[],
  insights: readonly SourceInsight[],
  tables: readonly SourceTable[],
): string[] {
  if (sectionSummaries.length > 0) {
    return sectionSummaries.map((s, i) => topicLabelFromSummary(s, i));
  }

  const fromPaths = new Set<string>();
  for (const i of insights) {
    if (i.section_path && i.section_path.length > 0) {
      fromPaths.add(i.section_path.join(" › "));
    }
  }
  for (const t of tables) {
    if (t.section_path && t.section_path.length > 0) {
      fromPaths.add(t.section_path.join(" › "));
    }
  }
  return Array.from(fromPaths);
}

export function SourceDetailContent({ sourceId }: SourceDetailContentProps) {
  const insets = useSafeAreaInsets();
  const source = useSourcesStore((s) => s.activeSource);
  const isLoading = useSourcesStore((s) => s.isDetailLoading);
  const detailError = useSourcesStore((s) => s.detailError);
  const loadSourceDetail = useSourcesStore((s) => s.loadSourceDetail);
  const stopDetailPolling = useSourcesStore((s) => s.stopDetailPolling);

  useEffect(() => {
    if (!sourceId) return;
    loadSourceDetail(sourceId);
    return () => {
      stopDetailPolling();
    };
  }, [sourceId, loadSourceDetail, stopDetailPolling]);

  const isCurrent = source?.source_id === sourceId;
  const showLoader = (isLoading && !isCurrent) || (!source && !detailError);

  // Backend stores title and filename separately, but when the user uploads
  // without naming the doc, title falls back to the filename — so we'd render
  // the same string twice. Strip the extension from the title for a cleaner
  // look, and only surface the filename underneath when it adds new info.
  const rawTitle = source?.title?.trim() || source?.filename?.trim() || "Documento";
  const title = rawTitle.replace(/\.[^./\\]+$/, "").trim() || rawTitle;
  const showFilename =
    !!source?.filename && source.filename.trim() !== rawTitle && source.filename.trim() !== title;

  const documentSummaryIndex =
    source?.summaries.findIndex((s) => s.summary_type === "document") ?? -1;
  const primarySummaryIndex =
    documentSummaryIndex >= 0 ? documentSummaryIndex : source?.summaries.length ? 0 : -1;
  const primarySummary =
    primarySummaryIndex >= 0 ? source?.summaries[primarySummaryIndex]?.summary_text : undefined;

  const sectionSummaries =
    source?.summaries.filter((_, index) => index !== primarySummaryIndex) ?? [];

  const insights = source?.insights ?? [];
  const entities = source?.entities ?? [];
  const tables = source?.tables ?? [];

  const topicsTreated = deriveTopics(sectionSummaries, insights, tables);

  // CEO direction: documents only show Temas tratados + Implicaciones
  // estratégicas as plain bullet lists. No severity, no fiabilidad, no
  // evidence cards — the user does not yet trust the agent's confidence
  // signal, so we only surface the insight_text.
  // We still pull from the same insight categories that represent strategy
  // signals (strategy_signal, opportunity, risk, kpi_signal) but render them
  // as a flat list.
  const strategicImplications = sortInsightsByRelevance(
    insights.filter((i) => STRATEGIC_CATEGORIES.has(i.category)),
  ).map((i) => i.insight_text);

  const totalInsights = topicsTreated.length + strategicImplications.length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        topInset={insets.top}
        icon="document-text"
        titlePrefix="Detalle"
        titleAccent="Documento"
        showBack
        onBack={() => goBackOrHome()}
      />

      {showLoader ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SemanticColors.tealLight} />
        </View>
      ) : !source ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={SemanticColors.error} />
          <ThemedText style={styles.errorText}>No se pudo cargar el documento.</ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          {/* ——— HERO ——— */}
          <View style={styles.hero}>
            <ThemedText style={styles.heroTitle} numberOfLines={4}>
              {title}
            </ThemedText>

            <View style={styles.heroMetaRow}>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(source.status) }]} />
                <ThemedText style={[styles.statusText, { color: statusColor(source.status) }]}>
                  {statusLabel(source.status)}
                </ThemedText>
              </View>
              {source.created_at ? (
                <>
                  <View style={styles.heroMetaDivider} />
                  <ThemedText style={styles.heroMetaText}>
                    {formatDate(source.created_at)}
                  </ThemedText>
                </>
              ) : null}
            </View>

            {showFilename ? (
              <ThemedText style={styles.heroFilename} numberOfLines={1}>
                {source.filename}
              </ThemedText>
            ) : null}
          </View>

          {/* ——— PROCESANDO ——— */}
          {source.status === "processing" || source.status === "pending" ? (
            <View style={styles.processingBox}>
              <ActivityIndicator size="small" color={SemanticColors.tealLight} />
              <View style={styles.processingContent}>
                <ThemedText style={styles.processingEyebrow}>ANÁLISIS EN CURSO</ThemedText>
                <ThemedText style={styles.processingBody}>
                  Estamos extrayendo el contenido del documento. Esto puede tardar unos minutos. La
                  pantalla se actualiza automáticamente.
                </ThemedText>
              </View>
            </View>
          ) : null}

          {/* ——— ERROR ——— */}
          {source.error_message ? (
            <View style={styles.errorBox}>
              <View style={styles.errorRail} />
              <View style={styles.errorContent}>
                <ThemedText style={styles.errorEyebrow}>INCIDENCIA</ThemedText>
                <ThemedText style={styles.errorBody}>{source.error_message}</ThemedText>
              </View>
            </View>
          ) : null}

          {/* ——— RESUMEN EJECUTIVO ——— */}
          {primarySummary ? (
            <View style={styles.editorialBlock}>
              <ThemedText style={styles.sectionTitle}>Resumen ejecutivo</ThemedText>
              <View style={styles.sectionTitleRule} />
              <ThemedText style={styles.editorialBody}>{primarySummary}</ThemedText>
            </View>
          ) : null}

          {/* ——— INSIGHTS ——— */}
          {source.status === "ready" ? (
            <View style={styles.insightsWrap}>
              <View style={styles.insightsHeader}>
                <ThemedText style={styles.sectionTitle}>Insights</ThemedText>
                <ThemedText style={styles.insightsCountBig}>
                  {String(totalInsights).padStart(2, "0")}
                </ThemedText>
              </View>

              <View style={styles.sectionTitleRule} />

              <View style={styles.insightsList}>
                {/* 1. Temas tratados */}
                <MeetingSummarySection
                  index={1}
                  icon="list-outline"
                  iconColor={SemanticColors.tealLight}
                  title="Temas tratados"
                  items={topicsTreated}
                  emptyMessage="Sin especificar"
                />

                {/* 2. Implicaciones estratégicas — bullets simples, sin
                    severidad/fiabilidad/extracto. Decisión del CEO: el
                    usuario aún no confía en cómo el agente puntúa, así que
                    sólo mostramos el insight_text como lista plana. */}
                <MeetingSummarySection
                  index={2}
                  icon="compass-outline"
                  iconColor={SemanticColors.success}
                  title="Implicaciones estratégicas"
                  items={strategicImplications}
                  emptyMessage="Sin especificar"
                />
              </View>
            </View>
          ) : null}

          {/* ——— RESÚMENES POR SECCIÓN (detalle ampliado) ——— */}
          {sectionSummaries.length > 0 ? (
            <View style={styles.sectionsGroup}>
              <ThemedText style={styles.sectionTitle}>Resúmenes por sección</ThemedText>
              <View style={styles.sectionTitleRule} />
              {sectionSummaries.map((summary) => {
                const sectionTitle =
                  summary.section_path && summary.section_path.length > 0
                    ? summary.section_path.join(" › ")
                    : `Sección ${summary.summary_id}`;
                return (
                  <View key={summary.summary_id} style={styles.sectionBlock}>
                    <ThemedText style={styles.sectionEyebrow} numberOfLines={2}>
                      {sectionTitle.toUpperCase()}
                    </ThemedText>
                    <ThemedText style={styles.sectionBody}>{summary.summary_text}</ThemedText>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* ——— ENTIDADES DETECTADAS ——— */}
          {entities.length > 0 ? <MeetingEntitiesSection entities={entities} /> : null}

          {/* ——— TABLAS ——— */}
          {tables.length > 0 ? <SourceTablesSection tables={tables} /> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    paddingTop: Spacing.two,
  },
  errorText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },

  /* ═══════════════════════════════════════════ */
  /*  HERO — Título grande, meta sutil debajo     */
  /* ═══════════════════════════════════════════ */
  hero: {
    gap: Spacing.two,
  },
  heroTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 30,
    lineHeight: 36,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.8,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: 2,
  },
  heroMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  heroMetaText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1.2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.6,
  },
  heroFilename: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textDisabled,
    letterSpacing: 0.2,
    marginTop: 4,
  },

  /* ═══════════════════════════════════════════ */
  /*  PROCESANDO                                 */
  /* ═══════════════════════════════════════════ */
  processingBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(0,192,238,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,192,238,0.18)",
  },
  processingContent: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  processingEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.tealLight,
    letterSpacing: 2.4,
  },
  processingBody: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },

  /* ═══════════════════════════════════════════ */
  /*  ERROR                                       */
  /* ═══════════════════════════════════════════ */
  errorBox: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  errorRail: {
    width: 2,
    backgroundColor: SemanticColors.error,
    borderRadius: 1,
  },
  errorContent: {
    flex: 1,
    gap: 4,
  },
  errorEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.error,
    letterSpacing: 2.4,
  },
  errorBody: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },

  /* ═══════════════════════════════════════════ */
  /*  TÍTULOS DE SECCIÓN (compartido)             */
  /* ═══════════════════════════════════════════ */
  sectionTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  sectionTitleRule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },

  /* ═══════════════════════════════════════════ */
  /*  RESUMEN EJECUTIVO                           */
  /* ═══════════════════════════════════════════ */
  editorialBlock: {
    gap: 0,
  },
  editorialBody: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.1,
  },

  /* ═══════════════════════════════════════════ */
  /*  INSIGHTS                                    */
  /* ═══════════════════════════════════════════ */
  insightsWrap: {
    gap: Spacing.two,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  insightsCountBig: {
    fontFamily: Fonts.montserratBold,
    fontSize: 28,
    lineHeight: 32,
    color: SemanticColors.success,
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
  insightsList: {
    paddingTop: Spacing.two,
  },

  /* ═══════════════════════════════════════════ */
  /*  RESÚMENES POR SECCIÓN                       */
  /* ═══════════════════════════════════════════ */
  sectionsGroup: {
    gap: Spacing.three,
  },
  sectionBlock: {
    gap: Spacing.one,
    paddingLeft: Spacing.two,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  sectionEyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 1.8,
  },
  sectionBody: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
  },
});
