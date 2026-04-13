import { useAudioPlayer, useAudioPlayerStatus } from "@/hooks/use-audio-playback";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { useActiveRecordingStore } from "@/stores/active-recording-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatDuration } from "@/utils/format-duration";

import { MeetingPlayerBar } from "./meeting-player-bar";
import { MeetingsPage } from "./meetings-page";
import { RecordingPage } from "./recording-page";

const TABS = [
  { key: "recording", label: "Grabar" },
  { key: "meetings", label: "Grabaciones" },
] as const;

export function RecordingScreen() {
  const windowWidth = useWindowDimensions().width;
  const [containerWidth, setContainerWidth] = useState(0);
  const width = containerWidth || windowWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [playerBarHeight, setPlayerBarHeight] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const recordings = useRecordingsStore((s) => s.recordings);
  const activeId = useActiveRecordingStore((s) => s.activeId);
  const setActiveId = useActiveRecordingStore((s) => s.setActiveId);
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
        setPlayerBarHeight(0);
      }
    },
    [activeId, player, setActiveId],
  );

  const handleShare = useCallback(() => {}, []);
  const handleFavorite = useCallback(() => {}, []);
  const handleClose = useCallback(() => {
    player.pause();
    setActiveId(null);
    setPlayerBarHeight(0);
  }, [player, setActiveId]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const showPlayer = activeIndex === 1 && !!activeRecording;

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    setContentHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={900}>
        <View
          style={styles.container}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          <ScreenHeader
            topInset={0}
            icon="mic"
            titlePrefix="Grabar"
            titleAccent="Reunión"
            showBack={false}
          />

          <View style={styles.tabBar}>
            {TABS.map((tab, i) => {
              const isActive = i === activeIndex;
              const isHovered = tab.key === hoveredTab;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.tab}
                  onPress={() => setActiveIndex(i)}
                  onHoverIn={() => setHoveredTab(tab.key)}
                  onHoverOut={() => setHoveredTab(null)}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      isHovered && !isActive && styles.tabTextHover,
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </ThemedText>
                  {isActive && <View style={styles.tabIndicator} />}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.content} onLayout={onContentLayout}>
            {activeIndex === 0 ? (
              <RecordingPage width={width} height={contentHeight} />
            ) : (
              <MeetingsPage
                width={width}
                height={contentHeight}
                playerBarHeight={playerBarHeight}
                activeId={activeId}
                isPlaying={status.playing}
                onPlay={handlePlay}
                onDelete={handlePlayerDelete}
              />
            )}
          </View>

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
                bottomInset={0}
                onTogglePlay={handleTogglePlay}
                onClose={handleClose}
                onSeek={handleSeek}
                onShare={handleShare}
                onFavorite={handleFavorite}
              />
            </View>
          )}
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    cursor: "pointer" as never,
  },
  tabText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    transitionProperty: "color" as never,
    transitionDuration: "150ms" as never,
  },
  tabTextHover: {
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    fontFamily: Fonts.montserratBold,
    color: SemanticColors.textPrimary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 99,
    backgroundColor: SemanticColors.success,
  },
  content: {
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
