import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";

const LOGO_SIZE = 132;
const WRAP_SIZE = LOGO_SIZE * 2.4;
const RIPPLE_COUNT = 3;
const RIPPLE_DURATION = 3200;
const BREATH_DURATION = 2600;

export function AlterHeroButton() {
  const router = useRouter();
  const breath = useRef(new Animated.Value(0)).current;
  const ripples = useRef(
    Array.from({ length: RIPPLE_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const rippleAnimations = ripples.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((RIPPLE_DURATION / RIPPLE_COUNT) * index),
          Animated.timing(value, {
            toValue: 1,
            duration: RIPPLE_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ),
    );

    breathLoop.start();
    rippleAnimations.forEach((anim) => anim.start());

    return () => {
      breathLoop.stop();
      rippleAnimations.forEach((anim) => anim.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePress(): void {
    router.push("/(app)/chat");
  }

  const pulseScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const innerGlowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.85],
  });

  const innerGlowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.08],
  });

  const auraOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.45],
  });

  const auraScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Pulsa para hablar con Alter CEO"
    >
      <View style={styles.logoWrap}>
        {ripples.map((value, index) => {
          const scale = value.interpolate({
            inputRange: [0, 1],
            outputRange: [0.75, 1.6],
          });
          const opacity = value.interpolate({
            inputRange: [0, 0.15, 1],
            outputRange: [0, 0.35, 0],
          });
          return (
            <Animated.View
              key={index}
              pointerEvents="none"
              style={[
                styles.ripple,
                {
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.aura,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.innerGlow,
            {
              opacity: innerGlowOpacity,
              transform: [{ scale: innerGlowScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoInner,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <AlterLogo size={LOGO_SIZE} />
        </Animated.View>
      </View>

      <View style={styles.textWrap}>
        <ThemedText style={styles.brand}>ALTER CEO</ThemedText>
        <ThemedText style={styles.cta}>Pulsa para hablar con Alter CEO</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
  },
  logoWrap: {
    width: WRAP_SIZE,
    height: WRAP_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: WRAP_SIZE * 0.78,
    height: WRAP_SIZE * 0.78,
    borderRadius: WRAP_SIZE,
    borderWidth: 2,
    borderColor: "rgba(0,255,132,0.55)",
  },
  aura: {
    position: "absolute",
    width: WRAP_SIZE * 0.95,
    height: WRAP_SIZE * 0.95,
    borderRadius: WRAP_SIZE,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  innerGlow: {
    position: "absolute",
    width: WRAP_SIZE * 0.72,
    height: WRAP_SIZE * 0.72,
    borderRadius: WRAP_SIZE,
    backgroundColor: "rgba(0,255,132,0.18)",
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    alignItems: "center",
    gap: Spacing.one,
  },
  brand: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 4,
    color: SemanticColors.textPrimary,
  },
  cta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: SemanticColors.success,
    textAlign: "center",
  },
});
