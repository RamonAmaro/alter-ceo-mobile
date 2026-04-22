import { useAuthStore } from "@/stores/auth-store";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, type DimensionValue } from "react-native";

const MAX_WIDTH = 900;

const TRANSPARENT_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" },
};

export default function OnboardingLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ImageBackground
      source={require("@/assets/ui/app-background.png")}
      style={styles.background}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <View style={styles.webConstraint}>
        <ThemeProvider value={TRANSPARENT_THEME}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </ThemeProvider>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    width: "100%" as DimensionValue,
    height: "100%" as DimensionValue,
  },
  webConstraint: {
    flex: 1,
    width: "100%" as DimensionValue,
    maxWidth: MAX_WIDTH,
    marginHorizontal: "auto",
  },
});
