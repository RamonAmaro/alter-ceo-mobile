import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";

import { MeetingListItem, type MeetingItem } from "./meeting-list-item";
import { MeetingPlayerBar } from "./meeting-player-bar";

interface MeetingsPageProps {
  width: number;
}

const MOCK_MEETINGS: MeetingItem[] = [
  { id: "1", title: "Reunión comercial", date: "12/03/26", duration: "1:59:30" },
  { id: "2", title: "Reunión comercial", date: "12/03/26", duration: "1:59:30" },
  { id: "3", title: "Reunión comercial", date: "12/03/26", duration: "1:59:30" },
  { id: "4", title: "Reunión comercial", date: "12/03/26", duration: "1:59:30" },
];

export function MeetingsPage({ width }: MeetingsPageProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeMeeting = MOCK_MEETINGS.find((m) => m.id === activeId);

  const handlePlay = useCallback((id: string) => {
    setActiveId(id);
    setIsPlaying(true);
  }, []);

  const handleShare = useCallback((_id: string) => {}, []);
  const handleDownload = useCallback((_id: string) => {}, []);
  const handleFavorite = useCallback((_id: string) => {}, []);
  const handleDelete = useCallback((_id: string) => {}, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.listContainer}>
        <ThemedText
          type="bodySm"
          style={styles.sectionTitle}
        >
          TODAS TUS REUNIONES
        </ThemedText>

        <View style={styles.divider} />

        <FlatList
          data={MOCK_MEETINGS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeetingListItem
              item={item}
              onPlay={handlePlay}
              onShare={handleShare}
              onDownload={handleDownload}
              onFavorite={handleFavorite}
              onDelete={handleDelete}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {activeMeeting && (
        <MeetingPlayerBar
          title={activeMeeting.title}
          date={activeMeeting.date}
          duration={activeMeeting.duration}
          progress={0.4}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onShare={() => handleShare(activeMeeting.id)}
          onFavorite={() => handleFavorite(activeMeeting.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    height: 1,
    backgroundColor: "rgba(0, 255, 132, 0.2)",
    marginTop: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.three,
  },
});
