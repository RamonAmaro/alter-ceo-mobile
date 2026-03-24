import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatDuration } from "@/utils/format-duration";

import { MeetingPlayerBar } from "./meeting-player-bar";
import { MeetingsPage } from "./meetings-page";
import { RecordingMotto } from "./recording-motto";
import { RecordingPage } from "./recording-page";

const PAGES = ["recording", "meetings"] as const;

export function RecordingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);

  const { recordings } = useRecordingsStore();
  const { activeId, setActiveId } = useActiveRecordingStore();
  const activeRecording = recordings.find((r) => r.id === activeId) ?? null;

  const player = useAudioPlayer(activeRecording?.uri ?? null, {
    updateInterval: 0.1,
  });
  const status = useAudioPlayerStatus(player);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    if (pendingPlayRef.current && status.isLoaded) {
      pendingPlayRef.current = false;
      player.play();
    }
  }, [status.isLoaded, player]);

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const handlePlay = useCallback(
    (id: string) => {
      if (id === activeId) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      pendingPlayRef.current = true;
      setActiveId(id);
    },
    [activeId, status.playing, player, setActiveId],
  );

  const handleTogglePlay = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else if (status.duration > 0 && status.currentTime >= status.duration) {
      player.seekTo(0);
      player.play();
    } else {
      player.play();
    }
  }, [status.playing, status.currentTime, status.duration, player]);

  const handleSeek = useCallback(
    (pct: number) => {
      if (status.duration > 0) {
        player.seekTo(pct * status.duration);
      }
    },
    [player, status.duration],
  );

  const handlePlayerDelete = useCallback(
    (id: string) => {
      if (activeId === id) {
        player.pause();
        setActiveId(null);
      }
    },
    [activeId, player, setActiveId],
  );

  const handleShare = useCallback(() => {}, []);
  const handleFavorite = useCallback(() => {}, []);
  const handleClose = useCallback(() => {
    player.pause();
    setActiveId(null);
  }, [player, setActiveId]);

  const [playerBarHeight, setPlayerBarHeight] = useState(0);
  const progress =
    status.duration > 0 ? status.currentTime / status.duration : 0;
  const showPlayer = activeIndex === 1 && !!activeRecording;

  useEffect(() => {
    if (!activeRecording) setPlayerBarHeight(0);
  }, [activeRecording]);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const onCarouselLayout = useCallback((e: LayoutChangeEvent) => {
    setCarouselHeight(e.nativeEvent.layout.height);
  }, []);

  const renderPage = useCallback(
    ({ item }: { item: (typeof PAGES)[number] }) => {
      if (carouselHeight === 0) return null;
      if (item === "recording") {
        return <RecordingPage width={width} height={carouselHeight} />;
      }
      return (
        <MeetingsPage
          width={width}
          height={carouselHeight}
          playerBarHeight={playerBarHeight}
          activeId={activeId}
          isPlaying={status.playing}
          onPlay={handlePlay}
          onDelete={handlePlayerDelete}
        />
      );
    },
    [
      width,
      carouselHeight,
      playerBarHeight,
      activeId,
      status.playing,
      handlePlay,
      handlePlayerDelete,
    ],
  );

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="mic"
          titlePrefix="Grabar"
          titleAccent="Reunión"
        />

        <RecordingMotto activeIndex={activeIndex} />

        <FlatList
          data={PAGES}
          keyExtractor={(item) => item}
          renderItem={renderPage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={styles.carousel}
          onLayout={onCarouselLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {showPlayer && (
          <View
            style={styles.playerBar}
            onLayout={(e) => setPlayerBarHeight(e.nativeEvent.layout.height)}
          >
            <MeetingPlayerBar
              title={activeRecording.title}
              date={activeRecording.date}
              duration={formatDuration(activeRecording.durationMs)}
              progress={progress}
              isPlaying={status.playing}
              bottomInset={insets.bottom}
              onTogglePlay={handleTogglePlay}
              onClose={handleClose}
              onSeek={handleSeek}
              onShare={handleShare}
              onFavorite={handleFavorite}
            />
          </View>
        )}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  playerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0e1d1b",
  },
});
