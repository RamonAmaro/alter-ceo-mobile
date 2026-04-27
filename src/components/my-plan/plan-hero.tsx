import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { TeamSizeRange } from "@/types/api";
import { formatEur } from "@/utils/format-currency";
import { StyleSheet, View } from "react-native";
import { PlanPill } from "./plan-pill";

interface PlanHeroProps {
  introduction: string;
  sector?: string;
  annualRevenue?: number;
  monthlyRevenue?: number;
  teamSizeRange?: TeamSizeRange;
  numeroPersonasEquipo?: number;
  productosServicios?: string;
}

const TEAM_SIZE_LABEL: Record<TeamSizeRange, string> = {
  no_business: "Aún sin negocio",
  solo: "Autónomo",
  "1_3": "1–3 personas",
  "4_10": "4–10 personas",
  "11_30": "11–30 personas",
  "30_60": "30–60 personas",
  "60_100": "60–100 personas",
  "100_plus": "Más de 100",
};

function formatTeamSize(range?: TeamSizeRange, exact?: number): string | null {
  if (range) return TEAM_SIZE_LABEL[range];
  if (typeof exact === "number" && exact >= 0) {
    return exact === 1 ? "1 persona" : `${exact} personas`;
  }
  return null;
}

export function PlanHero({
  introduction,
  sector,
  annualRevenue,
  monthlyRevenue,
  teamSizeRange,
  numeroPersonasEquipo,
  productosServicios,
}: PlanHeroProps) {
  const annualLabel = annualRevenue ? `${formatEur(annualRevenue)}/año` : null;
  const monthlyLabel = monthlyRevenue ? `${formatEur(monthlyRevenue)}/mes` : null;
  const teamLabel = formatTeamSize(teamSizeRange, numeroPersonasEquipo);
  const hasPills = Boolean(sector || annualLabel || monthlyLabel || teamLabel);

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
            {monthlyLabel ? <PlanPill label={monthlyLabel} accent withDot /> : null}
            {annualLabel ? <PlanPill label={annualLabel} accent withDot /> : null}
            {teamLabel ? <PlanPill label={teamLabel} withDot /> : null}
          </View>
        ) : null}

        {productosServicios ? (
          <ThemedText style={styles.products}>{productosServicios}</ThemedText>
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
  products: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
    marginTop: Spacing.three,
  },
});
