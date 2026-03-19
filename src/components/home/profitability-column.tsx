import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";

export function ProfitabilityColumn() {
  return (
    <View style={styles.column}>
      <GlassCard style={styles.card}>
        <ThemedText type="bodySm" style={styles.label}>Rentabilidad</ThemedText>
        <ThemedText type="bodySm" style={styles.sub}>actual</ThemedText>
        <ThemedText type="headingMd" style={styles.value}>1.000.500 €</ThemedText>
      </GlassCard>
      <GlassCard style={styles.card}>
        <ThemedText type="bodySm" style={styles.label}>Rentabilidad</ThemedText>
        <ThemedText type="bodySm" style={styles.estimated}>estimada 2026</ThemedText>
        <ThemedText type="headingMd" style={styles.value}>1.000.500 €</ThemedText>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 0.9,
    gap: Spacing.three,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
  },
  label: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  estimated: {
    fontSize: 10,
    color: "#00FF84",
    fontWeight: "bold",
  },
  value: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 18,
    color: "#ffffff",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
