import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { QuestionOption } from "@/components/question-option";
import { Fonts, Spacing } from "@/constants/theme";
import {
  getExpressQuestions,
  getProfessionalQuestions,
} from "@/constants/onboarding-questions";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();
  const {
    planType,
    currentQuestionIndex,
    getAnswer,
    setAnswer,
    nextQuestion,
    previousQuestion,
  } = useOnboardingStore();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const questions = useMemo(() => {
    return planType === "professional"
      ? getProfessionalQuestions()
      : getExpressQuestions();
  }, [planType]);

  const question = questions[currentQuestionIndex];

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentQuestionIndex]);

  if (!question) return null;

  const currentAnswer = getAnswer(currentQuestionIndex);

  function handleSingleSelect(label: string): void {
    setAnswer(currentQuestionIndex, label);
  }

  function handleMultiSelect(label: string): void {
    const current = (currentAnswer as string[]) || [];
    const updated = current.includes(label)
      ? current.filter((item) => item !== label)
      : [...current, label];
    setAnswer(currentQuestionIndex, updated);
  }

  function handleTextChange(text: string): void {
    setAnswer(currentQuestionIndex, text);
  }

  function isNextEnabled(): boolean {
    if (question.type === "audio") return false;
    if (question.type === "text") {
      return typeof currentAnswer === "string" && currentAnswer.trim() !== "";
    }
    if (question.type === "multi") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return typeof currentAnswer === "string" && currentAnswer !== "";
  }

  function animateTransition(callback: () => void): void {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => callback());
  }

  function handleNext(): void {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];
      animateTransition(() => {
        nextQuestion();
        if (nextQ.type === "audio") {
          router.push("/(onboarding)/audio-question");
        }
      });
    } else {
      navigateAfterQuestions();
    }
  }

  function handleBack(): void {
    if (currentQuestionIndex > 0) {
      animateTransition(() => previousQuestion());
    } else {
      router.back();
    }
  }

  function navigateAfterQuestions(): void {
    if (planType === "express") {
      router.push("/(onboarding)/express-complete");
    } else {
      router.push("/(onboarding)/report-loading");
    }
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + Spacing.three,
              paddingBottom: insets.bottom + Spacing.three,
            },
          ]}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.planLabel}>
                {planType === "professional" ? "PROFESIONAL" : "EXPRESS"}
              </Text>
            </View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text style={styles.question}>{question.question}</Text>

              {question.instruction ? (
                <Text style={styles.instruction}>{question.instruction}</Text>
              ) : null}

              <Text style={styles.progress}>({question.progress}%)</Text>

              <View style={styles.optionsContainer}>
                {question.type === "text" ? (
                  <TextInput
                    style={styles.textInput}
                    placeholder={question.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={(currentAnswer as string) || ""}
                    onChangeText={handleTextChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={
                      question.placeholder?.startsWith("http")
                        ? "url"
                        : "default"
                    }
                  />
                ) : (
                  (question.options || []).map((option) => {
                    const selected =
                      question.type === "multi"
                        ? Array.isArray(currentAnswer) &&
                          currentAnswer.includes(option.label)
                        : currentAnswer === option.label;

                    return (
                      <QuestionOption
                        key={option.label}
                        label={option.label}
                        subtitle={option.subtitle}
                        selected={selected}
                        multi={question.type === "multi"}
                        onPress={() =>
                          question.type === "multi"
                            ? handleMultiSelect(option.label)
                            : handleSingleSelect(option.label)
                        }
                      />
                    );
                  })
                )}
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Siguiente"
              onPress={handleNext}
              disabled={!isNextEnabled()}
              style={!isNextEnabled() ? styles.buttonDisabled : undefined}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  backArrow: {
    fontSize: 22,
    color: "#ffffff",
  },
  planLabel: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 20,
  },
  question: {
    fontFamily: Fonts.montserrat,
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 29,
  },
  instruction: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.two,
  },
  progress: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "700",
    color: "#00FF84",
    lineHeight: 26,
    marginTop: Spacing.two,
  },
  optionsContainer: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  textInput: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
