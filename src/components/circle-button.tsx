import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg from "react-native-svg";

export interface CircleButtonProps {
  size?: number;
  gradientId?: string;
  colors: [string, string];
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
}

const BORDER_RATIO = 0.018;
const MIN_BORDER = 1;

function buildShadow(color: string): object {
  return (
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 6px 18px ${hexToRgba(color, 0.4)}, 0 0 0 1px rgba(255,255,255,0.06)`,
      },
    }) ?? {}
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const match = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CircleButton({
  size = 80,
  colors,
  icon,
  label,
  onPress,
  disabled = false,
  loading = false,
  pulse = false,
}: CircleButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);
  const pressLockedRef = useRef(false);
  const [isPressPending, setIsPressPending] = useState(false);
  const borderWidth = Math.max(MIN_BORDER, Math.round(size * BORDER_RATIO));
  const isBusy = loading || isPressPending;
  const isDisabled = disabled || isBusy;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function handlePress(): void {
    if (isDisabled || pressLockedRef.current) return;

    const result = onPress() as unknown;
    if (!result || typeof (result as Promise<unknown>).then !== "function") return;

    pressLockedRef.current = true;
    setIsPressPending(true);

    Promise.resolve(result).finally(() => {
      pressLockedRef.current = false;
      if (isMountedRef.current) {
        setIsPressPending(false);
      }
    });
  }

  const radius = size / 2;
  const shadow = buildShadow(colors[0]);

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isDisabled}
        accessibilityState={{ disabled: isDisabled, busy: isBusy }}
      >
        <Animated.View
          style={[
            styles.circle,
            isDisabled && styles.circleDisabled,
            shadow,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0.2, y: 0.15 }}
            end={{ x: 0.85, y: 0.95 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />
          {isBusy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Svg
              width={size}
              height={size}
              viewBox="0 0 139 140"
              style={StyleSheet.absoluteFill}
              fill="none"
            >
              {icon}
            </Svg>
          )}
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
  circle: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255,255,255,0.15)",
  },
  circleDisabled: {
    opacity: 0.65,
  },
});
