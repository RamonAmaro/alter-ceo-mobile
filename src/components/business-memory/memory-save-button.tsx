import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet } from "react-native";

interface MemorySaveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function MemorySaveButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: MemorySaveButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  function handlePressIn(): void {
    if (isDisabled) return;
    Animated.spring(scale, {
      toValue: 0.97,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  function handlePressOut(): void {
    if (isDisabled) return;
    Animated.spring(scale, {
      toValue: 1,
      speed: 50,
      bounciness: 4,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale }] }, isDisabled && styles.wrapperDisabled]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={styles.pressable}
      >
        <LinearGradient
          colors={["#00FF84", "#2AF0E1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#061611" />
        ) : (
          <Ionicons name="bookmark" size={16} color="#061611" />
        )}
        <ThemedText style={styles.label}>{label}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const wrapperShadow = Platform.select({
  ios: {
    shadowColor: SemanticColors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 8px 24px rgba(0,255,132,0.35)" },
});

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 999,
    ...wrapperShadow,
  },
  wrapperDisabled: {
    opacity: 0.5,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
    overflow: "hidden",
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 18,
    color: "#061611",
    letterSpacing: 0.5,
  },
});
