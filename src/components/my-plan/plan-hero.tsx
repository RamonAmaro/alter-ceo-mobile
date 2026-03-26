import { PlanPill } from "@/components/my-plan/plan-pill";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PlanHeroProps {
  introduction: string;
  sector?: string;
  annualRevenue?: number;
}

function formatRevenue(value: number): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function PlanHero({ introduction, sector, annualRevenue }: PlanHeroProps) {
  const revenueLabel = annualRevenue ? `${formatRevenue(annualRevenue)}/año` : null;
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

      <ThemedText type="bodyLg" style={styles.intro}>
        {introduction}
      </ThemedText>
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
  intro: {
    color: "rgba(255,255,255,0.8)",
    lineHeight: 26,
    fontFamily: Fonts.montserratMedium,
  },
});
