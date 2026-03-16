import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { Fonts, Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const complete = useOnboardingStore((s) => s.complete);

  async function handleFinish() {
    await complete();
    router.replace("/(app)/home");
  }

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.five }]}>
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/logo-alterceo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>¡Todo listo!</Text>
          <Text style={styles.subtitle}>
            Tu configuración inicial está completa. Ahora tienes acceso a todas
            las herramientas para transformar tu negocio.
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
          <Button label="Empezar" onPress={handleFinish} />
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
    fontFamily: Fonts.montserrat,
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
