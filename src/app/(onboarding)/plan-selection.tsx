import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { SelectableOption } from "@/components/selectable-option";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlanSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { planType, setPlanType } = useOnboardingStore();
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(20)).current;

  function handleSelectPlan(type: "express" | "professional"): void {
    const isFirstSelection = !planType;
    setPlanType(type);
    if (isFirstSelection) {
      Animated.parallel([
        Animated.timing(footerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(footerTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            <ThemedText type="headingMd" style={{ color: "#ffffff" }}>
              ESCOGE EXPRESS{"\n"}O PROFESIONAL
            </ThemedText>
            <ThemedText type="bodyLg" style={{ color: "#ffffff" }}>
              {"\n"}Para poder ayudarte de forma inmediata, lo primero que vamos a diseñar es un
              Plan para Duplicar tus Ventas y Trabajar la Mitad.
              {"\n\n"}Para ello, te vamos a solicitar algunos datos de tu negocio (son muy
              sencillos, no te preocupes). Elige entre inicio Express (3 minutos de tiempo aprox) o
              Profesional (6 minutos aprox). A más información, más podemos afinar en el desarrollo
              del plan.
            </ThemedText>
          </View>

          <View style={styles.optionsContainer}>
            <SelectableOption
              label="EXPRESS"
              subtitle="3 minutos de tiempo aprox"
              selected={planType === "express"}
              onPress={() => handleSelectPlan("express")}
            />
            <SelectableOption
              label="PROFESIONAL"
              subtitle="6 minutos de tiempo aprox"
              selected={planType === "professional"}
              onPress={() => handleSelectPlan("professional")}
            />
          </View>
        </ScrollView>

        {planType && (
          <Animated.View
            style={[
              styles.footer,
              {
                paddingBottom: insets.bottom + Spacing.four,
                opacity: footerOpacity,
                transform: [{ translateY: footerTranslateY }],
              },
            ]}
          >
            <Button label="Continuar" onPress={() => router.push("/(onboarding)/questions")} />
          </Animated.View>
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
  optionsContainer: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
