import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";

import { RecordingMotto } from "./recording-motto";
import { RecordingPage } from "./recording-page";
import { MeetingsPage } from "./meetings-page";

const PAGES = ["recording", "meetings"] as const;

export function RecordingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const renderPage = useCallback(
    ({ item }: { item: (typeof PAGES)[number] }) => {
      if (item === "recording") {
        return <RecordingPage width={width} />;
      }
      return <MeetingsPage width={width} />;
    },
    [width],
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
