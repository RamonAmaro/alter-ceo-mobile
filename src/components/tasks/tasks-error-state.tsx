import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface TasksErrorStateProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function TasksErrorState({ message, onRetry }: TasksErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="alert-circle-outline" size={32} color={SemanticColors.error} />
      <ThemedText style={styles.text}>{message}</ThemedText>
      <TouchableOpacity
        onPress={onRetry}
        style={styles.btn}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
      >
        <Ionicons name="refresh" size={14} color={SemanticColors.success} />
        <ThemedText style={styles.btnLabel}>Reintentar</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    gap: Spacing.two,
  },
  text: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  btnLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 0.4,
  },
});
