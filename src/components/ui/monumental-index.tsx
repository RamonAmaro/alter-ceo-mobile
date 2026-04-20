import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { StyleSheet } from "react-native";

interface MonumentalIndexProps {
  label: string;
  size?: number;
  opacity?: number;
  right?: number;
  bottom?: number;
}

export function MonumentalIndex({
  label,
  size = 140,
  opacity = 0.055,
  right = -8,
  bottom = -22,
}: MonumentalIndexProps) {
  return (
    <ThemedText
      style={[
        styles.label,
        {
          fontSize: size,
          lineHeight: size,
          right,
          bottom,
          color: `rgba(0,255,132,${opacity})`,
        },
      ]}
      numberOfLines={1}
    >
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    letterSpacing: -6,
  },
});
