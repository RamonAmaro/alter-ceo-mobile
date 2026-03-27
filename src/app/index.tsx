import { AlterLogo } from "@/components/alter-logo";
import { AppBackground } from "@/components/app-background";
import { getLatestUserPlan } from "@/services/plan-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { ApiError } from "@/types/api";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

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
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

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

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);
  const completeOnboarding = useOnboardingStore((s) => s.complete);
  const setLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const hasResolved = useRef(false);

  useEffect(() => {
    if (authLoading || onboardingLoading) return;
    if (hasResolved.current) return;

    async function resolve() {
      hasResolved.current = true;

      if (!isAuthenticated) {
        setDestination("/(auth)/login");
        setReady(true);
        return;
      }

      if (user?.userId) {
        try {
          const plan = await getLatestUserPlan(user.userId);
          if (plan) {
            await setLatestPlan(user.userId);
            if (!onboardingCompleted) await completeOnboarding();
            setDestination("/(app)/alter");
            setReady(true);
            return;
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            // usuário sem plano — vai para onboarding
            setDestination("/(onboarding)/welcome");
            setReady(true);
            return;
          }
          // erro de rede ou outro — decidir pelo estado local
        }
      }

      if (!onboardingCompleted) {
        setDestination("/(onboarding)/welcome");
        setReady(true);
        return;
      }

      setDestination("/(app)/alter");
      setReady(true);
    }

    void resolve();
  }, [authLoading, onboardingLoading, isAuthenticated, onboardingCompleted, user?.userId]);

  if (!ready) {
    return <LoadingScreen />;
  }

  return <Redirect href={destination as never} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
