import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";

export function ProfitabilityColumn() {
  return (
    <GlassCard style={styles.card} outerStyle={styles.outer}>
      <View style={styles.section}>
        <ThemedText type="caption" style={styles.label}>
          RENTABILIDAD
        </ThemedText>
        <ThemedText type="caption" style={styles.sub}>
          actual
        </ThemedText>
        <ThemedText type="headingMd" style={styles.value}>
          1.000.500$
        </ThemedText>
      </View>

      <View style={styles.separatorWrap}>
        <LinearGradient
          colors={["#00EFDE", "#CCFF00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.separator}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.label}>
          RENTABILIDAD
        </ThemedText>
        <ThemedText type="caption" style={styles.estimated}>
          estimada 2026
        </ThemedText>
        <ThemedText type="headingMd" style={styles.value}>
          1.000.500$
        </ThemedText>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: Spacing.two,
    justifyContent: "space-evenly",
  },
  section: {},
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    color: SemanticColors.textMuted,
    letterSpacing: 0.5,
  },
  sub: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    color: SemanticColors.textMuted,
  },
  estimated: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    color: SemanticColors.success,
  },
  separatorWrap: {
    marginVertical: 2,
  },
  separator: {
    height: 3,
    borderRadius: 1.5,
  },
  value: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    color: SemanticColors.textPrimary,
    marginTop: 2,
  },
});
