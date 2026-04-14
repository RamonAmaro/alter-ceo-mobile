import { useCallback, useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";
import type { MeetingSummaryResponse } from "@/types/meeting";

import { MeetingListItem, type MeetingItem } from "./meeting-list-item";

interface MeetingsPageProps {
  width: number;
  height: number;
}

function toUploadStatus(status: string): "processing" | "completed" | "failed" | undefined {
  if (status === "COMPLETED") return "completed";
  if (status === "FAILED" || status === "PENDING_UPLOAD") return "failed";
  if (status === "PROCESSING" || status === "UPLOADED") return "processing";
  return undefined;
}

function toMeetingItem(m: MeetingSummaryResponse): MeetingItem {
  const durationSec = m.duration_seconds ?? 0;
  const mins = Math.floor(durationSec / 60);
  const secs = Math.floor(durationSec % 60);
  const duration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const d = new Date(m.updated_at);
  const dateStr = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  return {
    id: m.meeting_id,
    title: m.title,
    date: dateStr,
    duration,
    meetingId: m.meeting_id,
    uploadStatus: toUploadStatus(m.status),
  };
}

export function MeetingsPage({ width, height }: MeetingsPageProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.userId);
  const meetings = useMeetingStore((s) => s.meetings);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const fetchMeetings = useMeetingStore((s) => s.fetchMeetings);

  useEffect(() => {
    if (userId) {
      fetchMeetings(userId);
    }
  }, [userId, fetchMeetings]);

  const handlePress = useCallback(
    (id: string) => {
      router.push({
        pathname: "/(app)/meeting-detail",
        params: { meetingId: id },
      });
    },
    [router],
  );

  const handleDelete = useCallback((_id: string) => {}, []);

  const meetingItems: MeetingItem[] = meetings.map(toMeetingItem);

  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            TUS REUNIONES
          </ThemedText>
          <ThemedText type="caption" style={styles.countLabel}>
            {meetings.length}
          </ThemedText>
        </View>

        {isLoading && meetings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color={SemanticColors.tealLight} />
          </View>
        ) : meetings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mic-off-outline" size={32} color="rgba(255,255,255,0.15)" />
            <ThemedText type="bodySm" style={styles.emptyText}>
              No hay reuniones guardadas
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={meetingItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MeetingListItem item={item} onPress={handlePress} onDelete={handleDelete} />
            )}
            showsVerticalScrollIndicator={false}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    color: SemanticColors.textMuted,
    fontFamily: Fonts.montserratBold,
    letterSpacing: 1,
    fontSize: 11,
  },
  countLabel: {
    color: SemanticColors.textDisabled,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
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
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
  },
});
