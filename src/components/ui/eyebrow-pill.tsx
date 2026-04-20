import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface EyebrowPillProps {
  label: string;
  align?: "center" | "flex-start";
  tone?: "default" | "muted";
}

export function EyebrowPill({ label, align = "center", tone = "default" }: EyebrowPillProps) {
  return (
    <View style={[styles.pill, { alignSelf: align }]}>
      <View style={[styles.dot, tone === "muted" ? styles.dotMuted : null]} />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  dotMuted: {
    backgroundColor: SemanticColors.textMuted,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.4,
  },
});
