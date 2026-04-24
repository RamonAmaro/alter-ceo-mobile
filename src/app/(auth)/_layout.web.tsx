import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, type DimensionValue } from "react-native";

import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

const TRANSPARENT_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" },
};

export default function AuthLayout() {
  const { isMobile } = useResponsiveLayout();

  const stack = (
    <ThemeProvider value={TRANSPARENT_THEME}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </ThemeProvider>
  );

  // Desktop web: AuthLayout component renders its own two-column layout with
  // its own ImageBackground on the form side — no need to wrap again.
  if (!isMobile) {
    return <View style={styles.fill}>{stack}</View>;
  }

  // Mobile web: wrap in ImageBackground here because the root navigation
  // DefaultTheme would otherwise paint a white background, and AppBackground.web
  // is a no-op passthrough (the native version of AppBackground is what normally
  // provides the image on iOS/Android).
  return (
    <ImageBackground
      source={require("@/assets/ui/app-background.png")}
      style={styles.background}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      {stack}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  image: {
    width: "100%" as DimensionValue,
    height: "100%" as DimensionValue,
  },
});
