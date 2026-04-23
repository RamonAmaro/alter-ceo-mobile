import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useMeetingStore } from "@/stores/meeting-store";
import { formatDurationSeconds } from "@/utils/format-date";
import { goBackOrHome } from "@/utils/navigation";

import { MeetingSummarySection } from "./meeting-summary-section";
import { MeetingTechnicalDetails } from "./meeting-technical-details";
import { MeetingTranscriptSection } from "./meeting-transcript-section";

interface MeetingDetailContentProps {
  meetingId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
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
  if (status === "UPLOADED") return "SUBIDO";
  if (status === "PENDING_UPLOAD") return "PENDIENTE";
  return status.toUpperCase();
}

function processingStageLabel(stage: string | null | undefined): string | null {
  switch (stage) {
    case "transcribing":
      return "Transcribiendo audio";
    case "summarizing":
      return "Generando resumen";
    case "updating_memory":
      return "Actualizando insights";
    case "uploaded":
      return "Archivo subido";
    case "completed":
      return null;
    case "failed":
      return "Fallo en el proceso";
    case "pending_upload":
      return "Pendiente de subida";
    default:
      return null;
  }
}

function confirmDelete(onConfirm: () => void): void {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined" &&
      window.confirm("¿Eliminar esta reunión? Esta acción no se puede deshacer.");
    if (ok) onConfirm();
    return;
  }
  Alert.alert(
    "Eliminar reunión",
    "¿Seguro que quieres eliminar esta reunión? Esta acción no se puede deshacer.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onConfirm },
    ],
  );
}

interface InsightSection {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  items: readonly string[];
  emptyMessage: string;
}

