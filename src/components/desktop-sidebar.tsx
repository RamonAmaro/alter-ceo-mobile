import { router, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AlterLogo } from "@/components/alter-logo";
import { AlterWordmark } from "@/components/alter-wordmark";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const SIDEBAR_WIDTH = 230;
const ACTIVE_COLOR = SemanticColors.success;
const INACTIVE_COLOR = "rgba(255,255,255,0.35)";
const SIDEBAR_ICON_SIZE = 20;

const ROUTE_TO_NAV_KEY: Record<string, string> = {
  "meeting-detail": "recording",
  "source-detail": "documents",
  "strategy-captacion": "strategy",
  "strategy-captacion-loading": "strategy",
  "strategy-captacion-ready": "strategy",
  "strategy-captacion-result": "strategy",
  chat: "alter",
};

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
      {focused && <View style={styles.activeIndicator} />}
      <View style={styles.iconWrap}>{icon}</View>
      <ThemedText
        type="bodySm"
        style={[
          styles.navLabel,
          focused && styles.navLabelActive,
          !focused && hovered && styles.navLabelHover,
        ]}
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
    const firstSegment = clean.split("/")[0] ?? "";
    const mapped = ROUTE_TO_NAV_KEY[firstSegment];
    if (mapped) return mapped;
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
      <Pressable style={styles.brandArea} onPress={() => handleNav("alter")}>
        <View style={styles.logoMark}>
          <AlterLogo size={22} />
        </View>
        <View style={styles.brandTextWrap}>
          <AlterWordmark size={14} />
          <ThemedText style={styles.brandSub}>copiloto estratégico</ThemedText>
        </View>
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.sectionLabel}>
        <ThemedText style={styles.sectionText}>NAVEGACIÓN</ThemedText>
      </View>

      <View style={styles.nav}>
        <SidebarItem
          label="Inicio"
          icon={
            <Ionicons
              name={activeKey === "alter" ? "home" : "home-outline"}
              size={SIDEBAR_ICON_SIZE}
              color={activeKey === "alter" ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          }
          focused={activeKey === "alter"}
          onPress={() => handleNav("alter")}
        />

        {NAV_ITEMS.map((item) => {
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
        <View style={styles.divider} />
        <Pressable
          style={[styles.profileBtn, profileHovered && styles.profileBtnHover]}
          onPress={() => handleNav("profile")}
          onHoverIn={() => setProfileHovered(true)}
          onHoverOut={() => setProfileHovered(false)}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={13} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>Mi Perfil</ThemedText>
            <ThemedText style={styles.profileRole}>CEO</ThemedText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={14}
            color="rgba(255,255,255,0.2)"
            style={styles.profileChevron}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#06080c",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.04)",
  },
  brandArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    cursor: "pointer" as never,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(0,255,132,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextWrap: {
    alignItems: "flex-start",
    gap: 2,
  },
  brandSub: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 9,
    letterSpacing: 0.5,
    color: "rgba(255,255,255,0.3)",
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginHorizontal: 16,
  },
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.2)",
    lineHeight: 12,
  },
  nav: {
    flex: 1,
    gap: 2,
    paddingHorizontal: Spacing.two,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    cursor: "pointer" as never,
    transitionProperty: "background-color" as never,
    transitionDuration: "180ms" as never,
  },
  navItemActive: {
    backgroundColor: "rgba(0,255,132,0.07)",
  },
  navItemHover: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  iconWrap: {
    width: SIDEBAR_ICON_SIZE,
    height: SIDEBAR_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: ACTIVE_COLOR,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  navLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    color: INACTIVE_COLOR,
    transitionProperty: "color" as never,
    transitionDuration: "180ms" as never,
  },
  navLabelActive: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  navLabelHover: {
    color: "rgba(255,255,255,0.65)",
  },
  footer: {
    paddingBottom: Spacing.three,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: Spacing.two,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    cursor: "pointer" as never,
    transitionProperty: "background-color" as never,
    transitionDuration: "180ms" as never,
  },
  profileBtnHover: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 16,
  },
  profileRole: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 9,
    color: "rgba(255,255,255,0.25)",
    lineHeight: 12,
    letterSpacing: 0.5,
  },
  profileChevron: {
    opacity: 0.6,
  },
});
