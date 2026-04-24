import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export interface PlanTab {
  key: string;
  label: string;
}

interface PlanNavTabsProps {
  tabs: readonly PlanTab[];
  activeKey: string;
  onPress: (key: string) => void;
}

interface TabLayout {
  x: number;
  width: number;
}

export function PlanNavTabs({ tabs, activeKey, onPress }: PlanNavTabsProps) {
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, TabLayout>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScaleX = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const hasInitialized = useRef(false);

  const animateIndicator = useCallback(
    (key: string) => {
      const layout = tabLayouts.current[key];
      if (!layout) return;

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        indicatorX.setValue(layout.x);
        indicatorScaleX.setValue(layout.width);
        indicatorOpacity.setValue(1);
        return;
      }

      Animated.spring(indicatorX, {
        toValue: layout.x,
        useNativeDriver: USE_NATIVE_DRIVER,
        tension: 120,
        friction: 14,
      }).start();

      Animated.spring(indicatorScaleX, {
        toValue: layout.width,
        useNativeDriver: USE_NATIVE_DRIVER,
        tension: 120,
        friction: 14,
      }).start();
    },
    [indicatorX, indicatorScaleX, indicatorOpacity],
  );

  useEffect(() => {
    animateIndicator(activeKey);
    const layout = tabLayouts.current[activeKey];
    if (layout && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, layout.x - 40), animated: true });
    }
  }, [activeKey, animateIndicator]);

  const handleTabLayout = useCallback(
    (key: string, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[key] = { x, width };
      if (key === activeKey) {
        animateIndicator(activeKey);
      }
    },
    [activeKey, animateIndicator],
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeKey;
          const indexLabel = String(index + 1).padStart(2, "0");
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPress(tab.key)}
              onLayout={(e) => handleTabLayout(tab.key, e)}
              style={styles.tab}
            >
              <ThemedText
                style={[styles.tabIndex, isActive && styles.tabIndexActive]}
                numberOfLines={1}
              >
                {indexLabel}
              </ThemedText>
              <ThemedText
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}

        <Animated.View
          style={[
            styles.indicator,
            {
              opacity: indicatorOpacity,
              transform: [{ translateX: indicatorX }, { scaleX: indicatorScaleX }],
            },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Platform.OS === "web" ? "transparent" : SemanticColors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    alignItems: "flex-start",
    gap: 2,
    minWidth: 80,
  },
  tabIndex: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 9,
    lineHeight: 11,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1.4,
  },
  tabIndexActive: {
    color: SemanticColors.success,
  },
  tabText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    lineHeight: 16,
    fontFamily: Fonts.montserratSemiBold,
  },
  tabTextActive: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 1,
    height: 2,
    borderRadius: 99,
    backgroundColor: SemanticColors.success,
    transformOrigin: "left center" as never,
  },
});
