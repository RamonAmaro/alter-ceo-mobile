import { ThemedText } from "@/components/themed-text";
import type { FormFieldOption } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { BusinessMemoryFieldTone } from "@/utils/business-memory-display";
import { forwardRef, useState } from "react";
import {
  Pressable,
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
  options?: readonly FormFieldOption[];
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  tone?: BusinessMemoryFieldTone;
  type?: "text" | "textarea" | "select";
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
      options,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
      tone = "default",
      type = "text",
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const hasValue = value.length > 0;
    const isSelect = type === "select";
    const isActive = isFocused || hasValue || isExpanded;
    const isUnknown = tone === "unknown" && !hasValue && !isFocused;
    const selectedOption = options?.find((option) => option.value === value);

    function handleSelect(valueToSet: string): void {
      onChangeText(valueToSet);
      setIsExpanded(false);
    }

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
            isSelect && styles.selectWrapper,
            isUnknown && styles.inputWrapperUnknown,
            isFocused && styles.inputWrapperFocused,
            hasValue && !isFocused && styles.inputWrapperFilled,
          ]}
        >
          {isSelect ? (
            <View style={styles.selectContainer}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsExpanded((current) => !current)}
                style={styles.selectTrigger}
              >
                <ThemedText
                  style={[
                    styles.selectValue,
                    !selectedOption && styles.selectPlaceholder,
                    isUnknown && !selectedOption && styles.selectPlaceholderUnknown,
                  ]}
                >
                  {selectedOption?.label ?? placeholder ?? "Selecciona una opción"}
                </ThemedText>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={isUnknown ? SemanticColors.warning : SemanticColors.textSecondaryLight}
                />
              </Pressable>

              {isExpanded && options?.length ? (
                <View style={styles.dropdown}>
                  {options.map((option) => {
                    const selected = option.value === value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        onPress={() => handleSelect(option.value)}
                        style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                      >
                        <ThemedText
                          style={[styles.dropdownLabel, selected && styles.dropdownLabelSelected]}
                        >
                          {option.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : (
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={
                isUnknown ? "rgba(255,149,0,0.85)" : SemanticColors.textPlaceholder
              }
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
          )}
        </View>

        {helperText && isUnknown ? (
          <ThemedText style={styles.helperText}>{helperText}</ThemedText>
        ) : null}
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
  selectWrapper: {
    paddingVertical: 10,
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
  selectContainer: {
    gap: Spacing.two,
  },
  selectTrigger: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  selectValue: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  selectPlaceholder: {
    color: SemanticColors.textPlaceholder,
  },
  selectPlaceholderUnknown: {
    color: "rgba(255,149,0,0.85)",
  },
  dropdown: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  dropdownItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    borderColor: "rgba(0,255,132,0.35)",
    backgroundColor: "rgba(0,255,132,0.09)",
  },
  dropdownLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 17,
    color: SemanticColors.textSecondaryLight,
  },
  dropdownLabelSelected: {
    color: SemanticColors.textPrimary,
  },
  helperText: {
    paddingHorizontal: Spacing.one,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(255,149,0,0.92)",
  },
});
