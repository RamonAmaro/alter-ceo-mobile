import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { Redirect, type Href } from "expo-router";

import { AlterLogo } from "@/components/alter-logo";
import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";

function LoadingScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]),
    ).start();
  }, [opacity, scale]);

  return (
    <AppBackground>
      <View style={styles.centered}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <AlterLogo size={56} />
        </Animated.View>
      </View>
    </AppBackground>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <AppBackground>
      <View style={styles.centered}>
        <View style={styles.errorCard}>
          <ThemedText type="headingMd" style={styles.errorTitle}>
            No hemos podido comprobar tu configuración
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.errorMessage}>
            Revisa tu conexión o inténtalo de nuevo en unos segundos.
          </ThemedText>
          <Button label="Reintentar" onPress={onRetry} />
        </View>
      </View>
    </AppBackground>
  );
}

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const onboardingError = useOnboardingStore((s) => s.error);
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);
  const onboardingStatusUserId = useOnboardingStore((s) => s.statusUserId);
  const resolveCompletionStatus = useOnboardingStore((s) => s.resolveCompletionStatus);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

  const currentUserId = user?.userId ?? null;

  useEffect(() => {
    if (authLoading || !isAuthenticated || !currentUserId || onboardingLoading) return;
    if (onboardingStatusUserId === currentUserId) return;

    void resolveCompletionStatus(currentUserId);
  }, [
    authLoading,
    isAuthenticated,
    currentUserId,
    onboardingLoading,
    onboardingStatusUserId,
    resolveCompletionStatus,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !onboardingCompleted || !currentUserId) return;

    void fetchLatestPlan(currentUserId).catch(() => {
      // Plan no encontrado o error de red — no impide acceso al app
    });
  }, [isAuthenticated, onboardingCompleted, currentUserId, fetchLatestPlan]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)/login" as Href} />;
  }

  if (!currentUserId || onboardingLoading || onboardingStatusUserId !== currentUserId) {
    return <LoadingScreen />;
  }

  if (onboardingError) {
    return <ErrorScreen onRetry={() => void resolveCompletionStatus(currentUserId)} />;
  }

  return (
    <Redirect
      href={(onboardingCompleted ? "/(app)/(tabs)/alter" : "/(onboarding)/welcome") as Href}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  errorTitle: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  errorMessage: {
    color: SemanticColors.textSubtle,
    textAlign: "center",
  },
});
