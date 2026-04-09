import { StyleSheet, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function ExpressCompleteScreen() {
  const insets = useSafeAreaInsets();
  const upgradeToProfessional = useOnboardingStore((s) => s.upgradeToProfessional);

  function handleSend(): void {
    router.replace("/(onboarding)/report-loading");
  }

  function handleContinue(): void {
    upgradeToProfessional();
    router.replace("/(onboarding)/questions");
  }

  return (
    <ScreenLayout>
      <View style={[styles.inner, { paddingTop: insets.top + Spacing.five }]}>
        <View style={styles.content}>
          <ThemedText type="headingLg" style={styles.heading}>
            ¡INICIO EXPRESS COMPLETADO!
          </ThemedText>
          <ThemedText type="bodyLg" style={styles.subtitle}>
            ¿Quieres enviar la información para que diseñemos tu Plan para Duplicar tus Ventas y
            Trabajar la Mitad o quieres continuar con el Inicio Profesional (aprox 3 minutos más)?
          </ThemedText>
        </View>

        <FooterActionBar>
          <View style={styles.footerContent}>
            <Button label="Enviar" onPress={handleSend} />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <ThemedText type="labelSm" style={styles.continueLabel}>
                Continuar
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  },
  footerContent: {
    alignItems: "center",
    gap: Spacing.three,
  },
  continueButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  heading: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.four,
  },
  subtitle: {
    color: SemanticColors.textSubtle,
    textAlign: "center",
    paddingHorizontal: Spacing.two,
  },
  continueLabel: {
    color: "#E8731A",
    textDecorationLine: "underline",
  },
});
