import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { initAuthCookie } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const checkBiometricsStatus = useAuthStore((s) => s.checkBiometricsStatus);
  const checkSession = useAuthStore((s) => s.checkSession);
  const loadOnboarding = useOnboardingStore((s) => s.load);

  const [fontsLoaded] = useFonts({
    "Montserrat-Light": Montserrat_300Light,
    "Montserrat-Regular": Montserrat_400Regular,
    "Montserrat-Medium": Montserrat_500Medium,
    "Montserrat-SemiBold": Montserrat_600SemiBold,
    "Montserrat-Bold": Montserrat_700Bold,
    "Montserrat-ExtraBold": Montserrat_800ExtraBold,
    "Nexa-Heavy": require("@/assets/fonts/Nexa-Heavy.ttf"),
    "TTOctosquares-Black": require("@/assets/fonts/TTOctosquares-Black.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    async function init() {
      await initAuthCookie();
      await checkSession();
      checkBiometricsStatus();
      await loadOnboarding();
      await SplashScreen.hideAsync();
    }

    void init();
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
