import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import type { StrategyIconLibrary } from "@/components/strategies/strategy-catalog";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";

interface StrategyTopicCardProps {
  label: string;
  iconName: string;
  iconLibrary?: StrategyIconLibrary;
  comingSoon?: boolean;
  onPress: () => void;
  animationDelay?: number;
}

export function StrategyTopicCard({
  label,
  iconName,
  iconLibrary = "ionicons",
  comingSoon = false,
  onPress,
  animationDelay = 0,
}: StrategyTopicCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 460,
        delay: animationDelay,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 460,
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

  return (
    <Animated.View style={[styles.outer, { opacity, transform: [{ translateY }, { scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={label.replace("\n", " ")}
        style={styles.pressable}
      >
        <View style={[styles.card, comingSoon && styles.cardDisabled]}>
          <LinearGradient
            colors={
              comingSoon
                ? ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.005)"]
                : ["rgba(0,255,132,0.12)", "rgba(255,255,255,0.02)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {comingSoon ? (
            <View style={styles.topRow}>
              <View style={[styles.metaPill, styles.metaPillDisabled]}>
                <View style={[styles.metaDot, styles.metaDotDisabled]} />
                <ThemedText style={[styles.metaText, styles.metaTextDisabled]}>
                  PRÓXIMAMENTE
                </ThemedText>
              </View>
            </View>
          ) : null}

          <View style={styles.iconWrap}>
            {iconLibrary === "feather" ? (
              <Feather
                name={iconName as never}
                size={88}
                color={comingSoon ? SemanticColors.textMuted : SemanticColors.success}
              />
            ) : (
              <Ionicons
                name={iconName as never}
                size={88}
                color={comingSoon ? SemanticColors.textMuted : SemanticColors.success}
              />
            )}
          </View>

          <View style={styles.bottom}>
            <View style={styles.labelRow}>
              <View style={[styles.accentBar, comingSoon && styles.accentBarDisabled]} />
              <ThemedText style={[styles.label, comingSoon && styles.labelDisabled]}>
                {label.replace("\n", " ")}
              </ThemedText>
            </View>

            <View style={styles.actionRow}>
              <ThemedText style={[styles.actionLabel, comingSoon && styles.actionLabelDisabled]}>
                {comingSoon ? "Próximamente" : "Comenzar"}
              </ThemedText>
              {!comingSoon ? (
                <View style={styles.arrowWrap}>
                  <Ionicons name="arrow-forward" size={14} color={SemanticColors.success} />
                </View>
              ) : null}
            </View>
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
  outer: {
    flex: 1,
  },
  pressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    position: "relative",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    overflow: "hidden",
    justifyContent: "space-between",
    ...cardShadow,
  },
  cardDisabled: {
    borderColor: "rgba(255,255,255,0.08)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  metaPillDisabled: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  metaDotDisabled: {
    backgroundColor: SemanticColors.textMuted,
  },
  metaText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 2,
  },
  metaTextDisabled: {
    color: SemanticColors.textMuted,
  },
  iconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
  },
  bottom: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accentBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  accentBarDisabled: {
    backgroundColor: SemanticColors.textMuted,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 14,
    lineHeight: 17,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  labelDisabled: {
    color: SemanticColors.textMuted,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,255,132,0.12)",
  },
  actionLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.tealLight,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  actionLabelDisabled: {
    color: SemanticColors.textMuted,
  },
  arrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
  },
});
