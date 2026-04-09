import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors } from "@/constants/theme";
import type { NavItemConfig } from "./nav-items";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

const ACTIVE_COLOR = SemanticColors.success;
const INACTIVE_COLOR = "rgba(255,255,255,0.35)";
const ACTIVE_LABEL_COLOR = "rgba(0,255,132,0.9)";

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

  if (item.isCenter) {
    return (
      <Pressable
        style={styles.centerWrapper}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Alter"
      >
        <Animated.View style={[styles.centerButton, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.centerGlow, focused && styles.centerGlowActive]} />
          <View style={styles.centerInner}>{item.icon(ACTIVE_COLOR, focused)}</View>
        </Animated.View>
      </Pressable>
    );
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
        {focused && <View style={styles.iconGlow} />}
        {item.icon(color, focused)}
        <ThemedText
          type="caption"
          style={[styles.tabLabel, { color: focused ? ACTIVE_LABEL_COLOR : INACTIVE_COLOR }]}
          numberOfLines={1}
        >
          {item.label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  tabButtonInner: {
    alignItems: "center",
    gap: 4,
  },
  iconGlow: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,255,132,0.12)",
    top: -6,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  centerGlow: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  centerGlowActive: {
    backgroundColor: "rgba(0,255,132,0.18)",
  },
  centerInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,255,132,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
