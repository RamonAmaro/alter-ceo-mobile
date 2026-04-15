import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppBackground } from "@/components/app-background";
import { KeyboardView } from "@/components/keyboard-view";
import { ResponsiveContainer } from "@/components/responsive-container";
import { Spacing } from "@/constants/theme";

interface ScreenLayoutProps {
  maxWidth?: number;
  withKeyboard?: boolean;
  paddingHorizontal?: number;
}

export function ScreenLayout({
  children,
  maxWidth = 480,
  withKeyboard = false,
  paddingHorizontal = Spacing.five,
}: PropsWithChildren<ScreenLayoutProps>): ReactNode {
  const content = <View style={[styles.container, { paddingHorizontal }]}>{children}</View>;

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={maxWidth}>
        {withKeyboard ? <KeyboardView>{content}</KeyboardView> : content}
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
