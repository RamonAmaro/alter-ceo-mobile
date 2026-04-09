import { Animated, StyleSheet, TextInput, View } from "react-native";

import { QuestionOption } from "@/components/question-option";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { getKeyboardType } from "@/utils/get-keyboard-type";

import type { Answer } from "@/stores/onboarding-store";

interface QuestionConfig {
  question: string;
  instruction?: string;
  progress: number;
  type: string;
  placeholder?: string;
  options?: readonly { label: string; subtitle?: string }[];
}

interface QuestionBodyProps {
  question: QuestionConfig;
  currentAnswer: Answer | undefined;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onOptionPress: (label: string) => void;
  onTextChange: (text: string) => void;
}

function isOptionSelected(type: string, currentAnswer: Answer | undefined, label: string): boolean {
  if (type === "multi") {
    return Array.isArray(currentAnswer) && currentAnswer.includes(label);
  }
  return currentAnswer === label;
}

export function QuestionBody({
  question,
  currentAnswer,
  fadeAnim,
  slideAnim,
  onOptionPress,
  onTextChange,
}: QuestionBodyProps) {
  const options = question.options ?? [];
  const isMulti = question.type === "multi";

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
        {question.type === "text" ? (
          <TextInput
            style={styles.textInput}
            placeholder={question.placeholder}
            placeholderTextColor={SemanticColors.textPlaceholder}
            value={(currentAnswer as string) || ""}
            onChangeText={onTextChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={getKeyboardType(question.placeholder)}
          />
        ) : (
          options.map((option) => (
            <QuestionOption
              key={option.label}
              label={option.label}
              subtitle={option.subtitle}
              selected={isOptionSelected(question.type, currentAnswer, option.label)}
              multi={isMulti}
              onPress={() => onOptionPress(option.label)}
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
  },
});
