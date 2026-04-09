import { AlterLogo } from "@/components/alter-logo";
import { AppBackground } from "@/components/app-background";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { Redirect } from "expo-router";
import type { Href } from "expo-router";
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
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

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

      if (!onboardingCompleted) {
        setDestination("/(onboarding)/welcome");
        setReady(true);
        return;
      }

      // Sessão ativa + onboarding completo → ir para home. Carregar plan em background.
      if (user?.userId) {
        try {
          await fetchLatestPlan(user.userId);
        } catch {
          // Plan não encontrado ou erro de rede — não impede acesso ao app
        }
      }

      setDestination("/(app)/(tabs)/alter");
      setReady(true);
    }

    void resolve();
  }, [authLoading, onboardingLoading, isAuthenticated, user?.userId]);

  if (!ready) {
    return <LoadingScreen />;
  }

  return <Redirect href={destination as Href} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
