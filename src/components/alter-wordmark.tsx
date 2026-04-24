import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import { StyleSheet } from "react-native";

interface AlterWordmarkProps {
  size?: number;
  color?: string;
}

export function AlterWordmark({
  size = 24,
  color = SemanticColors.textPrimary,
}: AlterWordmarkProps) {
  const letterSpacing = size * 0.02;
  const lineHeight = size * 1.1;

  return (
    <ThemedText
      style={[
        styles.text,
        {
          fontSize: size,
          lineHeight,
          letterSpacing,
          color,
        },
      ]}
      numberOfLines={1}
      allowFontScaling={false}
    >
      alter ceo
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.octosquaresBlack,
    textAlign: "center",
    includeFontPadding: false,
  },
});
