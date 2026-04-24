import { Spacing } from "@/constants/theme";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";

import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { SegmentedTabs, type SegmentedTabConfig } from "@/components/ui/segmented-tabs";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";

import { MeetingsPage } from "./meetings-page";
import { RecordingPage } from "./recording-page";

const TABS: readonly SegmentedTabConfig[] = [
  { key: "recording", label: "Grabar", icon: "mic" },
  { key: "meetings", label: "Historial", icon: "albums" },
];

function buildHeaderAccent(index: number): string {
  return index === 0 ? "Grabar" : "Historial";
}

export function RecordingScreen() {
  const { isMobile } = useResponsiveLayout();
  const windowWidth = useWindowDimensions().width;
  const [containerWidth, setContainerWidth] = useState(0);
  const width = containerWidth || windowWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

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
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScreenHeader
          topInset={0}
          icon="mic"
          titlePrefix="Reuniones"
          titleAccent={buildHeaderAccent(activeIndex)}
          showBack={isMobile}
        />

        <SegmentedTabs tabs={TABS} activeIndex={activeIndex} onChange={setActiveIndex} />

        <View style={styles.content} onLayout={onContentLayout}>
          {activeIndex === 0 ? (
            <RecordingPage
              width={width}
              height={contentHeight}
              onUploadComplete={handleUploadComplete}
              onGoToHistory={() => setActiveIndex(1)}
            />
          ) : (
            <MeetingsPage width={width} height={contentHeight} />
          )}
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: Spacing.one,
  },
});
