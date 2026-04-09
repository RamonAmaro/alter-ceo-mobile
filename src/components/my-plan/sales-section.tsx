import { CumulativeChart } from "@/components/my-plan/cumulative-chart";
import { PriorityItem } from "@/components/my-plan/priority-item";
import { RevenueChart } from "@/components/my-plan/revenue-chart";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

const GRADIENT_COLORS: [string, string, string] = [
  "rgba(0,255,132,0.1)",
  "rgba(0,192,238,0.05)",
  "rgba(0,0,0,0)",
];
const GRADIENT_START = { x: 0, y: 0 } as const;
const GRADIENT_END = { x: 1, y: 1 } as const;

interface SalesSectionProps {
  target: number;
  projectionIntroduction?: string;
  monthlyProjection: number[];
  immediatePriorities: string[];
}

export function SalesSection({
  target,
  projectionIntroduction,
  monthlyProjection,
  immediatePriorities,
}: SalesSectionProps) {
  const targetLabel = formatEur(target);

  return (
    <View style={styles.container}>
      <SectionHeader title="Plan de ventas" />

      <View style={styles.targetCard}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          style={styles.targetGradient}
          start={GRADIENT_START}
          end={GRADIENT_END}
        >
          <ThemedText type="caption" style={styles.targetCaption}>
            OBJETIVO A 12 MESES
          </ThemedText>
          <ThemedText type="headingLg" style={styles.targetValue}>
            {targetLabel}
          </ThemedText>
        </LinearGradient>
      </View>

      {monthlyProjection.length > 0 && (
        <>
          <View style={styles.chartBlock}>
            <ThemedText type="caption" style={styles.blockCaption}>
              PROYECCIÓN MENSUAL
            </ThemedText>
            {projectionIntroduction && (
              <ThemedText type="bodyMd" style={styles.chartIntro}>
                {projectionIntroduction}
              </ThemedText>
            )}
            <View style={styles.chartWrapper}>
              <RevenueChart values={monthlyProjection} />
            </View>
          </View>

          <View style={styles.chartBlock}>
            <ThemedText type="caption" style={styles.blockCaption}>
              ACUMULADO A 12 MESES
            </ThemedText>
            <View style={styles.chartWrapper}>
              <CumulativeChart values={monthlyProjection} />
            </View>
          </View>
        </>
      )}

      {immediatePriorities.length > 0 && (
        <View style={styles.prioritiesBlock}>
          <ThemedText type="caption" style={styles.blockCaption}>
            PRIORIDADES INMEDIATAS — 30 DÍAS
          </ThemedText>
          {immediatePriorities.map((p, i) => (
            <PriorityItem key={`priority-${i}`} text={p} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  targetCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    overflow: "hidden",
  },
  targetGradient: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  targetCaption: {
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.2,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  targetValue: {
    color: SemanticColors.success,
    fontSize: 36,
    lineHeight: 46,
    fontFamily: Fonts.montserratExtraBold,
  },
  chartBlock: {
    gap: Spacing.two,
  },
  blockCaption: {
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  chartIntro: {
    color: SemanticColors.iconMuted,
    lineHeight: 22,
    fontSize: 13,
  },
  chartWrapper: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  prioritiesBlock: {
    gap: Spacing.three,
  },
});
