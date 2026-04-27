import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";

const PULSE_DURATION = 1400;

export function NetworkStatusOverlay(): React.ReactElement | null {
  const hasNetworkError = useAuthStore((s) => s.hasNetworkError);
  const retrySession = useAuthStore((s) => s.retrySession);
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const retryingRef = useRef(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!hasNetworkError) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 200, useNativeDriver: true }),
      ]).start();
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNetworkError]);

  useEffect(() => {
    if (!hasNetworkError) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNetworkError]);

  const handleRetry = useCallback(async (): Promise<void> => {
    if (retryingRef.current) return;

    retryingRef.current = true;
    setIsRetrying(true);
    try {
      await retrySession();
    } finally {
      retryingRef.current = false;
      setIsRetrying(false);
    }
  }, [retrySession]);

  useEffect(() => {
    if (!hasNetworkError) return;
    const interval = setInterval(() => {
      void handleRetry();
    }, 4000);
    return () => clearInterval(interval);
  }, [handleRetry, hasNetworkError]);

  if (!hasNetworkError) return null;

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: insets.top + Spacing.two }]}>
      <Animated.View style={[styles.pillWrapper, { opacity, transform: [{ translateY }] }]}>
        <Pressable
          onPress={() => void handleRetry()}
          disabled={isRetrying}
          accessibilityState={{ disabled: isRetrying, busy: isRetrying }}
          style={styles.pill}
        >
          <Animated.View
            style={[styles.dot, { transform: [{ scale: dotScale }], opacity: dotOpacity }]}
          />
          <View style={styles.textColumn}>
            <ThemedText style={styles.title}>Sin conexión</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isRetrying ? "Comprobando conexión..." : "Reintentando…"}
            </ThemedText>
          </View>
          {isRetrying ? (
            <ActivityIndicator size="small" color={SemanticColors.textPrimary} />
          ) : (
            <Ionicons
              name="refresh"
              size={18}
              color={SemanticColors.textPrimary}
              style={styles.refreshIcon}
            />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  android: { elevation: 12 },
  web: { boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.4)" },
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  pillWrapper: {
    maxWidth: 360,
    width: "92%",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 18,
    backgroundColor: "rgba(15, 22, 32, 0.96)",
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    ...shadow,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: SemanticColors.warning,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
  },
  refreshIcon: {
    opacity: 0.85,
  },
});
