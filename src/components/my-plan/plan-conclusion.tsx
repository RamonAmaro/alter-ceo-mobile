import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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

      <View style={styles.iconWrap}>
        <View style={styles.iconRing}>
          <View style={styles.iconBox}>
            <Ionicons name="flag" size={22} color={SemanticColors.success} />
          </View>
        </View>
      </View>

      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <ThemedText style={styles.eyebrow}>HAS LLEGADO AL CIERRE</ThemedText>
      </View>

      <ThemedText style={styles.title}>
        Conclusión <ThemedText style={styles.titleAccent}>Express</ThemedText>
      </ThemedText>

      <GlassCard tone="emerald" padding={Spacing.four} radius={22}>
        <MonumentalIndex label="FIN" size={130} opacity={0.05} right={-12} bottom={-24} />
        <ThemedText style={styles.body}>{text ?? DEFAULT_CONCLUSION}</ThemedText>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  dividerLine: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,255,132,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  titleAccent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.success,
    letterSpacing: -0.6,
  },
  body: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 24,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
});
