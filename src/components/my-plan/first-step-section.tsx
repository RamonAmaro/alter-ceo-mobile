import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface FirstStepSectionProps {
  message: string;
}

export function FirstStepSection({ message }: FirstStepSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader title="Primer paso para trabajar la mitad" />

      <View style={styles.card}>
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
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#00FF84",
  },
  text: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 24,
    fontSize: 14,
    fontFamily: Fonts.montserratMedium,
  },
});
