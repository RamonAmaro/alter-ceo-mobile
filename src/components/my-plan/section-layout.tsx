import { Spacing } from "@/constants/theme";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

const SECTION_GAP = Platform.OS === "web" ? Spacing.four : Spacing.three;

export function SectionBlock({ children }: { children: ReactNode }) {
  return <View style={styles.block}>{children}</View>;
}

// Divider removed: section-header now provides its own visual frame.
// Kept as a no-op to avoid breaking imports during transition.
export function SectionDivider() {
  return null;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: SECTION_GAP,
  },
});