export function MeetingDetailContent({ meetingId }: MeetingDetailContentProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const meeting = useMeetingStore((s) => s.activeMeeting);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const getMeetingDetails = useMeetingStore((s) => s.getMeetingDetails);
  const deleteMeeting = useMeetingStore((s) => s.deleteMeeting);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (meetingId) {
      getMeetingDetails(meetingId);
    }
  }, [meetingId, getMeetingDetails]);

  const summary = meeting?.summary;
  const dur = formatDurationSeconds(meeting?.duration_seconds);
  const sColor = meeting ? statusColor(meeting.status) : SemanticColors.textMuted;
  const stageLabel = meeting ? processingStageLabel(meeting.processing_stage) : null;

  const decisions = summary?.decisions ?? [];
  const blockers = summary?.blockers ?? [];
  const nextSteps = summary?.next_steps ?? [];
  const kernelSignals = summary?.business_kernel_signals ?? [];

  const insightSections: InsightSection[] = summary
    ? [
        {
          key: "decisions",
          icon: "checkmark-circle-outline",
          iconColor: SemanticColors.success,
          title: "Decisiones",
          items: decisions,
          emptyMessage: "Sin decisiones extraídas",
        },
        {
          key: "next_steps",
          icon: "arrow-forward-circle-outline",
          iconColor: SemanticColors.info,
          title: "Puntos de acción",
          items: nextSteps,
          emptyMessage: "Sin puntos de acción definidos",
        },
        {
          key: "blockers",
          icon: "warning-outline",
          iconColor: SemanticColors.warning,
          title: "Bloqueos",
          items: blockers,
          emptyMessage: "Sin bloqueos detectados",
        },
        ...(kernelSignals.length > 0
          ? ([
              {
                key: "kernel",
                icon: "pulse-outline",
                iconColor: SemanticColors.tealLight,
                title: "Señales de negocio",
                items: kernelSignals,
                emptyMessage: "",
              },
            ] as InsightSection[])
          : []),
      ]
    : [];

  const totalInsights =
    decisions.length + blockers.length + nextSteps.length + kernelSignals.length;

  function handleDelete(): void {
    if (!meeting || isDeleting) return;
    confirmDelete(async () => {
      setIsDeleting(true);
      try {
        await deleteMeeting(meeting.meeting_id);
        goBackOrHome();
      } catch {
        setIsDeleting(false);
      }
    });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        topInset={insets.top}
        icon="document-text"
        titlePrefix="Detalle"
        titleAccent="Reunión"
        showBack={isMobile}
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
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          {/* ———————————————————————————————————— */}
          {/*  HERO · folio + título + duración     */}
          {/* ———————————————————————————————————— */}
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <ThemedText style={styles.heroFolio}>ACTA · 01</ThemedText>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: sColor }]} />
                <ThemedText style={[styles.statusText, { color: sColor }]}>
                  {statusLabel(meeting.status)}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.heroDate}>
              {formatDate(meeting.created_at)} · {formatTime(meeting.created_at)}
            </ThemedText>

            <ThemedText style={styles.heroTitle} numberOfLines={5}>
              {meeting.title}
            </ThemedText>

            <View style={styles.heroAxis}>
              <View style={styles.heroAxisRule} />
              <View style={styles.heroAxisDot} />
            </View>

            <View style={styles.heroStats}>
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>DURACIÓN</ThemedText>
                <ThemedText style={styles.statValue}>{dur}</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>INSIGHTS</ThemedText>
                <ThemedText style={styles.statValue}>
                  {String(totalInsights).padStart(2, "0")}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <ThemedText style={styles.statLabel}>ETAPA</ThemedText>
                <ThemedText style={styles.statValueText} numberOfLines={1}>
                  {stageLabel ?? "Finalizada"}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* ——— ERROR ——— */}
          {meeting.error_message ? (
            <View style={styles.errorBox}>
              <View style={styles.errorRail} />
              <View style={styles.errorContent}>
                <ThemedText style={styles.errorEyebrow}>INCIDENCIA</ThemedText>
                <ThemedText style={styles.errorText}>{meeting.error_message}</ThemedText>
              </View>
            </View>
          ) : null}

          {/* ———————————————————————————————————— */}
          {/*  RESUMEN EJECUTIVO                    */}
          {/* ———————————————————————————————————— */}
          {summary ? (
            <View style={styles.editorialBlock}>
              <View style={styles.editorialRail} />
              <View style={styles.editorialContent}>
                <ThemedText style={styles.editorialEyebrow}>RESUMEN · EJECUTIVO</ThemedText>

                {summary.headline ? (
                  <ThemedText style={styles.editorialHeadline}>{summary.headline}</ThemedText>
                ) : null}

                <ThemedText style={styles.editorialBody}>{summary.executive_summary}</ThemedText>
              </View>
            </View>
          ) : null}

          {/* ———————————————————————————————————— */}
          {/*  INSIGHTS · secciones editoriales    */}
          {/* ———————————————————————————————————— */}
          {summary && insightSections.length > 0 ? (
            <View style={styles.insightsWrap}>
              <View style={styles.insightsHeader}>
                <ThemedText style={styles.insightsEyebrow}>
                  INSIGHTS · CAPTURADOS POR ALTER
                </ThemedText>
                <ThemedText style={styles.insightsCountBig}>
                  {String(totalInsights).padStart(2, "0")}
                </ThemedText>
              </View>

              <View style={styles.insightsRule} />

              <View style={styles.insightsList}>
                {insightSections.map((section, idx) => (
                  <MeetingSummarySection
                    key={section.key}
                    index={idx + 1}
                    icon={section.icon}
                    iconColor={section.iconColor}
                    title={section.title}
                    items={section.items}
                    emptyMessage={section.emptyMessage}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* ——— TRANSCRIPCIÓN ——— */}
          {meeting.transcript ? <MeetingTranscriptSection transcript={meeting.transcript} /> : null}

          {/* ——— METADATOS TÉCNICOS ——— */}
          <MeetingTechnicalDetails
            fileName={meeting.file_name}
            contentType={meeting.content_type}
            sizeBytes={meeting.size_bytes}
            recordedStartedAt={meeting.recorded_started_at}
            recordedFinishedAt={meeting.recorded_finished_at}
            processingStartedAt={meeting.processing_started_at}
            processingFinishedAt={meeting.processing_finished_at}
            processingRunId={meeting.processing_run_id}
            updatedAt={meeting.updated_at}
          />

          {/* ——— ZONA DE ARCHIVO ——— */}
          <View style={styles.archiveZone}>
            <View style={styles.archiveHeader}>
              <ThemedText style={styles.archiveEyebrow}>ZONA DE ARCHIVO</ThemedText>
              <View style={styles.archiveDash} />
            </View>
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.6}
              disabled={isDeleting}
              style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Eliminar reunión permanentemente"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={SemanticColors.error} />
              ) : (
                <Ionicons name="trash-outline" size={14} color={SemanticColors.error} />
              )}
              <ThemedText style={styles.deleteButtonText}>
                {isDeleting ? "ELIMINANDO" : "ELIMINAR REUNIÓN PERMANENTEMENTE"}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    paddingTop: Spacing.two,
  },

  /* ═══════════════════════════════════════════ */
  /*  HERO                                        */
  /* ═══════════════════════════════════════════ */
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
    fontSize: 34,
    lineHeight: 40,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.9,
    marginTop: 2,
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
  statValueText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
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
  errorText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },

  /* ═══════════════════════════════════════════ */
  /*  RESUMEN EJECUTIVO · bloco editorial         */
  /* ═══════════════════════════════════════════ */
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
  editorialHeadline: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  editorialBody: {
    fontFamily: Fonts.montserrat,
    fontSize: 15,
    lineHeight: 24,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.1,
    marginTop: 2,
  },

  /* ═══════════════════════════════════════════ */
  /*  INSIGHTS                                    */
  /* ═══════════════════════════════════════════ */
  insightsWrap: {
    gap: Spacing.three,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  insightsEyebrow: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
    paddingBottom: 4,
  },
  insightsCountBig: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 48,
    lineHeight: 50,
    color: SemanticColors.success,
    letterSpacing: -1.5,
    fontVariant: ["tabular-nums"],
  },
  insightsRule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  insightsList: {
    paddingTop: Spacing.two,
  },

  /* ═══════════════════════════════════════════ */
  /*  ZONA DE ARCHIVO                             */
  /* ═══════════════════════════════════════════ */
  archiveZone: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  archiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  archiveEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(255,68,68,0.5)",
    letterSpacing: 2.4,
  },
  archiveDash: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,68,68,0.12)",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.18)",
    borderStyle: Platform.select({ web: "dashed", default: "solid" }),
    borderRadius: 4,
    backgroundColor: "rgba(255,68,68,0.02)",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.error,
    letterSpacing: 2,
  },
});
