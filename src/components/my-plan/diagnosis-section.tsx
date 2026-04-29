import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface DiagnosisSectionProps {
  introduction: string;
}

export function DiagnosisSection({ introduction }: DiagnosisSectionProps) {
  const trimmedIntro = introduction?.trim();
  if (!trimmedIntro) return null;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="ESTADO · ACTUAL" title="Diagnóstico estratégico" />
      <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText>
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
    color: "rgba(255,255,255,0.78)",
    paddingHorizontal: Spacing.one,
  },
});
