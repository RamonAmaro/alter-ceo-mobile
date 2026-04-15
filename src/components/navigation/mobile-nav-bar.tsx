import { router, usePathname } from "expo-router";
import type { Href } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NavItemConfig } from "./nav-items";
import { NAV_ITEMS } from "./nav-items";
import { TabButton } from "./tab-button";

function MobileNavBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const activeKey = getActiveKey(pathname);

  const handlePress = useCallback((item: NavItemConfig) => {
    const path = item.key === "alter" ? "/(app)/(tabs)/alter" : `/(app)/${item.key}`;
    router.navigate(path as Href);
  }, []);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabsRow}>
        {NAV_ITEMS.map((item) => (
          <TabButton
            key={item.key}
            item={item}
            focused={activeKey === item.key}
            onPress={() => handlePress(item)}
          />
        ))}
      </View>
    </View>
  );
}

function getActiveKey(pathname: string): string {
  const clean = pathname.replace(/^\//, "");
  if (clean === "" || clean === "alter") return "alter";
  const match = NAV_ITEMS.find((item) => clean === item.key || clean.startsWith(`${item.key}/`));
  return match?.key ?? "";
}

export const MemoizedMobileNavBar = React.memo(MobileNavBar);

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
