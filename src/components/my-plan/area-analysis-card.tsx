import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface AreaAnalysisCardProps {
  label: string;
  value: string;
}

export function AreaAnalysisCard({ label, value }: AreaAnalysisCardProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.title}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,255,132,0.45)",
    gap: 6,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  value: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
});
