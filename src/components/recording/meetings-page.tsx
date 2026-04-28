import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useUploadRecording } from "@/hooks/use-upload-recording";
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { type LocalRecording, useRecordingsStore } from "@/stores/recordings-store";
import type { MeetingSummaryResponse } from "@/types/meeting";
import { formatDurationSeconds } from "@/utils/format-date";

import { MeetingListItem, type MeetingItem } from "./meeting-list-item";

interface MeetingsPageProps {
  width: number;
  height: number;
}

function toUploadStatus(status: string): "processing" | "completed" | "failed" | undefined {
  if (status === "COMPLETED") return "completed";
  if (status === "FAILED") return "failed";
  if (status === "PROCESSING" || status === "UPLOADED" || status === "PENDING_UPLOAD") {
    return "processing";
  }
  return undefined;
}

function toMeetingItem(
  m: MeetingSummaryResponse,
  localByMeetingId: Map<string, LocalRecording>,
): MeetingItem {
  const duration = formatDurationSeconds(m.duration_seconds ?? 0);
  const d = new Date(m.created_at ?? m.updated_at);
  const dateStr = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const local = localByMeetingId.get(m.meeting_id);

  return {
    id: m.meeting_id,
    title: m.title,
    date: dateStr,
    duration,
    meetingId: m.meeting_id,
    uploadStatus: toUploadStatus(m.status),
    errorMessage: m.error_message ?? local?.errorMessage,
  };
}

function toLocalOnlyItem(rec: LocalRecording): MeetingItem {
  return {
    id: rec.id,
    title: rec.title,
    date: rec.date,
    duration: formatDurationSeconds(rec.durationMs / 1000),
    meetingId: rec.meetingId,
    uploadStatus: rec.uploadStatus,
    errorMessage: rec.errorMessage,
  };
}

export function MeetingsPage({ width, height }: MeetingsPageProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.userId);
  const meetings = useMeetingStore((s) => s.meetings);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const fetchMeetings = useMeetingStore((s) => s.fetchMeetings);
  const renameMeeting = useMeetingStore((s) => s.renameMeeting);
  const localRecordings = useRecordingsStore((s) => s.recordings);
  const loadRecordings = useRecordingsStore((s) => s.loadRecordings);
  const { uploadRecording } = useUploadRecording();
  const [retryingRecordingId, setRetryingRecordingId] = useState<string | null>(null);
  const retryingRecordingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchMeetings(userId);
      loadRecordings(userId);
    }
  }, [userId, fetchMeetings, loadRecordings]);

  const handlePress = useCallback(
    (id: string) => {
      const backendMeetings = useMeetingStore.getState().meetings;
      const isBackendMeeting = backendMeetings.some((m) => m.meeting_id === id);
      if (!isBackendMeeting) return;
      router.push({
        pathname: "/(app)/meeting-detail",
        params: { meetingId: id },
      });
    },
    [router],
  );

  const handleDelete = useCallback((_id: string) => {}, []);

  const handleRename = useCallback(
    async (id: string, newTitle: string) => {
      await renameMeeting(id, newTitle);
    },
    [renameMeeting],
  );

  const handleRetry = useCallback(
    async (id: string) => {
      if (retryingRecordingIdRef.current) return;

      const rec = useRecordingsStore.getState().recordings.find((r) => r.id === id);
      if (!rec) return;

      retryingRecordingIdRef.current = id;
      setRetryingRecordingId(id);
      try {
        await uploadRecording({
          recordingId: rec.id,
          uri: rec.uri,
          title: rec.title,
          durationMs: rec.durationMs,
        });
      } finally {
        retryingRecordingIdRef.current = null;
        setRetryingRecordingId(null);
      }
    },
    [uploadRecording],
  );

  // A local recording with uploadStatus="uploading" but no meetingId yet is a
  // transient state — the backend meeting already exists (createMeeting returns
  // synchronously inside startMeetingUpload), but the hook only patches the
  // meetingId back after S3 + completeUpload finish. Treat these as already
  // represented by the backend list to avoid a visual duplicate in that window.
  const localByMeetingId = new Map<string, LocalRecording>();
  const localOnly: LocalRecording[] = [];
  for (const rec of localRecordings) {
    if (rec.meetingId) {
      localByMeetingId.set(rec.meetingId, rec);
    } else if (rec.uploadStatus !== "uploading" && rec.uploadStatus !== "processing") {
      localOnly.push(rec);
    }
  }

  const meetingItems: MeetingItem[] = [
    ...localOnly.map(toLocalOnlyItem),
    ...meetings.map((m) => toMeetingItem(m, localByMeetingId)),
  ];

  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.accentBar} />
            <ThemedText style={styles.sectionLabel}>TUS REUNIONES</ThemedText>
          </View>
          <View style={styles.countPill}>
            <ThemedText style={styles.countLabel}>{meetingItems.length}</ThemedText>
          </View>
        </View>

        {isLoading && meetingItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color={SemanticColors.tealLight} />
          </View>
        ) : meetingItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mic-off-outline" size={28} color="rgba(255,255,255,0.2)" />
            </View>
            <ThemedText style={styles.emptyTitle}>No hay reuniones</ThemedText>
            <ThemedText style={styles.emptyText}>
              Tus grabaciones aparecerán aquí cuando las realices
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={meetingItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MeetingListItem
                item={item}
                index={index}
                onPress={handlePress}
                onDelete={handleDelete}
                onRetry={handleRetry}
                onRename={handleRename}
                retrying={retryingRecordingId === item.id}
              />
            )}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + Spacing.four },
            ]}
            ItemSeparatorComponent={Separator}
          />
        )}
      </View>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  page: {
    overflow: "hidden",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accentBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  sectionLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  countPill: {
    minWidth: 28,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
  },
  countLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 13,
    color: SemanticColors.success,
  },
  separator: {
    height: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.three,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.six,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
  emptyText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
});
