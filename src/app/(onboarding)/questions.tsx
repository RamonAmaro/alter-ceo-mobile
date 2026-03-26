import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { QuestionOption } from "@/components/question-option";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import {
  getExpressQuestions,
  getProfessionalQuestions,
} from "@/constants/onboarding-questions";
import { prefetchUrlContext } from "@/services/onboarding-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getKeyboardType } from "@/utils/get-keyboard-type";
import { validateQuestionAnswer } from "@/utils/validate-question-answer";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INSTAGRAM_INDEX_EXPRESS = 10;
const INSTAGRAM_INDEX_PROFESSIONAL = 17;
const WEBSITE_INDEX_EXPRESS = 9;
const WEBSITE_INDEX_PROFESSIONAL = 16;

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
  const user = useAuthStore((s) => s.user);
  const [prefetchStatus, setPrefetchStatus] = useState<"ok" | "error" | null>(null);
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return validateQuestionAnswer(question.type, currentAnswer);
  }

  function animateTransition(callback: () => void): void {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => callback());
  }

  function triggerUrlPrefetch(): void {
    if (!user?.userId) return;

    const instagramIndex =
      planType === "professional"
        ? INSTAGRAM_INDEX_PROFESSIONAL
        : INSTAGRAM_INDEX_EXPRESS;
    const websiteIndex =
      planType === "professional"
        ? WEBSITE_INDEX_PROFESSIONAL
        : WEBSITE_INDEX_EXPRESS;

    const instagram = getAnswer(instagramIndex) as string | undefined;
    const website = getAnswer(websiteIndex) as string | undefined;

    if (!instagram || !website) return;

    prefetchUrlContext({
      user_id: user.userId,
      business_website_url: website,
      business_instagram: instagram,
    })
      .then(() => {
        setPrefetchStatus("ok");
        prefetchTimerRef.current = setTimeout(() => setPrefetchStatus(null), 3000);
      })
      .catch(() => {
        setPrefetchStatus("error");
        prefetchTimerRef.current = setTimeout(() => setPrefetchStatus(null), 3000);
      });
  }

  function handleNext(): void {
    const nextIndex = currentQuestionIndex + 1;

    const isInstagramQuestion =
      planType === "professional"
        ? currentQuestionIndex === INSTAGRAM_INDEX_PROFESSIONAL
        : currentQuestionIndex === INSTAGRAM_INDEX_EXPRESS;

    if (isInstagramQuestion) {
      triggerUrlPrefetch();
    }

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
                <Ionicons name="arrow-back" size={22} color="#ffffff" />
              </TouchableOpacity>
              <ThemedText type="labelMd" style={{ color: "#ffffff" }}>
                {planType === "professional" ? "PROFESIONAL" : "EXPRESS"}
              </ThemedText>
            </View>

            {prefetchStatus !== null && (
              <View
                style={[
                  styles.prefetchBanner,
                  prefetchStatus === "error" ? styles.prefetchBannerError : styles.prefetchBannerOk,
                ]}
              >
                <ThemedText type="labelSm" style={{ color: "#ffffff" }}>
                  {prefetchStatus === "ok"
                    ? "Contexto web cargado correctamente"
                    : "No se pudo cargar el contexto web (401)"}
                </ThemedText>
              </View>
            )}

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <ThemedText type="headingLg" style={{ color: "#ffffff" }}>{question.question}</ThemedText>

              {question.instruction ? (
                <ThemedText type="bodyMd" style={{ color: "rgba(255,255,255,0.7)", marginTop: Spacing.two }}>{question.instruction}</ThemedText>
              ) : null}

              <ThemedText type="labelMd" style={{ color: "#00FF84", marginTop: Spacing.two }}>({question.progress}%)</ThemedText>

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
                    keyboardType={getKeyboardType(question.placeholder)}
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
  prefetchBanner: {
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  prefetchBannerOk: {
    backgroundColor: "rgba(0,255,132,0.15)",
  },
  prefetchBannerError: {
    backgroundColor: "rgba(255,80,80,0.2)",
  },
});
