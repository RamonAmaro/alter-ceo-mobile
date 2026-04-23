import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import * as meetingService from "@/services/meeting-service";
import { useMeetingStore } from "@/stores/meeting-store";
import { createPoller } from "@/utils/create-poller";
import { formatDurationSeconds } from "@/utils/format-date";
import { goBackOrHome } from "@/utils/navigation";

import { MeetingAlertsSection } from "./meeting-alerts-section";
import { MeetingEntitiesSection } from "./meeting-entities-section";
import { MeetingSummarySection } from "./meeting-summary-section";
import { MeetingTechnicalDetails } from "./meeting-technical-details";
import { MeetingTranscriptSection } from "./meeting-transcript-section";

const STATUS_POLL_INTERVAL_MS = 5000;
const STATUS_POLL_MAX_ATTEMPTS = 40;

function isMeetingInProgress(status: string | undefined | null): boolean {
  return status === "PROCESSING" || status === "UPLOADED" || status === "PENDING_UPLOAD";
}

function isSourceInProgress(status: string | undefined | null): boolean {
  return status === "processing" || status === "pending";
}

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

function sourceStatusLabel(status: string | null | undefined): string {
  if (status === "ready") return "Análisis profundo listo";
  if (status === "processing") return "Analizando…";
  if (status === "pending") return "En cola de análisis";
  if (status === "failed") return "Análisis fallido";
  return "Sin análisis";
}

