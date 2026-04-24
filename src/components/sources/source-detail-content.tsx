import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MeetingAlertsSection } from "@/components/meeting/meeting-alerts-section";
import { MeetingEntitiesSection } from "@/components/meeting/meeting-entities-section";
import { ScreenHeader } from "@/components/screen-header";
import { SourceTablesSection } from "@/components/sources/source-tables-section";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useSourcesStore } from "@/stores/sources-store";
import { goBackOrHome } from "@/utils/navigation";

interface SourceDetailContentProps {
  sourceId: string;
}

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

export function SourceDetailContent({ sourceId }: SourceDetailContentProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
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

  const title = source?.title?.trim() || source?.filename?.trim() || "Documento";
  // Backend emits `summary_type: "document"` for the whole-PDF summary and
  // `"section"` for per-section summaries. Fall back to first available if
  // neither is present (future summary types).
  const documentSummaryIndex =
    source?.summaries.findIndex((s) => s.summary_type === "document") ?? -1;
  const primarySummaryIndex =
    documentSummaryIndex >= 0 ? documentSummaryIndex : source?.summaries.length ? 0 : -1;
  const primarySummary =
    primarySummaryIndex >= 0 ? source?.summaries[primarySummaryIndex]?.summary_text : undefined;
  const sectionSummaries =
    source?.summaries.filter((_, index) => index !== primarySummaryIndex) ?? [];
  const entities = source?.entities ?? [];
  const insights = source?.insights ?? [];
  const tables = source?.tables ?? [];

  return (
    <View style={styles.root}>
      <ScreenHeader
        topInset={insets.top}
        icon="document-text"
        titlePrefix="Detalle"
        titleAccent="Documento"
        showBack={isMobile}
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
            <View style={styles.heroTopRow}>
              <ThemedText style={styles.heroFolio}>DOCUMENTO · PDF</ThemedText>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(source.status) }]} />
                <ThemedText style={[styles.statusText, { color: statusColor(source.status) }]}>
                  {statusLabel(source.status)}
                </ThemedText>
              </View>
            </View>

            {source.created_at ? (
              <ThemedText style={styles.heroDate}>{formatDate(source.created_at)}</ThemedText>
            ) : null}

            <ThemedText style={styles.heroTitle} numberOfLines={5}>
              {title}
            </ThemedText>

            {source.filename ? (
              <ThemedText style={styles.heroFilename} numberOfLines={1}>
                {source.filename}
              </ThemedText>
            ) : null}

            <View style={styles.heroAxis}>
              <View style={styles.heroAxisRule} />
              <View style={styles.heroAxisDot} />
            </View>

            <View style={styles.heroStats}>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>ENTIDADES</ThemedText>
                <ThemedText style={styles.statValue}>
                  {String(entities.length).padStart(2, "0")}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>INSIGHTS</ThemedText>
                <ThemedText style={styles.statValue}>
                  {String(insights.length).padStart(2, "0")}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>TABLAS</ThemedText>
                <ThemedText style={styles.statValue}>
                  {String(tables.length).padStart(2, "0")}
                </ThemedText>
              </View>
            </View>
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

          {/* ——— RESUMEN PRINCIPAL ——— */}
          {primarySummary ? (
            <View style={styles.editorialBlock}>
              <View style={styles.editorialRail} />
              <View style={styles.editorialContent}>
                <ThemedText style={styles.editorialEyebrow}>RESUMEN · DEL DOCUMENTO</ThemedText>
                <ThemedText style={styles.editorialBody}>{primarySummary}</ThemedText>
              </View>
            </View>
          ) : null}

          {/* ——— RESÚMENES POR SECCIÓN ——— */}
          {sectionSummaries.length > 0 ? (
            <View style={styles.sectionsGroup}>
              <ThemedText style={styles.sectionsGroupEyebrow}>RESÚMENES · POR SECCIÓN</ThemedText>
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

          {/* ——— ALERTAS / INSIGHTS ——— */}
          {insights.length > 0 ? <MeetingAlertsSection insights={insights} /> : null}

          {/* ——— ENTIDADES ——— */}
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
  hero: {
    gap: Spacing.three,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroFolio: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
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
    letterSpacing: 2,
  },
  heroDate: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.8,
  },
  heroTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 30,
    lineHeight: 36,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.8,
  },
  heroFilename: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textMuted,
    letterSpacing: 0.2,
  },
  heroAxis: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  heroAxisRule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroAxisDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
    paddingTop: Spacing.one,
  },
  statBlock: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  statValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 28,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
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
  editorialBlock: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  editorialRail: {
    width: 2,
    backgroundColor: SemanticColors.success,
    borderRadius: 1,
  },
  editorialContent: {
    flex: 1,
    gap: Spacing.two,
  },
  editorialEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 2.4,
  },
  editorialBody: {
    fontFamily: Fonts.montserrat,
    fontSize: 15,
    lineHeight: 24,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.1,
  },
  sectionsGroup: {
    gap: Spacing.three,
  },
  sectionsGroupEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
    paddingBottom: Spacing.one,
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
