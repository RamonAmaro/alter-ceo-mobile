import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface BackButtonProps extends TouchableOpacityProps {
  label?: string;
}

export function BackButton({
  label = "Volver",
  style,
  ...rest
}: BackButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => router.back()}
      {...rest}
    >
      <Text style={styles.arrow}>←</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  arrow: {
    fontSize: 20,
    color: "#ffffff",
    marginRight: Spacing.two,
  },
  label: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});
