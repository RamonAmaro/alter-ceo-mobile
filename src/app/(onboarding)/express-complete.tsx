import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
          <ThemedText type="headingLg" style={{ color: "#ffffff", textAlign: "center", marginBottom: Spacing.four }}>¡INICIO EXPRESS COMPLETADO!</ThemedText>
          <ThemedText type="bodyLg" style={{ color: "rgba(255,255,255,0.85)", textAlign: "center", paddingHorizontal: Spacing.two }}>
            ¿Quieres enviar la información para que diseñemos tu Plan para
            Duplicar tus Ventas y Trabajar la Mitad o quieres continuar con el
            Inicio Profesional (aprox 3 minutos más)?
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <Button label="Enviar" onPress={handleSend} />

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <ThemedText type="labelSm" style={{ color: "#E8731A", textDecorationLine: "underline" }}>Continuar</ThemedText>
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
  footer: {
    alignItems: "center",
    gap: Spacing.three,
  },
  continueButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
});
