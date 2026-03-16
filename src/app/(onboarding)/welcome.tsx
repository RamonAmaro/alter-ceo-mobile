import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
          <Text style={styles.greeting}>¡HOLA!</Text>
          <Text style={styles.body}>
            {"\n"}Mi nombre es Carlos Delgado y soy el fundador de Alter CEO y
            te quiero dar la bienvenida. Hoy activas a un verdadero copiloto
            estratégico que cambiará los resultados de tu negocio. Se acabó la
            improvisación: vamos a profesionalizar tu gestión para que tomes
            decisiones adecuadas que elevarán tus ventas mientras multiplicas tu
            eficiencia. Este es el punto de inflexión para recuperar tu tiempo y
            transformar tu empresa.
          </Text>

          <Text style={styles.greeting}>{"\n"}¡A por ello!</Text>
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
  greeting: {
    fontFamily: Fonts.montserrat,
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 20,
  },
  body: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "400",
    color: "#ffffff",
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
