import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
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
          <Stack.Screen name="strategy-captacion" />
          <Stack.Screen name="strategy-captacion-loading" />
          <Stack.Screen name="strategy-captacion-result" />
          <Stack.Screen name="strategy-captacion-ready" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="debug" />
          <Stack.Screen name="meeting-detail" />
        </Stack>
      </View>
    </View>
  );
}
