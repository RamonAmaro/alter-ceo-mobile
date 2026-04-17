import { AppBackground } from "@/components/app-background";
import { MenuItem } from "@/components/menu-item";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { goBackOrHome } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MENU_ITEMS = [
  { icon: "person-outline" as const, label: "Editar perfil" },
  { icon: "shield-outline" as const, label: "Seguridad" },
  { icon: "help-circle-outline" as const, label: "Ayuda" },
  { icon: "clipboard-outline" as const, label: "Configurar mi plan", key: "onboarding" },
  { icon: "compass-outline" as const, label: "Memoria de negocio", key: "business-memory" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  function handleMenuPress(key?: string): void {
    switch (key) {
      case "onboarding":
        router.push("/(onboarding)/welcome");
        return;
      case "business-memory":
        router.push("/(app)/business-memory" as Href);
        return;
    }
  }

  async function handleSignOut(): Promise<void> {
    await signOut();
    router.replace("/");
  }

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.header}>
          {isMobile ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => goBackOrHome()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={SemanticColors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Perfil
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={40} color={SemanticColors.textMuted} />
          </View>
          <ThemedText type="subtitle" style={styles.userName}>
            (Nombre)
          </ThemedText>
          <ThemedText type="labelSm" style={styles.userCompany}>
            (Nombre de Empresa)
          </ThemedText>
        </View>

        <View style={styles.content}>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.icon}
              icon={item.icon}
              label={item.label}
              onPress={item.key ? () => handleMenuPress(item.key) : undefined}
            />
          ))}
        </View>

        <View style={[styles.signOutWrap, { paddingBottom: insets.bottom + Spacing.four }]}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <LinearGradient
              colors={["rgba(255,68,68,0.15)", "rgba(255,68,68,0.05)"]}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF4444" />
              <ThemedText type="labelSm" style={styles.signOutText}>
                Cerrar sesión
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    padding: Spacing.one,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: SemanticColors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.five,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(0,255,132,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },
  userName: {
    fontSize: 22,
    color: SemanticColors.textPrimary,
  },
  userCompany: {
    fontSize: 14,
    color: SemanticColors.textMuted,
    marginTop: Spacing.one,
  },
  content: {
    gap: Spacing.one,
  },
  signOutWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  signOutBtn: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.15)",
  },
  signOutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  signOutText: {
    fontSize: 15,
    color: "#FF4444",
  },
});
