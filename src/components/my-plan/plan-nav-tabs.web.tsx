import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useCallback, useRef, useState } from "react";
import { type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from "react-native";

export interface PlanTab {
  key: string;
  label: string;
}

interface PlanNavTabsProps {
  tabs: PlanTab[];
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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const updateIndicator = useCallback((key: string) => {
    const layout = tabLayouts.current[key];
    if (!layout) return;
    setIndicatorStyle({ left: layout.x, width: layout.width });
  }, []);

  const handleTabLayout = useCallback(
    (key: string, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[key] = { x, width };
      if (key === activeKey) {
        updateIndicator(activeKey);
      }
    },
    [activeKey, updateIndicator],
  );

  const handlePress = useCallback(
    (key: string) => {
      onPress(key);
      updateIndicator(key);
      const layout = tabLayouts.current[key];
      if (layout && scrollRef.current) {
        scrollRef.current.scrollTo({ x: Math.max(0, layout.x - 40), animated: true });
      }
    },
    [onPress, updateIndicator],
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          const isHovered = tab.key === hoveredKey;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              onLayout={(e) => handleTabLayout(tab.key, e)}
              onHoverIn={() => setHoveredKey(tab.key)}
              onHoverOut={() => setHoveredKey(null)}
              style={styles.tab}
            >
              <ThemedText
                type="caption"
                style={[
                  styles.tabText,
                  isHovered && !isActive && styles.tabTextHover,
                  isActive && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}

        <View
          style={[
            styles.indicator,
            {
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.width > 0 ? 1 : 0,
            },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: SemanticColors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.one,
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingTop: 6,
    paddingBottom: 12,
    cursor: "pointer" as never,
  },
  tabText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    fontFamily: Fonts.montserratMedium,
    transitionProperty: "color" as never,
    transitionDuration: "150ms" as never,
  },
  tabTextHover: {
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    borderRadius: 99,
    backgroundColor: SemanticColors.success,
    transitionProperty: "left, width" as never,
    transitionDuration: "250ms" as never,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" as never,
  },
});
