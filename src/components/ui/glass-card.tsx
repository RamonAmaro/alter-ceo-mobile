import { SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from "react-native";

type GlassCardTone = "neutral" | "emerald" | "subtle";

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  tone?: GlassCardTone;
  padding?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  accessibilityLabel?: string;
}

const TONE_GRADIENT: Record<GlassCardTone, readonly [string, string]> = {
  emerald: ["rgba(0,255,132,0.10)", "rgba(42,240,225,0.02)"],
  neutral: ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.01)"],
  subtle: ["rgba(0,255,132,0.06)", "rgba(255,255,255,0.01)"],
};

const TONE_BORDER: Record<GlassCardTone, string> = {
  emerald: "rgba(0,255,132,0.14)",
  neutral: "rgba(255,255,255,0.08)",
  subtle: "rgba(255,255,255,0.08)",
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
});

export function GlassCard({
  children,
  onPress,
  onPressIn,
  onPressOut,
  tone = "neutral",
  padding = Spacing.four,
  radius = 24,
  style,
  disabled,
  accessibilityLabel,
}: GlassCardProps) {
  const body = (
    <View
      style={[
        styles.card,
        { padding, borderRadius: radius, borderColor: TONE_BORDER[tone] },
        cardShadow,
        style,
      ]}
    >
      <LinearGradient
        colors={TONE_GRADIENT[tone]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      {children}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && !disabled ? styles.pressed : null]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SemanticColors.surfaceElevated,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.92,
  },
});
