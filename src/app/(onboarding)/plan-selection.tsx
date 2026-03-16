import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { SelectableOption } from "@/components/selectable-option";
import { Fonts, Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlanSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { planType, setPlanType } = useOnboardingStore();

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>ESCOGE EXPRESS{"\n"}O PROFESIONAL</Text>
            <Text style={styles.body}>
              {"\n"}Para poder ayudarte de forma inmediata, lo primero que vamos
              a diseñar es un Plan para Duplicar tus Ventas y Trabajar la Mitad.
              {"\n\n"}Para ello, te vamos a solicitar algunos datos de tu
              negocio (son muy sencillos, no te preocupes). Elige entre inicio
              Express (3 minutos de tiempo aprox) o Profesional (6 minutos
              aprox). A más información, más podemos afinar en el desarrollo del
              plan.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <SelectableOption
              label="EXPRESS"
              subtitle="3 minutos de tiempo aprox"
              selected={planType === "express"}
              onPress={() => setPlanType("express")}
            />
            <SelectableOption
              label="PROFESIONAL"
              subtitle="6 minutos de tiempo aprox"
              selected={planType === "professional"}
              onPress={() => setPlanType("professional")}
            />
          </View>
        </ScrollView>

        {planType && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
            <Button
              label="Continuar"
              onPress={() => router.push("/(onboarding)/audio-question")}
            />
          </View>
        )}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
  },
  textContainer: {
    marginTop: Spacing.four,
  },
  title: {
    fontFamily: Fonts.montserrat,
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 24,
  },
  body: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "400",
    color: "#ffffff",
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
