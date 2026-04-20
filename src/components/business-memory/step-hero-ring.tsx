import { ThemedText } from "@/components/themed-text";
import type { BusinessMemoryStep } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Platform, StyleSheet, View } from "react-native";
import { ProgressRing } from "./progress-ring";
import { StepIcon } from "./step-icon";

interface StepHeroRingProps {
  step: BusinessMemoryStep;
  index: number;
  total: number;
  size?: number;
  animate?: boolean;
}

const DEFAULT_SIZE = 220;
const ICON_RATIO = 0.36;

export function StepHeroRing({
  step,
  index,
  total,
  size = DEFAULT_SIZE,
  animate = true,
}: StepHeroRingProps) {
  const iconSize = Math.round(size * ICON_RATIO);
  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <View style={styles.wrapper}>
      <View style={styles.badge}>
        <View style={styles.accentDot} />
        <ThemedText style={styles.badgeText}>
          BLOQUE {indexLabel} · {totalLabel}
        </ThemedText>
      </View>

      <ProgressRing size={size} progress={step.completion_pct} strokeWidth={3} animate={animate}>
        <View style={styles.iconLayer} pointerEvents="none">
          <StepIcon config={step.icon} size={iconSize} color="rgba(255,255,255,0.10)" />
        </View>
        <View style={styles.labelStack} pointerEvents="none">
          <ThemedText style={styles.percent}>{step.completion_pct}</ThemedText>
          <ThemedText style={styles.percentUnit}>% COMPLETADO</ThemedText>
        </View>
      </ProgressRing>
    </View>
  );
}

const badgeShadow = Platform.select({
  ios: {
    shadowColor: SemanticColors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 0 12px rgba(0,255,132,0.35)" },
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: Spacing.three,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
    ...badgeShadow,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  badgeText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 2.2,
  },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  labelStack: {
    alignItems: "center",
    gap: 2,
    position: "absolute",
    bottom: "22%",
  },
  percent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 54,
    lineHeight: 58,
    color: SemanticColors.success,
    letterSpacing: -2,
  },
  percentUnit: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
});
