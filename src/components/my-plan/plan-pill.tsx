import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PlanPillProps {
  label: string;
  accent?: boolean;
}

export function PlanPill({ label, accent = false }: PlanPillProps) {
  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      <ThemedText type="caption" style={[styles.text, accent && styles.textAccent]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillAccent: {
    backgroundColor: "rgba(0,255,132,0.1)",
    borderColor: "rgba(0,255,132,0.25)",
  },
  text: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
  },
  textAccent: {
    color: SemanticColors.success,
  },
});
