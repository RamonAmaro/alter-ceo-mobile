import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function statusColor(status: string): string {
  if (status === "COMPLETED") return SemanticColors.success;
  if (status === "FAILED") return SemanticColors.error;
  return SemanticColors.warning;
}

function statusLabel(status: string): string {
  if (status === "COMPLETED") return "Completado";
  if (status === "FAILED") return "Error";
  if (status === "PROCESSING") return "Procesando";
  return status;
}

const HERO_GRADIENT: readonly [string, string, ...string[]] = [
  "rgba(0, 255, 132, 0.06)",
  "transparent",
];

export function MeetingDetailContent({ meetingId }: MeetingDetailContentProps) {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
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

  return (
    <View style={styles.root}>
      <ScreenHeader
        topInset={insets.top}
        icon="document-text"
        titlePrefix="Detalle"
        titleAccent={"Reuni\u00F3n"}
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
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <ThemedText type="headingLg" style={styles.title}>
              {meeting.title}
            </ThemedText>

            <View style={styles.metaRow}>
              <ThemedText type="caption" style={styles.meta}>
                {formatDate(meeting.created_at)}
              </ThemedText>
              <ThemedText type="caption" style={styles.metaSep}>
                {"\u00B7"}
              </ThemedText>
              <ThemedText type="caption" style={styles.meta}>
                {formatTime(meeting.created_at)}
              </ThemedText>
              {dur ? (
                <>
                  <ThemedText type="caption" style={styles.metaSep}>
                    {"\u00B7"}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.metaGreen}>
                    {dur}
                  </ThemedText>
                </>
              ) : null}
            </View>

            <View style={[styles.statusPill, { backgroundColor: `${sColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: sColor }]} />
              <ThemedText type="caption" style={[styles.statusLabel, { color: sColor }]}>
                {statusLabel(meeting.status)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.playerWrap}>
            <MeetingAudioPlayer
              audioUrl={meeting.audio_url}
              durationSeconds={meeting.duration_seconds}
            />
          </View>

          {summary ? (
            <>
              <LinearGradient colors={HERO_GRADIENT} style={styles.summaryCard}>
                <ThemedText type="caption" style={styles.eyebrow}>
                  RESUMEN EJECUTIVO
                </ThemedText>
                <ThemedText type="headingMd" style={styles.headline}>
                  {summary.headline}
                </ThemedText>
                <ThemedText type="bodyMd" style={styles.summaryBody}>
                  {summary.executive_summary}
                </ThemedText>
              </LinearGradient>

              <View style={styles.grid}>
                <MeetingSummarySection
                  icon="checkmark-circle-outline"
                  iconColor={SemanticColors.success}
                  title="Decisiones"
                  items={summary.decisions ?? []}
                  emptyMessage={"Sin decisiones extra\u00EDdas"}
                />
                <MeetingSummarySection
                  icon="warning-outline"
                  iconColor={SemanticColors.warning}
                  title="Bloqueos"
                  items={summary.blockers ?? []}
                  emptyMessage={"Sin bloqueos extra\u00EDdos"}
                />
                <MeetingSummarySection
                  icon="arrow-forward-circle-outline"
                  iconColor={SemanticColors.info}
                  title={"Pr\u00F3ximos pasos"}
                  items={summary.next_steps ?? []}
                  emptyMessage="Sin siguientes pasos"
                />
                <MeetingSummarySection
                  icon="pulse-outline"
                  iconColor={SemanticColors.accent}
                  title={"Se\u00F1ales Business Kernel"}
                  items={summary.business_kernel_signals ?? []}
                  emptyMessage={"Sin se\u00F1ales extra\u00EDdas"}
                />
              </View>
            </>
          ) : null}

          {meeting.transcript ? (
            <View style={styles.section}>
              <MeetingTranscriptSection transcript={meeting.transcript} />
            </View>
          ) : null}

          {meeting.error_message ? (
            <View style={[styles.section, styles.errorBox]}>
              <Ionicons name="alert-circle" size={16} color={SemanticColors.error} />
              <ThemedText type="bodySm" style={styles.errorText}>
                {meeting.error_message}
              </ThemedText>
            </View>
          ) : null}
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

  heroSection: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    color: SemanticColors.textMuted,
    fontSize: 12,
  },
  metaSep: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
  },
  metaGreen: {
    color: SemanticColors.success,
    fontSize: 12,
    fontFamily: Fonts.montserratMedium,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: Fonts.montserratSemiBold,
  },

  playerWrap: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },

  summaryCard: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
    overflow: "hidden",
  },
  eyebrow: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratBold,
    letterSpacing: 1,
    fontSize: 10,
    textTransform: "uppercase",
  },
  headline: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  summaryBody: {
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },

  grid: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },

  section: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: SemanticColors.errorMuted,
    borderRadius: 14,
    padding: Spacing.three,
  },
  errorText: {
    color: SemanticColors.error,
    flex: 1,
  },
});
