import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
}

export function Button({ label, style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      {...rest}
    >
      <LinearGradient
        colors={["#00FF7A", "#2CE261", "#48CF50", "#53C94B"]}
        locations={[0.35, 0.62, 0.83, 0.95]}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 278,
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
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
});
