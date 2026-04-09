import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface RecordingMottoProps {
  activeIndex: number;
}

const DOTS = [0, 1];

export function RecordingMotto({ activeIndex }: RecordingMottoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {DOTS.map((i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
      <ThemedText style={styles.motto}>{"TUS MEJORES IDEAS\nESTÁN AQUÍ."}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  motto: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
