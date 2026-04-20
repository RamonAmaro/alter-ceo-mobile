import { CumulativeChart } from "@/components/my-plan/cumulative-chart";
import { PriorityItem } from "@/components/my-plan/priority-item";
import { RevenueChart } from "@/components/my-plan/revenue-chart";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

const GRADIENT_COLORS: [string, string, string] = [
  "rgba(0,255,132,0.12)",
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
      <SectionHeader eyebrow="PROYECCIÓN · 12 MESES" title="Plan de" accent="ventas" />

      <View style={styles.targetCard}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          style={styles.targetGradient}
          start={GRADIENT_START}
          end={GRADIENT_END}
        >
          <MonumentalIndex label="12M" size={140} opacity={0.06} right={-10} bottom={-28} />

          <View style={styles.targetHeader}>
            <View style={styles.targetDot} />
            <ThemedText style={styles.targetCaption}>OBJETIVO · 12 MESES</ThemedText>
          </View>

          <ThemedText style={styles.targetValue} numberOfLines={1}>
            {targetLabel}
          </ThemedText>
        </LinearGradient>
      </View>

      {monthlyProjection.length > 0 && (
        <>
          <View style={styles.chartBlock}>
            <View style={styles.captionRow}>
              <View style={styles.captionBar} />
              <ThemedText style={styles.blockCaption}>PROYECCIÓN MENSUAL</ThemedText>
            </View>
            {projectionIntroduction && (
              <ThemedText style={styles.chartIntro}>{projectionIntroduction}</ThemedText>
            )}
            <View style={styles.chartWrapper}>
              <RevenueChart values={monthlyProjection} />
            </View>
          </View>

          <View style={styles.chartBlock}>
            <View style={styles.captionRow}>
              <View style={styles.captionBar} />
              <ThemedText style={styles.blockCaption}>ACUMULADO · 12 MESES</ThemedText>
            </View>
            <View style={styles.chartWrapper}>
              <CumulativeChart values={monthlyProjection} />
            </View>
          </View>
        </>
      )}

      {immediatePriorities.length > 0 && (
        <View style={styles.prioritiesBlock}>
          <View style={styles.captionRow}>
            <View style={styles.captionBar} />
            <ThemedText style={styles.blockCaption}>PRIORIDADES · 30 DÍAS</ThemedText>
          </View>
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  targetGradient: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  targetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  targetDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  targetCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.2,
  },
  targetValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 38,
    lineHeight: 46,
    color: SemanticColors.success,
    letterSpacing: -1.4,
    marginTop: Spacing.one,
  },
  chartBlock: {
    gap: Spacing.two,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  captionBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  blockCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
  chartIntro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.iconMuted,
  },
  chartWrapper: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  prioritiesBlock: {
    gap: Spacing.three,
  },
});
