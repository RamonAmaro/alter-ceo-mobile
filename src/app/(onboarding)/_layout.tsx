import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack } from "expo-router";

export default function OnboardingLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AppBackground>
      <ResponsiveContainer>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
      </ResponsiveContainer>
    </AppBackground>
  );
}
