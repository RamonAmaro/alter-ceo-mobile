import { router, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const SIDEBAR_WIDTH = 220;
const ACTIVE_COLOR = SemanticColors.success;
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  focused: boolean;
  onPress: () => void;
}

function SidebarItem({ label, icon, focused, onPress }: SidebarItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={[
        styles.navItem,
        focused && styles.navItemActive,
        !focused && hovered && styles.navItemHover,
      ]}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      {focused && <View style={styles.activeBar} />}
      {icon}
      <ThemedText
        type="bodySm"
        style={[styles.navLabel, focused && styles.navLabelActive, hovered && styles.navLabelHover]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const [profileHovered, setProfileHovered] = useState(false);

  function getActiveKey(): string {
    const clean = pathname.replace(/^\//, "");
    const match = NAV_ITEMS.find((item) => clean === item.key || clean.startsWith(`${item.key}/`));
    return match?.key ?? "alter";
  }

  const activeKey = getActiveKey();

  function handleNav(key: string): void {
    const path = key === "alter" ? "/(app)/(tabs)/alter" : `/(app)/${key}`;
    router.navigate(path as Href);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.logoArea} onPress={() => handleNav("alter")}>
        <Image
          source={require("@/assets/ui/logo-alterceo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.nav}>
        <SidebarItem
          label="Inicio"
          icon={
            <Ionicons
              name={activeKey === "alter" ? "home" : "home-outline"}
              size={20}
              color={activeKey === "alter" ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          }
          focused={activeKey === "alter"}
          onPress={() => handleNav("alter")}
        />

        {NAV_ITEMS.filter((i) => !i.isCenter).map((item) => {
          const focused = activeKey === item.key;
          return (
            <SidebarItem
              key={item.key}
              label={item.label}
              icon={item.icon(focused ? ACTIVE_COLOR : INACTIVE_COLOR, focused)}
              focused={focused}
              onPress={() => handleNav(item.key)}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.profileBtn, profileHovered && styles.profileBtnHover]}
          onPress={() => handleNav("profile")}
          onHoverIn={() => setProfileHovered(true)}
          onHoverOut={() => setProfileHovered(false)}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={14} color={SemanticColors.textPrimary} />
          </View>
          <ThemedText type="bodySm" style={styles.profileLabel}>
            Mi Perfil
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: SemanticColors.surfaceDark,
    borderRightWidth: 1,
    borderRightColor: SemanticColors.border,
  },
  logoArea: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    cursor: "pointer" as never,
  },
  logo: {
    width: 64,
    height: 60,
  },
  nav: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border,
    paddingTop: Spacing.three,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: Spacing.four,
    marginHorizontal: Spacing.two,
    borderRadius: 8,
    cursor: "pointer" as never,
    transitionProperty: "background-color" as never,
    transitionDuration: "150ms" as never,
  },
  navItemActive: {
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  navItemHover: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
  navLabel: {
    color: INACTIVE_COLOR,
    fontFamily: Fonts.montserratMedium,
    transitionProperty: "color" as never,
    transitionDuration: "150ms" as never,
  },
  navLabelActive: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  navLabelHover: {
    color: "rgba(255,255,255,0.7)",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    cursor: "pointer" as never,
    transitionProperty: "background-color" as never,
    transitionDuration: "150ms" as never,
  },
  profileBtnHover: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  profileLabel: {
    color: SemanticColors.iconMuted,
    fontFamily: Fonts.montserratMedium,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
