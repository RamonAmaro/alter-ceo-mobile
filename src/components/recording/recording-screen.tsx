import { useCallback, useRef, useState } from "react";
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
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useMeetingStore } from "@/stores/meeting-store";

import { MeetingsPage } from "./meetings-page";
import { RecordingMotto } from "./recording-motto";
import { RecordingPage } from "./recording-page";

const PAGES = ["recording", "meetings"] as const;

export function RecordingScreen() {
  const insets = useSafeAreaInsets();
  const windowWidth = useWindowDimensions().width;
  const { isMobile } = useResponsiveLayout();
  const [containerWidth, setContainerWidth] = useState(0);
  const width = containerWidth || windowWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);

  const userId = useAuthStore((s) => s.user?.userId);
  const fetchMeetings = useMeetingStore((s) => s.fetchMeetings);

  const handleUploadComplete = useCallback(() => {
    if (userId) {
      fetchMeetings(userId);
    }
  }, [userId, fetchMeetings]);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const onCarouselLayout = useCallback((e: LayoutChangeEvent) => {
    setCarouselHeight(e.nativeEvent.layout.height);
  }, []);

  const renderPage = useCallback(
    ({ item }: { item: (typeof PAGES)[number] }) => {
      if (carouselHeight === 0) return null;
      if (item === "recording") {
        return (
          <RecordingPage
            width={width}
            height={carouselHeight}
            onUploadComplete={handleUploadComplete}
          />
        );
      }
      return <MeetingsPage width={width} height={carouselHeight} />;
    },
    [width, carouselHeight, handleUploadComplete],
  );

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={900}>
        <View
          style={styles.container}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          <ScreenHeader
            topInset={insets.top}
            icon="mic"
            titlePrefix="Grabar"
            titleAccent="Reunión"
            showBack={isMobile}
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
        </View>
      </ResponsiveContainer>
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
});
