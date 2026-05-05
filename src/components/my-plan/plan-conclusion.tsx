import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PlanConclusionProps {
  text?: string;
  sectionNumber?: string;
}

export function PlanConclusion({ text, sectionNumber }: PlanConclusionProps) {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="CIERRE · DEL PLAN" title="Conclusión" sectionNumber={sectionNumber} />
      <ThemedText style={styles.body}>{trimmed}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  body: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
    paddingHorizontal: Spacing.one,
  },
});
