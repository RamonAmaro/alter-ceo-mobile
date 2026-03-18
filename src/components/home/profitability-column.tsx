import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard } from "./glass-card";

export function ProfitabilityColumn() {
  return (
    <View style={styles.column}>
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Rentabilidad</Text>
        <Text style={styles.sub}>actual</Text>
        <Text style={styles.value}>1.000.500 €</Text>
      </GlassCard>
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Rentabilidad</Text>
        <Text style={styles.estimated}>estimada 2026</Text>
        <Text style={styles.value}>1.000.500 €</Text>
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
    fontFamily: Fonts.montserrat,
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sub: {
    fontFamily: Fonts.montserrat,
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
  estimated: {
    fontFamily: Fonts.montserrat,
    fontSize: 10,
    fontWeight: "700",
    color: "#00FF84",
  },
  value: {
    fontFamily: Fonts.montserrat,
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
