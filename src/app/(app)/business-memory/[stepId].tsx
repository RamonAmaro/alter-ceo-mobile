import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { CompassBadge } from "@/components/business-memory/compass-badge";
import { MemoryEmptyState } from "@/components/business-memory/memory-empty-state";
import { MemoryForm } from "@/components/business-memory/memory-form";
import { StepDots } from "@/components/business-memory/step-dots";
import { StepHeroRing } from "@/components/business-memory/step-hero-ring";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { findStepById, getStepIndex } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function stringifyFieldValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const allSimple = value.every(
      (item) =>
        item == null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );
    return allSimple
      ? value.map((item) => (item == null ? "" : String(item))).join("\n")
      : JSON.stringify(value, null, 2);
  }
  return JSON.stringify(value, null, 2);
}

export default function BusinessMemoryStepScreen() {
  const insets = useSafeAreaInsets();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { error, isLoading, refresh, steps, version } = useBusinessMemoryDashboard();

  const step = findStepById(steps, stepId ?? "");

  if (!isLoading && !error && !step) {
    return <Redirect href={"/(app)/business-memory" as Href} />;
  }

  if (isLoading) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            titlePrefix="Memoria"
            titleAccent="de negocio"
            renderIcon={() => <CompassBadge size={28} />}
            showBack
          />

          <View style={styles.feedbackWrap}>
            <ThemedText style={styles.feedbackTitle}>Cargando bloque</ThemedText>
            <ThemedText style={styles.feedbackDescription}>
              Estamos trayendo el detalle de este bloque desde el backend.
            </ThemedText>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (error || !step) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            titlePrefix="Memoria"
            titleAccent="de negocio"
            renderIcon={() => <CompassBadge size={28} />}
            showBack
          />

          <View style={styles.feedbackWrap}>
            <ThemedText style={styles.feedbackTitle}>No pudimos cargar este bloque</ThemedText>
            <ThemedText style={styles.feedbackDescription}>
              {error ?? "Intentalo de nuevo en unos segundos."}
            </ThemedText>
            <Button label="Reintentar" onPress={refresh} style={styles.retryButton} />
          </View>
        </View>
      </AppBackground>
    );
  }

  const stepIndex = getStepIndex(steps, step.id);
  const totalSteps = steps.length;
  const activeDot = stepIndex + 1;
  const hasFields = step.fields.length > 0;
  const initialValues = Object.fromEntries(
    step.fields.map((field) => [field.id, stringifyFieldValue(step.data[field.id])]),
  );

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
          renderIcon={() => <CompassBadge size={28} />}
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
              <MemoryForm
                key={`${step.id}:${version ?? "draft"}`}
                fields={step.fields}
                initialValues={initialValues}
                onSave={handleSave}
                saveLabel="Guardar memoria"
              />
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
  feedbackWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  feedbackTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  feedbackDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 320,
  },
  retryButton: {
    marginTop: Spacing.two,
  },
});
