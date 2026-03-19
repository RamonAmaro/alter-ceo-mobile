import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  error?: boolean;
  errorMessage?: string;
}

export function Input({ style, error, errorMessage, ...rest }: InputProps) {
  return (
    <View>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="rgba(255,255,255,0.47)"
        {...rest}
      />
      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 276,
    height: 43,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.four,
    color: "#ffffff",
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
  },
  inputError: {
    borderColor: "#E8731A",
  },
  errorText: {
    fontFamily: Fonts.montserrat,
    fontSize: 11,
    color: "#E8731A",
    marginTop: Spacing.one,
    marginLeft: Spacing.four,
  },
});
