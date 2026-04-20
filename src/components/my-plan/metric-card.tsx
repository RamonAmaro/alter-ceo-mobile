import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
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
  Normal: SemanticColors.textSecondaryLight,
};

function resolveColor(value?: string): string {
  if (!value) return "rgba(255,255,255,0.45)";
  return STATUS_COLORS[value] ?? SemanticColors.textSecondaryLight;
}

interface MetricCardProps {
  label: string;
  value?: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  const color = resolveColor(value);
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <ThemedText style={styles.label} numberOfLines={1}>
          {label}
        </ThemedText>
      </View>
      <ThemedText style={[styles.value, { color }]}>{value ?? "—"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accent: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  value: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
});
