import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";
import { ProgressRing } from "./progress-ring";

interface HeroOverviewCardProps {
  eyebrow: string;
  headline: string;
  subhead?: string;
  progress?: number;
  ringCenter?: ReactNode;
  ringSize?: number;
}

const DEFAULT_RING_SIZE = 118;

export function HeroOverviewCard({
  eyebrow,
  headline,
  subhead,
  progress,
  ringCenter,
  ringSize = DEFAULT_RING_SIZE,
}: HeroOverviewCardProps) {
  const showRing = progress !== undefined;

  return (
    <GlassCard tone="emerald" padding={Spacing.four} radius={24}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.eyebrowRow}>
            <View style={styles.dot} />
            <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
          </View>
          <ThemedText style={styles.headline}>{headline}</ThemedText>
          {subhead ? <ThemedText style={styles.subhead}>{subhead}</ThemedText> : null}
        </View>

        {showRing ? (
          <View style={styles.ringWrap}>
            <ProgressRing size={ringSize} progress={progress} strokeWidth={3}>
              {ringCenter ?? <DefaultRingCenter progress={progress} />}
            </ProgressRing>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

function DefaultRingCenter({ progress }: { progress: number }) {
  return (
    <View style={[styles.ringInner, { pointerEvents: "none" }]}>
      <View style={styles.ringRow}>
        <ThemedText style={styles.ringBig}>{progress}</ThemedText>
        <ThemedText style={styles.ringUnit}>%</ThemedText>
      </View>
      <ThemedText style={styles.ringCaption}>COMPLETADO</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
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
