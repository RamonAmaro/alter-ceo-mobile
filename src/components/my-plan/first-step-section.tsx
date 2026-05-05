import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface FirstStepSectionProps {
  message: string;
  sectionNumber?: string;
}

export function FirstStepSection({ message, sectionNumber }: FirstStepSectionProps) {
  const trimmed = message?.trim();
  if (!trimmed) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="ACCIÓN · INMEDIATA"
        title="Primer paso para trabajar la mitad"
        sectionNumber={sectionNumber}
      />
      <ThemedText style={styles.text}>{trimmed}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  text: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
    paddingHorizontal: Spacing.one,
  },
});
