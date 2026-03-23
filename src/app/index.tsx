import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);

  if (onboardingLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(app)/alter" />;
}
