import { ThemedText } from "@/components/themed-text";
import type { BusinessMemoryStep } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";
import { ProgressRing } from "@/components/ui/progress-ring";

interface MemoryOverviewCardProps {
  steps: readonly BusinessMemoryStep[];
}

const RING_SIZE = 118;

function computeOverallProgress(steps: readonly BusinessMemoryStep[]): number {
  if (steps.length === 0) return 0;
  const sum = steps.reduce((acc, s) => acc + s.progress, 0);
  return Math.round(sum / steps.length);
}

function countStarted(steps: readonly BusinessMemoryStep[]): number {
  return steps.filter((s) => s.progress > 0).length;
}

export function MemoryOverviewCard({ steps }: MemoryOverviewCardProps) {
  const overall = computeOverallProgress(steps);
  const started = countStarted(steps);
  const total = steps.length;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.10)", "rgba(42,240,225,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.info}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <ThemedText style={styles.eyebrow}>PANORAMA GENERAL</ThemedText>
        </View>
        <ThemedText style={styles.headline}>Tu territorio estratégico</ThemedText>
        <ThemedText style={styles.subhead}>
          {started} de {total} bloques activados
        </ThemedText>
      </View>

      <View style={styles.ringWrap}>
        <ProgressRing size={RING_SIZE} progress={overall} strokeWidth={3}>
          <View style={[styles.ringInner, { pointerEvents: "none" }]}>
            <View style={styles.ringRow}>
              <ThemedText style={styles.ringBig}>{overall}</ThemedText>
              <ThemedText style={styles.ringUnit}>%</ThemedText>
            </View>
            <ThemedText style={styles.ringCaption}>COMPLETADO</ThemedText>
          </View>
        </ProgressRing>
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    ...cardShadow,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: 2,
  },
  eyebrowDot: {
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
  headline: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    lineHeight: 24,
    color: SemanticColors.textPrimary,
    marginTop: 4,
  },
  subhead: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    marginTop: 6,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ringRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ringBig: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 34,
    lineHeight: 36,
    color: SemanticColors.success,
    letterSpacing: -1.5,
  },
  ringUnit: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    marginLeft: 2,
  },
  ringCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 8,
    lineHeight: 10,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
  },
});
