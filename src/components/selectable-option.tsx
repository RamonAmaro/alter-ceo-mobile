import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native";

const ACTIVE_BG = require("@/assets/ui/card-active-bg.png");
const INACTIVE_BG = require("@/assets/ui/card-inactive-bg.png");

interface SelectableOptionProps {
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectableOption({ label, subtitle, selected, onPress }: SelectableOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.wrapper, selected && styles.wrapperSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={selected ? ACTIVE_BG : INACTIVE_BG}
        style={styles.card}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <ThemedText type="labelMd" style={styles.label}>
          {label}
        </ThemedText>
        <ThemedText type="bodySm" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  wrapperSelected: {
    borderColor: "transparent",
  },
  card: {
    height: 88,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  image: {
    borderRadius: 14,
  },
  label: {
    color: SemanticColors.textPrimary,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
