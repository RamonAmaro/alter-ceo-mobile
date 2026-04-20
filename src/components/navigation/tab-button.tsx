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
        {focused && <View style={styles.activeDot} />}
        <View style={styles.iconWrapper}>
          {focused && <View style={styles.iconGlow} />}
          {item.icon(color, focused)}
        </View>
        <ThemedText
          type="caption"
          style={[styles.tabLabel, { color: focused ? ACTIVE_LABEL_COLOR : INACTIVE_LABEL_COLOR }]}
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
    paddingTop: 6,
    paddingBottom: 14,
  },
  tabButtonInner: {
    alignItems: "center",
    gap: 6,
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
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,255,132,0.14)",
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
  },
  centerGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  centerGlowActive: {
    backgroundColor: "rgba(0,255,132,0.22)",
  },
  centerInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
