import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface PlanFinalActionsProps {
  onAccept: () => void;
  onModify: () => void;
  acceptLoading?: boolean;
}

export function PlanFinalActions({ onAccept, onModify, acceptLoading }: PlanFinalActionsProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.helper}>¿Qué quieres hacer con este plan?</ThemedText>

      <Button label="Aceptar plan" onPress={onAccept} loading={acceptLoading} />

      <TouchableOpacity
        style={styles.secondary}
        activeOpacity={0.7}
        onPress={onModify}
        accessibilityRole="button"
      >
        <ThemedText style={styles.secondaryLabel}>Modificar plan</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  helper: {
    fontFamily: Fonts.montserratMedium,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    textAlign: "center",
  },
  secondary: {
    width: 278,
    height: 43,
    borderRadius: 98,
    borderWidth: 1.5,
    borderColor: SemanticColors.success,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  secondaryLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.success,
    letterSpacing: 0.4,
  },
});
