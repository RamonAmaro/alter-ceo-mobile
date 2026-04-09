import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";

interface AudioRecorderHeaderProps {
  planLabel: string;
  onBack: () => void;
}

export function AudioRecorderHeader({
  planLabel,
  onBack,
}: AudioRecorderHeaderProps): React.ReactElement {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={22} color={SemanticColors.textPrimary} />
      </TouchableOpacity>
      <ThemedText type="labelMd" style={styles.headerLabel}>
        {planLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  headerLabel: {
    color: SemanticColors.textPrimary,
  },
});
