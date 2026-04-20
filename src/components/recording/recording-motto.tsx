import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface RecordingMottoProps {
  activeIndex: number;
}

const DOTS = [0, 1];

export function RecordingMotto({ activeIndex }: RecordingMottoProps) {
  const eyebrow = activeIndex === 0 ? "CAPTURA · EN VIVO" : "ARCHIVO · COMPLETO";

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <View style={styles.pillDot} />
        <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
      </View>

      <ThemedText style={styles.motto}>
        Tus mejores <ThemedText style={styles.mottoAccent}>ideas</ThemedText>
        {"\n"}están aquí
      </ThemedText>

      <View style={styles.dots}>
        {DOTS.map((i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 2,
  },
  motto: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 23,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.one,
  },
  mottoAccent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 18,
    lineHeight: 23,
    color: SemanticColors.success,
    letterSpacing: -0.4,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dotActive: {
    width: 22,
    backgroundColor: SemanticColors.success,
  },
});
