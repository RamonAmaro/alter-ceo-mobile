import { AlterLogo } from "@/components/alter-logo";
import { AlterWordmark } from "@/components/alter-wordmark";
import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";

const LOGO_SIZE = 132;
const WRAP_SIZE = LOGO_SIZE * 2.4;
const RIPPLE_COUNT = 3;
const RIPPLE_DURATION = 2000;
const BREATH_DURATION = 1400;
const HINT_DURATION = BREATH_DURATION;

export function AlterHeroButton() {
  const router = useRouter();
  const breath = useRef(new Animated.Value(0)).current;
  const ripples = useRef(Array.from({ length: RIPPLE_COUNT }, () => new Animated.Value(0))).current;
  const hint = useRef(new Animated.Value(0)).current;

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

    const hintLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(hint, {
          toValue: 1,
          duration: HINT_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(hint, {
          toValue: 0,
          duration: HINT_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    breathLoop.start();
    rippleAnimations.forEach((anim) => anim.start());
    hintLoop.start();

    return () => {
      breathLoop.stop();
      rippleAnimations.forEach((anim) => anim.stop());
      hintLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePress(): void {
    router.push("/(app)/chat");
  }

  const pulseScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const innerGlowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const innerGlowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.15],
  });

  const auraOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  const auraScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  const hintOpacity = hint.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const hintTranslate = hint.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, 0],
  });

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Habla con Alter CEO"
    >
      <View style={styles.logoWrap}>
        {ripples.map((value, index) => {
          const scale = value.interpolate({
            inputRange: [0, 1],
            outputRange: [0.75, 1.6],
          });
          const opacity = value.interpolate({
            inputRange: [0, 0.15, 1],
            outputRange: [0, 0.65, 0],
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
        <ThemedText style={styles.cta}>Pulsa para hablar con</ThemedText>
        <AlterWordmark size={28} />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.hintWrap,
          {
            opacity: hintOpacity,
            transform: [{ translateY: hintTranslate }],
          },
        ]}
      >
        <MaterialCommunityIcons name="gesture-tap" size={16} color={SemanticColors.textMuted} />
        <ThemedText style={styles.hintText}>Toca para empezar</ThemedText>
      </Animated.View>
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
    borderWidth: 3,
    borderColor: "rgba(0,255,132,0.85)",
  },
  aura: {
    position: "absolute",
    width: WRAP_SIZE * 0.95,
    height: WRAP_SIZE * 0.95,
    borderRadius: WRAP_SIZE,
    backgroundColor: "rgba(0,255,132,0.15)",
  },
  innerGlow: {
    position: "absolute",
    width: WRAP_SIZE * 0.72,
    height: WRAP_SIZE * 0.72,
    borderRadius: WRAP_SIZE,
    backgroundColor: "rgba(0,255,132,0.28)",
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    alignItems: "center",
    gap: Spacing.one,
  },
  cta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: SemanticColors.success,
    textAlign: "center",
  },
  hintWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: -Spacing.two,
  },
  hintText: {
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: SemanticColors.textMuted,
  },
});
