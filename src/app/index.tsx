import { useEffect } from "react";

import { Redirect, type Href } from "expo-router";

import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const onboardingStatusUserId = useOnboardingStore((s) => s.statusUserId);
  const resolveCompletionStatus = useOnboardingStore((s) => s.resolveCompletionStatus);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

  const currentUserId = user?.userId ?? null;

  useEffect(() => {
    if (authLoading || !isAuthenticated || !currentUserId) return;
    if (onboardingStatusUserId === currentUserId) return;
    void resolveCompletionStatus(currentUserId);
  }, [authLoading, isAuthenticated, currentUserId, onboardingStatusUserId, resolveCompletionStatus]);

  useEffect(() => {
    if (!isAuthenticated || !onboardingCompleted || !currentUserId) return;
    void fetchLatestPlan(currentUserId).catch(() => undefined);
  }, [isAuthenticated, onboardingCompleted, currentUserId, fetchLatestPlan]);

  if (authLoading || !isAuthenticated) {
    return <Redirect href={"/(auth)/login" as Href} />;
  }

  if (!currentUserId || onboardingStatusUserId !== currentUserId) {
    return null;
  }

  return (
    <Redirect
      href={(onboardingCompleted ? "/(app)/(tabs)/alter" : "/(onboarding)/welcome") as Href}
    />
  );
}
