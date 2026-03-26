import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

const STATUS_COLORS: Record<string, string> = {
  Ajustada: "#FF9500",
  Inexistentes: "#FF4444",
  Reactiva: "#FF9500",
  Alto: "#FF4444",
  Crítica: "#FF4444",
  Bajo: "#00FF84",
  Moderado: "#FF9500",
  Buena: "#00FF84",
  Sólida: "#00FF84",
  Normal: "rgba(255,255,255,0.7)",
};

function resolveColor(value?: string): string {
  if (!value) return "rgba(255,255,255,0.45)";
  return STATUS_COLORS[value] ?? "rgba(255,255,255,0.7)";
}

interface MetricCardProps {
  label: string;
  value?: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  const color = resolveColor(value);
  return (
    <View style={styles.card}>
      <ThemedText type="caption" style={styles.label}>{label}</ThemedText>
      <ThemedText type="labelSm" style={[styles.value, { color }]}>
        {value ?? "—"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: Spacing.one,
  },
  label: {
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  value: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
  },
});
