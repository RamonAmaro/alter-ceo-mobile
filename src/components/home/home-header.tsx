import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function HomeHeader() {
  const router = useRouter();

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
        <View>
          <ThemedText type="bodyMd" style={styles.greeting}>
            Hola, (Nombre)
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.company}>
            (Nombre de Empresa)
          </ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bellBtn}
        activeOpacity={0.7}
        onPress={() => router.push("/(app)/my-plan")}
      >
        <Ionicons name="notifications-outline" size={19} color={SemanticColors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textSecondaryLight,
  },
  company: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textPrimary,
  },
  bellBtn: {
    padding: Spacing.one,
  },
});
