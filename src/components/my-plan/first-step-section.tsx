import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface FirstStepSectionProps {
  message: string;
}

export function FirstStepSection({ message }: FirstStepSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader title="Primer paso para trabajar la mitad" />

      <View style={styles.card}>
        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Ionicons name="footsteps-outline" size={18} color="#00FF84" />
          </View>
          <ThemedText type="caption" style={styles.badge}>
            Acción inmediata
          </ThemedText>
        </View>
        <ThemedText type="bodyMd" style={styles.text}>
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: Spacing.three,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,255,132,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    color: "#00FF84",
    fontSize: 11,
    fontFamily: Fonts.montserratBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  text: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 24,
    fontSize: 14,
    fontFamily: Fonts.montserratMedium,
  },
});
