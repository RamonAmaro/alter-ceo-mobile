import {
  ImageBackground,
  Platform,
  StyleSheet,
  type DimensionValue,
  type ViewProps,
} from "react-native";

interface AppBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

const imageStyle: Record<string, DimensionValue> | undefined =
  Platform.OS === "web" ? { width: "100%", height: "100%" } : undefined;

export function AppBackground({ children, style, ...rest }: AppBackgroundProps) {
  return (
    <ImageBackground
      source={require("@/assets/ui/app-background.png")}
      style={[styles.background, style]}
      imageStyle={imageStyle}
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
