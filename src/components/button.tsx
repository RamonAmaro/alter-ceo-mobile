import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing, Typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type TouchableOpacityProps,
} from "react-native";

type IoniconName = keyof typeof Ionicons.glyphMap;
type IconPosition = "leading" | "trailing";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  icon?: IoniconName;
  iconPosition?: IconPosition;
}

export function Button({
  label,
  loading,
  icon,
  iconPosition = "leading",
  style,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const [isPressPending, setIsPressPending] = useState(false);
  const isMountedRef = useRef(true);
  const pressLockedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isBusy = Boolean(loading) || isPressPending;
  const isDisabled = Boolean(disabled) || isBusy;

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isDisabled || pressLockedRef.current || !onPress) return;

      const result = onPress(event) as unknown;
      if (!result || typeof (result as Promise<unknown>).then !== "function") return;

      pressLockedRef.current = true;
      setIsPressPending(true);

      Promise.resolve(result).finally(() => {
        pressLockedRef.current = false;
        if (isMountedRef.current) {
          setIsPressPending(false);
        }
      });
    },
    [isDisabled, onPress],
  );

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled, busy: isBusy }}
      {...rest}
      onPress={handlePress}
    >
      <LinearGradient
        colors={["#00FF7A", "#2CE261", "#48CF50", "#53C94B"]}
        locations={[0.35, 0.62, 0.83, 0.95]}
        style={styles.gradient}
      >
        {isBusy ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === "leading" ? (
              <Ionicons name={icon} size={14} color="#000000" />
            ) : null}
            <ThemedText type="labelMd" style={styles.label}>
              {label}
            </ThemedText>
            {icon && iconPosition === "trailing" ? (
              <Ionicons name={icon} size={14} color="#000000" />
            ) : null}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 278,
    alignSelf: "center",
    borderRadius: 98,
    overflow: "hidden",
  },
  gradient: {
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 98,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  label: {
    ...Typography.caption,
    fontFamily: Fonts.montserratBold,
    color: "#000000",
  },
});
