import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { BusinessMemoryFieldTone } from "@/utils/business-memory-display";
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
  helperText?: string;
  multiline?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  tone?: BusinessMemoryFieldTone;
}

export const MemoryFormField = forwardRef<TextInputType, MemoryFormFieldProps>(
  function MemoryFormField(
    {
      label,
      value,
      onChangeText,
      placeholder,
      helperText,
      multiline = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
      tone = "default",
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;
    const isActive = isFocused || hasValue;
    const isUnknown = tone === "unknown" && !hasValue && !isFocused;

    return (
      <View style={styles.wrapper}>
        <View style={styles.labelRow}>
          <View
            style={[
              styles.accentBar,
              isActive && styles.accentBarActive,
              isUnknown && styles.accentBarUnknown,
            ]}
          />
          <ThemedText style={[styles.label, isUnknown && styles.labelUnknown]}>{label}</ThemedText>
        </View>

        <View
          style={[
            styles.inputWrapper,
            multiline && styles.inputWrapperMultiline,
            isUnknown && styles.inputWrapperUnknown,
            isFocused && styles.inputWrapperFocused,
            hasValue && !isFocused && styles.inputWrapperFilled,
          ]}
        >
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={isUnknown ? "rgba(255,149,0,0.85)" : SemanticColors.textPlaceholder}
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

        {helperText && isUnknown ? <ThemedText style={styles.helperText}>{helperText}</ThemedText> : null}
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
  accentBarUnknown: {
    backgroundColor: SemanticColors.warning,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
  },
  labelUnknown: {
    color: "rgba(255,149,0,0.9)",
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
  inputWrapperUnknown: {
    borderColor: "rgba(255,149,0,0.4)",
    backgroundColor: "rgba(255,149,0,0.06)",
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
  helperText: {
    paddingHorizontal: Spacing.one,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(255,149,0,0.92)",
  },
});
