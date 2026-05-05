import { Animated, Pressable, StyleSheet, TextInput, View } from "react-native";

import { QuestionOption } from "@/components/question-option";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { getKeyboardType } from "@/utils/get-keyboard-type";

import type { QuestionValidationKind } from "@/constants/onboarding-questions";
import type { Answer } from "@/stores/onboarding-store";

interface QuestionConfig {
  question: string;
  instruction?: string;
  progress: number;
  type: string;
  placeholder?: string;
  validationKind?: QuestionValidationKind;
  options?: readonly { label: string; subtitle?: string; value?: string }[];
  unavailableOptionLabel?: string;
  unavailableOptionValue?: string;
  scaleMin?: number;
  scaleMax?: number;
}

function buildScaleValues(min: number, max: number): readonly number[] {
  if (max < min) return [];
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

interface QuestionBodyProps {
  question: QuestionConfig;
  currentAnswer: Answer | undefined;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onOptionPress: (label: string) => void;
  onTextChange: (text: string) => void;
  validationMessage?: string;
}

function isOptionSelected(type: string, currentAnswer: Answer | undefined, value: string): boolean {
  if (type === "multi") {
    return Array.isArray(currentAnswer) && currentAnswer.includes(value);
  }
  return currentAnswer === value;
}

export function QuestionBody({
  question,
  currentAnswer,
  fadeAnim,
  slideAnim,
  onOptionPress,
  onTextChange,
  validationMessage,
}: QuestionBodyProps) {
  const options = question.options ?? [];
  const isMulti = question.type === "multi";
  const isTextInput = question.type === "text" || question.type === "integer";
  const isScale = question.type === "scale";
  const scaleMin = question.scaleMin ?? 1;
  const scaleMax = question.scaleMax ?? 10;
  const scaleValues = isScale ? buildScaleValues(scaleMin, scaleMax) : [];
  const unavailableOptionValue = question.unavailableOptionValue;
  const unavailableSelected =
    unavailableOptionValue !== undefined && currentAnswer === unavailableOptionValue;
  const textValue =
    typeof currentAnswer === "string" && currentAnswer !== unavailableOptionValue
      ? currentAnswer
      : "";

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <ThemedText type="headingLg" style={styles.questionText}>
        {question.question}
      </ThemedText>

      {question.instruction ? (
        <ThemedText type="bodyMd" style={styles.instructionText}>
          {question.instruction}
        </ThemedText>
      ) : null}

      <ThemedText type="labelMd" style={styles.progressText}>
        ({question.progress}%)
      </ThemedText>

      <View style={styles.optionsContainer}>
        {isScale ? (
          <View>
            <View style={styles.scaleRow}>
              {scaleValues.map((value) => {
                const valueStr = String(value);
                const selected = currentAnswer === valueStr;
                return (
                  <Pressable
                    key={valueStr}
                    onPress={() => onOptionPress(valueStr)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.scaleChip,
                      selected && styles.scaleChipSelected,
                      pressed && !selected && styles.scaleChipPressed,
                    ]}
                  >
                    <ThemedText
                      style={[styles.scaleChipLabel, selected && styles.scaleChipLabelSelected]}
                    >
                      {valueStr}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.scaleLegendRow}>
              <View style={styles.scaleLegendItem}>
                <ThemedText style={styles.scaleLegendNumber}>{scaleMin}</ThemedText>
                <ThemedText style={styles.scaleLegendLabel}>Totalmente en desacuerdo</ThemedText>
              </View>
              <View style={[styles.scaleLegendItem, styles.scaleLegendItemEnd]}>
                <ThemedText style={styles.scaleLegendNumber}>{scaleMax}</ThemedText>
                <ThemedText style={[styles.scaleLegendLabel, styles.scaleLegendLabelEnd]}>
                  Totalmente de acuerdo
                </ThemedText>
              </View>
            </View>
          </View>
        ) : isTextInput ? (
          <>
            <TextInput
              style={[styles.textInput, unavailableSelected && styles.textInputDisabled]}
              placeholder={question.placeholder}
              placeholderTextColor={SemanticColors.textPlaceholder}
              value={textValue}
              onChangeText={onTextChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={
                question.type === "integer" ? "numeric" : getKeyboardType(question.placeholder)
              }
              editable={!unavailableSelected}
            />
            {(question.type === "text" || question.type === "integer") &&
            question.unavailableOptionLabel &&
            unavailableOptionValue ? (
              <QuestionOption
                label={question.unavailableOptionLabel}
                selected={currentAnswer === unavailableOptionValue}
                multi
                onPress={() => onOptionPress(unavailableOptionValue)}
              />
            ) : null}
            {validationMessage ? (
              <ThemedText type="bodySm" style={styles.validationMessage}>
                {validationMessage}
              </ThemedText>
            ) : null}
          </>
        ) : (
          options.map((option) => (
            <QuestionOption
              key={option.value ?? option.label}
              label={option.label}
              subtitle={option.subtitle}
              selected={isOptionSelected(
                question.type,
                currentAnswer,
                option.value ?? option.label,
              )}
              multi={isMulti}
              onPress={() => onOptionPress(option.value ?? option.label)}
            />
          ))
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  questionText: {
    color: SemanticColors.textPrimary,
  },
  instructionText: {
    color: SemanticColors.textSecondaryLight,
    marginTop: Spacing.two,
  },
  progressText: {
    color: SemanticColors.success,
    marginTop: Spacing.two,
  },
  optionsContainer: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  textInput: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    color: SemanticColors.textPrimary,
    backgroundColor: SemanticColors.glassBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    outlineStyle: "none" as never,
  },
  textInputDisabled: {
    opacity: 0.55,
  },
  validationMessage: {
    color: SemanticColors.error,
    marginTop: 2,
  },
  scaleRow: {
    flexDirection: "row",
    gap: 6,
  },
  scaleChip: {
    flex: 1,
    height: 48,
    paddingHorizontal: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    backgroundColor: SemanticColors.glassBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleChipPressed: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.32)",
  },
  scaleChipSelected: {
    backgroundColor: SemanticColors.accent,
    borderColor: SemanticColors.accent,
  },
  scaleChipLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
  },
  scaleChipLabelSelected: {
    color: SemanticColors.textPrimary,
  },
  scaleLegendRow: {
    flexDirection: "row",
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  scaleLegendItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  scaleLegendItemEnd: {
    justifyContent: "flex-end",
  },
  scaleLegendNumber: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  scaleLegendLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  scaleLegendLabelEnd: {
    textAlign: "right",
  },
});
