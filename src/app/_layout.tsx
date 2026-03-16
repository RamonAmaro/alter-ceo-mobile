import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const checkBiometricsStatus = useAuthStore((s) => s.checkBiometricsStatus);
  const loadOnboarding = useOnboardingStore((s) => s.load);

  const [fontsLoaded] = useFonts({
    Montserrat: require("@/assets/fonts/Montserrat-VariableFont_wght.ttf"),
    "Nexa-Heavy": require("@/assets/fonts/Nexa-Heavy.ttf"),
    "TTOctosquares-Black": require("@/assets/fonts/TTOctosquares-Black.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      checkBiometricsStatus();
      loadOnboarding();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
