import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface MenuItemProps {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
}

export function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={icon} size={20} color={SemanticColors.iconMuted} />
      <ThemedText type="labelSm" style={styles.menuLabel}>
        {label}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    gap: Spacing.three,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
});
