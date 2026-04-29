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
import * as meetingService from "@/services/meeting-service";
import { useMeetingStore } from "@/stores/meeting-store";
import { createPoller } from "@/utils/create-poller";
import { formatDurationSeconds } from "@/utils/format-date";
import { goBackOrHome } from "@/utils/navigation";

import { MeetingActionPointsSection } from "./meeting-action-points-section";
import { MeetingEntitiesSection } from "./meeting-entities-section";
import { MeetingSummarySection } from "./meeting-summary-section";
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

// The backend's meeting summary occasionally repeats the headline as the
// first line (or first sentence) of summary_text. When that happens we hide
// the headline to avoid showing the same phrase twice. Comparison is
// accent/case/punctuation-insensitive so cosmetic differences don't fool us.
function normaliseForCompare(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isHeadlineRedundant(headline: string, summaryText: string): boolean {
  const h = normaliseForCompare(headline);
  if (!h) return true;
  const s = normaliseForCompare(summaryText);
  if (!s) return false;
  if (s.startsWith(h)) return true;
  const firstSentence = s.split(/[.!?]/, 1)[0]?.trim() ?? "";
  return firstSentence === h;
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
  const meeting = useMeetingStore((s) => s.activeMeeting);
  const activeSource = useMeetingStore((s) => s.activeSource);
  const isLoading = useMeetingStore((s) => s.isLoading);
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

  // Resumen ejecutivo and Temas tratados now live in the linked source —
  // both meetings and PDFs are sourced through v1/source/{id}, so this
  // matches what the document detail screen renders.
  const summaries = activeSource?.summaries ?? [];
  const sourceSummary = summaries.find((s) => s.summary_type === "meeting") ?? summaries[0];
  const executiveSummaryText = sourceSummary?.summary_text ?? "";
  const topics = sourceSummary?.topics ?? [];

  const headline = summary?.headline ?? "";
  const showHeadline = !!headline && !isHeadlineRedundant(headline, executiveSummaryText);

  // PDF order: Temas tratados → Bloqueos → Decisiones → Puntos de acción.
  // The first three are simple lists; "Puntos de acción" gets the richer
  // Responsables / Fecha límite layout (same as source-detail).
  const flatInsightSections: InsightSection[] = summary
    ? [
        {
          key: "topics",
          icon: "list-outline",
          iconColor: SemanticColors.tealLight,
          title: "Temas tratados",
          items: topics,
          emptyMessage: "Sin especificar",
        },
        {
          key: "blockers",
          icon: "warning-outline",
          iconColor: SemanticColors.warning,
          title: "Bloqueos",
          items: blockers,
          emptyMessage: "Sin especificar",
        },
        {
          key: "decisions",
          icon: "checkmark-circle-outline",
          iconColor: SemanticColors.success,
          title: "Decisiones",
          items: decisions,
          emptyMessage: "Sin especificar",
        },
      ]
    : [];

  const totalInsights = decisions.length + blockers.length + nextSteps.length + topics.length;

  const entities = activeSource?.entities ?? [];
  const hasSourceData = sourceStatus === "ready" && entities.length > 0;

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
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          {/* ———————————————————————————————————— */}
          {/*  HERO                                 */}
          {/* ———————————————————————————————————— */}
          <View style={styles.hero}>
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
                    underlineColorAndroid="transparent"
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

            {/* Hero hierarchy (CEO spec): Título grande → Duración pequeña →
                Fecha un poco más grande. Status pill sits as a discreet badge
                above so the title remains the protagonist. */}
            <View style={styles.heroStatusRow}>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: sColor }]} />
                <ThemedText style={[styles.statusText, { color: sColor }]}>
                  {statusLabel(meeting.status)}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.heroDuration}>{dur}</ThemedText>

            <ThemedText style={styles.heroDate} numberOfLines={1}>
              {formatDate(meeting.created_at)} · {formatTime(meeting.created_at)}
            </ThemedText>

            {stageLabel ? (
              <ThemedText style={styles.heroStage} numberOfLines={1}>
                {stageLabel}
              </ThemedText>
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
          {executiveSummaryText || showHeadline ? (
            <View style={styles.editorialBlock}>
              <ThemedText style={styles.sectionTitle}>Resumen ejecutivo</ThemedText>
              <View style={styles.sectionTitleRule} />
              {showHeadline ? (
                <ThemedText style={styles.editorialHeadline}>{headline}</ThemedText>
              ) : null}
              {executiveSummaryText ? (
                <ThemedText style={styles.editorialBody}>{executiveSummaryText}</ThemedText>
              ) : null}
            </View>
          ) : null}

          {/* ——— INSIGHTS ——— */}
          {summary ? (
            <View style={styles.insightsWrap}>
              <View style={styles.insightsHeader}>
                <ThemedText style={styles.sectionTitle}>Insights</ThemedText>
                <ThemedText style={styles.insightsCountBig}>
                  {String(totalInsights).padStart(2, "0")}
                </ThemedText>
              </View>

              <View style={styles.sectionTitleRule} />

              <View style={styles.insightsList}>
                {flatInsightSections.map((section, idx) => (
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

                {/* 04 — Puntos de acción con Responsables / Fecha límite */}
                <MeetingActionPointsSection index={4} items={nextSteps} />
              </View>
            </View>
          ) : null}

          {/* ——— ENTIDADES DETECTADAS ——— */}
          {hasSourceData && entities.length > 0 ? (
            <MeetingEntitiesSection entities={entities} />
          ) : null}

          {/* ——— TRANSCRIPCIÓN ——— */}
          {meeting.transcript ? <MeetingTranscriptSection transcript={meeting.transcript} /> : null}

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
    gap: Spacing.two,
  },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  heroStage: {
    fontFamily: Fonts.montserratMedium,
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 16,
    color: SemanticColors.textDisabled,
    letterSpacing: 0.2,
    marginTop: 4,
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
  heroDuration: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textMuted,
    letterSpacing: 1.2,
    marginTop: Spacing.one,
  },
  heroDate: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  heroTitle: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 30,
    lineHeight: 36,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.8,
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
  editorialHeadline: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.1,
    marginBottom: Spacing.two,
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
