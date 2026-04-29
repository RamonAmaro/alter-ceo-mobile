import { BusinessSummary } from "@/components/my-plan/business-summary";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import type { PlanBusinessSummary } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface DiagnosisSectionProps {
  introduction?: string;
  summary?: PlanBusinessSummary | null;
}

export function DiagnosisSection({ introduction, summary }: DiagnosisSectionProps) {
  const trimmedIntro = introduction?.trim();

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="ESTADO · ACTUAL" title="Diagnóstico estratégico" />
      {trimmedIntro ? <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText> : null}
      <BusinessSummary summary={summary} />
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
