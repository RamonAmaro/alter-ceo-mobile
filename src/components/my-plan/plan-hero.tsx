import { PlanPill } from "@/components/my-plan/plan-pill";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import { StyleSheet, View } from "react-native";

interface PlanHeroProps {
  introduction: string;
  sector?: string;
  annualRevenue?: number;
}

export function PlanHero({ introduction, sector, annualRevenue }: PlanHeroProps) {
  const revenueLabel = annualRevenue ? `${formatEur(annualRevenue)}/año` : null;
  const hasPills = Boolean(sector || revenueLabel);

  return (
    <View style={styles.container}>
      <SectionHeader title="Tu plan estratégico" />

      {hasPills && (
        <View style={styles.pills}>
          {sector && <PlanPill label={sector} />}
          {revenueLabel && <PlanPill label={revenueLabel} accent />}
        </View>
      )}

      <View style={styles.introCard}>
        <ThemedText type="bodyMd" style={styles.intro}>
          {introduction}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  pills: {
    flexDirection: "row",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  introCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  intro: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 24,
    fontSize: 14,
    fontFamily: Fonts.montserratMedium,
  },
});
