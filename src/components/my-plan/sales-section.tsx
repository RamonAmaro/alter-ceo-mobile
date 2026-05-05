import { PriorityItem } from "@/components/my-plan/priority-item";
import { RevenueChart } from "@/components/my-plan/revenue-chart";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface SalesSectionProps {
  target: number;
  projectionIntroduction?: string;
  monthlyProjection: number[];
  immediatePriorities: string[];
  sectionNumber?: string;
}

export function SalesSection({
  target,
  projectionIntroduction,
  monthlyProjection,
  immediatePriorities,
  sectionNumber,
}: SalesSectionProps) {
  const hasTarget = typeof target === "number" && target > 0;
  const validProjection = monthlyProjection.filter((v) => typeof v === "number" && v > 0);
  const cleanPriorities = immediatePriorities.map((p) => p.trim()).filter(Boolean);
  const trimmedIntro = projectionIntroduction?.trim();

  if (!hasTarget && validProjection.length === 0 && cleanPriorities.length === 0 && !trimmedIntro) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="PROYECCIÓN · 12 MESES"
        title="Evolución de ventas"
        sectionNumber={sectionNumber}
      />

      {hasTarget ? (
        <View style={styles.targetCard}>
          <LinearGradient
            colors={["rgba(0,255,132,0.14)", "rgba(0,192,238,0.04)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <ThemedText style={styles.targetCaption}>Objetivo a 12 meses</ThemedText>
          <ThemedText style={styles.targetValue} numberOfLines={1}>
            {formatEur(target)}
          </ThemedText>
        </View>
      ) : null}

      {trimmedIntro ? <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText> : null}

      {validProjection.length > 0 ? <RevenueChart values={monthlyProjection} /> : null}

      {cleanPriorities.length > 0 ? (
        <View style={styles.prioritiesBlock}>
          <ThemedText style={styles.blockCaption}>Prioridades · 30 días</ThemedText>
          {cleanPriorities.map((p, i) => (
            <PriorityItem key={`priority-${i}`} text={p} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  targetCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    gap: 4,
    overflow: "hidden",
  },
  targetCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.55)",
  },
  targetValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.success,
    letterSpacing: -0.6,
  },
  intro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.72)",
    paddingHorizontal: Spacing.one,
  },
  prioritiesBlock: {
    gap: Spacing.two,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  blockCaption: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    marginBottom: 2,
  },
});
