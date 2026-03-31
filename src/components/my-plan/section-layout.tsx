import { Spacing } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function SectionBlock({ children }: { children: ReactNode }) {
  return <View style={styles.block}>{children}</View>;
}

export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.five,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: Spacing.five,
  },
});
