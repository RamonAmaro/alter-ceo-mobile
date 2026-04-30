import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface TaskFabProps {
  readonly onPress: () => void;
  readonly bottomOffset: number;
}

export function TaskFab({ onPress, bottomOffset }: TaskFabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.fab, fabShadow, { bottom: bottomOffset }]}
      accessibilityRole="button"
      accessibilityLabel="Nueva tarea"
    >
      <Ionicons name="add" size={18} color={SemanticColors.onSuccess} />
      <ThemedText style={styles.label}>Nueva tarea</ThemedText>
    </TouchableOpacity>
  );
}

const fabShadow = Platform.select({
  ios: {
    shadowColor: SemanticColors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 8px 22px rgba(0,255,132,0.30)" },
});

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: SemanticColors.success,
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.onSuccess,
    letterSpacing: 0.3,
  },
});
