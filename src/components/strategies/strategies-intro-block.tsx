import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface StrategiesIntroBlockProps {
  onCreatePress: () => void;
}

export function StrategiesIntroBlock({ onCreatePress }: StrategiesIntroBlockProps) {
  return (
    <View style={styles.wrap}>
      <SectionHeading
        eyebrow="HISTORIAL · ESTRATEGIAS"
        titlePrefix="Tu plan y tus"
        titleAccent="estrategias"
      />

      <ThemedText style={styles.lead}>
        Aquí encontrarás tu plan de duplicación y todas las estrategias que has creado.
      </ThemedText>

      <Pressable
        onPress={onCreatePress}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, ctaShadow]}
        accessibilityRole="button"
        accessibilityLabel="Crear nueva estrategia"
      >
        <LinearGradient
          colors={["rgba(0,255,132,0.32)", "rgba(67,188,184,0.18)", "rgba(0,255,132,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.ctaIconWrap}>
          <Ionicons name="add" size={22} color="#00FF84" />
        </View>
        <View style={styles.ctaBody}>
          <ThemedText style={styles.ctaTitle}>Crear nueva estrategia</ThemedText>
          <ThemedText style={styles.ctaSubtitle}>
            Elige un área clave y genera un informe personalizado.
          </ThemedText>
        </View>
        <View style={styles.ctaArrow}>
          <Ionicons name="arrow-forward" size={16} color="#00FF84" />
        </View>
      </Pressable>
    </View>
  );
}

const ctaShadow = Platform.select({
  ios: {
    shadowColor: "#00FF84",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 6px 22px rgba(0,255,132,0.32)" },
});

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.three,
  },
  lead: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textMuted,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0,255,132,0.55)",
    backgroundColor: "rgba(0,40,24,0.45)",
    overflow: "hidden",
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.22)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.55)",
  },
  ctaBody: {
    flex: 1,
    gap: 2,
  },
  ctaTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 19,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.3,
  },
  ctaSubtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 15,
    color: "rgba(255,255,255,0.78)",
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.18)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.45)",
  },
});
