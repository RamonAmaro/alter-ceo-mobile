import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface StepDotsProps {
  total: number;
  active: number;
  hint?: string;
}

export function StepDots({ total, active, hint }: StepDotsProps) {
  const safeActive = Math.max(0, Math.min(total, active));
  const ticks = Array.from({ length: total }, (_, i) => i);

  return (
    <View style={styles.wrapper}>
      <View style={styles.indexRow}>
        <ThemedText style={styles.indexCurrent}>{String(safeActive).padStart(2, "0")}</ThemedText>
        <ThemedText style={styles.indexSeparator}>/</ThemedText>
        <ThemedText style={styles.indexTotal}>{String(total).padStart(2, "0")}</ThemedText>
      </View>

      <View style={styles.track}>
        {ticks.map((i) => {
          const isActive = i < safeActive;
          const isCurrent = i === safeActive - 1;
          return (
            <View
              key={i}
              style={[
                styles.tick,
                isActive ? styles.tickActive : styles.tickInactive,
                isCurrent && styles.tickCurrent,
              ]}
            />
          );
        })}
      </View>

      {hint ? (
        <ThemedText style={styles.hint} numberOfLines={1}>
          {hint.toUpperCase()}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: Spacing.two,
  },
  indexRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.one,
  },
  indexCurrent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 22,
    lineHeight: 24,
    color: SemanticColors.success,
    letterSpacing: -0.5,
  },
  indexSeparator: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 16,
    color: "rgba(255,255,255,0.35)",
  },
  indexTotal: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 16,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  tick: {
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  tickActive: {
    backgroundColor: SemanticColors.success,
  },
  tickInactive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  tickCurrent: {
    width: 32,
    height: 4,
  },
  hint: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.5,
    marginTop: Spacing.one,
  },
});
