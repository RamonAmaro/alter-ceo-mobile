import { Spacing } from "@/constants/theme";
import { type JSX, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FooterActionBarProps {
  children: ReactNode;
}

export function FooterActionBar({ children }: FooterActionBarProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
