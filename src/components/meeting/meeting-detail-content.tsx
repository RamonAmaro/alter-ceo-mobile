import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useMeetingStore } from "@/stores/meeting-store";
import { goBackOrHome } from "@/utils/navigation";

import { MeetingAudioPlayer } from "./meeting-audio-player";
import { MeetingSummarySection } from "./meeting-summary-section";
import { MeetingTranscriptSection } from "./meeting-transcript-section";

interface MeetingDetailContentProps {
  meetingId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function formatDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const precision = v >= 100 || i === 0 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(precision)} ${units[i]}`;
}

function statusColor(status: string): string {
  if (status === "COMPLETED") return SemanticColors.success;
  if (status === "FAILED") return SemanticColors.error;
  return SemanticColors.warning;
}

function statusLabel(status: string): string {
  if (status === "COMPLETED") return "COMPLETADO";
  if (status === "FAILED") return "ERROR";
  if (status === "PROCESSING") return "PROCESANDO";
  return status.toUpperCase();
}

function processingStageLabel(stage: string | null | undefined): string | null {
  switch (stage) {
    case "transcribing":
      return "TRANSCRIBIENDO AUDIO";
    case "summarizing":
      return "GENERANDO RESUMEN";
    case "updating_memory":
      return "ACTUALIZANDO MEMORIA";
    case "uploaded":
      return "ARCHIVO SUBIDO";
    case "completed":
      return "FLUJO COMPLETO";
    case "failed":
      return "FALLO EN PROCESO";
    case "pending_upload":
      return "PENDIENTE DE SUBIDA";
    default:
      return null;
  }
}

function shortId(id: string | undefined): string {
  if (!id) return "—";
  return id.length > 10 ? `${id.slice(0, 4)}…${id.slice(-6)}` : id;
}

type SectionKey = "decisions" | "blockers" | "next" | "signals";

interface SectionStat {
  readonly key: SectionKey;
  readonly icon: React.ComponentProps<typeof Ionicons>["name"];
  readonly color: string;
  readonly title: string;
  readonly items: readonly string[];
  readonly emptyMessage: string;
}

export function MeetingDetailContent({ meetingId }: MeetingDetailContentProps) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsiveLayout();
  const meeting = useMeetingStore((s) => s.activeMeeting);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const getMeetingDetails = useMeetingStore((s) => s.getMeetingDetails);

  useEffect(() => {
    if (meetingId) {
      getMeetingDetails(meetingId);
    }
  }, [meetingId, getMeetingDetails]);

  const summary = meeting?.summary;
  const dur = formatDuration(meeting?.duration_seconds);
  const sColor = meeting ? statusColor(meeting.status) : SemanticColors.textMuted;
  const stageLabel = meeting ? processingStageLabel(meeting.processing_stage) : null;

  const sections: readonly SectionStat[] = summary
    ? [
        {
          key: "decisions",
          icon: "checkmark-circle",
          color: SemanticColors.success,
          title: "Decisiones",
          items: summary.decisions ?? [],
          emptyMessage: "Sin decisiones extraídas",
        },
        {
          key: "blockers",
          icon: "warning",
          color: SemanticColors.warning,
          title: "Bloqueos",
          items: summary.blockers ?? [],
          emptyMessage: "Sin bloqueos extraídos",
        },
        {
          key: "next",
          icon: "arrow-forward-circle",
          color: SemanticColors.info,
          title: "Próximos pasos",
          items: summary.next_steps ?? [],
          emptyMessage: "Sin siguientes pasos",
        },
        {
          key: "signals",
          icon: "pulse",
          color: SemanticColors.accent,
          title: "Señales Business Kernel",
          items: summary.business_kernel_signals ?? [],
          emptyMessage: "Sin señales extraídas",
        },
      ]
    : [];

  const totalInsights = sections.reduce((acc, s) => acc + s.items.length, 0);
  const hasAnySectionData = sections.some((s) => s.items.length > 0);

  return (
    <View style={styles.root}>
      <ScreenHeader
        topInset={insets.top}
        icon="document-text"
        titlePrefix="Detalle"
        titleAccent="Reunión"
        showBack
        onBack={() => goBackOrHome()}
      />

      {isLoading || !meeting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SemanticColors.tealLight} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ——— DOSSIER STRIP (technical identity) ——— */}
          <View style={styles.dossierStrip}>
            <View style={styles.dossierChip}>
              <ThemedText style={styles.dossierChipKey}>ID</ThemedText>
              <ThemedText style={styles.dossierChipValue}>{shortId(meeting.meeting_id)}</ThemedText>
            </View>
            <View style={styles.dossierDot} />
            <View style={styles.dossierChip}>
              <ThemedText style={styles.dossierChipKey}>ARCHIVO</ThemedText>
              <ThemedText style={styles.dossierChipValue} numberOfLines={1}>
                {meeting.file_name ?? "—"}
              </ThemedText>
            </View>
            <View style={styles.dossierDot} />
            <View style={styles.dossierChip}>
              <ThemedText style={styles.dossierChipKey}>PESO</ThemedText>
              <ThemedText style={styles.dossierChipValue}>
                {formatSize(meeting.size_bytes)}
              </ThemedText>
            </View>
          </View>

          {/* ——— BRIEFING HEADLINE ——— */}
          <View style={[styles.briefing, isDesktop && styles.briefingDesktop]}>
            <View style={[styles.briefingNumeric, isDesktop && styles.briefingNumericDesktop]}>
              <View style={styles.cornerTl} />
              <View style={styles.cornerTr} />
              <View style={styles.cornerBl} />
              <View style={styles.cornerBr} />

              <ThemedText style={styles.briefingStat}>{dur}</ThemedText>
              <View style={styles.briefingStatRow}>
                <View style={styles.briefingStatBar} />
                <ThemedText style={styles.briefingStatLabel}>TIEMPO · MIN SEG</ThemedText>
              </View>
            </View>

            <View style={[styles.briefingBody, isDesktop && styles.briefingBodyDesktop]}>
              <View style={styles.briefingTopRow}>
                <ThemedText style={styles.briefingTitle} numberOfLines={3}>
                  {meeting.title}
                </ThemedText>
                {isDesktop ? (
                  <View
                    style={[
                      styles.statusFlag,
                      { backgroundColor: `${sColor}15`, borderColor: `${sColor}44` },
                    ]}
                  >
                    <View style={[styles.statusFlagDot, { backgroundColor: sColor }]} />
                    <ThemedText style={[styles.statusFlagLabel, { color: sColor }]}>
                      {statusLabel(meeting.status)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>

              <View style={styles.briefingGrid}>
                <View style={styles.briefingCell}>
                  <ThemedText style={styles.briefingCellLabel}>FECHA</ThemedText>
                  <ThemedText style={styles.briefingCellValue}>
                    {formatDate(meeting.created_at)}
                  </ThemedText>
                </View>

                {!isDesktop ? (
                  <>
                    <View style={styles.briefingCellDivider} />
                    <View
                      style={[
                        styles.statusFlag,
                        styles.briefingCellStatus,
                        { backgroundColor: `${sColor}15`, borderColor: `${sColor}44` },
                      ]}
                    >
                      <View style={[styles.statusFlagDot, { backgroundColor: sColor }]} />
                      <ThemedText style={[styles.statusFlagLabel, { color: sColor }]}>
                        {statusLabel(meeting.status)}
                      </ThemedText>
                    </View>
                  </>
                ) : null}

                {stageLabel && meeting.status !== "COMPLETED" ? (
                  <>
                    <View style={styles.briefingCellDivider} />
                    <View style={styles.briefingCell}>
                      <ThemedText style={styles.briefingCellLabel}>ETAPA</ThemedText>
                      <ThemedText
                        style={[styles.briefingCellValue, { color: sColor }]}
                        numberOfLines={1}
                      >
                        {stageLabel}
                      </ThemedText>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          </View>

          {/* ——— AUDIO PLAYER (console bar) ——— */}
          <View style={styles.audioConsole}>
            <MeetingAudioPlayer
              audioUrl={meeting.audio_url}
              durationSeconds={meeting.duration_seconds}
            />
          </View>

          {/* ——— RESUMEN EJECUTIVO (editorial) ——— */}
          {summary ? (
            <View style={styles.summaryBlock}>
              <View style={styles.summaryEyebrowRow}>
                <View style={styles.summaryEyebrowBar} />
                <ThemedText style={styles.summaryEyebrow}>RESUMEN · EJECUTIVO</ThemedText>
              </View>

              <ThemedText style={styles.summaryHeadline}>{summary.headline}</ThemedText>

              <ThemedText style={styles.summaryBody}>{summary.executive_summary}</ThemedText>
            </View>
          ) : null}

          {/* ——— ANATOMY BREAKDOWN ——— */}
          {sections.length > 0 ? (
            <View style={styles.anatomyWrap}>
              <View style={styles.anatomyHeader}>
                <View style={styles.anatomyHeaderLeft}>
                  <ThemedText style={styles.anatomyCount}>
                    {String(totalInsights).padStart(2, "0")}
                  </ThemedText>
                  <View style={styles.anatomyLabelBlock}>
                    <ThemedText style={styles.anatomyLabel}>INSIGHTS</ThemedText>
                    <ThemedText style={styles.anatomySub}>DETECTADOS · POR ALTER</ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.anatomyBar}>
                {sections.map((sec, idx) => {
                  const empty = sec.items.length === 0;
                  return (
                    <View
                      key={`bd-${sec.key}`}
                      style={[
                        styles.anatomySeg,
                        idx < sections.length - 1 && styles.anatomyDivider,
                      ]}
                    >
                      <View
                        style={[
                          styles.anatomySegAccent,
                          { backgroundColor: empty ? "rgba(255,255,255,0.1)" : sec.color },
                        ]}
                      />
                      <View style={styles.anatomySegTop}>
                        <Ionicons
                          name={sec.icon}
                          size={12}
                          color={empty ? SemanticColors.textMuted : sec.color}
                        />
                        <ThemedText
                          style={[
                            styles.anatomyNum,
                            { color: empty ? SemanticColors.textMuted : sec.color },
                          ]}
                        >
                          {sec.items.length}
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={[styles.anatomySegTitle, empty && styles.anatomySegTitleEmpty]}
                        numberOfLines={2}
                      >
                        {sec.title}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>

              {hasAnySectionData ? (
                <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
                  {sections
                    .filter((s) => s.items.length > 0)
                    .map((sec) => (
                      <View
                        key={sec.key}
                        style={[styles.gridItem, isDesktop && styles.gridItemDesktop]}
                      >
                        <MeetingSummarySection
                          icon={sec.icon}
                          iconColor={sec.color}
                          title={sec.title}
                          items={sec.items}
                          emptyMessage={sec.emptyMessage}
                        />
                      </View>
                    ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {meeting.transcript ? <MeetingTranscriptSection transcript={meeting.transcript} /> : null}

          {meeting.error_message ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={SemanticColors.error} />
              <ThemedText style={styles.errorText}>{meeting.error_message}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const briefingShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
  },
  android: { elevation: 8 },
  web: { boxShadow: "0 10px 28px rgba(0,0,0,0.3)" },
});

const CORNER_SIZE = 10;
const CORNER_THICKNESS = 1.5;
const CORNER_COLOR = "rgba(0,255,132,0.35)";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },

  /* ——— Dossier Strip (technical identity) ——— */
  dossierStrip: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  dossierChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  dossierChipKey: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  dossierChipValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.6,
    maxWidth: 220,
  },
  dossierDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  /* ——— Briefing (hero asymmetric) ——— */
  briefing: {
    flexDirection: "column",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...briefingShadow,
  },
  briefingDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.four,
    padding: Spacing.four,
  },
  briefingNumeric: {
    position: "relative",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 128,
  },
  briefingNumericDesktop: {
    paddingRight: Spacing.four,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
    minWidth: 220,
  },
  cornerTl: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
  },
  cornerTr: {
    position: "absolute",
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
  },
  cornerBl: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
  },
  cornerBr: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
  },
  briefingStat: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 72,
    lineHeight: 74,
    color: SemanticColors.success,
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"],
  },
  briefingStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  briefingStatBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  briefingStatLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  briefingBody: {
    flex: 1,
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  briefingBodyDesktop: {
    paddingLeft: Spacing.two,
  },
  briefingTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  statusFlag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusFlagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusFlagLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2,
  },
  briefingTitle: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  briefingGrid: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  briefingCell: {
    gap: 2,
    minWidth: 90,
  },
  briefingCellDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  briefingCellLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  briefingCellValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.4,
  },
  briefingCellStatus: {
    alignSelf: "center",
  },

  /* ——— Audio Console ——— */
  audioConsole: {
    marginTop: -Spacing.one,
  },

  /* ——— Resumen Ejecutivo (editorial) ——— */
  summaryBlock: {
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,255,132,0.35)",
    gap: Spacing.two,
  },
  summaryEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  summaryEyebrowBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  summaryEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  summaryHeadline: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.3,
    marginTop: Spacing.one,
  },
  summaryBody: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 23,
    color: SemanticColors.textSecondaryLight,
    marginTop: Spacing.one,
  },

  /* ——— Anatomy ——— */
  anatomyWrap: {
    gap: Spacing.three,
  },
  anatomyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anatomyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  anatomyCount: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 44,
    lineHeight: 46,
    color: SemanticColors.success,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  anatomyLabelBlock: {
    gap: 2,
  },
  anatomyLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    letterSpacing: 2.4,
  },
  anatomySub: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  anatomyBar: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: Spacing.two,
  },
  anatomySeg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
    position: "relative",
  },
  anatomySegAccent: {
    position: "absolute",
    bottom: -Spacing.two,
    left: "25%",
    right: "25%",
    height: 2,
    borderRadius: 1,
  },
  anatomyDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.06)",
  },
  anatomySegTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  anatomyNum: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },
  anatomySegTitle: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  anatomySegTitleEmpty: {
    color: SemanticColors.textMuted,
  },

  /* ——— Details grid ——— */
  grid: {
    gap: Spacing.two,
  },
  gridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  gridItem: {
    width: "100%",
  },
  gridItemDesktop: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 280,
    alignSelf: "stretch",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: SemanticColors.errorMuted,
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.25)",
  },
  errorText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    color: SemanticColors.error,
    flex: 1,
  },
});
