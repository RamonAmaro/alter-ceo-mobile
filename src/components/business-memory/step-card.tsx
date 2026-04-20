import { ThemedText } from "@/components/themed-text";
import type { BusinessMemoryStep } from "@/constants/business-memory-steps";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StepIcon } from "./step-icon";

interface StepCardProps {
  step: BusinessMemoryStep;
  index: number;
  total: number;
  onPress: () => void;
  animationDelay?: number;
}

const RING_SIZE = 96;
const ICON_RATIO = 0.5;

export function StepCard({ step, index, total, onPress, animationDelay = 0 }: StepCardProps) {
  const iconSize = Math.round(RING_SIZE * ICON_RATIO);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay: animationDelay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay: animationDelay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePressIn(): void {
    Animated.spring(scale, {
      toValue: 0.97,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  function handlePressOut(): void {
    Animated.spring(scale, {
      toValue: 1,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={step.title}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={styles.card}>
          <LinearGradient
            colors={["rgba(0,255,132,0.08)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <ThemedText style={styles.monumentalIndex} numberOfLines={1}>
            {indexLabel}
          </ThemedText>

          <ProgressRing size={RING_SIZE} progress={step.progress} strokeWidth={3}>
            <View style={[styles.ringInner, { pointerEvents: "none" }]}>
              <View style={styles.ringIconLayer}>
                <StepIcon config={step.icon} size={iconSize} color="rgba(255,255,255,0.14)" />
              </View>
              <ThemedText style={styles.ringPercent}>{step.progress}%</ThemedText>
            </View>
          </ProgressRing>

          <View style={styles.body}>
            <View style={styles.labelRow}>
              <View style={styles.accentBar} />
              <ThemedText style={styles.labelMeta}>
                BLOQUE {indexLabel} · {totalLabel}
              </ThemedText>
            </View>
            <ThemedText style={styles.title}>{step.title}</ThemedText>
            <ThemedText style={styles.description} numberOfLines={3}>
              {step.description}
            </ThemedText>
          </View>

          <View style={styles.chevronWrap}>
            <Ionicons name="arrow-forward" size={16} color={SemanticColors.success} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  android: { elevation: 4 },
  web: { boxShadow: "0 6px 20px rgba(0,0,0,0.25)" },
});

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  card: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    paddingRight: Spacing.four,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    ...cardShadow,
  },
  monumentalIndex: {
    position: "absolute",
    right: -8,
    bottom: -22,
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 140,
    lineHeight: 140,
    color: "rgba(0,255,132,0.055)",
    letterSpacing: -6,
  },
  ringInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 20,
    lineHeight: 22,
    color: SemanticColors.success,
    letterSpacing: -0.5,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  labelMeta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 19,
    color: SemanticColors.textPrimary,
    marginTop: 2,
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    marginTop: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
  },
});
