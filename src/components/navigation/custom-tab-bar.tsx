import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import type { Href } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavItemConfig } from "./nav-items";
import { NAV_ITEMS } from "./nav-items";
import { TabButton } from "./tab-button";

function CustomTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index].name;

  const handlePress = useCallback((item: NavItemConfig) => {
    if (item.key === "alter") return;
    router.navigate(`/(app)/${item.key}` as Href);
  }, []);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabsRow}>
        {NAV_ITEMS.map((item) => {
          const focused = activeRouteName === item.key;
          return (
            <TabButton
              key={item.key}
              item={item}
              focused={focused && item.key === "alter"}
              onPress={() => handlePress(item)}
            />
          );
        })}
      </View>
    </View>
  );
}

export const MemoizedTabBar = React.memo(CustomTabBar);

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
      web: { boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.4)" },
    }),
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 8,
  },
});
