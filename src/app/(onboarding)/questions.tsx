import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { AudioRecorderView } from "@/components/onboarding/audio-recorder-view";
import { ScreenLayout } from "@/components/screen-layout";
import { getExpressQuestions, getProfessionalQuestions } from "@/constants/onboarding-questions";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Spacing } from "@/constants/theme";
import { prefetchUrlContext } from "@/services/onboarding-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { validateQuestionAnswer } from "@/utils/validate-question-answer";

import { PrefetchBanner } from "@/components/onboarding/prefetch-banner";
import { QuestionBody } from "@/components/onboarding/question-body";
import { QuestionHeader } from "@/components/onboarding/question-header";

const INSTAGRAM_INDEX_EXPRESS = 10;
const INSTAGRAM_INDEX_PROFESSIONAL = 17;
const WEBSITE_INDEX_EXPRESS = 9;
const WEBSITE_INDEX_PROFESSIONAL = 16;

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();
  const planType = useOnboardingStore((s) => s.planType);
  const currentQuestionIndex = useOnboardingStore((s) => s.currentQuestionIndex);
  const answers = useOnboardingStore((s) => s.answers);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const nextQuestion = useOnboardingStore((s) => s.nextQuestion);
  const previousQuestion = useOnboardingStore((s) => s.previousQuestion);
  const user = useAuthStore((s) => s.user);
  const [prefetchStatus, setPrefetchStatus] = useState<"ok" | "error" | null>(null);
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, []);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const questions = useMemo(
    () => (planType === "professional" ? getProfessionalQuestions() : getExpressQuestions()),
    [planType],
  );

  const question = questions[currentQuestionIndex];

  if (!question) return null;

  if (question.type === "audio") {
    return <AudioRecorderView onConfirm={handleConfirmAudio} onBack={handleBack} />;
  }

  const currentAnswer = answers.get(currentQuestionIndex);
  const nextEnabled = validateQuestionAnswer(question.type, currentAnswer);
  const planLabel = planType === "professional" ? "PROFESIONAL" : "EXPRESS";

  function handleOptionPress(label: string): void {
    if (question.type === "multi") {
      const current = (currentAnswer as string[]) || [];
      const updated = current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label];
      setAnswer(currentQuestionIndex, updated);
    } else {
      setAnswer(currentQuestionIndex, label);
    }
  }

  function handleTextChange(text: string): void {
    setAnswer(currentQuestionIndex, text);
  }

  function animateIn(): void {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function animateTransition(callback: () => void): void {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      callback();
      animateIn();
    });
  }

  function triggerUrlPrefetch(): void {
    if (!user?.userId) return;

    const instagramIndex =
      planType === "professional" ? INSTAGRAM_INDEX_PROFESSIONAL : INSTAGRAM_INDEX_EXPRESS;
    const websiteIndex =
      planType === "professional" ? WEBSITE_INDEX_PROFESSIONAL : WEBSITE_INDEX_EXPRESS;

    const instagram = answers.get(instagramIndex) as string | undefined;
    const website = answers.get(websiteIndex) as string | undefined;

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
      animateTransition(() => nextQuestion());
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

  function handleConfirmAudio(_uri: string, _transcript: string | null): void {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      nextQuestion();
    } else {
      navigateAfterQuestions();
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
    <ScreenLayout withKeyboard>
      <View
        style={[
          styles.inner,
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
          <QuestionHeader planLabel={planLabel} onBack={handleBack} />

          {prefetchStatus !== null && <PrefetchBanner status={prefetchStatus} />}

          <QuestionBody
            question={question}
            currentAnswer={currentAnswer}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onOptionPress={handleOptionPress}
            onTextChange={handleTextChange}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Siguiente"
            onPress={handleNext}
            disabled={!nextEnabled}
            style={!nextEnabled ? styles.buttonDisabled : undefined}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
