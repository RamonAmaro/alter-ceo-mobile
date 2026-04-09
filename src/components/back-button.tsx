import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface BackButtonProps extends TouchableOpacityProps {
  label?: string;
}

export function BackButton({ label = "Volver", style, ...rest }: BackButtonProps) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={() => router.back()} {...rest}>
      <Ionicons
        name="arrow-back"
        size={20}
        color={SemanticColors.textPrimary}
        style={styles.icon}
      />
      <ThemedText type="labelSm" style={styles.label}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  icon: {
    marginRight: Spacing.two,
  },
  label: {
    color: SemanticColors.textPrimary,
  },
});
