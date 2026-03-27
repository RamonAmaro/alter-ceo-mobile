import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";

import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from "react-native-svg";

interface MeetingPlayerBarProps {
  title: string;
  date: string;
  duration: string;
  progress: number;
  isPlaying: boolean;
  bottomInset: number;
  onTogglePlay: () => void;
  onClose: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onSeek: (progress: number) => void;
}

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 18;

export function MeetingPlayerBar({
  title,
  date,
  duration,
  progress,
  isPlaying,
  bottomInset,
  onTogglePlay,
  onClose,
  onShare,
  onFavorite,
  onSeek,
}: MeetingPlayerBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const onSeekRef = useRef(onSeek);

  const pct = Math.min(Math.max(progress, 0), 1);
  const half = THUMB_SIZE / 2;
  const thumbX =
    trackWidth > 0 ? Math.min(Math.max(pct * trackWidth, half), trackWidth - half) : half;

  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        onSeekRef.current(
          Math.min(Math.max(e.nativeEvent.locationX / trackWidthRef.current, 0), 1),
        );
      },
      onPanResponderMove: (e) => {
        onSeekRef.current(
          Math.min(Math.max(e.nativeEvent.locationX / trackWidthRef.current, 0), 1),
        );
      },
    }),
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidthRef.current = w;
    setTrackWidth(w);
  };

  return (
    <View style={[styles.container, { paddingBottom: Spacing.three + bottomInset }]}>
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,255,255,0.12)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.trackContainer} onLayout={onTrackLayout} {...panResponder.panHandlers}>
        <Svg width="100%" height={THUMB_SIZE} preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#00A4FF" />
              <Stop offset="0.5" stopColor="#00CEB3" />
              <Stop offset="1" stopColor="#00E688" />
            </SvgLinearGradient>
          </Defs>
          <Rect
            x="0"
            y={(THUMB_SIZE - TRACK_HEIGHT) / 2}
            width="100%"
            height={TRACK_HEIGHT}
            fill="rgba(241,241,241,0.2)"
          />
          <Rect
            x="0"
            y={(THUMB_SIZE - TRACK_HEIGHT) / 2}
            width={`${pct * 100}%`}
            height={TRACK_HEIGHT}
            fill="url(#pg)"
          />
          <Rect
            x={thumbX - half}
            y="0"
            width={THUMB_SIZE}
            height={THUMB_SIZE}
            rx={THUMB_SIZE / 2}
            fill="#01E28F"
          />
        </Svg>
      </View>

      <View style={styles.durationRow}>
        <ThemedText type="caption" style={styles.durationText}>
          {duration}
        </ThemedText>
      </View>

      <View style={styles.infoRow}>
        <TouchableOpacity onPress={onTogglePlay} activeOpacity={0.7}>
          <View style={[styles.playButton, !isPlaying && { paddingLeft: 3 }]}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#273C57" />
          </View>
        </TouchableOpacity>

        <View style={styles.info}>
          <ThemedText
            type="labelSm"
            style={{ color: "#ffffff", fontFamily: Fonts.montserratExtraBold }}
          >
            {title}
          </ThemedText>
          <ThemedText type="caption" style={styles.date}>
            {date}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onShare} hitSlop={8}>
            <Ionicons name="share-social-outline" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onFavorite} hitSlop={8}>
            <Ionicons name="star-outline" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  trackContainer: {
    height: THUMB_SIZE,
  },
  durationRow: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.three,
  },
  durationText: {
    color: "#00FF84",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#BCBCBC",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  date: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
});
