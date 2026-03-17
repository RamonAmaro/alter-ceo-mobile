import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { Fonts, Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExpressCompleteScreen() {
  const insets = useSafeAreaInsets();
  const upgradeToProfessional = useOnboardingStore(
    (s) => s.upgradeToProfessional,
  );

  function handleSend(): void {
    router.replace("/(onboarding)/report-loading");
  }

  function handleContinue(): void {
    upgradeToProfessional();
    router.replace("/(onboarding)/questions");
  }

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>¡INICIO EXPRESS COMPLETADO!</Text>
          <Text style={styles.body}>
            ¿Quieres enviar la información para que diseñemos tu Plan para
            Duplicar tus Ventas y Trabajar la Mitad o quieres continuar con el
            Inicio Profesional (aprox 3 minutos más)?
          </Text>
        </View>

        <View style={styles.footer}>
          <Button label="Enviar" onPress={handleSend} />

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.continueText}>Continuar</Text>
          </TouchableOpacity>
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
  },
  title: {
    fontFamily: Fonts.montserrat,
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.four,
  },
  body: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.two,
  },
  footer: {
    alignItems: "center",
    gap: Spacing.three,
  },
  continueButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  continueText: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    fontWeight: "600",
    color: "#E8731A",
    textDecorationLine: "underline",
  },
});
