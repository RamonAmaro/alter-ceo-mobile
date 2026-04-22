import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { SegmentedTabs, type SegmentedTabConfig } from "@/components/ui/segmented-tabs";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
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

import { DocumentsHistoryPage } from "./documents-history-page";
import { UploadPage } from "./upload-page";

const PAGES = ["upload", "history"] as const;

type PageKey = (typeof PAGES)[number];

const TABS: readonly SegmentedTabConfig[] = [
  { key: "upload", label: "Subir", icon: "cloud-upload" },
  { key: "history", label: "Historial", icon: "albums" },
];

export function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const windowWidth = useWindowDimensions().width;
  const { isMobile } = useResponsiveLayout();
  const [containerWidth, setContainerWidth] = useState(0);
  const width = containerWidth || Math.min(windowWidth, 900);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const listRef = useRef<FlatList<PageKey>>(null);

  const goToIndex = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

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
    ({ item }: { item: PageKey }) => {
      if (carouselHeight === 0) return null;
      if (item === "upload") {
        return (
          <UploadPage width={width} height={carouselHeight} onUploaded={() => goToIndex(1)} />
        );
      }
      return <DocumentsHistoryPage width={width} height={carouselHeight} />;
    },
    [width, carouselHeight, goToIndex],
  );

  return (
    <AppBackground>
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScreenHeader
          topInset={insets.top}
          icon="cloud-upload"
          titlePrefix="Documentos"
          titleAccent={activeIndex === 0 ? "Subir" : "Historial"}
          showBack={isMobile}
        />

        <SegmentedTabs tabs={TABS} activeIndex={activeIndex} onChange={goToIndex} />

        <FlatList
          ref={listRef}
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
