import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

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
  gradientId,
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
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [pulse]);

  const viewBox = "0 0 139 140";
  const cx = 69.55;
  const cy = 69.67;

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Animated.View style={[styles.circleButton, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={size} height={size} viewBox={viewBox} fill="none">
            <Defs>
              <RadialGradient
                id={gradientId}
                cx={cx}
                cy={cy}
                r="37.69"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={colors[0]} />
                <Stop offset="1" stopColor={colors[1]} />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r="44.62" fill="#A8A8A8" />
            <Circle cx={cx} cy={cy} r="39.73" fill="#D8D8D8" />
            <Circle cx={cx} cy={cy} r="37.48" fill={`url(#${gradientId})`} />
            {icon}
          </Svg>
        </Animated.View>
      </TouchableOpacity>
      <ThemedText type="caption" style={{ color: "#ffffff", textAlign: "center" }}>
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
  circleButton: {
    shadowColor: "#00FFF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
