import { AppBackground } from "@/components/app-background";
import { MemoryEmptyState } from "@/components/business-memory/memory-empty-state";
import { MemoryForm } from "@/components/business-memory/memory-form";
import { StepDots } from "@/components/business-memory/step-dots";
import { StepHeroRing } from "@/components/business-memory/step-hero-ring";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import {
  BUSINESS_MEMORY_STEPS,
  findStepById,
  getStepIndex,
} from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BusinessMemoryStepScreen() {
  const insets = useSafeAreaInsets();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();

  const step = findStepById(stepId ?? "");

  if (!step) {
    return <Redirect href={"/(app)/business-memory" as Href} />;
  }

  const stepIndex = getStepIndex(step.id);
  const totalSteps = BUSINESS_MEMORY_STEPS.length;
  const activeDot = stepIndex + 1;
  const hasFields = step.fields.length > 0;

  function handleSave(values: Record<string, string>): void {
    void values;
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          titlePrefix="Memoria"
          titleAccent="de negocio"
          icon="briefcase"
          showBack
        />

        <KeyboardAwareScroll
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}
        >
          <StepDots total={totalSteps} active={activeDot} hint="Bloque · Memoria" />

          <View style={styles.hero}>
            <StepHeroRing
              step={step}
              index={stepIndex}
              total={totalSteps}
              size={220}
              animate={false}
            />
            <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
            <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
          </View>

          <View style={styles.formWrapper}>
            {hasFields ? (
              <View style={styles.formSectionHeader}>
                <View style={styles.formAccent} />
                <ThemedText style={styles.formEyebrow}>COMPLETA EL BLOQUE</ThemedText>
              </View>
            ) : null}

            {hasFields ? (
              <MemoryForm fields={step.fields} onSave={handleSave} saveLabel="Guardar memoria" />
            ) : (
              <MemoryEmptyState />
            )}
          </View>
        </KeyboardAwareScroll>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.one,
  },
  stepTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  stepDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 340,
  },
  formWrapper: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  formSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  formAccent: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  formEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
});
