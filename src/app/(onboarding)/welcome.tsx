import { useEffect, useRef } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ScreenLayout } from "@/components/screen-layout";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useDebugStore } from "@/stores/debug-store";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const unlockDebug = useDebugStore((s) => s.unlock);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  async function handleSecretTap(): Promise<void> {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapCountRef.current += 1;
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      tapTimerRef.current = null;
      await unlockDebug();
      Alert.alert("Modo debug desbloqueado", "Se abrirán las herramientas internas.");
      router.push("/(app)/debug?source=onboarding");
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      tapTimerRef.current = null;
    }, 1500);
  }

  return (
    <ScreenLayout paddingHorizontal={0}>
      <View style={[styles.inner, { paddingTop: insets.top + Spacing.five }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => void handleSecretTap()} style={styles.secretTapTarget}>
            <ThemedText type="headingMd" style={styles.whiteText}>
              ¡HOLA!
            </ThemedText>
          </Pressable>
          <ThemedText type="bodyLg" style={styles.whiteText}>
            {"\n"}Mi nombre es Carlos Delgado y soy el fundador de Alter CEO y te quiero dar la
            bienvenida. Hoy activas a un verdadero copiloto estratégico que cambiará los resultados
            de tu negocio. Se acabó la improvisación: vamos a profesionalizar tu gestión para que
            tomes decisiones adecuadas que elevarán tus ventas mientras multiplicas tu eficiencia.
            Este es el punto de inflexión para recuperar tu tiempo y transformar tu empresa.
          </ThemedText>

          <ThemedText type="headingMd" style={styles.whiteText}>
            {"\n"}¡A por ello!
          </ThemedText>
        </ScrollView>

        <FooterActionBar>
          <Button label="Continuar" onPress={() => router.push("/(onboarding)/plan-selection")} />
        </FooterActionBar>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
  },
  secretTapTarget: {
    alignSelf: "flex-start",
  },
  whiteText: {
    color: SemanticColors.textPrimary,
  },
});
