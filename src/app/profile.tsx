import { AppBackground } from "@/components/app-background";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  async function handleSignOut(): Promise<void> {
    await resetOnboarding();
    await signOut();
    router.replace("/");
  }

  return (
    <AppBackground>
      <View
        style={[styles.container, { paddingTop: insets.top + Spacing.two }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>Perfil</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={40} color="rgba(255,255,255,0.5)" />
          </View>
          <ThemedText type="subtitle" style={styles.userName}>(Nombre)</ThemedText>
          <ThemedText type="labelSm" style={styles.userCompany}>(Nombre de Empresa)</ThemedText>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons
              name="person-outline"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
            <ThemedText type="labelSm" style={styles.menuLabel}>Editar perfil</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons
              name="shield-outline"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
            <ThemedText type="labelSm" style={styles.menuLabel}>Seguridad</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
            <ThemedText type="labelSm" style={styles.menuLabel}>Ayuda</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.signOutWrap, { paddingBottom: insets.bottom + Spacing.four }]}
        >
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(255,68,68,0.15)", "rgba(255,68,68,0.05)"]}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF4444" />
              <ThemedText type="labelSm" style={styles.signOutText}>Cerrar sesión</ThemedText>
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
    color: "#ffffff",
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
    color: "#ffffff",
  },
  userCompany: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: Spacing.one,
  },
  content: {
    gap: Spacing.one,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    gap: Spacing.three,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
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
