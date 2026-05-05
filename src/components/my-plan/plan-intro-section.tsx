import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PlanIntroSectionProps {
  introduction?: string;
  sectionNumber?: string;
}

export function PlanIntroSection({ introduction, sectionNumber }: PlanIntroSectionProps) {
  const trimmed = introduction?.trim();
  if (!trimmed) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="RESUMEN · DEL NEGOCIO"
        title="Tu negocio hoy"
        sectionNumber={sectionNumber}
      />
      <ThemedText style={styles.intro}>{trimmed}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  intro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
    paddingHorizontal: Spacing.one,
  },
});
