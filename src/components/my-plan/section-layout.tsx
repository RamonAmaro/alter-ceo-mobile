import { Spacing } from "@/constants/theme";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

const SECTION_GAP = Platform.OS === "web" ? Spacing.six : Spacing.five;

export function SectionBlock({ children }: { children: ReactNode }) {
  return <View style={styles.block}>{children}</View>;
}

export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: SECTION_GAP,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: SECTION_GAP,
  },
});
