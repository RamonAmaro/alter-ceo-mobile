import { CumulativeChart } from "@/components/my-plan/cumulative-chart";
import { PriorityItem } from "@/components/my-plan/priority-item";
import { RevenueChart } from "@/components/my-plan/revenue-chart";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface SalesSectionProps {
  target: number;
  projectionIntroduction?: string;
  monthlyProjection: number[];
  immediatePriorities: string[];
}

function formatEur(value: number): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
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
          colors={["rgba(0,255,132,0.1)", "rgba(0,192,238,0.05)", "rgba(0,0,0,0)"]}
          style={styles.targetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
            <PriorityItem key={i} text={p} index={i + 1} />
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
    color: "#00FF84",
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
    color: "rgba(255,255,255,0.6)",
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
