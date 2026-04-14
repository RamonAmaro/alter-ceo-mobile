import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useCallback, useState } from "react";
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
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const userId = useAuthStore((s) => s.user?.userId);
  const fetchMeetings = useMeetingStore((s) => s.fetchMeetings);

  const handleUploadComplete = useCallback(() => {
    if (userId) {
      fetchMeetings(userId);
    }
  }, [userId, fetchMeetings]);

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
              <RecordingPage
                width={width}
                height={contentHeight}
                onUploadComplete={handleUploadComplete}
              />
            ) : (
              <MeetingsPage width={width} height={contentHeight} />
            )}
          </View>
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
});
