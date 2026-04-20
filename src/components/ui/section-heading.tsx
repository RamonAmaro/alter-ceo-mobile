import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface SectionHeadingProps {
  eyebrow: string;
  titlePrefix: string;
  titleAccent?: string;
  titleSuffix?: string;
}

export function SectionHeading({
  eyebrow,
  titlePrefix,
  titleAccent,
  titleSuffix,
}: SectionHeadingProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.eyebrowRow}>
        <View style={styles.accentBar} />
        <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
      </View>

      <ThemedText style={styles.title}>
        {titlePrefix}
        {titleAccent ? " " : ""}
        {titleAccent ? <ThemedText style={styles.titleAccent}>{titleAccent}</ThemedText> : null}
        {titleSuffix ? <ThemedText style={styles.title}> {titleSuffix}</ThemedText> : null}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accentBar: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
  },
  titleAccent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 28,
    color: SemanticColors.success,
    fontStyle: "italic",
  },
});
