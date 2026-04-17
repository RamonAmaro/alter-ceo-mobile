import { SemanticColors } from "@/constants/theme";
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
      <View style={styles.topHairline} />
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
    backgroundColor: SemanticColors.surfaceOverlay,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SemanticColors.borderLight,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
      web: { boxShadow: "0px -6px 20px rgba(0, 0, 0, 0.45)" },
    }),
  },
  topHairline: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: 1,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 12,
  },
});
