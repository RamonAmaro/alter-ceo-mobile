import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg from "react-native-svg";

export interface CircleButtonProps {
  size?: number;
  gradientId?: string;
  colors: [string, string];
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  pulse?: boolean;
}

const OUTER_RIM_RATIO = 0.023;
const INNER_RIM_RATIO = 0.017;

export function CircleButton({
  size = 80,
  colors,
  icon,
  label,
  onPress,
  pulse = false,
}: CircleButtonProps) {
  const outerRimWidth = Math.max(1, Math.round(size * OUTER_RIM_RATIO));
  const innerRimWidth = Math.max(1, Math.round(size * INNER_RIM_RATIO));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [pulse, pulseAnim]);

  const radius = size / 2;
  const midSize = size - outerRimWidth * 2;
  const midRadius = midSize / 2;
  const innerSize = midSize - innerRimWidth * 2;
  const innerRadius = innerSize / 2;

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Animated.View
          style={[
            styles.outerRim,
            { width: size, height: size, borderRadius: radius, transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View
            style={[styles.midRim, { width: midSize, height: midSize, borderRadius: midRadius }]}
          >
            <View
              style={[
                styles.innerCircle,
                { width: innerSize, height: innerSize, borderRadius: innerRadius },
              ]}
            >
              <LinearGradient
                colors={colors}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 0.85, y: 0.9 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                style={StyleSheet.absoluteFill}
              />
              <Svg
                width={innerSize}
                height={innerSize}
                viewBox="0 0 139 140"
                style={StyleSheet.absoluteFill}
                fill="none"
              >
                {icon}
              </Svg>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      <ThemedText type="caption" style={styles.labelText}>
        {label}
      </ThemedText>
    </View>
  );
}

const buttonShadow = Platform.select({
  ios: {
    shadowColor: "#00C0EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  android: {
    elevation: 10,
  },
  web: {
    boxShadow: "0 8px 24px rgba(0, 192, 238, 0.35), 0 0 0 1px rgba(255,255,255,0.04)",
  },
});

const styles = StyleSheet.create({
  actionWrapper: {
    alignItems: "center",
    gap: Spacing.one,
  },
  labelText: {
    color: SemanticColors.textPrimary,
    textAlign: "center" as const,
  },
  outerRim: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(168,168,168,0.9)",
    ...buttonShadow,
  },
  midRim: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D8D8D8",
  },
  innerCircle: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
