import { ImageBackground, StyleSheet, type ViewProps } from "react-native";

interface AppBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function AppBackground({ children, style, ...rest }: AppBackgroundProps) {
  return (
    <ImageBackground
      source={require("@/assets/ui/app-background.png")}
      style={[styles.background, style]}
      resizeMode="cover"
      {...rest}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
