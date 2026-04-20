import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { MonumentalIndex } from "./monumental-index";

type CardTone = "emerald" | "neutral" | "danger";

interface PatternCardProps {
  meta?: string;
  title: string;
  description?: string;
  monumentalLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  tone?: CardTone;
  onPress?: () => void;
  animationDelay?: number;
  showChevron?: boolean;
  accessibilityLabel?: string;
  compact?: boolean;
}

const TONE_GRADIENT: Record<CardTone, readonly [string, string]> = {
  emerald: ["rgba(0,255,132,0.08)", "rgba(255,255,255,0.02)"],
  neutral: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"],
  danger: ["rgba(255,68,68,0.12)", "rgba(255,68,68,0.02)"],
};

const TONE_BORDER: Record<CardTone, string> = {
  emerald: "rgba(255,255,255,0.08)",
  neutral: "rgba(255,255,255,0.06)",
  danger: "rgba(255,68,68,0.18)",
};

const TONE_ACCENT: Record<CardTone, string> = {
  emerald: SemanticColors.success,
  neutral: SemanticColors.textMuted,
  danger: SemanticColors.error,
};

const TONE_CHEVRON_BG: Record<CardTone, string> = {
  emerald: "rgba(0,255,132,0.12)",
  neutral: "rgba(255,255,255,0.06)",
  danger: "rgba(255,68,68,0.15)",
};

const TONE_CHEVRON_BORDER: Record<CardTone, string> = {
  emerald: "rgba(0,255,132,0.25)",
  neutral: "rgba(255,255,255,0.12)",
  danger: "rgba(255,68,68,0.3)",
};

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

export function PatternCard({
  meta,
  title,
  description,
  monumentalLabel,
  leading,
  trailing,
  tone = "emerald",
  onPress,
  animationDelay = 0,
  showChevron = true,
  accessibilityLabel,
  compact = false,
}: PatternCardProps) {
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
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 0.97,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  function handlePressOut(): void {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 1,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  const accent = TONE_ACCENT[tone];

  const content = (
    <View
      style={[
        styles.card,
        compact ? styles.cardCompact : null,
        { borderColor: TONE_BORDER[tone] },
        cardShadow,
      ]}
    >
      <LinearGradient
        colors={TONE_GRADIENT[tone]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {monumentalLabel ? <MonumentalIndex label={monumentalLabel} /> : null}

      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.body}>
        {meta ? (
          <View style={styles.labelRow}>
            <View style={[styles.accentBar, { backgroundColor: accent }]} />
            <ThemedText style={styles.labelMeta}>{meta}</ThemedText>
          </View>
        ) : null}
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description ? (
          <ThemedText style={styles.description} numberOfLines={3}>
            {description}
          </ThemedText>
        ) : null}
      </View>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}

      {showChevron && !trailing ? (
        <View
          style={[
            styles.chevronWrap,
            {
              backgroundColor: TONE_CHEVRON_BG[tone],
              borderColor: TONE_CHEVRON_BORDER[tone],
            },
          ]}
        >
          <Ionicons name="arrow-forward" size={16} color={accent} />
        </View>
      ) : null}
    </View>
  );

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
}

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
    overflow: "hidden",
  },
  cardCompact: {
    padding: Spacing.three,
    paddingRight: Spacing.three,
  },
  leading: {
    alignItems: "center",
    justifyContent: "center",
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
  trailing: {
    alignItems: "center",
    justifyContent: "center",
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
