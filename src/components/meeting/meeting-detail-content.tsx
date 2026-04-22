import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useMeetingStore } from "@/stores/meeting-store";
import { formatDurationSeconds } from "@/utils/format-date";
import { goBackOrHome } from "@/utils/navigation";

import { MeetingActionItemsSection } from "./meeting-action-items-section";
import { MeetingSummarySection } from "./meeting-summary-section";
import { MeetingTranscriptSection } from "./meeting-transcript-section";

interface MeetingDetailContentProps {
  meetingId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
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
      return "ACTUALIZANDO INSIGHTS";
    case "uploaded":
      return "ARCHIVO SUBIDO";
    case "completed":
      return "PROCESAMIENTO COMPLETO";
    case "failed":
      return "FALLO EN PROCESO";
    case "pending_upload":
      return "PENDIENTE DE SUBIDA";
    default:
      return null;
  }
}

export function MeetingDetailContent({ meetingId }: MeetingDetailContentProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const meeting = useMeetingStore((s) => s.activeMeeting);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const getMeetingDetails = useMeetingStore((s) => s.getMeetingDetails);
  const updateMeetingTitleLocally = useMeetingStore((s) => s.updateMeetingTitleLocally);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (meetingId) {
      getMeetingDetails(meetingId);
    }
  }, [meetingId, getMeetingDetails]);

  const summary = meeting?.summary;
  const dur = formatDurationSeconds(meeting?.duration_seconds);
  const sColor = meeting ? statusColor(meeting.status) : SemanticColors.textMuted;
  const stageLabel = meeting ? processingStageLabel(meeting.processing_stage) : null;

  function handleStartEditTitle(): void {
    if (!meeting) return;
    setEditedTitle(meeting.title);
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleCancelEditTitle(): void {
    setIsEditingTitle(false);
    setEditedTitle("");
  }

  function handleConfirmEditTitle(): void {
    const trimmed = editedTitle.trim();
    if (!trimmed || !meeting || trimmed === meeting.title) {
      handleCancelEditTitle();
      return;
    }
    updateMeetingTitleLocally(meeting.meeting_id, trimmed);
    handleCancelEditTitle();
  }

  const topics = summary?.topics ?? [];
  const blockers = summary?.blockers ?? [];
  const decisions = summary?.decisions ?? [];
  const actionItems = summary?.action_items ?? [];

  const totalInsights = topics.length + blockers.length + decisions.length;

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
          {/* ——— TITLE / DATE / DURATION ——— */}
          <View style={styles.headerCard}>
            <View style={styles.titleRow}>
              {isEditingTitle ? (
                <TextInput
                  ref={inputRef}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  style={styles.titleInput}
                  onSubmitEditing={handleConfirmEditTitle}
                  placeholderTextColor={SemanticColors.textPlaceholder}
                  returnKeyType="done"
                  autoCorrect={false}
                />
              ) : (
                <ThemedText style={styles.title} numberOfLines={3}>
                  {meeting.title}
                </ThemedText>
              )}
              {isEditingTitle ? (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={handleCancelEditTitle}
                    style={[styles.editBtn, styles.editBtnCancel]}
                    activeOpacity={0.7}
                    accessibilityLabel="Cancelar edición"
                  >
                    <Ionicons name="close" size={18} color={SemanticColors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmEditTitle}
                    style={styles.editBtn}
                    activeOpacity={0.7}
                    accessibilityLabel="Guardar título"
                  >
                    <Ionicons name="checkmark" size={18} color={SemanticColors.success} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleStartEditTitle}
                  style={styles.editBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Editar título"
                >
                  <Ionicons name="create-outline" size={18} color={SemanticColors.success} />
                </TouchableOpacity>
              )}
            </View>

            <ThemedText style={styles.date}>{formatDate(meeting.created_at)}</ThemedText>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={SemanticColors.textMuted} />
                <ThemedText style={styles.metaText}>{dur}</ThemedText>
              </View>

              <View style={styles.metaDot} />

              <View style={[styles.statusFlag, { backgroundColor: `${sColor}15`, borderColor: `${sColor}44` }]}>
                <View style={[styles.statusFlagDot, { backgroundColor: sColor }]} />
                <ThemedText style={[styles.statusFlagLabel, { color: sColor }]}>
                  {statusLabel(meeting.status)}
                </ThemedText>
              </View>

              {stageLabel && meeting.status !== "COMPLETED" ? (
                <>
                  <View style={styles.metaDot} />
                  <ThemedText style={[styles.stageText, { color: sColor }]} numberOfLines={1}>
                    {stageLabel}
                  </ThemedText>
                </>
              ) : null}
            </View>
          </View>

          {/* ——— RESUMEN EJECUTIVO ——— */}
          {summary ? (
            <View style={styles.summaryBlock}>
              <View style={styles.summaryEyebrowRow}>
                <View style={styles.summaryEyebrowBar} />
                <ThemedText style={styles.summaryEyebrow}>RESUMEN · EJECUTIVO</ThemedText>
              </View>

              {summary.headline ? (
                <ThemedText style={styles.summaryHeadline}>{summary.headline}</ThemedText>
              ) : null}

              <ThemedText style={styles.summaryBody}>{summary.executive_summary}</ThemedText>
            </View>
          ) : null}

          {/* ——— INSIGHTS ——— */}
          {summary ? (
            <View style={styles.insightsBlock}>
              <View style={styles.insightsHeader}>
                <ThemedText style={styles.insightsCount}>
                  {String(totalInsights).padStart(2, "0")}
                </ThemedText>
                <View style={styles.insightsLabelBlock}>
                  <ThemedText style={styles.insightsLabel}>INSIGHTS</ThemedText>
                  <ThemedText style={styles.insightsSub}>DETECTADOS · POR ALTER</ThemedText>
                </View>
              </View>

              <View style={styles.sectionsList}>
                <MeetingSummarySection
                  icon="list"
                  iconColor={SemanticColors.teal}
                  title="Temas tratados"
                  items={topics}
                  emptyMessage="Sin temas identificados"
                />
                <MeetingSummarySection
                  icon="warning"
                  iconColor={SemanticColors.warning}
                  title="Bloqueos"
                  items={blockers}
                  emptyMessage="Sin bloqueos detectados"
                />
                <MeetingSummarySection
                  icon="checkmark-circle"
                  iconColor={SemanticColors.success}
                  title="Decisiones"
                  items={decisions}
                  emptyMessage="Sin decisiones extraídas"
                />
              </View>
            </View>
          ) : null}

          {/* ——— PUNTOS DE ACCIÓN ——— */}
          {summary ? <MeetingActionItemsSection items={actionItems} /> : null}

          {/* ——— TRANSCRIPCIÓN ——— */}
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

const headerShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
  },
  android: { elevation: 8 },
  web: { boxShadow: "0 10px 28px rgba(0,0,0,0.3)" },
});

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

  /* ——— Header card (title + date + duration) ——— */
  headerCard: {
    padding: Spacing.four,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.two,
    ...headerShadow,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 26,
    lineHeight: 32,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  titleInput: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 26,
    lineHeight: 32,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    outlineStyle: "none" as never,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.24)",
  },
  editBtnCancel: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  editActions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  date: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
    fontVariant: ["tabular-nums"],
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    letterSpacing: 1.5,
  },
  stageText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
  },

  /* ——— Resumen Ejecutivo ——— */
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
    fontSize: 20,
    lineHeight: 28,
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

  /* ——— Insights ——— */
  insightsBlock: {
    gap: Spacing.three,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  insightsCount: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 40,
    lineHeight: 42,
    color: SemanticColors.success,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  insightsLabelBlock: {
    gap: 2,
  },
  insightsLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    letterSpacing: 2.4,
  },
  insightsSub: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.8,
  },
  sectionsList: {
    gap: Spacing.two,
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
