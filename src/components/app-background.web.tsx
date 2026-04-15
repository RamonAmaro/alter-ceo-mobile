import { StyleSheet, View, type ViewProps } from "react-native";

interface AppBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function AppBackground({ children, style, ...rest }: AppBackgroundProps) {
  return (
    <View style={[styles.background, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
