import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

interface KeyboardViewProps {
  keyboardVerticalOffset?: number;
}

export function KeyboardView({
  children,
  keyboardVerticalOffset = 0,
}: PropsWithChildren<KeyboardViewProps>) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
