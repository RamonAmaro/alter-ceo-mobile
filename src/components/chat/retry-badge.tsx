import { memo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";

interface RetryBadgeProps {
  onRetry: () => void;
}

export const RetryBadge = memo(function RetryBadge({ onRetry }: RetryBadgeProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onRetry} activeOpacity={0.7}>
      <Ionicons name="refresh-outline" size={14} color="#FF6B6B" />
      <ThemedText type="caption" style={styles.text}>
        Error al enviar. Pulsa para reintentar
      </ThemedText>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  text: {
    color: "#FF6B6B",
  },
});
