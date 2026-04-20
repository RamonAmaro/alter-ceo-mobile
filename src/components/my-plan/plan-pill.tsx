import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PlanPillProps {
  label: string;
  accent?: boolean;
  uppercase?: boolean;
  withDot?: boolean;
}

export function PlanPill({
  label,
  accent = false,
  uppercase = false,
  withDot = false,
}: PlanPillProps) {
  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      {withDot ? <View style={[styles.dot, accent ? styles.dotAccent : styles.dotMuted]} /> : null}
      <ThemedText
        style={[styles.text, accent && styles.textAccent, uppercase && styles.textUppercase]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pillAccent: {
    backgroundColor: "rgba(0,255,132,0.1)",
    borderColor: "rgba(0,255,132,0.25)",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotMuted: {
    backgroundColor: SemanticColors.textMuted,
  },
  dotAccent: {
    backgroundColor: SemanticColors.success,
  },
  text: {
    color: SemanticColors.textSecondaryLight,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.montserratMedium,
  },
  textAccent: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratSemiBold,
  },
  textUppercase: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
});
