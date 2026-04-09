import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

interface KeyboardViewProps {
  keyboardVerticalOffset?: number;
}

export function KeyboardView({ children }: PropsWithChildren<KeyboardViewProps>) {
  return <View style={styles.flex}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
