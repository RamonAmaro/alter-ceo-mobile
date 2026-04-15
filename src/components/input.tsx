import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  style?: ViewStyle;
  error?: boolean;
  errorMessage?: string;
}

export function Input({ style, error, errorMessage, ...rest }: InputProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="rgba(255,255,255,0.47)"
          {...rest}
        />
        {error && (
          <Ionicons
            name="alert-circle"
            size={18}
            color={SemanticColors.accent}
            style={styles.errorIcon}
          />
        )}
      </View>
      {error && errorMessage && (
        <ThemedText type="bodySm" style={styles.errorText}>
          {errorMessage}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: 43,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: SemanticColors.textPrimary,
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.four,
    paddingRight: 40,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    outlineStyle: "none" as never,
  },
  inputError: {
    borderColor: SemanticColors.accent,
    backgroundColor: "rgba(232, 115, 26, 0.08)",
  },
  errorIcon: {
    position: "absolute",
    right: 14,
  },
  errorText: {
    fontFamily: Fonts.montserrat,
    fontSize: 11,
    color: SemanticColors.accent,
    marginTop: 4,
    marginLeft: Spacing.three,
  },
});
