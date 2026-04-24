import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import { StyleSheet, View } from "react-native";
import { PlanPill } from "./plan-pill";

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
      <GlassCard tone="emerald" padding={Spacing.four} radius={24}>
        <MonumentalIndex label="PLAN" size={180} opacity={0.05} right={-26} bottom={-42} />

        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <ThemedText style={styles.eyebrow}>TU PLAN · ESTRATÉGICO</ThemedText>
        </View>

        <ThemedText style={styles.title}>
          Situación <ThemedText style={styles.titleAccent}>Actual</ThemedText>
        </ThemedText>

        {hasPills ? (
          <View style={styles.pills}>
            {sector ? <PlanPill label={sector} withDot /> : null}
            {revenueLabel ? <PlanPill label={revenueLabel} accent withDot /> : null}
          </View>
        ) : null}

        <View style={styles.divider} />

        <ThemedText style={styles.intro}>{introduction}</ThemedText>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    marginTop: Spacing.two,
  },
  titleAccent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.success,
    letterSpacing: -0.6,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,255,132,0.15)",
    marginVertical: Spacing.three,
  },
  intro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
  },
});
