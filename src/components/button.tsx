import { ThemedText } from "@/components/themed-text";
import { Fonts, Typography } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
}

export function Button({ label, loading, style, disabled, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      disabled={disabled ?? loading}
      {...rest}
    >
      <LinearGradient
        colors={["#00FF7A", "#2CE261", "#48CF50", "#53C94B"]}
        locations={[0.35, 0.62, 0.83, 0.95]}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <ThemedText type="labelMd" style={styles.label}>
            {label}
          </ThemedText>
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
  label: {
    ...Typography.caption,
    fontFamily: Fonts.montserratBold,
    color: "#000000",
  },
});
