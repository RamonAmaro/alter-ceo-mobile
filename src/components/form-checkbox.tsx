import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function FormCheckbox({ label, checked, onToggle }: FormCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.root}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Ionicons name="checkmark" size={14} color={SemanticColors.textPrimary} />
        ) : null}
      </View>
      <ThemedText type="bodySm" style={styles.label}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SemanticColors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: SemanticColors.accent,
    borderColor: SemanticColors.accent,
  },
  label: {
    fontFamily: Fonts.montserratMedium,
    color: SemanticColors.textPrimary,
  },
});
