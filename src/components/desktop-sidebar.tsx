import { router, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const SIDEBAR_WIDTH = 240;
const ACTIVE_COLOR = SemanticColors.success;
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";

export function DesktopSidebar() {
  const pathname = usePathname();

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
      <View style={styles.logoArea}>
        <Image
          source={require("@/assets/ui/logo-alterceo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.filter((i) => !i.isCenter).map((item) => {
          const focused = activeKey === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, focused && styles.navItemActive]}
              onPress={() => handleNav(item.key)}
            >
              {focused && <View style={styles.activeBar} />}
              {item.icon(focused ? ACTIVE_COLOR : INACTIVE_COLOR, focused)}
              <ThemedText type="bodySm" style={[styles.navLabel, focused && styles.navLabelActive]}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        <Pressable
          style={[styles.navItem, activeKey === "alter" && styles.navItemActive]}
          onPress={() => handleNav("alter")}
        >
          {activeKey === "alter" && <View style={styles.activeBar} />}
          <Ionicons
            name="home"
            size={20}
            color={activeKey === "alter" ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
          <ThemedText
            type="bodySm"
            style={[styles.navLabel, activeKey === "alter" && styles.navLabelActive]}
          >
            Inicio
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.profileBtn} onPress={() => handleNav("profile")}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={SemanticColors.textPrimary} />
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
    paddingVertical: Spacing.four,
  },
  logoArea: {
    alignItems: "center",
    paddingBottom: Spacing.five,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border,
    marginHorizontal: Spacing.three,
  },
  logo: {
    width: 100,
    height: 94,
  },
  nav: {
    flex: 1,
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.four,
    marginHorizontal: Spacing.two,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: "rgba(0,255,132,0.06)",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
  navLabel: {
    color: INACTIVE_COLOR,
    fontFamily: Fonts.montserratMedium,
  },
  navLabelActive: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: SemanticColors.border,
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.two,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border,
    paddingTop: Spacing.three,
    marginHorizontal: Spacing.three,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileLabel: {
    color: SemanticColors.iconMuted,
    fontFamily: Fonts.montserratMedium,
  },
});
