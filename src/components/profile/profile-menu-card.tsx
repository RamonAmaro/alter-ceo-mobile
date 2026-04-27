import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];
type MenuTone = "emerald" | "neutral" | "danger";

interface ProfileMenuCardProps {
  icon: IoniconsName;
  label: string;
  description?: string;
  meta?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: MenuTone;
  animationDelay?: number;
}

const TONE_ICON_BG: Record<MenuTone, string> = {
  emerald: "rgba(0,255,132,0.12)",
  neutral: "rgba(255,255,255,0.06)",
  danger: "rgba(255,68,68,0.12)",
};

const TONE_ICON_BORDER: Record<MenuTone, string> = {
  emerald: "rgba(0,255,132,0.25)",
  neutral: "rgba(255,255,255,0.1)",
  danger: "rgba(255,68,68,0.25)",
};

const TONE_ICON_COLOR: Record<MenuTone, string> = {
  emerald: SemanticColors.success,
  neutral: "rgba(255,255,255,0.6)",
  danger: SemanticColors.error,
};

const TONE_GRADIENT: Record<MenuTone, readonly [string, string]> = {
  emerald: ["rgba(0,255,132,0.06)", "rgba(255,255,255,0.01)"],
  neutral: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"],
  danger: ["rgba(255,68,68,0.10)", "rgba(255,68,68,0.02)"],
};

const TONE_LABEL: Record<MenuTone, string> = {
  emerald: SemanticColors.textPrimary,
  neutral: SemanticColors.textPrimary,
  danger: SemanticColors.error,
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 4px 14px rgba(0,0,0,0.22)" },
});

export function ProfileMenuCard({
  icon,
  label,
  description,
  meta,
  onPress,
  disabled,
  loading = false,
  tone = "neutral",
  animationDelay = 0,
}: ProfileMenuCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay: animationDelay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay: animationDelay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePressIn(): void {
    if (!onPress || loading || disabled) return;
    Animated.spring(scale, {
      toValue: 0.98,
      speed: 60,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  function handlePressOut(): void {
    if (!onPress || loading || disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      speed: 60,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  const isDisabled = Boolean(disabled) || loading;
  const interactive = Boolean(onPress) && !isDisabled;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <Pressable
        onPress={interactive ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!interactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[styles.card, isDisabled && styles.cardDisabled, cardShadow]}
      >
        <LinearGradient
          colors={TONE_GRADIENT[tone]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: TONE_ICON_BG[tone],
              borderColor: TONE_ICON_BORDER[tone],
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={TONE_ICON_COLOR[tone]} />
          ) : (
            <Ionicons name={icon} size={18} color={TONE_ICON_COLOR[tone]} />
          )}
        </View>

        <View style={styles.body}>
          <ThemedText style={[styles.label, { color: TONE_LABEL[tone] }]} numberOfLines={1}>
            {label}
          </ThemedText>
          {description ? (
            <ThemedText style={styles.description} numberOfLines={1}>
              {description}
            </ThemedText>
          ) : null}
        </View>

        {meta ? (
          <ThemedText style={styles.meta} numberOfLines={1}>
            {meta}
          </ThemedText>
        ) : null}

        {interactive && !loading ? (
          <View style={styles.chevron}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={tone === "danger" ? SemanticColors.error : "rgba(255,255,255,0.4)"}
            />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 1.4,
  },
  chevron: {
    marginLeft: Spacing.one,
  },
});
