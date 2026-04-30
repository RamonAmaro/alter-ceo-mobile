import { DesktopSidebar } from "@/components/desktop-sidebar";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, type DimensionValue } from "react-native";

const MAX_WIDTH = 900;

const TRANSPARENT_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" },
};

export default function AppLayout() {
  const { isMobile } = useResponsiveLayout();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={isMobile ? styles.fill : styles.desktopRow}>
      {!isMobile && <DesktopSidebar />}
      <View style={styles.fill}>
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
                  animation: "slide_from_left",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="recording" />
                <Stack.Screen name="documents" />
                <Stack.Screen name="tasks" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="strategies" />
                <Stack.Screen name="plan-detail" />
                <Stack.Screen name="strategy-detail/[reportId]" />
                <Stack.Screen name="strategy" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="debug" />
                <Stack.Screen name="meeting-detail" />
                <Stack.Screen name="source-detail" />
                <Stack.Screen name="business-memory" />
              </Stack>
            </ThemeProvider>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  desktopRow: {
    flex: 1,
    flexDirection: "row",
  },
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
