import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { SegmentedTabs, type SegmentedTabConfig } from "@/components/ui/segmented-tabs";
import { Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";

import { DocumentsHistoryPage } from "./documents-history-page";
import { UploadPage } from "./upload-page";

const TABS: readonly SegmentedTabConfig[] = [
  { key: "upload", label: "Subir", icon: "cloud-upload" },
  { key: "history", label: "Historial", icon: "albums" },
];

function buildHeaderAccent(index: number): string {
  return index === 0 ? "Subir" : "Historial";
}

export function DocumentsScreen() {
  const { isMobile } = useResponsiveLayout();
  const windowWidth = useWindowDimensions().width;
  const [containerWidth, setContainerWidth] = useState(0);
  const width = containerWidth || windowWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

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
          icon="cloud-upload"
          titlePrefix="Documentos"
          titleAccent={buildHeaderAccent(activeIndex)}
          showBack={isMobile}
        />

        <SegmentedTabs tabs={TABS} activeIndex={activeIndex} onChange={setActiveIndex} />

        <View style={styles.content} onLayout={onContentLayout}>
          {activeIndex === 0 ? (
            <UploadPage
              width={width}
              height={contentHeight}
              onUploaded={() => setActiveIndex(1)}
            />
          ) : (
            <DocumentsHistoryPage width={width} height={contentHeight} />
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
