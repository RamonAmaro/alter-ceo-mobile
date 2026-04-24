import { KeyboardProvider } from "@/components/keyboard-provider";
import { NetworkStatusOverlay } from "@/components/network-status-overlay";
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { hasStoredSessionCookie, initAuthCookie } from "@/services/auth-service";
import { checkAndApplyUpdate } from "@/services/updates-service";
import { useAuthStore } from "@/stores/auth-store";
import { useDebugStore } from "@/stores/debug-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getLastAuthenticatedUserId } from "@/utils/clear-user-data";
import { injectWebStyles } from "@/utils/inject-web-styles";

injectWebStyles();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const checkBiometricsStatus = useAuthStore((s) => s.checkBiometricsStatus);
  const checkSession = useAuthStore((s) => s.checkSession);
  const loadDebugState = useDebugStore((s) => s.load);
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
      try {
        await Promise.all([loadDebugState(), loadOnboarding()]);
        await initAuthCookie();
        // Bootstrap optimistically from the stored cookie (no network call) so
        // the first paint after the splash already routes correctly. The
        // /auth/session validation then runs in the background — no artificial
        // timeout, network errors don't kick the user out. We also restore the
        // last known userId so screens that read user?.userId during the
        // bootstrap window do not race against an undefined id.
        const [hasCookie, lastUserId] = await Promise.all([
          hasStoredSessionCookie(),
          getLastAuthenticatedUserId(),
        ]);
        useAuthStore.getState().applyOptimisticBootstrap(hasCookie, lastUserId);
        void checkSession();
        void checkBiometricsStatus();
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    void init();
    void checkAndApplyUpdate();
  }, [checkSession, checkBiometricsStatus, fontsLoaded, loadDebugState, loadOnboarding]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <NetworkStatusOverlay />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
