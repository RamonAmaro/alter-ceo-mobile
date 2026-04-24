import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ScreenLayout } from "@/components/screen-layout";
import { SelectableOption } from "@/components/selectable-option";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR, USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlanSelectionScreen() {
  const insets = useSafeAreaInsets();
  const planType = useOnboardingStore((s) => s.planType);
  const setPlanType = useOnboardingStore((s) => s.setPlanType);
  const footerOpacity = useRef(new Animated.Value(planType ? 1 : 0)).current;
  const footerTranslateY = useRef(new Animated.Value(planType ? 0 : 20)).current;

  function handleSelectPlan(type: "express" | "professional"): void {
    const isFirstSelection = !planType;
    setPlanType(type);
    if (isFirstSelection) {
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(footerTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
  }

  return (
    <ScreenLayout paddingHorizontal={0}>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.textContainer}>
            <ThemedText type="headingMd" style={styles.whiteText}>
              ESCOGE EXPRESS{"\n"}O PROFESIONAL
            </ThemedText>
            <ThemedText type="bodyLg" style={styles.whiteText}>
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
            style={{
              opacity: footerOpacity,
              transform: [{ translateY: footerTranslateY }],
            }}
          >
            <FooterActionBar>
              <Button label="Continuar" onPress={() => router.push("/(onboarding)/questions")} />
            </FooterActionBar>
          </Animated.View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
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
  whiteText: {
    color: SemanticColors.textPrimary,
  },
});
