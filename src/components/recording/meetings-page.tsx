import { useCallback, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatDuration } from "@/utils/format-duration";

import { MeetingListItem, type MeetingItem } from "./meeting-list-item";

interface MeetingsPageProps {
  width: number;
  height: number;
  playerBarHeight: number;
  activeId: string | null;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MeetingsPage({
  width,
  height,
  playerBarHeight,
  activeId,
  isPlaying,
  onPlay,
  onDelete,
}: MeetingsPageProps) {
  const insets = useSafeAreaInsets();
  const { recordings, loadRecordings } = useRecordingsStore();

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const handleShare = useCallback((_id: string) => {}, []);
  const handleDownload = useCallback((_id: string) => {}, []);
  const handleFavorite = useCallback((_id: string) => {}, []);

  const meetingItems: MeetingItem[] = recordings.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    duration: formatDuration(r.durationMs),
  }));

  return (
    <View style={{ width, height }}>
      <View style={styles.listContainer}>
        <ThemedText type="bodySm" style={styles.sectionTitle}>
          TODAS TUS REUNIONES
        </ThemedText>

        <View style={styles.divider} />

        {recordings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="bodyMd" style={styles.emptyText}>
              No hay reuniones guardadas
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={meetingItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MeetingListItem
                item={item}
                isActive={item.id === activeId}
                isPlaying={item.id === activeId && isPlaying}
                onPlay={onPlay}
                onShare={handleShare}
                onDownload={handleDownload}
                onFavorite={handleFavorite}
                onDelete={onDelete}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: playerBarHeight || insets.bottom + Spacing.three },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  sectionTitle: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  divider: {
    height: 2,
    backgroundColor: "#43BCB8",
    marginTop: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.three,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing.six,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
