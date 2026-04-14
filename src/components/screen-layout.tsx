import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { KeyboardView } from "@/components/keyboard-view";
import { Spacing } from "@/constants/theme";

interface ScreenLayoutProps {
  withKeyboard?: boolean;
  paddingHorizontal?: number;
}

export function ScreenLayout({
  children,
  withKeyboard = false,
  paddingHorizontal = Spacing.five,
}: PropsWithChildren<ScreenLayoutProps>): ReactNode {
  const content = <View style={[styles.container, { paddingHorizontal }]}>{children}</View>;

  return withKeyboard ? <KeyboardView>{content}</KeyboardView> : content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
