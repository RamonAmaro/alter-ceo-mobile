import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.five }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="headingMd" style={{ color: "#ffffff" }}>¡HOLA!</ThemedText>
          <ThemedText type="bodyLg" style={{ color: "#ffffff" }}>
            {"\n"}Mi nombre es Carlos Delgado y soy el fundador de Alter CEO y
            te quiero dar la bienvenida. Hoy activas a un verdadero copiloto
            estratégico que cambiará los resultados de tu negocio. Se acabó la
            improvisación: vamos a profesionalizar tu gestión para que tomes
            decisiones adecuadas que elevarán tus ventas mientras multiplicas tu
            eficiencia. Este es el punto de inflexión para recuperar tu tiempo y
            transformar tu empresa.
          </ThemedText>

          <ThemedText type="headingMd" style={{ color: "#ffffff" }}>{"\n"}¡A por ello!</ThemedText>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
          <Button
            label="Continuar"
            onPress={() => router.push("/(onboarding)/plan-selection")}
          />
        </View>
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
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
