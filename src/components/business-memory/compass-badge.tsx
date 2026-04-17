import { SemanticColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";

interface CompassBadgeProps {
  size?: number;
}

const BADGE_GRADIENT = ["#00FF84", "#2AF0E1"] as const;

export function CompassBadge({ size = 28 }: CompassBadgeProps) {
  const iconSize = Math.round(size * 0.62);
  const borderRadius = size / 2;
  const glowRadius = size / 2.4;

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: SemanticColors.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: glowRadius,
    },
    android: { elevation: 4 },
    web: { boxShadow: `0 0 ${glowRadius}px rgba(0,255,132,0.55)` },
  });

  return (
    <View style={[{ width: size, height: size, borderRadius }, shadowStyle]}>
      <View style={[styles.inner, { width: size, height: size, borderRadius }]}>
        <LinearGradient
          colors={BADGE_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="compass" size={iconSize} color="#0B1A1A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
