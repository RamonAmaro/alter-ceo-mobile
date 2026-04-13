import { DesktopSidebar } from "@/components/desktop-sidebar";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

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
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_left" }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recording" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="my-plan" />
          <Stack.Screen name="strategy" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="debug" />
        </Stack>
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
});
