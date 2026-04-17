import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from "react-native";

interface StrategyTopicCardProps {
  label: string;
  image: ImageSourcePropType;
  actionLabel?: string;
  disabled?: boolean;
  onPress: () => void;
}

export function StrategyTopicCard({
  label,
  image,
  actionLabel = "Comenzar",
  disabled = false,
  onPress,
}: StrategyTopicCardProps) {
  return (
    <TouchableOpacity
      style={[styles.outer, disabled && styles.outerDisabled]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.85}
      disabled={disabled}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <ThemedText style={styles.label} numberOfLines={2}>
          {label}
        </ThemedText>

        <View style={styles.imageWrap}>
          <Image
            source={image}
            style={[styles.image, disabled && styles.imageDisabled]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.divider} />
        <ThemedText style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>
          {actionLabel}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(0,255,132,0.24)",
    overflow: "hidden",
  },
  outerDisabled: {
    borderColor: "rgba(255,255,255,0.08)",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 20,
    lineHeight: 22,
    textAlign: "center",
    color: SemanticColors.success,
    textTransform: "uppercase",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 96,
    height: 96,
  },
  imageDisabled: {
    opacity: 0.45,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(0,255,132,0.15)",
    marginBottom: Spacing.two,
  },
  buttonLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 15,
    color: SemanticColors.tealLight,
  },
  buttonLabelDisabled: {
    color: SemanticColors.textMuted,
  },
});
