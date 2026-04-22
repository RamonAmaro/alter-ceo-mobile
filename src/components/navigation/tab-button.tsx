import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors } from "@/constants/theme";
import type { NavItemConfig } from "./nav-items";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

const ACTIVE_COLOR = SemanticColors.success;
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";
const INACTIVE_LABEL_COLOR = "rgba(255,255,255,0.6)";
const ACTIVE_LABEL_COLOR = "rgba(0,255,132,0.95)";

const ICON_SLOT_HEIGHT = 28;
const LABEL_LINE_HEIGHT = 11;
const LABEL_LINES = 2;
const LABEL_SLOT_HEIGHT = LABEL_LINE_HEIGHT * LABEL_LINES;

interface TabButtonProps {
  item: NavItemConfig;
  focused: boolean;
  onPress: () => void;
}

export function TabButton({ item, focused, onPress }: TabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn(): void {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 120,
      friction: 8,
    }).start();
  }

  function handlePressOut(): void {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 120,
      friction: 8,
    }).start();
  }

  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={item.label}
    >
      <Animated.View style={[styles.tabButtonInner, { transform: [{ scale: scaleAnim }] }]}>
        {focused && <View style={styles.activeDot} />}
        <View style={styles.iconWrapper}>
          {focused && <View style={styles.iconGlow} />}
          {item.icon(color, focused)}
        </View>
        <View style={styles.labelSlot}>
          <ThemedText
            type="caption"
            style={[styles.tabLabel, { color: focused ? ACTIVE_LABEL_COLOR : INACTIVE_LABEL_COLOR }]}
            numberOfLines={LABEL_LINES}
          >
            {item.label}
          </ThemedText>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  tabButtonInner: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  activeDot: {
    position: "absolute",
    top: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
  iconWrapper: {
    width: ICON_SLOT_HEIGHT,
    height: ICON_SLOT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,255,132,0.14)",
  },
  labelSlot: {
    height: LABEL_SLOT_HEIGHT,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 9,
    lineHeight: LABEL_LINE_HEIGHT,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
