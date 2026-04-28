import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

function firstName(displayName: string | null | undefined): string {
  if (!displayName) return "";
  const trimmed = displayName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

function extractBusinessName(
  steps: ReturnType<typeof useBusinessMemoryDashboard>["steps"],
): string | null {
  const companyStep = steps.find((s) => s.id === "company_profile");
  if (!companyStep) return null;
  const raw = companyStep.data.business_name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

export function HomeHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { steps } = useBusinessMemoryDashboard();

  const greetingName = firstName(user?.displayName) || firstName(user?.email) || "CEO";
  const company = extractBusinessName(steps) ?? "Mi empresa";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => router.push("/(app)/profile")}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={SemanticColors.textMuted} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText type="bodyMd" style={styles.greeting}>
            Hola, {greetingName}
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.company} numberOfLines={1}>
            {company}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsBtn}
        activeOpacity={0.7}
        onPress={() => router.push("/(app)/settings")}
        accessibilityLabel="Ajustes"
      >
        <Ionicons name="settings-outline" size={22} color={SemanticColors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    minHeight: 36,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
  },
  company: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 15,
    color: SemanticColors.textPrimary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
