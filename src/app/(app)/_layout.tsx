import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICON_SIZE = 24;
const CENTER_LOGO_SIZE = 30;
const ACTIVE_COLOR = "#00FF84";
const INACTIVE_COLOR = "rgba(255,255,255,0.35)";
const ACTIVE_LABEL_COLOR = "rgba(0,255,132,0.9)";

interface TabItemConfig {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  pushRoute?: string;
  isCenter?: boolean;
}

const TAB_ITEMS: TabItemConfig[] = [
  {
    key: "recording",
    label: "Grabar",
    icon: (color, focused) => (
      <Ionicons name={focused ? "mic" : "mic-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
    pushRoute: "/recording",
  },
  {
    key: "settings",
    label: "Ajustes",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "settings" : "settings-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
    pushRoute: "/settings",
  },
  {
    key: "alter",
    label: "",
    isCenter: true,
    icon: () => <AlterLogo size={CENTER_LOGO_SIZE} />,
  },
  {
    key: "notifications",
    label: "Mi Plan",
    icon: (color, focused) => (
      <Ionicons name={focused ? "trophy" : "trophy-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
    pushRoute: "/my-plan",
  },
  {
    key: "strategy",
    label: "Estrategia",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "bar-chart" : "bar-chart-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
    pushRoute: "/strategy",
  },
];

function TabButton({
  item,
  focused,
  onPress,
}: {
  item: TabItemConfig;
  focused: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn(): void {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }

  function handlePressOut(): void {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
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

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index].name;

  const handlePress = useCallback(
    (item: TabItemConfig) => {
      if (item.pushRoute) {
        router.push(item.pushRoute as never);
        return;
      }
      const routeIndex = state.routes.findIndex((r) => r.name === item.key);
      if (routeIndex < 0) return;
      const event = navigation.emit({
        type: "tabPress",
        target: state.routes[routeIndex].key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigation.navigate(item.key);
      }
    },
    [state, navigation],
  );

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabsRow}>
        {TAB_ITEMS.map((item) => {
          const focused = activeRouteName === item.key;
          return (
            <TabButton
              key={item.key}
              item={item}
              focused={focused}
              onPress={() => handlePress(item)}
            />
          );
        })}
      </View>
    </View>
  );
}

const MemoizedTabBar = React.memo(CustomTabBar);

export default function AppLayout() {
  return (
    <Tabs tabBar={(props) => <MemoizedTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="alter" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(8,12,18,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 8,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: "#00FF84",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
});
