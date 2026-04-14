import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

export interface CircleButtonProps {
  size?: number;
  gradientId: string;
  colors: [string, string];
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  pulse?: boolean;
}

export function CircleButton({
  size = 80,
  colors,
  icon,
  label,
  onPress,
  pulse = false,
}: CircleButtonProps) {
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

  const innerSize = size * 0.76;
  const middleSize = size * 0.81;

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#A8A8A8",
              },
            ]}
          >
            <View
              style={[
                styles.ring,
                {
                  width: middleSize,
                  height: middleSize,
                  borderRadius: middleSize / 2,
                  backgroundColor: "#D8D8D8",
                },
              ]}
            >
              <LinearGradient
                colors={[colors[0], colors[1]]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {icon}
              </LinearGradient>
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

const styles = StyleSheet.create({
  actionWrapper: {
    alignItems: "center",
    gap: Spacing.one,
  },
  labelText: {
    color: SemanticColors.textPrimary,
    textAlign: "center" as const,
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
});
