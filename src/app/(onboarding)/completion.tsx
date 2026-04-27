import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const clearAnswers = useOnboardingStore((s) => s.clearAnswers);
  const markCompletedForUser = useOnboardingStore((s) => s.markCompletedForUser);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (loading) return;
    setLoading(true);
    if (user?.userId) {
      try {
        await fetchLatestPlan(user.userId);
      } catch {
        // El plan puede seguir estando disponible más tarde; no bloquea la entrada al app.
      }
      markCompletedForUser(user.userId);
    }
    clearAnswers();
    router.replace("/(app)/(tabs)/alter");
    setTimeout(() => router.push("/my-plan"), 300);
  }

  return (
    <ScreenLayout>
      <View style={[styles.inner, { paddingTop: insets.top + Spacing.five }]}>
        <View style={styles.content}>
          <Image
            source={require("@/assets/ui/logo-alterceo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <ThemedText type="headingLg" style={styles.title}>
            ¡Todo listo!
          </ThemedText>
          <ThemedText type="bodyLg" style={styles.subtitle}>
            Tu configuración inicial está completa. Ahora tienes acceso a todas las herramientas
            para transformar tu negocio.
          </ThemedText>
        </View>

        <FooterActionBar>
          <Button label="Ver mi plan" onPress={handleFinish} loading={loading} />
        </FooterActionBar>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 140,
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 28,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: Spacing.three,
  },
});
