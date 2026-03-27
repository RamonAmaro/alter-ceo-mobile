import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  style?: ViewStyle;
  error?: boolean;
  errorMessage?: string;
}

export function Input({ style, error, errorMessage, ...rest }: InputProps) {
  return (
    <View style={style}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="rgba(255,255,255,0.47)"
          {...rest}
        />
        {error && (
          <Ionicons name="alert-circle" size={18} color="#E8731A" style={styles.errorIcon} />
        )}
      </View>
      {error && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    width: 276,
    height: 43,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.four,
    paddingRight: 40,
    color: "#ffffff",
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
  },
  inputError: {
    borderColor: "#E8731A",
    backgroundColor: "rgba(232, 115, 26, 0.08)",
  },
  errorIcon: {
    position: "absolute",
    right: 14,
  },
  errorText: {
    fontFamily: Fonts.montserrat,
    fontSize: 11,
    color: "#E8731A",
    marginTop: 4,
    marginLeft: Spacing.three,
  },
});
