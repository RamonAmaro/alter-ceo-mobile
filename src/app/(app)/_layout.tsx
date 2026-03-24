import { AlterLogo } from "@/components/alter-logo";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// const TAB_ICON_SIZE = 22;
const TAB_ICON_SIZE = 26;

const CENTER_LOGO_SIZE = 34;
const ACTIVE_COLOR = "#00FF84";
const INACTIVE_COLOR = "rgba(0,255,132,0.5)";
const INDICATOR_WIDTH = 40;
// const LABEL_ACTIVE = ACTIVE_COLOR;
// const LABEL_INACTIVE = "rgba(255,255,255,0.6)";

interface TabItemConfig {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  pushRoute?: string;
}

const TAB_ITEMS: TabItemConfig[] = [
  {
    key: "recording",
    label: "Grabar",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "mic" : "mic-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
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
    icon: (color) => (
      <View style={{ opacity: color === ACTIVE_COLOR ? 1 : 0.55 }}>
        <AlterLogo size={CENTER_LOGO_SIZE} />
      </View>
    ),
  },
  {
    key: "notifications",
    label: "Tareas",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "reader" : "reader-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
    pushRoute: "/notifications",
  },
  {
    key: "strategy",
    label: "Datos",
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

const TAB_COUNT = TAB_ITEMS.length;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const activeRouteName = state.routes[state.index].name;

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setTabWidth(e.nativeEvent.layout.width / TAB_COUNT);
    },
    [],
  );

  const activeVisualIndex = TAB_ITEMS.findIndex(
    (t) => t.key === activeRouteName,
  );

  useEffect(() => {
    if (tabWidth === 0 || activeVisualIndex < 0) return;
    const targetX =
      activeVisualIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    Animated.spring(translateX, {
      toValue: targetX,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();
  }, [activeVisualIndex, tabWidth]);

  return (
    <View
      style={[styles.tabBar, { paddingBottom: insets.bottom }]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[styles.indicator, { transform: [{ translateX }] }]}
      />
      <View style={styles.tabsRow}>
        {TAB_ITEMS.map((item) => {
          const focused = activeRouteName === item.key;
          const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
          // const labelColor = focused ? LABEL_ACTIVE : LABEL_INACTIVE;

          return (
            <Pressable
              key={item.key}
              style={styles.tabButton}
              onPress={() => {
                if (item.pushRoute) {
                  router.push(item.pushRoute as never);
                  return;
                }
                const routeIndex = state.routes.findIndex(
                  (r) => r.name === item.key,
                );
                if (routeIndex < 0) return;
                const event = navigation.emit({
                  type: "tabPress",
                  target: state.routes[routeIndex].key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) {
                  navigation.navigate(item.key);
                }
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label || item.key}
            >
              {item.icon(color, focused)}
              {/* {item.label !== "" && (
                <ThemedText
                  type="caption"
                  numberOfLines={1}
                  style={[styles.tabLabel, { color: labelColor }]}
                >
                  {item.label}
                </ThemedText>
              )} */}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const MemoizedTabBar = React.memo(CustomTabBar);

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <MemoizedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="alter" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(10,15,20,0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ACTIVE_COLOR,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: ACTIVE_COLOR,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabsRow: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
});
