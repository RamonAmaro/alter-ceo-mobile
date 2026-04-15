import type { PropsWithChildren } from "react";
import { StyleSheet, View, type DimensionValue, type ViewStyle } from "react-native";

import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface ResponsiveContainerProps {
  maxWidth?: number;
  style?: ViewStyle;
}

export function ResponsiveContainer({
  children,
  maxWidth = 480,
  style,
}: PropsWithChildren<ResponsiveContainerProps>) {
  const { isMobile } = useResponsiveLayout();

  if (isMobile) {
    return <View style={[styles.fill, style]}>{children}</View>;
  }

  return (
    <View style={[styles.fill, styles.center, style]}>
      <View style={[styles.fill, { maxWidth, width: "100%" as DimensionValue }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    alignItems: "center",
  },
});
