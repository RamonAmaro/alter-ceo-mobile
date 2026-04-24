import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";

export interface SegmentedTabConfig {
  readonly key: string;
  readonly label: string;
  readonly icon: React.ComponentProps<typeof Ionicons>["name"];
}

interface SegmentedTabsProps {
  tabs: readonly SegmentedTabConfig[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedTabs({ tabs, activeIndex, onChange }: SegmentedTabsProps) {
  const [widths, setWidths] = useState<number[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const activeWidth = widths[activeIndex] ?? 0;
  const activeOffset = widths.slice(0, activeIndex).reduce((acc, w) => acc + w, 0);

  useEffect(() => {
    if (widths.length !== tabs.length) return;
    // `Animated.parallel` com drivers mistos (um com `useNativeDriver: true` e
    // outro com `false`) dispara "Attempting to run JS driven animation on
    // animated node that has been moved to 'native' earlier". `width` não é
    // suportado pelo native driver, então ambas as animações rodam no driver
    // JS aqui — visualmente idêntico, sem o bug nativo.
    Animated.spring(translateX, {
      toValue: activeOffset,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
    Animated.spring(indicatorWidth, {
      toValue: activeWidth,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [activeIndex, activeOffset, activeWidth, widths.length, tabs.length, translateX, indicatorWidth]);

  function handleLayout(index: number, e: LayoutChangeEvent): void {
    const width = e.nativeEvent.layout.width;
    setWidths((prev) => {
      if (prev[index] === width) return prev;
      const next = [...prev];
      next[index] = width;
      return next;
    });
  }

  return (
    <View style={styles.outer}>
      <View style={styles.track}>
        {widths.length === tabs.length ? (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        ) : null}

        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          const isHovered = hoveredKey === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(i)}
              onHoverIn={() => setHoveredKey(tab.key)}
              onHoverOut={() => setHoveredKey(null)}
              onLayout={(e) => handleLayout(i, e)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={
                  isActive
                    ? SemanticColors.onSuccess
                    : isHovered
                      ? SemanticColors.textPrimary
                      : SemanticColors.textMuted
                }
              />
              <ThemedText
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  !isActive && isHovered && styles.labelHover,
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const pillShadow = Platform.select({
  ios: {
    shadowColor: "#00FF84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 6px 18px rgba(0,255,132,0.28)" },
});

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  track: {
    position: "relative",
    flexDirection: "row",
    alignItems: "stretch",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  indicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    backgroundColor: SemanticColors.success,
    ...pillShadow,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 1,
    cursor: "pointer" as never,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontFamily: Fonts.montserratBold,
    color: SemanticColors.onSuccess,
  },
  labelHover: {
    color: SemanticColors.textPrimary,
  },
});
