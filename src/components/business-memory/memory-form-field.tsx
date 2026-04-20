import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type ReturnKeyTypeOptions,
  type TextInput as TextInputType,
} from "react-native";

interface MemoryFormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export const MemoryFormField = forwardRef<TextInputType, MemoryFormFieldProps>(
  function MemoryFormField(
    {
      label,
      value,
      onChangeText,
      placeholder,
      multiline = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;
    const isActive = isFocused || hasValue;

    return (
      <View style={styles.wrapper}>
        <View style={styles.labelRow}>
          <View style={[styles.accentBar, isActive && styles.accentBarActive]} />
          <ThemedText style={styles.label}>{label}</ThemedText>
        </View>

        <View
          style={[
            styles.inputWrapper,
            multiline && styles.inputWrapperMultiline,
            isFocused && styles.inputWrapperFocused,
            hasValue && !isFocused && styles.inputWrapperFilled,
          ]}
        >
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={SemanticColors.textPlaceholder}
            style={[styles.input, multiline && styles.inputMultiline]}
            multiline={multiline}
            selectionColor={SemanticColors.success}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit ?? !multiline}
            autoCapitalize="sentences"
            autoCorrect
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  accentBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  accentBarActive: {
    backgroundColor: SemanticColors.success,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    minHeight: 48,
    justifyContent: "center",
  },
  inputWrapperMultiline: {
    borderRadius: 18,
    paddingVertical: Spacing.three,
    minHeight: 104,
  },
  inputWrapperFilled: {
    borderColor: "rgba(0,255,132,0.35)",
    backgroundColor: "rgba(0,255,132,0.04)",
  },
  inputWrapperFocused: {
    borderColor: SemanticColors.success,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  input: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    padding: 0,
    outlineStyle: "none" as never,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 72,
  },
});
