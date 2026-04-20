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
          <View style={styles.headerLeft}>
            <View style={styles.accentBar} />
            <ThemedText style={styles.sectionLabel}>TUS REUNIONES</ThemedText>
          </View>
          <View style={styles.countPill}>
            <ThemedText style={styles.countLabel}>{meetings.length}</ThemedText>
          </View>
        </View>

        {isLoading && meetings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color={SemanticColors.tealLight} />
          </View>
        ) : meetings.length === 0 ? (
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
              />
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
