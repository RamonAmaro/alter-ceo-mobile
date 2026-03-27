import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const complete = useOnboardingStore((s) => s.complete);
  const clearAnswers = useOnboardingStore((s) => s.clearAnswers);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    if (user?.userId) {
      await fetchLatestPlan(user.userId);
    }
    await complete();
    clearAnswers();
    router.replace("/(app)/alter");
  }

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.five }]}>
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
            Tu configuración inicial está completa. Ahora tienes acceso a todas
            las herramientas para transformar tu negocio.
          </ThemedText>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
          {loading ? (
            <ActivityIndicator color="#00FF84" size="large" />
          ) : (
            <Button label="Ver mi plan" onPress={handleFinish} />
          )}
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
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
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