function sourceStatusColor(status: string | null | undefined): string {
  if (status === "ready") return SemanticColors.success;
  if (status === "failed") return SemanticColors.error;
  if (status === "processing" || status === "pending") return SemanticColors.warning;
  return SemanticColors.textMuted;
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
  const activeSource = useMeetingStore((s) => s.activeSource);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const isSourceLoading = useMeetingStore((s) => s.isSourceLoading);
  const getMeetingDetails = useMeetingStore((s) => s.getMeetingDetails);
  const fetchSourceDetail = useMeetingStore((s) => s.fetchSourceDetail);
  const renameMeeting = useMeetingStore((s) => s.renameMeeting);
  const deleteMeeting = useMeetingStore((s) => s.deleteMeeting);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (meetingId) {
      getMeetingDetails(meetingId);
    }
  }, [meetingId, getMeetingDetails]);

  const sourceId = meeting?.source?.source_id ?? null;
  const sourceStatus = meeting?.source?.status ?? null;

  useEffect(() => {
    if (!sourceId || sourceStatus !== "ready") return;
    if (activeSource?.source_id === sourceId) return;
    fetchSourceDetail(sourceId);
  }, [sourceId, sourceStatus, activeSource?.source_id, fetchSourceDetail]);

  const meetingStatus = meeting?.status ?? null;
  const shouldPoll =
    !!meeting && (isMeetingInProgress(meetingStatus) || isSourceInProgress(sourceStatus));
  const pollTargetId = shouldPoll ? (meeting?.meeting_id ?? null) : null;

  useEffect(() => {
    if (!pollTargetId) return;

    let attempts = 0;
    const poller = createPoller({
      fn: () => meetingService.getMeeting(pollTargetId),
      interval: STATUS_POLL_INTERVAL_MS,
      shouldStop: (next) => {
        attempts += 1;
        const meetingDone = !isMeetingInProgress(next.status);
        const sourceDone = !isSourceInProgress(next.source?.status ?? null);
        if (meetingDone && sourceDone) return true;
        return attempts >= STATUS_POLL_MAX_ATTEMPTS;
      },
      onUpdate: (next) => {
        useMeetingStore.setState({ activeMeeting: next });
      },
      onError: () => {
        // silent; UI already reflects the processing state
      },
    });

    poller.start();
    return () => poller.stop();
  }, [pollTargetId]);

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

  const entities = activeSource?.entities ?? [];
  const alerts = activeSource?.insights ?? [];
  const hasSourceData = sourceStatus === "ready" && (entities.length > 0 || alerts.length > 0);

  function handleStartEditTitle(): void {
    if (!meeting) return;
    setEditedTitle(meeting.title);
    setTitleError(null);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  }

  function handleCancelEditTitle(): void {
    setIsEditingTitle(false);
    setEditedTitle("");
    setTitleError(null);
  }

  async function handleConfirmEditTitle(): Promise<void> {
    if (!meeting || isSavingTitle) return;
    const trimmed = editedTitle.trim();
    if (!trimmed || trimmed === meeting.title) {
      handleCancelEditTitle();
      return;
    }
    setIsSavingTitle(true);
    setTitleError(null);
    try {
      await renameMeeting(meeting.meeting_id, trimmed);
      setIsEditingTitle(false);
      setEditedTitle("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el título.";
      setTitleError(message);
    } finally {
      setIsSavingTitle(false);
    }
  }

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
          {/*  HERO                                 */}
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

            {isEditingTitle ? (
              <View style={styles.titleEditColumn}>
                <View style={styles.titleEditWrap}>
                  <TextInput
                    ref={titleInputRef}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    style={styles.titleInput}
                    onSubmitEditing={handleConfirmEditTitle}
                    placeholderTextColor={SemanticColors.textPlaceholder}
                    returnKeyType="done"
                    autoCorrect={false}
                    multiline
                    editable={!isSavingTitle}
                    maxLength={300}
                  />
                  <View style={styles.titleEditActions}>
                    <TouchableOpacity
                      onPress={handleCancelEditTitle}
                      style={[styles.titleEditBtn, styles.titleEditBtnGhost]}
                      activeOpacity={0.6}
                      disabled={isSavingTitle}
                      accessibilityLabel="Cancelar edición"
                    >
                      <Ionicons name="close" size={16} color={SemanticColors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleConfirmEditTitle}
                      style={styles.titleEditBtn}
                      activeOpacity={0.6}
                      disabled={isSavingTitle}
                      accessibilityLabel="Guardar título"
                    >
                      {isSavingTitle ? (
                        <ActivityIndicator size="small" color={SemanticColors.success} />
                      ) : (
                        <Ionicons name="checkmark" size={16} color={SemanticColors.success} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {titleError ? (
                  <ThemedText style={styles.titleEditError}>{titleError}</ThemedText>
                ) : null}
              </View>
            ) : (
              <View style={styles.titleRow}>
                <ThemedText style={styles.heroTitle} numberOfLines={5}>
                  {meeting.title}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleStartEditTitle}
                  style={styles.titleEditTrigger}
                  activeOpacity={0.6}
                  hitSlop={8}
                  accessibilityLabel="Editar título"
                >
                  <Ionicons name="create-outline" size={16} color={SemanticColors.textMuted} />
                </TouchableOpacity>
              </View>
            )}

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

            {meeting.source ? (
              <View style={styles.sourceIndicator}>
                {isSourceLoading && sourceStatus === "ready" ? (
                  <ActivityIndicator size="small" color={SemanticColors.tealLight} />
                ) : (
                  <View
                    style={[styles.sourceDot, { backgroundColor: sourceStatusColor(sourceStatus) }]}
                  />
                )}
                <ThemedText style={styles.sourceText}>
                  {isSourceLoading && sourceStatus === "ready"
                    ? "Cargando análisis…"
                    : sourceStatusLabel(sourceStatus)}
                </ThemedText>
                {alerts.length > 0 ? (
                  <ThemedText style={styles.sourceBadge}>
                    {String(alerts.length).padStart(2, "0")} ALERTAS
                  </ThemedText>
                ) : null}
              </View>
            ) : null}
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

          {/* ——— RESUMEN EJECUTIVO ——— */}
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

          {/* ——— INSIGHTS ——— */}
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

          {/* ——— ALERTAS DEL AGENTE (source insights) ——— */}
          {hasSourceData && alerts.length > 0 ? <MeetingAlertsSection insights={alerts} /> : null}

          {/* ——— ENTIDADES DETECTADAS ——— */}
          {hasSourceData && entities.length > 0 ? (
            <MeetingEntitiesSection entities={entities} />
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  heroTitle: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 34,
    lineHeight: 40,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.9,
    marginTop: 2,
  },
  titleEditTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  titleEditColumn: {
    gap: Spacing.one,
    marginTop: 2,
  },
  titleEditWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  titleEditError: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.error,
    letterSpacing: 0.1,
  },
  titleInput: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 30,
    lineHeight: 36,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.7,
    borderBottomWidth: 2,
    borderBottomColor: SemanticColors.success,
    paddingBottom: 4,
    paddingHorizontal: 0,
    paddingTop: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as never } : {}),
  },
  titleEditActions: {
    flexDirection: "row",
    gap: 4,
    paddingTop: 4,
  },
  titleEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
  },
  titleEditBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
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
  sourceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  sourceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  sourceText: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.3,
  },
  sourceBadge: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.error,
    letterSpacing: 1.6,
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
  /*  RESUMEN EJECUTIVO                           */
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
