import { AlterLogo } from "@/components/alter-logo";
import { AlterWordmark } from "@/components/alter-wordmark";
import { SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface AlterBrandProps {
  iconSize?: number;
  wordmarkSize?: number;
  orientation?: "horizontal" | "vertical";
  color?: string;
  iconColor?: string;
  gap?: number;
}

export function AlterBrand({
  iconSize = 32,
  wordmarkSize = 18,
  orientation = "horizontal",
  color = SemanticColors.textPrimary,
  iconColor,
  gap = Spacing.two,
}: AlterBrandProps) {
  const isVertical = orientation === "vertical";

  return (
    <View style={[styles.container, isVertical ? styles.vertical : styles.horizontal, { gap }]}>
      <AlterLogo size={iconSize} color={iconColor} />
      <AlterWordmark size={wordmarkSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
});
