import { AppLoader } from "@/components/app-loader";
import { KeyboardProvider } from "@/components/keyboard-provider";
import { NetworkStatusOverlay } from "@/components/network-status-overlay";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Animated, StyleSheet, useColorScheme } from "react-native";

import { useAppBootstrap } from "@/hooks/use-app-bootstrap";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { useLoaderController } from "@/hooks/use-loader-controller";
import { injectWebStyles } from "@/utils/inject-web-styles";

const MIN_LOADER_MS = 2000;
const FADE_OUT_MS = 420;

injectWebStyles();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();

  useAppBootstrap(fontsLoaded);

  const { isReady, showLoader, loaderOpacity, loaderPointerEvents } = useLoaderController({
    fontsLoaded,
    minDurationMs: MIN_LOADER_MS,
    fadeOutMs: FADE_OUT_MS,
  });

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {isReady && <Stack screenOptions={{ headerShown: false }} />}
        {isReady && <NetworkStatusOverlay />}
        {showLoader && (
          <Animated.View
            style={[styles.loaderOverlay, { opacity: loaderOpacity }]}
            pointerEvents={loaderPointerEvents}
          >
            <AppLoader />
          </Animated.View>
        )}
      </ThemeProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
