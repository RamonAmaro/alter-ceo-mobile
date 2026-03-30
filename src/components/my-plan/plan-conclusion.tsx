import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

const DEFAULT_CONCLUSION =
  "Este es un primer mapa estratégico. No necesitas cambiarlo todo hoy. Necesitas abrir tu mente y empezar. A medida que compartas más información, la aplicación ajustará cada paso a tu realidad. El objetivo no es solo duplicar ventas, sino profesionalizar tu rol como empresario. Poco a poco, con estructura y foco, los resultados llegarán.";

interface PlanConclusionProps {
  text?: string;
}

export function PlanConclusion({ text }: PlanConclusionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dividerLine} />

      <ThemedText type="caption" style={styles.label}>
        Has llegado al cierre de tu plan
      </ThemedText>

      <ThemedText type="headingMd" style={styles.title}>
        Conclusión Express
      </ThemedText>

      <ThemedText type="bodyMd" style={styles.body}>
        {text ?? DEFAULT_CONCLUSION}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  dividerLine: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  label: {
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  title: {
    color: "#ffffff",
    fontFamily: Fonts.montserratExtraBold,
    textAlign: "center",
  },
  body: {
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
    fontSize: 14,
    textAlign: "center",
  },
});
